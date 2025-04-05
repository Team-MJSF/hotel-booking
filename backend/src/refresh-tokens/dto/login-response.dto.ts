import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    description: 'The refresh token',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
} 