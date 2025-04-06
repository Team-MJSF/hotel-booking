import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { join } from 'path';
import * as mysql from 'mysql2/promise';

async function createDatabase() {
  const logger = new Logger('DatabaseSetup');
  
  try {
    // Load environment variables
    const env = process.env.NODE_ENV || 'development';
    const envPath = join(process.cwd(), `.env.${env}`);
    config({ path: envPath });

    // Get database configuration
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    // Validate required configuration
    const missingConfigs = Object.entries(dbConfig)
      .filter(([_, value]) => value === undefined)
      .map(([key]) => key);

    if (missingConfigs.length > 0) {
      throw new Error(`Missing required database configuration: ${missingConfigs.join(', ')}`);
    }

    logger.log(`Checking if database '${dbConfig.database}' exists...`);

    // Create connection without database
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    try {
      // Check if database exists
      const [rows] = await connection.execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [dbConfig.database]
      );

      if (Array.isArray(rows) && rows.length === 0) {
        logger.log(`Database '${dbConfig.database}' does not exist, creating...`);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        logger.log(`Database '${dbConfig.database}' created successfully`);
      } else {
        logger.log(`Database '${dbConfig.database}' already exists`);
      }
    } finally {
      await connection.end();
    }

    logger.log('Database setup completed successfully');
  } catch (error) {
    logger.error('Error during database setup:', error);
    process.exit(1);
  }
}

createDatabase(); 