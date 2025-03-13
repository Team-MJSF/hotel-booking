/**
 * Payment Controller Module
 * Handles all business logic for Payment operations
 */
import { validationResult } from 'express-validator';
import Payments from '../models/Payments.js';

// Get all payments
export const getAllPayments = async (request, response) => {
  try {
    const payments = await Payments.findAll({
      include: [{ model: Bookings, as: 'booking' }], // Include associated booking details
    });
    response.json(payments);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (request, response) => {
  try {
    const payment = await Payments.findByPk(request.params.id, {
      include: [{ model: Bookings, as: 'booking' }], // Include associated booking details
    });
    if (!payment) {
      return response.status(404).json({ message: 'Payment not found' });
    }
    response.json(payment);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Create new payment
export const createPayment = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const newPayment = await Payments.create({
      bookingId: request.body.bookingId,
      amount: request.body.amount,
      paymentMethod: request.body.paymentMethod,
      status: request.body.status || 'Pending', // Default status is 'Pending'
    });
    response.status(201).json(newPayment);
  } catch (error) {
    response.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Update payment
export const updatePayment = async (request, response) => {
  const errors = validationResult(request);
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
      status: request.body.status || payment.status, // Keep existing status if not provided
    });

    response.json(payment);
  } catch (error) {
    response.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete payment
export const deletePayment = async (request, response) => {
  try {
    const payment = await Payments.findByPk(request.params.id);
    if (!payment) {
      return response.status(404).json({ message: 'Payment not found' });
    }

    await payment.destroy();
    response.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};