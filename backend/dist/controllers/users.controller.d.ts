/**
 * User Controller Module
 *
 * This module provides the business logic for all user-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting users.
 *
 * The controller implements user management operations:
 * - Get all users (with password exclusion for security)
 * - Get user by ID
 * - Create new user (with validation)
 * - Update existing user
 * - Delete user
 *
 * Error handling is implemented throughout with appropriate HTTP status codes.
 *
 * This controller uses dependency injection for better testability and maintainability.
 */
import { Request, Response } from 'express';
import { ValidationError, Result } from 'express-validator';
import DefaultUsers from '../models/Users.js';
interface ControllerDependencies {
    Users?: typeof DefaultUsers;
    validator?: (req: Request) => Result<ValidationError>;
}
/**
 * Create a User Controller factory
 *
 * This factory function creates user controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 *
 * @param {ControllerDependencies} deps - Dependencies to inject
 * @returns {Object} - Controller methods
 */
export declare const createUsersController: (deps?: ControllerDependencies) => {
    getAllUsers: (request: Request, response: Response) => Promise<void>;
    getUserById: (request: Request, response: Response) => Promise<void>;
    createUser: (request: Request, response: Response) => Promise<void>;
    updateUser: (request: Request, response: Response) => Promise<void>;
    deleteUser: (request: Request, response: Response) => Promise<void>;
};
export declare const getAllUsers: (request: Request, response: Response) => Promise<void>, getUserById: (request: Request, response: Response) => Promise<void>, createUser: (request: Request, response: Response) => Promise<void>, updateUser: (request: Request, response: Response) => Promise<void>, deleteUser: (request: Request, response: Response) => Promise<void>;
export {};
