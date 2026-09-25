import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Loader } from '../../components/ui';
import { Server, Database, RefreshCw, Download, TriangleAlert, CircleCheck, Trash2, Archive } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Admin System Page
 */
export default function AdminSystemPage() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['admin', 'system', 'metrics'],
    queryFn: adminService.getMetrics,
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['admin', 'system', 'logs'],
    queryFn: () => adminService.getLogs({ limit: 50 }),
  });

  const { data: backups, isLoading: loadingBackups } = useQuery({
    queryKey: ['admin', 'system', 'backups'],
    queryFn: adminService.getBackupHistory,
  });

  const clearCacheMutation = useMutation({
    mutationFn: (type) => adminService.clearCache(type),
  });

  const backupMutation = useMutation({
    mutationFn: adminService.runBackup,
  });

  if (loadingMetrics || loadingLogs || loadingBackups) {
    return <div className="flex justify-center p-8"><Loader size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage system resources</p>
      </div>

      {/* System Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CPU Usage</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics?.cpu || 0}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${metrics?.cpu || 0}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Memory Usage</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics?.memory || 0}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${metrics?.memory || 0}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Database className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Disk Usage</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics?.disk || 0}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${metrics?.disk || 0}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Uptime</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics?.uptime || '0d'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => clearCacheMutation.mutate('all')}>
              <Trash2 className="w-4 h-4 mr-2" />Clear All Cache
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => backupMutation.mutate()}>
              <Archive className="w-4 h-4 mr-2" />
              {backupMutation.isPending ? 'Creating Backup...' : 'Create Database Backup'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />Export System Logs
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <RefreshCw className="w-4 h-4 mr-2" />Restart Services
            </Button>
          </div>
        </Card>

        {/* Backup History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup History</h2>
          {backups?.length > 0 ? (
            <div className="space-y-3">
              {backups.map((backup, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {backup.status === 'completed' ? (
                      <CircleCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <TriangleAlert className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{backup.name}</p>
                      <p className="text-xs text-gray-500">{new Date(backup.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{backup.size}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No backups yet</p>
          )}
        </Card>
      </div>

      {/* System Logs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Logs</h2>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {logs?.items?.length > 0 ? (
            logs.items.map((log, idx) => (
              <div key={idx} className={cn(
                'py-1',
                log.level === 'ERROR' && 'text-red-400',
                log.level === 'WARN' && 'text-yellow-400',
                log.level === 'INFO' && 'text-green-400',
                log.level === 'DEBUG' && 'text-gray-400',
              )}>
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
                <span className="text-blue-400">[{log.level}]</span>{' '}
                <span>{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No logs available</p>
          )}
        </div>
      </Card>
    </div>
  );
}
