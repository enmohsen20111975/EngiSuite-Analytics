import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = '/api/local-pipelines';

const DOMAINS = [
  { key: 'all',        label: 'All',           icon: '🗂️',  color: '#607d8b' },
  { key: 'electrical', label: 'Electrical',     icon: '⚡',  color: '#1565c0' },
  { key: 'mechanical', label: 'Mechanical',     icon: '⚙️',  color: '#e65100' },
  { key: 'civil',      label: 'Civil / Struct', icon: '🏗️',  color: '#2e7d32' },
  { key: 'hvac',       label: 'HVAC',           icon: '🌬️',  color: '#00695c' },
  { key: 'hydraulics', label: 'Hydraulics',     icon: '💧',  color: '#1565c0' },
];

const DOMAIN_META = {
  electrical: { bg: '#e3f2fd', border: '#1565c0', badge: '#1565c0' },
  mechanical:  { bg: '#fff3e0', border: '#e65100', badge: '#e65100' },
  civil:       { bg: '#e8f5e9', border: '#2e7d32', badge: '#2e7d32' },
  hvac:        { bg: '#e0f7fa', border: '#00695c', badge: '#00695c' },
  hydraulics:  { bg: '#e8eaf6', border: '#3949ab', badge: '#3949ab' },
};

const DIFFICULTY_META = {
  beginner:     { bg: '#e8f5e9', color: '#1b5e20', label: '🟢 Beginner' },
  intermediate: { bg: '#fff3e0', color: '#e65100', label: '🟡 Intermediate' },
  advanced:     { bg: '#fce4ec', color: '#880e4f', label: '🔴 Advanced' },
};

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];
const SORT_OPTIONS = [
  { value: 'name',       label: 'Name (A–Z)' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'steps',      label: 'Steps count' },
  { value: 'domain',     label: 'Domain' },
];

// ─── Inline Styles ────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: '100vh', background: '#f4f6f9', fontFamily: "'Segoe UI', Arial, sans-serif" },
  header: {
    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
    color: '#fff', padding: '32px 40px 24px',
  },
  headerRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  headerTitle: { fontSize: 26, fontWeight: 700, margin: 0 },
  headerSub: { fontSize: 13, opacity: 0.85, marginTop: 6, maxWidth: 580 },
  statChip: (color) => ({
    background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 14px',
    fontSize: 12, fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
  }),

  // Filter bar
  filterBar: {
    background: '#fff', borderBottom: '1px solid #e0e0e0',
    padding: '12px 32px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
    position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  searchWrap: { position: 'relative', flex: '1 1 220px', maxWidth: 320 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#999' },
  searchInput: {
    width: '100%', border: '1.5px solid #ddd', borderRadius: 8, padding: '8px 12px 8px 32px',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  },
  domainTabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  domainTab: (active, color) => ({
    border: active ? `2px solid ${color}` : '2px solid #e0e0e0',
    background: active ? color : '#fff',
    color: active ? '#fff' : '#444',
    borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  }),
  diffPills: { display: 'flex', gap: 4 },
  diffPill: (active, meta) => ({
    border: active ? `2px solid ${meta?.color ?? '#607d8b'}` : '2px solid #e0e0e0',
    background: active ? (meta?.bg ?? '#f5f5f5') : '#fff',
    color: active ? (meta?.color ?? '#333') : '#666',
    borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  }),
  sortSelect: {
    border: '1.5px solid #ddd', borderRadius: 8, padding: '7px 10px', fontSize: 12,
    background: '#fff', cursor: 'pointer', outline: 'none',
  },
  resultCount: { fontSize: 12, color: '#888', whiteSpace: 'nowrap' },

  // Main body
  body: { maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px' },

  // Group header
  groupHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    margin: '28px 0 14px', paddingBottom: 8, borderBottom: '2px solid #e0e0e0',
  },
  groupIcon: { fontSize: 22 },
  groupTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  groupCount: { fontSize: 12, color: '#888', background: '#f5f5f5', borderRadius: 12, padding: '2px 10px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  card: (domain) => ({
    background: '#fff',
    border: `2px solid ${DOMAIN_META[domain]?.border ?? '#ccc'}`,
    borderRadius: 12, padding: 22, cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  }),
  cardIcon: { fontSize: 30, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#1a1a2e' },
  cardDesc: { fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 12 },
  cardMeta: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: (bg, color) => ({
    background: bg, color, fontSize: 10.5, fontWeight: 600,
    padding: '2px 9px', borderRadius: 20,
  }),
  empty: { textAlign: 'center', color: '#aaa', padding: '60px 20px', fontSize: 14 },

  // Modal overlay / wizard
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    overflowY: 'auto', padding: '24px 16px',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 940,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minHeight: 500,
    display: 'flex', flexDirection: 'column',
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
    color: '#fff', padding: '20px 28px', borderRadius: '14px 14px 0 0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
    width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
    fontSize: 18, lineHeight: '32px', textAlign: 'center',
  },
  progressBar: { height: 4, background: '#e0e0e0', borderRadius: 0 },
  progressFill: (pct) => ({ height: 4, background: '#1565c0', width: `${pct}%`, transition: 'width 0.4s' }),
  wizardBody: { display: 'flex', flex: 1, minHeight: 400 },
  sidebar: {
    width: 200, borderRight: '1px solid #e0e0e0', padding: '16px 0',
    background: '#fafafa', flexShrink: 0, borderRadius: '0 0 0 14px',
  },
  sidebarItem: (active, done) => ({
    padding: '10px 20px', cursor: 'pointer', fontSize: 13,
    background: active ? '#e3f2fd' : 'transparent',
    borderLeft: active ? '3px solid #1565c0' : '3px solid transparent',
    color: active ? '#1565c0' : done ? '#2e7d32' : '#555',
    fontWeight: active ? 600 : 400,
  }),
  stepContent: { flex: 1, padding: '24px 28px', overflowY: 'auto' },
  stepTitle: { fontSize: 19, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' },
  stepDesc: { fontSize: 13, color: '#555', lineHeight: 1.6, margin: '0 0 20px' },
  standardRef: {
    display: 'inline-block', background: '#fff3e0', color: '#e65100',
    border: '1px solid #ffe0b2', borderRadius: 20, padding: '2px 10px',
    fontSize: 11, marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: 600, color: '#1565c0',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12.5, fontWeight: 500, color: '#333' },
  input: { border: '1.5px solid #ddd', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none' },
  inputAutoFilled: { border: '1.5px solid #1565c0', borderRadius: 7, padding: '8px 12px', fontSize: 13, background: '#e3f2fd' },
  select: { border: '1.5px solid #ddd', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff' },
  helpText: { fontSize: 11, color: '#999', lineHeight: 1.4 },
  outputsBox: { background: '#f0f7ff', border: '1.5px solid #90caf9', borderRadius: 10, padding: '16px 20px', marginTop: 20 },
  outputRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e3f0ff' },
  outputLabel: { fontSize: 13, color: '#333' },
  outputValue: { fontSize: 13, fontWeight: 700, color: '#1565c0' },
  outputPass: { fontSize: 13, fontWeight: 700, color: '#2e7d32' },
  outputFail: { fontSize: 13, fontWeight: 700, color: '#c62828' },
  warningBox: { background: '#fff3e0', border: '1.5px solid #ffb74d', borderRadius: 8, padding: '12px 16px', marginTop: 12 },
  warningText: { color: '#e65100', fontSize: 12.5 },
  formulaBox: { background: '#1a1a2e', borderRadius: 8, padding: '14px 18px', marginTop: 16 },
  formulaLine: { color: '#a5d6a7', fontFamily: 'Courier New, monospace', fontSize: 12.5, lineHeight: 1.9, display: 'block' },
  footer: { padding: '16px 28px', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 8 },
  calcBtn: {
    background: 'linear-gradient(135deg, #1565c0, #0d47a1)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  calcBtnDisabled: {
    background: '#90caf9', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'not-allowed', fontSize: 13, fontWeight: 600,
  },
  nextBtn: {
    background: '#2e7d32', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 8,
  },
  reportBtn: {
    background: 'linear-gradient(135deg, #6a1b9a, #4a148c)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 8,
  },
  reportFrame: { width: '100%', border: 'none', minHeight: 600, borderRadius: '0 0 14px 14px' },
  spinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#1565c0', fontSize: 15 },
  error: { background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 8, padding: '14px 18px', color: '#c62828', fontSize: 13 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOutputValue(val, out) {
  if (typeof val === 'boolean') {
    return { text: val ? '✅ PASS' : '❌ FAIL', style: val ? S.outputPass : S.outputFail };
  }
  const num = typeof val === 'number' ? val.toFixed(out.precision ?? 2) : String(val);
  return { text: `${num}${out.unit ? ' ' + out.unit : ''}`, style: S.outputValue };
}

function collectPreviousOutputs(stepOutputs, beforeStepNumber) {
  const flat = {};
  for (const [sNum, outs] of Object.entries(stepOutputs)) {
    if (Number(sNum) < beforeStepNumber) Object.assign(flat, outs);
  }
  return flat;
}

const DIFF_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

function applyFilters(pipelines, { domain, difficulty, search, sort }) {
  let list = [...pipelines];
  if (domain !== 'all') list = list.filter(p => p.domain === domain);
  if (difficulty !== 'all') list = list.filter(p => p.difficulty === difficulty);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    );
  }
  switch (sort) {
    case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'difficulty': list.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]); break;
    case 'steps':      list.sort((a, b) => (b.step_count ?? 0) - (a.step_count ?? 0)); break;
    case 'domain':     list.sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name)); break;
    default: break;
  }
  return list;
}

function groupByDomain(pipelines) {
  const groups = {};
  for (const p of pipelines) {
    if (!groups[p.domain]) groups[p.domain] = [];
    groups[p.domain].push(p);
  }
  return groups;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filter state
  const [domainFilter, setDomainFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [groupByDomainFlag, setGroupByDomainFlag] = useState(false);

  // Wizard state
  const [activePipeline, setActivePipeline] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepInputs, setStepInputs] = useState({});
  const [stepOutputs, setStepOutputs] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [formulaDisplay, setFormulaDisplay] = useState({});
  const [showReport, setShowReport] = useState(false);
  const [reportHtml, setReportHtml] = useState(null);
  const [reportJson, setReportJson] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    axios.get(API)
      .then(r => setPipelines(r.data.data))
      .catch(() => setFetchError('Failed to load pipelines. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  const buildDefaultInputs = (step, previousOutputs) => {
    const vals = {};
    step.inputs.forEach(inp => {
      if (inp.default !== undefined) vals[inp.name] = inp.default;
      if (previousOutputs[inp.name] !== undefined) vals[inp.name] = previousOutputs[inp.name];
      if (inp.fromPreviousStep && previousOutputs[inp.fromPreviousStep] !== undefined) {
        vals[inp.name] = previousOutputs[inp.fromPreviousStep];
      }
    });
    return vals;
  };

  const openPipeline = async (id) => {
    try {
      const r = await axios.get(`${API}/${id}`);
      const pl = r.data.data;
      const defaults = buildDefaultInputs(pl.steps[0], {});
      setActivePipeline(pl);
      setCurrentStepIdx(0);
      setStepInputs({ [pl.steps[0].stepNumber]: defaults });
      setStepOutputs({});
      setWarnings({});
      setFormulaDisplay({});
      setCalcError(null);
      setReportHtml(null);
      setReportJson(null);
      setShowReport(false);
    } catch {
      alert('Failed to load pipeline details.');
    }
  };

  const closeWizard = () => { setActivePipeline(null); setShowReport(false); };

  const currentStep = activePipeline?.steps?.[currentStepIdx];
  const currentInputs = stepInputs[currentStep?.stepNumber] ?? {};
  const currentOutputs = currentStep ? stepOutputs[currentStep.stepNumber] : undefined;
  const isLastStep = activePipeline && currentStepIdx === activePipeline.steps.length - 1;
  const allStepsDone = activePipeline && activePipeline.steps.every(s => stepOutputs[s.stepNumber]);

  const setField = (field, value) => {
    const sn = currentStep.stepNumber;
    setStepInputs(prev => ({ ...prev, [sn]: { ...(prev[sn] ?? {}), [field]: value } }));
    setStepOutputs(prev => { const n = { ...prev }; delete n[sn]; return n; });
  };

  const calculate = async () => {
    if (!activePipeline || !currentStep) return;
    setCalculating(true);
    setCalcError(null);
    try {
      const r = await axios.post(
        `${API}/${activePipeline.id}/steps/${currentStep.stepNumber}/calculate`,
        { inputs: currentInputs }
      );
      const { outputs, formula_display, warnings: warns } = r.data.data;
      const sn = currentStep.stepNumber;
      setStepOutputs(prev => ({ ...prev, [sn]: outputs }));
      setFormulaDisplay(prev => ({ ...prev, [sn]: formula_display }));
      setWarnings(prev => ({ ...prev, [sn]: warns }));
    } catch (err) {
      setCalcError(err.response?.data?.error ?? 'Calculation failed. Check your inputs.');
    } finally {
      setCalculating(false);
    }
  };

  const goToStep = (idx) => {
    setCurrentStepIdx(idx);
    setCalcError(null);
    const step = activePipeline.steps[idx];
    const prevOutputs = collectPreviousOutputs(stepOutputs, step.stepNumber);
    const defaults = buildDefaultInputs(step, prevOutputs);
    setStepInputs(prev => ({ ...prev, [step.stepNumber]: { ...defaults, ...(prev[step.stepNumber] ?? {}) } }));
  };

  const nextStep = () => {
    const nextIdx = currentStepIdx + 1;
    const ns = activePipeline.steps[nextIdx];
    const prevOutputs = collectPreviousOutputs(stepOutputs, ns.stepNumber);
    const defaults = buildDefaultInputs(ns, prevOutputs);
    setStepInputs(prev => ({ ...prev, [ns.stepNumber]: defaults }));
    setCurrentStepIdx(nextIdx);
    setCalcError(null);
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const stepResults = activePipeline.steps
        .filter(s => stepOutputs[s.stepNumber])
        .map(s => ({
          stepNumber: s.stepNumber,
          inputs: stepInputs[s.stepNumber] ?? {},
          outputs: stepOutputs[s.stepNumber] ?? {}
        }));
      const r = await axios.post(`${API}/${activePipeline.id}/report`, { stepResults });
      setReportHtml(r.data.data.html);
      setReportJson(r.data.data.json);
      setShowReport(true);
    } catch {
      alert('Failed to generate report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activePipeline.id}-report.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(reportJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activePipeline.id}-report.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const progressPct = activePipeline
    ? ((currentStepIdx + (currentOutputs ? 1 : 0)) / activePipeline.steps.length) * 100
    : 0;

  // ─── Filtered data ────────────────────────────────────────────────────────
  const filtered = applyFilters(pipelines, { domain: domainFilter, difficulty: diffFilter, search, sort });
  const groups = groupByDomain(filtered);
  const domainOrder = ['electrical', 'mechanical', 'civil', 'hvac', 'hydraulics'];

  // Domain tab counts (only from all pipelines, filtered by difficulty+search only)
  const countFor = (d) => {
    if (d === 'all') return pipelines.filter(p => {
      const dm = DIFFICULTY_META[p.difficulty];
      return (diffFilter === 'all' || p.difficulty === diffFilter) &&
             (!search.trim() || p.name.toLowerCase().includes(search.toLowerCase()));
    }).length;
    return pipelines.filter(p =>
      p.domain === d &&
      (diffFilter === 'all' || p.difficulty === diffFilter) &&
      (!search.trim() || p.name.toLowerCase().includes(search.toLowerCase()))
    ).length;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <h1 style={S.headerTitle}>Engineering Calculation Pipelines</h1>
            <p style={S.headerSub}>
              Step-by-step workflows — enter inputs, get real calculations, outputs chain into next steps automatically, download a full technical report.
            </p>
          </div>
          {!loading && !fetchError && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-start', marginTop: 4 }}>
              <span style={S.statChip()}>{pipelines.length} Pipelines</span>
              <span style={S.statChip()}>
                {DOMAINS.filter(d => d.key !== 'all').filter(d => pipelines.some(p => p.domain === d.key)).length} Disciplines
              </span>
              <span style={S.statChip()}>
                {pipelines.reduce((a, p) => a + (p.step_count ?? 0), 0)} Total Steps
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────────────── */}
      <div style={S.filterBar}>
        {/* Search */}
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search pipelines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.searchInput}
          />
        </div>

        {/* Domain tabs */}
        <div style={S.domainTabs}>
          {DOMAINS.map(d => {
            const cnt = countFor(d.key);
            if (d.key !== 'all' && cnt === 0) return null;
            return (
              <button
                key={d.key}
                onClick={() => setDomainFilter(d.key)}
                style={S.domainTab(domainFilter === d.key, d.color)}
              >
                {d.icon} {d.label} {cnt > 0 && <span style={{ opacity: 0.75, marginLeft: 4 }}>({cnt})</span>}
              </button>
            );
          })}
        </div>

        {/* Difficulty pills */}
        <div style={S.diffPills}>
          {DIFFICULTIES.map(d => {
            const meta = DIFFICULTY_META[d];
            return (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                style={S.diffPill(diffFilter === d, meta)}
              >
                {d === 'all' ? 'All Levels' : meta?.label ?? d}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)} style={S.sortSelect}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Group toggle */}
        <button
          onClick={() => setGroupByDomainFlag(f => !f)}
          style={{
            border: groupByDomainFlag ? '2px solid #1565c0' : '2px solid #e0e0e0',
            background: groupByDomainFlag ? '#e3f2fd' : '#fff',
            color: groupByDomainFlag ? '#1565c0' : '#666',
            borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
          title="Group by discipline"
        >
          🗂 Group
        </button>

        <span style={S.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div style={S.body}>
        {loading && <div style={S.spinner}>Loading pipelines…</div>}
        {fetchError && <div style={S.error}>{fetchError}</div>}

        {!loading && !fetchError && filtered.length === 0 && (
          <div style={S.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>No pipelines match your filters.</div>
            <button
              onClick={() => { setSearch(''); setDomainFilter('all'); setDiffFilter('all'); }}
              style={{ ...S.calcBtn, marginTop: 16, fontSize: 12 }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !fetchError && filtered.length > 0 && (
          groupByDomainFlag ? (
            // ── Grouped view ──────────────────────────────────────────────
            domainOrder
              .filter(d => groups[d]?.length)
              .map(d => {
                const dom = DOMAINS.find(x => x.key === d);
                const meta = DOMAIN_META[d] ?? DOMAIN_META.electrical;
                return (
                  <div key={d}>
                    <div style={S.groupHeader}>
                      <span style={S.groupIcon}>{dom?.icon}</span>
                      <span style={{ ...S.groupTitle, color: meta.border }}>{dom?.label ?? d}</span>
                      <span style={S.groupCount}>{groups[d].length} pipeline{groups[d].length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={S.grid}>
                      {groups[d].map(p => <PipelineCard key={p.id} p={p} onClick={() => openPipeline(p.id)} />)}
                    </div>
                  </div>
                );
              })
          ) : (
            // ── Flat grid view ─────────────────────────────────────────────
            <div style={S.grid}>
              {filtered.map(p => <PipelineCard key={p.id} p={p} onClick={() => openPipeline(p.id)} />)}
            </div>
          )
        )}
      </div>

      {/* ─── Wizard Modal ─────────────────────────────────────────────────── */}
      {activePipeline && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && closeWizard()}>
          <div style={S.modal}>

            <div style={S.modalHeader}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  {activePipeline.icon} {activePipeline.domain.toUpperCase()} PIPELINE
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{activePipeline.name}</div>
              </div>
              <button style={S.closeBtn} onClick={closeWizard}>✕</button>
            </div>

            <div style={S.progressBar}>
              <div style={S.progressFill(progressPct)} />
            </div>

            {showReport ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    onClick={() => setShowReport(false)}
                    style={{ background: '#e0e0e0', border: 'none', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
                  >
                    ← Back to Wizard
                  </button>
                  <button onClick={downloadHtml} style={{ ...S.calcBtn, padding: '7px 16px', fontSize: 13 }}>
                    ⬇ Download HTML Report
                  </button>
                  <button onClick={downloadJson} style={{ ...S.nextBtn, marginLeft: 0, padding: '7px 16px', fontSize: 13 }}>
                    ⬇ Download JSON
                  </button>
                </div>
                <iframe title="Engineering Report" srcDoc={reportHtml} style={S.reportFrame} sandbox="allow-same-origin" />
              </div>
            ) : (
              <>
                <div style={S.wizardBody}>
                  <div style={S.sidebar}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '0 20px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Steps</div>
                    {activePipeline.steps.map((step, idx) => {
                      const done = !!stepOutputs[step.stepNumber];
                      const active = idx === currentStepIdx;
                      return (
                        <div key={step.stepNumber} style={S.sidebarItem(active, done)} onClick={() => goToStep(idx)}>
                          <div style={{ fontSize: 11, marginBottom: 2 }}>
                            {done ? '✅' : active ? '▶' : '○'} Step {step.stepNumber}
                          </div>
                          <div style={{ fontSize: 12 }}>{step.name}</div>
                        </div>
                      );
                    })}
                    {allStepsDone && (
                      <div style={{ padding: '12px 16px', marginTop: 8 }}>
                        <button
                          onClick={generateReport}
                          disabled={generatingReport}
                          style={{ ...S.reportBtn, width: '100%', marginLeft: 0, padding: '9px 12px', fontSize: 12 }}
                        >
                          {generatingReport ? '⏳ Generating…' : '📋 View Report'}
                        </button>
                      </div>
                    )}
                  </div>

                  {currentStep && (
                    <div style={S.stepContent}>
                      <h2 style={S.stepTitle}>Step {currentStep.stepNumber}: {currentStep.name}</h2>
                      <span style={S.standardRef}>{currentStep.standard_ref}</span>
                      <p style={S.stepDesc}>{currentStep.description}</p>

                      <div style={S.sectionLabel}>Inputs</div>
                      <div style={S.inputGrid}>
                        {currentStep.inputs.map(inp => {
                          const prevOutputs = collectPreviousOutputs(stepOutputs, currentStep.stepNumber);
                          const isAutoFilled =
                            prevOutputs[inp.name] !== undefined ||
                            (inp.fromPreviousStep && prevOutputs[inp.fromPreviousStep] !== undefined);
                          const val = currentInputs[inp.name] ?? '';
                          return (
                            <div key={inp.name} style={S.inputGroup}>
                              <label style={S.label}>
                                {inp.label}
                                {inp.unit ? <span style={{ color: '#1565c0', fontWeight: 400 }}> ({inp.unit})</span> : null}
                                {isAutoFilled && (
                                  <span style={{ fontSize: 10, color: '#1565c0', marginLeft: 6, background: '#e3f2fd', padding: '1px 6px', borderRadius: 10 }}>
                                    auto-filled
                                  </span>
                                )}
                              </label>
                              {inp.type === 'select' ? (
                                <select value={val} onChange={e => setField(inp.name, e.target.value)} style={S.select}>
                                  {inp.options?.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  value={val}
                                  min={inp.min}
                                  max={inp.max}
                                  step="any"
                                  onChange={e => setField(inp.name, e.target.value === '' ? '' : Number(e.target.value))}
                                  style={isAutoFilled ? S.inputAutoFilled : S.input}
                                />
                              )}
                              <span style={S.helpText}>{inp.help}</span>
                            </div>
                          );
                        })}
                      </div>

                      {calcError && <div style={{ ...S.error, marginBottom: 12 }}>{calcError}</div>}

                      {currentOutputs && (
                        <>
                          <div style={S.outputsBox}>
                            <div style={{ ...S.sectionLabel, marginBottom: 10 }}>Calculated Results</div>
                            {currentStep.outputs.map(out => {
                              const val = currentOutputs[out.name];
                              if (val === undefined) return null;
                              const { text, style } = formatOutputValue(val, out);
                              return (
                                <div key={out.name} style={S.outputRow}>
                                  <span style={S.outputLabel}>{out.label}{out.unit ? ` (${out.unit})` : ''}</span>
                                  <span style={style}>{text}</span>
                                </div>
                              );
                            })}
                          </div>

                          {(warnings[currentStep.stepNumber] ?? []).length > 0 && (
                            <div style={S.warningBox}>
                              <div style={{ fontWeight: 600, color: '#e65100', fontSize: 13, marginBottom: 6 }}>⚠ Warnings</div>
                              {warnings[currentStep.stepNumber].map((w, i) => (
                                <div key={i} style={S.warningText}>• {w}</div>
                              ))}
                            </div>
                          )}

                          {(formulaDisplay[currentStep.stepNumber] ?? []).length > 0 && (
                            <div style={S.formulaBox}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#90caf9', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
                                Governing Equations
                              </div>
                              {formulaDisplay[currentStep.stepNumber].map((f, i) => (
                                <code key={i} style={S.formulaLine}>{f}</code>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={S.footer}>
                  {currentStepIdx > 0 && (
                    <button
                      onClick={() => goToStep(currentStepIdx - 1)}
                      style={{ background: '#e0e0e0', border: 'none', borderRadius: 7, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}
                    >
                      ← Previous
                    </button>
                  )}
                  <div style={{ flex: 1 }} />
                  <button onClick={calculate} disabled={calculating} style={calculating ? S.calcBtnDisabled : S.calcBtn}>
                    {calculating ? '⏳ Calculating…' : '⚡ Calculate'}
                  </button>
                  {currentOutputs && !isLastStep && (
                    <button onClick={nextStep} style={S.nextBtn}>Next Step →</button>
                  )}
                  {currentOutputs && isLastStep && (
                    <button onClick={generateReport} disabled={generatingReport} style={S.reportBtn}>
                      {generatingReport ? '⏳ Generating…' : '📋 Generate Report'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Card ────────────────────────────────────────────────────────────
function PipelineCard({ p, onClick }) {
  const dc = DOMAIN_META[p.domain] ?? DOMAIN_META.electrical;
  const df = DIFFICULTY_META[p.difficulty] ?? DIFFICULTY_META.beginner;
  return (
    <div
      style={S.card(p.domain)}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
      }}
    >
      <div style={S.cardIcon}>{p.icon}</div>
      <h3 style={S.cardTitle}>{p.name}</h3>
      <p style={S.cardDesc}>{p.description}</p>
      <div style={S.cardMeta}>
        <span style={S.badge(dc.bg, dc.badge)}>{p.domain.toUpperCase()}</span>
        <span style={S.badge(df.bg, df.color)}>{df.label}</span>
        <span style={S.badge('#f5f5f5', '#555')}>{p.step_count} steps</span>
        <span style={S.badge('#f5f5f5', '#888')}>⏱ {p.estimated_time}</span>
      </div>
    </div>
  );
}
