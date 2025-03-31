import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../../bookings/entities/booking.entity';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  @ApiProperty({ description: 'The unique identifier of the payment' })
    paymentId: number;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'booking_id' })
  @ApiProperty({ description: 'The booking associated with this payment' })
    booking: Booking;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The amount of the payment' })
    amount: number;

  @Column({ 
    name: 'currency', 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD 
  })
  @ApiProperty({ 
    description: 'The currency code for the payment',
    enum: Currency
  })
    currency: Currency;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CREDIT_CARD,
  })
  @ApiProperty({ description: 'The method used for payment', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

  @Column({ name: 'transaction_id', nullable: true })
  @ApiProperty({ description: 'The transaction ID from the payment provider' })
    transactionId?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @ApiProperty({ description: 'The current status of the payment', enum: PaymentStatus })
    status: PaymentStatus;

  @Column({ name: 'refund_reason', nullable: true })
  @ApiProperty({ description: 'The reason for the refund if applicable', required: false })
    refundReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The date when the payment was created' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The date when the payment was last updated' })
    updatedAt: Date;
}
