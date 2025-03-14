/**
 * Payment Controller Module
 * 
 * This module provides the business logic for all payment-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting payments, as well as processing payments
 * through an external payment system.
 * 
 * The controller implements payment management operations:
 * - Get all payments (with associated booking details)
 * - Get payment by ID
 * - Create new payment (with validation)
 * - Update existing payment
 * - Delete payment
 * - Process payment through external payment system
 * 
 * Error handling is implemented throughout with appropriate HTTP status codes.
 * 
 * This controller uses dependency injection for better testability and maintainability.
 */
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
 * @param {Object} deps - Dependencies to inject
 * @param {Object} deps.Payments - Payments model
 * @param {Object} deps.Bookings - Bookings model
 * @param {Function} deps.validator - Validation function (defaults to express-validator's validationResult)
 * @param {Object} deps.paymentSystem - External payment system service
 * @returns {Object} - Controller methods
 */
export const createPaymentsController = (deps = {}) => {
  // Use provided dependencies or defaults
  const {
    Payments = DefaultPayments,
    Bookings = DefaultBookings,
    validator = validationResult,
    paymentSystem = {
      processPayment: async (paymentData) => {
        // Default implementation that simulates payment processing
        return {
          success: true,
          transactionId: 'mock-transaction-' + Date.now(),
          status: 'completed'
        };
      }
    }
  } = deps;
  
  /**
   * Get all payments
   * 
   * Retrieves all payments from the database, including associated booking details.
   * 
   * @param {Object} request - Express request object
   * @param {Object} response - Express response object
   * @returns {JSON} - JSON array of payments with booking details
   */
  const getAllPayments = async (request, response) => {
    try {
      const payments = await Payments.findAll({
        include: [{ model: Bookings, as: 'booking' }]
      });
      response.json(payments);
    } catch (error) {
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
   * @param {Object} request - Express request object with payment ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - Payment data with booking details or error message
   */
  const getPaymentById = async (request, response) => {
    try {
      const payment = await Payments.findByPk(request.params.id, {
        include: [{ model: Bookings, as: 'booking' }]
      });
      
      if (!payment) {
        return response.status(404).json({ message: 'Payment not found' });
      }
      
      response.json(payment);
    } catch (error) {
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
   * @param {Object} request - Express request object with payment details in body
   * @param {Object} response - Express response object
   * @returns {JSON} - Created payment object or error message
   */
  const createPayment = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const newPayment = await Payments.create({
        bookingId: request.body.bookingId,
        amount: request.body.amount,
        paymentMethod: request.body.paymentMethod,
        status: request.body.status || 'Pending'
      });
      
      response.status(201).json(newPayment);
    } catch (error) {
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
   * @param {Object} request - Express request object with payment ID parameter and updated data
   * @param {Object} response - Express response object
   * @returns {JSON} - Updated payment object or error message
   */
  const updatePayment = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const payment = await Payments.findByPk(request.params.id);
      
      if (!payment) {
        return response.status(404).json({ message: 'Payment not found' });
      }

      await payment.update({
        bookingId: request.body.bookingId,
        amount: request.body.amount,
        paymentMethod: request.body.paymentMethod,
        status: request.body.status || payment.status
      });

      response.json(payment);
    } catch (error) {
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
   * @param {Object} request - Express request object with payment ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - Success message or error message
   */
  const deletePayment = async (request, response) => {
    try {
      const payment = await Payments.findByPk(request.params.id);
      
      if (!payment) {
        return response.status(404).json({ message: 'Payment not found' });
      }

      await payment.destroy();
      response.json({ message: 'Payment deleted successfully' });
    } catch (error) {
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
   * @param {Object} request - Express request object with payment details
   * @param {Object} response - Express response object
   * @returns {JSON} - Processed payment details or error message
   */
  const processPayment = async (request, response) => {
    try {
      const payment = await Payments.findByPk(request.params.id);
      
      if (!payment) {
        return response.status(404).json({ message: 'Payment not found' });
      }

      // Process payment through external system
      const result = await paymentSystem.processPayment({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        bookingId: payment.bookingId
      });

      if (!result.success) {
        return response.status(400).json({ 
          message: 'Payment processing failed', 
          error: result.error 
        });
      }

      // Update payment status and add transaction details
      await payment.update({
        status: result.status,
        transactionId: result.transactionId,
        processedAt: new Date()
      });

      // Return the JSON representation of the payment
      response.json(payment.toJSON());
    } catch (error) {
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
export const { 
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  processPayment
} = defaultController;