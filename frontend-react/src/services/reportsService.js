import { api } from './apiClient';

/**
 * Reports Service
 * Handles all report-related API calls
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
   * Export report as PDF
   */
  async exportPdf(id) {
    const response = await api.get(`/reports/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Export report as Excel
   */
  async exportExcel(id) {
    const response = await api.get(`/reports/${id}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Get report templates
   */
  async getTemplates() {
    const response = await api.get('/reports/templates');
    return response.data;
  },
};

export default reportsService;
