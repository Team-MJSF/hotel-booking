/**
 * Enhanced Seed Script
 * A TypeScript script to seed the database with test data for all entities
 * This bypasses TypeORM entities and uses direct SQL queries
 */
import { Database } from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: '.env.development' });

// Database path
const dbPath = process.env.DB_NAME || path.join(process.cwd(), 'data', 'hotel_booking_dev.sqlite');

// Logger utility for consistent logging with ESLint exceptions
const logger = {
  log: (message: string): void => {
    // eslint-disable-next-line no-console
    console.log(message);
  },
  error: (message: string, error?: unknown): void => {
    // eslint-disable-next-line no-console
    console.error(message, error || '');
  }
};

// Define type for a room
interface Room {
  room_number: string;
  room_type: 'single' | 'double' | 'suite' | 'deluxe';
  price_per_night: number;
  max_guests: number;
  description: string;
  amenities: string; // JSON stringified array
  availability_status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  photos: string; // JSON stringified array of photo objects
}

// Define photo interface used in the photos JSON string
interface Photo {
  url: string;
  type: string;
  caption: string;
  displayOrder: number;
}

// Define type for a user
interface User {
  first_name: string;
  last_name: string;
  email: string;
  password: string; // Hashed password
  role: 'admin' | 'user';
  phone_number?: string;
  address?: string;
  is_active: boolean;
}

// Define type for a booking
interface Booking {
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
}

// Define type for a payment
interface Payment {
  booking_id: number;
  amount: number;
  currency: 'USD' | 'EUR';
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refund_reason?: string;
}

async function seed(): Promise<void> {
  logger.log('Starting enhanced seed process...');
  
  // Create log file
  const logPath = path.join(process.cwd(), 'seed-log.txt');
  fs.writeFileSync(logPath, `Seed started at ${new Date().toISOString()}\n`);
  
  // Make sure the 'data' directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create a database connection
  const db = new Database(dbPath, (err) => {
    if (err) {
      logger.error('Error connecting to SQLite database:', err);
      fs.appendFileSync(logPath, `Error: ${err}\n`);
      process.exit(1);
    }
    logger.log(`Connected to SQLite database at ${dbPath}`);
    fs.appendFileSync(logPath, `Connected to database\n`);
  });
  
  // Promisify db.run and db.get
  const run = (sql: string, params: unknown[] = []): Promise<{ lastID: number }> => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(this: { lastID: number }, err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
  };
  
  const get = <T>(sql: string, params: unknown[] = []): Promise<T> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  };
  
  try {
    // Check if required tables exist
    const tables = ['users', 'rooms', 'bookings', 'payments', 'refresh_tokens'];
    
    for (const table of tables) {
      const tableExists = await get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", 
        [table]
      );
      
      if (!tableExists) {
        const error = `${table} table does not exist. Please run migrations first.`;
        logger.error(error);
        fs.appendFileSync(logPath, `ERROR: ${error}\n`);
        return;
      }
      fs.appendFileSync(logPath, `${table} table exists\n`);
    }
    
    // 1. SEED USERS
    logger.log('Seeding users...');
    fs.appendFileSync(logPath, 'Seeding users...\n');
    
    // Check if users already exist
    const existingUsers = await get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers.count === 0) {
      // Hash passwords
      const saltRounds = 10;
      const adminPassword = await bcrypt.hash('admin123', saltRounds);
      const userPassword = await bcrypt.hash('password123', saltRounds);
      
      // Sample users
      const users: User[] = [
        {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin',
          phone_number: '1234567890',
          address: '123 Admin St, City',
          is_active: true
        },
        {
          first_name: 'Test',
          last_name: 'User',
          email: 'user@example.com',
          password: userPassword,
          role: 'user',
          phone_number: '9876543210',
          address: '456 User Ave, Town',
          is_active: true
        }
      ];
      
      // Insert users
      for (const user of users) {
        await run(
          `INSERT INTO users 
           (first_name, last_name, email, password, role, phone_number, address, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            user.first_name,
            user.last_name,
            user.email,
            user.password,
            user.role,
            user.phone_number,
            user.address,
            user.is_active ? 1 : 0
          ]
        );
        
        logger.log(`Added user: ${user.email} (${user.role})`);
        fs.appendFileSync(logPath, `Added user: ${user.email} (${user.role})\n`);
      }
    } else {
      logger.log(`Database already contains ${existingUsers.count} users. Skipping user seeding.`);
      fs.appendFileSync(logPath, `Found ${existingUsers.count} existing users - skipping seeding\n`);
    }
    
    // 2. SEED ROOMS
    logger.log('Seeding rooms...');
    fs.appendFileSync(logPath, 'Seeding rooms...\n');
    
    // Check if rooms already exist
    const existingRooms = await get<{ count: number }>('SELECT COUNT(*) as count FROM rooms');
    
    if (existingRooms.count === 0) {
      // Sample rooms
      const rooms: Room[] = [
        {
          room_number: '101',
          room_type: 'single',
          price_per_night: 75.0,
          max_guests: 1,
          description: 'Cozy single room with a comfortable bed and modern amenities',
          amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning']),
          availability_status: 'available',
          photos: JSON.stringify([{
            url: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa',
            type: 'main',
            caption: 'Cozy single room',
            displayOrder: 1
          } as Photo])
        },
        {
          room_number: '201',
          room_type: 'double',
          price_per_night: 120.0,
          max_guests: 2,
          description: 'Comfortable double room with two beds, perfect for friends or couples',
          amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar']),
          availability_status: 'available',
          photos: JSON.stringify([{
            url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427',
            type: 'main',
            caption: 'Modern double room',
            displayOrder: 1
          } as Photo])
        },
        {
          room_number: '301',
          room_type: 'suite',
          price_per_night: 200.0,
          max_guests: 3,
          description: 'Luxurious suite with separate living area and premium amenities',
          amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service']),
          availability_status: 'available',
          photos: JSON.stringify([{
            url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
            type: 'main',
            caption: 'Elegant suite room',
            displayOrder: 1
          } as Photo])
        },
        {
          room_number: '401',
          room_type: 'deluxe',
          price_per_night: 300.0,
          max_guests: 4,
          description: 'Deluxe room with premium furnishings and panoramic views',
          amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Jacuzzi']),
          availability_status: 'available',
          photos: JSON.stringify([{
            url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
            type: 'main',
            caption: 'Luxurious deluxe room',
            displayOrder: 1
          } as Photo])
        }
      ];
      
      // Insert rooms
      for (const room of rooms) {
        await run(
          `INSERT INTO rooms 
           (room_number, room_type, price_per_night, max_guests, description, 
            amenities, availability_status, photos, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            room.room_number,
            room.room_type,
            room.price_per_night,
            room.max_guests,
            room.description,
            room.amenities,
            room.availability_status,
            room.photos
          ]
        );
        
        logger.log(`Added room ${room.room_number} (${room.room_type})`);
        fs.appendFileSync(logPath, `Added room ${room.room_number} (${room.room_type})\n`);
      }
    } else {
      logger.log(`Database already contains ${existingRooms.count} rooms. Skipping room seeding.`);
      fs.appendFileSync(logPath, `Found ${existingRooms.count} existing rooms - skipping seeding\n`);
    }
    
    // 3. SEED BOOKINGS
    logger.log('Seeding bookings...');
    fs.appendFileSync(logPath, 'Seeding bookings...\n');
    
    // Check if bookings already exist
    const existingBookings = await get<{ count: number }>('SELECT COUNT(*) as count FROM bookings');
    
    if (existingBookings.count === 0) {
      // Get user IDs
      const regularUser = await get<{ user_id: number }>('SELECT user_id FROM users WHERE role = "user" LIMIT 1');
      if (!regularUser) {
        logger.error('No regular user found. Cannot create bookings.');
        fs.appendFileSync(logPath, 'ERROR: No regular user found. Cannot create bookings.\n');
      } else {
        // Get room IDs
        const rooms = await new Promise<{room_id: number, room_type: string}[]>((resolve, reject) => {
          db.all('SELECT room_id, room_type FROM rooms LIMIT 4', (err, rows) => {
            if (err) reject(err);
            else resolve(rows as {room_id: number, room_type: string}[]);
          });
        });
        
        if (rooms.length === 0) {
          logger.error('No rooms found. Cannot create bookings.');
          fs.appendFileSync(logPath, 'ERROR: No rooms found. Cannot create bookings.\n');
        } else {
          // Sample bookings - one for each status
          const bookings: Booking[] = [
            {
              user_id: regularUser.user_id,
              room_id: rooms.find(r => r.room_type === 'single')?.room_id || rooms[0].room_id,
              check_in_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
              check_out_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
              number_of_guests: 1,
              status: 'pending',
              special_requests: 'Early check-in requested'
            },
            {
              user_id: regularUser.user_id,
              room_id: rooms.find(r => r.room_type === 'double')?.room_id || rooms[1].room_id,
              check_in_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
              check_out_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
              number_of_guests: 2,
              status: 'confirmed'
            },
            {
              user_id: regularUser.user_id,
              room_id: rooms.find(r => r.room_type === 'suite')?.room_id || rooms[2].room_id,
              check_in_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
              check_out_date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days ago
              number_of_guests: 3,
              status: 'completed'
            },
            {
              user_id: regularUser.user_id,
              room_id: rooms.find(r => r.room_type === 'deluxe')?.room_id || rooms[3].room_id,
              check_in_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
              check_out_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
              number_of_guests: 2,
              status: 'cancelled',
              special_requests: 'Cancelled due to change of plans'
            }
          ];
          
          // Insert bookings
          for (const booking of bookings) {
            const result = await run(
              `INSERT INTO bookings 
              (user_id, room_id, check_in_date, check_out_date, number_of_guests, status, special_requests, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [
                booking.user_id,
                booking.room_id,
                booking.check_in_date,
                booking.check_out_date,
                booking.number_of_guests,
                booking.status,
                booking.special_requests
              ]
            );
            
            logger.log(`Added booking for Room ${booking.room_id} (${booking.status})`);
            fs.appendFileSync(logPath, `Added booking for Room ${booking.room_id} (${booking.status})\n`);
            
            // 4. SEED PAYMENTS for confirmed and completed bookings
            if (booking.status === 'confirmed' || booking.status === 'completed') {
              const roomData = await get<{ price_per_night: number }>(
                'SELECT price_per_night FROM rooms WHERE room_id = ?',
                [booking.room_id]
              );
              
              if (roomData) {
                // Calculate nights
                const checkIn = new Date(booking.check_in_date);
                const checkOut = new Date(booking.check_out_date);
                const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                
                // Calculate total amount
                const amount = roomData.price_per_night * nights;
                
                const payment: Payment = {
                  booking_id: result.lastID,
                  amount,
                  currency: 'USD',
                  payment_method: 'credit_card',
                  transaction_id: `tx_${Math.random().toString(36).substring(2, 15)}`,
                  status: booking.status === 'completed' ? 'completed' : 'pending'
                };
                
                await run(
                  `INSERT INTO payments 
                  (booking_id, amount, currency, payment_method, transaction_id, status, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [
                    payment.booking_id,
                    payment.amount,
                    payment.currency,
                    payment.payment_method,
                    payment.transaction_id,
                    payment.status
                  ]
                );
                
                logger.log(`Added payment for booking ${payment.booking_id} (${payment.status})`);
                fs.appendFileSync(logPath, `Added payment for booking ${payment.booking_id} (${payment.status})\n`);
              }
            }
          }
        }
      }
    } else {
      logger.log(`Database already contains ${existingBookings.count} bookings. Skipping booking seeding.`);
      fs.appendFileSync(logPath, `Found ${existingBookings.count} existing bookings - skipping seeding\n`);
    }
    
    logger.log('Seed completed successfully!');
    fs.appendFileSync(logPath, 'Seed completed successfully!\n');
    
  } catch (error) {
    logger.error('Error during database seeding:', error);
    fs.appendFileSync(logPath, `ERROR: ${error instanceof Error ? error.message : String(error)}\n`);
  } finally {
    // Close the connection
    db.close();
    logger.log('Database connection closed');
    fs.appendFileSync(logPath, 'Database connection closed\n');
  }
  
  fs.appendFileSync(logPath, `Seed completed at ${new Date().toISOString()}\n`);
}

// Run the seeder
seed().catch(error => {
  logger.error('Failed to seed database:', error);
  process.exit(1);
}); 