import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from '../entities/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService as NestConfigService } from '@nestjs/config';
import * as path from 'path';

describe('Payment Flow Integration Tests', () => {
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
    amenities: JSON.stringify(['WiFi', 'TV']),
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

      // Verify room was created
      const verifyRoomResponse = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(verifyRoomResponse.body).toBeDefined();
      expect(verifyRoomResponse.body.id).toBe(roomId);

      // Step 4: Create a booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Verify user exists before creating booking
      const verifyUserResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(verifyUserResponse.body).toBeDefined();
      expect(verifyUserResponse.body.id).toBe(userId);

      const bookingResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
          roomId,
          checkInDate: tomorrow.toISOString(),
          checkOutDate: dayAfterTomorrow.toISOString(),
          numberOfGuests: 2,
        })
        .expect(201);

      bookingId = bookingResponse.body.bookingId;

      // Verify booking was created
      const verifyBookingResponse = await request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(verifyBookingResponse.body).toBeDefined();
      expect(verifyBookingResponse.body.bookingId).toBe(bookingId);

      // Step 5: Create a payment for the booking
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          amount: 200.00,
          currency: 'USD',
          paymentMethod: 'CREDIT_CARD',
          transactionId: 'test-transaction-123',
        })
        .expect(201);

      const paymentId = paymentResponse.body.paymentId;

      // Step 6: Verify payment details
      const getPaymentResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getPaymentResponse.body).toMatchObject({
        paymentId,
        amount: '200.00',
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'pending',
        transactionId: 'test-transaction-123',
      });

      // Step 7: Update payment status to completed
      const updatePaymentResponse = await request(app.getHttpServer())
        .patch(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(updatePaymentResponse.body.status).toBe('completed');

      // Step 8: Process a refund
      const refundResponse = await request(app.getHttpServer())
        .patch(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'refunded',
          refundReason: 'Customer requested cancellation',
        })
        .expect(200);

      expect(refundResponse.body).toMatchObject({
        status: 'refunded',
        refundReason: 'Customer requested cancellation',
      });

      // Step 9: Verify payment history
      const paymentHistoryResponse = await request(app.getHttpServer())
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(paymentHistoryResponse.body).toMatchObject({
        paymentId,
        status: 'refunded',
        refundReason: 'Customer requested cancellation',
      });
    });
  });
}); 