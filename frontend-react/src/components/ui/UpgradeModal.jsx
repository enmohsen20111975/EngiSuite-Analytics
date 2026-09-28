import { useNavigate } from 'react-router-dom';
import { Coins, X, ArrowRight, Zap } from 'lucide-react';
import { useCreditStore } from '../../stores/creditStore';

/**
 * Global modal shown when a free user runs out of credits.
 * Mount this once in AppLayout.
 */
export default function UpgradeModal() {
  const showUpgradeModal = useCreditStore((s) => s.showUpgradeModal);
  const closeUpgradeModal = useCreditStore((s) => s.closeUpgradeModal);
  const credits = useCreditStore((s) => s.credits);
  const navigate = useNavigate();

  if (!showUpgradeModal) return null;

  const handleUpgrade = () => {
    closeUpgradeModal();
    navigate('/subscription?plan=pro');
  };

  const handleBuyCredits = () => {
    closeUpgradeModal();
    navigate('/subscription');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--color-border)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent-hover p-6 text-white relative">
          <button
            type="button"
            onClick={closeUpgradeModal}
            aria-label="Close"
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Coins className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold">Out of Credits!</h2>
          </div>
          <p className="text-white/80 text-sm">
            You've used all your free credits. Upgrade to keep working without interruption.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Credit status */}
          <div className="bg-danger/10 dark:bg-danger/20 rounded-lg p-4 flex items-center gap-3 border border-danger/20">
            <Coins className="w-8 h-8 text-danger flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-danger dark:text-danger">
                {credits} credits remaining
              </p>
              <p className="text-sm text-danger/80 dark:text-danger/80">
                This action costs more credits than you have
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Upgrade plan */}
            <button
              type="button"
              onClick={handleUpgrade}
              className="w-full flex items-center justify-between p-4 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors shadow-lg shadow-accent/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Upgrade to Pro</p>
                  <p className="text-xs text-white/80">Unlimited credits · $8/month</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Buy credits */}
            <button
              type="button"
              onClick={handleBuyCredits}
              className="w-full flex items-center justify-between p-4 border-2 border-[var(--color-border)] hover:border-accent/50 dark:hover:border-accent/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <Coins className="w-5 h-5 text-warning" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--color-text-primary)]">Buy Credits</p>
                  <p className="text-xs text-[var(--color-text-muted)]">50 credits starting at $5</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)]" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-primary)] transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
