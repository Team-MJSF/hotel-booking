/**
 * Unit tests for the rooms controller
 * Focusing on the getAllRooms and checkRoomAvailability functions
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { getAllRooms, checkRoomAvailability } from '../../controllers/rooms.controller.js';
import Rooms from '../../models/Rooms.js';
import Bookings from '../../models/Bookings.js';

// Mock the Rooms and Bookings models
jest.mock('../../models/Rooms.js');
jest.mock('../../models/Bookings.js');

// Set up mock implementations
Rooms.findAll = jest.fn();
Bookings.findAll = jest.fn();

// Mock response object with json and status methods
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Rooms Controller - getAllRooms', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe('Rooms Controller - checkRoomAvailability', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return available rooms for valid date range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    const mockBookingsData = [
      { roomId: 1 } // Room 1 is booked for the requested period
    ];
    
    // Mock the findAll methods
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    Bookings.findAll.mockResolvedValue(mockBookingsData);
    
    const req = {
      query: {
        checkInDate: '2023-06-01',
        checkOutDate: '2023-06-05'
      }
    };
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalled();
    expect(Bookings.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 2 }),
        expect.objectContaining({ roomId: 3 })
      ]),
      totalAvailable: 2
    });
  });

  test('should return 400 if checkInDate or checkOutDate is missing', async () => {
    // SETUP
    const req = { query: {} }; // Missing date parameters
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Both checkInDate and checkOutDate are required'
    });
  });

  test('should return 400 if checkOutDate is not after checkInDate', async () => {
    // SETUP
    const req = { 
      query: { 
        checkInDate: '2023-07-05', 
        checkOutDate: '2023-07-01' // checkOutDate before checkInDate
      } 
    };
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'checkOutDate must be after checkInDate'
    });
  });

  test('should filter by roomType and date range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
      // Only include Double rooms in the mock data to match our filter
    ];
    
    const mockBookingsData = []; // No bookings for these rooms
    
    // Mock the findAll methods
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    Bookings.findAll.mockResolvedValue(mockBookingsData);
    
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05',
        roomType: 'Double'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: {
        roomType: 'Double',
        availabilityStatus: {
          [Symbol.for('ne')]: 'Maintenance'
        }
      }
    });
    
    // Only room 2 should be available (filtered by roomType)
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 2 })
      ]),
      totalAvailable: 1
    });
  });

  test('should filter by maxGuests and date range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    const mockBookingsData = []; // No bookings for these rooms
    
    // Mock the findAll methods
    Rooms.findAll.mockResolvedValue(mockRoomsData);
    Bookings.findAll.mockResolvedValue(mockBookingsData);
    
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05',
        maxGuests: '3'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(Rooms.findAll).toHaveBeenCalledWith({
      where: {
        maxGuests: {
          [Symbol.for('gte')]: 3
        },
        availabilityStatus: {
          [Symbol.for('ne')]: 'Maintenance'
        }
      }
    });
    
    // Only room 3 should be available (filtered by maxGuests)
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 3 })
      ]),
      totalAvailable: 1
    });
  });

  test('should handle errors and return 500 status', async () => {
    // SETUP
    const errorMessage = 'Database error';
    Rooms.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await checkRoomAvailability(req, res);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error checking room availability',
      error: errorMessage
    });
  });
});
