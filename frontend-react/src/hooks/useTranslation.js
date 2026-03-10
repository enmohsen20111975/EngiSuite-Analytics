import { useLanguageStore } from '../stores/languageStore';

/**
 * Custom hook for using translations
 * @returns {Object} Translation functions and language state
 */
export function useTranslation() {
  const { t, language, setLanguage, direction, timezone, setTimezone } = useLanguageStore();
  
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

export default useTranslation;
