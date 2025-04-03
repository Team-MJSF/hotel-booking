import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../../app.module';
import { UserRole } from '../../users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { getTypeOrmConfig } from '../../config/typeorm.config';

describe('Auth Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  const testAdmin = {
    email: 'admin@example.com',
    password: 'admin123',
    confirmPassword: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  };

  beforeAll(async () => {
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
              synchronize: true,
              dropSchema: true,
              logging: false,
            };
          },
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
    await dataSource.query('SET SESSION time_zone = "+00:00"');
    await dataSource.query('SET NAMES utf8mb4');
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE payments');
    await dataSource.query('TRUNCATE TABLE bookings');
    await dataSource.query('TRUNCATE TABLE rooms');
    await dataSource.query('TRUNCATE TABLE users');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('Registration Flow', () => {
    it('should handle complete registration scenarios', async () => {
      // Test successful registration
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
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(401);

      // Test admin registration
      const adminRegisterResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin)
        .expect(201);

      expect(adminRegisterResponse.body).toMatchObject({
        email: testAdmin.email,
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName,
        role: UserRole.ADMIN,
      });
    });
  });

  describe('Login Flow', () => {
    it('should handle complete login scenarios', async () => {
      // Register users for testing
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin);

      // Test successful user login
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(userLoginResponse.body).toHaveProperty('access_token');
      expect(typeof userLoginResponse.body.access_token).toBe('string');

      // Test successful admin login
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        })
        .expect(201);

      expect(adminLoginResponse.body).toHaveProperty('access_token');
      expect(typeof adminLoginResponse.body.access_token).toBe('string');

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
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
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
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });

  describe('Role-Based Access Flow', () => {
    it('should handle complete role-based access scenarios', async () => {
      // Register and login both user types
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin);

      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
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