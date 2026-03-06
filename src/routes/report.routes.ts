/**
 * Report Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/reports
 * List user's generated reports
 */
router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

    const reports = await prisma.generatedReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Reports error:', error);
    res.json([]);
  }
});

/**
 * GET /api/reports/templates
 * Get report templates
 */
router.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([
      { id: 1, name: 'Voltage Drop Analysis', type: 'pdf', description: 'Standard voltage drop report template' },
      { id: 2, name: 'Cable Sizing Report', type: 'excel', description: 'Cable sizing calculation report' },
      { id: 3, name: 'Load Flow Analysis', type: 'pdf', description: 'Load flow analysis report template' },
    ]);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id
 * Get report by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    const report = await prisma.generatedReport.findFirst({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports
 * Create a new report
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { title, reportType, content, projectId } = req.body;

    const report = await prisma.generatedReport.create({
      data: {
        userId,
        title,
        reportType,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        projectId,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    await prisma.generatedReport.delete({ where: { id } });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
