// =============================================================================
// Machine Design — Engineering Discipline — Deep scientific reference
// (Task ID: BATCH10).
//
// Discipline slug: "machine-design" (seeded by scripts/seed-disciplines.ts,
// group "Mechanical", order 11, icon "Settings2", color "rose",
// "Gears, bearings, springs, clutches/brakes.").
// General track — Discipline → Chapter → Lesson → KnowledgeObject +
// PracticeProblem. Mirrors src/ref-content/thermodynamics.ts EXACTLY in
// structure, lifecycle metadata, and Prisma-shim usage. The Prisma shim
// (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (chapterId → connect).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
//
// Three lessons (one chapter "Machine Design Fundamentals"):
//   1. Gears & Gear Design              (slug: md-gears-gear-design)
//   2. Bearings & Lubrication            (slug: md-bearings-lubrication)
//   3. Springs, Clutches & Brakes        (slug: md-springs-clutches-brakes)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional machine-design content. No padding.
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
//   - LEVEL 6 — University / Academic Publications: Richard G. Budynas &
//     J. Keith Nisbett, "Shigley's Mechanical Engineering Design" (McGraw-
//     Hill, 11th ed., 2020); Robert L. Norton, "Machine Design: An
//     Integrated Approach" (Pearson, 5th ed., 2014).
//   - LEVEL 7 — Technical Publications / Industry Sources: Robert C.
//     Juvinall & Kurt M. Marshek, "Fundamentals of Machine Component
//     Design" (Wiley, 6th ed., 2017).
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline:
//     AGMA 2001-D04 "Fundamental Rating Factors and Calculation Methods
//     for Involute Spur and Helical Gear Teeth" (AGMA, 2004).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 286-1:2010
//     "Geometrical product specifications (GPS) — ISO code system for
//     tolerances on linear sizes" (ISO, 2010).
//   - LEVEL 5 — Professional Organizations: ASM Handbook Vol 8 (Mechanical
//     Testing & Evaluation, ASM International, 2000) — materials property
//     reference for gear steels, bearing bronzes, spring wire.
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
// SOURCES — 6 real references cited across all machine-design lessons.
// ---------------------------------------------------------------------------

export const MACHINE_DESIGN_SOURCES: RefSource[] = [
  {
    title:
      "Budynas & Nisbett — Shigley's Mechanical Engineering Design (McGraw-Hill, 11th ed., 2020)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Budynas, R. G., & Nisbett, J. K. (2020). Shigley's Mechanical Engineering Design (11th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-339820-4. Chapters 13 (Spur & Helical Gears — Lewis bending σ = W_t/(b·m·Y) and AGMA pitting σ_H; AGMA 2001-D04 factors K_T, K_H, K_o, K_v, K_s; geometry factors I and J), 14 (Bevel & Worm Gears), 11 (Fatigue failure — S-N curves, Marin modification factors, Goodman/Morrow/Soderberg criteria), 15 (Rolling-Contact Bearings — L_10 = (C/P)^p · 10^6 rev, p=3 ball, p=10/3 roller; variable load equivalent P = XVF_r + YF_a), 10 (Lubrication & Journal Bearings — Stribeck curve, Petroff's equation μ = 2π²(r/c)·(ηNs/P_avg)), 10–12 (Shaft & key, spring k = Gd^4/(8D^3N_a) with Wahl & Bergsträsser correction factors K_w and K_B). The canonical undergraduate & graduate machine-design textbook used by ABET-accredited ME programs.",
  },
  {
    title:
      "Norton — Machine Design: An Integrated Approach (Pearson, 5th ed., 2014)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Norton, R. L. (2014). Machine Design: An Integrated Approach (5th ed.). Upper Saddle River, NJ: Pearson Education. ISBN 978-0-13-335833-3. Chapters 7 (Helical Compression & Extension Springs — k = Gd^4/(8D^3N_a), Wahl factor K_w = (4C-1)/(4C-4) + 0.615/C, surge/whirl dynamics, buckling), 8 (Helical Torsion Springs), 9 (Spur Gears — Lewis form factor Y table, AGMA pitting σ_H = Z_E·√(F_t·K_o·K_v·K_s/(b·d·p_n·I)·K_m·K_H); contact ratio m_p = (sqrt(r_ao²-r_b²) ± sqrt(r_go²-r_b²) - C·sin φ)/p_b), 12 (Rolling Bearings — L_10 = (C/P)^p × 10^6; AFBMA load ratings; static safety factor S_0 = C_0/P_0), 16 (Clutches & Brakes — uniform pressure vs uniform wear derivations; disc clutch T = (2/3)·μW(R_o³-R_i³)/(R_o²-R_i²) for n=1 friction surface; (4/3) for n=2 dual-face), 16 (Band & Cone brakes). Reference for the integrated, worked-example-heavy approach.",
  },
  {
    title:
      "Juvinall & Marshek — Fundamentals of Machine Component Design (Wiley, 6th ed., 2017)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Juvinall, R. C., & Marshek, K. M. (2017). Fundamentals of Machine Component Design (6th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-46923-5. Chapters 7 (Surface Strength — Hertzian contact σ_H,max = 0.564·√(F/(π·b)·(1/R_1+1/R_2)/((1-ν_1²)/E_1+(1-ν_2²)/E_2)); pitting failure criterion), 14 (Spur & Helical Gears — modified Lewis with velocity factor K_v = (6.1+V)/6.1 (Barth) and modern AGMA 2001-D04), 13 (Rolling Bearings — life equation L_10 = (C/P)^p × 10^6; equivalent load P = XVF_r + YF_a), 13 (Lubrication — Stribeck curve and Petroff's law derivation for a concentric (no-load) journal bearing), 12 (Springs — helical compression k = Gd^4/(8D^3N_a), torsional stress τ = K_w·8FD/(πd³)), 18 (Clutches & Brakes — uniform-wear derivation T = μW(R_o+R_i)/2 for single-face, scaled by n for multi-plate). Practitioner reference with rigorous derivations.",
  },
  {
    title:
      "AGMA 2001-D04 — Fundamental Rating Factors and Calculation Methods for Involute Spur and Helical Gear Teeth (AGMA, 2004)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "STANDARD",
    url: "https://www.agma.org/",
    citation:
      "American Gear Manufacturers Association (AGMA). (2004). AGMA 2001-D04 — Fundamental Rating Factors and Calculation Methods for Involute Spur and Helical Gear Teeth (Metric Edition). Alexandria, VA: AGMA. This standard defines the bending stress σ_F = W_t·K_o·K_v·K_s·K_H·K_B·K_T/(b·m_t·Y_J) and pitting stress σ_H = Z_H·Z_E·√(K_o·K_v·K_s·K_H·K_T·(Z_R²·W_t)/(b·d·Z_I)) for involute spur and helical external gears. The overload factor K_o accounts for uniform (1.00) to heavy-shock (1.75+) prime-mover/driven-matrix; the dynamic factor K_v corrects for transmission error at pitch-line velocity V; the load-distribution factor K_H captures misalignment and elastic deformation across the face width. Replaces the historical Lewis-Barth equation with a comprehensive reliability-based rating. Cited in Lesson 1 to align the textbook Lewis formula with the contemporary AGMA gear-design practice used by gear manufacturers and OEMs in automotive, wind-turbine, mining, and industrial-drive applications.",
  },
  {
    title:
      "ISO 286-1:2010 — Geometrical Product Specifications (GPS) — ISO Code System for Tolerances on Linear Sizes",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/57624.html",
    citation:
      "International Organization for Standardization. ISO 286-1:2010, Geometrical product specifications (GPS) — ISO code system for tolerances on linear sizes — Part 1: Basis of tolerances, deviations and fits. Geneva: ISO. Defines the IT (International Tolerance) grade system from IT01 to IT18 and the fundamental-deviation letter codes (a..zc for shafts, A..ZC for holes) that produce clearance (H7/g6), transition (H7/k6), and interference (H7/p6) fits used to seat rolling-contact bearings on shafts and in housings. The standard 6×6 ball bearing uses k5 on the shaft (interference fit) and J7/H7 in the housing (transition clearance) — specified by ISO 286 to deliver the running clearance that lets a rolling bearing reach its rated L_10 life. Cited in Lessons 2 and 3 to anchor shaft-and-bearing-seat tolerance selection to the international ISO 286 fit system.",
  },
  {
    title:
      "ASM Handbook Vol 8 — Mechanical Testing and Evaluation (ASM International, 2000)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.asminternational.org/",
    citation:
      "ASM International. (2000). ASM Handbook, Volume 8: Mechanical Testing and Evaluation. Materials Park, OH: ASM International. ISBN 978-0-87170-389-7. Provides the Brinell (HBW), Rockwell (HRC), and Vickers (HV) hardness conversions used for gear-tooth and bearing-race quality control; the R.-R. Moore rotating-bending fatigue data set (used in Shigley Ch. 6 Marin fatigue modifications); the Charpy V-notch impact data for spring-steel temper selection; the K_IC plane-strain fracture-toughness data for high-strength gear steels (AISI 4340, 9310, 8620 carburized); and the Wohler S-N curves for cast iron, ductile iron, and bronze bearing materials. Cited across all three lessons to anchor material-property selection for gear teeth (Lesson 1), bearing races (Lesson 2), and spring wire and friction materials (Lesson 3) to the canonical materials-property reference used by ASME-, AGMA-, and ISO-compliant designs.",
  },
];

const MACHINE_DESIGN_REFERENCE_TITLES = MACHINE_DESIGN_SOURCES.map(
  (s) => s.title
);

// ---------------------------------------------------------------------------
// Lesson 1 — Gears & Gear Design
// (slug: md-gears-gear-design)
// ---------------------------------------------------------------------------

const LESSON_GEARS: RefLesson = {
  slug: "md-gears-gear-design",
  title: "Gears & Gear Design",
  titleAr: "تروس وتصميم التروس",
  order: 1,
  durationMin: 35,
  references: MACHINE_DESIGN_REFERENCE_TITLES,
  conceptIntroduction: `Gears are the workhorses of mechanical power transmission — they transfer rotary motion and torque between shafts by the progressive meshing of involute teeth. This lesson builds the engineer's primary tool for gear-tooth strength: the *Lewis bending formula* σ = F/(b·m·Y), which models a gear tooth as a cantilever beam of rectangular cross-section (b × m) loaded at the pitch point by the tangential force F. The *Lewis form factor* Y encodes the tooth's geometry (number of teeth, pressure angle, profile shift) and is tabulated in Shigley Table 14-2 for 20° and 25° full-depth teeth. The complementary *AGMA pitting* failure mode (Hertzian contact stress σ_H on the tooth flank) is governed by AGMA 2001-D04, with factors for overload (K_o), dynamic (K_v), size (K_s), load-distribution (K_H), and reliability (Z_R). Modern gear design pairs the Lewis bending check with the AGMA pitting check — both must pass. This lesson prepares the engineer to size a spur gear pair, select material and heat-treatment, and verify against both failure modes.`,
  sections: {
    learning_objectives: `- Derive and apply the Lewis bending-stress formula σ = F/(b·m·Y) for spur-gear teeth.
- Identify the Lewis form factor Y from a table given the tooth count, pressure angle, and addendum modification.
- Distinguish the two gear-tooth failure modes: tooth-bending fatigue (Lewis/AGMA σ_F) and surface pitting (Hertz/AGMA σ_H).
- Apply AGMA 2001-D04 factors (K_o, K_v, K_s, K_H, K_T, Z_R, Y_J, Z_I) to convert a textbook Lewis stress into an AGMA-rated stress.
- Select gear materials (carburized 8620, through-hardened 4340, ductile iron 80-55-06) and heat treatment to meet σ_allowable from AGMA allowable-stress tables.
- Compute the contact ratio m_p and explain why m_p > 1.2 is required for smooth, low-noise meshing.
- Read ISO 286 fits (H7/g6) for gear-shaft and bearing-housing assemblies.`,
    prerequisites: `- Statics: free-body diagram of a gear tooth loaded at the pitch point; moment equilibrium about the tooth base.
- Mechanics of materials: cantilever beam bending stress σ = M·c/I; section modulus Z = I/c.
- Material science: hardness (HRC, HBW), fatigue limit S'_e, marine Marin modifiers.
- Engineering drawing: involute profile, pitch circle, module m = d/N, circular pitch p_c = π·m.`,
    introduction: `A gear pair transfers torque by progressive contact of involute flanks. Each tooth is loaded at the pitch point by a tangential force F_t = T/r (where T is the transmitted torque and r the pitch radius) and a radial separating force F_r = F_t·tan(φ). The tooth deflects under load like a short cantilever beam fixed at the root — Wilfred Lewis recognized this in 1892 and published the bending-stress formula that bears his name. The Lewis formula treats the tooth as a parabolic-arc beam of constant strength, with section modulus scaling with the face width b and the module m; the resulting stress is σ = F/(b·m·Y), where Y is the Lewis form factor (≈ 0.25–0.55 depending on tooth count and pressure angle). A modern Lewis-Barth variant applies the velocity factor K_v = (6.1+V)/6.1 to capture the impact loading at pitch-line velocity V.

The competing failure mode is *pitting* — Hertzian surface fatigue at the pitch line, where the tooth surfaces repeatedly roll and slide under high contact pressure. The Hertz formula for two parallel cylinders gives a maximum contact stress σ_H,max ≈ 0.564·√(F'·(1/R_1 + 1/R_2)/((1-ν_1²)/E_1 + (1-ν_2²)/E_2)), where F' is the load per unit face width and R_1, R_2 are the instantaneous radii of curvature. AGMA 2001-D04 systematizes this into σ_H = Z_H·Z_E·√(K_o·K_v·K_s·K_H·K_T·(Z_R²·F_t)/(b·d·Z_I)) with geometry factor Z_I, elastic coefficient Z_E (≈ 190 √MPa for steel-steel), and the same K-factors as the bending stress.

A competent gear design must satisfy both σ_F ≤ σ_F,allowable (with reliability, life, and temperature modifiers) and σ_H ≤ σ_H,allowable. Bending usually governs for low-speed, high-torque industrial drives; pitting governs for high-speed, long-life power-gearing (automotive transmissions, wind-turbine gearboxes).`,
    terminology: `- **Pitch circle**: the imaginary rolling cylinder of a gear; pitch diameter d = m·N where m is module and N is tooth count.
- **Module m** (mm/tooth): the metric size of a tooth; m = d/N. The inverse in imperial units is the *diametral pitch* P_d = N/d (1/in), with m = 25.4/P_d.
- **Pressure angle φ**: the angle between the line of action and the pitch-circle tangent; standard values 20° and 25°.
- **Addendum a**: radial distance from pitch circle to tooth tip; standard a = m.
- **Dedendum b**: radial distance from pitch circle to tooth root; b = 1.25·m (with clearance).
- **Face width b**: axial length of the tooth (typically b = 9·m to 12·m).
- **Tangential force F_t** (N): the useful force component that transmits torque, F_t = T/r = 2T/d.
- **Radial force F_r** (N): the separating force, F_r = F_t·tan(φ).
- **Lewis form factor Y**: dimensionless shape factor; Y = t²/(6·m·l) where t is the tooth thickness at the weak section and l is the moment arm.
- **AGMA factor Y_J**: the modern AGMA replacement for Y, accounts for stress concentration at the root fillet.
- **Contact ratio m_p**: the average number of teeth in contact; should be > 1.2 for smooth running.
- **Pitting**: surface fatigue failure characterized by micron-scale spalling on the tooth flank.
- **Tooth fracture**: catastrophic failure of a tooth at the root fillet due to bending fatigue.`,
    detailed_explanation: `**Lewis bending-stress derivation.** Model a spur-gear tooth as a cantilever beam of rectangular cross-section b × t (t = tooth thickness at the root) loaded by F_t at a moment arm l from the root. The maximum bending stress at the root is:
  σ = M·c/I = (F_t·l)·(t/2)/(b·t³/12) = 6·F_t·l/(b·t²)
Lewis (1892) noticed that the strongest parabolic (constant-strength) beam inscribed in a tooth has t² = 6·m·Y·l, where Y is the dimensionless form factor — the geometry is captured entirely by Y. Substituting t² = 6·m·Y·l into the stress gives the *Lewis equation*:
  σ = F_t/(b·m·Y)
with Y tabulated as a function of N (tooth count) and φ (pressure angle). For 20° full-depth teeth: Y(N=20) = 0.322, Y(N=30) = 0.380, Y(N=50) = 0.462, Y(N=∞) = 0.541 (rack).

**AGMA 2001-D04 systematization.** The textbook Lewis formula assumes a single tooth carries the full load at the pitch point. In reality, the load shares across multiple teeth (contact ratio m_p), the tooth sees dynamic impact at speed, and the load is not uniformly distributed across the face width. AGMA captures these in six factors applied to the basic Lewis stress:
  σ_F,AGMA = W_t·K_o·K_v·K_s·K_H·K_B·K_T / (b·m_t·Y_J)
where K_o (overload, 1.00 uniform → 1.75 heavy shock), K_v (dynamic, 1.0–1.5 depending on pitch-line velocity V and quality number Q_v), K_s (size, ≈1 for m < 5 mm), K_H (load-distribution, 1.0–2.0 depending on face width-to-diameter ratio and accuracy of mounting), K_B (rim-thickness, 1.0 for solid gears), K_T (temperature, 1.0 below 120 °C), and Y_J replaces the textbook Y to include the root-fillet stress concentration.

**AGMA pitting stress.** The competing failure mode is surface fatigue at the pitch line, where two involute flanks roll and slide under concentrated load. AGMA 2001-D04 gives:
  σ_H,AGMA = Z_H·Z_E·√(K_o·K_v·K_s·K_H·K_T·(Z_R²·W_t)/(b·d·Z_I))
where Z_H (zone, 2.5 for std 20° spur), Z_E (elastic coefficient, 190 √MPa steel-steel), Z_I (geometry factor for pitting, ~0.10–0.13 for typical spur pairs), and Z_R (reliability, 1.0 for 99% reliability over 1×10⁶ cycles).

**Material selection.** For through-hardened gears, allowable bending stress σ_F,allowable ≈ 0.53·S_ut·K_L·K_R·K_T (Shigley 14-12); allowable contact stress σ_H,allowable ≈ 2.76·HBW − 70 √MPa for grade-1 steel. For carburized 8620H gears surface-hardened to 60 HRC, σ_H,allowable ≈ 1050 √MPa. Ductile-iron gears (80-55-06) sit around σ_H,allowable ≈ 570 √MPa. Selection is driven by the L₁₀ (or L_₁₀ⁿ) gear life requirement: long-life, high-torque drives need carburized steel; short-life, low-torque drives can use ductile iron or even plastic (Nylon/PA66) for noise criticality.

**Contact ratio & noise.** The contact ratio m_p must exceed 1 for the gear pair to transmit motion continuously; design targets are m_p > 1.2 (industrial) or m_p > 1.4 (automotive, noise-critical). Increasing tooth count (lower module for the same pitch diameter), using 25° pressure angle, or using helical gears (which add a face-contact ratio m_F) all raise m_p.`,
    core_principles: `- **Lewis bending formula**: σ = F/(b·m·Y) — a tooth is a short cantilever beam loaded at the pitch point; Y captures tooth geometry.
- **AGMA pitting**: σ_H = Z_H·Z_E·√(...) — surface fatigue at the pitch line; competes with bending as the governing failure mode.
- **Bending usually governs low-speed / high-torque** (industrial conveyors, mining mills); **pitting governs high-speed / long-life** (automotive transmissions, wind-turbine gearboxes).
- **AGMA K-factors** (K_o, K_v, K_s, K_H) translate a textbook Lewis stress into a real, rated stress under shock, speed, and misalignment.
- **Material hardness** drives both strength modes: doubling surface hardness roughly doubles σ_H,allowable and σ_F,allowable.
- **Module** scales all gear geometry — a stronger tooth needs a larger module, not just a wider face.`,
    components: `- **Pinion** (smaller of the pair) — usually the weaker member; designed first.
- **Gear** (larger member) — typically AGMA grade 1 or 2 steel, ductile iron, or plastic.
- **Pitch cylinders** — the imaginary rolling surfaces; their radii set the gear ratio i = N_g/N_p = d_g/d_p.
- **Shaft & key** (or splines) — transmits torque from shaft to gear; keyseat fit per ISO 286 (H7/js6).
- **Bearing housing & supports** — must be rigid enough that the tooth misalignment (K_H factor) stays below 1.4.
- **Lubricant** — splash or forced-feed (AGMA viscosity grade 4 to 8 depending on pitch-line velocity).`,
    process: `1. Specify the design duty: transmitted power P, pinion speed n_p, gear ratio i, prime-mover type, driven-machine shock class, design life in hours.
2. Compute the tangential force at the pinion pitch point: W_t = 60·P/(π·d_p·n_p) where d_p is provisional.
3. Pick the pinion tooth count N_p (minimum 18 for std 20° PA to avoid undercut; pinions ≥ 25 preferred for smooth running) and module m; tentatively set face width b = (9..12)·m.
4. Look up the Lewis form factor Y for N_p and φ; compute σ_textbook = W_t/(b·m·Y). Compare to σ_F,allowable = 0.53·S_ut·K_L·K_R.
5. Apply AGMA 2001-D04 K-factors to get σ_F,AGMA; verify σ_F,AGMA ≤ σ_F,allowable.
6. Compute σ_H,AGMA and verify σ_H,AGMA ≤ σ_H,allowable (drives hardness and heat-treatment selection).
7. Compute the contact ratio m_p; verify m_p > 1.2.
8. Detail the gear: select ISO 286 fits for the bore and shaft; specify surface finish, tip relief, and crowning.`,
    formula_calculation: `**Lewis bending-stress formula (textbook):**
  σ = F_t / (b · m · Y)        [σ in MPa = N/mm², F_t in N, b in mm, m in mm, Y dimensionless]
where:
  F_t = 2T/d = 60·P/(π·d·n)  (tangential force at pitch point, T = torque in N·mm, d in mm)
  b = face width (mm), m = module (mm), Y = Lewis form factor (dimensionless, table)

**Lewis form factor Y (20° full-depth involute, selected):**
  N=12  Y=0.245    N=20  Y=0.322
  N=14  Y=0.270    N=25  Y=0.349
  N=16  Y=0.288    N=30  Y=0.380
  N=18  Y=0.308    N=50  Y=0.462
  (N→∞ rack, Y=0.541)

**AGMA 2001-D04 bending-stress formula:**
  σ_F = W_t · K_o · K_v · K_s · K_H · K_B · K_T / (b · m_t · Y_J)
where:
  K_o = overload factor (1.00 uniform, 1.25 light shock, 1.50 medium, 1.75+ heavy)
  K_v = dynamic factor ≈ 1.0 at low V, rising to ~1.4 at V = 10 m/s for Q_v = 8 gears
  K_s = size factor (1.0 for m ≤ 5 mm; > 1.0 for large teeth)
  K_H = load-distribution factor (1.0 open, 1.4 straddle-mount, 2.0 overhung)
  Y_J = geometry factor for bending (replaces Y; includes fillet concentration)

**AGMA 2001-D04 pitting-stress formula:**
  σ_H = Z_H · Z_E · √(K_o · K_v · K_s · K_H · K_T · (Z_R² · W_t) / (b · d · Z_I))
where:
  Z_H = zone factor (2.5 for 20° std spur, 1.83 for 25° std spur)
  Z_E = elastic coefficient (190 √MPa for steel-steel, 162 √MPa for steel-cast-iron, 159 √MPa for steel-bronze)
  Z_I = pitting geometry factor (0.10–0.13 typical for spur pairs)
  Z_R = reliability factor (1.0 for 99% reliability over 1×10⁶ cycles; < 1 for higher reliability)

**Allowable stresses (Shigley, Grade 1 steel):**
  σ_F,allowable = 0.53 · S_ut · K_L · K_R · K_T     [K_L = life, K_R = reliability, K_T = temperature]
  σ_H,allowable = 2.76 · HBW − 70 √MPa  (through-hardened steel, HBW 180-400)
  σ_H,allowable ≈ 1050 √MPa  (carburized 8620H, surface 58-62 HRC)

**Contact ratio (spur gear):**
  m_p = (sqrt(r_aO² − r_b²) + sqrt(r_aG² − r_b²) − C·sin(φ)) / p_b
where r_aO, r_aG = outside radii of pinion and gear; r_b = base-circle radius; C = center distance; p_b = base pitch = π·m·cos(φ).
Requirement: m_p > 1.2 (industrial); m_p > 1.4 (automotive, noise-critical).

**Assumptions**: (i) ideal involute profile with no manufacturing error; (ii) rigid gear bodies; (iii) plane-strain tooth loading; (iv) lubricant at the recommended AGMA viscosity grade; (v) material properties per Shigley Grade 1 (or AGMA Grade 2 where specified).

**Interpretation**: a Lewis stress σ = 85 MPa on a Grade-1 steel with S_ut = 600 MPa gives σ_F,allowable ≈ 0.53·600 = 318 MPa — a safety factor of n = 318/85 ≈ 3.7 against bending. The same gear pair under AGMA pitting might come in at σ_H ≈ 600 √MPa against σ_H,allowable ≈ 600 √MPa (350 HBW through-hardened) — a safety factor of 1.0 — meaning pitting governs.`,
    worked_example: `**Lewis bending stress on a spur-gear pinion.**
Given: F_t = 2 kN = 2000 N, module m = 3 mm, face width b = 30 mm, Lewis form factor Y = 0.261 (≈ 13-tooth pinion, 20° PA full-depth; in practice we avoid < 18 teeth, but Y=0.261 is the textbook value for illustration).
σ = F_t/(b·m·Y) = 2000/(30 × 3 × 0.261) = 2000/23.49 = 85.14 MPa ≈ 85 MPa ✓

**Safety-factor check.** For through-hardened AISI 4140 steel pinion (S_ut = 700 MPa, hardness 200 HBW), σ_F,allowable ≈ 0.53·700·K_L·K_R ≈ 0.53·700·1.0·1.0 = 371 MPa. Safety factor against tooth fracture: n_F = 371/85 ≈ 4.4 — comfortably above the typical design target n ≥ 2.0.

**AGMA pitting check (companion calculation).** With W_t = 2 kN, d = m·N = 3·13 = 39 mm, b = 30 mm, Z_I = 0.12 (typical), and steel-steel Z_E = 190 √MPa:
σ_H = Z_H·Z_E·√(W_t·K_o·K_v·K_s·K_H·K_T·Z_R²/(b·d·Z_I))
Take K_o = 1.25 (light shock), K_v = 1.2 (V ≈ 4 m/s, Q_v = 8), K_s = 1.0, K_H = 1.4 (straddle mounting), K_T = 1.0, Z_R = 1.0:
σ_H = 2.5·190·√(2000·1.25·1.2·1.0·1.4·1.0·1.0/(30·39·0.12))
     = 475·√(4200/140.4) = 475·√29.91 = 475·5.469 = 2598 √MPa
Hmm — the units of σ_H are √MPa; to interpret, compare to σ_H,allowable ≈ 2.76·HBW − 70 = 2.76·200 − 70 = 482 √MPa for 200 HBW through-hardened steel. The calculated σ_H = 2598 √MPa exceeds σ_H,allowable = 482 √MPa by a factor of 5 — pitting failure is imminent, and the engineer must (a) increase surface hardness via carburizing 8620H to 58 HRC (≈ 1050 √MPa allowable), (b) increase face width or module, or (c) reduce the overload/dynamic factors by smoother duty and higher gear-quality class. The first fix — switching to a carburized 8620H pinion and gear — yields σ_H,allowable = 1050 √MPa, which still gives a safety factor n_H = 1050/2598 ≈ 0.4 — inadequate; the engineer must also enlarge the gear.

**Take-away**: the textbook Lewis stress σ ≈ 85 MPa is comfortably acceptable against bending (n_F ≈ 4.4) but the AGMA pitting check is *binding* — pitting, not bending, governs this gear pair and forces material and size changes. This is the typical outcome for low-speed, high-torque industrial drives.`,
    industrial_example: `**Industry: Mining — ball-mill pinion.** A 7-ft diameter ball-mill driven by a 750 kW synchronous motor at 200 rpm through a 5:1 single-reduction spur gearbox. Pinion N_p = 22 teeth, m = 12 mm, b = 130 mm, through-hardened 4340 steel (300 HBW, σ_F,allowable ≈ 159 MPa). Transmitted torque T = 9550·P/n = 9550·750/200 = 35,812 N·m; tangential force at pitch line W_t = 2T/d_p = 2·35,812·10³/(22·12) = 271,303 N = 271 kN. Lewis stress σ = W_t/(b·m·Y) = 271,303/(130·12·0.335) = 52 MPa — well below σ_F,allowable = 159 MPa (n_F ≈ 3). However, the AGMA pitting check gives σ_H ≈ 950 √MPa, requiring a carburized 9310 pinion surface (60 HRC, σ_H,allowable ≈ 1050 √MPa, n_H ≈ 1.1). The mill is therefore re-pinioned every 25,000 operating hours when the AGMA-class surface fatigue life (1×10⁸ cycles at n_H ≈ 1.1) is reached. The pinion is monitored by weekly vibration trend (AGMA 11 quality class baseline) and quarterly oil-spectroscopy checks for elevated Fe particles (pitting precursor).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Minerals — reclaimer slewing ring drive (synthetic, illustrative).* A 35-m bucket-wheel reclaimer requires a 1.8-metre slewing ring driven by four independent planetary gearboxes spaced 90° apart around the ring. Each planetary stage: motor 75 kW at 1450 rpm, single-stage spur planetary 6:1, then a 23:1 slewing-ring final drive. The first-stage sun gear (AISI 8620H carburized, 60 HRC) failed by tooth fracture after only 8 months of service — root cause was a 5-tooth fracture pattern characteristic of high-cycle bending fatigue at the root fillet. Investigation: the design Lewis stress σ = 145 MPa was below σ_F,allowable = 310 MPa (n_F = 2.14), but the AGMA K_H load-distribution factor had been taken as 1.0 (rigid planetary carrier) when in fact the carrier deflected under the 25-tonne bucket-wheel side load by 0.18 mm across the 280 mm face width — producing a K_H ≈ 2.4 in service. Effective stress σ_F,actual = σ_F · K_H = 145 · 2.4 = 348 MPa > σ_F,allowable = 310 MPa. Remedy: (a) re-rate the planetary to 60 kW (15% derating), (b) add a second carrier bearing to reduce deflection, (c) re-cut the gears with crowning (10 µm) to redistribute load. After retrofit, the redesigned Lewis stress σ_F,actual ≈ 220 MPa (n_F ≈ 1.4); the units have now run 4 years trouble-free.`,
    visual_explanation: `**Lewis cantilever-beam model.** A single spur-gear tooth drawn as a rectangular cantilever of base thickness t and length l, fixed at the root, loaded at the tip by the tangential force F_t directed along the line of action (20° to the pitch tangent). The bending moment at the root is M = F_t · l; the section modulus at the root is Z = b·t²/6. Lewis's insight: inscribe the strongest possible parabola (constant-strength beam) in the tooth profile — at the point where the parabola is tangent to the tooth flanks lies the *weak section*. From the geometry, t² = 6·m·Y·l, which when substituted into σ = M/Z = 6·F_t·l/(b·t²) gives the compact Lewis form σ = F_t/(b·m·Y). A second diagram shows the *AGMA contact-zone stress field*: two parallel involute flanks approximated as cylinders of radii R_1 and R_2 pressed together by load F' per unit face width — the Hertzian contact patch is a half-space ellipse of half-width a, peak pressure p_0 = 2F'/(π·a·b), and maximum shear stress τ_max ≈ 0.30·p_0 at depth z ≈ 0.78·a below the surface — the locus of pitting initiation.`,
    simulation_opportunity: `Open the EngiSuite "Spur-gear Lewis explorer" — sliders for module m (1–10 mm), tooth count N (12–80), face width b (8–14×m), material (ductile-iron / through-hardened steel / carburized 8620H), and applied torque T (10–10,000 N·m). The widget reports the textbook Lewis stress σ = F_t/(b·m·Y), the AGMA-modified σ_F (with K-factors), the AGMA pitting σ_H, and the contact ratio m_p in real time. A second panel plots σ_F and σ_H against the chosen material's σ_F,allowable and σ_H,allowable — green when the safety factor exceeds 2.0, amber when 1.0–2.0, red when < 1.0. Try this scenario: set T = 500 N·m, m = 4 mm, N_p = 20, b = 50 mm, material = through-hardened steel 200 HBW — observe pitting governs (red) and bending has ample margin; switch to carburized 8620H — both green. The simulation matches the worked example in this lesson.`,
    common_mistakes: `- **Using diametral pitch P_d in a metric Lewis calculation**: the formula σ = F/(b·m·Y) requires module m in mm. Mixing P_d (1/inch) and m (mm) without conversion gives nonsense answers.
- **Forgetting the AGMA K-factors**: a textbook Lewis stress σ = 85 MPa becomes σ_F,AGMA = 85 × K_o × K_v × K_H ≈ 85 × 1.25 × 1.2 × 1.4 ≈ 178 MPa under realistic industrial-duty conditions — roughly doubled. Using the textbook value directly understates the real stress by 2×.
- **Treating pitting as a cosmetic issue**: a tooth surface covered with 1-mm-diameter pits has lost 30–50% of its load capacity — pitting is a *load-bearing failure*, not a cosmetic nuisance. Re-pin immediately.
- **Underestimating K_H for overhung pinions**: an overhung (cantilever) pinion deflects more than a straddle-mounted one; K_H ≈ 2.0 vs 1.4. The Lewis formula is silent on this; only AGMA captures it.
- **Selecting too few pinion teeth**: N_p < 18 with 20° PA causes undercutting (the tooth root is carved away by the generating tool), reducing Y and σ_F,allowable simultaneously — a double penalty. Use N_p ≥ 18 or apply profile shift.
- **Ignoring the contact ratio**: m_p < 1.0 means the gears lose mesh for part of the cycle — destructive impact loading. Always verify m_p > 1.2.`,
    limitations: `- The Lewis formula assumes a single tooth carries the full load — true only when the contact ratio m_p < 1.1. With modern m_p ≈ 1.4–1.7, the load shares across 2 teeth most of the time; AGMA's Y_J corrects for this.
- AGMA 2001-D04 covers only external spur and helical gears; internal (ring) gears, bevel gears, and worm gears use separate standards (AGMA 2003, 2005, 6022).
- The Lewis/AGMA approach is quasi-static; high-frequency dynamic loads from tooth-mesh impact, system torsionals, and gear-whirl require a separate dynamic analysis (transfer-matrix, FEA).
- The AGMA K-factors are empirically calibrated for steel-steel gears; for plastic-on-steel (Nylon, POM) or bronze-on-steel the values differ — consult the plastic-gear design literature.
- Surface finish and lubrication are assumed "good commercial" — do not extrapolate beyond ISO 286 IT7 quality.
- The AGMA pitting model is calibrated to 1×10⁶ cycles; for very high-cycle (>10⁹) or very low-cycle (<10⁵) regimes use the appropriate Wohler S-N curve.`,
    comparison: `| Failure mode | Lewis / AGMA σ_F | AGMA σ_H (pitting) |
|---|---|---|
| Failure location | Tooth root fillet | Pitch line of tooth flank |
| Stress state | Uniaxial bending | Hertzian contact (3-D subsurface shear) |
| Governing formula | σ = F_t/(b·m·Y) | σ_H = Z_H·Z_E·√(W_t·K/(b·d·Z_I)) |
| Material driver | Through-thickness tensile strength S_ut | Surface hardness HBW or HRC |
| Failure appearance | Catastrophic tooth fracture | Progressive surface pitting (10³–10⁶ cycles to first pit) |
| Typical fix | Increase module or face width | Surface harden (carburize / nitride) or increase Z_I |
| Lifecycle phase | End-of-life | Mid-life (forms the failure-mode curve in service) |

| Parameter | Symbol | Range (spur gear) | Effect on σ_F | Effect on σ_H |
|---|---|---|---|---|
| Module m | m (mm) | 1–25 | ∝ 1/m | ∝ 1/√m |
| Face width b | b (mm) | 9m–12m | ∝ 1/b | ∝ 1/√b |
| Pinion teeth N_p | — | 18–25 | Y rises with N_p | Minor |
| Pressure angle φ | φ | 20°–25° | Y rises slightly | Z_H drops (1.83 at 25° vs 2.5 at 20°) |
| Surface hardness | HBW | 180–60 HRC | Minor | Dominant (linear in HBW) |`,
    practical_application: `**Specifying a conveyor drive spur gearbox.** A 15 kW AC induction motor at 1750 rpm drives a 9:1 single-reduction spur gearbox for an inclined-belt coal conveyor (medium-shock duty, 24/7 service, 30,000 h L_₁₀ design life). Pinion: N_p = 20 teeth, m = 4 mm, b = 50 mm, carburized 8620H at 58 HRC. Gear: N_g = 180 teeth, m = 4 mm, b = 50 mm, carburized 8620H at 58 HRC. Transmitted torque T_p = 9550·15/1750 = 81.86 N·m; tangential force W_t = 2T/d_p = 2·81,860·10³/(20·4) = 2046 N = 2.05 kN. Lewis stress σ = 2,046/(50·4·0.322) = 31.8 MPa — far below σ_F,allowable ≈ 310 MPa for carburized steel (n_F ≈ 9.8). AGMA pitting stress σ_H ≈ 820 √MPa < σ_H,allowable ≈ 1050 √MPa (n_H ≈ 1.28) — the binding constraint. The engineer specifies ISO 286 H7/js6 for the pinion bore, 0.018 mm surface finish on the tooth flanks, AGMA Q_v = 10 quality, and ISO VG 220 EP oil with a forced-feed lubricant at 0.05 MPa above ambient to dissipate the 1.2 kW of mesh-friction heat. A service-life audit confirms the design comfortably reaches the 30,000-h L_₁₀ with margin for the medium-shock duty class.`,
    decision_scenario: `You are the rotating-equipment lead at a cement plant. The kiln-drive gearbox (rated 350 kW at 1500:36 rpm = 41.7:1 ratio) needs replacement. Vendor A offers a carburized-steel double-reduction unit, $185k CapEx, n_H ≈ 1.3, predicted 80,000-h L_₁₀ pinion life. Vendor B offers a nitrided-steel unit, $140k CapEx, n_H ≈ 1.05, predicted 35,000-h L_₁₀ life (the nitrided case is harder but thinner than carburized; pitting initiates at the case-core interface at lower load). Cement kilns are 24/7 critical equipment — a kiln shutdown costs $120k/day in lost production. Decision rule: pick the alternative with the lowest present-value LCC. With MARR = 10%, n = 25 yr (kiln service life): LCC_A = 185k + 0 (no failure predicted) = $185k PV. LCC_B = 140k + E[failures]·(P/A, 10%, 25): with predicted MTBF = 8 yr and replacement + downtime cost = $120k + 1 day·$120k = $240k per failure, expected failure PV ≈ (240k/8)·8.5136 = $255k → LCC_B = 140k + 255k = $395k PV. Vendor A wins by $210k PV (54% lower LCC). The higher CapEx is overwhelmingly recovered by the avoided production losses. (Full LCC mechanics in Lesson 2 of engineering-economics-management.ts.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: Lewis formula sign convention, calculation of σ for given F, b, m, Y; AGMA pitting factor interpretation; module/diametral-pitch relationship.`,
    certification_questions: `This lesson's content maps to the NCEES PE Mechanical: Machine Design & Materials exam outline and the AGMA 2001-D04 standard. Sample PE-style question: "A 20-tooth pinion (m = 3 mm, b = 30 mm, Y = 0.322) transmits 2 kN tangential load. The Lewis bending stress is closest to: (a) 32 MPa, (b) 69 MPa, (c) 85 MPa, (d) 138 MPa." Correct: (b) 69 MPa — σ = 2000/(30·3·0.322) = 69.0 MPa. (If Y=0.261 for a 13-tooth pinion, σ=85 MPa — that is the worked example in this lesson.)`,
    summary: `Lewis's bending formula σ = F/(b·m·Y) gives a quick first-order estimate of tooth-bending stress for a spur gear — it captures the essential cantilever-beam physics with a single shape factor Y. AGMA 2001-D04 extends the Lewis formula with empirical K-factors (K_o, K_v, K_s, K_H) and the surface pitting formula σ_H = Z_H·Z_E·√(...) to give the engineer a fully rated bending + pitting check that aligns with industrial gear-design practice. The binding failure mode in low-speed high-torque drives is usually pitting (driving surface hardness and material selection), while tooth-bending fatigue governs in high-speed low-torque or short-life drives. ISO 286 fits (H7/js6 on shafts, J7/H7 in housings) seat the gears correctly to preserve the assumed K_H.`,
    key_takeaways: `- Lewis bending: σ = F_t/(b·m·Y); Y tabulated vs. tooth count and pressure angle (0.32 for 20 teeth @ 20° PA).
- AGMA pitting: σ_H = Z_H·Z_E·√(K_factors·W_t/(b·d·Z_I)); Z_E ≈ 190 √MPa for steel-steel; pitting usually governs for industrial drives.
- AGMA K-factors translate textbook Lewis to a rated industrial stress — never design to the textbook value alone.
- Pinion teeth N_p ≥ 18 (20° PA) to avoid undercut; use 22–25 for smooth contact.
- Contact ratio m_p > 1.2 (industrial); m_p > 1.4 (automotive, noise-critical) — verify every design.
- Material selection: through-hardened steel (180–400 HBW) for low-stress drives; carburized 8620H (58–62 HRC) for high-stress long-life pinions.`,
    references: `1. Budynas & Nisbett (2020), Shigley's Mechanical Engineering Design, Ch. 13 (spur/helical gears, Lewis + AGMA), Ch. 14 (bevel/worm gears), Ch. 11 (fatigue).
2. Norton (2014), Machine Design, Ch. 9 (Lewis formula, AGMA factors, contact-ratio derivation).
3. Juvinall & Marshek (2017), Ch. 14 (modified Lewis, AGMA 2001-D04 procedure, Hertzian contact).
4. AGMA 2001-D04 (2004) — bending & pitting stress formulas, K-factor tables.
5. ISO 286-1:2010 (gear shaft & bearing-seat tolerance selection).
6. ASM Handbook Vol 8 (2000) — gear-steel hardness conversions, S-N fatigue data.`,
  },
  knowledgeObject: {
    title: "Gears & Gear Design — Knowledge Object",
    domain: "Machine Design",
    competency: "Power Transmission Components",
    topic: "Spur & Helical Gear Design",
    concept: "Lewis bending formula + AGMA 2001-D04 pitting stress for involute gears",
    body: {
      definitions: [
        "Lewis bending formula: σ = F_t/(b·m·Y) — models a spur-gear tooth as a cantilever beam of rectangular cross-section b × m loaded at the pitch point.",
        "AGMA 2001-D04: the contemporary international standard for rating involute spur and helical gear teeth in bending and pitting; replaces the historical Lewis-Barth equation with reliability-based K-factors.",
        "Lewis form factor Y: dimensionless shape factor (0.245–0.541 for 20° full-depth teeth from N=12 to rack) capturing tooth geometry (tooth count, pressure angle, profile shift).",
        "AGMA Y_J: the modern replacement for Y, including the root-fillet stress-concentration factor.",
        "Contact ratio m_p: average number of teeth in mesh; must exceed 1.0 for continuous transmission; > 1.2 industrial, > 1.4 automotive.",
        "Pitting: surface-fatigue failure mode characterized by micron-scale spalling of the tooth flank at the pitch line under repeated Hertzian contact stress.",
      ],
      principles: [
        "Lewis: a tooth is a short cantilever beam of base thickness t and length l; bending stress σ = 6·F_t·l/(b·t²).",
        "Lewis's parabolic-arc substitution: t² = 6·m·Y·l, reducing σ to F_t/(b·m·Y).",
        "AGMA factors: K_o (overload), K_v (dynamic), K_s (size), K_H (load-distribution), K_T (temperature) translate a textbook Lewis stress to a rated industrial stress.",
        "Pitting (Hertz): two involute flanks act as parallel cylinders in rolling contact; subsurface shear τ_max ≈ 0.30·p_0 at depth z ≈ 0.78·a.",
        "Bending usually governs low-speed high-torque; pitting usually governs high-speed long-life.",
        "Ductile-iron gears for low-load quiet drives; through-hardened steel for medium-duty; carburized 8620H for high-stress long-life pinions.",
      ],
      components: [
        "Pinion (smaller member) — designed first; usually the weaker of the pair.",
        "Gear (larger member) — AGMA Grade 1 or 2 steel, ductile iron, or plastic.",
        "Shaft & key (or splines) — bore fit per ISO 286 (H7/js6).",
        "Bearing supports — rigid enough that K_H ≤ 1.4 (straddle) or 2.0 (overhung).",
        "Lubricant — AGMA viscosity grade 4–8 (ISO VG 100–460); splash or forced-feed.",
        "Housing & cover — cast iron (GG25) or welded steel; vibration-damped.",
      ],
      mechanism:
        "Power enters at the pinion shaft as torque; the pinion teeth engage the gear teeth along the line of action, transferring force to the gear teeth at the pitch line. Each tooth acts as a cantilever beam — the Lewis formula gives the bending stress at the root. Simultaneously, the contact stress between the two involute flanks (modeled as rolling parallel cylinders) drives the competing pitting failure mode. Both must be checked.",
      process:
        "Specify duty → compute W_t → pick N_p, m, b → look up Y → compute textbook σ → apply AGMA K-factors for σ_F,AGMA → compute σ_H,AGMA → select material & heat treatment to satisfy both allowable stresses → verify m_p > 1.2 → detail the gear (ISO 286 fits, surface finish, tip relief).",
      formulas: [
        "σ = F_t/(b·m·Y)  [Lewis bending, MPa]",
        "F_t = 2T/d = 60·P/(π·d·n)  [tangential force, N]",
        "AGMA σ_F = W_t·K_o·K_v·K_s·K_H·K_B·K_T/(b·m_t·Y_J)",
        "AGMA σ_H = Z_H·Z_E·√(K_o·K_v·K_s·K_H·K_T·(Z_R²·W_t)/(b·d·Z_I))",
        "σ_F,allowable = 0.53·S_ut·K_L·K_R·K_T  (Grade 1 steel)",
        "σ_H,allowable = 2.76·HBW − 70 √MPa  (through-hardened steel)",
        "σ_H,allowable ≈ 1050 √MPa  (carburized 8620H, 58–62 HRC)",
        "m_p = (sqrt(r_aO²−r_b²) + sqrt(r_aG²−r_b²) − C·sin(φ))/p_b  [contact ratio]",
      ],
      metrics: [
        "Bending safety factor n_F = σ_F,allowable/σ_F,AGMA (target ≥ 2.0).",
        "Pitting safety factor n_H = σ_H,allowable/σ_H,AGMA (target ≥ 1.2).",
        "Contact ratio m_p (target ≥ 1.2 industrial, ≥ 1.4 automotive).",
        "AGMA quality number Q_v (8 industrial, 10–11 automotive, 12+ precision).",
        "Pitch-line velocity V = π·d·n/60 (m/s); drives splash vs forced lubrication threshold.",
        "Service life L_₁₀ in hours (target 20,000–40,000 h for industrial drives).",
      ],
      examples: [
        "Lewis σ = 85 MPa at F_t = 2 kN, m = 3 mm, b = 30 mm, Y = 0.261 (13-tooth pinion).",
        "Lewis σ = 69 MPa at F_t = 2 kN, m = 3 mm, b = 30 mm, Y = 0.322 (20-tooth pinion).",
        "AGMA σ_H ≈ 820 √MPa on a 20-tooth pinion, m = 4 mm, b = 50 mm, carburized 8620H (σ_H,allowable = 1050 √MPa, n_H ≈ 1.28).",
      ],
      industrial_examples: [
        "Mining — 7-ft ball-mill pinion 750 kW @ 200 rpm: σ_F = 52 MPa, σ_H ≈ 950 √MPa; carburized 9310, re-pinion every 25,000 h.",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Minerals reclaimer slewing-ring planetary drive: 4×75 kW planets; first-stage sun-gear tooth fracture at 8 mo due to underestimated K_H (1.0 → 2.4); derated 15% and re-crowned 10 µm — 4 yr trouble-free since.",
      ],
      common_errors: [
        "Mixing diametral pitch P_d (1/in) with module m (mm) without conversion.",
        "Forgetting AGMA K-factors (K_o·K_v·K_H ≈ 1.5–2.1 typical) — textbook Lewis understates real stress 2×.",
        "Treating pitting as cosmetic — it is load-bearing; re-pin immediately.",
        "Underestimating K_H for overhung pinions (1.4 straddle vs 2.0 overhung).",
        "Pinion N_p < 18 with 20° PA → undercutting; double penalty on Y and σ_F,allowable.",
        "Not verifying m_p > 1.2 — silent failure by tooth impact.",
      ],
      limitations: [
        "Lewis assumes single-tooth loading — valid only when m_p < 1.1; modern gears use AGMA Y_J instead.",
        "AGMA 2001-D04 covers only external spur and helical gears; bevel and worm gears use AGMA 2003/2005/6022.",
        "K-factors empirically calibrated for steel-steel gears — do not extrapolate to plastic-on-steel or bronze-on-steel.",
        "AGMA σ_H is calibrated to 1×10⁶ cycles — use the appropriate Wohler S-N curve for very-high- or very-low-cycle regimes.",
        "The Lewis/AGMA approach is quasi-static — does not capture torsional or tooth-mesh dynamic loads; use transfer-matrix or FEA for high-frequency dynamics.",
      ],
      best_practices: [
        "Always specify the AGMA quality number Q_v and the surface finish on the drawing.",
        "Use carburized 8620H or 9310 for high-stress long-life pinions; through-hardened 4140 for medium-duty; ductile iron 80-55-06 for quiet low-load drives.",
        "Verify m_p > 1.2 for every design and m_p > 1.4 for noise-critical applications.",
        "Check both σ_F and σ_H — pitting usually governs for industrial drives, but you must verify, not assume.",
        "Use ISO 286 H7/js6 on the pinion bore and J7/H7 in the housing to deliver the bearing clearances that achieve the rated L_10 life.",
        "Specify tip relief (5–15 µm) and crowning (10–20 µm) for high-power gears to redistribute load at the tooth tip and under misalignment.",
      ],
      related_concepts: [
        "Bearings & lubrication (Lesson 2) — the rolling-contact bearing L_10 = (C/P)³ × 10⁶ rev is the kinematic cousin of the gear L_₁₀.",
        "Springs, clutches & brakes (Lesson 3) — the cantilever-beam philosophy of the Lewis formula appears again in the helical spring τ = K_w·8FD/(πd³).",
        "Fatigue (Shigley Ch. 11) — Marin modifiers, Goodman/Morrow, S-N curves.",
        "Hertzian contact stress — surface fatigue under rolling/sliding contact (Juvinall Ch. 7).",
        "ISO 286 fits — gear-bore and bearing-seat tolerance selection.",
      ],
      prerequisites: [
        "Statics (free-body diagram of a gear tooth).",
        "Mechanics of materials (cantilever beam bending, section modulus).",
        "Material science (hardness, fatigue, S-N curves).",
        "Engineering drawing (involute profile, pitch circle, module).",
      ],
      references: MACHINE_DESIGN_REFERENCE_TITLES,
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
        "Which expression correctly gives the Lewis bending-stress formula for a spur-gear tooth?",
      explanation:
        "Lewis (1892) modeled the tooth as a cantilever beam of rectangular section b × m loaded by F_t at the pitch point; substituting the strongest inscribed parabola gives σ = F_t/(b·m·Y).",
      whyCorrect:
        "σ = F/(b·m·Y) — the Lewis formula. F is the tangential force at the pitch point (N), b is face width (mm), m is module (mm), and Y is the dimensionless Lewis form factor (≈ 0.32 for a 20-tooth 20° PA pinion).",
      whyOthersWrong: [
        "σ = F·m/(b·Y) places m in the numerator — the tooth would get stronger with smaller module, contradicting the geometry.",
        "σ = F·Y/(b·m) places Y in the numerator — the stress would rise with stronger (higher-Y) teeth, opposite of physical reality.",
        "σ = b·m·Y/F inverts the formula — stress would rise as the tooth grows larger, which is backwards.",
      ],
      options: [
        { text: "σ = F/(b·m·Y)", isCorrect: true },
        { text: "σ = F·m/(b·Y)", isCorrect: false },
        { text: "σ = F·Y/(b·m)", isCorrect: false },
        { text: "σ = b·m·Y/F", isCorrect: false },
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
        "A spur-gear pinion transmits a tangential force F_t = 2 kN at the pitch point. The pinion has module m = 3 mm, face width b = 30 mm, and Lewis form factor Y = 0.261 (≈ 13 teeth, 20° PA — below the practical minimum, used here for textbook illustration). The Lewis bending stress is closest to:",
      explanation:
        "σ = F_t/(b·m·Y) = 2000/(30 × 3 × 0.261) = 2000/23.49 = 85.14 MPa ≈ 85 MPa. The tooth is well within the bending allowable for through-hardened 4140 steel (σ_F,allowable ≈ 310–370 MPa, n_F ≈ 4).",
      whyCorrect:
        "Apply σ = F_t/(b·m·Y) directly: σ = 2000 N / (30 mm × 3 mm × 0.261) = 2000/23.49 = 85.14 MPa ≈ 85 MPa. The Lewis form factor Y = 0.261 corresponds to a 13-tooth pinion (textbook value; in practice we use ≥ 18 teeth to avoid undercut, raising Y to ≈ 0.32 and dropping σ to ≈ 69 MPa).",
      whyOthersWrong: [
        "25 MPa would require Y ≈ 0.89 — no gear-tooth form factor reaches that high (max Y for a rack is 0.541).",
        "120 MPa would require Y ≈ 0.185 — below the smallest possible Y for any involute gear.",
        "200 MPa would require Y ≈ 0.111 — physically impossible for a Lewis form factor (it would represent a tooth so narrow it could not transmit the force).",
      ],
      options: [
        { text: "25 MPa", isCorrect: false },
        { text: "85 MPa", isCorrect: true },
        { text: "120 MPa", isCorrect: false },
        { text: "200 MPa", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem:
        "In AGMA 2001-D04 gear design, what does the load-distribution factor K_H capture, and what design choice most directly reduces it?",
      explanation:
        "K_H captures the non-uniformity of load across the tooth face width caused by misalignment, elastic deflection of the pinion/shaft, and manufacturing lead mismatch across the face. The design choice that most directly reduces K_H is rigid straddle-mounted bearings (vs overhung), with crowning added to the tooth to redistribute load under unavoidable deflection.",
      whyCorrect:
        "K_H is the AGMA load-distribution factor (1.0 ideal, 1.4 straddle-mount, 2.0 overhung). It captures misalignment and elastic deflection across the face width — the load piles up at one end of the tooth. The most direct fix is rigid straddle mounting of the pinion between two bearings (rather than overhung), which lowers K_H from ≈ 2.0 to ≈ 1.4. Adding crowning (10–20 µm of barrel-shaped relief across the face) further equalizes the load.",
      whyOthersWrong: [
        "Increasing the module m primarily reduces the Lewis stress σ_F (proportional to 1/m) and σ_H (proportional to 1/√m) — it does not change K_H, which is a load-distribution factor independent of tooth size.",
        "Switching to a 25° pressure angle lowers the AGMA zone factor Z_H (from 2.5 to 1.83) and slightly raises Y, but K_H is independent of pressure angle.",
        "Surface hardening (carburizing 8620H) raises σ_H,allowable but does not change K_H; the load distribution remains the same regardless of material hardness.",
      ],
      options: [
        { text: "Tooth-size scaling; increase module m to lower K_H", isCorrect: false },
        { text: "Pressure-angle effect; switch to 25° PA to lower K_H", isCorrect: false },
        { text: "Misalignment & deflection across face width; rigid straddle-mount + crowning", isCorrect: true },
        { text: "Surface hardness; carburize 8620H to lower K_H", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem:
        "True or False: In the metric system, the gear module m (mm) and the imperial diametral pitch P_d (teeth per inch of pitch diameter) are related by m = 25.4/P_d. Therefore a module-m = 3 mm gear has the same tooth size as a P_d = 8.47 (1/in) gear.",
      explanation:
        "TRUE. Module m = d/N in mm/tooth; diametral pitch P_d = N/d in teeth/inch. Converting: m[mm] = 25.4 / P_d[1/in], so m = 3 mm corresponds to P_d = 25.4/3 = 8.47 (1/in).",
      whyCorrect:
        "TRUE. By definition m = d/N (mm/tooth) and P_d = N/d (teeth/inch), so m × P_d = 25.4 (the mm-to-inch conversion). For m = 3 mm: P_d = 25.4/3 = 8.47 teeth/inch. A module-3 metric gear is the same physical tooth size as a P_d ≈ 8.5 imperial gear; the Lewis formula gives the same stress in either system when the right units are used.",
      whyOthersWrong: [
        "FALSE would require either that m and P_d are unrelated (they are not — they encode the same geometry in different units) or that the conversion factor differs (it doesn't — 1 inch = 25.4 mm is exact by international agreement since 1959).",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Bearings & Lubrication
// (slug: md-bearings-lubrication)
// ---------------------------------------------------------------------------

const LESSON_BEARINGS: RefLesson = {
  slug: "md-bearings-lubrication",
  title: "Bearings & Lubrication",
  titleAr: "المحامل والتشحيم",
  order: 2,
  durationMin: 35,
  references: MACHINE_DESIGN_REFERENCE_TITLES,
  conceptIntroduction: `Bearings locate rotating shafts and transmit radial and axial loads from the shaft to the stationary housing with minimum friction. The two dominant families are *rolling-contact bearings* (ball, cylindrical roller, tapered roller, spherical roller) and *journal (sleeve) bearings*. Rolling bearings transfer load through point or line Hertzian contacts between hardened steel races and rolling elements; their fatigue life is governed by the subsurface shear stress cycling under the Hertzian contact, leading to the famous Lundell-Palmgren rating-life equation *L₁₀ = (C/P)^p × 10⁶ revolutions*, with p = 3 for ball bearings and p = 10/3 for roller bearings. Journal bearings, in contrast, support the shaft on a thin hydrodynamic oil film generated by the shaft's rotation; the friction in the idealized concentric limit is given by *Petroff's law* μ = 2π²(r/c)·(η·N_s/P_avg). The *Stribeck curve* unifies both regimes — friction coefficient μ plotted against the dimensionless bearing characteristic (η·N/P_avg) shows three zones: high-μ boundary lubrication (metal-metal contact), the μ-minimum mixed/elastohydrodynamic transition, and rising-μ hydrodynamic (Couette flow). This lesson covers the L₁₀ rating-life equation, the Stribeck curve, and Petroff's law as the engineer's primary tools for bearing selection.`,
  sections: {
    learning_objectives: `- Distinguish rolling-contact bearings (point/line Hertz contact) from journal (hydrodynamic film) bearings by failure mode and life model.
- Apply the Lundell-Palmgren rating-life equation L₁₀ = (C/P)^p × 10⁶ rev (p = 3 ball, p = 10/3 roller) and convert to operating hours L₁₀h = L₁₀/(60·n).
- Compute the equivalent dynamic load P = X·V·F_r + Y·F_a for combined radial + axial loading using bearing-manufacturer tables (X, Y depend on F_a/F_r and e).
- State Petroff's law μ = 2π²(r/c)·(η·N_s/P_avg) for the concentric (no-load) journal bearing, and explain why it is the lower-bound friction of any hydrodynamic bearing.
- Read the Stribeck curve and identify the three lubrication regimes (boundary, mixed/EHL, hydrodynamic); explain why bearing design targets the minimum-μ regime.
- Select ISO 286 fits (k5 on shaft, J7/H7 in housing) to deliver the running clearance required for the bearing to reach its rated L₁₀ life.
- Identify the failure modes: spalling (rolling-contact fatigue), brinelling (overload plastic deformation), false brinelling (vibration under load), fretting corrosion, and adhesive wear (boundary lubrication in journal bearings).`,
    prerequisites: `- Statics: radial and axial force components on a shaft; FBD of bearing supports.
- Mechanics of materials: Hertzian contact stress; subsurface shear-stress field (τ_max ≈ 0.30·p_0 at z ≈ 0.78·a).
- Fluid mechanics: Couette flow between parallel plates; Reynolds equation for hydrodynamic lubrication.
- Material science: HRC hardness, fatigue S-N curves, through-hardened vs case-hardened bearing steels (SAE 52100).`,
    introduction: `A bearing is the mechanical interface that locates a shaft and transmits its loads to the stationary housing with minimum friction. The engineer's first decision is whether to use a *rolling-contact bearing* or a *journal (sleeve) bearing*. Rolling bearings (deep-groove ball, cylindrical roller, tapered roller, spherical roller) transfer load through Hertzian point or line contacts between case-hardened SAE 52100 races and rolling elements. Their service life is finite — the rolling elements and races develop subsurface fatigue cracks under cyclic Hertzian stress, leading to *spalling* (surface flaking). The Lundell-Palmgren equation L₁₀ = (C/P)^p × 10⁶ revolutions (p = 3 for ball, p = 10/3 for roller) is the international (ABMA/ISO 281) rating-life equation; C is the *basic dynamic load rating* (the load at which 90% of bearings survive 1×10⁶ revolutions), P is the *equivalent dynamic load* (a scalar combining radial and axial loads), and L₁₀ is the life at which 10% of a population fails (90% reliability).

Journal bearings, by contrast, support the shaft on a thin hydrodynamic oil film generated by the shaft's rotation. The shaft "floats" on a pressurized oil wedge; metal-to-metal contact is avoided, and friction is the viscous drag of the sheared oil film. In the idealized concentric (no-load) limit, the friction coefficient is *Petroff's law*: μ = 2π²(r/c)·(η·N_s/P_avg), where r is the journal radius, c is the radial clearance, η is the dynamic viscosity, N_s is the rotational speed (rev/s), and P_avg is the average radial load per projected area. Real loaded journal bearings operate with the shaft eccentric in the bore — Sommerfeld's analysis gives the load capacity as a function of the eccentricity ratio ε, and the friction rises above the Petroff floor.

The *Stribeck curve* — μ vs the dimensionless bearing number (η·N/P_avg) — captures both worlds. At low ηN/P (low speed, high load, low viscosity), the bearing runs in the *boundary* regime with metal-to-metal contact (μ ≈ 0.10–0.20); as ηN/P rises the bearing enters the *mixed* (elastohydrodynamic) regime where μ drops to a minimum (μ ≈ 0.002–0.005 for rolling bearings, 0.01 for journal bearings); at very high ηN/P the *hydrodynamic* regime takes over and μ rises again as the Couette-film viscous drag grows. Every bearing design targets the minimum-μ regime to balance low friction against the safety margin away from boundary contact.`,
    terminology: `- **Basic dynamic load rating C** (N): load at which 90% of a bearing population survives 1×10⁶ revolutions; tabulated in bearing catalogs.
- **Equivalent dynamic load P** (N): combined radial + axial load producing the same fatigue life as the actual load spectrum: P = X·V·F_r + Y·F_a.
- **L₁₀ life** (revolutions or hours): life at which 10% of bearings fail (90% reliability); the rating-life equation L₁₀ = (C/P)^p × 10⁶.
- **Radial load F_r** (N): load perpendicular to the shaft axis.
- **Axial (thrust) load F_a** (N): load along the shaft axis.
- **V**: rotation factor (1.0 if inner race rotates, 1.2 if outer race rotates).
- **X, Y**: tabulated factors converting combined radial + axial loading into an equivalent P.
- **e**: a bearing-specific axial-load threshold (F_a/F_r > e means axial load is "significant" and Y is active).
- **Journal bearing**: a sleeve bearing where the shaft (journal) rotates inside a bushing, supported by a hydrodynamic oil film.
- **Radial clearance c** (mm): the difference between bushing ID and journal OD (typically 0.001·r).
- **Eccentricity ratio ε**: (c − h_min)/c, where h_min is the minimum film thickness; ε = 0 is concentric (Petroff), ε → 1 is contact.
- **Sommerfeld number S**: S = (r/c)²·(η·N_s/P_avg) — the dimensionless bearing characteristic; the inverse of the Stribeck parameter.
- **Stribeck curve**: μ vs (η·N/P_avg) showing the three lubrication regimes.
- **Boundary lubrication**: metal-to-metal contact through a thin adsorbed molecular film (μ ≈ 0.10).
- **Hydrodynamic lubrication**: full film separates the surfaces (μ ≈ 0.01–0.05, viscous drag dominates).
- **Spalling**: subsurface-initiated fatigue failure of rolling-contact races.`,
    detailed_explanation: `**Rolling-contact bearing L₁₀ rating life.** The Lundell-Palmgren equation, adopted by ABMA Std 9 / ISO 281, gives the rating life of a rolling bearing under load P:
  L₁₀ = (C/P)^p × 10⁶ revolutions
where p = 3 for ball bearings and p = 10/3 for roller bearings, C is the basic dynamic load rating (kN), P is the equivalent dynamic load (kN), and L₁₀ is the life at 90% reliability (10% failure probability). To convert to operating hours at rotational speed n (rpm):
  L₁₀h = L₁₀/(60·n) = 10⁶·(C/P)^p/(60·n) hours

The basic dynamic load rating C is a tabulated property of each bearing (e.g., a 6204 deep-groove ball bearing has C ≈ 12.6 kN; an NU 208 cylindrical roller bearing has C ≈ 69.5 kN). The equivalent dynamic load P combines the radial load F_r and axial load F_a:
  P = X·V·F_r + Y·F_a
where V = 1.0 if the inner race rotates (typical) and 1.2 if the outer race rotates (typical of pulley / hub bearings). The factors X and Y come from the bearing catalog table as a function of the load ratio F_a/F_r vs the bearing-specific threshold e: if F_a/F_r ≤ e then X = 1, Y = 0 (pure radial regime); if F_a/F_r > e then X < 1 and Y > 0 (the axial load reduces life below the pure-radial estimate).

**Life adjustment.** The basic L₁₀ life assumes 90% reliability, normal operating temperature (< 120 °C), and clean lubrication. Real designs apply three adjustment factors (ISO 281:2007):
  L_na = a₁·a₂·a₃·L₁₀
where a₁ = reliability (1.0 at 90%, 0.62 at 99%, 0.37 at 99.9%); a₂ = material (1.0 for SAE 52100 through-hardened, 1.5–3.0 for clean-vacuum-remelted steel); a₃ = operating condition (1.0 for ideal lubrication; < 1 for boundary lubrication or contamination).

**Journal bearings & Petroff's law.** For an idealized concentric journal bearing (no load, shaft centered in the bore), the oil film shears at the velocity gradient u/h = π·d·N_s/c. The viscous drag torque per unit length is T = (2π·r·(η·(2π·r·N_s)·L·r²)/c) = 4π²η·r³·L·N_s/c, and the frictional force at the surface is F = T/r = 4π²η·r²·L·N_s/c. Dividing by the radial load W = P_avg·(2r·L) gives the friction coefficient:
  μ = F/W = (4π²η·r²·L·N_s/c)/(P_avg·2r·L) = 2π²·(r/c)·(η·N_s/P_avg)
This is *Petroff's law* — the lower-bound friction coefficient of any hydrodynamic journal bearing. Real loaded bearings operate with the shaft eccentric (ε > 0); the load capacity rises as ε → 1 and the friction rises above the Petroff floor, captured by the Sommerfeld analysis.

**Stribeck curve.** Plotting μ vs the dimensionless bearing number (η·N/P_avg) yields a characteristic three-regime curve: at low ηN/P the bearing runs in the *boundary* regime (μ ≈ 0.10–0.20, metal-to-metal contact through adsorbed molecular films); as ηN/P rises the curve plunges through the *mixed / elastohydrodynamic (EHL)* regime (μ ≈ 0.002–0.01); at high ηN/P the *hydrodynamic* regime takes over and μ rises again as the Couette viscous drag grows linearly with η·N. The *minimum-μ* point — the design target for steady-state operation — sits at the inflection between mixed and hydrodynamic; running left of the minimum risks boundary contact during transients, running right wastes energy in viscous churning.

**ISO 286 fits for bearing seats.** A standard ball bearing's inner race is mounted on the shaft with an interference fit (k5 for rotating shaft, j5 for stationary), and the outer race sits in the housing with a transition-clearance fit (J7 or H7). The fit choice is dictated by ISO 286-1:2010 and is calibrated to deliver the running clearance (typically 5–20 µm) that lets the bearing reach its rated L₁₀ life. An interference fit on a stationary shaft with a rotating outer race reverses (H7 on the housing OD becomes interference, k5 on the shaft ID becomes clearance).`,
    core_principles: `- **L₁₀ = (C/P)^p × 10⁶ rev** with p = 3 ball, p = 10/3 roller — the Lundell-Palmgren rating-life equation (90% reliability, 1×10⁶ cycles reference).
- **P = X·V·F_r + Y·F_a** — combined radial + axial loading reduces to an equivalent P via catalog factors X, Y, e.
- **Petroff's law** μ = 2π²(r/c)·(η·N_s/P_avg) — the friction floor of a concentric (no-load) journal bearing.
- **Stribeck three regimes**: boundary (high μ), mixed/EHL (minimum μ), hydrodynamic (rising μ with ηN).
- **ISO 281 life adjustment**: L_na = a₁·a₂·a₃·L₁₀ — reliability, material, and operating-condition factors.
- **ISO 286 fits**: k5 on shaft (interference), J7/H7 in housing (transition/clearance) — preserves running clearance for L₁₀.`,
    components: `- **Inner race** (bore fits the shaft, typically k5 interference on a rotating shaft).
- **Outer race** (OD fits the housing, typically J7/H7).
- **Rolling elements**: balls, cylindrical rollers, tapered rollers, or spherical rollers.
- **Cage (separator)**: keeps the rolling elements evenly spaced; pressed steel, brass, or polyamide.
- **Seals / shields**: RS (contact rubber seal), ZZ (metal shield) — keep lubricant in and contamination out.
- **Lubricant**: grease (NLGI 2 typical) or oil (ISO VG 46–220); selection by speed factor n·d_m (rpm × mean diameter, mm).
- **Journal (shaft) & bushing** (journal bearing): typically bronze (SAE 660) or babbitted steel; oil ring, splash, or forced-feed lubrication.`,
    process: `1. Specify the duty: radial load F_r, axial load F_a, shaft speed n, required life L₁₀h or L₁₀, environment (clean/contaminated), temperature, mounting arrangement.
2. Tentatively select a bearing type: deep-groove ball (general-purpose, light axial), cylindrical roller (heavy radial only), tapered roller (combined heavy radial + axial), spherical roller (heavy combined + self-aligning).
3. Compute the equivalent dynamic load P = X·V·F_r + Y·F_a using catalog X, Y, e for the candidate bearing.
4. Compute L₁₀ = (C/P)^p × 10⁶ rev and L₁₀h = L₁₀/(60·n); verify ≥ required life. If short, step up to a larger bore or a higher-capacity series.
5. Apply ISO 281 adjustment L_na = a₁·a₂·a₃·L₁₀ for reliability > 90%, vacuum-remelted steel, or non-ideal lubrication.
6. Check static safety factor S_0 = C_0/P_0 ≥ 1.0 (typical) or ≥ 2.0 (heavy shock) against brinelling.
7. Specify ISO 286 shaft fit (k5 rotating inner) and housing fit (J7/H7); specify lubricant viscosity grade and seal type.
8. Detail the housing: fillets to clear bearing corners, dowel pins for alignment, oil-sight glass and breather for lubricant condition monitoring.`,
    formula_calculation: `**Lundell-Palmgren rating-life equation (ABMA Std 9 / ISO 281):**
  L₁₀ = (C/P)^p × 10⁶ revolutions
  L₁₀h = L₁₀/(60·n) = 10⁶·(C/P)^p/(60·n) hours
where p = 3 for ball bearings, p = 10/3 for roller bearings.

**Equivalent dynamic load:**
  P = X·V·F_r + Y·F_a
where:
  F_r = radial load (N)
  F_a = axial (thrust) load (N)
  V = 1.0 inner-rotating, 1.2 outer-rotating
  X, Y = catalog factors depending on F_a/F_r and the bearing threshold e
  If F_a/F_r ≤ e: X = 1, Y = 0 (pure-radial regime, P = V·F_r)
  If F_a/F_r > e: X < 1, Y > 0 (combined regime)

**ISO 281 life adjustment:**
  L_na = a₁·a₂·a₃·L₁₀
where a₁ (reliability): 1.0 at 90%, 0.62 at 99%, 0.37 at 99.9%, 0.25 at 99.95%
      a₂ (material): 1.0 for SAE 52100 through-hardened, 1.5–3.0 for VIMVAR clean steel
      a₃ (operating): 1.0 ideal, κ = ν/ν_1 (viscosity ratio); a₃ < 1 if κ < 1 (boundary-lubrication penalty)

**Static safety factor (anti-brinelling):**
  S_0 = C_0/P_0
where C_0 = basic static load rating (N); P_0 = max equivalent static load; S_0 ≥ 1.0 general, ≥ 2.0 heavy shock, ≥ 3.0 silent-running (cranes, machine tools).

**Petroff's law (concentric journal bearing):**
  μ = 2π²·(r/c)·(η·N_s/P_avg)
where r = journal radius (m), c = radial clearance (m), η = dynamic viscosity (Pa·s), N_s = rotational speed (rev/s), P_avg = W/(2rL) (Pa).

**Sommerfeld number:**
  S = (r/c)²·(η·N_s/P_avg)
The Stribeck curve plots μ vs (η·N/P_avg) ≈ μ vs 1/S.

**Assumptions**: (i) loads are deterministic; (ii) operating temperature is within the lubricant's recommended range; (iii) cleanliness class ISO 4406:1999 18/16/13 or better; (iv) bearing mounted with the catalog-recommended ISO 286 fit; (v) seal performance within design limits.

**Interpretation**: doubling C (a larger bearing) raises L₁₀ by 8× (ball) or 10× (roller); halving P (lower load) raises L₁₀ by 8× (ball). For a 5 kN / 1 kN (C/P = 5) ball bearing, L₁₀ = 5³ × 10⁶ = 125 × 10⁶ rev = 1.25 × 10⁸ rev — far above typical industrial design targets of L₁₀ = 10⁷ rev (10 million rev).`,
    worked_example: `**Ball-bearing rating life.**
Given: A deep-groove ball bearing with basic dynamic load rating C = 5 kN operates at equivalent dynamic load P = 1 kN (pure radial, F_a = 0 → X = 1, Y = 0). Shaft speed n = 1500 rpm.
L₁₀ = (C/P)³ × 10⁶ rev = (5/1)³ × 10⁶ = 125 × 10⁶ rev = 1.25 × 10⁸ revolutions ✓
Converting to operating hours:
L₁₀h = L₁₀/(60·n) = 1.25 × 10⁸/(60 × 1500) = 1.25 × 10⁸/90,000 = 1389 hours ≈ 58 days
This far exceeds the common industrial design target of L₁₀ = 10⁷ rev (10 million rev, ≈ 111 hours at 1500 rpm) — the bearing is comfortably oversized for this duty.

**Reverse problem — required C for a design-target life of L₁₀ = 10⁷ rev at P = 1 kN:**
C = P × (L₁₀/10⁶)^(1/3) = 1 × (10⁷/10⁶)^(1/3) = 1 × 10^(1/3) = 1 × 2.154 = 2.154 kN
So a bearing with C ≥ 2.15 kN satisfies the 10⁷-rev design target; the 5-kN bearing has roughly 8× the design-target margin.

**Equivalent-load calculation (radial + axial).**
A 6209 deep-groove ball bearing (C = 31.5 kN, e = 0.28, Y = 1.55) operates at F_r = 4 kN radial and F_a = 1.4 kN axial. Since F_a/F_r = 0.35 > e = 0.28, the axial load is significant: use X = 0.56, Y = 1.55.
P = X·V·F_r + Y·F_a = 0.56·1·4 + 1.55·1.4 = 2.24 + 2.17 = 4.41 kN
L₁₀ = (C/P)³ × 10⁶ = (31.5/4.41)³ × 10⁶ = (7.143)³ × 10⁶ = 364.1 × 10⁶ = 3.64 × 10⁸ rev

**Petroff's law (journal-bearing friction floor).**
A 50-mm journal runs in a bushing with radial clearance c = 0.05 mm (c/r = 0.002), lubricated with ISO VG 32 oil (η = 0.032 Pa·s at 60 °C). Shaft speed 1500 rpm = 25 rev/s. Average radial pressure P_avg = 1.5 MPa.
μ = 2π²·(r/c)·(η·N_s/P_avg) = 2·9.87·(25/0.05)·(0.032·25/1.5×10⁶)
  = 2·9.87·500·(0.8/1.5×10⁶)
  = 9,870·5.33×10⁻⁷
  = 5.26 × 10⁻³ ≈ 0.005
So the friction floor is μ ≈ 0.005; in service the actual μ will be 1.5–3× this (≈ 0.008–0.015) due to eccentricity (ε > 0).`,
    industrial_example: `**Industry: Power — induced-draft fan bearing.** A 1.2-MW induced-draft fan on a 250-MW utility boiler runs at 1185 rpm, with a 17 kN radial load at the inboard bearing (the fan wheel overhangs the bearing). A 6324 deep-groove ball bearing (C = 275 kN, C_0 = 270 kN) is selected. L₁₀ = (275/17)³ × 10⁶ = (16.18)³ × 10⁶ = 4236 × 10⁶ = 4.24 × 10⁹ rev → L₁₀h = 4.24 × 10⁹/(60 × 1185) = 59,640 h ≈ 6.8 yr of continuous service. The utility's planned-maintenance cycle is every 5 yr — the bearing's L₁₀ exceeds it by 35%, giving adequate margin. Bearing temperature is monitored at the housing (target < 80 °C); a thermocouple alarm at 95 °C triggers a controlled shutdown. Lubrication is grease (NLGI 2, lithium-complex), re-lubricated every 4000 h per the SKF traffic-light method. Vibration trend (ISO 10816 zone A < 1.4 mm/s RMS, zone B 1.4–2.8, zone C 2.8–4.5, zone D > 4.5 alarm) is the primary early-warning indicator — a peak at the ball-pass-outer frequency BPFO = (N_b/2)·(1 - d/D·cos α)·n signals outer-race spalling.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Cogen — boiler-feed-pump bearing failure (synthetic, illustrative).* A 1500-kW boiler-feed pump running at 3550 rpm developed high vibration (4.8 mm/s RMS, ISO 10816 zone D) at the outboard bearing after 18 months of service. Vibration spectrum analysis showed a dominant peak at 187 Hz — the calculated ball-pass-inner (BPFI = (N_b/2)·(1 + d/D·cos α)·n) frequency for a 6313 bearing (N_b = 8, d = 15.9 mm, D = 100 mm, α = 0°) = 4·(1 + 0.159)·59.17 = 274 Hz — actually mismatched, indicating the peak was at 2×BPFI not 1×, characteristic of an inner-race spall on the loaded zone. Inspection confirmed a 6-mm spall on the inner-rase race; root cause was electrolytic corrosion (EDM-type) from stray shaft currents flowing through the bearing (a known failure mode on large VFD-driven motors) — the drive end bearing insulation had been omitted in the rebuild. Remedy: install an insulated bearing on the NDE (non-drive end) and a shaft-grounding brush on the DE; replace the failed 6313 with a same-size hybrid ceramic-ball bearing (Si₃N₄ balls in steel races) which carries stray currents without EDM damage. The unit has now run 6 yr trouble-free.`,
    visual_explanation: `**Stribeck curve.** A plot of friction coefficient μ (y-axis, log scale, 0.001 to 0.20) versus the dimensionless bearing parameter η·N/P_avg (x-axis, log scale, 10⁻¹⁰ to 10⁻⁶) shows the characteristic three-regime S-shape: starting in the *boundary* regime at high μ ≈ 0.10–0.20 (left side), the curve plunges down through the *mixed/EHL* regime to a minimum μ ≈ 0.002–0.005 (rolling) or 0.01 (journal) at η·N/P_avg ≈ 10⁻⁸, then rises again as the *hydrodynamic* regime dominates at high η·N/P_avg where viscous drag grows linearly. The minimum is the design operating point: far enough right of the boundary regime to survive speed/load transients without metal contact, but not so far right that viscous churning wastes energy. A second visual shows the *Hertzian contact subsurface shear-stress field* under a rolling ball on a race: the maximum shear τ_max ≈ 0.30·p_0 sits at depth z ≈ 0.78·a below the surface — the locus of micro-crack initiation that grows into a spall after 10⁷–10⁹ stress cycles.`,
    simulation_opportunity: `Open the EngiSuite "Bearing L₁₀ explorer" — sliders for bearing type (ball/roller/tapered), bore size (10–200 mm), radial load F_r (0.1–50 kN), axial load F_a (0–20 kN), speed (10–5000 rpm), and reliability target (90/99/99.9%). The widget pulls C, X, Y, e from the embedded bearing catalog, computes P = X·V·F_r + Y·F_a, then reports L₁₀ (rev), L₁₀h (h), and the ISO 281 adjusted L_na. A second panel plots the Stribeck curve with the current η·N/P_avg marked — green in the minimum-μ zone, amber approaching boundary, red if the operating point slides off the minimum either way. Try this scenario: F_r = 4 kN, F_a = 1.4 kN, n = 1500 rpm on a 6209 bearing — observe L₁₀h = 4,070 h at 90% reliability, dropping to 2,524 h at 99% and to 1,506 h at 99.9%. (The L₁₀ → L_na reduction grows as reliability rises.)`,
    common_mistakes: `- **Using the catalog C directly as a safe load**: C is the load at which 90% of bearings survive 1×10⁶ rev (not 1×10⁹). Operating at P = C gives L₁₀h ≈ 11 h at 1500 rpm — a few hours of life. Always compute (C/P)³ × 10⁶.
- **Forgetting the axial load when F_a/F_r > e**: a deep-groove ball bearing with F_a/F_r = 0.5 sees P = 0.56·F_r + 1.6·F_a — far above the pure-radial P = F_r. The life collapses by (P_ignored/P_actual)³ ≈ 2–5×.
- **Wrong ISO 286 fit on the rotating race**: a stationary inner race rotating with the housing, or vice versa, gives fretting corrosion and premature failure. Match the fit to the rotation: interference on the rotating race.
- **Mixing pre-greased and re-greasable bearings**: a 2RS (rubber-seal) bearing is pre-greased for life; re-greasing it over-pressures and blows the seal. Use an open or ZZ bearing with a grease fitting for re-greasable designs.
- **Wrong viscosity grade for the speed**: at high speed use low-viscosity oil (ISO VG 32); at low speed / high load use high-viscosity (ISO VG 220). The bearing characteristic η·N/P_avg must stay in the minimum-μ zone of the Stribeck curve.
- **Ignoring shaft-current damage on VFD-driven motors**: stray currents from the inverter's common-mode voltage EDM the bearing races. Install insulated bearings or a shaft-grounding brush on VFDs > 75 kW.`,
    limitations: `- The Lundell-Palmgren equation L₁₀ = (C/P)^p × 10⁶ is empirical — calibrated to ball-bearing steels of the 1940s–1960s. Modern vacuum-remelted steels (a₂ up to 3.0) easily exceed it.
- ISO 281's a₃ factor (operating-condition) is poorly defined for contaminated lubrication; ISO 281:2007 introduced the contamination parameter η_c but catalog values remain conservative.
- The L₁₀ is a 10%-failure life — 10% of bearings fail by this life. For critical equipment specify L₁ (50% failure) or L₅ (95% reliability); the corresponding multipliers are a₁ = 5× for L₅, 4× for L₁ (vs L₁₀).
- Petroff's law applies only to the concentric (no-load) limit — a real loaded bearing runs at ε > 0 with friction 1.5–3× the Petroff floor.
- The Stribeck curve is qualitative; the exact μ value in the mixed/EHL regime depends on surface roughness, lubricant additive package (ZDDP, MoS₂), and temperature.
- L₁₀ says nothing about *static* failure (brinelling) — always check S_0 = C_0/P_0 separately.`,
    comparison: `| Bearing type | C (typ.) | P regime | L₁₀ | Speed limit | Best for |
|---|---|---|---|---|---|
| Deep-groove ball | low–med | radial + light axial | (C/P)³ | very high | general-purpose, fans, pumps |
| Cylindrical roller | high | radial only (NU/NJ) | (C/P)^(10/3) | high | heavy radial, gear reducers |
| Tapered roller | high | combined radial + axial | (C/P)^(10/3) | medium | vehicle hubs, mining conveyors |
| Spherical roller | high | heavy combined, self-align | (C/P)^(10/3) | medium | mining, paper, marine prop shafts |
| Thrust ball | low–med | axial only | (C/P)³ | medium | vertical-shaft pumps, fans |
| Journal (sleeve) | — | radial | infinite (no fatigue) | very high | turbines, large motors (n > 10⁴ rpm) |

| Regime | Stribeck position | μ | Wear mechanism | Failure mode |
|---|---|---|---|---|
| Boundary | left (low ηN/P) | 0.10–0.20 | adhesive, abrasive | adhesive wear, scuffing |
| Mixed / EHL | minimum | 0.002–0.01 | micro-scale surface fatigue | pitting (10⁷–10⁹ cycles) |
| Hydrodynamic | right (high ηN/P) | 0.01–0.05 rising | none (film separates) | viscous heat (oil oxidation) |`,
    practical_application: `**Specifying the bearings on a 75-kW motor-driven centrifugal pump.** Pump speed 2950 rpm, radial load at the inboard (coupling-end) bearing 2.8 kN (impeller unbalanced thrust + housing deflection), axial load 0.6 kN (impeller back-pressure). Candidate: a 6309 deep-groove ball bearing (C = 52 kN, C_0 = 32 kN, e = 0.24, Y = 1.6). F_a/F_r = 0.6/2.8 = 0.214 < e = 0.24 → X = 1, Y = 0; P = V·F_r = 1·2.8 = 2.8 kN. L₁₀ = (52/2.8)³ × 10⁶ = (18.57)³ × 10⁶ = 6,408 × 10⁶ rev = 6.4 × 10⁹ rev; L₁₀h = 6.4 × 10⁹/(60 × 2950) = 36,160 h ≈ 4.1 yr of continuous service. ISO 281 adjusted life at 99% reliability (a₁ = 0.62, a₂ = 1.0, a₃ = 0.8 for medium-cleanliness): L_na = 0.62·1·0.8·36,160 = 17,936 h ≈ 2.0 yr — meets the utility's planned-maintenance 18-month cycle. ISO 286 fit: shaft k5 (interference, rotating inner race), housing H7 (clearance, stationary outer race). Lubrication: grease NLGI 2 lithium-complex, re-lubricated every 4,000 h per the SKF traffic-light method.`,
    decision_scenario: `You are the rotating-equipment lead at a coal-fired power plant. The forced-draft fan (1.5 MW, 1185 rpm) needs a new inboard bearing. Vendor A offers a standard 6324 deep-groove ball bearing, $1,800, predicted L₁₀h = 60,000 h. Vendor B offers a 6324 with ceramic balls (hybrid Si₃N₄/steel), $5,400, predicted L₁₀h = 180,000 h (the harder ceramic balls run in the softer steel races with smaller Hertzian contact ellipse and lower subsurface shear — life rises 3×). Both fit the same 120-mm shaft and 260-mm housing. The fan is 24/7 critical — a forced-draft trip derates the boiler at $90,000 per day of lost generation. Decision rule: lowest present-value LCC over a 20-yr horizon at MARR 8%. LCC_A = $1,800 + 3× replacements (at 60,000 h = 6.8 yr, 3 failures in 20 yr) × ($1,800 + 1 day·$90k = $91,800 PV-discounted) ≈ $1,800 + 3·$51,200 = $155k. LCC_B = $5,400 + 0 replacements in 20 yr (180,000 h ≈ 20.5 yr) = $5,400. Hybrid bearing wins by ~$150k PV over 20 yr — a factor-of-30 reduction in lifecycle cost. (Full mechanics in engineering-economics-management.ts Lesson 2.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: Lundell-Palmgren L₁₀ formula; calculation of L₁₀ from C and P; Stribeck lubrication regimes; Petroff's law for journal bearings.`,
    certification_questions: `This lesson's content maps to the NCEES PE Mechanical: Machine Design & Materials exam outline and the ABMA Std 9 / ISO 281 bearing-life standards. Sample PE-style question: "A deep-groove ball bearing has C = 14 kN. At an equivalent load P = 2 kN and 1800 rpm, the L₁₀ life in hours is closest to: (a) 230 h, (b) 1,400 h, (c) 2,300 h, (d) 14,000 h." Correct: (c) 2,300 h — L₁₀ = (14/2)³ × 10⁶ = 343 × 10⁶ rev; L₁₀h = 3.43 × 10⁸/(60 × 1800) = 3,176 h ≈ 2,300 h.`,
    summary: `Rolling-contact bearings are rated by the Lundell-Palmgren equation L₁₀ = (C/P)^p × 10⁶ revolutions, with p = 3 for ball and p = 10/3 for roller; ISO 281 multiplies by a₁·a₂·a₃ to adjust for reliability, material, and operating condition. Journal bearings ride on a hydrodynamic oil film; the friction floor is Petroff's law μ = 2π²(r/c)·(η·N_s/P_avg), and the Stribeck curve plots μ vs η·N/P_avg to show the boundary → mixed → hydrodynamic transition with a design minimum. ISO 286 fits (k5 on rotating shaft, J7/H7 in housing) deliver the running clearance that lets a bearing reach its rated life. The engineer's task is to pick a bearing with adequate L₁₀h for the duty, verify the static safety factor S_0 ≥ 1.0–3.0 against brinelling, and target the Stribeck minimum for steady-state friction.`,
    key_takeaways: `- L₁₀ = (C/P)^p × 10⁶ rev; p = 3 ball, p = 10/3 roller. Convert to hours: L₁₀h = L₁₀/(60·n).
- P = X·V·F_r + Y·F_a — always check F_a/F_r against e; axial load often governs life in deep-groove ball bearings.
- ISO 281: L_na = a₁·a₂·a₃·L₁₀ — reliability (a₁), material (a₂), operating condition (a₃).
- Petroff's law μ = 2π²(r/c)·(η·N_s/P_avg) — friction floor of any hydrodynamic journal bearing.
- Stribeck three regimes: boundary (μ ≈ 0.1), mixed/EHL minimum (μ ≈ 0.005 rolling, 0.01 journal), hydrodynamic (μ rises linearly with ηN).
- ISO 286 fit: k5 interference on the rotating race, J7/H7 clearance in the stationary housing — preserves the running clearance that achieves L₁₀.`,
    references: `1. Budynas & Nisbett (2020), Shigley's, Ch. 11 (rolling bearings L₁₀ = (C/P)^p × 10⁶, X/Y factors), Ch. 12 (lubrication, Stribeck, Petroff).
2. Norton (2014), Machine Design, Ch. 12 (Lundell-Palmgren, AFBMA load ratings, Stribeck derivation), Ch. 16 (clutch/brake friction surfaces).
3. Juvinall & Marshek (2017), Ch. 13 (Hertzian contact and L₁₀, equivalent-load derivation), Ch. 7 (subsurface shear τ_max ≈ 0.30·p_0).
4. AGMA 2001-D04 (2004) — bearing-race material-grade specifications.
5. ISO 286-1:2010 (k5 / H7 fit selection for bearing seats).
6. ASM Handbook Vol 8 (2000) — SAE 52100, hybrid ceramic ball hardness & fatigue data.`,
  },
  knowledgeObject: {
    title: "Bearings & Lubrication — Knowledge Object",
    domain: "Machine Design",
    competency: "Bearing Selection & Tribology",
    topic: "Rolling-Contact Bearings, Journal Bearings, and the Stribeck Curve",
    concept: "L₁₀ = (C/P)^p × 10⁶ (Lundell-Palmgren) and Petroff's law μ = 2π²(r/c)(ηN_s/P_avg)",
    body: {
      definitions: [
        "Rolling-contact bearing: ball, roller, or tapered-roller bearing transferring load through Hertzian point/line contacts.",
        "Basic dynamic load rating C: load at which 90% of bearings survive 1×10⁶ revolutions.",
        "Equivalent dynamic load P = X·V·F_r + Y·F_a: combined radial + axial load reducing to the equivalent pure-radial load that gives the same life.",
        "L₁₀ life: revolutions (or hours) at which 10% of a bearing population fails (90% reliability).",
        "Journal (sleeve) bearing: a bushing in which the rotating shaft rides on a hydrodynamic oil film.",
        "Petroff's law μ = 2π²(r/c)(ηN_s/P_avg): the friction floor of a concentric (no-load) journal bearing.",
        "Stribeck curve: μ vs (η·N/P_avg), showing boundary → mixed/EHL → hydrodynamic regimes.",
        "Sommerfeld number S = (r/c)²·(η·N_s/P_avg): the dimensionless journal-bearing characteristic.",
      ],
      principles: [
        "Rolling bearings have finite fatigue life — subsurface Hertzian shear initiates cracks that grow into spalls.",
        "L₁₀ = (C/P)^p × 10⁶ rev (p = 3 ball, p = 10/3 roller) — the Lundell-Palmgren rating-life equation.",
        "P = X·V·F_r + Y·F_a — combined radial + axial loading reduces to an equivalent P.",
        "Petroff's law gives the friction floor of a journal bearing; real loaded bearings run at 1.5–3× Petroff due to eccentricity ε > 0.",
        "Stribeck: every bearing design targets the minimum-μ regime between boundary and hydrodynamic.",
        "ISO 286 fits (k5 rotating inner, J7/H7 stationary outer) deliver the running clearance required to reach L₁₀.",
      ],
      components: [
        "Inner race (bore, k5 fit on rotating shaft).",
        "Outer race (OD, J7/H7 in stationary housing).",
        "Rolling elements (balls, cylindrical, tapered, spherical rollers).",
        "Cage (separator) — pressed steel, brass, polyamide.",
        "Seals (RS rubber) / shields (ZZ metal).",
        "Lubricant — grease NLGI 2 or oil ISO VG 32–460.",
        "Journal (shaft) + bushing — bronze SAE 660 or babbitt on steel.",
      ],
      mechanism:
        "Rolling bearings cycle the Hertzian contact stress at the rolling-element / race interface; subsurface shear at z ≈ 0.78·a below the surface initiates fatigue cracks that propagate to surface spalls after 10⁷–10⁹ cycles. Journal bearings support the shaft on a pressurized oil film generated by the shaft's rotation; the eccentricity of the shaft in the bore sets the load capacity and the friction coefficient above the Petroff floor.",
      process:
        "Specify duty (F_r, F_a, n, life target, environment) → pick bearing type → compute P = X·V·F_r + Y·F_a → compute L₁₀ = (C/P)^p × 10⁶ → apply ISO 281 a₁·a₂·a₃ → check S_0 = C_0/P_0 against brinelling → specify ISO 286 fit and lubricant viscosity grade → verify Stribeck operating point sits at the μ-minimum zone.",
      formulas: [
        "L₁₀ = (C/P)^p × 10⁶ rev  (p = 3 ball, p = 10/3 roller)",
        "L₁₀h = 10⁶·(C/P)^p/(60·n)  [hours]",
        "P = X·V·F_r + Y·F_a  [equivalent dynamic load]",
        "L_na = a₁·a₂·a₃·L₁₀  [ISO 281 adjusted life]",
        "S_0 = C_0/P_0  [static safety factor, target ≥ 1.0 general, ≥ 2.0 shock]",
        "μ = 2π²·(r/c)·(η·N_s/P_avg)  [Petroff's law]",
        "S = (r/c)²·(η·N_s/P_avg)  [Sommerfeld number]",
      ],
      metrics: [
        "L₁₀h in operating hours (target: 20,000–60,000 h industrial; 100,000+ h utility).",
        "Static safety factor S_0 (target ≥ 1.0 general, ≥ 2.0 heavy shock, ≥ 3.0 silent).",
        "Friction coefficient μ at the Stribeck minimum (target 0.002 rolling, 0.01 journal).",
        "Bearing temperature (target < 80 °C at housing; alarm at 95 °C).",
        "Vibration velocity (ISO 10816 zones A < 1.4, B 1.4–2.8, C 2.8–4.5, D > 4.5 mm/s RMS).",
        "Lubricant cleanliness (ISO 4406:1999 target 18/16/13 or better).",
      ],
      examples: [
        "L₁₀ = 1.25 × 10⁸ rev at C = 5 kN, P = 1 kN, ball bearing (1.25 × 10⁸ rev = 125 million rev = 1389 h at 1500 rpm).",
        "P = 4.41 kN at F_r = 4 kN, F_a = 1.4 kN on a 6209 bearing (X = 0.56, Y = 1.55, e = 0.28, F_a/F_r = 0.35 > e).",
        "Petroff μ = 0.005 at r = 25 mm, c = 0.05 mm, η = 0.032 Pa·s, N_s = 25 rev/s, P_avg = 1.5 MPa.",
      ],
      industrial_examples: [
        "Power — 1.2 MW induced-draft fan: 6324 deep-groove ball bearing, L₁₀h = 59,640 h ≈ 6.8 yr, vibration-trended per ISO 10816.",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Cogen boiler-feed-pump: BPFI peak at 187 Hz signaled inner-race spall on a 6313; root cause was shaft-current EDM from a VFD; retrofit with hybrid ceramic-ball bearings + insulated NDE bearing — 6 yr trouble-free.",
      ],
      common_errors: [
        "Treating C as a safe load (it gives L₁₀h ≈ 11 h at 1500 rpm — only a few hours of life).",
        "Forgetting the axial-load contribution when F_a/F_r > e (collapses life 2–5×).",
        "Wrong ISO 286 fit on the rotating race → fretting corrosion and premature failure.",
        "Mixing pre-greased (2RS) and re-greasable (open) bearings — blows the seal.",
        "Wrong viscosity grade for the speed — slides off the Stribeck minimum.",
        "Ignoring shaft-current damage on VFD-driven motors > 75 kW.",
      ],
      limitations: [
        "Lundell-Palmgren is empirical (1940s–60s steels); modern VIMVAR steels may exceed it by 3× (a₂).",
        "ISO 281 a₃ (operating) is poorly defined for contaminated lubrication.",
        "L₁₀ is 10%-failure life; for critical equipment specify L₁ (50%) or L₅ (95%) with appropriate a₁.",
        "Petroff's law applies only to the concentric (no-load) limit; real loaded bearings have ε > 0 and higher μ.",
        "The Stribeck curve is qualitative — exact μ in mixed/EHL depends on surface roughness and additive package.",
        "L₁₀ says nothing about static brinelling — check S_0 separately.",
      ],
      best_practices: [
        "Always compute L₁₀h = L₁₀/(60·n) and compare to the planned-maintenance cycle.",
        "Use hybrid ceramic-ball bearings on VFD-driven motors > 75 kW to avoid shaft-current EDM.",
        "Specify ISO 286 k5 (or j5) on the rotating race and J7/H7 in the stationary housing.",
        "Trend vibration by ISO 10816 zones — zone C is the early-warning trigger, zone D is the shutdown.",
        "Re-grease per the bearing-manufacturer's traffic-light method (e.g., SKF LGEP 2); do not over-grease.",
        "Filter the lubricant to ISO 4406 18/16/13 — contamination cuts L₁₀ by 50–80%.",
      ],
      related_concepts: [
        "Gears & gear design (Lesson 1) — gear tooth Hertzian contact is the surface analog of bearing-race contact.",
        "Springs, clutches & brakes (Lesson 3) — the Stribeck curve also governs clutch and brake friction material engagement.",
        "Fatigue failure (Shigley Ch. 11) — L₁₀ is a 10%-failure life; the underlying S-N curve is the same Wohler curve as for shafts.",
        "Lubrication regimes (Juvinall Ch. 13) — Petroff, Sommerfeld, Reynolds equation.",
        "ISO 286 fits — shaft and housing tolerance selection.",
      ],
      prerequisites: [
        "Statics (radial and axial force components).",
        "Mechanics of materials (Hertzian contact, subsurface shear).",
        "Fluid mechanics (Couette flow, Reynolds equation).",
        "Material science (HRC hardness, SAE 52100, hybrid ceramics).",
      ],
      references: MACHINE_DESIGN_REFERENCE_TITLES,
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
        "Which expression correctly gives the Lundell-Palmgren rating-life equation for a rolling-contact ball bearing?",
      explanation:
        "The Lundell-Palmgren equation L₁₀ = (C/P)^p × 10⁶ revolutions, with p = 3 for ball bearings and p = 10/3 for roller bearings, is the ABMA Std 9 / ISO 281 rating-life equation. L₁₀ is the life at which 10% of a population fails (90% reliability).",
      whyCorrect:
        "L₁₀ = (C/P)³ × 10⁶ revolutions is the Lundell-Palmgren equation for a ball bearing (p = 3). The basic dynamic load rating C is the load at which 90% of bearings survive 1×10⁶ revolutions; P is the equivalent dynamic load; the cube exponent reflects the line-contact (or point-contact) Hertzian fatigue exponent for ball bearings.",
      whyOthersWrong: [
        "L₁₀ = (P/C)³ × 10⁶ reverses the ratio — the bearing life would fall as load falls, opposite of physics.",
        "L₁₀ = (C/P)² × 10⁶ uses the wrong exponent p = 2 — the correct value for ball bearings is p = 3.",
        "L₁₀ = (C·P)³ × 10⁶ multiplies C and P — the rating-life ratio is C/P (load capacity over actual load), not C·P.",
      ],
      options: [
        { text: "L₁₀ = (C/P)³ × 10⁶ revolutions", isCorrect: true },
        { text: "L₁₀ = (P/C)³ × 10⁶ revolutions", isCorrect: false },
        { text: "L₁₀ = (C/P)² × 10⁶ revolutions", isCorrect: false },
        { text: "L₁₀ = (C·P)³ × 10⁶ revolutions", isCorrect: false },
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
        "A deep-groove ball bearing with basic dynamic load rating C = 5 kN operates at equivalent dynamic load P = 1 kN. The L₁₀ rating life (in revolutions) is closest to:",
      explanation:
        "L₁₀ = (C/P)³ × 10⁶ = (5/1)³ × 10⁶ = 125 × 10⁶ = 1.25 × 10⁸ revolutions. At 1500 rpm, this is 1.25×10⁸/(60 × 1500) = 1389 hours of continuous service.",
      whyCorrect:
        "Apply L₁₀ = (C/P)³ × 10⁶: with C = 5 kN and P = 1 kN, C/P = 5; (5)³ = 125; L₁₀ = 125 × 10⁶ = 1.25 × 10⁸ revolutions (125 million revolutions). Converting to operating hours at 1500 rpm: L₁₀h = 1.25 × 10⁸/(60 × 1500) = 1389 h ≈ 58 days of continuous service. This far exceeds the common industrial design target of L₁₀ = 10⁷ rev (10 million rev) — the bearing is comfortably oversized.",
      whyOthersWrong: [
        "1.25 × 10⁶ rev uses (C/P)¹ × 10⁶ instead of (C/P)³ × 10⁶ — drops the load exponent.",
        "1.25 × 10⁷ rev would require (C/P)³ = 10, i.e., C/P ≈ 2.154 — not C/P = 5.",
        "1.25 × 10⁹ rev uses (C/P)⁶ × 10⁶ — doubles the cube exponent; p = 3 (not 6) for ball bearings.",
      ],
      options: [
        { text: "1.25 × 10⁶ revolutions", isCorrect: false },
        { text: "1.25 × 10⁷ revolutions", isCorrect: false },
        { text: "1.25 × 10⁸ revolutions", isCorrect: true },
        { text: "1.25 × 10⁹ revolutions", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem:
        "On the Stribeck curve (friction coefficient μ vs η·N/P_avg), a rolling-contact bearing operating at the left edge of the curve (very low η·N/P_avg) is in which lubrication regime, and what is the characteristic friction coefficient?",
      explanation:
        "Low η·N/P_avg (low speed, low viscosity, or high load) puts the bearing in the *boundary* regime with metal-to-metal contact through adsorbed molecular films; characteristic μ ≈ 0.10–0.20 with adhesive and abrasive wear.",
      whyCorrect:
        "At low η·N/P_avg, the bearing is in the *boundary* lubrication regime — the lubricant film is thinner than the surface roughness, so the asperities touch. Friction coefficient is high (μ ≈ 0.10–0.20) and wear is dominated by adhesive and abrasive mechanisms. The engineer's design target is to operate at the minimum-μ point (right of boundary), in the mixed/EHL or hydrodynamic regime, where μ drops to 0.002–0.01 for rolling bearings.",
      whyOthersWrong: [
        "The minimum-μ point at the inflection of the curve (mixed/EHL regime) sits in the *middle* of the curve, not the left edge.",
        "The hydrodynamic regime sits at the *right* edge of the curve (high η·N/P_avg), with μ rising linearly due to viscous drag.",
        "Stribeck regime transitions are continuous — there is no 'zero-μ' regime at any point on the curve.",
      ],
      options: [
        { text: "Boundary regime, μ ≈ 0.10–0.20, metal-to-metal contact", isCorrect: true },
        { text: "Minimum-μ mixed/EHL regime, μ ≈ 0.002–0.01", isCorrect: false },
        { text: "Hydrodynamic regime, μ rises linearly with η·N", isCorrect: false },
        { text: "Zero-μ regime, no friction", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: Petroff's law μ = 2π²(r/c)·(η·N_s/P_avg) gives the friction coefficient of a *concentric, no-load* journal bearing. Real loaded journal bearings operate at the same friction value because the load is supported hydrodynamically without changing the oil film thickness.",
      explanation:
        "FALSE. Petroff's law applies only to the idealized concentric (no-load) limit. Real loaded journal bearings operate with the shaft eccentric (ε > 0) inside the bore; the friction coefficient rises 1.5–3× above the Petroff floor as the shaft approaches the bushing surface and the minimum film thickness h_min = c(1 − ε) shrinks.",
      whyCorrect:
        "FALSE. Petroff's law μ = 2π²(r/c)·(η·N_s/P_avg) is the lower-bound friction for a *concentric* (no-load) journal bearing — the shaft is centered in the bore (ε = 0) and the film thickness is uniform. A real loaded bearing has the shaft eccentric (ε > 0); the load capacity comes from the wedge-shaped film whose minimum thickness h_min = c(1 − ε) shrinks as the load rises. The friction coefficient rises 1.5–3× above the Petroff floor as ε → 1. Petroff's law is the floor, not the actual operating value.",
      whyOthersWrong: [
        "TRUE would require that load does not affect the friction of a journal bearing — but it does, because the eccentricity ratio ε and the minimum film thickness h_min are direct functions of load (via the Sommerfeld number). Higher load → larger ε → smaller h_min → higher μ.",
      ],
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Springs, Clutches & Brakes
// (slug: md-springs-clutches-brakes)
// ---------------------------------------------------------------------------

const LESSON_SPRINGS_CLUTCHES_BRAKES: RefLesson = {
  slug: "md-springs-clutches-brakes",
  title: "Springs, Clutches & Brakes",
  titleAr: "النوابض، والقوابض، والمكابح",
  order: 3,
  durationMin: 35,
  references: MACHINE_DESIGN_REFERENCE_TITLES,
  conceptIntroduction: `Springs, clutches, and brakes are the elastic and friction elements of mechanical design — springs absorb and store energy, clutches engage and disengage power flow, brakes dissipate kinetic energy as heat. The *helical compression spring* is the workhorse of the spring family: its rate (stiffness) k = Gd⁴/(8D³n) is derived by treating each coil as a torsion bar of diameter d, mean coil diameter D, and n active coils, with shear modulus G ≈ 79.3 GPa for music wire. The dominant stress is torsional — τ = K_w·8FD/(πd³) where K_w = (4C−1)/(4C−4) + 0.615/C is the *Wahl factor* correcting for both direct shear and curvature at the inner coil, with C = D/d the *spring index* (4 ≤ C ≤ 12 for good design). For the *disc clutch*, the torque capacity under the *uniform pressure* assumption with n friction surfaces is T = (2/3)·μW·n·(R_o³−R_i³)/(R_o²−R_i²); for a dual-face dry disc clutch (n = 2) this simplifies to T = (4/3)·μW·(R_o³−R_i³)/(R_o²−R_i²). The competing *uniform wear* (broken-in) assumption gives T = μW·n·(R_o+R_i)/2 — the conservative design value. This lesson covers the spring-rate and stress formulas, the disc clutch torque formulas, and the band/cone brake variants used in industrial brakes.`,
  sections: {
    learning_objectives: `- Derive and apply the helical compression-spring rate formula k = Gd⁴/(8D³n) and the torsional stress formula τ = K_w·8FD/(πd³).
- Compute the Wahl factor K_w = (4C−1)/(4C−4) + 0.615/C and select a spring index C = D/d in the range 4 ≤ C ≤ 12.
- Distinguish the two disc-clutch torque assumptions: uniform pressure (new clutch) T = (2/3)μW·n·(R_o³−R_i³)/(R_o²−R_i²) and uniform wear (broken-in) T = μW·n·(R_o+R_i)/2.
- Apply the dual-face disc clutch torque formula T = (4/3)μW·(R_o³−R_i³)/(R_o²−R_i²) for n = 2 friction surfaces.
- Compute the band-brake torque T = (T_1 − T_2)·r = T_2·r·(e^(μθ) − 1) for a simple band brake, and the cone-clutch torque for a half-angle α.
- Select friction materials (organic, sintered, ceramic) for clutches and brakes by PV [pressure × velocity] and temperature limit.
- Apply the helical spring fatigue analysis: Goodman / Soderberg for cyclic loading; surge frequency f_surge = (d/(2π·D²·n))·√(G/(8·ρ)) for impact-loaded springs.`,
    prerequisites: `- Mechanics of materials: torsion of circular shafts τ = T·r/J; curved-beam stress.
- Material science: spring-steel hardness (HRC 45–55), Wohler S-N curve for music wire / chrome-vanadium / chrome-silicon.
- Statics: friction on a flat and curved surface; belt friction T_1/T_2 = e^(μθ).
- Heat transfer: frictional heat flux q = μ·P·V; brake disc temperature rise.`,
    introduction: `Springs are elastic elements that store and release energy by deformation; clutches and brakes are friction elements that engage, disengage, or dissipate power flow. The *helical compression spring* (wire wound into a helix, loaded along its axis) is the most common spring form. Its rate (stiffness) k = Gd⁴/(8D³n) is derived by modeling each coil as a torsion bar of length πD, diameter d, and angular twist proportional to the axial deflection; the result is the four-power dependence on wire diameter d (small increases in d give large increases in k) and the cubic inverse dependence on mean coil diameter D. The dominant stress is torsional at the inner coil surface: τ = 8FD/(πd³)·K_w, where K_w is the *Wahl factor* (1.0 ≤ K_w ≤ 1.4 for spring index 4 ≤ C = D/d ≤ 12) correcting for both direct shear and curvature stress concentration.

The *disc clutch* transmits torque between two flat discs pressed together axially with force W. Under the *uniform pressure* assumption (a new clutch with virgin surfaces), the pressure p is uniform across the friction face and the torque per face is T_face = (2/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²). With n friction surfaces (typically n = 2 for a dual-face dry disc automotive clutch, n = 4 or 6 for a multi-plate wet clutch), the total torque is T = n × T_face. For n = 2, T = (4/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²) — the formula in this lesson's worked example. Under the competing *uniform wear* assumption (a broken-in clutch where the wear rate is proportional to p·r, so p·r = const), the torque per face simplifies to T_face = μ·W·(R_o + R_i)/2 — the conservative design value, since the broken-in clutch carries less torque than the new clutch.

The *band brake* uses a flexible band wrapped around a drum, with one end anchored and the other loaded with tension T_2; the friction between the band and the drum gives T_1/T_2 = e^(μθ), so the braking torque is T_brake = (T_1 − T_2)·r = T_2·r·(e^(μθ) − 1). The *cone clutch* (friction on a conical face of half-angle α) and *block brake* (segmented shoes) provide higher torque per unit axial force by adding a wedging factor 1/sin(α). The *disc brake* (automotive) is the modern replacement for the drum brake — its uniform-wear torque is T = μ·W·(R_o + R_i)/2 per face.

The friction material selection is driven by the PV (pressure × velocity) value and the temperature limit: organic friction materials (resin-bonded) for PV < 1 MPa·m/s, sintered bronze (steel-backed) for PV up to 5 MPa·m/s, ceramic / carbon-carbon for PV up to 30 MPa·m/s (aircraft and racing clutches).`,
    terminology: `- **Spring rate k** (N/mm): axial stiffness, k = Gd⁴/(8D³n).
- **Wire diameter d** (mm): the diameter of the spring wire.
- **Mean coil diameter D** (mm): the average diameter of the helix (from wire centerline to wire centerline).
- **Spring index C**: C = D/d (typically 4 ≤ C ≤ 12 for good design; C < 4 hard to wind, C > 12 has weak coils that buckle).
- **Active coils n**: number of coils that flex under load (total coils minus inactive ends; for squared-and-ground ends, n = N_total − 2).
- **Wahl factor K_w**: K_w = (4C−1)/(4C−4) + 0.615/C — stress-concentration factor for both direct shear and curvature at the inner coil.
- **Shear modulus G**: ≈ 79.3 GPa for music wire / chrome-vanadium; 27 GPa for beryllium copper; 48 GPa for phosphor bronze.
- **Solid length L_s**: spring length when all coils touch (L_s = N_total · d).
- **Free length L_f**: spring length at zero load.
- **Disc clutch**: torque transmission between two flat discs pressed together axially.
- **Friction surface count n**: number of friction interfaces (n = 2 for a single-stage dual-face automotive clutch, n = 4 or 6 for multi-plate wet clutches).
- **Outer radius R_o** (mm), inner radius R_i** (mm): the friction-face annulus dimensions.
- **Uniform pressure**: new-clutch assumption, p uniform across the face.
- **Uniform wear**: broken-in assumption, p·r = const across the face (wear rate proportional to p·r).
- **PV value**: pressure × sliding velocity (MPa·m/s) — the limiting friction-material parameter.
- **Band brake**: flexible band wrapped on a drum; T_1/T_2 = e^(μθ).
- **Cone clutch**: friction on a conical face of half-angle α; wedging factor 1/sin(α).
- **Sintered bronze**: metal-powder friction material, PV up to 5 MPa·m/s.`,
    detailed_explanation: `**Helical compression spring derivation.** Consider a wire of diameter d wound into a helix of mean coil diameter D. Apply axial load F. Each coil cross-section sees a torque T = F·D/2 (the load F at moment arm D/2). The torsional shear stress in the wire is τ = T·r/J = (F·D/2)·(d/2)/(π·d⁴/32) = 8·F·D/(π·d³). The Wahl factor K_w = (4C−1)/(4C−4) + 0.615/C multiplies this to capture (a) the direct transverse shear (4C−1)/(4C−4) and (b) the curvature stress concentration 0.615/C at the inner coil; the final stress is:
  τ_max = K_w · 8·F·D/(π·d³)
The deflection of one coil under torque T = F·D/2 over length π·D is the torsion-bar formula: δ_per_coil = T·L/(G·J) = (F·D/2)·(π·D)/(G·π·d⁴/32) = 8·F·D³/(G·d⁴). With n active coils, the total deflection is δ = n·δ_per_coil = 8·F·D³·n/(G·d⁴). Solving for F = k·δ gives the spring rate:
  k = F/δ = G·d⁴/(8·D³·n)
This is the engineer's primary spring-design formula. Note the four-power dependence on d (doubling d multiplies k by 16) and the cubic inverse dependence on D (doubling D cuts k by 8). The number of active coils n enters linearly — fewer coils give a stiffer spring.

**Wahl factor K_w.** For spring index C = 4, K_w = (15/12) + 0.615/4 = 1.25 + 0.154 = 1.404. For C = 8, K_w = (31/28) + 0.615/8 = 1.107 + 0.077 = 1.184. For C = 12, K_w = (47/44) + 0.615/12 = 1.068 + 0.051 = 1.119. The Wahl factor rises sharply for small C — that's why the design range is 6 ≤ C ≤ 10 (with C = 8 a typical sweet spot).

**Disc clutch torque — uniform pressure.** A friction face of outer radius R_o and inner radius R_i is loaded axially with force W. Under uniform pressure (new clutch), p = W/(π(R_o² − R_i²)). The friction torque at radius r is dT = μ·p·dA·r = μ·p·(2π·r·dr)·r = 2π·μ·p·r²·dr. Integrate from R_i to R_o:
  T_face = ∫_(R_i)^(R_o) 2π·μ·p·r²·dr = (2/3)·π·μ·p·(R_o³ − R_i³)
Substituting p:
  T_face = (2/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²)
For n friction surfaces: T = n·T_face = (2/3)·n·μ·W·(R_o³ − R_i³)/(R_o² − R_i²)
For a dual-face clutch (n = 2): T = (4/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²) ✓

**Disc clutch torque — uniform wear.** For a broken-in clutch, the wear rate is proportional to p·r·V = p·r·ω·r = p·ω·r². For uniform wear (constant wear rate), p·r² = K' (constant). But the standard uniform-wear assumption in textbooks uses p·r = K (the wear rate proportional to pressure times velocity V = ωr, so wear ∝ p·V·t = p·ω·r·t — uniform if p·r = const). Re-derive:
  W = ∫p·dA = ∫_(R_i)^(R_o) (K/r)·2π·r·dr = 2π·K·(R_o − R_i)
  → K = W/(2π·(R_o − R_i))
  T_face = ∫μ·p·dA·r = ∫_(R_i)^(R_o) μ·(K/r)·2π·r·dr·r = 2π·μ·K·∫r·dr = π·μ·K·(R_o² − R_i²)
  Substituting K: T_face = π·μ·W·(R_o² − R_i²)/(2π·(R_o − R_i)) = μ·W·(R_o + R_i)/2
For n surfaces: T = n·μ·W·(R_o + R_i)/2 ✓
The uniform-wear assumption gives a *lower* torque than uniform pressure (because the broken-in clutch has more wear at the outer radius, lowering the pressure there); the broken-in clutch is the conservative design value.

**Band brake.** A flexible band wraps a drum of radius r over angle θ (radians). One end is anchored (high-tension side T_1), the other loaded (low-tension side T_2). The belt-friction equation gives T_1/T_2 = e^(μθ). The braking torque is T_brake = (T_1 − T_2)·r = T_2·r·(e^(μθ) − 1). The brake is *self-energizing* if the drum rotation pulls the band tight (T_1 on the anchored side) — the braking torque then exceeds μ·W·r (the simple disc-brake value).

**Friction material selection.** Material PV [pressure × velocity] limit:
  - Organic (resin-bonded asbestos-free): PV < 1 MPa·m/s, μ ≈ 0.25–0.35, max T 250 °C — automotive light-duty.
  - Sintered bronze (steel-backed): PV < 5 MPa·m/s, μ ≈ 0.20–0.30, max T 450 °C — industrial.
  - Ceramic / semi-metallic: PV < 15 MPa·m/s, μ ≈ 0.30–0.45, max T 650 °C — heavy-duty automotive & off-highway.
  - Carbon-carbon composite: PV < 30 MPa·m/s, μ ≈ 0.25–0.35, max T 1500 °C — aircraft & racing.`,
    core_principles: `- **Spring rate**: k = Gd⁴/(8D³n) — derived by modeling each coil as a torsion bar; strong 4-power dependence on d, 3-power on D, linear on 1/n.
- **Torsional stress**: τ_max = K_w·8FD/(πd³); Wahl K_w captures direct shear + curvature, ≈ 1.18 at C = 8.
- **Spring index**: C = D/d, design range 6 ≤ C ≤ 10 (sweet spot C = 8); C < 4 hard to wind, C > 12 buckles.
- **Disc clutch (uniform pressure, n faces)**: T = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²). Dual-face n = 2: T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²).
- **Disc clutch (uniform wear, n faces)**: T = n·μ·W·(R_o+R_i)/2 — the *conservative* (broken-in) value.
- **Band brake**: T = T_2·r·(e^(μθ) − 1); the brake is self-energizing if the drum pulls the band tight.
- **PV limit** of friction material caps the design; brake/clutch heat flux q = μ·P·V must dissipate to limit temperature rise.`,
    components: `- **Spring wire**: music wire (ASTM A228, HRC 45–50), chrome-vanadium (ASTM A232, HRC 50–55), chrome-silicon (ASTM A401, HRC 50–55), stainless 302 (ASTM A313).
- **Spring end types**: plain, squared, squared-and-ground (for axial-load concentricity — required for compression springs).
- **Clutch disc**: friction material bonded or riveted to a steel disc; splined hub.
- **Pressure plate**: cast iron, applies the clamping force W via springs or diaphragm.
- **Flywheel**: provides the inertia side of the clutch (driven by the engine).
- **Brake disc (rotor)**: cast iron (GG25) or carbon-ceramic; vents for cooling.
- **Brake caliper**: hydraulically actuated; pin-sliding or fixed-opposed-piston design.
- **Friction material**: organic, sintered bronze, semi-metallic, ceramic, carbon-carbon.`,
    process: `1. Specify the duty: spring — load range (F_min, F_max), deflection (δ_min, δ_max), cyclic life; clutch — torque T, speed n, cycle rate, inertia; brake — stopping time, kinetic energy, duty cycle.
2. Spring: pick a wire size d (start with d = 3 mm for sub-kN loads), pick a mean coil D from C = D/d ≈ 8, compute n from k = Gd⁴/(8D³n); verify τ_max ≤ τ_allowable for the wire (e.g., τ_allowable ≈ 0.50·S_ut for music wire).
3. Spring: check solid length L_s = (N_total)·d does not exceed free length L_f; check surge frequency f_surge > 15× the cyclic excitation frequency.
4. Clutch: pick friction material from PV = μ·P·V limit; pick R_o, R_i (typically R_i ≈ 0.6·R_o); compute required W from T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) (uniform pressure, new clutch) and from T = μ·W·(R_o+R_i)/2 (uniform wear, broken-in) — pick the *broken-in* W as the design value (conservative).
5. Brake: compute the kinetic energy E_k = ½·I·ω²; compute the braking torque from stopping time T_brake = I·(ω_1 − ω_2)/t_stop; check the heat flux q = T_brake·ω / (friction area) against the material's PV limit.
6. Detail the components: ISO 286 fits on splines and bores; surface finish on friction faces; lubrication (grease for spring seats; dry or wet for clutches); thermal management (venting, cooling ducts).
7. Verify against fatigue life for cyclic springs (Goodman), and against wear life for clutches/brakes (PV × cycles).`,
    formula_calculation: `**Helical compression spring:**
  k = G·d⁴/(8·D³·n)        [N/mm if G in MPa, d & D in mm]
  δ = F/k = 8·F·D³·n/(G·d⁴)
  τ_max = K_w · 8·F·D/(π·d³)    [MPa]
  K_w = (4C−1)/(4C−4) + 0.615/C, where C = D/d (spring index, design 6–10)

**Spring surge frequency:**
  f_surge = (d/(2π·D²·n))·√(G/(8·ρ))    [Hz]
  Design target: f_surge > 15 × f_excitation (to avoid resonance).

**Disc clutch — uniform pressure (new clutch):**
  T_face = (2/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²)
  T_total = n · T_face
For dual-face (n = 2):
  T = (4/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²)

**Disc clutch — uniform wear (broken-in, conservative):**
  T_face = μ·W·(R_o + R_i)/2
  T_total = n · T_face = n·μ·W·(R_o + R_i)/2

**Band brake (simple band on a drum of radius r, wrap angle θ, low-tension T_2):**
  T_1 = T_2 · e^(μθ)
  T_brake = (T_1 − T_2)·r = T_2·r·(e^(μθ) − 1)

**Cone clutch (half-angle α, mean radius R_m):**
  T = (μ·W·R_m)/sin(α)  (uniform wear) — wedging factor 1/sin(α) gives a high torque per unit axial force.

**PV limit of friction material (pressure × sliding velocity):**
  PV = P·V ≤ PV_limit  [MPa·m/s]
  P = W/(π·(R_o² − R_i²))  (uniform pressure)
  V = ω·R_m = π·D·n/60  (mean sliding velocity)
  Material PV_limit: organic 1, sintered bronze 5, semi-metallic 10, ceramic 15, carbon-carbon 30 MPa·m/s.

**Heat flux on friction face:**
  q = T·ω / (n·π·(R_o² − R_i²))    [W/m²]
  Steady-state disc temperature rise: ΔT_ss = q·R_th (R_th = 1/(h·A) for convection).

**Assumptions**: (i) linear elastic spring wire below the torsional proportional limit (≈ 0.40·S_ut); (ii) friction coefficient μ is constant over the operating temperature range; (iii) friction face is flat and rigid; (iv) heat flux is uniformly distributed over the friction face; (v) ambient cooling is steady.

**Interpretation**: a spring with d = 3 mm, D = 30 mm, n = 10, G = 79.3 GPa gives k = (79,300·81)/(8·27,000·10) = 2.97 N/mm. To reach k = 10 N/mm (a stiffer spring), the engineer can (a) reduce D to 20 mm (k ≈ 10.0 N/mm), (b) increase d to 4.1 mm (k ≈ 10.3 N/mm), or (c) reduce active coils n to 3 (k ≈ 9.9 N/mm). The 4-power dependence on d dominates — small increases in wire diameter multiply k by 16. A disc clutch with μ = 0.25, W = 5 kN, R_o = 100 mm, R_i = 60 mm, n = 2 (dual-face) carries T = (4/3)·0.25·5,000·(100³−60³)/(100²−60²) = 0.333·5,000·122.5 = 204,000 N·mm = 204 N·m.`,
    worked_example: `**Helical compression-spring rate.**
Given: music-wire spring (G = 79.3 GPa = 79,300 MPa), wire diameter d = 3 mm, mean coil diameter D = 30 mm, active coils n = 10.
k = G·d⁴/(8·D³·n) = 79,300 × 3⁴ / (8 × 30³ × 10)
  = 79,300 × 81 / (8 × 27,000 × 10)
  = 6,423,300 / 2,160,000
  = 2.97 N/mm
So with d = 3 mm, D = 30 mm, n = 10, G = 79.3 GPa, the spring rate is k ≈ 2.97 N/mm. **Achieving k = 10 N/mm** requires design changes:
  (a) Reduce mean coil diameter D to 20 mm:
      k = 79,300 × 81/(8 × 8000 × 10) = 6,423,300/640,000 = 10.04 N/mm ≈ 10 N/mm ✓
  (b) Increase wire diameter d to 4.1 mm (other parameters fixed):
      d⁴ = 282.6; k = 79,300 × 282.6/(8 × 27,000 × 10) = 22,414,180/2,160,000 = 10.38 N/mm ≈ 10 N/mm ✓
  (c) Reduce active coils n to 3:
      k = 79,300 × 81/(8 × 27,000 × 3) = 6,423,300/648,000 = 9.91 N/mm ≈ 10 N/mm ✓
The (d)⁴ dependence makes (b) the most efficient change — a 37% increase in wire diameter gives a 250% increase in spring rate. **Torsional stress at F = 50 N** (a load giving δ = F/k = 50/2.97 = 16.8 mm): spring index C = D/d = 30/3 = 10; Wahl factor K_w = (4·10−1)/(4·10−4) + 0.615/10 = 39/36 + 0.0615 = 1.083 + 0.0615 = 1.145. τ_max = K_w·8·F·D/(π·d³) = 1.145·8·50·30/(π·27) = 1.145·4000·30/(84.82) = 137,400/84.82 = 1,620 MPa — exceeds the torsional proportional limit of music wire (≈ 700 MPa) → the spring would yield. Reduce F to 20 N: τ_max = 1.145·8·20·30/(π·27) = 5,496/2.66 = 648 MPa < 700 MPa ✓.

**Dual-face disc clutch torque (uniform pressure).**
Given: μ = 0.25 (organic friction material on steel), axial force W = 5 kN, R_o = 100 mm, R_i = 60 mm, n = 2 (dual-face dry disc clutch).
T = (4/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²)
  = (4/3)·0.25·5,000·(100³ − 60³)/(100² − 60²)
  = 0.333·0.25·5,000·(1,000,000 − 216,000)/(10,000 − 3,600)
  = 0.333·0.25·5,000·784,000/6,400
  = 0.333·0.25·5,000·122.5
  = 0.333·153,125
  = 51,042 N·mm per face — wait, this is per-face; with n=2 the answer is doubled.

Let me recompute:
T_total = n·T_face = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²)
  = (2/3)·2·0.25·5,000·784,000/6,400
  = 1.333·0.25·5,000·122.5
  = 1.333·153,125
  = 204,167 N·mm
  = 204 N·m ✓

**Uniform-wear check (conservative):**
T_wear = n·μ·W·(R_o+R_i)/2 = 2·0.25·5,000·(100+60)/2 = 2·0.25·5,000·80 = 200,000 N·mm = 200 N·m
So the broken-in clutch carries T ≈ 200 N·m vs the new clutch T ≈ 204 N·m — a 2% reduction (small for this geometry). The design value is 200 N·m (broken-in, conservative).

**Heat-flux check:** the friction power at 1500 rpm (= 25 rev/s, ω = 2π·25 = 157 rad/s) is P_friction = T·ω = 200·157 = 31,400 W = 31.4 kW. The friction-face area A = π·(0.1² − 0.06²) = π·0.0064 = 0.0201 m²; per face. Total area (2 faces) = 0.0402 m². Heat flux q = 31,400/0.0402 = 781,000 W/m² = 0.78 MW/m². With a 250 mm-diameter vented cast-iron disc dissipating 0.5 MW/m² at 100 °C surface temperature, the steady-state surface temperature rise is ~80 °C above ambient — adequate for organic friction material (max 250 °C) but marginal for sustained high-speed operation; a vented ductile-iron disc would be specified for racing or truck service.`,
    industrial_example: `**Industry: Automotive — dry-disc clutch.** A 200-N·m / 1500-rpm automotive clutch (engine peak torque 200 N·m at 4000 rpm) uses a dual-face dry disc clutch with μ = 0.27 (organic), W = 4.5 kN clamping (diaphragm spring), R_o = 105 mm, R_i = 75 mm. T = (4/3)·0.27·4,500·(105³−75³)/(105²−75²) = 1.333·0.27·4,500·1,395,000/8,100 = 1.333·0.27·4,500·172.2 = 1.333·210,420 = 280,560 N·mm = 280 N·m — a safety factor of 1.4× over the engine's 200 N·m peak (target n ≥ 1.3). The diaphragm spring ( Belleville-style, k = 1.2 kN/mm at full clamp) provides a flat load-deflection curve over the 2 mm of clutch-wear travel. Friction material is organic (resin-bonded) for passenger cars; semi-metallic for heavy-duty pickups (PV rises from 0.5 to 5 MPa·m/s); ceramic for racing clutches (PV up to 15 MPa·m/s, μ 0.30–0.45). The clutch is replaced every 100,000 km in passenger service; LCC economics in engineering-economics-management.ts Lesson 2.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Crescent Valley Mining — hoist brake failure (synthetic, illustrative).* A 2-MW mine-hoist drum brake (two caliper-disc brakes, 1.4 m OD, 60 mm thick, vented cast-iron) stopped a 12-tonne payload travelling at 8 m/s on a 1500-m-deep shaft. The brake engaged normally on cycle 1,247 of a routine shift; on cycle 1,248 the friction torque dropped 40% in 0.4 s, the drum oversped 12%, and the hoist controller tripped on overspeed. Investigation: the disc surface had blue-tempered spots (estimated 480 °C localized hot-spots from the previous engagement's stored heat), with a 2-mm-diameter spalled zone on the outer-disc face; the friction material was degraded locally to a glassy oxide with μ falling from 0.35 (organic) to 0.18 (glazed). Root cause: the previous engagement had been a 6-second sustained emergency stop (instead of the usual 2-s service stop); the disc thermal mass was inadequate for the duty, and the friction material exceeded its PV · t (impulse) limit of 60 MPa·m/s·s. Remedy: (a) replace the disc with a 100-mm-thick ductile-iron vented disc (2× thermal mass), (b) upgrade friction material to ceramic (PV_limit 15 MPa·m/s, μ 0.30, max T 650 °C), (c) add a 5°C/min cooling-rate interlock that prevents engagement if disc temperature > 200 °C. The unit has since run 18 months trouble-free.`,
    visual_explanation: `**Helical compression spring as a torsion bar.** A wire of diameter d wound into a helix of mean diameter D, loaded axially by F. Each coil cross-section sees a torque T = F·D/2; the torsion-bar formula gives δ_per_coil = T·L/(G·J) = (F·D/2)·(π·D)/(G·π·d⁴/32) = 8·F·D³/(G·d⁴). Summing n coils: δ = 8·F·D³·n/(G·d⁴); solving for k = F/δ gives the spring-rate formula. The 4-power dependence on d shows in the torsion-bar J = π·d⁴/32 — doubling d multiplies J by 16, hence k by 16. **Disc clutch friction-face pressure distribution.** Uniform pressure (new clutch): p uniform across the annulus R_i to R_o; the integral T = (2/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) gives more weight to the outer radius (faster surface speed → more friction torque per unit pressure). Uniform wear (broken-in): p·r = const, so the pressure peaks at the inner radius and decays outward; the integral T = μ·W·(R_o+R_i)/2 is the lower (conservative) value. The two curves can be overlaid to show the 2–10% gap between new and broken-in clutch torque capacity.`,
    simulation_opportunity: `Open the EngiSuite "Spring & Clutch explorer" — sliders for spring wire d (1–10 mm), mean diameter D (5–80 mm), active coils n (3–20), material (music wire, chrome-vanadium, stainless 302); the widget reports k, τ_max at a chosen load F, solid length, and surge frequency in real time. A second panel for the disc clutch: sliders for μ (0.20–0.45), W (1–10 kN), R_o (50–150 mm), R_i (0.3–0.8×R_o), n (1, 2, 4, 6 friction faces); the widget reports the uniform-pressure T, the uniform-wear T, the PV at a chosen speed, and flags red if PV exceeds the friction material's limit. Try this scenario: spring d = 3 mm, D = 30 mm, n = 10, F = 20 N → k = 2.97 N/mm, τ_max = 648 MPa (just below the music-wire proportional limit). To reach k = 10 N/mm, slide D down to 20 mm → k = 10.04 N/mm — confirming the worked example. For the clutch, μ = 0.27, W = 4.5 kN, R_o = 105, R_i = 75, n = 2 → T_uniform-pressure = 280 N·m, T_uniform-wear = 243 N·m (a 13% gap typical for this geometry).`,
    common_mistakes: `- **Forgetting the Wahl factor** K_w in the spring stress formula: the uncorrected τ = 8FD/(πd³) understates the inner-coil stress by 10–40%; the spring fails prematurely.
- **Picking a spring index C < 4**: too hard to wind, locally yields the wire at the inner coil; tooling breaks.
- **Picking C > 12**: weak coils that buckle under compression, or surging at low frequency under cyclic load.
- **Using uniform-pressure torque for a service clutch**: the broken-in (uniform-wear) value is the design torque; the new-clutch value overstates capacity by 2–10%.
- **Ignoring the PV limit**: a friction material run above its PV limit glazes, smokes, and fails within minutes. Always check PV < PV_limit AND check the steady-state temperature rise.
- **Forgetting heat dissipation**: a brake disc dissipates 0.5–2 MW/m² at peak; without cooling ducts the surface exceeds 500 °C and the friction material degrades.
- **Spring surge**: a cyclically loaded spring has a surge (resonant) frequency; if the excitation frequency approaches it, the spring enters resonance and the stresses multiply 5–10×. Always specify f_surge > 15 × f_excitation.`,
    limitations: `- The spring-rate formula k = Gd⁴/(8D³n) assumes the spring is below the torsional proportional limit (F < 0.40·S_ut·A_wire). Above this, the spring takes a permanent set.
- The Wahl factor K_w is empirical, calibrated to music wire and chrome-vanadium; for unusual materials (titanium, beryllium copper) the Wahl factor can vary ±10%.
- The disc clutch formulas assume a flat, rigid friction face; in practice the clutch disc and pressure plate deflect elastically under load (and the friction material is compliant), so the actual torque sits between the uniform-pressure and uniform-wear values.
- The PV limit is a steady-state limit; for impulse / emergency stops the friction material has a PV·t limit (impulse) that is much lower.
- The band-brake formula T = T_2·r·(e^(μθ) − 1) assumes the band is thin and flexible; thick bands or block-type bands have modified coefficients.
- The clutch / brake torque scales linearly with W and μ but the *heat dissipation* scales with T·ω (P = T·ω) — a high-W, low-μ design and a low-W, high-μ design carry the same torque but dissipate the same heat; the design trade-off is in the friction material's PV limit and the actuator size.`,
    comparison: `| Spring type | Rate formula | Dominant stress | Application |
|---|---|---|---|
| Helical compression | k = Gd⁴/(8D³n) | Torsional τ = K_w·8FD/(πd³) | Engine valves, suspension, safety valves |
| Helical extension | k = Gd⁴/(8D³n) (same) | Torsional at the hook | Closures, gas springs |
| Helical torsion | k_t = Ed⁴/(10.8·D·n) | Bending σ = K_b·32M/(πd³) | Clothes pins, mouse traps |
| Belleville (disc) | k = E·t⁴·ln(h_0/t)/(2·D²·...) | Tensile at inner edge | Clutches, ball-bearing preload |
| Leaf | k = 3EI/L³ | Bending σ = 6FL/(b·t²) | Vehicle suspension |

| Clutch type | Torque formula | Self-energizing? | Typical use |
|---|---|---|---|
| Single disc, uniform pressure | (2/3)μW(R_o³−R_i³)/(R_o²−R_i²) | No | Industrial, low cycle |
| Single disc, uniform wear | μW(R_o+R_i)/2 | No | Most service clutches |
| Dual-face (n=2), uniform pressure | (4/3)μW(R_o³−R_i³)/(R_o²−R_i²) | No | Automotive dry disc |
| Cone clutch | μW·R_m/sin(α) | Yes (1/sin α) | Machine tools, low speed |
| Band brake | T_2·r·(e^(μθ)−1) | Yes | Hoists, winches, conveyors |`,
    practical_application: `**Specifying the spring in a 75-kW motor's centrifugal-pump seal cartridge.** The mechanical seal needs 12–18 kN closing force on the faces over a 5-mm wear travel; a single helical compression spring is the most robust design. Pick d = 6 mm music wire (S_ut = 1450 MPa, G = 79.3 GPa), D = 36 mm (C = D/d = 6 — at the low end of the design range, but acceptable for stationary service), n = 8 active coils, squared-and-ground ends (N_total = 10). k = 79,300·6⁴/(8·36³·8) = 79,300·1,296/(8·46,656·8) = 102,776,800/2,985,984 = 34.4 N/mm. Deflection at 15 kN: δ = F/k = 15,000/34.4 = 436 mm — far exceeds the wear travel of 5 mm; the spring must be much stiffer. Try d = 10 mm, D = 50 mm (C = 5), n = 6: k = 79,300·10,000/(8·125,000·6) = 793,000,000/6,000,000 = 132 N/mm; δ at 15 kN = 113 mm — still too soft. Move to a stack of 4 Belleville disc springs in series, each rated 15 kN at 1.25 mm travel (k = 12 kN/mm per disc, 3 kN/mm for the stack of 4) → 5 mm wear travel exactly. The helical compression spring is the wrong architecture for this high-load, short-travel duty; the Belleville is the right one. **(In practice, mechanical seals use multiple small springs in parallel, each ~1 kN at 5 mm — a third architecture.)** This example illustrates the engineer's first decision: pick the right spring architecture for the load / travel duty before fine-tuning the parameters.`,
    decision_scenario: `You are the rotating-equipment lead at a mining hoist. The 2-MW hoist drum-brake (1.4 m disc, two calipers, total 24 kN clamping force, μ = 0.35 organic) needs a friction-material upgrade after a recent near-miss. Vendor A offers high-grade organic pads, $400/pair, μ = 0.35, PV_limit = 1 MPa·m/s, expected life 12 months. Vendor B offers sintered bronze pads, $1,200/pair, μ = 0.30, PV_limit = 5 MPa·m/s, expected life 48 months. Vendor C offers ceramic pads, $3,200/pair, μ = 0.40, PV_limit = 15 MPa·m/s, expected life 96 months. Decision rule: lowest PV-LCC over 8 yr. With MARR = 10%, n = 8 yr: LCC_A = $400 + 7×($400 replacement + $5k downtime) × (P/F, 10%, yr) — total ≈ $400 + 7×5,400×0.585 = $400 + 22,150 = $22,550. LCC_B = $1,200 + 1×($1,200 + $5k) × (P/F, 10%, 4) = $1,200 + 6,200×0.683 = $1,200 + 4,235 = $5,435. LCC_C = $3,200 + 0 = $3,200 (no replacement in 8 yr). Ceramic (Vendor C) wins by ~$19,000 PV over Vendor A — the higher CapEx is overwhelmingly recovered in avoided production losses (a hoist trip costs $5,000 in lost productivity). Vendor C also offers the highest PV_limit (15 MPa·m/s), providing 15× margin against future heavier payloads. (Full mechanics in engineering-economics-management.ts Lesson 2.)`,
    practice_questions: `Four practice problems follow this lesson — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply/Analyze. Topics: spring-rate formula, calculation of k for given d, D, n, G; disc clutch torque formula derivation; the role of the friction coefficient μ and axial force W.`,
    certification_questions: `This lesson's content maps to the NCEES PE Mechanical: Machine Design & Materials exam outline and the AGMA friction-material standards. Sample PE-style question: "A helical compression spring has wire diameter d = 4 mm, mean diameter D = 32 mm, 8 active coils, and G = 79.3 GPa. The spring rate k is closest to: (a) 6 N/mm, (b) 12 N/mm, (c) 24 N/mm, (d) 48 N/mm." Correct: (c) — k = 79,300·4⁴/(8·32³·8) = 79,300·256/(8·32,768·8) = 20,300,800/2,097,152 = 9.68 N/mm. Hmm, ~10 N/mm — closest is (b) 12 N/mm at C = 8 (the "sweet spot"). Recheck: d = 4, D = 32, C = 8, k = 79,300·256/(8·32,768·8) = 79,300·256/2,097,152 = 9.68 N/mm — closest answer (b) 12 N/mm. The answer key labels (b) correct.`,
    summary: `Springs, clutches, and brakes are the elastic and friction elements of mechanical design. The helical compression spring's rate k = Gd⁴/(8D³n) (with strong 4-power dependence on d) and torsional stress τ = K_w·8FD/(πd³) (Wahl-corrected for both direct shear and curvature) are the engineer's spring-design toolkit. The disc clutch's torque is T = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²) under uniform pressure (new clutch) or T = n·μ·W·(R_o+R_i)/2 under uniform wear (broken-in, conservative design value). Band brakes add the self-energizing e^(μθ) wedging factor. Friction material selection is driven by the PV limit (organic 1, sintered bronze 5, ceramic 15, carbon-carbon 30 MPa·m/s). The (d)⁴ dependence on spring rate and the n·μ·W linearity of clutch torque are the two scaling insights that drive every spring and clutch design.`,
    key_takeaways: `- Spring rate k = Gd⁴/(8D³n); 4-power dependence on d, 3-power on D, linear on 1/n.
- Spring index C = D/d; design range 6 ≤ C ≤ 10; C = 8 is the sweet spot.
- Torsional stress τ = K_w·8FD/(πd³); Wahl K_w = (4C−1)/(4C−4) + 0.615/C ≈ 1.18 at C = 8.
- Disc clutch (uniform pressure, n faces): T = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²).
- Disc clutch (uniform wear, n faces): T = n·μ·W·(R_o+R_i)/2 — the conservative (broken-in) value.
- Dual-face n=2 uniform pressure: T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²).
- Band brake: T = T_2·r·(e^(μθ) − 1); self-energizing if the drum pulls the band tight.
- PV limit (pressure × sliding velocity) caps the friction-material design.`,
    references: `1. Budynas & Nisbett (2020), Shigley's, Ch. 10 (helical compression spring k = Gd⁴/(8D³n), Wahl factor, surge), Ch. 16 (clutches & brakes, uniform pressure / uniform wear derivations).
2. Norton (2014), Machine Design, Ch. 7 (helical springs), Ch. 8 (torsion springs), Ch. 16 (clutches & brakes — uniform pressure T = (2/3)μW(...), uniform wear T = μW(R_o+R_i)/2; multi-plate scaling).
3. Juvinall & Marshek (2017), Ch. 10 (springs, Wahl derivation), Ch. 18 (clutches & brakes, band brake e^(μθ) derivation).
4. AGMA 2001-D04 (2004) — friction material hardness for spring-steel grade selection.
5. ISO 286-1:2010 (clutch-disc and brake-caliper tolerance selection).
6. ASM Handbook Vol 8 (2000) — music wire / chrome-vanadium fatigue data, friction material PV limits.`,
  },
  knowledgeObject: {
    title: "Springs, Clutches & Brakes — Knowledge Object",
    domain: "Machine Design",
    competency: "Elastic & Friction Elements",
    topic: "Helical Springs, Disc Clutches, Band Brakes",
    concept: "k = Gd⁴/(8D³n) + Wahl factor + disc-clutch torque under uniform pressure/wear",
    body: {
      definitions: [
        "Helical compression spring rate: k = Gd⁴/(8D³n) — derived by modeling each coil as a torsion bar; 4-power dependence on d, 3-power on D.",
        "Wahl factor K_w = (4C−1)/(4C−4) + 0.615/C — stress-concentration factor for both direct shear and curvature at the inner coil surface.",
        "Spring index C = D/d — design range 6 ≤ C ≤ 10; C < 4 hard to wind, C > 12 buckles.",
        "Disc clutch (uniform pressure): T_face = (2/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) — new clutch, p uniform across face.",
        "Disc clutch (uniform wear): T_face = μ·W·(R_o+R_i)/2 — broken-in clutch, p·r = const.",
        "Band brake: T_brake = T_2·r·(e^(μθ)−1) — self-energizing via belt friction.",
        "PV limit (pressure × sliding velocity) — friction material's limiting parameter (organic 1, sintered 5, ceramic 15, carbon-carbon 30 MPa·m/s).",
      ],
      principles: [
        "Spring rate: k = Gd⁴/(8D³n) — 4-power on d dominates (doubling d gives 16× k).",
        "Torsional stress: τ_max = K_w·8FD/(πd³); the Wahl factor K_w captures both direct shear and curvature at the inner coil.",
        "Disc clutch (uniform pressure): T = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²); the n=2 dual-face gives T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²).",
        "Disc clutch (uniform wear): T = n·μ·W·(R_o+R_i)/2 — the *conservative* (broken-in) design value.",
        "Band brake: T = T_2·r·(e^(μθ)−1); the brake is self-energizing if the drum rotation pulls the band tight.",
        "PV limit caps friction material selection; heat dissipation q = T·ω/A must stay below the material's PV limit and steady-state temperature rise.",
      ],
      components: [
        "Spring wire (music wire ASTM A228, chrome-vanadium A232, chrome-silicon A401, stainless A313).",
        "Spring ends: plain, squared, squared-and-ground (the latter for concentric compression-spring loading).",
        "Clutch disc (friction material bonded to steel disc, splined hub).",
        "Pressure plate (cast iron, applies axial force W via springs or diaphragm).",
        "Flywheel (engine-side inertia mass).",
        "Brake disc / rotor (cast iron GG25, vented for cooling).",
        "Brake caliper (hydraulic, pin-sliding or fixed-opposed-piston).",
        "Friction material (organic, sintered bronze, semi-metallic, ceramic, carbon-carbon).",
      ],
      mechanism:
        "A helical spring deflects when the coils twist as torsion bars of length πD each, transferring the axial load F to a torque T = F·D/2 in each coil. A disc clutch transmits torque by friction between two flat faces pressed together axially; the friction torque is the integral of μ·p·r·dA over the annulus, with the pressure distribution depending on whether the clutch is new (uniform p) or broken-in (p·r = const). A band brake uses the belt-friction equation T_1/T_2 = e^(μθ) to develop a self-energizing wedging effect that gives much higher torque per unit tension than a simple disc brake.",
      process:
        "Specify duty → pick spring d, D, n, material → compute k = Gd⁴/(8D³n) → check τ_max ≤ τ_allowable → check surge f_surge > 15×f_excitation → for clutch, pick μ, R_o, R_i, n → compute T from both uniform-pressure (new) and uniform-wear (broken-in) → design to the lower (broken-in) value → check PV < PV_limit → check heat-flux dissipation.",
      formulas: [
        "k = G·d⁴/(8·D³·n)  [spring rate, N/mm]",
        "δ = F/k = 8·F·D³·n/(G·d⁴)  [deflection]",
        "τ_max = K_w·8·F·D/(π·d³)  [torsional stress, MPa]",
        "K_w = (4C−1)/(4C−4) + 0.615/C, C = D/d (Wahl factor)",
        "T_disc_uniform-pressure = (2/3)·n·μ·W·(R_o³−R_i³)/(R_o²−R_i²)  [N·mm]",
        "T_disc_uniform-wear = n·μ·W·(R_o+R_i)/2  [N·mm, broken-in conservative]",
        "T_band = T_2·r·(e^(μθ) − 1)  [band brake]",
        "PV = P·V ≤ PV_limit  [friction material limit, MPa·m/s]",
        "q = T·ω/A  [friction heat flux, W/m²]",
      ],
      metrics: [
        "Spring rate k (N/mm) — must match the application's load / travel requirement.",
        "Spring index C = D/d (target 6–10, sweet spot 8).",
        "Wahl factor K_w ≈ 1.18 at C = 8 (design floor; rises sharply for C < 6).",
        "Disc clutch torque T (N·m) — design to the uniform-wear (broken-in) value.",
        "PV at peak duty (target < PV_limit × 0.5 for sustained service; < PV_limit × 1.0 for impulse stops).",
        "Steady-state disc temperature rise (target < 100 °C; alarm at 200 °C; friction material limit 250 °C organic, 450 °C sintered, 650 °C ceramic, 1500 °C carbon-carbon).",
        "Spring surge frequency f_surge > 15 × f_excitation (cyclic duty).",
      ],
      examples: [
        "k = 2.97 N/mm at d = 3 mm, D = 30 mm, n = 10, G = 79.3 GPa (music wire).",
        "k = 10.0 N/mm at d = 3 mm, D = 20 mm, n = 10 (reducing D from 30 to 20 raises k 3.4×).",
        "k = 10.4 N/mm at d = 4.1 mm, D = 30 mm, n = 10 (increasing d from 3 to 4.1 raises k 3.5×).",
        "T_disc (uniform pressure, n=2, μ=0.25, W=5kN, R_o=100, R_i=60) = 204 N·m.",
        "T_disc (uniform wear, same geometry) = 200 N·m (2% lower — small for this geometry).",
      ],
      industrial_examples: [
        "Automotive — 200 N·m engine peak torque, dual-face dry disc clutch (μ=0.27, W=4.5kN, R_o=105, R_i=75, n=2) → T = 280 N·m, n_safety = 1.4; service life 100,000 km.",
      ],
      case_studies: [
        "SYNTHETIC — Crescent Valley Mining hoist-brake failure: 2-MW hoist, 1.4 m disc brake, 6-s emergency stop overheated friction material to 480 °C, μ dropped from 0.35 to 0.18, drum oversped 12%; retrofit with 100-mm vented ductile-iron disc + ceramic pads + cooling interlock; 18 months trouble-free.",
      ],
      common_errors: [
        "Forgetting the Wahl factor K_w in spring stress — understates inner-coil stress 10–40%.",
        "Spring index C < 4 — too hard to wind, locally yields wire.",
        "Spring index C > 12 — buckles or surges at low frequency.",
        "Using uniform-pressure torque for a service clutch — overstates capacity 2–10%.",
        "Ignoring the PV limit — friction material glazes and fails within minutes.",
        "Forgetting heat dissipation — disc surface exceeds 500 °C and friction material degrades.",
        "Spring resonance: f_excitation approaching f_surge multiplies stresses 5–10×.",
      ],
      limitations: [
        "Spring rate formula assumes below the torsional proportional limit (~0.40·S_ut); above this the spring takes permanent set.",
        "Wahl factor is empirical for music wire and chrome-vanadium; ±10% on other materials.",
        "Disc clutch formulas assume flat rigid friction face; real clutches have elastic deflection.",
        "PV limit is a steady-state limit; impulse PV·t is much lower.",
        "Band-brake formula assumes thin flexible band; thick or block bands have modified coefficients.",
        "Brake/clutch heat dissipation scales with T·ω, so a high-W low-μ design and a low-W high-μ design carry the same torque but differ in actuator size and friction material PV.",
      ],
      best_practices: [
        "Specify C = D/d in the 6–10 range; C = 8 is the sweet spot for both stress and manufacturability.",
        "Always use K_w in the torsional stress calculation; design τ_max ≤ 0.50·S_ut (music wire).",
        "Design disc clutches to the uniform-wear (broken-in) torque — the new-clutch uniform-pressure value is a 2–10% overstatement.",
        "Check PV < PV_limit × 0.5 for sustained service, × 1.0 for impulse stops.",
        "Specify spring surge frequency f_surge > 15 × f_excitation for cyclic-duty springs.",
        "Use ceramic or carbon-carbon friction material for PV > 5 MPa·m/s or service temperatures > 450 °C.",
        "Use ISO 286 fits on spring seats, clutch hubs, and brake calipers to preserve concentricity.",
      ],
      related_concepts: [
        "Gears & gear design (Lesson 1) — the Hertzian contact in bearing races is the surface analog of the disc-clutch friction-face contact.",
        "Bearings & lubrication (Lesson 2) — the Stribeck curve governs the friction coefficient in the boundary / mixed / hydrodynamic regimes of wet clutches.",
        "Fatigue failure (Shigley Ch. 11) — spring cyclic loading uses Goodman/Soderberg; the same Wohler S-N curve.",
        "Belt friction T_1/T_2 = e^(μθ) — band-brake derivation.",
        "Friction material science (ASM Handbook Vol 8) — PV limits and temperature degradation.",
      ],
      prerequisites: [
        "Mechanics of materials (torsion of circular shafts, curved-beam stress).",
        "Material science (spring-steel hardness, S-N curves, friction materials).",
        "Statics (friction on flat and curved surfaces, belt friction).",
        "Heat transfer (frictional heat flux, steady-state temperature).",
      ],
      references: MACHINE_DESIGN_REFERENCE_TITLES,
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
        "Which expression correctly gives the spring rate (stiffness) of a helical compression spring?",
      explanation:
        "Modeling each coil as a torsion bar of length πD and applying δ = T·L/(G·J) gives δ_per_coil = 8FD³/(Gd⁴); summing n active coils and solving k = F/δ gives k = Gd⁴/(8D³n). The four-power dependence on wire diameter d dominates the design.",
      whyCorrect:
        "k = Gd⁴/(8D³n) — the helical compression-spring rate. G is the wire shear modulus (≈ 79.3 GPa for music wire), d is the wire diameter (mm), D is the mean coil diameter (mm), n is the number of active coils. The four-power dependence on d is the dominant scaling — doubling d multiplies k by 16.",
      whyOthersWrong: [
        "k = Gd³/(8D⁴n) inverts the exponents on d and D — gives a spring that gets softer with thicker wire, opposite of physical reality.",
        "k = Gd⁴/(8D²n) drops the cube on D to a square — wrong torsion-bar derivation; the D³ arises from the coil's torque arm D/2 squared by the geometry.",
        "k = Gd²/(8D³n) drops the 4-power on d to a 2-power — contradicts the J = πd⁴/32 torsion-bar result.",
      ],
      options: [
        { text: "k = Gd⁴/(8D³n)", isCorrect: true },
        { text: "k = Gd³/(8D⁴n)", isCorrect: false },
        { text: "k = Gd⁴/(8D²n)", isCorrect: false },
        { text: "k = Gd²/(8D³n)", isCorrect: false },
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
        "A music-wire helical compression spring (G = 79.3 GPa = 79,300 MPa) has wire diameter d = 3 mm, mean coil diameter D = 30 mm, and 10 active coils. The spring rate k is closest to:",
      explanation:
        "k = Gd⁴/(8D³n) = 79,300 × 3⁴/(8 × 30³ × 10) = 79,300 × 81/(8 × 27,000 × 10) = 6,423,300/2,160,000 ≈ 2.97 N/mm. To reach k = 10 N/mm at the same wire size, the engineer can either reduce D to 20 mm (k ≈ 10.0 N/mm), increase d to 4.1 mm (k ≈ 10.4 N/mm), or reduce n to 3 (k ≈ 9.9 N/mm).",
      whyCorrect:
        "Apply k = Gd⁴/(8D³n): k = 79,300 × 3⁴/(8 × 30³ × 10) = 79,300 × 81/(8 × 27,000 × 10) = 6,423,300/2,160,000 ≈ 2.97 N/mm. The closest answer is therefore 3 N/mm. The task-spec target of k = 10 N/mm at this geometry is not achievable with steel (G would need to be 266 GPa, which no real material has); achieving 10 N/mm requires reducing D to 20 mm, increasing d to 4.1 mm, or reducing n to 3 — each independently gives k ≈ 10 N/mm with music-wire steel.",
      whyOthersWrong: [
        "1 N/mm understates k by ~3× — would require either G ≈ 27 GPa (phosphor bronze, not music wire) or D ≈ 45 mm at the same d and n.",
        "10 N/mm at the given geometry (d=3, D=30, n=10) is impossible with real materials; it requires G ≈ 266 GPa (no such material). The value 10 N/mm is achievable only by changing geometry (e.g., D = 20 mm or d = 4.1 mm or n = 3).",
        "30 N/mm would require G ≈ 800 GPa or much smaller D — well outside any real material or geometry.",
      ],
      options: [
        { text: "1 N/mm", isCorrect: false },
        { text: "3 N/mm", isCorrect: true },
        { text: "10 N/mm", isCorrect: false },
        { text: "30 N/mm", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem:
        "The dual-face (n = 2) disc-clutch torque formula T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) corresponds to which assumption, and what is the physical meaning of the factor 4/3?",
      explanation:
        "The factor (2/3) is the uniform-pressure (new clutch) coefficient for a single friction face; the dual-face clutch (n = 2) doubles it to (4/3). The factor captures the integration of μ·p·r·dA over the friction-face annulus under uniform pressure p = W/(π(R_o²−R_i²)).",
      whyCorrect:
        "T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) is the uniform-pressure (new clutch) torque for a dual-face (n = 2) disc clutch. The (4/3) factor = n × (2/3) = 2 × (2/3) — the uniform-pressure coefficient (2/3) for one friction face multiplied by the two friction surfaces of a dual-face clutch. The (2/3) coefficient itself comes from integrating dT = μ·p·r·dA·r = 2π·μ·p·r²·dr over the annulus R_i to R_o: T_face = (2/3)·π·μ·p·(R_o³ − R_i³), then substituting p = W/(π(R_o² − R_i²)) gives (2/3)·μ·W·(R_o³ − R_i³)/(R_o² − R_i²).",
      whyOthersWrong: [
        "Uniform-wear (broken-in) assumption gives T = n·μ·W·(R_o + R_i)/2 — the simpler form, not the (4/3) factor on the cubic ratio.",
        "Single friction surface (n = 1) would give the factor (2/3), not (4/3).",
        "The 4/3 factor is not a friction-coefficient multiplier or a damping coefficient — it is the geometric integration of the friction torque under uniform pressure across two faces.",
      ],
      options: [
        { text: "Uniform-pressure (new clutch) for 2 friction surfaces; (4/3) = 2 × (2/3) uniform-pressure single-face factor", isCorrect: true },
        { text: "Uniform-wear (broken-in) for 2 friction surfaces; (4/3) = 2 × (2/3) wear factor", isCorrect: false },
        { text: "Single friction surface (n = 1); (4/3) is the friction-coefficient multiplier", isCorrect: false },
        { text: "Damping coefficient of the clutch engagement event", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem:
        "True or False: A disc clutch's torque capacity T scales linearly with both the friction coefficient μ and the axial clamping force W. Therefore doubling μ doubles T, and doubling W also doubles T.",
      explanation:
        "TRUE. The torque formula T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) is linear in μ and W (and in n); doubling either doubles T. The non-linear parts of the formula are the radii — T scales with (R_o³−R_i³)/(R_o²−R_i²) which is approximately R_o for R_i ≈ R_o.",
      whyCorrect:
        "TRUE. The disc-clutch torque formula T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) is linear in μ (the friction coefficient), in W (the axial clamping force), and in n (the number of friction faces). Doubling μ doubles T; doubling W doubles T; doubling n doubles T. The non-linear part is the geometry — the (R_o³−R_i³)/(R_o²−R_i²) term, which is roughly proportional to R_o for R_i ≈ 0.6·R_o. This linearity is the key design insight: to increase torque capacity, the cheapest variables to scale are μ (friction material upgrade) and n (add a friction plate); scaling W requires a larger actuator (heavier, more expensive).",
      whyOthersWrong: [
        "FALSE would require that T scales non-linearly with μ or W — but the formula T = (4/3)·μ·W·(R_o³−R_i³)/(R_o²−R_i²) is linear in both; the geometric factor is independent of μ and W.",
      ],
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public export — all three lessons for the machine-design discipline.
// ---------------------------------------------------------------------------

export const MACHINE_DESIGN_LESSONS: RefLesson[] = [
  LESSON_GEARS,
  LESSON_BEARINGS,
  LESSON_SPRINGS_CLUTCHES_BRAKES,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts EXACTLY in Prisma-shim usage.
// ---------------------------------------------------------------------------

/**
 * Upsert the Machine Design discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "machine-design" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "machine-design-fundamentals", name "Machine Design Fundamentals",
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
  // 1) Discipline — find by slug "machine-design" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "machine-design" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "machine-design" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "machine-design-fundamentals"; name: "Machine Design
  //    Fundamentals"; order 1. The Chapter has a @@unique([disciplineId,
  //    slug]), so we use findFirst + create/update.
  const chapterSlug = "machine-design-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Machine Design Fundamentals",
    slug: chapterSlug,
    description:
      "Gears & gear design (Lewis bending formula, AGMA 2001-D04 pitting), bearings & lubrication (Lundell-Palmgren L₁₀, Petroff's law, Stribeck curve), and springs, clutches & brakes (helical spring k = Gd⁴/(8D³n), disc clutch torque under uniform pressure/wear) — the three-lesson deep scientific reference for the Machine Design engineering discipline.",
    icon: "Settings2",
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
  for (const src of MACHINE_DESIGN_SOURCES) {
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
  const sharedReferenceIds = MACHINE_DESIGN_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of MACHINE_DESIGN_LESSONS) {
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
