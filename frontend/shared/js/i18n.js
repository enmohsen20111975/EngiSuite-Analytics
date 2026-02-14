/**
 * EngiSuite Internationalization (i18n) Module
 * Handles multi-language support with integration to Theme Manager
 */

const i18n = {
    translations: {},
    currentLang: 'en', // Default language
    supportedLangs: ['en', 'ar', 'fr'],
    rtlLangs: ['ar', 'he', 'fa', 'ur'],
    _isInternalChange: false, // Flag to prevent circular updates

    async loadTranslations(lang) {
        try {
            const response = await fetch(`./shared/js/i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            this.translations = await response.json();
            this.currentLang = lang;

            // Save to localStorage - use both keys for compatibility
            localStorage.setItem('lang', lang);
            
            // Also update themeManager preferences if available
            if (window.themeManager && window.themeManager.preferences) {
                window.themeManager.preferences.language = lang;
                window.themeManager.savePreferences();
            } else {
                // Update engisuite_preferences directly if themeManager not loaded yet
                try {
                    const prefs = JSON.parse(localStorage.getItem('engisuite_preferences') || '{}');
                    prefs.language = lang;
                    localStorage.setItem('engisuite_preferences', JSON.stringify(prefs));
                } catch (e) {
                    console.warn('Failed to update engisuite_preferences:', e);
                }
            }

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
     * @param {string} lang - Language code to set
     * @param {boolean} skipThemeManagerUpdate - If true, don't update themeManager (prevents circular updates)
     * @returns {Promise<boolean>} - Returns true if language was changed successfully
     */
    async setLanguage(lang, skipThemeManagerUpdate = false) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Language ${lang} is not supported. Supported languages: ${this.supportedLangs.join(', ')}`);
            return false;
        }

        // Prevent circular updates
        if (this._isInternalChange) {
            return false;
        }

        // Update theme manager if available and not skipped
        if (!skipThemeManagerUpdate && window.themeManager) {
            this._isInternalChange = true;
            try {
                window.themeManager.setLanguage(lang);
            } finally {
                this._isInternalChange = false;
            }
        }

        // Load and apply translations (await for proper async handling)
        await this.loadTranslations(lang);
        return true;
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
        const selectors = document.querySelectorAll('[data-i18n-lang], #language-select, #mobile-language-select, #language-select-settings');
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
        // Priority: 1. Theme Manager, 2. localStorage (both keys), 3. Browser language, 4. Default
        let initialLang;

        // First check themeManager (it has the most up-to-date preference)
        if (window.themeManager) {
            initialLang = window.themeManager.getLanguage();
        }
        
        // Fallback to localStorage - check both keys for compatibility
        if (!initialLang) {
            // Check themeManager's storage key first (more reliable)
            try {
                const prefs = JSON.parse(localStorage.getItem('engisuite_preferences'));
                if (prefs && prefs.language) {
                    initialLang = prefs.language;
                }
            } catch (e) {}
            
            // Then check the simple 'lang' key
            if (!initialLang) {
                initialLang = localStorage.getItem('lang');
            }
        }

        if (!initialLang) {
            const browserLang = navigator.language.split('-')[0];
            initialLang = this.supportedLangs.includes(browserLang) ? browserLang : 'en';
        }

        // Ensure the language is valid
        if (!this.supportedLangs.includes(initialLang)) {
            initialLang = 'en';
        }

        await this.loadTranslations(initialLang);

        // Listen for language selector changes
        this.setupLanguageSelectors();
        
        // Setup themeManager listener immediately if available
        this.setupThemeManagerListener();
    },

    /**
     * Setup listener for themeManager language changes
     */
    setupThemeManagerListener() {
        if (window.themeManager) {
            window.themeManager.on('languageChange', ({ language }) => {
                if (language !== this.currentLang && !this._isInternalChange) {
                    // Load translations without triggering themeManager update
                    this.loadTranslations(language);
                }
            });
        }
    },

    /**
     * Setup event listeners for language selectors
     * Includes all selectors: header, mobile, and settings page
     */
    setupLanguageSelectors() {
        // Include all language selectors
        const selectors = document.querySelectorAll('[data-i18n-lang], #language-select, #mobile-language-select, #language-select-settings');
        
        selectors.forEach(select => {
            // Remove any existing listener to prevent duplicates
            select.removeEventListener('change', this._handleLanguageChange);
            
            // Add new listener
            select.addEventListener('change', this._handleLanguageChange.bind(this));
            
            // Set initial value
            if (select.value !== this.currentLang) {
                select.value = this.currentLang;
            }
        });

        // Setup mobile language popup
        this.setupMobileLanguagePopup();
    },

    /**
     * Handle language change from selector
     */
    _handleLanguageChange(e) {
        const newLang = e.target.value;
        if (newLang && this.supportedLangs.includes(newLang)) {
            this.setLanguage(newLang);
        }
    },

    /**
     * Setup mobile language popup
     */
    setupMobileLanguagePopup() {
        const mobileLangBtn = document.getElementById('mobile-lang-btn');
        const mobileLangPopup = document.getElementById('mobile-lang-popup');
        const closeMobileLang = document.getElementById('close-mobile-lang');
        const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');

        if (mobileLangBtn && mobileLangPopup) {
            // Open popup
            mobileLangBtn.addEventListener('click', () => {
                mobileLangPopup.classList.remove('hidden');
                // Highlight current language
                mobileLangOptions.forEach(opt => {
                    opt.classList.toggle('bg-blue-50', opt.dataset.lang === this.currentLang);
                    opt.classList.toggle('dark:bg-blue-900/30', opt.dataset.lang === this.currentLang);
                });
            });

            // Close popup
            closeMobileLang?.addEventListener('click', () => {
                mobileLangPopup.classList.add('hidden');
            });

            // Close on backdrop click
            mobileLangPopup.addEventListener('click', (e) => {
                if (e.target === mobileLangPopup) {
                    mobileLangPopup.classList.add('hidden');
                }
            });

            // Handle language selection
            mobileLangOptions.forEach(opt => {
                opt.addEventListener('click', () => {
                    const lang = opt.dataset.lang;
                    if (lang && this.supportedLangs.includes(lang)) {
                        this.setLanguage(lang);
                        mobileLangPopup.classList.add('hidden');
                    }
                });
            });
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// Listen for theme manager language changes (with circular update prevention)
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for themeManager to be fully initialized
    setTimeout(() => {
        if (window.themeManager) {
            window.themeManager.on('languageChange', ({ language }) => {
                if (language !== i18n.currentLang && !i18n._isInternalChange) {
                    // Load translations without triggering themeManager update
                    i18n.loadTranslations(language);
                }
            });
        }
    }, 100);
});

// Re-setup selectors when new content is loaded (for SPA navigation)
document.addEventListener('pageReady', () => {
    i18n.setupLanguageSelectors();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

// Make globally available
window.i18n = i18n;
