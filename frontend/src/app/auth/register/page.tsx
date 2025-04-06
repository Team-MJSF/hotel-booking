import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Hotel Booking',
  description: 'Create a new account with Hotel Booking',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Hotel Booking
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
} 