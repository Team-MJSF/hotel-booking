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

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the user' })
    id: number;

  @Column()
  @ApiProperty({ description: 'The email address of the user' })
    email: string;

  @Column()
  @ApiProperty({ description: 'The hashed password of the user' })
    password: string;

  @Column()
  @ApiProperty({ description: 'The first name of the user' })
    firstName: string;

  @Column()
  @ApiProperty({ description: 'The last name of the user' })
    lastName: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  @ApiProperty({ description: 'The bookings made by the user' })
    bookings: Booking[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The date when the user was created' })
    createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date when the user was last updated' })
    updatedAt: Date;
}
