import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
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

  @Column({ name: 'role', default: 'user' })
  @ApiProperty({ description: 'The role of the user' })
    role: string;

  @Column({ name: 'phone_number', length: '20', nullable: true })
  @ApiProperty({ description: 'The user\'s phone number', required: false })
    phoneNumber?: string;

  @Column({ name: 'address', length: '255', nullable: true })
  @ApiProperty({ description: 'The user\'s address', required: false })
    address?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  @ApiProperty({ description: 'The bookings made by the user' })
    bookings: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The date when the user was created' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The date when the user was last updated' })
    updatedAt: Date;
}
