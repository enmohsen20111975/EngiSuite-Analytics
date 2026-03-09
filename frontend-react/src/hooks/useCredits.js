import { useCreditStore, CREDIT_COSTS } from '../stores/creditStore';

/**
 * Hook for consuming credits in components.
 *
 * Usage:
 *   const { credits, spend, isLow } = useCredits();
 *   const ok = spend('calculator'); // returns false + opens modal if insufficient
 */
export function useCredits() {
  const credits = useCreditStore((s) => s.credits);
  const isPaid = useCreditStore((s) => s.isPaid);
  const spend = useCreditStore((s) => s.spend);
  const addCredits = useCreditStore((s) => s.addCredits);

  const isLow = !isPaid && credits <= 20;
  const isEmpty = !isPaid && credits <= 0;

  return {
    credits,
    isPaid,
    isLow,
    isEmpty,
    spend,
    addCredits,
    CREDIT_COSTS,
  };
}
