import * as path from 'path';
import * as fs from 'fs';
import { Database } from 'sqlite3';
import * as bcrypt from 'bcrypt';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database connection
const dbPath = path.join(process.cwd(), 'data', 'hotel_booking_dev.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

console.log(`Connected to SQLite database at: ${dbPath}`);
console.log('Setting up database schema...');

function createUsersTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        phone_number TEXT,
        address TEXT,
        token_version INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Users table created or already exists');
      resolve();
    });
  });
}

function createRoomsTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS rooms (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT NOT NULL UNIQUE,
        room_type TEXT NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        max_guests INTEGER NOT NULL,
        description TEXT,
        availability_status TEXT NOT NULL DEFAULT 'available',
        amenities TEXT,
        photos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Rooms table created or already exists');
      resolve();
    });
  });
}

function createBookingsTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        number_of_guests INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total_price DECIMAL(10,2) NOT NULL,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (room_id) REFERENCES rooms(room_id)
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Bookings table created or already exists');
      resolve();
    });
  });
}

function createRefreshTokensTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Refresh tokens table created or already exists');
      resolve();
    });
  });
}

function createPaymentsTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        payment_method TEXT NOT NULL DEFAULT 'credit_card',
        transaction_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        refund_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Payments table created or already exists');
      resolve();
    });
  });
}

async function seedAdminUser(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Check if admin user already exists
    db.get("SELECT * FROM users WHERE email = 'admin@hotel.com'", async (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
        console.log('Admin user already exists');
        resolve();
        return;
      }
      
      // Hash password
      try {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        
        // Insert admin user
        const sql = `
          INSERT INTO users (email, password, first_name, last_name, role, phone_number, address, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
          'admin@hotel.com',
          hashedPassword,
          'Admin',
          'User',
          'admin',
          '+1234567890',
          '123 Admin Street, Admin City',
          1
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }
          console.log(`Admin user created with ID: ${this.lastID}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function setupDatabase(): Promise<void> {
  try {
    await createUsersTable();
    await createRoomsTable();
    await createBookingsTable();
    await createRefreshTokensTable();
    await createPaymentsTable();
    await seedAdminUser();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    db.close();
  }
}

// Run the setup
setupDatabase(); 