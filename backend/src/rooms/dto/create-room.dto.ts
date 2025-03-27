import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsJSON,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

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
    type: RoomType;

  /**
   * The room number or identifier
   */
  @ApiProperty({ description: 'The room number or identifier' })
  @IsNotEmpty()
  @IsString()
    number: string;

  /**
   * The price per night for the room
   */
  @ApiProperty({ description: 'The price per night for the room' })
  @IsNotEmpty()
  @IsNumber()
    pricePerNight: number;

  /**
   * The maximum number of guests allowed in the room
   */
  @ApiProperty({ description: 'The maximum number of guests allowed in the room' })
  @IsNotEmpty()
  @IsNumber()
    maxGuests: number;

  /**
   * The floor number where the room is located
   */
  @ApiProperty({ description: 'The floor number where the room is located' })
  @IsNotEmpty()
  @IsNumber()
    floor: number;

  /**
   * Whether the room has a balcony
   */
  @ApiPropertyOptional({ description: 'Whether the room has a balcony' })
  @IsOptional()
  @IsBoolean()
    hasBalcony?: boolean;

  /**
   * Whether the room has a view
   */
  @ApiPropertyOptional({ description: 'Whether the room has a view' })
  @IsOptional()
  @IsBoolean()
    hasView?: boolean;

  /**
   * Optional description of the room's features or amenities
   */
  @ApiPropertyOptional({ description: 'Optional description of the room\'s features or amenities' })
  @IsOptional()
  @IsString()
    description?: string;

  @ApiProperty({ description: 'Room amenities', required: false })
  @IsOptional()
  @IsJSON()
    amenities?: string;

  @ApiProperty({
    description: 'Room availability status',
    enum: AvailabilityStatus,
  })
  @IsEnum(AvailabilityStatus)
  @IsOptional()
    availabilityStatus: AvailabilityStatus;

  @IsBoolean()
  @IsOptional()
    isActive?: boolean;
}
