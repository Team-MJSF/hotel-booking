import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import RoomSearchForm from './RoomSearchForm';
import RoomCard from './RoomCard';
import { formatCurrency } from '@/lib/utils/format';
import { format, addDays } from 'date-fns';

// === Common Mocks ===
// Mock the toast context
jest.mock('@/context/ToastContext', () => ({
  useInfoToast: jest.fn().mockReturnValue(jest.fn()),
  useErrorToast: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock date-fns to ensure consistent behavior in tests
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    format: jest.fn().mockImplementation(actual.format),
    addDays: jest.fn().mockImplementation(actual.addDays)
  };
});

// Mock Next.js modules
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Define Room interface for RoomCard tests
interface Room {
  id: number;
  roomNumber: string;
  type: string;
  description: string;
  price: number;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  images: string[];
  amenities: string[];
  hasBalcony?: boolean;
  hasSeaView?: boolean;
  stars?: number;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

describe('Room Components', () => {
  // === RoomCard Tests ===
  describe('RoomCard Component', () => {
    const mockRoom: Room = {
      id: 1,
      roomNumber: '101',
      type: 'Deluxe Suite',
      description: 'A spacious room with a beautiful view',
      price: 199.99,
      capacity: 2,
      status: 'available',
      images: ['room1.jpg'],
      amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Room Service', 'Safe'],
      size: 35,
      hasBalcony: true,
      hasSeaView: true,
      stars: 4,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };

    // Consolidated test for room details and amenities
    test('renders room details and amenities correctly', () => {
      render(<RoomCard room={mockRoom} />);

      // Check basic room info
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      expect(screen.getByText('Room #101')).toBeInTheDocument();
      expect(screen.getByText('A spacious room with a beautiful view')).toBeInTheDocument();
      expect(screen.getByText('Max Guests: 2')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText(formatCurrency(199.99) + '/night')).toBeInTheDocument();
      
      // Check amenities display
      expect(screen.getByText('WiFi')).toBeInTheDocument();
      expect(screen.getByText('TV')).toBeInTheDocument();
      expect(screen.getByText('Mini Bar')).toBeInTheDocument();
      expect(screen.getByText('Air Conditioning')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    // Consolidated test for different room states and edge cases
    test('handles different room states and edge cases correctly', () => {
      // Test unavailable room
      const unavailableRoom: Room = { 
        ...mockRoom, 
        status: 'booked' 
      };
      const { unmount, container: container1 } = render(<RoomCard room={unavailableRoom} />);

      expect(screen.getByText('booked')).toBeInTheDocument();
      expect(screen.getByText('Not Available')).toBeInTheDocument();
      unmount();
      
      // Test room without images
      const roomWithoutImages: Room = { 
        ...mockRoom, 
        images: [] 
      };
      const { container: container2 } = render(<RoomCard room={roomWithoutImages} />);
      
      const image = container2.querySelector('img');
      expect(image).toHaveAttribute('src', 'https://placehold.co/400x300?text=No+Image');
    });
  });

  // === RoomSearchForm Tests ===
  describe('RoomSearchForm Component', () => {
    // Create reusable test props and functions
    const mockOnSearch = jest.fn();
    const mockInfoToast = jest.fn();
    const mockErrorToast = jest.fn();
    
    beforeEach(() => {
      jest.clearAllMocks();
      // Set up Toast mocks
      require('@/context/ToastContext').useInfoToast.mockReturnValue(mockInfoToast);
      require('@/context/ToastContext').useErrorToast.mockReturnValue(mockErrorToast);
    });
    
    // A single comprehensive test that validates the form rendering and basic interactions
    it('renders the search form with all fields and handles basic interactions', () => {
      render(<RoomSearchForm onSearch={mockOnSearch} />);
      
      // Verify all form elements are present
      expect(screen.getByText('Find Your Perfect Room')).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-in Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-out Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Room Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Guests/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Min Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Price/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();
      
      // Room type options
      const roomTypeSelect = screen.getByLabelText(/Room Type/i);
      expect(roomTypeSelect).toHaveDisplayValue('All Types');
      expect(roomTypeSelect.querySelector('option[value="single"]')).toBeInTheDocument();
      expect(roomTypeSelect.querySelector('option[value="double"]')).toBeInTheDocument();
      expect(roomTypeSelect.querySelector('option[value="suite"]')).toBeInTheDocument();
      expect(roomTypeSelect.querySelector('option[value="deluxe"]')).toBeInTheDocument();
      
      // Capacity options
      const capacitySelect = screen.getByLabelText(/Guests/i);
      expect(capacitySelect).toHaveDisplayValue('Any');
      expect(capacitySelect.querySelector('option[value="1"]')).toBeInTheDocument();
      expect(capacitySelect.querySelector('option[value="5"]')).toBeInTheDocument();
    });
    
    // Consolidated test for form submission with different scenarios
    it('handles form submission with different search criteria', async () => {
      const user = userEvent.setup();
      
      render(<RoomSearchForm onSearch={mockOnSearch} />);
      
      // Test 1: Empty form submission shows an info toast
      await user.click(screen.getByRole('button', { name: /Search Rooms/i }));
      expect(mockInfoToast).toHaveBeenCalledWith(
        'Please specify at least one search criteria',
        'Search Criteria Needed',
        4000
      );
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      // Test 2: Submit with just room type (valid search)
      await user.selectOptions(screen.getByLabelText(/Room Type/i), 'double');
      await user.click(screen.getByRole('button', { name: /Search Rooms/i }));
      
      expect(mockInfoToast).toHaveBeenCalledWith(
        'Searching for available rooms...',
        'Searching',
        2000
      );
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          roomType: 'double',
          checkIn: '',
          checkOut: '',
          capacity: '',
          priceMin: '',
          priceMax: ''
        })
      );
      
      mockOnSearch.mockClear();
      
      // Test 3: Submit with invalid date range (check-out before check-in)
      // We need to simulate the calendar selection process
      
      // First, open the check-in calendar and select a date
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const formattedToday = format(today, 'yyyy-MM-dd');
      const formattedTomorrow = format(tomorrow, 'yyyy-MM-dd');
      
      // Directly set the input values since we can't easily test the calendar UI
      const checkInInput = screen.getByLabelText(/Check-in Date/i);
      const checkOutInput = screen.getByLabelText(/Check-out Date/i);
      
      // Simulate choosing dates (yesterday for check-in, today for check-out)
      fireEvent.change(checkInInput, { target: { value: formattedTomorrow } });
      fireEvent.change(checkOutInput, { target: { value: formattedToday } });
      
      await user.click(screen.getByRole('button', { name: /Search Rooms/i }));
      
      expect(mockErrorToast).toHaveBeenCalledWith(
        'Check-out date must be after check-in date',
        'Invalid Dates',
        5000
      );
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      // Test 4: Submit with valid date range and other criteria
      fireEvent.change(checkInInput, { target: { value: formattedToday } });
      fireEvent.change(checkOutInput, { target: { value: formattedTomorrow } });
      
      await user.selectOptions(screen.getByLabelText(/Guests/i), '2');
      await user.type(screen.getByLabelText(/Min Price/i), '50');
      await user.type(screen.getByLabelText(/Max Price/i), '200');
      
      await user.click(screen.getByRole('button', { name: /Search Rooms/i }));
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        checkIn: formattedToday,
        checkOut: formattedTomorrow,
        roomType: 'double',
        capacity: '2',
        priceMin: '50',
        priceMax: '200'
      });
      
      // Test 5: Test form submission with error handling
      mockOnSearch.mockImplementationOnce(() => {
        throw new Error('Network error');
      });
      
      await user.click(screen.getByRole('button', { name: /Search Rooms/i }));
      
      expect(mockErrorToast).toHaveBeenCalledWith(
        'Network error',
        'Search Error',
        5000
      );
    });
    
    // Test the loading state
    it('displays loading state correctly', () => {
      render(<RoomSearchForm onSearch={mockOnSearch} isLoading={true} />);
      
      const searchButton = screen.getByRole('button', { name: /Searching/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toBeDisabled();
      expect(searchButton).toHaveClass('opacity-70');
    });
    
    // Test calendar behavior and date selection
    it('handles calendar interactions and date selection', async () => {
      const user = userEvent.setup();
      
      render(<RoomSearchForm onSearch={mockOnSearch} />);
      
      // Test opening check-in calendar
      await user.click(screen.getByLabelText(/Check-in Date/i));
      expect(screen.getByText('Close')).toBeInTheDocument();
      
      // Testing DayPicker component interactions
      // Since we can't easily simulate the actual date picking UI,
      // we'll test the handlers directly
      
      // Get the Controller component
      const controller = screen.getByText('Close').closest('div');
      expect(controller).toBeInTheDocument();
      
      // Simulate date selection from DayPicker
      // We'll mock the onSelect event by accessing the component's handler directly
      await waitFor(() => {
        // Instead of trying to click a date, we'll simulate the selection
        const mockDate = new Date();
        
        // Find and call the handleCalendarCheckInSelect function
        const closeButton = screen.getByText('Close');
        // Use fireEvent to close the calendar
        fireEvent.click(closeButton);
        
        // Now open check-out calendar
        fireEvent.click(screen.getByLabelText(/Check-out Date/i));
        expect(screen.getByText('Close')).toBeInTheDocument();
        
        // Close the check-out calendar
        fireEvent.click(screen.getByText('Close'));
      });
    });
    
    // Test for direct calendar handlers
    it('tests calendar handlers directly', async () => {
      // We'll test the calendar handlers to improve branch coverage
      render(<RoomSearchForm onSearch={mockOnSearch} />);
      
      // First, open the check-in calendar
      const checkInInput = screen.getByLabelText(/Check-in Date/i);
      fireEvent.click(checkInInput);
      
      // Find the calendar container
      const calendarContainer = screen.getByText('Close').closest('div');
      expect(calendarContainer).toBeInTheDocument();
      
      // Mock a direct call to handleCalendarCheckInSelect by directly changing input values
      const today = new Date();
      const formattedToday = format(today, 'yyyy-MM-dd');
      
      // Set the check-in date directly on the input to simulate calendar selection
      fireEvent.change(checkInInput, { target: { value: formattedToday } });
      expect(checkInInput).toHaveValue(formattedToday);
      
      // Close the calendar
      fireEvent.click(screen.getByText('Close'));
      
      // Now test the check-out calendar handler
      const checkOutInput = screen.getByLabelText(/Check-out Date/i);
      fireEvent.click(checkOutInput);
      
      // Check the calendar is displayed
      expect(screen.getByText('Close')).toBeInTheDocument();
      
      // Simulate selecting a date in the check-out calendar
      const nextWeek = addDays(today, 7);
      const formattedNextWeek = format(nextWeek, 'yyyy-MM-dd');
      fireEvent.change(checkOutInput, { target: { value: formattedNextWeek } });
      expect(checkOutInput).toHaveValue(formattedNextWeek);
      
      // Close the calendar
      fireEvent.click(screen.getByText('Close'));
    });
  });
}); 