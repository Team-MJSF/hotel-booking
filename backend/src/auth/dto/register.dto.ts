import { IsEmail, IsString, MinLength, IsNotEmpty, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @Validate(PasswordMatchValidator, ['password'])
    confirmPassword: string;
} 