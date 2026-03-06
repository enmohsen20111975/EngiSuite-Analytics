import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FolderKanban, Plus, CircleAlert, Zap, Settings, Building2, 
  Calculator, Layers, HardHat, Clock, FolderOpen
} from 'lucide-react';
import { Card, Input, Loader } from '../components/ui';
import projectService from '../services/projectService';

// Template icons mapping
const TEMPLATE_ICONS = {
  'fa-bolt': Zap,
  'fa-gear': Settings,
  'fa-city': Building2,
  'fa-calculator': Calculator,
  'fa-diagram-project': Layers,
  'fa-hard-hat': HardHat,
  'fa-clock': Clock,
  'fa-folder': FolderOpen,
  'fa-industry': Building2,
  'fa-wind': Settings,
  'fa-grip-lines': Layers,
  'fa-building': Building2,
  'fa-road': Layers,
  'fa-cubes': Layers,
};

function UpgradeRequired({ message }) {
  return (
    <Card className="p-8 text-center">
      <CircleAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Plan Required</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message || 'Projects are available on Pro and Enterprise plans.'}</p>
      <a href="/pricing" className="inline-flex px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Upgrade Plan</a>
    </Card>
  );
}

function TemplateCard({ template, onSelect }) {
  const Icon = TEMPLATE_ICONS[template.icon] || FolderOpen;
  
  return (
    <button
      onClick={() => onSelect(template)}
      className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${template.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: template.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {template.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {template.description}
          </p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
            {template.category}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'general',
    template_id: '',
  });

  const templatesQuery = useQuery({
    queryKey: ['project-templates'],
    queryFn: projectService.getTemplates,
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setSelectedTemplate(null);
      setForm({ name: '', description: '', category: 'general', template_id: '' });
      navigate(`/projects/${project.id}`);
    },
  });

  const upgradeError = projectsQuery.error?.response?.status === 402 || templatesQuery.error?.response?.status === 402;

  const templates = templatesQuery.data || [];
  const projects = projectsQuery.data || [];

  const groupedProjects = useMemo(() => {
    return [...projects].sort((a, b) => (new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()));
  }, [projects]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setForm(f => ({ 
      ...f, 
      template_id: template.id, 
      category: template.category,
      name: f.name || `${template.name} Project`
    }));
    setShowForm(true);
  };

  if (templatesQuery.isLoading || projectsQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (upgradeError) {
    const message = projectsQuery.error?.response?.data?.detail?.message || templatesQuery.error?.response?.data?.detail?.message;
    return <UpgradeRequired message={message} />;
  }

  const generalError = templatesQuery.error || projectsQuery.error;
  if (generalError) {
    const responseStatus = generalError?.response?.status;
    const responseDetail = generalError?.response?.data?.detail;
    const detailMessage =
      typeof responseDetail === 'string'
        ? responseDetail
        : responseDetail?.message || generalError?.message;

    return (
      <Card className="p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Projects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Could not fetch projects/templates from backend.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Status: {responseStatus || 'unknown'} | Message: {detailMessage || 'unknown error'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage engineering projects, tasks, and delivery phases.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Start from a template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.filter(t => t.category !== 'blank').map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedTemplate ? `Create from ${selectedTemplate.name}` : 'Create New Project'}
            </h3>
            <button 
              onClick={() => {
                setShowForm(false);
                setSelectedTemplate(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Project Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Substation Upgrade"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              >
                <option value="general">General</option>
                <option value="electrical">Electrical</option>
                <option value="mechanical">Mechanical</option>
                <option value="civil">Civil</option>
                <option value="mep">MEP</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Template</label>
              <select
                value={form.template_id}
                onChange={(e) => {
                  const template = templates.find(t => t.id === Number(e.target.value));
                  setSelectedTemplate(template || null);
                  setForm((f) => ({ 
                    ...f, 
                    template_id: e.target.value,
                    category: template?.category || f.category
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              >
                <option value="">No template (blank project)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                placeholder="Short project description"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!form.name.trim()) return;
                  createProjectMutation.mutate({
                    ...form,
                    template_id: form.template_id ? Number(form.template_id) : null,
                  });
                }}
                disabled={createProjectMutation.isPending || !form.name.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Projects</h2>
        {groupedProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first project to start planning tasks and deliveries.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupedProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="text-left"
              >
                <Card className="p-5 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.category}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">{project.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">{project.description || 'No description'}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(project.progress || 0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, project.progress || 0)}%` }} />
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
