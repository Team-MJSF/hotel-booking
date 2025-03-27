import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  SUITE = 'suite',
  DELUXE = 'deluxe',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the room' })
    id: number;

  @Column()
  @ApiProperty({ description: 'The room number' })
    roomNumber: string;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  @ApiProperty({ description: 'The type of room', enum: RoomType })
    type: RoomType;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'The price per night for the room' })
    pricePerNight: number;

  @Column()
  @ApiProperty({ description: 'The maximum number of guests allowed' })
    maxGuests: number;

  @Column()
  @ApiProperty({ description: 'The description of the room' })
    description: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The amenities available in the room' })
    amenities?: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  @ApiProperty({
    description: 'The current availability status of the room',
    enum: AvailabilityStatus,
  })
    availabilityStatus: AvailabilityStatus;

  @OneToMany(() => Booking, (booking) => booking.room)
  @ApiProperty({ description: 'The bookings associated with this room' })
    bookings: Booking[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The date when the room was created' })
    createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date when the room was last updated' })
    updatedAt: Date;
}
