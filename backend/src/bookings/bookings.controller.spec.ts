import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { Booking, BookingStatus } from './entities/booking.entity.js';
import { NotFoundException } from '@nestjs/common';
import { RoomType, AvailabilityStatus } from '../rooms/entities/room.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockBooking: Booking = {
    bookingId: 1,
    userId: 1,
    roomId: 1,
    checkInDate: new Date('2024-03-20'),
    checkOutDate: new Date('2024-03-25'),
    numberOfGuests: 2,
    status: BookingStatus.PENDING,
    user: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    room: {
      id: 1,
      roomNumber: '101',
      type: RoomType.DOUBLE,
      pricePerNight: 100,
      maxGuests: 2,
      description: 'A comfortable double room',
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        airConditioning: true,
      }),
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of bookings', async () => {
      const bookings = [mockBooking];
      mockBookingsService.findAll.mockResolvedValue(bookings);

      const result = await controller.findAll();

      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single booking', async () => {
      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      mockBookingsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
      };

      mockBookingsService.create.mockResolvedValue(mockBooking);

      const result = await controller.create(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.create).toHaveBeenCalledWith(createBookingDto);
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const updateBookingDto: Partial<Booking> = {
        status: BookingStatus.CONFIRMED,
      };

      const updatedBooking = { ...mockBooking, ...updateBookingDto };
      mockBookingsService.update.mockResolvedValue(updatedBooking);

      const result = await controller.update('1', updateBookingDto);

      expect(result).toEqual(updatedBooking);
      expect(mockBookingsService.update).toHaveBeenCalledWith(1, updateBookingDto);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const updateBookingDto: Partial<Booking> = {
        status: BookingStatus.CONFIRMED,
      };

      mockBookingsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateBookingDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      mockBookingsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockBookingsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      mockBookingsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
