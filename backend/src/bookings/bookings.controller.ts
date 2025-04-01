import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';

/**
 * Controller for managing hotel bookings
 * Provides endpoints for CRUD operations on bookings
 */
@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Creates a new booking
   * @param createBookingDto - The data for creating a new booking
   * @returns Promise<Booking> The newly created booking
   */
  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created',
    type: Booking,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.create(createBookingDto);
  }

  /**
   * Retrieves all bookings
   * @returns Promise<Booking[]> Array of all bookings
   */
  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings',
    type: [Booking],
  })
  findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  /**
   * Retrieves a single booking by ID
   * @param id - The ID of the booking to retrieve
   * @returns Promise<Booking> The booking with the specified ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the booking',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string): Promise<Booking> {
    return this.bookingsService.findOne(+id);
  }

  /**
   * Updates an existing booking
   * @param id - The ID of the booking to update
   * @param updateBookingDto - The data to update the booking with
   * @returns Promise<Booking> The updated booking
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto): Promise<Booking> {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  /**
   * Removes a booking
   * @param id - The ID of the booking to remove
   * @returns Promise<void>
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.remove(+id);
  }
}
