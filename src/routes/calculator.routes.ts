/**
 * Calculator Routes — Prisma-based (replaces sql.js version).
 * Serves the 455 engineering equations as calculators.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError } from '../middleware/error.middleware.js';

const router = Router();

/** GET /api/calculators — list all calculators (equations) grouped by category */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const equations = await prisma.equation.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    // Group by category
    const groups: Record<string, any[]> = {};
    for (const eq of equations) {
      const catName = eq.category?.name || 'General';
      if (!groups[catName]) groups[catName] = [];
      const vars = eq.variables ? JSON.parse(eq.variables) : {};
      groups[catName].push({
        id: eq.slug, name: eq.name, description: eq.description,
        formula: eq.formula, domain: eq.domain || 'general',
        difficulty: eq.difficulty,
        inputs: vars.inputs || [], outputs: vars.outputs || [],
      });
    }
    const categories = Object.entries(groups).map(([name, items]) => ({ name, count: items.length, items }));
    res.json({ success: true, data: { total: equations.length, categories } });
  } catch (e: any) { next(e); }
});

/** GET /api/calculators/equations/catalog — full equation catalog with inputs/outputs */
router.get('/equations/catalog', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestedLimit = parseInt(String(req.query.limit ?? '5000'), 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 10000) : 5000;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const domain = typeof req.query.domain === 'string' ? req.query.domain.trim() : '';

    const equations = await prisma.equation.findMany({
      where: {
        isActive: true,
        ...(domain ? { domain } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { formula: { contains: search } },
                { slug: { contains: search } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: limit,
    });

    const items = equations.map((eq: any) => {
      const variables = eq.variables ? JSON.parse(eq.variables) : {};
      return {
        id: eq.slug,
        equation_id: eq.slug,
        name: eq.name,
        slug: eq.slug,
        description: eq.description,
        equation: eq.formula,
        formula: eq.formula,
        domain: eq.domain || 'general',
        category: eq.category?.name || null,
        category_id: eq.categoryId ?? null,
        subcategory: eq.category?.name || null,
        difficulty: eq.difficulty,
        tags: eq.tags ? JSON.parse(eq.tags) : [],
        inputs: variables.inputs || [],
        outputs: variables.outputs || [],
      };
    });

    res.json({ success: true, count: items.length, equations: items, items });
  } catch (e: any) { next(e); }
});

/** GET /api/calculators/:id — get one calculator */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({
      where: { slug: String(req.params.id) },
      include: { category: true },
    });
    if (!eq) return next(new NotFoundError('Calculator not found'));
    const vars = eq.variables ? JSON.parse(eq.variables) : {};
    res.json({
      success: true,
      data: {
        id: eq.slug, name: eq.name, description: eq.description,
        formula: eq.formula, domain: eq.domain || 'general',
        category: (eq as any).category?.name || null, difficulty: eq.difficulty,
        inputs: vars.inputs || [], outputs: vars.outputs || [],
      },
    });
  } catch (e: any) { next(e); }
});

/** POST /api/calculators/:id — execute a calculation */
router.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({ where: { slug: String(req.params.id) } });
    if (!eq) return next(new NotFoundError('Calculator not found'));
    const inputs = req.body?.inputs || req.body || {};
    const formula = eq.formula;
    const outputMatch = formula.match(/^(\w+)\s*=/);
    const outputVar = outputMatch ? outputMatch[1] : 'result';
    const expr = formula.substring(formula.indexOf('=') + 1).trim();
    const vars: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) vars[k] = Number(v) || 0;
    const fn = new Function(...Object.keys(vars), `"use strict"; return (${expr})`);
    const result = fn(...Object.values(vars));
    const vars2 = eq.variables ? JSON.parse(eq.variables) : {};
    const outputMeta = (vars2.outputs?.[0]) || {};
    res.json({
      success: true,
      data: {
        equation: eq.name, formula,
        inputs: vars,
        result: { [outputVar]: result },
        unit: outputMeta.unit || '',
        description: outputMeta.description || '',
      },
    });
  } catch (e: any) { next(e); }
});

export default router;
