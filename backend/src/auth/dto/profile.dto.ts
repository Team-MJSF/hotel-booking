import { ApiProperty } from '@nestjs/swagger';
import { BaseUserDto } from '../../users/dto/base-user.dto';
import { Transform } from 'class-transformer';

export class ProfileDto extends BaseUserDto {
  @ApiProperty({ description: "The user's ID" })
  id: number;

  @ApiProperty({ description: 'When the user was created' })
  @Transform(({ value }) => (value ? new Date(value) : value))
  createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated' })
  @Transform(({ value }) => (value ? new Date(value) : value))
  updatedAt: Date;
}
