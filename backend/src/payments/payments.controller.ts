import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

/**
 * Controller for managing payment operations
 * Provides endpoints for CRUD operations on payments and payment processing
 */
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Retrieves all payments
   * @returns Promise<Payment[]> Array of all payments
   */
  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Return all payments',
    type: [Payment],
  })
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  /**
   * Retrieves all payments for a specific booking
   * @param bookingId - The ID of the booking to get payments for
   * @returns Promise<Payment[]> Array of payments for the specified booking
   */
  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payments by booking ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Return payments for the booking',
    type: [Payment],
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findByBookingId(@Param('bookingId') bookingId: string): Promise<Payment[]> {
    return this.paymentsService.findByBookingId(+bookingId);
  }

  /**
   * Retrieves a single payment by ID
   * @param id - The ID of the payment to retrieve
   * @returns Promise<Payment> The payment with the specified ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the payment',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.findOne(+id);
  }

  /**
   * Creates a new payment
   * @param createPaymentDto - The data for creating a new payment
   * @returns Promise<Payment> The newly created payment
   */
  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'The payment has been successfully created',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto);
  }

  /**
   * Updates an existing payment
   * @param id - The ID of the payment to update
   * @param updatePaymentDto - The data to update the payment with
   * @returns Promise<Payment> The updated payment
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'The payment has been successfully updated',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  /**
   * Removes a payment
   * @param id - The ID of the payment to remove
   * @returns Promise<void>
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'The payment has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.paymentsService.remove(+id);
  }

  /**
   * Processes a refund for a payment
   * @param id - The ID of the payment to refund
   * @param reason - The reason for the refund
   * @returns Promise<Payment> The updated payment with refund status
   */
  @Post(':id/refund')
  @ApiOperation({ summary: 'Process a refund for a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ schema: { properties: { refundReason: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'The refund has been successfully processed',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  processRefund(
    @Param('id') id: string,
    @Body('refundReason') refundReason: string,
  ): Promise<Payment> {
    return this.paymentsService.processRefund(+id, refundReason);
  }

  /**
   * Updates the status of a payment
   * @param id - The ID of the payment to update
   * @param status - The new status for the payment
   * @returns Promise<Payment> The updated payment with new status
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({
    schema: { properties: { status: { enum: Object.values(PaymentStatus) } } },
  })
  @ApiResponse({
    status: 200,
    description: 'The payment status has been successfully updated',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ): Promise<Payment> {
    return this.paymentsService.updatePaymentStatus(+id, status);
  }
}
