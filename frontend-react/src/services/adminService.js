import apiClient from './apiClient';

/**
 * Admin service for administrative operations
 */
export const adminService = {
  // ==================== DASHBOARD ====================
  
  /**
   * Get admin dashboard statistics
   */
  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  /**
   * Get system health status
   */
  async getSystemHealth() {
    const response = await apiClient.get('/admin/health');
    return response.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 50) {
    const response = await apiClient.get('/admin/activity', { params: { limit } });
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================
  
  /**
   * Get all users
   */
  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUser(userId) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(userId, data) {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Suspend user
   */
  async suspendUser(userId, reason) {
    const response = await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  /**
   * Activate user
   */
  async activateUser(userId) {
    const response = await apiClient.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  /**
   * Impersonate user (get token)
   */
  async impersonateUser(userId) {
    const response = await apiClient.post(`/admin/users/${userId}/impersonate`);
    return response.data;
  },

  // ==================== EQUATION MANAGEMENT ====================
  
  /**
   * Get all equations (admin view)
   */
  async getEquations(params = {}) {
    const response = await apiClient.get('/admin/equations', { params });
    return response.data;
  },

  /**
   * Create equation
   */
  async createEquation(data) {
    const response = await apiClient.post('/admin/equations', data);
    return response.data;
  },

  /**
   * Update equation
   */
  async updateEquation(equationId, data) {
    const response = await apiClient.put(`/admin/equations/${equationId}`, data);
    return response.data;
  },

  /**
   * Delete equation
   */
  async deleteEquation(equationId) {
    const response = await apiClient.delete(`/admin/equations/${equationId}`);
    return response.data;
  },

  /**
   * Import equations from file
   */
  async importEquations(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/admin/equations/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Export equations
   */
  async exportEquations(format = 'json') {
    const response = await apiClient.get('/admin/equations/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // ==================== CALCULATOR MANAGEMENT ====================
  
  /**
   * Get all calculators (admin view)
   */
  async getCalculators(params = {}) {
    const response = await apiClient.get('/admin/calculators', { params });
    return response.data;
  },

  /**
   * Create calculator
   */
  async createCalculator(data) {
    const response = await apiClient.post('/admin/calculators', data);
    return response.data;
  },

  /**
   * Update calculator
   */
  async updateCalculator(calculatorId, data) {
    const response = await apiClient.put(`/admin/calculators/${calculatorId}`, data);
    return response.data;
  },

  /**
   * Delete calculator
   */
  async deleteCalculator(calculatorId) {
    const response = await apiClient.delete(`/admin/calculators/${calculatorId}`);
    return response.data;
  },

  // ==================== AI MANAGEMENT ====================
  
  /**
   * Get AI usage statistics
   */
  async getAIStats() {
    const response = await apiClient.get('/admin/ai/stats');
    return response.data;
  },

  /**
   * Get AI conversations
   */
  async getAIConversations(params = {}) {
    const response = await apiClient.get('/admin/ai/conversations', { params });
    return response.data;
  },

  /**
   * Update AI configuration
   */
  async updateAIConfig(config) {
    const response = await apiClient.put('/admin/ai/config', config);
    return response.data;
  },

  /**
   * Get AI configuration
   */
  async getAIConfig() {
    const response = await apiClient.get('/admin/ai/config');
    return response.data;
  },

  // ==================== FINANCIAL ====================
  
  /**
   * Get financial overview
   */
  async getFinancialOverview(period = 'month') {
    const response = await apiClient.get('/admin/financial/overview', { params: { period } });
    return response.data;
  },

  /**
   * Get revenue data
   */
  async getRevenue(period = 'year') {
    const response = await apiClient.get('/admin/financial/revenue', { params: { period } });
    return response.data;
  },

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    const response = await apiClient.get('/admin/financial/subscriptions');
    return response.data;
  },

  /**
   * Get transactions
   */
  async getTransactions(params = {}) {
    const response = await apiClient.get('/admin/financial/transactions', { params });
    return response.data;
  },

  /**
   * Refund transaction
   */
  async refundTransaction(transactionId, reason) {
    const response = await apiClient.post(`/admin/financial/transactions/${transactionId}/refund`, { reason });
    return response.data;
  },

  // ==================== PRICES ====================
  
  /**
   * Get all prices
   */
  async getPrices() {
    const response = await apiClient.get('/admin/prices');
    return response.data;
  },

  /**
   * Update price
   */
  async updatePrice(priceId, data) {
    const response = await apiClient.put(`/admin/prices/${priceId}`, data);
    return response.data;
  },

  /**
   * Create price
   */
  async createPrice(data) {
    const response = await apiClient.post('/admin/prices', data);
    return response.data;
  },

  /**
   * Delete price
   */
  async deletePrice(priceId) {
    const response = await apiClient.delete(`/admin/prices/${priceId}`);
    return response.data;
  },

  // ==================== SETTINGS ====================
  
  /**
   * Get system settings
   */
  async getSettings() {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  /**
   * Update system settings
   */
  async updateSettings(settings) {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  },

  /**
   * Get feature flags
   */
  async getFeatureFlags() {
    const response = await apiClient.get('/admin/settings/features');
    return response.data;
  },

  /**
   * Update feature flag
   */
  async updateFeatureFlag(flag, enabled) {
    const response = await apiClient.put(`/admin/settings/features/${flag}`, { enabled });
    return response.data;
  },

  // ==================== SYSTEM ====================
  
  /**
   * Get system logs
   */
  async getLogs(params = {}) {
    const response = await apiClient.get('/admin/system/logs', { params });
    return response.data;
  },

  /**
   * Clear cache
   */
  async clearCache(cacheType = 'all') {
    const response = await apiClient.post('/admin/system/cache/clear', { type: cacheType });
    return response.data;
  },

  /**
   * Get system metrics
   */
  async getMetrics() {
    const response = await apiClient.get('/admin/system/metrics');
    return response.data;
  },

  /**
   * Run database backup
   */
  async runBackup() {
    const response = await apiClient.post('/admin/system/backup');
    return response.data;
  },

  /**
   * Get backup history
   */
  async getBackupHistory() {
    const response = await apiClient.get('/admin/system/backup/history');
    return response.data;
  },

  /**
   * Send system announcement
   */
  async sendAnnouncement(message, target = 'all') {
    const response = await apiClient.post('/admin/system/announcement', { message, target });
    return response.data;
  },

  /**
   * Restart services
   */
  async restartService(service) {
    const response = await apiClient.post(`/admin/system/restart/${service}`);
    return response.data;
  },
};

export default adminService;
