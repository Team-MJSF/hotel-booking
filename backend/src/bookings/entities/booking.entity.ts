import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

@Entity('Bookings')
export class Booking {
  @ApiProperty({ description: 'The unique identifier of the booking' })
  @PrimaryGeneratedColumn()
    bookingId!: number;

  @ApiProperty({ description: 'The ID of the user who made the booking' })
  @Column()
    userId!: number;

  @ApiProperty({ description: 'The ID of the room being booked' })
  @Column()
    roomId!: number;

  @ApiProperty({ description: 'The check-in date for the booking' })
  @Column()
    checkInDate!: Date;

  @ApiProperty({ description: 'The check-out date for the booking' })
  @Column()
    checkOutDate!: Date;

  @ApiProperty({ description: 'The number of guests for the booking' })
  @Column({ nullable: true })
    numberOfGuests!: number;

  @ApiProperty({
    description: 'The current status of the booking',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
    status!: BookingStatus;

  @ApiProperty({ description: 'The user who made the booking' })
  @ManyToOne(() => User)
    user!: User;

  @ApiProperty({ description: 'The room being booked' })
  @ManyToOne(() => Room)
    room!: Room;

  @ApiProperty({ description: 'The payments associated with this booking' })
  @OneToMany(() => Payment, (payment) => payment.booking)
    payments!: Payment[];

  @ApiProperty({ description: 'The date when the booking was created' })
  @CreateDateColumn()
    createdAt!: Date;

  @ApiProperty({ description: 'The date when the booking was last updated' })
  @UpdateDateColumn()
    updatedAt!: Date;
}
