import { IsOptional, IsNumber, IsArray, IsDate, Min, Max, ValidateIf, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../entities/room.entity';

export class SearchRoomsDto {
  @ApiProperty({ description: 'Check-in date for the booking' })
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => new Date(value))
  checkInDate: Date;

  @ApiProperty({ description: 'Check-out date for the booking' })
  @Type(() => Date)
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ValidateIf((o) => o.checkInDate)
  checkOutDate: Date;

  @ApiProperty({ description: 'Optional room type filter', enum: RoomType, required: false })
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @ApiProperty({ description: 'Optional maximum number of guests filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  maxGuests?: number;

  @ApiProperty({ description: 'Optional minimum price per night filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minPrice?: number;

  @ApiProperty({ description: 'Optional maximum price per night filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxPrice?: number;

  @ApiProperty({ description: 'Optional array of required amenities', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(item => item.trim());
      }
    }
    return value;
  })
  @IsArray()
  amenities?: string[];
} 