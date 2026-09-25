import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useTranslation } from '../../stores/languageStore';
import CreditsBadge from '../ui/CreditsBadge';

// Available languages for quick switch
const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
];

/**
 * Header component
 */
function Header({ onMenuClick, sidebarCollapsed }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const { t, language, setLanguage, direction } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const languageMenuRef = useRef(null);
  
  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout with redirect
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };
  
  const themeOptions = [
    { value: 'light', label: t('settings.appearance.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.appearance.theme.dark'), icon: Moon },
    { value: 'system', label: t('settings.appearance.theme.system'), icon: Monitor },
  ];
  
  return (
    <header
      className={cn(
        'fixed top-0 z-30 h-16',
        'flex items-center justify-between px-4 md:px-6',
        'bg-[var(--color-bg-primary)]/80 backdrop-blur-xl',
        'border-b border-[var(--color-border)]',
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
        direction === 'rtl' ? 'right-0 left-16 lg:left-64' : 'right-0 left-16 lg:left-64'
      )}
      style={{ 
        [direction === 'rtl' ? 'right' : 'left']: 0,
        [direction === 'rtl' ? 'left' : 'right']: 0,
        [direction === 'rtl' ? 'marginLeft' : 'marginLeft']: sidebarCollapsed ? '4rem' : '16rem',
        [direction === 'rtl' ? 'marginRight' : 'marginLeft']: 0
      }}
    >
      {/* Left side */}
      <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className={cn(
          'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] w-64',
          direction === 'rtl' && 'flex-row-reverse'
        )}>
          <Search className={cn('w-4 h-4 text-[var(--color-text-muted)]', direction === 'rtl' && 'ml-0 mr-2')} />
          <input
            type="text"
            placeholder={t('common.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
              direction === 'rtl' && 'text-right'
            )}
            dir={direction}
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
        {/* Credit Balance */}
        <CreditsBadge className="hidden sm:flex" />

        {/* Language toggle */}
        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
            title={t('settings.sections.language')}
          >
            <Globe className="w-5 h-5" />
          </button>
          
          {showLanguageMenu && (
            <div className={cn(
              'absolute mt-2 w-40 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg animate-scale-in',
              direction === 'rtl' ? 'left-0' : 'right-0'
            )}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setShowLanguageMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-[var(--color-bg-secondary)]',
                    language === lang.value ? 'text-accent' : 'text-[var(--color-text-primary)]',
                    direction === 'rtl' && 'flex-row-reverse'
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          
          {showThemeMenu && (
            <div className={cn(
              'absolute mt-2 w-36 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg animate-scale-in',
              direction === 'rtl' ? 'left-0' : 'right-0'
            )}>
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setShowThemeMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-[var(--color-bg-secondary)]',
                    theme === option.value ? 'text-accent' : 'text-[var(--color-text-primary)]',
                    direction === 'rtl' && 'flex-row-reverse'
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]">
          <Bell className="w-5 h-5" />
          <span className={cn(
            'absolute top-1 w-2 h-2 rounded-full bg-danger',
            direction === 'rtl' ? 'left-1' : 'right-1'
          )} />
        </button>
        
        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]',
              direction === 'rtl' && 'flex-row-reverse'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-medium text-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <ChevronDown className={cn(
              'w-4 h-4 text-[var(--color-text-muted)] transition-transform',
              showUserMenu && 'rotate-180'
            )} />
          </button>
          
          {showUserMenu && (
            <div className={cn(
              'absolute mt-2 w-56 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg animate-scale-in',
              direction === 'rtl' ? 'left-0' : 'right-0'
            )}>
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className={cn(
                  'font-medium text-[var(--color-text-primary)]',
                  direction === 'rtl' && 'text-right'
                )}>
                  {user?.name || 'User'}
                </p>
                <p className={cn(
                  'text-sm text-[var(--color-text-muted)] truncate',
                  direction === 'rtl' && 'text-right'
                )}>
                  {user?.email || ''}
                </p>
              </div>
              
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
                  direction === 'rtl' && 'flex-row-reverse justify-end'
                )}
              >
                <User className="w-4 h-4" />
                <span>{t('navigation.profile')}</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
                  direction === 'rtl' && 'flex-row-reverse justify-end'
                )}
              >
                <Settings className="w-4 h-4" />
                <span>{t('navigation.settings')}</span>
              </Link>
              
              <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-[var(--color-bg-secondary)]',
                    direction === 'rtl' && 'flex-row-reverse justify-end'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navigation.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
