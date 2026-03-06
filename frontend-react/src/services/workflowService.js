import { api } from './apiClient';

/**
 * Workflow Service
 * Handles visual workflow builder API calls
 */
export const workflowService = {
  /**
   * Get available equations for workflow palette
   */
  async getEquations(params = {}) {
    const response = await api.get('/calculators/equations/catalog', { params });
    return response.data;
  },
  
  /**
   * Get workflow examples
   */
  async getExamples() {
    const response = await api.get('/workflows/examples');
    return response.data;
  },
  
  /**
   * Save workflow
   */
  async save(workflow) {
    const response = await api.post('/workflows/save', workflow);
    return response.data;
  },
  
  /**
   * Load workflow
   */
  async load(workflowId) {
    const response = await api.get(`/workflows/${workflowId}`);
    return response.data;
  },
  
  /**
   * Execute workflow
   */
  async execute(workflow, inputs) {
    const response = await api.post('/workflows/execute', {
      workflow,
      inputs
    });
    return response.data;
  },
  
  /**
   * Get user workflows
   */
  async getUserWorkflows() {
    const response = await api.get('/workflows/user');
    return response.data;
  },
  
  /**
   * Delete workflow
   */
  async delete(workflowId) {
    const response = await api.delete(`/workflows/${workflowId}`);
    return response.data;
  },
};

// Domain colors for workflow nodes
export const DOMAIN_COLORS = {
  electrical: '#1976d2',
  mechanical: '#f57c00',
  civil: '#388e3c',
  mathematics: '#7b1fa2',
  scientific: '#7b1fa2',
  general: '#616161'
};

export default workflowService;
