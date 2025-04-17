import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export interface RoomTypeImage {
  url: string;
  type: string;
  caption?: string;
  displayOrder?: number;
}

@Entity('room_types')
export class RoomType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'room_type_id' })
  @ApiProperty({ description: 'The unique identifier of the room type' })
  id: number;

  @Column({ name: 'name', unique: true })
  @ApiProperty({ description: 'The name of the room type' })
  name: string;

  @Column({ name: 'code', unique: true })
  @ApiProperty({ description: 'The room type code (single, double, suite, deluxe)' })
  code: string;

  @Column({ name: 'description', type: 'text' })
  @ApiProperty({ description: 'The description of the room type' })
  description: string;

  @Column({ name: 'price_per_night', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The price per night for this room type' })
  pricePerNight: number;

  @Column({ name: 'max_guests' })
  @ApiProperty({ description: 'The maximum number of guests allowed for this room type' })
  maxGuests: number;

  @Column({ name: 'image_url', nullable: true })
  @ApiProperty({ description: 'The main image URL for this room type' })
  imageUrl: string;

  @Column({ name: 'amenities', type: 'text', nullable: true })
  @ApiProperty({ 
    description: 'The amenities available for this room type',
    type: 'array',
    items: {
      type: 'string'
    } 
  })
  private _amenities: string;

  @ApiProperty({ description: 'Room amenities as array', required: false, type: 'array', items: { type: 'string' } })
  get amenities(): string[] {
    return this._amenities ? JSON.parse(this._amenities) : [];
  }

  set amenities(value: string[]) {
    this._amenities = value ? JSON.stringify(value) : null;
  }

  @Column({ name: 'display_order', default: 1 })
  @ApiProperty({ description: 'The display order for the room type in listings' })
  displayOrder: number;
} 