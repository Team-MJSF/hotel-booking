// This module handles the setup and configuration of the MySQL database connection using Sequelize
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
// This allows secure configuration without hardcoding sensitive data. Passwords and tokens will be stored there and used here.
dotenv.config();

// Initialize Sequelize with database configuration from environment variables
export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',  // Specifies the database type we're connecting to
  logging: console.log,  // Logs SQL queries to console for debugging
});

// Test the database connection and sync the database
// This makes sure the application can connect to the database before proceeding
export const initializeDatabase = async () => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    console.log('Synchronizing database with models...');
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    
    return true;
  } catch (err) {
    console.error('Unable to connect to the database or failed synchronization:', err);
    return false;
  }
};

export default sequelize;