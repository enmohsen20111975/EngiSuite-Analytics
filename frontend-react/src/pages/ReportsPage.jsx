import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Download, Plus, Trash2, Eye, 
  Calendar, FileSpreadsheet, File, Search, Filter,
  Zap, Cog, Building2, LayoutTemplate, Loader,
  Check, X, ChevronRight, Code, FileCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { reportsService, TEMPLATE_CATEGORIES, REPORT_FORMATS } from '../services/reportsService';
import { Card, Input, Button, Loader as PageLoader, EmptyState, Modal } from '../components/ui';

// Report type icons
const typeIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  html: FileCode,
  markdown: FileCode,
  json: Code,
  calculation: File,
};

// Category icons
const categoryIcons = {
  electrical: Zap,
  mechanical: Cog,
  civil: Building2,
  general: FileText,
};

/**
 * Report Card Component
 */
function ReportCard({ report, onView, onDownload, onDelete }) {
  const TypeIcon = typeIcons[report.reportType] || typeIcons[report.type] || FileText;
  
  return (
    <Card hover className="group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <TypeIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {report.description || 'Engineering calculation report'}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <span className="uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {report.reportType || report.type}
              </span>
              {report.project && (
                <span className="text-blue-500">
                  {report.project.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(report)}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(report)}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(report)}
              className="text-red-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Template Card Component
 */
function TemplateCard({ template, onSelect }) {
  const category = template.category || 'general';
  const categoryMeta = TEMPLATE_CATEGORIES[category] || TEMPLATE_CATEGORIES.general;
  const CategoryIcon = categoryIcons[category] || categoryIcons.general;
  
  return (
    <Card 
      hover 
      className="group cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{ 
              backgroundColor: `${categoryMeta.color}20`,
              color: categoryMeta.color 
            }}
          >
            <CategoryIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${categoryMeta.color}20`,
                  color: categoryMeta.color 
                }}
              >
                {categoryMeta.name}
              </span>
              <span className="text-xs text-gray-400 uppercase">
                {template.report_type}
              </span>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Report Generation Modal
 */
function GenerateReportModal({ template, isOpen, onClose, onGenerate }) {
  const [formData, setFormData] = useState({});
  const [format, setFormat] = useState('html');
  const [projectName, setProjectName] = useState('');
  const [author, setAuthor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Parse template sections to get required fields
  const requiredFields = useMemo(() => {
    if (!template?.sections) return [];
    
    try {
      const sections = typeof template.sections === 'string' 
        ? JSON.parse(template.sections) 
        : template.sections;
      
      const fields = [];
      sections.forEach(section => {
        if (typeof section.content === 'string') {
          const matches = section.content.match(/\{\{(\w+)\}\}/g);
          if (matches) {
            matches.forEach(m => {
              const field = m.replace(/\{\{|\}\}/g, '');
              if (!fields.includes(field)) {
                fields.push(field);
              }
            });
          }
        }
      });
      return fields;
    } catch {
      return [];
    }
  }, [template]);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      await onGenerate({
        templateId: template.id,
        data: {
          ...formData,
          projectName,
          author,
        },
        format,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!isOpen || !template) return null;
  
  const category = template.category || 'general';
  const categoryMeta = TEMPLATE_CATEGORIES[category] || TEMPLATE_CATEGORIES.general;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Report" size="lg">
      <div className="space-y-6">
        {/* Template Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div 
            className="p-3 rounded-xl"
            style={{ 
              backgroundColor: `${categoryMeta.color}20`,
              color: categoryMeta.color 
            }}
          >
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {template.description}
            </p>
          </div>
        </div>
        
        {/* Report Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author
            </label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
            />
          </div>
        </div>
        
        {/* Dynamic Fields */}
        {requiredFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Report Data
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFields.map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {field.replace(/_/g, ' ')}
                  </label>
                  <Input
                    value={formData[field] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field]: e.target.value
                    }))}
                    placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {REPORT_FORMATS.map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setFormat(fmt.value)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  format === fmt.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  {format === fmt.value && <Check className="w-4 h-4 text-blue-500" />}
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {fmt.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{fmt.description}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Report Preview Modal
 */
function ReportPreviewModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={report.title} size="xl">
      <div className="h-[70vh] overflow-auto">
        {report.reportType === 'html' || report.type === 'html' ? (
          <div 
            className="prose dark:prose-invert max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: report.content }}
          />
        ) : (
          <pre className="p-4 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto">
            {typeof report.content === 'string' 
              ? report.content 
              : JSON.stringify(report.content, null, 2)
            }
          </pre>
        )}
      </div>
    </Modal>
  );
}

/**
 * Main Reports Page
 */
export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'templates'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch reports
  const { 
    data: reports = [], 
    isLoading: loadingReports,
    error: reportsError 
  } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsService.getAll(),
  });
  
  // Fetch templates
  const { 
    data: templates = [], 
    isLoading: loadingTemplates 
  } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => reportsService.getTemplates(),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => reportsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
  
  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: (data) => reportsService.generateFromTemplate(
      data.templateId,
      data.data,
      data.format,
      true
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setActiveTab('reports');
    },
  });
  
  // ListFilter reports
  const filteredReports = useMemo(() => {
    let result = reports;
    
    if (filterType !== 'all') {
      result = result.filter(r => 
        (r.reportType || r.type) === filterType
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [reports, filterType, searchQuery]);
  
  // ListFilter templates by category
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowGenerateModal(true);
  };
  
  // Handle view report
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowPreviewModal(true);
  };
  
  // Handle download report
  const handleDownloadReport = async (report) => {
    try {
      const type = report.reportType || report.type;
      let blob;
      
      if (type === 'html') {
        blob = await reportsService.exportHtml(report.id);
      } else if (type === 'markdown' || type === 'md') {
        blob = await reportsService.exportMarkdown(report.id);
      } else {
        blob = await reportsService.exportJson(report.id);
      }
      
      const extension = type === 'markdown' ? 'md' : type;
      reportsService.downloadBlob(blob, `${report.title.replace(/\s+/g, '_')}.${extension}`);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };
  
  // Handle delete report
  const handleDeleteReport = (report) => {
    if (window.confirm(`Are you sure you want to delete "${report.title}"?`)) {
      deleteMutation.mutate(report.id);
    }
  };
  
  // Handle generate report
  const handleGenerateReport = async (data) => {
    await generateMutation.mutateAsync(data);
  };
  
  const isLoading = loadingReports || loadingTemplates;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Technical Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Generate and manage engineering calculation reports
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={activeTab === 'reports' ? "Search reports..." : "Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'reports'
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          )}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          My Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'templates'
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          )}
        >
          <LayoutTemplate className="w-4 h-4 inline mr-2" />
          Templates ({templates.length})
        </button>
      </div>
      
      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'html', 'markdown', 'json'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  filterType === type
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {type === 'all' ? 'All Types' : type.toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <PageLoader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          
          {/* Error State */}
          {reportsError && (
            <Card className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Reports
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {reportsError.message || 'Unable to load reports'}
              </p>
            </Card>
          )}
          
          {/* Empty State */}
          {!isLoading && !reportsError && filteredReports.length === 0 && (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? `No reports match "${searchQuery}"`
                  : 'Generate your first engineering report from a template.'
                }
              </p>
              <Button onClick={() => setActiveTab('templates')}>
                <Plus className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Card>
          )}
          
          {/* Reports List */}
          {!isLoading && !reportsError && filteredReports.length > 0 && (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={handleViewReport}
                  onDownload={handleDownloadReport}
                  onDelete={handleDeleteReport}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <PageLoader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <LayoutTemplate className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? `No templates match "${searchQuery}"`
                  : 'No report templates are available yet.'
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Generate Report Modal */}
      <GenerateReportModal
        template={selectedTemplate}
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setSelectedTemplate(null);
        }}
        onGenerate={handleGenerateReport}
      />
      
      {/* Report Preview Modal */}
      <ReportPreviewModal
        report={selectedReport}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
}
