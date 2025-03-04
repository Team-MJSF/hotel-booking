// This module handles the setup and configuration of the MySQL database connection using Sequelize
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
dotenv.config();

// Initialize Sequelize with database configuration from environment variables
const env = process.env.NODE_ENV || 'development';

// Determine database name based on environment
const getDatabaseName = () => {
  switch(env) {
    case 'test':
      return 'hotel_booking_test';
    case 'production':
      return 'hotel_booking';
    default:
      return 'hotel_booking_dev';
  }
};

export const sequelize = new Sequelize(
  getDatabaseName(),
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',  // Specifies the database type we're connecting to
    logging: console.log,  // Logs SQL queries to console for debugging
  }
);

// Test the database connection and sync models
export const initializeDatabase = async () => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Log database configuration for debugging
    console.log('Database Configuration:', {
      database: getDatabaseName(),
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql'
    });

    // In development mode, we use migrations instead of sync
    // Migrations should be run manually using npm run migrate

    return true;
  } catch (err) {
    console.error('Database Error:', {
      message: err.message,
      name: err.name,
      code: err.parent?.code,
      sqlState: err.parent?.sqlState
    });
    return false;
  }
};

export default sequelize;