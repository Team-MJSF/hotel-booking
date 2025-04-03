import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Room } from './rooms/entities/room.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hotel_booking_dev',
      entities: [User, Room, Booking, Payment],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'test',
      dropSchema: false,
      driver: require('mysql2'),
      extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
      }
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    BookingsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
