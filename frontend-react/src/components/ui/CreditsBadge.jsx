import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { cn } from '../../lib/utils';

/**
 * Compact credit balance badge for headers/toolbars.
 * Clicking navigates to /subscription.
 */
export default function CreditsBadge({ className }) {
  const { credits, isPaid, isLow } = useCredits();
  const navigate = useNavigate();

  if (isPaid) return null; // Hide for paid users

  return (
    <button
      onClick={() => navigate('/subscription')}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        isLow
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]',
        className
      )}
      title="Your credit balance — click to upgrade"
    >
      <Coins className="w-4 h-4" />
      <span>{credits} pts</span>
      {isLow && (
        <span className="bg-red-500 text-white text-xs px-1 rounded">LOW</span>
      )}
    </button>
  );
}
