import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { BaseEntity } from '../../common/entities/base.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
@Index('IDX_BOOKINGS_USER', ['user'])
@Index('IDX_BOOKINGS_ROOM', ['room'])
@Index('IDX_BOOKINGS_STATUS', ['status'])
@Index('IDX_BOOKINGS_DATES', ['checkInDate', 'checkOutDate'])
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'booking_id' })
  @ApiProperty({ description: 'Unique identifier for the booking' })
  bookingId: number;

  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'The user who made the booking' })
  user: User;

  @ManyToOne(() => Room, room => room.bookings)
  @JoinColumn({ name: 'room_id' })
  @ApiProperty({ description: 'The room associated with the booking' })
  room: Room;

  @Column({ name: 'check_in_date', type: 'datetime' })
  @ApiProperty({ description: 'The check-in date for the booking' })
  checkInDate: Date;

  @Column({ name: 'check_out_date', type: 'datetime' })
  @ApiProperty({ description: 'The check-out date for the booking' })
  checkOutDate: Date;

  @Column({ name: 'number_of_guests' })
  @ApiProperty({ description: 'The number of guests for the booking' })
  numberOfGuests: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
  })
  @ApiProperty({
    description: 'The current status of the booking',
    enum: BookingStatus,
  })
  status: BookingStatus;

  @Column({ name: 'special_requests', nullable: true })
  @ApiProperty({
    description: 'Any special requests for the booking',
    required: false,
  })
  specialRequests?: string;

  @OneToOne(() => Payment, payment => payment.booking, { nullable: true })
  @ApiProperty({ description: 'The payment associated with this booking' })
  payment: Payment;
}
