import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

// Mock NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

// Mock Swagger
jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  ApiProperty: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiPropertyOptional: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  PartialType: jest.fn().mockImplementation((type) => type),
  ApiOperation: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiResponse: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiTags: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiBearerAuth: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiParam: jest.fn().mockImplementation(() => {
    return function() {};
  }),
  ApiBody: jest.fn().mockImplementation(() => {
    return function() {};
  }),
}));

describe('Bootstrap', () => {
  let mockApp: Partial<INestApplication>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock app
    mockApp = {
      enableCors: jest.fn().mockReturnThis(),
      useGlobalPipes: jest.fn().mockReturnThis(),
      useGlobalFilters: jest.fn().mockReturnThis(),
      listen: jest.fn().mockResolvedValue(undefined),
      use: jest.fn().mockReturnThis(),
    };

    // Setup NestFactory mock
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  it('should create the application with correct configuration', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe)
    );
    expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(HttpExceptionFilter)
    );
  });

  it('should setup Swagger documentation', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      mockApp,
      expect.any(Object)
    );
  });

  it('should start listening on the correct port', async () => {
    const port = process.env.PORT || 5000;
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(port);
  });
}); 