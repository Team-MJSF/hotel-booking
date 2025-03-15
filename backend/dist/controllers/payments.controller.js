import { validationResult } from 'express-validator';
// Default model imports for backward compatibility
import DefaultPayments from '../models/Payments.js';
import DefaultBookings from '../models/Bookings.js';
/**
 * Create a Payment Controller factory
 *
 * This factory function creates payment controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 *
 * @param {ControllerDependencies} deps - Dependencies to inject
 * @returns {Object} - Controller methods
 */
export const createPaymentsController = (deps = {}) => {
    // Use provided dependencies or defaults
    const { Payments = DefaultPayments, Bookings = DefaultBookings, validator = validationResult, paymentSystem = {
        processPayment: async (paymentData) => {
            // Default implementation that simulates payment processing
            return {
                success: true,
                transactionId: 'mock-transaction-' + Date.now(),
                status: 'Completed'
            };
        }
    } } = deps;
    /**
     * Get all payments
     *
     * Retrieves all payments from the database, including associated booking details.
     *
     * @param {Request} request - Express request object
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - JSON array of payments with booking details
     */
    const getAllPayments = async (request, response) => {
        try {
            const payments = await Payments.findAll({
                include: [{ model: Bookings, as: 'booking' }]
            });
            response.json(payments);
        }
        catch (error) {
            response.status(500).json({
                message: 'Error fetching payments',
                error: error.message
            });
        }
    };
    /**
     * Get payment by ID
     *
     * Retrieves a specific payment by its ID, including associated booking details.
     *
     * @param {Request} request - Express request object with payment ID parameter
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Payment data with booking details or error message
     */
    const getPaymentById = async (request, response) => {
        try {
            const payment = await Payments.findByPk(request.params.id, {
                include: [{ model: Bookings, as: 'booking' }]
            });
            if (!payment) {
                response.status(404).json({ message: 'Payment not found' });
                return;
            }
            response.json(payment);
        }
        catch (error) {
            response.status(500).json({
                message: 'Error fetching payment',
                error: error.message
            });
        }
    };
    /**
     * Create new payment
     *
     * Creates a new payment in the database with the provided details.
     * Validates request data before processing.
     *
     * @param {Request} request - Express request object with payment details in body
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Created payment object or error message
     */
    const createPayment = async (request, response) => {
        // Validate request data using the injected validator
        const errors = validator(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const newPayment = await Payments.create({
                bookingId: request.body.bookingId,
                amount: request.body.amount,
                paymentMethod: request.body.paymentMethod,
                status: request.body.status || 'Pending',
                paymentDate: new Date()
            });
            response.status(201).json(newPayment);
        }
        catch (error) {
            response.status(500).json({
                message: 'Error creating payment',
                error: error.message
            });
        }
    };
    /**
     * Update payment
     *
     * Updates an existing payment's information in the database.
     * Validates request data before processing.
     *
     * @param {Request} request - Express request object with payment ID parameter and updated data
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Updated payment object or error message
     */
    const updatePayment = async (request, response) => {
        // Validate request data using the injected validator
        const errors = validator(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const payment = await Payments.findByPk(request.params.id);
            if (!payment) {
                response.status(404).json({ message: 'Payment not found' });
                return;
            }
            await payment.update({
                bookingId: request.body.bookingId,
                amount: request.body.amount,
                paymentMethod: request.body.paymentMethod,
                status: request.body.status || payment.status
            });
            response.json(payment);
        }
        catch (error) {
            response.status(500).json({
                message: 'Error updating payment',
                error: error.message
            });
        }
    };
    /**
     * Delete payment
     *
     * Removes a payment from the database by ID.
     *
     * @param {Request} request - Express request object with payment ID parameter
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Success message or error message
     */
    const deletePayment = async (request, response) => {
        try {
            const payment = await Payments.findByPk(request.params.id);
            if (!payment) {
                response.status(404).json({ message: 'Payment not found' });
                return;
            }
            await payment.destroy();
            response.json({ message: 'Payment deleted successfully' });
        }
        catch (error) {
            response.status(500).json({
                message: 'Error deleting payment',
                error: error.message
            });
        }
    };
    /**
     * Process payment through external payment system
     *
     * Processes a payment through the external payment system and updates the payment status.
     *
     * @param {Request} request - Express request object with payment details
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Processed payment details or error message
     */
    const processPayment = async (request, response) => {
        try {
            const payment = await Payments.findByPk(request.params.id);
            if (!payment) {
                response.status(404).json({ message: 'Payment not found' });
                return;
            }
            // Process payment through external system
            const result = await paymentSystem.processPayment({
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                bookingId: payment.bookingId
            });
            if (!result.success) {
                response.status(400).json({
                    message: 'Payment processing failed',
                    error: result.error
                });
                return;
            }
            // Update payment status and add transaction details
            await payment.update({
                status: result.status,
                transactionId: result.transactionId,
                processedAt: new Date()
            });
            // Return the JSON representation of the payment
            response.json(payment.toJSON());
        }
        catch (error) {
            response.status(500).json({
                message: 'Error processing payment',
                error: error.message
            });
        }
    };
    // Return all controller methods
    return {
        getAllPayments,
        getPaymentById,
        createPayment,
        updatePayment,
        deletePayment,
        processPayment
    };
};
// For backward compatibility, export pre-initialized controller methods
const defaultController = createPaymentsController();
export const { getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment, processPayment } = defaultController;
