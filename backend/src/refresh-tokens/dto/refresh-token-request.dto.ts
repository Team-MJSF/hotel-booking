import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'The refresh token',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/^\S+$/, { message: 'Refresh token cannot contain whitespace' })
    refresh_token: string;
} 