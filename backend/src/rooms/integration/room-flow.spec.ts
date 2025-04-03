import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room } from '../entities/room.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as path from 'path';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';

interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

describe('Room Flow Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let dataSource: DataSource;

  const testUser = {
    email: 'test@example.com',
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
              entities: [User, Room],
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

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE rooms');
    await dataSource.query('TRUNCATE TABLE users');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('Complete Room Flow', () => {
    let adminToken: string;
    let roomId: number;

    it('should complete the full room flow', async () => {
      // Step 1: Register an admin user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Step 2: Login to get JWT token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
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

      expect(searchResponse.body).toHaveLength(1);
      expect(searchResponse.body[0].id).toBe(roomId);

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