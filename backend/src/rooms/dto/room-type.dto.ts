import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUrl, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for creating a new room type
 */
export class CreateRoomTypeDto {
  @ApiProperty({ description: 'The name of the room type' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The unique code for the room type (e.g., single, double, suite, deluxe)' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'The description of the room type' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price per night for this room type' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  pricePerNight: number;

  @ApiProperty({ description: 'The maximum number of guests allowed for this room type' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  maxGuests: number;

  @ApiPropertyOptional({ description: 'The main image URL for this room type' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'The display order for the room type in listings' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Array of amenities available for this room type',
    type: 'array',
    items: {
      type: 'string'
    }
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return [value];
      }
    }
    return value;
  })
  amenities?: string[];
}

/**
 * Data Transfer Object for updating a room type
 * Extends CreateRoomTypeDto but makes all fields optional
 */
export class UpdateRoomTypeDto {
  @ApiPropertyOptional({ description: 'The name of the room type' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The unique code for the room type (e.g., single, double, suite, deluxe)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'The description of the room type' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'The price per night for this room type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  pricePerNight?: number;

  @ApiPropertyOptional({ description: 'The maximum number of guests allowed for this room type' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  maxGuests?: number;

  @ApiPropertyOptional({ description: 'The main image URL for this room type' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'The display order for the room type in listings' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Array of amenities available for this room type',
    type: 'array',
    items: {
      type: 'string'
    }
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return [value];
      }
    }
    return value;
  })
  amenities?: string[];
} 