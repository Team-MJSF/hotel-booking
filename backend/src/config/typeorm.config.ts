import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import * as mysql from 'mysql2/promise';

// Load environment variables
config();

const configService = new ConfigService();

// Get environment
const NODE_ENV = process.env.NODE_ENV || 'dev';

// Map environment names
const envMap: Record<string, string> = {
  development: 'dev',
  production: 'prod',
  test: 'test'
};

// Get the correct environment name
const env = envMap[NODE_ENV] || NODE_ENV;

// Construct database name with environment
const dbName = `hotel_booking_${env}`;

// Create base configuration without database
const baseConfig: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
  migrationsRun: true, // Automatically run migrations
  migrationsTableName: 'migrations',
  dropSchema: false,
};

// Function to create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    user: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
  });

  try {
    // Check if database exists
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
    const databaseExists = Array.isArray(rows) && rows.length > 0;

    if (!databaseExists) {
      // Create database if it doesn't exist
      await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`[TypeOrmConfig] Database ${dbName} created successfully`);
    } else {
      console.log(`[TypeOrmConfig] Database ${dbName} already exists`);
    }
  } finally {
    await connection.end();
  }
}

// Create DataSource with database
const AppDataSource = new DataSource({
  ...baseConfig,
  database: dbName
});

// Only create database if this file is run directly
if (require.main === module) {
  createDatabaseIfNotExists()
    .then(() => {
      console.log('[TypeOrmConfig] Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.log('Error during database creation:', error);
      process.exit(1);
    });
}

export { AppDataSource };
