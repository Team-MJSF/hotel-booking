/**
 * User Controller Module
 * Handles all business logic for User operations
 */
import { validationResult } from 'express-validator';
import Users from '../models/Users.js';

// Get all users
export const getAllUsers = async (request, response) => {
  try {
    const users = await Users.findAll({ 
      attributes: { exclude: ['password'] } 
    });
    response.json(users);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (request, response) => {
  try {
    const user = await Users.findByPk(request.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    response.json(user);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create new user
export const createUser = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const newUser = await Users.create({
      fullName: request.body.fullName,
      email: request.body.email,
      password: request.body.password,
      phoneNumber: request.body.phoneNumber,
      role: request.body.role || 'Guest'
    });

    const { ...userWithoutPassword } = newUser.toJSON();
    response.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.status(400).json({ message: 'Email already exists' });
    }
    response.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
export const updateUser = async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await Users.findByPk(request.params.id);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    await user.update({
      fullName: request.body.fullName,
      email: request.body.email,
      phoneNumber: request.body.phoneNumber,
      role: request.body.role || user.role
    });

    response.json(user.toJSON());
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.status(400).json({ message: 'Email already exists' });
    }
    response.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
export const deleteUser = async (request, response) => {
  try {
    const user = await Users.findByPk(request.params.id);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    response.json({ message: 'User deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};