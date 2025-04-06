import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Hotel Booking',
  description: 'Sign in to your Hotel Booking account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Hotel Booking
        </h1>
        <LoginForm />
      </div>
    </div>
  );
} 