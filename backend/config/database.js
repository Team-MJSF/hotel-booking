// This module handles the setup and configuration of the MySQL database connection using Sequelize
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables from .env file into process.env
dotenv.config();

// Import database configuration
import config from './config.js';

// Initialize Sequelize with database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'mysql',  // Specifies the database type we're connecting to
    logging: env === 'test' ? false : console.log,  // Only log in non-test environments
  }
);

// Convert exec to promise-based
const execPromise = promisify(exec);

// Run migrations
const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    await execPromise('npx sequelize-cli db:migrate');
    console.log('Migrations completed successfully.');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const tempSequelize = new Sequelize('', dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql'
  });

  try {
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log('Database created or already exists');
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await tempSequelize.close();
  }
};

// Test the database connection and run migrations
export const initializeDatabase = async () => {
  try {
    console.log('Ensuring database exists...');
    await createDatabaseIfNotExists();
    
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    if (env === 'test') {
      // For test environment, we still need to sync to create clean state
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      // For non-test environments, run migrations
      const migrationsSuccessful = await runMigrations();
      if (!migrationsSuccessful) {
        throw new Error('Failed to run migrations');
      }
    }

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize;