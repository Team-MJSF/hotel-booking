/**
 * Quick Seed Script
 * A TypeScript script to seed the database with room data
 * This bypasses TypeORM entities and uses direct SQL queries
 */
import { Database } from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

// Database path
const dbPath = process.env.DB_NAME || path.join(process.cwd(), 'data', 'hotel_booking_dev.sqlite');

// Define type for a room
interface Room {
  room_number: string;
  room_type: 'single' | 'double' | 'suite' | 'deluxe';
  price_per_night: number;
  max_guests: number;
  description: string;
  amenities: string; // JSON stringified array
  availability_status: 'available' | 'booked' | 'maintenance';
  photos: string; // JSON stringified array of photo objects
}

// Define type for photo object
interface RoomPhoto {
  url: string;
  type: string;
  caption: string;
  displayOrder: number;
}

async function seedRooms(): Promise<void> {
  console.log('Starting quick seed process...');
  
  // Create log file
  const logPath = path.join(process.cwd(), 'quick-seed-log.txt');
  fs.writeFileSync(logPath, `Seed started at ${new Date().toISOString()}\n`);
  
  // Make sure the 'data' directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create a database connection
  const db = new Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err);
      fs.appendFileSync(logPath, `Error: ${err}\n`);
      process.exit(1);
    }
    console.log(`Connected to SQLite database at ${dbPath}`);
    fs.appendFileSync(logPath, `Connected to database\n`);
  });
  
  try {
    // Check if rooms table exists
    const tableExists = await new Promise<boolean>((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='rooms'", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? true : false);
        }
      });
    });
    
    if (!tableExists) {
      const error = 'Rooms table does not exist. Please run migrations first.';
      console.error(error);
      fs.appendFileSync(logPath, `ERROR: ${error}\n`);
      return;
    }
    fs.appendFileSync(logPath, 'Rooms table exists\n');
    
    // Check if rooms already exist
    const existingCount = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM rooms', (err, row: { count: number }) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} rooms. Skipping seeding.`);
      fs.appendFileSync(logPath, `Found ${existingCount} existing rooms - skipping seeding\n`);
      return;
    }
    
    console.log('Creating room data...');
    fs.appendFileSync(logPath, 'Creating room data...\n');
    
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
        }])
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
        }])
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
        }])
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
        }])
      }
    ];
    
    // Insert rooms with promises to handle async SQLite operations
    for (const room of rooms) {
      await new Promise<void>((resolve, reject) => {
        db.run(
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
          ],
          function(this: { lastID: number }, err) {
            if (err) {
              console.error(`Error adding room ${room.room_number}:`, err);
              reject(err);
            } else {
              console.log(`Added room ${room.room_number} (${room.room_type})`);
              fs.appendFileSync(logPath, `Added room ${room.room_number} (${room.room_type})\n`);
              resolve();
            }
          }
        );
      });
    }
    
    console.log(`Successfully added ${rooms.length} rooms to database`);
    fs.appendFileSync(logPath, `Successfully added ${rooms.length} rooms to database\n`);
    
  } catch (error) {
    console.error('Error during database seeding:', error);
    fs.appendFileSync(logPath, `ERROR: ${error instanceof Error ? error.message : String(error)}\n`);
  } finally {
    // Close the connection
    db.close();
    console.log('Database connection closed');
    fs.appendFileSync(logPath, 'Database connection closed\n');
  }
  
  fs.appendFileSync(logPath, `Seed completed at ${new Date().toISOString()}\n`);
}

// Run the seeder
seedRooms().catch(error => {
  console.error('Failed to seed database:', error);
  process.exit(1);
}); 