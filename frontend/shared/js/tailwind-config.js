window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: 'class', // Enable dark mode via 'dark' class
    theme: {
        extend: {
            colors: {
                /* ============================================
                   Accessible Color Palette (WCAG AA Compliant)
                   ============================================ */
                
                // Background colors
                bg: {
                    DEFAULT: '#F8FAFC',     // Main page background
                    surface: '#FFFFFF',     // Card surfaces
                    hover: '#F1F5F9',       // Hover states
                },
                
                // Text colors
                text: {
                    primary: '#1E293B',     // Headings, main content
                    secondary: '#64748B',   // Labels, hints
                    muted: '#94A3B8',       // Placeholders
                    disabled: '#94A3B8',    // Inactive states
                    inverse: '#FFFFFF',     // Inverse text
                },
                
                // Primary action color
                primary: {
                    DEFAULT: '#2563EB',     // Main action color
                    hover: '#1D4ED8',       // Button hover/focus
                    light: '#EFF6FF',       // Light background
                    dark: '#1E40AF',        // Dark variant
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#2563EB',
                    600: '#1D4ED8',
                    700: '#1E40AF',
                    800: '#1E3A8A',
                    900: '#172554',
                },
                
                // Status colors
                status: {
                    success: '#10B981',     // Success state
                    successLight: '#ECFDF5',
                    warning: '#F59E0B',     // Warning state (not red!)
                    warningLight: '#FFFBEB',
                    error: '#EF4444',       // Error state only
                    errorLight: '#FEF2F2',
                    info: '#3B82F6',        // Info state
                    infoLight: '#EFF6FF',
                },
                
                // Border color
                border: {
                    DEFAULT: '#E2E8F0',     // Input borders, dividers
                    muted: '#F1F5F9',
                    strong: '#CBD5E1',
                },
                
                // Focus ring
                focus: '#3B82F6',
                
                // Legacy brand colors (for backward compatibility)
                brand: {
                    blue: '#2563EB',
                    dark: '#1E40AF',
                    text: '#1E293B',
                    light: '#F8FAFC',
                    accent: '#3B82F6',
                    success: '#10B981',
                    warning: '#F59E0B',
                    danger: '#EF4444'
                },
                
                // Dark mode colors
                dark: {
                    bg: {
                        DEFAULT: '#0F172A',   // Dark background
                        surface: '#1E293B',   // Dark cards
                        hover: '#334155',     // Dark hover
                    },
                    text: {
                        primary: '#F1F5F9',   // White-like text
                        secondary: '#94A3B8', // Muted text
                        muted: '#64748B',     // More muted
                        disabled: '#64748B',  // Disabled text
                    },
                    border: '#334155',      // Dark borders
                }
            },
            fontFamily: {
                sans: ['Inter', 'Space Grotesk', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                'gradient-brand': 'linear-gradient(135deg, #1E40AF, #2563EB)',
                'gradient-sidebar': 'linear-gradient(135deg, #1E40AF, #2563EB)',
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.1)',
                'medium': '0 5px 20px rgba(0, 0, 0, 0.08)',
                'strong': '0 15px 35px rgba(0, 0, 0, 0.12)',
                'brand': '0 5px 15px rgba(37, 99, 235, 0.3)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease',
                'spin-slow': 'spin 1s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        }
    },
    // Enable active variants for all utilities
    corePlugins: {
        preflight: true,
    }
};

// Add global button active state styles via CSS injection
(function () {
    const style = document.createElement('style');
    style.textContent = `
        /* Tailwind Button Active States - Simple Scale Effect Only */
        button:active:not(:disabled),
        [type="button"]:active:not(:disabled),
        [type="submit"]:active:not(:disabled),
        .btn:active:not(:disabled) {
            transform: scale(0.97);
            transition: transform 0.1s ease;
        }
        
        /* Primary/Blue buttons - darker shade on active */
        .bg-blue-500:active:not(:disabled), .bg-blue-600:active:not(:disabled), .bg-blue-700:active:not(:disabled),
        .bg-primary:active:not(:disabled), .bg-indigo-500:active:not(:disabled), .bg-indigo-600:active:not(:disabled) {
            background-color: #1E40AF !important;
        }
        
        /* Success/Green buttons - darker shade on active */
        .bg-green-500:active:not(:disabled), .bg-green-600:active:not(:disabled),
        .bg-success:active:not(:disabled), .bg-emerald-500:active:not(:disabled), .bg-emerald-600:active:not(:disabled) {
            background-color: #059669 !important;
        }
        
        /* Danger/Red buttons - darker shade on active */
        .bg-red-500:active:not(:disabled), .bg-red-600:active:not(:disabled),
        .bg-danger:active:not(:disabled), .bg-rose-500:active:not(:disabled), .bg-rose-600:active:not(:disabled) {
            background-color: #DC2626 !important;
        }
        
        /* Warning/Yellow buttons - darker shade on active */
        .bg-yellow-500:active:not(:disabled), .bg-yellow-600:active:not(:disabled),
        .bg-warning:active:not(:disabled), .bg-amber-500:active:not(:disabled), .bg-amber-600:active:not(:disabled) {
            background-color: #D97706 !important;
        }
        
        /* Purple/Violet buttons - darker shade on active */
        .bg-purple-500:active:not(:disabled), .bg-purple-600:active:not(:disabled),
        .bg-violet-500:active:not(:disabled), .bg-violet-600:active:not(:disabled) {
            background-color: #7C3AED !important;
        }
        
        /* White/Light buttons - subtle gray on active */
        .bg-white:active:not(:disabled), .bg-slate-50:active:not(:disabled), .bg-gray-50:active:not(:disabled) {
            background-color: #E2E8F0 !important;
        }
        
        /* Dark buttons - lighter on active */
        .bg-slate-900:active:not(:disabled), .bg-gray-900:active:not(:disabled), .bg-black:active:not(:disabled) {
            background-color: #334155 !important;
        }
        
        /* Gradient buttons - no filter effect */
        [class*="bg-gradient"]:active:not(:disabled) {
            opacity: 0.9;
        }
        
        /* Outline buttons - fill with border color */
        .border-blue-500:active:not(:disabled), .border-blue-600:active:not(:disabled),
        .border-primary:active:not(:disabled) {
            background-color: #2563EB !important;
            color: white !important;
        }
        
        /* Icon buttons - smaller scale */
        .rounded-full:active:not(:disabled) {
            transform: scale(0.9);
        }
        
        /* Ensure text remains readable */
        button:active:not(:disabled) * {
            pointer-events: none;
        }

        /* Custom utility classes */
        .touch-target {
            min-width: 44px;
            min-height: 44px;
        }

        /* Mobile bottom navigation - Updated with accessible colors */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #FFFFFF;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-around;
            padding: 0.5rem 0;
            z-index: 40;
        }

        .dark .bottom-nav {
            background: #1E293B;
            border-top-color: #334155;
        }

        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.5rem;
            color: #64748B;
            text-decoration: none;
            font-size: 0.75rem;
            transition: all 0.2s;
        }

        .bottom-nav-item.active {
            color: #2563EB;
        }

        .dark .bottom-nav-item {
            color: #94A3B8;
        }

        .dark .bottom-nav-item.active {
            color: #60A5FA;
        }

        .bottom-nav-icon {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
        }

        .bottom-nav-label {
            font-size: 0.625rem;
        }

        /* Mobile drawer */
        .mobile-drawer-open {
            transform: translateX(0) !important;
        }
    `;
    document.head.appendChild(style);
})();
