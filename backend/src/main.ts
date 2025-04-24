import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Ensure the SQLite data directory exists before starting
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logger.log(`Created data directory: ${dataDir}`);
  }
  
  const app = await NestFactory.create(AppModule);

  // Enable Helmet for security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Needed for Swagger UI
      crossOriginEmbedderPolicy: false, // Needed for Swagger UI
    }),
  );

  // Enable cookie parser
  app.use(cookieParser());

  // Request logging middleware
  app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.url}`);
    logger.log(`Request body: ${JSON.stringify(req.body)}`);
    logger.log(`Request headers: ${JSON.stringify(req.headers)}`);
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global response transformation
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger setup
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Hotel Booking API')
      .setDescription('API documentation for the Hotel Booking System')
      .setVersion('1.0')
      .addTag('Authentication', 'Authentication and user management endpoints')
      .addTag('Rooms', 'Room management and search endpoints')
      .addTag('Bookings', 'Booking management endpoints')
      .addTag('Payments', 'Payment processing endpoints')
      .addTag('Users', 'User account management and administration endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here must match the name in @ApiBearerAuth() decorator
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

// Only call bootstrap if this file is being run directly
if (require.main === module) {
  bootstrap();
}
