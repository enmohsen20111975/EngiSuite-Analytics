import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Loader/Spinner component
 */
function Loader({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  return (
    <Loader2
      className={cn(
        'animate-spin text-accent',
        sizes[size],
        className
      )}
    />
  );
}

/**
 * Full page loader
 */
function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader size="xl" />
      <p className="text-[var(--color-text-secondary)] animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Skeleton loader
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--color-bg-secondary)]',
        className
      )}
      {...props}
    />
  );
}

export { Loader, PageLoader, Skeleton };
export default Loader;
