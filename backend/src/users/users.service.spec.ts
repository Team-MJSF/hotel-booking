// Mock bcrypt before any imports
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(password === hash.replace('hashed_', '')))
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

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ResourceNotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findByEmail('john@example.com')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a new user', async () => {
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
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Jane',
      email: 'jane@example.com',
      password: 'newpassword',
    };

    it('should update a user', async () => {
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
    });

    it('should throw ResourceNotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.findOne.mockResolvedValueOnce({ ...mockUser, id: 2 });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.update.mockRejectedValue(error);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when user not found', async () => {
      mockRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.softDelete.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('validatePassword', () => {
    it('should return true when passwords match', async () => {
      const user = { ...mockUser, password: 'hashed_password123' };
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validatePassword(user, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
    });

    it('should return false when passwords do not match', async () => {
      const user = { ...mockUser, password: 'hashed_password123' };
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validatePassword(user, 'wrongpassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', user.password);
    });

    it('should throw DatabaseException when bcrypt fails', async () => {
      const user = { ...mockUser, password: 'hashed_password123' };
      const error = new Error('Bcrypt error');
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.validatePassword(user, 'password123')).rejects.toThrow(DatabaseException);
    });
  });
}); 