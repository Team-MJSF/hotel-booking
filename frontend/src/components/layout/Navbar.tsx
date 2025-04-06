'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { useInfoToast } from '@/context/ToastContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const infoToast = useInfoToast();

  const handleLogout = async () => {
    await logout();
    infoToast('You have been logged out successfully.', 'Logged Out', 3000);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Hotel Booking
              </Link>
            </div>

            <div className="ml-6 flex items-center space-x-4">
              <Link
                href="/rooms"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/rooms' || pathname.startsWith('/rooms/')
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                Rooms
              </Link>

              {isAuthenticated && (
                <Link
                  href="/bookings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/bookings' || pathname.startsWith('/bookings/')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  My Bookings
                </Link>
              )}

              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith('/admin')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* User Authentication */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/profile'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {user?.firstName} {user?.lastName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/auth/login'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 