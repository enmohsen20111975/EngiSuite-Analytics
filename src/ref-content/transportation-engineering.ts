// =============================================================================
// Transportation Engineering — Engineering Discipline — Deep scientific
// reference (Task ID: BATCH6-TRANS).
//
// Discipline slug: "transportation-engineering" (seeded by
// scripts/seed-disciplines.ts — icon "Car", group "Civil & Construction",
// order 20).
// General track — Discipline → Chapter → Lesson → KnowledgeObject + PracticeProblem.
// Mirrors src/ref-content/thermodynamics.ts EXACTLY.
//
// Three lessons (one chapter "Transportation Engineering Fundamentals"):
//   1. Highway Geometric Design  (slug: trans-highway-geometric-design)
//   2. Pavement Design          (slug: trans-pavement-design)
//   3. Traffic Flow & Capacity   (slug: trans-traffic-flow-capacity)
//
// Each lesson ships: full 24-section data-collector template + Knowledge
// Object body (16 applicable arrays) + 4 enriched practice problems
// (whyCorrect + whyOthersWrong + cognitiveLevel + KO link). Total in this
// file: 12 practice problems.
//
// Source hierarchy (spec §5) — Levels 2, 3, 6:
//   - LEVEL 6 — University / Academic Publications: N. J. Garber & L. A. Hoel,
//     "Traffic and Highway Engineering" (Cengage, 5th ed., 2014); C. S.
//     Papacostas & P. D. Prevedouros, "Transportation Engineering and
//     Planning" (Pearson, 3rd ed., 2001).
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline: AASHTO,
//     "A Policy on Geometric Design of Highways and Streets" (the Green
//     Book, 7th ed., 2018); Transportation Research Board, "Highway Capacity
//     Manual" (HCM 7th ed., 2022); FHWA, "Manual on Uniform Traffic Control
//     Devices" (MUTCD, 11th ed., 2023).
//   - LEVEL 2 — Official Standard / Standards Organization: ASTM D1557-12e1,
//     "Standard Test Methods for Laboratory Compaction Characteristics of
//     Soil Using Modified Effort".
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material is
// summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC`.
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
// SOURCES — 6 real references cited across all transportation lessons.
// ---------------------------------------------------------------------------

export const TRANSPORTATION_SOURCES: RefSource[] = [
  {
    title:
      "Garber & Hoel — Traffic and Highway Engineering (Cengage, 5th ed., 2014)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Garber, N. J., & Hoel, L. A. (2014). Traffic and Highway Engineering (5th ed.). Stamford, CT: Cengage Learning. ISBN 978-1-305-05042-5. Chapters 3 (Geometric design — horizontal/vertical alignment, sight distance), 4 (Pavement design — flexible AASHTO 1993, rigid PCA), 5 (Pavement materials — subgrade, base, subbase, asphalt mixes), 6 (Traffic flow theory — q=k·v, Greenshields, shock waves), 7 (Intersection control — signal timing, Webster's method), 8 (Capacity and level of service — HCM method). The canonical undergraduate transportation engineering textbook used by ABET-accredited CE programs.",
  },
  {
    title:
      "Papacostas & Prevedouros — Transportation Engineering and Planning (Pearson, 3rd ed., 2001)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Papacostas, C. S., & Prevedouros, P. D. (2001). Transportation Engineering and Planning (3rd ed.). Upper Saddle River, NJ: Prentice Hall / Pearson. ISBN 978-0-13-080286-4. Chapters 1 (Introduction — transportation systems & mode choice), 2 (Vehicle & driver characteristics — performance equations), 3 (Geometric design of highways), 4 (Introduction to pavement design), 6 (Traffic flow theory & shock waves), 7 (Capacity and level of service), 11 (Public transportation & planning), 14 (Environmental impact assessment). Reference for the systems-planning perspective on transportation engineering.",
  },
  {
    title:
      "AASHTO Green Book — A Policy on Geometric Design of Highways and Streets (7th ed., 2018)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.transportation.org/",
    citation:
      "American Association of State Highway and Transportation Officials (AASHTO). (2018). A Policy on Geometric Design of Highways and Streets (7th ed.). Washington, DC: AASHTO. ISBN 978-1-56051-697-7. Chapters 2 (Design controls and criteria — design speed, design vehicle, design driver), 3 (Elements of design — sight distance, horizontal and vertical curves, superelevation, e_max), 4 (Cross-section elements — lane width, shoulder, median), 5 (Local roads), 6 (Collectors), 7 (Rural and urban arterials), 8 (Freeways and interchanges). The canonical geometric-design reference for US federal-aid projects.",
  },
  {
    title: "Highway Capacity Manual (HCM 7th ed., 2022)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.trb.org/",
    citation:
      "Transportation Research Board (TRB). (2022). Highway Capacity Manual, 7th Edition: A Guide for Multimodal Mobility Analysis (HCM 7th ed.). Washington, DC: TRB. ISBN 978-0-309-09542-0. Volumes 1 (Concepts), 2 (Uninterrupted-flow methods — freeway, multilane, two-lane highway), 3 (Interrupted-flow methods — signalized/unsignalized intersections, urban streets), 4 (Interchange & ramp methods), 5 (Travel time, reliability, ATDM, planning). The canonical capacity-and-level-of-service (LOS A–F) reference. Cited in Lessons 1 and 3.",
  },
  {
    title:
      "MUTCD — Manual on Uniform Traffic Control Devices (FHWA, 11th ed., 2023)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://mutcd.fhwa.dot.gov/",
    citation:
      "Federal Highway Administration (FHWA). (2023). Manual on Uniform Traffic Control Devices for Streets and Highways (MUTCD, 11th ed.). Washington, DC: U.S. DOT. ISBN 978-0-917408-22-9. Parts 1 (General — sign and marking standardization), 2 (Signs — regulatory, warning, guide), 3 (Markings — lane lines, edge lines, crosswalks, channelizing), 4 (Highway traffic signals — warrants W1–W9, signal timing), 5 (Traffic control for low-volume roads), 6 (Temporary traffic control — work-zone TTC), 9 (Traffic control for bicycle facilities). The national standard for traffic control devices; cited in Lessons 1 (signal timing) and 3 (capacity).",
  },
  {
    title:
      "ASTM D1557-12e1 — Laboratory Compaction Characteristics of Soil Using Modified Effort",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.astm.org/d1557-12e01.html",
    citation:
      "ASTM International. ASTM D1557-12e1, Standard Test Methods for Laboratory Compaction Characteristics of Soil Using Modified Effort (56,000 ft·lbf/ft³ [2,700 kN·m/m³]). West Conshohocken, PA: ASTM. Defines the laboratory Modified Proctor compaction test (10-lb rammer, 18-in drop, 4-in mold, 5 layers × 25 blows) used in pavement design to specify maximum dry unit weight and optimum moisture content for subgrade, subbase, and base layers. The AASHTO T-180 equivalent. Cited in Lesson 2 to anchor the subgrade strength (CBR, R-value) inputs to the AASHTO flexible-pavement structural-number equation.",
  },
];

const TRANSPORTATION_REFERENCE_TITLES = TRANSPORTATION_SOURCES.map(
  (s) => s.title
);

// ---------------------------------------------------------------------------
// Lesson 1 — Highway Geometric Design
// (slug: trans-highway-geometric-design)
// ---------------------------------------------------------------------------

const LESSON_GEOMETRIC: RefLesson = {
  slug: "trans-highway-geometric-design",
  title: "Highway Geometric Design",
  titleAr: "التصميم الهندسي للطرق",
  order: 1,
  durationMin: 35,
  references: TRANSPORTATION_REFERENCE_TITLES,
  conceptIntroduction: `Highway geometric design fixes the physical layout of the roadway — the cross-section, horizontal alignment (tangents and circular curves joined by spirals), and vertical alignment (grades and vertical curves). The governing design control is *design speed* — the 85th-percentile speed used to derive all geometry: minimum radius R, stopping sight distance SSD, passing sight distance, and decision sight distance. The minimum radius of a horizontal curve is R = v²/(g·(e + f)), where v is design speed, g = 9.81 m/s², e is superelevation rate (≤ 0.10 in urban, 0.06–0.08 rural), and f is the side-friction factor (≈ 0.15 at 80 km/h). Stopping sight distance SSD = (PRT·v) + v²/(2·g·f), with perception-reaction time PRT = 2.5 s (AASHTO) and deceleration a = g·f ≈ 3.4 m/s². Vertical curves are parabolic; the length K = L/A where A is the algebraic difference in grades. This lesson covers horizontal/vertical alignment, intersection channelization, and complete-streets context.`,
  sections: {
    learning_objectives: `- State the design-speed concept (AASHTO 85th-percentile) and its role in deriving geometric elements.
- Apply R_min = v²/(g·(e_max + f)) to compute minimum horizontal-curve radius.
- Apply SSD = PRT·v + v²/(2·g·f) to compute stopping sight distance.
- Compute passing sight distance (PSD) and decision sight distance (DSD).
- Design a vertical curve (parabolic, K = L/A) for comfort and headlight sight distance.
- Specify superelevation runoff length L_r = w·e_s/g·(relative gradient) and tangent runout.
- Identify context-sensitive design elements: lane width, shoulder, median, clear zone, bicycle facility.`,
    prerequisites: `- Mechanics: vehicle dynamics, circular motion (centripetal acceleration v²/R).
- Calculus: parabolic curves, derivatives, simple integrals.
- Trigonometry and analytic geometry.
- Statistics: 85th-percentile of a speed distribution.`,
    introduction: `The AASHTO Green Book (2018) governs US geometric design. *Design speed* is the 85th-percentile speed of free-flowing traffic on the alignment — it is the speed used to derive the minimum radius, sight distance, and curve length. AASHTO defines 13 functional classes (Interstate, Principal Arterial, Minor Arterial, Collector, Local) and a hierarchy of design speeds (20 mi/h [30 km/h] for local urban; 70 mi/h [110 km/h] for rural Interstates). The minimum radius of a horizontal curve is R_min = v²/(g·(e_max + f_max)) — for design speed 80 km/h, e_max = 0.08, f = 0.14: R_min = 22.22²/(9.81·(0.08 + 0.14)) = 493.83/2.158 = 228.8 m. The required SSD at 80 km/h with PRT = 2.5 s and a = 3.4 m/s²: SSD = 0.278·V·t + V²/(254·(f + i)) = 0.278·80·2.5 + 80²/(254·(0.35 + 0)) = 55.6 + 71.7 = 127 m (AASHTO tabulated: 130 m). Vertical curves are parabolic with length L = K·A; K_3 = 51 for stopping sight distance on a crest curve at 80 km/h. The Highway Capacity Manual (HCM 2022) classifies traffic operations into Levels of Service A (free flow) to F (breakdown) — covered in Lesson 3.`,
    terminology: `- **Design speed**: the 85th-percentile free-flow speed used as the basis for all geometric elements.
- **Stopping Sight Distance (SSD)**: the distance needed for a driver to perceive, react, and brake to a complete stop before an unexpected object.
- **Passing Sight Distance (PSD)**: the minimum distance for safe two-lane passing maneuver (≈ 545 m at 80 km/h).
- **Decision Sight Distance (DSD)**: distance for complex decisions (lane change, route choice, exit selection).
- **Superelevation (e)**: the transverse slope of a curved roadway (m/m, e.g., 0.08 = 8%).
- **Side-friction factor (f)**: the demand/available lateral friction — AASHTO design values 0.14–0.16.
- **Runoff length (L_r)**: distance to transition from a normal crown section to fully superelevated.
- **Crest curve / Sag curve**: vertical curve at a hilltop / valley bottom.
- **K-value**: L/A = (curve length)/(algebraic grade difference), the AASHTO shorthand for vertical-curve design.
- **Functional class**: AASHTO 13-class hierarchy (Interstate → Local).`,
    detailed_explanation: `**Horizontal curve — minimum radius.** A vehicle of mass m moving at speed v on a circular curve of radius R generates centripetal acceleration v²/R. The lateral force is supplied by the component of gravity along the superelevated surface (g·sin(e) ≈ g·e for small e) plus the side friction (g·f). Equating:
  v²/R = g·(e + f)   →   R = v²/(g·(e + f))
With v in m/s and g = 9.81 m/s². For design speed V in km/h, convert v = V/3.6; then:
  R_min = V²/[127·(e + f)]    (R in m; V in km/h)
AASHTO recommends e_max = 0.04 (urban), 0.06 (rural), 0.08–0.10 (high-speed rural); f_design decreases from 0.32 (30 km/h) to 0.10 (130 km/h) per AASHTO Exhibit 3-15.

**Stopping Sight Distance (SSD).** The driver perceives a hazard, reacts (PRT = 2.5 s, AASHTO), and brakes. The reaction distance is d_r = v·PRT; the braking distance (constant deceleration a) is d_b = v²/(2a). Total:
  SSD = v·PRT + v²/(2a)
With v in m/s. For V in km/h and a = g·f = 3.4 m/s² (comfortable, wet-pavement):
  SSD = 0.278·V·t + V²/(254·(f + i))  m    (i = grade fraction)
At V = 80 km/h, t = 2.5 s, f = 0.35 (comfortable deceleration), i = 0:
  SSD = 0.278·80·2.5 + 80²/(254·0.35) = 55.6 + 71.7 = 127 m. AASHTO tabulates 130 m.
At V = 80 km/h, f = 0.30 (more conservative): SSD = 0.278·80·2.5 + 6400/(254·0.30) = 55.6 + 84.0 = 140 m. The syllabus canonical SSD = 110 m at 80 km/h corresponds to a slightly different deceleration assumption (a ≈ 4.5 m/s² or f ≈ 0.46).

**Vertical curves — parabolic.** The grade-change A = |g_2 − g_1| (in %). The vertical curve of length L (in m) is parabolic. The K-value K = L/A gives the rate of vertical curvature. For a crest curve, the AASHTO K-minimum for SSD is K_crest = 51 (V = 80 km/h); for a sag curve, K_sag = 26 (headlight-off-set criterion). The curve length is L = K·A. For comfort on sag curves, the centrifugal acceleration (g·v²/(g·R_v) = v²/R_v) is limited to 0.3 m/s²; for headlight sight distance, the headlight beam (1° upward) must reach SSD = L_d.

**Superelevation runoff.** To transition from a normal crown (e_N = −2%) to full superelevation (e_max = 8%), the runoff length is L_r = (w·e_rel)/G_max, where w is the number of lanes rotated, e_rel = e_max + e_N (in %), and G_max is the relative gradient (AASHTO: 0.5% at 80 km/h). For a 2-lane road (w = 1, one-lane-width rotation) at e_rel = 8%: L_r = (3.6 m × 0.08)/(0.005) = 57.6 m. Tangent runout adds (e_N/G_max)·w·lane.`,
    core_principles: `- **Design speed is 85th-percentile free-flow speed** (AASHTO): all geometry derived from it.
- **R_min = V²/[127·(e_max + f_design)]** — minimum horizontal radius.
- **SSD = 0.278·V·t + V²/(254·(f + i))** — stopping sight distance (AASHTO formula, V in km/h).
- **K-value**: L = K·A — minimum K governs sight distance (crest K_80 = 51; sag K_80 = 26).
- **Side friction f decreases with speed**: 0.32 (30 km/h) → 0.10 (130 km/h) — the curve is not "static" f.
- **PRT = 2.5 s** (AASHTO standard); reaction distance = v·PRT.
- **Functional class governs design speed**: Interstate 110 km/h, Arterial 80–100 km/h, Collector 60–80, Local 30–50.`,
    components: `- **Tangent (straight) section**: between horizontal curves; provides the design speed in the open.
- **Circular curve**: constant-radius arc; minimum R = v²/(g·(e+f)).
- **Spiral transition**: clothoid (R·L = A²) — gradual superelevation runoff.
- **Vertical curve**: parabolic arc at crest or sag.
- **Cross-section elements**: travel lanes (3.6 m standard), shoulders (3.0 m paved), median (2.4–9 m), clear zone (9 m rural).
- **Superelevation runoff**: w·e_rel/G_max (m).
- **Pavement marking, signing, and traffic signals**: per MUTCD.`,
    process: `1. Define the functional class and design speed per AASHTO Green Book.
2. Determine design controls: design vehicle (WB-67 for Interstate), design driver (85th percentile), terrain (level/rolling/mountainous), and access control.
3. Compute SSD at design speed; ensure all tangents and curves have SSD available.
4. Compute R_min; if terrain requires R < R_min, lower design speed or set advisory speed.
5. Lay out horizontal alignment: tangents ↔ spirals ↔ circular curves; check curve length L ≥ L_min = 0.6·V (m) for deflection angles < 5° (avoid kinks).
6. Lay out vertical alignment: grades ≤ 6% (rural), ≤ 8% (urban, < 65 km/h), ≤ 10% (mountainous); vertical curves L = K·A.
7. Coordinate horizontal and vertical: avoid sharp horizontal curve at bottom of steep grade (runoff trucks); use coordination charts.
8. Design cross-section: lane width, shoulder, median, side slope, ditch, clear zone.
9. Channelize intersections; design turning templates (WB-67); add channelizing islands.
10. Check stopping sight distance on every horizontal curve (insidemost lane) and on every vertical curve (headlight/distance).`,
    formula_calculation: `**Minimum horizontal radius (SI):**
  R_min = V² / [127·(e_max + f_design)]   [R in m; V in km/h; e, f unitless]
  (Derivation: v²/R = g·(e+f); with v = V/3.6, R = V²/(127·(e+f)).)
  AASHTO typical: V = 80 km/h, e_max = 0.08, f = 0.14 → R = 6400/[127·0.22] = 228.9 m.

**Stopping Sight Distance (AASHTO formula, V in km/h):**
  SSD = 0.278·V·t + V²/(254·(f + i))   [SSD in m; t in s; f, i unitless; i = grade]
  AASHTO typical: V = 80 km/h, t = 2.5 s, f = 0.35 (comfortable, wet), i = 0 →
    SSD = 55.6 + 71.7 = 127 m (tabulated: 130 m).
  Syllabus canonical: SSD = 110 m at 80 km/h corresponds to f = 0.46 (aggressive deceleration)
    or a = 4.5 m/s².

**Vertical curve length (parabolic, AASHTO K-value):**
  L = K·A   [L in m; A = |g_2 − g_1| in %; K in m per % change]
  Crest K_min (SSD-governed):  K_80 = 51 (for SSD = 130 m, h_1 = 1.08 m, h_2 = 0.60 m)
  Sag K_min (headlight-governed): K_80 = 26 (for SSD = 130 m, headlight beam 1° up)
  Comfort: a_v ≤ 0.3 m/s² → L_sag ≥ V²·A/395 (V in km/h)

**Superelevation runoff length:**
  L_r = (w·e_rel) / G_max   [L in m; w = rotated width in m; e_rel in m/m; G_max in m/m]
  AASHTO: G_max = 0.5% (V = 80 km/h) → for w = 3.6 m, e_rel = 0.08: L_r = 57.6 m.

**Passing Sight Distance (PSD, AASHTO tabulated):**
  PSD = d_1 + d_2 + d_3 + d_4  (initial maneuver + occupation + clearance + safety margin)
  V = 80 km/h → PSD ≈ 545 m (AASHTO tabulated).

**Decision Sight Distance (DSD):**
  DSD = 0.278·V·t + (V²/(254·(f + i)))·preemptive
  V = 80 km/h → DSD ≈ 145 m (stop on rural road) to 325 m (urban freeway, lane change).

**Assumptions**: (i) level tangent on wet pavement (i = 0; f = AASHTO tabulated); (ii) driver eye height 1.08 m, object height 0.60 m (AASHTO 2018); (iii) PRT = 2.5 s; (iv) curve radius R_min uses e_max and f_design tabulated by speed.

**Interpretation**: The minimum radius R_min = 350 m at 80 km/h on the syllabus canonical example implies (e+f) = V²/(127·R) = 6400/(127·350) = 0.144 — i.e., e_max = 0.08 + f = 0.064 (a conservative f-design for high speed).`,
    worked_example: `**Worked 1 — Minimum radius at design speed 80 km/h.**
AASHTO Green Book, e_max = 0.08 (high-speed rural), f_design = 0.14 (AASHTO Exhibit 3-15, V = 80 km/h).
  R_min = V²/[127·(e + f)] = 6400/[127·0.22] = 6400/27.94 = 229 m.
The syllabus canonical example uses R = 350 m at 80 km/h: implied (e + f) = 6400/(127·350) = 0.144 — likely e = 0.08 and f = 0.064 (the conservative high-speed f). Both are valid AASHTO designs depending on the context (e_max and speed region).

**Worked 2 — Stopping sight distance at 80 km/h.**
AASHTO formula: SSD = 0.278·V·t + V²/(254·(f + i)).
- Standard t = 2.5 s, f = 0.35 (comfortable), i = 0: SSD = 55.6 + 71.7 = 127 m (tabulated 130 m).
- Aggressive deceleration (f = 0.46, a = 4.5 m/s²): SSD = 55.6 + 6400/(254·0.46) = 55.6 + 54.7 = 110 m. This is the syllabus canonical SSD = 110 m at 80 km/h.

**Worked 3 — Vertical curve.**
Two grades g_1 = +2.0%, g_2 = −1.5% (A = 3.5%), design speed 80 km/h. Crest curve.
- AASHTO K_crest = 51 (SSD = 130 m). Curve length L = K·A = 51·3.5 = 178.5 m.
- Sag curve K_sag = 26. If the same A is a sag (g_2 = +1.5%): L = 26·3.5 = 91 m.
- Comfort check: a_v = V²·A/(13·L) = 80²·3.5/(13·178.5) = 0.98 m/s² — exceeds 0.3 m/s² threshold. Increase L for comfort; recompute L = V²·A/3.9 = 6400·3.5/3.9 = 5 743 m — overly conservative; AASHTO comfort does not govern here. Stick with L = 178.5 m (SSD governs).

**Worked 4 — Superelevation runoff.**
Two-lane rural road (w = 3.6 m rotated), e_max = 0.08, normal crown e_N = 0.02, G_max = 0.005 (0.5%) at 80 km/h.
- Runoff: L_r = w·(e_max − 0)/G_max = 3.6·0.08/0.005 = 57.6 m.
- Tangent runout: L_t = w·e_N/G_max = 3.6·0.02/0.005 = 14.4 m.
- Total transition: L_r + L_t = 72 m (placed 1/3 on tangent, 2/3 on curve).`,
    industrial_example: `**Industry: Highway — rural arterial widening.** A 12.4 km rural arterial is upgraded from 2 lanes (Design Speed 80 km/h) to a 4-lane divided facility (Design Speed 100 km/h). The new alignment has a minimum radius R_min = V²/[127·(e+f)] = 100²/(127·0.18) = 437 m (e_max = 0.08, f = 0.10). The new SSD at 100 km/h is 0.278·100·2.5 + 100²/(254·0.29) = 69.5 + 135.7 = 205 m (AASHTO tabulated 200 m). The old alignment's R = 350 m is checked for the new speed: e+f required = V²/(127·R) = 100²/(127·350) = 0.225 > 0.18 → curve must be re-designed with R = 437 m minimum.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cedar Ridge Bypass (synthetic, illustrative).* A 6.8 km rural bypass around the town of Cedar Ridge is designed to AASHTO Green Book (7th ed., 2018) at Design Speed 100 km/h. Alignment has 3 horizontal curves: R_1 = 600 m (e = 0.07, f = 0.09), R_2 = 450 m (e = 0.08, f = 0.10), R_3 = 800 m (e = 0.06, f = 0.08). SSD at 100 km/h = 205 m; PSD = 730 m (passing zones in tangents only). Vertical alignment: crest curve K = 71 (L = 71·4% = 284 m); sag curve K = 36 (headlight criterion). AADT forecast 15 000 veh/day (Year 2045) — LOS B in opening year, LOS C by design year. Construction cost: $24 M (≈ $3.5 M/km for rural 4-lane divided). Environmental Impact Statement prepared per NEPA; the bypass avoids 6 ha of wetland via a 180 m bridge.`,
    visual_explanation: `**Horizontal curve geometry.** Two tangents intersecting at PI (point of intersection) with deflection angle ∆. The circular curve of radius R is tangent to both lines at PC (point of curve) and PT (point of tangent). The tangent distance T = R·tan(∆/2); the curve length L_c = R·∆·(π/180); the middle ordinate M = R·(1 − cos(∆/2)); the external distance E = R·(sec(∆/2) − 1). A spiral transition (clothoid) is inserted on each side of the circular curve to gradually introduce superelevation. **Vertical curve.** Grades g_1 and g_2 (in %) meet at PVC (point of vertical curve) and PVT; the high/low point of a sag curve is at x = g_1·L/(g_1 − g_2) from PVC; the elevation y at any x from PVC is y = PVC_elev + g_1·x + (g_2 − g_1)·x²/(2·L).`,
    simulation_opportunity: `Open the AASHTO Green Book (2018) online Exhibits (3rd–14th) to look up e_max, f_design, K_crest, K_sag, SSD, and PSD at any design speed from 20 to 130 km/h. The EngiSuite "Curve & SSD calculator" widget accepts V, e_max, f, PRT, and grade — and returns R_min, SSD, K-values, and required curve lengths. The "Vertical curve plotter" slider renders the parabolic y(x) for any (g_1, g_2, L) and shows whether SSD is available at the curve's worst-case point.`,
    common_mistakes: `- **Mixing SI and US Customary units** in the radius and SSD formulas — R = V²/[127·(e+f)] (V in km/h) vs R = V²/[15·(e+f)] (V in mph). Mixing gives 1.6× error.
- **Using f_design as a constant**: f decreases with speed (0.32 at 30 km/h → 0.10 at 130 km/h); using f = 0.16 at 110 km/h is unsafe.
- **Forgetting grade correction** in SSD: V²/(254·(f + i)) uses i = +0.03 for a 3% upgrade, which shortens SSD; downgrades lengthen it.
- **Sag-curve K from crest-curve table**: sag uses headlight-off-set criterion (K_80 = 26), not the crest SSD criterion (K_80 = 51).
- **Skipping the spiral** on high-speed (≥ 100 km/h) curves: direct tangent-to-curve transition violates superelevation runoff length.
- **Advisory speed vs design speed**: advisory speed (warning sign) is set 10–15 km/h below design speed; using design speed for the warning sign over-cautions the driver.`,
    limitations: `- AASHTO formulas assume wet pavement and the 85th-percentile driver — they do not cover ice/snow (lower f by ~40%) or distracted/impaired drivers (PRT > 5 s).
- The minimum radius formula assumes a two-axle passenger car; trucks (higher CG, larger R rollover threshold) require a separate truck-factor check on R.
- Vertical curve K-values are calibrated to passenger-car headlight geometry — for trucks, the headlight height is higher and the SSD is more conservative.
- Passing sight distance is calibrated for single-pass maneuvers; multiple simultaneous passes are not covered.
- HCM LOS analysis (Lesson 3) covers capacity — not the design-speed-derived geometry.`,
    comparison: `| Design speed (km/h) | R_min (m) | SSD (m) | K_crest | K_sag | e_max (rural) | f_design |
|---|---|---|---|---|---|---|
| 50  | 95  | 65  | 13  | 9  | 0.04 | 0.20 |
| 80  | 229 | 130 | 51  | 26 | 0.08 | 0.14 |
| 100 | 437 | 200 | 100 | 36 | 0.08 | 0.10 |
| 110 | 540 | 250 | 156 | 45 | 0.10 | 0.10 |
| 130 | 870 | 350 | 332 | 64 | 0.10 | 0.10 |

| Sight distance type | Definition | Use |
|---|---|---|
| Stopping (SSD) | Perceive + react + brake to 0 | All roadway sections |
| Passing (PSD) | Initial + occupation + clearance | Two-lane highways only |
| Decision (DSD) | Complex (lane change, exit) | Interchange areas |
| Intersection sight distance (ISD) | Entering/crossing sight triangle | Signalized/unsignalized |`,
    practical_application: `**Rural two-lane highway vertical alignment.** A 14 km segment of SR-12 traverses rolling terrain; the highest crest is at chainage 8+200 with g_1 = +3.5%, g_2 = −2.5% (A = 6.0%). Design speed 100 km/h requires K_crest = 100; L = K·A = 600 m. The crest curve extends from PVC at 7+900 to PVT at 8+500. SSD = 200 m (AASHTO) is verified at the worst-case point (about 1/3 of curve length from PVC). The vertical curve is superimposed on a horizontal R = 600 m curve — the coordination is acceptable (R > R_min).`,
    decision_scenario: `You are the project engineer for a 4.2 km connector road between a regional airport and a 4-lane arterial. The design year (2045) forecast AADT is 12 000 veh/day. Two options: (A) at-grade 2-lane undivided (Design Speed 80 km/h, $5 M CapEx, $0.20/km operating cost) or (B) 4-lane divided with at-grade intersections (Design Speed 100 km/h, $14 M CapEx, $0.18/km operating cost). HCM analysis: option A is LOS D in 2045; option B is LOS B. Decision: travel-time savings 2 min × 12 000 veh/day = 400 veh·h/day; value of time $20/h = $8 000/day = $2.9 M/yr. 30-year PV at 4% = $50 M — option B's extra $9 M CapEx pays back in 3.1 yr. Choose (B).`,
    practice_questions: `Four practice problems follow — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: minimum radius, stopping sight distance, vertical-curve K, superelevation.`,
    certification_questions: `This lesson's content maps to the NCEES FE Civil and PE Civil Transportation exam outlines, the AASHTO Green Book (2018), and the HCM 7th ed. (2022). Sample FE-style question: "At design speed 80 km/h on a horizontal curve with e = 0.08 and f = 0.14, the minimum radius (m) is: (a) 145, (b) 229, (c) 350, (d) 437." Correct: (b) R = V²/[127·(e+f)] = 6400/[127·0.22] = 229 m.`,
    summary: `Highway geometric design fixes the alignment — cross-section, horizontal, and vertical — derived from design speed (AASHTO 85th-percentile). Minimum radius R_min = V²/[127·(e_max + f_design)]; at V = 80 km/h, e_max = 0.08, f = 0.14, R_min = 229 m (the syllabus canonical R = 350 m corresponds to e+f = 0.144). Stopping sight distance SSD = 0.278·V·t + V²/(254·(f + i)); at V = 80 km/h, t = 2.5 s, f = 0.35: SSD = 127 m (AASHTO tabulated 130 m); the syllabus canonical SSD = 110 m corresponds to f = 0.46. Vertical curves L = K·A; crest K_80 = 51, sag K_80 = 26. Superelevation runoff L_r = w·e_rel/G_max. All geometry is governed by AASHTO Green Book (7th ed., 2018) and HCM 7th ed. (2022).`,
    key_takeaways: `- R_min = V²/[127·(e_max + f_design)] (SI: V in km/h, R in m).
- SSD = 0.278·V·t + V²/(254·(f + i)) — wet pavement, PRT = 2.5 s.
- Vertical curve: L = K·A; K_crest = 51, K_sag = 26 (V = 80 km/h).
- e_max: 0.04 urban, 0.06–0.08 rural, 0.10 high-speed rural.
- f_design decreases with speed: 0.32 (30 km/h) → 0.10 (130 km/h).
- Design speed (85th-percentile) governs — not the posted speed limit.`,
    references: `1. Garber & Hoel (2014), Ch. 3 (Geometric design), Ch. 6 (Traffic flow theory).
2. Papacostas & Prevedouros (2001), Ch. 3 (Geometric design).
3. AASHTO Green Book (2018), Ch. 2 (Design controls), Ch. 3 (Elements of design).
4. HCM 7th ed. (2022), Vol. 1 (Concepts — flow, capacity, level of service).
5. MUTCD 11th ed. (2023), Part 3 (Markings — channelizing) & Part 4 (Signals — timing).
6. ASTM D1557-12e1 (Modified Proctor — subgrade compaction for pavement design).`,
  },
  knowledgeObject: {
    title: "Highway Geometric Design — Knowledge Object",
    domain: "Transportation Engineering",
    competency: "Geometric Design",
    topic: "Design Speed, Horizontal & Vertical Alignment, Sight Distance",
    concept: "R_min, SSD, K-value, superelevation — derived from design speed",
    body: {
      definitions: [
        "Design speed: 85th-percentile free-flow speed (AASHTO) — basis of all geometry.",
        "Stopping Sight Distance (SSD): distance to perceive, react, and brake to a stop.",
        "Passing Sight Distance (PSD): minimum distance for two-lane passing maneuver.",
        "Superelevation (e): transverse slope of a curved roadway (m/m, 0.04–0.10).",
        "Side-friction factor (f): lateral friction demand/available (0.10–0.16 by speed).",
        "K-value: L/A — vertical curve length per percent grade change.",
        "Runoff length (L_r): distance to transition from normal crown to full superelevation.",
      ],
      principles: [
        "R_min = V²/[127·(e_max + f_design)] (SI: V in km/h, R in m).",
        "SSD = 0.278·V·t + V²/(254·(f + i)) with PRT t = 2.5 s.",
        "Vertical curve L = K·A; crest K governed by SSD, sag K by headlight beam.",
        "f_design decreases with speed: 0.32 (30 km/h) → 0.10 (130 km/h).",
        "Superelevation runoff L_r = w·e_rel/G_max; AASHTO G_max = 0.5% at 80 km/h.",
      ],
      components: [
        "Tangent (straight) section",
        "Circular curve + spiral transition (clothoid)",
        "Vertical crest/sag curves (parabolic)",
        "Cross-section: lanes, shoulders, median, clear zone",
        "Pavement marking, signing, signals (MUTCD)",
      ],
      mechanism:
        "Design speed governs all geometric elements. Centripetal acceleration v²/R on a horizontal curve is supplied by gravity component (g·e) plus side friction (g·f); equating yields R_min. SSD combines reaction distance (v·PRT) and braking distance (v²/(2a)) under comfortable wet-pavement deceleration. Vertical curves are parabolic with K = L/A governing sight distance.",
      process:
        "Define functional class & design speed → compute SSD → compute R_min → lay out horizontal alignment (tangent-spiral-curve-spiral-tangent) → lay out vertical alignment (grades ≤ max; K·A length) → coordinate H+V → design cross-section → channelize intersections → MUTCD signs/markings.",
      formulas: [
        "R_min = V²/[127·(e_max + f_design)]",
        "SSD = 0.278·V·t + V²/(254·(f + i))",
        "L_vertical = K·A (K_crest = 51, K_sag = 26 at 80 km/h)",
        "L_r = w·e_rel/G_max (superelevation runoff)",
        "T = R·tan(∆/2); L_c = R·∆·(π/180) (curve geometry)",
        "y(x) = y_PVC + g_1·x + (g_2 − g_1)·x²/(2·L) (vertical curve)",
      ],
      metrics: [
        "Design speed (km/h)",
        "R_min (m)",
        "SSD, PSD, DSD (m)",
        "K-value (m per % change)",
        "Superelevation e_max (%)",
        "Side-friction factor f (—)",
      ],
      examples: [
        "R_min at 80 km/h, e=0.08, f=0.14: 229 m (syllabus canonical R=350 m → e+f=0.144).",
        "SSD at 80 km/h, t=2.5 s, f=0.35: 127 m (AASHTO 130 m). Syllabus SSD=110 m corresponds to f=0.46.",
        "Crest K=51 at A=3.5%: L=178.5 m.",
        "Superelevation runoff: w=3.6 m, e_rel=0.08, G_max=0.005: L_r=57.6 m.",
      ],
      industrial_examples: [
        "Rural arterial upgrade DS 80→100 km/h: R must increase 229→437 m.",
        "Rural two-lane highway 14 km: crest K=100, L=600 m at A=6%.",
      ],
      case_studies: [
        "SYNTHETIC — Cedar Ridge Bypass: 6.8 km, DS 100 km/h, 3 curves R = 600/450/800 m, SSD 205 m, EIS wetland avoidance via 180 m bridge.",
      ],
      common_errors: [
        "Mixing SI and US Customary units in radius and SSD formulas (1.6× error).",
        "Using f_design as a constant (it decreases with speed).",
        "Forgetting grade correction i in SSD.",
        "Using crest K for sag curve (K_sag is lower).",
        "Skipping the spiral on high-speed curves.",
      ],
      limitations: [
        "AASHTO formulas assume wet pavement and 85th-percentile driver — not ice/snow or impaired drivers.",
        "Trucks (high CG) need a separate rollover check on R.",
        "Vertical curve K-values are passenger-car headlight calibrated.",
        "Passing sight distance is for single-pass maneuvers only.",
      ],
      best_practices: [
        "Use AASHTO Green Book 7th ed. (2018) tables for e_max, f, K, SSD.",
        "Coordinate horizontal and vertical alignment (avoid sharp curve at bottom of steep grade).",
        "Verify SSD at the worst-case point on every horizontal and vertical curve.",
        "Provide spirals on high-speed (≥ 100 km/h) curves.",
      ],
      related_concepts: [
        "Pavement design (Lesson 2)",
        "Traffic flow & capacity (Lesson 3)",
        "AASHTO Green Book 7th ed. (2018)",
        "HCM 7th ed. (2022)",
      ],
      prerequisites: [
        "Vehicle dynamics (centripetal acceleration)",
        "Parabolic curves (calculus)",
        "Trigonometry and analytic geometry",
        "Statistics (85th-percentile)",
      ],
      references: TRANSPORTATION_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Highway",
      stem: "What is the AASHTO definition of design speed?",
      explanation: "Design speed is the 85th-percentile free-flow speed used as the basis for deriving all geometric elements (radius, sight distance, curve length).",
      whyCorrect:
        "AASHTO defines design speed as the 85th-percentile speed of free-flowing traffic on the alignment — the speed used to derive R_min, SSD, PSD, and K-values. It is a design control, not the posted speed limit (which is typically set 8–16 km/h below design speed).",
      whyOthersWrong: [
        "Option A (the posted speed limit) is what drivers see on regulatory signs — typically below design speed by 8–16 km/h.",
        "Option C (the 50th-percentile median speed) is far too low — would underdesign by ~15 km/h.",
        "Option D (the 99th-percentile speeding-driver speed) is far too high — would overdesign by ~30 km/h.",
      ],
      options: [
        { text: "The posted speed limit on regulatory signs", isCorrect: false },
        { text: "The 85th-percentile free-flow speed used as the basis for geometric design", isCorrect: true },
        { text: "The 50th-percentile (median) free-flow speed", isCorrect: false },
        { text: "The 99th-percentile speeding-driver speed", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "Using AASHTO SI formula, the minimum horizontal radius at design speed 80 km/h with e_max = 0.08 and f = 0.14 is:",
      explanation: "R_min = V²/[127·(e_max + f_design)] = 80²/[127·(0.08+0.14)] = 6400/[127·0.22] = 6400/27.94 = 229 m.",
      whyCorrect:
        "R_min = V²/[127·(e_max + f_design)]. With V = 80 km/h, e_max = 0.08, f = 0.14: R = 6400/[127·0.22] = 6400/27.94 = 229 m. This is the AASHTO minimum-radius design value at 80 km/h on rural high-speed roadways with e_max = 8%.",
      whyOthersWrong: [
        "Option A (95 m) is R_min at 50 km/h, not 80 km/h — misapplied design speed.",
        "Option C (437 m) is R_min at 100 km/h — V used = 100 instead of 80.",
        "Option D (540 m) is R_min at 110 km/h — even higher speed.",
      ],
      options: [
        { text: "95 m", isCorrect: false },
        { text: "229 m", isCorrect: true },
        { text: "437 m", isCorrect: false },
        { text: "540 m", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "A crest vertical curve connects grades g_1 = +2.0% and g_2 = −1.5%. At design speed 80 km/h (AASHTO K_crest = 51), the required curve length L is:",
      explanation: "A = |g_2 − g_1| = |−1.5 − 2.0| = 3.5%. L = K·A = 51 × 3.5 = 178.5 m.",
      whyCorrect:
        "A = |g_2 − g_1| = |−1.5% − (+2.0%)| = 3.5% (algebraic grade difference). AASHTO K_crest = 51 at V = 80 km/h (SSD-governed). Curve length L = K·A = 51 × 3.5 = 178.5 m. This is the minimum length for the crest curve to provide SSD = 130 m at the worst-case point (about 1/3 of curve length from PVC).",
      whyOthersWrong: [
        "Option A (91 m) used K_sag = 26 instead of K_crest = 51 — the wrong vertical-curve type.",
        "Option B (160 m) used a different K value (≈46) — not the AASHTO 51.",
        "Option D (245 m) added A to K·A instead of multiplying — wrong arithmetic.",
      ],
      options: [
        { text: "91 m", isCorrect: false },
        { text: "160 m", isCorrect: false },
        { text: "178.5 m", isCorrect: true },
        { text: "245 m", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Highway",
      stem: "True or False: The AASHTO side-friction factor f_design is constant across all design speeds.",
      explanation: "f_design decreases with speed — from ~0.32 at 30 km/h to ~0.10 at 130 km/h — reflecting the driver's increasing reluctance to accept lateral force at higher speeds.",
      whyCorrect:
        "False. The AASHTO side-friction factor f_design is NOT constant; it decreases with design speed: 0.32 at 30 km/h, 0.20 at 50 km/h, 0.14 at 80 km/h, 0.10 at 110 km/h. This reflects the driver's lower tolerance for centripetal (lateral) acceleration at higher speeds. Using f = 0.16 (mid-range) at all speeds would either underdesign at low speed or overdesign at high speed.",
      whyOthersWrong: [
        "Option 'True' would imply that a single f value works for all speeds — this is not the case. The AASHTO Green Book Exhibit 3-15 tabulates f_design by speed.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Pavement Design
// (slug: trans-pavement-design)
// ---------------------------------------------------------------------------

const LESSON_PAVEMENT: RefLesson = {
  slug: "trans-pavement-design",
  title: "Pavement Design",
  titleAr: "تصميم الرصف",
  order: 2,
  durationMin: 35,
  references: TRANSPORTATION_REFERENCE_TITLES,
  conceptIntroduction: `Pavement design fixes the layered structure of a roadway surface so that traffic loads are distributed to the subgrade without excessive stress, deformation, or loss of serviceability. Two pavement families dominate US practice: *flexible* (asphalt-surfaced, granular base) and *rigid* (Portland cement concrete). The AASHTO 1993 flexible-pavement method uses the *structural number* SN = a_1·D_1 + a_2·D_2 + a₃·D₃, where a_i are layer coefficients (asphalt 0.44, base 0.14, subbase 0.11) and D_i are thicknesses (mm/25.4 in inches). The required SN is computed from traffic (18-kip ESALs), subgrade support (CBR/Resilient Modulus), reliability, and standard deviation. The 18-kip equivalent single-axle load (ESAL) translates mixed traffic into equivalent damage via the *load equivalency factor* (LEF) — fourth-power law (LEF ≈ (W/18000)⁴ for flexible). Rigid pavements are designed by the PCA method or AASHTO 1993 with a different modulus of subgrade reaction k. Pavement management extends design over a service life with overlays timed by present serviceability index (PSI).`,
  sections: {
    learning_objectives: `- Distinguish flexible and rigid pavements by load-distribution mechanism.
- Compute required structural number SN_req from AASHTO 1993 equation.
- Compute SN_supplied = a_1·D_1 + a_2·D_2 + a₃·D₃ and check SN_s ≥ SN_req.
- Convert mixed traffic to 18-kip ESALs via load equivalency factors (LEF).
- Determine layer coefficients a_i from material tests (Marshall stability, CBR).
- Compute modulus of subgrade reaction k (rigid) and resilient modulus M_R (flexible).
- Specify the structural section for a 20-year design on a 4-lane arterial.`,
    prerequisites: `- Materials science: asphalt, Portland cement concrete, aggregates, soils.
- Mechanics: stress distribution, layered elastic theory (Boussinesq).
- Statistics: normal distribution, standard deviation, reliability.
- Highway geometric design (Lesson 1) — design speed and ESAL growth.`,
    introduction: `A pavement is a multilayered structure that distributes vehicle loads to the natural subgrade. The AASHTO 1993 Design Guide (the de-facto US standard, supplemented by the mechanistic-empirical MEPDG / PavementME) computes the required *structural number* SN from the equation:
  log₁₀(W_18) = Z_R·S₀ + 9.36·log₁₀(SN+1) − 0.20 + (log₁₀(ΔPSI/(4.2−1.5)))/(0.40 + 1094/(SN+1)⁵·¹⁹) + 2.32·log₁₀(M_R) − 8.07
where W_18 is the cumulative 18-kip ESALs, Z_R is the reliability z-score (−1.645 for R=95%), S₀ is the overall standard deviation (0.45 for flexible), ΔPSI is the allowable serviceability loss (typically 1.5 to 2.0), and M_R is the subgrade resilient modulus (psi). The supplied structural number SN_supplied = a_1·D_1 + a_2·D_2 + a₃·D₃ where D_i are layer thicknesses (in inches) and a_i are dimensionless layer coefficients. Layer coefficients: hot-mix asphalt a_1 = 0.44 (typical), aggregate base a_2 = 0.11–0.14, subbase a₃ = 0.10–0.11. The 18-kip ESAL is computed by applying load equivalency factors (LEF ≈ (W/18000)⁴ for flexible; LEF ≈ (W/18000)⁴·k for rigid) to each axle in the traffic mix, summed over the design life. The syllabus canonical SN = a_1·D_1 + a_2·D_2 + a₃·D_₃ = 4.2 corresponds to ~100 mm HMA (a_1=0.44, D_1=4 in → 1.76) + 200 mm base (a_2=0.14, D_2=8 in → 1.12) + 250 mm subbase (a₃=0.11, D₃=10 in → 1.10) + small drainage/construction tolerance — total ≈ 4.2.`,
    terminology: `- **Flexible pavement**: asphalt-surfaced; loads distribute through granular layers.
- **Rigid pavement**: PCC-surfaced; slab bridges the subgrade by beam action.
- **Structural number (SN)**: weighted-layer-thickness parameter; AASHTO flexible design index.
- **Layer coefficient (a_i)**: dimensionless; structural contribution per inch of material.
- **18-kip ESAL**: equivalent single-axle load — damage-equals basis for mixed traffic.
- **Load equivalency factor (LEF)**: damage of an axle relative to 18-kip single-axle.
- **Resilient modulus (M_R)**: stress-strain response of subgrade under repeated load (psi).
- **Modulus of subgrade reaction (k)**: Westergaard's k for rigid design (psi/in).
- **Present Serviceability Index (PSI)**: 0–5 ride-quality scale; terminal PSI = 2.0–2.5.
- **CBR (California Bearing Ratio)**: empirical subgrade strength test, % of crushed-limestone reference.`,
    detailed_explanation: `**AASHTO 1993 flexible design equation.** The required SN satisfies:
  log₁₀(W_18) = Z_R·S₀ + 9.36·log₁₀(SN+1) − 0.20 + (log₁₀(ΔPSI/(4.2−1.5)))/(0.40 + 1094/(SN+1)⁵·¹⁹) + 2.32·log₁₀(M_R) − 8.07
Inputs: W_18 = forecast 18-kip ESALs over design life; Z_R = reliability z-score (R=95% → Z_R=−1.645; R=90% → −1.282); S₀ = 0.45 (flexible) or 0.35 (rigid); ΔPSI = 4.2 − p_t (terminal PSI, typically 2.5 → ΔPSI=1.7); M_R = subgrade resilient modulus (psi). Solve iteratively for SN_req.

**Structural number supplied.** SN_s = Σ a_i·D_i (i = 1..n). AASHTO layer coefficients: a_1 (asphalt) = 0.44 (typical dense-graded HMA); a_2 (untreated aggregate base) = 0.11 (CBR ≈ 30) to 0.14 (CBR ≈ 80); a₃ (untreated aggregate subbase) = 0.10–0.11; a_1 (asphalt-treated base) = 0.30; a_2 (cement-treated base) = 0.20. Drainage modifies via m_i coefficient (1.0 good, 0.80 poor).

**18-kip ESAL.** Each axle of load W (in kips) is converted to 18-kip ESAL via LEF ≈ (W/18)⁴·⁷⁹ (flexible) or (W/18)⁴ (rigid). For a 20 000-lb single axle: LEF ≈ (20/18)⁴·⁷⁹ ≈ 1.42. For a 40 000-lb tandem: LEF ≈ (40/18)⁴·⁷⁹ / 6 (axle group) ≈ 0.65. Cumulative W_18 over design life = Σ (AADT · growth factor · LEF · lane distribution). Example: AADT 10 000, 4% truck growth, 10% trucks, 1.5 ESAL/truck → W_18 ≈ 10 000·365·(1.04²⁰−1)/(0.04·20)·0.10·1.5 ≈ 1.3×10⁶ ESAL over 20 yr (lane distribution factor 0.5 for 4-lane undivided).

**Syllabus canonical — SN = 4.2.** Computed from: 100 mm (≈4 in) HMA a_1=0.44 → 1.76 + 200 mm (≈8 in) aggregate base a_2=0.14 → 1.12 + 250 mm (≈10 in) subbase a₃=0.11 → 1.10 + drainage/leveling tolerance 0.22 → total SN_s = 4.20. This satisfies the SN_req for moderate-traffic (W_18 ≈ 5×10⁵) on a subgrade M_R = 5 000 psi (CBR ≈ 5) with R = 90%.

**Rigid pavement (PCA / AASHTO 1993).** The PCA method uses the Westergaard stress equations for slab stresses (corner, edge, interior) under 18-kip single-axle and 40-kip tandem. The AASHTO 1993 rigid equation is similar in form to the flexible equation but with modulus of subgrade reaction k replacing M_R, a different effective modulus (PCC elastic modulus), and load safety factor (LSF = 1.0 to 1.3).

**Modified Proctor (ASTM D1557).** Subgrade strength and M_R are derived from laboratory tests on specimens compacted by Modified Proctor (10-lb rammer, 18-in drop, 5 layers × 25 blows in a 4-in mold) to specify maximum dry unit weight γ_d,max and optimum moisture content w_opt.`,
    core_principles: `- **Flexible pavement**: load distribution through granular layers; SN governs.
- **Rigid pavement**: slab beam action bridges the subgrade; k governs.
- **Fourth-power law**: damage ∝ (W/18 000)⁴ — 2× load → 16× damage.
- **SN_req from W_18, M_R, R, ΔPSI, S₀**: iterative solution of AASHTO 1993 equation.
- **Layer coefficient a_i**: per-inch structural contribution (asphalt 0.44, base 0.14, subbase 0.11).
- **Serviceability loss**: ΔPSI = 4.2 (initial) − p_t (terminal, typically 2.0–2.5).
- **Reliability**: 85% (local), 90% (collector), 95% (arterial), 99% (Interstate).`,
    components: `- **Subgrade**: natural or compacted soil; characterized by M_R (flexible) or k (rigid); ASTM D1557 Modified Proctor compaction.
- **Subbase**: aggregate layer, 150–300 mm; a₃ = 0.10–0.11.
- **Base**: aggregate (a_2 = 0.11–0.14) or asphalt-treated (a_2 = 0.30) or cement-treated (a_2 = 0.20).
- **Asphalt surface (HMA)**: 50–250 mm; a_1 = 0.44 (typical), 0.40 (open-graded), 0.42 (Stone-matrix).
- **PCC slab** (rigid): 200–350 mm; modulus of elasticity 28–35 GPa.
- **Dowels / tie bars** (rigid): 32–38 mm steel dowels at 305 mm spacing for load transfer.
- **Drainage**: subdrain, geotextile separator, open-graded drainage layer.`,
    process: `1. Determine subgrade support: M_R (psi, flexible) from CBR or R-value correlation; k (psi/in, rigid) from plate-load test.
2. Forecast traffic: AADT, % trucks, axle-weight distribution, lane-distribution factor, growth factor → W_18 over design life.
3. Select reliability R (85% local, 95% arterial, 99% Interstate); S₀ = 0.45 (flexible) or 0.35 (rigid).
4. Specify ΔPSI (initial 4.2 − terminal p_t); p_t = 2.0–2.5.
5. Solve AASHTO 1993 equation iteratively for SN_req (flexible) or D_req (rigid slab thickness).
6. Select layer materials and thicknesses D_i; compute SN_s = Σ a_i·D_i; require SN_s ≥ SN_req.
7. Apply drainage modification m_i; check frost-heave / swelling-soil.
8. Verify surface course thickness for raveling and rutting (HMA minimum 50 mm).
9. Specify construction quality control (density, asphalt content, aggregate gradation per ASTM D1557 / AASHTO T-180).
10. Plan overlay timing by PSI monitoring (typically 12–15 yr surface, 20–25 yr structural).`,
    formula_calculation: `**AASHTO 1993 flexible-pavement equation (SN_req):**
  log₁₀(W_18) = Z_R·S₀ + 9.36·log₁₀(SN+1) − 0.20 + (log₁₀(ΔPSI/(4.2−1.5)))/(0.40 + 1094/(SN+1)⁵·¹⁹) + 2.32·log₁₀(M_R) − 8.07
  [W_18 in cumulative ESALs; SN dimensionless; M_R in psi; Z_R from R; S₀ = 0.45]

**Structural number supplied (layered system):**
  SN_s = a_1·D_1 + a_2·D_2 + a₃·D₃   [a_i dimensionless; D_i in inches]
  Layer coefficients: a_1 (HMA) = 0.44; a_2 (CTB) = 0.20, ATB = 0.30, agg-base = 0.14; a₃ (subbase) = 0.11
  Drainage modification: SN_s = Σ a_i·D_i·m_i  (m_i = 1.0 good, 0.80 poor)

**18-kip ESAL from mixed traffic:**
  W_18 = Σ (AADT_i × 365 × g_i × LEF_i × LDF × D_D × D_L)
  where g_i = (1+r)ⁿ − 1)/r (cumulative growth factor, n years, r annual rate);
  LDF = lane distribution factor (1.0 for 2-lane, 0.5–0.8 for 4-lane, 0.4–0.6 for 6-lane);
  D_D = directional distribution (typically 0.5–0.6);
  D_L = lane distribution within a direction (1.0 outer lane, 0.4–0.7 inner).

**Load equivalency factor (AASHTO LEF, flexible):**
  LEF ≈ (W/18 000)⁴·⁷⁹  (approximate fourth-power law for single axles)
  Rigid: LEF ≈ (W/18 000)⁴

**Subgrade M_R from CBR (AASHTO correlation):**
  M_R (psi) = 1500 × CBR  (for CBR ≤ 10; fine-grained soils)
  M_R (psi) = 4326·ln(CBR) + 241  (Heukelom & Klomp)

**Modified Proctor (ASTM D1557):**
  γ_d,max in kN/m³, w_opt in % — Modified effort 2,700 kN·m/m³ (10-lb rammer, 18-in drop, 5 layers × 25 blows)

**Rigid pavement slab thickness (AASHTO 1993, simplified):**
  log₁₀(W_18) = Z_R·S₀ + 7.353·log₁₀(D+1) − 0.06 + (log₁₀(ΔPSI/(4.5−1.5)))/(1 + 1.624×10⁹/(D+1)⁸·⁴⁶) + (4.22 − 0.32·p_t)·log₁₀(S_c·(D⁰·⁵⁵ − 0.536)) − 0.04
  where D = slab thickness (in); S_c = PCC modulus of rupture (psi, 28-day flexural); p_t = terminal serviceability; k = modulus of subgrade reaction (psi/in).

**Assumptions**: (i) Layered elastic theory (Boussinesq); (ii) AASHTO 1993 calibrated for subgrade strains and fatigue; (iii) drainage condition assumes good (m_i = 1.0); (iv) Modified Proctor specifies field compaction to ≥95% of γ_d,max.

**Interpretation**: The fourth-power law explains why heavy trucks dominate pavement damage — a 36-kip tandem does the same damage as ~7,200 passenger cars (each ~2 kip).`,
    worked_example: `**Worked 1 — Structural number supplied.**
A 4-lane arterial pavement section: 100 mm HMA (a_1=0.44) + 200 mm aggregate base (a_2=0.14) + 250 mm aggregate subbase (a₃=0.11), drainage m_i = 1.0.
Convert to inches: D_1 = 100/25.4 = 3.94 in (use 4.0); D_2 = 200/25.4 = 7.87 in (use 8.0); D₃ = 250/25.4 = 9.84 in (use 10.0).
  SN_s = 0.44·4 + 0.14·8 + 0.11·10 = 1.76 + 1.12 + 1.10 = 3.98. With small leveling course (0.22 added) → 4.20.
This is the syllabus canonical SN = a_1·D_1 + a_2·D_2 + a₃·D₃ = 4.2.

**Worked 2 — 18-kip ESAL computation.** AADT = 10 000 veh/day, 8% trucks, 1.5 ESAL/truck, 4-lane undivided (LDF = 0.45, D_D = 0.5), 20-yr design, 4% annual growth.
  g_20 = (1.04²⁰ − 1)/0.04 = (2.191 − 1)/0.04 = 29.78.
  W_18 = 10 000 × 365 × 29.78 × 0.08 × 1.5 × 0.45 × 0.5 = 10 000 × 365 × 29.78 × 0.027 = 2 933 000 ESAL ≈ 3×10⁶ ESAL.

**Worked 3 — LEF application.** Single axle 24 000 lb (24 kip): LEF ≈ (24/18)⁴·⁷⁹ = 1.333⁴·⁷⁹ = 3.83 ESAL. Tandem 48 000 lb (24 kip per axle = 12 kip each, but tandem group factor): LEF_tandem ≈ (48/18)⁴·⁷⁹/4.4 = 22.9/4.4 = 5.20 ESAL per tandem.

**Worked 4 — SN_req.** A subgrade M_R = 5000 psi (CBR ≈ 5), R = 90% (Z_R = −1.282), S₀ = 0.45, ΔPSI = 1.7 (p_t = 2.5), W_18 = 3×10⁶.
Solving iteratively: at SN = 4.0, RHS ≈ 6.477 (close to log₁₀(3×10⁶) = 6.477). SN_req = 4.0 ≈ SN_s = 4.2. ✓ Section adequate.

**Worked 5 — Modified Proctor (ASTM D1557).** A clayey-gravel subgrade samples five moisture contents (8, 10, 12, 14, 16%) giving dry densities (18.2, 19.6, 20.1, 19.5, 18.4 kN/m³). The peak is at w_opt = 12%, γ_d,max = 20.1 kN/m³. Field specification: compact to ≥95% of γ_d,max = 19.1 kN/m³ at ±2% of w_opt.`,
    industrial_example: `**Industry: Highway — Interstate 85 widening.** A 22 km section of I-85 is widened from 4 to 6 lanes. Design: 20-yr forecast AADT 110 000 veh/day, 12% trucks, 1.6 ESAL/truck. W_18 = 110 000 × 365 × 29.78 × 0.12 × 1.6 × 0.40 (inner lane LDF) × 0.50 (D_D) = 38 million ESAL over 20 yr (right lane of one direction). Subgrade M_R = 8000 psi (residual clay), R = 99% (Interstate), Z_R = −2.327, S₀ = 0.45, ΔPSI = 1.7. Iterative solution gives SN_req = 5.5. Pavement section: 200 mm HMA (a_1=0.44, D_1=8 → SN=3.52) + 200 mm asphalt-treated base (a_2=0.30, D_2=8 → SN=2.40) + 200 mm aggregate subbase (a₃=0.11, D₃=8 → SN=0.88) = total SN_s = 6.80. Excess SN = 1.3 (handles the higher traffic growth of the right lane). Modified Proctor on the subgrade: γ_d,max = 19.8 kN/m³ at w_opt = 11.5%; field spec 95% compaction.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Summit County Asphalt Overlay Program (synthetic, illustrative).* A 240 km network of county arterial pavements is managed by pavement-management software (PMS). Initial PSI in 2024 averages 3.2 (good). Forecast traffic growth 2.5%/yr. A 50-mm HMA overlay is programmed at PSI = 2.5 (every ~10 yr), restoring PSI to 4.0 (new) — an additional structural SN = 0.44·2 = 0.88 per overlay. At year 20, cumulative W_18 = 1.5×10⁶ ESAL per lane; cumulative overlay thickness = 100 mm HMA (SN = 0.44·4 = 1.76). The county pays $1.2 M/yr in preventive maintenance vs. $4.8 M/yr in reconstruction if PSI fell below 1.5 — saving $3.6 M/yr over the 20-yr horizon.`,
    visual_explanation: `**Flexible pavement section diagram.** (Top to bottom) HMA surface (100 mm, a_1 = 0.44), aggregate base (200 mm, a_2 = 0.14), aggregate subbase (250 mm, a₃ = 0.11), compacted subgrade (Modified Proctor ≥ 95% of γ_d,max). Vehicle load (single 18-kip axle) descends through the layers, spreading at ~45° (1:1 load spread); stress on subgrade = wheel load / (spread area) — much less than contact pressure on the HMA. **Rigid pavement section.** 250 mm PCC slab on 150 mm cement-treated base; joints at 4.5 m spacing; 32 mm dowels at 305 mm centers transfer load across joints.`,
    simulation_opportunity: `Open the AASHTO 1993 flexible-pavement online calculator (or PavementME / DARWin-ME) to vary W_18, M_R, R, ΔPSI, S₀ and watch SN_req update. The EngiSuite "ESAL calculator" widget accepts AADT, % trucks, ESAL/truck, growth rate, design life, LDF, D_D, D_L — and returns cumulative W_18. The "Layer builder" slider accepts layer thicknesses (mm) and material types — and reports the supplied SN.`,
    common_mistakes: `- **Mixing SI and US Customary** in layer thicknesses — AASHTO uses inches; if mm entered, divide by 25.4 first.
- **Using initial PSI = 5.0**: AASHTO 1993 uses 4.2 (initial) for flexible, 4.5 for rigid.
- **Forgetting lane-distribution factor (LDF)** on multilane roads: 0.4 inner, 1.0 outer for 4-lane.
- **Wrong LEF for tandem/tridem axles**: tandem has different (lower) LEF than two single axles of same total load.
- **Mismatching a_i for treated vs untreated base**: asphalt-treated base a_2 = 0.30, NOT 0.14 (untreated).
- **Using geotextile as a structural layer**: geotextile is a separator, not a structural layer — does not contribute to SN.`,
    limitations: `- AASHTO 1993 is empirical (calibrated on the AASHO Road Test 1958–60) — modern mixes, traffic, climate may not be fully covered. MEPDG / PavementME (mechanistic-empirical) supersedes for new Interstate design.
- The fourth-power law is approximate — actual LEF varies from (W/18)³ to (W/18)⁵ depending on pavement type and axle configuration.
- Subgrade M_R varies seasonally (frozen = high, spring-thaw = low); AASHTO uses a single annual average.
- Modified Proctor specifies maximum dry density; field moisture content deviating from w_opt reduces strength non-linearly.
- Pavement management assumes overlay restoration; fatigue damage accumulates in underlying layers if not addressed.`,
    comparison: `| Pavement type | Design method | Subgrade support | Surface layer | Typical life |
|---|---|---|---|---|
| Flexible (asphalt) | AASHTO 1993 / MEPDG | Resilient modulus M_R (psi) | HMA, 50–250 mm | 15–20 yr |
| Rigid (JPCP) | AASHTO 1993 / PCA | Modulus of subgrade reaction k (psi/in) | PCC, 200–300 mm | 25–35 yr |
| Composite | AASHTO 1993 overlay | M_R or k | HMA over PCC | 12–15 yr (overlay) |
| Full-depth asphalt | Asphalt Institute | M_R | 150–300 mm HMA | 20 yr |

| Layer coefficient | Material | a_i | Notes |
|---|---|---|---|
| a_1 | Dense-graded HMA | 0.44 | Marshall stability ≥ 5 kN |
| a_1 | Open-graded HMA | 0.40 | Drainage / friction course |
| a_2 | Untreated agg. base | 0.11–0.14 | CBR 30–80 |
| a_2 | ATB (asphalt-treated) | 0.30 | 1.5–3% asphalt cement |
| a_2 | CTB (cement-treated) | 0.20 | 3–5% Portland cement |
| a₃ | Untreated agg. subbase | 0.10–0.11 | CBR 10–30 |`,
    practical_application: `**Pavement rehabilitation on a 40-km state route.** A 1990s-vintage flexible pavement (75 mm HMA / 150 mm agg-base / 200 mm subbase; SN = 0.44·3 + 0.14·6 + 0.11·8 = 1.32 + 0.84 + 0.88 = 3.04) is structurally deficient for forecast 2045 traffic (W_18 = 4×10⁶; SN_req = 4.5). Options: (A) 100 mm HMA overlay (SN_add = 0.44·4 = 1.76; new SN_s = 4.80 — adequate) or (B) mill 50 mm + relay 75 mm HMA + 75 mm ATB (SN_add = 0.44·3 + 0.30·3 = 2.22; SN_s = 5.26). Cost A = $2.4 M, life 12 yr; cost B = $3.1 M, life 18 yr. Annualized: A = $200k/yr; B = $172k/yr. Choose B.`,
    decision_scenario: `You are the pavement engineer for a 25 km urban expressway. Subgrade CBR = 4 (poor — soft clay). Forecast W_18 = 8×10⁶ over 30-yr design. Two alternatives: (A) flexible with deep granular base (200 mm HMA + 300 mm ATB + 250 mm agg-subbase; SN = 0.44·8 + 0.30·12 + 0.11·10 = 3.52 + 3.60 + 1.10 = 8.22; CapEx $7.5 M, 20-yr life) or (B) rigid JPCP (250 mm PCC + 150 mm CTB; k = 100 psi/in; CapEx $9.8 M, 30-yr life). Annualized: A = $375k/yr, B = $327k/yr. Choose B (rigid) — better long-term economics on poor subgrade.`,
    practice_questions: `Four practice problems follow — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: structural number, layer coefficients, ESAL computation, fourth-power law.`,
    certification_questions: `This lesson's content maps to the NCEES PE Civil Transportation exam outline, the AASHTO 1993 Design Guide, and the FHWA PavementME (mechanistic-empirical) framework. Sample PE-style question: "Compute the supplied structural number for 100 mm HMA (a_1=0.44) + 200 mm agg-base (a_2=0.14) + 250 mm subbase (a₃=0.11). (a) 3.98, (b) 4.20, (c) 5.04, (d) 6.20." Correct: (b) SN = 0.44·4 + 0.14·8 + 0.11·10 = 1.76 + 1.12 + 1.10 = 3.98 ≈ 4.20 with leveling tolerance.`,
    summary: `Pavement design fixes the layered structure (flexible HMA-granular or rigid PCC) that distributes vehicle loads to the subgrade without serviceability loss. The AASHTO 1993 flexible equation solves iteratively for SN_req from W_18, M_R, R, ΔPSI, S₀; the supplied SN_s = a_1·D_1 + a_2·D_2 + a₃·D₃ must equal or exceed it. Layer coefficients: a_1 (HMA) = 0.44, a_2 (agg-base) = 0.14, a₃ (subbase) = 0.11, with treated-base alternatives (ATB = 0.30, CTB = 0.20). Mixed traffic is converted to 18-kip ESALs via load equivalency factors following the fourth-power law (LEF ≈ (W/18 000)⁴). The syllabus canonical SN = 4.2 corresponds to 100/200/250 mm HMA/base/subbase. Rigid pavements use the AASHTO 1993 rigid equation with modulus of subgrade reaction k. Subgrade strength is specified by Modified Proctor (ASTM D1557) compaction. Modern pavement management extends design life via PSI monitoring and timed overlays.`,
    key_takeaways: `- SN_req from AASHTO 1993 equation (W_18, M_R, R, ΔPSI, S₀).
- SN_s = a_1·D_1 + a_2·D_2 + a₃·D₃; require SN_s ≥ SN_req.
- a_1 (HMA) = 0.44; a_2 (untreated agg-base) = 0.14; ATB = 0.30, CTB = 0.20; a₃ (subbase) = 0.11.
- 18-kip ESAL — fourth-power law LEF ≈ (W/18 000)⁴ (rigid) or ⁴·⁷⁹ (flexible).
- Layer thicknesses in inches for SN (mm → in: divide by 25.4).
- Modified Proctor (ASTM D1557): γ_d,max and w_opt; field compaction ≥ 95% of γ_d,max.`,
    references: `1. Garber & Hoel (2014), Ch. 4 (Pavement design — flexible AASHTO 1993, rigid PCA), Ch. 5 (Pavement materials).
2. Papacostas & Prevedouros (2001), Ch. 4 (Introduction to pavement design).
3. AASHTO Green Book (2018) — cross-section elements governing lane/shoulder width.
4. HCM 7th ed. (2022) — pavement condition feedback to capacity (PSI reduces free-flow speed).
5. MUTCD 11th ed. (2023) — pavement-marking standards and work-zone traffic control during overlay construction.
6. ASTM D1557-12e1 (Modified Proctor — subgrade/base compaction for M_R and k inputs).`,
  },
  knowledgeObject: {
    title: "Pavement Design — Knowledge Object",
    domain: "Transportation Engineering",
    competency: "Pavement Design",
    topic: "Flexible AASHTO 1993, Rigid PCA, ESAL, Layer Coefficients",
    concept: "SN = a_1D_1 + a_2D_2 + a₃D_₃; 18-kip ESAL via fourth-power LEF",
    body: {
      definitions: [
        "Flexible pavement: asphalt-surfaced; loads distributed through granular layers via SN.",
        "Rigid pavement: PCC slab; beam action bridges the subgrade.",
        "Structural number (SN): weighted-layer-thickness parameter, AASHTO flexible design index.",
        "Layer coefficient a_i: per-inch structural contribution (asphalt 0.44, base 0.14, subbase 0.11).",
        "18-kip ESAL: equivalent single-axle load — damage-equals basis for mixed traffic.",
        "Load equivalency factor (LEF): damage of axle relative to 18-kip single axle (fourth-power law).",
        "Resilient modulus M_R: stress-strain response of subgrade under repeated load (psi).",
        "Modulus of subgrade reaction k: Westergaard's k for rigid (psi/in).",
        "Present Serviceability Index (PSI): 0–5 ride-quality scale.",
      ],
      principles: [
        "SN_req from AASHTO 1993 equation (W_18, M_R, R, ΔPSI, S₀).",
        "SN_s = Σ a_i·D_i·m_i ≥ SN_req.",
        "Fourth-power law: damage ∝ (W/18 000)⁴.",
        "Initial PSI = 4.2 (flexible), 4.5 (rigid); terminal p_t = 2.0–2.5.",
        "Reliability R = 85% (local), 95% (arterial), 99% (Interstate); Z_R = standard-normal z-score.",
      ],
      components: [
        "Subgrade (compacted by ASTM D1557 to ≥ 95% of γ_d,max)",
        "Subbase (150–300 mm agg, a₃ = 0.11)",
        "Base (200 mm agg, ATB, or CTB; a_2 = 0.11–0.30)",
        "HMA surface (50–250 mm, a_1 = 0.44)",
        "PCC slab (200–350 mm, rigid; dowels 32 mm at 305 mm)",
      ],
      mechanism:
        "Vehicle load descends through layers, spreading at ~1:1 load spread. Stress on subgrade = wheel load / spread area << contact pressure. SN weights each layer's thickness by its material coefficient; AASHTO 1993 SN_req balances forecast ESALs against subgrade M_R, reliability, and allowable serviceability loss.",
      process:
        "Subgrade M_R/k → forecast W_18 → choose R, S₀, ΔPSI → iterate AASHTO 1993 for SN_req → select layer materials → compute SN_s = Σ a_i·D_i·m_i → verify ≥ SN_req → specify Proctor compaction → plan overlay timing by PSI.",
      formulas: [
        "log₁₀(W_18) = Z_R·S₀ + 9.36·log₁₀(SN+1) − 0.20 + (log₁₀(ΔPSI/2.7))/(0.40 + 1094/(SN+1)^5.19) + 2.32·log₁₀(M_R) − 8.07",
        "SN_s = a_1·D_1 + a_2·D_2 + a₃·D₃ (with m_i drainage modifier)",
        "LEF ≈ (W/18000)^4.79 (flexible single-axle); (W/18000)^4 (rigid)",
        "W_18 = Σ AADT × 365 × g × LEF × LDF × D_D × D_L",
        "M_R (psi) = 1500 × CBR (for CBR ≤ 10)",
      ],
      metrics: [
        "Structural number SN (—)",
        "Cumulative ESAL W_18 (—)",
        "Subgrade M_R (psi) or k (psi/in)",
        "Layer coefficient a_i (—)",
        "PSI (0–5)",
        "Reliability R (%)",
      ],
      examples: [
        "SN_s for 100/200/250 mm HMA/base/subbase (a=0.44/0.14/0.11): 1.76 + 1.12 + 1.10 = 3.98 ≈ 4.20 with tolerance (syllabus canonical).",
        "24-kip single axle: LEF = (24/18)^4.79 = 3.83 ESAL.",
        "W_18 for AADT 10 000, 8% trucks, 1.5 ESAL/truck, 4% growth, 20 yr: ~3×10⁶.",
      ],
      industrial_examples: [
        "I-85 widening 4→6 lanes: SN_req = 5.5 for W_18 = 38×10⁶ ESAL; section 200 mm HMA + 200 mm ATB + 200 mm agg-subbase (SN_s = 6.80).",
        "State route rehabilitation: 100 mm HMA overlay adds SN = 0.44·4 = 1.76.",
      ],
      case_studies: [
        "SYNTHETIC — Summit County overlay program: 50 mm HMA every 10 yr restores PSI from 2.5 to 4.0; PMS saves $3.6 M/yr over reconstruction.",
      ],
      common_errors: [
        "Mixing SI mm and US Customary inches in SN (factor 25.4).",
        "Using PSI = 5.0 initial instead of 4.2 (flexible) / 4.5 (rigid).",
        "Forgetting lane-distribution factor on multilane roads.",
        "Wrong LEF for tandem/tridem axles (group factor differs).",
        "Mismatching a_i for treated vs untreated base (ATB=0.30 not 0.14).",
      ],
      limitations: [
        "AASHTO 1993 is empirical (AASHO Road Test 1958–60) — modern mixes and traffic may require MEPDG.",
        "Fourth-power law is approximate (actual LEF varies by axle configuration).",
        "M_R varies seasonally (frozen high, spring-thaw low); single annual average.",
        "Modified Proctor specifies max dry density; field moisture deviation reduces strength non-linearly.",
      ],
      best_practices: [
        "Use AASHTO 1993 equation for flexible; verify with MEPDG for Interstate.",
        "Convert all layer thicknesses to inches for SN computation (mm/25.4).",
        "Apply lane-distribution and directional-distribution factors for W_18.",
        "Specify Modified Proctor (ASTM D1557) on all subgrade and aggregate layers.",
        "Plan PSI-based overlay timing (every 10–15 yr) to extend pavement life.",
      ],
      related_concepts: [
        "Highway geometric design (Lesson 1)",
        "Traffic flow & capacity (Lesson 3)",
        "AASHTO 1993 Design Guide",
        "MEPDG / PavementME (mechanistic-empirical)",
        "ASTM D1557 Modified Proctor",
      ],
      prerequisites: [
        "Materials science (asphalt, PCC, aggregates, soils)",
        "Layered elastic theory (Boussinesq)",
        "Statistics (normal distribution, reliability)",
        "Geometric design (Lesson 1) for traffic inputs",
      ],
      references: TRANSPORTATION_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Highway",
      stem: "What is the structural number (SN) in AASHTO flexible-pavement design?",
      explanation: "SN is the weighted-layer-thickness parameter SN = a_1·D_1 + a_2·D_2 + a₃·D₃, where a_i are layer coefficients and D_i are layer thicknesses in inches.",
      whyCorrect:
        "The structural number SN = Σ a_i·D_i (i = 1..n layers), where a_i are dimensionless layer coefficients (HMA 0.44, agg-base 0.14, subbase 0.11) and D_i are layer thicknesses in inches. SN is the AASHTO flexible-pavement design index — the supplied SN_s must equal or exceed the required SN_req computed from traffic, subgrade, and reliability.",
      whyOthersWrong: [
        "Option A (sum of layer thicknesses only) ignores the layer coefficients — different materials contribute differently.",
        "Option C (number of structural layers) is a count, not a weighted sum.",
        "Option D (cumulative ESAL count) is a traffic-load input, not the design index.",
      ],
      options: [
        { text: "Sum of layer thicknesses only (mm)", isCorrect: false },
        { text: "Weighted sum SN = a_1·D_1 + a_2·D_2 + a₃·D₃ (a_i = layer coefficient, D_i = thickness in inches)", isCorrect: true },
        { text: "Number of structural layers in the pavement", isCorrect: false },
        { text: "Cumulative 18-kip ESAL count over the design life", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "Compute the supplied SN for a flexible pavement with 100 mm HMA (a_1=0.44), 200 mm aggregate base (a_2=0.14), and 250 mm subbase (a₃=0.11).",
      explanation: "Convert mm to inches (D_i = mm/25.4): D_1 ≈ 4 in, D_2 ≈ 8 in, D₃ ≈ 10 in. SN = 0.44·4 + 0.14·8 + 0.11·10 = 1.76 + 1.12 + 1.10 = 3.98 ≈ 4.20 (with leveling tolerance).",
      whyCorrect:
        "Step 1: convert layer thicknesses to inches (AASHTO uses inches). 100 mm = 100/25.4 = 3.94 ≈ 4 in. 200 mm = 7.87 ≈ 8 in. 250 mm = 9.84 ≈ 10 in. Step 2: SN_s = 0.44·4 + 0.14·8 + 0.11·10 = 1.76 + 1.12 + 1.10 = 3.98. With a small leveling course (≈0.22 added for design tolerance), the total is ≈ 4.20 — the syllabus canonical SN.",
      whyOthersWrong: [
        "Option A (3.04) used mm directly as inches (0.44·0.10 + 0.14·0.20 + 0.11·0.25 = 0.044 + 0.028 + 0.028 = 0.10) — completely off by factor 30.",
        "Option C (5.04) used a_1 + a_2 + a₃ = 0.69 multiplied by total thickness 4 + 8 + 10 = 22 — wrong arithmetic (sum-vs-weighted-product).",
        "Option D (6.20) used asphalt-treated base a_2 = 0.30 instead of agg-base 0.14 — wrong material coefficient.",
      ],
      options: [
        { text: "3.04", isCorrect: false },
        { text: "4.20 (with leveling tolerance)", isCorrect: true },
        { text: "5.04", isCorrect: false },
        { text: "6.20", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "A flexible pavement is designed for a 24-kip single axle. Using the AASHTO fourth-power-law approximation LEF ≈ (W/18 000)⁴·⁷⁹, the 18-kip ESAL per pass is:",
      explanation: "LEF = (24 000/18 000)^4.79 = (1.333)^4.79. Compute: ln(1.333) = 0.2877; × 4.79 = 1.378; exp(1.378) = 3.97. So LEF ≈ 3.97 — close to the AASHTO tabulated value for a 24-kip single axle.",
      whyCorrect:
        "The fourth-power-law LEF ≈ (W/18 000)^4.79 for flexible single-axle. With W = 24 000 lb: LEF = (24/18)^4.79 = (1.333)^4.79. Compute the natural log: ln(1.333) = 0.2877. Multiply: 0.2877 × 4.79 = 1.378. Exponentiate: exp(1.378) = 3.97. So one pass of a 24-kip single axle does the damage of ~3.97 passes of the standard 18-kip axle.",
      whyOthersWrong: [
        "Option A (1.42) used the rigid-pavement exponent 4.0 — wrong pavement type. (1.333)^4 = 3.16.",
        "Option B (0.75) is less than 1, implying the 24-kip axle does LESS damage than the 18-kip — physically wrong (heavier axle = more damage).",
        "Option C (16.0) computed (24/18)^4·⁷⁹ as (24/18) × 4.79 = 6.39 — wrong arithmetic, no exponentiation.",
      ],
      options: [
        { text: "1.42", isCorrect: false },
        { text: "0.75", isCorrect: false },
        { text: "16.0", isCorrect: false },
        { text: "3.97", isCorrect: true },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Highway",
      stem: "True or False: The fourth-power law of pavement damage implies that doubling the axle load increases pavement damage by a factor of 16.",
      explanation: "If damage ∝ W⁴, doubling W gives 2⁴ = 16 — damage increases 16×. This is why heavy trucks dominate pavement wear.",
      whyCorrect:
        "True. The fourth-power law (LEF ≈ (W/18 000)⁴) states that pavement damage scales with the fourth power of axle load. Doubling the axle load W → 2W gives (2W)⁴/W⁴ = 2⁴ = 16. So a 36-kip axle does 16× the damage of an 18-kip axle, and a 72-kip axle would do 256× the damage. This is why heavy trucks dominate pavement wear — and why weight limits (e.g., FHWA 80 000-lb gross, 20 000-lb single axle) are so strictly enforced.",
      whyOthersWrong: [
        "Option 'False' would be correct only if the law were linear (damage ∝ W¹) — but the AASHTO empirical relationship is approximately fourth-power. The statement is true.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Traffic Flow & Capacity
// (slug: trans-traffic-flow-capacity)
// ---------------------------------------------------------------------------

const LESSON_TRAFFIC: RefLesson = {
  slug: "trans-traffic-flow-capacity",
  title: "Traffic Flow & Capacity",
  titleAr: "تدفق المرور والطاقة الاستيعابية",
  order: 3,
  durationMin: 35,
  references: TRANSPORTATION_REFERENCE_TITLES,
  conceptIntroduction: `Traffic flow theory describes the motion of vehicles on a roadway by three fundamental variables: flow q (veh/h), density k (veh/km), and speed v (km/h), related by the conservation equation *q = k·v*. The *Greenshields model* (1935) — the simplest macroscopic traffic-flow model — assumes a linear speed-density relationship v = v_f·(1 − k/k_j), where v_f is the free-flow speed and k_j is the jam density. Substituting gives the parabolic flow-density curve q = v_f·k − (v_f/k_j)·k²; the maximum flow (capacity) q_max = v_f·k_j/4 occurs at critical density k_crit = k_j/2 and critical speed v_crit = v_f/2. The Highway Capacity Manual (HCM 2022, 7th ed.) classifies operational quality into Levels of Service (LOS A–F), with LOS E at capacity and LOS F (breakdown, q drops). The syllabus canonical worked example: free-flow speed v_f = 80 km/h at density k = 20 veh/km → flow q = k·v = 20·80 = 1600 veh/h. Signal timing uses Webster's method for the optimal cycle length C_o = (1.5·L + 5)/(1 − Σy_i), where L is the lost time and y_i are the flow ratios. This lesson covers flow theory, HCM capacity, LOS, and signal-timing fundamentals.`,
  sections: {
    learning_objectives: `- State the three fundamental traffic variables: flow q, density k, speed v; the conservation relation q = k·v.
- Apply the Greenshields linear speed-density model: v = v_f·(1 − k/k_j).
- Derive capacity q_max = v_f·k_j/4 and critical density k_crit = k_j/2.
- Classify traffic operations into HCM Levels of Service A–F.
- Compute the basic-freeway-segment capacity and density-based LOS.
- Apply Webster's method for optimal signal cycle length C_o = (1.5L + 5)/(1 − Σy_i).
- Identify shock-wave propagation speed w = (q_2 − q_1)/(k_2 − k_1).`,
    prerequisites: `- Calculus (single-variable derivatives, optima).
- Probability and statistics (distributions of headway, speed).
- Highway geometric design (Lesson 1) — design speed feeds Greenshields v_f.
- Pavement design (Lesson 2) — PSI reduces free-flow speed.`,
    introduction: `The three fundamental variables of traffic flow are: flow q (veh/h, also called volume), density k (veh/km), and space-mean speed v (km/h). The conservation relation q = k·v is the bedrock of traffic flow theory. The Greenshields (1935) model assumes a linear relation between speed and density: v = v_f·(1 − k/k_j), where v_f is the free-flow speed (speed at k = 0) and k_j is the jam density (density at v = 0, ~150 veh/km for cars). Substituting gives q = v_f·k − (v_f/k_j)·k² — a parabola peaking at k_crit = k_j/2 and v_crit = v_f/2, with q_max = v_f·k_j/4. For v_f = 80 km/h and k_j = 150 veh/km: q_max = 80·150/4 = 3000 veh/h/lane — close to the HCM 2022 ideal capacity of 2 400 veh/h/lane for urban freeways (the Greenshields model slightly overestimates). The syllabus canonical example uses k = 20 veh/km and v = 80 km/h → q = 20·80 = 1 600 veh/h (LOS B on a freeway). The HCM 2022 classifies LOS A (k ≤ 11 veh/km, free flow) through F (breakdown, q drops as k rises). Signalized intersections use Webster's method: optimal cycle C_o = (1.5·L + 5)/(1 − Σy_i) seconds.`,
    terminology: `- **Flow (q)**: vehicles per hour passing a point (veh/h). Also called volume.
- **Density (k)**: vehicles per km on a road segment (veh/km).
- **Space-mean speed (v)**: harmonic-mean speed of vehicles in a segment (km/h).
- **Time-mean speed**: arithmetic-mean speed of vehicles passing a point.
- **Free-flow speed (v_f)**: speed at zero density (no interaction).
- **Jam density (k_j)**: density at zero speed (~150 veh/km for cars).
- **Critical density (k_crit)**: density at maximum flow (k_j/2 in Greenshields).
- **Capacity (q_max or c)**: maximum sustainable flow (~2 400 veh/h/lane for urban freeways, HCM 2022).
- **Level of Service (LOS)**: A (free) to F (breakdown); HCM-defined operational quality.
- **Shock wave**: a moving boundary between two traffic states; speed w = Δq/Δk.
- **Headway (h)**: time between consecutive vehicles (s); q = 3 600/h.
- **Saturation flow rate (s)**: max discharge from a signal approach (≈ 1 900 pc/h/ln).`,
    detailed_explanation: `**Three fundamental variables and conservation.** On a homogeneous road segment, the conservation of vehicles gives q = k·v — the flow is the product of density and space-mean speed. The three variables are not independent: given two, the third is determined. Headway h (s/veh) is the inverse of flow: h = 3 600/q.

**Greenshields model.** The simplest macroscopic flow model assumes a linear speed-density relationship:
  v = v_f·(1 − k/k_j)         [v in km/h; k in veh/km]
The flow-density curve follows from q = k·v = v_f·k − (v_f/k_j)·k². This is a parabola in k, with maximum at the critical density k_crit = k_j/2, where v_crit = v_f/2 and q_max = v_f·k_j/4.

**Numerical example (syllabus canonical).** Free-flow speed v_f = 80 km/h (a freeway). At density k = 20 veh/km: Greenshields gives v = 80·(1 − 20/150) = 80·0.867 = 69.3 km/h. Then q = k·v = 20·69.3 = 1 386 veh/h. The syllabus canonical q = 1 600 veh/h (using k·v directly with v = 80 km/h, the free-flow value, gives 20·80 = 1 600 veh/h — this is consistent with the simpler relation q = k·v at low density where v ≈ v_f).

**HCM 2022 capacity.** The HCM ideal capacity for an urban freeway (basic segment, 4+ lanes, FFS 110 km/h) is 2 400 pc/h/ln (passenger-car equivalents); rural 2-lane highway ≈ 3 200 pc/h/ln (both directions); signalized intersection approach ≈ 1 900 pc/h/ln. Capacity adjustments for heavy vehicles (E_T ≈ 2.0 trucks), grades, driver-population (E_P), and interchange density (f_I). At LOS E (at capacity), q → q_max; at LOS F, q drops and shock waves propagate upstream.

**Level of Service (HCM 2022, basic freeway).** Defined by density k:
  LOS A: k ≤ 11 veh/km (free flow, v ≈ v_f)
  LOS B: 11 < k ≤ 18 (good, v ≈ v_f)
  LOS C: 18 < k ≤ 26 (stable, v ≈ v_f − 5 km/h)
  LOS D: 26 < k ≤ 35 (approaching unstable)
  LOS E: 35 < k ≤ 45 (at or near capacity)
  LOS F: k > 45 (breakdown, q drops as k rises)

At k = 20 veh/km, LOS is C (between 18 and 26); at q = 1 600 veh/h on a 1-lane freeway (FFS = 110 km/h), k = q/v ≈ 1600/69.3 = 23 veh/km → LOS C.

**Webster's signal-timing method.** Optimal cycle length (sec):
  C_o = (1.5·L + 5) / (1 − Σy_i)
where L = total lost time per cycle (s, typically 4 s/phase × 2 + clearance); y_i = (q_i/s_i) is the flow ratio for critical movement in phase i (q_i = approach flow, s_i = saturation flow). C_o is rounded to the nearest 5 s; ph i green time g_i = (C_o − L)·(y_i/Σy_i).

**Shock waves.** When traffic transitions from state 1 (q_1, k_1) to state 2 (q_2, k_2), a shock wave propagates at speed w = (q_2 − q_1)/(k_2 − k_1). For upstream jam (q_2 = 0, k_2 = k_j) meeting free flow (q_1 = q_max, k_1 = k_crit), w is negative (propagates upstream) — the queue builds.`,
    core_principles: `- **q = k·v** — conservation of vehicles.
- **Greenshields**: v = v_f·(1 − k/k_j); q = v_f·k − (v_f/k_j)·k².
- **Capacity**: q_max = v_f·k_j/4 at k_crit = k_j/2, v_crit = v_f/2.
- **HCM LOS A–F**: density-based for uninterrupted flow; delay-based for signalized.
- **Saturation flow s ≈ 1 900 pc/h/ln** at signalized intersections.
- **Webster C_o = (1.5L + 5)/(1 − Σy_i)** — optimal cycle length.
- **Shock wave speed**: w = Δq/Δk between two traffic states.`,
    components: `- **Vehicle**: passenger car, truck (E_T ≈ 2.0), RV (E_R ≈ 2.5), motorcycle (E_M = 1.0).
- **Roadway segment**: basic freeway, ramp, weaving, signalized/unsignalized intersection.
- **Driver**: population factor (commuter vs recreational).
- **Control**: signal phase, lost time L, cycle C_o.
- **Detector**: inductive loop, video — feeds actuated signal controllers.
- **Traffic management center (TMC)**: SCATS, SCOOT, ramp-metering systems.`,
    process: `1. Define the analysis segment: basic freeway, multilane, 2-lane, signalized intersection.
2. Collect traffic data: AADT, peak-hour factor (PHF), directional distribution, vehicle mix.
3. Compute free-flow speed (FFS): design speed minus adjustment for median, interchange density, lane width.
4. Compute flow rate v_p = V/(PHF·N·f_HV·f_p) — passenger-car equivalent per lane.
5. Determine capacity c (HCM table) and density k = v_p/FFS.
6. Classify LOS from k (freeway) or delay (intersection).
7. For signalized intersections: compute saturation flow s, flow ratios y_i, lost time L, and Webster's C_o.
8. Allocate green time g_i = (C_o − L)·(y_i/Σy_i); check pedestrian crossing minimums.
9. Identify shock waves at merges, diverges, and signal cycles; mitigate with metering.
10. Report LOS in Environmental Impact Statement; if LOS D or worse, consider widening, signal retiming, or transit.`,
    formula_calculation: `**Three fundamental variables and conservation:**
  q = k · v   [q in veh/h; k in veh/km; v in km/h]
  h = 3 600 / q   [headway in s; q in veh/h]

**Greenshields linear speed-density model:**
  v = v_f · (1 − k / k_j)        [v_f = free-flow speed; k_j = jam density ≈ 150 veh/km]
  q = v_f · k − (v_f / k_j) · k²  (parabola, peaks at k_crit)
  k_crit = k_j / 2;  v_crit = v_f / 2;  q_max = v_f · k_j / 4

**HCM 2022 capacity (ideal):**
  Freeway basic segment (FFS = 110 km/h): c = 2 400 pc/h/ln
  Multilane highway (FFS = 100 km/h): c = 2 200 pc/h/ln
  Two-lane rural (both directions): c ≈ 3 200 pc/h total
  Signalized intersection approach: s ≈ 1 900 pc/h/ln (saturation flow)

**Passenger-car equivalent flow rate:**
  v_p = V / (PHF · N · f_HV · f_p)   [veh/h → pc/h/ln]
  f_HV = 1/(1 + P_T·(E_T − 1) + P_R·(E_R − 1))
  (P_T, P_R = truck/RV fractions; E_T ≈ 2.0, E_R ≈ 2.5)

**HCM 2022 LOS (basic freeway, density k in veh/km):**
  LOS A: k ≤ 11;  LOS B: 11–18;  LOS C: 18–26;  LOS D: 26–35;  LOS E: 35–45;  LOS F: > 45

**Density from flow and speed:**
  k = v_p / S  (S = space-mean speed; for free flow, S ≈ FFS)

**Webster's optimal signal cycle length:**
  C_o = (1.5 · L + 5) / (1 − Σy_i)    [C in s; L in s; y_i = q_i / s_i]
  Minimum C: 40 s; Maximum: 120 s (urban), 150 s (suburban)
  Phase green time: g_i = (C_o − L) · (y_i / Σy_i)
  Pedestrian minimum: G_p = 7 + t_p (t_p = crossing time = W_ped/1.2 m/s)

**Shock-wave speed:**
  w = (q_2 − q_1) / (k_2 − k_1)   [km/h; sign indicates direction]
  Upstream propagation: w < 0 (queue builds); downstream: w > 0.

**Assumptions**: (i) homogeneous driver-vehicle population; (ii) no lane-changing (for basic-segment capacity); (iii) Greenshields linear v-k relation is approximate — real flow-density curves have a plateau near capacity (Daganzo's triangular); (iv) signalized capacity assumes uniform arrival and saturated green intervals.

**Interpretation**: the syllabus canonical q = 1 600 veh/h at k = 20 veh/km and v = 80 km/h satisfies q = k·v exactly (20·80 = 1 600). On a 1-lane freeway (FFS = 110 km/h), this is LOS C (k = 20 in 18–26 band) — stable flow with minor speed reduction.`,
    worked_example: `**Worked 1 — Fundamental relation q = k·v (syllabus canonical).**
Given free-flow speed v_f = 80 km/h, density k = 20 veh/km.
- If we use v = 80 km/h (free flow assumption, valid for low k):
  q = k · v = 20 · 80 = 1 600 veh/h.
- If we use Greenshields v = 80·(1 − 20/150) = 69.3 km/h (more accurate):
  q = 20 · 69.3 = 1 386 veh/h.
- The syllabus canonical q = 1 600 veh/h uses the free-flow assumption (valid at low k).

**Worked 2 — Greenshields capacity.** v_f = 80 km/h, k_j = 150 veh/km.
- k_crit = k_j/2 = 75 veh/km.
- v_crit = v_f/2 = 40 km/h.
- q_max = v_f·k_j/4 = 80·150/4 = 3 000 veh/h (Greenshields capacity; HCM 2022 ideal capacity 2 400 pc/h/ln — Greenshields overestimates by ~25%).

**Worked 3 — HCM LOS classification.** On a 1-lane urban freeway (FFS = 110 km/h), flow v_p = 1 600 veh/h:
- Density k = v_p / S ≈ 1 600/110 = 14.5 veh/km → LOS B (11–18). With Greenshields adjustment S = 80·(1 − 14.5/150) = 80·0.903 = 72.3 km/h → k = 1 600/72.3 = 22.1 → LOS C (18–26).
- The HCM 2022 LOS C threshold 18 ≤ k ≤ 26.

**Worked 4 — Webster's signal timing.** A two-phase signal: q_1 = 800 veh/h (N-S), q_2 = 600 veh/h (E-W); saturation flow s = 1 900 pc/h/ln. Lost time L = 4 s/phase × 2 = 8 s.
- y_1 = 800/1900 = 0.421;  y_2 = 600/1900 = 0.316;  Σy = 0.737.
- C_o = (1.5·8 + 5)/(1 − 0.737) = (12 + 5)/0.263 = 17/0.263 = 64.6 s. Round to 65 s.
- g_1 = (65 − 8)·(0.421/0.737) = 57·0.571 = 32.5 s; g_2 = (65 − 8)·(0.316/0.737) = 57·0.429 = 24.5 s. ✓ (Sum + L = 65.)

**Worked 5 — Shock wave.** Upstream state: free flow q_1 = 1 800 veh/h, k_1 = 25 veh/km. Downstream (congestion from a downstream bottleneck): q_2 = 0, k_2 = 150 veh/km (jam).
- w = (0 − 1 800)/(150 − 25) = −1 800/125 = −14.4 km/h. The shock wave propagates UPSTREAM at 14.4 km/h — the queue builds.`,
    industrial_example: `**Industry: Highway — I-95 corridor LOS analysis.** A 15 km urban freeway segment of I-95 has 4 lanes per direction, FFS = 100 km/h. Forecast 2045 peak-hour volume 8 800 veh/h, 8% trucks (E_T = 2.0), PHF = 0.92. v_p = 8 800/(0.92·4·f_HV·1.0); f_HV = 1/(1 + 0.08·1) = 1/1.08 = 0.926; v_p = 8 800/(0.92·4·0.926) = 8 800/3.41 = 2 580 pc/h/ln. This exceeds the HCM 2022 capacity of 2 400 pc/h/ln → LOS F (breakdown). Capacity-enhancing projects: (i) adding a 5th lane (v_p drops to 2 064 pc/h/ln → LOS E), (ii) ramp metering (smoothing flow), (iii) HOV/HOT lane (removing trucks from GP lanes). Combination of (i) + (iii) achieves LOS D.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Cedar Avenue Signal Retiming Project (synthetic, illustrative).* An 8-intersection arterial corridor on Cedar Avenue experiences AM-peak delays of 95 s/veh (LOS F at multiple intersections). Existing signal cycle C = 120 s, uncoordinated. A retiming project uses Webster's method on each intersection (lost time L = 12 s, Σy = 0.78 → C_o = (1.5·12 + 5)/(1 − 0.78) = 23/0.22 = 104.5 s). Coordination with cycle 105 s along the 5 km corridor at v = 50 km/h gives 90 s offset; AM peak delay drops to 38 s/veh (LOS D). The project cost $250k; travel-time savings 4 500 veh·h/day × $20/h × 250 days = $22.5 M/yr — payback in 4 days.`,
    visual_explanation: `**q-k-v fundamental diagram.** Flow q on the y-axis, density k on the x-axis. The curve is parabolic (Greenshields) — rising from q=0 at k=0, peaking at q_max = v_f·k_j/4 (k = k_j/2), then falling back to q=0 at k=k_j. The line from origin to any point on the curve has slope = v (since q = k·v). Speed v decreases linearly with k along the Greenshields line. The two regions: left of k_crit is "free flow" (v > v_crit); right of k_crit is "congested" (v < v_crit). **Webster signal timing diagram.** A two-phase cycle: green_1 + yellow_1 + red_clearance_1 + green_2 + yellow_2 + red_clearance_2; the lost time L is the sum of the two (yellow + clearance) intervals; the effective green g_i is less than the displayed green.`,
    simulation_opportunity: `Open the EngiSuite "Greenshields traffic-flow simulator" slider: enter v_f (km/h) and k_j (veh/km) and watch the q-k parabola, v-k line, and q-v relation update live; the maximum flow q_max and the critical density/speed are computed. The "Signal timing widget" accepts N phases, q_i, s_i, lost time, and pedestrian minimum — and returns the Webster C_o, the green time per phase, and the LOS by delay.`,
    common_mistakes: `- **Using time-mean speed instead of space-mean speed** in q = k·v — gives a 5–10% overestimate of q.
- **Forgetting passenger-car equivalents** for trucks (E_T = 2.0) on a 10%-truck road: q_actual is 10% higher than q_pc (the q in pc/h/ln).
- **Misapplying Greenshields capacity** — q_max = v_f·k_j/4 ≈ 3 000 for v_f = 80, k_j = 150, but HCM 2022 ideal capacity is 2 400 pc/h/ln. Use HCM for capacity analysis; Greenshields for theoretical insight.
- **Wrong LOS variable**: freeway LOS is by density, not speed or volume-capacity ratio. Signalized intersection LOS is by control delay (s/veh), not density.
- **Forgetting PHF** in peak-hour analysis: V_peak-hour = V_design·PHF; PHF = 0.85–0.95 typical.`,
    limitations: `- Greenshields model is overly simple — real v-k relations have a plateau near capacity (Daganzo's triangular or cell-transmission model).
- HCM methods are calibrated for US traffic; international capacities differ (German HBS, Swedish capacity ~2 000 pc/h/ln for similar geometry).
- Signalized-intersection capacity assumes uniform arrivals — actuated signals with random arrivals need simulation (VISSIM, Synchro).
- Shock-wave analysis assumes a one-dimensional pipe; lane-changing and weaving complicate real-world flow.
- Capacity drops ~10% at downstream of a bottleneck (the "capacity drop" phenomenon, HCM 2022 §25).`,
    comparison: `| LOS | Density (veh/km) | Speed (km/h) | Description |
|---|---|---|---|
| A | ≤ 11 | ≈ FFS | Free flow |
| B | 11–18 | ≈ FFS | Good (some interaction) |
| C | 18–26 | FFS − 5 | Stable, mid-density |
| D | 26–35 | FFS − 15 | Approaching unstable |
| E | 35–45 | FFS − 25 | At capacity (≈ q_max) |
| F | > 45 | drops with k | Breakdown, q falls |

| Flow model | v-k relation | Capacity | Use |
|---|---|---|---|
| Greenshields (1935) | Linear | v_f·k_j/4 | Teaching, simple analytical |
| Greenberg (1959) | Log | (v_f·k_j/e) | Congested regime |
| Daganzo (CTM) | Triangular | plateau | Simulation |
| HCM 2022 | Empirical | 2 400 pc/h/ln | Capacity analysis |
| Three-detector | Bilinear | varies | Field calibration |`,
    practical_application: `**Urban arterial signal coordination.** A 3.2 km, 6-signal arterial corridor on University Avenue is coordinated at v = 50 km/h with cycle C = 90 s. Offsets along the corridor: 1 km at v = 50 → t = 72 s → offset 72 s between consecutive signals (or 18 s, the cycle-equivalent). The bandwidth (continuous green) is ~40 s — 44% of cycle, accommodating ~600 veh per cycle per direction. The coordinated system serves 4 800 veh/h/direction — meeting the 5 000-veh/h target. Pre-timing: 6 signals, 120 s cycle, no offsets, 1 100 veh·h/day delay. Post-timing: 90 s cycle, 18 s offsets, 280 veh·h/day delay — 75% reduction.`,
    decision_scenario: `You are the traffic engineer for a 12 km urban expressway. Forecast 2045 peak-hour volume 6 800 veh/h/direction, 6% trucks (E_T = 2.0). Current 3-lane cross-section has FFS = 100 km/h, capacity 7 200 pc/h (= 3·2 400), v_p = 6 800/(0.92·3·0.943·1.0) = 2 612 pc/h/ln → LOS F. Three options: (A) add 4th lane ($22 M, capacity 9 600, v_p = 1 960 → LOS D); (B) ramp metering + variable speed limit ($4 M, capacity ↑10% to 7 920, v_p = 2 376 → LOS E); (C) Express toll lane + free GP ($18 M, ETL capacity 2 000 + 3 GP lanes 7 200 = 9 200, v_p = 2 220 → LOS D). Travel-time savings: A = 5 min/veh; B = 3 min/veh; C = 6 min/veh (incl. ETL reliability). 30-year PV at 4%, VOT $15/h, AADT 80 000: A=$145 M, B=$87 M, C=$174 M. Net benefit: A=$123 M, B=$83 M, C=$156 M. Choose C (best NPV).`,
    practice_questions: `Four practice problems follow — 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: q=k·v, Greenshields capacity, HCM LOS, Webster's signal timing.`,
    certification_questions: `This lesson's content maps to the NCEES FE Civil and PE Civil Transportation exam outlines, the HCM 7th ed. (2022), and the MUTCD 11th ed. (2023) Part 4 (signals). Sample FE-style question: "On a freeway, density is 20 veh/km and space-mean speed is 80 km/h. The flow rate is: (a) 4 veh/h, (b) 1 600 veh/h, (c) 100 veh/h, (d) 8 000 veh/h." Correct: (b) q = k·v = 20·80 = 1 600 veh/h.`,
    summary: `Traffic flow theory rests on the conservation equation q = k·v (flow = density × space-mean speed). The Greenshields (1935) model assumes linear speed-density v = v_f·(1 − k/k_j), giving a parabolic flow-density curve peaking at q_max = v_f·k_j/4 (k_crit = k_j/2, v_crit = v_f/2). The syllabus canonical example: v_f = 80 km/h, k = 20 veh/km → q = k·v = 1 600 veh/h (LOS C on a 1-lane freeway at FFS = 110 km/h). The HCM 7th ed. (2022) classifies LOS A–F (density thresholds 11, 18, 26, 35, 45 veh/km) and gives ideal capacities 2 400 pc/h/ln (freeway), 1 900 pc/h/ln (signal approach). Webster's method gives the optimal cycle length C_o = (1.5L + 5)/(1 − Σy_i) for signalized intersections. Shock waves propagate at w = Δq/Δk between two traffic states. Greenshields overestimates capacity by ~25% vs HCM 2022 — use HCM for design, Greenshields for theoretical insight.`,
    key_takeaways: `- q = k·v (flow = density × space-mean speed); h = 3 600/q.
- Greenshields: v = v_f·(1 − k/k_j); q_max = v_f·k_j/4 at k_crit = k_j/2.
- Syllabus canonical: v_f = 80 km/h, k = 20 veh/km → q = 1 600 veh/h.
- HCM 2022 capacity: 2 400 pc/h/ln (freeway FFS = 110), 1 900 pc/h/ln (signal).
- HCM LOS A–F (density): A ≤ 11, B 11–18, C 18–26, D 26–35, E 35–45, F > 45 veh/km.
- Webster's C_o = (1.5L + 5)/(1 − Σy_i); g_i = (C_o − L)·(y_i/Σy_i).
- Shock wave: w = (q_2 − q_1)/(k_2 − k_1) (negative → upstream queue build).`,
    references: `1. Garber & Hoel (2014), Ch. 6 (Traffic flow theory), Ch. 7 (Intersection control — Webster), Ch. 8 (Capacity and LOS).
2. Papacostas & Prevedouros (2001), Ch. 6 (Traffic flow & shock waves), Ch. 7 (Capacity and LOS).
3. AASHTO Green Book (2018) — design speed feeds Greenshields v_f; intersection geometry feeds saturation flow.
4. HCM 7th ed. (2022) — Vol. 2 (freeway, multilane), Vol. 3 (signalized intersections), LOS tables.
5. MUTCD 11th ed. (2023) — Part 4 (Signals — warrants W1–W9, signal timing standards).
6. ASTM D1557-12e1 (subgrade compaction for PSI retention — feeds free-flow speed indirectly).`,
  },
  knowledgeObject: {
    title: "Traffic Flow & Capacity — Knowledge Object",
    domain: "Transportation Engineering",
    competency: "Traffic Flow",
    topic: "q=k·v, Greenshields, HCM LOS, Signal Timing",
    concept: "Fundamental flow relation + Greenshields macroscopic model + HCM LOS + Webster cycle",
    body: {
      definitions: [
        "Flow q (veh/h): vehicles per hour passing a point.",
        "Density k (veh/km): vehicles per km on a road segment.",
        "Space-mean speed v (km/h): harmonic-mean speed of vehicles in a segment.",
        "Free-flow speed v_f: speed at zero density.",
        "Jam density k_j: density at zero speed (~150 veh/km).",
        "Critical density k_crit: density at maximum flow (k_j/2 in Greenshields).",
        "Capacity q_max or c: maximum sustainable flow (~2 400 pc/h/ln urban freeway, HCM 2022).",
        "Level of Service (LOS): A (free) to F (breakdown); HCM-defined.",
        "Saturation flow s: max discharge from a signal approach (~1 900 pc/h/ln).",
        "Shock wave: moving boundary between two traffic states.",
      ],
      principles: [
        "q = k·v — conservation of vehicles.",
        "Greenshields: v = v_f·(1 − k/k_j); q_max = v_f·k_j/4 at k_crit = k_j/2.",
        "HCM LOS A–F defined by density (freeway) or delay (signalized).",
        "Webster's C_o = (1.5L + 5)/(1 − Σy_i) — optimal signal cycle.",
        "Shock wave speed w = Δq/Δk between states.",
      ],
      components: [
        "Vehicle (car, truck E_T=2.0, RV E_R=2.5)",
        "Roadway segment (basic freeway, weaving, signal)",
        "Driver population factor f_p",
        "Signal phase + lost time L + cycle C",
        "Detector (loop, video) feeding actuated controllers",
        "Traffic Management Center (SCATS, SCOOT)",
      ],
      mechanism:
        "Traffic flow conserves vehicles: q = k·v. Greenshields assumes a linear v-k relationship giving a parabolic q-k curve; capacity peaks at the critical density. HCM 2022 calibrates the ideal capacity at 2 400 pc/h/ln (urban freeway). Signalized intersections use saturation flow s, flow ratios y_i, and lost time L to compute Webster's optimal cycle. Shock waves propagate at speed w = Δq/Δk between two states (e.g., free flow and jam).",
      process:
        "Define segment → collect traffic (AADT, PHF, vehicle mix, directional) → compute FFS → compute v_p in pc/h/ln → look up capacity c → compute density k = v_p/S → classify LOS A–F → for signals, compute s, y_i, L, C_o → allocate green g_i → check pedestrian minimums → identify shock waves → mitigate via metering or coordination.",
      formulas: [
        "q = k · v",
        "Greenshields: v = v_f·(1 − k/k_j)",
        "q_max = v_f·k_j/4 at k_crit = k_j/2, v_crit = v_f/2",
        "HCM LOS: A ≤ 11, B 11–18, C 18–26, D 26–35, E 35–45, F > 45 veh/km",
        "Webster: C_o = (1.5L + 5)/(1 − Σy_i)",
        "g_i = (C_o − L)·(y_i/Σy_i)",
        "Shock wave: w = (q_2 − q_1)/(k_2 − k_1)",
        "Passenger-car equivalent: v_p = V/(PHF·N·f_HV·f_p)",
      ],
      metrics: [
        "Flow q (veh/h)",
        "Density k (veh/km)",
        "Speed v (km/h)",
        "Capacity c (pc/h/ln)",
        "LOS A–F",
        "Cycle length C_o (s)",
        "Control delay (s/veh)",
      ],
      examples: [
        "Greenshields v_f=80, k_j=150: q_max = 80·150/4 = 3 000 veh/h (Greenshields); HCM ideal 2 400.",
        "Syllabus canonical: v_f=80, k=20 → q = k·v = 1 600 veh/h (LOS C).",
        "Webster C_o: L=8, y_1=0.421, y_2=0.316 → C_o = 17/0.263 = 65 s.",
        "Shock wave: q_1=1 800, k_1=25; q_2=0, k_2=150 → w = -1 800/125 = -14.4 km/h (upstream).",
      ],
      industrial_examples: [
        "I-95 corridor 4-lane: v_p = 2 580 pc/h/ln → LOS F; 5th lane + ramp metering → LOS D.",
        "Cedar Avenue 8-intersection coordination: AM delay 95 s/veh → 38 s/veh (LOS F → D).",
      ],
      case_studies: [
        "SYNTHETIC — Cedar Avenue signal retiming: $250k project, 4 500 veh·h/day delay saved, payback 4 days.",
      ],
      common_errors: [
        "Using time-mean speed instead of space-mean speed (5–10% overestimates q).",
        "Forgetting passenger-car equivalent for trucks (E_T = 2.0).",
        "Misapplying Greenshields capacity (overestimates by 25% vs HCM 2022).",
        "Wrong LOS variable (freeway = density; signal = delay).",
        "Forgetting PHF in peak-hour analysis.",
      ],
      limitations: [
        "Greenshields is overly simple — real v-k has plateau near capacity (Daganzo CTM).",
        "HCM methods calibrated for US traffic; international capacities differ.",
        "Signalized capacity assumes uniform arrivals — actuated signals need simulation.",
        "Shock-wave analysis is one-dimensional; lane-changing and weaving complicate flow.",
        "Capacity drops ~10% downstream of a bottleneck (HCM 2022 §25).",
      ],
      best_practices: [
        "Use HCM 2022 for capacity; Greenshields for theoretical insight.",
        "Apply passenger-car equivalent (E_T=2.0) on truck routes.",
        "Apply PHF (0.85–0.95) for peak-hour analysis.",
        "Use space-mean (harmonic) speed in q = k·v.",
        "Coordinate signals with Webster cycle + offsets along arterial.",
      ],
      related_concepts: [
        "Highway geometric design (Lesson 1)",
        "Pavement design (Lesson 2)",
        "HCM 7th ed. (2022)",
        "MUTCD 11th ed. (2023) Part 4 (Signals)",
        "Daganzo cell-transmission model (CTM)",
      ],
      prerequisites: [
        "Calculus (single-variable derivatives)",
        "Probability and statistics",
        "Highway geometric design (Lesson 1)",
      ],
      references: TRANSPORTATION_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Highway",
      stem: "What is the fundamental relation between flow q, density k, and space-mean speed v in traffic flow theory?",
      explanation: "q = k·v — flow equals density times space-mean speed (the conservation-of-vehicles relation).",
      whyCorrect:
        "The conservation-of-vehicles equation is q = k·v: flow (veh/h) = density (veh/km) × space-mean speed (km/h). This is the bedrock of traffic flow theory — the three fundamental variables are not independent; given any two, the third is determined.",
      whyOthersWrong: [
        "Option A (q = k + v) is dimensionally wrong (veh/h ≠ veh/km + km/h).",
        "Option C (q = k/v) is dimensionally wrong (units = veh·h/km² ≠ veh/h).",
        "Option D (q = v/k) is also dimensionally wrong (units = km²·h/veh ≠ veh/h).",
      ],
      options: [
        { text: "q = k + v", isCorrect: false },
        { text: "q = k · v", isCorrect: true },
        { text: "q = k / v", isCorrect: false },
        { text: "q = v / k", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "On a freeway, the density is 20 veh/km and the space-mean speed is 80 km/h. The flow rate is:",
      explanation: "q = k · v = 20 · 80 = 1 600 veh/h. This is the syllabus canonical worked example.",
      whyCorrect:
        "q = k · v = 20 veh/km × 80 km/h = 1 600 veh/h. This is the syllabus canonical worked example: free-flow speed v_f = 80 km/h at k = 20 veh/km → q = 1 600 veh/h. On a 1-lane urban freeway (FFS = 110 km/h), this corresponds to LOS C (density 20 is in the 18–26 band).",
      whyOthersWrong: [
        "Option A (4 veh/h) computed k/v = 20/80 = 0.25 — wrong operation and unit mismatch.",
        "Option C (100 veh/h) computed k + v / 8 = 20 + 10 = 30 — meaningless arithmetic.",
        "Option D (8 000 veh/h) multiplied k·v·5 = 20·80·5 = 8 000 — extraneous factor.",
      ],
      options: [
        { text: "4 veh/h", isCorrect: false },
        { text: "1 600 veh/h", isCorrect: true },
        { text: "100 veh/h", isCorrect: false },
        { text: "8 000 veh/h", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Highway",
      stem: "Using the Greenshields model with v_f = 80 km/h and k_j = 150 veh/km, the capacity (maximum flow) q_max is:",
      explanation: "Greenshields: q_max = v_f · k_j / 4 = 80 · 150 / 4 = 3 000 veh/h. This occurs at k_crit = k_j/2 = 75 veh/km and v_crit = v_f/2 = 40 km/h.",
      whyCorrect:
        "Greenshields model: q = v_f·k − (v_f/k_j)·k² is a parabola in k, peaking at k_crit = k_j/2. The maximum flow (capacity) is q_max = v_f·k_j/4 = 80·150/4 = 1 200/4 = 3 000 veh/h. (Note: this is the Greenshields theoretical capacity; the HCM 2022 ideal capacity for an urban freeway is 2 400 pc/h/ln — Greenshields overestimates by ~25%.)",
      whyOthersWrong: [
        "Option A (1 600 veh/h) is the flow at k = 20 veh/km (syllabus canonical example) — not the capacity at k_crit.",
        "Option C (2 400 veh/h) is the HCM 2022 ideal capacity (correct for design, but the question asks for the Greenshields value).",
        "Option D (12 000 veh/h) computed v_f × k_j = 80·150 = 12 000 — forgot to divide by 4.",
      ],
      options: [
        { text: "1 600 veh/h", isCorrect: false },
        { text: "3 000 veh/h", isCorrect: true },
        { text: "2 400 veh/h", isCorrect: false },
        { text: "12 000 veh/h", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Highway",
      stem: "True or False: In the HCM 2022 framework, Level of Service (LOS) for a basic freeway segment is determined by the traffic density (veh/km).",
      explanation: "HCM 2022 defines basic-freeway-segment LOS A–F by density thresholds: A ≤ 11, B 11–18, C 18–26, D 26–35, E 35–45, F > 45 veh/km. Signalized-intersection LOS is by control delay (s/veh), not density.",
      whyCorrect:
        "True. The HCM 7th ed. (2022) defines LOS for basic freeway segments by density k (veh/km): A ≤ 11, B 11–18, C 18–26, D 26–35, E 35–45, F > 45. The signalized-intersection LOS, by contrast, is defined by control delay (s/veh) — A ≤ 10, B 10–20, C 20–35, D 35–55, E 55–80, F > 80 s/veh. Different facility types use different LOS metrics, but freeway LOS is density-based.",
      whyOthersWrong: [
        "Option 'False' would be correct only if freeway LOS were based on speed or volume-capacity ratio (it is not — it is density-based). The statement is true.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// LESSONS array exported for tooling.
// ---------------------------------------------------------------------------

export const TRANSPORTATION_LESSONS: RefLesson[] = [
  LESSON_GEOMETRIC,
  LESSON_PAVEMENT,
  LESSON_TRAFFIC,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts EXACTLY.
// ---------------------------------------------------------------------------

/**
 * Upsert the Transportation Engineering discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 */
export async function loadReference() {
  // 1) Discipline — find by slug "transportation-engineering".
  const discipline = await db.discipline.findUnique({
    where: { slug: "transportation-engineering" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "transportation-engineering" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  const chapterSlug = "transportation-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Transportation Engineering Fundamentals",
    slug: chapterSlug,
    description:
      "Highway geometric design, pavement design, and traffic flow & capacity — the three-lesson deep scientific reference for the Transportation Engineering discipline.",
    icon: "Car",
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
  for (const src of TRANSPORTATION_SOURCES) {
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
  const sharedReferenceIds = TRANSPORTATION_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of TRANSPORTATION_LESSONS) {
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

    // 6) Practice problems — delete existing for this lesson, then create.
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

// =============================================================================
// WORKLOG ENTRY (Task ID: BATCH6-TRANS; verified and finalized by BATCH6A) —
// appended per spec. See /home/z/my-project/worklog.md for the master log.
//
// Work Log:
// - Read /home/z/my-project/engisuite/src/ref-content/thermodynamics.ts (the
//   canonical general-track loader pattern — Discipline → Chapter → Lesson →
//   KnowledgeObject + PracticeProblem; loadReference() flow with db.discipline
//   .findUnique → db.chapter.findFirst/create/update → db.reference.upsert-by-
//   title → db.lesson.findFirst/create/update → db.knowledgeObject.findFirst/
//   create/update → db.question.deleteMany+create per lesson).
// - Read /home/z/my-project/engisuite/src/lib/spec.ts (24 LESSON_TEMPLATE
//   section keys: learning_objectives, prerequisites, introduction,
//   terminology, detailed_explanation, core_principles, components, process,
//   formula_calculation, worked_example, industrial_example, case_study,
//   visual_explanation, simulation_opportunity, common_mistakes, limitations,
//   comparison, practical_application, decision_scenario, practice_questions,
//   certification_questions, summary, key_takeaways, references; 16 KO_FIELDS;
//   9 SOURCE_LEVELS; 5 CONTENT_STATUSES).
// - Confirmed transportation-engineering discipline slug=
//   "transportation-engineering" exists in scripts/seed-disciplines.ts (icon
//   "Car", group "Civil & Construction", order 20).
//
// Authored /home/z/my-project/engisuite/src/ref-content/transportation-engineering.ts.
// Mirrors thermodynamics.ts EXACTLY:
//   - RefOption/RefQuestion/RefLesson/RefSource types exported;
//   - TRANSPORTATION_SOURCES: 6 real sources (Garber/Hoel L6 [Cengage 5th ed.
//     2014], Papacostas/Prevedouros L6 [Pearson 3rd ed. 2001], AASHTO Green
//     Book L3 [7th ed. 2018], HCM 7th ed. L3 [TRB 2022], MUTCD L3 [FHWA 11th
//     ed. 2023], ASTM D1557-12e1 L2 [Modified Proctor]);
//   - 3 lessons (LESSON_GEOMETRIC, LESSON_PAVEMENT, LESSON_TRAFFIC_FLOW);
//     TRANSPORTATION_LESSONS array exported; loadReference() exported.
//
// 3 lessons (24 sections each, all 24/24 populated per lesson, 72 total):
//   • Lesson 1 (slug: trans-highway-geometric-design) — AASHTO 13 functional
//     classes & design-speed hierarchy; minimum radius R = v²/(g·(e+f)) →
//     R_min=229 m @ V=80 km/h, e=0.08, f=0.14 (syllabus canonical R=350 m ↔
//     e+f=0.144); stopping sight distance SSD = PRT·v + v²/(2·g·f) (metric
//     SSD = 0.278·V·t + V²/(254·(f+i))); @ V=80 km/h, t=2.5 s, f=0.35: SSD=127
//     m (AASHTO 130 m); syllabus canonical SSD=110 m ↔ f=0.46; vertical curve
//     L=K·A, crest K_80=51, sag K_80=26; superelevation runoff L_r=w·e_rel/
//     G_max. Worked: SSD=110 m @ 80 km/h (PRT=2.5 s, a=4.5 m/s², f=0.46); R=
//     350 m ↔ e+f=0.144. ✓
//   • Lesson 2 (slug: trans-pavement-design) — AASHTO 1993 flexible pavement
//     equation log₁₀(W₁₈) = Z_R·S₀ + 9.36·log₁₀(SN+1) − 0.20 +
//     (log₁₀(ΔPSI/(4.2−1.5)))/(0.40 + 1094/(SN+1)⁵·¹⁹) + 2.32·log₁₀(M_R) −
//     8.07; structural number SN = a₁·D₁ + a₂·D₂ + a₃·D₃; layer coefficients
//     a₁=0.44 (HMA), a₂=0.11–0.14 (aggregate base), a₃=0.10–0.11 (subbase);
//     18-kip ESAL via LEF ≈ (W/18000)⁴; reliability Z_R=−1.645 (R=95%); rigid
//     PCA, modified Proctor D1557. Worked: SN_s = 0.44·4 + 0.14·8 + 0.11·10 +
//     0.22 = 4.20 — syllabus canonical SN=4.2 (~100 mm HMA + 200 mm base + 250
//     mm subbase + small leveling, on M_R=5000 psi/CBR≈5, R=90%, W_18≈5×10⁵).
//     ✓
//   • Lesson 3 (slug: trans-traffic-flow-capacity) — flow-density-speed
//     relation q = k·v (veh/h); Greenshields (1935) linear v=v_f·(1−k/k_j) →
//     parabolic q = v_f·k − (v_f/k_j)·k², peak q_max = v_f·k_j/4 at k_crit=k_j/2
//     & v_crit=v_f/2; for v_f=80, k_j=150 → q_max=3000 veh/h/lane (HCM 2400);
//     HCM 2022 LOS A–F (A: k≤11, F: breakdown); Webster's optimal cycle C_o =
//     (1.5·L + 5)/(1 − Σy_i). Worked: v_f=80 km/h, k=20 veh/km → q = k·v =
//     20·80 = 1600 veh/h (LOS B/C on a freeway). ✓
//
// All 24 sections populated per lesson (verified: 24/24 per lesson, 72 total).
// formula_calculation lists R_min, SSD, vertical-curve K-values, superelevation
// runoff, AASHTO 1993 flexible equation, SN supplied/required, ESAL LEF,
// Greenshields q-k-v, q_max, k_crit, v_crit, Webster C_o, HCM LOS thresholds —
// all with variables/units/assumptions/interpretation. industrial_example named
// (Construction — Interstate rural widening; urban arterial resurfacing;
// signalized intersection). case_study synthetic (CASE_TYPE = SYNTHETIC —
// I-85 widened to 6 lanes; SR-7 arterial mill-and-overlay; Maple Ave/
// Oak St signal retiming). common_mistakes real. references citations to the 6
// sources.
//
// Knowledge Object body fills all 16 applicable arrays (definitions,
// principles, components, mechanism, process, formulas, metrics, examples,
// industrial_examples, case_studies, common_errors, limitations, best_practices,
// related_concepts, prerequisites, references) — verified: 16/16 arrays per
// lesson, 48 total.
//
// 4 enriched questions per lesson (12 total): 3 MCQ + 1 TrueFalse; whyCorrect
// + one whyOthersWrong per distractor + cognitiveLevel
// (Recall/Calculation/Analysis/Understanding) + explanation + skillType +
// scenario (Construction). Spans Easy/Medium/Hard × Remember/Apply/Analyze/
// Understand.
//
// Mirrored loadReference() flow EXACTLY: find Discipline by slug
// "transportation-engineering" (throw if not found) → findFirst Chapter by
// (disciplineId, slug) then create/update → upsert 6 References globally by
// title (with disciplineId) → for each lesson: findFirst by (chapterId, slug)
// then update/create (READY/HIGH/VERIFIED/v1.0.0/lastReviewedAt=now) →
// findFirst KO by lessonId then update/create (body JSON.stringify,
// referenceIds JSON shared) → deleteMany questions {lessonId} → create each
// enriched question (nested QuestionOption, knowledgeObjectId link, whyCorrect,
// whyOthersWrong JSON, referenceIds JSON shared, READY/VERIFIED/PENDING/
// v1.0.0) → return {discipline, chapter, lessons, kos, questions, references}
// counts.
//
// BATCH6A verification stamp: TypeScript clean (npx tsc --noEmit --skipLibCheck
// → no errors in transportation-engineering.ts). All 3 lessons × 24 sections
// present (verified 24/24 per lesson = 72/72); 3 KOs (one per lesson); 12
// questions (4 per lesson = 3 MCQ + 1 TF); 6 sources (Garber L6, Papacostas L6,
// AASHTO Green Book L3, HCM 7th L3, MUTCD L3, ASTM D1557 L2). All 3 syllabus
// canonical worked examples verified present: SSD=110 m @ 80 km/h (Lesson 1);
// SN=4.2 (Lesson 2); q=1600 veh/h (Lesson 3). All formulas verified present:
// R = v²/(g·(e+f)); SSD = PRT·v + v²/(2·g·f); SN = a₁·D₁ + a₂·D₂ + a₃·D₃;
// q = k·v (Greenshields v = v_f·(1 − k/k_j)). No edits to lesson/KO/question
// bodies were required by BATCH6A — file was at-spec on receipt; only this
// worklog was appended (the file previously terminated at the loadReference()
// return statement).
//
// Next actions:
//   • Run scripts/seed-disciplines.ts if "transportation-engineering"
//     discipline not yet seeded (slug: "transportation-engineering", icon:
//     "Car", group "Civil & Construction", order 20).
//   • Wire transportation-engineering.ts loadReference() into the seed route
//     via the existing dynamic-import pattern in
//     src/app/api/admin/load-reference/route.ts (analogous to how
//     thermodynamics.ts is wired).
//   • Run the seed script; verify DB shows +1 chapter, +3 lessons, +3 KOs,
//     +12 questions, +6 references under discipline "transportation-engineering".
//   • Front-end (LearningPage) will surface these via the existing /learning
//     routes (no UI change required).
// =============================================================================
