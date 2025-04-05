import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ResourceNotFoundException,
  ConflictException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';
import { ForbiddenException } from '@nestjs/common';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true,
  };

  const createUserDto: CreateUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should handle all findAll scenarios', async () => {
      // Success case
      const expectedUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValueOnce(expectedUsers);
      const result = await controller.findAll();
      expect(result).toEqual(expectedUsers);
      expect(usersService.findAll).toHaveBeenCalled();

      // Error case
      mockUsersService.findAll.mockRejectedValueOnce(new Error('Database error'));
      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Admin accessing any user case
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      mockUsersService.findOne.mockResolvedValueOnce(mockUser);
      const result = await controller.findOne('1', adminUser);
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);

      // User accessing own profile case
      const regularUser = { ...mockUser, id: 1 };
      mockUsersService.findOne.mockResolvedValueOnce(mockUser);
      const result2 = await controller.findOne('1', regularUser);
      expect(result2).toEqual(mockUser);

      // User trying to access another user's profile case
      const otherUser = { ...mockUser, id: 2 };
      await expect(controller.findOne('1', otherUser)).rejects.toThrow(ForbiddenException);

      // Not found case
      mockUsersService.findOne.mockRejectedValueOnce(new ResourceNotFoundException('User', 1));
      await expect(controller.findOne('1', adminUser)).rejects.toThrow(ResourceNotFoundException);

      // Error case
      mockUsersService.findOne.mockRejectedValueOnce(new Error('Database error'));
      await expect(controller.findOne('1', adminUser)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      // Success case
      mockUsersService.create.mockResolvedValueOnce(mockUser);
      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);

      // Email exists case
      mockUsersService.create.mockRejectedValueOnce(
        new ConflictException('User with email john@example.com already exists'),
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);

      // Error case
      mockUsersService.create.mockRejectedValueOnce(new Error('Database error'));
      await expect(controller.create(createUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        role: UserRole.ADMIN,
      };

      // Admin user updating another user
      const adminUser = { ...mockUser, id: 2, role: UserRole.ADMIN };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValueOnce(updatedUser);
      const result = await controller.update('1', updateUserDto, adminUser);
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);

      // User updating their own profile
      const regularUser = { ...mockUser, id: 1, role: UserRole.USER };
      const selfUpdateDto: UpdateUserDto = { firstName: 'Johnny' };
      const selfUpdatedUser = { ...mockUser, ...selfUpdateDto };
      mockUsersService.update.mockResolvedValueOnce(selfUpdatedUser);
      const result2 = await controller.update('1', selfUpdateDto, regularUser);
      expect(result2).toEqual(selfUpdatedUser);

      // User trying to update another user's profile
      const otherUser = { ...mockUser, id: 2, role: UserRole.USER };
      await expect(controller.update('1', updateUserDto, otherUser)).rejects.toThrow(
        ForbiddenException,
      );

      // Regular user trying to update role
      await expect(controller.update('1', { role: UserRole.ADMIN }, regularUser)).rejects.toThrow(
        ForbiddenException,
      );

      // Not found case
      mockUsersService.update.mockRejectedValueOnce(new ResourceNotFoundException('User', 1));
      await expect(controller.update('1', updateUserDto, adminUser)).rejects.toThrow(
        ResourceNotFoundException,
      );

      // Email exists case
      mockUsersService.update.mockRejectedValueOnce(
        new ConflictException('User with email jane@example.com already exists'),
      );
      await expect(controller.update('1', updateUserDto, adminUser)).rejects.toThrow(
        ConflictException,
      );

      // Error case
      mockUsersService.update.mockRejectedValueOnce(new Error('Database error'));
      await expect(controller.update('1', updateUserDto, adminUser)).rejects.toThrow(
        DatabaseException,
      );
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Admin removing another user
      const adminUser = { ...mockUser, id: 2, role: UserRole.ADMIN };
      mockUsersService.remove.mockResolvedValueOnce(undefined);
      await controller.remove('1', adminUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);

      // Admin trying to remove own account
      await expect(controller.remove('2', adminUser)).rejects.toThrow(ForbiddenException);

      // Not found case
      mockUsersService.remove.mockRejectedValueOnce(new ResourceNotFoundException('User', 1));
      await expect(controller.remove('1', adminUser)).rejects.toThrow(ResourceNotFoundException);

      // Error case
      mockUsersService.remove.mockRejectedValueOnce(new Error('Database error'));
      await expect(controller.remove('1', adminUser)).rejects.toThrow(DatabaseException);
    });
  });
});
