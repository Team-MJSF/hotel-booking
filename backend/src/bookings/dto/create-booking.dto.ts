import { IsNotEmpty, IsNumber, IsDate, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

/**
 * Data Transfer Object for creating a new booking
 * Contains all required fields for booking creation
 */
export class CreateBookingDto {
  /**
   * The ID of the user making the booking
   */
  @ApiProperty({ description: 'The ID of the user making the booking' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  /**
   * The ID of the room being booked
   */
  @ApiProperty({ description: 'The ID of the room being booked' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  roomId: number;

  /**
   * The check-in date for the booking
   */
  @ApiProperty({ description: 'The check-in date for the booking' })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  checkInDate: Date;

  /**
   * The check-out date for the booking
   */
  @ApiProperty({ description: 'The check-out date for the booking' })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  checkOutDate: Date;

  /**
   * The number of guests for the booking
   */
  @ApiProperty({ description: 'The number of guests for the booking' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  numberOfGuests: number;

  /**
   * Optional special requests or notes for the booking
   */
  @ApiPropertyOptional({ description: 'Optional special requests or notes for the booking' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
