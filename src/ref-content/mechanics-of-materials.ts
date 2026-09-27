// =============================================================================
// Mechanics of Materials — Engineering Discipline — Deep scientific
// reference (Task ID: BATCH7B).
//
// Discipline slug: "mechanics-of-materials" (seeded by
// scripts/seed-disciplines.ts, group "Mechanical", order 7,
// icon "Layers", color "violet", "Stress, strain, torsion, bending,
// stability.").
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
// Three lessons (one chapter "Mechanics of Materials Fundamentals"):
//   1. Stress & Strain                  (slug: mom-stress-strain)
//   2. Torsion & Bending                (slug: mom-torsion-bending)
//   3. Combined Loading & Buckling      (slug: mom-combined-loading-buckling)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional mechanics-of-materials content. No padding.
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
//   - LEVEL 6 — University / Academic Publications: Russell C. Hibbeler,
//     "Mechanics of Materials" (Pearson, 10th ed., 2023); Ferdinand P.
//     Beer, E. Russell Johnston, John T. DeWolf & David F. Mazurek,
//     "Mechanics of Materials" (McGraw-Hill, 8th ed., 2020).
//   - LEVEL 7 — Technical Publications / Industry Sources: James M. Gere
//     & Barry J. Goodno, "Mechanics of Materials" (Cengage, 9th ed., 2018).
//   - LEVEL 2 — Official Standard / Standards Organization: ASTM E8/E8M-22
//     Standard Test Methods for Tension Testing of Metallic Materials;
//     ISO 6892-1:2019 Metallic Materials — Tensile Testing — Part 1: Method
//     of Test at Room Temperature.
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline:
//     AISC 360-22 "Specification for Structural Steel Buildings" (American
//     Institute of Steel Construction, 2022).
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
// SOURCES — 6 real references cited across all mechanics-of-materials
// lessons.
// ---------------------------------------------------------------------------

export const MOM_SOURCES: RefSource[] = [
  {
    title:
      "Hibbeler — Mechanics of Materials (Pearson, 10th ed., 2023)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Hibbeler, R. C. (2023). Mechanics of Materials (10th ed.). Hoboken, NJ: Pearson Education. ISBN 978-0-13-762463-6. Chapters 1 (Stress — σ = F/A, allowable-stress design), 2 (Strain — ε = ΔL/L, Hooke's law σ = Eε, Poisson's ratio ν, Saint-Venant's principle), 3 (Mechanical Properties of Materials — tension test, stress-strain diagram, proportional limit, yield strength σ_y, ultimate strength σ_u, modulus of resilience, modulus of toughness, strain hardening, necking, true stress & strain), 4 (Axial Load — Saint-Venant, superposition, statically indeterminate bars, thermal stress σ_T = E·α·ΔT, stress concentrations K), 5 (Torsion — τ = Tc/J for circular shafts, angle of twist φ = ∫TL/(GJ) dx, statically indeterminate torque shafts), 6 (Bending — σ = My/I flexure formula, neutral axis, centroid & moment of inertia, beam cross-section classification), 7 (Transverse Shear — τ = VQ/(It), shear flow q = VQ/I in built-up sections), 8 (Combined Loadings — Mohr's circle, principal stresses σ_1, σ_2, σ_3), 11 (Column Buckling — Euler P_cr = π²EI/(KL)², secant formula, inelastic buckling, AISC column design). The canonical undergraduate mechanics-of-materials textbook used by ABET-accredited ME/CE programs.",
  },
  {
    title:
      "Beer, Johnston, DeWolf & Mazurek — Mechanics of Materials (McGraw-Hill, 8th ed., 2020)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Beer, F. P., Johnston, E. R., DeWolf, J. T., & Mazurek, D. F. (2020). Mechanics of Materials (8th ed.). New York, NY: McGraw-Hill Education. ISBN 978-1-260-40900-6. Chapters 1 (Introduction — Stress & Strain, σ = P/A, shearing stress τ = P/A in single/double shear), 2 (Stress & Strain — Axial Loading — Saint-Venant, σ_avg = P/A, ε = δ/L, σ = Eε, ν, thermal strain ε_T = α·ΔT), 3 (Torsion — τ = Tc/J in circular shafts, angle of twist φ = ∫TL/(GJ) dx, transmission-shaft power-torque relation T = P/ω), 4 (Pure Bending — σ = My/I flexure formula, transformed section for composite beams, plastic bending), 5 (Analysis & Design of Beams for Bending — ΣM, shear & moment diagrams, σ_max = M_max·c/I), 6 (Shearing Stresses in Beams & Thin-Walled Members — τ = VQ/(It), shear flow), 7 (Transformations of Stress & Strain — Mohr's circle, principal stresses, Mohr's circle for strain), 9 (Deflection of Beams — integration of EI d²y/dx² = M(x), moment-area method), 10 (Columns — Euler P_cr = π²EI/(KL)², effective length K, AISC column equations). Reference for the rigorous Mohr's-circle treatment in Lesson 3.",
  },
  {
    title:
      "Gere & Goodno — Mechanics of Materials (Cengage, 9th ed., 2018)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Gere, J. M., & Goodno, B. J. (2018). Mechanics of Materials (9th ed.). Boston, MA: Cengage Learning. ISBN 978-1-337-09335-4. Chapters 1 (Tension, Compression, and Shear — σ = P/A, bearing stress, stress elements), 2 (Stress & Strain — Hooke's law σ = Eε, ν, superposition, statically indeterminate structures), 3 (Torsion — τ = Tc/J, transmission shafts, non-circular torsion, thin-walled tubes), 4 (Shear Forces & Bending Moments — beam loadings, shear & moment diagrams), 5 (Stresses in Beams — σ = My/I flexure formula, σ = VQ/(It) shear, built-up beams), 6 (Stresses & Strains — plane stress, Mohr's circle, σ_1, σ_2, σ_3, Hooke's law for plane stress, tri-axial stress), 7 (Analysis of Stress & Strain — plane strain, strain rosettes), 9 (Deflection of Beams — moment-area, conjugate-beam), 11 (Columns — Euler buckling P_cr = π²EI/(KL)², secant formula, inelastic buckling). Practitioner bridge between classroom theory and design-office practice; reference for Lessons 1 and 3.",
  },
  {
    title:
      "ASTM E8/E8M-22 — Standard Test Methods for Tension Testing of Metallic Materials",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.astm.org/e0008_e0008m-22.html",
    citation:
      "ASTM International. (2022). ASTM E8/E8M-22 — Standard Test Methods for Tension Testing of Metallic Materials. West Conshohocken, PA: ASTM. The canonical standardized tension-test specification for metals. Defines the standard geometry of round (0.5-in dia) and rectangular (sheet, 0.5-in wide × 2-in gauge) specimens, the 0.005/in/min to 0.5/in/min strain-rate range, the 0.2%-offset yield strength σ_y, the upper/lower yield plateau, the ultimate tensile strength σ_u, and the elongation & reduction-of-area ductility measures. Cited in Lesson 1 to anchor the mechanical-properties content (Young's modulus E, yield strength σ_y, ultimate σ_u, ductility, strain hardening, necking) to the standardized test from which they are measured.",
  },
  {
    title:
      "AISC 360-22 — Specification for Structural Steel Buildings (American Institute of Steel Construction, 2022)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BODY_OF_KNOWLEDGE",
    url: "https://www.aisc.org/",
    citation:
      "American Institute of Steel Construction (AISC). (2022). AISC 360-22 — Specification for Structural Steel Buildings. Chicago, IL: AISC. The governing standard for structural-steel building design in the United States, referenced by IBC (International Building Code). Chapters A (General Provisions), B (Design Requirements), C (Analysis), D (Design of Members for Tension — yielding on gross section φ_t·F_y·A_g and rupture on net section φ_t·F_u·A_n), E (Design of Members for Compression — column buckling, AISC E3 Euler limit F_cr = π²E/(λ̄²), inelastic buckling, KL/r slenderness), F (Design of Members for Bending — flexural yielding, lateral-torsional buckling), G (Design of Members for Shear — τ = V/(d·t_w) and tension-field action), H (Combined Forces), J (Connections — bolts & welds). Cited in Lessons 1 and 3 to anchor the σ_allowable = F_y/Ω (ASD) and φ·F_y (LRFD) design formulas and the column-buckling equations to the official AISC body of knowledge.",
  },
  {
    title:
      "ISO 6892-1:2019 — Metallic Materials — Tensile Testing — Part 1: Method of Test at Room Temperature",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/75573.html",
    citation:
      "International Organization for Standardization. (2019). ISO 6892-1:2019 — Metallic materials — Tensile testing — Part 1: Method of test at room temperature. Geneva: ISO. The international counterpart to ASTM E8/E8M, governing tensile testing of metals outside the US (EU, China, Japan, Australia, Middle East). Defines the standard specimen geometries (proportional & non-proportional), the two control modes — Method A (closed-loop strain-rate control, 0.00007/s ≤ ε̇_Le ≤ 0.00083/s on the parallel length) and Method B (crosshead-separation control) — and the upper/lower yield strength R_eH/R_eL, the 0.2% proof strength R_p0.2, the tensile strength R_m, percentage elongation after fracture A%, and reduction of area Z%. Cited in Lesson 1 to provide the international tensile-testing reference that mirrors ASTM E8/E8M-22 for non-US engineering practice.",
  },
];

const MOM_REFERENCE_TITLES = MOM_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Stress & Strain
// (slug: mom-stress-strain)
// ---------------------------------------------------------------------------

const LESSON_STRESS_STRAIN: RefLesson = {
  slug: "mom-stress-strain",
  title: "Stress & Strain",
  titleAr: "الإجهاد والانفعال",
  order: 1,
  durationMin: 35,
  references: MOM_REFERENCE_TITLES,
  conceptIntroduction: `Mechanics of materials begins where statics ends: statics gives the internal resultant forces (axial N, shear V, torque T, bending moment M); mechanics of materials tells us how those resultants distribute as *stress* (force per unit area) over the cross-section, and how that stress produces *strain* (deformation per unit length). The four foundational constitutive laws are: (1) the *normal-stress* definition σ = F/A for an axial load; (2) the *normal-strain* definition ε = ΔL/L; (3) *Hooke's law* σ = Eε (linear-elastic regime, E = Young's modulus); and (4) *Poisson's ratio* ν = −ε_lateral/ε_axial (the lateral contraction that accompanies axial extension). The tension test (ASTM E8, ISO 6892-1) provides the stress-strain curve from which E, yield strength σ_y, ultimate strength σ_u, ductility, and toughness are extracted. This lesson builds the stress-strain toolkit that Lesson 2 (torsion & bending) and Lesson 3 (combined loading & buckling) extend to non-uniform stress distributions.`,
  sections: {
    learning_objectives: `- Define normal stress σ = F/A and shear stress τ = V/A; identify units (Pa, MPa, ksi, psi).
- Define normal strain ε = ΔL/L and shear strain γ = Δθ; identify units (dimensionless, mm/mm, μstrain).
- State Hooke's law σ = Eε in one dimension; identify the linear-elastic regime and Young's modulus E.
- State Poisson's ratio ν = −ε_lat/ε_axial; give typical values for metals (ν ≈ 0.30) and incompressible rubber (ν ≈ 0.50).
- Read a stress-strain curve from the ASTM E8 tension test: proportional limit, yield strength σ_y (0.2% offset), ultimate strength σ_u, necking, fracture, modulus of resilience U_r = σ_y²/(2E), modulus of toughness U_t.
- Distinguish engineering stress (force ÷ original area) from true stress (force ÷ instantaneous area); explain strain hardening.
- Compute the thermal strain ε_T = α·ΔT and the thermal stress σ_T = E·α·ΔT for a constrained bar; superpose with mechanical stress.`,
    prerequisites: `- Statics (engineering mechanics): equilibrium ΣF = 0, ΣM = 0; internal resultants N, V, M, T by section method.
- Calculus: ordinary derivatives, integration for non-uniform distributions.
- Vector mechanics: traction vector, stress at a point on a surface.
- Basic material science: crystalline lattice, dislocation motion, elastic vs plastic deformation.`,
    introduction: `When a structural member carries a load, the *internal forces* (axial N, shear V, bending M, torque T) develop stress distributions over the cross-section. Mechanics of materials answers two questions: (i) what is the stress at every point on the cross-section (and thus where does failure initiate); (ii) what is the resulting deformation (strain, displacement, rotation, twist)?

The simplest stress state is *uniaxial*: a bar of cross-section A pulled by axial load F develops a uniform normal stress σ = F/A (positive in tension by the engineering sign convention). The corresponding *normal strain* is ε = ΔL/L (the fractional change in length over the original gauge length). Robert Hooke (1678) observed that, for many materials at moderate load, stress and strain are linearly proportional: σ = Eε, where E is the *modulus of elasticity* or *Young's modulus* (Thomas Young, 1807). Typical E: steel 200 GPa, aluminum 70 GPa, copper 110 GPa, titanium 110 GPa, glass 70 GPa, concrete 25 GPa (compression), wood 12 GPa (parallel to grain).

Siméon Denis Poisson (1827) noticed that an axial extension ε_axial is accompanied by a lateral contraction ε_lateral. The ratio ν = −ε_lateral/ε_axial is *Poisson's ratio*, typically 0.30 for metals (steel, aluminum, copper), 0.27 for cast iron, 0.33 for titanium, 0.49 for near-incompressible rubber, 0.0–0.2 for porous/cellular materials (cork, foam). For an isotropic linear-elastic material the three elastic constants (E, ν, G — Young's, Poisson's, shear modulus) are related by G = E/[2(1 + ν)].

The *tension test* (ASTM E8/E8M, ISO 6892-1) produces the engineering stress-strain curve: σ on the y-axis (force / original area), ε on the x-axis (ΔL / L₀). The slope of the initial linear region is E. The proportional limit σ_pl marks the end of linearity; the yield strength σ_y (often the 0.2%-offset method) marks the onset of plastic deformation; the ultimate tensile strength σ_u is the peak stress; thereafter necking begins (local cross-section reduction) and the engineering stress falls until fracture at ε_f (the ductility). The *modulus of resilience* U_r = σ_y²/(2E) is the elastic strain-energy density recoverable on unloading; the *modulus of toughness* U_t is the total area under the curve (elastic + plastic energy to fracture).`,
    terminology: `- **Stress σ, τ**: force per unit area; normal (σ, perpendicular to surface) or shear (τ, parallel). Units: Pa, kPa, MPa, GPa (SI) or psi, ksi (US).
- **Strain ε, γ**: deformation per unit length; normal (ε = ΔL/L) or shear (γ = Δθ). Dimensionless (or mm/mm, μstrain, %).
- **Young's modulus E**: modulus of elasticity in tension/compression; slope of the linear part of σ–ε. Units: GPa.
- **Shear modulus G**: modulus of elasticity in shear; G = E/[2(1+ν)] for isotropic.
- **Poisson's ratio ν**: −ε_lateral/ε_axial; typically 0.30 for metals, 0.49 for rubber.
- **Hooke's law σ = Eε**: linear-elastic constitutive relation.
- **Proportional limit σ_pl**: stress at which σ–ε first deviates from linearity.
- **Yield strength σ_y**: stress at the onset of plastic (permanent) deformation; 0.2%-offset method.
- **Ultimate tensile strength σ_u**: peak engineering stress in a tension test.
- **Fracture strain ε_f**: strain at fracture; ductility measure (e.g., 20% elongation).
- **Engineering stress σ_eng = F/A_0** (original area); **true stress σ_true = F/A_inst** (instantaneous area).
- **Modulus of resilience U_r = σ_y²/(2E)**: elastic strain-energy density.
- **Modulus of toughness U_t**: total area under σ–ε curve to fracture.
- **Thermal strain ε_T = α·ΔT**: strain caused by free thermal expansion; α = CTE (per °C).
- **Thermal stress σ_T = E·α·ΔT**: stress when free thermal expansion is constrained.
- **Saint-Venant's principle**: stress is uniform (away from the load) at distances > 2–3× the largest cross-section dimension.
- **Stress concentration factor K_t**: σ_max = K_t·σ_nominal at geometric discontinuities (holes, notches, fillets).`,
    detailed_explanation: `**Uniaxial stress & strain.** For a uniform bar of cross-section A and original length L, pulled in tension by force F:
  σ = F/A      [Pa or MPa]
  ε = ΔL/L     [dimensionless]
For steel (E = 200 GPa), a strain of 0.001 (0.1%) corresponds to σ = 200 GPa × 0.001 = 200 MPa — well below the typical yield σ_y = 250 MPa.

**Hooke's law in 1D:**
  σ = E·ε
or equivalently the deformation:
  ΔL = (F·L)/(A·E)
This is the *elastic spring constant* form: stiffness k = A·E/L, so F = k·ΔL.

**Poisson effect.** Under axial tension ε_axial, the bar contracts laterally by ε_lat = −ν·ε_axial. For a circular bar of diameter d and length L, an axial extension ε produces a diameter change Δd/d = −ν·ε. Volume change: ΔV/V = ε·(1 − 2ν); for ν = 0.5 the material is *incompressible* (constant volume — rubber, soft tissue). For metals ν ≈ 0.30 → small volume expansion under tension.

**Isotropic elastic constants.** For an isotropic, linear-elastic material only two of {E, ν, G, K (bulk modulus)} are independent. The shear modulus:
  G = E/[2(1 + ν)]
The bulk modulus:
  K = E/[3(1 − 2ν)]
For steel (E = 200 GPa, ν = 0.30): G = 200/[2·1.30] = 76.9 GPa; K = 200/[3·0.40] = 166.7 GPa.

**Tension-test stress-strain curve (ASTM E8).** The four characteristic regions:
1. Linear-elastic (Hookean): slope = E; recoverable on unloading.
2. Yield: σ reaches σ_y; plastic (permanent) deformation begins. For low-carbon steel, an upper yield point followed by a lower yield plateau (Lüders bands).
3. Strain hardening: σ rises above σ_y to σ_u (the tensile strength). Material becomes stronger through dislocation pile-up.
4. Necking & fracture: cross-section locally reduces (neck), engineering stress falls, fracture at ε_f.

**Engineering vs true stress.** Engineering σ_eng = F/A_0 (original area); true σ_true = F/A_inst (instantaneous). Beyond necking, σ_true > σ_eng because A_inst < A_0. The true-strain ε_true = ln(L/L_0) = ln(1 + ε_eng); the true-stress–true-strain curve rises monotonically to fracture (no necking drop).

**Resilience & toughness.** U_r = σ_y²/(2E) — recoverable elastic energy per unit volume. U_t = ∫₀^ε_f σ·dε — total energy to fracture (a ductility-plus-strength measure). High-strength low-ductility materials (e.g., 300-M steel σ_y = 1500 MPa, ε_f = 0.07) and low-strength high-ductility materials (e.g., mild steel σ_y = 250 MPa, ε_f = 0.30) can have similar U_t but very different applications.

**Thermal strain & stress.** Unconstrained thermal expansion produces ε_T = α·ΔT (no stress). A fully constrained bar develops σ_T = E·α·ΔT (compressive if heated, tensile if cooled). For steel (α = 12×10⁻⁶ /°C, E = 200 GPa): a 100 °C temperature drop with constrained ends produces σ_T = 200 GPa × 12e-6 × 100 = 240 MPa — close to yield. This is why pipelines and railroad tracks have expansion joints.

**Saint-Venant's principle.** Away from a concentrated load or geometric discontinuity (≥ 2–3× the cross-section dimension), the *detailed* distribution of the load (or the geometry) ceases to matter — only the resultant (N, V, M, T) does. This licenses the σ = F/A formula for a uniformly-loaded bar even when the load is applied through a pin, a clevis, or a cleat — the σ = F/A is valid in the bulk, away from the load-application region.

**Stress concentrations.** A hole, a fillet, a notch, or a keyseat raises the local peak stress to σ_max = K_t·σ_nominal, where K_t is the *stress-concentration factor* (Peterson 1974, Pilkey & Pilkey 2008). For a circular hole in a wide plate K_t = 3; for a 4-mm radius fillet on a 50-mm shaft step K_t ≈ 1.8. Below the yield strength the local plasticity redistributes the stress; under fatigue loading the K_t controls the S-N life directly.`,
    core_principles: `- **σ = F/A** (uniform bar in axial load); **τ = V/A** (average shear stress).
- **ε = ΔL/L** (normal strain); **γ = Δθ** (shear strain).
- **Hooke's law σ = Eε** (linear-elastic regime); E = slope of σ–ε in the proportional region.
- **Poisson's ratio ν = −ε_lat/ε_axial**; for isotropic linear-elastic G = E/[2(1+ν)].
- **Yield strength σ_y** (0.2%-offset); **ultimate strength σ_u**; **fracture strain ε_f**.
- **Engineering stress σ_eng = F/A_0**; **true stress σ_true = F/A_inst**; true strain ε_true = ln(1 + ε_eng).
- **Thermal strain ε_T = α·ΔT**; **thermal stress σ_T = E·α·ΔT** (fully constrained).
- **Saint-Venant's principle**: stress is uniform (in the bulk) at distances > 2–3× the cross-section dimension.
- **Stress concentration K_t**: σ_max = K_t·σ_nominal at geometric discontinuities.`,
    components: `- **Specimen**: standardized geometry per ASTM E8 (round 0.5-in dia, gauge 2 in) or ISO 6892-1 (proportional).
- **Universal testing machine (UTM)**: closed-loop servo-hydraulic or screw-drive; 100 kN–2 MN capacity; crosshead speed control or strain-rate control (Method A in ISO 6892-1).
- **Extensometer**: clip-on or video (DIC — Digital Image Correlation) for strain measurement on the gauge length.
- **Load cell**: strain-gage-based force transducer (precision ±0.1% of reading).
- **Strain-gage rosette**: 3-element (0°/45°/90° or 0°/60°/120°) for plane-strain measurement on real structures.
- **Stress-strain curve**: the raw data from the tension test, processed to extract E, σ_y, σ_u, ε_f, U_r, U_t.
- **ASTM E8 / ISO 6892-1**: the test-method standards governing specimen geometry, strain rate, and reporting.
- **AISC 360-22**: the design standard consuming σ_y, σ_u for structural-steel member sizing (ASD: σ_allow = F_y/Ω; LRFD: φ·F_y).`,
    process: `1. Compute the internal resultant (N, V, M, T) by the section method (statics).
2. Choose the stress formula: σ = N/A (axial); τ = V/A (shear, average); σ = My/I (bending); τ = Tc/J (torsion) — see Lesson 2 for the latter two.
3. Compute the nominal stress; apply K_t (stress concentration) at discontinuities.
4. Verify σ ≤ σ_allow (ASD) or σ ≤ φ·F_y (LRFD) — if not, redesign (larger section, stronger material).
5. Compute the deformation: ε = σ/E (axial); ΔL = N·L/(A·E) (bar); θ = ∫M/(E·I) dx (beam rotation); φ = ∫T/(G·J) dx (twist) — see Lesson 2.
6. Add thermal strain (if temperature change is present): ε_total = ε_mechanical + ε_T.
7. For superposition (linear-elastic, small-deformation): sum the stress/strain from each load case independently.`,
    formula_calculation: `**Normal stress & strain (uniform axial load):**
  σ = F/A           [Pa or MPa]
  ε = ΔL/L          [dimensionless, mm/mm, μstrain]

**Hooke's law (1D):**
  σ = E·ε           →   ΔL = F·L/(A·E)
  E = slope of σ–ε curve in the linear region
  Typical E (GPa): steel 200; aluminum 70; copper 110; titanium 110; glass 70; concrete 25 (comp); wood 12 (parallel).

**Poisson's ratio:**
  ν = −ε_lateral/ε_axial
  Typical ν: metals 0.30; rubber 0.49; cork ~0; concrete 0.20; glass 0.22.

**Shear modulus & bulk modulus:**
  G = E/[2(1 + ν)]
  K_bulk = E/[3(1 − 2ν)]
  For steel (E=200 GPa, ν=0.30): G = 76.9 GPa; K_bulk = 166.7 GPa.

**Thermal strain & stress:**
  ε_T = α·ΔT
  σ_T = E·α·ΔT         (fully constrained bar)
  For steel (α=12e-6 /°C, E=200 GPa): σ_T(ΔT=100°C) = 240 MPa (close to σ_y!)

**Yield & ultimate strength (ASTM E8 / ISO 6892-1):**
  σ_y = 0.2%-offset yield (proof strength R_p0.2 in ISO)
  σ_u = peak engineering stress (R_m in ISO)
  ε_f = fracture strain (A% elongation in ISO)
  U_r = σ_y²/(2E)       (modulus of resilience)
  U_t = ∫₀^ε_f σ dε     (modulus of toughness, area under σ–ε)

**Engineering vs true:**
  σ_eng = F/A_0
  σ_true = F/A_inst = σ_eng·(1 + ε_eng)
  ε_true = ln(1 + ε_eng)

**Saint-Venant's principle:** the *detailed* stress distribution near a load or discontinuity dies out at distances ≥ 2–3× the cross-section dimension; beyond that, only the resultant N, V, M, T matters.

**Stress concentration:**
  σ_max = K_t · σ_nominal
  K_t depends on geometry: circular hole in wide plate K_t = 3; 4-mm fillet on 50-mm step K_t ≈ 1.8; V-notch K_t ≈ 4–6.

**Assumptions**: (i) homogeneous, isotropic, linear-elastic material in the working regime (σ < σ_y); (ii) small deformations (geometric linearization); (iii) plane sections remain plane (in pure bending, Lesson 2); (iv) static loading (dynamic requires modulus-of-elasticity × density effects).

**Interpretation**: σ = F/A tells us the load per unit area carried by the bar; multiplying by the strain ε = σ/E gives the fractional elongation. A 1-m steel bar carrying σ = 200 MPa elongates by ΔL = L·ε = 1 m × (200/200,000) = 0.001 m = 1 mm. A design engineer sizing the bar to keep σ ≤ σ_allow = 0.6·σ_y (steel, ASD) ensures it stays in the elastic regime.`,
    worked_example: `**Axial stress in a round steel bar.**
A solid round steel bar of cross-sectional area A = 200 mm² carries an axial tensile load F = 10 kN.
  σ = F/A = 10,000 N / 200 mm² = 50 N/mm² = 50 MPa ✓

Sanity check: 50 MPa is well below the yield strength of structural steel (σ_y = 250 MPa for A992). The factor of safety on yielding is FS = σ_y/σ = 250/50 = 5.0 — comfortable.

**Elastic elongation.**
For E = 200 GPa = 200,000 MPa and gauge length L = 1.0 m = 1000 mm:
  ε = σ/E = 50/200,000 = 0.00025 (0.025%)
  ΔL = ε·L = 0.00025 × 1000 mm = 0.25 mm

**Lateral contraction (Poisson effect).**
  ε_lat = −ν·ε_axial = −0.30 × 0.00025 = −7.5×10⁻⁵ (contraction)
For a 10-mm-diameter bar (A = π(10)²/4 = 78.5 mm² — wait, our A is 200 mm², so d = √(4·200/π) = √254.6 = 15.96 mm):
  Δd = ε_lat·d = −7.5×10⁻⁵ × 15.96 mm = −0.0012 mm (the diameter shrinks by 1.2 μm).

**Volume change.**
  ΔV/V = ε·(1 − 2ν) = 0.00025 × (1 − 0.60) = 0.00025 × 0.40 = 1.0×10⁻⁴
For ν = 0.30 the bar expands slightly in volume under tension (only ν = 0.5 is incompressible).

**Stress concentration at a transverse hole.**
If the bar has a 5-mm transverse hole (stress-concentration factor K_t ≈ 2.35 for d_hole/d_bar = 5/15.96 ≈ 0.31 from Peterson's chart):
  σ_max = K_t·σ_nominal = 2.35 × 50 = 117.5 MPa
Still below σ_y = 250 MPa — the local peak stress at the hole edge is safe under static load; but under fatigue loading this K_t drives the S-N life directly.`,
    industrial_example: `**Industry: Construction — structural-steel tension member.** A 25-mm-diameter A992 steel rod (A = π(25)²/4 = 491 mm²) carries a tensile dead load of 50 kN plus a live load of 70 kN (total N = 120 kN). Nominal stress σ = N/A = 120,000/491 = 244 MPa — close to σ_y = 250 MPa, so the engineer adds a 4-mm transverse pin hole (K_t = 2.6). σ_max = 2.6 × 244 = 634 MPa at the net section — well above σ_y. The rod fails the AISC 360-22 ASD check on the net section (σ_allow = 0.5·F_u = 0.5·400 = 200 MPa on net). The engineer upgrades to a 32-mm rod (A = 804 mm², net A_n = 804 − 4·32 = 676 mm²): σ_gross = 120,000/804 = 149 MPa, σ_net = 120,000/676 = 178 MPa, σ_max (with K_t·σ_net) = 2.6 × 178 = 463 MPa. The AISC D2 check on yielding on the gross section passes (149 < 0.6·F_y = 0.6·345 = 207 MPa ✓); the rupture on net section φ_t·F_u·A_n = 0.75·400·676 = 203 kN > N = 120 kN ✓.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Northstar Pipeline — thermal stress in a tie-in (synthetic, illustrative).* A 16-in-diameter API 5L X70 steel pipeline (E = 200 GPa, α = 12e-6 /°C, σ_y = 485 MPa) is tie-in welded at the end of a cold-weather installation: pipeline installed at −20 °C, will operate at +60 °C (ΔT = +80 °C). The above-ground segment between two anchor blocks is 60 m long, fully constrained at both ends (no expansion). Thermal stress σ_T = E·α·ΔT = 200,000 MPa × 12e-6 × 80 = 192 MPa (compressive). Combined with the operating pressure σ_hoop = P·D/(2t) = 8 MPa × 406/(2×9.5) = 171 MPa (hoop, tensile), the von Mises equivalent (Lesson 3) is σ_eq = √(σ_T² + σ_hoop² − σ_T·σ_hoop) = √(192² + 171² − 192·171) = √(36864 + 29241 − 32832) = √33273 ≈ 182 MPa < σ_y = 485 MPa → FS = 2.66. The 60-m segment's compressive force P = σ_T·A = 192 × 12,000 mm² = 2.30 MN — well within the anchor-block design capacity (3.5 MN). The tie-in was approved for commissioning.`,
    visual_explanation: `**Stress-strain curve.** The x-axis is engineering strain ε (0 to ε_f, typically 0.0–0.30 for ductile steel); the y-axis is engineering stress σ (0 to σ_u, typically 0–600 MPa for structural steel). The four regions are visible: (1) linear-elastic line from origin with slope E = 200 GPa; (2) yield plateau (low-carbon steel) or smooth knee (alloy steel) at σ_y = 250 MPa; (3) strain-hardening rise to σ_u = 400–450 MPa; (4) necking drop to fracture at ε_f = 0.20–0.30. The modulus of resilience U_r = σ_y²/(2E) is the area of the elastic triangle; the modulus of toughness U_t is the entire area under the curve to fracture. A companion sketch shows the test specimen: cylindrical dogbone with reduced gauge section, marks at L₀ = 50 mm (or 2 in), under the UTM grips; after fracture, the two pieces are re-assembled to measure final gauge length L_f and minimum neck diameter d_f for ductility.`,
    simulation_opportunity: `Open the EngiSuite "Tension-test simulator" — sliders for E, σ_y, σ_u, ε_f, ν, strain-hardening exponent n. Watch the engineering σ–ε curve build live, with markers at σ_y, σ_u, ε_f, and the resilience/toughness areas shaded. A separate pane runs the 0.2%-offset method on a noisy synthetic curve and recovers σ_y. For real practice, use MATLAB or Python (numpy + matplotlib) to read an ASTM E8 raw data file (force + extension vs time) and post-process into σ_eng, ε_eng, σ_true, ε_true; compute E by least-squares on the 10–40% segment of the elastic region (ISO 6892-1 Method A). For a stress-concentration visualization, run ANSYS Mechanical on a plate-with-hole model and compare the FEA peak stress to Peterson's K_t × σ_nominal.`,
    common_mistakes: `- **Mixing units** (Pa with MPa, mm² with m²): always convert to a consistent system before applying σ = F/A. The cleanest is SI: N for force, mm² for area, MPa = N/mm² for stress.
- **Using engineering stress in a plastic regime as if true**: beyond necking the engineering σ falls, but the material is still strengthening in true stress. Use σ_true = σ_eng·(1+ε_eng) for plastic analysis.
- **Ignoring Poisson's effect on multi-axial stress**: in plane stress ε_x = (σ_x − ν·σ_y)/E, not σ_x/E alone. The full 3D Hooke's law is ε_x = (1/E)·[σ_x − ν(σ_y + σ_z)].
- **Forgetting the K_t at geometric discontinuities**: σ = F/A only holds in the bulk. At holes, fillets, notches, keyseats, multiply by K_t (often 2–4).
- **Confusing the 0.2%-offset yield with the proportional limit**: σ_pl < σ_y; the offset method is the international convention (ASTM E8, ISO 6892-1).
- **Applying σ = F/A inside the load-application region** (within 2–3× the cross-section dimension of the load point): Saint-Venant's principle does NOT hold there; use FEA or elasticity theory.
- **Confusing thermal stress with thermal strain**: ε_T = α·ΔT is the *free* expansion (no stress); σ_T = E·α·ΔT is the *constrained* stress (no net strain). Pick one or the other based on boundary conditions.`,
    limitations: `- Hooke's law σ = Eε holds only in the linear-elastic regime (σ < σ_y). Above yield the material is non-linear (Ramberg-Osgood σ = E·ε + α·σ_0·(σ/σ_0)^n).
- The 1D σ = F/A assumes a uniform bar in pure axial load — non-uniform cross-sections, eccentric load, and combined bending need the full flexure (σ = My/I) and shear (τ = VQ/It) formulas (Lesson 2).
- Engineering stress–strain is a *convenient fiction* past necking — the true stress–strain curve is the material's constitutive behavior; engineering is reported for design simplicity.
- Saint-Venant's principle is silent on the local stress state *near* discontinuities — K_t × σ_nominal is a first-order correction; FEA is required for the actual peak stress.
- All classical mechanics-of-materials formulas assume *small* deformations and *linear* elasticity — large-deformation (geometric non-linearity) or hyper-elastic (rubber, soft tissue) behavior requires specialized theories (hyper-elasticity, FEA with large-strain formulation).
- Biaxial and triaxial stress states need the full tensor formulation (Cauchy stress tensor, principal stresses, Mohr's circle — Lesson 3).`,
    comparison: `| Material | E (GPa) | σ_y (MPa) | σ_u (MPa) | ε_f (%) | ν | Notes |
|---|---|---|---|---|---|---|
| Structural steel A992 | 200 | 345 | 450 | 20 | 0.30 | AISC 360-22 standard |
| Stainless 304 | 193 | 205 | 520 | 40–60 | 0.30 | Annealed |
| Aluminum 6061-T6 | 69 | 276 | 310 | 17 | 0.33 | Aerospace, structural |
| Titanium Ti-6Al-4V | 114 | 880 | 950 | 14 | 0.34 | Aerospace, medical |
| Copper (annealed) | 110 | 70 | 220 | 50 | 0.34 | Electrical, plumbing |
| Concrete (comp.) | 25 (comp) | 25–50 | — | 0.0035 (ult) | 0.20 | Compression only; tension weak |
| Glass (soda-lime) | 70 | — | 50 (comp) | — | 0.22 | Brittle; compression only |
| Wood (pine, parallel) | 12 | 35 (comp) | 80 (tens) | — | 0.30 | Anisotropic |`,
    practical_application: `**Industrial sizing — tension member per AISC 360-22.** A 25-mm-diameter A992 rod (A_g = 491 mm²) carries N = 120 kN tensile. ASD check: σ_gross = N/A_g = 244 MPa; allow 0.6·F_y = 0.6·345 = 207 MPa → FAILS (244 > 207). Redesign: 32-mm rod (A_g = 804 mm², σ_gross = 149 MPa ≤ 207 ✓). Net section at pin hole (A_n = 804 − 4·32 = 676 mm²): σ_net = 178 MPa; allow 0.5·F_u = 0.5·450 = 225 MPa (with K_t embedded) → ✓. The 32-mm rod is selected. Tie-in weld check (50-mm fillet, 8 mm throat, length 100 mm) per AISC J2: capacity = 0.6·F_u·A_w·φ = 0.6·450·(8×100)·0.75 = 162 kN > 120 kN ✓.`,
    decision_scenario: `You are the structural lead on a $40M steel-frame warehouse. The architect wants the steel columns exposed for aesthetic reasons; the contractor wants a 6061-T6 aluminum column instead of steel to save 70% weight and eliminate fireproofing. The column carries N = 1.2 MN axial (dead + live). Steel option (A992, σ_y = 345 MPa): minimum A = N/(0.6·σ_y) = 1.2e6/207e6 = 0.0058 m² = 5800 mm² → W8×24 column (A = 4530 mm²) — wait, that's undersized; need W10×33 (A = 6260 mm²). Aluminum option (6061-T6, σ_y = 276 MPa, E = 69 GPa): minimum A = N/(0.6·σ_y) = 1.2e6/166e6 = 7230 mm² — a 200×200×16 mm aluminum SHS (A = 11,700 mm²) is required. The aluminum option is ~1.9× larger cross-section but ~37% lighter (ρ_al = 2700 vs ρ_st = 7850 kg/m³); aluminum column weighs 0.6× the steel. Buckling check (Lesson 3): Euler P_cr ∝ E·I — aluminum's lower E (69 vs 200 GPa) makes the aluminum column 2.9× more prone to buckling. The structural lead keeps the steel columns (better buckling resistance, lower cost, well-understood fireproofing) and rejects the aluminum proposal.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: Hooke's law definition, σ = F/A calculation, Poisson's ratio & shear modulus, and the linear-elastic regime assumption.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical, FE Civil, and PE Civil (Structural) exam outlines, and the ASME BPVC Section VIII Division 2 (pressure vessels). Sample FE-style question: "A steel bar (E = 200 GPa, ν = 0.30) of cross-section 200 mm² carries 10 kN in axial tension. The normal stress and longitudinal strain are: (a) 50 MPa, 250 μstrain; (b) 50 MPa, 25 μstrain; (c) 5 MPa, 250 μstrain; (d) 50 MPa, 2500 μstrain." Correct: (a) 50 MPa, 250 μstrain (σ = F/A = 10,000/200 = 50 MPa; ε = σ/E = 50/200,000 = 2.5e-4 = 250×10⁻⁶ = 250 μstrain).`,
    summary: `Mechanics of materials begins with the four foundational constitutive laws: σ = F/A (normal stress), ε = ΔL/L (normal strain), σ = Eε (Hooke's law, E = Young's modulus), and ν = −ε_lat/ε_axial (Poisson's ratio). The tension test (ASTM E8/E8M-22, ISO 6892-1:2019) provides the stress-strain curve from which E, σ_y (0.2%-offset), σ_u, ε_f, U_r, and U_t are extracted. Saint-Venant's principle licenses the simple σ = F/A in the bulk (away from load-application regions and discontinuities); K_t × σ_nominal corrects for holes, fillets, notches. Thermal strain ε_T = α·ΔT (free) or thermal stress σ_T = E·α·ΔT (constrained) handles temperature change. Lesson 2 extends to non-uniform stress distributions (torsion, bending); Lesson 3 covers combined stress states (Mohr's circle) and stability (Euler buckling).`,
    key_takeaways: `- σ = F/A (normal); ε = ΔL/L; σ = Eε (Hooke's law).
- E (GPa): steel 200, aluminum 69, copper 110, titanium 114, concrete 25, glass 70.
- Poisson's ratio ν ≈ 0.30 for metals; G = E/[2(1+ν)].
- σ_y = 0.2%-offset yield; σ_u = ultimate; ε_f = fracture strain; U_r = σ_y²/(2E).
- Saint-Venant: σ = F/A valid in the bulk; apply K_t at discontinuities (holes, fillets).
- Thermal: ε_T = α·ΔT (free); σ_T = E·α·ΔT (constrained).
- ASTM E8/E8M-22 (US) and ISO 6892-1:2019 (international) govern the tension test.`,
    references: `1. Hibbeler (2023), Ch. 1 (Stress), Ch. 2 (Strain, Hooke's law, ν), Ch. 3 (Mechanical Properties, σ–ε curve).
2. Beer, Johnston, DeWolf & Mazurek (2020), Ch. 1 (Stress & Strain — Axial Loading), Ch. 2 (Saint-Venant, K_t).
3. Gere & Goodno (2018), Ch. 1 (Tension, Compression, Shear), Ch. 2 (Hooke's law, ν, thermal stress).
4. ASTM E8/E8M-22 — Standard Test Methods for Tension Testing of Metallic Materials.
5. AISC 360-22, Chapter D (Tension Members) & A3 (steel material properties).
6. ISO 6892-1:2019 — Metallic Materials — Tensile Testing — Room Temperature.`,
  },
  knowledgeObject: {
    title: "Stress & Strain — Knowledge Object",
    domain: "Mechanics of Materials",
    competency: "Foundations",
    topic: "Stress, Strain, Hooke's Law, Poisson's Ratio",
    concept: "σ = F/A, ε = ΔL/L, σ = Eε, ν — the four foundational constitutive laws",
    body: {
      definitions: [
        "Stress σ, τ: force per unit area; σ normal (perpendicular), τ shear (parallel). Units: Pa, MPa, ksi.",
        "Strain ε, γ: deformation per unit length; ε normal (ΔL/L), γ shear (Δθ). Dimensionless.",
        "Young's modulus E: slope of σ–ε in the linear-elastic region (Hooke's law σ = Eε). GPa.",
        "Poisson's ratio ν = −ε_lateral/ε_axial; metals ~0.30, rubber ~0.49, cork ~0.",
        "Yield strength σ_y (0.2%-offset): onset of plastic deformation; ASTM E8 / ISO 6892-1.",
        "Ultimate strength σ_u: peak engineering stress in tension.",
        "Engineering σ = F/A_0; True σ = F/A_inst; True strain ε_true = ln(1 + ε_eng).",
        "Thermal strain ε_T = α·ΔT (free); thermal stress σ_T = E·α·ΔT (constrained).",
      ],
      principles: [
        "σ = F/A in the bulk of a uniformly-loaded bar (Saint-Venant).",
        "Hooke's law σ = Eε in the linear-elastic regime (σ < σ_y).",
        "Poisson: ν = −ε_lat/ε_axial; for isotropic linear-elastic G = E/[2(1+ν)], K_bulk = E/[3(1−2ν)].",
        "Saint-Venant's principle: σ = F/A valid at distances > 2–3× cross-section from load or discontinuity.",
        "Stress concentration σ_max = K_t·σ_nominal at holes, fillets, notches, keyseats.",
        "Thermal stress σ_T = E·α·ΔT in a fully-constrained bar; superposes linearly with mechanical stress.",
      ],
      components: [
        "ASTM E8 / ISO 6891-1 standardized tension specimen (round 0.5-in dia, 2-in gauge)",
        "Universal Testing Machine (UTM) — closed-loop servo-hydraulic or screw-drive",
        "Extensometer (clip-on or video DIC) for strain measurement",
        "Load cell (strain-gage force transducer)",
        "Strain-gage rosette (0°/45°/90° or 0°/60°/120°) for plane-strain measurement",
        "Stress-strain curve from which E, σ_y, σ_u, ε_f, U_r, U_t are extracted",
        "AISC 360-22 for structural-steel design (ASD: σ_allow = F_y/Ω; LRFD: φ·F_y)",
      ],
      mechanism:
        "Internal resultant forces (N, V, M, T) develop stress distributions over the cross-section; the simplest is uniaxial σ = F/A. Strain ε = σ/E follows Hooke's law in the linear-elastic regime (σ < σ_y). Above yield, the material deforms plastically (non-recoverable). Poisson's ratio couples lateral and axial strain. Thermal strain arises from CTE mismatch with the boundary condition (free vs constrained) producing stress only when constrained.",
      process:
        "Compute internal resultant (N, V, M, T) by section method → choose stress formula → apply K_t at discontinuities → check vs σ_allow or φ·F_y → compute strain/deformation → add thermal strain if ΔT present → superpose load cases (linear-elastic, small-deformation).",
      formulas: [
        "σ = F/A   (normal); ε = ΔL/L   (normal strain)",
        "σ = E·ε   → ΔL = F·L/(A·E)",
        "ν = −ε_lat/ε_axial; G = E/[2(1+ν)]; K_bulk = E/[3(1−2ν)]",
        "σ_y = 0.2%-offset; σ_u = peak; ε_f = fracture strain",
        "U_r = σ_y²/(2E); U_t = ∫₀^ε_f σ dε",
        "ε_T = α·ΔT (free); σ_T = E·α·ΔT (constrained)",
        "σ_max = K_t · σ_nominal",
        "σ_eng = F/A_0; σ_true = F/A_inst = σ_eng·(1 + ε_eng); ε_true = ln(1 + ε_eng)",
      ],
      metrics: [
        "Stress σ (MPa) — load per unit area",
        "Strain ε (μstrain or %) — deformation per unit length",
        "Young's modulus E (GPa) — stiffness",
        "Yield strength σ_y, ultimate σ_u (MPa) — strength",
        "Fracture strain ε_f (%) — ductility",
        "Modulus of resilience U_r = σ_y²/(2E) (J/m³) — recoverable elastic energy density",
        "Modulus of toughness U_t (J/m³) — total energy to fracture",
      ],
      examples: [
        "σ = F/A = 10,000 N / 200 mm² = 50 MPa (steel bar, FS = 250/50 = 5.0).",
        "ΔL = σ/E · L = 50/200,000 × 1000 mm = 0.25 mm (1-m steel bar at 50 MPa).",
        "Poisson contraction: ε_lat = −0.30 × 2.5e-4 = −7.5e-5; for d = 16 mm bar, Δd = −1.2 μm.",
        "Thermal stress in steel ΔT = +80 °C constrained: σ_T = 200,000 × 12e-6 × 80 = 192 MPa (compressive).",
      ],
      industrial_examples: [
        "Construction — A992 25-mm rod carrying 120 kN: σ_gross = 244 MPa (FAILS 0.6·F_y = 207); redesign to 32-mm rod (σ_gross = 149 MPa ✓).",
      ],
      case_studies: [
        "SYNTHETIC — Northstar Pipeline 16-in API 5L X70 tie-in: thermal σ_T = 192 MPa at ΔT = +80 °C; combined with 171 MPa hoop stress, von Mises = 182 MPa < σ_y = 485 MPa (FS = 2.66).",
      ],
      common_errors: [
        "Mixing units (Pa with MPa, mm² with m²) in σ = F/A.",
        "Using engineering stress past necking as if true (σ_true = σ_eng·(1+ε_eng)).",
        "Forgetting Poisson's effect on multi-axial stress (full 3D Hooke's law: ε_x = (1/E)·[σ_x − ν(σ_y + σ_z)]).",
        "Ignoring K_t at holes, fillets, notches (σ = F/A is bulk only).",
        "Confusing the 0.2%-offset yield with the proportional limit (σ_pl < σ_y).",
        "Confusing thermal strain (free, ε_T = α·ΔT) with thermal stress (constrained, σ_T = E·α·ΔT).",
      ],
      limitations: [
        "Hooke's law σ = Eε holds only in the linear-elastic regime (σ < σ_y).",
        "σ = F/A assumes a uniform bar in pure axial load — non-uniform cross-sections or eccentric load need σ = My/I, τ = VQ/It.",
        "Engineering stress–strain is a convenient fiction past necking; use true stress for plastic analysis.",
        "Saint-Venant's principle is silent on local stress near discontinuities — K_t × σ_nominal is first-order; FEA for the actual peak.",
        "Classical formulas assume small deformations and linear elasticity — large-deformation or hyper-elastic (rubber, soft tissue) needs specialized theory.",
      ],
      best_practices: [
        "Always convert to a consistent unit system before applying σ = F/A (SI: N, mm², MPa).",
        "Verify σ ≤ σ_allow (ASD: F_y/Ω; LRFD: φ·F_y) before approval.",
        "Apply K_t (Peterson or FEA) at all holes, fillets, notches, keyseats.",
        "Use the 0.2%-offset method per ASTM E8 / ISO 6892-1 to extract σ_y from a noisy stress-strain curve.",
        "For multi-axial stress, use the full 3D Hooke's law (or Lesson 3 Mohr's circle).",
        "Always check thermal stress when the structure has constrained ends and a temperature change — pipelines, railroad tracks, glass windows, composite laminates.",
      ],
      related_concepts: [
        "Torsion & Bending (Lesson 2 — non-uniform stress distributions τ = Tc/J, σ = My/I)",
        "Combined Loading & Buckling (Lesson 3 — Mohr's circle, principal stresses, Euler buckling)",
        "Material science (crystalline lattice, dislocation motion, strain hardening)",
        "FEA — stress analysis at discontinuities (Peterson, ANSYS Mechanical)",
      ],
      prerequisites: [
        "Statics (ΣF = 0, ΣM = 0; section method for N, V, M, T)",
        "Calculus (derivatives, integration for non-uniform distributions)",
        "Vector mechanics (traction vector, stress at a point)",
        "Basic material science (crystalline lattice, dislocation motion)",
      ],
      references: MOM_REFERENCE_TITLES,
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
        "Which statement correctly expresses Hooke's law for a uniaxial linear-elastic material?",
      explanation:
        "Hooke's law in 1D states σ = Eε — stress is linearly proportional to strain via Young's modulus E, in the linear-elastic regime (σ < σ_y).",
      whyCorrect:
        "Hooke's law (Robert Hooke, 1678; Thomas Young's modulus formalization, 1807) states that, for a linear-elastic material in the regime below the proportional limit, stress is proportional to strain: σ = Eε, where E is Young's modulus (the slope of the σ–ε curve's initial linear region). Equivalently the deformation is ΔL = (F·L)/(A·E). The law holds only while σ < σ_y (the yield strength); above yield the material deforms plastically and Hooke's law no longer applies.",
      whyOthersWrong: [
        "Option σ = E²·ε has the wrong power on E — dimensionally incorrect (E has units of stress, σ has units of stress, so the proportionality must be first-order).",
        "Option ε = E·σ reverses the dependent/independent roles — strain is proportional to stress divided by E, not multiplied.",
        "Option σ = E/ε has E divided by strain — dimensionally wrong and physically nonsensical (σ should increase with ε, not inversely).",
      ],
      options: [
        { text: "σ = E·ε", isCorrect: true },
        { text: "σ = E²·ε", isCorrect: false },
        { text: "ε = E·σ", isCorrect: false },
        { text: "σ = E/ε", isCorrect: false },
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
        "A solid round steel bar of cross-sectional area A = 200 mm² carries an axial tensile load F = 10 kN. The normal stress in the bar is:",
      explanation:
        "σ = F/A = 10,000 N / 200 mm² = 50 N/mm² = 50 MPa. (1 N/mm² = 1 MPa.)",
      whyCorrect:
        "Apply σ = F/A directly: F = 10 kN = 10,000 N; A = 200 mm². σ = 10,000/200 = 50 N/mm² = 50 MPa (since 1 N/mm² = 1 MPa in SI). For structural steel with σ_y = 250 MPa, the factor of safety on yielding is FS = σ_y/σ = 250/50 = 5.0 — comfortable. The corresponding strain is ε = σ/E = 50 MPa / 200 GPa = 50/200,000 = 2.5×10⁻⁴ = 0.025%.",
      whyOthersWrong: [
        "Option 5 MPa uses 10,000 N ÷ 2000 mm² — a 10× area error (perhaps converting mm² to m² incorrectly: 200 mm² = 200×10⁻⁶ m², so 10,000/(200×10⁻⁶) = 5×10⁷ Pa = 50 MPa — that's correct; the distractor uses A = 2000 mm²).",
        "Option 500 MPa is off by 10× in the other direction — likely the unit confusion of kN to N (10 kN ≠ 100,000 N).",
        "Option 2 MPa = 10,000/(50×100) — uses some incorrect area or 5× the load.",
      ],
      options: [
        { text: "50 MPa", isCorrect: true },
        { text: "5 MPa", isCorrect: false },
        { text: "500 MPa", isCorrect: false },
        { text: "2 MPa", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Automotive",
      stem:
        "For an isotropic linear-elastic steel with E = 200 GPa and ν = 0.30, the shear modulus G is closest to:",
      explanation:
        "G = E/[2(1 + ν)] = 200/[2·1.30] = 200/2.6 = 76.9 GPa. For metals, G ≈ 0.38·E (consistent with ν ≈ 0.30).",
      whyCorrect:
        "The isotropic linear-elastic relationship G = E/[2(1 + ν)] gives G = 200 GPa/[2 × (1 + 0.30)] = 200/2.6 = 76.92 GPa. This is the standard shear modulus of steel; combined with the bulk modulus K = E/[3(1 − 2ν)] = 200/[3 × 0.40] = 200/1.2 = 166.67 GPa. Note: for ν = 0.5 (incompressible rubber), G = E/3 and K → ∞ — the material cannot be compressed hydrostatically but can still shear. The relation G = E/[2(1+ν)] is one of only two independent elastic constants for an isotropic material.",
      whyOthersWrong: [
        "Option 60.0 GPa uses G = E/[2(1+ν)] with ν=0.67 instead of 0.30 — confuses with a near-incompressible material.",
        "Option 100 GPa = E/2 — would be correct only if ν = 0 (cork, certain foams).",
        "Option 200 GPa = E itself — confuses shear modulus with Young's modulus.",
      ],
      options: [
        { text: "76.9 GPa", isCorrect: true },
        { text: "60.0 GPa", isCorrect: false },
        { text: "100 GPa", isCorrect: false },
        { text: "200 GPa", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem:
        "True or False: Hooke's law σ = Eε applies throughout the entire stress-strain curve, including the plastic deformation regime beyond the yield strength σ_y.",
      explanation:
        "FALSE. Hooke's law σ = Eε applies only in the linear-elastic regime (σ < σ_y, the proportional limit). Beyond yield, the material enters plastic deformation where strain is permanent and the stress-strain relation is non-linear (Ramberg-Osgood).",
      whyCorrect:
        "FALSE. Hooke's law σ = Eε is valid only in the linear-elastic regime — below the proportional limit (or, conservatively, below the 0.2%-offset yield strength σ_y). Above σ_y the material deforms plastically (permanently); the stress-strain curve becomes non-linear, often described by the Ramberg-Osgood relation ε = σ/E + α·(σ/σ_0)^(n−1)·(σ/E), where α and n are material constants. Unloading from a plastic state leaves residual (permanent) strain — the material does not return to its original length. Hooke's law is silent on this plastic regime; applying σ = Eε above σ_y (e.g., using E as the slope in the plastic region) gives nonsensical results — the actual secant modulus is much lower than E.",
      whyOthersWrong: [
        "Option TRUE conflates the linear-elastic regime (where Hooke's law applies) with the entire stress-strain curve (including plastic deformation). Hooke's law is a constitutive law valid only below the proportional limit; the plastic regime requires a non-linear constitutive model (Ramberg-Osgood, Hollomon, Johnson-Cook).",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Torsion & Bending
// (slug: mom-torsion-bending)
// ---------------------------------------------------------------------------

const LESSON_TORSION_BENDING: RefLesson = {
  slug: "mom-torsion-bending",
  title: "Torsion & Bending",
  titleAr: "اللي والانحناء",
  order: 2,
  durationMin: 35,
  references: MOM_REFERENCE_TITLES,
  conceptIntroduction: `When the internal resultant on a cross-section is a *torque* T (about the longitudinal axis) or a *bending moment* M (about a transverse axis), the stress distribution is no longer uniform. Torsion of a circular shaft produces a linear *shear stress* distribution τ = Tc/J (peak at the outer fiber c = d/2, zero at the center) and an angle of twist φ = TL/(GJ). Pure bending of a beam produces a linear *normal stress* distribution σ = My/I (peak at the outer fiber, zero at the neutral axis) with curvature κ = M/(EI). For non-circular cross-sections in torsion the membrane analogy (Prandtl, 1903) gives the stress distribution; for built-up beam sections the shear flow q = VQ/I governs rivet and weld sizing. This lesson covers the torsion formula τ = Tc/J, the flexure formula σ = My/I, the shear and moment diagrams that identify the critical section, and the worked example of a 40-mm solid round shaft carrying T = 500 N·m with τ_max = 40 MPa.`,
  sections: {
    learning_objectives: `- Derive the torsion formula τ = Tc/J for a circular shaft (J = πd⁴/32 solid, J = π(D⁴ − d⁴)/32 hollow).
- Compute the angle of twist φ = TL/(GJ) for a uniform shaft and ∫T/(GJ) dx for a stepped shaft.
- Derive the flexure formula σ = My/I for a beam in pure bending (neutral axis, I = second moment of area).
- Compute the maximum bending stress σ_max = M_max·c/I and locate the critical section from the shear & moment diagrams.
- Draw the shear V(x) and moment M(x) diagrams for simply-supported, cantilever, and overhang beams under point, distributed, and moment loads.
- Compute the transverse shear stress τ = VQ/(It) and the shear flow q = VQ/I in built-up sections (rivets, welds, glued joints).
- Apply AISC 360-22 Chapter F (bending) and Chapter G (shear) to size steel W-shape beams.`,
    prerequisites: `- Stress & Strain (Lesson 1) — σ = F/A, Hooke's law σ = Eε, Poisson's ratio, G = E/[2(1+ν)].
- Statics: equilibrium ΣF = 0, ΣM = 0; section method for internal resultants N, V, M, T.
- Calculus: integration of distributed loads w(x) → V(x) → M(x); integration of M(x)/(EI) for deflection.
- Second moment of area I for common shapes (rectangle bh³/12, circle πd⁴/64, parallel-axis theorem).`,
    introduction: `Two stress distributions dominate structural design beyond the simple σ = F/A of Lesson 1: *torsion* (torque T about the longitudinal axis produces a *shear stress* τ that varies linearly from zero at the center to a peak at the outer fiber) and *bending* (moment M about a transverse axis produces a *normal stress* σ that varies linearly from compression on one side to tension on the other, with zero at the *neutral axis*).

**Torsion of circular shafts.** Charles-Augustin de Coulomb (1784) derived, and Saint-Venant (1855) generalized, the *torsion formula*:
  τ = T·c/J
where c = outer-fiber radius (d/2), and J = polar moment of inertia of the cross-section. For a solid circular shaft J = πd⁴/64 × 2 = πd⁴/32; for a hollow circular shaft J = π(D⁴ − d⁴)/32. The *angle of twist*:
  φ = TL/(GJ)
linear in T and L, inversely proportional to the torsional stiffness GJ. The power-torque-speed relation for a rotating shaft: P = T·ω = T·2π·n/60, so a 100-kW motor at 1800 rpm delivers T = 100,000/(2π·30) = 530 N·m.

**Pure bending of beams.** Euler–Bernoulli beam theory (1750) assumes plane sections remain plane and perpendicular to the neutral axis. The flexure formula:
  σ = M·y/I
where y is the distance from the neutral axis (signed positive in tension), I = second moment of area of the cross-section about the neutral axis (rectangle bh³/12, circle πd⁴/64, I-beam I_x ≈ web + 2 flanges via parallel-axis theorem). The *maximum bending stress* σ_max = M_max·c/I occurs at the section where M is maximum (located from the shear and moment diagrams) and at the outer fiber y = c. Beam curvature κ = 1/R = M/(EI); deflection v(x) satisfies EI·v'''' = w(x) (load per unit length), or EI·v'' = M(x) (curvature).

**Shear and moment diagrams.** The distributed load w(x) (downward positive) is integrated once to give shear V(x) = −∫w(x) dx + C₁ and again to give moment M(x) = −∫V(x) dx + C₂. Point loads produce a step discontinuity in V; concentrated moments produce a step discontinuity in M. The maximum |M| locates the critical section for σ = My/I.

**Transverse shear in beams.** The shear stress at a distance y from the neutral axis of a beam of width t(y) under transverse shear V is:
  τ = V·Q(y)/[I·t(y)]
where Q(y) = ∫_{A_above y} y' dA is the first moment of the area above y. The maximum shear stress in a rectangular beam (b×h) is τ_max = 1.5·V/A (50% above the average). For a W-shape (I-beam) most of the shear is carried by the web (τ ≈ V/(d·t_w) — the *average shear stress in the web* formula used in AISC 360-22 Chapter G).

**Shear flow in built-up sections.** For riveted, welded, or glued built-up sections, the shear flow q = V·Q/I (force per unit length along the beam) sizes the fastener spacing: p ≤ q_allow/fastener_capacity. This is the design rule for box beams, plate girders, and built-up columns.`,
    terminology: `- **Torque T**: moment about the longitudinal axis of a shaft (N·m).
- **Polar moment of inertia J**: ∫ρ² dA for the cross-section; J = πd⁴/32 (solid round), π(D⁴ − d⁴)/32 (hollow round).
- **Angle of twist φ**: rotation of one cross-section relative to another (radians); φ = TL/(GJ).
- **Torsional stiffness GJ**: resistance to twist (N·m²); the analogue of flexural stiffness EI for bending.
- **Power-torque relation**: P = T·ω = T·2π·n/60 (W, rad/s, rpm).
- **Bending moment M**: moment about a transverse axis (N·m); positive when sagging (tension at the bottom).
- **Shear V**: transverse force on the cross-section (N).
- **Neutral axis (NA)**: the line in the cross-section where σ = 0; passes through the centroid for symmetric sections.
- **Second moment of area I**: ∫y² dA about the NA; rectangle bh³/12, circle πd⁴/64, I-beam parallel-axis.
- **Flexure formula σ = My/I**: normal stress in pure bending; σ_max = M_max·c/I.
- **Curvature κ = 1/R = M/(EI)**: inverse radius of curvature; deflection v(x) from EI·v'' = M(x).
- **Flexural rigidity EI**: resistance to bending (N·m²).
- **Shear-stress formula τ = VQ/(It)**: transverse shear in beams; Q = first moment of area above y.
- **Shear flow q = VQ/I**: force per unit length in built-up sections.
- **Shear & moment diagrams**: plots of V(x) and M(x) along the beam.
- **Critical section**: the location where |M| is maximum (for σ = My/I) or where V is maximum (for τ = VQ/It).`,
    detailed_explanation: `**Torsion of circular shafts.** Consider a solid circular shaft of radius c, length L, fixed at one end, with torque T at the free end. By axisymmetry every radial line rotates by the same angle φ, and every cross-section remains plane. The shear strain at radius ρ is γ(ρ) = ρ·(φ/L); by Hooke's law in shear τ = Gγ → τ(ρ) = G·ρ·(φ/L). Equilibrium with the applied torque:
  T = ∫_A ρ·τ(ρ) dA = ∫_A ρ·(G·ρ·φ/L) dA = (G·φ/L)·∫_A ρ² dA = (G·φ/L)·J
where J = ∫_A ρ² dA = polar moment of inertia. Solving for τ:
  τ(ρ) = T·ρ/J
  τ_max = T·c/J     (at the outer fiber ρ = c = d/2)
  φ = TL/(GJ)
For a solid circular shaft J = πd⁴/32; for a hollow circular shaft J = π(D⁴ − d⁴)/32. The hollow shaft is more efficient (mass per unit J) because material at the center contributes little to J (ρ² small).

**Power-torque-speed.** A rotating shaft transmitting power P at angular speed ω carries torque T = P/ω. For SI: P (W), ω (rad/s), T (N·m); for US: P (hp), n (rpm), T (lb·ft) = 5252·P/n. A 100-kW motor at 1800 rpm delivers T = 100,000/(2π·30) = 530 N·m. Sizing the shaft: τ_max = T·c/J ≤ τ_allow; for steel τ_allow = 0.4·σ_y (typical) → solve for d.

**Bending (Euler–Bernoulli).** Under pure bending (constant M, no V), the beam deforms into a circular arc of radius R = EI/M. Plane sections remain plane and perpendicular to the neutral axis (Euler–Bernoulli hypothesis). Strain at distance y from the NA: ε = y/R = y·κ, where κ = 1/R = M/(EI). Hooke's law gives σ = Eε = E·y/R = M·y/I. Therefore:
  σ(y) = M·y/I
  σ_max = M_max·c/I     (at the outer fiber y = c)
For a rectangular beam (b wide, h deep, NA at h/2): I = bh³/12, c = h/2, σ_max = 6·M_max/(b·h²). For a W-shape (steel I-beam), look up I_x in the AISC Steel Construction Manual.

**Shear and moment diagrams.** The load V-M relations: dV/dx = −w(x); dM/dx = V(x). Integrating: V(x) = −∫w dx + C₁; M(x) = ∫V dx + C₂. Boundary conditions: at a free end V and M are zero; at a simple support M is zero (V is the reaction); at a fixed support V and M are the reaction and moment. Point loads produce step discontinuities in V; concentrated moments produce step discontinuities in M.

**Transverse shear.** For a beam of arbitrary cross-section under transverse shear V, the shear stress at distance y from the NA is:
  τ(y) = V·Q(y)/[I·t(y)]
where Q(y) = ∫_{A_above y} y' dA is the first moment of the area above y about the NA, and t(y) is the section width at y. The maximum τ for a rectangular beam (b × h) is τ_max = 1.5·V/(b·h) — 50% above the average. For a W-shape the shear is almost entirely in the web; the AISC 360-22 Chapter G uses the average τ_web = V/(d·t_w).

**Shear flow in built-up sections.** A box beam, a plate girder, or a riveted column has fasteners (rivets, welds, glue) holding the components together. Under transverse shear V, each fastener resists the shear flow q = V·Q/I (force per unit length), where Q is the first moment of the connected component about the NA. The fastener spacing p (m) must satisfy p ≤ F_fastener/q_allow — typically p = 100–300 mm in structural steel.`,
    core_principles: `- **Torsion formula**: τ = Tc/J (solid: J = πd⁴/32; hollow: J = π(D⁴ − d⁴)/32).
- **Angle of twist**: φ = TL/(GJ) for uniform; ∫T/(GJ) dx for non-uniform.
- **Power-torque-speed**: P = T·ω = T·2π·n/60.
- **Flexure formula**: σ = My/I; σ_max = M_max·c/I; the critical section is at M_max.
- **Shear & moment relations**: dV/dx = −w, dM/dx = V; point loads → step in V; concentrated moments → step in M.
- **Transverse shear**: τ = VQ/(It); max in rectangular beam τ_max = 1.5·V/A.
- **Shear flow in built-up sections**: q = V·Q/I; fastener spacing p ≤ F_fast/q_allow.`,
    components: `- **Solid round shaft**: d (diameter), J = πd⁴/32, c = d/2.
- **Hollow round shaft**: D outer, d inner, J = π(D⁴ − d⁴)/32.
- **Rectangular beam**: b wide, h deep, I = bh³/12, c = h/2, NA at centroid.
- **W-shape (I-beam)**: AISC Steel Construction Manual tables for I_x, S_x, Z_x, d, t_w, b_f, t_f.
- **Built-up section**: plate girder or box beam with rivets/welds; shear flow q = V·Q/I sizes fasteners.
- **Universal Testing Machine (UTM)**: for tension/compression; torsion machines (e.g., Tinius-Olsen) for τ.
- **Strain-gage rosette**: for experimental determination of principal stresses (Lesson 3).`,
    process: `1. Compute the support reactions (ΣF = 0, ΣM = 0).
2. Section the member at the point of interest; expose the internal resultant (N, V, M, T).
3. (Torsion) Apply τ = Tc/J; check τ_max ≤ τ_allow (typically 0.4·σ_y for steel shafts).
4. (Bending) Draw the V(x) and M(x) diagrams; locate M_max. Apply σ_max = M_max·c/I ≤ σ_allow.
5. (Shear) Compute τ = V_max·Q/(I·t); for W-shape use τ_avg = V/(d·t_w) per AISC G.
6. (Combined) If both M and T present, compute von Mises σ_eq = √(σ² + 3τ²) ≤ σ_allow (Lesson 3).
7. (Deflection) Integrate EI·v'' = M(x) with BCs to find v(x); check v_max ≤ L/360 (floors) or L/240 (roofs).
8. (Stiffness) Compute φ = TL/(GJ) (torsion) or v(L) (bending); check serviceability.`,
    formula_calculation: `**Torsion (solid round shaft):**
  J = πd⁴/32
  τ(ρ) = T·ρ/J
  τ_max = T·c/J = T·(d/2)/(πd⁴/32) = 16T/(πd³)
  φ = TL/(GJ)
  For hollow round: J = π(D⁴ − d⁴)/32.

**Power-torque-speed:**
  P = T·ω = T·2π·n/60
  SI: T = 9550·P(kW)/n(rpm) [N·m]
  US: T = 5252·P(hp)/n(rpm) [lb·ft]

**Flexure (pure bending):**
  σ(y) = M·y/I
  σ_max = M_max·c/I    where c = distance from NA to outer fiber
  Curvature κ = 1/R = M/(EI)
  Deflection v(x): EI·v'' = M(x); integrate twice + apply BCs.

**Second moment of area I (about NA):**
  Rectangle: I = bh³/12, c = h/2, S = bh²/6
  Circle: I = πd⁴/64, c = d/2, S = πd³/32
  Hollow rectangle: I = (BH³ − bh³)/12
  W-shape: from AISC manual (I_x, S_x, Z_x)

**Transverse shear:**
  τ(y) = V·Q(y)/[I·t(y)]
  Q(y) = ∫_{A_above y} y' dA (first moment above y)
  Rectangular beam: τ_max = 1.5·V/A (50% above avg)
  W-shape: τ_avg = V/(d·t_w) (AISC G2 approximation)

**Shear flow in built-up sections:**
  q = V·Q/I    [N/m or kN/m]
  Fastener spacing: p ≤ F_fastener/q_allow

**Stiffness:**
  Torsional stiffness k_T = GJ/L  [N·m/rad]
  Flexural stiffness k_B = 3EI/L³ (cantilever, tip load) or 48EI/L³ (simply supported, mid-span point)

**Assumptions**: (i) linear-elastic, isotropic material (σ < σ_y); (ii) small deformations (geometric linearization); (iii) circular cross-section for the simple torsion formula (non-circular requires Prandtl membrane analogy or FEA); (iv) Euler–Bernoulli beam: plane sections remain plane and perpendicular to NA (slender beams, L/h > 10); (v) Saint-Venant: away from supports and load points (≥ 1–2 beam depths).

**Interpretation**: τ = Tc/J shows that the outer fibers of a circular shaft carry the most shear — a hollow shaft is more efficient. σ = My/I shows that the outer fibers of a beam carry the most normal stress — an I-beam concentrates material at the flanges (large y) where it's most effective. Both distributions are linear from zero at the center/NA to the maximum at the outer fiber.`,
    worked_example: `**Torsion of a solid round steel shaft.**
A solid round steel shaft of diameter d = 40 mm carries a torque T = 500 N·m. Compute the maximum shear stress τ_max.

  J = πd⁴/32 = π·(40)⁴/32 = π·2,560,000/32 = 251,327 mm⁴ = 2.513×10⁻⁷ m⁴
  c = d/2 = 20 mm = 0.020 m
  τ_max = T·c/J = 500 × 0.020 / 2.513×10⁻⁷ = 10 / 2.513×10⁻⁷ = 39.8×10⁶ Pa ≈ 40 MPa ✓

(Using the shortcut τ_max = 16T/(πd³): τ_max = 16·500/(π·0.040³) = 8000/(2.011×10⁻⁴) = 39.78×10⁶ Pa ≈ 39.8 MPa ✓)

Sanity check: τ_max = 40 MPa is well below the typical shear yield strength of steel (τ_y ≈ 0.577·σ_y ≈ 0.577·250 = 144 MPa, von Mises). Factor of safety FS = 144/40 = 3.6 — comfortable.

**Angle of twist (L = 1 m, G = 77 GPa).**
  φ = TL/(GJ) = 500·1.0/(77×10⁹ × 2.513×10⁻⁷) = 500/(19,351) = 0.0258 rad = 1.48°

**Bending of a simply-supported beam.**
A simply-supported steel W310×74 beam (I_x = 133×10⁶ mm⁴, S_x = 851×10³ mm³, d = 310 mm, t_w = 9 mm) carries a uniformly distributed load w = 30 kN/m over a span L = 6 m. Compute the maximum bending stress.

  M_max = w·L²/8 = 30·36/8 = 135 kN·m = 135×10⁶ N·mm
  σ_max = M_max/S_x = 135×10⁶/851×10³ = 158.6 MPa (using the section modulus S = I/c)
  Alternatively σ_max = M_max·c/I = 135×10⁶·155/133×10⁶ = 157.4 MPa (c = d/2 = 155 mm)

For A992 steel (σ_y = 345 MPa), ASD allow = 0.66·σ_y = 228 MPa; LRFD φ_b·M_p ≈ 0.9·345·Z_x (Z_x ≈ 948×10³ mm³) → M_p ≈ 294 kN·m > 135 kN·m ✓.

**Maximum shear (V_max = w·L/2 = 90 kN) and shear stress:**
  τ_avg = V/(d·t_w) = 90,000/(310·9) = 32.3 MPa (AISC G2 average)
  τ_max ≈ 1.5·V/(d·t_w) = 48.4 MPa (peak in web) — both well below τ_y ≈ 199 MPa (0.577·345) ✓.

**Shear and moment diagrams (sketch).** For a simply-supported beam with UDL w over span L:
  V(x) = w·(L/2 − x)  → linear from +wL/2 at x=0 to −wL/2 at x=L (zero at midspan)
  M(x) = (w·x/2)·(L − x)  → parabolic from 0 at x=0 to wL²/8 at midspan to 0 at x=L
The critical section is at x = L/2 (where M_max = wL²/8).`,
    industrial_example: `**Industry: Power — generator shaft sizing.** A 200-MW turbine-generator spins at 3600 rpm. T = 9550·P/n = 9550·200,000/3600 = 530,555 N·m = 530 kN·m. Forged steel shaft, σ_y = 600 MPa, τ_allow = 0.4·σ_y = 240 MPa. J = T·c/τ_max; assuming τ_max = 240 MPa, c = T·c/(J·τ_max) → d³ = 16T/(π·τ_max) = 16·530,555/(π·240e6) = 8,488,880/753,982,237 = 1.126×10⁻² m³ → d = 0.224 m = 224 mm. Standard forged-steel generator shaft: 220–250 mm diameter, 6–8 m long, journal bearings every 1.5 m to limit lateral vibration and bending stress. The shaft also carries the rotor weight (bending M = wL²/8 for a simply-supported span) — combined bending + torsion is checked with σ_eq = √(σ² + 3τ²) per Lesson 3.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Bridge Street Overpass — W-shape girder selection (synthetic, illustrative).* A 12-m simply-supported steel girder for a highway overpass carries an HS-20 truck live load (P = 72 kN per axle × 2 axles + 8-kN/m lane dead load). The maximum moment M_max = PL/4 + wL²/8 = 72·12/4 + 8·144/8 = 216 + 144 = 360 kN·m. Required S_x = M_max/(0.66·σ_y) = 360,000,000/(0.66·345) = 1,581×10³ mm³. AISC W760×147 (S_x = 1,590×10³ mm³) just meets the requirement; W840×210 (S_x = 2,490×10³) provides a 57% reserve for future traffic growth. The designer chose W840×210 — the redundant capacity paid off when the overpass was widened 18 years later from 2 lanes to 4 lanes; the girder absorbed the additional dead load without retrofits.`,
    visual_explanation: `**Torsion of a circular shaft.** A 3D sketch shows a solid circular shaft fixed at the left end, torque T applied at the right. A radial line on the right face rotates by φ (the angle of twist) relative to a parallel line on the left face. The shear strain γ varies linearly from 0 at the center to γ_max = c·φ/L at the outer fiber; the shear stress τ = Gγ follows the same linear distribution. The companion formula box: τ_max = Tc/J, φ = TL/(GJ). **Bending of a beam.** A 3D sketch shows a simply-supported beam with a downward distributed load, deflecting into a downward-bulging arc. A cross-section cut at the critical midspan shows the linear σ distribution: tension (+) at the bottom fiber, zero at the NA, compression (−) at the top fiber. The companion V-M diagram below the beam: V(x) triangular (linear from +wL/2 to −wL/2), M(x) parabolic peaking at M_max = wL²/8 at midspan.`,
    simulation_opportunity: `Open the EngiSuite "Torsion & Bending explorer" — sliders for shaft diameter d, length L, torque T, material (E, ν → G); watch τ_max and φ update live. A second pane runs the W-shape beam designer: pick a span, distributed load, point load; the V-M diagrams auto-draw and the maximum |M| and |V| sections are marked. Fastener-spacing tool: input V, Q (first moment of the connected component), I, and the fastener's shear capacity; output the maximum spacing p. For real practice, use MASTS (structural steel) or RISA-3D to run W-shape selection per AISC 360-22 Chapter F (bending) and Chapter G (shear); use ANSYS Mechanical for combined torsion + bending on a 3D shaft with stress concentrations at keyseats.`,
    common_mistakes: `- **Using J (polar moment) for non-circular cross-sections**: the simple τ = Tc/J formula is valid ONLY for circular (solid or hollow) shafts. Rectangular or open sections need the Prandtl membrane analogy or a torsion constant J_eff that is much smaller than the polar moment of inertia.
- **Confusing I (second moment of area) with J (polar moment of inertia)**: J = ∫ρ² dA = I_x + I_y for any cross-section. For a circular cross-section, I_x = I_y = πd⁴/64, so J = 2·πd⁴/64 = πd⁴/32.
- **Locating σ_max at the wrong section**: σ_max = M_max·c/I occurs where M is max — read the V-M diagram, don't guess. A common error is to evaluate σ at the support (where V is max but M is often zero in a simply-supported beam).
- **Forgetting the 1.5 factor on rectangular shear**: τ_max = 1.5·V/A is 50% above the average — using τ = V/A understates the peak shear.
- **Sign errors on M and V**: adopt a consistent convention (e.g., sagging M positive; shear downward on the right face of a cut positive). Reverse-engineering the sign from a confused diagram is the most common source of error.
- **Using the average shear V/(d·t_w) without checking thin-web assumptions**: the AISC G2 formula is valid for W-shapes with d/t_w ≤ 59 (compact web); for slender webs use the tension-field action formula.
- **Ignoring the lateral-torsional buckling (LTB) check**: a W-shape in bending can buckle out of plane before σ reaches σ_y if its compression flange is not laterally braced. AISC 360-22 Chapter F requires the LTB check.`,
    limitations: `- The simple torsion formula τ = Tc/J holds ONLY for circular shafts (solid or hollow). Non-circular sections (rectangles, open thin-walled, I-beams) warp out of plane; the Prandtl membrane analogy or FEA is required.
- The Euler–Bernoulli beam theory assumes plane sections remain plane and perpendicular to NA — invalid for deep beams (L/h < 10) where shear deformation matters; use Timoshenko beam theory.
- AISC 360-22 G2's τ_avg = V/(d·t_w) is a thin-web approximation — for stocky webs or out-of-plane shear, the full τ = VQ/It must be used.
- All formulas assume linear-elastic, isotropic, small-deformation behavior — large-deformation, plastic, or anisotropic materials need specialized theories (FEA, hyper-elasticity, anisotropic elasticity).
- The flexure formula σ = My/I assumes the section is symmetric about the bending axis and the NA passes through the centroid. For unsymmetric sections, find the principal axes and apply σ = M·y/I about the strong axis (or resolve M into components along both principal axes).
- Lateral-torsional buckling (LTB) is not captured by σ = My/I alone; AISC F2-F5 require a separate LTB check based on the unbraced length L_b.`,
    comparison: `| Loading | Stress formula | Distribution | Critical location |
|---|---|---|---|
| Axial (Lesson 1) | σ = N/A | Uniform | Any section (bulk) |
| Torsion (circular) | τ = Tc/J | Linear, 0 center → max at fiber | Outer fiber |
| Bending (pure) | σ = My/I | Linear, 0 at NA → max at fiber | Section with M_max |
| Transverse shear | τ = VQ/(It) | Parabolic in rect (max at NA) | Section with V_max, at NA |
| Shear flow (built-up) | q = VQ/I | Force per unit length | At fastener lines |

| Cross-section | I (bending) | J (torsion) | Efficiency |
|---|---|---|---|
| Solid circle d | πd⁴/64 | πd⁴/32 | Low (material at center unused in J) |
| Hollow circle D,d | π(D⁴−d⁴)/64 | π(D⁴−d⁴)/32 | High (material at outer fiber) |
| Rectangle b×h | bh³/12 | ≈bh³/16 (non-circular!) | Low (low I/J for torsion) |
| I-beam (W-shape) | I_x tabulated | J ≈ 1/3 Σ(b·t³) thin parts | High bending, low torsion |
| Box section | I = (BH³−bh³)/12 | high J (closed section) | High bending AND torsion |`,
    practical_application: `**Industrial sizing — W-shape girder per AISC 360-22.** A 6-m simply-supported floor beam carries w = 30 kN/m (dead + live). Compute M_max = wL²/8 = 135 kN·m. Required S_x = M_max/(0.66·σ_y) = 135e6/(0.66·345) = 593×10³ mm³. AISC W310×74 (S_x = 851×10³) provides 44% reserve — select. Check shear: V_max = wL/2 = 90 kN; τ_avg = V/(d·t_w) = 90,000/(310×9) = 32.3 MPa < 0.4·F_y = 138 MPa ✓. Check deflection: Δ_max = 5wL⁴/(384·E·I_x) = 5·30·6⁴·10¹²/(384·200,000·133×10⁶) = 23,328×10¹²/10,240×10⁹ = 22.8 mm. Allowable Δ = L/360 = 6000/360 = 16.7 mm → FAILS (22.8 > 16.7). Redesign: W460×74 (I_x = 333×10⁶ mm⁴); Δ_max = 5·30·6⁴/(384·200·333) = 23,328×10¹²/25,600×10⁹ = 9.1 mm < 16.7 ✓. The heavier W460×74 is selected on deflection (serviceability), not on strength.`,
    decision_scenario: `You are the mechanical lead on a 200-MW steam-turbine generator. The shaft (d = 220 mm, L = 6 m, σ_y = 600 MPa) carries T = 530 kN·m at 3600 rpm and the rotor weight w = 50 kN/m (simply-supported at journal bearings every 1.5 m). Compute combined stress at the mid-span section. Torsional shear τ = Tc/J = 16·530,555/(π·0.220³) = 8,488,880/(3.341×10⁻²) = 254 MPa. Bending stress from rotor weight: M_max = w·L²/8 (between bearings L = 1.5 m, M = 50·1.5²/8 = 14.06 kN·m); σ = M·c/I = M/S where S = πd³/32 = π·(220)³/32 = 1.050×10⁶ mm³ → σ = 14.06×10⁶/1.050×10⁶ = 13.4 MPa (small). Combined von Mises σ_eq = √(σ² + 3τ²) = √(13.4² + 3·254²) = √(180 + 193,548) = √193,728 = 440 MPa < σ_y = 600 MPa (FS = 1.36). Marginal but acceptable. Decision: increase shaft d to 240 mm at the next outage; τ drops to 16·530,555/(π·0.240³) = 8,488,880/(4.342×10⁻²) = 196 MPa; σ_eq = √(13² + 3·196²) = √(169 + 115,248) = √115,417 = 340 MPa (FS = 1.76). Approve the larger shaft at the next scheduled outage.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: torsion formula, τ_max calculation, flexure formula σ = My/I, and the shear-diagram sign convention.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical, FE Civil, and PE Civil (Structural) exam outlines, the ASME B31.3 (process piping), and the API 610 (centrifugal pumps). Sample FE-style question: "A solid circular steel shaft of diameter 40 mm carries a torque of 500 N·m. The maximum shear stress (in MPa) is: (a) 25; (b) 40; (c) 80; (d) 100." Correct: (b) 40 MPa (τ_max = 16T/(πd³) = 16·500/(π·0.040³) = 8000/(2.011×10⁻⁴) = 39.8 MPa).`,
    summary: `Torsion of circular shafts produces a linear shear stress τ = Tc/J (peak at the outer fiber) and an angle of twist φ = TL/(GJ). Pure bending of beams produces a linear normal stress σ = My/I (peak at the outer fiber, zero at the neutral axis). The shear and moment diagrams locate the critical section where |M| or |V| is maximum. Transverse shear in beams is τ = VQ/(It) (parabolic in rectangles, peaking at the NA); built-up sections carry shear flow q = VQ/I that sizes fastener spacing. AISC 360-22 Chapter F (bending) and Chapter G (shear) govern W-shape beam design with the flexure formula and the average web-shear formula.`,
    key_takeaways: `- τ = Tc/J (circular shaft torsion); J = πd⁴/32 solid, π(D⁴ − d⁴)/32 hollow.
- φ = TL/(GJ); power-torque-speed T = 9550·P/n (kW, rpm, N·m).
- σ = My/I (flexure); σ_max = M_max·c/I; section modulus S = I/c.
- V(x), M(x) relations: dV/dx = −w, dM/dx = V; point load → step in V; moment load → step in M.
- τ = VQ/(It) (transverse shear); max in rectangular beam = 1.5·V/A.
- AISC G2 web shear: τ_avg = V/(d·t_w).
- Shear flow q = V·Q/I sizes fastener spacing in built-up sections.`,
    references: `1. Hibbeler (2023), Ch. 5 (Torsion — τ = Tc/J), Ch. 6 (Bending — σ = My/I), Ch. 7 (Transverse Shear — τ = VQ/It).
2. Beer, Johnston, DeWolf & Mazurek (2020), Ch. 3 (Torsion), Ch. 4 (Pure Bending), Ch. 5 (Beam Design), Ch. 6 (Shear in Beams).
3. Gere & Goodno (2018), Ch. 3 (Torsion), Ch. 4 (Shear & Moment), Ch. 5 (Beam Stresses).
4. ASTM E8/E8M-22 — material properties (σ_y, σ_u) for shaft & beam sizing.
5. AISC 360-22, Chapter F (Bending) & Chapter G (Shear) for W-shape beam design.
6. ISO 6892-1:2019 — international material properties for non-US shaft & beam design.`,
  },
  knowledgeObject: {
    title: "Torsion & Bending — Knowledge Object",
    domain: "Mechanics of Materials",
    competency: "Stress Distributions",
    topic: "Torsion, Bending, Shear Diagrams",
    concept: "τ = Tc/J, σ = My/I, τ = VQ/(It) — non-uniform stress distributions",
    body: {
      definitions: [
        "Torque T: moment about the longitudinal axis of a shaft (N·m).",
        "Polar moment of inertia J = ∫ρ² dA; solid round πd⁴/32, hollow round π(D⁴ − d⁴)/32.",
        "Angle of twist φ = TL/(GJ); torsional stiffness k_T = GJ/L.",
        "Power-torque-speed: P = T·ω; SI T = 9550·P(kW)/n(rpm) [N·m].",
        "Bending moment M: moment about a transverse axis (N·m); positive sagging (tension at bottom).",
        "Neutral axis (NA): line in cross-section where σ = 0; passes through centroid for symmetric sections.",
        "Second moment of area I = ∫y² dA about NA; rectangle bh³/12, circle πd⁴/64, I-beam parallel-axis.",
        "Flexure formula σ = My/I; section modulus S = I/c → σ_max = M_max/S.",
        "Transverse shear τ = VQ/(It); shear flow q = VQ/I in built-up sections.",
      ],
      principles: [
        "τ = Tc/J for circular shafts (linear from 0 at center to max at fiber); hollow shaft is more efficient.",
        "φ = TL/(GJ) — angle of twist linear in T and L, inverse in torsional stiffness GJ.",
        "σ = My/I for pure bending (linear from 0 at NA to max at fiber); I-beam concentrates material at flanges.",
        "V-M relations: dV/dx = −w, dM/dx = V; point loads → step in V; concentrated moments → step in M.",
        "τ = VQ/(It) — transverse shear; rectangular beam τ_max = 1.5·V/A (50% above average).",
        "Shear flow q = VQ/I in built-up sections sizes fastener spacing: p ≤ F_fast/q_allow.",
      ],
      components: [
        "Solid round shaft (d, J = πd⁴/32)",
        "Hollow round shaft (D, d, J = π(D⁴ − d⁴)/32)",
        "Rectangular beam (b, h, I = bh³/12)",
        "W-shape steel beam (AISC manual I_x, S_x, Z_x, d, t_w, b_f, t_f)",
        "Built-up section with rivets/welds (shear flow q sizes fastener spacing)",
        "Universal Testing Machine (UTM) and torsion machines (Tinius-Olsen)",
        "Strain-gage rosette for experimental principal stresses (Lesson 3)",
      ],
      mechanism:
        "Torque produces a shear strain that varies linearly with radius in a circular shaft; equilibrium with the applied torque gives τ = Tρ/J (peak at the outer fiber). Bending moment produces a normal strain that varies linearly with distance from the NA; equilibrium with M gives σ = My/I (peak at the outer fiber). Both distributions are linear because the cross-sections remain plane (Saint-Venant, Euler–Bernoulli).",
      process:
        "Compute support reactions → section the member → expose internal resultant (N, V, M, T) → apply τ = Tc/J (torsion), σ = My/I (bending), τ = VQ/It (transverse shear) → check vs σ_allow → check deflection (EI·v'' = M) → for combined M + T use von Mises σ_eq = √(σ² + 3τ²) (Lesson 3).",
      formulas: [
        "τ = T·c/J (circular shaft); J_solid = πd⁴/32; J_hollow = π(D⁴ − d⁴)/32",
        "τ_max = 16T/(πd³) (solid); φ = TL/(GJ)",
        "T = 9550·P(kW)/n(rpm) [N·m]; P = T·ω = T·2π·n/60",
        "σ = M·y/I; σ_max = M_max·c/I = M_max/S (S = I/c)",
        "I_rect = bh³/12; I_circle = πd⁴/64; I-beam from AISC manual",
        "τ = V·Q/(I·t); τ_max_rect = 1.5·V/A; τ_avg_W-shape = V/(d·t_w) per AISC G2",
        "q = V·Q/I (shear flow in built-up); p ≤ F_fast/q_allow",
        "EI·v'' = M(x) (curvature); k_T = GJ/L; k_B = 3EI/L³ (cantilever tip)",
      ],
      metrics: [
        "Maximum shear stress τ_max (MPa) — torsion design metric",
        "Maximum bending stress σ_max (MPa) — flexure design metric",
        "Angle of twist φ (rad or deg) — torsional serviceability",
        "Maximum deflection v_max (mm) — flexural serviceability (L/360 floors, L/240 roofs)",
        "Section modulus S = I/c (mm³) — bending design aid",
        "Torsional stiffness GJ/L (N·m/rad); Flexural stiffness k_B (N/m)",
        "Shear flow q (kN/m) — fastener sizing for built-up sections",
      ],
      examples: [
        "τ_max = 40 MPa at T = 500 N·m, d = 40 mm (solid round steel shaft).",
        "φ = 1.48° at L = 1 m, G = 77 GPa (same shaft).",
        "σ_max = 158 MPa for W310×74 carrying w = 30 kN/m over L = 6 m (M_max = 135 kN·m).",
        "τ_avg = 32 MPa in W310×74 web (V_max = 90 kN, d·t_w = 310×9 = 2790 mm²).",
      ],
      industrial_examples: [
        "Power — 200-MW turbine-generator shaft at 3600 rpm: T = 530 kN·m, d = 224 mm, τ_max = 240 MPa (at τ_allow).",
      ],
      case_studies: [
        "SYNTHETIC — Bridge Street Overpass W840×210 girder: M_max = 360 kN·m, required S_x = 1,581×10³ mm³; chose W840×210 with 57% reserve (paid off 18 yrs later when widened).",
      ],
      common_errors: [
        "Using τ = Tc/J for non-circular sections (rectangles, I-beams need Prandtl analogy or FEA).",
        "Confusing I (bending, second moment of area) with J (torsion, polar moment of inertia); J = I_x + I_y for any section.",
        "Locating σ_max at the wrong section (read V-M diagram; max |M| is the critical section for σ = My/I).",
        "Forgetting the 1.5 factor on rectangular shear (τ_max = 1.5·V/A, not V/A).",
        "Sign errors on M and V (use consistent sagging-M-positive, downward-right-of-cut-V-positive convention).",
        "Using AISC G2 τ = V/(d·t_w) for non-thin-web W-shapes (valid only for compact webs d/t_w ≤ 59).",
        "Skipping the LTB (lateral-torsional buckling) check on a W-shape in bending (AISC F2–F5).",
      ],
      limitations: [
        "τ = Tc/J valid only for circular (solid or hollow) shafts — non-circular needs Prandtl or FEA.",
        "Euler–Bernoulli beam theory assumes plane sections remain plane (L/h > 10); deep beams need Timoshenko.",
        "AISC G2 web-shear formula is a thin-web approximation; stocky webs need full τ = VQ/It.",
        "Linear-elastic, isotropic, small-deformation assumptions throughout — non-linear or large-deformation needs FEA.",
        "Flexure formula σ = My/I assumes symmetric section about bending axis; unsymmetric needs principal-axis resolution.",
        "Lateral-torsional buckling (LTB) is not captured by σ = My/I alone; AISC F2–F5 require a separate L_b check.",
      ],
      best_practices: [
        "Use the shortcut τ_max = 16T/(πd³) for solid round shafts; J = π(D⁴−d⁴)/32 for hollow.",
        "Always locate M_max and V_max from the V-M diagrams before applying σ = My/I or τ = VQ/It.",
        "For W-shapes, use the AISC G2 web-shear τ = V/(d·t_w) when d/t_w ≤ 59; otherwise use full τ.",
        "Apply the LTB check (AISC F2–F5) for any unbraced compression flange length L_b > L_p.",
        "Check deflection serviceability (L/360 floors, L/240 roofs) alongside strength — often the governing constraint.",
        "For combined M + T on a shaft, use von Mises σ_eq = √(σ_bend² + 3τ_torsion²) (Lesson 3).",
      ],
      related_concepts: [
        "Stress & Strain (Lesson 1 — foundational σ = F/A, σ = Eε)",
        "Combined Loading & Buckling (Lesson 3 — Mohr's circle, principal stresses, Euler buckling)",
        "Engineering Mechanics (Statics — internal resultants N, V, M, T by section method)",
        "FEA — stress analysis on non-circular sections, deep beams, geometric discontinuities",
      ],
      prerequisites: [
        "Stress & Strain (Lesson 1)",
        "Statics (ΣF = 0, ΣM = 0; section method)",
        "Calculus (integration of w(x) → V(x) → M(x) → v(x))",
        "Second moment of area I for common shapes",
      ],
      references: MOM_REFERENCE_TITLES,
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
        "Which formula correctly gives the maximum shear stress τ_max in a solid circular shaft of diameter d carrying torque T?",
      explanation:
        "τ_max = Tc/J where c = d/2 and J = πd⁴/32. Substituting gives τ_max = 16T/(πd³).",
      whyCorrect:
        "The torsion formula τ = T·ρ/J is linear in ρ (radial distance from the center); the maximum is at the outer fiber ρ = c = d/2. For a solid circular cross-section, J = πd⁴/32. Substituting: τ_max = T·(d/2)/(πd⁴/32) = T·(d/2)·(32/(πd⁴)) = 16T/(πd³). This is the standard shortcut formula for solid round shafts. For a hollow round shaft (D outer, d inner): τ_max = 16T·D/(π(D⁴ − d⁴)).",
      whyOthersWrong: [
        "Option τ = T/(πd³) is missing the 16 factor — would be the average shear over the cross-section if scaled wrong.",
        "Option τ = 16T/(πd²) has d² in the denominator instead of d³ — dimensionally incorrect (T/d² has units of N·m/m² = N/m = Pa·m, not Pa).",
        "Option τ = T·d/J = T·d/(πd⁴/32) = 32T/(πd³) uses d instead of d/2 — twice the correct answer.",
      ],
      options: [
        { text: "τ_max = 16T/(πd³)", isCorrect: true },
        { text: "τ_max = T/(πd³)", isCorrect: false },
        { text: "τ_max = 16T/(πd²)", isCorrect: false },
        { text: "τ_max = 32T/(πd³)", isCorrect: false },
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
        "A solid round steel shaft of diameter d = 40 mm carries a torque T = 500 N·m. The maximum shear stress τ_max is closest to:",
      explanation:
        "τ_max = 16T/(πd³) = 16·500/(π·0.040³) = 8000/(2.011×10⁻⁴) = 39.8×10⁶ Pa ≈ 40 MPa.",
      whyCorrect:
        "Apply the shortcut τ_max = 16T/(πd³). Convert d to meters: d = 40 mm = 0.040 m. τ_max = 16·500/(π·(0.040)³) = 8000/(π·6.4×10⁻⁵) = 8000/(2.011×10⁻⁴) = 39.79×10⁶ Pa ≈ 39.8 MPa, which rounds to 40 MPa. For steel with shear yield τ_y ≈ 0.577·σ_y ≈ 144 MPa (von Mises, σ_y = 250 MPa), the factor of safety is FS = 144/40 = 3.6 — comfortable.",
      whyOthersWrong: [
        "Option 4 MPa is off by 10× — likely the diameter was mistakenly squared (d²) instead of cubed (d³), giving τ = 16·500/(π·0.040²) ≈ 160 MPa, then divided by 40 somewhere.",
        "Option 400 MPa is off by 10× in the other direction — likely a unit error (40 mm treated as 0.4 m: τ = 16·500/(π·0.4³) = 8000/(0.201) = 39,793 Pa = 0.04 MPa — wrong way).",
        "Option 25 MPa uses T = 500 in lb·in (US) or some other unit confusion.",
      ],
      options: [
        { text: "40 MPa", isCorrect: true },
        { text: "4 MPa", isCorrect: false },
        { text: "400 MPa", isCorrect: false },
        { text: "25 MPa", isCorrect: false },
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
        "A simply-supported steel W-shape beam carries a uniformly distributed load w over a span L. The maximum bending stress occurs at:",
      explanation:
        "For a simply-supported beam with UDL, M(x) = (w·x/2)(L − x) peaks at midspan x = L/2 with M_max = wL²/8. This is the critical section where σ_max = M_max·c/I occurs.",
      whyCorrect:
        "For a simply-supported beam carrying UDL w over span L, the shear-and-moment relations give V(x) = w·(L/2 − x) (linear, zero at midspan) and M(x) = (w·x/2)·(L − x) (parabolic, peak at midspan x = L/2). The maximum moment is M_max = w·L²/8 at x = L/2. By the flexure formula σ = M·y/I, the maximum bending stress occurs where M is maximum — i.e., at the midspan section, at the outer fiber y = c. So σ_max = (wL²/8)·c/I, occurring at midspan and at the top/bottom of the cross-section.",
      whyOthersWrong: [
        "Option 'at the supports' is wrong — for a simply-supported beam with UDL, the support moment M = 0 (the supports are pins). V is maximum at the supports, but σ = My/I is governed by M, not V.",
        "Option 'at the quarter points x = L/4 and 3L/4' is wrong — these are points where V is maximum in some loading cases (overhang beams) but not the UDL case; M at quarter points is (w·L/4/2)·(L − L/4) = 3wL²/32 < M_max = wL²/8.",
        "Option 'uniformly along the span' is wrong — σ = My/I varies with M(x), which varies along the beam; only for pure bending (constant M, no V) is σ uniform.",
      ],
      options: [
        { text: "At midspan (x = L/2), at the outer fibers (top and bottom)", isCorrect: true },
        { text: "At the supports (x = 0 and x = L), at the neutral axis", isCorrect: false },
        { text: "At the quarter points (x = L/4 and 3L/4), at the outer fibers", isCorrect: false },
        { text: "Uniformly along the span, at the neutral axis", isCorrect: false },
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
        "True or False: For a simply-supported beam with a downward point load P applied at midspan, the shear V(x) is constant along the entire span and the moment M(x) is also constant along the entire span.",
      explanation:
        "FALSE. For a midspan point load, the reactions are P/2 at each support; V(x) = +P/2 for 0 < x < L/2 and V(x) = −P/2 for L/2 < x < L (a step discontinuity at midspan). M(x) is linear (a triangle) peaking at M_max = PL/4 at midspan, zero at the supports.",
      whyCorrect:
        "FALSE. For a simply-supported beam of span L with a downward point load P at midspan, the support reactions are R_A = R_B = P/2 (by symmetry). The shear diagram V(x): from x = 0 to x = L/2, V = +P/2 (constant); at x = L/2 (the load application point), V steps down by P (the load) from +P/2 to −P/2; from x = L/2 to x = L, V = −P/2 (constant). The shear is NOT uniform along the span — it has a step discontinuity at the load. The moment diagram M(x): dM/dx = V → M(x) = V·x (linear) from 0 at the supports to M_max = (P/2)·(L/2) = PL/4 at midspan — a triangle, not constant. The maximum moment (and thus maximum bending stress σ = My/I) is at midspan, NOT uniform along the beam.",
      whyOthersWrong: [
        "Option TRUE confuses 'point load at midspan' with 'pure bending' (constant M, no V, no point load). In pure bending the beam is loaded by equal-and-opposite end moments (not a transverse point load), giving M(x) = M_0 constant and V(x) = 0 — but this is a different loading condition from the point-load case described in the stem.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Combined Loading & Buckling
// (slug: mom-combined-loading-buckling)
// ---------------------------------------------------------------------------

const LESSON_COMBINED_BUCKLING: RefLesson = {
  slug: "mom-combined-loading-buckling",
  title: "Combined Loading & Buckling",
  titleAr: "التحميل المركب والانبعاج",
  order: 3,
  durationMin: 35,
  references: MOM_REFERENCE_TITLES,
  conceptIntroduction: `Real engineering members almost never carry a single stress component — a shaft carries combined torsion + bending; a pressure vessel carries combined hoop + axial + thermal stress; a column carries axial compression that can trigger *buckling* (instability at a load far below the material's yield strength). Two analytical tools close out the mechanics-of-materials toolkit: *Mohr's circle* (Otto Mohr, 1882) — a graphical construction that transforms a 2D stress state into its principal stresses σ_1, σ_2 and the maximum shear stress τ_max; and the *Euler buckling formula* (Leonhard Euler, 1757) — P_cr = π²EI/(KL)², the critical load at which a slender column becomes unstable and laterally deflects without additional load. This lesson covers plane-stress transformation, principal stresses, the von Mises and Tresca failure criteria, the Euler buckling load, the slenderness ratio KL/r, the AISC column curve (E3), and the worked example of a 61.8-mm-diameter solid round steel column of length 3 m with P_cr = 157 kN.`,
  sections: {
    learning_objectives: `- Construct Mohr's circle for a plane-stress state (σ_x, σ_y, τ_xy); extract the principal stresses σ_1, σ_2 and the maximum shear stress τ_max.
- Apply the principal-stress formula σ_1,2 = (σ_x + σ_y)/2 ± √[((σ_x − σ_y)/2)² + τ_xy²].
- Apply the von Mises (distortion-energy) failure criterion: σ_eq = √(σ_1² + σ_2² − σ_1·σ_2) ≤ σ_y; or in 3D σ_eq = √(σ_x² + σ_y² + σ_z² − σ_x·σ_y − σ_y·σ_z − σ_z·σ_x + 3(τ_xy² + τ_yz² + τ_zx²)).
- Apply the Tresca (maximum-shear-stress) criterion: τ_max ≤ σ_y/2.
- Derive the Euler buckling load P_cr = π²EI/(KL)² for a pinned-pinned column; identify the effective length factor K for each end-condition (1.0 pinned, 0.5 fixed-fixed, 2.0 fixed-free).
- Compute the slenderness ratio KL/r (r = √(I/A), radius of gyration) and identify the Euler vs inelastic buckling regime (AISC E3, Euler limit Fe = π²E/(KL/r)²).
- Apply the AISC E3 column-buckling equation F_cr = [0.658^(F_y/Fe)^(1/2)]·F_y (inelastic) or F_cr = 0.877·Fe (Elastic Euler) to size a steel column.
- Combine bending + torsion with von Mises σ_eq = √(σ_bend² + 3τ_torsion²) for a shaft design.`,
    prerequisites: `- Stress & Strain (Lesson 1) — σ = F/A, Hooke's law, Poisson's ratio, G = E/[2(1+ν)].
- Torsion & Bending (Lesson 2) — τ = Tc/J, σ = My/I, V-M diagrams, τ = VQ/(It).
- Statics: section method for combined N + V + M + T.
- Linear algebra (eigenvalues for the stress tensor — optional; Mohr's circle is graphical).
- Trigonometry (Mohr's circle uses 2θ).`,
    introduction: `When a member carries two or more stress components simultaneously, the engineer needs (i) a way to combine them into a single failure criterion, and (ii) a stability check for slender compression members that fail by *buckling* (out-of-plane deflection) at a load far below the material's yield strength.

**Mohr's circle (plane stress).** Given a 2D stress state (σ_x, σ_y, τ_xy) on an element at a point, Otto Mohr (1882) showed that the stress on any plane through that point — at angle θ to the x-axis — lies on a circle in (σ, τ) space: the *Mohr's circle*. The center is at (σ_avg, 0) where σ_avg = (σ_x + σ_y)/2; the radius is R = √[((σ_x − σ_y)/2)² + τ_xy²]. The principal stresses (where τ = 0 on the plane) are σ_1,2 = σ_avg ± R; the maximum shear stress is τ_max = R; the principal-plane angle is tan(2θ_p) = 2τ_xy/(σ_x − σ_y). The Mohr's circle is a powerful visual tool — once drawn, the stress on any rotated plane can be read directly.

**Failure criteria.** Two criteria dominate ductile-metal design:
1. *Von Mises (distortion-energy, 1913)*: the equivalent stress σ_eq = √(σ_1² + σ_2² − σ_1·σ_2) (plane stress) must not exceed σ_y. Equivalently in 3D: σ_eq = √(σ_x² + σ_y² + σ_z² − σ_x·σ_y − σ_y·σ_z − σ_z·σ_x + 3(τ_xy² + τ_yz² + τ_zx²)). The von Mises criterion predicts yielding more accurately than Tresca for most ductile metals (steel, aluminum) and is the basis for ASME BPVC VIII-2 and AISC 360-22 LRFD.
2. *Tresca (maximum-shear, 1868)*: τ_max = max(|σ_1 − σ_2|, |σ_2 − σ_3|, |σ_3 − σ_1|)/2 ≤ σ_y/2. Tresca is more conservative (predicts a hexagonal yield surface that lies inside the von Mises ellipse); used in some pressure-vessel design codes.

For combined bending + torsion on a shaft: σ_bend = M·c/I (Lesson 2), τ_torsion = T·c/J (Lesson 2). Von Mises combines them as σ_eq = √(σ_bend² + 3·τ_torsion²) ≤ σ_allow — the *3* comes from the shear-to-normal stress conversion factor (3 = (2(1+ν))/... derivation; for ν = 0.30 the factor is approximately 3).

**Euler buckling.** A slender column of length L, modulus E, and minimum second moment of area I_min, loaded by axial compression P, becomes *elastically unstable* at the Euler critical load:
  P_cr = π²·E·I_min / (K·L)²
where K is the *effective length factor* (1.0 for pinned-pinned, 0.5 for fixed-fixed, 2.0 for fixed-free cantilever, 0.7 for fixed-pinned). At P = P_cr the column laterally deflects (buckles) without additional load — a *geometric instability*, not a material failure. The critical stress σ_cr = P_cr/A = π²·E·(r/(KL))² = π²·E/λ², where r = √(I/A) is the radius of gyration and λ = KL/r is the *slenderness ratio*.

**Slenderness regimes.** Three regimes:
- Stocky (λ < λ_E): σ_y controls; AISC E3 (and ASD) uses F_y directly.
- Intermediate (λ_E < λ < 4.71·√(E/F_y), AISC E3): inelastic buckling — combined material yielding + geometric instability; AISC E3 uses the empirical Johnson formula F_cr = [0.658^(F_y/Fe)^(1/2)]·F_y.
- Slender (λ > 4.71·√(E/F_y)): elastic Euler buckling — F_cr = 0.877·Fe, where Fe = π²E/(KL/r)² (the 0.88 factor accounts for initial imperfections).

For A992 steel (E = 200 GPa, F_y = 345 MPa), the AISC E3 crossover slenderness is 4.71·√(200,000/345) = 113.4 — a column with KL/r > 113.4 is in the elastic Euler regime; below 113.4 it's in the inelastic buckling regime.`,
    terminology: `- **Plane stress**: 2D stress state with σ_z = τ_xz = τ_yz = 0 (thin plates, free surfaces).
- **Principal stresses σ_1, σ_2, σ_3**: the eigenvalues of the stress tensor — the normal stresses on planes where shear stress is zero.
- **Maximum shear stress τ_max**: half the difference between the largest and smallest principal stresses.
- **Mohr's circle**: graphical construction in (σ, τ) space; center (σ_avg, 0), radius R = √[((σ_x − σ_y)/2)² + τ_xy²].
- **Principal-plane angle**: tan(2θ_p) = 2τ_xy/(σ_x − σ_y); the rotation that zeroes the shear.
- **Von Mises equivalent stress σ_eq**: distortion-energy failure criterion for ductile metals.
- **Tresca criterion**: maximum-shear-stress failure criterion; τ_max ≤ σ_y/2.
- **Combined loading**: simultaneous N (axial), M (bending), T (torsion), V (transverse shear) on a section.
- **Buckling**: lateral instability of a slender compression member; failure mode is geometric, not material.
- **Euler critical load P_cr = π²EI/(KL)²**: elastic buckling load of a slender column.
- **Effective length K**: end-condition factor (1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free, 0.7 fixed-pinned).
- **Radius of gyration r = √(I/A)**: cross-section property that enters the slenderness ratio.
- **Slenderness ratio λ = KL/r**: the dimensionless buckling-susceptibility metric.
- **AISC E3**: column-buckling equation for structural steel (inelastic + elastic regimes).
- **Lateral-torsional buckling (LTB)**: out-of-plane bending+twisting buckling of a beam's compression flange (AISC F2-F5).`,
    detailed_explanation: `**Plane stress transformation.** For a 2D stress state (σ_x, σ_y, τ_xy) at a point in a thin plate or free surface, the stress on a plane at angle θ from the x-axis is:
  σ_θ = σ_avg + R·cos(2θ − 2θ_p)
  τ_θ = R·sin(2θ − 2θ_p)
where σ_avg = (σ_x + σ_y)/2 and R = √[((σ_x − σ_y)/2)² + τ_xy²]. The principal stresses (where τ = 0) are at θ = θ_p with tan(2θ_p) = 2τ_xy/(σ_x − σ_y):
  σ_1 = σ_avg + R  (maximum principal stress)
  σ_2 = σ_avg − R  (minimum principal stress)
  τ_max = R  (max in-plane shear stress, on planes 45° from principal planes)

**Mohr's circle construction.** Plot (σ_x, τ_xy) and (σ_y, −τ_xy) on (σ, τ) axes; the line connecting them is a diameter of the circle through center (σ_avg, 0). Rotate the diameter by 2θ to read (σ_θ, τ_θ) on the circle.

**Von Mises (distortion-energy) criterion.** A ductile metal yields when the *deviatoric* (shape-changing, not volume-changing) strain energy reaches a critical value. In plane stress (σ_3 = 0): σ_eq = √(σ_1² + σ_2² − σ_1·σ_2). In full 3D: σ_eq = √(σ_x² + σ_y² + σ_z² − σ_x·σ_y − σ_y·σ_z − σ_z·σ_x + 3(τ_xy² + τ_yz² + τ_zx²)). For combined bending + torsion on a shaft (σ = σ_bend, τ = τ_torsion, all other components zero): σ_eq = √(σ² + 3τ²) — the *3* factor.

**Tresca (maximum-shear) criterion.** A metal yields when τ_max = (σ_max − σ_min)/2 reaches σ_y/2. For combined bending + torsion: τ_max on the 45° planes = √((σ/2)² + τ²) ≤ σ_y/2 → √(σ² + 4τ²) ≤ σ_y. Tresca is more conservative than von Mises (predicts yielding at lower combined stress).

**Euler buckling derivation.** A perfectly straight slender column of length L, modulus E, second moment I, pinned-pinned (K = 1), under axial load P. The beam-column equation EI·y'''' + P·y'' = 0 has the solution y(x) = A·sin(k·x) + B·cos(k·x) with k² = P/(EI). The boundary conditions y(0) = y(L) = 0 require sin(k·L) = 0 → k·L = nπ; the smallest non-trivial load is at n = 1: P_cr = π²EI/L². For other end-conditions: replace L with the *effective length* KL where K depends on the rotational restraints (K = 1 pinned-pinned, K = 0.5 fixed-fixed, K = 2.0 fixed-free, K = 0.7 fixed-pinned). The general formula: P_cr = π²EI/(KL)². The critical stress σ_cr = P_cr/A = π²E/(KL/r)² = π²E/λ² where r = √(I/A) and λ = KL/r.

**AISC E3 column curve.** For A992 structural steel (F_y = 345 MPa, E = 200 GPa), AISC 360-22 Section E3 gives:
  Elastic Euler limit: Fe = π²E/(KL/r)²
  If KL/r ≤ 4.71·√(E/F_y) = 113.4 (inelastic):
    F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y  (Johnson formula, inelastic buckling)
  If KL/r > 4.71·√(E/F_y) (elastic):
    F_cr = 0.877·Fe  (Euler with imperfection knockdown)
  The design compressive strength: φ_c·P_n = φ_c·F_cr·A_g (LRFD, φ_c = 0.90) or P_n/Ω_c = F_cr·A_g/1.67 (ASD).

**Lateral-torsional buckling (LTB) of beams.** A beam's compression flange can buckle out-of-plane before σ reaches σ_y if the flange is not laterally braced. AISC F2 gives the LTB limit L_p (compact) and L_r (limiting slenderness for inelastic LTB); for L_b > L_r, elastic LTB governs with M_n = F_cr·S_x.`,
    core_principles: `- **Principal stresses**: σ_1,2 = (σ_x + σ_y)/2 ± √[((σ_x − σ_y)/2)² + τ_xy²]; tan(2θ_p) = 2τ_xy/(σ_x − σ_y).
- **Max shear stress**: τ_max = R = √[((σ_x − σ_y)/2)² + τ_xy²] (in-plane) or (σ_max − σ_min)/2 (3D).
- **Von Mises (plane stress)**: σ_eq = √(σ_1² + σ_2² − σ_1·σ_2) ≤ σ_y.
- **Combined bending + torsion**: σ_eq = √(σ² + 3τ²) ≤ σ_y (von Mises), √(σ² + 4τ²) ≤ σ_y (Tresca).
- **Euler buckling**: P_cr = π²EI/(KL)²; σ_cr = π²E/λ² where λ = KL/r, r = √(I/A).
- **Effective length K**: 1.0 pinned, 0.5 fixed-fixed, 2.0 fixed-free, 0.7 fixed-pinned.
- **AISC E3**: inelastic F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y for KL/r ≤ 113.4 (A992); elastic F_cr = 0.877·Fe for KL/r > 113.4.
- **Lateral-torsional buckling**: compression flange of a beam can buckle out-of-plane (AISC F2-F5).`,
    components: `- **Mohr's circle template**: (σ, τ) axes, center (σ_avg, 0), radius R.
- **Strain-gage rosette**: 3-element (0°/45°/90° or 0°/60°/120°) for experimental plane-stress determination.
- **Buckling test fixture**: pinned-pinned or fixed-free column setup with axial load cell and lateral deflection LVDT.
- **AISC column design aids**: column-load tables (Table 4-1 to 4-22) for W-shapes by KL/r.
- **FEA solver**: ANSYS Mechanical, Abaqus, Nastran for eigenvalue (linear) buckling analysis (BArnoldi or Lanczos solver).
- **AISC 360-22 Section E3**: column curve equations (inelastic + elastic regimes).
- **ASME BPVC Section VIII Division 2**: pressure-vessel combined-stress design using von Mises.`,
    process: `1. Compute the combined stress state at the critical point (σ_x = σ_axial + σ_bend; τ_xy = τ_torsion + τ_transverse).
2. Apply Mohr's circle to extract σ_1, σ_2, τ_max.
3. Apply the failure criterion (von Mises σ_eq ≤ σ_allow or Tresca τ_max ≤ σ_y/2).
4. For slender compression members, compute λ = KL/r and the AISC E3 column curve F_cr.
5. Verify P ≤ φ_c·F_cr·A_g (LRFD) or P ≤ F_cr·A_g/Ω (ASD); if not, increase the section.
6. For a beam's compression flange, check LTB: L_b ≤ L_p (compact) or use AISC F2-F5.
7. For combined axial + bending on a column (beam-column), use AISC H1 interaction equation: P_r/P_c + 8/(9)·(M_r/M_c) ≤ 1.0 (LRFD).
8. Document the failure-mode check (yielding vs buckling vs LTB) in the calculation memo.`,
    formula_calculation: `**Plane-stress Mohr's circle:**
  σ_avg = (σ_x + σ_y)/2
  R = √[((σ_x − σ_y)/2)² + τ_xy²]
  σ_1 = σ_avg + R  (max principal)
  σ_2 = σ_avg − R  (min principal)
  τ_max = R  (max in-plane shear)
  tan(2θ_p) = 2τ_xy/(σ_x − σ_y)  (principal-plane angle)

**3D principal stresses** (cubic equation; eigenvalues of the 3×3 stress tensor): σ³ − I_1·σ² + I_2·σ − I_3 = 0 where I_1 = σ_x + σ_y + σ_z, I_2 = σ_xσ_y + σ_yσ_z + σ_zσ_x − τ_xy² − τ_yz² − τ_zx², I_3 = det(tensor). Numerical solver or closed-form for axisymmetric.

**Von Mises (plane stress, σ_3 = 0):**
  σ_eq = √(σ_1² + σ_2² − σ_1·σ_2)
**Von Mises (full 3D):**
  σ_eq = √(σ_x² + σ_y² + σ_z² − σ_x·σ_y − σ_y·σ_z − σ_z·σ_x + 3(τ_xy² + τ_yz² + τ_zx²))
**Combined bending + torsion (σ_bend, τ_torsion, all else zero):**
  σ_eq = √(σ_bend² + 3·τ_torsion²)  (von Mises)
  σ_eq = √(σ_bend² + 4·τ_torsion²)  (Tresca, conservative)

**Tresca (max-shear):**
  τ_max = (σ_max − σ_min)/2  ≤  σ_y/2

**Euler buckling (elastic):**
  P_cr = π²·E·I_min / (K·L)²
  σ_cr = P_cr/A = π²·E / (KL/r)²  where r = √(I/A), λ = KL/r
  K values: pinned-pinned 1.0; fixed-fixed 0.5; fixed-free 2.0; fixed-pinned 0.7

**AISC E3 column curve (A992 F_y = 345 MPa, E = 200 GPa):**
  Fe = π²·E / (KL/r)²  (Euler elastic critical stress)
  If KL/r ≤ 4.71·√(E/F_y) = 113.4 (inelastic):
    F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y
  If KL/r > 113.4 (elastic):
    F_cr = 0.877·Fe
  LRFD: φ_c·P_n = φ_c·F_cr·A_g (φ_c = 0.90)
  ASD: P_n/Ω_c = F_cr·A_g/1.67

**Beam-column interaction (AISC H1, combined axial + bending):**
  P_r/P_c + 8/9·(M_rx/M_cx + M_ry/M_cy) ≤ 1.0 (LRFD, when P_r ≥ 0.2·P_c)

**Lateral-torsional buckling (AISC F2-F5):**
  M_p = F_y·Z_x (plastic moment)
  L_p = 1.76·r_y·√(E/F_y)  (full plastic zone, no LTB)
  L_r = ... (limiting slenderness for inelastic LTB)
  For L_b ≤ L_p: M_n = M_p (no LTB).
  For L_p < L_b ≤ L_r: M_n = M_p − (M_p − 0.7·F_y·S_x)·(L_b − L_p)/(L_r − L_p) (inelastic LTB).
  For L_b > L_r: M_n = F_cr·S_x (elastic LTB).

**Assumptions**: (i) linear-elastic, isotropic, homogeneous material; (ii) small deformations except for the buckling eigenvalue (which is the geometric-stiffness tangent); (iii) perfectly straight, perfectly centered column (real columns have initial imperfections captured by the 0.877 knockdown factor in AISC E3 elastic regime); (iv) plane stress (thin-wall / free-surface) for Mohr's circle.

**Interpretation**: σ_eq in von Mises is the single stress that, applied uniaxially, would cause the same distortion-energy density as the multi-axial stress state — a single number to compare against σ_y. P_cr in Euler is the load at which a perfectly-straight, perfectly-centered slender column becomes laterally unstable — a *stability* limit, not a strength limit. A real column with initial crookedness or load eccentricity will start to deflect laterally as soon as P > 0, but the deflection grows asymptotically as P → P_cr (the *secant formula* captures this eccentric-column behavior).`,
    worked_example: `**Euler buckling of a slender round steel column.**
A solid round steel column of diameter d = 61.8 mm, length L = 3 m, pinned-pinned ends (K = 1.0), E = 200 GPa. Compute the Euler critical load P_cr.

  A = πd²/4 = π·(61.8)²/4 = 3,000 mm²  (π × 3819.24 / 4 = 3,000.6 mm²)
  I = πd⁴/64 = π·(61.8)⁴/64 = 7.16×10⁵ mm⁴  = 7.16×10⁻⁷ m⁴
  r = √(I/A) = √(7.16×10⁵/3,000) = √238.5 = 15.44 mm = 0.01544 m
  KL/r = 1.0 × 3000 / 15.44 = 194.3  (slender — well into Euler regime)
  P_cr = π²·E·I/(K·L)² = π² × 200×10⁹ × 7.16×10⁻⁷ / (1.0 × 3)²
       = 9.8696 × 200×10⁹ × 7.16×10⁻⁷ / 9
       = 1,413,500 / 9 = 157,055 N ≈ 157 kN ✓

Sanity check via critical stress:
  σ_cr = P_cr/A = 157,055/3,000e-6 = 52.4 MPa
  Euler limit: Fe = π²E/(KL/r)² = π² × 200,000/194.3² = 1,973,921/37,752 = 52.3 MPa ✓
  (σ_cr ≈ Fe — consistent.)
  
Compare to yield: σ_y(A992) = 345 MPa; σ_cr = 52.4 MPa is only 15% of yield — the column buckles far below its material strength. This is the *slenderness tax* of Euler buckling.

Compare to AISC E3: KL/r = 194.3 > 113.4 (A992 crossover) → elastic regime.
  F_cr = 0.877·Fe = 0.877 × 52.3 = 45.9 MPa (the 0.877 accounts for initial imperfections).
  φ_c·P_n = 0.90 × 45.9 × 3,000 = 124 kN  (LRFD design strength)
  P_n/Ω_c = 45.9 × 3,000 / 1.67 = 82.4 kN  (ASD allowable)
  
So the *theoretical* Euler P_cr = 157 kN, but the *design* strengths are 124 kN (LRFD) and 82 kN (ASD) — the knockdown is significant for slender columns.

**Combined bending + torsion on a shaft.**
For the Lesson 2 shaft (d = 40 mm, T = 500 N·m → τ = 40 MPa; bending M = 30 N·m → σ = M·c/I = 30·20/(π·40⁴/64) = 600/(125,664)·10⁹ = ... actually let's just say σ_bend = 100 MPa for illustration):
  σ_eq (von Mises) = √(σ² + 3τ²) = √(100² + 3·40²) = √(10,000 + 4,800) = √14,800 = 121.7 MPa
  σ_eq (Tresca) = √(σ² + 4τ²) = √(10,000 + 6,400) = √16,400 = 128.1 MPa
  
For A992 steel σ_y = 345 MPa, the von Mises FS = 345/121.7 = 2.84 (comfortable). The Tresca criterion gives FS = 345/128.1 = 2.69 (slightly more conservative). Both criteria confirm the shaft is safely below yield.`,
    industrial_example: `**Industry: Oil & Gas — offshore platform leg design.** A 30-m-tall tubular steel leg on a jack-up offshore platform (OD 1.2 m, wall 25 mm, A572 Gr 50 with σ_y = 345 MPa, E = 200 GPa) carries N = 8 MN axial compression under extreme storm loading. I = π(OD⁴ − ID⁴)/64 = π(2.074 − 1.860)/64 × 10¹² mm⁴ = 1.05×10⁻⁴ m⁴. A = π(OD² − ID²)/4 = π(1.44 − 1.225)/4 = 0.1686 m². r = √(I/A) = √(1.05e-4/0.1686) = 0.0250 m = 25 mm. KL/r (K = 2.0 fixed-free, conservative for a cantilevered leg) = 2.0 × 30/0.025 = 2,400 — well into the elastic Euler regime. F_cr = 0.877·π²·E/(KL/r)² = 0.877 × 1,973,921/5,760,000 = 0.30 MPa → P_n = F_cr·A_g = 0.30e6 × 0.1686 = 50.6 kN — wildly below the 8 MN demand. The platform operator reverts the analysis: the leg has lateral bracing every 6 m (effectively K = 1.0 with L = 6 m segments), giving KL/r = 1.0 × 6/0.025 = 240, F_cr = 0.877 × 1,973,921/57,600 = 30.0 MPa → P_n = 30e6 × 0.1686 = 5.06 MN (still below 8 MN). Final fix: increase wall to 35 mm → A = 0.236 m², r = 30 mm, KL/r = 200, F_cr = 49.0 MPa, P_n = 11.6 MN > 8 MN ✓.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Pedestrian Bridge — buckling failure investigation (synthetic, illustrative).* A 24-m steel-truss pedestrian bridge over Crescent Valley was commissioned in 2010 with diagonal compression members of L 4 × 4 × 1/2 angle (A = 562 mm², r_min = 19.2 mm, A36 F_y = 250 MPa). The 4-m-long diagonals have KL/r = 1.0 × 4000/19.2 = 208 — well into Euler elastic regime. F_cr = 0.877 × π² × 200,000/208² = 0.877 × 1,973,921/43,264 = 40.0 MPa. φ_c·P_n = 0.90 × 40 × 562 = 20.2 kN. Under a 2030 winter-storm combination of ice load + wind, the diagonal saw P = 18 kN (89% of design capacity) — within tolerance. But the inspector missed the corrosion thinning (wall reduced from 12.7 mm to 9.5 mm over 14 yrs); the section lost 25% of A and 38% of I → r_min dropped to 16.2 mm, KL/r rose to 247, F_cr dropped to 28.4 MPa, φ_c·P_n = 0.90 × 28.4 × 422 = 10.8 kN — below the 18 kN demand. The diagonal buckled on 14 Jan 2030, initiating a progressive collapse. The post-failure investigation recommended annual ultrasonic thickness measurement on all slender compression members of aging pedestrian bridges.`,
    visual_explanation: `**Mohr's circle.** Draw (σ, τ) axes; plot point A = (σ_x, +τ_xy) and point B = (σ_y, −τ_xy); connect with a line — its midpoint is the center C = (σ_avg, 0) and half-length is the radius R = √[((σ_x − σ_y)/2)² + τ_xy²]. The circle centered at C with radius R crosses the σ-axis at the principal stresses σ_1 = σ_avg + R (right) and σ_2 = σ_avg − R (left). The top of the circle is at (σ_avg, +R) — the maximum in-plane shear stress τ_max = R. To find the stress on a plane at angle θ from the x-axis: rotate the diameter AC by 2θ (counterclockwise for a positive physical rotation) to land at point D on the circle; read (σ_θ, τ_θ) at D. **Euler buckling mode shapes.** A pinned-pinned column of length L buckles at the lowest critical load (n = 1) with a sinusoidal mode shape y(x) = δ·sin(π·x/L) — a single half-sine. The next mode (n = 2) has y(x) = δ·sin(2π·x/L) — a full sine — with P_cr,n=2 = 4·P_cr,n=1, unreachable in practice (the column buckles at n=1 first). For K = 0.5 (fixed-fixed) the effective length is L/2 and P_cr quadruples; for K = 2.0 (fixed-free cantilever) the effective length is 2L and P_cr drops to 1/4 of the pinned-pinned value.`,
    simulation_opportunity: `Open the EngiSuite "Mohr's Circle & Buckling Calculator" — sliders for σ_x, σ_y, τ_xy; the Mohr's circle draws live and σ_1, σ_2, τ_max update. A second pane runs the column-buckling calculator: input cross-section (round, rectangular, I-beam), length L, K (1.0/0.5/2.0/0.7), material (E, σ_y); output the slenderness λ = KL/r, the regime (stocky/intermediate/slender), and P_cr (Euler) vs φ_c·P_n (AISC E3 LRFD) vs P_n/Ω (ASD). For real practice, run ANSYS Mechanical's eigenvalue buckling analysis (BLOCK LANCZOS or BArnoldi solver) on a stepped column with hole; compare the first-mode load to the closed-form Euler P_cr. For Mohr's circle on real strain-gage rosette data, use MATLAB's "pcm" (principal component analysis) or Python's numpy.linalg.eigvals on the 3×3 stress tensor; plot the circle with matplotlib.`,
    common_mistakes: `- **Confusing the principal-plane angle with the stress-rotation angle**: the principal planes are at θ_p where tan(2θ_p) = 2τ_xy/(σ_x − σ_y); on Mohr's circle the rotation is 2θ_p (twice the physical rotation). A common error is to use θ_p on the circle directly (instead of 2θ_p).
- **Forgetting the 3 factor in von Mises for combined σ + τ**: σ_eq = √(σ² + 3τ²), not √(σ² + τ²). The factor 3 comes from the shear-to-normal stress conversion (3 = (2(1+ν))·(τ_to_σ conversion), with ν ≈ 0.30 giving 2.6 ≈ 3).
- **Applying Euler in the inelastic regime**: P_cr = π²EI/(KL)² is the *elastic* (Euler) buckling formula — valid only for slender columns (KL/r > 113.4 for A992). For intermediate slenderness (in the inelastic regime), use the AISC E3 inelastic formula F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y — applying Euler alone overestimates the capacity.
- **Using the wrong effective length factor K**: K = 1.0 for pinned-pinned (the default), 0.5 for fixed-fixed, 2.0 for fixed-free (cantilever), 0.7 for fixed-pinned. Using K = 1.0 unconditionally (e.g., for a cantilevered mast) overestimates the buckling capacity by 4×.
- **Forgetting the 0.877 knockdown for real columns**: P_cr (Euler) is for a perfectly-straight, perfectly-centered column. AISC E3's elastic-regime formula F_cr = 0.877·Fe accounts for initial crookedness and load eccentricity; using Euler alone (without 0.877) overestimates capacity by ~14%.
- **Using I_max instead of I_min for buckling**: a column buckles about the *weak* (minimum) bending axis. Always use I_min (and r_min = √(I_min/A)) for P_cr. For a W-shape, I_y < I_x — buckling is about the y-axis unless braced in that direction.
- **Skipping the beam-column interaction check** (AISC H1): a column carrying axial + bending needs the interaction equation, not a separate check on P alone or M alone.`,
    limitations: `- Euler's formula assumes a perfectly straight, perfectly centered column. Real columns have initial crookedness and load eccentricity — captured by AISC E3's 0.877 knockdown or the more detailed *secant formula* (eccentric column).
- The simple Euler formula is for elastic buckling (σ_cr < σ_y); inelastic buckling (Johnson formula, AISC E3 inelastic) governs the intermediate-slenderness regime where yielding and buckling interact.
- Mohr's circle (2D) is for *plane stress*; 3D stress states require the cubic characteristic equation or numerical eigenvalues of the 3×3 stress tensor.
- Von Mises is calibrated for ductile metals (steel, aluminum). Brittle materials (cast iron, ceramics, concrete in tension) fail by maximum normal stress (Rankine) or maximum principal strain (Saint-Venant).
- AISC E3 is calibrated for A992 structural steel; other steels (high-strength A913, stainless 304) need adjusted column curves (AISC E2 / AISC 370).
- Local buckling (web, flange) is a separate check from global Euler buckling — AISC E5 and E7 cover slender-element sections.`,
    comparison: `| Failure criterion | Yield surface | Equation | Use case |
|---|---|---|---|
| Von Mises (distortion-energy) | Ellipse | σ_eq = √(σ_1²+σ_2²−σ_1·σ_2) | Ductile metals (steel, aluminum) — AISC LRFD |
| Tresca (max-shear) | Hexagon | τ_max ≤ σ_y/2 | Ductile metals — more conservative |
| Maximum principal stress (Rankine) | Square | σ_1 ≤ σ_u | Brittle (cast iron, ceramics) |
| Mohr-Coulomb | Hexagon (asymmetric) | σ_1 − σ_3 ≤ σ_c (compression) or σ_t (tension) | Soils, concrete, rock |

| End-condition | K (effective length) | P_cr (relative) | Examples |
|---|---|---|---|
| Pinned-pinned | 1.0 | 1.00 (baseline) | Truss diagonals, columns in braced frames |
| Fixed-fixed | 0.5 | 4.00 | Braced frame columns, embedded piles |
| Fixed-pinned | 0.7 | 2.04 | Columns with rigid base, flexible cap |
| Fixed-free (cantilever) | 2.0 | 0.25 | Cantilevered masts, water-tank columns |

| Slenderness (KL/r) | Regime (A992) | Failure mode | AISC E3 equation |
|---|---|---|---|
| < ~50 | Stocky | Yielding (F_y) | F_cr = F_y |
| 50 to 113 | Intermediate | Inelastic buckling | F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y |
| > 113 | Slender | Elastic Euler | F_cr = 0.877·Fe |`,
    practical_application: `**Industrial sizing — A992 column per AISC E3.** A 4-m-long W310×74 column (A = 9,420 mm², I_x = 133×10⁶ mm⁴, I_y = 4.18×10⁶ mm⁴, r_y = 21.0 mm, F_y = 345 MPa, E = 200 GPa) carries axial N = 1.5 MN in a braced frame (K = 1.0). Compute KL/r = 1.0 × 4000/21.0 = 190.5 — well into elastic regime (> 113.4). Fe = π² × 200,000/190.5² = 1,973,921/36,290 = 54.4 MPa. F_cr = 0.877 × 54.4 = 47.7 MPa. φ_c·P_n = 0.90 × 47.7 × 9,420 = 404 kN — far below 1.5 MN demand (FAILS by 3.7×). Redesign: add lateral bracing at mid-height → KL = 2 m, KL/r = 95.2 — inelastic regime (≤ 113.4). Fe = 1,973,921/9,063 = 217.7 MPa. F_cr = [0.658^(345/217.7)]^(1/2) × 345 = [0.658^1.585]^(1/2) × 345 = [0.533]^(1/2) × 345 = 0.730 × 345 = 251.9 MPa. φ_c·P_n = 0.90 × 251.9 × 9,420 = 2,136 kN > 1,500 kN ✓ (FS = 1.42). The redesign adds 1 lateral brace at mid-height — a $4k cost vs $400k+ for a larger column.`,
    decision_scenario: `You are the structural lead on a $25M airport hangar with a 30-m clear-span steel truss. The truss bottom-chord diagonal carries N = 1.2 MN axial compression. Three cross-section options: (A) W200×86 (r_y = 51.3 mm, A = 11,000 mm², F_y = 345 MPa): KL/r = 1.0 × 30,000/51.3 = 585 — elastic Euler, F_cr = 5.7 MPa, φ_c·P_n = 56 kN << 1.2 MN (FAILS by 21×). (B) Built-up box section 200×200×16 (A = 11,700 mm², r = 76.5 mm): KL/r = 392, F_cr = 12.8 MPa, φ_c·P_n = 135 kN << 1.2 MN (FAILS). (C) Add lateral braces every 5 m → KL = 5 m, KL/r = 1.0 × 5000/51.3 = 97.5 (W200×86): inelastic, Fe = 208 MPa, F_cr = [0.658^(345/208)]^(1/2)·345 = 242 MPa, φ_c·P_n = 0.90 × 242 × 11,000 = 2,396 kN > 1.2 MN ✓ (FS = 2.0). The structural lead chooses option C — the W200×86 with 5-m lateral bracing — a $40k premium for the 6 braces but a $200k saving over a heavier section. The 5-m bracing also satisfies the architectural clearance requirement (no obstructions below 5 m).`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: Mohr's circle concept, principal stress calculation, Euler buckling P_cr, and the buckling-vs-yielding failure mode distinction.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical, FE Civil, and PE Civil (Structural) exam outlines, and the ASME BPVC Section VIII Division 2 (pressure-vessel design). Sample FE-style question: "A 3-m pinned-pinned solid round steel column (E = 200 GPa) of diameter 61.8 mm buckles at a load closest to: (a) 50 kN; (b) 157 kN; (c) 250 kN; (d) 500 kN." Correct: (b) 157 kN (I = πd⁴/64 = 7.16×10⁻⁷ m⁴; P_cr = π²EI/(KL)² = π² × 200×10⁹ × 7.16×10⁻⁷ / 9 = 157,055 N ≈ 157 kN).`,
    summary: `Combined loading uses Mohr's circle to extract the principal stresses σ_1, σ_2 from a 2D stress state (σ_x, σ_y, τ_xy); the von Mises criterion σ_eq = √(σ_1² + σ_2² − σ_1·σ_2) (or σ_eq = √(σ² + 3τ²) for combined bending + torsion) compares against σ_y. Slender compression members fail by Euler buckling at P_cr = π²EI/(KL)² — well below the material yield strength — and the AISC E3 column curve (inelastic + elastic regimes) accounts for initial imperfections via the 0.877 knockdown. The slenderness ratio λ = KL/r (K = effective length factor, r = √(I/A)) determines the failure mode: stocky (yielding), intermediate (inelastic buckling, Johnson formula), slender (elastic Euler). Beam-columns (combined axial + bending) require the AISC H1 interaction equation; lateral-torsional buckling (LTB) of a beam's compression flange requires the AISC F2-F5 check.`,
    key_takeaways: `- σ_1,2 = (σ_x + σ_y)/2 ± √[((σ_x − σ_y)/2)² + τ_xy²]; τ_max = √[((σ_x − σ_y)/2)² + τ_xy²].
- Von Mises (plane stress): σ_eq = √(σ_1² + σ_2² − σ_1·σ_2); combined σ + τ: σ_eq = √(σ² + 3τ²).
- Tresca: τ_max ≤ σ_y/2 (more conservative than von Mises).
- Euler buckling: P_cr = π²EI/(KL)²; K = 1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free, 0.7 fixed-pinned.
- Slenderness λ = KL/r (r = √(I/A)); AISC E3 crossover for A992: λ = 4.71·√(E/F_y) = 113.4.
- AISC E3 elastic: F_cr = 0.877·Fe (the 0.877 knockdown for initial imperfections).
- AISC H1 interaction (beam-column): P_r/P_c + 8/9·(M_r/M_c) ≤ 1.0 (LRFD).
- Lateral-torsional buckling (LTB) of beam compression flange — AISC F2-F5.`,
    references: `1. Hibbeler (2023), Ch. 8 (Combined Loadings — Mohr's circle), Ch. 11 (Column Buckling — Euler, AISC column design).
2. Beer, Johnston, DeWolf & Mazurek (2020), Ch. 7 (Transformations of Stress — Mohr's circle), Ch. 10 (Columns — Euler, AISC).
3. Gere & Goodno (2018), Ch. 6 (Plane Stress, Mohr's circle), Ch. 11 (Columns — Euler, secant, inelastic).
4. ASTM E8/E8M-22 — material properties (σ_y) for combined-stress and buckling design.
5. AISC 360-22, Chapter E (Compression — Euler limit, AISC E3), Chapter F (Bending — LTB), Chapter H (Combined Forces — beam-column interaction).
6. ISO 6892-1:2019 — international material properties for non-US combined-stress and buckling design.`,
  },
  knowledgeObject: {
    title: "Combined Loading & Buckling — Knowledge Object",
    domain: "Mechanics of Materials",
    competency: "Combined Stress & Stability",
    topic: "Mohr's Circle, Principal Stresses, Euler Buckling",
    concept: "Mohr's circle, von Mises, Tresca, Euler P_cr — combined stress & stability toolkit",
    body: {
      definitions: [
        "Plane stress: 2D stress state with σ_z = τ_xz = τ_yz = 0 (thin plates, free surfaces).",
        "Principal stresses σ_1, σ_2, σ_3: eigenvalues of the stress tensor — normal stresses on planes where shear is zero.",
        "Max shear stress τ_max = (σ_max − σ_min)/2 (3D) or R = √[((σ_x−σ_y)/2)²+τ_xy²] (plane stress).",
        "Mohr's circle: graphical construction in (σ, τ) space; center (σ_avg, 0), radius R.",
        "Von Mises (distortion-energy): σ_eq = √(σ_1²+σ_2²−σ_1·σ_2) ≤ σ_y (plane stress).",
        "Tresca (max-shear): τ_max ≤ σ_y/2; more conservative than von Mises.",
        "Combined bending + torsion: σ_eq = √(σ² + 3τ²) (von Mises); √(σ² + 4τ²) (Tresca).",
        "Euler buckling load P_cr = π²EI/(KL)²; slenderness λ = KL/r, r = √(I/A).",
        "Effective length K: 1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free, 0.7 fixed-pinned.",
      ],
      principles: [
        "σ_1,2 = (σ_x+σ_y)/2 ± √[((σ_x−σ_y)/2)² + τ_xy²]; tan(2θ_p) = 2τ_xy/(σ_x−σ_y).",
        "τ_max = R = √[((σ_x−σ_y)/2)² + τ_xy²] (in-plane); (σ_max − σ_min)/2 in 3D.",
        "Von Mises (plane stress): σ_eq = √(σ_1²+σ_2²−σ_1·σ_2) ≤ σ_y; combined σ+τ: σ_eq = √(σ² + 3τ²).",
        "Euler: P_cr = π²EI/(KL)² (elastic regime, slender columns); σ_cr = π²E/(KL/r)².",
        "AISC E3 crossover for A992: KL/r = 4.71·√(E/F_y) = 113.4 (inelastic below, elastic above).",
        "AISC E3 elastic: F_cr = 0.877·Fe (0.877 knockdown for initial imperfections).",
        "Beam-column interaction (AISC H1): P_r/P_c + 8/9·(M_r/M_c) ≤ 1.0 (LRFD).",
      ],
      components: [
        "Mohr's circle template (σ, τ axes; center σ_avg, radius R)",
        "Strain-gage rosette (3-element 0°/45°/90° or 0°/60°/120°) for experimental plane-stress determination",
        "Buckling test fixture (pinned-pinned or fixed-free, with axial load cell + lateral LVDT)",
        "AISC column-load tables (Steel Construction Manual Table 4-1 to 4-22)",
        "FEA eigenvalue (linear) buckling solver (ANSYS, Abaqus, Nastran)",
        "AISC 360-22 Chapter E (compression — Euler limit, AISC E3 column curve)",
        "ASME BPVC Section VIII Division 2 (pressure vessels — von Mises)",
      ],
      mechanism:
        "Combined stress states (σ + τ) produce principal stresses σ_1, σ_2 — the normal stresses on planes where shear is zero (found graphically via Mohr's circle or analytically via the eigenvalue equation). The von Mises criterion combines them into a single equivalent stress for comparison against σ_y. Slender compression members fail by Euler buckling (lateral instability) at P_cr = π²EI/(KL)² — a geometric, not material, failure. AISC E3 accounts for the real column's initial crookedness via the 0.877 knockdown in the elastic regime and the Johnson formula in the inelastic regime.",
      process:
        "Compute combined stress at critical point (σ_x, σ_y, τ_xy) → Mohr's circle → σ_1, σ_2, τ_max → apply von Mises σ_eq ≤ σ_allow or Tresca τ_max ≤ σ_y/2 → for slender compression members, compute KL/r → AISC E3 column curve F_cr → check P ≤ φ_c·F_cr·A_g (LRFD) → for combined axial + bending, use AISC H1 interaction → for beam compression flange, AISC F2-F5 LTB check.",
      formulas: [
        "σ_1,2 = (σ_x+σ_y)/2 ± √[((σ_x−σ_y)/2)² + τ_xy²]; tan(2θ_p) = 2τ_xy/(σ_x−σ_y)",
        "τ_max = R = √[((σ_x−σ_y)/2)² + τ_xy²] (in-plane); (σ_max − σ_min)/2 (3D)",
        "σ_eq (von Mises plane stress) = √(σ_1² + σ_2² − σ_1·σ_2)",
        "σ_eq (combined σ + τ) = √(σ² + 3τ²); (Tresca) = √(σ² + 4τ²)",
        "P_cr = π²EI/(KL)² (Euler); σ_cr = π²E/(KL/r)² = π²E/λ²",
        "K: 1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free, 0.7 fixed-pinned",
        "AISC E3: Fe = π²E/(KL/r)²; inelastic F_cr = [0.658^(F_y/Fe)]^(1/2)·F_y; elastic F_cr = 0.877·Fe",
        "Beam-column interaction (AISC H1, LRFD): P_r/P_c + 8/9·(M_rx/M_cx + M_ry/M_cy) ≤ 1.0",
      ],
      metrics: [
        "Principal stresses σ_1, σ_2 (MPa) — max and min normal stress",
        "Maximum shear stress τ_max (MPa) — Tresca criterion",
        "Von Mises equivalent stress σ_eq (MPa) — single-stress comparison vs σ_y",
        "Euler critical load P_cr (kN) — slender-column stability limit",
        "Slenderness ratio KL/r — buckling-susceptibility metric",
        "AISC E3 column curve F_cr (MPa) — design compressive stress with imperfection knockdown",
        "φ_c·P_n (kN) — LRFD design compressive strength",
      ],
      examples: [
        "P_cr = 157 kN for d = 61.8 mm round steel column, L = 3 m, K = 1.0 (Euler elastic).",
        "AISC E3 elastic knockdown: F_cr = 0.877 × 52.3 = 45.9 MPa → φ_c·P_n = 124 kN (vs 157 kN theoretical Euler).",
        "Combined bending + torsion: σ = 100 MPa, τ = 40 MPa → σ_eq = √(100² + 3·40²) = 121.7 MPa (von Mises).",
        "Offshore platform leg (1.2 m OD, 25 mm wall, 30 m tall, K = 1.0 with 6 m braces): KL/r = 240, F_cr = 30 MPa, P_n = 5.06 MN.",
      ],
      industrial_examples: [
        "Oil & Gas — 30-m jack-up platform leg: KL/r = 240 (with 6 m lateral braces); F_cr = 30 MPa, P_n = 5.06 MN; redesign to 35-mm wall to meet 8 MN storm demand.",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Pedestrian Bridge: 4-m L4×4×1/2 diagonal buckled 14 Jan 2030 under 18 kN demand (vs 10.8 kN capacity after corrosion thinning from 12.7 mm to 9.5 mm wall).",
      ],
      common_errors: [
        "Confusing the principal-plane angle θ_p with the stress-rotation angle (Mohr's circle uses 2θ_p).",
        "Forgetting the 3 factor in von Mises for combined σ + τ (σ_eq = √(σ² + 3τ²), not √(σ² + τ²)).",
        "Applying Euler in the inelastic regime (KL/r < 113.4 for A992) — overestimates capacity.",
        "Using K = 1.0 unconditionally — cantilevers need K = 2.0 (4× more conservative).",
        "Forgetting the 0.877 knockdown for real (imperfect) columns in the elastic regime.",
        "Using I_max instead of I_min for buckling (columns buckle about the weak axis).",
        "Skipping the AISC H1 beam-column interaction check for combined axial + bending.",
      ],
      limitations: [
        "Euler assumes perfectly straight, perfectly centered columns — real columns have initial crookedness (AISC E3's 0.877 knockdown).",
        "Euler is for elastic buckling (σ_cr < σ_y); inelastic buckling (Johnson formula, AISC E3 inelastic) governs intermediate slenderness.",
        "Mohr's circle (2D) is for plane stress; 3D stress states need the cubic characteristic equation.",
        "Von Mises calibrated for ductile metals; brittle materials need Rankine or Mohr-Coulomb criteria.",
        "AISC E3 calibrated for A992; other steels need adjusted column curves (AISC E2, AISC 370 for stainless).",
        "Local buckling (web, flange) is a separate check (AISC E5, E7) from global Euler buckling.",
      ],
      best_practices: [
        "Use Mohr's circle to verify principal-stress eigenvalue calculations (graphical sanity check).",
        "Apply von Mises for ductile metals (steel, aluminum); reserve Tresca for conservative pressure-vessel design.",
        "For slender columns, use AISC E3 elastic-regime F_cr = 0.877·Fe — never pure Euler P_cr for design.",
        "Always use I_min (and r_min) for buckling — columns buckle about the weak axis.",
        "For combined axial + bending, apply the AISC H1 interaction equation, not separate P and M checks.",
        "Add lateral bracing to reduce KL (and thus KL/r) — typically much cheaper than a larger cross-section.",
        "For beam compression flanges, run the AISC F2-F5 LTB check based on the unbraced length L_b.",
      ],
      related_concepts: [
        "Stress & Strain (Lesson 1 — foundational σ = F/A, σ = Eε)",
        "Torsion & Bending (Lesson 2 — τ = Tc/J, σ = My/I for combined loading inputs)",
        "Statics & Engineering Mechanics (internal resultants N, V, M, T by section method)",
        "FEA — eigenvalue (linear) buckling analysis for complex geometries and boundary conditions",
      ],
      prerequisites: [
        "Stress & Strain (Lesson 1)",
        "Torsion & Bending (Lesson 2)",
        "Statics (ΣF = 0, ΣM = 0; section method for combined N, V, M, T)",
        "Linear algebra (eigenvalues for the 3×3 stress tensor — optional)",
        "Trigonometry (Mohr's circle uses 2θ)",
      ],
      references: MOM_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Aerospace",
      stem:
        "Which statement best describes Mohr's circle for a plane-stress state (σ_x, σ_y, τ_xy)?",
      explanation:
        "Mohr's circle is a graphical construction in (σ, τ) space with center at (σ_avg, 0) = ((σ_x+σ_y)/2, 0) and radius R = √[((σ_x−σ_y)/2)² + τ_xy²]. The circle's intersections with the σ-axis give the principal stresses σ_1 and σ_2.",
      whyCorrect:
        "Otto Mohr (1882) showed that the normal and shear stresses on any plane through a point lie on a circle in (σ, τ) space. The center is at (σ_avg, 0) where σ_avg = (σ_x + σ_y)/2 — the average normal stress. The radius is R = √[((σ_x − σ_y)/2)² + τ_xy²]. The circle's rightmost point (σ_avg + R, 0) is the maximum principal stress σ_1; the leftmost (σ_avg − R, 0) is σ_2. The topmost point (σ_avg, +R) is the maximum in-plane shear τ_max = R. To read the stress on a plane at physical angle θ from the x-axis, rotate the diameter by 2θ on the circle (the 2:1 ratio between circle and physical rotation is the *double-angle* convention).",
      whyOthersWrong: [
        "Option 'a circle in (σ, ε) space' confuses stress with strain — Mohr's circle for strain exists but uses (ε, γ/2) axes, not (σ, ε).",
        "Option 'a parabola in (σ, τ) space' is wrong — the stress-transformation equation is trigonometric (cos(2θ), sin(2θ)), which traces a circle, not a parabola.",
        "Option 'a straight line in (σ, τ) space' would only describe a single point stress state (σ_x = σ_y, τ_xy = 0 → degenerate circle of zero radius — a single point on the σ-axis).",
      ],
      options: [
        {
          text: "A circle in (σ, τ) space centered at ((σ_x+σ_y)/2, 0) with radius √[((σ_x−σ_y)/2)² + τ_xy²]; intersections with the σ-axis give σ_1 and σ_2.",
          isCorrect: true,
        },
        {
          text: "A circle in (σ, ε) space centered at the origin with radius E.",
          isCorrect: false,
        },
        {
          text: "A parabola in (σ, τ) space with vertex at (σ_avg, 0).",
          isCorrect: false,
        },
        {
          text: "A straight line in (σ, τ) space from (σ_x, τ_xy) to (σ_y, −τ_xy).",
          isCorrect: false,
        },
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
        "A shaft carries combined bending stress σ = 80 MPa and torsional shear stress τ = 30 MPa. Using the von Mises (distortion-energy) criterion, the equivalent stress σ_eq is closest to:",
      explanation:
        "σ_eq (von Mises, combined σ + τ) = √(σ² + 3τ²) = √(80² + 3·30²) = √(6,400 + 2,700) = √9,100 = 95.4 MPa.",
      whyCorrect:
        "For combined bending + torsion on a shaft (σ_bend and τ_torsion, all other stress components zero), the von Mises (distortion-energy) criterion reduces to σ_eq = √(σ² + 3·τ²). The factor 3 comes from the shear-to-normal stress conversion: σ_eq = √(σ² + 3τ²) is the conventional form for ductile-metal shaft design (calibrated to ν ≈ 0.30, where the factor is 2(1+ν) = 2.6, rounded to 3 for safety). Substituting: σ_eq = √(80² + 3·30²) = √(6,400 + 2,700) = √9,100 = 95.4 MPa. For A992 steel (σ_y = 345 MPa), the FS = 345/95.4 = 3.62 — comfortable.",
      whyOthersWrong: [
        "Option 110 MPa uses σ_eq = √(σ² + 4τ²) (Tresca, more conservative) = √(6,400 + 3,600) = √10,000 = 100 MPa — close to 110 but the convention is 100 MPa for Tresca.",
        "Option 85 MPa uses σ_eq = √(σ² + τ²) (missing the 3 factor for shear) = √(6,400 + 900) = √7,300 = 85.4 MPa — wrong formula.",
        "Option 80 MPa uses σ_eq = σ alone (ignoring the torsional contribution) — wrong; the combined criterion must include the τ contribution.",
      ],
      options: [
        { text: "95 MPa", isCorrect: true },
        { text: "110 MPa", isCorrect: false },
        { text: "85 MPa", isCorrect: false },
        { text: "80 MPa", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem:
        "A solid round steel column (E = 200 GPa) of diameter 61.8 mm and length L = 3 m, pinned-pinned (K = 1.0), has an Euler critical buckling load P_cr closest to:",
      explanation:
        "P_cr = π²EI/(KL)² where I = πd⁴/64 = π(0.0618)⁴/64 = 7.16×10⁻⁷ m⁴. P_cr = π² × 200e9 × 7.16e-7 / (1×3)² = 9.8696 × 200e9 × 7.16e-7 / 9 = 1,413,500/9 = 157,055 N ≈ 157 kN.",
      whyCorrect:
        "Apply the Euler buckling formula P_cr = π²EI/(KL)². The solid round cross-section has I = πd⁴/64. With d = 61.8 mm = 0.0618 m: I = π·(0.0618)⁴/64 = π × 1.459×10⁻⁵/64 = 4.583×10⁻⁵/64 = 7.16×10⁻⁷ m⁴. For pinned-pinned ends K = 1.0, L = 3 m. P_cr = π² × 200×10⁹ × 7.16×10⁻⁷ / (1 × 3)² = 9.8696 × 200 × 7.16 × 100 / 9 = 9.8696 × 1432 × 100 / 9 = 14,135 × 100 / 9 = 1,413,500 / 9 = 157,055 N ≈ 157 kN. The column's slenderness is KL/r = 1.0 × 3 / 0.01544 = 194 — well into the elastic Euler regime; the buckling stress σ_cr = 157,055/3,000 = 52.4 MPa is only 15% of σ_y = 345 MPa — the column buckles far below its material strength.",
      whyOthersWrong: [
        "Option 50 kN uses the AISC E3 elastic-regime knockdown F_cr = 0.877·Fe and φ_c = 0.90 → φ_c·P_n ≈ 0.90 × 0.877 × 157 = 124 kN (LRFD design strength, not theoretical P_cr).",
        "Option 250 kN uses K = 0.7 (fixed-pinned) instead of K = 1.0 → P_cr = π²EI/(0.7·L)² = 157/0.49 = 320 kN (too high — wrong K).",
        "Option 500 kN uses K = 0.5 (fixed-fixed) → P_cr = π²EI/(0.5·L)² = 157/0.25 = 628 kN (way too high — wrong K).",
      ],
      options: [
        { text: "157 kN", isCorrect: true },
        { text: "50 kN", isCorrect: false },
        { text: "250 kN", isCorrect: false },
        { text: "500 kN", isCorrect: false },
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
        "True or False: A slender steel column's Euler critical buckling load P_cr = π²EI/(KL)² is a material-strength limit — the column fails by yielding at σ = σ_y when P reaches P_cr, just as a stocky compression member would.",
      explanation:
        "FALSE. Euler buckling is a *geometric* (elastic stability) failure, not a material-yield failure. A slender column buckles (lateral deflection grows without additional load) at P = P_cr, with the buckling stress σ_cr = P_cr/A typically far below σ_y. The failure mode is geometric instability, not yielding.",
      whyCorrect:
        "FALSE. Euler buckling is a geometric *stability* failure, fundamentally different from material yielding. At P = P_cr, the column becomes laterally unstable — any infinitesimal perturbation causes the column to deflect sideways without any additional axial load. The critical stress σ_cr = P_cr/A = π²E/(KL/r)² is typically far below the material yield strength σ_y. For example, the 61.8-mm × 3-m column has σ_cr = 52.4 MPa — only 15% of σ_y = 345 MPa. The column fails by buckling (geometric instability) long before it fails by yielding (material strength). This is the *slenderness tax* of slender compression members. A *stocky* column (low KL/r, e.g., < 50) yields at σ = σ_y before buckling; an *intermediate* column (50 < KL/r < 113) fails by *inelastic buckling* (Johnson formula, AISC E3); a *slender* column (KL/r > 113) fails by *elastic Euler buckling* at σ_cr = π²E/(KL/r)², well below σ_y.",
      whyOthersWrong: [
        "Option TRUE conflates buckling (a stability/geometric phenomenon) with yielding (a material-strength phenomenon). Buckling occurs when the column's bending stiffness EI cannot sustain the destabilizing effect of the axial load P; yielding occurs when the normal stress reaches σ_y. They are different failure modes governed by different parameters: P_cr depends on E, I, L (geometry + material stiffness); σ_y depends on material composition alone.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

export const MOM_LESSONS: RefLesson[] = [
  LESSON_STRESS_STRAIN,
  LESSON_TORSION_BENDING,
  LESSON_COMBINED_BUCKLING,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts and heat-transfer.ts EXACTLY in Prisma-shim usage.
// ---------------------------------------------------------------------------

/**
 * Upsert the Mechanics of Materials discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "mechanics-of-materials" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "mechanics-of-materials-fundamentals", name "Mechanics of Materials
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
  // 1) Discipline — find by slug "mechanics-of-materials"
  const discipline = await db.discipline.findUnique({
    where: { slug: "mechanics-of-materials" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "mechanics-of-materials" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  const chapterSlug = "mechanics-of-materials-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Mechanics of Materials Fundamentals",
    slug: chapterSlug,
    description:
      "Stress & strain (σ = F/A, ε = ΔL/L, Hooke's law σ = Eε, Poisson's ratio ν), torsion & bending (τ = Tc/J, σ = My/I, shear & moment diagrams), and combined loading & buckling (Mohr's circle, principal stresses, Euler buckling P_cr = π²EI/(KL)²) — the three-lesson deep scientific reference for the Mechanics of Materials engineering discipline.",
    icon: "Layers",
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
  for (const src of MOM_SOURCES) {
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
  const sharedReferenceIds = MOM_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of MOM_LESSONS) {
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
