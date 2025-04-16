import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a welcome message',
    schema: { example: { message: 'Welcome to the Hotel Booking API!' } },
  })
  getHello(): { message: string } {
    return { message: 'Welcome to the Hotel Booking API!' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health' })
  @ApiResponse({
    status: 200,
    description: 'Returns API health status',
    schema: { 
      example: { 
        status: 'ok',
        message: 'API is running',
        timestamp: '2023-05-01T12:00:00.000Z',
        environment: 'development'
      } 
    },
  })
  checkHealth(): {
    status: string;
    message: string;
    timestamp: string;
    environment: string;
  } {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
} 