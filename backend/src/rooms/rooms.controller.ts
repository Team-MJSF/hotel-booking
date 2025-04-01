import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Return all rooms', type: [Room] })
  findAll(): Promise<Room[]> {
    return this.roomsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Find available rooms based on criteria' })
  @ApiQuery({
    name: 'checkInDate',
    required: true,
    description: 'Check-in date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'checkOutDate',
    required: true,
    description: 'Check-out date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'roomType', required: false, description: 'Type of room' })
  @ApiQuery({
    name: 'maxGuests',
    required: false,
    description: 'Maximum number of guests',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price per night',
  })
  @ApiResponse({
    status: 200,
    description: 'Return available rooms',
    type: [Room],
  })
  findAvailableRooms(
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
    @Query('roomType') roomType?: string,
    @Query('maxGuests') maxGuests?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<Room[]> {
    return this.roomsService.findAvailableRooms(
      new Date(checkInDate),
      new Date(checkOutDate),
      roomType,
      maxGuests ? parseInt(maxGuests) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Return the room', type: Room })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id') id: string): Promise<Room> {
    return this.roomsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: Room,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
    type: Room,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto): Promise<Room> {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.roomsService.remove(+id);
  }
}
