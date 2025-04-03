import { IsEmail, IsString, MinLength, IsNotEmpty, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
class PasswordMatchValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, string>)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

export class RegisterDto {
  @ApiProperty({ description: 'The user\'s first name' })
  @IsNotEmpty()
  @IsString()
    firstName: string;

  @ApiProperty({ description: 'The user\'s last name' })
  @IsNotEmpty()
  @IsString()
    lastName: string;

  @ApiProperty({ description: 'The user\'s email address' })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({ description: 'The user\'s password (minimum 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
    password: string;

  @ApiProperty({ description: 'Confirm the user\'s password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Validate(PasswordMatchValidator, ['password'])
    confirmPassword: string;

  @ApiProperty({ description: 'The user\'s role', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
    role?: UserRole;

  @ApiPropertyOptional({ description: 'The user\'s phone number' })
  @IsOptional()
  @IsString()
    phoneNumber?: string;

  @ApiPropertyOptional({ description: 'The user\'s address' })
  @IsOptional()
  @IsString()
    address?: string;
} 