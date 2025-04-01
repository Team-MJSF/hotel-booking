import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import * as mysql from 'mysql2/promise';

// Load environment variables from the correct .env file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const configService = new ConfigService();

// Get environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Map environment names
const envMap: Record<string, string> = {
  development: 'dev',
  production: 'prod',
  test: 'test'
};

// Get the correct environment name
const currentEnv = envMap[NODE_ENV] || NODE_ENV;

// Use the database name from environment variables
const dbName = configService.get('DB_NAME');

// Create base configuration without database
const baseConfig: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT', '3306'), 10),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
  migrationsRun: true,
  migrationsTableName: 'migrations',
  dropSchema: false,
};

// Function to create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT', '3306'), 10),
    user: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    multipleStatements: true,
    connectTimeout: 10000,
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
  } catch (error) {
    console.error('Error during database creation:', error);
    throw error;
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
      console.error('Error during database creation:', error);
      process.exit(1);
    });
}

export { AppDataSource };
