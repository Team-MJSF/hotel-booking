import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { config } from 'dotenv';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import * as mysql from 'mysql2/promise';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

// Initialize logger
const logger = new Logger('TypeORM');

// Define paths based on environment
const isDev = env === 'development';
const entitiesPath = isDev
  ? join(process.cwd(), 'src/**/*.entity.ts')
  : join(process.cwd(), 'dist/**/*.entity.js');
const migrationsPath = isDev
  ? join(process.cwd(), 'src/database/migrations/*.ts')
  : join(process.cwd(), 'dist/database/migrations/*.js');

// Function to check and create database if it doesn't exist
async function checkAndCreateDatabase(config: MysqlConnectionOptions) {
  const { host, port, username, password, database } = config;

  // Create a connection without specifying the database
  const connection = await mysql.createConnection({
    host,
    port,
    user: username,
    password,
  });

  try {
    logger.log(`Checking if database '${database}' exists...`);

    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [database]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      logger.log(`Database '${database}' does not exist, creating...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      logger.log(`Database '${database}' created successfully`);
    } else {
      logger.log(`Database '${database}' already exists`);
    }
  } catch (error) {
    logger.error(`Error checking/creating database: ${error.message}`);
    throw error;
  } finally {
    await connection.end();
  }
}

// Function to get TypeORM configuration
export async function getTypeOrmConfig(
  configService: ConfigService,
): Promise<MysqlConnectionOptions> {
  const options: MysqlConnectionOptions = {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [entitiesPath],
    migrations: [migrationsPath],
    synchronize: false,
    migrationsRun: false,
    dropSchema: false,
    logging: true,
  };

  // Check if we should create the database
  const shouldCreateDb = process.argv.includes('--create-db');
  if (shouldCreateDb) {
    await checkAndCreateDatabase(options);
  }

  return options;
}
