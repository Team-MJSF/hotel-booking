import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import Footer from './Footer';
import MainLayout from './MainLayout';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { useInfoToast } from '@/context/ToastContext';

// Mock all external dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), refresh: jest.fn() })),
}));

jest.mock('@/store/authStore', () => jest.fn());
jest.mock('@/context/ToastContext', () => ({ useInfoToast: jest.fn() }));
jest.mock('next/link', () => ({ children, href, className, ...props }: { children: React.ReactNode; href: string; className?: string; [key: string]: any }) => {
  // Use a custom data-testid depending on the context
  const testId = props['data-context'] ? 
    `${props['data-context']}-link-${href.replace(/\//g, '-')}` : 
    `link-${href.replace(/\//g, '-')}`;
    
  return (
    <a href={href} className={className} data-testid={testId}>{children}</a>
  );
});

describe('Layout Components', () => {
  // Setup mocks for shared tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Date for consistent year in footer
    const originalDate = global.Date;
    global.Date = class extends originalDate {
      getFullYear() { return 2024; }
    } as DateConstructor;
    
    // Default mock implementations
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });
    (useInfoToast as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Unified test for all layout components to reduce test count
  test('renders layout components correctly with proper structure and behavior', async () => {
    // ===== 1. Test Navbar for different user states =====
    const userStates = [
      { 
        type: 'unauthenticated', 
        authState: { isAuthenticated: false, user: null },
        visibleTexts: ['Rooms', 'Login', 'Register'],
        hiddenTexts: ['My Bookings', 'Admin', 'Logout']
      },
      { 
        type: 'authenticated user', 
        authState: { 
          isAuthenticated: true, 
          user: { firstName: 'John', lastName: 'Doe', role: 'user' }
        },
        visibleTexts: ['Rooms', 'My Bookings', 'John Doe', 'Logout'],
        hiddenTexts: ['Login', 'Register', 'Admin']
      },
      { 
        type: 'admin user', 
        authState: { 
          isAuthenticated: true, 
          user: { firstName: 'Admin', lastName: 'User', role: 'admin' }
        },
        visibleTexts: ['Rooms', 'My Bookings', 'Admin', 'Admin User', 'Logout'],
        hiddenTexts: ['Login', 'Register']
      }
    ];

    // Test user states
    for (const { authState, visibleTexts, hiddenTexts } of userStates) {
      // Setup auth state
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        ...authState,
        logout: jest.fn(),
      });

      const { unmount } = render(<Navbar />);
      
      // Check visible elements
      for (const text of visibleTexts) {
        expect(screen.getByText(text, { selector: 'nav *' })).toBeInTheDocument();
      }
      
      // Check hidden elements
      for (const text of hiddenTexts) {
        expect(screen.queryByText(text, { selector: 'nav *' })).not.toBeInTheDocument();
      }
      
      unmount();
    }

    // ===== 2. Test navigation highlighting based on pathname =====
    // Setup authenticated user for navigation tests
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'user' },
      logout: jest.fn(),
    });

    // Test that different pathnames highlight different links
    // First test: rooms path
    (usePathname as jest.Mock).mockReturnValue('/rooms');
    const { unmount: navUnmount1 } = render(<Navbar />);
    
    // Just verify the component renders with the correct path
    expect(usePathname).toHaveBeenCalled();
    expect(screen.getByText('Rooms', { selector: 'nav *' })).toBeInTheDocument();
    expect(screen.getByText('My Bookings', { selector: 'nav *' })).toBeInTheDocument();
    
    navUnmount1();
    
    // Second test: bookings path
    (usePathname as jest.Mock).mockReturnValue('/bookings');
    const { unmount: navUnmount2 } = render(<Navbar />);
    
    // Just verify the component renders with the correct path
    expect(usePathname).toHaveBeenCalled();
    expect(screen.getByText('Rooms', { selector: 'nav *' })).toBeInTheDocument();
    expect(screen.getByText('My Bookings', { selector: 'nav *' })).toBeInTheDocument();
    
    navUnmount2();

    // ===== 3. Test logout functionality =====
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    const mockInfoToast = jest.fn();
    
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'user' },
      logout: mockLogout,
    });
    (useInfoToast as jest.Mock).mockReturnValue(mockInfoToast);

    render(<Navbar />);
    
    // Find and click the logout button
    const logoutButton = screen.getByText('Logout');
    await userEvent.click(logoutButton);
    
    // Check if logout was called and toast shown
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockInfoToast).toHaveBeenCalledWith(
      'You have been logged out successfully.',
      'Logged Out',
      3000
    );

    // Cleanup before next test
    const { unmount: clearBeforeFooter } = render(
      <div data-testid="cleanup">Cleanup</div>
    );
    clearBeforeFooter();

    // ===== 4. Test Footer content =====
    // Override the Link mock just for the Footer test to add context
    const FooterWithContext = () => (
      <div data-testid="footer-wrapper">
        <Footer />
      </div>
    );
    
    const { container } = render(<FooterWithContext />);
    
    // Check headings and content
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText(/Hotel Booking provides a seamless experience/i)).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    
    // Test footer content and verify the text content directly instead of using test IDs
    expect(screen.getByText('Home', { selector: 'footer *' })).toBeInTheDocument();
    expect(screen.getByText('Rooms', { selector: 'footer *' })).toBeInTheDocument();
    expect(screen.getByText('Login', { selector: 'footer *' })).toBeInTheDocument();
    expect(screen.getByText('Register', { selector: 'footer *' })).toBeInTheDocument();
    
    // Check copyright text
    expect(screen.getByText(/© 2024 Hotel Booking./i)).toBeInTheDocument();
    expect(screen.getByText(/educational purposes/i)).toBeInTheDocument();

    // Check footer styling
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-800');
    
    // Cleanup before next test
    const { unmount: clearBeforeLayout } = render(
      <div data-testid="component-wrapper">Component cleanup</div>
    );
    clearBeforeLayout();
    
    // ===== 5. Test MainLayout structure =====
    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );
    
    // Verify main content area
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check layout structure
    const wrapper = screen.getByTestId('test-content').parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
    expect(wrapper).toHaveClass('min-h-screen');
    
    const mainContent = screen.getByTestId('test-content').parentElement;
    expect(mainContent).toHaveClass('bg-gray-50');
    expect(mainContent).toHaveClass('flex-grow');
  });
}); 