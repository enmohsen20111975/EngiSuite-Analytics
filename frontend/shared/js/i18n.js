/**
 * EngiSuite Internationalization (i18n) Module
 * Handles multi-language support with integration to Theme Manager
 */

const i18n = {
    translations: {},
    currentLang: 'en', // Default language
    supportedLangs: ['en', 'ar', 'fr'],
    rtlLangs: ['ar', 'he', 'fa', 'ur'],

    async loadTranslations(lang) {
        try {
            const response = await fetch(`./shared/js/i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            this.translations = await response.json();
            this.currentLang = lang;

            // Save to localStorage
            localStorage.setItem('lang', lang);

            // Apply translations
            this.applyTranslations();

            console.log(`Loaded translations for: ${lang}`);
        } catch (error) {
            console.error("Error loading translations:", error);
            // Fallback to English if loading fails
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    },

    applyTranslations() {
        // Text content translations
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });

        // HTML content translations
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            if (this.translations[key]) {
                element.innerHTML = this.translations[key];
            }
        });

        // Placeholder translations
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (this.translations[key]) {
                element.setAttribute('placeholder', this.translations[key]);
            }
        });

        // Title attribute translations
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (this.translations[key]) {
                element.setAttribute('title', this.translations[key]);
            }
        });

        // ARIA label translations
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            if (this.translations[key]) {
                element.setAttribute('aria-label', this.translations[key]);
            }
        });

        // Value attribute translations
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            if (this.translations[key]) {
                element.setAttribute('value', this.translations[key]);
            }
        });

        // Meta tag translations
        document.querySelectorAll('meta[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.setAttribute('content', this.translations[key]);
            }
        });

        // Update document language and direction
        this.updateDocumentLangDir();

        // Update all language selectors
        this.updateLanguageSelectors();

        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('i18n:changed', {
            detail: { lang: this.currentLang }
        }));
    },

    /**
     * Get translation by key with optional fallback
     */
    getTranslation(key, fallback = null) {
        return this.translations[key] || fallback || key;
    },

    /**
     * Check if translation exists
     */
    hasTranslation(key) {
        return !!this.translations[key];
    },

    /**
     * Set language - integrates with theme manager
     */
    setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Language ${lang} is not supported. Supported languages: ${this.supportedLangs.join(', ')}`);
            return;
        }

        // Update theme manager if available
        if (window.themeManager) {
            window.themeManager.setLanguage(lang);
        }

        // Load and apply translations
        this.loadTranslations(lang);
    },

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLang;
    },

    /**
     * Check if current language is RTL
     */
    isRTL() {
        return this.rtlLangs.includes(this.currentLang);
    },

    /**
     * Update document language and direction
     */
    updateDocumentLangDir() {
        const isRtl = this.isRTL();
        document.documentElement.setAttribute('lang', this.currentLang);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

        // Add RTL class to body for CSS styling
        if (isRtl) {
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
    },

    /**
     * Update all language selector dropdowns
     */
    updateLanguageSelectors() {
        const selectors = document.querySelectorAll('[data-i18n-lang], #language-select, #language-select-settings');
        selectors.forEach(select => {
            if (select.value !== this.currentLang) {
                select.value = this.currentLang;
            }
        });
    },

    /**
     * Format number according to current locale
     */
    formatNumber(number, options = {}) {
        const locale = this.getLocale();
        return new Intl.NumberFormat(locale, options).format(number);
    },

    /**
     * Format currency according to current locale
     */
    formatCurrency(amount, currency = 'EGP') {
        const locale = this.getLocale();
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format date according to current locale
     */
    formatDate(date, options = {}) {
        const locale = this.getLocale();
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, options).format(d);
    },

    /**
     * Get locale string for current language
     */
    getLocale() {
        const locales = {
            'en': 'en-US',
            'ar': 'ar-EG',
            'fr': 'fr-FR'
        };
        return locales[this.currentLang] || 'en-US';
    },

    /**
     * Initialize i18n - loads saved or browser language
     */
    async init() {
        // Priority: 1. Theme Manager, 2. localStorage, 3. Browser language, 4. Default
        let initialLang;

        if (window.themeManager) {
            initialLang = themeManager.getLanguage();
        } else {
            initialLang = localStorage.getItem('lang');
        }

        if (!initialLang) {
            const browserLang = navigator.language.split('-')[0];
            initialLang = this.supportedLangs.includes(browserLang) ? browserLang : 'en';
        }

        await this.loadTranslations(initialLang);

        // Listen for language selector changes
        this.setupLanguageSelectors();
    },

    /**
     * Setup event listeners for language selectors
     */
    setupLanguageSelectors() {
        const selectors = document.querySelectorAll('[data-i18n-lang], #language-select');
        selectors.forEach(select => {
            select.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// Listen for theme manager language changes
document.addEventListener('DOMContentLoaded', () => {
    if (window.themeManager) {
        themeManager.on('languageChange', ({ language }) => {
            if (language !== i18n.currentLang) {
                i18n.loadTranslations(language);
            }
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

// Make globally available
window.i18n = i18n;
