import {
  IsOptional,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  IsString,
  Min,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../entities/room.entity';

export enum SortField {
  PRICE = 'price',
  TYPE = 'type',
  MAX_GUESTS = 'maxGuests',
  ROOM_NUMBER = 'roomNumber',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: Date, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, Date>)[relatedPropertyName];
          return value > relatedValue;
        },
      },
    });
  };
}

function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, number>)[relatedPropertyName];
          return value > relatedValue;
        },
      },
    });
  };
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
  @ValidateIf(o => o.checkInDate && o.checkOutDate)
  @IsAfterDate('checkInDate', {
    message: 'Check-out date must be after check-in date',
  })
  checkOutDate?: Date;

  @ApiProperty({ required: false, enum: RoomType, description: 'Type of room to search for' })
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @ApiProperty({
    required: false,
    description: 'Maximum number of guests the room should accommodate',
  })
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
  @ValidateIf(o => o.minPrice !== undefined && o.maxPrice !== undefined)
  @IsGreaterThan('minPrice', {
    message: 'Maximum price must be greater than minimum price',
  })
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

  @ApiProperty({
    required: false,
    enum: SortOrder,
    description: 'Sort order (ascending or descending)',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
