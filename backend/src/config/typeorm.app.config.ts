import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

/**
 * Get TypeORM configuration options for the application module
 * This file is separate from typeorm.config.ts which is used for migrations
 */
export function getTypeOrmConfig(
  _configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  return Promise.resolve({
    // Define base directory for better path resolution
    type: 'sqlite',
    database: join(process.cwd(), 'data', 'hotel_booking_dev.sqlite'),
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    // Enable synchronize for development
    synchronize: process.env.NODE_ENV === 'development',
    // Disable migrations when in "no migrations" mode
    migrationsRun: process.env.SKIP_MIGRATIONS !== 'true' && false,
    logging: process.env.NODE_ENV === 'development',
    entitySkipConstructor: true,
    autoLoadEntities: true,
  });
}
