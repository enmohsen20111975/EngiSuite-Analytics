import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store with Zustand
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light', 'dark', 'system'
      resolvedTheme: 'light',
      
      /**
       * Set theme preference
       */
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },
      
      /**
       * Toggle between light and dark
       */
      toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        get().applyTheme();
      },
      
      /**
       * Apply theme to document
       */
      applyTheme: () => {
        const { theme } = get();
        let resolved = theme;
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        
        set({ resolvedTheme: resolved });
        
        // Apply to document
        const root = document.documentElement;
        if (resolved === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      /**
       * Initialize theme listener
       */
      init: () => {
        // Apply initial theme
        get().applyTheme();
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
          if (get().theme === 'system') {
            get().applyTheme();
          }
        };
        
        mediaQuery.addEventListener('change', handler);
        
        return () => mediaQuery.removeEventListener('change', handler);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
