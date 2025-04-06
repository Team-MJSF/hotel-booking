This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Hotel Booking Frontend

Frontend application for the hotel booking system.

## Features

- User authentication and registration
- Room browsing and filtering
- Booking creation and management
- Payment processing
- Admin dashboard (for hotel staff)

## Toast Notification System

The application includes a toast notification system to provide feedback to users about their actions. These notifications appear temporarily at the top-right corner of the screen.

### Using Toast Notifications

The toast system provides several hooks for displaying different types of notifications:

```tsx
// Import the hooks
import { 
  useToast, 
  useSuccessToast, 
  useErrorToast, 
  useInfoToast, 
  useWarningToast 
} from '@/context/ToastContext';

// Inside your component
const MyComponent = () => {
  // General toast hook
  const { showToast, clearToasts } = useToast();
  
  // Specialized toast hooks
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();
  const warningToast = useWarningToast();
  
  const handleSuccess = () => {
    // Show a success toast with title, message, and custom duration (in ms)
    successToast('Operation completed successfully', 'Success', 5000);
  };
  
  const handleError = () => {
    // Show an error toast
    errorToast('Something went wrong', 'Error');
  };
  
  // Using the general toast hook
  const showCustomToast = () => {
    showToast({
      type: 'info',
      title: 'Information',
      message: 'This is an informational message',
      duration: 3000
    });
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={showCustomToast}>Show Custom</button>
      <button onClick={clearToasts}>Clear All</button>
    </div>
  );
};
```

### Toast Types

The system supports four types of notifications:

- `success`: Green-colored notifications for successful operations
- `error`: Red-colored notifications for errors and failures
- `warning`: Yellow-colored notifications for warnings
- `info`: Blue-colored notifications for general information

### Implementation

The toast system uses:

- **React Context**: For global state management
- **Framer Motion**: For smooth animations
- **Custom Hooks**: For easy usage throughout the application

This provides a consistent user experience and improves feedback throughout the application.
