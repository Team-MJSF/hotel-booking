import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
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
    password: 'hashedPassword123',
    role: UserRole.USER,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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

  describe('CRUD operations', () => {
    it('should handle findAll operation correctly', async () => {
      // Test case 1: Successful retrieval
      const expectedUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();
      expect(result).toEqual(expectedUsers);
      expect(usersService.findAll).toHaveBeenCalled();

      // Test case 2: Database error
      mockUsersService.findAll.mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });

    it('should handle findOne operation correctly', async () => {
      // Test case 1: Admin accessing any user
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1', adminUser);
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);

      // Test case 2: User accessing own profile
      const regularUser = { ...mockUser, id: 1 };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result2 = await controller.findOne('1', regularUser);
      expect(result2).toEqual(mockUser);

      // Test case 3: User trying to access another user's profile
      const otherUser = { ...mockUser, id: 2 };
      await expect(controller.findOne('1', otherUser)).rejects.toThrow(ForbiddenException);

      // Test case 4: User not found
      mockUsersService.findOne.mockRejectedValue(new ResourceNotFoundException('User', 1));
      await expect(controller.findOne('1', adminUser)).rejects.toThrow(ResourceNotFoundException);

      // Test case 5: Database error
      mockUsersService.findOne.mockRejectedValue(new Error('Database error'));
      await expect(controller.findOne('1', adminUser)).rejects.toThrow(DatabaseException);
    });

    it('should handle create operation correctly', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Test case 1: Successful creation
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);

      // Test case 2: Email already exists
      mockUsersService.create.mockRejectedValue(
        new ConflictException('User with email john@example.com already exists'),
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);

      // Test case 3: Database error
      mockUsersService.create.mockRejectedValue(new Error('Database error'));
      await expect(controller.create(createUserDto)).rejects.toThrow(DatabaseException);
    });

    it('should handle update operation correctly', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        role: UserRole.ADMIN,
      };

      // Test case 1: Successful update
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);
      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);

      // Test case 2: User not found
      mockUsersService.update.mockRejectedValue(new ResourceNotFoundException('User', 1));
      await expect(controller.update('1', updateUserDto)).rejects.toThrow(ResourceNotFoundException);

      // Test case 3: Email already exists
      mockUsersService.update.mockRejectedValue(
        new ConflictException('User with email jane@example.com already exists'),
      );
      await expect(controller.update('1', updateUserDto)).rejects.toThrow(ConflictException);

      // Test case 4: Database error
      mockUsersService.update.mockRejectedValue(new Error('Database error'));
      await expect(controller.update('1', updateUserDto)).rejects.toThrow(DatabaseException);
    });

    it('should handle remove operation correctly', async () => {
      // Test case 1: Successful removal
      mockUsersService.remove.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);

      // Test case 2: User not found
      mockUsersService.remove.mockRejectedValue(new ResourceNotFoundException('User', 1));
      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);

      // Test case 3: Database error
      mockUsersService.remove.mockRejectedValue(new Error('Database error'));
      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });
});
