import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

config();

const configService = new ConfigService();

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT', '3306'), 10),
    user: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
  });

  const databaseName = configService.get('DB_NAME');
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
  await connection.end();
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
  entities: [path.join(__dirname, '../**/*.entity.ts')],
  migrations: [path.join(__dirname, '../database/migrations/*.ts')],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  driver: require('mysql2'),
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  }
});
