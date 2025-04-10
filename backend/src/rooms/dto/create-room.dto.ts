import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsJSON,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for creating a new room
 * Contains all required fields for room creation
 */
export class CreateRoomDto {
  /**
   * The type of the room (e.g., Standard, Deluxe, Suite)
   */
  @ApiProperty({ description: 'The type of the room', enum: RoomType })
  @IsNotEmpty()
  @IsEnum(RoomType)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  type: RoomType;

  /**
   * The room number or identifier
   */
  @ApiProperty({ description: 'The room number or identifier' })
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  /**
   * The price per night for the room
   */
  @ApiProperty({ description: 'The price per night for the room' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  pricePerNight: number;

  /**
   * The maximum number of guests allowed in the room
   */
  @ApiProperty({ description: 'The maximum number of guests allowed in the room' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  maxGuests: number;

  /**
   * Optional description of the room's features or amenities
   */
  @ApiPropertyOptional({ description: "Optional description of the room's features or amenities" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Room amenities',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.amenities !== '')
  @IsJSON()
  @Transform(({ value }) => {
    if (value === '') {
      return '';
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      try {
        // If it's already a JSON string, validate it's an array
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return value; // Let the validation decorators handle this
        }
        return value;
      } catch {
        return value; // Let the validation decorators handle this
      }
    }
    return value;
  })
  public amenities?: string;

  @ApiProperty({
    description: 'Room availability status',
    enum: AvailabilityStatus,
  })
  @IsEnum(AvailabilityStatus)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  availabilityStatus: AvailabilityStatus;
}
