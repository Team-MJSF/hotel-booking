import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Room])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
