import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Main application layout with sidebar and header
 */
function AppLayout() {
  const { isAuthenticated, init: initAuth } = useAuthStore();
  const { init: initTheme } = useThemeStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize auth and theme on mount
  useEffect(() => {
    initAuth();
    const cleanup = initTheme();
    return cleanup;
  }, [initAuth, initTheme]);
  
  // TEMPORARILY DISABLED: Redirect to login if not authenticated
  // Uncomment the following lines to re-enable authentication:
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      
      {/* Sidebar */}
      <div className={cn(
        'hidden lg:block',
        mobileMenuOpen && 'block'
      )}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 lg:hidden',
        'transform transition-transform duration-300',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Header */}
      <Header
        onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Main content */}
      <main className={cn(
        'min-h-screen pt-16 transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <div className="relative z-10 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
