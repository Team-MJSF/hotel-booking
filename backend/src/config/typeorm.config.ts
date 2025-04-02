import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

// Initialize logger
const logger = new Logger('TypeOrmConfig');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(process.cwd(), `.env.${env}`);
config({ path: envPath });

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  isTest: boolean;
}

/**
 * Get database configuration from environment variables
 * @throws Error if required configuration is missing
 */
function getDatabaseConfig(configService: ConfigService): DatabaseConfig {
  const host = configService.get('DB_HOST');
  const port = configService.get('DB_PORT');
  const username = configService.get('DB_USER');
  const password = configService.get('DB_PASSWORD');
  const dbName = configService.get('DB_NAME');
  const isTest = process.env.NODE_ENV === 'test';

  // Validate required configurations
  if (!host || !port || !username || !password || !dbName) {
    logger.error('Missing required database configuration:', {
      host,
      port,
      username,
      password: password ? '[REDACTED]' : undefined,
      database: dbName,
      env,
      envPath
    });
    throw new Error('Missing required database configuration');
  }

  return {
    host,
    port: parseInt(port),
    username,
    password,
    database: isTest ? 'hotel_booking_test' : dbName,
    isTest
  };
}

/**
 * Create TypeORM configuration options
 */
function createTypeOrmConfig(dbConfig: DatabaseConfig): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    dateStrings: true,
    timezone: 'local',
    charset: 'utf8mb4',
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
    keepConnectionAlive: true,
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    },
    synchronize: dbConfig.isTest,
    logging: !dbConfig.isTest,
    dropSchema: dbConfig.isTest,
    migrationsRun: !dbConfig.isTest,
  };
}

/**
 * Create DataSource configuration for migrations
 */
function createDataSourceConfig(dbConfig: DatabaseConfig): DataSourceOptions {
  return {
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    dateStrings: true,
    timezone: 'local',
    charset: 'utf8mb4',
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    },
    synchronize: false,
    logging: !dbConfig.isTest,
  };
}

/**
 * Initialize database if it doesn't exist
 */
async function initializeDatabase(dbConfig: DatabaseConfig): Promise<void> {
  const connection = new DataSource({
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: 'mysql', // Connect to default MySQL database
    synchronize: false,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
  });

  try {
    await connection.initialize();
    const queryRunner = connection.createQueryRunner();
    
    // Check if database exists
    const databases = await queryRunner.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    
    if (databases.length === 0) {
      // Create database if it doesn't exist
      await queryRunner.createDatabase(dbConfig.database);
      await queryRunner.connect();
      await queryRunner.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      logger.log(`Database ${dbConfig.database} created successfully`);
    } else {
      logger.log(`Database ${dbConfig.database} already exists`);
    }

    // If in test environment, drop and recreate the database
    if (dbConfig.isTest) {
      await queryRunner.query(`DROP DATABASE IF EXISTS ${dbConfig.database}`);
      await queryRunner.query(`CREATE DATABASE ${dbConfig.database}`);
      logger.log(`Test database ${dbConfig.database} recreated`);
    }

    await connection.destroy();
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  }
}

/**
 * Get TypeORM configuration for the application
 */
export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  try {
    const dbConfig = getDatabaseConfig(configService);
    const config = createTypeOrmConfig(dbConfig);
    
    logger.log(`Database configuration loaded successfully for ${dbConfig.isTest ? 'test' : 'development'} environment`);
    return config;
  } catch (error) {
    logger.error(`Failed to load database configuration: ${error.message}`);
    throw error;
  }
};

// Initialize database if it doesn't exist
const dbConfig = getDatabaseConfig(new ConfigService());
initializeDatabase(dbConfig).catch((error) => {
  logger.error('Failed to create database:', error);
  process.exit(1);
});

// Export DataSource for migrations
export default new DataSource(createDataSourceConfig(dbConfig));
