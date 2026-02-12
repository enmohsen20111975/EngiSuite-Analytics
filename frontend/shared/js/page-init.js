/**
 * Page Initialization Module
 * This script should be included in all protected pages
 * It handles authentication check, user state, and subscription reminders
 */

(function () {
    'use strict';

    // Pages that don't require authentication
    const PUBLIC_PAGES = [
        'login.html',
        'register.html',
        'index.html',
        'test-login.html',
        'test-i18n.html'
    ];

    /**
     * Initialize page with authentication check
     */
    async function initPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isPublicPage = PUBLIC_PAGES.includes(currentPage);

        // Load stored user data for quick UI update
        const storedUser = getStoredUser();
        if (storedUser) {
            updateUserUI(storedUser);
        }

        // Check authentication with backend
        try {
            const response = await fetchWithAuth('/auth/me');

            if (response.ok) {
                const user = await response.json();
                storeUser(user);
                updateUserUI(user);

                // Dispatch userUpdated event for components that need to react to user data
                window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));

                // Setup credit tracking
                setupCreditTracking(user);

                // Show subscription reminder if needed
                checkSubscriptionReminder(user);

            } else if (!isPublicPage) {
                // Not authenticated, redirect to login
                redirectToLogin();
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);

            // If no stored user and not public page, redirect
            if (!storedUser && !isPublicPage) {
                redirectToLogin();
                return;
            }
        }

        // Dispatch event when page is ready
        window.dispatchEvent(new CustomEvent('pageReady', { detail: { user: storedUser } }));
    }

    /**
     * Get stored user data
     */
    function getStoredUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Store user data
     */
    function storeUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lastAuthCheck', Date.now().toString());
    }

    /**
     * Fetch with authentication
     */
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers,
            credentials: 'include'
        });
    }

    /**
     * Update all user-related UI elements
     */
    function updateUserUI(user) {
        if (!user) return;

        // Update user name displays
        document.querySelectorAll('.user-name, [data-user-name]').forEach(el => {
            el.textContent = user.name || user.given_name || 'User';
        });

        // Update user avatar
        document.querySelectorAll('.user-avatar').forEach(el => {
            if (user.picture) {
                el.innerHTML = `<img src="${user.picture}" alt="${user.name}" class="w-full h-full rounded-full object-cover">`;
            } else {
                const initials = getInitials(user.name || user.given_name || 'U');
                el.textContent = initials;
            }
        });

        // Update credits display
        updateCreditsDisplay(user.credits_remaining);

        // Update tier display
        document.querySelectorAll('.user-tier, [data-user-tier]').forEach(el => {
            el.textContent = (user.tier || 'free').charAt(0).toUpperCase() + (user.tier || 'free').slice(1);
        });

        // Add tier class to body
        document.body.classList.remove('tier-free', 'tier-basic', 'tier-pro', 'tier-enterprise');
        document.body.classList.add(`tier-${user.tier || 'free'}`);
    }

    /**
     * Get initials from name
     */
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Update credits display
     */
    function updateCreditsDisplay(credits) {
        credits = credits ?? 0;

        document.querySelectorAll('.credits-display').forEach(el => {
            const textSpan = el.querySelector('span');
            if (textSpan) {
                textSpan.textContent = `${credits} credits`;
            }

            // Update styling based on credit level
            el.classList.remove('credits-warning', 'credits-critical', 'credits-exhausted');
            el.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400');
            el.classList.remove('bg-orange-50', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400');
            el.classList.remove('bg-red-50', 'dark:bg-red-900/30', 'text-red-600', 'dark:text-red-400');

            if (credits <= 0) {
                el.classList.add('credits-exhausted', 'bg-red-50', 'dark:bg-red-900/30', 'text-red-600', 'dark:text-red-400');
            } else if (credits <= 5) {
                el.classList.add('credits-critical', 'bg-orange-50', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400');
            } else if (credits <= 20) {
                el.classList.add('credits-warning', 'bg-yellow-50', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400');
            }
        });
    }

    /**
     * Setup credit tracking for calculations
     */
    function setupCreditTracking(user) {
        // Listen for calculation events
        window.addEventListener('calculationComplete', (event) => {
            trackActivity('calculation', event.detail);
        });

        // Listen for workflow events
        window.addEventListener('workflowComplete', (event) => {
            trackActivity('workflow', event.detail);
        });
    }

    /**
     * Track user activity
     */
    window.trackActivity = async function (type, data = {}) {
        const user = getStoredUser();
        if (!user) return;

        const creditsUsed = data.creditsUsed || 1;

        // Check if user has enough credits
        if ((user.credits_remaining || 0) < creditsUsed) {
            showSubscriptionModal('exhausted');
            return false;
        }

        // Update local credits immediately
        user.credits_remaining = Math.max(0, (user.credits_remaining || 0) - creditsUsed);
        storeUser(user);
        updateCreditsDisplay(user.credits_remaining);

        // Show warning if low on credits
        if (user.credits_remaining <= 5) {
            showLowCreditsWarning(user.credits_remaining);
        }

        // Sync with backend
        try {
            await fetchWithAuth('/auth/track-activity', {
                method: 'POST',
                body: JSON.stringify({
                    activities: [{
                        type,
                        data,
                        timestamp: Date.now(),
                        creditsUsed
                    }]
                })
            });
        } catch (error) {
            console.error('Activity tracking failed:', error);
        }

        return true;
    };

    /**
     * Check and show subscription reminder
     */
    function checkSubscriptionReminder(user) {
        if (!user) return;

        const tier = user.tier || 'free';
        const credits = user.credits_remaining || 0;

        // Don't show for pro/enterprise users
        if (tier === 'pro' || tier === 'enterprise') return;

        // Check if reminder was shown recently (within 24 hours)
        const lastReminder = localStorage.getItem('lastSubscriptionReminder');
        if (lastReminder && (Date.now() - parseInt(lastReminder)) < 86400000) {
            return;
        }

        // Show reminder based on conditions
        if (credits <= 0) {
            showSubscriptionModal('exhausted');
        } else if (credits <= 20) {
            setTimeout(() => {
                showSubscriptionModal('low-credits');
            }, 3000); // Show after 3 seconds
        } else if (tier === 'free') {
            setTimeout(() => {
                showSubscriptionModal('upgrade');
            }, 10000); // Show after 10 seconds
        }
    }

    /**
     * Show low credits warning (toast)
     */
    function showLowCreditsWarning(credits) {
        const existing = document.getElementById('low-credits-toast');
        if (existing) return;

        const toast = document.createElement('div');
        toast.id = 'low-credits-toast';
        toast.className = 'fixed bottom-4 right-4 z-[90] bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${credits} credits remaining! <a href="settings.html#subscription" class="underline font-semibold">Upgrade now</a></span>
            <button class="ml-2 hover:bg-orange-600 rounded p-1" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 10000);
    }

    /**
     * Show subscription modal
     */
    window.showSubscriptionModal = function (reason = 'upgrade') {
        // Remove existing modal
        const existing = document.getElementById('subscription-modal');
        if (existing) existing.remove();

        const user = getStoredUser();
        const credits = user?.credits_remaining ?? 0;

        let title, message, urgency;

        if (reason === 'exhausted' || credits <= 0) {
            title = 'Credits Exhausted!';
            message = 'You have used all your free credits. Subscribe now to continue using all features!';
            urgency = 'critical';
        } else if (reason === 'low-credits' || credits <= 20) {
            title = 'Running Low on Credits!';
            message = `You only have ${credits} credits remaining. Upgrade now to get unlimited access!`;
            urgency = 'warning';
        } else {
            title = 'Upgrade to Pro';
            message = 'Get unlimited calculations, advanced features, and priority support with our Pro plan!';
            urgency = 'info';
        }

        const modal = document.createElement('div');
        modal.id = 'subscription-modal';
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" id="subscription-modal-backdrop"></div>
            <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                <button id="subscription-modal-close" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i class="fas fa-times text-xl"></i>
                </button>
                
                <div class="text-center mb-6">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full ${urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : urgency === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center">
                        <i class="fas ${urgency === 'critical' ? 'fa-exclamation-circle text-red-500' : urgency === 'warning' ? 'fa-exclamation-triangle text-orange-500' : 'fa-rocket text-blue-500'} text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white">${title}</h3>
                    <p class="text-slate-600 dark:text-slate-400 mt-2">${message}</p>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <i class="fas fa-check-circle text-green-500"></i>
                        <span>Unlimited calculations & workflows</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <i class="fas fa-check-circle text-green-500"></i>
                        <span>Advanced analytics & reports</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <i class="fas fa-check-circle text-green-500"></i>
                        <span>Priority support</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <i class="fas fa-check-circle text-green-500"></i>
                        <span>Export to PDF & Excel</span>
                    </div>
                </div>
                
                <div class="mt-6 space-y-3">
                    <a href="settings.html#subscription" class="block w-full py-3 px-4 bg-gradient-to-r from-brand-blue to-purple-600 text-white text-center font-semibold rounded-xl hover:opacity-90 transition-opacity">
                        View Plans & Subscribe
                    </a>
                    ${urgency !== 'critical' ? `
                    <button id="subscription-modal-remind" class="w-full py-2 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:hover:text-slate-200">
                        Remind me later
                    </button>
                    ` : ''}
                </div>
                
                ${(!user || user.tier === 'free') ? `
                <div class="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <p class="text-center text-sm">
                        <span class="font-semibold text-brand-blue">Special Offer:</span>
                        <span class="text-slate-600 dark:text-slate-400"> Get 20% off annual plans!</span>
                    </p>
                </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        // Handle close
        const closeBtn = modal.querySelector('#subscription-modal-close');
        const backdrop = modal.querySelector('#subscription-modal-backdrop');
        const remindBtn = modal.querySelector('#subscription-modal-remind');

        const closeModal = () => {
            modal.remove();
            localStorage.setItem('lastSubscriptionReminder', Date.now().toString());
        };

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);
        remindBtn?.addEventListener('click', closeModal);
    };

    /**
     * Redirect to login
     */
    function redirectToLogin() {
        const currentPage = window.location.pathname + window.location.search;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }

    /**
     * Logout function
     */
    window.logout = async function () {
        try {
            await fetchWithAuth('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Continue with cleanup
        }

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastAuthCheck');
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=lax';

        window.location.href = 'login.html';
    };

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .credits-warning { animation: pulse 2s infinite; }
        .credits-critical { animation: pulse 1s infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }

    // Export functions for global use
    window.pageInit = {
        getStoredUser,
        updateUserUI,
        updateCreditsDisplay,
        trackActivity,
        showSubscriptionModal,
        logout: window.logout
    };

})();
