/**
 * Calculator Routes
 * Serves equations from workflows database
 * Enhanced with engineering calculation functions from calculation engine service
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma, prepareWorkflows } from '../services/database.service.js';
import { ValidationError, NotFoundError } from '../middleware/error.middleware.js';
import { calculationRateLimiter } from '../middleware/rateLimit.middleware.js';
import { evaluateFormula } from '../services/calculationEngine.service.js';

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
  category_name?: string;
  category_domain?: string;
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
    const equations = prepareWorkflows(`
      SELECT e.id, e.equation_id, e.name, e.description, e.domain, e.difficulty_level
      FROM equations e
      WHERE e.is_active = 1
      ORDER BY e.name ASC
    `).all() as unknown as EquationRow[];

    res.json(equations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculators/init
 * Get calculator initialization status
 */
router.get('/init', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const domainCounts = prepareWorkflows(`
      SELECT e.domain, COUNT(*) as count
      FROM equations e
      WHERE e.is_active = 1
      GROUP BY e.domain
    `).all() as unknown as { domain: string; count: number }[];

    const totalCount = prepareWorkflows(`
      SELECT COUNT(*) as count FROM equations WHERE is_active = 1
    `).get() as unknown as { count: number } | undefined;

    res.json({
      initialized: true,
      equationsCount: totalCount?.count || 0,
      byDomain: domainCounts,
      categories: ['electrical', 'mechanical', 'civil', 'scientific'],
    });
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
    const { category, domain, search, limit, subcategory, difficulty } = req.query;

    let whereClause = 'WHERE e.is_active = 1';
    const params: (string | number)[] = [];

    if (category) {
      whereClause += ' AND e.category_id = (SELECT id FROM equation_categories WHERE name = ? OR id = ?)';
      params.push(String(category), String(category));
    }
    if (domain) {
      whereClause += ' AND e.domain = ?';
      params.push(String(domain));
    }
    if (search) {
      whereClause += ` AND (e.name LIKE ? OR e.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (subcategory) {
      whereClause += ' AND EXISTS (SELECT 1 FROM equation_categories ec WHERE ec.id = e.category_id AND ec.subcategory LIKE ?)';
      params.push(`%${subcategory}%`);
    }
    if (difficulty) {
      whereClause += ' AND e.difficulty_level = ?';
      params.push(String(difficulty));
    }

    const limitClause = limit ? `LIMIT ${parseInt(String(limit), 10)}` : '';

    const equations = prepareWorkflows(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      ${whereClause}
      ORDER BY e.name ASC
      ${limitClause}
    `).all(...params) as unknown as EquationRow[];

    // Get inputs and outputs for each equation
    const equationsWithDetails = equations.map(eq => {
      const inputs = prepareWorkflows(`
        SELECT * FROM equation_inputs
        WHERE equation_id = ?
        ORDER BY input_order ASC
      `).all(eq.id) as unknown as EquationInputRow[];

      const outputs = prepareWorkflows(`
        SELECT * FROM equation_outputs
        WHERE equation_id = ?
        ORDER BY output_order ASC
      `).all(eq.id) as unknown as EquationOutputRow[];

      return {
        ...eq,
        inputs,
        outputs
      };
    });

    res.json(equationsWithDetails);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculators/categories
 * Get equation categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = prepareWorkflows(`
      SELECT ec.*,
        (SELECT COUNT(*) FROM equations e WHERE e.category_id = ec.id AND e.is_active = 1) as equation_count
      FROM equation_categories ec
      ORDER BY ec.display_order ASC
    `).all();

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
    const idParam = String(req.params.id);

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId) as unknown as EquationRow;
    }

    if (!equation) {
      // Try to find by equation_id
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(idParam) as unknown as EquationRow;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const inputs = prepareWorkflows(`
      SELECT * FROM equation_inputs
      WHERE equation_id = ?
      ORDER BY input_order ASC
    `).all(equation.id) as unknown as EquationInputRow[];

    const outputs = prepareWorkflows(`
      SELECT * FROM equation_outputs
      WHERE equation_id = ?
      ORDER BY output_order ASC
    `).all(equation.id) as unknown as EquationOutputRow[];

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
    const idParam = String(req.params.id);
    const { inputs } = req.body;

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId) as unknown as EquationRow;
    }

    if (!equation) {
      // Try to find by equation_id
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(idParam) as unknown as EquationRow;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = prepareWorkflows(`
      SELECT * FROM equation_inputs
      WHERE equation_id = ?
      ORDER BY input_order ASC
    `).all(equation.id) as unknown as EquationInputRow[];

    const equationOutputs = prepareWorkflows(`
      SELECT * FROM equation_outputs
      WHERE equation_id = ?
      ORDER BY output_order ASC
    `).all(equation.id) as unknown as EquationOutputRow[];

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

    // Evaluate the equation using enhanced evaluator
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
    const idParam = String(req.params.id);
    const { inputs } = req.body;

    // Try to find by numeric ID first, then by equation_id
    let equation: EquationRow | undefined;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId) as unknown as EquationRow;
    }

    if (!equation) {
      // Try to find by equation_id
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(idParam) as unknown as EquationRow;
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = prepareWorkflows(`
      SELECT * FROM equation_inputs
      WHERE equation_id = ?
      ORDER BY input_order ASC
    `).all(equation.id) as unknown as EquationInputRow[];

    const equationOutputs = prepareWorkflows(`
      SELECT * FROM equation_outputs
      WHERE equation_id = ?
      ORDER BY output_order ASC
    `).all(equation.id) as unknown as EquationOutputRow[];

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

    // Evaluate the equation using enhanced evaluator
    const result = evaluateFormula(equation.equation, context);

    // Build output
    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equationOutputs) {
      outputs[output.name] = {
        value: result,
        unit: output.unit || '',
      };
    }

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

export default router;
