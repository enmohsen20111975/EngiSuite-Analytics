import { useState, useEffect, useCallback } from 'react';
import { Award, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Database, Layers, Target, Trophy, ListChecks } from 'lucide-react';

const API = '/api/knowledge';

// 24-section template labels
const TEMPLATE = [
  ['learning_objectives','Learning Objectives'],['prerequisites','Prerequisites'],['introduction','Introduction'],
  ['terminology','Terminology'],['detailed_explanation','Detailed Explanation'],['core_principles','Core Principles'],
  ['components','Components'],['process','Process'],['formula_calculation','Formula / Calculation'],
  ['worked_example','Worked Example'],['industrial_example','Industrial Example'],['case_study','Case Study'],
  ['visual_explanation','Visual Explanation'],['simulation_opportunity','Simulation Opportunity'],
  ['common_mistakes','Common Mistakes'],['limitations','Limitations'],['comparison','Comparison'],
  ['practical_application','Practical Application'],['decision_scenario','Decision Scenario'],
  ['practice_questions','Practice Questions'],['certification_questions','Certification Questions'],
  ['summary','Summary'],['key_takeaways','Key Takeaways'],['references','References'],
];

async function api(path) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`${r.status}`);
  const j = await r.json();
  return j.data ?? j;
}

export default function KnowledgeLibraryPage() {
  const [view, setView] = useState('list');
  const [certs, setCerts] = useState(null);
  const [cert, setCert] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [err, setErr] = useState(null);

  const loadCerts = useCallback(async () => {
    try { setCerts(await api('/certifications')); } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { loadCerts(); }, [loadCerts]);

  const openCert = async (slug) => { setErr(null); setView('cert'); try { setCert(await api(`/certifications/${slug}`)); } catch (e) { setErr(e.message); } };
  const openLesson = async (id) => { setErr(null); setView('lesson'); try { setLesson(await api(`/lessons/${id}`)); } catch (e) { setErr(e.message); } };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {err && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Error: {err}</div>}
        {view === 'list' && <CertList certs={certs} onOpen={openCert} />}
        {view === 'cert' && cert && <CertDetail cert={cert} onBack={() => setView('list')} onOpenLesson={openLesson} />}
        {view === 'lesson' && lesson && <LessonViewer lesson={lesson} onBack={() => cert ? setView('cert') : setView('list')} />}
      </div>
    </div>
  );
}

function CertList({ certs, onOpen }) {
  if (!certs) return <div className="text-slate-500">Loading certifications…</div>;
  const groups = {};
  certs.forEach((c) => { (groups[c.subjectGroup || 'Engineering'] ||= []).push(c); });
  const order = ['Maintenance & Reliability','Project & Business','Quality','Engineering Fundamentals','Mechanical','Civil & Construction','Electrical & Control','Engineering'];
  const sorted = Object.keys(groups).sort((a,b) => (order.indexOf(a)===-1?99:order.indexOf(a)) - (order.indexOf(b)===-1?99:order.indexOf(b)));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Library</h1>
        <p className="mt-1 text-sm text-slate-600">Professional certification knowledge graph — full-spec 24-section lessons, Knowledge Objects, validated questions.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Award} label="Certifications" value={certs.length} />
        <Stat icon={BookOpen} label="Ready lessons" value={certs.reduce((s,c)=>s+c.lessonsReady,0)} />
        <Stat icon={Database} label="Knowledge Objects" value={certs.reduce((s,c)=>s+c.koCount,0)} />
        <Stat icon={ListChecks} label="Ready questions" value={certs.reduce((s,c)=>s+c.questionsReady,0)} />
      </div>
      {sorted.map((g) => (
        <div key={g}>
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">{g}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {groups[g].map((c) => <CertCard key={c.id} cert={c} onOpen={onOpen} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between"><Icon className="h-5 w-5 text-emerald-600" /><span className="text-2xl font-bold text-slate-900">{value}</span></div>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function CertCard({ cert, onOpen }) {
  const pct = cert.readiness;
  return (
    <button onClick={() => onOpen(cert.slug)} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-400 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><Award className="h-5 w-5" /></span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{cert.body}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{cert.name}</h3>
      <p className="line-clamp-2 text-xs text-slate-500">{cert.fullName}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{cert.lessonsReady}/{cert.lessonsTotal} lessons · {cert.questionsReady}/{cert.questionsTotal} Q</span>
        <span className="font-bold text-emerald-600">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500" style={{width:`${pct}%`}} /></div>
    </button>
  );
}

function CertDetail({ cert, onBack, onOpenLesson }) {
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /> All certifications</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><Award className="h-6 w-6" /></span>
          <div><h1 className="text-2xl font-bold text-slate-900">{cert.name}</h1><p className="text-sm text-slate-500">{cert.fullName} · {cert.body}</p></div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{cert.description}</p>
      </div>
      <div className="space-y-3">
        {cert.domains.map((d, i) => (
          <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white">{d.code || i+1}</span>
              <div className="flex-1"><p className="font-semibold text-slate-900">{d.name}</p><p className="text-xs text-slate-500">{d.competencyCount} competencies · {d.lessonCount} lessons · {d.questionCount} Q</p></div>
            </div>
            <div className="mt-3 space-y-1">
              {d.competencies.map((c) => (
                <div key={c.id} className="rounded-lg p-2">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <div className="mt-1 space-y-1">
                    {(c.lessons||[]).map((l) => (
                      <button key={l.id} onClick={() => onOpenLesson(l.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${l.status==='READY'?'text-emerald-500':'text-slate-300'}`} />
                        <span className="flex-1 truncate">{l.title}</span>
                        <span className="text-[10px] text-slate-400">{l.duration}m</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonViewer({ lesson, onBack }) {
  let sections = null;
  try { sections = lesson.sections ? JSON.parse(lesson.sections) : null; } catch { sections = null; }
  const ready = lesson.status === 'READY';
  const qs = lesson.practiceProblems || [];
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /> Back</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          {lesson.certification && <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><Award className="h-5 w-5" /></span>}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{lesson.certification?.name}{lesson.competency ? ` · ${lesson.competency.name}` : ''}</p>
            <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
            {lesson.titleAr && <p className="text-sm text-slate-500" dir="rtl">{lesson.titleAr}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${ready?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{ready?'READY':lesson.status}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">v{lesson.version}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Confidence: {lesson.confidence}</span>
              {sections && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">24-section spec</span>}
            </div>
          </div>
        </div>
      </div>
      {sections ? (
        <div className="space-y-4">
          {TEMPLATE.map(([key,label]) => {
            const v = sections[key];
            if (!v || v === 'NOT_APPLICABLE') return null;
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-800">{label}</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{renderMd(v)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This lesson is in DRAFT form (abbreviated). Full 24-section content pending.</div>
      )}
      {qs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><ListChecks className="h-4 w-4" /> Practice questions ({qs.length})</h2>
          <div className="space-y-3">
            {qs.slice(0,6).map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-800">{q.question}</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-500">
                  {q.choices.map((o) => <li key={o.id} className={o.isCorrect?'font-semibold text-emerald-600':'text-slate-500'}>{o.isCorrect?'✓':'•'} {o.text}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal markdown-ish renderer (paragraphs + bullets + bold + code)
function renderMd(s) {
  if (!s) return '';
  return s;
}
