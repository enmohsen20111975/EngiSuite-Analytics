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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

/**
 * Header component
 */
function Header({ onMenuClick, sidebarCollapsed }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  
  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
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
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16',
        'flex items-center justify-between px-4 md:px-6',
        'bg-[var(--color-bg-primary)]/80 backdrop-blur-xl',
        'border-b border-[var(--color-border)]',
        'transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] w-64">
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-2">
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
            <div className="absolute right-0 mt-2 w-36 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg animate-scale-in">
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
                    theme === option.value ? 'text-accent' : 'text-[var(--color-text-primary)]'
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>
        
        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]"
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
            <div className="absolute right-0 mt-2 w-56 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg animate-scale-in">
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="font-medium text-[var(--color-text-primary)]">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] truncate">
                  {user?.email || ''}
                </p>
              </div>
              
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              
              <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-[var(--color-bg-secondary)]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
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
