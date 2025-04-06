'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema } from '@/lib/validations/booking';
import { DayPicker } from 'react-day-picker';
import { format, addDays, differenceInDays } from 'date-fns';
import roomsService from '@/lib/api/roomsService';
import bookingsService from '@/lib/api/bookingsService';
import useAuthStore from '@/store/authStore';
import { formatCurrency } from '@/lib/utils/format';
import { useSuccessToast, useErrorToast, useInfoToast } from '@/context/ToastContext';

interface RoomDetailsProps {
  roomId: number;
}

export default function RoomDetails({ roomId }: RoomDetailsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  
  // Toast hooks
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();
  
  // Fetch room details
  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsService.getRoomById(roomId),
  });
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      roomId,
      checkInDate: '',
      checkOutDate: '',
      guestCount: 1,
      specialRequests: '',
    },
  });
  
  // Watch form values for calculations
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const guestCount = watch('guestCount');
  
  // Calculate total price when dates change
  React.useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      const nights = differenceInDays(endDate, startDate);
      if (nights > 0) {
        setTotalPrice(room.price * nights);
      }
    }
  }, [room, checkInDate, checkOutDate]);
  
  const handleCalendarCheckInSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setValue('checkInDate', formattedDate);
      setShowCheckInCalendar(false);
      
      // Auto-select checkout date as next day if not already selected
      const checkOutValue = watch('checkOutDate');
      if (!checkOutValue) {
        setValue('checkOutDate', format(addDays(date, 1), 'yyyy-MM-dd'));
      }
    }
  };
  
  const handleCalendarCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      setValue('checkOutDate', format(date, 'yyyy-MM-dd'));
      setShowCheckOutCalendar(false);
    }
  };
  
  const onSubmit = async (data: any) => {
    if (!isAuthenticated) {
      infoToast(
        'Please log in to continue with your booking',
        'Login Required',
        4000
      );
      router.push('/auth/login');
      return;
    }
    
    try {
      setIsBooking(true);
      const booking = await bookingsService.createBooking({
        ...data,
        roomId: Number(data.roomId),
        guestCount: Number(data.guestCount),
      });
      
      // Show success toast
      successToast(
        `You have successfully booked ${room?.roomNumber || 'this room'} from ${format(new Date(data.checkInDate), 'MMM dd, yyyy')} to ${format(new Date(data.checkOutDate), 'MMM dd, yyyy')}`,
        'Booking Confirmed!',
        5000
      );
      
      // Redirect to the booking page
      router.push(`/bookings/${booking.id}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Show error toast
      errorToast(
        error.message || 'Failed to create booking. Please try again.',
        'Booking Error',
        8000
      );
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !room) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-6 rounded-lg text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Room</h2>
            <p>We couldn't find the room you're looking for. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Room Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {room.type} - Room {room.roomNumber}
          </h1>
          <p className="text-xl text-gray-600">{formatCurrency(room.price)} per night</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative h-96 w-full">
                <Image
                  src={room.images[0] || 'https://placehold.co/800x600?text=No+Image'}
                  alt={room.type}
                  fill
                  className="object-cover"
                />
              </div>
              
              {room.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {room.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative h-24">
                      <Image
                        src={image}
                        alt={`${room.type} image ${index + 2}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Room Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-600 mb-6">{room.description}</p>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Room Type</h3>
                  <p className="text-gray-800">{room.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                  <p className="text-gray-800">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="text-gray-800">{formatCurrency(room.price)} per night</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className={`font-medium ${
                    room.status === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Book this Room</h2>
              
              {room.status !== 'available' ? (
                <div className="bg-red-50 p-4 rounded text-red-600 mb-4">
                  <p className="font-semibold">Room Not Available</p>
                  <p className="text-sm">This room is currently not available for booking.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register('roomId')} />
                  
                  {/* Check-in Date */}
                  <div className="relative">
                    <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date *
                    </label>
                    <input
                      id="checkInDate"
                      type="text"
                      readOnly
                      placeholder="Select date"
                      {...register('checkInDate')}
                      onClick={() => setShowCheckInCalendar(true)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer ${
                        errors.checkInDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.checkInDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.checkInDate.message?.toString()}</p>
                    )}
                    
                    {showCheckInCalendar && (
                      <div className="absolute z-10 mt-1 bg-white p-4 border border-gray-200 rounded-md shadow-lg">
                        <Controller
                          control={control}
                          name="checkInDate"
                          render={({ field }) => (
                            <DayPicker
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={handleCalendarCheckInSelect}
                              fromDate={new Date()}
                              modifiers={{ disabled: { before: new Date() } }}
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
                  
                  {/* Check-out Date */}
                  <div className="relative">
                    <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date *
                    </label>
                    <input
                      id="checkOutDate"
                      type="text"
                      readOnly
                      placeholder="Select date"
                      {...register('checkOutDate')}
                      onClick={() => setShowCheckOutCalendar(true)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer ${
                        errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.checkOutDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.checkOutDate.message?.toString()}</p>
                    )}
                    
                    {showCheckOutCalendar && (
                      <div className="absolute z-10 mt-1 bg-white p-4 border border-gray-200 rounded-md shadow-lg">
                        <Controller
                          control={control}
                          name="checkOutDate"
                          render={({ field }) => (
                            <DayPicker
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={handleCalendarCheckOutSelect}
                              fromDate={checkInDate ? addDays(new Date(checkInDate), 1) : new Date()}
                              modifiers={{ 
                                disabled: { 
                                  before: checkInDate ? addDays(new Date(checkInDate), 1) : new Date() 
                                } 
                              }}
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
                  
                  {/* Number of Guests */}
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests *
                    </label>
                    <select
                      id="guestCount"
                      {...register('guestCount')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.guestCount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    {errors.guestCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.guestCount.message?.toString()}</p>
                    )}
                  </div>
                  
                  {/* Special Requests */}
                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="specialRequests"
                      rows={3}
                      {...register('specialRequests')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Any special requirements or requests..."
                    ></textarea>
                  </div>
                  
                  {/* Price Summary */}
                  {checkInDate && checkOutDate && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Price Summary</h3>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">
                          {formatCurrency(room.price)} x {
                            differenceInDays(new Date(checkOutDate), new Date(checkInDate))
                          } nights
                        </span>
                        <span className="font-medium">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isBooking || room.status !== 'available'}
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium ${
                      isBooking || room.status !== 'available' ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isBooking ? 'Processing...' : 'Book Now'}
                  </button>
                  
                  {!isAuthenticated && (
                    <p className="mt-2 text-sm text-gray-500 text-center">
                      You'll need to login before completing your booking.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 