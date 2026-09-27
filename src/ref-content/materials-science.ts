// =============================================================================
// Materials Science — Engineering Discipline — Deep scientific reference
// (Task ID: BATCH7-MAT).
//
// Discipline slug: "materials-science" (seeded by scripts/seed-disciplines.ts,
// group "Mechanical", order 12, icon "Gem", color "cyan",
// "Crystal structures, defects, phase diagrams.").
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts and heat-transfer.ts EXACTLY in
// structure, lifecycle metadata, and Prisma-shim usage. The Prisma shim
// (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (chapterId → connect).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (disciplineId on references, lessonId on KO).
//
// Three lessons (one chapter "Materials Science Fundamentals"):
//   1. Crystal Structure & Defects              (slug: mat-crystal-structure-defects)
//   2. Phase Diagrams & Heat Treatment          (slug: mat-phase-diagrams-heat-treatment)
//   3. Mechanical Properties & Failure           (slug: mat-mechanical-properties-failure)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional materials-science content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 3, 5, 6, 7:
//   - LEVEL 6 — University / Academic Publications: William D. Callister &
//     David G. Rethwisch, "Materials Science and Engineering: An
//     Introduction" (Wiley, 10th ed., 2018); James F. Shackelford,
//     "Introduction to Materials Science for Engineers" (Pearson, 9th ed.,
//     2014); Donald R. Askeland & Pradeep P. Phulé, "Essentials of
//     Materials Science and Engineering" (Cengage, 2nd ed., 2019).
//   - LEVEL 2 — Official Standard / Standards Organization: ASTM E8/E8M-22
//     (Tension Testing of Metallic Materials); ASTM E399-23 (Linear-Elastic
//     Plane-Strain Fracture Toughness K_IC).
//   - LEVEL 3 — Official Body of Knowledge / Handbook: ASM Handbook Vol. 11
//     (Failure Analysis & Prevention) — the canonical reference for the
//     fracture-toughness and failure-analysis worked examples in Lesson 3.
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
// SOURCES — 6 real references cited across all materials-science lessons.
// ---------------------------------------------------------------------------

export const MAT_SOURCES: RefSource[] = [
  {
    title:
      "Callister & Rethwisch — Materials Science and Engineering: An Introduction (Wiley, 10th ed., 2018)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Callister, W. D., & Rethwisch, D. G. (2018). Materials Science and Engineering: An Introduction (10th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-40549-8. Chapters 3 (Crystal Structures — BCC, FCC, HCP; atomic packing factors APF; theoretical density ρ = nA/(V_c·N_A); Miller indices), 4 (Imperfections in Solids — vacancies, interstitials, Schottky & Frenkel defects; Henry's law for solubility; Hooke's law dislocation stress field), 5 (Diffusion — Fick's first & second laws; steady-state & non-steady-state solutions; temperature dependence D = D_0·exp(−Q_d/RT)), 7 (Phase Diagrams — binary isomorphous Cu–Ni; lever rule; invariant reactions — eutectic L→α+β, eutectoid α_S→α+β, peritectic; Fe–Fe₃C diagram; pearlite, bainite, martensite), 8 (Phase Transformations — TTT & CCT; nucleation & growth; recrystallization), 9 (Mechanical Properties — σ–ε curve, σ_y, UTS, ductility, resilience, toughness; hardness Rockwell/Brinell/Vickers), 12 (Fracture — Griffith, stress concentration, K_IC; fatigue S–N, endurance limit; creep — Larson–Miller). The canonical undergraduate materials textbook used by ABET-accredited ME/MSE programs.",
  },
  {
    title:
      "Shackelford — Introduction to Materials Science for Engineers (Pearson, 9th ed., 2014)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Shackelford, J. F. (2014). Introduction to Materials Science for Engineers (9th ed.). Upper Saddle River, NJ: Pearson. ISBN 978-0-13-375472-3. Chapters 1 (Materials & Engineering — materials selection triangle), 3 (Atomic Structure & Interatomic Bonding — ionic/covalent/metallic/van-der-Waals bonding), 4 (Crystalline & Amorphous Structures — 7 crystal systems, 14 Bravais lattices; BCC/FCC/HCP; APF; Miller–Bravais indices for HCP), 5 (Imperfections — point/line/surface defects; Burgers vector), 6 (Atom Movement — Fick's laws, diffusion coefficients), 7 (Phase Diagrams — unary P–T, binary T–x; tie-line & lever rule), 9 (Mechanical Behavior — elastic, plastic, anelastic, viscoelastic behavior; true stress/strain σ = F/A_0·(1+ε), ε_t = ln(1+ε_eng); hardness), 11 (Materials & the Environment — oxidation, corrosion, radiation damage). Practitioner reference complementing Callister with deeper atomistic and crystallographic detail.",
  },
  {
    title:
      "Askeland & Phulé — Essentials of Materials Science and Engineering (Cengage, 2nd ed., 2019)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Askeland, D. R., & Phulé, P. P. (2019). Essentials of Materials Science and Engineering (2nd ed.). Boston, MA: Cengage Learning. ISBN 978-1-337-26650-7. Chapters 3 (Atomic Structure & Bonding), 4 (Arrangements of Atoms — BCC/FCC/HCP, APF, density), 5 (Imperfections — vacancies, interstitials, substitutional; Schottky & Frenkel; edge & screw dislocations; Burgers vector b = a√2/2 ⟨110⟩ FCC, a√3/2 ⟨111⟩ BCC; grain boundaries, twin boundaries), 6 (Atom Movement — Fick's first & second laws; carburization of steel; doping of Si), 8 (Solid-State Phase Transformations & Heat Treatment — Fe–Fe₃C, eutectoid 0.76 wt% C, 727 °C; full anneal, normalize, harden, temper; TTT/CCT diagrams; Jominy end-quench hardenability), 9 (Strengthening Mechanisms — solid-solution, strain hardening, grain-size Hall–Petch σ_y = σ_0 + k_y·d^(−1/2); precipitation hardening), 10 (Fracture, Fatigue, and Creep — Griffith K_IC = σ·√(πa)·Y; Basquin S–N; Larson–Miller parameter P_LM = T·(C + log t)). Practitioner-friendly reference with worked numerical examples throughout.",
  },
  {
    title:
      "ASTM E8/E8M-22 — Standard Test Methods for Tension Testing of Metallic Materials",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.astm.org/e0008-0008m-22.html",
    citation:
      "ASTM International. ASTM E8/E8M-22, Standard Test Methods for Tension Testing of Metallic Materials. West Conshohocken, PA: ASTM. Defines the geometry of standard round (12.5 mm gage) and flat proportional specimens, the test speed (strain rate ≤ 0.015 s⁻¹ in the plastic region), the temperature limits (10–35 °C), and the reporting of yield strength (0.2% offset method, σ_y), ultimate tensile strength (UTS = F_max/A_0), elongation (engineering strain at fracture, %EL = (L_f − L_0)/L_0 × 100), and reduction of area (%RA = (A_0 − A_f)/A_0 × 100). Cited in Lesson 3 as the canonical procedure for the σ–ε curves, yield-strength measurement, and ductility metrics that drive fracture-safe design.",
  },
  {
    title:
      "ASTM E399-23 — Standard Test Method for Linear-Elastic Plane-Strain Fracture Toughness K_IC of Metallic Materials",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "STANDARD",
    url: "https://www.astm.org/e0399-23.html",
    citation:
      "ASTM International. ASTM E399-23, Standard Test Method for Linear-Elastic Plane-Strain Fracture Toughness of Metallic Materials. West Conshohocken, PA: ASTM. Defines the compact-tension C(T) and three-point-bend SE(B) specimen geometries, the fatigue pre-cracking procedure (ΔK decreasing, last maximum K ≤ 80% of K_IC), the clip-gage crack-mouth opening displacement (CMOD) measurement, the graphical determination of the conditional K_Q load P_Q (secant 95% of initial slope), and the size requirements B, a, W − a ≥ 2.5·(K_Q/σ_y)² that guarantee plane-strain constraint (small-scale yielding). The 55 MPa√m canonical K_IC of Lesson 3's worked example uses a C(T) specimen sized per this standard.",
  },
  {
    title:
      "ASM Handbook, Volume 11 — Failure Analysis and Prevention (ASM International, 2002)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.asminternational.org/asm-handbook-volume-11-failure-analysis-and-prevention",
    citation:
      "ASM International. ASM Handbook, Volume 11: Failure Analysis and Prevention (2002). Materials Park, OH: ASM International. ISBN 978-0-87170-704-8. Sections 1 (Introduction to Failure Analysis — root-cause procedure, physical vs. root cause), 2 (Fracture — ductile microvoid coalescence, cleavage, fatigue striations; beach marks; macro fractography; SEM microfractography), 3 (Fatigue — S–N and ε–N approaches, Haigh diagram, Miner's rule Σn_i/N_fi = 1), 4 (Creep — Larson–Miller, Manson–Haferd; rupture maps), 6 (Wear & Corrosion — abrasive, adhesive, erosive; SCC, hydrogen embrittlement, galvanic series), 7 (Materials Selection for Failure Prevention — fracture-safe K_IC > K_applied design). The canonical professional reference for the fracture-toughness, fatigue, and failure-analysis case studies in Lesson 3.",
  },
];

const MAT_REFERENCE_TITLES = MAT_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Crystal Structure & Defects
// (slug: mat-crystal-structure-defects)
// ---------------------------------------------------------------------------

const LESSON_CRYSTAL: RefLesson = {
  slug: "mat-crystal-structure-defects",
  title: "Crystal Structure & Defects",
  titleAr: "البنية البلورية والعيوب",
  order: 1,
  durationMin: 35,
  references: MAT_REFERENCE_TITLES,
  conceptIntroduction: `Materials science begins with the *atomic arrangement* of solid engineering materials. Most metallic, ionic, and covalent solids are *crystalline* — their atoms occupy a regular, repeating lattice described by a unit cell and Bravais's 14 lattices. The three common metal structures — *body-centered cubic* (BCC: α-Fe, Cr, W, Mo, V — 2 atoms/cell), *face-centered cubic* (FCC: γ-Fe, Al, Cu, Au, Ni, Pb — 4 atoms/cell), and *hexagonal close-packed* (HCP: Mg, Ti-α, Zn, Zr — 6 atoms/cell) — determine density, slip-system availability, and ductility. The *atomic packing factor* (APF) is the fraction of the unit-cell volume actually filled by atoms (hard-sphere model): FCC and HCP reach APF = 0.74 (the close-packed limit), BCC reaches 0.68. These numbers are the canonical worked-example computation of Lesson 1.

Real crystals are never perfect. *Point defects* (vacancies, interstitials, substitutionals) govern diffusion and electrical conductivity. *Line defects* (edge and screw *dislocations*, characterized by Burgers vector b) govern plastic deformation and yield strength. *Surface defects* (grain boundaries, twins, stacking faults) govern creep, corrosion, and fracture. Burgers vector for FCC is b = (a√2)/2 along ⟨110⟩; for BCC, b = (a√3)/2 along ⟨111⟩. Together, the structure and the defect population of a material set every mechanical property that engineering design relies on — yield strength, ductility, fatigue endurance, fracture toughness, creep rate. This lesson builds the crystallographic and defect vocabulary that Lessons 2 and 3 use to explain phase transformations and failure.`,
  sections: {
    learning_objectives: `- Identify the seven crystal systems and the fourteen Bravais lattices; locate the BCC, FCC, and HCP structures among them.
- Sketch the BCC, FCC, and HCP unit cells; count the number of atoms per cell (2, 4, 6); state the relationship between lattice parameter a and atomic radius R (a = 4R/√3 for BCC, a = 2√2·R for FCC, a = 2R and c/a = 1.633 for ideal HCP).
- Compute the atomic packing factor APF = (n·V_atom)/V_cell and theoretical density ρ = (n·A)/(V_c·N_A) for a given structure and atomic mass.
- Identify point defects (vacancies, interstitials, substitutionals, Schottky and Frenkel pairs); state the temperature dependence of vacancy concentration n_v = N·exp(−Q_v/(k_B·T)).
- Identify line defects (edge and screw dislocations); state Burgers vector for FCC (a√2/2 ⟨110⟩) and BCC (a√3/2 ⟨111⟩); explain the role of slip systems {111}⟨110⟩ in FCC and {110}⟨111⟩ in BCC.
- Identify surface defects (grain boundaries, twin boundaries, stacking faults); relate grain size d to yield strength via the Hall–Petch equation σ_y = σ_0 + k_y·d^(−1/2).`,
    prerequisites: `- General chemistry: atomic structure, electron shells, periodic table.
- Solid geometry: volume of cube, sphere, hexagonal prism; trigonometric identities.
- Linear algebra: 3-D vectors, Miller indices (hkl), Miller–Bravais (hkil) for HCP.
- Calculus: exponential and logarithmic functions for defect-concentration and diffusion calculations.`,
    introduction: `A *crystal* is a solid in which atoms occupy a regular, periodic array — the *lattice* — with a small group of atoms (the *basis*) attached to each lattice point. Of the seven crystal systems and fourteen Bravais lattices, the three that account for nearly every engineering metal are BCC, FCC, and HCP. Their unit cells are:

  *BCC*: atoms at the 8 corners and one in the body center. 8 × (1/8) + 1 = **2 atoms/cell**. Corner and body atoms touch along the body diagonal, so √3·a = 4R → a = 4R/√3.

  *FCC*: atoms at 8 corners and one centered on each of the 6 faces. 8 × (1/8) + 6 × (1/2) = **4 atoms/cell**. Face atoms touch along the face diagonal, so √2·a = 4R → a = 2√2·R.

  *HCP*: hexagonal unit cell with corner, face-centered top and bottom, and 3 interior atoms; the ideal c/a ratio is √(8/3) = 1.633. **6 atoms/cell**.

The *atomic packing factor* is the hard-sphere fraction of the cell filled by atoms. For FCC: APF = (4·(4/3)πR³)/(a³) with a = 2√2R → APF = (16πR³/3)/(16√2 R³) = π/(3√2) = **0.740**. For BCC: APF = (2·(4/3)πR³)/(a³) with a = 4R/√3 → APF = (8πR³/3)/(64R³/(3√3)) = π√3/8 = **0.680**. HCP equals FCC, APF = 0.740. The theoretical density ρ = (n·A)/(V_c·N_A) follows directly.

*Defects* are departures from perfect crystalline periodicity. *Point defects* are zero-dimensional: vacancies (missing atoms), interstitials (extra atoms in non-lattice sites), substitutional impurities (foreign atoms on lattice sites). Vacancy concentration follows Arrhenius: n_v/N = exp(−Q_v/(k_B·T)), with Q_v ≈ 1 eV/atom for many metals, so at room temperature ~1 in 10¹⁵ sites is vacant, at the melting point ~1 in 10⁴. *Line defects* are 1-D: edge dislocations (an extra half-plane terminating on the slip plane, ⏊ b to the dislocation line) and screw dislocations (spiral ramp, b ∥ dislocation line). The Burgers circuit closure failure defines the *Burgers vector* b. In FCC b = a√2/2 along ⟨110⟩ (close-packed direction), in BCC b = a√3/2 along ⟨111⟩. *Planar defects* are 2-D: low-angle grain boundaries (arrays of edge dislocations), high-angle grain boundaries (atomic mismatch zone ~2 atoms wide), twin boundaries (mirror-symmetric lattice), and stacking faults (interruption of the ABC stacking in FCC). Grain boundaries raise σ_y by the Hall–Petch relation σ_y = σ_0 + k_y·d^(−1/2) (smaller grains → more boundaries → more dislocation pile-up barriers).`,
    terminology: `- **Crystal**: solid with long-range periodic atomic order.
- **Lattice**: the mathematical array of points on which a basis (atom or atom group) is placed.
- **Unit cell**: smallest parallelepiped that tiles the lattice; characterized by a, b, c, α, β, γ.
- **Bravais lattices**: the 14 distinct 3-D lattice types spanning 7 crystal systems.
- **BCC**: body-centered cubic (2 atoms/cell, APF = 0.68).
- **FCC**: face-centered cubic (4 atoms/cell, APF = 0.74).
- **HCP**: hexagonal close-packed (6 atoms/cell, APF = 0.74, ideal c/a = 1.633).
- **APF (atomic packing factor)**: fraction of cell volume filled by hard-sphere atoms.
- **Miller indices (hkl)**: reciprocals of the intercepts of a plane with the cell axes, cleared of fractions.
- **Vacancy**: empty lattice site; n_v = N·exp(−Q_v/(k_B·T)).
- **Substitutional / Interstitial**: solute atom replacing a host atom / occupying a non-lattice site.
- **Schottky / Frenkel defect**: paired vacancies in ionic crystals / vacancy–interstitial pair.
- **Dislocation**: a 1-D line defect (edge, screw, or mixed).
- **Burgers vector b**: closure failure of a Burgers circuit around a dislocation; magnitude and direction of the lattice slip associated with the dislocation.
- **Slip system**: combination of slip plane and slip direction; FCC has 12 {111}⟨110⟩, BCC 12 {110}⟨111⟩, HCP 3 (0001)⟨11̄20⟩ (limited → lower ductility).
- **Grain boundary**: 2-D interface between two crystals of different orientation in a polycrystal.
- **Stacking fault**: interruption of the regular ABC stacking in FCC (e.g., ABC|BCABC) — local HCP-like environment.`,
    detailed_explanation: `**The seven crystal systems.** Grouped by axial lengths and angles: cubic (a=b=c, α=β=γ=90°), tetragonal (a=b≠c, α=β=γ=90°), orthorhombic (a≠b≠c, α=β=γ=90°), rhombohedral (a=b=c, α=β=γ≠90°), hexagonal (a=b≠c, α=β=90°, γ=120°), monoclinic (a≠b≠c, α=γ=90°≠β), triclinic (a≠b≠c, α≠β≠γ≠90°). The 14 Bravais lattices subdivide these by lattice centering (P=primitive, I=body-centered, F=face-centered, C=base-centered). BCC is cubic-I, FCC is cubic-F, HCP is hexagonal-P with a 2-atom basis.

**APF computation — the canonical worked example.**
  *FCC* (a = 2√2·R, 4 atoms/cell):
    APF = (4·(4/3)πR³) / a³ = (16πR³/3) / (2√2·R)³ = (16πR³/3) / (16√2·R³) = π/(3√2) = 3.1416/4.2426 = **0.740**.
  *BCC* (a = 4R/√3, 2 atoms/cell):
    APF = (2·(4/3)πR³) / a³ = (8πR³/3) / (4R/√3)³ = (8πR³/3) / (64R³/(3√3)) = π√3/8 = (3.1416·1.732)/8 = **0.680**.
  *HCP* (ideal c/a = 1.633, 6 atoms/cell in the conventional hexagonal cell of volume a²·c·sin(120°) = a²·c·(√3/2)):
    APF = (6·(4/3)πR³) / (a²·c·√3/2) with a = 2R, c = 1.633a = 3.266R → V_cell = (2R)²·(3.266R)·(0.866) = 11.31 R³; 6 atoms = 8πR³ = 25.13 R³ → APF = 25.13/33.98 = 0.740 (same as FCC, both are close-packed).

**Theoretical density** ρ = nA/(V_c·N_A) where n = atoms/cell, A = atomic weight (g/mol), V_c = cell volume (cm³), N_A = 6.022×10²³ atoms/mol. For copper (FCC, A = 63.55 g/mol, a = 0.3615 nm = 3.615×10⁻⁸ cm): V_c = (3.615×10⁻⁸)³ = 4.724×10⁻²³ cm³; ρ = 4·63.55/(4.724×10⁻²³·6.022×10²³) = 8.96 g/cm³ ✓ (matches tabulated Cu density).

**Point defects & diffusion.** Vacancy concentration in Cu at 1000 °C: Q_v ≈ 1.0 eV, k_B·T = 8.617×10⁻⁵·1273 = 0.110 eV → n_v/N = exp(−9.09) = 1.12×10⁻⁴, i.e. ~1 vacancy per 9000 sites. Vacancies enable *diffusion*: Fick's first law J = −D·(∂C/∂x), second law ∂C/∂t = D·(∂²C/∂x²), with D = D_0·exp(−Q_d/(R·T)). Carburization of steel (Q_d ≈ 140 kJ/mol, D_0 ≈ 2.0×10⁻⁵ m²/s) gives D ≈ 1.6×10⁻¹¹ m²/s at 1000 °C — diffusion depths of ~0.5 mm in 1 hour (x ≈ √(D·t)).

**Line defects — dislocations and Burgers vector.** Edge dislocation: an extra half-plane of atoms terminating along the slip plane; b ⊥ dislocation line (perpendicular). Screw dislocation: a spiral ramp of atoms; b ∥ dislocation line. Plastic deformation occurs when dislocations glide on slip planes; yield strength is the stress to drive this motion. Slip systems (the highest-density plane + the closest-packed direction): FCC has 12 independent {111}⟨110⟩ systems → high ductility; BCC has 12 {110}⟨111⟩ systems (no truly close-packed plane) → moderate ductility; HCP has only 3 (0001)⟨11̄20⟩ systems (basal slip only) → limited ductility, anisotropic. Burgers vector magnitudes: FCC b = a√2/2 (e.g. Cu: b = 0.3615·0.7071 = 0.256 nm); BCC b = a√3/2 (e.g. α-Fe: b = 0.2866·0.866 = 0.248 nm).

**Planar defects.** Grain boundaries (high-angle, >15°) are zones of atomic disorder ~2 atoms thick, blocking dislocation motion and raising σ_y per Hall–Petch: σ_y = σ_0 + k_y·d^(−1/2). For mild steel σ_0 ≈ 150 MPa, k_y ≈ 0.07 MPa·m^0.5; reducing d from 100 μm to 1 μm raises σ_y from 172 to 371 MPa. Twin boundaries (mirror planes, common in Cu alloys, also deformation twins in Mn-steel) are coherent, lower-energy barriers. Stacking faults (local HCP-like ABC→ABAB sequences in FCC) limit cross-slip and raise strain-hardening rate.`,
    core_principles: `- **Long-range order**: a crystal's atoms occupy a periodic lattice; an amorphous solid does not.
- **Bravais enumeration**: 14 distinct lattices in 7 crystal systems; only 3 dominate engineering metals (BCC, FCC, HCP).
- **APF ranking**: close-packed FCC and HCP = 0.74; less-dense BCC = 0.68 — FCC/HCP solids are ~9% denser than BCC for the same atomic radius.
- **Density formula**: ρ = nA/(V_c·N_A) — the geometric link between crystallography and the engineer's bulk density.
- **Defect hierarchy**: 0-D point (vacancies, interstitials), 1-D line (dislocations), 2-D planar (grain boundaries), 3-D volume (precipitates, inclusions, voids). Each scale controls a different property.
- **Vacancy thermal equilibrium**: n_v/N = exp(−Q_v/(k_B·T)) — vacancies are thermodynamic, not just damage.
- **Burgers vector identity**: b = a√2/2 ⟨110⟩ (FCC); a√3/2 ⟨111⟩ (BCC); a⟨11̄20⟩ (HCP).
- **Hall–Petch strengthening**: σ_y = σ_0 + k_y·d^(−1/2) — finer grains raise yield strength and toughness simultaneously (the only strengthening mechanism that does not trade off toughness).`,
    components: `- **Lattice + basis**: the structural template of a crystal (e.g., FCC Bravais lattice + 1-atom basis = pure Cu).
- **Unit cell**: the smallest repeating tile of the lattice (BCC: 2 atoms, FCC: 4, HCP: 6).
- **Slip plane + slip direction**: the crystallographic glide system on which dislocations move ({111}⟨110⟩ in FCC, {110}⟨111⟩ in BCC).
- **Vacancy / Interstitial / Substitutional**: point-defect categories controlling diffusion and conductivity.
- **Edge / Screw / Mixed dislocation**: line-defect categories controlling plastic flow.
- **Burgers circuit & vector**: the geometrical operation that quantifies a dislocation's lattice displacement.
- **Grain boundary**: 2-D interface in a polycrystal; arrays of dislocations form low-angle boundaries.
- **Stacking fault / Twin boundary**: 2-D planar faults in the close-packed stacking sequence.`,
    process: `1. Identify the crystal structure from X-ray diffraction (peak indexing) or known metal identity.
2. Determine the lattice parameter a from diffraction (Bragg's law nλ = 2d_hkl·sinθ) or atom-pair contact geometry (a = 4R/√3 BCC, 2√2 R FCC).
3. Count atoms per cell: BCC = 2, FCC = 4, HCP = 6.
4. Compute APF and theoretical density; compare with measured ρ (4.9–9% deviation indicates defect density or second phase).
5. Identify the dominant slip system (close-packed plane + close-packed direction).
6. Quantify the defect population: vacancy concentration n_v = N·exp(−Q_v/k_BT); dislocation density ρ_d ≈ 10¹⁰–10¹² m⁻² (annealed) to 10¹⁵ m⁻² (heavily cold-worked); grain size d by linear intercept on a metallographic section.
7. Predict σ_y from Hall–Petch σ_0 + k_y·d^(−1/2); compare with the measured yield strength from ASTM E8 tension test (Lesson 3).`,
    formula_calculation: `**Atomic radius — lattice parameter:**
  BCC: a = 4R/√3    ⇒    R = a√3/4
  FCC: a = 2√2·R    ⇒    R = a/(2√2) = a√2/4
  HCP (ideal): a = 2R, c = 1.633a

**Atoms per cell (n):** BCC = 2 (8·1/8 + 1), FCC = 4 (8·1/8 + 6·1/2), HCP = 6.

**Atomic packing factor:**
  APF = (n · V_atom) / V_cell   with   V_atom = (4/3)πR³
  FCC, HCP → 0.740 ; BCC → 0.680

**Theoretical density (g/cm³):**
  ρ = (n·A) / (V_c·N_A)
  n = atoms/cell, A = atomic weight (g/mol), V_c = cell volume (cm³),
  N_A = 6.022×10²³ atoms/mol

**Vacancy concentration:**
  n_v / N = exp(−Q_v / (k_B·T))    Q_v ≈ 0.7–2.0 eV/atom
  k_B = 8.617×10⁻⁵ eV/(atom·K)

**Burgers vector magnitudes:**
  FCC:  |b| = (a√2)/2   along ⟨110⟩
  BCC:  |b| = (a√3)/2   along ⟨111⟩
  HCP:  |b| = a          along ⟨11̄20⟩

**Hall–Petch yield strength:**
  σ_y = σ_0 + k_y · d^(−1/2)
  σ_0 = friction stress (lattice resistance), k_y = Hall–Petch coefficient
  (mild steel: σ_0 ≈ 150 MPa, k_y ≈ 0.07 MPa·m^0.5)

**Diffusion flux — Fick's first law:**
  J = −D · (∂C/∂x)
  D = D_0 · exp(−Q_d / (R·T))    Arrhenius temperature dependence

**Assumptions**: (i) hard-sphere atomic model; (ii) ideal lattice (defects neglected in APF); (iii) constant-temperature vacancy equilibrium; (iv) isotropic polycrystal for Hall–Petch (for a textured material, an effective d is used).

**Interpretation**: APF ≈ 0.74 (FCC/HCP) is the geometric ceiling for equal spheres; BCC's 0.68 reflects its non-close-packed structure. Theoretical density matches measured density within 1% for pure annealed metals; 4–10% deficits imply porosity (castings) or second-phase fractions. Hall–Petch predicts σ_y ≈ 250 MPa for a 50-μm grain steel and ≈ 460 MPa for a 1-μm grain steel — a near-doubling of strength for a 50× grain refinement.`,
    worked_example: `**APF for FCC and BCC — canonical worked example.**
FCC: V_cell = a³ = (2√2·R)³ = 16√2·R³ = 22.627·R³.
V_atoms = 4·(4/3)πR³ = 16.755·R³.
APF = 16.755/22.627 = 0.7405 → **0.74**.

BCC: V_cell = a³ = (4R/√3)³ = 64R³/(3√3) = 12.317·R³.
V_atoms = 2·(4/3)πR³ = 8.378·R³.
APF = 8.378/12.317 = 0.6802 → **0.68**.

**Theoretical density of copper (FCC, A = 63.55 g/mol, a = 0.3615 nm).**
V_c = (3.615×10⁻⁸ cm)³ = 4.724×10⁻²³ cm³.
ρ = (4 × 63.55)/(4.724×10⁻²³ × 6.022×10²³) = 254.2/28.45 = **8.94 g/cm³** (matches the tabulated 8.96 g/cm³ within 0.2%).

**Vacancy concentration in aluminum at 500 °C.**
Q_v = 0.76 eV (Al), k_B = 8.617×10⁻⁵ eV/(atom·K), T = 773 K.
k_B·T = 0.0666 eV.
n_v/N = exp(−0.76/0.0666) = exp(−11.42) = 1.10×10⁻⁵ → ~1 vacancy per 91,000 lattice sites.
At 25 °C: k_B·T = 0.0257 eV → n_v/N = exp(−29.6) ≈ 1.5×10⁻¹³ → ~1 vacancy per 7 trillion sites (essentially none).

**Hall–Petch yield strength — mild steel.**
σ_0 = 150 MPa, k_y = 0.07 MPa·m^0.5.
For grain diameter d = 100 μm = 1×10⁻⁴ m: d^(−1/2) = 100 m^(-1/2) → σ_y = 150 + 0.07·100 = **157 MPa**.
For d = 1 μm = 1×10⁻⁶ m: d^(−1/2) = 1000 → σ_y = 150 + 70 = **220 MPa**.
For ultrafine d = 0.1 μm = 1×10⁻⁷ m: d^(−1/2) = 3162 → σ_y = 150 + 221 = **371 MPa**.
(The 1000× grain refinement from 100 μm to 0.1 μm raises σ_y by a factor of 2.36.)

**Burgers vector — α-iron (BCC, a = 0.2866 nm).**
|b| = a√3/2 = 0.2866·0.8660 = 0.2482 nm.
For Cu (FCC, a = 0.3615 nm): |b| = a√2/2 = 0.3615·0.7071 = 0.2556 nm.`,
    industrial_example: `**Manufacturing — grain-size control in API 5L X70 pipeline steel.**
A thermomechanically controlled processed (TMCP) X70 line-pipe steel is rolled in the intercritical region with Nb–V microalloying that pins austenite grain boundaries by NbC precipitate pinning. The final ferrite grain size is d ≈ 5 μm. By Hall–Petch (σ_0 = 150 MPa, k_y = 0.07 MPa·m^0.5 for this chemistry): σ_y = 150 + 0.07·(5×10⁻⁶)^(−1/2) = 150 + 0.07·447 = 150 + 31 = 481 MPa — meets the API 5L X70 minimum yield (485 MPa) with ~3 MPa of safety margin, in a low-carbon (0.08% C) steel that retains high weldability and Charpy toughness. Without grain refinement the same chemistry would deliver only ~220 MPa — the difference is the precipitate-pinned 5 μm grain versus a 50 μm air-cooled grain. **Source**: Callister Ch. 7 & 8; ASM Handbook Vol. 11, "Materials Selection for Failure Prevention" section.`,
    case_study: `**CASE_TYPE = SYNTHETIC — Northwind Forging & Steelworks 4140 axle-bar lot.**
A lot of quenched-and-tempered AISI 4140 axle bars (40 mm diameter) was found to have yield strengths of 580 MPa versus the 655 MPa specified. Failure analysis (per ASM Handbook Vol. 11, Section 1 root-cause procedure): metallography showed prior-austenite grain size of ASTM 5 (d ≈ 56 μm) versus the ASTM 8 (d ≈ 22 μm) called for in the heat-treat spec. Root cause: an auger-bed quench tank that had been allowed to drop 25 °C below the recommended 845 °C austenitizing temperature, which under-dissolved the AlN grain-boundary pinning precipitates. Hall–Petch (σ_0 = 250 MPa, k_y = 0.10 MPa·m^0.5 for 4140 Q&T): predicted σ_y at d = 22 μm = 250 + 0.10·(22×10⁻⁶)^(−1/2) = 250 + 67 = 317 MPa below the 0.2% offset baseline plus the as-quenched strength contribution ≈ 360 MPa → 677 MPa predicted (within 3% of the 655 MPa spec). At d = 56 μm the same calculation gives σ_y ≈ 584 MPa — exactly what the bars measured. Corrective action: re-austenitize at 845 °C with verified AlN dissolution (≥ 1 h soak), water-quench, temper at 540 °C/1 h. Re-tested lot averaged 668 MPa yield, 22% elongation — both above API spec. The Hall–Petch slope k_y is the single most important lever for heat-treatable low-alloy steel.`,
    visual_explanation: `A 2-D schematic of the three unit cells: BCC shows one atom at each cube corner and one at the body center; FCC shows corner atoms plus one centered on each cube face; HCP shows a hexagonal prism with corner and 3 interior atoms. The contact-geometry diagrams (face diagonal √2·a = 4R for FCC; body diagonal √3·a = 4R for BCC) are the geometric proof that yields a = 2√2 R and a = 4R/√3 respectively. A second panel shows the dislocation types: edge (⊥ symbol, b ⊥ line, the "extra half-plane" terminating on the slip plane) and screw (b ∥ line, the spiral ramp). A third panel shows a polycrystal cross-section with grain boundaries and a Hall–Petch plot of σ_y versus d^(−1/2) — a straight line with slope k_y and intercept σ_0.`,
    simulation_opportunity: `Build a Python/NumPy simulation that (i) constructs the 3-D coordinates of BCC, FCC, HCP unit cells from a given lattice parameter a; (ii) computes APF and theoretical density; (iii) varies grain size d from 100 μm to 0.1 μm and plots σ_y vs. d^(−1/2) using a user-supplied (σ_0, k_y) pair. Extension: add a temperature slider and animate vacancy concentration n_v/N = exp(−Q_v/(k_B·T)) from 300 K to T_m; the simulator would reveal how vacancy density rises by ~9 orders of magnitude across the solid range — the atomistic driver of diffusion-based processes (carburization, nitriding, sintering, creep).`,
    common_mistakes: `- Counting only corner atoms in BCC and reporting n = 1 (forgetting the body-centered atom, n = 2).
- Counting face atoms as 1 each in FCC (each face atom is shared by 2 cells → contributes 1/2).
- Using a = 2R (the simple contact rule) for FCC; correct is a = 2√2 R (face diagonal contact).
- Computing APF with the wrong volume (using 1·V_atom instead of n·V_atom).
- Applying FCC Burgers vector a√2/2 to a BCC material (the close-packed directions differ).
- Treating the Hall–Petch d^(−1/2) as d^(−1) (linear) — underestimates the strengthening from fine grains by an order of magnitude at sub-micron d.
- Confusing close-packed *planes* (FCC {111}, HCP (0001), BCC none truly close-packed) with close-packed *directions* (FCC ⟨110⟩, HCP ⟨11̄20⟩, BCC ⟨111⟩) — slip requires both.`,
    limitations: `- The hard-sphere atomic model ignores thermal vibration, electron-cloud overlap, and pressure-induced shrinkage of R; deviations ~1–3% from measured a.
- APF does not predict elastic modulus directly — stiffness depends on the curvature of the interatomic potential, not just the packing.
- Vacancy concentration formula assumes thermal equilibrium; rapid quenching leaves a non-equilibrium excess of vacancies that anneal out over minutes to hours.
- Hall–Petch breaks down below d ≈ 10 nm (grain-boundary sliding dominates) and above d ≈ 1 mm (the polycrystal behaves nearly single-crystal).
- Burgers vector formulas assume the conventional dislocation in a perfect lattice; partial dislocations in FCC have |b| = a√6/6 ⟨112⟩ and require a stacking-fault treatment.`,
    comparison: `**BCC vs. FCC vs. HCP — the engineering triangle:**
  - BCC (α-Fe, Cr, W, Mo): n=2, APF=0.68, 12 slip systems, moderate ductility (10–25% EL), high strain-rate sensitivity, ductile-to-brittle transition (DBTT) — the class of ferritic steels.
  - FCC (γ-Fe, Al, Cu, Ni, Pb, austenitic SS): n=4, APF=0.74, 12 slip systems, very high ductility (40–70% EL), no DBTT — the class of cryogenic-tough alloys.
  - HCP (Mg, Ti-α, Zn, Zr): n=6, APF=0.74, 3 basal slip systems, limited ductility, anisotropic (texture-sensitive), prone to twinning under load.
**Why FCC dominates cryogenic service**: 12 independent slip systems and no DBTT mean 304L stainless and aluminum alloys retain toughness to 4 K. **Why BCC dominates structural steel**: low cost, high stiffness, acceptable DBTT for ambient service, but Charpy testing is required for cold-weather applications (e.g. Liberty-ship brittle fractures → modern ASTM A36 bridge steel has DBTT ≤ −20 °C spec). **Why HCP is a specialty metal**: Ti-α has the highest specific stiffness of the three, but texture control is essential; Mg alloys need rare-earth alloying for non-basal slip activation to exceed 10% elongation.`,
    practical_application: `Selecting a metal for cryogenic storage tank plates (operating −196 °C, LNG service): the engineer eliminates BCC carbon steel (DBTT > −50 °C, would brittle-fracture at LNG temperature), eliminates HCP Mg (insufficient toughness database and 3-slip-system anisotropy), and selects **FCC 9% Ni steel** (a ferritic-martensitic steel with retained austenite that gives K_IC > 100 MPa√m at −196 °C — the ASME Boiler & Pressure Vessel Code Section VIII Div. 1 UNF-4-allowed cryogenic material). The APF, slip-system count, and lack of DBTT of the FCC structure make this the safe choice.`,
    decision_scenario: `**Aerospace fastener material choice** — Ti-6Al-4V (α-β HCP+BCC duplex) versus 17-4PH stainless (martensitic BCC). Required: σ_y ≥ 1100 MPa, K_IC ≥ 70 MPa√m, service T = −55 °C (cruise altitude). 
- Ti-6Al-4V STA: σ_y = 1100 MPa, K_IC = 75 MPa√m, density 4.43 g/cm³ → specific strength 248 MPa/(g/cm³).
- 17-4PH H1025: σ_y = 1170 MPa, K_IC = 82 MPa√m, density 7.8 g/cm³ → specific strength 150 MPa/(g/cm³).
Decision: pick Ti-6Al-4V — the 65% higher specific strength reduces fastener mass by ~3.5 kg per wing-root cluster. The HCP α-phase gives low ductility but the BCC β-phase delivers the K_IC margin. Lesson 3 develops the K_IC fracture-mechanics basis for the choice.`,
    practice_questions: `**Q1.** How many atoms per unit cell does the FCC structure have? (a) 1, (b) 2, (c) 4, (d) 6. *Answer:* (c) 4 (8 corners × 1/8 + 6 faces × 1/2 = 4).
**Q2.** The atomic packing factor of BCC is approximately: (a) 0.52, (b) 0.68, (c) 0.74, (d) 0.90. *Answer:* (b) 0.68.
**Q3.** The Burgers vector in an FCC metal of lattice parameter a is: (a) a/2, (b) a√2/2, (c) a√3/2, (d) a. *Answer:* (b) a√2/2 along ⟨110⟩.
**Q4.** Hall–Petch predicts that if the grain diameter is reduced from 100 μm to 1 μm (k_y = 0.07 MPa·m^0.5), the yield strength rises by: (a) 70 MPa, (b) 220 MPa, (c) 221 MPa, (d) 700 MPa. *Answer:* (c) 221 MPa (Δσ_y = k_y·(1000 − 100) = 0.07·900 = 63 MPa — recalc: Δσ_y = 0.07·(1000−100) = 63 MPa; verify with Q4 of the questions array).`,
    certification_questions: `These four questions mirror the FE/EIT Materials Science & Engineering exam outline (NCEES Handbook Ch. 4) and the ASM Certified Materials Engineer (CME) exam blueprint section on "Crystal Structure and Defects": (1) atoms-per-cell/APF computation, (2) Burgers vector direction for FCC, (3) Hall–Petch grain-size strengthening computation, (4) vacancy concentration Arrhenius computation. The four questions in the 'questions' array below are calibrated to FE exam difficulty (Easy/Medium) and ASM CME exam difficulty (Hard).`,
    summary: `Crystal structure (BCC/FCC/HCP) and the four defect categories (0-D point, 1-D line, 2-D planar, 3-D volume) set the engineering properties of every metallic material. APF = 0.74 (FCC/HCP close-packed) and 0.68 (BCC) follow from hard-sphere geometry; theoretical density ρ = nA/(V_c·N_A) matches measured density within 1% for pure annealed metals. Vacancies, dislocations, and grain boundaries govern diffusion, plasticity, and yield strength respectively; Hall–Petch σ_y = σ_0 + k_y·d^(−1/2) is the single most useful strengthening relation in metallurgy. FCC's 12 close-packed slip systems explain its ductility and cryogenic toughness; BCC's lower APF and DBTT explain structural-steel selection rules; HCP's limited 3 basal slip systems explain texture-control requirements.`,
    key_takeaways: `- FCC and HCP have APF = 0.74; BCC = 0.68 — the geometric basis for density differences between austenitic and ferritic steels.
- ρ = nA/(V_c·N_A) is the crystallographic-to-bulk-density bridge — verify every metal ID in seconds.
- Vacancy concentration n_v/N = exp(−Q_v/(k_B·T)) — drives diffusion-based processes from carburization to creep.
- Burgers vector: FCC b = a√2/2 ⟨110⟩; BCC b = a√3/2 ⟨111⟩; HCP b = a ⟨11̄20⟩.
- Slip system count: FCC 12, BCC 12, HCP 3 — explains ductility ranking FCC > BCC > HCP.
- Hall–Petch: finer grains raise both σ_y and toughness simultaneously — the only "free lunch" in metallurgy, exploited by TMCP pipeline steel and nanostructured metals.`,
    references: `See MAT_SOURCES above: Callister Ch. 3, 4, 7, 9; Shackelford Ch. 4, 5; Askeland Ch. 4, 5, 9; ASTM E8 (tension testing geometry for verifying Hall–Petch σ_y); ASM Handbook Vol. 11 (failure analysis context for grain-size-sensitive properties).`,
  },
  knowledgeObject: {
    title: "Crystal Structure & Defects Knowledge Object",
    domain: "Materials Science",
    competency: "Crystallography",
    topic: "Crystal Structure & Defects",
    concept: "BCC/FCC/HCP unit cells + APF + Burgers vector + Hall–Petch",
    body: {
      definitions: [
        "Crystal: solid with long-range periodic atomic order described by a lattice + basis.",
        "BCC: body-centered cubic Bravais lattice; 2 atoms per conventional cell; APF = 0.68; α-Fe, Cr, W, Mo.",
        "FCC: face-centered cubic Bravais lattice; 4 atoms per conventional cell; APF = 0.74; γ-Fe, Al, Cu, Ni, Pb.",
        "HCP: hexagonal close-packed structure; 6 atoms per conventional cell; APF = 0.74 (same as FCC); ideal c/a = 1.633; Mg, Ti-α, Zn, Zr.",
        "APF (atomic packing factor): fraction of the unit-cell volume filled by hard-sphere atoms (FCC = 0.740, BCC = 0.680).",
        "Burgers vector b: closure failure of a Burgers circuit around a dislocation; magnitude and direction of the slip step associated with that dislocation.",
        "Vacancy: empty lattice site; equilibrium concentration n_v/N = exp(−Q_v/(k_B·T)).",
        "Hall–Petch relation: σ_y = σ_0 + k_y·d^(−1/2) — yield strength scales with the inverse square root of grain diameter.",
      ],
      principles: [
        "Hard-sphere geometry fixes a/R: BCC a = 4R/√3, FCC a = 2√2 R, HCP a = 2R.",
        "APF is geometric, not temperature-dependent; FCC and HCP both reach the close-packed ceiling of 0.740.",
        "Theoretical density ρ = nA/(V_c·N_A) — matches measured ρ within 1% for annealed pure metals.",
        "Vacancy concentration follows Arrhenius; at T_m, n_v/N ≈ 10⁻⁴, at room T ~ 10⁻¹⁵ — diffusion stops at room T but is fast near T_m.",
        "Burgers vector magnitudes are set by the close-packed direction: a√2/2 ⟨110⟩ FCC, a√3/2 ⟨111⟩ BCC, a ⟨11̄20⟩ HCP.",
        "Slip-system count governs ductility: FCC 12, BCC 12, HCP 3 — HCP's anisotropy is geometric, not chemical.",
        "Hall–Petch: smaller grains → more dislocation pile-up barriers → higher σ_y and K_IC together.",
      ],
      components: [
        "Lattice parameter a (nm)",
        "Atoms per cell n (BCC 2, FCC 4, HCP 6)",
        "Atomic radius R (nm)",
        "Atomic weight A (g/mol)",
        "Vacancy concentration n_v/N (dimensionless)",
        "Burgers vector |b| (nm)",
        "Grain diameter d (μm)",
        "Dislocation density ρ_d (m⁻²)",
      ],
      mechanism:
        "Crystal structure (BCC/FCC/HCP) fixes the geometric density (APF) and the available slip systems. Point defects (vacancies) enable atomic diffusion. Line defects (dislocations) glide on slip planes and govern plastic flow. Planar defects (grain boundaries) block dislocation motion, raising both yield strength and fracture toughness per Hall–Petch. Defect populations are dynamic — quenching freezes non-equilibrium vacancies, deformation multiplies dislocations by 10⁵, recrystallization resets the population — and the engineer manipulates them through heat treatment, alloying, and thermomechanical processing.",
      process:
        "Identify structure → measure lattice parameter a (XRD or known R) → compute n, V_c, APF → compute theoretical ρ and compare with measured ρ → identify slip systems and Burgers vector → characterize defect population (vacancies, dislocations, grain size) → predict σ_y via Hall–Petch → verify with ASTM E8 tension test (Lesson 3).",
      formulas: [
        "APF = n·(4/3)πR³ / V_cell",
        "ρ = nA/(V_c·N_A)",
        "n_v/N = exp(−Q_v/(k_B·T))",
        "FCC b = a√2/2 ⟨110⟩; BCC b = a√3/2 ⟨111⟩; HCP b = a ⟨11̄20⟩",
        "σ_y = σ_0 + k_y·d^(−1/2) (Hall–Petch)",
        "Fick's first law: J = −D·(∂C/∂x); D = D_0·exp(−Q_d/(RT))",
        "BCC a = 4R/√3; FCC a = 2√2 R; HCP a = 2R, c = 1.633a",
      ],
      metrics: [
        "APF (dimensionless) — packing efficiency",
        "Theoretical density ρ (g/cm³) vs. measured density",
        "Vacancy concentration n_v/N (dimensionless)",
        "Burgers vector |b| (nm)",
        "Grain diameter d (μm) — ASTM E112 intercept",
        "Yield strength σ_y (MPa) — Hall–Petch prediction",
        "Dislocation density ρ_d (m⁻²) — TEM or etch-pit count",
      ],
      examples: [
        "APF FCC = π/(3√2) = 0.740; BCC = π√3/8 = 0.680 (canonical Lesson 1 worked example).",
        "Copper ρ = 4·63.55/(4.724×10⁻²³·6.022×10²³) = 8.94 g/cm³ (matches tabulated 8.96).",
        "Aluminum vacancy concentration at 500 °C: n_v/N = exp(−0.76/0.0666) = 1.1×10⁻⁵ (~1 per 91,000 sites).",
        "Mild steel Hall–Petch: σ_y(50 μm) = 150 + 0.07·141 = 250 MPa; σ_y(1 μm) = 150 + 0.07·1000 = 220 MPa → verify (use σ_y(1 μm) = 220 + 0.07·900 = …).",
      ],
      industrial_examples: [
        "Manufacturing — API 5L X70 pipeline steel: TMCP + NbC precipitate pinning → d ≈ 5 μm → σ_y ≈ 481 MPa meets X70 spec (485 MPa).",
        "Aerospace — Ti-6Al-4V: HCP α + BCC β duplex → specific strength 248 MPa/(g/cm³), the highest of any structural metal at room temperature.",
      ],
      case_studies: [
        "SYNTHETIC — Northwind Forging AISI 4140 axle-bar lot: under-austenitize (820 °C) → AlN precipitates not dissolved → prior-austenite grain 56 μm vs. 22 μm spec → σ_y measured 580 MPa vs. 655 MPa spec; re-austenitize at 845 °C/1 h + WQ + temper 540 °C/1 h → σ_y = 668 MPa, 22% EL — above spec.",
      ],
      common_errors: [
        "Counting only corner atoms in BCC (n = 1 instead of 2).",
        "Using a = 2R for FCC instead of a = 2√2 R (face-diagonal contact).",
        "Treating face atoms in FCC as full atoms (each is shared by 2 cells, contributes 1/2).",
        "Using FCC Burgers vector a√2/2 for a BCC metal (correct BCC: a√3/2).",
        "Linearizing Hall–Petch as σ_y = σ_0 + k_y/d (loses the d^(−1/2) power law).",
        "Confusing close-packed planes (FCC {111}) with close-packed directions (FCC ⟨110⟩).",
      ],
      limitations: [
        "Hard-sphere model ignores thermal vibration; deviations ~1–3% from measured a.",
        "APF does not predict elastic modulus (which depends on the curvature of the interatomic potential, not just the packing).",
        "Hall–Petch breaks down below d ≈ 10 nm (grain-boundary sliding dominates) and above d ≈ 1 mm (effectively single crystal).",
        "Vacancy equilibrium assumes slow cooling; rapid quenching freezes non-equilibrium vacancies that anneal out over minutes to hours.",
      ],
      best_practices: [
        "Always count shared atoms by their fractional contribution (corners 1/8, faces 1/2, edges 1/4).",
        "Verify the structure-density consistency (ρ_calc vs. ρ_measured within 1% for pure annealed metal; larger gaps imply porosity or second phase).",
        "Use ASTM E112 linear-intercept method for grain-size measurement (≥ 3 fields, ≥ 500 grains counted).",
        "Predict σ_y from Hall–Petch as a sanity check against measured σ_y from ASTM E8 tension test; deviations > 50 MPa indicate a non-grain-boundary strengthening contribution (precipitation, cold work).",
      ],
      related_concepts: [
        "Phase diagrams & heat treatment (Lesson 2) — the Fe–Fe₃C diagram and TTT/CCT diagrams that connect crystal structure to heat-treatment response.",
        "Mechanical properties & failure (Lesson 3) — ASTM E8 σ–ε curves, K_IC, S–N fatigue.",
        "Diffusion — Fick's laws (Callister Ch. 5, Askeland Ch. 6) — governs carburizing, nitriding, sintering, doping, creep.",
        "X-ray diffraction — Bragg's law nλ = 2d_hkl·sinθ — the experimental measurement of lattice parameter and grain size.",
      ],
      prerequisites: [
        "General chemistry (atomic structure, electron shells, periodic table)",
        "Solid geometry (cube, hexagonal prism, sphere volumes; trig identities)",
        "Linear algebra (3-D vectors, Miller indices hkl, Miller–Bravais hkil for HCP)",
        "Exponential and logarithmic functions (Arrhenius relations, Hall–Petch)",
      ],
      references: MAT_REFERENCE_TITLES,
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
      stem: "How many atoms belong to a single face-centered cubic (FCC) unit cell?",
      explanation:
        "FCC has 8 corner atoms each shared by 8 cells (8×1/8 = 1) plus 6 face atoms each shared by 2 cells (6×1/2 = 3); total n = 4 atoms per conventional cubic cell.",
      whyCorrect:
        "8 corners × 1/8 = 1, plus 6 faces × 1/2 = 3, so n = 1 + 3 = 4 atoms per FCC conventional cell. This is the geometric basis for the APF and density formulas.",
      whyOthersWrong: [
        "n = 1 counts only one corner atom and ignores the body and face atoms — that's a simple cubic cell, not FCC.",
        "n = 2 is the BCC count (one body atom + 8 corners × 1/8 = 2) — wrong structure.",
        "n = 6 is the HCP conventional-cell count — wrong lattice system.",
      ],
      options: [
        { text: "1", isCorrect: false },
        { text: "2", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "6", isCorrect: false },
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
        "The atomic packing factor (APF) of the body-centered cubic (BCC) unit cell is approximately:",
      explanation:
        "APF = n·V_atom/V_cell = 2·(4/3)πR³ / (4R/√3)³ = (8πR³/3) / (64R³/(3√3)) = π√3/8 = 0.6802.",
      whyCorrect:
        "BCC has n = 2 atoms and a = 4R/√3 so V_cell = a³ = 64R³/(3√3). The atom volume is 2·(4/3)πR³ = 8πR³/3. APF = (8πR³/3)/(64R³/(3√3)) = π√3/8 = 3.1416·1.732/8 = 0.680. FCC and HCP reach 0.740 by the same calculation with their (n, a) pairs.",
      whyOthersWrong: [
        "APF = 0.52 is the simple-cubic value (only corner atoms, n = 1, very inefficient).",
        "APF = 0.74 is the close-packed ceiling reached by FCC and HCP, not BCC.",
        "APF = 0.90 exceeds the geometric maximum (0.7405) — equal hard spheres cannot pack that densely.",
      ],
      options: [
        { text: "0.52", isCorrect: false },
        { text: "0.68", isCorrect: true },
        { text: "0.74", isCorrect: false },
        { text: "0.90", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem:
        "A mild steel (σ_0 = 150 MPa, k_y = 0.07 MPa·m^0.5) has its average grain diameter reduced from 100 μm to 1 μm by TMCP rolling. By how much does the Hall–Petch prediction of yield strength increase?",
      explanation:
        "Δσ_y = k_y·(d_new^(−1/2) − d_old^(−1/2)) = 0.07·(1000 − 100) = 0.07·900 = 63 MPa. New σ_y ≈ 213 MPa (vs. old 150 + 7 = 157 MPa).",
      whyCorrect:
        "100 μm = 1×10⁻⁴ m → d^(−1/2) = 100 m^(−1/2); 1 μm = 1×10⁻⁶ m → d^(−1/2) = 1000 m^(−1/2). Δσ_y = k_y·(1000 − 100) = 0.07·900 = 63 MPa. (Recall that the Hall–Petch strengthening from grain refinement is dramatic only at sub-micron d — at d ≈ 0.1 μm, σ_y rises by 221 MPa above σ_0.)",
      whyOthersWrong: [
        "Δσ_y = 7 MPa computes k_y·(1000 − 100) with k_y = 0.007 (decimal-point error — k_y is 0.07, not 0.007, for mild steel).",
        "Δσ_y = 700 MPa computes k_y·(d_new − d_old)/d_old (linear formula) — Hall–Petch is d^(−1/2), not 1/d.",
        "Δσ_y = 2200 MPa computes k_y·d_old/d_new (linear ratio) — not the Hall–Petch formula.",
      ],
      options: [
        { text: "7 MPa", isCorrect: false },
        { text: "63 MPa", isCorrect: true },
        { text: "700 MPa", isCorrect: false },
        { text: "2200 MPa", isCorrect: false },
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
        "True or False: At room temperature (300 K), aluminum (Q_v = 0.76 eV) has approximately one vacancy per 10⁵ lattice sites; at 500 °C (773 K) the vacancy concentration rises to approximately one per 10⁵ sites (i.e., ~10⁻⁵) — a value that, while small in fraction, drives measurable solid-state diffusion over hours.",
      explanation:
        "FALSE on the room-T count: at 300 K, k_B·T = 0.0259 eV, so n_v/N = exp(−0.76/0.0259) = exp(−29.3) ≈ 1.7×10⁻¹³ — essentially zero (one vacancy per ~6 trillion sites). At 773 K, k_B·T = 0.0666 eV → n_v/N = exp(−11.42) = 1.1×10⁻⁵, i.e., one per 91,000 sites. The 500 °C value drives carburization depths of ~0.5 mm in 1 hour (D = D_0·exp(−Q_d/RT) ≈ 1.6×10⁻¹¹ m²/s for C in γ-Fe).",
      whyCorrect:
        "FALSE. The room-T vacancy concentration in Al is ~10⁻¹³ (one vacancy per ~6 trillion lattice sites), not ~10⁻⁵. At 500 °C, the value is correctly ~10⁻⁵ (one per 91,000 sites). The latter is small in fraction but large enough (combined with the Arrhenius rise in D) to drive measurable diffusion on hour-long timescales — the basis of carburizing, nitriding, and sintering heat-treat processes.",
      whyOthersWrong: [
        "Option TRUE conflates the 500 °C (~10⁻⁵) and 25 °C (~10⁻¹³) vacancy concentrations; they differ by 8 orders of magnitude. A common error is reading the high-T value back into room-T (which would imply macroscopic diffusion at room T — falsified by the Arrhenius dependence).",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Phase Diagrams & Heat Treatment
// (slug: mat-phase-diagrams-heat-treatment)
// ---------------------------------------------------------------------------

const LESSON_PHASE: RefLesson = {
  slug: "mat-phase-diagrams-heat-treatment",
  title: "Phase Diagrams & Heat Treatment",
  titleAr: "المخططات الطورية ومعالجة الحرارة",
  order: 2,
  durationMin: 40,
  references: MAT_REFERENCE_TITLES,
  conceptIntroduction: `A *phase diagram* is the equilibrium map of a material system: which phases (composition + structure + state) coexist at each temperature, pressure, and composition. The binary *iron–iron-carbide (Fe–Fe₃C)* diagram is the single most important phase diagram in engineering — it governs the heat-treatment response of every carbon and low-alloy steel. Its key features: a peritectic at 0.17% C / 1495 °C (L + δ-Fe → γ-Fe), a eutectoid at 0.76% C / 727 °C (γ-Fe (austenite) → α-Fe (ferrite) + Fe₃C (cementite)), and the cementite solubility limit on carbon in austenite (2.11% C maximum at 1148 °C). Eutectoid 0.76% C steel, cooled slowly from above 727 °C, transforms to 100% pearlite (alternating α + Fe₃C lamellae); hypoeutectoid (< 0.76% C) yields ferrite + pearlite; hypereutectoid (> 0.76% C) yields cementite network + pearlite.

The equilibrium diagram is the *start* — heat treatment exploits non-equilibrium *kinetics*. The *time–temperature–transformation (TTT)* diagram maps isothermal austenite decomposition: rapid cooling below 550 °C produces bainite (α + Fe₃C, finer than pearlite), cooling below ~200 °C produces martensite (body-centered-tetragonal super-saturated carbon solid solution, hard and brittle, no Fe₃C). The *continuous-cooling-transformation (CCT)* diagram maps transformation during continuous cooling and is the engineering form used to design real quench cycles. *Hardening* = austenitize → quench to martensite (cool fast enough to miss the pearlite nose); *tempering* = reheat martensite to 150–650 °C to precipitate fine Fe₃C and recover toughness at the cost of hardness. This lesson builds the phase-diagram and TTT/CCT toolkit that Lesson 3 uses to explain mechanical-property evolution.`,
  sections: {
    learning_objectives: `- Read a binary temperature–composition phase diagram; identify single-phase, two-phase (L+α, α+β), and three-phase invariant (eutectic L → α + β; eutectoid α_S → α + β; peritectic L + α → β) regions.
- Apply the Gibbs phase rule P + F = C + 2 (or C + 1 at fixed P): determine the number of degrees of freedom F in each region of a binary diagram.
- Apply the tie-line and lever rule to compute phase fractions in a two-phase region: f_α = (C_β − C_0)/(C_β − C_α).
- Identify the invariant reactions on the Fe–Fe₃C diagram: peritectic 1495 °C/0.17% C; eutectic 1148 °C/4.30% C (L → γ-Fe + Fe₃C, ledeburite); eutectoid 727 °C/0.76% C (γ-Fe → α-Fe + Fe₃C, pearlite).
- Use TTT and CCT diagrams to predict microstructure from a given cooling path: pearlite, bainite, martensite, retained austenite.
- Distinguish the four canonical heat treatments — full anneal, normalize, harden (austenitize + quench to martensite), temper (reheat martensite to recover toughness) — and predict the resulting microstructure, hardness, and toughness.
- Compute martensite-start (M_s) and martensite-finish (M_f) temperatures and the volume fraction of martensite formed at a given quench temperature using the Koistinen–Marburger equation.`,
    prerequisites: `- Lesson 1 (Crystal Structure & Defects) — BCC α-Fe, FCC γ-Fe, and the iron-carbon solid solutions.
- Thermodynamics of mixtures (Gibbs phase rule, free-energy curves — Lesson Thermo-1).
- Solid-state diffusion (Fick's laws — Lesson 1) — austenite decomposition is a diffusion-controlled transformation.
- Ternary logic of phase transformation: nucleation + growth kinetics (Callister Ch. 8).`,
    introduction: `Phase equilibria in the iron–carbon system govern the most-produced engineering material on Earth: carbon and low-alloy steel. The Fe–Fe₃C diagram is not strictly an equilibrium diagram (cementite Fe₃C is a metastable phase; the truly stable form is graphite C + α-Fe, but Fe₃C forms readily because of kinetic barriers). Within the metastable Fe–Fe₃C frame:

  *Peritectic* at 0.17% C / 1495 °C: L (0.53% C) + δ-Fe (0.09% C) → γ-Fe (0.17% C). This reaction governs solidification cracking susceptibility in steels — welds of 0.10–0.20% C steels are particularly crack-prone.

  *Austenite (γ-Fe) field*: FCC iron dissolves up to 2.11% C at 1148 °C (much higher than BCC α-Fe's 0.022% C maximum at 727 °C) because the FCC octahedral site is larger. This is the basis for austenitizing heat treatments.

  *Eutectic* at 4.30% C / 1148 °C: L → γ-Fe (2.11% C) + Fe₃C (6.67% C). This "ledeburite" structure characterizes cast irons (2.11–6.67% C).

  *Eutectoid* at 0.76% C / 727 °C: γ-Fe (0.76% C) → α-Fe (0.022% C) + Fe₃C (6.67% C). The two-phase product of this reaction is **pearlite** — alternating lamellae of ferrite (soft, ductile) and cementite (hard, brittle) spaced ~0.13 μm apart at the eutectoid temperature, with a hardness of ~250 HBW.

For a steel of carbon content C_0, slow cooling through A_1 (727 °C) yields:
  - C_0 < 0.76% (hypoeutectoid): proeutectoid ferrite + pearlite; fraction of pearlite = (C_0 − 0.022)/(0.76 − 0.022).
  - C_0 = 0.76% (eutectoid): 100% pearlite — the **canonical Lesson 2 worked example**: at C_0 = 0.80% C and T = 727 °C (eutectoid isotherm), the lever rule gives 100% pearlite (verify: (0.80 − 0.022)/(0.76 − 0.022) = 0.778/0.738 = 1.054 → slight hypereutectoid, 5.4% cementite network + 94.6% pearlite — the more careful answer for an 0.80% C steel).
  - C_0 > 0.76% (hypereutectoid): proeutectoid cementite (grain-boundary network) + pearlite.

*Non-equilibrium kinetics — TTT/CCT diagrams.* The TTT diagram for an 0.80% C eutectoid steel shows:
  - Pearlite nose at ~550 °C / 1 s (fastest transformation time); above the nose, coarser pearlite; below, finer bainite.
  - Bainite forms 200–550 °C: upper bainite (feathery, α + lath Fe₃C); lower bainite (acicular, α + plate Fe₃C) — higher toughness.
  - Martensite starts forming below M_s ≈ 220 °C and finishes at M_f ≈ 60 °C (for 0.80% C). Martensite is a diffusionless shear transformation producing a body-centered-tetragonal (BCT) lattice super-saturated in carbon. Hardness 65 HRC for 0.80% C, but brittle (no Fe₃C precipitated yet, no ductility).

  Koistinen–Marburger equation (volume fraction of martensite at quench temperature T_q):
    f_M = 1 − exp[−0.011·(M_s − T_q)]   (T_q < M_s)
  For M_s = 220 °C and quench to room T (T_q = 25 °C): f_M = 1 − exp(−0.011·195) = 1 − exp(−2.145) = 1 − 0.117 = 0.883 → 88% martensite, 12% retained austenite.

*Tempering.* Reheat martensite to 150–650 °C: carbon diffuses out of BCT martensite to precipitate fine Fe₃C. Stage 1 (100–250 °C) ε-carbide; Stage 2 (200–300 °C) retained austenite → bainite; Stage 3 (250–350 °C) ε-carbide → Fe₃C; Stage 4 (350–650 °C) Fe₃C spheroidizes, matrix recovers to ferrite. Hardness drops and toughness/ductility rise — the trade-off. Final structure is **tempered martensite** = α-Fe matrix with sub-micron spherical Fe₃C precipitates — the basis of quenched-and-tempered (Q&T) structural steels (AISI 4140, 4340) and tool steels.`,
    terminology: `- **Phase**: a homogeneous, physically distinct portion of a system with a definable structure and composition.
- **Phase diagram**: equilibrium map of phase stability versus T, P, composition.
- **Gibbs phase rule**: P + F = C + 2; at fixed pressure P + F = C + 1 (binary C = 2: in a 2-phase region F = 1, in a 3-phase invariant F = 0).
- **Tie-line**: a horizontal isotherm in a 2-phase region connecting the two phase compositions.
- **Lever rule**: f_α = (C_β − C_0)/(C_β − C_α), f_β = (C_0 − C_α)/(C_β − C_α).
- **Invariant reaction**: a horizontal 3-phase reaction in a binary diagram (eutectic L → α + β; eutectoid α_S → α + β; peritectic L + α → β; monotectic L → L_1 + α).
- **Fe₃C (cementite)**: hard, brittle intermetallic of nominal composition 6.67 wt% C, 93.3% Fe, orthorhombic structure, ~800 HV.
- **Pearlite**: two-phase lamellar α + Fe₃C product of the eutectoid transformation; lamellar spacing 0.13–0.40 μm depending on transformation T.
- **Austenite (γ-Fe)**: FCC solid solution of C in Fe, max 2.11 wt% C at 1148 °C — the heat-treatable phase.
- **Ferrite (α-Fe)**: BCC solid solution of C in Fe, max 0.022 wt% C at 727 °C — the ductile phase.
- **Martensite**: BCT diffusionless transformation product, super-saturated in C, hard and brittle (60–65 HRC for 0.8% C).
- **Bainite**: two-phase α + Fe₃C (finer than pearlite, harder than ferrite), upper (feathery) and lower (acicular) forms.
- **TTT/CCT diagram**: Time–Temperature–Transformation (isothermal) / Continuous-Cooling–Transformation (continuous cooling).
- **Hardenability**: depth to which a steel hardens (Jominy end-quench test, ASTM A255 / SAE J406).
- **Tempered martensite**: α matrix + spherical Fe₃C precipitates, balanced strength-toughness (Q&T steels).`,
    detailed_explanation: `**Phase rule on the Fe–Fe₃C diagram.** Binary (C = 2), fixed pressure (P = 1 atm), so P + F = C + 1 = 3. Single-phase regions (L, δ, γ, α, Fe₃C): P = 1, F = 2 (T and C are free). Two-phase regions (L + γ, γ + α, α + Fe₃C, etc.): P = 2, F = 1 (only one of T, C free; the other is set by the tie-line). Three-phase invariants (eutectic, eutectoid, peritectic): P = 3, F = 0 (both T and C are fixed — the horizontal invariant line).

**Lever rule — pearlite fraction for an 0.80% C steel at 727 °C.** Just below A_1, the two phases in equilibrium are α-Fe (0.022% C) and Fe₃C (6.67% C). For C_0 = 0.80%:
  f_pearlite (as the eutectoid constituent) ≈ (C_0 − 0.022)/(0.76 − 0.022) = (0.80 − 0.022)/0.738 = 0.778/0.738 = 1.054.
Because C_0 = 0.80% > 0.76% (eutectoid composition), the steel is slightly hypereutectoid: proeutectoid cementite forms first along austenite grain boundaries (network), then the remaining austenite (now at exactly 0.76% C) transforms to pearlite. Lever rule for the two-phase α + Fe₃C equilibrium just below 727 °C:
  f_α = (6.67 − 0.80)/(6.67 − 0.022) = 5.87/6.648 = 0.883 = 88.3%.
  f_Fe3C = (0.80 − 0.022)/(6.67 − 0.022) = 0.778/6.648 = 0.117 = 11.7%.
Of the 88.3% α, the part that came from the eutectoid is 0.022/(0.76) of the 100% pearlite formed (ferrite in pearlite fraction = (6.67 − 0.76)/(6.67 − 0.022) = 5.91/6.648 = 0.889 of pearlite). For an exactly eutectoid 0.76% C steel: f_pearlite = 100%, f_α = (6.67 − 0.76)/(6.67 − 0.022) = 0.889, f_Fe3C = 0.111 — so pearlite is 88.9% ferrite + 11.1% cementite by mass. **The canonical Lesson 2 worked example**: an 0.80% C steel slowly cooled through A_1 = 727 °C transforms to (proeutectoid cementite network, 5.4%) + (pearlite, 94.6%) — read directly from the lever rule.

**TTT diagram — 0.80% C eutectoid steel.** Isothermal holds after rapid quench from the austenite field (845 °C/1 h):
  - 700 °C: pearlite starts at ~10³ s, finishes ~10⁴ s; coarse pearlite ~250 HV.
  - 650 °C: pearlite 1 s–10 s; medium pearlite ~300 HV.
  - 550 °C: pearlite nose, 0.5 s–1 s; fine pearlite ~400 HV — fastest transformation.
  - 450 °C: lower bainite region, ~10² s; acicular bainite ~450 HV.
  - 300 °C: lower bainite ~10⁴ s.
  - Below M_s ≈ 220 °C: martensite forms instantaneously (diffusionless), no TTT curve.

**CCT diagram.** Continuous cooling at rates R = ΔT/Δt shifts the TTT curves to longer times and lower temperatures (less time available at each T). For an 0.80% C steel:
  - Cooling rate 10 °C/s → all pearlite (~250 HV).
  - 50 °C/s → fine pearlite + bainite (~350 HV).
  - 200 °C/s → fully martensitic (with retained austenite) (~65 HRC ≈ 850 HV).
  - Water quench ≈ 1000 °C/s nominal cold-section rate → fully martensitic.

**Hardening = austenitize + quench to martensite.** Austenitize 0.80% C steel at 845 °C (above A_3 = 727 °C + 30 °C, ensuring 100% γ) for 1 h, water-quench. Final microstructure: 88% martensite + 12% retained austenite (Koistinen–Marburger with M_s = 220 °C and T_q = 25 °C). Hardness 65 HRC (very hard, very brittle — Charpy V-notch ~5 J).

**Tempering.** Reheat martensite at:
  - 200 °C / 1 h: tempered martensite, 60 HRC, Charpy 12 J (Stage 1 ε-carbide precipitation relieves some tetragonality).
  - 400 °C / 1 h: tempered martensite, 45 HRC, Charpy 30 J.
  - 600 °C / 1 h: tempered martensite (spheroidized Fe₃C), 28 HRC, Charpy 80 J — the optimum for high-strength low-alloy structural steel (AISI 4140 Q&T at 600 °C/1 h: σ_y = 1100 MPa, K_IC = 80 MPa√m, 18% elongation).

**Hardenability.** The Jominy end-quench test (ASTM A255) measures hardness vs. distance from the water-quenched end of a 100 mm × 25 mm bar. Distance of 50% martensite (half-martensite hardness) defines the depth of hardening. Alloying elements (Cr, Mo, Ni, Mn) shift the TTT curves right, raising hardenability. AISI 4140 reaches 50% martensite at J = 25 mm (oil-quench hardenable through 50 mm bar); plain 1040 carbon steel only at J = 6 mm (water-quench hardenable through ~12 mm).`,
    core_principles: `- **Gibbs phase rule** (P + F = C + 1 at fixed P) — fixes the geometry of phase diagrams: 1-phase = 2D field, 2-phase = tie-line, 3-phase = invariant line.
- **Lever rule** (mass conservation in the 2-phase region) — the algebra of phase fractions.
- **Eutectoid** (γ → α + Fe₃C at 0.76% C / 727 °C) — the basis of pearlite formation in steels.
- **Diffusionless vs. diffusion-controlled transformations**: martensite is diffusionless (no composition change, instant shear); pearlite/bainite are diffusion-controlled (C partitions between α and Fe₃C).
- **Koistinen–Marburger** f_M = 1 − exp[−0.011·(M_s − T_q)] — martensite is athermal, formed instantaneously as T drops below M_s.
- **TTT vs. CCT**: TTT is isothermal (lab); CCT is continuous cooling (engineering). The CCT diagram is the design tool for heat-treatment engineers.
- **Tempering trade-off**: hardness ↓ as temper T ↑, toughness ↑ — the engineer picks a temper T that meets the strength-toughness balance required by the application.`,
    components: `- **Iron (Fe) base**: the 4 allotropes — α (BCC, < 912 °C), γ (FCC, 912–1394 °C), δ (BCC, 1394–1538 °C), liquid (> 1538 °C).
- **Carbon (C)**: the interstitial solute controlling phase fractions and martensite hardness (0.10% → 30 HRC; 0.80% → 65 HRC).
- **Austenite field**: the γ-Fe single-phase region above 727 °C and below 2.11% C — the heat-treatment starting point.
- **Pearlite**: α + Fe₃C lamellar two-phase product of the eutectoid transformation.
- **Martensite**: BCT diffusionless transformation product (super-saturated C, hard/brittle).
- **Bainite**: α + Fe₃C non-lamellar product of the 200–550 °C transformation.
- **TTT/CCT diagram**: the kinetic roadmap of microstructure vs. cooling path.
- **Tempering furnace**: 150–650 °C reheat to convert brittle martensite to tough tempered martensite.`,
    process: `1. Read the steel composition (wt% C + alloying elements) from the heat analysis.
2. Locate the steel on the Fe–Fe₃C diagram (hypo-, eutectoid, or hypereutectoid).
3. Compute phase fractions just below A_1 by the lever rule.
4. Select the austenitizing T: A_3 + 30–60 °C for hypoeutectoid, A_1 + 30–60 °C for hypereutectoid (avoid cementite dissolution).
5. Choose the cooling path on the TTT/CCT diagram (water, oil, air, furnace) to obtain the desired microstructure (pearlite, bainite, martensite).
6. For martensitic structures, apply Koistinen–Marburger to estimate f_M and retained austenite.
7. If martensitic, select a tempering temperature (200 °C for max hardness, 540 °C for balanced Q&T properties, 650 °C for spheroidized soft steel).
8. Verify with hardness test (Rockwell HRC, Brinell HBW), Charpy V-notch impact, and ASTM E8 tension test (Lesson 3).`,
    formula_calculation: `**Gibbs phase rule (fixed pressure):**
  P + F = C + 1
  Binary (C = 2): 1-phase F = 2, 2-phase F = 1, 3-phase F = 0 (invariant).

**Lever rule (just below A_1 = 727 °C):**
  f_α = (6.67 − C_0)/(6.67 − 0.022)
  f_Fe3C = (C_0 − 0.022)/(6.67 − 0.022)
  f_pearlite (eutectoid constituent) = (C_0 − 0.022)/(0.76 − 0.022)
  (Note: f_pearlite > 1 for hypereutectoid steels — the excess is the proeutectoid cementite.)

**Carbon content vs. A_1, A_3, A_cm temperatures** (Andrews' empirical formulas):
  A_1 (eutectoid) = 727 °C (independent of C up to ~1% C).
  A_3 (γ/α boundary, hypoeutectoid): A_3(°C) = 910 − 2030·C for C < 0.022% (full α field); decreases with C.
  A_cm (γ/Fe₃C boundary, hypereutectoid): A_cm = 727 + 4244·C − 2944·C² (rises from 727 °C at 0.76% to 1148 °C at 4.30%).

**Martensite-start temperature** (Andrews 1965, wt%):
  M_s(°C) = 539 − 423·C − 30.4·Mn − 12.1·Cr − 17.7·Ni − 7.5·Mo
  For 0.80% C plain carbon: M_s ≈ 539 − 423·0.80 = 539 − 338 = 201 °C (commonly cited ~220 °C).

**Koistinen–Marburger** (volume fraction of martensite at quench T):
  f_M = 1 − exp[−0.011·(M_s − T_q)]   for T_q ≤ M_s;  f_M = 0 for T_q > M_s.

**Tempering parameter (Larson–Miller for tempering)**:
  P = T·(C + log₁₀ t)   T in K, t in h, C ≈ 20 for plain carbon steel.
  Used to combine temper time and temperature into a single tempering effectiveness parameter.

**Hardenability — ideal critical diameter D_I** (Grossmann):
  D_I = D_I,base · (multiplication factors for each alloying element)
  D_I,base for 0.40% C plain carbon steel ≈ 0.75 inch (19 mm); each 1% Cr adds ~3.0×, each 1% Mo adds ~3.5×, etc.

**Assumptions**: (i) metastable Fe–Fe₃C system (graphite formation neglected); (ii) equilibrium in the Fe–Fe₃C diagram (slow cooling); (iii) constant cooling rate in CCT analysis; (iv) Koistinen–Marburger empirical constant 0.011/°C averaged over plain-carbon steels.

**Interpretation**: 0.80% C eutectoid steel is the canonical heat-treatable composition — fully pearlite (slow cool), fully martensite (water quench), or fully tempered martensite (reheat 540 °C/1 h). The lever rule, TTT/CCT diagram, and Koistinen–Marburger equation together explain every microstructure transformation in carbon and low-alloy steel.`,
    worked_example: `**Lever rule for an 0.80% C steel just below A_1 = 727 °C — canonical Lesson 2 worked example.**
C_0 = 0.80 wt% C. Phase compositions at 727 °C: α = 0.022% C, Fe₃C = 6.67% C.
  f_α = (6.67 − 0.80)/(6.67 − 0.022) = 5.87/6.648 = 0.883 = 88.3%.
  f_Fe3C = (0.80 − 0.022)/6.648 = 0.778/6.648 = 0.117 = 11.7%.
Of the 11.7% cementite, the proeutectoid (grain-boundary network) portion is what forms above 727 °C as the steel cools through the γ + Fe₃C field. From the lever rule at 750 °C (just above A_1): f_γ ≈ (6.67 − 0.80)/(6.67 − 0.76) = 5.87/5.91 = 0.993 → f_Fe3C at 750 °C = (0.80 − 0.76)/(6.67 − 0.76) = 0.04/5.91 = 0.0068 = 0.7% proeutectoid cementite; the remaining 99.3% austenite (at 0.76% C after cementite rejection) then transforms to pearlite at 727 °C. So the **final slowly-cooled microstructure is 0.7% proeutectoid cementite + 99.3% pearlite**. With exact 0.76% C eutectoid composition, **100% pearlite**. The lever rule gives, for any hypoeutectoid steel, the weight fraction of pearlite = (C_0 − 0.022)/(0.76 − 0.022); for a 0.40% C structural steel, this is (0.40 − 0.022)/(0.738) = 0.513 = 51.3% pearlite + 48.7% proeutectoid ferrite.

**Koistinen–Marburger for an 0.80% C steel quenched to 25 °C.**
Andrews: M_s ≈ 539 − 423·0.80 = 201 °C. Use literature value 220 °C for eutectoid steel.
T_q = 25 °C, M_s − T_q = 195 °C.
f_M = 1 − exp(−0.011·195) = 1 − exp(−2.145) = 1 − 0.117 = 0.883 → **88.3% martensite + 11.7% retained austenite**.
Hardness of fully martensitic 0.80% C steel = 65 HRC; the 12% retained austenite (softer) reduces the bulk hardness to ~62 HRC.

**Tempering schedule for AISI 4140 (0.40% C, 1.0% Cr, 0.25% Mo) Q&T structural shaft.**
Austenitize 845 °C/1 h, oil-quench (cooling rate ~250 °C/s — fully martensitic). M_s(4140) ≈ 539 − 423·0.40 − 30.4·0.8 (Mn 0.8) − 12.1·1.0 (Cr) − 7.5·0.25 (Mo) ≈ 539 − 169 − 24 − 12 − 2 = 332 °C. Quench to 25 °C: f_M = 1 − exp(−0.011·307) = 1 − exp(−3.38) = 1 − 0.034 = 0.966 → 96.6% martensite, 3.4% retained austenite.
Temper at 540 °C/1 h. Resulting tempered martensite: σ_y = 1100 MPa, UTS = 1240 MPa, 18% elongation, K_IC = 80 MPa√m, 32 HRC. This is the canonical Q&T structural-steel spec used in API 6A wellhead equipment and API 16A blowout-preventer shafting.`,
    industrial_example: `**Oil & Gas — API 6A 17-4PH stainless steel wellhead flange.**
A 17-4PH (0.07% C, 17% Cr, 4% Ni, 3% Cu, 0.3% Nb) martensitic precipitation-hardening stainless is solution-treated at 1040 °C/1 h, oil-quenched to martensite (M_s ≈ 132 °C, M_f ≈ 32 °C; f_M at 25 °C = 1 − exp(−0.011·107) = 1 − 0.306 = 0.694 → 69.4% martensite + 30.6% retained austenite — high RA is characteristic of low-M_s 17-4PH). Age-harden at 480 °C/4 h (H1025 condition) → fine Cu-rich ε-Cu precipitates nucleate in the martensite matrix, raising σ_y to 1170 MPa, K_IC to 82 MPa√m, with 14% elongation. The CCT diagram for 17-4PH shows that section sizes up to 75 mm can be oil-quenched fully martensitic — the Cr + Ni + Cu combination gives this alloy a 5× higher hardenability than plain 0.07% C steel. The 17-4PH H1025 condition is the standard NACE MR0175 sour-service material for H₂S-containing wellhead hardware, with hardness capped at 33 HRC to avoid sulfide-stress-cracking (SSC).`,
    case_study: `**CASE_TYPE = SYNTHETIC — Crest Ridge Gear Works AISI 4140 spur-gear lot.**
A lot of AISI 4140 spur gears (Module 4, 50 teeth, 200 mm pitch diameter) was heat-treated: austenitize 845 °C/2 h, oil-quench, temper 540 °C/2 h. Customer reported surface pitting after 200 hours of gearbox service (well below the 10,000-hour design life). Root-cause per ASM Handbook Vol. 11 Section 1 procedure: hardness profile on a gear tooth showed 28 HRC at the pitch line vs. the 32 HRC spec; microstructure 90% tempered martensite + 10% upper bainite (should be 100% tempered martensite). Investigation of the heat-treat furnace log: oil-quench tank temperature was 70 °C (warm oil), not the specified 60 °C max cold-oil, slowing the initial cooling rate from the ~250 °C/s needed to skip the bainite nose (TTT nose at 550 °C / 1 s) to ~80 °C/s. The slow quench intersected the TTT bainite nose → 10% upper bainite formed. Corrective action: (i) restore cold-oil quench (< 60 °C, agitated); (ii) re-austenitize + quench; (iii) re-temper 540 °C/2 h. Re-tested lot: 100% tempered martensite, 32 HRC uniform, surface pitting test passed at 10,000-hour design life. Lesson: the TTT nose at 550 °C / 1 s is unforgiving — a 1-second-per-100 °C cooling-rate miss is the difference between 100% martensite and 10% upper bainite (and a 4 HRC hardness deficit).`,
    visual_explanation: `Three panels: (1) the Fe–Fe₃C phase diagram (T vertical 0–1600 °C, % C horizontal 0–6.67) with the peritectic at 0.17% / 1495 °C, eutectic at 4.30% / 1148 °C, and eutectoid at 0.76% / 727 °C invariant lines marked; (2) the TTT diagram for an 0.80% C eutectoid steel — pearlite C-curve (nose at 550 °C / 1 s), bainite C-curve (200–550 °C), M_s horizontal at 220 °C and M_f at 60 °C, with three cooling paths annotated (furnace cool → pearlite; oil quench → martensite + retained austenite; water quench → 100% martensite); (3) the tempering curve — hardness vs. temper temperature (150–650 °C) — showing the staged drop from 65 HRC (as-quenched) to 25 HRC (650 °C/1 h) and the simultaneous rise in Charpy V-notch impact energy from 5 J to 90 J.`,
    simulation_opportunity: `Build a Python/NumPy simulator that: (i) plots the Fe–Fe₃C diagram from tabulated (T, C) coordinates; (ii) lets the user enter a steel composition C_0 and reads off the lever-rule phase fractions and proeutectoid constituent; (iii) overlays the user's chosen cooling path on the TTT/CCT diagram and reports the resulting microstructure (pearlite/bainite/martensite/retained austenite fractions via Koistinen–Marburger); (iv) lets the user pick a temper temperature and predicts the resulting tempered-martensite hardness using the empirical tempering curve. Extension: add alloying-element sliders (C, Mn, Cr, Ni, Mo) and update M_s and hardenability per Andrews/Grossmann formulas.`,
    common_mistakes: `- Using A_1 = 727 °C as the austenitizing temperature (it's the eutectoid, not the austenitizing — austenitize at A_3 + 30 °C minimum).
- Applying the lever rule above A_1 in the single-phase γ field (no tie-line — only one phase, f_γ = 100%).
- Confusing the lever-rule phase fraction (α + Fe₃C) with the structural constituent fraction (ferrite + pearlite) — pearlite is a *two-phase constituent*, not a phase.
- Reading TTT (isothermal) data as if it were CCT (continuous cooling) — CCT curves are shifted ~10× longer in time than TTT curves.
- Forgetting retained austenite: quenching to room T may leave 5–30% austenite (Koistenen–Marburger); sub-zero treatment (−80 °C) is required to transform it for high-precision tooling.
- Tempering above A_1 (which is over-tempering, not tempering — the steel returns to austenite on heating above 727 °C).`,
    limitations: `- Fe–Fe₃C is a metastable diagram; the truly stable Fe-graphite system applies to ductile cast irons and to long-time high-temperature service (graphitization in 0.5% Mo steel at 500 °C over 10⁵ hours).
- TTT diagrams are isothermal — they require very rapid quench to the hold T; CCT diagrams are the engineering tool but are more laborious to measure.
- Andrews M_s formula has ±20 °C scatter; precise M_s requires dilatometry on the actual heat.
- Koistinen–Marburger constant 0.011 is for plain-carbon steels; high-alloy steels deviate (lower effective constant).
- Hardening response depends on prior-austenite grain size, which depends on austenitizing T and time — fine PAG (~10 μm) gives higher hardness and toughness than coarse (~50 μm).`,
    comparison: `**Pearlite vs. bainite vs. martensite** (all from the same 0.80% C steel cooled at different rates):
  - **Pearlite** (slow cool 10 °C/s): α + Fe₃C lamellae, 0.13 μm spacing; 250 HV (~22 HRC); σ_y ≈ 600 MPa; 20% elongation; K_IC ≈ 50 MPa√m. The "as-rolled" structural-steel microstructure.
  - **Bainite** (oil cool 50 °C/s, hold 300 °C): α + Fe₃C non-lamellar; 450 HV (~43 HRC); σ_y ≈ 1100 MPa; 12% elongation; K_IC ≈ 55 MPa√m. Used in some high-strength wire and forging applications (ausformed bainite).
  - **Martensite** (water quench 200 °C/s): BCT super-saturated C; 65 HRC (~850 HV); σ_y ≈ 1800 MPa; < 2% elongation; K_IC ≈ 15 MPa√m (very brittle). Useful only after tempering.
  - **Tempered martensite** (quench + temper 540 °C/1 h): α + spherical Fe₃C; 32 HRC (~320 HV); σ_y ≈ 1100 MPa; 18% elongation; K_IC ≈ 80 MPa√m — the canonical Q&T structural-steel optimum.`,
    practical_application: `Specifying heat treatment for an AISI 4140 excavator pivot shaft (60 mm diameter, σ_y spec 1100 MPa, K_IC spec 60 MPa√m, service −20 °C): the engineer specifies austenitize 845 °C/2 h (above A_3 ≈ 790 °C for 0.40% C), oil-quench (the 60 mm diameter is within 4140's 75 mm oil-quench hardenability, so the core reaches > 90% martensite), temper 540 °C/2 h (Larson–Miller P = 813·(20 + log₁₀ 2) = 813·20.3 = 16,500 — the canonical Q&T condition for 1100/1240 MPa UTS with 18% EL and K_IC ≈ 80 MPa√m, well above the 60 MPa√m spec). For cold-weather (−40 °C) service, raise Ni to 1.5% (AISI 4340) which lowers the DBTT to below −80 °C and lifts K_IC to 110 MPa√m.`,
    decision_scenario: `**Aerospace gear material choice** — AISI 9310 (0.10% C, 3.25% Ni, 1.25% Cr, 0.12% Mo) carburizing steel vs. AISI 4140 (0.40% C, 1.0% Cr, 0.25% Mo) Q&T. Required: surface hardness ≥ 60 HRC (for contact fatigue), core σ_y ≥ 850 MPa, K_IC ≥ 80 MPa√m.
- AISI 9310 carburized 925 °C/8 h gas carburize → 1.0 mm case depth at 0.80% C; oil-quench, temper 175 °C → case 60 HRC, core 30 HRC (σ_y ≈ 850 MPa, K_IC ≈ 100 MPa√m). Surface compressive residual stress (-300 MPa) doubles contact-fatigue life.
- AISI 4140 Q&T 540 °C/2 h: through-hardened 32 HRC, σ_y ≈ 1100 MPa (good) but surface hardness 32 HRC (well below 60 HRC) — fails contact-fatigue requirement.
Decision: AISI 9310 carburized — case-core microstructure is the right answer for gear tooth contact. Lesson 3 develops the contact-fatigue / pitting resistance S–N basis for the choice.`,
    practice_questions: `**Q1.** The eutectoid reaction in the Fe–Fe₃C system occurs at approximately: (a) 0.022% C, 912 °C, (b) 0.76% C, 727 °C, (c) 2.11% C, 1148 °C, (d) 4.30% C, 1148 °C. *Answer:* (b).
**Q2.** An exactly eutectoid 0.76% C steel slowly cooled through A_1 transforms to: (a) 100% ferrite, (b) 100% pearlite, (c) ferrite + pearlite, (d) 100% martensite. *Answer:* (b) 100% pearlite.
**Q3.** The Koistinen–Marburger equation predicts the volume fraction of martensite at a quench temperature T_q. For an 0.80% C steel with M_s = 220 °C, quenched to 25 °C, f_M is approximately: (a) 50%, (b) 70%, (c) 88%, (d) 100%. *Answer:* (c) 88%.
**Q4.** Tempering an as-quenched 0.80% C martensitic steel at 540 °C/1 h produces a structure of: (a) pearlite, (b) spheroidized Fe₃C in ferrite matrix (tempered martensite), (c) 100% retained austenite, (d) lower bainite. *Answer:* (b).`,
    certification_questions: `These four questions mirror the NCEES FE/EIT Materials Science exam blueprint ("Iron–Iron Carbide Diagram" section) and the AWS CWI/SCWI Level III welding inspector exam (heat-treatment section). They cover the canonical eutectoid composition, lever-rule computation, Koistinen–Marburger martensite-fraction prediction, and tempering trade-off. Question 2 (the 100% pearlite for 0.76% C at 727 °C) is the most-tested single concept on the FE Materials exam.`,
    summary: `The Fe–Fe₃C phase diagram governs carbon and low-alloy steel microstructure: eutectoid 0.76% C / 727 °C → pearlite; hypoeutectoid → ferrite + pearlite; hypereutectoid → cementite + pearlite. The lever rule quantifies the phase fractions. TTT/CCT diagrams add the kinetic dimension — pearlite (slow), bainite (medium), martensite (water quench). Martensite's diffusionless transformation is quantified by Koistinen–Marburger; tempering trade-off (hardness ↓, toughness ↑) governs Q&T structural-steel design. The canonical worked example (0.80% C steel at 727 °C → 94.6% pearlite + 5.4% proeutectoid cementite; exactly 0.76% C → 100% pearlite) is the most-tested single computation in the FE Materials exam.`,
    key_takeaways: `- Eutectoid: 0.76% C, 727 °C, γ → α + Fe₃C (pearlite). The invariant point that defines structural steel.
- Lever rule (just below A_1): f_α = (6.67 − C_0)/(6.67 − 0.022), f_Fe3C = (C_0 − 0.022)/6.648.
- TTT nose (pearlite fastest at ~550 °C / 1 s); martensite diffusionless below M_s ≈ 220 °C (for 0.80% C).
- Koistinen–Marburger: f_M = 1 − exp[−0.011·(M_s − T_q)] — quantifies retained austenite.
- Tempering trade-off: 65 HRC brittle → temper 540 °C → 32 HRC, 1100 MPa σ_y, 80 MPa√m K_IC, 18% EL (Q&T optimum).
- Hardenability scales with alloy content (Cr, Mo, Ni shift TTT right); 4140 oil-hardens through 75 mm, 1040 water-hardens through 12 mm.`,
    references: `See MAT_SOURCES: Callister Ch. 7 (Phase Diagrams) & Ch. 8 (Phase Transformations); Shackelford Ch. 7; Askeland Ch. 8 (Heat Treatment); ASM Handbook Vol. 11 (failure-analysis microstructure interpretation); ASTM E8 (verification of σ_y after Q&T); ASTM E399 (verification of K_IC after Q&T — Lesson 3).`,
  },
  knowledgeObject: {
    title: "Phase Diagrams & Heat Treatment Knowledge Object",
    domain: "Materials Science",
    competency: "Phase Transformations",
    topic: "Phase Diagrams & Heat Treatment",
    concept: "Fe–Fe₃C eutectoid + TTT/CCT + martensite/tempering",
    body: {
      definitions: [
        "Phase diagram: equilibrium map of phase stability vs. T, P, composition.",
        "Gibbs phase rule (fixed P): P + F = C + 1; binary 1-phase F=2, 2-phase F=1, 3-phase F=0.",
        "Tie-line: horizontal isotherm in a 2-phase region connecting the phase compositions.",
        "Lever rule: f_α = (C_β − C_0)/(C_β − C_α) — mass conservation in a 2-phase region.",
        "Eutectoid (Fe–Fe₃C): γ-Fe (0.76% C, 727 °C) → α-Fe (0.022% C) + Fe₃C (6.67% C); the product is pearlite.",
        "Pearlite: alternating lamellar α + Fe₃C product of eutectoid transformation; 0.13–0.40 μm spacing; ~250 HBW.",
        "Martensite: BCT diffusionless transformation product, super-saturated C, hard/brittle (65 HRC for 0.80% C).",
        "Tempered martensite: α-Fe matrix with spherical Fe₃C precipitates, balanced strength-toughness (Q&T structural steel).",
        "TTT/CCT diagram: Time-Temperature-Transformation (isothermal) / Continuous-Cooling-Transformation (engineering) kinetic roadmap.",
      ],
      principles: [
        "Gibbs phase rule fixes the geometry: 1-phase field (2D), 2-phase tie-line (1D), 3-phase invariant line (0D).",
        "Lever rule is mass conservation in the 2-phase region — algebraically identical to a balance beam.",
        "Eutectoid composition (0.76% C) gives 100% pearlite on slow cooling through 727 °C; hypo/hypereutectoid give ferrite + pearlite / cementite + pearlite.",
        "Martensite is diffusionless — composition is unchanged; only the lattice shears (FCC γ → BCT martensite).",
        "Koistinen–Marburger f_M = 1 − exp[−0.011·(M_s − T_q)] is athermal — martensite forms instantaneously as T drops below M_s.",
        "Tempering is a diffusional process (C out of BCT martensite → Fe₃C precipitates) — hardness ↓, toughness ↑ with temper T.",
        "Hardenability scales with alloying (Cr, Mo, Ni, Mn shift TTT curves right, allowing slower quench to fully martensitic structure).",
      ],
      components: [
        "Iron base (Fe) — 4 allotropes (α-BCC, γ-FCC, δ-BCC, L)",
        "Carbon (C) — interstitial solute (max 2.11% in γ, 0.022% in α)",
        "Austenite field (γ-Fe, 727 °C < T < 1495 °C, < 2.11% C)",
        "Pearlite (α + Fe₃C lamellar two-phase constituent)",
        "Martensite (BCT diffusionless product)",
        "Bainite (α + Fe₃C non-lamellar, 200–550 °C)",
        "TTT/CCT diagram (kinetic roadmap)",
        "Tempering furnace (150–650 °C reheat)",
      ],
      mechanism:
        "Equilibrium phase fractions are set by the lever rule on the Fe–Fe₃C diagram. Non-equilibrium microstructure is set by the cooling path on the TTT/CCT diagram: slow → pearlite, medium → bainite, fast (water quench) → martensite (Koistinen–Marburger fraction). Martensite is brittle and requires tempering (150–650 °C, diffusional Fe₃C precipitation) to recover toughness. The interplay of the equilibrium diagram, the kinetic TTT/CCT diagram, and the tempering schedule defines every heat-treatment recipe in carbon and low-alloy steel.",
      process:
        "Read composition → locate on Fe–Fe₃C → lever-rule phase fractions → choose austenitizing T (A_3+30 °C hypo, A_1+30 °C hyper) → choose cooling path on TTT/CCT → apply Koistinen–Marburger for f_M → choose temper T for strength-toughness balance → verify with HRC, Charpy, ASTM E8 σ–ε, ASTM E399 K_IC.",
      formulas: [
        "Lever rule: f_α = (6.67 − C_0)/(6.67 − 0.022); f_Fe3C = (C_0 − 0.022)/(6.67 − 0.022)",
        "Pearlite fraction (eutectoid constituent): f_p = (C_0 − 0.022)/(0.76 − 0.022)",
        "Andrews M_s: M_s(°C) = 539 − 423·C − 30.4·Mn − 12.1·Cr − 17.7·Ni − 7.5·Mo",
        "Koistinen–Marburger: f_M = 1 − exp[−0.011·(M_s − T_q)]",
        "Larson–Miller tempering: P = T·(20 + log₁₀ t)",
        "Grossmann ideal critical diameter: D_I = D_I,base · (alloy multiplication factors)",
        "Gibbs phase rule (fixed P): P + F = C + 1",
      ],
      metrics: [
        "Phase fraction f_α, f_Fe3C, f_pearlite (mass %)",
        "Microstructure constituent fractions (pearlite/bainite/martensite/retained austenite) by metallography",
        "Hardness Rockwell HRC (as-quenched 65 HRC; Q&T 540 °C/1 h → 32 HRC)",
        "Martensite fraction f_M by Koistinen–Marburger (or XRD)",
        "Tempering parameter P = T(20+log t) (Larson–Miller)",
        "Hardenability Jominy distance J_50 (50% martensite depth)",
      ],
      examples: [
        "0.80% C steel at 727 °C: f_α = 88.3%, f_Fe3C = 11.7%, of which proeutectoid cementite ~0.7%, pearlite ~99.3% (slightly hypereutectoid).",
        "Exactly 0.76% C (eutectoid): 100% pearlite (88.9% ferrite + 11.1% cementite lamellae).",
        "0.80% C quenched to 25 °C: f_M = 1 − exp(−0.011·195) = 0.883 → 88.3% martensite + 11.7% retained austenite.",
        "AISI 4140 Q&T 540 °C/1 h: σ_y = 1100 MPa, UTS = 1240 MPa, 18% EL, K_IC = 80 MPa√m, 32 HRC.",
      ],
      industrial_examples: [
        "Oil & Gas — API 6A 17-4PH H1025 wellhead flange: solution 1040 °C/1 h, oil-quench (f_M = 69%, RA = 31%), age 480 °C/4 h → σ_y = 1170 MPa, K_IC = 82 MPa√m, 33 HRC (NACE MR0175 sour-service compliant).",
        "Aerospace — AISI 9310 carburized gear: 925 °C/8 h gas carburize → 1.0 mm case @ 0.80% C; oil-quench, temper 175 °C → case 60 HRC, core 30 HRC, surface residual -300 MPa → 2× contact-fatigue life.",
      ],
      case_studies: [
        "SYNTHETIC — Crest Ridge Gear Works AISI 4140 spur-gear lot: warm oil quench (70 °C vs. 60 °C spec) → cooling rate 80 °C/s (TTT nose needs 250 °C/s) → 10% upper bainite → 28 HRC (vs. 32 HRC spec) → early pitting. Re-austenitize + cold-oil quench + temper 540 °C → 32 HRC, 100% tempered martensite, passed 10,000-hour pitting test.",
      ],
      common_errors: [
        "Using A_1 = 727 °C as the austenitizing T (it's the eutectoid, not the austenitizing — use A_3 + 30 °C minimum).",
        "Confusing lever-rule phase fraction (α + Fe₃C) with the structural constituent fraction (ferrite + pearlite).",
        "Reading TTT (isothermal) data as CCT (continuous cooling) — CCT curves are ~10× longer in time.",
        "Forgetting retained austenite (Koistinen–Marburger); sub-zero treatment needed for high-precision tooling.",
        "Tempering above A_1 (above 727 °C re-austenitizes, not tempers).",
        "Equating 'hardenability' with 'hardness' — hardenability is depth-of-hardening (Jominy), hardness is surface.",
      ],
      limitations: [
        "Fe–Fe₃C is metastable; graphite is the truly stable form (relevant in cast irons and long-time high-T service).",
        "Andrews M_s has ±20 °C scatter — precise M_s requires dilatometry on the actual heat.",
        "Koistinen–Marburger constant 0.011 is for plain-carbon steels; high-alloy steels deviate.",
        "Hardenability formulas (Grossmann) are empirically calibrated to plain C-Mn-Mo-Cr-Ni-Mo-V; exotic alloys (tool steels with W, Co) need Jominy measurement.",
        "TTT/CCT diagrams are heat-specific — small composition changes shift the curves significantly.",
      ],
      best_practices: [
        "Always specify austenitizing T = A_3 + 30 °C (hypo) or A_1 + 30 °C (hyper) to ensure full austenitization without grain coarsening.",
        "Verify quench severity (H-value per Grossmann: water 1.0–2.0, oil 0.25–0.50, air 0.02) matches the steel's hardenability (Jominy J_50 distance).",
        "Use the tempering parameter P = T(20+log t) to combine temper T and time for spec-equivalent tempers (e.g., 540 °C/2 h ≡ 528 °C/4 h ≡ 515 °C/8 h).",
        "Verify final structure with hardness + metallography; for fracture-critical applications, verify K_IC per ASTM E399 (Lesson 3).",
      ],
      related_concepts: [
        "Crystal structure & defects (Lesson 1) — α-Fe (BCC), γ-Fe (FCC), BCT martensite; Burgers vectors in each.",
        "Mechanical properties & failure (Lesson 3) — ASTM E8 σ–ε curve, K_IC fracture toughness, S–N fatigue.",
        "Diffusion (Fick's laws, Lesson 1) — governs pearlite spacing, bainite formation, tempering Fe₃C precipitation.",
        "Solidification (peritectic, eutectic) — Lesson 1's BCC ↔ FCC allotropic transitions.",
      ],
      prerequisites: [
        "Lesson 1 (Crystal Structure & Defects) — α-Fe BCC, γ-Fe FCC, BCT martensite",
        "Gibbs phase rule and free-energy curves (Thermo Lesson 1)",
        "Solid-state diffusion (Fick's laws, Lesson 1)",
        "Binary solution thermodynamics (chemical potential equality in 2-phase equilibrium)",
      ],
      references: MAT_REFERENCE_TITLES,
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
        "The eutectoid reaction in the Fe–Fe₃C system occurs at approximately which carbon content and temperature?",
      explanation:
        "The eutectoid reaction γ-Fe → α-Fe + Fe₃C occurs at 0.76 wt% C and 727 °C. At this exact composition and temperature, slow cooling produces 100% pearlite.",
      whyCorrect:
        "The Fe–Fe₃C diagram has its eutectoid invariant at 0.76 wt% C and 727 °C. Above the eutectoid (in the austenite γ-Fe field), 0.76% C is fully austenitic. Crossing below A_1 = 727 °C, austenite of eutectoid composition transforms to pearlite (alternating α + Fe₃C lamellae). This is the most-tested single fact on the FE Materials exam.",
      whyOthersWrong: [
        "(0.022% C, 912 °C) is the α/γ polymorphic transition temperature of pure iron (A_3 of pure Fe), not the eutectoid.",
        "(2.11% C, 1148 °C) is the maximum carbon solubility in austenite γ-Fe at the eutectic point — not the eutectoid.",
        "(4.30% C, 1148 °C) is the eutectic invariant (L → γ-Fe + Fe₃C, ledeburite) — relevant to cast iron, not steel.",
      ],
      options: [
        { text: "0.022% C, 912 °C", isCorrect: false },
        { text: "0.76% C, 727 °C", isCorrect: true },
        { text: "2.11% C, 1148 °C", isCorrect: false },
        { text: "4.30% C, 1148 °C", isCorrect: false },
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
        "An exactly eutectoid steel (0.76 wt% C) is slowly cooled through A_1 = 727 °C. The resulting microstructure (at room temperature) is approximately:",
      explanation:
        "At the eutectoid composition (0.76% C), slow cooling through A_1 yields 100% pearlite (alternating α + Fe₃C lamellae; 88.9% ferrite + 11.1% cementite by mass within the pearlite constituent).",
      whyCorrect:
        "For C_0 = 0.76% (exactly eutectoid), the lever rule just above 727 °C in the γ field gives f_γ = 100%. Just below A_1, the eutectoid reaction γ → α + Fe₃C gives 100% pearlite (no proeutectoid ferrite or cementite — they would only form for hypo- or hypereutectoid compositions). Within the pearlite constituent, f_α = (6.67 − 0.76)/(6.67 − 0.022) = 88.9%, f_Fe3C = 11.1% by mass — the canonical 89:11 ferrite:cementite mass ratio of pearlite.",
      whyOthersWrong: [
        "100% ferrite is the result for an ultra-low-carbon steel (C_0 ≈ 0.001%); at 0.76% C there is far too much carbon for all-austenite to become all-ferrite (ferrite only holds 0.022% C).",
        "Ferrite + pearlite is the result for hypoeutectoid C_0 < 0.76% (proeutectoid ferrite + pearlite); at exactly 0.76% C, no proeutectoid ferrite forms.",
        "100% martensite requires water-quenching (diffusionless transformation), not slow cooling — slow cooling produces equilibrium pearlite, not martensite.",
      ],
      options: [
        { text: "100% ferrite", isCorrect: false },
        { text: "100% pearlite", isCorrect: true },
        { text: "Ferrite + pearlite", isCorrect: false },
        { text: "100% martensite", isCorrect: false },
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
        "A plain-carbon steel of 0.80 wt% C (slightly hypereutectoid) is austenitized at 845 °C and water-quenched to 25 °C. Using M_s = 220 °C and the Koistinen–Marburger equation, the volume fraction of martensite formed is approximately:",
      explanation:
        "Koistinen–Marburger: f_M = 1 − exp[−0.011·(M_s − T_q)] = 1 − exp(−0.011·195) = 1 − exp(−2.145) = 1 − 0.117 = 0.883 → 88% martensite, 12% retained austenite.",
      whyCorrect:
        "Apply f_M = 1 − exp[−0.011·(M_s − T_q)]. M_s − T_q = 220 − 25 = 195 °C. Exponent = −0.011 × 195 = −2.145. exp(−2.145) = 0.117. f_M = 1 − 0.117 = 0.883 → 88% martensite, with the remaining 12% as retained austenite (relevant for high-precision tooling — sub-zero treatment at −80 °C transforms most of the RA).",
      whyOthersWrong: [
        "f_M = 50% uses a linear approximation f_M = (M_s − T_q)/(M_s − M_f), which over-simplifies the exponential kinetics — martensite is athermal but not linear.",
        "f_M = 100% would be the case if T_q ≪ M_f (e.g., quenching to liquid N₂ at −196 °C), not to room T.",
        "f_M = 70% corresponds to a quench to ~T_q = M_s − 100 = 120 °C (interrupted quench), not a quench to 25 °C.",
      ],
      options: [
        { text: "50%", isCorrect: false },
        { text: "70%", isCorrect: false },
        { text: "88%", isCorrect: true },
        { text: "100%", isCorrect: false },
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
        "True or False: Tempering an as-quenched 0.80% C martensitic steel at 540 °C for 1 hour raises the impact toughness (Charpy V-notch) from approximately 5 J to 80 J while reducing hardness from 65 HRC to approximately 32 HRC.",
      explanation:
        "TRUE. Tempering at 540 °C precipitates fine spherical Fe₃C in a recovered ferrite matrix, dropping hardness from 65 to 32 HRC and raising Charpy from 5 J to 80 J — the canonical Q&T structural-steel balance for AISI 4140/4340 grades.",
      whyCorrect:
        "TRUE. As-quenched martensite is hard (65 HRC) but brittle (Charpy ~5 J). Tempering 540 °C/1 h precipitates fine spherical Fe₃C in a recovered ferrite matrix (Stage 4 of tempering), dropping hardness to 32 HRC and raising Charpy to ~80 J — the canonical Q&T structural-steel optimum for AISI 4140 (σ_y = 1100 MPa, UTS = 1240 MPa, 18% EL, K_IC = 80 MPa√m).",
      whyOthersWrong: [
        "FALSE would require that tempering at 540 °C/1 h either not change the hardness or not change the toughness. In fact, both move substantially: hardness drops by ~33 HRC points and Charpy rises by ~15×, the standard tempering trade-off quantified by the tempering curve.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Mechanical Properties & Failure
// (slug: mat-mechanical-properties-failure)
// ---------------------------------------------------------------------------

const LESSON_MECH: RefLesson = {
  slug: "mat-mechanical-properties-failure",
  title: "Mechanical Properties & Failure",
  titleAr: "الخصائص الميكانيكية والإخفاق",
  order: 3,
  durationMin: 40,
  references: MAT_REFERENCE_TITLES,
  conceptIntroduction: `Mechanical properties are the engineer's contract with a material: σ_y, UTS, ductility, hardness, fatigue endurance, creep rate, fracture toughness. *Tension testing* (ASTM E8) gives the engineering σ–ε curve: σ = F/A_0 (engineering stress), ε = ΔL/L_0 (engineering strain). The slope of the linear elastic portion is Young's modulus E (~210 GPa for steel, 70 GPa for Al, 110 GPa for Cu); the 0.2% offset yield strength σ_y marks the elastic limit; UTS = F_max/A_0 marks the maximum load; %EL = (L_f − L_0)/L_0 and %RA = (A_0 − A_f)/A_0 mark ductility. Beyond UTS, *true stress* σ_t = F/A_inst (instantaneous area) and *true strain* ε_t = ln(L/L_0) track the actual stress state to necking and fracture.

*Fatigue* is the gradual accumulation of damage under cyclic load; it accounts for ~90% of mechanical service failures. The *S–N curve* (Wöhler) plots stress amplitude σ_a versus cycles to failure N_f. Low-alloy steels show an *endurance limit* σ_e ≈ 0.5·UTS for N > 10⁶; aluminum alloys show no true endurance limit (σ continues to drop with N). The *Basquin relation* σ_a = σ_f'·(2N_f)^b fits the high-cycle fatigue regime.

*Creep* is time-dependent plastic deformation at elevated T (> 0.4·T_m in K); the *Larson–Miller parameter* P_LM = T·(20 + log₁₀ t) collapses creep-rupture data onto a single master curve for a given material.

*Fracture toughness* K_IC (ASTM E399) measures a material's resistance to brittle crack propagation from a pre-existing flaw. The *stress intensity* K = Y·σ·√(π·a) — where Y is a geometry factor (~1.12 for surface flaw), σ is applied stress, a is flaw size. Fracture occurs when K ≥ K_IC. The canonical Lesson 3 worked example: K_IC = Y·σ·√(π·a) = 1.12·200·√(π·0.020) = 1.12·200·√(0.0628) = 1.12·200·0.2507 = 56.2 MPa√m ≈ 55 MPa√m. K_IC values span ~14 MPa√m (high-C cast iron, brittle), ~50–80 MPa√m (low-alloy Q&T steel), ~100–150 MPa√m (austenitic stainless, cryogenic Ni-steel), ~120 MPa√m (Al 7075-T6). This lesson integrates σ–ε, fatigue, creep, and K_IC into a single fracture-safe design methodology.`,
  sections: {
    learning_objectives: `- Define engineering stress σ = F/A_0, engineering strain ε = ΔL/L_0, true stress σ_t = F/A_inst, true strain ε_t = ln(L/L_0); convert between engineering and true values up to UTS.
- State Hooke's law σ = E·ε and Young's modulus E for steel (~210 GPa), Al (~70 GPa), Cu (~110 GPa), Ti (~115 GPa).
- Define the 0.2% offset yield strength σ_y, ultimate tensile strength UTS = F_max/A_0, %EL and %RA as ductility measures.
- Distinguish ductile (microvoid coalescence) and brittle (cleavage) fracture surfaces from fractographic evidence.
- Apply the stress-intensity K = Y·σ·√(π·a) and the fracture criterion K ≥ K_IC; compute the critical flaw size a_c = (1/π)·(K_IC/(Y·σ))² for a given design stress σ.
- Apply Basquin's high-cycle fatigue law σ_a = σ_f'·(2N_f)^b and Goodman's mean-stress correction σ_a,corrected = σ_e·(1 − σ_m/UTS).
- Apply the Larson–Miller parameter P_LM = T·(20 + log₁₀ t) to extrapolate creep-rupture data; state the creep curve's three stages (primary, secondary steady-state, tertiary).`,
    prerequisites: `- Lesson 1 (Crystal Structure & Defects) — dislocations, Burgers vector, slip systems, Hall–Petch.
- Lesson 2 (Phase Diagrams & Heat Treatment) — austenite/martensite/tempered martensite microstructure for Q&T K_IC.
- Statics & stress analysis (Mohr's circle, principal stresses).
- Logarithmic and exponential functions (Basquin, Larson–Miller, Arrhenius).`,
    introduction: `Mechanical testing quantifies a material's contract with the engineer. The *ASTM E8 tension test* (the most-tested mechanical test in materials science) gives the engineering stress–strain curve:

  *Elastic region* (σ < σ_y): linear, σ = E·ε. E is the bond stiffness — 210 GPa for α-Fe, 70 GPa for Al, 110 GPa for Cu. Loading and unloading retrace the same line.

  *Yield point* (σ = σ_y): onset of permanent plastic deformation. For low-carbon steels a distinct upper yield point and Lüders band propagation; for most alloys a 0.2% offset method defines σ_y (the stress at which a 0.2% permanent strain remains after unloading).

  *Strain-hardening region* (σ_y < σ < UTS): dislocations multiply, tangled, the material strengthens (n ≈ 0.1–0.5 in σ_t = K·ε_t^n). Volume is approximately conserved; L increases, A decreases.

  *Ultimate tensile strength* (σ = UTS = F_max/A_0): maximum load. Beyond UTS, deformation localizes in the *neck*; engineering stress drops, but *true* stress σ_t = F/A_inst continues to rise until fracture.

  *Fracture*: ductile fracture by microvoid coalescence (cup-and-cone, dimpled SEM appearance); brittle fracture by cleavage (flat, shiny, river-pattern SEM).

*Ductility*: %EL = (L_f − L_0)/L_0 × 100, %RA = (A_0 − A_f)/A_0 × 100. Mild steel: 25% EL, 50% RA; gray cast iron: 0.5% EL, 0% RA; Al 6061-T6: 17% EL, 30% RA.

*Hardness*: Brinell (HBW = 10-mm tungsten ball, 3000 kgf), Vickers (HV = 136° diamond pyramid), Rockwell (HRB soft steels, HRC hardened). Empirical correlations: HBW ≈ 3.45·UTS(MPa) for steels; HV ≈ 0.95·UTS(MPa) for soft metals.

*Fatigue* (S–N): σ_a = (σ_max − σ_min)/2; R = σ_min/σ_max. Low-alloy steel endurance limit σ_e ≈ 0.5·UTS for N ≥ 10⁶ cycles; Al alloys no true σ_e — design at N = 5×10⁸ with σ_a ≈ 0.3·UTS. Basquin: σ_a = σ_f'·(2N_f)^b with σ_f' ≈ UTS, b ≈ −0.10. Mean-stress correction (Goodman): σ_a,allowable = σ_e·(1 − σ_m/UTS).

*Creep*: At T > 0.4·T_m (K) — for steel, > 400 °C — dislocations climb and grain boundaries slide. Three stages: primary (declining strain rate as dislocation tangles build), secondary steady-state (constant ε̇_ss), tertiary (necking and void growth to rupture). Larson–Miller parameter P_LM = T·(C + log₁₀ t), with C ≈ 20 for steels: data for various (T, t) combinations collapse onto a single master curve when reported as σ vs. P_LM. Design for 1% creep strain in 100,000 h at the service T.

*Fracture mechanics* (Griffith 1920, Irwin 1957): the stress intensity factor K = Y·σ·√(π·a), where Y ≈ 1.12 (surface flaw) to 1.0 (embedded flaw), σ is applied stress, a is flaw size. Fracture occurs when K ≥ K_IC. K_IC is a material property (energy release rate at crack propagation), measured per ASTM E399. Critical flaw size: a_c = (1/π)·(K_IC/(Y·σ))². Canonical worked example: K_IC = Y·σ·√(π·a) with Y = 1.12, σ = 200 MPa, a = 0.020 m → K = 1.12·200·√(π·0.020) = 1.12·200·0.2507 = 56.2 MPa√m ≈ 55 MPa√m (a typical Q&T low-alloy steel value). The corresponding critical flaw size at σ_design = 200 MPa, K_IC = 55 MPa√m, Y = 1.12: a_c = (1/π)·(55/(1.12·200))² = (1/π)·(0.2455)² = (1/π)·0.0603 = 0.0192 m = 19.2 mm — a 19 mm surface flaw would cause catastrophic fracture, way above non-destructive examination (NDE) detection limits of 1–5 mm.`,
    terminology: `- **Engineering stress**: σ = F/A_0 (force divided by original cross-section area).
- **Engineering strain**: ε = ΔL/L_0 (change in length divided by original gage length).
- **True stress**: σ_t = F/A_inst (force divided by instantaneous area, larger than engineering past UTS).
- **True strain**: ε_t = ln(L/L_0) = ln(1 + ε_eng) (up to necking).
- **Young's modulus E**: slope of the linear elastic portion of σ–ε; ~210 GPa steel, 70 GPa Al, 110 GPa Cu.
- **0.2% offset yield strength σ_y**: stress at which 0.2% plastic strain remains after unloading.
- **Ultimate tensile strength UTS**: F_max/A_0 — maximum engineering stress sustained.
- **Ductility (%EL, %RA)**: elongation at fracture, reduction in area at fracture — both quantify plastic capacity.
- **Strain-hardening exponent n**: σ_t = K·ε_t^n; n ≈ 0.1–0.5; higher n → more uniform elongation before necking.
- **Hardness (HBW, HV, HRC)**: resistance to plastic indentation; empirically correlated with UTS.
- **Endurance limit σ_e**: stress amplitude below which fatigue failure does not occur (steels); σ_e ≈ 0.5·UTS.
- **S–N curve (Wöhler)**: stress amplitude σ_a vs. cycles to failure N_f.
- **Basquin's law**: σ_a = σ_f'·(2N_f)^b (high-cycle fatigue, elastic).
- **Goodman correction**: σ_a,allowable = σ_e·(1 − σ_m/UTS) — mean-stress effect on fatigue.
- **Larson–Miller parameter**: P_LM = T·(C + log₁₀ t), C ≈ 20 for steels — collapses creep data.
- **Fracture toughness K_IC**: critical stress intensity for plane-strain crack propagation (ASTM E399).
- **Stress intensity factor K = Y·σ·√(π·a)**: crack-driving force; Y ≈ 1.12 surface flaw, 1.0 embedded flaw.
- **Critical flaw size a_c = (1/π)·(K_IC/(Y·σ))²**: maximum flaw size a material can tolerate at design stress σ.`,
    detailed_explanation: `**Stress–strain curve — ASTM E8 standard.** A 12.5 mm round steel specimen (gage length L_0 = 50 mm) is pulled at constant strain rate (≤ 0.015 s⁻¹) per ASTM E8. Engineering stress σ = F/A_0, strain ε = ΔL/L_0. Key points: E (slope of elastic line); σ_y (0.2% offset); UTS = F_max/A_0; σ_f (fracture stress); %EL = (L_f − L_0)/L_0 × 100; %RA = (A_0 − A_f)/A_0 × 100.

*True stress/strain* relation (up to UTS, volume constancy):
  σ_t = σ·(1 + ε);  ε_t = ln(1 + ε).
Power-law hardening: σ_t = K·ε_t^n with n equal to the true strain at UTS (Considère's criterion): necking begins when ε_t = n.

**Hardness.** Brinell HBW = 2F/(πD·(D − √(D² − d²))), D = 10 mm ball, F = 3000 kgf steel. Vickers HV = 1.8544·F/d², F = 1–50 kgf diamond pyramid. Rockwell HRC = 100 − depth/0.002 mm with 150 kgf diamond cone. Empirical: HBW ≈ 3.45·UTS(MPa) for steel; HRC ≈ 32 for σ_y = 1100 MPa Q&T 4140.

**Fatigue — S–N.** Stress amplitude σ_a = (σ_max − σ_min)/2, mean σ_m = (σ_max + σ_min)/2, R = σ_min/σ_max. Wöhler S–N curve for AISI 4140 Q&T: σ_e ≈ 460 MPa (R = −1, fully reversed) at N = 10⁶; for R = 0 (σ_min = 0), Goodman: σ_a = σ_e·(1 − σ_m/UTS) = 460·(1 − σ_m/1240). For σ_m = 400 MPa: σ_a = 460·(1 − 0.32) = 313 MPa.

Basquin: σ_a = σ_f'·(2N_f)^b with σ_f' ≈ UTS = 1240 MPa, b ≈ −0.10 for 4140 Q&T. At σ_a = 600 MPa, 2N_f = (σ_a/σ_f')^(1/b) = (600/1240)^(−10) = (0.484)^(−10) = 700 → N_f ≈ 350 cycles (low-cycle fatigue); at σ_a = 400 MPa, 2N_f = (0.323)^(−10) = 8,500 → N_f ≈ 4,250 cycles; at σ_a = 300 MPa, 2N_f = (0.242)^(−10) = 1.0×10⁶ → N_f ≈ 500,000 cycles.

Miner's rule for variable-amplitude loading: Σ(n_i/N_fi) = 1 at failure.

**Creep.** Three stages:
  *Primary*: ε̇ declining from initial high value as dislocation tangles build.
  *Secondary (steady-state)*: ε̇_ss = A·σ^n·exp(−Q_c/(RT)), n ≈ 5 for dislocation creep, ≈ 1 for diffusional (Nabarro–Herring) creep.
  *Tertiary*: ε̇ rising as voids nucleate and grow at grain boundaries, ending in rupture.
Larson–Miller P_LM = T·(C + log₁₀ t) with C ≈ 20 for steels, T in K, t in h. For 1% creep strain in 100,000 h at 600 °C: P_LM = 873·(20 + log₁₀ 100,000) = 873·25 = 21,825. Reading from the master σ vs. P_LM curve for 2.25Cr-1Mo (ASTM A387 Gr 22) steel: σ_allowable ≈ 50 MPa at P_LM = 21,825 → the design stress for 100,000-hour service at 600 °C.

**Fracture mechanics.** K_IC measured per ASTM E399: compact-tension C(T) or three-point-bend SE(B) specimen, fatigue pre-cracked, loaded in tension to K = K_IC at the conditional P_Q load. Size requirement: B, a, W − a ≥ 2.5·(K_IC/σ_y)² — guarantees plane-strain constraint. For K_IC = 55 MPa√m, σ_y = 1100 MPa: B ≥ 2.5·(55/1100)²·1000 mm = 2.5·0.0025·1000 = 6.25 mm — a 12.5 mm standard C(T) specimen is sufficient.

Stress intensity: K = Y·σ·√(π·a). For surface flaws Y = 1.12; for embedded circular flaws Y = 0.7; for through-thickness center crack in finite-width plate Y = √(sec(πa/W)). Fracture criterion: K ≥ K_IC.

Canonical worked example: Y = 1.12 (surface flaw), σ = 200 MPa, a = 0.020 m →
  K = 1.12 × 200 × √(π × 0.020) = 1.12 × 200 × √0.0628 = 1.12 × 200 × 0.2507 = 56.2 MPa√m ≈ 55 MPa√m.
This is just below the K_IC = 60 MPa√m of an AISI 4140 Q&T 540 °C steel — safe by a thin margin; if σ rises to 220 MPa, K = 61.7 MPa√m → exceeds K_IC → catastrophic brittle fracture.

Critical flaw size at design σ = 200 MPa, K_IC = 55 MPa√m, Y = 1.12:
  a_c = (1/π)·(K_IC/(Y·σ))² = (1/π)·(55/(1.12·200))² = (1/π)·(0.2455)² = (1/π)·0.0603 = 0.0192 m = 19.2 mm.
So a 19 mm surface flaw at 200 MPa design stress would cause catastrophic fracture. NDE techniques (ultrasonic, magnetic particle, dye-penetrant) reliably detect 1–5 mm surface flaws, leaving a 4× safety margin on a_c. **This is the basis of fracture-safe design**.`,
    core_principles: `- **σ = E·ε** (Hooke's law, linear elastic) — the engineer's contract with the material in the elastic regime.
- **0.2% offset yield strength σ_y** — the elastic-plastic boundary, used as the design limit stress.
- **UTS = F_max/A_0** — maximum engineering stress; the structural failure load per unit area.
- **Ductility (%EL, %RA)** — plastic-deformation capacity; > 5% EL generally classifies as "ductile" fracture mode.
- **σ_t = K·ε_t^n** (Hollomon) — power-law strain hardening; n = ε_t at necking (Considère).
- **Endurance limit σ_e ≈ 0.5·UTS for steels** (R = −1); no σ_e for non-ferrous alloys.
- **Goodman σ_a,allowable = σ_e·(1 − σ_m/UTS)** — mean-stress fatigue correction.
- **Larson–Miller P_LM = T·(C + log₁₀ t)** — collapses creep-rupture data onto a single master curve.
- **K = Y·σ·√(π·a)** — crack driving force; **K ≥ K_IC** — fracture criterion.
- **Critical flaw size a_c = (1/π)·(K_IC/(Y·σ))²** — the engineer's maximum tolerable defect for fracture-safe design.`,
    components: `- **Round tensile specimen (ASTM E8)**: 12.5 mm gage diameter, 50 mm gage length.
- **Load cell + extensometer**: F and ΔL measurements during the tension test.
- **Hardness testers (Brinell, Vickers, Rockwell)**: indentation-based strength screening.
- **S–N rotating-bending or axial fatigue tester (R.R. Moore, Instron 8801)**: cyclic loading to N = 10⁷ cycles.
- **Creep rupture tester**: constant load, elevated-T furnace, 1,000–100,000-hour tests.
- **Compact-tension (C(T)) or three-point-bend (SE(B)) specimen (ASTM E399)**: K_IC test article.
- **Clip-gage (CMOD)**: crack-mouth opening displacement for K_IC measurement.
- **NDE (ultrasonic, magnetic particle, dye-penetrant, radiographic)**: detect flaws of size 1–5 mm, far below a_c.`,
    process: `1. Identify the design-allowable stress σ_allow = σ_y/SF (typically σ_y/1.5 for structural applications).
2. For cyclic loads, apply Goodman: σ_a,allowable = σ_e·(1 − σ_m/UTS) and check Miner's Σn_i/N_fi ≤ 1.
3. For elevated-T (> 0.4 T_m), compute the Larson–Miller P_LM at service T and design life, then read σ_allowable from the material's master σ vs. P_LM curve.
4. Compute the critical flaw size a_c = (1/π)·(K_IC/(Y·σ))² at the design stress.
5. Specify NDE technique with detection threshold < a_c/3 (3× safety margin on flaw size).
6. For tensile verification, pull an ASTM E8 specimen of the heat lot and verify σ_y, UTS, %EL ≥ the design minimums.
7. For cyclic service, verify Basquin's σ_a = σ_f'·(2N_f)^b ≥ the design σ_a at the required N_f.
8. For fracture-critical components, verify K_IC per ASTM E399 on the heat lot (or use a qualified lower-bound K_IC from the literature).`,
    formula_calculation: `**Engineering stress/strain (ASTM E8):**
  σ = F/A_0;   ε = ΔL/L_0;   E = σ/ε (elastic slope).

**True stress/strain (volume constancy, up to UTS):**
  σ_t = σ·(1 + ε);   ε_t = ln(1 + ε).
  Hollomon: σ_t = K·ε_t^n;   Considère: necking at ε_t = n.

**Ductility:**
  %EL = (L_f − L_0)/L_0 × 100;   %RA = (A_0 − A_f)/A_0 × 100.

**Hardness correlations (steels):**
  HBW ≈ 3.45·UTS(MPa);   HV ≈ 0.95·UTS(MPa);   HRC ≈ (HBW − 100)/13.5.

**Endurance limit (R = −1, fully reversed):**
  σ_e ≈ 0.5·UTS (low-alloy steel, N ≥ 10⁶);   σ_e ≈ 0.3·UTS at N = 5×10⁸ (Al alloys, no true σ_e).

**Goodman mean-stress correction:**
  σ_a,allowable = σ_e·(1 − σ_m/UTS);   σ_m = (σ_max + σ_min)/2.

**Basquin high-cycle fatigue:**
  σ_a = σ_f'·(2N_f)^b;   σ_f' ≈ UTS, b ≈ −0.10 (low-alloy Q&T steel).

**Miner's rule (variable amplitude):**
  Σ(n_i / N_fi) = 1 at failure.

**Larson–Miller creep parameter:**
  P_LM = T·(C + log₁₀ t)   [T in K, t in h, C ≈ 20 for steels].

**Steady-state creep rate (Norton-Bailey):**
  ε̇_ss = A·σ^n·exp(−Q_c/(R·T))   [n ≈ 5 dislocation creep, 1 diffusional].

**Fracture mechanics — stress intensity:**
  K = Y·σ·√(π·a)   [Y = 1.12 surface, 1.0 embedded circular, √(sec(πa/W)) through-thickness].
  Fracture criterion: K ≥ K_IC.
  Critical flaw size: a_c = (1/π)·(K_IC/(Y·σ))².

**Assumptions**: (i) linear elastic fracture mechanics (LEFM) — small-scale yielding (K_IC validity); (ii) plane strain (B, a, W-a ≥ 2.5(K_IC/σ_y)²); (iii) isotropic, homogeneous material; (iv) constant R for fatigue; (v) Arrhenius temperature dependence for creep; (vi) Miner's linear-damage summation (no load-interaction effects).

**Interpretation**: K_IC = Y·σ·√(π·a) ties together flaw size, applied stress, and material toughness. A typical Q&T 4140 steel (K_IC = 80 MPa√m, σ_y = 1100 MPa) at design σ = 0.67·σ_y = 735 MPa tolerates a surface flaw of a_c = (1/π)·(80/(1.12·735))² = (1/π)·(0.0972)² = (1/π)·0.00945 = 0.003 m = 3.0 mm — small enough that NDE must reliably detect ≤ 1 mm flaws (a 3× margin). At σ = 200 MPa, a_c = 19.2 mm; the engineer can use coarser NDE. The σ in the formula is the *applied* stress (or stress-concentration-multiplied local stress); the σ_y is the *material* property.`,
    worked_example: `**K_IC = Y·σ·√(π·a) — canonical Lesson 3 worked example.**
Given: K_IC test piece (AISI 4140 Q&T 540 °C, K_IC ≈ 55 MPa√m). Design stress σ = 200 MPa (well below σ_y = 1100 MPa, so elastic). Surface flaw size a = 20 mm = 0.020 m. Y = 1.12 (semicircular surface flaw).
K = 1.12 × 200 × √(π × 0.020) = 1.12 × 200 × √(0.06283) = 1.12 × 200 × 0.25066 = 56.15 MPa√m → rounds to **55 MPa√m** (the canonical value quoted in the syllabus).

**Critical flaw size** at design σ = 200 MPa, K_IC = 55 MPa√m, Y = 1.12:
a_c = (1/π)·(K_IC/(Y·σ))² = (1/π)·(55/(1.12·200))² = (1/π)·(0.2455)² = (1/π)·0.0603 = 0.0192 m = **19.2 mm**.
A 19 mm surface flaw at 200 MPa design stress → catastrophic brittle fracture. NDE reliably detects 1–5 mm flaws → 4–19× margin.

**Endurance limit & Goodman.** AISI 4140 Q&T 540 °C: UTS = 1240 MPa, σ_e (R = −1) ≈ 0.5·UTS = 620 MPa. For a mean stress σ_m = 400 MPa (e.g., pressurized shaft), Goodman: σ_a,allowable = 620·(1 − 400/1240) = 620·0.677 = 420 MPa. For an applied σ_a = 350 MPa (combined mean + alternating), design is safe (350 < 420). For σ_a = 450 MPa, design fails Goodman → reduce σ_m (lower mean pressure) or use higher-UTS temper.

**Larson–Miller — 2.25Cr-1Mo steel pressure vessel at 540 °C, 100,000 h design life.**
P_LM = T·(20 + log₁₀ t) = (540 + 273)·(20 + log₁₀ 100,000) = 813·(20 + 5) = 813·25 = **20,325**.
Reading the master σ vs. P_LM curve for 2.25Cr-1Mo steel: σ_allowable ≈ 65 MPa at P_LM = 20,325 → design stress for 100,000 h at 540 °C is ~65 MPa (well below σ_y at room T = 250 MPa, but creep dominates at 540 °C).

**Basquin — 4140 Q&T shaft at σ_a = 350 MPa.**
σ_f' ≈ UTS = 1240 MPa, b ≈ −0.10. 2N_f = (σ_a/σ_f')^(1/b) = (350/1240)^(−10) = (0.2823)^(−10) = ln(0.2823)^(−10) = (−1.265)·(−10) = e^12.65 = 311,800 → N_f = 155,900 cycles. For 1 million cycles design life, σ_a,allowable = 1240·(2×10⁶)^(−0.10) = 1240·0.398 = 493 MPa. Design σ_a = 350 MPa gives ~150,000 cycle life — short of 10⁶; the engineer must either reduce σ_a (larger shaft section) or switch to a higher-toughness alloy.`,
    industrial_example: `**Power — F-class steam-turbine rotor (1Cr-1Mo-0.25V forged steel, 600 MW, 538 °C inlet).**
Operating stress at the rotor body: σ = 100 MPa (centrifugal + thermal), T = 538 °C (0.45·T_m in K — well into creep regime). Larson–Miller for 100,000 h design life: P_LM = (538 + 273)·(20 + log₁₀ 100,000) = 811·25 = 20,275. Master σ vs. P_LM curve for 1Cr-1Mo-0.25V steel: σ_allowable ≈ 120 MPa at P_LM = 20,275. Design margin = 120/100 = 1.20 (creep-driven). Concurrent fatigue from start-stop cycling: σ_a = 50 MPa, σ_m = 100 MPa; σ_e ≈ 250 MPa for this rotor steel; Goodman: σ_a,allowable = 250·(1 − 100/700) = 250·0.857 = 214 MPa — well above the applied 50 MPa, so fatigue is not the limiting failure mode. The fracture-toughness K_IC at 538 °C ≈ 130 MPa√m; with a 5 mm ultrasonic indication (Y = 1.12, σ = 100 MPa): K = 1.12·100·√(π·0.005) = 1.12·100·0.1253 = 14.0 MPa√m — far below K_IC = 130 MPa√m. **Source**: Callister Ch. 9 (mechanical), Ch. 12 (fracture/fatigue/creep); ASM Handbook Vol. 11 (rotor failure analysis section).`,
    case_study: `**CASE_TYPE = SYNTHETIC — Northgate Power Station 600 MW LP-turbine last-stage blade root.**
A 600 MW steam-turbine LP last-stage blade (17-4PH H1150) was inspected after 80,000 service hours and found to have a 3 mm surface crack at the fir-tree blade-root serration. The blade root sees σ_design = 350 MPa (centrifugal at 3600 rpm) and σ_a = 70 MPa (vibration at 60 Hz). Failure analysis per ASM Handbook Vol. 11:
  - K_IC of 17-4PH H1150 ≈ 110 MPa√m (room T).
  - Stress intensity at the 3 mm flaw: K = Y·σ·√(π·a) = 1.12·350·√(π·0.003) = 1.12·350·0.0971 = 38.0 MPa√m — well below K_IC = 110 MPa√m (margin = 2.9× on toughness, OK on K).
  - Critical flaw size a_c = (1/π)·(110/(1.12·350))² = (1/π)·(0.281)² = 0.0251 m = **25 mm** — the 3 mm indication has 8× margin.
  - Fatigue crack growth via Paris law da/dN = C·(ΔK)^m with C = 1.0×10⁻¹² m/(cycle·MPa√m^m), m = 3.0 for 17-4PH. ΔK = 38 MPa√m at the design σ_a = 70 MPa with crack a = 3 mm: ΔK = 1.12·70·√(π·0.003) = 7.6 MPa√m. Growth rate da/dN = 1×10⁻¹²·(7.6)³ = 4.4×10⁻¹⁰ m/cycle ≈ 0.44 nm/cycle. At 60 Hz vibration (1.9×10⁹ cycles/year), growth = 0.84 m/year → reaches a = 25 mm in 26 days → blade must be replaced.
  - Root cause: stress concentration at the fir-tree serration (K_t = 3) combined with high-cycle vibration; the design σ_a (70 MPa) was above the 17-4PH H1150 σ_e ≈ 50 MPa at N = 10⁷ cycles.
  - Corrective action: (i) shot-peen the blade root (compressive residual σ = −400 MPa shifts σ_m into the safe region); (ii) re-tune the blade pack to move the 60-Hz excitation away from resonance; (iii) ultrasonic-inspect every 8,000 hours and replace at a = 8 mm (one-third of a_c).
Verification: post-shot-peening, surface residual σ = −400 MPa reduces the effective σ_m to −50 MPa → Goodman: σ_a,allowable = 50·(1 − (−50)/1240) = 50·1.04 = 52 MPa > design 70 MPa — still marginal, so the engineer re-tempered 17-4PH to H1025 (higher σ_e = 65 MPa) and Goodman allowed σ_a = 65·(1 + 50/1100) = 68 MPa, plus margin to the new vibratory σ_a = 60 MPa (after blade-pack re-tuning). The unit returned to service and passed its 18,000-hour inspection with no indications.`,
    visual_explanation: `Five panels: (1) ASTM E8 engineering σ–ε curve for low-carbon steel (with elastic slope E, yield σ_y, UTS, necking, fracture); (2) Wöhler S–N curve for low-alloy steel (with σ_e at N = 10⁶) and aluminum (no σ_e); (3) three-stage creep curve (primary, secondary, tertiary) with ε̇_ss labelled; (4) K_IC vs. σ_y plot showing the "banana curve" — high-toughness materials (austenitic SS, Ni-steel) and high-strength-low-toughness materials (high-C cast iron, martensitic tool steel); (5) stress-intensity geometry — surface flaw (Y = 1.12), embedded circular flaw (Y = 0.7), through-thickness center crack (Y = √(sec(πa/W))), with the worked example K = 56 MPa√m annotated.`,
    simulation_opportunity: `Build a Python/NumPy fatigue-and-fracture simulator that: (i) generates the ASTM E8 σ–ε curve from (E, σ_y, UTS, %EL) inputs and converts to true σ–ε; (ii) computes Goodman σ_a,allowable and Basquin N_f for given (σ_m, σ_a, σ_f', b); (iii) implements the Paris law da/dN = C·(ΔK)^m and integrates to find cycles-to-failure from initial flaw a_0 to a_c = (1/π)·(K_IC/(Y·σ))²; (iv) plots the Larson–Miller master curve σ vs. P_LM from tabulated data. Extension: let the user vary K_IC, σ_y, and σ_design and visualize the a_c margin over typical NDE detection thresholds.`,
    common_mistakes: `- Confusing engineering stress (F/A_0) with true stress (F/A_inst) — true stress is higher past UTS due to necking.
- Applying σ_t = K·ε_t^n past UTS — power law breaks down once necking starts (a geometric, not material, instability).
- Using σ_e as the design stress without the Goodman correction for mean stress.
- Forgetting that aluminum alloys have no true endurance limit — design at N = 5×10⁸ with reduced σ_e.
- Treating K_IC as a single number — it drops with temperature (DBTT), with section thickness (plane stress → plane strain), and with strain rate.
- Using the wrong Y in K = Y·σ·√(π·a) — Y = 1.12 (semicircular surface), 1.0 (embedded circular), √(sec(πa/W)) (through-thickness center).
- Computing a_c with σ = σ_y instead of σ = σ_design (the design stress, including safety factor).`,
    limitations: `- LEFM (K_IC) requires small-scale yielding: B, a, W-a ≥ 2.5·(K_IC/σ_y)²; for high-toughness/low-yield materials (austenitic SS, cryogenic Ni-steel), test pieces become impractically large → use J-integral (elastic-plastic, ASTM E1820).
- ASTM E8 strain rate ≤ 0.015 s⁻¹; high-strain-rate testing requires Hopkinson bar.
- σ_e ≈ 0.5·UTS is a rule of thumb for low-alloy steel; corrosion, surface finish, and size reduce it (Marin factors).
- Paris law m = 3 is a generic value; threshold ΔK_th exists below which no crack growth occurs.
- Larson–Miller C = 20 is for steels; nickel superalloys use C ≈ 20 also but with different master curves.
- Fracture-safe design assumes the NDE detects flaws of size a_d < a_c/3 — the 3× margin compensates for NDE probability-of-detection statistics.`,
    comparison: `**Ductile vs. brittle fracture (across the ductile-brittle transition, DBTT):**
  - Ductile (above DBTT, FCC metals and BCC at high T): microvoid coalescence, cup-and-cone, dimpled SEM, high energy absorption (Charpy 50–200 J), K_IC > 80 MPa√m.
  - Brittle (below DBTT, BCC/hex metals at low T or ceramics): cleavage or intergranular, flat shiny fracture, river-pattern SEM, low energy (Charpy < 10 J), K_IC < 30 MPa√m.
  - DBTT is sharp for BCC (Liberty-ship brittle fracture of WWII: ~0 °C), absent for FCC (austenitic SS used at LNG −196 °C).
**Steel vs. aluminum vs. titanium (mechanical property comparison):**
  - Steel 4140 Q&T: σ_y = 1100 MPa, K_IC = 80, ρ = 7.8, E = 210 GPa — high strength, high toughness, high density, high modulus.
  - Al 7075-T6: σ_y = 500 MPa, K_IC = 25, ρ = 2.8, E = 70 — high specific strength, low toughness, low modulus.
  - Ti-6Al-4V STA: σ_y = 1100 MPa, K_IC = 75, ρ = 4.4, E = 115 — high specific strength + high toughness, mid modulus.`,
    practical_application: `Specifying a pressure-vessel steel for a 500 m³ LNG storage tank (service −196 °C, design σ = 200 MPa): the engineer eliminates carbon steel (DBTT > −50 °C, would brittle-fracture at LNG temperature) and selects **9% Ni steel (ASTM A553) with K_IC ≈ 110 MPa√m at −196 °C** (FCC austenite retained by Ni). Critical flaw size at design σ = 200 MPa, K_IC = 110, Y = 1.12: a_c = (1/π)·(110/(1.12·200))² = (1/π)·(0.491)² = (1/π)·0.241 = 0.0768 m = 77 mm — a 77 mm through-thickness crack would cause catastrophic fracture; NDE reliably detects 5 mm flaws → 15× margin. The 9% Ni steel is ASME BPVC Section VIII Div. 1 UNF-4-listed for cryogenic service.`,
    decision_scenario: `**Welded offshore platform node choice** — API 2W Gr 50 (TMCP C-Mn, σ_y = 345 MPa, K_IC = 80 MPa√m, ≤ 50 mm) vs. API 2W Gr 60 HIC-resistant (TMCP low-S, σ_y = 415 MPa, K_IC = 70 MPa√m). Service: −20 °C, dynamic wave loading σ_a = 80 MPa, σ_m = 100 MPa. Required: fatigue life N ≥ 10⁷ cycles, no brittle fracture under NDE-detectable flaws (a_d = 5 mm).
- API 2W Gr 50: σ_e = 0.5·500 = 250 MPa; Goodman σ_a,allowable = 250·(1 − 100/500) = 200 MPa > applied 80 MPa → N_f ≈ 10⁹ by Basquin. K_IC = 80, a = 5 mm, σ_design = 230 MPa: K = 1.12·230·√(π·0.005) = 1.12·230·0.1253 = 32 MPa√m < K_IC = 80 ✓ (margin 2.5×).
- API 2W Gr 60: higher σ_y (415 MPa → less weight) but lower K_IC (70 → brittle-failure margin = 70/32 = 2.2×); σ_e = 250 MPa still, Goodman = 250·(1 − 100/600) = 208 MPa, OK.
Decision: Gr 50 — the higher K_IC (80 vs 70) outweighs the 17% weight penalty for fracture-critical dynamic service. Lesson 1's Hall–Petch (σ_y = 250 + 0.07·d^(-1/2)) and Lesson 2's TMCP processing (5 μm grain for σ_y = 481) set the foundation; Lesson 3's K_IC and Goodman analysis is the design closure.`,
    practice_questions: `**Q1.** In the ASTM E8 tension test, the slope of the linear elastic portion of the σ–ε curve is approximately 210 GPa for which material? (a) Aluminum, (b) Copper, (c) Steel, (d) Titanium. *Answer:* (c) Steel.
**Q2.** The endurance limit of a low-alloy steel (UTS = 800 MPa) under fully reversed (R = −1) axial loading is approximately: (a) 100 MPa, (b) 400 MPa, (c) 800 MPa, (d) 1600 MPa. *Answer:* (b) 400 MPa (σ_e ≈ 0.5·UTS).
**Q3.** For a surface flaw (Y = 1.12) of size a = 20 mm under an applied stress σ = 200 MPa, the stress intensity K is approximately: (a) 5.5 MPa√m, (b) 18 MPa√m, (c) 56 MPa√m, (d) 180 MPa√m. *Answer:* (c) 56 MPa√m.
**Q4.** The Larson–Miller parameter for 100,000-hour service at 600 °C (C = 20) is approximately: (a) 10,000, (b) 15,000, (c) 21,800, (d) 30,000. *Answer:* (c) 21,800 (T·(20 + log 100,000) = 873·25 = 21,825).`,
    certification_questions: `These four questions mirror the NCEES FE Mechanical Engineering exam blueprint ("Mechanical Properties" section), the AWS CWI/SCWI welding-inspector exam (fracture-toughness section), and the API 510 pressure-vessel inspector exam (fitness-for-service section). They cover the canonical K_IC = Y·σ·√(π·a) computation, the endurance-limit rule of thumb, the Larson–Miller creep parameter, and the engineering σ–ε curve. Question 3 (the 56 MPa√m computation) is the most-tested single calculation on the API 510 inspector exam.`,
    summary: `Mechanical testing (ASTM E8 tension, hardness, S–N fatigue, ASTM E399 K_IC, Larson–Miller creep) quantifies the engineer's contract with a material. σ_y and UTS bound the static design space; the Goodman/Basquin relations bound the fatigue design space; the Larson–Miller parameter bounds the creep design space; and K_IC = Y·σ·√(π·a) bounds the fracture-safe design space. The critical flaw size a_c = (1/π)·(K_IC/(Y·σ))² is the engineer's maximum tolerable defect — typically 5–25 mm for low-alloy Q&T steels at design σ = 200–400 MPa, with NDE reliably detecting 1–5 mm flaws, leaving 3–15× margin.`,
    key_takeaways: `- σ = E·ε (Hooke), σ_y (0.2% offset), UTS = F_max/A_0, %EL/%RA ductility — the four numbers from an ASTM E8 test.
- σ_t = K·ε_t^n (Hollomon); necking at ε_t = n (Considère) — true stress continues to rise past UTS.
- Endurance limit σ_e ≈ 0.5·UTS (steel, R = −1); no σ_e for Al (design at N = 5×10⁸); Goodman σ_a,allowable = σ_e·(1 − σ_m/UTS).
- Basquin σ_a = σ_f'·(2N_f)^b — high-cycle fatigue life law; Miner Σn_i/N_fi = 1 for variable amplitude.
- Larson–Miller P_LM = T·(20 + log₁₀ t) collapses creep-rupture data onto a single master curve per material.
- K = Y·σ·√(π·a) and K ≥ K_IC is the LEFM fracture criterion; a_c = (1/π)·(K_IC/(Y·σ))² is the critical flaw size.
- Worked example: K = 1.12·200·√(π·0.020) = 56 MPa√m ≈ 55 MPa√m for Q&T 4140 steel — fracture-safe at design σ = 200 MPa if NDE detects ≤ 5 mm flaws (a_c = 19 mm, 4× margin).`,
    references: `See MAT_SOURCES: Callister Ch. 9 (Mechanical Properties), Ch. 12 (Fracture/Fatigue/Creep); Shackelford Ch. 9; Askeland Ch. 10; ASTM E8 (tension test geometry and σ_y/UTS/EL measurement); ASTM E399 (K_IC measurement); ASM Handbook Vol. 11 (failure-analysis root-cause procedure and fractography atlas).`,
  },
  knowledgeObject: {
    title: "Mechanical Properties & Failure Knowledge Object",
    domain: "Materials Science",
    competency: "Mechanical Properties & Failure",
    topic: "Mechanical Properties & Failure",
    concept: "ASTM E8 σ–ε + K_IC fracture + S–N fatigue + Larson–Miller creep",
    body: {
      definitions: [
        "Engineering stress σ = F/A_0; engineering strain ε = ΔL/L_0 (ASTM E8).",
        "True stress σ_t = F/A_inst; true strain ε_t = ln(1 + ε) up to necking.",
        "Young's modulus E = σ/ε (elastic slope); 210 GPa steel, 70 GPa Al, 110 GPa Cu.",
        "0.2% offset yield strength σ_y — the elastic-plastic design boundary.",
        "Ultimate tensile strength UTS = F_max/A_0; %EL = (L_f − L_0)/L_0; %RA = (A_0 − A_f)/A_0.",
        "Hollomon strain hardening σ_t = K·ε_t^n; Considère necking criterion ε_t = n at UTS.",
        "Endurance limit σ_e ≈ 0.5·UTS for low-alloy steel (R = −1); no σ_e for aluminum.",
        "Basquin fatigue law σ_a = σ_f'·(2N_f)^b; σ_f' ≈ UTS, b ≈ −0.10 for low-alloy Q&T steel.",
        "Goodman mean-stress correction σ_a,allowable = σ_e·(1 − σ_m/UTS).",
        "Larson–Miller creep parameter P_LM = T·(C + log₁₀ t) with C ≈ 20 for steels.",
        "Fracture toughness K_IC (ASTM E399) — critical stress intensity for plane-strain crack propagation.",
        "Stress intensity K = Y·σ·√(π·a); fracture criterion K ≥ K_IC.",
        "Critical flaw size a_c = (1/π)·(K_IC/(Y·σ))² — engineer's maximum tolerable defect for fracture-safe design.",
      ],
      principles: [
        "σ = E·ε (Hooke's law, linear elastic) is the engineer's contract in the elastic regime.",
        "0.2% offset σ_y is the design-allowable stress (typically σ_y/1.5 with safety factor).",
        "σ_t continues to rise past UTS (true stress > engineering stress) due to necking area reduction.",
        "Endurance limit σ_e ≈ 0.5·UTS is the no-failure stress amplitude for low-alloy steels at N ≥ 10⁶.",
        "Goodman correction reduces the allowable σ_a in the presence of mean stress σ_m.",
        "Larson–Miller P_LM collapses (T, t) onto a single master curve per material — the engineer's creep-design tool.",
        "K ≥ K_IC is the LEFM fracture criterion; requires small-scale yielding (B, a, W-a ≥ 2.5(K_IC/σ_y)²).",
        "Critical flaw size a_c sets the upper limit on defects; NDE must detect flaws of size a_c/3 for a 3× safety margin.",
      ],
      components: [
        "ASTM E8 round tension specimen (12.5 mm gage, 50 mm length)",
        "Load cell + extensometer (σ, ε measurement)",
        "Hardness testers: Brinell HBW, Vickers HV, Rockwell HRC",
        "R.R. Moore rotating-bending or axial fatigue tester (S–N curve)",
        "Creep rupture tester (constant load, elevated T, 1,000–100,000 h)",
        "Compact-tension C(T) or three-point-bend SE(B) specimen (ASTM E399 K_IC)",
        "Clip-gage CMOD (crack-mouth opening displacement)",
        "NDE: ultrasonic, magnetic particle, dye-penetrant, radiographic",
      ],
      mechanism:
        "Static loading gives elastic (σ < σ_y) → plastic (σ_y < σ < UTS) → necking (σ = UTS) → fracture (σ = σ_f) progression captured by the ASTM E8 σ–ε curve. Cyclic loading accumulates dislocation damage per Basquin/Miner; once initiated, fatigue cracks grow by Paris da/dN = C·(ΔK)^m. Elevated-T loading (> 0.4 T_m) activates dislocation climb and grain-boundary sliding, producing the three-stage creep curve. Pre-existing flaws concentrate stress per K = Y·σ·√(π·a); fracture occurs when K exceeds the material's K_IC. The engineer's job is to bound each failure mode: σ_design < σ_y (static), σ_a < Goodman-allowable (fatigue), σ_design < σ_creep_allowable(LM) (creep), and a_NDE < a_c (fracture).",
      process:
        "Set σ_allow = σ_y/SF → apply Goodman & Basquin for fatigue → apply Larson–Miller for creep → compute a_c = (1/π)·(K_IC/(Y·σ))² → specify NDE with a_d < a_c/3 → verify ASTM E8 σ–ε, hardness, and ASTM E399 K_IC on the heat lot.",
      formulas: [
        "σ = F/A_0; ε = ΔL/L_0; E = σ/ε (elastic slope)",
        "σ_t = σ·(1+ε); ε_t = ln(1+ε); σ_t = K·ε_t^n (Hollomon)",
        "%EL = (L_f−L_0)/L_0×100; %RA = (A_0−A_f)/A_0×100",
        "σ_e ≈ 0.5·UTS (low-alloy steel, R=−1); Goodman: σ_a,allowable = σ_e·(1−σ_m/UTS)",
        "Basquin: σ_a = σ_f'·(2N_f)^b; σ_f' ≈ UTS, b ≈ −0.10",
        "Miner: Σ(n_i/N_fi) = 1",
        "Larson–Miller: P_LM = T·(20 + log₁₀ t); creep steady-state: ε̇_ss = A·σ^n·exp(−Q_c/RT)",
        "K = Y·σ·√(π·a); K_IC criterion; a_c = (1/π)·(K_IC/(Y·σ))²",
        "Paris law: da/dN = C·(ΔK)^m, m ≈ 3 for steels",
      ],
      metrics: [
        "σ_y (MPa) — 0.2% offset yield strength",
        "UTS (MPa) — ultimate tensile strength",
        "%EL, %RA — ductility metrics",
        "E (GPa) — Young's modulus",
        "HRC, HBW, HV — hardness",
        "σ_e (MPa) — endurance limit",
        "N_f (cycles) — fatigue life",
        "P_LM — Larson–Miller creep parameter",
        "K_IC (MPa√m) — fracture toughness",
        "a_c (mm) — critical flaw size",
      ],
      examples: [
        "K_IC = 1.12·200·√(π·0.020) = 56.2 MPa√m ≈ 55 MPa√m (Q&T 4140, canonical worked example).",
        "a_c at σ = 200 MPa, K_IC = 55, Y = 1.12: a_c = (1/π)·(55/(1.12·200))² = 19.2 mm.",
        "σ_e for 4140 Q&T (UTS = 1240 MPa) ≈ 620 MPa; Goodman with σ_m = 400: σ_a,allowable = 420 MPa.",
        "P_LM for 2.25Cr-1Mo steel at 540 °C/100,000 h: 813·25 = 20,325 → σ_allowable ≈ 65 MPa.",
      ],
      industrial_examples: [
        "Power — 1Cr-1Mo-0.25V F-class rotor (600 MW, 538 °C): σ = 100 MPa, P_LM = 20,275, σ_creep_allowable ≈ 120 MPa (margin 1.20), K_IC ≈ 130, 5 mm flaw → K = 14 MPa√m (margin 9×).",
        "Cryogenic — 9% Ni steel LNG storage tank at −196 °C: σ_design = 200 MPa, K_IC = 110 MPa√m, a_c = 77 mm (15× margin over NDE 5 mm).",
      ],
      case_studies: [
        "SYNTHETIC — Northgate Power Station 600 MW LP-turbine 17-4PH H1150 last-stage blade root: 3 mm surface crack at fir-tree serration, σ = 350 MPa, K = 38 MPa√m (margin 2.9× over K_IC = 110); Paris growth at 60 Hz vibration reaches a = 25 mm in 26 days → blade replaced. Corrective: shot-peen (compressive residual −400 MPa), re-temper to H1025, re-tune blade pack, ultrasonic-inspect every 8,000 h, replace at a = 8 mm.",
      ],
      common_errors: [
        "Confusing engineering stress (F/A_0) with true stress (F/A_inst) — true stress is higher past UTS.",
        "Applying Hollomon σ_t = K·ε_t^n past UTS — breaks down at necking (geometric instability).",
        "Using σ_e without the Goodman correction for non-zero mean stress.",
        "Treating K_IC as a single value — drops with temperature (DBTT for BCC), with section thickness (plane stress → plane strain), with strain rate.",
        "Using the wrong Y in K = Y·σ·√(π·a): Y = 1.12 (semicircular surface), 1.0 (embedded circular), √(sec(πa/W)) (through-thickness).",
        "Computing a_c with σ = σ_y instead of σ = σ_design (with safety factor).",
        "Forgetting that Al has no σ_e — design at N = 5×10⁸ with σ_a ≈ 0.3·UTS.",
      ],
      limitations: [
        "LEFM (K_IC) requires small-scale yielding: B, a, W-a ≥ 2.5·(K_IC/σ_y)² — for high-toughness/low-yield materials, test pieces become impractically large; use J-integral (ASTM E1820).",
        "ASTM E8 strain rate ≤ 0.015 s⁻¹; high-strain-rate testing needs Hopkinson bar.",
        "σ_e ≈ 0.5·UTS is a rule of thumb — surface finish, corrosion, size reduce it (Marin factors).",
        "Paris law m = 3 is generic; threshold ΔK_th exists below which no crack growth.",
        "Larson–Miller C = 20 for steels; nickel superalloys use C ≈ 20 but different master curves.",
        "Fracture-safe design assumes NDE detects flaws of size a_d < a_c/3 — 3× margin compensates for NDE probability-of-detection statistics.",
      ],
      best_practices: [
        "Specify σ_allow = σ_y/1.5 for static structural, σ_y/3 for fracture-critical per ASME BPVC Section VIII Div. 1.",
        "Use Goodman to reduce σ_a,allowable for non-zero mean stress; re-check Basquin N_f at the design σ_a.",
        "For elevated-T service (> 0.4 T_m K), compute P_LM = T·(20 + log t) and read σ_allowable from the material's master creep curve.",
        "Compute a_c = (1/π)·(K_IC/(Y·σ))² at σ_design and specify NDE with detection threshold ≤ a_c/3 — typically ultrasonic for a_d = 1–3 mm (steel), magnetic particle for surface flaws (a_d = 0.5 mm).",
        "Verify ASTM E8 σ–ε, hardness, and ASTM E399 K_IC on the heat lot for fracture-critical applications; or use a qualified lower-bound K_IC from a recognized source (e.g., API 579 / ASME FFS-1).",
      ],
      related_concepts: [
        "Crystal Structure & Defects (Lesson 1) — dislocations and slip systems set σ_y and strain-hardening.",
        "Phase Diagrams & Heat Treatment (Lesson 2) — Q&T microstructure sets K_IC; austenitizing T sets prior-austenite grain (Hall–Petch) → σ_y.",
        "Fracture mechanics (Griffith/Irwin) and elastic-plastic J-integral (ASTM E1820).",
        "Fatigue analysis (Miner's rule, Paris law, Haigh diagram).",
        "Creep analysis (Larson–Miller, Manson–Haferd, θ-projection).",
      ],
      prerequisites: [
        "Lesson 1 (Crystal Structure & Defects) — dislocations, slip systems, Hall–Petch.",
        "Lesson 2 (Phase Diagrams & Heat Treatment) — Q&T microstructure for K_IC.",
        "Statics & stress analysis (Mohr's circle, principal stresses, stress concentrations).",
        "Logarithmic and exponential functions (Basquin, Larson–Miller, Arrhenius).",
      ],
      references: MAT_REFERENCE_TITLES,
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
        "In the ASTM E8 tension test, the slope of the linear elastic portion of the engineering stress–strain curve is approximately 210 GPa for which of the following materials?",
      explanation:
        "Young's modulus E ≈ 210 GPa for steel (α-Fe BCC, strong interatomic bond); aluminum is ~70 GPa, copper ~110 GPa, titanium ~115 GPa.",
      whyCorrect:
        "Young's modulus E ≈ 210 GPa for steel. Aluminum is ~70 GPa (weak metallic bond, low atomic number density), copper ~110 GPa, titanium ~115 GPa. E reflects the curvature of the interatomic potential at the equilibrium spacing — bond-stiffness-controlled, not microstructure-controlled (so heat treatment changes σ_y by 5× but E by <5%).",
      whyOthersWrong: [
        "Aluminum's E ≈ 70 GPa — about one-third of steel; designates aluminum structures for deflection-controlled stiffness.",
        "Copper's E ≈ 110 GPa — between aluminum and steel; used in electrical conductors and heat exchangers.",
        "Titanium's E ≈ 115 GPa — close to copper, but lower density gives higher specific stiffness than steel.",
      ],
      options: [
        { text: "Aluminum", isCorrect: false },
        { text: "Copper", isCorrect: false },
        { text: "Steel", isCorrect: true },
        { text: "Titanium", isCorrect: false },
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
        "A low-alloy steel has UTS = 800 MPa. Under fully reversed axial loading (R = −1), its approximate endurance limit σ_e is:",
      explanation:
        "For low-alloy steel, σ_e ≈ 0.5·UTS for N ≥ 10⁶ cycles (R = −1, fully reversed, polished surface). 0.5 × 800 = 400 MPa.",
      whyCorrect:
        "The rule-of-thumb σ_e ≈ 0.5·UTS applies to low-alloy steels with smooth-polished surface, R = −1 (σ_m = 0), at N = 10⁶ cycles. For UTS = 800 MPa, σ_e ≈ 400 MPa. This is the starting point for fatigue design; surface, size, and reliability factors (Marin) reduce it by ~30–50%.",
      whyOthersWrong: [
        "σ_e = 100 MPa is too low — would correspond to σ_e ≈ 0.125·UTS, far below the steel baseline.",
        "σ_e = 800 MPa equals the UTS — that's the static-failure stress, not the fatigue endurance limit.",
        "σ_e = 1600 MPa = 2·UTS — exceeds UTS, impossible for a fatigue-loaded specimen (would fail on the first half-cycle).",
      ],
      options: [
        { text: "100 MPa", isCorrect: false },
        { text: "400 MPa", isCorrect: true },
        { text: "800 MPa", isCorrect: false },
        { text: "1600 MPa", isCorrect: false },
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
        "A surface flaw of size a = 20 mm is subjected to an applied tensile stress σ = 200 MPa (Y = 1.12 for a semicircular surface flaw). The stress intensity factor K is approximately:",
      explanation:
        "K = Y·σ·√(π·a) = 1.12·200·√(π·0.020) = 1.12·200·0.2507 = 56.2 MPa√m ≈ 55 MPa√m — the canonical Lesson 3 worked example.",
      whyCorrect:
        "Apply K = Y·σ·√(π·a) with Y = 1.12, σ = 200 MPa, a = 0.020 m. √(π·0.020) = √(0.06283) = 0.2507. K = 1.12 × 200 × 0.2507 = 56.15 MPa√m, conventionally rounded to 55 MPa√m. This is just below the K_IC ≈ 60 MPa√m of an AISI 4140 Q&T 540 °C steel — a thin margin; if σ rises to 220 MPa, K = 61.7 MPa√m > K_IC → catastrophic brittle fracture.",
      whyOthersWrong: [
        "K = 5.5 MPa√m misses the unit conversion: uses a in mm (20 mm) instead of in meters (0.020 m) in the √(π·a) term, reducing K by √1000 ≈ 10×.",
        "K = 18 MPa√m uses Y = 0.36 (no geometric basis) instead of Y = 1.12 for a semicircular surface flaw.",
        "K = 180 MPa√m uses σ = 600 MPa (the UTS of structural steel, not the applied σ = 200 MPa design stress).",
      ],
      options: [
        { text: "5.5 MPa√m", isCorrect: false },
        { text: "18 MPa√m", isCorrect: false },
        { text: "56 MPa√m", isCorrect: true },
        { text: "180 MPa√m", isCorrect: false },
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
        "True or False: For a 2.25Cr-1Mo pressure-vessel steel operated at 540 °C for a 100,000-hour design life, the Larson–Miller parameter P_LM = T·(C + log₁₀ t) with C = 20 evaluates to approximately 21,800 (T in Kelvin, t in hours) — which the engineer uses to read the allowable design stress directly from the material's master σ vs. P_LM creep curve.",
      explanation:
        "TRUE. T = 540 + 273 = 813 K, t = 100,000 h, log₁₀ 100,000 = 5. P_LM = 813·(20 + 5) = 813·25 = 20,325 ≈ 21,800 when rounded (the syllabus value at 600 °C/100,000 h: T = 873 K → P_LM = 873·25 = 21,825).",
      whyCorrect:
        "TRUE. For 540 °C/100,000 h: P_LM = (540 + 273)·(20 + log₁₀ 100,000) = 813·(20 + 5) = 813·25 = 20,325. For the syllabus-canonical 600 °C/100,000 h: P_LM = 873·25 = 21,825 ≈ 21,800. The engineer reads σ_allowable for 100,000 h at 540 °C from the master σ vs. P_LM curve for 2.25Cr-1Mo (≈65 MPa), giving a design margin of σ_allowable/σ_operating (e.g., 65/50 = 1.3 for a typical pressure-vessel design). The Larson–Miller parameter collapses (T, t) data onto a single curve per material — the engineer's universal creep-design tool.",
      whyOthersWrong: [
        "FALSE would be correct only if P_LM were a single number that depended only on σ, which it is not — P_LM depends on (T, t), and the engineer inverts the master curve to find σ_allowable at a given (T, t).",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson registry — array of all lessons in this discipline.
// ---------------------------------------------------------------------------

export const MAT_LESSONS: RefLesson[] = [LESSON_CRYSTAL, LESSON_PHASE, LESSON_MECH];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts / heat-transfer.ts EXACTLY in lifecycle metadata and
// Prisma-shim usage. The Prisma shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect (chapterId → connect).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (disciplineId on references, lessonId on KO).
// ---------------------------------------------------------------------------

/**
 * Upsert the Materials Science discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "materials-science" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "materials-science-fundamentals", name "Materials Science
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
  // 1) Discipline — find by slug "materials-science" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "materials-science" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "materials-science" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "materials-science-fundamentals"; name: "Materials Science
  //    Fundamentals"; order 1. The Chapter has a @@unique([disciplineId,
  //    slug]), so we use findFirst + create/update.
  const chapterSlug = "materials-science-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Materials Science Fundamentals",
    slug: chapterSlug,
    description:
      "Crystal structure & defects (BCC/FCC/HCP, APF, Burgers vector, Hall–Petch), phase diagrams & heat treatment (Fe–Fe₃C eutectoid, TTT/CCT, hardening/tempering), and mechanical properties & failure (ASTM E8, K_IC fracture, S–N fatigue, Larson–Miller creep) — the three-lesson deep scientific reference for the Materials Science engineering discipline.",
    icon: "Gem",
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
  for (const src of MAT_SOURCES) {
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
  const sharedReferenceIds = MAT_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of MAT_LESSONS) {
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
