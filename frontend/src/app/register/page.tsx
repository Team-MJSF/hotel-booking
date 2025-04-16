'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock } from 'lucide-react';

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(6, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  console.log('RegisterPage component rendering');
  
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('RegisterPage: Auth context and hooks initialized');

  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  console.log('RegisterPage: Form validation setup complete');

  // Add an effect to log when the component mounts
  useEffect(() => {
    console.log('RegisterPage component mounted');
  }, []);

  const onSubmit = async (data: RegisterFormValues) => {
    console.log('onSubmit function called with data:', data);
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Register form submitted with data:', data);

      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      
      console.log('Registration result:', result);

      if (result.success) {
        console.log('Registration successful, preparing to redirect');
        // Preserve returnUrl or redirect parameter for login page
        let redirectParams = '';
        const returnUrl = searchParams.get('returnUrl');
        const redirectParam = searchParams.get('redirect');
        
        if (returnUrl) {
          redirectParams = `?returnUrl=${encodeURIComponent(returnUrl)}&registered=true`;
        } else if (redirectParam) {
          redirectParams = `?redirect=${encodeURIComponent(redirectParam)}&registered=true`;
        } else {
          redirectParams = '?registered=true';
        }
        
        console.log('Redirecting to login with params:', redirectParams);
        router.push(`/login${redirectParams}`);
      } else {
        console.error('Registration failed with message:', result.message);
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err: Error | unknown) {
      console.error('Registration error caught in try/catch:', err);
      if (err instanceof Error && err.message === 'Email already exists') {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manual direct form submission as a backup
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Manual form submission triggered');
    
    const formElement = e.target as HTMLFormElement;
    const firstName = (formElement.querySelector('#firstName') as HTMLInputElement)?.value;
    const lastName = (formElement.querySelector('#lastName') as HTMLInputElement)?.value;
    const email = (formElement.querySelector('#email') as HTMLInputElement)?.value;
    const password = (formElement.querySelector('#password') as HTMLInputElement)?.value;
    const confirmPassword = (formElement.querySelector('#confirmPassword') as HTMLInputElement)?.value;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Direct submission
    onSubmit({ firstName, lastName, email, password, confirmPassword } as RegisterFormValues);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
            <p className="text-gray-600">
              Join us to enjoy exclusive benefits and easy booking
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              console.log('Form onSubmit triggered');
              handleManualSubmit(e);
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="firstName"
                    className="pl-10"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="lastName"
                    className="pl-10"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              onClick={() => {
                // This will let the form's onSubmit handle it
                console.log('Button clicked, letting form onSubmit handle submission');
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href={`/login${
                    searchParams.get('returnUrl') 
                      ? `?returnUrl=${searchParams.get('returnUrl')}` 
                      : searchParams.get('redirect') 
                        ? `?redirect=${searchParams.get('redirect')}` 
                        : ''
                  }`}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 