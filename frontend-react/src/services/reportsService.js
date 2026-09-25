import { api } from './apiClient';

/**
 * Reports Service
 * Handles all report-related API calls including technical report generation
 */
export const reportsService = {
  /**
   * Get all reports
   */
  async getAll() {
    const response = await api.get('/reports');
    return response.data;
  },
  
  /**
   * Get report by ID
   */
  async getById(id) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  
  /**
   * Create report
   */
  async create(data) {
    const response = await api.post('/reports', data);
    return response.data;
  },
  
  /**
   * Delete report
   */
  async delete(id) {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  
  /**
   * Get report templates
   */
  async getTemplates() {
    const response = await api.get('/reports/templates');
    return response.data;
  },
  
  /**
   * Get report template by ID
   */
  async getTemplate(id) {
    const response = await api.get(`/reports/templates/${id}`);
    return response.data;
  },
  
  /**
   * Get report template by slug
   */
  async getTemplateBySlug(slug) {
    const response = await api.get(`/reports/templates/slug/${slug}`);
    return response.data;
  },
  
  /**
   * Generate report from template
   */
  async generateFromTemplate(templateId, data = {}, format = 'html', save = true, projectId = null) {
    const response = await api.post('/reports/generate', {
      templateId,
      data,
      format,
      save,
      projectId,
    });
    return response.data;
  },
  
  /**
   * Generate custom report
   */
  async generateCustom(reportConfig) {
    const response = await api.post('/reports/generate-custom', reportConfig);
    return response.data;
  },
  
  /**
   * Export report as HTML
   */
  async exportHtml(id) {
    const response = await api.get(`/reports/${id}/export/html`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Export report as Markdown
   */
  async exportMarkdown(id) {
    const response = await api.get(`/reports/${id}/export/markdown`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Export report as JSON
   */
  async exportJson(id) {
    const response = await api.get(`/reports/${id}/export/json`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Download blob as file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  /**
   * Generate and download report
   */
  async generateAndDownload(templateId, data, format = 'html', filename = 'report') {
    const result = await this.generateFromTemplate(templateId, data, format, false);
    
    const blob = new Blob([result.content], { 
      type: result.contentType 
    });
    
    const extension = format === 'markdown' ? 'md' : format;
    this.downloadBlob(blob, `${filename}.${extension}`);
    
    return result;
  },
};

// Report template categories
export const TEMPLATE_CATEGORIES = {
  electrical: {
    name: 'Electrical',
    color: '#1976d2',
    icon: 'Zap',
  },
  mechanical: {
    name: 'Mechanical',
    color: '#f57c00',
    icon: 'Cog',
  },
  civil: {
    name: 'Civil',
    color: '#388e3c',
    icon: 'Building2',
  },
  general: {
    name: 'General',
    color: '#616161',
    icon: 'FileText',
  },
};

// Report format options
export const REPORT_FORMATS = [
  { value: 'html', label: 'HTML', description: 'Web page format with styling' },
  { value: 'markdown', label: 'Markdown', description: 'Plain text format for documentation' },
  { value: 'json', label: 'JSON', description: 'Structured data format' },
];

export default reportsService;
