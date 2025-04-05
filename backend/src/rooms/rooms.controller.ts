import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller for managing hotel rooms
 * Provides endpoints for CRUD operations and searching available rooms
 */
@ApiTags('Rooms')
@ApiExtraModels(CreateRoomDto, UpdateRoomDto, SearchRoomsDto, Room)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Retrieves all rooms
   * @returns Promise<Room[]> Array of all rooms
   */
  @Get()
  @ApiOperation({
    summary: 'Get all rooms',
    description: 'Retrieves a list of all available hotel rooms with their details',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all rooms',
    type: [Room],
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            roomNumber: '101',
            roomType: 'standard',
            pricePerNight: 99.99,
            capacity: 2,
            amenities: ['TV', 'WiFi', 'Air Conditioning'],
            isAvailable: true,
            description: 'Comfortable standard room with city view',
            createdAt: '2023-04-01T10:00:00Z',
            updatedAt: '2023-04-01T10:00:00Z',
          },
          {
            id: 2,
            roomNumber: '201',
            roomType: 'deluxe',
            pricePerNight: 149.99,
            capacity: 3,
            amenities: ['TV', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
            isAvailable: true,
            description: 'Spacious deluxe room with ocean view',
            createdAt: '2023-04-01T10:00:00Z',
            updatedAt: '2023-04-01T10:00:00Z',
          },
        ],
      },
    },
  })
  findAll(): Promise<Room[]> {
    return this.roomsService.findAll();
  }

  /**
   * Searches for available rooms based on criteria
   * @param searchDto - The search criteria
   * @returns Promise<Room[]> Array of available rooms matching criteria
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search for available rooms',
    description:
      'Search for available rooms based on date range, capacity, price range, and room type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available rooms matching search criteria',
    type: [Room],
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            roomNumber: '101',
            roomType: 'standard',
            pricePerNight: 99.99,
            capacity: 2,
            amenities: ['TV', 'WiFi', 'Air Conditioning'],
            isAvailable: true,
            description: 'Comfortable standard room with city view',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid search parameters' })
  searchRooms(@Query() searchDto: SearchRoomsDto): Promise<Room[]> {
    return this.roomsService.searchAvailableRooms(searchDto);
  }

  /**
   * Retrieves a single room by ID
   * @param id - The ID of the room to retrieve
   * @returns Promise<Room> The room with the specified ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a room by ID',
    description: 'Retrieves detailed information for a specific room',
  })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The room details',
    type: Room,
    content: {
      'application/json': {
        example: {
          id: 1,
          roomNumber: '101',
          roomType: 'standard',
          pricePerNight: 99.99,
          capacity: 2,
          amenities: ['TV', 'WiFi', 'Air Conditioning'],
          isAvailable: true,
          description: 'Comfortable standard room with city view',
          createdAt: '2023-04-01T10:00:00Z',
          updatedAt: '2023-04-01T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not Found - Room not found' })
  findOne(@Param('id') id: string): Promise<Room> {
    return this.roomsService.findOne(+id);
  }

  /**
   * Creates a new room
   * @param createRoomDto - The data for creating a new room
   * @returns Promise<Room> The newly created room
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Creates a new hotel room with the specified details (Admin only)',
  })
  @ApiBody({
    type: CreateRoomDto,
    description: 'Room creation data',
    examples: {
      standard: {
        summary: 'Standard room',
        value: {
          roomNumber: '102',
          roomType: 'standard',
          pricePerNight: 99.99,
          capacity: 2,
          amenities: ['TV', 'WiFi', 'Air Conditioning'],
          description: 'Comfortable standard room with city view',
        },
      },
      deluxe: {
        summary: 'Deluxe room',
        value: {
          roomNumber: '202',
          roomType: 'deluxe',
          pricePerNight: 149.99,
          capacity: 3,
          amenities: ['TV', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
          description: 'Spacious deluxe room with ocean view',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The room has been successfully created',
    type: Room,
    content: {
      'application/json': {
        example: {
          id: 3,
          roomNumber: '102',
          roomType: 'standard',
          pricePerNight: 99.99,
          capacity: 2,
          amenities: ['TV', 'WiFi', 'Air Conditioning'],
          isAvailable: true,
          description: 'Comfortable standard room with city view',
          createdAt: '2023-04-05T12:00:00Z',
          updatedAt: '2023-04-05T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  /**
   * Updates an existing room
   * @param id - The ID of the room to update
   * @param updateRoomDto - The data to update the room with
   * @returns Promise<Room> The updated room
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a room',
    description: 'Updates an existing room with the provided details (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateRoomDto,
    description: 'Room update data',
    examples: {
      updatePrice: {
        summary: 'Update price',
        value: {
          pricePerNight: 109.99,
        },
      },
      updateAvailability: {
        summary: 'Update availability',
        value: {
          isAvailable: false,
        },
      },
      updateAmenities: {
        summary: 'Update amenities',
        value: {
          amenities: ['TV', 'WiFi', 'Air Conditioning', 'Coffee Machine'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The room has been successfully updated',
    type: Room,
    content: {
      'application/json': {
        example: {
          id: 1,
          roomNumber: '101',
          roomType: 'standard',
          pricePerNight: 109.99,
          capacity: 2,
          amenities: ['TV', 'WiFi', 'Air Conditioning', 'Coffee Machine'],
          isAvailable: true,
          description: 'Comfortable standard room with city view',
          createdAt: '2023-04-01T10:00:00Z',
          updatedAt: '2023-04-05T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Not Found - Room not found' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto): Promise<Room> {
    return this.roomsService.update(+id, updateRoomDto);
  }

  /**
   * Deletes a room
   * @param id - The ID of the room to delete
   * @returns Promise<void>
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a room',
    description: 'Deletes a hotel room from the system (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Room successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Not Found - Room not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.roomsService.remove(+id);
  }
}
