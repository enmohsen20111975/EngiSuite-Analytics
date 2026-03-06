import { useState } from 'react';
import { 
  Settings as SettingsIcon, Palette, Globe, Bell, 
  Shield, Database, Code, CircleQuestionMark, Moon, Sun, Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../stores/themeStore';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';

// Settings sections
const sections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'developer', label: 'Developer', icon: Code },
  { id: 'about', label: 'About', icon: CircleQuestionMark },
];

/**
 * Settings page component
 */
function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
    updates: true,
  });
  
  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Theme
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      theme === option.value
                        ? 'border-accent bg-accent/5'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                    )}
                  >
                    <option.icon className={cn(
                      'w-8 h-8',
                      theme === option.value ? 'text-accent' : 'text-[var(--color-text-muted)]'
                    )} />
                    <span className={cn(
                      'font-medium',
                      theme === option.value ? 'text-accent' : 'text-[var(--color-text-primary)]'
                    )}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Accent Color
              </h3>
              <div className="flex gap-3">
                {['#0891b2', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-transform hover:scale-110',
                      color === '#0891b2' ? 'border-[var(--color-text-primary)]' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Notification Preferences
            </h3>
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive email updates about your calculations' },
              { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
              { key: 'weekly', label: 'Weekly Summary', description: 'Receive a weekly summary of your activity' },
              { key: 'updates', label: 'Product Updates', description: 'Get notified about new features and improvements' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{item.description}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    notifications[item.key] ? 'bg-accent' : 'bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <span className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notifications[item.key] ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>
            ))}
          </div>
        );
        
      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Language & Region
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Language
                </label>
                <select className={cn(
                  'w-full px-4 py-2.5 rounded-lg',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'text-[var(--color-text-primary)]',
                  'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                )}>
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="fr">Français (French)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Timezone
                </label>
                <select className={cn(
                  'w-full px-4 py-2.5 rounded-lg',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'text-[var(--color-text-primary)]',
                  'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                )}>
                  <option value="utc">UTC</option>
                  <option value="africa">Africa/Lome</option>
                  <option value="europe">Europe/London</option>
                  <option value="america">America/New_York</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Two-Factor Authentication</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Add an extra layer of security</p>
                </div>
                <Button variant="secondary" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Active Sessions</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Manage your active sessions</p>
                </div>
                <Button variant="secondary" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Delete Account</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Permanently delete your account and data</p>
                </div>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
            </div>
          </div>
        );
        
      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Data & Storage
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <div className="flex justify-between mb-2">
                  <span className="text-[var(--color-text-primary)]">Storage Used</span>
                  <span className="text-[var(--color-text-muted)]">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                  <div className="h-full w-1/4 rounded-full bg-accent" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Export Data</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Download all your data</p>
                </div>
                <Button variant="secondary" size="sm">Export</Button>
              </div>
            </div>
          </div>
        );
        
      case 'developer':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Developer Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">API Keys</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Manage your API access tokens</p>
                </div>
                <Button variant="secondary" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Webhooks</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Configure webhook endpoints</p>
                </div>
                <Button variant="secondary" size="sm">Configure</Button>
              </div>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              About EngiSuite Analytics
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <p className="font-medium text-[var(--color-text-primary)]">Version 2.0.0</p>
                <p className="text-sm text-[var(--color-text-muted)]">Built with React + Vite</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">Documentation</span>
                <a href="/api-docs" className="text-accent hover:underline">View</a>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">Terms of Service</span>
                <a href="/terms" className="text-accent hover:underline">View</a>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[var(--color-text-primary)]">Privacy Policy</span>
                <a href="/privacy" className="text-accent hover:underline">View</a>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Manage your application preferences and settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                    activeSection === section.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
        
        {/* Content */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {renderSection()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
