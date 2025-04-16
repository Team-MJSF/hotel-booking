import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import {
  ResourceNotFoundException,
  ConflictException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';

@Injectable()
export class RoomTypesService {
  constructor(
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
  ) {}

  /**
   * Get all room types
   * @returns Promise<RoomType[]> List of all room types
   */
  async findAll(): Promise<RoomType[]> {
    try {
      return await this.roomTypeRepository.find({
        order: { displayOrder: 'ASC' },
      });
    } catch (error) {
      throw new DatabaseException(error.message);
    }
  }

  /**
   * Get a room type by ID
   * @param id - The ID of the room type to find
   * @returns Promise<RoomType> The found room type
   */
  async findOne(id: number): Promise<RoomType> {
    try {
      const roomType = await this.roomTypeRepository.findOne({
        where: { id },
      });
      
      if (!roomType) {
        throw new ResourceNotFoundException(`Room type with ID ${id} not found`, 'RoomType');
      }
      
      return roomType;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Failed to fetch room type with ID ${id}`, error);
    }
  }

  /**
   * Create a new room type
   * @param createRoomTypeDto - The data for creating a new room type
   * @returns Promise<RoomType> The created room type
   */
  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    try {
      // Check if a room type with the same code already exists
      const existingRoomType = await this.roomTypeRepository.findOne({
        where: { code: createRoomTypeDto.code },
      });
      
      if (existingRoomType) {
        throw new ConflictException(`Room type with code ${createRoomTypeDto.code} already exists`);
      }
      
      const roomType = this.roomTypeRepository.create(createRoomTypeDto);
      
      return await this.roomTypeRepository.save(roomType);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException(error.message);
    }
  }

  /**
   * Update a room type
   * @param id - The ID of the room type to update
   * @param updateRoomTypeDto - The data for updating the room type
   * @returns Promise<RoomType> The updated room type
   */
  async update(
    id: number,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    try {
      const roomType = await this.findOne(id);

      // Check if updating code and if it already exists for another room type
      if (
        updateRoomTypeDto.code &&
        updateRoomTypeDto.code !== roomType.code
      ) {
        const existingRoomType = await this.roomTypeRepository.findOne({
          where: { code: updateRoomTypeDto.code },
        });

        if (existingRoomType && existingRoomType.id !== id) {
          throw new ConflictException(
            `Room type with code ${updateRoomTypeDto.code} already exists`,
          );
        }
      }

      await this.roomTypeRepository.update(id, updateRoomTypeDto);
      
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException(`Failed to update room type with ID ${id}`, error);
    }
  }

  /**
   * Delete a room type
   * @param id - The ID of the room type to delete
   * @returns Promise<void>
   */
  async remove(id: number): Promise<void> {
    try {
      // Check if the room type exists
      await this.findOne(id);
      
      // Delete the room type
      await this.roomTypeRepository.delete(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Failed to delete room type with ID ${id}`, error);
    }
  }

  /**
   * Get a room type by code
   * @param code - The code of the room type to find
   * @returns Promise<RoomType> The found room type
   */
  async findByCode(code: string): Promise<RoomType> {
    try {
      const roomType = await this.roomTypeRepository.findOne({
        where: { code },
      });
      
      if (!roomType) {
        throw new ResourceNotFoundException(`Room type with code ${code} not found`, 'RoomType');
      }
      
      return roomType;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Failed to fetch room type with code ${code}`, error);
    }
  }
} 