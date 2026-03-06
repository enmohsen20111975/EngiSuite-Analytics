import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * Card component
 */
const Card = forwardRef(({
  children,
  className,
  hover = false,
  glass = false,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-[var(--color-border)]',
        'bg-white dark:bg-gray-900/80',
        glass && 'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80',
        hover && 'transition-all duration-300 ease-out hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30',
        !hover && 'shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Card Header
 */
const CardHeader = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-[var(--color-border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * Card Title
 */
const CardTitle = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-[var(--color-text-primary)]', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * Card Description
 */
const CardDescription = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * Card Content
 */
const CardContent = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * Card Footer
 */
const CardFooter = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-[var(--color-border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
