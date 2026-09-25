import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';

/**
 * EmptyState component
 */
function EmptyState({
  icon: Icon = Inbox,
  title = 'No data',
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading data.',
  retry,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {retry && (
        <Button onClick={retry} variant="secondary">
          Try again
        </Button>
      )}
    </div>
  );
}

export { EmptyState, ErrorState };
export default EmptyState;
