// Import required testing and application dependencies
import request from 'supertest';
import app from '../server.js';
import Users from '../models/Users.js';
import { sequelize } from '../config/database.js';

// Main test suite for Users API endpoints
describe('Users API', () => {
  // Set up test database before running any tests
  beforeAll(async () => {
    try {
      // Disable foreign key checks and reset database to clean state
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  });

  // Clean up test data before each individual test
  beforeEach(async () => {
    try {
      // Remove all users to ensure test isolation
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await Users.destroy({ where: {} });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('Test cleanup failed:', error);
      throw error;
    }
  });

  // Clean up and close database connection after all tests
  afterAll(async () => {
    try {
      // Remove all test data and close database connection
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await Users.destroy({ where: {} });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      await sequelize.close();
    } catch (error) {
      console.error('Database cleanup failed:', error);
      throw error;
    }
  });

  // Sample valid user data for testing
  const validUserData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phoneNumber: '1234567890',
    role: 'Guest'
  };

  // Test suite for user creation endpoint
  describe('POST /api/users', () => {
    // Test successful user creation
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body.email).toBe(validUserData.email);
    });

    // Test validation for invalid email
    it('should fail to create user with invalid email', async () => {
      const invalidUser = { ...validUserData, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    // Test validation for password length
    it('should fail to create user with short password', async () => {
      const invalidUser = { ...validUserData, password: '123' };
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  // Test suite for retrieving all users
  describe('GET /api/users', () => {
    // Test successful retrieval of multiple users
    it('should return all users', async () => {
      // Create test users
      await Users.create(validUserData);
      await Users.create({
        ...validUserData,
        email: 'jane@example.com'
      });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(2);
    });
  });

  // Test suite for retrieving a specific user
  describe('GET /api/users/:id', () => {
    // Test successful retrieval of a single user
    it('should return a user by id', async () => {
      const user = await Users.create(validUserData);
      const response = await request(app).get(`/api/users/${user.userId}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(validUserData.email);
    });

    // Test handling of non-existent user request
    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
    });
  });

  // Test suite for updating user information
  describe('PUT /api/users/:id', () => {
    // Test successful user update
    it('should update an existing user', async () => {
      const user = await Users.create(validUserData);
      const updatedData = {
        ...validUserData,
        fullName: 'John Updated',
        email: 'john.updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user.userId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.fullName).toBe(updatedData.fullName);
      expect(response.body.email).toBe(updatedData.email);
    });

    // Test validation during update
    it('should fail to update with invalid data', async () => {
      const user = await Users.create(validUserData);
      const invalidData = {
        ...validUserData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .put(`/api/users/${user.userId}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  // Test suite for user deletion
  describe('DELETE /api/users/:id', () => {
    // Test successful user deletion
    it('should delete an existing user', async () => {
      const user = await Users.create(validUserData);
      const response = await request(app).delete(`/api/users/${user.userId}`);

      expect(response.status).toBe(204);

      const deletedUser = await Users.findByPk(user.userId);
      expect(deletedUser).toBeNull();
    });

    // Test handling of non-existent user deletion
    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app).delete('/api/users/999');

      expect(response.status).toBe(404);
    });
  });
});