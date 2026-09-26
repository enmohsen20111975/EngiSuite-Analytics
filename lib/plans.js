/**
 * Plans Configuration
 * Defines available subscription plans for EngiSuite
 */

export const PLANS = {
  'engsuite-basic': {
    id: 'engsuite-basic',
    name: 'Engineering Suite - Basic',
    price: 99,
    currency: 'EGP',
    features: [
      'Basic equation solvers',
      'Pipeline calculations (5/day)',
      'Standard scientific tools',
      'Basic workflow support'
    ]
  },
  'engsuite-pro': {
    id: 'engsuite-pro',
    name: 'Engineering Suite - Professional',
    price: 199,
    currency: 'EGP',
    features: [
      'All equation solvers',
      'Unlimited pipeline calculations',
      'Advanced scientific workspace',
      'Priority workflow support',
      'API access'
    ]
  },
  'engsuite-enterprise': {
    id: 'engsuite-enterprise',
    name: 'Engineering Suite - Enterprise',
    price: 399,
    currency: 'EGP',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'On-premise deployment option',
      'SLA guarantee'
    ]
  }
};
