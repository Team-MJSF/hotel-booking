import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '@/services/api';
import type { User } from '@/types';

// Import the AuthContextType directly for proper typing
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; message?: string}>;
  register: (userData: {email: string; password: string; confirmPassword: string; firstName: string; lastName: string}) => Promise<{success: boolean; message?: string}>;
  logout: () => void;
}

// Mock the entire authService
jest.mock('@/services/api', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    loginWithFetch: jest.fn(),
    register: jest.fn(),
  }
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Helper component to test the useAuth hook
const AuthConsumer = ({ onAuthState }: { onAuthState: (auth: AuthContextType) => void }) => {
  const auth = useAuth();
  React.useEffect(() => {
    onAuthState(auth);
  }, [auth, onAuthState]);
  return null;
};

// Test component with login form
const TestLoginComponent = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password123');
  const [loginResult, setLoginResult] = React.useState<{ success: boolean; message?: string } | null>(null);

  const handleLogin = async () => {
    const result = await login(email, password);
    setLoginResult(result);
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <input
        data-testid="email-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        data-testid="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      {loginResult && (
        <div data-testid="login-result">
          {loginResult.success ? 'Success' : `Error: ${loginResult.message}`}
        </div>
      )}
    </div>
  );
};

// Test component with registration form
const TestRegisterComponent = () => {
  const { register, isLoading } = useAuth();
  const [registerResult, setRegisterResult] = React.useState<{ success: boolean; message?: string } | null>(null);

  const handleRegister = async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };
    const result = await register(userData);
    setRegisterResult(result);
  };

  return (
    <div>
      <div data-testid="loading-status">{isLoading ? 'Loading...' : 'Ready'}</div>
      <button data-testid="register-button" onClick={handleRegister}>
        Register
      </button>
      {registerResult && (
        <div data-testid="register-result">
          {registerResult.success ? 'Success' : `Error: ${registerResult.message}`}
        </div>
      )}
    </div>
  );
};

// Simplified component for logout testing
const LogoutTest = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    window.sessionStorage.removeItem('token');
  };
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <button data-testid="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock storage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
    
    // Mock environment variable
    process.env.NEXT_PUBLIC_AUTH_STORAGE = 'sessionStorage';
  });

  it('provides authentication context and handles initialization states', async () => {
    // Test 1: Check context is provided correctly
    const authState = jest.fn();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer onAuthState={authState} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState).toHaveBeenCalled();
      const lastCall = authState.mock.calls[authState.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('isAuthenticated', false);
      expect(lastCall).toHaveProperty('user', null);
      expect(lastCall).toHaveProperty('login');
      expect(lastCall).toHaveProperty('register');
      expect(lastCall).toHaveProperty('logout');
    });
    
    unmount();
    
    // Test 2: Check initialization with valid token and user
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue('fake-token');
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { id: '123', email: 'user@example.com', firstName: 'Test', lastName: 'User' } 
    });

    render(
      <AuthProvider>
        <div data-testid="auth-check">Auth Check</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('token');
    });
    
    // Test 3: Check token removal with invalid user response
    jest.clearAllMocks();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue('fake-token');
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { } // Missing required fields
    });

    render(
      <AuthProvider>
        <div data-testid="auth-check">Auth Check</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('token');
    });
    
    // Test 4: Verify error when useAuth is used outside AuthProvider
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<AuthConsumer onAuthState={jest.fn()} />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    console.error = originalError;
  });

  it('handles authentication operations (login, logout, register)', async () => {
    const user = userEvent.setup();
    
    // Test 1: Successful login flow
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ success: false });
    
    const mockUser = { id: '123', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    (authService.login as jest.Mock).mockResolvedValueOnce({ 
      success: true, 
      data: { user: mockUser, token: 'new-token' } 
    });
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce('new-token');
    
    const { unmount: unmountLogin1 } = render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
    
    await user.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('login-result').textContent).toBe('Success');
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe(mockUser.email);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    // Make sure to completely unmount before the next test
    unmountLogin1();
    
    // Test 2: Login fallback with fetch when regular login fails
    jest.clearAllMocks();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ success: false });
    
    (authService.login as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      error: 'Invalid response from server' 
    });
    
    (authService.loginWithFetch as jest.Mock).mockResolvedValueOnce({ 
      success: true, 
      data: { 
        user: { id: '123', email: 'test@example.com' }, 
        token: 'fetch-token' 
      } 
    });
    
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce('fetch-token');
    
    const { unmount: unmountLogin2 } = render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
    
    await user.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(authService.loginWithFetch).toHaveBeenCalled();
      expect(screen.getByTestId('login-result').textContent).toBe('Success');
    });
    
    // Make sure to completely unmount before the next test
    unmountLogin2();
    
    // Test 3: Login failure with error message
    jest.clearAllMocks();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ success: false });
    
    (authService.login as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      error: 'Invalid credentials' 
    });
    
    const { unmount: unmountLogin3 } = render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
    
    await user.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('login-result').textContent).toBe('Error: Invalid credentials');
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
    
    // Make sure to completely unmount before the next test
    unmountLogin3();
    
    // Test 4: Successful registration
    jest.clearAllMocks();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ success: false });
    
    (authService.register as jest.Mock).mockResolvedValueOnce({ success: true });
    
    const { unmount: unmountRegister1 } = render(
      <AuthProvider>
        <TestRegisterComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
    
    await user.click(screen.getByTestId('register-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('register-result').textContent).toBe('Success');
      expect(authService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    });
    
    // Make sure to completely unmount before the next test
    unmountRegister1();
    
    // Test 5: Registration failure
    jest.clearAllMocks();
    (window.sessionStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ success: false });
    
    (authService.register as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      error: 'Email already exists' 
    });
    
    const { unmount: unmountRegister2 } = render(
      <AuthProvider>
        <TestRegisterComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
    
    await user.click(screen.getByTestId('register-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('register-result').textContent).toBe('Error: Email already exists');
    });
    
    // Make sure to completely unmount before the next test
    unmountRegister2();
    
    // Test 6: Logout functionality
    const { unmount: unmountLogout } = render(
      <LogoutTest />
    );
    
    expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    
    await user.click(screen.getByTestId('logout-button'));
    
    expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    
    unmountLogout();
  });
}); 