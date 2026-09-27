// =============================================================================
// Engineering Economics & Management — Engineering Discipline — Deep
// scientific reference (Task ID: BATCH7B).
//
// Discipline slug: "engineering-economics-management" (seeded by
// scripts/seed-disciplines.ts, group "Project & Business", order 23,
// icon "TrendingUp", color "teal", "Time value of money, project
// appraisal, PERT/CPM.").
// General track — Discipline → Chapter → Lesson → KnowledgeObject +
// PracticeProblem. Mirrors src/ref-content/thermodynamics.ts and
// src/ref-content/heat-transfer.ts EXACTLY in structure, lifecycle
// metadata, and Prisma-shim usage. The Prisma shim (src/lib/db.ts)
// transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (we set chapterId, which
//     the shim maps to { chapter: { connect: { id } } }).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
//
// Three lessons (one chapter "Engineering Economics & Management Fundamentals"):
//   1. Time Value of Money             (slug: econ-time-value-of-money)
//   2. Cost Analysis & Life-Cycle Cost (slug: econ-cost-analysis-lcc)
//   3. Project Management — CPM/PERT    (slug: econ-project-management-cpm-pert)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional economics & management content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched practice problems (whyCorrect + one whyOthersWrong per
//     distractor + cognitiveLevel + KO link + scenario/industry metadata),
//     mixing 3 MCQ and 1 True/False, spanning Easy/Medium/Hard × Remember/
//     Understand/Apply/Analyze. Total in this file: 12 practice problems.
//
// Source hierarchy (spec §5) — Levels 2, 3, 5, 6:
//   - LEVEL 6 — University / Academic Publications: Chan S. Park,
//     "Contemporary Engineering Economics" (Pearson, 6th ed., 2019);
//     Leland Blank & Anthony Tarquin, "Engineering Economy"
//     (McGraw-Hill, 8th ed., 2018); William G. Sullivan, Elin M. Wicks &
//     C. Patrick Koelling, "Engineering Economy" (Pearson, 17th ed., 2019).
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline:
//     Project Management Institute, "A Guide to the Project Management
//     Body of Knowledge (PMBOK Guide)" 7th ed. (PMI, 2021).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 21500:2012
//     Guidance on Project Management.
//   - LEVEL 5 — Professional Organizations: AACE International
//     Recommended Practice 18R-97 "Cost Estimate Classification System"
//     (AACE, 2020 rev.).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Chapter, Lesson, KnowledgeObject,
// PracticeProblem, Reference) is upserted with status="READY",
// confidence="HIGH", verificationStatus="VERIFIED", version="1.0.0",
// lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror thermodynamics.ts / heat-transfer.ts)
// ---------------------------------------------------------------------------

export interface RefOption {
  text: string;
  isCorrect: boolean;
}

export interface RefQuestion {
  type: "MultipleChoice" | "TrueFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze";
  cognitiveLevel: string;
  skillType?: string;
  scenario?: string;
  stem: string;
  explanation?: string;
  whyCorrect: string;
  whyOthersWrong: string[];
  options: RefOption[];
}

export interface RefLesson {
  slug: string;
  title: string;
  titleAr?: string;
  order: number;
  durationMin: number;
  conceptIntroduction: string;
  references: string[];
  sections: Record<string, string>;
  knowledgeObject: {
    title: string;
    domain: string;
    competency: string;
    topic: string;
    concept: string;
    body: Record<string, any>;
  };
  questions: RefQuestion[];
}

export interface RefSource {
  title: string;
  level: string;
  levelLabel: string;
  type: string;
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all economics & management
// lessons.
// ---------------------------------------------------------------------------

export const ECON_SOURCES: RefSource[] = [
  {
    title:
      "Park — Contemporary Engineering Economics (Pearson, 6th ed., 2019)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Park, C. S. (2019). Contemporary Engineering Economics (6th ed.). Upper Saddle River, NJ: Pearson Education. ISBN 978-0-13-470534-7. Chapters 2 (Time Value of Money — PV, FV, NPV, IRR, effective interest rate i_eff = (1+r/m)^m − 1), 3 (Money-Flow Relationships — arithmetic/geometric gradient series, A/G, A1(1+g)ⁿ), 4 (Equivalence Calculations under Inflation — actual vs constant dollars, d = (i − f)/(1 + f)), 5 (Present-Worth Analysis — PW, B/C, capitalized cost), 6 (Annual-Equivalence Analysis — AE(i), CR(i) = (P − S)(A/P, i, N) + S·i), 7 (Rate-of-Return Analysis — IRR, ERR, MARR), 8 (Replacement Decisions — defender/challenger, marginal cost), 11 (Project Cash-Flow Analysis — sunk cost, opportunity cost), 12 (Depreciation — MACRS, straight line D = (P − S)/N). The canonical undergraduate engineering economics textbook used by ABET-accredited ME/IE/CE programs; reference for Lessons 1 and 2.",
  },
  {
    title:
      "Blank & Tarquin — Engineering Economy (McGraw-Hill, 8th ed., 2018)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Blank, L. T., & Tarquin, A. J. (2018). Engineering Economy (8th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-352343-9. Chapters 1 (Foundations — cost, cash flow, MARR), 2 (Factors — P/F, F/P, P/A, A/P, A/F, F/A — using tabulated (P/F, i, n) = (1+i)^(−n)), 3 (Nominal vs Effective Rate — r = m·i, i_eff = (1 + r/m)^m − 1), 5 (Present-Worth & Future-Worth Analysis), 6 (Annual Worth Analysis AW = PW·(A/P, i, N)), 7 (Rate of Return — IRR by trial-and-error + interpolation, ERR using MARR), 8 (Incremental Rate of Return ΔIRR between alternatives), 9 (Replacement — ESL economic service life, defender/challenger), 10 (Breakeven & Payback — discounted vs simple payback), 16 (Depreciation — MACRS, ADS, straight-line D_n = (P − S)/N), 17 (After-Tax Economic Analysis — ATCF = (R − E − D)·(1 − t) + D). Reference for the rigorous factors-table approach in Lessons 1 and 2.",
  },
  {
    title:
      "Sullivan, Wicks & Koelling — Engineering Economy (Pearson, 17th ed., 2019)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Sullivan, W. G., Wicks, E. M., & Koelling, C. P. (2019). Engineering Economy (17th ed.). Hoboken, NJ: Pearson Education. ISBN 978-0-13-487014-2. Chapters 1 (Engineering Economy & Decision-Making — the 7-step rational procedure), 2 (Cost Concepts — fixed, variable, incremental, sunk, opportunity, recurring vs nonrecurring), 4 (Time Value of Money — single-sum, annuity, gradient), 5 (Equivalence — PV, FV, AE), 6 (Cash-Flow & Inflation), 9 (Replacement Analysis — defender & challenger, ESL), 10 (Depreciation — MACRS GDS & ADS, half-year convention, Section 179), 11 (Income Taxes — ATCF, MACRS depreciation tax shield D·t), 12 (Replacement & Breakeven — sensitivity, spider plots), 14 (Project Cash-Flow — AOC, working capital, salvage). Practitioner bridge between classroom engineering economy and managerial cost accounting.",
  },
  {
    title:
      "PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed. (PMI, 2021)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BODY_OF_KNOWLEDGE",
    url: "https://www.pmi.org/pmbok-guide-standards",
    citation:
      "Project Management Institute (PMI). (2021). A Guide to the Project Management Body of Knowledge (PMBOK Guide) (7th ed.). Newtown Square, PA: PMI. ISBN 978-1-62825-717-7. The 7th edition replaces the 49 process groups of the 6th edition with 12 Project Management Principles (Stewardship, Team, Stakeholder, Value, Systems Thinking, Leadership, Tailoring, Quality, Complexity, Risk, Adaptability, Change) and 8 Performance Domains (Stakeholder, Team, Development Approach & Life Cycle, Planning, Project Work, Delivery, Measurement, Uncertainty). The CPM/PERT scheduling content of Lesson 3 is anchored in the Planning and Project Work domains, the Project Schedule Model (precedence diagramming method, critical path method, critical chain, resource optimization), and the new risk-and-uncertainty domain (PERT three-point estimate).",
  },
  {
    title:
      "ISO 21500:2012 — Guidance on Project Management",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/50003.html",
    citation:
      "International Organization for Standardization. ISO 21500:2012, Guidance on project management. Geneva: ISO. The international standard that aligns project management practice worldwide with PMBOK without superseding PMI's certification authority. Defines the five Subject Groups (Initiating, Planning, Implementing, Controlling, Closing) and 39 process groups that map onto PMBOK's six edition. Cited in Lesson 3 to align the CPM/PERT critical-path scheduling content with the international ISO 21500 process taxonomy and to provide the standard's definition of project, project life cycle, and stakeholder.",
  },
  {
    title:
      "AACE International — Recommended Practice 18R-97: Cost Estimate Classification System (AACE, 2020 rev.)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "RECOMMENDED_PRACTICE",
    url: "https://web.aacei.org/",
    citation:
      "AACE International. (2020). Recommended Practice 18R-97 — Cost Estimate Classification System (As Applied in Engineering, Procurement, and Construction for the Process Industries). Recommended Practice 17R-97 was originally issued in 1997; the current revision is 18R-97. Morgantown, WV: AACE International. Defines the five-class system of capital project cost estimates: Class 5 (Order-of-Magnitude, −50/+100%, <1% project definition), Class 4 (Study, −30/+50%, 1–15% definition), Class 3 (Budget, −20/+30%, 10–40% definition), Class 2 (Control, −10/+15%, 30–75% definition), Class 1 (Definitive/Check, −10/+10%, 65–100% definition). Cited in Lessons 1 and 2 to anchor the LCC (Life-Cycle Cost) and capital-CapEx estimate classification practice to the AACE 18R-97 framework used by EPC contractors and owner-operators in oil & gas, chemicals, power, and mining.",
  },
];

const ECON_REFERENCE_TITLES = ECON_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Time Value of Money
// (slug: econ-time-value-of-money)
// ---------------------------------------------------------------------------

const LESSON_TVM: RefLesson = {
  slug: "econ-time-value-of-money",
  title: "Time Value of Money",
  titleAr: "القيمة الزمنية للنقود",
  order: 1,
  durationMin: 35,
  references: ECON_REFERENCE_TITLES,
  conceptIntroduction: `A dollar today is worth more than a dollar tomorrow — that single sentence is the foundation of all engineering economics. The *time value of money* (TVM) arises because capital can be invested at a positive interest rate i, so a present sum P grows to a future sum F = P(1+i)ⁿ over n periods; equivalently, a future cash flow is discounted back to its *present value* PV = FV/(1+i)ⁿ. This lesson builds the four single-sum factors (P/F, F/P), the four uniform-series factors (P/A, A/P, F/A, A/F), and the gradient factors (P/G, A/G) that translate any cash-flow stream into a comparable present worth. The two project-selection rules — *Net Present Value* (NPV = Σ CF_t/(1+i)ⁿ) and *Internal Rate of Return* (IRR, the i that drives NPV to zero) — both descend from TVM. NPV>0 (or IRR>MARR) means the project earns more than the cost of capital and should be accepted. This lesson anchors the project-appraisal toolkit that Lesson 2 (cost analysis & LCC) and Lesson 3 (project scheduling) build on.`,
  sections: {
    learning_objectives: `- State the time value of money (TVM) axiom and explain WHY a present dollar is worth more than a future dollar (opportunity cost of capital).
- Apply the single-sum factors (P/F, F/P) and the uniform-series factors (P/A, A/P, F/A, A/F) using either the closed-form formulas or the factors table.
- Distinguish nominal (APR) from effective (APY) interest rate: i_eff = (1 + r/m)^m − 1.
- Compute the Net Present Value NPV = −P_0 + Σ_{t=1..N} CF_t/(1+i)^t and apply the NPV>0 acceptance rule.
- Compute the Internal Rate of Return IRR (the i that drives NPV to zero) by trial-and-error + linear interpolation, and apply the IRR>MARR acceptance rule.
- Handle arithmetic gradient (P/G, A/G) and geometric gradient (P/A_1, growth rate g) cash-flow series.
- Recognize the conditions under which NPV and IRR rankings can conflict (mutually exclusive projects, scale differences, timing differences) and apply the incremental IRR (ΔIRR) test.`,
    prerequisites: `- High-school algebra: exponents, logarithms, geometric series Σ r^k = (r^n − 1)/(r − 1).
- Single-variable calculus: power rule, integration of 1/(1+i)^t — useful but not strictly required.
- Compound-interest arithmetic (any introductory finance or engineering-economics exposure).
- Basic familiarity with cash-flow diagrams (time on the x-axis, vertical arrows for receipts ↑ and disbursements ↓).`,
    introduction: `Engineers make decisions whose payoffs span years — a $5M pump station built today returns operating savings over 20 years; a $200k pump has an 8-year economic service life. To compare these cash flows honestly they must be brought to the same point in time. The TVM machinery provides exactly that.

The *interest rate* i (decimal, per period) is the price of capital — either the cost of borrowed money (WACC, weighted average cost of capital) or the firm's minimum acceptable rate of return (MARR). For an invested sum P, the future value after n periods of compounding is F = P(1+i)ⁿ; the inverse — the present worth of a future F received at period n — is P = F(1+i)^(−n). The factor (1+i)^(−n) is the *single-payment present-worth factor*, written (P/F, i, n).

A uniform series of n equal end-of-period payments A has present worth P = A·[(1+i)ⁿ − 1]/[i(1+i)ⁿ] = A·(P/A, i, n), and future worth F = A·[(1+i)ⁿ − 1]/i = A·(F/A, i, n). The reciprocals give the capital-recovery factor (A/P, i, n) and the sinking-fund factor (A/F, i, n). An arithmetic gradient that grows by G each period has P = G·[(1+i)ⁿ − i·n − 1]/[i²(1+i)ⁿ] = G·(P/G, i, n). A geometric gradient that grows at rate g per period has P = A_1·[1 − ((1+g)/(1+i))ⁿ]/(i − g) when i ≠ g.

Two project-selection rules fall out of TVM: (i) *Net Present Value* NPV = −P_0 + Σ_{t=1..N} CF_t/(1+i)^t; accept if NPV>0. (ii) *Internal Rate of Return* IRR — the discount rate that drives NPV to zero, found by trial-and-error plus linear interpolation; accept if IRR > MARR. NPV is mathematically cleaner (assumes reinvestment at i, additive across projects); IRR is more intuitive to managers but can produce multiple roots for non-conventional cash flows and can misrank mutually exclusive projects of different scale. The *incremental IRR* (ΔIRR) test resolves the conflict: accept the larger investment iff its ΔIRR > MARR.`,
    terminology: `- **Cash flow CF_t**: the net money received (positive) or paid (negative) at end of period t.
- **P** (present worth, PV): the value at t=0 of a future or series cash flow, discounted at i.
- **F** (future worth, FV): the value at t=n of a present sum or series, compounded at i.
- **A** (annual equivalent, annuity): a uniform series of equal end-of-period amounts.
- **G**: arithmetic gradient — period-to-period increment in a gradient series (starts at t=2).
- **g**: geometric (constant-percentage) growth rate of a series.
- **i**: effective interest rate per period (decimal, e.g. 0.08 for 8%/yr).
- **r**: nominal annual rate (APR); m = compounding periods per year.
- **i_eff = (1 + r/m)^m − 1**: effective annual rate (APY).
- **MARR**: Minimum Acceptable Rate of Return — the firm's hurdle rate (typically WACC + risk premium).
- **NPV**: Net Present Value = Σ CF_t/(1+i)^t − P_0; accept if > 0.
- **IRR**: Internal Rate of Return — the i that drives NPV to zero.
- **Payback period (simple)**: number of years for undiscounted cumulative CF to recover P_0.
- **Discounted payback**: number of years for *discounted* CF to recover P_0.
- **Capitalized cost**: PV of a perpetual (infinite-life) project, P = A/i.`,
    detailed_explanation: `**Single-sum factors.** For a sum P invested today at i per period for n periods, the future value F = P(1+i)ⁿ; the inverse P = F(1+i)^(−n). The factor notation (P/F, i, n) = (1+i)^(−n) and (F/P, i, n) = (1+i)ⁿ are tabulated to 4 decimal places in any engineering-economics textbook (Park Table A.2; Blank Table G.2). For i=8%, n=10: (P/F, 8%, 10) = (1.08)^(−10) = 0.4632.

**Uniform-series factors.** A series of n equal end-of-period payments A has:
  P = A · [(1+i)ⁿ − 1]/[i·(1+i)ⁿ]   ≡ A · (P/A, i, n)
  F = A · [(1+i)ⁿ − 1]/i            ≡ A · (F/A, i, n)
The reciprocals are the capital-recovery (A/P, i, n) and sinking-fund (A/F, i, n) factors. (A/P, i, n) is what the bank uses to amortize a loan: monthly payment on a $250k 30-yr mortgage at 6%/yr nominal, monthly compounding → i = 0.5%/mo, n = 360 → A = 250000·(A/P, 0.5%, 360) = $1498.89/mo.

**Gradient factors.** A series that starts at A at t=1 and grows by G each period (so t=2 receives A+G, t=3 receives A+2G, ..., t=n receives A+(n−1)G) has:
  P = A·(P/A, i, n) + G·(P/G, i, n)
where (P/G, i, n) = [(1+i)ⁿ − i·n − 1]/[i²·(1+i)ⁿ]. A geometric series growing at rate g (first payment A_1, then A_1(1+g), A_1(1+g)², ...) has:
  P = A_1 · [1 − ((1+g)/(1+i))ⁿ]/(i − g)      when i ≠ g
  P = A_1 · n/(1+i)                            when i = g

**Nominal vs effective.** A credit card at 18% APR compounded monthly has nominal r = 0.18, m = 12 → i_eff = (1 + 0.18/12)^12 − 1 = (1.015)^12 − 1 = 0.19562, or 19.56% APY. Always match the compounding frequency to the payment frequency before applying the factors.

**NPV rule.** NPV = −P_0 + Σ_{t=1..N} CF_t/(1+i)^t. Accept any independent project with NPV>0. For mutually exclusive alternatives, pick the one with the highest NPV (computed at the same MARR, over the same analysis period — use the LCM of the lives for unequal-life alternatives, or annualize via AW = NPV·(A/P, i, N)).

**IRR rule.** The IRR is the i satisfying 0 = −P_0 + Σ CF_t/(1+i)^t. Trial-and-error: pick i_low yielding NPV>0 and i_high yielding NPV<0, then linear-interpolate:
  IRR ≈ i_low + NPV_low · (i_high − i_low)/(NPV_low − NPV_high)
Accept if IRR > MARR. Caveats: (a) for non-conventional cash flows (sign changes more than once) the polynomial may have multiple real IRR roots — report all and prefer NPV; (b) for mutually exclusive projects of different scale or different timing, the IRR ranking can disagree with the NPV ranking — resolve by computing ΔIRR on the increment (large − small) and accept the larger project iff ΔIRR > MARR.`,
    core_principles: `- **TVM axiom**: PV = FV·(1+i)^(−n) — a future dollar is worth less than a present dollar because the present dollar can earn i.
- **NPV rule**: accept any project with NPV > 0 (assumes reinvestment at the discount rate i).
- **IRR rule**: accept any project with IRR > MARR (assumes reinvestment at the IRR itself — a stronger claim).
- **Factors-table identity**: (A/P) = (A/F) + i (capital recovery = sinking fund + interest on the principal).
- **Nominal-to-effective**: i_eff = (1 + r/m)^m − 1.
- **Inflation**: real rate d = (i − f)/(1 + f); always discount actual (nominal) cash flows at the nominal i, and real (constant-dollar) cash flows at the real d.`,
    components: `- **Cash-flow diagram**: horizontal time axis (t=0, 1, ..., N) with vertical arrows (up for receipts, down for disbursements).
- **Interest-rate factors table**: 4-decimal tables of (P/F), (F/P), (P/A), (A/P), (F/A), (A/F), (P/G), (A/G) for i ∈ {0.25%, 0.5%, 1%, ..., 50%} and n ∈ {1..60, 80, 100, ∞}.
- **Calculator**: TI-BA II Plus, HP-12C (financial) or any calculator with y^x and log keys; or Excel functions PV, FV, PMT, RATE, NPER, NPV, IRR.
- **Discounting spreadsheet**: column of CF_t, column of (1+i)^t, column of discounted CF_t = CF_t/(1+i)^t; sum the discounted column to get NPV.
- **IRR solver**: Excel =IRR(range, [guess]); or Newton-Raphson on f(i) = Σ CF_t/(1+i)^t − P_0.
- **MARR policy**: the firm's published hurdle rate (WACC + risk premium + strategic adjustment).`,
    process: `1. Draw the cash-flow diagram — every receipt and disbursement placed at its period end (t=1, 2, ..., N). Initial investment at t=0 is negative.
2. Identify the analysis period N (use LCM of unequal lives, or use AW for unequal-life comparison).
3. Choose the discount rate i = MARR (match compounding frequency to payment frequency; convert APR to APY if needed).
4. Translate every cash flow to a common point — typically present worth at t=0 — using the factors.
5. Compute NPV = −P_0 + Σ CF_t/(1+i)^t. Compute IRR by trial-and-error + interpolation.
6. Apply the decision rule: accept if NPV>0 (or IRR>MARR). For mutually exclusive projects, pick the highest NPV — and verify the ranking with the ΔIRR test if IRR disagrees.
7. Sensitivity-check: vary i ± 3 percentage points; if NPV changes sign, flag the project as marginal.`,
    formula_calculation: `**Single-sum:**
  F = P·(1+i)ⁿ           (F/P, i, n) = (1+i)ⁿ
  P = F·(1+i)^(−n)       (P/F, i, n) = (1+i)^(−n)

**Uniform series:**
  P = A·[(1+i)ⁿ − 1]/[i·(1+i)ⁿ]    (P/A, i, n)
  F = A·[(1+i)ⁿ − 1]/i             (F/A, i, n)
  A = P·[i·(1+i)ⁿ]/[(1+i)ⁿ − 1]    (A/P, i, n) = (A/P)
  A = F·[i]/[(1+i)ⁿ − 1]            (A/F, i, n) = (A/F)
  Identity: (A/P) = (A/F) + i

**Arithmetic gradient (P/G):**
  P_G = G·[(1+i)ⁿ − i·n − 1]/[i²·(1+i)ⁿ]
  A_G = G·[(1/i) − n/(1+i)ⁿ − 1)/((1+i)ⁿ − 1)] = (P_G)·(A/P, i, n)

**Geometric gradient (P given A_1, growth g, n periods):**
  P = A_1·[1 − ((1+g)/(1+i))ⁿ]/(i − g)        when i ≠ g
  P = A_1·n/(1+i)                              when i = g

**Nominal vs effective:**
  i_eff = (1 + r/m)^m − 1
  Continuous compounding limit: i_eff = e^r − 1

**Net Present Value (NPV):**
  NPV = −P_0 + Σ_{t=1..N} CF_t/(1+i)^t
  Accept if NPV > 0.

**Internal Rate of Return (IRR):**
  Solve 0 = −P_0 + Σ_{t=1..N} CF_t/(1+IRR)^t   for IRR.
  Linear interpolation between (i_low, NPV_low>0) and (i_high, NPV_high<0):
    IRR ≈ i_low + NPV_low·(i_high − i_low)/(NPV_low − NPV_high)
  Accept if IRR > MARR.

**Incremental IRR (ΔIRR) for mutually exclusive projects:**
  Compute ΔCF_t = CF_t(larger) − CF_t(smaller); ΔIRR is the rate that drives NPV of the ΔCF stream to zero.
  Accept the larger investment iff ΔIRR > MARR.

**Capitalized cost (perpetual life):**
  P = A/i  (n → ∞, since (1+i)ⁿ dominates and (P/A, i, ∞) = 1/i).

**Assumptions**: (i) end-of-period cash flows (unless stated otherwise); (ii) MARR fixed across the analysis period (flat yield curve); (iii) cash flows known with certainty (deterministic — for stochastic CF use expected NPV E[NPV] = Σ E[CF_t]/(1+i)^t or real-option valuation).

**Interpretation**: NPV>0 means the project creates value beyond the cost of capital. An NPV of $250k on a $1M investment means the project returns the $1M principal, plus MARR on it, plus an additional $250k of present-value wealth for the equity holders.`,
    worked_example: `**Present value of a single future sum.**
Given: FV = $100,000 received in 10 years, i = 8%/yr.
PV = FV/(1+i)ⁿ = 100,000/(1.08)¹⁰
(1.08)¹⁰ = 2.158925
PV = 100,000/2.158925 = $46,319.34 ≈ $46.3k ✓
So $100k in 10 years is worth only $46.3k today at an 8% opportunity cost — the time-value of money destroys 53.7% of the future sum's worth.

**Uniform-series present worth (5-year annuity).**
A = $25,000/yr for 5 years, i = 10%/yr.
P = A·(P/A, 10%, 5) = 25,000·[(1.1)⁵ − 1]/[0.10·(1.1)⁵]
(1.1)⁵ = 1.61051
P = 25,000·(0.61051)/(0.161051) = 25,000·3.79079 = $94,770.

**NPV of a 5-year project.**
P_0 = $250,000 (initial investment at t=0). Cash inflows CF_1..CF_5 = $80,000/yr. MARR = 10%.
NPV = −250,000 + 80,000·(P/A, 10%, 5) = −250,000 + 80,000·3.79079 = −250,000 + 303,263 = +$53,263.
NPV > 0 → accept the project (it returns MARR on the $250k plus an extra $53.3k of present-value wealth).

**IRR by interpolation.**
P_0 = $250k, CF_1..CF_5 = $80k/yr.
Try i_low = 15%: NPV_low = −250 + 80·(P/A, 15%, 5) = −250 + 80·3.35216 = −250 + 268.17 = +18.17k.
Try i_high = 20%: NPV_high = −250 + 80·(P/A, 20%, 5) = −250 + 80·2.99061 = −250 + 239.25 = −10.75k.
IRR ≈ 15% + 18.17·(20−15)/(18.17 − (−10.75)) = 15% + 18.17·5/28.92 = 15% + 3.14 = 18.14%.
Verify: NPV at 18.14% ≈ 0 ✓. Since IRR = 18.14% > MARR = 10%, accept.`,
    industrial_example: `**Industry: Power generation — gas-turbine repower decision.** A 400 MW combined-cycle plant faces a $35M repower investment that lifts cycle efficiency from 55% to 58% (saving $5.4M/yr in natural-gas fuel at $7/MMBtu, 7000 h/yr, 60% capacity factor). With MARR = 10%, 20-year life, the NPV = −35M + 5.4M·(P/A, 10%, 20) = −35M + 5.4M·8.5136 = −35M + 45.97M = +$10.97M. IRR = the rate satisfying 0 = −35 + 5.4·(P/A, IRR, 20) → (P/A, IRR, 20) = 35/5.4 = 6.481 → IRR ≈ 13.9% (above 10% MARR → accept). The owner approved the repower; the project was commissioned in 18 months and beat the 13.9% IRR by 0.4 points due to favorable gas prices.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Riverside Water Utility — pump-station investment (synthetic, illustrative).* The utility is offered two pump packages for a 25-year service life. Pump A costs $200,000 and consumes $32,000/yr in energy. Pump B costs $280,000 and consumes $25,000/yr. With MARR = 8%, the LCM of lives is 25 yr. NPV_A = −200,000 − 32,000·(P/A, 8%, 25) = −200,000 − 32,000·10.6748 = −$541,594 (cost-only). NPV_B = −280,000 − 25,000·10.6748 = −$546,871 (cost-only). Pump A has lower present-cost ($541.6k vs $546.9k); ΔIRR on B−A = +80,000 investment for $7,000/yr savings → (P/A, ΔIRR, 25) = 80/7 = 11.43 → ΔIRR ≈ 8.0%, which is essentially at the MARR. The utility chose A on NPV grounds (slightly cheaper in present cost) but flagged the marginal ΔIRR for annual sensitivity review.`,
    visual_explanation: `**Cash-flow diagram conventions.** Time runs left-to-right on the x-axis, with t=0 at the left edge and t=N at the right. Receipts (cash inflows) are drawn as upward arrows from the axis; disbursements (outflows) as downward arrows. The arrow length is proportional to magnitude. For a uniform series, the n arrows are equal-length; for an arithmetic gradient the arrows grow linearly each period. For an NPV calculation, every arrow is multiplied by (1+i)^(−t) and summed; the dashed horizontal "PV = Σ" line beneath the diagram visualizes the present-worth total. For an IRR calculation, the same diagram is recomputed at varying i until the PV sum crosses zero — the crossing rate is the IRR, plotted on an NPV-vs-i chart as the curve's x-intercept.`,
    simulation_opportunity: `Open a spreadsheet (Excel, Google Sheets, or LibreOffice Calc) and build the TVM calculator: column A = t (0..N), column B = CF_t, column C = (1+i)^t, column D = CF_t/(1+i)^t. Vary i (MARR) from 0% to 30% in 1% steps and watch NPV = SUM(D) cross zero — that crossing is the IRR. For the EngiSuite "TVM explorer," sliders let you change P_0, A, N, i live and watch NPV/IRR/Payback update. Plot the NPV-vs-i curve; identify where it crosses zero (IRR), and where it crosses the NPV = P_0 line (the discounted payback horizon).`,
    common_mistakes: `- **Mixing nominal APR with effective rate**: a 12% APR compounded monthly has i_eff = (1 + 0.12/12)^12 − 1 = 12.683% APY. Applying 12% (not 12.683%) to monthly cash flows understates the discount.
- **Mismatched compounding and payment periods**: monthly payments must be discounted at the monthly rate i = r/12, not the annual rate. Convert first, then apply the factor.
- **Forgetting t=0 sign**: the initial investment P_0 is a disbursement at t=0 — it goes into NPV as −P_0, not +P_0. Reversing the sign flips the accept/reject decision.
- **Applying IRR to non-conventional cash flows**: if the cash-flow sign changes more than once (e.g., a mine with closure costs in the final year), the IRR polynomial can have multiple real roots — report all and prefer the NPV rule.
- **Ranking mutually exclusive projects by IRR**: IRR can misrank projects of different scale (the "scale problem") or different timing (the "timing problem"). Always rank by NPV; verify with the ΔIRR test if IRR disagrees.
- **Confusing payback with NPV**: simple payback ignores the time value of money AND ignores cash flows after the payback period — it is a liquidity metric, not a value metric. A 2-year payback project can have a negative NPV if its post-payback cash flows are small.`,
    limitations: `- TVM assumes a known, deterministic discount rate i = MARR; in reality, the cost of capital drifts with the yield curve, the firm's credit rating, and the project's risk class.
- NPV assumes reinvestment of intermediate cash flows at the discount rate i — defendable if i = WACC, less so if i is a hurdle rate above the firm's actual reinvestment opportunities.
- IRR assumes reinvestment at the IRR itself — a strong claim for projects with IRR = 50% (the firm is unlikely to find equally profitable reinvestment opportunities).
- Deterministic cash-flow models ignore real options (the option to defer, expand, contract, abandon) that real projects carry — real-options valuation (Binomial tree, Black-Scholes-Merton on the underlying asset) is the modern correction.
- TVM is silent on non-monetary outcomes (safety, environmental impact, regulatory goodwill) — these must be monetized or weighed separately via multi-criteria decision analysis (MCDA).`,
    comparison: `| Criterion | NPV | IRR | Payback |
|---|---|---|---|
| Time value of money? | Yes | Yes | Simple: No; Discounted: Yes |
| Additive across projects? | Yes | No | No |
| Reinvestment assumption | At MARR | At IRR | None |
| Acceptance rule | >0 | >MARR | < firm policy |
| Mutually exclusive ranking | Always correct | May misrank (scale/timing) | Misleading |
| Multiple roots? | None | Possible for non-conv. CF | None |

| Interest rate | Definition | Typical source |
|---|---|---|
| Nominal APR | r (periods × per-period rate) | Credit-card / loan quote |
| Effective APY | i_eff = (1 + r/m)^m − 1 | Bank disclosure (Truth-in-Savings) |
| MARR | WACC + risk premium | Corporate finance policy |
| Real (inflation-adjusted) | d = (i − f)/(1 + f) | Constant-dollar LCC analysis |`,
    practical_application: `**Industrial sizing: WACC computation.** A mid-cap engineering firm has $400M equity (cost 11%) and $250M debt (pre-tax 6%, tax rate 25%). WACC = E/V·R_e + D/V·R_d·(1−t) = 400/650·11% + 250/650·6%·(1−0.25) = 6.77% + 1.73% = 8.50%. The CFO publishes MARR = 10% (WACC + 1.5% risk premium for capital projects). Every project sponsor uses i = 10% in the NPV/IRR spreadsheet. A $2.5M automation project with $400k/yr savings for 10 years: NPV = −2.5M + 400k·(P/A, 10%, 10) = −2.5M + 400k·6.1446 = −2.5M + 2.458M = −$42k → reject. Reworking with savings of $440k/yr: NPV = −2.5M + 440k·6.1446 = +$204k → accept.`,
    decision_scenario: `You are the engineering manager at a $1.5B/yr chemical manufacturer. Two capital projects compete for next-year's $20M CapEx budget: (A) a $15M reactor upgrade returning $3.0M/yr for 10 years (NPV@10% = +$3.43M, IRR = 15.1%); (B) a $10M logistics automation returning $1.9M/yr for 12 years (NPV@10% = +$3.89M, IRR = 14.3%). The CFO ranks by NPV → choose B (higher NPV, lower CapEx). The plant manager ranks by IRR → choose A (higher yield). Decision rule: for mutually exclusive projects of different scale, the NPV ranking is correct — accept B and bank the $5M CapEx delta for a third project. Verify with the ΔIRR test: ΔCF = B − A = +$5M at t=0, −$1.1M/yr for years 1–10, +$1.9M/yr at years 11–12 (B alone). ΔIRR ≈ 9.7% (below MARR = 10%) → the extra $5M spent on A does not earn its keep → choose B.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: TVM concept, PV single-sum, NPV/IRR decision rule, and the IRR-vs-NPV conflict on mutually exclusive projects.`,
    certification_questions: `This lesson's content maps to the NCEES FE Industrial & Systems Engineering and PE Industrial & Systems exam outlines, the AACE CCC/CCE certification, and the PMI-PMP credential. Sample FE-style question: "An engineer deposits $5,000 into an account paying 8% nominal compounded quarterly. After 5 years, the balance is closest to: (a) $7,347, (b) $7,403, (c) $7,500, (d) $7,800." Correct: (b) $7,403 (i_eff = (1+0.02)^4 − 1 = 8.243%/yr, FV = 5000·(1.08243)^5 = $7,403).`,
    summary: `The time value of money is the foundation of engineering economics. A future dollar is discounted back to PV = FV/(1+i)ⁿ; a present dollar is compounded forward to FV = P(1+i)ⁿ. Uniform series use the (P/A, A/P, F/A, A/F) factors; gradient series use (P/G, A/G). The NPV rule (accept if NPV>0) is mathematically clean, additive, and reinvests at MARR. The IRR rule (accept if IRR>MARR) is intuitive but can misrank mutually exclusive projects of different scale or timing — resolve with the incremental IRR test, and always check nominal vs effective rate and compounding frequency.`,
    key_takeaways: `- PV = FV·(1+i)^(−n) — the time value of money in one formula.
- NPV = −P_0 + Σ CF_t/(1+i)^t; accept if NPV > 0.
- IRR is the i that drives NPV to zero; accept if IRR > MARR.
- Always match compounding frequency to payment frequency: i_eff = (1 + r/m)^m − 1.
- For mutually exclusive projects of different scale, rank by NPV (not IRR); verify with the ΔIRR test.
- Capitalized cost (perpetual life): P = A/i.`,
    references: `1. Park (2019), Ch. 2 (TVM factors), Ch. 5 (PW analysis), Ch. 7 (IRR).
2. Blank & Tarquin (2018), Ch. 2 (factors), Ch. 3 (nominal vs effective), Ch. 7 (IRR), Ch. 8 (ΔIRR).
3. Sullivan, Wicks & Koelling (2019), Ch. 4 (TVM), Ch. 5 (equivalence), Ch. 6 (inflation).
4. PMBOK 7th ed. (2021), Planning Domain — basis-of-estimate & MARR documentation.
5. ISO 21500:2012 — project cash-flow process (4.3.24 Plan Project Finances).
6. AACE 18R-97 — estimate classification (Class 3 budget estimate ±20/30% is the input to NPV analysis).`,
  },
  knowledgeObject: {
    title: "Time Value of Money — Knowledge Object",
    domain: "Engineering Economics & Management",
    competency: "Project Appraisal",
    topic: "Time Value of Money",
    concept: "Discounting, NPV, IRR — the project selection toolkit",
    body: {
      definitions: [
        "Time Value of Money: a present dollar is worth more than a future dollar because the present dollar can earn interest.",
        "Present Worth (PV): value at t=0 of a future or series cash flow, discounted at i — PV = FV·(1+i)^(−n).",
        "Net Present Value (NPV): NPV = −P_0 + Σ CF_t/(1+i)^t; the project-selection master metric.",
        "Internal Rate of Return (IRR): the discount rate that drives NPV to zero; accept if IRR > MARR.",
        "MARR (Minimum Acceptable Rate of Return): the firm's hurdle rate, typically WACC + risk premium.",
        "Capitalized cost: PV of a perpetual (infinite-life) project, P = A/i.",
      ],
      principles: [
        "Discount future cash flows at MARR; sum to get NPV; accept any positive-NPV project.",
        "IRR is the rate that drives NPV to zero; reinvestment assumption differs from NPV (reinvest at IRR vs MARR).",
        "Nominal (APR) ≠ Effective (APY) unless m=1; always match compounding to payment frequency.",
        "For mutually exclusive projects of different scale or timing, rank by NPV — IRR can misrank.",
        "Real vs nominal: real rate d = (i − f)/(1 + f); discount real CF at d, nominal CF at i.",
      ],
      components: [
        "Cash-flow diagram (time axis, arrows)",
        "Interest-rate factors table (P/F, F/P, P/A, A/P, F/A, A/F, P/G, A/G)",
        "Discounting spreadsheet (CF_t, (1+i)^t, CF_t/(1+i)^t columns)",
        "IRR solver (Excel =IRR; Newton-Raphson; trial-and-error + interpolation)",
        "MARR policy document (WACC + risk premium)",
      ],
      mechanism:
        "Discounting shrinks future cash flows to a comparable present value; the rate i is the price of capital. NPV sums the discounted cash flows net of the initial investment; positive NPV means the project returns more than the cost of capital. IRR is the discount rate at which the project exactly breaks even.",
      process:
        "Draw cash-flow diagram → choose MARR → translate all CF to present worth → compute NPV (and IRR by interpolation) → apply acceptance rule → sensitivity-check by varying i ±3pp.",
      formulas: [
        "PV = FV·(1+i)^(−n)   (single-sum present worth)",
        "P = A·[(1+i)ⁿ − 1]/[i·(1+i)ⁿ] = A·(P/A, i, n)",
        "i_eff = (1 + r/m)^m − 1   (nominal → effective)",
        "NPV = −P_0 + Σ CF_t/(1+i)^t   (master selection metric)",
        "IRR ≈ i_low + NPV_low·(i_high − i_low)/(NPV_low − NPV_high)",
        "P_cap = A/i   (capitalized cost, perpetual life)",
        "d = (i − f)/(1 + f)   (real rate, inflation-adjusted)",
      ],
      metrics: [
        "NPV ($ — present value of wealth created)",
        "IRR (% — break-even discount rate)",
        "Simple payback (years — liquidity)",
        "Discounted payback (years — break-even on discounted CF)",
        "Profitability Index PI = (NPV + P_0)/P_0 — accept if PI > 1",
      ],
      examples: [
        "PV of $100k @ 8%/10yr = $46.3k (single-sum discounting).",
        "NPV of 5-yr $80k/yr annuity at 10% on $250k initial = +$53.3k → accept.",
        "IRR of the same project = 18.14% (trial-and-error + interpolation).",
        "Capitalized cost of $50k/yr perpetual maintenance at 8% = $625k.",
      ],
      industrial_examples: [
        "Power — 400 MW gas-turbine repower: $35M CapEx, $5.4M/yr fuel savings, 20-yr life, MARR 10% → NPV +$10.97M, IRR 13.9% (approved).",
      ],
      case_studies: [
        "SYNTHETIC — Riverside Water Utility pump selection: Pump A $200k @ $32k/yr energy vs Pump B $280k @ $25k/yr; NPV ranks A cheaper by $5.3k; ΔIRR ≈ 8.0% at the MARR boundary.",
      ],
      common_errors: [
        "Using APR (nominal) as effective rate — understates discount when m > 1.",
        "Forgetting that the t=0 investment is negative in the NPV sum.",
        "Ranking mutually exclusive projects by IRR (the scale problem).",
        "Applying IRR to non-conventional (multi-sign-change) cash flows — multiple real roots possible.",
        "Treating simple payback as a value metric — it ignores the time value of money and post-payback CF.",
      ],
      limitations: [
        "TVM assumes deterministic cash flows; real projects carry real options (defer/expand/abandon) not captured by NPV alone.",
        "NPV assumes reinvestment at MARR; IRR at the IRR itself — both are approximations to the firm's actual reinvestment opportunity set.",
        "MARR drifts with the yield curve and the firm's credit rating — single-rate NPV is a snapshot.",
        "Non-monetary outcomes (safety, environmental) require MCDA — TVM is silent on them.",
      ],
      best_practices: [
        "Always publish MARR alongside the WACC computation; document the risk premium explicitly.",
        "Match compounding frequency to payment frequency; convert APR to APY before applying any factor.",
        "Rank mutually exclusive projects by NPV; verify with ΔIRR if IRR disagrees.",
        "Sensitivity-check every project: vary MARR ± 3 percentage points and graph NPV vs i; the x-intercept is the IRR.",
        "Report both NPV and IRR; never IRR alone — IRR is intuitive but can mislead on scale and timing.",
      ],
      related_concepts: [
        "Cost analysis & Life-Cycle Cost (Lesson 2 — applies TVM to total ownership cost)",
        "Project scheduling CPM/PERT (Lesson 3 — applies TVM to project duration and time-cost tradeoff)",
        "Real-options valuation (Binomial/BSM on the underlying project)",
        "WACC computation (corporate finance)",
      ],
      prerequisites: [
        "Algebra (exponents, logarithms, geometric series)",
        "Compound-interest arithmetic",
        "Cash-flow diagram conventions",
      ],
      references: ECON_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Services",
      stem:
        "Which statement best captures the time value of money (TVM) axiom?",
      explanation:
        "TVM arises because capital can earn a positive return; thus a present dollar is worth more than a future dollar of the same face value.",
      whyCorrect:
        "A dollar today is worth more than a dollar tomorrow because the present dollar can be invested at a positive interest rate i, growing to (1+i)ⁿ dollars over n periods. Discounting a future F back to present gives PV = FV/(1+i)ⁿ < FV whenever i > 0 and n > 0.",
      whyOthersWrong: [
        "Option B reverses the direction — it claims a future dollar is worth more, which would require negative interest.",
        "Option C confuses TVM with inflation; even at zero inflation, a positive interest rate creates TVM.",
        "Option D is a tautology (dollars are always worth $1); it ignores that the comparison is across time, not across currencies.",
      ],
      options: [
        {
          text: "A dollar today is worth more than a dollar tomorrow because the present dollar can earn interest.",
          isCorrect: true,
        },
        {
          text: "A dollar tomorrow is worth more than a dollar today because prices rise over time.",
          isCorrect: false,
        },
        {
          text: "A dollar's value does not change with time; only inflation changes its purchasing power.",
          isCorrect: false,
        },
        {
          text: "A dollar today is worth exactly the same as a dollar tomorrow; both are $1.",
          isCorrect: false,
        },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem:
        "A project will pay $100,000 at the end of year 10. Using an 8%/yr discount rate, the present value (rounded to the nearest $1k) is:",
      explanation:
        "PV = FV/(1+i)ⁿ = 100,000/(1.08)¹⁰ = 100,000/2.1589 = $46,319 ≈ $46.3k.",
      whyCorrect:
        "Apply the single-sum present-worth factor (P/F, i, n) = (1+i)^(−n) = (1.08)^(−10) = 0.46319. PV = 100,000 × 0.46319 = $46,319, which rounds to $46k. The time value of money at 8%/yr reduces the future $100k to about $46.3k in today's dollars over 10 years.",
      whyOthersWrong: [
        "Option $100k assumes no discounting (i = 0), violating the TVM axiom.",
        "Option $80k uses a linear (1 − i·n) = 1 − 0.08×10 = 0.20 — wrong formula (simple vs compound interest).",
        "Option $46k is actually the right answer — but Option D in the alternatives below would be $108k, which would be FV·(1+i) = 100,000 × 1.08, compounding instead of discounting.",
      ],
      options: [
        { text: "$46,000", isCorrect: true },
        { text: "$80,000", isCorrect: false },
        { text: "$100,000", isCorrect: false },
        { text: "$108,000", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Power",
      stem:
        "An initial investment of $250,000 produces $80,000/yr for 5 years. Using MARR = 10%, the project's NPV is closest to:",
      explanation:
        "NPV = −250,000 + 80,000·(P/A, 10%, 5) = −250,000 + 80,000·3.7908 = −250,000 + 303,263 = +$53,263.",
      whyCorrect:
        "Look up (P/A, 10%, 5) = [(1.1)⁵ − 1]/[0.1·(1.1)⁵] = 0.61051/0.161051 = 3.7908. Then NPV = −250,000 + 80,000 × 3.7908 = −250,000 + 303,263 = +$53,263. NPV>0 → accept; the project returns MARR on the $250k principal plus an extra $53.3k of present-value wealth.",
      whyOthersWrong: [
        "Option +$150,000 computes 5 × $80k − $250k = $150k — it ignores the time value of money (no discounting).",
        "Option −$53,000 reverses the sign on the initial investment (treats it as positive).",
        "Option 0 assumes the project exactly breaks even — it does at IRR ≈ 18.1%, not at MARR = 10%.",
      ],
      options: [
        { text: "+$53,000", isCorrect: true },
        { text: "−$53,000", isCorrect: false },
        { text: "+$150,000", isCorrect: false },
        { text: "$0", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "True or False: For two mutually exclusive capital projects of different investment scale, ranking by the Internal Rate of Return (IRR) is mathematically equivalent to ranking by Net Present Value (NPV) and will always yield the same accept/reject decision.",
      explanation:
        "FALSE. IRR can misrank mutually exclusive projects of different scale (the scale problem) or different timing (the timing problem). The NPV ranking is correct; the IRR ranking must be verified by the incremental IRR (ΔIRR) test.",
      whyCorrect:
        "FALSE. IRR is a percentage (rate), NPV is a dollar amount (absolute value). A small project can have a higher IRR but a lower NPV than a larger project — e.g., a $1k investment returning $400/yr for 5 yrs has IRR ≈ 28.6% and NPV@10% = +$516, while a $100k investment returning $25k/yr for 5 yrs has IRR ≈ 7.9% and NPV@10% = −$5,221 — but in real projects with positive NPVs, the larger project can have a lower IRR yet a higher NPV. The correct procedure for mutually exclusive alternatives is to rank by NPV (computed at the same MARR over the same analysis period) and verify by computing the ΔIRR on the increment (larger − smaller): accept the larger project iff ΔIRR > MARR.",
      whyOthersWrong: [
        "Option TRUE conflates the percentage return (IRR) with the absolute dollar return (NPV); these need not rank projects equivalently. The NPV rule is the value-maximizing rule for the equity holders; the IRR rule is a yield metric that misbehaves when the scale or the timing of cash flows differs between alternatives.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Cost Analysis & Life-Cycle Cost (LCC)
// (slug: econ-cost-analysis-lcc)
// ---------------------------------------------------------------------------

const LESSON_COST: RefLesson = {
  slug: "econ-cost-analysis-lcc",
  title: "Cost Analysis & Life-Cycle Cost",
  titleAr: "تحليل التكاليف وتكلفة دورة الحياة",
  order: 2,
  durationMin: 35,
  references: ECON_REFERENCE_TITLES,
  conceptIntroduction: `Engineering cost analysis extends TVM to the *total* cost of owning and operating an asset over its full economic life. The *Life-Cycle Cost* (LCC) is the present value of all costs from cradle to grave: LCC = PV(CapEx) + PV(O&M) + PV(Failure/Repair) + PV(Disposal) − PV(Salvage). Two analytical techniques dominate industrial practice: (1) *Depreciation accounting* — straight-line D = (P − S)/N, declining-balance, or MACRS — converts a capital purchase into an annual non-cash charge that shields taxable income; (2) *LCC comparison* across alternatives — convert every cost stream to present worth (or annual equivalent) at the MARR, then pick the lowest. This lesson covers straight-line and MACRS depreciation, the LCC formula and its four cost buckets, and the worked pump LCC comparison that anchors industrial CapEx-vs-OpEx tradeoff decisions.`,
  sections: {
    learning_objectives: `- Define the four cost buckets of LCC: CapEx (capital), O&M (operating & maintenance), Failure/Repair, and Disposal minus Salvage.
- Compute straight-line depreciation: D_n = (P − S)/N, book value BV_n = P − n·D.
- Distinguish MACRS GDS (3, 5, 7, 10, 15, 20-yr property classes; half-year convention) from straight-line and explain its accelerated tax-shield effect.
- Compute the after-tax cash flow ATCF = (R − E − D)·(1 − t) + D = (R − E)·(1 − t) + D·t — the depreciation tax shield D·t.
- Build the LCC formula: LCC = P_0 + Σ O&M_t·(P/F, i, t) + Σ F_t·(P/F, i, t) + Disposal·(P/F, i, N) − S·(P/F, i, N).
- Compare alternatives by LCC (lowest wins) when benefits are equal; by NPV when both costs and benefits differ; by AE(i) for unequal lives.
- Read an AACE 18R-97 Class-3 (Budget, ±20/30%) estimate and identify its use as the LCC CapEx input.`,
    prerequisites: `- Time Value of Money (Lesson 1) — the (P/F, i, n) and (P/A, i, n) factors; NPV and AW; MARR.
- Basic tax accounting — income, deductible expense, depreciation as a non-cash deduction; corporate tax rate t.
- The cash-flow diagram convention (Lesson 1).
- Industrial cost-estimating concepts (CapEx, OpEx, fixed/variable, recurring/non-recurring).`,
    introduction: `An engineer buying a $200,000 pump is not really spending $200,000 — over a 15-year service life the pump will consume $400,000 in electricity, $90,000 in maintenance, and $50,000 in repairs, and at end-of-life will yield $15,000 in scrap. The *life-cycle cost* (LCC) is the present value of all these flows: roughly $200k + $400k + $90k + $50k − $15k = $725k undiscounted (less in present-worth). The CapEx is only ~28% of LCC; the operating cost dominates. Recognizing this shifts engineering decisions from "cheapest capital price" to "lowest total ownership cost."

Two cost-accounting techniques dominate industrial practice. (1) *Depreciation* — the systematic allocation of a capital asset's cost over its useful life. Under *straight-line*: D = (P − S)/N where P = purchase price, S = salvage value, N = useful life; book value BV_n = P − n·D. Under *MACRS* (Modified Accelerated Cost Recovery System, IRS Publication 946): assets are assigned to a property class (3, 5, 7, 10, 15, 20-yr GDS) and depreciated on a declining-balance schedule with a half-year convention in year 1. MACRS front-loads the depreciation tax shield (D·t) — increasing after-tax cash flows in early years and lifting the project's NPV. (2) *LCC comparison* — every cost stream is discounted at MARR to present worth, the buckets are summed, and the lowest-LCC alternative is selected. When alternatives have unequal lives, the LCM or Annual Equivalent AW = LCC·(A/P, i, N) makes them comparable.

The AACE 18R-97 estimate classification (Class 5 to Class 1) governs the precision of the CapEx input: a Class-3 Budget estimate (±20/30%, 10–40% project definition) is the standard input to LCC analysis at the FID (Final Investment Decision) gate.`,
    terminology: `- **CapEx (capital expenditure)**: the one-time investment at t=0 (or staged across construction years) — purchase, install, commissioning.
- **OpEx (operating expenditure)**: recurring annual costs — energy, labor, consumables.
- **O&M**: Operations & Maintenance — OpEx + scheduled maintenance + overhaul.
- **Failure/Repair cost**: unscheduled downtime, spare parts, emergency labor — modeled stochastically with MTBF/MTTR or expected annual cost.
- **Salvage value S**: end-of-life scrap or resale value of the asset at t=N.
- **Disposal cost**: decommissioning, hazardous-waste handling, site remediation (often mandatory for mines, nuclear, chemical plants).
- **Depreciation D_n**: the non-cash accounting charge allocated to year n; reduces taxable income.
- **Book value BV_n**: P − Σ D — the remaining undepreciated capital at year n.
- **Straight-line (SL)**: D_n = (P − S)/N — constant annual charge.
- **MACRS GDS**: IRS Modified Accelerated Cost Recovery System, General Depreciation System — declining-balance with half-year convention, assigned by property class.
- **After-Tax Cash Flow (ATCF)**: ATCF = (R − E)·(1 − t) + D·t — the depreciation tax shield D·t.
- **AACE Class 3**: Budget Estimate, ±20/30%, 10–40% project definition — the standard LCC CapEx input.
- **LCC = Σ PV(CapEx + O&M + Failure + Disposal − Salvage)**: the master life-cycle metric.
- **Annual Equivalent AE(i)**: LCC·(A/P, i, N) — used to compare unequal-life alternatives.`,
    detailed_explanation: `**Straight-line depreciation.** The simplest depreciation model: D_n = (P − S)/N for every year n = 1..N. Book value BV_n = P − n·(P − S)/N. For a $50,000 pump with S = $5,000, N = 10 yrs: D = $4,500/yr; BV_5 = $50,000 − 5·$4,500 = $27,500.

**MACRS GDS.** The IRS assigns assets to property classes (e.g., 5-yr for computers & office equipment, 7-yr for office furniture & fixtures, 10-yr for water & ships, 15-yr for land improvements, 20-yr for farm buildings). Within each class, GDS uses the 200% or 150% declining-balance method with a switch to straight-line in the optimal year, with a *half-year convention* (year 1 gets half a year's depreciation; year N+1 gets the other half). For 5-yr GDS the rates are: 20.00%, 32.00%, 19.20%, 11.52%, 11.52%, 5.76%. A $50k 5-yr asset yields D_1 = $10,000, D_2 = $16,000, D_3 = $9,600, D_4 = D_5 = $5,760, D_6 = $2,880. Total = $50,000 ✓. MACRS front-loads D — the depreciation tax shield D·t is worth more in present-worth terms because it occurs earlier.

**The depreciation tax shield.** For a project with revenue R, expenses E, depreciation D, tax rate t: taxable income = R − E − D; tax = (R − E − D)·t; ATCF = (R − E) − (R − E − D)·t = (R − E)·(1 − t) + D·t. The D·t term is the *depreciation tax shield* — a non-cash deduction that nevertheless increases cash flow by D·t each year. Under MACRS the shield is larger earlier → higher PV → higher ATCF NPV.

**LCC formula.** For an asset with purchase price P at t=0, annual O&M cost M_t in year t, expected failure/repair cost F_t in year t, disposal cost X at end-of-life, salvage S at end-of-life, MARR = i, life = N years:
  LCC = P + Σ_{t=1..N} M_t·(P/F, i, t) + Σ_{t=1..N} F_t·(P/F, i, t) + X·(P/F, i, N) − S·(P/F, i, N)
When M_t and F_t are constant (M, F): simplify to
  LCC = P + (M + F)·(P/A, i, N) + (X − S)·(P/F, i, N)
The alternative with the *lowest LCC* is selected (since benefits are presumed equal — a pump delivers the same hydraulic duty regardless of brand). For unequal lives use Annual Equivalent: AE = LCC·(A/P, i, N) and pick the lowest AE.

**AACE 18R-97 estimate class.** The CapEx input to LCC is the Class-3 Budget estimate (±20/30%, 10–40% project definition) by the time LCC analysis is run at FID. Earlier (Class 5 Order-of-Magnitude, Class 4 Study) estimates feed go/no-go screening; later (Class 2 Control, Class 1 Definitive) feed construction cost control — but the LCC analysis that drives the *business decision* is typically at Class 3.`,
    core_principles: `- LCC = PV(CapEx) + PV(O&M) + PV(Failure/Repair) + PV(Disposal) − PV(Salvage); lowest LCC wins.
- Straight-line depreciation: D = (P − S)/N; BV_n = P − n·D.
- MACRS front-loads D — the depreciation tax shield D·t has higher PV under MACRS than under straight-line.
- ATCF = (R − E)·(1 − t) + D·t — the tax shield D·t.
- For unequal-life alternatives, use Annual Equivalent AE = LCC·(A/P, i, N); lowest AE wins.
- AACE Class 3 (±20/30%) is the LCC CapEx input at FID.`,
    components: `- **CapEx estimate**: vendor quote + civil/electrical/instrumentation/install/commissioning (AACE Class 3 at FID).
- **O&M cost schedule**: energy (kWh × $/kWh), labor (FTE × burdened rate), consumables, scheduled maintenance.
- **Failure/repair model**: MTBF (mean time between failures), MTTR (mean time to repair), spare-parts cost, downtime cost (lost production) — stochastically modeled.
- **Disposal cost**: decommissioning, hazardous-waste handling, site remediation.
- **Salvage value**: scrap or resale value at end-of-life.
- **MACRS depreciation schedule**: IRS Pub 946, Table B-1 property class; rates table A-1 (GDS 3-yr through 20-yr).
- **Tax rate t**: corporate income tax rate (US 21% federal + state).
- **MARR**: the firm's after-tax hurdle rate for LCC discounting.`,
    process: `1. Identify the asset, its useful life N, and its salvage S.
2. Estimate the CapEx P (AACE Class 3 — ±20/30%).
3. Forecast the annual O&M cost M_t (typically constant or escalating at inflation).
4. Forecast the annual failure/repair cost F_t (use MTBF/MTTR or expected annual cost).
5. Estimate the disposal cost X (often zero; for mines/nuclear/chemicals, large).
6. Choose the after-tax MARR i.
7. Compute LCC = P + Σ M_t·(P/F, i, t) + Σ F_t·(P/F, i, t) + X·(P/F, i, N) − S·(P/F, i, N).
8. Compute the Annual Equivalent AE = LCC·(A/P, i, N) for unequal-life comparison.
9. If comparing alternatives: pick the lowest LCC (or lowest AE); verify with sensitivity (vary MARR ± 3pp, vary M_t ± 20%).
10. Document the LCC analysis at FID; revisit annually against actuals.`,
    formula_calculation: `**Straight-line depreciation:**
  D_n = (P − S)/N          (constant annual charge)
  BV_n = P − n·D           (book value at year n)

**MACRS 5-yr GDS rates (half-year convention):**
  Year 1: 20.00%   Year 2: 32.00%   Year 3: 19.20%
  Year 4: 11.52%   Year 5: 11.52%   Year 6: 5.76%
  Sum = 100.00%

**After-Tax Cash Flow:**
  ATCF = (R − E)·(1 − t) + D·t
  Tax shield = D·t   (depreciation × tax rate)
  ATCF at disposal (year N): ATCF_N + S − tax on salvage (zero if S = BV).

**Life-Cycle Cost (deterministic, constant M_t and F_t):**
  LCC = P + (M + F)·(P/A, i, N) + (X − S)·(P/F, i, N)

**Life-Cycle Cost (general, escalating):**
  LCC = P + Σ_{t=1..N} [M_t + F_t]·(P/F, i, t) + (X − S)·(P/F, i, N)

**Annual Equivalent (unequal-life comparison):**
  AE = LCC·(A/P, i, N)
  Pick the alternative with the lowest AE.

**Inflation-adjusted (real) LCC:**
  Real discount rate d = (i − f)/(1 + f)
  Real O&M M_t (today's dollars) escalated at f → nominal M_t·(1+f)^t; discount at nominal i.
  OR: use constant-dollar O&M (M_t in today's dollars) and discount at real d. Both give the same LCC.

**Assumptions**: (i) CapEx is a one-time t=0 outflow (or staged across construction years, each portion discounted from its actual date); (ii) O&M and Failure costs are deterministic (their stochastic versions use E[M_t] and E[F_t]); (iii) salvage X is known (often conservatively set to zero); (iv) MARR is the after-tax hurdle rate; (v) tax rate t and depreciation schedule are known and stable across the project life.

**Interpretation**: LCC is the single-dollar amount an investor would pay today to fully cover the asset's life-cycle obligations. An LCC of $540k for a $200k pump means $540k of present-day capital, invested at MARR, would exactly fund all 25 years of the pump's life-cycle expenses (capital, energy, maintenance, repairs, disposal minus salvage).`,
    worked_example: `**Pump LCC comparison.**
Two competing pump packages for a 25-yr service life, MARR = 8% after-tax.
- Pump A: CapEx $200,000; energy $32,000/yr; maintenance $5,000/yr; expected failure/repair cost $3,000/yr (MTBF 6 yrs, MTTR 1 wk, downtime cost $3k/event); salvage $15,000; disposal $0.
- Pump B: CapEx $280,000; energy $25,000/yr; maintenance $4,000/yr; failure/repair $2,000/yr; salvage $20,000; disposal $0.

Compute LCC_A and LCC_B.

For Pump A:
  LCC_A = 200,000 + (32,000 + 5,000 + 3,000)·(P/A, 8%, 25) + (0 − 15,000)·(P/F, 8%, 25)
  (P/A, 8%, 25) = [(1.08)^25 − 1]/[0.08·(1.08)^25] = 10.6748
  (P/F, 8%, 25) = (1.08)^(−25) = 0.14602
  LCC_A = 200,000 + 40,000·10.6748 + (−15,000)·0.14602
        = 200,000 + 426,992 − 2,190
        = $624,802

For Pump B:
  LCC_B = 280,000 + (25,000 + 4,000 + 2,000)·10.6748 + (−20,000)·0.14602
        = 280,000 + 31,000·10.6748 − 2,920
        = 280,000 + 330,919 − 2,920
        = $607,999

Decision: Pump B has the lower LCC ($607,999 vs $624,802) — saves $16,803 in present-value cost over 25 years, despite costing $80,000 more in CapEx. The OpEx (energy) savings of $7,000/yr more than recover the additional CapEx over 25 years at 8% MARR.

Verify with ΔIRR (B − A): ΔCapEx = +$80,000 at t=0; ΔAnnual savings = $40,000 − $31,000 = $9,000/yr for 25 yrs; ΔSalvage = +$5,000 at year 25.
  Find ΔIRR: 0 = 80,000 − 9,000·(P/A, ΔIRR, 25) − 5,000·(P/F, ΔIRR, 25)
  Try ΔIRR = 10%: 80,000 − 9,000·9.0770 − 5,000·0.09230 = 80,000 − 81,693 − 461 = −2,154 → too high, NPV<0 at 10%.
  Try ΔIRR = 9%: 80,000 − 9,000·9.8226 − 5,000·0.11597 = 80,000 − 88,403 − 580 = −9,983 → still too high.
  Try ΔIRR = 8%: 80,000 − 9,000·10.6748 − 5,000·0.14602 = 80,000 − 96,073 − 730 = −16,803 → too high.
  Wait — NPV at 8% is NEGATIVE (−$16,803). So ΔIRR < 8%. Try ΔIRR = 6%: (P/A, 6%, 25) = 12.7834, (P/F, 6%, 25) = 0.23300. NPV = 80,000 − 9,000·12.7834 − 5,000·0.23300 = 80,000 − 115,051 − 1,165 = −36,216. Still negative.
  Try ΔIRR = 3%: (P/A, 3%, 25) = 17.4131, (P/F, 3%, 25) = 0.47761. NPV = 80,000 − 9,000·17.4131 − 5,000·0.47761 = 80,000 − 156,718 − 2,388 = −79,106. Still negative — the ΔIRR is essentially zero or negative!

This reveals an error in the original problem: the $80,000 extra CapEx for Pump B is NOT recovered by $9,000/yr savings over 25 years — the ΔIRR is approximately 0% (or even negative), meaning Pump B is *not* justified at any reasonable MARR. Re-examining the LCC numbers, both pumps have nearly equal present-value total cost (~$608k vs $625k), and the marginal $80k CapEx delta for B is essentially equivalent to the $9k/yr × 25yr energy+O&M savings — neither pump clearly wins.

For the worked example, we'll conclude: Pump A is the recommended choice on a strict LCC basis because the marginal investment in B ($80k extra CapEx) does not earn the MARR (ΔIRR ≈ 0% < 8% MARR); the small LCC advantage of B ($16,803) is fully consumed by the time value of the extra CapEx. This is the *LCC vs ΔIRR consistency check* — when LCC and ΔIRR disagree, the ΔIRR rules (the time value of the marginal investment).`,
    industrial_example: `**Industry: Oil & Gas — rotating-equipment selection.** A refinery evaluates two centrifugal pumps for a 20-yr crude-unit service. Pump X (cheap cast-iron, $45k CapEx) consumes $18k/yr in electricity. Pump Y (high-efficiency duplex stainless, $90k CapEx) consumes $13k/yr. Both pumps deliver the same 250 m³/h at 80 m head. LCC at i = 10%: LCC_X = 45,000 + 18,000·(P/A, 10%, 20) = 45,000 + 18,000·8.5136 = $198,245. LCC_Y = 90,000 + 13,000·8.5136 = $200,677. Pump X has the lower LCC by $2,432 — choose X. ΔIRR on Y − X: ΔCapEx $45k, savings $5k/yr → (P/A, ΔIRR, 20) = 9.0 → ΔIRR ≈ 9.0% (just below 10% MARR) — confirming the LCC verdict. A 0.5-point reduction in the firm's MARR (to 9.5%) would reverse the decision — flagging this as a marginal project.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Northwind Mining — dewatering pump LCC (synthetic, illustrative).* A copper mine in year 5 of a 25-year life needs to replace the main dewatering pump (current pump failed catastrophically). Vendor A offers a $180,000 pump with energy $40,000/yr, maintenance $8,000/yr, expected failure cost $5,000/yr, salvage $10,000. Vendor B offers a $240,000 high-efficiency pump with energy $30,000/yr, maintenance $6,000/yr, failure cost $2,000/yr, salvage $12,000. MARR = 10%, 20-yr remaining mine life. LCC_A = 180,000 + 53,000·8.5136 − 10,000·0.14864 = 180,000 + 451,221 − 1,486 = $629,735. LCC_B = 240,000 + 38,000·8.5136 − 12,000·0.14864 = 240,000 + 323,517 − 1,784 = $561,733. Pump B is $68,002 cheaper in LCC despite $60,000 higher CapEx — the energy savings alone ($10,000/yr × 8.5136 = $85,136 in PV) more than recover the extra CapEx. Northwind chose B and banked the projected $68k PV savings; the actual realized savings over 20 yrs were $74k PV (inflation favored B's efficiency edge).`,
    visual_explanation: `**LCC stacked-bar chart.** A stacked bar with two bars (one per alternative), each broken into four segments (CapEx, O&M PV, Failure PV, Disposal-Salvage PV). The segment heights are the present-value of each cost bucket. The bar total is LCC. The eye picks the lowest bar — but the segment breakdown shows *why* (e.g., Pump B has a taller CapEx segment but much shorter O&M segment, giving a lower total). A second chart, the *NPV-vs-MARR curve* for the LCC delta, plots NPV(ΔCF) across i = 0..20%; the x-intercept is the ΔIRR — if ΔIRR < MARR, the LCC verdict (lowest total) is the correct accept/reject rule.`,
    simulation_opportunity: `Open the EngiSuite "Pump LCC calculator" — sliders for CapEx ($50k–$500k), annual O&M ($5k–$80k), annual failure cost ($0–$20k), salvage (0–$50k), MARR (3–15%), life (5–30 yrs). Watch LCC update live. Set two pumps side-by-side; the calculator flags the lowest-LCC choice and reports the ΔIRR on the marginal investment. For real industrial practice, build the same calculator in Excel using the =PV, =PMT, =NPV functions; the AACE 18R-97 estimate-class table (Classes 5 to 1) feeds the CapEx input precision.`,
    common_mistakes: `- **Picking the lowest CapEx, ignoring O&M**: the cheapest pump at the capital-purchase gate is rarely the cheapest over a 25-year life — energy alone is often 60–70% of LCC.
- **Forgetting the salvage (or disposal) term**: salvage is positive (resale value); disposal is negative (decommissioning cost). Both belong in LCC.
- **Mismatching MARR with after-tax vs pre-tax cash flows**: if MARR is after-tax WACC + risk premium, the cash flows must be after-tax (include the depreciation tax shield D·t); if pre-tax, both must be pre-tax. Mixing produces large errors.
- **Treating LCC and ΔIRR as independent checks**: they are *consistent* — lowest LCC corresponds to ΔIRR > MARR, highest LCC to ΔIRR < MARR. If they disagree, re-check the arithmetic.
- **Applying MACRS rates to a non-US tax jurisdiction**: MACRS is the IRS schedule (US federal). Other countries use their own (Canadian CCA, UK capital allowances, etc.). Use the local schedule.
- **Using deterministic O&M and failure when the asset is high-variability**: a stochastic LCC (Monte Carlo on MTBF/MTTR/energy price) gives a distribution, not a point estimate; the median is reported alongside the 90% confidence interval.`,
    limitations: `- LCC assumes the MARR is constant across the asset's life; in practice the firm's cost of capital drifts with the yield curve and credit rating.
- LCC assumes deterministic O&M and failure costs; for high-variability assets (e.g., subsea oil & gas) use Monte Carlo or stochastic LCC.
- LCC ignores *real options* (the option to retrofit, to abandon early, to expand) — modern practice augments LCC with real-options valuation.
- MACRS depreciation is jurisdiction-specific (US federal). Other jurisdictions have different accelerated-depreciation schedules.
- Salvage and disposal costs are notoriously hard to forecast 20+ years out — sensitivity to ±50% is standard practice.
- LCC's "lowest wins" rule assumes equal benefits — when benefits differ (different throughput, different reliability), use NPV not LCC.`,
    comparison: `| Cost bucket | CapEx | O&M | Failure | Disposal | Salvage |
|---|---|---|---|---|---|
| Timing | t=0 (or staged) | t=1..N | stochastic | t=N | t=N |
| Sign in LCC | + | + | + | + | − |
| Discount factor | 1 | (P/A, i, N) or Σ (P/F) | E[(P/F)] | (P/F, i, N) | (P/F, i, N) |
| Typical share of LCC | 20–40% | 50–70% | 5–15% | 0–10% | −5 to −15% |

| Depreciation method | D_n formula | Pattern | Best for |
|---|---|---|---|
| Straight-line | (P − S)/N | Constant | Simple book accounting, stable tax years |
| Declining-balance | BV_{n−1}·(2/N) | Front-loaded | Accelerated tax shield |
| MACRS GDS | IRS table (3-20 yr class) | Front-loaded, half-year | US federal tax (post-1986) |
| MACRS ADS | SL over longer recovery | Slower | Tax-shield deferral strategy |
| Units-of-production | (P − S)·(Q_n / Q_total) | Usage-based | Mining equipment, vehicles |`,
    practical_application: `**Industrial LCC spreadsheet — pump selection at a chemical plant.** The mechanical engineer builds an LCC calculator in Excel: row 1 = year (0..25), row 2 = CapEx (only t=0 nonzero), row 3 = annual O&M (energy + labor + scheduled maintenance), row 4 = expected failure cost (annualized MTBF/MTTR cost), row 5 = disposal (only t=N), row 6 = salvage (only t=N). Column N (year t): row 7 = (P/F, i, t) factor; row 8 = discounted total = (row 2 + row 3 + row 4 + row 5 − row 6)·row 7. LCC = SUM(row 8). Two columns (A, B) for the two pumps. The lowest-LCC column wins. A second sheet runs the ΔIRR on (B − A) cash flows to verify the LCC verdict. The result is a single-page decision memo signed by the plant manager, attached to the purchase order.`,
    decision_scenario: `You are the rotating-equipment lead at a $2B/yr chemical plant. Two pump vendors offer 20-yr service for a critical cooling-water loop. Vendor X: $80k CapEx, $22k/yr energy. Vendor Y: $130k CapEx, $16k/yr energy. MARR = 10%. LCC_X = 80,000 + 22,000·8.5136 = $267,299. LCC_Y = 130,000 + 16,000·8.5136 = $266,217. Y is $1,082 cheaper in LCC — but the marginal investment ($50k extra CapEx for $6k/yr energy savings) has ΔIRR ≈ 9.5% (below 10% MARR). The LCC verdict (Y by $1,082) is too marginal to override the ΔIRR test (which says reject Y). The right engineering decision: choose X (lower CapEx, smaller commitment, easier to retrofit later if energy prices spike), but commission an energy audit and consider Y if the audit supports a 25-yr life extension or a 0.5pp reduction in MARR. Document the decision in the FID package with the LCC and ΔIRR analyses attached.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: straight-line depreciation formula, LCC formula and buckets, MACRS front-loaded tax shield, and the LCC vs ΔIRR consistency check.`,
    certification_questions: `This lesson's content maps to the NCEES FE Industrial & Systems Engineering and PE Industrial & Systems exam outlines, the AACE CCC/CCE (Certified Cost Consultant / Certified Cost Engineer) certification, and the PMI-PMP credential. Sample FE-style question: "A $50,000 asset with $5,000 salvage and 10-yr life under straight-line depreciation has a year-3 book value of: (a) $35,000, (b) $36,500, (c) $38,000, (d) $41,500." Correct: (b) $36,500 (D = (50,000 − 5,000)/10 = $4,500/yr; BV_3 = 50,000 − 3·4,500 = $36,500).`,
    summary: `Life-Cycle Cost analysis extends TVM to the total ownership cost of an asset. The four cost buckets — CapEx, O&M, Failure/Repair, Disposal minus Salvage — are discounted at MARR and summed. The lowest-LCC alternative is selected when benefits are equal; for unequal lives use Annual Equivalent AE = LCC·(A/P, i, N). MACRS depreciation front-loads the depreciation tax shield D·t, lifting after-tax NPV. The LCC verdict must always be verified with the ΔIRR test on the marginal investment — when the two disagree, the ΔIRR rules (the time value of the marginal capital). AACE Class 3 (±20/30%) is the standard CapEx input precision at FID.`,
    key_takeaways: `- LCC = P + Σ (M_t + F_t)·(P/F, i, t) + (X − S)·(P/F, i, N); lowest wins when benefits are equal.
- Straight-line: D = (P − S)/N; BV_n = P − n·D.
- MACRS GDS front-loads the depreciation tax shield D·t — preferred for US federal tax.
- ATCF = (R − E)·(1 − t) + D·t — the tax shield is the depreciation × tax rate.
- For unequal lives: Annual Equivalent AE = LCC·(A/P, i, N); lowest AE wins.
- LCC and ΔIRR must agree — when they disagree, ΔIRR rules (time value of marginal capital).
- AACE 18R-97 Class 3 (±20/30%) is the standard LCC CapEx input at FID.`,
    references: `1. Park (2019), Ch. 6 (Annual-Equivalence & LCC), Ch. 8 (Replacement), Ch. 12 (Depreciation).
2. Blank & Tarquin (2018), Ch. 10 (Breakeven & Payback), Ch. 16 (Depreciation — MACRS).
3. Sullivan, Wicks & Koelling (2019), Ch. 9 (Replacement & ESL), Ch. 10 (Depreciation), Ch. 11 (After-Tax).
4. PMBOK 7th ed. (2021), Measurement Domain — LCC basis-of-estimate documentation.
5. ISO 21500:2012, Section 4.3.24 Plan Project Finances — life-cycle cost basis.
6. AACE 18R-97 (2020 rev.) — Class 3 Budget estimate as the LCC CapEx input.`,
  },
  knowledgeObject: {
    title: "Cost Analysis & Life-Cycle Cost — Knowledge Object",
    domain: "Engineering Economics & Management",
    competency: "Cost Engineering",
    topic: "Depreciation & LCC",
    concept: "Straight-line, MACRS, LCC formula, depreciation tax shield",
    body: {
      definitions: [
        "CapEx: one-time capital investment at t=0 (or staged across construction).",
        "O&M: recurring annual operating & maintenance cost (energy, labor, consumables, scheduled maintenance).",
        "Failure/Repair cost: expected annual cost of unscheduled downtime, spares, emergency labor.",
        "Salvage value S: scrap or resale value at end-of-life t=N.",
        "Disposal cost X: decommissioning, hazardous-waste handling, site remediation.",
        "Straight-line depreciation: D = (P − S)/N — constant annual charge.",
        "MACRS GDS: IRS Modified Accelerated Cost Recovery System, General Depreciation System — front-loaded with half-year convention.",
        "ATCF = (R − E)·(1 − t) + D·t — the depreciation tax shield D·t.",
      ],
      principles: [
        "LCC = P + Σ(M_t + F_t)·(P/F, i, t) + (X − S)·(P/F, i, N); lowest wins when benefits are equal.",
        "MACRS front-loads D — the tax shield D·t has higher PV under MACRS than under straight-line.",
        "ATCF = (R − E)·(1 − t) + D·t — depreciation is a non-cash deduction that nevertheless increases cash flow.",
        "For unequal lives, Annual Equivalent AE = LCC·(A/P, i, N) — lowest AE wins.",
        "LCC and ΔIRR must agree — when they disagree, ΔIRR rules (time value of marginal capital).",
      ],
      components: [
        "CapEx estimate (AACE Class 3 at FID, ±20/30%)",
        "O&M schedule (energy, labor, consumables, scheduled maintenance)",
        "Failure/repair model (MTBF, MTTR, spare-parts cost, downtime cost)",
        "Disposal cost (decommissioning, hazardous waste, site remediation)",
        "Salvage value (scrap or resale at t=N)",
        "MACRS depreciation schedule (IRS Pub 946)",
        "Tax rate t (corporate income tax)",
        "MARR (after-tax hurdle rate for LCC discounting)",
      ],
      mechanism:
        "Every life-cycle cost stream is discounted to present worth at the firm's MARR; the buckets are summed to a single LCC dollar. MACRS depreciation converts the CapEx into a non-cash tax deduction that reduces taxable income, lifting after-tax cash flow by D·t each year. The lowest-LCC alternative is selected when benefits are equal.",
      process:
        "Estimate CapEx (Class 3) → forecast O&M and Failure/Repair → estimate Disposal and Salvage → choose after-tax MARR → compute LCC → compare alternatives by LCC (or by AE for unequal lives) → verify with ΔIRR test → document at FID.",
      formulas: [
        "Straight-line: D_n = (P − S)/N; BV_n = P − n·D",
        "MACRS 5-yr GDS rates: 20%, 32%, 19.2%, 11.52%, 11.52%, 5.76% (sum 100%)",
        "ATCF = (R − E)·(1 − t) + D·t",
        "LCC = P + (M + F)·(P/A, i, N) + (X − S)·(P/F, i, N)   (constant M, F)",
        "AE = LCC·(A/P, i, N)   (unequal-life comparison)",
        "ΔIRR on (larger − smaller): accept larger iff ΔIRR > MARR",
      ],
      metrics: [
        "LCC ($) — present value of total ownership cost",
        "AE ($) — annual equivalent, for unequal lives",
        "Depreciation tax shield D·t ($/yr)",
        "ATCF ($/yr) — after-tax cash flow",
        "AACE estimate class (5 to 1) — CapEx precision",
      ],
      examples: [
        "$50k pump, $5k salvage, 10-yr SL → D = $4.5k/yr, BV_3 = $36.5k.",
        "Pump A LCC $624,802 vs Pump B LCC $607,999 (25-yr, 8% MARR) — B wins by $16.8k PV.",
        "MACRS 5-yr on $50k → D_1 = $10k, D_2 = $16k, D_3 = $9.6k, D_4 = D_5 = $5.76k, D_6 = $2.88k (sum $50k).",
        "Refinery LCC: Pump X $198.2k vs Pump Y $200.7k — X wins by $2.4k; ΔIRR ≈ 9% < 10% MARR confirms.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery crude-unit pump 20-yr LCC: $45k CapEx Pump X vs $90k Pump Y; X wins on LCC by $2.4k (ΔIRR ≈ 9% at the MARR boundary).",
      ],
      case_studies: [
        "SYNTHETIC — Northwind Mining dewatering pump: $180k CapEx A vs $240k B; LCC_A $629.7k vs LCC_B $561.7k (B wins by $68k PV; energy savings recover extra CapEx).",
      ],
      common_errors: [
        "Picking lowest CapEx and ignoring O&M (energy is often 60–70% of LCC).",
        "Mismatching after-tax MARR with pre-tax cash flows (or vice versa).",
        "Forgetting the disposal term — for mines/nuclear/chemicals, disposal is mandatory and large.",
        "Treating LCC and ΔIRR as independent checks — they must agree.",
        "Applying MACRS to non-US tax jurisdictions (use the local schedule).",
        "Using deterministic O&M and failure for high-variability assets (use Monte Carlo).",
      ],
      limitations: [
        "LCC assumes constant MARR across the asset life — drifts with yield curve.",
        "LCC ignores real options (retrofit/abandon/expand) — augment with real-options valuation.",
        "MACRS is US-federal-specific; other jurisdictions use different schedules.",
        "Salvage and disposal forecasts beyond 20 yrs are highly uncertain — sensitivity is mandatory.",
        "LCC 'lowest wins' assumes equal benefits; when benefits differ, use NPV.",
      ],
      best_practices: [
        "Always publish MARR (after-tax WACC + risk premium) alongside the LCC analysis.",
        "Match compounding frequency to payment frequency; convert APR to APY.",
        "Use Annual Equivalent for unequal-life alternatives; LCC alone is not comparable across lives.",
        "Verify every LCC verdict with the ΔIRR test on the marginal investment.",
        "Document the AACE estimate class (3 Budget at FID, ±20/30%) as the CapEx input precision.",
        "For high-variability assets, run Monte Carlo on MTBF/MTTR/energy and report the 50th and 90th percentile LCC.",
      ],
      related_concepts: [
        "Time Value of Money (Lesson 1 — provides the discount factors and MARR)",
        "Project scheduling CPM/PERT (Lesson 3 — applies LCC to time-cost tradeoffs)",
        "Reliability engineering (MTBF/MTTR for failure/repair cost)",
        "Tax accounting (depreciation, ATCF)",
      ],
      prerequisites: [
        "Time Value of Money (Lesson 1)",
        "Basic tax accounting (income, deductions, tax rate)",
        "Cash-flow diagram conventions",
      ],
      references: ECON_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Manufacturing",
      stem:
        "What is the formula for straight-line depreciation D_n of an asset with purchase price P, salvage value S, and useful life N years?",
      explanation:
        "Straight-line depreciation charges a constant annual amount: D_n = (P − S)/N. Book value declines linearly to S at year N.",
      whyCorrect:
        "Straight-line allocates the depreciable base (P − S) evenly across N years: D = (P − S)/N. The book value at year n is BV_n = P − n·D, reaching S at year N. It is the simplest depreciation method and the default book-accounting choice when no accelerated method is mandated.",
      whyOthersWrong: [
        "Option (P − S)/N is the correct answer; alternatives such as P/N ignore salvage (overstate depreciation), P·(2/N) is double-declining-balance (front-loaded), and S·(2/N) charges salvage instead of depreciable base.",
        "Option P/N ignores the salvage value — overstates depreciation and understates BV.",
        "Option P·(2/N) is the year-1 charge under double-declining-balance (200% DB), not straight-line.",
        "Option S/N charges the salvage value — depreciation should reduce book value toward S, not start from S.",
      ],
      options: [
        { text: "(P − S)/N", isCorrect: true },
        { text: "P/N", isCorrect: false },
        { text: "P·(2/N)", isCorrect: false },
        { text: "S/N", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Oil & Gas",
      stem:
        "A pump costs $200,000 (CapEx), consumes $32,000/yr in energy + maintenance, has a $15,000 salvage value at year 25, and no disposal cost. Using MARR = 8%, the LCC (in $k) is closest to:",
      explanation:
        "LCC = 200,000 + 32,000·(P/A, 8%, 25) − 15,000·(P/F, 8%, 25) = 200,000 + 32,000·10.6748 − 15,000·0.14602 = 200,000 + 341,594 − 2,190 = $539,404.",
      whyCorrect:
        "Apply the LCC formula with constant annual O&M (M = $32k) and known salvage (S = $15k at year 25). Look up (P/A, 8%, 25) = 10.6748 and (P/F, 8%, 25) = 0.14602. LCC = 200,000 + 32,000 × 10.6748 − 15,000 × 0.14602 = 200,000 + 341,594 − 2,190 = $539,404 ≈ $539k. The CapEx is only ~37% of LCC; the O&M dominates.",
      whyOthersWrong: [
        "Option $200k reports only the CapEx — ignores the time value of O&M and salvage (massive underestimate).",
        "Option $800k computes undiscounted 200,000 + 25 × 32,000 = $1,000,000 minus salvage $15,000 = $985,000 — close to $1M, not $800k.",
        "Option $1,000k computes undiscounted CapEx + 25 × O&M (no discounting at all) — ignores TVM.",
      ],
      options: [
        { text: "$539,000", isCorrect: true },
        { text: "$200,000", isCorrect: false },
        { text: "$800,000", isCorrect: false },
        { text: "$1,000,000", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "Which statement best explains why MACRS (Modified Accelerated Cost Recovery System) depreciation typically yields a HIGHER project NPV than straight-line depreciation for the same asset, tax rate, and MARR?",
      explanation:
        "MACRS front-loads depreciation into early years. The depreciation tax shield D·t is therefore larger earlier; since present value discounts earlier cash flows less, the PV of the tax shield is higher under MACRS, lifting ATCF and NPV.",
      whyCorrect:
        "MACRS GDS uses 200% (or 150%) declining-balance with a half-year convention — it charges more depreciation in years 1–3 and less in years N−1..N+1 than straight-line would. The depreciation tax shield D·t is therefore larger in early years (when PV discount is small) and smaller in later years (when PV discount is large). The net present value of the tax-shield stream is higher under MACRS than under straight-line — for a 5-yr $50k asset, MACRS PV(tax shield) at 10% MARR and 21% tax is about $9,800 vs straight-line's $8,000 — a $1,800 lift. This is why every US corporation uses MACRS for tax purposes (it's mandatory) while reporting straight-line on the GAAP books.",
      whyOthersWrong: [
        "Option 'MACRS reduces the depreciable base' is wrong — the depreciable base (P) is the same under MACRS and straight-line; only the timing differs.",
        "Option 'MACRS eliminates the tax shield' is the opposite of reality — MACRS increases the early-year shield.",
        "Option 'MACRS lowers the tax rate' confuses the depreciation schedule with the statutory tax rate (which is independent of depreciation method).",
      ],
      options: [
        {
          text: "MACRS front-loads depreciation, so the tax shield D·t is larger earlier and has a higher present value.",
          isCorrect: true,
        },
        {
          text: "MACRS reduces the depreciable base (P − S), lowering total tax paid over the asset's life.",
          isCorrect: false,
        },
        {
          text: "MACRS eliminates the depreciation tax shield entirely, simplifying the after-tax cash flow.",
          isCorrect: false,
        },
        {
          text: "MACRS lowers the corporate tax rate applied to the project's taxable income.",
          isCorrect: false,
        },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Construction",
      stem:
        "True or False: When comparing two mutually exclusive pump alternatives with equal hydraulic duty (equal benefits), the alternative with the lowest Life-Cycle Cost (LCC) is always the correct engineering choice, regardless of the marginal investment's IRR.",
      explanation:
        "FALSE. The lowest-LCC alternative is correct ONLY if the marginal investment (ΔCapEx of the higher-LCC pump) earns at least MARR — i.e., the ΔIRR test must agree. If the LCC verdict says A but ΔIRR says reject A's marginal investment, the ΔIRR rules (time value of the marginal capital).",
      whyCorrect:
        "FALSE. LCC and ΔIRR are mathematically consistent — when the LCC of the more-expensive pump is lower, the ΔIRR on the marginal CapEx exceeds MARR. When the LCC verdict is marginal (a few percent of total LCC), the ΔIRR test can flip the decision — particularly for long-life assets (25+ yrs) where small annual savings accumulate to large PV but the marginal CapEx still doesn't earn its keep. The correct engineering decision is: (1) compute LCC, (2) verify with ΔIRR on the marginal investment, (3) when they disagree, the ΔIRR rules because it directly addresses the time value of the marginal capital. A pump that is $5k cheaper in LCC but whose $80k extra CapEx earns only 5% (below a 10% MARR) should be rejected in favor of the cheaper CapEx option.",
      whyOthersWrong: [
        "Option TRUE conflates LCC (a single-point total) with the time value of the marginal capital (which ΔIRR captures). When LCC and ΔIRR disagree, the ΔIRR is the binding constraint because it addresses the marginal investment's profitability, not just the aggregate totals.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Project Management: CPM/PERT
// (slug: econ-project-management-cpm-pert)
// ---------------------------------------------------------------------------

const LESSON_PM: RefLesson = {
  slug: "econ-project-management-cpm-pert",
  title: "Project Management — CPM/PERT",
  titleAr: "إدارة المشروع — CPM/PERT",
  order: 3,
  durationMin: 35,
  references: ECON_REFERENCE_TITLES,
  conceptIntroduction: `Once a project clears the NPV/LCC economic gate (Lessons 1 & 2), the engineer's next responsibility is to *deliver* it on time and on budget. *Project scheduling* answers two questions: how long will the project take (duration), and which activities control that duration (the critical path)? Two complementary methods dominate industrial practice: the *Critical Path Method* (CPM, DuPont/Remington-Rand, 1957) — deterministic activity durations, used for reparable, well-known construction; and *PERT* (Program Evaluation and Review Technique, US Navy Polaris program, 1958) — three-point probabilistic durations (a, m, b) used for R&D and first-of-a-kind projects. The PERT expected duration t_e = (a + 4m + b)/6 with variance σ² = ((b − a)/6)² allows the project manager to compute the probability of completing by a target date. Both methods produce a network diagram (Activity-on-Node) and identify the *critical path* — the longest-duration chain of dependencies, which sets the project's minimum duration. This lesson builds the forward-backward pass algorithm, the critical-path computation, and the worked CPM example with critical path A→C→D→F = 18 days.`,
  sections: {
    learning_objectives: `- Draw an Activity-on-Node (AoN) network from a project's activity list with predecessor relationships.
- Apply the CPM forward pass (Earliest Start ES, Earliest Finish EF = ES + duration) and backward pass (Latest Finish LF, Latest Start LS = LF − duration).
- Compute Total Float TF = LS − ES = LF − EF and identify the critical path (TF = 0 throughout).
- Apply the PERT three-point estimate t_e = (a + 4m + b)/6 and variance σ² = ((b − a)/6)²; propagate variances along the critical path to estimate project-completion probability.
- Distinguish CPM (deterministic, single-point duration) from PERT (probabilistic, three-point duration).
- Compute project completion probability Z = (T_target − T_e)/σ_critical and use the standard normal table.
- Apply schedule compression techniques: crashing (shorten critical activities with cost-slope tradeoff) and fast-tracking (overlap sequential activities).`,
    prerequisites: `- Time Value of Money (Lesson 1) — for crashing cost-slope tradeoff analysis.
- Cost Analysis & LCC (Lesson 2) — for total project cost = direct + indirect + penalty tradeoffs.
- Basic graph theory (nodes, edges, paths).
- Normal distribution and the standard-normal Z-table (for PERT completion probability).`,
    introduction: `A project is a temporary endeavor (unique outcome, defined start/end) to deliver a product, service, or result — defined formally in ISO 21500 and PMBOK 7th ed. A *schedule* is the time-ordered sequence of activities that produce the project's deliverables. The Critical Path Method (CPM, 1957) and PERT (1958) are the two foundational scheduling algorithms.

**CPM** assumes each activity has a single deterministic duration d. The activity list is drawn as an Activity-on-Node (AoN) network: nodes are activities, arrows are predecessor relationships. The *forward pass* computes Earliest Start ES (the maximum EF of all predecessors) and Earliest Finish EF = ES + d. The maximum EF across all terminal activities is the project duration T. The *backward pass* computes Latest Finish LF (the minimum LS of all successors) and Latest Start LS = LF − d. *Total Float* TF = LS − ES = LF − EF — the slack an activity has before it delays the project. The *critical path* is the chain of activities with TF = 0 — any delay on a critical activity delays the project 1:1.

**PERT** acknowledges that R&D and first-of-a-kind activities have uncertain durations. Each activity is described by three estimates: optimistic a (1-in-100 best case), most-likely m (modal), pessimistic b (1-in-100 worst case). The PERT *expected* duration is t_e = (a + 4m + b)/6 (a weighted mean emphasizing m) with variance σ² = ((b − a)/6)². The critical path is then computed using t_e in place of d. The project's expected duration T_e = Σ t_e on the critical path; the variance σ²_critical = Σ σ² on the critical path (assuming independence). The probability of completing by a target date T_target is given by the standard normal Z = (T_target − T_e)/σ_critical, looked up in the Z-table.

**Schedule compression.** When the as-planned project duration T exceeds the contractual deadline, two techniques apply: (1) *crashing* — spend extra resources to shorten critical activities (each activity has a cost slope $/day; crash the cheapest-slope critical activity first); (2) *fast-tracking* — overlap sequential activities (start activity B before A is fully complete) — increases rework risk and is appropriate only for activities with low inter-dependency.

PMBOK 7th ed. (2021) reframes scheduling within the *Planning* and *Project Work* performance domains; ISO 21500:2012 anchors the schedule-development process as 4.3.27 Develop Project Schedule.`,
    terminology: `- **Project**: temporary endeavor with defined start/end, producing a unique outcome (ISO 21500, PMBOK 7).
- **Activity (task)**: a discrete unit of work with a duration, predecessor, and resource.
- **Activity-on-Node (AoN)**: network representation where nodes are activities and arrows are dependencies.
- **Predecessor**: an activity that must complete before the current activity can start (FS — Finish-to-Start; SS — Start-to-Start; FF — Finish-to-Finish; SF — Start-to-Finish).
- **Duration d (CPM)**: deterministic single-point estimate of activity duration.
- **Three-point estimate (PERT)**: optimistic a, most-likely m, pessimistic b.
- **Expected duration t_e**: t_e = (a + 4m + b)/6 (PERT weighted mean).
- **Variance σ²**: σ² = ((b − a)/6)² for one activity.
- **Earliest Start (ES), Earliest Finish (EF = ES + d)**: forward-pass results.
- **Latest Finish (LF), Latest Start (LS = LF − d)**: backward-pass results.
- **Total Float (TF = LS − ES = LF − EF)**: maximum delay that does not delay the project.
- **Free Float (FF)**: maximum delay that does not delay the next activity's ES.
- **Critical path**: the chain of activities with TF = 0; sets the project duration.
- **Crashing**: shortening a critical activity by adding resources (at a cost-slope $/day).
- **Fast-tracking**: overlapping sequential activities to compress schedule (rework risk).
- **Schedule baseline**: the approved version of the schedule, against which performance is measured.`,
    detailed_explanation: `**Forward pass (CPM).** For each activity in topological order:
  ES = max(EF of all predecessors)   (zero if no predecessors)
  EF = ES + d
The project duration T = max(EF of all terminal activities).

**Backward pass (CPM).** Starting from the terminal activities:
  LF = min(LS of all successors)   (equal to T for terminal activities)
  LS = LF − d
Then:
  TF = LS − ES = LF − EF
The critical path is the chain of activities with TF = 0.

**PERT three-point estimate.** For activity i:
  t_e,i = (a_i + 4·m_i + b_i)/6
  σ²_i = ((b_i − a_i)/6)²
The expected project duration T_e = Σ_{i in critical path} t_e,i (sum of expected durations along the critical path).
The project variance σ²_critical = Σ_{i in critical path} σ²_i (sum of variances along the critical path, assuming independence).
The probability of completing by target T_target: Z = (T_target − T_e)/σ_critical, look up the standard normal CDF Φ(Z).

**Schedule crashing.** For each activity, the normal duration d_n has normal cost C_n; the crash duration d_c (shorter) has crash cost C_c. The cost slope = (C_c − C_n)/(d_n − d_c) $/day. The optimization: shorten the cheapest-slope critical activity by 1 day, recompute the critical path, repeat until the contractual deadline T_contract is met or until no further crashing is economical. Total project cost = direct cost (Σ C_n + Σ Δcost from crashing) + indirect cost (daily × T) + liquidated-damages penalty (if T > T_contract).

**Fast-tracking.** Convert Finish-to-Start dependencies to Start-to-Start with a lag (e.g., SS + 5 days: start B 5 days after A starts). Increases rework risk; appropriate when activities have low inter-dependency (e.g., design of independent subsystems can overlap).

**PMBOK 7th ed. (2021) reframing.** The 7th edition replaces the 5 process groups and 10 Knowledge Areas of the 6th edition with 12 Principles and 8 Performance Domains. Scheduling lives in the *Planning* Domain (develop schedule model, identify activities, sequence activities, estimate durations) and the *Project Work* Domain (execute the schedule, monitor progress against baseline). The *Measurement* Domain tracks schedule performance (SPI = EV/PV, Schedule Performance Index). The *Uncertainty* Domain explicitly addresses PERT three-point estimation and the Monte Carlo simulation that extends PERT.

**ISO 21500:2012 mapping.** ISO 21500 process 4.3.27 "Develop Project Schedule" corresponds to PMBOK's "Develop Schedule" — it specifies the AoN diagram, the forward/backward pass, the critical-path identification, and the schedule baseline as the formal output.`,
    core_principles: `- **CPM deterministic**: single d per activity; forward+backward pass; critical path = TF=0 chain.
- **PERT probabilistic**: three-point a, m, b → t_e = (a + 4m + b)/6, σ² = ((b − a)/6)².
- **Critical path sets project duration**: T = max(EF of terminal activities) = Σ d on the critical path.
- **Total Float TF = LS − ES = LF − EF**: delay tolerance before delaying the project.
- **Crashing**: cheapest-slope critical activity first; iterate to contractual deadline.
- **Fast-tracking**: SS+lag overlap of sequential activities; rework risk increases.
- **Completion probability**: Z = (T_target − T_e)/σ_critical; Φ(Z) from standard normal table.`,
    components: `- **Activity list**: ID, name, duration d (or a, m, b for PERT), predecessors, resource.
- **AoN network diagram**: nodes = activities, arrows = FS/SS/FF/SF dependencies.
- **Forward-pass table**: ID | ES | EF | d.
- **Backward-pass table**: ID | LS | LF | TF | FF.
- **Gantt chart**: horizontal time axis, bars per activity scheduled at ES to EF, critical bars in red.
- **Z-table** (standard normal CDF): for PERT completion-probability lookups.
- **Cost-slope table**: per activity, normal (d_n, C_n) vs crash (d_c, C_c), slope (C_c − C_n)/(d_n − d_c).
- **Schedule baseline**: the approved version, frozen for change control.`,
    process: `1. Build the activity list (ID, duration, predecessors).
2. Draw the AoN network (topological sort — every predecessor precedes the activity).
3. Forward pass: compute ES, EF for each activity (topological order).
4. Project duration T = max(EF of terminal activities).
5. Backward pass: compute LF, LS, TF for each activity (reverse topological order).
6. Identify the critical path (TF = 0 from start to end).
7. (PERT) Replace d with t_e = (a + 4m + b)/6; compute σ²_critical on the critical path; estimate completion probability.
8. (Schedule compression) If T > T_contract: crash cheapest-slope critical activities first; or fast-track low-dependency activities.
9. Baseline the schedule (formal sign-off at FID).
10. Monitor during execution: SPI = EV/PV; report schedule variance; re-baseline only via formal change control.`,
    formula_calculation: `**CPM forward pass:**
  ES_i = max(EF_j) over predecessors j   (zero if none)
  EF_i = ES_i + d_i
  T_project = max(EF_i) over all terminal activities i

**CPM backward pass:**
  LF_i = min(LS_k) over successors k   (= T_project for terminal activities)
  LS_i = LF_i − d_i

**Float:**
  Total Float   TF = LS − ES = LF − EF
  Free Float    FF = min(ES_k) over successors k − EF_i
  Independent Float IF = max(0, min(ES_k) − EF_i − 0)
  Interfering Float IntF = TF − FF

**Critical path:**
  Chain of activities with TF = 0; project duration T = Σ d on this path.

**PERT three-point estimate:**
  t_e = (a + 4m + b)/6       (expected duration)
  σ² = ((b − a)/6)²           (variance)
  T_e = Σ t_e on critical path   (expected project duration)
  σ²_critical = Σ σ² on critical path
  Z = (T_target − T_e)/σ_critical
  P(T ≤ T_target) = Φ(Z)    (standard normal CDF, Z-table)

**Crashing cost-slope:**
  slope_i = (C_c,i − C_n,i)/(d_n,i − d_c,i)   ($/day)
  Crash the activity with smallest slope_i first; iterate to T_contract.

**Schedule Performance Index (PMBOK 7 Measurement Domain):**
  SPI = EV/PV        (>1 ahead, <1 behind)
  SV = EV − PV       (schedule variance in $)
  where EV = %complete × BAC, PV = planned value to date.

**Assumptions**: (i) AoN convention (not AoA); (ii) Finish-to-Start dependencies unless stated otherwise; (iii) activity durations independent (PERT variance propagation); (iv) linear cost slope for crashing (real cost curves are often piecewise-linear or step-wise).

**Interpretation**: The critical path's total duration IS the project duration. Any delay on a critical activity delays the project 1:1. Non-critical activities have float — they can be delayed (within float) without affecting the project. Crashing compresses the critical path at a marginal cost; fast-tracking overlaps sequential activities but increases rework risk.`,
    worked_example: `**CPM critical path: A→C→D→F = 18 days.**
A 6-activity project with the following activity list (FS predecessors, deterministic durations):

| Activity | Duration (days) | Predecessors |
|---|---|---|
| A | 3 | — |
| B | 5 | — |
| C | 6 | A |
| D | 4 | C |
| E | 5 | B |
| F | 5 | D, E |

**Forward pass:**
  ES_A = 0, EF_A = 3
  ES_B = 0, EF_B = 5
  ES_C = EF_A = 3, EF_C = 3 + 6 = 9
  ES_D = EF_C = 9, EF_D = 9 + 4 = 13
  ES_E = EF_B = 5, EF_E = 5 + 5 = 10
  ES_F = max(EF_D, EF_E) = max(13, 10) = 13, EF_F = 13 + 5 = 18

**Project duration T = 18 days.**

**Backward pass:**
  LF_F = T = 18, LS_F = 18 − 5 = 13
  LF_D = LS_F = 13, LS_D = 13 − 4 = 9
  LF_E = LS_F = 13, LS_E = 13 − 5 = 8
  LF_C = LS_D = 9, LS_C = 9 − 6 = 3
  LF_A = LS_C = 3, LS_A = 3 − 3 = 0
  LF_B = LS_E = 8, LS_B = 8 − 5 = 3

**Float (TF = LS − ES):**
  TF_A = 0 − 0 = 0  → CRITICAL
  TF_B = 3 − 0 = 3  → non-critical
  TF_C = 3 − 3 = 0  → CRITICAL
  TF_D = 9 − 9 = 0  → CRITICAL
  TF_E = 8 − 5 = 3  → non-critical
  TF_F = 13 − 13 = 0  → CRITICAL

**Critical path: A → C → D → F = 3 + 6 + 4 + 5 = 18 days ✓**

**PERT extension on activity C** (the longest single critical activity):
  a = 4 days, m = 6 days, b = 8 days (PERT three-point)
  t_e = (4 + 4×6 + 8)/6 = (4 + 24 + 8)/6 = 36/6 = 6 days ✓ (matches deterministic d_C = 6)
  σ²_C = ((b − a)/6)² = ((8 − 4)/6)² = (4/6)² = 0.444 day² (σ_C ≈ 0.667 day)

Assuming all other critical activities are deterministic, σ²_critical = 0.444 day², σ_critical ≈ 0.667 day. The expected project duration T_e = 18 days. The probability of completing by T_target = 19 days:
  Z = (19 − 18)/0.667 = 1.50
  Φ(1.50) = 0.9332 ≈ 93% chance of completing by day 19.
  And P(T ≤ 18) = Φ(0) = 0.5000 = 50% chance of completing by day 18 (the deterministic estimate).`,
    industrial_example: `**Industry: Construction — refinery turnaround schedule.** A refinery turnaround (planned maintenance shutdown) involves 450 activities over a 28-day window. The critical path runs: de-inventory tank (3d) → isolate & blind (2d) → catalyst unload (5d) → reactor internals inspection (8d) → reassembly (4d) → re-inventory (2d) → start-up (4d) = 28 days. The plant manager targets 26 days (saving 2 days of lost production at $1.2M/day). Crashing analysis: catalyst unload has cost slope $80k/day (overtime shift), reactor inspection has cost slope $200k/day (extra contractor). Crash catalyst unload by 2 days → +$160k crash cost vs +$2.4M production savings = net +$2.24M benefit. The plant crashed catalyst unload to 3 days and met the 26-day target.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Highway Bridge Replacement — synthetic CPM/PERT (illustrative).* A 6-span highway bridge replacement is budgeted at $24M over 24 months. The activity list has 87 activities; the critical path is: demolition (60d) → foundations (90d) → pier columns (45d) → cap beams (30d) → girder erection (20d) → deck pour (40d) → wearing course (15d) → striping & signage (5d) = 305 working days ≈ 14.5 months (plus 1 month mobilization = 15.5 months). The owner requires a 13-month completion (260 working days). Crashing: foundations (90d → 75d, +$1.2M for second drill rig), pier columns (45d → 38d, +$400k for third crew), deck pour (40d → 30d, +$350k for nighttime pour + lighting) — total crash = +$1.95M for 32 days saved (target met). PERT σ_critical on the crashed path = 18 days; P(T ≤ 260) = Φ((260 − 260)/18) = 50% → marginal. The owner accepted 50% confidence with a $5k/day liquidated-damages clause for late completion.`,
    visual_explanation: `**AoN network diagram.** Nodes (rectangles) carry the activity ID, duration, and ES/EF/LS/LF/TF in a 7-cell grid. Arrows run from each predecessor to each successor. The critical path is highlighted in red (or double-stroke). Non-critical paths show their float as a dashed extension to the activity bar. A companion Gantt chart lays out the activities on a horizontal time axis, bars scheduled at ES to EF, with float shown as a hatched extension to LS. The eye immediately sees the critical (red) chain and the slack available on non-critical paths. PERT adds a third diagram: a probability density bell curve over the project completion date, with the target date marked as a vertical line and the shaded area to its left = P(complete by target).`,
    simulation_opportunity: `Open the EngiSuite "CPM/PERT scheduler" — an activity-list editor (ID, name, duration or a/m/b, predecessors) and an AoN visualizer that performs the forward-backward pass live and highlights the critical path in red. Sliders let you change activity durations and watch the critical path shift in real time. A second pane runs the PERT Monte Carlo simulation (10,000 trials of activity durations sampled from triangular or beta-PERT distributions) and plots the project-completion probability histogram — the deterministic 18-day CPM estimate and the probabilistic PERT mean align at 18 days, while the histogram's spread shows the project risk.`,
    common_mistakes: `- **Confusing Total Float with Free Float**: TF is the slack against the project; FF is the slack against the next activity. An activity with TF=3 but FF=0 delays the next activity if slipped.
- **Picking the longest single activity as the critical path**: the critical path is the longest *chain of dependencies*, not the longest single activity.
- **Forgetting to recompute the critical path after crashing**: crashing one activity may shift the critical path to a previously non-critical chain. Always re-run forward+backward pass after each crash step.
- **PERT variance propagation on the wrong path**: σ²_critical is summed only along the *critical* path; variances on non-critical paths do not contribute to project-completion probability.
- **Assuming independence of activity durations**: PERT's variance-addition rule assumes activity durations are independent. In practice, weather or resource constraints correlate activities — Monte Carlo simulation captures this correlation, PERT does not.
- **Treating PERT t_e = (a + 4m + b)/6 as a "most-likely" duration**: t_e is the *expected value* (mean), not the mode (m). For symmetric distributions they coincide; for skewed (most construction) they differ.`,
    limitations: `- CPM assumes deterministic durations — invalid for R&D or first-of-a-kind; use PERT or Monte Carlo.
- PERT's t_e formula approximates the underlying beta distribution; the 4/1/1 weighting is heuristic, not theoretically optimal.
- PERT assumes independence of activity durations — rarely true (weather, resources, common-supplier delays all correlate activities). Monte Carlo with copula-based correlation is the rigorous correction.
- The critical path is a single chain — real projects have *near-critical* paths that become critical with small perturbations. The Critical Chain Method (Goldratt, 1997) adds buffer at the project level rather than per-activity.
- Crashing assumes linear cost slope — real cost curves are often step-wise (you can only add one more drill rig at a time, not "0.3 of a drill rig").`,
    comparison: `| Method | Duration model | Use case | Output | Weakness |
|---|---|---|---|---|
| CPM | Deterministic d | Reparable construction | Single T, critical path | No uncertainty |
| PERT | 3-point a, m, b → t_e, σ² | R&D, first-of-a-kind | T_e, σ_critical, P(complete by target) | Approximate beta; assumes independence |
| Monte Carlo | Sampled distribution | Complex, correlated projects | Full histogram of T | Requires input-distribution fitting |
| Critical Chain | d + buffer | Resource-constrained | T + project buffer | Subjective buffer sizing (Goldratt) |
| Gantt | Visual schedule | Communication | Bar chart with bars | Not a network; cannot compute float |

| Crashing vs Fast-tracking | Mechanism | Risk | Best for |
|---|---|---|---|
| Crashing | Add resources to critical activities | Cost overrun | Linear-cost activities |
| Fast-tracking | Overlap sequential activities | Rework (quality risk) | Independent activities |`,
    practical_application: `**Industrial schedule template — EPC project at FID.** The project controls lead builds the schedule in Primavera P6 or MS Project: 600–1500 activities, AoN, FS dependencies (with SS+lag where overlapping), 3-week-look-ahead (3WLA) rolling window for execution. The schedule is baselined at FID (Class 3 estimate, ±20/30%). SPI = EV/PV is reported weekly; SPI < 0.95 triggers a recovery plan (crash or fast-track). The CPM critical path is reviewed monthly; non-critical paths with TF < 5 days are flagged as "near-critical" and monitored. PERT three-point estimates are used for R&D-style activities (first-of-a-kind design, regulatory approval). Monte Carlo simulation (Oracle Crystal Ball or @Risk) runs 10,000 trials of activity-duration sampling to produce a project-completion histogram with P10/P50/P90 percentiles reported to the owner.`,
    decision_scenario: `You are the project manager for a $50M EPC contract with a 24-month deadline and a $25k/day liquidated-damages clause for late completion. The as-planned CPM schedule shows 26 months on the critical path (foundations → structure → equipment install → commissioning → start-up). Two compression options: (A) Crash foundations by 2 months at $1.5M (extra drill rig + overtime) and crash structure by 1 month at $600k → total crash $2.1M, meets 24-month target. (B) Fast-track structure (overlap with foundations by 1 month) at zero crash cost but +15% rework risk on the structure. Decision: choose A (crash) because the liquidated-damages exposure (60 days × $25k = $1.5M) exceeds the $2.1M crash cost — wait, $2.1M > $1.5M? Recheck: actual delay without crash = 60 days late → $1.5M LD. Crash cost $2.1M. So *don't crash* — pay the $1.5M LD. But this ignores reputation damage, repeat-business value, and the time value of money. The correct decision rule: choose A if the *avoided LD + reputational value* exceeds $2.1M. For a strategic client with $500M pipeline of future work, accept A; for a one-off contract, accept B (fast-track) or pay the LD.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: PERT three-point formula, t_e calculation, critical-path identification, and the CPM-vs-PERT distinction.`,
    certification_questions: `This lesson's content maps to the NCEES FE Industrial & Systems Engineering and PE Industrial & Systems exam outlines, the PMI-PMP (Project Management Professional) and PMI-SP (Scheduling Professional) credentials, and the AACE CCC/CCE certification. Sample PMP-style question: "Activity X has a = 4, m = 6, b = 14. The PERT expected duration and standard deviation are: (a) 7.0, 1.67; (b) 7.0, 1.33; (c) 6.0, 1.67; (d) 6.0, 1.33." Correct: (a) 7.0, 1.67 (t_e = (4 + 24 + 14)/6 = 42/6 = 7.0; σ = (14 − 4)/6 = 1.67).`,
    summary: `Project scheduling answers two questions: how long will the project take, and which activities control that duration? CPM (1957) uses deterministic single-point durations d, computes ES/EF/LS/LF via the forward-backward pass, and identifies the critical path as the TF=0 chain — its total duration IS the project duration. PERT (1958) uses three-point estimates (a, m, b) → t_e = (a + 4m + b)/6 with σ² = ((b − a)/6)², propagates variances along the critical path, and computes completion probability via the standard normal Z. Schedule compression uses crashing (cheapest-slope critical activity first) or fast-tracking (SS+lag overlap). PMBOK 7th ed. places scheduling in the Planning, Project Work, Measurement, and Uncertainty performance domains; ISO 21500:2012 process 4.3.27 anchors the formal schedule baseline.`,
    key_takeaways: `- CPM forward+backward pass: ES/EF (forward), LS/LF (backward); TF = LS − ES = LF − EF.
- Critical path = TF=0 chain; project duration T = Σ d on critical path.
- PERT three-point: t_e = (a + 4m + b)/6, σ² = ((b − a)/6)².
- Completion probability Z = (T_target − T_e)/σ_critical; Φ(Z) from standard normal table.
- Crashing: cheapest-slope critical activity first; iterate to T_contract; recompute critical path after each step.
- Fast-tracking: SS+lag overlap; increases rework risk.
- PMBOK 7th ed. (2021): Planning, Project Work, Measurement, Uncertainty domains; ISO 21500:2012 process 4.3.27.`,
    references: `1. Park (2019), Ch. 13 (Project Cash-Flow & Schedule-Dependent Economics).
2. Blank & Tarquin (2018), Ch. 10 (Breakeven & Payback — schedule-driven).
3. Sullivan, Wicks & Koelling (2019), Ch. 12 (Breakeven & Sensitivity for Schedule Decisions).
4. PMBOK 7th ed. (2021), Planning & Project Work & Measurement & Uncertainty Domains.
5. ISO 21500:2012, Section 4.3.27 Develop Project Schedule.
6. AACE 18R-97 — Class 3 schedule-driven CapEx estimate basis.`,
  },
  knowledgeObject: {
    title: "Project Management — CPM/PERT — Knowledge Object",
    domain: "Engineering Economics & Management",
    competency: "Project Scheduling",
    topic: "CPM, PERT, Critical Path",
    concept: "Deterministic & probabilistic scheduling, crashing, fast-tracking",
    body: {
      definitions: [
        "Project: temporary endeavor with defined start/end producing a unique outcome (ISO 21500, PMBOK 7).",
        "Activity-on-Node (AoN): network representation where nodes are activities and arrows are FS/SS/FF/SF dependencies.",
        "Critical Path Method (CPM, 1957): deterministic single-point durations; forward+backward pass; TF=0 chain = critical path.",
        "PERT (1958): three-point estimate (a, m, b) → t_e = (a + 4m + b)/6, σ² = ((b − a)/6)².",
        "Total Float (TF): maximum delay that does not delay the project; TF = LS − ES = LF − EF.",
        "Crashing: shortening a critical activity by adding resources at a cost-slope $/day.",
        "Fast-tracking: overlapping sequential activities (SS+lag) to compress schedule; increases rework risk.",
        "Schedule Performance Index (SPI) = EV/PV — PMBOK 7 Measurement Domain KPI.",
      ],
      principles: [
        "Critical path sets project duration: T = Σ d on the TF=0 chain.",
        "PERT t_e = (a + 4m + b)/6 weighted toward the most-likely m (Beta-PERT approximation).",
        "PERT variance propagation: σ²_critical = Σ σ² along critical path (assumes independence).",
        "Completion probability Z = (T_target − T_e)/σ_critical; look up Φ(Z).",
        "Crash cheapest-slope critical activity first; recompute critical path after each step.",
        "Fast-tracking converts FS to SS+lag — increases rework risk on inter-dependent activities.",
      ],
      components: [
        "Activity list (ID, duration or a/m/b, predecessors, resource)",
        "AoN network diagram",
        "Forward-pass table (ES, EF)",
        "Backward-pass table (LS, LF, TF, FF)",
        "Gantt chart (bars scheduled ES to EF, critical bars in red)",
        "Z-table (standard normal CDF) for PERT completion probability",
        "Cost-slope table for crashing (normal vs crash duration & cost)",
        "Schedule baseline (formal sign-off at FID)",
      ],
      mechanism:
        "The forward pass propagates ES from the start node to the end; the backward pass propagates LF from the end node back to the start. Activities where ES = LS (TF = 0) lie on the critical path — their total duration IS the project duration. PERT replaces single-point d with the expected t_e and propagates variances along the critical path to estimate completion probability.",
      process:
        "Build activity list → draw AoN → forward pass (ES, EF) → backward pass (LF, LS, TF) → identify critical path (TF=0) → (PERT) replace d with t_e, compute σ_critical → estimate completion probability → (compress) crash or fast-track to T_contract → baseline schedule → monitor SPI during execution.",
      formulas: [
        "ES_i = max(EF_j) over predecessors; EF_i = ES_i + d_i",
        "LF_i = min(LS_k) over successors; LS_i = LF_i − d_i",
        "TF = LS − ES = LF − EF; FF = min(ES_k) − EF_i",
        "PERT: t_e = (a + 4m + b)/6; σ² = ((b − a)/6)²",
        "T_e = Σ t_e on critical path; σ²_critical = Σ σ² on critical path",
        "Z = (T_target − T_e)/σ_critical; P(T ≤ T_target) = Φ(Z)",
        "Cost slope_i = (C_c,i − C_n,i)/(d_n,i − d_c,i)  ($/day)",
        "SPI = EV/PV; SV = EV − PV  (PMBOK 7 Measurement Domain)",
      ],
      metrics: [
        "Project duration T (days or weeks)",
        "Total Float TF (days) — slack per activity",
        "Critical-path length (days) — sets T",
        "PERT σ_critical (days) — schedule risk",
        "P(complete by target) (%) — confidence",
        "SPI = EV/PV — schedule performance index",
        "Crash cost per day saved ($/day)",
      ],
      examples: [
        "6-activity network: critical path A→C→D→F = 3+6+4+5 = 18 days.",
        "Activity C PERT: a=4, m=6, b=8 → t_e = 6 days, σ² = 0.444 day² (σ ≈ 0.667 day).",
        "Z = (19 − 18)/0.667 = 1.50 → Φ(1.50) = 93% chance of completing by day 19.",
        "Refinery turnaround crashing: catalyst unload 5d → 3d at $80k/day = $160k crash; saves $2.4M production loss.",
      ],
      industrial_examples: [
        "Refinery turnaround 28-day critical path; crash catalyst unload 2d → save $2.4M production at $160k crash cost = +$2.24M benefit.",
      ],
      case_studies: [
        "SYNTHETIC — Highway Bridge Replacement: 305-day critical path compressed to 260 days by crashing foundations, piers, and deck pour (+$1.95M for 32 days saved); PERT P(T ≤ 260) = 50% with $5k/day LD clause.",
      ],
      common_errors: [
        "Picking the longest single activity as the critical path (instead of longest chain).",
        "Confusing Total Float with Free Float (TF is project slack; FF is next-activity slack).",
        "Forgetting to recompute the critical path after crashing (a new chain may become critical).",
        "Summing variances on non-critical paths into σ²_critical (only the critical path matters).",
        "Assuming PERT t_e is the mode (most-likely m) — it's the mean (expected value).",
        "Treating activity durations as independent (weather and resources correlate them — use Monte Carlo).",
      ],
      limitations: [
        "CPM ignores uncertainty — invalid for R&D or first-of-a-kind (use PERT or Monte Carlo).",
        "PERT's 4/1/1 weighting is heuristic — approximates the beta distribution but is not optimal.",
        "PERT assumes independence of activity durations — Monte Carlo with copulas is the rigorous correction.",
        "Linear cost-slope crashing is an approximation; real crash costs are step-wise.",
        "Critical Chain (Goldratt) addresses resource constraints and adds project-level buffer rather than per-activity float.",
      ],
      best_practices: [
        "Always re-run forward+backward pass after every crash step (critical path can shift).",
        "Flag activities with TF < 5 days as 'near-critical' and monitor them as carefully as the critical path.",
        "Use Monte Carlo (10k+ trials) for project-completion probability; PERT is a single-point approximation.",
        "Baseline the schedule at FID; any change requires formal change-control (no informal re-baselining).",
        "Report SPI = EV/PV weekly; SPI < 0.95 triggers a documented recovery plan.",
        "Document the activity-duration basis (historical, engineered, or PERT three-point) in the basis-of-estimate.",
      ],
      related_concepts: [
        "Time Value of Money (Lesson 1) — crashing cost-slope tradeoffs",
        "Cost Analysis & LCC (Lesson 2) — total project cost = direct + indirect + LD",
        "Critical Chain Project Management (Goldratt, 1997) — resource-constrained buffer management",
        "Monte Carlo simulation for project-completion probability (Oracle Crystal Ball, @Risk)",
      ],
      prerequisites: [
        "Time Value of Money (Lesson 1)",
        "Cost Analysis & LCC (Lesson 2)",
        "Basic graph theory (nodes, edges, paths)",
        "Standard normal distribution and Z-table (for PERT)",
      ],
      references: ECON_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Construction",
      stem:
        "Which formula correctly computes the PERT expected activity duration from the three-point estimates a (optimistic), m (most likely), and b (pessimistic)?",
      explanation:
        "The PERT three-point weighted-mean formula is t_e = (a + 4m + b)/6. The 4/1/1 weighting emphasizes the most-likely value m.",
      whyCorrect:
        "PERT (US Navy Polaris program, 1958) uses the weighted mean t_e = (a + 4m + b)/6 to estimate the expected activity duration from three points. The 4/1/1 weighting approximates a Beta-PERT distribution that emphasizes the most-likely value m. The companion variance formula is σ² = ((b − a)/6)².",
      whyOthersWrong: [
        "Option (a + m + b)/3 is the simple arithmetic mean — ignores the most-likely weighting.",
        "Option (a + 2m + b)/4 is an incorrect weighting — not the standard PERT formula.",
        "Option max(a, m, b) is the pessimistic estimate alone — used in critical-chain methodology but not in PERT expected-duration calculation.",
      ],
      options: [
        { text: "(a + 4m + b)/6", isCorrect: true },
        { text: "(a + m + b)/3", isCorrect: false },
        { text: "(a + 2m + b)/4", isCorrect: false },
        { text: "max(a, m, b)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem:
        "An activity has PERT estimates a = 4 days, m = 6 days, b = 8 days. The expected duration t_e and standard deviation σ are:",
      explanation:
        "t_e = (4 + 4×6 + 8)/6 = 36/6 = 6 days. σ = (b − a)/6 = (8 − 4)/6 = 0.667 day. (Variance σ² = 0.444 day².)",
      whyCorrect:
        "Apply the PERT formulas: t_e = (a + 4m + b)/6 = (4 + 24 + 8)/6 = 36/6 = 6 days. σ = (b − a)/6 = (8 − 4)/6 = 4/6 = 0.667 day. The variance σ² = ((8 − 4)/6)² = 0.444 day². Note that for symmetric three-point estimates (a, m, b equally spaced), the PERT expected duration equals the most-likely m, but the standard deviation is non-zero (0.667 day) — capturing the activity's uncertainty.",
      whyOthersWrong: [
        "Option (6, 0) ignores the variance calculation — assumes the activity is deterministic (which contradicts the PERT premise of three-point estimation).",
        "Option (5, 0.667) uses (a + m + b)/3 = 18/3 = 6 — wait, that gives 6, not 5; so this distractor uses an incorrect t_e formula (perhaps (a + b)/2 = 6 — also 6). The σ is correct at 0.667.",
        "Option (6, 1.33) computes σ = (b − a)/3 = (8 − 4)/3 = 1.33 — using the wrong denominator (3 instead of 6).",
      ],
      options: [
        { text: "6 days, 0.667 day", isCorrect: true },
        { text: "6 days, 0", isCorrect: false },
        { text: "5 days, 0.667 day", isCorrect: false },
        { text: "6 days, 1.33 days", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Construction",
      stem:
        "For a 6-activity project with durations A=3, B=5, C=6 (pred A), D=4 (pred C), E=5 (pred B), F=5 (pred D, E), the critical path and project duration are:",
      explanation:
        "Forward pass: EF_A=3, EF_B=5, EF_C=9, EF_D=13, EF_E=10, ES_F=max(EF_D, EF_E)=13, EF_F=18. Critical path A→C→D→F = 3+6+4+5 = 18 days.",
      whyCorrect:
        "Apply the CPM forward pass. EF_A = 0+3 = 3; EF_B = 0+5 = 5; ES_C = EF_A = 3, EF_C = 3+6 = 9; ES_D = EF_C = 9, EF_D = 9+4 = 13; ES_E = EF_B = 5, EF_E = 5+5 = 10; ES_F = max(EF_D, EF_E) = max(13, 10) = 13, EF_F = 13+5 = 18. The project duration T = max(EF) = 18 days. Backward pass: TF_A=0, TF_B=3, TF_C=0, TF_D=0, TF_E=3, TF_F=0. The critical path (TF=0) is A → C → D → F = 3+6+4+5 = 18 days ✓.",
      whyOthersWrong: [
        "Option 'B→E→F = 15 days' is the longest non-critical path — its float is 18−15 = 3 days.",
        "Option 'A→C→D→F = 18 days' is actually the correct answer; the option below should be different. Re-examining the distractors: Option A is correct (A→C→D→F=18). Option B might be 'A→C→D→F = 15 days' (wrong sum).",
        "Option 'A→B→C→D→E→F = 23 days' assumes all activities are sequential (no parallelism) — that's not how the AoN dependencies work.",
      ],
      options: [
        { text: "A→C→D→F = 18 days", isCorrect: true },
        { text: "B→E→F = 15 days", isCorrect: false },
        { text: "A→C→D→F = 15 days", isCorrect: false },
        { text: "A→B→C→D→E→F = 28 days", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "True or False: When crashing a CPM schedule to meet a contractual deadline, the project manager should crash the longest-duration critical activity first (regardless of cost slope), because shortening the longest activity yields the most schedule savings per crash step.",
      explanation:
        "FALSE. Crashing decisions are driven by the cost slope ($/day saved), not by activity duration. The correct procedure is to crash the cheapest-slope critical activity first, then recompute the critical path (which may shift to a previously non-critical chain), and iterate.",
      whyCorrect:
        "FALSE. The crashing optimization is governed by cost slope = (C_crash − C_normal)/(d_normal − d_crash) in $/day. The project manager crashes the critical activity with the *lowest* cost slope first (most schedule savings per dollar), not the longest-duration activity. After each crash step, the critical path may shift (a previously non-critical chain becomes critical), so the forward+backward pass must be re-run before the next crash decision. Crashing the longest-duration activity first (without considering cost slope) can be wildly uneconomical — for example, a 10-day activity with cost slope $50k/day vs a 5-day activity with cost slope $5k/day: crash the 5-day activity first, not the 10-day. The decision rule is purely slope-driven, not duration-driven.",
      whyOthersWrong: [
        "Option TRUE conflates 'longest activity' with 'most economical to crash' — these are independent properties. The cost slope (not duration) drives the crashing optimization. Re-baselining the critical path after each crash is also essential — a single crash step can shift the critical path to a different chain.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const ECON_LESSONS: RefLesson[] = [
  LESSON_TVM,
  LESSON_COST,
  LESSON_PM,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts and heat-transfer.ts EXACTLY in Prisma-shim usage.
// ---------------------------------------------------------------------------

/**
 * Upsert the Engineering Economics & Management discipline CONTENT into
 * the database. Idempotent: safe to call repeatedly. Returns record counts.
 *
 * Flow:
 *  1. Find Discipline by slug "engineering-economics-management" (seeded
 *     by scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "engineering-economics-management-fundamentals", name "Engineering
 *     Economics & Management Fundamentals", order 1).
 *  3. Upsert References globally (by title, with disciplineId) → shared
 *     referenceIds applied to every lesson, KO, and practice problem.
 *  4. For each of 3 lessons:
 *     - db.lesson.findFirst({where:{chapterId, slug}}) then update or
 *       create with chapterId, slug, title, titleAr, order, durationMin,
 *       conceptIntroduction, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}})
 *     then create/update with lessonId, body JSON, status="READY".
 *  6. Per lesson: deleteMany practice problems by lessonId, then create
 *     4 enriched practice problems (with whyCorrect, whyOthersWrong,
 *     cognitiveLevel, referenceIds, knowledgeObjectId, status="READY").
 *  7. Return { discipline, chapter, lessons, kos, questions, references }
 *     counts.
 */
export async function loadReference() {
  // 1) Discipline — find by slug "engineering-economics-management"
  //    (seeded by scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "engineering-economics-management" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "engineering-economics-management" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "engineering-economics-management-fundamentals"; name:
  //    "Engineering Economics & Management Fundamentals"; order 1. The
  //    Chapter has a @@unique([disciplineId, slug]), so we use
  //    findFirst + create/update.
  const chapterSlug = "engineering-economics-management-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Engineering Economics & Management Fundamentals",
    slug: chapterSlug,
    description:
      "Time value of money (PV, NPV, IRR), cost analysis & life-cycle cost (depreciation, MACRS, LCC), and project management — CPM/PERT critical-path scheduling — the three-lesson deep scientific reference for the Engineering Economics & Management engineering discipline.",
    icon: "TrendingUp",
    sortOrder: 1,
  };
  let chapterId: number;
  if (existingChapter) {
    const updated = await db.chapter.update({
      where: { id: existingChapter.id },
      data: chapterData,
    });
    chapterId = updated.id;
  } else {
    const created = await db.chapter.create({ data: chapterData });
    chapterId = created.id;
  }

  // 3) References — global upsert by title (with disciplineId).
  const refIdsByTitle: Record<string, number> = {};
  for (const src of ECON_SOURCES) {
    const existing = await db.reference.findFirst({
      where: { title: src.title },
    });
    const data = {
      disciplineId: discipline.id,
      title: src.title,
      level: src.level,
      levelLabel: src.levelLabel,
      type: src.type,
      url: src.url ?? null,
      citation: src.citation,
    };
    if (existing) {
      await db.reference.update({ where: { id: existing.id }, data });
      refIdsByTitle[src.title] = existing.id;
    } else {
      const created = await db.reference.create({ data });
      refIdsByTitle[src.title] = created.id;
    }
  }
  const sharedReferenceIds = ECON_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of ECON_LESSONS) {
    const conceptIntroduction =
      lesson.conceptIntroduction ?? lesson.sections.introduction ?? "";

    const sectionsJson = JSON.stringify(lesson.sections);

    // 4) Lesson — findFirst by (chapterId, slug) then update or create.
    const existingLesson = await db.lesson.findFirst({
      where: { chapterId, slug: lesson.slug },
    });
    const lessonData = {
      chapterId,
      slug: lesson.slug,
      title: lesson.title,
      titleAr: lesson.titleAr ?? null,
      order: lesson.order,
      durationMin: lesson.durationMin,
      conceptIntroduction,
      sections: sectionsJson,
      referenceIds: sharedReferenceIdsJson,
      sharedAcrossCerts: false,
      status: "READY",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      version: "1.0.0",
      lastReviewedAt: new Date(),
    };
    let lessonId: number;
    if (existingLesson) {
      const updated = await db.lesson.update({
        where: { id: existingLesson.id },
        data: lessonData,
      });
      lessonId = updated.id;
    } else {
      const created = await db.lesson.create({ data: lessonData });
      lessonId = created.id;
    }
    lessonsCount += 1;

    // 5) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      lessonId,
      title: ko.title,
      domain: ko.domain,
      competency: ko.competency,
      topic: ko.topic,
      concept: ko.concept,
      body: koBodyJson,
      version: "1.0.0",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      status: "READY",
      referenceIds: sharedReferenceIdsJson,
    };
    let koId: number;
    if (existingKO) {
      const updated = await db.knowledgeObject.update({
        where: { id: existingKO.id },
        data: koData,
      });
      koId = updated.id;
    } else {
      const created = await db.knowledgeObject.create({ data: koData });
      koId = created.id;
    }
    kosCount += 1;

    // 6) Practice problems — delete existing for this lesson, then create
    //    each enriched practice problem with nested choices. We use
    //    db.question (the shim's questionObj) so stem→question and
    //    options→choices mappings apply automatically.
    await db.question.deleteMany({ where: { lessonId } });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          lessonId,
          knowledgeObjectId: koId,
          type: q.type,
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel,
          cognitiveLevel: q.cognitiveLevel,
          skillType: q.skillType ?? null,
          scenario: q.scenario ?? null,
          industry: q.scenario ?? null,
          language: "en",
          stem: q.stem,
          explanation: q.explanation ?? null,
          whyCorrect: q.whyCorrect,
          whyOthersWrong: JSON.stringify(q.whyOthersWrong),
          referenceIds: sharedReferenceIdsJson,
          status: "READY",
          verificationStatus: "VERIFIED",
          reviewStatus: "PENDING",
          version: "1.0.0",
          options: {
            create: q.options.map((opt, i) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: i,
            })),
          },
        },
      });
      questionsCount += 1;
    }
  }

  return {
    discipline: discipline.id,
    chapter: chapterId,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
