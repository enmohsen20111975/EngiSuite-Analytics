/**
 * Visual Data Analysis (VDA) Service
 * Handles all API calls for data upload, queries, reports, and dashboards
 */

import api from './apiClient';

const VDA_BASE = '/api/vda';

// ============== Data Upload & Sources ==============

/**
 * Upload a data file (Excel, CSV, JSON, SQLite)
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`${VDA_BASE}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all uploaded data sources
 */
export const getDataSources = async () => {
  const response = await api.get(`${VDA_BASE}/data-sources`);
  return response.data;
};

/**
 * Get a specific data source
 */
export const getDataSource = async (sourceId) => {
  const response = await api.get(`${VDA_BASE}/data-sources/${sourceId}`);
  return response.data;
};

/**
 * Delete a data source
 */
export const deleteDataSource = async (sourceId) => {
  const response = await api.delete(`${VDA_BASE}/data-sources/${sourceId}`);
  return response.data;
};

// ============== Query Operations ==============

/**
 * Execute a visual query
 */
export const executeQuery = async (queryConfig) => {
  const response = await api.post(`${VDA_BASE}/query`, queryConfig);
  return response.data;
};

/**
 * Save a query
 */
export const saveQuery = async (queryConfig, name) => {
  const response = await api.post(`${VDA_BASE}/query/save?name=${encodeURIComponent(name)}`, queryConfig);
  return response.data;
};

/**
 * Get all saved queries
 */
export const getSavedQueries = async () => {
  const response = await api.get(`${VDA_BASE}/queries`);
  return response.data;
};

// ============== Report Operations ==============

/**
 * Save a report
 */
export const saveReport = async (reportConfig) => {
  const response = await api.post(`${VDA_BASE}/reports`, reportConfig);
  return response.data;
};

/**
 * Get all saved reports
 */
export const getReports = async () => {
  const response = await api.get(`${VDA_BASE}/reports`);
  return response.data;
};

/**
 * Get a specific report
 */
export const getReport = async (reportId) => {
  const response = await api.get(`${VDA_BASE}/reports/${reportId}`);
  return response.data;
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId) => {
  const response = await api.delete(`${VDA_BASE}/reports/${reportId}`);
  return response.data;
};

/**
 * Export report as HTML
 */
export const exportReportHtml = async (reportId) => {
  const response = await api.get(`${VDA_BASE}/reports/${reportId}/export/html`, {
    responseType: 'blob',
  });
  return response.data;
};

// ============== Dashboard Operations ==============

/**
 * Save a dashboard
 */
export const saveDashboard = async (dashboardConfig) => {
  const response = await api.post(`${VDA_BASE}/dashboards`, dashboardConfig);
  return response.data;
};

/**
 * Get all saved dashboards
 */
export const getDashboards = async () => {
  const response = await api.get(`${VDA_BASE}/dashboards`);
  return response.data;
};

/**
 * Get a specific dashboard
 */
export const getDashboard = async (dashboardId) => {
  const response = await api.get(`${VDA_BASE}/dashboards/${dashboardId}`);
  return response.data;
};

/**
 * Delete a dashboard
 */
export const deleteDashboard = async (dashboardId) => {
  const response = await api.delete(`${VDA_BASE}/dashboards/${dashboardId}`);
  return response.data;
};

// ============== Export Operations ==============

/**
 * Export data as CSV
 */
export const exportCsv = async (data) => {
  const response = await api.post(`${VDA_BASE}/export/csv`, data, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Export data as JSON
 */
export const exportJson = async (data) => {
  const response = await api.post(`${VDA_BASE}/export/json`, data, {
    responseType: 'blob',
  });
  return response.data;
};

// ============== Statistics ==============

/**
 * Calculate statistics for data
 */
export const calculateStatistics = async (data) => {
  const response = await api.post(`${VDA_BASE}/statistics`, data);
  return response.data;
};

// ============== Local Storage Helpers ==============

/**
 * Store data in sessionStorage for cross-page sharing
 */
export const storeActiveData = (data) => {
  sessionStorage.setItem('vda_active_data', JSON.stringify(data));
};

/**
 * Get active data from sessionStorage
 */
export const getActiveData = () => {
  const data = sessionStorage.getItem('vda_active_data');
  return data ? JSON.parse(data) : null;
};

/**
 * Clear active data from sessionStorage
 */
export const clearActiveData = () => {
  sessionStorage.removeItem('vda_active_data');
};

/**
 * Store uploaded files metadata in localStorage
 */
export const storeUploadedFiles = (files) => {
  localStorage.setItem('vda_uploaded_files', JSON.stringify(files));
};

/**
 * Get uploaded files metadata from localStorage
 */
export const getUploadedFiles = () => {
  const files = localStorage.getItem('vda_uploaded_files');
  return files ? JSON.parse(files) : [];
};

/**
 * Store saved reports in localStorage (backup)
 */
export const storeSavedReports = (reports) => {
  localStorage.setItem('vda_saved_reports', JSON.stringify(reports));
};

/**
 * Get saved reports from localStorage (backup)
 */
export const getSavedReports = () => {
  const reports = localStorage.getItem('vda_saved_reports');
  return reports ? JSON.parse(reports) : [];
};

/**
 * Store saved dashboards in localStorage (backup)
 */
export const storeSavedDashboards = (dashboards) => {
  localStorage.setItem('vda_saved_dashboards', JSON.stringify(dashboards));
};

/**
 * Get saved dashboards from localStorage (backup)
 */
export const getSavedDashboards = () => {
  const dashboards = localStorage.getItem('vda_saved_dashboards');
  return dashboards ? JSON.parse(dashboards) : [];
};

export default {
  // Data Sources
  uploadFile,
  getDataSources,
  getDataSource,
  deleteDataSource,
  
  // Queries
  executeQuery,
  saveQuery,
  getSavedQueries,
  
  // Reports
  saveReport,
  getReports,
  getReport,
  deleteReport,
  exportReportHtml,
  
  // Dashboards
  saveDashboard,
  getDashboards,
  getDashboard,
  deleteDashboard,
  
  // Export
  exportCsv,
  exportJson,
  
  // Statistics
  calculateStatistics,
  
  // Local Storage
  storeActiveData,
  getActiveData,
  clearActiveData,
  storeUploadedFiles,
  getUploadedFiles,
  storeSavedReports,
  getSavedReports,
  storeSavedDashboards,
  getSavedDashboards,
};
