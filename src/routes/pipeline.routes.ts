/**
 * Pipeline Routes
 * Uses workflows database for calculation pipelines
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getWorkflowsDb } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

// Type definitions for database rows
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
  step_number: number;
  name: string;
  description: string | null;
  equation_id: number | null;
  equation: string | null;
  code: string | null;
  inputs: string | null;
  outputs: string | null;
  is_active: number;
}

/**
 * GET /api/pipelines
 * List all calculation pipelines
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    const pipelines = (db.prepare(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.is_active = 1
      ORDER BY cp.name ASC
    `).all() as CalculationPipelineRow[]).map(p => ({
      ...p,
      tags: p.tags ? (typeof p.tags === 'string' ? (() => { try { return JSON.parse(p.tags as string); } catch { return []; } })() : p.tags) : [],
    }));

    // Return data directly for frontend compatibility
    res.json(pipelines);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/stats
 * Get pipeline statistics
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getWorkflowsDb();
    
    const totalPipelines = db.prepare(`
      SELECT COUNT(*) as count FROM calculation_pipelines WHERE is_active = 1
    `).get() as { count: number };

    const byDomain = db.prepare(`
      SELECT domain, COUNT(*) as count
      FROM calculation_pipelines
      WHERE is_active = 1
      GROUP BY domain
    `).all();

    const byDifficulty = db.prepare(`
      SELECT difficulty_level, COUNT(*) as count
      FROM calculation_pipelines
      WHERE is_active = 1
      GROUP BY difficulty_level
    `).all();

    // Return data directly for frontend compatibility
    res.json({
      total: totalPipelines.count,
      byDomain,
      byDifficulty,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/:id
 * Get pipeline by ID with steps
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

    const dependencies = db.prepare(`
      SELECT * FROM calculation_dependencies WHERE pipeline_id = ?
    `).all(id);

    // Return data directly for frontend compatibility
    res.json({ ...pipeline, steps, dependencies });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/by-id/:pipelineId
 * Get pipeline by pipeline_id string
 */
router.get('/by-id/:pipelineId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pipelineId = String(req.params.pipelineId);
    const db = getWorkflowsDb();

    const pipeline = db.prepare(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.pipeline_id = ? AND cp.is_active = 1
    `).get(pipelineId) as CalculationPipelineRow | undefined;

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    const steps = db.prepare(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(pipeline.id) as CalculationStepRow[];

    const dependencies = db.prepare(`
      SELECT * FROM calculation_dependencies WHERE pipeline_id = ?
    `).all(pipeline.id);

    // Return data directly for frontend compatibility
    res.json({ ...pipeline, steps, dependencies });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pipelines/:id/execute
 * Execute a calculation pipeline
 */
router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
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

    const steps = db.prepare(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(id) as CalculationStepRow[];

    // Execute pipeline steps
    const context: Record<string, number | string | boolean> = { ...inputs };
    const stepResults: Array<{
      stepNumber: number;
      name: string;
      inputs: Record<string, number | string>;
      outputs: Record<string, number | string>;
    }> = [];

    for (const step of steps) {
      const stepInputs: Record<string, number | string> = {};
      const stepOutputs: Record<string, number | string> = {};

      // Execute step equation or code
      if (step.equation) {
        try {
          const result = evaluateFormula(step.equation, context);
          stepOutputs['result'] = result;
          context[`${step.name}_result`] = result;
        } catch (e) {
          console.error(`Step ${step.step_number} formula error:`, e);
        }
      }

      if (step.code) {
        try {
          const fn = new Function('context', `return ${step.code}`);
          const result = fn(context);
          if (typeof result === 'object' && result !== null) {
            Object.assign(stepOutputs, result);
            Object.assign(context, result);
          }
        } catch (e) {
          console.error(`Step ${step.step_number} code error:`, e);
        }
      }

      stepResults.push({
        stepNumber: step.step_number,
        name: step.name,
        inputs: stepInputs,
        outputs: stepOutputs,
      });
    }

    // Return data directly for frontend compatibility
    res.json({
      pipelineId: id,
      pipelineName: pipeline.name,
      inputs,
      outputs: context,
      steps: stepResults,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Simple formula evaluator
 */
function evaluateFormula(formula: string, context: Record<string, unknown>): number {
  let evaluableFormula = formula;
  for (const [key, value] of Object.entries(context)) {
    evaluableFormula = evaluableFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
  }
  
  evaluableFormula = evaluableFormula
    .replace(/\^/g, '**')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log')
    .replace(/ln/g, 'Math.log')
    .replace(/abs/g, 'Math.abs')
    .replace(/exp/g, 'Math.exp');

  try {
    const result = new Function(`return (${evaluableFormula})`)();
    return Number(result) || 0;
  } catch (e) {
    console.error('Formula evaluation error:', e);
    return 0;
  }
}

export default router;
