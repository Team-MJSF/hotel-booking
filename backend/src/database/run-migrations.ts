import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { config } from 'dotenv';
import { getTypeOrmConfig } from '../config/typeorm.migrations.config';
import { ConfigService } from '@nestjs/config';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

const logger = new Logger('Migrations');

async function runMigrations() {
  try {
    logger.log(`Starting migrations in ${env} environment...`);
    
    // Create a temporary ConfigService instance
    const configService = new ConfigService();
    
    // Get the TypeORM configuration
    const typeOrmConfig = await getTypeOrmConfig(configService);
    
    // Create a new DataSource instance
    const dataSource = new DataSource({
      ...typeOrmConfig,
      // Ensure we're using the correct paths for the current environment
      entities: [join(process.cwd(), 'src/**/*.entity.ts')],
      migrations: [join(process.cwd(), 'src/database/migrations/*.ts')],
    });

    // Initialize the DataSource
    await dataSource.initialize();
    logger.log('DataSource initialized successfully');

    // Run migrations
    const migrations = await dataSource.runMigrations();
    logger.log(`Successfully ran ${migrations.length} migrations`);

    // Verify migrations table and list all tables
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [typeOrmConfig.database]);
      
      logger.log('Current tables in database:');
      tables.forEach((table: { table_name: string }) => {
        logger.log(`- ${table.table_name}`);
      });
    } finally {
      await queryRunner.release();
    }

    // Destroy the DataSource
    await dataSource.destroy();
    logger.log('Migrations completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
