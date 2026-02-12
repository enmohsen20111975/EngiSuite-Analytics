// Index Page Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize page functionality
    initializePage();

    // Setup event listeners
    setupScrollEffects();
    setupLanguageSwitcher();
    setupButtonAnimations();

    // Check user session
    checkUserSession();
});

function initializePage() {
    // Load translations
    i18n.init();

    // Initialize animations
    initializeAnimations();

    // Load user data if logged in
    const user = localStorage.getItem('engisuite_user');
    if (user) {
        displayUserProfile(JSON.parse(user));
    }
}

function setupScrollEffects() {
    const header = document.getElementById('main-header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function setupLanguageSwitcher() {
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', function () {
        const selectedLanguage = this.value;
        i18n.setLanguage(selectedLanguage);
        localStorage.setItem('engisuite_language', selectedLanguage);
        updatePageLanguage(selectedLanguage);
    });
}

function setupButtonAnimations() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-white');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });

        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function checkUserSession() {
    const token = localStorage.getItem('engisuite_token');
    const user = localStorage.getItem('engisuite_user');

    if (token && user) {
        // User is logged in, update UI
        document.getElementById('auth-status').textContent = 'Signed In';
        document.getElementById('auth-status').style.color = '#2ecc71';
    } else {
        // User is not logged in, show login button
        document.getElementById('auth-status').textContent = 'Guest';
        document.getElementById('auth-status').style.color = '#666';
    }
}

function displayUserProfile(user) {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (userAvatar) {
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = user.name;
    }

    // Show user profile section
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.style.display = 'flex';
    }

    // Hide login button
    const loginButton = document.querySelector('.btn-primary');
    if (loginButton) {
        loginButton.style.display = 'none';
    }
}

function initializeAnimations() {
    // Initialize scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

function updatePageLanguage(language) {
    // Update page direction based on language
    const htmlElement = document.documentElement;
    if (language === 'ar') {
        htmlElement.setAttribute('dir', 'rtl');
        htmlElement.setAttribute('lang', 'ar');
    } else {
        htmlElement.setAttribute('dir', 'ltr');
        htmlElement.setAttribute('lang', language);
    }

    // Update all translated elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = i18n.getTranslation(key);
        if (translation && translation !== key) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', translation);
            } else {
                element.textContent = translation;
            }
        }
    });
}

// Add ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for module usage
export {
    initializePage,
    setupScrollEffects,
    setupLanguageSwitcher,
    setupButtonAnimations,
    checkUserSession,
    displayUserProfile,
    initializeAnimations,
    updatePageLanguage
};
