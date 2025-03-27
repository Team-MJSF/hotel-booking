import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

/**
 * Data Transfer Object for creating a new payment
 * Contains all required fields for payment creation
 */
export class CreatePaymentDto {
  /**
   * The ID of the booking this payment is associated with
   */
  @ApiProperty({ description: 'The ID of the booking this payment is associated with' })
  @IsNotEmpty()
  @IsNumber()
    bookingId: number;

  /**
   * The amount of the payment in the specified currency
   */
  @ApiProperty({ description: 'The amount of the payment in the specified currency' })
  @IsNotEmpty()
  @IsNumber()
    amount: number;

  /**
   * The currency code for the payment (e.g., 'USD', 'EUR')
   */
  @ApiProperty({ description: 'The currency code for the payment (e.g., USD, EUR)' })
  @IsNotEmpty()
  @IsString()
    currency: string;

  @ApiProperty({ description: 'Payment method used', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Transaction ID from payment provider' })
  @IsNotEmpty()
  @IsString()
    transactionId: string;

  /**
   * The status of the payment
   * @default PaymentStatus.PENDING
   */
  @ApiPropertyOptional({
    description: 'The status of the payment',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
    status: PaymentStatus;

  /**
   * Optional description or notes about the payment
   */
  @ApiPropertyOptional({ description: 'Optional description or notes about the payment' })
  @IsOptional()
  @IsString()
    description?: string;
}
