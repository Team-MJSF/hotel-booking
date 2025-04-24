import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from './button';

describe('Button Component', () => {
  it('renders button with different variants correctly', () => {
    // Test multiple variants in a single test
    const { rerender } = render(<Button>Default</Button>);
    
    // Default variant
    let button = screen.getByRole('button', { name: /default/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
    
    // Destructive variant
    rerender(<Button variant="destructive">Destructive</Button>);
    button = screen.getByRole('button', { name: /destructive/i });
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('text-destructive-foreground');
    
    // Outline variant
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-input');
    
    // Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');
    expect(button).toHaveClass('text-secondary-foreground');
    
    // Ghost variant
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
    
    // Link variant
    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('hover:underline');
  });

  it('renders button with different sizes correctly', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    
    // Default size
    let button = screen.getByRole('button', { name: /default size/i });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-4');
    
    // Small size
    rerender(<Button size="sm">Small Size</Button>);
    button = screen.getByRole('button', { name: /small size/i });
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('px-3');
    
    // Large size
    rerender(<Button size="lg">Large Size</Button>);
    button = screen.getByRole('button', { name: /large size/i });
    expect(button).toHaveClass('h-11');
    expect(button).toHaveClass('px-8');
    
    // Icon size
    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });

  it('supports various button properties and interactions', async () => {
    // Test disabled state
    const { rerender } = render(<Button disabled>Disabled</Button>);
    let button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    
    // Test custom className
    rerender(<Button className="custom-class">Custom Class</Button>);
    button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass('custom-class');
    
    // Test ref forwarding
    const ref = React.createRef<HTMLButtonElement>();
    rerender(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
    expect(ref.current?.textContent).toBe('Ref Button');
    
    // Test click event
    const handleClick = jest.fn();
    rerender(<Button onClick={handleClick}>Click Handler</Button>);
    button = screen.getByRole('button', { name: /click handler/i });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports asChild composition pattern and buttonVariants utility', () => {
    // Test asChild functionality
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary');
    
    // Test buttonVariants utility
    const className = buttonVariants({ 
      variant: 'destructive', 
      size: 'lg', 
      className: 'extra-class' 
    });
    
    expect(className).toContain('bg-destructive');
    expect(className).toContain('text-destructive-foreground');
    expect(className).toContain('h-11');
    expect(className).toContain('px-8');
    expect(className).toContain('extra-class');
  });
}); 