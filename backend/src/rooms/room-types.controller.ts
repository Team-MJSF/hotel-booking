import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomType } from './entities/room-type.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Room Types')
@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all room types' })
  @ApiResponse({
    status: 200,
    description: 'List of all room types',
    type: [RoomType],
  })
  async findAll(): Promise<{ success: boolean; data: RoomType[]; message: string }> {
    const roomTypes = await this.roomTypesService.findAll();
    return {
      success: true,
      data: roomTypes,
      message: 'Room types fetched successfully',
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a room type by code' })
  @ApiResponse({
    status: 200,
    description: 'The room type',
    type: RoomType,
  })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  async findByCode(@Param('code') code: string): Promise<{ success: boolean; data: RoomType; message: string }> {
    const roomType = await this.roomTypesService.findByCode(code);
    return {
      success: true,
      data: roomType,
      message: 'Room type fetched successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room type by ID' })
  @ApiResponse({
    status: 200,
    description: 'The room type',
    type: RoomType,
  })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  async findOne(@Param('id') id: string): Promise<{ success: boolean; data: RoomType; message: string }> {
    const roomType = await this.roomTypesService.findOne(+id);
    return {
      success: true,
      data: roomType,
      message: 'Room type fetched successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new room type' })
  @ApiResponse({
    status: 201,
    description: 'The room type has been successfully created',
    type: RoomType,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Room type with this code already exists' })
  async create(@Body() createRoomTypeDto: CreateRoomTypeDto): Promise<{ success: boolean; data: RoomType; message: string }> {
    const roomType = await this.roomTypesService.create(createRoomTypeDto);
    return {
      success: true,
      data: roomType,
      message: 'Room type created successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a room type' })
  @ApiResponse({
    status: 200,
    description: 'The room type has been successfully updated',
    type: RoomType,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  @ApiResponse({ status: 409, description: 'Room type with this code already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<{ success: boolean; data: RoomType; message: string }> {
    const roomType = await this.roomTypesService.update(+id, updateRoomTypeDto);
    return {
      success: true,
      data: roomType,
      message: 'Room type updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room type' })
  @ApiResponse({ status: 204, description: 'The room type has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.roomTypesService.remove(+id);
  }
} 