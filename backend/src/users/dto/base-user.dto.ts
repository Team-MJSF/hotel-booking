import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class BaseUserDto {
  @ApiProperty({ description: "The user's first name" })
  @IsString()
  firstName: string;

  @ApiProperty({ description: "The user's last name" })
  @IsString()
  lastName: string;

  @ApiProperty({ description: "The user's email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The user's role", enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  role?: UserRole;

  @ApiPropertyOptional({ description: "The user's phone number" })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: "The user's address" })
  @IsOptional()
  @IsString()
  address?: string;
}
