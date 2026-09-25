import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * Input component
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  className,
  inputClassName,
  ...props
}, ref) => {
  const inputId = props.id || props.name;
  
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'transition-colors duration-200',
          'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          inputClassName
        )}
        {...props}
      />
      {(error || helperText) && (
        <p className={cn(
          'text-sm',
          error ? 'text-danger' : 'text-[var(--color-text-muted)]'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea component
 */
const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className,
  textareaClassName,
  rows = 4,
  ...props
}, ref) => {
  const inputId = props.id || props.name;
  
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg resize-none',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'transition-colors duration-200',
          'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          textareaClassName
        )}
        {...props}
      />
      {(error || helperText) && (
        <p className={cn(
          'text-sm',
          error ? 'text-danger' : 'text-[var(--color-text-muted)]'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * Select component
 */
const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select...',
  className,
  selectClassName,
  ...props
}, ref) => {
  const inputId = props.id || props.name;
  
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
          'text-[var(--color-text-primary)]',
          'transition-colors duration-200',
          'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          selectClassName
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={cn(
          'text-sm',
          error ? 'text-danger' : 'text-[var(--color-text-muted)]'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Input, Textarea, Select };
export default Input;
