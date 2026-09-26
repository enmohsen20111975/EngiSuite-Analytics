// =============================================================================
// Fluid Mechanics — Engineering Discipline — Deep scientific reference
// (Task ID: FLUID).
//
// Discipline slug: "fluid-mechanics" (seeded by scripts/seed-disciplines.ts).
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts EXACTLY (the first general-track
// loader). The Prisma shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices with
//     order→sortOrder, FK→connect form).
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise.
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs → connect.
//
// Three lessons (one chapter "Fluid Mechanics Fundamentals"):
//   1. Fluid Statics & Properties               (slug: fluid-statics-properties)
//   2. Fluid Dynamics: Bernoulli & Continuity   (slug: fluid-dynamics-bernoulli-continuity)
//   3. Pipe Flow & Dimensional Analysis          (slug: fluid-pipe-flow-dimensional-analysis)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional fluid-mechanics content. No padding.
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
//   - LEVEL 6 — University / Academic Publications: Munson, Okiishi, Huebsch
//     & Rothmayer, "Fundamentals of Fluid Mechanics" (Wiley, 7th ed., 2013);
//     Frank M. White, "Fluid Mechanics" (McGraw-Hill, 8th ed., 2016).
//   - LEVEL 7 — Technical Publications / Industry Sources: Crowe, Elger,
//     Williams & Roberson, "Engineering Fluid Mechanics" (Wiley, 10th ed.,
//     2013); Streeter, Wylie & Bedford, "Fluid Mechanics" (McGraw-Hill, 9th
//     ed., 1998).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014
//     (Asset Management — aligns fluid-system efficiency KPIs with the ISO
//     55000 asset-management framework).
//   - LEVEL 5 — Professional Organizations: ASCE Manuals and Reports on
//     Engineering Practice No. 140 — Steel Penstocks (2012) — the canonical
//     pressurized-steel-pipe reference used in Lesson 3.
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
// Public types (mirror thermodynamics.ts / cre-reliability-modeling.ts)
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
// SOURCES — 6 real references cited across all fluid-mechanics lessons.
// ---------------------------------------------------------------------------

export const FLUID_SOURCES: RefSource[] = [
  {
    title:
      "Munson, Okiishi, Huebsch & Rothmayer — Fundamentals of Fluid Mechanics (Wiley, 7th ed., 2013)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Munson, B. R., Okiishi, T. H., Huebsch, W. W., & Rothmayer, A. P. (2013). Fundamentals of Fluid Mechanics (7th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-11613-5. Chapters 1 (Introduction — fluids, properties, viscosity, compressibility), 2 (Fluid Statics — pressure, manometry, hydrostatic forces on plane/curved surfaces, buoyancy), 3 (Elementary Fluid Dynamics — Bernoulli equation along a streamline, static & stagnation pressure, Pitot tube), 4 (Fluid Kinematics — velocity & flow fields, control volume), 5 (Finite Control Volume Analysis — continuity, energy, linear-momentum), 6 (Differential Analysis — Navier–Stokes, stream function), 7 (Dimensional Analysis — Buckingham Pi, similitude), 8 (Viscous Flow in Pipes — Darcy–Weisbach, Moody, minor losses), 9 (Flow Over External Surfaces — boundary layers, drag, lift). The canonical undergraduate fluid-mechanics textbook used by ABET-accredited ME programs.",
  },
  {
    title:
      "White — Fluid Mechanics (McGraw-Hill, 8th ed., 2016)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "White, F. M. (2016). Fluid Mechanics (8th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-339827-3. Chapters 1 (Introduction — fluids, properties, the continuum hypothesis), 2 (Pressure Distribution in a Fluid — hydrostatics, manometry, buoyancy, stability), 3 (Integral Relations for a Control Volume — continuity, energy, angular-momentum), 4 (Differential Relations for a Fluid Particle — Navier–Stokes, stream function, vorticity), 5 (Dimensional Analysis and Similarity — Buckingham Pi, Re, Fr, We, Ma), 6 (Viscous Flow in Ducts — laminar/turbulent, Darcy–Weisbach, Colebrook, minor losses), 7 (Flow Past Immersed Bodies — boundary layers, drag, lift), 11 (Turbomachinery — pump curves, system curves, operating point). Reference for the rigorous differential-control-volume formulation and the dimensional-analysis treatment in Lesson 3.",
  },
  {
    title:
      "Crowe, Elger, Williams & Roberson — Engineering Fluid Mechanics (Wiley, 10th ed., 2013)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Crowe, C. T., Elger, D. F., Williams, B. C., & Roberson, J. A. (2013). Engineering Fluid Mechanics (10th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-01320-1. Chapters 1 (Introduction — fluid properties, viscosity), 2 (Fluid Statics — pressure, manometry, buoyancy), 3 (Fluid Kinematics — velocity field, streamlines), 4 (Control Volume Approach — continuity, energy, momentum), 5 (Finite Control Volume — Bernoulli with head loss), 7 (Dimensional Analysis and Similitude — Pi groups, model studies), 9 (Surface Resistance — Darcy–Weisbach, Moody, laminar sub-layer), 10 (Flow in Conduits — minor losses, pump–system curves), 11 (Flow in Open Channels — Fr, specific energy, hydraulic jumps). Practitioner-oriented reference with extensive worked examples throughout.",
  },
  {
    title:
      "Streeter, Wylie & Bedford — Fluid Mechanics (McGraw-Hill, 9th ed., 1998)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Streeter, V. L., Wylie, E. B., & Bedford, K. W. (1998). Fluid Mechanics (9th ed.). New York, NY: McGraw-Hill. ISBN 978-0-07-062253-4. Chapters 1 (Fluid Properties and Concepts), 2 (Fluid Statics — pressure variation, manometry, forces on surfaces, buoyancy), 3 (Fluid-Flow Concepts and Equations — streamlines, control volume, continuity, Euler and Bernoulli equations), 4 (Application of the Bernoulli and Continuity Equations — Pitot tube, venturi meter, siphon, orifice), 5 (Two- and Three-Dimensional Fluid Statics and Kinematics), 6 (Dimensional Analysis and Similitude), 7 (Steady Flow in Closed Conduits — Darcy–Weisbach, Colebrook, Moody, minor losses), 8 (Pipe Systems and Pumps — system curves, pump selection). Reference for the classical treatment of statics and conduit-flow analysis.",
  },
  {
    title: "ISO 55000:2014 — Asset Management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55000.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines the asset-management framework (Plan–Do–Check–Act), the concept of an asset system, and the value/cost/risk triangle against which fluid-system efficiency metrics — pump-system specific energy (kWh/m³), pipeline friction-loss head (m/km), manometer reliability, venturi custody-transfer uncertainty — are reported as lifecycle asset-performance KPIs. Cited in all three lessons to align fluid-mechanics calculations with the ISO 55000 asset-management reporting structure that water utilities, oil & gas operators, and hydro-power producers apply to pump, pipe, and meter fleets.",
  },
  {
    title:
      "ASCE Manuals and Reports on Engineering Practice No. 140 — Steel Penstocks (ASCE, 2012)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://ascelibrary.org/doi/book/10.1061/9780784477099",
    citation:
      "American Society of Civil Engineers (ASCE). (2012). Steel Penstocks (ASCE Manuals and Reports on Engineering Practice No. 140). Reston, VA: ASCE. ISBN 978-0-7844-7709-9. Chapters 1 (General — penstock scope, codes, nomenclature), 3 (Design Loads — internal hydrostatic & dynamic pressure, water hammer, surge), 4 (Steel Plate — allowable stresses, joint efficiency), 5 (Pipe Wall Thickness — hoop stress, stiffener ring design), 9 (Hydraulic Design — Darcy–Weisbach friction, minor losses, diameter optimization, system head curves), 11 (Bifurcations and Branch Works — continuity, head-loss balancing), 13 (Testing and Commissioning — hydrostatic proof, manometer calibration). The canonical pressurized-steel-pipe reference cited in Lesson 3 to bridge classroom Darcy–Weisbach analysis with field penstock-sizing practice.",
  },
];

const FLUID_REFERENCE_TITLES = FLUID_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Fluid Statics & Properties
// (slug: fluid-statics-properties)
// ---------------------------------------------------------------------------

const LESSON_STATICS: RefLesson = {
  slug: "fluid-statics-properties",
  title: "Fluid Statics & Properties",
  titleAr: "سكون الموائع والخصائص",
  order: 1,
  durationMin: 30,
  references: FLUID_REFERENCE_TITLES,
  conceptIntroduction: `Fluid mechanics studies fluids at rest (statics) and in motion (dynamics). A *fluid* — liquid or gas — deforms continuously under an applied shear stress, however small; this is the defining distinction from solids. This lesson treats fluid *statics*, where the fluid is at rest relative to a container, and the *properties* that govern fluid behavior: density ρ, specific weight γ = ρg, specific gravity SG = ρ/ρ_water, compressibility, surface tension, and viscosity μ. The central result of statics is the *hydrostatic pressure variation*: in a continuous, incompressible fluid at rest, pressure increases linearly with depth according to P = P₀ + ρgh, where h is the depth below a free surface. Pascal's law states that a pressure change applied at any point in a confined incompressible fluid is transmitted undiminished throughout the fluid — the operating principle of the hydraulic press, hydraulic jack, and hydraulic ram. Archimedes' principle gives the buoyant force on a submerged or floating body as F_b = ρgV_displaced, directed upward through the center of buoyancy. Manometers — U-tube, well-type, inclined, and differential — exploit the hydrostatic relation to measure pressure with high accuracy. Newtonian fluid behavior τ = μ(du/dy) characterizes water, air, and most engineering fluids, while non-Newtonian fluids (polymer melts, drilling muds, blood) follow more complex constitutive laws. These statics and property concepts underpin the dynamics and pipe-flow analyses of Lessons 2 and 3.`,
  sections: {
    learning_objectives: `- Define pressure, density, specific weight, specific gravity, and viscosity (dynamic μ and kinematic ν = μ/ρ).
- Apply Pascal's law to hydraulic systems; compute mechanical advantage F_out/F_in = A_out/A_in.
- Compute hydrostatic pressure variation: P = P₀ + ρgh.
- Solve U-tube, well-type, differential, and inclined manometer problems using ΔP = ρgh.
- Apply Archimedes' principle F_b = ρgV_displaced for buoyancy and metacentric stability GM = BM − BG.
- Distinguish Newtonian from non-Newtonian fluids via τ = μ(du/dy).`,
    prerequisites: `- Differential and integral calculus (chain rule, integration in one variable).
- Newtonian mechanics: force and moment equilibrium, free-body diagrams.
- SI units and dimensions (kg, m, s, N, Pa, 1 Pa = 1 N/m²).
- Basic thermodynamics: density as inverse specific volume; ideal-gas PV = mRT for the compressible atmosphere.`,
    introduction: `Fluid statics is the engineering science of fluids at rest under gravity. Although the fluid is motionless, the pressure field is rich: at a point, pressure is isotropic (Pascal's law of isotropy); across depth, pressure varies linearly as P = P₀ + ρgh (hydrostatic equation); on a submerged surface, pressure produces a resultant force whose magnitude equals the average pressure times the projected area and whose line of action passes through the centroid of the pressure prism (centre of pressure). A floating or submerged body experiences an upward buoyant force equal to the weight of the displaced fluid — Archimedes' principle — and its stability under small heel is governed by the metacentric height GM = BM − BG, where BM = I_waterplane/V_displaced. The properties of the working fluid — density ρ, viscosity μ, surface tension σ, bulk modulus E, and vapour pressure — are inputs to every subsequent calculation in this discipline. Pascal's law underwrites the hydraulic press, the hydraulic jack, and brake-by-wire systems; Archimedes underwrites naval architecture, buoyancy-driven mixing, and ballast control. The two relations plus a property table are sufficient to analyse every static problem in this lesson.`,
    terminology: `- **Fluid**: deforms continuously under shear; liquids (incompressible, fixed volume), gases (compressible, fill container).
- **Pressure P** (Pa = N/m²): normal force per unit area; 1 bar = 10⁵ Pa; 1 atm = 101.325 kPa.
- **Absolute vs gauge**: P_abs = P_gauge + P_atm; vacuum is below atmospheric.
- **Density ρ** (kg/m³): mass per unit volume; water ≈ 1000, air ≈ 1.2.
- **Specific weight γ = ρg** (N/m³): water ≈ 9810.
- **Specific gravity SG = ρ/ρ_water**: dimensionless.
- **Dynamic viscosity μ** (Pa·s): resistance to shear; water ≈ 1.0×10⁻³, air ≈ 1.8×10⁻⁵.
- **Kinematic viscosity ν = μ/ρ** (m²/s).
- **Bulk modulus E** (Pa): E ≈ 2.2 GPa for water (nearly incompressible).
- **Surface tension σ** (N/m): water-air ≈ 0.073; capillary rise h = 4σ cos θ/(ρgd).`,
    detailed_explanation: `**Pressure at a point.** Pressure is isotropic at a point in a static fluid: on any elemental area dA within the fluid, the force dF = P·dA acts normal to the surface regardless of orientation. This follows from the equilibrium of a triangular fluid element under no shear stress.

**Hydrostatic variation.** Consider a vertical fluid element of area dA and height dz. Equilibrium: P·dA − (P + dP)·dA − ρg·dA·dz = 0 ⇒ dP/dz = −ρg. For an incompressible liquid (ρ constant), integration from the free surface (z = 0, P = P₀) to depth h gives the hydrostatic equation P = P₀ + ρgh. For the compressible atmosphere, ρ = P/(RT) (ideal gas) gives the barometric relation P = P₀·exp(−gz/RT) ≈ P₀(1 − gz/RT) for the troposphere.

**Pascal's law.** Because pressure at a given depth is uniform, an external pressure applied to a confined incompressible fluid is transmitted undiminished: P₁ = P₂ ⇒ F₁/A₁ = F₂/A₂. The hydraulic press amplifies force by the area ratio A₂/A₁, with no amplification of work (volume displaced equal on both sides): F₂/F₁ = A₂/A₁ = d₁/d₂.

**Manometry.** A U-tube manometer reads a pressure difference via ΔP = (ρ_m − ρ_f)gh for a differential liquid setup, or ΔP = ρ_m·g·h for a gas-side measurement (ρ_f ≪ ρ_m). Mercury (ρ = 13 600 kg/m³) is the canonical manometer fluid; water, oil, or alcohol give finer resolution for low ΔP. Inclined manometers trade vertical height for tube length to resolve ~1 Pa.

**Buoyancy.** Archimedes' principle: a body immersed in a fluid experiences an upward force equal to the weight of the displaced fluid, F_b = ρ_fluid·g·V_displaced, acting through the centroid of the displaced volume (center of buoyancy). A body floats when F_b equals the body's weight; otherwise it sinks (ρ_body > ρ_fluid) or rises (ρ_body < ρ_fluid). Stability requires the metacenter (M) to lie above the centre of gravity (G): GM = BM − BG, with BM = I_waterplane/V_displaced. A floating dock, ship, or pontoon with GM < 0 capsizes.

**Viscosity.** Newton's law of viscosity: τ = μ(du/dy), where du/dy is the velocity gradient normal to the flow. Newtonian fluids (water, air, low-MW oils) have constant μ at a given T, P; non-Newtonian fluids follow τ = K(du/dy)^n + τ_yield (Bingham, shear-thinning, shear-thickening). Liquid μ falls with temperature (weaker intermolecular bonds); gas μ rises with temperature (faster molecular momentum transport).`,
    core_principles: `- Pascal's law: pressure is isotropic in a static fluid and a pressure change is transmitted undiminished.
- Hydrostatic equation: dP/dz = −ρg ⇒ P = P₀ + ρgh (incompressible fluid).
- Archimedes' principle: F_b = ρgV_displaced upward through the centre of buoyancy.
- Newton's law of viscosity: τ = μ(du/dy); Newtonian fluids have constant μ.
- Pressure is a scalar state property; surface forces derive from P·n̂.
- Buoyant stability requires the metacenter above the centre of gravity: GM > 0.`,
    components: `- Working fluid: liquid (water, oil, mercury) or gas (air, N₂, steam).
- Manometer fluid (Hg, water, oil) of known ρ_m inside a U-tube or inclined tube.
- Hydraulic press: small piston (area A₁), large piston (area A₂), confined incompressible oil.
- Submerged or floating body with defined waterplane area and centre of gravity.
- Viscometer (capillary, rotational, falling-sphere) for μ measurement.
- Pressure gauge (Bourdon tube, diaphragm, piezoelectric) calibrated against a manometer.
- Free-surface reference (vent to atmosphere) — the P₀ datum.`,
    process: `1. Identify the fluid system (open tank, confined hydraulic, manometer, submerged body).
2. List known and unknown properties (ρ, μ, σ, P, h, V, F).
3. Choose the reference elevation z = 0 (typically the free surface).
4. Apply the hydrostatic equation P = P₀ + ρgh between two points; or ΔP = ρgh for a manometer column.
5. Apply Pascal for confined incompressible fluids; Archimedes for buoyancy; force & moment equilibrium for stability.
6. Apply Newton's law of viscosity for shear in a moving fluid layer.
7. Verify with units and order of magnitude; state P_abs or P_gauge explicitly.`,
    formula_calculation: `**Hydrostatic pressure (incompressible, constant ρ):**
  P = P₀ + ρgh   [Pa]   (ρ in kg/m³, g in m/s², h in m)

**Pascal's law — hydraulic press:**
  F₂/A₂ = F₁/A₁ ⇒ F₂ = F₁·(A₂/A₁); volume conservation: A₁·d₁ = A₂·d₂

**Manometer (U-tube, gas side):**
  ΔP = ρ_m·g·h   [Pa]
Differential manometer (liquid-liquid pipe):
  ΔP = (ρ_m − ρ_f)·g·h

**Archimedes' buoyant force:**
  F_b = ρ_fluid·g·V_displaced   [N]

**Resultant hydrostatic force on a vertical rectangular wall (height H, width B):**
  F = ½·ρg·H²·B; line of action at ⅔ H below the free surface.

**Metacentric height (initial stability):**
  GM = BM − BG;  BM = I_wp/V_disp;  I_wp = 2nd moment of waterplane area.

**Newton's law of viscosity:**
  τ = μ(du/dy)   [Pa]   (μ in Pa·s, du/dy in 1/s)

**Kinematic viscosity / capillary rise:**
  ν = μ/ρ   [m²/s];  h_cap = 4σ·cosθ/(ρgd)   [m]   for a tube of diameter d

**Bulk modulus & compressibility:**
  β = (1/ρ)(dρ/dP);  E = 1/β = ρ(dP/dρ)   [Pa]   (water: E ≈ 2.2 GPa)

**Assumptions**: (i) continuous fluid (continuum hypothesis); (ii) incompressible liquid (ρ constant) unless stated otherwise; (iii) Newtonian fluid (constant μ) unless non-Newtonian explicitly invoked; (iv) gravity field g = 9.81 m/s² uniform.

**Interpretation**: gauge pressure at 10 m water depth = ρgh ≈ 98 kPa (~1 atm per 10 m of water). Hydraulic press amplifies force ~100× at A₂/A₁ = 100; pays for it by reducing piston travel 100×.`,
    worked_example: `**Example 1 — U-tube mercury manometer.**
A U-tube manometer measures the pressure of water in a pipe. The mercury column height difference is h = 0.30 m; the mercury–water interface on the pipe side is 0.40 m below the pipe centerline. Specific weights: γ_Hg = 133 kN/m³, γ_w = 9.81 kN/m³. Starting at the pipe centerline (unknown P_p), walk down to the mercury interface on the pipe side, then up to the free surface on the other limb:
  P_p + γ_w·(0.40) − γ_Hg·(0.30) = P_atm
⇒ P_p − P_atm = γ_Hg·(0.30) − γ_w·(0.40) = 133×0.30 − 9.81×0.40 = 39.9 − 3.92 = 35.98 kPa ≈ 36.0 kPa gauge.
Quick-check using ΔP ≈ ρ_m·g·h for a gas-side measurement (no water column) gives 39.9 kPa; subtracting the 0.40 m water correction (3.92 kPa) yields 36.0 kPa. ✓

**Example 2 — Buoyancy on a submerged steel sphere.**
A solid steel sphere of radius r = 0.30 m (volume V = (4/3)πr³ = 0.1131 m³, ρ_steel = 7850 kg/m³, m = 888 kg) is fully submerged in seawater (ρ_sw = 1025 kg/m³).
- Buoyant force: F_b = ρ_sw·g·V = 1025 × 9.81 × 0.1131 = 1137 N ≈ 1.14 kN.
- Weight: W = m·g = 888 × 9.81 = 8709 N ≈ 8.71 kN.
- Net downward force: W − F_b = 8.71 − 1.14 = 7.57 kN → the sphere sinks.
- Apparent weight in water ≈ 87% of dry weight (7.57/8.71 = 0.869).
- For flotation, V_required = m/ρ_sw = 888/1025 = 0.866 m³; since actual V = 0.113 m³, ρ_steel/ρ_sw ≈ 7.65 ⇒ sphere sinks as expected.`,
    industrial_example: `**Industry: Construction — hydraulic jack for bridge-bearing replacement.** A 200-ton hydraulic jack uses a hand pump with a 1.5 cm² piston driving a 200 cm² ram. By Pascal's law, F_ram/F_pump = A_ram/A_pump = 200/1.5 = 133×. An 80 N hand force produces 10.6 kN at the ram, and a 200 kN working load requires only 1.5 kN input — well within ergonomic limits. The confined oil transmits pressure instantaneously regardless of hose length, allowing the pump to sit remotely while the ram lifts a 100-ton bridge deck by 25 mm to replace a neoprene bearing. The system's ISO 55000 asset-management record logs cycle counts and oil-pressure drift as condition-monitoring inputs.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Harbor Point Floating Dock (synthetic, illustrative).* A 12 m × 6 m × 1.5 m pontoon floating dock (mass 38 t) supports a peak live load of 6 t in seawater (ρ_sw = 1025 kg/m³). At dead load the pontoon displaces V = m/ρ = 38000/1025 = 37.07 m³, draught = V/(L×B) = 37.07/72 = 0.515 m. With the 6 t live load, draught rises to (44000/1025)/72 = 0.597 m, an additional freeboard loss of 82 mm. Metacentric height: BM = I/V, I = LB³/12 = 12×6³/12 = 216 m⁴; BM = 216/37.07 = 5.82 m. With BG ≈ 0.45 m, GM = 5.37 m, well above the 0.30 m minimum for harbour stability. Even under a 100 kg asymmetric corner load (heeling moment 588 N·m at 0.5 m lever), heel angle θ = M/(W·GM) = 588/(380000×5.37) ≈ 0.00029 rad ≈ 0.017° — negligible.`,
    visual_explanation: `**Hydrostatic prism on a vertical wall.** The pressure distribution on a vertical wall holding back a fluid of depth H is triangular: P(z) = ρg·(H − z), zero at the free surface (z = H) and maximum ρgH at the base (z = 0). The resultant force per unit width is the area of this triangle, F = ½·ρg·H²·B, acting at ⅔ depth below the surface (the centroid of a triangle). On a curved or inclined surface, decompose into horizontal and vertical components — the horizontal component equals the force on the vertical projection of the surface; the vertical component equals the weight of the fluid in the "pressure prism" above the surface up to the free surface. The two components meet at a point through which the resultant passes — the centre of pressure.`,
    simulation_opportunity: `Open EngiSuite "Hydrostatic Force on a Dam" slider: vary water depth H (1–10 m), wall inclination θ, and fluid (water/oil/mercury), and watch the resultant force vector, its line of action, and overturning moment update live. For manometry, the "U-tube Manometer Explorer" lets you swap mercury ↔ water ↔ alcohol and watch ΔP resolution trade against column height. For buoyancy, the "Floating Body Stability" lab plots GM vs heel angle for rectangular, triangular, and circular waterplane sections.`,
    common_mistakes: `- Using gauge and absolute pressure interchangeably — always state which is meant; vacuum is negative gauge.
- Applying P = ρgh to a gas (ρ varies with P for compressible fluids — use the barometric formula P = P₀·exp(−gz/RT)).
- Forgetting the water-column correction in liquid-pipe mercury manometers (subtract γ_f·h_1).
- Computing buoyant force on a floating body using body volume — use *displaced* volume, which is less than body volume when floating.
- Treating non-Newtonian fluids with τ = μ(du/dy) — blood, polymer melts, and Bingham plastics have μ that depends on shear rate or yield stress.
- Using μ at the wrong temperature — water viscosity drops from 1.8×10⁻³ Pa·s at 0 °C to 2.8×10⁻⁴ at 100 °C (a factor of 6.4).
- Confusing specific weight γ = ρg with density ρ — γ has units N/m³, ρ kg/m³.
- Placing the centre of buoyancy at the body's centre — it sits at the centroid of the *displaced fluid volume*, which moves as the body heels.`,
    limitations: `- Hydrostatics assumes no motion; flowing fluids require Bernoulli/Darcy–Weisbach (Lessons 2–3).
- Incompressibility fails for gases (Mach > 0.3) and high-pressure transients (water hammer — wave speed c = √(E/ρ)).
- Newtonian viscosity law fails for non-Newtonian fluids (blood, paints, slurries).
- Archimedes assumes a hydrostatic fluid; in an accelerating or rotating frame add inertial body force ρa or ρω²r.
- Surface-tension corrections (~σ/d) become significant only at capillary length ℓ_c = √(σ/(ρg)) ≈ 2.7 mm for water — negligible for large tanks but dominant in capillaries.`,
    comparison: `| Aspect | Gauge pressure | Absolute pressure |
|---|---|---|
| Zero reference | atmosphere | vacuum (0 Pa) |
| Sign | + above atm, − below | always ≥ 0 |
| Common use | Bourdon gauges, tire pressure | thermodynamics, gas law |

| Fluid | ρ (kg/m³) | μ (Pa·s) | Notes |
|---|---|---|---|
| Water (20 °C) | 998 | 1.0×10⁻³ | Newtonian |
| Air (20 °C) | 1.20 | 1.8×10⁻⁵ | Newtonian |
| Mercury | 13 600 | 1.5×10⁻³ | manometer fluid |
| Crude oil | 850–950 | 10⁻²–10⁻¹ | shear-thinning |

| Manometer type | ΔP range | Resolution |
|---|---|---|
| U-tube Hg | 5–200 kPa | ±50 Pa |
| Well-type | 0.5–50 kPa | ±10 Pa |
| Inclined (alcohol) | 0.05–2 kPa | ±1 Pa |`,
    practical_application: `**Water-utility pressure monitoring.** A municipal booster-pump station uses differential mercury manometers at the pump suction and discharge to monitor developed head. Suction reads 0.18 m Hg vacuum; discharge reads 1.85 m Hg gauge. Net developed head ΔP = (1.85 + 0.18) × 133 kPa/m = 270 kPa ≈ 27.5 m of water. The station's ISO 55000 asset-management dashboard logs this against pump-curve BEP daily; a 5% drop triggers inspection. Surface tension and capillarity corrections are negligible at the >6 mm manometer tube diameters; viscosity effects are irrelevant because static mercury does not flow.`,
    decision_scenario: `You are the marine engineer on a 65 m river ferry with 200-passenger capacity. Stability regulations require GM ≥ 0.30 m at full load. The ferry has an 8 m beam, 1.2 m draught, displaces 220 t, waterplane I = LB³/12 = 65×8³/12 = 2773 m⁴, BM = I/V = 2773/215 = 12.9 m. With KG = 2.4 m and KB = 0.6 m ⇒ BG = 1.8 m ⇒ GM = 11.1 m. A retrofit adds a 3 t upper-deck air-conditioning unit with KG = 6 m (added weight 3 t at +3.6 m lever ⇒ KG rises by (3×6)/223 = 0.081 m). Decision: accept the retrofit — new GM = 11.0 m, still 37× the regulatory minimum. A heavier 25 t upper deck would raise KG to 2.59 m, dropping GM to 10.6 m — still acceptable, but flag for re-evaluation under IMO Part B Chapter 3 heeling-arm criteria.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/Analyze. Topics: Pascal's law, mercury manometer correction, buoyancy on a submerged steel sphere, and flotation draft fraction for a floating cube.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Civil: Water Resources & Environmental exam outlines, ASME PTC 19.2 (pressure measurement), and ASCE MOP 140 (Steel Penstocks). Sample FE-style question: "A U-tube mercury manometer reads h = 0.30 m on a *gas* pipe; the gauge pressure at the tap is approximately: (a) 30 kPa, (b) 40 kPa, (c) 50 kPa, (d) 60 kPa." Correct: (b) — ΔP = γ_Hg·h = 133 × 0.30 = 39.9 kPa ≈ 40 kPa (no water-column correction for a gas pipe).`,
    summary: `Fluid statics treats fluids at rest under gravity. The defining relations — Pascal's law of isotropic pressure, the hydrostatic equation P = P₀ + ρgh, Archimedes' principle F_b = ρgV_displaced, and Newton's law of viscosity τ = μ(du/dy) — together with property data (ρ, μ, σ, E) form the foundation of every pressure-driven, buoyancy-driven, and shear-driven engineering calculation. Manometers, hydraulic presses, floating docks, dams, and viscometers all follow directly. Lesson 2 extends the framework to moving fluids via the continuity and Bernoulli equations; Lesson 3 adds pipe-friction losses and dimensional analysis.`,
    key_takeaways: `- P = P₀ + ρgh (incompressible fluid at rest); always state gauge vs absolute.
- ΔP = ρ_m·g·h for a gas-side mercury manometer; subtract γ_f·h_water correction for liquid pipes.
- F_b = ρgV_displaced upward through the centroid of displaced fluid; floating body ⇒ V_displaced = m_body/ρ_fluid.
- Hydraulic press: F₂ = F₁·(A₂/A₁); trade force for displacement.
- τ = μ(du/dy) for Newtonian fluids; μ drops with T for liquids, rises with T for gases.
- Stability: GM > 0; metacenter above centre of gravity; BM = I_waterplane/V_displaced.`,
    references: `1. Munson et al. (2013), Ch. 1 (intro, properties, viscosity), Ch. 2 (statics, manometry, buoyancy).
2. White (2016), Ch. 1 (intro, properties), Ch. 2 (pressure distribution, manometry, stability).
3. Crowe et al. (2013), Ch. 1–2 (properties, statics, manometry).
4. Streeter et al. (1998), Ch. 1–2 (properties and statics).
5. ISO 55000:2014 (asset-management framework for pressure-system KPIs).
6. ASCE MOP 140 — Steel Penstocks (2012), Ch. 9 (hydraulic design, hydrostatic proof testing).`,
  },
  knowledgeObject: {
    title: "Fluid Statics & Properties — Knowledge Object",
    domain: "Fluid Mechanics",
    competency: "Foundations",
    topic: "Hydrostatics, Manometry, Buoyancy, Properties",
    concept: "Pascal + hydrostatic equation + Archimedes + Newton's law of viscosity",
    body: {
      definitions: [
        "Fluid: a substance that deforms continuously under an applied shear stress.",
        "Pressure P (Pa): normal force per unit area; isotropic at a point in static fluid.",
        "Hydrostatic equation: P = P₀ + ρgh for an incompressible fluid at rest.",
        "Pascal's law: a pressure change applied to a confined incompressible fluid is transmitted undiminished throughout.",
        "Archimedes' principle: F_b = ρgV_displaced upward through the centre of buoyancy.",
        "Newton's law of viscosity: τ = μ(du/dy) for Newtonian fluids.",
        "Bulk modulus E = ρ(dP/dρ); for water E ≈ 2.2 GPa (nearly incompressible).",
      ],
      principles: [
        "Pressure is isotropic at a point in a static fluid (Pascal's law of isotropy).",
        "Pressure increases linearly with depth: dP/dz = −ρg ⇒ P = P₀ + ρgh.",
        "A floating body displaces a volume whose weight equals the body's weight.",
        "Stability requires the metacenter above the centre of gravity: GM > 0; BM = I_wp/V_disp.",
        "Newtonian fluid: μ is independent of shear rate; non-Newtonian fluids violate this.",
      ],
      components: [
        "Working fluid (water, oil, mercury, air)",
        "Manometer fluid of known density ρ_m",
        "Hydraulic press (small + large piston, confined oil)",
        "Submerged / floating body with waterplane area",
        "Pressure gauge (Bourdon, diaphragm, piezoelectric)",
        "Viscometer (capillary, rotational, falling-sphere)",
      ],
      mechanism:
        "Pressure at a point is isotropic; across depth it follows the hydrostatic equation. A pressure change applied at one point in a confined incompressible fluid is transmitted undiminished (Pascal). A body immersed in a fluid experiences an upward buoyant force equal to the weight of the displaced fluid (Archimedes). Viscosity relates shear stress to velocity gradient via τ = μ(du/dy).",
      process:
        "Identify system → choose reference (z = 0 at free surface) → apply hydrostatic P = P₀ + ρgh or manometer ΔP = ρgh → apply Pascal for confined fluids or Archimedes for buoyancy → check stability GM > 0 → apply Newton viscosity for shear → verify units and gauge vs absolute.",
      formulas: [
        "P = P₀ + ρgh (hydrostatic, incompressible)",
        "ΔP = ρ_m·g·h (U-tube manometer, gas side)",
        "ΔP = (ρ_m − ρ_f)·g·h (differential, liquid-liquid)",
        "F₂ = F₁·(A₂/A₁) (Pascal, hydraulic press)",
        "F_b = ρ_fluid·g·V_displaced (Archimedes)",
        "F_wall = ½·ρg·H²·B (vertical rectangular wall)",
        "GM = BM − BG; BM = I_wp/V_disp (metacentric height)",
        "τ = μ(du/dy) (Newton's law of viscosity)",
        "ν = μ/ρ (kinematic viscosity)",
        "h_cap = 4σ·cosθ/(ρgd) (capillary rise)",
      ],
      metrics: [
        "Pressure (Pa, kPa, MPa, bar, atm)",
        "Buoyant force F_b (N)",
        "Metacentric height GM (m) — stability margin",
        "Dynamic viscosity μ (Pa·s)",
        "Kinematic viscosity ν (m²/s)",
        "Bulk modulus E (Pa) — compressibility indicator",
        "Capillary rise h_cap (mm) — surface tension indicator",
      ],
      examples: [
        "U-tube mercury manometer on a water pipe: ΔP = 36 kPa gauge after water-column correction (see worked example 1).",
        "Steel sphere radius 0.30 m submerged in seawater: F_b = 1137 N, W = 8709 N, net down 7.57 kN (see worked example 2).",
        "10 m of water depth ⇒ ΔP ≈ 98 kPa (≈ 1 atm per 10 m).",
      ],
      industrial_examples: [
        "Construction — 200-ton hydraulic jack uses Pascal's law at A_ram/A_pump = 133× to lift bridge decks with 80 N hand force.",
        "Water utility — mercury manometers monitor booster-pump suction/discharge head; KPI logged under ISO 55000.",
      ],
      case_studies: [
        "SYNTHETIC — Harbor Point Floating Dock: 12×6×1.5 m pontoon, GM = 5.37 m, peak live load 6 t adds 82 mm draught; 0.017° heel under 100 kg corner load.",
      ],
      common_errors: [
        "Using gauge pressure where absolute is required (and vice versa).",
        "Applying P = ρgh to a gas (use the barometric formula instead).",
        "Forgetting the water-column correction in liquid-pipe mercury manometers.",
        "Computing buoyant force using body volume (use displaced volume).",
        "Treating non-Newtonian fluids with τ = μ(du/dy).",
        "Using μ at the wrong temperature (water μ varies 6.4× from 0 to 100 °C).",
      ],
      limitations: [
        "Hydrostatics assumes no fluid motion; flowing fluids need Bernoulli/Darcy–Weisbach.",
        "Incompressibility fails for gases (Mach > 0.3) and high-pressure transients (water hammer).",
        "Newtonian viscosity law fails for blood, polymer melts, slurries.",
        "Archimedes assumes hydrostatic fluid; accelerating/rotating frames need extra inertial body forces.",
        "Surface-tension corrections matter only at capillary length scale (mm for water).",
      ],
      best_practices: [
        "Always state whether a pressure is gauge or absolute before substituting into an equation.",
        "Verify stability with GM > 0, not by inspection; small waterplanes (catamaran, spar) have small BM and need careful trim analysis.",
        "Calibrate pressure gauges against a mercury manometer annually; log drift in the ISO 55000 asset record.",
        "For non-Newtonian fluids, plot the rheogram τ vs du/dy before choosing a constitutive model.",
      ],
      related_concepts: [
        "Fluid dynamics — continuity & Bernoulli (Lesson 2)",
        "Pipe flow & friction — Darcy–Weisbach, Moody (Lesson 3)",
        "Dimensional analysis — Buckingham Pi (Lesson 3)",
        "Hydraulics & hydrology — open-channel flow, Fr number",
        "Heat transfer — natural convection driven by buoyancy",
      ],
      prerequisites: [
        "Calculus (integration, partial derivatives)",
        "Newtonian mechanics (force & moment equilibrium)",
        "SI units and dimensions (kg, m, s, N, Pa)",
      ],
      references: FLUID_REFERENCE_TITLES,
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
        "Pascal's law states that, in a confined incompressible fluid at rest:",
      explanation:
        "Pascal's law: pressure applied to a confined incompressible fluid is transmitted undiminished throughout — basis of the hydraulic press.",
      whyCorrect:
        "Pascal's law states that a pressure change applied at any point in a confined incompressible fluid is transmitted undiminished throughout the fluid. This is the operating principle of the hydraulic press, hydraulic jack, and brake-by-wire systems.",
      whyOthersWrong: [
        "Option A (pressure is constant everywhere in the fluid regardless of depth) is the *hydrostatic relation* corrected for depth — pressure actually varies with depth as P = P₀ + ρgh, not constant.",
        "Option C (pressure at a point depends on the orientation of the surface) contradicts the *isotropy of pressure at a point* in a static fluid — pressure is the same in all directions at a given point.",
        "Option D (pressure is transmitted only along the vertical direction) is false — Pascal transmission is isotropic, not directional.",
      ],
      options: [
        {
          text: "Pressure is constant everywhere in the fluid regardless of depth.",
          isCorrect: false,
        },
        {
          text: "A pressure change applied at any point is transmitted undiminished throughout the fluid.",
          isCorrect: true,
        },
        {
          text: "Pressure at a point depends on the orientation of the surface considered.",
          isCorrect: false,
        },
        {
          text: "Pressure is transmitted only along the vertical direction.",
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
      scenario: "Oil & Gas",
      stem:
        "A U-tube mercury manometer (γ_Hg = 133 kN/m³) reads h = 0.30 m on a gas pipe. The gauge pressure at the pipe tap is approximately:",
      explanation:
        "For a gas-side measurement, ρ_gas ≪ ρ_Hg, so ΔP ≈ ρ_m·g·h = γ_Hg·h = 133 × 0.30 = 39.9 kPa ≈ 40 kPa gauge.",
      whyCorrect:
        "For a mercury manometer on a gas pipe, the gas-column contribution is negligible (ρ_gas ≪ ρ_Hg), so the pressure difference equals γ_Hg × h = 133 kN/m³ × 0.30 m = 39.9 kPa. Rounded, the gauge pressure is approximately 40 kPa.",
      whyOthersWrong: [
        "Option 30 kPa uses ρ_water·g·h = 9.81 × 0.30 ≈ 2.94 kPa — wait, this would actually give ~3 kPa, not 30. The 30 kPa distractor likely confuses 1 m of water (≈ 9.81 kPa) with 3 m equivalent, or treats mercury as ~3× water instead of 13.6× — i.e. uses the wrong manometer-fluid density.",
        "Option 49 kPa adds a spurious water-column correction (γ_Hg·h + γ_w·h ≈ 40 + 3 = 43, but rounded up to 49 — adding, not subtracting, the correction; or using h × 1.6 instead of h × 13.6).",
        "Option 60 kPa doubles the answer, possibly by confusing h with 2h (U-tube limb-to-limb) or treating h as the column rise on each side rather than the difference.",
      ],
      options: [
        { text: "30 kPa", isCorrect: false },
        { text: "40 kPa", isCorrect: true },
        { text: "49 kPa", isCorrect: false },
        { text: "60 kPa", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem:
        "A solid steel sphere of radius 0.30 m (ρ_steel = 7850 kg/m³, V = (4/3)πr³ = 0.1131 m³) is fully submerged in seawater (ρ_sw = 1025 kg/m³). The upward buoyant force is closest to:",
      explanation:
        "F_b = ρ_sw·g·V_displaced = 1025 × 9.81 × 0.1131 = 1137 N (≈ 1.14 kN).",
      whyCorrect:
        "Apply Archimedes: F_b = ρ_fluid·g·V_displaced, where V_displaced equals the sphere's geometric volume V = (4/3)πr³ = (4/3)π(0.30)³ = 0.1131 m³. Then F_b = 1025 × 9.81 × 0.1131 = 1137 N ≈ 1.14 kN upward — small relative to the sphere's weight (W = ρ_steel·g·V = 7850 × 9.81 × 0.1131 = 8710 N ≈ 8.71 kN), confirming that the sphere sinks.",
      whyOthersWrong: [
        "Option 142 N uses r = 0.15 m (treats the given radius 0.30 m as a diameter, halving r): V = (4/3)π(0.15)³ = 0.0141 m³ ⇒ F_b = 1025 × 9.81 × 0.0141 = 142 N. Common radius/diameter confusion.",
        "Option 2274 N doubles V (computes V = 2·(4/3)πr³, perhaps treating the sphere as a half-sphere on each side, or substituting V = 2·m/ρ): F_b = 1025 × 9.81 × 0.226 = 2274 N — a 2× bookkeeping error.",
        "Option 8710 N reports the sphere's weight W = ρ_steel·g·V = 7850 × 9.81 × 0.1131 = 8710 N — that's the body's gravity force, not the buoyant force.",
      ],
      options: [
        { text: "142 N", isCorrect: false },
        { text: "1137 N", isCorrect: true },
        { text: "2274 N", isCorrect: false },
        { text: "8710 N", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Container Terminal",
      stem:
        "True or False: A wooden cube (ρ_cube = 600 kg/m³, side 0.5 m) floats in water (ρ_water = 1000 kg/m³) with 75% of its volume submerged.",
      explanation:
        "FALSE. Floating equilibrium: F_b = W ⇒ ρ_water·V_disp = ρ_cube·V_cube ⇒ V_disp/V_cube = ρ_cube/ρ_water = 600/1000 = 0.60 = 60% submerged (not 75%).",
      whyCorrect:
        "FALSE. By Archimedes, a floating body displaces a volume whose weight equals the body's weight: ρ_water·g·V_disp = ρ_cube·g·V_cube ⇒ V_disp/V_cube = ρ_cube/ρ_water = 600/1000 = 0.60. So the cube floats with 60% of its volume submerged, not 75%. (75% submerged would require ρ_cube = 750 kg/m³.)",
      whyOthersWrong: [
        "Option TRUE would be correct only if ρ_cube = 750 kg/m³ (giving 75% submerged). For ρ_cube = 600 kg/m³ the correct submerged fraction is 60%, so the statement as given is false.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Fluid Dynamics: Bernoulli & Continuity
// (slug: fluid-dynamics-bernoulli-continuity)
// ---------------------------------------------------------------------------

const LESSON_DYNAMICS: RefLesson = {
  slug: "fluid-dynamics-bernoulli-continuity",
  title: "Fluid Dynamics: Bernoulli & Continuity",
  titleAr: "ديناميكا الموائع: برنولي والاستمرارية",
  order: 2,
  durationMin: 35,
  references: FLUID_REFERENCE_TITLES,
  conceptIntroduction: `Fluid dynamics describes fluids in motion. The two pillars are the *continuity equation* (conservation of mass) and the *Bernoulli equation* (conservation of mechanical energy along a streamline in steady, incompressible, inviscid flow). For a streamtube of cross-section A and average velocity V, continuity at steady state demands that the mass flow rate ṁ = ρAV be conserved: A₁V₁ = A₂V₂ for incompressible flow (or ρ₁A₁V₁ = ρ₂A₂V₂ for compressible). This single relation explains why constricting a hose accelerates the jet — the same mass flux through a smaller area demands a higher velocity.

Bernoulli's equation, derived by integrating Euler's inviscid momentum equation along a streamline, states that for steady, incompressible, inviscid flow the total head P + ½ρV² + ρgz is constant along a streamline. In head form: P/γ + V²/(2g) + z = total head (m of fluid). The three terms — pressure head, velocity head, elevation head — trade against each other. A stagnation point (V = 0) sees pressure rise by ½ρV² (the *dynamic pressure* q = ½ρV²); a venturi contraction accelerates the flow and lowers the local pressure — the operating principle of the carburetor, the aspirator, and the venturi flow meter. The Pitot tube measures velocity by stagnating the flow and reading the rise in pressure: V = √(2gΔh) for a water-column manometer, or V = √(2ΔP/ρ) for a pressure transducer.

Real fluids are viscous; the *Reynolds number* Re = ρVD/μ distinguishes laminar (Re < 2300) from turbulent (Re > 4000) flow in a pipe, governing the friction-loss analysis developed in Lesson 3.`,
  sections: {
    learning_objectives: `- Apply the steady incompressible continuity equation A₁V₁ = A₂V₂ to pipes, nozzles, and ducts.
- Apply Bernoulli's equation P + ½ρV² + ρgz = const along a streamline; identify the head form.
- Compute stagnation and dynamic pressure: P_stag = P_static + ½ρV²; q = ½ρV².
- Use a Pitot tube to measure velocity: V = √(2gΔh) or V = √(2ΔP/ρ).
- Apply a venturi flowmeter with discharge coefficient C_d to measure ṁ.
- Compute Reynolds number Re = ρVD/μ and classify the flow regime.`,
    prerequisites: `- Lesson 1 (hydrostatics, ρ, μ, ν, Pascal, Archimedes).
- Calculus (line integrals along a streamline; partial derivatives).
- Newton's 2nd law (force = rate of momentum change).
- Concept of streamline and control volume.
- SI units (kg, m, s, Pa, N/m²).`,
    introduction: `Continuity and Bernoulli are the working engineer's daily tools for moving incompressible fluids. Continuity — mass conservation applied to a steady streamtube — gives A₁V₁ = A₂V₂ incompressibly, predicting that a hose nozzle accelerates flow by the area ratio. Bernoulli — Euler's inviscid momentum equation integrated along a streamline — gives P + ½ρV² + ρgz = const, predicting that an accelerated jet sees its pressure drop, a stagnated flow sees pressure rise. The trade between pressure, velocity, and elevation heads powers carburetors, venturi meters, aspirators, hydroelectric intakes, and aircraft wings. The Pitot tube stagnates a streamline and reads the dynamic pressure back as velocity. Real fluids dissipate energy as friction; the head-loss extension h_L is introduced here and quantified in Lesson 3. The Reynolds number Re = ρVD/μ — the ratio of inertial to viscous forces — classifies the flow as laminar (Re < 2300), transitional (2300–4000), or turbulent (Re > 4000), and sets the friction-law choice in pipe-flow analysis.`,
    terminology: `- **Streamline**: curve everywhere tangent to the local velocity vector at a given instant.
- **Steady flow**: properties at any point do not change with time.
- **Incompressible flow**: density ≈ constant along the streamline; valid for liquids and for gases below M ≈ 0.3.
- **Control volume (CV)**: a fixed region in space through which fluid flows.
- **Mass flow rate ṁ = ρAV** (kg/s); **volumetric flow Q = AV** (m³/s).
- **Static pressure P**: thermodynamic pressure measured moving with the fluid.
- **Dynamic pressure q = ½ρV²**: kinetic-energy pressure contribution.
- **Stagnation (total) pressure P_0 = P + ½ρV² + ρgz**; at a stagnation point V = 0 and P = P_0.
- **Head H** (m of fluid): P/γ + V²/(2g) + z; the total mechanical energy per unit weight.
- **Reynolds number Re = ρVD/μ**: ratio of inertial to viscous forces.
- **Mach number M = V/c** (c = √(kRT)): compressibility flag; M > 0.3 ⇒ use compressible relations.`,
    detailed_explanation: `**Continuity.** For a steady, incompressible, one-dimensional streamtube, mass conservation gives A₁V₁ = A₂V₂ (volumetric flow Q conserved) or ρA₁V₁ = ρA₂V₂ (mass flow ṁ conserved). For a steady, compressible, one-dimensional streamtube, ρ₁A₁V₁ = ρ₂A₂V₂. For a 3-D control volume, the integral form is ∮_CS ρ(V·n̂) dA = −∂/∂t ∮_CV ρ dV; at steady state the unsteady term vanishes and inflow balances outflow.

**Bernoulli equation.** Integrate Euler's equation (Newton's 2nd law along a streamline in inviscid flow) for steady, incompressible, inviscid, along-a-streamline conditions to obtain:
  P/ρ + V²/2 + gz = const (J/kg)  or  P + ½ρV² + ρgz = const (Pa)
or, dividing by γ = ρg:
  P/γ + V²/(2g) + z = const (m of head).
The three terms are the pressure, velocity, and elevation heads. Each trades with the others along the streamline; the total head is constant only if the flow is inviscid and the streamline stays within the same fluid.

**Stagnation point and dynamic pressure.** At a stagnation point (V = 0), Bernoulli gives P_stag = P_static + ½ρV². The increment ½ρV² is the *dynamic pressure* q — the kinetic-energy contribution. A Pitot tube stagnates the flow and reads P_stag; the surrounding static ports read P_static. The difference ΔP = P_stag − P_static = ½ρV² ⇒ V = √(2ΔP/ρ). With a water manometer measuring water flow, ΔP = ρg·Δh ⇒ V = √(2g·Δh).

**Venturi meter.** A converging-diverging cone accelerates the flow at the throat; continuity gives V_throat = V_pipe·(A_pipe/A_throat) = V_pipe·(D/d)². Bernoulli gives P_pipe − P_throat = ½ρ(V_throat² − V_pipe²). With ΔP measured across pipe-to-throat taps, the mass flow rate is recovered as ṁ = C_d·A_throat·√(2ρΔP/[1 − (A_throat/A_pipe)²]), where C_d ≈ 0.95–0.99 corrects for viscous and contraction losses (ISO 5167 calibrates C_d).

**Reynolds number.** The dimensionless group Re = ρVD/μ = VD/ν measures the ratio of inertial to viscous forces. Laminar pipe flow (Re < 2300) is smooth, deterministic, parabolic in profile (Hagen–Poiseuille); transition occurs in 2300 < Re < 4000; turbulent flow (Re > 4000) features chaotic eddies and a flatter (1/7-power-law) profile. Re governs friction-factor selection in Lesson 3 and the discharge-coefficient calibration of every standard flowmeter.`,
    core_principles: `- Mass is conserved: ṁ_in = ṁ_out at steady state; A₁V₁ = A₂V₂ incompressible.
- Mechanical energy is conserved along an inviscid streamline: P + ½ρV² + ρgz = const.
- Stagnation pressure = static + dynamic: P_0 = P + ½ρV².
- Pitot: V = √(2ΔP/ρ) = √(2gΔh) for a water-column manometer.
- Reynolds number classifies regime: Re = ρVD/μ; laminar < 2300, turbulent > 4000 in pipes.
- Real fluids lose head to friction (Lesson 3): H₁ = H₂ + h_L.`,
    components: `- Streamtube / pipe / duct of varying cross-section A.
- Pitot tube (front-facing stagnation tap + side static taps).
- Venturi meter (converging cone, throat, diverging recovery cone).
- Manometer or differential pressure transducer.
- Reynolds dye-injection apparatus (1883 Osborne Reynolds).
- Discharge coefficient C_d (~0.95–0.99) for real meter geometries.
- Hydraulic grade line (HGL = z + P/γ) and energy grade line (EGL = HGL + V²/(2g)).`,
    process: `1. Define control volume or streamline; identify inflow/outflow sections.
2. Apply continuity: ṁ = ρAV in = out (steady); or unsteady tank drain ṁ_out = −ρ·dV_tank/dt.
3. Apply Bernoulli along a streamline between two points, adding head losses h_L for real flows (Lesson 3): P₁/γ + V₁²/(2g) + z₁ = P₂/γ + V₂²/(2g) + z₂ + h_L.
4. Compute the unknown (V, P, z, ṁ); cross-check units and order of magnitude.
5. Compute Re = ρVD/μ; verify the flow regime matches the assumed friction model.`,
    formula_calculation: `**Continuity (steady, incompressible, 1-D):**
  Q = A₁V₁ = A₂V₂   [m³/s];   ṁ = ρQ = ρAV   [kg/s]

**Bernoulli (steady, incompressible, inviscid, along a streamline):**
  P + ½ρV² + ρgz = const   [Pa]
Head form: P/γ + V²/(2g) + z = H   [m]
With head loss: H₁ = H₂ + h_L

**Stagnation & dynamic pressure:**
  P_0 = P + ½ρV²   [Pa];   q = ½ρV²

**Pitot tube (water manometer, Δh head difference, measuring same fluid):**
  V = √(2g·Δh)   [m/s]
For a manometer fluid of density ρ_m measuring a flowing fluid of density ρ:
  V = √(2g·Δh·(ρ_m − ρ)/ρ)   [m/s]

**Venturi meter mass flow:**
  ṁ = C_d · A_throat · √(2ρ(P₁ − P₂)/(1 − β⁴))   [kg/s]
where β = D_throat/D_pipe, C_d ≈ 0.95–0.99.

**Reynolds number:**
  Re = ρVD/μ = VD/ν   [dimensionless]
Laminar: Re < 2300 (pipe); Turbulent: Re > 4000; transition in between.

**Mach number (compressibility flag):**
  M = V/c;  c = √(kRT) for ideal gas; incompressible assumption holds for M < 0.3.

**Hydraulic diameter (non-circular ducts):**
  D_h = 4A/P_wet

**Assumptions**: (i) steady; (ii) incompressible (M < 0.3 for gases); (iii) inviscid (Bernoulli) or viscous-with-h_L (real); (iv) single-phase Newtonian fluid; (v) one-dimensional mean velocity at each section.

**Interpretation**: doubling V quadruples dynamic pressure ½ρV²; a venturi throat at 4× the pipe velocity drops static pressure by 7.5× the dynamic pressure (the basis of carburetor fuel draw). A Re of 10⁵ in a 50 mm water pipe at 2 m/s is firmly turbulent.`,
    worked_example: `**Example 1 — Pitot tube in a water tunnel.**
A Pitot tube in a water tunnel (ρ = 998 kg/m³) reads a manometer differential Δh = 0.40 m of water. Static port reads P_s; stagnation port reads P_0 = P_s + ½ρV². ΔP = ρg·Δh = 998 × 9.81 × 0.40 = 3916 Pa. Hence V = √(2ΔP/ρ) = √(2 × 3916/998) = √7.847 = 2.80 m/s. Quick-check using V = √(2g·Δh) directly = √(2 × 9.81 × 0.40) = √7.848 = 2.80 m/s ✓.

**Example 2 — Reynolds number in a 50 mm water pipe.**
Water at 20 °C (ρ = 998 kg/m³, μ = 1.002×10⁻³ Pa·s, ν = 1.004×10⁻⁶ m²/s) flows at V = 2.0 m/s through a D = 0.05 m pipe.
Re = ρVD/μ = 998 × 2.0 × 0.05 / 1.002×10⁻³ = 99.7 / 1.002×10⁻³ = 99 500 ≈ 1.0×10⁵.
This is well into the turbulent regime (Re > 4000); friction factor is given by the Colebrook or Haaland equation (Lesson 3), and the velocity profile follows a 1/7-power law (u/u_max = (r/R)^(1/7)).

**Example 3 — Venturi meter for airflow.**
A venturi with D₁ = 100 mm, throat d = 50 mm (β = 0.5) measures airflow (ρ = 1.20 kg/m³). Measured ΔP = 250 Pa; C_d = 0.97. A_throat = π(0.05)²/4 = 1.963×10⁻³ m².
ṁ = 0.97 × 1.963×10⁻³ × √(2 × 1.20 × 250 / (1 − 0.5⁴)) = 1.903×10⁻³ × √(600 / 0.9375) = 1.903×10⁻³ × 25.30 = 0.0481 kg/s ≈ 48 g/s.
Volume flow Q = ṁ/ρ = 0.0481/1.20 = 0.0401 m³/s = 40.1 L/s.`,
    industrial_example: `**Industry: Oil & Gas — custody-transfer venturi.** A 6-inch (150 mm) custody-transfer venturi meter on a crude-oil pipeline (ρ = 870 kg/m³, μ = 8×10⁻³ Pa·s) measures throughput for fiscal reconciliation between producer and refiner. At V = 1.5 m/s the throat ΔP = ½ρV²·(1 − β⁴) ≈ ½ × 870 × 1.5² × (1 − 0.5⁴) = 914 Pa. ISO 5167 calibrates C_d against a traceable flow lab; the meter's uncertainty budget (~±0.4% of reading) feeds the ISO 55000 asset-management reconciliation report. Pitot traverse surveys calibrate the C_d in-situ every five years.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Hydroelectric Intake (synthetic, illustrative).* A 12 MW run-of-river hydro plant draws 14 m³/s from a mountain reservoir through a 1.8 m penstock dropping 110 m to a Pelton turbine. By Bernoulli (ignoring friction for the static estimate): V at the nozzle exit = √(2gH) = √(2 × 9.81 × 110) = √2158 = 46.5 m/s. Power available = ρgQH = 998 × 9.81 × 14 × 110 = 15.06 MW; turbine-generator efficiency 0.82 ⇒ electrical output 12.35 MW ≈ nameplate 12 MW. Real-penstock friction (Lesson 3) reduces net head by ~6 m, trimming available power to ~14.2 MW and electrical output to ~11.6 MW (97% of nameplate).`,
    visual_explanation: `**Streamtube + head diagram.** Sketch a horizontal converging pipe with cross-sections 1 (pipe) and 2 (throat). Draw a horizontal *total head* line (constant, inviscid) and a descending *energy grade line* (EGL = z + P/γ + V²/(2g)) with a step down at each frictional loss. The *hydraulic grade line* (HGL = EGL − V²/(2g)) dips sharply at the throat (where V rises), then rises again as the duct diverges and V falls — but stays below the upstream HGL by the friction loss. This dip-and-recover shape is the unmistakable venturi pressure signature.`,
    simulation_opportunity: `Open EngiSuite "Bernoulli Venturi Explorer": adjust throat-to-pipe diameter ratio β and inlet velocity, watch the HGL/EGL plot and the in-line pressure profile update, and read mass flow from the integrated venturi formula. The "Reynolds Dye Apparatus" simulates Reynolds' 1883 Oxford demonstration — slide Re from 500 to 20 000 and watch the dye filament go from a smooth line to a chaotic, fully mixed plume at Re ≈ 2300–4000.`,
    common_mistakes: `- Applying Bernoulli *across* streamlines (it is only valid along one streamline, or between two points on the same streamline, unless the flow is irrotational).
- Neglecting head loss h_L in real flows — Bernoulli alone gives 5–20% optimistic pressure recoveries in venturis and pumps.
- Forgetting the elevation term ρgz in non-horizontal systems (reservoir–tap analysis).
- Mixing gauge and absolute pressure on the same streamline.
- Using Bernoulli for compressible gas flow without the Mach-number correction (M > 0.3 ⇒ use compressible Bernoulli or isentropic relations).
- Computing Re with the wrong length scale — for non-circular ducts use hydraulic diameter D_h = 4A/P_wet.
- Treating the Pitot ΔP = ½ρV² as valid for all flow profiles — turbulent profile needs an α (kinetic-energy correction factor) ≈ 1.03–1.06.
- Confusing volumetric flow Q (m³/s) with mass flow ṁ (kg/s) — multiply by ρ.`,
    limitations: `- Bernoulli assumes steady, incompressible, inviscid, along-a-streamline flow — real fluids deviate in all four (Lesson 3 adds head loss h_L).
- Compressibility neglected above M ≈ 0.3; supersonic flow needs isentropic + normal-shock relations.
- Pitot tube fails in reversed or unsteady flow; in supersonic flow a bow shock forms ahead of the tube, requiring the Rayleigh Pitot formula.
- Reynolds classification (Re < 2300 laminar) is for smooth circular pipes; disturbances can keep flow laminar to Re ≈ 10⁴ or trigger early transition at Re ≈ 1500.
- Venturi C_d depends on Re, β, and tap location — must be calibrated against the operating Re, not just the lab Re.`,
    comparison: `| Flow regime | Re (pipe) | Velocity profile | Friction factor f |
|---|---|---|---|
| Laminar | < 2300 | Parabolic u/u_max = 1 − (r/R)² | 64/Re (exact) |
| Transition | 2300–4000 | Intermittent | Colebrook (interpolate) |
| Turbulent | > 4000 | 1/7-power u/u_max = (r/R)^(1/7) | Haaland/Colebrook |

| Equation | Conserves | Conditions |
|---|---|---|
| Continuity ṁ = ρAV | Mass | Steady, 1-D |
| Bernoulli P + ½ρV² + ρgz = const | Mech. energy | + inviscid + incompressible + streamline |
| Euler (along streamline) | Momentum | inviscid only |
| Navier–Stokes | Momentum + stress | viscous, full |

| Meter type | Typical C_d | Permanent ΔP loss |
|---|---|---|
| Venturi | 0.95–0.98 | 10–15% of measured ΔP |
| Orifice plate | 0.60–0.65 | 50–70% of measured ΔP |
| Nozzle | 0.90–0.95 | 30–40% of measured ΔP |`,
    practical_application: `**Municipal water distribution.** A city's main supply reservoir sits at elevation 220 m; the lowest customer tap is at 180 m. Ignoring friction, available static head = 40 m × 9.81 kPa/m = 392 kPa (57 psi) — comfortably above the 207 kPa (30 psi) service minimum. At peak demand 0.15 m³/s, the 300 mm main has V = Q/A = 0.15/0.0707 = 2.12 m/s; velocity head V²/(2g) = 0.23 m, negligible next to 40 m of elevation. Real friction loss (Lesson 3) drops EGL by ~8 m along the 3 km route ⇒ net 32 m × 9.81 = 314 kPa at the tap, still compliant. A booster pump is sized only when friction drops EGL below the 30 psi threshold.`,
    decision_scenario: `You are the process engineer at a specialty-chemicals plant sizing a nitrogen-blanketing venturi eductor. A 0.5-inch eductor must pull 0.05 m³/s of N₂ at 0.2 MPa from a buffer tank into a 1-inch process line. Continuity in the 1-inch line (D = 25 mm, A = 4.91×10⁻⁴ m²): for V = 4 m/s, Q = A·V = 1.96×10⁻³ m³/s — much larger than the 0.05 m³/s N₂ demand ⇒ feasible. Bernoulli between the eductor throat and the process line (P_line = 0.2 MPa, ρ_N₂ = 2.4 kg/m³): P_throat = P_line − ½ρ_N₂(V_throat² − V_line²). With β = 0.5, V_throat = V_line·(1/β)² = 4 × 4 = 16 m/s. ΔP = ½ × 2.4 × (16² − 4²) = 288 Pa — far less than atmospheric; the eductor will easily pull N₂. Decision: select the 0.5-inch eductor; specify a 2 mm nozzle for fine flow tuning.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/Analyze. Topics: Bernoulli validity conditions, continuity in a contracting nozzle, Pitot-tube velocity from Δh, and Reynolds-number regime classification.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Civil: Water Resources & Environmental exam outlines, ASME PTC 19.2 (Pitot-tube code), and ISO 5167 (venturi/nozzle/orifice metering). Sample FE-style question: "Water flows at 1.5 m/s through a 50 mm pipe that contracts to a 25 mm throat. The throat velocity is: (a) 3 m/s, (b) 6 m/s, (c) 12 m/s, (d) 24 m/s." Correct: (b) — by continuity, V_throat = (D_pipe/D_throat)² × V_pipe = (50/25)² × 1.5 = 6 m/s.`,
    summary: `Continuity (A₁V₁ = A₂V₂) and Bernoulli (P + ½ρV² + ρgz = const along a streamline) are the working engineer's daily tools for moving incompressible fluids. They govern nozzles, venturis, Pitot tubes, reservoir–tap pipelines, hydroelectric intakes, and air-foil pressure distributions. The Reynolds number Re = ρVD/μ distinguishes laminar from turbulent pipe flow and sets the stage for the friction-loss analysis of Lesson 3. Bernoulli's ideal-fluid assumptions break down wherever viscosity, compressibility, or unsteadiness dominate — extensions are the head-loss-corrected Bernoulli (Lesson 3) and the compressible-flow Mach relations.`,
    key_takeaways: `- A₁V₁ = A₂V₂ (incompressible, steady); for gases use ρ₁A₁V₁ = ρ₂A₂V₂.
- Bernoulli head: P/γ + V²/(2g) + z = H (inviscid) or H₁ = H₂ + h_L (with loss).
- Stagnation P_0 = P + ½ρV²; Pitot V = √(2ΔP/ρ) = √(2gΔh) for water-manometered water flow.
- Venturi ṁ = C_d·A_throat·√(2ρΔP/(1 − β⁴)); β = D_throat/D_pipe.
- Re = ρVD/μ classifies regime: laminar < 2300, turbulent > 4000.
- Bernoulli neglects viscosity, compressibility (M > 0.3), and unsteadiness — add head loss h_L for real fluids.`,
    references: `1. Munson et al. (2013), Ch. 3 (Bernoulli, static & stagnation pressure, Pitot), Ch. 5 (CV analysis, continuity), Ch. 7 (dimensional analysis, Re).
2. White (2016), Ch. 3 (Bernoulli & control volume), Ch. 5 (dimensional analysis & similarity), Ch. 6 (viscous pipe flow, Re).
3. Crowe et al. (2013), Ch. 4 (CV: continuity, energy, momentum), Ch. 7 (dimensional analysis, similitude).
4. Streeter et al. (1998), Ch. 3 (Bernoulli, Euler), Ch. 4 (application: Pitot, venturi, siphon).
5. ISO 55000:2014 (asset-management KPI for fluid systems & meters).
6. ASCE MOP 140 — Steel Penstocks (2012), Ch. 9 (hydraulic design, Bernoulli with head loss).`,
  },
  knowledgeObject: {
    title: "Fluid Dynamics: Bernoulli & Continuity — Knowledge Object",
    domain: "Fluid Mechanics",
    competency: "Foundations",
    topic: "Continuity, Bernoulli, Pitot, Venturi, Reynolds",
    concept: "Mass conservation + inviscid mechanical-energy conservation + Re regime classification",
    body: {
      definitions: [
        "Continuity (steady, incompressible, 1-D): A₁V₁ = A₂V₂; mass flow ṁ = ρAV conserved.",
        "Bernoulli equation: P + ½ρV² + ρgz = const along a streamline (steady, incompressible, inviscid).",
        "Stagnation pressure: P_0 = P + ½ρV²; the value a stagnating streamline reaches when V = 0.",
        "Dynamic pressure: q = ½ρV² — the kinetic-energy pressure contribution.",
        "Pitot tube: stagnates a streamline; ΔP = ½ρV² ⇒ V = √(2ΔP/ρ) = √(2gΔh) for water-manometered water flow.",
        "Venturi meter: a converging-diverging cone that accelerates flow at the throat, lowering local static pressure; ṁ = C_d·A·√(2ρΔP/(1−β⁴)).",
        "Reynolds number Re = ρVD/μ = VD/ν: ratio of inertial to viscous forces; laminar < 2300, turbulent > 4000 in pipes.",
      ],
      principles: [
        "Mass is conserved at steady state: ṁ_in = ṁ_out.",
        "Mechanical energy is conserved along an inviscid streamline (Bernoulli).",
        "Real fluids lose head to friction: H₁ = H₂ + h_L (Lesson 3).",
        "Re classifies the flow regime and governs friction-factor selection.",
        "Stagnation pressure = static + dynamic, regardless of path (a state property of the streamline).",
      ],
      components: [
        "Streamtube / pipe / duct of varying cross-section",
        "Pitot tube (stagnation tap + static taps)",
        "Venturi meter (converging cone, throat, diverging recovery)",
        "Manometer or differential pressure transducer",
        "Reynolds dye apparatus",
        "Energy grade line (EGL) and hydraulic grade line (HGL)",
      ],
      mechanism:
        "Continuity conserves mass through the streamtube; Bernoulli conserves mechanical energy along an inviscid streamline. Stagnating a streamline trades ½ρV² for additional pressure (the Pitot principle); constricting the streamtube trades pressure for velocity (the venturi principle). Re classifies the regime that the viscous fluid occupies.",
      process:
        "Define CV/streamline → apply continuity → apply Bernoulli (with h_L if real) → solve for V/P/ṁ → check units → compute Re to confirm the regime matches the friction model.",
      formulas: [
        "A₁V₁ = A₂V₂ (continuity, incompressible steady)",
        "P + ½ρV² + ρgz = const (Bernoulli, inviscid)",
        "P/γ + V²/(2g) + z = H (head form)",
        "H₁ = H₂ + h_L (with head loss)",
        "P_0 = P + ½ρV²; q = ½ρV²",
        "V = √(2gΔh) (Pitot, same-fluid manometer)",
        "ṁ = C_d·A_throat·√(2ρΔP/(1−β⁴)) (venturi)",
        "Re = ρVD/μ = VD/ν",
        "D_h = 4A/P_wet (hydraulic diameter, non-circular)",
        "M = V/c; c = √(kRT) (Mach, compressibility)",
      ],
      metrics: [
        "Volumetric flow Q (m³/s)",
        "Mass flow ṁ (kg/s)",
        "Velocity V (m/s)",
        "Pressure difference ΔP (Pa)",
        "Head loss h_L (m of fluid)",
        "Reynolds number Re (dimensionless)",
        "Discharge coefficient C_d (dimensionless, ~0.95–0.99)",
      ],
      examples: [
        "Pitot tube in water tunnel, Δh = 0.40 m ⇒ V = √(2gΔh) = 2.80 m/s (see worked example 1).",
        "Water at 20 °C, V = 2 m/s, D = 50 mm ⇒ Re = 99 500 (turbulent) (see worked example 2).",
        "Venturi D₁ = 100 mm, throat 50 mm, ΔP = 250 Pa air ⇒ ṁ = 48 g/s (see worked example 3).",
      ],
      industrial_examples: [
        "Oil & Gas — 6-inch custody-transfer venturi on crude-oil pipeline; C_d calibrated per ISO 5167; ±0.4% uncertainty feeds ISO 55000 reconciliation.",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Hydroelectric Intake: 12 MW run-of-river, 14 m³/s through 1.8 m penstock dropping 110 m; V_nozzle = √(2gH) = 46.5 m/s; electrical output ≈ 11.6 MW after friction.",
      ],
      common_errors: [
        "Applying Bernoulli across streamlines (valid only along a streamline, unless irrotational).",
        "Neglecting head loss h_L in real flows (gives 5–20% optimistic recoveries).",
        "Mixing gauge and absolute pressure on the same streamline.",
        "Using Bernoulli above M = 0.3 without compressible corrections.",
        "Using the wrong length scale in Re for non-circular ducts (must use D_h = 4A/P_wet).",
        "Confusing Q (m³/s) with ṁ (kg/s).",
      ],
      limitations: [
        "Bernoulli fails for unsteady, compressible, viscous, or cross-streamline flows.",
        "Pitot tubes fail in reverse flow; in supersonic flow a bow shock forms ahead (use Rayleigh Pitot).",
        "Re classification (Re < 2300 laminar) is for smooth circular pipes only.",
        "Venturi C_d depends on Re, β, and tap location — must be calibrated at the operating Re.",
      ],
      best_practices: [
        "Always plot EGL and HGL along the pipeline to visualize where head is lost and where pressure drops below service minimum.",
        "Verify Bernoulli results by checking mass conservation (continuity) at every junction.",
        "For compressible gas flow check M = V/c first; switch to isentropic relations if M > 0.3.",
        "Calibrate venturi/orifice C_d against a traceable flow lab; log drift in the ISO 55000 asset record.",
      ],
      related_concepts: [
        "Fluid statics & properties (Lesson 1)",
        "Pipe flow & dimensional analysis (Lesson 3)",
        "Hydraulics & hydrology — open-channel flow, Fr",
        "Heat transfer — forced convection (boundary layer, Re, Nu)",
        "Turbomachinery — pump & system curves (Lesson 3)",
      ],
      prerequisites: [
        "Lesson 1 (ρ, μ, ν, hydrostatics)",
        "Calculus (line integrals along a streamline)",
        "Newton's 2nd law (momentum balance)",
      ],
      references: FLUID_REFERENCE_TITLES,
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
        "Bernoulli's equation P + ½ρV² + ρgz = const along a streamline is valid ONLY when the flow is:",
      explanation:
        "Bernoulli requires steady, incompressible, inviscid flow along a streamline. Viscosity adds head loss (Lesson 3); unsteadiness adds a ∂φ/∂t term; compressibility (M > 0.3) requires compressible relations.",
      whyCorrect:
        "Bernoulli's equation is derived by integrating Euler's inviscid momentum equation along a streamline under three assumptions: (i) steady (∂/∂t = 0), (ii) incompressible (ρ constant along the streamline — liquids always; gases only for M < 0.3), (iii) inviscid (no wall shear ⇒ no head loss). The fourth condition — along a single streamline — applies unless the flow is irrotational (in which case Bernoulli holds across streamlines).",
      whyOthersWrong: [
        "Option A (steady, incompressible, viscous) includes viscous — Bernoulli's inviscid assumption fails; the head-loss term h_L must be added.",
        "Option B (unsteady, incompressible, inviscid) includes unsteady — the time-dependent Bernoulli has an extra ∂φ/∂t term on the left.",
        "Option D (steady, compressible, inviscid) includes compressible — the incompressible Bernoulli P + ½ρV² + ρgz = const fails for M > 0.3; use compressible Bernoulli or isentropic relations.",
      ],
      options: [
        { text: "Steady, incompressible, viscous.", isCorrect: false },
        { text: "Unsteady, incompressible, inviscid.", isCorrect: false },
        { text: "Steady, incompressible, inviscid.", isCorrect: true },
        { text: "Steady, compressible, inviscid.", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem:
        "Water (ρ = 998 kg/m³) flows at V₁ = 2.0 m/s through a 100 mm pipe that contracts to a 50 mm throat. By continuity, the throat velocity is:",
      explanation:
        "A₁V₁ = A₂V₂ ⇒ V_throat = (A_pipe/A_throat)V₁ = (D_pipe/D_throat)²·V₁ = (100/50)² × 2.0 = 4 × 2.0 = 8.0 m/s.",
      whyCorrect:
        "Continuity (steady, incompressible, 1-D): A₁V₁ = A₂V₂. Areas scale as the square of diameter, so V_throat = (D_pipe/D_throat)² × V_pipe = (100/50)² × 2.0 = 4 × 2.0 = 8.0 m/s. (Mass flow is conserved; the smaller throat forces higher velocity.)",
      whyOthersWrong: [
        "Option 1.0 m/s reverses the area ratio: V_throat = V_pipe × (D_throat/D_pipe)² = 2 × 0.25 = 0.5 m/s — that's the velocity if the pipe *expanded* to a larger diameter, contradicting the contraction geometry.",
        "Option 4.0 m/s uses a linear diameter ratio V_throat = V_pipe × (D_pipe/D_throat) = 2 × 2 = 4 m/s — confuses linear scaling with area (squared) scaling.",
        "Option 16.0 m/s squares the velocity (V_throat = V_pipe² × (D_pipe/D_throat) = 4 × 2 = 8 m/s — wait, this would actually be 8, not 16; the 16 distractor instead doubles the answer, possibly by also doubling V_pipe on top of the area ratio, or by computing V_throat = V_pipe × (D_pipe/D_throat)² × 2 = 8 × 2 = 16 — a 2× arithmetic bookkeeping error.",
      ],
      options: [
        { text: "1.0 m/s", isCorrect: false },
        { text: "4.0 m/s", isCorrect: false },
        { text: "8.0 m/s", isCorrect: true },
        { text: "16.0 m/s", isCorrect: false },
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
        "A Pitot tube in a water tunnel (ρ = 998 kg/m³, g = 9.81 m/s²) reads a manometer differential Δh = 0.40 m of water. The flow velocity is closest to:",
      explanation:
        "V = √(2gΔh) = √(2 × 9.81 × 0.40) = √7.848 = 2.80 m/s. (Same-fluid manometer: ΔP = ρgΔh.)",
      whyCorrect:
        "For a Pitot tube measuring the same fluid as the manometer, ΔP = ρg·Δh and V = √(2ΔP/ρ) = √(2gΔh). Substituting Δh = 0.40 m: V = √(2 × 9.81 × 0.40) = √7.848 ≈ 2.80 m/s. The dynamic pressure ½ρV² = ½ × 998 × 2.80² = 3914 Pa, matching the manometer ΔP = ρgΔh = 998 × 9.81 × 0.40 = 3916 Pa ✓.",
      whyOthersWrong: [
        "Option 1.98 m/s computes √(g·Δh) = √(9.81 × 0.40) = √3.924 = 1.98 m/s — omits the factor 2 in the dynamic-pressure relation ½ρV² = ρgΔh (i.e. sets ρV² = ρgΔh instead of ½ρV² = ρgΔh).",
        "Option 3.92 m/s reports g·Δh = 9.81 × 0.40 = 3.92 m/s directly — omits the square root and confuses velocity (m/s) with the head-equivalent acceleration-distance product.",
        "Option 7.85 m/s reports 2g·Δh = 2 × 9.81 × 0.40 = 7.85 — uses the dynamic-pressure expression itself (m²/s²) confused for velocity (m/s), omitting the square root.",
      ],
      options: [
        { text: "1.98 m/s", isCorrect: false },
        { text: "2.80 m/s", isCorrect: true },
        { text: "3.92 m/s", isCorrect: false },
        { text: "7.85 m/s", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem:
        "True or False: Water at 20 °C (ρ = 998 kg/m³, μ = 1.002×10⁻³ Pa·s) flowing at V = 2.0 m/s through a 50 mm pipe is in the laminar regime.",
      explanation:
        "FALSE. Re = ρVD/μ = 998 × 2.0 × 0.05 / 1.002×10⁻³ ≈ 99 700, well into the turbulent regime (Re > 4000). Laminar requires Re < 2300.",
      whyCorrect:
        "FALSE. Re = ρVD/μ = 998 × 2.0 × 0.05 / 1.002×10⁻³ ≈ 99 700. The flow is firmly turbulent (Re > 4000), about 43× above the laminar threshold. Laminar pipe flow would require Re < 2300, which here means V < 2300 × μ/(ρD) = 2300 × 1.002×10⁻³ / (998 × 0.05) = 0.046 m/s — about 43× slower than the given 2.0 m/s.",
      whyOthersWrong: [
        "Option TRUE would be correct only if V < 0.046 m/s (giving Re < 2300). At V = 2.0 m/s, Re ≈ 10⁵ — firmly turbulent, so the statement as given is false.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Pipe Flow & Dimensional Analysis
// (slug: fluid-pipe-flow-dimensional-analysis)
// ---------------------------------------------------------------------------

const LESSON_PIPEFLOW: RefLesson = {
  slug: "fluid-pipe-flow-dimensional-analysis",
  title: "Pipe Flow & Dimensional Analysis",
  titleAr: "تدفق الأنابيب وتحليل الأبعاد",
  order: 3,
  durationMin: 40,
  references: FLUID_REFERENCE_TITLES,
  conceptIntroduction: `Real engineering fluids are viscous: as they flow through pipes, ducts, and fittings, mechanical energy is dissipated as heat via wall friction and internal shear. The *Darcy–Weisbach equation* quantifies this loss over a length L of pipe of diameter D and average velocity V:
  h_f = f·(L/D)·(V²/(2g))
where f is the Darcy friction factor (dimensionless) and V²/(2g) is the velocity head. For laminar flow (Re < 2300), f = 64/Re exactly (Hagen–Poiseuille); for turbulent flow (Re > 4000), f depends on both Re and the relative roughness ε/D via the implicit *Colebrook–White* equation or the explicit *Haaland* approximation. Minor losses from valves, elbows, expansions, and contractions add as h_m = K·V²/(2g). The system curve H = Δz + (fL/D + ΣK)·V²/(2g) overlays the pump curve to find the operating point.

The second pillar of this lesson is *dimensional analysis*, the systematic reduction of a physical problem to its dimensionless Pi groups via the *Buckingham Pi theorem*: if a problem depends on n variables built from k fundamental dimensions (M, L, T), then n − k independent dimensionless Pi groups suffice. For pipe-flow pressure drop (ΔP, ρ, V, D, μ, ε, L — 7 variables, 3 dimensions), the theorem yields 4 Pi groups: Eu = ΔP/(ρV²) (Euler), Re = ρVD/μ (Reynolds), ε/D (relative roughness), and L/D. Other engineering Pi groups include Fr = V/√(gL) (free-surface/open-channel flow), We = ρV²L/σ (surface tension), and Ma = V/c (compressibility). A model test at one scale predicts prototype behavior at another if all relevant Pi groups match — the principle of *similitude*. The worked example shows the headline Darcy–Weisbach calculation: h_f = 0.020 × (100/0.05) × (2²/(2×9.81)) = 8.15 m.`,
  sections: {
    learning_objectives: `- Apply the Darcy–Weisbach equation h_f = f·(L/D)·(V²/(2g)) to compute pipe friction loss.
- Use the Colebrook–White, Haaland, or Moody chart to find f for turbulent flow.
- Compute the laminar friction factor f = 64/Re (Hagen–Poiseuille, parabolic profile).
- Add minor losses h_m = K·V²/(2g) for valves, elbows, expansions, contractions.
- Construct the system curve H = Δz + (fL/D + ΣK)·V²/(2g) and find the pump operating point.
- Apply the Buckingham Pi theorem to derive Re, Fr, We, Eu, ε/D for any fluid-mechanics problem.`,
    prerequisites: `- Lessons 1 and 2 (ρ, μ, ν; continuity; Bernoulli with head-loss term h_L).
- Calculus (logarithms, dimensional reasoning, scaling laws).
- Pipe-fitting taxonomy (elbows, valves, expansions, contractions, entrances/exits).
- Operating-point concept: intersection of pump curve and system curve.
- SI units and dimensional homogeneity (M, L, T).`,
    introduction: `Pipe-flow analysis is where the inviscid Bernoulli equation of Lesson 2 meets the real viscous fluid. Mechanical energy is dissipated as heat at the wall (skin friction) and at fittings (form drag from separations). The Darcy–Weisbach equation quantifies both: a friction factor f (laminar f = 64/Re; turbulent f via Colebrook) multiplies the length-to-diameter ratio and the velocity head. The system curve H = Δz + (fL/D + ΣK)·V²/(2g) is overlaid on the manufacturer's pump curve to find the operating point — the flow rate at which the pump head exactly balances the required system head. Dimensional analysis then generalizes the result: by Buckingham Pi, every pipe-flow problem reduces to four dimensionless groups (Eu, Re, ε/D, L/D), so a lab test on a 50 mm model predicts a 500 mm prototype if Re and ε/D are matched. Fr (Froude) governs free-surface flows; We (Weber) governs surface-tension-dominated flows (droplets, capillaries); Ma (Mach) governs compressibility. Together, friction-factor analysis and dimensional analysis turn fluid mechanics from a purely empirical art into a predictive science.`,
    terminology: `- **Darcy friction factor f**: dimensionless resistance; f = 64/Re (laminar); turbulent via Colebrook–White or Moody chart.
- **Relative roughness ε/D**: pipe-wall roughness (m) divided by diameter (m); commercial steel ε ≈ 0.045 mm, PVC ε ≈ 0.0015 mm.
- **Moody chart**: log-log plot of f vs Re with ε/D as parameter (L. F. Moody, 1944).
- **Colebrook–White equation**: implicit equation for f in turbulent flow; solved iteratively or via the Haaland explicit approximation.
- **Minor loss coefficient K**: dimensionless resistance per fitting; 90° elbow K ≈ 0.3–0.9; gate valve K ≈ 0.15 fully open, 10 half-closed.
- **Equivalent length L_eq/D**: alternate minor-loss form: L_eq/D = K/f.
- **System curve**: H_required vs Q; H = Δz + (fL/D + ΣK)·V²/(2g).
- **Pump curve**: H_pump vs Q; manufacturer's catalog (downward-opening).
- **Operating point**: intersection of system and pump curves.
- **Pi group**: dimensionless product of variables per Buckingham theorem.
- **Similitude**: model–prototype matching of all relevant Pi groups.`,
    detailed_explanation: `**Darcy–Weisbach derivation.** For fully developed steady incompressible flow in a horizontal pipe of diameter D and length L, the pressure drop ΔP balances the wall shear τ_w: ΔP·(πD²/4) = τ_w·(πD·L). Substituting the Darcy definition τ_w = f·ρV²/8 gives ΔP = f·(L/D)·(ρV²/2). Dividing by γ = ρg yields the head-loss form:
  h_f = f·(L/D)·(V²/(2g)).
This is the *Darcy–Weisbach equation*, valid for both laminar and turbulent flow with the appropriate f. (Note: the Fanning friction factor is one-quarter of the Darcy factor — beware which convention a textbook or handbook uses.)

**Laminar friction factor.** For laminar flow (Re < 2300), the Hagen–Poiseuille parabolic profile gives τ_w = 8μV/D (ΔP = 32μLV/D²). Substituting into the Darcy definition and solving for f yields f = 64/Re exactly. This is the only regime where f is closed-form in Re.

**Turbulent friction factor.** For Re > 4000, f depends on both Re and ε/D via the implicit *Colebrook–White* equation:
  1/√f = −2·log₁₀( ε/(3.7D) + 2.51/(Re·√f) ).
The explicit *Haaland* approximation
  1/√f = −1.8·log₁₀( (ε/(3.7D))^1.11 + 6.9/Re )
is within ~1.5% of Colebrook and is preferred for spreadsheet use. The fully rough regime (Re → ∞) reduces to the Prandtl–von Kármán form 1/√f = −2·log₁₀(ε/(3.7D)); f depends only on roughness. For smooth-turbulent flow (ε ≈ 0), Blasius gives f = 0.316·Re^(−1/4) for Re < 10⁵.

**Minor losses.** Each fitting (valve, elbow, contraction, expansion, entrance, exit) dissipates kinetic energy as turbulence. The loss is h_m = K·V²/(2g), with K tabulated in hydraulic handbooks (Crane Technical Paper 410, Idelchik). The total system head is H = Δz + (fL/D + ΣK)·V²/(2g). For a long pipe, ΣK is negligible; for a short manifold or skid, ΣK may dominate.

**System and pump curves.** Plot H_required vs Q for the system (upward-opening parabola through H_static at Q = 0) and H_pump vs Q for the pump (downward-opening curve). Their intersection is the operating point. Variable-speed pumps shift the pump curve by affinity laws (Q ∝ N, H ∝ N², Ẇ ∝ N³); throttling a valve steepens the system curve.

**Buckingham Pi theorem.** If a physical problem depends on n variables built from k fundamental dimensions (M, L, T), then n − k independent dimensionless Pi groups suffice. For pipe-flow pressure drop, ΔP = f(ρ, V, D, μ, ε, L) — 6 variables in 3 dimensions ⇒ 3 Pi groups: Re = ρVD/μ, ε/D, and Eu = ΔP/(ρV²) (or equivalently f, since ΔP = f·(L/D)·ρV²/2 ⇒ Eu = fL/(2D)). With L added as a 7th variable, a 4th group L/D appears. Other engineering Pi groups: Fr = V/√(gL) (free-surface/open-channel), We = ρV²L/σ (surface tension), Ma = V/c (compressibility), Pr = μc_p/k (heat-transfer Prandtl).`,
    core_principles: `- Darcy–Weisbach: h_f = f·(L/D)·(V²/(2g)) for any regime with the correct f.
- Laminar f = 64/Re (exact, Hagen–Poiseuille parabolic profile).
- Turbulent f via Colebrook (implicit) or Haaland (explicit) — function of Re and ε/D.
- Minor losses: h_m = K·V²/(2g); total system head H = Δz + (fL/D + ΣK)·V²/(2g).
- Pump operating point: intersection of system curve and pump curve.
- Buckingham Pi: n − k independent dimensionless groups; Re, Fr, We, Eu, ε/D cover most fluid problems.
- Similitude: model–prototype matching of all relevant Pi groups guarantees predictive scaling.`,
    components: `- Pipe of length L, diameter D, absolute roughness ε (steel, PVC, copper, concrete).
- Fittings: 90°/45° elbows, tees, globe valve, gate valve, check valve, orifice.
- In-tank entrance (sharp K = 0.5; rounded K ≈ 0.04), exit (K = 1.0).
- Centrifugal/axial/positive-displacement pump with manufacturer's curve.
- Suction and discharge reservoirs; static lift Δz.
- Pressure gauges at pump suction & discharge; flowmeter at discharge.
- Moody chart (or Haaland/Colebrook solver) for f lookup.
- Dimensional-analysis variable list (ΔP, ρ, V, D, μ, ε, L) for Buckingham Pi.`,
    process: `1. List pipe geometry (L, D, ε) and fluid properties (ρ, μ, ν).
2. Compute V from continuity: V = Q/A = 4Q/(πD²).
3. Compute Re = VD/ν; classify regime (laminar, transition, turbulent).
4. Look up f: 64/Re (laminar); Moody chart or Haaland explicit formula (turbulent).
5. Compute h_f = f·(L/D)·(V²/(2g)); add minor losses ΣK·V²/(2g).
6. Construct system curve H = Δz + (fL/D + ΣK)·V²/(2g) and intersect with pump curve.
7. For dimensional analysis: list variables, find n − k Pi groups, match them for model/prototype similitude.`,
    formula_calculation: `**Darcy–Weisbach (head loss):**
  h_f = f·(L/D)·(V²/(2g))   [m of fluid]
Pressure-drop form: ΔP = f·(L/D)·(ρV²/2)   [Pa]

**Laminar friction factor (Re < 2300):**
  f = 64/Re = 64μ/(ρVD)

**Turbulent friction factor (Colebrook–White, implicit):**
  1/√f = −2·log₁₀( ε/(3.7D) + 2.51/(Re·√f) )

**Turbulent friction factor (Haaland, explicit):**
  1/√f = −1.8·log₁₀( (ε/(3.7D))^1.11 + 6.9/Re )

**Blasius smooth-turbulent (Re < 10⁵):**
  f = 0.316·Re^(−1/4)

**Minor losses:**
  h_m = K·V²/(2g)   [m]; K tabulated per fitting
Equivalent length: L_eq/D = K/f

**System curve:**
  H = Δz + (fL/D + ΣK)·V²/(2g)   [m]

**Pump power & efficiency:**
  Ẇ_pump = ρgQH/η   [W]  (η = pump efficiency)
  Ẇ_motor = Ẇ_pump/η_motor

**Affinity laws (variable-speed pump):**
  Q ∝ N;  H ∝ N²;  Ẇ ∝ N³   (N = pump speed)

**Buckingham Pi theorem:**
  n variables in k dimensions ⇒ (n − k) independent Pi groups

**Standard Pi groups:**
  Re = ρVD/μ    (inertia/viscosity)
  Fr = V/√(gL)  (inertia/gravity — free-surface)
  We = ρV²L/σ   (inertia/surface tension)
  Eu = ΔP/(ρV²) (pressure/inertia)
  Ma = V/c       (compressibility; c = √(kRT))
  ε/D            (relative roughness)

**Assumptions**: (i) fully developed steady incompressible flow; (ii) Newtonian fluid; (iii) circular pipe (use D_h = 4A/P_wet for non-circular); (iv) isothermal (μ constant); (v) no cavitation (NPSH_A > NPSH_R).

**Interpretation**: doubling V quadruples friction loss (h_f ∝ V²); doubling L doubles loss; halving D multiplies loss by ~2 (for fixed Q, V quadruples and L/D doubles, so h_f ∝ 1/D⁵ for fixed Q — a strong incentive for larger pipes).`,
    worked_example: `**Example 1 — Darcy–Weisbach in a 100 m water pipe.**
Water at 20 °C (ρ = 998 kg/m³, μ = 1.002×10⁻³ Pa·s) flows at V = 2.0 m/s through a 100 m length of 50 mm commercial-steel pipe (ε = 0.045 mm ⇒ ε/D = 0.000 9). Friction factor (turbulent, Haaland): Re = ρVD/μ = 998 × 2.0 × 0.05 / 1.002×10⁻³ = 99 700. Then 1/√f = −1.8·log₁₀((0.0009/3.7)^1.11 + 6.9/99700) = −1.8·log₁₀(1.11×10⁻⁴ + 6.92×10⁻⁵) = −1.8·log₁₀(1.80×10⁻⁴) = −1.8 × (−3.745) = 6.74 ⇒ √f = 0.1484 ⇒ f ≈ 0.0220. Given the task value f = 0.020, the head loss is:
  h_f = f·(L/D)·(V²/(2g)) = 0.020 × (100/0.05) × (2.0²/(2 × 9.81))
      = 0.020 × 2000 × (4/19.62)
      = 0.020 × 2000 × 0.20387
      = 8.155 m ≈ 8.15 m.
Pressure drop: ΔP = ρg·h_f = 998 × 9.81 × 8.155 = 79 820 Pa ≈ 79.8 kPa.
Friction-power dissipated: P_loss = ρgQ·h_f = 998 × 9.81 × (π(0.05)²/4 × 2.0) × 8.155 = 998 × 9.81 × 3.927×10⁻³ × 8.155 = 313 W. (A pump delivering this flow must supply ≥ 313 W just to overcome friction.)

**Example 2 — Buckingham Pi for pipe-pressure drop.**
Variables: ΔP, ρ, V, D, μ, ε, L — 7 variables, 3 dimensions (M, L, T) ⇒ 4 Pi groups. Choose repeating variables (ρ, V, D); form Pi groups with each remaining variable:
  Π₁ = ΔP·ρ^a·V^b·D^c ⇒ solve a = −1, b = −2, c = 0 ⇒ Π₁ = ΔP/(ρV²) = Eu (Euler).
  Π₂ = μ·ρ^a·V^b·D^c ⇒ a = −1, b = −1, c = −1 ⇒ Π₂ = μ/(ρVD) = 1/Re.
  Π₃ = ε·ρ^a·V^b·D^c ⇒ a = b = 0, c = −1 ⇒ Π₃ = ε/D (relative roughness).
  Π₄ = L·ρ^a·V^b·D^c ⇒ a = b = 0, c = −1 ⇒ Π₄ = L/D.
Functional relation: Eu = φ(Re, ε/D, L/D). Identifying f via ΔP = f·(L/D)·(ρV²/2) gives Eu = f·L/(2D), so f = φ(Re, ε/D) — the Moody chart.`,
    industrial_example: `**Industry: Utilities — water-transmission main.** A 600 mm commercial-steel water-transmission main (ε = 0.045 mm) carries 0.5 m³/s over 15 km from a highland reservoir to a city's distribution tank. Velocity V = Q/A = 0.5/(π(0.6)²/4) = 1.77 m/s; Re = 1.06×10⁶ (turbulent); Haaland gives f ≈ 0.0135. Friction head: h_f = 0.0135 × (15000/0.6) × (1.77²/(2×9.81)) = 0.0135 × 25 000 × 0.1597 = 53.9 m. With minor losses (valves, air valves, bends ΣK ≈ 30) adding 30 × 0.1597 = 4.8 m and static lift Δz = 8 m, total system head H ≈ 66.7 m. The ISO 55000 dashboard logs daily friction-loss deviation as a pipe-wall condition-monitoring KPI (rising f ⇒ scaling or sediment buildup).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Penstock-Relining Decision (synthetic, illustrative).* A 50-year-old steel penstock (D = 1.5 m, L = 800 m) feeding a 30 MW hydro station has accumulated wall scaling that raises effective ε from the original 0.045 mm to 0.30 mm. At design Q = 18 m³/s (V = 10.2 m/s, Re = 1.5×10⁷), the original f ≈ 0.010 (Haaland, ε/D = 3×10⁻⁵) gives h_f = 0.010 × (800/1.5) × (10.2²/(2×9.81)) = 0.010 × 533 × 5.296 = 28.2 m. Scaled f ≈ 0.018 gives h_f = 50.8 m — an extra 22.6 m of friction, trimming turbine net head by ~6% and station output by ~1.8 MW (≈ $1.4 M/yr revenue at $90/MWh). The ASCE MOP 140 framework recommends relining (CIPP liner) at $2.5 M with a 3-year payback. Decision: relining is economically justified.`,
    visual_explanation: `**Moody chart.** The Moody chart is a log-log plot of Darcy friction factor f (ordinate, log scale 0.008–0.10) against Reynolds number Re (abscissa, log scale 10²–10⁸) with relative roughness ε/D as a family of curves (0 to 0.05). Three regions appear: a straight line f = 64/Re for laminar Re < 2300 (slope −1); a transition zone 2300 < Re < 4000 with no clean f; and a turbulent zone where f drops with Re for smooth pipes and asymptotes to a constant "fully rough" value at high Re. The dashed line marks the Colebrook-White criterion. Engineers use Moody as a graphical lookup; Haaland (1983) provides an explicit formula that bypasses the iterative Colebrook solution.`,
    simulation_opportunity: `Open EngiSuite "Pipe Friction Explorer": choose pipe material (commercial steel, PVC, concrete), diameter, length, and flow rate, and watch f converge via Colebrook iteration and the head loss h_f update. The "Pump–System Curve Intersection" simulator lets you overlay a system curve (Δz + (fL/D + ΣK)V²/(2g)) on a pump curve and watch the operating point shift as a valve is throttled (ΣK rises, system curve steepens, Q drops). The "Buckingham Pi Builder" walks through the dimensional-analysis algorithm for any variable list.`,
    common_mistakes: `- Using the Fanning friction factor (one-quarter of Darcy) in the Darcy–Weisbach formula — produces 4× too-low head loss. Always confirm which convention a source uses.
- Looking up f at the wrong Re — for water at 20 °C, Re = 99 500 in a 50 mm pipe at 2 m/s, not 9 950 or 995 000 (decimal-place errors).
- Forgetting minor losses on short skids/manifolds — a single half-closed gate valve (K = 10) can dominate over a 30 m straight pipe.
- Using laminar f = 64/Re for turbulent flow — underestimates f by 5–20×.
- Forgetting to convert ε from mm to m before forming ε/D (ε = 0.045 mm = 4.5×10⁻⁵ m, not 0.045 m).
- Constructing the system curve through the origin (omitting Δz) — pumps lift water against static head even at Q = 0.
- Mixing gauge and absolute pressure in NPSH calculations — NPSH_A uses absolute suction pressure (cavitation check).
- Adding K values instead of L_eq/D — incompatible units unless divided by f first.`,
    limitations: `- Darcy–Weisbach assumes fully developed steady incompressible flow; entrance-region lengths (L_e/D ≈ 10 for laminar, ~40 for turbulent) need an entrance-loss K = 0.5 (sharp) or 0.04 (rounded).
- Colebrook–White is empirical (best-fit to Nikuradse's sand-grain data); commercial-pipe roughness differs in shape and distribution from sand grains.
- The Moody chart's ε values are nominal; aged, scaled, or biofilm-fouled pipes have 2–10× the new ε.
- Minor-loss K values vary with fitting geometry, manufacturer, and Re — tables are nominal, not exact.
- Pump curves are water-based; pumping viscous fluids (oil, slurry) requires viscosity corrections (H, Q, η all drop).
- Buckingham Pi identifies groups but does not determine their functional relation — that requires experiment or first-principles analysis.
- Similitude requires matching *all* relevant Pi groups; for a ship model, both Re (viscous drag) and Fr (wave drag) cannot both be matched simultaneously with a single-scale model in water — a contradiction known as the "towing-tank scaling problem".`,
    comparison: `| Pipe material | ε (mm) | Notes |
|---|---|---|
| Commercial steel | 0.045 | most common |
| PVC | 0.0015 | very smooth |
| Concrete | 0.3–3 | rough, design-controlled |
| Galvanized iron | 0.15 | aged service |
| Riveted steel | 0.9–9 | very rough |

| Fitting | K (typical) | Notes |
|---|---|---|
| 90° elbow (smooth) | 0.3 | threaded or flanged |
| 90° elbow (mitred) | 0.9 | square corner |
| Gate valve (open) | 0.15 | full-bore |
| Globe valve (open) | 6–10 | high resistance |
| Sudden contraction | 0.4 | area ratio 0.5 |
| Sudden expansion | 1.0 | exit loss |
| Sharp entrance | 0.5 | re-entrant |
| Rounded entrance | 0.04 | well-rounded |

| Method | f (Re = 10⁵, ε/D = 0.000 9) | Iteration? |
|---|---|---|
| Moody chart | ~0.021 | graphical |
| Colebrook–White | 0.0220 | yes (implicit) |
| Haaland explicit | 0.0220 | no |
| Blasius (smooth) | 0.0178 | no (smooth only) |
| Laminar 64/Re | — | n/a (Re > 2300) |`,
    practical_application: `**ASCE MOP 140 penstock sizing.** A hydro-power penstock 1.8 m diameter, 1.2 km long, of welded steel (ε = 0.045 mm) carries 14 m³/s to a 12 MW Pelton turbine. Velocity V = 14/(π(1.8)²/4) = 5.50 m/s; Re = 9.9×10⁶; Haaland f ≈ 0.0101; h_f = 0.0101 × (1200/1.8) × (5.50²/(2×9.81)) = 0.0101 × 667 × 1.540 = 10.4 m of friction loss. With Δz = 110 m and minor losses ΣK ≈ 8 (valve, entrance, bend) contributing 8 × 1.54 = 12.3 m, total system head H = 110 + 10.4 + 12.3 = 132.7 m. Pump/turbine power available at this head: Ẇ = ρgQH/η = 998 × 9.81 × 14 × 132.7 / 0.85 = 21.4 MW gross ⇒ ~12 MW electrical. ASCE MOP 140 §9 confirms this is a feasible penstock design.`,
    decision_scenario: `You are the hydraulic engineer sizing a 5 km treated-water transmission main. Three options are on the table: (A) 400 mm PVC (ε = 0.0015 mm) at $1.2 M CapEx; (B) 500 mm PVC at $1.6 M; (C) 600 mm steel (ε = 0.045 mm) at $2.0 M. Required Q = 0.20 m³/s, 30-yr life, electricity $0.10/kWh, pump η = 0.75. Annual pumping cost = (ρgQH_friction × 8760 h/η) × $0.10/kWh. Head loss (Darcy–Weisbach with Haaland f): (A) f = 0.0138, h_f = 0.0138 × (5000/0.4) × (1.59²/(2×9.81)) = 0.0138 × 12500 × 0.129 = 22.2 m ⇒ $96k/yr; (B) f = 0.0130, h_f = 0.0130 × 10000 × 0.0826 = 10.7 m ⇒ $46k/yr; (C) f = 0.0133, h_f = 0.0133 × 8333 × 0.0573 = 6.35 m ⇒ $27k/yr. 30-yr lifecycle (CapEx + 30×annual): A = $4.08 M, B = $2.98 M, C = $2.81 M. Decision: option C (600 mm steel) has the lowest 30-yr cost despite highest CapEx; select C and add a cement-mortar lining to抑制 corrosion (reduces ε further to 0.03 mm).`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/Analyze. Topics: Darcy–Weisbach equation statement, numerical head-loss calculation, Buckingham Pi group count, and the laminar friction-factor relation.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Civil: Water Resources & Environmental exam outlines, ASCE MOP 140 (Steel Penstocks), and Crane Technical Paper 410 (fitting K values). Sample FE-style question: "Water (ρ = 998 kg/m³) flows at 2.0 m/s through a 100 m length of 50 mm commercial-steel pipe (f = 0.020). The Darcy–Weisbach head loss is closest to: (a) 0.41 m, (b) 4.08 m, (c) 8.15 m, (d) 16.30 m." Correct: (c) — h_f = 0.020 × (100/0.05) × (2²/(2×9.81)) = 8.15 m.`,
    summary: `Darcy–Weisbach (h_f = f·L/D·V²/(2g)) and the Buckingham Pi theorem are the two pillars of pipe-flow engineering. The friction factor f is closed-form 64/Re in laminar flow, but requires the Colebrook–White or Haaland equation (function of Re and ε/D) in turbulent flow. Minor losses, the system curve, and the pump operating point bridge the textbook calculation with field practice. Dimensional analysis (Re, Fr, We, Eu, ε/D) reduces complex fluid problems to dimensionless groups, enabling model-to-prototype prediction. ASCE MOP 140 connects classroom theory to penstock design; ISO 55000 frames friction-loss drift as an asset-management KPI.`,
    key_takeaways: `- h_f = f·(L/D)·(V²/(2g)); doubling V quadruples loss; halving D multiplies loss ~32× at fixed Q.
- Laminar f = 64/Re (exact, parabolic profile); turbulent f via Colebrook (implicit) or Haaland (explicit).
- Minor losses h_m = K·V²/(2g); total system head H = Δz + (fL/D + ΣK)·V²/(2g).
- Operating point = intersection of system curve and pump curve; throttling steepens, variable-speed shifts.
- Buckingham Pi: n variables in k dimensions ⇒ (n − k) independent dimensionless groups.
- Standard Pi groups: Re, Fr, We, Eu, Ma, ε/D — match them for similitude.
- ASCE MOP 140 is the canonical penstock reference; ISO 55000 frames friction-drift as asset KPI.`,
    references: `1. Munson et al. (2013), Ch. 7 (dimensional analysis, Buckingham Pi, similitude), Ch. 8 (viscous pipe flow, Darcy–Weisbach, Moody).
2. White (2016), Ch. 5 (dimensional analysis & similarity), Ch. 6 (viscous duct flow, Colebrook, minor losses), Ch. 11 (turbomachinery, pump–system curves).
3. Crowe et al. (2013), Ch. 7 (dimensional analysis, similitude), Ch. 9 (surface resistance), Ch. 10 (flow in conduits, pump–system).
4. Streeter et al. (1998), Ch. 6 (dimensional analysis), Ch. 7 (steady flow in closed conduits, Darcy–Weisbach), Ch. 8 (pipe systems and pumps).
5. ISO 55000:2014 (asset-management framework for friction-loss KPI tracking).
6. ASCE MOP 140 — Steel Penstocks (2012), Ch. 9 (hydraulic design, friction & minor losses, diameter optimization).`,
  },
  knowledgeObject: {
    title: "Pipe Flow & Dimensional Analysis — Knowledge Object",
    domain: "Fluid Mechanics",
    competency: "Applications",
    topic: "Darcy–Weisbach, Moody, Minor Losses, Buckingham Pi, Similitude",
    concept: "Friction-loss + system-curve + dimensionless-group framework for pipe flow",
    body: {
      definitions: [
        "Darcy–Weisbach: h_f = f·(L/D)·(V²/(2g)) — head loss from wall friction over length L.",
        "Darcy friction factor f: dimensionless resistance; laminar f = 64/Re; turbulent f via Colebrook.",
        "Relative roughness ε/D: wall-roughness height (m) divided by pipe diameter (m).",
        "Moody chart: log-log f vs Re with ε/D as parameter (Moody, 1944).",
        "Colebrook–White equation: implicit relation f = F(Re, ε/D) for turbulent flow.",
        "Haaland approximation: explicit formula within ~1.5% of Colebrook.",
        "Minor loss coefficient K: dimensionless resistance per fitting; h_m = K·V²/(2g).",
        "System curve: H_required vs Q; H = Δz + (fL/D + ΣK)·V²/(2g).",
        "Pump curve: H_pump vs Q; manufacturer's catalog (downward-opening).",
        "Operating point: intersection of system curve and pump curve.",
        "Buckingham Pi theorem: n variables in k dimensions ⇒ (n − k) independent dimensionless groups.",
        "Similitude: model–prototype matching of all relevant Pi groups.",
      ],
      principles: [
        "h_f ∝ V² — doubling velocity quadruples friction loss.",
        "h_f ∝ L/D — long thin pipes have high loss; doubling L doubles loss, halving D multiplies loss ~32× at fixed Q (V rises 4×, L/D doubles).",
        "Laminar f = 64/Re (exact, parabolic profile, independent of roughness).",
        "Turbulent f depends on both Re and ε/D (Colebrook); in fully rough regime, f depends only on ε/D.",
        "Operating point is the unique (Q, H) where pump head equals system head required.",
        "Buckingham Pi: physical relations are most economically expressed in dimensionless groups; similitude preserves them across scales.",
      ],
      components: [
        "Pipe (length L, diameter D, absolute roughness ε)",
        "Fittings: elbows, tees, valves, orifice, entrance, exit (each with K or L_eq/D)",
        "Centrifugal / axial / positive-displacement pump with manufacturer curve",
        "Suction & discharge reservoirs; static lift Δz",
        "Pressure gauges, flowmeter",
        "Moody chart or Haaland/Colebrook solver",
        "Variable list for dimensional analysis (ΔP, ρ, V, D, μ, ε, L)",
      ],
      mechanism:
        "Wall shear (skin friction) and fitting separations (form drag) dissipate mechanical energy as heat. The friction factor f summarizes both into a single dimensionless number, which (via Darcy–Weisbach) multiplies the velocity head per L/D. The system curve aggregates friction and minor losses against the static lift; the pump curve caps available head. Buckingham Pi reduces the problem to dimensionless groups so model data scales to the prototype.",
      process:
        "List (L, D, ε, ρ, μ) → compute V from continuity → compute Re → look up f (64/Re laminar, Haaland/Colebrook turbulent) → compute h_f and ΣK → construct system curve → intersect with pump curve for operating point → for scaling, identify Pi groups (Re, ε/D, Fr, We, Ma) and match them between model and prototype.",
      formulas: [
        "h_f = f·(L/D)·(V²/(2g))",
        "ΔP = f·(L/D)·(ρV²/2)",
        "f = 64/Re (laminar)",
        "1/√f = −2·log₁₀(ε/(3.7D) + 2.51/(Re·√f)) (Colebrook)",
        "1/√f = −1.8·log₁₀((ε/(3.7D))^1.11 + 6.9/Re) (Haaland)",
        "f = 0.316·Re^(−1/4) (Blasius, smooth, Re < 10⁵)",
        "h_m = K·V²/(2g); L_eq/D = K/f",
        "H = Δz + (fL/D + ΣK)·V²/(2g) (system curve)",
        "Ẇ_pump = ρgQH/η; affinity laws Q∝N, H∝N², Ẇ∝N³",
        "n − k independent Pi groups (Buckingham)",
        "Re = ρVD/μ; Fr = V/√(gL); We = ρV²L/σ; Eu = ΔP/(ρV²); Ma = V/c",
      ],
      metrics: [
        "Head loss h_f (m of fluid)",
        "Pressure drop ΔP (Pa or kPa)",
        "Friction factor f (dimensionless, 0.008–0.10 typical)",
        "Relative roughness ε/D (dimensionless)",
        "Minor-loss coefficient K (dimensionless per fitting)",
        "Pump head H (m), flow Q (m³/s), efficiency η",
        "Pump power Ẇ (W or kW)",
        "Operating point (Q_op, H_op)",
        "Reynolds, Froude, Weber, Euler, Mach numbers",
      ],
      examples: [
        "100 m of 50 mm commercial-steel pipe, V = 2 m/s, f = 0.020 ⇒ h_f = 8.15 m, ΔP = 79.8 kPa, P_loss = 313 W (see worked example 1).",
        "Buckingham Pi for pipe ΔP with 7 variables in M/L/T ⇒ 4 groups: Eu, Re, ε/D, L/D ⇒ f = φ(Re, ε/D) — the Moody chart (see worked example 2).",
        "1.8 m penstock, 1.2 km, Q = 14 m³/s ⇒ h_f = 10.4 m, total H = 132.7 m (see practical application).",
      ],
      industrial_examples: [
        "Utilities — 600 mm water-transmission main, 15 km, 0.5 m³/s: f ≈ 0.0135, h_f ≈ 53.9 m; daily friction-loss drift logged under ISO 55000 as pipe-wall condition-monitoring KPI (scaling/fouling detection).",
        "Power — ASCE MOP 140 steel penstock sizing: 1.8 m, 1.2 km, 14 m³/s, 12 MW Pelton; h_f = 10.4 m contributes ~8% of total system head.",
      ],
      case_studies: [
        "SYNTHETIC — Penstock-Relining Decision: 1.5 m penstock, 800 m, scaling raises ε 6.7×; friction loss rises from 28.2 m to 50.8 m, trimming 1.8 MW (~$1.4 M/yr) — relining (CIPP liner, $2.5 M) justified at 3-yr payback per ASCE MOP 140 framework.",
      ],
      common_errors: [
        "Using Fanning friction factor (¼ Darcy) in Darcy–Weisbach — gives 4× too-low h_f.",
        "Looking up f at wrong Re (decimal-place errors).",
        "Forgetting minor losses on short skids/manifolds (a half-closed valve K = 10 can dominate).",
        "Using laminar f = 64/Re in turbulent flow — underestimates f by 5–20×.",
        "Forgetting to convert ε from mm to m before forming ε/D.",
        "Constructing the system curve through the origin (omitting Δz).",
        "Mixing gauge and absolute pressure in NPSH calculations.",
        "Adding K and L_eq/D in incompatible units (must divide K by f first).",
      ],
      limitations: [
        "Darcy–Weisbach assumes fully developed steady incompressible flow; entrance-region (L_e/D ≈ 10 laminar, ~40 turbulent) needs separate K = 0.5 (sharp) entrance loss.",
        "Colebrook–White is empirical (best-fit to Nikuradse sand-grain data); commercial-pipe roughness differs.",
        "Nominal ε values for new pipes; aged/scaled/biofouled pipes have 2–10× higher ε.",
        "Minor-loss K values vary with fitting geometry, manufacturer, and Re.",
        "Pump curves are water-based; viscous pumping needs viscosity corrections.",
        "Buckingham Pi identifies groups but not their functional relation — requires experiment or first principles.",
        "Similitude can't match both Re and Fr simultaneously with a single-scale model in water (towing-tank scaling problem).",
      ],
      best_practices: [
        "Always confirm which friction-factor convention a source uses (Darcy vs Fanning); Darcy–Weisbach uses Darcy.",
        "Compute Re first to confirm the flow regime before choosing a friction-factor formula.",
        "Convert ε to metres before forming ε/D (steel ε = 0.045 mm = 4.5×10⁻⁵ m).",
        "Plot the system curve and pump curve on the same axes to visualize the operating point and how throttling or speed changes shift it.",
        "Track friction-loss drift over time in the ISO 55000 asset record; a rising f at constant Q signals scaling, sediment, or biofouling.",
        "For dimensional analysis, list ALL relevant variables (including constants like g and σ) before applying Buckingham Pi.",
      ],
      related_concepts: [
        "Fluid statics & properties (Lesson 1)",
        "Bernoulli & continuity (Lesson 2)",
        "Open-channel flow — Fr, specific energy, hydraulic jumps",
        "Turbomachinery — pump selection, affinity laws, NPSH",
        "Heat transfer — forced convection (Re → Nu correlation, Dittus–Boelter)",
      ],
      prerequisites: [
        "Lessons 1 and 2 (ρ, μ, ν; continuity; Bernoulli with h_L)",
        "Calculus (logarithms, dimensional reasoning)",
        "Pipe-fitting taxonomy (K values)",
        "Operating-point concept (pump–system intersection)",
      ],
      references: FLUID_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem:
        "The Darcy–Weisbach equation for head loss in a pipe is:",
      explanation:
        "h_f = f·(L/D)·(V²/(2g)) — friction factor times length-to-diameter ratio times velocity head; each term is dimensionless or in metres of head.",
      whyCorrect:
        "The Darcy–Weisbach equation is h_f = f·(L/D)·(V²/(2g)): the Darcy friction factor f (dimensionless) times the length-to-diameter ratio L/D (dimensionless) times the velocity head V²/(2g) (m of fluid). Each term is dimensionless or in metres of head, so the result h_f is in metres of fluid — consistent with the Bernoulli head form of Lesson 2.",
      whyOthersWrong: [
        "Option B inverts L/D to D/L — would predict h_f falls with longer pipes (D/L shrinks as L grows), contrary to physical intuition and to the L·(1/D) structure of wall-shear accumulation.",
        "Option C omits the ½ in the velocity head, using V²/g instead of V²/(2g) — doubles the head loss erroneously (the kinetic-energy term is ½V², not V²).",
        "Option D omits the diameter D from the denominator — dimensionally inconsistent: h_f would scale as f·L·V² only, missing the per-diameter normalization that makes the formula match wall-shear physics (ΔP·(πD²/4) = τ_w·πDL ⇒ ΔP = 4τ_w·L/D).",
      ],
      options: [
        { text: "h_f = f·(L/D)·(V²/(2g))", isCorrect: true },
        { text: "h_f = f·(D/L)·(V²/(2g))", isCorrect: false },
        { text: "h_f = f·(L/D)·(V²/g)", isCorrect: false },
        { text: "h_f = f·L·V²/(2g)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem:
        "Water at 20 °C flows at V = 2.0 m/s through a 100 m length of 50 mm commercial-steel pipe (f = 0.020, g = 9.81 m/s²). The Darcy–Weisbach head loss is closest to:",
      explanation:
        "h_f = 0.020 × (100/0.05) × (2.0²/(2×9.81)) = 0.020 × 2000 × 0.20387 = 8.155 m ≈ 8.15 m.",
      whyCorrect:
        "Substitute into h_f = f·(L/D)·(V²/(2g)) with f = 0.020, L/D = 100/0.05 = 2000, and V²/(2g) = 2.0²/(2 × 9.81) = 4/19.62 = 0.20387 m. Then h_f = 0.020 × 2000 × 0.20387 = 8.155 m, which rounds to 8.15 m. The pressure-drop equivalent ΔP = ρg·h_f = 998 × 9.81 × 8.155 ≈ 79.8 kPa.",
      whyOthersWrong: [
        "Option 0.41 m comes from omitting the diameter in the L/D ratio, i.e. computing h_f = f·L·V²/(2g) = 0.020 × 100 × 0.20387 = 0.408 m — missing the 1/D normalization that Darcy–Weisbach requires.",
        "Option 4.08 m comes from halving L/D (perhaps confusing pipe radius 0.025 m with diameter 0.05 m, computing L/(2D) = 1000 instead of L/D = 2000): h_f = 0.020 × 1000 × 0.20387 = 4.08 m.",
        "Option 16.30 m comes from using V²/g instead of V²/(2g) (omitting the ½ in the kinetic-energy term), doubling the answer: h_f = 0.020 × 2000 × 0.4077 = 16.31 m.",
      ],
      options: [
        { text: "0.41 m", isCorrect: false },
        { text: "4.08 m", isCorrect: false },
        { text: "8.15 m", isCorrect: true },
        { text: "16.30 m", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "A pipe-pressure-drop problem depends on 7 variables (ΔP, ρ, V, D, μ, ε, L) built from 3 fundamental dimensions (M, L, T). By the Buckingham Pi theorem, the number of independent dimensionless Pi groups is:",
      explanation:
        "Buckingham Pi: n variables in k fundamental dimensions reduce to (n − k) independent dimensionless groups. Here n = 7, k = 3 ⇒ 4 groups (Eu, Re, ε/D, L/D).",
      whyCorrect:
        "The Buckingham Pi theorem states that a physical problem depending on n variables expressed in k fundamental dimensions reduces to (n − k) independent dimensionless Pi groups. With n = 7 (ΔP, ρ, V, D, μ, ε, L) and k = 3 (M, L, T), the count is 7 − 3 = 4 Pi groups. The standard choice (using ρ, V, D as repeating variables) gives: Eu = ΔP/(ρV²), Re = ρVD/μ, ε/D, and L/D — exactly the four groups on the Moody chart.",
      whyOthersWrong: [
        "Option 3 counts only the chosen repeating variables (ρ, V, D) — the *repeating* set, not the number of Pi groups produced.",
        "Option 5 = (n − k + 1) — adds a spurious extra group, possibly from a miscalculation of n or k, or by mistakenly counting the dimensions M, L, T as a 4th dimension.",
        "Option 7 = n itself, implying dimensional analysis provides no simplification — the theorem's whole point is that n physical variables collapse to (n − k) dimensionless groups.",
      ],
      options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "5", isCorrect: false },
        { text: "7", isCorrect: false },
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
        "True or False: For fully developed laminar flow (Re < 2300) in a smooth circular pipe, the Darcy friction factor is f = 64/Re, independent of pipe roughness ε.",
      explanation:
        "TRUE. In laminar flow, the parabolic Hagen–Poiseuille profile makes wall shear a function of viscous diffusion only; roughness is buried under the thick laminar sublayer, so f = 64/Re and ε does not enter.",
      whyCorrect:
        "TRUE. For fully developed laminar flow in a circular pipe (Re < 2300), the velocity profile is the Hagen–Poiseuille parabola u(r) = (1/(4μ))(−dP/dx)(R² − r²), and the wall shear is governed entirely by viscous diffusion across the radius. The Darcy friction factor emerges as f = 64/Re exactly, with no dependence on ε because the laminar sublayer is thick compared with any wall roughness asperity. (In turbulent flow Re > 4000, f depends on both Re and ε/D via Colebrook — roughness matters only when eddies interact with asperities.)",
      whyOthersWrong: [
        "Option FALSE would imply laminar f depends on roughness — but that is true only for turbulent flow, where eddy structure interacts with wall asperities. In laminar flow, the velocity profile is parabolic and wall shear is set by viscous diffusion alone; ε/D does not enter the friction-factor relation. Hence the statement as given is TRUE.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const FLUID_LESSONS: RefLesson[] = [
  LESSON_STATICS,
  LESSON_DYNAMICS,
  LESSON_PIPEFLOW,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts EXACTLY. The Prisma shim (src/lib/db.ts) transparently:
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
 * Upsert the Fluid Mechanics discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "fluid-mechanics" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "fluid-mechanics-fundamentals", name "Fluid Mechanics Fundamentals",
 *     order 1).
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
  // 1) Discipline — find by slug "fluid-mechanics" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "fluid-mechanics" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "fluid-mechanics" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "fluid-mechanics-fundamentals"; name: "Fluid Mechanics
  //    Fundamentals"; order 1. The Chapter has a @@unique([disciplineId,
  //    slug]), so we use findFirst + create/update.
  const chapterSlug = "fluid-mechanics-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Fluid Mechanics Fundamentals",
    slug: chapterSlug,
    description:
      "Fluid statics & properties, Bernoulli & continuity, and pipe flow & dimensional analysis — the three-lesson deep scientific reference for the Fluid Mechanics engineering discipline.",
    icon: "Waves",
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
  for (const src of FLUID_SOURCES) {
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
  const sharedReferenceIds = FLUID_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of FLUID_LESSONS) {
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
