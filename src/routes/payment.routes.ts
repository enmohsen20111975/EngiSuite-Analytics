/**
 * Payment Routes
 * Converted from Python FastAPI payments router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

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
 * POST /api/payments/create-subscription
 * Create a subscription payment
 */
router.post('/create-subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, billingCycle, paymentMethod, currency = 'USD' } = req.body;
    const userId = 1; // TODO: Get from auth middleware

    if (!tier || !billingCycle || !paymentMethod) {
      throw new ValidationError('Tier, billing cycle, and payment method are required');
    }

    const price = TIER_PRICES[tier]?.[currency]?.[billingCycle];
    if (!price) {
      throw new ValidationError('Invalid tier or currency');
    }

    // Create payment based on provider
    if (paymentMethod === 'stripe') {
      // TODO: Implement Stripe checkout
      res.json({
        success: true,
        data: {
          subscriptionId: `sub_${Date.now()}`,
          tier,
          status: 'pending',
          amount: price,
          currency,
          paymentUrl: 'https://checkout.stripe.com/mock',
        },
      });
    } else if (paymentMethod === 'paymob') {
      // TODO: Implement Paymob checkout
      res.json({
        success: true,
        data: {
          subscriptionId: `paymob_${Date.now()}`,
          tier,
          status: 'pending',
          amount: price,
          currency,
          paymentUrl: 'https://accept.paymob.com/mock',
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
 * Paymob webhook handler
 */
router.post('/webhook/paymob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // TODO: Verify webhook signature

    if (data.success) {
      // Update user subscription
      // await prisma.user.update({...})
      console.log('Paymob payment completed:', data.id);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/history
 * Get payment history for user
 */
router.get('/history', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

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
router.post('/cancel', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

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

export default router;
