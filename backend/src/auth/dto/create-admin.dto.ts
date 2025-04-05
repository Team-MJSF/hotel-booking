import { IsEmail, IsString, MinLength, IsNotEmpty, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CreateAdminDto {
  @ApiProperty({ description: 'The admin\'s first name' })
  @IsNotEmpty()
  @IsString()
    firstName: string;

  @ApiProperty({ description: 'The admin\'s last name' })
  @IsNotEmpty()
  @IsString()
    lastName: string;

  @ApiProperty({ description: 'The admin\'s email address' })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({ description: 'The admin\'s password (minimum 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
    password: string;

  @ApiProperty({ description: 'Confirm the admin\'s password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Validate(PasswordMatchValidator, ['password'])
    confirmPassword: string;

  @ApiPropertyOptional({ description: 'The admin\'s phone number' })
  @IsOptional()
  @IsString()
    phoneNumber?: string;

  @ApiPropertyOptional({ description: 'The admin\'s address' })
  @IsOptional()
  @IsString()
    address?: string;
} 