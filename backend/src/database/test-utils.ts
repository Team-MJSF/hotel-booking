import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { getTypeOrmConfig } from '../config/typeorm.migrations.config';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// Logger for controlling test output
const logger = {
  warn: (message: string): void => {
    if (process.env.NODE_ENV !== 'test' || process.env.DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[WARN] ${message}`);
    }
  },
  error: (message: string, error?: unknown): void => {
    if (process.env.NODE_ENV !== 'test' || process.env.DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[ERROR] ${message}`, error || '');
    }
  }
};

/**
 * Creates a fresh test database for each test run
 */
async function createFreshTestDatabase(): Promise<void> {
  const testDbPath = path.resolve(process.cwd(), 'data');
  const testDbFile = path.join(testDbPath, 'hotel_booking_test.sqlite');
  
  // Ensure test database directory exists
  if (!existsSync(testDbPath)) {
    mkdirSync(testDbPath, { recursive: true });
  }
  
  // Create test db if it doesn't exist
  if (!existsSync(testDbFile)) {
    writeFileSync(testDbFile, '');
  }
}

/**
 * Initializes a test application with SQLite database
 */
export async function initTestApp(): Promise<INestApplication> {
  // Ensure TypeORM can find the entities
  process.env.TYPEORM_ENTITIES = 'src/**/*.entity.ts';

  // Create a fresh test database
  await createFreshTestDatabase();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: path.resolve(process.cwd(), '.env.test'),
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
          const config = await getTypeOrmConfig(configService);
          return {
            ...config,
            logging: false,
            synchronize: true, // Enable synchronize for tests
            autoLoadEntities: true, // Make sure entities are auto-loaded
            entities: ['src/**/*.entity.ts'], // Explicitly define entities pattern
            // Additional SQLite-specific settings
            dropSchema: true, // Drop and recreate tables for tests
          };
        },
        inject: [ConfigService],
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

/**
 * Get table list from SQLite
 */
export async function checkDatabaseTables(app: INestApplication): Promise<string[]> {
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  
  // SQLite specific query to get table list
  const tables = await queryRunner.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);
  
  await queryRunner.release();
  return tables.map(t => t.name);
}

/**
 * Clean up test database tables
 */
export async function cleanupTestDatabase(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    logger.warn('DataSource is not initialized, skipping cleanup');
    return;
  }

  try {
    // For SQLite, we disable foreign keys temporarily
    await dataSource.query('PRAGMA foreign_keys = OFF');
    
    // Get all tables
    const tables = await dataSource.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    // Delete data from each table
    for (const table of tables) {
      try {
        // Skip FTS tables as they're managed by SQLite
        if (table.name.includes('_fts') || table.name.includes('_config') || 
            table.name.includes('_data') || table.name.includes('_idx') || 
            table.name.includes('_docsize') || table.name.includes('_content')) {
          continue;
        }
        
        await dataSource.query(`DELETE FROM "${table.name}"`);
        // Reset SQLite sequences if they exist
        await dataSource.query(`DELETE FROM sqlite_sequence WHERE name="${table.name}"`).catch(() => {
          // Ignore errors if sequence doesn't exist
        });
      } catch (error) {
        logger.error(`Error cleaning up table ${table.name}:`, error.message);
      }
    }
    
    // Re-enable foreign keys
    await dataSource.query('PRAGMA foreign_keys = ON');
  } catch (error) {
    logger.error('Failed to clean up database:', error);
  }
}

/**
 * Delay utility for tests
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}; 