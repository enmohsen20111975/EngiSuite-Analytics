// Utility functions for DOM manipulation and common tasks
const utils = {
    // Load HTML component from file
    async loadComponent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${url}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading component:', error);
            return '';
        }
    },

    // Render component into DOM element
    async renderComponent(elementId, componentUrl) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with id "${elementId}" not found`);
            return;
        }
        const componentHtml = await this.loadComponent(componentUrl);
        element.innerHTML = componentHtml;
    },

    // Initialize mobile sidebar toggle
    initMobileSidebar() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const closeSidebarBtn = document.getElementById('close-sidebar-btn');

        function openSidebar() {
            if (sidebar && sidebarOverlay) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('flex', 'mobile-drawer-open');
                sidebarOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                document.body.classList.add('drawer-open');

                // Update menu button icon
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        }

        function closeSidebar() {
            if (sidebar && sidebarOverlay) {
                sidebar.classList.remove('mobile-drawer-open');
                sidebar.style.transform = 'translateX(-100%)';
                sidebarOverlay.classList.add('hidden');
                document.body.style.overflow = '';
                document.body.classList.remove('drawer-open');

                // Update menu button icon
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }

                setTimeout(() => {
                    if (window.innerWidth < 768) {
                        sidebar.classList.add('hidden');
                        sidebar.classList.remove('flex');
                    }
                    sidebar.style.transform = '';
                }, 300);
            }
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                if (document.body.classList.contains('drawer-open')) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', closeSidebar);
        }

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
                closeSidebar();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                if (sidebar) {
                    sidebar.classList.remove('hidden');
                    sidebar.classList.add('flex');
                }
                if (sidebarOverlay) {
                    sidebarOverlay.classList.add('hidden');
                }
                document.body.style.overflow = '';
            } else if (!document.body.classList.contains('drawer-open')) {
                if (sidebar) {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('flex');
                }
            }
        });

        // Initialize swipe gestures for mobile
        this.initSwipeGestures(openSidebar, closeSidebar);
    },

    // Initialize swipe gestures
    initSwipeGestures(openCallback, closeCallback) {
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 80;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;

            if (window.innerWidth >= 768) return;

            const swipeDistance = touchEndX - touchStartX;

            // Swipe right to open (from left edge)
            if (touchStartX < 30 && swipeDistance > swipeThreshold && !document.body.classList.contains('drawer-open')) {
                openCallback();
            }

            // Swipe left to close
            if (swipeDistance < -swipeThreshold && document.body.classList.contains('drawer-open')) {
                closeCallback();
            }
        }, { passive: true });
    },

    // Initialize touch feedback
    initTouchFeedback() {
        const interactiveElements = document.querySelectorAll('button, a, .nav-item, .card-clickable, .btn');

        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.classList.remove('touch-active');
            }, { passive: true });
        });
    },

    // Load user data and update UI
    async loadUserData() {
        try {
            const user = await authService.getCurrentUser();

            // Update user profile
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                const userNameElement = userProfile.querySelector('[data-i18n="user.placeholderName"]');
                const userRoleElement = userProfile.querySelector('[data-i18n="user.placeholderRole"]');
                const userAvatar = userProfile.querySelector('.user-avatar');

                if (userNameElement) {
                    userNameElement.textContent = user.name || user.email.split('@')[0];
                    userNameElement.removeAttribute('data-i18n');
                }

                if (userRoleElement) {
                    userRoleElement.textContent = user.email;
                    userRoleElement.removeAttribute('data-i18n');
                }

                if (userAvatar) {
                    userAvatar.textContent = (user.name || user.email.split('@')[0]).charAt(0).toUpperCase();
                }
            }

            // Update credits
            this.updateCreditsDisplay(user);

            return user;
        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = 'login.html';
            return null;
        }
    },

    // Update credits display
    updateCreditsDisplay(user) {
        const creditsLabel = i18n.getTranslation('common.credits') || 'Credits';
        const creditsDisplay = document.querySelector('.credits-display');
        if (creditsDisplay) {
            creditsDisplay.innerHTML = `<i class="fas fa-coins text-yellow-500"></i> <span class="font-bold ml-1">${user.credits_remaining}</span> <span class="text-xs ml-1 opacity-75">${creditsLabel}</span>`;
        }
    },

    // Initialize language selector
    initLanguageSelector() {
        const langSelect = document.getElementById('language-select');
        if (langSelect && i18n) {
            langSelect.value = i18n.currentLang || 'en';
            langSelect.addEventListener('change', (event) => {
                i18n.setLanguage(event.target.value);
            });
        }
    },

    // Theme Management
    themes: {
        'default': {
            '--color-brand-blue': '#2a5298',
            '--color-brand-dark': '#1e3c72',
            '--color-brand-accent': '#3498db',
            '--color-brand-text': '#2c3e50',
            '--color-brand-light': '#f5f7fa',
            '--color-bg-sidebar': '#ffffff',
            '--color-text-sidebar': '#475569'
        },
        'ocean': {
            '--color-brand-blue': '#0891b2',
            '--color-brand-dark': '#155e75',
            '--color-brand-accent': '#06b6d4',
            '--color-brand-text': '#164e63',
            '--color-brand-light': '#ecfeff',
            '--color-bg-sidebar': '#f0f9ff',
            '--color-text-sidebar': '#0e7490'
        },
        'midnight': {
            '--color-brand-blue': '#6366f1',
            '--color-brand-dark': '#4338ca',
            '--color-brand-accent': '#818cf8',
            '--color-brand-text': '#1e293b',
            '--color-brand-light': '#f1f5f9',
            '--color-bg-sidebar': '#ffffff',
            '--color-text-sidebar': '#334155'
        },
        'forest': {
            '--color-brand-blue': '#059669',
            '--color-brand-dark': '#065f46',
            '--color-brand-accent': '#10b981',
            '--color-brand-text': '#064e3b',
            '--color-brand-light': '#ecfdf5',
            '--color-bg-sidebar': '#f0fdf4',
            '--color-text-sidebar': '#065f46'
        }
    },

    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes['default'];
        const root = document.documentElement;

        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        localStorage.setItem('theme', themeName);

        // Update select if exists
        const themeSelect = document.getElementById('theme');
        if (themeSelect) themeSelect.value = themeName;
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        this.applyTheme(savedTheme);

        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.value = savedTheme;
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    },

    // Initialize common page functionality
    async initCommonPage() {
        // Theme is now handled by theme-manager.js globally
        // Previously initialized theme handling removed to avoid conflicts

        // Initialize language selector
        this.initLanguageSelector();

        // Initialize mobile sidebar
        this.initMobileSidebar();

        // Initialize touch feedback
        this.initTouchFeedback();

        // Load user data
        const user = await this.loadUserData();

        return user;
    }
};
