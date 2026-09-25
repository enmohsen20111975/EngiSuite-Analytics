import { api } from './apiClient';

/**
 * Pipelines Service
 * Handles all pipeline-related API calls
 */
export const pipelinesService = {
  /**
   * Get all pipelines
   */
  async getAll(domain = null) {
    const params = domain ? { domain } : {};
    const response = await api.get('/pipelines/', params);
    return response.data;
  },
  
  /**
   * Get pipeline by ID with full details
   */
  async getById(pipelineId) {
    const response = await api.get(`/pipelines/${pipelineId}`);
    return response.data;
  },
  
  /**
   * Execute a pipeline
   */
  async execute(pipelineId, inputs) {
    const response = await api.post(`/pipelines/${pipelineId}/execute`, { inputs });
    return response.data;
  },
  
  /**
   * Get pipeline steps
   */
  async getSteps(pipelineId) {
    const response = await api.get(`/pipelines/${pipelineId}/steps`);
    return response.data;
  },
  
  /**
   * Get pipelines by domain
   */
  async getByDomain(domain) {
    const response = await api.get('/pipelines/', { domain });
    return response.data;
  },

  /**
   * Search pipelines
   */
  async search(query) {
    const response = await api.get('/pipelines/search', { q: query });
    return response.data;
  },
};

// Domain metadata
export const DOMAIN_META = {
  electrical: { icon: 'Zap', color: '#f39c12', label: 'Electrical' },
  mechanical: { icon: 'Cog', color: '#3498db', label: 'Mechanical' },
  civil: { icon: 'Building2', color: '#2ecc71', label: 'Civil' },
};

// Difficulty colors
export const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  intermediate: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  advanced: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

export default pipelinesService;
