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
// Create mock models that we'll inject into the controller
const mockPaymentsModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};
const mockBookingsModel = {
    findAll: jest.fn(),
    findByPk: jest.fn()
};
// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
    isEmpty: () => true,
    array: () => []
});
// Create mock payment system with proper typing
const mockPaymentSystem = {
    // @ts-expect-error - Jest mock typing issue with async functions
    processPayment: jest.fn().mockImplementation(async () => ({
        success: true,
        transactionId: 'mock-transaction-123',
        status: 'Completed'
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
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
/**
 * Tests for the getAllPayments controller function
 *
 * This test suite covers various scenarios for retrieving payment lists,
 * including successful retrieval and error handling.
 */
describe('Payments Controller - getAllPayments', () => {
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
    test('should return all payments with booking details', async () => {
        // SETUP
        const mockPaymentsData = [
            {
                paymentId: 1,
                bookingId: 1,
                amount: 100.00,
                status: 'Completed',
                paymentMethod: 'Credit Card',
                paymentDate: new Date(),
                booking: { bookingId: 1, roomId: 101 }
            },
            {
                paymentId: 2,
                bookingId: 2,
                amount: 200.00,
                status: 'Pending',
                paymentMethod: 'PayPal',
                paymentDate: new Date(),
                booking: { bookingId: 2, roomId: 102 }
            }
        ];
        mockPaymentsModel.findAll.mockResolvedValueOnce(mockPaymentsData);
        const req = {};
        const res = mockResponse();
        // CALL
        await paymentsController.getAllPayments(req, res);
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
        const req = {};
        const res = mockResponse();
        // CALL
        await paymentsController.getAllPayments(req, res);
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
    let paymentsController;
    beforeEach(() => {
        jest.clearAllMocks();
        paymentsController = createPaymentsController({
            Payments: mockPaymentsModel,
            Bookings: mockBookingsModel,
            validator: mockValidator,
            paymentSystem: mockPaymentSystem
        });
    });
    test('should return payment with booking details when found', async () => {
        // SETUP
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            status: 'Completed',
            paymentMethod: 'Credit Card',
            paymentDate: new Date(),
            booking: { bookingId: 1, roomId: 101 }
        };
        mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        // CALL
        await paymentsController.getPaymentById(req, res);
        // ASSERTION
        expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1', {
            include: [{ model: mockBookingsModel, as: 'booking' }]
        });
        expect(res.json).toHaveBeenCalledWith(mockPayment);
    });
    test('should return 404 when payment is not found', async () => {
        // SETUP
        mockPaymentsModel.findByPk.mockResolvedValue(null);
        const req = { params: { id: '999' } };
        const res = mockResponse();
        // CALL
        await paymentsController.getPaymentById(req, res);
        // ASSERTION
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
    });
});
/**
 * Tests for the updatePayment controller function
 */
describe('Payments Controller - updatePayment', () => {
    let paymentsController;
    beforeEach(() => {
        jest.clearAllMocks();
        paymentsController = createPaymentsController({
            Payments: mockPaymentsModel,
            Bookings: mockBookingsModel,
            validator: mockValidator,
            paymentSystem: mockPaymentSystem
        });
    });
    test('should update payment successfully', async () => {
        // SETUP
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            paymentMethod: 'Credit Card',
            status: 'Pending',
            paymentDate: new Date(),
            update: jest.fn()
        };
        const updateData = {
            amount: 150.00,
            paymentMethod: 'PayPal',
            status: 'Completed'
        };
        mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
        mockPayment.update?.mockResolvedValueOnce(undefined);
        const req = {
            params: { id: '1' },
            body: updateData
        };
        const res = mockResponse();
        // CALL
        await paymentsController.updatePayment(req, res);
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
        };
        const res = mockResponse();
        // CALL
        await paymentsController.updatePayment(req, res);
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
        };
        const res = mockResponse();
        // CALL
        await paymentsController.updatePayment(req, res);
        // ASSERTION
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
    });
});
/**
 * Tests for the deletePayment controller function
 */
describe('Payments Controller - deletePayment', () => {
    let paymentsController;
    beforeEach(() => {
        jest.clearAllMocks();
        paymentsController = createPaymentsController({
            Payments: mockPaymentsModel,
            Bookings: mockBookingsModel,
            validator: mockValidator,
            paymentSystem: mockPaymentSystem
        });
    });
    test('should delete payment successfully', async () => {
        // SETUP
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            paymentMethod: 'Credit Card',
            status: 'Completed',
            paymentDate: new Date(),
            destroy: jest.fn()
        };
        mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
        mockPayment.destroy?.mockResolvedValueOnce(undefined);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        // CALL
        await paymentsController.deletePayment(req, res);
        // ASSERTION
        expect(mockPaymentsModel.findByPk).toHaveBeenCalledWith('1');
        expect(mockPayment.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Payment deleted successfully' });
    });
    test('should return 404 when payment to delete is not found', async () => {
        // SETUP
        mockPaymentsModel.findByPk.mockResolvedValueOnce(null);
        const req = { params: { id: '999' } };
        const res = mockResponse();
        // CALL
        await paymentsController.deletePayment(req, res);
        // ASSERTION
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
    });
    test('should handle deletion errors', async () => {
        // SETUP
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            paymentMethod: 'Credit Card',
            status: 'Completed',
            paymentDate: new Date(),
            destroy: jest.fn()
        };
        const errorMessage = 'Database error';
        mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
        mockPayment.destroy?.mockRejectedValueOnce(new Error(errorMessage));
        const req = { params: { id: '1' } };
        const res = mockResponse();
        // CALL
        await paymentsController.deletePayment(req, res);
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
    let paymentsController;
    beforeEach(() => {
        jest.clearAllMocks();
        paymentsController = createPaymentsController({
            Payments: mockPaymentsModel,
            Bookings: mockBookingsModel,
            validator: mockValidator,
            paymentSystem: mockPaymentSystem
        });
    });
    test('should process payment successfully', async () => {
        // SETUP
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            paymentMethod: 'Credit Card',
            status: 'Pending',
            paymentDate: new Date(),
            update: jest.fn(),
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
        const paymentResponse = {
            success: true,
            transactionId: 'mock-transaction-123',
            status: 'Completed'
        };
        mockPaymentsModel.findByPk.mockResolvedValueOnce(mockPayment);
        // @ts-expect-error - Jest mock typing issue with mockResolvedValueOnce
        mockPaymentSystem.processPayment.mockResolvedValueOnce(paymentResponse);
        mockPayment.update?.mockResolvedValueOnce(undefined);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        // CALL
        await paymentsController.processPayment(req, res);
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
        const mockPayment = {
            paymentId: 1,
            bookingId: 1,
            amount: 100.00,
            paymentMethod: 'Credit Card',
            status: 'Pending',
            paymentDate: new Date()
        };
        const paymentResponse = {
            success: false,
            error: 'Payment declined'
        };
        mockPaymentsModel.findByPk.mockResolvedValue(mockPayment);
        // @ts-expect-error - Jest mock typing issue with mockResolvedValue
        mockPaymentSystem.processPayment.mockResolvedValue(paymentResponse);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        // CALL
        await paymentsController.processPayment(req, res);
        // ASSERTION
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Payment processing failed',
            error: 'Payment declined'
        });
    });
});
