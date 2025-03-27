import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  /**
   * Retrieves all payments from the database
   * @returns Promise<Payment[]> Array of all payments with their related booking
   */
  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['booking'],
    });
  }

  /**
   * Retrieves a single payment by ID
   * @param id - The ID of the payment to retrieve
   * @returns Promise<Payment> The payment with the specified ID
   * @throws NotFoundException if payment is not found
   */
  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: id },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Creates a new payment
   * @param createPaymentDto - The data for creating a new payment
   * @returns Promise<Payment> The newly created payment
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      status: createPaymentDto.status || PaymentStatus.PENDING,
    });
    return this.paymentsRepository.save(payment);
  }

  /**
   * Updates an existing payment
   * @param id - The ID of the payment to update
   * @param updatePaymentDto - The data to update the payment with
   * @returns Promise<Payment> The updated payment
   * @throws NotFoundException if payment is not found
   */
  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  /**
   * Removes a payment from the database
   * @param id - The ID of the payment to remove
   * @returns Promise<void>
   * @throws NotFoundException if payment is not found
   */
  async remove(id: number): Promise<void> {
    const result = await this.paymentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
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
   * @param reason - The reason for the refund
   * @returns Promise<Payment> The updated payment with refund status
   * @throws NotFoundException if payment is not found
   */
  async processRefund(id: number, reason: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = PaymentStatus.REFUNDED;
    payment.refundReason = reason;
    return this.paymentsRepository.save(payment);
  }

  /**
   * Updates the status of a payment
   * @param id - The ID of the payment to update
   * @param status - The new status for the payment
   * @returns Promise<Payment> The updated payment with new status
   * @throws NotFoundException if payment is not found
   */
  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    return this.paymentsRepository.save(payment);
  }
}
