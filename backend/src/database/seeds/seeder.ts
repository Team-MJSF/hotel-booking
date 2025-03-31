import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Room, RoomType, AvailabilityStatus } from '../../rooms/entities/room.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Payment, PaymentStatus, PaymentMethod, Currency } from '../../payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

export class Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    try {
      // Initialize the database connection
      await this.dataSource.initialize();
      console.log('Database connection initialized.');

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
      // Close the database connection
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('Database connection closed.');
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
    const userPassword = await bcrypt.hash('user123', 10);
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

// Run seeder if this file is executed directly
if (require.main === module) {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'hotel_booking',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  const seeder = new Seeder(dataSource);
  seeder.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 