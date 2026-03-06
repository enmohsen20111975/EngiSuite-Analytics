import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Input, Loader, EmptyState, Modal } from '../../components/ui';
import { Search, Plus, Pencil, Trash2, Zap, Settings } from 'lucide-react';

/**
 * Admin Calculators Page
 */
export default function AdminCalculatorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCalc, setEditingCalc] = useState(null);

  const { data: calculators, isLoading } = useQuery({
    queryKey: ['admin', 'calculators', { search }],
    queryFn: () => adminService.getCalculators({ search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteCalculator(id),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'calculators']),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculators Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage engineering calculators</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Calculator
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="Search calculators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </Card>

      {calculators?.items?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculators.items.map((calc) => (
            <Card key={calc.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingCalc(calc); setShowModal(true); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(calc.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{calc.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{calc.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{calc.category}</span>
                <span>{calc.equations_count || 0} equations</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <EmptyState icon={Zap} title="No calculators found" description="Add your first calculator" />
        </Card>
      )}
    </div>
  );
}
