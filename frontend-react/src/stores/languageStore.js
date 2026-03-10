import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Translation files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';
import frTranslations from '../locales/fr.json';

const translations = {
  en: enTranslations,
  ar: arTranslations,
  fr: frTranslations,
};

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Get translation for a key from translations object
 */
function getTranslation(lang, key, params = {}) {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations['en'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object') {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters in translation string
  return Object.entries(params).reduce(
    (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, paramValue),
    value
  );
}

/**
 * Language store with Zustand
 */
export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'en', // 'en', 'ar', 'fr'
      direction: 'ltr', // 'ltr' or 'rtl'
      timezone: 'UTC',
      
      /**
       * Set language and update direction
       */
      setLanguage: (language) => {
        const direction = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
        set({ language, direction });
        // Apply immediately
        const root = document.documentElement;
        root.setAttribute('lang', language);
        root.setAttribute('dir', direction);
        if (direction === 'rtl') {
          root.classList.add('rtl');
        } else {
          root.classList.remove('rtl');
        }
      },
      
      /**
       * Set timezone
       */
      setTimezone: (timezone) => {
        set({ timezone });
      },
      
      /**
       * Get translation for a key - this function is reactive
       * because it reads from current state
       */
      t: (key, params = {}) => {
        const { language } = get();
        return getTranslation(language, key, params);
      },
      
      /**
       * Apply language settings to document
       */
      applyLanguage: () => {
        const { language, direction } = get();
        const root = document.documentElement;
        
        root.setAttribute('lang', language);
        root.setAttribute('dir', direction);
        
        // Add RTL class for styling
        if (direction === 'rtl') {
          root.classList.add('rtl');
        } else {
          root.classList.remove('rtl');
        }
      },
      
      /**
       * Initialize language settings
       */
      init: () => {
        get().applyLanguage();
      },
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ 
        language: state.language, 
        direction: state.direction,
        timezone: state.timezone 
      }),
    }
  )
);

// Export a hook that provides reactive translations
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const direction = useLanguageStore((state) => state.direction);
  const timezone = useLanguageStore((state) => state.timezone);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const setTimezone = useLanguageStore((state) => state.setTimezone);
  const t = useLanguageStore((state) => state.t);
  
  return {
    t,
    language,
    setLanguage,
    direction,
    timezone,
    setTimezone,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr',
  };
}

export default useLanguageStore;
