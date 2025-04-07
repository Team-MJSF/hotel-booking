import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService as NestConfigService } from '@nestjs/config';
import * as path from 'path';
import { getTypeOrmConfig } from '../../config/typeorm.migrations.config';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AdminGuard } from '../../auth/guards/admin.guard';

// Maximum duration for the test
const MAX_TEST_DURATION = 30000; // 30 seconds
let safetyTimeout: NodeJS.Timeout;

// Mock the JwtAuthGuard to always allow requests
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

// Mock the AdminGuard to always allow admin access
class MockAdminGuard {
  canActivate() {
    return true;
  }
}

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
    providers: [
      // Override JWT auth guard globally
      {
        provide: APP_GUARD,
        useClass: MockJwtAuthGuard,
      },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(MockJwtAuthGuard)
    .overrideGuard(AdminGuard)
    .useClass(MockAdminGuard)
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

async function checkDatabaseTables(app: INestApplication) {
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  
  // SQLite specific query to get table list
  const tables = await queryRunner.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);
  
  await queryRunner.release();
  return tables;
}

// Logger utility for tests
const testLogger = {
  log: (message: string): void => {
    if (process.env.DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[LOG] ${message}`);
    }
  },
  error: (message: string, error?: unknown): void => {
    if (process.env.DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[ERROR] ${message}`, error || '');
    }
  }
};

describe('Payment Flow Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: NestConfigService;
  let dataSource: DataSource;

  const testUser = {
    email: `payment-flow-test-${Date.now()}@example.com`,
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
    amenities: JSON.stringify(['WiFi', 'TV']),
  };

  beforeAll(async () => {
    const setup = await initTestApp();
    app = setup;
    dataSource = app.get(DataSource);

    // Check database tables
    await checkDatabaseTables(app);

    configService = app.get(ConfigService);
    jwtService = app.get(JwtService);
    userRepository = app.get(getRepositoryToken(User));

    safetyTimeout = setTimeout(() => {
      process.exit(1); // Force exit if tests hang
    }, MAX_TEST_DURATION);

    // Authentication is already bypassed via the MockJwtAuthGuard in the module setup
  }, 30000);

  afterAll(async () => {
    // Clear the safety timeout
    clearTimeout(safetyTimeout);

    // Close the application
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Clean up tables before each test - SQLite version
    await dataSource.query('PRAGMA foreign_keys = OFF');
    
    // Get all tables
    const tables = await dataSource.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    // Delete data from each table
    for (const table of tables) {
      try {
        // Skip FTS tables as they're managed by SQLite
        if (table.name.includes('_fts') || table.name.includes('_config') || 
            table.name.includes('_data') || table.name.includes('_idx') || 
            table.name.includes('_docsize') || table.name.includes('_content')) {
          continue;
        }
        
        await dataSource.query(`DELETE FROM "${table.name}"`);
        // Reset SQLite sequences if they exist
        await dataSource.query(`DELETE FROM sqlite_sequence WHERE name="${table.name}"`).catch(() => {
          // Ignore errors if sequence doesn't exist
        });
      } catch (error) {
        testLogger.error(`Error cleaning up table ${table.name}:`, error);
      }
    }
    
    await dataSource.query('PRAGMA foreign_keys = ON');
  });

  afterEach(async () => {
    // No explicit cleanup needed
  });

  describe('Complete Payment Flow', () => {
    let authToken: string;
    let adminToken: string;
    let userId: number;
    let roomId: number;
    let bookingId: number;

    it('should complete the full payment flow', async () => {
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

      authToken = loginResponse.body.access_token;

      // Step 3: Create a room (as admin)
      await userRepository.update({ id: userId }, { role: UserRole.ADMIN });

      // Get the updated user with tokenVersion
      const updatedUser = await userRepository.findOne({ where: { id: userId } });

      adminToken = jwtService.sign(
        {
          sub: userId,
          email: updatedUser.email,
          role: updatedUser.role,
          tokenVersion: updatedUser.tokenVersion,
        },
        { secret: configService.get('JWT_SECRET') },
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          roomId,
          checkInDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          checkOutDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          numberOfGuests: 2,
        })
        .expect(201);

      bookingId = createBookingResponse.body.bookingId;

      // Step 6: Create a payment
      const createPaymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          amount: 200,
          currency: 'USD',
          paymentMethod: 'CREDIT_CARD',
        })
        .expect(201);

      // Step 7: Verify the payment was created
      const verifyPaymentResponse = await request(app.getHttpServer())
        .get(`/payments/${createPaymentResponse.body.paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(verifyPaymentResponse.body).toBeDefined();
      expect(verifyPaymentResponse.body.paymentId).toBe(createPaymentResponse.body.paymentId);
      expect(verifyPaymentResponse.body.status).toBe('pending');
      expect(parseFloat(verifyPaymentResponse.body.amount)).toBe(200);
      expect(verifyPaymentResponse.body.currency).toBe('USD');
      expect(verifyPaymentResponse.body.paymentMethod).toBe('CREDIT_CARD');
    });
  });
});
