// Import jest-dom matchers
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Define mock router types
type NextRouter = {
  push: jest.Mock;
  replace: jest.Mock;
  prefetch: jest.Mock;
  query: Record<string, string>;
  pathname: string;
  asPath: string;
};

type NextNavigation = {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  forward: jest.Mock;
  refresh: jest.Mock;
  prefetch: jest.Mock;
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: (): NextRouter => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: (): NextNavigation => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Silence expected Next.js warnings
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  if (typeof args[0] === 'string' && args[0]?.includes('The current testing environment is not configured to support act')) {
    return;
  }
  originalConsoleError(...args);
}; 