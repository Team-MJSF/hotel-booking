import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import * as path from 'path';

describe('User Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
  };

  const testAdmin = {
    email: 'admin@example.com',
    password: 'admin123',
    confirmPassword: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    phoneNumber: '9876543210',
    address: '456 Admin St',
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
            const config: TypeOrmModuleOptions = {
              type: 'mysql',
              host: configService.get('DB_HOST'),
              port: parseInt(configService.get('DB_PORT', '3306'), 10),
              username: configService.get('DB_USERNAME'),
              password: configService.get('DB_PASSWORD'),
              database: configService.get('DB_NAME'),
              entities: [User],
              synchronize: true,
              dropSchema: true,
              logging: false,
              driver: require('mysql2'),
              extra: {
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0,
                dateStrings: true,
                timezone: 'local'
              },
              retryAttempts: 3,
              retryDelay: 3000,
              autoLoadEntities: true,
              keepConnectionAlive: true
            };
            return config;
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
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE users');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('Complete User Flow', () => {
    let userToken: string;
    let adminToken: string;
    let userId: number;
    let adminId: number;

    it('should complete the full user flow', async () => {
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

      // Step 3: Get user profile
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(profileResponse.body).toMatchObject({
        id: userId,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: UserRole.USER,
      });

      // Step 4: Update user profile
      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: '5555555555',
        })
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        id: userId,
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '5555555555',
      });

      // Step 5: Register an admin user
      const adminRegisterResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin)
        .expect(201);

      adminId = adminRegisterResponse.body.id;

      // Step 6: Login as admin
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        })
        .expect(201);

      adminToken = adminLoginResponse.body.access_token;

      // Step 7: Admin gets all users
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

      // Step 8: Admin gets specific user
      const getUserResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getUserResponse.body).toMatchObject({
        id: userId,
        email: testUser.email,
        firstName: 'Updated',
        lastName: 'Name',
      });

      // Step 9: Admin updates user role
      const updateRoleResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: UserRole.ADMIN,
        })
        .expect(200);

      expect(updateRoleResponse.body.role).toBe(UserRole.ADMIN);

      // Step 10: Get new token for updated user role
      const newLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      userToken = newLoginResponse.body.access_token;

      // Step 11: Verify user can access admin endpoints after role update
      const userAsAdminResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userAsAdminResponse.body).toHaveLength(2);

      // Step 12: Delete user (as admin)
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Step 13: Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 