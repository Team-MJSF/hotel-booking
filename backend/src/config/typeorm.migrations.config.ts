import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

// Initialize logger
const logger = new Logger('TypeOrmMigrationsConfig');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

// Flag for migration mode vs application mode
const isMigrationMode = process.env.TYPEORM_MIGRATION_MODE === 'true';
const entitiesDir = isMigrationMode
  ? 'dist-migrations/src/**/entities/*.entity.js'
  : 'dist/**/*.entity.js';
const migrationsDir = isMigrationMode
  ? 'dist-migrations/src/database/migrations/*.js'
  : 'dist/src/database/migrations/*.js';

/**
 * Create database if it doesn't exist
 * This function is called from CLI when --create-db flag is used
 */
async function createDatabaseIfNotExists(): Promise<void> {
  const dbName = process.env.DB_NAME || join(process.cwd(), 'data', 'hotel_db.sqlite');
  
  logger.log(`Checking if database ${dbName} exists`);
  
  const dbDir = join(process.cwd(), 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    logger.log(`Creating directory ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Touch the file if it doesn't exist
  if (!fs.existsSync(dbName)) {
    logger.log(`Creating database file ${dbName}`);
    fs.writeFileSync(dbName, '');
    logger.log(`Database file ${dbName} created successfully`);
  } else {
    logger.log(`Database file ${dbName} already exists`);
  }
}

/**
 * Get TypeORM configuration for migration tools
 * This is used by TypeORM CLI for generating and running migrations
 */
export async function getTypeOrmConfig(configService: ConfigService): Promise<DataSourceOptions> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Create database options
  const options: DataSourceOptions = {
    type: 'sqlite',
    database: configService.get<string>('DB_NAME') || join(process.cwd(), 'data', 'hotel_db.sqlite'),
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
    await createDatabaseIfNotExists();
    process.exit(0);
  })();
}

// For CLI migrations
export default new DataSource({
  type: 'sqlite',
  database: process.env.DB_NAME || join(process.cwd(), 'data', 'hotel_db.sqlite'),
  entities: [entitiesDir],
  migrations: [migrationsDir],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: process.env.NODE_ENV === 'development',
});

  entities: [entitiesDir],
  migrations: [migrationsDir],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: process.env.NODE_ENV === 'development',
});
