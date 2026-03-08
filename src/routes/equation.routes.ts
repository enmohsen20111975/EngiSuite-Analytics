/**
 * Equation Routes
 * Converted from Python FastAPI equations router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma, getWorkflowsDb } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/equations/stats
 * Get equation statistics from workflows database
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    
    // Get total equations count
    const totalEquations = db.prepare(`
      SELECT COUNT(*) as count FROM equations WHERE is_active = 1
    `).get() as { count: number };

    // Get equations by domain
    const byDomain = db.prepare(`
      SELECT domain, COUNT(*) as count
      FROM equations
      WHERE is_active = 1 AND domain IS NOT NULL
      GROUP BY domain
    `).all() as { domain: string; count: number }[];

    // Get equations by difficulty
    const byDifficulty = db.prepare(`
      SELECT difficulty_level, COUNT(*) as count
      FROM equations
      WHERE is_active = 1 AND difficulty_level IS NOT NULL
      GROUP BY difficulty_level
    `).all() as { difficulty_level: string; count: number }[];

    // Get total categories
    const totalCategories = db.prepare(`
      SELECT COUNT(*) as count FROM equation_categories WHERE is_active = 1
    `).get() as { count: number };

    // Get total inputs/outputs
    const totalInputs = db.prepare(`
      SELECT COUNT(*) as count FROM equation_inputs
    `).get() as { count: number };

    const totalOutputs = db.prepare(`
      SELECT COUNT(*) as count FROM equation_outputs
    `).get() as { count: number };

    res.json({
      success: true,
      data: {
        total: totalEquations.count,
        byDomain: byDomain.reduce((acc, item) => {
          acc[item.domain] = item.count;
          return acc;
        }, {} as Record<string, number>),
        byDifficulty: byDifficulty.reduce((acc, item) => {
          acc[item.difficulty_level] = item.count;
          return acc;
        }, {} as Record<string, number>),
        categories: totalCategories.count,
        inputs: totalInputs.count,
        outputs: totalOutputs.count,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/equations
 * List all equations
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    
    const equations = db.prepare(`
      SELECT 
        e.*,
        ec.name as category_name
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      WHERE e.is_active = 1
      ORDER BY e.name ASC
    `).all();

    // Get inputs and outputs for each equation
    const equationsWithDetails = equations.map((eq: any) => {
      const inputs = db.prepare(`
        SELECT * FROM equation_inputs 
        WHERE equation_id = ? 
        ORDER BY input_order ASC
      `).all(eq.id);

      const outputs = db.prepare(`
        SELECT * FROM equation_outputs 
        WHERE equation_id = ? 
        ORDER BY output_order ASC
      `).all(eq.id);

      return {
        ...eq,
        inputs,
        outputs,
      };
    });

    res.json({
      success: true,
      data: equationsWithDetails,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/equations/categories
 * List equation categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    
    const categories = db.prepare(`
      SELECT 
        ec.*,
        (SELECT COUNT(*) FROM equations WHERE category_id = ec.id AND is_active = 1) as equation_count
      FROM equation_categories ec
      WHERE ec.is_active = 1
      ORDER BY ec.sort_order ASC, ec.name ASC
    `).all();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/equations/:id
 * Get equation by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const db = getWorkflowsDb();

    // Try numeric ID first, then equation_id string
    let equation: any = null;
    const numericId = parseInt(idParam, 10);
    
    if (!isNaN(numericId)) {
      equation = db.prepare(`
        SELECT 
          e.*,
          ec.name as category_name
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId);
    }
    
    if (!equation) {
      equation = db.prepare(`
        SELECT 
          e.*,
          ec.name as category_name
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(idParam);
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    // Get inputs
    const inputs = db.prepare(`
      SELECT * FROM equation_inputs 
      WHERE equation_id = ? 
      ORDER BY input_order ASC
    `).all(equation.id);

    // Get outputs
    const outputs = db.prepare(`
      SELECT * FROM equation_outputs 
      WHERE equation_id = ? 
      ORDER BY output_order ASC
    `).all(equation.id);

    res.json({
      success: true,
      data: {
        ...equation,
        inputs,
        outputs,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/equations/:id/solve
 * Solve an equation
 */
router.post('/:id/solve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const inputs = req.body;
    const db = getWorkflowsDb();

    // Try to find equation
    let equation: any = null;
    const numericId = parseInt(idParam, 10);
    
    if (!isNaN(numericId)) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE id = ? AND is_active = 1
      `).get(numericId);
    }
    
    if (!equation) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE equation_id = ? AND is_active = 1
      `).get(idParam);
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    // Get equation inputs
    const equationInputs = db.prepare(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(equation.id) as any[];

    // Get equation outputs
    const equationOutputs = db.prepare(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(equation.id) as any[];

    // Build input map
    const inputMap: Record<string, number> = {};
    for (const input of equationInputs) {
      const value = inputs[input.name];
      if (value === undefined && input.required === 1) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      inputMap[input.name] = Number(value ?? input.default_value ?? 0);
    }

    // Evaluate formula
    const result = evaluateFormula(equation.equation, inputMap);

    // Build outputs
    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equationOutputs) {
      const outputValue = output.formula 
        ? evaluateFormula(output.formula, { ...inputMap, result })
        : result;
      outputs[output.name] = {
        value: Number(outputValue.toFixed(output.precision ?? 4)),
        unit: output.unit || '',
      };
    }

    res.json({
      success: true,
      data: {
        equationId: equation.equation_id || equation.id,
        equationName: equation.name,
        inputs: Object.fromEntries(
          equationInputs.map(i => [i.name, { value: inputMap[i.name], unit: i.unit || '' }])
        ),
        outputs,
        formula: equation.equation,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Simple formula evaluator
 */
function evaluateFormula(formula: string, context: Record<string, number>): number {
  let evaluableFormula = formula;
  
  // Replace context variables
  for (const [key, value] of Object.entries(context)) {
    evaluableFormula = evaluableFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
  }
  
  // Add Math functions
  const mathContext = {
    ...context,
    sqrt: Math.sqrt,
    sin: (deg: number) => Math.sin(deg * Math.PI / 180),
    cos: (deg: number) => Math.cos(deg * Math.PI / 180),
    tan: (deg: number) => Math.tan(deg * Math.PI / 180),
    asin: (val: number) => Math.asin(val) * 180 / Math.PI,
    acos: (val: number) => Math.acos(val) * 180 / Math.PI,
    atan: (val: number) => Math.atan(val) * 180 / Math.PI,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
    pow: Math.pow,
    abs: Math.abs,
    round: Math.round,
    ceil: Math.ceil,
    floor: Math.floor,
    max: Math.max,
    min: Math.min,
    PI: Math.PI,
    E: Math.E,
  };
  
  try {
    // Create function with math context
    const func = new Function(...Object.keys(mathContext), `return ${evaluableFormula}`);
    const result = func(...Object.values(mathContext));
    return Number(result);
  } catch {
    // Fallback to simple evaluation
    try {
      const result = new Function(`return ${evaluableFormula}`)();
      return Number(result);
    } catch {
      return 0;
    }
  }
}

export default router;
