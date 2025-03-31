import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  /**
   * Retrieves all rooms from the database
   * @returns Promise<Room[]> Array of all rooms with their bookings
   */
  async findAll(): Promise<Room[]> {
    try {
      return await this.roomsRepository.find();
    } catch (error) {
      throw new DatabaseException('Failed to fetch rooms', error);
    }
  }

  /**
   * Retrieves a single room by ID
   * @param id - The ID of the room to retrieve
   * @returns Promise<Room> The room with the specified ID
   * @throws NotFoundException if room is not found
   */
  async findOne(id: number): Promise<Room> {
    try {
      const room = await this.roomsRepository.findOne({ where: { id } });
      if (!room) {
        throw new ResourceNotFoundException('Room', id);
      }
      return room;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to fetch room', error);
    }
  }

  /**
   * Creates a new room
   * @param createRoomDto - The data for creating a new room
   * @returns Promise<Room> The newly created room
   */
  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      // Check if room number already exists
      const existingRoom = await this.roomsRepository.findOne({
        where: { roomNumber: createRoomDto.roomNumber },
      });
      if (existingRoom) {
        throw new ConflictException(`Room with number ${createRoomDto.roomNumber} already exists`);
      }

      const room = this.roomsRepository.create(createRoomDto);
      return await this.roomsRepository.save(room);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to create room', error);
    }
  }

  /**
   * Updates an existing room
   * @param id - The ID of the room to update
   * @param updateRoomDto - The data to update the room with
   * @returns Promise<Room> The updated room
   * @throws NotFoundException if room is not found
   */
  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    try {
      const result = await this.roomsRepository.update(id, updateRoomDto);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('Room', id);
      }
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to update room', error);
    }
  }

  /**
   * Removes a room from the database
   * @param id - The ID of the room to remove
   * @returns Promise<void>
   * @throws NotFoundException if room is not found
   */
  async remove(id: number): Promise<void> {
    try {
      const result = await this.roomsRepository.delete(id);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('Room', id);
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete room', error);
    }
  }

  /**
   * Finds available rooms based on search criteria
   * @param checkInDate - The check-in date for the booking
   * @param checkOutDate - The check-out date for the booking
   * @param roomType - Optional room type filter
   * @param maxGuests - Optional maximum number of guests filter
   * @param maxPrice - Optional maximum price per night filter
   * @returns Promise<Room[]> Array of available rooms matching the criteria
   */
  async findAvailableRooms(
    checkInDate: Date,
    checkOutDate: Date,
    roomType?: string,
    maxGuests?: number,
    maxPrice?: number,
  ): Promise<Room[]> {
    try {
      const query = this.roomsRepository
        .createQueryBuilder('room')
        .where('room.availabilityStatus = :status', {
          status: AvailabilityStatus.AVAILABLE,
        });

      if (roomType) {
        query.andWhere('room.type = :type', { type: roomType });
      }

      if (maxGuests) {
        query.andWhere('room.maxGuests >= :maxGuests', { maxGuests });
      }

      if (maxPrice) {
        query.andWhere('room.pricePerNight <= :maxPrice', { maxPrice });
      }

      return await query.getMany();
    } catch (error) {
      throw new DatabaseException('Failed to fetch available rooms', error);
    }
  }
}
