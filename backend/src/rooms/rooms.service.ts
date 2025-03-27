import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

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
    return this.roomsRepository.find({
      relations: ['bookings'],
    });
  }

  /**
   * Retrieves a single room by ID
   * @param id - The ID of the room to retrieve
   * @returns Promise<Room> The room with the specified ID
   * @throws NotFoundException if room is not found
   */
  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id: id },
      relations: ['bookings'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  /**
   * Creates a new room
   * @param createRoomDto - The data for creating a new room
   * @returns Promise<Room> The newly created room
   */
  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomsRepository.create(createRoomDto);
    return this.roomsRepository.save(room);
  }

  /**
   * Updates an existing room
   * @param id - The ID of the room to update
   * @param updateRoomDto - The data to update the room with
   * @returns Promise<Room> The updated room
   * @throws NotFoundException if room is not found
   */
  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const result = await this.roomsRepository.update(id, updateRoomDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  /**
   * Removes a room from the database
   * @param id - The ID of the room to remove
   * @returns Promise<void>
   * @throws NotFoundException if room is not found
   */
  async remove(id: number): Promise<void> {
    const result = await this.roomsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
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
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .where('room.availabilityStatus = :status', {
        status: AvailabilityStatus.AVAILABLE,
      });

    if (roomType) {
      query.andWhere('room.roomType = :roomType', { roomType });
    }

    if (maxGuests) {
      query.andWhere('room.maxGuests >= :maxGuests', { maxGuests });
    }

    if (maxPrice) {
      query.andWhere('room.pricePerNight <= :maxPrice', { maxPrice });
    }

    // Check for overlapping bookings
    query.andWhere(
      '(booking.checkInDate IS NULL OR booking.checkOutDate <= :checkInDate OR booking.checkInDate >= :checkOutDate)',
      { checkInDate, checkOutDate },
    );

    return query.getMany();
  }
}
