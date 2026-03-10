/**
 * Pipeline Routes
 * Uses workflows database for calculation pipelines
 * Enhanced with DAG-based execution engine
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getWorkflowsDb, prepareWorkflows } from '../services/database.service.js';
import {
  CalculationEngine
} from '../services/calculationEngine.service.js';
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
  standard_name?: string;
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
}

interface EquationInputRow {
  id: number;
  equation_id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  data_type: string | null;
  unit: string | null;
  required: number;
  default_value: number | null;
  min_value: number | null;
  max_value: number | null;
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
  output_order: number;
  precision: number | null;
}

// Known engineering parameters that should render as dropdowns
const KNOWN_SELECT_PARAMS: Record<string, { options: string[]; default: string; help_text: string }> = {
  // Electrical
  install_method: {
    options: ["conduit", "cable_tray", "direct_buried", "open_air", "trunking"],
    default: "conduit",
    help_text: "Cable installation method per IEC 60364-5-52 / NEC 300."
  },
  installation_method: {
    options: ["conduit", "cable_tray", "direct_buried", "open_air", "trunking"],
    default: "conduit",
    help_text: "Cable installation method per IEC 60364-5-52 / NEC 300."
  },
  material: {
    options: ["copper", "aluminum"],
    default: "copper",
    help_text: "Conductor material."
  },
  conductor_material: {
    options: ["copper", "aluminum"],
    default: "copper",
    help_text: "Conductor material."
  },
  insulation_type: {
    options: ["XLPE", "PVC", "EPR"],
    default: "XLPE",
    help_text: "Cable insulation type."
  },
  system_type: {
    options: ["3phase", "1phase"],
    default: "3phase",
    help_text: "Electrical system type."
  },
  phase: {
    options: ["3", "1"],
    default: "3",
    help_text: "Number of phases."
  },
  phase_config: {
    options: ["3phase", "1phase"],
    default: "3phase",
    help_text: "Phase configuration."
  },
  standard: {
    options: ["IEC", "NEC", "BS7671", "AS3000"],
    default: "IEC",
    help_text: "Applicable engineering standard."
  },
  circuit_type: {
    options: ["power", "lighting", "motor", "general"],
    default: "power",
    help_text: "Type of electrical circuit."
  },
  electrode_type: {
    options: ["rod", "plate"],
    default: "rod",
    help_text: "Grounding electrode type."
  },
  starting_method: {
    options: ["dol", "star_delta", "soft_starter", "vfd"],
    default: "dol",
    help_text: "Motor starting method."
  },
  cooling_type: {
    options: ["ONAN", "ONAF", "OFAF"],
    default: "ONAN",
    help_text: "Transformer cooling type."
  },
  // Mechanical
  duct_type: {
    options: ["rectangular", "circular"],
    default: "rectangular",
    help_text: "Duct cross-section shape."
  },
  duct_material: {
    options: ["galvanized", "aluminum"],
    default: "galvanized",
    help_text: "Duct material."
  },
  chiller_type: {
    options: ["air_cooled", "water_cooled"],
    default: "water_cooled",
    help_text: "Chiller type."
  },
  fuel_type: {
    options: ["gas", "oil", "electric"],
    default: "gas",
    help_text: "Fuel type for heating equipment."
  },
  climate: {
    options: ["hot_humid", "hot_dry", "temperate", "cold"],
    default: "hot_dry",
    help_text: "Climate zone for HVAC design."
  },
  // Civil
  load_type: {
    options: ["point", "udl"],
    default: "point",
    help_text: "Type of applied load."
  },
  support_type: {
    options: ["simply_supported", "cantilever", "fixed_both"],
    default: "simply_supported",
    help_text: "Beam support condition."
  },
  concrete_grade: {
    options: ["C20", "C25", "C30", "C35", "C40"],
    default: "C25",
    help_text: "Concrete strength grade."
  },
  steel_grade: {
    options: ["Fe415", "Fe500"],
    default: "Fe415",
    help_text: "Reinforcement steel grade."
  },
  cement_type: {
    options: ["OPC", "PPC"],
    default: "OPC",
    help_text: "Cement type."
  },
  design_code: {
    options: ["IS456", "ACI318", "EC2", "BS8110"],
    default: "IS456",
    help_text: "Structural design code."
  },
  terrain_category: {
    options: ["1", "2", "3", "4"],
    default: "2",
    help_text: "Terrain category: 1=Open, 2=Suburban, 3=Urban, 4=Dense."
  },
  zone: {
    options: ["II", "III", "IV", "V"],
    default: "III",
    help_text: "Seismic zone."
  },
  seismic_zone: {
    options: ["II", "III", "IV", "V"],
    default: "III",
    help_text: "Seismic zone."
  },
  shape: {
    options: ["straight", "bent", "stirrup", "hook"],
    default: "straight",
    help_text: "Rebar shape."
  },
  manning_n: {
    options: ["0.013", "0.015", "0.025", "0.035"],
    default: "0.013",
    help_text: "Manning roughness: 0.013=concrete, 0.015=metal, 0.025=earth, 0.035=natural."
  },
  pipe_slope: {
    options: ["0.005", "0.01", "0.02", "0.05"],
    default: "0.01",
    help_text: "Pipe slope (m/m)."
  },
};

// Parameters that should be integer with specific ranges
const KNOWN_INTEGER_PARAMS: Record<string, [number, number, number, string]> = {
  num_conductors: [1, 30, 1, "Number of conductors in bundle."],
  num_cables: [1, 30, 1, "Number of cables in group."],
  projection_years: [1, 50, 5, "Number of years for projection."],
  occupants: [1, 10000, 10, "Number of building occupants."],
};

/**
 * Infer input metadata from parameter name
 */
function inferInputMetadata(name: string, inputType: string = "number"): {
  type: string;
  options: string[];
  default: number | string;
  min: number | null;
  max: number | null;
  help_text: string;
} {
  const lname = (name || "").toLowerCase().trim();

  // Check known select parameters
  if (lname in KNOWN_SELECT_PARAMS) {
    const meta = KNOWN_SELECT_PARAMS[lname];
    return {
      type: "select",
      options: meta.options,
      default: meta.default,
      min: null,
      max: null,
      help_text: meta.help_text,
    };
  }

  // Check known integer parameters
  if (lname in KNOWN_INTEGER_PARAMS) {
    const [mn, mx, df, ht] = KNOWN_INTEGER_PARAMS[lname];
    return { type: "number", options: [], default: df, min: mn, max: mx, help_text: ht };
  }

  // Numeric inference by name pattern
  const itype = (inputType || "number").toLowerCase();
  if (!["number", "float", "int", "integer"].includes(itype)) {
    return {
      type: itype,
      options: [],
      default: "1",
      min: null,
      max: null,
      help_text: "Provide a valid value for this field."
    };
  }

  if (["factor", "ratio", "efficiency", "pf"].some(t => lname.includes(t))) {
    return { type: "number", options: [], default: 0.8, min: 0, max: 1, help_text: "Accepted range: 0 to 1." };
  }
  if (["percent", "pct"].some(t => lname.includes(t))) {
    return { type: "number", options: [], default: 50, min: 0, max: 100, help_text: "Accepted range: 0 to 100%." };
  }
  if (["temperature", "temp", "delta_t"].some(t => lname.includes(t))) {
    return { type: "number", options: [], default: 25, min: -50, max: 300, help_text: "Accepted range: -50 to 300." };
  }
  if (["load", "power", "current", "voltage", "flow", "pressure"].some(t => lname.includes(t))) {
    return { type: "number", options: [], default: 1, min: 0, max: 1000000, help_text: "Accepted range: 0 to 1,000,000." };
  }

  return { type: "number", options: [], default: 1, min: 0, max: 1000000000, help_text: "Accepted range: 0 to 1,000,000,000." };
}

/**
 * Resolve equation ID from step
 */
function resolveEquationIdFromStep(step: CalculationStepRow): string | null {
  if (step.formula_ref && step.formula_ref.trim()) {
    return step.formula_ref.trim();
  }
  if (step.formula && step.formula.startsWith("eq:")) {
    return step.formula.split(":")[1]?.trim() || null;
  }
  return null;
}

/**
 * Extract config items from step config
 */
function extractConfigItems(config: string | null, keys: string[]): unknown[] {
  if (!config) return [];
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(config);
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed.filter(item => item);
  }
  
  if (typeof parsed !== 'object' || parsed === null) {
    return [];
  }

  const items: unknown[] = [];
  for (const key of keys) {
    const value = (parsed as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      items.push(...value.filter(item => item));
    }
  }
  return items;
}

function isGenericFieldName(name: string): boolean {
  const value = String(name || '').trim().toLowerCase();
  if (!value) return true;
  if (/^input_value_\d+$/.test(value) || /^output_value_\d+$/.test(value)) return true;
  return ['result', 'status', 'value', 'calculated_value', 'limit_value'].includes(value);
}

function humanizeFieldName(name: string): string {
  return String(name || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildFallbackFormula(
  step: CalculationStepRow,
  inputs: Array<Record<string, unknown>>,
  outputs: Array<Record<string, unknown>>,
): string {
  const existingFormula = String(step.formula || '').trim();
  if (existingFormula) return existingFormula;

  const lhs = String(outputs[0]?.symbol || outputs[0]?.name || 'result').trim() || 'result';
  const rhsArgs = inputs
    .slice(0, 6)
    .map((input) => String(input.symbol || input.name || '').trim())
    .filter(Boolean);

  if (rhsArgs.length > 0) {
    return `${lhs} = f(${rhsArgs.join(', ')})`;
  }

  return `${lhs} = f(inputs)`;
}

function enrichInputField(rawInput: unknown): Record<string, unknown> {
  const input = (rawInput && typeof rawInput === 'object')
    ? { ...(rawInput as Record<string, unknown>) }
    : {};

  const name = String(input.name || '').trim();
  const symbol = String(input.symbol || '').trim();
  const metadata = inferInputMetadata(name || symbol || 'value', String(input.type || 'number'));

  const resolvedName = name || symbol || 'input_value';
  const displayLabel = String(input.label || '').trim();
  if (!displayLabel) {
    input.label = isGenericFieldName(resolvedName)
      ? (String(input.help_text || '').trim() || humanizeFieldName(symbol || resolvedName))
      : humanizeFieldName(resolvedName);
  }

  if (input.type === undefined || input.type === null || String(input.type).trim() === '') {
    input.type = metadata.type;
  }
  if (input.default === undefined && input.default_value === undefined) {
    input.default = metadata.default;
  }
  if (input.min_value === undefined || input.min_value === null) {
    input.min_value = metadata.min;
  }
  if (input.max_value === undefined || input.max_value === null) {
    input.max_value = metadata.max;
  }
  if (!String(input.help_text || '').trim()) {
    input.help_text = metadata.help_text;
  }
  if (!Array.isArray(input.options) && metadata.options.length > 0) {
    input.options = metadata.options;
  }

  if (String(input.unit || '').trim() === '-') {
    input.unit = '';
  }

  input.name = resolvedName;
  return input;
}

function enrichOutputField(rawOutput: unknown): Record<string, unknown> {
  const output = (rawOutput && typeof rawOutput === 'object')
    ? { ...(rawOutput as Record<string, unknown>) }
    : {};

  const name = String(output.name || '').trim();
  const symbol = String(output.symbol || '').trim();
  const resolvedName = name || symbol || 'result';

  if (!String(output.label || '').trim()) {
    output.label = isGenericFieldName(resolvedName)
      ? humanizeFieldName(symbol || resolvedName)
      : humanizeFieldName(resolvedName);
  }

  if (output.precision === undefined || output.precision === null) {
    output.precision = 2;
  }

  if (String(output.unit || '').trim() === '-') {
    output.unit = '';
  }

  output.name = resolvedName;
  return output;
}

/**
 * Check if step is meaningful (has formula, equation, or inputs)
 */
function isMeaningfulStep(step: CalculationStepRow): boolean {
  const hasFormula = Boolean((step.formula || "").trim());
  const hasEquation = Boolean(resolveEquationIdFromStep(step));
  const hasInputs = extractConfigItems(step.input_config, ["inputs", "coefficients"]).length > 0;
  return hasFormula || hasEquation || hasInputs;
}

/**
 * Filter meaningful steps
 */
function filterMeaningfulSteps(steps: CalculationStepRow[]): CalculationStepRow[] {
  return steps.filter(isMeaningfulStep);
}

/**
 * Calculate step quality score for deduplication
 */
function stepQualityScore(step: CalculationStepRow): number {
  let score = 0;
  const stepId = String(step.step_id || "").trim().toLowerCase();
  const formulaRef = String(step.formula_ref || "").trim();
  const formula = String(step.formula || "").trim();
  
  if (formulaRef) score += 5;
  if (formula) score += 3;
  if (extractConfigItems(step.input_config, ["inputs", "coefficients"]).length > 0) score += 3;
  if (extractConfigItems(step.output_config, ["outputs"]).length > 0) score += 1;
  if (stepId.startsWith("step_")) score -= 2;
  
  return score;
}

/**
 * Deduplicate steps by step_number, preferring richer (real) step rows
 */
function dedupeSteps(steps: CalculationStepRow[]): CalculationStepRow[] {
  const bestByNumber: Record<number, CalculationStepRow> = {};
  
  for (const step of steps) {
    const stepNumber = step.step_number || 0;
    if (!(stepNumber in bestByNumber)) {
      bestByNumber[stepNumber] = step;
      continue;
    }
    
    const currentBest = bestByNumber[stepNumber];
    if (stepQualityScore(step) > stepQualityScore(currentBest)) {
      bestByNumber[stepNumber] = step;
    }
  }
  
  return Object.keys(bestByNumber)
    .map(Number)
    .sort((a, b) => a - b)
    .map(n => bestByNumber[n]);
}

/**
 * Classify difficulty based on pipeline and step count
 */
function classifyDifficulty(pipeline: CalculationPipelineRow, stepCount: number): string {
  const level = String(pipeline.difficulty_level || "").trim().toLowerCase();
  if (["beginner", "intermediate", "advanced"].includes(level)) {
    return level;
  }
  if (stepCount <= 5) return "beginner";
  if (stepCount >= 8) return "advanced";
  return "intermediate";
}

/**
 * GET /api/pipelines
 * List all calculation pipelines
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pipelines = prepareWorkflows(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.is_active = 1
      ORDER BY cp.name ASC
    `).all() as unknown as CalculationPipelineRow[];

    const result = [];
    for (const pipeline of pipelines) {
      const rawSteps = prepareWorkflows(`
        SELECT * FROM calculation_steps
        WHERE pipeline_id = ? AND is_active = 1
        ORDER BY step_number ASC
      `).all(pipeline.id) as unknown as CalculationStepRow[];
      
      const steps = filterMeaningfulSteps(dedupeSteps(rawSteps));
      const stepCount = steps.length;
      const difficultyLevel = classifyDifficulty(pipeline, stepCount);

      let tags: unknown[] = [];
      try {
        tags = pipeline.tags ? JSON.parse(pipeline.tags) : [];
      } catch {
        tags = [];
      }

      result.push({
        id: pipeline.pipeline_id,
        name: pipeline.name,
        description: pipeline.description || "",
        domain: pipeline.domain,
        difficulty_level: difficultyLevel,
        difficulty: difficultyLevel,
        estimated_time: pipeline.estimated_time,
        tags: tags,
        step_count: stepCount,
        steps: [], // Steps loaded on demand
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/domains
 * Get available pipeline domains
 */
router.get('/domains', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const domains = prepareWorkflows(`
      SELECT DISTINCT domain FROM calculation_pipelines WHERE is_active = 1 AND domain IS NOT NULL
    `).all() as { domain: string }[];

    res.json(domains.map(d => d.domain));
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
    const totalPipelines = prepareWorkflows(`
      SELECT COUNT(*) as count FROM calculation_pipelines WHERE is_active = 1
    `).get() as { count: number };

    const totalSteps = prepareWorkflows(`
      SELECT COUNT(*) as count FROM calculation_steps WHERE is_active = 1
    `).get() as { count: number };

    const byDomain = prepareWorkflows(`
      SELECT domain, COUNT(*) as count
      FROM calculation_pipelines
      WHERE is_active = 1
      GROUP BY domain
    `).all();

    const byDifficulty = prepareWorkflows(`
      SELECT difficulty_level, COUNT(*) as count
      FROM calculation_pipelines
      WHERE is_active = 1
      GROUP BY difficulty_level
    `).all();

    res.json({
      total_pipelines: totalPipelines.count,
      total_steps: totalSteps.count,
      byDomain,
      byDifficulty,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/standards
 * Get engineering standards
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
 * GET /api/pipelines/:id
 * Get pipeline by ID with steps and full input/output configuration
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);

    // Try numeric id first, then pipeline_id string
    let pipeline: CalculationPipelineRow | undefined;
    const numericId = parseInt(idParam, 10);
    if (!isNaN(numericId)) {
      pipeline = prepareWorkflows(`
        SELECT cp.*, es.name as standard_name
        FROM calculation_pipelines cp
        LEFT JOIN engineering_standards es ON cp.standard_id = es.id
        WHERE cp.id = ? AND cp.is_active = 1
      `).get(numericId) as unknown as CalculationPipelineRow | undefined;
    }
    if (!pipeline) {
      pipeline = prepareWorkflows(`
        SELECT cp.*, es.name as standard_name
        FROM calculation_pipelines cp
        LEFT JOIN engineering_standards es ON cp.standard_id = es.id
        WHERE cp.pipeline_id = ? AND cp.is_active = 1
      `).get(idParam) as unknown as CalculationPipelineRow | undefined;
    }

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    const rawSteps = prepareWorkflows(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(pipeline.id) as unknown as CalculationStepRow[];

    const steps = filterMeaningfulSteps(dedupeSteps(rawSteps));

    // Build inputs from steps and equations
    const inputs: Array<Record<string, unknown>> = [];
    const inputIndex: Record<string, number> = {};
    const seenInputNames = new Set<string>();

    // First, check step input_config fields
    for (const step of steps) {
      const stepInputs = extractConfigItems(step.input_config, ["inputs", "coefficients"]);
      
      for (const inp of stepInputs) {
        const inpObj = inp as Record<string, unknown>;
        const inpName = inpObj.name ? String(inpObj.name) : '';
        
        if (inpName && !seenInputNames.has(inpName)) {
          seenInputNames.add(inpName);
          const meta = inferInputMetadata(inpName, inpObj.type ? String(inpObj.type) : 'number');
          
          inputs.push({
            name: inpName,
            type: inpObj.type || meta.type,
            description: inpObj.description || '',
            required: inpObj.required !== undefined ? inpObj.required : true,
            default_value: inpObj.default !== undefined && inpObj.default !== null ? inpObj.default : meta.default,
            min_value: inpObj.min_value !== undefined ? inpObj.min_value : meta.min,
            max_value: inpObj.max_value !== undefined ? inpObj.max_value : meta.max,
            placeholder: inpObj.unit || '',
            help_text: inpObj.help_text || meta.help_text,
            options: inpObj.options || meta.options,
          });
          inputIndex[inpName] = inputs.length - 1;
        }
      }
    }

    // Second, check equations referenced in steps
    for (const step of steps) {
      const equationId = resolveEquationIdFromStep(step);
      if (equationId) {
        const equation = prepareWorkflows(`
          SELECT * FROM equations WHERE equation_id = ? AND is_active = 1
        `).get(equationId) as unknown as EquationRow | undefined;

        if (equation) {
          const eqInputs = prepareWorkflows(`
            SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
          `).all(equation.id) as unknown as EquationInputRow[];

          for (const inp of eqInputs) {
            if (!seenInputNames.has(inp.name)) {
              seenInputNames.add(inp.name);
              inputs.push({
                name: inp.name,
                type: ["float", "int", "integer"].includes(inp.data_type || '') ? "number" : inp.data_type,
                description: inp.description,
                required: inp.required === 1,
                default_value: inp.default_value,
                min_value: inp.min_value,
                max_value: inp.max_value,
                placeholder: inp.unit,
                help_text: inp.help_text,
                options: [],
              });
              inputIndex[inp.name] = inputs.length - 1;
            } else {
              // Enrich existing input with equation metadata
              const idx = inputIndex[inp.name];
              if (idx !== undefined) {
                const existing = inputs[idx];
                if (existing.default_value === null || existing.default_value === undefined) {
                  existing.default_value = inp.default_value;
                }
                if (existing.min_value === null || existing.min_value === undefined) {
                  existing.min_value = inp.min_value;
                }
                if (existing.max_value === null || existing.max_value === undefined) {
                  existing.max_value = inp.max_value;
                }
                if (!existing.help_text) {
                  existing.help_text = inp.help_text;
                }
                if (!existing.placeholder) {
                  existing.placeholder = inp.unit;
                }
              }
            }
          }
        }
      }
    }

    // Build outputs
    const outputs: Array<Record<string, unknown>> = [];
    const seenOutputNames = new Set<string>();

    // First check step output_config fields
    for (const step of steps) {
      const stepOutputs = extractConfigItems(step.output_config, ["outputs"]);
      
      for (const out of stepOutputs) {
        const outObj = out as Record<string, unknown>;
        const outName = outObj.name ? String(outObj.name) : '';
        
        if (outName && !seenOutputNames.has(outName)) {
          seenOutputNames.add(outName);
          outputs.push({
            name: outName,
            type: outObj.type || 'number',
            description: outObj.description || '',
            precision: outObj.precision || 2,
          });
        }
      }
    }

    // Then check equations
    for (const step of steps) {
      const equationId = resolveEquationIdFromStep(step);
      if (equationId) {
        const equation = prepareWorkflows(`
          SELECT * FROM equations WHERE equation_id = ? AND is_active = 1
        `).get(equationId) as unknown as EquationRow | undefined;

        if (equation) {
          const eqOutputs = prepareWorkflows(`
            SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
          `).all(equation.id) as unknown as EquationOutputRow[];

          for (const out of eqOutputs) {
            if (!seenOutputNames.has(out.name)) {
              seenOutputNames.add(out.name);
              outputs.push({
                name: out.name,
                type: ["float", "int", "integer"].includes(out.data_type || '') ? "number" : out.data_type,
                description: out.description,
                unit: out.unit,
                precision: out.precision,
              });
            }
          }
        }
      }
    }

    // Get dependencies
    const dependencies = prepareWorkflows(`
      SELECT * FROM calculation_dependencies WHERE pipeline_id = ?
    `).all(pipeline.id);

    // Parse tags
    let tags: unknown[] = [];
    try {
      tags = pipeline.tags ? JSON.parse(pipeline.tags) : [];
    } catch {
      tags = [];
    }

    // Format steps for response
    const formattedSteps = steps.map(step => {
      const rawInputs = extractConfigItems(step.input_config, ["inputs", "coefficients"]);
      const rawOutputs = extractConfigItems(step.output_config, ["outputs"]);
      const inputConfig = rawInputs.map(enrichInputField);
      const outputConfig = rawOutputs.map(enrichOutputField);
      const equationId = resolveEquationIdFromStep(step);

      return {
        id: step.step_id,
        step_number: step.step_number,
        name: step.name,
        description: step.description,
        calculation_type: step.calculation_type,
        equation_id: equationId,
        formula_ref: step.formula_ref,
        formula: buildFallbackFormula(step, inputConfig, outputConfig),
        input_config: inputConfig,
        output_config: outputConfig,
        validation_config: step.validation_config,
      };
    });

    res.json({
      id: pipeline.pipeline_id,
      pipeline_id: pipeline.pipeline_id,
      name: pipeline.name,
      description: pipeline.description || "",
      domain: pipeline.domain,
      standard: pipeline.standard_name ? { name: pipeline.standard_name } : null,
      inputs,
      outputs,
      steps: formattedSteps,
      dependencies,
      tags,
      difficulty_level: pipeline.difficulty_level,
      estimated_time: pipeline.estimated_time,
    });
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

    const pipeline = prepareWorkflows(`
      SELECT cp.*, es.name as standard_name
      FROM calculation_pipelines cp
      LEFT JOIN engineering_standards es ON cp.standard_id = es.id
      WHERE cp.pipeline_id = ? AND cp.is_active = 1
    `).get(pipelineId) as unknown as CalculationPipelineRow | undefined;

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    // Get steps and build full response (same logic as :id route)
    const rawSteps = prepareWorkflows(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(pipeline.id) as unknown as CalculationStepRow[];

    const steps = filterMeaningfulSteps(dedupeSteps(rawSteps));

    let tags: unknown[] = [];
    try {
      tags = pipeline.tags ? JSON.parse(pipeline.tags) : [];
    } catch {
      tags = [];
    }

    res.json({
      id: pipeline.pipeline_id,
      pipeline_id: pipeline.pipeline_id,
      name: pipeline.name,
      description: pipeline.description || "",
      domain: pipeline.domain,
      standard: pipeline.standard_name ? { name: pipeline.standard_name } : null,
      steps: steps.map(step => ({
        id: step.step_id,
        step_number: step.step_number,
        name: step.name,
        description: step.description,
        calculation_type: step.calculation_type,
        formula_ref: step.formula_ref,
        formula: step.formula,
      })),
      tags,
      difficulty_level: pipeline.difficulty_level,
      estimated_time: pipeline.estimated_time,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pipelines/:id/execute
 * Execute a calculation pipeline using the enhanced DAG-based engine
 */
router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const { inputs } = req.body;

    // Try to find pipeline by numeric ID or pipeline_id string
    let pipeline: CalculationPipelineRow | undefined;
    const numericId = parseInt(idParam, 10);
    
    if (!isNaN(numericId)) {
      pipeline = prepareWorkflows(`
        SELECT * FROM calculation_pipelines WHERE id = ? AND is_active = 1
      `).get(numericId) as unknown as CalculationPipelineRow | undefined;
    }
    if (!pipeline) {
      pipeline = prepareWorkflows(`
        SELECT * FROM calculation_pipelines WHERE pipeline_id = ? AND is_active = 1
      `).get(idParam) as unknown as CalculationPipelineRow | undefined;
    }

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    // Use the enhanced calculation engine - get the db instance for the engine
    const db = getWorkflowsDb();
    const engine = new CalculationEngine(db);
    
    try {
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
        steps: Object.values(result.steps).map(step => ({
          step_id: step.step_id,
          name: step.name,
          inputs: step.inputs,
          outputs: step.outputs,
          execution_time: step.execution_time,
          validation: step.validation,
          error: step.error,
        })),
        timestamp: new Date(),
      });
    } catch (execError) {
      throw new ValidationError(`Pipeline execution failed: ${execError instanceof Error ? execError.message : String(execError)}`);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/:id/execution-history
 * Get execution history for a pipeline
 */
router.get('/:id/execution-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = String(req.params.id);
    const limit = parseInt(String(req.query.limit || '20'), 10);

    let pipeline: CalculationPipelineRow | undefined;
    const numericId = parseInt(idParam, 10);
    
    if (!isNaN(numericId)) {
      pipeline = prepareWorkflows(`
        SELECT * FROM calculation_pipelines WHERE id = ? AND is_active = 1
      `).get(numericId) as CalculationPipelineRow | undefined;
    }
    if (!pipeline) {
      pipeline = prepareWorkflows(`
        SELECT * FROM calculation_pipelines WHERE pipeline_id = ? AND is_active = 1
      `).get(idParam) as CalculationPipelineRow | undefined;
    }

    if (!pipeline) {
      throw new NotFoundError('Pipeline not found');
    }

    // Get the db instance for the engine
    const db = getWorkflowsDb();
    const engine = new CalculationEngine(db);
    const history = engine.getExecutionHistory(pipeline.pipeline_id, limit);

    res.json({
      pipeline_id: pipeline.pipeline_id,
      execution_history: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pipelines/engineering-functions
 * Get available engineering calculation functions
 */
router.get('/engineering-functions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      functions: [
        { name: 'sqrt', description: 'Square root', usage: 'sqrt(value)' },
        { name: 'sin', description: 'Sine (degrees)', usage: 'sin(degrees)' },
        { name: 'cos', description: 'Cosine (degrees)', usage: 'cos(degrees)' },
        { name: 'tan', description: 'Tangent (degrees)', usage: 'tan(degrees)' },
        { name: 'asin', description: 'Arc sine (returns degrees)', usage: 'asin(value)' },
        { name: 'acos', description: 'Arc cosine (returns degrees)', usage: 'acos(value)' },
        { name: 'atan', description: 'Arc tangent (returns degrees)', usage: 'atan(value)' },
        { name: 'log', description: 'Base-10 logarithm', usage: 'log(value)' },
        { name: 'ln', description: 'Natural logarithm', usage: 'ln(value)' },
        { name: 'exp', description: 'Exponential', usage: 'exp(value)' },
        { name: 'pow', description: 'Power', usage: 'pow(base, exponent)' },
        { name: 'abs', description: 'Absolute value', usage: 'abs(value)' },
        { name: 'round', description: 'Round to decimals', usage: 'round(value, decimals)' },
        { name: 'ceil', description: 'Ceiling', usage: 'ceil(value)' },
        { name: 'floor', description: 'Floor', usage: 'floor(value)' },
        { name: 'max', description: 'Maximum of values', usage: 'max(a, b, ...)' },
        { name: 'min', description: 'Minimum of values', usage: 'min(a, b, ...)' },
        { name: 'sum', description: 'Sum of array', usage: 'sum([a, b, ...])' },
        { name: 'avg', description: 'Average of array', usage: 'avg([a, b, ...])' },
        { name: 'select_cable', description: 'Select standard cable size from ampacity', usage: 'select_cable(ampacity)' },
        { name: 'select_standard_size', description: 'Select standard transformer size', usage: 'select_standard_size(kva)' },
        { name: 'next_standard_size', description: 'Get next standard size', usage: 'next_standard_size(value)' },
        { name: 'apply_demand_factor', description: 'Apply demand factor to load', usage: 'apply_demand_factor(total_connected)' },
        { name: 'lookup_cu_table', description: 'Lookup coefficient of utilization', usage: 'lookup_cu_table(rcr, wall_ref, ceil_ref)' },
        { name: 'voltage_drop', description: 'Calculate voltage drop percentage', usage: 'voltage_drop(current, length, resistance, voltage)' },
        { name: 'pf_correction_capacitor', description: 'Calculate PF correction capacitor (kVAR)', usage: 'pf_correction_capacitor(p, pf_initial, pf_target)' },
        { name: 'three_phase_power', description: 'Calculate three-phase power (kW)', usage: 'three_phase_power(voltage, current, pf)' },
        { name: 'short_circuit_current', description: 'Calculate short circuit current', usage: 'short_circuit_current(kva, impedance, voltage)' },
        { name: 'beam_deflection', description: 'Calculate beam deflection', usage: 'beam_deflection(load, length, elasticity, inertia, loadType)' },
        { name: 'bending_stress', description: 'Calculate bending stress', usage: 'bending_stress(moment, section_modulus)' },
        { name: 'shear_stress', description: 'Calculate shear stress', usage: 'shear_stress(shear_force, area)' },
        { name: 'reynolds_number', description: 'Calculate Reynolds number', usage: 'reynolds_number(density, velocity, diameter, viscosity)' },
        { name: 'darcy_friction_factor', description: 'Calculate Darcy friction factor', usage: 'darcy_friction_factor(reynolds, roughness, diameter)' },
        { name: 'pressure_drop', description: 'Calculate pressure drop in pipe', usage: 'pressure_drop(friction_factor, length, diameter, density, velocity)' },
        { name: 'heat_transfer_coefficient', description: 'Calculate heat transfer coefficient', usage: 'heat_transfer_coefficient(reynolds, prandtl, conductivity, diameter)' },
      ],
      constants: [
        { name: 'PI', value: Math.PI, description: 'Pi constant' },
        { name: 'E', value: Math.E, description: 'Euler number' },
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
