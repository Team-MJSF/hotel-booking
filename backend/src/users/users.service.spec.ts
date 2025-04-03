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

  describe('CRUD operations', () => {
    it('should handle findAll operation correctly', async () => {
      // Test case 1: Successful retrieval
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalled();

      // Test case 2: Database error
      mockRepository.find.mockRejectedValue(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });

    it('should handle findOne operation correctly', async () => {
      // Test case 1: Successful retrieval
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

      // Test case 2: User not found
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);

      // Test case 3: Database error
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));
      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });

    it('should handle findByEmail operation correctly', async () => {
      // Test case 1: Successful retrieval
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });

      // Test case 2: User not found
      mockRepository.findOne.mockResolvedValue(null);

      const result2 = await service.findByEmail('nonexistent@example.com');
      expect(result2).toBeNull();

      // Test case 3: Database error
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));
      await expect(service.findByEmail('john@example.com')).rejects.toThrow(DatabaseException);
    });

    it('should handle create operation correctly', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Test case 1: Successful creation
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        role: UserRole.USER,
      });
      expect(repository.save).toHaveBeenCalled();

      // Test case 2: Email already exists
      mockRepository.findOne.mockResolvedValue(mockUser);
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);

      // Test case 3: Database error
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('Database error'));
      await expect(service.create(createUserDto)).rejects.toThrow(DatabaseException);
    });

    it('should handle update operation correctly', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        email: 'jane@example.com',
        password: 'newpassword',
      };

      // Test case 1: Successful update
      const updatedUser = {
        ...mockUser,
        firstName: updateUserDto.firstName,
        email: updateUserDto.email,
        password: 'newHashedPassword',
      };

      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedUser);

      const result = await service.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(1, {
        firstName: updateUserDto.firstName,
        email: updateUserDto.email,
        password: 'newHashedPassword',
      });

      // Test case 2: User not found
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(1, updateUserDto)).rejects.toThrow(ResourceNotFoundException);

      // Test case 3: Email already exists
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.findOne.mockResolvedValueOnce({ ...mockUser, id: 2 });
      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);

      // Test case 4: Database error
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.update.mockRejectedValue(new Error('Database error'));
      await expect(service.update(1, updateUserDto)).rejects.toThrow(DatabaseException);
    });

    it('should handle remove operation correctly', async () => {
      // Test case 1: Successful removal
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);

      // Test case 2: User not found
      mockRepository.softDelete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);

      // Test case 3: Database error
      mockRepository.softDelete.mockRejectedValue(new Error('Database error'));
      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('validatePassword', () => {
    it('should handle password validation correctly', async () => {
      // Test case 1: Valid password
      const userWithHashedPassword = {
        ...mockUser,
        password: 'hashed_password123'
      };
      const result = await service.validatePassword(userWithHashedPassword, 'password123');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');

      // Test case 2: Invalid password
      const result2 = await service.validatePassword(userWithHashedPassword, 'wrongpassword');
      expect(result2).toBe(false);

      // Test case 3: Error during validation
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));
      await expect(service.validatePassword(userWithHashedPassword, 'password123')).rejects.toThrow(DatabaseException);
    });
  });
}); 