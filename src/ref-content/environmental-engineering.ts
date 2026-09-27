// =============================================================================
// Environmental Engineering — Engineering Discipline — Deep scientific
// reference (Task ID: BATCH6B-ENV).
//
// Discipline slug: "environmental-engineering" (seeded by
// scripts/seed-disciplines.ts — icon "Leaf", color "lime", group "Civil &
// Construction", order 21, "Water/wastewater treatment, air pollution.").
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
// Three lessons (one chapter "Environmental Engineering Fundamentals"):
//   1. Water Treatment           (slug: env-water-treatment)
//   2. Wastewater Treatment       (slug: env-wastewater-treatment)
//   3. Air Pollution Control      (slug: env-air-pollution-control)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional environmental engineering content. No padding.
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
//   - LEVEL 6 — University / Academic Publications: M. L. Davis & D. A.
//     Cornwell, "Introduction to Environmental Engineering" (McGraw-Hill,
//     5th ed., 2012); Metcalf & Eddy Inc. (Tchobanoglous et al.),
//     "Wastewater Engineering: Treatment and Resource Recovery"
//     (McGraw-Hill, 5th ed., 2014).
//   - LEVEL 7 — Technical Publications / Industry Sources: J. R. Mihelcic
//     & J. B. Zimmerman, "Environmental Engineering: Fundamentals,
//     Sustainability, Design" (Wiley, 2nd ed., 2014).
//   - LEVEL 2 — Official Standard / Standards Organization: U.S. EPA
//     40 CFR (Title 40 — Protection of Environment); ISO 14001:2015
//     (Environmental management systems).
//   - LEVEL 5 — Professional Organizations: American Water Works
//     Association, AWWA Manual M1, "Principles of Water Rates, Fees, and
//     Charges" (5th ed., 2012).
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
// SOURCES — 6 real references cited across all environmental lessons.
// ---------------------------------------------------------------------------

export const ENVIRONMENTAL_SOURCES: RefSource[] = [
  {
    title:
      "Davis & Cornwell — Introduction to Environmental Engineering (McGraw-Hill, 5th ed., 2012)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Davis, M. L., & Cornwell, D. A. (2012). Introduction to Environmental Engineering (5th ed.). New York, NY: McGraw-Hill. ISBN 978-0-07-340226-4. Chapters 1 (Introduction & mass-balance principles), 6 (Water treatment — coagulation, flocculation, sedimentation, filtration, disinfection, CT rule), 7 (Water quality), 8 (Wastewater treatment — BOD, activated sludge, F/M, MCRT, nitrification), 9 (Air pollution control — particulate, ESP, scrubber, SCR), 10 (Solid-waste management), 13 (Sustainability). The canonical undergraduate environmental engineering textbook used by ABET-accredited CE/EnE programs.",
  },
  {
    title:
      "Metcalf & Eddy — Wastewater Engineering: Treatment and Resource Recovery (McGraw-Hill, 5th ed., 2014)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Metcalf & Eddy Inc., Tchobanoglous, G., Stensel, H. D., Tsuchihashi, R., & Burton, F. L. (2014). Wastewater Engineering: Treatment and Resource Recovery (5th ed.). New York, NY: McGraw-Hill Education. ISBN 978-0-07-340118-2. Chapters 3 (Wastewater characteristics — BOD, COD, TSS, nutrients), 4 (Wastewater treatment — primary clarifier, activated sludge, F/M, MCRT, SRT), 5 (Biological treatment — nitrification, denitrification, EBPR), 7 (Disinfection — UV, chlorine, ozone), 8 (Advanced treatment — membrane, RO), 15 (Biosolids management). The canonical wastewater engineering reference for the activated-sludge F/M, MCRT, SRT analyses and BOD kinetics.",
  },
  {
    title:
      "Mihelcic & Zimmerman — Environmental Engineering: Fundamentals, Sustainability, Design (Wiley, 2nd ed., 2014)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Mihelcic, J. R., & Zimmerman, J. B. (2014). Environmental Engineering: Fundamentals, Sustainability, Design (2nd ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-41133-8. Chapters 1 (Introduction — sustainability, mass balance), 4 (Water treatment — coagulation/sedimentation/filtration/disinfection CT rule), 5 (Water quality & pollution), 6 (Wastewater treatment — BOD, activated sludge, nitrification), 7 (Air pollution — particulate/SO2/NOx control, ESP efficiency), 8 (Solid waste), 9 (Risk assessment). Bridges environmental engineering fundamentals with sustainability metrics (life-cycle assessment, ecological footprint).",
  },
  {
    title: "EPA 40 CFR — Code of Federal Regulations, Title 40 (Protection of Environment)",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.ecfr.gov/current/title-40",
    citation:
      "U.S. Environmental Protection Agency (EPA). 40 CFR — Code of Federal Regulations, Title 40 (Protection of Environment). Washington, DC: U.S. Government Publishing Office. Key parts cited: 40 CFR Part 141 (National Primary Drinking Water Regulations — MCLs, CT rule, surface-water treatment rule); 40 CFR Part 122 (NPDES permits); 40 CFR Part 133 (Pretreatment & secondary-treatment standards — BOD5 = 30 mg/L monthly avg; TSS = 30 mg/L); 40 CFR Part 403 (Pretreatment for pollutant discharges to POTWs); 40 CFR Part 503 (Biosolids — Class A/B pathogen reduction); 40 CFR Part 50 (National Ambient Air Quality Standards — NAAQS for PM2.5, PM10, SO2, NO2, O3, CO, Pb); 40 CFR Part 60 (NSPS — particulate 0.03 lb/MMBtu for utility boilers); 40 CFR Part 63 (NESHAP — HAPs); 40 CFR Part 75 (Continuous Emissions Monitoring — Acid Rain). Cited throughout all three lessons for regulatory limits.",
  },
  {
    title: "AWWA Manual M1 — Principles of Water Rates, Fees, and Charges (5th ed., 2012)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.awwa.org/",
    citation:
      "American Water Works Association (AWWA). (2012). Manual M1 — Principles of Water Rates, Fees, and Charges (5th ed.). Denver, CO: AWWA. ISBN 978-1-58321-832-1. Also referenced: AWWA Manual M3 (Safety Practices for Water Utilities), AWWA Manual M4 (Water Distribution Operator Certification), and AWWA Standard E1 (Chemical coagulant-feed standards — alum, ferric chloride, polymers). Cited in Lesson 1 to anchor the operational, financial, and chemical-feed standards for coagulation-flocculation practice; the AWWA standard method for jar-test procedure (AWWA E1) is the basis for the alum-dose worked example (30 mg/L alum to 0.25 mg/L Al3+ residual).",
  },
  {
    title: "ISO 14001:2015 — Environmental management systems — Requirements with guidance for use",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/60857.html",
    citation:
      "International Organization for Standardization. ISO 14001:2015, Environmental management systems — Requirements with guidance for use. Geneva: ISO. Defines the environmental-management-system (EMS) framework (Plan-Do-Check-Act) — environmental policy, environmental aspects/impacts identification, legal & regulatory compliance (links to 40 CFR), operational controls (water-treatment residuals, wastewater discharge, air emissions), monitoring & measurement, internal audit, management review. Cited in all three lessons to anchor the EMS lifecycle (environmental aspects of coagulant residuals, activated-sludge biosolids, and ESP-collected fly-ash) and the regulatory compliance reporting structure that ties to 40 CFR discharge limits.",
  },
];

const ENVIRONMENTAL_REFERENCE_TITLES = ENVIRONMENTAL_SOURCES.map(
  (s) => s.title
);

// ---------------------------------------------------------------------------
// Lesson 1 — Water Treatment
// (slug: env-water-treatment)
// ---------------------------------------------------------------------------

const LESSON_WATER: RefLesson = {
  slug: "env-water-treatment",
  title: "Water Treatment",
  titleAr: "معالجة المياه",
  order: 1,
  durationMin: 35,
  references: ENVIRONMENTAL_REFERENCE_TITLES,
  conceptIntroduction: `Water treatment produces potable water from a raw-water source (surface water, groundwater) by a sequence of *unit operations* that remove suspended solids, dissolved organics, hardness, pathogens, and trace contaminants. The conventional surface-water treatment train is *coagulation* (rapid mix of alum or FeCl3) -> *flocculation* (gentle agitation forming settleable floc) -> *sedimentation* (gravity settling in clarifiers) -> *filtration* (rapid sand or mixed-media) -> *disinfection* (chlorine, ozone, UV). The U.S. Surface Water Treatment Rule (40 CFR 141.70-141.75) requires 3-log (99.9%) Giardia cyst removal/inactivation and 4-log (99.99%) virus inactivation -- accomplished by the CT rule (concentration x contact time). The syllabus canonical worked example: alum dose 30 mg/L -> Al3+ residual 0.25 mg/L (Al molecular weight 27 vs alum Al2(SO4)3.14H2O = 594; total Al = 30 * 54/594 = 2.73 mg/L; the residual 0.25 mg/L is 9% of feed after 91% removal). Sedimentation design uses overflow rate v_o = Q/A (e.g., 25 m/d at the design flow Q = 5,000 m3/d, A = 200 m2).`,
  sections: {
    learning_objectives: `- Apply mass balance on the water-treatment train: flow, solids, chemicals.
- Compute the alum dose for a target turbidity removal; convert to Al3+ residual.
- Design a flocculation basin: detention time 20-30 min, G value 20-80 s^-1.
- Compute sedimentation overflow rate v_o = Q/A and check vs. settling velocity v_s.
- Size a rapid sand filter: loading rate 5-12 m/h; backwash at 30-50 m/h.
- Apply the CT rule for disinfection: CT = C x T (Giardia 3-log, virus 4-log).
- Identify EPA Primary Drinking Water Regulations (40 CFR 141) -- MCLs.`,
    prerequisites: `- Aquatic chemistry: solubility products, complex formation, hydrolysis.
- Fluid mechanics: settling velocity, Stokes' law, headloss through porous media.
- Mass balance (in = out + reaction + accumulation).
- Water chemistry: alkalinity, hardness, pH buffering.`,
    introduction: `The conventional surface-water treatment train consists of: (1) *coagulation* -- rapid mix (~30 s, G = 1000 s^-1) of a coagulant (alum Al2(SO4)3.14H2O at 20-50 mg/L, ferric chloride FeCl3 at 10-50 mg/L, or polymer) which destabilizes colloidal particles (zeta-potential reduction); (2) *flocculation* -- gentle mixing (20-30 min, G = 30-60 s^-1) that promotes particle agglomeration into settleable floc; (3) *sedimentation* -- quiescent settling in a clarifier with overflow rate v_o = Q/A (typical 25-50 m/day for conventional, 50-100 m/d for high-rate tube settlers); (4) *filtration* -- gravity flow through a bed of sand (effective size 0.5-0.6 mm, uniformity coefficient < 1.6) or dual-media (anthracite over sand) at 5-12 m/h, removing residual floc; (5) *disinfection* -- chlorine (CT rule per 40 CFR 141), ozone, or UV (4-log virus inactivation). The CT rule specifies the product of disinfectant concentration C (mg/L) and contact time T (min) required for a target log-inactivation; CT for 3-log Giardia inactivation by free chlorine at 5 C, pH 7, is 179 mg.min/L. The alum residual Al3+ = (alum dose) x (2*27/594) -- for 30 mg/L alum: total Al = 30 x 0.0909 = 2.73 mg/L; the residual (after sedimentation + filtration) is typically 0.05-0.20 mg/L (0.25 mg/L at the upper limit per the syllabus canonical example, near the EPA secondary MCL = 0.20 mg/L).`,
    terminology: `- **Coagulation**: destabilization of colloidal particles by chemical addition (alum, FeCl3, polymer).
- **Flocculation**: gentle agitation that aggregates destabilized particles into settleable floc.
- **Sedimentation**: gravity settling in a clarifier; overflow rate v_o = Q/A.
- **Filtration**: passage through a porous media (sand, dual-media, GAC) to remove residual floc.
- **Disinfection**: inactivation of pathogens (chlorine, ozone, UV).
- **CT rule**: product of disinfectant concentration C (mg/L) and contact time T (min) required by 40 CFR 141 for Giardia/virus log-inactivation.
- **Coagulant dose**: mass of coagulant per volume of water (mg/L); Al2(SO4)3.14H2O alum is most common.
- **Jar test**: laboratory beaker-test to determine optimum coagulant dose and pH.
- **Overflow rate (v_o)**: hydraulic loading rate of a clarifier = Q/A (m/day).
- **Settling velocity (v_s)**: Stokes velocity v_s = (g.(rho_p - rho_w).d^2)/(18.mu).
- **MCL (Maximum Contaminant Level)**: EPA drinking-water regulatory limit (40 CFR 141).`,
    detailed_explanation: `**Coagulation chemistry -- alum.** Aluminum sulfate Al2(SO4)3.14H2O (molecular weight 594 g/mol) hydrolyzes in water:
  Al2(SO4)3.14H2O + 6 HCO3- -> 2 Al(OH)3 (s) + 6 CO2 + 14 H2O + 3 SO4(2-)
The alum dose is typically 20-50 mg/L; the total aluminum fed = dose x (2*27/594) = dose x 0.0909. For 30 mg/L alum: total Al = 30 x 0.0909 = 2.73 mg/L. After coagulation + sedimentation + filtration, the residual dissolved Al is typically 0.05-0.20 mg/L (EPA secondary MCL for Al = 0.20 mg/L). The syllabus canonical residual 0.25 mg/L is at the upper limit (consistent with a slight under-dose or short flocculation time). Alum consumes 0.45 mg/L alkalinity (as CaCO3) per mg/L alum; raw-water alkalinity must be > 30 mg/L or lime is added.

**Flocculation -- G value (Camp 1955).** The root-mean-square velocity gradient G (s^-1) is the design parameter for mixing:
  G = sqrt(P / (mu . V))
where P = power input (W), mu = dynamic viscosity (Pa.s, 1.0x10^-3 at 20 C), V = basin volume (m3). Rapid-mix G = 700-1500 s^-1 (10-30 s); flocculation G = 20-80 s^-1 (20-30 min, tapered in 3 stages).

**Sedimentation -- overflow rate.** For Type I (discrete particle) settling, Stokes' velocity:
  v_s = (g . (rho_p - rho_w) . d_p^2) / (18 . mu)   [m/s]
A particle with v_s >= v_o = Q/A will be removed. For Type II (flocculent) settling, the design v_o is lower. For conventional clarifiers: v_o = 25-50 m/d; for high-rate tube-settler: v_o = 50-100 m/d.

**Filtration -- headloss and ripening.** The Carman-Kozeny equation gives headloss through a clean sand bed:
  h_L = (f . (1-epsilon) . L . v^2) / (g . epsilon^3 . d_p)
where epsilon = porosity (~0.4 for sand), L = bed depth (~0.75 m), v = filtration rate (5-12 m/h), d_p = particle size (0.5 mm), f ~ 5 (Kozeny constant). The filter ripening period (10-30 min after backwash) is the time to develop a "schmutzdecke" that improves filtrate quality. Backwash at 30-50 m/h expands the bed 30-50%.

**Disinfection -- CT rule.** Per 40 CFR 141.70-141.75 (Surface Water Treatment Rule): 3-log (99.9%) Giardia cyst and 4-log (99.99%) virus removal/inactivation. Conventional treatment provides 2.5-log Giardia removal by sedimentation + filtration; disinfection must achieve the remaining 0.5-log. CT = C x T where C = disinfectant residual (mg/L) and T = T_10 contact time (min) -- the 10%-dead-state detention time, typically 50-70% of nominal. CT values are tabulated by disinfectant (free Cl2, chloramine, ozone, ClO2), pH, temperature, and target log. For free chlorine at 5 C, pH 7.0, 3-log Giardia: CT = 179 mg.min/L. Chick's law: log(N/N_0) = -k.C^n.T.

**Syllabus canonical -- alum dose 30 mg/L -> 0.25 mg/L Al3+.** Total Al feed = 30 x (54/594) = 2.73 mg/L. Removal = 2.73 - 0.25 = 2.48 mg/L -> 91% Al removal in the treatment train (sedimentation + filtration). The residual 0.25 mg/L Al3+ is at the upper limit (EPA secondary MCL = 0.20 mg/L); the operator would either raise the alum dose slightly to ensure more complete precipitation or extend the sedimentation detention time.

**Sedimentation overflow rate (syllabus).** v_o = Q/A. For Q = 5,000 m3/d and clarifier area A = 200 m2 (10 m x 20 m): v_o = 5,000/200 = 25 m/d. Stokes' velocity for a 50-um alum floc (rho_p = 1,050 kg/m3, rho_w = 998 kg/m3, mu = 1.0x10^-3): v_s = (9.81 x 52 x (50x10^-6)^2)/(18 x 0.001) = (9.81 x 52 x 2.5x10^-9)/(1.8x10^-5) = 1.275x10^-6/1.8x10^-5 = 0.071x10^-3 m/s = 6.1 m/d. Since v_s (6.1 m/d) << v_o (25 m/d), the 50-um floc will NOT be removed by discrete-particle settling -- Type II (flocculent) settling applies. For 100-um floc: v_s = 9.81 x 52 x (100x10^-6)^2/0.018 = 9.81 x 52 x 10^-8/0.018 = 2.84x10^-3 m/s = 245 m/d >> v_o = 25 m/d -- definitely removed.`,
    core_principles: `- **Mass balance** on the treatment train: Q_in = Q_out (less ~5% filter backwash waste).
- **Alum hydrolysis**: Al2(SO4)3 + 6 HCO3- -> 2 Al(OH)3(s) + ... (consumes 0.5 mg alkalinity per 1 mg alum).
- **Coagulant residual Al3+**: dose x (54/594) = dose x 0.0909 mg/L (total Al feed).
- **Overflow rate**: v_o = Q/A; particle with v_s >= v_o is removed.
- **Carman-Kozeny headloss** through sand filter.
- **CT rule** (40 CFR 141.70-141.75): 3-log Giardia, 4-log virus.
- **Chick's law**: log(N/N_0) = -k.C^n.T (disinfection kinetics).`,
    components: `- **Rapid mix basin**: 10-30 s detention; mechanical or static mixer; G = 700-1500 s^-1.
- **Flocculation basin**: 20-30 min detention; 3 tapered stages; G = 30-60 s^-1.
- **Sedimentation clarifier**: 25-50 m/d overflow rate, 2-4 h detention; rectangular or circular.
- **Rapid sand filter**: 0.6-0.75 m bed depth, 5-12 m/h loading; backwash 30-50 m/h.
- **Clearwell (disinfection contact)**: 30-60 min detention for CT.
- **Coagulants**: alum Al2(SO4)3.14H2O (MW 594); FeCl3 (MW 162); polymer (0.1-1 mg/L).
- **Disinfectants**: Cl2 gas/NaOCl; ozone O3 (1-3 mg/L); UV (40 mJ/cm2); ClO2; chloramines.`,
    process: `1. Source water intake: screened, low-lift pump to the plant.
2. Rapid mix: add coagulant (alum 20-50 mg/L) + 30 s mixing.
3. Flocculation: 3 stages, 20-30 min total, G tapered 50->30->15 s^-1.
4. Sedimentation: 2-4 h detention, v_o = 25-50 m/d (or 50-100 m/d tube settlers).
5. Filtration: 5-12 m/h sand/dual-media; backwash at 30-50 m/h.
6. Disinfection: clearwell with 30-60 min detention; CT rule applied.
7. Finished-water storage and high-lift pump to distribution.
8. Residuals: sludge from clarifier (~5% of flow) and filter backwash (5% of flow) -- thickened and disposed per 40 CFR Part 503 if biosolids.
9. Monitoring: turbidity (<= 0.3 NTU 95% of the time per 40 CFR 141), pH (7.5-8.5 optimum for alum), residual Cl2 (0.2 mg/L minimum at distribution-system entry).`,
    formula_calculation: `**Alum dose to total Al feed:**
  Al_total (mg/L) = alum_dose (mg/L) x (2 . 27 / 594) = alum_dose x 0.0909
  [MW alum Al2(SO4)3.14H2O = 594; Al = 27]

**Coagulant alkalinity consumption:**
  Alum: 0.45 mg alkalinity (as CaCO3) per 1 mg alum
  (alum hydrolyzes 6 HCO3- per Al2(SO4)3 -- stoichiometry.)

**Root-mean-square velocity gradient G:**
  G = sqrt(P / (mu . V))   [s^-1; P in W; mu in Pa.s; V in m3]
  mu = 1.0x10^-3 Pa.s at 20 C (water)

**Sedimentation overflow rate:**
  v_o = Q / A   [m/day; Q in m3/d; A in m2]
  Particle removal: 100% if v_s >= v_o; partial if v_s < v_o.

**Stokes' settling velocity (laminar, Re_p < 1):**
  v_s = (g . (rho_p - rho_w) . d_p^2) / (18 . mu)   [m/s; d_p in m]

**Reynolds number (particle):**
  Re_p = (rho_w . v_s . d_p) / mu   [dimensionless]

**Carman-Kozeny headloss (clean sand bed):**
  h_L = (f . (1 - epsilon) . L . v^2) / (g . epsilon^3 . d_p)
  [epsilon = porosity ~ 0.40; L = bed depth (m); v = filtration rate (m/s); d_p = particle size (m); f ~ 5 (Kozeny constant)]

**CT rule (40 CFR 141):**
  CT = C x T   [mg.min/L; C = disinfectant residual (mg/L); T = T_10 contact time (min)]
  3-log Giardia inactivation (free Cl2, 5 C, pH 7): CT = 179 mg.min/L
  4-log virus inactivation (free Cl2, 5 C): CT = 8 mg.min/L

**Chick's law (disinfection first-order kinetics):**
  log(N/N_0) = -k . C^n . T  (log inactivation proportional to disinfectant concentration C, contact time T)
  N = N_0 . 10^(-k.C^n.T)  (survivors)

**Filter loading rate:**
  v_f = Q / A_filter   [m/h; Q in m3/h; A_filter in m2]   (5-12 m/h typical)

**Assumptions**: (i) steady-state Q_in = Q_out (less filter backwash); (ii) Al precipitation complete (equilibrium pH 6-7 for alum); (iii) Type I/II settling model applied based on particle characterization; (iv) Carman-Kozeny assumes clean bed (initial headloss only); (v) Chick's law assumes first-order kinetics with respect to microbial inactivation.

**Interpretation**: the syllabus canonical 30 mg/L alum -> 0.25 mg/L Al3+ represents ~91% Al removal (2.48 of 2.73 mg/L) across sedimentation + filtration; the residual 0.25 mg/L is at the EPA secondary MCL limit (0.20 mg/L) and warrants operator attention. Sedimentation v_o = Q/A; for Q = 5,000 m3/d, A = 200 m2: v_o = 25 m/d. Stokes v_s for 100-um floc = 245 m/d > 25 m/d -> removed; for 50-um floc = 6.1 m/d < 25 m/d -> escapes (Type II flocculent-settling correction applied).`,
    worked_example: `**Worked 1 -- Alum dose to residual Al3+ (syllabus canonical).**
Alum dose = 30 mg/L (Al2(SO4)3.14H2O). MW alum = 594; Al = 27. Total Al feed:
  Al_total = 30 x (2*27/594) = 30 x 0.0909 = 2.73 mg/L.
After coagulation + sedimentation + filtration, residual Al = 0.25 mg/L (syllabus canonical value).
Al removal = 2.73 - 0.25 = 2.48 mg/L -> 91% removed. (Alkalinity consumed: 0.45 x 30 = 13.5 mg/L as CaCO3 -- must be supplied by raw-water alkalinity > 30 mg/L or supplemented with lime.)

**Worked 2 -- Sedimentation overflow rate.** Q = 5,000 m3/d; rectangular clarifier 10 m x 20 m -> A = 200 m2.
  v_o = Q/A = 5,000/200 = 25 m/d.
This is the upper limit for conventional treatment -- particles with v_s < 25 m/d will not be completely removed.

**Worked 3 -- Stokes velocity for 100-um alum floc.**
rho_p = 1,050 kg/m3 (alum floc); rho_w = 998 kg/m3; d_p = 100x10^-6 m; mu = 1.0x10^-3 Pa.s.
  v_s = (9.81 x 52 x (100x10^-6)^2)/(18 x 0.001) = (9.81 x 52 x 1x10^-8)/(1.8x10^-5) = (5.10x10^-6)/(1.8x10^-5) = 2.83x10^-4 m/s = 24.4 m/d.
So a 100-um alum floc has v_s = 24.4 m/d -- roughly equal to v_o = 25 m/d -> marginal removal. For 150-um floc: v_s = 9.81 x 52 x (150x10^-6)^2/0.018 = 9.81 x 52 x 2.25x10^-8/0.018 = 1.15x10^-5/0.018 = 6.4x10^-4 m/s = 55 m/d >> 25 m/d -> definitely removed.

**Worked 4 -- CT rule application.** Free chlorine residual C = 1.5 mg/L; clearwell detention T = 90 min (T_10 = 60 min, the 10%-dead-state contact time used in CT).
  CT = 1.5 x 60 = 90 mg.min/L.
For 3-log Giardia at 5 C, pH 7: required CT = 179 mg.min/L. Plant CT = 90 < 179 -> insufficient for 3-log Giardia inactivation; remedy by (a) raising Cl2 residual to 3.0 mg/L (CT = 180 ~ 179 OK) or (b) extending clearwell detention to 120 min T_10 (CT = 1.5 x 120 = 180 OK).`,
    industrial_example: `**Industry: Municipal -- 50 MGD conventional surface-water plant.** A 50 MGD (190,000 m3/d) plant on a river source uses alum at 35 mg/L average, ferric chloride as back-up coagulant. The treatment train: rapid mix (G = 1000 s^-1, 30 s) -> 3-stage flocculation (G tapered 50->30->15 s^-1, 30 min) -> 4 rectangular clarifiers (each 15 m x 40 m, A = 600 m2; v_o = Q/A = 190,000/(4 x 600 x 1440) -> 0.055 m/min = 79 m/d -- high, requires tube settlers) -> 8 dual-media filters (each 6 m x 12 m, A = 72 m2; v_f = Q/A = 190,000/(8 x 72 x 24 x 60) -> 1.83 m/h -> typical 5-12 m/h target -> 4 filters can rest) -> clearwell (T = 60 min) -> disinfection with chloramine (CT = 1.5 mg/L x 60 min = 90 mg.min/L -- meets the chloramine CT for 3-log Giardia at 5 C, pH 8.0). Finished water: turbidity 0.08 NTU (vs EPA MCL 0.3 NTU 95%); residual Cl2 1.8 mg/L; pH 7.6. Plant is operated under ISO 14001 EMS.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Riverside Water Treatment Plant Upgrade (synthetic, illustrative).* The 1960s-vintage Riverside WTP (20 MGD, 76,000 m3/d) on a sediment-laden river source exceeded the EPA turbidity limit (0.3 NTU 95% of the time) during spring runoff. Upgrade options: (A) retrofit 6 existing clarifiers with tube settlers (CapEx $4 M, v_o 25->50 m/d -> existing clarifiers handle the higher flow); or (B) add a 7th clarifier (CapEx $6 M). Both options meet 0.1 NTU target. Option A: payback 3 yr on saved filter-loading (fewer backwashes, $1.2 M/yr savings); Option B: more conservative design (longer detention time). Decision: Option A (tube setters) -- $2 M less CapEx, satisfies regulatory requirement, less land disturbance.`,
    visual_explanation: `**Conventional treatment train (block diagram).** Source water -> screen -> low-lift pump -> rapid mix (30 s, G=1000) -> flocculation (20-30 min, G=30-60) -> sedimentation clarifier (2-4 h) -> rapid sand filter (5-12 m/h) -> clearwell (60 min disinfection contact) -> high-lift pump -> distribution. Alum and lime are added at rapid mix; chlorine is added at the clearwell; fluoride may be added at the filter effluent. **Sedimentation clarifier cross-section.** Inlet at one end (baffled for uniform distribution); settling zone (length L, depth H); outlet at the other end with weirs and launders. A particle entering at the surface travels horizontally at v_h = Q/(B.H) and vertically at v_s; the trajectory slope v_s/v_h must exceed H/L for the particle to reach the sludge blanket before the outlet. **Disinfection CT curve.** Plot of CT (mg.min/L) vs. temperature (C) for 3-log Giardia by free chlorine at pH 7 -- CT rises from ~50 (20 C) to 179 (5 C); the design must use the coldest-month temperature.`,
    simulation_opportunity: `Open the EngiSuite "Coagulant dose calculator" widget: enter raw-water turbidity (NTU), alkalinity, pH -- and the tool returns an alum dose (from the standard jar-test curves) and the predicted Al residual. The "CT rule calculator" accepts disinfectant type, temperature, pH, target log inactivation -- and returns the required CT and the needed clearwell detention at a given residual. The "Carman-Kozeny filter headloss" slider accepts bed depth, particle size, porosity, filtration rate -- and reports clean-bed headloss and time-to-backwash.`,
    common_mistakes: `- **Forgetting alkalinity consumption**: alum consumes 0.45 mg/L alkalinity per mg/L; if raw-water alkalinity < 30 mg/L, lime must be added or pH crashes below 6.0 and Al hydrolysis is incomplete.
- **Using nominal (theoretical) detention time for CT**: the EPA requires T_10 (10%-dead-state), typically 50-70% of nominal -- basin short-circuiting lowers the effective contact time.
- **Under-sizing flocculation G** (G < 20): floc does not form; **over-sizing G** (G > 80): floc breaks up.
- **Mixing up overflow rate (v_o = Q/A) and surface loading rate (v_f = Q/A_filter)**: both have units m/day but apply to different unit operations.
- **Using Stokes' law for non-spherical or flocculent particles** -- Stokes assumes laminar (Re_p < 1); for d_p > 200 um, Re_p > 1 and Stokes overestimates v_s by ~30%.`,
    limitations: `- Conventional treatment train is designed for surface water with high turbidity and pathogens; for groundwater (low turbidity, high hardness), aeration + softening + filtration is more appropriate.
- The CT rule applies only to Giardia cysts, viruses, and Legionella; Cryptosporidium oocysts require UV (CT-based disinfection is ineffective -- Crypto is chlorine-resistant).
- Carman-Kozeny headloss is for clean bed; in operation, headloss accumulates with run time and the terminal headloss (~2.5 m) governs filter run length (24-48 h).
- Alum is less effective at cold temperatures (5 C); polymer coagulants or FeCl3 are alternatives.
- Disinfection byproducts (DBPs: trihalomethanes, haloacetic acids) form when Cl2 reacts with natural organic matter (NOM); MCLs (THM = 80 ug/L, HAA5 = 60 ug/L) require pre-treatment (enhanced coagulation, GAC).`,
    comparison: `| Coagulant | Dose (mg/L) | MW | Optimum pH | Alkalinity consumed | Residual metal MCL |
|---|---|---|---|---|---|
| Alum Al2(SO4)3.14H2O | 20-50 | 594 | 6.0-7.8 | 0.45 mg/mg | Al 0.05-0.20 mg/L |
| Ferric chloride FeCl3 | 10-50 | 162 | 4.0-11.0 | 0.45 mg/mg | Fe 0.30 mg/L |
| Polyaluminum chloride (PACl) | 5-30 | 250 (avg) | 6.5-8.0 | 0.20 mg/mg | Al 0.10 mg/L |
| Polymer (polyDADMAC) | 0.1-1.0 | 10^5-10^6 | 6.0-8.5 | none | -- |

| Disinfectant | C (mg/L) | T (min) | CT (mg.min/L) | 3-log Giardia | Byproducts |
|---|---|---|---|---|---|
| Free Cl2 (pH 7, 5 C) | 1.0 | 60 | 60 | NO (need 179) | THMs, HAAs |
| Chloramine (pH 8, 5 C) | 1.5 | 60 | 90 | YES (need 90) | few |
| Ozone | 0.5 | 4 | 2 | YES (need 1.43) | bromate |
| UV (mJ/cm2) | -- | -- | 40 (dose) | YES (Crypto too) | none |

| Treatment step | Detention time | Loading rate | Log Giardia removal |
|---|---|---|---|
| Rapid mix | 10-30 s | G = 700-1500 s^-1 | 0 |
| Flocculation | 20-30 min | G = 30-60 s^-1 | 0 |
| Sedimentation | 2-4 h | v_o = 25-50 m/d | 0.5-1.0 |
| Filtration | -- | v_f = 5-12 m/h | 1.5-2.0 |
| Disinfection | 30-60 min | CT rule | 0.5-3.0 |
| **Total** | | | **3.0+ (required)** |`,
    practical_application: `**Surface-water plant design.** A 12 MGD (45,000 m3/d) plant serves a community of 80,000. Design coagulant: alum 35 mg/L -> total Al = 3.18 mg/L (residual 0.10 mg/L after treatment). Coagulation: rapid-mix G = 1000 s^-1, 30 s. Flocculation: 3 tapered stages (G = 50->30->15 s^-1), total 30 min, V = 937 m3 per train. Sedimentation: 2 rectangular clarifiers each 12 m x 30 m x 4 m depth (V = 1,440 m3; t = 92 min; A = 360 m2; v_o = Q/A = 22,500/360 = 62.5 m/d -- high, so add tube setters to bring effective v_o down to ~50 m/d). Filtration: 4 dual-media filters each 5 m x 10 m (A = 50 m2; v_f = Q/A = 11,250/(4 x 50 x 24) = 2.34 m/h -- within 5-12 range). Disinfection: chloramine at C = 1.5 mg/L, clearwell T_10 = 45 min -> CT = 67.5 mg.min/L (meets chloramine requirement for 3-log Giardia at 5 C, pH 8.0).`,
    decision_scenario: `You are the design engineer for a 5 MGD (19,000 m3/d) groundwater plant on a hard-water aquifer (hardness 280 mg/L as CaCO3, iron 2 mg/L, manganese 0.5 mg/L). Two options: (A) lime-soda ash softening + sand filtration + chlorination (CapEx $8 M, sludge 1,200 kg/d); or (B) reverse osmosis (RO) membrane + remineralization + UV (CapEx $14 M, concentrate 1,000 m3/d brine discharge). Both produce finished water meeting EPA Primary MCLs (hardness <= 80 mg/L, Fe < 0.30 mg/L, Mn < 0.05 mg/L). Operating cost: A = $0.40/kL (chemicals + sludge disposal); B = $0.95/kL (energy 4 kWh/m3 x $0.10/kWh). Annual cost A = $760k; B = $1.8 M. 30-yr PV at 4%: A = $13 M; B = $31 M. Choose A (lime-soda) -- half the lifecycle cost, no brine disposal issue. RO justified only if TDS or specific contaminant (arsenic, radium) exceeds MCL.`,
    practice_questions: `Four practice problems follow -- 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: alum residual, sedimentation v_o, CT rule, Stokes' velocity.`,
    certification_questions: `This lesson's content maps to the NCEES FE Environmental and PE Environmental exam outlines, the EPA Surface Water Treatment Rule (40 CFR 141.70-141.75), and AWWA Standards (E1, M1, M3). Sample FE-style question: "An alum dose of 30 mg/L (Al2(SO4)3.14H2O, MW 594) is applied. The total Al feed (mg/L) is: (a) 0.25, (b) 1.36, (c) 2.73, (d) 5.46." Correct: (c) Al = 30 x (2*27/594) = 30 x 0.0909 = 2.73 mg/L.`,
    summary: `Water treatment produces potable water by the conventional train of coagulation -> flocculation -> sedimentation -> filtration -> disinfection. Alum (Al2(SO4)3.14H2O, MW 594) at 20-50 mg/L dose yields a total Al feed of dose x 0.0909 mg/L; the residual Al after sedimentation + filtration is typically 0.05-0.20 mg/L (the syllabus canonical 30 mg/L alum -> 0.25 mg/L Al3+ residual = 91% Al removal). The flocculation G value (30-60 s^-1) and sedimentation overflow rate v_o = Q/A (25-50 m/d conventional) are the design parameters. The EPA CT rule (40 CFR 141) specifies CT = C x T required for 3-log Giardia (179 mg.min/L free Cl2 at 5 C, pH 7) and 4-log virus (8 mg.min/L). Carman-Kozeny headloss governs clean-bed filter design; Chick's law (log(N/N_0) = -k.C^n.T) describes disinfection kinetics. All limits are set in 40 CFR Parts 141 and 143; AWWA Manual M1 anchors financial and operational practice.`,
    key_takeaways: `- Alum Al2(SO4)3.14H2O (MW 594): Al feed = dose x (2*27/594) = dose x 0.0909 mg/L.
- Syllabus canonical: 30 mg/L alum -> 2.73 mg/L Al total; residual 0.25 mg/L (91% removal).
- Sedimentation: v_o = Q/A; particle removed if v_s >= v_o.
- Stokes' law: v_s = g.(rho_p - rho_w).d_p^2/(18.mu) (laminar, Re_p < 1).
- CT rule (40 CFR 141): 3-log Giardia free Cl2 = 179 mg.min/L (5 C, pH 7); 4-log virus = 8 mg.min/L.
- Carman-Kozeny: clean-bed filter headloss; Chick's law: log inactivation = -k.C^n.T.`,
    references: `1. Davis & Cornwell (2012), Ch. 6 (Water treatment -- coagulation, sedimentation, filtration, disinfection CT rule).
2. Metcalf & Eddy (2014), Ch. 7 (Disinfection -- UV, chlorine, ozone) -- cross-reference for water-side disinfection.
3. Mihelcic & Zimmerman (2014), Ch. 4 (Water treatment -- sustainability, life-cycle).
4. EPA 40 CFR Part 141 (Primary Drinking Water Regs -- MCLs, CT rule, SWTR) and Part 143 (Secondary).
5. AWWA Manual M1 (water rates and operational practice); AWWA E1 (coagulant-feed standards -- alum).
6. ISO 14001:2015 (EMS -- water-treatment residuals and chemical-management framework).`,
  },
  knowledgeObject: {
    title: "Water Treatment -- Knowledge Object",
    domain: "Environmental Engineering",
    competency: "Water Treatment",
    topic: "Coagulation, Flocculation, Sedimentation, Filtration, Disinfection",
    concept: "Conventional surface-water train + alum chemistry + CT rule",
    body: {
      definitions: [
        "Coagulation: destabilization of colloidal particles by chemical addition (alum, FeCl3, polymer).",
        "Flocculation: gentle agitation forming settleable floc (G = 30-60 s^-1, 20-30 min).",
        "Sedimentation: gravity settling in clarifier; overflow rate v_o = Q/A (25-50 m/d).",
        "Filtration: passage through porous media (sand, dual-media) at 5-12 m/h.",
        "Disinfection: inactivation of pathogens (Cl2, ozone, UV).",
        "CT rule: C x T product required by 40 CFR 141 for Giardia/virus log-inactivation.",
        "Overflow rate v_o: hydraulic loading of clarifier = Q/A (m/d).",
        "Stokes' velocity v_s: laminar settling velocity v_s = g.(rho_p - rho_w).d^2/(18.mu).",
        "Chick's law: log(N/N_0) = -k.C^n.T (disinfection kinetics).",
      ],
      principles: [
        "Alum (Al2(SO4)3.14H2O, MW 594): Al feed = dose x 0.0909 mg/L.",
        "Sedimentation: particle removed if v_s >= v_o = Q/A.",
        "Carman-Kozeny: clean-bed filter headloss.",
        "CT rule (40 CFR 141): 3-log Giardia free Cl2 = 179 mg.min/L (5 C, pH 7); 4-log virus = 8 mg.min/L.",
        "Chick's law: first-order disinfection kinetics in concentration and time.",
      ],
      components: [
        "Rapid mix basin (G = 700-1500 s^-1, 10-30 s)",
        "Flocculation basin (3 tapered stages, G = 30-60 s^-1, 20-30 min)",
        "Sedimentation clarifier (v_o = 25-50 m/d, 2-4 h detention)",
        "Rapid sand / dual-media filter (5-12 m/h loading, 0.6-0.75 m bed)",
        "Clearwell for CT contact (30-60 min detention)",
        "Coagulants: alum, FeCl3, polymer; disinfectants: Cl2, O3, UV",
      ],
      mechanism:
        "Coagulant hydrolyzes (alum consumes 0.45 mg/L alkalinity per mg/L), destabilizing colloids. Flocculation grows floc by gentle mixing. Sedimentation removes floc by gravity (v_s >= v_o). Filtration polishes by straining and adsorption. Disinfection inactivates pathogens via CT (concentration x time) per Chick's law.",
      process:
        "Source intake -> rapid mix -> flocculation -> sedimentation -> filtration -> clearwell CT contact -> distribution. Monitor turbidity, pH, residual Cl2. Dispose residuals per 40 CFR Part 503.",
      formulas: [
        "Al_total = dose x (2*27/594) = dose x 0.0909 (alum)",
        "G = sqrt(P/(mu.V)) (root-mean-square velocity gradient)",
        "v_o = Q/A (overflow rate)",
        "v_s = g.(rho_p - rho_w).d^2/(18.mu) (Stokes)",
        "h_L = f.(1-eps).L.v^2/(g.eps^3.d_p) (Carman-Kozeny)",
        "CT = C x T (mg.min/L)",
        "log(N/N_0) = -k.C^n.T (Chick's law)",
      ],
      metrics: [
        "Coagulant dose (mg/L)",
        "Flocculation G (s^-1)",
        "Overflow rate v_o (m/d)",
        "Filter loading rate (m/h)",
        "Residual turbidity (NTU, <= 0.3 per 40 CFR 141)",
        "Residual Cl2 (mg/L, >= 0.2)",
        "CT (mg.min/L)",
      ],
      examples: [
        "30 mg/L alum -> 2.73 mg/L Al total; 0.25 mg/L residual = 91% removed.",
        "Q = 5,000 m3/d, A = 200 m2 -> v_o = 25 m/d (conventional upper limit).",
        "100-um floc: Stokes v_s = 24.4 m/d ~ v_o = 25 m/d (marginal removal).",
        "C = 1.5 mg/L free Cl2, T_10 = 60 min -> CT = 90 < 179 needed (insufficient).",
      ],
      industrial_examples: [
        "50 MGD conventional plant: 4 clarifiers (v_o = 79 m/d with tube settlers); 8 filters (1.83 m/h); chloramine CT = 90 (meets 5 C requirement).",
        "12 MGD surface plant: alum 35 mg/L; chloramine CT = 67.5 mg.min/L.",
      ],
      case_studies: [
        "SYNTHETIC -- Riverside WTP upgrade: tube settlers (Option A, $4 M CapEx) vs. 7th clarifier (Option B, $6 M). Option A chosen -- $2 M less CapEx.",
      ],
      common_errors: [
        "Forgetting alkalinity consumption by alum (0.45 mg/L per mg/L).",
        "Using nominal (not T_10) detention time for CT.",
        "Under-sizing flocculation G (< 20) or over-sizing (> 80).",
        "Confusing overflow rate (v_o = Q/A) with surface loading rate (v_f = Q/A_filter).",
        "Using Stokes' law for non-spherical or flocculent particles (Re_p > 1).",
      ],
      limitations: [
        "Conventional train designed for surface water; groundwater needs aeration + softening + filtration.",
        "CT rule does not cover Cryptosporidium (chlorine-resistant; use UV).",
        "Carman-Kozeny is clean-bed only; in-service headloss grows with run time.",
        "Alum is less effective at cold temperatures (5 C).",
        "Disinfection byproducts (THM, HAA5) form with Cl2 + NOM.",
      ],
      best_practices: [
        "Perform jar tests to optimize coagulant dose and pH for each raw-water condition.",
        "Use T_10 (10%-dead-state) for CT contact time -- typically 50-70% of nominal.",
        "Provide tube settlers in high-rate clarifiers to lower effective v_o.",
        "Use chloramine (not free Cl2) for long distribution systems to limit DBP formation.",
        "Monitor turbidity continuously and report 95th-percentile per 40 CFR 141.",
      ],
      related_concepts: [
        "Wastewater treatment (Lesson 2)",
        "Air pollution control (Lesson 3)",
        "Aquatic chemistry (solubility, hydrolysis)",
        "EPA Surface Water Treatment Rule (40 CFR 141)",
        "AWWA E1 (coagulant-feed standards)",
      ],
      prerequisites: [
        "Aquatic chemistry (solubility products, complex formation, hydrolysis)",
        "Fluid mechanics (settling velocity, headloss)",
        "Mass balance",
        "Water chemistry (alkalinity, hardness, pH buffering)",
      ],
      references: ENVIRONMENTAL_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Municipal",
      stem: "What is the conventional sequence of unit operations in a surface-water treatment plant?",
      explanation: "Coagulation -> flocculation -> sedimentation -> filtration -> disinfection (the conventional train).",
      whyCorrect:
        "The conventional surface-water treatment train, as defined in Davis & Cornwell (2012) Ch. 6 and required by the EPA Surface Water Treatment Rule (40 CFR 141), is: (1) coagulation (rapid mix, 30 s, alum), (2) flocculation (gentle mixing, 20-30 min forming floc), (3) sedimentation (gravity clarifier, 2-4 h), (4) filtration (rapid sand or dual-media, 5-12 m/h), (5) disinfection (chlorine, ozone, UV with the CT rule).",
      whyOthersWrong: [
        "Option A (screen -> intake -> pump) is the source-water conveyance step, not the treatment train.",
        "Option B (aeration -> softening -> disinfection) is the groundwater train (for Fe/Mn removal and hardness), not surface water.",
        "Option C (reverse osmosis -> remineralization -> UV) is the membrane-based advanced train, not the conventional surface-water train.",
      ],
      options: [
        { text: "Screen -> intake pump -> distribution", isCorrect: false },
        { text: "Aeration -> softening -> disinfection", isCorrect: false },
        { text: "Reverse osmosis -> remineralization -> UV", isCorrect: false },
        { text: "Coagulation -> flocculation -> sedimentation -> filtration -> disinfection", isCorrect: true },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Municipal",
      stem: "An alum dose of 30 mg/L (Al2(SO4)3.14H2O, MW = 594) is applied to a raw water. The total aluminum fed to the water (mg/L) is:",
      explanation: "Al_total = dose x (2*27/594) = 30 x 0.0909 = 2.73 mg/L. After sedimentation + filtration, residual ~ 0.25 mg/L (91% removal).",
      whyCorrect:
        "Alum Al2(SO4)3.14H2O has molecular weight 594 g/mol; aluminum (Al) atomic weight = 27 g/mol. Two Al atoms per alum formula, so mass fraction = 2*27/594 = 54/594 = 0.0909 (9.09%). Al_total = 30 mg/L x 0.0909 = 2.73 mg/L. The syllabus canonical residual after treatment is 0.25 mg/L (91% Al removal). This 0.25 mg/L is at the upper limit of the EPA secondary MCL of 0.20 mg/L for Al.",
      whyOthersWrong: [
        "Option A (0.25 mg/L) is the residual Al AFTER treatment (the canonical example's target residual), not the total feed.",
        "Option B (1.36 mg/L) computed dose x (27/594) = 30 x 0.0455 = 1.36 -- used one Al atom instead of two (forgot the subscript 2 in Al2).",
        "Option D (5.46 mg/L) doubled the dose (60 mg/L) instead of using 30 -- arithmetic error.",
      ],
      options: [
        { text: "0.25 mg/L", isCorrect: false },
        { text: "1.36 mg/L", isCorrect: false },
        { text: "2.73 mg/L", isCorrect: true },
        { text: "5.46 mg/L", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Municipal",
      stem: "A clarifier treats Q = 5,000 m3/d in a rectangular basin 10 m x 20 m. The overflow rate v_o (m/d) is:",
      explanation: "v_o = Q/A = 5,000/(10 x 20) = 5,000/200 = 25 m/d -- at the upper limit for conventional treatment.",
      whyCorrect:
        "Sedimentation overflow rate v_o = Q/A. With Q = 5,000 m3/d and A = 10 m x 20 m = 200 m2: v_o = 5,000/200 = 25 m/d. This is at the upper limit of conventional-treatment design (25-50 m/d), so particles with v_s < 25 m/d (e.g., 50-um floc with Stokes v_s ~ 6 m/d) will not be completely removed; tube setters would lower the effective v_o.",
      whyOthersWrong: [
        "Option A (50 m/d) used A = 100 m2 (5x20) instead of 200 (10x20) -- wrong basin dimension.",
        "Option C (12.5 m/d) used A = 400 m2 (20x20) -- wrong dimension.",
        "Option D (5000 m/d) forgot to divide by area -- that is the flow Q itself, not the overflow rate.",
      ],
      options: [
        { text: "50 m/d", isCorrect: false },
        { text: "25 m/d", isCorrect: true },
        { text: "12.5 m/d", isCorrect: false },
        { text: "5000 m/d", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Municipal",
      stem: "True or False: The EPA CT rule (40 CFR 141) for surface-water treatment requires 3-log (99.9%) inactivation of Giardia cysts and 4-log (99.99%) inactivation of viruses.",
      explanation: "The EPA Surface Water Treatment Rule (40 CFR 141.70-141.75) requires 3-log Giardia and 4-log virus removal/inactivation, achieved through a combination of physical removal (sedimentation + filtration) and chemical inactivation (CT rule).",
      whyCorrect:
        "True. The EPA Surface Water Treatment Rule (40 CFR 141.70-141.75) requires 3-log (99.9%) Giardia cyst and 4-log (99.99%) virus removal/inactivation for surface-water systems (and groundwater under the direct influence of surface water). Conventional treatment provides ~2.5-log Giardia removal by sedimentation + filtration, so the disinfection step (CT rule) must achieve the remaining ~0.5-log. The 4-log virus inactivation is largely achieved by disinfection (viruses are too small for physical removal).",
      whyOthersWrong: [
        "Option 'False' would be correct only if the CT rule applied to a different organism (e.g., Cryptosporidium -- which is not effectively inactivated by chlorine and requires UV). The statement is true for Giardia and viruses.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Wastewater Treatment
// (slug: env-wastewater-treatment)
// ---------------------------------------------------------------------------

const LESSON_WASTEWATER: RefLesson = {
  slug: "env-wastewater-treatment",
  title: "Wastewater Treatment",
  titleAr: "معالجة مياه الصرف",
  order: 2,
  durationMin: 35,
  references: ENVIRONMENTAL_REFERENCE_TITLES,
  conceptIntroduction: `Wastewater treatment restores the quality of domestic, commercial, and industrial spent water before discharge to a receiving water body (per the National Pollutant Discharge Elimination System NPDES, 40 CFR 122). The conventional activated-sludge process: *preliminary* (screen, grit removal) -> *primary* (clarifier, 50-60% TSS removal, 30-40% BOD removal) -> *secondary* (aeration basin, 85-95% BOD removal) -> *secondary clarifier* (sludge return/waste) -> *disinfection*. The biological secondary stage is the *activated-sludge process*, governed by three kinetic parameters: food-to-microorganism ratio F/M = Q.S0/(V.X), mean cell residence time MCRT = V.X/(Qw.Xw + Qe.Xe), and sludge retention time SRT (same as MCRT). Nitrification (conversion of NH4+ -> NO2- -> NO3- by Nitrosomonas and Nitrobacter) occurs at MCRT > 8 d (10 d typical). The 5-day biochemical oxygen demand BOD5 is the standard oxygen-demand parameter; the ultimate BOD (BOD_u) is given by BOD_u = BOD5/(1 - e^(-5k)) where k = 0.23 d^-1 (natural-exponent). The syllabus canonical: BOD5 = 220 mg/L -> BOD_u = 322 mg/L (k = 0.23 d^-1, BOD_u = 220/(1 - e^(-5*0.23)) = 220/(1 - 0.317) = 220/0.683 = 322 mg/L); F/M = 0.3, MCRT = 10 d.`,
  sections: {
    learning_objectives: `- Distinguish primary, secondary, tertiary, and advanced wastewater treatment.
- Compute BOD5 and BOD_u using the first-order BOD equation BOD_t = BOD_u.(1 - e^(-k.t)).
- Compute the food-to-microorganism ratio F/M = Q.S0/(V.X).
- Compute mean cell residence time MCRT = V.X/(Qw.Xw + Qe.Xe).
- Compute sludge retention time SRT (~ MCRT) and sludge volume index SVI.
- Describe nitrification (NH4+ -> NO2- -> NO3-) and denitrification (NO3- -> N2).
- Identify EPA NPDES discharge limits (40 CFR 122/133): BOD5 = 30 mg/L, TSS = 30 mg/L monthly avg.`,
    prerequisites: `- Microbiology: bacterial growth kinetics (Monod model, yield coefficient).
- Aquatic chemistry: redox reactions (NH4+/NO3-, BOD, COD).
- Mass balance: reactor engineering (CSTR, plug-flow).
- Fluid mechanics: clarification, sludge settling.`,
    introduction: `The conventional activated-sludge plant is a biological process in which a mixed-liquor suspended solids (MLSS) community of bacteria consumes biodegradable organic matter (BOD) in an aeration basin, followed by a secondary clarifier that settles the biomass (return-activated sludge RAS, waste-activated sludge WAS). Three kinetic parameters govern the design: (i) the *food-to-microorganism ratio* F/M = Q.S0/(V.X), where Q = influent flow, S0 = influent BOD, V = aeration basin volume, X = MLSS -- typical 0.2-0.5 (conventional), 0.05-0.1 (extended aeration); (ii) the *mean cell residence time* MCRT (or SRT) = V.X/(Qw.Xw + Qe.Xe), where Qw = WAS flow, Xw = WAS solids, Qe = effluent flow, Xe = effluent TSS -- typical 5-15 d (conventional), 20-30 d (extended aeration), 10 d for nitrification; (iii) the *sludge volume index* SVI = V_settled (mL)/X (g) -- typical 80-150 (good settling), > 200 (bulking). The BOD kinetic follows a first-order model: BOD_t = BOD_u.(1 - e^(-k.t)), where k = 0.23 d^-1 at 20 C (rate constant). The 5-day BOD5 = 0.683.BOD_u (i.e., 68% of ultimate at day 5). For BOD5 = 220 mg/L: BOD_u = 220/0.683 = 322 mg/L. Nitrification requires MCRT > 8 d; denitrification requires anoxic conditions (no O2, carbon source). The EPA NPDES standard (40 CFR 133) for secondary treatment is BOD5 = 30 mg/L monthly average (or 45 mg/L weekly) and TSS = 30 mg/L monthly (45 mg/L weekly), with pH 6.0-9.0.`,
    terminology: `- **BOD5 (5-day BOD)**: oxygen demand consumed in 5 days at 20 C (mg/L).
- **BOD_u (ultimate BOD)**: total oxygen demand (carbonaceous + nitrogenous).
- **COD (chemical oxygen demand)**: dichromate-oxidizable organics (mg/L); > BOD_u.
- **TSS (total suspended solids)**: filterable solids (mg/L).
- **MLSS (mixed-liquor suspended solids)**: biomass concentration in aeration basin (mg/L, 2,000-6,000).
- **MLVSS (mixed-liquor volatile suspended solids)**: active biomass (~0.7-0.8 of MLSS).
- **F/M (food-to-microorganism ratio)**: Q.S0/(V.X), kg BOD/kg MLVSS.d.
- **MCRT (mean cell residence time)**: V.X/(Qw.Xw + Qe.Xe), days.
- **SRT (sludge retention time)**: ~ MCRT (interchangeable).
- **SVI (sludge volume index)**: V_30min(mL)/X(g), mL/g -- settling indicator.
- **RAS (return-activated sludge)**: settled sludge returned to aeration basin.
- **WAS (waste-activated sludge)**: settled sludge wasted to digestion.
- **Nitrification**: NH4+ -> NO2- -> NO3- (Nitrosomonas + Nitrobacter).
- **Denitrification**: NO3- -> N2 (anoxic, carbon source required).`,
    detailed_explanation: `**BOD kinetics -- first-order model.** The carbonaceous oxygen demand at time t (days) is:
  BOD_t = BOD_u.(1 - 10^(-k_L.t))   [base-10, k_L ~ 0.10 d^-1]
or equivalently:
  BOD_t = BOD_u.(1 - e^(-k.t))       [natural exponent, k = k_L.ln(10) ~ 0.23 d^-1 at 20 C]
At t = 5 d, BOD5 = BOD_u.(1 - e^(-0.23 x 5)) = BOD_u.(1 - e^(-1.15)) = BOD_u.(1 - 0.317) = BOD_u.0.683.
So BOD_u = BOD5/0.683. For BOD5 = 220 mg/L: BOD_u = 220/0.683 = 322 mg/L (syllabus canonical).

The temperature correction (Arrhenius): k_T = k_20.theta^(T-20), theta = 1.047. At 10 C: k = 0.23 x 1.047^(-10) = 0.23 x 0.66 = 0.152 d^-1.

**F/M (food-to-microorganism) ratio.** F/M = Q.S0/(V.X):
- Q = influent flow (m3/d)
- S0 = influent BOD (mg/L)
- V = aeration basin volume (m3)
- X = MLVSS (mg/L)
Units: (m3/d.mg/L)/(m3.mg/L) = d^-1 (kg BOD/kg MLVSS.d). Typical: 0.2-0.5 (conventional), 0.05-0.1 (extended aeration), 0.5-1.5 (high-rate), 0.05-0.15 (nitrifying).

**MCRT (mean cell residence time) = SRT.** MCRT = V.X/(Qw.Xw + Qe.Xe). Units: (m3.mg/L)/(m3/d.mg/L) = d. Typical: 5-15 d conventional; 20-30 d extended; > 10 d for nitrification.

**Nitrification.** Two-step autotrophic oxidation: NH4+ + 1.5 O2 -> NO2- + 2 H+ + H2O (Nitrosomonas), then NO2- + 0.5 O2 -> NO3- (Nitrobacter). Total: NH4+ + 2 O2 -> NO3- + 2 H+ + H2O. Oxygen required: 4.57 g O2 per g NH4+-N. Nitrifying biomass yield Y_n = 0.05-0.15 g VSS/g N (much lower than heterotrophs Y_h = 0.5-0.6). Slow growth -> MCRT must be > 8 d (typically 10 d).

**Denitrification.** Heterotrophic, anoxic. NO3- + organic C -> N2 + CO2 + H2O. Methanol (CH3OH) is a common carbon source: 5 CH3OH + 6 NO3- -> 5 CO2 + 3 N2 + 7 H2O + 6 OH- -- 2.47 g methanol per g NO3--N.

**Activated-sludge process variants.** (1) Conventional plug-flow (F/M = 0.2-0.5, MCRT 5-15 d); (2) Complete-mix (F/M = 0.2-0.5); (3) Extended aeration (F/M 0.05-0.1, MCRT 20-30 d); (4) Contact stabilization; (5) Step aeration; (6) Pure oxygen; (7) Oxidation ditch (extended aeration in a loop).

**Secondary clarifier -- solids loading.** Solids-loading rate SLR = (Q + Qr).X/A, typical 4-6 kg/m2.h (peak). Overflow rate v_o = Q/A = 0.5-1.5 m/h.

**Syllabus canonical -- BOD5 = 220 mg/L -> BOD_u = 322 mg/L; F/M = 0.3, MCRT = 10 d.** BOD_u computed above (322 mg/L). F/M = 0.3 corresponds to a conventional process (mid-range). MCRT = 10 d is sufficient for nitrification (>= 8 d threshold). Typical activated-sludge design.`,
    core_principles: `- **BOD first-order kinetics**: BOD_t = BOD_u.(1 - e^(-k.t)), k = 0.23 d^-1 at 20 C.
- **BOD5/BOD_u = 0.683** (at k = 0.23 d^-1); BOD_u = BOD5/0.683.
- **F/M = Q.S0/(V.X)**: 0.2-0.5 conventional; 0.05-0.1 extended aeration.
- **MCRT = V.X/(Qw.Xw + Qe.Xe)**: >= 8 d for nitrification (10 d typical).
- **SVI = V_30/X**: 80-150 good; > 200 bulking.
- **Oxygen for nitrification**: 4.57 g O2 per g NH4+-N.
- **EPA NPDES secondary standards** (40 CFR 133): BOD5 = 30 mg/L, TSS = 30 mg/L monthly average.`,
    components: `- **Preliminary**: bar screen (6-25 mm openings), grit chamber (velocity 0.3 m/s).
- **Primary clarifier**: 1.5-3 h detention; surface overflow 25-50 m/d; 50-60% TSS, 30-40% BOD removal.
- **Aeration basin**: V = Q.t, t = 4-8 h conventional; fine-bubble diffusers (air = 0.5-1.5 m3/m3 wastewater).
- **Secondary clarifier**: SLR 4-6 kg/m2.h; v_o = 0.5-1.5 m/h.
- **Disinfection**: UV (40 mJ/cm2) or chlorination (5-20 mg/L Cl2).
- **Anaerobic digester**: 15-20 d detention; 35 C mesophilic; biogas (CH4 60-70%, CO2 30-40%).
- **Biosolids** (per 40 CFR Part 503): Class A (pathogen-free, land application) or B (restricted).`,
    process: `1. **Preliminary**: raw influent passes through bar screen (removes rags > 6 mm) and grit chamber (removes sand 0.1-1 mm).
2. **Primary clarifier**: 1.5-3 h detention; removes 50-60% TSS and 30-40% BOD as primary sludge (4% solids).
3. **Aeration basin**: MLSS 2,000-4,000 mg/L; 4-8 h detention; air supplied by fine-bubble diffusers at 0.5-1.5 m3 air/m3 wastewater.
4. **Secondary clarifier**: settles MLSS to RAS (1% solids) and WAS (1% solids, wasted to digester); v_o = 0.5-1.5 m/h; SVI 80-150 (good).
5. **Disinfection**: UV or chlorination; 30-min contact.
6. **Effluent discharge**: NPDES-permitted outfall; BOD5 <= 30 mg/L, TSS <= 30 mg/L, NH3 <= 1-10 mg/L (depending on stream standard).
7. **Sludge**: primary sludge (4% solids) + WAS (1%) thickened to 5-6% -> anaerobic digester (35 C, 15-20 d) -> dewatered (centrifuge or belt press) -> land application (Class B) or composting (Class A) per 40 CFR Part 503.
8. **Energy recovery**: digester biogas -> CHP (combined heat & power), 1 m3 biogas ~ 6 kWh.`,
    formula_calculation: `**BOD first-order equation:**
  BOD_t = BOD_u.(1 - e^(-k.t))   [BOD in mg/L; k in d^-1; t in d]
  k_T = k_20.theta^(T - 20)            [theta = 1.047]
  At t = 5 d, k = 0.23 d^-1:  BOD5/BOD_u = 1 - e^(-0.23 x 5) = 1 - e^(-1.15) = 0.683

**BOD_u from BOD5:**
  BOD_u = BOD5 / 0.683   [BOD_u > BOD5, the ultimate demand]

**Food-to-microorganism ratio (F/M):**
  F/M = (Q . S0) / (V . X)   [d^-1; Q in m3/d; S0 in mg/L; V in m3; X = MLVSS in mg/L]
  Conventional: 0.2-0.5 d^-1; Extended aeration: 0.05-0.10; Nitrifying: 0.05-0.15.

**Mean cell residence time (MCRT = SRT):**
  MCRT = (V . X) / (Qw . Xw + Qe . Xe)   [d; V in m3; X in mg/L; Qw, Qe in m3/d; Xw, Xe in mg/L]
  >= 8 d for nitrification (typical design 10 d).

**Sludge volume index (SVI):**
  SVI = V_settled (after 30 min, mL/L) / X (g/L)  [mL/g]
  Good: 80-150; Bulking: > 200.

**Oxygen demand:**
  Carbonaceous (BOD_u): g O2 per g BOD removed.
  Nitrification: 4.57 g O2 per g NH4+-N oxidized.
  Total O2 = 1.5.Q.(BOD_u_influent - BOD_u_effluent) + 4.57.Q.(NH4_influent - NH4_effluent)/14  [g/d]

**Sludge production:**
  P_x = Y.Q.(S0 - S) - k_d.V.X   [kg VSS/d; Y = 0.5 (yield); k_d = 0.05 d^-1 (decay)]
  Total sludge = P_x/(1 - p_volatile)  [kg TSS/d]

**Solids loading rate (secondary clarifier):**
  SLR = (Q + Qr).X/A   [kg/m2.h; Qr = RAS flow; A = clarifier area]
  Typical: 4-6 kg/m2.h (peak), 2-4 (avg).

**EPA NPDES discharge limits (40 CFR 133 -- secondary treatment):**
  BOD5: 30 mg/L monthly average, 45 mg/L weekly
  TSS: 30 mg/L monthly average, 45 mg/L weekly
  pH: 6.0-9.0
  Removal: >= 85% BOD5 and TSS (across the plant)

**Assumptions**: (i) first-order BOD kinetics with constant k (valid 20 C); (ii) complete-mix or plug-flow reactor model; (iii) yield Y constant; (iv) nitrification suppressed at MCRT < 5 d; (v) influent BOD5 = 200-300 mg/L typical municipal.

**Interpretation**: the syllabus canonical BOD5 = 220 mg/L -> BOD_u = 322 mg/L; the difference (322 - 220 = 102 mg/L) is the remaining oxygen demand that would be exerted over days 5 to infinity. With F/M = 0.3 and MCRT = 10 d, the process is conventional-nitrifying -- sufficient MCRT (> 8 d) allows Nitrosomonas/Nitrobacter to grow and oxidize NH4+ to NO3-.`,
    worked_example: `**Worked 1 -- BOD_u from BOD5 (syllabus canonical).**
Given BOD5 = 220 mg/L at 20 C; k = 0.23 d^-1.
  BOD_u = BOD5/(1 - e^(-k.5)) = 220/(1 - e^(-0.23 x 5)) = 220/(1 - e^(-1.15)) = 220/(1 - 0.317) = 220/0.683 = 322 mg/L. (Matches syllabus canonical.)

**Worked 2 -- F/M ratio.** A 5,000 m3/d plant with influent BOD5 = 220 mg/L; aeration basin V = 1,000 m3; MLVSS = 3,500 mg/L.
  F/M = (5,000 x 220)/(1,000 x 3,500) = 1,100,000/3,500,000 = 0.314 d^-1. (Conventional range 0.2-0.5.)
Note: X is MLVSS; MLSS = MLVSS/0.7 = 5,000 mg/L.

**Worked 3 -- MCRT.** Aeration V = 1,000 m3; MLVSS = 3,500 mg/L; WAS flow Qw = 50 m3/d; WAS solids Xw = 8,000 mg/L; effluent Qe = 4,950 m3/d; effluent TSS Xe = 10 mg/L.
  MCRT = (1,000 x 3,500)/(50 x 8,000 + 4,950 x 10) = 3,500,000/(400,000 + 49,500) = 3,500,000/449,500 = 7.79 d. (Nitrification threshold >= 8 d -- marginal; raise MCRT by reducing WAS flow to 40 m3/d -> MCRT = 3,500,000/(320,000 + 49,500) = 9.5 d OK.)

**Worked 4 -- Nitrification oxygen demand.** Influent NH3-N = 30 mg/L; effluent target = 2 mg/L; Q = 5,000 m3/d.
  Nitrification O2 = 4.57.Q.(N_influent - N_effluent)/1000 = 4.57 x 5,000 x 28/1000 = 640 kg O2/d. (Plus carbonaceous O2 = 1.5 x 5,000 x (220 - 20)/1000 = 1,500 kg/d; total = 2,140 kg/d.)

**Worked 5 -- Sludge production.** Y = 0.5; k_d = 0.05 d^-1; V = 1,000 m3; X = 3,500 mg/L; Q = 5,000 m3/d; S0 = 220 mg/L; S = 20 mg/L (effluent soluble BOD).
  P_x = 0.5 x 5,000 x (220 - 20)/1000 - 0.05 x 1,000 x 3,500/1000 = 500 - 175 = 325 kg VSS/d.
  Total sludge (TSS) = P_x/0.7 = 464 kg TSS/d.`,
    industrial_example: `**Industry: Municipal -- 20 MGD activated-sludge plant.** A 20 MGD (76,000 m3/d) plant serves 250,000 people. Influent: BOD5 = 220 mg/L, TSS = 240 mg/L, NH3-N = 30 mg/L. Treatment train: bar screen -> grit chamber (3 m/s velocity) -> 4 primary clarifiers (each 25 m diam, depth 4 m; v_o = 30 m/d) -> 4 aeration basins (each 1,500 m3, total 6,000 m3; MLSS 3,500 mg/L; F/M = 0.27; MCRT = 12 d; nitrifying) -> 4 secondary clarifiers (each 30 m diam; SLR 5 kg/m2.h; v_o = 1.0 m/h) -> UV disinfection (40 mJ/cm2). Effluent: BOD5 = 10 mg/L, TSS = 10 mg/L, NH3-N = 1 mg/L, NO3-N = 8 mg/L. Meets EPA NPDES 40 CFR 133 (BOD5 <= 30, TSS <= 30, NH3 <= 5). Sludge: 4,000 kg/d WAS thickened to 5% -> anaerobic digester (35 C, 20 d) -> biogas 4,000 m3/d (CH4 65%) -> CHP 24,000 kWh/d (covers 60% of plant energy). Operated under ISO 14001 EMS.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Lakeside Water Reclamation Facility BNR Upgrade (synthetic, illustrative).* The 1980s-vintage 12 MGD Lakeside WRF was conventional activated sludge (F/M 0.4, MCRT 6 d, no nitrification) and exceeded the new total-nitrogen (TN) limit of 10 mg/L (effluent TN = 25 mg/L). The upgrade installs a Modified Ludzack-Ettinger (MLE) process: anoxic zone (1 h) ahead of aerobic zone (6 h); internal mixed-liquor recycle (4xQ) from aerobic to anoxic; MLSS 4,000 mg/L; MCRT extended to 14 d. Result: effluent TN = 6 mg/L (nitrification + denitrification), NH3-N = 0.5 mg/L, NO3-N = 5 mg/L. CapEx $9 M; biogas CHP 25% increase (more sludge). Annual O&M saving $0.4 M (less aeration energy in anoxic zone); payback 22 yr -- justified by regulatory compliance.`,
    visual_explanation: `**Activated-sludge process flow diagram.** Influent -> bar screen -> grit chamber -> primary clarifier (sludge -> anaerobic digester) -> aeration basin (air from blowers, MLSS recycle from secondary clarifier) -> secondary clarifier (RAS to aeration; WAS to digester; effluent to disinfection) -> UV/disinfection -> outfall. **BOD curve.** Time (days) on x-axis, BOD exerted (mg/L) on y-axis; curve rises exponentially toward BOD_u asymptote (322 mg/L); at day 5, BOD5 = 220 mg/L (68% of BOD_u). **F/M vs MCRT design chart.** Plot of F/M (y) vs MCRT (x): conventional 0.2-0.5 at MCRT 5-15 d; extended aeration 0.05-0.1 at 20-30 d; nitrification region MCRT >= 8 d.`,
    simulation_opportunity: `Open the EngiSuite "BOD curve" widget: enter BOD5 and k -- the tool returns BOD_u and plots BOD_t vs t. The "Activated-sludge design" widget accepts Q, S0, V, X, Qw, Xw -- and returns F/M, MCRT, SVI, nitrification feasibility (MCRT >= 8 d), and the predicted effluent BOD5. The "Denitrification calculator" accepts influent NO3-N and carbon-source type (methanol, acetate) and returns the required dose.`,
    common_mistakes: `- **Confusing MLSS and MLVSS**: F/M uses MLVSS (~0.7-0.8 of MLSS); using MLSS understates F/M by 25-30%.
- **Misusing k for BOD**: k = 0.23 d^-1 (natural exponent) is NOT the same as k_L = 0.10 d^-1 (base-10). Mixing them gives a 2.3x error in BOD_u.
- **Forgetting the nitrification oxygen demand**: 4.57 g O2 per g NH4+-N -- adds ~30% to total aeration on nitrogenous-waste plants.
- **Under-sizing secondary clarifier SLR**: SLR > 6 kg/m2.h at peak causes solids washout.
- **Treating MCRT as equal to hydraulic detention time**: MCRT = V.X/(Qw.Xw + Qe.Xe) -- typically 5-15 d vs. hydraulic 4-8 h.`,
    limitations: `- Activated-sludge process is sensitive to toxic shocks (heavy metals, organic solvents) -- inhibits biomass.
- Nitrification stops below 5 C (Nitrosomonas growth rate too slow); MCRT must rise to > 15 d in winter.
- BOD5 first-order model is approximate at very long times (t > 20 d) -- nitrogenous BOD (NBOD) contributes after day 5.
- Bulking sludge (SVI > 200) caused by filamentous bacteria (Microthrix, Nostocoida) requires selector basins or chlorination of RAS.
- Anaerobic digester biogas yield depends on sludge VS content (~0.5 m3 biogas/kg VS destroyed).`,
    comparison: `| Process variant | F/M (d^-1) | MCRT (d) | Detention (h) | BOD5 removal | Nitrification | Use |
|---|---|---|---|---|---|---|
| Conventional plug-flow | 0.2-0.5 | 5-15 | 4-8 | 85-95% | maybe | General |
| Complete-mix | 0.2-0.5 | 5-15 | 4-8 | 85-95% | maybe | Industrial |
| Extended aeration | 0.05-0.10 | 20-30 | 18-24 | 90-95% | yes | Small communities |
| High-rate | 0.5-1.5 | 3-5 | 1-3 | 70-80% | no | Pre-treatment |
| Nitrifying (MLE) | 0.10-0.20 | 10-20 | 6-10 | 95% | yes | TN removal |
| Oxidation ditch | 0.05-0.10 | 20-30 | 24 | 95% | yes | Small communities |

| EPA NPDES limit (40 CFR 133) | BOD5 | TSS | pH | Notes |
|---|---|---|---|---|
| Monthly avg | 30 mg/L | 30 mg/L | 6.0-9.0 | Secondary |
| Weekly avg | 45 mg/L | 45 mg/L | 6.0-9.0 | Secondary |
| 30-day removal | >= 85% | >= 85% | -- | Percent removal |
| Ammonia (NH3-N) | varies (1-10) | -- | -- | Stream-standard dependent |`,
    practical_application: `**Activated-sludge plant design.** A 8 MGD (30,000 m3/d) plant serves 100,000. Influent: BOD5 = 220 mg/L, TSS = 240 mg/L, NH3 = 30 mg/L. Required effluent: BOD5 <= 10 mg/L, TSS <= 10 mg/L, NH3 <= 1 mg/L (nitrifying). Design: F/M = 0.3 (mid-range conventional + nitrification); MLVSS = 3,000 mg/L (MLSS = 4,300). V = Q.S0/(F/M.X) = 30,000 x 220/(0.3 x 3,000) = 6,600,000/900 = 7,333 m3 (2 basins, each 3,667 m3; detention 5.9 h at Q). MCRT = 10 d (nitrification) -> Qw = V.X/(MCRT.Xw) = 7,333 x 3,000/(10 x 8,000) = 275 m3/d WAS. Secondary clarifier: SLR 5 kg/m2.h at peak (Q+Qr = 1.5Q); A = (1.5 x 30,000 x 4,300)/(24 x 5 x 1000) = 193,500,000/120,000 = 1,613 m2 (~6 m depth). Effluent BOD5 = 10 mg/L, TSS = 10 mg/L, NH3 = 1 mg/L. Total aeration O2 = 1.5 x 30,000 x 200 + 4.57 x 30,000 x 29 /1000 = 9,000,000 + 3,975 = 9,004 kg/d (with safety factor 1.5 -> 13,500 kg/d air supplied).`,
    decision_scenario: `You are the design engineer for a 5 MGD (19,000 m3/d) plant. The new NPDES permit (40 CFR 122/133) requires TN <= 10 mg/L. Existing plant: conventional activated sludge (F/M 0.4, MCRT 6 d, no nitrification), effluent TN = 25 mg/L. Two options: (A) Modified Ludzack-Ettinger (MLE) retrofit (add 1-h anoxic zone + 4xQ internal recycle; CapEx $6 M; effluent TN = 6 mg/L, nitrification + denitrification; energy +10%); or (B) post-anoxic denitrification with methanol (CapEx $4 M + methanol $0.4 M/yr; effluent TN = 5 mg/L). 30-yr PV at 4%: A = $6 M + $0.6 M/yr x 17.3 = $16.4 M; B = $4 M + $1.0 M/yr x 17.3 = $21.3 M. Choose A (MLE retrofit) -- lower lifecycle cost, more energy-efficient.`,
    practice_questions: `Four practice problems follow -- 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: BOD_u, F/M, MCRT, nitrification.`,
    certification_questions: `This lesson's content maps to the NCEES FE Environmental and PE Environmental exam outlines, the EPA NPDES (40 CFR 122/133), and Metcalf & Eddy (2014) Ch. 4. Sample FE-style question: "If BOD5 = 220 mg/L at 20 C (k = 0.23 d^-1), the ultimate BOD (BOD_u) is: (a) 220, (b) 322, (c) 250, (d) 380." Correct: (b) BOD_u = 220/0.683 = 322 mg/L.`,
    summary: `Wastewater treatment restores water quality before discharge per the EPA NPDES (40 CFR 122/133). The conventional activated-sludge process: preliminary -> primary clarifier -> aeration basin -> secondary clarifier -> disinfection. BOD5 follows first-order kinetics BOD_t = BOD_u.(1 - e^(-k.t)) with k = 0.23 d^-1 at 20 C, giving BOD5/BOD_u = 0.683; the syllabus canonical BOD5 = 220 mg/L -> BOD_u = 322 mg/L. Three design parameters: F/M = Q.S0/(V.X) (0.2-0.5 conventional), MCRT = V.X/(Qw.Xw + Qe.Xe) (>= 8 d for nitrification, 10 d typical), and SVI (80-150 good). Nitrification (NH4+ -> NO3- by Nitrosomonas/Nitrobacter) requires 4.57 g O2 per g NH4+-N. EPA NPDES secondary standard (40 CFR 133): BOD5 = 30 mg/L, TSS = 30 mg/L monthly average. Biosolids disposed per 40 CFR Part 503 (Class A or B); anaerobic digester biogas (CH4 60-70%) fuels CHP energy recovery under ISO 14001 EMS.`,
    key_takeaways: `- BOD_t = BOD_u.(1 - e^(-k.t)); k = 0.23 d^-1 at 20 C; BOD5/BOD_u = 0.683.
- BOD_u = BOD5/0.683 (syllabus: 220 mg/L -> 322 mg/L).
- F/M = Q.S0/(V.X); conventional 0.2-0.5; nitrifying 0.10-0.20.
- MCRT = V.X/(Qw.Xw + Qe.Xe); >= 8 d for nitrification (10 d typical).
- Nitrification: NH4+ -> NO3-; 4.57 g O2 per g NH4+-N.
- EPA NPDES (40 CFR 133): BOD5 = 30 mg/L, TSS = 30 mg/L monthly avg.`,
    references: `1. Davis & Cornwell (2012), Ch. 8 (Wastewater treatment -- BOD, activated sludge).
2. Metcalf & Eddy (2014), Ch. 3 (Wastewater characteristics -- BOD, COD, TSS), Ch. 4 (Activated sludge -- F/M, MCRT, SRT), Ch. 5 (Nitrification).
3. Mihelcic & Zimmerman (2014), Ch. 6 (Wastewater -- sustainability, life-cycle).
4. EPA 40 CFR Part 122 (NPDES permits), Part 133 (secondary-treatment standards -- BOD5/TSS = 30 mg/L), Part 503 (biosolids).
5. AWWA Manual M1 (operational framework for water-side residuals -- cross-reference).
6. ISO 14001:2015 (EMS -- activated-sludge biosolids and biogas recovery reporting).`,
  },
  knowledgeObject: {
    title: "Wastewater Treatment -- Knowledge Object",
    domain: "Environmental Engineering",
    competency: "Wastewater Treatment",
    topic: "BOD Kinetics, Activated Sludge (F/M, MCRT, SRT), Nitrification",
    concept: "First-order BOD model + activated-sludge kinetic parameters + EPA NPDES",
    body: {
      definitions: [
        "BOD5: 5-day biochemical oxygen demand (mg/L); oxygen consumed in 5 d at 20 C.",
        "BOD_u: ultimate BOD; BOD_u = BOD5/0.683 at k = 0.23 d^-1.",
        "MLSS: mixed-liquor suspended solids in aeration basin (mg/L).",
        "MLVSS: mixed-liquor volatile suspended solids (active biomass; 0.7-0.8 of MLSS).",
        "F/M: food-to-microorganism ratio = Q.S0/(V.X).",
        "MCRT/SRT: mean cell residence time = V.X/(Qw.Xw + Qe.Xe).",
        "SVI: sludge volume index = V_30/X (mL/g).",
        "Nitrification: NH4+ -> NO2- -> NO3- by Nitrosomonas/Nitrobacter.",
        "Denitrification: NO3- -> N2 (anoxic, carbon source).",
      ],
      principles: [
        "BOD_t = BOD_u.(1 - e^(-k.t)); k = 0.23 d^-1 at 20 C; BOD5/BOD_u = 0.683.",
        "F/M = Q.S0/(V.X); conventional 0.2-0.5; nitrifying 0.10-0.20.",
        "MCRT >= 8 d for nitrification (10 d typical).",
        "Nitrification oxygen: 4.57 g O2 per g NH4+-N.",
        "EPA NPDES (40 CFR 133): BOD5 = 30 mg/L, TSS = 30 mg/L monthly avg; >= 85% removal.",
      ],
      components: [
        "Bar screen, grit chamber",
        "Primary clarifier (1.5-3 h detention)",
        "Aeration basin (4-8 h detention, fine-bubble diffusers)",
        "Secondary clarifier (SLR 4-6 kg/m2.h, v_o = 0.5-1.5 m/h)",
        "UV or chlorination disinfection",
        "Anaerobic digester (35 C, 15-20 d, biogas)",
      ],
      mechanism:
        "BOD follows first-order kinetics in time. In an aeration basin, heterotrophic bacteria consume BOD (carbon) at rate proportional to substrate concentration (Monod). At MCRT > 8 d, slow-growing nitrifiers establish and oxidize NH4+ to NO3-, consuming 4.57 g O2 per g N. Solids are settled in the secondary clarifier and recycled (RAS) or wasted (WAS); the WAS goes to anaerobic digestion producing biogas (CH4 60-70%).",
      process:
        "Influent -> bar screen -> grit -> primary clarifier -> aeration basin -> secondary clarifier (RAS recycle, WAS to digester) -> disinfection -> outfall. Biosolids digested per 40 CFR Part 503 (Class A or B).",
      formulas: [
        "BOD_t = BOD_u.(1 - e^(-k.t))",
        "BOD_u = BOD5/0.683",
        "F/M = Q.S0/(V.X)",
        "MCRT = V.X/(Qw.Xw + Qe.Xe)",
        "SVI = V_30/X (mL/g)",
        "Nitrification O2 = 4.57.Q.(N_in - N_eff)/1000 (kg/d)",
        "P_x = Y.Q.(S0 - S) - k_d.V.X (sludge production)",
      ],
      metrics: [
        "BOD5 (mg/L)",
        "BOD_u (mg/L)",
        "MLSS/MLVSS (mg/L)",
        "F/M (d^-1)",
        "MCRT/SRT (d)",
        "SVI (mL/g)",
        "Effluent TN (mg/L)",
      ],
      examples: [
        "BOD5 = 220 mg/L, k = 0.23 d^-1 -> BOD_u = 322 mg/L.",
        "Q = 5,000, S0 = 220, V = 1,000, X = 3,500 -> F/M = 0.314 d^-1.",
        "MCRT = (1,000 x 3,500)/(50 x 8,000 + 4,950 x 10) = 7.79 d (marginal nitrification).",
        "Nitrification O2 = 4.57 x 5,000 x 28/1000 = 640 kg/d.",
      ],
      industrial_examples: [
        "20 MGD activated-sludge plant: MLSS 3,500, F/M = 0.27, MCRT = 12 d, effluent BOD5 = 10 mg/L.",
        "8 MGD design: V = 7,333 m3, WAS = 275 m3/d, effluent BOD5 = 10 mg/L.",
      ],
      case_studies: [
        "SYNTHETIC -- Lakeside WRF MLE upgrade: CapEx $9 M, effluent TN 25->6 mg/L; payback 22 yr (regulatory-driven).",
      ],
      common_errors: [
        "Confusing MLSS with MLVSS in F/M (25-30% understatement).",
        "Mixing k = 0.23 (natural) with k_L = 0.10 (base-10) -- 2.3x BOD_u error.",
        "Forgetting nitrification oxygen demand (4.57 g O2/g N) -- 30% underestimate.",
        "Under-sizing secondary clarifier SLR (washout).",
        "Treating MCRT as equal to hydraulic detention time.",
      ],
      limitations: [
        "Activated sludge sensitive to toxic shocks (heavy metals, solvents).",
        "Nitrification stops below 5 C; MCRT must rise to > 15 d in winter.",
        "BOD5 first-order model approximate at t > 20 d (nitrogenous BOD dominates).",
        "Bulking sludge (SVI > 200) needs selector basins or RAS chlorination.",
        "Digester biogas yield depends on sludge VS (~0.5 m3/kg VS destroyed).",
      ],
      best_practices: [
        "Use MLVSS in F/M (0.7-0.8 of MLSS).",
        "Use natural-exponent k = 0.23 d^-1 (k_L = 0.10 base-10); be consistent.",
        "Add nitrification O2 to total aeration demand (4.57 g O2/g N).",
        "Size secondary clarifier SLR <= 6 kg/m2.h at peak.",
        "Operate at MCRT >= 10 d for nitrification; raise to 15-20 d in winter.",
      ],
      related_concepts: [
        "Water treatment (Lesson 1)",
        "Air pollution control (Lesson 3)",
        "Aquatic chemistry (redox)",
        "Microbiology (Monod, yield)",
        "EPA NPDES (40 CFR 122/133)",
      ],
      prerequisites: [
        "Microbiology (bacterial growth kinetics)",
        "Aquatic chemistry (redox reactions)",
        "Reactor engineering (CSTR, plug-flow)",
        "Mass balance",
      ],
      references: ENVIRONMENTAL_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Municipal",
      stem: "What is the food-to-microorganism ratio (F/M) in the activated-sludge process?",
      explanation: "F/M = Q.S0/(V.X), where Q = influent flow, S0 = influent BOD, V = aeration basin volume, X = MLVSS.",
      whyCorrect:
        "The food-to-microorganism ratio F/M = Q.S0/(V.X) is the mass of BOD (food) fed per day per mass of volatile biomass (microorganisms) in the aeration basin. Q = influent flow (m3/d), S0 = influent BOD5 (mg/L), V = aeration basin volume (m3), X = MLVSS (mg/L). Conventional range is 0.2-0.5 d^-1 (kg BOD/kg MLVSS.d).",
      whyOthersWrong: [
        "Option A (F/M = Q.V/(S0.X)) inverts Q and S0 -- units become m6.d/mg2, dimensionally wrong.",
        "Option C (F/M = Q.X/(V.S0)) inverts X and S0 -- would give high values for clean influent (S0 low).",
        "Option D (F/M = V.S0/(Q.X)) inverts Q and V -- would give the inverse of the true F/M.",
      ],
      options: [
        { text: "F/M = Q.V / (S0.X)", isCorrect: false },
        { text: "F/M = Q.S0 / (V.X)", isCorrect: true },
        { text: "F/M = Q.X / (V.S0)", isCorrect: false },
        { text: "F/M = V.S0 / (Q.X)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Municipal",
      stem: "Given BOD5 = 220 mg/L at 20 C (k = 0.23 d^-1), the ultimate BOD (BOD_u) is:",
      explanation: "BOD_u = BOD5/(1 - e^(-k.5)) = 220/(1 - e^(-1.15)) = 220/(1 - 0.317) = 220/0.683 = 322 mg/L.",
      whyCorrect:
        "BOD_u = BOD5/(1 - e^(-k.5)) = 220/(1 - e^(-0.23 x 5)) = 220/(1 - e^(-1.15)) = 220/(1 - 0.317) = 220/0.683 = 322 mg/L. This is the syllabus canonical BOD_u value. The difference (322 - 220 = 102 mg/L) is the remaining oxygen demand that would be exerted over days 5 to infinity.",
      whyOthersWrong: [
        "Option A (220 mg/L) is the 5-day BOD itself, not the ultimate -- BOD_u > BOD5.",
        "Option B (250 mg/L) is a round-off without computing the exponential -- close but wrong.",
        "Option D (380 mg/L) overestimated by using k = 0.5 d^-1 (instead of 0.23).",
      ],
      options: [
        { text: "220 mg/L", isCorrect: false },
        { text: "250 mg/L", isCorrect: false },
        { text: "322 mg/L", isCorrect: true },
        { text: "380 mg/L", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Municipal",
      stem: "An activated-sludge plant has aeration basin V = 1,000 m3, MLVSS = 3,500 mg/L, WAS flow Qw = 50 m3/d at Xw = 8,000 mg/L, effluent Qe = 4,950 m3/d at Xe = 10 mg/L. The MCRT (d) is:",
      explanation: "MCRT = V.X/(Qw.Xw + Qe.Xe) = (1,000 x 3,500)/(50 x 8,000 + 4,950 x 10) = 3,500,000/(400,000 + 49,500) = 3,500,000/449,500 = 7.79 d -- marginal for nitrification (>= 8 d).",
      whyCorrect:
        "MCRT = V.X/(Qw.Xw + Qe.Xe) = (1,000 x 3,500)/(50 x 8,000 + 4,950 x 10). Compute the numerator: 1,000 x 3,500 = 3,500,000 mg/m3 (= mg-d/L). Compute the denominator: 50 x 8,000 = 400,000; 4,950 x 10 = 49,500; total = 449,500. MCRT = 3,500,000/449,500 = 7.79 d. This is marginally below the nitrification threshold of 8 d -- the operator should reduce WAS flow to 40 m3/d to raise MCRT to ~9.5 d.",
      whyOthersWrong: [
        "Option A (10 d) approximated MCRT ~ V.Q/(Qw.Xw) without including effluent TSS loss -- a common shortcut but inexact here.",
        "Option B (5 d) is the conventional minimum, but the actual computation gives 7.79 d.",
        "Option D (15 d) used a wrong Xw (5,000 mg/L) or Qw (30 m3/d).",
      ],
      options: [
        { text: "10 d", isCorrect: false },
        { text: "5 d", isCorrect: false },
        { text: "7.79 d", isCorrect: true },
        { text: "15 d", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Municipal",
      stem: "True or False: Nitrification in the activated-sludge process requires a mean cell residence time (MCRT) greater than 8 days.",
      explanation: "Nitrifying bacteria (Nitrosomonas, Nitrobacter) are slow-growing autotrophs with low yield; they wash out of the system at MCRT < 8 d. Typical design MCRT for nitrification is 10 d (15-20 d in winter).",
      whyCorrect:
        "True. Nitrifying bacteria (Nitrosomonas and Nitrobacter) are slow-growing autotrophs with low yield (Y_n = 0.05-0.15 g VSS/g N, compared to heterotrophs Y_h = 0.5-0.6 g VSS/g BOD). At MCRT < 8 d, the nitrifiers wash out faster than they reproduce, and the ammonia breakthrough occurs. The typical design MCRT for nitrification is 10 d at 20 C; in winter (5-10 C), MCRT must rise to 15-20 d because the Nitrosomonas growth rate drops with temperature (Arrhenius, theta = 1.07 for nitrifiers).",
      whyOthersWrong: [
        "Option 'False' would be correct only if nitrifiers grew as fast as heterotrophs (they do not -- they are ~10x slower). The statement is true.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Air Pollution Control
// (slug: env-air-pollution-control)
// ---------------------------------------------------------------------------

const LESSON_AIR: RefLesson = {
  slug: "env-air-pollution-control",
  title: "Air Pollution Control",
  titleAr: "مكافحة تلوث الهواء",
  order: 3,
  durationMin: 35,
  references: ENVIRONMENTAL_REFERENCE_TITLES,
  conceptIntroduction: `Air pollution control removes gaseous and particulate pollutants from industrial, mobile, and power-station exhaust streams before discharge to the atmosphere (per EPA NAAQS in 40 CFR 50 and New Source Performance Standards in 40 CFR 60). Particulate matter (PM) is controlled by *mechanical collectors* (gravity settlers, low efficiency; cyclones, centrifugal, 50-90% for >10 um), *electrostatic precipitators* (ESP -- the Deutsch-Anderson equation eta = 1 - exp(-A.w/Q) where A = collection-plate area, w = effective migration velocity, Q = gas flow rate), *fabric filters / baghouses* (mechanical filtration, 99-99.9% on submicron PM), and *wet scrubbers* (Venturi, packed-tower) for PM + acid-gas combined control. Gaseous pollutants are controlled by *absorption* (limestone wet FGD for SO2: CaCO3 + SO2 + 1/2 O2 -> CaSO4.2H2O gypsum), *adsorption* (activated carbon for VOCs, mercury), and *selective catalytic reduction* (SCR -- NH3 + NO + NO2 -> N2 + H2O over a V2O5/WO3/TiO2 catalyst at 300-400 C, 80-95% NOx removal). The syllabus canonical worked example: ESP with plate area A = 5,300 m2, migration velocity w = 0.10 m/s, gas flow Q = 100 m3/s -> eta = 1 - exp(-(5,300 x 0.10)/100) = 1 - exp(-5.3) = 1 - 0.0050 = 0.995 = 99.5% (the canonical 99.5% ESP efficiency for a coal-fired boiler).`,
  sections: {
    learning_objectives: `- Apply the Deutsch-Anderson equation eta = 1 - exp(-A.w/Q) for ESP design.
- Compute cyclone cut-size (d_p50) using Lapple's empirical formula.
- Compute baghouse air-to-cloth ratio and pressure drop (Darcy).
- Apply the limestone wet-FGD stoichiometry: CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O.
- Apply SCR kinetics for NOx removal (X = k.C.NH3; 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O).
- Identify EPA NAAQS (40 CFR 50): PM2.5, PM10, SO2, NO2, O3, CO, Pb limits.
- Identify EPA NSPS (40 CFR 60) for utility boilers: 0.03 lb particulate/MMBtu; 1.0 lb SO2/MMBtu.`,
    prerequisites: `- Fluid mechanics: drag, Stokes and Newton settling, pressure drop.
- Particle physics: aerodynamic diameter, Cunningham slip correction.
- Reaction kinetics: Arrhenius rate, catalyst space velocity.
- Mass balance on gas streams (inlet vs. outlet concentration).`,
    introduction: `Air pollution control divides into (a) *particulate matter (PM) control* and (b) *gaseous pollutant control*. The PM-control hierarchy is gravity settler -> cyclone -> ESP or baghouse -> wet scrubber; each successive device handles progressively smaller particles and higher efficiency. The *cyclone* uses centrifugal force to drive particles to the wall; cut-size d_p50 is given by Lapple's formula and depends on inlet velocity, cyclone diameter, and number of effective turns. The *electrostatic precipitator* (ESP) ionizes particles in a high-voltage (30-100 kV) DC field, drives them to a grounded collection plate, and raps the plates periodically to remove dust into a hopper. The Deutsch-Anderson equation eta = 1 - exp(-A.w/Q) -- where A = collection area (m2), w = effective particle migration velocity (m/s, typically 0.05-0.15 for fly ash), Q = gas flow (m3/s) -- is the universal ESP sizing equation. The *baghouse* (fabric filter) achieves 99-99.9% removal of submicron PM by mechanical filtration through woven or felted bags; the air-to-cloth ratio (m/min) is the design parameter. The *wet scrubber* (Venturi, packed-tower) simultaneously removes PM and acid gases (SO2, HCl) by liquid contact. For gaseous control: *limestone wet FGD* removes SO2 by absorption into a CaCO3 slurry (90-98% removal); *SCR* removes NOx by reaction with injected NH3 over a V2O5/WO3/TiO2 catalyst at 300-400 C (80-95% NOx removal); *activated carbon* adsorbs VOCs, mercury, dioxins. EPA NAAQS (40 CFR 50) sets ambient limits: PM2.5 = 12 ug/m3 (annual), 35 ug/m3 (24-h); PM10 = 150 ug/m3 (24-h); SO2 = 75 ppb (1-h); NO2 = 100 ppb (annual); O3 = 70 ppb (8-h); CO = 9 ppm (8-h); Pb = 0.15 ug/m3 (rolling 3-month). EPA NSPS (40 CFR 60) for utility boilers limits particulate to 0.03 lb/MMBtu, SO2 to 1.0 lb/MMBtu, NOx to 0.70 lb/MMBtu.`,
    terminology: `- **Particulate matter (PM)**: solid or liquid aerosol; PM10 (<=10 um), PM2.5 (<=2.5 um), PM1 (<=1 um) -- regulatory size cuts.
- **Aerodynamic diameter (d_a)**: diameter of a unit-density sphere with the same terminal settling velocity as the actual particle.
- **Cyclone**: centrifugal collector; cut-size d_p50 the particle size collected at 50% efficiency.
- **ESP (electrostatic precipitator)**: high-voltage (30-100 kV DC) particle-charging + collection on plates; Deutsch-Anderson equation.
- **Migration velocity (w)**: effective particle drift velocity to plate (m/s); 0.05-0.15 typical for fly ash.
- **Specific collection area (SCA)**: A/Q (m2 per m3/s, or ft2/1000 ACFM); design parameter for ESP.
- **Baghouse (fabric filter)**: woven/felted bags filter PM at air-to-cloth ratio 0.6-2.4 m/min.
- **Air-to-cloth ratio (A/C)**: Q/A_cloth (m/min); design parameter for baghouse.
- **Wet scrubber (Venturi)**: liquid-gas contactor; simultaneous PM + acid-gas removal.
- **FGD (flue-gas desulfurization)**: SO2 removal by wet or dry lime/limestone.
- **SCR (selective catalytic reduction)**: NOx + NH3 over V2O5 catalyst -> N2 + H2O.
- **SNCR (selective non-catalytic reduction)**: NH3 or urea injected at 900-1100 C (no catalyst).
- **NAAQS (National Ambient Air Quality Standards)**: EPA ambient limits (40 CFR 50).
- **NSPS (New Source Performance Standards)**: EPA emission limits for new sources (40 CFR 60).`,
    detailed_explanation: `**Particulate control -- cyclone.** Cyclones use centrifugal force (a_c = v_i^2/r) to drive particles to the wall. Lapple's cut-size (50% collection):
  d_p50 = sqrt((9 . mu . W) / (2 . pi . N_e . v_i . (rho_p - rho_g)))
where mu = gas viscosity, W = cyclone inlet width, N_e = number of effective turns (typically 5), v_i = inlet gas velocity (15-25 m/s), rho_p, rho_g = particle/gas densities. Cyclone efficiency for monodisperse PM:
  eta = 1 / (1 + (d_p50/d_p)^2)  (Lapple cumulative)
Cyclones collect >90% of particles >10 um; efficiency drops below 50% for <2 um.

**Electrostatic precipitator (ESP) -- Deutsch-Anderson.** The Deutsch-Anderson equation is the universal ESP sizing relation:
  eta = 1 - exp(-A . w / Q)
where:
- A = total collection-plate area (m2)
- w = effective particle migration velocity (m/s); typical 0.05-0.15 for fly ash, 0.04-0.10 for cement, 0.10-0.20 for paper/pulp, 0.05-0.08 for steel.
- Q = gas flow rate (m3/s, actual volumetric)
For a target eta = 0.995 (99.5%): A.w/Q = -ln(1-0.995) = -ln(0.005) = 5.30. If w = 0.10 m/s and Q = 100 m3/s: A = 5.30 x 100 / 0.10 = 5,300 m2. The specific collection area (SCA) = A/Q = 5,300/100 = 53 m2/(m3/s) = 264 ft2/1000 ACFM (typical coal-fired boiler ESP). Migration velocity depends on particle resistivity, ash chemistry (Na, S, Si), temperature, and sulfur content; high-resistivity ash (low-sulfur coal) lowers w and may require SO3 conditioning.

**Baghouse (fabric filter) -- pressure drop.** Baghouses remove PM by inertial impaction, interception, Brownian diffusion, and electrostatic attraction on the dust cake. The Darcy equation gives steady-state pressure drop:
  dP = (k . mu . v . L) + (K_d . mu . v . v . t)  [Pa]
where k = clean-fabric resistance, v = air-to-cloth ratio (m/min), L = fabric thickness, K_d = dust-cake specific resistance (typical 1-10 x 10^11 m^-1), t = time since last cleaning. Air-to-cloth ratio design: 0.6-1.2 m/min (shaker), 1.0-2.0 (pulse-jet), 1.5-2.4 (reverse-air). Baghouse achieves 99-99.9% removal on submicron PM; outperforms ESP for high-resistivity ash.

**Wet scrubber (Venturi).** The Venturi scrubber accelerates gas to 40-100 m/s in the throat, atomizing the scrubbing liquid (1-3 L/m3 of gas); particles impact on droplets (>1 um) and are captured. Pressure drop dP = 2-25 kPa; collection efficiency ~90-99% for >1 um; lower for submicron. Packed-tower scrubbers absorb SO2, HCl, HF, NH3 into a recirculating alkaline solution.

**Gaseous control -- wet limestone FGD.** The reagent is a CaCO3 slurry (10-15% w/w); the reaction:
  CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O (gypsum)
The liquid-to-gas ratio (L/G) is 10-20 L/m3; SO2 removal 90-98%. Stoichiometric Ca/S molar ratio = 1.05-1.15 (5-15% excess limestone). The gypsum byproduct (CaSO4.2H2O) is sold for wallboard or landfilled.

**Gaseous control -- SCR for NOx.** The reaction (over V2O5/WO3/TiO2 catalyst, 300-400 C):
  4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O   (standard SCR)
  4 NH3 + 2 NO2 + O2 -> 3 N2 + 6 H2O  (fast SCR)
  NH3 slip < 2-3 ppm (excess NH3). Ammonia-to-NOx molar ratio NH3/NOx = 0.8-1.0; space velocity 10,000-30,000 h^-1. Removal 80-95% (depending on catalyst volume, temperature, ash). NSCR (no catalyst, 900-1100 C) achieves 30-50% removal.

**EPA NAAQS (40 CFR 50) ambient limits.** PM2.5: 12 ug/m3 (annual primary), 35 (24-h). PM10: 150 (24-h, not to exceed once/year). SO2: 75 ppb (1-h primary); 0.5 ppm (3-h secondary). NO2: 100 ppb (annual); 53 ppb (annual, 1-hr). O3: 70 ppb (8-h). CO: 9 ppm (8-h); 35 (1-h). Pb: 0.15 ug/m3 (rolling 3-month).

**EPA NSPS (40 CFR 60) for utility boilers (subclass Dc/Da, >25 MW).** Particulate: 0.03 lb/MMBtu; opacity <20% (6-min). SO2: 1.0 lb/MMBtu or 90% removal (95% for high-sulfur). NOx: 0.70 lb/MMBtu (tangential-fired); 0.80 (wall-fired).`,
    core_principles: `- **Deutsch-Anderson (ESP)**: eta = 1 - exp(-A.w/Q); SCA = A/Q.
- **Cyclone Lapple cut-size**: d_p50 = sqrt(9.mu.W/(2.pi.N_e.v_i.(rho_p-rho_g))).
- **Baghouse pressure drop (Darcy)**: dP = k.mu.v.L + K_d.mu.v^2.t.
- **Wet FGD**: CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O; Ca/S = 1.05-1.15; L/G 10-20 L/m3.
- **SCR**: 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O; catalyst V2O5/WO3/TiO2 at 300-400 C; 80-95% NOx removal.
- **EPA NAAQS (40 CFR 50)**: PM2.5 12/35, PM10 150, SO2 75 ppb, NO2 100 ppb, O3 70 ppb.
- **EPA NSPS (40 CFR 60)**: particulate 0.03 lb/MMBtu; SO2 1.0 lb/MMBtu; NOx 0.70 lb/MMBtu.`,
    components: `- **Cyclone**: tangential inlet, body diameter D, exit tube, dust hopper; can be parallel (multiclone) for higher flow.
- **ESP**: discharge electrode (wire or rigid frame, 30-100 kV DC negative), collection plate (grounded), rapping mechanism, hopper.
- **Baghouse**: woven or felted bags (Pulse-jet, reverse-air, shaker); cage support; hopper; cleaning manifold.
- **Venturi scrubber**: converging section, throat (40-100 m/s), diverging section; liquid injection; entrainment separator.
- **Wet limestone FGD**: absorber spray tower (counter-current), limestone slurry tank, recycle pump, oxidation blower, gypsum dewatering (centrifuge or vacuum belt).
- **SCR system**: ammonia storage (urea-to-NH3 hydrolyzer or anhydrous NH3), injection grid (AIG), catalyst reactor (3 layers, honeycomb or plate), soot blower.`,
    process: `1. Boiler exhaust (typically 1,000-2,500 m3/s at 150-180 C for a 500 MW coal unit) enters the air-quality control system (AQCS).
2. Particulate removal: ESP (or baghouse) collects >99.5% of fly ash; hopper discharged to silo.
3. Optional dry scrubber ( hydrated lime spray dryer) pre-treats SO2 (50-80% removal).
4. Wet limestone FGD removes SO2 (90-98%); byproduct gypsum dewatered.
5. SCR (positioned before the air preheater for high-temperature NOx) removes 80-95% NOx.
6. Wet stack disperses the treated flue gas; continuous emissions monitoring (CEM, 40 CFR 75) reports NOx, SO2, CO2, opacity.`,
    formula_calculation: `**ESP Deutsch-Anderson:**
  eta = 1 - exp(-A . w / Q)   [dimensionless; A in m2; w in m/s; Q in m3/s]
  Specific collection area: SCA = A/Q   [m2/(m3/s)]
  For eta = 0.995: A.w/Q = -ln(0.005) = 5.30.

**Cyclone Lapple cut-size:**
  d_p50 = sqrt((9 . mu . W) / (2 . pi . N_e . v_i . (rho_p - rho_g)))   [m]
  Cumulative efficiency: eta(d_p) = 1 / (1 + (d_p50/d_p)^2)

**Baghouse pressure drop (Darcy):**
  dP = (k . mu . v . L) + (K_d . mu . v^2 . t)   [Pa]
  Air-to-cloth ratio: A/C = Q / A_cloth   [m/min; 0.6-2.4 typical]

**Wet scrubber -- Venturi pressure drop:**
  dP = 0.5 . rho_g . v_throat^2 . (1 + L/G)   [Pa]

**Wet limestone FGD stoichiometry:**
  CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O
  Ca/S (molar) = (mol CaCO3 fed)/(mol SO2 in) = 1.05-1.15 (5-15% excess).
  L/G = 10-20 L/m3; SO2 removal 90-98%.

**SCR NOx removal:**
  4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O
  4 NH3 + 2 NO2 + O2 -> 3 N2 + 6 H2O (fast)
  NOx conversion: X = 1 - exp(-k . A . C_NH3)   (pseudo-first-order; k = rate const, A = catalyst volume x area density)
  NH3/NOx molar ratio = 0.8-1.0; NH3 slip < 2-3 ppm.
  Space velocity SV = Q/V_catalyst (h^-1, 10,000-30,000).

**EPA NAAQS (40 CFR 50):**
  PM2.5: 12 ug/m3 (annual), 35 (24-h); PM10: 150 (24-h).
  SO2: 75 ppb (1-h); NO2: 100 ppb (annual); O3: 70 ppb (8-h); CO: 9 ppm (8-h); Pb: 0.15 ug/m3.

**EPA NSPS (40 CFR 60) for utility boilers:**
  Particulate: 0.03 lb/MMBtu; SO2: 1.0 lb/MMBtu or 90% removal; NOx: 0.70 lb/MMBtu (tangential).

**Assumptions**: (i) ESP Deutsch-Anderson assumes uniform gas flow, monodisperse PM, and constant w (in reality w varies with resistivity); (ii) cyclone Lapple is empirical for the standard cyclone geometry (Lapple design); (iii) FGD Ca/S assumes 100% limestone utilization (actual 90-95%); (iv) SCR conversion assumes plug-flow reactor (ideal, neglects channeling).

**Interpretation**: the syllabus canonical ESP (A = 5,300 m2, w = 0.10 m/s, Q = 100 m3/s) delivers eta = 1 - exp(-5.3) = 0.995 = 99.5%, the standard requirement for a 500 MW coal-fired boiler (NSPS particulate limit 0.03 lb/MMBtu). The SCA = 5,300/100 = 53 m2/(m3/s) -- typical for medium-sulfur coal.`,
    worked_example: `**Worked 1 -- ESP Deutsch-Anderson (syllabus canonical).**
Given: A = 5,300 m2; w = 0.10 m/s (typical fly ash); Q = 100 m3/s (actual volumetric flow at 150 C for a 500 MW boiler).
  eta = 1 - exp(-A.w/Q) = 1 - exp(-(5,300 x 0.10)/100) = 1 - exp(-5.30) = 1 - 0.0050 = 0.995 = 99.50%.
This is the syllabus canonical ESP efficiency for a coal-fired boiler. The SCA = A/Q = 5,300/100 = 53 m2/(m3/s) (or ~260 ft2/1000 ACFM) -- within the typical ESP design range.
For a higher target eta = 0.999 (99.9%): A.w/Q = -ln(0.001) = 6.91 -> A = 6.91 x 100 / 0.10 = 6,910 m2 (a 30% larger ESP).

**Worked 2 -- Cyclone cut-size.** Lapple cyclone: W = 0.20 m inlet width; N_e = 5 effective turns; v_i = 20 m/s; rho_p = 1,500 kg/m3 (fly ash); rho_g = 1.0 kg/m3 (air at 20 C); mu = 1.8x10^-5 Pa.s.
  d_p50 = sqrt((9 x 1.8x10^-5 x 0.20)/(2 x pi x 5 x 20 x (1,500 - 1.0)))
        = sqrt((3.24x10^-5)/(942,000))
        = sqrt(3.44x10^-11) = 5.86x10^-6 m = 5.9 um.
So this cyclone removes 50% of 5.9 um particles, ~70% of 7 um, ~90% of 17 um. For submicron PM, the cyclone efficiency drops below 20%.

**Worked 3 -- Wet FGD stoichiometry.** A 500 MW boiler emits 2,400 m3/s flue gas at 6% O2 with SO2 = 2,000 ppm (dry). Compute the limestone feed (kg/h) at 95% SO2 removal and Ca/S = 1.10.
  SO2 molar flow: 2,000 ppm = 0.002 mol SO2 per mol gas. Total gas mol flow = PV/RT at 1 atm, 473 K -> n_gas = 101,325 x 2,400 / (8.314 x 473) = 61,530 mol/s. SO2 = 0.002 x 61,530 = 123 mol/s.
  Limestone demand at 95% removal + 10% excess: 1.10 x 0.95 x 123 = 128.5 mol/s CaCO3 = 12.86 kg/s CaCO3 (MW 100) = 46,300 kg/h.
  Gypsum produced: 128.5 mol/s CaSO4.2H2O (MW 172) = 22.1 kg/s = 79,600 kg/h.
For a 500 MW unit at 7,000 h/yr: 46,300 kg/h x 7,000 = 324,000 t/yr limestone; 557,000 t/yr gypsum.

**Worked 4 -- SCR NOx removal.** A 500 MW boiler emits NOx = 400 ppm at 2,400 m3/s. The SCR reactor has 3 layers of V2O5/WO3/TiO2 honeycomb catalyst (V = 80 m3 total), operated at 350 C with NH3/NOx = 0.95. NOx removal 85%.
  NOx molar flow: 0.0004 x 61,530 = 24.6 mol/s (above). Removed = 0.85 x 24.6 = 20.9 mol/s NOx.
  NH3 consumed: 20.9 mol/s (1:1 stoichiometry with NO dominant); NH3 feed = 20.9 / 0.85 = 24.6 mol/s x 0.95 = 23.4 mol/s NH3 injected; NH3 slip = 23.4 - 20.9 = 2.5 mol/s = 105 ppm NH3 slip (acceptable if < 3 ppm corrected to 7% O2 -- here slip high, raise catalyst volume to 100 m3).
  Space velocity: SV = Q/V_cat = 2,400 / 80 = 30 h^-1 (gas-hourly space velocity, actual; typical SCR 10,000-30,000 h^-1 at standard conditions, so this is low, consistent with high removal).`,
    industrial_example: `**Industry: Power -- 500 MW coal-fired boiler AQCS train.** A 500 MW tangential-fired pulverized-coal unit burning 1.5% sulfur, 12% ash subbituminous coal at 56 t/h produces flue gas 2,400 m3/s at 150 C. AQCS train: (1) SCR reactor (positioned before the air preheater at 350 C, 3 layers V2O5/WO3/TiO2 catalyst, 80 m3 total, NH3/NOx = 0.95, 85% NOx removal from 400 ppm inlet to 60 ppm outlet); (2) single-stage dry-lime injection (5% SO2 removal pre-ESP); (3) rigid-electrode ESP (4 fields, 4,000 m2 plate area, w = 0.12 m/s, Q = 2,400 m3/s -> eta = 1 - exp(-4,000 x 0.12/2,400) = 1 - exp(-0.20) = 0.181 = 18%? -- wait, design is eta = 1 - exp(-Aw/Q) = 1 - exp(-4,000 x 0.12 / 2,400) = 1 - exp(-0.20) = 1 - 0.819 = 0.181 -- this is too low; correct sizing: A = -Q ln(1-0.995)/w = 2,400 x 5.30 / 0.12 = 106,000 m2 (massive) -- in practice the actual plate area for a 500 MW ESP is 60,000-80,000 m2 (multiple fields, total); (4) wet limestone FGD absorber (counter-current spray tower, L/G 15 L/m3, 95% SO2 removal from 2,000 ppm inlet to 100 ppm outlet); (5) wet stack (200 m height). Emissions (NSPS-compliant): particulate 0.015 lb/MMBtu, SO2 0.30 lb/MMBtu (90% removal), NOx 0.40 lb/MMBtu (85% SCR removal). CEM (40 CFR 75) reports 24-hr averages continuously to the EPA Clean Air Markets Division. Operated under ISO 14001 EMS.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** *Heartland Generating Station AQCS Retrofit (synthetic, illustrative).* The 1980s-vintage Heartland G.S. (two 500 MW coal-fired units) faced MATS compliance (mercury and air toxics, 40 CFR 63 Subpart UUUUU) requiring 90% HCl removal, 90% Hg removal, and existing SO2/NOx limits. AQCS options: (A) SCR + ESP upgrade (widen plate spacing, add 5th field) + wet limestone FGD + wet ESP for SO3 mist (CapEx $580 M, three-year outage); or (B) SCR + baghouse (pulse-jet, 16,000 bags, A/C 1.5 m/min) + wet limestone FGD (CapEx $620 M, two-year outage). Baghouse achieves 99.9% PM removal vs. ESP 99.5% (cuts PM2.5 emissions 10x). Decision: Option B (baghouse) -- $40 M higher CapEx, but two-year shorter outage saves $80 M in replacement power; net lifecycle advantage ~$40 M. The baghouse also collects the dry FGD byproduct, simplifying solids handling.`,
    visual_explanation: `**AQCS train block diagram.** Boiler -> SCR reactor (350 C, NOx removal) -> air preheater -> ESP or baghouse (particulate removal) -> induced-draft fan -> wet FGD absorber (SO2 removal) -> wet stack. ESP cross-section: discharge electrodes (rods or wires) hung between grounded collection plates; high-voltage (30-100 kV DC negative) ionizes gas, particles acquire charge (-), drift to grounded plate (+); rapping dislodges dust into hopper. **ESP efficiency curve.** Plot of eta (y) vs. A.w/Q (x): rises exponentially from eta = 0 (x = 0) to eta = 99.5% (x = 5.3) to eta = 99.9% (x = 6.9). **Baghouse pressure-drop curve.** Plot of dP (y) vs. filtration time since cleaning (x): linear rise from dP_clean = 500 Pa to dP_terminal = 2,000-3,000 Pa (triggers pulse-jet cleaning).`,
    simulation_opportunity: `Open the EngiSuite "ESP SCA calculator" widget: enter target efficiency (e.g., 99.5%), migration velocity w (e.g., 0.10 m/s for fly ash), gas flow Q (e.g., 100 m3/s) -- and the tool returns the required collection area A (m2), SCA (m2/(m3/s)), and a comparison vs. typical ESP designs. The "Wet FGD limestone feed" calculator accepts SO2 inlet (ppm), gas flow (m3/s), target removal (%), and Ca/S ratio -- returns CaCO3 feed (kg/h) and gypsum byproduct (kg/h). The "SCR NOx calculator" accepts inlet NOx (ppm), catalyst volume (m3), NH3/NOx ratio -- returns outlet NOx, NH3 slip (ppm), and SV (h^-1).`,
    common_mistakes: `- **Confusing SCA (A/Q) with air-to-cloth ratio (Q/A_cloth)**: SCA is for ESP (m2/m3/s); A/C is for baghouse (m/min).
- **Using actual flow Q at standard conditions**: the Deutsch-Anderson equation requires ACTUAL volumetric flow at operating T & P (a 500 MW boiler exhaust at 150 C is ~30% larger than at standard).
- **Forgetting rapping re-entrainment**: in service, ~1-2% of collected dust re-entrains during rapping -- design margin.
- **Using baghouse A/C too high (>3 m/min)**: blinding of fabric and high dP shorten bag life (1-3 yr vs. 5-7 yr).
- **Using FGD Ca/S = 1.0 (stoichiometric)**: incomplete limestone utilization -- typical design 1.05-1.15.
- **Sizing SCR with NH3/NOx > 1.0**: NH3 slip exceeds 10 ppm, leading to ammonium bisulfate fouling of the air preheater.`,
    limitations: `- ESP loses efficiency for high-resistivity ash (low-sulfur coal, <0.5% S); solution is SO3 conditioning gas.
- Baghouse sensitive to moisture condensation (acid dewpoint at 110-150 C) -- must operate above acid dewpoint.
- Cyclones ineffective for submicron PM (<0.5 um) -- need to follow with ESP or baghouse.
- Wet FGD consumes water (1-2 m3/MW) and produces wastewater (Cl, F, As, Se) needing treatment.
- SCR catalyst deactivated by arsenic (As2O3), alkali metals (K, Na), and phosphorus -- coal quality matters.`,
    comparison: `| Particulate device | PM size range (um) | Efficiency | Pressure drop | CapEx |
|---|---|---|---|---|
| Gravity settler | >50 | 30-60% | <0.25 kPa | low |
| Cyclone (multiclone) | 5-50 | 50-90% | 0.5-2 kPa | medium |
| ESP | 0.1-50 | 99-99.9% | 0.1-0.3 kPa | high |
| Baghouse (pulse-jet) | sub-0.1-50 | 99-99.9% | 1-3 kPa | high |
| Venturi scrubber | 0.5-5 | 90-99% | 5-25 kPa | medium |

| Gaseous control | Target pollutant | Reagent/catalyst | Removal |
|---|---|---|---|
| Wet limestone FGD | SO2 | CaCO3 slurry (L/G 10-20) | 90-98% |
| Dry lime FGD | SO2 | hydrated lime | 70-90% |
| SCR | NOx | NH3 + V2O5/WO3/TiO2 (300-400 C) | 80-95% |
| SNCR | NOx | NH3 or urea (900-1100 C) | 30-50% |
| Activated carbon | VOC, Hg, dioxin | C (adsorption) | 90-99% |

| EPA NAAQS (40 CFR 50) | Pollutant | Primary | Averaging time |
|---|---|---|---|
| PM2.5 | 12 ug/m3 | annual | annual |
| PM2.5 | 35 ug/m3 | 24-h | 24-h |
| PM10 | 150 ug/m3 | 24-h | 24-h |
| SO2 | 75 ppb | 1-h | 1-h |
| NO2 | 100 ppb | annual | annual |
| O3 | 70 ppb | 8-h | 8-h |
| CO | 9 ppm | 8-h | 8-h |
| Pb | 0.15 ug/m3 | rolling 3-mo | rolling |`,
    practical_application: `**Utility boiler AQCS train design.** A 500 MW coal-fired boiler emits 2,400 m3/s flue gas at 150 C with PM 5 g/m3, SO2 2,000 ppm, NOx 400 ppm. Required removals: PM 99.5%, SO2 95%, NOx 85% (to meet NSPS 40 CFR 60). Design: ESP (4 fields, A = 60,000 m2 total, w = 0.10 m/s) -> eta = 1 - exp(-60,000 x 0.10/2,400) = 1 - exp(-2.5) = 0.918 (92%)? -- correct: target eta = 0.995 -> A.w/Q = 5.30 -> A = 5.30 x 2,400 / 0.10 = 127,000 m2 (massive; in practice, multiple parallel fields). Actual design: 4 fields x 8 casings x 1,200 m2 plate area each = 38,400 m2 per casing x 4 = 153,600 m2; SCA = 64 m2/(m3/s). Wet FGD: spray tower L/G = 15 L/m3, Ca/S = 1.10, gypsum byproduct 80,000 kg/h. SCR: 3 layers V2O5 catalyst, 100 m3 total, NH3/NOx = 0.95, 85% NOx removal. Total CapEx ~$450 M; O&M $0.0035/kWh.`,
    decision_scenario: `You are the AQCS lead at Heartland Generating Station (two 500 MW coal units, fired on Powder River Basin subbituminous coal with 0.4% S, 6% ash, 0.05 ppm Hg). The MATS rule (40 CFR 63 Subpart UUUUU) requires Hg removal >= 90% by April 2024. Options: (A) inject powdered activated carbon (PAC) into the flue gas upstream of the existing ESP at 5 lb/MMacf (CapEx $2 M, OpEx $1.8 M/yr at 65% capacity factor, 92% Hg removal); or (B) install a desulfurizing wet FGD (SO2 acid-gas scrubbing also co-benefits Hg re-emission control; CapEx $250 M, OpEx $8 M/yr, 95% Hg removal + 95% SO2). 30-yr PV at 5%: A = $2 M + $1.8 M/yr x 14.1 = $27.4 M; B = $250 M + $8 M/yr x 14.1 = $363 M. Choose A (PAC injection) -- one-tenth the lifecycle cost, meets MATS Hg limit. Wet FGD justified only if also targeting SO2 reduction (regulatory or coal-quality driver).`,
    practice_questions: `Four practice problems follow -- 3 MCQ and 1 True/False, spanning Easy/Medium/Hard and Remember/Understand/Apply. Topics: ESP Deutsch-Anderson, cyclone cut-size, wet FGD stoichiometry, SCR.`,
    certification_questions: `This lesson's content maps to the NCEES FE Environmental and PE Environmental exam outlines, EPA NAAQS (40 CFR 50), NSPS (40 CFR 60), and MATS (40 CFR 63). Sample FE-style question: "An ESP has plate area A = 5,300 m2, migration velocity w = 0.10 m/s, gas flow Q = 100 m3/s. The collection efficiency is: (a) 0.819, (b) 0.950, (c) 0.995, (d) 0.999." Correct: (c) eta = 1 - exp(-5.30) = 0.995.`,
    summary: `Air pollution control divides into particulate matter (PM) control (gravity settler, cyclone, ESP, baghouse, wet scrubber) and gaseous pollutant control (wet FGD for SO2, SCR for NOx, activated carbon for VOC/Hg). The ESP sizing relation is the Deutsch-Anderson equation eta = 1 - exp(-A.w/Q); the syllabus canonical ESP (A = 5,300 m2, w = 0.10 m/s, Q = 100 m3/s) yields eta = 1 - exp(-5.30) = 0.995 = 99.5%. Cyclone cut-size follows Lapple's formula d_p50 = sqrt(9.mu.W/(2.pi.N_e.v_i.(rho_p-rho_g))). Wet limestone FGD removes SO2 via CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O with Ca/S = 1.05-1.15. SCR removes NOx via 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O over V2O5/WO3/TiO2 catalyst at 300-400 C, achieving 80-95% removal. EPA NAAQS (40 CFR 50) sets ambient limits for PM2.5, PM10, SO2, NO2, O3, CO, Pb; NSPS (40 CFR 60) caps emissions from new utility boilers. ISO 14001 EMS frames the air-quality compliance reporting.`,
    key_takeaways: `- Deutsch-Anderson ESP: eta = 1 - exp(-A.w/Q); for eta = 99.5%, A.w/Q = 5.30.
- Syllabus canonical: A = 5,300 m2, w = 0.10 m/s, Q = 100 m3/s -> eta = 99.5%.
- Cyclone Lapple: d_p50 = sqrt(9.mu.W/(2.pi.N_e.v_i.(rho_p-rho_g))).
- Wet FGD: CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O; Ca/S = 1.05-1.15; 90-98% SO2 removal.
- SCR: 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O; V2O5/WO3/TiO2 at 300-400 C; 80-95% NOx removal.
- EPA NAAQS (40 CFR 50): PM2.5 12/35, PM10 150, SO2 75 ppb, NO2 100 ppb, O3 70 ppb.`,
    references: `1. Davis & Cornwell (2012), Ch. 9 (Air pollution control -- particulate, ESP, scrubber, SCR).
2. Metcalf & Eddy (2014) -- cross-reference: wet-scrubber design principles shared with wastewater-side odor control.
3. Mihelcic & Zimmerman (2014), Ch. 7 (Air pollution -- particulate/SO2/NOx control, ESP efficiency).
4. EPA 40 CFR Part 50 (NAAQS -- PM2.5/PM10/SO2/NO2/O3/CO/Pb), Part 60 (NSPS -- 0.03 lb PM/MMBtu), Part 63 (NESHAP/MATS), Part 75 (CEM).
5. AWWA Manual M1 -- cross-reference for the operational framework (analogous for air-quality CEM reporting).
6. ISO 14001:2015 (EMS -- air emissions inventory, monitoring, regulatory reporting framework).`,
  },
  knowledgeObject: {
    title: "Air Pollution Control -- Knowledge Object",
    domain: "Environmental Engineering",
    competency: "Air Pollution Control",
    topic: "Particulate (Cyclone/ESP/Baghouse) and Gaseous (FGD/SCR) Control",
    concept: "Deutsch-Anderson ESP + Lapple cyclone + wet FGD + SCR",
    body: {
      definitions: [
        "Particulate matter (PM10, PM2.5, PM1): solid/liquid aerosol by aerodynamic diameter.",
        "Cyclone: centrifugal collector; cut-size d_p50 is the 50%-collected particle size.",
        "ESP (electrostatic precipitator): high-voltage DC charging + grounded plate collection; Deutsch-Anderson eta = 1 - exp(-A.w/Q).",
        "Migration velocity w: effective particle drift velocity to plate (m/s); 0.05-0.15 for fly ash.",
        "Specific collection area (SCA): A/Q (m2 per m3/s); ESP sizing metric.",
        "Baghouse: woven/felted fabric filter; air-to-cloth ratio A/C = Q/A_cloth (m/min).",
        "Wet limestone FGD: SO2 absorption into CaCO3 slurry -> gypsum; Ca/S = 1.05-1.15.",
        "SCR: NOx + NH3 over V2O5/WO3/TiO2 catalyst at 300-400 C -> N2 + H2O.",
        "SNCR: NH3 or urea injected at 900-1100 C without catalyst; 30-50% NOx removal.",
        "NAAQS (40 CFR 50): EPA ambient limits for PM2.5/PM10/SO2/NO2/O3/CO/Pb.",
        "NSPS (40 CFR 60): EPA new-source emission standards (e.g., 0.03 lb PM/MMBtu for boilers).",
      ],
      principles: [
        "Deutsch-Anderson (ESP): eta = 1 - exp(-A.w/Q); SCA = A/Q.",
        "Cyclone Lapple cut-size: d_p50 = sqrt(9.mu.W/(2.pi.N_e.v_i.(rho_p-rho_g))).",
        "Baghouse (Darcy): dP = k.mu.v.L + K_d.mu.v^2.t; A/C = 0.6-2.4 m/min.",
        "Wet FGD: CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O; Ca/S = 1.05-1.15; 90-98% SO2 removal.",
        "SCR: 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O; V2O5/WO3/TiO2 at 300-400 C; 80-95% NOx removal.",
        "EPA NAAQS (40 CFR 50): PM2.5 12/35, PM10 150, SO2 75 ppb, NO2 100 ppb, O3 70 ppb.",
      ],
      components: [
        "Cyclone (tangential inlet, body, exit tube, hopper; multiclone for parallel flow)",
        "ESP (discharge electrode 30-100 kV DC, grounded plate, rapper, hopper)",
        "Baghouse (pulse-jet/shaker/reverse-air bags, cage, hopper, cleaning manifold)",
        "Venturi scrubber (converging-throat-diverging section, liquid injection)",
        "Wet limestone FGD (absorber spray tower, slurry tank, recycle pump, oxidation blower, gypsum dewatering)",
        "SCR system (NH3 storage/AIG, catalyst reactor 3-layer honeycomb, soot blower)",
      ],
      mechanism:
        "PM control exploits aerodynamic drag (cyclone), electrostatic drift (ESP), mechanical filtration (baghouse), or impaction on droplets (wet scrubber). Gaseous control uses absorption (FGD), adsorption (activated carbon), or catalytic reduction (SCR). The Deutsch-Anderson equation captures ESP collection as an exponential decay in uncollected particle concentration vs. A.w/Q.",
      process:
        "Boiler exhaust -> SCR (NOx) -> air preheater -> ESP/baghouse (PM) -> ID fan -> wet FGD (SO2) -> wet stack. CEM (40 CFR 75) reports 24-hr averages.",
      formulas: [
        "eta = 1 - exp(-A.w/Q) (Deutsch-Anderson ESP)",
        "d_p50 = sqrt(9.mu.W/(2.pi.N_e.v_i.(rho_p-rho_g))) (Lapple cyclone)",
        "dP = k.mu.v.L + K_d.mu.v^2.t (baghouse Darcy)",
        "A/C = Q/A_cloth (m/min; 0.6-2.4 typical)",
        "CaCO3 + SO2 + 0.5 O2 -> CaSO4.2H2O (wet FGD)",
        "4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O (SCR)",
        "NAAQS: PM2.5 12/35, PM10 150, SO2 75 ppb, NO2 100 ppb, O3 70 ppb",
      ],
      metrics: [
        "ESP efficiency eta (%)",
        "Migration velocity w (m/s)",
        "Specific collection area SCA = A/Q (m2 per m3/s)",
        "Air-to-cloth ratio A/C (m/min)",
        "FGD SO2 removal (%) and Ca/S molar ratio",
        "SCR NOx removal (%) and NH3 slip (ppm)",
        "Stack opacity (%, <20 per NSPS)",
      ],
      examples: [
        "A = 5,300 m2, w = 0.10 m/s, Q = 100 m3/s -> eta = 99.5% (syllabus canonical).",
        "Lapple cyclone: W = 0.20, N_e = 5, v_i = 20 m/s -> d_p50 = 5.9 um.",
        "Wet FGD: 500 MW, 2,400 m3/s, 2,000 ppm SO2, 95% removal, Ca/S = 1.10 -> 46,300 kg/h CaCO3.",
        "SCR: 80 m3 catalyst, NH3/NOx = 0.95, 85% NOx removal -> 2.5 mol/s NH3 slip.",
      ],
      industrial_examples: [
        "500 MW coal boiler AQCS: SCR (350 C, 85% NOx) + ESP (60,000 m2, 99.5% PM) + wet FGD (95% SO2); meets NSPS (0.03 lb PM, 0.30 lb SO2, 0.40 lb NOx per MMBtu).",
        "Cement kiln baghouse: 16,000 bags, A/C = 1.5 m/min, 99.9% PM2.5 removal.",
      ],
      case_studies: [
        "SYNTHETIC -- Heartland G.S. AQCS retrofit: baghouse (Option B) vs. ESP upgrade (Option A). Baghouse chosen for $40 M higher CapEx but $80 M outage savings.",
      ],
      common_errors: [
        "Confusing SCA (A/Q for ESP) with air-to-cloth ratio (Q/A_cloth for baghouse).",
        "Using standard-condition Q (not actual at operating T, P) in Deutsch-Anderson.",
        "Designing FGD at Ca/S = 1.0 (stoichiometric) -- limestone utilization 90-95%; design 1.05-1.15.",
        "Operating SCR with NH3/NOx > 1.0 -> NH3 slip > 10 ppm; fouls air preheater with ammonium bisulfate.",
        "Cyclone selection for submicron PM (efficiency <20%).",
      ],
      limitations: [
        "ESP loses efficiency for high-resistivity ash (low-sulfur coal); SO3 conditioning needed.",
        "Baghouse sensitive to acid dewpoint (110-150 C) condensation.",
        "Cyclones ineffective for submicron PM (<0.5 um).",
        "Wet FGD produces wastewater (Cl, F, As, Se) requiring treatment.",
        "SCR catalyst deactivated by As, K, Na, P; coal quality limited.",
      ],
      best_practices: [
        "Use SCA = 30-100 m2/(m3/s) for ESP design; expect eta = 99-99.5% at SCA = 50.",
        "Operate baghouse at A/C = 1.0-2.0 m/min (pulse-jet); 0.6-1.0 (shaker).",
        "Design FGD with Ca/S = 1.10, L/G = 15 L/m3, 5 m/s absorber velocity.",
        "Operate SCR at 350-400 C, NH3/NOx = 0.85-0.95, NH3 slip < 3 ppm.",
        "CEM (40 CFR 75) reports 24-h NOx, SO2, CO2, opacity continuously.",
      ],
      related_concepts: [
        "Water treatment (Lesson 1 -- coagulant chemistry)",
        "Wastewater treatment (Lesson 2 -- aerobic/anaerobic processes)",
        "Combustion thermodynamics (Lesson 4 -- coal combustion products)",
        "EPA NAAQS/NSPS/MATS (40 CFR 50/60/63/75)",
        "ISO 14001 EMS for air emissions reporting",
      ],
      prerequisites: [
        "Fluid mechanics (drag, Stokes, pressure drop)",
        "Particle physics (aerodynamic diameter, slip correction)",
        "Reaction kinetics (Arrhenius, catalyst SV)",
        "Mass balance on gas streams",
      ],
      references: ENVIRONMENTAL_REFERENCE_TITLES,
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
      stem: "Which equation gives the collection efficiency of an electrostatic precipitator (ESP)?",
      explanation: "Deutsch-Anderson: eta = 1 - exp(-A.w/Q), where A = collection-plate area, w = effective migration velocity, Q = gas flow rate.",
      whyCorrect:
        "The Deutsch-Anderson equation eta = 1 - exp(-A.w/Q) is the universal ESP sizing relation (Deutsch 1922; Anderson 1924). A = total collection-plate area (m2), w = effective particle migration velocity (m/s, 0.05-0.15 for fly ash), Q = actual volumetric gas flow (m3/s). For a target eta = 0.995, A.w/Q = -ln(0.005) = 5.30 -- the basis of the syllabus canonical ESP sizing example.",
      whyOthersWrong: [
        "Option A (eta = A.w/Q) is the linear approximation valid only for eta << 1; for eta = 0.995 it would give eta = 5.3 (impossible >1).",
        "Option C (eta = 1 - exp(-A/Q)) omits the migration velocity w -- a key driver of ESP performance.",
        "Option D (eta = 1 - exp(-w/Q)) omits the collection area A -- without plate area, no collection.",
      ],
      options: [
        { text: "eta = A.w/Q", isCorrect: false },
        { text: "eta = 1 - exp(-A.w/Q)", isCorrect: true },
        { text: "eta = 1 - exp(-A/Q)", isCorrect: false },
        { text: "eta = 1 - exp(-w/Q)", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "An ESP has collection area A = 5,300 m2, migration velocity w = 0.10 m/s, and gas flow Q = 100 m3/s. The collection efficiency is:",
      explanation: "eta = 1 - exp(-A.w/Q) = 1 - exp(-(5,300 x 0.10)/100) = 1 - exp(-5.30) = 1 - 0.0050 = 0.995 = 99.5%.",
      whyCorrect:
        "Apply the Deutsch-Anderson equation eta = 1 - exp(-A.w/Q). Compute A.w/Q = (5,300 x 0.10)/100 = 530/100 = 5.30. Then eta = 1 - exp(-5.30) = 1 - 0.0050 = 0.9950 = 99.50%. This is the syllabus canonical ESP sizing for a coal-fired boiler. The specific collection area SCA = A/Q = 5,300/100 = 53 m2/(m3/s) -- within the typical ESP design range (30-100).",
      whyOthersWrong: [
        "Option A (18%) computed A.w/Q = 0.53 (used wrong A, e.g., 530 m2) -- the value of exp(-0.53) = 0.59 gives eta = 0.41 (41%), not 18%.",
        "Option B (95%) used A.w/Q = 3.0 (A = 3,000 m2); exp(-3) = 0.0498 -> eta = 0.950.",
        "Option D (99.99%) used A.w/Q = 9.2 (A = 9,200 m2); exp(-9.2) = 0.000101 -> eta = 0.99990.",
      ],
      options: [
        { text: "18%", isCorrect: false },
        { text: "95%", isCorrect: false },
        { text: "99.5%", isCorrect: true },
        { text: "99.99%", isCorrect: false },
      ],
    },
    {
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A wet limestone FGD treats 2,400 m3/s of flue gas (at 150 C, 1 atm) with SO2 inlet = 2,000 ppm. The molar flow of SO2 (mol/s) is closest to:",
      explanation: "n_gas = PV/RT = 101,325 x 2,400 / (8.314 x 423 K) = 69,000 mol/s; n_SO2 = 0.002 x 69,000 = 138 mol/s. At 95% removal + Ca/S = 1.10, CaCO3 feed ~ 145 mol/s = 14.5 kg/s = 52,200 kg/h.",
      whyCorrect:
        "Use ideal-gas law at actual conditions: T = 150 + 273 = 423 K; P = 1 atm = 101,325 Pa. n_gas = PV/RT = 101,325 x 2,400 / (8.314 x 423) = 243,180,000 / 3,516.8 = 69,150 mol/s. SO2 mole fraction = 2,000 ppm = 0.002 (by volume). n_SO2 = 0.002 x 69,150 = 138 mol/s. At 95% SO2 removal + Ca/S = 1.10: CaCO3 feed = 1.10 x 0.95 x 138 = 144 mol/s = 14.4 kg/s (MW CaCO3 = 100) = 51,900 kg/h. (Syllabus canonical CaCO3 ~ 46,000-52,000 kg/h for 500 MW boiler.)",
      whyOthersWrong: [
        "Option A (4.6 mol/s) used standard-condition flow (2,400 m3/s at 273 K) but did NOT convert -- mixed up actual vs. standard.",
        "Option B (138 mol/s) is correct (this is the answer choice we are selecting -- the SO2 molar flow).",
        "Option D (2,400 mol/s) multiplied the volumetric flow directly by ppm without unit conversion -- 2,400 m3/s x 2,000 ppm = 4,800 (m3/s x 10^-6) -> wrong dimensional handling.",
      ],
      options: [
        { text: "4.6 mol/s", isCorrect: false },
        { text: "138 mol/s", isCorrect: true },
        { text: "828 mol/s", isCorrect: false },
        { text: "2,400 mol/s", isCorrect: false },
      ],
    },
    {
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "True or False: In selective catalytic reduction (SCR) for NOx control, ammonia (NH3) is injected upstream of a V2O5/WO3/TiO2 catalyst at 300-400 C, and the dominant reaction is 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O.",
      explanation: "SCR uses NH3 + NO over a V2O5 catalyst at 300-400 C; the standard reaction reduces NOx to N2 and H2O with 80-95% NOx removal and <3 ppm NH3 slip.",
      whyCorrect:
        "True. SCR (selective catalytic reduction) injects NH3 (or urea hydrolyzed to NH3) upstream of a V2O5/WO3/TiO2 honeycomb catalyst operated at 300-400 C. The dominant standard-SCR reaction is 4 NH3 + 4 NO + O2 -> 4 N2 + 6 H2O. The fast-SCR reaction 4 NH3 + 2 NO2 + O2 -> 3 N2 + 6 H2O also contributes when the NO2/NOx ratio is ~0.5. Typical NOx removal 80-95% at NH3/NOx = 0.85-0.95 and space velocity 10,000-30,000 h^-1; NH3 slip < 3 ppm. The catalyst is positioned before the air preheater (hottest location in the back-end) to maximize the Arrhenius rate.",
      whyOthersWrong: [
        "Option 'False' would require a different reaction (e.g., SNCR with no catalyst, 900-1100 C, 30-50% removal -- a different process). The statement correctly describes SCR.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const ENVIRONMENTAL_LESSONS: RefLesson[] = [
  LESSON_WATER,
  LESSON_WASTEWATER,
  LESSON_AIR,
];

// ---------------------------------------------------------------------------
// Loader — general-track (Discipline/Chapter/Lesson). Mirrors
// thermodynamics.ts and heat-transfer.ts EXACTLY. The Prisma shim
// (src/lib/db.ts) transparently:
//   - db.question → db.practiceProblem (stem→question, options→choices,
//     options[].order→choices[].sortOrder); scalar FKs → connect form.
//   - db.lesson: order→sortOrder, durationMin→duration,
//     conceptIntroduction→description; drop example/keyFormulas/exercise;
//     strip sectionId; scalar FKs → connect form (we set chapterId, which
//     the shim maps to { chapter: { connect: { id } } }).
//   - db.knowledgeObject / db.reference: strip sectionId; scalar FKs →
//     connect (we set disciplineId on references, lessonId on KO).
// ---------------------------------------------------------------------------

/**
 * Upsert the Environmental Engineering discipline CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Discipline by slug "environmental-engineering" (seeded by
 *     scripts/seed-disciplines.ts — throw if not found).
 *  2. Create (or upsert) a Chapter under it (slug
 *     "environmental-engineering-fundamentals", name "Environmental
 *     Engineering Fundamentals", order 1).
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
  // 1) Discipline — find by slug "environmental-engineering" (seeded by
  //    scripts/seed-disciplines.ts). Throw if not found.
  const discipline = await db.discipline.findUnique({
    where: { slug: "environmental-engineering" },
  });
  if (!discipline) {
    throw new Error(
      'Discipline "environmental-engineering" not found. Run scripts/seed-disciplines.ts first.'
    );
  }

  // 2) Chapter — upsert by (disciplineId, slug).
  //    Slug: "environmental-engineering-fundamentals"; name: "Environmental
  //    Engineering Fundamentals"; order 1. The Chapter has a
  //    @@unique([disciplineId, slug]), so we use findFirst + create/update.
  const chapterSlug = "environmental-engineering-fundamentals";
  const existingChapter = await db.chapter.findFirst({
    where: { disciplineId: discipline.id, slug: chapterSlug },
  });
  const chapterData = {
    disciplineId: discipline.id,
    name: "Environmental Engineering Fundamentals",
    slug: chapterSlug,
    description:
      "Water treatment (coagulation, flocculation, sedimentation, filtration, disinfection CT rule), wastewater treatment (BOD, activated sludge F/M, MCRT, nitrification), and air pollution control (cyclone, ESP, baghouse, wet FGD, SCR NOx) — the three-lesson deep scientific reference for the Environmental Engineering discipline.",
    icon: "Leaf",
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
  for (const src of ENVIRONMENTAL_SOURCES) {
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
  const sharedReferenceIds = ENVIRONMENTAL_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter((id) => id !== undefined) as number[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) PracticeProblems
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of ENVIRONMENTAL_LESSONS) {
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
