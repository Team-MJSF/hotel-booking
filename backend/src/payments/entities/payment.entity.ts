import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../../bookings/entities/booking.entity';
import { BaseEntity } from '../../common/entities/base.entity';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
@Index('IDX_PAYMENTS_BOOKING', ['booking'])
@Index('IDX_PAYMENTS_STATUS', ['status'])
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  @ApiProperty({ description: 'Unique identifier for the payment' })
  paymentId: number;

  @OneToOne(() => Booking, booking => booking.payment)
  @JoinColumn({ name: 'booking_id' })
  @ApiProperty({ 
    description: 'The booking associated with this payment',
    type: 'object',
    properties: {
      bookingId: { type: 'number' }
    }
  })
  booking: Booking;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The amount of the payment' })
  amount: number;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
  })
  @ApiProperty({
    description: 'The currency code for the payment',
    enum: Currency,
  })
  currency: Currency;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
  })
  @ApiProperty({ description: 'The method used for payment', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'transaction_id', nullable: true })
  @ApiProperty({ description: 'The transaction ID from the payment provider' })
  transactionId?: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
  })
  @ApiProperty({ description: 'The current status of the payment', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ name: 'refund_reason', nullable: true })
  @ApiProperty({ description: 'The reason for the refund if applicable', required: false })
  refundReason?: string;
}
