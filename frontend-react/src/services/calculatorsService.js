import { api } from './apiClient';

/**
 * Calculators Service
 * Handles all calculator-related API calls
 */
export const calculatorsService = {
  /**
   * Get all calculators (basic list)
   */
  async getAll() {
    const response = await api.get('/calculators/');
    return response.data;
  },
  
  /**
   * Get equations catalog with full details (inputs, outputs)
   * This is the preferred endpoint for loading calculators
   */
  async getCatalog(params = {}) {
    const response = await api.get('/calculators/equations/catalog', params);
    return response.data;
  },
  
  /**
   * Get calculators by category
   */
  async getByCategory(category) {
    const response = await api.get(`/calculators/${category}`);
    return response.data;
  },
  
  /**
   * Get calculator by ID
   */
  async getById(id) {
    const response = await api.get(`/calculators/${id}`);
    return response.data;
  },
  
  /**
   * Perform calculation using dynamic executor
   * @param equationId - The equation ID (e.g., 'electrical_ohms_law')
   * @param inputs - Object with input values
   */
  async calculate(equationId, inputs) {
    // Use the demo endpoint for unauthenticated users
    // or the regular endpoint for authenticated users
    const token = localStorage.getItem('token');
    const endpoint = token 
      ? `/calculators/${equationId}/calculate`
      : `/calculators/demo/${equationId}/calculate`;
    
    const response = await api.post(endpoint, {
      inputs: inputs
    });
    return response.data;
  },
  
  /**
   * Perform engineering calculation
   */
  async engineeringCalculate(calculationType, parameters) {
    const response = await api.post('/calculators/engineering/calculate', {
      calculation_type: calculationType,
      parameters: parameters
    });
    return response.data;
  },
  
  /**
   * Get equation categories
   */
  async getCategories() {
    const response = await api.get('/equation-categories');
    return response.data;
  },
  
  /**
   * Get equations by category
   */
  async getEquationsByCategory(category) {
    const response = await api.get(`/equations/category/${category}`);
    return response.data;
  },
  
  /**
   * Search equations
   */
  async searchEquations(query) {
    const response = await api.get('/calculators/equations/catalog', { search: query });
    return response.data;
  },
  
  /**
   * Get calculator init status
   */
  async getInitStatus() {
    const response = await api.get('/calculators/init');
    return response.data;
  },
};

// Category metadata (matching existing frontend)
export const CATEGORY_META = {
  electrical: { icon: 'Zap', color: '#f39c12', label: 'Electrical' },
  mechanical: { icon: 'Cog', color: '#3498db', label: 'Mechanical' },
  civil: { icon: 'Building2', color: '#2ecc71', label: 'Civil' },
  mathematics: { icon: 'Calculator', color: '#9b59b6', label: 'Mathematics' },
};

export default calculatorsService;
