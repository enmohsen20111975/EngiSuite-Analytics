import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card, Loader } from '../../components/ui';
import { DollarSign, TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Admin Financial Page
 */
export default function AdminFinancialPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin', 'financial', 'overview'],
    queryFn: () => adminService.getFinancialOverview('month'),
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin', 'financial', 'revenue'],
    queryFn: () => adminService.getRevenue('year'),
  });

  const { data: transactions, isLoading: loadingTrans } = useQuery({
    queryKey: ['admin', 'financial', 'transactions'],
    queryFn: () => adminService.getTransactions({ limit: 20 }),
  });

  if (loadingOverview || loadingRevenue || loadingTrans) {
    return <div className="flex justify-center p-8"><Loader size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Revenue and subscription analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${overview?.monthlyRevenue || 0}</p>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />+12% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.activeSubscriptions || 0}</p>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />+8 this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview?.churnRate || 0}%</p>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <ArrowDownRight className="w-3 h-3" />-2% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ARPU</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${overview?.arpu || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Average revenue per user</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Revenue chart will be displayed here</p>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
        {transactions?.items?.length > 0 ? (
          <div className="space-y-3">
            {transactions.items.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.user_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </Card>
    </div>
  );
}
