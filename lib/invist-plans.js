/**
 * Invist Plans Configuration
 * Defines available subscription plans for Invist
 */

export const PLANS = {
  'invist-basic': {
    id: 'invist-basic',
    name: 'Invist - المقدمة',
    price: 299,
    currency: 'EGP',
    features: [
      'Basic investment tracking',
      'Portfolio overview',
      'Market data access',
      'Basic analytics'
    ]
  },
  'invist-pro': {
    id: 'invist-pro',
    name: 'Invist - الاحترافية',
    price: 149,
    currency: 'EGP',
    features: [
      'Advanced portfolio analytics',
      'Real-time market data',
      'Risk assessment tools',
      'Performance benchmarks',
      'Research reports'
    ]
  },
  'invist-enterprise': {
    id: 'invist-enterprise',
    name: 'Invist - مؤسسي',
    price: 499,
    currency: 'EGP',
    features: [
      'Everything in Pro',
      'Unlimited team access',
      'Custom reporting',
      'API integration',
      'Dedicated account manager'
    ]
  },
  'invist-ultimate': {
    id: 'invist-ultimate',
    name: 'Invist - الأفضل',
    price: 999,
    currency: 'EGP',
    features: [
      'Everything in Enterprise',
      'Premium market insights',
      'Personal advisory service',
      'White-label solutions',
      '24/7 premium support'
    ]
  }
};
