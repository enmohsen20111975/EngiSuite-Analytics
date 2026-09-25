import { Router, Request, Response } from 'express';
import { ENGINEERING_PIPELINES, getPipelineById, EngineeringPipeline, PipelineStep } from '../data/engineeringPipelines';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripFn(pipeline: EngineeringPipeline) {
  return {
    ...pipeline,
    steps: pipeline.steps.map(s => {
      const { calculate, ...rest } = s as any;
      return rest;
    })
  };
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── GET /api/local-pipelines ─────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const list = ENGINEERING_PIPELINES.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    domain: p.domain,
    difficulty: p.difficulty,
    estimated_time: p.estimated_time,
    icon: p.icon,
    step_count: p.steps.length
  }));
  res.json({ success: true, data: list });
});

// ─── GET /api/local-pipelines/:id ────────────────────────────────────────────

router.get('/:id', (req: Request, res: Response) => {
  const pipeline = getPipelineById(req.params.id as string);
  if (!pipeline) {
    return res.status(404).json({ success: false, error: 'Pipeline not found' });
  }
  res.json({ success: true, data: stripFn(pipeline) });
});

// ─── POST /api/local-pipelines/:id/steps/:stepNumber/calculate ───────────────

router.post('/:id/steps/:stepNumber/calculate', (req: Request, res: Response) => {
  const pipeline = getPipelineById(req.params.id as string);
  if (!pipeline) {
    return res.status(404).json({ success: false, error: 'Pipeline not found' });
  }

  const stepNumber = parseInt(req.params.stepNumber as string, 10);
  const step = pipeline.steps.find(s => s.stepNumber === stepNumber);
  if (!step) {
    return res.status(404).json({ success: false, error: `Step ${stepNumber} not found in pipeline` });
  }

  const inputs: Record<string, number | string> = req.body.inputs ?? {};

  // Validate required inputs
  const missing: string[] = [];
  for (const inp of step.inputs) {
    if (inp.required && (inputs[inp.name] === undefined || inputs[inp.name] === '')) {
      missing.push(inp.label);
    }
  }
  if (missing.length > 0) {
    return res.status(400).json({ success: false, error: `Missing required inputs: ${missing.join(', ')}` });
  }

  // Coerce types
  const coerced: Record<string, number | string> = {};
  for (const inp of step.inputs) {
    const raw = inputs[inp.name];
    if (raw === undefined) {
      if (inp.default !== undefined) coerced[inp.name] = inp.default;
      continue;
    }
    coerced[inp.name] = inp.type === 'number' ? Number(raw) : String(raw);
  }

  let outputs: Record<string, number | string | boolean>;
  try {
    outputs = step.calculate(coerced);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: `Calculation error: ${err.message}` });
  }

  // Build warnings
  const warnings: string[] = [];
  for (const out of step.outputs) {
    if (out.isCompliance) {
      if (outputs[out.name] === false) {
        warnings.push(`${out.label}: FAILED — check design parameters`);
      }
    }
  }

  res.json({
    success: true,
    data: {
      step_number: stepNumber,
      step_name: step.name,
      outputs,
      formula_display: step.formula_display,
      standard_ref: step.standard_ref,
      warnings
    }
  });
});

// ─── POST /api/local-pipelines/:id/report ────────────────────────────────────

interface StepResult {
  stepNumber: number;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string | boolean>;
}

router.post('/:id/report', (req: Request, res: Response) => {
  const pipeline = getPipelineById(req.params.id as string);
  if (!pipeline) {
    return res.status(404).json({ success: false, error: 'Pipeline not found' });
  }

  const stepResults: StepResult[] = req.body.stepResults ?? [];

  const html = generateHtmlReport(pipeline, stepResults);
  const json = generateJsonReport(pipeline, stepResults);

  res.json({ success: true, data: { html, json } });
});

// ─── Report Generators ────────────────────────────────────────────────────────

function formatValue(val: number | string | boolean, precision: number = 2): string {
  if (typeof val === 'boolean') return val ? '✅ PASS' : '❌ FAIL';
  if (typeof val === 'number') return val.toFixed(precision);
  return String(val);
}

function generateHtmlReport(pipeline: EngineeringPipeline, stepResults: StepResult[]): string {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Build step sections
  let stepSections = '';
  for (const result of stepResults) {
    const step = pipeline.steps.find(s => s.stepNumber === result.stepNumber);
    if (!step) continue;

    // Inputs table
    let inputRows = '';
    for (const inp of step.inputs) {
      const val = result.inputs[inp.name];
      if (val === undefined) continue;
      inputRows += `<tr><td>${inp.label}</td><td><strong>${formatValue(val as any)}</strong></td><td>${inp.unit || '—'}</td><td class="help">${inp.help}</td></tr>`;
    }

    // Outputs table
    let outputRows = '';
    for (const out of step.outputs) {
      const val = result.outputs[out.name];
      if (val === undefined) continue;
      const complianceClass = out.isCompliance ? (val === true ? 'pass' : 'fail') : '';
      outputRows += `<tr class="${complianceClass}"><td>${out.label}</td><td><strong>${formatValue(val as any, out.precision)}</strong></td><td>${out.unit || '—'}</td></tr>`;
    }

    // Formula block
    const formulaLines = step.formula_display.map(f => `<code>${f}</code>`).join('<br>');

    stepSections += `
      <div class="step-section">
        <div class="step-header">
          <span class="step-badge">Step ${step.stepNumber}</span>
          <h2>${step.name}</h2>
          <span class="standard-badge">${step.standard_ref}</span>
        </div>
        <p class="step-desc">${step.description}</p>

        <div class="two-col">
          <div>
            <h3>Inputs</h3>
            <table>
              <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Notes</th></tr></thead>
              <tbody>${inputRows}</tbody>
            </table>
          </div>
          <div>
            <h3>Results</h3>
            <table>
              <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
              <tbody>${outputRows}</tbody>
            </table>
          </div>
        </div>

        <div class="formula-block">
          <h3>Governing Equations</h3>
          <div class="formula-lines">${formulaLines}</div>
        </div>
      </div>`;
  }

  // Final results summary
  const lastResult = stepResults[stepResults.length - 1];
  let summaryRows = '';
  if (lastResult) {
    const lastStep = pipeline.steps.find(s => s.stepNumber === lastResult.stepNumber);
    if (lastStep) {
      for (const out of lastStep.outputs) {
        const val = lastResult.outputs[out.name];
        if (val !== undefined) {
          const complianceClass = out.isCompliance ? (val === true ? 'pass' : 'fail') : '';
          summaryRows += `<tr class="${complianceClass}"><td>${out.label}</td><td><strong>${formatValue(val as any, out.precision)}</strong></td><td>${out.unit || '—'}</td></tr>`;
        }
      }
    }
  }

  // Collect all compliance checks
  let complianceSummary = '';
  for (const result of stepResults) {
    const step = pipeline.steps.find(s => s.stepNumber === result.stepNumber);
    if (!step) continue;
    for (const out of step.outputs) {
      if (out.isCompliance) {
        const val = result.outputs[out.name];
        const cls = val === true ? 'pass' : 'fail';
        complianceSummary += `<div class="compliance-item ${cls}">
          <strong>Step ${step.stepNumber}: ${out.label}</strong>
          <span>${val === true ? '✅ PASS' : '❌ FAIL'}</span>
        </div>`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${pipeline.name} — Engineering Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #f8f9fa; }
  .page { max-width: 1100px; margin: 0 auto; padding: 32px; background: #fff; }

  /* Header */
  .report-header { background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%); color: #fff; padding: 32px 36px; border-radius: 12px; margin-bottom: 32px; }
  .report-header h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
  .report-header .subtitle { font-size: 14px; opacity: 0.85; }
  .report-meta { display: flex; gap: 24px; margin-top: 16px; }
  .report-meta span { font-size: 12px; opacity: 0.8; }
  .domain-badge { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 3px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Compliance summary */
  .compliance-summary { background: #f5f5f5; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px; }
  .compliance-summary h2 { font-size: 15px; margin-bottom: 12px; color: #333; }
  .compliance-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
  .compliance-item.pass { background: #e8f5e9; color: #1b5e20; }
  .compliance-item.fail { background: #ffebee; color: #b71c1c; }

  /* Step sections */
  .step-section { border: 1px solid #e0e0e0; border-radius: 10px; padding: 24px; margin-bottom: 24px; }
  .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .step-badge { background: #1565c0; color: #fff; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .step-header h2 { font-size: 17px; color: #1a1a2e; flex: 1; }
  .standard-badge { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; border-radius: 20px; padding: 3px 10px; font-size: 11px; white-space: nowrap; }
  .step-desc { color: #555; line-height: 1.6; margin-bottom: 16px; font-size: 13px; }

  /* Tables */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
  h3 { font-size: 13px; font-weight: 600; color: #1565c0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #1565c0; color: #fff; padding: 7px 10px; text-align: left; font-weight: 500; }
  td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafafa; }
  tr.pass td { background: #e8f5e9 !important; }
  tr.fail td { background: #ffebee !important; }
  .help { color: #777; font-size: 11px; }

  /* Formula block */
  .formula-block { background: #1a1a2e; border-radius: 8px; padding: 16px 20px; margin-top: 16px; }
  .formula-block h3 { color: #90caf9; margin-bottom: 10px; }
  .formula-lines code { display: block; color: #a5d6a7; font-family: 'Courier New', monospace; font-size: 12.5px; line-height: 1.9; }

  /* Footer */
  .report-footer { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 16px; text-align: center; font-size: 11px; color: #999; }

  @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
  @media print {
    body { background: #fff; }
    .page { padding: 16px; }
    .step-section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="report-header">
    <div class="domain-badge">${pipeline.domain.toUpperCase()} ENGINEERING</div>
    <h1>${pipeline.icon} ${pipeline.name}</h1>
    <p class="subtitle">${pipeline.description}</p>
    <div class="report-meta">
      <span>📅 Date: ${date}</span>
      <span>📊 Difficulty: ${pipeline.difficulty.charAt(0).toUpperCase() + pipeline.difficulty.slice(1)}</span>
      <span>📋 ${stepResults.length} of ${pipeline.steps.length} steps completed</span>
    </div>
  </div>

  ${complianceSummary ? `
  <div class="compliance-summary">
    <h2>Compliance Summary</h2>
    ${complianceSummary}
  </div>` : ''}

  ${stepSections}
  
  <div class="appendix" style="margin-top: 24px; padding: 18px; border: 1px solid #e9e9e9; border-radius: 8px; background: #fbfbfb;">
    <h2 style="font-size:16px; color:#333; margin-bottom:8px;">Appendix — Calculation Details</h2>
    <p style="font-size:12px; color:#555; margin-bottom:10px;">Full step inputs, outputs, and formulas (for auditing and verification):</p>
    <pre style="background:#fff; border:1px solid #eee; padding:12px; border-radius:6px; overflow:auto; max-height:360px; font-size:12px;">${escapeHtml(JSON.stringify(stepResults, null, 2))}</pre>
  </div>

  <div class="report-footer">
    <p>Generated by EngiSuite — Engineering Calculation Platform</p>
    <p style="margin-top:4px">This report is for engineering reference only. All designs must be reviewed and stamped by a licensed professional engineer.</p>
  </div>

</div>
</body>
</html>`;
}

function generateJsonReport(pipeline: EngineeringPipeline, stepResults: StepResult[]) {
  return {
    pipeline: {
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      domain: pipeline.domain,
      difficulty: pipeline.difficulty
    },
    generated_at: new Date().toISOString(),
    steps: stepResults.map(result => {
      const step = pipeline.steps.find(s => s.stepNumber === result.stepNumber);
      return {
        step_number: result.stepNumber,
        name: step?.name ?? '',
        standard_ref: step?.standard_ref ?? '',
        inputs: result.inputs,
        outputs: result.outputs,
        formula_display: step?.formula_display ?? []
      };
    })
  };
}

export default router;
