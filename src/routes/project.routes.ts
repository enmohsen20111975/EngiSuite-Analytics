/**
 * Project Routes
 * Uses Prisma with users database for project management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/projects/templates
 * List project templates (MUST come before /:id)
 */
router.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.projectTemplate.findMany({
      where: { isPublic: true },
      orderBy: { name: 'asc' },
    });

    // Return data directly for frontend compatibility
    res.json(templates);
  } catch (error) {
    // If table doesn't exist, return empty array
    console.error('Project templates error:', error);
    res.json([]);
  }
});

/**
 * GET /api/projects/dashboard/widgets
 * Get dashboard widgets for projects
 */
router.get('/dashboard/widgets', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Return sample widgets - return data directly for frontend compatibility
    res.json([
      { id: 1, type: 'recent_projects', title: 'Recent Projects', position: 1 },
      { id: 2, type: 'active_tasks', title: 'Active Tasks', position: 2 },
      { id: 3, type: 'team_activity', title: 'Team Activity', position: 3 },
    ]);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects
 * List user's projects
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return data directly for frontend compatibility
    res.json(projects);
  } catch (error) {
    // If table doesn't exist, return empty array
    console.error('Projects error:', error);
    res.json([]);
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { name, description, startDate, endDate, budget, templateId } = req.body;

    if (!name) {
      throw new ValidationError('Project name is required');
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget,
        members: {
          create: { userId, role: 'owner' },
        },
      },
      include: {
        members: true,
      },
    });

    // Return data directly for frontend compatibility
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    const project = await prisma.project.findFirst({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        templates: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Return data directly for frontend compatibility
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { name, description, status, startDate, endDate, budget } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget,
      },
    });

    // Return data directly for frontend compatibility
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    await prisma.project.delete({
      where: { id },
    });

    // Return data directly for frontend compatibility
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
