/**
 * Equation Routes — Prisma-based (replaces sql.js version).
 * Serves the 455 engineering equations from the Prisma DB.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError } from '../middleware/error.middleware.js';

const router = Router();

/** GET /api/equations/stats — total count + by domain */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await prisma.equation.count({ where: { isActive: true } });
    const byDomainRaw = await prisma.equation.groupBy({
      by: ['domain'],
      where: { isActive: true },
      _count: { _all: true },
    });
    const byDomain = byDomainRaw.map((d: any) => ({ domain: d.domain || 'general', count: d._count._all }));
    const categories = await prisma.equationCategory.count();
    res.json({ success: true, data: { total, categories, byDomain } });
  } catch (e: any) { next(e); }
});

/** GET /api/equations — list equations (optional ?domain=electrical) */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = req.query.domain as string | undefined;
    const equations = await prisma.equation.findMany({
      where: { isActive: true, ...(domain ? { domain } : {}) },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: 200,
    });
    // Parse variables JSON for the response
    const result = equations.map((eq: any) => ({
      id: eq.slug,
      name: eq.name,
      description: eq.description,
      formula: eq.formula,
      domain: eq.domain || 'general',
      category: eq.category?.name || null,
      difficulty: eq.difficulty,
      tags: eq.tags ? JSON.parse(eq.tags) : [],
      inputs: eq.variables ? JSON.parse(eq.variables)?.inputs || [] : [],
      outputs: eq.variables ? JSON.parse(eq.variables)?.outputs || [] : [],
    }));
    res.json({ success: true, data: result });
  } catch (e: any) { next(e); }
});

/** GET /api/equations/:id — get one equation by slug */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({
      where: { slug: req.params.id },
      include: { category: true },
    });
    if (!eq) return next(new NotFoundError('Equation not found'));
    const vars = eq.variables ? JSON.parse(eq.variables) : {};
    res.json({
      success: true,
      data: {
        id: eq.slug, name: eq.name, description: eq.description,
        formula: eq.formula, domain: eq.domain || 'general',
        category: eq.category?.name || null, difficulty: eq.difficulty,
        tags: eq.tags ? JSON.parse(eq.tags) : [],
        inputs: vars.inputs || [],
        outputs: vars.outputs || [],
      },
    });
  } catch (e: any) { next(e); }
});

/** POST /api/equations/:id/solve — evaluate the equation with user inputs */
router.post('/:id/solve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eq = await prisma.equation.findUnique({ where: { slug: req.params.id } });
    if (!eq) return next(new NotFoundError('Equation not found'));
    const inputs = req.body?.inputs || {};
    const formula = eq.formula;
    // Parse output variable (left side of =)
    const outputMatch = formula.match(/^(\w+)\s*=/);
    const outputVar = outputMatch ? outputMatch[1] : 'result';
    const expr = formula.substring(formula.indexOf('=') + 1).trim();
    // Substitute variables
    const vars: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) vars[k] = Number(v) || 0;
    // Evaluate
    const fn = new Function(...Object.keys(vars), `"use strict"; return (${expr})`);
    const result = fn(...Object.values(vars));
    const vars2 = eq.variables ? JSON.parse(eq.variables) : {};
    const outputUnit = (vars2.outputs?.[0]?.unit) || '';
    res.json({ success: true, data: { equation: eq.name, formula, inputs: vars, result: { [outputVar]: result }, unit: outputUnit } });
  } catch (e: any) { next(e); }
});

export default router;
