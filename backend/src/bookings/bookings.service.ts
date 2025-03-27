import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  /**
   * Retrieves all bookings from the database
   * @returns Promise<Booking[]> Array of all bookings with their related user, room, and payments
   */
  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['user', 'room', 'payments'],
    });
  }

  /**
   * Retrieves a single booking by ID
   * @param id - The ID of the booking to retrieve
   * @returns Promise<Booking> The booking with the specified ID
   * @throws NotFoundException if booking is not found
   */
  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
      relations: ['user', 'room', 'payments'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  /**
   * Creates a new booking
   * @param createBookingDto - The data for creating a new booking
   * @returns Promise<Booking> The newly created booking
   */
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingsRepository.create(createBookingDto);
    return this.bookingsRepository.save(booking);
  }

  /**
   * Updates an existing booking
   * @param id - The ID of the booking to update
   * @param updateBookingDto - The data to update the booking with
   * @returns Promise<Booking> The updated booking
   * @throws NotFoundException if booking is not found
   */
  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    await this.bookingsRepository.update(id, updateBookingDto);
    return this.findOne(id);
  }

  /**
   * Removes a booking from the database
   * @param id - The ID of the booking to remove
   * @returns Promise<void>
   * @throws NotFoundException if booking is not found
   */
  async remove(id: number): Promise<void> {
    const result = await this.bookingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
