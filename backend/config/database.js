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

// Test the database connection
// This makes sure the application can connect to the database before proceeding
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;