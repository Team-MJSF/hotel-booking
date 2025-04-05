import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { getTypeOrmConfig } from '../../config/typeorm.migrations.config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as path from 'path';

// Maximum duration for the test
const MAX_TEST_DURATION = 30000; // 30 seconds
let safetyTimeout: NodeJS.Timeout;

// Define delay function directly
const delay = (ms: number): Promise<void> => {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
};

// Define initTestApp function directly
async function initTestApp(): Promise<INestApplication> {
  try {
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
              logging: true,
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
  } catch (error) {
    console.error('Failed to initialize test app:', error);
    throw error;
  }
}

async function checkDatabaseTables(app: INestApplication) {
  try {
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    console.log('Database connection info:', {
      database: dataSource.options.database,
      isConnected: dataSource.isInitialized
    });
    
    const tables = await queryRunner.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    await queryRunner.release();
  } catch (error) {
    console.error('Failed to check database tables:', error);
  }
}

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'P@ssw0rd123!',
  confirmPassword: 'P@ssw0rd123!',
  phoneNumber: '+1234567890',
  address: '123 Test St',
  role: UserRole.USER
};

describe('Refresh Token Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  beforeAll(async () => {
    console.log('Starting refresh token flow tests with enhanced cleanup...');
    
    try {
      const setup = await initTestApp();
      app = setup;
      dataSource = app.get(DataSource);
      
      // Check database tables
      await checkDatabaseTables(app);
      
      userRepository = app.get(getRepositoryToken(User));
      jwtService = app.get(JwtService);
      configService = app.get(ConfigService);
      
      queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      safetyTimeout = setTimeout(() => {
        console.error('Test exceeded maximum duration!');
        process.exit(1); // Force exit if tests hang
      }, MAX_TEST_DURATION);
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
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

  describe('Complete Refresh Token Flow', () => {
    let userId: number;
    let accessToken: string;
    let refreshToken: string;

    it('should complete the full refresh token flow', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      userId = registerResponse.body.id;

      // Step 2: Login to get JWT tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      accessToken = loginResponse.body.access_token;
      refreshToken = loginResponse.body.refresh_token;

      // Step 3: Use the access token to access a protected endpoint
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body).toBeDefined();
      expect(profileResponse.body.id).toBe(userId);

      // Step 4: Refresh the access token
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(201);

      const newAccessToken = refreshResponse.body.access_token;
      const newRefreshToken = refreshResponse.body.refresh_token;

      // Step 5: Use the new access token to access a protected endpoint
      const newProfileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(newProfileResponse.body).toBeDefined();
      expect(newProfileResponse.body.id).toBe(userId);

      // Step 6: Logout to invalidate the refresh token
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refresh_token: newRefreshToken })
        .expect(200);

      // Step 7: Try to refresh the token again (should fail)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: newRefreshToken })
        .expect(401);
    });
  });
}); 