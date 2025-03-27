import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT', '3306'), 10),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [path.join(__dirname, '../**/*.entity.ts')],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  driver: require('mysql2'),
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  }
});
