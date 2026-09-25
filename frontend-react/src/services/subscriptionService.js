import apiClient from './apiClient';

/**
 * Subscription and credits management service
 * Supports both Stripe and Paymob payment gateways
 */
export const subscriptionService = {
  // ==================== SUBSCRIPTION PLANS ====================
  
  /**
   * Get all available subscription plans
   */
  async getPlans() {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Get current subscription
   */
  async getCurrentSubscription() {
    const response = await apiClient.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Subscribe to a plan
   */
  async subscribe(planId, paymentMethodId) {
    const response = await apiClient.post('/subscriptions/subscribe', {
      plan_id: planId,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  /**
   * Upgrade subscription
   */
  async upgrade(planId) {
    const response = await apiClient.post('/subscriptions/upgrade', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Downgrade subscription
   */
  async downgrade(planId) {
    const response = await apiClient.post('/subscriptions/downgrade', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  async cancel(reason = '') {
    const response = await apiClient.post('/subscriptions/cancel', { reason });
    return response.data;
  },

  /**
   * Reactivate cancelled subscription
   */
  async reactivate() {
    const response = await apiClient.post('/subscriptions/reactivate');
    return response.data;
  },

  /**
   * Get subscription history
   */
  async getHistory(params = {}) {
    const response = await apiClient.get('/subscriptions/history', { params });
    return response.data;
  },

  // ==================== CREDITS ====================
  
  /**
   * Get current credit balance
   */
  async getCreditBalance() {
    const response = await apiClient.get('/credits/balance');
    return response.data;
  },

  /**
   * Get credit usage history
   */
  async getCreditHistory(params = {}) {
    const response = await apiClient.get('/credits/history', { params });
    return response.data;
  },

  /**
   * Purchase credits
   */
  async purchaseCredits(amount, paymentMethodId) {
    const response = await apiClient.post('/credits/purchase', {
      amount,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  /**
   * Use credits for a feature
   */
  async useCredits(amount, feature, description = '') {
    const response = await apiClient.post('/credits/use', {
      amount,
      feature,
      description,
    });
    return response.data;
  },

  /**
   * Get credit packages available for purchase
   */
  async getCreditPackages() {
    const response = await apiClient.get('/credits/packages');
    return response.data;
  },

  // ==================== PAYMENTS ====================
  
  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  },

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethodData) {
    const response = await apiClient.post('/payments/methods', paymentMethodData);
    return response.data;
  },

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId) {
    const response = await apiClient.delete(`/payments/methods/${methodId}`);
    return response.data;
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId) {
    const response = await apiClient.put(`/payments/methods/${methodId}/default`);
    return response.data;
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(params = {}) {
    const response = await apiClient.get('/payments/history', { params });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId) {
    const response = await apiClient.get(`/payments/invoices/${invoiceId}`);
    return response.data;
  },

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceId) {
    const response = await apiClient.get(`/payments/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ==================== STRIPE ====================
  
  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(planId) {
    const response = await apiClient.post('/payments/stripe/checkout', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Create Stripe portal session
   */
  async createPortalSession() {
    const response = await apiClient.post('/payments/stripe/portal');
    return response.data;
  },

  /**
   * Setup Stripe payment method
   */
  async setupPaymentMethod() {
    const response = await apiClient.post('/payments/stripe/setup');
    return response.data;
  },

  // ==================== PAYMOB (Egypt) ====================
  
  /**
   * Get Paymob configuration
   */
  async getPaymobConfig() {
    const response = await apiClient.get('/payments/paymob/config');
    return response.data;
  },

  /**
   * Initiate Paymob payment for subscription
   */
  async initiatePaymobPayment(tier, billingCycle, billingData) {
    const response = await apiClient.post('/payments/paymob/initiate', {
      tier,
      billingCycle,
      billingData,
    });
    return response.data;
  },

  /**
   * Get Paymob payment key (legacy method)
   */
  async getPaymobPaymentKey(amount, planId = null) {
    const response = await apiClient.post('/payments/paymob/key', {
      amount,
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Process Paymob payment
   */
  async processPaymobPayment(paymentData) {
    const response = await apiClient.post('/payments/paymob/process', paymentData);
    return response.data;
  },

  /**
   * Create subscription with Paymob
   */
  async createSubscriptionWithPaymob(tier, billingCycle, billingData) {
    const response = await apiClient.post('/payments/create-subscription', {
      tier,
      billingCycle,
      paymentMethod: 'paymob',
      currency: 'EGP',
      billingData,
    });
    return response.data;
  },

  // ==================== USAGE & ANALYTICS ====================
  
  /**
   * Get usage statistics
   */
  async getUsageStats(period = 'month') {
    const response = await apiClient.get('/subscriptions/usage', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get feature usage breakdown
   */
  async getFeatureUsage(params = {}) {
    const response = await apiClient.get('/subscriptions/usage/features', { params });
    return response.data;
  },

  // ==================== COUPONS & PROMOTIONS ====================
  
  /**
   * Validate coupon code
   */
  async validateCoupon(code) {
    const response = await apiClient.post('/coupons/validate', { code });
    return response.data;
  },

  /**
   * Apply coupon to subscription
   */
  async applyCoupon(code) {
    const response = await apiClient.post('/coupons/apply', { code });
    return response.data;
  },

  /**
   * Get available promotions
   */
  async getPromotions() {
    const response = await apiClient.get('/promotions');
    return response.data;
  },
};

export default subscriptionService;
