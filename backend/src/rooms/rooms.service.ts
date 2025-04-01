import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { SearchRoomsDto } from './dto/search-rooms.dto';

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

      const room = this.roomsRepository.create({
        ...createRoomDto,
        amenities: createRoomDto.amenities || '[]',
      });
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
      const updateData = {
        ...updateRoomDto,
        amenities: updateRoomDto.amenities || undefined,
      };
      const result = await this.roomsRepository.update(id, updateData);
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
          }
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
      console.log('Search DTO:', JSON.stringify(searchDto, null, 2));
      
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
        console.log('Amenities filter:', JSON.stringify(searchDto.amenities, null, 2));
        searchDto.amenities.forEach((amenity, index) => {
          console.log(`Adding amenity filter for ${amenity}`);
          query.andWhere(`JSON_CONTAINS(room.amenities, :amenity${index})`, {
            [`amenity${index}`]: JSON.stringify(amenity),
          });
        });
      }

      // Apply date range filter
      if (searchDto.checkInDate && searchDto.checkOutDate) {
        console.log('Date range:', {
          checkIn: searchDto.checkInDate,
          checkOut: searchDto.checkOutDate
        });
        query.andWhere(
          '(booking.bookingId IS NULL OR NOT (' +
          ':checkInDate < booking.checkOutDate AND ' +
          ':checkOutDate > booking.checkInDate))',
          {
            checkInDate: searchDto.checkInDate,
            checkOutDate: searchDto.checkOutDate,
          }
        );
      }

      // Ensure we don't get duplicate rooms
      query.distinct(true);

      const rooms = await query.getMany();
      console.log('Found rooms:', JSON.stringify(rooms, null, 2));
      return rooms;
    } catch (error) {
      console.error('Error in searchAvailableRooms:', error);
      throw new DatabaseException('Failed to fetch available rooms', error);
    }
  }
}
