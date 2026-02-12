/**
 * EngiSuite Mobile Navigation System
 * Handles drawer navigation, floating action buttons, and touch interactions
 */

class MobileNavigation {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.swipeThreshold = 80;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');

        this.setupDrawerToggle();
        this.setupSwipeGestures();
        this.setupTouchFeedback();
        this.setupFloatingButtons();
        this.handleResize();

        // Listen for resize events
        window.addEventListener('resize', () => this.handleResize());
    }

    setupDrawerToggle() {
        // Mobile menu button
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDrawer();
            });
        }

        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeDrawer());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDrawer();
            }
        });
    }

    setupSwipeGestures() {
        // Touch start
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Touch end
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        const isMobile = window.innerWidth < 768;

        if (!isMobile) return;

        // Swipe right to open (from left edge)
        if (this.touchStartX < 30 && swipeDistance > this.swipeThreshold && !this.isOpen) {
            this.openDrawer();
        }

        // Swipe left to close
        if (swipeDistance < -this.swipeThreshold && this.isOpen) {
            this.closeDrawer();
        }
    }

    openDrawer() {
        if (!this.sidebar || !this.overlay) return;

        this.isOpen = true;

        // Show overlay
        this.overlay.classList.remove('hidden');
        this.overlay.style.opacity = '1';

        // Show sidebar with animation
        this.sidebar.classList.remove('hidden');
        this.sidebar.classList.add('mobile-drawer-open');
        this.sidebar.style.transform = 'translateX(0)';

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.classList.add('drawer-open');

        // Update menu button icon
        this.updateMenuIcon(true);
    }

    closeDrawer() {
        if (!this.sidebar || !this.overlay) return;

        this.isOpen = false;

        // Hide overlay with animation
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.classList.add('hidden');
        }, 300);

        // Hide sidebar with animation
        this.sidebar.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            if (!this.isOpen) {
                this.sidebar.classList.add('hidden');
                this.sidebar.classList.remove('mobile-drawer-open');
            }
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';
        document.body.classList.remove('drawer-open');

        // Update menu button icon
        this.updateMenuIcon(false);
    }

    toggleDrawer() {
        if (this.isOpen) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    updateMenuIcon(isOpen) {
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (!menuBtn) return;

        const icon = menuBtn.querySelector('i');
        if (icon) {
            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }

    setupTouchFeedback() {
        // Add touch feedback to all interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .nav-item, .card-clickable');

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
    }

    setupFloatingButtons() {
        // Create main FAB container if it doesn't exist
        let fabContainer = document.getElementById('fab-container');

        if (!fabContainer) {
            fabContainer = document.createElement('div');
            fabContainer.id = 'fab-container';
            fabContainer.className = 'fab-container';
            document.body.appendChild(fabContainer);
        }
    }

    handleResize() {
        // Close drawer on desktop
        if (window.innerWidth >= 768 && this.isOpen) {
            this.closeDrawer();
        }
    }
}

/**
 * Floating Action Button Manager
 */
class FloatingActionButton {
    constructor(options = {}) {
        this.container = null;
        this.buttons = options.buttons || [];
        this.position = options.position || 'bottom-right';
        this.mainIcon = options.mainIcon || 'fa-plus';
        this.mainLabel = options.mainLabel || 'Actions';
        this.isOpen = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        // Create FAB container
        this.container = document.createElement('div');
        this.container.className = `fab-wrapper fab-${this.position}`;
        this.container.innerHTML = this.getTemplate();

        // Add to body
        document.body.appendChild(this.container);

        // Setup event listeners
        this.setupEvents();
    }

    getTemplate() {
        const buttonsHtml = this.buttons.map((btn, index) => `
            <button class="fab-item ${btn.className || ''}" 
                    data-action="${btn.action || ''}"
                    title="${btn.label || ''}"
                    style="transition-delay: ${index * 50}ms">
                <span class="fab-item-label">${btn.label || ''}</span>
                <span class="fab-item-icon">
                    <i class="fas ${btn.icon || 'fa-circle'}"></i>
                </span>
            </button>
        `).join('');

        return `
            <div class="fab-menu ${this.buttons.length > 0 ? 'has-items' : ''}">
                ${buttonsHtml}
                <button class="fab-main" title="${this.mainLabel}" aria-label="${this.mainLabel}">
                    <i class="fas ${this.mainIcon}"></i>
                </button>
            </div>
        `;
    }

    setupEvents() {
        const mainBtn = this.container.querySelector('.fab-main');
        const items = this.container.querySelectorAll('.fab-item');

        if (mainBtn && this.buttons.length > 0) {
            mainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                if (action && window[action]) {
                    window[action]();
                }
                this.close();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.container.classList.add('fab-open');

        // Rotate main icon
        const mainIcon = this.container.querySelector('.fab-main i');
        if (mainIcon) {
            mainIcon.style.transform = 'rotate(45deg)';
        }
    }

    close() {
        this.isOpen = false;
        this.container.classList.remove('fab-open');

        // Reset main icon
        const mainIcon = this.container.querySelector('.fab-main i');
        if (mainIcon) {
            mainIcon.style.transform = '';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = '';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

/**
 * Mobile Bottom Navigation Bar
 */
class BottomNavigationBar {
    constructor(options = {}) {
        this.items = options.items || [];
        this.activeItem = options.activeItem || '';
        this.container = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        // Only show on mobile
        if (window.innerWidth >= 768) return;

        this.container = document.createElement('nav');
        this.container.className = 'bottom-nav';
        this.container.innerHTML = this.getTemplate();

        document.body.appendChild(this.container);

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                this.container.style.display = 'none';
            } else {
                this.container.style.display = '';
            }
        });
    }

    getTemplate() {
        return this.items.map(item => `
            <a href="${item.href || '#'}" 
               class="bottom-nav-item ${this.activeItem === item.id ? 'active' : ''}"
               data-id="${item.id}">
                <span class="bottom-nav-icon">
                    <i class="fas ${item.icon}"></i>
                    ${item.badge ? `<span class="bottom-nav-badge">${item.badge}</span>` : ''}
                </span>
                <span class="bottom-nav-label">${item.label}</span>
            </a>
        `).join('');
    }

    setActive(id) {
        const items = this.container.querySelectorAll('.bottom-nav-item');
        items.forEach(item => {
            if (item.dataset.id === id) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

/**
 * Pull to Refresh functionality
 */
class PullToRefresh {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.onRefresh = options.onRefresh || (() => { });
        this.threshold = options.threshold || 80;
        this.isPulling = false;
        this.startY = 0;
        this.currentY = 0;
        this.init();
    }

    init() {
        this.createIndicator();
        this.setupEvents();
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'pull-to-refresh-indicator';
        this.indicator.innerHTML = `
            <div class="ptr-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="ptr-arrow">
                <i class="fas fa-arrow-down"></i>
            </div>
            <span class="ptr-text">Pull to refresh</span>
        `;

        this.container.insertBefore(this.indicator, this.container.firstChild);
    }

    setupEvents() {
        this.container.addEventListener('touchstart', (e) => {
            if (this.container.scrollTop === 0) {
                this.isPulling = true;
                this.startY = e.touches[0].clientY;
            }
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!this.isPulling) return;

            this.currentY = e.touches[0].clientY;
            const diff = this.currentY - this.startY;

            if (diff > 0) {
                const progress = Math.min(diff / this.threshold, 1);
                this.updateIndicator(progress, diff);
            }
        }, { passive: true });

        this.container.addEventListener('touchend', () => {
            if (!this.isPulling) return;

            const diff = this.currentY - this.startY;

            if (diff >= this.threshold) {
                this.triggerRefresh();
            } else {
                this.resetIndicator();
            }

            this.isPulling = false;
        }, { passive: true });
    }

    updateIndicator(progress, distance) {
        const maxDistance = 120;
        const translateY = Math.min(distance, maxDistance);

        this.indicator.style.transform = `translateY(${translateY}px)`;
        this.indicator.style.opacity = progress;

        if (progress >= 1) {
            this.indicator.querySelector('.ptr-text').textContent = 'Release to refresh';
            this.indicator.querySelector('.ptr-arrow').style.transform = 'rotate(180deg)';
        } else {
            this.indicator.querySelector('.ptr-text').textContent = 'Pull to refresh';
            this.indicator.querySelector('.ptr-arrow').style.transform = '';
        }
    }

    resetIndicator() {
        this.indicator.style.transform = '';
        this.indicator.style.opacity = '';
        this.indicator.querySelector('.ptr-text').textContent = 'Pull to refresh';
        this.indicator.querySelector('.ptr-arrow').style.transform = '';
    }

    triggerRefresh() {
        this.indicator.classList.add('refreshing');
        this.indicator.querySelector('.ptr-spinner').style.display = 'block';
        this.indicator.querySelector('.ptr-arrow').style.display = 'none';
        this.indicator.querySelector('.ptr-text').textContent = 'Refreshing...';

        Promise.resolve(this.onRefresh())
            .finally(() => {
                setTimeout(() => {
                    this.indicator.classList.remove('refreshing');
                    this.indicator.querySelector('.ptr-spinner').style.display = '';
                    this.indicator.querySelector('.ptr-arrow').style.display = '';
                    this.resetIndicator();
                }, 300);
            });
    }
}

/**
 * Touch-friendly Modal Handler
 */
class MobileModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.init();
    }

    init() {
        if (!this.modal) return;

        // Add touch-friendly class
        this.modal.classList.add('mobile-modal');

        // Setup swipe to dismiss
        this.setupSwipeToDismiss();
    }

    setupSwipeToDismiss() {
        let startY = 0;
        let currentY = 0;

        this.modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.modal.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0) {
                this.modal.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });

        this.modal.addEventListener('touchend', () => {
            const diff = currentY - startY;

            if (diff > 100) {
                this.close();
            } else {
                this.modal.style.transform = '';
            }
        }, { passive: true });
    }

    open() {
        this.modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.transform = '';
        this.modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Initialize mobile navigation
const mobileNav = new MobileNavigation();

// Export for use in other modules
window.MobileNavigation = MobileNavigation;
window.FloatingActionButton = FloatingActionButton;
window.BottomNavigationBar = BottomNavigationBar;
window.PullToRefresh = PullToRefresh;
window.MobileModal = MobileModal;
window.mobileNav = mobileNav;
