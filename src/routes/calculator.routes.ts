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

/** GET /api/calculators/:id — get one calculator */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({
      where: { slug: req.params.id },
      include: { category: true },
    });
    if (!eq) return next(new NotFoundError('Calculator not found'));
    const vars = eq.variables ? JSON.parse(eq.variables) : {};
    res.json({
      success: true,
      data: {
        id: eq.slug, name: eq.name, description: eq.description,
        formula: eq.formula, domain: eq.domain || 'general',
        category: eq.category?.name || null, difficulty: eq.difficulty,
        inputs: vars.inputs || [], outputs: vars.outputs || [],
      },
    });
  } catch (e: any) { next(e); }
});

/** POST /api/calculators/:id — execute a calculation */
router.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({ where: { slug: req.params.id } });
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
