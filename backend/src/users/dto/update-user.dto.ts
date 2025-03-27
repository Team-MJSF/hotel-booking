import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Data Transfer Object for updating an existing user
 * Extends CreateUserDto but makes all fields optional
 * This allows partial updates of user information
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
