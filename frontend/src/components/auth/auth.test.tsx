import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useRouter } from 'next/navigation';

// === Common Mocks ===
// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock auth store
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('@/store/authStore', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      login: mockLogin,
      register: mockRegister
    }))
  };
});

// Mock the toast context
jest.mock('@/context/ToastContext', () => ({
  useSuccessToast: jest.fn().mockReturnValue(jest.fn()),
  useErrorToast: jest.fn().mockReturnValue(jest.fn())
}));

// Setup common variables for tests
const mockPush = jest.fn();
const mockSuccessToast = jest.fn();
const mockErrorToast = jest.fn();

describe('Auth Components', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    
    // Mock toast functions
    require('@/context/ToastContext').useSuccessToast.mockReturnValue(mockSuccessToast);
    require('@/context/ToastContext').useErrorToast.mockReturnValue(mockErrorToast);
  });
  
  // === LoginForm Tests ===
  describe('LoginForm Component', () => {
    // Test for rendering and validation
    it('renders login form and validates user input', async () => {
      const user = userEvent.setup();
      
      render(<LoginForm />);
      
      // Check form renders properly
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/Register here/i)).toBeInTheDocument();
      
      // Test form validation - submit with empty fields
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      // Check validation errors appear
      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
      
      // Test form validation - invalid email format
      await user.type(screen.getByLabelText(/Email Address/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
      
      // Test form validation - short password
      await user.clear(screen.getByLabelText(/Email Address/i));
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'short');
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
    
    // Test for successful login
    it('handles successful login and redirects user', async () => {
      const user = userEvent.setup();
      
      // Setup mock for successful login
      mockLogin.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
      
      render(<LoginForm />);
      
      // Fill in form with valid data
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      // Verify login was called with correct parameters
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      
      // Wait for login success handling
      await waitFor(() => {
        // Verify success toast was shown
        expect(mockSuccessToast).toHaveBeenCalledWith(
          'You have successfully logged in.',
          'Welcome back!',
          3000
        );
        
        // Verify redirect happened
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
    
    // Test for login error handling
    it('handles login errors and shows error message', async () => {
      const user = userEvent.setup();
      
      // Setup mock for failed login
      const loginError: any = new Error('Invalid credentials');
      loginError.response = { data: { message: 'Invalid credentials' } };
      mockLogin.mockRejectedValueOnce(loginError);
      
      render(<LoginForm />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'wrong-password');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      // Wait for error handling
      await waitFor(() => {
        // Verify error toast was shown
        expect(mockErrorToast).toHaveBeenCalledWith(
          'Invalid credentials',
          'Login Error',
          5000
        );
        
        // Verify no redirect happened
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
    
    // Test registration link
    it('links to registration page', async () => {
      render(<LoginForm />);
      
      // Check if the register link points to the correct route
      const registerLink = screen.getByText(/Register here/i);
      expect(registerLink).toHaveAttribute('href', '/auth/register');
    });
  });
  
  // === RegisterForm Tests ===
  describe('RegisterForm Component', () => {
    it('renders, validates, submits and handles errors correctly', async () => {
      const user = userEvent.setup();
      
      // 1. Test rendering all form elements
      const { unmount, rerender } = render(<RegisterForm />);
      
      // Check form renders properly
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
      
      // Check if the login link points to the correct route
      const loginLink = screen.getByText(/Sign in/i);
      expect(loginLink).toHaveAttribute('href', '/auth/login');
      
      // 2. Test form validation - trigger all validation errors
      // Submit empty form to trigger validation errors
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      // Check validation errors appear for required fields
      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
      
      // Test email validation
      await user.type(screen.getByLabelText(/Email Address/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
      
      // Test password length validation
      await user.type(screen.getByLabelText(/^Password$/i), 'short');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });
      
      // Test password complexity validation
      await user.clear(screen.getByLabelText(/^Password$/i));
      await user.type(screen.getByLabelText(/^Password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
      
      // Test password confirmation validation
      await user.clear(screen.getByLabelText(/^Password$/i));
      await user.type(screen.getByLabelText(/^Password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'Different123!');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
      
      // 3. Test successful registration flow
      // Clean up and reset for next test scenario
      unmount();
      jest.clearAllMocks();
      
      // Setup mock for successful registration
      mockRegister.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
      
      // Render a fresh component
      const { unmount: unmount2 } = render(<RegisterForm />);
      
      // Fill in form with valid data
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      // Verify register function was called with correct parameters
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'Password123!',
        });
      });
      
      // Wait for registration success handling
      await waitFor(() => {
        // Verify success toast was shown
        expect(mockSuccessToast).toHaveBeenCalledWith(
          'Your account has been created successfully.',
          'Welcome to Hotel Booking!',
          3000
        );
        
        // Verify redirect happened
        expect(mockPush).toHaveBeenCalledWith('/');
      });
      
      // 4. Test registration error handling
      // Clean up and reset for next test scenario
      unmount2();
      jest.clearAllMocks();
      
      // Setup mock for failed registration
      const registerError = new Error('Email already exists');
      (registerError as any).response = { data: { message: 'Email already exists' } };
      mockRegister.mockRejectedValueOnce(registerError);
      
      // Render a fresh component
      const { unmount: unmount3 } = render(<RegisterForm />);
      
      // Fill in form with valid data
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      // Wait for error handling
      await waitFor(() => {
        // Verify error toast was shown
        expect(mockErrorToast).toHaveBeenCalledWith(
          'Email already exists',
          'Registration Error',
          5000
        );
        
        // Verify no redirect happened
        expect(mockPush).not.toHaveBeenCalled();
      });
      
      // Clean up
      unmount3();
    });
  });
}); 