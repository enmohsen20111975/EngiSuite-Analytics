/**
 * Canvas Routes
 * Converted from Python FastAPI canvas router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/canvas
 * List user's canvas states
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

    const canvases = await prisma.canvasState.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: canvases,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/canvas
 * Save canvas state
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { name, type, data, thumbnail, isPublic } = req.body;

    if (!name || !type || !data) {
      throw new ValidationError('Name, type, and data are required');
    }

    const canvas = await prisma.canvasState.create({
      data: {
        userId,
        name,
        type,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        thumbnail,
        isPublic: isPublic || false,
      },
    });

    res.status(201).json({
      success: true,
      data: canvas,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/canvas/:id
 * Get canvas by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    const canvas = await prisma.canvasState.findFirst({
      where: { id },
    });

    if (!canvas) {
      throw new NotFoundError('Canvas not found');
    }

    res.json({
      success: true,
      data: canvas,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/canvas/:id
 * Update canvas state
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, data, thumbnail, isPublic } = req.body;

    const canvas = await prisma.canvasState.update({
      where: { id },
      data: {
        name,
        data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
        thumbnail,
        isPublic,
      },
    });

    res.json({
      success: true,
      data: canvas,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/canvas/:id
 * Delete canvas
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) =>{
  try{
    const id = parseInt(req.params.id, 10);

    await prisma.canvasState.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Canvas deleted successfully',
    });
  } catch (error){
    next(error);
  }
});

export default router;
