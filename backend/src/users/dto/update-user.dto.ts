import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsPhoneNumber, IsNumber, IsEmail, MinLength, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * Data Transfer Object for updating an existing user
 * Extends CreateUserDto but makes all fields optional
 * This allows partial updates of user information
 */
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[A-Z]).*$/, {
    message: 'Password must contain at least one special character, one number, and one uppercase letter'
  })
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, description: 'The user\'s token version', example: 1 })
  @IsOptional()
  @IsNumber()
  tokenVersion?: number;
}
