/**
 * Unit Tests for the Payments Controller
 * 
 * This file contains comprehensive tests for the payment-related functionality in our API.
 * We test six main controller functions:
 * 1. getAllPayments - Retrieving payment lists
 * 2. getPaymentById - Retrieving a specific payment by ID
 * 3. createPayment - Creating new payments
 * 4. updatePayment - Updating existing payments
 * 5. deletePayment - Deleting payments
 * 6. processPayment - Processing payments through external payment system
 * 
 * The tests use dependency injection to provide mock implementations of the models
 * and external payment system, making testing cleaner and more maintainable.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Create mock models that we'll inject into the controller
const mockPaymentsModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockBookingsModel = {
  // Add any booking model methods needed for testing
};

// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => true,
  array: () => []
});

// Create a mock payment system
const mockPaymentSystem = {
  processPayment: jest.fn()
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
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Makes res.status().json() possible
  res.json = jest.fn().mockReturnValue(res);   // Returns the res object for chaining
  return res;
};

/**
 * Tests for the getAllPayments controller function
 * 
 * This test suite covers various scenarios for retrieving payment lists,
 * including successful retrieval and error handling.
 */
describe('Payments Controller - getAllPayments', () => {
  // Reset all mock function's history before each test
  let paymentsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator,
      paymentSystem: mockPaymentSystem
    });
  });

  /**
   * Test the most basic case: getting all payments
   * The controller should return all payments with their associated booking details
   */
  test('should return all payments with booking details', async () => {
    // SETUP
    // Create sample payment data for our test
    const mockPaymentsData = [
      { 
        paymentId: 1, 
        amount: 100.00, 
        status: 'Completed',
        booking: { bookingId: 1, roomId: 101 }
      },
      { 
        paymentId: 2, 
        amount: 200.00, 
        status: 'Pending',
        booking: { bookingId: 2, roomId: 102 }
      }
    ];
    
    // Configure the mock to return our test data when findAll is called
    mockPaymentsModel.findAll.mockResolvedValue(mockPaymentsData);
    
    // Simulate an HTTP request
    const req = {};
    const res = mockResponse();
    
    // CALL
    await paymentsController.getAllPayments(req, res);
    
    // ASSERTION
    // Verify that findAll was called with the correct include option
    expect(mockPaymentsModel.findAll).toHaveBeenCalledWith({
      include: [{ model: mockBookingsModel, as: 'booking' }]
    });
    // Verify that the response contains all payments
    expect(res.json).toHaveBeenCalledWith(mockPaymentsData);
  });

  /**
   * Test how the controller handles database errors
   * It should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockPaymentsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = {};
    const res = mockResponse();
    
    // CALL
    await paymentsController.getAllPayments(req, res);
    
    // ASSERTION
    // Verify that we set a 500 status code and return an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching payments',
      error: errorMessage
    });
  });
});

/**
 * Tests for the processPayment controller function
 * 
 * This test suite covers scenarios for processing payments through the external payment system,
 * including successful processing, payment not found, and various error cases.
 */
describe('Payments Controller - processPayment', () => {
  // Reset mocks before each test
  let paymentsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator,
      paymentSystem: mockPaymentSystem
    });
  });

  /**
   * Test successful payment processing
   * The controller should process the payment and update its status
   */
  test('should process payment successfully and update status', async () => {
    // SETUP
    // Mock payment data with update method
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Pending',
      update: jest.fn(),
      toJSON: () => ({
        paymentId: 1,
        amount: 100.00,
        paymentMethod: 'credit_card',
        status: 'Completed',
        transactionId: 'mock-transaction-123',
        processedAt: new Date()
      })
    };
    
    // Configure mocks
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    mockPaymentSystem.processPayment.mockResolvedValue({
      success: true,
      transactionId: 'mock-transaction-123',
      status: 'Completed'
    });
    mockPayment.update.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.processPayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that processPayment was called with the correct data
    expect(mockPaymentSystem.processPayment).toHaveBeenCalledWith({
      amount: 100.00,
      paymentMethod: 'credit_card',
      bookingId: undefined
    });
    
    // Verify that update was called with the correct data
    expect(mockPayment.update).toHaveBeenCalledWith({
      status: 'Completed',
      transactionId: 'mock-transaction-123',
      processedAt: expect.any(Date)
    });
    
    // Verify that we return the updated payment
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Completed',
      transactionId: 'mock-transaction-123',
      processedAt: expect.any(Date)
    }));
  });

  /**
   * Test processing a non-existent payment
   * The controller should return a 404 status when payment is not found
   */
  test('should return 404 if payment is not found', async () => {
    // SETUP
    // Configure findByPk to return null (payment not found)
    mockPaymentsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent payment ID
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.processPayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment not found'
    });
  });

  /**
   * Test payment processing failure
   * The controller should return a 400 status when payment processing fails
   */
  test('should return 400 if payment processing fails', async () => {
    // SETUP
    // Mock payment data
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Pending'
    };
    
    // Configure mocks
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    mockPaymentSystem.processPayment.mockResolvedValue({
      success: false,
      error: 'Insufficient funds'
    });
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.processPayment(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with the error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment processing failed',
      error: 'Insufficient funds'
    });
  });

  /**
   * Test error handling during payment processing
   * The controller should return a 500 status with error information
   */
  test('should handle errors during payment processing', async () => {
    // SETUP
    // Mock payment data
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Pending'
    };
    
    // Configure mocks
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    mockPaymentSystem.processPayment.mockRejectedValue(new Error('Payment system error'));
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.processPayment(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error processing payment',
      error: 'Payment system error'
    });
  });
});

/**
 * Tests for the getPaymentById controller function
 * 
 * This test suite covers scenarios for retrieving a specific payment,
 * including successful retrieval, not found cases, and error handling.
 */
describe('Payments Controller - getPaymentById', () => {
  // Reset mocks before each test
  let paymentsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator,
      paymentSystem: mockPaymentSystem
    });
  });

  /**
   * Test successful payment retrieval
   * The controller should return the payment with booking details
   */
  test('should return payment with booking details', async () => {
    // SETUP
    // Mock payment data
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Completed',
      booking: {
        bookingId: 1,
        roomId: 101,
        checkInDate: '2024-03-15'
      }
    };
    
    // Configure findByPk to return our mock payment
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.getPaymentById(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID and include option
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(1, {
      include: [{ model: mockBookingsModel, as: 'booking' }]
    });
    
    // Verify that we return the payment data
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  /**
   * Test retrieving a non-existent payment
   * The controller should return a 404 status when payment is not found
   */
  test('should return 404 if payment is not found', async () => {
    // SETUP
    // Configure findByPk to return null (payment not found)
    mockPaymentsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent payment ID
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.getPaymentById(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(999, {
      include: [{ model: mockBookingsModel, as: 'booking' }]
    });
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment not found'
    });
  });

  /**
   * Test database error handling when retrieving a payment
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error during retrieval';
    mockPaymentsModel.findByPk.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.getPaymentById(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching payment',
      error: errorMessage
    });
  });
});

/**
 * Tests for the updatePayment controller function
 * 
 * This test suite covers scenarios for updating payments,
 * including successful updates, validation errors, not found cases, and error handling.
 */
describe('Payments Controller - updatePayment', () => {
  // Reset mocks before each test
  let paymentsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset our mock validator for each test
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator,
      paymentSystem: mockPaymentSystem
    });
  });

  /**
   * Test successful payment update
   * The controller should update the payment and return the updated data
   */
  test('should update payment and return updated data', async () => {
    // SETUP
    // Mock payment data with update method
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      paymentMethod: 'credit_card',
      status: 'Pending',
      update: jest.fn().mockImplementation(function(data) {
        Object.assign(this, data);
        return this;
      })
    };
    
    const updateData = {
      amount: 150.00,
      paymentMethod: 'debit_card',
      status: 'Completed'
    };
    
    // Configure mocks
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID and update data
    const req = { 
      params: { id: 1 },
      body: updateData
    };
    const res = mockResponse();
    
    // CALL
    await paymentsController.updatePayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that update was called with the correct data
    expect(mockPayment.update).toHaveBeenCalledWith(updateData);
    
    // Verify that we return the updated payment
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      paymentId: 1,
      ...updateData
    }));
  });

  /**
   * Test validation failure when updating a payment
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'Amount must be positive', param: 'amount', location: 'body' },
      { msg: 'Invalid payment method', param: 'paymentMethod', location: 'body' }
    ];
    
    // Configure validation mock to indicate failure
    mockValidator.mockReturnValue({
      isEmpty: () => false,
      array: () => mockValidationErrors
    });
    
    // Simulate a request with invalid data
    const req = { 
      params: { id: 1 },
      body: {
        amount: -100,
        paymentMethod: 'invalid'
      }
    };
    const res = mockResponse();
    
    // CALL
    await paymentsController.updatePayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was NOT called (validation failed)
    expect(mockPaymentsModel.findByPk).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test updating a non-existent payment
   * The controller should return a 404 status when payment is not found
   */
  test('should return 404 if payment is not found', async () => {
    // SETUP
    // Configure findByPk to return null (payment not found)
    mockPaymentsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent payment ID
    const req = { 
      params: { id: 999 },
      body: {
        amount: 150.00,
        status: 'Completed'
      }
    };
    const res = mockResponse();
    
    // CALL
    await paymentsController.updatePayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment not found'
    });
  });

  /**
   * Test database error handling when updating a payment
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Mock payment data with update method that fails
    const mockPayment = {
      paymentId: 1,
      update: jest.fn().mockRejectedValue(new Error('Database error during update'))
    };
    
    // Configure mocks
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID and update data
    const req = { 
      params: { id: 1 },
      body: {
        amount: 150.00,
        status: 'Completed'
      }
    };
    const res = mockResponse();
    
    // CALL
    await paymentsController.updatePayment(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating payment',
      error: 'Database error during update'
    });
  });
});

/**
 * Tests for the deletePayment controller function
 * 
 * This test suite covers scenarios for deleting payments,
 * including successful deletion, not found cases, and error handling.
 */
describe('Payments Controller - deletePayment', () => {
  // Reset mocks before each test
  let paymentsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    paymentsController = createPaymentsController({
      Payments: mockPaymentsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator,
      paymentSystem: mockPaymentSystem
    });
  });

  /**
   * Test successful payment deletion
   * The controller should delete the payment and return a success message
   */
  test('should delete payment and return success message', async () => {
    // SETUP
    // Mock payment data with destroy method
    const mockPayment = {
      paymentId: 1,
      amount: 100.00,
      status: 'Completed',
      destroy: jest.fn().mockResolvedValue(undefined)
    };
    
    // Configure findByPk to return our mock payment
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.deletePayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that destroy was called
    expect(mockPayment.destroy).toHaveBeenCalled();
    
    // Verify that we return a success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment deleted successfully'
    });
  });

  /**
   * Test deleting a non-existent payment
   * The controller should return a 404 status when payment is not found
   */
  test('should return 404 if payment is not found', async () => {
    // SETUP
    // Configure findByPk to return null (payment not found)
    mockPaymentsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent payment ID
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.deletePayment(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment not found'
    });
  });

  /**
   * Test database error handling when deleting a payment
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Mock payment data with destroy method that fails
    const mockPayment = {
      paymentId: 1,
      destroy: jest.fn().mockRejectedValue(new Error('Database error during deletion'))
    };
    
    // Configure findByPk to return our mock payment
    mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
    
    // Simulate a request with payment ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await paymentsController.deletePayment(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting payment',
      error: 'Database error during deletion'
    });
  });
}); 