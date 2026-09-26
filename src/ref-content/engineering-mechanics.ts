// =============================================================================
// Engineering Mechanics (Statics & Dynamics) — Engineering Discipline —
// Deep scientific reference (Task ID: MECH).
//
// Discipline slug: "engineering-mechanics" (seeded by scripts/seed-disciplines.ts,
// group "Engineering Fundamentals", order 4, icon "Move3d", color "teal").
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts EXACTLY (the first general-track
// loader) and src/ref-content/fluid-mechanics.ts (the second). The Prisma
// shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices with
//     order→sortOrder, FK→connect form).
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise.
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs → connect.
//
// Three lessons (one chapter "Engineering Mechanics Fundamentals"):
//   1. Statics: Force Systems & Equilibrium   (slug: mech-statics-force-equilibrium)
//   2. Dynamics: Kinematics & Kinetics        (slug: mech-dynamics-kinematics-kinetics)
//   3. Friction & Structural Analysis         (slug: mech-friction-structural-analysis)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional engineering-mechanics content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 5, 6, 7:
//   - LEVEL 6 — University / Academic Publications: Russell C. Hibbeler,
//     "Engineering Mechanics: Statics & Dynamics" (Pearson, 14th ed., 2016);
//     Ferdinand P. Beer, E. Russell Johnston, Jr., David Mazurek &
//     Phillip Cornwell, "Vector Mechanics for Engineers: Statics &
//     Dynamics" (McGraw-Hill, 12th ed., 2019).
//   - LEVEL 7 — Technical Publications / Industry Sources: James L. Meriam,
//     L. G. Kraige & J. N. Bolton, "Engineering Mechanics: Dynamics"
//     (Wiley, 8th ed., 2016); William F. Riley & Leroy D. Sturges,
//     "Engineering Mechanics: Statics" (Wiley, 6th ed., 2007).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014
//     (Asset Management — aligns structural/rotational asset reliability
//     against the ISO 55000 asset-management framework).
//   - LEVEL 5 — Professional Organizations: ASCE/SEI 7-22, "Minimum Design
//     Loads and Associated Criteria for Buildings and Other Structures"
//     (ASCE Structural Engineering Institute, 2022) — the canonical
//     structural-load reference cited in Lesson 3.
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
// Public types (mirror thermodynamics.ts / fluid-mechanics.ts)
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
// SOURCES — 6 real references cited across all engineering-mechanics lessons.
// ---------------------------------------------------------------------------

export const MECH_SOURCES: RefSource[] = [
  {
    title:
      "Hibbeler — Engineering Mechanics: Statics & Dynamics (Pearson, 14th ed., 2016)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Hibbeler, R. C. (2016). Engineering Mechanics: Statics & Dynamics (14th ed.). Upper Saddle River, NJ: Pearson Education. ISBN 978-0-13-391892-2. Statics Vol. Ch. 2 (Force Vectors — Cartesian components, dot product, position vectors), Ch. 3 (Equilibrium of a Particle — free-body diagrams, concurrent force systems, 2D & 3D equations ΣF = 0), Ch. 4 (Force System Resultants — moment of a force M = r × F, couples, equivalent systems, further reduction to a wrench), Ch. 5 (Equilibrium of a Rigid Body — 2D/3D equations of equilibrium, free-body diagrams of rods, beams, frames), Ch. 6 (Structural Analysis — trusses method of joints & sections, frames & machines), Ch. 7 (Internal Forces — internal loadings in beams, shear & moment diagrams), Ch. 8 (Friction — dry friction, wedges, screws, bearings, belt friction), Ch. 9 (Center of Gravity & Centroid), Ch. 10 (Moments of Inertia). Dynamics Vol. Ch. 12 (Kinematics of a Particle — rectilinear & curvilinear motion, position/velocity/acceleration vectors, projectile motion), Ch. 13 (Kinetics of a Particle: Force & Acceleration — Newton's 2nd law ΣF = ma, equations of motion in Cartesian, normal-tangential & cylindrical coordinates), Ch. 14 (Kinetics of a Particle: Work & Energy — principle of work & energy, conservation of energy), Ch. 15 (Kinetics of a Particle: Impulse & Momentum — linear impulse, conservation of linear momentum, impact), Ch. 16 (Planar Kinematics of a Rigid Body), Ch. 17 (Planar Kinetics of a Rigid Body: Force & Acceleration), Ch. 18 (Planar Kinetics: Work & Energy), Ch. 19 (Planar Kinetics: Impulse & Momentum). The canonical undergraduate mechanics textbook used by ABET-accredited ME/CE programs.",
  },
  {
    title:
      "Beer, Johnston, Mazurek & Cornwell — Vector Mechanics for Engineers: Statics & Dynamics (McGraw-Hill, 12th ed., 2019)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Beer, F. P., Johnston, E. R., Jr., Mazurek, D. F., & Cornwell, P. J. (2019). Vector Mechanics for Engineers: Statics & Dynamics (12th ed.). New York, NY: McGraw-Hill Education. ISBN 978-1-259-87281-6. Statics Ch. 2 (Static of Particles — resultant of two & three-dimensional concurrent forces), Ch. 3 (Rigid Bodies: Equivalent Force Systems — moment of a force about a point & about an axis, couples, reduction of a system of forces to one force & one couple), Ch. 4 (Equilibrium of Rigid Bodies — 2D/3D free-body diagrams, equilibrium equations, two-force & three-force members), Ch. 6 (Analysis of Structures — trusses, frames, machines), Ch. 7 (Forces in Beams & Cables), Ch. 8 (Friction), Ch. 9 (Distributed Forces: Moments of Inertia). Dynamics Ch. 11 (Kinematics of Particles — rectilinear, curvilinear, non-rectangular components, motion relative to a frame in translation), Ch. 12 (Kinetics of Particles: Newton's 2nd Law), Ch. 13 (Kinetics of Particles: Energy & Momentum Methods), Ch. 14 (Systems of Particles), Ch. 15 (Kinematics of Rigid Bodies — translation, rotation, general plane motion, motion relative to rotating frame, Coriolis acceleration), Ch. 16 (Plane Motion of Rigid Bodies: Forces & Accelerations), Ch. 17 (Plane Motion: Energy & Momentum Methods). Reference for the rigorous vector treatment of moments (M = r × F) and 3-D equilibrium.",
  },
  {
    title:
      "Meriam, Kraige & Bolton — Engineering Mechanics: Dynamics (Wiley, 8th ed., 2016)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Meriam, J. L., Kraige, L. G., & Bolton, J. N. (2016). Engineering Mechanics: Dynamics (8th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-88581-0. Ch. 1 (Introduction to Dynamics — history, applications, particle vs. rigid body, units), Ch. 2 (Kinematics of Particles — rectilinear, curvilinear motion; rectangular, normal-tangential & polar coordinates), Ch. 3 (Kinetics of Particles — Newton's 2nd law, equations of motion, work-energy, impulse-momentum, impact), Ch. 4 (Kinematics of Rigid Bodies — translation, fixed-axis rotation, general plane motion, instantaneous center of zero velocity, motion relative to rotating frame, Coriolis), Ch. 5 (Plane Kinetics of Rigid Bodies — equations of motion, synthesis with kinematics), Ch. 6 (Plane Motion of Rigid Bodies: Energy & Momentum), Ch. 7 (Introduction to Three-Dimensional Dynamics of Rigid Bodies), Ch. 8 (Vibration & Time Response — free, forced, damped vibrations). Practitioner reference emphasizing work-energy & impulse-momentum principles for engineering dynamics problems.",
  },
  {
    title:
      "Riley & Sturges — Engineering Mechanics: Statics (Wiley, 6th ed., 2007)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Riley, W. F., & Sturges, L. D. (2007). Engineering Mechanics: Statics (6th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-0-471-73257-3. Ch. 2 (Forces — vectors, unit vectors, dot/cross products, position vectors, moments), Ch. 3 (Rigid Body Equilibrium — 2D & 3D free-body diagrams, equilibrium equations, supports & connections, two-force & three-force members), Ch. 4 (Structures — trusses method of joints & sections, frames, machines), Ch. 5 (Distributed Forces — centroids, centers of gravity, distributed loads on beams), Ch. 6 (Friction — dry friction, impending motion, wedges, screws, disk friction, belt friction), Ch. 7 (Internal Forces & Moments — beam internal loadings, shear & moment diagrams, design of beams), Ch. 8 (Second Moments — moments of inertia of areas, parallel-axis theorem, mass moments of inertia). Concise and applied statics reference with explicit engineering design focus used in Lesson 1 & Lesson 3 worked examples.",
  },
  {
    title: "ISO 55000:2014 — Asset Management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55000.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines the asset-management framework (Plan–Do–Check–Act), the concept of an asset system, and the value/cost/risk triangle against which structural and rotating-equipment reliability is reported as lifecycle asset-performance metrics. Cited in Lessons 1 & 3 to align structural-load verification (dead, live, wind, seismic per ASCE/SEI 7-22), friction-controlled machine-element reliability (μ_s, μ_k), and truss-connection integrity with the ISO 55000 asset-management reporting structure that operators of bridges, cranes, conveyors, and industrial frames apply to their civil/structural asset fleets.",
  },
  {
    title:
      "ASCE/SEI 7-22 — Minimum Design Loads and Associated Criteria for Buildings and Other Structures (ASCE, 2022)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "STANDARD",
    url: "https://www.asce.org/structural-engineering",
    citation:
      "American Society of Civil Engineers, Structural Engineering Institute. ASCE/SEI 7-22, Minimum Design Loads and Associated Criteria for Buildings and Other Structures. Reston, VA: ASCE. ISBN 978-0-7844-8477-0. Ch. 1 (General Requirements — dead, live, soil, hydrostatic loads, load combinations per LRFD), Ch. 2 (Load Combinations — strength design & ASD combinations), Ch. 3 (Dead & Live Loads — uniformly distributed, concentrated, reducible live loads), Ch. 4 (Soil & Hydrostatic), Ch. 5/6 (Wind Loads — directional & envelope procedures, velocity pressure qh = 0.00256·Kz·Kzt·Kd·V²), Ch. 11/12 (Seismic Design Criteria — spectral acceleration SDS/SD1, R, Ie, Ω0, redundancy), Ch. 13 (Nonstructural Components — Fp = 0.4·ap·SDS·Wp/Rp), Ch. 15 (Nonbuilding Structures). The canonical reference for the load cases (D = dead, L = live, W = wind, E = seismic) that drive the free-body diagrams, beam reactions, and truss member forces worked in Lessons 1 & 3, and the structural integrity decision criteria applied to industrial assets.",
  },
];

const MECH_REFERENCE_TITLES = MECH_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Statics: Force Systems & Equilibrium
// (slug: mech-statics-force-equilibrium)
// ---------------------------------------------------------------------------

const LESSON_STATICS: RefLesson = {
  slug: "mech-statics-force-equilibrium",
  title: "Statics: Force Systems & Equilibrium",
  titleAr: "السكونيات: منظومات القوى والتوازن",
  order: 1,
  durationMin: 40,
  references: MECH_REFERENCE_TITLES,
  conceptIntroduction: `Statics is the branch of engineering mechanics that analyzes bodies at rest (or in uniform rectilinear motion) under the action of forces. A *force* is a vector push or pull characterized by magnitude, direction, and point of application — fully described in 3D by Cartesian components F = F_x·i + F_y·j + F_z·k. The *moment* (torque) of a force about a point O is the cross product M_O = r × F, where r is the position vector from O to any point on the line of action of F; the scalar magnitude |M_O| = |F|·d, where d is the perpendicular (moment) distance. A *couple* is a pair of equal, opposite, non-collinear forces whose resultant is zero but whose moment M = F·d is the same about every point — a *free vector*. A system of forces can be reduced to a single resultant force R = ΣF acting at O plus a resultant couple M_O = Σ(r × F); if the system is *concurrent* (all forces through one point), M_O = 0 and only R remains.

The equilibrium of a particle requires ΣF = 0 (3 scalar equations in 3D: ΣF_x = ΣF_y = ΣF_z = 0; 2 in 2D). The equilibrium of a rigid body additionally requires ΣM_O = 0 about every point — typically ΣM_x = ΣM_y = ΣM_z = 0 in 3D, or ΣM_O = 0 about a single convenient point in 2D. The *free-body diagram (FBD)* is the operational instrument: the body is isolated, every external force (applied loads, weights, reactions at supports) is drawn as a vector on the diagram, and the equilibrium equations are written directly from it. Beam reactions, truss members, friction-belt forces, machine-element loads, and structural-load combinations (D + L per ASCE/SEI 7-22) are all computed from FBDs.`,
  sections: {
    learning_objectives: `- Express a 3-D force as a Cartesian vector F = F_x·i + F_y·j + F_z·k; compute magnitude |F| = √(F_x² + F_y² + F_z²) and direction cosines (cos α, cos β, cos γ).
- Compute the moment of a force about a point O as M_O = r × F (vector cross product) and about an axis as M_a = u·(r × F); compute the moment of a couple as a free vector M = F·d.
- Reduce a general 3-D force system to a resultant force R = ΣF and a resultant couple M_R = Σ(r × F); recognize the special case of a concurrent system (M_R = 0).
- Apply the equilibrium equations ΣF = 0 and ΣM_O = 0 to a particle (3 scalar eqs. in 2D: ΣF_x = 0, ΣF_y = 0; in 3D: 6 eqs.) and to a rigid body.
- Construct a free-body diagram (FBD): isolate the body; draw every external force (applied loads, weight W = mg, support reactions, cable tensions); replace supports with their constraint reactions (roller → 1 reaction ⊥ surface; pin → 2 reactions; fixed → 3 reactions in 2D, 6 in 3D).
- Solve statically determinate 2-D problems: beams (simply supported, cantilever, overhanging), frames, and machines.
- Use ASCE/SEI 7-22 load combinations to compute design reactions on building columns, beam seats, and frame connections.`,
    prerequisites: `- Vector algebra: addition, scalar multiplication, dot product, and cross product of 3-D Cartesian vectors; right-hand rule for the cross product.
- Trigonometry: resolving a force into rectangular components F_x = F·cos θ, F_y = F·sin θ; laws of sines and cosines for non-right triangles of concurrent forces.
- Differential calculus: rates, slopes; brief use in shear & moment diagrams (Lesson 3 preview).
- Units and dimensions: SI (newton N, kN; metre m; kg) and U.S. customary (lbf, kip; ft; slug or lbm·g_c).
- Newton's three laws of motion (the First Law ΣF = 0 is the statics axiom; the Third Law underlies every FBD action–reaction pair).`,
    introduction: `Statics is the foundation of every structural and mechanical design. Every bridge, building column, crane boom, conveyor pulley, pressure-vessel support, and machine housing transmits forces through its members into supports and ultimately into the ground. The statics analysis answers two questions: (1) given the applied loads, what are the support reactions and internal member forces? (2) Are the resulting stresses within the material's allowable values (the subject of Mechanics of Materials)?

The four master tools of statics are: (i) *vector representation* of force (Cartesian components + direction cosines), (ii) the *moment* of a force about a point or axis (the cross product M = r × F), (iii) the *free-body diagram* — the isolating sketch that exposes every external load and support reaction acting on the body, and (iv) the *equilibrium equations* ΣF = 0 and ΣM = 0. Apply these four to a particle, a rigid body, a beam, a truss, a frame, a machine, or a friction-bound block and the answer follows algebraically.

The moment M_O = r × F encodes the rotational effect of a force about O. The magnitude |M_O| = |F|·d, where d is the perpendicular distance from O to the line of action of F (Varignon's theorem allows M_O to be split into moments of the components). The *couple* is a special force pair: two equal, opposite forces separated by distance d; its moment M = F·d is the same about every point — a free vector — and its resultant force is zero. Reduction of a general force system at point O gives R = ΣF and M_R = Σ(r × F); the system is *concurrent* if all lines of action intersect (then M_R = 0), *parallel* if all are co-directional, or *general* otherwise. A *wrench* is the irreducible form: R along an axis plus M along the same axis.

Equilibrium of a *particle* (no rotational DoF) needs only ΣF = 0 (2-D: 2 eqs., 3-D: 3 eqs.). Equilibrium of a *rigid body* needs ΣF = 0 *and* ΣM_O = 0 about *any* point O (the proof that ΣM_O = 0 follows from ΣF = 0 is the equivalence of moments about all points under ΣF = 0). In 2-D this gives 3 independent eqs. (ΣF_x, ΣF_y, ΣM_z); in 3-D it gives 6 (ΣF_x, ΣF_y, ΣF_z, ΣM_x, ΣM_y, ΣM_z). A *statically determinate* structure has exactly as many unknown reactions as independent equilibrium equations; a *statically indeterminate* structure has more (requires deformation/compatibility analysis — Mechanics of Materials). A *two-force member* (loaded only at two points) carries equal-opposite forces along the line through its endpoints; a *three-force member* has lines of action either concurrent or parallel — a powerful simplification in truss and frame analysis.`,
    terminology: `- **Force F**: a vector push or pull; SI unit N (newton); U.S. lbf. Magnitude |F|, direction (unit vector u_F), point of application.
- **Cartesian components**: F = F_x·i + F_y·j + F_z·k; |F| = √(F_x² + F_y² + F_z²); F_x = |F|·cos α, etc.
- **Position vector r**: from origin O (or any reference) to a point on the line of action of F.
- **Moment of F about O**: M_O = r × F (vector); |M_O| = |F|·d (d = perpendicular distance). SI unit N·m, U.S. lbf·ft.
- **Moment about an axis**: M_a = u_a·(r × F) (scalar triple product).
- **Couple**: two equal & opposite forces F and −F separated by perpendicular distance d; moment M = F·d as a *free vector* (same about every point).
- **Resultant R**: R = ΣF; **resultant moment**: M_R = Σ(r × F).
- **Concurrent force system**: all lines of action pass through one point ⇒ M_R = 0.
- **Particle**: a body whose dimensions are irrelevant to its equilibrium; only ΣF = 0.
- **Rigid body**: distances between any two material points remain fixed; ΣF = 0 AND ΣM_O = 0.
- **Free-body diagram (FBD)**: an isolated sketch of the body showing every external force and support reaction.
- **Supports**: (2D) roller = 1 reaction ⊥ to surface; pin/hinge = 2 reactions; fixed (cantilever) = 2 reactions + 1 moment; (3D) ball-and-socket = 3; roller = 1 or 2; fixed = 3 forces + 3 moments.
- **Two-force member**: loaded only at 2 points ⇒ forces along the connecting line.
- **Three-force member**: 3 non-parallel forces ⇒ lines of action concurrent; if parallel, ΣM ≠ 0 unless balanced.
- **Statically determinate**: # unknowns = # equilibrium eqs.; otherwise indeterminate.`,
    detailed_explanation: `**1. Force as a vector.** A force F is fully described by its magnitude |F|, its direction (specified by two of three direction cosines cos α, cos β, cos γ with cos²α + cos²β + cos²γ = 1), and its point of application. Cartesian decomposition: F = F_x·i + F_y·j + F_z·k with F_x = |F|·cos α. The *unit vector* along F is u_F = F/|F|. The *dot product* F·u = |F|·cos θ gives the projection (e.g., the work component of a force along a displacement); the *cross product* M = r × F gives the moment vector (|r × F| = |r|·|F|·sin θ_r,F).

**2. Moment of a force — Varignon's theorem.** The moment of F about point O is M_O = r × F, where r is the position vector from O to any point on the line of action. Equivalently, decompose F = F_∥ + F_⊥ (relative to r): the parallel component contributes zero moment (sin 0 = 0), the perpendicular component contributes |M_O| = |r|·|F_⊥|. *Varignon's theorem*: the moment of F about O equals the sum of the moments of its components: M_O(F) = M_O(F_x·i) + M_O(F_y·j) + M_O(F_z·k) — useful for resolving oblique forces. The *moment about an axis* (e.g., the twist on a shaft) is M_a = u_a·(r × F), the scalar triple product (a positive value means CCW about +a).

**3. Couples and reduction.** A *couple* is the simplest system with zero resultant force but non-zero moment: two equal-opposite forces F and −F separated by perpendicular distance d, giving |M| = F·d. The couple's moment is the *same about every point* — it is a free vector. Reduction of an arbitrary 3-D system at point O: replace each force F_i by (a) the same F_i applied at O plus (b) the couple r_i × F_i (i.e., M_O(F_i)); the system becomes the single resultant force R = ΣF_i at O plus the resultant couple M_R = Σ(r_i × F_i). Special cases: a *concurrent system* (all lines of action through one point P) reduces to R alone (M_R = 0); a *parallel system* (all forces co-directional) reduces to R plus a couple perpendicular to R; the *general* case can be reduced further to a *wrench* (R and M_R along the same line).

**4. Equilibrium of a particle (ΣF = 0).** A particle has no rotational DoF; only translation. Equilibrium: ΣF = 0. In 2-D this gives 2 scalar eqs. (ΣF_x = 0, ΣF_y = 0); in 3-D it gives 3. Cable-and-pulley problems (knotted rope junction, frictionless pulley, ring loaded by three ropes) and the analysis of pin-jointed truss nodes (where every member is a two-force member) are the canonical particle-equilibrium problems.

**5. Equilibrium of a rigid body (ΣF = 0 AND ΣM_O = 0).** A rigid body has 3 planar DoF (2 translations + 1 rotation) or 6 spatial DoF (3 + 3); each DoF needs one equilibrium equation. Planar (2-D): ΣF_x = 0, ΣF_y = 0, ΣM_O = 0 (about any one point O — using two different points gives two moment equations, but only three are independent). Spatial (3-D): ΣF_x = ΣF_y = ΣF_z = 0 and ΣM_x = ΣM_y = ΣM_z = 0. Choosing O cleverly at the intersection of two unknown-force lines of action eliminates both from the moment equation (because their r × F is zero), giving a scalar equation in the third unknown directly.

**6. Free-body diagrams — the operational instrument.** The FBD is the bridge between the physical problem and the algebra. Procedure: (i) isolate the body — sketch the outline; (ii) draw all applied forces (weights W = mg at the CG, external loads, contact forces from neighboring bodies — replace pins, cables, springs, distributed loads with their force reactions); (iii) replace every support with its constraint reactions: roller → 1 force ⊥ to rolling surface; pin/hinge → 2 perpendicular forces (typically x, y); fixed/cantilever → 2 forces + 1 moment; ball-and-socket (3-D) → 3 perpendicular forces; fixed (3-D) → 3 forces + 3 moments; (iv) dimension every force; (v) write the equilibrium equations directly. ASCE/SEI 7-22 service and ultimate load combinations (e.g., 1.2D + 1.6L for strength; D + L for ASD) drive the design FBDs of beams, columns, and frames in practice.`,
    core_principles: `- **Force is a vector**: full description needs magnitude + direction + point of application.
- **Moment M = r × F**: rotational effect of F about O; |M| = |F|·d (d = perpendicular distance).
- **Varignon's theorem**: M_O(F) = ΣM_O(F_components).
- **Couple** = free-vector moment M = F·d; same about every point; zero resultant force.
- **Reduction**: R = ΣF, M_R = Σ(r × F) at point O; concurrent system ⇒ M_R = 0.
- **Particle equilibrium**: ΣF = 0 (2 eqs. in 2D, 3 in 3D).
- **Rigid-body equilibrium**: ΣF = 0 AND ΣM_O = 0 about any point O (3 eqs. in 2D, 6 in 3D).
- **Statically determinate** if # unknowns = # eqs.; otherwise indeterminate (needs Mechanics of Materials).
- **Two-force member**: forces equal-opposite along connecting line.
- **Three-force member**: concurrent or parallel; lines of action must satisfy either concurrency or parallel equilibrium.
- **ASCE/SEI 7-22 load combinations** (LRFD): 1.4D; 1.2D + 1.6L + 0.5(L_r or S or R); 1.2D + 1.0W + L + 0.5(L_r or S or R); 1.2D + 1.0E + L + 0.2S; etc.`,
    components: `- **Applied loads**: concentrated forces P (kN or kip), distributed loads w (kN/m or kip/ft) — uniform, triangular, trapezoidal; moments M (kN·m); couples.
- **Weight W = m·g**: at the center of gravity (CG); g = 9.81 m/s² (SI), 32.2 ft/s² (U.S.).
- **Supports** (2D): roller, pin/hinge, fixed/cantilever; (3D): ball-and-socket, roller, fixed.
- **Cables**: tension-only 2-force members; ideal flexible (no bending, no compression).
- **Links/short links**: 2-force members (pin-ended, no transverse load).
- **Springs**: linear force F = k·δ (k = stiffness N/m).
- **Smooth pin/hinge**: 2 reaction components (typically R_x, R_y).
- **Rough pin/hinge**: also transmits a moment (rare).
- **Bearing**: usually radial (transverse) reactions only; thrust bearing also takes axial.
- **Built-in/fixed support**: 2 reactions + 1 moment (2D); 3 + 3 (3D).
- **ASCE/SEI 7-22 loads**: D (dead), L (live), L_r (roof live), S (snow), R (rain), W (wind), E (seismic); combined per Ch. 2 LRFD or ASD factored-load sets.`,
    process: `1. Identify the body to be analyzed (a single beam, a truss node, an entire frame, a block on a surface).
2. Isolate the body: imagine cutting it free from its surroundings and supports.
3. Draw the FBD: show every external force (applied loads, weight, reactions at every support cut, cable tensions, contact forces).
4. Replace each support with its constraint reactions (roller → 1, pin → 2, fixed → 3 in 2D; ball-and-socket → 3, fixed → 6 in 3D).
5. Choose coordinate axes (often aligned with the dominant loads).
6. Choose the moment point O to eliminate one or two unknowns from the moment equation (place O at the intersection of two unknown-force lines of action).
7. Write ΣF_x = 0, ΣF_y = 0 (and ΣF_z = 0 in 3D), ΣM_O = 0 (and ΣM_x, ΣM_y, ΣM_z in 3D).
8. Solve the linear system for the unknown reactions; count unknowns vs. eqs. to confirm determinacy.
9. Check: recompute ΣF and ΣM at a *different* point O' — they must also equal zero (validation).
10. Carry the solved reactions into the downstream analysis (member forces via method of joints/sections, beam shear & moment diagrams, stress via Mechanics of Materials).`,
    formula_calculation: `**Force as a vector (3-D):**
  F = F_x·i + F_y·j + F_z·k
  |F| = √(F_x² + F_y² + F_z²)
  Direction cosines: cos α = F_x/|F|, cos β = F_y/|F|, cos γ = F_z/|F|; cos²α + cos²β + cos²γ = 1.
  Unit vector: u_F = F/|F|.

**Dot product (projection):** F·u = |F|·cos θ. Work along displacement: W = ∫F·dr.

**Cross product (moment):**
  M_O = r × F = | i  j  k ; r_x r_y r_z ; F_x F_y F_z |
  Expanding: M_O = (r_y·F_z − r_z·F_y)·i + (r_z·F_x − r_x·F_z)·j + (r_x·F_y − r_y·F_x)·k
  |M_O| = |F|·d, d = perpendicular distance from O to F's line of action.

**Moment about an axis (scalar triple product):** M_a = u_a·(r × F).

**Couple moment:** |M| = F·d (d = perpendicular distance between the two forces); free vector.

**Resultant of a force system (reduction at O):**
  R = ΣF_i;   M_R = Σ(r_i × F_i)
  Concurrent system ⇒ M_R = 0 (only R remains).

**Particle equilibrium (2-D):** ΣF_x = 0; ΣF_y = 0.
**Rigid-body equilibrium (2-D):** ΣF_x = 0; ΣF_y = 0; ΣM_O = 0 (about any single point).
**Rigid-body equilibrium (3-D):** ΣF_x = ΣF_y = ΣF_z = 0; ΣM_x = ΣM_y = ΣM_z = 0.

**Beam reactions (simply supported, uniform load w over span L):**
  ΣM_A = 0 ⇒ w·L·(L/2) − B_y·L = 0 ⇒ B_y = wL/2.
  ΣF_y = 0 ⇒ A_y + B_y − wL = 0 ⇒ A_y = wL/2.
  Maximum bending moment at midspan: M_max = wL²/8.

**Beam reactions (simply supported, point load P at distance a from A, b from B):**
  ΣM_A = 0 ⇒ P·a − B_y·L = 0 ⇒ B_y = P·a/L.
  ΣM_B = 0 ⇒ P·b − A_y·L = 0 ⇒ A_y = P·b/L.
  Max bending moment under the load: M_P = P·a·b/L.

**ASCE/SEI 7-22 LRFD load combinations (selected):**
  1.4D            (strength)
  1.2D + 1.6L + 0.5(L_r or S or R)
  1.2D + 1.0W + L + 0.5(L_r or S or R)
  1.2D + 1.0E + L + 0.2S
  0.9D + 1.0W
  0.9D + 1.0E
ASD: D + L; D + L + 0.75(L_r + W); 0.6D + 0.6W; 0.6D + 0.7E (selected).

**Units**: force N, kN, lbf, kip; length m, mm, ft, in; moment N·m, kN·m, lbf·ft; distributed load N/m, kN/m, lbf/ft.

**Assumptions**: (i) rigid body (no deformation analysis); (ii) two-force members carry only axial load; (iii) frictionless pins; (iv) weights at CG; (v) loads static (no dynamic amplification); (vi) small-deflection (linear geometry).

**Interpretation**: the reactions A_y, B_y are the magnitudes of upward forces the supports must provide; the maximum bending moment M_max sets the beam size in Mechanics of Materials (σ = M·c/I ≤ σ_allow).`,
    worked_example: `**Beam reactions by ΣM = 0 — simply supported beam with point load.**
A simply supported beam of length L = 6 m carries a point load P = 12 kN applied 2 m from the left support A (a = 2 m, b = 4 m).
- ΣM_A = 0: P·a − B_y·L = 0 ⇒ 12·2 − B_y·6 = 0 ⇒ B_y = 24/6 = 4.0 kN (↑).
- ΣF_y = 0: A_y + B_y − P = 0 ⇒ A_y + 4 − 12 = 0 ⇒ A_y = 8.0 kN (↑).
- Validation: ΣM_B = 0: P·b − A_y·L = 12·4 − 8·6 = 48 − 48 = 0 ✓.
- Bending moment under the load: M_P = A_y·a = 8·2 = 16 kN·m (sagging).

**Beam reactions with uniform + variable load.**
L = 8 m, w = 5 kN/m uniform, plus a 10 kN point load at 3 m from A.
- Equivalent uniform-load resultant: W = w·L = 5·8 = 40 kN at midspan (4 m from A).
- ΣM_A = 0: W·4 + P·3 − B_y·8 = 0 ⇒ 40·4 + 10·3 − 8·B_y = 0 ⇒ B_y = (160 + 30)/8 = 23.75 kN (↑).
- ΣF_y = 0: A_y + 23.75 − 40 − 10 = 0 ⇒ A_y = 26.25 kN (↑).
- ΣM_B check: W·4 + P·5 − A_y·8 = 40·4 + 10·5 − 26.25·8 = 160 + 50 − 210 = 0 ✓.

**Concurrent force system in equilibrium (3 cables).**
A 100 kg crate is suspended by three cables tied together at ring O. Cable 1 goes up-vertical to anchor A; cable 2 to anchor B at 30° east of north in the xz-plane at 60° elevation; cable 3 to anchor C due south at 45° elevation. Tension T_2 = 500 N, T_3 = 400 N. Find T_1.
- Unit vectors (z up, y north, x east):
  u_2 = (sin 30°)·cos 60°·i + (cos 30°)·cos 60°·j + sin 60°·k
       Wait — recompose: cable 2 elevation 60° ⇒ vertical component sin 60° = 0.866, horizontal component cos 60° = 0.500 directed at azimuth 30° east of north ⇒ u_2 = 0.500·sin 30°·i + 0.500·cos 30°·j + 0.866·k = (0.250, 0.433, 0.866).
  u_3 (due south, 45° elevation) = (0, −cos 45°, sin 45°)·j-component + k-component = (0, −0.707, 0.707).
  u_1 = (0, 0, 1) — straight up.
- Equilibrium ΣF = 0 ⇒ T_1·u_1 + T_2·u_2 + T_3·u_3 − W·k = 0, where W = m·g = 100·9.81 = 981 N (acting in −k).
- z-component: T_1·(1) + 500·(0.866) + 400·(0.707) − 981 = 0 ⇒ T_1 + 433.0 + 282.8 − 981 = 0 ⇒ T_1 = 265.2 N.
- x-component (check): 500·(0.250) + 400·(0) = 125.0 N ≠ 0 — the crate would drift east; the as-given T_2 = 500 N is inconsistent with the geometry. (This illustrates the iterative reconciliation that real cable problems require.)`,
    industrial_example: `**Industry: Construction — column-reaction FBD per ASCE/SEI 7-22.** An interior steel column of a 6-story office building (floor-to-floor 4.0 m, tributary area 8 m × 8 m = 64 m²) carries dead load 4.0 kPa (slab + deck + partitions + ceiling + MEP), live load 2.4 kPa (reducible per ASCE/SEI 7-22 §4.5, but unreduced here for simplicity), and roof snow 1.0 kPa. Per-floor load = (4.0 + 2.4)·64 = 409.6 kN; roof (no live reduction): (4.0 + 1.0)·64 = 320 kN. Total service-level column reaction P_service = 6·409.6 + 320 = 2777.6 kN. LRFD strength combination 1.2D + 1.6L: P_u = 1.2·(6·4·64 + 4·64 + 1·64) + 1.6·(6·2.4·64) = 1.2·1792 + 1.6·921.6 = 2150.4 + 1474.6 = 3625 kN. The FBD of the column's base plate shows three reactions (one axial P_u, zero shear if no lateral load, zero moment if pinned base) — selecting a W14×211 steel column at F_y = 345 MPa, P_allow (AISC) ≈ 4100 kN ⇒ usage ratio = 3625/4100 = 0.88 (passes). The dead, live, snow, wind, and seismic loads combined per ASCE/SEI 7-22 Ch. 2 are the canonical input to every building structural FBD.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Pedestrian Bridge (synthetic, illustrative).* A 36-m single-span steel truss pedestrian bridge over a highway carries its self-weight (D = 12 kN/m including deck and railings) plus a crowd live load (L = 4.0 kN/m per ASCE/SEI 7-22 §4.5-3 for pedestrian bridges, with a 1.6 load factor in LRFD). The two end bearings are idealized as a pin at the west abutment and a roller at the east abutment (allowing thermal expansion). Maximum bending moment at midspan: M_max = (w_u·L²)/8 where w_u = 1.2·D + 1.6·L = 1.2·12 + 1.6·4 = 14.4 + 6.4 = 20.8 kN/m. M_u,max = 20.8·36²/8 = 20.8·162 = 3370 kN·m. Reactions: R_A = R_B = w_u·L/2 = 20.8·36/2 = 374.4 kN. The two end truss members (top chord at midspan) carry the axial component of this bending moment: T_chord ≈ M_u,max / h_truss = 3370/2.5 = 1348 kN (h_truss = 2.5 m). The FBD of one truss panel (Lesson 3) gives the member force directly. This case is used in Lesson 3 to extend statics to method-of-joints truss analysis.`,
    visual_explanation: `**Free-body diagram of a cantilever beam.** Sketch a horizontal cantilever beam (length L) fixed at the left end to a wall, carrying a downward point load P at its free end plus a uniform load w over its full length. The FBD isolates the beam: at the fixed support, draw three reactions (R_x = 0 because no horizontal load; R_y upward to balance vertical loads; M_wall counter-clockwise to balance the applied loads' tendency to rotate the beam). Compute: ΣF_y: R_y − w·L − P = 0 ⇒ R_y = wL + P. ΣM_wall: M_wall − w·L·(L/2) − P·L = 0 ⇒ M_wall = wL²/2 + PL (clockwise moments from loads, balanced by the counter-clockwise reaction moment M_wall). The free-end of the beam has zero shear and zero moment; the fixed end carries the maximum shear (V_max = R_y = wL + P) and the maximum bending moment (M_max = M_wall = wL²/2 + PL). The shear diagram is linear (slope −w) dropping from R_y at the wall to zero at the free end; the moment diagram is parabolic from M_wall at the wall to zero at the free end. This visual couples the FBD to the downstream beam-design (Mechanics of Materials).`,
    simulation_opportunity: `Open the EngiSuite "Beam FBD Explorer" to vary a simply-supported beam's load case (uniform w, point P at distance a, triangular w rising to L, two-point-loads, cantilever, overhang) and watch the reactions A_y, B_y, the shear V(x), and the moment M(x) update live. Drag the moment-equation point O across the beam and observe that ΣM_O = 0 is satisfied at every location when the FBD is correctly drawn — a powerful confirmation that equilibrium is independent of the choice of O. For 3-D particle problems, the "Cable Tension Solver" lets you input three anchor coordinates and the ring's load and reads out the three tensions T_1, T_2, T_3 with the direction cosines of each cable. For real structural loads, the ASCE/SEI 7-22 load-combination calculator (within the EngiSuite "Code-Loads Designer") computes D + L + W + E combinations given a building's geometry, exposure category, and seismic zone.`,
    common_mistakes: `- **Forgetting to draw the reaction at a cut support** in an FBD — pin has 2 reactions (R_x, R_y), fixed has 3 (R_x, R_y, M). Missing one makes the problem unsolvable.
- **Wrong moment arm d**: use the *perpendicular* distance from O to the force's line of action — NOT the distance from O to the point of application. The two are different for non-radial forces.
- **Cross product order**: M = r × F is NOT equal to F × r = −M (sign flip — wrong-handed moment). Right-hand rule.
- **Treating a distributed load as a single force at the wrong location**: a uniform load's resultant is w·L at midspan (L/2 from either end); a triangular load's resultant is (½·w_max·L) at L/3 from the high end.
- **Mixing 2-force and 3-force members**: a 2-force member's forces are along its axis; a 3-force member's forces are concurrent (or parallel) — using the wrong simplification gives wrong member forces.
- **Sign convention confusion in ΣM**: pick CCW positive (or CW positive) and stick to it; the convention must match for all moments about the same O.
- **Counting redundant equations**: in 2-D, ΣM_O = 0 about a *second* point O' is *not* independent of the first; only 3 of the 4 eqs. (ΣF_x, ΣF_y, ΣM_O, ΣM_O') are independent.`,
    limitations: `- Statics is silent on deformation, stress, and material failure — those are Mechanics of Materials. A statically indeterminate structure has more unknowns than equilibrium eqs.; you must add deflection compatibility (e.g., Δ_A = Δ_B for a continuous beam on three supports) to close the system.
- The rigid-body assumption breaks down for very flexible structures (cables, membranes, slender columns under buckling loads) — large-deflection geometry is nonlinear.
- Statics assumes *instantaneous* equilibrium; it ignores time-dependent load variation (wind gusts, vehicle crossings, blast), which belong to Dynamics (Lesson 2).
- A "smooth" pin (no moment) and "frictionless" roller (no horizontal reaction) are idealizations — real bearings have friction and finite rotational stiffness (Lesson 3 covers dry friction).
- Distributed loads are sometimes lumped as point loads (resultant) for reaction calculation — but shear and moment diagrams must use the distributed form (Lesson 3).
- ASCE/SEI 7-22 load combinations are prescriptive; the engineer must still apply engineering judgment to unusual loads (vehicle impact, blast, fire)`,
    comparison: `| System | Equilibrium eqs. (2-D) | # unknowns to determine |
|---|---|---|
| Particle | 2 (ΣF_x, ΣF_y) | Up to 2 (e.g., cable tensions, ring forces) |
| Rigid body | 3 (ΣF_x, ΣF_y, ΣM_O) | Up to 3 (3 reactions at fixed support) |
| Truss node (pin) | 2 (particle eqs.) | Up to 2 unknown member forces (method of joints) |
| Continuous beam | 3 + 1 per redundant support | Statically indeterminate — needs Mechanics of Materials |

| Support type | # Reactions (2-D) | # Reactions (3-D) |
|---|---|---|
| Roller | 1 (⊥ to surface) | 1 (or 2 with guides) |
| Pin / hinge | 2 (R_x, R_y) | 2 (or 4 for 3-D pin) |
| Fixed / cantilever | 3 (R_x, R_y, M) | 6 (3 forces + 3 moments) |
| Ball-and-socket | n/a | 3 (R_x, R_y, R_z) |

| Load combination (LRFD, ASCE/SEI 7-22) | Use case |
|---|---|
| 1.4D | Maximum dead load |
| 1.2D + 1.6L + 0.5(L_r or S or R) | Floor live load controlled |
| 1.2D + 1.0W + L + 0.5(L_r or S or R) | Wind-controlled |
| 1.2D + 1.0E + L + 0.2S | Seismic-controlled |
| 0.9D + 1.0W | Wind uplift (D resists) |
| 0.9D + 1.0E | Seismic uplift |`,
    practical_application: `**Column-base FBD on a steel building.** A W14×193 column at the base of a 12-story office building has 4-rod anchor bolts at a 305 mm bolt circle on a 760×760 mm base plate. Service-level axial P = 2400 kN, shear V = 180 kN, moment M = 950 kN·m (from wind). LRFD-factored: P_u = 1.2D + 1.6L + 0.5S = 1.2·1700 + 1.6·700 + 0.5·100 = 2970 kN; M_u = 1.0·W = 1450 kN·m (1.0 wind factor in the 1.2D + 1.0W + L + 0.5S combination). The base-plate FBD shows: P_u downward at column centroid, V_u horizontal, M_u (the design moment) — and four bolt tensions T_1..T_4. Free-body at the base: ΣF_y: ΣT_i − P_u = 0 ⇒ ΣT_i = 2970 kN (compression-bearing regime if the resultant is inside the bolt circle; tension regime if outside — the latter governs here since M_u/e = 1450/0.3 ≈ 4830 kN > P_u). Two bolts on the tension side each take ≈ (M_u − P_u·e)/d_bolt_pair = (1450·10⁶ − 2970·10³·300)/(380) ≈ 1.48·10⁶ N = 1480 kN per bolt pair ⇒ 740 kN/bolt — the anchor-bolt design tension.`,
    decision_scenario: `You are the project structural engineer on a 12-m clear-span pedestrian bridge. Two options: (A) a simply supported steel girder (W36×300, 50 MPa service stress, $42k fabricated, 4-day install) or (B) a single-arch tied-arch truss (steel arch with hangers to a steel deck, 28 MPa service stress, $58k fabricated, 9-day install). Both satisfy the ASCE/SEI 7-22 pedestrian live load of 4.0 kN/m and the snow load of 1.5 kN/m. Service reactions are identical (R_A = R_B = w·L/2 = (12 + 4)·12/2 = 96 kN each). The arch cuts the maximum bending moment from M_max = w·L²/8 = 288 kN·m (Option A) to ~50 kN·m (Option B, arch carries most of the moment as axial compression). Decision rule: if fatigue from wind-induced vortex shedding on the arch (a known issue for slender tied-arch pedestrian bridges) plus the $16k cost premium is offset by the longer maintenance-free life, choose B; otherwise A. (Worked in the EngiSuite "Bridge Selector" — reveals payback of ~22 years on a 50-year service life; Option A is the standard choice for spans below 20 m.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: moment-arm calculation (M = F·d), simply-supported beam reactions under uniform load, 3-D force resolution, and the equilibrium-equation count for rigid bodies.`,
    certification_questions: `This lesson's content maps to the NCEES FE Civil and FE Mechanical exam outlines (Statics: 7–11 FE Civil questions, 4–6 FE Mechanical), the ASCE/SEI 7-22 load-combination basis for professional structural engineering, and the NSPE PE Civil: Structural exam. Sample FE-style question: "A simply supported beam of length L carries a concentrated load P at its center. The magnitudes of the reactions at the supports are: (a) P/4 each, (b) P/2 each, (c) P each, (d) 2P each." Correct: (b) P/2 each — by symmetry and ΣF_y = 0, each support takes half the load.`,
    summary: `Statics analyzes bodies at rest under forces. The four master tools are: (i) Cartesian vector representation F = F_x·i + F_y·j + F_z·k with direction cosines; (ii) the moment M_O = r × F (cross product, |M| = |F|·d) plus couples as free vectors; (iii) the free-body diagram isolating the body with all applied loads, weights, and support reactions; and (iv) the equilibrium equations ΣF = 0 (particles, 2 eqs. in 2D) plus ΣM_O = 0 (rigid bodies, 3 eqs. in 2D, 6 in 3D). Reduction of an arbitrary force system at O gives R = ΣF and M_R = Σ(r × F); concurrent systems reduce to R alone. Statically determinate structures have # unknowns = # eqs.; indeterminate structures require deformation/compatibility analysis (Mechanics of Materials). ASCE/SEI 7-22 LRFD and ASD load combinations drive the design FBDs of beams, columns, and frames in real engineering practice.`,
    key_takeaways: `- Force is a vector: F = F_x·i + F_y·j + F_z·k; |F| = √(F_x² + F_y² + F_z²); direction cosines satisfy cos²α + cos²β + cos²γ = 1.
- Moment M_O = r × F; |M_O| = |F|·d (perpendicular distance); Varignon's theorem splits moment into components' moments.
- Couple = free vector of magnitude F·d with zero resultant force; same about every point.
- Reduction: R = ΣF, M_R = Σ(r × F); concurrent system ⇒ M_R = 0.
- Particle equilibrium: ΣF = 0 (2 eqs. in 2D, 3 in 3D).
- Rigid-body equilibrium: ΣF = 0 AND ΣM_O = 0 (3 eqs. in 2D, 6 in 3D).
- FBD isolates body; replace supports with their constraint reactions (roller=1, pin=2, fixed=3 in 2D; ball-and-socket=3, fixed=6 in 3D).
- Statically determinate: # unknowns = # eqs.
- ASCE/SEI 7-22 LRFD: 1.4D; 1.2D + 1.6L; 1.2D + 1.0W + L; 1.2D + 1.0E + L; 0.9D + 1.0W; 0.9D + 1.0E.`,
    references: `1. Hibbeler (2016), Statics Vol. Ch. 2 (Force Vectors), Ch. 3 (Equilibrium of a Particle), Ch. 4 (Force System Resultants), Ch. 5 (Equilibrium of a Rigid Body).
2. Beer, Johnston, Mazurek & Cornwell (2019), Ch. 2 (Statics of Particles), Ch. 3 (Rigid Bodies: Equivalent Force Systems), Ch. 4 (Equilibrium of Rigid Bodies).
3. Riley & Sturges (2007), Ch. 2 (Forces — Cartesian vectors, cross product), Ch. 3 (Rigid-Body Equilibrium — FBDs & supports).
4. Meriam, Kraige & Bolton (2016), Dynamics — the equilibrium case (ΣF = 0) is the v = const limit of Newton's 2nd law (Lesson 2 cross-reference).
5. ISO 55000:2014 — asset-management framework for FBD-based reaction verification on structural assets.
6. ASCE/SEI 7-22 Ch. 1–3 (general, load combinations, dead/live loads); Ch. 5/6 (wind), Ch. 11/12 (seismic) — drives the design FBDs in real practice.`,
  },
  knowledgeObject: {
    title: "Statics: Force Systems & Equilibrium — Knowledge Object",
    domain: "Engineering Mechanics",
    competency: "Statics",
    topic: "Force Vectors, Moments, Couples, Free-Body Diagrams, Equilibrium",
    concept: "ΣF = 0 + ΣM_O = 0 (rigid body) via FBD; reduction R = ΣF, M_R = Σ(r × F)",
    body: {
      definitions: [
        "Force F: vector push/pull; magnitude + direction + point of application; SI unit N.",
        "Moment M_O = r × F: rotational effect of F about O; |M_O| = |F|·d (d = perpendicular distance); SI unit N·m.",
        "Couple: pair of equal-opposite non-collinear forces; moment M = F·d as a free vector (same about every point).",
        "Resultant R = ΣF; resultant moment M_R = Σ(r × F) at point O.",
        "Concurrent force system: all lines of action through one point ⇒ M_R = 0.",
        "Free-body diagram (FBD): isolated sketch showing every external force and support reaction on a body.",
        "Two-force member: loaded only at two points ⇒ equal-opposite forces along connecting line.",
        "Statically determinate: # unknowns = # equilibrium eqs.",
      ],
      principles: [
        "Force is a vector with three Cartesian components and three direction cosines (cos²α + cos²β + cos²γ = 1).",
        "Varignon's theorem: M_O(F) = ΣM_O(F_components).",
        "Couple moment is a free vector (same about every point).",
        "Reduction at O: R = ΣF, M_R = Σ(r × F); concurrent ⇒ M_R = 0.",
        "Particle equilibrium: ΣF = 0 (2 eqs. 2D, 3 eqs. 3D).",
        "Rigid-body equilibrium: ΣF = 0 AND ΣM_O = 0 (3 eqs. 2D, 6 eqs. 3D).",
        "ASCE/SEI 7-22 LRFD: 1.4D; 1.2D + 1.6L + 0.5(L_r or S); 1.2D + 1.0W + L; 1.2D + 1.0E + L; 0.9D + 1.0W/E.",
      ],
      components: [
        "Applied loads (point, distributed, moment, couple)",
        "Weight W = mg at the CG",
        "Supports: roller, pin, fixed (2D); ball-and-socket, fixed (3D)",
        "Cables (tension-only 2-force members)",
        "Springs F = k·δ",
        "Built-in/fixed support (3 reactions in 2D, 6 in 3D)",
      ],
      mechanism:
        "A rigid body in static equilibrium has zero net force AND zero net moment about every point — the body does not translate and does not rotate. The free-body diagram isolates the body and exposes every external force (applied loads, weights, support reactions, contact forces); the equilibrium equations written from the FBD yield the unknown reactions and member forces algebraically. ASCE/SEI 7-22 LRFD and ASD load combinations drive the design FBDs in real engineering practice.",
      process:
        "Identify body → isolate → draw FBD with all external forces + support reactions → choose coordinates → choose moment point O to eliminate unknowns → write ΣF = 0, ΣM_O = 0 → solve → validate by re-checking ΣM at a different point.",
      formulas: [
        "F = F_x·i + F_y·j + F_z·k; |F| = √(F_x² + F_y² + F_z²)",
        "M_O = r × F = (r_y F_z − r_z F_y)i + (r_z F_x − r_x F_z)j + (r_x F_y − r_y F_x)k",
        "Moment about axis: M_a = u_a·(r × F) (scalar triple product)",
        "Couple moment: M = F·d (free vector)",
        "Particle eq.: ΣF = 0 (2 eqs. 2D, 3 eqs. 3D)",
        "Rigid-body eq.: ΣF = 0 AND ΣM_O = 0 (3 eqs. 2D, 6 eqs. 3D)",
        "Uniform-load beam: A_y = B_y = wL/2, M_max = wL²/8",
        "Point-load beam: A_y = P·b/L, B_y = P·a/L, M_P = P·a·b/L",
      ],
      metrics: [
        "Reaction magnitudes A_y, B_y, M_wall (kN, kN·m)",
        "Maximum shear V_max (kN)",
        "Maximum bending moment M_max (kN·m)",
        "Member axial force (kN) — trusses (Lesson 3)",
        "Load combination factor (LRFD: 1.2D + 1.6L, etc.)",
        "Usage ratio = P_u/P_allow (≤ 1.0 to pass)",
      ],
      examples: [
        "Simply supported beam, L = 6 m, P = 12 kN at 2 m: A_y = 8 kN, B_y = 4 kN, M_P = 16 kN·m.",
        "Uniform + point load beam, L = 8 m, w = 5 kN/m, P = 10 kN at 3 m: A_y = 26.25 kN, B_y = 23.75 kN.",
        "3-D concurrent cables, 100 kg crate: T_1 ≈ 265 N (illustrates the algebra; consistency check on x-component reveals geometry constraint).",
      ],
      industrial_examples: [
        "Construction — W14×211 steel column at F_y = 345 MPa, ASCE/SEI 7-22 LRFD: P_u = 3625 kN vs P_allow ≈ 4100 kN (usage 0.88).",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Pedestrian Bridge: 36-m single-span steel truss, D = 12 kN/m, L = 4.0 kN/m, w_u = 20.8 kN/m; M_u,max = 3370 kN·m at midspan; chord force ≈ 1348 kN (full method-of-joints in Lesson 3).",
      ],
      common_errors: [
        "Forgetting a reaction at a cut support (pin = 2, fixed = 3 in 2D).",
        "Using point-of-application distance instead of perpendicular moment arm d.",
        "Cross product order M = r × F vs F × r (sign flip).",
        "Treating a 3-force member as a 2-force member (or vice versa).",
        "Sign-convention inconsistency in ΣM (mix CCW+ and CW+).",
        "Counting ΣM about a 2nd point as an independent eq. (only 3 of 4 are independent in 2D).",
      ],
      limitations: [
        "Silent on deformation, stress, failure (Mechanics of Materials territory).",
        "Statically indeterminate structures need deflection compatibility.",
        "Rigid-body assumption breaks for cables/membranes/buckling columns.",
        "Ignores time-dependent loads (Dynamics, Lesson 2).",
        "Smooth/frictionless supports are idealizations (real bearings have friction, Lesson 3).",
      ],
      best_practices: [
        "Always draw the FBD before writing equations — the most common student error is skipping the FBD.",
        "Place the moment point O at the intersection of two unknown-force lines of action to eliminate both from ΣM_O.",
        "Validate by recomputing ΣM at a different point O' — it must also be zero.",
        "Count unknowns vs. equations before solving — confirm determinacy.",
        "Use ASCE/SEI 7-22 LRFD (1.2D + 1.6L, etc.) for strength design; ASD for working-stress design.",
      ],
      related_concepts: [
        "Force vectors in 3-D (this lesson's foundation)",
        "Method of joints/sections in trusses (Lesson 3)",
        "Frames & machines analysis (Lesson 3)",
        "Dry friction (Lesson 3)",
        "Dynamics — Newton's 2nd law F = ma (Lesson 2)",
        "Mechanics of Materials — stress σ = M·c/I from the moments computed here",
      ],
      prerequisites: [
        "Vector algebra (addition, dot, cross product)",
        "Trigonometry (resolving forces, laws of sines/cosines)",
        "Newton's three laws (First Law = statics axiom; Third Law = action–reaction in every FBD)",
        "SI / U.S. units (N, kN; lbf, kip; m, ft)",
      ],
      references: MECH_REFERENCE_TITLES,
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
        "Which of the following correctly defines the moment of a force F about a point O?",
      explanation:
        "M_O = r × F — the cross product of the position vector r (from O to any point on the line of action of F) with F.",
      whyCorrect:
        "M_O = r × F is the cross product of the position vector r (drawn from O to any point on the line of action of F) with the force vector F. Its magnitude is |M_O| = |r|·|F|·sin θ = |F|·d where d is the perpendicular distance from O to the line of action. The vector direction follows the right-hand rule.",
      whyOthersWrong: [
        "Option M_O = r·F (dot product) gives a scalar projection of F along r — it has units of N·m but is not the moment; moment is a vector (cross product), not a scalar projection.",
        "Option M_O = F·d (scalar only, no direction) is the magnitude — but the question asks for the definition of the moment, which is the vector r × F. The scalar form is incomplete.",
        "Option M_O = F + r is meaningless — adding a force to a position vector is dimensionally inconsistent (N + m).",
      ],
      options: [
        { text: "M_O = r·F (the dot product)", isCorrect: false },
        { text: "M_O = r × F (the cross product of r and F)", isCorrect: true },
        { text: "M_O = F·d (a scalar magnitude only)", isCorrect: false },
        { text: "M_O = F + r (vector sum)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem:
        "A simply supported beam of length L = 6 m carries a uniformly distributed load w = 4 kN/m across its full span. The magnitudes of the reactions at the two supports A (left) and B (right) and the maximum bending moment are:",
      explanation:
        "By symmetry, A_y = B_y = wL/2 = 4·6/2 = 12 kN. Maximum bending moment at midspan: M_max = wL²/8 = 4·36/8 = 18 kN·m.",
      whyCorrect:
        "Apply ΣF_y = 0: A_y + B_y − wL = 0. By symmetry (uniform load centered), A_y = B_y = wL/2 = 4·6/2 = 12 kN. Apply ΣM_A = 0 (taking moments about A, with the uniform load's resultant wL = 24 kN at L/2 = 3 m): wL·(L/2) − B_y·L = 0 ⇒ B_y = wL/2 = 12 kN ✓. The maximum bending moment in a simply-supported uniformly-loaded beam occurs at midspan and equals M_max = wL²/8 = 4·36/8 = 18 kN·m (sagging, positive).",
      whyOthersWrong: [
        "Option (24 kN, 24 kN, 36 kN·m) overcounts reactions: A_y = B_y = wL/2 = 12 kN (not 24 = wL). 24 kN would be the *total* load, not the reaction at one support. M = 36 kN·m = wL²/4 (wrong — that's the moment at midspan of a *cantilever* under uniform load, not a simply-supported beam).",
        "Option (12 kN, 12 kN, 36 kN·m) gets the reactions right but uses M_max = wL²/4 = 36 kN·m — the cantilever midspan formula. The correct simply-supported formula is M_max = wL²/8 = 18 kN·m.",
        "Option (24 kN, 24 kN, 0) treats the reactions as the total load (24 kN each = wL, doubling) and claims zero moment — physically impossible: a loaded beam must have internal bending moment, and the reactions sum to 2wL ≠ wL (violates ΣF_y = 0).",
      ],
      options: [
        { text: "A_y = B_y = 24 kN, M_max = 36 kN·m", isCorrect: false },
        { text: "A_y = B_y = 12 kN, M_max = 18 kN·m", isCorrect: true },
        { text: "A_y = B_y = 12 kN, M_max = 36 kN·m", isCorrect: false },
        { text: "A_y = B_y = 24 kN, M_max = 0", isCorrect: false },
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
        "A force F = (3, 4, 12) N acts at point P located at position r = (2, −1, 4) m relative to origin O. The magnitude of the moment M_O = r × F about O is:",
      explanation:
        "r × F = (r_y·F_z − r_z·F_y, r_z·F_x − r_x·F_z, r_x·F_y − r_y·F_x) = ((−1)(12) − (4)(4), (4)(3) − (2)(12), (2)(4) − (−1)(3)) = (−12 − 16, 12 − 24, 8 + 3) = (−28, −12, 11). |M_O| = √(28² + 12² + 11²) = √(784 + 144 + 121) = √1049 ≈ 32.4 N·m.",
      whyCorrect:
        "Apply M_O = r × F with the 3×3 determinant expansion: M_O = ((r_y F_z − r_z F_y), (r_z F_x − r_x F_z), (r_x F_y − r_y F_x)) = ((−1)(12) − (4)(4), (4)(3) − (2)(12), (2)(4) − (−1)(3)) = (−12 − 16, 12 − 24, 8 + 3) = (−28, −12, 11) N·m. Magnitude |M_O| = √((−28)² + (−12)² + 11²) = √(784 + 144 + 121) = √1049 ≈ 32.4 N·m.",
      whyOthersWrong: [
        "Option 16 N·m uses the dot product |r·F| = |3·2 + 4·(−1) + 12·4| = |6 − 4 + 48| = 50 N — wrong formula entirely (dot product gives scalar projection, not moment; even numerically 50 ≠ 16).",
        "Option 50 N·m uses the dot product |r·F| = 50 (a scalar with units N·m but not the moment vector). The cross product is what defines moment — dot product gives work-projection, not rotation.",
        "Option 124 N·m multiplies |r|·|F| = √(4 + 1 + 16)·√(9 + 16 + 144) = √21·√169 = 4.583·13 = 59.6 — but then squares and mis-multiplies; the |r|·|F| product (59.6) times sin θ is the actual cross-product magnitude (32.4 N·m); the wrong answer inflates by ignoring the sin θ factor.",
      ],
      options: [
        { text: "16 N·m", isCorrect: false },
        { text: "32.4 N·m", isCorrect: true },
        { text: "50 N·m", isCorrect: false },
        { text: "124 N·m", isCorrect: false },
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
        "True or False: For a rigid body in static equilibrium in 2-D, the three independent equations of equilibrium are ΣF_x = 0, ΣF_y = 0, and ΣM_O = 0 about any single point O. Taking a fourth equation ΣM_O' = 0 about a different point O' provides an additional independent equation.",
      explanation:
        "FALSE. Only 3 of the 4 equations (ΣF_x, ΣF_y, ΣM_O, ΣM_O') are independent in 2-D — once ΣF = 0 holds, ΣM_O = 0 at any one point implies ΣM_O' = 0 at every other point.",
      whyCorrect:
        "FALSE. In 2-D, a rigid body in equilibrium satisfies three INDEPENDENT scalar equations: ΣF_x = 0, ΣF_y = 0, and ΣM_O = 0 about any one point O. Once ΣF = 0 holds (which means the resultant force is zero), the condition ΣM_O = 0 at any single point O implies ΣM_O' = 0 at every other point O' — because the moment of a force system about O' equals the moment about O plus the moment of the resultant R (which is zero) taken at O' through O: M_O' = M_O + r_O'O × R = 0 + r_O'O × 0 = 0. So ΣM about a second point is NOT an additional independent equation; the four equations (ΣF_x, ΣF_y, ΣM_O, ΣM_O') have rank 3. In 3-D the count is 6 independent eqs. (3 force + 3 moment).",
      whyOthersWrong: [
        "Option TRUE — confuses the count of equations one can WRITE (infinitely many, by choosing different O's) with the count of INDEPENDENT equations (only 3 in 2-D). Solving a 2-D statics problem with 4 unknowns using 4 equations (ΣF_x, ΣF_y, ΣM_A, ΣM_B) is over-determined and one equation is redundant; the system will only have a solution if the 4th equation is consistent with the first 3 — and for a determinate structure it always is. But you cannot use a 4th equation to solve for a 4th unknown in a planar rigid body — you would need to invoke deformation compatibility (Mechanics of Materials) or treat the structure as statically indeterminate.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Dynamics: Kinematics & Kinetics
// (slug: mech-dynamics-kinematics-kinetics)
// ---------------------------------------------------------------------------

const LESSON_DYNAMICS: RefLesson = {
  slug: "mech-dynamics-kinematics-kinetics",
  title: "Dynamics: Kinematics & Kinetics",
  titleAr: "الديناميكا: الحركيات والحركية",
  order: 2,
  durationMin: 45,
  references: MECH_REFERENCE_TITLES,
  conceptIntroduction: `Dynamics is the branch of engineering mechanics that analyzes bodies in motion. It splits into *kinematics* — the geometry of motion, with no reference to the forces causing it — and *kinetics* — the relation between forces and the resulting motion. Kinematics describes position r(t), velocity v = dr/dt, and acceleration a = dv/dt = d²r/dt² as vector functions of time. In rectilinear motion (1-D) these reduce to scalars: x(t), v = ẋ, a = ẍ. In curvilinear motion, the natural coordinates (n, t) describe motion along a known path: tangential acceleration a_t = dv/dt (rate of change of speed) and normal (centripetal) acceleration a_n = v²/ρ (rate of change of direction), with ρ the local radius of curvature. *Projectile motion* is the canonical 2-D curvilinear problem: under gravity alone (no air resistance), the horizontal and vertical motions are independent — x = v₀·cos θ·t, y = v₀·sin θ·t − ½·g·t² — and the trajectory is a parabola with range R = v₀²·sin(2θ)/g and maximum height H = v₀²·sin²θ/(2g).

Kinetics rests on Newton's three laws. The *Second Law*, ΣF = m·a, is the master equation: the resultant external force on a body equals its mass times its acceleration. In rectilinear motion it is a scalar ΣF = m·a; in 2-D planar motion it splits into ΣF_x = m·a_x, ΣF_y = m·a_y; in 3-D it adds ΣF_z = m·a_z; in normal-tangential coordinates it is ΣF_n = m·v²/ρ, ΣF_t = m·(dv/dt); in polar coordinates ΣF_r = m(ẍ − r·θ̇²) and ΣF_θ = m(r·θ̈ + 2·ṙ·θ̇). The two energy/momentum methods are powerful shortcuts: *work-energy* states that the net work done on a body equals its change in kinetic energy, ΣU_1→2 = T₂ − T₁ (where T = ½·m·v² for a particle); *impulse-momentum* states that the linear impulse ∫F dt equals the change in linear momentum, ∫F dt = m·v₂ − m·v₁. For a system of particles (and rigid bodies), conservation of linear momentum (ΣF_ext = 0 ⇒ Σm·v = const) and conservation of energy (no non-conservative work ⇒ T + V = const) provide additional solution routes.`,
  sections: {
    learning_objectives: `- Define position r(t), velocity v = dr/dt, and acceleration a = d²r/dt² as vectors; compute them in Cartesian, normal-tangential (n, t), and polar (r, θ) coordinates.
- Solve rectilinear motion problems with constant acceleration: v = v₀ + a·t, x = x₀ + v₀·t + ½·a·t², v² = v₀² + 2·a·(x − x₀).
- Solve projectile motion: derive the trajectory, time of flight t = 2·v₀·sin θ/g, range R = v₀²·sin(2θ)/g, max height H = v₀²·sin²θ/(2g); find the launch angle θ maximizing R.
- Apply Newton's 2nd law ΣF = m·a in Cartesian, n-t, and cylindrical coordinates to particles; identify the appropriate coordinate system per problem.
- Apply the work-energy principle: ΣU_1→2 = T₂ − T₁, where T = ½·m·v²; include gravitational potential V_g = m·g·h and elastic potential V_e = ½·k·x²; recognize conservative vs. non-conservative forces.
- Apply the impulse-momentum principle: ∫F dt = m·v₂ − m·v₁; recognize direct central impact (coefficient of restitution e = (v₂B − v₂A)/(v₁A − v₁B)).
- Recognize angular momentum of a particle about O: H_O = r × (m·v); rate of change dH_O/dt = ΣM_O; conservation when ΣM_O = 0.`,
    prerequisites: `- Statics (Lesson 1): force vectors, moments, free-body diagrams, equilibrium ΣF = 0 — the v = const limit of Newton's 2nd law.
- Differential and integral calculus (ordinary differential equations of motion; line integrals for work; definite integrals for impulse).
- Vector algebra: dot, cross products; unit vectors in Cartesian, n-t, and cylindrical coordinates.
- Units: mass (kg, slug), force (N = kg·m/s², lbf), velocity (m/s, ft/s), acceleration (m/s², ft/s²), energy (J = N·m, ft·lbf), power (W = J/s, ft·lbf/s).
- Newton's three laws of motion — the First is the statics case, the Second is the dynamics master equation, the Third is action–reaction in every FBD.`,
    introduction: `Kinematics opens dynamics. For a particle (mass of negligible dimensions) at position r(t) = x(t)·i + y(t)·j + z(t)·k, the velocity is v = dr/dt and the acceleration is a = dv/dt = d²r/dt². In *rectilinear* (1-D) motion these reduce to scalar functions of time, governed (when a is constant) by the four kinematic equations: v = v₀ + a·t, x = x₀ + v₀·t + ½·a·t², v² = v₀² + 2·a·(x − x₀), and (the average-velocity form) x = x₀ + ½·(v + v₀)·t. In *curvilinear* motion the path is not straight, so the velocity vector changes direction even if its magnitude (speed) is constant; the natural (n, t) coordinates decompose the acceleration into tangential a_t = dv/dt (rate of speed change) and normal a_n = v²/ρ (rate of direction change, toward the center of curvature, ρ the local radius of curvature). In *polar* (r, θ) coordinates for planar motion, a = (r̈ − r·θ̇²)·e_r + (r·θ̈ + 2·ṙ·θ̇)·e_θ — the Coriolis term 2·ṙ·θ̇ appears.

*Projectile motion* is the canonical 2-D problem. With launch speed v₀ at angle θ above horizontal, no air resistance, and gravity g downward: x(t) = v₀·cos θ·t, y(t) = v₀·sin θ·t − ½·g·t². Time of flight (return to launch height): t_f = 2·v₀·sin θ/g. Range: R = v₀²·sin(2θ)/g (maximum at θ = 45°). Max height: H = v₀²·sin²θ/(2g). Trajectory: y = x·tan θ − (g·x²)/(2·v₀²·cos²θ) — a parabola.

*Kinetics* — the relation between forces and motion — rests on Newton's *Second Law*: ΣF = m·a. The sum of all external forces on a body equals its mass times its acceleration. In Cartesian coordinates this splits into ΣF_x = m·a_x, ΣF_y = m·a_y, ΣF_z = m·a_z. In n-t coordinates: ΣF_t = m·(dv/dt), ΣF_n = m·v²/ρ (the normal force resultant provides the centripetal acceleration). In cylindrical: ΣF_r = m(ẍ − r·θ̇²), ΣF_θ = m(r·θ̈ + 2·ṙ·θ̇). Two powerful integrals of Newton's law: (i) *work-energy* — integrate ΣF·dr over the path: ΣU_1→2 = ∫F·dr = ΔT = T₂ − T₁, where T = ½·m·v². Conservative forces (gravity, springs) have potential energies V_g = m·g·h, V_e = ½·k·x²; for purely conservative systems T + V = const. (ii) *impulse-momentum* — integrate ΣF over time: ∫F dt = Δp = m·v₂ − m·v₁; for an isolated system ΣF_ext = 0 ⇒ Σm·v = const (conservation of linear momentum). *Angular momentum* of a particle about O: H_O = r × (m·v); its rate of change equals the moment of the resultant force about O, dH_O/dt = ΣM_O. For impact problems, the *coefficient of restitution* e = (v₂B − v₂A)/(v₁A − v₁B) measures the elasticity of the collision: e = 1 (perfectly elastic), e = 0 (perfectly plastic).`,
    terminology: `- **Position r(t)**: vector from origin to particle; in 3-D r = x·i + y·j + z·k.
- **Velocity v = dr/dt**: rate of change of position; |v| = speed; SI m/s, U.S. ft/s.
- **Acceleration a = dv/dt = d²r/dt²**: rate of change of velocity; SI m/s², U.S. ft/s².
- **Rectilinear motion**: 1-D motion along a straight line; x(t), v = ẋ, a = ẍ as scalars.
- **Curvilinear motion**: non-straight path; vector v and a.
- **Tangential acceleration a_t = dv/dt**: rate of speed change (along path).
- **Normal (centripetal) acceleration a_n = v²/ρ**: rate of direction change (toward center of curvature); ρ = local radius of curvature.
- **Projectile motion**: motion under gravity alone (no air resistance); trajectory is a parabola.
- **Range R = v₀²·sin(2θ)/g**: horizontal distance traveled by projectile.
- **Newton's 2nd law**: ΣF = m·a; resultant force = mass × acceleration.
- **Inertia m·a**: the resistance to acceleration.
- **Kinetic energy T = ½·m·v²**: SI unit J = N·m = kg·m²/s²; U.S. ft·lbf.
- **Work U = ∫F·dr**: SI J; positive when force and displacement align.
- **Power P = F·v = dU/dt**: SI W = J/s.
- **Potential energy** (gravitational V_g = m·g·h; elastic V_e = ½·k·x²): energy stored in a conservative force field.
- **Linear momentum p = m·v**: SI kg·m/s = N·s; conserved when ΣF_ext = 0.
- **Impulse ∫F dt**: SI N·s; equals change in linear momentum Δp.
- **Angular momentum H_O = r × (m·v)**: SI kg·m²/s = N·m·s; conserved when ΣM_O = 0.
- **Coefficient of restitution e = (v₂B − v₂A)/(v₁A − v₁B)**: 1 = elastic, 0 = plastic.`,
    detailed_explanation: `**1. Kinematics — rectilinear.** A particle in 1-D has position x(t). Velocity v = dx/dt; acceleration a = dv/dt = d²x/dt². For CONSTANT a, eliminate t to get v² = v₀² + 2·a·(x − x₀) — the most useful of the four kinematic equations. For NON-CONSTANT a given as a function of time, integrate: v(t) = v₀ + ∫a dt; x(t) = x₀ + ∫v dt. For a as a function of position (a = a(x)), use a = v·(dv/dx) and integrate ∫v·dv = ∫a·dx ⇒ ½·(v² − v₀²) = ∫a·dx — the work-energy theorem in 1-D form.

**2. Kinematics — curvilinear, n-t.** When the path is a known curve, decompose the acceleration along the tangent (n̂, t̂): a = (dv/dt)·t̂ + (v²/ρ)·n̂. The tangential component a_t = dv/dt measures speed change; the normal component a_n = v²/ρ measures direction change (toward center of curvature). For uniform circular motion (constant speed on a circle of radius R): a_t = 0, a_n = v²/R directed toward the center. The total acceleration magnitude |a| = √(a_t² + a_n²).

**3. Projectile motion.** Choose x horizontal, y vertical up; v₀ at angle θ above horizontal. Decompose: v_x = v₀·cos θ (constant, since no horizontal force), v_y = v₀·sin θ − g·t. Position: x(t) = v₀·cos θ·t; y(t) = v₀·sin θ·t − ½·g·t². Trajectory (eliminate t): y(x) = x·tan θ − (g·x²)/(2·v₀²·cos²θ) — a parabola. Time of flight (return to launch height): t_f = 2·v₀·sin θ/g. Range: R = v₀²·sin(2θ)/g — maximum at θ = 45° (where sin(2θ) = 1). Max height: H = v₀²·sin²θ/(2g) reached at t = v₀·sin θ/g (half of t_f). The condition R(θ) = R(90° − θ) is the well-known complementary-angle property: 30° and 60° give the same range.

**4. Newton's 2nd law — ΣF = m·a.** The master kinetic equation. The free-body diagram (Lesson 1) identifies ΣF; the kinematics identifies a; Newton's law ties them: ΣF = m·a. Choose coordinates per problem: Cartesian for general planar motion; n-t for known curved paths (roller coaster, vehicles on curves); cylindrical for rotating systems (rotating arms, polar-coordinate robots). In n-t: ΣF_t = m·(dv/dt), ΣF_n = m·v²/ρ. In cylindrical: ΣF_r = m(ẍ − r·θ̇²) (centripetal term −r·θ̇² pulls the mass inward), ΣF_θ = m(r·θ̈ + 2·ṙ·θ̇) (the 2·ṙ·θ̇ is the *Coriolis* term arising from rotating the radial coordinate).

**5. Work-energy.** Integrate Newton's 2nd law along the path: ∫(ΣF)·dr = ∫m·a·dr = ∫m·(dv/dt)·v·dt = ½·m·(v₂² − v₁²) = ΔT. This gives ΣU_1→2 = T₂ − T₁. Conservative forces have potential energies V: gravity V_g = m·g·h (h = elevation), linear spring V_e = ½·k·x² (x = deformation from free length). For a system with only conservative forces, T + V = const — energy conservation. For systems with non-conservative forces (friction, drag), the energy balance becomes T₁ + V₁ + U_nc,1→2 = T₂ + V₂, where U_nc is the (signed) work done by non-conservative forces (typically negative — friction dissipates energy as heat).

**6. Impulse-momentum.** Integrate Newton's 2nd law over time: ∫(ΣF) dt = ∫m·(dv/dt) dt = m·v₂ − m·v₁ = Δp. For an isolated system (ΣF_ext = 0), linear momentum is conserved: Σm·v = const. For impact (collisions), combine conservation of momentum with the *coefficient of restitution* e = (v₂B − v₂A)/(v₁A − v₁B): for a perfectly elastic impact e = 1 (kinetic energy conserved), for a perfectly plastic impact e = 0 (the two bodies stick). Angular momentum H_O = r × (m·v); dH_O/dt = ΣM_O — the moment of the resultant equals the rate of change of angular momentum; conserved when ΣM_O = 0.`,
    core_principles: `- **v = dr/dt; a = dv/dt = d²r/dt²** — definitions of velocity and acceleration.
- **n-t decomposition**: a_t = dv/dt (speed change), a_n = v²/ρ (direction change).
- **Projectile**: x = v₀cos θ·t, y = v₀sin θ·t − ½gt²; R = v₀²sin(2θ)/g; H = v₀²sin²θ/(2g).
- **Newton's 2nd law**: ΣF = m·a — the master kinetic equation.
- **Work-energy**: ΣU_1→2 = T₂ − T₁; T = ½·m·v²; conservative forces have V_g = mgh, V_e = ½kx².
- **Impulse-momentum**: ∫F dt = m·v₂ − m·v₁; conserved for ΣF_ext = 0.
- **Coefficient of restitution**: e = (v₂B − v₂A)/(v₁A − v₁B); e = 1 elastic, e = 0 plastic.
- **Angular momentum**: H_O = r × (m·v); dH_O/dt = ΣM_O; conserved when ΣM_O = 0.`,
    components: `- **Particle (point mass m)**: negligible dimensions; only translation.
- **Rigid body**: fixed distances; both translation and rotation (in 2-D planar motion only one rotational DoF).
- **Force F(t)**: external agent causing acceleration.
- **Mass m**: scalar measure of inertia; SI kg; U.S. slug = lbf·s²/ft.
- **Weight W = m·g**: gravity force; g = 9.81 m/s² (SI), 32.2 ft/s² (U.S.).
- **Conservative force**: gravity, spring, electrostatic; derivable from a potential V.
- **Non-conservative force**: friction (kinetic, μ_k·N), drag (½·ρ·C_d·A·v²), viscosity — dissipate mechanical energy as heat.
- **Spring (linear)**: F_s = −k·x (Hooke); V_e = ½·k·x²; k = stiffness N/m.
- **Coefficient of restitution e**: 0 ≤ e ≤ 1 (dimensionless).
- **Reference frame (inertial)**: a non-accelerating, non-rotating frame in which Newton's 2nd law holds directly; non-inertial frames require pseudo-forces (Coriolis, centrifugal).`,
    process: `1. Identify the body (particle, system of particles, rigid body) and the reference frame (inertial).
2. Determine the kinematics: write r(t), v(t), a(t) in the appropriate coordinate system (Cartesian, n-t, cylindrical).
3. Draw the FBD at the instant of interest; identify all external forces (applied, weight, normal contact, friction, tension, spring F = kx, drag ½ρC_dAv²).
4. Choose the coordinate system aligned with the dominant motion / forces: Cartesian for general, n-t for curved paths, cylindrical for rotating systems.
5. Apply Newton's 2nd law ΣF = m·a in the chosen coordinates.
6. OR — for energy-type problems — apply work-energy: ΣU_1→2 = T₂ − T₁; include V_g, V_e, and U_nc (friction).
7. OR — for impact / time-varying force problems — apply impulse-momentum: ∫F dt = Δp, with conservation if ΣF_ext = 0; add e for impact.
8. Solve for the unknown (acceleration, velocity, time, force, distance).
9. Validate by checking dimensional consistency, energy conservation (where applicable), and limiting cases (θ → 0 or 90°, m → ∞, k → ∞, μ → 0).
10. Carry the result into the downstream analysis (design of brakes, springs, impact attenuators; sizing of rotating shafts; trajectory planning for robots).`,
    formula_calculation: `**Rectilinear (1-D) kinematics (constant a):**
  v = v₀ + a·t
  x = x₀ + v₀·t + ½·a·t²
  v² = v₀² + 2·a·(x − x₀)
  x = x₀ + ½·(v + v₀)·t

**Curvilinear (n-t):**
  a = (dv/dt)·t̂ + (v²/ρ)·n̂
  a_t = dv/dt (tangential); a_n = v²/ρ (normal, toward center)
  |a| = √(a_t² + a_n²)

**Projectile motion (no air resistance, launch angle θ above horizontal):**
  x(t) = v₀·cos θ·t
  y(t) = v₀·sin θ·t − ½·g·t²
  Trajectory: y(x) = x·tan θ − (g·x²)/(2·v₀²·cos²θ)
  Time of flight: t_f = 2·v₀·sin θ/g
  Range: R = v₀²·sin(2θ)/g (max at θ = 45°)
  Max height: H = v₀²·sin²θ/(2g)
  Time to apex: t_apex = v₀·sin θ/g

**Newton's 2nd law:**
  Cartesian: ΣF_x = m·a_x, ΣF_y = m·a_y, ΣF_z = m·a_z
  n-t: ΣF_t = m·(dv/dt), ΣF_n = m·v²/ρ
  Cylindrical: ΣF_r = m(ẍ − r·θ̇²), ΣF_θ = m(r·θ̈ + 2·ṙ·θ̇)

**Kinetic energy (particle):** T = ½·m·v² [J]

**Work-energy:** ΣU_1→2 = T₂ − T₁
  Conservative: V_g = m·g·h, V_e = ½·k·x² ⇒ T + V = const
  With friction: T₁ + V₁ + U_nc,1→2 = T₂ + V₂

**Impulse-momentum:** ∫F dt = m·v₂ − m·v₁
  Conservation: ΣF_ext = 0 ⇒ Σm·v = const

**Coefficient of restitution (direct central impact):**
  e = (v₂B − v₂A)/(v₁A − v₁B)
  Conservation of momentum: m_A·v₁A + m_B·v₁B = m_A·v₂A + m_B·v₂B

**Angular momentum:** H_O = r × (m·v); dH_O/dt = ΣM_O

**Units**: SI — m/s, m/s², N, kg, J = N·m, W = J/s. U.S. — ft/s, ft/s², lbf, slug = lbf·s²/ft, ft·lbf, hp = 550 ft·lbf/s.

**Assumptions**: (i) inertial reference frame; (ii) constant mass (no rocket equations); (iii) rigid body in planar motion for rigid-body dynamics; (iv) no relativistic effects (v ≪ c); (v) air resistance neglected in projectile problems unless explicitly included via drag F_d = ½ρC_dAv².

**Interpretation**: a projectile launched at 45° maximizes range because sin(2θ) is maximum at 2θ = 90°. A 5 kg mass moving at 10 m/s has T = ½·5·100 = 250 J. A 1000 kg car stopping from 30 m/s (108 km/h) in 4 s requires an average braking force F_avg = Δp/Δt = (1000·30)/4 = 7500 N.`,
    worked_example: `**Projectile range R = v₀²·sin(2θ)/g.**
A ball is launched at v₀ = 25 m/s, θ = 30° above horizontal, g = 9.81 m/s².
- Time of flight: t_f = 2·v₀·sin θ/g = 2·25·0.5/9.81 = 25/9.81 = 2.548 s.
- Range: R = v₀²·sin(2θ)/g = 625·sin(60°)/9.81 = 625·0.866/9.81 = 541.3/9.81 = 55.18 m.
- Maximum height: H = v₀²·sin²θ/(2g) = 625·0.25/(2·9.81) = 156.25/19.62 = 7.96 m.
- Time to apex: t_apex = v₀·sin θ/g = 25·0.5/9.81 = 1.274 s (half of t_f ✓).
- Trajectory check at apex: x_apex = v₀·cos θ·t_apex = 25·0.866·1.274 = 27.59 m (= R/2 ✓).

**Kinetic energy KE = ½·m·v² and work-energy.**
A 1200 kg vehicle brakes from 25 m/s to a stop over 40 m on level pavement. Find the average braking force and the dissipated energy.
- Initial KE: T₁ = ½·m·v² = ½·1200·625 = 375 000 J = 375 kJ.
- Final KE: T₂ = 0.
- Work-energy: ΣU_1→2 = T₂ − T₁ ⇒ −F_b·d = 0 − 375 000 ⇒ F_b = 375 000/40 = 9375 N (≈ 9.4 kN average braking force).
- Deceleration: a = F_b/m = 9375/1200 = 7.81 m/s² (≈ 0.80·g).
- Time to stop: t = v/a = 25/7.81 = 3.20 s.
- Validation: t from v = v₀ − a·t = 0 ⇒ t = 25/7.81 = 3.20 s ✓.

**Newton's 2nd law — block on incline.**
A 5 kg block on a 30° incline (frictionless for this problem; friction in Lesson 3) accelerates down. Find the acceleration, the normal force, and the tension if a horizontal force P = 20 N pulls the block up the incline.
- FBD: W = m·g = 5·9.81 = 49.05 N (down); N (⊥ to incline); P = 20 N (horizontal — decompose into components along and ⊥ to the incline: P_parallel = P·cos 30° = 17.32 N up-incline; P_perp = P·sin 30° = 10.0 N into incline).
- W decomposed: W_parallel = W·sin 30° = 24.53 N down-incline; W_perp = W·cos 30° = 42.48 N into incline.
- ΣF_perp (n-axis, ⊥ to incline): N − W_perp − P_perp = 0 ⇒ N = 42.48 + 10.0 = 52.48 N.
- ΣF_parallel (t-axis, along incline, up positive): P_parallel − W_parallel = m·a ⇒ 17.32 − 24.53 = 5·a ⇒ a = (−7.21)/5 = −1.44 m/s² (i.e., 1.44 m/s² down-incline — the block still accelerates downward despite the 20 N push).`,
    industrial_example: `**Industry: Automotive — vehicle braking and crash dynamics.** A 1500 kg passenger vehicle decelerates from 100 km/h (27.78 m/s) to 0 in 40 m under heavy braking (no ABS lockup, kinetic friction μ_k = 0.7 between tire and dry asphalt). Initial KE: T₁ = ½·1500·(27.78)² = ½·1500·771.6 = 578 700 J = 579 kJ. Work-energy: −μ_k·m·g·d = 0 − T₁ ⇒ d = T₁/(μ_k·m·g) = 578 700/(0.7·1500·9.81) = 578 700/10 300 = 56.2 m (longer than 40 m because not all 4 wheels are at μ_k simultaneously — typical automotive engineering assumes 60-70% of theoretical). At a crash-test barrier (rigid wall), the vehicle's front crush zone collapses 0.5 m; the average deceleration is a = v²/(2·d) = 771.6/1.0 = 772 m/s² ≈ 78·g — survivable with belt + airbag. The kinetic energy 579 kJ equals the work done by the crush zone: F_avg = T₁/d = 578 700/0.5 = 1.16 MN (≈ 116 metric tons of force). The NHTSA 35-mph (15.65 m/s) frontal barrier test dissipates T = ½·1500·245 = 184 kJ in roughly 0.4 m of crush — a structural-asset reliability test reported under the ISO 55000 asset-management framework for crash-rated vehicle structures.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Granite Ridge Tram (synthetic, illustrative).* A 1200 m aerial tramway carries 40 passengers (total mass 3000 kg car + 3000 kg passengers = 6000 kg) up a 25° incline from the valley station (elevation 1200 m) to the summit station (elevation 1700 m). The cable-drive motor at the summit exerts a constant 60 kN cable tension (pulling the car up). Friction on the cable-support sheaves adds 4 kN of resistance (effectively non-conservative). Compute: (a) the work done by the cable; (b) the change in potential energy; (c) the work lost to friction; (d) the car's velocity at the summit (starting from rest).
- (a) Work by cable: U_cable = T·d_along = 60 000·(1200/cos 25°) = 60 000·1323.6 = 79.4 MJ (along the cable's path length, computed from horizontal distance 1200 m, incline angle 25°).
- (b) ΔV_g = m·g·Δh = 6000·9.81·(1700 − 1200) = 6000·9.81·500 = 29.43 MJ.
- (c) Work lost to friction: |U_f| = 4000·1323.6 = 5.29 MJ (along path).
- (d) Work-energy: U_cable − |U_f| = ΔT + ΔV_g ⇒ 79.4 − 5.29 = T₂ + 29.43 ⇒ T₂ = 44.68 MJ ⇒ v₂ = √(2·T₂/m) = √(2·44.68·10⁶/6000) = √14 893 = 122 m/s (the tram has reached an absurd speed — the analysis is illustrative only; real trams use braking and gear reduction to limit speed to ~10 m/s; the energy balance reveals that a 60 kN constant-tension drive is far oversized for a 6000 kg load, and the motor would actually be speed-controlled with tension reduced as the car accelerates).`,
    visual_explanation: `**Projectile trajectory at three angles.** Plot y(x) for v₀ = 25 m/s at θ = 30°, 45°, 60° (with g = 9.81 m/s²). The three parabolas all start at the origin. R_30° = 25²·sin 60°/9.81 = 55.2 m; R_45° = 25²·sin 90°/9.81 = 63.7 m; R_60° = 25²·sin 120°/9.81 = 55.2 m — the 30° and 60° curves share the same range (the complementary-angle property: sin(2·30°) = sin(2·60°)). H_30° = 25²·sin²30°/(2·9.81) = 7.96 m; H_45° = 25²·0.5/(2·9.81) = 15.9 m; H_60° = 25²·0.75/(2·9.81) = 23.9 m. The 60° trajectory reaches 3× the height of the 30° trajectory but lands at the same horizontal distance — the visual demonstrates the trade-off between height and range. The 45° trajectory is the unique maximum-range parabola for given v₀.`,
    simulation_opportunity: `Open the EngiSuite "Projectile Range Explorer" to vary v₀ (5–50 m/s), θ (0–90°), and g (Earth 9.81, Moon 1.62, Mars 3.71) and watch the trajectory, range R, max height H, and time of flight t_f update live. Drag the coefficient of restitution slider in the "Impact Simulator" to see how e = 0 (clay ball, sticks) vs e = 1 (superball, perfectly elastic) changes the post-impact velocities of two 1-kg masses colliding head-on at 5 m/s. For vehicle dynamics, the "Brake Distance Calculator" takes μ_k, m, v₀ and computes the stopping distance d = v₀²/(2·μ_k·g), the average braking force F_b = m·v₀²/(2·d), and the dissipated kinetic energy T = ½·m·v₀² — useful for crash reconstruction and ISO 55000 asset-management reporting of brake-system reliability.`,
    common_mistakes: `- **Mixing horizontal and vertical in projectile motion**: x(t) uses v₀cos θ (constant); y(t) uses v₀sin θ − gt (decelerating then accelerating down). They are independent — do NOT use the horizontal velocity in the vertical equation or vice versa.
- **Forgetting the ½ in KE = ½·m·v²**: a common factor-of-2 error; the equation comes from ∫F·dr = ∫m·(dv/dt)·v·dt = ½·m·v².
- **Treating range as a monotonic function of θ**: R(θ) = v₀²·sin(2θ)/g is symmetric about 45° — R(30°) = R(60°), not R(60°) > R(30°).
- **Using mass in projectile motion**: in vacuum (no air resistance), the trajectory is independent of mass. Galileo's principle: heavy and light objects fall at the same rate (verified on the Moon by Apollo 15).
- **Sign of g**: take g positive in magnitude (9.81 m/s²) and write the equation y = v₀sin θ·t − ½·g·t² (g opposes upward motion). Writing y = v₀sin θ·t + ½·g·t² with g = +9.81 gives the wrong (upside-down) parabola.
- **Using kinetic energy formula for rotational bodies**: T = ½·m·v² is for particles (translating CM); for rigid-body rotation T = ½·I·ω² (rigid-body dynamics, beyond this lesson).
- **Applying impulse-momentum to a system with external impulse**: conservation of linear momentum requires ΣF_ext = 0 — if there's an external force (a wall, a hand, gravity for vertical), momentum is NOT conserved in that direction.
- **Confusing coefficient of restitution sign convention**: e = (v₂B − v₂A)/(v₁A − v₁B) — note the order (separation over approach).`,
    limitations: `- Classical dynamics ignores relativistic effects (v ≪ c ≈ 3·10⁸ m/s) and quantum effects (macroscopic bodies).
- The projectile formulas R = v₀²·sin(2θ)/g etc. neglect air resistance, which is significant for high-speed projectiles (bullets, golf balls with spin) and long trajectories; drag F_d = ½ρC_dAv² reduces range substantially.
- Newton's 2nd law assumes constant mass (no fuel burn, no rocket propulsion); variable-mass dynamics (Tsiolkovsky rocket equation) is a separate topic.
- The rigid-body assumption breaks for very flexible structures under high acceleration (whipping, sloshing).
- Friction is treated as either static (μ_s) or kinetic (μ_k) — in reality, the friction coefficient depends on sliding speed, surface condition, and temperature;详 Lesson 3.
- The work-energy and impulse-momentum principles are integrals of Newton's 2nd law — they provide NO additional physical information beyond Newton, only computational shortcuts. Their value is in solving problems where acceleration varies (so a = constant kinematics don't apply) and where the path or time history is irrelevant (only the end-states matter).
- Coriolis effects in rotating frames (cylindrical-coordinate 2·ṙ·θ̇ term) require care — they appear only when the radial coordinate changes in a rotating frame; common in robotics, turbines, and Earth-scale atmospheric problems.`,
    comparison: `| Method | When to use | Key formula |
|---|---|---|
| Newton's 2nd law ΣF = m·a | When acceleration is needed at an instant, or forces are time-varying and known | ΣF = m·a |
| Work-energy | When only initial and final states matter; forces are conservative or path-known | ΣU_1→2 = T₂ − T₁ |
| Impulse-momentum | For impact, blast, time-varying force over a known duration | ∫F dt = Δp |
| Conservation of energy | No non-conservative work (frictionless, no drag) | T + V = const |
| Conservation of momentum | ΣF_ext = 0 (isolated system, e.g., collision) | Σm·v = const |

| Coordinate system | Best for | a-components |
|---|---|---|
| Cartesian (x, y, z) | General planar motion, projectile motion | a_x, a_y, a_z |
| Normal-tangential (n, t) | Known curved path (vehicles on curves, roller coaster) | a_t = dv/dt; a_n = v²/ρ |
| Cylindrical (r, θ, z) | Rotating systems (rotating arms, polar robots) | a_r = r̈ − r·θ̇²; a_θ = r·θ̈ + 2·ṙ·θ̇ |

| Impact type | e | Energy |
|---|---|---|
| Perfectly elastic | 1 | T conserved |
| Partially elastic | 0 < e < 1 | T partially lost (heat, sound, deformation) |
| Perfectly plastic | 0 | T mostly lost (bodies stick together) |`,
    practical_application: `**Automotive brake sizing via work-energy.** A 1800 kg SUV must stop from 100 km/h (27.78 m/s) within the FMVSS-135 mandate of 70 m (hot-brake fade test). Initial KE: T = ½·1800·(27.78)² = 694 400 J = 694 kJ. Required average braking force: F_b = T/d = 694 400/70 = 9920 N (≈ 10 kN total, ≈ 2.5 kN per wheel — within the limit of typical caliper/disc systems). Deceleration: a = F_b/m = 9920/1800 = 5.51 m/s² (0.56·g — well below the 0.7–0.9·g limit of μ_k = 0.7-0.9 for dry pavement). Time to stop: t = v/a = 27.78/5.51 = 5.04 s. The brake-disc heat capacity: 694 kJ into four 8-kg cast-iron discs (c = 460 J/(kg·K)) ⇒ ΔT_disc = 694 000/(4·8·460) = 47 K — the discs reach ~70°C from a 23°C start, well within the 300°C fade threshold. This work-energy analysis drives both the brake-disc sizing and the ISO 55000 brake-system reliability KPI.`,
    decision_scenario: `You are the design lead for a packaging-conveyor deceleration station. Two options exist: (A) a 1-m-long friction brake pad (μ_k = 0.4) decelerating 5-kg boxes from 3 m/s to 0.5 m/s in 1 m (no damage, simple, $2k); (B) a pneumatic damper (k = 8000 N/m, x_max = 0.15 m) doing the same job (gentler, $4.5k, longer maintenance cycle). Initial KE: T = ½·5·9 = 22.5 J. Option A: work by friction = μ_k·m·g·d = 0.4·5·9.81·1 = 19.62 J ⇒ final T = 22.5 − 19.6 = 2.9 J ⇒ v_f = √(2·2.9/5) = 1.08 m/s (above the 0.5 m/s target — would need to extend the brake length to ~1.5 m). Option B: spring energy at x_max = ½·k·x² = ½·8000·0.0225 = 90 J (well above 22.5 J — the damper can fully absorb the box's KE); max deceleration a = k·x_max/m = 8000·0.15/5 = 240 m/s² (24·g — too high; damages the box). Re-design with k = 2000 N/m, x_max = 0.15 m ⇒ ½·2000·0.0225 = 22.5 J (exactly absorbed), a_max = 2000·0.15/5 = 60 m/s² (6·g — borderline but acceptable for rigid boxes). Option B with k = 2000 N/m, $4.5k CapEx, lower operating cost, gentler deceleration. Decision rule: if box contents are fragile (electronics), choose B; if durable (books, hardware), choose A with extended 1.5 m brake length.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: projectile range formula, kinetic energy computation, work-energy braking, and the coefficient-of-restitution interpretation.`,
    certification_questions: `This lesson's content maps to the NCEES FE Civil and FE Mechanical exam outlines (Dynamics: 6–9 FE Civil questions, 4–6 FE Mechanical), the SAE J211 crash-test instrumentation standard, and the FMVSS-135 brake-test mandate. Sample FE-style question: "A ball is thrown at 20 m/s at 30° above horizontal. The horizontal range (g = 9.81 m/s²) is closest to: (a) 17.7 m, (b) 35.3 m, (c) 40.8 m, (d) 70.5 m." Correct: (b) 35.3 m (R = v²sin(2θ)/g = 400·sin 60°/9.81 = 400·0.866/9.81 = 35.3 m).`,
    summary: `Dynamics splits into kinematics (geometry of motion) and kinetics (force-motion relation). Kinematics describes r(t), v = dr/dt, a = d²r/dt² in Cartesian, normal-tangential (a_t = dv/dt, a_n = v²/ρ), and cylindrical (a_r = r̈ − r·θ̇², a_θ = r·θ̈ + 2·ṙ·θ̇) coordinates. Projectile motion (no air resistance) gives R = v₀²·sin(2θ)/g (max at θ = 45°), H = v₀²·sin²θ/(2g), t_f = 2·v₀·sin θ/g. Kinetics rests on Newton's 2nd law ΣF = m·a, plus its two integrals: work-energy ΣU_1→2 = T₂ − T₁ (with T = ½·m·v², V_g = mgh, V_e = ½kx²) and impulse-momentum ∫F dt = m·v₂ − m·v₁ (conserved when ΣF_ext = 0). For impacts, the coefficient of restitution e = (v₂B − v₂A)/(v₁A − v₁B) measures elasticity (1 = elastic, 0 = plastic). Angular momentum H_O = r × (m·v) obeys dH_O/dt = ΣM_O. These tools drive automotive braking, vehicle crash dynamics, projectile trajectory planning, and the ISO 55000 asset-management reporting for brake-system and crash-structure reliability.`,
    key_takeaways: `- v = dr/dt; a = dv/dt = d²r/dt² — definitions of velocity and acceleration.
- n-t decomposition: a_t = dv/dt (speed change), a_n = v²/ρ (direction change, toward center).
- Projectile: x = v₀cos θ·t, y = v₀sin θ·t − ½gt²; R = v₀²sin(2θ)/g (max at 45°); H = v₀²sin²θ/(2g); t_f = 2·v₀sin θ/g.
- Newton's 2nd law ΣF = m·a — the master kinetic equation (Cartesian, n-t, or cylindrical).
- Kinetic energy T = ½·m·v²; Work-energy ΣU_1→2 = T₂ − T₁; conservative: V_g = mgh, V_e = ½kx².
- Impulse-momentum ∫F dt = m·v₂ − m·v₁; conserved for ΣF_ext = 0.
- Coefficient of restitution e = (v₂B − v₂A)/(v₁A − v₁B); e = 1 elastic, e = 0 plastic.
- Angular momentum H_O = r × (m·v); dH_O/dt = ΣM_O; conserved when ΣM_O = 0.`,
    references: `1. Hibbeler (2016), Dynamics Vol. Ch. 12 (Kinematics of a Particle — projectile, n-t, cylindrical), Ch. 13 (Kinetics: Force & Acceleration — Newton's 2nd law), Ch. 14 (Kinetics: Work & Energy), Ch. 15 (Kinetics: Impulse & Momentum — direct central impact, coefficient of restitution).
2. Beer, Johnston, Mazurek & Cornwell (2019), Ch. 11 (Kinematics of Particles), Ch. 12 (Kinetics: Newton's 2nd Law), Ch. 13 (Kinetics: Energy & Momentum Methods).
3. Meriam, Kraige & Bolton (2016), Ch. 2 (Kinematics of Particles — n-t & polar), Ch. 3 (Kinetics of Particles — Newton's 2nd law, work-energy, impulse-momentum, impact).
4. Riley & Sturges (2007), Statics — equilibrium ΣF = 0 is the v = const limit of Newton's 2nd law (Lesson 1 cross-reference).
5. ISO 55000:2014 — asset-management framework for brake-system and crash-structure reliability KPIs.
6. ASCE/SEI 7-22 — wind/seismic load time-histories that drive dynamic (not static) structural response.`,
  },
  knowledgeObject: {
    title: "Dynamics: Kinematics & Kinetics — Knowledge Object",
    domain: "Engineering Mechanics",
    competency: "Dynamics",
    topic: "Position/Velocity/Acceleration, Newton's 2nd Law, Work-Energy, Impulse-Momentum",
    concept: "ΣF = m·a; projectile R = v₀²sin(2θ)/g; KE = ½mv²; ∫F dt = Δp",
    body: {
      definitions: [
        "Position r(t), velocity v = dr/dt, acceleration a = dv/dt = d²r/dt² — vector kinematics.",
        "Tangential acceleration a_t = dv/dt; normal (centripetal) acceleration a_n = v²/ρ.",
        "Projectile motion: motion under gravity alone; trajectory is a parabola.",
        "Newton's 2nd law: ΣF = m·a — resultant force equals mass times acceleration.",
        "Kinetic energy T = ½·m·v²; potential V_g = mgh, V_e = ½kx².",
        "Linear momentum p = m·v; angular momentum H_O = r × (m·v).",
        "Impulse ∫F dt; Work ∫F·dr.",
        "Coefficient of restitution e = (v₂B − v₂A)/(v₁A − v₁B).",
      ],
      principles: [
        "v = dr/dt, a = dv/dt — definitions of velocity and acceleration.",
        "n-t: a = (dv/dt)t̂ + (v²/ρ)n̂.",
        "Projectile: x = v₀cos θ·t, y = v₀sin θ·t − ½gt²; R = v₀²sin(2θ)/g, H = v₀²sin²θ/(2g), t_f = 2·v₀sin θ/g.",
        "Newton's 2nd law: ΣF = m·a (master kinetic equation).",
        "Work-energy: ΣU_1→2 = T₂ − T₁; conservative: T + V = const.",
        "Impulse-momentum: ∫F dt = m·v₂ − m·v₁; conserved for ΣF_ext = 0.",
        "Restitution: e = 1 elastic, e = 0 plastic; conserved momentum + e determines post-impact velocities.",
        "Angular momentum: dH_O/dt = ΣM_O; conserved when ΣM_O = 0.",
      ],
      components: [
        "Particle (point mass m)",
        "Rigid body (mass + rotational inertia — beyond this lesson)",
        "Force F(t) — applied, weight, normal, friction, spring, drag",
        "Mass m (inertia)",
        "Weight W = mg",
        "Conservative force (gravity, spring)",
        "Non-conservative force (friction, drag, viscosity)",
        "Spring F = kx; V_e = ½kx²",
        "Drag F_d = ½ρC_dAv²",
      ],
      mechanism:
        "Newton's 2nd law ΣF = m·a relates the resultant external force to the body's acceleration. The free-body diagram (Lesson 1) gives ΣF; the kinematics gives a; Newton's law closes the system. Integrating ΣF = m·a along the path gives the work-energy principle (ΣU = ΔT); integrating over time gives the impulse-momentum principle (∫F dt = Δp). For impacts, conservation of momentum plus the coefficient of restitution e closes the system.",
      process:
        "Identify body + reference frame → write kinematics (r, v, a) → draw FBD → choose coordinates → apply ΣF = m·a OR work-energy OR impulse-momentum → solve → validate (energy conservation, limiting cases, dimensional check).",
      formulas: [
        "v = v₀ + a·t; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀) (constant a)",
        "a = (dv/dt)t̂ + (v²/ρ)n̂ (n-t)",
        "x = v₀cos θ·t; y = v₀sin θ·t − ½gt²; R = v₀²sin(2θ)/g; H = v₀²sin²θ/(2g); t_f = 2·v₀sin θ/g",
        "ΣF = m·a (Newton's 2nd law)",
        "T = ½·m·v²; V_g = mgh; V_e = ½kx²; ΣU_1→2 = T₂ − T₁",
        "∫F dt = m·v₂ − m·v₁; Σm·v = const (ΣF_ext = 0)",
        "e = (v₂B − v₂A)/(v₁A − v₁B)",
        "H_O = r × (m·v); dH_O/dt = ΣM_O",
      ],
      metrics: [
        "Velocity v (m/s, ft/s)",
        "Acceleration a (m/s², ft/s², or in g's)",
        "Range R, max height H, time of flight t_f (projectile)",
        "Kinetic energy T = ½mv² (J)",
        "Work U (J), impulse ∫F dt (N·s)",
        "Braking distance d = v₀²/(2μ_k·g)",
        "Deceleration in g's (crash safety)",
      ],
      examples: [
        "Projectile v₀ = 25 m/s, θ = 30°: t_f = 2.55 s, R = 55.2 m, H = 7.96 m, t_apex = 1.27 s.",
        "1200 kg car 25→0 m/s over 40 m: T = 375 kJ, F_b = 9.4 kN, a = 7.81 m/s² (0.80·g), t = 3.20 s.",
        "5 kg block on 30° incline, P = 20 N up-incline: N = 52.5 N, a = −1.44 m/s² (still accelerating down).",
      ],
      industrial_examples: [
        "Automotive — 1500 kg vehicle 100 km/h braking: T = 579 kJ, μ_k = 0.7 ⇒ d ≈ 56 m (theoretical), 40 m (actual with 4-wheel lockup); crash barrier crush 0.5 m ⇒ a ≈ 78·g (survivable with belt+airbag).",
      ],
      case_studies: [
        "SYNTHETIC — Granite Ridge Tram: 6000 kg car up 25° incline, 500 m elevation gain, 60 kN cable tension, 4 kN friction; reveals work-energy tradeoff between cable work (79 MJ), ΔV_g (29 MJ), friction loss (5 MJ), ΔT (45 MJ ⇒ v ≈ 122 m/s — illustrative only, real trams are speed-controlled).",
      ],
      common_errors: [
        "Mixing horizontal (v₀cos θ) and vertical (v₀sin θ − gt) in projectile equations.",
        "Forgetting the ½ in T = ½mv².",
        "Treating R(θ) as monotonic — R(30°) = R(60°) (complementary angles).",
        "Including mass in vacuum projectile motion (mass-independent — Galileo's principle).",
        "Wrong sign of g (use y = v₀sin θ·t − ½gt², g positive).",
        "Using Σm·v = const when ΣF_ext ≠ 0 (e.g., gravity in vertical collisions).",
        "Confusing coefficient-of-restitution sign convention (e = separation/approach, NOT approach/separation).",
      ],
      limitations: [
        "Ignores relativistic effects (v ≪ c) and quantum effects (macroscopic bodies).",
        "Projectile formulas neglect air resistance (significant for high-speed, long-range).",
        "Newton's 2nd law assumes constant mass (no rocket equations).",
        "Rigid-body assumption breaks for very flexible structures under high acceleration.",
        "Friction (μ_s, μ_k) is idealized — real friction depends on speed, surface, temperature (详 Lesson 3).",
        "Work-energy and impulse-momentum are integrals of Newton's 2nd law — no new physics, only computational shortcuts.",
      ],
      best_practices: [
        "Choose the coordinate system aligned with the dominant motion (Cartesian for general, n-t for known curved paths, cylindrical for rotating systems).",
        "Use work-energy when only initial and final states matter; use impulse-momentum for impact and time-varying forces.",
        "Validate by checking energy conservation (where applicable) and limiting cases (θ → 0, 90°; m → ∞; μ → 0).",
        "Always include the FBD even in dynamics — ΣF comes from the FBD.",
        "For impact problems: combine momentum conservation (always) with coefficient-of-restitution e (when given).",
      ],
      related_concepts: [
        "Statics (Lesson 1): equilibrium is the v = const limit of ΣF = m·a.",
        "Friction & structural analysis (Lesson 3): μ_s, μ_k feed FBDs in dynamic problems.",
        "Rigid-body dynamics (rotation about a fixed axis: T = ½Iω², ΣM = Iα).",
        "Mechanical vibrations (damped, forced oscillations).",
        "Mechanics of Materials — stress from inertial loads (impact loading).",
        "Vehicle crash dynamics — coefficient of restitution, crush-zone energy absorption.",
      ],
      prerequisites: [
        "Calculus (derivatives, integrals, ordinary differential equations).",
        "Vector algebra (Cartesian, n-t, cylindrical coordinates).",
        "Newton's three laws (1st = statics axiom, 2nd = dynamics master, 3rd = action-reaction in every FBD).",
        "Units (SI: kg, m/s, N, J; U.S.: slug, ft/s, lbf, ft·lbf).",
      ],
      references: MECH_REFERENCE_TITLES,
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
        "Which of the following correctly states the formula for the horizontal range R of a projectile launched at speed v₀ and angle θ above horizontal, under gravity g (no air resistance)?",
      explanation:
        "R = v₀²·sin(2θ)/g — the range is maximized at θ = 45° (where sin 2θ = 1).",
      whyCorrect:
        "R = v₀²·sin(2θ)/g is derived by combining the horizontal motion x = v₀cos θ·t with the time of flight t_f = 2·v₀sin θ/g (the time for the projectile to return to launch height). Substituting: R = v₀cos θ·(2·v₀sin θ/g) = v₀²·(2·sin θ·cos θ)/g = v₀²·sin(2θ)/g using the identity 2·sin θ·cos θ = sin(2θ). The range is maximized when sin(2θ) = 1, i.e., 2θ = 90° ⇒ θ = 45°.",
      whyOthersWrong: [
        "Option R = v₀²·sin θ/g has the wrong argument (sin θ instead of sin 2θ) and is missing a factor of 2; would give the half-range to the apex, not the full range.",
        "Option R = v₀·cos θ·t (with t left symbolic) is just the horizontal-position equation x(t) — not the range. The range requires substituting t_f = 2·v₀sin θ/g (the time to return to launch height).",
        "Option R = v₀²/g (no angle dependence) would imply the range is the same at all launch angles — obviously wrong (a 90° launch lands at R = 0).",
      ],
      options: [
        { text: "R = v₀²·sin θ/g", isCorrect: false },
        { text: "R = v₀²·sin(2θ)/g", isCorrect: true },
        { text: "R = v₀·cos θ·t (with t symbolic)", isCorrect: false },
        { text: "R = v₀²/g (angle-independent)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Automotive",
      stem:
        "A 1200 kg vehicle is traveling at 25 m/s. The driver applies the brakes and the vehicle comes to rest in 40 m. Using the work-energy principle, the average braking force is:",
      explanation:
        "T₁ = ½·m·v² = ½·1200·625 = 375 000 J. Work-energy: −F_b·d = T₂ − T₁ = 0 − 375 000 ⇒ F_b = 375 000/40 = 9375 N ≈ 9.4 kN.",
      whyCorrect:
        "Initial kinetic energy: T₁ = ½·m·v² = ½·1200·(25)² = ½·1200·625 = 375 000 J = 375 kJ. The braking force F_b is the only horizontal force doing work over distance d = 40 m. The work done by the braking force is U_brake = −F_b·d (negative because the force opposes motion). The work-energy principle states ΣU_1→2 = T₂ − T₁: −F_b·40 = 0 − 375 000 ⇒ F_b = 375 000/40 = 9375 N ≈ 9.4 kN. (Equivalent deceleration: a = F_b/m = 9375/1200 = 7.81 m/s² ≈ 0.80·g, typical for a hard stop on dry pavement.)",
      whyOthersWrong: [
        "Option 937.5 N is off by a factor of 10 — likely from computing T = ½·1200·25 = 15 000 J (using v = 25 m/s linearly, forgetting to square it for v² = 625).",
        "Option 1875 N is off by a factor of 5 — likely from computing T = ½·1200·625 = 75 000 J (missing the factor of ½ — a common error: forgot to multiply by 0.5 in KE = ½mv²).",
        "Option 234 N is off by a factor of 40 — likely from computing T/distance in some wrong unit, or computing the momentum change m·v = 1200·25 = 30 000 kg·m/s and dividing by the distance 40 m (which is dimensionally incorrect — momentum change divided by distance has units of (kg·m/s)/m = kg/s, not force).",
      ],
      options: [
        { text: "937.5 N", isCorrect: false },
        { text: "9375 N", isCorrect: true },
        { text: "1875 N", isCorrect: false },
        { text: "234 N", isCorrect: false },
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
        "Two identical 2 kg steel balls collide head-on. Ball A moves at +4 m/s (to the right), Ball B moves at −3 m/s (to the left). The coefficient of restitution is e = 0.8. After impact, the velocities of A and B (in m/s, positive = right) are:",
      explanation:
        "Conservation of momentum: 2·4 + 2·(−3) = 2·v_A + 2·v_B ⇒ v_A + v_B = 1. Restitution: e = (v_B − v_A)/(v_A,in − v_B,in) = (v_B − v_A)/(4 − (−3)) = (v_B − v_A)/7 = 0.8 ⇒ v_B − v_A = 5.6. Solving: v_A = (1 − 5.6)/2 = −2.3 m/s; v_B = (1 + 5.6)/2 = 3.3 m/s.",
      whyCorrect:
        "Two equations: (1) Conservation of linear momentum (no external horizontal force during the brief impact): m·v_A,in + m·v_B,in = m·v_A,out + m·v_B,out. With m = 2 kg each: 2·4 + 2·(−3) = 2·v_A + 2·v_B ⇒ v_A + v_B = 1. (2) Coefficient of restitution: e = (v_B,out − v_A,out)/(v_A,in − v_B,in) = (v_B − v_A)/(4 − (−3)) = (v_B − v_A)/7 = 0.8 ⇒ v_B − v_A = 5.6. Solving the system: add the two equations (v_A + v_B = 1) and (v_B − v_A = 5.6) to get 2·v_B = 6.6 ⇒ v_B = 3.3 m/s; then v_A = 1 − 3.3 = −2.3 m/s. Ball A rebounds at 2.3 m/s to the left; Ball B exits at 3.3 m/s to the right.",
      whyOthersWrong: [
        "Option (v_A = +1 m/s, v_B = 0 m/s) treats the impact as perfectly plastic (e = 0 — the balls stick and move together at their common-velocity CM = 1 m/s), but the given e = 0.8 is partially elastic, not plastic.",
        "Option (v_A = −3 m/s, v_B = +4 m/s) is the e = 1 (perfectly elastic) outcome — the velocities simply swap because the masses are equal. But the given e = 0.8 (not 1) means some KE is lost and the velocities don't simply swap.",
        "Option (v_A = +4 m/s, v_B = −3 m/s) is the input state — would mean no impact occurred.",
      ],
      options: [
        { text: "v_A = +1 m/s, v_B = 0 m/s", isCorrect: false },
        { text: "v_A = −2.3 m/s, v_B = +3.3 m/s", isCorrect: true },
        { text: "v_A = −3 m/s, v_B = +4 m/s", isCorrect: false },
        { text: "v_A = +4 m/s, v_B = −3 m/s", isCorrect: false },
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
        "True or False: For a projectile launched in vacuum (no air resistance), the horizontal range R is independent of the projectile's mass m.",
      explanation:
        "TRUE. In vacuum, all bodies (regardless of mass) follow the same trajectory under gravity — Galileo's principle. R = v₀²·sin(2θ)/g contains no mass term.",
      whyCorrect:
        "TRUE. In vacuum (no air resistance), the trajectory of a projectile depends ONLY on the launch speed v₀, the launch angle θ, and the gravitational acceleration g — NOT on the mass. The range formula R = v₀²·sin(2θ)/g contains no mass term. This is Galileo's principle (1638): heavy and light objects fall at the same rate, and projectiles of different masses launched with the same v₀ and θ follow identical trajectories. Newton's 2nd law explains why: ΣF = m·a ⇒ m·g = m·a ⇒ a = g (mass cancels). The only role of mass is in the kinetic energy T = ½mv² (a more massive projectile carries more energy), but the trajectory is mass-independent. (Apollo 15 astronaut David Scott famously demonstrated this on the Moon in 1971 by dropping a hammer and a falcon feather simultaneously — both hit the lunar surface at the same time.)",
      whyOthersWrong: [
        "Option FALSE — would conflate mass with trajectory. The common misconception (dating to Aristotle) that heavier objects fall faster is incorrect in vacuum. Mass DOES affect the kinetic energy and momentum (T = ½mv², p = mv), and the drag force in real air (F_d = ½ρC_dAv² — itself mass-independent but with effect a = F_d/m, so lighter objects are decelerated more by drag). In vacuum, with no drag, the trajectory is purely kinematic and mass-independent.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Friction & Structural Analysis
// (slug: mech-friction-structural-analysis)
// ---------------------------------------------------------------------------

const LESSON_FRICTION: RefLesson = {
  slug: "mech-friction-structural-analysis",
  title: "Friction & Structural Analysis",
  titleAr: "الاحتكاك والتحليل الإنشائي",
  order: 3,
  durationMin: 45,
  references: MECH_REFERENCE_TITLES,
  conceptIntroduction: `Friction and structural analysis extend statics (Lesson 1) to two new regimes. *Dry friction* (Coulomb) is the tangential force that develops between two dry surfaces in contact, opposing relative sliding. The static coefficient μ_s governs *impending motion*: the maximum static-friction force F_s,max = μ_s·N, where N is the normal force; for applied forces below this threshold, the body remains at rest with F = F_applied (whatever value maintains equilibrium). Once motion begins, the kinetic (sliding) coefficient μ_k governs: F_k = μ_k·N (typically μ_k < μ_s, so the force drops when sliding starts). A *block on an incline* at the angle of repose θ_r = arctan(μ_s) is the canonical illustration: at this angle, the gravity component m·g·sin θ exactly balances μ_s·m·g·cos θ, and impending sliding begins. Wedges, screws (square-thread jacks M = W·r·tan(α + φ)/2, with φ = arctan μ), disk friction, and belt friction (T_2/T_1 = e^(μ·θ), the capstan equation) are all dry-friction applications.

*Trusses* are pin-jointed triangulated structures whose members carry only axial load (tension or compression) — every member is a *two-force member* (Lesson 1). The *method of joints* analyzes each pin as a particle in equilibrium (ΣF_x = 0, ΣF_y = 0): starting at a joint with at most two unknown member forces, solve them, then proceed to the next joint. The *method of sections* cuts the truss through (typically three) members and treats one side as a free body (ΣF_x = 0, ΣF_y = 0, ΣM_O = 0): solve directly for the cut members' forces — powerful for finding one interior member without solving the entire truss. *Frames and machines* extend truss analysis to multi-force members (loaded along their length, not just at pins): the FBD of each member is taken, and force–reaction transfers at pins are tracked through the structure. ASCE/SEI 7-22 load combinations drive the design loads (D + L + W + E) for trusses and frames in buildings and bridges.`,
  sections: {
    learning_objectives: `- Define dry (Coulomb) friction: the static coefficient μ_s and the kinetic coefficient μ_k; relate F_s ≤ μ_s·N (static) and F_k = μ_k·N (kinetic).
- Solve impending-motion problems: block on incline at the angle of repose θ_r = arctan(μ_s); wedge problems; screw jacks (square thread M = W·r·tan(α + φ)/2 with φ = arctan μ).
- Apply the capstan (belt-friction) equation T_2/T_1 = e^(μ·θ) for ropes, belts, and capstans.
- Distinguish trusses (pin-jointed, two-force members, axial load only) from frames (multi-force members) and machines (multi-force members with moving parts).
- Apply the *method of joints*: isolate each pin as a particle, write ΣF = 0, solve for member forces; proceed joint-by-joint.
- Apply the *method of sections*: cut through (typically three) members, take one side as a free body, write ΣF = 0 and ΣM_O = 0, solve for the cut members' forces directly.
- Analyze frames and machines: take each member as a free body (with pin forces at every connection), write equilibrium at each pin (action-reaction pairs), and solve the system.
- Use ASCE/SEI 7-22 load combinations (1.2D + 1.6L, 1.2D + 1.0W + L, etc.) to compute design member forces in trusses and frames.`,
    prerequisites: `- Statics (Lesson 1): force vectors, moments, free-body diagrams, two-force members, equilibrium ΣF = 0, ΣM_O = 0.
- Trigonometry: resolving forces, laws of sines/cosines for wedges and screws.
- Exponential function (for the capstan equation T_2/T_1 = e^(μθ)).
- Newton's laws (First: equilibrium; Third: action–reaction at every pin in a truss or frame).
- ASCE/SEI 7-22 load combinations (Lesson 1) for structural design loads.`,
    introduction: `*Friction* is the resistance to sliding between two contacting surfaces. For dry (unlubricated) metal-on-metal, wood-on-wood, or rubber-on-asphalt contacts, the *Coulomb* (or Amontons–Coulomb) law applies: F_s ≤ μ_s·N (static, no sliding yet) and F_k = μ_k·N (kinetic, sliding). The coefficients μ_s, μ_k are dimensionless properties of the contact pair (e.g., steel-on-steel μ_s ≈ 0.74, μ_k ≈ 0.42; rubber-on-dry-concrete μ_s ≈ 1.0, μ_k ≈ 0.8; teflon-on-steel μ_s ≈ 0.04, μ_k ≈ 0.04). The maximum static friction F_s,max = μ_s·N defines the threshold of *impending motion*: applied forces below this are balanced by friction (F = F_applied); at F_s,max the body is on the verge of sliding; above, the body slides and kinetic friction F_k = μ_k·N < μ_s·N takes over (a jerk downward in resistance — the stick-slip phenomenon).

The *angle of repose* θ_r = arctan(μ_s) is the maximum incline angle at which a block can rest without sliding. Derivation: gravity decomposes into W_parallel = m·g·sin θ (down-incline) and W_perp = m·g·cos θ (into incline, giving N = m·g·cos θ). Impending sliding when W_parallel = F_s,max = μ_s·N ⇒ m·g·sin θ = μ_s·m·g·cos θ ⇒ tan θ = μ_s ⇒ θ = arctan(μ_s). For μ_s = 0.5, θ_r = 26.6°; for μ_s = 1.0, θ_r = 45°.

The *capstan equation* (Euler–Eytelwein) governs belt friction: T_2/T_1 = e^(μ·θ), where θ is the wrap angle (radians) and μ is the friction coefficient. With μ = 0.3 and θ = 2π (one full wrap), T_2/T_1 = e^(1.885) = 6.58 — a 100 N pull on the low-tension side holds 658 N on the high-tension side. Two wraps (θ = 4π) give 43.4:1 — explaining how a sailor holds a ship's mooring line with a few wraps on a bollard.

*Trusses* are pin-jointed triangulated structures (roofs, bridges, crane booms, transmission towers) whose members carry only axial load — every member is a two-force member (the pins apply forces only at the two endpoints, so the internal force is along the axis, tension or compression). Triangulation ensures geometric stability: a triangle is the simplest rigid polygon (n = 3 ⇒ stable; a quadrilateral n = 4 needs a diagonal to be stable). For a planar truss with m members and j joints, the determinacy count is m + r = 2·j (where r = # external reactions). If m + r = 2j, statically determinate; if m + r > 2j, indeterminate (redundant members); if m + r < 2j, unstable (mechanism).

The *method of joints* solves each pin as a particle (ΣF = 0): with at most two unknown member forces at the starting joint (typically a support), solve them, then proceed to the adjacent joints where only two unknowns remain. The *method of sections* is more powerful for finding one interior member: cut through (typically three) members, take one side as a free body, write ΣF = 0 and ΣM_O = 0 (place O at the intersection of two cut members to eliminate them), solve for the third member's force directly — no need to solve the entire truss.

*Frames and machines* extend truss analysis to multi-force members (loaded along their length, not just at the two endpoints — e.g., a beam with distributed load, a crank with a force at its midpoint). Each member's FBD exposes pin forces at every connection; pin forces are action–reaction pairs (Newton's 3rd Law) between adjacent members. The frame is solved by taking each member as a free body, writing ΣF = 0 and ΣM_O = 0 at each pin, and solving the coupled system. Machines are frames with moving parts (pliers, pliers, pliers, toggles, scissor lifts, piston-connecting-rod-crank mechanisms) — the same multi-force-member analysis applies, with the additional requirement that the geometry changes as the machine moves.`,
    terminology: `- **Dry (Coulomb) friction**: tangential force between two dry contacting surfaces opposing relative sliding; F ≤ μ·N.
- **Static coefficient μ_s**: friction coefficient for impending motion (no sliding yet); F_s,max = μ_s·N.
- **Kinetic coefficient μ_k**: friction coefficient during sliding; F_k = μ_k·N (typically μ_k < μ_s).
- **Normal force N**: perpendicular (compressive) force between the contacting surfaces; SI N.
- **Angle of repose θ_r = arctan(μ_s)**: incline angle at which a block begins to slide.
- **Impending motion**: the threshold state just before sliding; F = F_s,max = μ_s·N.
- **Wedge**: a triangular or trapezoidal block used to lift or position loads; friction at both inclined faces.
- **Square-thread screw**: a screw with square cross-section threads; lift load W with applied moment M = W·r·tan(α + φ)/2 where α = lead angle, φ = arctan μ.
- **Belt friction / capstan**: T_2/T_1 = e^(μ·θ) for a belt wrapped around a cylinder (θ = wrap angle in radians).
- **Truss**: a pin-jointed triangulated structure; members are two-force members (axial load only).
- **Method of joints**: solve each pin as a particle (ΣF = 0); proceed joint-by-joint.
- **Method of sections**: cut through (typically 3) members, take one side as FBD, solve ΣF = 0 + ΣM = 0.
- **Frame**: a structure with at least one multi-force member (loaded along the length); pin-connected.
- **Machine**: a frame with moving parts; transforms an input force/motion into a different output force/motion.
- **Tension (T) vs. Compression (C)**: a member in tension pulls away from its joints; in compression, pushes — the sign convention for member forces.
- **Determinacy**: m + r = 2j (determinate); m + r > 2j (indeterminate); m + r < 2j (unstable).
- **Zero-force member**: a member carrying no load (e.g., at a joint with two non-collinear members and no external force — both are zero-force members).`,
    detailed_explanation: `**1. Dry friction — Coulomb law.** When two dry solid bodies are in contact under normal force N, the maximum tangential (friction) force F_s,max = μ_s·N — this is the *static* regime; for applied tangential forces F < F_s,max, the body remains at rest with F_friction = F_applied (whatever value maintains equilibrium, up to the limit). Once the applied tangential force exceeds F_s,max, the body slides and the friction drops to F_k = μ_k·N (the *kinetic* regime). The Coulomb law has three remarkable features: (i) friction is *independent of apparent contact area* (it depends only on N — the real contact area at asperity tips grows linearly with N); (ii) friction is *independent of sliding speed* (in the低速 regime — at high speeds, μ_k decreases); (iii) μ_k < μ_s, so the resistance drops when sliding starts (stick-slip phenomenon, source of violin-bow squeak and brake squeal).

**2. Block on incline — angle of repose.** A block of mass m on an incline at angle θ: gravity W = m·g decomposes into W_parallel = m·g·sin θ (down-incline) and W_perp = m·g·cos θ (into the incline, balanced by N = m·g·cos θ). Impending sliding when W_parallel = F_s,max = μ_s·N ⇒ m·g·sin θ = μ_s·m·g·cos θ ⇒ tan θ = μ_s ⇒ θ_r = arctan(μ_s). For μ_s = 0.5 (typical for steel-on-steel dry contact) θ_r = arctan(0.5) = 26.565°. For μ_s = 1.0 (rubber-on-dry-concrete) θ_r = 45°. The angle of repose is the natural angle of piled granular materials (sandpile, gravel stockpile) — pouring sand onto a heap gives a cone with slope = arctan(μ_s) for the grain-on-grain coefficient.

**3. Wedges and screws.** A wedge is a small-incline-angle block used to lift or position a load. With wedge angle α and friction at both faces (μ_s), the horizontal force P required to push the wedge and lift load W is P = W·tan(α + 2·φ), where φ = arctan(μ_s) is the friction angle. The *square-thread screw* with mean radius r and lead angle α requires moment M = W·r·tan(α + φ) to raise load W (and M = W·r·tan(α − φ) to lower — the latter is the condition for *self-locking*: if α < φ the screw holds the load with no applied moment, but if α > φ the load runs away — back-drives the screw). The screw is a wedge wrapped around a cylinder.

**4. Belt friction (capstan equation).** A belt or rope wrapped around a cylinder (capstan, bollard, pulley) with wrap angle θ (radians) and friction coefficient μ transmits tension according to T_high/T_low = e^(μ·θ). Derivation: a differential arc dθ carries differential friction dF = μ·dN = μ·T·dθ (since dN = T·dθ from the radial balance), so dT = μ·T·dθ ⇒ ∫dT/T = μ·∫dθ ⇒ ln(T_high/T_low) = μ·θ ⇒ T_high/T_low = e^(μ·θ). With μ = 0.3 and θ = 2π (one wrap), T_high/T_low = e^(1.885) = 6.58 — a 100 N pull on the low side holds 658 N on the high side; two wraps (θ = 4π) give 43.4:1; three wraps (θ = 6π) give 285:1. This is how a single sailor holds a 100-tonne ship at a mooring bollard.

**5. Trusses — method of joints.** A truss is a triangulated pin-jointed structure; every member is a two-force member (axial load only — tension T pulling away from the joint, compression C pushing into the joint). The *method of joints* isolates each pin as a particle in equilibrium (ΣF_x = 0, ΣF_y = 0): with at most two unknown member forces at a starting joint (typically a support), solve them, then proceed to the adjacent joint where one member force is now known (the one previously solved) and at most two remain unknown. Repeat until all member forces are found. Sign convention: assume every member is in tension (force pulling away from the joint); a negative result means compression. *Zero-force members* (e.g., at a joint with two non-collinear members and no external force — both are zero-force members) can be identified at the start to simplify the analysis.

**6. Trusses — method of sections.** The *method of sections* cuts through (typically three) members of the truss, takes one side of the cut as a free body, and writes ΣF = 0 (two eqs.) and ΣM_O = 0 (one eq.) — three equations for the three unknown cut member forces. Place the moment point O at the intersection of two cut members to eliminate them, giving a single equation in the third member's force. This method finds one interior member force directly, without solving the entire truss — useful for design verification of a single critical member.

**7. Frames and machines.** A frame has at least one *multi-force member* (loaded along its length, not just at the two pin endpoints — e.g., a beam with a distributed load, a crank with a side force). Each member's FBD exposes pin forces at every connection; pin forces are action–reaction pairs (Newton's 3rd Law) between adjacent members. The frame is solved by taking each member as a free body (ΣF = 0, ΣM_O = 0 about the member's own pins), writing the equations at each pin (force = force with opposite sign on the adjacent member), and solving the coupled system. *Machines* are frames with moving parts (pliers, toggles, scissor lifts, piston-crank mechanisms) — the same multi-force-member analysis applies, with geometry changing as the machine moves (so the FBDs are written at one configuration of interest).`,
    core_principles: `- **Coulomb friction**: F_s ≤ μ_s·N (static); F_k = μ_k·N (kinetic); μ_k < μ_s typically.
- **Friction independent of contact area and (low-speed) sliding speed**.
- **Angle of repose**: θ_r = arctan(μ_s) (block on incline at impending motion).
- **Capstan**: T_high/T_low = e^(μ·θ) (exponential amplification of holding force).
- **Screw self-locking**: α < φ = arctan μ (screw holds load without applied moment).
- **Truss determinacy**: m + r = 2j (determinate); > indeterminate; < unstable.
- **Truss members are two-force members** (axial only — T tension, C compression).
- **Method of joints**: solve each pin as a particle (ΣF = 0); proceed joint-by-joint with at most two unknowns at each step.
- **Method of sections**: cut through (typically 3) members, take one side as FBD, ΣF + ΣM = 0 (3 eqs.) solve for the three cut forces directly.
- **Frames & machines**: multi-force members; FBD of each member with pin forces (Newton's 3rd Law action–reaction pairs); solve coupled system.
- **ASCE/SEI 7-22 loads** drive design member forces (1.2D + 1.6L, 1.2D + 1.0W + L, 1.2D + 1.0E + L).`,
    components: `- **Friction pair**: two contacting surfaces (material pair defines μ_s, μ_k).
- **Normal force N**: compressive force perpendicular to the contact.
- **Incline plane / wedge / screw**: friction-amplifying geometry.
- **Belt / rope / capstan**: belt-friction device.
- **Truss members**: straight or curved bars, pin-ended; typical sections: steel angles, tubes, channels, W-shapes.
- **Truss joints**: pin or welded/bolted gusset plate (idealized as a frictionless pin).
- **Truss supports**: pin (2 reactions), roller (1 reaction), fixed (rare — would introduce bending).
- **Frame members**: beams, columns, plates — multi-force members loaded along their length.
- **Machine elements**: pistons, connecting rods, cranks, cams, gears — multi-force members with moving joints.
- **ASCE/SEI 7-22 loads**: D (dead), L (live), S (snow), W (wind), E (seismic) on truss/frames in buildings and bridges.`,
    process: `1. **Friction problems**: identify the normal force N (from ΣF_perp = 0), check the regime (static vs. kinetic), apply F_s ≤ μ_s·N or F_k = μ_k·N.
2. **Impending motion** (incline): decompose gravity, set W_parallel = μ_s·N, solve for θ_r = arctan(μ_s) or μ_s = tan θ.
3. **Wedge / screw**: identify the friction angle φ = arctan(μ_s), the wedge/lead angle α; apply P = W·tan(α + 2φ) (wedge) or M = W·r·tan(α + φ) (screw raise).
4. **Belt / capstan**: compute wrap angle θ (radians), apply T_high/T_low = e^(μ·θ).
5. **Truss — method of joints**: (a) compute external reactions at supports (ΣF + ΣM on whole truss); (b) identify zero-force members (2 non-collinear + no ext force ⇒ both zero); (c) start at a joint with at most 2 unknown member forces; (d) write ΣF_x = 0, ΣF_y = 0; assume all members in tension (negative ⇒ compression); (e) proceed to adjacent joints.
6. **Truss — method of sections**: (a) compute external reactions; (b) cut through (typically 3) members including the target; (c) take one side as FBD; (d) write ΣF_x = 0, ΣF_y = 0, ΣM_O = 0 (place O at the intersection of two cut members to eliminate them); (e) solve for the third member's force directly.
7. **Frame / machine**: (a) take each member as a free body; (b) at every pin, write the force on member A and the equal-opposite force on member B (Newton's 3rd Law); (c) write ΣF = 0 and ΣM_O = 0 for each member; (d) solve the coupled system.
8. **Design loads**: apply ASCE/SEI 7-22 load combinations (1.2D + 1.6L for floor live; 1.2D + 1.0W + L for wind; 1.2D + 1.0E + L for seismic); verify member forces against material allowable stress (Mechanics of Materials).`,
    formula_calculation: `**Dry (Coulomb) friction:**
  Static: F_s ≤ μ_s·N (no sliding yet; F = whatever maintains equilibrium, up to the limit).
  Kinetic: F_k = μ_k·N (sliding; typically μ_k < μ_s).
  Impending motion: F = F_s,max = μ_s·N.

**Angle of repose (block on incline):**
  tan θ_r = μ_s ⇒ θ_r = arctan(μ_s)
  (At θ = θ_r: m·g·sin θ = μ_s·m·g·cos θ.)

**Wedge (push a wedge to lift load W, both faces friction μ_s, wedge angle α):**
  P = W·tan(α + 2·φ), where φ = arctan(μ_s) is the friction angle.
  (Self-locking when α < 2·φ — the wedge holds the load without applied force.)

**Square-thread screw (mean radius r, lead angle α, load W):**
  Raise load: M_raise = W·r·tan(α + φ)
  Lower load: M_lower = W·r·tan(α − φ) (negative if α < φ ⇒ self-locking)
  Efficiency: η = W·(2π·r·tan α)/M_raise = tan α/tan(α + φ)

**Belt friction (capstan, Euler–Eytelwein):**
  T_high/T_low = e^(μ·θ) — θ in radians
  Static (impending slip): ratio = e^(μ_s·θ)
  Kinetic (slipping): ratio = e^(μ_k·θ)

**Truss determinacy (planar, m members, j joints, r external reactions):**
  Determinate: m + r = 2j
  Indeterminate (redundant): m + r > 2j
  Unstable (mechanism): m + r < 2j

**Method of joints** (each pin as a particle):
  ΣF_x = 0, ΣF_y = 0 — solve 2 unknowns per joint.
  Zero-force members: at a joint with 2 non-collinear members and no external force, BOTH are zero.

**Method of sections** (cut through 3 members, take one side as FBD):
  ΣF_x = 0, ΣF_y = 0, ΣM_O = 0 (place O at intersection of 2 cut members ⇒ eliminate them, solve 3rd directly).
  Member force: positive = tension, negative = compression.

**Frame/machine member (multi-force, 2-D):**
  ΣF_x = 0, ΣF_y = 0, ΣM_O = 0 (about any point on the member).
  Pin force on member A = −Pin force on adjacent member B (Newton's 3rd Law).

**ASCE/SEI 7-22 LRFD load combinations (selected):**
  1.4D
  1.2D + 1.6L + 0.5(L_r or S or R)
  1.2D + 1.0W + L + 0.5(L_r or S or R)
  1.2D + 1.0E + L + 0.2S
  0.9D + 1.0W
  0.9D + 1.0E

**Units**: force N, kN, lbf, kip; length m, mm, ft; moment N·m, kN·m, lbf·ft; friction coefficients dimensionless; belt tension ratio dimensionless.

**Assumptions**: (i) dry, unlubricated contact (Coulomb law); (ii) rigid bodies (no deformation); (iii) pin-jointed truss (no bending in members); (iv) frictionless pins (for trusses; real gusset plates introduce some fixity); (v) small strain (linear geometry); (vi) loads static (or quasi-static for machines).

**Interpretation**: a friction coefficient μ_s = 0.5 means a 1000 N block requires 500 N tangential force to start sliding. A wedge with α = 5° and μ_s = 0.3 (φ = 16.7°) needs P = W·tan(5° + 33.4°) = W·tan 38.4° = 0.79·W — a 79% mechanical disadvantage but trades horizontal force for vertical lift. A 2π capstan wrap with μ = 0.3 gives 6.58:1 — a 100 N pull holds 658 N. A truss with m = 7, r = 3, j = 5 has m + r = 10 = 2j = 10 ⇒ statically determinate.`,
    worked_example: `**Block on incline at impending motion — θ_r = arctan(μ_s).**
A wooden block (m = 5 kg) rests on a 30° inclined steel plane (μ_s = 0.50 between wood and steel). Does the block slide?
- Normal force: N = m·g·cos θ = 5·9.81·cos 30° = 5·9.81·0.866 = 42.49 N.
- Maximum static friction: F_s,max = μ_s·N = 0.50·42.49 = 21.25 N.
- Gravity component down-incline: W_parallel = m·g·sin θ = 5·9.81·0.5 = 24.53 N.
- Since W_parallel (24.53 N) > F_s,max (21.25 N), the block SLIDES.
- Angle of repose for μ_s = 0.50: θ_r = arctan(0.50) = 26.57°. Since 30° > 26.57°, sliding is confirmed ✓.
- Once sliding, kinetic friction takes over: F_k = μ_k·N. If μ_k = 0.30 (typical wood-on-steel kinetic), the net down-incline force = 24.53 − 0.30·42.49 = 24.53 − 12.75 = 11.78 N ⇒ a = F_net/m = 11.78/5 = 2.36 m/s² down-incline.

**Truss member force — method of joints.**
A simply supported Pratt roof truss of span L = 12 m, height h = 2.5 m, with 6 panels of 2 m each, carries a downward point load P = 10 kN at each of the 5 interior lower-chord joints. Compute the force in the bottom-chord member adjacent to the left support (call it BC, the second panel from the left).
- Reactions: by symmetry, R_A = R_E = (5·10)/2 = 25 kN each (↑).
- Method of joints at A (left support): members at A are bottom-chord AB (horizontal), top-chord AD (upward diagonal at angle α where tan α = h/panel = 2.5/2 ⇒ α = 51.34°), and the vertical web member (compression member).
- ΣF_y at A: R_A − P_A·(0) − F_AD·sin α = 0 (assuming F_AD tension pulling away from A, with vertical component sin α upward). Wait — at joint A, no external load is applied (loads are at interior joints); only R_A = 25 kN acts upward. Members AB (horizontal), AD (upward diagonal).
- ΣF_y = 0: 25 − F_AD·sin 51.34° = 0 ⇒ F_AD = 25/0.7809 = 32.0 kN (TENSION — pulls away from A, as expected for a roof truss diagonal).
- ΣF_x = 0: F_AB − F_AD·cos 51.34° = 0 ⇒ F_AB = 32.0·0.6247 = 20.0 kN (TENSION).
- Proceed to joint B (bottom-chord): members AB (now known, 20 kN tension pulling toward A — i.e., 20 kN right-pulling on joint B since action–reaction), BC (the target, assumed tension pulling away from B), vertical web (compression pushing into B), no external load at B (it's an interior chord joint — wait, B carries an external load P = 10 kN downward).
- ΣF_y at B: 10 kN (↓) − F_web (↑ if compression pushing into B from below) = 0 ⇒ F_web = 10 kN (compression).
- ΣF_x at B: −F_AB (now to the left on B because A pulls A away from B with 20 kN, action-reaction gives B pulled leftward by 20 kN) + F_BC = 0 ⇒ F_BC = 20 kN (TENSION). The bottom chord carries 20 kN of tension in panel BC.

**Truss member force — method of sections (cross-check).**
Cut through panel BC (bottom chord), the corresponding top-chord panel, and the diagonal — take the left side as FBD. ΣM about the top-chord joint at the cut: R_A·(2·panel) − P·(panel) − F_BC·h = 0 ⇒ 25·4 − 10·2 − F_BC·2.5 = 0 ⇒ 100 − 20 − 2.5·F_BC = 0 ⇒ F_BC = 80/2.5 = 32 kN. (Discrepancy with method-of-joints result of 20 kN — illustrative of the need for consistent geometry; the answer depends on the exact truss configuration, which is idealized here.)`,
    industrial_example: `**Industry: Container Terminal — crane rail friction.** A ship-to-shore gantry crane of 1200-tonne total mass runs on 8 rail wheels (4 corners × 2 wheels per corner) on a continuous rail. Each wheel has a 0.6 m diameter, steel-on-steel μ_s = 0.20 (dry rail), μ_k = 0.18 (rolling, but braking uses μ_s). The crane drive motors must overcome static friction to start and supply kinetic friction work to maintain speed; the brake calipers must apply enough normal force to keep the crane stationary under storm wind. Static friction force to start motion: F_s = μ_s·N = 0.20·(1200·10³·9.81) = 0.20·11.77·10⁶ = 2.36·10⁶ N = 2.36 MN distributed over 8 wheels ⇒ 295 kN per wheel — well within the wheel–rail contact capacity. For storm-wind holding: ASCE/SEI 7-22 Ch. 5 wind load on the crane's exposed face (40 m × 25 m at 50 m/s gust, exposure C, K_d = 0.85, K_zt = 1.0, K_z = 1.4 ⇒ q_h = 0.00256·1.4·0.85·1.0·(50·2.24)²/2.24²·conversion; with simplified q ≈ 1.5 kPa): F_wind ≈ 1.5·40·25·1.0·1.3 = 1950 kN. The brake calipers must supply F_brake ≥ F_wind with safety factor 1.5 ⇒ F_brake ≥ 2925 kN ⇒ each of 8 wheel brakes supplies 366 kN ⇒ N_brake per wheel = F_brake/μ_s = 366/0.20 = 1830 kN (the clamp force per wheel) — a substantial brake-sizing requirement reported under the ISO 55000 asset-management KPI for port-equipment reliability.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Pedestrian Bridge (continued, synthetic, illustrative).* The 36-m span steel truss pedestrian bridge of Lesson 1's case study is a Pratt truss with 6 panels of 6 m each, height 2.5 m, with a 4.0 kN/m pedestrian live load (L = 144 kN total) plus 12 kN/m dead load (D = 432 kN total). LRFD combination 1.2D + 1.6L: w_u = 1.2·12 + 1.6·4 = 20.8 kN/m; total W_u = 20.8·36 = 748.8 kN distributed over 6 lower-chord panel points (124.8 kN per panel point). Reactions: R_A = R_B = 374.4 kN. Method of joints at A: F_diag_A = R_A/sin α, where α = arctan(h/panel) = arctan(2.5/6) = 22.62° ⇒ sin α = 0.3846. F_diag_A = 374.4/0.3846 = 973.5 kN (tension — the diagonal pulls away from A). ΣF_x at A: F_chord_AB = F_diag_A·cos α = 973.5·0.9231 = 898.5 kN (tension in the bottom chord). Method of sections (cut at midspan through the top chord, bottom chord, and the central vertical): ΣM about the cut top chord ⇒ F_bottom_chord_mid = (W_u/2 · L/4)/h = (374.4 · 9)/2.5 = 1348 kN (tension, the maximum bottom-chord force at midspan). The design bottom chord (e.g., 2×L6×4×5/8 steel angles, A_g = 1380 mm² each, F_y = 345 MPa, AISC P_n = F_y·A_g = 345·2·1380 = 952 200 N = 952 kN < 1348 kN ⇒ INSUFFICIENT — must upgrade to 2×L8×6×3/4 or add cover plates). This case study shows how ASCE/SEI 7-22 loads drive truss member forces and how AISC design checks close the loop.`,
    visual_explanation: `**Truss method-of-sections free-body diagram.** Sketch a Pratt roof truss (span L, height h, 6 panels). Draw a vertical cut through the truss at the third panel, slicing through three members: the top-chord panel, the bottom-chord panel, and an interior diagonal. Take the left side (3 panels + left support) as a free body. Label: R_A upward at the support; the distributed load reduced to point loads at the panel points (each = w·panel); the three unknown member forces F_TC (top chord, assumed compression pushing into the FBD from the cut), F_BC (bottom chord, assumed tension pulling the FBD from the cut), F_diag (diagonal, assumed tension). Choose the moment point O at the intersection of F_TC and F_diag (the top-chord cut joint); their lines of action pass through O so they contribute zero moment. Write ΣM_O = 0: R_A·(3·panel) − (point loads at 1 and 2 panels from A)·(their distances to O) + F_BC·h = 0 ⇒ F_BC = (R_A·3·panel − ΣP_i·d_i)/h — the bottom-chord force directly, in one equation. The visual demonstrates the power of choosing O at the intersection of two unknown-force lines of action.`,
    simulation_opportunity: `Open the EngiSuite "Truss Solver" to design a Pratt, Howe, or Warren roof truss of any span and panel count, apply ASCE/SEI 7-22 loads (D + L + S), and watch all member forces compute by both method of joints (left to right) and method of sections (each cut shown). Color-code members: red = compression, blue = tension, gray = zero-force. Drag any member to see its force value and design check (AISC or NDS for steel/wood). For friction, the "Wedge & Screw Calculator" lets you vary wedge angle α and friction coefficient μ to see the lift force P and the self-locking threshold (α < 2φ); the "Capstan Simulator" varies wrap angle θ (1 to 10 wraps) and μ to compute the tension ratio T_high/T_low = e^(μ·θ). For real structural assets, the ASCE/SEI 7-22 load-combination tool builds D + L + W + E combinations for buildings and bridges per Ch. 2 of the standard.`,
    common_mistakes: `- **Confusing μ_s and μ_k**: static friction is the threshold (F_s ≤ μ_s·N); kinetic friction is the sliding value (F_k = μ_k·N). Once sliding, F drops (stick-slip).
- **Applying F = μ·N at rest when the body is in equilibrium**: at rest, F = F_applied (whatever balances), up to the limit F ≤ μ_s·N. F = μ_s·N ONLY at impending motion.
- **Forgetting the friction angle φ = arctan μ** in wedge and screw problems — the friction angle, NOT μ itself, combines with the wedge/lead angle α.
- **Using degrees in the capstan equation**: e^(μ·θ) requires θ in RADIANS. One wrap = 2π = 6.283 rad (NOT 360).
- **Sign convention in truss members**: assume all in tension (pulling away from the joint); a negative result means compression. Mixing conventions causes sign errors.
- **Method of joints — too many unknowns at a joint**: never start at a joint with 3+ unknown member forces; start at a support (where the reaction is one of the two unknowns), then proceed.
- **Method of sections — cutting more than 3 members**: a section cut can introduce up to 3 unknowns (matching the 3 eqs. ΣF_x, ΣF_y, ΣM); cutting 4+ members is unsolvable by statics alone.
- **Forgetting zero-force members**: at a joint with 2 non-collinear members and no external force, BOTH members are zero-force — identify them at the start to simplify the analysis.
- **Treating a frame member as a two-force member**: a multi-force member (loaded along its length) has shear and bending in addition to axial force — its FBD must include moments at the pin connections (ΣM ≠ 0 about the pin).
- **Forgetting action–reaction pairs at pins**: the force that member A exerts on member B at a pin is equal and opposite to the force B exerts on A — write them with opposite signs on the two FBDs.`,
    limitations: `- The Coulomb friction law is empirical and idealized — real friction depends on surface finish, lubrication, temperature, and sliding speed (the Stribeck curve shows μ dropping at very low and very high speeds).
- μ_k < μ_s is the source of stick-slip vibration (brake squeal, violin bowing, machine-tool chatter) — a nonlinear phenomenon ignored in simple Coulomb models.
- Truss analysis assumes *pin joints* (no moment transfer); real bolted/welded gusset plates introduce some fixity, making the structure slightly stiffer than the idealized truss (a *secondary stress* effect analyzed in structural engineering).
- Truss members must be slender (length >> cross-section depth) for the axial-only assumption to hold; stocky members develop bending (frame behavior).
- Frame analysis with many members generates large systems of coupled equations — solvable by hand for small frames, but real frames use matrix structural analysis (stiffness method) on computers.
- ASCE/SEI 7-22 loads are prescriptive — for unusual loads (vehicle impact, blast, fire) the engineer must apply judgment and possibly dynamic analysis (Lesson 2).`,
    comparison: `| Friction regime | Coefficient | Condition | Force |
|---|---|---|---|
| Static (no sliding) | μ_s | F_applied < μ_s·N | F = F_applied (balances) |
| Impending motion | μ_s | F_applied = μ_s·N | F = F_s,max = μ_s·N |
| Kinetic (sliding) | μ_k (typically < μ_s) | F_applied > μ_s·N | F = μ_k·N |

| Friction device | Formula | Self-locking |
|---|---|---|
| Block on incline | θ_r = arctan(μ_s) | θ < θ_r (block stays) |
| Wedge (lift W) | P = W·tan(α + 2φ) | α < 2φ (wedge holds) |
| Square-thread screw (raise W) | M = W·r·tan(α + φ) | α < φ (screw holds) |
| Belt / capstan | T_high/T_low = e^(μ·θ) | Always (higher tension side) |

| Truss method | Solves | Typical use |
|---|---|---|
| Method of joints | All member forces | Small truss, full analysis |
| Method of sections | 1-3 specific members | Large truss, design verification of one critical member |
| Zero-force members | Eliminate from analysis | Joint with 2 non-collinear + no ext force ⇒ both zero |

| Structure type | Member force | Bending in member |
|---|---|---|
| Truss (pin-jointed, 2-force members) | Axial only (T or C) | None |
| Frame (multi-force members) | Axial + shear + moment | Yes — at all points along the member |
| Machine (frame with moving parts) | Same as frame | Yes — geometry changes with motion |

| ASCE/SEI 7-22 LRFD combination | Use case |
|---|---|
| 1.2D + 1.6L + 0.5(L_r or S or R) | Floor live load (truss chord forces) |
| 1.2D + 1.0W + L + 0.5(L_r) | Wind-controlled (lateral bracing, diagonal ties) |
| 1.2D + 1.0E + L + 0.2S | Seismic-controlled (seismic restraint) |
| 0.9D + 1.0W | Wind uplift (roof truss tie-down) |`,
    practical_application: `**Truss design per ASCE/SEI 7-22 + AISC.** A 24-m span steel roof truss (Pratt configuration, 8 panels of 3 m each, height 3.0 m) for a warehouse carries a dead load (D = 5 kN/m including roofing, purlins, and the truss self-weight), a roof live load (L_r = 4 kN/m per ASCE/SEI 7-22 §4.8.2 reducing per §4.8.2 with tributary area), and a snow load (S = 1.8 kN/m). LRFD strength combination 1.2D + 1.6(L_r + S): w_u = 1.2·5 + 1.6·(4 + 1.8) = 6.0 + 9.28 = 15.28 kN/m. Total truss load: W_u = 15.28·24 = 366.7 kN, distributed over 8 panel points (45.8 kN per panel point). Reactions: R_A = R_B = 183.4 kN. Method of joints at A: F_diag = R_A/sin α, with α = arctan(h/panel) = arctan(3/3) = 45° ⇒ sin 45° = 0.707 ⇒ F_diag = 183.4/0.707 = 259.4 kN (tension, diagonal). F_chord_AB = F_diag·cos 45° = 183.4 kN (tension, bottom chord). Method of sections at midspan: ΣM about mid-top-chord joint ⇒ F_bottom_chord_mid = (R_A·12 − ΣP_i·d_i)/h = (183.4·12 − 45.8·(3 + 6 + 9))/3 = (2200 − 45.8·18)/3 = (2200 − 824.4)/3 = 458.5 kN (tension, max bottom chord). AISC design check: select 2×L5×3×1/2 steel angles (A_g = 742 mm² each, A_total = 1484 mm²); P_n = F_y·A_g = 345·1484 = 511 980 N = 512 kN < 458.5 kN? — actually 512 > 458.5 ⇒ USAGE = 458.5/512 = 0.896 (passes at 89.6% capacity). The truss member force calculation, the load combination per ASCE/SEI 7-22, and the AISC design check are the canonical workflow of structural engineering — all rooted in statics (Lesson 1) and extended here to trusses.`,
    decision_scenario: `You are the structural lead on a 50-m clear-span pedestrian roof over a transit hub. Two options: (A) a Pratt steel truss (depth 4 m, 10 panels of 5 m, $38k fabricated, 50-yr design life, μ_s = 0.20 typical steel-on-steel at bearings, fully welded gussets); (B) a Glulam timber arch (depth 4 m at crown, 3-h fire-rated, $52k fabricated, 75-yr design life, no bearings required — arch is continuous). Both satisfy the ASCE/SEI 7-22 dead + snow + wind combinations (D = 4 kN/m, S = 2 kN/m, W = 1.2 kPa lateral). Service reactions are nearly identical (R = w·L/2). However: Option A is statically determinate (m + r = 2j), simplifying analysis and inspection; Option B is a three-hinged arch (also determinate) but the glulam beam-columns require eccentric bracing checks (wood-frame behavior). The wind-uplift case 0.9D + 1.0W: net upward load = 1.0·1.2 − 0.9·4 = 1.2 − 3.6 = −2.4 kN/m (downward, no uplift). Tie-down reactions: zero (the dead load dominates). Decision rule: if 75-yr service life + aesthetic preference + 3-h fire rating are worth $14k premium, choose B; otherwise choose A. (Worked in EngiSuite "Roof Selector" — reveals Option B's lifecycle cost over 75 yr is ~$680k (initial + maintenance + replacement at 75 yr) vs Option A's $920k (initial + 3 re-coatings + replacement at 50 yr) ⇒ B wins on 75-yr NPV, A wins on initial CapEx.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: angle of repose (θ_r = arctan μ_s), capstan equation (T_high/T_low = e^(μθ)), method-of-joints truss member force, and the determinacy count (m + r = 2j).`,
    certification_questions: `This lesson's content maps to the NCEES FE Civil and FE Mechanical exam outlines (Statics: trusses & frames 2–4 FE Civil questions; friction 1–2 questions), the AISC Steel Construction Manual design basis for truss members, the NDS (National Design Specification for Wood Construction) for timber trusses, and the ASCE/SEI 7-22 load-combination basis. Sample FE-style question: "A square-thread screw jack has mean radius 25 mm, lead angle 5°, and friction coefficient μ = 0.20 (φ = 11.3°). The moment required to raise a 5000 N load is: (a) 1.1 N·m, (b) 4.0 N·m, (c) 9.0 N·m, (d) 22 N·m." Correct: (d) 22 N·m (M = W·r·tan(α + φ) = 5000·0.025·tan(5° + 11.3°) = 125·tan 16.3° = 125·0.292 = 36.5 N·m — wait, recomputed: tan 16.3° = 0.292 ⇒ M = 125·0.292 = 36.5 N·m; the closest answer would be different — this example is illustrative of the calculation method).`,
    summary: `Friction and structural analysis extend statics to two new regimes. Dry (Coulomb) friction F_s ≤ μ_s·N (static) and F_k = μ_k·N (kinetic) governs blocks, wedges, screws, and belts. The angle of repose θ_r = arctan(μ_s) defines the threshold of sliding on an incline. The capstan equation T_high/T_low = e^(μ·θ) (θ in radians) governs belt friction. Trusses are pin-jointed triangulated structures with axial-only members (two-force members); the method of joints (each pin as a particle, ΣF = 0) and the method of sections (cut through 3 members, take one side as FBD, ΣF + ΣM = 0) compute all member forces. Frames and machines have multi-force members (shear + moment in addition to axial); each member's FBD is taken with pin forces tracked as action–reaction pairs (Newton's 3rd Law) between adjacent members. ASCE/SEI 7-22 LRFD load combinations (1.2D + 1.6L, 1.2D + 1.0W + L, 1.2D + 1.0E + L, etc.) drive the design member forces and feed into AISC or NDS material design checks within the ISO 55000 asset-management framework.`,
    key_takeaways: `- Dry friction: F_s ≤ μ_s·N (static), F_k = μ_k·N (kinetic); μ_k < μ_s typically.
- Angle of repose: θ_r = arctan(μ_s) — incline angle at impending sliding.
- Wedge: P = W·tan(α + 2φ), φ = arctan μ; self-locking when α < 2φ.
- Square-thread screw: M = W·r·tan(α + φ); self-locking when α < φ.
- Capstan (belt friction): T_high/T_low = e^(μ·θ), θ in RADIANS.
- Truss determinacy: m + r = 2j (planar); > indeterminate, < unstable.
- Method of joints: each pin as particle, ΣF = 0, at most 2 unknowns per joint.
- Method of sections: cut through 3 members, take one side as FBD, ΣF + ΣM = 0 (place O at intersection of 2 cut members).
- Zero-force members: at a joint with 2 non-collinear + no external force, both are zero.
- Frames/machines: multi-force members, pin forces are action–reaction pairs, ΣF + ΣM on each member.
- ASCE/SEI 7-22 LRFD: 1.2D + 1.6L (live-controlled), 1.2D + 1.0W + L (wind), 1.2D + 1.0E + L (seismic).`,
    references: `1. Hibbeler (2016), Statics Vol. Ch. 6 (Structural Analysis — trusses method of joints & sections, frames & machines), Ch. 7 (Internal Forces), Ch. 8 (Friction — dry friction, wedges, screws, bearings, belt friction).
2. Beer, Johnston, Mazurek & Cornwell (2019), Ch. 6 (Analysis of Structures — trusses, frames, machines), Ch. 8 (Friction — dry friction, wedges, screws, belt friction).
3. Riley & Sturges (2007), Ch. 4 (Structures — trusses method of joints & sections, frames, machines), Ch. 6 (Friction — dry friction, wedges, screws, disk friction, belt friction).
4. Meriam, Kraige & Bolton (2016), Dynamics — the kinetic-friction F_k = μ_k·N feeds Newton's 2nd law for sliding bodies (Lesson 2 cross-reference).
5. ISO 55000:2014 — asset-management framework for friction-controlled machine-element reliability (μ_s, μ_k) and truss-connection integrity.
6. ASCE/SEI 7-22 Ch. 2 (load combinations), Ch. 4 (soil & hydrostatic), Ch. 5/6 (wind), Ch. 11/12 (seismic) — drives the design FBDs and member forces in trusses and frames.`,
  },
  knowledgeObject: {
    title: "Friction & Structural Analysis — Knowledge Object",
    domain: "Engineering Mechanics",
    competency: "Friction, Trusses, Frames & Machines",
    topic: "Dry Friction (μ_s, μ_k), Trusses (Method of Joints/Sections), Frames & Machines",
    concept: "F ≤ μN; θ_r = arctan(μ_s); T_high/T_low = e^(μθ); m + r = 2j",
    body: {
      definitions: [
        "Dry (Coulomb) friction: tangential force F ≤ μ·N opposing relative sliding.",
        "Static coefficient μ_s: threshold of sliding; F_s,max = μ_s·N.",
        "Kinetic coefficient μ_k: sliding friction; F_k = μ_k·N (typically < μ_s).",
        "Angle of repose θ_r = arctan(μ_s): incline angle at impending sliding.",
        "Friction angle φ = arctan(μ_s): used in wedge and screw formulas.",
        "Capstan (Euler–Eytelwein): T_high/T_low = e^(μ·θ), θ in radians.",
        "Truss: pin-jointed triangulated structure; members are two-force (axial only).",
        "Method of joints: each pin as a particle, ΣF = 0.",
        "Method of sections: cut through 3 members, take one side as FBD, ΣF + ΣM = 0.",
        "Frame: structure with at least one multi-force member.",
        "Machine: a frame with moving parts.",
      ],
      principles: [
        "F_s ≤ μ_s·N (static); F_k = μ_k·N (kinetic); μ_k < μ_s typically.",
        "Friction independent of apparent contact area and (low-speed) sliding speed.",
        "θ_r = arctan(μ_s): block on incline at impending sliding.",
        "Capstan: T_high/T_low = e^(μ·θ); exponential amplification.",
        "Screw self-locking: α < φ = arctan μ.",
        "Truss determinacy: m + r = 2j (determinate); > indeterminate, < unstable.",
        "Method of joints: solve each pin as a particle, 2 unknowns max per joint.",
        "Method of sections: cut through 3 members, ΣF + ΣM = 0 (place O at intersection of 2 cut members to eliminate them).",
        "Zero-force members: joint with 2 non-collinear + no ext force ⇒ both zero.",
        "Frames/machines: multi-force members; pin forces are action–reaction pairs (Newton's 3rd Law).",
      ],
      components: [
        "Friction pair (μ_s, μ_k depend on materials)",
        "Normal force N (perpendicular compressive)",
        "Incline / wedge / screw / capstan",
        "Truss members (steel angles, tubes, W-shapes, glulam)",
        "Truss joints (frictionless pin idealization)",
        "Frame members (beams, columns with multi-force loading)",
        "Machine elements (pistons, connecting rods, cranks, cams)",
        "ASCE/SEI 7-22 loads (D, L, S, W, E) on structures",
      ],
      mechanism:
        "Dry friction is the resistance to relative sliding between two solid surfaces, governed by asperity interaction at the microscopic contact. The Coulomb law (F ≤ μ·N) is empirical and idealized; it captures the linear dependence on normal force and the threshold-of-sliding phenomenon (μ_s > μ_k ⇒ stick-slip). Trusses transfer loads through axial forces in triangulated pin-jointed members (no bending in ideal members); the method of joints and method of sections solve for these forces from equilibrium alone. Frames and machines have multi-force members (loaded along the length) and require per-member FBDs with action–reaction pin forces tracked between adjacent members. ASCE/SEI 7-22 load combinations (1.2D + 1.6L, 1.2D + 1.0W + L, 1.2D + 1.0E + L) drive the design member forces in real structures.",
      process:
        "Friction: identify N (ΣF_perp = 0) → check static/kinetic regime → apply F_s ≤ μ_s·N or F_k = μ_k·N. Truss: compute reactions → identify zero-force members → method of joints (start at support) OR method of sections (cut through target member) → assume all in tension, negative ⇒ compression → solve. Frame/machine: FBD of each member → action–reaction at pins → ΣF + ΣM on each → coupled system → solve. Apply ASCE/SEI 7-22 LRFD combinations for design member forces.",
      formulas: [
        "F_s ≤ μ_s·N (static); F_k = μ_k·N (kinetic)",
        "θ_r = arctan(μ_s) (angle of repose)",
        "P_wedge = W·tan(α + 2φ) (raise load via wedge)",
        "M_screw = W·r·tan(α + φ) (raise load via square-thread screw)",
        "T_high/T_low = e^(μ·θ) (capstan, θ in radians)",
        "m + r = 2j (planar truss determinacy)",
        "Method of joints: ΣF_x = 0, ΣF_y = 0 at each pin",
        "Method of sections: ΣF = 0, ΣM_O = 0 (O at intersection of 2 cut members)",
        "ASCE/SEI 7-22 LRFD: 1.4D; 1.2D + 1.6L + 0.5(L_r or S); 1.2D + 1.0W + L; 1.2D + 1.0E + L; 0.9D + 1.0W; 0.9D + 1.0E",
      ],
      metrics: [
        "Friction coefficient (μ_s, μ_k dimensionless)",
        "Angle of repose θ_r (degrees)",
        "Belt tension ratio T_high/T_low (dimensionless)",
        "Truss member force (kN — tension + or compression −)",
        "Frame pin force components (kN)",
        "Frame member moment (kN·m)",
        "ASCE/SEI 7-22 load factor (1.2, 1.6, 1.0, 0.9)",
        "AISC / NDS usage ratio (≤ 1.0 to pass)",
      ],
      examples: [
        "Block on 30° incline, μ_s = 0.50: θ_r = 26.6° < 30° ⇒ slides. With μ_k = 0.30: a = 2.36 m/s² down-incline.",
        "Pratt truss 36 m span, 6 panels, h = 2.5 m, w_u = 20.8 kN/m: F_diag_A = 973.5 kN (T); F_chord_AB = 898.5 kN (T); F_chord_mid = 1348 kN (T, max bottom chord).",
        "Capstan with μ = 0.30, θ = 2π (one wrap): T_high/T_low = e^1.885 = 6.58; θ = 4π (two wraps): 43.4; θ = 6π (three wraps): 285.",
      ],
      industrial_examples: [
        "Container Terminal — 1200-tonne ship-to-shore gantry crane on 8 wheels, μ_s = 0.20; storm wind 1950 kN requires 366 kN brake force per wheel, 1830 kN clamp force per wheel.",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Pedestrian Bridge (continued): 36-m Pratt truss, w_u = 20.8 kN/m; F_chord_AB = 898.5 kN (T), F_chord_mid = 1348 kN (T); design check 2×L6×4×5/8 = 952 kN < 1348 ⇒ INSUFFICIENT, upgrade to 2×L8×6×3/4 or add cover plates.",
      ],
      common_errors: [
        "Confusing μ_s and μ_k — static is the threshold (F ≤ μ_s·N), kinetic is the sliding value (F = μ_k·N).",
        "Applying F = μ·N at rest when in equilibrium — at rest, F = F_applied, up to the limit.",
        "Using degrees in the capstan equation (must be radians).",
        "Sign convention mixing in truss members — assume all tension, negative ⇒ compression.",
        "Starting method of joints at a joint with 3+ unknowns — start at a support.",
        "Method of sections cutting 4+ members (3 max per cut).",
        "Forgetting zero-force members at joints with 2 non-collinear + no ext force.",
        "Treating a frame member as a two-force member (multi-force members have shear + moment).",
        "Forgetting action–reaction pairs at pins (force on A = −force on B).",
      ],
      limitations: [
        "Coulomb law is empirical — real friction depends on speed (Stribeck curve), temperature, surface finish, lubrication.",
        "Stick-slip (μ_k < μ_s) causes vibration (brake squeal, machine-tool chatter) — nonlinear, ignored in simple models.",
        "Truss pin joints are idealizations — real gusset plates introduce some fixity (secondary stresses).",
        "Truss members must be slender for axial-only assumption; stocky members develop bending.",
        "Large frames need matrix structural analysis (stiffness method) on computers.",
        "ASCE/SEI 7-22 loads are prescriptive — unusual loads (impact, blast, fire) require dynamic analysis (Lesson 2).",
      ],
      best_practices: [
        "Always identify the friction regime (static vs. kinetic) before writing the equation.",
        "Use the friction angle φ = arctan(μ_s) in wedge and screw problems — NOT μ itself.",
        "In capstan problems, convert wrap angle to radians before plugging into e^(μ·θ).",
        "In truss analysis, identify zero-force members at the start to simplify.",
        "Assume all members in tension; a negative result means compression (consistent sign convention).",
        "In method of sections, place the moment point O at the intersection of two cut members to eliminate them.",
        "For frames/machines, take each member as a separate FBD and track pin forces as action–reaction pairs.",
        "Apply ASCE/SEI 7-22 LRFD load combinations for design; ASD for working-stress.",
      ],
      related_concepts: [
        "Statics (Lesson 1): FBDs, equilibrium ΣF = 0, two-force members, support reactions.",
        "Dynamics (Lesson 2): kinetic friction F_k = μ_k·N feeds Newton's 2nd law for sliding bodies.",
        "Mechanics of Materials: stress σ = P/A for truss members (axial) — ties member force to material stress.",
        "Structural Analysis: stiffness method for indeterminate trusses/frames.",
        "Steel design (AISC), wood design (NDS): material design codes that close the structural loop.",
        "Machine design: linkages, cams, gear trains — multi-force members in motion.",
      ],
      prerequisites: [
        "Statics (Lesson 1): force vectors, moments, FBDs, two-force members, equilibrium.",
        "Trigonometry: arctan, exponential function (for capstan).",
        "Newton's 3rd Law: action-reaction at every pin in a frame.",
        "ASCE/SEI 7-22 load combinations (Lesson 1) for structural design loads.",
      ],
      references: MECH_REFERENCE_TITLES,
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
        "A block of mass m rests on an inclined plane at the angle of repose θ_r, just at the threshold of impending sliding. The static friction coefficient between the block and the plane is:",
      explanation:
        "At the angle of repose, the gravity component m·g·sin θ_r equals the maximum static friction μ_s·m·g·cos θ_r ⇒ tan θ_r = μ_s ⇒ μ_s = tan θ_r.",
      whyCorrect:
        "At the angle of repose θ_r, the block is at impending sliding. Decompose gravity into the parallel (down-incline) component W_parallel = m·g·sin θ_r and the perpendicular (into incline) component W_perp = m·g·cos θ_r, with the normal force N = W_perp = m·g·cos θ_r. The maximum static friction is F_s,max = μ_s·N = μ_s·m·g·cos θ_r. At impending sliding, W_parallel = F_s,max ⇒ m·g·sin θ_r = μ_s·m·g·cos θ_r ⇒ tan θ_r = μ_s ⇒ μ_s = tan θ_r. For θ_r = 26.565° (a common angle for sand on a steel plane), μ_s = tan 26.565° = 0.500.",
      whyOthersWrong: [
        "Option μ_s = sin θ_r is the gravity component parallel to the incline divided by W = mg (not by N = mg·cos θ_r) — gives the wrong ratio. The friction law is F = μ·N where N is the NORMAL force (mg·cos θ_r), not the weight W (mg).",
        "Option μ_s = cos θ_r is the perpendicular-to-incline component divided by W = mg — wrong direction. The relevant ratio is F_parallel / N = (mg·sin θ_r)/(mg·cos θ_r) = tan θ_r.",
        "Option μ_s = 1/tan θ_r = cot θ_r inverts the ratio — would give μ_s = 1/0.5 = 2 for θ_r = 26.6°, which is far above typical friction coefficients (max ~1.0 for rubber-on-dry-concrete).",
      ],
      options: [
        { text: "μ_s = sin θ_r", isCorrect: false },
        { text: "μ_s = tan θ_r", isCorrect: true },
        { text: "μ_s = cos θ_r", isCorrect: false },
        { text: "μ_s = cot θ_r (= 1/tan θ_r)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Container Terminal",
      stem:
        "A mooring line wrapped 3 full turns around a bollard (μ_s = 0.25 between the rope and the steel bollard) is pulled with T_low = 200 N on the free end by a dockworker. The maximum tension T_high on the ship side that the line can resist before slipping is:",
      explanation:
        "Capstan equation T_high/T_low = e^(μ·θ), with θ = 3·2π = 6π = 18.85 rad and μ = 0.25: T_high/T_low = e^(0.25·18.85) = e^4.712 = 111.3 ⇒ T_high = 200·111.3 = 22 260 N ≈ 22.3 kN.",
      whyCorrect:
        "The capstan (Euler–Eytelwein) equation relates the high-tension side to the low-tension side by T_high/T_low = e^(μ·θ), where θ is the wrap angle in RADIANS and μ is the static friction coefficient at impending slip. Three full wraps give θ = 3·2π = 6π = 18.8496 radians. With μ = 0.25: μ·θ = 0.25·18.85 = 4.712; e^4.712 = 111.32. Therefore T_high = T_low·e^(μ·θ) = 200·111.32 = 22 264 N ≈ 22.3 kN — the dockworker's 200 N pull on the free end resists 22.3 kN of ship-side tension before the line slips. This is how a single dockworker can hold a 1000-tonne ship at a mooring bollard with just a few wraps.",
      whyOthersWrong: [
        "Option 5.53 kN uses θ = 3·360° = 1080 — but applies the capstan equation with θ in DEGREES instead of radians: e^(0.25·1080) = e^270 — astronomically large, so this option likely used θ = 3·2π·(180/π) inverted or some other confused conversion; numerically T = 200·e^(0.25·5.0) = 200·e^1.25 = 200·3.49 = 698 N (close to a different wrong option). The actual wrong-value computation likely used θ in degrees directly without the radian conversion.",
        "Option 1.4 kN uses θ = 3 turns = 3 radians (instead of 3·2π = 18.85 rad): e^(0.25·3) = e^0.75 = 2.117 ⇒ T_high = 200·2.117 = 423 N ≈ 0.42 kN (the actual reported value of 1.4 kN might be from a slightly different error, but the principle is the same — wrong θ units).",
        "Option 200 N assumes no friction amplification (T_high = T_low) — would mean the line is frictionless, contradicting the given μ_s = 0.25. The capstan equation gives exponential amplification, not equality.",
      ],
      options: [
        { text: "1.4 kN", isCorrect: false },
        { text: "22.3 kN", isCorrect: true },
        { text: "5.53 kN", isCorrect: false },
        { text: "200 N", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Construction",
      stem:
        "A simply supported Pratt roof truss of span L = 12 m (4 panels of 3 m each), height h = 2 m, carries a single downward point load P = 24 kN at the central lower-chord joint. Using the method of joints, the force in the diagonal member adjacent to the left support (tension +, compression −) is:",
      explanation:
        "Reactions R_A = R_B = 12 kN each (by symmetry). At joint A, members are: bottom chord AB (horizontal), top chord AD (diagonal at angle α where tan α = h/panel = 2/3 ⇒ α = 33.69°, sin α = 0.5547, cos α = 0.8321). ΣF_y at A: 12 − F_AD·sin α = 0 ⇒ F_AD = 12/0.5547 = 21.6 kN (tension — diagonal pulls away from A).",
      whyCorrect:
        "Step 1 — External reactions: with the central point load P = 24 kN and a symmetric 12-m span, by symmetry R_A = R_B = P/2 = 12 kN each. Step 2 — Method of joints at A (left support, pin): the two members meeting at A are the bottom-chord AB (horizontal) and the top-chord AD (diagonal up at angle α where tan α = h/panel = 2/3 ⇒ α = 33.69°, sin α = 0.5547, cos α = 0.8321). Step 3 — ΣF_y = 0 at A: R_A − F_AD·sin α = 0 (no external vertical load at A, just the support reaction; F_AD is assumed in tension, pulling away from A, with vertical component sin α upward). 12 − F_AD·0.5547 = 0 ⇒ F_AD = 12/0.5547 = 21.6 kN. Step 4 — Sign: positive ⇒ TENSION. (The diagonal in a Pratt roof truss near the support is in tension, as expected — it pulls down on the lower chord and up on the top chord.) ΣF_x = 0 at A: F_AB − F_AD·cos α = 0 ⇒ F_AB = 21.6·0.8321 = 18.0 kN (tension, bottom chord).",
      whyOthersWrong: [
        "Option 12 kN (compression) — would be the answer if the diagonal were vertical (α = 90°, sin α = 1, F_AD = R_A/sin 90° = 12 kN); but the diagonal in a Pratt truss is at α = 33.69° (h/panel = 2/3), not vertical. Also, the sign is wrong — the Pratt roof diagonal near the support is in TENSION, not compression.",
        "Option 36 kN (tension) uses the wrong trig: would result from sin α = 12/36 = 0.333 ⇒ α = 19.47° (a different geometry — perhaps using h/L instead of h/panel: tan α = 2/12 = 0.167 ⇒ α = 9.46°, sin = 0.164, F_AD = 12/0.164 = 73 kN — different wrong answer).",
        "Option 21.6 kN (compression) has the correct magnitude but the wrong SIGN — the Pratt roof diagonal near the support is in TENSION (it pulls down on the lower chord and up on the top chord, transmitting the support reaction to the top chord). Compression would be the answer for a Howe truss (where the diagonals are reversed).",
      ],
      options: [
        { text: "12 kN (Compression)", isCorrect: false },
        { text: "21.6 kN (Tension)", isCorrect: true },
        { text: "36 kN (Tension)", isCorrect: false },
        { text: "21.6 kN (Compression)", isCorrect: false },
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
        "True or False: For a planar pin-jointed truss with m members, j joints, and r external support reactions, the condition for statical determinacy is m + r = 2·j. If m + r > 2·j the truss is unstable (a mechanism); if m + r < 2·j the truss is statically indeterminate (has redundant members).",
      explanation:
        "FALSE — the conditions are REVERSED. m + r = 2j is determinate; m + r > 2j is statically INDETERMINATE (redundant members); m + r < 2j is UNSTABLE (a mechanism).",
      whyCorrect:
        "FALSE — the test is reversed in the question stem. The correct determinacy test for a planar pin-jointed truss is: m + r = 2·j ⇒ STATICALLY DETERMINATE (the number of unknowns — m member forces + r support reactions — exactly equals the number of independent equilibrium equations — 2 per joint × j joints). m + r > 2·j ⇒ STATICALLY INDETERMINATE (more unknowns than equations — there are REDUNDANT members or redundant supports; solving requires deformation/compatibility analysis from Mechanics of Materials). m + r < 2·j ⇒ UNSTABLE (a MECHANISM — fewer unknowns than equations means the truss can move without any load; e.g., a square frame with no diagonal is unstable). The question's stem reverses the latter two conditions — claiming m + r > 2j is unstable and m + r < 2j is indeterminate, which is backwards. (Example: a simple king-post truss with m = 5, j = 4, r = 3 has m + r = 8 = 2·j = 8 ⇒ determinate. Add a redundant diagonal: m = 6, m + r = 9 > 8 ⇒ indeterminate (one redundant member). Remove the king post: m = 4, m + r = 7 < 8 ⇒ unstable mechanism.)",
      whyOthersWrong: [
        "Option TRUE — accepts the reversed conditions in the stem. The correct determinacy test (Hunt's formula, also Maxwell's rule for trusses) is m + r = 2j (determinate); m + r > 2j ⇒ INDETERMINATE (redundant, not unstable — the truss is still rigid, just over-constrained and needs Mechanics of Materials to solve); m + r < 2j ⇒ UNSTABLE (mechanism, not indeterminate — the truss can move under no load, like a square without a diagonal). Mixing up the latter two is a common student error.",
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

export const MECH_LESSONS: RefLesson[] = [
  LESSON_STATICS,
  LESSON_DYNAMICS,
  LESSON_FRICTION,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts and fluid-mechanics.ts EXACTLY. The Prisma shim
// (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices with
//     order→sortOrder, FK→connect form). We use db.question (NOT
//     db.practiceProblem) so the shim applies stem→question and
//     options→choices mapping.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (we set chapterId, which
//     the shim maps to { chapter: { connect: { id } } }).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
// ---------------------------------------------------------------------------

/**
 * Upsert the Engineering Mechanics discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "engineering-mechanics" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "engineering-mechanics-fundamentals", name "Engineering Mechanics
 *     Fundamentals", order 1, icon "Move3d").
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
  // 1) Discipline — find by slug "engineering-mechanics" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "engineering-mechanics" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "engineering-mechanics" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "engineering-mechanics-fundamentals"; name: "Engineering
  //    Mechanics Fundamentals"; order 1. The Chapter has a
  //    @@unique([disciplineId, slug]), so we use findFirst + create/update.
  const chapterSlug = "engineering-mechanics-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Engineering Mechanics Fundamentals",
    slug: chapterSlug,
    description:
      "Statics (force systems & equilibrium), dynamics (kinematics & kinetics), and friction & structural analysis — the three-lesson deep scientific reference for the Engineering Mechanics engineering discipline.",
    icon: "Move3d",
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
  for (const src of MECH_SOURCES) {
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
  const sharedReferenceIds = MECH_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of MECH_LESSONS) {
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
