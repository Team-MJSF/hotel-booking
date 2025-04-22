import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus } from '../entities/booking.entity';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating an existing booking
 * Extends CreateBookingDto but makes all fields optional
 * This allows partial updates of booking information
 */
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  /**
   * Optional booking status
   */
  @ApiPropertyOptional({
    description: 'The status of the booking',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus | string;

  /**
   * Optional flag to indicate if this is a temporary booking
   */
  @ApiPropertyOptional({
    description: 'Flag indicating if this is a temporary booking',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;
}
