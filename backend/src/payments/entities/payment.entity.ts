import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @Column({ name: 'booking_id' })
  @ApiProperty({
    description: 'The ID of the booking associated with this payment',
  })
    bookingId: number;

  @Column('decimal', { name: 'amount', precision: 10, scale: 2 })
  @ApiProperty({ description: 'The amount of the payment' })
    amount: number;

  @Column({ name: 'currency' })
  @ApiProperty({ description: 'The currency of the payment' })
    currency: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CREDIT_CARD,
  })
  @ApiProperty({ description: 'The payment method used', enum: PaymentMethod })
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
  @ApiProperty({
    description: 'The status of the payment',
    enum: PaymentStatus,
  })
    status: PaymentStatus;

  @Column({ name: 'refund_reason', nullable: true })
  @ApiProperty({ description: 'The reason for the refund if applicable' })
    refundReason?: string;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'booking_id' })
  @ApiProperty({ description: 'The booking associated with this payment' })
    booking: Booking;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The date when the payment was created' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The date when the payment was last updated' })
    updatedAt: Date;
}
