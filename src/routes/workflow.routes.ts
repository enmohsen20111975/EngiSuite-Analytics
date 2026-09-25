/**
 * Workflow Routes
 * Uses users database for workflows and workflows database for equations/pipelines
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma, prepareWorkflows } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
import { evaluateFormula } from '../services/calculationEngine.service.js';

const router = Router();

// Type definitions
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
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/equations
 * List all equations
 */
router.get('/equations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const equations = prepareWorkflows(`
      SELECT e.*, ec.name as category_name, ec.domain as category_domain
      FROM equations e
      LEFT JOIN equation_categories ec ON e.category_id = ec.id
      WHERE e.is_active = 1
      ORDER BY e.name ASC
    `).all();
    res.json(equations);
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
    const idParam = String(req.params.id);
    let equation: any;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.id = ? AND e.is_active = 1
      `).get(numericId);
    }

    if (!equation) {
      equation = prepareWorkflows(`
        SELECT e.*, ec.name as category_name, ec.domain as category_domain
        FROM equations e
        LEFT JOIN equation_categories ec ON e.category_id = ec.id
        WHERE e.equation_id = ? AND e.is_active = 1
      `).get(idParam);
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const inputs = prepareWorkflows(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(equation.id);

    const outputs = prepareWorkflows(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(equation.id);

    res.json({ ...equation, inputs, outputs });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/equations/:id/execute
 * Execute an equation
 */
router.post('/equations/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const { inputs } = req.body;

    let equation: any;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      equation = prepareWorkflows(`SELECT * FROM equations WHERE id = ? AND is_active = 1`).get(numericId);
    }

    if (!equation) {
      equation = prepareWorkflows(`SELECT * FROM equations WHERE equation_id = ? AND is_active = 1`).get(idParam);
    }

    if (!equation) {
      throw new NotFoundError('Equation not found');
    }

    const equationInputs = prepareWorkflows(`
      SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
    `).all(equation.id) as any[];

    const equationOutputs = prepareWorkflows(`
      SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
    `).all(equation.id) as any[];

    const inputMap: Record<string, number> = {};
    for (const input of equationInputs) {
      const value = inputs ? inputs[input.name] : undefined;
      if (value === undefined && input.required === 1) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      inputMap[input.name] = Number(value ?? input.default_value ?? 0);
    }

    const result = evaluateFormula(equation.equation, inputMap);

    const outputs: Record<string, { value: number; unit: string }> = {};
    for (const output of equationOutputs) {
      outputs[output.name] = {
        value: Number(result.toFixed(output.precision ?? 4)),
        unit: output.unit || '',
      };
    }

    res.json({
      equationId: equation.equation_id || equation.id,
      name: equation.name,
      inputs: inputMap,
      outputs,
      result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/pipelines
 * List all calculation pipelines
 */
router.get('/pipelines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pipelines = prepareWorkflows(`
      SELECT * FROM calculation_pipelines WHERE is_active = 1 ORDER BY name ASC
    `).all();
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
    const idParam = String(req.params.id);
    let pipeline: any;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      pipeline = prepareWorkflows(`SELECT * FROM calculation_pipelines WHERE id = ? AND is_active = 1`).get(numericId);
    }

    if (!pipeline) {
      pipeline = prepareWorkflows(`SELECT * FROM calculation_pipelines WHERE pipeline_id = ? AND is_active = 1`).get(idParam);
    }

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    const steps = prepareWorkflows(`
      SELECT * FROM calculation_steps WHERE pipeline_id = ? AND is_active = 1 ORDER BY step_number ASC
    `).all(pipeline.id);

    res.json({ ...pipeline, steps });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/pipelines/:id/execute
 * Execute a calculation pipeline
 */
router.post('/pipelines/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const { inputs } = req.body;

    let pipeline: any;
    const numericId = parseInt(idParam, 10);

    if (!isNaN(numericId)) {
      pipeline = prepareWorkflows(`SELECT * FROM calculation_pipelines WHERE id = ? AND is_active = 1`).get(numericId);
    }

    if (!pipeline) {
      pipeline = prepareWorkflows(`SELECT * FROM calculation_pipelines WHERE pipeline_id = ? AND is_active = 1`).get(idParam);
    }

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    const steps = prepareWorkflows(`
      SELECT * FROM calculation_steps WHERE pipeline_id = ? AND is_active = 1 ORDER BY step_number ASC
    `).all(pipeline.id) as any[];

    const context: Record<string, any> = { ...inputs };
    const stepResults: any[] = [];

    for (const step of steps) {
      const stepOutputs: Record<string, any> = {};
      if (step.formula) {
        try {
          const result = evaluateFormula(step.formula, context);
          stepOutputs['result'] = result;
          context[`${step.step_id}_result`] = result;
        } catch (e) {
          console.error(`Step ${step.step_number} formula error:`, e);
        }
      }
      stepResults.push({
        stepNumber: step.step_number,
        name: step.name,
        inputs: {},
        outputs: stepOutputs,
      });
    }

    res.json({
      pipelineId: pipeline.pipeline_id || pipeline.id,
      name: pipeline.name,
      inputs,
      outputs: context,
      steps: stepResults,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/standards
 * List all engineering standards
 */
router.get('/standards', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const standards = prepareWorkflows(`
      SELECT * FROM engineering_standards WHERE is_active = 1 ORDER BY standard_code ASC
    `).all();
    res.json(standards);
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

    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workflows/:id/execute
 * Execute a workflow
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

    const inputMap: Record<string, any> = {};
    for (const input of workflow.inputs) {
      const value = inputs?.[input.name];
      if (value === undefined && input.required) {
        throw new ValidationError(`Required input '${input.name}' is missing`);
      }
      inputMap[input.name] = value ?? input.defaultValue;
    }

    const stepResults: any[] = [];
    const context = { ...inputMap };

    for (const step of workflow.steps) {
      const stepOutputs: Record<string, any> = {};
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
        inputs: {},
        outputs: stepOutputs,
      });
    }

    const outputs: Record<string, any> = {};
    for (const output of workflow.outputs) {
      outputs[output.name] = context[output.name];
    }

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
