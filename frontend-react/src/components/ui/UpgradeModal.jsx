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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white relative">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Coins className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Out of Credits!</h2>
          </div>
          <p className="text-blue-100 text-sm">
            You've used all your free credits. Upgrade to keep working without interruption.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Credit status */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-center gap-3">
            <Coins className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                {credits} credits remaining
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                This action costs more credits than you have
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Upgrade plan */}
            <button
              onClick={handleUpgrade}
              className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Upgrade to Pro</p>
                  <p className="text-xs text-blue-200">Unlimited credits · $8/month</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Buy credits */}
            <button
              onClick={handleBuyCredits}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Buy Credits</p>
                  <p className="text-xs text-gray-500">50 credits starting at $5</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <button
            onClick={closeUpgradeModal}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
