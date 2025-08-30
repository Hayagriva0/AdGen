
import React, { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 py-1 px-3 text-sm',
    };

    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900
        disabled:opacity-50 disabled:pointer-events-none
        bg-indigo-600 text-white hover:bg-indigo-700
        ${sizeClasses[size]}
        ${className}`}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
