import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';

/**
 * Data Transfer Object for updating an existing booking
 * Extends CreateBookingDto but makes all fields optional
 * This allows partial updates of booking information
 */
export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
