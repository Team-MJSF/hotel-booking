/**
 * Unit Tests for the Payments Controller
 * 
 * This file contains comprehensive tests for the payment-related functionality in our API.
 * We test six main controller functions:
 * 1. getAllPayments - Retrieving payment lists
 * 2. getPaymentById - Retrieving a specific payment by ID
 * 3. createPayment - Creating new payments (to be implemented by teammate)
 * 4. updatePayment - Updating existing payments
 * 5. deletePayment - Deleting payments
 * 6. processPayment - Processing payments through external payment system
 * 
 * The tests use dependency injection to provide mock implementations of the models
 * and external payment system, making testing cleaner and more maintainable.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import type { ValidationError } from 'express-validator';
import type { PaymentAttributes, PaymentCreationAttributes } from '../../models/Payments.js';
import type { BookingAttributes } from '../../models/Bookings.js';
import type { PaymentMethod, PaymentStatus } from '../../controllers/payments.controller.js';

// Define more specific types for our mock functions
type UpdateFn = (data: Partial<PaymentAttributes>) => Promise<void>;
type DestroyFn = () => Promise<void>;

interface MockPayment extends Partial<PaymentAttributes> {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: Date;
  booking?: MockBooking;
  update?: jest.MockedFunction<UpdateFn>;
  destroy?: jest.MockedFunction<DestroyFn>;
  toJSON?: () => Partial<PaymentAttributes>;
}

interface MockBooking extends Partial<BookingAttributes> {
  bookingId: number;
  roomId: number;
}

interface PaymentSystemResponse {
  success: boolean;
  transactionId?: string;
  status?: PaymentStatus;
  error?: string;
}

interface PaymentSystem {
  processPayment: (paymentData: {
    amount: number;
    paymentMethod: PaymentMethod;
    bookingId: number;
  }) => Promise<PaymentSystemResponse>;
}

// Create mock models that we'll inject into the controller
const mockPaymentsModel = {
  findAll: jest.fn() as jest.MockedFunction<() => Promise<MockPayment[]>>,
  findByPk: jest.fn() as jest.MockedFunction<(id: string, options?: any) => Promise<MockPayment | null>>,
  create: jest.fn() as jest.MockedFunction<(data: PaymentCreationAttributes) => Promise<MockPayment>>,
  update: jest.fn() as jest.MockedFunction<(data: Partial<PaymentAttributes>) => Promise<void>>,
  destroy: jest.fn() as jest.MockedFunction<() => Promise<void>>
};

const mockBookingsModel = {
  findAll: jest.fn() as jest.MockedFunction<() => Promise<MockBooking[]>>,
  findByPk: jest.fn() as jest.MockedFunction<(id: string, options?: any) => Promise<MockBooking | null>>
};

// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => true,
  array: () => []
});

// Create mock payment system with proper typing
const mockPaymentSystem: PaymentSystem = {
  // @ts-expect-error - Jest mock typing issue with async functions
  processPayment: jest.fn().mockImplementation(async () => ({
    success: true,
    transactionId: 'mock-transaction-123',
    status: 'Completed' as PaymentStatus
  }))
};

// Import the controller factory
import { createPaymentsController } from '../../controllers/payments.controller.js';

/**
 * Helper function to create a mock response object
 * This simulates Express.js response object with common methods:
 * - status(): Sets HTTP status code
 * - json(): Sends JSON response
 * 
 * Both methods use Jest's mockReturnValue to make them chainable like the real Express methods
 */
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res;
};

/**
 * Tests for the getAllPayments controller function
 * 
 * This test suite covers various scenarios for retrieving payment lists,
 * including successful retrieval and error handling.
 */
describe('Payments Controller - getAllPayments', () => {
  let paymentsController: ReturnType<typeof createPaymentsController>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any,
      paymentSystem: mockPaymentSystem
    });
  });

  test('should return all payments with booking details', async () => {
    // SETUP
    const mockPaymentsData: MockPayment[] = [
      { 
        paymentId: 1, 
        bookingId: 1,
        amount: 100.00, 
        status: 'Completed',
        paymentMethod: 'Credit Card',
        paymentDate: new Date(),
        booking: { bookingId: 1, roomId: 101 } as MockBooking
      },
      { 
        paymentId: 2, 
        bookingId: 2,
        amount: 200.00, 
        status: 'Pending',
        paymentMethod: 'PayPal',
        paymentDate: new Date(),
        booking: { bookingId: 2, roomId: 102 } as MockBooking
      }
    ];
    
    mockPaymentsModel.findAll.mockResolvedValueOnce(mockPaymentsData);
    
    const req = {} as Request;
    const res = mockResponse();
    
    // CALL
    await paymentsController.getAllPayments(req, res as Response);
    
    // ASSERTION
    expect(mockPaymentsModel.findAll).toHaveBeenCalledWith({
      include: [{ model: mockBookingsModel, as: 'booking' }]
    });
    expect(res.json).toHaveBeenCalledWith(mockPaymentsData);
  });

  test('should handle errors and return 500 status', async () => {
    // SETUP
    const errorMessage = 'Database error';
    mockPaymentsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = {} as Request;
    const res = mockResponse();
    
    // CALL
    await paymentsController.getAllPayments(req, res as Response);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching payments',
      error: errorMessage
    });
  });
});

/**
 * Tests for the getPaymentById controller function
 */
describe('Payments Controller - getPaymentById', () => {
  let paymentsController: ReturnType<typeof createPaymentsController>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any,
      paymentSystem: mockPaymentSystem
    });
  });

  test('should return payment with booking details when found', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      status: 'Completed',
      paymentMethod: 'Credit Card',
      paymentDate: new Date(),
      booking: { bookingId: 1, roomId: 101 } as MockBooking
    };

    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.getPaymentById(req, res as Response);

    // ASSERTION
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1', {
      include: [{ model: mockBookingsModel, as: 'booking' }]
    });
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  test('should return 404 when payment is not found', async () => {
    // SETUP
    mockPaymentsModel.findByPk.mockResolvedValue(null);

    const req = { params: { id: '999' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.getPaymentById(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
  });
});

/**
 * Tests for the updatePayment controller function
 */
describe('Payments Controller - updatePayment', () => {
  let paymentsController: ReturnType<typeof createPaymentsController>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any,
      paymentSystem: mockPaymentSystem
    });
  });

  test('should update payment successfully', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      paymentMethod: 'Credit Card',
      status: 'Pending',
      paymentDate: new Date(),
      update: jest.fn() as jest.MockedFunction<UpdateFn>
    };

    const updateData = {
      amount: 150.00,
      paymentMethod: 'PayPal' as PaymentMethod,
      status: 'Completed' as PaymentStatus
    };

    mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
    mockPayment.update?.mockResolvedValueOnce(undefined);

    const req = {
      params: { id: '1' },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.updatePayment(req, res as Response);

    // ASSERTION
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1');
    expect(mockPayment.update).toHaveBeenCalledWith(updateData);
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  test('should return 404 when payment to update is not found', async () => {
    // SETUP
    mockPaymentsModel.findByPk.mockResolvedValueOnce(null);

    const req = {
      params: { id: '999' },
      body: { amount: 150.00 }
    } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.updatePayment(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
  });

  test('should handle validation errors', async () => {
    // SETUP
    const validationErrors = [{ msg: 'Invalid amount' }];
    mockValidator.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => validationErrors
    });

    const req = {
      params: { id: '1' },
      body: { amount: -100 }
    } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.updatePayment(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
  });
});

/**
 * Tests for the deletePayment controller function
 */
describe('Payments Controller - deletePayment', () => {
  let paymentsController: ReturnType<typeof createPaymentsController>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any,
      paymentSystem: mockPaymentSystem
    });
  });

  test('should delete payment successfully', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      paymentMethod: 'Credit Card',
      status: 'Completed',
      paymentDate: new Date(),
      destroy: jest.fn() as jest.MockedFunction<DestroyFn>
    };

    mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
    mockPayment.destroy?.mockResolvedValueOnce(undefined);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.deletePayment(req, res as Response);

    // ASSERTION
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1');
    expect(mockPayment.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Payment deleted successfully' });
  });

  test('should return 404 when payment to delete is not found', async () => {
    // SETUP
    mockPaymentsModel.findByPk.mockResolvedValueOnce(null);

    const req = { params: { id: '999' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.deletePayment(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
  });

  test('should handle deletion errors', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      paymentMethod: 'Credit Card',
      status: 'Completed',
      paymentDate: new Date(),
      destroy: jest.fn() as jest.MockedFunction<DestroyFn>
    };

    const errorMessage = 'Database error';
    mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
    mockPayment.destroy?.mockRejectedValueOnce(new Error(errorMessage));

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.deletePayment(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting payment',
      error: errorMessage
    });
  });
});

/**
 * Tests for the processPayment controller function
 */
describe('Payments Controller - processPayment', () => {
  let paymentsController: ReturnType<typeof createPaymentsController>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any,
      paymentSystem: mockPaymentSystem
    });
  });

  test('should process payment successfully', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      paymentMethod: 'Credit Card',
      status: 'Pending',
      paymentDate: new Date(),
      update: jest.fn() as jest.MockedFunction<UpdateFn>,
      toJSON: () => ({
        paymentId: 1,
        bookingId: 1,
        amount: 100.00,
        paymentMethod: 'Credit Card',
        status: 'Completed',
        transactionId: 'mock-transaction-123',
        processedAt: new Date()
      })
    };

    const paymentResponse: PaymentSystemResponse = {
      success: true,
      transactionId: 'mock-transaction-123',
      status: 'Completed'
    };

    mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
    // @ts-expect-error - Jest mock typing issue with mockResolvedValueOnce
    mockPaymentSystem.processPayment.mockResolvedValueOnce(paymentResponse);
    mockPayment.update?.mockResolvedValueOnce(undefined);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.processPayment(req, res as Response);

    // ASSERTION
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1');
    expect(mockPaymentSystem.processPayment).toHaveBeenCalledWith({
      amount: 100.00,
      paymentMethod: 'Credit Card',
      bookingId: 1
    });
    expect(mockPayment.update).toHaveBeenCalledWith({
      status: 'Completed',
      transactionId: 'mock-transaction-123',
      processedAt: expect.any(Date)
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      paymentId: 1,
      status: 'Completed',
      transactionId: 'mock-transaction-123'
    }));
  });

  test('should handle payment processing failure', async () => {
    // SETUP
    const mockPayment: MockPayment = {
      paymentId: 1,
      bookingId: 1,
      amount: 100.00,
      paymentMethod: 'Credit Card',
      status: 'Pending',
      paymentDate: new Date()
    };

    const paymentResponse: PaymentSystemResponse = {
      success: false,
      error: 'Payment declined'
    };

    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    // @ts-expect-error - Jest mock typing issue with mockResolvedValue
    mockPaymentSystem.processPayment.mockResolvedValue(paymentResponse);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    // CALL
    await paymentsController.processPayment(req, res as Response);

    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment processing failed',
      error: 'Payment declined'
    });
  });
});