import { api } from './apiClient';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */
export const analyticsService = {
  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  /**
   * Get usage statistics
   */
  async getUsageStats(period = '30d') {
    const response = await api.get('/analytics/usage', { params: { period } });
    return response.data;
  },
  
  /**
   * Get calculation history
   */
  async getCalculationHistory(params = {}) {
    const response = await api.get('/analytics/calculations', { params });
    return response.data;
  },
  
  /**
   * Get popular calculations
   */
  async getPopularCalculations(limit = 10) {
    const response = await api.get('/analytics/popular', { params: { limit } });
    return response.data;
  },
  
  /**
   * Get user activity
   */
  async getUserActivity(userId) {
    const response = await api.get(`/analytics/users/${userId}/activity`);
    return response.data;
  },
  
  /**
   * Get team analytics
   */
  async getTeamAnalytics() {
    const response = await api.get('/analytics/team');
    return response.data;
  },
  
  /**
   * Export analytics report
   */
  async exportReport(format = 'pdf') {
    const response = await api.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService;
