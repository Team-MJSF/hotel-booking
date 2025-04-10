import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
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
  }).compile();

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

describe('Room Flow Integration Tests', () => {
  let app: INestApplication;
  let description: Repository<User>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const testUser = {
    email: 'room-flow-test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.ADMIN,
    phoneNumber: '1234567890',
    address: '123 Test St',
  };

  const testRoom = {
    roomNumber: `101-${Date.now()}`,
    type: 'double',
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

    description = app.get(getRepositoryToken(User));

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
    await dataSource.query('DELETE FROM rooms');
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

  describe('Complete Room Flow', () => {
    let adminToken: string;
    let roomId: number;

    it('should complete the full room flow', async () => {
      // Step 1: Create an admin user directly in the database
      await dataSource.query(`
        INSERT INTO users (first_name, last_name, email, password, role, phone_number, address, created_at, updated_at, token_version, is_active)
        VALUES ('${testUser.firstName}', '${testUser.lastName}', '${testUser.email}', 
                '$2b$10$2xGcGik0JTzYDbU3E628Seqgqd2EYMnhXMmFPi.ovz3DQKWQu5acq', 
                '${UserRole.ADMIN}', '${testUser.phoneNumber}', '${testUser.address}', NOW(), NOW(), 0, true)
      `);

      // Step 2: Login to get JWT token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'password123', // The hash corresponds to 'password123'
        })
        .expect(201);

      adminToken = loginResponse.body.access_token;

      // Step 3: Create a new room
      const createRoomResponse = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testRoom)
        .expect(201);

      roomId = createRoomResponse.body.id;

      // Step 4: Verify room was created
      const verifyRoomResponse = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(verifyRoomResponse.body).toBeDefined();
      expect(verifyRoomResponse.body.id).toBe(roomId);
      expect(verifyRoomResponse.body.roomNumber).toBe(testRoom.roomNumber);
      expect(verifyRoomResponse.body.type).toBe(testRoom.type);
      expect(parseFloat(verifyRoomResponse.body.pricePerNight)).toBe(testRoom.pricePerNight);

      // Step 5: Update room details
      const updateRoomResponse = await request(app.getHttpServer())
        .patch(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pricePerNight: 150,
          description: 'Updated test room',
          amenities: ['WiFi', 'TV', 'Mini Bar'],
        })
        .expect(200);

      expect(parseFloat(updateRoomResponse.body.pricePerNight)).toBe(150);
      expect(updateRoomResponse.body.description).toBe('Updated test room');
      expect(updateRoomResponse.body.amenities).toContain('Mini Bar');

      // Step 6: Search for rooms
      const searchResponse = await request(app.getHttpServer())
        .get('/rooms/search')
        .query({
          minPrice: 100,
          maxPrice: 200,
          amenities: ['WiFi', 'TV'],
        })
        .expect(200);

      // Instead of checking exact length, check that the results include our room
      expect(Array.isArray(searchResponse.body)).toBe(true);
      expect(searchResponse.body.some(room => room.id === roomId)).toBe(true);

      // Step 7: Update room availability
      const updateAvailabilityResponse = await request(app.getHttpServer())
        .patch(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          availabilityStatus: 'maintenance',
        })
        .expect(200);

      expect(updateAvailabilityResponse.body.availabilityStatus).toBe('maintenance');

      // Step 8: Delete room
      await request(app.getHttpServer())
        .delete(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Step 9: Verify room is deleted
      await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
