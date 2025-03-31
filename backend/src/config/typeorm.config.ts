import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

// Load environment variables from the correct .env file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const configService = new ConfigService();

async function createDatabaseIfNotExists() {
  const dbUser = configService.get('DB_USER');
  const dbPassword = configService.get('DB_PASSWORD');
  const dbHost = configService.get('DB_HOST');
  const dbPort = configService.get('DB_PORT', '3306');
  const dbName = configService.get('DB_NAME');

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

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.end();
    console.log(`Database ${dbName} created or already exists`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Create database if it doesn't exist
createDatabaseIfNotExists().catch(error => {
  console.error('Error creating database:', error);
  process.exit(1);
});

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
