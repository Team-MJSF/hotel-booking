import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
@Index('IDX_USERS_EMAIL', ['email'], { unique: true })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  @ApiProperty({ description: 'The unique identifier of the user' })
    id: number;

  @Column({ name: 'first_name' })
  @ApiProperty({ description: 'The first name of the user' })
    firstName: string;

  @Column({ name: 'last_name' })
  @ApiProperty({ description: 'The last name of the user' })
    lastName: string;

  @Column({ name: 'email' })
  @ApiProperty({ description: 'The email address of the user' })
    email: string;

  @Column({ name: 'password' })
  @ApiProperty({ description: 'The hashed password of the user' })
    password: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.USER })
  @ApiProperty({ description: 'The role of the user', enum: UserRole })
    role: UserRole;

  @Column({ name: 'phone_number', length: '20', nullable: true })
  @ApiProperty({ description: 'The user\'s phone number', required: false })
    phoneNumber?: string;

  @Column({ name: 'address', length: '255', nullable: true })
  @ApiProperty({ description: 'The user\'s address', required: false })
    address?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  @ApiProperty({ description: 'The bookings made by the user' })
    bookings: Booking[];
}
