import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, Currency } from '../entities/payment.entity';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for creating a new payment
 * Contains all required fields for payment creation
 */
export class CreatePaymentDto {
  /**
   * The ID of the booking this payment is associated with
   */
  @ApiProperty({ description: 'The ID of the booking associated with this payment' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
    bookingId: number;

  /**
   * The amount of the payment in USD
   */
  @ApiProperty({ description: 'The amount of the payment in USD' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
    amount: number;

  @ApiProperty({ description: 'The payment method used', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().replace(/\s+/g, '_');
    }
    return value;
  })
    paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'The currency of the payment', enum: Currency })
  @IsNotEmpty()
  @IsEnum(Currency)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
    currency: Currency;

  @ApiProperty({ description: 'The transaction ID from the payment provider' })
  @IsOptional()
  @IsString()
    transactionId?: string;

  /**
   * The status of the payment
   * @default PaymentStatus.PENDING
   */
  @ApiProperty({ description: 'The status of the payment', enum: PaymentStatus })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
    status: PaymentStatus;

  /**
   * Optional description or notes about the payment
   */
  @ApiPropertyOptional({ description: 'The reason for the refund if applicable' })
  @IsOptional()
  @IsString()
    refundReason?: string;
}
