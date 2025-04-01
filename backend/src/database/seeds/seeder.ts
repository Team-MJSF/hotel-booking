/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room, RoomType, AvailabilityStatus } from '../../rooms/entities/room.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Payment, PaymentStatus, PaymentMethod, Currency } from '../../payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../config/typeorm.config';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
config({ path: path.resolve(process.cwd(), `.env.${env}`) });

async function runSeeder() {
  try {
    const seeder = new Seeder(AppDataSource);
    await seeder.seed();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

export class Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    try {
      // Initialize the data source if not already initialized
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      // Clear existing data
      await this.clearTables();
      
      // Seed in order of dependencies
      const users = await this.seedUsers();
      const rooms = await this.seedRooms();
      const bookings = await this.seedBookings(users, rooms);
      await this.seedPayments(bookings);
      
      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    } finally {
      // Close the connection when done
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
    }
  }

  private async clearTables() {
    console.log('Clearing existing data...');
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await this.dataSource.query('TRUNCATE TABLE payments');
    await this.dataSource.query('TRUNCATE TABLE bookings');
    await this.dataSource.query('TRUNCATE TABLE rooms');
    await this.dataSource.query('TRUNCATE TABLE users');
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables cleared.');
  }

  private async seedUsers() {
    console.log('Seeding users...');
    const userRepository = this.dataSource.getRepository(User);
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await userRepository.save({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hotel.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      phoneNumber: '1234567890'
    });

    // Create test user
    const userPassword = await bcrypt.hash('user1234', 10);
    const user = await userRepository.save({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: userPassword,
      role: UserRole.USER,
      phoneNumber: '9876543210'
    });

    console.log('Users seeded:', { admin: admin.email, user: user.email });
    return { admin, user };
  }

  private async seedRooms() {
    console.log('Seeding rooms...');
    const roomRepository = this.dataSource.getRepository(Room);
    
    // Create one of each room type
    const rooms = await roomRepository.save([
      {
        roomNumber: '101',
        type: RoomType.SINGLE,
        pricePerNight: 100,
        maxGuests: 1,
        description: 'Single Room',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        amenities: JSON.stringify({
          wifi: true,
          tv: true,
          airConditioning: true
        })
      },
      {
        roomNumber: '201',
        type: RoomType.DOUBLE,
        pricePerNight: 150,
        maxGuests: 2,
        description: 'Double Room',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        amenities: JSON.stringify({
          wifi: true,
          tv: true,
          airConditioning: true,
          minibar: true
        })
      }
    ]);

    console.log('Rooms seeded:', rooms.map(r => r.roomNumber));
    return rooms;
  }

  private async seedBookings(users: { admin: User; user: User }, rooms: Room[]) {
    console.log('Seeding bookings...');
    const bookingRepository = this.dataSource.getRepository(Booking);
    
    // Create a test booking
    const bookings = await bookingRepository.save([
      {
        user: users.user,
        room: rooms[0],
        checkInDate: new Date('2024-04-01'),
        checkOutDate: new Date('2024-04-03'),
        numberOfGuests: 1,
        status: BookingStatus.CONFIRMED
      }
    ]);

    console.log('Bookings seeded:', bookings.length);
    return bookings;
  }

  private async seedPayments(bookings: Booking[]) {
    console.log('Seeding payments...');
    const paymentRepository = this.dataSource.getRepository(Payment);
    
    // Create payment for the test booking
    const payments = await paymentRepository.save([
      {
        booking: bookings[0],
        amount: 200,
        currency: Currency.USD,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        transactionId: 'test_transaction'
      }
    ]);

    console.log('Payments seeded:', payments.length);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSeeder();
} 