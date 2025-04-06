import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

/**
 * Get TypeORM configuration options for the application module
 * This file is separate from typeorm.config.ts which is used for migrations
 */
export async function getTypeOrmConfig(
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  // Define base directory for better path resolution
  const baseDir = join(__dirname, '..');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Check if we're running in "no migrations" mode
  const skipMigrations = process.env.SKIP_MIGRATIONS === 'true';
  
  const options: TypeOrmModuleOptions = {
    type: 'sqlite',
    database: join(process.cwd(), 'data', 'hotel_booking_dev.sqlite'),
    entities: [
      join(baseDir, '**', '*.entity.{ts,js}'),
      'dist/**/*.entity.js'
    ],
    // Enable synchronize for development or when migrations are skipped
    synchronize: isDevelopment || skipMigrations,
    // Disable migrations when in "no migrations" mode
    migrationsRun: !skipMigrations && false,
    logging: isDevelopment,
    entitySkipConstructor: true,
    autoLoadEntities: true,
  };

  return options;
}
