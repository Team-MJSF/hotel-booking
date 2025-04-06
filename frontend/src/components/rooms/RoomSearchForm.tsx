'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSearchSchema, type BookingSearchFormData } from '@/lib/validations/booking';
import { DayPicker } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { useInfoToast, useErrorToast } from '@/context/ToastContext';

interface RoomSearchFormProps {
  onSearch: (data: BookingSearchFormData) => void;
  isLoading?: boolean;
}

const RoomSearchForm: React.FC<RoomSearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [showCheckInCalendar, setShowCheckInCalendar] = React.useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = React.useState(false);
  
  const infoToast = useInfoToast();
  const errorToast = useErrorToast();
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingSearchFormData>({
    resolver: zodResolver(bookingSearchSchema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      capacity: '',
      roomType: '',
      priceMin: '',
      priceMax: '',
    },
  });

  // Watch the check-in date to set minimum check-out date
  const checkInDate = watch('checkIn');
  
  const handleCalendarCheckInSelect = (date: Date | undefined) => {
    if (date) {
      setValue('checkIn', format(date, 'yyyy-MM-dd'));
      setShowCheckInCalendar(false);
      
      // Auto-select checkout date as next day if not already selected
      const checkOutValue = watch('checkOut');
      if (!checkOutValue) {
        setValue('checkOut', format(addDays(date, 1), 'yyyy-MM-dd'));
      }
    }
  };
  
  const handleCalendarCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      setValue('checkOut', format(date, 'yyyy-MM-dd'));
      setShowCheckOutCalendar(false);
    }
  };
  
  const handleFormSubmit = (data: BookingSearchFormData) => {
    try {
      // Check if any search criteria is provided
      const hasSearchCriteria = Object.values(data).some(value => value && value !== '');
      
      if (!hasSearchCriteria) {
        infoToast(
          'Please specify at least one search criteria',
          'Search Criteria Needed',
          4000
        );
        return;
      }
      
      // If dates are provided, ensure they make sense
      if (data.checkIn && data.checkOut) {
        const checkIn = new Date(data.checkIn);
        const checkOut = new Date(data.checkOut);
        
        if (checkOut <= checkIn) {
          errorToast(
            'Check-out date must be after check-in date',
            'Invalid Dates',
            5000
          );
          return;
        }
      }
      
      // Show info toast about searching
      infoToast(
        'Searching for available rooms...',
        'Searching',
        2000
      );
      
      // Call the provided onSearch function
      onSearch(data);
    } catch (error: any) {
      errorToast(
        error.message || 'An error occurred while searching. Please try again.',
        'Search Error',
        5000
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Your Perfect Room</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in Date Field */}
          <div className="relative">
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              id="checkIn"
              type="text"
              placeholder="Select date"
              readOnly
              onClick={() => setShowCheckInCalendar(true)}
              {...register('checkIn')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            />
            {errors.checkIn && (
              <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>
            )}
            
            {showCheckInCalendar && (
              <div className="absolute z-10 mt-1 bg-white p-4 border border-gray-200 rounded-md shadow-lg">
                <Controller
                  control={control}
                  name="checkIn"
                  render={({ field }) => (
                    <DayPicker
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={handleCalendarCheckInSelect}
                      fromDate={new Date()}
                      modifiers={{
                        disabled: { before: new Date() },
                      }}
                      className="bg-white"
                    />
                  )}
                />
                <button
                  type="button"
                  className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                  onClick={() => setShowCheckInCalendar(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          {/* Check-out Date Field */}
          <div className="relative">
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              id="checkOut"
              type="text"
              placeholder="Select date"
              readOnly
              onClick={() => setShowCheckOutCalendar(true)}
              {...register('checkOut')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            />
            {errors.checkOut && (
              <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>
            )}
            
            {showCheckOutCalendar && (
              <div className="absolute z-10 mt-1 bg-white p-4 border border-gray-200 rounded-md shadow-lg">
                <Controller
                  control={control}
                  name="checkOut"
                  render={({ field }) => (
                    <DayPicker
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={handleCalendarCheckOutSelect}
                      fromDate={checkInDate ? addDays(new Date(checkInDate), 1) : new Date()}
                      modifiers={{
                        disabled: { 
                          before: checkInDate 
                            ? addDays(new Date(checkInDate), 1)
                            : new Date()
                        },
                      }}
                      className="bg-white"
                    />
                  )}
                />
                <button
                  type="button"
                  className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                  onClick={() => setShowCheckOutCalendar(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Room Type Field */}
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              id="roomType"
              {...register('roomType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>
          
          {/* Capacity Field */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <select
              id="capacity"
              {...register('capacity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
              <option value="4">4 People</option>
              <option value="5">5+ People</option>
            </select>
          </div>
          
          {/* Price Range Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                id="priceMin"
                type="number"
                placeholder="Min $"
                {...register('priceMin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                id="priceMax"
                type="number"
                placeholder="Max $"
                {...register('priceMax')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Searching...' : 'Search Rooms'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomSearchForm; 