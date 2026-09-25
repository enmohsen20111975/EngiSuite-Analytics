import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card, Loader, EmptyState } from '../../components/ui';
import { 
  Users, DollarSign, Activity, Zap, TrendingUp, TrendingDown,
  Server, Database, TriangleAlert, CircleCheck, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Admin Dashboard Page
 */
export default function AdminDashboardPage() {
  // Fetch admin stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
  });

  // Fetch system health
  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminService.getSystemHealth,
  });

  // Fetch recent activity
  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => adminService.getRecentActivity(20),
  });

  const isLoading = loadingStats || loadingHealth || loadingActivity;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.usersChange || '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      change: stats?.subscriptionsChange || '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Calculations Today',
      value: stats?.calculationsToday || 0,
      change: stats?.calculationsChange || '+24%',
      trend: 'up',
      icon: Zap,
      color: 'bg-yellow-500',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      change: stats?.revenueChange || '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          System overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={cn('p-3 rounded-full', stat.color, 'text-white')}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Health
          </h2>
          <div className="space-y-4">
            {[
              { name: 'API Server', status: health?.api || 'healthy', icon: Server },
              { name: 'Database', status: health?.database || 'healthy', icon: Database },
              { name: 'Cache', status: health?.cache || 'healthy', icon: Activity },
              { name: 'Queue', status: health?.queue || 'healthy', icon: Clock },
            ].map((service) => {
              const Icon = service.icon;
              const isHealthy = service.status === 'healthy';
              return (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isHealthy ? (
                      <>
                        <CircleCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500">Healthy</span>
                      </>
                    ) : (
                      <>
                        <TriangleAlert className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-500">{service.status}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {activity?.length > 0 ? (
            <div className="space-y-3">
              {activity.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    item.type === 'user' ? 'bg-blue-500' :
                    item.type === 'payment' ? 'bg-green-500' :
                    item.type === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Activity will appear here"
            />
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <span className="text-sm text-gray-900 dark:text-white">Manage Users</span>
          </a>
          <a
            href="/admin/equations"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Database className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <span className="text-sm text-gray-900 dark:text-white">Equations</span>
          </a>
          <a
            href="/admin/financial"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <DollarSign className="w-6 h-6 mx-auto text-purple-500 mb-2" />
            <span className="text-sm text-gray-900 dark:text-white">Financial</span>
          </a>
          <a
            href="/admin/system"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Server className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <span className="text-sm text-gray-900 dark:text-white">System</span>
          </a>
        </div>
      </Card>
    </div>
  );
}
