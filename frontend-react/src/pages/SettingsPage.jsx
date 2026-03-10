import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Palette, Globe, Bell, 
  Shield, Database, Code, CircleQuestionMark, Moon, Sun, Monitor,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore, ACCENT_COLORS } from '../stores/themeStore';
import { useTranslation } from '../stores/languageStore';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';

// Settings sections
const getSections = (t) => [
  { id: 'appearance', label: t('settings.sections.appearance'), icon: Palette },
  { id: 'notifications', label: t('settings.sections.notifications'), icon: Bell },
  { id: 'language', label: t('settings.sections.language'), icon: Globe },
  { id: 'privacy', label: t('settings.sections.privacy'), icon: Shield },
  { id: 'data', label: t('settings.sections.data'), icon: Database },
  { id: 'developer', label: t('settings.sections.developer'), icon: Code },
  { id: 'about', label: t('settings.sections.about'), icon: CircleQuestionMark },
];

// Available languages
const LANGUAGES = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { value: 'fr', label: 'French', nativeLabel: 'Français' },
];

// Available timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
];

/**
 * Settings page component
 */
function SettingsPage() {
  const { theme, setTheme, resolvedTheme, accentColor, setAccentColor } = useThemeStore();
  const { language, setLanguage, timezone, setTimezone, t, direction } = useTranslation();
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
    updates: true,
  });
  
  const sections = getSections(t);
  
  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                {t('settings.appearance.theme.title')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: t('settings.appearance.theme.light'), icon: Sun },
                  { value: 'dark', label: t('settings.appearance.theme.dark'), icon: Moon },
                  { value: 'system', label: t('settings.appearance.theme.system'), icon: Monitor },
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
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                {t('settings.appearance.accentColor.title')}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {t('settings.appearance.accentColor.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={cn(
                      'relative w-10 h-10 rounded-full border-2 transition-transform hover:scale-110',
                      accentColor === color.value 
                        ? 'border-[var(--color-text-primary)] ring-2 ring-accent/30' 
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {accentColor === color.value && (
                      <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('settings.notifications.title')}
            </h3>
            {[
              { key: 'email', label: t('settings.notifications.email.label'), description: t('settings.notifications.email.description') },
              { key: 'push', label: t('settings.notifications.push.label'), description: t('settings.notifications.push.description') },
              { key: 'weekly', label: t('settings.notifications.weekly.label'), description: t('settings.notifications.weekly.description') },
              { key: 'updates', label: t('settings.notifications.updates.label'), description: t('settings.notifications.updates.description') },
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
                    notifications[item.key] 
                      ? (direction === 'rtl' ? 'right-1' : 'left-7')
                      : (direction === 'rtl' ? 'right-7' : 'left-1')
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
              {t('settings.language.title')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  {t('settings.language.language')}
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg',
                    'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                    'text-[var(--color-text-primary)]',
                    'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                  )}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  {t('settings.language.timezone')}
                </label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg',
                    'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                    'text-[var(--color-text-primary)]',
                    'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                  )}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Language Preview */}
              <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  {language === 'ar' ? 'معاينة اللغة' : language === 'fr' ? 'Aperçu de la langue' : 'Language Preview'}
                </p>
                <p className="text-[var(--color-text-primary)]" dir={direction}>
                  {t('dashboard.welcome', { name: language === 'ar' ? 'المستخدم' : language === 'fr' ? 'Utilisateur' : 'User' })}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('settings.privacy.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.privacy.twoFactor.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.privacy.twoFactor.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.enable')}</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.privacy.sessions.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.privacy.sessions.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.manage')}</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.privacy.deleteAccount.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.privacy.deleteAccount.description')}
                  </p>
                </div>
                <Button variant="danger" size="sm">{t('common.delete')}</Button>
              </div>
            </div>
          </div>
        );
        
      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('settings.data.title')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <div className="flex justify-between mb-2">
                  <span className="text-[var(--color-text-primary)]">
                    {t('settings.data.storageUsed')}
                  </span>
                  <span className="text-[var(--color-text-muted)]">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: '24%', backgroundColor: accentColor }} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.data.exportData.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.data.exportData.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.export')}</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.data.clearCache.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.data.clearCache.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.delete')}</Button>
              </div>
            </div>
          </div>
        );
        
      case 'developer':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('settings.developer.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.developer.apiKeys.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.developer.apiKeys.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.manage')}</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.developer.webhooks.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.developer.webhooks.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.configure')}</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {t('settings.developer.debugMode.label')}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('settings.developer.debugMode.description')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">{t('common.enable')}</Button>
              </div>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('settings.about.title')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <p className="font-medium text-[var(--color-text-primary)]">
                  {t('settings.about.version')}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t('settings.about.builtWith')}
                </p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">
                  {t('settings.about.documentation')}
                </span>
                <a href="/api-docs" className="text-accent hover:underline">{t('common.view')}</a>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">
                  {t('settings.about.terms')}
                </span>
                <a href="/terms" className="text-accent hover:underline">{t('common.view')}</a>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[var(--color-text-primary)]">
                  {t('settings.about.privacy')}
                </span>
                <a href="/privacy" className="text-accent hover:underline">{t('common.view')}</a>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-up" dir={direction}>
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
          {t('settings.title')}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {t('settings.subtitle')}
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
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
                    direction === 'rtl' && 'flex-row-reverse text-right'
                  )}
                >
                  <section.icon className={cn('w-5 h-5 shrink-0', direction === 'rtl' && 'ml-0 mr-2')} />
                  <span>{section.label}</span>
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
