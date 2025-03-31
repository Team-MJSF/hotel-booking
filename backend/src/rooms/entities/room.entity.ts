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

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  @ApiProperty({ description: 'The unique identifier of the room' })
    id: number;

  @Column({ name: 'room_number', unique: true })
  @ApiProperty({ description: 'The room number' })
    roomNumber: string;

  @Column({
    name: 'room_type',
    type: 'enum',
    enum: RoomType,
    default: RoomType.SINGLE,
  })
  @ApiProperty({ description: 'The type of room', enum: RoomType })
    type: RoomType;

  @Column({ name: 'price_per_night', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The price per night for the room' })
    pricePerNight: number;

  @Column({ name: 'max_guests' })
  @ApiProperty({ description: 'The maximum number of guests allowed' })
    maxGuests: number;

  @Column({ name: 'description', nullable: true })
  @ApiProperty({ description: 'The description of the room' })
    description: string;

  @Column({ name: 'amenities', type: 'json', nullable: true })
  @ApiProperty({ description: 'The amenities available in the room' })
    amenities: string;

  @Column({
    name: 'availability_status',
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

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The date when the room was created' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The date when the room was last updated' })
    updatedAt: Date;
}
