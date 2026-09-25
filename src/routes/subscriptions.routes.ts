/**
 * Subscriptions & Credits Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';

// ============================================================
// SUBSCRIPTION ROUTER  — mounted at /api/subscriptions
// ============================================================
export const subscriptionsRouter = Router();

subscriptionsRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'free',       name: 'Free',         price: 0,  priceEGP: 0,    period: 'forever' },
      { id: 'starter',    name: 'Starter',       price: 5,  priceEGP: 150,  period: 'month' },
      { id: 'pro',        name: 'Professional',  price: 8,  priceEGP: 240,  period: 'month' },
      { id: 'enterprise', name: 'Enterprise',    price: 15, priceEGP: 450,  period: 'month' },
    ],
  });
});

subscriptionsRouter.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
    });

    res.json({
      success: true,
      data: user ?? { tier: 'free', subscriptionStatus: 'active', subscriptionStartDate: null, subscriptionEndDate: null },
    });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const history = await prisma.subscriptionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.get('/usage', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { calculations: { used: 0, limit: 10 }, exports: { used: 0, limit: 0 } },
  });
});

subscriptionsRouter.get('/usage/features', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

// ============================================================
// CREDITS ROUTER  — mounted at /api/credits
// ============================================================
export const creditsRouter = Router();

creditsRouter.get('/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 1;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    const isPaid = !!user?.tier && user.tier !== 'free';

    res.json({
      success: true,
      data: { balance: isPaid ? null : 100, isPaid, tier: user?.tier || 'free' },
    });
  } catch (error) {
    next(error);
  }
});

creditsRouter.get('/history', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

creditsRouter.get('/packages', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'small',  credits: 50,   price: 4.99,  priceEGP: 150,  bonus: 0 },
      { id: 'medium', credits: 150,  price: 12.99, priceEGP: 390,  bonus: 15 },
      { id: 'large',  credits: 500,  price: 39.99, priceEGP: 1200, bonus: 75 },
      { id: 'xl',     credits: 1000, price: 74.99, priceEGP: 2250, bonus: 200 },
    ],
  });
});

creditsRouter.post('/purchase', (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Credit purchase initiated' } });
});

creditsRouter.post('/use', (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Credits used' } });
});

export default subscriptionsRouter;
