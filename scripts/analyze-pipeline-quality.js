import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

const isGenericName = (name) => {
  const v = String(name || '').toLowerCase();
  return /^input_value_\d+$/.test(v) || /^output_value_\d+$/.test(v) || v === 'result' || v === 'status' || v === 'value';
};

try {
  const db = new Database(dbPath, { readonly: true });

  const pipelines = db.prepare('SELECT id, pipeline_id, name FROM calculation_pipelines WHERE is_active = 1').all();
  const steps = db.prepare('SELECT * FROM calculation_steps WHERE is_active = 1 ORDER BY pipeline_id, step_number').all();

  let totalSteps = 0;
  let missingFormula = 0;
  let missingEquationRef = 0;
  let genericInputs = 0;
  let genericOutputs = 0;
  let missingUnits = 0;
  let missingRanges = 0;

  const perPipeline = [];

  for (const p of pipelines) {
    const pSteps = steps.filter(s => s.pipeline_id === p.id);
    let pMissing = 0;

    for (const s of pSteps) {
      totalSteps++;
      const hasFormula = Boolean(String(s.formula || '').trim());
      const hasEqRef = Boolean(String(s.formula_ref || '').trim());
      if (!hasFormula) { missingFormula++; pMissing++; }
      if (!hasEqRef) { missingEquationRef++; }

      let inputs = [];
      let outputs = [];
      try {
        const parsed = s.input_config ? JSON.parse(s.input_config) : [];
        inputs = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.inputs) ? parsed.inputs : []);
      } catch {}
      try {
        const parsed = s.output_config ? JSON.parse(s.output_config) : [];
        outputs = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.outputs) ? parsed.outputs : []);
      } catch {}

      for (const i of inputs) {
        if (isGenericName(i?.name)) genericInputs++;
        const unit = String(i?.unit ?? '').trim();
        if (!unit || unit === '-') missingUnits++;
        if (i?.min_value === undefined || i?.max_value === undefined || i?.min_value === null || i?.max_value === null) missingRanges++;
      }
      for (const o of outputs) {
        if (isGenericName(o?.name)) genericOutputs++;
        const unit = String(o?.unit ?? '').trim();
        if (!unit || unit === '-') missingUnits++;
      }
    }

    if (pMissing > 0) {
      perPipeline.push({ pipeline_id: p.pipeline_id, name: p.name, steps: pSteps.length, steps_missing_formula: pMissing });
    }
  }

  console.log('=== Pipeline Quality Summary ===');
  console.log('Pipelines:', pipelines.length);
  console.log('Steps:', totalSteps);
  console.log('Missing formula:', missingFormula);
  console.log('Missing equation ref:', missingEquationRef);
  console.log('Generic inputs:', genericInputs);
  console.log('Generic outputs:', genericOutputs);
  console.log('Missing units (inputs+outputs):', missingUnits);
  console.log('Missing ranges (inputs):', missingRanges);
  console.log('\nTop pipelines with missing formulas:');
  console.table(perPipeline.slice(0, 20));

  db.close();
} catch (error) {
  console.error(error);
  process.exit(1);
}
