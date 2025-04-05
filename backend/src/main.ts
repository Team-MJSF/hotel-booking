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
  const config = new DocumentBuilder()
    .setTitle('Hotel Booking API')
    .setDescription('The Hotel Booking API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

// Only call bootstrap if this file is being run directly
if (require.main === module) {
  bootstrap();
}
