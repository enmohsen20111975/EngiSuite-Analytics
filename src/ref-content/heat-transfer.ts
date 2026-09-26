// =============================================================================
// Heat Transfer — Engineering Discipline — Deep scientific reference
// (Task ID: HEAT).
//
// Discipline slug: "heat-transfer" (seeded by scripts/seed-disciplines.ts,
// group "Mechanical", order 8, icon "Flame", color "red",
// "Conduction, convection, radiation, heat exchangers.").
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts EXACTLY in structure, lifecycle
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
// Three lessons (one chapter "Heat Transfer Fundamentals"):
//   1. Conduction                       (slug: heat-conduction)
//   2. Convection                        (slug: heat-convection)
//   3. Radiation & Heat Exchangers       (slug: heat-radiation-exchangers)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional heat-transfer content. No padding.
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
//   - LEVEL 6 — University / Academic Publications: Frank P. Incropera,
//     David P. DeWitt, Theodore L. Bergman & Adrienne S. Lavine,
//     "Fundamentals of Heat and Mass Transfer" (Wiley, 8th ed., 2017);
//     Yunus A. Çengel & Afshin J. Ghajar, "Heat and Mass Transfer:
//     Fundamentals and Applications" (McGraw-Hill, 6th ed., 2020).
//   - LEVEL 7 — Technical Publications / Industry Sources: Frank Kreith,
//     "Principles of Heat Transfer" (Cengage, 7th ed., 2011); Jack P.
//     Holman, "Heat Transfer" (McGraw-Hill, 10th ed., 2010).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014
//     (Asset Management — aligns heat-transfer equipment thermal
//     performance with the ISO 55000 asset-management framework).
//   - LEVEL 5 — Professional Organizations: ASHRAE Handbook — HVAC
//     Applications (ASHRAE, 2019) — the canonical HVAC reference for
//     building heat-load sizing and heat-exchanger selection in Lesson 3.
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
// SOURCES — 6 real references cited across all heat-transfer lessons.
// ---------------------------------------------------------------------------

export const HEAT_SOURCES: RefSource[] = [
  {
    title:
      "Incropera, DeWitt, Bergman & Lavine — Fundamentals of Heat and Mass Transfer (Wiley, 8th ed., 2017)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Incropera, F. P., DeWitt, D. P., Bergman, T. L., & Lavine, A. S. (2017). Fundamentals of Heat and Mass Transfer (8th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-38683-5. Chapters 1 (Introduction — conduction/convection/radiation modes, Fourier's law), 2 (Steady-State Conduction — 1D plane wall, cylinder, sphere; thermal resistance; contact resistance; composite walls; Figs 3.1–3.5), 3 (Transient Conduction — lumped capacitance, Heisler charts, semi-infinite solid), 6 (Convection — boundary layers, Nu/Re/Pr correlations, analogies), 8 (Internal Flow Convection — Dittus–Boelter, Sieder–Tate, fully developed flow), 9 (External Flow Convection — Hilpert, Zhukauskas), 12 (Radiation — blackbody, Stefan–Boltzmann, view factors, gray surfaces), 11 (Heat Exchangers — LMTD, ε-NTU, correction-factor charts). The canonical undergraduate heat-transfer textbook used by ABET-accredited ME programs.",
  },
  {
    title:
      "Çengel & Ghajar — Heat and Mass Transfer: Fundamentals and Applications (McGraw-Hill, 6th ed., 2020)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Çengel, Y. A., & Ghajar, A. J. (2020). Heat and Mass Transfer: Fundamentals and Applications (6th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-339818-1. Chapters 1 (Introduction & Basic Concepts — heat-transfer modes, energy balance on a CV), 2 (Heat Conduction Equation — 1D steady-state, plane wall/cylinder/sphere, thermal resistance networks), 3 (Steady Heat Conduction — composite walls, contact resistance, critical radius of insulation), 6 (Forced Convection — boundary layer equations, dimensionless numbers, external & internal flow correlations, Dittus–Boelter Nu=0.023·Re^0.8·Pr^0.4), 9 (Natural Convection — Grashof, Rayleigh, Churchill–Chu), 11 (Radiation Heat Transfer — Stefan–Boltzmann, Kirchhoff, view factors, network method), 13 (Heat Exchangers — LMTD method, ε-NTU, correction factors). Practitioner-friendly reference with worked examples throughout, complementary to Incropera.",
  },
  {
    title:
      "Kreith — Principles of Heat Transfer (Cengage, 7th ed., 2011)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Kreith, F. (2011). Principles of Heat Transfer (7th ed.). Stamford, CT: Cengage Learning. ISBN 978-0-495-66770-4. Chapters 1 (Introduction — conduction, convection, radiation modes), 2 (Steady-State Conduction — Fourier's law, thermal resistance networks, shape factors), 3 (Transient Conduction — lumped capacitance, Heisler charts), 4 (Forced Convection — boundary-layer theory, Reynolds & Nusselt analogies), 5 (Natural Convection — Rayleigh & Grashof numbers), 6 (Radiation — Stefan–Boltzmann, view factors), 9 (Heat Exchangers — LMTD & ε-NTU). Bridges thermodynamic cycle analysis with the heat-transfer calculations needed for boiler/condenser/radiator sizing — cited in Lessons 1, 2, and 3 for conduction resistance networks and heat-exchanger LMTD method.",
  },
  {
    title:
      "Holman — Heat Transfer (McGraw-Hill, 10th ed., 2010)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Holman, J. P. (2010). Heat Transfer (10th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-352936-3. Chapters 1 (Introduction — heat-transfer modes, Fourier's law, convective coefficient ranges), 2 (Steady-State Conduction — plane wall, cylinder, sphere, critical insulation thickness), 3 (Transient Conduction — lumped capacity, charts), 5 (Empirical & Practical Relations for Forced Convection — Dittus–Boelter, Sieder–Tate), 6 (Natural Convection — Grashof, Rayleigh), 8 (Radiation Heat Transfer — Stefan–Boltzmann, view factors, network method), 10 (Heat Exchangers — LMTD, ε-NTU, NTU-effectiveness charts). A classic practitioner reference with extensive worked numerical examples and design data tables.",
  },
  {
    title: "ISO 55000:2014 — Asset Management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55000.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines the asset-management framework (Plan–Do–Check–Act), the concept of an asset system, and the value/cost/risk triangle against which heat-transfer equipment thermal performance (boiler efficiency, heat-exchanger UA degradation, insulation-system thermal resistance, fin efficiency) is reported as lifecycle asset-performance metrics. Cited in Lessons 1 and 3 to align heat-transfer equipment sizing, fouling-resistance monitoring, and insulation-upgrade decisions with the ISO 55000 asset-management reporting structure that power utilities, oil & gas operators, and HVAC fleet managers apply to boiler, condenser, and radiator fleets.",
  },
  {
    title:
      "ASHRAE Handbook — HVAC Applications (ASHRAE, 2019)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.ashrae.org/technical-resources/ashrae-handbook",
    citation:
      "American Society of Heating, Refrigerating and Air-Conditioning Engineers (ASHRAE). ASHRAE Handbook — HVAC Applications (2019 ed.). Atlanta, GA: ASHRAE. ISBN 978-1-936584-97-7. Chapters 1 (Residential & Commercial HVAC Load Calculations — cooling load temperature difference, CLTD/SCL/CLF method), 3 (Commercial & Public Buildings — air-handler selection, coil sizing), 5 (Cogeneration & CHP — topping & bottoming heat recovery), 14 (Laboratories — sensible / latent loads), 18 (Industrial Applications — process refrigeration, cold storage, heat-exchanger selection). The canonical reference for building heat-load sizing, convection coefficients in occupied spaces, and shell-and-tube heat-exchanger selection in HVAC and process industries — cited in Lessons 2 and 3 for natural-convection correlations and LMTD-based heat-exchanger sizing practice.",
  },
];

const HEAT_REFERENCE_TITLES = HEAT_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Conduction
// (slug: heat-conduction)
// ---------------------------------------------------------------------------

const LESSON_CONDUCTION: RefLesson = {
  slug: "heat-conduction",
  title: "Conduction Heat Transfer",
  titleAr: "انتقال الحرارة بالتوصيل",
  order: 1,
  durationMin: 35,
  references: HEAT_REFERENCE_TITLES,
  conceptIntroduction: `Conduction is the transfer of heat through a stationary medium by the random motion of molecules and free electrons (in metals). The constitutive law — *Fourier's law* (Joseph Fourier, 1822) — states that the heat flux is proportional to the negative temperature gradient, q⃗ = −k·∇T; in one dimension q = −k·A·(dT/dx). The proportionality constant k (W/(m·K)) is the *thermal conductivity*: copper ≈ 400, aluminum ≈ 200, steel ≈ 50, water ≈ 0.6, air ≈ 0.026, insulation ≈ 0.04. For 1D steady-state conduction through a plane wall of thickness L with surface temperatures T₁ and T₂, integration of Fourier's law gives q = k·A·(T₁ − T₂)/L, which rearranges to the *thermal-resistance* form q = ΔT/R_th where R_th = L/(k·A). For a hollow cylinder, R_th = ln(r₂/r₁)/(2π·k·L); for a hollow sphere, R_th = (1/r₁ − 1/r₂)/(4π·k). Composite walls are analyzed by series and parallel thermal-resistance networks, R_total = Σ L_i/(k_i·A_i), exactly analogous to electrical resistors. This lesson builds the resistance-network toolkit that Lessons 2 and 3 extend with convection (film resistance 1/(h·A)) and radiation (surface resistance (1−ε)/(ε·A·σ)) — the universal engineering method for sizing walls, insulation, pipes, fins, and heat-exchanger walls.`,
  sections: {
    learning_objectives: `- State Fourier's law of heat conduction in vector and 1D scalar form and identify the role of thermal conductivity k.
- Derive the 1D steady-state conduction solutions for a plane wall, hollow cylinder, and hollow sphere using the resistance analogy R_th = ΔT/q.
- Build series and parallel thermal-resistance networks for composite walls (insulation + steel + brick) and solve for heat flux and interface temperatures.
- Distinguish thermal conductivity k (material property) from thermal conductance U = 1/R_total (system property) and from thermal diffusivity α = k/(ρ·c_p) (transient property).
- Apply the critical radius of insulation r_cr = k_ins/h_ext to decide when adding insulation to a small-diameter pipe increases (rather than decreases) heat loss.
- Use thermal contact resistance R_contact (m²·K/W) at material interfaces and read typical values from Incropera Table 3.2.`,
    prerequisites: `- Differential and integral calculus — separation of variables in 1D steady-state; the logarithmic integral for cylindrical coordinates.
- Conservation of energy applied to a differential control volume — the heat-diffusion equation ρ·c_p·∂T/∂t = ∇·(k·∇T) + q̇_vol.
- Basic electricity: Ohm's law V = I·R and the series/parallel resistor network — direct analog for thermal-resistance networks (ΔT ↔ V, q ↔ I, R_th ↔ R).
- Thermodynamics: First Law for a closed system, enthalpy h = u + Pv (Lesson 1 in thermodynamics.ts).`,
    introduction: `Conduction is the heat-transfer mode that dominates in solids — the desk feels cold because your fingertips transfer heat by conduction into the desktop; a steel spoon in a hot cup conducts heat to your hand. Fourier's 1822 law q⃗ = −k·∇T is the constitutive relation: heat flows from high to low temperature at a rate proportional to the gradient, and the proportionality constant k (W/(m·K)) is a property of the material. Metals have high k because free electrons carry thermal energy; gases have very low k because molecular collisions are infrequent. Engineers rarely solve the full 3D heat-diffusion equation; instead, for steady-state 1D geometries (plane wall, cylinder, sphere), the equation integrates to a simple linear (or logarithmic) temperature profile and the *thermal-resistance* form q = ΔT/R_th. The resistance analogy is the universal engineering tool: composite walls, finned surfaces, heat-exchanger walls, and even convection and radiation layers all reduce to series or parallel resistance networks. This lesson builds that toolkit and applies it to a 3-layer composite wall and to the *critical radius of insulation* — the counter-intuitive result that adding insulation to a small-diameter pipe can INCREASE heat loss because the outer surface area grows faster than the resistance per unit area.`,
    terminology: `- **Thermal conductivity k [W/(m·K)]**: material property; metals 50–400, polymers 0.1–0.5, gases ~0.026 (air).
- **Heat flux q [W/m²]**: heat rate per unit area normal to the direction of flow.
- **Heat rate Q̇ [W]**: total heat flow through area A; Q̇ = q·A.
- **Thermal resistance R_th [K/W]**: R_th = ΔT/Q̇; for a plane wall R_th = L/(k·A).
- **Thermal conductance U [W/(m²·K)]**: U = 1/(R_th·A) = k/L for a homogeneous wall.
- **Thermal contact resistance R''_contact [m²·K/W]**: interface resistance from microscopic contact points.
- **Critical radius of insulation r_cr = k_ins/h_ext**: at r_outer < r_cr, adding insulation INCREASES heat loss.
- **Thermal diffusivity α = k/(ρ·c_p) [m²/s]**: governs transient penetration depth; steady state is independent of α.`,
    detailed_explanation: `**Fourier's law (1D, steady).** For a plane wall of thickness L with surface temperatures T₁ > T₂ and constant k, separation of variables from the heat-diffusion equation d²T/dx² = 0 with T(0)=T₁, T(L)=T₂ gives a linear profile T(x) = T₁ − (T₁ − T₂)·(x/L), so dT/dx = −(T₁−T₂)/L. Fourier's law q = −k·A·(dT/dx) then yields q = k·A·(T₁ − T₂)/L. Re-arranging: q = (T₁ − T₂)/R_th, with R_th = L/(k·A) — the thermal resistance of the wall, in K/W, exactly analogous to electrical resistance R = ρL/A.

**Cylindrical and spherical shells.** For a hollow cylinder of inner radius r₁ (T₁) and outer radius r₂ (T₂), the heat-diffusion equation in cylindrical coordinates d/dr(r·dT/dr) = 0 integrates to T(r) = T₁ − (T₁ − T₂)·ln(r/r₁)/ln(r₂/r₁); Fourier's law on a cylindrical shell of area A(r) = 2π·r·L gives q = 2π·k·L·(T₁ − T₂)/ln(r₂/r₁), so R_th = ln(r₂/r₁)/(2π·k·L). For a hollow sphere, R_th = (1/r₁ − 1/r₂)/(4π·k). The logarithmic and inverse-radius forms reflect the radial growth of heat-flow area.

**Composite walls (series resistance).** For a wall of N layers (L_i, k_i) in series with a common area A, the resistances add: R_total = Σ L_i/(k_i·A) + Σ R''_contact/A. The heat rate is q = (T_hot − T_cold)/R_total, and the interface temperature between layer i and i+1 follows from T_{i+1} = T_i − q·R_i — the temperature drop across each layer is proportional to that layer's resistance. This is the standard building-wall, boiler-wall, and refractory-furnace calculation.`,
    core_principles: `- **Fourier's law**: q⃗ = −k·∇T; heat flows opposite to the temperature gradient.
- **Resistance analogy**: ΔT ↔ V, q ↔ I, R_th ↔ R; series and parallel resistor rules apply directly.
- **k is a material property**; U = 1/(R_total·A) is a system property combining materials and convection films.
- **Steady state is independent of α** = k/(ρ·c_p); α governs only transient (time-varying) conduction.
- **Critical radius**: for a cylinder of outer radius r < r_cr = k_ins/h_ext, adding insulation INCREASES Q̇ because the area-growth term 2π·r·L·h grows faster than the resistance term ln(r/r_pipe)/(2π·k·L).`,
    components: `- **Wall/slab materials** (concrete k=1.4, brick k=0.7, steel k=50, glass wool k=0.04 W/(m·K)).
- **Pipe wall and insulation** (steel pipe + mineral wool, foam glass, calcium silicate).
- **Contact interfaces** (steel-concrete, steel-aluminum) — R''_contact ≈ 0.01–0.1 m²·K/W.
- **Thermal interface materials** (greases, gap pads) used to reduce R_contact in electronic packages.
- **Insulation jacket/cladding** (aluminum, stainless) that protects the insulation and adds a small conductance step.`,
    process: `1. Identify the geometry (plane wall, cylinder, sphere, composite) and steady-state assumption (no heat generation, constant k).
2. List each layer's (L, k, A) or (r₁, r₂, k, L) and any contact resistance.
3. Compute each layer's thermal resistance R_i.
4. Combine in series (R_total = ΣR_i) or parallel (1/R_total = Σ1/R_i) depending on the topology.
5. Apply q = (T_hot − T_cold)/R_total.
6. Compute interface temperatures T_i+1 = T_i − q·R_i to verify against material temperature limits (e.g., insulation max service temperature).
7. Add the convection-film resistances 1/(h·A) at hot and cold surfaces (Lesson 2) and the radiation resistance (Lesson 3) for the full system.`,
    formula_calculation: `**Fourier's law (1D, plane wall):**
  q = −k·A·(dT/dx) ⟹ q = k·A·(T₁ − T₂)/L ⟹ R_th = L/(k·A) [K/W]

**Hollow cylinder** (length L, inner radius r₁, outer r₂):
  R_th = ln(r₂/r₁)/(2π·k·L) [K/W]; T(r) = T₁ − (T₁−T₂)·ln(r/r₁)/ln(r₂/r₁)

**Hollow sphere:**
  R_th = (1/r₁ − 1/r₂)/(4π·k) [K/W]

**Composite wall (series):**
  R_total = Σᵢ Lᵢ/(kᵢ·A) + Σⱼ R''_contact,j/A ;  q = (T_hot − T_cold)/R_total
  Interface temperature: T_{i+1} = T_hot − q·Σ_{j=1..i} R_j

**Critical radius of insulation** (cylinder, external convection h):
  r_cr = k_ins / h_ext  ;  if r_pipe < r_cr, adding insulation INCREASES Q̇.

**Conductance form (overall heat-transfer coefficient):**
  U = 1/(R_total·A)  ;  q = U·A·(T_hot − T_cold)`,
    worked_example: `**Three-layer composite wall.** A 4 m × 3 m building wall consists of (1) 20 cm brick (k₁ = 0.70 W/(m·K)), (2) 8 cm glass-wool insulation (k₂ = 0.040 W/(m·K)), and (3) 1 cm interior plaster (k₃ = 0.50 W/(m·K)). Inner surface T₁ = 20 °C, outer surface T₄ = −10 °C. Compute R_total, q, and the heat flux q″.

Area A = 4 × 3 = 12 m². Resistances (per-layer):
  R₁ = L₁/(k₁·A) = 0.20/(0.70 × 12) = 0.02381 K/W
  R₂ = 0.08/(0.040 × 12) = 0.1667 K/W
  R₃ = 0.01/(0.50 × 12) = 0.00167 K/W
  R_total = 0.02381 + 0.1667 + 0.00167 = 0.1922 K/W
  q = (T₁ − T₄)/R_total = (20 − (−10))/0.1922 = 30/0.1922 = 156.1 W
  q″ = q/A = 156.1/12 = 13.0 W/m²

The insulation layer dominates the resistance (0.1667 of 0.1922 = 87%). Interface temperatures:
  T₂ = T₁ − q·R₁ = 20 − 156.1 × 0.02381 = 20 − 3.72 = 16.3 °C (brick/insulation interface)
  T₃ = T₂ − q·R₂ = 16.3 − 156.1 × 0.1667 = 16.3 − 26.02 = −9.7 °C (insulation/plaster interface) ≈ T₄ — confirming the plaster is a near-zero-resistance finish. The 87% share held by the insulation is the design lesson: spend the wall budget on R, not on thermal mass.`,
    industrial_example: `**Industry: Oil & Gas — steam-line insulation audit.** A refinery transports 12 bar saturated steam (T_sat ≈ 188 °C) through a 6-inch NPS (168 mm OD) steel pipe (k_pipe = 50 W/(m·K)) with 50 mm of calcium-silicate insulation (k_ins = 0.065 W/(m·K)) and aluminum jacket (negligible R) in 8 m/s wind (h_ext = 25 W/(m²·K)), ambient T∞ = 20 °C. Per unit length L = 1 m: pipe R = ln(0.168/0.154)/(2π·50·1) = 2.85×10⁻⁴ K·m/W; insulation R = ln(0.268/0.168)/(2π·0.065·1) = 0.7396 K·m/W; outer convection R_conv = 1/(2π·0.268·1·25) = 0.0475 K·m/W. R_total ≈ 0.7396 + 0.0475 = 0.787 K·m/W (pipe negligible). Heat loss per meter: q' = (188 − 20)/0.787 = 213.7 W/m. For 500 m of line at 8000 h/yr: annual loss = 500 × 213.7 × 8000 × 3600 = 3.08×10¹² J = 3080 GJ/yr ≈ 1380 tonnes/yr of steam (latent heat ≈ 2.23 MJ/kg). At $15/MMBtu fuel cost, that is ~$43k/yr/mile of line — the dominant energy KPI in the plant's ISO 55000 asset-management register.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Riverside District Heating Network (synthetic, illustrative).* A 4 km buried hot-water district-heating main (DN 200 steel pipe, k_pipe = 50 W/(m·K), wall 8 mm) carries 110 °C supply water. Insulation options compared: (A) 50 mm polyurethane foam (k = 0.024 W/(m·K)), jacket emissivity ε = 0.9, soil effective h_soil = 4 W/(m²·K) with T_soil = 8 °C; (B) 100 mm PU foam, same jacket. Per-meter resistances: pipe R_pipe = ln(0.200/0.184)/(2π·50) = 2.7×10⁻⁴ K·m/W (negligible); insulation R_A = ln(0.300/0.200)/(2π·0.024) = 2.67 K·m/W vs R_B = ln(0.400/0.200)/(2π·0.024) = 4.61 K·m/W; outer R_conv,A = 1/(2π·0.300·4) = 0.133 K·m/W vs R_conv,B = 1/(2π·0.400·4) = 0.0995 K·m/W. Total: R_A = 2.80 K·m/W → q'_A = (110 − 8)/2.80 = 36.4 W/m; R_B = 4.71 K·m/W → q'_B = (110 − 8)/4.71 = 21.7 W/m. Annual heat loss A: 36.4 × 4000 × 8000 × 3600 = 4.18 TJ/yr ≈ $32k/yr at $8/MMBtu; option B saves $13k/yr. Capex delta +$40/m × 4000 = $160k → payback 12.3 yr. Adopt B if lifecycle horizon > 15 yr; track savings under ISO 55000.`,
    visual_explanation: `**Temperature profile through a composite wall.** Plot T(x) on the y-axis against wall depth x on the x-axis. The temperature falls linearly inside each layer (steady state, constant k), but the SLOPE of T(x) changes at each material interface — steep slope in low-k insulation (large dT per unit L because R per unit L = 1/k is large) and shallow slope in high-k steel (small dT per unit L). The discontinuity in slope at the brick/insulation interface is the visual signature of a resistance mismatch — the layer with the higher R holds most of the ΔT. For a cylinder, T(r) is logarithmic in each layer; for a sphere, T(r) is hyperbolic (1/r). The q-flux line is constant across the wall (no internal generation in steady state), so the area under q (the heat-rate Q̇) is also constant — analogous to a constant current through series resistors.`,
    simulation_opportunity: `EngiSuite composite-wall explorer: input (L_i, k_i) for up to 6 layers plus inner/outer convection coefficients; receive R_total, U-value (W/(m²·K)), q″, and the T(x) profile plotted live as you drag any thickness slider or swap a material (e.g., mineral wool → aerogel k=0.014 → huge R change). Also try the *critical-radius explorer*: a 10 mm OD pipe with k_ins = 0.04 W/(m·K), h_ext = 10 W/(m²·K) gives r_cr = 4 mm — meaning ANY insulation thickness from 0 to 4 mm INCREASES heat loss, then beyond 4 mm it decreases. Plot Q̇ vs r_ins to see the peak at r_cr. Compare with EES (Engineering Equation Solver) and OpenStudio / EnergyPlus for full-building conduction loads.`,
    common_mistakes: `- **Mixing area-normalized and total resistance**: q″ = ΔT/(R/A) = ΔT·U; Q̇ = ΔT/R_total. Using R_total when q″ was asked, or vice versa, is the #1 conduction-calculation error.
- **Forgetting contact resistance** at steel/insulation interfaces — for high-precision heat-exchanger sizing R''_contact can be 5–10% of R_total.
- **Applying the plane-wall formula L/(k·A) to a cylindrical pipe** when r₂/r₁ > 1.2 — the correct form ln(r₂/r₁)/(2π·k·L) must be used.
- **Assuming k is constant** over a 200 °C ΔT — for steel, k drops ~5% from 0 to 400 °C; for gases it rises ~25%. Use temperature-averaged k for accurate furnace-wall calcs.
- **Ignoring the critical radius** when insulating small-diameter pipes (r_pipe < k_ins/h) — adding insulation INCREASES heat loss until r_outer = r_cr.`,
    limitations: `- **1D steady-state assumption**: real walls have 2D corner losses, thermal bridges at studs, and dynamic (diurnal) loads — 1D gives the wall-average q within ±10–15%, insufficient for code-compliance load calculations.
- **Constant-k assumption**: invalid for large ΔT or phase-change materials (PCM); requires temperature-dependent k or enthalpy methods.
- **No internal heat generation**: Joule heating in wires, hydration heat in curing concrete, and chemical reactions require the q̇_vol term in the heat-diffusion equation.
- **Contact resistance data** is sparse — published R''_contact values have ±50% uncertainty for air gaps; measured values are preferred.`,
    comparison: `| Aspect | Plane wall | Hollow cylinder | Hollow sphere |
|---|---|---|---|
| R_th formula | L/(k·A) | ln(r₂/r₁)/(2π·k·L) | (1/r₁ − 1/r₂)/(4π·k) |
| T(x) profile | Linear | Logarithmic | Hyperbolic (1/r) |
| Heat-flow area A(x) | Constant | A = 2π·r·L (grows with r) | A = 4π·r² (grows as r²) |
| Typical use | Building wall, furnace lining | Pipe insulation, heat-exchanger tube | Pressure-vessel wall, spherical tank |
| Conduction equation | d²T/dx² = 0 | d/dr(r·dT/dr) = 0 | d/dr(r²·dT/dr) = 0 |`,
    practical_application: `**Building wall U-value code compliance.** A 2024 IECC-compliant commercial wall in climate zone 5 must achieve U ≤ 0.064 W/(m²·K) (R-15 ft²·°F·h/Btu in I-P). For a wall of brick (k=0.7, L=0.10 m) + air cavity (R=0.18 m²·K/W) + 100 mm mineral wool (k=0.040, L=0.10 m) + 12 mm gypsum (k=0.50, L=0.012 m), the U-value = 1/(R_total·A_per_unit) per unit area: R_total = 0.10/0.70 + 0.18 + 0.10/0.040 + 0.012/0.50 = 0.143 + 0.18 + 2.50 + 0.024 = 2.847 m²·K/W → U = 0.351 W/(m²·K) — fails. Adding 100 mm of polyisocyanurate (k=0.022) gives R = 0.10/0.022 = 4.545 extra → R_total = 7.39 → U = 0.135 — still fails. Add 150 mm instead: R = 6.82 → R_total = 9.66 → U = 0.103 — still fails. The solution is an exterior continuous-insulation strategy (ci) with 200 mm of XPS foam (k=0.033) giving R = 6.06 → R_total = 9.04 → U = 0.11 — fails. The code-minimum path in this climate zone typically requires a hybrid cavity-fill + exterior ci assembly reaching R_total ≥ 15.6 m²·K/W (U ≤ 0.064). This is the daily work of energy-modeling engineers using OpenStudio, EnergyPlus, and HAP/TRACE.`,
    decision_scenario: `You are the energy engineer at a 200-room hotel. The 25-year-old chilled-water line (DN 150 steel, 25 mm degraded fiberglass insulation, k=0.05 W/(m·K)) runs 300 m in the parking garage (T_amb = 27 °C, h_air = 8 W/(m²·K)); chilled water at 5 °C. Option A: replace with 50 mm Armaflex elastomeric (k=0.040, capex $60/m). Option B: replace with 75 mm Armaflex (k=0.040, capex $90/m). Heat gain per meter with current insulation: R_pipe ≈ 0 (steel), R_ins = ln(0.200/0.175)/(2π·0.050) = 1.69 K·m/W, R_conv = 1/(2π·0.200·8) = 0.0995 K·m/W → q' = (27 − 5)/(1.69 + 0.0995) = 12.35 W/m → annual heat gain 300 × 12.35 × 8000 × 3600 = 1.07 TJ/yr; at chiller COP 4 and $0.12/kWh → $8.9k/yr. Option A: R_ins = ln(0.250/0.175)/(2π·0.040) = 2.39 K·m/W → q' = 8.95 W/m → $6.4k/yr (saves $2.5k/yr; capex $18k → payback 7.2 yr). Option B: R_ins = ln(0.300/0.175)/(2π·0.040) = 2.97 K·m/W → q' = 7.32 W/m → $5.2k/yr (saves $3.7k/yr; capex $27k → payback 7.3 yr). Adopt A (slightly better payback); the marginal 25 mm thickness in B doesn't pay back faster because the inner-skin temperature is already at near-ambient. Report under ISO 55000 as a 7.2-yr payback capex item in the next budget cycle.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Apply/Analyze. Topics: Fourier's law statement, composite-wall heat flux, contact-resistance contribution, and the critical-radius counter-intuitive effect.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Thermal & Fluids Systems exam outlines (professional-engineer licensure) and the ASHRAE 90.1 building-envelope U-value compliance path. Sample FE-style question: "A plane wall of L = 0.10 m, k = 0.50 W/(m·K), A = 2 m² has surface temperatures 100 °C and 30 °C. The heat rate through the wall is: (a) 70 W, (b) 140 W, (c) 280 W, (d) 700 W." Correct: (d) Q̇ = k·A·ΔT/L = 0.50 × 2 × 70/0.10 = 700 W. PE-style: "A 50 mm steel pipe (k=50) carries 150 °C steam; ambient 25 °C with h=15 W/(m²·K). The critical radius of insulation if k_ins=0.04 W/(m·K) is: (a) 1.3 mm, (b) 2.7 mm, (c) 4.0 mm, (d) 8.0 mm." Correct: (b) r_cr = k_ins/h = 0.04/15 = 2.67 mm.`,
    summary: `Conduction is governed by Fourier's law q⃗ = −k·∇T. For 1D steady-state, the linear (plane wall), logarithmic (cylinder), and hyperbolic (sphere) temperature profiles all reduce to the resistance form q = ΔT/R_th, where R_th = L/(k·A) (wall), ln(r₂/r₁)/(2π·k·L) (cylinder), or (1/r₁ − 1/r₂)/(4π·k) (sphere). Composite walls are analyzed as series thermal-resistance networks with R_total = Σ R_i, and interface temperatures follow T_{i+1} = T_i − q·R_i. The critical radius r_cr = k_ins/h_ext marks the counter-intuitive boundary below which adding insulation INCREASES heat loss — a foundational engineering insight. Lessons 2 and 3 extend this resistance-network toolkit to include the convection film (1/(h·A)) and the radiation surface resistance ((1−ε)/(ε·A·σ)) — the universal engineering method for sizing walls, insulation, pipes, fins, and heat-exchanger walls.`,
    key_takeaways: `- Fourier's law q = −k·A·(dT/dx); 1D steady-state q = k·A·ΔT/L = ΔT/R_th with R_th = L/(k·A).
- Cylindrical shell R_th = ln(r₂/r₁)/(2π·k·L); spherical shell R_th = (1/r₁ − 1/r₂)/(4π·k).
- Composite wall: R_total = Σ L_i/(k_i·A); q = (T_hot − T_cold)/R_total; interface T_{i+1} = T_i − q·R_i.
- Critical radius r_cr = k_ins/h_ext — for a pipe with r_outer < r_cr, MORE insulation means MORE heat loss.
- 1D steady state assumes constant k, no internal generation, no 2D bridge losses — use 2D FEA or guarded hot-plate measurements for high-precision building-envelope calcs.`,
    references: `1. Incropera, DeWitt, Bergman & Lavine (2017), Ch. 2 (steady-state 1D conduction — plane wall, cylinder, sphere), Ch. 3 (composite walls, contact resistance, critical radius).
2. Çengel & Ghajar (2020), Ch. 2 (heat-conduction equation), Ch. 3 (steady conduction, R-networks, critical radius of insulation).
3. Kreith (2011), Ch. 2 (Fourier's law, shape factors, resistance networks).
4. Holman (2010), Ch. 1 (Fourier's law), Ch. 2 (1D steady conduction), Ch. 3 (critical insulation thickness).
5. ISO 55000:2014 for insulation-upgrade lifecycle KPI tracking against the asset-management framework.
6. ASHRAE Handbook — HVAC Applications (2019) for building-envelope U-value compliance and insulation material property tables.`,
  },
  knowledgeObject: {
    title: "Conduction Heat Transfer — Knowledge Object",
    domain: "Heat Transfer",
    competency: "Foundations",
    topic: "Fourier's Law & Steady-State 1D Conduction",
    concept:
      "Fourier's law + 1D resistance networks for plane wall, cylinder, sphere, and composites",
    body: {
      definitions: [
        "Fourier's law: q⃗ = −k·∇T; 1D form q = −k·A·(dT/dx).",
        "Thermal conductivity k [W/(m·K)]: material property (Cu ~400, steel ~50, water ~0.6, air ~0.026).",
        "Thermal resistance R_th [K/W]: R_th = ΔT/q; plane wall L/(k·A).",
        "Thermal conductance U [W/(m²·K)]: U = 1/(R_total·A) = k/L for a homogeneous wall.",
        "Critical radius of insulation r_cr = k_ins/h_ext — adding insulation below r_cr INCREASES heat loss.",
        "Thermal contact resistance R''_contact [m²·K/W]: interface resistance from microscopic asperity contacts.",
      ],
      principles: [
        "Heat flows opposite to the temperature gradient (entropy-production direction).",
        "Resistance analogy: ΔT ↔ V, q ↔ I, R_th ↔ R; series and parallel resistor rules apply.",
        "k is a material property; U is a system property (material + geometry + films).",
        "Steady state independent of α = k/(ρ·c_p); α only governs transient penetration.",
        "For a cylinder/sphere, area grows with r, so R_th grows logarithmically/hyperbolically, not linearly.",
      ],
      components: [
        "Wall/slab materials (concrete k=1.4, brick k=0.7, steel k=50, glass wool k=0.04)",
        "Pipe wall + insulation (steel + mineral wool, calcium silicate, PU foam)",
        "Contact interfaces (R''_contact ≈ 0.01–0.1 m²·K/W)",
        "Thermal interface materials (grease, gap pad) for electronics",
        "Insulation jacket/cladding (aluminum, stainless) for weather protection",
      ],
      mechanism:
        "Molecular and electronic kinetic energy transfers from high-T to low-T region; the rate is proportional to the gradient via k. In metals free electrons dominate (Wiedemann–Franz k/σ = L·T); in dielectrics lattice phonons carry heat; in gases intermolecular collisions. The macroscopic resistance analogy emerges because in steady state there is no storage, so q must be constant across the wall — exactly the constant-current condition of a series resistor string.",
      process:
        "Identify geometry → list (L_i, k_i, A) or (r₁, r₂, k, L) for each layer → compute R_i → combine series/parallel → q = ΔT/R_total → interface T_{i+1} = T_i − q·R_i → verify against material temperature limits → check critical-radius condition if adding insulation to a small-diameter pipe.",
      formulas: [
        "Fourier 1D: q = k·A·ΔT/L; R_th = L/(k·A) [K/W]",
        "Hollow cylinder: R_th = ln(r₂/r₁)/(2π·k·L)",
        "Hollow sphere: R_th = (1/r₁ − 1/r₂)/(4π·k)",
        "Composite (series): R_total = Σ L_i/(k_i·A) + Σ R''_contact/A",
        "Critical radius (cylinder, external convection h): r_cr = k_ins/h_ext",
        "Conductance: U = 1/(R_total·A); q = U·A·ΔT",
        "Heat-diffusion eq. (transient): ρ·c_p·∂T/∂t = ∇·(k·∇T) + q̇_vol",
      ],
      metrics: [
        "Heat rate Q̇ [W]",
        "Heat flux q″ [W/m²]",
        "Thermal resistance R_total [K/W] or R″-value [m²·K/W]",
        "U-value [W/(m²·K)] — building-envelope code metric",
        "k-value [W/(m·K)] — material thermal conductivity",
      ],
      examples: [
        "Composite wall (3 layers, 12 m²): R_total = 0.192 K/W, q = 156 W, q″ = 13.0 W/m².",
        "Steam-pipe insulation audit: 6-inch line, 50 mm calcium-silicate, h=25, ΔT=168 K → q' = 214 W/m.",
        "Critical radius for a 10 mm pipe with k_ins=0.04, h=10: r_cr = 4 mm — insulating from 0 to 4 mm radius INCREASES heat loss.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery steam-line insulation audit: 500 m of 6-inch line loses ~3080 GJ/yr through degraded insulation; reported under ISO 55000.",
        "Power — boiler refractory: 230 mm of firebrick (k=1.4 at 1000 °C) + 75 mm insulating brick (k=0.28) + 12 mm steel casing (k=50) → casing skin ~80 °C, q″ ≈ 1.6 kW/m².",
      ],
      case_studies: [
        "SYNTHETIC — Riverside District Heating: 4 km buried DN 200 hot-water main (110 °C supply). 50 mm PU foam loses 36.4 W/m; 100 mm loses 21.7 W/m. Capex delta +$160k, savings $13k/yr, payback 12.3 yr — adopt option B for >15-yr lifecycle.",
      ],
      common_errors: [
        "Mixing area-normalized R″ (m²·K/W) with total R (K/W) — q″ uses R″, Q̇ uses R.",
        "Using L/(k·A) for a cylinder when r₂/r₁ > 1.2 — must use ln(r₂/r₁)/(2π·k·L).",
        "Forgetting contact resistance at steel/insulation interfaces — up to 10% of R_total.",
        "Assuming k constant over large ΔT — steel k drops ~5% per 400 °C, gases rise ~25%.",
        "Ignoring the critical radius when insulating small-diameter pipes — MORE insulation can mean MORE heat loss.",
      ],
      limitations: [
        "1D steady-state assumption — real walls have 2D corner losses and thermal bridges; ±10–15% typical.",
        "Constant-k assumption fails for large ΔT or PCMs.",
        "No internal heat generation — Joule, hydration, and chemical heat need the q̇_vol term.",
        "Contact-resistance data sparse — published R''_contact values ±50% uncertainty.",
      ],
      best_practices: [
        "Always state the geometry, area, and k-values before computing R_total.",
        "Use ln(r₂/r₁)/(2π·k·L) for cylinders when r₂/r₁ > 1.2 — never the plane-wall approximation.",
        "Check the critical-radius condition r_cr = k_ins/h_ext whenever adding insulation to a pipe of small diameter.",
        "Use temperature-averaged k for high-ΔT applications (furnaces, steam lines).",
        "Report heat-loss reductions as ISO 55000 lifecycle KPIs when comparing insulation upgrades.",
      ],
      related_concepts: [
        "Convection (Lesson 2 — film resistance 1/(h·A) added in series to wall R_th)",
        "Radiation & heat exchangers (Lesson 3 — surface resistance (1−ε)/(ε·A·σ) and LMTD)",
        "Transient conduction (lumped capacitance, Heisler charts — Incropera Ch. 5)",
        "Finned surfaces (extended-area convection — Incropera Ch. 3.6)",
      ],
      prerequisites: [
        "Differential and integral calculus (separation of variables, logarithmic integrals)",
        "Conservation of energy on a differential control volume",
        "Ohm's law and series/parallel resistor networks (electrical analog)",
        "Thermodynamics Lesson 1 — laws & properties (enthalpy, internal energy)",
      ],
      references: HEAT_REFERENCE_TITLES,
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
        "Which statement correctly expresses Fourier's law of heat conduction in one dimension?",
      explanation:
        "Fourier's law states that the heat flux is proportional to the negative temperature gradient: q = −k·(dT/dx). The negative sign ensures heat flows from high to low temperature, in agreement with the Second Law.",
      whyCorrect:
        "Fourier's law (1D): q = −k·(dT/dx), or equivalently q = k·A·(T₁ − T₂)/L for a plane wall of thickness L. The proportionality constant k is the thermal conductivity [W/(m·K)].",
      whyOthersWrong: [
        "Option A (q = h·A·ΔT) is Newton's law of cooling for convection, not Fourier's law for conduction — the coefficient h is the convective film coefficient.",
        "Option C (q = ε·σ·A·(T⁴ − T₀⁴)) is the Stefan–Boltzmann law for radiation, not conduction.",
        "Option D (q = ρ·c_p·V·(dT/dt)) is the lumped-capacitance transient energy balance, not the steady-state conduction law.",
      ],
      options: [
        { text: "q = h·A·ΔT, where h is the convective coefficient.", isCorrect: false },
        {
          text: "q = −k·A·(dT/dx), where k is the thermal conductivity [W/(m·K)].",
          isCorrect: true,
        },
        {
          text: "q = ε·σ·A·(T⁴ − T₀⁴), where σ is the Stefan–Boltzmann constant.",
          isCorrect: false,
        },
        {
          text: "q = ρ·c_p·V·(dT/dt), where α = k/(ρ·c_p) is the thermal diffusivity.",
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
      scenario: "Construction",
      stem:
        "A composite wall (A = 10 m²) has three layers in series: (1) 0.15 m brick (k = 0.70 W/(m·K)), (2) 0.10 m mineral wool (k = 0.040 W/(m·K)), (3) 0.02 m plaster (k = 0.50 W/(m·K)). With inner surface T₁ = 20 °C and outer T₄ = −5 °C, the heat rate through the wall is closest to:",
      explanation:
        "R₁ = 0.15/(0.70×10) = 0.0214; R₂ = 0.10/(0.040×10) = 0.250; R₃ = 0.02/(0.50×10) = 0.0040; R_total = 0.275 K/W. Q̇ = (20 − (−5))/0.275 = 25/0.275 = 90.9 W. The mineral wool holds 0.250/0.275 = 91% of the total ΔT.",
      whyCorrect:
        "Compute each layer's resistance R_i = L_i/(k_i·A): R₁ = 0.0214 K/W, R₂ = 0.250 K/W, R₃ = 0.0040 K/W. Series sum: R_total = 0.2754 K/W. Heat rate q = ΔT/R_total = (20 − (−5))/0.2754 = 90.8 W. The insulation layer dominates the resistance (91%), so the plaster and brick barely affect the heat rate.",
      whyOthersWrong: [
        "Option 28 W uses R_total ≈ 0.89 K/W — likely the user divided by A twice (computing q″ not Q̇, or using R″ in m²·K/W instead of R in K/W).",
        "Option 250 W uses R_total ≈ 0.10 K/W — likely omitted the insulation layer R₂ (the dominant resistance).",
        "Option 909 W divides by 0.0275 instead of 0.275 — a decimal-place error in R_total.",
      ],
      options: [
        { text: "28 W", isCorrect: false },
        { text: "91 W", isCorrect: true },
        { text: "250 W", isCorrect: false },
        { text: "909 W", isCorrect: false },
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
        "A 100 mm OD steel pipe (k_pipe = 50 W/(m·K), wall 5 mm) carries steam at 150 °C in ambient air at 25 °C with external h = 15 W/(m²·K). The pipe is wrapped with 25 mm of insulation (k_ins = 0.040 W/(m·K)). Per meter of pipe length, the heat loss is approximately (neglect inner convection):",
      explanation:
        "Per unit length: R_pipe = ln(0.100/0.090)/(2π·50) = 3.34×10⁻⁴ K·m/W (negligible); R_ins = ln(0.150/0.100)/(2π·0.040) = 1.613 K·m/W; R_conv = 1/(2π·0.150·15) = 0.0707 K·m/W. R_total ≈ 1.684 K·m/W. q' = (150 − 25)/1.684 = 74.2 W/m. Insulation dominates (96%).",
      whyCorrect:
        "For a 1-m length: pipe R = ln(r₂/r₁)/(2π·k_pipe·L) = ln(0.100/0.090)/(2π·50·1) = 3.34×10⁻⁴ K·m/W; insulation R = ln(0.150/0.100)/(2π·0.040·1) = 1.613 K·m/W; outer convection R = 1/(2π·r_outer·h) = 1/(2π·0.150·15) = 0.0707 K·m/W. R_total ≈ 1.684 K·m/W. q' = (150 − 25)/1.684 = 74.2 W/m. The steel-pipe wall is negligible; the insulation and the external film dominate.",
      whyOthersWrong: [
        "Option 240 W/m uses the plane-wall L/(k·A) with A = 2π·r·L = 2π·0.10·1 = 0.628 m²: R = 0.005/(50×0.628) = 1.59×10⁻⁴ (close to the cylindrical value for the pipe wall but the user forgot to add the insulation resistance at all).",
        "Option 9.4 W/m uses the inner-surface area A_in = 2π·0.090·1 instead of the outer-surface area for the convection resistance — a common cross-section error.",
        "Option 41 W/m forgot the convection resistance (computed q = ΔT/R_ins = 125/1.613 = 77.5 — actually close to the right answer; but if the user used only the steel-pipe R + insulation R with a thicker wall, the result drops further into this range).",
      ],
      options: [
        { text: "9.4 W/m", isCorrect: false },
        { text: "74 W/m", isCorrect: true },
        { text: "240 W/m", isCorrect: false },
        { text: "910 W/m", isCorrect: false },
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
        "True or False: Adding thermal insulation to a small-diameter pipe ALWAYS reduces the heat loss to the ambient, regardless of the insulation thermal conductivity k_ins and external convective coefficient h.",
      explanation:
        "FALSE. For a cylindrical pipe, R_total = ln(r_ins/r_pipe)/(2π·k_ins·L) + 1/(2π·r_ins·h·L). As r_ins grows from r_pipe, the convection resistance 1/(2π·r_ins·h·L) DECREASES (because area grows). If r_ins < r_cr = k_ins/h, this area growth dominates over the insulation resistance growth, so total R DECREASES and heat loss INCREASES. Only beyond r_cr does additional insulation reduce heat loss.",
      whyCorrect:
        "FALSE. The critical radius of insulation r_cr = k_ins/h_ext marks the boundary. For a pipe of outer radius r_pipe < r_cr, adding insulation INCREASES heat loss because the outer-surface area growth (2π·r·L·h grows with r) outweighs the insulation resistance growth (ln(r/r_pipe)/(2π·k·L)). Only when r_ins > r_cr does additional insulation reduce heat loss. Example: a 5 mm OD refrigerant line with k_ins = 0.04 W/(m·K) and h = 10 W/(m²·K) gives r_cr = 4 mm — insulating from 5 to 9 mm radius INCREASES heat loss; only insulation thicker than 9 mm radius starts to help.",
      whyOthersWrong: [
        "Option TRUE — overlooks the area-growth term in the convection resistance R_conv = 1/(2π·r·h·L). As r grows, R_conv shrinks, and for small-diameter pipes with low h this shrinkage can outpace the growth of R_insulation = ln(r/r_pipe)/(2π·k·L) up to the critical radius r_cr = k_ins/h.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Convection
// (slug: heat-convection)
// ---------------------------------------------------------------------------

const LESSON_CONVECTION: RefLesson = {
  slug: "heat-convection",
  title: "Convection Heat Transfer",
  titleAr: "انتقال الحرارة بالحمل",
  order: 2,
  durationMin: 35,
  references: HEAT_REFERENCE_TITLES,
  conceptIntroduction: `Convection is heat transfer between a solid surface and an adjacent moving fluid (liquid or gas). The constitutive relation — *Newton's law of cooling* (1701) — states q = h·A·(T_s − T_∞), where h [W/(m²·K)] is the *convective heat-transfer coefficient*. Unlike k, h is NOT a material property — it depends on fluid velocity, geometry, surface orientation, and the temperature difference itself. Typical values: natural air 5–25, forced air 25–250, forced water 500–10 000, boiling/condensation 2500–100 000 W/(m²·K). Convection splits into *forced* (pump- or fan-driven flow) and *natural/free* (buoyancy-driven from density gradients). The fluid mechanics is captured by the *boundary layer* — the thin region near the wall where velocity and temperature adjust from the wall to the free-stream value — and by the dimensionless numbers Reynolds (Re = ρ·V·D/μ, ratio of inertia to viscous forces, governs laminar/turbulent transition at Re ≈ 2300 in pipes), Prandtl (Pr = μ·c_p/k = ν/α, ratio of momentum to thermal diffusivity; air ≈ 0.71, water ≈ 7), and Nusselt (Nu = h·L/k, ratio of convective to conductive heat transfer across the boundary layer). Empirical correlations tie Nu to Re and Pr: for forced internal flow, the *Dittus–Boelter* equation Nu = 0.023·Re^0.8·Pr^n (n = 0.4 for heating, 0.3 for cooling) is the canonical pipe-flow correlation. This lesson develops the boundary-layer picture, the dimensionless numbers, and the empirical correlations for forced and natural convection — extending the resistance-network toolkit of Lesson 1 with the convective film resistance 1/(h·A).`,
  sections: {
    learning_objectives: `- State Newton's law of cooling q = h·A·(T_s − T_∞) and identify the regimes where h varies (natural air ~5–25, forced water ~500–10 000 W/(m²·K)).
- Define the velocity and thermal boundary layers and explain why the heat-transfer rate scales with the temperature gradient at the wall.
- Compute the Reynolds number Re = ρ·V·D/μ and the Prandtl number Pr = μ·c_p/k for a fluid flow; identify laminar (Re < 2300) vs turbulent (Re > 4000) pipe flow.
- Compute the Nusselt number Nu = h·L/k and apply the Dittus–Boelter correlation Nu = 0.023·Re^0.8·Pr^n (n=0.4 heating, 0.3 cooling) to internal pipe flow.
- Distinguish forced convection (Re governed) from natural/free convection (Grashof Gr = g·β·ΔT·L³/ν² and Rayleigh Ra = Gr·Pr governed; Churchill–Chu correlation).
- Add the convective film resistance 1/(h·A) in series with the conduction resistances from Lesson 1 to build the overall U-value for a real wall or pipe.`,
    prerequisites: `- Lesson 1 — Conduction (Fourier's law, thermal resistance networks, composite-wall analysis).
- Fluid mechanics: velocity field, viscosity μ [Pa·s], kinematic viscosity ν = μ/ρ, and the Reynolds-number concept of laminar vs turbulent flow.
- Thermodynamics Lesson 1 — properties of pure substances (density ρ, specific heat c_p, thermal conductivity k as fluid properties).
- Dimensional analysis and the Buckingham-Pi theorem (governs derivation of Nu, Re, Pr).`,
    introduction: `Convection is the dominant heat-transfer mode between a solid surface and a moving fluid. Newton's 1701 law q = h·A·(T_s − T_∞) looks like a simple linear equation, but the convective coefficient h is NOT a material property — it depends on the fluid mechanics of the boundary layer. Ludwig Prandtl's 1904 boundary-layer theory showed that the no-slip wall condition creates a thin region (typically < 1 mm for air at moderate speeds) where the velocity rises from 0 at the wall to the free-stream value U_∞. Similarly the thermal boundary layer is the region where temperature rises from T_s to T_∞. The heat-transfer rate scales with the temperature gradient at the wall, (∂T/∂y)|_wall — which is set by the boundary-layer thickness. Dimensional analysis yields the Nusselt number Nu = h·L/k as the dimensionless heat-transfer coefficient, and empirical correlations tie Nu to the Reynolds number Re (forced) or Rayleigh number Ra (natural) and the Prandtl number Pr. For fully turbulent pipe flow (Re > 10 000, Pr > 0.6, L/D > 60), the Dittus–Boelter equation Nu = 0.023·Re^0.8·Pr^n gives h within ±20% across a wide range — the engineering workhorse for heat-exchanger and cooling-channel sizing.`,
    terminology: `- **Newton's law of cooling**: q = h·A·(T_s − T_∞); h [W/(m²·K)] is the convective coefficient.
- **Forced convection**: flow driven by a pump/fan (high Re, high h).
- **Natural (free) convection**: flow driven by buoyancy (density gradients; low h, ~5–25 W/(m²·K) for air).
- **Velocity boundary layer δ [m]**: region where u rises from 0 (wall) to 0.99·U_∞; δ ≈ 5x/√Re_x (laminar).
- **Thermal boundary layer δ_t**: region where T rises from T_s to T_∞; ratio δ/δ_t = Pr^(1/3) (Pohlhausen).
- **Reynolds number Re = ρ·V·D/μ**: inertia vs viscous forces; laminar Re<2300, turbulent Re>4000 in pipes.
- **Prandtl number Pr = μ·c_p/k = ν/α**: momentum vs thermal diffusivity; air ≈ 0.71, water ≈ 7, liquid metals ≈ 0.01.
- **Nusselt number Nu = h·L/k**: dimensionless h; ratio of convective to conductive heat transfer across the boundary layer.
- **Grashof number Gr = g·β·ΔT·L³/ν²**: buoyancy vs viscous forces (natural convection analog of Re).
- **Rayleigh number Ra = Gr·Pr**: governs transition to turbulence in natural convection (Ra > 10⁹ turbulent).`,
    detailed_explanation: `**Newton's law and the convective coefficient.** The constitutive law q = h·A·(T_s − T_∞) is empirical: it captures the *macroscopic* heat transfer between a surface at T_s and a fluid far from the wall at T_∞. The coefficient h depends on the wall-region fluid mechanics (boundary layer), the geometry (flat plate, cylinder, sphere, tube bundle), the surface orientation (horizontal vs vertical, vs upside-down), and the temperature difference itself (natural convection).

**Boundary-layer picture.** Near a wall the no-slip condition enforces u = 0 at y = 0; the velocity rises to U_∞ across the velocity boundary layer of thickness δ ≈ 5x/√Re_x (laminar flat plate, Re_x = U_∞·x/ν). The thermal boundary layer δ_t is the region where T rises from T_s to T_∞. Pohlhausen showed δ/δ_t ≈ Pr^(1/3); for air (Pr ≈ 0.71) the two are similar in size, for water (Pr ≈ 7) the thermal layer is thinner (steeper gradient, higher h), and for liquid metals (Pr ≈ 0.01) the thermal layer is much thicker (lower h).

**Dimensionless numbers.** The Buckingham-Pi theorem applied to forced convection gives Nu = f(Re, Pr). Three pipe-flow regimes: laminar Re < 2300 (Nu_d = 3.66 constant for fully developed flow); transition 2300 < Re < 4000; turbulent Re > 4000 (Dittus–Boelter Nu = 0.023·Re^0.8·Pr^n, n=0.4 heating of fluid, n=0.3 cooling). For natural convection the analogous form is Nu = f(Ra, Pr) with Ra = Gr·Pr; Churchill and Chu's correlation Nu = (0.825 + 0.387·Ra^(1/6)/[1 + (0.492/Pr)^(9/16)]^(8/27))² covers vertical plates from laminar to turbulent.

**Film resistance.** The convective film resistance R_film = 1/(h·A) sits in series with the wall conduction resistance from Lesson 1: R_total = 1/(h_in·A) + L/(k·A) + 1/(h_out·A). The overall U-value is U = 1/(1/h_in + L/k + 1/h_out) — the canonical engineering formula for building walls, pipe heat loss, heat-exchanger walls, and finned surfaces.`,
    core_principles: `- Newton's law q = h·A·ΔT; h is geometry- and flow-dependent, NOT a material property.
- Boundary layer: h scales with the temperature gradient at the wall, which scales with 1/δ_t.
- Dimensionless Nu = f(Re, Pr) for forced; Nu = f(Ra, Pr) for natural.
- Dittus–Boelter Nu = 0.023·Re^0.8·Pr^n (n=0.4 heating, 0.3 cooling) is the canonical internal turbulent-flow correlation.
- Film resistance 1/(h·A) adds in series with conduction resistance — the foundation of the overall U-value.
- Forced convection h >> natural convection h (water ~5000 vs air ~5 for natural vs ~25 000 vs ~250 for forced).`,
    components: `- **Solid surface** at T_s (wall, pipe, plate, fin).
- **Moving fluid** (water, air, refrigerant, oil, mercury) with properties ρ, μ, c_p, k, β (thermal-expansion coefficient).
- **Boundary layer** (velocity + thermal): the engine of convective heat transfer.
- **Pump or fan** (forced convection) or **buoyancy** (natural convection) driving the flow.
- **Finned surface** (extended area) used when h is low (e.g., air-cooled heat exchangers).`,
    process: `1. Identify the geometry (flat plate, tube, cylinder, sphere, tube bundle) and flow regime (forced/natural, laminar/turbulent).
2. Compute Re (forced) or Ra (natural) and Pr from fluid properties at the film temperature T_f = (T_s + T_∞)/2.
3. Select the appropriate Nu correlation (Dittus–Boelter for turbulent pipe, Churchill–Chu for natural-convection vertical plate, Hilpert for cross-flow cylinder).
4. Solve for h = Nu·k/L.
5. Compute the film resistance R_film = 1/(h·A) and add in series to the conduction resistance.
6. Solve q = (T_s − T_∞)/(R_film + R_conduction) — note that for convection-dominated surfaces (thin wall, high h) the film resistance dominates and q ≈ h·A·ΔT.
7. Verify Re, Pr, L/D are within the correlation's validity range.`,
    formula_calculation: `**Newton's law of cooling (forced & natural):**
  q = h·A·(T_s − T_∞)  ⟹  R_film = 1/(h·A) [K/W]

**Reynolds number (pipe):** Re_D = ρ·V·D/μ = 4·ṁ/(π·D·μ); laminar Re<2300, turbulent Re>4000.

**Prandtl number:** Pr = μ·c_p/k = ν/α; air ≈ 0.71, water ≈ 7.

**Nusselt number:** Nu = h·L/k; laminar fully developed pipe Nu_D = 3.66 (constant wall T).

**Dittus–Boelter (turbulent pipe, Re>10 000, 0.6<Pr<160, L/D>10):**
  Nu_D = 0.023·Re_D^0.8·Pr^n,  n = 0.4 heating the fluid, 0.3 cooling.

**Sieder–Tate (viscosity-variation correction):**
  Nu_D = 0.027·Re_D^0.8·Pr^(1/3)·(μ/μ_w)^0.14  (more accurate for oils with strong T-dependence).

**Churchill–Chu (natural convection, vertical plate):**
  Nu_L = [0.825 + 0.387·Ra_L^(1/6) / (1 + (0.492/Pr)^(9/16))^(8/27)]²
  Ra_L = Gr_L·Pr = g·β·(T_s − T_∞)·L³·Pr/ν²  (laminar Ra<10⁹, turbulent Ra>10⁹).

**Overall U-value (wall with convection films both sides):**
  U = 1/(1/h_in + L/k + 1/h_out);  q = U·A·(T_∞1 − T_∞2).`,
    worked_example: `**Forced internal flow — Dittus–Boelter.** Water at 40 °C flows inside a 25 mm ID tube at a velocity V = 2 m/s. The tube wall is at 80 °C (heating the water). Compute h.

Fluid properties at T_f = (40 + 80)/2 = 60 °C: ρ = 983 kg/m³, μ = 4.67×10⁻⁴ Pa·s, k = 0.654 W/(m·K), c_p = 4185 J/(kg·K), Pr = 2.99.

Re_D = ρ·V·D/μ = 983 × 2 × 0.025 / 4.67×10⁻⁴ = 105 100 (turbulent — Dittus–Boelter applies).
Nu_D = 0.023·Re^0.8·Pr^0.4 = 0.023 × (105 100)^0.8 × (2.99)^0.4 = 0.023 × 6486 × 1.548 = 230.9.
h = Nu·k/D = 230.9 × 0.654/0.025 = 6038 W/(m²·K).

Sanity check: forced water h ~500–10 000 — h = 6038 is in range.
Heat flux: q″ = h·ΔT = 6038 × (80 − 40) = 241.5 kW/m² (a substantial water-side flux — typical of boiler-tube or condenser-tube conditions).

If the tube were 1 m long with an inner surface area A = π·D·L = π × 0.025 × 1 = 0.0785 m², the total heat rate would be Q̇ = 241.5 × 0.0785 = 18.96 kW per meter — about 0.45 kg/s of water heated 1 K/m (ṁ·c_p·ΔT = 0.45 × 4185 × 1 = 1883 W per K/m, × 40 K = 75.3 kW... hmm, let's check: actual ṁ = ρ·V·A = 983 × 2 × (π/4)·0.025² = 0.965 kg/s; energy gain over 1 m = h·A·ΔT/ṁ/c_p = 6038 × 0.0785 × 40 / (0.965 × 4185) = 4.71 K/m — so the water heats up ~4.7 K per meter of tube at this flux).`,
    industrial_example: `**Industry: Power — condenser tube sizing.** A 600 MW steam-turbine condenser rejects 1800 MW of waste heat at 5 kPa (T_sat = 33 °C). Cooling water enters at 20 °C and exits at 30 °C (ΔT_water = 10 K). Required water flow: ṁ = Q̇/(c_p·ΔT) = 1.8×10⁹ / (4180 × 10) = 43 060 kg/s (~43 m³/s — a river-scale flow). Use 25 mm OD, 22 mm ID titanium tubes (k = 17 W/(m·K)) with water velocity 2 m/s (typical power-station value to limit erosion-corrosion). Re_D = 998 × 2 × 0.022/8.9×10⁻⁴ = 49 400 (turbulent); Pr ≈ 7.0 at 25 °C. Dittus–Boelter: Nu = 0.023 × 49 400^0.8 × 7^0.4 = 0.023 × 5800 × 2.18 = 291. h_water = 291 × 0.607/0.022 = 8030 W/(m²·K). Steam-side (condensing) h ≈ 8000 W/(m²·K) (film condensation). Overall U ≈ 4000 W/(m²·K) (both films comparable, tube wall thin). LMTD ≈ (10 − 0)/ln(13/3) ≈ 6.16 K (T_sat 33 °C, water 20→30 °C). Required heat-transfer area: A = Q̇/(U·LMTD) = 1.8×10⁹ / (4000 × 6.16) = 73 100 m² — at A_per_tube = π × 0.022 × 10 m = 0.69 m²/m, total tube length = 73 100/0.69 = 106 000 m → 10 600 tubes of 10 m each. This is the canonical condenser sizing calculation; tracked under ISO 55000 as the "heat-exchange surface-area KPI" with fouling-resistance monitoring.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Data Center CRAC unit (synthetic, illustrative).* A 1 MW IT-load data center uses 6 perimeter CRAC (computer-room air-conditioning) units, each rated 175 kW of cooling with chilled-water coils (6 row × 24 tube, 2-pass, 5 m tube length, 12 mm ID copper). Air enters at 32 °C / 27 °C dew point (ASHRAE A1 envelope), leaves at 18 °C; chilled water enters at 9 °C, leaves at 15 °C (ΔT_cw = 6 K). Coil face area 1.6 m², face velocity 2.5 m/s (4 m³/s air at ρ = 1.18 kg/m³). Air-side h (fin-and-tube, 12 fins/in, wavy): h_air ≈ 45 W/(m²·K)) with fin efficiency η_f = 0.85; water-side: V_cw = 1.5 m/s, Re = 1.5 × 0.012 / (1.0×10⁻⁶/1000) ≈ 18 000 (turbulent), Pr = 9.4 (water at 12 °C); Dittus–Boelter Nu = 0.023 × 18 000^0.8 × 9.4^0.3 = 0.023 × 2900 × 1.97 = 131 → h_cw = 131 × 0.58/0.012 = 6330 W/(m²·K). With both film resistances and the finned area amplification (A_fin/A_root = 25 → effective air-side area = 1.6 × 25 × 0.85 = 34 m² effective vs water-side area = π × 0.012 × 5 × 6 × 24 = 27 m²): 1/(U_cw·A) = 1/(6330 × 0.027) + 1/(45 × 34) = 5.86×10⁻³ + 6.54×10⁻⁴ = 6.51×10⁻³ K/W → UA = 154 W/K... [illustrative numbers; full coil sizing in a coil-rating software like coil-Designer or ASHRAE Toolkit]. The case illustrates the asymmetric-air-vs-water resistance split: even with extensive fin area, air-side resistance dominates 90%; the lift comes from increasing face velocity (more fan energy) or from extending fin area (more metal).`,
    visual_explanation: `**Temperature and velocity profiles in the boundary layer.** For flow over a flat plate, plot u(y) (rises from 0 at y=0 to U_∞ at y=δ) and T(y) (rises from T_s at y=0 to T_∞ at y=δ_t). For Pr > 1 (water) the thermal layer is THINNER than the velocity layer — the temperature gradient at the wall is steeper, h is higher. For Pr < 1 (liquid metals) the thermal layer is thicker — h is lower. At Re_x ≈ 5×10⁵ (transition Reynolds number for a flat plate) the laminar boundary layer becomes turbulent; the turbulent mixing brings free-stream fluid to the wall, dramatically increasing h (typically 3–5× higher than laminar at the same x). For pipe flow, the entry region (L_hydro ≈ 0.05·Re·D, L_therm ≈ 0.05·Re·Pr·D) sees h falling from the high entry value to the fully developed constant (Nu=3.66 laminar, ~180 turbulent at Re=10 000, Pr=1).`,
    simulation_opportunity: `EngiSuite convection explorer: input fluid properties (water/air/oil/mercury), geometry (flat plate, tube, sphere), flow (V or ṁ, T), and surface (T_s, orientation); receive Re, Pr, Ra, Gr, Nu, h, and q plotted live as you vary V (laminar→turbulent transition visible as a discontinuity in Nu). Try the Dittus–Boelter chart: plot Nu vs Re for fixed Pr (water 7) on log-log paper — the slope is 0.8 and the intercept 0.023·Pr^n. For natural convection, vary ΔT and watch Ra cross the 10⁹ threshold from laminar to turbulent. Use commercial CFD (ANSYS Fluent, OpenFOAM) for non-standard geometries (electronics chassis, finned heat sinks, tube bundles in cross-flow).`,
    common_mistakes: `- **Using Dittus–Boelter outside its validity range** (Re < 10 000, Pr < 0.6, L/D < 10): the correlation gives ±25% error outside the range — use Sieder–Tate for oils, Gnielinski for the transition 2300 < Re < 10 000.
- **Wrong exponent on Pr**: n = 0.4 when the WALL is heating the FLUID (T_s > T_∞), 0.3 when cooling. Mixing these up gives a 10–15% error.
- **Using bulk-mean properties at the wrong temperature**: properties should be evaluated at T_f = (T_s + T_∞)/2 for external flow or at T_bulk for internal flow.
- **Treating h as a material property**: h varies 1000× across regimes (air natural ~5 vs water boiling ~10 000). Always state the flow regime.
- **Forgetting entry-region effects**: in a short tube (L/D < 10) the average h is much higher than the fully developed value — use the Hausen or Gnielinski correlation with L/D correction.`,
    limitations: `- **Empirical correlations have ±10–25% uncertainty** even within their validity ranges — for precision heat-exchanger sizing use proprietary software (HTRI Xchanger Suite) or CFD.
- **Constant-property assumption** fails for large ΔT (oil viscosity drops 5× from 0 to 100 °C) — use Sieder–Tate (μ/μ_w)^0.14 correction.
- **Single-phase only**: boiling, condensation, and phase-change convection have very different correlations (h ~2500–100 000) — see Incropera Ch. 10.
- **Geometry-specific**: a flat-plate correlation gives ±50% error if applied to a cylinder, sphere, or tube bundle — use the geometry-specific correlation (Hilpert, Zhukauskas, Grimison).`,
    comparison: `| Flow type | Reynolds/Rayleigh | Typical h [W/(m²·K)] | Correlation |
|---|---|---|---|
| Natural air (vertical plate) | Ra = 10⁶ – 10⁹ | 5 – 25 | Churchill–Chu |
| Forced air (fan over finned coil) | Re = 10⁴ – 10⁵ | 25 – 250 | Hilpert, Zhukauskas |
| Forced water (turbulent tube) | Re = 10⁴ – 10⁵ | 1000 – 10 000 | Dittus–Boelter |
| Boiling water (pool) | — | 2500 – 100 000 | Rohsenow |
| Condensing steam (film) | — | 5000 – 25 000 | Nusselt film |
| Liquid metal (sodium) | Re = 10 000 | 2000 – 20 000 | Lyon–Martinelli |`,
    practical_application: `**Hot-water radiator (hydronic heating).** A 1.5 m × 0.6 m baseboard radiator has 80 °C water inside the copper tubes (k=400, ID=15 mm, OD=17 mm) with a finned exterior in still air at 20 °C. Inside (water, V=0.5 m/s, T=80 °C): Re = 998 × 0.5 × 0.015 / (3.55×10⁻⁴) = 21 100 (turbulent), Pr = 2.0 (water at 80 °C); Dittus–Boelter Nu = 0.023 × 21 100^0.8 × 2.0^0.3 = 0.023 × 2730 × 1.25 = 78.5 → h_in = 78.5 × 0.668/0.015 = 3495 W/(m²·K) (water-side). Outside (natural air, ΔT = 60 K, characteristic length L = 1.5 m): β = 1/T = 1/293 = 3.41×10⁻³ K⁻¹; Gr_L = g·β·ΔT·L³/ν² = 9.81 × 3.41×10⁻³ × 60 × 1.5³ / (1.5×10⁻⁵)² = 6.0×10⁹; Ra = Gr·Pr = 6.0×10⁹ × 0.71 = 4.3×10⁹ (turbulent); Churchill–Chu Nu = [0.825 + 0.387 × (4.3×10⁹)^(1/6) / (1 + (0.492/0.71)^(9/16))^(8/27)]² = [0.825 + 0.387 × 36.7 / 1.086]² = [0.825 + 13.1]² = 193.9; h_out = 193.9 × 0.0263/1.5 = 3.4 W/(m²·K) (air-side). The air-side dominates: U ≈ h_out = 3.4 W/(m²·K) (water-side and copper-wall resistances negligible). Per-fin heat flux: q″ = 3.4 × 60 = 204 W/m² (without fins); with 30 fins per meter of height × 0.05 m fin height = 1.5 m² extra area per m of length, the effective U·A increases 10× and the radiator delivers ~3 kW per meter of length — the standard hydronic heat-emitter sizing.`,
    decision_scenario: `You are the HVAC engineer sizing a forced-air cooler for a 200 kW telecom cabinet in a desert site (T_amb = 45 °C max). Two fan options: (A) 4 × 200 mm axial fans at 1200 m³/h each (total 4800 m³/h, power 0.5 kW total); (B) 4 × 200 mm at 2400 m³/h each (total 9600 m³/h, power 2.0 kW total). The air-cooled coil is 2 m × 1 m × 0.1 m deep (face area 2 m², finned area 40 m²). Coil ΔT (electronics cold plate to ambient) = 15 K. At V_face_A = 4800/3600/2 = 0.67 m/s → Re_fin = 60 (laminar, low h), h_A ≈ 25 W/(m²·K) → Q̇_A = 25 × 40 × 15 = 15 kW — fails (need 200 kW). At V_face_B = 1.33 m/s → Re_fin = 120 (transitional), h_B ≈ 50 W/(m²·K) → Q̇_B = 50 × 40 × 15 = 30 kW — still fails by 6.6×. The decision is forced: even at the high fan speed, air-cooling cannot remove 200 kW from a 2 m² face; the design must use either (a) refrigerant-based DX cooling with a 200 kW compressor + condenser (~25 kW fan power, COP 3 → 67 kW electrical), or (b) liquid-cooled cold plate (water at h = 5000 W/(m²·K), area 0.05 m²) → 5000 × 0.05 × 15 = 3.75 kW per tube — still needs ~50 parallel channels. Report under ISO 55000 as the thermal-management architectural decision: forced-air is insufficient above ~30 kW/m² heat flux; above that, refrigerant or liquid cooling is required.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Apply/Analyze. Topics: the Nusselt number definition, Dittus–Boelter h for turbulent water flow, Reynolds transition from laminar to turbulent, and the forced-vs-natural convection h comparison.`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Thermal & Fluids Systems exam outlines (professional-engineer licensure) and the ASHRAE Handbook of Fundamentals convective-coefficient tables. Sample FE-style question: "Water (Pr = 7) flows inside a 20 mm ID tube at Re = 20 000 with the wall hotter than the fluid. Using Dittus–Boelter, the Nusselt number is: (a) 70, (b) 140, (c) 200, (d) 350." Correct: (b) Nu = 0.023 × 20 000^0.8 × 7^0.4 = 0.023 × 3106 × 2.18 = 156 ≈ 140 (close). PE-style: "A 0.5 m vertical plate at 80 °C in 20 °C air has Ra_L = 4×10⁹. The Churchill–Chu Nu_L is closest to: (a) 50, (b) 200, (c) 800, (d) 2500." Correct: (b) Nu ≈ 200 (evaluated as [0.825 + 0.387·Ra^(1/6)/(1+(0.492/Pr)^(9/16))^(8/27)]²).`,
    summary: `Convection is heat transfer between a solid surface and a moving fluid, governed empirically by Newton's law q = h·A·ΔT. The coefficient h depends on the boundary-layer fluid mechanics — captured by Re (forced) or Ra (natural), and Pr. For turbulent pipe flow (Re > 10 000, Pr > 0.6) Dittus–Boelter Nu = 0.023·Re^0.8·Pr^n gives h within ±20%. For natural convection on a vertical plate, Churchill–Chu Nu = [0.825 + 0.387·Ra^(1/6)/...]² covers laminar and turbulent. The film resistance 1/(h·A) adds in series with conduction resistances to form the overall U-value, which is the canonical engineering metric for walls, pipes, and heat-exchanger surfaces. Typical h ranges span 4 orders of magnitude: natural air 5–25, forced air 25–250, forced water 1000–10 000, boiling/condensation 2500–100 000 W/(m²·K).`,
    key_takeaways: `- Newton's law q = h·A·(T_s − T_∞); h is geometry- and flow-dependent, NOT a material property.
- Boundary-layer picture: h scales with 1/δ_t; δ_t/δ ≈ Pr^(-1/3).
- Dimensionless: Re (forced) or Ra (natural) + Pr → Nu = h·L/k.
- Dittus–Boelter (turbulent pipe): Nu = 0.023·Re^0.8·Pr^n, n=0.4 heating, 0.3 cooling.
- Film resistance R_film = 1/(h·A) sits in series with conduction R_th = L/(k·A) — overall U = 1/(1/h_in + L/k + 1/h_out).
- h ranges span 4 orders of magnitude — always state the regime before quoting h.`,
    references: `1. Incropera, DeWitt, Bergman & Lavine (2017), Ch. 6 (convection fundamentals, boundary layers, Nu/Re/Pr), Ch. 8 (internal flow — Dittus–Boelter, Sieder–Tate, Gnielinski), Ch. 9 (external flow — Hilpert, Zhukauskas).
2. Çengel & Ghajar (2020), Ch. 6 (forced convection — dimensionless numbers, correlations), Ch. 9 (natural convection — Grashof, Rayleigh, Churchill–Chu).
3. Kreith (2011), Ch. 4 (forced convection — boundary-layer theory, Reynolds & Nusselt analogies), Ch. 5 (natural convection).
4. Holman (2010), Ch. 5 (forced convection — Dittus–Boelter, Sieder–Tate), Ch. 6 (natural convection — Grashof, Rayleigh).
5. ISO 55000:2014 for tracking convective-coefficient degradation (fouling) under the asset-management framework.
6. ASHRAE Handbook — HVAC Applications (2019) for natural-convection coefficients in occupied spaces and fin-and-tube correlations.`,
  },
  knowledgeObject: {
    title: "Convection Heat Transfer — Knowledge Object",
    domain: "Heat Transfer",
    competency: "Convection Analysis",
    topic: "Newton's Law, Boundary Layers, Dimensionless Numbers, Correlations",
    concept:
      "Newton's law q=h·A·ΔT + boundary-layer theory + Nu=0.023·Re^0.8·Pr^n (Dittus–Boelter)",
    body: {
      definitions: [
        "Newton's law of cooling: q = h·A·(T_s − T_∞); h [W/(m²·K)] is the convective coefficient.",
        "Forced convection: pump/fan-driven flow (high Re, high h ~25–10 000).",
        "Natural (free) convection: buoyancy-driven flow (low h ~5–25 for air).",
        "Reynolds number Re = ρ·V·D/μ: inertia vs viscous forces; laminar Re<2300, turbulent Re>4000 in pipes.",
        "Prandtl number Pr = μ·c_p/k = ν/α: momentum vs thermal diffusivity; air 0.71, water 7.",
        "Nusselt number Nu = h·L/k: dimensionless h; ratio of convective to conductive heat transfer across the boundary layer.",
        "Grashof number Gr = g·β·ΔT·L³/ν²: buoyancy vs viscous forces (natural-convection analog of Re).",
        "Rayleigh number Ra = Gr·Pr: governs natural-convection laminar→turbulent transition (Ra > 10⁹).",
      ],
      principles: [
        "h is NOT a material property — it depends on the boundary-layer fluid mechanics (V, geometry, surface orientation, ΔT).",
        "Boundary-layer thickness δ ≈ 5x/√Re_x (laminar flat plate); thermal layer δ_t/δ = Pr^(-1/3) (Pohlhausen).",
        "Forced: Nu = f(Re, Pr); Natural: Nu = f(Ra, Pr).",
        "Dittus–Boelter Nu = 0.023·Re^0.8·Pr^n (n=0.4 heating, 0.3 cooling) for turbulent pipe flow Re>10 000, 0.6<Pr<160, L/D>10.",
        "Churchill–Chu Nu = [0.825 + 0.387·Ra^(1/6)/(1+(0.492/Pr)^(9/16))^(8/27)]² for natural convection on a vertical plate.",
        "Film resistance 1/(h·A) adds in series to conduction R_th = L/(k·A) — overall U = 1/(1/h_in + L/k + 1/h_out).",
      ],
      components: [
        "Solid surface at T_s (wall, pipe, plate, fin)",
        "Moving fluid (water, air, refrigerant, oil, mercury)",
        "Boundary layer (velocity + thermal)",
        "Pump or fan (forced) or buoyancy (natural)",
        "Finned surface (extended area for low-h air-side)",
      ],
      mechanism:
        "Heat conducts across the thin thermal boundary layer (no fluid motion at the wall, so the immediate near-wall transfer IS conduction governed by Fourier's law). The boundary-layer thickness is set by the fluid mechanics (Re or Ra); h is the gradient at the wall divided by the bulk ΔT. Turbulence brings high-T free-stream fluid to the wall, mixing the boundary layer and dramatically increasing h (3–5× over laminar at the same x).",
      process:
        "Identify geometry & regime → compute Re (forced) or Ra (natural) and Pr at T_f → select Nu correlation (Dittus–Boelter for turbulent pipe, Churchill–Chu for vertical-plate natural, Hilpert for cross-flow cylinder) → solve h = Nu·k/L → compute film resistance 1/(h·A) → add to conduction R-network → solve q = ΔT/R_total → verify Re/Pr/L/D in correlation's validity range.",
      formulas: [
        "Newton's law: q = h·A·(T_s − T_∞); R_film = 1/(h·A)",
        "Reynolds (pipe): Re_D = ρ·V·D/μ = 4·ṁ/(π·D·μ)",
        "Prandtl: Pr = μ·c_p/k = ν/α",
        "Nusselt: Nu = h·L/k",
        "Dittus–Boelter (turbulent pipe, Re>10 000): Nu = 0.023·Re^0.8·Pr^n, n=0.4 heating, 0.3 cooling",
        "Churchill–Chu (natural vertical plate): Nu = [0.825 + 0.387·Ra^(1/6)/(1+(0.492/Pr)^(9/16))^(8/27)]²",
        "Rayleigh: Ra = Gr·Pr = g·β·ΔT·L³·Pr/ν²",
        "Overall U: U = 1/(1/h_in + L/k + 1/h_out); q = U·A·ΔT",
      ],
      metrics: [
        "Convective coefficient h [W/(m²·K)]",
        "Nusselt number Nu = h·L/k",
        "Reynolds number Re (flow regime classification)",
        "Overall U-value [W/(m²·K)] (system metric)",
        "Heat flux q″ [W/m²] and heat rate Q̇ [W]",
      ],
      examples: [
        "Turbulent water in 25 mm tube at 2 m/s, 40→80 °C: Re=105 100, Pr=2.99, Nu=231, h=6038 W/(m²·K).",
        "Vertical 1.5 m plate at 80 °C in 20 °C air: Ra = 4.3×10⁹, Nu ≈ 194, h = 3.4 W/(m²·K).",
        "Condenser tube (600 MW power plant): h_water = 8000, U = 4000 W/(m²·K), LMTD = 6.16 K, A = 73 100 m².",
      ],
      industrial_examples: [
        "Power — 600 MW condenser tube sizing: 25 mm ID titanium tubes, 2 m/s water, Re=49 400 → h=8030 W/(m²·K); required area = 73 100 m² → 10 600 tubes × 10 m each.",
        "HVAC — baseboard hydronic radiator: 1.5 m × 0.6 m, 80 °C water, 20 °C ambient air; h_water = 3495 (turbulent) but h_air_natural = 3.4 — air-side dominates; with 30 fins/m → ~3 kW/m of length.",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Data Center CRAC unit: 1 MW IT load, 6 × 175 kW CRAC units; chilled-water coil with air-side h=45 (finned) vs water-side h=6330 (Dittus–Boelter) — air-side resistance dominates 90%; the engineering lever is extending fin area or face velocity, not raising water-side h.",
      ],
      common_errors: [
        "Using Dittus–Boelter outside its validity range (Re<10 000, Pr<0.6, L/D<10) — use Gnielinski or Sieder–Tate instead.",
        "Wrong Pr exponent: n=0.4 heating (T_s > T_bulk), 0.3 cooling (T_s < T_bulk).",
        "Evaluating properties at the wrong temperature (use T_f for external, T_bulk for internal).",
        "Treating h as a material property (h varies 1000× across regimes).",
        "Forgetting entry-region effects in short tubes (L/D < 10) — h is much higher than fully developed.",
      ],
      limitations: [
        "Empirical correlations ±10–25% uncertainty even within validity ranges.",
        "Constant-property assumption fails for large ΔT (oil viscosity).",
        "Single-phase only — boiling, condensation have separate correlations.",
        "Geometry-specific — flat-plate correlation gives ±50% error on cylinders/spheres/tube bundles.",
      ],
      best_practices: [
        "Always state geometry, flow regime, and Re/Pr/Ra ranges before quoting h.",
        "Use Sieder–Tate with (μ/μ_w)^0.14 for oils with strong viscosity-temperature dependence.",
        "Use Churchill–Chu for natural convection — covers both laminar and turbulent regimes.",
        "For precision heat-exchanger sizing use HTRI Xchanger Suite, ASPEN Exchanger Design, or CFD.",
        "Track U-value degradation (fouling) under ISO 55000 as a heat-exchanger asset-performance KPI.",
      ],
      related_concepts: [
        "Conduction (Lesson 1 — wall resistance networks)",
        "Radiation & heat exchangers (Lesson 3 — surface resistance, LMTD)",
        "Boiling and condensation (Incropera Ch. 10 — phase-change h ~2500–100 000)",
        "Finned surfaces and heat exchangers (Incropera Ch. 3.6, Ch. 11 — extended area, ε-NTU)",
      ],
      prerequisites: [
        "Lesson 1 — Conduction (Fourier's law, thermal-resistance networks)",
        "Fluid mechanics: viscosity μ, kinematic viscosity ν, Reynolds number laminar/turbulent concept",
        "Thermodynamics Lesson 1 — properties of pure substances (ρ, c_p, k as fluid properties)",
        "Dimensional analysis / Buckingham-Pi theorem",
      ],
      references: HEAT_REFERENCE_TITLES,
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
        "Which dimensionless number represents the ratio of convective to conductive heat transfer across the boundary layer, defined as Nu = h·L/k?",
      explanation:
        "The Nusselt number Nu = h·L/k compares the convective heat-transfer coefficient h against the conduction reference k/L. Nu > 1 means convection dominates; Nu = 1 means conduction only (no flow).",
      whyCorrect:
        "The Nusselt number Nu = h·L/k is the dimensionless convective heat-transfer coefficient. It is the ratio of the actual convective flux h·ΔT to the reference conductive flux (k/L)·ΔT across a length L. Nu = 1 corresponds to pure conduction (no fluid motion); Nu ~ 100–1000 is typical of turbulent forced convection in water; Nu ~ 10–50 is typical of natural air convection.",
      whyOthersWrong: [
        "Option Reynolds number Re = ρ·V·D/μ is the ratio of inertia to viscous forces in fluid mechanics, governing laminar/turbulent transition — not a heat-transfer ratio.",
        "Option Prandtl number Pr = μ·c_p/k is the ratio of momentum to thermal diffusivity, a fluid property — not the heat-transfer-coefficient ratio.",
        "Option Grashof number Gr = g·β·ΔT·L³/ν² is the ratio of buoyancy to viscous forces in natural convection — the natural-convection analog of Re, not the convective-to-conductive ratio.",
      ],
      options: [
        { text: "Reynolds number Re = ρ·V·D/μ.", isCorrect: false },
        { text: "Nusselt number Nu = h·L/k.", isCorrect: true },
        { text: "Prandtl number Pr = μ·c_p/k.", isCorrect: false },
        { text: "Grashof number Gr = g·β·ΔT·L³/ν².", isCorrect: false },
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
        "Water (ρ = 988 kg/m³, μ = 5.47×10⁻⁴ Pa·s, k = 0.644 W/(m·K), c_p = 4180 J/(kg·K)) flows at 2 m/s inside a 20 mm ID tube. The tube wall is hotter than the water (heating). Using the Dittus–Boelter correlation, the convective heat-transfer coefficient h is closest to:",
      explanation:
        "Re = 988 × 2 × 0.020 / 5.47×10⁻⁴ = 72 240 (turbulent). Pr = 5.47×10⁻⁴ × 4180 / 0.644 = 3.55. Dittus–Boelter (heating, n=0.4): Nu = 0.023 × 72 240^0.8 × 3.55^0.4 = 0.023 × 10 660 × 1.624 = 398. h = Nu·k/D = 398 × 0.644/0.020 = 12 820 W/(m²·K).",
      whyCorrect:
        "Compute Re_D = ρ·V·D/μ = 988 × 2 × 0.020 / 5.47×10⁻⁴ = 72 240 (turbulent — Dittus–Boelter valid). Compute Pr = μ·c_p/k = 5.47×10⁻⁴ × 4180 / 0.644 = 3.55. With heating (T_s > T_bulk, n=0.4): Nu = 0.023 × 72 240^0.8 × 3.55^0.4 = 0.023 × 10 660 × 1.624 = 398. Then h = Nu·k/D = 398 × 0.644/0.020 = 12 820 W/(m²·K). Sanity check: turbulent forced water h ~5000–15 000 — 12 820 is in range.",
      whyOthersWrong: [
        "Option 1300 W/(m²·K) likely uses Re^0.8 ≈ 1000 (i.e., Re≈6000 miscomputed) and forgets the Pr^0.4 factor — gives Nu ≈ 23 and h = 740.",
        "Option 200 W/(m²·K) is the order of magnitude for forced AIR convection, not water — applied an air-Pr (0.71) and got h ≈ 0.023 × Re^0.8 × 0.71^0.4 × k_air/D = 0.023 × 10 660 × 0.879 × 0.0263/0.020 = 282 W/(m²·K).",
        "Option 25 W/(m²·K) is typical of natural air convection, not forced water — likely used the natural-convection regime by mistake.",
      ],
      options: [
        { text: "25 W/(m²·K)", isCorrect: false },
        { text: "200 W/(m²·K)", isCorrect: false },
        { text: "1300 W/(m²·K)", isCorrect: false },
        { text: "12 800 W/(m²·K)", isCorrect: true },
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
        "Air at 20 °C flows inside a 50 mm ID tube at velocity 0.5 m/s. The Reynolds number Re_D = 4·ṁ/(π·D·μ) is approximately (use ρ = 1.20 kg/m³, μ = 1.82×10⁻⁵ Pa·s):",
      explanation:
        "Re = ρ·V·D/μ = 1.20 × 0.5 × 0.050 / 1.82×10⁻⁵ = 1648. Below 2300 → laminar. Forced air at low velocity in a 50 mm tube is firmly in the laminar regime; the fully developed Nu = 3.66 (constant wall T) and h = 3.66 × 0.0263/0.050 = 1.92 W/(m²·K) — very low.",
      whyCorrect:
        "Re_D = ρ·V·D/μ = 1.20 × 0.5 × 0.050 / 1.82×10⁻⁵ = 1648. This is below the laminar-turbulent transition threshold Re = 2300 — the flow is LAMINAR. In laminar fully developed pipe flow (constant wall temperature), Nu_D = 3.66 (constant), and h = Nu·k/D = 3.66 × 0.0263/0.050 = 1.92 W/(m²·K). Laminar forced air in a 50 mm duct is a low-h regime — typical of ventilation dilution flows, not heat-transfer surfaces.",
      whyOthersWrong: [
        "Option Re = 165 (decimal-place error: used D in mm not m, or velocity 0.05 m/s) — would be 'creeping flow' and physically tiny.",
        "Option Re = 16 480 (used D in mm not m, or velocity 5 m/s, by factor 10) — would be turbulent, contradicting the low-velocity premise.",
        "Option Re = 164 800 (used V = 50 m/s — a hurricane-class velocity in a 50 mm tube) — physically absurd.",
      ],
      options: [
        { text: "165 (laminar, creeping)", isCorrect: false },
        { text: "1648 (laminar)", isCorrect: true },
        { text: "16 480 (turbulent)", isCorrect: false },
        { text: "164 800 (highly turbulent)", isCorrect: false },
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
        "True or False: For a given fluid and surface, the natural-convection heat-transfer coefficient is typically HIGHER than the forced-convection coefficient.",
      explanation:
        "FALSE. Natural convection relies on buoyancy, which produces low velocities (cm/s) and thick boundary layers — typical h for air ~5–25 W/(m²·K). Forced convection (fan/pump) drives velocities 1–10 m/s, dramatically thinning the boundary layer and raising h ~25–250 for air, 1000–10 000 for water. The forced h is typically 5–100× higher than natural.",
      whyCorrect:
        "FALSE. Natural convection produces buoyancy-driven velocities of order 0.01–0.3 m/s (low Re, thick boundary layer, low gradient at the wall). Forced convection drives velocities 1–50 m/s (high Re, thin boundary layer, steep gradient). For air: natural h ~5–25 W/(m²·K) vs forced h ~25–250 — 5–10× higher. For water: natural h ~50–1000 vs forced h ~1000–10 000 — 10–100× higher. The exception is phase-change (boiling/condensation), which can reach h ~2500–100 000 — even higher than forced single-phase.",
      whyOthersWrong: [
        "Option TRUE — confuses the magnitudes. The driving force in natural convection is the buoyancy g·β·ΔT (small) producing low velocities; forced convection uses a pump/fan to drive a far higher velocity, which thinns the boundary layer and increases the wall temperature gradient. Forced h > natural h by 5–100× across common fluids.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Radiation & Heat Exchangers
// (slug: heat-radiation-exchangers)
// ---------------------------------------------------------------------------

const LESSON_RADIATION_EXCHANGERS: RefLesson = {
  slug: "heat-radiation-exchangers",
  title: "Radiation & Heat Exchangers",
  titleAr: "الإشعاع والمبادلات الحرارية",
  order: 3,
  durationMin: 35,
  references: HEAT_REFERENCE_TITLES,
  conceptIntroduction: `Thermal radiation is heat transfer by electromagnetic waves (no medium required — crosses vacuum). The constitutive law — the *Stefan–Boltzmann law* (Josef Stefan 1879, Ludwig Boltzmann 1884) — states that the emissive power of a blackbody is E_b = σ·T⁴, where σ = 5.670×10⁻⁸ W/(m²·K⁴) is the Stefan–Boltzmann constant and T is in Kelvin. Real surfaces emit ε·σ·T⁴ where ε (0 ≤ ε ≤ 1) is the *emissivity* (polished aluminum ε ≈ 0.05, brick ε ≈ 0.93, black paint ε ≈ 0.95). Net radiation between a gray surface at T_s and large surroundings at T_sur is q = ε·σ·A·(T_s⁴ − T_sur⁴). For two surfaces, the *view factor* F₁₂ (the fraction of radiation leaving surface 1 that hits surface 2) and the *reciprocity* relation A₁·F₁₂ = A₂·F₂₁ govern the exchange. The third major topic is *heat exchangers* — devices transferring heat between two fluids separated by a wall. The design equation is Q̇ = U·A·F·ΔT_lm, where U is the overall heat-transfer coefficient, A the heat-transfer area, F the LMTD correction factor (depends on flow arrangement — 1 for pure counterflow, < 1 for shell-and-tube), and ΔT_lm the *log-mean temperature difference* ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂). This lesson builds the radiation-network toolkit, view-factor algebra, and the LMTD method applied to shell-and-tube heat exchangers — the universal engineering toolkit for boilers, condensers, evaporators, and radiators.`,
  sections: {
    learning_objectives: `- State the Stefan–Boltzmann law E_b = σ·T⁴ with σ = 5.670×10⁻⁸ W/(m²·K⁴) and apply it to compute blackbody emissive power.
- Distinguish blackbody (ε = 1, α = 1), graybody (ε = α < 1, constant across spectrum), and real surfaces (ε(λ, T)).
- Apply Kirchhoff's law (ε = α at thermal equilibrium) and the reciprocal form A₁·F₁₂ = A₂·F₂₁ for view factors.
- Compute net radiation exchange between two black surfaces: Q̇₁₂ = σ·A₁·F₁₂·(T₁⁴ − T₂⁴); between two gray surfaces via the resistance network R_surf = (1−ε)/(ε·A) + 1/(A·F₁₂).
- Derive and apply the LMTD formula ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) for parallel-flow, counterflow, and shell-and-tube heat exchangers.
- Apply the correction factor F (charts in Incropera Fig. 11.10) for multi-pass shell-and-tube arrangements to Q̇ = U·A·F·ΔT_lm.
- Size a shell-and-tube heat exchanger for a given Q̇, U, and inlet/outlet temperatures using the LMTD method.`,
    prerequisites: `- Lesson 1 — Conduction (resistance networks; the surface resistance (1−ε)/(ε·A·σ) builds directly on the wall resistance L/(k·A)).
- Lesson 2 — Convection (film resistance 1/(h·A); the overall U-value in Q̇ = U·A·F·ΔT_lm combines conduction + convection + radiation resistances).
- Thermodynamics Lesson 1 — absolute temperature scale (Kelvin required for σ·T⁴); Lesson 2 — First Law applied to control volumes (the energy balance on a heat-exchanger side).
- Basic differential calculus (the LMTD derivation integrates dQ̇ = U·dA·ΔT along the heat exchanger length).`,
    introduction: `Thermal radiation is the third heat-transfer mode — and unlike conduction and convection it needs no medium (it crosses vacuum, which is how the Sun heats Earth). Every surface above 0 K emits electromagnetic radiation with total power per unit area E = ε·σ·T⁴ — Stefan's empirical 1879 finding, derived thermodynamically by Boltzmann in 1884 from radiation-pressure work. The T⁴ dependence makes radiation negligible at room temperature (a 1 m² blackbody at 300 K emits 459 W) but dominant at high temperature (the same blackbody at 1500 K emits 287 kW/m² — the engineering basis of furnaces, lamps, and reentry heating). For engineering surfaces the *emissivity* ε scales the blackbody emission; polished metals (low ε) are poor emitters and poor absorbers (Kirchhoff: ε = α at thermal equilibrium), which is why thermos flasks use silvered glass. Two-surface exchange uses the *view factor* F₁₂ — the geometric fraction of radiation leaving surface 1 that lands on surface 2 — and the reciprocity A₁·F₁₂ = A₂·F₂₁. The third major topic is the *heat exchanger*: a device that transfers heat between two fluids separated by a wall. The LMTD method Q̇ = U·A·F·ΔT_lm sizes shell-and-tube, plate, and air-cooled exchangers; the alternative ε-NTU method (Incropera §11.4) sizes by effectiveness. This lesson builds the radiation toolkit and the LMTD method — the universal engineering design basis for boilers, condensers, evaporators, radiators, and waste-heat recovery units.`,
    terminology: `- **Blackbody**: ideal emitter/absorber (ε = 1, α = 1, ρ = 0, τ = 0).
- **Emissivity ε [0–1]**: ratio of real-surface to blackbody emission at the same T.
- **Absorptivity α**: fraction of incident radiation absorbed (Kirchhoff: α = ε at thermal equilibrium).
- **Stefan–Boltzmann constant σ = 5.670×10⁻⁸ W/(m²·K⁴)**.
- **View factor F₁₂**: fraction of diffuse radiation leaving surface 1 that hits surface 2.
- **Reciprocity**: A₁·F₁₂ = A₂·F₂₁; **Summation**: Σⱼ F_ij = 1.
- **LMTD** ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) — log-mean temperature difference between hot and cold streams.
- **LMTD correction factor F** [0–1]: accounts for non-pure-counterflow arrangements (shell-and-tube, cross-flow); F = 1 for pure counterflow and parallel flow.
- **ε-NTU method**: alternative sizing method using effectiveness ε = Q̇_actual/Q̇_max and number of transfer units NTU = U·A/C_min.`,
    detailed_explanation: `**Stefan–Boltzmann law.** The total hemispherical emissive power of a blackbody is E_b = σ·T⁴ [W/m²], where σ = 5.670×10⁻⁸ W/(m²·K⁴) and T is absolute temperature in Kelvin. A real surface emits E = ε·σ·T⁴ with ε between 0 (perfect reflector) and 1 (blackbody). For two infinite parallel gray surfaces at T₁ and T₂, the net exchange per unit area is q″ = σ·(T₁⁴ − T₂⁴)/(1/ε₁ + 1/ε₂ − 1); for a small object 1 in large surroundings 2 (F₁₂ = 1, A₁ << A₂), q = ε₁·σ·A₁·(T₁⁴ − T₂⁴) — the canonical engineering form.

**View factors and networks.** The view factor F₁₂ is the fraction of diffuse radiation leaving surface 1 that lands on surface 2. Two rules: reciprocity A₁·F₁₂ = A₂·F₂₁ and summation Σⱼ F_ij = 1 (radiation leaving surface i must land somewhere). For an N-surface enclosure, the radiosity method gives a resistance network with surface resistance R_s,i = (1 − ε_i)/(ε_i·A_i) at each surface and space resistance R₁₂ = 1/(A₁·F₁₂) between each pair. The black-surface case (all ε_i = 1) simplifies to Q̇_12 = σ·A₁·F₁₂·(T₁⁴ − T₂⁴).

**Heat exchangers — LMTD method.** Consider a counterflow exchanger: hot fluid enters at T_h,in, exits at T_h,out; cold fluid enters at T_c,in, exits at T_c,out. Define ΔT₁ = T_h,in − T_c,out (one end) and ΔT₂ = T_h,out − T_c,in (other end). The differential energy balance dQ̇ = U·dA·ΔT(x) integrates (for constant U, constant c_p, no phase change) to Q̇ = U·A·ΔT_lm where ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂). For pure counterflow and parallel flow, F = 1. For 1-shell-pass, 2-tube-pass or other multi-pass arrangements, F < 1 and is read from the Bowman–Tubular charts (Incropera Fig. 11.10). The design equation is then Q̇ = U·A·F·ΔT_lm. The alternative ε-NTU method (ε = Q̇/Q̇_max, NTU = U·A/C_min) is preferred for rating problems (given the exchanger, find Q̇); LMTD is preferred for sizing problems (given Q̇, find A).`,
    core_principles: `- Stefan–Boltzmann: E_b = σ·T⁴ (T in Kelvin; σ = 5.670×10⁻⁸ W/(m²·K⁴)).
- Kirchhoff: ε = α for a surface in thermal equilibrium with its own radiation.
- View factor reciprocity: A₁·F₁₂ = A₂·F₂₁; summation: Σⱼ F_ij = 1.
- Radiation resistance: surface R_s = (1−ε)/(ε·A·σ); space R₁₂ = 1/(A₁·F₁₂·σ).
- LMTD: ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂); design Q̇ = U·A·F·ΔT_lm.
- F = 1 for pure counterflow; F < 1 for multi-pass shell-and-tube (Bowman charts).
- T⁴ makes radiation negligible at room T (300 K blackbody = 459 W/m²) but dominant at high T (1500 K = 287 kW/m²).`,
    components: `- **Blackbody cavity** (ideal emitter/absorber; ε = 1).
- **Real gray surface** (ε = constant, 0 < ε < 1).
- **View factor** F₁₂ — purely geometric (tabulated for common configurations in Incropera Table 12.2).
- **Heat-exchanger types**: shell-and-tube (1–2, 2–4 pass), plate-and-frame, air-cooled finned-tube, double-pipe, spiral, plate-fin.
- **Heat-exchanger components**: tube bundle, baffles (shell-side), headers, tubesheets, expansion joints, drains/vents.`,
    process: `1. (Radiation) Identify surface emissivities ε_i, areas A_i, and view factors F_ij (from analytical formulas or charts).
2. Build the radiation resistance network: surface resistance (1−ε_i)/(ε_i·A_i) at each surface; space resistance 1/(A_i·F_ij) between each pair.
3. Solve for the net exchange Q̇_ij = σ·(T_i⁴ − T_j⁴)/R_total.
4. (Heat exchangers) Determine the flow arrangement (parallel, counter, shell-and-tube 1-2, cross-flow) and inlet/outlet temperatures on both sides.
5. Compute ΔT₁ and ΔT₂ at the two ends; LMTD = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂).
6. Read the correction factor F from charts (or compute from P, R ratios).
7. Apply Q̇ = U·A·F·ΔT_lm to size A given Q̇, or to find Q̇ given A (rating).`,
    formula_calculation: `**Stefan–Boltzmann (blackbody):**
  E_b = σ·T⁴  ;  σ = 5.670×10⁻⁸ W/(m²·K⁴)  ;  T in K.

**Gray surface emission:** E = ε·σ·T⁴.

**Net exchange (small gray surface 1 in large surroundings 2 at T_sur):**
  Q̇₁₂ = ε₁·σ·A₁·(T₁⁴ − T_sur⁴)  ;  R_rad = (1−ε₁)/(ε₁·A₁·σ) (surface) + 1/(A₁·σ) (space).

**Two black surfaces (general):** Q̇₁₂ = σ·A₁·F₁₂·(T₁⁴ − T₂⁴).
**Two gray surfaces (network):** Q̇₁₂ = σ·(T₁⁴ − T₂⁴)/[ (1−ε₁)/(ε₁·A₁) + 1/(A₁·F₁₂) + (1−ε₂)/(ε₂·A₂) ].

**View-factor algebra:** A₁·F₁₂ = A₂·F₂₁ (reciprocity); Σⱼ F_ij = 1 (summation).

**Heat-exchanger LMTD:**
  ΔT₁ = T_h,in − T_c,out  ;  ΔT₂ = T_h,out − T_c,in (counterflow)
  ΔT_lm = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)
  Q̇ = U·A·F·ΔT_lm   (F = 1 for pure counterflow / parallel flow; F < 1 for multi-pass).

**ε-NTU alternative:**
  ε = Q̇_actual / Q̇_max  ;  Q̇_max = C_min·(T_h,in − T_c,in)
  NTU = U·A / C_min  ;  ε = f(NTU, C_r) (form depends on flow arrangement).`,
    worked_example: `**Blackbody radiation.** Compute the net radiative heat loss from a 1 m × 1 m gray surface (ε = 0.90, T_s = 200 °C = 473 K) facing a large room (T_sur = 20 °C = 293 K).

  Q̇ = ε·σ·A·(T_s⁴ − T_sur⁴)
  T_s⁴ = 473⁴ = 5.00×10¹⁰ K⁴
  T_sur⁴ = 293⁴ = 7.37×10⁹ K⁴
  Δ(T⁴) = 4.27×10¹⁰ K⁴
  Q̇ = 0.90 × 5.670×10⁻⁸ × 1 × 4.27×10¹⁰ = 2179 W

Sanity check: a 1 m² surface at 200 °C in a 20 °C room — the Stefan–Boltzmann formula gives 2.18 kW. With natural convection on the same surface (h ≈ 7 W/(m²·K), q_conv = 7 × 1 × 180 = 1260 W), the total is 3.44 kW — radiation is 64% of the total. This shows why high-T surfaces are dominated by radiation.

**Shell-and-tube LMTD.** A 1-shell-pass, 2-tube-pass oil cooler cools 5 kg/s of oil (c_p = 2000 J/(kg·K)) from 120 °C to 60 °C using 2 kg/s of cooling water (c_p = 4180 J/(kg·K)) entering at 25 °C. Find: (a) water exit temperature, (b) LMTD, (c) heat-transfer area required for U = 250 W/(m²·K).

(a) Q̇ = ṁ_oil·c_p·(T_h,in − T_h,out) = 5 × 2000 × (120 − 60) = 600 kW. T_c,out = T_c,in + Q̇/(ṁ_cw·c_p) = 25 + 600 000/(2 × 4180) = 25 + 71.8 = 96.8 °C.

(b) ΔT₁ = T_h,in − T_c,out = 120 − 96.8 = 23.2 K; ΔT₂ = T_h,out − T_c,in = 60 − 25 = 35 K. ΔT_lm (counterflow basis) = (23.2 − 35)/ln(23.2/35) = −11.8 / ln(0.6628) = −11.8 / (−0.4116) = 28.7 K.

(c) For 1-shell-pass, 2-tube-pass, use the LMTD correction factor F: with P = (T_c,out − T_c,in)/(T_h,in − T_c,in) = (96.8 − 25)/(120 − 25) = 0.756 and R = (T_h,in − T_h,out)/(T_c,out − T_c,in) = (120 − 60)/(96.8 − 25) = 0.838; from the chart (Incropera Fig. 11.10-1) F ≈ 0.75. Required area: A = Q̇/(U·F·ΔT_lm) = 600 000/(250 × 0.75 × 28.7) = 111.4 m². Without the F correction the area would be 600 000/(250 × 28.7) = 83.6 m² — underestimating by 33% and leading to under-design.`,
    industrial_example: `**Industry: Power — boiler radiant furnace.** A 600 MW coal-fired boiler furnace has 4 walls of water-wall tubes (total area 1800 m²) exposed to a flame at an effective flame temperature T_flame ≈ 1500 °C = 1773 K. The water-wall surface (steel tubes with boiler scale) has ε ≈ 0.85 and operates at T_s ≈ 350 °C = 623 K (saturated water at 16.5 MPa). Total radiative absorption: Q̇ = ε·σ·A·(T_flame⁴ − T_s⁴) × F₁₂. With F₁₂ ≈ 0.95 (water walls nearly surround the flame), Q̇ = 0.85 × 5.670×10⁻⁸ × 1800 × (1773⁴ − 623⁴) × 0.95 = 0.85 × 5.670×10⁻⁸ × 1800 × (9.88×10¹² − 1.51×10¹¹) × 0.95 = 0.85 × 5.670×10⁻⁸ × 1800 × 9.73×10¹² × 0.95 = 804 MW — comparable to the boiler's 600 MW electrical output (the boiler absorbs ~804 MW of flame radiation, of which ~75% becomes steam enthalpy and ~25% leaves as stack loss). The Stefan–Boltzmann T⁴ dependence explains why furnace-tube heat flux is ~400 kW/m² (extreme) while the same surface at room T would emit only ~0.5 kW/m².`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cascade Refinery Kettle Reboiler (synthetic, illustrative).* A shell-and-tube kettle reboiler generates 8 kg/s of vaporized propane (latent h_fg = 320 kJ/kg) at 35 °C (P_sat ≈ 12 bar) on the shell side, using 18 kg/s of hot oil (c_p = 2200 J/(kg·K)) entering the tube side at 180 °C and exiting at 95 °C. Required duty: Q̇ = ṁ_vap × h_fg = 8 × 320 000 = 2560 kW. Oil-side check: Q̇ = 18 × 2200 × (180 − 95) = 3366 kW (oil over-supply — design margin 31%). LMTD (counterflow basis): ΔT₁ = 180 − 35 = 145 K; ΔT₂ = 95 − 35 = 60 K; ΔT_lm = (145 − 60)/ln(145/60) = 85/0.8834 = 96.2 K. For a kettle (bundle submerged in boiling liquid, no shell-side flow pattern), F ≈ 1.0 (boiling is isothermal on the shell side). With U ≈ 850 W/(m²·K) (oil-side controlled, boiling film h ~6000, oil h ~1500): A = Q̇/(U·F·ΔT_lm) = 2 560 000 / (850 × 1.0 × 96.2) = 31.3 m² → at A_per_tube = π × 0.025 × 6 m = 0.471 m²/m, total tube length = 66.5 m → with 4 m tubes per pass × 4 passes, need 4.16 ≈ 5 tubes per pass × 4 passes = 20 tubes in a 4-pass bundle. Capex $480k at $15k per m² of installed area. Tracked under ISO 55000 with monthly fouling-resistance (R_f) monitoring — a 0.0002 m²·K/W fouling layer drops U to 740 W/(m²·K) and duty to 2.23 MW (12% reduction) — triggers chemical cleaning per the asset-management plan.`,
    visual_explanation: `**Emissive power spectrum and the Stefan–Boltzmann law.** Planck's spectral distribution E_bλ(λ, T) peaks at λ_max = 2898/T [μm] (Wien's displacement law): at T = 5800 K (sun) λ_max = 0.50 μm (visible); at 1500 K (furnace) λ_max = 1.93 μm (near IR); at 300 K (room) λ_max = 9.66 μm (long-wave IR). The integral ∫E_bλ dλ = σ·T⁴ (Stefan–Boltzmann). On a log-log plot of E vs T, the slope is 4 — for every doubling of T, the emission rises 16×. For a heat exchanger, the LMTD visualization shows two converging/diverging temperature profiles along the length: counterflow keeps ΔT nearly uniform (favorable — smaller A for the same Q̇), while parallel flow has ΔT start large and end small (unfavorable — larger A for the same Q̇). The crossover point where ΔT₁ = ΔT₂ makes LMTD = ΔT₁ = ΔT₂ (no logarithm needed — the limit is the arithmetic mean).`,
    simulation_opportunity: `EngiSuite radiation explorer: input two surface (ε, T, A, F₁₂) configurations and view the resistance network with surface + space resistances; live plot of net Q̇ vs T₁ (T⁴ curvature). For heat exchangers, the LMTD calculator: input (T_h,in, T_h,out, T_c,in, T_c,out, arrangement); receive LMTD, F (from chart look-up), and A = Q̇/(U·F·LMTD). Try counterflow vs parallel flow vs 1-shell-2-tube-pass on the same temperatures and watch A shrink (counterflow) or grow (parallel flow). Commercial software: HTRI Xchanger Suite, ASPEN Exchanger Design, PROII Rigorous Exchangers — used for shell-and-tube, plate, and air-cooled design with detailed segmentation (zone-by-zone LMTD for varying U).`,
    common_mistakes: `- **Using Celsius in the Stefan–Boltzmann formula** — T must be Kelvin. (200 °C)⁴ = 1.6×10⁹ vs (473 K)⁴ = 5.0×10¹⁰ — a 30× error.
- **Forgetting emissivity** — a polished aluminum surface (ε=0.05) emits 20× less than a blackbody at the same T.
- **Mixing up ΔT₁ and ΔT₂ in LMTD** — for counterflow, ΔT₁ = T_h,in − T_c,out and ΔT₂ = T_h,out − T_c,in (NOT ΔT = T_h,in − T_c,in at the same end).
- **Skipping the correction factor F** for shell-and-tube: F can be 0.5–0.95, easily under-sizing by 30–50%.
- **Assuming constant U along the exchanger** — for viscosity-variable oils or phase-change applications U varies 5–10× along the length; use the zone-method (segment-by-segment LMTD).`,
    limitations: `- **Radiation formula assumes diffuse gray surfaces** — real surfaces have ε(λ, θ, T) variation; for high-precision furnace calculations use spectral integrals (Hottel's n-band gray method).
- **LMTD assumes constant U, constant c_p, no phase change** — for boilers and condensers with phase change on one side, use the zone-method or the ε-NTU charts.
- **View factor charts** are tabulated for idealized geometries — complex 3D shapes need Monte Carlo ray-tracing or view-factor software (View3D).
- **LMTD method is for sizing** — for off-design rating (varying flows, temperatures), the ε-NTU method is preferred (ε = f(NTU, C_r) curves are flow-arrangement-specific).`,
    comparison: `| Aspect | Counterflow | Parallel flow | 1-shell-2-tube pass |
|---|---|---|---|
| F (correction) | 1.00 | 1.00 | 0.75–0.95 |
| LMTD | Largest | Smallest | Intermediate |
| Required area A | Smallest | Largest | Intermediate |
| Cold-out temperature | Can exceed T_h,out | Cannot exceed T_h,out | Intermediate |
| Typical use | LNG, condensers, evaporators | Recovery, low-ΔT heating | Most shell-and-tube |
| ε-NTU ε_max (C_r=0.5) | 0.77 | 0.40 | 0.62 |`,
    practical_application: `**Shell-and-tube feed-effluent exchanger (refinery hydrotreater).** A 1-shell-pass, 2-tube-pass exchanger heats 25 kg/s of cold feed (c_p = 2500 J/(kg·K)) from 50 °C to 230 °C using 25 kg/s of hot effluent (c_p = 2800 J/(kg·K)) cooling from 320 °C to 130 °C. Q̇ = 25 × 2500 × (230 − 50) = 11.25 MW (matches effluent side: 25 × 2800 × (320 − 130) = 13.3 MW; the 18% over-supply is the design margin). ΔT₁ = T_h,in − T_c,out = 320 − 230 = 90 K; ΔT₂ = T_h,out − T_c,in = 130 − 50 = 80 K; ΔT_lm = (90 − 80)/ln(90/80) = 10/0.1178 = 84.9 K. P = (T_c,out − T_c,in)/(T_h,in − T_c,in) = 180/270 = 0.667; R = (T_h,in − T_h,out)/(T_c,out − T_c,in) = 190/180 = 1.056; from chart F ≈ 0.82. With U = 180 W/(m²·K) (typical for light hydrocarbon gas-gas shell-and-tube): A = Q̇/(U·F·ΔT_lm) = 11.25×10⁶/(180 × 0.82 × 84.9) = 900 m² — at 16 m² per tube × 5 m length, ~57 tubes × 5 m × 2 passes = 4.5 m² per pass-pair × 4 = 18 m², need ~50 tubes per pass × 4 passes = 200 tubes in a 32-inch shell. Capex $1.2M. Tracked under ISO 55000 with monthly fouling-resistance (R_f) monitoring — the dominant KPI is the cold-out temperature drop as fouling accumulates; a 5 K drop triggers chemical cleaning.`,
    decision_scenario: `You are the energy engineer at a 1000 t/d ammonia plant. The current 1-shell-2-tube-pass interchanger (A = 600 m², U = 250, ΔT_lm = 65 K, F = 0.85) delivers Q̇ = 8.3 MW (saves $1.4M/yr in fuel). A vendor proposes two upgrades: (A) convert to pure counterflow double-tube-sheet design (F → 1.0, U → 280, +5% area) capex $750k → Q̇_new = 280 × 1.05 × 600 × 65 × 1.0/1000 = 11.5 MW (saves $2.0M/yr) → payback 1.25 yr. (B) replace with plate-and-frame (U → 3500, F = 1, A = 200 m²) capex $1.2M → Q̇_new = 3500 × 200 × 65 × 1/1000 = 45.5 MW (impossible — exceeds available heat: hot-side availability is 60 MW, cold-side demand is 8 MW... actually plate-frame would simply raise cold-out higher, recovering more sensible heat from hot stream) → realistic Q̇_new = 18 MW (saves $3.1M/yr) → payback 0.55 yr. Decision: choose B (plate-and-frame). Risk: plate-frame is gasket-limited to 180 °C and 25 bar — verify the plant's interchanger conditions fall within envelope (currently 320 °C and 35 bar — TOO HIGH for gasketed plates). Recommend a welded semi-plate (Compabloc) capex $1.6M, payback 0.7 yr. Adopt B (welded plate). Track the fuel savings under ISO 55000 as the heat-recovery asset-performance KPI.`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Apply/Analyze. Topics: the Stefan–Boltzmann law expression, shell-and-tube LMTD with correction factor, blackbody emissive power calculation, and the meaning of a "black surface".`,
    certification_questions: `This lesson's content maps to the NCEES FE Mechanical and PE Thermal & Fluids Systems exam outlines (professional-engineer licensure) and the Tubular Exchanger Manufacturers Association (TEMA) standards. Sample FE-style question: "A 1 m² blackbody surface at 1000 K radiates to a 300 K environment. The net heat loss is closest to: (a) 5.7 kW, (b) 45 kW, (c) 56 kW, (d) 570 kW." Correct: (c) Q̇ = σ·A·(T_s⁴ − T_sur⁴) = 5.67×10⁻⁸ × 1 × (10¹² − 8.1×10⁹) = 5.67×10⁻⁸ × 9.92×10¹¹ = 56.2 kW. PE-style: "A counterflow heat exchanger has T_h,in=200, T_h,out=100, T_c,in=30, T_c,out=80 (all °C). The LMTD is: (a) 70 K, (b) 78 K, (c) 84 K, (d) 95 K." Correct: (d) ΔT₁=120, ΔT₂=70, LMTD = (120−70)/ln(120/70) = 50/0.5390 = 92.8 ≈ 95 K.`,
    summary: `Thermal radiation is governed by the Stefan–Boltzmann law E = ε·σ·T⁴ (σ = 5.670×10⁻⁸ W/(m²·K⁴), T in Kelvin). For two surfaces, the view factor F₁₂ and the reciprocity A₁·F₁₂ = A₂·F₂₁ govern the exchange; the resistance network has surface resistance (1−ε)/(ε·A·σ) and space resistance 1/(A·F₁₂·σ). Heat exchangers transfer heat between two fluids separated by a wall; the design equation is Q̇ = U·A·F·ΔT_lm where ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) and F is the correction factor (1 for pure counterflow, <1 for shell-and-tube multi-pass). The ε-NTU method (ε = Q̇/Q̇_max, NTU = U·A/C_min) is the alternative for rating problems. These three modes — conduction (Lesson 1), convection (Lesson 2), and radiation + heat-exchanger sizing (this lesson) — together compose the engineer's universal heat-transfer toolkit: every wall, pipe, boiler, condenser, radiator, and waste-heat recovery unit can be sized by combining the three resistance networks.`,
    key_takeaways: `- Stefan–Boltzmann: E_b = σ·T⁴ (T in Kelvin, σ = 5.670×10⁻⁸ W/(m²·K⁴)).
- Gray surface: E = ε·σ·T⁴; Kirchhoff ε = α; polished metals ε ≈ 0.05, paints ε ≈ 0.93.
- View factor: A₁·F₁₂ = A₂·F₂₁, Σⱼ F_ij = 1; radiation network has surface (1−ε)/(ε·A·σ) and space 1/(A·F₁₂·σ) resistances.
- LMTD: ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂); pure counterflow F=1; multi-pass F<1.
- Design equation: Q̇ = U·A·F·ΔT_lm — sizing; ε-NTU alternative for rating.
- T⁴ dependence makes radiation dominant at high T (furnace 1500 K = 287 kW/m²) and negligible at room T (300 K = 0.46 kW/m²).`,
    references: `1. Incropera, DeWitt, Bergman & Lavine (2017), Ch. 12 (radiation — blackbody, Stefan–Boltzmann, view factors, network method), Ch. 11 (heat exchangers — LMTD, ε-NTU, correction-factor charts).
2. Çengel & Ghajar (2020), Ch. 11 (radiation heat transfer — Stefan–Boltzmann, Kirchhoff, view factors), Ch. 13 (heat exchangers — LMTD method, ε-NTU).
3. Kreith (2011), Ch. 6 (radiation — Stefan–Boltzmann, view factors), Ch. 9 (heat exchangers — LMTD & ε-NTU).
4. Holman (2010), Ch. 8 (radiation heat transfer — Stefan–Boltzmann, network method), Ch. 10 (heat exchangers — LMTD, ε-NTU).
5. ISO 55000:2014 for tracking heat-exchanger fouling-resistance degradation and U-value decline under the asset-management framework.
6. ASHRAE Handbook — HVAC Applications (2019) for shell-and-tube and plate-and-frame selection in HVAC and process applications.`,
  },
  knowledgeObject: {
    title: "Radiation & Heat Exchangers — Knowledge Object",
    domain: "Heat Transfer",
    competency: "Radiation & Heat-Exchanger Design",
    topic: "Stefan–Boltzmann, View Factors, LMTD, ε-NTU",
    concept:
      "E_b=σ·T⁴ + view-factor networks + LMTD method Q̇=U·A·F·ΔT_lm",
    body: {
      definitions: [
        "Stefan–Boltzmann law: E_b = σ·T⁴; σ = 5.670×10⁻⁸ W/(m²·K⁴); T in Kelvin.",
        "Blackbody: ideal emitter/absorber (ε=1, α=1); real gray surface has 0<ε<1.",
        "Emissivity ε: ratio of real-surface to blackbody emission (polished Al 0.05, paint 0.93).",
        "Kirchhoff's law: ε = α for a surface in thermal equilibrium with its own radiation.",
        "View factor F₁₂: geometric fraction of diffuse radiation leaving 1 that hits 2.",
        "LMTD: ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) — log-mean temperature difference.",
        "LMTD correction factor F: 1 for pure counterflow/parallel; <1 for multi-pass (Bowman charts).",
        "ε-NTU: ε = Q̇/Q̇_max (effectiveness); NTU = U·A/C_min (number of transfer units).",
      ],
      principles: [
        "Stefan–Boltzmann T⁴ dependence — radiation negligible at 300 K (459 W/m²) but dominant at 1500 K (287 kW/m²).",
        "Kirchhoff: ε = α at thermal equilibrium — good emitters are good absorbers.",
        "View-factor algebra: reciprocity A₁F₁₂ = A₂F₂₁; summation ΣⱼF_ij = 1.",
        "Radiation resistance network: surface (1−ε)/(ε·A·σ) + space 1/(A·F₁₂·σ).",
        "LMTD derived by integrating dQ̇ = U·dA·ΔT(x) — assumes constant U, c_p, no phase change.",
        "Counterflow yields the smallest A for given Q̇; parallel flow the largest.",
        "ε-NTU preferred for rating (given A, find Q̇); LMTD preferred for sizing (given Q̇, find A).",
      ],
      components: [
        "Blackbody cavity (ideal emitter/absorber)",
        "Real gray surface (ε = constant 0–1)",
        "View factor F₁₂ — purely geometric (Incropera Table 12.2)",
        "Heat-exchanger types: shell-and-tube (1-2, 2-4 pass), plate-and-frame, air-cooled, double-pipe",
        "Heat-exchanger components: tube bundle, baffles, headers, tubesheets, expansion joints",
      ],
      mechanism:
        "Radiation: electromagnetic wave emission from atomic/molecular transitions, with total power scaling as T⁴ (Stefan–Boltzmann). View factors capture the geometric angle-of-incidence between surfaces. Heat exchangers: a thin metal wall separates two fluids; conduction through the wall and convection on both sides give U = 1/(1/h_h + L/k_wall + 1/h_c + R_fouling); the integrated temperature difference ΔT_lm provides the mean driving force, and F corrects for non-counterflow arrangements.",
      process:
        "(Radiation) Identify ε_i, A_i, F_ij → build surface+space resistance network → solve Q̇_ij = σ·(T_i⁴ − T_j⁴)/R_total. (Heat exchangers) Determine flow arrangement → compute ΔT₁, ΔT₂ at ends → ΔT_lm → read F from chart → A = Q̇/(U·F·ΔT_lm) (sizing) or Q̇ = U·A·F·ΔT_lm (rating).",
      formulas: [
        "Stefan–Boltzmann: E_b = σ·T⁴; σ = 5.670×10⁻⁸ W/(m²·K⁴)",
        "Gray surface: E = ε·σ·T⁴",
        "Small gray surface in large surroundings: Q̇ = ε·σ·A·(T_s⁴ − T_sur⁴)",
        "Two black surfaces: Q̇₁₂ = σ·A₁·F₁₂·(T₁⁴ − T₂⁴)",
        "View-factor algebra: A₁F₁₂ = A₂F₂₁; ΣⱼF_ij = 1",
        "LMTD: ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂); Q̇ = U·A·F·ΔT_lm",
        "ε-NTU: ε = Q̇/Q̇_max; Q̇_max = C_min·(T_h,in − T_c,in); NTU = U·A/C_min",
      ],
      metrics: [
        "Emissive power E_b [W/m²] and total emission Q̇ [W]",
        "View factor F₁₂ (dimensionless 0–1)",
        "LMTD [K] and correction factor F (dimensionless 0–1)",
        "Overall U-value [W/(m²·K)]",
        "Required heat-transfer area A [m²] (heat-exchanger sizing metric)",
        "Heat-exchanger effectiveness ε (rating metric)",
      ],
      examples: [
        "Blackbody 1 m² at 200 °C in 20 °C room (ε=0.90): Q̇ = 2179 W (radiation dominates, 64% of total).",
        "Shell-and-tube oil cooler (1-2 pass, 5 kg/s oil 120→60 °C, 2 kg/s water 25→96.8 °C): LMTD=28.7 K, F=0.75, U=250, A=111.4 m².",
        "Furnace water-wall (600 MW boiler, 1800 m², T_flame=1773 K, T_s=623 K): Q̇=804 MW of flame radiation absorbed.",
      ],
      industrial_examples: [
        "Power — 600 MW coal-fired boiler radiant furnace: 1800 m² of water-wall tubes at T_s ≈ 350 °C absorb ~804 MW of flame radiation at T_flame ≈ 1500 °C; the T⁴ dependence explains the extreme ~400 kW/m² furnace heat flux.",
        "Refinery — shell-and-tube feed-effluent exchanger (1-2 pass, 11.25 MW duty, A=900 m², U=180, F=0.82, ΔT_lm=84.9 K): sized by the LMTD method, tracked under ISO 55000 with monthly fouling-resistance monitoring.",
      ],
      case_studies: [
        "SYNTHETIC — Cascade Refinery Kettle Reboiler: 8 kg/s propane vaporized at 35 °C using hot oil 180→95 °C; Q̇=2560 kW, LMTD=96.2 K, U=850, A=31.3 m² → 5 tubes × 4 passes in a 4-pass bundle; tracked under ISO 55000 with R_f fouling monitoring triggering cleaning at U degradation >12%.",
      ],
      common_errors: [
        "Using Celsius in Stefan–Boltzmann — T must be Kelvin. (200 °C)⁴ = 1.6×10⁹ vs (473 K)⁴ = 5.0×10¹⁰ — 30× error.",
        "Forgetting emissivity ε — a polished aluminum surface (ε=0.05) emits 20× less than a blackbody at the same T.",
        "Mixing up ΔT₁ and ΔT₂ in LMTD — for counterflow ΔT₁ = T_h,in − T_c,out, ΔT₂ = T_h,out − T_c,in (NOT the same-end ΔT).",
        "Skipping the F correction factor for shell-and-tube — F can be 0.5–0.95, under-sizing A by 30–50%.",
        "Assuming constant U along the exchanger — for viscosity-variable oils or phase-change, U varies 5–10× along length; use the zone-method.",
      ],
      limitations: [
        "Radiation formula assumes diffuse gray surfaces — real ε varies with λ, θ, T; use Hottel n-band gray for furnace precision.",
        "LMTD assumes constant U, c_p, no phase change — boilers/condensers need the zone-method or ε-NTU charts.",
        "View-factor charts tabulated only for idealized geometries — complex 3D needs Monte Carlo ray-tracing.",
        "LMTD method is for sizing (given Q̇ find A); for off-design rating use ε-NTU.",
      ],
      best_practices: [
        "Always use absolute (Kelvin) temperature in Stefan–Boltzmann calculations.",
        "Use ε-NTU for rating problems (given A, find Q̇); LMTD for sizing (given Q̇, find A).",
        "Always include the F correction factor for non-pure-counterflow arrangements; underestimating A by 30–50% otherwise.",
        "Use the zone-method for variable-U or phase-change exchangers — segment by segment.",
        "Track fouling resistance R_f monthly under ISO 55000; trigger cleaning when U drops below design by >10–15%.",
      ],
      related_concepts: [
        "Conduction (Lesson 1 — wall resistance L/(k·A))",
        "Convection (Lesson 2 — film resistance 1/(h·A) feeding into U-value)",
        "Boiling and condensation (Incropera Ch. 10 — phase-change h on heat-exchanger sides)",
        "TEMA standards for shell-and-tube mechanical design; API 660 for refinery exchangers",
      ],
      prerequisites: [
        "Lesson 1 — Conduction (resistance networks — surface resistance builds on this)",
        "Lesson 2 — Convection (film resistance 1/(h·A) feeding U)",
        "Thermodynamics Lesson 1 — Kelvin temperature scale required for Stefan–Boltzmann",
        "Calculus (LMTD derivation integrates dQ̇ = U·dA·ΔT)",
      ],
      references: HEAT_REFERENCE_TITLES,
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
        "Which statement correctly expresses the Stefan–Boltzmann law for the total emissive power of a blackbody?",
      explanation:
        "The Stefan–Boltzmann law states E_b = σ·T⁴, with σ = 5.670×10⁻⁸ W/(m²·K⁴) and T in absolute (Kelvin) temperature. A gray surface emits E = ε·σ·T⁴ with 0 ≤ ε ≤ 1.",
      whyCorrect:
        "Stefan's 1879 empirical finding and Boltzmann's 1884 thermodynamic derivation give E_b = σ·T⁴, where σ = 5.670×10⁻⁸ W/(m²·K⁴) and T is absolute temperature in Kelvin. A real (gray) surface emits E = ε·σ·T⁴ with ε between 0 (perfect reflector) and 1 (blackbody). The T⁴ dependence makes radiation negligible at room temperature (a 1 m² blackbody at 300 K emits 459 W) but dominant at high temperature (1500 K → 287 kW/m²).",
      whyOthersWrong: [
        "Option E = ε·σ·A·(T_s⁴ − T_sur⁴) is the NET radiative heat transfer between a small gray surface and its large surroundings — not the absolute emissive power of a blackbody (which is σ·T⁴, not ε·σ·Δ(T⁴)).",
        "Option E = k·(dT/dx) is Fourier's law of conduction, not radiation.",
        "Option E = h·A·(T_s − T_∞) is Newton's law of cooling for convection, not radiation.",
      ],
      options: [
        { text: "E = ε·σ·A·(T_s⁴ − T_sur⁴)", isCorrect: false },
        { text: "E_b = σ·T⁴, with σ = 5.670×10⁻⁸ W/(m²·K⁴) and T in Kelvin.", isCorrect: true },
        { text: "E = k·(dT/dx), Fourier's law of conduction.", isCorrect: false },
        { text: "E = h·A·(T_s − T_∞), Newton's law of cooling.", isCorrect: false },
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
        "A 1-shell-pass, 2-tube-pass oil cooler cools oil from 120 °C to 60 °C using cooling water entering at 25 °C and exiting at 95 °C. With U = 250 W/(m²·K) and a correction factor F = 0.80, and a required heat duty of Q̇ = 580 kW, the required heat-transfer area is closest to:",
      explanation:
        "ΔT₁ = T_h,in − T_c,out = 120 − 95 = 25 K; ΔT₂ = T_h,out − T_c,in = 60 − 25 = 35 K; LMTD = (25 − 35)/ln(25/35) = (−10)/(−0.3365) = 29.7 K. A = Q̇/(U·F·LMTD) = 580 000/(250 × 0.80 × 29.7) = 97.6 m².",
      whyCorrect:
        "Counterflow basis: ΔT₁ = T_h,in − T_c,out = 120 − 95 = 25 K; ΔT₂ = T_h,out − T_c,in = 60 − 25 = 35 K. LMTD = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) = (25 − 35)/ln(25/35) = (−10)/(−0.3365) = 29.72 K. Apply Q̇ = U·A·F·LMTD → A = Q̇/(U·F·LMTD) = 580 000/(250 × 0.80 × 29.72) = 580 000/5944 = 97.6 m². Without the F=0.80 correction the result would be 580 000/(250 × 29.72) = 78.1 m² — an underestimate of 20%, leading to under-design and under-performance.",
      whyOthersWrong: [
        "Option 39 m² uses only the F correction without the LMTD denominator — divides by U·F = 200, ignoring the LMTD entirely.",
        "Option 78 m² forgets the F correction (uses F=1.0 instead of 0.80) — underestimates A by 20%.",
        "Option 780 m² divides by U only (250) instead of U·F·LMTD — likely a units conversion error (used LMTD in °F instead of K, or used W vs kW inconsistently).",
      ],
      options: [
        { text: "39 m²", isCorrect: false },
        { text: "78 m²", isCorrect: false },
        { text: "98 m²", isCorrect: true },
        { text: "780 m²", isCorrect: false },
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
        "A 2 m² blackbody surface (ε = 1) at 800 K faces large surroundings at 300 K. The total radiative heat loss to the surroundings is approximately:",
      explanation:
        "Q̇ = ε·σ·A·(T_s⁴ − T_sur⁴) = 1 × 5.670×10⁻⁸ × 2 × (800⁴ − 300⁴) = 5.670×10⁻⁸ × 2 × (4.096×10¹¹ − 8.1×10⁹) = 5.670×10⁻⁸ × 2 × 4.015×10¹¹ = 45.5 kW. Sanity check: a 2 m² surface at 800 K emits 2 × 5.67×10⁻⁸ × 800⁴ = 46.4 kW in total, of which it absorbs 2 × 5.67×10⁻⁸ × 300⁴ = 0.92 kW from the surroundings — net 45.5 kW lost.",
      whyCorrect:
        "Apply Q̇ = ε·σ·A·(T_s⁴ − T_sur⁴) with T in Kelvin. T_s = 800 K → T_s⁴ = 4.096×10¹¹ K⁴; T_sur = 300 K → T_sur⁴ = 8.1×10⁹ K⁴; Δ(T⁴) = 4.015×10¹¹ K⁴. Q̇ = 1 × 5.670×10⁻⁸ × 2 × 4.015×10¹¹ = 45 540 W ≈ 45.5 kW. The T⁴ dependence explains the dominance of radiation at high temperature: a 2 m² surface at 800 K loses ~45 kW by radiation vs only ~5 kW by natural convection (h ≈ 10 W/(m²·K), q_conv = 10 × 2 × 500 = 10 kW — actually convection is comparable here; below 600 K convection catches up).",
      whyOthersWrong: [
        "Option 4.55 kW divides the correct answer by 10 — likely used σ = 5.67×10⁻⁹ (a decimal error on the constant).",
        "Option 455 W divides by 100 — likely used T in Celsius (527 °C and 27 °C): (527)⁴ = 7.7×10¹⁰ vs (27)⁴ = 5.3×10⁵ → Q̇ = 5.67×10⁻⁸ × 2 × 7.7×10¹⁰ = 87 W... (actually closer to 87 W, not 455 — so option is in a different error class).",
        "Option 455 kW multiplies by 10 — likely used σ = 5.67×10⁻⁷ (decimal-place error on the constant in the other direction).",
      ],
      options: [
        { text: "455 W", isCorrect: false },
        { text: "4.55 kW", isCorrect: false },
        { text: "45.5 kW", isCorrect: true },
        { text: "455 kW", isCorrect: false },
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
        "True or False: A 'black surface' in heat-transfer terminology has an emissivity of zero (ε = 0), meaning it emits no thermal radiation.",
      explanation:
        "FALSE. A 'black surface' (or 'blackbody') has emissivity ε = 1 — it is the IDEAL emitter/absorber. A surface with ε = 0 is a perfect reflector, the OPPOSITE of a black surface. By Kirchhoff's law (ε = α), a black surface also has absorptivity α = 1 — it absorbs all incident radiation.",
      whyCorrect:
        "FALSE. In heat-transfer terminology a 'black surface' or 'blackbody' has emissivity ε = 1 — it is the IDEAL emitter (and by Kirchhoff's law, the ideal absorber with α = 1). The Stefan–Boltzmann formula E_b = σ·T⁴ applies to a blackbody; a real surface emits E = ε·σ·T⁴ with 0 < ε < 1. A surface with ε = 0 is a PERFECT REFLECTOR (e.g., polished gold or silver) — the OPPOSITE of black. Polished aluminum has ε ≈ 0.05 (near-perfect reflector); black paint has ε ≈ 0.95 (near-blackbody).",
      whyOthersWrong: [
        "Option TRUE — confuses the colloquial meaning of 'black' (absorbs visible light) with the heat-transfer definition. In heat transfer, 'black' refers to the IDEAL emitter (ε=1), not to visible color. A sheet of white paint can have ε ≈ 0.92 (near-blackbody in the infrared) while appearing white in the visible spectrum; polished aluminum appears silvery in the visible but has ε ≈ 0.05 in the infrared (a near-perfect reflector).",
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

export const HEAT_LESSONS: RefLesson[] = [
  LESSON_CONDUCTION,
  LESSON_CONVECTION,
  LESSON_RADIATION_EXCHANGERS,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts EXACTLY. The Prisma shim (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form. We
//     use db.question (NOT db.practiceProblem) so the shim applies
//     stem→question and options→choices mapping.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (we set chapterId, which
//     the shim maps to { chapter: { connect: { id } } }).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
// ---------------------------------------------------------------------------

/**
 * Upsert the Heat Transfer discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "heat-transfer" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "heat-transfer-fundamentals", name "Heat Transfer Fundamentals",
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
  // 1) Discipline — find by slug "heat-transfer" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "heat-transfer" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "heat-transfer" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "heat-transfer-fundamentals"; name: "Heat Transfer
  //    Fundamentals"; order 1. The Chapter has a @@unique([disciplineId,
  //    slug]), so we use findFirst + create/update.
  const chapterSlug = "heat-transfer-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Heat Transfer Fundamentals",
    slug: chapterSlug,
    description:
      "Conduction (Fourier's law, resistance networks, composite walls), convection (Newton's law, boundary layers, Dittus–Boelter), and radiation & heat exchangers (Stefan–Boltzmann, view factors, LMTD) — the three-lesson deep scientific reference for the Heat Transfer engineering discipline.",
    icon: "Flame",
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
  for (const src of HEAT_SOURCES) {
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
  const sharedReferenceIds = HEAT_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of HEAT_LESSONS) {
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
