/**
 * Room Controller Module
 * Handles all business logic for Room operations
 */
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Rooms from '../models/Rooms.js';

// Get all rooms with optional filtering
export const getAllRooms = async (request, response) => {
  try {
    const { roomType, minPrice, maxPrice, maxGuests, availabilityStatus } = request.query;
    
    // Build filter object for Sequelize query
    const filter = {};
    
    // Add filters based on query parameters
    if (roomType) {
      filter.roomType = roomType;
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) {
        filter.pricePerNight[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.pricePerNight[Op.lte] = parseFloat(maxPrice);
      }
    }
    
    if (maxGuests) {
      filter.maxGuests = {
        [Op.gte]: parseInt(maxGuests, 10)
      };
    }
    
    if (availabilityStatus) {
      filter.availabilityStatus = availabilityStatus;
    }
    
    // Apply filters to query
    const rooms = await Rooms.findAll({
      where: filter
    });
    
    response.json(rooms);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

// Get room by ID
export const getRoomById = async (request, response) => {
  try {
    const room = await Rooms.findByPk(request.params.id);
    if (!room) {
      return response.status(404).json({ message: 'Room not found' });
    }
    response.json(room);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching room', error: error.message });
  }
};

// Create new room
export const createRoom = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const newRoom = await Rooms.create({
      roomNumber: request.body.roomNumber,
      roomType: request.body.roomType,
      pricePerNight: request.body.pricePerNight,
      maxGuests: request.body.maxGuests,
      description: request.body.description,
      availabilityStatus: request.body.availabilityStatus || 'Available',
      amenities: request.body.amenities,
      photoGallery: request.body.photoGallery
    });

    response.status(201).json(newRoom);
  } catch (error) {
    response.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

// Update room
export const updateRoom = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const room = await Rooms.findByPk(request.params.id);
    if (!room) {
      return response.status(404).json({ message: 'Room not found' });
    }

    await room.update({
      roomNumber: request.body.roomNumber,
      roomType: request.body.roomType,
      pricePerNight: request.body.pricePerNight,
      maxGuests: request.body.maxGuests,
      description: request.body.description,
      availabilityStatus: request.body.availabilityStatus,
      amenities: request.body.amenities,
      photoGallery: request.body.photoGallery
    });

    response.json(room);
  } catch (error) {
    response.status(500).json({ message: 'Error updating room', error: error.message });
  }
};

// Delete room
export const deleteRoom = async (request, response) => {
  try {
    const room = await Rooms.findByPk(request.params.id);
    if (!room) {
      return response.status(404).json({ message: 'Room not found' });
    }

    await room.destroy();
    response.json({ message: 'Room deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting room', error: error.message });
  }
};

// Check room availability for a date range
export const checkRoomAvailability = async (request, response) => {
  try {
    const { checkInDate, checkOutDate, roomType, maxGuests } = request.query;
    
    // Validate required date parameters
    if (!checkInDate || !checkOutDate) {
      return response.status(400).json({ 
        message: 'Both checkInDate and checkOutDate are required' 
      });
    }
    
    // Parse dates
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    
    // Validate date range
    if (startDate >= endDate) {
      return response.status(400).json({ 
        message: 'checkOutDate must be after checkInDate' 
      });
    }
    
    // Build filter for rooms
    const roomFilter = {};
    
    // Add optional filters
    if (roomType) {
      roomFilter.roomType = roomType;
    }
    
    if (maxGuests) {
      roomFilter.maxGuests = {
        [Op.gte]: parseInt(maxGuests, 10)
      };
    }
    
    // First, get all rooms matching the filter criteria
    const allRooms = await Rooms.findAll({
      where: {
        ...roomFilter,
        // Only include rooms that are not under maintenance
        availabilityStatus: {
          [Op.ne]: 'Maintenance'
        }
      }
    });
    
    // Get all bookings that overlap with the requested date range
    const overlappingBookings = await Bookings.findAll({
      where: {
        // Find bookings where:
        // (checkInDate <= requested checkOutDate) AND (checkOutDate >= requested checkInDate)
        [Op.and]: [
          { checkOutDate: { [Op.gt]: startDate } },
          { checkInDate: { [Op.lt]: endDate } }
        ],
        // Only consider confirmed bookings
        status: 'Confirmed'
      },
      attributes: ['roomId']
    });
    
    // Extract roomIds that are already booked for the requested period
    const bookedRoomIds = overlappingBookings.map(booking => booking.roomId);
    
    // Filter out rooms that are already booked
    const availableRooms = allRooms.filter(room => {
      // Room is available if:
      // 1. It's not in the list of booked rooms for this period
      // 2. Its status is 'Available'
      return !bookedRoomIds.includes(room.roomId) && room.availabilityStatus === 'Available';
    });
    
    response.json({
      availableRooms,
      totalAvailable: availableRooms.length
    });
    
  } catch (error) {
    response.status(500).json({ 
      message: 'Error checking room availability', 
      error: error.message 
    });
  }
};
