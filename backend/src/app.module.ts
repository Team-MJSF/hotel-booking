import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306'), 10),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'hotel_booking_dev'),
        entities: [User, Room, Booking, Payment],
        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production',
        dropSchema: false,
        driver: require('mysql2'),
        extra: {
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0
        }
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    BookingsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
