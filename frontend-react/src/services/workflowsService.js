import { api } from './apiClient';

/**
 * Workflows Service
 * Handles all workflow-related API calls
 */
export const workflowsService = {
  /**
   * Get all workflows
   */
  async getAll() {
    const response = await api.get('/workflows');
    return response.data;
  },
  
  /**
   * Get workflow by ID
   */
  async getById(id) {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },
  
  /**
   * Create workflow
   */
  async create(data) {
    const response = await api.post('/workflows', data);
    return response.data;
  },
  
  /**
   * Update workflow
   */
  async update(id, data) {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete workflow
   */
  async delete(id) {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },
  
  /**
   * Execute workflow
   */
  async execute(id, inputs) {
    const response = await api.post(`/workflows/${id}/execute`, { inputs });
    return response.data;
  },
  
  /**
   * Get workflow steps
   */
  async getSteps(workflowId) {
    const response = await api.get(`/workflows/${workflowId}/steps`);
    return response.data;
  },
  
  /**
   * Save workflow state
   */
  async saveState(id, state) {
    const response = await api.post(`/workflows/${id}/state`, state);
    return response.data;
  },
  
  /**
   * Get workflow state
   */
  async getState(id) {
    const response = await api.get(`/workflows/${id}/state`);
    return response.data;
  },
  
  /**
   * Get available nodes
   */
  async getAvailableNodes() {
    const response = await api.get('/workflow-nodes');
    return response.data;
  },
  
  /**
   * Get examples
   */
  async getExamples() {
    const response = await api.get('/workflow-examples');
    return response.data;
  },
};

export default workflowsService;
