/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room, RoomType, AvailabilityStatus, PhotoType } from '../../rooms/entities/room.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Payment, PaymentStatus, PaymentMethod, Currency } from '../../payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/typeorm.config';
import { Logger } from '@nestjs/common';

export class Seeder {
  private readonly logger = new Logger(Seeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    // Only seed in development environment
    if (process.env.NODE_ENV !== 'development') {
      this.logger.log('Skipping seeding in non-development environment');
      return;
    }

    try {
      // Initialize the database connection
      await this.dataSource.initialize();
      this.logger.log('Database connection initialized.');

      // Clear existing data
      await this.clearTables();
      
      // Seed in order of dependencies
      const users = await this.seedUsers();
      const rooms = await this.seedRooms();
      const bookings = await this.seedBookings(users, rooms);
      await this.seedPayments(bookings);
      
      this.logger.log('Seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    } finally {
      await this.dataSource.destroy();
    }
  }

  private async clearTables() {
    const entities = this.dataSource.entityMetadatas;
    
    // Disable foreign key checks
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    
    try {
      // Truncate tables in reverse order of dependencies
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE ${entity.tableName}`);
      }
    } finally {
      // Re-enable foreign key checks
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  private async seedUsers() {
    const userRepository = this.dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        phoneNumber: '1234567890',
        address: '123 Admin St',
      },
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        role: UserRole.USER,
        phoneNumber: '0987654321',
        address: '456 Test St',
      },
    ];

    return await userRepository.save(users);
  }

  private async seedRooms() {
    const roomRepository = this.dataSource.getRepository(Room);

    const rooms = [
      {
        roomNumber: '101',
        type: RoomType.SINGLE,
        pricePerNight: 100,
        maxGuests: 2,
        description: 'Standard single room',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning']),
        photos: [
          {
            url: 'room101.jpg',
            type: PhotoType.MAIN,
            caption: 'Main view of room 101',
            displayOrder: 1
          }
        ]
      },
      {
        roomNumber: '102',
        type: RoomType.DOUBLE,
        pricePerNight: 150,
        maxGuests: 4,
        description: 'Deluxe double room',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar']),
        photos: [
          {
            url: 'room102.jpg',
            type: PhotoType.MAIN,
            caption: 'Main view of room 102',
            displayOrder: 1
          }
        ]
      },
    ];

    return await roomRepository.save(rooms);
  }

  private async seedBookings(users: User[], rooms: Room[]) {
    const bookingRepository = this.dataSource.getRepository(Booking);

    const bookings = [
      {
        user: users[1],
        room: rooms[0],
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        numberOfGuests: 2,
        specialRequests: 'Late check-in requested',
        status: BookingStatus.CONFIRMED,
      },
    ];

    return await bookingRepository.save(bookings);
  }

  private async seedPayments(bookings: Booking[]) {
    const paymentRepository = this.dataSource.getRepository(Payment);

    const payments = [
      {
        booking: bookings[0],
        amount: 700,
        currency: Currency.USD,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: 'TEST123',
        status: PaymentStatus.COMPLETED,
      },
    ];

    return await paymentRepository.save(payments);
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  const seeder = new Seeder(dataSource);
  seeder.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 