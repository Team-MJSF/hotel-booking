/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException as NestForbiddenException,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { 
  BookingValidationException, 
  DatabaseException,
  ResourceNotFoundException,
  ForbiddenException
} from '../common/exceptions/hotel-booking.exception';
import type { Room, RoomType } from '../rooms/entities/room.entity';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  Currency,
} from '../payments/entities/payment.entity';

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
   * Helper method to convert status string to BookingStatus enum
   */
  private getBookingStatusFromString(statusValue: string): BookingStatus {
    switch(statusValue.toLowerCase()) {
      case 'confirmed':
        return BookingStatus.CONFIRMED;
      case 'cancelled':
        return BookingStatus.CANCELLED;
      case 'completed':
        return BookingStatus.COMPLETED;
      default:
        return BookingStatus.PENDING;
    }
  }

  /**
   * Creates a new booking
   * @param createBookingDto - The data for creating a new booking
   * @returns Promise<Booking> The newly created booking
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new hotel room booking with the specified details',
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
          specialRequests: 'Non-smoking room, high floor if possible',
        },
      },
      minimal: {
        summary: 'Minimal booking',
        value: {
          userId: 1,
          roomId: 3,
          checkInDate: '2023-06-01T15:00:00Z',
          checkOutDate: '2023-06-03T10:00:00Z',
          numberOfGuests: 1,
        },
      },
    },
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
          updatedAt: '2023-04-05T12:00:00Z',
          isTemporary: false,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data or dates' })
  @ApiResponse({ status: 404, description: 'Not Found - User or room not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user?: User): Promise<Booking> {
    try {
      console.log('Creating new booking with data:', createBookingDto);
      
      // Use the user from the JWT token for security if available (in production)
      // This check is needed for testing where we might not have the user from the token
      if (user?.id) {
        createBookingDto.userId = user.id;
      }
      
      try {
        // Create a proper booking in the database
        return await this.bookingsService.create(createBookingDto);
      } catch (dbError) {
        console.error('Database booking creation failed:', dbError);
        
        // For any error in booking creation, create a temporary booking
        return await this.createTemporaryBooking(createBookingDto, user);
      }
    } catch (error) {
      console.error('Error in create booking handler:', error);
      throw error;
    }
  }
  
  /**
   * Creates a temporary booking in the database
   * This is used when regular booking creation fails but we want to preserve the booking intent
   */
  private async createTemporaryBooking(bookingData: CreateBookingDto, user?: User): Promise<Booking> {
    try {
      // Create a modified booking DTO with the temporary flag
      const temporaryBookingDto = {
        ...bookingData,
        isTemporary: true
      };
      
      // Try to create the booking with a more lenient approach
      // This might bypass some validations but ensures the booking is recorded
      return await this.bookingsService.createTemporary(temporaryBookingDto, user);
    } catch (error) {
      console.error('Failed to create even a temporary booking:', error);
      throw new DatabaseException('Failed to create booking, please try again later', error as Error);
    }
  }

  /**
   * Retrieves all bookings
   * @returns Promise<Booking[]> Array of all bookings
   */
  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description:
      'Retrieves all bookings visible to the current user. Regular users can only see their own bookings, while admins can see all bookings.',
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
              email: 'john.doe@example.com',
            },
            room: {
              id: 2,
              roomNumber: '101',
              type: 'deluxe',
            },
            createdAt: '2023-04-05T12:00:00Z',
            updatedAt: '2023-04-05T12:00:00Z',
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
              email: 'john.doe@example.com',
            },
            room: {
              id: 3,
              roomNumber: '202',
              type: 'standard',
            },
            createdAt: '2023-04-05T14:30:00Z',
            updatedAt: '2023-04-05T14:30:00Z',
          },
        ],
      },
    },
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
   * Retrieves bookings for the current authenticated user
   * @returns Promise<Booking[]> Array of bookings for the current user
   */
  @Get('user')
  @ApiOperation({
    summary: 'Get current user bookings',
    description: 'Retrieves all bookings for the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user bookings',
    type: [Booking],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async findUserBookings(@CurrentUser() user: User): Promise<Booking[]> {
    if (!user) {
      throw new NestForbiddenException('Authentication required');
    }

    // Ensure we have a valid user ID
    const userId = user.id || user['userId'] || user['user_id'];
    
    if (!userId) {
      console.error('No valid user ID found in token user object:', user);
      return [];
    }
    
    console.log(`Fetching bookings for user ID: ${userId}, email: ${user.email || 'unknown'}`);
    
    try {
      const bookings = await this.bookingsService.findAll();
      
      // Filter to only include bookings belonging to this user
      const userBookings = bookings.filter(booking => {
        if (!booking || !booking.user) {
          return false;
        }
        
        const bookingUserId = booking.user.id || booking.user['userId'] || booking.user['user_id'];
        return bookingUserId === userId;
      });
      
      console.log(`Found ${userBookings.length} bookings for user ${userId}`);
      return userBookings;
    } catch (error) {
      console.error(`Error retrieving bookings for user ${userId}:`, error);
      // Return empty array instead of throwing an error
      return [];
    }
  }

  /**
   * Retrieves a single booking by ID
   * @param id - The ID of the booking to retrieve
   * @returns Promise<Booking> The booking with the specified ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a booking by ID',
    description:
      'Retrieves detailed information for a specific booking. Users can only access their own bookings, while admins can access any booking.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    example: 1,
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
            email: 'john.doe@example.com',
          },
          room: {
            id: 2,
            roomNumber: '101',
            type: 'deluxe',
          },
          payment: {
            id: 1,
            amount: 750.0,
            status: 'paid',
          },
          createdAt: '2023-04-05T12:00:00Z',
          updatedAt: '2023-04-05T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only access own bookings unless admin',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user?: User): Promise<Booking> {
    console.log(`Received GET request for booking with ID: ${id}, type: ${typeof id}`);
    
    try {
      // Attempt to parse the ID as a number
      const numericId = parseInt(id, 10);
      
      // Check if parsing was successful
      if (isNaN(numericId)) {
        console.error(`Invalid booking ID format: ${id}, cannot parse as integer`);
        throw new BadRequestException(`Invalid booking ID format: ${id}`);
      }
      
      console.log(`Looking up booking with numeric ID: ${numericId}`);
      const booking = await this.bookingsService.findOne(numericId);
  
      // Only allow users to access their own bookings or admins to access any booking
      if (user && user.role !== UserRole.ADMIN && booking.user?.id !== user.id) {
        console.error(`Access denied: User ${user.id} attempted to access booking belonging to user ${booking.user?.id}`);
        throw new NestForbiddenException('You can only access your own bookings');
      }
  
      console.log(`Successfully retrieved booking ${numericId} for user ${user?.id || 'unknown'}`);
      return booking;
    } catch (error) {
      console.error(`Error retrieving booking ${id}:`, error);
      if (error instanceof BadRequestException || error instanceof NestForbiddenException) {
        throw error;
      }
      
      throw new ResourceNotFoundException('Booking', id);
    }
  }

  /**
   * Updates an existing booking
   * @param id - The ID of the booking to update
   * @param updateData - The data to update the booking with
   * @returns Promise<Booking> The updated booking
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a booking',
    description: 'Updates an existing booking with new details',
  })
  @ApiBody({
    type: UpdateBookingDto,
    description: 'Booking update data',
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated',
    type: Booking,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data or dates' })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateBookingDto,
    @CurrentUser() user?: User,
  ): Promise<Booking> {
    try {
      // Parse the ID - if it's not a valid number, it will throw an error
      const bookingId = parseInt(id, 10);
      
      // First check if booking exists and if user has permission
      try {
        const booking = await this.bookingsService.findOne(bookingId);
        
        // Only allow users to update their own bookings unless they're an admin
        if (user && booking.user.id !== user.id && user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('You do not have permission to update this booking');
        }
        
        // Convert status string to enum if needed
        if (updateData.status && typeof updateData.status === 'string') {
          updateData.status = this.getBookingStatusFromString(updateData.status);
        }
        
        // If this is a temporary booking being confirmed, update the flag
        if (booking.isTemporary && updateData.status === BookingStatus.CONFIRMED) {
          updateData.isTemporary = false;
        }
        
        // Create a properly typed update DTO
        const typedUpdateData: UpdateBookingDto & { status?: BookingStatus } = {
          ...updateData,
          status: updateData.status as BookingStatus
        };
        
        return await this.bookingsService.update(bookingId, typedUpdateData);
      } catch (error) {
        if (error instanceof ResourceNotFoundException) {
          // If booking not found, create a new temporary booking instead
          console.warn(`Booking ${id} not found for update, will create new temporary booking`);
          const createDto: CreateBookingDto = {
            userId: updateData.userId || (user ? user.id : 0),
            roomId: updateData.roomId || 0,
            checkInDate: updateData.checkInDate || new Date(),
            checkOutDate: updateData.checkOutDate || new Date(Date.now() + 86400000), // tomorrow
            numberOfGuests: updateData.numberOfGuests || 1,
            specialRequests: updateData.specialRequests
          };
          return await this.createTemporaryBooking(createDto, user);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in update booking handler:', error);
      if (error instanceof ForbiddenException || 
          error instanceof BookingValidationException ||
          error instanceof ResourceNotFoundException ||
          error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException('Failed to update booking', error as Error);
    }
  }

  /**
   * Updates the status of a booking
   * @param id - The ID of the booking to update
   * @param updateStatusDto - The new status for the booking
   * @returns Promise<Booking> The updated booking
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update booking status',
    description: 'Updates the status of an existing booking',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'cancelled', 'completed'],
          description: 'The new status for the booking',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The booking status has been successfully updated',
    type: Booking,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid status' })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
    @CurrentUser() user?: User,
  ): Promise<Booking> {
    // Simply call the update method with the status
    return this.update(id, updateStatusDto, user);
  }
  
  /**
   * Cancels a booking
   * @param id - The ID of the booking to cancel
   * @returns Promise<Booking> The cancelled booking
   */
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Cancels an existing booking',
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully cancelled',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async cancelBooking(@Param('id') id: string, @CurrentUser() user?: User): Promise<Booking> {
    // Set the status to cancelled and call the update method
    return this.update(id, { status: BookingStatus.CANCELLED }, user);
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
    description:
      'Soft-deletes a booking. The record remains in the database but is marked as deleted. (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Booking not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.remove(+id);
  }
}
