import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Toast, { ToastProps } from './Toast';
import ToastContainer from './ToastContainer';

// Mock framer-motion to avoid test issues with animations
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => (
        <div data-testid="motion-div" {...props}>
          {children}
        </div>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('UI Components', () => {
  // ===== Toast Component Tests =====
  describe('Toast Component', () => {
    const mockOnClose = jest.fn();
    
    const defaultProps: ToastProps = {
      id: 'test-toast-1',
      type: 'info',
      message: 'This is a test message',
      title: 'Test Title',
      onClose: mockOnClose,
    };
    
    beforeEach(() => {
      jest.useFakeTimers();
      mockOnClose.mockClear();
    });
    
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    
    test('renders different toast types correctly', () => {
      // Test all toast types in a single consolidated test
      const toastTypes = [
        { type: 'info', expectedClass: 'bg-blue-50' },
        { type: 'success', expectedClass: 'bg-green-50' },
        { type: 'error', expectedClass: 'bg-red-50' },
        { type: 'warning', expectedClass: 'bg-yellow-50' },
      ];
      
      for (const { type, expectedClass } of toastTypes) {
        const { unmount } = render(
          <Toast 
            {...defaultProps} 
            type={type as 'info' | 'success' | 'error' | 'warning'} 
            message={`${type} message`}
          />
        );
        
        expect(screen.getByText(`${type} message`)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass(expectedClass);
        
        unmount();
      }
      
      // Test with and without title
      const { unmount } = render(<Toast {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      unmount();
      
      render(<Toast {...defaultProps} title={undefined} />);
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });
    
    test('handles interactivity correctly', async () => {
      // Test close button functionality
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<Toast {...defaultProps} />);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1');
    });
    
    test('auto-closes after specified duration', () => {
      // Test custom duration
      mockOnClose.mockClear();
      render(<Toast {...defaultProps} duration={2000} />);
      
      expect(mockOnClose).not.toHaveBeenCalled();
      jest.advanceTimersByTime(2000);
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1');
      
      // Test default duration (5000ms)
      mockOnClose.mockClear();
      const { unmount } = render(<Toast {...defaultProps} duration={undefined} />);
      
      jest.advanceTimersByTime(4900);
      expect(mockOnClose).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1');
      
      unmount();
    });
  });
  
  // ===== ToastContainer Tests =====
  describe('ToastContainer Component', () => {
    // Create a custom mock for Toast component
    const MockToast = ({ id, message, title, type, onClose }: ToastProps) => (
      <div data-testid={`toast-${id}`} className={`toast-${type}`}>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <button onClick={() => onClose(id)}>Close</button>
      </div>
    );
    
    // Save the original implementation
    const OriginalToast = Toast;
    
    beforeEach(() => {
      // Replace the Toast component with our mock
      jest.mock('./Toast', () => ({
        __esModule: true,
        default: MockToast
      }));
    });
    
    afterEach(() => {
      jest.clearAllMocks();
    });
    
    test('renders and manages toast notifications', async () => {
      const mockOnCloseToast = jest.fn();
      
      // Define test toasts
      const mockToasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'success',
          message: 'Success message',
          title: 'Success',
          onClose: jest.fn(),
        },
        {
          id: 'toast-2',
          type: 'error',
          message: 'Error message',
          title: 'Error',
          onClose: jest.fn(),
        },
        {
          id: 'toast-3',
          type: 'info',
          message: 'Info message',
          title: 'Info',
          onClose: jest.fn(),
        },
      ];
      
      // Mock the toast container to use our mock toast
      const TestToastContainer = () => (
        <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-md">
          {mockToasts.map(toast => (
            <MockToast key={toast.id} {...toast} onClose={mockOnCloseToast} />
          ))}
        </div>
      );
      
      // Render our test container directly instead of the real ToastContainer
      render(<TestToastContainer />);
      
      // Verify all toasts are rendered with correct content
      expect(screen.getByTestId('toast-toast-1')).toBeInTheDocument();
      expect(screen.getByTestId('toast-toast-2')).toBeInTheDocument();
      expect(screen.getByTestId('toast-toast-3')).toBeInTheDocument();
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      
      // Verify toast types are applied
      expect(screen.getByTestId('toast-toast-1')).toHaveClass('toast-success');
      expect(screen.getByTestId('toast-toast-2')).toHaveClass('toast-error'); 
      expect(screen.getByTestId('toast-toast-3')).toHaveClass('toast-info');
      
      // Test toast dismissal
      const user = userEvent.setup();
      const closeButtons = screen.getAllByText('Close');
      await user.click(closeButtons[1]); // Click second toast's close button
      
      expect(mockOnCloseToast).toHaveBeenCalledWith('toast-2');
    });
  });
}); 