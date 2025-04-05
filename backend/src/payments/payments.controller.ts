import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod, Currency } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing payment operations
 * Provides endpoints for CRUD operations on payments and payment processing
 */
@ApiTags('Payments')
@ApiExtraModels(CreatePaymentDto, UpdatePaymentDto, Payment)
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Retrieves all payments
   * @returns Promise<Payment[]> Array of all payments
   */
  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Get all payments', 
    description: 'Retrieves a list of all payments in the system. This endpoint is useful for administrators to monitor payment activity. (Admin only)'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all payments',
    type: [Payment],
    content: {
      'application/json': {
        example: [
          {
            paymentId: 1,
            amount: 199.99,
            currency: 'USD',
            paymentMethod: 'credit_card',
            transactionId: 'txn_1K2OnjCZ6qsJgndJQbEGy95K',
            status: 'completed',
            refundReason: null,
            booking: {
              bookingId: 101,
              status: 'confirmed'
            },
            createdAt: '2023-06-15T08:30:00Z',
            updatedAt: '2023-06-15T08:35:00Z'
          },
          {
            paymentId: 2,
            amount: 349.50,
            currency: 'USD',
            paymentMethod: 'debit_card',
            transactionId: 'txn_1K2PcvCZ6qsJgndJ7bAs95Ln',
            status: 'pending',
            refundReason: null,
            booking: {
              bookingId: 102,
              status: 'pending'
            },
            createdAt: '2023-06-16T14:20:00Z',
            updatedAt: '2023-06-16T14:20:00Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  /**
   * Retrieves a single payment by ID
   * @param id - The ID of the payment to retrieve
   * @returns Promise<Payment> The payment with the specified ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a payment by ID',
    description: 'Retrieves detailed information about a specific payment using its unique identifier.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The unique identifier of the payment',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 1,
          amount: 199.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_1K2OnjCZ6qsJgndJQbEGy95K',
          status: 'completed',
          refundReason: null,
          booking: {
            bookingId: 101,
            checkInDate: '2023-07-15T14:00:00Z',
            checkOutDate: '2023-07-20T11:00:00Z',
            numberOfGuests: 2,
            status: 'confirmed',
            totalAmount: 199.99,
            user: {
              id: 42,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            room: {
              id: 15,
              roomNumber: '301',
              type: 'deluxe'
            }
          },
          createdAt: '2023-06-15T08:30:00Z',
          updatedAt: '2023-06-15T08:35:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
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
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Create a new payment',
    description: 'Creates a new payment record for a booking. This endpoint processes payment information and associates it with the specified booking. (Admin only)'
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Payment creation data',
    examples: {
      creditCardPayment: {
        summary: 'Credit Card Payment',
        value: {
          bookingId: 101,
          amount: 199.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_1K2OnjCZ6qsJgndJQbEGy95K',
          status: 'completed'
        }
      },
      bankTransferPayment: {
        summary: 'Bank Transfer Payment',
        value: {
          bookingId: 102,
          amount: 349.50,
          currency: 'EUR',
          paymentMethod: 'bank_transfer',
          transactionId: 'bt_9876543210',
          status: 'pending'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 3,
          bookingId: 103,
          amount: 249.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_1K2QpjCZ6qsJgndJ3rTk95Mn',
          status: 'completed',
          refundReason: null,
          createdAt: '2023-06-17T10:25:00Z',
          updatedAt: '2023-06-17T10:25:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Payment already exists for this booking' })
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
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Update a payment',
    description: 'Updates the details of an existing payment. This can be used to modify payment information or status. (Admin only)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The unique identifier of the payment to update',
    example: 1
  })
  @ApiBody({
    type: UpdatePaymentDto,
    description: 'Payment update data',
    examples: {
      statusUpdate: {
        summary: 'Update payment status',
        value: {
          status: 'completed',
          transactionId: 'txn_updated_12345'
        }
      },
      refundUpdate: {
        summary: 'Update with refund information',
        value: {
          status: 'refunded',
          refundReason: 'Customer requested cancellation'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 1,
          amount: 199.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_updated_12345',
          status: 'completed',
          refundReason: null,
          booking: {
            bookingId: 101,
            status: 'confirmed'
          },
          createdAt: '2023-06-15T08:30:00Z',
          updatedAt: '2023-06-17T15:45:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
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
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Delete a payment',
    description: 'Removes a payment record from the system. This is typically used for administrative purposes or when correcting errors. (Admin only)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The unique identifier of the payment to delete',
    example: 1
  })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
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
  @ApiOperation({
    summary: 'Get payment by booking ID',
    description: 'Retrieves payment information associated with a specific booking. This is useful for checking payment status of a reservation.'
  })
  @ApiParam({ 
    name: 'bookingId', 
    description: 'The unique identifier of the booking',
    example: 101
  })
  @ApiResponse({
    status: 200,
    description: 'Payment for the booking retrieved successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 1,
          amount: 199.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_1K2OnjCZ6qsJgndJQbEGy95K',
          status: 'completed',
          refundReason: null,
          booking: {
            bookingId: 101,
            status: 'confirmed'
          },
          createdAt: '2023-06-15T08:30:00Z',
          updatedAt: '2023-06-15T08:35:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 404, description: 'Payment not found for the specified booking' })
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
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Process a refund for a payment',
    description: 'Initiates a refund process for an existing payment. This endpoint is used when a customer cancels their booking or requests a refund for other reasons. (Admin only)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The unique identifier of the payment to refund',
    example: 1
  })
  @ApiBody({
    description: 'Refund details',
    schema: { 
      properties: { 
        refundReason: { 
          type: 'string',
          description: 'The reason for the refund',
          example: 'Customer requested cancellation due to change of plans'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 1,
          amount: 199.99,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'txn_1K2OnjCZ6qsJgndJQbEGy95K',
          status: 'refunded',
          refundReason: 'Customer requested cancellation due to change of plans',
          booking: {
            bookingId: 101,
            status: 'cancelled'
          },
          createdAt: '2023-06-15T08:30:00Z',
          updatedAt: '2023-06-18T11:20:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input or payment cannot be refunded' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
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
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Update payment status',
    description: 'Updates the status of a payment. This is used to reflect changes in the payment lifecycle, such as when a pending payment is completed or when a payment fails. (Admin only)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The unique identifier of the payment',
    example: 1
  })
  @ApiBody({
    description: 'Payment status update',
    schema: { 
      properties: { 
        status: { 
          enum: Object.values(PaymentStatus),
          description: 'The new status for the payment',
          example: 'completed'
        }
      }
    },
    examples: {
      completed: {
        summary: 'Mark as completed',
        value: {
          status: 'completed'
        }
      },
      failed: {
        summary: 'Mark as failed',
        value: {
          status: 'failed'
        }
      },
      refunded: {
        summary: 'Mark as refunded',
        value: {
          status: 'refunded'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
    type: Payment,
    content: {
      'application/json': {
        example: {
          paymentId: 2,
          amount: 349.50,
          currency: 'USD',
          paymentMethod: 'debit_card',
          transactionId: 'txn_1K2PcvCZ6qsJgndJ7bAs95Ln',
          status: 'completed',
          refundReason: null,
          booking: {
            bookingId: 102,
            status: 'confirmed'
          },
          createdAt: '2023-06-16T14:20:00Z',
          updatedAt: '2023-06-18T09:15:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ): Promise<Payment> {
    return this.paymentsService.updatePaymentStatus(+id, status);
  }
}
