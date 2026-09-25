/**
 * Payment Routes - Simplified for Build
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();

// Price configuration
const TIER_PRICES: Record<string, Record<string, { monthly: number; yearly: number }>> = {
  starter: { USD: { monthly: 9.99, yearly: 99.99 }, EGP: { monthly: 299, yearly: 2999 } },
  pro: { USD: { monthly: 29.99, yearly: 299.99 }, EGP: { monthly: 899, yearly: 8999 } },
  enterprise: { USD: { monthly: 99.99, yearly: 999.99 }, EGP: { monthly: 2999, yearly: 29999 } },
};

const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';

// GET /api/payments/prices
router.get('/prices', (_req: Request, res: Response) => {
  res.json({ success: true, data: TIER_PRICES });
});

// GET /api/payments/methods
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

// POST /api/payments/create-subscription
router.post('/create-subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, billingCycle, paymentMethod, currency = 'USD' } = req.body;
    const userId = (req as any).user?.id || 1;

    if (!tier || !billingCycle || !paymentMethod) {
      throw new ValidationError('Tier, billing cycle, and payment method are required');
    }

    const price = (TIER_PRICES as any)[tier]?.[currency]?.[billingCycle];
    if (!price) throw new ValidationError('Invalid tier or currency');

    const subscription = await prisma.subscriptionHistory.create({
      data: { userId, tier, action: 'created', amount: price, currency },
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        tier,
        status: 'pending',
        amount: price,
        currency,
        paymentUrl: 'https://checkout.example.com/mock',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/paymob/callback
router.post('/paymob/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const isSuccess = data.success === true;
    
    if (isSuccess) {
      const orderId = data.order?.id || data.order_id;
      const transactionId = data.id;
      
      const subscription = await prisma.subscriptionHistory.findFirst({
        where: { action: 'created', transactionId: String(orderId) },
        orderBy: { createdAt: 'desc' },
      });

      if (subscription) {
        await prisma.subscriptionHistory.update({
          where: { id: subscription.id },
          data: { action: 'completed', transactionId: String(transactionId) },
        });
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { tier: subscription.tier, subscriptionStatus: 'active' },
        });
      }
    }
    res.json({ received: true, success: isSuccess });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/webhook/stripe
router.post('/webhook/stripe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = req.body;
    if (event.type === 'checkout.session.completed') {
      console.log('Stripe payment completed:', event.data?.object?.id);
    }
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/webhook/paymob
router.post('/webhook/paymob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    res.json({ received: true, success: data.success === true });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/history
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;
    const history = await prisma.subscriptionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/cancel
router.post('/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'cancelled', tier: 'free' },
    });
    await prisma.subscriptionHistory.create({
      data: { userId, tier: 'free', action: 'cancelled' },
    });
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/paymob/config
router.get('/paymob/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      publicKey: process.env.PAYMOB_PUBLIC_KEY || '',
      iframeId: PAYMOB_IFRAME_ID,
      integrationId: PAYMOB_INTEGRATION_ID,
    },
  });
});

export default router;
