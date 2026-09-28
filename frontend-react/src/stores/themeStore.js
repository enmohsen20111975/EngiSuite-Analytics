import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available accent colors
// NOTE: Project rules forbid Blue / Indigo / Purple accents. The list below
// intentionally excludes those (only Cyan / Emerald / Amber / Rose / Teal).
export const ACCENT_COLORS = [
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
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
       * Apply accent color to document.
       * Sets --color-accent (hsl), --color-accent-hover (slightly darker),
       * and --color-accent-glow (same hue, 40% alpha) so the Tailwind
       * `accent` / `accent-hover` / `accent-glow` tokens track the chosen
       * color. Also keeps the older --color-accent-rgb / -light / -dark
       * variants for backward compatibility.
       */
      applyAccentColor: () => {
        const { accentColor } = get();
        const root = document.documentElement;

        // Parse hex → RGB
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // RGB → HSL (standard algorithm)
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        const l = (max + min) / 2;
        let h = 0;
        let s = 0;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === rNorm) {
            h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          } else if (max === gNorm) {
            h = (bNorm - rNorm) / d + 2;
          } else {
            h = (rNorm - gNorm) / d + 4;
          }
          h /= 6;
        }
        const H = Math.round(h * 360);
        const S = Math.round(s * 100);
        const L = Math.round(l * 100);

        // Primary accent + hover/glow (the audit's main complaint: hover/glow
        // silently stayed cyan when the user picked another accent).
        root.style.setProperty('--color-accent', `hsl(${H}, ${S}%, ${L}%)`);
        root.style.setProperty('--color-accent-hover', `hsl(${H}, ${S}%, ${Math.max(L - 5, 20)}%)`);
        root.style.setProperty('--color-accent-glow', `hsla(${H}, ${S}%, ${L}%, 0.4)`);

        // Backward-compatible variants consumed by legacy code paths.
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
