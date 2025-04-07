import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  @ApiProperty({ description: 'Unique identifier for the refresh token' })
  id: number;

  @Column({ name: 'token' })
  @ApiProperty({ description: 'The refresh token value' })
  token: string;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({ description: 'Whether the token is active' })
  isActive: boolean;

  @Column({ name: 'expires_at', nullable: true, type: 'datetime' })
  @ApiProperty({ description: 'When the token expires' })
  expiresAt: Date;

  @ManyToOne(() => User, user => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ 
    description: 'The user this token belongs to',
    type: 'object',
    properties: {
      id: { type: 'number' },
      email: { type: 'string' }
    }
  })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'When the token was created' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'When the token was last updated' })
  updatedAt: Date;
}
