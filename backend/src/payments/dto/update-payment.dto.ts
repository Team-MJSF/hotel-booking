import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';

/**
 * Data Transfer Object for updating an existing payment
 * Extends CreatePaymentDto but makes all fields optional
 * This allows partial updates of payment information
 */
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
