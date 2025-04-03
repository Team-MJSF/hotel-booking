// Mock bcrypt before any imports
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => {
    // Extract the original password from the hashed value
    const originalPassword = hash.replace('hashed_', '');
    return Promise.resolve(password === originalPassword);
  })
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Main St',
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockLoggerInstance = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      fatal: jest.fn(),
      localInstance: {} as Logger,
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: Logger,
          useValue: mockLoggerInstance,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should handle all findAll scenarios', async () => {
      // Success case
      const users = [mockUser];
      mockRepository.find.mockResolvedValueOnce(users);
      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalled();

      // Error case
      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Success case
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

      // Not found case
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);

      // Error case
      mockRepository.findOne.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByEmail', () => {
    it('should handle all findByEmail scenarios', async () => {
      // Success case
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });

      // Not found case
      mockRepository.findOne.mockResolvedValueOnce(null);
      const result2 = await service.findByEmail('nonexistent@example.com');
      expect(result2).toBeNull();

      // Error case
      mockRepository.findOne.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.findByEmail('john@example.com')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Success case
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValueOnce(mockUser);
      mockRepository.save.mockResolvedValueOnce(mockUser);
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        role: UserRole.USER,
      });
      expect(repository.save).toHaveBeenCalled();

      // Email exists case
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);

      // Error case
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValueOnce(mockUser);
      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.create(createUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        email: 'jane@example.com',
        password: 'newpassword',
      };

      // Success case
      const updatedUser = {
        ...mockUser,
        firstName: updateUserDto.firstName,
        email: updateUserDto.email,
        password: 'newHashedPassword',
      };

      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('newHashedPassword');
      mockRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedUser);

      const result = await service.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(1, {
        firstName: updateUserDto.firstName,
        email: updateUserDto.email,
        password: 'newHashedPassword',
      });

      // Not found case
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, updateUserDto)).rejects.toThrow(ResourceNotFoundException);

      // Email exists case
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce({ ...mockUser, id: 2 });
      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);

      // Error case
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.update.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.update(1, updateUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Success case
      mockRepository.softDelete.mockResolvedValueOnce({ affected: 1 });
      await service.remove(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);

      // Not found case
      mockRepository.softDelete.mockResolvedValueOnce({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);

      // Error case
      mockRepository.softDelete.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('validatePassword', () => {
    it('should handle all password validation scenarios', async () => {
      const userWithHashedPassword = {
        ...mockUser,
        password: 'hashed_password123'
      };

      // Success case
      const result = await service.validatePassword(userWithHashedPassword, 'password123');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');

      // Invalid password case
      const result2 = await service.validatePassword(userWithHashedPassword, 'wrongpassword');
      expect(result2).toBe(false);

      // Error case
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));
      await expect(service.validatePassword(userWithHashedPassword, 'password123')).rejects.toThrow(DatabaseException);
    });
  });
}); 