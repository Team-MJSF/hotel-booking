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
