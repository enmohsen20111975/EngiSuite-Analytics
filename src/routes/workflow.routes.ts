/**
 * Workflow Routes
 * Uses users database for workflows and workflows database for equations/pipelines
 * Enhanced with DAG-based calculation engine
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { getWorkflowsDb } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
import { CalculationEngine, evaluateFormula } from '../services/calculationEngine.service.js';

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

interface CalculationPipelineRow {
  id: number;
  pipeline_id: string;
  name: string;
  description: string | null;
  domain: string | null;
  standard_id: number | null;
  version: string | null;
  estimated_time: number | null;
  difficulty_level: string | null;
  tags: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface CalculationStepRow {
  id: number;
  pipeline_id: number;
  step_id: string | null;
  step_number: number;
  name: string;
  description: string | null;
  standard_id: number | null;
  formula_ref: string | null;
  formula: string | null;
  input_config: string | null;
  output_config: string | null;
  calculation_type: string | null;
  precision: number | null;
  step_type: string | null;
  validation_config: string | null;
  is_active: number;
}

// ============================================
// IMPORTANT: Specific routes MUST come before /:id
// ============================================

/**
 * GET /api/workflows
 * List all workflows
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { isActive: true },
      include: {
        category: true,
        inputs: { orderBy: { sortOrder: 'asc' } },
        outputs: { orderBy: { id: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });

    // Return data directly for frontend compatibility
    res.json(workflows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/categories
 * List workflow categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.workflowCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Return data directly for frontend compatibility
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// ============================================
// Equations API (from workflows database)
// ============================================

/**
 * GET /api/workflows/equations
 * List all equations
 */
router.get('/equations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const equations = db.prepare(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      WHERE e.is_active = 1
      ORDER BY e.name ASC
    `).all() as EquationRow[];

    // Return data directly for frontend compatibility
    res.json(equations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/equation-categories
 * List equation categories
 */
router.get('/equation-categories', async (_req: Request, res: Response, next: NextFunction) => {
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
 * GET /api/workflows/equations/by-id/:equationId
 * Get equation by equation_id string
 */
router.get('/equations/by-id/:equationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equationId = String(req.params.equationId);
    const db = getWorkflowsDb();

    const equation = db.prepare(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      WHERE e.equation_id = ? AND e.is_active = 1
    `).get(equationId) as EquationRow | undefined;

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
 * GET /api/workflows/equations/:id
 * Get equation by ID with inputs and outputs
 */
router.get('/equations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const db = getWorkflowsDb();

    const equation = db.prepare(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      WHERE e.id = ? AND e.is_active = 1
    `).get(id) as EquationRow | undefined;

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const inputs = db.prepare(`
      SELECT * FROM equation_inputs
      WHERE equation_id = ?
      ORDER BY input_order ASC
    `).all(id) as EquationInputRow[];

    const outputs = db.prepare(`
      SELECT * FROM equation_outputs
      WHERE equation_id = ?
      ORDER BY output_order ASC
    `).all(id) as EquationOutputRow[];

    // Return data directly for frontend compatibility
    res.json({ ...equation, inputs, outputs });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/equations/:id/calculate
 * Calculate equation result using enhanced formula evaluator
 */
router.post('/equations/:id/calculate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { inputs } = req.body;
    const db = getWorkflowsDb();

    const equation = db.prepare(`
      SELECT * FROM equations WHERE id = ? AND is_active = 1
    `).get(id) as EquationRow | undefined;

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = db.prepare(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(id) as EquationInputRow[];

    const equationOutputs = db.prepare(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(id) as EquationOutputRow[];

    // Build context with input values
    const context: Record<string, number | string> = {};
    for (const input of equationInputs) {
      const inputValue = inputs ? inputs[input.name] : undefined;
      const symbolValue = inputs && input.symbol ? inputs[input.symbol] : undefined;
      const value = inputValue ?? symbolValue ?? input.default_value;
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      context[input.name] = Number(value) || 0;
      if (input.symbol) {
        context[input.symbol] = Number(value) || 0;
      }
    }

    // Evaluate the equation using enhanced evaluator
    const result = evaluateFormula(equation.equation, context);

    // Build output
    const outputs: Record<string, number> = {};
    for (const output of equationOutputs) {
      outputs[output.name] = result;
      if (output.symbol) {
        outputs[output.symbol] = result;
      }
    }

    // Return data directly for frontend compatibility
    res.json({
      equationId: equation.equation_id,
      name: equation.name,
      inputs: context,
      outputs,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Calculation Pipelines API (from workflows database)
// ============================================

/**
 * GET /api/workflows/pipelines
 * List all calculation pipelines
 */
router.get('/pipelines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const pipelines = db.prepare(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.is_active = 1
      ORDER BY cp.name ASC
    `).all() as CalculationPipelineRow[];

    // Return data directly for frontend compatibility
    res.json(pipelines);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/pipelines/:id
 * Get pipeline by ID with steps
 */
router.get('/pipelines/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const db = getWorkflowsDb();

    const pipeline = db.prepare(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.id = ? AND cp.is_active = 1
    `).get(id) as CalculationPipelineRow | undefined;

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    const steps = db.prepare(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(id) as CalculationStepRow[];

    // Parse input_config and output_config for each step
    const parsedSteps = steps.map(step => {
      let inputConfig: unknown[] = [];
      let outputConfig: unknown[] = [];
      try { inputConfig = step.input_config ? JSON.parse(step.input_config) : []; } catch { inputConfig = []; }
      try { outputConfig = step.output_config ? JSON.parse(step.output_config) : []; } catch { outputConfig = []; }
      
      return {
        ...step,
        input_config: inputConfig,
        output_config: outputConfig,
      };
    });

    const dependencies = db.prepare(`
      SELECT * FROM calculation_dependencies WHERE pipeline_id = ?
    `).all(id);

    // Return data directly for frontend compatibility
    res.json({ ...pipeline, steps: parsedSteps, dependencies });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/pipelines/:id/execute
 * Execute a calculation pipeline using the enhanced DAG-based engine
 */
router.post('/pipelines/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { inputs } = req.body;
    const db = getWorkflowsDb();

    const pipeline = db.prepare(`
      SELECT * FROM calculation_pipelines WHERE id = ? AND is_active = 1
    `).get(id) as CalculationPipelineRow | undefined;

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    // Use the enhanced calculation engine
    const engine = new CalculationEngine(db);
    const result = engine.executePipeline(pipeline.pipeline_id, inputs || {});

    res.json({
      success: result.success,
      execution_id: result.execution_id,
      pipelineId: pipeline.pipeline_id,
      pipelineName: pipeline.name,
      inputs: inputs || {},
      outputs: result.results,
      status: result.status,
      execution_time: result.execution_time,
      steps: Object.values(result.steps),
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/standards
 * List engineering standards
 */
router.get('/standards', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const standards = db.prepare(`
      SELECT * FROM engineering_standards WHERE is_active = 1 ORDER BY standard_code ASC
    `).all();

    // Return data directly for frontend compatibility
    res.json(standards);
  } catch (error) {
    next(error);
  }
});

// ============================================
// Workflow by ID routes (MUST come last)
// ============================================

/**
 * GET /api/workflows/by-id/:workflowId
 * Get workflow by workflow_id string
 */
router.get('/by-id/:workflowId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflowId = String(req.params.workflowId);

    const workflow = await prisma.workflow.findFirst({
      where: { slug: workflowId, isActive: true },
      include: {
        category: true,
        inputs: { orderBy: { sortOrder: 'asc' } },
        outputs: { orderBy: { id: 'asc' } },
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    // Return data directly for frontend compatibility
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/:id
 * Get workflow by ID with full details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if id is a number
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      throw new NotFoundError('Workflow not found');
    }

    const workflow = await prisma.workflow.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        inputs: { orderBy: { sortOrder: 'asc' } },
        outputs: { orderBy: { id: 'asc' } },
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    // Return data directly for frontend compatibility
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/:id/execute
 * Execute a workflow using enhanced calculation engine
 */
router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { inputs } = req.body;

    const workflow = await prisma.workflow.findFirst({
      where: { id, isActive: true },
      include: {
        inputs: true,
        outputs: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    // Build input map
    const inputMap: Record<string, number | string | boolean> = {};
    for (const input of workflow.inputs) {
      const value = inputs?.[input.name];
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      inputMap[input.name] = value ?? input.defaultValue;
    }

    // Execute workflow steps using enhanced formula evaluator
    const stepResults: Array<{
      stepNumber: number;
      name: string;
      inputs: Record<string, number | string>;
      outputs: Record<string, number | string>;
    }> = [];

    const context = { ...inputMap };

    for (const step of workflow.steps) {
      const stepInputs: Record<string, number | string> = {};
      const stepOutputs: Record<string, number | string> = {};

      // Execute step formula or code
      if (step.formula) {
        try {
          const result = evaluateFormula(step.formula, context);
          stepOutputs['result'] = result;
          context[`${step.name}_result`] = result;
        } catch (e) {
          console.error(`Step ${step.stepNumber} formula error:`, e);
        }
      }

      stepResults.push({
        stepNumber: step.stepNumber,
        name: step.name,
        inputs: stepInputs,
        outputs: stepOutputs,
      });
    }

    // Build final outputs
    const outputs: Record<string, number | string> = {};
    for (const output of workflow.outputs) {
      outputs[output.name] = context[output.name] as number | string;
    }

    // Return data directly for frontend compatibility
    res.json({
      workflowId: id,
      inputs: inputMap,
      outputs,
      steps: stepResults,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
