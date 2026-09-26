/**
 * Payment/JWT Generation Utilities
 * Generates signed JWT tokens for payment gateway integration
 * 
 * The SHARED_SECRET must match exactly between:
 * - m2y.net (central gateway)
 * - engsuite.m2y.net
 * - invist.m2y.net
 */

import jwt from 'jsonwebtoken';

const SHARED_SECRET = process.env.SHARED_SECRET;

if (!SHARED_SECRET) {
  console.warn('Warning: SHARED_SECRET is not set in environment variables');
}

/**
 * Generate a signed JWT token for payment gateway
 * 
 * @param {Object} params - Token payload parameters
 * @param {string} params.plan - Plan identifier (must match PLANS keys)
 * @param {string} params.source - Source application ('engsuite' or 'invist')
 * @param {number} params.user_id - User ID in the system
 * @param {'card'|'wallet'} params.payment_type - Payment method type
 * @param {string} params.return_success - Success redirect URL
 * @param {string} params.return_fail - Failure redirect URL
 * @returns {string} Signed JWT token
 */
export function generatePaymentToken({
  plan,
  source,
  user_id,
  payment_type,
  return_success,
  return_fail
}) {
  if (!SHARED_SECRET) {
    throw new Error('SHARED_SECRET is not configured. Please set it in .env.local');
  }

  const payload = {
    plan,
    source,
    amount: getPlanPrice(plan),
    user_id,
    payment_type,
    return_success,
    return_fail,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes expiry
  };

  return jwt.sign(payload, SHARED_SECRET, { algorithm: 'HS256' });
}

/**
 * Get plan price by plan ID
 * 
 * @param {string} planId - Plan identifier
 * @returns {number} Plan price in EGP
 */
function getPlanPrice(planId) {
  const plans = {
    'engsuite-basic': 99,
    'engsuite-pro': 199,
    'engsuite-enterprise': 399,
    'invist-basic': 299,
    'invist-pro': 149,
    'invist-enterprise': 499,
    'invist-ultimate': 999
  };

  const price = plans[planId];
  if (!price) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  return price;
}

/**
 * Verify a payment token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyPaymentToken(token) {
  if (!SHARED_SECRET) {
    throw new Error('SHARED_SECRET is not configured');
  }

  try {
    return jwt.verify(token, SHARED_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
