import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'The new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/^\S+$/, { message: 'Access token cannot contain whitespace' })
  access_token: string;

  @ApiProperty({
    description: 'The new refresh token',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/^\S+$/, { message: 'Refresh token cannot contain whitespace' })
  refresh_token: string;
} 