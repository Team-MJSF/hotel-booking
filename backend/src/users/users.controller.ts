import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ResourceNotFoundException,
  ConflictException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiExtraModels(CreateUserDto, UpdateUserDto, User)
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users. Only accessible by administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [User],
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            phoneNumber: '+1234567890',
            address: '123 Main St',
            isActive: true,
            createdAt: '2023-01-01T12:00:00Z',
            updatedAt: '2023-01-02T12:00:00Z',
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'user',
            phoneNumber: '+0987654321',
            address: '456 Elm St',
            isActive: true,
            createdAt: '2023-01-03T12:00:00Z',
            updatedAt: '2023-01-04T12:00:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new DatabaseException('Failed to fetch users', error as Error);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieves detailed information for a specific user. Users can only access their own profile, while admins can access any profile.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
    content: {
      'application/json': {
        example: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'admin',
          phoneNumber: '+1234567890',
          address: '123 Main St',
          isActive: true,
          bookings: [
            {
              bookingId: 1,
              checkInDate: '2023-05-15T14:00:00Z',
              checkOutDate: '2023-05-20T11:00:00Z',
              numberOfGuests: 2,
              status: 'confirmed',
              createdAt: '2023-04-05T12:00:00Z',
              updatedAt: '2023-04-05T12:00:00Z',
            },
          ],
          createdAt: '2023-01-01T12:00:00Z',
          updatedAt: '2023-01-02T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access own profile unless admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser?: User): Promise<User> {
    try {
      // Only allow users to access their own profile or admins to access any profile
      if (currentUser?.role !== UserRole.ADMIN && currentUser?.id !== +id) {
        throw new ForbiddenException('You can only access your own profile');
      }
      return await this.usersService.findOne(+id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseException('Failed to fetch user', error as Error);
    }
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with the specified details. Only accessible by administrators.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      standard: {
        summary: 'Standard user',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'user',
          phoneNumber: '+1234567890',
          address: '123 Main St',
        },
      },
      adminUser: {
        summary: 'Admin user',
        value: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'AdminPass123!',
          confirmPassword: 'AdminPass123!',
          role: 'admin',
          phoneNumber: '+0987654321',
          address: '456 Elm St',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
    content: {
      'application/json': {
        example: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          phoneNumber: '+1234567890',
          address: '123 Main St',
          isActive: true,
          createdAt: '2023-01-01T12:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to create user', error as Error);
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates an existing user with the provided details. Users can only update their own profile, while admins can update any profile.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    examples: {
      profileUpdate: {
        summary: 'Update profile information',
        value: {
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: '+9876543210',
          address: 'New Address, City',
        },
      },
      emailUpdate: {
        summary: 'Update email',
        value: {
          email: 'new.email@example.com',
        },
      },
      passwordUpdate: {
        summary: 'Update password',
        value: {
          password: 'NewPassword123!',
        },
      },
      roleUpdate: {
        summary: 'Update role (admin only)',
        value: {
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
    content: {
      'application/json': {
        example: {
          id: 1,
          firstName: 'Updated',
          lastName: 'Name',
          email: 'john.doe@example.com',
          role: 'user',
          phoneNumber: '+9876543210',
          address: 'New Address, City',
          isActive: true,
          createdAt: '2023-01-01T12:00:00Z',
          updatedAt: '2023-01-05T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own profile unless admin' })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser?: User,
  ): Promise<User> {
    try {
      // Only allow users to update their own profile or admins to update any profile
      if (currentUser?.role !== UserRole.ADMIN && currentUser?.id !== +id) {
        throw new ForbiddenException('You can only update your own profile');
      }

      // Only admins can update roles
      if (updateUserDto.role && currentUser?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only administrators can change user roles');
      }

      return await this.usersService.update(+id, updateUserDto);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException('Failed to update user', error as Error);
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Soft-deletes a user. The record remains in the database but is marked as inactive. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser?: User): Promise<void> {
    try {
      // Prevent deletion of own account
      if (currentUser?.id === +id) {
        throw new ForbiddenException('You cannot delete your own account');
      }

      await this.usersService.remove(+id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete user', error as Error);
    }
  }
}
