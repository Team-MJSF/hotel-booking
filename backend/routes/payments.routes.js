/**
 * Payment Routes Module
 * Handles all HTTP requests related to Payment operations
 */
import express from 'express';
import { body } from 'express-validator';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/payments.controller.js';

// Create a new Express router instance for Payment routes
const router = express.Router();

// Defines validation rules for Payment-related operations using express-validator middleware
const validatePayment = [
  body('bookingId').isInt().withMessage('Booking ID must be a valid integer'),
  body('amount').isDecimal().withMessage('Amount must be a valid decimal number'),
  body('paymentMethod')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Cash'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Completed', 'Failed'])
    .withMessage('Invalid payment status'),
];

/**
 * GET /api/payments
 * Retrieves all payments from the database
 */
router.get('/', getAllPayments);

/**
 * GET /api/payments/:id
 * Retrieves a specific payment by its ID
 */
router.get('/:id', getPaymentById);

/**
 * POST /api/payments
 * Creates a new payment in the database
 */
router.post('/', validatePayment, createPayment);

/**
 * PUT /api/payments/:id
 * Updates an existing payment's information
 */
router.put('/:id', validatePayment, updatePayment);

/**
 * DELETE /api/payments/:id
 * Removes a payment from the system
 */
router.delete('/:id', deletePayment);

export default router;