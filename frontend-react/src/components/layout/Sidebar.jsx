import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  GitBranch,
  FolderKanban,
  Workflow,
  FileText,
  User,
  Settings,
  BookOpen,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Ruler,
  FunctionSquare,
  PenTool,
  CircuitBoard,
  FileEdit,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calculators', label: 'Calculators', icon: Calculator },
  { path: '/engineering-calculator', label: 'Sci Calculator', icon: FunctionSquare },
  { path: '/unit-converter', label: 'Unit Converter', icon: Ruler },
  { path: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { path: '/visual-workflow', label: 'Visual Workflow', icon: Workflow },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/learning', label: 'Learning', icon: BookOpen },
  { path: '/pricing', label: 'Pricing', icon: DollarSign },
];

// Integrated SubSaaS applications
const subsaasItems = [
  { path: '/diagram-studio', label: 'Diagram Studio', icon: PenTool },
  { path: '/logic-simulator', label: 'Logic Simulator', icon: CircuitBoard },
  { path: '/pdf-editor', label: 'PDF Editor', icon: FileEdit },
  { path: '/visual-data-analysis', label: 'Data Analysis', icon: BarChart3 },
];

const bottomNavItems = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Sidebar component
 */
function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen',
        'flex flex-col',
        'bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              EngiSuite
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">E</span>
          </div>
        )}
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  'sidebar-link',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* Integrated Apps Section */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <p className="px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Tools
            </p>
            <ul className="space-y-1">
              {subsaasItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      'sidebar-link',
                      isActive && 'active',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {collapsed && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <ul className="space-y-1">
              {subsaasItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      'sidebar-link',
                      isActive && 'active',
                      'justify-center px-2'
                    )}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      {/* Bottom Navigation */}
      <div className="py-4 px-2 border-t border-[var(--color-border)]">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  'sidebar-link',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 z-50',
          'w-6 h-6 rounded-full',
          'bg-[var(--color-bg-primary)] border border-[var(--color-border)]',
          'flex items-center justify-center',
          'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          'transition-colors duration-200',
          'shadow-sm'
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
