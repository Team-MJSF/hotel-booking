import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../../app.module';
import { UserRole } from '../../users/entities/user.entity';
import { DataSource, QueryRunner } from 'typeorm';
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

describe('Auth Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const testUser = {
    email: 'auth-flow-test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  const testAdmin = {
    email: 'auth-flow-admin@example.com',
    password: 'admin123',
    confirmPassword: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
  };

  beforeAll(async () => {
    const setup = await initTestApp();
    app = setup;
    dataSource = app.get(DataSource);

    // Check database tables
    await checkDatabaseTables(app);

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    safetyTimeout = setTimeout(() => {
      process.exit(1); // Force exit if tests hang
    }, MAX_TEST_DURATION);
  });

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

  describe('Registration Flow', () => {
    it('should handle complete registration scenarios', async () => {
      // Step 1: Register a user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: UserRole.USER,
      });
      expect(registerResponse.body).not.toHaveProperty('password');

      // Test registration with mismatched passwords
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'test2@example.com',
          confirmPassword: 'different',
        })
        .expect(401);

      // Test registration with existing email
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(409);

      // First, create a user with admin privileges directly in the database
      await dataSource.query(`
        INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at, token_version, is_active)
        VALUES ('Admin', 'User', 'admin-creator@example.com', 
                '$2b$10$2xGcGik0JTzYDbU3E628Seqgqd2EYMnhXMmFPi.ovz3DQKWQu5acq', 
                'admin', NOW(), NOW(), 0, true)
      `);

      // Login as the admin user
      const adminCreatorLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin-creator@example.com',
          password: 'password123', // The hash above corresponds to 'password123'
        })
        .expect(201);

      // Now create a new admin user using the protected endpoint
      const adminCreatorToken = adminCreatorLogin.body.access_token;
      const adminRegisterResponse = await request(app.getHttpServer())
        .post('/auth/create-admin')
        .set('Authorization', `Bearer ${adminCreatorToken}`)
        .send(testAdmin)
        .expect(201);

      expect(adminRegisterResponse.body).toMatchObject({
        email: testAdmin.email,
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName,
        role: UserRole.ADMIN,
      });

      // Test duplicate registration
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(409);
    });
  });

  describe('Login Flow', () => {
    it('should handle complete login scenarios', async () => {
      // Step 1: Register a user first
      const description = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Step 2: Login with the registered user
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(userLoginResponse.body).toHaveProperty('access_token');
      expect(typeof userLoginResponse.body.access_token).toBe('string');

      // Create an admin user directly in the database for testing
      await dataSource.query(`
        INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at, token_version, is_active)
        VALUES ('Admin', 'User', '${testAdmin.email}', 
                '$2b$10$2xGcGik0JTzYDbU3E628Seqgqd2EYMnhXMmFPi.ovz3DQKWQu5acq', 
                'admin', NOW(), NOW(), 0, true)
      `);

      // Test login with incorrect password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      // Test login with non-existent email
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Profile Access Flow', () => {
    it('should handle complete profile access scenarios', async () => {
      // Register and login a user
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const accessToken = loginResponse.body.access_token;

      // Test profile access with valid token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: UserRole.USER,
      });
      expect(profileResponse.body).not.toHaveProperty('password');

      // Test profile access with invalid token
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Test profile access without token
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('Role-Based Access Flow', () => {
    it('should handle complete role-based access scenarios', async () => {
      // Register a regular user
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      // Create an admin user directly in the database for testing
      await dataSource.query(`
        INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at, token_version, is_active)
        VALUES ('Admin', 'User', '${testAdmin.email}', 
                '$2b$10$2xGcGik0JTzYDbU3E628Seqgqd2EYMnhXMmFPi.ovz3DQKWQu5acq', 
                'admin', NOW(), NOW(), 0, true)
      `);

      const userLoginResponse = await request(app.getHttpServer()).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const adminLoginResponse = await request(app.getHttpServer()).post('/auth/login').send({
        email: testAdmin.email,
        password: 'password123', // The hash above corresponds to 'password123'
      });

      const userToken = userLoginResponse.body.access_token;
      const adminToken = adminLoginResponse.body.access_token;

      // Test user profile access
      const userProfileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userProfileResponse.body.role).toBe(UserRole.USER);

      // Test admin profile access
      const adminProfileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminProfileResponse.body.role).toBe(UserRole.ADMIN);

      // Test user attempting to access admin-only endpoint
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Test admin accessing admin-only endpoint
      const adminUsersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(adminUsersResponse.body)).toBe(true);
      expect(adminUsersResponse.body.length).toBeGreaterThan(0);
    });
  });
});
