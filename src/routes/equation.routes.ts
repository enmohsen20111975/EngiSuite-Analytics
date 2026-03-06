/**
 * Equation Routes
 * Converted from Python FastAPI equations router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/equations
 * List all equations
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const equations = await prisma.equation.findMany({
      where: { isActive: true },
      include: {
        category: true,
        inputs: { orderBy: { sortOrder: 'asc' } },
        outputs: { orderBy: { sortOrder: 'asc' } },
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
 * GET /api/equations/categories
 * List equation categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.equationCategory.findMany({
      include: {
        _count: { select: { equations: true } },
        children: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

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
    const id = parseInt(req.params.id, 10);

    const equation = await prisma.equation.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        inputs: { orderBy: { sortOrder: 'asc' } },
        outputs: { orderBy: { sortOrder: 'asc' } },
        examples: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    res.json({
      success: true,
      data: equation,
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
    const id = parseInt(req.params.id, 10);
    const inputs = req.body;

    const equation = await prisma.equation.findFirst({
      where: { id, isActive: true },
      include: {
        inputs: true,
        outputs: true,
      },
    });

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    // Build input map
    const inputMap: Record<string, number> = {};
    for (const input of equation.inputs) {
      const value = inputs[input.slug];
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.slug}' is missing`);
      }
      inputMap[input.slug] = Number(value ?? input.defaultValue);
    }

    // Evaluate formula
    const result = evaluateFormula(equation.formula, inputMap);

    // Build outputs
    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equation.outputs) {
      const outputValue = output.formula 
        ? evaluateFormula(output.formula, { ...inputMap, result })
        : result;
      outputs[output.slug] = {
        value: Number(outputValue.toFixed(output.precision ?? 4)),
        unit: output.unit || '',
      };
    }

    res.json({
      success: true,
      data: {
        equationId: id,
        equationName: equation.name,
        inputs: Object.fromEntries(
          equation.inputs.map(i => [i.slug, { value: inputMap[i.slug], unit: i.unit || '' }])
        ),
        outputs,
        formula: equation.formula,
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
  for (const [key, value] of Object.entries(context)) {
    evaluableFormula = evaluableFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
  }
  
  try {
    const result = new Function(`return ${evaluableFormula}`)();
    return Number(result);
  } catch {
    return 0;
  }
}

export default router;
