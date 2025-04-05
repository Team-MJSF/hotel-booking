import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing hotel bookings
 * Provides endpoints for CRUD operations on bookings
 */
@ApiTags('Bookings')
@ApiExtraModels(CreateBookingDto, UpdateBookingDto, Booking)
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Creates a new booking
   * @param createBookingDto - The data for creating a new booking
   * @returns Promise<Booking> The newly created booking
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new hotel room booking with the specified details'
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Booking creation data',
    examples: {
      standard: {
        summary: 'Standard booking',
        value: {
          userId: 1,
          roomId: 2,
          checkInDate: '2023-05-15T14:00:00Z',
          checkOutDate: '2023-05-20T11:00:00Z',
          numberOfGuests: 2,
          specialRequests: 'Non-smoking room, high floor if possible'
        }
      },
      minimal: {
        summary: 'Minimal booking',
        value: {
          userId: 1,
          roomId: 3,
          checkInDate: '2023-06-01T15:00:00Z',
          checkOutDate: '2023-06-03T10:00:00Z',
          numberOfGuests: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created',
    type: Booking,
    content: {
      'application/json': {
        example: {
          bookingId: 1,
          userId: 1,
          roomId: 2,
          checkInDate: '2023-05-15T14:00:00Z',
          checkOutDate: '2023-05-20T11:00:00Z',
          numberOfGuests: 2,
          specialRequests: 'Non-smoking room, high floor if possible',
          status: 'pending',
          createdAt: '2023-04-05T12:00:00Z',
          updatedAt: '2023-04-05T12:00:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data or dates' })
  @ApiResponse({ status: 404, description: 'Not Found - User or room not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user?: User): Promise<Booking> {
    // Use the user from the JWT token for security if available (in production)
    // This check is needed for testing where we might not have the user from the token
    if (user?.id) {
      createBookingDto.userId = user.id;
    }
    return this.bookingsService.create(createBookingDto);
  }

  /**
   * Retrieves all bookings
   * @returns Promise<Booking[]> Array of all bookings
   */
  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieves all bookings visible to the current user. Regular users can only see their own bookings, while admins can see all bookings.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    type: [Booking],
    content: {
      'application/json': {
        example: [
          {
            bookingId: 1,
            checkInDate: '2023-05-15T14:00:00Z',
            checkOutDate: '2023-05-20T11:00:00Z',
            numberOfGuests: 2,
            specialRequests: 'Non-smoking room',
            status: 'confirmed',
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            room: {
              id: 2,
              roomNumber: '101',
              roomType: 'deluxe'
            },
            createdAt: '2023-04-05T12:00:00Z',
            updatedAt: '2023-04-05T12:00:00Z'
          },
          {
            bookingId: 2,
            checkInDate: '2023-06-01T15:00:00Z',
            checkOutDate: '2023-06-03T10:00:00Z',
            numberOfGuests: 1,
            status: 'pending',
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            room: {
              id: 3,
              roomNumber: '202',
              roomType: 'standard'
            },
            createdAt: '2023-04-05T14:30:00Z',
            updatedAt: '2023-04-05T14:30:00Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async findAll(@CurrentUser() user?: User): Promise<Booking[]> {
    const bookings = await this.bookingsService.findAll();
    
    // If user is admin, return all bookings
    // If regular user, filter to only show their own bookings
    if (user && user.role !== UserRole.ADMIN) {
      return bookings.filter(booking => booking.user?.id === user.id);
    }
    
    return bookings;
  }

  /**
   * Retrieves a single booking by ID
   * @param id - The ID of the booking to retrieve
   * @returns Promise<Booking> The booking with the specified ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a booking by ID',
    description: 'Retrieves detailed information for a specific booking. Users can only access their own bookings, while admins can access any booking.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Booking ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'The booking details',
    type: Booking,
    content: {
      'application/json': {
        example: {
          bookingId: 1,
          checkInDate: '2023-05-15T14:00:00Z',
          checkOutDate: '2023-05-20T11:00:00Z',
          numberOfGuests: 2,
          specialRequests: 'Non-smoking room',
          status: 'confirmed',
          user: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          room: {
            id: 2,
            roomNumber: '101',
            roomType: 'deluxe',
            pricePerNight: 150.00
          },
          payment: {
            id: 1,
            amount: 750.00,
            status: 'paid'
          },
          createdAt: '2023-04-05T12:00:00Z',
          updatedAt: '2023-04-05T12:00:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access own bookings unless admin' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: User): Promise<Booking> {
    const booking = await this.bookingsService.findOne(+id);
    
    // Only allow users to access their own bookings or admins to access any booking
    if (user && user.role !== UserRole.ADMIN && booking.user?.id !== user.id) {
      throw new ForbiddenException('You can only access your own bookings');
    }
    
    return booking;
  }

  /**
   * Updates an existing booking
   * @param id - The ID of the booking to update
   * @param updateBookingDto - The data to update the booking with
   * @returns Promise<Booking> The updated booking
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a booking',
    description: 'Updates an existing booking with the provided details. Can be used to modify dates, room, number of guests, or cancel a booking. Users can only update their own bookings, while admins can update any booking.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Booking ID',
    example: 1
  })
  @ApiBody({
    type: UpdateBookingDto,
    description: 'Booking update data',
    examples: {
      changeDate: {
        summary: 'Change booking dates',
        value: {
          checkInDate: '2023-05-16T14:00:00Z',
          checkOutDate: '2023-05-21T11:00:00Z'
        }
      },
      changeGuests: {
        summary: 'Update number of guests',
        value: {
          numberOfGuests: 3
        }
      },
      changeStatus: {
        summary: 'Change booking status',
        value: {
          status: 'cancelled'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated',
    type: Booking,
    content: {
      'application/json': {
        example: {
          bookingId: 1,
          checkInDate: '2023-05-16T14:00:00Z',
          checkOutDate: '2023-05-21T11:00:00Z',
          numberOfGuests: 2,
          specialRequests: 'Non-smoking room',
          status: 'confirmed',
          createdAt: '2023-04-05T12:00:00Z',
          updatedAt: '2023-04-05T15:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data or dates' })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own bookings unless admin' })
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @CurrentUser() user?: User): Promise<Booking> {
    const booking = await this.bookingsService.findOne(+id);
    
    // Only allow users to update their own bookings or admins to update any booking
    if (user && user.role !== UserRole.ADMIN && booking.user && booking.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own bookings');
    }
    
    return await this.bookingsService.update(+id, updateBookingDto);
  }

  /**
   * Removes a booking
   * @param id - The ID of the booking to remove
   * @returns Promise<void>
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Delete a booking',
    description: 'Soft-deletes a booking. The record remains in the database but is marked as deleted. (Admin only)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Booking ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully deleted'
  })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.remove(+id);
  }
}
