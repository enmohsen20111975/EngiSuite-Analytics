/**
 * Calculator Routes
 * Serves equations from workflows database
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma, getWorkflowsDb } from '../services/database.service.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/error.middleware.js';
import { calculationRateLimiter } from '../middleware/rateLimit.middleware.js';
import { CalculatorRequest, CalculatorResponse } from '../types/index.js';

const router = Router();

// Type definitions for database rows
interface EquationRow {
  id: number;
  equation_id: string;
  name: string;
  description: string | null;
  domain: string | null;
  category_id: number | null;
  equation: string;
  equation_latex: string | null;
  equation_pattern: string | null;
  difficulty_level: string | null;
  tags: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface EquationInputRow {
  id: number;
  equation_id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  data_type: string | null;
  unit: string | null;
  unit_category: string | null;
  required: number;
  default_value: number | null;
  min_value: number | null;
  max_value: number | null;
  validation_regex: string | null;
  input_order: number;
  placeholder: string | null;
  help_text: string | null;
}

interface EquationOutputRow {
  id: number;
  equation_id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  data_type: string | null;
  unit: string | null;
  unit_category: string | null;
  output_order: number;
  precision: number | null;
  format_string: string | null;
}

// ============================================
// Equations Catalog from workflows database
// ============================================

/**
 * GET /api/calculators
 * List all available calculators (basic list)
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const equations = db.prepare(`
      SELECT e.id, e.equation_id, e.name, e.description, e.domain, e.difficulty_level
      FROM equations e
      WHERE e.is_active = 1
      ORDER BY e.name ASC
    `).all();

    // Return data directly for frontend compatibility
    res.json(equations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculators/equations/catalog
 * Get equations catalog with full details (inputs, outputs)
 */
router.get('/equations/catalog', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const { category, domain, search } = req.query;

    let whereClause = 'WHERE e.is_active = 1';
    const params: (string | number)[] = [];

    if (category) {
      whereClause += ' AND e.domain = ?';
      params.push(String(category));
    }

    if (domain) {
      whereClause += ' AND e.domain = ?';
      params.push(String(domain));
    }

    if (search) {
      whereClause += ' AND (e.name LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const equations = db.prepare(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      ${whereClause}
      ORDER BY e.name ASC
    `).all(...params) as EquationRow[];

    // Get inputs and outputs for each equation
    const equationsWithDetails = equations.map(eq => {
      const inputs = db.prepare(`
        SELECT * FROM equation_inputs
        WHERE equation_id = ?
        ORDER BY input_order ASC
      `).all(eq.id) as EquationInputRow[];

      const outputs = db.prepare(`
        SELECT * FROM equation_outputs
        WHERE equation_id = ?
        ORDER BY output_order ASC
      `).all(eq.id) as EquationOutputRow[];

      return {
        ...eq,
        inputs,
        outputs,
      };
    });

    // Return data directly for frontend compatibility
    res.json(equationsWithDetails);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculators/init
 * Get calculator initialization status
 */
router.get('/init', (_req: Request, res: Response) => {
  // Return data directly for frontend compatibility
  res.json({
    initialized: true,
    equationsCount: 255,
    categories: ['electrical', 'mechanical', 'civil', 'scientific'],
  });
});

/**
 * GET /api/calculators/categories
 * Get equation categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const categories = db.prepare(`
      SELECT ec.*,
        (SELECT COUNT(*) FROM equations e WHERE e.category_id = ec.id AND e.is_active = 1) as equation_count
      FROM equation_categories ec
      ORDER BY ec.display_order ASC
    `).all();

    // Return data directly for frontend compatibility
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculators/:id
 * Get calculator by ID or equation_id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const db = getWorkflowsDb();

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId)) {
      equation = db.prepare(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId) as EquationRow | undefined;
    }

    if (!equation) {
      equation = db.prepare(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(id) as EquationRow | undefined;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const inputs = db.prepare(`
      SELECT * FROM equation_inputs
      WHERE equation_id = ?
      ORDER BY input_order ASC
    `).all(equation.id) as EquationInputRow[];

    const outputs = db.prepare(`
      SELECT * FROM equation_outputs
      WHERE equation_id = ?
      ORDER BY output_order ASC
    `).all(equation.id) as EquationOutputRow[];

    // Return data directly for frontend compatibility
    res.json({ ...equation, inputs, outputs });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/calculators/:id/calculate
 * Perform calculation
 */
router.post('/:id/calculate', calculationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { inputs } = req.body;
    const db = getWorkflowsDb();

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId)) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE id = ? AND is_active = 1
      `).get(numericId) as EquationRow | undefined;
    }

    if (!equation) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE equation_id = ? AND is_active = 1
      `).get(id) as EquationRow | undefined;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = db.prepare(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(equation.id) as EquationInputRow[];

    const equationOutputs = db.prepare(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(equation.id) as EquationOutputRow[];

    // Build context with input values
    const context: Record<string, number | string> = {};
    const inputValues: Record<string, { value: number | string; unit: string }> = {};

    for (const input of equationInputs) {
      const inputValue = inputs ? inputs[input.name] : undefined;
      const symbolValue = inputs && input.symbol ? inputs[input.symbol] : undefined;
      const value = inputValue ?? symbolValue ?? input.default_value;
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      const numValue = Number(value) || 0;
      context[input.name] = numValue;
      if (input.symbol) {
        context[input.symbol] = numValue;
      }
      inputValues[input.name] = {
        value: numValue,
        unit: input.unit || '',
      };
    }

    // Evaluate the equation
    const result = evaluateFormula(equation.equation, context);

    // Build output
    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equationOutputs) {
      outputs[output.name] = {
        value: result,
        unit: output.unit || '',
      };
    }

    // Save to calculation history if user is authenticated
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as { userId: number };

        await prisma.calculationHistory.create({
          data: {
            userId: decoded.userId,
            calculatorId: equation.equation_id,
            inputs: JSON.stringify(inputs),
            outputs: JSON.stringify(outputs),
          },
        });
      } catch {
        // Ignore auth errors for history saving
      }
    }

    // Return data directly for frontend compatibility
    res.json({
      equationId: equation.equation_id,
      name: equation.name,
      inputs: inputValues,
      outputs,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/calculators/demo/:id/calculate
 * Perform demo calculation (no auth required)
 */
router.post('/demo/:id/calculate', calculationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { inputs } = req.body;
    const db = getWorkflowsDb();

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId)) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE id = ? AND is_active = 1
      `).get(numericId) as EquationRow | undefined;
    }

    if (!equation) {
      equation = db.prepare(`
        SELECT * FROM equations WHERE equation_id = ? AND is_active = 1
      `).get(id) as EquationRow | undefined;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = db.prepare(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(equation.id) as EquationInputRow[];

    const equationOutputs = db.prepare(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(equation.id) as EquationOutputRow[];

    // Build context with input values
    const context: Record<string, number | string> = {};
    const inputValues: Record<string, { value: number | string; unit: string }> = {};

    for (const input of equationInputs) {
      const inputValue = inputs ? inputs[input.name] : undefined;
      const symbolValue = inputs && input.symbol ? inputs[input.symbol] : undefined;
      const value = inputValue ?? symbolValue ?? input.default_value;
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      const numValue = Number(value) || 0;
      context[input.name] = numValue;
      if (input.symbol) {
        context[input.symbol] = numValue;
      }
      inputValues[input.name] = {
        value: numValue,
        unit: input.unit || '',
      };
    }

    // Evaluate the equation
    const result = evaluateFormula(equation.equation, context);

    // Build output
    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equationOutputs) {
      outputs[output.name] = {
        value: result,
        unit: output.unit || '',
      };
    }

    // Return data directly for frontend compatibility
    res.json({
      equationId: equation.equation_id,
      name: equation.name,
      inputs: inputValues,
      outputs,
      result,
      timestamp: new Date(),
      demo: true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Simple formula evaluator
 */
function evaluateFormula(formula: string, context: Record<string, unknown>): number {
  // Replace variable names with values
  let evaluableFormula = formula;
  for (const [key, value] of Object.entries(context)) {
    evaluableFormula = evaluableFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
  }

  // Clean up the formula for basic arithmetic
  evaluableFormula = evaluableFormula
    .replace(/\^/g, '**')  // Handle exponent notation
    .replace(/×/g, '*')    // Handle multiplication sign
    .replace(/÷/g, '/')    // Handle division sign
    .replace(/π/g, 'Math.PI')  // Handle pi
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log')
    .replace(/ln/g, 'Math.log')
    .replace(/abs/g, 'Math.abs')
    .replace(/exp/g, 'Math.exp');

  try {
    // Basic arithmetic evaluation
    const result = new Function(`return (${evaluableFormula})`)();
    return Number(result) || 0;
  } catch (e) {
    console.error('Formula evaluation error:', e);
    return 0;
  }
}

export default router;
