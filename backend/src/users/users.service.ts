import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Retrieves all users
   * @returns Promise<User[]> Array of all users
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      throw new DatabaseException('Failed to fetch users', error as Error);
    }
  }

  /**
   * Retrieves a user by ID
   * @param id - The ID of the user to retrieve
   * @returns Promise<User> The user with the specified ID
   * @throws ResourceNotFoundException if user is not found
   */
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new ResourceNotFoundException('User', id);
      }
      return user;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to fetch user', error as Error);
    }
  }

  /**
   * Retrieves a user by email address
   * @param email - The email address of the user to retrieve
   * @returns Promise<User | null> The user with the specified email, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      throw new DatabaseException('Failed to fetch user by email', error as Error);
    }
  }

  /**
   * Creates a new user
   * @param createUserDto - The data for creating a new user
   * @returns Promise<User> The newly created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user with email already exists
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException(`User with email ${createUserDto.email} already exists`);
      }

      // Create new user with default role if not specified
      const user = this.usersRepository.create({
        ...createUserDto,
        role: createUserDto.role || UserRole.USER,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to create user', error as Error);
    }
  }

  /**
   * Updates an existing user
   * @param id - The ID of the user to update
   * @param updateUserDto - The data to update the user with
   * @returns Promise<User> The updated user
   * @throws NotFoundException if user is not found
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id);

      // If email is being updated, check for conflicts
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);
        if (existingUser) {
          throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
        }
      }

      // If password is being updated, hash it
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Create a new object with only the fields that are being updated
      const updateData: Partial<User> = {};
      
      if (updateUserDto.firstName !== undefined) updateData.firstName = updateUserDto.firstName;
      if (updateUserDto.lastName !== undefined) updateData.lastName = updateUserDto.lastName;
      if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
      if (updateUserDto.password !== undefined) updateData.password = updateUserDto.password;
      if (updateUserDto.role !== undefined) updateData.role = updateUserDto.role;
      if (updateUserDto.phoneNumber !== undefined) updateData.phoneNumber = updateUserDto.phoneNumber;
      if (updateUserDto.address !== undefined) updateData.address = updateUserDto.address;

      // Only perform update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await this.usersRepository.update(id, updateData);
      }

      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to update user', error as Error);
    }
  }

  /**
   * Removes a user from the database
   * @param id - The ID of the user to remove
   * @returns Promise<void>
   * @throws NotFoundException if user is not found
   */
  async remove(id: number): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new ResourceNotFoundException('User', id);
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete user', error as Error);
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      this.logger.debug(`Comparing passwords for user ${user.email}`);
      const result = await bcrypt.compare(password, user.password);
      this.logger.debug(`Password comparison result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Password validation error: ${error.message}`);
      throw new DatabaseException('Failed to validate password', error as Error);
    }
  }
}
