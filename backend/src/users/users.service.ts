import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Retrieves all users from the database
   * @returns Promise<User[]> Array of all users with their bookings
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['bookings'],
    });
  }

  /**
   * Retrieves a single user by ID
   * @param id - The ID of the user to retrieve
   * @returns Promise<User> The user with the specified ID
   * @throws NotFoundException if user is not found
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Retrieves a user by email address
   * @param email - The email address of the user to retrieve
   * @returns Promise<User | null> The user with the specified email, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Creates a new user
   * @param createUserDto - The data for creating a new user
   * @returns Promise<User> The newly created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  /**
   * Updates an existing user
   * @param id - The ID of the user to update
   * @param updateUserDto - The data to update the user with
   * @returns Promise<User> The updated user
   * @throws NotFoundException if user is not found
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.usersRepository.update(id, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  /**
   * Removes a user from the database
   * @param id - The ID of the user to remove
   * @returns Promise<void>
   * @throws NotFoundException if user is not found
   */
  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
