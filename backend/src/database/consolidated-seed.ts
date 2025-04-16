/**
 * Consolidated Seeding Script for Room Types and Rooms
 * Seeds the database with room types and creates matching rooms
 * Also creates test bookings to demonstrate inventory management and room availability
 */
import { Database } from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

// Database path
const dbPath = process.env.DB_NAME || path.join(process.cwd(), 'data', 'hotel_booking_dev.sqlite');

// Logger utility
const logger = {
  log: (message: string): void => {
    console.log(message);
  },
  error: (message: string, error?: unknown): void => {
    console.error(message, error || '');
  }
};

// Define room types with details
const roomTypes = [
  {
    id: 1,
    name: 'Standard Room',
    code: 'standard',
    floor: 1,
    description: 'Comfortable room with all the essential amenities for a pleasant stay.',
    pricePerNight: 14900,
    maxGuests: 2,
    amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom']),
    imageUrl: '/images/standard-room.jpg',
    displayOrder: 4
  },
  {
    id: 2,
    name: 'Executive Room',
    code: 'executive',
    floor: 2,
    description: 'Modern room with work area, queen-size bed, and premium toiletries.',
    pricePerNight: 19900,
    maxGuests: 2,
    amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Work Desk']),
    imageUrl: '/images/executive-room.jpg',
    displayOrder: 2
  },
  {
    id: 3,
    name: 'Family Suite',
    code: 'family',
    floor: 3,
    description: 'Perfect for families with two bedrooms, living area, and kid-friendly amenities.',
    pricePerNight: 34900,
    maxGuests: 4,
    amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Kitchenette', 'Multiple Beds']),
    imageUrl: '/images/family-suite.jpg',
    displayOrder: 3
  },
  {
    id: 4,
    name: 'Deluxe Suite',
    code: 'deluxe',
    floor: 4,
    description: 'Spacious suite with city views, king-size bed, and luxury amenities.',
    pricePerNight: 29900,
    maxGuests: 2,
    amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'King-Size Bed', 'Luxury Bathroom']),
    imageUrl: '/images/deluxe-suite.jpg',
    displayOrder: 1
  },
  {
    id: 5,
    name: 'Premium Suite',
    code: 'premium',
    floor: 5,
    description: 'Luxurious suite with separate living area, premium amenities, and stunning views.',
    pricePerNight: 39900,
    maxGuests: 3,
    amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Ocean View', 'Jacuzzi']),
    imageUrl: '/images/premium-suite.jpg',
    displayOrder: 5
  },
];

async function seedDatabase(): Promise<void> {
  logger.log('Starting consolidated seed process...');
  
  // Create log file
  const logPath = path.join(process.cwd(), 'seed-log.txt');
  fs.writeFileSync(logPath, `Consolidated seed started at ${new Date().toISOString()}\n`);
  
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

  const all = <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  };
  
  try {
    // Check if required tables exist
    const tables = ['rooms', 'room_types', 'bookings', 'payments'];
    
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
    
    // SEED ROOM TYPES
    logger.log('Seeding room types...');
    fs.appendFileSync(logPath, 'Seeding room types...\n');
    
    // Check if room types already exist
    const existingRoomTypes = await get<{ count: number }>('SELECT COUNT(*) as count FROM room_types');
    
    if (existingRoomTypes.count > 0) {
      logger.log(`Database already contains ${existingRoomTypes.count} room types. Clearing existing room types...`);
      fs.appendFileSync(logPath, `Found ${existingRoomTypes.count} existing room types - clearing them\n`);
      
      await run('DELETE FROM room_types');
      
      logger.log('Existing room types cleared.');
      fs.appendFileSync(logPath, 'Existing room types cleared.\n');
    }
    
    // Insert room types
    for (const roomType of roomTypes) {
      await run(
        `INSERT INTO room_types 
         (room_type_id, name, code, description, price_per_night, max_guests, amenities, image_url, display_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          roomType.id,
          roomType.name,
          roomType.code,
          roomType.description,
          roomType.pricePerNight,
          roomType.maxGuests,
          roomType.amenities,
          roomType.imageUrl,
          roomType.displayOrder
        ]
      );
      
      logger.log(`Added room type: ${roomType.name} (${roomType.code})`);
      fs.appendFileSync(logPath, `Added room type: ${roomType.name} (${roomType.code})\n`);
    }
    
    logger.log('All room types seeded successfully');
    fs.appendFileSync(logPath, 'All room types seeded successfully\n');
    
    // SEED ROOMS
    logger.log('Seeding rooms...');
    fs.appendFileSync(logPath, 'Seeding rooms...\n');
    
    // Check if rooms already exist
    const existingRooms = await get<{ count: number }>('SELECT COUNT(*) as count FROM rooms');
    
    if (existingRooms.count > 0) {
      logger.log(`Database already contains ${existingRooms.count} rooms. Clearing existing rooms...`);
      fs.appendFileSync(logPath, `Found ${existingRooms.count} existing rooms - clearing them\n`);
      
      // Clear existing rooms
      await run('DELETE FROM rooms');
      
      // Reset the autoincrement
      await run('DELETE FROM sqlite_sequence WHERE name="rooms"');
      
      logger.log('Existing rooms cleared.');
      fs.appendFileSync(logPath, 'Existing rooms cleared.\n');
    }
    
    // Create 10 rooms for each floor/room type
    for (const roomType of roomTypes) {
      for (let i = 1; i <= 10; i++) {
        // Format room number: floor (1-5) + room number (01-10)
        const roomNumber = `${roomType.floor}${i.toString().padStart(2, '0')}`;
        
        await run(
          `INSERT INTO rooms 
           (room_number, room_type, price_per_night, max_guests, description, 
            amenities, availability_status, photos, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            roomNumber,
            roomType.code,
            roomType.pricePerNight,
            roomType.maxGuests,
            roomType.description,
            roomType.amenities,
            'available', // All rooms start as available
            JSON.stringify([{
              url: roomType.imageUrl,
              type: 'main',
              caption: roomType.name,
              displayOrder: 1
            }])
          ]
        );
        
        logger.log(`Added room ${roomNumber} (${roomType.name})`);
        fs.appendFileSync(logPath, `Added room ${roomNumber} (${roomType.name})\n`);
      }
    }
    
    logger.log('All rooms seeded successfully');
    fs.appendFileSync(logPath, 'All rooms seeded successfully\n');
    
    // SEED BOOKINGS
    logger.log('Seeding test bookings...');
    fs.appendFileSync(logPath, 'Seeding test bookings...\n');
    
    // Clear existing bookings
    await run('DELETE FROM bookings');
    
    // Reset the autoincrement
    await run('DELETE FROM sqlite_sequence WHERE name="bookings"');
    
    // Clear existing payments
    await run('DELETE FROM payments');
    
    // Reset the autoincrement
    await run('DELETE FROM sqlite_sequence WHERE name="payments"');
    
    // Get first room of each type to create bookings
    const rooms = await all<{ room_id: number, room_number: string, room_type: string }>(
      'SELECT room_id, room_number, room_type FROM rooms WHERE room_number IN (\'101\', \'201\', \'301\', \'401\', \'501\')'
    );
    
    // Log the rooms to verify the data
    logger.log('Primary rooms for bookings:');
    rooms.forEach(room => {
      logger.log(`Room ${room.room_number} (ID: ${room.room_id}, Type: ${room.room_type})`);
    });
    
    // Get additional rooms for more bookings
    const additionalRooms = await all<{ room_id: number, room_number: string, room_type: string }>(
      'SELECT room_id, room_number, room_type FROM rooms WHERE room_number IN (\'102\', \'202\', \'302\', \'402\', \'502\')'
    );

    // Log the additional rooms
    logger.log('Additional rooms for bookings:');
    additionalRooms.forEach(room => {
      logger.log(`Room ${room.room_number} (ID: ${room.room_id}, Type: ${room.room_type})`);
    });
    
    // Get more rooms for May bookings
    const mayRooms = await all<{ room_id: number, room_number: string, room_type: string }>(
      'SELECT room_id, room_number, room_type FROM rooms WHERE room_number IN (\'103\', \'104\', \'203\', \'204\', \'303\', \'304\', \'403\', \'404\', \'503\', \'504\')'
    );

    // Log the May rooms
    logger.log('May rooms for bookings:');
    mayRooms.forEach(room => {
      logger.log(`Room ${room.room_number} (ID: ${room.room_id}, Type: ${room.room_type})`);
    });
    
    // Create a few test users if not exist
    const testUser1 = await get<{ user_id: number }>(
      'SELECT user_id FROM users WHERE email = ?', 
      ['test@example.com']
    );
    
    let testUser1Id: number;
    
    if (!testUser1) {
      const result = await run(
        `INSERT INTO users 
         (first_name, last_name, email, password, phone_number, role, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        ['Test', 'User', 'test@example.com', '$2b$10$XCDqfbY4.uOj5/EcKNJh1eWI2UXYwL9kUjVCefz8YCEiT0XQv0gEi', '1234567890', 'user']
      );
      testUser1Id = result.lastID;
      logger.log('Created test user 1');
      fs.appendFileSync(logPath, 'Created test user 1\n');
    } else {
      testUser1Id = testUser1.user_id;
      logger.log('Test user 1 already exists');
      fs.appendFileSync(logPath, 'Test user 1 already exists\n');
    }
    
    // Helper function to format dates for SQLite
    const formatDateForSql = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Create bookings for test users
    // Current date as reference
    const today = new Date();
    
    // Create a booking for each room type
    // Each booking is in a different state and time period
    
    // 1. Past booking (completed)
    const pastStart = new Date(today);
    pastStart.setDate(today.getDate() - 20);
    const pastEnd = new Date(today);
    pastEnd.setDate(today.getDate() - 15);
    
    // 2. Current booking (active)
    const currentStart = new Date(today);
    currentStart.setDate(today.getDate() - 2);
    const currentEnd = new Date(today);
    currentEnd.setDate(today.getDate() + 3);
    
    // 3. Future booking (upcoming)
    const futureStart = new Date(today);
    futureStart.setDate(today.getDate() + 10);
    const futureEnd = new Date(today);
    futureEnd.setDate(today.getDate() + 15);
    
    // 4. Far future booking
    const farFutureStart = new Date(today);
    farFutureStart.setDate(today.getDate() + 30);
    const farFutureEnd = new Date(today);
    farFutureEnd.setDate(today.getDate() + 35);
    
    // 5. Another past booking
    const anotherPastStart = new Date(today);
    anotherPastStart.setDate(today.getDate() - 40);
    const anotherPastEnd = new Date(today);
    anotherPastEnd.setDate(today.getDate() - 35);
    
    // Additional booking dates for the upcoming month
    // 6. Next week booking
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 10);
    
    // 7. Two weeks from now
    const twoWeeksStart = new Date(today);
    twoWeeksStart.setDate(today.getDate() + 14);
    const twoWeeksEnd = new Date(today);
    twoWeeksEnd.setDate(today.getDate() + 17);
    
    // 8. Three weeks from now
    const threeWeeksStart = new Date(today);
    threeWeeksStart.setDate(today.getDate() + 21);
    const threeWeeksEnd = new Date(today);
    threeWeeksEnd.setDate(today.getDate() + 24);
    
    // 9. Four weeks from now
    const fourWeeksStart = new Date(today);
    fourWeeksStart.setDate(today.getDate() + 28);
    const fourWeeksEnd = new Date(today);
    fourWeeksEnd.setDate(today.getDate() + 31);
    
    // 10. Five weeks from now
    const fiveWeeksStart = new Date(today);
    fiveWeeksStart.setDate(today.getDate() + 35);
    const fiveWeeksEnd = new Date(today);
    fiveWeeksEnd.setDate(today.getDate() + 38);
    
    // Create additional May booking dates
    // May 1-4 bookings
    const may1Start = new Date(today);
    may1Start.setDate(today.getDate() + 17); // May 1-ish
    const may1End = new Date(today);
    may1End.setDate(today.getDate() + 20);

    // May 5-8 bookings
    const may5Start = new Date(today);
    may5Start.setDate(today.getDate() + 21); // May 5-ish
    const may5End = new Date(today);
    may5End.setDate(today.getDate() + 24);

    // May 10-13 bookings
    const may10Start = new Date(today);
    may10Start.setDate(today.getDate() + 26); // May 10-ish
    const may10End = new Date(today);
    may10End.setDate(today.getDate() + 29);

    // May 15-18 bookings
    const may15Start = new Date(today);
    may15Start.setDate(today.getDate() + 31); // May 15-ish
    const may15End = new Date(today);
    may15End.setDate(today.getDate() + 34);

    // May 20-23 bookings
    const may20Start = new Date(today);
    may20Start.setDate(today.getDate() + 36); // May 20-ish
    const may20End = new Date(today);
    may20End.setDate(today.getDate() + 39);

    // May 25-28 bookings
    const may25Start = new Date(today);
    may25Start.setDate(today.getDate() + 41); // May 25-ish
    const may25End = new Date(today);
    may25End.setDate(today.getDate() + 44);

    // Create the bookings with varying statuses
    const bookings = [
      {
        roomId: rooms[0].room_id, // Standard Room (101)
        userId: testUser1Id,
        checkIn: formatDateForSql(pastStart),
        checkOut: formatDateForSql(pastEnd),
        status: 'completed',
        guests: 1,
        amount: 14900 * 5 // 5 nights
      },
      {
        roomId: rooms[1].room_id, // Executive Room (201)
        userId: testUser1Id,
        checkIn: formatDateForSql(currentStart),
        checkOut: formatDateForSql(currentEnd),
        status: 'confirmed',
        guests: 2,
        amount: 19900 * 5 // 5 nights
      },
      {
        roomId: rooms[2].room_id, // Family Suite (301)
        userId: testUser1Id,
        checkIn: formatDateForSql(futureStart),
        checkOut: formatDateForSql(futureEnd),
        status: 'confirmed',
        guests: 3,
        amount: 34900 * 5 // 5 nights
      },
      {
        roomId: rooms[3].room_id, // Deluxe Suite (401)
        userId: testUser1Id,
        checkIn: formatDateForSql(farFutureStart),
        checkOut: formatDateForSql(farFutureEnd),
        status: 'pending',
        guests: 2,
        amount: 29900 * 5 // 5 nights
      },
      {
        roomId: rooms[4].room_id, // Premium Suite (501)
        userId: testUser1Id,
        checkIn: formatDateForSql(anotherPastStart),
        checkOut: formatDateForSql(anotherPastEnd),
        status: 'cancelled',
        guests: 2,
        amount: 39900 * 5 // 5 nights
      },
      // Additional bookings for the upcoming month
      {
        roomId: additionalRooms[0].room_id, // Another Standard Room (102)
        userId: testUser1Id,
        checkIn: formatDateForSql(nextWeekStart),
        checkOut: formatDateForSql(nextWeekEnd),
        status: 'confirmed',
        guests: 1,
        amount: 14900 * 3 // 3 nights
      },
      {
        roomId: additionalRooms[1].room_id, // Another Executive Room (202)
        userId: testUser1Id,
        checkIn: formatDateForSql(twoWeeksStart),
        checkOut: formatDateForSql(twoWeeksEnd),
        status: 'confirmed',
        guests: 2,
        amount: 19900 * 3 // 3 nights
      },
      {
        roomId: additionalRooms[2].room_id, // Another Family Suite (302)
        userId: testUser1Id,
        checkIn: formatDateForSql(threeWeeksStart),
        checkOut: formatDateForSql(threeWeeksEnd),
        status: 'confirmed',
        guests: 4,
        amount: 34900 * 3 // 3 nights
      },
      {
        roomId: additionalRooms[3].room_id, // Another Deluxe Suite (402)
        userId: testUser1Id,
        checkIn: formatDateForSql(fourWeeksStart),
        checkOut: formatDateForSql(fourWeeksEnd),
        status: 'confirmed',
        guests: 2,
        amount: 29900 * 3 // 3 nights
      },
      {
        roomId: additionalRooms[4].room_id, // Another Premium Suite (502)
        userId: testUser1Id,
        checkIn: formatDateForSql(fiveWeeksStart),
        checkOut: formatDateForSql(fiveWeeksEnd),
        status: 'confirmed',
        guests: 2,
        amount: 39900 * 3 // 3 nights
      },
      // Additional May bookings - Early May
      {
        roomId: mayRooms[0].room_id, // Standard Room (103)
        userId: testUser1Id,
        checkIn: formatDateForSql(may1Start),
        checkOut: formatDateForSql(may1End),
        status: 'confirmed',
        guests: 1,
        amount: 14900 * 3 // 3 nights
      },
      {
        roomId: mayRooms[2].room_id, // Executive Room (203)
        userId: testUser1Id,
        checkIn: formatDateForSql(may1Start),
        checkOut: formatDateForSql(may1End),
        status: 'confirmed',
        guests: 2,
        amount: 19900 * 3 // 3 nights
      },
      // May 5-8 bookings
      {
        roomId: mayRooms[1].room_id, // Standard Room (104)
        userId: testUser1Id,
        checkIn: formatDateForSql(may5Start),
        checkOut: formatDateForSql(may5End),
        status: 'confirmed',
        guests: 1,
        amount: 14900 * 3 // 3 nights
      },
      {
        roomId: mayRooms[3].room_id, // Executive Room (204)
        userId: testUser1Id,
        checkIn: formatDateForSql(may5Start),
        checkOut: formatDateForSql(may5End),
        status: 'confirmed',
        guests: 2,
        amount: 19900 * 3 // 3 nights
      },
      // May 10-13 bookings
      {
        roomId: mayRooms[4].room_id, // Family Suite (303)
        userId: testUser1Id,
        checkIn: formatDateForSql(may10Start),
        checkOut: formatDateForSql(may10End),
        status: 'confirmed',
        guests: 3,
        amount: 34900 * 3 // 3 nights
      },
      {
        roomId: mayRooms[6].room_id, // Deluxe Suite (403)
        userId: testUser1Id,
        checkIn: formatDateForSql(may10Start),
        checkOut: formatDateForSql(may10End),
        status: 'confirmed',
        guests: 2,
        amount: 29900 * 3 // 3 nights
      },
      // May 15-18 bookings
      {
        roomId: mayRooms[5].room_id, // Family Suite (304)
        userId: testUser1Id,
        checkIn: formatDateForSql(may15Start),
        checkOut: formatDateForSql(may15End),
        status: 'confirmed',
        guests: 4,
        amount: 34900 * 3 // 3 nights
      },
      {
        roomId: mayRooms[8].room_id, // Premium Suite (503)
        userId: testUser1Id,
        checkIn: formatDateForSql(may15Start),
        checkOut: formatDateForSql(may15End),
        status: 'confirmed',
        guests: 2,
        amount: 39900 * 3 // 3 nights
      },
      // May 20-23 bookings
      {
        roomId: mayRooms[7].room_id, // Deluxe Suite (404)
        userId: testUser1Id,
        checkIn: formatDateForSql(may20Start),
        checkOut: formatDateForSql(may20End),
        status: 'confirmed',
        guests: 2,
        amount: 29900 * 3 // 3 nights
      },
      // May 25-28 bookings
      {
        roomId: mayRooms[9].room_id, // Premium Suite (504)
        userId: testUser1Id,
        checkIn: formatDateForSql(may25Start),
        checkOut: formatDateForSql(may25End),
        status: 'confirmed',
        guests: 2,
        amount: 39900 * 3 // 3 nights
      }
    ];
    
    // Insert bookings
    for (const booking of bookings) {
      logger.log(`Creating booking for room ID: ${booking.roomId}`);
      
      const bookingResult = await run(
        `INSERT INTO bookings 
         (user_id, room_id, check_in_date, check_out_date, status, number_of_guests, special_requests, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          booking.userId,
          booking.roomId,
          booking.checkIn,
          booking.checkOut,
          booking.status,
          booking.guests,
          `Booking for ${booking.guests} guests with an amount of $${(booking.amount/100).toFixed(2)}`,
        ]
      );
      
      // For confirmed and completed bookings, add a payment record
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        await run(
          `INSERT INTO payments 
           (booking_id, payment_method, amount, currency, status, transaction_id, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [
            bookingResult.lastID,
            'credit_card',
            booking.amount,
            'USD',
            'completed',
            `TRANS-${Math.floor(Math.random() * 1000000)}`
          ]
        );
      }
      
      // Find the room number for the booking
      const roomInfo = [...rooms, ...additionalRooms, ...mayRooms].find(r => r.room_id === booking.roomId);
      const roomNumber = roomInfo ? roomInfo.room_number : 'unknown';
      
      logger.log(`Added ${booking.status} booking for room ${roomNumber}`);
      fs.appendFileSync(logPath, `Added ${booking.status} booking for room ${roomNumber}\n`);
    }
    
    logger.log('Test bookings created successfully');
    fs.appendFileSync(logPath, 'Test bookings created successfully\n');
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    fs.appendFileSync(logPath, `ERROR: ${error}\n`);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        logger.error('Error closing database connection:', err);
        fs.appendFileSync(logPath, `Error closing database connection: ${err}\n`);
      } else {
        logger.log('Database connection closed');
        fs.appendFileSync(logPath, 'Database connection closed\n');
      }
    });
  }
}

// Run the seed function
seedDatabase().then(() => {
  logger.log('Database seeding completed successfully');
}).catch(error => {
  logger.error('Database seeding failed:', error);
}); 