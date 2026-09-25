import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, GitBranch, FolderKanban,
  Workflow, FileText, User, Settings, BookOpen, DollarSign,
  ChevronLeft, ChevronRight, ChevronDown, Ruler, FunctionSquare,
  PenTool, CircuitBoard, FileEdit, BarChart3, Zap, Droplets, Cog, Coins,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCredits } from '../../hooks/useCredits';
import { useTranslation } from '../../stores/languageStore';

const getNavItems = (t) => [
  { path: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
  { path: '/calculators', label: t('navigation.calculators'), icon: Calculator },
  { path: '/engineering-calculator', label: t('calculators.title'), icon: FunctionSquare },
  { path: '/unit-converter', label: 'Unit Converter', icon: Ruler },
  { path: '/pipelines', label: t('navigation.projects'), icon: GitBranch },
  { path: '/visual-workflow', label: 'Visual Workflow', icon: Workflow },
  { path: '/reports', label: t('navigation.reports'), icon: FileText },
  { path: '/projects', label: t('navigation.projects'), icon: FolderKanban },
  { path: '/learning', label: t('learning.title'), icon: BookOpen },
  { path: '/pricing', label: 'Pricing', icon: DollarSign },
];

const getSubsaasItems = (t) => [
  { path: '/diagram-studio', label: 'Diagram Studio', icon: PenTool },
  { path: '/logic-simulator', label: t('simulators.logic'), icon: CircuitBoard },
  { path: '/pdf-editor', label: 'PDF Editor', icon: FileEdit },
  { path: '/visual-data-analysis', label: t('navigation.analytics'), icon: BarChart3 },
];

const getSimulatorItems = (t) => [
  { path: '/simulators/electrical2', label: 'Electrical Sim 2', icon: Zap },
  { path: '/simulators/fluid', label: t('simulators.hydraulic'), icon: Droplets },
  { path: '/simulators/electrical', label: t('simulators.electrical'), icon: CircuitBoard },
  { path: '/simulators/hydraulic', label: t('simulators.hydraulic'), icon: Cog },
];

const getBottomNavItems = (t) => [
  { path: '/profile', label: t('navigation.profile'), icon: User },
  { path: '/settings', label: t('navigation.settings'), icon: Settings },
];

function NavItem({ item, collapsed, direction }) {
  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) => cn(
          'sidebar-link',
          isActive && 'active',
          collapsed && 'justify-center px-2',
          direction === 'rtl' && collapsed && 'flex-row-reverse'
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0", direction === 'rtl' && !collapsed && 'ml-0 mr-3')} />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    </li>
  );
}

function Sidebar({ collapsed, onToggle }) {
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [simsExpanded, setSimsExpanded] = useState(false);
  const navigate = useNavigate();
  const { credits, isLow } = useCredits();
  const { t, direction } = useTranslation();
  
  const navItems = getNavItems(t);
  const subsaasItems = getSubsaasItems(t);
  const simulatorItems = getSimulatorItems(t);
  const bottomNavItems = getBottomNavItems(t);

  return (
    <aside className={cn(
      'relative flex flex-col h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      direction === 'rtl' && 'border-r-0 border-l'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-[var(--color-border)]',
        collapsed && 'justify-center px-2'
      )}>
        {collapsed
          ? <span className="text-lg font-bold text-[var(--color-text-primary)]">E</span>
          : <span className="text-lg font-bold text-[var(--color-text-primary)]">EngiSuite</span>
        }
      </div>

      {/* Credit Balance Widget */}
      {!collapsed && (
        <button
          onClick={() => navigate('/subscription')}
          className={cn(
            'mx-3 mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors',
            isLow
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
            direction === 'rtl' && 'flex-row-reverse'
          )}
        >
          <Coins className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">{credits} pts</span>
              {isLow && <span className="text-xs font-bold">LOW!</span>}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div
                className={cn(
                  'h-1 rounded-full transition-all',
                  credits > 50 ? 'bg-green-500' : credits > 20 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(100, (credits / 100) * 100)}%` }}
              />
            </div>
          </div>
        </button>
      )}

      {collapsed && (
        <button
          onClick={() => navigate('/subscription')}
          className={cn(
            'mx-auto mt-3 p-2 rounded-lg transition-colors',
            isLow ? 'text-red-500 animate-pulse' : 'text-[var(--color-text-muted)]'
          )}
          title={`${credits} credits`}
        >
          <Coins className="w-5 h-5" />
        </button>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} direction={direction} />
          ))}
        </ul>

        {/* Tools Section */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          {!collapsed && (
            <button
              onClick={() => setToolsExpanded(prev => !prev)}
              className={cn(
                'w-full flex items-center justify-between px-3 mb-2',
                direction === 'rtl' && 'flex-row-reverse'
              )}
            >
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {t('settings.sections.developer') === 'إعدادات المطور' ? 'أدوات' : 'Tools'}
              </p>
              <ChevronDown className={cn(
                'w-3 h-3 text-[var(--color-text-muted)] transition-transform',
                toolsExpanded && 'rotate-180'
              )} />
            </button>
          )}
          {(toolsExpanded || collapsed) && (
            <ul className="space-y-1">
              {subsaasItems.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} direction={direction} />
              ))}
            </ul>
          )}
        </div>

        {/* Simulators Section */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          {!collapsed && (
            <button
              onClick={() => setSimsExpanded(prev => !prev)}
              className={cn(
                'w-full flex items-center justify-between px-3 mb-2',
                direction === 'rtl' && 'flex-row-reverse'
              )}
            >
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {t('simulators.title')}
              </p>
              <ChevronDown className={cn(
                'w-3 h-3 text-[var(--color-text-muted)] transition-transform',
                simsExpanded && 'rotate-180'
              )} />
            </button>
          )}
          {(simsExpanded || collapsed) && (
            <ul className="space-y-1">
              {simulatorItems.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} direction={direction} />
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-2 border-t border-[var(--color-border)]">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} direction={direction} />
          ))}
        </ul>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute w-6 h-6 rounded-full z-50',
          'bg-[var(--color-bg-primary)] border border-[var(--color-border)]',
          'flex items-center justify-center text-[var(--color-text-muted)]',
          direction === 'rtl' ? '-left-3 top-20' : '-right-3 top-20'
        )}
      >
        {collapsed 
          ? (direction === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) 
          : (direction === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
        }
      </button>
    </aside>
  );
}

export default Sidebar;
