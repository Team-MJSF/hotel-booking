import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService as NestConfigService } from '@nestjs/config';
import * as path from 'path';
import { getTypeOrmConfig } from '../../config/typeorm.migrations.config';

// Maximum duration for the test
const MAX_TEST_DURATION = 30000; // 30 seconds
let safetyTimeout: NodeJS.Timeout;

// Define initTestApp function directly
async function initTestApp(): Promise<INestApplication> {
  // Ensure TypeORM can find the entities
  process.env.TYPEORM_ENTITIES = 'src/**/*.entity.ts';
  
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: path.resolve(process.cwd(), '.env.test'),
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
          const config = await getTypeOrmConfig(configService);
          return {
            ...config,
            logging: false,
            synchronize: true, // Enable synchronize for tests
            autoLoadEntities: true, // Make sure entities are auto-loaded
            entities: ['src/**/*.entity.ts'], // Explicitly define entities pattern
          };
        },
        inject: [ConfigService],
      }),
      AppModule,
    ],
  })
    .overrideGuard('JwtAuthGuard')
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const dataSource = moduleFixture.get(DataSource);
  await dataSource.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
  await dataSource.query('SET SESSION time_zone = "+00:00"');
  await dataSource.query('SET NAMES utf8mb4');

  return app;
}

async function checkDatabaseTables(app: INestApplication) {
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query('SHOW TABLES');
  await queryRunner.release();
}

describe('Booking Flow Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: NestConfigService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const testUser = {
    email: 'booking-flow-test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
  };

  const testRoom = {
    roomNumber: `101-${Date.now()}`,
    type: 'DOUBLE',
    pricePerNight: 100,
    maxGuests: 2,
    availabilityStatus: 'AVAILABLE',
    description: 'Test room',
    amenities: ['WiFi', 'TV'],
  };

  beforeAll(async () => {
    const setup = await initTestApp();
    app = setup;
    dataSource = app.get(DataSource);
    
    // Check database tables
    await checkDatabaseTables(app);
    
    userRepository = app.get(getRepositoryToken(User));
    jwtService = app.get(JwtService);
    configService = app.get(NestConfigService);
    
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    safetyTimeout = setTimeout(() => {
      process.exit(1); // Force exit if tests hang
    }, MAX_TEST_DURATION);
  }, 30000);

  afterAll(async () => {
    // Clear the safety timeout
    clearTimeout(safetyTimeout);
    
    // Close database connections and query runners
    if (queryRunner && queryRunner.isReleased === false) {
      await queryRunner.release();
    }
    
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    
    // Close the application
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Clean up tables before each test in the correct order
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM payments');
    await dataSource.query('DELETE FROM bookings');
    await dataSource.query('DELETE FROM refresh_tokens');
    await dataSource.query('DELETE FROM users');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  });

  describe('Complete Booking Flow', () => {
    let userToken: string;
    let adminToken: string;
    let userId: number;
    let roomId: number;
    let bookingId: number;

    it('should complete the full booking flow', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      userId = registerResponse.body.id;

      // Step 2: Login to get JWT token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      userToken = loginResponse.body.access_token;

      // Step 3: Create a room (as admin)
      await userRepository.update({ id: userId }, { role: UserRole.ADMIN });
      
      // Get the updated user with tokenVersion
      const updatedUser = await userRepository.findOne({ where: { id: userId } });
      
      adminToken = jwtService.sign(
        { 
          sub: userId, 
          email: updatedUser.email,
          role: updatedUser.role,
          tokenVersion: updatedUser.tokenVersion
        },
        { secret: configService.get('JWT_SECRET') }
      );

      // Step 4: Create a room
      const createRoomResponse = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testRoom)
        .expect(201);

      roomId = createRoomResponse.body.id;

      // Step 5: Create a booking
      const createBookingResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId,
          roomId,
          checkInDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          checkOutDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          numberOfGuests: 2,
        })
        .expect(201);

      bookingId = createBookingResponse.body.bookingId;

      // Step 6: Verify the booking was created
      const verifyBookingResponse = await request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(verifyBookingResponse.body).toBeDefined();
      expect(verifyBookingResponse.body.bookingId).toBe(bookingId);
      expect(verifyBookingResponse.body.room.id).toBe(roomId);
      expect(verifyBookingResponse.body.user.id).toBe(userId);
      expect(verifyBookingResponse.body.status).toBe('pending');
      expect(verifyBookingResponse.body.numberOfGuests).toBe(2);
    });
  });
}); 