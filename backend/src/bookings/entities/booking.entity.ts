import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @ApiProperty({ description: 'The unique identifier of the booking' })
  @PrimaryGeneratedColumn({ name: 'booking_id' })
    bookingId!: number;

  @ApiProperty({ description: 'The check-in date for the booking' })
  @Column({ name: 'check_in_date' })
    checkInDate!: Date;

  @ApiProperty({ description: 'The check-out date for the booking' })
  @Column({ name: 'check_out_date' })
    checkOutDate!: Date;

  @ApiProperty({ description: 'The number of guests for the booking' })
  @Column({ name: 'number_of_guests', nullable: true })
    numberOfGuests!: number;

  @ApiProperty({
    description: 'The current status of the booking',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
    status!: BookingStatus;

  @ApiProperty({ description: 'The user who made the booking' })
  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
    user!: User;

  @ApiProperty({ description: 'The room being booked' })
  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'room_id' })
    room!: Room;

  @ApiProperty({ description: 'The payments associated with this booking' })
  @OneToMany(() => Payment, (payment) => payment.booking)
    payments!: Payment[];

  @ApiProperty({ description: 'The date when the booking was created' })
  @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

  @ApiProperty({ description: 'The date when the booking was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
