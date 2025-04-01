import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as path from 'path';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthModule } from '../auth.module';
import { JwtModule } from '@nestjs/jwt';

interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

describe('Auth Flow Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
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
              username: configService.get('DB_USER'),
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
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
        AppModule,
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: async (payload: JwtPayload) => {
          const user = await userRepository.findOne({ where: { id: payload.sub } });
          if (!user) {
            throw new Error('User not found');
          }
          return user;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
    await dataSource.query('SET SESSION time_zone = "+00:00"');

    userRepository = moduleFixture.get(getRepositoryToken(User));
  }, 30000);

  beforeEach(async () => {
    // Truncate users table before each test
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE users');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Complete Auth Flow', () => {
    it('should complete the full authentication flow', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('id');
      expect(registerResponse.body.email).toBe(testUser.email);

      // Step 2: Login with the registered user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      const userToken = loginResponse.body.access_token;

      // Step 3: Access protected route with JWT token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(testUser.email);
      expect(profileResponse.body.firstName).toBe(testUser.firstName);

      // Step 4: Update user profile
      const updateResponse = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200);

      expect(updateResponse.body.firstName).toBe('Updated');
      expect(updateResponse.body.lastName).toBe('Name');
    });
  });
}); 