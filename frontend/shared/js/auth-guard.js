/**
 * Authentication Guard Module
 * Handles route protection, user state management, and subscription reminders
 */

class AuthGuard {
    constructor() {
        this.baseUrl = '';
        this.user = null;
        this.isAuthenticated = false;
        this.creditsWarningThreshold = 20;
        this.creditsCriticalThreshold = 5;
        this.subscriptionReminderInterval = null;

        // Public pages that don't require authentication
        this.publicPages = [
            'login.html',
            'register.html',
            'index.html',
            'test-login.html',
            'test-i18n.html'
        ];

        // Activity tracking
        this.activityQueue = [];
        this.syncInterval = null;
    }

    /**
     * Initialize the auth guard - call on every page load
     */
    async init() {
        // Check if current page is public
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isPublicPage = this.publicPages.includes(currentPage);

        // Try to get stored user data first for quick UI update
        const storedUser = this.getStoredUser();
        if (storedUser) {
            this.user = storedUser;
            this.isAuthenticated = true;
            this.updateUserUI();
        }

        // Verify authentication with backend
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/auth/me`);

            if (response.ok) {
                const data = await response.json();
                this.user = data;
                this.isAuthenticated = true;
                this.storeUser(data);
                this.updateUserUI();

                // Setup activity tracking and reminders
                this.startActivityTracking();
                this.showSubscriptionReminder();

            } else {
                // Not authenticated
                this.clearUserData();

                // Redirect to login if on protected page
                if (!isPublicPage) {
                    this.redirectToLogin();
                    return false;
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);

            // If we have stored user data, use it (offline resilience)
            if (!storedUser && !isPublicPage) {
                this.redirectToLogin();
                return false;
            }
        }

        return true;
    }

    /**
     * Fetch with authentication token
     */
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
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
     * Get authentication token
     */
    getToken() {
        // Get token from localStorage first
        const localStorageToken = localStorage.getItem('token');
        if (localStorageToken) {
            return localStorageToken;
        }

        // Fallback to cookie
        const name = 'access_token=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    /**
     * Store user data locally
     */
    storeUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lastAuthCheck', Date.now().toString());
    }

    /**
     * Get stored user data
     */
    getStoredUser() {
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
     * Clear all user data
     */
    clearUserData() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastAuthCheck');
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=lax';
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        const currentPage = window.location.pathname + window.location.search;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }

    /**
     * Update all user-related UI elements
     */
    updateUserUI() {
        if (!this.user) return;

        // Update user name displays
        const userNameElements = document.querySelectorAll('.user-name, [data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = this.user.name || this.user.given_name || 'User';
        });

        // Update user avatar
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(el => {
            if (this.user.picture) {
                el.innerHTML = `<img src="${this.user.picture}" alt="${this.user.name}" class="w-full h-full rounded-full object-cover">`;
            } else {
                const initials = this.getInitials(this.user.name || this.user.given_name || 'U');
                el.textContent = initials;
            }
        });

        // Update credits display
        this.updateCreditsDisplay();

        // Update subscription status
        this.updateSubscriptionUI();

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: this.user }));
    }

    /**
     * Get user initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Update credits display in header
     */
    updateCreditsDisplay() {
        const creditsDisplays = document.querySelectorAll('.credits-display');
        const credits = this.user?.credits_remaining ?? 0;

        creditsDisplays.forEach(el => {
            const textSpan = el.querySelector('span');
            if (textSpan) {
                textSpan.textContent = `${credits} credits`;
            }

            // Add warning classes based on credit level
            el.classList.remove('credits-warning', 'credits-critical', 'credits-exhausted');

            if (credits <= 0) {
                el.classList.add('credits-exhausted');
                el.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-brand-blue', 'dark:text-blue-400');
                el.classList.add('bg-red-50', 'dark:bg-red-900/30', 'text-red-600', 'dark:text-red-400');
            } else if (credits <= this.creditsCriticalThreshold) {
                el.classList.add('credits-critical');
                el.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-brand-blue', 'dark:text-blue-400');
                el.classList.add('bg-orange-50', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400');
            } else if (credits <= this.creditsWarningThreshold) {
                el.classList.add('credits-warning');
                el.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-brand-blue', 'dark:text-blue-400');
                el.classList.add('bg-yellow-50', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400');
            }
        });
    }

    /**
     * Update subscription-related UI
     */
    updateSubscriptionUI() {
        const tier = this.user?.tier ?? 'free';
        const tierElements = document.querySelectorAll('.user-tier, [data-user-tier]');

        tierElements.forEach(el => {
            el.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
        });

        // Add tier class to body for styling
        document.body.classList.remove('tier-free', 'tier-basic', 'tier-pro', 'tier-enterprise');
        document.body.classList.add(`tier-${tier}`);
    }

    /**
     * Track user activity (calculations, workflows, etc.)
     */
    trackActivity(type, data = {}) {
        if (!this.isAuthenticated) return;

        const activity = {
            type,
            data,
            timestamp: Date.now(),
            creditsUsed: data.creditsUsed || 1
        };

        this.activityQueue.push(activity);

        // Update local credits immediately
        if (this.user) {
            this.user.credits_remaining = Math.max(0, (this.user.credits_remaining || 0) - activity.creditsUsed);
            this.storeUser(this.user);
            this.updateCreditsDisplay();

            // Check if credits exhausted
            if (this.user.credits_remaining <= 0) {
                this.showCreditsExhaustedModal();
            } else if (this.user.credits_remaining <= this.creditsCriticalThreshold) {
                this.showLowCreditsWarning();
            }
        }

        // Sync with backend
        this.syncActivity();
    }

    /**
     * Start periodic activity sync
     */
    startActivityTracking() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Sync every 30 seconds
        this.syncInterval = setInterval(() => {
            this.syncActivity();
        }, 30000);
    }

    /**
     * Sync activity with backend
     */
    async syncActivity() {
        if (this.activityQueue.length === 0) return;

        const activities = [...this.activityQueue];
        this.activityQueue = [];

        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/auth/track-activity`, {
                method: 'POST',
                body: JSON.stringify({ activities })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    this.user = { ...this.user, ...data.user };
                    this.storeUser(this.user);
                    this.updateCreditsDisplay();
                }
            }
        } catch (error) {
            console.error('Activity sync failed:', error);
            // Re-queue activities on failure
            this.activityQueue = [...activities, ...this.activityQueue];
        }
    }

    /**
     * Show subscription reminder
     */
    showSubscriptionReminder() {
        if (!this.user) return;

        const tier = this.user.tier ?? 'free';
        const credits = this.user.credits_remaining ?? 0;

        // Don't show for pro/enterprise users
        if (tier === 'pro' || tier === 'enterprise') return;

        // Check if we should show reminder (not shown in last 24 hours)
        const lastReminder = localStorage.getItem('lastSubscriptionReminder');
        if (lastReminder && (Date.now() - parseInt(lastReminder)) < 86400000) {
            return;
        }

        // Show reminder based on conditions
        if (tier === 'free' || credits <= this.creditsWarningThreshold) {
            this.showSubscriptionModal();
            localStorage.setItem('lastSubscriptionReminder', Date.now().toString());
        }
    }

    /**
     * Show subscription promotion modal
     */
    showSubscriptionModal(options = {}) {
        const credits = this.user?.credits_remaining ?? 0;
        const tier = this.user?.tier ?? 'free';

        let title, message, urgency;

        if (credits <= 0) {
            title = 'Credits Exhausted!';
            message = 'You have used all your free credits. Subscribe now to continue using all features!';
            urgency = 'critical';
        } else if (credits <= this.creditsCriticalThreshold) {
            title = 'Running Low on Credits!';
            message = `You only have ${credits} credits remaining. Upgrade now to get unlimited access!`;
            urgency = 'warning';
        } else if (credits <= this.creditsWarningThreshold) {
            title = 'Consider Upgrading';
            message = `You have ${credits} credits left. Subscribe to unlock unlimited calculations and premium features!`;
            urgency = 'info';
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
                
                ${tier === 'free' ? `
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
        };

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);
        remindBtn?.addEventListener('click', closeModal);

        // Store reminder time
        localStorage.setItem('lastSubscriptionReminder', Date.now().toString());
    }

    /**
     * Show low credits warning (non-blocking toast)
     */
    showLowCreditsWarning() {
        const existing = document.getElementById('low-credits-toast');
        if (existing) return;

        const toast = document.createElement('div');
        toast.id = 'low-credits-toast';
        toast.className = 'fixed bottom-4 right-4 z-[90] bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Low credits remaining! <a href="settings.html#subscription" class="underline font-semibold">Upgrade now</a></span>
            <button class="ml-2 hover:bg-orange-600 rounded p-1" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            toast.remove();
        }, 10000);
    }

    /**
     * Show credits exhausted modal (blocking)
     */
    showCreditsExhaustedModal() {
        this.showSubscriptionModal({ urgency: 'critical' });
    }

    /**
     * Check if user can perform action requiring credits
     */
    canUseCredits(amount = 1) {
        if (!this.isAuthenticated) {
            this.redirectToLogin();
            return false;
        }

        const credits = this.user?.credits_remaining ?? 0;

        if (credits < amount) {
            this.showCreditsExhaustedModal();
            return false;
        }

        return true;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await this.fetchWithAuth(`${this.baseUrl}/auth/logout`, {
                method: 'POST'
            });
        } catch (e) {
            // Continue with client-side cleanup
        }

        this.clearUserData();

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        window.location.href = 'login.html';
    }

    /**
     * Refresh user data from server
     */
    async refreshUser() {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/auth/me`);

            if (response.ok) {
                const data = await response.json();
                this.user = data;
                this.storeUser(data);
                this.updateUserUI();
                return data;
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }

        return null;
    }
}

// Create singleton instance
const authGuard = new AuthGuard();

// Export for use in other modules
window.AuthGuard = AuthGuard;
window.authGuard = authGuard;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    authGuard.init().catch(console.error);
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-up {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
    
    .credits-warning {
        animation: pulse 2s infinite;
    }
    
    .credits-critical {
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);
