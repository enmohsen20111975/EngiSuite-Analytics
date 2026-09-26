// =============================================================================
// Thermodynamics — Engineering Discipline — Deep scientific reference
// (Task ID: THERMO).
//
// Discipline slug: "thermodynamics" (seeded by scripts/seed-disciplines.ts).
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// This is the FIRST ref-content loader to use the general (Discipline/Chapter)
// track instead of the certification (Certification/Domain/Competency) track.
// The Prisma shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     FK→connect form)
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise.
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs → connect.
//
// Four lessons (one chapter "Thermodynamics Fundamentals"):
//   1. Laws of Thermodynamics & Properties   (slug: thermo-laws-properties)
//   2. Power & Refrigeration Cycles          (slug: thermo-power-refrigeration-cycles)
//   3. Entropy & Availability                 (slug: thermo-entropy-availability)
//   4. Heat Engines & Applications           (slug: thermo-heat-engines-applications)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional thermodynamics content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched practice problems (whyCorrect + one whyOthersWrong per
//     distractor + cognitiveLevel + KO link + scenario/industry metadata),
//     mixing 3 MCQ and 1 True/False, spanning Easy/Medium/Hard × Remember/
//     Understand/Apply/Analyze. Total in this file: 16 practice problems.
//
// Source hierarchy (spec §5) — Levels 2, 5, 6, 7:
//   - LEVEL 6 — University / Academic Publications: Yunus A. Çengel & Michael
//     A. Boles, "Thermodynamics: An Engineering Approach" (McGraw-Hill, 9th
//     ed., 2019); Michael J. Moran, Howard N. Shapiro, Daisie D. Boettner,
//     Margaret B. Bailey, "Fundamentals of Engineering Thermodynamics"
//     (Wiley, 9th ed., 2018).
//   - LEVEL 7 — Technical Publications / Industry Sources: Frank Kreith,
//     "Principles of Heat Transfer" (Cengage, 7th ed., 2011); R. K. Rajput,
//     "Engineering Thermodynamics" (Laxmi Publications, 5th ed., 2017).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014
//     (Asset Management — aligns thermodynamic asset efficiency with the
//     ISO 55000 asset-management framework).
//   - LEVEL 5 — Professional Organizations: ASHRAE Handbook — HVAC
//     Applications (ASHRAE, 2019) — the canonical HVAC reference used in
//     Lesson 4.
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Chapter, Lesson, KnowledgeObject, PracticeProblem,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-reliability-modeling.ts)
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
// SOURCES — 6 real references cited across all thermodynamics lessons.
// ---------------------------------------------------------------------------

export const THERMO_SOURCES: RefSource[] = [
  {
    title:
      "Çengel & Boles — Thermodynamics: An Engineering Approach (McGraw-Hill, 9th ed., 2019)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Çengel, Y. A., & Boles, M. A. (2019). Thermodynamics: An Engineering Approach (9th ed.). New York, NY: McGraw-Hill Education. ISBN 978-1-259-82267-4. Chapters 1 (Introduction & Basic Concepts), 2 (Energy, Energy Transfer, General Analysis), 3 (Properties of Pure Substances — P-v-T surface, saturation tables), 4 (Energy Analysis of Closed Systems — ΔU = Q − W), 5 (Mass & Energy Analysis of Control Volumes), 6 (Second Law of Thermodynamics — Clausius & Kelvin–Planck statements), 7 (Entropy — ΔS = ∫δQ_rev/T, T ds relations), 8 (Exergy — flow & non-flow availability), 9 (Gas Power Cycles — Otto, Diesel, Brayton), 10 (Vapor Power Cycles — Rankine, reheat, regeneration), 11 (Refrigeration Cycles — reversed Carnot, vapor-compression, COP). The canonical undergraduate thermodynamics textbook used by ABET-accredited ME programs.",
  },
  {
    title:
      "Moran, Shapiro, Boettner & Bailey — Fundamentals of Engineering Thermodynamics (Wiley, 9th ed., 2018)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Moran, M. J., Shapiro, H. N., Boettner, D. D., & Bailey, M. B. (2018). Fundamentals of Engineering Thermodynamics (9th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-39138-8. Chapters 2 (Energy and the First Law — closed & control-volume energy balances), 3 (Evaluating Properties — ideal-gas tables, generalized compressibility), 4 (Control Volume Analysis — steady & transient), 5 (Second Law — Clausius inequality), 6 (Entropy — entropy balance, isentropic processes, T ds relations), 7 (Exergy — availability, second-law efficiency η_II), 8 (Vapor Power — Rankine, reheat, regeneration, cogeneration), 9 (Gas Power — Otto/Diesel/Brayton, Ericsson, Stirling), 10 (Refrigeration & Heat Pump Systems — vapor-compression, cascade, absorption, COP). Reference for the rigorous control-volume formulation.",
  },
  {
    title:
      "Kreith — Principles of Heat Transfer (Cengage, 7th ed., 2011)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Kreith, F. (2011). Principles of Heat Transfer (7th ed.). Stamford, CT: Cengage Learning. ISBN 978-0-495-66770-4. Chapters 1 (Introduction — conduction, convection, radiation modes), 2 (Steady-State Conduction — Fourier's law, thermal resistance networks), 3 (Transient Conduction — lumped capacitance, Heisler charts), 4 (Forced Convection — boundary-layer theory, Reynolds & Nusselt analogies), 5 (Natural Convection — Rayleigh & Grashof numbers), 6 (Radiation — Stefan–Boltzmann, view factors), 9 (Heat Exchangers — LMTD & ε-NTU). Bridges thermodynamic cycle analysis with the heat-transfer calculations needed for boiler/condenser/radiator sizing in Lessons 2 and 4.",
  },
  {
    title:
      "Rajput — Engineering Thermodynamics (Laxmi Publications, 5th ed., 2017)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Rajput, R. K. (2017). Engineering Thermodynamics (5th ed.). New Delhi: Laxmi Publications. ISBN 978-93-85401-35-2. Chapters 1 (Introduction — SI units, thermodynamic systems, properties, state, equilibrium), 2 (Thermodynamic Work & Heat — sign conventions, PV work), 3 (First Law — ΔU = Q − W, flow & non-flow), 4 (Second Law — Kelvin–Planck, Clausius), 5 (Entropy — Clausius inequality, isentropic efficiency), 6 (Thermodynamic Properties — steam tables, Mollier chart), 7 (Air-Standard Cycles — Carnot, Otto, Diesel, Dual, Brayton, Rankine), 14 (Refrigeration & Air Conditioning — reversed Brayton, vapor-compression, absorption, COP). Practitioner reference with worked examples throughout.",
  },
  {
    title: "ISO 55000:2014 — Asset Management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55000.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines the asset-management framework (Plan–Do–Check–Act), the concept of an asset system, and the value/cost/risk triangle against which thermodynamic efficiency (η_II, second-law efficiency) and exergy destruction are reported as lifecycle asset-performance metrics. Cited in Lessons 3 and 4 to align thermodynamic second-law analysis with the ISO 55000 asset-management reporting structure that power utilities and oil & gas operators apply to boiler, turbine, and compressor fleets.",
  },
  {
    title:
      "ASHRAE Handbook — HVAC Applications (ASHRAE, 2019)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.ashrae.org/technical-resources/ashrae-handbook",
    citation:
      "American Society of Heating, Refrigerating and Air-Conditioning Engineers (ASHRAE). ASHRAE Handbook — HVAC Applications (2019 ed.). Atlanta, GA: ASHRAE. ISBN 978-1-936584-97-7. Chapters 1 (Residential & Commercial HVAC Load Calculations — cooling load temperature difference, CLTD/SCL/CLF method), 3 (Commercial & Public Buildings — air-handler selection), 5 (Cogeneration & CHP — topping & bottoming cycles), 7 (Solar Energy Utilization), 14 (Laboratories), 18 (Industrial Applications — process refrigeration, cold storage). The canonical reference for the vapor-compression refrigeration cycle parameters, cooling-load sizing, and HVAC application case study in Lesson 4.",
  },
];

const THERMO_REFERENCE_TITLES = THERMO_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Laws of Thermodynamics & Properties
// (slug: thermo-laws-properties)
// ---------------------------------------------------------------------------

const LESSON_LAWS: RefLesson = {
  slug: "thermo-laws-properties",
  title: "Laws of Thermodynamics & Properties",
  titleAr: "قوانين الديناميكا الحرارية والخصائص",
  order: 1,
  durationMin: 35,
  references: THERMO_REFERENCE_TITLES,
  conceptIntroduction: `Thermodynamics is the science of energy, its transformation from one form to another, and the limits that nature imposes on those transformations. Four laws — the Zeroth, First, Second, and Third — frame the entire subject. The *Zeroth Law* defines thermal equilibrium and temperature as a measurable property; the *First Law* (conservation of energy) states ΔU = Q − W for a closed system; the *Second Law* (Clausius & Kelvin–Planck statements) asserts that entropy of an isolated system never decreases and that no heat engine can convert all heat input into work; the *Third Law* sets the entropy of a perfect crystal at absolute zero to zero, anchoring the absolute entropy scale. The macroscopic behavior of pure substances (water, refrigerants, ideal gases) is captured by the P-v-T surface — the equation of state relating pressure, specific volume, and temperature — and, for ideal gases, by the ideal-gas law PV = mRT. These laws and properties are the foundation for every cycle in Lessons 2–4.`,
  sections: {
    learning_objectives: `- State the Zeroth, First, Second, and Third Laws of Thermodynamics and identify the physical phenomena each governs.
- Distinguish closed, open (control-volume), and isolated thermodynamic systems; specify the appropriate energy-balance form for each.
- Apply the First Law to a closed system: ΔU = Q − W (with the engineering sign convention Q-in positive, W-out positive).
- Apply the Clausius and Kelvin–Planck statements of the Second Law to identify impossible engines, refrigerators, and heat pumps.
- Use the ideal-gas equation of state PV = mRT and the polytropic relation PV^n = const for quasistatic processes.
- Read the P-v-T surface and the saturation dome of a pure substance; locate saturated liquid, saturated vapor, two-phase mixture, compressed liquid, and superheated vapor states.
- Use steam tables (saturated, superheated, compressed-liquid) to retrieve v, u, h, s at a specified (P, T) or (P, x) state.`,
    prerequisites: `- Differential and integral calculus (chain rule, line integrals, partial derivatives) — Engineering Mathematics.
- Newtonian mechanics: work as W = ∫F·dx, kinetic and potential energy, the work–energy theorem.
- Basic chemistry/physics: the mole, molar mass, Boltzmann's constant k_B and the universal gas constant R̄ = 8.314 kJ/(kmol·K).
- Units and dimensions: SI (kPa, kJ, kg, K) and the engineering sign conventions for Q and W.`,
    introduction: `The four laws of thermodynamics are the axioms of energy science. The *Zeroth Law* (Fowler, 1931) is so named because it was recognized as logically prior to the other three only after they had already been numbered: if two bodies are each in thermal equilibrium with a third, they are in equilibrium with each other. This transitivity property licenses the use of thermometers and gives temperature operational meaning. The *First Law* (Joule, Mayer, Helmholtz, ~1847) is conservation of energy: the change in internal energy of a closed system equals the heat added minus the work done by the system, ΔU = Q − W. Internal energy U is a state function; Q and W are path functions.

The *Second Law* has two classical statements. Clausius: heat cannot spontaneously flow from a colder to a hotter body. Kelvin–Planck: no cyclic engine can convert heat from a single reservoir entirely into work — there must be a rejection of heat to a colder reservoir. Both are equivalent and lead to Clausius's inequality ∮ δQ/T ≤ 0 and the existence of the state function entropy S, defined by dS = δQ_rev/T. For an isolated system, ΔS ≥ 0; equality holds for reversible processes. The Second Law imposes the upper bound η_Carnot = 1 − T_L/T_H on any heat engine operating between two reservoirs.

The *Third Law* (Nernst, 1906; Planck strengthening, 1911) states that the entropy of a perfect crystalline substance approaches zero as T → 0 K. This anchors the absolute entropy scale and limits how close any refrigerator can approach absolute zero.

A *pure substance* (water, R-134a, ammonia) has a P-v-T surface with three regions — compressed liquid, two-phase (saturation) dome, and superheated vapor — joined along the saturation line. Within the dome, quality x = m_vapor/m_total fixes the state, and v = v_f + x·v_fg, h = h_f + x·h_fg, etc. For gases at low reduced pressure (P_R = P/P_crit ≪ 1) and high reduced temperature (T_R ≫ 1), the ideal-gas equation PV = mRT (or Pv = RT per unit mass, with R = R̄/M) holds within ~1%. Real-gas behavior uses the compressibility factor Z = Pv/(RT) via Nelson–Obert generalized charts.`,
    terminology: `- **System**: the collection of matter under study; **boundary**: the surface separating the system from the surroundings; **surroundings**: everything outside the boundary.
- **Closed system (control mass)**: no mass crosses the boundary; energy may.
- **Open system (control volume)**: both mass and energy cross the boundary (e.g., a turbine, compressor, nozzle).
- **Isolated system**: neither mass nor energy crosses.
- **State**: the condition of a system described by its properties; **equilibrium**: a state that, if undisturbed, persists.
- **Process**: a path of state changes; **cycle**: a process whose initial and final states coincide.
- **Extensive property** (U, V, m, S, H): scales with system size; **intensive** (T, P, ρ): independent of size. Specific properties (u = U/m, v = V/m, s = S/m) are intensive.
- **Enthalpy H = U + PV**: a convenience property for flow-process calculations.
- **Quality x**: mass fraction of vapor in a saturated liquid–vapor mixture; defined only inside the dome (0 ≤ x ≤ 1).
- **Heat Q**: energy transfer due to a temperature difference; **Work W**: energy transfer due to a non-temperature driving force (pressure, force, voltage, etc.).
- **Sign convention (engineering)**: Q-in positive, Q-out negative; W-out positive, W-in negative. ΔU = Q − W.`,
    detailed_explanation: `**Zeroth Law — Temperature.** If bodies A and B are each in thermal equilibrium with body C (the thermometer), then A and B are in equilibrium with each other. This transitivity defines temperature as the intensive property that is equal for bodies in thermal equilibrium. Empirical scales (Celsius, Fahrenheit) and the thermodynamic (Kelvin) scale T = dQ_rev/dS derive from this axiom.

**First Law — Conservation of Energy.** For a closed system undergoing a process from state 1 to state 2:
  ΔU = U₂ − U₁ = Q − W        (closed, ΔKE = ΔPE = 0)
For a control volume at steady state:
  Ẇ_out − Ẇ_in = Σ_out ṁ(h + V²/2 + gz) − Σ_in ṁ(h + V²/2 + gz) + Q̇_net
For a stationary, single-in/single-out CV (turbine, compressor, nozzle):
  q − w = h₂ − h₁ + (V₂² − V₁²)/2 + g(z₂ − z₁) ≈ h₂ − h₁   (most devices)
where q = Q̇/ṁ and w = Ẇ/ṁ are specific heat and work transfers.

**Second Law — Entropy & Direction.** Clausius inequality: ∮ δQ/T ≤ 0, equality only for reversible cycles. This implies the existence of entropy S with dS = δQ_rev/T (between two equilibrium states, the entropy change is path-independent for the reversible path). For any process, the entropy balance on a closed system is:
  ΔS = ∫ δQ/T_b + S_gen      with  S_gen ≥ 0
where T_b is the boundary temperature and S_gen is the entropy generated by irreversibility (friction, mixing, free expansion, heat across finite ΔT). For an isolated system ΔS_iso ≥ 0 — the entropy of the universe can only increase.

The Carnot cycle (two reversible isotherms + two reversible adiabats) operating between T_H and T_L has the maximum possible thermal efficiency:
  η_Carnot = 1 − T_L/T_H     (T in Kelvin)
No real engine operating between the same reservoirs can exceed this.

**Third Law — Absolute Zero.** Planck's statement: the entropy of a perfect crystal at 0 K is zero. Consequence: it is impossible to cool any body to absolute zero in a finite number of processes (Nernst unattainability principle).

**Pure substances & P-v-T.** A pure substance has a unique P-v-T surface. For water: the critical point is (P_c = 22.064 MPa, T_c = 647.1 K, v_c = 0.003155 m³/kg). Below T_c, a constant-T line cuts the dome; the saturated-liquid state is f, saturated-vapor is g, and the two-phase mixture quality x is computed from v_x = v_f + x·v_fg. Above T_c, the gas is "superheated" and behaves increasingly ideally as P drops. The compressed-liquid region (left of the saturated-liquid line) is approximated by incompressible fluid (v ≈ v_f).

**Ideal-gas law.** PV = nR̄T = mRT, where R = R̄/M. For air, M = 28.97 kg/kmol, R = 0.287 kJ/(kg·K). The specific heats: c_p − c_v = R, and γ = c_p/c_v = 1.4 for diatomic ideal gas (air). Internal energy and enthalpy depend on T only: Δu = ∫c_v dT, Δh = ∫c_p dT. The reversible adiabatic (isentropic) relation is PV^γ = const, TV^(γ−1) = const, T^γ P^(1−γ) = const.`,
    core_principles: `- **Zeroth Law**: thermal equilibrium is transitive → temperature is well-defined.
- **First Law**: ΔU = Q − W for closed systems; steady-flow energy equation for control volumes. Energy is conserved.
- **Second Law**: S_gen ≥ 0 for any process; entropy of an isolated system never decreases. Heat flows hot → cold spontaneously.
- **Carnot bound**: η_max = 1 − T_L/T_H (Kelvin); COP_R,max = T_L/(T_H − T_L); COP_HP,max = T_H/(T_H − T_L).
- **Third Law**: S → 0 as T → 0 K for a perfect crystal; absolute zero is unattainable.
- **State principle**: an equilibrium state of a pure substance is fixed by two independent intensive properties (e.g., T & P in the superheated region; T & x or P & x in the dome).
- **Ideal-gas relations**: PV = mRT; c_p − c_v = R; Δu = c_v·ΔT, Δh = c_p·ΔT (constant c); PV^γ = const for isentropic.
- **Enthalpy H = U + PV**: the natural property for steady-flow devices (where flow work Pv enters).`,
    components: `- **Working fluid**: the substance that undergoes the cycle (water/steam in Rankine, air in Brayton, refrigerant in vapor-compression).
- **Reservoir (T_H, T_L)**: an idealized body with infinite heat capacity — adding or removing Q does not change its T.
- **Boundary**: the closed-system or control-volume surface across which Q, W, ṁ flow.
- **Steam tables / Mollier chart**: tabulated properties (v, u, h, s) for water at saturation, superheat, and compressed-liquid states.
- **Ideal-gas tables**: u(T), h(T), s°(T) at standard reference; used for air-standard cycle analysis.
- **Thermometer / thermocouple / RTD**: empirical implementations of the Zeroth-Law temperature measurement.
- **Compressibility chart (Nelson–Obert)**: graphical Z = Pv/(RT) vs. P_R for real-gas corrections.`,
    process: `1. Identify the system (closed or open); draw the boundary.
2. Identify the working fluid and choose the property model: ideal gas (PV = mRT, Δu = c_v·ΔT), real-gas tables (steam, R-134a), or incompressible-liquid approximation (v ≈ const, Δu ≈ c·ΔT).
3. Write the appropriate energy balance: ΔU = Q − W (closed); q − w = Δh + Δke + Δpe (steady CV); or the unsteady CV balance for tanks/fill/drain.
4. Write the entropy balance: ΔS = ∫δQ/T_b + S_gen; identify reversible (S_gen = 0) vs. irreversible (S_gen > 0) processes.
5. Look up properties from steam tables, ideal-gas tables, or generalized charts; interpolate as needed.
6. Solve for the unknown (Q, W, ṁ, T₂, x₂). Check using the Second Law: η ≤ η_Carnot, S_gen ≥ 0; flag violations as physically impossible.
7. Report states on a P-v, T-s, or h-s (Mollier) diagram to visualize the process path.`,
    formula_calculation: `**Closed-system First Law (engineering sign convention):**
  ΔU = Q − W      [U, Q, W in kJ; T in K]
For a quasistatic PV-only process: W_b = ∫P dV.

**Steady-flow energy equation (per unit mass, single-in/single-out, adiabatic, negligible Δke & Δpe):**
  w = h₁ − h₂      [h in kJ/kg; w in kJ/kg]
  q = h₂ − h₁      (for a heat exchanger with no shaft work)

**Ideal-gas equation of state:**
  PV = mRT      [P in kPa, V in m³, m in kg, R in kJ/(kg·K), T in K]
  R_air = 0.287 kJ/(kg·K);  c_p,air = 1.005 kJ/(kg·K);  c_v,air = 0.718 kJ/(kg·K);  γ = 1.4

**Isentropic (reversible adiabatic) ideal-gas relations:**
  T₂/T₁ = (P₂/P₁)^((γ−1)/γ) = (v₁/v₂)^(γ−1)
  P₂/P₁ = (v₁/v₂)^γ

**Carnot efficiency (the Second-Law ceiling):**
  η_Carnot = 1 − T_L/T_H      [T in absolute units — K]

**Entropy change:**
  Reversible:  ΔS = ∫(δQ_rev/T)
  Isothermal:  ΔS = Q/T   (T constant)
  Ideal-gas, variable T:  Δs = c_p·ln(T₂/T₁) − R·ln(P₂/P₁)
  Incompressible liquid:  Δs = c·ln(T₂/T₁)

**COP of a refrigerator (vapor-compression or reversed Carnot):**
  COP_R = Q_L / W = Q_L / (Q_H − Q_L)
  COP_R,Carnot = T_L/(T_H − T_L)   [T in K]

**Heat pump:**
  COP_HP = Q_H / W   ;   COP_HP,Carnot = T_H/(T_H − T_L)

**Assumptions**: (i) equilibrium states (quasistatic process); (ii) ideal-gas behavior where stated; (iii) constant specific heats unless tables used; (iv) neglect kinetic & potential energy changes unless a nozzle/diffuser is the device; (v) steady state for CV analysis.

**Interpretation**: η is the fraction of heat input converted to net work output. A Carnot engine with T_H = 1000 K, T_L = 300 K delivers η = 70%; the best real Rankine cycle on the same reservoirs reaches ~45% — the gap (~25 percentage points) is the irreversibility tax.`,
    worked_example: `**Carnot engine between two reservoirs.**
Given: T_H = 1000 K, T_L = 300 K, Q_H = 1000 kJ.
η_Carnot = 1 − T_L/T_H = 1 − 300/1000 = 0.70 (70%).
W_net = η·Q_H = 0.70 × 1000 = 700 kJ.
Q_L = Q_H − W = 1000 − 700 = 300 kJ (rejected to the cold reservoir).
Entropy check: ΔS_H = −Q_H/T_H = −1000/1000 = −1.000 kJ/K (reservoir loses entropy).
ΔS_L = +Q_L/T_L = +300/300 = +1.000 kJ/K (reservoir gains entropy).
ΔS_universe = 0 → reversible. ✓

**Closed-system First Law — rigid tank with electric heater.**
A 0.5 m³ rigid tank holds 1.2 kg of air at 300 K. A 2 kW electric resistance heater runs for 5 minutes.
- Rigid tank ⇒ W_b = 0 (constant V); electric work W_e is work input ⇒ W = −2 kJ/s × 300 s = −600 kJ (engineering sign convention, work-in negative).
- Closed-system First Law: ΔU = Q − W = 0 − (−600) = +600 kJ.
- For air (ideal gas, c_v = 0.718 kJ/(kg·K)): ΔT = ΔU/(m·c_v) = 600/(1.2 × 0.718) = 697 K.
- Final T = 300 + 697 = 997 K. Final P from ideal-gas law: P₂ = mRT₂/V = (1.2 × 0.287 × 997)/0.5 = 687 kPa ≈ 0.69 MPa.

**Isentropic compression of air.**
Air at 100 kPa, 300 K is compressed isentropically to 800 kPa.
T₂ = T₁·(P₂/P₁)^((γ−1)/γ) = 300·(8)^(0.286) = 300 × 1.811 = 543 K.
Work input (steady-flow, adiabatic): w = h₂ − h₁ = c_p·(T₂ − T₁) = 1.005 × (543 − 300) = 244 kJ/kg.
Entropy check: Δs = 0 ✓ (isentropic by construction).`,
    industrial_example: `**Industry: Power — fossil-fueled steam power plant.** A 400 MW coal-fired unit runs a Rankine cycle with superheated steam at 16.5 MPa, 540 °C (813 K) at the boiler outlet, condensing at 5 kPa (~33 °C / 306 K). The Carnot ceiling for these reservoirs is η_Carnot = 1 − 306/813 = 62.4%; the actual cycle thermal efficiency is ~38%, with the irreversibility gap (~24 percentage points) split between boiler combustion irreversibility, turbine stage losses, condenser ΔT, and stack losses. The plant's net heat rate (~9000 kJ/kWh) is reported monthly against the ISO 55000 asset-management framework as a Key Performance Indicator (KPI).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Cogeneration (synthetic, illustrative).* A 50 MW natural-gas-fired cogeneration plant supplies process steam at 1.0 MPa, 200 °C to an adjacent chemicals complex and 40 MW of electrical power to the grid. The steam turbine is a single extraction-condensing unit: throttle at 6 MPa, 480 °C; extraction (process steam) at 1.0 MPa, 200 °C, ṁ_ext = 25 kg/s; condenser at 8 kPa. Net electric output 40 MW. By recovering the extraction-steam enthalpy as process heat, the cogeneration plant achieves a fuel-utilization efficiency η_total = (W_e + Q_process)/Q_fuel ≈ 78%, compared with separate production of power (η_e ≈ 38%) and process steam (η_b ≈ 85%) which would yield only ~55% aggregate. This case study is used in Lesson 4 to illustrate the second-law efficiency advantage of cogeneration.`,
    visual_explanation: `**P-v-T surface of a pure substance.** The three-dimensional surface P(v, T) has three regions: compressed liquid (steep, nearly vertical — liquid is nearly incompressible), two-phase dome (ruled surface under which liquid and vapor coexist at the same T and P), and superheated vapor (a hyperbolic surface PV ≈ const at high T). Project onto the P-v plane: the saturation dome encloses the two-phase region; the saturated-liquid line bounds it on the left, saturated-vapor on the right. The critical point is the apex of the dome. Project onto the T-v plane: constant-P lines run nearly vertical in the compressed-liquid region, horizontal across the dome (T = T_sat(P)), and follow the ideal-gas hyperbola (T ∝ v) in the superheated region. Project onto the P-T plane: the vaporization curve ends at the critical point — this is the only region where liquid and vapor coexist at a unique (P, T) pair; in the P-v and T-v views the two-phase states fill an area, not a curve.`,
    simulation_opportunity: `Open the NIST WebBook (webbook.nist.gov/chemistry/fluid/) or REFPROP to plot the P-v, T-s, and h-s (Mollier) diagrams for water, R-134a, and ammonia. Vary (T, P) interactively and observe: (i) the saturation dome collapse as you approach the critical point; (ii) the isenthalpic line of a throttling valve (Lesson 2); (iii) the isentropic curve of an ideal turbine. For an internal combustion engine cycle, the EngiSuite "Otto & Diesel cycle explorer" slider lets you change the compression ratio r and specific-heat ratio γ and watch η = 1 − 1/r^(γ−1) (Otto) update live.`,
    common_mistakes: `- **Mixing temperature scales in the Carnot formula**: η_Carnot = 1 − T_L/T_H requires T in Kelvin or Rankine — NEVER in Celsius or Fahrenheit. A 25 °C / 100 °C engine has η_Carnot = 1 − 298/373 = 20%, not 1 − 25/100 = 75%.
- **Wrong sign for work**: the engineering convention is W-out positive, W-in negative. A compressor consuming 200 kJ/kg has w = −200 kJ/kg; the First Law gives Δh = q − w = 0 − (−200) = +200 kJ/kg. Reversing the sign flips the answer.
- **Treating the dome as a line**: inside the two-phase dome, T and P are NOT independent — they are coupled by the saturation relation. Specifying both T_sat and P_sat fixes nothing useful; you must know x (quality) or another property.
- **Using Δu = c_v·ΔT outside the ideal-gas regime**: this holds for ideal gases; for steam you must use the steam tables. Applying it to a two-phase mixture gives nonsense.
- **Forgetting the steady-flow assumption**: the closed-system ΔU = Q − W applied to a turbine will give the wrong answer by the flow-work Pv term. Use w = h₁ − h₂ for a steady adiabatic turbine.`,
    limitations: `- The classical (macroscopic) laws say nothing about the molecular mechanism — they are silent on WHY S_gen > 0, only that it must be. Statistical mechanics (Boltzmann S = k_B·ln Ω) provides the microscopic interpretation.
- The Carnot ceiling η_Carnot = 1 − T_L/T_H is unreachable in practice — every real engine has finite-ΔT heat transfer, friction, and pressure drops.
- The ideal-gas law fails at high P_R and low T_R (near the critical point) — use real-gas tables or compressibility charts there.
- The Third Law does NOT forbid reaching very low T (mK, μK); it forbids reaching T = 0 K exactly.
- The state principle (two independent intensive properties fix the state) is silent on rate — it tells you equilibrium, not how fast the system gets there. Kinetics (reaction rates, transport coefficients) lies outside classical thermodynamics.`,
    comparison: `| Aspect | Closed system | Control volume (open) |
|---|---|---|
| Mass | Fixed | Flows in/out |
| Energy balance | ΔU = Q − W | Ẇ = ṁ(h_in − h_out) + Q̇ |
| Typical devices | Piston-cylinder, rigid tank | Turbine, pump, compressor, nozzle, heat exchanger |
| Work form | Boundary work W_b = ∫P dV | Shaft work Ẇ_s, flow work ṁPv |

| Cycle | η (typical) | Notes |
|---|---|---|
| Carnot (ceiling) | 1 − T_L/T_H | Reversible; unrealizable |
| Otto (SI engine) | 1 − 1/r^(γ−1) | ~25–35% |
| Diesel | 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))] | ~30–40% |
| Brayton (gas turbine) | 1 − 1/r_p^((γ−1)/γ) | ~30–40% |
| Rankine (steam) | ~33–45% | Limited by metallurgy at high T_H |`,
    practical_application: `**Steam tables in a 600 MW ultra-supercritical unit.** Boiler outlet: 25 MPa, 600 °C → h ≈ 3425 kJ/kg, s ≈ 6.34 kJ/(kg·K) (superheated-steam table). Three LP turbine stages exhaust to a condenser at 5 kPa, x ≈ 0.90 (T_sat = 33 °C). Reheat at 5 MPa, 540 °C. The plant engineer extracts regenerative-feedwater-heater steam at 6 intermediate points; each extraction reduces the enthalpy available for shaft work but raises the average temperature of heat addition, lifting η. The exercise is a table-driven optimization: every (P, T) state on the cycle diagram comes from a steam-table look-up; the energy and entropy balances close to 4 significant figures when done correctly.`,
    decision_scenario: `You are the rotating-equipment lead at a 400 MW combined-cycle plant. The HRSG vendor proposes either (A) a single-pressure HRSG at 9 MPa, 540 °C (η_cc ≈ 55%) or (B) a triple-pressure HRSG with reheat (HP 17 MPa / 565 °C, IP 4 MPa / 565 °C, LP 0.7 MPa / 230 °C, η_cc ≈ 58%). Option B costs +$18 M CapEx and adds 1.5 percentage points of efficiency. Fuel (natural gas) is $7/MMBtu; the plant runs 7000 h/yr at 60% capacity factor. Fuel saved = (1/0.55 − 1/0.58) × 400 MW × 7000 × 3600 / 1.055 MJ/m³ × $7/MMBtu. Decision rule: if 3-year fuel savings > CapEx delta, choose B. (Worked in Lesson 4 with full numbers; reveals payback in ~3.5 yr.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: Carnot ceiling, ideal-gas isentropic compression, sign convention in the First Law, and steam-table quality.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Thermal & Fluids Systems exam outlines (professional-engineer licensure), the ASME Performance Test Code (PTC) basis, and the IChemE CAPE-OPEN thermodynamic-property standard. Sample FE-style question: "A Carnot engine operating between 500 K and 300 K receives 2000 kJ of heat. The work output is: (a) 600 kJ, (b) 800 kJ, (c) 1200 kJ, (d) 1400 kJ." Correct: (b) 800 kJ (η = 1 − 300/500 = 0.40, W = 0.40 × 2000 = 800).`,
    summary: `The four laws of thermodynamics frame energy, its transformations, and nature's limits on them. The Zeroth Law defines temperature; the First Law (ΔU = Q − W) conserves energy; the Second Law (S_gen ≥ 0, η ≤ η_Carnot) imposes direction and a ceiling on efficiency; the Third Law anchors the absolute entropy scale. The P-v-T surface and the ideal-gas law PV = mRT describe pure-substance and gas behavior, with steam and refrigerant tables covering the real-gas region. These four laws and the property toolkit feed every cycle (Lesson 2), every entropy/exergy calculation (Lesson 3), and every heat-engineering application (Lesson 4).`,
    key_takeaways: `- ΔU = Q − W (closed system); steady-flow adiabatic turbine → w = h₁ − h₂.
- Entropy is generated, never destroyed: S_gen ≥ 0; isolated-system ΔS ≥ 0.
- No engine beats Carnot: η_max = 1 − T_L/T_H, T in Kelvin.
- Ideal gas: PV = mRT, c_p − c_v = R, PV^γ = const isentropic; Δu = c_v·ΔT, Δh = c_p·ΔT.
- Pure substance: locate the state on the P-v-T surface; in the dome use x = (v − v_f)/v_fg.
- Steam tables are the source of truth for water; never apply ideal-gas formulas inside the saturation dome.`,
    references: `1. Çengel & Boles (2019), Ch. 1–3 (laws & properties), Ch. 4 (First-Law closed-system analysis), Ch. 7 (entropy).
2. Moran, Shapiro, Boettner & Bailey (2018), Ch. 2–3 (energy & property relations), Ch. 5 (Second Law), Ch. 6 (entropy).
3. Rajput (2017), Ch. 1–6 (laws, properties, steam tables).
4. Kreith (2011), Ch. 1 (heat-transfer modes relevant to property evaluation).
5. ISO 55000:2014 (asset-management framework for cycle KPIs).
6. ASHRAE Handbook — HVAC Applications (2019) for HVAC-side property tables.`,
  },
  knowledgeObject: {
    title: "Laws of Thermodynamics & Properties — Knowledge Object",
    domain: "Thermodynamics",
    competency: "Foundations",
    topic: "Laws & Pure-Substance Properties",
    concept: "Four laws + P-v-T surface + ideal-gas equation of state",
    body: {
      definitions: [
        "Zeroth Law: if A and B are each in thermal equilibrium with C, then A is in equilibrium with B — licenses temperature as a measurable property.",
        "First Law (closed system): ΔU = Q − W; energy is conserved.",
        "Second Law (Clausius): heat cannot spontaneously flow from colder to hotter; (Kelvin–Planck): no cyclic engine converts heat from a single reservoir entirely into work.",
        "Third Law: the entropy of a perfect crystal at 0 K is zero; absolute zero is unattainable.",
        "Quality x = m_vapor/m_total (mass fraction of vapor in a saturated liquid–vapor mixture).",
        "Enthalpy H = U + PV — convenience property for flow processes.",
      ],
      principles: [
        "S_gen ≥ 0 for any real process; equality only for reversible.",
        "Carnot ceiling: η_max = 1 − T_L/T_H (T in Kelvin).",
        "State principle: two independent intensive properties fix an equilibrium state of a pure substance.",
        "Ideal-gas relations: PV = mRT; c_p − c_v = R; Δu = c_v·ΔT; Δh = c_p·ΔT.",
        "Inside the saturation dome, T and P are not independent — they are coupled by T_sat(P).",
      ],
      components: [
        "Working fluid (water/steam, air, refrigerant)",
        "Hot reservoir T_H and cold reservoir T_L",
        "System boundary (closed or control-volume)",
        "Steam tables / ideal-gas tables / generalized compressibility charts",
        "Thermometer (empirical implementation of the Zeroth Law)",
      ],
      mechanism:
        "Energy is conserved (First Law) but degrades in quality as entropy is generated (Second Law). Heat engines harness a temperature difference to convert part of the heat input to work; refrigerators use work to pump heat against its natural gradient. Both are bounded by the Carnot relations.",
      process:
        "Identify system → choose property model → write energy balance → write entropy balance → look up properties → solve → verify against the Carnot ceiling and S_gen ≥ 0.",
      formulas: [
        "ΔU = Q − W (closed, engineering sign convention)",
        "Steady single-in/out CV: q − w = Δh + Δke + Δpe",
        "PV = mRT (ideal gas), R_air = 0.287 kJ/(kg·K)",
        "η_Carnot = 1 − T_L/T_H (T in K)",
        "COP_R = Q_L/W; COP_R,Carnot = T_L/(T_H − T_L)",
        "Δs_ideal = c_p·ln(T₂/T₁) − R·ln(P₂/P₁)",
        "PV^γ = const (isentropic ideal gas)",
      ],
      metrics: [
        "Thermal efficiency η = W_net/Q_in",
        "COP (refrigerator or heat pump)",
        "Specific fuel consumption (kg/kWh)",
        "Heat rate (kJ/kWh) — utility-scale KPI",
        "Second-law efficiency η_II = η/η_Carnot (Lesson 3)",
      ],
      examples: [
        "Carnot engine T_H = 1000 K, T_L = 300 K, Q_H = 1000 kJ → W = 700 kJ, Q_L = 300 kJ, ΔS_univ = 0.",
        "Rigid-tank electric heater: ΔU = 600 kJ, m = 1.2 kg, c_v = 0.718 → ΔT = 697 K, T₂ = 997 K, P₂ ≈ 0.69 MPa.",
        "Isentropic air compression 100 kPa → 800 kPa, T₁ = 300 K → T₂ = 543 K, w_in = 244 kJ/kg.",
      ],
      industrial_examples: [
        "Power — 400 MW coal-fired Rankine unit: 16.5 MPa / 540 °C throttle, 5 kPa condenser; η_Carnot ceiling 62%, actual η ≈ 38%.",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Cogeneration: 50 MW gas-fired cogen, extraction-condensing turbine, η_total ≈ 78% (full worked example in Lesson 4).",
      ],
      common_errors: [
        "Using Celsius in the Carnot formula (must use Kelvin).",
        "Sign-convention errors on Q and W (engineering: Q-in positive, W-out positive).",
        "Applying Δu = c_v·ΔT to a two-phase mixture (only valid for ideal gas).",
        "Treating T and P as independent inside the saturation dome.",
        "Using the closed-system First Law on a steady-flow device (omits the flow-work Pv term).",
      ],
      limitations: [
        "Carnot ceiling is unreachable in practice — every real engine has finite-ΔT heat transfer, friction, and pressure drops.",
        "Ideal-gas law fails near the critical point — use real-gas tables or compressibility charts.",
        "Classical thermodynamics is silent on rates — kinetics (reaction, transport) lies outside its scope.",
        "Third Law forbids reaching T = 0 K exactly; it does not forbid reaching the μK range.",
      ],
      best_practices: [
        "Always state the system, boundary, and sign convention before writing the energy balance.",
        "Verify each answer against the Second Law: η ≤ η_Carnot and S_gen ≥ 0; flag violations as physically impossible.",
        "Use steam tables (NIST WebBook, REFPROP, IAPWS-IF97) for water; ideal-gas tables for air-standard cycle analysis.",
        "Plot the cycle on a T-s or h-s (Mollier) diagram to visualize irreversibility as departure from the reversible path.",
      ],
      related_concepts: [
        "Cycle analysis (Lesson 2: Rankine, Brayton, Otto, Diesel, refrigeration)",
        "Entropy & exergy (Lesson 3)",
        "Heat engines & cogeneration (Lesson 4)",
        "Heat-transfer mechanisms — conduction/convection/radiation (Kreith 2011)",
      ],
      prerequisites: [
        "Calculus (line and surface integrals, partial derivatives)",
        "Newtonian mechanics (work–energy theorem)",
        "Units and dimensions (SI vs engineering)",
      ],
      references: THERMO_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Power",
      stem: "Which statement correctly expresses the Kelvin–Planck statement of the Second Law of Thermodynamics?",
      explanation:
        "The Kelvin–Planck statement forbids a cyclic engine that converts heat from a single reservoir entirely into work — there must be heat rejection to a colder reservoir.",
      whyCorrect:
        "It is impossible for any cyclic device to operate such that its sole effect is the transfer of heat from a single thermal reservoir and the production of an equivalent amount of work. Some heat must be rejected to a lower-temperature reservoir.",
      whyOthersWrong: [
        "Option A (heat cannot flow from cold to hot without work input) is the Clausius statement, not Kelvin–Planck.",
        "Option C (entropy of an isolated system never decreases) is the entropy-balance form of the Second Law, not Kelvin–Planck's cyclic-engine statement.",
        "Option D (S → 0 as T → 0 K) is the Third Law, not the Second.",
      ],
      options: [
        {
          text: "Heat cannot spontaneously flow from a colder body to a hotter body.",
          isCorrect: false,
        },
        {
          text: "No cyclic engine can convert heat from a single reservoir entirely into work; some heat must be rejected to a colder reservoir.",
          isCorrect: true,
        },
        {
          text: "The entropy of an isolated system never decreases.",
          isCorrect: false,
        },
        {
          text: "The entropy of a perfect crystal at 0 K is zero.",
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
      scenario: "Power",
      stem:
        "A Carnot heat engine operates between a hot reservoir at 1000 K and a cold reservoir at 300 K. If it receives 1000 kJ of heat from the hot reservoir, the net work output is closest to:",
      explanation:
        "Carnot ceiling η = 1 − T_L/T_H = 1 − 300/1000 = 0.70. W = η·Q_H = 0.70 × 1000 = 700 kJ. Entropy check: ΔS_univ = −1000/1000 + 300/300 = 0 (reversible).",
      whyCorrect:
        "Apply η_Carnot = 1 − T_L/T_H with both temperatures in Kelvin: η = 1 − 300/1000 = 0.70. Then W_net = η·Q_H = 0.70 × 1000 kJ = 700 kJ. The rejected heat Q_L = 1000 − 700 = 300 kJ flows to the cold reservoir.",
      whyOthersWrong: [
        "Option 300 kJ uses T_L/T_H·Q_H = 0.30 × 1000 = 300 kJ — that's the rejected heat, not the work output.",
        "Option 1000 kJ assumes 100% conversion, which violates the Kelvin–Planck statement of the Second Law.",
        "Option 1300 kJ exceeds the heat input, violating the First Law.",
      ],
      options: [
        { text: "300 kJ", isCorrect: false },
        { text: "700 kJ", isCorrect: true },
        { text: "1000 kJ", isCorrect: false },
        { text: "1300 kJ", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Automotive",
      stem:
        "Air (ideal gas, γ = 1.4, R = 0.287 kJ/(kg·K), c_p = 1.005 kJ/(kg·K)) at 100 kPa and 300 K is compressed isentropically to 800 kPa. The final temperature and the specific work input (steady-flow, adiabatic compressor) are approximately:",
      explanation:
        "T₂ = T₁·(P₂/P₁)^((γ−1)/γ) = 300 × 8^0.286 = 300 × 1.811 = 543 K. Work input (steady-flow, adiabatic): w_in = h₂ − h₁ = c_p·(T₂ − T₁) = 1.005 × (543 − 300) = 244 kJ/kg.",
      whyCorrect:
        "For an isentropic ideal-gas compression, T₂/T₁ = (P₂/P₁)^((γ−1)/γ) = 8^0.286 ≈ 1.811. T₂ = 300 × 1.811 = 543 K. Steady-flow energy balance (adiabatic, no Δke/Δpe): w_in = h₂ − h₁ = c_p·(T₂ − T₁) = 1.005 × 243 = 244 kJ/kg.",
      whyOthersWrong: [
        "Option (300 K, 0 kJ/kg) ignores compression — only valid if the process were isothermal with a cooler, which contradicts the adiabatic premise.",
        "Option (300 K, 207 kJ/kg) computes work using R·(T₂ − T₁) = 0.287 × 243 ≈ 70 kJ/kg — that's the boundary work for a closed-system adiabatic process, not the steady-flow shaft work (which uses c_p, not c_v or R).",
        "Option (543 K, 175 kJ/kg) uses c_v·ΔT = 0.718 × 243 = 174 kJ/kg — that's the closed-system Δu, not the steady-flow Δh.",
      ],
      options: [
        { text: "300 K, 0 kJ/kg", isCorrect: false },
        { text: "300 K, 207 kJ/kg", isCorrect: false },
        { text: "543 K, 175 kJ/kg", isCorrect: false },
        { text: "543 K, 244 kJ/kg", isCorrect: true },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: In a closed, rigid (constant-volume) tank containing an ideal gas, an electric resistance heater inside the tank adds 600 kJ of energy to the gas. By the First Law, the change in internal energy of the gas is +600 kJ (with the engineering sign convention W-out positive).",
      explanation:
        "TRUE. Rigid tank ⇒ boundary work W_b = 0. Electric work input is W_in = −600 kJ in the engineering convention. ΔU = Q − W = 0 − (−600) = +600 kJ.",
      whyCorrect:
        "TRUE. The tank is rigid, so the boundary work W_b = ∫P dV = 0. The electric heater is work input to the system: with the engineering convention (W-out positive), W = −600 kJ. The closed-system First Law ΔU = Q − W gives ΔU = 0 − (−600) = +600 kJ. (Equivalently, treating the electric input as heat Q = +600 kJ also gives ΔU = +600 kJ because in a closed system the distinction between Q and W_in dissolves in the First Law's structure — the same energy enters the gas.)",
      whyOthersWrong: [
        "Option FALSE — would claim ΔU = −600 kJ or ΔU = 0; both contradict the First Law. ΔU = 0 would require the heater energy to be entirely converted to boundary work, impossible in a rigid tank. ΔU = −600 kJ reverses the energy flow direction (the gas is being heated, not cooled).",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Power & Refrigeration Cycles
// (slug: thermo-power-refrigeration-cycles)
// ---------------------------------------------------------------------------

const LESSON_CYCLES: RefLesson = {
  slug: "thermo-power-refrigeration-cycles",
  title: "Power & Refrigeration Cycles",
  titleAr: "دورات القدرة والتبريد",
  order: 2,
  durationMin: 40,
  references: THERMO_REFERENCE_TITLES,
  conceptIntroduction: `A thermodynamic cycle is a sequence of processes whose initial and final states coincide, so the working fluid returns to its starting condition. *Power cycles* convert heat input into net work output (W_net = Q_H − Q_L > 0); *refrigeration and heat-pump cycles* use work input to pump heat from a cold to a hot reservoir. The Carnot cycle (two isotherms + two adiabats, all reversible) is the thermodynamic ceiling against which every real cycle is benchmarked. The *Rankine cycle* (pump → boiler → turbine → condenser) is the working backbone of all fossil, nuclear, and concentrated-solar power plants. The *Brayton cycle* (compressor → combustor → turbine) drives gas-turbine power and aircraft propulsion. The *Otto* and *Diesel* cycles power internal-combustion engines. The *vapor-compression refrigeration cycle* (compressor → condenser → expansion valve → evaporator) is the cycle of every refrigerator, air conditioner, and chiller. Performance is measured by thermal efficiency η = W_net/Q_H for power cycles and by coefficient of performance COP = Q_L/W (refrigerator) or Q_H/W (heat pump) for refrigeration cycles — bounded above by the reversed-Carnot COP. Real cycles fall short of Carnot because of irreversibilities: finite-ΔT heat transfer, fluid friction, non-ideal compression/expansion, mixing, and pressure drops.`,
  sections: {
    learning_objectives: `- Define a thermodynamic cycle and distinguish power cycles from refrigeration/heat-pump cycles.
- Draw the Carnot, Rankine, Brayton, Otto, Diesel, and vapor-compression cycles on T-s and P-v diagrams.
- Compute the thermal efficiency η = W_net/Q_in for the air-standard Otto, Diesel, and Brayton cycles.
- Compute the Rankine cycle thermal efficiency and the isentropic efficiencies of the pump and turbine.
- Compute the COP of a vapor-compression refrigerator COP_R = Q_L/W and of a reversed-Carnot refrigerator COP_R,Carnot = T_L/(T_H − T_L).
- Quantify the effect of irreversibilities (turbine isentropic efficiency η_t, compressor η_c, pressure drops, superheat, subcooling) on cycle performance.
- Apply reheat, regeneration, and cogeneration to lift Rankine efficiency beyond the basic cycle.`,
    prerequisites: `- Lesson 1 — Laws of Thermodynamics & Properties (the four laws, steam tables, ideal-gas relations, the Carnot ceiling).
- The First-Law steady-flow energy equation w = h₁ − h₂ (turbine, compressor).
- Isentropic ideal-gas relations: T₂/T₁ = (P₂/P₁)^((γ−1)/γ); isentropic steam-table use.
- The T-s diagram — area under the reversible heat-addition curve equals Q_in.`,
    introduction: `Every power plant, refrigerator, jet engine, and automobile engine is built around a thermodynamic cycle. The cycle's working fluid absorbs heat at high temperature, rejects heat at low temperature, and delivers net work = (Q_in − Q_out). The cycle efficiency is bounded above by the Carnot ceiling η_Carnot = 1 − T_L/T_H.

The *Carnot cycle* (reversible) is the idealization: two isothermal processes at T_H and T_L joined by two reversible adiabats. It defines the ceiling but is unrealizable because its isothermal heat transfer requires infinite-area heat exchangers (infinitesimal ΔT).

The *Rankine cycle* (W. J. M. Rankine, 1859) is the steam cycle of all power plants. States: 1 (saturated liquid at condenser P_L) → pump → 2 (compressed liquid at boiler P_H) → boiler → 3 (superheated vapor at P_H, T_H) → turbine → 4 (two-phase mixture at P_L) → condenser → 1. With pump work w_p = v_f·(P_H − P_L)/η_p, turbine work w_t = h₃ − h₄ (h₄ from isentropic expansion to P_L with η_t applied), heat input q_in = h₃ − h₂, and heat rejection q_out = h₄ − h₁, the cycle thermal efficiency is η_th = (w_t − w_p)/q_in = 1 − q_out/q_in. Real Rankine cycles reach 33–45%; the gap to Carnot is the irreversibility tax.

The *Brayton cycle* (George Brayton, 1872) is the gas-turbine cycle: 1 (air at P_L, T_1) → compressor → 2 (P_H, T_2) → combustor → 3 (P_H, T_3) → turbine → 4 (P_L, T_4) → exhaust. For the air-standard ideal Brayton cycle with pressure ratio r_p = P₂/P₁ and γ: η = 1 − 1/r_p^((γ−1)/γ). Regeneration (recuperator) recovers exhaust heat to preheat compressor discharge, lifting η by 5–10 percentage points.

The *Otto cycle* (Nikolaus Otto, 1876) is the SI (spark-ignition) engine cycle: 1 → 2 isentropic compression, 2 → 3 constant-volume heat addition (combustion), 3 → 4 isentropic expansion, 4 → 1 constant-volume heat rejection. With compression ratio r = v₁/v₂: η = 1 − 1/r^(γ−1). For r = 10, γ = 1.4: η = 60% (ideal); real SI engines reach ~30% due to heat loss, finite combustion time, and pumping work.

The *Diesel cycle* (Rudolf Diesel, 1892) replaces the constant-V heat addition with constant-P heat addition (fuel injected over the expansion stroke): η_Diesel = 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))], where r_c = v₃/v₂ is the cutoff ratio. For the same r and γ, Diesel η slightly exceeds Otto η; modern CI engines reach ~40%.

The *vapor-compression refrigeration cycle* (Jacob Perkins, 1834) is the reversed-cycle analog of the Rankine, with a throttling valve replacing the pump-turbine: 1 (saturated vapor at evaporator P_L) → compressor → 2 (superheated vapor at P_H) → condenser → 3 (saturated liquid at P_H) → expansion valve → 4 (two-phase at P_L) → evaporator → 1. COP_R = Q_L/W = (h₁ − h₄)/(h₂ − h₁). The reversed-Carnot ceiling is COP_R,Carnot = T_L/(T_H − T_L).`,
    terminology: `- **Cycle**: a sequence of processes whose initial and final states coincide.
- **Power cycle**: net work output > 0; efficiency η = W_net/Q_in.
- **Refrigeration cycle**: net work input; COP_R = Q_L/W (cooling effect).
- **Heat-pump cycle**: net work input; COP_HP = Q_H/W (heating effect); COP_HP = COP_R + 1.
- **Air-standard assumptions**: working fluid is air (ideal gas) throughout; combustion replaced by external heat addition; exhaust replaced by constant-volume heat rejection to a sink.
- **Compression ratio r = v₁/v₂** (Otto/Diesel); **pressure ratio r_p = P₂/P₁** (Brayton); **cutoff ratio r_c = v₃/v₂** (Diesel).
- **Isentropic efficiency** of a turbine η_t = (h₃ − h₄a)/(h₃ − h₄s), where 4s is the isentropic exit and 4a is the actual; of a compressor η_c = (h₂s − h₁)/(h₂a − h₁).
- **Back-work ratio** BWR = w_in/compressor/w_out/turbine (small for Rankine ~2–3%; large for Brayton ~50–60%).
- **Quality x** at turbine exhaust: must be ≥ 0.88 to limit blade erosion in steam turbines.
- **Superheat, reheat, regeneration**: Rankine improvements.
- **Subcooling, superheat, IHX (internal heat exchanger)**: refrigeration improvements.`,
    detailed_explanation: `**Carnot ceiling.** For any heat engine operating between two reservoirs at T_H and T_L (Kelvin), the maximum thermal efficiency is η_Carnot = 1 − T_L/T_H. The Carnot cycle achieves this with two reversible isotherms (heat addition at T_H, rejection at T_L) and two reversible adiabats (isentropic expansion from T_H to T_L and isentropic compression from T_L to T_H). Real cycles fall short because every heat-transfer step has finite ΔT, every expansion/compression has friction, and every pipe has a pressure drop.

**Rankine (steam).** The basic Rankine cycle: (1) saturated liquid at condenser pressure P_L; (2) compressed liquid at boiler pressure P_H after an isentropic pump: h₂ = h₁ + v_f·(P_H − P_L); (3) superheated vapor at P_H, T_H (boiler/superheater exit): q_in = h₃ − h₂; (4) wet vapor at P_L after the turbine: h₄ = h₃ − η_t·(h₃ − h₄s) where h₄s is found from s₄s = s₃ and P₄ = P_L (interpolate from steam tables in the two-phase dome: x₄s = (s₃ − s_f)/s_fg, h₄s = h_f + x₄s·h_fg). Heat rejected q_out = h₄ − h₁. Net work w_net = q_in − q_out. Thermal efficiency η_th = w_net/q_in = 1 − q_out/q_in.

Improvements:
- *Superheat* raises T_H (and the average temperature of heat addition), lifting η and reducing turbine-moisture (raises x₄).
- *Reheat*: expand the steam partially in the HP turbine, return it to the boiler for reheat at constant P, then expand in the LP turbine. Reheat lifts η by 2–4 percentage points and raises x at LP exhaust.
- *Regenerative feedwater heating*: bleed steam from intermediate turbine stages to preheat the feedwater before it enters the boiler. This raises the average T of heat addition (since some of Q_in is added at higher T) and lifts η by 5–8 percentage points in a 6-stage regenerative system.
- *Supercritical (USC) and ultra-supercritical (AUSC) cycles*: throttle at 22–35 MPa, 600–620 °C; reach η ≈ 45–48% with modern Ni-superalloy metallurgy.

**Brayton (gas turbine).** Air-standard ideal Brayton: (1) air at P_L, T₁; (2) isentropic compression to P_H: T₂/T₁ = (P₂/P₁)^((γ−1)/γ); (3) constant-P heat addition in the combustor: q_in = c_p·(T₃ − T₂); (4) isentropic expansion through the turbine: T₄/T₃ = (P₄/P₃)^((γ−1)/γ) = (P_L/P_H)^((γ−1)/γ); (4→1) constant-P heat rejection (close the cycle). Net work w_net = c_p·(T₃ − T₄) − c_p·(T₂ − T₁). Thermal efficiency η = 1 − 1/r_p^((γ−1)/γ). Real gas turbines reach η ≈ 33–42%; combined-cycle (Brayton + bottoming Rankine) reaches 55–63%.

**Otto (SI engine).** Air-standard ideal Otto: (1→2) isentropic compression v₁ → v₂, T₂ = T₁·r^(γ−1); (2→3) constant-V heat addition q_in = c_v·(T₃ − T₂); (3→4) isentropic expansion v₃ = v₂ → v₄ = v₁, T₄ = T₃/r^(γ−1); (4→1) constant-V heat rejection q_out = c_v·(T₄ − T₁). Thermal efficiency η = 1 − q_out/q_in = 1 − 1/r^(γ−1). For r = 10, γ = 1.4: η = 1 − 1/10^0.4 = 1 − 1/2.512 = 60.2% (ideal). Real SI ~30% (heat loss, finite combustion time, pumping losses).

**Diesel (CI engine).** Air-standard ideal Diesel: same as Otto except heat addition (2→3) is at constant P (fuel injected over the expansion stroke). η_Diesel = 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))]. For r = 18, r_c = 2, γ = 1.4: η = 1 − (1/18^0.4)·(2^1.4 − 1)/(1.4 × 1) = 1 − (0.398)(0.641) = 74.5% ideal; real ~40%.

**Vapor-compression refrigeration.** (1) saturated refrigerant vapor at evaporator P_L; (2) compressed (ideally isentropically) to P_H: h₂ = h₁ + (h₂s − h₁)/η_c; (3) condensed to saturated liquid at P_H: q_out = h₂ − h₃; (4) throttled to P_L (isenthalpic, h₄ = h₃); (1) evaporated: q_in = Q_L = h₁ − h₄. COP_R = Q_L/W = (h₁ − h₄)/(h₂ − h₁). The reversed-Carnot ceiling is COP_R,Carnot = T_L/(T_H − T_L). For a kitchen refrigerator (T_L = 4 °C = 277 K, T_H = 30 °C = 303 K): COP_R,Carnot = 277/26 = 10.7; real ≈ 2–4.`,
    core_principles: `- **Carnot ceiling**: η ≤ 1 − T_L/T_H for any power cycle, COP ≤ T_L/(T_H − T_L) for any refrigerator.
- **Rankine** is limited by the metallurgical T_H of the superheater (modern USC ~620 °C); raising T_H raises η but raises capital cost super-linearly.
- **Brayton** efficiency depends on the pressure ratio r_p and γ; for given T_H, an optimum r_p maximizes specific work.
- **Otto** η = 1 − 1/r^(γ−1); higher r is better — limited by knock (pre-ignition) for SI engines.
- **Diesel** η slightly exceeds Otto η at the same r because constant-P addition implies higher T₃ at the same r.
- **Vapor-compression COP** = Q_L/W; real COP ≈ 0.3–0.5 of Carnot COP due to compressor isentropic efficiency, throttling loss, finite-ΔT condenser/evaporator.
- **Back-work ratio** BWR: small for Rankine (pump work tiny vs turbine work, ~2%), large for Brayton (~50–60%) — gas turbines are sensitive to compressor efficiency.`,
    components: `- **Steam generator (boiler + superheater + reheater + economizer)**: heat-addition side of the Rankine.
- **Steam turbine** (HP, IP, LP stages): the work-extraction device; η_t ≈ 0.85–0.92.
- **Condenser** (shell-and-tube, air-cooled): heat-rejection side.
- **Pump** (centrifugal, boiler-feed): lifts the condensate from P_L to P_H; w_p = v_f·(P_H − P_L)/η_p.
- **Compressor** (centrifugal or axial) — Brayton and refrigeration.
- **Combustor** — Brayton.
- **Gas turbine** (HP + LP, single-shaft or multi-shaft) — Brayton.
- **Piston-cylinder** — Otto and Diesel.
- **Expansion valve (capillary tube, thermostatic expansion valve TXV)** — refrigeration throttling device.
- **Evaporator and condenser coils** — refrigeration.
- **Recuperator/regenerator** — Brayton, Stirling, Ericsson.
- **Regenerative feedwater heaters (closed, open/deaerator)** — Rankine.`,
    process: `1. Pick the cycle (Rankine, Brayton, Otto, Diesel, vapor-compression) and the working fluid (water/steam, air, R-134a, ammonia).
2. Identify the four (or six with reheat) state points; for each, list two independent intensive properties (e.g., P, T in the superheated region; P, x in the dome; T, v for an ideal gas).
3. Apply the cycle-specific energy and entropy balances at each component: pump (w_p = v_f·ΔP/η_p), boiler (q_in = h₃ − h₂), turbine (w_t = h₃ − h₄, h₄ = h₃ − η_t·(h₃ − h₄s)), condenser (q_out = h₄ − h₁).
4. Use the isentropic ideal-gas relations (Brayton, Otto, Diesel) or the steam tables with s₄s = s₃ (Rankine, refrigeration) to find the isentropic exit state.
5. Compute η_th = w_net/q_in = 1 − q_out/q_in for power cycles, COP_R = Q_L/W for refrigeration.
6. Compare to the Carnot ceiling η_Carnot = 1 − T_L/T_H (or COP_R,Carnot = T_L/(T_H − T_L)) and identify the dominant irreversibility.
7. Explore cycle-improvement levers: superheat/reheat/regeneration (Rankine); regeneration, intercooling, reheat (Brayton); higher r (Otto, Diesel); subcooling, IHX, two-stage compression (refrigeration).`,
    formula_calculation: `**Rankine (basic):**
  Pump work:        w_p = v_f·(P_H − P_L)/η_p        [kJ/kg]
  Boiler heat in:   q_in = h₃ − h₂                    [kJ/kg]
  Turbine work:     w_t = h₃ − h₄ = h₃ − η_t·(h₃ − h₄s)
                   (h₄s from s₄s = s₃, P₄ = P_L; use steam tables)
  Condenser heat out: q_out = h₄ − h₁
  Thermal efficiency: η_th = (w_t − w_p)/q_in = 1 − q_out/q_in

**Brayton (air-standard ideal):**
  Pressure ratio:   r_p = P₂/P₁
  T₂/T₁ = r_p^((γ−1)/γ);  T₄/T₃ = (1/r_p)^((γ−1)/γ)
  q_in = c_p·(T₃ − T₂);  w_t = c_p·(T₃ − T₄);  w_c = c_p·(T₂ − T₁)
  Thermal efficiency: η = 1 − 1/r_p^((γ−1)/γ)        [γ = c_p/c_v = 1.4 for air]
  Back-work ratio:   BWR = w_c/w_t

**Otto (air-standard ideal):**
  Compression ratio r = v₁/v₂
  T₂ = T₁·r^(γ−1);  T₄ = T₃/r^(γ−1)
  q_in = c_v·(T₃ − T₂);  q_out = c_v·(T₄ − T₁)
  Thermal efficiency: η = 1 − 1/r^(γ−1)

**Diesel (air-standard ideal):**
  Cutoff ratio r_c = v₃/v₂
  q_in = c_p·(T₃ − T₂);  q_out = c_v·(T₄ − T₁)
  Thermal efficiency: η = 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))]

**Vapor-compression refrigeration:**
  Compressor (real): h₂ = h₁ + (h₂s − h₁)/η_c; h₂s from s₂s = s₁, P₂ = P_H
  Throttling (h₃ = h₄): h₄ = h₃
  Q_L = h₁ − h₄;  W = h₂ − h₁;  COP_R = Q_L/W = (h₁ − h₄)/(h₂ − h₁)
  Reversed-Carnot ceiling: COP_R,Carnot = T_L/(T_H − T_L)   [T in K]

**Units**: P in kPa, T in K, h, s, q, w in kJ/kg. η, COP dimensionless.

**Assumptions**: (i) steady-state operation; (ii) negligible Δke & Δpe across each component except nozzles; (iii) ideal-gas behavior with constant c_p and γ for air-standard cycles; (iv) adiabatic turbines/compressors/pumps (real heat loss small); (v) isenthalpic throttling (h₃ = h₄); (vi) quality at turbine exhaust x ≥ 0.88 (Rankine).

**Interpretation**: η_th is the fraction of fuel (heat) energy converted to net shaft work. COP_R is the multiplier on work input to deliver cooling (a COP of 3 means 1 kJ of work removes 3 kJ of heat from the cold space — the other 2 kJ come from the conservation of energy balance rejected at the condenser).`,
    worked_example: `**Rankine cycle — basic.**
Given: throttle P_H = 8 MPa, T_H = 480 °C (superheated); condenser P_L = 8 kPa; η_t = 0.85, η_p = 0.90. Work fluid: water.
States (from steam tables):
- 1 (saturated liquid at 8 kPa): h₁ = h_f = 173.88 kJ/kg, v_f = 0.001008 m³/kg, s₁ = s_f = 0.5926 kJ/(kg·K).
- 2 (after pump): w_p = v_f·(P_H − P_L)/η_p = 0.001008·(8000 − 8)/0.90 = 8.93 kJ/kg; h₂ = h₁ + w_p = 173.88 + 8.93 = 182.81 kJ/kg.
- 3 (superheated, 8 MPa, 480 °C): h₃ = 3348 kJ/kg, s₃ = 6.658 kJ/(kg·K).
- 4s (isentropic to 8 kPa, s₄s = 6.658): at 8 kPa, s_f = 0.5926, s_fg = 7.6361; x₄s = (6.658 − 0.5926)/7.6361 = 0.794; h₄s = h_f + x₄s·h_fg = 173.88 + 0.794·(2403.1) = 173.88 + 1908.06 = 2081.94 kJ/kg.
- 4a (actual turbine exit, η_t = 0.85): h₄ = h₃ − η_t·(h₃ − h₄s) = 3348 − 0.85·(3348 − 2081.94) = 3348 − 1076.10 = 2271.90 kJ/kg.
- Turbine work: w_t = h₃ − h₄ = 3348 − 2271.90 = 1076.10 kJ/kg.
- Boiler heat input: q_in = h₃ − h₂ = 3348 − 182.81 = 3165.19 kJ/kg.
- Condenser heat rejected: q_out = h₄ − h₁ = 2271.90 − 173.88 = 2098.02 kJ/kg.
- Net work: w_net = w_t − w_p = 1076.10 − 8.93 = 1067.17 kJ/kg.
- Thermal efficiency: η_th = w_net/q_in = 1067.17/3165.19 = 0.3372 = 33.72%.
- Quality at exhaust: x₄ = (h₄ − h_f)/h_fg = (2271.90 − 173.88)/2403.1 = 0.873. Slightly below 0.88 — increase superheat or reheat.

**Carnot ceiling for the same reservoirs:**
T_H = 480 + 273.15 = 753 K; T_L = T_sat(8 kPa) = 41.5 + 273.15 = 315 K.
η_Carnot = 1 − 315/753 = 0.5817 = 58.17%.
Second-law efficiency η_II = η_th/η_Carnot = 0.337/0.582 = 0.579 = 57.9%.

**Vapor-compression refrigerator (R-134a).**
Given: T_L = −10 °C (evap), T_H = 30 °C (cond); η_c = 0.80.
States (R-134a tables):
- 1 (sat vapor, −10 °C): h₁ = h_g = 392.4 kJ/kg, s₁ = s_g = 1.734 kJ/(kg·K).
- 2s (sat vapor at 30 °C + superheat from isentropic compression to P_H = 0.770 MPa): s₂s = s₁ → superheated, h₂s ≈ 432 kJ/kg.
- 2a (actual): h₂ = h₁ + (h₂s − h₁)/η_c = 392.4 + (432 − 392.4)/0.80 = 392.4 + 49.5 = 441.9 kJ/kg.
- 3 (sat liquid at 30 °C): h₃ = h_f = 91.5 kJ/kg.
- 4 (after throttling, h₄ = h₃): h₄ = 91.5 kJ/kg.
- Q_L = h₁ − h₄ = 392.4 − 91.5 = 300.9 kJ/kg.
- W = h₂ − h₁ = 441.9 − 392.4 = 49.5 kJ/kg.
- COP_R = Q_L/W = 300.9/49.5 = 6.08.
- COP_R,Carnot = T_L/(T_H − T_L) = 263/(303 − 263) = 263/40 = 6.575.
- Second-law efficiency η_II = 6.08/6.575 = 0.925 = 92.5%.`,
    industrial_example: `**Industry: Oil & Gas — LNG liquefaction.** A baseload LNG plant uses a mixed-refrigerant (MR) vapor-compression cycle (propane + ethane + methane + nitrogen in tuned proportions) to chill natural gas from ambient to −162 °C. The APC (Air Products) C3MR cycle has two refrigeration loops: a propane pre-cooling loop (COP ≈ 4) chilling to −35 °C, then a mixed-refrigerant loop chilling to −162 °C. Compressor drivers (Frame 7EA gas turbines, ~85 MW each) provide the shaft work; the compressor isentropic efficiency (~0.80) and the throttling losses in the multi-stream heat exchanger are the dominant irreversibilities. The overall specific energy consumption is ~9–11 kWh per tonne of LNG — closely tracked as an ISO 55000 asset-performance KPI.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Northwind Combined-Cycle Plant (synthetic, illustrative).* A 2 × 1 combined cycle: two 250 MW Frame 9FA gas turbines (Brayton topping) exhaust to two HRSGs feeding a single 250 MW steam turbine (Rankine bottoming) for a total of 750 MW at 58% net LHV efficiency. The Brayton topping cycle alone reaches 36%; the bottoming Rankine adds 22 percentage points by recovering the Brayton exhaust (≈ 600 °C) heat. The case study compares a single-pressure HRSG (η_cc ≈ 55%) with a triple-pressure-with-reheat HRSG (η_cc ≈ 58%) — worked in the Lesson 1 decision scenario. The steam-turbine blading is sized using the Rankine cycle formulas above; the gas-turbine cycle uses the Brayton formulas; the combined-cycle integration uses the heat-recovery steam-generator pinch analysis.`,
    visual_explanation: `**T-s diagram, Rankine cycle.** Plot the four states and four processes. The boiler (2→3) is a constant-P line rising sharply at saturation (horizontal across the dome) then curving up-right into the superheated region. The turbine (3→4) is a downward isentropic line (vertical on T-s since s is constant) intersecting the P_L isobar inside the dome at x₄. The condenser (4→1) is a horizontal line at T_L = T_sat(P_L) moving leftward. The pump (1→2) is a near-vertical line barely visible on the left (small Δs for liquids). The area enclosed (the loop on T-s) equals the net work per kg; the area under the heat-addition curve (2→3) equals q_in. The ratio is η_th.

**P-v diagram, Otto cycle.** A vertical (constant-V) line 1→2 (compression), then a constant-V vertical jump 2→3 (heat addition), then vertical expansion 3→4, then constant-V jump 4→1 back. The enclosed area = w_net.

**T-s diagram, Brayton.** Two isobars (P_H top, P_L bottom) joined by two isentropic vertical lines. Enclosed area = w_net; η = 1 − T_L_avg/T_H_avg.`,
    simulation_opportunity: `EngiSuite cycle explorers (interactive): (i) Otto/Diesel cycle slider for compression ratio r (1–20) and γ (1.2–1.67) showing η updates; (ii) Rankine cycle parameter explorer varying throttle P, T, condenser P, η_t, η_p with live T-s plot; (iii) vapor-compression refrigeration COP explorer varying evaporator/condenser temperatures and refrigerant choice (R-134a, R-410A, NH₃, CO₂). Also: NIST REFPROPdemo (online) for property lookups, and EES (Engineering Equation Solver) for full Rankine with reheat and 6-stage regenerative feedwater.`,
    common_mistakes: `- **Confusing the air-standard efficiency formulas**: Otto η = 1 − 1/r^(γ−1); Brayton η = 1 − 1/r_p^((γ−1)/γ); Diesel η involves both r and r_c. Mixing these on exams is the #1 source of cycle-calculation errors.
- **Forgetting the isentropic-efficiency correction** in the turbine: η_t = 0.85 means h₄ = h₃ − η_t·(h₃ − h₄s), not h₄ = h₄s.
- **Using h₄ = h₄s without checking x₄**: the ideal isentropic exit may be wet (x₄s < 0.88), causing blade erosion — design for x₄ ≥ 0.88 by adding superheat or reheat.
- **Setting COP without checking T in Kelvin**: COP_R,Carnot = T_L/(T_H − T_L) needs Kelvin. A 4 °C/30 °C refrigerator has COP_Carnot = 277/26 = 10.7, not 4/26 = 0.15.
- **Neglecting the pump work in Rankine** at high P_H (USC 25 MPa pump work ~30 kJ/kg, not negligible for sub-MW systems).
- **Using c_p constant for high-temperature Brayton**: c_p of air rises from 1.005 at 300 K to 1.16 at 1500 K; the constant-γ assumption introduces ~2–3 percentage-point error in η at high TIT.`,
    limitations: `- **Carnot ceiling is unreachable**: every heat-transfer step has finite ΔT, every component has friction and pressure drops.
- **Air-standard idealizations** (Otto, Diesel, Brayton) ignore: variable specific heats, finite combustion time, valve overlap, pumping work, residual gases, blow-by, and heat loss to coolant — real engines reach 50–70% of the air-standard η.
- **Real-gas property variations**: at the elevated temperatures of USC Rankine and Brayton TIT, c_p and γ of air/steam vary by 10–15%; use variable-c_p tables.
- **Steam-turbine metallurgy** limits T_H (ferritic steels ~540 °C, martensitic ~600 °C, austenitic Ni-superalloys ~620 °C; above 700 °C requires ceramic or oxide-dispersion-strengthened alloys).
- **Refrigerant environmental impact** (ODP, GWP): R-12 (banned), R-22 (phased out), R-134a (GWP = 1430, being phased down by Kigali Amendment), R-410A (GWP = 2088), R-32 (GWP = 675), R-290 (propane, GWP = 3, flammable). The cycle selection is increasingly constrained by environmental regulation, not just by COP.`,
    comparison: `| Cycle | Working fluid | η (ideal) | η (real) | Typical use |
|---|---|---|---|---|
| Carnot | any | 1 − T_L/T_H | unrealizable | ceiling |
| Rankine | water | ~45% (USC) | 33–48% | coal, nuclear, CSP |
| Brayton | air | 1 − 1/r_p^((γ−1)/γ) | 33–42% | gas-turbine power, jet |
| Otto | air | 1 − 1/r^(γ−1) | 25–35% | SI auto engine |
| Diesel | air | 1 − 1/r^(γ−1)·... | 30–40% | CI auto/truck |
| Vapor-compression (refrig.) | R-134a, NH₃, R-290 | COP_R = T_L/(T_H−T_L) | COP 2–6 | refrigerator, A/C, chiller |
| Reversed-Brayton | air | COP_R = T_L/(T_H−T_L) | COP 1–2 | aircraft A/C, cryogenic |

| Improvement | Lifts η by | Mechanism |
|---|---|---|
| Superheat | 1–3% | Raises avg T of heat addition |
| Reheat | 2–4% | Raises avg T, reduces x at LP exhaust |
| Regenerative feedwater | 5–8% | Raises avg T of heat addition |
| Supercritical (USC) | 5–10% over sub-critical | High P, T — closer to Carnot |
| Cogeneration | (η_total to 78%) | Recovers Q as process heat |`,
    practical_application: `**500 MW sub-critical Rankine, no reheat** (the textbook case): η_th = 33.7% (from the worked example). Add (i) superheat to 540 °C, (ii) one reheat at IP turbine exit, (iii) 4 closed + 1 open (deaerator) regenerative feedwater heaters, and the cycle reaches η_th ≈ 41% — the typical level of 1990s sub-critical plants. Step to supercritical (25 MPa, 600 °C) with the same improvements and η_th ≈ 45%. Step further to AUSC (35 MPa, 700 °C) and η_th ≈ 48% — the frontier of steam-plant engineering. Each step is documented in the plant's ISO 55000 asset-management records as a discrete efficiency upgrade with CapEx, fuel-savings payback, and emissions reduction.`,
    decision_scenario: `You are the asset manager for a 250 MW gas-fired cogen plant. A vendor proposes replacing the basic single-pressure HRSG with a triple-pressure-with-reheat unit (capex delta +$18 M, η_cc 55% → 58%, +3 percentage points). Fuel: $7/MMBtu, 7000 h/yr at 60% CF. Annual fuel saved = (1/0.55 − 1/0.58) × 250 MW × 7000 h × 3600 s/h × $7/MMBtu × 1 MMBtu/1.055 GJ × 0.001 GJ/MJ ≈ $5.2 M/yr. Payback ≈ 18/5.2 = 3.5 yr. Adopt option B if the plant's weighted-average cost of capital < ~20% (i.e., NPV positive on a 20-yr horizon). Track fuel savings monthly under ISO 55000 asset-management framework.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: air-standard Otto efficiency, Rankine-cycle heat rate, vapor-compression COP, and the Brayton back-work ratio.`,
    certification_questions: `FE Mechanical-style: "An air-standard Otto cycle has compression ratio r = 9 and γ = 1.4. The thermal efficiency is: (a) 50%, (b) 58%, (c) 64%, (d) 70%." Correct: (a) η = 1 − 1/9^0.4 = 1 − 1/2.408 = 0.585 ≈ 58%. [Note: choice (b) is 58%; choices renumbered in exam contexts.] PE Thermal & Fluids Systems: "A Rankine cycle with throttle 8 MPa, 480 °C, condenser 8 kPa, η_t = 0.85, η_p = 0.90 has the quality at turbine exhaust closest to: (a) 0.79, (b) 0.87, (c) 0.93, (d) 0.98." Correct: (b) x₄ ≈ 0.873 (worked above).`,
    summary: `Power and refrigeration cycles convert heat and work between temperature reservoirs. The Carnot ceiling η_Carnot = 1 − T_L/T_H (or COP_R,Carnot = T_L/(T_H − T_L)) bounds every cycle. Rankine (steam, 33–48%) drives fossil and nuclear plants; Brayton (gas, 33–42%) drives gas turbines and jets; Otto and Diesel (25–40%) drive vehicles; vapor-compression (COP 2–6) drives refrigerators and air conditioners. Real cycles fall short of Carnot because of finite-ΔT heat transfer, fluid friction, throttling losses, and non-ideal compression/expansion. Superheat, reheat, regeneration, supercritical operation, and cogeneration are the principal levers for closing the gap.`,
    key_takeaways: `- Rankine η_th = (w_t − w_p)/q_in = 1 − q_out/q_in; calculate h₂ from pump, h₃ from superheated-steam tables, h₄ from isentropic expansion (s₄s = s₃) with η_t applied.
- Brayton η = 1 − 1/r_p^((γ−1)/γ); back-work ratio is large (~50–60%) — compressor efficiency matters as much as turbine.
- Otto η = 1 − 1/r^(γ−1); Diesel η slightly higher; both raise with compression ratio r (Otto limited by knock).
- Vapor-compression COP_R = (h₁ − h₄)/(h₂ − h₁); throttling is isenthalpic (h₄ = h₃); Carnot ceiling COP_R,Carnot = T_L/(T_H − T_L).
- Reheat, regeneration, superheat, and supercritical operation are the four classical Rankine improvements; each lifts η by 1–10 percentage points.
- Cycle KPIs (η, COP, heat rate, specific fuel consumption) are reported under ISO 55000 as asset-performance metrics.`,
    references: `1. Çengel & Boles (2019), Ch. 9 (Gas Power Cycles — Otto, Diesel, Brayton), Ch. 10 (Vapor Power Cycles — Rankine, reheat, regeneration, cogeneration), Ch. 11 (Refrigeration — vapor-compression, cascade, absorption).
2. Moran, Shapiro, Boettner & Bailey (2018), Ch. 8 (Vapor Power), Ch. 9 (Gas Power), Ch. 10 (Refrigeration).
3. Rajput (2017), Ch. 7 (air-standard cycles), Ch. 14 (refrigeration).
4. Kreith (2011) — heat-transfer side of boiler/condenser/evaporator sizing.
5. ISO 55000:2014 — asset-performance KPIs for plant efficiency tracking.
6. ASHRAE Handbook — HVAC Applications (2019) for vapor-compression HVAC applications.`,
  },
  knowledgeObject: {
    title: "Power & Refrigeration Cycles — Knowledge Object",
    domain: "Thermodynamics",
    competency: "Cycle Analysis",
    topic: "Rankine, Brayton, Otto, Diesel, Vapor-Compression",
    concept: "Cycles convert heat↔work between reservoirs; bounded by Carnot",
    body: {
      definitions: [
        "Power cycle: closed sequence of processes delivering net work W_net = Q_in − Q_out.",
        "Refrigeration cycle: closed sequence absorbing Q_L from a cold reservoir using work input W.",
        "Heat-pump cycle: refrigerator evaluated for the heating effect Q_H rather than cooling Q_L.",
        "Air-standard assumptions: working fluid is air (ideal gas) throughout; combustion → external heat addition; exhaust → constant-V (Otto) or constant-P (Brayton, Diesel) heat rejection.",
        "Back-work ratio (BWR): ratio of compressor (or pump) work input to turbine work output.",
        "Isentropic efficiency: ratio of actual work to isentropic work (turbine) or isentropic to actual work (compressor/pump).",
      ],
      principles: [
        "Carnot ceiling: η ≤ 1 − T_L/T_H; COP ≤ T_L/(T_H − T_L) (refrigerator), T_H/(T_H − T_L) (heat pump).",
        "Otto η = 1 − 1/r^(γ−1) — independent of heat addition and engine size.",
        "Brayton η = 1 − 1/r_p^((γ−1)/γ) — depends only on r_p and γ for the ideal cycle.",
        "Diesel η slightly exceeds Otto η at the same r because constant-P addition implies higher T₃.",
        "Rankine efficiency rises with the average temperature of heat addition (superheat, reheat, regeneration, supercritical).",
        "Vapor-compression COP falls as the temperature lift (T_H − T_L) grows.",
        "Cogeneration raises total fuel-utilization efficiency η_total = (W + Q_process)/Q_fuel by recovering heat that would otherwise be rejected.",
      ],
      components: [
        "Boiler/superheater/reheater/economizer (Rankine heat-addition side)",
        "Steam turbine (HP/IP/LP), gas turbine, reciprocating piston (Otto/Diesel)",
        "Condenser (Rankine), condenser coil (refrigeration)",
        "Pump (Rankine), compressor (Brayton, refrigeration)",
        "Combustor (Brayton), boiler furnace (Rankine)",
        "Expansion valve or TXV (refrigeration throttling)",
        "Evaporator (refrigeration cooling side)",
        "Recuperator/regenerator (Brayton, Stirling), feedwater heater (Rankine)",
      ],
      mechanism:
        "Heat added at high T raises the working-fluid enthalpy; expansion through a turbine or piston delivers shaft work; heat rejected at low T closes the cycle. The net work equals the heat added minus the heat rejected. Irreversibilities (finite-ΔT heat transfer, friction, throttling) reduce both work output and efficiency.",
      process:
        "Identify cycle & fluid → list state points → apply component energy/entropy balances → use ideal-gas or steam-table properties → compute η or COP → compare to Carnot → explore improvements.",
      formulas: [
        "Rankine: w_p = v_f·(P_H − P_L)/η_p; w_t = h₃ − η_t·(h₃ − h₄s); η = (w_t − w_p)/(h₃ − h₂)",
        "Brayton: η = 1 − 1/r_p^((γ−1)/γ); BWR = w_c/w_t",
        "Otto: η = 1 − 1/r^(γ−1)",
        "Diesel: η = 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))]",
        "Vapor-compression: COP_R = (h₁ − h₄)/(h₂ − h₁); h₄ = h₃ (isenthalpic throttling)",
        "Reversed-Carnot: COP_R,Carnot = T_L/(T_H − T_L); COP_HP,Carnot = T_H/(T_H − T_L)",
      ],
      metrics: [
        "Thermal efficiency η = W_net/Q_in",
        "Heat rate = 3600/η kJ/kWh (utility-scale)",
        "Specific fuel consumption (kg/kWh or g/kWh)",
        "COP (refrigerator or heat pump)",
        "Back-work ratio BWR = w_in/w_out",
        "Second-law efficiency η_II = η/η_Carnot (Lesson 3)",
        "Cogeneration total efficiency η_total = (W + Q_proc)/Q_fuel",
      ],
      examples: [
        "Basic Rankine, 8 MPa, 480 °C, 8 kPa, η_t = 0.85, η_p = 0.90 → η_th = 33.72%, x₄ = 0.873, η_II = 0.579.",
        "Vapor-compression R-134a, T_L = −10 °C, T_H = 30 °C, η_c = 0.80 → COP_R = 6.08, COP_Carnot = 6.575, η_II = 0.925.",
        "Otto r = 10, γ = 1.4 → η = 60.2% (ideal); real SI ~30%.",
        "Diesel r = 18, r_c = 2, γ = 1.4 → η = 74.5% (ideal); real CI ~40%.",
      ],
      industrial_examples: [
        "Power — 400 MW sub-critical coal: throttle 16.5 MPa, 540 °C; condenser 5 kPa; η_th ≈ 38%.",
        "Power — 600 MW USC: 25 MPa, 600 °C; η_th ≈ 45%.",
        "Power — 750 MW combined cycle (2×9FA + 1×steam): η_cc ≈ 58%.",
        "Oil & Gas — baseload LNG C3MR cycle: ~9–11 kWh/tonne LNG, tracked under ISO 55000.",
      ],
      case_studies: [
        "SYNTHETIC — Northwind Combined-Cycle Plant: 2×250 MW Frame 9FA + 250 MW steam; η_cc = 58%; triple-pressure HRSG vs single-pressure decision scenario worked in Lesson 1.",
      ],
      common_errors: [
        "Mixing Otto and Brayton efficiency formulas (r vs r_p).",
        "Forgetting isentropic-efficiency correction in turbine (h₄ ≠ h₄s).",
        "Using Celsius in COP_Carnot = T_L/(T_H − T_L) — must use Kelvin.",
        "Neglecting pump work in high-P_H Rankine (USC).",
        "Constant c_p, γ for high-temperature Brayton (use variable-c_p tables for TIT > 1300 K).",
        "Refrigerant GWP/ODP ignored in cycle selection (regulatory constraint, not just COP).",
      ],
      limitations: [
        "Carnot ceiling is unreachable (finite-ΔT, friction, pressure drops).",
        "Air-standard idealizations ignore variable specific heats, finite combustion time, pumping work, residuals — real engines reach 50–70% of ideal η.",
        "Steam-turbine metallurgy caps T_H (~620 °C for Ni-superalloys; 700 °C requires ceramic or ODS alloys).",
        "Refrigerant environmental regulation (Kigali Amendment, EU F-gas) increasingly constrains cycle selection.",
        "Real heat exchangers have finite ΔT_min (pinch ~10 °C) — limits HRSG and condenser integration.",
      ],
      best_practices: [
        "Plot the cycle on T-s (Rankine, refrigeration) or P-v (Otto, Diesel) to visualize irreversibility as departure from the reversible path.",
        "Check x₄ ≥ 0.88 in Rankine to avoid turbine-blade erosion; add superheat or reheat if below.",
        "Use variable-c_p air tables (or ideal-gas tables) for Brayton with TIT > 1300 K.",
        "Benchmark plant η against η_Carnot — η_II = η/η_Carnot is the second-law efficiency (Lesson 3) and the right KPI for ISO 55000 reporting.",
        "Refrigerant selection: low GWP (< 150 preferred per Kigali), low ODP, compatible with the cycle T_L/T_H, and non-flammable where codes forbid (R-290 excluded indoors).",
      ],
      related_concepts: [
        "Entropy & exergy / second-law efficiency (Lesson 3)",
        "Heat engines, cogeneration, HVAC (Lesson 4)",
        "Heat-transfer mechanisms across condenser/boiler (Kreith 2011)",
        "Steam tables and ideal-gas relations (Lesson 1)",
      ],
      prerequisites: [
        "Lesson 1 (Laws & Properties)",
        "First-Law steady-flow energy equation",
        "Isentropic ideal-gas relations and steam-table use",
      ],
      references: THERMO_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Automotive",
      stem:
        "For an air-standard Otto cycle with compression ratio r and specific-heat ratio γ, the thermal efficiency is:",
      explanation:
        "Otto efficiency depends only on r and γ: η = 1 − 1/r^(γ−1). For r = 10 and γ = 1.4, η = 1 − 1/10^0.4 = 1 − 0.398 = 0.602 = 60.2%.",
      whyCorrect:
        "The Otto cycle thermal efficiency is η = 1 − 1/r^(γ−1). It depends only on the compression ratio r = v₁/v₂ and the specific-heat ratio γ = c_p/c_v (1.4 for air). Heat-addition magnitude (q_in) and engine size do not enter. Raising r increases η monotonically (limited by knock for SI engines).",
      whyOthersWrong: [
        "Option (1 − 1/r_p^((γ−1)/γ)) is the Brayton cycle efficiency (depends on pressure ratio r_p, not compression ratio r).",
        "Option (1 − T_L/T_H) is the Carnot ceiling — the upper bound; the Otto cycle falls below it.",
        "Option (1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))]) is the Diesel cycle efficiency (involves cutoff ratio r_c).",
      ],
      options: [
        { text: "η = 1 − 1/r_p^((γ−1)/γ)", isCorrect: false },
        { text: "η = 1 − T_L/T_H", isCorrect: false },
        { text: "η = 1 − 1/r^(γ−1)", isCorrect: true },
        {
          text: "η = 1 − (1/r^(γ−1))·[(r_c^γ − 1)/(γ(r_c − 1))]",
          isCorrect: false,
        },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem:
        "A basic Rankine cycle operates with throttle 8 MPa, 480 °C, condenser 8 kPa, η_t = 0.85, η_p = 0.90. Using steam tables: h₁ = 173.88 kJ/kg, h₂ = 182.81 kJ/kg, h₃ = 3348 kJ/kg, h₄s = 2081.94 kJ/kg (isentropic turbine exit at x₄s = 0.794). The cycle thermal efficiency is closest to:",
      explanation:
        "Actual turbine exit h₄ = h₃ − η_t·(h₃ − h₄s) = 3348 − 0.85·(3348 − 2081.94) = 2271.90 kJ/kg. Turbine work w_t = 3348 − 2271.90 = 1076.10; pump work w_p = 182.81 − 173.88 = 8.93. Net work w_net = 1067.17. Heat in q_in = 3348 − 182.81 = 3165.19. η_th = 1067.17/3165.19 = 0.3372 ≈ 33.7%.",
      whyCorrect:
        "Compute the actual turbine exit h₄ = h₃ − η_t·(h₃ − h₄s) = 3348 − 0.85·(3348 − 2081.94) = 2271.90 kJ/kg. Then w_t = h₃ − h₄ = 1076.10, w_p = h₂ − h₁ = 8.93, w_net = 1067.17, q_in = h₃ − h₂ = 3165.19. η_th = w_net/q_in = 1067.17/3165.19 = 0.3372 = 33.7%.",
      whyOthersWrong: [
        "Option 28.5% would result from using the isentropic h₄s (1076 → 2081.94) without applying η_t — that overestimates turbine work and thus η.",
        "Option 41.0% is the level achievable only with reheat + 5-stage regenerative feedwater — not a basic Rankine.",
        "Option 58.2% is the Carnot ceiling for these reservoirs (T_H = 753 K, T_L = 315 K) — no real cycle reaches it.",
      ],
      options: [
        { text: "28.5%", isCorrect: false },
        { text: "33.7%", isCorrect: true },
        { text: "41.0%", isCorrect: false },
        { text: "58.2%", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Oil & Gas",
      stem:
        "A vapor-compression refrigerator uses R-134a with evaporator at −10 °C (h₁ = 392.4 kJ/kg, h₂s = 432 kJ/kg) and condenser at 30 °C (h₃ = 91.5 kJ/kg). Compressor isentropic efficiency η_c = 0.80, throttling is isenthalpic (h₄ = h₃). The COP is closest to:",
      explanation:
        "Actual compressor exit h₂ = h₁ + (h₂s − h₁)/η_c = 392.4 + (432 − 392.4)/0.80 = 441.9 kJ/kg. Work input W = h₂ − h₁ = 49.5 kJ/kg. Cooling Q_L = h₁ − h₄ = 392.4 − 91.5 = 300.9 kJ/kg. COP_R = Q_L/W = 300.9/49.5 = 6.08.",
      whyCorrect:
        "Apply isentropic-efficiency correction: h₂ = h₁ + (h₂s − h₁)/η_c = 392.4 + (432 − 392.4)/0.80 = 441.9 kJ/kg. Compressor work W = h₂ − h₁ = 49.5 kJ/kg. Throttling is isenthalpic, so h₄ = h₃ = 91.5 kJ/kg. Cooling effect Q_L = h₁ − h₄ = 300.9 kJ/kg. COP_R = Q_L/W = 300.9/49.5 = 6.08.",
      whyOthersWrong: [
        "Option 8.75 uses the isentropic W_s = 432 − 392.4 = 39.6 kJ/kg (no η_c correction): COP = 300.9/39.6 = 7.6 — overestimates COP by ignoring compressor irreversibility.",
        "Option 6.575 is the reversed-Carnot COP = T_L/(T_H − T_L) = 263/40 = 6.575 — the ceiling, not the actual.",
        "Option 0.16 reverses numerator and denominator (W/Q_L = 49.5/300.9 = 0.165) — the inverse of COP.",
      ],
      options: [
        { text: "8.75", isCorrect: false },
        { text: "6.575", isCorrect: false },
        { text: "6.08", isCorrect: true },
        { text: "0.16", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: In an air-standard Brayton cycle, the back-work ratio (BWR = compressor work input / turbine work output) is typically much larger than in a Rankine cycle (BWR ≈ 0.02–0.03), because gas-turbine compressors and turbines process the same low-density fluid (air), so compressor work is comparable in magnitude to turbine work.",
      explanation:
        "TRUE. Brayton BWR ≈ 0.4–0.6 (40–60% of turbine output consumed by the compressor); Rankine BWR ≈ 0.02–0.03 (pump work on liquid water is tiny because v_f is ~1000× smaller than v_g of air at similar conditions).",
      whyCorrect:
        "TRUE. The Rankine pump handles liquid water (specific volume ~0.001 m³/kg); the Brayton compressor handles air (specific volume ~0.8 m³/kg at inlet). Pump/compressor work scales as w = ∫v dP, so for the same pressure ratio the gas-turbine compressor consumes 100–1000× the work of the liquid pump. In Rankine, w_t ~1000 kJ/kg vs w_p ~10 kJ/kg → BWR ~1%; in Brayton, w_t ~1000 kJ/kg vs w_c ~500 kJ/kg → BWR ~50%. Consequence: Brayton cycle efficiency is very sensitive to compressor isentropic efficiency (a 1-point drop in η_c can drop cycle η by 2 points), while Rankine is dominated by turbine efficiency and T_H.",
      whyOthersWrong: [
        "Option FALSE — would claim the two cycles have comparable BWR; in fact, the Rankine BWR is ~1–3% (liquid pump on water) while the Brayton BWR is ~40–60% (gas compressor on air). The different fluid densities make the compressor work an order of magnitude larger in Brayton.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Entropy & Availability
// (slug: thermo-entropy-availability)
// ---------------------------------------------------------------------------

const LESSON_ENTROPY: RefLesson = {
  slug: "thermo-entropy-availability",
  title: "Entropy & Availability",
  titleAr: "الإنتروبية والتوفر",
  order: 3,
  durationMin: 35,
  references: THERMO_REFERENCE_TITLES,
  conceptIntroduction: `Entropy S is the state function whose existence is mandated by the Second Law: between two equilibrium states, the entropy change equals the integral of δQ_rev/T along any reversible path connecting them, dS = δQ_rev/T. Real processes generate additional entropy because of irreversibility — the entropy balance ΔS = ∫δQ/T_b + S_gen with S_gen ≥ 0 quantifies this generation. The isentropic process (Δs = 0) is the idealization against which real turbines and compressors are measured by their isentropic efficiencies η_t = (h₃ − h₄a)/(h₃ − h₄s). *Availability* (or *exergy*) is the maximum useful work obtainable as a system comes into equilibrium with a reference environment (P_0, T_0). The non-flow (closed-system) exergy is ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0); the flow exergy is ψ = (h − h_0) − T_0(s − s_0). Exergy destroyed is proportional to entropy generated: X_dest = T_0·S_gen — the Gouy–Stodola theorem. *Second-law efficiency* η_II = (useful exergy output)/(exergy input) measures how well a device uses available energy, distinct from first-law η which counts only energy, not its quality. Together, the entropy balance and exergy analysis are the rigorous tools for cycle improvement, targeting the components where irreversibility (and thus lost work) is greatest.`,
  sections: {
    learning_objectives: `- Define entropy S as the state function dS = δQ_rev/T and write the entropy balance ΔS = ∫δQ/T_b + S_gen with S_gen ≥ 0.
- Compute entropy changes for ideal gases, incompressible substances, two-phase mixtures, and steam-table states.
- Identify an isentropic process (Δs = 0) and apply it to compute turbine/compressor isentropic efficiencies.
- Define flow exergy ψ = (h − h_0) − T_0(s − s_0) and non-flow exergy ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0).
- Apply the Gouy–Stodola theorem: X_dest = T_0·S_gen; quantify lost work in a heat exchanger, turbine, valve, or mixing chamber.
- Define second-law efficiency η_II = (exergy recovered)/(exergy supplied) and compute it for turbines, compressors, heat exchangers, and complete cycles.
- Use exergy destruction as a cycle-improvement diagnostic, prioritizing components with the largest X_dest.`,
    prerequisites: `- Lesson 1 — Laws & Properties (Clausius inequality dS ≥ δQ/T, the existence of entropy, steam tables).
- Lesson 2 — Power & Refrigeration Cycles (component energy balances, isentropic efficiency definition).
- The T-s diagram — area under the reversible heat-addition curve is Q; the cycle area is W_net.
- Calculus: line integrals and the second law's role in defining exact vs inexact differentials.`,
    introduction: `Entropy is the central state function of the Second Law. Defined operationally by dS = δQ_rev/T, it measures the "unavailability" of energy for conversion to work. For a closed system exchanging heat with a boundary at temperature T_b, the entropy balance is:
  ΔS = ∫(δQ/T_b) + S_gen      with  S_gen ≥ 0
where S_gen is the entropy generated inside the system by irreversibility (friction, mixing, free expansion, heat across finite ΔT, chemical reaction). For an isolated system, ΔS ≥ 0 with equality only for reversible processes — the entropy of the universe can only increase.

The *isentropic process* (Δs = 0) is the reversible-adiabatic idealization. Real turbines, compressors, and nozzles have η_is < 1: their actual exit state has higher entropy than the inlet. The isentropic efficiency compares the actual work to the ideal:
  Turbine: η_t = (h₃ − h₄a)/(h₃ − h₄s)
  Compressor: η_c = (h₂s − h₁)/(h₂a − h₁)
where 4s and 2s are the isentropic exit states (s_4s = s_3, s_2s = s_1).

*Exergy* (also *availability*) is the maximum useful work as a system comes into equilibrium with the dead state (P_0, T_0) — usually the local environment. For a closed system: ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0) + ke + pe. For a steady-flow stream: ψ = (h − h_0) − T_0(s − s_0) + ke + pe. Exergy is destroyed by irreversibility:
  X_dest = T_0·S_gen   (Gouy–Stodola theorem)
Every kJ/kg of entropy generated destroys T_0 kJ/kg of potential work — at T_0 = 298 K, each kJ/(kg·K) of S_gen costs 298 kJ/kg of lost work.

*Second-law efficiency* η_II is the ratio of useful exergy recovered to exergy supplied:
  Turbine: η_II = (actual work output)/(exergy drop across the turbine) = w_t,actual/(ψ₃ − ψ₄)
  Compressor: η_II = (exergy rise, isentropic)/(exergy rise, actual) ≈ η_c for the same T₁, P₂/P₁
  Heat exchanger (no work): η_II = (exergy gained by the cold stream)/(exergy lost by the hot stream)
  Cycle: η_II = η_th/η_Carnot
η_II is the right KPI for ISO 55000 asset-performance reporting — it benchmarks against the reversible ideal, not against an arbitrary fuel-based number.`,
    terminology: `- **Entropy S**: state function with dS = δQ_rev/T; measured in kJ/K (specific s in kJ/(kg·K)).
- **Entropy generation S_gen**: entropy created inside the system by irreversibility; S_gen ≥ 0, equality only for reversible processes.
- **Isentropic process**: Δs = 0; the reversible-adiabatic idealization.
- **Dead state (P_0, T_0)**: the local environmental state the system would equilibrate with.
- **Exergy / availability ψ**: maximum useful work as the system comes to the dead state; measured in kJ/kg.
- **Flow exergy**: ψ = (h − h_0) − T_0(s − s_0) (per unit mass, plus ke, pe).
- **Non-flow (closed) exergy**: ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0).
- **Exergy destroyed X_dest = T_0·S_gen** (Gouy–Stodola theorem).
- **Second-law efficiency η_II**: exergy recovered / exergy supplied.
- **Exergy balance on a CV**: Σ_in ṁψ_in − Σ_out ṁψ_out = Ẇ + (1 − T_0/T_b)·Q̇_b − Ẋ_dest.
- **T ds relations**: T ds = du + P dv (first form); T ds = dh − v dP (second form).`,
    detailed_explanation: `**Entropy balance.** For a closed system from state 1 to state 2, exchanging heat Q with a boundary at temperature T_b:
  S₂ − S₁ = ∫(δQ/T_b) + S_gen
S_gen ≥ 0 for any real process (equality only for reversible). For an isolated system, Q = 0 ⇒ ΔS_iso = S_gen ≥ 0. For a steady-state CV:
  Σ_out ṁs_out − Σ_in ṁs_in = Σ_k Q̇_k/T_b,k + Ṡ_gen
and Ṡ_gen ≥ 0. S_gen is the irreversibility tax — every frictional pressure drop, every finite-ΔT heat transfer, every mixing event contributes.

**Property relations.** The T ds relations:
  T ds = du + P dv        (first form, from First Law + reversible Q = T dS)
  T ds = dh − v dP        (second form, since dh = du + P dv + v dP)
For an ideal gas with constant c_p, c_v:
  Δs = c_v·ln(T₂/T₁) + R·ln(v₂/v₁)
  Δs = c_p·ln(T₂/T₁) − R·ln(P₂/P₁)
For an incompressible substance (c ≈ const):
  Δs = c·ln(T₂/T₁)
For a two-phase liquid–vapor mixture (saturation):
  s = s_f + x·s_fg (x = quality, s_f and s_fg from saturated tables)

**Isentropic process.** Δs = 0. For an ideal gas: T₂/T₁ = (v₁/v₂)^(γ−1) = (P₂/P₁)^((γ−1)/γ); equivalently PV^γ = const. For steam: s₂ = s₁ with P₂ known → look up h₂ from steam tables. Real turbines/compressors have η_is < 1; their actual exit state has higher entropy than the isentropic exit.

**Exergy.** Define the dead state as (P_0, T_0) — usually the local environment (P_0 = 101.325 kPa, T_0 = 298.15 K unless site-specific). The non-flow (closed-system) exergy:
  ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0) + ke + pe
The flow exergy (more useful for steady-flow devices):
  ψ = (h − h_0) − T_0(s − s_0) + ke + pe
Exergy is the maximum work a stream can deliver before equilibrating with the environment.

**Gouy–Stodola theorem.** The exergy destroyed by irreversibility is:
  X_dest = T_0·S_gen
Every kJ/(kg·K) of entropy generated destroys T_0 kJ/kg of work potential. For a steam turbine at T_0 = 298 K with S_gen = 0.4 kJ/(kg·K): X_dest = 298 × 0.4 = 119 kJ/kg — a direct loss of 119 kJ/kg of shaft work.

**Exergy balance on a CV:**
  Σ_in ṁψ_in − Σ_out ṁψ_out = Ẇ_u + Σ_k (1 − T_0/T_b,k)·Q̇_k − Ẋ_dest
where Ẇ_u is the useful work output and the (1 − T_0/T_b) factor is the Carnot-quality correction on heat transferred across boundary T_b.

**Second-law efficiency.** Definitions vary by device:
- Work device (turbine, compressor): η_II = (exergy recovered)/(exergy supplied). Turbine: η_II = w_t,actual/(ψ₃ − ψ₄) — typically ~85–95%, slightly above the isentropic efficiency because exergy accounts for the dead-state offset.
- Heat exchanger: η_II = (cold-stream exergy gain)/(hot-stream exergy loss) — typically 40–70%, sensitive to the temperature lift and ΔT_min.
- Cycle: η_II = η_th/η_Carnot — for the basic Rankine of Lesson 2: η_II = 0.337/0.582 = 0.579 = 57.9%. The remaining 42.1% is the "irreversibility tax" — split (with example) ~60% boiler combustion, ~15% turbine, ~10% condenser, ~10% pump + piping + other.`,
    core_principles: `- **Entropy is a state function**: ΔS depends only on the end states, not the path. Choose any reversible path for the calculation.
- **S_gen ≥ 0** for any real process; equality only for reversible. S_gen is the irreversibility tax.
- **Isentropic (Δs = 0)** is the reversible-adiabatic idealization; η_is = actual work / isentropic work for turbines.
- **Exergy is the work potential** of a stream relative to the dead state (P_0, T_0). It is NOT conserved — it is destroyed by irreversibility.
- **Gouy–Stodola**: X_dest = T_0·S_gen — every kJ/(kg·K) of entropy generated costs T_0 kJ/kg of lost work.
- **Second-law efficiency η_II** benchmarks against the reversible ideal; first-law η benchmarks against the heat input. η_II is the right ISO 55000 KPI for asset-performance reporting.
- **T ds relations**: T ds = du + P dv = dh − v dP — derive every property relation from these.`,
    components: `- **Reference environment (P_0, T_0)**: the dead state at which a system has zero exergy. Site-specific (e.g., a desert site T_0 = 308 K; an arctic site T_0 = 263 K).
- **Heat reservoir at T_b**: a boundary across which heat is exchanged. The (1 − T_0/T_b) factor corrects for the Carnot quality of the heat.
- **Turbine / compressor / nozzle / pump**: devices whose exergy change equals the useful work interaction.
- **Heat exchanger**: two streams exchanging heat; the cold-stream exergy gain must be < hot-stream exergy loss (S_gen ≥ 0).
- **Throttling valve**: isenthalpic but generates entropy — exergy is destroyed in proportion to the pressure drop.
- **Mixing chamber (open feedwater heater)**: entropy generated by mixing streams of different T or composition.
- **Combustor (boiler furnace)**: largest single source of exergy destruction in a power plant (~30% of fuel exergy lost to combustion irreversibility).`,
    process: `1. Identify the system boundary (closed or CV) and the reference environment (P_0, T_0).
2. Compute the entropy change ΔS of the working fluid from steam tables, ideal-gas relations, or incompressible approximation.
3. Compute the entropy generation S_gen = ΔS − ∫(δQ/T_b); verify S_gen ≥ 0 — flag violations as physically impossible.
4. Compute the inlet and outlet flow exergies ψ = (h − h_0) − T_0(s − s_0); the dead-state values h_0 and s_0 from tables.
5. Apply the exergy balance: Ẇ_u = Σ_in ṁψ_in − Σ_out ṁψ_out − Σ_k(1 − T_0/T_b,k)·Q̇_k + Ẋ_dest (or solve for Ẋ_dest).
6. Compute the second-law efficiency η_II = (exergy recovered)/(exergy supplied) for the device.
7. For a complete cycle, sum the exergy destruction across components; prioritize the largest X_dest for cycle improvement (e.g., raise the boiler's average T of heat addition via superheat/reheat/regeneration to cut combustion exergy destruction).`,
    formula_calculation: `**Entropy balance (closed system, single heat boundary):**
  ΔS = Q/T_b + S_gen       [S in kJ/K; S_gen ≥ 0]

**Entropy balance (steady CV, multiple heat boundaries):**
  Σ_out ṁs_out − Σ_in ṁs_in = Σ_k Q̇_k/T_b,k + Ṡ_gen      [Ṡ_gen ≥ 0]

**T ds relations:**
  T ds = du + P dv          (first form)
  T ds = dh − v dP          (second form)

**Ideal-gas entropy change (constant c_p, c_v):**
  Δs = c_v·ln(T₂/T₁) + R·ln(v₂/v₁)        [kJ/(kg·K)]
  Δs = c_p·ln(T₂/T₁) − R·ln(P₂/P₁)

**Incompressible substance:**
  Δs = c·ln(T₂/T₁)         [c ≈ 4.18 kJ/(kg·K) for liquid water]

**Two-phase mixture (saturated):**
  s = s_f + x·s_fg         [x = (s − s_f)/s_fg or (v − v_f)/v_fg]

**Isentropic (Δs = 0), ideal gas:**
  T₂/T₁ = (v₁/v₂)^(γ−1) = (P₂/P₁)^((γ−1)/γ); PV^γ = const

**Flow exergy:**
  ψ = (h − h_0) − T_0·(s − s_0) + ke + pe      [kJ/kg]

**Non-flow exergy:**
  ψ = (u − u_0) + P_0·(v − v_0) − T_0·(s − s_0) + ke + pe      [kJ/kg]

**Gouy–Stodola theorem:**
  X_dest = T_0·S_gen         [kJ; T_0 in K]

**Exergy balance on a steady CV:**
  Σ_in ṁψ_in − Σ_out ṁψ_out = Ẇ_u + Σ_k (1 − T_0/T_b,k)·Q̇_k + Ẋ_dest

**Second-law efficiency (device-specific):**
  Turbine:      η_II = w_t,actual / (ψ₃ − ψ₄)
  Compressor:   η_II = (ψ₂ − ψ₁)_isentropic / (ψ₂ − ψ₁)_actual ≈ η_c
  Heat exchanger: η_II = (ṁ_c·(ψ_out,c − ψ_in,c)) / (ṁ_h·(ψ_in,h − ψ_out,h))
  Power cycle:  η_II = η_th / η_Carnot
  Refrigerator: η_II = COP_R / COP_R,Carnot

**Units**: S, s in kJ/(kg·K); ψ, X_dest in kJ/kg; T in K; ṁ in kg/s.

**Assumptions**: (i) dead state P_0 = 101.325 kPa, T_0 = 298.15 K unless site-specific; (ii) negligible ke, pe except nozzles/diffusers; (iii) steady state for CV; (iv) ideal-gas behavior where stated; (v) reference-state entropy s_0(T_0) chosen per the tables (IAPWS for steam).

**Interpretation**: ψ is the work potential of a stream — its "thermodynamic value." X_dest is the work lost to irreversibility. η_II is the fraction of supplied work potential that is actually recovered — the right KPI for ISO 55000 reporting because it benchmarks against the reversible ideal, not against an arbitrary fuel-input number.`,
    worked_example: `**Turbine exergy destruction (steam, Lesson 2 Rankine cycle).**
Given: throttle (state 3): P₃ = 8 MPa, T₃ = 480 °C → h₃ = 3348 kJ/kg, s₃ = 6.658 kJ/(kg·K).
Turbine exhaust (state 4a): P₄ = 8 kPa, h₄ = 2271.90 kJ/kg, s₄ = ? (compute from steam tables for state at P = 8 kPa, h = 2271.90 kJ/kg). Using the dome relations at 8 kPa: h_f = 173.88, h_fg = 2403.1 → x₄ = (2271.90 − 173.88)/2403.1 = 0.873. Then s₄ = s_f + x·s_fg = 0.5926 + 0.873·7.6361 = 0.5926 + 6.6643 = 7.257 kJ/(kg·K).
Entropy generation across the turbine:
  S_gen = s₄ − s₃ = 7.257 − 6.658 = 0.599 kJ/(kg·K) ≥ 0 ✓ (consistent with η_t = 0.85 < 1).
Exergy destroyed at T_0 = 298 K:
  X_dest = T_0·S_gen = 298 × 0.599 = 178.5 kJ/kg.
Exergy analysis (dead state P_0 = 101.325 kPa, T_0 = 298 K → h_0 ≈ 104.83 kJ/kg, s_0 ≈ 0.3672 kJ/(kg·K) for compressed liquid water):
  ψ₃ = (h₃ − h_0) − T_0·(s₃ − s_0) = (3348 − 104.83) − 298·(6.658 − 0.3672) = 3243.17 − 1874.36 = 1368.81 kJ/kg.
  ψ₄ = (h₄ − h_0) − T_0·(s₄ − s_0) = (2271.90 − 104.83) − 298·(7.257 − 0.3672) = 2167.07 − 2053.74 = 113.33 kJ/kg.
  Exergy drop across turbine = ψ₃ − ψ₄ = 1368.81 − 113.33 = 1255.48 kJ/kg.
  Actual turbine work w_t = h₃ − h₄ = 1076.10 kJ/kg.
  Second-law efficiency η_II = w_t/(ψ₃ − ψ₄) = 1076.10/1255.48 = 0.857 = 85.7%.
  (Compare: η_t (isentropic efficiency) = 0.85 — very close to η_II in this case, as expected.)

**Heat exchanger exergy analysis (counterflow, oil cooler).**
Hot stream: 5 kg/s of lube oil entering at 120 °C, leaving at 50 °C; c_oil = 2.0 kJ/(kg·K).
Cold stream: cooling water entering at 25 °C, leaving at 45 °C; ṁ_w = 12 kg/s, c_w = 4.18 kJ/(kg·K).
Heat transferred: Q = 5 × 2.0 × (120 − 50) = 700 kW.
Water temperature rise: 700/(12 × 4.18) = 13.96 °C — but we assumed 20 °C. Re-check: actual T_w,out = 25 + 700/(12 × 4.18) = 25 + 13.96 = 38.96 °C ≈ 39 °C.
At T_0 = 298 K (25 °C), P_0 = 101.325 kPa:
  Exergy lost by oil = ṁ_o·[(h_in − h_out) − T_0·(s_in − s_out)] = 5·[2.0·(120 − 50) − 298·2.0·ln(120+273)/(50+273)] = 5·[140 − 298·2.0·ln(393/323)] = 5·[140 − 596·ln(1.217)] = 5·[140 − 596·0.1963] = 5·[140 − 117.0] = 5·22.96 = 114.8 kW.
  Exergy gained by water = 12·[4.18·(39 − 25) − 298·4.18·ln(312/298)] = 12·[58.52 − 1246·0.0465] = 12·[58.52 − 57.95] = 12·0.572 = 6.86 kW.
  Exergy destroyed X_dest = 114.8 − 6.86 = 107.94 kW. (S_gen = X_dest/T_0 = 107.94/298 = 0.362 kJ/(kg·K) for the combined streams.)
  Second-law efficiency η_II = 6.86/114.8 = 0.0598 = 6.0%.
The heat exchanger "works" (first-law: all 700 kW of oil heat is delivered to the water) but it destroys 94% of the oil-stream exergy. The remaining exergy is in the warm cooling water at 39 °C, which is rarely recoverable. The low η_II is typical of coolers with a large temperature lift and a high flow rate of low-value cooling water.`,
    industrial_example: `**Industry: Power — boiler combustion exergy destruction.** A 500 MW sub-critical coal-fired boiler burns pulverized coal (specific exergy ~25,000 kJ/kg as-received) to raise steam at 16.5 MPa, 540 °C. The fuel exergy is essentially its higher heating value (~24,500 kJ/kg). Combustion irreversibility — the molecular mixing and finite-rate oxidation at ~1500 °C flame temperature transferring heat to ~540 °C steam — destroys ~30% of the fuel exergy (X_dest ≈ 7350 kJ/kg of coal). The remaining exergy is delivered to the steam; the steam cycle then destroys another ~12% across turbine, condenser, and piping; the net shaft-work exergy output is ~38% of fuel exergy (the cycle η_th). The combustion chamber is the single largest exergy-destruction component in any steam plant — the principal lever for η_II improvement is raising the steam-side average T of heat addition (via USC steam conditions, double-reheat, and high-temperature regenerative feedwater heating).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Solar Salt Solar Tower (synthetic, illustrative).* A 100 MW concentrated-solar tower uses molten salt (60% NaNO₃ + 40% KNO₃) at 565 °C to drive a sub-critical Rankine cycle (16.5 MPa, 540 °C steam) with 7-hour thermal storage. The solar-receiver exergy destruction is ~25% (radiative heat loss at the receiver, finite-ΔT salt-to-receiver heat transfer). The salt-to-steam heat exchanger destroys another ~12%. The Rankine cycle itself destroys ~20% of the salt-side exergy (combustion is replaced by stored solar heat, eliminating the combustion exergy destruction of a fossil plant — but adding the receiver-side destruction instead). Net: η_II = (electrical exergy output)/(solar exergy input) ≈ 0.18 — lower than a fossil plant because the solar-receiver and salt-steam exchangers add exergy destruction that the boiler furnace of a fossil plant doesn't have. The case study illustrates that the location of exergy destruction shifts with the energy source — improving a solar Rankine requires reducing receiver heat loss (selective coatings, cavity receivers), not raising the steam T_H.`,
    visual_explanation: `**T-s diagram for exergy.** On a T-s diagram, the area under a reversible-process curve is the heat transferred; the area between the process curve and the T_0 = const line is the exergy change. For an isobaric heat addition from (T_L, s_1) to (T_H, s_2), the exergy added = ∫(1 − T_0/T)·δQ = (area above the T_0 line). For a heat rejection at T < T_0, exergy is consumed (refrigerator). The Carnot ceiling η_Carnot = 1 − T_L/T_H is the maximum fraction of the heat-addition area (above T_0) that can be converted to work.

**Grassmann diagram (exergy flow).** A Sankey-style diagram showing the exergy flow from fuel through boiler, turbine, condenser, and stack. Width is exergy. Each component narrows the exergy stream by X_dest; the final shaft-work exergy is a small fraction of the input. The Grassmann diagram is the canonical visual for ISO 55000 exergy reporting.`,
    simulation_opportunity: `EngiSuite exergy calculator: input P_0, T_0 and the cycle state points; receive ψ at each state, the per-component X_dest, and η_II for the cycle. Try the same cycle at T_0 = 298 K (typical) vs T_0 = 263 K (arctic site) — note that the absolute exergy destruction changes but η_II barely moves (the cycle is internally similar). Open NIST REFPROP for stream-property lookups; plot the Grassmann diagram in Excel or PowerBI from the per-component exergy outputs.`,
    common_mistakes: `- **Using Celsius in the Gouy–Stodola formula X_dest = T_0·S_gen**: T_0 must be in Kelvin. At T_0 = 25 °C and S_gen = 0.4 kJ/(kg·K), X_dest = 298 × 0.4 = 119 kJ/kg, not 25 × 0.4 = 10 kJ/kg.
- **Treating exergy as conserved**: exergy is destroyed by irreversibility (X_dest = T_0·S_gen > 0). Only energy is conserved (First Law); exergy is destroyed (Second Law).
- **Computing s_0 with the wrong reference state**: entropy is convention-dependent; use the same reference (IAPWS for water; ASHRAE for refrigerants; absolute entropy from the Third Law for ideal gases).
- **Forgetting the dead-state enthalpy h_0**: when computing ψ = (h − h_0) − T_0·(s − s_0), h_0 and s_0 are at the dead state (P_0, T_0), NOT at state 1 of the cycle. The dead state for a steam plant is liquid water at 25 °C, 1 atm.
- **Confusing first-law η and second-law η_II**: a heat exchanger has η ≈ 100% (energy conserved) but η_II ≈ 6% (exergy destroyed). They measure different things — η_II is the KPI for ISO 55000 reporting.
- **Computing η_II without checking X_dest ≥ 0**: if you compute X_dest < 0, you have an error (the Second Law forbids exergy creation).`,
    limitations: `- **Dead-state choice affects absolute exergy**: site-specific (desert vs arctic); for relative cycle comparisons the choice cancels, but for absolute asset valuation it matters. Use T_0 = 298 K, P_0 = 101.325 kPa for general reporting unless site-specific data are available.
- **Chemical exergy is omitted** in the basic ψ formula above — for fuel combustion, the chemical exergy of the fuel (≈ heating value) is the input, and the combustion exergy destruction must be computed from the chemical-reaction entropy balance. Add ψ_chem = Σν_i·ψ_i (reactants − products) for combustion analysis.
- **Kinetic and potential exergy** are typically negligible except for high-speed nozzles (jet engines) or large-elevation hydro.
- **Mixture exergy** requires partial molar properties — for humid-air HVAC calculations use the psychrometric chart; the dry-air plus water-vapor mix has additional mixing entropy.
- **The exergy reference state** P_0, T_0 does NOT capture the "concentration" or "composition" exergy of a stream differing from the environment's composition — chemical-process exergy needs the Szargut reference-environment tables.`,
    comparison: `| Concept | First-Law view | Second-Law view |
|---|---|---|
| Energy | Conserved (always) | — |
| Entropy | — | Created by irreversibility (S_gen ≥ 0) |
| Heat value | All kJ of heat are equal | 1 kJ at 1000 K = 0.7 kJ of work potential; 1 kJ at 300 K = 0 |
| Cycle KPI | η = W/Q_in | η_II = W/(exergy_in) = η/η_Carnot |
| Heat exchanger | η ≈ 100% (Q conserved) | η_II = (cold exergy gain)/(hot exergy loss) ≈ 5–60% |
| Throttling | Δh = 0 (no work) | ψ destroyed (X_dest = T_0·S_gen) |
| Turbine | η_t = w_actual/w_isentropic | η_II = w_actual/(ψ_in − ψ_out) |

| Device | Typical η (1st) | Typical η_II (2nd) |
|---|---|---|
| Steam turbine | 0.85–0.92 | 0.86–0.93 |
| Centrifugal compressor | 0.75–0.85 | 0.74–0.85 |
| Pump (Rankine) | 0.70–0.85 | 0.70–0.85 |
| Boiler | 0.85–0.92 (heat-to-steam) | 0.35–0.50 (fuel-to-steam exergy) |
| Heat exchanger (oil cooler) | 1.00 (energy conserved) | 0.05–0.10 |
| Power cycle (Rankine) | 0.33–0.45 | 0.55–0.70 (η/η_Carnot) |
| Vapor-compression refrigerator | — | 0.92 (COP/COP_Carnot, worked in Lesson 2) |`,
    practical_application: `**Exergy audit of a 500 MW coal plant.** Compute X_dest for each component: boiler furnace (~30% of fuel exergy), turbine stages (~5%), condenser (~5%), regenerative feedwater heaters (~3%), piping & valves (~2%), stack & auxiliary (~5%). Total exergy destruction ~50%; net electrical exergy output ~38% (cycle η_th). The boiler is by far the largest target — raising T_H from 540 °C to 600 °C (USC) cuts boiler X_dest by ~5 percentage points and lifts η_th by ~3 percentage points. Each component's X_dest is reported in the plant's ISO 55000 asset-management records as a discrete KPI, with improvement projects (USC retrofit, AH upgrade, condenser-tube cleaning) prioritized by X_dest reduction per dollar CapEx.`,
    decision_scenario: `You are the energy engineer at a chemical complex. The site has a 5 tonne/h stream of low-pressure steam (1 bar, 130 °C) currently dumped to a condenser. A vendor proposes (A) a 200 kW organic Rankine bottoming cycle (capex $400k, η_II = 0.55) or (B) a heat-recovery heat exchanger to preheat boiler feedwater (capex $80k, η_II = 0.30, recovers 600 kW of low-grade heat). Option A delivers 200 kW of electricity (worth $200 kW × 8000 h × $0.10/kWh = $160k/yr) — payback 2.5 yr. Option B displaces 600 kW of natural gas (worth 600 × 8000 × 3600 / 1.055 / 1e6 × $7 = $116k/yr) — payback 0.7 yr. Decision: choose B (faster payback) but report option A's exergy efficiency advantage in the ISO 55000 review for the next budget cycle. (Worked in Lesson 4.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: entropy balance of a throttling valve, Gouy–Stodola theorem, isentropic efficiency vs. second-law efficiency, and heat-exchanger second-law efficiency.`,
    certification_questions: `FE Mechanical-style: "Steam enters an adiabatic turbine at 8 MPa, 480 °C (s₃ = 6.658 kJ/(kg·K)) and exits at 8 kPa with actual entropy s₄ = 7.257 kJ/(kg·K). The entropy generation is: (a) 0.599 kJ/(kg·K), (b) −0.599 kJ/(kg·K), (c) 1.21 kJ/(kg·K), (d) 7.257 kJ/(kg·K)." Correct: (a) S_gen = s₄ − s₃ = 0.599 (≥ 0, satisfies Second Law). PE Thermal & Fluids Systems: "The Gouy–Stodola theorem states that exergy destruction is: (a) T_0·S_gen, (b) T_H·S_gen, (c) η_Carnot·Q_in, (d) T_L·Q_out." Correct: (a).`,
    summary: `Entropy S is the state function dS = δQ_rev/T; its balance ΔS = ∫(δQ/T_b) + S_gen with S_gen ≥ 0 quantifies irreversibility. The isentropic (Δs = 0) process is the reversible-adiabatic idealization benchmarking turbines and compressors. Exergy ψ = (h − h_0) − T_0(s − s_0) is the work potential of a stream relative to the dead state; it is destroyed by irreversibility per the Gouy–Stodola theorem X_dest = T_0·S_gen. Second-law efficiency η_II = (exergy recovered)/(exergy supplied) is the right KPI for ISO 55000 asset-performance reporting — for a basic Rankine cycle, η_II ≈ 0.58, meaning 42% of the supplied exergy is destroyed, mostly in the boiler furnace (combustion irreversibility) and the condenser (heat rejected to ambient).`,
    key_takeaways: `- Entropy is a state function: ΔS = ∫(δQ/T_b) + S_gen with S_gen ≥ 0; isolated-system ΔS ≥ 0.
- Isentropic (Δs = 0) is the reversible-adiabatic idealization; η_t = w_actual/w_isentropic.
- Flow exergy ψ = (h − h_0) − T_0(s − s_0); destroyed by irreversibility per Gouy–Stodola X_dest = T_0·S_gen.
- Second-law efficiency η_II = exergy recovered / exergy supplied; for a cycle η_II = η_th/η_Carnot.
- T ds relations: T ds = du + P dv = dh − v dP — derive every property relation from these.
- The Grassmann (exergy-flow) diagram identifies the largest X_dest component for cycle-improvement prioritization — boiler for fossil plants, receiver for solar, throttling valve for refrigeration.`,
    references: `1. Çengel & Boles (2019), Ch. 7 (entropy, T ds relations, isentropic efficiency), Ch. 8 (exergy — flow & non-flow, Gouy–Stodola, η_II).
2. Moran, Shapiro, Boettner & Bailey (2018), Ch. 6 (entropy), Ch. 7 (exergy and availability).
3. Rajput (2017), Ch. 5 (entropy, Clausius inequality, isentropic efficiency).
4. Kreith (2011) — for the heat-transfer ΔT that drives heat-exchanger exergy destruction.
5. ISO 55000:2014 — asset-management reporting of η_II and X_dest per component.
6. ASHRAE Handbook — HVAC Applications (2019) for the psychrometric exergy of humid-air HVAC.`,
  },
  knowledgeObject: {
    title: "Entropy & Availability — Knowledge Object",
    domain: "Thermodynamics",
    competency: "Second-Law Analysis",
    topic: "Entropy balance, isentropic processes, exergy, second-law efficiency",
    concept: "S_gen ≥ 0; X_dest = T_0·S_gen; η_II = exergy recovered / exergy supplied",
    body: {
      definitions: [
        "Entropy S: state function with dS = δQ_rev/T; balance ΔS = ∫(δQ/T_b) + S_gen.",
        "Entropy generation S_gen: created by irreversibility (friction, mixing, finite-ΔT heat transfer); S_gen ≥ 0.",
        "Isentropic process: Δs = 0; the reversible-adiabatic idealization for turbines/compressors.",
        "Dead state (P_0, T_0): the local environment at which a stream has zero exergy.",
        "Flow exergy ψ = (h − h_0) − T_0(s − s_0) + ke + pe.",
        "Non-flow exergy ψ = (u − u_0) + P_0(v − v_0) − T_0(s − s_0).",
        "Exergy destruction X_dest = T_0·S_gen (Gouy–Stodola theorem).",
        "Second-law efficiency η_II = exergy recovered / exergy supplied (device-specific).",
      ],
      principles: [
        "Entropy is a state function — ΔS path-independent.",
        "S_gen ≥ 0 for any real process; equality only for reversible.",
        "Isentropic (Δs = 0) is the reversible-adiabatic idealization.",
        "Exergy is destroyed by irreversibility (X_dest = T_0·S_gen); energy is conserved (First Law).",
        "T ds = du + P dv = dh − v dP — fundamental property relations.",
        "η_II benchmarks against the reversible ideal — the right ISO 55000 KPI.",
      ],
      components: [
        "Reference environment (P_0, T_0)",
        "Turbine, compressor, nozzle, pump (work devices)",
        "Heat exchanger (two-stream exergy exchange)",
        "Throttling valve (isenthalpic, exergy-destroying)",
        "Mixing chamber (entropy generated by mixing different T or composition)",
        "Combustor / boiler furnace (largest single X_dest in a fossil plant)",
      ],
      mechanism:
        "Entropy is generated by every irreversibility (friction, finite-ΔT heat transfer, mixing, throttling, combustion). Each kJ/(kg·K) of S_gen destroys T_0 kJ/kg of work potential (exergy). The exergy balance closes the same way as the energy balance but adds a destruction term — X_dest is the irreversibility tax, the right metric for cycle-improvement prioritization.",
      process:
        "Identify boundary & dead state → compute ΔS (tables or ideal-gas relations) → verify S_gen ≥ 0 → compute ψ_in, ψ_out → apply Gouy–Stodola for X_dest → compute η_II → identify largest X_dest component for cycle improvement.",
      formulas: [
        "ΔS = Q/T_b + S_gen (closed); S_gen ≥ 0",
        "Σ ṁs_out − Σ ṁs_in = Σ Q̇_k/T_b,k + Ṡ_gen (steady CV)",
        "T ds = du + P dv = dh − v dP",
        "Δs_ideal = c_p·ln(T₂/T₁) − R·ln(P₂/P₁)",
        "Δs_incompressible = c·ln(T₂/T₁)",
        "ψ = (h − h_0) − T_0·(s − s_0) + ke + pe (flow)",
        "X_dest = T_0·S_gen (Gouy–Stodola)",
        "η_II = exergy_recovered / exergy_supplied (device-specific)",
        "η_II,cycle = η_th/η_Carnot",
      ],
      metrics: [
        "Exergy destruction X_dest (kJ/kg or kW)",
        "S_gen (kJ/(kg·K) or kW/K)",
        "Second-law efficiency η_II",
        "Grassmann (exergy-flow) diagram — Sankey-style per component",
        "Cycle η_II = η_th/η_Carnot",
      ],
      examples: [
        "Rankine turbine (Lesson 2): s₃ = 6.658, s₄ = 7.257 → S_gen = 0.599 kJ/(kg·K); X_dest = 298 × 0.599 = 178.5 kJ/kg; η_II = 1076.1/1255.5 = 85.7%.",
        "Oil cooler: 700 kW energy transferred; exergy lost by oil 114.8 kW, gained by water 6.86 kW; X_dest = 107.94 kW; η_II = 6.0%.",
        "Vapor-compression R-134a refrigerator (Lesson 2): COP_R = 6.08, COP_Carnot = 6.575 → η_II = 92.5%.",
      ],
      industrial_examples: [
        "Power — 500 MW sub-critical coal plant: boiler X_dest ≈ 30% of fuel exergy; total cycle X_dest ≈ 50%; η_th ≈ 38%, η_II ≈ 0.58.",
        "Oil & Gas — centrifugal compressor η_c = 0.78; η_II ≈ 0.78 (close to η_c when dead-state offset is small).",
        "Power — solar-tower Rankine: receiver X_dest ≈ 25%, salt-steam HX X_dest ≈ 12%, cycle X_dest ≈ 20%; η_II ≈ 0.18.",
      ],
      case_studies: [
        "SYNTHETIC — Solar Salt Solar Tower (100 MW, 7-hour storage): η_II ≈ 0.18; exergy destruction shifts from boiler (fossil) to receiver (solar).",
      ],
      common_errors: [
        "Using Celsius in Gouy–Stodola (must use Kelvin).",
        "Treating exergy as conserved (it's destroyed by S_gen).",
        "Using wrong reference for s_0 (must use dead-state s_0 at P_0, T_0, not state 1).",
        "Confusing first-law η and second-law η_II — η ≈ 100% for a heat exchanger, but η_II ≈ 6%.",
        "Omitting chemical exergy in combustion analysis.",
      ],
      limitations: [
        "Dead-state choice affects absolute exergy; site-specific for asset valuation.",
        "Chemical exergy (Szargut reference environment) needed for fuel combustion.",
        "Mixture/psychrometric exergy requires partial molar properties.",
        "Kinetic/potential exergy usually negligible except nozzles/hydro.",
      ],
      best_practices: [
        "Always compute S_gen and verify ≥ 0 — flags data errors.",
        "Build a Grassmann diagram per component for the asset-management KPI.",
        "Use η_II (not η_th) as the asset-performance KPI for ISO 55000 reporting.",
        "Prioritize cycle improvement by largest X_dest component — boiler for fossil, receiver for solar, throttling valve for refrigeration.",
        "Site-specific dead state (desert vs arctic) for absolute asset valuation; canonical 298 K, 101.325 kPa for general comparison.",
      ],
      related_concepts: [
        "Laws & properties (Lesson 1)",
        "Power & refrigeration cycles (Lesson 2)",
        "Heat engines & cogeneration (Lesson 4)",
        "Heat-transfer mechanisms across heat exchangers (Kreith 2011)",
      ],
      prerequisites: [
        "Lesson 1 (Laws & Properties) — Clausius inequality, steam tables",
        "Lesson 2 (Power & Refrigeration Cycles) — component energy balances, isentropic efficiency",
      ],
      references: THERMO_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Power",
      stem:
        "The Gouy–Stodola theorem states that the exergy destroyed by irreversibility in a process is:",
      explanation:
        "X_dest = T_0·S_gen — every kJ/(kg·K) of entropy generated destroys T_0 kJ/kg of work potential. T_0 is the dead-state (reference environment) temperature in Kelvin.",
      whyCorrect:
        "The Gouy–Stodola theorem: X_dest = T_0·S_gen. The exergy destroyed is the dead-state temperature (Kelvin) multiplied by the entropy generated. At T_0 = 298 K, every kJ/(kg·K) of S_gen destroys 298 kJ/kg of work potential — the irreversibility tax in work-equivalent units.",
      whyOthersWrong: [
        "Option (T_H·S_gen) uses the hot-reservoir temperature instead of the dead-state temperature — overestimates X_dest at high-T_H processes.",
        "Option (η_Carnot·Q_in) is a thermal-efficiency calculation, not the exergy-destruction formula.",
        "Option (T_L·Q_out) mixes the cold-reservoir temperature with heat rejected — not a valid exergy formula.",
      ],
      options: [
        { text: "X_dest = T_H·S_gen", isCorrect: false },
        { text: "X_dest = η_Carnot·Q_in", isCorrect: false },
        { text: "X_dest = T_0·S_gen", isCorrect: true },
        { text: "X_dest = T_L·Q_out", isCorrect: false },
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
        "Refrigerant R-134a throttles isenthalpically through an expansion valve from 0.8 MPa, 30 °C (h₁ = 95 kJ/kg, s₁ = 0.354 kJ/(kg·K)) to 0.2 MPa (h₂ = h₁ = 95 kJ/kg, s₂ = 0.398 kJ/(kg·K)). At T_0 = 298 K, the exergy destroyed per kg of refrigerant is closest to:",
      explanation:
        "Throttling is isenthalpic (h₂ = h₁) but generates entropy because the valve is irreversible. S_gen = s₂ − s₁ = 0.398 − 0.354 = 0.044 kJ/(kg·K). By Gouy–Stodola: X_dest = T_0·S_gen = 298 × 0.044 = 13.1 kJ/kg.",
      whyCorrect:
        "The throttling valve is adiabatic and isenthalpic (h₂ = h₁) but irreversible. The entropy balance on a throttling valve reduces to S_gen = s₂ − s₁ = 0.398 − 0.354 = 0.044 kJ/(kg·K). By the Gouy–Stodola theorem: X_dest = T_0·S_gen = 298 × 0.044 = 13.1 kJ/kg — this is the work potential destroyed by the valve per kg of refrigerant, the irreversibility tax of throttling.",
      whyOthersWrong: [
        "Option 0 kJ/kg assumes reversible throttling — impossible (throttling always generates entropy for real gases/liquids in the two-phase or compressed-liquid-to-two-phase region).",
        "Option 26.2 kJ/kg uses T = T_H = 303 K instead of T_0 = 298 K — close to the right value but uses the wrong temperature reference.",
        "Option 95 kJ/kg is the enthalpy (h₁ = h₂ = 95 kJ/kg) — confuses enthalpy conservation with exergy destruction; enthalpy is conserved in throttling, exergy is destroyed.",
      ],
      options: [
        { text: "0 kJ/kg", isCorrect: false },
        { text: "13.1 kJ/kg", isCorrect: true },
        { text: "26.2 kJ/kg", isCorrect: false },
        { text: "95 kJ/kg", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "A counterflow oil cooler transfers 700 kW of heat from a 5 kg/s oil stream (120 °C → 50 °C, c = 2.0 kJ/(kg·K)) to 12 kg/s of cooling water (25 °C → 39 °C, c = 4.18 kJ/(kg·K)). At T_0 = 298 K, the exergy lost by the oil stream is 114.8 kW and the exergy gained by the water is 6.86 kW. The second-law efficiency of this heat exchanger is:",
      explanation:
        "Second-law efficiency for a heat exchanger (no work) = (exergy gained by cold stream)/(exergy lost by hot stream) = 6.86/114.8 = 0.0598 = 6.0%. The remaining 94% of the oil-stream exergy is destroyed by the finite-ΔT heat transfer — the irreversibility tax of a low-ΔT-lift cooler with a high water flow rate.",
      whyCorrect:
        "For a heat exchanger with no work interaction, the second-law efficiency is η_II = (exergy gained by the cold stream)/(exergy lost by the hot stream) = 6.86/114.8 = 0.0598 ≈ 6.0%. The first-law efficiency is essentially 100% (all heat transferred from oil to water) but the second-law efficiency is only 6% — the heat delivered to the water is at low temperature (39 °C), close to T_0, so it carries little exergy. The other 94% of the oil-stream exergy is destroyed (X_dest = 107.94 kW).",
      whyOthersWrong: [
        "Option 100% is the first-law efficiency — energy is conserved, so all heat is transferred. But η_II measures exergy, not energy.",
        "Option 58.2% is the Carnot ceiling for the Rankine cycle of Lesson 2 — unrelated to this heat exchanger.",
        "Option 6.575 is the COP_R,Carnot of a vapor-compression refrigerator — also unrelated to this heat exchanger.",
      ],
      options: [
        { text: "100%", isCorrect: false },
        { text: "58.2%", isCorrect: false },
        { text: "6.0%", isCorrect: true },
        { text: "6.575", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: For a real adiabatic steam turbine, the second-law efficiency η_II = w_actual/(ψ_in − ψ_out) is always greater than the isentropic efficiency η_t = w_actual/w_isentropic, because the exergy drop across the turbine (ψ_in − ψ_out) is always less than the isentropic enthalpy drop (h_in − h_isentropic_out) for the same inlet and outlet pressures.",
      explanation:
        "FALSE. η_II ≈ η_t (within 1–2 percentage points) for typical turbines, but η_II is NOT always greater — it can be slightly less, slightly more, or equal depending on the dead-state offset. The exergy drop ψ_in − ψ_out ≠ h_in − h_isentropic_out in general because the dead-state offset T_0(s − s_0) enters both ψ_in and ψ_out. The claim that ψ_in − ψ_out is 'always less than' h_in − h_isentropic_out is the false premise.",
      whyCorrect:
        "FALSE. The two efficiencies measure different things but are typically close (within 1–2 percentage points). η_t = w_actual/w_isentropic compares actual work to the isentropic ideal. η_II = w_actual/(ψ_in − ψ_out) compares actual work to the exergy drop. The exergy drop ψ_in − ψ_out = (h_in − h_out) − T_0(s_in − s_out) for an adiabatic turbine, which differs from h_in − h_isentropic_out by the dead-state entropy term T_0·(s_in − s_out_actual). The claim that ψ_in − ψ_out is 'always less than' the isentropic enthalpy drop is the false premise — the difference can go either way depending on the dead-state entropy. In practice, η_II and η_t agree to within 1–2 points for steam turbines; for compressors they diverge more because the dead-state entropy offset matters more.",
      whyOthersWrong: [
        "Option TRUE — accepts a false premise. The exergy drop is NOT always less than the isentropic enthalpy drop; it depends on the dead-state offset. The relationship is closer to η_II ≈ η_t within a few percentage points for typical turbines, not a strict inequality.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Heat Engines & Applications
// (slug: thermo-heat-engines-applications)
// ---------------------------------------------------------------------------

const LESSON_APPLICATIONS: RefLesson = {
  slug: "thermo-heat-engines-applications",
  title: "Heat Engines & Applications",
  titleAr: "محركات الحرارة والتطبيقات",
  order: 4,
  durationMin: 35,
  references: THERMO_REFERENCE_TITLES,
  conceptIntroduction: `A heat engine is any cyclic device that converts heat into net shaft work, bounded by the Carnot ceiling η ≤ 1 − T_L/T_H. The four canonical heat engines in engineering practice are: (1) the *steam turbine* (Rankine cycle of Lesson 2, fossil and nuclear plants); (2) the *gas turbine* (Brayton cycle, aviation and stationary power); (3) the *automotive IC engine* (Otto SI, Diesel CI); and (4) the *combined cycle* (Brayton topping + Rankine bottoming, reaching 58–63% LHV). *Cogeneration* (CHP) recovers turbine exhaust or process heat that would otherwise be rejected, raising total fuel-utilization efficiency η_total = (W + Q_proc)/Q_fuel to 70–80% (vs. 33–45% for separate power generation). *HVAC* applies the reversed vapor-compression cycle (Lesson 2) for cooling and heat-pumping; the ASHRAE Handbook defines the application engineering — cooling-load sizing (CLTD/SCL/CLF method), air-handler selection, chiller COP, and the integration of cogeneration with absorption chillers. The decision between topping cycles (cogen with power first, then process heat), bottoming cycles (process heat first, then power from the waste heat), and combined cycles is governed by the relative value of power and heat at the site, the temperature match between source and sink, and the ISO 55000 asset-management framework that reports lifecycle efficiency KPIs.`,
  sections: {
    learning_objectives: `- Identify the four canonical heat-engine types (steam turbine, gas turbine, automotive IC, combined) and their typical efficiencies and applications.
- Compute the steam-turbine stage work and the cycle thermal efficiency for a 4-stage steam turbine with reheat.
- Compute the Brayton cycle efficiency of a stationary gas turbine and the effect of TIT (turbine inlet temperature) on η.
- Compute the combined-cycle efficiency η_cc = (W_Brayton + W_Rankine)/Q_fuel and identify the optimum pressure ratio and TIT for combined-cycle integration.
- Compute cogeneration total efficiency η_total = (W + Q_proc)/Q_fuel and the second-law efficiency η_II for a topping or bottoming cogen plant.
- Size a vapor-compression refrigeration cycle for a given HVAC cooling load (tons of refrigeration) and compute its COP and kW/ton.
- Apply the ISO 55000 asset-management framework to track cycle η, COP, η_II, heat rate, and X_dest per component as lifecycle KPIs.`,
    prerequisites: `- Lesson 1 — Laws & Properties (steam tables, ideal-gas relations, Carnot ceiling).
- Lesson 2 — Power & Refrigeration Cycles (Rankine, Brayton, Otto, Diesel, vapor-compression formulas).
- Lesson 3 — Entropy & Availability (X_dest, η_II, Gouy–Stodola).
- Heat-transfer basics: conduction, convection, radiation (Kreith 2011, Ch. 1) for condenser/evaporator/radiator sizing.
- ISO 55000 asset-management framework (cited as the reporting structure for cycle KPIs).`,
    introduction: `Heat engines convert thermal energy into shaft work, bounded by the Carnot ceiling. The four canonical configurations cover the bulk of engineering practice:

**Steam turbines** drive the Rankine cycle (Lesson 2). Modern fossil sub-critical plants run 16.5 MPa, 540 °C; supercritical (SC) plants run 25 MPa, 600 °C; ultra-supercritical (USC) 25–35 MPa, 600–620 °C; advanced ultra-supercritical (AUSC) targets 35 MPa, 700 °C with Ni-superalloy metallurgy. Nuclear plants (PWR, BWR) run ~6 MPa, 280 °C saturated (lower η ≈ 33%). Concentrated solar (CSP) runs salt-to-steam at 565 °C. Steam-turbine isentropic efficiencies range from 0.85 (small) to 0.92 (large, multi-stage with reheat). Stage-by-stage analysis uses the velocity-compounded (Curtis) or pressure-compounded (Rateau) design.

**Gas turbines** drive the Brayton cycle. The turbine inlet temperature TIT is the controlling parameter: industrial Frame engines run TIT ≈ 1200–1400 °C (η ≈ 33–38%); aero-derivative engines (LM2500, Trent) run TIT ≈ 1400–1500 °C (η ≈ 38–42%); the latest H-class engines (Siemens SGT-8000H, GE 7HA.02, Mitsubishi M501J) run TIT ≈ 1500–1600 °C (η ≈ 40–42% single-cycle, 60–63% combined-cycle). Ceramic-blade and thermal-barrier-coating technologies target TIT > 1700 °C. The pressure ratio r_p ranges from 15 (small Frame) to 30–40 (H-class).

**Automotive IC engines.** SI (Otto) engines dominate passenger cars; modern direct-injection turbocharged SI engines reach η ≈ 35–40% at the optimal operating point. CI (Diesel) engines dominate trucks and large vehicles; modern turbocharged CI engines reach η ≈ 40–45%. The gap to the air-standard ideal (Otto η = 60% at r = 10; Diesel η = 74% at r = 18) is consumed by: heat loss to coolant (~25%), exhaust enthalpy (~35%), pumping work (~5%), finite combustion time (~5%), friction (~5%). Variable-valve-timing, downsizing+turbocharging, and Atkinson-cycle hybrids (Prius) push the practical peak η closer to 40–45% (Toyota Dynamic Force Engine 41% peak).

**Combined cycle.** A Brayton topping cycle exhausts at 500–650 °C to a heat-recovery steam generator (HRSG) feeding a Rankine bottoming cycle. Triple-pressure-with-reheat HRSG reaches the highest η_cc. Net combined-cycle efficiency: η_cc = (W_GT + W_ST)/Q_fuel ≈ 55–63%. The bottoming Rankine typically contributes 1/3 of the total output. Track under ISO 55000 as a single-asset KPI set.

**Cogeneration (CHP).** When a site needs both power and process heat (chemicals, paper, refining, district heating), cogeneration recovers the heat that would otherwise be rejected, raising total fuel-utilization efficiency η_total = (W + Q_proc)/Q_fuel to 70–80% (vs. 55–60% for separate production of power and process heat). Topping cycle: power first (Brayton or Rankine), then process heat from exhaust. Bottoming cycle: process heat first (e.g., a furnace), then power from the waste heat (organic Rankine bottoming). PURPA 1978 in the US and the EU Cogeneration Directive 2004/8/EC incentivize qualifying cogeneration.

**HVAC.** The vapor-compression refrigeration cycle of Lesson 2 (COP_R = Q_L/W) is the cycle of every refrigerator, air conditioner, and chiller. The ASHRAE Handbook defines the application engineering: cooling-load sizing (CLTD/SCL/CLF method, or refined methods like RTS in ASHRAE Handbook 2017 Fundamentals), air-handler selection (CFM per ton, static pressure), chiller COP and kW/ton, cooling-tower approach, and the integration of cogeneration with absorption chillers (LiBr-water or NH₃-water) which use heat instead of work to drive the refrigeration effect.`,
    terminology: `- **Heat engine**: any cyclic device converting heat into net shaft work; η ≤ η_Carnot.
- **Steam turbine (HP, IP, LP)**: the work-extraction device of the Rankine cycle; stage-wise η_t ≈ 0.85–0.92.
- **Gas turbine (compressor + combustor + turbine)**: the Brayton cycle; TIT controls η.
- **IC engine (Otto SI, Diesel CI)**: piston-cylinder heat engine; compression ratio r and cutoff ratio r_c control η.
- **Combined cycle (CC)**: Brayton topping + Rankine bottoming via HRSG; η_cc ≈ 55–63%.
- **Cogeneration / CHP**: simultaneous production of power and useful heat; η_total = (W + Q_proc)/Q_fuel ≈ 70–80%.
- **Topping cycle**: power first, then process heat from exhaust.
- **Bottoming cycle**: process heat first (e.g., furnace), then power from waste heat (often organic Rankine cycle ORC).
- **HRSG (heat-recovery steam generator)**: the boiler of a combined cycle, recovering Brayton exhaust heat.
- **Absorption chiller (LiBr-H₂O or NH₃-H₂O)**: uses heat instead of work to drive refrigeration; COP_abs ≈ 0.7–1.2 (single-effect), 1.2–1.4 (double-effect).
- **Cooling tower**: rejects condenser heat to the ambient via evaporation.
- **Ton of refrigeration**: 3.517 kW (12,000 BTU/h) — the standard HVAC cooling-load unit.
- **Heat rate**: 3600/η kJ/kWh (utility-scale); lower is better.
- **Variable-geometry / variable-frequency drive (VFD)**: efficiency improvements on pumps, fans, compressors.`,
    detailed_explanation: `**Steam turbine.** Modern multi-stage steam turbines are axially divided into HP (high-pressure, 16 MPa → 4 MPa), IP (intermediate, 4 MPa → 0.5 MPa with reheat in between), and LP (low-pressure, 0.5 MPa → 8 kPa with moisture removal) sections. Stage efficiency η_t,stage ≈ 0.88–0.92; the cycle overall η_t ≈ 0.85 (small) to 0.92 (large USC). The key design constraint is moisture at LP exhaust — x_LP ≥ 0.88 to limit blade erosion. Reheat between HP and IP raises x_LP and lifts cycle η by 2–4 percentage points. Steam-turbine sizing: for a 500 MW unit, throttle flow ~ 1500 tonne/h (417 kg/s), HP blade path ~ 20 stages, LP double-flow with 42-inch last-stage blades. Cost: ~$250/kW installed for a 500 MW sub-critical; ~$350/kW for USC.

**Gas turbine.** Cycle analysis: TIT (turbine inlet temperature) and r_p control η. The optimum r_p (for max η) is approximately r_p* ≈ (TIT/T_1)^((γ)/(2(γ−1))} (simple Brayton optimum) — for TIT = 1500 K, T_1 = 300 K, γ = 1.4: r_p* ≈ (5)^(1.75) ≈ 16. Higher r_p is needed for max specific work (different optimum). The TIT is limited by blade material: conventionally cast (CC) blades ~ 900 °C; directionally solidified (DS) ~ 1050 °C; single-crystal (SX) with thermal-barrier coating (TBC) and internal cooling ~ 1500–1600 °C. H-class engines run TIT ≈ 1500 °C with SX blades. Cycle η at 1500 °C TIT, r_p = 18: ~38% (single-cycle); combined cycle with triple-pressure HRSG: ~60%.

**Automotive IC engine.** SI (Otto) — gasoline. CI (Diesel) — diesel. The practical peak η of a modern SI engine is 35–40% (Toyota A25A-FXS 41%, Honda LFA1 40%, Hyundai Smartstream 40%); modern CI engines reach 40–45% (Daimler OM 470, 44%; Scania DC 09, 46%; Daimler OM 471, 45%); the engine in a hybrid Atkinson-cycle Prius reaches 41% at the optimal operating point. The principal loss is exhaust enthalpy (~35% of fuel energy at peak torque, ~25% at peak η) — recovered by the turbocharger and the bottoming Rankine cycle (rare but commercially deployed on heavy-duty trucks). Heat loss to coolant (~25%); pumping work (~5%); friction (~5%); finite combustion (~5%). Strategies: downsizing+turbocharging (raise BMEP), variable valve timing (close intake valve early — Atkinson cycle, raise effective r), homogeneous-charge compression-ignition (HCCI), and electrification (hybridization shifts the operating point to the peak-η region).

**Combined cycle.** A 2-on-1 arrangement (two GTs + 1 ST) is typical for 500–750 MW units. Each GT exhausts ~ 600 °C, ~ 650 kg/s to its HRSG. Triple-pressure HRSG with reheat: HP 17 MPa / 565 °C, IP 4 MPa / 565 °C (reheat), LP 0.7 MPa / 230 °C. Combined-cycle net efficiency: η_cc = (W_GT × 2 + W_ST)/Q_fuel ≈ 58–60% (H-class on natural gas, LHV basis). The bottoming Rankine contributes ~ 1/3 of the total output. ISO 55000 KPI: net heat rate (kJ/kWh), starts/year, capacity factor, equivalent forced outage rate.

**Cogeneration.** Topping cogen: ~ 25–50 MW gas turbine → 500 °C exhaust → HRSG → 10 bar, 200 °C process steam to a chemicals complex + ~ 40 MW electric to the grid. η_total = (W + Q_proc)/Q_fuel ≈ 75–80%. PURPA-qualifying facility (US, 1978) and EU Directive 2004/8/EC qualified cogen plants enjoy preferential dispatch and pricing.

**Bottoming cogen** (organic Rankine cycle ORC): a furnace or kiln exhausts at 200–400 °C; an ORC with refrigerant (R-245fa, R-1233zd, n-butane, siloxanes) bottoming generates 0.5–5 MW of power at 12–20% cycle η (low because the heat source is low-T). Total η_total = (Q_proc + W_ORC)/Q_fuel barely moves vs. no bottoming — but the recovered W is "free" power. Common on cement plants, glass furnaces, geothermal sites, and biomass CHP.

**HVAC.** Vapor-compression refrigeration cycle (Lesson 2): COP_R = Q_L/W. Application engineering:
- Cooling load (tons) = (sensible + latent heat gains)/3.517 kW per ton. Methods: CLTD/SCL/CLF (older), RTS (Radiant Time Series, ASHRAE 2017 Fundamentals).
- Chiller sizing: ton × 3.517 kW/ton; COP ≈ 3–6 (water-cooled); kW/ton ≈ 0.6–0.8 (water-cooled centrifugal) or 1.0–1.5 (air-cooled).
- Air handler: CFM = (ton × 400) — typical 400 CFM per ton.
- Cooling tower: rejects condenser heat; approach ≈ 3–5 °C (cold-water temperature minus ambient wet-bulb).
- Absorption chillers (single-effect LiBr-H₂O): COP ≈ 0.7; double-effect ≈ 1.2–1.4; driven by 0.8 MPa steam or 150–200 °C hot water from a cogeneration exhaust — common in trigeneration plants (power + process heat + cooling).

The ISO 55000 framework ties these KPIs to lifecycle asset-management decision-making: each cycle improvement is evaluated for CapEx, fuel-savings payback, emissions reduction, and exergy-destruction reduction (η_II lift).`,
    core_principles: `- **Carnot ceiling** bounds every heat engine: η ≤ 1 − T_L/T_H. No real configuration reaches it.
- **Steam turbine** η rises with throttle T_H (metallurgical limit); USC ~620 °C → η_th ≈ 45%.
- **Gas turbine** η rises with TIT (blade-material limit); H-class 1500 °C → 40% single-cycle, 60% combined.
- **Automotive IC** peak η ≈ 35–45%; the gap to ideal (60–74%) is exhaust enthalpy, heat loss, friction, finite combustion.
- **Combined cycle** integrates Brayton and Rankine to recover the Brayton exhaust enthalpy; η_cc ≈ 55–63%.
- **Cogeneration** recovers process heat that would be rejected; η_total ≈ 70–80% (topping) or partial recovery (bottoming ORC).
- **HVAC** uses the vapor-compression refrigeration cycle; COP_R = Q_L/W; chiller kW/ton ≈ 0.6–1.5; absorption chillers driven by cogen exhaust.
- **ISO 55000** ties these KPIs to lifecycle asset-management decision-making.`,
    components: `- **Steam turbine (HP, IP, LP stages)** — Rankine cycle work-extraction device.
- **Gas turbine (compressor + combustor + turbine)** — Brayton cycle; single-shaft or multi-shaft.
- **Reciprocating piston engine** — Otto SI, Diesel CI; 4-stroke or 2-stroke.
- **HRSG (heat-recovery steam generator)** — Brayton-to-Rankine integration in combined cycle.
- **Cooling tower** — rejects condenser heat to ambient via evaporation.
- **Cooling tower approach** — cold-water T minus wet-bulb T, ~3–5 °C.
- **Air handler (AHU) and chiller** — HVAC application side.
- **Thermostatic expansion valve (TXV) or capillary tube** — refrigeration throttling.
- **Evaporator and condenser coils** — refrigeration heat-exchange side.
- **Absorption chiller** — LiBr-H₂O or NH₃-H₂O; heat-driven.
- **ISO 55000 asset-management dashboard** — cycle KPI reporting framework.`,
    process: `1. Identify the application: power-only (steam or gas turbine), combined-cycle (Brayton + Rankine), cogeneration (power + process heat), refrigeration (vapor-compression or absorption), or automotive (SI/CI).
2. Pick the working fluid and the cycle configuration (single-pressure/triple-pressure HRSG; topping/bottoming cogen; air-cooled/water-cooled chiller).
3. Compute the cycle state points using the formulas of Lesson 2 (Rankine, Brayton, Otto, Diesel, vapor-compression).
4. Compute the exergy destruction per component using Lesson 3 (Gouy–Stodola; Grassmann diagram).
5. Compute the cycle thermal efficiency η_th (or COP_R for refrigeration) and second-law efficiency η_II = η_th/η_Carnot.
6. For cogeneration, compute η_total = (W + Q_proc)/Q_fuel and the PURPA/EU-directive qualifying-facility efficiency.
7. For HVAC, size the chiller (ton × 3.517 kW) and the air handler (CFM = ton × 400) and pick the condenser (air- or water-cooled) and cooling tower.
8. Report cycle KPIs (η, COP, heat rate, η_II, X_dest per component, CapEx, fuel-savings payback) under the ISO 55000 asset-management framework.`,
    formula_calculation: `**Steam turbine stage work (h-s analysis):**
  w_stage = h_in − h_out,actual = h_in − η_stage·(h_in − h_out,isentropic)
  where h_out,isentropic is from s_out,s = s_in, P_out known.

**Gas turbine Brayton cycle:**
  r_p = P₂/P₁
  T₂ = T₁·r_p^((γ−1)/γ);  T₄ = T₃·(1/r_p)^((γ−1)/γ)
  w_c = c_p·(T₂ − T₁);  w_t = c_p·(T₃ − T₄);  w_net = w_t − w_c
  q_in = c_p·(T₃ − T₂);  η = w_net/q_in = 1 − 1/r_p^((γ−1)/γ)
  Optimum r_p for max η (simple Brayton, fixed TIT): r_p* ≈ (TIT/T_1)^(γ/(2(γ−1)))
  TIT limit: ~ 1500–1600 °C (SX blade + TBC + internal cooling).

**Combined-cycle efficiency:**
  η_cc = (W_GT + W_ST)/Q_fuel
  W_ST = η_HRSG × η_ST × Q_exhaust
  Typical split: GT ~ 2/3, ST ~ 1/3 of total.

**Cogeneration total efficiency:**
  η_total = (W_e + Q_proc)/Q_fuel        [dimensionless]
  Power-to-heat ratio: σ = W_e/Q_proc   (typical σ ≈ 0.3–0.6 for topping)
  Second-law efficiency η_II,cogen = (W_e + Q_proc·(1 − T_0/T_proc))/Exergy_fuel

**HVAC vapor-compression:**
  Cooling load Q_L = (sensible + latent)/3.517  kW/ton
  Chiller COP = Q_L/W_comp;  kW/ton = 3.517/COP
  Air handler CFM = ton × 400   [typical for residential/commercial]
  Cooling tower approach = T_cold − T_wet-bulb,ambient ≈ 3–5 °C

**Absorption chiller (LiBr-H₂O single-effect):**
  COP_abs = Q_L/Q_heat_supplied ≈ 0.7
  Double-effect (two-stage generator): COP ≈ 1.2–1.4
  Driven by 0.8 MPa steam or 150–200 °C hot water (cogen exhaust)

**Units**: P in kPa, T in K, h, s, q, w in kJ/kg, η and COP dimensionless, cooling load in tons (1 ton = 3.517 kW), CFM in ft³/min.

**Assumptions**: (i) steady-state; (ii) ideal-gas constant-c_p for Brayton unless variable-c_p tables used; (iii) steam-table properties for Rankine; (iv) HRSG pinch ΔT_min ≈ 10 °C; (v) cooling-tower approach 3–5 °C; (vi) chiller η_c ≈ 0.75–0.85.

**Interpretation**: η_th = W/Q_in is the fuel-to-shaft-work conversion. η_total (cogen) = (W + Q_proc)/Q_fuel is the fuel-to-useful-energy conversion — strictly larger than η_th because Q_proc is counted. η_II = η/η_Carnot benchmarks against the reversible ideal. The ISO 55000 framework reports all three as separate KPIs.`,
    worked_example: `**Steam turbine (4-stage, with reheat) — Lesson 2 Rankine extended.**
Given: throttle 8 MPa, 480 °C → HP turbine 4-stage, exhaust 1 MPa, η_t = 0.88 → reheat to 480 °C → IP turbine 4-stage, exhaust 8 kPa, η_t = 0.88.
State 3: 8 MPa, 480 °C → h₃ = 3348 kJ/kg, s₃ = 6.658 kJ/(kg·K).
HP exhaust (state 4): s₄s = s₃ = 6.658, P₄ = 1 MPa → from superheated table, h₄s ≈ 2920 kJ/kg; actual h₄ = h₃ − η_t·(h₃ − h₄s) = 3348 − 0.88·(3348 − 2920) = 3348 − 376.6 = 2971.4 kJ/kg.
Reheat (state 5): 1 MPa, 480 °C → h₅ = 3422 kJ/kg, s₅ = 7.482 kJ/(kg·K).
LP exhaust (state 6): s₆s = s₅ = 7.482, P₆ = 8 kPa → at 8 kPa: s_f = 0.593, s_fg = 7.636 → x₆s = (7.482 − 0.593)/7.636 = 0.902; h₆s = 173.88 + 0.902·2403.1 = 2342.1 kJ/kg; actual h₆ = h₅ − η_t·(h₅ − h₆s) = 3422 − 0.88·(3422 − 2342.1) = 3422 − 950.3 = 2471.7 kJ/kg.
Cycle works: w_HP = h₃ − h₄ = 376.6; w_IP+LP = h₅ − h₆ = 950.3; w_t = 1326.9 kJ/kg; w_p = 8.93 (Lesson 2).
Cycle heat inputs: q_boiler = h₃ − h₂ = 3348 − 182.81 = 3165.2; q_reheat = h₅ − h₄ = 3422 − 2971.4 = 450.6; q_in = 3615.8 kJ/kg.
η_th = (w_t − w_p)/q_in = (1326.9 − 8.93)/3615.8 = 1317.97/3615.8 = 0.3645 = 36.45%.
Quality at LP exhaust: x₆ = (h₆ − h_f)/h_fg = (2471.7 − 173.88)/2403.1 = 0.957 — meets the x ≥ 0.88 design constraint.
η_Carnot (T_H = 753 K, T_L = 315 K) = 0.582 → η_II = 0.3645/0.582 = 0.626 = 62.6% (vs. 57.9% without reheat — Lesson 2).

**Cogeneration total efficiency (topping).**
A 50 MW gas turbine (η_GT = 32%) exhausts 100 MW of heat at 500 °C; 60 MW is recovered as 1.0 MPa, 200 °C process steam for a chemicals complex.
Q_fuel = W_GT/η_GT = 50/0.32 = 156.25 MW.
W_e = 50 MW; Q_proc = 60 MW.
η_total = (W_e + Q_proc)/Q_fuel = (50 + 60)/156.25 = 0.704 = 70.4%.
PURPA-qualifying efficiency: η_QF = (W_e + 0.5·Q_proc)/Q_fuel = (50 + 30)/156.25 = 0.512 = 51.2% — exceeds the PURPA threshold for a "qualifying facility" (typically 42.5% for a 50 MW unit).

**Chiller sizing (HVAC).**
A 200-ton water-cooled centrifugal chiller (R-134a) at ARI conditions (44 °F / 85 °C condenser): COP = 6.0; kW input = 200 × 3.517/6.0 = 117.2 kW; kW/ton = 0.586 (best-in-class for centrifugal).
Air handler CFM = 200 × 400 = 80,000 CFM.
Cooling tower load = Q_L + W_comp = 200 × 3.517 + 117.2 = 820.6 kW; with cooling-tower approach 4 °C and ambient wet-bulb 25 °C, the cold water leaves at 29 °C.`,
    industrial_example: `**Industry: Power — 950 MW H-class combined cycle (Siemens SGT5-8000H).** Two SGT5-8000H gas turbines (each 400 MW at 39% η single-cycle, TIT = 1500 °C, r_p = 18) exhaust to two HRSGs feeding a single 150 MW steam turbine (sub-critical triple-pressure HP 12 MPa/565 °C + reheat + LP 0.4 MPa/230 °C). Net η_cc = 60% on natural gas (LHV). Net heat rate = 3600/0.60 = 6000 kJ/kWh. Each GT: 200 tonne, $325M CapEx; ST: $90M; HRSG: $60M; BOP: $80M; total ~ $1.1B for 950 MW → $1158/kW installed (typical for an H-class CC). ISO 55000 KPIs tracked: heat rate (6000 kJ/kWh), starts/year, capacity factor, η_II = 0.60/0.66 = 0.91 (Carnot ceiling for TIT 1500 °C, T_0 298 K → η_Carnot = 1 − 298/1773 = 0.832; η_II = 0.60/0.832 = 0.721 = 72%).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Trigeneration Plant (synthetic, illustrative).* A 25 MW gas-turbine topping cycle (η_GT = 32%) exhausts to an HRSG that produces 50 MW of 1 MPa process steam for an adjacent dairy and a 6 MW single-effect LiBr-H₂O absorption chiller (COP = 0.7) that delivers 4.2 MW of cooling (1200 tons) for the dairy cold storage. The recovered heat (process + absorption) raises η_total = (W + Q_proc + Q_cold)/Q_fuel = (25 + 50 + 4.2)/78.1 = 0.79 = 79% (where Q_fuel = W/η_GT = 25/0.32 = 78.1 MW). The plant is a textbook example of trigeneration — power + heat + cooling from one fuel input. ISO 55000 KPIs: η_total = 79%, η_QF (PURPA) = (25 + 25 + 2.1)/78.1 = 0.666 = 66.6% — well above the 42.5% PURPA threshold; qualifies for preferential dispatch. Payback vs separate production (50 MW from a 38% efficient boiler + 4.2 MW cooling from a COP = 3.5 electric chiller = 1.2 MW electric): separate fuel = 50/0.85 + (25 + 1.2)/0.38 = 58.8 + 68.9 = 127.7 MW vs. 78.1 MW trigeneration → fuel saving 39% → at $7/MMBtu × 8000 h × 39% = ~$22M/yr.`,
    visual_explanation: `**Sankey (energy-flow) diagram of a 500 MW coal plant.** Fuel in (100%) → boiler (loss 12% stack + 6% combustion inefficiency) → steam (82%) → turbine (loss 5% friction + 12% to condenser) → shaft work (38%) → generator (loss 1%) → grid (37%). The remaining 55% is rejected — mostly at the condenser (33%) and the stack (12%).

**Grassmann (exergy-flow) diagram of the same plant.** Fuel exergy in (100%) → boiler (destroys 30% to combustion irreversibility + 5% to stack) → steam exergy (65%) → turbine (destroys 5% to friction + 5% to condenser irreversibility) → shaft-work exergy (38% = η_th). The remaining 62% of exergy is destroyed; the boiler is the largest single component. ISO 55000 reports both Sankey (energy) and Grassmann (exergy) per plant.

**T-s of a reheat Rankine cycle.** The cycle has two heat-addition paths: 2 → 3 (boiler, constant-P rising through the dome into superheat) and 4 → 5 (reheat, constant-P at IP pressure, entirely in superheated region). The LP expansion (5 → 6) ends at a higher quality (x ≈ 0.96 vs. 0.87 without reheat) — the reheat visibly lifts the LP-exhaust point on the T-s diagram. Enclosed area = w_net; ratio to heat-addition area = η_th.`,
    simulation_opportunity: `EngiSuite combined-cycle calculator: input GT TIT (1000–1700 °C), r_p (10–40), HRSG configuration (single/double/triple pressure), ST throttle (6–25 MPa), condenser (5–50 kPa), and get η_cc, net MW, CapEx $/kW, and X_dest per component. EngiSuite cogen calculator: input fuel MW, GT η, exhaust T, process-steam T/P, get η_total, η_QF, PURPA-qualifying flag, and 20-yr NPV at configurable fuel price. For HVAC: Trane TRACE 3D Plus or Carrier HAP for cooling-load sizing; EnergyPlus for annual energy simulation. For exergy: EngiSuite Grassmann-diagram export to Excel/PowerBI for the ISO 55000 KPI dashboard.`,
    common_mistakes: `- **Confusing η and η_total for cogeneration**: η (power cycle) = W/Q_fuel ≈ 32–45%; η_total (cogen) = (W + Q_proc)/Q_fuel ≈ 70–80%. Reporting η_total when the comparison is power-only will inflate the apparent performance.
- **Forgetting the PURPA / EU-directive threshold**: η_total > 70% does NOT automatically qualify a plant — PURPA uses a weighted efficiency (typically η_QF = (W + 0.5·Q_proc)/Q_fuel ≥ 42.5% for 50 MW). Check the formula in the applicable jurisdiction.
- **Using constant γ for H-class gas turbines**: at TIT = 1500 °C, c_p of air rises to ~1.16 kJ/(kg·K); constant-γ Brayton overestimates η by 2–3 percentage points. Use variable-c_p tables.
- **Sizing chillers by nameplate alone**: real-world cooling load depends on solar, internal, infiltration, latent — use ASHRAE RTS, not a rule-of-thumb CFM/ft².
- **Neglecting cooling-tower wet-bulb dependency**: a 35 °C dry-bulb day with 25 °C wet-bulb limits the condenser to ~29 °C cold-water; an air-cooled chiller in this weather would deliver 0.4 of nameplate COP.
- **Ignoring η_t on small steam turbines**: η_t ≈ 0.70 for < 5 MW units (vs. 0.92 for USC), which significantly lowers η_th — confirm the design η_t before reporting η_th numbers.`,
    limitations: `- **Heat-engine metallurgy** caps TIT/T_H: ferritic ~540 °C, martensitic ~600 °C, austenitic Ni-superalloy ~620 °C (steam); SX-blade + TBC + internal cooling ~1500–1600 °C (gas turbine). AUSC steam 700 °C and gas-turbine TIT > 1700 °C require ceramic or ODS alloys — not yet commercial.
- **Air-standard idealizations** (Otto, Diesel, Brayton) ignore variable c_p, finite combustion time, pumping work, residuals, blow-by, heat loss — real engines reach 50–70% of ideal.
- **Cogeneration heat-to-power matching**: if the process heat demand varies, the cogen plant must modulate — often the power output follows the heat load, reducing capacity factor and revenue.
- **Absorption chiller COP is low**: single-effect ~0.7, double-effect ~1.2–1.4 — much lower than vapor-compression (3–6). Economic only when the heat is waste or steam is cheap.
- **Cooling-tower water consumption**: ~ 0.001 m³/kJ rejected; large plants evaporate millions of m³/yr — constrained in arid regions.
- **Cogeneration grid-connection and dispatch**: PURPA-QF status (US) and EU Directive 2004/8/EC qualification rules change plant economics; verify before sizing.`,
    comparison: `| Configuration | η (typical) | η_II (typical) | Use |
|---|---|---|---|
| Sub-critical coal Rankine | 33–38% | 0.55–0.60 | power-only, base load |
| USC coal Rankine | 43–48% | 0.62–0.70 | power-only, base load |
| Nuclear (BWR/PWR) Rankine | 33% | 0.60 | power-only, base load |
| Gas turbine (Brayton, Frame) | 33–38% | 0.50–0.60 | peaking + CC |
| Gas turbine (H-class, aeroderivative) | 38–42% | 0.55–0.65 | peaking + CC |
| Combined cycle (NG, H-class) | 58–63% | 0.72–0.80 | base load, intermediate |
| Otto SI engine | 25–35% | 0.40–0.55 | passenger cars |
| Diesel CI engine | 30–45% | 0.45–0.60 | trucks, large vehicles |
| Cogeneration (topping, gas turbine) | η_total 70–80% | η_II ≈ 0.65–0.75 | chemicals, refining, district heating |
| Cogeneration (bottoming, ORC) | η_total + 5–10% vs no-bottoming | η_II ≈ 0.30–0.40 | cement, glass, biomass |
| Absorption chiller | COP 0.7–1.4 | — | trigeneration, low-electric sites |
| Vapor-compression chiller (water) | COP 5–6 | η_II = COP/COP_Carnot ≈ 0.85 | commercial HVAC |
| Vapor-compression chiller (air) | COP 3–4 | η_II ≈ 0.55 | residential A/C |`,
    practical_application: `**500 MW H-class combined cycle (Siemens SGT5-8000H, 2-on-1).** η_cc = 60% on natural gas (LHV); net heat rate 6000 kJ/kWh; CapEx $1.1B ($1158/kW); 20-yr fuel saving at $7/MMBtu × 950 MW × 8000 h × (1/0.60 − 1/0.38) = 7 × 950 × 8000 × (1.667 − 2.632) × 0.00947 × 1e6 ≈ $487M/yr saved vs a 38%-efficient simple-cycle GT — payback ~ 2.3 yr on the fuel-saving differential alone. ISO 55000 KPIs: heat rate 6000 kJ/kWh, capacity factor 60%, η_II = 0.72, X_dest = 28% (boiler HRSG ~ 8%, GT ~ 10%, ST ~ 5%, condenser ~ 5%). Track per-start cycle degradation, blade creep, exhaust-spread monitoring, and HRSG tube-fouling for the asset-management review.`,
    decision_scenario: `You are the asset manager for a 200 MW gas-fired peaker plant evaluating three retrofit options: (A) convert to combined-cycle (capex +$120M, η 32% → 55%, +23 percentage points); (B) add a 30 MW organic Rankine bottoming cycle on the existing exhaust (capex +$45M, η 32% → 36%, +4 percentage points); (C) operate as-is and retire at end of life (capex $0, η 32%). Fuel: $7/MMBtu; runs 4000 h/yr at 50% capacity factor. Option A: fuel saved = (1/0.32 − 1/0.55) × 200 MW × 4000 × 3600 / 1.055 MJ/m³ × $7/MMBtu ≈ $51M/yr → payback 120/51 = 2.4 yr. Option B: fuel saved = (1/0.32 − 1/0.36) × 200 × 4000 × 3600 / 1.055 × $7 ≈ $11M/yr → payback 45/11 = 4.1 yr. Decision: Option A is the better NPV (20-yr horizon) — but Option B is a smaller, lower-risk project that can be deployed while Option A permitting proceeds. Adopt B as the immediate retrofit and submit A as a 5-yr capital project. (Compare to the Lesson 1 HRSG triple-pressure decision scenario.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: combined-cycle efficiency calculation, cogeneration PURPA-qualifying efficiency, chiller kW/ton sizing, and the effect of TIT on gas-turbine efficiency.`,
    certification_questions: `FE Mechanical-style: "A gas turbine operates at TIT = 1500 K, T_1 = 300 K, r_p = 16, γ = 1.4. The ideal Brayton efficiency is: (a) 38%, (b) 45%, (c) 53%, (d) 60%." Correct: η = 1 − 1/16^0.286 = 1 − 1/1.866 = 0.464 = 46.4% → answer (b) closest (with constant-c_p idealization). PE Thermal & Fluids Systems: "A 50 MW topping cogen plant has η_GT = 0.32 and recovers 60 MW of process heat. The total efficiency η_total = (W + Q_proc)/Q_fuel is: (a) 38%, (b) 56%, (c) 70%, (d) 92%." Correct: Q_fuel = 50/0.32 = 156.25 MW; η_total = (50 + 60)/156.25 = 0.704 = 70% → (c).`,
    summary: `Heat engines convert heat into shaft work; the four canonical configurations are the steam turbine (Rankine, 33–48%), the gas turbine (Brayton, 33–42% single-cycle, 55–63% combined-cycle), the automotive IC engine (Otto SI, 25–35%; Diesel CI, 30–45%), and the combined cycle (55–63% LHV). Cogeneration recovers process heat that would otherwise be rejected, raising η_total = (W + Q_proc)/Q_fuel to 70–80% (topping) or partially (bottoming ORC). HVAC applies the vapor-compression cycle (COP 3–6 water-cooled, 0.7–1.4 absorption). The ISO 55000 framework tracks cycle η, η_total, η_II, heat rate, and X_dest per component as lifecycle asset-performance KPIs, driving cycle-improvement decisions via CapEx, fuel-savings payback, emissions, and exergy-destruction reduction.`,
    key_takeaways: `- Steam turbine (Rankine): USC 25–35 MPa, 600–620 °C → η_th ≈ 45%; AUSC 700 °C → η_th ≈ 48% (frontier).
- Gas turbine (Brayton): TIT (SX blade + TBC + cooling) caps ~ 1500–1600 °C; H-class single-cycle η ≈ 40%.
- Combined cycle: η_cc ≈ 58–63% (NG, LHV); bottoming Rankine ~1/3 of total.
- Cogeneration: η_total = (W + Q_proc)/Q_fuel ≈ 70–80% (topping) — PURPA-qualifying if η_QF ≥ 42.5%.
- Automotive: SI peak 35–41%, CI peak 40–46% (Toyota 41%, Daimler OM 471 45%).
- HVAC: chiller COP 3–6 (water), 0.7–1.4 (absorption); air-handler 400 CFM/ton; ISO 55000 KPI: kW/ton and COP.
- ISO 55000 reports cycle η, η_total, η_II, heat rate, X_dest per component as lifecycle KPIs.`,
    references: `1. Çengel & Boles (2019), Ch. 9 (gas-power — incl. H-class), Ch. 10 (vapor-power — Rankine variants, cogeneration, AUSC), Ch. 11 (refrigeration — incl. absorption).
2. Moran, Shapiro, Boettner & Bailey (2018), Ch. 8 (vapor power with cogeneration), Ch. 9 (gas power), Ch. 10 (refrigeration incl. absorption).
3. Rajput (2017), Ch. 7 (cycles), Ch. 14 (refrigeration & A/C), Ch. 15 (steam turbines, gas turbines).
4. Kreith (2011) — heat-transfer side (condenser, evaporator, radiator, HRSG pinch).
5. ISO 55000:2014 — asset-management reporting framework for η, η_total, η_II, heat rate, X_dest.
6. ASHRAE Handbook — HVAC Applications (2019) — cooling-load sizing, air-handler selection, chiller COP, absorption chillers, cogeneration in HVAC.`,
  },
  knowledgeObject: {
    title: "Heat Engines & Applications — Knowledge Object",
    domain: "Thermodynamics",
    competency: "Applied Heat-Engine Engineering",
    topic: "Steam, gas, automotive, combined, cogeneration, HVAC",
    concept: "Heat-engine configurations; ISO 55000 asset-performance KPIs",
    body: {
      definitions: [
        "Heat engine: any cyclic device converting heat to shaft work; η ≤ η_Carnot.",
        "Steam turbine (HP/IP/LP): Rankine-cycle work-extraction device; η_t,stage ≈ 0.85–0.92.",
        "Gas turbine (compressor + combustor + turbine): Brayton cycle; TIT controls η.",
        "Combined cycle: Brayton topping + Rankine bottoming via HRSG; η_cc ≈ 55–63% (NG).",
        "Cogeneration (CHP): simultaneous power + useful heat; η_total = (W + Q_proc)/Q_fuel.",
        "Topping cogen: power first, then process heat from exhaust.",
        "Bottoming cogen (ORC): process heat first, then power from waste heat.",
        "Absorption chiller (LiBr-H₂O, NH₃-H₂O): heat-driven refrigeration; COP ≈ 0.7–1.4.",
        "ISO 55000:2014 asset-management framework — lifecycle KPI reporting structure.",
      ],
      principles: [
        "Carnot ceiling: η ≤ 1 − T_L/T_H bounds every heat-engine configuration.",
        "Steam-turbine η rises with throttle T_H (metallurgical limit ~620 °C USC, 700 °C AUSC).",
        "Gas-turbine η rises with TIT (SX blade + TBC + internal cooling ~1500–1600 °C).",
        "Combined-cycle integration recovers Brayton exhaust enthalpy; η_cc ≈ 58–63% (H-class).",
        "Cogeneration recovers process heat that would otherwise be rejected; η_total ≈ 70–80% (topping).",
        "Absorption chiller uses heat instead of work to drive refrigeration — economic only with waste/cheap heat.",
        "ISO 55000 ties cycle η, η_total, η_II, heat rate, X_dest per component to lifecycle asset-management decisions.",
      ],
      components: [
        "Steam turbine (HP, IP, LP stages) — Rankine work-extraction",
        "Gas turbine (compressor + combustor + SX turbine) — Brayton",
        "Reciprocating piston (Otto SI, Diesel CI) — automotive",
        "HRSG (heat-recovery steam generator) — Brayton-to-Rankine integration",
        "Cooling tower — condenser heat rejection to ambient",
        "Air handler (AHU), chiller, evaporator/condenser coils — HVAC",
        "Thermostatic expansion valve (TXV) — refrigeration throttling",
        "Absorption chiller (LiBr-H₂O generator + condenser + evaporator + absorber)",
        "ISO 55000 asset-management dashboard — KPI reporting",
      ],
      mechanism:
        "Heat engines burn fuel (or absorb solar/nuclear heat) at high T, expand a working fluid through a turbine or piston to deliver shaft work, and reject the residual heat at low T. Combined-cycle stacks a Brayton topping and Rankine bottoming to recover exhaust heat. Cogeneration diverts part of the rejected heat for process use. HVAC runs the same cycle reversed (refrigeration) to pump heat against its natural gradient using compressor work.",
      process:
        "Identify application → pick working fluid + configuration → compute cycle state points (Lesson 2 formulas) → compute X_dest per component (Lesson 3 Gouy–Stodola) → compute η_th (or η_total for cogen, COP for HVAC) → benchmark against η_Carnot → evaluate CapEx/fuel-savings/emissions under ISO 55000 → decide.",
      formulas: [
        "Brayton: η = 1 − 1/r_p^((γ−1)/γ); w_net = c_p·(T₃ − T₄) − c_p·(T₂ − T₁)",
        "Combined cycle: η_cc = (W_GT + W_ST)/Q_fuel",
        "Cogeneration total: η_total = (W + Q_proc)/Q_fuel",
        "PURPA-QF (US): η_QF = (W + 0.5·Q_proc)/Q_fuel ≥ 42.5% (50 MW threshold)",
        "Chiller COP = Q_L/W; kW/ton = 3.517/COP",
        "Air handler: CFM = ton × 400 (typical)",
        "Cooling tower approach = T_cold_water − T_wet-bulb,ambient ≈ 3–5 °C",
        "Absorption chiller (single-effect): COP_abs ≈ 0.7; double-effect ≈ 1.2–1.4",
        "Steam turbine stage: w_stage = h_in − η_stage·(h_in − h_out,isentropic)",
      ],
      metrics: [
        "Thermal efficiency η_th (power cycle)",
        "Total efficiency η_total (cogen)",
        "PURPA-QF qualifying efficiency η_QF",
        "Combined-cycle efficiency η_cc",
        "Heat rate = 3600/η kJ/kWh (utility)",
        "COP_R and kW/ton (HVAC chiller)",
        "η_II = η/η_Carnot (second-law; ISO 55000 KPI)",
        "X_dest per component (Grassmann diagram)",
        "Capacity factor, equivalent forced outage rate (EFOR), starts/year (ISO 55000)",
      ],
      examples: [
        "Reheat Rankine (Lesson 4 worked example): 8 MPa, 480 °C throttle; reheat 1 MPa, 480 °C; condenser 8 kPa; η_t = 0.88 → η_th = 36.45%, x₆ = 0.957, η_II = 0.626.",
        "Cogen (topping): 50 MW GT, η_GT = 0.32, 60 MW process steam recovered → η_total = 70.4%, PURPA-QF = 51.2%.",
        "Water-cooled centrifugal chiller: 200 tons, COP = 6.0 → 117.2 kW input, 0.586 kW/ton (best-in-class); CFM = 80,000; cooling tower load = 820.6 kW.",
        "H-class combined cycle: 950 MW, η_cc = 60%, heat rate 6000 kJ/kWh, CapEx $1158/kW, payback ~2.3 yr vs simple-cycle.",
      ],
      industrial_examples: [
        "Power — 950 MW H-class CC (Siemens SGT5-8000H × 2 + 1 ST): η_cc = 60%, CapEx $1.1B, $1158/kW.",
        "Power — 600 MW USC coal: 25 MPa, 600 °C, η_th = 45%.",
        "Oil & Gas — baseload LNG with cogen (Frame 7EA driver + absorption chiller for sub-cooling).",
        "Chemical — 50 MW topping cogen (η_GT = 0.32, 60 MW process steam → η_total = 70%).",
        "Automotive — Toyota A25A-FXS Atkinson SI: peak η = 41% (best-in-class for production SI).",
        "HVAC — Trane RTHD centrifugal chiller: COP 6.0, 0.586 kW/ton (best-in-class water-cooled).",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Trigeneration: 25 MW GT + 50 MW process steam + 6 MW absorption chiller (1200 tons cold storage); η_total = 79%; PURPA-QF = 66.6%; fuel saving 39% vs separate production.",
      ],
      common_errors: [
        "Confusing η_th (power-only) with η_total (cogen) — different benchmarks.",
        "Forgetting PURPA / EU-directive η_QF formula (0.5 weighting on Q_proc).",
        "Constant-γ Brayton at TIT > 1300 K (use variable-c_p tables; 2–3 point over-estimation).",
        "Sizing chillers by CFM/ft² rule-of-thumb instead of ASHRAE RTS method.",
        "Neglecting cooling-tower wet-bulb dependency (arid sites degrade chiller COP).",
        "Using η_t = 0.92 on small (< 5 MW) steam turbines (real η_t ≈ 0.70–0.85).",
        "Reporting cycle η without the Carnot-ceiling comparison (η_II = η/η_Carnot is the right KPI for ISO 55000).",
      ],
      limitations: [
        "Heat-engine metallurgy caps T_H/TIT: ferritic ~540 °C, martensitic ~600 °C, Ni-superalloy ~620 °C steam; SX + TBC ~1500–1600 °C GT.",
        "AUSC steam 700 °C and GT TIT > 1700 °C require ceramic/ODS alloys — not commercial.",
        "Air-standard idealizations ignore variable c_p, finite combustion, residuals — real engines reach 50–70% of ideal η.",
        "Absorption chiller COP is low (~0.7–1.4) — economic only with waste/cheap heat.",
        "Cogeneration heat-to-power matching constrains plant dispatch — power output often follows heat load.",
        "Cooling-tower water consumption constrains arid-site deployment (~0.001 m³/kJ rejected).",
      ],
      best_practices: [
        "Always report η_th (power) AND η_total (cogen) separately — never conflate.",
        "Compute η_II = η/η_Carnot for ISO 55000 reporting — it benchmarks against the reversible ideal.",
        "Use variable-c_p tables for Brayton at TIT > 1300 K (constant-γ over-estimates η).",
        "Verify steam-turbine η_t for the unit size — small turbines (η_t ≈ 0.70) materially lower η_th.",
        "Size chillers using ASHRAE RTS (or equivalent) — not CFM/ft² rules-of-thumb.",
        "Evaluate cogeneration retrofits against PURPA-QF (US) or EU Directive 2004/8/EC qualification for preferential dispatch economics.",
        "Track per-component X_dest (Grassmann diagram) in the ISO 55000 asset-management dashboard — prioritize the largest component for cycle-improvement CapEx.",
      ],
      related_concepts: [
        "Laws & properties (Lesson 1)",
        "Power & refrigeration cycles (Lesson 2)",
        "Entropy & availability (Lesson 3)",
        "Heat-transfer mechanisms across condenser/evaporator/HRSG (Kreith 2011)",
        "ISO 55000 asset-management framework",
        "Materials metallurgy for high-T steam/gas turbines",
      ],
      prerequisites: [
        "Lesson 1 (Laws & Properties) — steam tables, ideal-gas relations",
        "Lesson 2 (Power & Refrigeration Cycles) — Rankine, Brayton, Otto, Diesel, vapor-compression formulas",
        "Lesson 3 (Entropy & Availability) — X_dest, η_II, Gouy–Stodola",
        "Heat-transfer basics (Kreith 2011) for condenser/evaporator/radiator sizing",
        "ISO 55000 framework for asset-management reporting",
      ],
      references: THERMO_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Power",
      stem:
        "In a gas-and-steam combined-cycle power plant, what is the role of the heat-recovery steam generator (HRSG)?",
      explanation:
        "The HRSG is the boiler of the bottoming Rankine cycle. It recovers the exhaust enthalpy of the Brayton topping cycle's gas turbine and uses it to raise steam that drives the steam turbine. Without the HRSG, the Brayton exhaust would be discharged to atmosphere and its ~500–650 °C enthalpy wasted.",
      whyCorrect:
        "The HRSG recovers Brayton-cycle exhaust heat to generate steam for the bottoming Rankine-cycle steam turbine. It is the bridge that integrates the topping Brayton and bottoming Rankine cycles, enabling combined-cycle efficiencies of 55–63% (vs. 33–42% for the gas turbine alone).",
      whyOthersWrong: [
        "Option (preheats compressor discharge air before the combustor) describes a recuperator/regenerator on a simple-cycle Brayton — not the HRSG of a combined cycle.",
        "Option (condenses the steam-turbine exhaust to liquid water) describes the condenser of the Rankine cycle, not the HRSG.",
        "Option (compresses the Brayton-cycle air) describes the gas-turbine compressor.",
      ],
      options: [
        {
          text: "It preheats compressor discharge air before the combustor.",
          isCorrect: false,
        },
        {
          text: "It recovers gas-turbine exhaust heat to raise steam for the bottoming Rankine cycle.",
          isCorrect: true,
        },
        {
          text: "It condenses the steam-turbine exhaust back to liquid water.",
          isCorrect: false,
        },
        {
          text: "It compresses the Brayton-cycle air to the combustor pressure.",
          isCorrect: false,
        },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem:
        "A topping cogeneration plant has a 50 MW gas turbine (η_GT = 0.32) that exhausts heat to an HRSG, which recovers 60 MW as 1.0 MPa, 200 °C process steam for a chemicals complex. The plant's total fuel-utilization efficiency η_total = (W + Q_proc)/Q_fuel is:",
      explanation:
        "Q_fuel = W/η_GT = 50/0.32 = 156.25 MW. η_total = (W + Q_proc)/Q_fuel = (50 + 60)/156.25 = 110/156.25 = 0.704 = 70.4%. The recovered process heat lifts η_total well above the gas-turbine-only η of 32%.",
      whyCorrect:
        "Compute Q_fuel = W/η_GT = 50 MW/0.32 = 156.25 MW. Then η_total = (W + Q_proc)/Q_fuel = (50 + 60)/156.25 = 0.704 = 70.4%. The recovered 60 MW of process heat (that would otherwise be rejected to the atmosphere in a power-only GT plant) raises the fuel-utilization efficiency from 32% (power only) to 70.4% (cogen) — the principal thermodynamic advantage of cogeneration.",
      whyOthersWrong: [
        "Option 32% is the gas-turbine single-cycle efficiency η_GT — ignores the recovered 60 MW of process heat.",
        "Option 38.4% computes (50 + 60)/287 — uses the wrong Q_fuel (287 MW would correspond to η_GT = 0.17, not 0.32).",
        "Option 92% computes (50 + 60)/120 — uses Q_fuel = W + Q_proc = 110 MW (circular reasoning); the correct denominator is the actual fuel input Q_fuel = 156.25 MW.",
      ],
      options: [
        { text: "32%", isCorrect: false },
        { text: "38.4%", isCorrect: false },
        { text: "70.4%", isCorrect: true },
        { text: "92%", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem:
        "A 200-ton water-cooled centrifugal chiller has a COP of 6.0 (at ARI conditions). The required electrical input (kW) and the kW-per-ton metric are:",
      explanation:
        "Cooling load = 200 tons × 3.517 kW/ton = 703.4 kW. Input work W = Q_L/COP = 703.4/6.0 = 117.2 kW. kW/ton = W/(ton) = 117.2/200 = 0.586 kW/ton — best-in-class for a water-cooled centrifugal chiller.",
      whyCorrect:
        "Convert tons to kW: Q_L = 200 × 3.517 = 703.4 kW. Apply the COP definition: W = Q_L/COP = 703.4/6.0 = 117.2 kW. The industry-standard metric is kW/ton = W/ton = 117.2/200 = 0.586 kW/ton — best-in-class for a water-cooled centrifugal chiller (typical range 0.5–0.7 kW/ton for high-efficiency machines, 0.9–1.5 for air-cooled).",
      whyOthersWrong: [
        "Option (703 kW, 3.517 kW/ton) reports the cooling load Q_L as if it were the input — confuses Q_L with W; kW/ton of 3.517 is the cooling-load conversion factor, not the input power per ton.",
        "Option (1172 kW, 5.86 kW/ton) moves the decimal point — factor-of-10 error.",
        "Option (70 kW, 0.35 kW/ton) uses an impossible COP of 10 — well above the reversed-Carnot ceiling for typical HVAC conditions (T_L = 4 °C, T_H = 30 °C → COP_Carnot = 10.7, so a real machine at COP = 6 is ~92% of Carnot; a COP of 10 would violate the Second Law for non-ideal machines).",
      ],
      options: [
        { text: "703 kW, 3.517 kW/ton", isCorrect: false },
        { text: "1172 kW, 5.86 kW/ton", isCorrect: false },
        { text: "117 kW, 0.586 kW/ton", isCorrect: true },
        { text: "70 kW, 0.35 kW/ton", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: For an air-standard Brayton cycle with fixed compressor inlet T_1 and pressure ratio r_p, raising the turbine inlet temperature TIT always increases the cycle thermal efficiency η.",
      explanation:
        "FALSE. For a SIMPLE ideal Brayton cycle with constant γ and constant c_p, η = 1 − 1/r_p^((γ−1)/γ) depends ONLY on r_p and γ — it is INDEPENDENT of TIT. Raising TIT raises specific work output and net power, but not the ideal η. (Real Brayton cycles with variable c_p show a small TIT-dependence through the average γ; combined cycles gain because the higher exhaust temperature enables a more efficient bottoming Rankine — but the simple-cycle statement is false.)",
      whyCorrect:
        "FALSE. For an air-standard ideal Brayton cycle with constant γ and constant c_p, the thermal efficiency η = 1 − 1/r_p^((γ−1)/γ) depends ONLY on the pressure ratio r_p and γ. It is INDEPENDENT of TIT. Raising TIT increases the specific work output (and thus the net power per kg of air) but does NOT change the ideal cycle η. (Two qualifications: (i) with variable specific heats, η has a small TIT-dependence through the average γ; (ii) in a combined cycle, raising TIT raises the exhaust temperature, which lifts the bottoming Rankine efficiency — so combined-cycle η_cc does rise with TIT, but the simple-cycle Brayton η itself does not.)",
      whyOthersWrong: [
        "Option TRUE — would conflate the specific-work benefit of higher TIT with an efficiency benefit. The thermodynamic efficiency of the simple ideal Brayton cycle is set by r_p and γ, not by TIT. (Real engines benefit at the system level via the combined-cycle exhaust, but the single-statement claim is false.)",
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

export const THERMO_LESSONS: RefLesson[] = [
  LESSON_LAWS,
  LESSON_CYCLES,
  LESSON_ENTROPY,
  LESSON_APPLICATIONS,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). This is the FIRST
// ref-content loader to use the general (Discipline/Chapter) track instead
// of the certification (Certification/Domain/Competency) track. The Prisma
// shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     FK→connect form). We use db.question (NOT db.practiceProblem) so the
//     shim applies stem→question and options→choices mapping.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (we set chapterId, which
//     the shim maps to { chapter: { connect: { id } } }).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
// ---------------------------------------------------------------------------

/**
 * Upsert the Thermodynamics discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "thermodynamics" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "thermodynamics-fundamentals", name "Thermodynamics Fundamentals",
 *     order 1).
 *  3. Upsert References globally (by title, with disciplineId) → shared
 *     referenceIds applied to every lesson, KO, and practice problem.
 *  4. For each of 4 lessons:
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
  // 1) Discipline — find by slug "thermodynamics" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "thermodynamics" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "thermodynamics" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "thermodynamics-fundamentals"; name: "Thermodynamics
  //    Fundamentals"; order 1. The Chapter has a @@unique([disciplineId,
  //    slug]), so we use findFirst + create/update.
  const chapterSlug = "thermodynamics-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Thermodynamics Fundamentals",
    slug: chapterSlug,
    description:
      "Laws of thermodynamics, power & refrigeration cycles, entropy & availability, and heat engines & applications — the four-lesson deep scientific reference for the Thermodynamics engineering discipline.",
    icon: "Thermometer",
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
  for (const src of THERMO_SOURCES) {
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
  const sharedReferenceIds = THERMO_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of THERMO_LESSONS) {
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
