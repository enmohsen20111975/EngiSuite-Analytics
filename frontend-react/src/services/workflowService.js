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
// No blue / indigo / purple per project rules. Aligned with the shared
// service-palette (cyan/teal/emerald/amber/red/orange/gray).
export const DOMAIN_COLORS = {
  electrical: '#0891b2',   // cyan-600 (was #1976d2 — forbidden blue)
  mechanical: '#d97706',   // amber-600
  civil: '#059669',        // emerald-600
  hvac: '#dc2626',          // red-600
  hydraulics: '#0d9488',   // teal-600
  chemical: '#ea580c',     // orange-600
  mathematics: '#059669',  // emerald-600 (was #7b1fa2 — forbidden purple)
  science: '#0891b2',      // cyan-600 (was #7b1fa2 — forbidden purple)
  scientific: '#0891b2',   // alias of `science` (kept for legacy callers)
  general: '#6b7280',      // gray-500
};

export default workflowService;
