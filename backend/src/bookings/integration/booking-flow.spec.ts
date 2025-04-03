import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Booking } from '../entities/booking.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService as NestConfigService } from '@nestjs/config';
import * as path from 'path';

describe('Booking Flow Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: NestConfigService;
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

  const testRoom = {
    roomNumber: `101-${Date.now()}`,
    type: 'DOUBLE',
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
      .overrideGuard('JwtAuthGuard')
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
    await dataSource.query('SET SESSION time_zone = "+00:00"');

    userRepository = moduleFixture.get(getRepositoryToken(User));
    jwtService = moduleFixture.get(JwtService);
    configService = moduleFixture.get(NestConfigService);
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

  describe('Complete Booking Flow', () => {
    let userId: number;
    let roomId: number;
    let userToken: string;
    let adminToken: string;

    it('should complete the full booking flow', async () => {
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

      // Step 3: Create a room (as admin)
      await userRepository.update(userId, { role: UserRole.ADMIN });
      adminToken = jwtService.sign(
        { sub: userId, email: testUser.email, role: UserRole.ADMIN },
        { secret: configService.get('JWT_SECRET') },
      );

      const roomResponse = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testRoom)
        .expect(201);

      roomId = roomResponse.body.id;

      // Step 4: Search for available rooms
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const searchResponse = await request(app.getHttpServer())
        .get('/rooms/search')
        .query({
          checkInDate: tomorrow.toISOString().split('T')[0],
          checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
          maxGuests: 2,
          minPrice: 0,
          maxPrice: 1000,
          amenities: ['WiFi', 'TV']
        })
        .expect(200);

      expect(searchResponse.body).toHaveLength(1);
      expect(searchResponse.body[0].id).toBe(roomId);

      // Step 5: Create a booking
      const bookingResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId,
          roomId,
          checkInDate: tomorrow.toISOString(),
          checkOutDate: dayAfterTomorrow.toISOString(),
          numberOfGuests: 2,
          specialRequests: 'Late check-in requested',
        })
        .expect(201);

      const bookingId = bookingResponse.body.bookingId;

      // Step 6: Verify booking details
      const getBookingResponse = await request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(getBookingResponse.body).toMatchObject({
        bookingId,
        status: 'pending',
        numberOfGuests: 2,
        specialRequests: 'Late check-in requested',
      });

      // Step 7: Update booking status (as admin)
      const updateResponse = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(updateResponse.body.status).toBe('confirmed');

      // Step 8: Verify room status is updated
      const getRoomResponse = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getRoomResponse.body.availabilityStatus).toBe('occupied');

      // Step 9: Cancel booking
      const cancelResponse = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(cancelResponse.body.status).toBe('cancelled');

      // Step 10: Verify room status is updated back to available
      const getRoomAfterCancelResponse = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getRoomAfterCancelResponse.body.availabilityStatus).toBe('available');
    });
  });
}); 