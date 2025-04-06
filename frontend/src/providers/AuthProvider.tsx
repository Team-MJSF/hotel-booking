'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { useErrorToast } from '@/context/ToastContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/rooms',
  '/about',
  '/contact',
];

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, checkAuth, error, clearError } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const errorToast = useErrorToast();

  useEffect(() => {
    // Check authentication status when the component mounts
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Display error toast if there's an authentication error
    if (error) {
      errorToast(error, 'Authentication Error', 5000);
      clearError();
    }
  }, [error, errorToast, clearError]);

  useEffect(() => {
    // Skip for public routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith('/rooms/'))) {
      return;
    }

    // If auth state is loaded and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
} 