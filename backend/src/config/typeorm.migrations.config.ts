import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import * as mysql from 'mysql2/promise';

// Initialize logger
const logger = new Logger('TypeOrmMigrationsConfig');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

// Flag for migration mode vs application mode
const isMigrationMode = process.env.TYPEORM_MIGRATION_MODE === 'true';
const entitiesDir = isMigrationMode ? 'dist-migrations/src/**/entities/*.entity.js' : 'dist/**/*.entity.js';
const migrationsDir = isMigrationMode ? 'dist-migrations/src/database/migrations/*.js' : 'dist/src/database/migrations/*.js';

/**
 * Create database if it doesn't exist
 * This function is called from CLI when --create-db flag is used
 */
async function createDatabaseIfNotExists(options: MysqlConnectionOptions): Promise<void> {
  const { host, port, username, password, database } = options;

  logger.log(`Checking if database ${database} exists`);

  // Create connection without database name
  const connection = await mysql.createConnection({
    host,
    port,
    user: username,
    password,
  });

  try {
    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${database}'`
    );
    
    const databaseExists = Array.isArray(rows) && rows.length > 0;
    
    if (!databaseExists) {
      logger.log(`Creating database ${database}`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      logger.log(`Database ${database} created successfully`);
    } else {
      logger.log(`Database ${database} already exists`);
    }
  } catch (error) {
    logger.error(`Failed to create database ${database}: ${error.message}`);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Get TypeORM configuration for migration tools
 * This is used by TypeORM CLI for generating and running migrations
 */
export async function getTypeOrmConfig(configService: ConfigService): Promise<DataSourceOptions> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Create database options
  const options: MysqlConnectionOptions = {
    type: 'mysql',
    host: configService.get<string>('DB_HOST') || process.env.DB_HOST,
    port: configService.get<number>('DB_PORT') || +process.env.DB_PORT,
    username: configService.get<string>('DB_USERNAME') || process.env.DB_USERNAME,
    password: configService.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD,
    database: configService.get<string>('DB_NAME') || process.env.DB_NAME,
    entities: [entitiesDir],
    migrations: [migrationsDir],
    synchronize: false,
    migrationsRun: false,
    dropSchema: false,
    logging: isDevelopment && process.env.NODE_ENV !== 'test',
    migrationsTableName: 'migrations',
    entitySkipConstructor: true,
  };

  return options;
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--create-db')) {
  (async () => {
    const configService = new ConfigService();
    const config = await getTypeOrmConfig(configService);
    await createDatabaseIfNotExists(config as MysqlConnectionOptions);
    process.exit(0);
  })();
}

// For CLI migrations
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [entitiesDir],
  migrations: [migrationsDir],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: process.env.NODE_ENV === 'development',
}); 