/**
 * Admin Routes
 * admin router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.middleware.js';

const router = Router();

// TODO: Add admin authentication middleware

/**
 * GET /api/admin/dashboard
 * Get admin dashboard stats
 */
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalCalculations,
      totalWorkflows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'active', tier: { not: 'free' } } }),
      prisma.calculationHistory.count(),
      prisma.workflow.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalCalculations,
        totalWorkflows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * List all users (paginated)
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', tier, status } = req.query;

    const where: Record<string, unknown> = {};
    if (tier) where.tier = tier;
    if (status) where.subscriptionStatus = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        subscriptionStatus: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
      skip: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/users/:id/tier
 * Update user tier
 */
router.put('/users/:id/tier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { tier } = req.body;

    if (!tier) {
      throw new ValidationError('Tier is required');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { tier },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/equations
 * List all equations for management
 */
router.get('/equations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const equations = await prisma.equation.findMany({
      include: {
        category: true,
        _count: { select: { inputs: true, outputs: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: equations,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/equations
 * Create new equation
 */
router.post('/equations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, formula, categoryId, inputs, outputs } = req.body;

    if (!name || !formula) {
      throw new ValidationError('Name and formula are required');
    }

    const equation = await prisma.equation.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        formula,
        categoryId,
        inputs: {
          create: inputs || [],
        },
        outputs: {
          create: outputs || [],
        },
      },
    });

    res.status(201).json({
      success: true,
      data: equation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/workflows
 * List all workflows for management
 */
router.get('/workflows', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        category: true,
        _count: { select: { inputs: true, outputs: true, steps: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
