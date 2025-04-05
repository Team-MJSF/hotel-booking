import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

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

export enum PhotoType {
  MAIN = 'main',
  GALLERY = 'gallery',
  AMENITY = 'amenity',
}

export interface RoomPhoto {
  url: string;
  type: PhotoType;
  caption?: string;
  displayOrder: number;
}

@Entity('rooms')
@Index('IDX_ROOMS_TYPE', ['type'])
@Index('IDX_ROOMS_PRICE', ['pricePerNight'])
@Index('IDX_ROOMS_MAX_GUESTS', ['maxGuests'])
@Index('IDX_ROOMS_AVAILABILITY', ['availabilityStatus'])
@Index('IDX_ROOMS_TYPE_PRICE', ['type', 'pricePerNight'])
@Index('IDX_ROOMS_TYPE_AVAILABILITY', ['type', 'availabilityStatus'])
@Index('IDX_ROOMS_NUMBER', ['roomNumber'])
@Index('IDX_ROOMS_DESCRIPTION', ['description'], { fulltext: true })
export class Room extends BaseEntity {
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
  @ApiProperty({
    description: 'The amenities available in the room',
    type: 'string',
  })
  public amenities: string;

  @Column({ name: 'photos', type: 'json', nullable: true })
  @ApiProperty({
    description: 'Array of photos associated with the room',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        type: { type: 'string', enum: Object.values(PhotoType) },
        caption: { type: 'string' },
        displayOrder: { type: 'number' },
      },
    },
    required: false,
  })
  photos?: RoomPhoto[];

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

  @OneToMany(() => Booking, booking => booking.room)
  @ApiProperty({ description: 'The bookings associated with this room' })
  bookings: Booking[];
}
