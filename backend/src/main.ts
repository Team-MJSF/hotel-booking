import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable Helmet for security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Needed for Swagger UI
    crossOriginEmbedderPolicy: false, // Needed for Swagger UI
  }));

  // Enable CORS
  app.enableCors();

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
