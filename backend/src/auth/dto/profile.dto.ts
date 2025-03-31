import { ApiProperty } from '@nestjs/swagger';
import { BaseUserDto } from '../../users/dto/base-user.dto';

export class ProfileDto extends BaseUserDto {
  @ApiProperty({ description: 'The user\'s ID' })
    id: number;

  @ApiProperty({ description: 'When the user was created' })
    createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated' })
    updatedAt: Date;
} 