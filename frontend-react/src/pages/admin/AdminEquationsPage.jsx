import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button, Card, Input, Loader, EmptyState, Modal } from '../../components/ui';
import { 
  Search, Plus, Pencil, Trash2, Download, Upload, ListFilter,
  ChevronDown, Save, X
} from 'lucide-react';
import { cn } from '../../lib/utils';

const CATEGORIES = ['Electrical', 'Mechanical', 'Civil', 'Chemical', 'General'];

/**
 * Admin Equations Page
 */
export default function AdminEquationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEquation, setEditingEquation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electrical',
    description: '',
    equation: '',
    variables: [],
  });

  // Fetch equations
  const { data: equations, isLoading } = useQuery({
    queryKey: ['admin', 'equations', { search, category }],
    queryFn: () => adminService.getEquations({ search, category }),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => 
      editingEquation 
        ? adminService.updateEquation(editingEquation.id, data)
        : adminService.createEquation(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'equations']);
      setShowModal(false);
      setEditingEquation(null);
      setFormData({ name: '', category: 'Electrical', description: '', equation: '', variables: [] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteEquation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'equations']);
    },
  });

  const handleEdit = (equation) => {
    setEditingEquation(equation);
    setFormData({
      name: equation.name,
      category: equation.category,
      description: equation.description || '',
      equation: equation.equation,
      variables: equation.variables || [],
    });
    setShowModal(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this equation?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equations Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage engineering equations library</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { setEditingEquation(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Equation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search equations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Equations Grid */}
      {equations?.items?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equations.items.map((eq) => (
            <Card key={eq.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  eq.category === 'Electrical' ? 'bg-yellow-100 text-yellow-700' :
                  eq.category === 'Mechanical' ? 'bg-blue-100 text-blue-700' :
                  eq.category === 'Civil' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {eq.category}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(eq)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(eq.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{eq.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{eq.description}</p>
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm text-gray-700 dark:text-gray-300">
                {eq.equation}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <EmptyState icon={Search} title="No equations found" description="Add your first equation to get started" />
        </Card>
      )}

      {/* Add/Pencil Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEquation ? 'Pencil Equation' : 'Add Equation'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Ohm's Law"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equation</label>
            <Input
              value={formData.equation}
              onChange={(e) => setFormData({ ...formData, equation: e.target.value })}
              placeholder="e.g., V = I * R"
              className="font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
