import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResourceNotFoundException, DatabaseException, PaymentProcessingException } from '../common/exceptions/hotel-booking.exception';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  /**
   * Retrieves all payments from the database
   * @returns Promise<Payment[]> Array of all payments with their related bookings
   */
  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentsRepository.find({
        relations: ['booking'],
      });
    } catch (error) {
      throw new DatabaseException('Failed to fetch payments', error as Error);
    }
  }

  /**
   * Retrieves a single payment by ID
   * @param id - The ID of the payment to retrieve
   * @returns Promise<Payment> The payment with the specified ID
   * @throws ResourceNotFoundException if payment is not found
   */
  async findOne(id: number): Promise<Payment> {
    try {
      const payment = await this.paymentsRepository.findOne({
        where: { id },
        relations: ['booking'],
      });

      if (!payment) {
        throw new ResourceNotFoundException('Payment', id);
      }

      return payment;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to fetch payment', error as Error);
    }
  }

  /**
   * Creates a new payment
   * @param createPaymentDto - The data for creating a new payment
   * @returns Promise<Payment> The newly created payment
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentsRepository.create(createPaymentDto);
      return await this.paymentsRepository.save(payment);
    } catch (error) {
      throw new DatabaseException('Failed to create payment', error as Error);
    }
  }

  /**
   * Updates an existing payment
   * @param id - The ID of the payment to update
   * @param updatePaymentDto - The data to update the payment with
   * @returns Promise<Payment> The updated payment
   * @throws ResourceNotFoundException if payment is not found
   */
  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    try {
      const result = await this.paymentsRepository.update(id, updatePaymentDto);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('Payment', id);
      }
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to update payment', error as Error);
    }
  }

  /**
   * Removes a payment from the database
   * @param id - The ID of the payment to remove
   * @returns Promise<void>
   * @throws ResourceNotFoundException if payment is not found
   */
  async remove(id: number): Promise<void> {
    try {
      const result = await this.paymentsRepository.delete(id);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('Payment', id);
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete payment', error as Error);
    }
  }

  /**
   * Retrieves all payments for a specific booking
   * @param bookingId - The ID of the booking to get payments for
   * @returns Promise<Payment[]> Array of payments for the specified booking
   */
  async findByBookingId(bookingId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { booking: { bookingId } },
      relations: ['booking'],
    });
  }

  /**
   * Processes a refund for a payment
   * @param id - The ID of the payment to refund
   * @param refundReason - The reason for the refund
   * @returns Promise<Payment> The updated payment with refund status
   * @throws ResourceNotFoundException if payment is not found
   * @throws PaymentProcessingException if refund processing fails
   */
  async processRefund(id: number, refundReason: string): Promise<Payment> {
    try {
      const payment = await this.findOne(id);
      
      // Add your refund processing logic here
      // For example, calling a payment gateway API
      
      payment.status = PaymentStatus.REFUNDED;
      payment.refundReason = refundReason;
      
      return await this.paymentsRepository.save(payment);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new PaymentProcessingException('Failed to process refund', error as Error);
    }
  }

  /**
   * Updates the status of a payment
   * @param id - The ID of the payment to update
   * @param status - The new status for the payment
   * @returns Promise<Payment> The updated payment with new status
   * @throws ResourceNotFoundException if payment is not found
   */
  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    return this.paymentsRepository.save(payment);
  }
}
