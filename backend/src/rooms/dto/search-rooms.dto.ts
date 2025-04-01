import { IsOptional, IsDate, IsEnum, IsInt, IsNumber, IsArray, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../entities/room.entity';

export enum SortField {
  PRICE = 'price',
  TYPE = 'type',
  MAX_GUESTS = 'maxGuests',
  ROOM_NUMBER = 'roomNumber'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class SearchRoomsDto {
  @ApiProperty({ required: false, description: 'Check-in date for the booking' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
    checkInDate?: Date;

  @ApiProperty({ required: false, description: 'Check-out date for the booking' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
    checkOutDate?: Date;

  @ApiProperty({ required: false, enum: RoomType, description: 'Type of room to search for' })
  @IsOptional()
  @IsEnum(RoomType)
    roomType?: RoomType;

  @ApiProperty({ required: false, description: 'Maximum number of guests the room should accommodate' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
    maxGuests?: number;

  @ApiProperty({ required: false, description: 'Minimum price per night' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
    minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price per night' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
    maxPrice?: number;

  @ApiProperty({ required: false, type: [String], description: 'List of amenities required' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    amenities?: string[];

  @ApiProperty({ required: false, enum: SortField, description: 'Field to sort results by' })
  @IsOptional()
  @IsEnum(SortField)
    sortBy?: SortField;

  @ApiProperty({ required: false, enum: SortOrder, description: 'Sort order (ascending or descending)' })
  @IsOptional()
  @IsEnum(SortOrder)
    sortOrder?: SortOrder;
} 