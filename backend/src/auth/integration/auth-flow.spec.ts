import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../../app.module';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { DataSource } from 'typeorm';
import * as path from 'path';

describe('Auth Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: path.resolve(process.cwd(), '.env.test'),
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: parseInt(configService.get('DB_PORT', '3306'), 10),
            username: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            entities: [User, Room, Booking, Payment],
            synchronize: true,
            dropSchema: true,
            logging: false,
            driver: require('mysql2'),
            extra: {
              connectionLimit: 10,
              waitForConnections: true,
              queueLimit: 0,
              dateStrings: true,
              timezone: 'local',
              charset: 'utf8mb4'
            },
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
            keepConnectionAlive: true
          }),
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
    // Disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Truncate tables in correct order
    await dataSource.query('TRUNCATE TABLE payments');
    await dataSource.query('TRUNCATE TABLE bookings');
    await dataSource.query('TRUNCATE TABLE rooms');
    await dataSource.query('TRUNCATE TABLE users');
    
    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('Registration Flow', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.firstName).toBe('Test');
          expect(res.body.lastName).toBe('User');
          expect(res.body.role).toBe(UserRole.USER);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should not register with mismatched passwords', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(401);
    });

    it('should not register with existing email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(401);
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('should login successfully with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should not login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should not login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Profile Access Flow', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should access profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.firstName).toBe('Test');
          expect(res.body.lastName).toBe('User');
          expect(res.body.role).toBe(UserRole.USER);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should not access profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should not access profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });

  describe('Role-Based Access Flow', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      // Register and login an admin user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        });

      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      adminToken = adminLoginResponse.body.access_token;

      // Register and login a regular user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Regular',
          lastName: 'User',
        });

      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      userToken = userLoginResponse.body.access_token;
    });

    it('should allow admin to access profile', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.role).toBe(UserRole.ADMIN);
        });
    });

    it('should allow regular user to access profile', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.role).toBe(UserRole.USER);
        });
    });
  });
}); 