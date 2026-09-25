import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Credits deducted per service action */
export const CREDIT_COSTS = {
  calculator:     2,   // Run a calculation
  pipeline:       3,   // Run a pipeline
  simulation:     5,   // Use any simulator
  report:         5,   // Generate a report
  ai_assistant:  10,   // AI assistant query
  diagram_save:   1,   // Save diagram/canvas
  export:         3,   // Export to PDF/Excel
};

const FREE_PLAN_CREDITS = 100;

/**
 * Credit store — persisted in localStorage.
 * Free plan users start with 100 credits.
 * Paid plan users have unlimited credits (isPaid = true).
 */
export const useCreditStore = create(
  persist(
    (set, get) => ({
      credits: FREE_PLAN_CREDITS,
      isPaid: false,
      showUpgradeModal: false,
      lastAction: null,

      /** Call on login / plan change to sync paid status */
      setPaidStatus: (isPaid) => set({ isPaid }),

      /** Initialize credits for a new free user */
      initFreeCredits: () => {
        const { credits } = get();
        // Only reset if never set before (credits still at default)
        if (credits === FREE_PLAN_CREDITS) return;
        set({ credits: FREE_PLAN_CREDITS });
      },

      /**
       * Attempt to spend credits for a service action.
       * Returns true if successful, false if insufficient credits.
       */
      spend: (action) => {
        const { credits, isPaid } = get();
        if (isPaid) return true; // Paid users: unlimited

        const cost = CREDIT_COSTS[action] ?? 1;
        if (credits < cost) {
          set({ showUpgradeModal: true, lastAction: action });
          return false;
        }
        set({ credits: credits - cost, lastAction: action });
        return true;
      },

      /** Add credits (after purchase) */
      addCredits: (amount) => {
        set((state) => ({ credits: state.credits + amount }));
      },

      /** Reset credits (e.g. monthly refresh for paid plan) */
      resetCredits: () => set({ credits: FREE_PLAN_CREDITS }),

      closeUpgradeModal: () => set({ showUpgradeModal: false }),
    }),
    {
      name: 'engisuite-credits',
      partialize: (state) => ({
        credits: state.credits,
        isPaid: state.isPaid,
      }),
    }
  )
);
