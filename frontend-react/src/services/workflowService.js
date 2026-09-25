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
    const response = await api.get('/workflows/equations', { params });
    return response.data;
  },
  
  /**
   * Get equation by ID with inputs and outputs
   */
  async getEquation(id) {
    const response = await api.get(`/workflows/equations/${id}`);
    return response.data;
  },
  
  /**
   * Get equation categories
   */
  async getEquationCategories() {
    const response = await api.get('/workflows/equation-categories');
    return response.data;
  },
  
  /**
   * Calculate equation result
   */
  async calculateEquation(id, inputs) {
    const response = await api.post(`/workflows/equations/${id}/calculate`, { inputs });
    return response.data;
  },
  
  /**
   * Get calculation pipelines
   */
  async getPipelines() {
    const response = await api.get('/workflows/pipelines');
    return response.data;
  },
  
  /**
   * Get pipeline by ID with steps
   */
  async getPipeline(id) {
    const response = await api.get(`/workflows/pipelines/${id}`);
    return response.data;
  },
  
  /**
   * Execute calculation pipeline
   */
  async executePipeline(id, inputs) {
    const response = await api.post(`/workflows/pipelines/${id}/execute`, { inputs });
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
   * Execute workflow by ID
   */
  async executeById(id, inputs) {
    const response = await api.post(`/workflows/${id}/execute`, { inputs });
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
  
  /**
   * Get engineering standards
   */
  async getStandards() {
    const response = await api.get('/workflows/standards');
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
