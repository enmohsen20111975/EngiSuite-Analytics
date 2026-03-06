import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Input, Loader } from '../../components/ui';
import { Settings, Bell, Shield, Globe, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Admin Settings Page
 */
export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    siteName: 'EngiSuite Analytics',
    siteDescription: 'Engineering Calculation Platform',
    contactEmail: 'support@engisuite.com',
    enableRegistration: true,
    enableGoogleAuth: true,
    maintenanceMode: false,
    emailNotifications: true,
    slackWebhook: '',
  });

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminService.getSettings,
  });

  const { data: features } = useQuery({
    queryKey: ['admin', 'settings', 'features'],
    queryFn: adminService.getFeatureFlags,
  });

  const saveMutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'settings']),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({ flag, enabled }) => adminService.updateFeatureFlag(flag, enabled),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'settings', 'features']),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure application settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
                <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description</label>
                <Input value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <Input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />Authentication
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Enable Registration</span>
                <button onClick={() => setSettings({ ...settings, enableRegistration: !settings.enableRegistration })}>
                  {settings.enableRegistration ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Enable Google OAuth</span>
                <button onClick={() => setSettings({ ...settings, enableGoogleAuth: !settings.enableGoogleAuth })}>
                  {settings.enableGoogleAuth ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}>
                  {settings.maintenanceMode ? <ToggleRight className="w-8 h-8 text-red-500" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />Notifications
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slack Webhook URL</label>
                <Input value={settings.slackWebhook} onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })} placeholder="https://hooks.slack.com/..." />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                <button onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}>
                  {settings.emailNotifications ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </label>
            </div>
          </Card>

          <Button onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Feature Flags */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Flags</h2>
            <div className="space-y-3">
              {[
                { key: 'ai_assistant', name: 'AI Assistant', description: 'Enable AI-powered assistance' },
                { key: 'visual_workflow', name: 'Visual Workflow', description: 'Enable visual workflow builder' },
                { key: 'advanced_reports', name: 'Advanced Reports', description: 'Enable advanced report generation' },
                { key: 'api_access', name: 'API Access', description: 'Enable public API access' },
                { key: 'learning_center', name: 'Learning Center', description: 'Enable learning courses' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{feature.name}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                  <button onClick={() => toggleFeatureMutation.mutate({ flag: feature.key, enabled: !features?.[feature.key] })}>
                    {features?.[feature.key] ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
