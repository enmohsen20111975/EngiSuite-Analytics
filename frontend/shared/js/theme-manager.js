/**
 * EngiSuite Theme Manager
 * Handles dark mode, custom colors, language, units, and user preferences
 * Settings are applied globally across all pages
 */

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'engisuite_preferences';
        this.defaults = {
            theme: 'light',
            // Custom colors
            customColors: {
                enabled: false,
                primaryColor: '#2a6fdb',
                backgroundColor: '#f8fafc',
                surfaceColor: '#ffffff',
                textColor: '#0f172a',
                textSecondaryColor: '#475569'
            },
            language: 'en',
            unitSystem: 'metric', // metric or imperial
            fontSize: 'medium',
            reducedMotion: false,
            dateFormat: 'DD/MM/YYYY',
            numberFormat: 'en-US'
        };
        this.preferences = this.loadPreferences();
        this.listeners = new Map();

        this.init();
    }

    init() {
        // Apply all saved preferences immediately
        this.applyTheme(this.preferences.theme);
        this.applyCustomColors(this.preferences.customColors);
        this.applyFontSize(this.preferences.fontSize);
        this.applyReducedMotion(this.preferences.reducedMotion);
        this.applyLanguage(this.preferences.language);
        this.applyUnitSystem(this.preferences.unitSystem);

        // Listen for system theme changes
        this.watchSystemTheme();

        // Apply RTL if needed
        this.applyRTL();
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Deep merge with defaults to ensure all properties exist
                return this.deepMerge({ ...this.defaults }, parsed);
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
        }
        return { ...this.defaults };
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                result[key] = this.deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));

            // Also sync to backend if user is logged in
            this.syncToBackend();
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    }

    /**
     * Sync preferences to backend
     */
    async syncToBackend() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch('/api/auth/preferences', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme: this.preferences.theme,
                    custom_colors: this.preferences.customColors,
                    language: this.preferences.language,
                    unit_system: this.preferences.unitSystem,
                    font_size: this.preferences.fontSize,
                    reduced_motion: this.preferences.reducedMotion,
                    date_format: this.preferences.dateFormat,
                    number_format: this.preferences.numberFormat
                })
            });
        } catch (e) {
            console.warn('Failed to sync preferences to backend:', e);
        }
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.preferences.theme;
    }

    /**
     * Set theme (light/dark/system)
     */
    setTheme(theme) {
        this.preferences.theme = theme;

        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(systemDark ? 'dark' : 'light');
        } else {
            this.applyTheme(theme);
        }

        this.savePreferences();
        this.emit('themeChange', { theme });
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Toggle dark class for Tailwind compatibility
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
        }

        // Re-apply custom colors if enabled
        if (this.preferences.customColors?.enabled) {
            this.applyCustomColors(this.preferences.customColors);
        }
    }

    /**
     * Get custom colors
     */
    getCustomColors() {
        return this.preferences.customColors || this.defaults.customColors;
    }

    /**
     * Set custom colors
     */
    setCustomColors(colors) {
        this.preferences.customColors = {
            ...this.preferences.customColors,
            ...colors
        };
        this.applyCustomColors(this.preferences.customColors);
        this.savePreferences();
        this.emit('customColorsChange', { customColors: this.preferences.customColors });
    }

    /**
     * Enable/disable custom colors
     */
    setCustomColorsEnabled(enabled) {
        this.preferences.customColors.enabled = enabled;
        if (enabled) {
            this.applyCustomColors(this.preferences.customColors);
        } else {
            this.resetToDefaultColors();
        }
        this.savePreferences();
        this.emit('customColorsToggle', { enabled });
    }

    /**
     * Apply custom colors to document
     */
    applyCustomColors(colors) {
        if (!colors || !colors.enabled) return;

        const root = document.documentElement;

        // Apply primary/accent color
        if (colors.primaryColor) {
            root.style.setProperty('--primary', colors.primaryColor);
            root.style.setProperty('--primary-hover', this.darkenColor(colors.primaryColor, 10));
            root.style.setProperty('--primary-light', this.lightenColor(colors.primaryColor, 40));

            // Update brand colors for Tailwind compatibility
            root.style.setProperty('--color-brand-blue', colors.primaryColor);
        }

        // Apply background color
        if (colors.backgroundColor) {
            root.style.setProperty('--bg-base', colors.backgroundColor);
            root.style.setProperty('--bg-primary', colors.backgroundColor);
        }

        // Apply surface/card color
        if (colors.surfaceColor) {
            root.style.setProperty('--bg-surface', colors.surfaceColor);
            root.style.setProperty('--bg-secondary', colors.surfaceColor);
            root.style.setProperty('--card-bg', colors.surfaceColor);
        }

        // Apply text colors
        if (colors.textColor) {
            root.style.setProperty('--text-primary', colors.textColor);
        }

        if (colors.textSecondaryColor) {
            root.style.setProperty('--text-secondary', colors.textSecondaryColor);
        }
    }

    /**
     * Reset to default theme colors
     */
    resetToDefaultColors() {
        const root = document.documentElement;

        // Remove custom color overrides
        root.style.removeProperty('--primary');
        root.style.removeProperty('--primary-hover');
        root.style.removeProperty('--primary-light');
        root.style.removeProperty('--bg-base');
        root.style.removeProperty('--bg-primary');
        root.style.removeProperty('--bg-surface');
        root.style.removeProperty('--bg-secondary');
        root.style.removeProperty('--card-bg');
        root.style.removeProperty('--text-primary');
        root.style.removeProperty('--text-secondary');
        root.style.removeProperty('--color-brand-blue');

        // Re-apply theme to get default colors back
        this.applyTheme(this.preferences.theme);
    }

    /**
     * Darken a hex color
     */
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    /**
     * Lighten a hex color
     */
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.preferences.language;
    }

    /**
     * Set language - applies immediately to all pages
     */
    setLanguage(language) {
        this.preferences.language = language;
        this.applyLanguage(language);
        this.savePreferences();
        this.emit('languageChange', { language });
    }

    /**
     * Apply language to document
     */
    applyLanguage(language) {
        // Update document lang attribute
        document.documentElement.setAttribute('lang', language);

        // Apply RTL if needed
        this.applyRTL();

        // If i18n is available, trigger language change
        if (window.i18n) {
            window.i18n.setLanguage(language);
        }
    }

    /**
     * Get unit system
     */
    getUnitSystem() {
        return this.preferences.unitSystem;
    }

    /**
     * Set unit system (metric/imperial)
     */
    setUnitSystem(unitSystem) {
        this.preferences.unitSystem = unitSystem;
        this.applyUnitSystem(unitSystem);
        this.savePreferences();
        this.emit('unitSystemChange', { unitSystem });
    }

    /**
     * Apply unit system
     */
    applyUnitSystem(unitSystem) {
        document.documentElement.setAttribute('data-unit-system', unitSystem);

        // Store in window for easy access by calculators
        window.UNIT_SYSTEM = unitSystem;
    }

    /**
     * Convert value between unit systems
     */
    convertUnit(value, fromUnit, toUnit) {
        // Common conversions
        const conversions = {
            // Length
            'm_to_ft': 3.28084,
            'ft_to_m': 0.3048,
            'mm_to_in': 0.0393701,
            'in_to_mm': 25.4,
            // Weight/Mass
            'kg_to_lb': 2.20462,
            'lb_to_kg': 0.453592,
            // Temperature
            'c_to_f': (c) => (c * 9 / 5) + 32,
            'f_to_c': (f) => (f - 32) * 5 / 9,
            // Pressure
            'bar_to_psi': 14.5038,
            'psi_to_bar': 0.0689476,
            // Volume
            'l_to_gal': 0.264172,
            'gal_to_l': 3.78541,
            // Power
            'kw_to_hp': 1.34102,
            'hp_to_kw': 0.7457
        };

        const key = `${fromUnit}_to_${toUnit}`;
        const conversion = conversions[key];

        if (typeof conversion === 'function') {
            return conversion(value);
        } else if (typeof conversion === 'number') {
            return value * conversion;
        }

        return value; // No conversion found
    }

    /**
     * Format number according to user preferences
     */
    formatNumber(number, decimals = 2) {
        const locale = this.preferences.numberFormat || 'en-US';
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    /**
     * Format date according to user preferences
     */
    formatDate(date) {
        const format = this.preferences.dateFormat || 'DD/MM/YYYY';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    }

    /**
     * Get font size
     */
    getFontSize() {
        return this.preferences.fontSize;
    }

    /**
     * Set font size
     */
    setFontSize(fontSize) {
        this.preferences.fontSize = fontSize;
        this.applyFontSize(fontSize);
        this.savePreferences();
        this.emit('fontSizeChange', { fontSize });
    }

    /**
     * Apply font size to document
     */
    applyFontSize(fontSize) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            'x-large': '20px'
        };

        document.documentElement.style.fontSize = sizes[fontSize] || sizes.medium;
    }

    /**
     * Get reduced motion preference
     */
    getReducedMotion() {
        return this.preferences.reducedMotion;
    }

    /**
     * Set reduced motion
     */
    setReducedMotion(enabled) {
        this.preferences.reducedMotion = enabled;
        this.applyReducedMotion(enabled);
        this.savePreferences();
        this.emit('reducedMotionChange', { enabled });
    }

    /**
     * Apply reduced motion
     */
    applyReducedMotion(enabled) {
        if (enabled) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-base', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        } else {
            document.documentElement.style.removeProperty('--transition-fast');
            document.documentElement.style.removeProperty('--transition-base');
            document.documentElement.style.removeProperty('--transition-slow');
        }
    }

    /**
     * Apply RTL direction based on language
     */
    applyRTL() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const isRTL = rtlLanguages.includes(this.preferences.language);

        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            if (this.preferences.theme === 'system') {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Check if current theme is dark
     */
    isDark() {
        const theme = this.getTheme();
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    }

    /**
     * Get all available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
            { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' }
        ];
    }

    /**
     * Get all preferences
     */
    getAllPreferences() {
        return { ...this.preferences };
    }

    /**
     * Load preferences from backend
     */
    async loadFromBackend() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/auth/preferences', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const backendPrefs = await response.json();
                // Merge backend preferences with local
                this.preferences = this.deepMerge(this.preferences, backendPrefs);

                // Apply all preferences
                this.applyTheme(this.preferences.theme);
                this.applyCustomColors(this.preferences.customColors);
                this.applyFontSize(this.preferences.fontSize);
                this.applyReducedMotion(this.preferences.reducedMotion);
                this.applyLanguage(this.preferences.language);
                this.applyUnitSystem(this.preferences.unitSystem);

                // Save to localStorage
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
            }
        } catch (e) {
            console.warn('Failed to load preferences from backend:', e);
        }
    }

    /**
     * Reset preferences to defaults
     */
    resetPreferences() {
        this.preferences = { ...this.defaults };
        this.savePreferences();

        this.applyTheme(this.preferences.theme);
        this.resetToDefaultColors();
        this.applyFontSize(this.preferences.fontSize);
        this.applyReducedMotion(this.preferences.reducedMotion);
        this.applyLanguage(this.preferences.language);
        this.applyUnitSystem(this.preferences.unitSystem);

        this.emit('preferencesReset', this.preferences);
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in theme listener for ${event}:`, e);
                }
            });
        }
    }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, themeManager };
}

// Make globally available
window.themeManager = themeManager;

// Function to setup theme toggle buttons (can be called after dynamic content loads)
function setupThemeToggleButtons() {
    const themeToggles = document.querySelectorAll('[data-theme-toggle]');
    themeToggles.forEach(toggle => {
        // Remove existing listener to avoid duplicates
        toggle.removeEventListener('click', handleThemeToggle);
        toggle.addEventListener('click', handleThemeToggle);
    });
    
    // Update initial icon state
    updateThemeToggleIcons();
}

function handleThemeToggle() {
    themeManager.toggleDarkMode();
}

function updateThemeToggleIcons() {
    const theme = themeManager.getTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

// Initialize theme toggle buttons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Setup theme toggle buttons
    setupThemeToggleButtons();

    // Update toggle button states when theme changes
    themeManager.on('themeChange', ({ theme }) => {
        updateThemeToggleIcons();
    });

    // Load preferences from backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        themeManager.loadFromBackend();
    }
    
    // Watch for dynamically added elements (like header component)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Check if any added nodes contain theme toggle buttons
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.querySelector && node.querySelector('[data-theme-toggle]')) {
                            setupThemeToggleButtons();
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Export setup function for manual calls after component loads
window.setupThemeToggleButtons = setupThemeToggleButtons;
