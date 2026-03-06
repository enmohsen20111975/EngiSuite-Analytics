import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Input, Loader, EmptyState } from '../../components/ui';
import { Bot, MessageSquare, Settings, DollarSign, TrendingUp, Save } from 'lucide-react';
import { useState } from 'react';

/**
 * Admin AI Page
 */
export default function AdminAIPage() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    enabled: true,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'ai', 'stats'],
    queryFn: adminService.getAIStats,
  });

  const { data: conversations, isLoading: loadingConv } = useQuery({
    queryKey: ['admin', 'ai', 'conversations'],
    queryFn: () => adminService.getAIConversations({ limit: 20 }),
  });

  const { data: currentConfig } = useQuery({
    queryKey: ['admin', 'ai', 'config'],
    queryFn: adminService.getAIConfig,
  });

  const updateConfigMutation = useMutation({
    mutationFn: adminService.updateAIConfig,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'ai', 'config']),
  });

  if (loadingStats || loadingConv) return <div className="flex justify-center p-8"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and configure AI features</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Conversations</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalConversations || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages Today</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.messagesToday || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost This Month</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${stats?.monthlyCost || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.avgResponseTime || 0}ms</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
              <Input type="number" value={config.maxTokens} onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperature</label>
              <Input type="number" step="0.1" min="0" max="2" value={config.temperature} onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} className="rounded" />
              <label className="text-sm text-gray-700 dark:text-gray-300">Enable AI Features</label>
            </div>
            <Button onClick={() => updateConfigMutation.mutate(config)} disabled={updateConfigMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </Card>

        {/* Recent Conversations */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Conversations</h2>
          {conversations?.items?.length > 0 ? (
            <div className="space-y-3">
              {conversations.items.slice(0, 10).map((conv, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{conv.user_email}</span>
                    <span className="text-xs text-gray-500">{conv.messages_count} messages</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(conv.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={MessageSquare} title="No conversations yet" description="AI conversations will appear here" />
          )}
        </Card>
      </div>
    </div>
  );
}
