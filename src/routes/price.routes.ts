/**
 * Price Routes
 * Converted from Python FastAPI prices router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';

const router = Router();

/**
 * GET /api/prices
 * Get all pricing configurations
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prices = await prisma.priceConfig.findMany({
      where: { isActive: true },
      orderBy: [{ service: 'asc' }, { tier: 'asc' }],
    });

    res.json({
      success: true,
      data: prices.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prices/:service
 * Get prices for a specific service
 */
router.get('/:service', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = req.params.service as string;

    const prices = await prisma.priceConfig.findMany({
      where: { service, isActive: true },
      orderBy: { tier: 'asc' },
    });

    res.json({
      success: true,
      data: prices.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
