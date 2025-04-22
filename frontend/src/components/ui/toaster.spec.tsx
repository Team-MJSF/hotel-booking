import { render, screen } from '@testing-library/react';
import { Toaster } from './toaster';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toasts: [
      {
        id: '1',
        title: 'Hello',
        description: 'This is a test toast',
        action: null,
      },
    ],
  }),
}));

describe('Toaster', () => {
  it('renders a toast with title and description', () => {
    render(<Toaster />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('This is a test toast')).toBeInTheDocument();
  });
});
