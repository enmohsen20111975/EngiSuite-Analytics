/**
 * User Routes
 * Converted from Python FastAPI user router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError, UnauthorizedError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Get from auth middleware
    const userId = 1;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        signatures: true,
        _count: {
          select: {
            calculationHistory: true,
            workflowHistory: true,
            generatedReports: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        country: user.country,
        tier: user.tier,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        stats: user._count,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { name, phone, company, country, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        company,
        country,
        preferences: preferences ? JSON.stringify(preferences) : undefined,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/history
 * Get calculation history
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const limit = parseInt(req.query.limit as string || '50', 10);

    const history = await prisma.calculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
 * GET /api/users/reports
 * Get generated reports
 */
router.get('/reports', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

    const reports = await prisma.generatedReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
