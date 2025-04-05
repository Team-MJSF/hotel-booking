import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../entities/user.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import * as path from 'path';
import { getTypeOrmConfig } from '../../config/typeorm.migrations.config';

// Initialize a test app with the correct TypeORM configuration
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
    }).compile();

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

describe('User Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let description: Repository<User>;

  const testUser = {
    email: 'user-flow-test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
  };

  const testAdmin = {
    email: 'user-flow-admin@example.com',
    password: 'admin123',
    confirmPassword: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    phoneNumber: '9876543210',
    address: '456 Admin St',
  };

  beforeAll(async () => {
    // Set up test module
    const setup = await initTestApp();
    app = setup;
    dataSource = app.get(DataSource);
    description = dataSource.getRepository(User);
  });

  afterAll(async () => {
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

  describe('Complete User Flow', () => {
    let userToken: string;
    let adminToken: string;
    let userId: number;
    let adminId: number;

    it('should complete the full user flow', async () => {
      try {
        // Step 1: Register a user
        const registerResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(res => {
            console.log('Registration response:', res.status, res.body);
            if (res.status !== 201) {
              throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
            }
          });

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

        // Step 3: Get user profile
        const profileResponse = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(profileResponse.body).toBeDefined();
        expect(profileResponse.body.id).toBe(userId);
        expect(profileResponse.body.email).toBe(testUser.email);
        expect(profileResponse.body.firstName).toBe(testUser.firstName);
        expect(profileResponse.body.lastName).toBe(testUser.lastName);

        // Step 4: Update user profile
        const updateResponse = await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            firstName: 'Updated',
            lastName: 'User',
            phoneNumber: '9876543210',
          })
          .expect(200);

        expect(updateResponse.body).toBeDefined();
        expect(updateResponse.body.id).toBe(userId);
        expect(updateResponse.body.firstName).toBe('Updated');
        expect(updateResponse.body.lastName).toBe('User');
        expect(updateResponse.body.phoneNumber).toBe('9876543210');

        // Step 5: Get updated profile
        const updatedProfileResponse = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(updatedProfileResponse.body).toBeDefined();
        expect(updatedProfileResponse.body.id).toBe(userId);
        expect(updatedProfileResponse.body.firstName).toBe('Updated');
        expect(updatedProfileResponse.body.lastName).toBe('User');
        expect(updatedProfileResponse.body.phoneNumber).toBe('9876543210');

        // Step 6: Register an admin user
        const adminRegisterResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send(testAdmin)
          .expect(201);

        adminId = adminRegisterResponse.body.id;

        // Step 7: Login as admin
        const adminLoginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password,
          })
          .expect(201);

        adminToken = adminLoginResponse.body.access_token;

        // Step 8: Admin gets all users
        const getAllUsersResponse = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(getAllUsersResponse.body).toHaveLength(2);
        expect(getAllUsersResponse.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: userId }),
            expect.objectContaining({ id: adminId }),
          ]),
        );

        // Step 9: Admin gets specific user
        const getUserResponse = await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(getUserResponse.body).toMatchObject({
          id: userId,
          email: testUser.email,
          firstName: 'Updated',
          lastName: 'User',
        });

        // Step 10: Admin updates user role
        const updateRoleResponse = await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            role: UserRole.ADMIN,
          })
          .expect(200);

        expect(updateRoleResponse.body.role).toBe(UserRole.ADMIN);

        // Step 11: Get new token for updated user role
        const newLoginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(201);

        userToken = newLoginResponse.body.access_token;

        // Step 12: Verify user can access admin endpoints after role update
        const userAsAdminResponse = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(userAsAdminResponse.body).toHaveLength(2);

        // Step 13: Delete user (as admin)
        await request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Step 14: Verify user is deleted
        await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });
  });
}); 