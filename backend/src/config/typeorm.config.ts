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

// Create a function to get database configuration
function getDatabaseConfig() {
  // Get database configuration directly from environment variables
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUsername = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  // Determine if we're in test environment
  const isTest = process.env.NODE_ENV === 'test';

  // Set the final database name based on environment
  const finalDbName = isTest ? 'hotel_booking_test' : dbName;

  // Validate required configurations
  if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
    logger.error('Missing required database configuration:', {
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword ? '[REDACTED]' : undefined,
      database: dbName,
      env,
      envPath
    });
    throw new Error('Missing required database configuration');
  }

  return {
    isTest,
    finalDbName,
    config: {
      type: 'mysql' as const,
      host: dbHost,
      port: parseInt(dbPort),
      username: dbUsername,
      password: dbPassword,
      database: finalDbName,
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
      }
    }
  };
}

// Function to create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const { isTest, finalDbName, config } = getDatabaseConfig();
  
  const connection = new DataSource({
    ...config,
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
    const databases = await queryRunner.query(`SHOW DATABASES LIKE '${finalDbName}'`);
    
    if (databases.length === 0) {
      // Create database if it doesn't exist
      await queryRunner.createDatabase(finalDbName);
      await queryRunner.connect();
      await queryRunner.query(`CREATE DATABASE IF NOT EXISTS ${finalDbName}`);
      logger.log(`Database ${finalDbName} created successfully`);
    } else {
      logger.log(`Database ${finalDbName} already exists`);
    }

    // If in test environment, drop and recreate the database
    if (isTest) {
      await queryRunner.query(`DROP DATABASE IF EXISTS ${finalDbName}`);
      await queryRunner.query(`CREATE DATABASE ${finalDbName}`);
      logger.log(`Test database ${finalDbName} recreated`);
    }

    await connection.destroy();
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  }
}

// Create database if it doesn't exist
createDatabaseIfNotExists().catch((error) => {
  logger.error('Failed to create database:', error);
  process.exit(1);
});

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  try {
    // Get database configuration from configService
    const dbHost = configService.get('DB_HOST');
    const dbPort = configService.get('DB_PORT');
    const dbUsername = configService.get('DB_USER');
    const dbPassword = configService.get('DB_PASSWORD');
    const dbName = configService.get('DB_NAME');

    // Determine if we're in test environment
    const isTest = process.env.NODE_ENV === 'test';

    // Set the final database name based on environment
    const finalDbName = isTest ? 'hotel_booking_test' : dbName;

    // Validate required configurations
    if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
      logger.error('Missing required database configuration:', {
        host: dbHost,
        port: dbPort,
        username: dbUsername,
        password: dbPassword ? '[REDACTED]' : undefined,
        database: dbName,
        env: process.env.NODE_ENV,
        envPath: join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
      });
      throw new Error('Missing required database configuration');
    }

    const config: TypeOrmModuleOptions = {
      type: 'mysql',
      host: dbHost,
      port: parseInt(dbPort),
      username: dbUsername,
      password: dbPassword,
      database: finalDbName,
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
      synchronize: isTest, // Enable synchronize only in test environment
      logging: isTest ? false : true, // Disable logging in test environment
      dropSchema: isTest, // Drop schema in test environment
      migrationsRun: !isTest, // Run migrations only in non-test environment
    };

    logger.log(`Database configuration loaded successfully for ${isTest ? 'test' : 'development'} environment`);
    return config;
  } catch (error) {
    logger.error(`Failed to load database configuration: ${error.message}`);
    throw error;
  }
};

// Get database configuration for migrations
const dbConfig = getDatabaseConfig();

// Export DataSource for migrations
export default new DataSource({
  ...dbConfig.config,
  synchronize: false,
  logging: dbConfig.isTest ? false : true,
} as DataSourceOptions);
