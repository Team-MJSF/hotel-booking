import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRole } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { initTestApp, cleanupTestDatabase } from '../../database/test-utils';

describe('User Flow Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  
  // Use unique email addresses to avoid conflicts
  const testUser = {
    email: `user-flow-test-${Date.now()}@example.com`,
    password: 'password123',
    confirmPassword: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    // Set up test module
    const setup = await initTestApp();
    app = setup;
    dataSource = app.get(DataSource);
    
    // Clean up database before tests
    await cleanupTestDatabase(dataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  it('should handle basic user operations', async () => {
    // Step 1: Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    expect(registerResponse.body).toMatchObject({
      success: true,
      message: 'Registration successful',
      data: {
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: UserRole.USER,
      }
    });
    
    // Step 2: Login with registered user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);
    
    userToken = loginResponse.body.access_token;
    expect(userToken).toBeDefined();
    
    // Step 3: Get user profile
    const profileResponse = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    
    expect(profileResponse.body).toMatchObject({
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
    });
    
    // Step 4: Update user profile
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
    };
    
    const updateResponse = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData)
      .expect(200);
    
    expect(updateResponse.body).toMatchObject({
      email: testUser.email,
      firstName: updateData.firstName,
      lastName: updateData.lastName,
    });
    
    // Step 5: Verify user cannot access admin endpoints
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
