import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available accent colors
export const ACCENT_COLORS = [
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
];

/**
 * Theme store with Zustand
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light', 'dark', 'system'
      resolvedTheme: 'light',
      accentColor: '#0891b2', // Default cyan accent
      
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
       * Set accent color
       */
      setAccentColor: (color) => {
        set({ accentColor: color });
        get().applyAccentColor();
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
       * Apply accent color to document
       */
      applyAccentColor: () => {
        const { accentColor } = get();
        const root = document.documentElement;
        
        // Set CSS custom property for accent color
        root.style.setProperty('--color-accent', accentColor);
        
        // Also set RGB values for variations
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        root.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`);
        root.style.setProperty('--color-accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
        root.style.setProperty('--color-accent-dark', `rgba(${r}, ${g}, ${b}, 0.8)`);
      },
      
      /**
       * Initialize theme listener
       */
      init: () => {
        // Apply initial theme
        get().applyTheme();
        get().applyAccentColor();
        
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
      partialize: (state) => ({ 
        theme: state.theme,
        accentColor: state.accentColor 
      }),
    }
  )
);

export default useThemeStore;
