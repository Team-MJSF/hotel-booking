/**
 * Unit tests for the rooms controller
 * Focusing on the getAllRooms function
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { getAllRooms } from '../../controllers/rooms.controller.js';
import Rooms from '../../models/Rooms.js';

// Mock the Rooms model
jest.mock('../../models/Rooms.js');

// Set up mock implementation for Rooms.findAll
Rooms.findAll = jest.fn();

describe('Rooms Controller - getAllRooms', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock response object with json and status methods
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('should return all rooms when no filters are provided', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked' }
    ];
    
    // Mock the findAll method to return our test data
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: {} }; // No query parameters
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({ where: {} }); // Should be called with empty filter
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should filter rooms by roomType', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { roomType: 'Double' } };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: { roomType: 'Double' }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should filter rooms by price range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { minPrice: '100', maxPrice: '200' } };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: {
        pricePerNight: {
          [Symbol.for('gte')]: 100,
          [Symbol.for('lte')]: 200
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should filter rooms by maxGuests', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { maxGuests: '3' } };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: {
        maxGuests: {
          [Symbol.for('gte')]: 3
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should filter rooms by availabilityStatus', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { availabilityStatus: 'Available' } };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: { availabilityStatus: 'Available' }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should combine multiple filters', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    
    const req = {
      query: {
        roomType: 'Double',
        minPrice: '100',
        maxPrice: '200',
        maxGuests: '2',
        availabilityStatus: 'Available'
      }
    };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: {
        roomType: 'Double',
        pricePerNight: {
          [Symbol.for('gte')]: 100,
          [Symbol.for('lte')]: 200
        },
        maxGuests: {
          [Symbol.for('gte')]: 2
        },
        availabilityStatus: 'Available'
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  test('should handle errors and return 500 status', async () => {
    // SETUP
    const errorMessage = 'Database error';
    Rooms.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = { query: {} };
    const res = mockResponse();
    
    // CALL
    await getAllRooms(req, res);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching rooms',
      error: errorMessage
    });
  });
});