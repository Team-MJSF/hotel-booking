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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new DatabaseException('Failed to fetch users', error as Error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin or self only)' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access own profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    try {
      // Only allow users to access their own profile or admins to access any profile
      if (currentUser.role !== 'admin' && currentUser.id !== +id) {
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
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
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
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.usersService.update(+id, updateUserDto);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to update user', error as Error);
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.usersService.remove(+id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to delete user', error as Error);
    }
  }
}
