import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

// Load environment variables from the correct .env file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const configService = new ConfigService();
const logger = new Logger('TypeOrmConfig');

async function createDatabaseIfNotExists() {
  const dbUser = configService.get('DB_USER');
  const dbPassword = configService.get('DB_PASSWORD');
  const dbHost = configService.get('DB_HOST');
  const dbPort = configService.get('DB_PORT', '3306');
  const dbName = configService.get('DB_NAME');
  const isTest = configService.get('NODE_ENV') === 'test';
  const finalDbName = isTest ? `${dbName}_test` : dbName;

  if (!dbUser || !dbPassword || !dbHost || !dbName) {
    throw new Error('Missing required database configuration. Please check your .env file.');
  }

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort, 10),
      user: dbUser,
      password: dbPassword,
    });

    if (isTest) {
      // Drop test database if it exists
      await connection.query(`DROP DATABASE IF EXISTS ${finalDbName}`);
      logger.log(`Dropped test database ${finalDbName}`);
    }

    // Create fresh database
    await connection.query(`CREATE DATABASE ${finalDbName}`);
    await connection.end();
    logger.log(`Database ${finalDbName} created successfully`);
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

// Create database if it doesn't exist
createDatabaseIfNotExists().catch(error => {
  logger.error('Error creating database:', error);
  process.exit(1);
});

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const logger = new Logger('TypeOrmConfig');
  const isTest = configService.get('NODE_ENV') === 'test';

  try {
    const config: TypeOrmModuleOptions = {
      type: 'mysql',
      host: configService.get('DB_HOST'),
      port: parseInt(configService.get('DB_PORT', '3306'), 10),
      username: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      database: isTest ? configService.get('DB_NAME') + '_test' : configService.get('DB_NAME'),
      entities: [
        path.join(__dirname, '../users/entities/*.entity{.ts,.js}'),
        path.join(__dirname, '../rooms/entities/*.entity{.ts,.js}'),
        path.join(__dirname, '../bookings/entities/*.entity{.ts,.js}'),
        path.join(__dirname, '../payments/entities/*.entity{.ts,.js}'),
      ],
      migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
      synchronize: isTest, // Enable synchronize only in test environment
      logging: false, // Disable logging in test environment
      dropSchema: isTest, // Drop schema in test environment
      migrationsRun: !isTest, // Run migrations only in non-test environment
      extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
      }
    };

    logger.log(`Database configuration loaded successfully for ${isTest ? 'test' : 'development'} environment`);
    
    if (!config.host || !config.username || !config.password || !config.database) {
      logger.error('Missing required database configuration');
      throw new Error('Missing required database configuration');
    }

    return config;
  } catch (error) {
    logger.error(`Failed to load database configuration: ${error.message}`);
    throw error;
  }
};

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT', '3306'), 10),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  driver: require('mysql2'),
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  }
});
