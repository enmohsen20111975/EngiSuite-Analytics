// =============================================================================
// Electrical Circuits — Engineering Discipline — Deep scientific reference
// (Task ID: CIRCUITS).
//
// Discipline slug: "electrical-circuits" (seeded by scripts/seed-disciplines.ts).
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts and src/ref-content/fluid-mechanics.ts
// EXACTLY in structure, lifecycle metadata, and the shim conventions of
// src/lib/db.ts:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     FK→connect form). We use db.question so the shim applies the mapping.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise.
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs → connect.
//
// Three lessons (one chapter "Electrical Circuits Fundamentals"):
//   1. DC Circuit Analysis                (slug: circuits-dc-analysis)
//   2. AC Circuit Analysis                (slug: circuits-ac-analysis)
//   3. Transient Analysis & Network Theorems (slug: circuits-transients-theorems)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional electrical-circuits content.
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
// Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
//   - LEVEL 6 — University / Academic Publications: Alexander & Sadiku,
//     "Fundamentals of Electric Circuits" (McGraw-Hill, 6th ed., 2017);
//     Nilsson & Riedel, "Electric Circuits" (Pearson, 10th ed., 2015).
//   - LEVEL 7 — Technical Publications / Industry Sources: Hayt, Kemmerly &
//     Durbin, "Engineering Circuit Analysis" (McGraw-Hill, 8th ed., 2012);
//     Boylestad, "Introductory Circuit Analysis" (Pearson, 13th ed., 2016).
//   - LEVEL 2 — Official Standard / Standards Organization: IEEE Std 141-1993
//     ("Red Book") — Recommended Practice for Electric Power Distribution for
//     Industrial Plants, cited for industrial DC/AC substation conventions.
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline:
//     NFPA 70 (National Electrical Code, 2023 ed.) — the canonical U.S.
//     electrical-installation code referenced for conductor ampacity,
//     grounding, and branch-circuit sizing in Lessons 1–3.
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
// Public types (mirror thermodynamics.ts)
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
// SOURCES — 6 real references cited across all electrical-circuits lessons.
// ---------------------------------------------------------------------------

export const CIRCUITS_SOURCES: RefSource[] = [
  {
    title:
      "Alexander & Sadiku — Fundamentals of Electric Circuits (McGraw-Hill, 6th ed., 2017)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Alexander, C. K., & Sadiku, M. N. O. (2017). Fundamentals of Electric Circuits (6th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-802822-9. Chapters 1 (Basic Concepts — charge, current, voltage, power, energy, passive sign convention), 2 (Basic Laws — Ohm's law V=IR, nodes/branches/loops, KCL, KVL, series/parallel reduction, voltage/current dividers, Δ–Y transformation), 3 (Methods of Analysis — node-voltage and mesh-current methods, Cramer's rule), 4 (Circuit Theorems — linearity, superposition, source transformation, Thévenin's & Norton's theorems, maximum power transfer), 6 (Capacitors & Inductors), 7 (First-Order Circuits — RC/RL transients, τ=RC and τ=L/R, step & natural response), 9 (Sinusoids & Phasors — Steinmetz phasor transform, impedance Z=R+jωL+1/(jωC)), 10 (Sinusoidal Steady-State Analysis), 11 (AC Power Analysis — instantaneous/average/real/reactive/apparent power, power factor, complex power S=P+jQ, power-factor correction), 12 (Three-Phase Circuits). The canonical undergraduate circuit-analysis textbook used by ABET-accredited EE programs.",
  },
  {
    title:
      "Nilsson & Riedel — Electric Circuits (Pearson, 10th ed., 2015)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Nilsson, J. W., & Riedel, S. A. (2015). Electric Circuits (10th ed.). Upper Saddle River, NJ: Pearson. ISBN 978-0-13-376003-3. Chapters 1 (Circuit Variables — SI units, the passive sign convention, power balance), 2 (Circuit Elements — ideal voltage/current sources, dependent sources, the topology of nodes/loops/meshes), 3 (Resistive Circuits — Ohm's law, KCL, KVL, Δ–Y, Wheatstone bridge), 4 (Techniques of Circuit Analysis — node-voltage, mesh-current, the concept of a supernode/supermesh), 5 (Operational Amplifier — ideal op-amp model), 6 (Inductance, Capacitance & Mutual Inductance), 7 (Response of First-Order RL & RC Circuits — natural/step response, τ=L/R and τ=RC, sequential switching), 8 (Natural & Step Responses of RLC Circuits), 9 (Sinusoidal Steady-State Analysis — phasor transform, impedance, admittance), 10 (Sinusoidal Steady-State Power — RMS, average power, complex power, power-factor correction), 11 (Balanced Three-Phase). Reference for the rigorous node-voltage and mesh-current methods and the first-order transient treatment.",
  },
  {
    title:
      "Hayt, Kemmerly & Durbin — Engineering Circuit Analysis (McGraw-Hill, 8th ed., 2012)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Hayt, W. H., Kemmerly, J. E., & Durbin, S. M. (2012). Engineering Circuit Analysis (8th ed.). New York, NY: McGraw-Hill. ISBN 978-0-07-352957-8. Chapters 1 (Introduction — units, charge, voltage, current, power, the passive sign convention), 2 (Basic Components & Electric Circuits — nodes/paths/loops/meshes, KCL/KVL, the linear resistor), 3 (Voltage & Current Laws — formal KCL/KVL, voltage-division & current-division), 4 (Basic Nodal & Mesh Analysis — node-voltage method, mesh-current method, supernode/supermesh), 5 (Useful Circuit Analysis Techniques — linearity, superposition, source transformation, Thévenin/Norton equivalent, maximum power transfer), 6 (Capacitance & Inductance), 7 (RC & RL First-Order Circuits — modeling, τ=RC, τ=L/R, driving functions, the unit-step), 8 (Higher-Order Circuits), 9 (Sinusoidal Sources & Phasors — Steinmetz phasors, impedance Z=R+j(ωL−1/(ωC))), 10 (Sinusoidal Steady-State Power — RMS, average/real/reactive/apparent power, complex power S=VI*, maximum average power transfer). Practitioner reference emphasizing the rigorous justification of node/mesh analysis from KCL/KVL axioms.",
  },
  {
    title:
      "Boylestad — Introductory Circuit Analysis (Pearson, 13th ed., 2016)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Boylestad, R. L. (2016). Introductory Circuit Analysis (13th ed.). Upper Saddle River, NJ: Pearson. ISBN 978-0-13-392277-4. Chapters 2 (Voltage & Current — atomic structure, conventional vs electron flow), 3 (Resistance — resistivity, temperature coefficient, color code, conductance), 4 (Ohm's Law, Power & Energy — V=IR, P=VI=I²R=V²/R, efficiency), 5 (Series DC Circuits — Kirchhoff's voltage law, voltage divider rule, open/short faults), 6 (Parallel DC Circuits — KCL, current divider rule), 7 (Series-Parallel Networks — Δ–Y/T-π, bridge networks), 8 (Methods of Analysis — branch-current, mesh-current, node-voltage), 9 (Network Theorems — superposition, Thévenin, Norton, maximum power transfer, substitution & Millman), 10 (Capacitors), 11 (Inductors & RL transients — τ=L/R), 12 (Magnetic Circuits), 13 (Sinusoidal AC — generation, definitions, RMS, phase relations), 14 (Phasors & Impedance — Z=R+jX, the sinusoidal steady-state), 15 (AC Series-Parallel Networks), 16 (AC Network Theorems), 19 (Power — AC real/reactive/apparent, PF, PF correction). Reference for the practitioner's worked example style and the bridge-network analysis techniques.",
  },
  {
    title:
      "IEEE Std 141-1993 — IEEE Recommended Practice for Electric Power Distribution for Industrial Plants (IEEE Red Book)",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://standards.ieee.org/ieee/141/684/",
    citation:
      "Institute of Electrical and Electronics Engineers. IEEE Std 141-1993 (Red Book), IEEE Recommended Practice for Electric Power Distribution for Industrial Plants. Piscataway, NJ: IEEE. Chapters 1 (Introduction — scope, industrial distribution system overview), 2 (Load Estimating — demand factor, diversity factor, utilization factor; conductor ampacity at design load), 3 (Voltage Considerations — voltage drop, flicker, voltage regulation; Ohm's law applied to feeder conductor impedance ΔV=I·R+jI·X), 4 (Short-Circuit Calculations — per-unit method, X/R ratio, substation bus Thevenin impedance), 5 (System Grounding — solidly-grounded, low-resistance, high-resistance; DC ground-fault detection in 125 V DC substation batteries), 6 (Protection — device coordination, fuse/breaker current-time curves, KCL at radial taps), 7 (Power Factor Correction — capacitor-bank sizing, leading vs lagging PF, harmonic resonance). Cited in Lessons 1–3 to align DC/AC circuit-analysis methods with industrial substation and distribution practice: the IEEE Red Book is the canonical U.S. industrial power-distribution reference for IEEE-3003-aligned electrical-system engineering.",
  },
  {
    title:
      "NFPA 70 (National Electrical Code, 2023 ed.) — NFPA 70: NEC",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70",
    citation:
      "National Fire Protection Association. NFPA 70, National Electrical Code (NEC), 2023 ed. Quincy, MA: NFPA. ISBN 978-1455925673. Articles 100 (Definitions — ampacity, branch circuit, feeder, service), 110 (Requirements for Electrical Installations — conductor sizing, voltage-drop, workmanship), 200 (Wiring & Protection — grounding & bonding, the equipment-grounding conductor path), 210 (Branch Circuits — 15 A / 20 A / 30 A ratings, receptacle ratings, the 80 % continuous-load rule; Ohm's law drives conductor sizing for I_rms load current), 220 (Branch-Circuit, Feeder & Service Load Calculations — demand factors, neutral-load reduction), 240 (Overcurrent Protection — fuse/breaker rating vs ampacity, the I²t let-through; KCL on the load side of a breaker must equal the upstream service current), 250 (Grounding & Bonding — bonding jumper sizing, ground-fault current path; KCL on the equipment-grounding conductor carries I_fault back to source), 310 (Conductors for General Wiring — ampacity tables, temperature correction, the 75 °C termination rule), 430 (Motors — FLC tables, motor branch-circuit short-circuit & ground-fault protection, the 125 % conductor sizing rule), 460 (Capacitors — PF-correction capacitor installations, discharge-resistor sizing, the RC discharge transient τ=RC of Lesson 3 in practice). Cited throughout as the legal-requirements baseline for every conductor sizing, breaker rating, and grounding design touched on in the worked examples and decision scenarios.",
  },
];

const CIRCUITS_REFERENCE_TITLES = CIRCUITS_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — DC Circuit Analysis
// (slug: circuits-dc-analysis)
// ---------------------------------------------------------------------------

const LESSON_DC: RefLesson = {
  slug: "circuits-dc-analysis",
  title: "DC Circuit Analysis",
  titleAr: "تحليل الدوائر الكهربائية المستمرة",
  order: 1,
  durationMin: 35,
  references: CIRCUITS_REFERENCE_TITLES,
  conceptIntroduction: `Direct-current (DC) circuit analysis is the foundation of all electrical engineering. Three axioms govern every linear resistive circuit: Ohm's law (V=IR, Georg Ohm, 1827), Kirchhoff's current law (KCL: Σ I = 0 at every node, from charge conservation; Gustav Kirchhoff, 1845), and Kirchhoff's voltage law (KVL: Σ V = 0 around every loop, from energy conservation). From these three, two systematic solution methods follow: the *node-voltage method* (write KCL at every independent node, solve for node voltages) and the *mesh-current method* (write KVL around every independent mesh, solve for mesh currents). Linear resistive networks containing independent and dependent sources can always be reduced to a single-frequency *Thévenin equivalent* (Léon Charles Thévenin, 1883) — a single ideal voltage source V_Th in series with a single resistor R_Th — or its dual *Norton equivalent* (Edward Lawry Norton, 1926) — a single ideal current source I_N in parallel with R_N=R_Th. This lesson develops V=IR, KCL/KVL, node/mesh analysis, and the Thévenin/Norton theorems with worked examples (a voltage divider, a three-resistor node-voltage analysis) and the practice-problem set that follows.`,
  sections: {
    learning_objectives: `- State Ohm's law V=IR (and its duals I=V/R, R=V/I) and apply it to compute the third quantity from any two.
- State Kirchhoff's current law (KCL: Σ I_in = Σ I_out at every node) and Kirchhoff's voltage law (KVL: Σ V_rises = Σ V_drops around every closed loop) and justify each from charge and energy conservation.
- Apply the node-voltage method: choose a reference (ground) node, label each independent node, write KCL at every non-reference node, solve the linear system.
- Apply the mesh-current method: identify each independent mesh, assign a mesh current, write KVL around each mesh (Ohm's law on each resistor), solve.
- Apply series/parallel resistor reduction: R_series = R₁+R₂+…; R_parallel = 1/(1/R₁+1/R₂+…); the Δ–Y (T–π) transformation.
- Apply the voltage-divider rule V_out = V_s·R₂/(R₁+R₂) and the current-divider rule I_branch = I_total·R_other/(R₁+R₂).
- Find the Thévenin equivalent (V_Th = open-circuit voltage, R_Th = equivalent resistance seen from the terminals with all independent sources killed) and the Norton equivalent (I_N = short-circuit current, R_N = R_Th).`,
    prerequisites: `- College algebra (linear systems of 2–3 equations), matrix notation, determinants.
- Ohm's law and the definitions of charge (C), current (A = C/s), voltage (V = J/C), power (W = V·A), energy (J = W·s).
- Passive sign convention: current enters the + terminal of a passive element; P=VI > 0 means the element absorbs power.
- Series and parallel reduction of two resistors; the idea of equivalent resistance R_eq.`,
    introduction: `The three axioms of DC circuit analysis were laid down in the 19th century. Georg Ohm published *Die galvanische Kette, mathematisch bearbeitet* in 1827, establishing V = IR for a linear resistor (the proportionality constant R = ρL/A depends on material resistivity ρ and geometry). In 1845 Gustav Kirchhoff, then a 21-year-old student, generalized the two laws that bear his name: KCL (Σ I = 0 at every node — charge is conserved) and KVL (Σ V = 0 around every loop — energy is conserved, since a charge returning to its starting point has the same potential energy). Maxwell's equations later subsumed KCL and KVL as the low-frequency (lumped-element) limit of electromagnetism.

From these axioms two systematic solution methods emerged. The *node-voltage method* writes KCL at every independent node, expressing each branch current via Ohm's law in terms of the node voltages; the result is a linear system A·v = b that any linear-algebra solver dispatches. The *mesh-current method* writes KVL around every independent mesh (a "window" of the planar graph), expressing each resistor voltage in terms of the mesh currents; again, a linear system results. For non-planar networks, the more general *loop-current method* replaces meshes with the fundamental loops of a spanning tree.

The network theorems follow from linearity. *Thévenin's theorem* (1883) states that any linear two-terminal network of sources and resistors is indistinguishable at its terminals from a single ideal voltage source V_Th in series with a single resistor R_Th, where V_Th is the open-circuit voltage and R_Th is the equivalent resistance seen from the terminals with all independent sources killed (voltage sources → short circuits, current sources → open circuits). *Norton's theorem* (1926) is the dual: a single current source I_N = short-circuit current in parallel with R_N = R_Th. *Superposition* says the response to multiple independent sources is the sum of responses to each acting alone. *Maximum power transfer* says a load R_L receives the most power from a Thévenin source when R_L = R_Th, with P_max = V_Th²/(4·R_Th).

This lesson works the DC analysis methods with two examples: (i) a voltage divider computing V_out from V_s, R₁, R₂; (ii) a 3-resistor node-voltage problem with two DC sources and a node tied to ground through one resistor.`,
    terminology: `- **Node**: a point where two or more circuit elements meet; an *essential node* has ≥3 elements.
- **Branch**: a single two-terminal element (or series string) connecting two nodes.
- **Loop**: any closed path through the circuit that visits no node more than once; a *mesh* is a loop that contains no other loop (a "window" of a planar graph).
- **Essential mesh**: a mesh in a planar circuit not containing any other loop.
- **Active element**: an ideal voltage or current source (independent or dependent); a *passive element* (resistor, inductor, capacitor) absorbs power.
- **Independent source**: V_s or I_s is fixed by the source, not by the rest of the circuit; a *dependent* (controlled) source has a value set by a voltage or current elsewhere in the circuit (VCVS, VCCS, CCVS, CCCS).
- **Open circuit**: infinite resistance, I = 0; **short circuit**: zero resistance, V = 0.
- **Ground (reference node)**: the node taken as V = 0, against which all other node voltages are measured.
- **Thévenin equivalent**: V_Th in series with R_Th; **Norton equivalent**: I_N in parallel with R_N=R_Th.
- **Passive sign convention**: current enters the + terminal of an element; P = VI > 0 means absorbed, < 0 means delivered.`,
    detailed_explanation: `**Ohm's law V = IR.** For a linear resistor, the voltage across the terminals is proportional to the current through it; the constant of proportionality is the resistance R = ρL/A (in ohms, Ω). For a 1 kΩ resistor carrying 3 mA, V = 1000 × 0.003 = 3 V. The conductance G = 1/R (siemens, S) is sometimes more convenient.

**Kirchhoff's Current Law (KCL).** At any node, the algebraic sum of currents entering equals the sum leaving — equivalently, Σ I = 0 with currents entering taken positive. This is charge conservation: the node cannot accumulate charge. KCL generalizes to any closed surface (*supernode*): the net current crossing the surface is zero.

**Kirchhoff's Voltage Law (KVL).** Around any closed loop, the algebraic sum of voltages (rises and drops) is zero. This is energy conservation: a unit charge returning to its starting node has the same potential. With the sign convention "voltage rise = +, voltage drop = −", Σ V_loop = 0.

**Node-voltage method.** (1) Pick a reference node (ground). (2) Label the remaining (N−1) essential nodes V₁, …, V_{N−1}. (3) At each non-reference node write KCL, expressing each branch current as (V_node − V_neighbor)/R (or via a source value if the branch is a source). (4) Solve the resulting linear system A·v = b. (5) Back-substitute for any desired branch current. A *supernode* forms when a voltage source connects two non-reference nodes (no resistor in series); the supernode is treated as one composite node, with the additional constraint V_a − V_b = V_source.

**Mesh-current method.** (1) Identify each independent mesh (window) in a planar circuit. (2) Assign a mesh current I_1, …, I_M circulating in each mesh (typically clockwise). (3) Around each mesh write KVL: the sum of voltage drops across the resistors equals the sum of source voltages. For a resistor shared by two meshes, the net current through it is (I_mesh1 − I_mesh2), so the voltage drop is R·(I_mesh1 − I_mesh2). (4) Solve the linear system. A *supermesh* forms when a current source is shared between two meshes; the supermesh is a composite loop with the constraint I_mesh1 − I_mesh2 = I_source.

**Thévenin equivalent.** To find V_Th and R_Th at a pair of terminals a–b: (i) compute V_Th = V_oc (open-circuit voltage at a–b); (ii) compute R_Th by killing all *independent* sources (V→short, I→open; leave dependent sources untouched) and looking into a–b. If dependent sources are present, R_Th = V_test / I_test where V_test is a 1 V source applied at a–b. Norton: I_N = V_Th/R_Th = I_sc (short-circuit current at a–b); R_N = R_Th.

**Voltage & current dividers.** For two series resistors R₁, R₂ across a source V_s: V_R2 = V_s·R₂/(R₁+R₂) (voltage-divider rule). For two parallel resistors R₁, R₂ carrying total current I_t: I_R1 = I_t·R₂/(R₁+R₂), I_R2 = I_t·R₁/(R₁+R₂) (current-divider rule — the *other* resistor appears in the numerator).

**Δ–Y transformation.** A Δ (pi) of three resistors R_a, R_b, R_c between three nodes is equivalent to a Y (T) of R_1, R_2, R_3 sharing the same center, with R_1 = (R_a·R_b)/(R_a+R_b+R_c), etc. Useful for bridge-network reduction.`,
    core_principles: `- **V = IR** — Ohm's law for a linear resistor (the constitutive relation).
- **KCL: Σ I = 0 at every node** — charge conservation; the node cannot accumulate charge.
- **KVL: Σ V = 0 around every loop** — energy conservation; a unit charge returns to its starting potential.
- **Linearity ⇒ superposition**: the response to N independent sources is Σ responses to each acting alone.
- **Thévenin/Norton equivalence**: any linear one-port of sources + resistors reduces to V_Th in series with R_Th (or I_N in parallel with R_N = R_Th).
- **Maximum power transfer**: R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th).
- **Passive sign convention**: current enters the + terminal; P = VI > 0 absorbed, < 0 delivered.`,
    components: `- **Ideal voltage source**: maintains V across its terminals regardless of I (zero internal resistance).
- **Ideal current source**: maintains I through its terminals regardless of V (infinite internal resistance).
- **Linear resistor**: V = IR; power P = I²R = V²/R dissipated as heat.
- **Wire (ideal conductor)**: zero resistance, R = 0, V = 0 across it.
- **Ground (chassis/earth)**: V = 0 reference; the return path for unbalanced currents.
- **Open/short**: open = R = ∞ (I = 0); short = R = 0 (V = 0).
- **Dependent (controlled) source**: VCVS, VCCS, CCVS, CCCS — models transistors, op-amps, sensors.
- **DC substation battery** (industrial): 24 V/48 V/125 V/250 V nominal lead-acid banks for switchgear control and protective relaying (IEEE 141 Ch. 5).`,
    process: `1. Identify all essential nodes and meshes; choose a reference (ground) node.
2. Label each non-reference node V₁, …, V_{N−1} (node-voltage method) OR each mesh I₁, …, I_M (mesh-current method).
3. Apply KCL at every non-reference node (node method) or KVL around every mesh (mesh method), expressing each branch quantity via Ohm's law.
4. For supernodes (voltage source between two non-reference nodes) or supermeshes (current source shared between two meshes), write the composite equation plus the constraint V_a − V_b = V_s or I_a − I_b = I_s.
5. Solve the resulting linear system (substitution, Cramer's rule, or matrix inversion).
6. Back-substitute to obtain any branch current, voltage, or power.
7. Verify: (i) KCL at every node closes to zero; (ii) KVL around every loop closes to zero; (iii) Σ P_source = Σ P_absorbed (power-balance check).
8. For Thévenin: compute V_oc, then R_Th by killing independent sources and looking in; for Norton, compute I_sc and divide.`,
    formula_calculation: `**Ohm's law (linear resistor):**
  V = I·R      [V in V, I in A, R in Ω; or V in V, I in mA, R in kΩ]
  I = V/R      R = V/I

**Power dissipated in a resistor:**
  P = V·I = I²·R = V²/R      [P in W]

**Kirchhoff's laws:**
  KCL: Σ I_in = Σ I_out at every node ⇒ Σ I = 0
  KVL: Σ V_rises = Σ V_drops around every loop ⇒ Σ V = 0

**Series & parallel reduction:**
  R_series = R₁ + R₂ + … + R_n
  R_parallel = 1/(1/R₁ + 1/R₂ + … + 1/R_n)  ;  R_parallel(2) = R₁·R₂/(R₁+R₂)

**Voltage divider (R₁, R₂ in series across V_s):**
  V_R2 = V_s · R₂/(R₁+R₂)     V_R1 = V_s · R₁/(R₁+R₂)

**Current divider (R₁, R₂ in parallel, total current I_t):**
  I_R1 = I_t · R₂/(R₁+R₂)     I_R2 = I_t · R₁/(R₁+R₂)

**Δ–Y transform:**
  R_1 = R_a·R_b/(R_a+R_b+R_c)   (and cyclic permutations)

**Thévenin equivalent:**
  V_Th = V_oc (open-circuit voltage at the load terminals)
  R_Th = R_eq seen from terminals with all independent sources killed
       (V→short, I→open; dependent sources remain)
  R_Th (with dependent sources) = V_test / I_test (test-source method)

**Norton equivalent:**
  I_N = I_sc (short-circuit current at the terminals)
  R_N = R_Th    V_Th = I_N · R_Th

**Maximum power transfer (DC):**
  R_L = R_Th  ⇒  P_L,max = V_Th² / (4·R_Th)

**Assumptions**: (i) linear resistors (R constant, independent of I and T); (ii) lumped-element (no distributed effects — circuit dimensions ≪ λ of any AC component); (iii) steady state (no time variation); (iv) ideal wires (zero resistance); (v) for Thévenin/Norton, the network is *linear* and the load is *not* a controlled source that feeds back into the network.

**Interpretation**: V = IR is the constitutive law; KCL/KVL are the topology axioms. Power-balance (Σ P_source = Σ P_load) is the global energy audit. The Thévenin equivalent tells you the "stiffness" of a source — a low-R_Th source delivers nearly constant voltage to any reasonable load (a "stiff" source); a high-R_Th source droops badly under load.`,
    worked_example: `**Voltage divider.** A 12 V source drives two series resistors R₁ = 4 kΩ and R₂ = 8 kΩ. Find V_out across R₂.
By the voltage-divider rule:
  V_R2 = V_s · R₂/(R₁+R₂) = 12 · 8/(4+8) = 12 · 8/12 = 8.0 V
Cross-check by Ohm's law: I = V_s/(R₁+R₂) = 12/12000 = 1 mA; V_R2 = I·R₂ = 0.001 × 8000 = 8 V. ✓
V_R1 = V_s − V_R2 = 12 − 8 = 4 V (= I·R₁ = 0.001 × 4000). ✓
Power: P_R1 = I²·R₁ = 1e-6 × 4000 = 4 mW; P_R2 = 1e-6 × 8000 = 8 mW; P_source = 12 × 0.001 = 12 mW = 4 + 8. ✓ (power balance)

**Node-voltage analysis (3 resistors, 2 sources).** A node V is connected to +10 V through R₁ = 2 kΩ, to ground through R₂ = 3 kΩ, and to +5 V through R₃ = 4 kΩ. Find V.
KCL at the node: the sum of currents leaving the node is zero.
  (V − 10)/R₁ + (V − 0)/R₂ + (V − 5)/R₃ = 0
Substitute:
  (V − 10)/2 + V/3 + (V − 5)/4 = 0       [kΩ — current in mA]
Multiply by 12 (LCM of 2, 3, 4):
  6(V − 10) + 4V + 3(V − 5) = 0
  6V − 60 + 4V + 3V − 15 = 0
  13V = 75  ⇒  V = 75/13 = 5.769 V ≈ 5.77 V
Cross-check currents (each in mA): I_R1 = (5.77 − 10)/2 = −2.115 mA (flowing INTO the node from the +10 V source); I_R2 = 5.77/3 = 1.923 mA (leaving to ground); I_R3 = (5.77 − 5)/4 = 0.192 mA (leaving to +5 V — the +5 V source is *absorbing* current). Sum: −2.115 + 1.923 + 0.192 = 0 mA. ✓ KCL closes.

**Thévenin equivalent of a resistive network.** A 12 V source in series with R_int = 4 kΩ has Thévenin V_Th = V_oc = 12 V (open-circuit, no drop across R_int) and R_Th = R_int = 4 kΩ (kill the 12 V source ⇒ short ⇒ look into 4 kΩ). Maximum power to a load R_L: R_L = R_Th = 4 kΩ, P_L,max = V_Th²/(4·R_Th) = 144/(16000) = 9 mW. Cross-check: I = 12/(4000+4000) = 1.5 mA; V_L = 1.5 × 4 = 6 V; P_L = V_L·I = 6 × 0.0015 = 9 mW. ✓`,
    industrial_example: `**Industry: Power & Utilities — 125 V DC substation battery.** A 125 V DC lead-acid battery bank supplies protective relays, switchgear trip/close coils, and emergency lighting in a 230 kV substation. The battery has an internal resistance R_int ≈ 0.010 Ω/cell × 60 cells ≈ 0.6 Ω. The Thévenin equivalent at the battery terminals is V_Th ≈ 125 V in series with R_Th ≈ 0.6 Ω. When a 20 A nominal trip coil energizes (R_load = 125/20 = 6.25 Ω), the bus voltage sags to V = 125 × 6.25/(0.6 + 6.25) = 125 × 6.25/6.85 = 114 V — a 9 % dip, well within IEEE 141's recommended ≤ 10 % voltage-dip limit for trip-coil operation. A short circuit across the bus would deliver I_sc = V_Th/R_Th = 125/0.6 = 208 A — the design current the protective fuse must clear within 0.25 s (IEEE 141 Ch. 6).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade 230 kV Substation DC Battery Sizing (synthetic, illustrative).* A regional transmission owner is sizing a new 125 V DC substation battery to supply 20 A of continuous relay/SCADA load for 8 h following a complete AC auxiliary loss, plus a worst-case 30 A trip-coil burden at hour 0 and hour 4. Lead-acid sizing (IEEE Std 485): capacity = (I_cont × 8 h) + (I_trip × 1 min/60 min/h × 2 events) plus a 25 % aging margin and a 1.25 temperature derate for 25 °C operation. Worked: 20 × 8 = 160 Ah continuous; 30 × (1/60) × 2 = 1 Ah trip-coil (negligible); 25 % aging ⇒ 161 × 1.25 = 201 Ah; 1.25 temperature derate ⇒ 251 Ah. Spec: 250 Ah, 60-cell lead-acid at 125 V nominal (2.083 V/cell float). The design Thévenin R_Th = 0.6 Ω meets the 10 % dip limit at the trip-coil burden; the design passes the IEEE 485 end-of-discharge voltage check (≥ 1.75 V/cell ⇒ 105 V at the end of the 8 h discharge). This case is used in Lesson 1 to ground the abstract Thévenin/Norton theory in the practical battery-sizing calculation that every utility protection engineer performs.`,
    visual_explanation: `**Schematic conventions.** A DC circuit is drawn with the + terminal of a voltage source at the top (long line), − at the bottom (short line). Resistors are zig-zag (US) or rectangles (IEC). The reference (ground) node carries the standard "three horizontal bars" symbol. Nodes are junction dots; crossings without a dot are not connected. For node-voltage analysis, label every non-reference node V₁, V₂, … and draw a single ground symbol on the reference node. For mesh analysis, draw a clockwise circular arrow inside each "window" of the schematic, labeling it I₁, I₂, …. The voltage-divider layout is two resistors stacked vertically between V_s and ground, with V_out tapped from the junction — a ubiquitous schematic in sensor-bias, voltage-reference, and feedback-divider design. The Thévenin equivalent of a complex network is drawn as a single battery + R_Th between the two load terminals; the Norton as a current source with R_N in parallel.`,
    simulation_opportunity: `Open LTspice (Analog Devices, free) or the web-based Falstad circuit simulator (falstad.com/circuit) and build the worked examples: (i) voltage divider — verify V_out = 8 V by DC operating point; (ii) the 3-resistor node — verify V_node ≈ 5.77 V; (iii) Thévenin equivalent of a multi-resistor network — terminate it with a 0 Ω short, an open, and R_Th, and confirm I_sc, V_oc, and P_L,max. For industrial context, build a 125 V battery + 0.6 Ω R_Th driving a 6.25 Ω trip coil and watch the 114 V bus sag and the 208 A short-circuit current. The EngiSuite "Node-Voltage Solver" widget lets you drop resistors and sources on a canvas and watch the linear-system A matrix and b vector assemble in real time, with the solved node voltages overlaid on the schematic.`,
    common_mistakes: `- **Sign-convention slip**: writing KVL with mixed "rises-positive" and "drops-positive" signs. Pick one convention at the start; the Σ V = 0 form (drops = rises) is the most foolproof.
- **Forgetting that an ideal voltage source in parallel with a resistor makes the resistor "invisible" for voltage (but not for power)** — the resistor still dissipates P = V²/R but does not affect the rest of the circuit's voltages.
- **Killing dependent sources** when finding R_Th — dependent sources are NEVER killed; use the V_test/I_test method instead.
- **Treating a voltage source between two non-reference nodes as a node-voltage equation** — it is a *supernode*, requiring both the composite KCL and the V_a − V_b = V_s constraint.
- **Confusing the current-divider numerator**: the current through R₁ is I_t · R₂/(R₁+R₂) — the *other* resistor appears in the numerator. Beginners often invert.
- **Mixing units**: V/I = R works only with consistent units (V/A = Ω; V/mA = kΩ; mV/μA = kΩ). A 12 V source and 4 kΩ resistor give I = 12/4000 = 3 mA — easy to write 3 A by dropping the kΩ.`,
    limitations: `- **Linear resistors only**: V = IR breaks down for non-linear devices (diodes, varistors, PTC thermistors) — the IV curve is no longer a straight line.
- **Temperature coefficient ignored**: real resistors drift (e.g., copper ~ +0.39 %/°C); high-precision circuits need 4-wire Kelvin sensing and temperature-stable alloys (manganin).
- **Lumped-element assumption**: KCL/KVL assume circuit dimensions ≪ λ; at high frequencies (RF, fast digital edges) distributed R, L, C and propagation delay dominate — the lumped circuit becomes a transmission line (Lesson 2 AC analysis handles only up to ~30 MHz for typical board sizes).
- **Ideal sources are non-physical**: a real voltage source has R_int > 0; a real current source has R_parallel < ∞. The Thévenin/Norton theorems apply only to *linear* one-ports.
- **Maximum power transfer ≠ maximum efficiency**: at R_L = R_Th, the source delivers 50 % of its power to the load and dissipates 50 % internally — fine for signal circuits, wasteful for power circuits (where you want R_int ≪ R_load for high efficiency).`,
    comparison: `| Method | Equations | Best for |
|---|---|---|
| Node-voltage | KCL at every non-reference node (N−1 equations) | Non-planar circuits, circuits with many voltage sources, op-amp circuits |
| Mesh-current | KVL around every independent mesh (M equations) | Planar circuits with many current sources, planar networks with many meshes |
| Branch-current | KCL+KVL on every branch (B equations) | Small circuits only — too many equations otherwise |
| Thévenin/Norton | V_oc, R_Th (or I_sc, R_N) | Replacing a complex subnetwork with a 2-element equivalent for load analysis |

| Aspect | Thévenin | Norton |
|---|---|---|
| Topology | V_Th in series with R_Th | I_N in parallel with R_N=R_Th |
| Open-circuit voltage | V_Th (by construction) | I_N·R_N |
| Short-circuit current | V_Th/R_Th | I_N (by construction) |
| Use case | Voltage-source-like networks (stiff source) | Current-source-like networks |
| Power transfer | P_L,max at R_L=R_Th, V_Th²/(4 R_Th) | P_L,max at R_L=R_N, I_N²·R_N/4 |`,
    practical_application: `**Voltage-divider biasing of a BJT.** A 12 V supply biases a bipolar transistor base through R₁ = 22 kΩ (V_CC to base) and R₂ = 4.7 kΩ (base to ground). The unloaded divider sets V_base = 12 × 4.7/(22+4.7) = 12 × 4.7/26.7 = 2.11 V. The Thévenin equivalent of the bias network as seen by the base is V_Th = 2.11 V in series with R_Th = R₁‖R₂ = 22·4.7/(22+4.7) = 103.4/26.7 = 3.87 kΩ. The transistor's base current (≈ 50 μA) flows through R_Th and drops the base voltage by 0.05 × 3.87 = 0.19 V to 1.92 V — a 9 % loading error. To make V_base "stiff", scale R₁ and R₂ down by 10× (R₁ = 2.2 kΩ, R₂ = 470 Ω) so R_Th = 387 Ω and the loading error falls below 1 %. This is the universal bias-stability trade-off of analog circuit design: stiff sources draw more current but waste more supply power.`,
    decision_scenario: `You are the electrical lead at a 150 MW combined-cycle plant sizing the 125 V DC substation battery. Option A: a 200 Ah lead-acid bank at $24 000, R_Th ≈ 0.75 Ω (more cells, higher internal resistance) — bus sags to 110 V at 20 A trip-coil burden (still within IEEE 141 limits but only 4 V margin). Option B: a 250 Ah Ni-Cd bank at $52 000, R_Th ≈ 0.30 Ω (lower internal resistance) — bus sags to 118 V at 20 A (12 V margin). Decision rule: if the 8-hour autonomy requirement plus 10 % trip-coil margin saves $X in outage-avoided cost over 25 years > CapEx delta ($28 000), choose B. Worked: an 8-hour outage every 5 years costs the plant 150 MW × $40/MWh × 8 h = $48 000 per event × 5 events/25 yr = $240 000 in avoided production loss; the additional 4 V sag-margin prevents the 110 V threshold trip that would extend the outage by 30 min (× $300 000/event × 5 events = $1.5 M saved). Choose B; the lower R_Th of Ni-Cd dominates the lifecycle cost.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: Ohm's law, voltage divider, KCL node analysis, Thévenin equivalence of linear one-port networks.`,
    certification_questions: `This lesson's content maps to the NCEES FE Electrical & Computer exam (DC circuit analysis), the IEC 60364 series (low-voltage electrical installations), and the NFPA 70 (NEC) Articles 110/210/240/310 (conductor sizing, overcurrent protection). Sample FE-style question: "A 12 V source supplies two series resistors R₁ = 4 kΩ and R₂ = 8 kΩ. The voltage across R₂ is: (a) 4 V, (b) 6 V, (c) 8 V, (d) 12 V." Correct: (c) 8 V (voltage-divider rule V_R2 = V_s·R₂/(R₁+R₂) = 12·8/12 = 8 V).`,
    summary: `DC circuit analysis rests on three axioms — Ohm's law V = IR, KCL (Σ I = 0 at every node), and KVL (Σ V = 0 around every loop) — and on the linearity that enables superposition and the Thévenin/Norton equivalent representations. The node-voltage and mesh-current methods reduce every linear circuit to a linear system A·x = b. Voltage and current dividers handle the common two-resistor reductions. Thévenin's theorem lets you replace any linear one-port with V_Th + R_Th, with maximum power transferred to the load when R_L = R_Th. The IEEE 141 Red Book and NFPA 70 (NEC) ground these methods in industrial substation and conductor-sizing practice.`,
    key_takeaways: `- V = IR for a linear resistor; P = V·I = I²R = V²/R dissipated as heat.
- KCL: Σ I = 0 at every node (charge conservation); KVL: Σ V = 0 around every loop (energy conservation).
- Node-voltage method: KCL at every non-reference node → N−1 equations. Mesh-current method: KVL around every independent mesh → M equations.
- Voltage divider V_R2 = V_s·R₂/(R₁+R₂); current divider I_R1 = I_t·R₂/(R₁+R₂).
- Thévenin: V_Th in series with R_Th (R_Th = R_eq with independent sources killed; use V_test/I_test with dependent sources). Norton: I_N = I_sc, R_N = R_Th.
- Maximum power transfer: R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th).
- Always verify with a power-balance check (Σ P_source = Σ P_load) — energy is conserved in every correctly solved circuit.`,
    references: `1. Alexander & Sadiku (2017), Ch. 1–4 (Ohm/KCL/KVL, node & mesh, circuit theorems).
2. Nilsson & Riedel (2015), Ch. 3–4 (resistive circuits, node/mesh), Ch. 5 (op-amp), Ch. 9 (sinusoidal steady-state transition).
3. Hayt, Kemmerly & Durbin (2012), Ch. 2–5 (components, voltage/current laws, nodal/mesh, network theorems).
4. Boylestad (2016), Ch. 4–9 (Ohm's law, series/parallel, mesh/node, network theorems).
5. IEEE Std 141-1993 (Red Book), Ch. 2–3 (load estimation, voltage drop on feeders via Ohm's law).
6. NFPA 70 (NEC 2023), Art. 210, 240, 310, 460 (branch-circuit sizing, overcurrent protection, conductor ampacity, capacitor installations).`,
  },
  knowledgeObject: {
    title: "DC Circuit Analysis — Knowledge Object",
    domain: "Electrical Circuits",
    competency: "Foundations",
    topic: "DC Resistive Network Analysis",
    concept: "Ohm's law + KCL/KVL → node/mesh → Thévenin/Norton",
    body: {
      definitions: [
        "Ohm's law: V = I·R for a linear resistor; R = ρL/A in Ω.",
        "KCL: the algebraic sum of currents at any node is zero (charge conservation).",
        "KVL: the algebraic sum of voltages around any closed loop is zero (energy conservation).",
        "Node (essential node): a circuit junction of ≥3 elements; a supernode is two non-reference nodes joined by a voltage source.",
        "Mesh: a loop that contains no other loop (a planar 'window'); a supermesh is two meshes joined by a current source.",
        "Thévenin equivalent: a single ideal voltage source V_Th in series with a single resistor R_Th representing any linear one-port at its terminals.",
        "Norton equivalent: the dual — I_N in parallel with R_N = R_Th.",
      ],
      principles: [
        "V = IR is the constitutive relation; KCL/KVL are the topology axioms.",
        "Linearity ⇒ superposition: response to N independent sources = Σ individual responses.",
        "Any linear one-port of sources + resistors has a Thévenin AND a Norton equivalent.",
        "Maximum power transfer: R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th).",
        "Power balance: Σ P_source = Σ P_load (energy conservation in any correctly solved circuit).",
        "Passive sign convention: current enters the + terminal of a passive element; P = VI > 0 absorbed.",
      ],
      components: [
        "Ideal voltage source (R_int = 0) and ideal current source (R_parallel = ∞)",
        "Linear resistor (R = ρL/A)",
        "Dependent (controlled) sources: VCVS, VCCS, CCVS, CCCS",
        "Ground/reference node (V = 0)",
        "Open/short (R = ∞ / R = 0)",
        "DC substation battery: 24/48/125/250 V lead-acid or Ni-Cd bank (IEEE 141 Ch. 5)",
      ],
      mechanism:
        "Each branch obeys Ohm's law (V = IR); KCL closes the current balance at every node (charge conservation); KVL closes the voltage balance around every loop (energy conservation). The resulting linear system A·x = b yields all node voltages (or mesh currents), from which every branch current, voltage, and power follows. Thévenin/Norton collapse any linear subnetwork to a 2-element equivalent for load analysis.",
      process:
        "Identify nodes/meshes → pick reference → assign node voltages or mesh currents → write KCL/KVL using Ohm's law → handle supernodes/supermeshes → solve linear system → back-substitute → verify KCL/KVL closure and power balance.",
      formulas: [
        "V = I·R  ;  I = V/R  ;  R = V/I",
        "P = V·I = I²·R = V²/R",
        "KCL: Σ I = 0 at every node",
        "KVL: Σ V = 0 around every loop",
        "R_series = R₁+R₂+…+R_n ;  R_parallel = 1/(Σ 1/R_i)",
        "V_R2 = V_s·R₂/(R₁+R₂)  ;  I_R1 = I_t·R₂/(R₁+R₂)",
        "V_Th = V_oc ; R_Th = R_eq (independent sources killed) ; R_Th = V_test/I_test (with dependent sources)",
        "I_N = I_sc ; R_N = R_Th ; V_Th = I_N·R_Th",
        "P_L,max = V_Th²/(4·R_Th) when R_L = R_Th",
      ],
      metrics: [
        "Node voltage V (V) and branch current I (A or mA)",
        "Power dissipated P (W, mW) — I²R loss in each resistor",
        "Source efficiency η = P_load/P_source",
        "Voltage drop ΔV = I·R on a feeder (IEEE 141 Ch. 3)",
        "Short-circuit current I_sc = V_Th/R_Th (IEEE 141 Ch. 4)",
        "Substation-battery sag V_sag = V_Th − I_load·R_Th (IEEE 141 Ch. 5)",
      ],
      examples: [
        "Voltage divider: V_s = 12 V, R₁ = 4 kΩ, R₂ = 8 kΩ → V_out = 8 V, I = 1 mA, P_R1 = 4 mW, P_R2 = 8 mW, P_source = 12 mW (power balance ✓).",
        "3-resistor node: R₁ = 2 kΩ to +10 V, R₂ = 3 kΩ to ground, R₃ = 4 kΩ to +5 V → V_node = 75/13 ≈ 5.77 V; currents −2.115 mA, +1.923 mA, +0.192 mA (Σ = 0 ✓).",
        "Thévenin of 12 V source in series with 4 kΩ: V_Th = 12 V, R_Th = 4 kΩ; max power at R_L = 4 kΩ → P_L,max = 9 mW.",
      ],
      industrial_examples: [
        "Power & Utilities — 125 V DC substation battery, 60 cells, R_Th ≈ 0.6 Ω; bus sags to 114 V at 20 A trip-coil burden; I_sc ≈ 208 A (IEEE 141 Ch. 5).",
      ],
      case_studies: [
        "SYNTHETIC — Cascade 230 kV Substation DC Battery Sizing: IEEE Std 485 sizing of 250 Ah, 60-cell lead-acid bank, R_Th = 0.6 Ω, end-of-discharge voltage 105 V, 8-hour autonomy with 10 % dip margin.",
      ],
      common_errors: [
        "Slipping the sign convention in KVL (mixing rises-positive with drops-positive).",
        "Killing dependent sources when computing R_Th (must use the V_test/I_test method).",
        "Forgetting the supernode (voltage source between two non-reference nodes) or supermesh (current source shared between two meshes) constraint.",
        "Inverting the current-divider numerator (R_other appears in numerator, not R_self).",
        "Mixing units (V, mA, kΩ): 12 V across 4 kΩ = 3 mA, not 3 A.",
        "Applying maximum-power-transfer to high-power distribution (50 % efficiency is acceptable for signal, wasteful for power).",
      ],
      limitations: [
        "Linear resistors only — non-linear devices (diodes, varistors, PTC) break Ohm's law.",
        "Temperature coefficient ignored — copper drifts ~+0.39 %/°C, requiring 4-wire Kelvin sensing for precision.",
        "Lumped-element assumption fails above ~30 MHz — distributed R/L/C and transmission-line effects dominate.",
        "Ideal sources are non-physical — real voltage sources have R_int > 0; real current sources have R_parallel < ∞.",
        "Thévenin/Norton apply only to *linear* one-ports — non-linear or time-varying subnetworks have no such equivalent.",
      ],
      best_practices: [
        "Always declare the sign convention (engineering: rises = +, drops = −) before writing KVL.",
        "Use the node-voltage method for non-planar or op-amp circuits; mesh-current for planar networks with many current sources.",
        "Verify every solution with a power-balance check (Σ P_source = Σ P_load); a failed power balance means a sign error.",
        "For Thévenin with dependent sources, use the V_test/I_test method (1 V test source, read the resulting current).",
        "For industrial substation battery sizing, follow IEEE Std 485 + IEEE 141 Ch. 5 (R_Th, voltage-dip, I_sc).",
      ],
      related_concepts: [
        "AC circuit analysis — phasors, impedance, RMS, power factor (Lesson 2)",
        "First-order RC/RL transients — τ = RC, τ = L/R (Lesson 3)",
        "Network theorems — superposition, maximum power transfer (Lesson 3)",
        "Three-phase power, wye/delta — extension of KCL/KVL to polyphase (Alexander & Sadiku Ch. 12)",
        "Transmission-line theory — distributed-parameter limit of lumped DC analysis (high-frequency limit)",
      ],
      prerequisites: [
        "College algebra and linear systems (matrix form A·x = b, Cramer's rule, determinants)",
        "Definitions of charge (C), current (A), voltage (V), power (W), energy (J)",
        "Passive sign convention (current enters the + terminal of a passive element)",
        "Series/parallel reduction of two resistors",
      ],
      references: CIRCUITS_REFERENCE_TITLES,
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
        "A 12 V DC source is connected directly across a 4 kΩ resistor. The current through the resistor (in mA) is:",
      explanation:
        "Ohm's law I = V/R = 12 V / 4000 Ω = 0.003 A = 3 mA.",
      whyCorrect:
        "Apply Ohm's law I = V/R with consistent units: V in V, R in Ω gives I in A; or V in V and R in kΩ gives I in mA. I = 12/4 = 3 mA.",
      whyOthersWrong: [
        "Option 2 mA confuses the formula with V·R (12 × 4 = 48, then somehow 2 mA) — Ohm's law divides, not multiplies.",
        "Option 48 A inverts the fraction (R/V instead of V/R) and drops the kΩ unit — a classic unit mistake.",
        "Option 0.333 mA inverts V/R to R/V (4/12) and drops the kΩ — the answer should be larger than 1 mA given 12 V across only 4 kΩ, not smaller.",
      ],
      options: [
        { text: "2 mA", isCorrect: false },
        { text: "3 mA", isCorrect: true },
        { text: "48 A", isCorrect: false },
        { text: "0.333 mA", isCorrect: false },
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
        "A 12 V source drives two series resistors R₁ = 4 kΩ and R₂ = 8 kΩ. The voltage V_out measured across R₂ is:",
      explanation:
        "Voltage-divider rule: V_R2 = V_s · R₂/(R₁+R₂) = 12 · 8/12 = 8 V. Cross-check: I = 12/(4+8) = 1 mA; V_R2 = I·R₂ = 0.001 × 8000 = 8 V.",
      whyCorrect:
        "Voltage-divider rule for two series resistors across a source V_s: V_R2 = V_s · R₂/(R₁+R₂) = 12 · 8 kΩ / (4 kΩ + 8 kΩ) = 12 · 8/12 = 8 V. Equivalently, the total current is I = V_s/(R₁+R₂) = 12/12 000 = 1 mA, so the drop across R₂ is V_R2 = I·R₂ = 1 mA · 8 kΩ = 8 V.",
      whyOthersWrong: [
        "Option 4 V is the drop across R₁ (= V_s · R₁/(R₁+R₂) = 12·4/12 = 4 V) — measured across the wrong resistor.",
        "Option 6 V is the average (V_s/2 = 6 V) — applies only if R₁ = R₂, which they are not.",
        "Option 12 V would imply no current flows through R₁ — that requires R₁ = 0, contradicting the given value.",
      ],
      options: [
        { text: "4 V", isCorrect: false },
        { text: "6 V", isCorrect: false },
        { text: "8 V", isCorrect: true },
        { text: "12 V", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Power",
      stem:
        "A node is connected to a +10 V source through R₁ = 2 kΩ, to ground through R₂ = 3 kΩ, and to a +5 V source through R₃ = 4 kΩ. Using node-voltage analysis, the node voltage V is approximately:",
      explanation:
        "KCL: (V − 10)/2 + V/3 + (V − 5)/4 = 0 (currents in mA with R in kΩ). Multiply by 12: 6(V−10) + 4V + 3(V−5) = 0 → 13V = 75 → V = 75/13 ≈ 5.77 V.",
      whyCorrect:
        "Apply KCL at the node (sum of currents leaving = 0). With currents in mA and resistances in kΩ: (V−10)/2 + (V−0)/3 + (V−5)/4 = 0. Multiply through by the LCM 12: 6(V−10) + 4V + 3(V−5) = 0 → 6V − 60 + 4V + 3V − 15 = 0 → 13V = 75 → V = 75/13 ≈ 5.77 V. Verify: I_R1 = (5.77−10)/2 = −2.115 mA (into the node from +10 V); I_R2 = 5.77/3 = +1.923 mA (to ground); I_R3 = (5.77−5)/4 = +0.192 mA (to +5 V); Σ = 0 mA ✓.",
      whyOthersWrong: [
        "Option 4.50 V would result from forgetting the R₃ branch (a 2-resistor divider between +10 V and ground: 10·3/(2+3) = 6 V, not 4.5 V — or from an arithmetic slip in the linear-system solution).",
        "Option 5.00 V is the average of the two source voltages (10 + 0)/2 with R₂ alone, ignoring both R₁'s source and R₃ — KCL forbids this; the node cannot sit at +5 V when one source above and one below pull it differently.",
        "Option 6.92 V results from inverting the LCM or sign of one term in the linear system (e.g., writing +60 instead of −60) — a sign-convention slip.",
      ],
      options: [
        { text: "4.50 V", isCorrect: false },
        { text: "5.00 V", isCorrect: false },
        { text: "5.77 V", isCorrect: true },
        { text: "6.92 V", isCorrect: false },
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
        "True or False: Any linear two-terminal network consisting only of ideal independent voltage sources, ideal independent current sources, dependent (controlled) sources, and linear resistors can be reduced to a Thévenin equivalent consisting of a single voltage source V_Th in series with a single resistor R_Th (with R_Th possibly requiring the test-source V_test/I_test method when dependent sources are present).",
      explanation:
        "TRUE. Thévenin's theorem applies to ANY linear one-port. V_Th is the open-circuit voltage; R_Th is the equivalent resistance seen from the terminals with all independent sources killed (voltage sources → short, current sources → open) — but dependent sources are NEVER killed. When dependent sources are present, R_Th must be found by applying a test source V_test at the terminals and computing the resulting I_test, so R_Th = V_test/I_test.",
      whyCorrect:
        "TRUE. Thévenin's theorem (1883) applies to every linear one-port network. The presence of dependent (controlled) sources does not break linearity — they remain linear in their controlling variables — so a Thévenin equivalent exists. The procedure is: (1) V_Th = V_oc, the open-circuit voltage at the terminals (with all sources, including dependent, active). (2) R_Th = R_eq seen looking into the terminals after killing all *independent* sources (voltage sources → short circuits, current sources → open circuits) but leaving dependent sources ACTIVE. Because dependent sources have no fixed value, you cannot simply turn them off; instead, apply a test source V_test (typically 1 V) at the terminals and compute the resulting test current I_test (with all independent sources already killed). Then R_Th = V_test/I_test. The resulting (V_Th, R_Th) two-element equivalent reproduces the original network's V-I characteristic at the terminals exactly.",
      whyOthersWrong: [
        "Option FALSE — would claim that dependent sources break the Thévenin theorem. They do not: dependent sources are linear in their controlling variables, so the overall one-port remains linear and Thévenin-equivalent. The dependent sources simply require the V_test/I_test method to find R_Th — they do not invalidate the theorem.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — AC Circuit Analysis
// (slug: circuits-ac-analysis)
// ---------------------------------------------------------------------------

const LESSON_AC: RefLesson = {
  slug: "circuits-ac-analysis",
  title: "AC Circuit Analysis",
  titleAr: "تحليل الدوائر الكهربائية المتناوبة",
  order: 2,
  durationMin: 40,
  references: CIRCUITS_REFERENCE_TITLES,
  conceptIntroduction: `Alternating-current (AC) analysis extends the DC toolkit to sinusoidal steady-state. Charles Proteus Steinmetz introduced the *phasor transform* in 1893: a sinusoid v(t) = V_m·cos(ωt + φ) is represented by the complex phasor V = V_m/√2 · e^{jφ} (RMS magnitude, angle φ). Ohm's law generalizes to V = I·Z where the *impedance* Z = R + jX combines resistance R (real, in Ω) and reactance X (imaginary, in Ω). For an inductor X_L = ωL; for a capacitor X_C = −1/(ωC); the net reactance of a series RLC is X = X_L + X_C = ωL − 1/(ωC). The magnitude |Z| = √(R² + X²) and angle φ = arctan(X/R) give the relationship between voltage and current magnitudes (|V| = |I|·|Z|) and phase (current lags voltage by φ if X > 0, inductive; leads if X < 0, capacitive). RMS magnitudes let us compute power directly: real (average) power P = V_rms·I_rms·cos(φ), reactive power Q = V_rms·I_rms·sin(φ) (in VAR), and apparent power S = V_rms·I_rms (in VA) — the three forming the *power triangle* S² = P² + Q² with the *power factor* PF = cos(φ) = P/S. This lesson works phasors, impedance, RMS, power factor, and single-phase power with a series RLC example at 60 Hz and an apparent-power / PF calculation.`,
  sections: {
    learning_objectives: `- Convert a sinusoidal time-domain signal v(t) = V_m·cos(ωt + φ) to its phasor V = V_rms∠φ and back to the time domain.
- Define impedance Z = R + jX with X_L = ωL and X_C = −1/(ωC); combine series/parallel impedances using complex arithmetic.
- Compute the magnitude |Z| = √(R² + X²) and phase angle φ = arctan(X/R) of a series RLC circuit; identify leading (capacitive) vs lagging (inductive) current.
- Define and compute the RMS value of a sinusoid V_rms = V_m/√2; extend to non-sinusoidal waveforms by V_rms = √(∫v(t)² dt / T).
- State the three AC powers: real P = V·I·cos(φ) [W], reactive Q = V·I·sin(φ) [VAR], apparent S = V·I [VA]; draw the power triangle S² = P² + Q².
- Define power factor PF = cos(φ) = P/S; identify leading (capacitive, current leads) and lagging (inductive, current lags) PF.
- Size a power-factor-correction capacitor to bring an inductive load to a target PF: Q_C = P·(tan(φ_old) − tan(φ_new)).`,
    prerequisites: `- Lesson 1 — DC Circuit Analysis (Ohm's law, KCL, KVL, node/mesh, Thévenin/Norton).
- Complex algebra: a + jb with j = √(−1); Euler's identity e^{jθ} = cos(θ) + j·sin(θ); rectangular ↔ polar conversion.
- Sinusoidal functions: amplitude, angular frequency ω = 2πf, period T = 1/f, phase angle φ; the derivative and integral of sinusoids.
- Definition of root-mean-square (RMS) and the relation V_rms = V_m/√2 for a pure sinusoid.`,
    introduction: `AC analysis dates to the 1880s "War of the Currents" between Edison's DC (Pearl Street Station, 1882) and Westinghouse/Tesla's AC (Niagara Falls, 1895). AC won for power transmission because the transformer — a pure AC device — let generators step voltage up for low-loss transmission and back down at the load. The mathematical breakthrough that made AC analysis tractable was Charles Proteus Steinmetz's 1893 *phasor transform*: replace the time-domain ODE v(t) = V_m·cos(ωt + φ) with the complex constant V = V_m∠φ, solve the (now-algebraic) circuit equation V = I·Z, then transform back. All the DC machinery — KCL, KVL, node/mesh, Thévenin/Norton — carries over unchanged because the phasor transform is a linear isomorphism on the space of sinusoids at a single frequency.

The generalization of resistance is *impedance* Z = R + jX (ohms), where R is the resistive (real) part and X the *reactive* (imaginary) part. For an inductor v = L·di/dt gives V = jωL·I ⇒ X_L = ωL (positive, inductive). For a capacitor i = C·dv/dt gives I = jωC·V ⇒ X_C = −1/(ωC) (negative, capacitive). A series RLC has Z = R + j(ωL − 1/(ωC)) = R + jX. At the *resonant* frequency ω_0 = 1/√(LC), X_L + X_C = 0 and Z = R (purely resistive, PF = 1).

RMS magnitudes let AC power calculations look like DC ones. For a pure sinusoid, V_rms = V_m/√2 (the heating value of the waveform). With phasor magnitudes expressed in RMS, the average real power delivered to a load is P = V_rms·I_rms·cos(φ), the *reactive power* Q = V_rms·I_rms·sin(φ) (in VAR — volt-amperes-reactive), and the *apparent power* S = V_rms·I_rms (in VA) — these form the *power triangle* S² = P² + Q² with the *power factor* PF = P/S = cos(φ). An inductive load (motors, transformers, ballasts) has lagging PF < 1; a parallel capacitor supplies negative Q (capacitive) that cancels the inductive Q, raising the PF and reducing source current — the principle of *power-factor correction*.

This lesson works the phasor method on a 60 Hz series RLC, computes the apparent power for a 240 V/10 A/0.8 PF single-phase load, and sets up the PF-correction sizing formula used in industry.`,
    terminology: `- **Sinusoid**: v(t) = V_m·cos(ωt + φ); V_m peak amplitude, ω = 2πf angular frequency (rad/s), f = 1/T frequency (Hz), φ phase angle (rad).
- **Phasor (RMS)**: V = V_rms·e^{jφ} = (V_m/√2)∠φ; the time-domain v(t) is Re{V·√2·e^{jωt}}.
- **Impedance Z** (Ω): Z = V/I = R + jX with R the resistance and X the reactance.
- **Reactance**: X_L = ωL (inductive, +); X_C = −1/(ωC) (capacitive, −); X_net = X_L + X_C in series.
- **Admittance Y = 1/Z** (siemens, S): Y = G + jB with G conductance, B susceptance.
- **Phase angle** φ = arctan(X/R): if φ > 0 the current *lags* the voltage (inductive); if φ < 0 the current *leads* (capacitive); φ = 0 the load is *resistive* (unity PF).
- **RMS (root-mean-square)**: V_rms = √(∫₀ᵀ v(t)² dt / T); for a pure sinusoid V_rms = V_m/√2 ≈ 0.707 V_m.
- **Real (average) power** P = V_rms·I_rms·cos(φ) [W] — the power dissipated in R.
- **Reactive power** Q = V_rms·I_rms·sin(φ) [VAR] — the power oscillating between source and L/C (no net transfer).
- **Apparent power** S = V_rms·I_rms [VA] — what the source must size for; S² = P² + Q² (power triangle).
- **Power factor** PF = cos(φ) = P/S; lagging (inductive, current lags) vs leading (capacitive, current leads); 0 ≤ PF ≤ 1.`,
    detailed_explanation: `**Phasor transform (Steinmetz, 1893).** A sinusoid v(t) = V_m·cos(ωt + φ) is one of an infinite family differing only in amplitude and phase. Fix the frequency ω and represent the sinusoid by the complex constant V = V_m∠φ (peak-phasor) or V_rms∠φ = (V_m/√2)∠φ (RMS-phasor, used in power engineering). The transform is linear: V₁ + V₂ (phasors) corresponds to v₁(t) + v₂(t) (sinusoids). Differentiation becomes multiplication by jω: d/dt[V_m·cos(ωt+φ)] ↔ jω·V (phasor). Integration becomes division by jω. The time-domain ODE for a series RLC, L·di/dt + R·i + (1/C)∫i dt = v(t), becomes the algebraic (jωL + R + 1/(jωC))·I = V — i.e., Z·I = V, Ohm's law in phasor form.

**Impedance of elements.** Resistor: v = R·i ⇒ Z_R = R (purely real, no phase shift, PF = 1). Inductor: v = L·di/dt ⇒ V = jωL·I ⇒ Z_L = jωL = jX_L with X_L = ωL (positive reactance, current lags voltage by 90°). Capacitor: i = C·dv/dt ⇒ I = jωC·V ⇒ Z_C = 1/(jωC) = −j/(ωC) = jX_C with X_C = −1/(ωC) (negative reactance, current leads voltage by 90°). Series RLC: Z = R + j(ωL − 1/(ωC)) = R + jX; |Z| = √(R² + X²), φ = arctan(X/R). Parallel impedances combine as admittances: Y_total = Y₁ + Y₂ + …, with Y_k = 1/Z_k.

**RMS.** The RMS (root-mean-square) value of a periodic waveform is its heating value: V_rms = √(∫₀ᵀ v(t)² dt / T). For a pure sinusoid v(t) = V_m·cos(ωt), V_rms = V_m/√2 ≈ 0.707 V_m. The U.S. residential 120 V / 240 V (60 Hz) and European 230 V (50 Hz) line voltages are RMS; the peak of a 120 V_rms sinusoid is V_m = 120·√2 ≈ 170 V. For a non-sinusoidal waveform (square, triangle, distorted), V_rms = √(Σ V_k,rms²) by Parseval — true-RMS meters are essential for distorted current.

**Power.** Average real power delivered to a one-port: P = (1/T)∫₀ᵀ v(t)·i(t) dt. For sinusoidal v = V_m cos(ωt), i = I_m cos(ωt − φ), P = V_rms·I_rms·cos(φ). The cosine cos(φ) is the *power factor*. Reactive power Q = V_rms·I_rms·sin(φ) (in VAR) is the peak oscillating power between source and energy-storage elements (L and C) — no net transfer, but it loads the source and transmission line. Apparent power S = V_rms·I_rms (in VA) is what the source must be sized to deliver. The power triangle S² = P² + Q² with P adjacent, Q opposite, φ the included angle, gives the relations P = S·cos(φ), Q = S·sin(φ), S = √(P² + Q²).

**Power factor correction.** An inductive load (motor, transformer, fluorescent ballast) draws I with lagging φ: P fixed, Q_L > 0. A shunt capacitor supplies Q_C = −ω·C·V² (capacitive, negative) that cancels part of Q_L. The new reactive Q_new = Q_L + Q_C, and PF_new = P/S_new = P/√(P² + Q_new²). To bring PF from PF_old (φ_old) to PF_new (φ_new): Q_C = P·(tan(φ_old) − tan(φ_new)). The source current magnitude drops from |I_old| = S_old/V to |I_new| = S_new/V — freeing distribution capacity and reducing I²R losses (NFPA 70 Art. 460 governs the installation).`,
    core_principles: `- **Steinmetz phasor transform**: v(t) = V_m·cos(ωt + φ) ↔ V = V_rms∠φ; differentiation ↔ ×jω; integration ↔ /(jω).
- **Ohm's law in phasor form**: V = I·Z with Z = R + jX (Ω); all DC theorems (KCL, KVL, node/mesh, Thévenin/Norton, superposition) carry over unchanged.
- **Reactance signs**: X_L = +ωL (inductive), X_C = −1/(ωC) (capacitive); net X = X_L + X_C in series; resonance at ω_0 = 1/√(LC).
- **RMS magnitudes**: V_rms = V_m/√2 for a pure sinusoid; lets AC power calculations mirror DC: P = V_rms·I_rms·cos(φ).
- **Power triangle**: S² = P² + Q² with P real (W), Q reactive (VAR), S apparent (VA); PF = cos(φ) = P/S.
- **Power factor correction**: parallel C supplies Q_C = −ωCV²; sizing formula Q_C = P·(tan(φ_old) − tan(φ_new)).
- **Linearity at a single frequency**: superposition holds only when sources are at the SAME frequency; different frequencies must be solved separately and combined in the time domain.`,
    components: `- **Resistor (R, Ω)**: Z = R, no phase shift, dissipates P = I²R.
- **Inductor (L, H)**: Z = jωL = jX_L, current lags voltage by 90°, stores energy ½Li² in the magnetic field.
- **Capacitor (C, F)**: Z = 1/(jωC) = −j/(ωC) = jX_C, current leads voltage by 90°, stores energy ½Cv² in the electric field.
- **Ideal AC voltage source**: V_s(t) = V_m·cos(ωt + φ) ↔ V_s = V_rms∠φ.
- **Ideal AC current source**: I_s(t) = I_m·cos(ωt + φ) ↔ I_s = I_rms∠φ.
- **Transformer** (linear, ideal): V₂/V₁ = N₂/N₁, I₂/I₁ = N₁/N₂; matches load to source for max power transfer in audio and RF; steps transmission voltage up/down in power systems.
- **Induction motor** (industrial load): runs at lagging PF ~0.85 at full load, ~0.6 at light load — the principal driver of industrial PF correction.`,
    process: `1. Identify the operating frequency f and compute ω = 2πf.
2. Convert every time-domain sinusoidal source v_s(t) = V_m·cos(ωt + φ) to its RMS phasor V_s = (V_m/√2)∠φ.
3. Replace each element with its impedance: R → R; L → jωL; C → 1/(jωC) = −j/(ωC).
4. Combine series/parallel impedances with complex arithmetic exactly as in DC analysis (Z_series = Σ Z_k; Z_parallel = 1/(Σ 1/Z_k)).
5. Solve the resulting algebraic circuit (V = I·Z, KCL, KVL, node/mesh) — every DC method applies unchanged.
6. Compute |Z| = √(R² + X²) and φ = arctan(X/R) for any impedance; phase φ > 0 inductive (current lags), φ < 0 capacitive (current leads).
7. Compute power: P = V_rms·I_rms·cos(φ), Q = V_rms·I_rms·sin(φ), S = V_rms·I_rms, PF = cos(φ) = P/S.
8. For PF correction: size C from Q_C = P·(tan(φ_old) − tan(φ_new)) = ω·C·V² ⇒ C = Q_C/(ω·V²).
9. Convert the answer phasor back to the time domain if required: v(t) = √2·|V|·cos(ωt + ∠V).`,
    formula_calculation: `**Phasor transform (Steinmetz):**
  v(t) = V_m·cos(ωt + φ)  ⇔  V = V_rms·e^{jφ} = (V_m/√2)∠φ
  d/dt[v(t)]  ⇔  jω·V           ∫v(t) dt  ⇔  V/(jω)

**Impedance:**
  Z_R = R                                    [purely real]
  Z_L = jωL = jX_L         X_L = ωL          [current lags 90°]
  Z_C = 1/(jωC) = −j/(ωC) = jX_C   X_C = −1/(ωC)  [current leads 90°]
  Z_series = R + j(ωL − 1/(ωC)) = R + jX
  |Z| = √(R² + X²)        φ = arctan(X/R)
  Y = 1/Z = (R − jX)/(R² + X²) = G + jB       [S]

**RMS of a pure sinusoid:**
  V_rms = V_m/√2 ≈ 0.707 V_m        I_rms = I_m/√2

**Resonance (series RLC):**
  ω_0 = 1/√(LC)        Z_at_resonance = R (purely resistive, PF = 1)
  Q_factor = ω_0·L/R = 1/(ω_0·R·C)

**Single-phase power:**
  P (real)   = V_rms·I_rms·cos(φ)         [W]
  Q (reactive) = V_rms·I_rms·sin(φ)        [VAR]
  S (apparent) = V_rms·I_rms                [VA]
  S² = P² + Q²                              (power triangle)
  PF = cos(φ) = P/S                         [0 ≤ PF ≤ 1]
  I_rms = S/V_rms = P/(V_rms·PF)

**Power-factor correction (size the shunt C to take PF from PF_old to PF_new):**
  Q_C = P·(tan(φ_old) − tan(φ_new))    where  φ = arccos(PF)
  C = Q_C / (ω·V_rms²)

**Assumptions**: (i) sinusoidal steady-state (linear, single-frequency); (ii) linear elements (R, L, C constant); (iii) RMS magnitudes throughout (so P, Q, S combine in the power triangle); (iv) balanced three-phase loads use the per-phase equivalent (extension beyond single-phase scope); (v) harmonic content is zero — distorted waveforms require Fourier decomposition and true-RMS meters.

**Interpretation**: P is the irreversibly dissipated power (in R); Q is the reversibly exchanged power (between L and C); S is the source's kVA burden. A 240 V source feeding a 0.8 PF load draws 25 % more current (and dissipates 56 % more I²R in the feeder) than the same load at PF = 1 — the economic basis for industrial PF-correction capacitor banks and the utility's PF penalty tariff (NFPA 70 Art. 460 for the installation).`,
    worked_example: `**Series RLC impedance at 60 Hz.** R = 100 Ω, L = 0.5 H, C = 5 μF, f = 60 Hz, ω = 2π·60 = 377 rad/s.
  X_L = ωL = 377 × 0.5 = 188.5 Ω
  X_C = 1/(ωC) = 1/(377 × 5×10⁻⁶) = 1/1.885×10⁻³ = 530.5 Ω
  X = X_L + X_C = 188.5 + (−530.5) = −342.0 Ω (net capacitive)
  Z = R + jX = 100 − j342 Ω
  |Z| = √(100² + 342²) = √(10 000 + 116 964) = √126 964 = 356.3 Ω
  φ = arctan(X/R) = arctan(−342/100) = arctan(−3.42) = −73.7° (current leads voltage — capacitive, leading PF)
  PF = cos(φ) = cos(−73.7°) = 0.282 leading

If V_rms = 120 V (US line voltage) is applied:
  I_rms = V/|Z| = 120/356.3 = 0.337 A
  S = V·I = 120 × 0.337 = 40.4 VA
  P = S·cos(φ) = 40.4 × 0.282 = 11.4 W (real power into R)
  Q = S·sin(φ) = 40.4 × sin(−73.7°) = 40.4 × (−0.962) = −38.9 VAR (capacitive — supplying Q to the source)

Cross-check on R: P = I²·R = 0.337² × 100 = 0.1136 × 100 = 11.4 W ✓. The capacitor's net Q is negative (supplying), the inductor's net Q is positive (absorbing): Q_L = I²·X_L = 0.1136 × 188.5 = +21.4 VAR, Q_C = I²·X_C = 0.1136 × (−530.5) = −60.3 VAR, sum −38.9 VAR ✓.

**Single-phase apparent power & PF.** A 240 V_rms source feeds an inductive load drawing I_rms = 10 A at PF = 0.8 lagging.
  φ = arccos(0.8) = 36.87° (lagging)
  S = V·I = 240 × 10 = 2400 VA
  P = S·PF = 2400 × 0.8 = 1920 W
  Q = S·sin(φ) = 2400 × 0.6 = 1440 VAR (inductive, positive)
  Verify: P² + Q² = 1920² + 1440² = 3 686 400 + 2 073 600 = 5 760 000 = 2400² ✓

**PF correction to unity.** Add a parallel C to cancel the 1440 VAR inductive. Q_C = −1440 VAR ⇒ C = |Q_C|/(ω·V²) = 1440/(377 × 240²) = 1440/(377 × 57 600) = 1440/21 715 200 = 6.63×10⁻⁵ F = 66.3 μF. After correction: Q_net = 0, PF = 1, source current drops from 10 A to I_new = P/V = 1920/240 = 8.0 A (a 20 % feeder current reduction).`,
    industrial_example: `**Industry: Manufacturing — plant PF-correction capacitor bank.** A 480 V industrial plant has a 200 kVA load at PF = 0.70 lagging (mostly induction motors). Real load P = 200 × 0.70 = 140 kW; reactive Q = 200 × sin(arccos 0.70) = 200 × 0.714 = 143 kVAR. The utility tariff adds a $7.50/kVAR-month penalty for any Q above 30 % of P (42 kVAR). The plant's penalty applies to (143 − 42) = 101 kVAR × $7.50 = $758/month. Adding a 100 kVAR capacitor bank (Q_C = −100 kVAR) brings Q_net to 43 kVAR — penalty drops to (43 − 42) × $7.50 = $8/month, saving $750/month. CapEx of the bank ≈ $35/kVAR × 100 = $3500; payback 4.7 months. NFPA 70 Art. 460 requires a discharge resistor across each capacitor (≤ 50 V in 1 min for ≤ 600 V systems) — sized using the Lesson 3 RC transient τ = RC. IEEE 141 Ch. 7 lists the standard bank ratings and the harmonic-resonance check (avoid L-C resonance near a load harmonic, e.g., 5th harmonic at 300 Hz on a 60 Hz system).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Harborview Manufacturing Plant PF-Correction Project (synthetic, illustrative).* A 480 V three-phase plant operates a 250 kVA induction-motor-dominated load at 0.75 PF lagging. The utility imposes a $9/kVAR-month penalty on reactive demand above 0.4× the real demand. Worked: real load P = 250 × 0.75 = 187.5 kW; reactive Q_old = 250 × sin(arccos 0.75) = 250 × 0.661 = 165 kVAR; tariff-free allowance 0.4 × 187.5 = 75 kVAR; penalty slab (165 − 75) × $9 = $810/month = $9720/yr. Three PF-correction options are tendered: (A) 100 kVAR bank, $3900 CapEx, brings Q to 65 kVAR (PF = 0.944 lag) — penalty drops to $0; (B) 90 kVAR bank, $3510 CapEx, brings Q to 75 kVAR (PF = 0.928 lag) — penalty drops to $0; (C) 60 kVAR bank, $2340 CapEx, brings Q to 105 kVAR (PF = 0.873 lag) — penalty still (105−75) × $9 = $270/month = $3240/yr. The decision matrix: option A pays back in 4.8 months ($3900/$9720×12), option B in 4.3 months ($3510/$9720×12), option C never pays back. Choose B — the minimum CapEx that eliminates the penalty. This case is used in Lesson 2 to ground the PF-correction sizing formula in the utility-tariff economics that drive industrial capacitor-bank installations.`,
    visual_explanation: `**Phasor diagram.** Draw the voltage V along the +x axis (reference, 0°). For an inductor, the current I lags V by 90° — draw I straight down (−90°); for a capacitor, I leads by 90° — draw I straight up (+90°); for a resistor, I is in phase — collinear with V. For a series RLC with net X > 0 (inductive), the impedance Z = R + jX points into the upper half-plane (angle φ > 0); the current I (which is V/Z) points into the lower half-plane (lags by φ). For X < 0 (capacitive), Z points down, I points up (leads by |φ|).

**Impedance triangle.** Right triangle with R horizontal (adjacent), X vertical (opposite), Z the hypotenuse; |Z| = √(R² + X²), φ = arctan(X/R) between R and Z. Inductive ⇒ triangle points up; capacitive ⇒ points down.

**Power triangle.** Right triangle with P horizontal (adjacent, real power W), Q vertical (opposite, reactive VAR), S hypotenuse (apparent VA). φ is the angle at the apex; PF = cos(φ) = P/S. Inductive Q points up; capacitive Q points down. PF correction subtracts |Q_C| from the inductive Q, rotating the triangle toward the horizontal (PF → 1).`,
    simulation_opportunity: `Open LTspice and run an AC sweep (.ac dec 100 10 1k) on a series RLC at R = 100 Ω, L = 0.5 H, C = 5 μF. Plot |Z| and ∠Z vs frequency — watch the resonance peak at f_0 = 1/(2π√(LC)) = 1/(2π·√(0.5·5×10⁻⁶)) = 1/(2π·1.581×10⁻³) = 100.7 Hz; at resonance |Z| = R = 100 Ω (PF = 1) and the current peaks. Below resonance X_C dominates (current leads); above, X_L dominates (current lags). For PF correction, parallel a 66 μF capacitor with the inductive 240 V/10 A/0.8 PF load of the worked example and watch the source current drop from 10 A to 8.0 A in the transient/.ac analysis. The Falstad simulator (falstad.com/circuit) lets you sweep the capacitor value with a slider and observe the source-current minimum at the unity-PF value.`,
    common_mistakes: `- **Mixing peak and RMS magnitudes**: P = V·I·cos(φ) requires BOTH V and I in RMS. Using V_m and I_m gives twice the real power (P_m = V_m·I_m/2 = V_rms·I_rms).
- **Sign of reactance**: X_C is NEGATIVE (capacitive) — students often write +1/(ωC) and lose the sign. Use Z_C = 1/(jωC) = −j/(ωC) consistently.
- **Confusing leading vs lagging**: capacitive load (φ < 0) → current LEADS voltage; inductive (φ > 0) → current LAGS. Memory aid: ELI the ICE man (ELI for inductor: Voltage E leads Current I; ICE for capacitor: Current I leads Voltage E).
- **Apparent power is NOT the sum of P and Q**: S = √(P² + Q²), not P + Q. A 100 W, 100 VAR load has S = 141 VA, not 200 VA.
- **Solving multi-frequency circuits in phasor form**: superposition in phasors requires the SAME frequency; different frequencies must be solved separately and combined in the TIME domain.
- **Neglecting harmonic content**: distorted currents (variable-speed drives, rectifiers) require Fourier analysis — true-RMS metering and IEEE 519 harmonic limits apply.`,
    limitations: `- **Linear elements only**: real inductors have series resistance (winding R); real capacitors have parallel leakage; both have non-linear saturation at high flux/voltage. The ideal Z_L = jωL and Z_C = 1/(jωC) are first-order models.
- **Single frequency**: superposition in phasors requires all sources at the same ω. Different frequencies must be solved separately and combined in the time domain (Fourier for periodic, Laplace for transient).
- **Sinusoidal steady-state only**: the phasor method assumes steady state after transients have decayed — switch-on transients are NOT captured (Lesson 3 covers them).
- **No harmonics**: distorted waveforms require Fourier decomposition; IEEE 519 limits harmonic current on the utility bus.
- **Balanced three-phase only at single-phase scope**: unbalanced loads and the zero-sequence component require sequence-network analysis (Alexander & Sadiku Ch. 12).
- **Skin effect at high frequency**: AC current crowds to the surface of conductors (R_ac > R_dc above ~10 kHz for typical wire); a distributed-parameter transmission-line model supersedes lumped Z for f ≳ 30 MHz on a typical board.`,
    comparison: `| Quantity | Resistor | Inductor | Capacitor |
|---|---|---|---|
| Impedance Z | R (real) | jωL (imaginary +) | 1/(jωC) (imaginary −) |
| Phase of I vs V | 0° (in phase) | −90° (lags) | +90° (leads) |
| Real power P | V²/R (dissipated) | 0 (average) | 0 (average) |
| Reactive power Q | 0 | +V²/(ωL) (absorbs) | −ωCV² (supplies) |
| Energy stored | 0 (dissipates) | ½Li² (magnetic) | ½Cv² (electric) |

| Power | Symbol | Unit | Relation |
|---|---|---|---|
| Real (average) | P | watt (W) | P = V·I·cos(φ) = I²R |
| Reactive | Q | VAR | Q = V·I·sin(φ) = I²X |
| Apparent | S | VA | S = V·I = √(P² + Q²) |
| Power factor | PF | dimensionless | PF = cos(φ) = P/S |

| PF correction | Before | After |
|---|---|---|
| Source current | I_old = P/(V·PF_old) | I_new = P/(V·PF_new) |
| Reactive | Q_old = P·tan(φ_old) | Q_new = Q_old + Q_C (Q_C < 0 for C) |
| Source I²R loss | ∝ I_old² | ∝ I_new² (lower ⇒ saves feeder loss) |`,
    practical_application: `**Utility-side PF-correction capacitor bank (480 V, 100 kVAR).** The engineer sizes the bank for a 480 V plant with a 0.70 PF, 200 kVA load. Per-phase Q_C = 100/3 = 33.3 kVAR. C_per_phase = Q_C/(ω·V_phase²) = 33 300/(377 × 277²) = 33 300/(377 × 76 729) = 33 300/28 927 000 = 1.15×10⁻³ F = 1150 μF per phase (line-to-neutral). Standard 600 V film-capacitor cans of 100 kVAR are selected and connected wye (line-to-neutral). NFPA 70 Art. 460 requires a discharge resistor bringing terminal voltage below 50 V within 1 minute of disconnection: with C = 1150 μF and τ = RC ≤ 60 s ⇒ R ≤ 60/1150×10⁻⁶ = 52 200 Ω. Choose a 50 kΩ 100 W resistor per phase. IEEE 141 Ch. 7 requires the engineer to verify the bank does not resonate with the supply inductance near a load harmonic (e.g., the 5th at 300 Hz): f_resonance = 1/(2π·√(L_source·C_bank)) must be checked against 300 Hz.`,
    decision_scenario: `You are the energy manager at Harborview Manufacturing, choosing between (A) a 100 kVAR PF-correction bank at $3900 and (B) a 90 kVAR bank at $3510 to eliminate a $9720/yr utility PF penalty. Both bring PF above the 0.90 tariff threshold. Option A leaves the system slightly leading at light load (the bank overcompensates at night when motors are off); the leading PF can raise the bus voltage (Ferranti effect on long feeders). Option B is sized for unity PF at full load only, with no overcompensation at light load. Decision rule: at 60 % light-load duty and a leading-PF overvoltage concern of 3 % on the 480 V bus, option B avoids the overvoltage and saves $390 in CapEx. Choose B. (This case study is worked in the case-study section.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: RMS of a sinusoid, series RLC impedance at 60 Hz, single-phase apparent power and PF, PF-correction capacitor behavior.`,
    certification_questions: `This lesson's content maps to the NCEES FE Electrical & Computer exam (AC circuit analysis, single-phase power, PF), the IEC 60364 series, and NFPA 70 (NEC) Articles 210 (branch-circuit PF), 460 (capacitors), and the IEEE Std 519-2014 harmonic limits. Sample FE-style question: "A 240 V_rms source feeds a load drawing 10 A_rms at 0.8 PF lagging. The real power P and reactive power Q are: (a) P=1920 W, Q=1440 VAR, (b) P=2400 W, Q=0 VAR, (c) P=1920 W, Q=1920 VAR, (d) P=1440 W, Q=1920 VAR." Correct: (a) P = V·I·PF = 240·10·0.8 = 1920 W, Q = V·I·sin(arccos 0.8) = 2400·0.6 = 1440 VAR.`,
    summary: `AC analysis extends DC to sinusoidal steady-state via Steinmetz's 1893 phasor transform: v(t) = V_m·cos(ωt + φ) ↔ V = V_rms∠φ, with differentiation ↔ ×jω. Ohm's law generalizes to V = I·Z where Z = R + jX, X_L = +ωL, X_C = −1/(ωC). All DC theorems (KCL, KVL, node/mesh, Thévenin/Norton, superposition) carry over unchanged. RMS magnitudes (V_rms = V_m/√2) let AC power mirror DC: real P = V·I·cos(φ), reactive Q = V·I·sin(φ), apparent S = V·I, with S² = P² + Q² (the power triangle) and PF = cos(φ) = P/S. PF correction adds parallel C to cancel inductive Q — the basis of every industrial capacitor-bank installation sized under NFPA 70 Art. 460.`,
    key_takeaways: `- Phasor transform: v(t) = V_m·cos(ωt + φ) ↔ V = V_rms∠φ; differentiation ↔ ×jω; integration ↔ /(jω).
- Impedance: Z = R + jX, with X_L = +ωL (inductive), X_C = −1/(ωC) (capacitive); |Z| = √(R²+X²), φ = arctan(X/R).
- RMS: V_rms = V_m/√2 (pure sinusoid); use RMS magnitudes throughout power calculations.
- Single-phase power: P = V·I·cos(φ) [W], Q = V·I·sin(φ) [VAR], S = V·I [VA], with S² = P² + Q².
- Power factor PF = cos(φ) = P/S; lagging (inductive) vs leading (capacitive).
- PF correction: parallel C supplies Q_C = −ωCV²; sizing formula Q_C = P·(tan(φ_old) − tan(φ_new)).
- Always check: V_m·I_m ≠ P (must use RMS magnitudes); X_C is negative (sign-convention slip).`,
    references: `1. Alexander & Sadiku (2017), Ch. 9 (phasors), Ch. 10 (sinusoidal steady-state analysis), Ch. 11 (AC power, PF, complex power).
2. Nilsson & Riedel (2015), Ch. 9 (sinusoidal steady-state), Ch. 10 (sinusoidal power).
3. Hayt, Kemmerly & Durbin (2012), Ch. 9 (phasors), Ch. 10 (sinusoidal power, complex power S = VI*).
4. Boylestad (2016), Ch. 13 (sinusoidal AC, RMS), Ch. 14 (phasors & impedance), Ch. 19 (AC power, PF, PF correction).
5. IEEE Std 141-1993 (Red Book), Ch. 7 (PF correction — capacitor bank sizing, harmonic-resonance check).
6. NFPA 70 (NEC 2023), Art. 460 (capacitors — discharge-resistor sizing via τ = RC of Lesson 3).`,
  },
  knowledgeObject: {
    title: "AC Circuit Analysis — Knowledge Object",
    domain: "Electrical Circuits",
    competency: "Foundations",
    topic: "Sinusoidal Steady-State Phasor Analysis",
    concept: "Phasors + impedance Z = R + jX + RMS + power triangle + PF",
    body: {
      definitions: [
        "Phasor (Steinmetz 1893): a complex constant V = V_rms·e^{jφ} representing v(t) = V_m·cos(ωt + φ); linear isomorphism on the space of sinusoids at a single frequency.",
        "Impedance Z (Ω): Z = V/I = R + jX with R the resistance (real) and X the reactance (imaginary).",
        "Reactance: X_L = +ωL (inductive), X_C = −1/(ωC) (capacitive); the signs encode 90° phase shifts.",
        "Admittance Y = 1/Z (S): Y = G + jB with G conductance, B susceptance.",
        "RMS: V_rms = √(∫v(t)² dt / T); V_rms = V_m/√2 for a pure sinusoid.",
        "Real power P = V·I·cos(φ) [W]; reactive Q = V·I·sin(φ) [VAR]; apparent S = V·I [VA].",
        "Power factor PF = cos(φ) = P/S; lagging (inductive) vs leading (capacitive).",
      ],
      principles: [
        "Phasor transform is linear ⇒ all DC theorems (KCL, KVL, node/mesh, Thévenin/Norton, superposition) carry over.",
        "Differentiation ↔ ×jω; integration ↔ /(jω) — turns RLC ODEs into algebra.",
        "Z = R + jX; |Z| = √(R²+X²); φ = arctan(X/R); resonance at ω_0 = 1/√(LC) where Z = R.",
        "Power triangle S² = P² + Q² with PF = cos(φ) = P/S.",
        "PF correction: parallel C supplies Q_C = −ωCV²; sizing formula Q_C = P·(tan(φ_old) − tan(φ_new)).",
        "Single-frequency superposition: sources at different ω must be solved separately and combined in the time domain.",
      ],
      components: [
        "Resistor (Z = R) — dissipates P = I²R, no phase shift",
        "Inductor (Z = jωL = jX_L) — stores ½Li², current lags 90°",
        "Capacitor (Z = 1/(jωC) = jX_C) — stores ½Cv², current leads 90°",
        "Ideal AC voltage/current sources (V_s = V_rms∠φ, I_s = I_rms∠φ)",
        "Transformer — V₂/V₁ = N₂/N₁; matches load to source in audio/RF; steps transmission V in power",
        "Induction motor (industrial) — lagging PF ~0.85 full load, ~0.6 light load (principal PF-correction driver)",
      ],
      mechanism:
        "The phasor transform maps sinusoidal time-domain signals v(t), i(t) to complex constants V, I. The element relations v = R·i, v = L·di/dt, i = C·dv/dt become algebraic: V = R·I, V = jωL·I, I = jωC·V. The resulting linear circuit (V = I·Z, KCL, KVL) is solved exactly like a DC resistive circuit, but with complex arithmetic. RMS magnitudes make the resulting power calculations mirror DC: P = V·I·cos(φ) captures the real (dissipated) power, Q = V·I·sin(φ) the reactive (oscillating) power, S = V·I the source's apparent burden.",
      process:
        "Identify ω → convert sources to RMS phasors → replace R/L/C with Z = R/jωL/1/(jωC) → combine series/parallel with complex arithmetic → solve algebraic circuit (V=IZ, KCL, KVL, node/mesh) → compute |Z|, φ, P, Q, S, PF → size PF-correction C if needed → convert answer phasor back to time domain if required.",
      formulas: [
        "v(t) = V_m·cos(ωt + φ)  ⇔  V = V_rms∠φ = (V_m/√2)∠φ",
        "Z_R = R ;  Z_L = jωL = jX_L ;  Z_C = 1/(jωC) = jX_C  (X_C = −1/(ωC))",
        "Z_series = R + j(ωL − 1/(ωC)) = R + jX ;  |Z| = √(R²+X²) ;  φ = arctan(X/R)",
        "V_rms = V_m/√2  (pure sinusoid)",
        "P = V_rms·I_rms·cos(φ)  [W]",
        "Q = V_rms·I_rms·sin(φ)  [VAR]",
        "S = V_rms·I_rms = √(P² + Q²)  [VA]",
        "PF = cos(φ) = P/S",
        "Q_C (PF correction) = P·(tan(φ_old) − tan(φ_new)) ;  C = Q_C/(ω·V²)",
        "Resonance: ω_0 = 1/√(LC)  ;  Q_factor = ω_0·L/R",
      ],
      metrics: [
        "Voltage/current phasor magnitudes (V_rms, A_rms)",
        "Impedance magnitude |Z| and phase φ (deg)",
        "Real power P (kW), reactive Q (kVAR), apparent S (kVA)",
        "Power factor PF (dimensionless, 0–1, leading/lagging)",
        "PF-correction bank size Q_C (kVAR) and per-phase capacitance C (μF)",
        "Feeder I²R loss reduction from PF correction",
        "IEEE 519 harmonic current distortion limits at the point of common coupling",
      ],
      examples: [
        "Series RLC at 60 Hz: R=100Ω, L=0.5H, C=5μF → X_L=188.5Ω, X_C=530.5Ω, X=−342Ω (capacitive), |Z|=356Ω, φ=−73.7°, PF=0.282 leading. At V=120 V_rms: I=0.337 A, S=40.4 VA, P=11.4 W, Q=−38.9 VAR.",
        "240 V/10 A/0.8 PF lagging load: S=2400 VA, P=1920 W, Q=1440 VAR. PF correction to unity: C = 1440/(377×240²) = 66.3 μF; source current drops from 10 A to 8.0 A.",
      ],
      industrial_examples: [
        "Manufacturing — 480 V plant, 200 kVA at 0.70 PF; 100 kVAR capacitor bank brings Q from 143 to 43 kVAR; $750/month utility penalty eliminated; payback 4.7 months; NFPA 70 Art. 460 discharge resistor sized via τ = RC of Lesson 3.",
      ],
      case_studies: [
        "SYNTHETIC — Harborview Manufacturing Plant PF-Correction: 250 kVA, 0.75 PF load; $9720/yr utility penalty; 90 kVAR bank at $3510 CapEx eliminates penalty; payback 4.3 months; chosen over 100 kVAR option to avoid light-load leading-PF overvoltage (Ferranti effect).",
      ],
      common_errors: [
        "Mixing peak and RMS magnitudes: P = V·I·cos(φ) requires both V and I in RMS; using V_m and I_m gives twice the real power.",
        "Sign of reactance: X_C is NEGATIVE (capacitive); students write +1/(ωC) and lose the sign. Use Z_C = 1/(jωC) = −j/(ωC) consistently.",
        "Confusing leading vs lagging: capacitive (φ<0) → current LEADS; inductive (φ>0) → current LAGS. ELI the ICE man.",
        "Adding P and Q to get S: S = √(P² + Q²), NOT P + Q. A 100 W / 100 VAR load has S = 141 VA.",
        "Solving multi-frequency circuits in phasor form: superposition in phasors requires SAME ω; different ω must be solved separately and combined in the time domain.",
        "Neglecting harmonics: distorted currents (VSDs, rectifiers) require Fourier analysis and true-RMS metering; IEEE 519 limits apply at the PCC.",
      ],
      limitations: [
        "Linear elements only — real L has series winding R, real C has parallel leakage, both have non-linear saturation.",
        "Single frequency — multi-frequency circuits must be solved per-ω and combined in time domain.",
        "Sinusoidal steady-state only — switch-on transients are NOT captured (Lesson 3).",
        "No harmonics — distorted waveforms require Fourier analysis; IEEE 519 limits apply.",
        "Balanced three-phase at single-phase scope — unbalanced loads require sequence-network analysis.",
        "Skin effect at high frequency — R_ac > R_dc above ~10 kHz for typical wire; transmission-line model supersedes lumped Z above ~30 MHz.",
      ],
      best_practices: [
        "Use RMS magnitudes throughout power calculations (V_m·I_m ≠ P).",
        "Maintain the sign convention X_C < 0 (capacitive); use Z_C = 1/(jωC) consistently.",
        "Verify every AC solution with a power-balance check: S_source = S_load (with P_load = S_load·cos(φ) verified against I²·R).",
        "Size PF-correction capacitors using Q_C = P·(tan(φ_old) − tan(φ_new)) and verify the IEEE 141 Ch. 7 harmonic-resonance check (f_resonance = 1/(2π·√(L_source·C_bank)) not near a load harmonic).",
        "Install per NFPA 70 Art. 460: discharge resistor ≤ 50 kΩ bringing terminal voltage below 50 V in 1 min (τ = RC sizing from Lesson 3).",
      ],
      related_concepts: [
        "DC circuit analysis — Ohm, KCL, KVL (Lesson 1) — the foundation the phasor transform extends",
        "First-order RC/RL transients — switch-on behavior before steady-state (Lesson 3)",
        "Three-phase power and sequence networks (Alexander & Sadiku Ch. 12)",
        "Transmission-line theory — distributed-parameter limit at high frequency",
        "Harmonics and IEEE 519 — distorted-current power quality (IEEE Std 519-2014)",
        "Transformer equivalent circuit — per-unit analysis (IEEE 141 Ch. 4)",
      ],
      prerequisites: [
        "Lesson 1 — DC Circuit Analysis (Ohm, KCL, KVL, node/mesh, Thévenin/Norton)",
        "Complex algebra (a+jb, polar/rectangular conversion, Euler's identity)",
        "Sinusoidal functions (amplitude, ω, φ; derivative/integral of sinusoids)",
        "Definition of RMS (V_rms = √(∫v²dt/T))",
      ],
      references: CIRCUITS_REFERENCE_TITLES,
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
        "The RMS value of a sinusoidal voltage with peak amplitude V_m = 170 V is approximately:",
      explanation:
        "V_rms = V_m/√2 = 170/1.414 = 120 V. This is the heating value of the sinusoid — the same average power delivered to a resistor by a 120 V DC source.",
      whyCorrect:
        "For a pure sinusoid v(t) = V_m·cos(ωt), the RMS (root-mean-square) value is V_rms = V_m/√2 ≈ 0.707·V_m. With V_m = 170 V, V_rms = 170/√2 = 170/1.4142 = 120.2 V ≈ 120 V. This is the basis for the U.S. 120 V_rms residential line voltage (whose peak is V_m = 120·√2 ≈ 170 V).",
      whyOthersWrong: [
        "Option 85 V is V_m/2 (half the peak) — the RMS of a triangular waveform, not a sinusoid.",
        "Option 170 V is the peak V_m itself — RMS is NOT the peak; the heating value is lower than the peak for a sinusoid.",
        "Option 240 V is V_m·√2 = 170·1.414 = 240 V — the peak of a 240 V_rms sinusoid, not the RMS of the given V_m = 170 V peak.",
      ],
      options: [
        { text: "85 V", isCorrect: false },
        { text: "120 V", isCorrect: true },
        { text: "170 V", isCorrect: false },
        { text: "240 V", isCorrect: false },
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
        "A series RLC circuit has R = 100 Ω, L = 0.5 H, C = 5 μF, driven at f = 60 Hz (ω = 2π·60 = 377 rad/s). The impedance Z, its magnitude |Z|, and phase φ are approximately:",
      explanation:
        "X_L = ωL = 377·0.5 = 188.5 Ω; X_C = 1/(ωC) = 1/(377·5e-6) = 530.5 Ω; X = X_L − X_C = −342 Ω (net capacitive); |Z| = √(100²+342²) = 356.3 Ω; φ = arctan(−342/100) = −73.7° (current leads).",
      whyCorrect:
        "Compute the reactances: X_L = ωL = 377 × 0.5 = 188.5 Ω and X_C = 1/(ωC) = 1/(377 × 5×10⁻⁶) = 530.5 Ω. The net reactance is X = X_L + X_C = 188.5 + (−530.5) = −342 Ω (the negative sign is capacitive — the capacitor's reactance is negative). The impedance is Z = R + jX = 100 − j342 Ω. The magnitude is |Z| = √(R² + X²) = √(100² + 342²) = √(10 000 + 116 964) = √126 964 = 356.3 Ω. The phase angle is φ = arctan(X/R) = arctan(−342/100) = arctan(−3.42) = −73.7°. The negative phase means the current LEADS the voltage (capacitive, leading PF).",
      whyOthersWrong: [
        "Option (100 Ω, 0°) treats the network as purely resistive — ignores both reactances entirely, valid only at the resonant frequency f_0 = 1/(2π·√(LC)) = 100.7 Hz, not 60 Hz.",
        "Option (188.5 Ω, +90°) keeps only the inductive reactance X_L and drops both R and X_C — an inductor-only impedance, not a series RLC.",
        "Option (530 Ω, −90°) keeps only the capacitive reactance X_C and drops R and X_L — a capacitor-only impedance, not a series RLC; the net phase −73.7° is the vector combination of R and net X, not the −90° of a pure C.",
      ],
      options: [
        { text: "100 Ω at 0° (purely resistive)", isCorrect: false },
        { text: "188.5 Ω at +90° (purely inductive)", isCorrect: false },
        { text: "356 Ω at −73.7° (net capacitive, current leads)", isCorrect: true },
        { text: "530 Ω at −90° (purely capacitive)", isCorrect: false },
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
        "A single-phase 240 V_rms source feeds an inductive load drawing I_rms = 10 A at power factor PF = 0.8 lagging. The real power P and reactive power Q drawn by the load are:",
      explanation:
        "S = V·I = 240·10 = 2400 VA; φ = arccos(0.8) = 36.87°; P = S·PF = 2400·0.8 = 1920 W; Q = S·sin(φ) = 2400·sin(36.87°) = 2400·0.6 = 1440 VAR (inductive, positive).",
      whyCorrect:
        "Compute the apparent power first: S = V_rms · I_rms = 240 × 10 = 2400 VA. The phase angle follows from the PF: φ = arccos(PF) = arccos(0.8) = 36.87°. The real power is P = S·cos(φ) = S·PF = 2400 × 0.8 = 1920 W. The reactive power is Q = S·sin(φ) = 2400 × sin(36.87°) = 2400 × 0.6 = 1440 VAR (positive because the load is inductive, lagging PF). Verify the power triangle: P² + Q² = 1920² + 1440² = 3 686 400 + 2 073 600 = 5 760 000 = 2400² = S² ✓.",
      whyOthersWrong: [
        "Option (P=2400 W, Q=0 VAR) assumes unity PF — would require φ = 0, contradicting the given PF = 0.8 lagging.",
        "Option (P=1920 W, Q=1920 VAR) sets Q = P, which would give PF = cos(arctan(1)) = 0.707, not 0.8 — a slip in the sin(φ) vs cos(φ) identification (sin(36.87°) = 0.6, not 0.8).",
        "Option (P=1440 W, Q=1920 VAR) swaps P and Q — treats sin(φ) as cos(φ) and vice versa; with the given 0.8 PF, cos(φ) = 0.8 (not 0.6), so P (not Q) is the larger value.",
      ],
      options: [
        { text: "P = 2400 W, Q = 0 VAR", isCorrect: false },
        { text: "P = 1920 W, Q = 1920 VAR", isCorrect: false },
        { text: "P = 1920 W, Q = 1440 VAR", isCorrect: true },
        { text: "P = 1440 W, Q = 1920 VAR", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem:
        "True or False: Adding a pure capacitor in parallel with an inductive load, supplied by a fixed-voltage source at fixed real-power draw, always reduces the magnitude of the source current.",
      explanation:
        "FALSE. The minimum source current occurs when the capacitor's negative Q_C exactly cancels the load's positive Q_L (unity PF). Adding more capacitance beyond this point drives the net reactive negative (capacitive), and the source current magnitude rises again. The optimal C is finite — overcorrection increases source current.",
      whyCorrect:
        "FALSE. The source current magnitude is |I_s| = |S|/V = √(P² + Q_net²)/V, where Q_net = Q_L + Q_C. The capacitor contributes Q_C = −ω·C·V² (negative — capacitive). As C increases from zero, Q_net decreases from Q_L (inductive, positive) toward zero, and |I_s| decreases monotonically — reaching its MINIMUM value |I_s,min| = P/V when Q_net = 0 (unity PF). Beyond this optimal C, Q_net becomes negative (net capacitive) and |I_s| rises again. So 'always reduces' is FALSE — only the CORRECT amount of capacitance reduces |I_s|; overcorrection (a too-large C) drives the source current back up. The optimal size is C_opt = Q_L/(ω·V²) = P·tan(φ_old)/(ω·V²), which brings PF to unity.",
      whyOthersWrong: [
        "Option TRUE — would conflate the monotonic decrease (valid as C increases from 0 to the optimal unity-PF value) with the global statement 'always reduces'. Beyond the unity-PF optimum, additional C increases the source current magnitude (the load becomes net capacitive, leading PF, and the source current rises). The correct statement is: a FINITE optimal C minimizes the source current; any departure (more or less C) raises |I_s|.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Transient Analysis & Network Theorems
// (slug: circuits-transients-theorems)
// ---------------------------------------------------------------------------

const LESSON_TRANSIENT: RefLesson = {
  slug: "circuits-transients-theorems",
  title: "Transient Analysis & Network Theorems",
  titleAr: "التحليل العابر ونظرية الشبكات",
  order: 3,
  durationMin: 40,
  references: CIRCUITS_REFERENCE_TITLES,
  conceptIntroduction: `Steady-state analysis (DC in Lesson 1, AC phasor in Lesson 2) describes a circuit long after any switching event. *Transient analysis* describes the path from one steady state to another — the exponential rise of a capacitor voltage as it charges through a resistor, the exponential rise of an inductor current, the settling time governed by a *time constant* τ. For a first-order RC circuit, τ = RC (seconds); for a first-order RL circuit, τ = L/R. The capacitor voltage follows v_C(t) = V_final + (V_initial − V_final)·e^(−t/τ); the inductor current follows i_L(t) = I_final + (I_initial − I_final)·e^(−t/τ). After t ≈ 5τ the transient is ≥ 99 % settled. This lesson develops the first-order RC and RL transient response, *superposition* (the linear-system principle that lets you sum single-source responses), and the *maximum-power-transfer* theorem (R_L = R_Th maximizes load power). Worked examples: RC charging v(t) = V(1 − e^(−t/RC)) with explicit numbers, and the Thévenin source delivering P_max = V_Th²/(4·R_Th) to a matched load. Network theorems close the DC/AC/transient cycle on which the electrical-engineering curriculum rests.`,
  sections: {
    learning_objectives: `- Define a circuit transient and explain why switching events produce non-steady-state behavior.
- Derive the first-order RC charging equation v_C(t) = V(1 − e^(−t/RC)) for a step input at t = 0; state the time constant τ = RC.
- Derive the first-order RL equation i_L(t) = I(1 − e^(−t·R/L)) for a step input; state τ = L/R.
- State the natural (source-free) response v_C(t) = V_0·e^(−t/τ) and the step (driven) response v_C(t) = V_final + (V_0 − V_final)·e^(−t/τ).
- Compute settling time: ≥ 99 % settled at t ≈ 5τ; ≥ 63.2 % at t = τ; ≥ 86.5 % at t = 2τ.
- State and apply the superposition theorem for linear circuits containing multiple independent sources.
- State and apply the maximum-power-transfer theorem: R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th) (DC) or Z_L = Z_Th* (complex conjugate) for AC.
- Apply the substitution theorem and Millman's theorem where appropriate.`,
    prerequisites: `- Lessons 1 & 2 — DC and AC circuit analysis (Ohm, KCL, KVL, Thévenin/Norton, phasors, impedance).
- First-order ordinary differential equations: dy/dt + (1/τ)·y = f(t); the homogeneous solution y_h = A·e^(−t/τ) and the particular solution y_p.
- Initial conditions for energy-storage elements: v_C cannot change instantaneously (v_C(0⁺) = v_C(0⁻)); i_L cannot change instantaneously (i_L(0⁺) = i_L(0⁻)).
- Exponential function: e^0 = 1, e^(−1) ≈ 0.368, e^(−5) ≈ 0.0067; the time constant τ sets the rate of decay.
- Euler's identity e^{jθ} = cos(θ) + j·sin(θ) (for the AC maximum-power extension).`,
    introduction: `A *transient* is the dynamic path of a circuit variable (voltage, current) between two steady states. The classic example: at t = 0 a switch closes, connecting a DC source V to a series RC circuit. The capacitor voltage cannot jump (charge is conserved across the switching instant — a voltage jump would require an infinite current through the resistor), so v_C(0⁺) = v_C(0⁻) = 0 (initially uncharged). The current at t = 0⁺ is V/R (the uncharged capacitor looks like a short). As charge accumulates on the plates, v_C rises, the voltage across R drops, the current falls. KVL gives V = v_R + v_C = R·i + v_C = RC·dv_C/dt + v_C, a first-order linear ODE with solution v_C(t) = V(1 − e^(−t/RC)). The exponential time constant τ = RC sets the rate: at t = τ the capacitor has reached 63.2 % of V; at t = 5τ it is 99.3 % settled. The dual circuit, a series RL driven by a step V, has τ = L/R and i_L(t) = (V/R)·(1 − e^(−t·R/L)) — the inductor current cannot jump (flux conservation), so the inductor initially looks like an open.

The *natural* (source-free) response of a charged RC discharging through a resistor is v_C(t) = V_0·e^(−t/RC) — pure exponential decay. The general first-order form combines initial value, final value, and time constant: x(t) = x_final + (x_initial − x_final)·e^(−t/τ), where x is any capacitor voltage or inductor current. After ≈ 5τ the transient is gone and the steady-state (DC or AC) analysis of Lessons 1–2 applies.

The two network theorems that close the curriculum are *superposition* and *maximum power transfer*. Superposition states that in any *linear* circuit, the response (voltage or current) to multiple independent sources equals the algebraic sum of the responses to each source acting alone (with all other independent sources killed: voltage → short, current → open; dependent sources NEVER killed). Maximum power transfer states that a load R_L receives maximum power from a Thévenin source V_Th, R_Th when R_L = R_Th, with P_max = V_Th²/(4·R_Th). In AC, the extension is Z_L = Z_Th* (complex conjugate — conjugate impedance matching for maximum active power). This lesson works an RC charging transient with explicit numbers and a Thévenin maximum-power example, then sets up the synthesis of all three lessons in the summary.`,
    terminology: `- **Steady state**: the long-time behavior of a circuit variable (constant in DC, sinusoidal in AC).
- **Transient**: the dynamic path between two steady states, decaying exponentially with τ.
- **Time constant τ**: the time for an exponential to fall to 1/e ≈ 36.8 % of its initial value; τ = RC (RC circuit), τ = L/R (RL circuit); seconds.
- **Natural (source-free) response**: behavior with no independent source active — pure exponential decay, v_C(t) = V_0·e^(−t/τ).
- **Step (forced, driven) response**: behavior with a DC source switched in at t = 0 — v_C(t) = V_final + (V_0 − V_final)·e^(−t/τ).
- **Initial condition**: v_C(0⁺) = v_C(0⁻) (capacitor voltage continuity); i_L(0⁺) = i_L(0⁻) (inductor current continuity).
- **Final value**: x(∞) — the steady-state value (V for a step input to a series RC; V/R for a series RL).
- **Settling time**: t ≈ 5τ for ≥ 99.3 % settled (engineering steady state).
- **Superposition**: linear response to N independent sources = Σ of single-source responses (other independent sources killed).
- **Maximum power transfer**: R_L = R_Th (DC) or Z_L = Z_Th* (AC conjugate) ⇒ P_L,max = V_Th²/(4·R_Th) (DC) or |V_Th|²/(4·R_Th) (AC, real power).`,
    detailed_explanation: `**First-order RC step response.** A resistor R and capacitor C in series are connected at t = 0 to a DC source V (capacitor initially uncharged). KVL around the loop:
  V = v_R(t) + v_C(t) = R·i(t) + v_C(t)
Using i(t) = C·dv_C/dt:
  RC·dv_C/dt + v_C = V        (first-order linear ODE, constant forcing)
Homogeneous solution: v_C,h = A·e^(−t/RC). Particular solution: v_C,p = V (constant). General solution: v_C(t) = V + A·e^(−t/RC). Apply initial condition v_C(0⁺) = 0 (initially uncharged, and voltage continuity forbids a jump): 0 = V + A ⇒ A = −V. So v_C(t) = V·(1 − e^(−t/RC)). The current i(t) = C·dv_C/dt = (V/R)·e^(−t/RC) — starts at V/R (the uncharged capacitor is a short) and decays exponentially to zero (a fully charged capacitor is an open). The time constant τ = RC governs the rate: at t = τ, v_C = 0.632 V (63.2 % settled); at t = 5τ, v_C = 0.993 V (99.3 % settled, engineering steady state).

**First-order RL step response.** Series R–L connected at t = 0 to a DC source V (inductor initially de-energized). KVL:
  V = v_R + v_L = R·i + L·di/dt   ⇒   (L/R)·di/dt + i = V/R
General solution: i(t) = (V/R)·(1 − e^(−t·R/L)). The time constant τ = L/R. Initial condition i(0⁺) = 0 (inductor current continuity — the inductor looks like an open at t = 0⁺); final value i(∞) = V/R (the inductor is a short to DC in steady state). The voltage across the inductor v_L = L·di/dt = V·e^(−t·R/L) — starts at V (full source voltage across L) and decays to zero.

**General first-order form.** Any single-capacitor or single-inductor circuit (after Thévenin reduction at the energy-storage-element terminals) has the universal solution:
  x(t) = x_final + (x_initial − x_final)·e^(−t/τ)
where x is the capacitor voltage or inductor current, x_initial = x(0⁺) (from continuity), x_final = x(∞) (steady-state value found by DC analysis — capacitor = open, inductor = short), and τ = R_Th·C or L/R_Th (R_Th is the Thévenin resistance seen at the energy-storage-element terminals with all independent sources killed). This is the *method of time constants* — three numbers (initial, final, τ) capture the entire transient.

**Superposition theorem.** In a *linear* circuit containing two or more independent sources, the response (any voltage or current) equals the algebraic sum of the responses produced by each independent source acting alone, with all other *independent* sources killed: voltage sources → short circuits (V = 0), current sources → open circuits (I = 0). Dependent (controlled) sources are NEVER killed — they remain active because their values are set by the circuit variables. Superposition does not apply to power directly (P = I² is non-linear); you must compute the total voltage or current first, then square it for power.

**Maximum power transfer theorem.** A linear source with Thévenin equivalent (V_Th, R_Th) delivers maximum power to a load R_L when R_L = R_Th. The proof: I = V_Th/(R_Th + R_L); P_L = I²·R_L = V_Th²·R_L/(R_Th + R_L)². Differentiate dP_L/dR_L and set to zero ⇒ R_L = R_Th. The maximum power is P_L,max = V_Th²/(4·R_Th) — the source dissipates the same V_Th²/(4·R_Th) internally, so the transfer efficiency at maximum-power-match is 50 % (acceptable for signal, wasteful for power). The AC extension: Z_L = Z_Th* (complex conjugate) for maximum *active* (real) power — conjugate impedance matching (e.g., a 50 + j30 Ω source requires 50 − j30 Ω load).`,
    core_principles: `- **Capacitor voltage continuity**: v_C(0⁺) = v_C(0⁻); a voltage jump requires infinite current (impossible through a resistor).
- **Inductor current continuity**: i_L(0⁺) = i_L(0⁻); a current jump requires infinite voltage (impossible across an inductor with finite L).
- **First-order form**: x(t) = x_final + (x_initial − x_final)·e^(−t/τ) — three numbers (initial, final, τ) capture the entire transient.
- **Time constants**: τ_RC = R_Th·C (RC circuit); τ_RL = L/R_Th (RL circuit); t ≈ 5τ for ≥ 99 % settled.
- **Superposition**: linear response to N independent sources = Σ single-source responses (other independent sources killed; dependent sources active).
- **Maximum power transfer (DC)**: R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th); 50 % efficiency at match.
- **Maximum power transfer (AC)**: Z_L = Z_Th* (complex conjugate) ⇒ max active power = |V_Th|²/(4·R_Th).`,
    components: `- **Capacitor (C, F)**: stores energy ½Cv² in the electric field; v_C continuous across switching.
- **Inductor (L, H)**: stores energy ½Li² in the magnetic field; i_L continuous across switching.
- **Switch (mechanical or solid-state)**: opens or closes a branch at t = 0; triggers the transient.
- **DC source V (or step input u(t))**: drives the forced response.
- **Thévenin equivalent (V_Th, R_Th)**: the source seen at the energy-storage terminals; sets τ = R_Th·C or L/R_Th.
- **Snubber (R_snub, C_snub)**: a parallel RC across a switch or inductive load that limits dV/dt and absorbs the inductive stored energy at turn-off — sized via τ_snub = R_snub·C_snub (the industrial transient application).
- **Discharge resistor** (NFPA 70 Art. 460): drains a charged capacitor to safe voltage within 1 minute of disconnection; sized via τ = RC.`,
    process: `1. Identify the single energy-storage element (C or L); if multiple, Thévenin-reduce the resistive part of the circuit at its terminals.
2. Find the Thévenin resistance R_Th seen at the energy-storage terminals (kill independent sources, look in): τ = R_Th·C (RC) or L/R_Th (RL).
3. Find the initial value x_initial = x(0⁺) using continuity: v_C(0⁺) = v_C(0⁻); i_L(0⁺) = i_L(0⁻). For a switch event at t = 0, compute x(0⁻) using the pre-switch circuit, then carry it forward.
4. Find the final value x_final = x(∞) using DC steady-state analysis: capacitor → open (i_C = 0); inductor → short (v_L = 0).
5. Write x(t) = x_final + (x_initial − x_final)·e^(−t/τ) for t ≥ 0.
6. Compute any other quantity (current, voltage across another element) from x(t) using KCL/KVL and Ohm's law.
7. For multiple sources in a LINEAR circuit: apply superposition — solve with one independent source active, all others killed; sum.
8. For maximum power transfer: Thévenin-reduce the source network; set R_L = R_Th (DC) or Z_L = Z_Th* (AC); P_L,max = V_Th²/(4·R_Th).
9. Verify: continuity at t = 0; steady-state at t → ∞; energy conservation (power-balance check).`,
    formula_calculation: `**RC step response (charging from V=0):**
  v_C(t) = V·(1 − e^(−t/RC))            for t ≥ 0
  i_C(t) = (V/R)·e^(−t/RC)

**RC natural (discharge) response (from V_0):**
  v_C(t) = V_0·e^(−t/RC)
  i_C(t) = −(V_0/R)·e^(−t/RC)   (discharging ⇒ opposite sign)

**RL step response (energizing from I=0):**
  i_L(t) = (V/R)·(1 − e^(−t·R/L))       for t ≥ 0
  v_L(t) = V·e^(−t·R/L)

**RL natural (de-energizing) response (from I_0):**
  i_L(t) = I_0·e^(−t·R/L)
  v_L(t) = −I_0·R·e^(−t·R/L)

**General first-order form:**
  x(t) = x_final + (x_initial − x_final)·e^(−t/τ)
  τ_RC = R_Th·C         τ_RL = L/R_Th

**Settling time:**
  t = τ   ⇒  63.2 % settled
  t = 2τ  ⇒  86.5 % settled
  t = 3τ  ⇒  95.0 % settled
  t = 5τ  ⇒  99.3 % settled  (engineering steady state)

**Superposition (linear circuits):**
  response_total = Σ_k response_to_source_k_alone
  (other independent V-sources shorted; I-sources opened; dependent sources active)

**Maximum power transfer (DC):**
  R_L = R_Th  ⇒  P_L,max = V_Th²/(4·R_Th)        [50 % efficiency at match]
  P_L(R_L) = V_Th²·R_L/(R_Th + R_L)²

**Maximum power transfer (AC, complex conjugate match):**
  Z_L = Z_Th* = R_Th − jX_Th
  P_L,max = |V_Th|²/(4·R_Th)

**Assumptions**: (i) linear R, L, C (constant, no saturation); (ii) first-order (single energy-storage element or Thévenin-reducible to one); (iii) ideal step at t = 0 (zero rise time); (iv) no distributed-parameter effects (lumped-element); (v) for superposition, all sources at the same frequency (else combine in time domain).

**Interpretation**: τ sets the timescale of every switching event — switch bounce, relay timing, capacitor discharge, snubber recovery. The 5τ rule of thumb is the engineer's mental model for "how long until I can treat this as steady state." Maximum power transfer sets the impedance-matching target of every signal interconnect (50 Ω RF, 600 Ω audio, 75 Ω video) and the energy-budget ceiling of every sensor-coupled amplifier.`,
    worked_example: `**RC charging.** A series RC circuit with R = 1 kΩ, C = 10 μF is connected at t = 0 to a 12 V DC source (capacitor initially uncharged).
  τ = R·C = 1000 × 10×10⁻⁶ = 10×10⁻³ = 10 ms
  v_C(t) = V·(1 − e^(−t/τ)) = 12·(1 − e^(−t/0.01))   [V, seconds]
  i_C(t) = (V/R)·e^(−t/τ) = (12/1000)·e^(−t/0.01) = 12·e^(−t/0.01) mA

At t = τ = 10 ms (one time constant):
  v_C = 12·(1 − e^(−1)) = 12·(1 − 0.368) = 12·0.632 = 7.586 V ≈ 7.59 V
  i_C = 12·e^(−1) = 12·0.368 = 4.42 mA

At t = 2τ = 20 ms:  v_C = 12·(1 − e^(−2)) = 12·0.865 = 10.38 V (86.5 %)
At t = 3τ = 30 ms:  v_C = 12·(1 − e^(−3)) = 12·0.950 = 11.40 V (95.0 %)
At t = 5τ = 50 ms:  v_C = 12·(1 − e^(−5)) = 12·0.9933 = 11.92 V (99.3 % — engineering steady state)

Verify continuity at t = 0⁺: v_C(0⁺) = 0 (initially uncharged, voltage continuity) ✓; i_C(0⁺) = V/R = 12/1000 = 12 mA (the uncharged capacitor looks like a short) ✓.
Verify steady state at t → ∞: v_C(∞) = 12 V (capacitor = open, full source voltage across it); i_C(∞) = 0 (no current through an open) ✓.

**Maximum power transfer.** A DC source has Thévenin equivalent V_Th = 10 V in series with R_Th = 50 Ω. Find the load R_L that maximizes the load power and the maximum power delivered.
  R_L = R_Th = 50 Ω (matched load)
  I = V_Th/(R_Th + R_L) = 10/(50 + 50) = 10/100 = 0.100 A = 100 mA
  V_L = I·R_L = 0.100 × 50 = 5.00 V
  P_L = V_L·I = 5 × 0.1 = 0.500 W  (= 500 mW)
  Cross-check: P_L = V_Th²·R_L/(R_Th + R_L)² = 100·50/100² = 5000/10000 = 0.500 W ✓
  P_L,max formula: V_Th²/(4·R_Th) = 100/(4·50) = 100/200 = 0.500 W ✓
  Source efficiency at match: P_L/(P_L + P_RTh) = 0.5/(0.5 + 0.5) = 50 % (the other 50 % is dissipated in R_Th).

If instead R_L = 25 Ω (mismatched):
  I = 10/75 = 0.133 A; V_L = 0.133·25 = 3.33 V; P_L = 3.33·0.133 = 0.444 W (< 0.500 W) — suboptimal.
If R_L = 100 Ω:
  I = 10/150 = 0.0667 A; V_L = 0.0667·100 = 6.67 V; P_L = 6.67·0.0667 = 0.444 W (< 0.500 W) — suboptimal.
The match at R_L = R_Th = 50 Ω is the unique optimum.`,
    industrial_example: `**Industry: Automation — relay coil de-energization and RC snubber.** A 24 V DC relay coil has L = 0.80 H and R = 240 Ω (a 100 mA holding current). When the driving transistor turns off at t = 0, the inductor current cannot jump (flux conservation): i_L(0⁺) = 100 mA. Without a snubber, the only path for this current is the transistor's off-state capacitance and any parasitic arc — the coil voltage spikes to v_L = −L·di/dt = hundreds of volts, destroying the transistor. An RC snubber (R_snub = 1 kΩ, C_snub = 0.1 μF, τ_snub = R_snub·C_snub = 100 μs) placed across the coil gives the current a path: the capacitor initially looks like a short, absorbing the inductor's stored energy ½Li² = ½·0.8·0.1² = 4 mJ; the resistor dissipates it as heat over ~5τ_snub = 500 μs. The peak snubber voltage is V_peak = i_L(0⁺)·R_snub = 0.1·1000 = 100 V — safely below the transistor's 400 V V_CEO rating. The peak voltage and the discharge time are both direct applications of the τ = RC and v = V·e^(−t/τ) relations of this lesson. NFPA 70 Art. 460 applies the same RC discharge principle to the PF-correction capacitor bank (Lesson 2) — sized to bring V below 50 V in 1 min (τ = RC ≤ 60 s).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Substation Battery Discharge-Resistor Sizing (synthetic, illustrative).* A 125 V DC substation battery bank has C_total ≈ 250 Ah/(125 V / 3600 s) ≈ 7.2 F of equivalent capacitance (lead-acid cells model as a large C in parallel with the chemical emf). NFPA 70 Art. 460 requires that any charged capacitor ≥ 50 V be drained to ≤ 50 V within 1 minute of disconnection. The substation engineer specifies a discharge resistor across the bank that must bring 125 V → ≤ 50 V in 60 s. Using the natural-discharge form v_C(t) = V_0·e^(−t/τ) with V_0 = 125 V, v(60 s) ≤ 50 V ⇒ 50/125 = e^(−60/τ) ⇒ ln(0.4) = −0.916 ⇒ 60/τ = 0.916 ⇒ τ ≤ 65.5 s. Since τ = R·C and C = 7.2 F ⇒ R ≤ 65.5/7.2 = 9.1 Ω. The resistor's continuous dissipation rating under float is V²/R = 125²/9.1 = 1719 W — three 600 W 3 Ω resistors in series (9 Ω total) handle the duty with margin. The 5τ recovery to ≤ 1 % of V_0 (1.25 V) takes ~5 min. This case study ties the lesson's first-order RC equation to the NFPA 70 Art. 460 discharge-resistor sizing requirement that every industrial PF-correction and battery installation must meet.`,
    visual_explanation: `**Exponential charging curve.** Plot v_C(t)/V vs t/τ: the curve starts at (0, 0), rises steeply through (1, 0.632), (2, 0.865), (3, 0.950), (4, 0.982), (5, 0.993) — asymptotically approaching 1 as t → ∞. The current i_C(t) = (V/R)·e^(−t/τ) starts at (0, 1.0) and decays through the same time constants: (1, 0.368), (2, 0.135), (3, 0.050), (5, 0.007). The product i_C(t)·v_C(t) = power into the capacitor, which peaks at t = τ/2 and returns to zero at t = ∞.

**Thévenin power-vs-load curve.** Plot P_L vs R_L for a V_Th/R_Th source: P_L is zero at R_L = 0 (short — no voltage) and at R_L = ∞ (open — no current); it peaks at R_L = R_Th with P_L,max = V_Th²/(4·R_Th). The curve is symmetric on a log-R_L axis around R_Th — the load is "matched" at the peak. At R_L = 0.5·R_Th or 2·R_Th, P_L = 0.889·P_L,max (89 % of peak) — a useful engineering rule: P_L stays within 11 % of the peak for any R_L in the 0.5× to 2× match window.`,
    simulation_opportunity: `Open LTspice and run a transient (.tran 0 50ms 0 100us) on the worked-example RC: V_step 12 V at t = 0, R = 1 kΩ, C = 10 μF. Plot v_C(t) and i_C(t) — watch the exponential rise to 7.59 V at 10 ms and the current decay from 12 mA to 4.42 mA. Add a second switch at t = 30 ms that disconnects V and shorts R + C into a discharge loop; v_C decays exponentially from 11.40 V with the same τ. For maximum power transfer, set V_Th = 10 V in series with R_Th = 50 Ω, sweep R_L over (1, 200) Ω, and plot P_L = V_L·I vs R_L — the curve peaks at R_L = 50 Ω with P_L,max = 0.5 W. The EngiSuite "First-Order Explorer" widget lets you drag R, L, C sliders and watch τ and the 5τ settling time update live, with the exponential curve overlaid on a normalized (V_final, τ) plot.`,
    common_mistakes: `- **Wrong initial condition**: forgetting that v_C(0⁺) = v_C(0⁻) and i_L(0⁺) = i_L(0⁻). A capacitor voltage cannot jump; an inductor current cannot jump.
- **Wrong final value**: forgetting that in DC steady state a capacitor is an OPEN (i_C = 0) and an inductor is a SHORT (v_L = 0). Treating the capacitor as a short at t → ∞ gives v_C(∞) = 0, the opposite of the correct V.
- **Sign of the natural-response exponent**: v_C(t) = V_0·e^(−t/τ) (decaying) — students sometimes write +t/τ (growing exponentially, which violates energy conservation in a source-free circuit).
- **Killing dependent sources in superposition**: dependent sources are NEVER killed. Only *independent* voltage and current sources are suppressed.
- **Applying superposition to power directly**: P is non-linear (P = I²). Compute total current/voltage first via superposition, THEN square for power.
- **Maximum-power-match confusion**: at R_L = R_Th the *efficiency* is 50 % — maximum power transferred, NOT maximum efficiency. Power-distribution circuits want R_int ≪ R_load (high efficiency); signal and sensor circuits want the match.
- **Units**: τ = R·C must use SI — Ω × F = Ω·F = s. With R in kΩ and C in μF, τ comes out in ms (1 kΩ × 1 μF = 1 ms); the constant is the same in any consistent prefix pair.`,
    limitations: `- **Linear, first-order only**: a circuit with two energy-storage elements (e.g., series RLC) is second-order — the response is over-damped, critically damped, or under-damped (oscillatory), not a single exponential.
- **No saturation**: real inductors saturate (core flux density limit); real capacitors have voltage-dependent dielectric constant — the linear τ = RC/L/R relation drifts at high excitation.
- **Lumped-element assumption**: at fast-edge switching (sub-nanosecond digital), the inductor's parasitic capacitance and the capacitor's parasitic inductance enter — the simple first-order model fails.
- **Ideal step input**: real switches have non-zero rise/fall time and contact bounce — the actual excitation is not a perfect unit step.
- **Superposition requires linearity**: non-linear circuits (diodes, transistors in saturation) do not obey superposition — small-signal linearization is a separate approximation.
- **Maximum power transfer ≠ maximum efficiency**: 50 % efficiency at match is unacceptable for power circuits where you want R_int ≪ R_load (efficiency → 100 % as R_int → 0).
- **Conjugate match in AC requires both R and X**: Z_L = Z_Th* sets R_L = R_Th AND X_L = −X_Th — you cannot achieve a match with a pure-R load on a complex-Z_Th source.`,
    comparison: `| Quantity | RC circuit | RL circuit |
|---|---|---|
| Time constant τ | R·C | L/R |
| Initial condition | v_C(0⁺) = v_C(0⁻) (voltage continuity) | i_L(0⁺) = i_L(0⁻) (current continuity) |
| Initial state (t = 0⁺) | Capacitor = short (uncharged) | Inductor = open (de-energized) |
| Final state (t → ∞) | Capacitor = open | Inductor = short |
| Step response | v_C(t) = V·(1 − e^(−t/RC)) | i_L(t) = (V/R)·(1 − e^(−t·R/L)) |
| Natural response | v_C(t) = V_0·e^(−t/RC) | i_L(t) = I_0·e^(−t·R/L) |
| Settling (≥ 99 %) | 5·R·C | 5·L/R |

| Network theorem | Statement | Best use |
|---|---|---|
| Superposition | Linear response = Σ single-source responses | Multi-source linear circuits; analyze each source's contribution |
| Thévenin | Any linear one-port = V_Th + R_Th | Reduce a complex subnetwork to 2 elements for load analysis |
| Norton | Any linear one-port = I_N ∥ R_N | Current-source-like subnetworks |
| Maximum power transfer | R_L = R_Th ⇒ P_max = V_Th²/(4R_Th) | Signal/sensor impedance matching; RF transmission-line match |
| Substitution | Replace any element by a source of its terminal V/I | Circuit simplification for analysis |
| Millman | Parallel voltage sources → V_avg = Σ(E_k/R_k)/Σ(1/R_k) | Multiple parallel battery banks, parallel voltage-fed branches |

| Match | At R_L = R_Th | At R_L ≠ R_Th |
|---|---|---|
| Load power P_L | P_max = V_Th²/(4·R_Th) | < P_max (suboptimal) |
| Efficiency | 50 % (P_L = P_RTh) | > 50 % if R_L > R_Th; < 50 % if R_L < R_Th |
| Use case | Signal, sensor, RF (max signal) | Power distribution (max efficiency) |`,
    practical_application: `**Snubber design for a relay-coil driver.** A 24 V relay coil (L = 0.8 H, R = 240 Ω, I_hold = 100 mA) is switched by an NPN transistor with V_CEO = 400 V. At turn-off, the coil's stored energy ½Li² = 4 mJ must be dissipated safely. A series RC snubber across the coil has C_snub large enough to absorb the energy without the voltage exceeding V_CEO: ½·C·V_peak² ≥ 4 mJ with V_peak ≤ 400 V ⇒ C ≥ 2·4 mJ/400² = 0.05 μF. Pick C = 0.1 μF (2× margin); R_snub sized to limit the initial discharge current to ≤ 1 A: R_snub ≥ V_peak/I_max = 100/0.1 = 1 kΩ. The snubber time constant is τ_snub = R·C = 1000·0.1×10⁻⁶ = 100 μs — the energy is dissipated in ~5τ = 500 μs. NFPA 70 Art. 460 applies the same τ = RC principle to drain PF-correction capacitors (Lesson 2) to ≤ 50 V in 1 min.`,
    decision_scenario: `You are the I&C (instrumentation & controls) lead at a 230 kV substation selecting between two discharge-resistor options for a 100 kVAR, 480 V PF-correction bank (NFPA 70 Art. 460 compliance). The bank has C = Q/(ωV²) = 100 000/(377 × 480²) = 1150 μF per phase (line-to-neutral). Option A: a 50 kΩ 100 W resistor (τ = RC = 50 000 × 1150×10⁻⁶ = 57.5 s; in 60 s, v = V·e^(−60/57.5) = 480 × 0.353 = 169 V — exceeds the 50 V limit). Option B: a 5 kΩ 600 W resistor (τ = 5.75 s; in 60 s, v = 480 × e^(−10.4) = 480 × 3.0×10⁻⁵ = 0.014 V — well under 50 V). Decision rule: NFPA 70 Art. 460 requires ≤ 50 V in 1 min; Option A fails (169 V at 60 s), Option B passes. Continuous-float dissipation under nominal V is V²/R = 480²/5000 = 46 W — within the 600 W rating with 13× margin. Choose B. This case ties Lesson 3's τ = RC relation to the safety-code compliance that every PF-correction bank installation must verify.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: RC time constant, RC charging voltage at one time constant, Thévenin max power transfer, superposition with dependent sources.`,
    certification_questions: `This lesson's content maps to the NCEES FE Electrical & Computer exam (first-order transients, superposition, maximum power transfer), the IEC 60364 series, and NFPA 70 (NEC) Articles 460 (capacitor discharge) and 430 (motor inrush and contactor timing). Sample FE-style question: "A series RC circuit with R = 1 kΩ and C = 10 μF is connected to a 12 V source at t = 0. The capacitor voltage at t = 10 ms is: (a) 4.41 V, (b) 7.59 V, (c) 12.0 V, (d) 0 V." Correct: (b) 7.59 V (τ = 10 ms; v_C(τ) = 12·(1 − e^(−1)) = 12·0.632 = 7.59 V).`,
    summary: `Transient analysis covers the exponential path of a circuit variable between two steady states. For a first-order RC the step response is v_C(t) = V·(1 − e^(−t/RC)) with τ = RC; for an RL, i_L(t) = (V/R)·(1 − e^(−t·R/L)) with τ = L/R. The universal first-order form x(t) = x_final + (x_initial − x_final)·e^(−t/τ) holds for any single-energy-storage-element circuit after Thévenin reduction. Engineering steady state is reached at t ≈ 5τ (99.3 % settled). Superposition (linear circuits: response = Σ single-source responses; dependent sources never killed) and maximum power transfer (R_L = R_Th ⇒ P_L,max = V_Th²/(4·R_Th); AC conjugate match Z_L = Z_Th*) close the DC/AC/transient curriculum. NFPA 70 Art. 460 and IEEE 141 apply these principles to industrial capacitor-bank discharge-resistor sizing and substation snubber design.`,
    key_takeaways: `- τ = RC (RC circuit), τ = L/R (RL circuit); t ≈ 5τ for ≥ 99 % settled.
- v_C(t) = V·(1 − e^(−t/RC)) for an RC step; v_C(t) = V_0·e^(−t/RC) for natural discharge.
- i_L(t) = (V/R)·(1 − e^(−t·R/L)) for an RL step; i_L(t) = I_0·e^(−t·R/L) for natural de-energization.
- Continuity: v_C(0⁺) = v_C(0⁻); i_L(0⁺) = i_L(0⁻); in DC steady state C = open, L = short.
- Universal first-order form: x(t) = x_final + (x_initial − x_final)·e^(−t/τ) — three numbers capture the entire transient.
- Superposition (linear circuits): response = Σ single-source responses; dependent sources NEVER killed; do NOT apply to power directly (compute I/V first, then square).
- Maximum power transfer: R_L = R_Th (DC) or Z_L = Z_Th* (AC) ⇒ P_L,max = V_Th²/(4·R_Th); 50 % efficiency at match — use for signal, not for power.
- NFPA 70 Art. 460 applies τ = RC to capacitor-bank discharge-resistor sizing (≤ 50 V in 1 min for ≤ 600 V systems).`,
    references: `1. Alexander & Sadiku (2017), Ch. 7 (first-order RC/RL transients, τ = RC and τ = L/R), Ch. 4 (superposition, Thévenin, Norton, maximum power transfer).
2. Nilsson & Riedel (2015), Ch. 7 (RL/RC natural & step responses), Ch. 5 (linear circuits & superposition), Ch. 4 (Thévenin/Norton/max power).
3. Hayt, Kemmerly & Durbin (2012), Ch. 5 (useful circuit analysis techniques — superposition, Thévenin, Norton, max power), Ch. 7 (RC & RL first-order circuits, τ = RC/L/R), Ch. 8 (higher-order RLC), Ch. 10 (AC max average power transfer).
4. Boylestad (2016), Ch. 9 (network theorems — superposition, Thévenin, Norton, max power transfer), Ch. 10 (capacitors), Ch. 11 (inductors & RL transients, τ = L/R).
5. IEEE Std 141-1993 (Red Book), Ch. 5 (system grounding & DC ground-fault detection — 125 V DC substation battery transients) and Ch. 7 (PF-correction capacitor bank discharge — τ = RC sizing).
6. NFPA 70 (NEC 2023), Art. 460 (capacitors — discharge-resistor τ = RC sizing to ≤ 50 V in 1 min) and Art. 430 (motors — inrush transient & contactor timing).`,
  },
  knowledgeObject: {
    title: "Transient Analysis & Network Theorems — Knowledge Object",
    domain: "Electrical Circuits",
    competency: "Foundations",
    topic: "First-Order Transients + Superposition + Maximum Power Transfer",
    concept: "τ = RC / L/R + universal first-order form + linear network theorems",
    body: {
      definitions: [
        "Transient: the dynamic path of a circuit variable between two steady states, decaying exponentially with τ.",
        "Time constant τ = RC (RC circuit), τ = L/R (RL circuit); seconds; t ≈ 5τ for ≥ 99 % settled.",
        "Natural (source-free) response: behavior with no independent source active — v_C(t) = V_0·e^(−t/τ).",
        "Step (forced) response: behavior with a DC source switched in at t = 0 — v_C(t) = V·(1 − e^(−t/τ)).",
        "Initial condition: v_C(0⁺) = v_C(0⁻) (capacitor voltage continuity); i_L(0⁺) = i_L(0⁻) (inductor current continuity).",
        "Superposition: linear response to N independent sources = Σ single-source responses (dependent sources never killed).",
        "Maximum power transfer: R_L = R_Th (DC) or Z_L = Z_Th* (AC conjugate) ⇒ P_L,max = V_Th²/(4·R_Th).",
      ],
      principles: [
        "Capacitor voltage continuity: v_C(0⁺) = v_C(0⁻) — a voltage jump requires infinite current.",
        "Inductor current continuity: i_L(0⁺) = i_L(0⁻) — a current jump requires infinite voltage.",
        "First-order form: x(t) = x_final + (x_initial − x_final)·e^(−t/τ) — three numbers capture the entire transient.",
        "Superposition applies only to LINEAR circuits; do not apply to power directly (compute I/V first, then square).",
        "Maximum power transfer: R_L = R_Th ⇒ 50 % efficiency; matched for signal, mismatched (R_int ≪ R_load) for power.",
        "Conjugate match in AC requires both R_L = R_Th and X_L = −X_Th — pure-R load cannot match a complex-Z_Th source.",
      ],
      components: [
        "Capacitor C (F) — stores ½Cv²; v_C continuous; open in DC steady state",
        "Inductor L (H) — stores ½Li²; i_L continuous; short in DC steady state",
        "Switch (mechanical/solid-state) — triggers the transient at t = 0",
        "DC source V or step input u(t) — drives the forced response",
        "Thévenin equivalent (V_Th, R_Th) — sets τ = R_Th·C or L/R_Th",
        "Snubber (R_snub, C_snub) — absorbs inductor stored energy at switch turn-off; τ_snub = R_snub·C_snub",
        "Discharge resistor (NFPA 70 Art. 460) — drains PF-correction C to ≤ 50 V in 1 min via τ = RC",
      ],
      mechanism:
        "A switching event at t = 0 changes the circuit topology; the energy-storage element's continuity law (v_C or i_L cannot jump) sets the initial condition; the Thévenin equivalent seen at the element's terminals sets τ; the steady-state value (DC analysis: C = open, L = short) sets x_final. The universal first-order form x(t) = x_final + (x_initial − x_final)·e^(−t/τ) then describes the entire transient. Superposition and maximum power transfer follow from the linearity that all DC, AC, and transient analyses assume.",
      process:
        "Identify energy-storage element → Thévenin-reduce the resistive part → find R_Th → τ = R_Th·C or L/R_Th → find x_initial from continuity → find x_final from DC steady-state (C=open, L=short) → write x(t) = x_final + (x_initial − x_final)·e^(−t/τ) → compute other quantities via KCL/KVL → for multi-source linear circuits apply superposition → for load analysis set R_L = R_Th for max power.",
      formulas: [
        "v_C(t) = V·(1 − e^(−t/RC))  (RC step, charging from 0)",
        "v_C(t) = V_0·e^(−t/RC)  (RC natural, discharging from V_0)",
        "i_L(t) = (V/R)·(1 − e^(−t·R/L))  (RL step, energizing from 0)",
        "i_L(t) = I_0·e^(−t·R/L)  (RL natural, de-energizing from I_0)",
        "x(t) = x_final + (x_initial − x_final)·e^(−t/τ)  (universal first-order)",
        "τ_RC = R_Th·C  ;  τ_RL = L/R_Th",
        "P_L(R_L) = V_Th²·R_L/(R_Th + R_L)²  ;  P_L,max = V_Th²/(4·R_Th) at R_L = R_Th",
        "AC conjugate match: Z_L = Z_Th* ⇒ P_L,max = |V_Th|²/(4·R_Th)",
        "Superposition: response_total = Σ_k response_to_source_k_alone (other independent V-sources shorted, I-sources opened, dependent sources active)",
      ],
      metrics: [
        "Time constant τ (ms, s) — RC or L/R sets the switching timescale",
        "Settling time t_settle ≈ 5τ (≥ 99.3 % settled) — engineering steady state",
        "Peak inductor voltage at switch turn-off V_peak = i_L(0⁺)·R_snub — snubber sizing metric",
        "Capacitor stored energy ½Cv² — must be safely dissipated in the snubber/discharge resistor",
        "Maximum load power P_L,max = V_Th²/(4·R_Th) — the match-power ceiling",
        "Match efficiency 50 % (R_L = R_Th); approaches 100 % as R_Th/R_L → 0",
        "NFPA 70 Art. 460 discharge metric: V_terminal ≤ 50 V within 60 s of disconnection",
      ],
      examples: [
        "RC charging: R=1 kΩ, C=10 μF, V=12 V → τ=10 ms, v_C(10 ms)=12(1−e^(−1))=7.59 V (63.2 %), v_C(50 ms)=11.92 V (99.3 %).",
        "Maximum power transfer: V_Th=10 V, R_Th=50 Ω, R_L=50 Ω → I=100 mA, V_L=5 V, P_L=0.5 W = V_Th²/(4·R_Th)=100/200=0.5 W ✓.",
        "Relay coil de-energization: L=0.8 H, R=240 Ω, I=100 mA, R_snub=1 kΩ, C_snub=0.1 μF, τ_snub=100 μs, V_peak=100 V (< 400 V V_CEO).",
      ],
      industrial_examples: [
        "Automation — 24 V relay coil (L=0.8 H) with RC snubber (R=1 kΩ, C=0.1 μF, τ_snub=100 μs); V_peak=100 V < 400 V V_CEO; energy 4 mJ dissipated in ~500 μs.",
        "Power & Utilities — 125 V DC substation battery discharge resistor sized via τ = RC; NFPA 70 Art. 460-compliant 50 V in 60 s.",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Substation Battery Discharge-Resistor Sizing: 125 V, 7.2 F equivalent, NFPA 70 Art. 460 requires ≤ 50 V in 60 s ⇒ τ ≤ 65.5 s ⇒ R ≤ 9.1 Ω; three 3 Ω 600 W resistors in series (9 Ω) selected.",
      ],
      common_errors: [
        "Wrong initial condition: forgetting v_C(0⁺) = v_C(0⁻) or i_L(0⁺) = i_L(0⁻); energy-storage variables cannot jump.",
        "Wrong final value: in DC steady state C = OPEN (i_C = 0) and L = SHORT (v_L = 0) — not the other way around.",
        "Wrong sign in the natural-response exponent: e^(−t/τ) decays (energy-conserving in source-free); +t/τ grows (non-physical).",
        "Killing dependent sources in superposition — dependent sources are NEVER killed; only independent ones are suppressed.",
        "Applying superposition to power directly (P is non-linear) — compute total I/V first, then square.",
        "Confusing maximum-power-match with maximum efficiency — 50 % efficiency at match; high-efficiency power circuits want R_int ≪ R_load.",
        "Unit slip in τ = RC: 1 kΩ × 1 μF = 1 ms (not 1 s); the prefix pair gives the same SI time constant.",
      ],
      limitations: [
        "Linear, first-order only — second-order (RLC) responses are over/critically/under-damped (not single-exponential).",
        "No saturation — real inductors saturate; real capacitors have voltage-dependent dielectric constants; the linear τ drifts at high excitation.",
        "Lumped-element assumption — at sub-nanosecond switching, parasitic L and C dominate; the simple first-order model fails.",
        "Ideal step input — real switches have rise/fall time and bounce; the excitation is not a perfect unit step.",
        "Superposition requires linearity — non-linear circuits (diodes, transistors in saturation) need small-signal linearization.",
        "Maximum-power-match 50 % efficiency is unacceptable for power circuits; signal/sensor/RF only.",
        "Conjugate match in AC requires both R_L = R_Th and X_L = −X_Th — a pure-R load cannot match a complex Z_Th source.",
      ],
      best_practices: [
        "Always find the initial condition from continuity (v_C or i_L) and the final value from DC steady-state (C=open, L=short).",
        "Use the universal first-order form x(t) = x_final + (x_initial − x_final)·e^(−t/τ) — three numbers capture the entire transient.",
        "For multi-source linear circuits, apply superposition with dependent sources ACTIVE (never kill dependent sources).",
        "For maximum-power analysis, Thévenin-reduce the source; set R_L = R_Th (DC) or Z_L = Z_Th* (AC); verify 50 % efficiency at match.",
        "For industrial PF-correction bank and substation battery discharge-resistor sizing, follow NFPA 70 Art. 460: τ = RC sized to bring V_terminal ≤ 50 V in 1 min for systems ≤ 600 V.",
      ],
      related_concepts: [
        "DC circuit analysis — Ohm, KCL, KVL, Thévenin/Norton (Lesson 1) — the foundation on which transients are built",
        "AC circuit analysis — phasors, impedance, sinusoidal steady-state (Lesson 2) — the post-transient steady state in AC",
        "Second-order RLC transients — natural/step response of two-energy-storage circuits (Alexander & Sadiku Ch. 8)",
        "Laplace transform — frequency-domain transient analysis for arbitrary inputs",
        "Transmission-line transients — distributed-parameter switching surges (high-voltage power engineering)",
        "Switching-mode power electronics — PWM, buck/boost, gate-drive timing ( Lessons 1–3 applied to power conversion)",
      ],
      prerequisites: [
        "Lessons 1 & 2 — DC and AC circuit analysis (Ohm, KCL, KVL, Thévenin/Norton, phasors, impedance)",
        "First-order ODEs (dy/dt + (1/τ)·y = f(t); homogeneous + particular solutions; exponential decay)",
        "Continuity laws for energy-storage elements (v_C cannot jump; i_L cannot jump)",
        "Exponential function (e^0=1, e^(−1)≈0.368, e^(−5)≈0.0067) and Euler's identity for AC max-power",
      ],
      references: CIRCUITS_REFERENCE_TITLES,
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
        "A series RC circuit has R = 1 kΩ and C = 10 μF. The time constant τ (in seconds) is:",
      explanation:
        "τ = R·C = 1000 Ω × 10×10⁻⁶ F = 10×10⁻³ = 0.010 s = 10 ms. Units: Ω × F = Ω·(C/V) = (V/A)·(A·s/V) = s. Or, equivalently, 1 kΩ × 1 μF = 1 ms.",
      whyCorrect:
        "Apply τ = R·C with consistent SI units: R = 1000 Ω, C = 10×10⁻⁶ F ⇒ τ = 1000 × 10×10⁻⁶ = 10×10⁻³ = 0.010 s = 10 ms. Equivalently, using the prefix form: 1 kΩ × 1 μF = 1 ms, so 1 kΩ × 10 μF = 10 ms. The dimensional check: Ω = V/A and F = C/V = A·s/V, so Ω·F = (V/A)·(A·s/V) = s.",
      whyOthersWrong: [
        "Option 0.1 s would be 1 kΩ × 100 μF or 10 kΩ × 10 μF — both inconsistent with the given values.",
        "Option 1 s would be 100 kΩ × 10 μF or 1 kΩ × 1000 μF (1 mF) — a factor of 100 too large.",
        "Option 10 s is six orders of magnitude too large — only achievable with megohm + millifarad values, not 1 kΩ + 10 μF.",
      ],
      options: [
        { text: "0.01 s (10 ms)", isCorrect: true },
        { text: "0.1 s (100 ms)", isCorrect: false },
        { text: "1 s", isCorrect: false },
        { text: "10 s", isCorrect: false },
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
        "A series RC circuit (R = 1 kΩ, C = 10 μF) is connected to a 12 V DC source at t = 0 (capacitor initially uncharged). The capacitor voltage at t = 10 ms (= one time constant) is approximately:",
      explanation:
        "τ = RC = 10 ms; v_C(t) = V·(1 − e^(−t/τ)) = 12·(1 − e^(−1)) = 12·(1 − 0.368) = 12·0.632 = 7.586 V ≈ 7.59 V. At one time constant, the capacitor is 63.2 % settled.",
      whyCorrect:
        "The capacitor voltage for a series RC step input (initially uncharged) is v_C(t) = V·(1 − e^(−t/τ)) with τ = R·C = 1 kΩ · 10 μF = 10 ms. At t = τ = 10 ms: v_C = 12·(1 − e^(−1)) = 12·(1 − 0.3679) = 12·0.6321 = 7.586 V ≈ 7.59 V. This is the well-known 'one time constant ⇒ 63.2 % settled' rule of thumb: at t = τ, the capacitor has risen to 1 − 1/e ≈ 63.2 % of the source voltage.",
      whyOthersWrong: [
        "Option 4.41 V uses v_C = V·e^(−t/τ) = 12·0.368 = 4.42 V — that's the DISCHARGE form (capacitor decaying from V), not the CHARGING form (capacitor rising toward V).",
        "Option 12.0 V assumes the capacitor is fully charged — that requires t → ∞ (or at least t ≈ 5τ = 50 ms for 99.3 %), not t = 1τ.",
        "Option 0 V assumes the capacitor cannot charge — contradicts the differential equation's steady-state solution v_C(∞) = V; in fact, the capacitor charges from 0 to 12 V exponentially, reaching 7.59 V at t = τ.",
      ],
      options: [
        { text: "4.41 V", isCorrect: false },
        { text: "7.59 V", isCorrect: true },
        { text: "12.0 V", isCorrect: false },
        { text: "0 V", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Power",
      stem:
        "A DC source has a Thévenin equivalent V_Th = 10 V in series with R_Th = 50 Ω. The load resistance that maximizes power transfer and the maximum power delivered to the load are:",
      explanation:
        "Maximum power transfer: R_L = R_Th = 50 Ω. I = V_Th/(R_Th + R_L) = 10/100 = 0.1 A. V_L = I·R_L = 0.1·50 = 5 V. P_L = V_L·I = 5·0.1 = 0.5 W. Equivalently, P_L,max = V_Th²/(4·R_Th) = 100/(4·50) = 0.5 W.",
      whyCorrect:
        "By the maximum-power-transfer theorem, the load receives the most power when R_L = R_Th = 50 Ω. The current is I = V_Th/(R_Th + R_L) = 10/(50+50) = 10/100 = 0.100 A. The voltage across the load is V_L = I·R_L = 0.100 × 50 = 5.00 V. The load power is P_L = V_L·I = 5 × 0.1 = 0.500 W. Cross-check with the closed-form: P_L,max = V_Th²/(4·R_Th) = 100/(4·50) = 100/200 = 0.500 W. Equivalently, P_L(R_L) = V_Th²·R_L/(R_Th+R_L)² = 100·50/100² = 5000/10000 = 0.5 W ✓. At the match, the source dissipates 0.5 W internally as well — 50 % transfer efficiency.",
      whyOthersWrong: [
        "Option (25 Ω, 1.0 W) computes P_L = V_Th²/R_L = 100/25 = 4 W (using the load-only form, ignoring R_Th's voltage division). With R_Th = 50 Ω in series, I = 10/75 = 0.133 A and V_L = 0.133·25 = 3.33 V, giving P_L = 3.33·0.133 = 0.444 W (< 0.5 W).",
        "Option (100 Ω, 0.25 W) gives I = 10/150 = 0.0667 A, V_L = 0.0667·100 = 6.67 V, P_L = 6.67·0.0667 = 0.444 W (< 0.5 W); the listed 0.25 W is also internally inconsistent (would imply I = 50 mA, V_L = 5 V, R_L = 100 Ω — that's a 10/2 = 5 V across R_L only if R_Th were 100 Ω, contradicting the given R_Th = 50 Ω).",
        "Option (0 Ω, ∞ W) assumes a short-circuit load receives infinite power — but a short has V_L = 0, so P_L = V_L·I = 0·∞-limited-I = 0 W. Maximum power transfer is at a FINITE R_L = R_Th, not at the short.",
      ],
      options: [
        { text: "R_L = 25 Ω, P_max = 1.0 W", isCorrect: false },
        { text: "R_L = 50 Ω, P_max = 0.50 W", isCorrect: true },
        { text: "R_L = 100 Ω, P_max = 0.25 W", isCorrect: false },
        { text: "R_L = 0 Ω, P_max = ∞ W", isCorrect: false },
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
        "True or False: In a linear circuit containing two independent voltage sources and one independent current source, the principle of superposition allows the contribution of each independent source to be computed separately (with the other independent sources suppressed — voltage sources shorted, current sources opened). When computing each single-source contribution, any dependent (controlled) sources present in the circuit must remain active.",
      explanation:
        "TRUE. Superposition applies to all linear circuits. Each independent source is considered alone with all other independent sources killed (V → short, I → open). Dependent sources are NEVER killed — their values are determined by the circuit variables, so suppressing them would break the topology they model (transistors, op-amps, sensors).",
      whyCorrect:
        "TRUE. The superposition theorem applies to any linear circuit. For each single-source contribution, only the OTHER independent sources are suppressed: voltage sources → short circuits (V = 0), current sources → open circuits (I = 0). Dependent (controlled) sources are NEVER suppressed — they remain active because their values are determined by the circuit variables (a VCVS, VCCS, CCVS, or CCCS has a value set by a controlling voltage or current elsewhere in the circuit, and that controller must be allowed to respond to the single active source). After computing each contribution, the algebraic sum gives the total response. Note: superposition does NOT apply to power directly (P is non-linear in I) — compute the total I or V first via superposition, then square for power. Note also that superposition in AC requires all sources at the same frequency; sources at different frequencies must be solved separately and combined in the time domain.",
      whyOthersWrong: [
        "Option FALSE — would claim that dependent sources must be killed alongside independent ones. That is wrong: dependent sources model active devices (transistors, op-amps, sensors) whose values are set by the circuit itself, not by an external specification. Suppressing them would break the topology they represent. The correct procedure is: kill ALL independent sources when computing the response to one of them, but leave dependent sources fully active. The resulting linear superposition of single-source responses is exact.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const CIRCUITS_LESSONS: RefLesson[] = [
  LESSON_DC,
  LESSON_AC,
  LESSON_TRANSIENT,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts and fluid-mechanics.ts EXACTLY. The Prisma shim
// (src/lib/db.ts) transparently:
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
 * Upsert the Electrical Circuits discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "electrical-circuits" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "electrical-circuits-fundamentals", name "Electrical Circuits
 *     Fundamentals", order 1).
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
  // 1) Discipline — find by slug "electrical-circuits" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "electrical-circuits" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "electrical-circuits" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "electrical-circuits-fundamentals"; name: "Electrical
  //    Circuits Fundamentals"; order 1. The Chapter has a
  //    @@unique([disciplineId, slug]), so we use findFirst + create/update.
  const chapterSlug = "electrical-circuits-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Electrical Circuits Fundamentals",
    slug: chapterSlug,
    description:
      "DC circuit analysis (Ohm, KCL/KVL, node/mesh, Thévenin/Norton), AC circuit analysis (phasors, impedance, RMS, power factor), and first-order transients & network theorems (τ=RC, τ=L/R, superposition, maximum power transfer) — the three-lesson deep scientific reference for the Electrical Circuits engineering discipline.",
    icon: "Zap",
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
  for (const src of CIRCUITS_SOURCES) {
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
  const sharedReferenceIds = CIRCUITS_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CIRCUITS_LESSONS) {
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
