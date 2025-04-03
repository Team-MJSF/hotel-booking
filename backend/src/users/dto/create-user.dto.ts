import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for creating a new user
 * Contains all required fields for user creation
 */
export class CreateUserDto {
  /**
   * The user's first name
   */
  @ApiProperty({ description: 'The user\'s first name' })
  @IsNotEmpty()
  @IsString()
    firstName: string;

  /**
   * The user's last name
   */
  @ApiProperty({ description: 'The user\'s last name' })
  @IsNotEmpty()
  @IsString()
    lastName: string;

  /**
   * The user's email address
   */
  @ApiProperty({ description: 'The user\'s email address' })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  /**
   * The user's password (minimum 8 characters, must contain at least one uppercase letter,
   * one lowercase letter, one number, and one special character)
   */
  @ApiProperty({ description: 'The user\'s password (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  )
    password: string;

  /**
   * The user's role
   */
  @ApiProperty({ description: 'The user\'s role', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
    role?: UserRole;

  /**
   * The user's phone number
   */
  @ApiPropertyOptional({ description: 'The user\'s phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'Phone number must be a valid international format (e.g., +1234567890)',
  })
    phoneNumber?: string;

  /**
   * The user's address
   */
  @ApiPropertyOptional({ description: 'The user\'s address' })
  @IsOptional()
  @IsString()
    address?: string;
}
