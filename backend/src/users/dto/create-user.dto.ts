import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

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
   * The user's password (minimum 8 characters)
   */
  @ApiProperty({ description: 'The user\'s password (minimum 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
    password: string;

  /**
   * The user's role
   */
  @ApiProperty({ description: 'The user\'s role', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
    role?: UserRole;

  /**
   * The user's phone number
   */
  @ApiPropertyOptional({ description: 'The user\'s phone number' })
  @IsOptional()
  @IsString()
    phoneNumber?: string;

  /**
   * The user's address
   */
  @ApiPropertyOptional({ description: 'The user\'s address' })
  @IsOptional()
  @IsString()
    address?: string;
}
