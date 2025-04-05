import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsOptional,
} from 'class-validator';
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

export class RegisterDto {
  @ApiProperty({ description: "The user's first name" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: "The user's last name" })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The user's password (minimum 8 characters)" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: "Confirm the user's password" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Validate(PasswordMatchValidator, ['password'])
  confirmPassword: string;

  @ApiPropertyOptional({ description: "The user's phone number" })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: "The user's address" })
  @IsOptional()
  @IsString()
  address?: string;
}
