import React, { forwardRef, HTMLAttributes } from 'react';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-xl border border-gray-700 bg-gray-800/50 shadow-lg p-6 ${className}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };
