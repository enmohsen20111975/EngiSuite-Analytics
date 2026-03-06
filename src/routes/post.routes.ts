/**
 * Post Routes (Blog/Social)
 * Converted from Python FastAPI posts router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/posts
 * List published posts
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tag, limit = '20', offset = '0' } = req.query;

    const where: Record<string, unknown> = { status: 'published' };
    if (category) where.category = category;
    if (tag) where.tags = { contains: tag };

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/posts/:slug
 * Get post by slug
 */
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findFirst({
      where: { slug, status: 'published' },
      include: {
        author: { select: { id: true, name: true, company: true } },
        comments: {
          where: { isApproved: true },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/posts
 * Create a new post (admin only)
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorId = 1; // TODO: Get from auth middleware
    const { title, content, excerpt, category, tags, status = 'draft' } = req.body;

    if (!title || !content) {
      throw new ValidationError('Title and content are required');
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const post = await prisma.post.create({
      data: {
        authorId,
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        status,
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/posts/:id/comments
 * Add comment to post
 */
router.post('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = 1; // TODO: Get from auth middleware
    const { content, parentId } = req.body;

    if (!content) {
      throw new ValidationError('Comment content is required');
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId: parentId ? parseInt(parentId, 10) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
