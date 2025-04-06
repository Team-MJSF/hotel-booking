import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { Logger } from '@nestjs/common';

// Initialize logger
const logger = new Logger('DatabaseMigrations');

// Load environment variables
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

// Create DataSource
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(process.cwd(), 'src/**/*.entity.ts')],
  migrations: [join(process.cwd(), 'src/database/migrations/*.ts')],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: true,
});

// Run migrations
async function runMigrations() {
  try {
    logger.log(`Initializing migrations for ${env} environment...`);
    logger.log(`Using database: ${process.env.DB_NAME}`);
    
    await dataSource.initialize();
    logger.log('Running migrations...');
    
    const migrations = await dataSource.runMigrations();
    logger.log(`Migrations completed successfully. ${migrations.length} migrations were run.`);
    
    // Verify migrations table exists
    const migrationsTable = await dataSource.query(
      `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' AND TABLE_NAME = 'migrations'`
    );
    
    if (migrationsTable.length === 0) {
      logger.error('Migrations table was not created!');
      throw new Error('Migrations table was not created');
    }
    
    // List all tables in the database
    const tables = await dataSource.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'`
    );
    
    logger.log('Current tables in database:');
    tables.forEach((table: any) => {
      logger.log(`- ${table.TABLE_NAME}`);
    });
  } catch (error) {
    logger.error('Error running migrations:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runMigrations(); 