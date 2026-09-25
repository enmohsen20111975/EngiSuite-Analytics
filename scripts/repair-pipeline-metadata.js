import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

const STOP_WORDS = new Set([
  'step', 'calculation', 'calculate', 'analysis', 'design', 'system', 'check', 'review', 'quick', 'complete',
  'comprehensive', 'assistant', 'estimation', 'estimate', 'sizing', 'assessment', 'verification', 'workflow',
  'method', 'based', 'using', 'from', 'for', 'and', 'with', 'the', 'of', 'to', 'in', 'per'
]);

const GENERIC_NAMES = new Set(['result', 'status', 'value', 'input', 'output', 'input_value', 'output_value', 'calculated_value', 'limit_value']);

function normalizeFormulaText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\u2212/g, '-')
    .replace(/\*\*/g, '^')
    .trim();
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function isGenericName(name) {
  const v = String(name || '').toLowerCase().trim();
  if (!v) return true;
  if (/^input_value_\d+$/.test(v) || /^output_value_\d+$/.test(v)) return true;
  if (/^x\d+$/.test(v) || /^var\d+$/.test(v)) return true;
  return GENERIC_NAMES.has(v);
}

function parseConfig(raw, keys) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      for (const key of keys) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
    }
    return [];
  } catch {
    return [];
  }
}

function toStepInput(eqInput) {
  return {
    name: eqInput.name,
    symbol: eqInput.symbol || eqInput.name,
    unit: eqInput.unit || '',
    type: ['float', 'int', 'integer'].includes(String(eqInput.data_type || '').toLowerCase()) ? 'number' : (eqInput.data_type || 'number'),
    required: Number(eqInput.required || 0) === 1,
    default: eqInput.default_value,
    min_value: eqInput.min_value,
    max_value: eqInput.max_value,
    help_text: eqInput.help_text || eqInput.description || '',
    description: eqInput.description || '',
  };
}

function toStepOutput(eqOutput) {
  return {
    name: eqOutput.name,
    symbol: eqOutput.symbol || eqOutput.name,
    unit: eqOutput.unit || '',
    type: ['float', 'int', 'integer'].includes(String(eqOutput.data_type || '').toLowerCase()) ? 'number' : (eqOutput.data_type || 'number'),
    precision: eqOutput.precision ?? 2,
    description: eqOutput.description || '',
  };
}

function scoreEquationMatch(step, pipeline, equation) {
  let score = 0;

  const stepText = [step.name, step.description, pipeline.name, pipeline.description].filter(Boolean).join(' ');
  const stepTokens = new Set(tokenize(stepText));
  const eqText = [equation.name, equation.description, equation.tags].filter(Boolean).join(' ');
  const eqTokens = new Set(tokenize(eqText));

  for (const token of stepTokens) {
    if (eqTokens.has(token)) score += 2;
  }

  const sName = String(step.name || '').toLowerCase();
  const eName = String(equation.name || '').toLowerCase();
  if (sName && eName.includes(sName)) score += 4;
  if (eName && sName.includes(eName)) score += 4;

  // Formula string exact match boost
  const stepFormula = normalizeFormulaText(step.formula);
  const eqFormula = normalizeFormulaText(equation.equation);
  if (stepFormula && eqFormula && stepFormula === eqFormula) score += 20;

  // Domain consistency boost
  if ((pipeline.domain || '') === (equation.domain || '')) score += 3;

  // Specific keyword boosts
  const keywords = ['battery', 'ups', 'voltage', 'current', 'power', 'flow', 'pressure', 'beam', 'pump', 'hvac', 'lighting', 'ground'];
  for (const k of keywords) {
    if (sName.includes(k) && eName.includes(k)) score += 3;
  }

  return score;
}

try {
  const db = new Database(dbPath, { readonly: false });
  db.pragma('foreign_keys = ON');

  const pipelines = db.prepare(`
    SELECT id, pipeline_id, name, description, domain
    FROM calculation_pipelines
    WHERE is_active = 1
  `).all();

  const equations = db.prepare(`
    SELECT id, equation_id, name, description, domain, equation, tags
    FROM equations
    WHERE is_active = 1
  `).all();

  const eqById = new Map();
  for (const e of equations) {
    eqById.set(e.equation_id, e);
  }

  const eqInputsByEqInternalId = new Map();
  const eqOutputsByEqInternalId = new Map();

  const updateStep = db.prepare(`
    UPDATE calculation_steps
    SET formula_ref = ?, formula = ?, input_config = ?, output_config = ?
    WHERE id = ?
  `);

  let totalSteps = 0;
  let updatedSteps = 0;
  let matchedByFormula = 0;
  let matchedByFuzzy = 0;
  let skippedNoMatch = 0;

  for (const pipeline of pipelines) {
    const steps = db.prepare(`
      SELECT * FROM calculation_steps
      WHERE pipeline_id = ? AND is_active = 1
      ORDER BY step_number ASC
    `).all(pipeline.id);

    for (const step of steps) {
      totalSteps++;

      const currentInputs = parseConfig(step.input_config, ['inputs', 'coefficients']);
      const currentOutputs = parseConfig(step.output_config, ['outputs']);

      const hasGenericInputs = currentInputs.some((i) => isGenericName(i?.name));
      const hasGenericOutputs = currentOutputs.some((o) => isGenericName(o?.name));
      const hasWeakUnits = [...currentInputs, ...currentOutputs].some((x) => {
        const unit = String(x?.unit || '').trim();
        return !unit || unit === '-';
      });
      const needsEnrichment = !String(step.formula || '').trim() || hasGenericInputs || hasGenericOutputs || hasWeakUnits || !String(step.formula_ref || '').trim();
      if (!needsEnrichment) continue;

      let matchedEquation = null;

      // 1) Try explicit formula_ref
      if (step.formula_ref && eqById.has(step.formula_ref)) {
        matchedEquation = eqById.get(step.formula_ref);
      }

      // 2) Try exact formula match
      if (!matchedEquation && step.formula) {
        const target = normalizeFormulaText(step.formula);
        if (target) {
          for (const eq of equations) {
            if (normalizeFormulaText(eq.equation) === target) {
              matchedEquation = eq;
              matchedByFormula++;
              break;
            }
          }
        }
      }

      // 3) Fuzzy by step + pipeline naming
      if (!matchedEquation) {
        const candidates = equations.filter((eq) => !pipeline.domain || !eq.domain || eq.domain === pipeline.domain);
        let best = null;
        let bestScore = -1;
        for (const eq of candidates) {
          const score = scoreEquationMatch(step, pipeline, eq);
          if (score > bestScore) {
            bestScore = score;
            best = eq;
          }
        }
        if (best && bestScore >= 6) {
          matchedEquation = best;
          matchedByFuzzy++;
        }
      }

      if (!matchedEquation) {
        skippedNoMatch++;
        continue;
      }

      if (!eqInputsByEqInternalId.has(matchedEquation.id)) {
        const eqInputs = db.prepare(`
          SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order ASC
        `).all(matchedEquation.id);
        eqInputsByEqInternalId.set(matchedEquation.id, eqInputs);
      }
      if (!eqOutputsByEqInternalId.has(matchedEquation.id)) {
        const eqOutputs = db.prepare(`
          SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order ASC
        `).all(matchedEquation.id);
        eqOutputsByEqInternalId.set(matchedEquation.id, eqOutputs);
      }

      const eqInputs = eqInputsByEqInternalId.get(matchedEquation.id) || [];
      const eqOutputs = eqOutputsByEqInternalId.get(matchedEquation.id) || [];

      // Build replacement configs when current ones are weak/generic
      let nextInputs = currentInputs;
      let nextOutputs = currentOutputs;

      const shouldReplaceInputs = currentInputs.length === 0 || hasGenericInputs || currentInputs.every((i) => {
        const unit = String(i?.unit || '').trim();
        return !unit || unit === '-';
      });
      const shouldReplaceOutputs = currentOutputs.length === 0 || hasGenericOutputs || currentOutputs.every((o) => {
        const unit = String(o?.unit || '').trim();
        return !unit || unit === '-';
      });

      if (shouldReplaceInputs && eqInputs.length > 0) {
        nextInputs = eqInputs.map(toStepInput);
      }
      if (shouldReplaceOutputs && eqOutputs.length > 0) {
        nextOutputs = eqOutputs.map(toStepOutput);
      }

      const nextFormulaRef = step.formula_ref && String(step.formula_ref).trim() ? step.formula_ref : matchedEquation.equation_id;
      const nextFormula = step.formula && String(step.formula).trim() ? step.formula : (matchedEquation.equation || null);

      updateStep.run(
        nextFormulaRef,
        nextFormula,
        JSON.stringify(nextInputs),
        JSON.stringify(nextOutputs),
        step.id
      );
      updatedSteps++;
    }
  }

  console.log('=== Pipeline Metadata Repair Summary ===');
  console.log('Total steps scanned:', totalSteps);
  console.log('Steps updated:', updatedSteps);
  console.log('Matched by exact formula:', matchedByFormula);
  console.log('Matched by fuzzy name/domain:', matchedByFuzzy);
  console.log('Skipped (no good match):', skippedNoMatch);

  db.close();
} catch (error) {
  console.error('Repair failed:', error);
  process.exit(1);
}
