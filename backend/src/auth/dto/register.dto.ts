import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'The user\'s first name' })
  @IsString()
  @IsNotEmpty()
    firstName: string;

  @ApiProperty({ description: 'The user\'s last name' })
  @IsString()
  @IsNotEmpty()
    lastName: string;

  @ApiProperty({ description: 'The user\'s email address' })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty({ description: 'The user\'s password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
    password: string;

  @ApiProperty({ description: 'Confirm the user\'s password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
    confirmPassword: string;
} 