import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResourceNotFoundException, DatabaseException, BookingValidationException } from '../common/exceptions/hotel-booking.exception';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  /**
   * Retrieves all bookings from the database
   * @returns Promise<Booking[]> Array of all bookings with their related user, room, and payments
   */
  async findAll(): Promise<Booking[]> {
    try {
      return await this.bookingsRepository.find({
        relations: ['user', 'room', 'payments'],
      });
    } catch (error) {
      throw new DatabaseException('Failed to fetch bookings', error as Error);
    }
  }

  /**
   * Retrieves a single booking by ID
   * @param id - The ID of the booking to retrieve
   * @returns Promise<Booking> The booking with the specified ID
   * @throws ResourceNotFoundException if booking is not found
   */
  async findOne(id: number): Promise<Booking> {
    try {
      const booking = await this.bookingsRepository.findOne({
        where: { bookingId: id },
        relations: ['user', 'room', 'payments'],
      });

      if (!booking) {
        throw new ResourceNotFoundException('Booking', id);
      }

      return booking;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to fetch booking', error as Error);
    }
  }

  /**
   * Creates a new booking
   * @param createBookingDto - The data for creating a new booking
   * @returns Promise<Booking> The newly created booking
   */
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Validate check-in and check-out dates
      if (createBookingDto.checkInDate >= createBookingDto.checkOutDate) {
        throw new BookingValidationException('Check-in date must be before check-out date', [
          { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
          { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
        ]);
      }

      // Load user and room entities
      const user = await this.usersRepository.findOne({ where: { id: createBookingDto.userId } });
      if (!user) {
        throw new ResourceNotFoundException('User', createBookingDto.userId);
      }

      const room = await this.roomsRepository.findOne({ where: { id: createBookingDto.roomId } });
      if (!room) {
        throw new ResourceNotFoundException('Room', createBookingDto.roomId);
      }

      // Create booking with relations
      const booking = this.bookingsRepository.create({
        ...createBookingDto,
        user,
        room,
      });

      return await this.bookingsRepository.save(booking);
    } catch (error) {
      if (error instanceof BookingValidationException || error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to create booking', error as Error);
    }
  }

  /**
   * Updates an existing booking
   * @param id - The ID of the booking to update
   * @param updateBookingDto - The data to update the booking with
   * @returns Promise<Booking> The updated booking
   * @throws ResourceNotFoundException if booking is not found
   */
  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    try {
      // Find the existing booking
      const booking = await this.findOne(id);
      if (!booking) {
        throw new ResourceNotFoundException('Booking', id);
      }

      // Validate check-in and check-out dates if they are being updated
      if (updateBookingDto.checkInDate && updateBookingDto.checkOutDate) {
        if (updateBookingDto.checkInDate >= updateBookingDto.checkOutDate) {
          throw new BookingValidationException('Check-in date must be before check-out date', [
            { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
            { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
          ]);
        }
      }

      // Load user and room entities if they are being updated
      let user = booking.user;
      let room = booking.room;

      if (updateBookingDto.userId) {
        user = await this.usersRepository.findOne({ where: { id: updateBookingDto.userId } });
        if (!user) {
          throw new ResourceNotFoundException('User', updateBookingDto.userId);
        }
      }

      if (updateBookingDto.roomId) {
        room = await this.roomsRepository.findOne({ where: { id: updateBookingDto.roomId } });
        if (!room) {
          throw new ResourceNotFoundException('Room', updateBookingDto.roomId);
        }
      }

      // Update the booking with the new values and relations
      const updatedBooking = this.bookingsRepository.merge(booking, {
        ...updateBookingDto,
        user,
        room,
      });

      return await this.bookingsRepository.save(updatedBooking);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BookingValidationException) {
        throw error;
      }
      throw new DatabaseException('Failed to update booking', error as Error);
    }
  }

  /**
   * Removes a booking from the database
   * @param id - The ID of the booking to remove
   * @returns Promise<void>
   * @throws ResourceNotFoundException if booking is not found
   */
  async remove(id: number): Promise<void> {
    try {
      const result = await this.bookingsRepository.delete(id);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('Booking', id);
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete booking', error as Error);
    }
  }
}
