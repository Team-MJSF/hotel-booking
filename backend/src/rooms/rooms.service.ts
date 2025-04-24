import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  ResourceNotFoundException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';
import { SearchRoomsDto, SortField, SortOrder } from './dto/search-rooms.dto';
import { NotFoundException } from '@nestjs/common';

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
      // Validate ID to prevent database errors with invalid values
      if (isNaN(id) || id <= 0) {
        throw new ResourceNotFoundException('Room', `Invalid ID: ${id}`);
      }

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
      this.validateRoomData(createRoomDto);
      
      const room = this.roomsRepository.create(createRoomDto);
      return await this.roomsRepository.save(room);
    } catch (error) {
      if (error.message.includes('validation failed')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to create room');
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
      this.validateRoomData(updateRoomDto);
      
      const room = await this.findOne(id);
      const updatedRoom = Object.assign(room, updateRoomDto);
      return await this.roomsRepository.save(updatedRoom);
    } catch (error) {
      if (error.message.includes('validation failed')) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update room ${id}`);
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
      const result = await this.roomsRepository.softDelete(id);
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
        // Join with bookings to check availability
        .leftJoin('room.bookings', 'booking')
        // Room must be in available status (not under maintenance, etc.)
        .where('room.availabilityStatus = :status', {
          status: AvailabilityStatus.AVAILABLE,
        })
        // Check for booking conflicts
        .andWhere(
          // Either no bookings exist OR no booking conflicts with requested dates
          '(booking.bookingId IS NULL OR NOT (' +
            ':checkInDate < booking.checkOutDate AND ' +
            ':checkOutDate > booking.checkInDate))',
          {
            checkInDate,
            checkOutDate,
          },
        );

      // Apply optional filters
      if (roomType) {
        query.andWhere('room.type = :type', { type: roomType });
      }

      if (maxGuests) {
        query.andWhere('room.maxGuests >= :maxGuests', { maxGuests });
      }

      if (maxPrice) {
        query.andWhere('room.pricePerNight <= :maxPrice', { maxPrice });
      }

      // Ensure we don't get duplicate rooms
      query.distinct(true);

      return await query.getMany();
    } catch (error) {
      throw new DatabaseException('Failed to fetch available rooms', error);
    }
  }

  async searchAvailableRooms(searchDto: SearchRoomsDto): Promise<Room[]> {
    try {
      const query = this.roomsRepository
        .createQueryBuilder('room')
        // Join with bookings to check availability
        .leftJoin('room.bookings', 'booking')
        // Room must be in available status
        .where('room.availabilityStatus = :status', { status: AvailabilityStatus.AVAILABLE });

      // Apply room type filter
      if (searchDto.roomType) {
        query.andWhere('room.type = :type', { type: searchDto.roomType });
      }

      // Apply max guests filter
      if (searchDto.maxGuests) {
        query.andWhere('room.maxGuests >= :maxGuests', { maxGuests: searchDto.maxGuests });
      }

      // Apply price range filter
      if (searchDto.minPrice !== undefined) {
        query.andWhere('room.pricePerNight >= :minPrice', { minPrice: searchDto.minPrice });
      }
      if (searchDto.maxPrice !== undefined) {
        query.andWhere('room.pricePerNight <= :maxPrice', { maxPrice: searchDto.maxPrice });
      }

      // Apply amenities filter
      if (searchDto.amenities?.length) {
        searchDto.amenities.forEach((amenity, index) => {
          query.andWhere(`JSON_CONTAINS(room.amenities, :amenity${index})`, {
            [`amenity${index}`]: JSON.stringify(amenity),
          });
        });
      }

      // Apply date range filter
      if (searchDto.checkInDate && searchDto.checkOutDate) {
        query.andWhere(
          '(booking.bookingId IS NULL OR NOT (' +
            ':checkInDate < booking.checkOutDate AND ' +
            ':checkOutDate > booking.checkInDate))',
          {
            checkInDate: searchDto.checkInDate,
            checkOutDate: searchDto.checkOutDate,
          },
        );
      }

      // Apply sorting
      if (searchDto.sortBy) {
        const sortOrder = searchDto.sortOrder || SortOrder.ASC;
        switch (searchDto.sortBy) {
          case SortField.PRICE:
            query.orderBy('room.pricePerNight', sortOrder);
            break;
          case SortField.TYPE:
            query.orderBy('room.type', sortOrder);
            break;
          case SortField.MAX_GUESTS:
            query.orderBy('room.maxGuests', sortOrder);
            break;
          case SortField.ROOM_NUMBER:
            query.orderBy('room.roomNumber', sortOrder);
            break;
        }
      }

      // Ensure we don't get duplicate rooms
      query.distinct(true);

      return await query.getMany();
    } catch (error) {
      throw new DatabaseException('Failed to fetch available rooms', error);
    }
  }

  async findByRoomNumber(roomNumber: string): Promise<Room | null> {
    try {
      return await this.roomsRepository.findOne({
        where: { roomNumber },
      });
    } catch (error) {
      throw new DatabaseException('Failed to find room by number');
    }
  }

  async searchRoomsByDescription(searchText: string): Promise<Room[]> {
    try {
      return await this.roomsRepository
        .createQueryBuilder('room')
        .where('LOWER(room.description) LIKE LOWER(:searchText)', {
          searchText: `%${searchText}%`,
        })
        .getMany();
    } catch (error) {
      throw new DatabaseException('Failed to search rooms by description');
    }
  }

  async findByRoomNumberAndAvailability(roomNumber: string): Promise<Room | null> {
    try {
      return await this.roomsRepository.findOne({
        where: {
          roomNumber,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
      });
    } catch (error) {
      throw new DatabaseException('Failed to find available room by number');
    }
  }

  /**
   * Updates a room's availability status
   * @param id - The ID of the room to update
   * @param status - The new availability status
   * @returns Promise<Room> The updated room
   */
  async updateAvailability(id: number, status: string): Promise<Room> {
    try {
      const room = await this.findOne(id);
      
      if (!room) {
        throw new ResourceNotFoundException('Room', id);
      }
      
      // Update the room's availability status
      room.availabilityStatus = status as AvailabilityStatus;
      
      return await this.roomsRepository.save(room);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to update room availability', error as Error);
    }
  }

  /**
   * Validates room data before saving to ensure all required fields are present and correctly formatted
   * @param roomData - The room data to validate
   * @returns boolean - True if the room data is valid
   * @throws Error with details about validation failures
   */
  validateRoomData(roomData: CreateRoomDto | UpdateRoomDto): boolean {
    const errors: string[] = [];

    // Check for required fields in CreateRoomDto
    if ('roomNumber' in roomData && (!roomData.roomNumber || typeof roomData.roomNumber !== 'string')) {
      errors.push('Room number is required and must be a string');
    }

    if ('type' in roomData && (!roomData.type || typeof roomData.type !== 'string')) {
      errors.push('Room type is required and must be a string');
    }

    if ('maxGuests' in roomData) {
      const maxGuests = Number(roomData.maxGuests);
      if (isNaN(maxGuests) || maxGuests <= 0) {
        errors.push('Max guests must be a positive number');
      }
    }

    if ('pricePerNight' in roomData) {
      const price = Number(roomData.pricePerNight);
      if (isNaN(price) || price < 0) {
        errors.push('Price per night must be a non-negative number');
      }
    }

    // Validate amenities is a valid JSON string if provided
    if ('amenities' in roomData && roomData.amenities) {
      try {
        if (typeof roomData.amenities === 'string') {
          JSON.parse(roomData.amenities);
        }
      } catch (e) {
        errors.push('Amenities must be a valid JSON string');
      }
    }

    // If there are any validation errors, throw an exception
    if (errors.length > 0) {
      throw new Error(`Room validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}
