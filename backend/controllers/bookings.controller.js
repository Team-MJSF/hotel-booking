/**
 * Booking Controller Module
 * Handles all business logic for Booking operations
 */
import { validationResult } from 'express-validator';
import Bookings from '../models/Bookings.js'; 

// Get all bookings
export const getAllBookings = async (request, response) => {
  try {
    const bookings = await Bookings.findAll({
      include: ['Users', 'Rooms'], 
    });
    response.json(bookings);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Get booking by ID
export const getBookingById = async (request, response) => {
  try {
    const booking = await Bookings.findByPk(request.params.id, {
      include: ['Users', 'Rooms'],  
    });
    if (!booking) {
      return response.status(404).json({ message: 'Booking not found' });
    }
    response.json(booking);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Create new booking
export const createBooking = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const newBooking = await Bookings.create({
      userId: request.body.userId,
      roomId: request.body.roomId,
      bookingDate: request.body.bookingDate,
      status: request.body.status || 'Pending',
    });

    response.status(201).json(newBooking);
  } catch (error) {
    response.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// Update booking
export const updateBooking = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const booking = await Bookings.findByPk(request.params.id);
    if (!booking) {
      return response.status(404).json({ message: 'Booking not found' });
    }

    await booking.update({
      userId: request.body.userId || booking.userId,
      roomId: request.body.roomId || booking.roomId,
      bookingDate: request.body.bookingDate || booking.bookingDate,
      status: request.body.status || booking.status,
    });

    response.json(booking);
  } catch (error) {
    response.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

// Delete booking
export const deleteBooking = async (request, response) => {
  try {
    const booking = await Bookings.findByPk(request.params.id);
    if (!booking) {
      return response.status(404).json({ message: 'Booking not found' });
    }

    await booking.destroy();
    response.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};
