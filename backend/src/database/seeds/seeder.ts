/* eslint-disable no-console */
import { User, UserRole } from '../../users/entities/user.entity';
import { Room, AvailabilityStatus, RoomType, PhotoType } from '../../rooms/entities/room.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import {
  Payment,
  Currency,
  PaymentMethod,
  PaymentStatus,
} from '../../payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { join } from 'path';

// Initialize logger
const logger = new Logger('DatabaseSeeder');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

export class Seeder {
  private dataSource: DataSource;
  private initialized = false;

  constructor() {
    // Configure DataSource with environment variables
    this.dataSource = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist-migrations/src/**/entities/*.entity.js'],
      synchronize: false,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.dataSource.initialize();
      this.initialized = true;
      logger.log('DataSource initialized for seeding');
    } catch (error) {
      logger.error('Failed to initialize DataSource for seeding:', error);
      throw error;
    }
  }

  async seed(): Promise<void> {
    await this.initialize();

    await this.seedUsers();
    await this.seedRooms();
    await this.seedBookings();
    await this.seedPayments();

    logger.log('Database seeded successfully');
  }

  async seedUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // Check if users already exist
    const userCount = await userRepository.count();
    if (userCount > 0) {
      logger.log(`Skipping user seeding - ${userCount} users already exist`);
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      phoneNumber: '+1234567890',
      address: '123 Admin St',
      tokenVersion: 0,
    });

    // Create regular user
    const userPassword = await bcrypt.hash('User123!', 10);
    const user = userRepository.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: userPassword,
      role: UserRole.USER,
      phoneNumber: '+0987654321',
      address: '456 User St',
      tokenVersion: 0,
    });

    await userRepository.save([admin, user]);
    logger.log('Users seeded successfully');
  }

  async seedRooms(): Promise<void> {
    const roomRepository = this.dataSource.getRepository(Room);

    // Check if rooms already exist
    const roomCount = await roomRepository.count();
    if (roomCount > 0) {
      logger.log(`Skipping room seeding - ${roomCount} rooms already exist`);
      return;
    }

    // Create rooms with different types
    const rooms = [];

    // Single rooms (101-110)
    for (let i = 1; i <= 10; i++) {
      const roomNumber = `10${i}`;
      const room = new Room();
      room.roomNumber = roomNumber;
      room.type = RoomType.SINGLE;
      room.pricePerNight = 75.0;
      room.maxGuests = 1;
      room.description = `Cozy single room #${roomNumber}`;
      room.amenities = JSON.stringify(['WiFi', 'TV', 'Air Conditioning']);
      room.photos = [
        {
          url: `room_${roomNumber}_1.jpg`,
          type: PhotoType.MAIN,
          caption: `Main view of room ${roomNumber}`,
          displayOrder: 1,
        },
        {
          url: `room_${roomNumber}_2.jpg`,
          type: PhotoType.GALLERY,
          caption: `Additional view of room ${roomNumber}`,
          displayOrder: 2,
        },
      ];
      room.availabilityStatus = AvailabilityStatus.AVAILABLE;
      rooms.push(room);
    }

    // Double rooms (201-210)
    for (let i = 1; i <= 10; i++) {
      const roomNumber = `20${i}`;
      const room = new Room();
      room.roomNumber = roomNumber;
      room.type = RoomType.DOUBLE;
      room.pricePerNight = 120.0;
      room.maxGuests = 2;
      room.description = `Comfortable double room #${roomNumber}`;
      room.amenities = JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar']);
      room.photos = [
        {
          url: `room_${roomNumber}_1.jpg`,
          type: PhotoType.MAIN,
          caption: `Main view of room ${roomNumber}`,
          displayOrder: 1,
        },
        {
          url: `room_${roomNumber}_2.jpg`,
          type: PhotoType.GALLERY,
          caption: `Additional view of room ${roomNumber}`,
          displayOrder: 2,
        },
      ];
      room.availabilityStatus = AvailabilityStatus.AVAILABLE;
      rooms.push(room);
    }

    // Suite rooms (301-305)
    for (let i = 1; i <= 5; i++) {
      const roomNumber = `30${i}`;
      const room = new Room();
      room.roomNumber = roomNumber;
      room.type = RoomType.SUITE;
      room.pricePerNight = 200.0;
      room.maxGuests = 3;
      room.description = `Luxurious suite #${roomNumber} with a view`;
      room.amenities = JSON.stringify([
        'WiFi',
        'TV',
        'Air Conditioning',
        'Mini Bar',
        'Room Service',
      ]);
      room.photos = [
        {
          url: `room_${roomNumber}_1.jpg`,
          type: PhotoType.MAIN,
          caption: `Main view of suite ${roomNumber}`,
          displayOrder: 1,
        },
        {
          url: `room_${roomNumber}_2.jpg`,
          type: PhotoType.GALLERY,
          caption: `Living area of suite ${roomNumber}`,
          displayOrder: 2,
        },
        {
          url: `room_${roomNumber}_3.jpg`,
          type: PhotoType.GALLERY,
          caption: `Bathroom of suite ${roomNumber}`,
          displayOrder: 3,
        },
      ];
      room.availabilityStatus = AvailabilityStatus.AVAILABLE;
      rooms.push(room);
    }

    // Deluxe rooms (401-403)
    for (let i = 1; i <= 3; i++) {
      const roomNumber = `40${i}`;
      const room = new Room();
      room.roomNumber = roomNumber;
      room.type = RoomType.DELUXE;
      room.pricePerNight = 300.0;
      room.maxGuests = 4;
      room.description = `Deluxe room #${roomNumber} with premium amenities`;
      room.amenities = JSON.stringify([
        'WiFi',
        'TV',
        'Air Conditioning',
        'Mini Bar',
        'Room Service',
        'Jacuzzi',
      ]);
      room.photos = [
        {
          url: `room_${roomNumber}_1.jpg`,
          type: PhotoType.MAIN,
          caption: `Main view of deluxe room ${roomNumber}`,
          displayOrder: 1,
        },
        {
          url: `room_${roomNumber}_2.jpg`,
          type: PhotoType.GALLERY,
          caption: `Living area of deluxe room ${roomNumber}`,
          displayOrder: 2,
        },
        {
          url: `room_${roomNumber}_3.jpg`,
          type: PhotoType.GALLERY,
          caption: `Jacuzzi in deluxe room ${roomNumber}`,
          displayOrder: 3,
        },
      ];
      room.availabilityStatus = AvailabilityStatus.AVAILABLE;
      rooms.push(room);
    }

    await roomRepository.save(rooms);
    logger.log('Rooms seeded successfully');
  }

  async seedBookings(): Promise<void> {
    const bookingRepository = this.dataSource.getRepository(Booking);
    const userRepository = this.dataSource.getRepository(User);
    const roomRepository = this.dataSource.getRepository(Room);

    // Check if bookings already exist
    const bookingCount = await bookingRepository.count();
    if (bookingCount > 0) {
      logger.log(`Skipping booking seeding - ${bookingCount} bookings already exist`);
      return;
    }

    // Get users and rooms
    const users = await userRepository.find();
    const rooms = await roomRepository.find();

    if (users.length === 0 || rooms.length === 0) {
      logger.warn('Cannot seed bookings - no users or rooms found');
      return;
    }

    const bookings = [];

    // Create some confirmed bookings
    const today = new Date();

    // Booking 1: Past booking (completed)
    const pastCheckIn = new Date(today);
    pastCheckIn.setDate(pastCheckIn.getDate() - 14);
    const pastCheckOut = new Date(today);
    pastCheckOut.setDate(pastCheckOut.getDate() - 10);

    bookings.push(
      bookingRepository.create({
        checkInDate: pastCheckIn,
        checkOutDate: pastCheckOut,
        numberOfGuests: 2,
        specialRequests: 'Extra pillows please',
        status: BookingStatus.COMPLETED,
        user: users[1], // Regular user
        room: rooms[0], // First room
      }),
    );

    // Booking 2: Current booking (confirmed)
    const currentCheckIn = new Date(today);
    currentCheckIn.setDate(currentCheckIn.getDate() - 2);
    const currentCheckOut = new Date(today);
    currentCheckOut.setDate(currentCheckOut.getDate() + 3);

    bookings.push(
      bookingRepository.create({
        checkInDate: currentCheckIn,
        checkOutDate: currentCheckOut,
        numberOfGuests: 1,
        specialRequests: 'High floor if possible',
        status: BookingStatus.CONFIRMED,
        user: users[0], // Admin user
        room: rooms[10], // Room in 200s
      }),
    );

    // Booking 3: Future booking (confirmed)
    const futureCheckIn = new Date(today);
    futureCheckIn.setDate(futureCheckIn.getDate() + 10);
    const futureCheckOut = new Date(today);
    futureCheckOut.setDate(futureCheckOut.getDate() + 15);

    bookings.push(
      bookingRepository.create({
        checkInDate: futureCheckIn,
        checkOutDate: futureCheckOut,
        numberOfGuests: 3,
        specialRequests: 'Anniversary celebration - flowers requested',
        status: BookingStatus.CONFIRMED,
        user: users[1], // Regular user
        room: rooms[15], // Suite room
      }),
    );

    await bookingRepository.save(bookings);
    logger.log('Bookings seeded successfully');
  }

  async seedPayments(): Promise<void> {
    const paymentRepository = this.dataSource.getRepository(Payment);
    const bookingRepository = this.dataSource.getRepository(Booking);

    // Check if payments already exist
    const paymentCount = await paymentRepository.count();
    if (paymentCount > 0) {
      logger.log(`Skipping payment seeding - ${paymentCount} payments already exist`);
      return;
    }

    // Get bookings
    const bookings = await bookingRepository.find({
      relations: ['room'],
    });

    if (bookings.length === 0) {
      logger.warn('Cannot seed payments - no bookings found');
      return;
    }

    const payments = [];

    // Create payments for each booking
    for (const booking of bookings) {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const amount = booking.room.pricePerNight * nights;

      // Payment status based on booking status
      let paymentStatus = PaymentStatus.PENDING;
      if (booking.status === BookingStatus.COMPLETED) {
        paymentStatus = PaymentStatus.COMPLETED;
      } else if (booking.status === BookingStatus.CONFIRMED) {
        paymentStatus = PaymentStatus.COMPLETED;
      }

      payments.push(
        paymentRepository.create({
          amount,
          currency: Currency.USD,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          transactionId: `TRANS-${Math.floor(Math.random() * 1000000)}`,
          status: paymentStatus,
          booking,
        }),
      );
    }

    await paymentRepository.save(payments);
    logger.log('Payments seeded successfully');
  }

  async close(): Promise<void> {
    if (this.initialized) {
      await this.dataSource.destroy();
      logger.log('DataSource closed');
    }
  }
}

// If this file is run directly, run the seeder
if (require.main === module) {
  const seeder = new Seeder();
  seeder
    .seed()
    .then(() => {
      logger.log('Seeding completed');
      return seeder.close();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
