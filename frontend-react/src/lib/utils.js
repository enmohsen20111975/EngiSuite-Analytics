import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * @param  {...any} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with locale-specific formatting
 * @param {number} value - Number to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Formatted number
 */
export function formatNumber(value, locale = 'en-US') {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a date with locale-specific formatting
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export function formatDate(date, options = {}) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Storage helper with JSON serialization
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Read a CSS custom property from :root, returning a fallback when the
 * variable is not set (e.g. during SSR or before the theme boots).
 *
 * Canvas 2D and SVG elements cannot consume Tailwind classes directly, so
 * callers use this helper to wire theme tokens into `stroke`/`fill` props.
 *
 * Because this reads `getComputedStyle(document.documentElement)` on every
 * call, it naturally picks up the current theme (and accent color) on the
 * next render after the `.dark` class toggles — no subscription required.
 *
 * @param {string} varName - CSS variable name, e.g. '--color-accent'
 * @param {string} fallback - Hex fallback used if the variable is empty
 * @returns {string} Resolved color value (or fallback)
 */
export function getThemeColor(varName, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const root = getComputedStyle(document.documentElement);
    const value = root.getPropertyValue(varName).trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Convenience accessors for the standard theme palette. Each function reads
 * the live CSS variable so colours update on theme/accent change.
 */
export const themeColors = {
  accent: (fallback = '#0891b2') => getThemeColor('--color-accent', fallback),
  accentHover: (fallback = '#0e7490') => getThemeColor('--color-accent-hover', fallback),
  accentGlow: (fallback = '#22d3ee') => getThemeColor('--color-accent-glow', fallback),
  success: (fallback = '#10b981') => getThemeColor('--color-success', fallback),
  warning: (fallback = '#f59e0b') => getThemeColor('--color-warning', fallback),
  danger: (fallback = '#ef4444') => getThemeColor('--color-danger', fallback),
  info: (fallback = '#0ea5e9') => getThemeColor('--color-info', fallback),
  bgPrimary: (fallback = '#ffffff') => getThemeColor('--color-bg-primary', fallback),
  bgSecondary: (fallback = '#f1f5f9') => getThemeColor('--color-bg-secondary', fallback),
  bgTertiary: (fallback = '#e2e8f0') => getThemeColor('--color-bg-tertiary', fallback),
  textPrimary: (fallback = '#0f172a') => getThemeColor('--color-text-primary', fallback),
  textSecondary: (fallback = '#475569') => getThemeColor('--color-text-secondary', fallback),
  textMuted: (fallback = '#6b7280') => getThemeColor('--color-text-muted', fallback),
  border: (fallback = '#e5e7eb') => getThemeColor('--color-border', fallback),
  borderHover: (fallback = '#cbd5e1') => getThemeColor('--color-border-hover', fallback),
};
