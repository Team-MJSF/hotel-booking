import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { Logger } from '@nestjs/common';

// Initialize logger
const logger = new Logger('TypeOrmAppConfig');

/**
 * Get TypeORM configuration options for the application module
 * This file is separate from typeorm.config.ts which is used for migrations
 */
export async function getTypeOrmConfig(configService: ConfigService): Promise<TypeOrmModuleOptions> {
  const options: TypeOrmModuleOptions = {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: ['dist/**/*.entity.js'],
    // Never use synchronize in any environment - always use migrations
    synchronize: false,
    // Run migrations when explicitly requested through the CLI
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development',
    entitySkipConstructor: true,
  };

  return options;
} 