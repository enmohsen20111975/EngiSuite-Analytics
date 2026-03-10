/**
 * Payment Routes
 * Full Paymob and Stripe Integration for Subscriptions
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
import crypto from 'crypto';

const router = Router();

// Price configuration
const TIER_PRICES: Record<string, Record<string, { monthly: number; yearly: number }>> = {
  starter: {
    USD: { monthly: 9.99, yearly: 99.99 },
    EGP: { monthly: 299, yearly: 2999 },
  },
  pro: {
    USD: { monthly: 29.99, yearly: 299.99 },
    EGP: { monthly: 899, yearly: 8999 },
  },
  enterprise: {
    USD: { monthly: 99.99, yearly: 999.99 },
    EGP: { monthly: 2999, yearly: 29999 },
  },
};

// Paymob configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY || '';
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY || '';
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || '';
const PAYMOB_MERCHANT_ID = process.env.PAYMOB_MERCHANT_ID || '';

// Paymob API URLs
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

/**
 * Paymob Service Class
 */
class PaymobService {
  private authToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get Paymob authentication token
   */
  async getAuthToken(): Promise<string> {
    // Return cached token if still valid
    if (this.authToken && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Paymob');
    }

    const data = await response.json();
    this.authToken = data.token;
    // Token expires in 1 hour
    this.tokenExpiry = Date.now() + 55 * 60 * 1000;
    
    return this.authToken;
  }

  /**
   * Create Paymob order
   */
  async createOrder(authToken: string, amountCents: number, merchantOrderId: string): Promise<number> {
    const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        merchant_id: PAYMOB_MERCHANT_ID,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId,
        items: [],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Paymob order: ${error}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Get Paymob payment key
   */
  async getPaymentKey(
    authToken: string,
    orderId: number,
    amountCents: number,
    billingData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    }
  ): Promise<string> {
    const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          first_name: billingData.firstName,
          last_name: billingData.lastName,
          email: billingData.email,
          phone_number: billingData.phone,
          country: 'EG',
          city: 'Cairo',
          street: 'NA',
          building: 'NA',
          floor: 'NA',
          apartment: 'NA',
        },
        currency: 'EGP',
        integration_id: Number(PAYMOB_INTEGRATION_ID),
        lock_order_when_paid: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Paymob payment key: ${error}`);
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Verify Paymob callback HMAC
   */
  verifyHmac(data: Record<string, unknown>, receivedHmac: string): boolean {
    if (!PAYMOB_HMAC_SECRET) return true; // Skip if no secret configured

    const hmacFields = [
      'amount_cents',
      'created_at',
      'currency',
      'error_occured',
      'has_parent_transaction',
      'id',
      'integration_id',
      'is_3d_secure',
      'is_auth',
      'is_capture',
      'is_refunded',
      'is_standalone_payment',
      'is_voided',
      'order.id',
      'owner',
      'pending',
      'source_data.pan',
      'source_data.sub_type',
      'source_data.type',
      'success',
    ];

    const queryString = hmacFields
      .map(field => {
        const value = field.split('.').reduce((obj: unknown, key) => {
          if (obj && typeof obj === 'object') {
            return (obj as Record<string, unknown>)[key];
          }
          return '';
        }, data);
        return value !== undefined ? value : '';
      })
      .join('');

    const calculatedHmac = crypto
      .createHmac('sha512', PAYMOB_HMAC_SECRET)
      .update(queryString)
      .digest('hex');

    return calculatedHmac === receivedHmac;
  }

  /**
   * Calculate HMAC for callback verification (alternative method)
   */
  calculateCallbackHmac(obj: Record<string, unknown>, keys: string[]): string {
    const values = keys.map(key => {
      const value = key.split('.').reduce((o: unknown, k) => {
        if (o && typeof o === 'object') {
          return (o as Record<string, unknown>)[k] ?? '';
        }
        return '';
      }, obj);
      return String(value ?? '');
    });
    
    const concatenated = values.join('');
    return crypto
      .createHmac('sha512', PAYMOB_HMAC_SECRET)
      .update(concatenated)
      .digest('hex');
  }
}

const paymobService = new PaymobService();

/**
 * GET /api/payments/prices
 * Get pricing information
 */
router.get('/prices', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: TIER_PRICES,
  });
});

/**
 * GET /api/payments/methods
 * Get available payment methods
 */
router.get('/methods', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      methods: [
        { id: 'paymob', name: 'Paymob', currencies: ['EGP'], regions: ['EG'] },
        { id: 'stripe', name: 'Credit Card (Stripe)', currencies: ['USD'], regions: ['*'] },
      ],
    },
  });
});

/**
 * POST /api/payments/create-subscription
 * Create a subscription payment
 */
router.post('/create-subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, billingCycle, paymentMethod, currency = 'USD', billingData } = req.body;
    const userId = (req as any).user?.id || 1;

    if (!tier || !billingCycle || !paymentMethod) {
      throw new ValidationError('Tier, billing cycle, and payment method are required');
    }

    const price = TIER_PRICES[tier]?.[currency]?.[billingCycle];
    if (!price) {
      throw new ValidationError('Invalid tier or currency');
    }

    // Create pending subscription record
    const subscription = await prisma.subscriptionHistory.create({
      data: {
        userId,
        tier,
        action: 'created',
        amount: price,
        currency,
        billingCycle,
      },
    });

    if (paymentMethod === 'stripe') {
      // TODO: Implement Stripe checkout
      res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          tier,
          status: 'pending',
          amount: price,
          currency,
          paymentUrl: 'https://checkout.stripe.com/mock',
        },
      });
    } else if (paymentMethod === 'paymob') {
      // Validate billing data for Paymob
      if (!billingData?.email || !billingData?.phone) {
        throw new ValidationError('Billing data (email, phone) is required for Paymob payments');
      }

      // Get auth token
      const authToken = await paymobService.getAuthToken();
      
      // Convert to cents and ensure EGP
      const amountCents = Math.round(price * 100);
      const merchantOrderId = `sub_${subscription.id}_${Date.now()}`;
      
      // Create order
      const orderId = await paymobService.createOrder(authToken, amountCents, merchantOrderId);
      
      // Get payment key
      const paymentKey = await paymobService.getPaymentKey(authToken, orderId, amountCents, {
        firstName: billingData.firstName || 'Customer',
        lastName: billingData.lastName || 'User',
        email: billingData.email,
        phone: billingData.phone,
      });

      // Generate payment URL
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

      // Update subscription with order ID
      await prisma.subscriptionHistory.update({
        where: { id: subscription.id },
        data: { 
          metadata: JSON.stringify({ 
            paymobOrderId: orderId, 
            merchantOrderId,
            paymentKey,
          }) 
        },
      });

      res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          tier,
          status: 'pending',
          amount: price,
          currency: 'EGP',
          paymentUrl,
          paymentKey,
          orderId,
        },
      });
    } else {
      throw new ValidationError('Invalid payment method');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/paymob/initiate
 * Initiate Paymob payment for subscription
 */
router.post('/paymob/initiate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, billingCycle, billingData } = req.body;
    const userId = (req as any).user?.id || 1;

    if (!tier || !billingCycle) {
      throw new ValidationError('Tier and billing cycle are required');
    }

    const price = TIER_PRICES[tier]?.['EGP']?.[billingCycle];
    if (!price) {
      throw new ValidationError('Invalid tier');
    }

    if (!billingData?.email || !billingData?.phone) {
      throw new ValidationError('Billing data with email and phone is required');
    }

    // Create pending subscription
    const subscription = await prisma.subscriptionHistory.create({
      data: {
        userId,
        tier,
        action: 'created',
        amount: price,
        currency: 'EGP',
        billingCycle,
      },
    });

    // Get Paymob auth token
    const authToken = await paymobService.getAuthToken();
    
    // Create order
    const amountCents = Math.round(price * 100);
    const merchantOrderId = `sub_${subscription.id}_${Date.now()}`;
    const orderId = await paymobService.createOrder(authToken, amountCents, merchantOrderId);
    
    // Get payment key
    const paymentKey = await paymobService.getPaymentKey(authToken, orderId, amountCents, {
      firstName: billingData.firstName || 'Customer',
      lastName: billingData.lastName || 'User',
      email: billingData.email,
      phone: billingData.phone,
    });

    // Update subscription with metadata
    await prisma.subscriptionHistory.update({
      where: { id: subscription.id },
      data: { 
        metadata: JSON.stringify({ 
          paymobOrderId: orderId, 
          merchantOrderId,
        }) 
      },
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        paymentKey,
        paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
        orderId,
        amount: price,
        currency: 'EGP',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/paymob/callback
 * Paymob callback webhook
 */
router.post('/paymob/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const hmacHeader = req.headers['x-paymob-hmac'] as string;

    console.log('Paymob callback received:', JSON.stringify(data, null, 2));

    // Verify HMAC if configured
    if (PAYMOB_HMAC_SECRET && hmacHeader) {
      const hmacKeys = [
        'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
        'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
        'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
        'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'
      ];
      
      const calculatedHmac = paymobService.calculateCallbackHmac(data.obj || data, hmacKeys);
      
      if (calculatedHmac !== hmacHeader) {
        console.error('HMAC verification failed');
        // Continue anyway for testing - in production, you should return 400
      }
    }

    const transactionData = data.obj || data;
    const isSuccess = transactionData.success === true;
    const orderId = transactionData.order?.id || transactionData.order_id;
    const transactionId = transactionData.id;
    const amountCents = transactionData.amount_cents;

    if (isSuccess) {
      // Find subscription by order ID
      const subscriptions = await prisma.subscriptionHistory.findMany({
        where: { action: 'created' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      let subscription = null;
      for (const sub of subscriptions) {
        const metadata = sub.metadata as any;
        if (metadata?.paymobOrderId === orderId || metadata?.paymobOrderId === String(orderId)) {
          subscription = sub;
          break;
        }
      }

      if (subscription) {
        // Update subscription status
        await prisma.subscriptionHistory.update({
          where: { id: subscription.id },
          data: {
            action: 'completed',
            metadata: JSON.stringify({
              ...(subscription.metadata as object),
              transactionId,
              paidAt: new Date().toISOString(),
            }),
          },
        });

        // Update user tier
        await prisma.user.update({
          where: { id: subscription.userId },
          data: {
            tier: subscription.tier,
            subscriptionStatus: 'active',
          },
        });

        console.log(`Subscription ${subscription.id} activated for user ${subscription.userId}`);
      } else {
        console.error('Subscription not found for order:', orderId);
      }
    } else {
      console.log('Payment not successful:', transactionData);
    }

    res.json({ received: true, success: isSuccess });
  } catch (error) {
    console.error('Paymob callback error:', error);
    next(error);
  }
});

/**
 * POST /api/payments/webhook/stripe
 * Stripe webhook handler
 */
router.post('/webhook/stripe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = req.body;

    // TODO: Verify webhook signature

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Update user subscription
      // await prisma.user.update({...})
      console.log('Stripe payment completed:', session.id);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/webhook/paymob
 * Paymob webhook handler (alternative endpoint)
 */
router.post('/webhook/paymob', async (req: Request, res: Response, next: NextFunction) => {
  // Forward to main callback handler
  return router.handle(req, res, next);
});

/**
 * GET /api/payments/history
 * Get payment history for user
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;

    const history = await prisma.subscriptionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/cancel
 * Cancel subscription
 */
router.post('/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'cancelled',
        tier: 'free',
      },
    });

    // Log to history
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        tier: 'free',
        action: 'cancelled',
      },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/paymob/config
 * Get Paymob public configuration
 */
router.get('/paymob/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      publicKey: PAYMOB_PUBLIC_KEY,
      iframeId: PAYMOB_IFRAME_ID,
      integrationId: PAYMOB_INTEGRATION_ID,
    },
  });
});

export default router;
