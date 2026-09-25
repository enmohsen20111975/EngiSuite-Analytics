import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Input, Loader, Modal } from '../../components/ui';
import { DollarSign, Plus, Pencil, Trash2, Save } from 'lucide-react';

/**
 * Admin Prices Page
 */
export default function AdminPricesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({ name: '', amount: 0, currency: 'USD', interval: 'month', features: '' });

  const { data: prices, isLoading } = useQuery({
    queryKey: ['admin', 'prices'],
    queryFn: adminService.getPrices,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingPrice ? adminService.updatePrice(editingPrice.id, data) : adminService.createPrice(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin', 'prices']); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePrice(id),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'prices']),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage subscription plans and pricing</p>
        </div>
        <Button onClick={() => { setEditingPrice(null); setFormData({ name: '', amount: 0, currency: 'USD', interval: 'month', features: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Plan
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {prices?.map((price) => (
          <Card key={price.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{price.name}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  ${price.amount}<span className="text-sm text-gray-500">/{price.interval}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingPrice(price); setFormData(price); setShowModal(true); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => deleteMutation.mutate(price.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {(price.features || '').split(',').map((f, i) => <li key={i}>• {f.trim()}</li>)}
            </ul>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPrice ? 'Pencil Plan' : 'Add Plan'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Professional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval</label>
              <select value={formData.interval} onChange={(e) => setFormData({ ...formData, interval: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (comma-separated)</label>
            <textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" rows={3} placeholder="Unlimited calculations, Export to PDF, Priority support" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
