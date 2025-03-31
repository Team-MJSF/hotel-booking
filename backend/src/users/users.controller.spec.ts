import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';

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

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should throw DatabaseException when service fails', async () => {
      mockUsersService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    const mockCurrentUser: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a single user when accessing own profile', async () => {
      const expectedUser = { ...mockCurrentUser };
      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne('1', mockCurrentUser);

      expect(result).toEqual(expectedUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return a single user when admin accesses any profile', async () => {
      const adminUser = { ...mockCurrentUser, role: UserRole.ADMIN };
      const targetUser = { ...mockCurrentUser, id: 2 };
      mockUsersService.findOne.mockResolvedValue(targetUser);

      const result = await controller.findOne('2', adminUser);

      expect(result).toEqual(targetUser);
      expect(usersService.findOne).toHaveBeenCalledWith(2);
    });

    it('should throw ResourceNotFoundException when user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new ResourceNotFoundException('User', 1));

      await expect(controller.findOne('1', mockCurrentUser)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne('1', mockCurrentUser)).rejects.toThrow(DatabaseException);
    });

    it('should throw ForbiddenException when accessing another user\'s profile', async () => {
      await expect(controller.findOne('2', mockCurrentUser)).rejects.toThrow('You can only access your own profile');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      (mockUsersService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      (mockUsersService.create as jest.Mock).mockRejectedValue(
        new ConflictException('User with email john@example.com already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const error = new DatabaseException('Failed to create user', new Error('Database error'));
      (mockUsersService.create as jest.Mock).mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        role: UserRole.ADMIN,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      (mockUsersService.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw ResourceNotFoundException when user is not found', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        role: UserRole.ADMIN,
      };

      (mockUsersService.update as jest.Mock).mockRejectedValue(new ResourceNotFoundException('User', 1));

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'jane@example.com',
        role: UserRole.ADMIN,
      };

      (mockUsersService.update as jest.Mock).mockRejectedValue(
        new ConflictException('User with email jane@example.com already exists'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        role: UserRole.ADMIN,
      };

      const error = new DatabaseException('Failed to update user', new Error('Database error'));
      (mockUsersService.update as jest.Mock).mockRejectedValue(error);

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      (mockUsersService.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when user is not found', async () => {
      (mockUsersService.remove as jest.Mock).mockRejectedValue(new ResourceNotFoundException('User', 1));

      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to delete user', new Error('Database error'));
      (mockUsersService.remove as jest.Mock).mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });
});
