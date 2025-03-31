import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
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
    description: 'Returns all payments',
    type: [Payment],
  })
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  /**
   * Retrieves a single payment by ID
   * @param id - The ID of the payment to retrieve
   * @returns Promise<Payment> The payment with the specified ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the payment' })
  @ApiResponse({
    status: 200,
    description: 'Returns the payment',
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
    description: 'Payment created successfully',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Payment already exists for this booking' })
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
  @ApiParam({ name: 'id', description: 'The ID of the payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  /**
   * Removes a payment
   * @param id - The ID of the payment to remove
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'The ID of the payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.paymentsService.remove(+id);
  }

  /**
   * Retrieves all payments for a specific booking
   * @param bookingId - The ID of the booking to get payments for
   * @returns Promise<Payment> The payment for the specified booking
   */
  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payment by booking ID' })
  @ApiParam({ name: 'bookingId', description: 'The ID of the booking' })
  @ApiResponse({
    status: 200,
    description: 'Returns the payment for the booking',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findByBookingId(@Param('bookingId') bookingId: string): Promise<Payment> {
    return this.paymentsService.findByBookingId(+bookingId);
  }

  /**
   * Processes a refund for a payment
   * @param id - The ID of the payment to refund
   * @param reason - The reason for the refund
   * @returns Promise<Payment> The updated payment with refund status
   */
  @Post(':id/refund')
  @ApiOperation({ summary: 'Process a refund for a payment' })
  @ApiParam({ name: 'id', description: 'The ID of the payment' })
  @ApiBody({ schema: { properties: { refundReason: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
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
  @ApiParam({ name: 'id', description: 'The ID of the payment' })
  @ApiBody({
    schema: { properties: { status: { enum: Object.values(PaymentStatus) } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ): Promise<Payment> {
    return this.paymentsService.updatePaymentStatus(+id, status);
  }
}
