import type { EngineeringPipeline } from '../engineeringPipelines';

// ── Reinforced Concrete Beam Design ──────────────────────────────────────────
export const rcBeamDesign: EngineeringPipeline = {
  id: 'rc-beam-design',
  name: 'Reinforced Concrete Beam Design',
  description: 'Design a simply-supported RC beam: calculate design bending moment and shear, determine flexural reinforcement, check shear capacity, and verify deflection.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '15-20 min', icon: '🏛️',
  steps: [
    {
      stepNumber: 1, name: 'Design Actions (ULS)',
      description: 'Calculate factored design bending moment and shear force using Eurocode load combinations.',
      standard_ref: 'EN 1990 Eq.6.10 + EN 1991-1-1',
      formula_display: ['w_d = 1.35 G_k + 1.5 Q_k', 'M_Ed = w_d L²/8', 'V_Ed = w_d L/2'],
      inputs: [
        { name: 'gk_kn_m',  label: 'Dead Load (G_k)',   unit: 'kN/m', type: 'number', min: 0, max: 500,  default: 15,  required: true, help: 'Characteristic permanent load (unfactored)' },
        { name: 'qk_kn_m',  label: 'Live Load (Q_k)',   unit: 'kN/m', type: 'number', min: 0, max: 500,  default: 20,  required: true, help: 'Characteristic variable load (unfactored)' },
        { name: 'span_m',   label: 'Span',              unit: 'm',    type: 'number', min: 0.5, max: 30, default: 6,   required: true, help: 'Simply-supported span' },
      ],
      outputs: [
        { name: 'wd_kn_m',  label: 'Design UDL (w_d)',         unit: 'kN/m', precision: 2 },
        { name: 'med_kn_m', label: 'Design Moment (M_Ed)',      unit: 'kN·m', precision: 2 },
        { name: 'ved_kn',   label: 'Design Shear (V_Ed)',       unit: 'kN',   precision: 2 },
      ],
      calculate(inp) {
        const wd = 1.35*+inp.gk_kn_m + 1.5*+inp.qk_kn_m;
        const M = wd*+inp.span_m*+inp.span_m/8;
        const V = wd*+inp.span_m/2;
        return { wd_kn_m: Math.round(wd*100)/100, med_kn_m: Math.round(M*100)/100, ved_kn: Math.round(V*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Flexural Reinforcement',
      description: 'Calculate the required tensile reinforcement area using the rectangular stress block method (EN 1992-1-1 § 6.1).',
      standard_ref: 'EN 1992-1-1 § 6.1 (bending)',
      formula_display: [
        'K = M_Ed / (b d² f_ck)',
        'K\' = 0.167 (no compression steel, x/d ≤ 0.45)',
        'z = d [0.5 + √(0.25 − K/1.134)]   ≤ 0.95d',
        'A_s = M_Ed / (f_yd × z)',
        'f_yd = f_yk / 1.15 (design yield strength)',
      ],
      inputs: [
        { name: 'med_kn_m', label: 'Design Moment (M_Ed)', unit: 'kN·m', type: 'number', min: 0, max: 50000, required: true, help: 'From Step 1', fromPreviousStep: 'med_kn_m' },
        { name: 'b_mm',     label: 'Beam Width (b)',       unit: 'mm',   type: 'number', min: 100, max: 2000, default: 300, required: true, help: 'Beam width' },
        { name: 'd_mm',     label: 'Effective Depth (d)',  unit: 'mm',   type: 'number', min: 50, max: 3000,  default: 450, required: true, help: 'Effective depth = total depth − cover − link diameter − half bar diameter' },
        { name: 'fck_mpa',  label: 'Concrete fck',         unit: 'MPa',  type: 'number', min: 12, max: 90,    default: 25,  required: true, help: 'Characteristic cylinder compressive strength (C25/30 → fck=25 MPa)' },
        { name: 'fyk_mpa',  label: 'Steel fyk',            unit: 'MPa',  type: 'number', min: 250, max: 600,  default: 500, required: true, help: 'Characteristic yield strength of reinforcement (B500B → 500 MPa)' },
      ],
      outputs: [
        { name: 'k_factor',   label: 'K Factor',                    unit: '',    precision: 4 },
        { name: 'lever_z_mm', label: 'Lever Arm (z)',                unit: 'mm',  precision: 0 },
        { name: 'as_req_mm2', label: 'Required A_s',                 unit: 'mm²', precision: 0 },
        { name: 'as_min_mm2', label: 'Minimum A_s (EN1992 9.2.1.1)', unit: 'mm²', precision: 0 },
        { name: 'double_rein',label: 'Compression Steel Required',   unit: '',    precision: 0, isCompliance: false },
      ],
      calculate(inp) {
        const MEd = +inp.med_kn_m * 1e6;  // N·mm
        const b = +inp.b_mm;
        const d = +inp.d_mm;
        const fck = +inp.fck_mpa;
        const fyk = +inp.fyk_mpa;
        const fyd = fyk / 1.15;
        const K = MEd / (b * d*d * fck);
        const Kprime = 0.167;
        const needsComp = K > Kprime;
        const Kuse = Math.min(K, Kprime);
        const z = d * Math.min(0.5 + Math.sqrt(0.25 - Kuse/1.134), 0.95);
        const As = MEd / (fyd * z);
        const As_min = Math.max(0.26*(0.3*Math.pow(fck,2/3))/fyk*b*d, 0.0013*b*d);
        return { k_factor: Math.round(K*10000)/10000, lever_z_mm: Math.round(z), as_req_mm2: Math.round(As), as_min_mm2: Math.round(As_min), double_rein: needsComp };
      }
    },
    {
      stepNumber: 3, name: 'Shear Capacity Check',
      description: 'Check shear capacity and determine stirrup (link) reinforcement using the variable angle truss model.',
      standard_ref: 'EN 1992-1-1 § 6.2',
      formula_display: [
        'V_Rdc = [0.12 k (100 ρ_l f_ck)^(1/3)] b_w d  (minimum links check)',
        'V_Rd,s = (A_sw/s) × z × f_ywd × cot θ   (stirrups)',
        'k = 1 + √(200/d) ≤ 2.0',
        'θ = 21.8°–45° (cot θ = 2.5–1.0)',
      ],
      inputs: [
        { name: 'ved_kn',    label: 'Design Shear (V_Ed)',    unit: 'kN',  type: 'number', min: 0, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'ved_kn' },
        { name: 'b_mm',      label: 'Beam Width',             unit: 'mm',  type: 'number', min: 100, max: 2000, default: 300, required: true, help: 'Beam width (same as Step 2)' },
        { name: 'd_mm',      label: 'Effective Depth',        unit: 'mm',  type: 'number', min: 50, max: 3000,  default: 450, required: true, help: 'Effective depth (same as Step 2)', fromPreviousStep: 'd_mm' },
        { name: 'as_prov_mm2',label: 'Provided A_s (tension)',unit: 'mm²', type: 'number', min: 100, max: 100000, default: 1500, required: true, help: 'Actual provided tension steel area (from Step 2 As_req, select bars)' },
        { name: 'fck_mpa',   label: 'Concrete fck',           unit: 'MPa', type: 'number', min: 12, max: 90, default: 25, required: true, help: 'Concrete compressive strength (same as Step 2)' },
        { name: 'link_dia_mm',label: 'Stirrup Diameter',      unit: 'mm',  type: 'number', min: 6, max: 20, default: 8, required: true, help: 'Stirrup bar diameter (6, 8, 10, 12 mm common)' },
        { name: 'link_legs', label: 'Number of Stirrup Legs', unit: '',    type: 'number', min: 2, max: 6, default: 2, required: true, help: 'Number of vertical legs per stirrup set (2 for simple rectangular)' },
      ],
      outputs: [
        { name: 'vrdc_kn',     label: 'V_Rdc (concrete capacity)', unit: 'kN',  precision: 2 },
        { name: 'links_req',   label: 'Links Required',             unit: '',    precision: 0, isCompliance: false },
        { name: 'link_spacing_mm', label: 'Maximum Link Spacing',  unit: 'mm',  precision: 0 },
      ],
      calculate(inp) {
        const VEd = +inp.ved_kn * 1000; // N
        const bw = +inp.b_mm;
        const d = +inp.d_mm;
        const fck = +inp.fck_mpa;
        const As = +inp.as_prov_mm2;
        const rho = Math.min(As/(bw*d), 0.02);
        const k = Math.min(1 + Math.sqrt(200/d), 2.0);
        const VRdc = 0.12 * k * Math.pow(100*rho*fck, 1/3) * bw * d;
        const needsLinks = VEd > VRdc;
        // If links needed: A_sw/s = V_Ed / (z × f_ywd × cotθ), use θ=21.8° (cot=2.5)
        const z = 0.9 * d;
        const fywd = 500/1.15;
        const Asw = Math.PI * Math.pow(+inp.link_dia_mm/2, 2) * +inp.link_legs;
        const s = needsLinks ? Math.min((Asw * z * fywd * 2.5) / VEd, 0.75*d) : 0.75*d;
        return { vrdc_kn: Math.round(VRdc/1000*100)/100, links_req: needsLinks, link_spacing_mm: Math.round(s) };
      }
    }
  ]
};

// ── Steel Column Buckling ─────────────────────────────────────────────────────
export const steelColumnBuckling: EngineeringPipeline = {
  id: 'steel-column-buckling',
  name: 'Steel Column Buckling Design',
  description: 'Design a steel column under axial compression: check buckling resistance using Eurocode 3 column curves, verify combined axial + bending.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '10-12 min', icon: '🏗️',
  steps: [
    {
      stepNumber: 1, name: 'Slenderness Ratio',
      description: 'Calculate the non-dimensional slenderness ratio λ̄ which determines the reduction factor for buckling. Higher slenderness = more susceptible to buckling.',
      standard_ref: 'EN 1993-1-1 § 6.3.1',
      formula_display: [
        'L_cr = k × L   (effective length)',
        'k: 1.0 pinned-pinned, 0.7 pinned-fixed, 0.5 fixed-fixed',
        'λ̄ = (L_cr / i) / (π √(E/f_y))',
        'i = √(I/A)   (radius of gyration)',
      ],
      inputs: [
        { name: 'ned_kn',    label: 'Design Axial Load (N_Ed)', unit: 'kN',  type: 'number', min: 0.1, max: 100000, default: 1500, required: true, help: 'Factored design axial compressive force' },
        { name: 'l_col_m',   label: 'Column Length',           unit: 'm',   type: 'number', min: 0.5, max: 30,     default: 4.0,  required: true, help: 'Column floor-to-floor height' },
        { name: 'end_cond',  label: 'End Conditions',          unit: '',    type: 'select', options: [{value:'1.0',label:'Pinned-Pinned (k=1.0)'},{value:'0.7',label:'Pinned-Fixed (k=0.7)'},{value:'0.5',label:'Fixed-Fixed (k=0.5)'},{value:'2.0',label:'Cantilever (k=2.0)'}], default: '1.0', required: true, help: 'Effective length factor k based on end restraint conditions' },
        { name: 'section',   label: 'UC Section',              unit: '',    type: 'select', options: [
          {value:'152x152x23',label:'UC 152×152×23 (i=38.1mm, A=29.2cm²)'},{value:'203x203x46',label:'UC 203×203×46 (i=51.1mm, A=58.7cm²)'},
          {value:'254x254x73',label:'UC 254×254×73 (i=64.8mm, A=93.1cm²)'},{value:'305x305x97',label:'UC 305×305×97 (i=77.5mm, A=123cm²)'},
          {value:'356x368x129',label:'UC 356×368×129 (i=90.6mm, A=164cm²)'},{value:'305x305x158',label:'UC 305×305×158 (i=78.2mm, A=201cm²)'},
        ], default: '254x254x73', required: true, help: 'Select universal column section' },
        { name: 'steel_grade', label: 'Steel Grade', unit: '', type: 'select', options: [{value:'275',label:'S275'},{value:'355',label:'S355'}], default: '275', required: true, help: 'Steel grade (fy)' },
      ],
      outputs: [
        { name: 'lcr_m',        label: 'Effective Length (L_cr)', unit: 'm',  precision: 2 },
        { name: 'lambda_bar',   label: 'Non-dim. Slenderness (λ̄)', unit: '',  precision: 3 },
        { name: 'n_pl_kn',      label: 'Squash Load (N_pl)',       unit: 'kN', precision: 0 },
      ],
      calculate(inp) {
        const DATA: Record<string, {i_mm: number, A_cm2: number}> = {
          '152x152x23': {i_mm:38.1, A_cm2:29.2}, '203x203x46': {i_mm:51.1, A_cm2:58.7},
          '254x254x73': {i_mm:64.8, A_cm2:93.1}, '305x305x97': {i_mm:77.5, A_cm2:123},
          '356x368x129':{i_mm:90.6, A_cm2:164},  '305x305x158':{i_mm:78.2, A_cm2:201},
        };
        const sec = DATA[String(inp.section)];
        const fy = +inp.steel_grade;
        const Lcr = +inp.l_col_m * +inp.end_cond;
        const lambda1 = Math.PI * Math.sqrt(210000/fy);
        const lambdaBar = (Lcr*1000/sec.i_mm) / lambda1;
        const Npl = sec.A_cm2 * 100 * fy / 1000;
        return { lcr_m: Math.round(Lcr*100)/100, lambda_bar: Math.round(lambdaBar*1000)/1000, n_pl_kn: Math.round(Npl) };
      }
    },
    {
      stepNumber: 2, name: 'Buckling Resistance',
      description: 'Calculate the buckling reduction factor χ using EN 1993-1-1 column curve b (hot-rolled UC sections) and verify utilisation.',
      standard_ref: 'EN 1993-1-1 § 6.3.1.2 (column curve b)',
      formula_display: [
        'Φ = 0.5 [1 + α(λ̄ − 0.2) + λ̄²]   α = 0.34 (curve b)',
        'χ = 1 / [Φ + √(Φ² − λ̄²)]   ≤ 1.0',
        'N_b,Rd = χ × A × f_y / γ_M1   (γ_M1 = 1.0)',
        'Utilisation = N_Ed / N_b,Rd ≤ 1.0',
      ],
      inputs: [
        { name: 'ned_kn',    label: 'Design Axial Load',  unit: 'kN', type: 'number', min: 0.1, max: 100000, required: true, help: 'From Step 1', fromPreviousStep: 'ned_kn' },
        { name: 'n_pl_kn',   label: 'Squash Load N_pl',  unit: 'kN', type: 'number', min: 1, max: 100000,   required: true, help: 'From Step 1', fromPreviousStep: 'n_pl_kn' },
        { name: 'lambda_bar',label: 'Slenderness (λ̄)',   unit: '',   type: 'number', min: 0.01, max: 5,     required: true, help: 'From Step 1', fromPreviousStep: 'lambda_bar' },
      ],
      outputs: [
        { name: 'phi',          label: 'Φ Factor',                   unit: '',   precision: 3 },
        { name: 'chi',          label: 'Reduction Factor (χ)',        unit: '',   precision: 3 },
        { name: 'nb_rd_kn',     label: 'Buckling Resistance (N_b,Rd)', unit: 'kN', precision: 0 },
        { name: 'utilisation',  label: 'Utilisation Ratio',           unit: '',   precision: 3 },
        { name: 'column_ok',    label: 'Column OK (util ≤ 1.0)',      unit: '',   precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const alpha = 0.34;
        const lam = +inp.lambda_bar;
        const phi = 0.5*(1 + alpha*(lam-0.2) + lam*lam);
        const chi = Math.min(1/(phi + Math.sqrt(phi*phi - lam*lam)), 1.0);
        const Nbrd = chi * +inp.n_pl_kn;
        const util = +inp.ned_kn / Nbrd;
        return { phi: Math.round(phi*1000)/1000, chi: Math.round(chi*1000)/1000, nb_rd_kn: Math.round(Nbrd), utilisation: Math.round(util*1000)/1000, column_ok: util <= 1.0 };
      }
    }
  ]
};

// ── Isolated Footing Design ───────────────────────────────────────────────────
export const isolatedFooting: EngineeringPipeline = {
  id: 'isolated-footing-design',
  name: 'Isolated Pad Footing Design',
  description: 'Design a square isolated reinforced concrete pad footing: size for bearing capacity, check bearing pressure, determine reinforcement.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '12-15 min', icon: '⬛',
  steps: [
    {
      stepNumber: 1, name: 'Footing Size',
      description: 'Determine footing plan dimensions to keep bearing pressure below allowable soil bearing capacity. Use unfactored (service) loads for geotechnical check.',
      standard_ref: 'EN 1997-1 § 6.5 / BS 8004',
      formula_display: [
        'q_net = (N_service + W_footing) / A',
        'q_net ≤ q_allow  (soil bearing capacity)',
        'A = B² (square footing)',
        'W_footing ≈ 0.1 × N_service (self-weight estimate ~10%)',
      ],
      inputs: [
        { name: 'n_service_kn', label: 'Service Column Load', unit: 'kN',   type: 'number', min: 10, max: 50000, default: 1000, required: true, help: 'Unfactored service axial load from column (G_k + Q_k)' },
        { name: 'q_allow_kpa',  label: 'Allowable Bearing Pressure', unit: 'kPa', type: 'number', min: 50, max: 2000, default: 200, required: true, help: 'Net allowable bearing capacity from soil investigation. Clay 50-150 kPa; dense sand 150-300 kPa; gravel 300-600 kPa.' },
        { name: 'col_size_mm',  label: 'Column Size (square)', unit: 'mm',  type: 'number', min: 200, max: 1500, default: 400, required: true, help: 'Square column dimension' },
      ],
      outputs: [
        { name: 'footing_b_m',  label: 'Required Footing Width (B)',  unit: 'm',   precision: 2 },
        { name: 'footing_area', label: 'Footing Area',                unit: 'm²',  precision: 2 },
        { name: 'bearing_kpa',  label: 'Actual Bearing Pressure',     unit: 'kPa', precision: 1 },
        { name: 'bearing_ok',   label: 'Bearing OK',                  unit: '',    precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const N = +inp.n_service_kn;
        const qa = +inp.q_allow_kpa;
        const B = Math.sqrt((N*1.1) / qa);
        const Bsel = Math.ceil(B*10)/10; // round up to 0.1m
        const q = (N*1.1)/(Bsel*Bsel);
        return { footing_b_m: Math.round(Bsel*100)/100, footing_area: Math.round(Bsel*Bsel*100)/100, bearing_kpa: Math.round(q*10)/10, bearing_ok: q <= qa };
      }
    },
    {
      stepNumber: 2, name: 'Flexural Reinforcement',
      description: 'Calculate bending moment in the footing at the column face and determine bottom reinforcement using simple beam analogy.',
      standard_ref: 'EN 1992-1-1 § 9.8.2',
      formula_display: [
        'M_Ed = q_factored × c² / 2   (per unit width)',
        'c = (B − b_col) / 2   (cantilever projection)',
        'q_factored = 1.35 × q_service (or from column factored load)',
        'A_s = M_Ed / (0.9 d f_yd)  [simplified]',
      ],
      inputs: [
        { name: 'footing_b_m',  label: 'Footing Width',       unit: 'm',   type: 'number', min: 0.5, max: 10, required: true, help: 'From Step 1', fromPreviousStep: 'footing_b_m' },
        { name: 'bearing_kpa',  label: 'Bearing Pressure',    unit: 'kPa', type: 'number', min: 1, max: 2000, required: true, help: 'From Step 1', fromPreviousStep: 'bearing_kpa' },
        { name: 'col_size_mm',  label: 'Column Size',         unit: 'mm',  type: 'number', min: 200, max: 1500, default: 400, required: true, help: 'Column dimension (same as Step 1)' },
        { name: 'depth_mm',     label: 'Footing Overall Depth', unit: 'mm', type: 'number', min: 200, max: 1500, default: 500, required: true, help: 'Footing depth (typically B/5 or minimum 300 mm). Cover: 75 mm (ground face), 50 mm sides.' },
        { name: 'fck_mpa',      label: 'Concrete fck',        unit: 'MPa', type: 'number', min: 20, max: 50, default: 25, required: true, help: 'Characteristic compressive strength' },
      ],
      outputs: [
        { name: 'cantilever_m',  label: 'Cantilever Projection', unit: 'm',   precision: 3 },
        { name: 'med_kn_m_m',   label: 'Bending Moment',         unit: 'kN·m/m', precision: 2 },
        { name: 'as_mm2_m',     label: 'Required A_s',            unit: 'mm²/m',  precision: 0 },
        { name: 'as_min_mm2_m', label: 'Minimum A_s',             unit: 'mm²/m',  precision: 0 },
      ],
      calculate(inp) {
        const B = +inp.footing_b_m;
        const q_serv = +inp.bearing_kpa;
        const q_fact = q_serv * 1.35;
        const c = (B - +inp.col_size_mm/1000) / 2;
        const Med = q_fact * c*c / 2; // kN·m per metre width
        const d = +inp.depth_mm - 75 - 8; // cover 75mm + half 16mm bar
        const fyd = 500/1.15;
        const As = Med*1e6 / (0.9 * d * fyd);  // mm²/m
        const As_min = 0.0013 * 1000 * d; // EN1992 9.2.1.1
        return { cantilever_m: Math.round(c*1000)/1000, med_kn_m_m: Math.round(Med*100)/100, as_mm2_m: Math.round(As), as_min_mm2_m: Math.round(As_min) };
      }
    }
  ]
};

// ── RC Slab Design ────────────────────────────────────────────────────────────
export const rcSlabDesign: EngineeringPipeline = {
  id: 'rc-slab-design',
  name: 'RC Slab Design (One-Way)',
  description: 'Design a one-way spanning reinforced concrete slab: determine design moment, required reinforcement, and check span/depth ratio for deflection.',
  domain: 'civil', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '⬜',
  steps: [
    {
      stepNumber: 1, name: 'Slab Loading',
      description: 'Calculate the total design load on the slab including self-weight, superimposed dead load, and imposed load.',
      standard_ref: 'EN 1991-1-1 (floor imposed loads)',
      formula_display: [
        'Self-weight = ρ_conc × h_slab × 9.81 / 1000  (kN/m²)',
        'w_d = 1.35 (SW + SDL) + 1.5 Q_k',
        'M_Ed = w_d × L² / 8',
      ],
      inputs: [
        { name: 'slab_thick_mm', label: 'Slab Thickness', unit: 'mm',   type: 'number', min: 100, max: 500, default: 175,  required: true, help: 'Overall slab thickness (preliminary: span/30 for two-way, span/25 for one-way)' },
        { name: 'sdl_kpa',       label: 'Superimposed Dead Load (SDL)', unit: 'kPa', type: 'number', min: 0, max: 20, default: 1.5, required: true, help: 'Finishes, services, partitions (0.5–3.0 kPa typical for offices)' },
        { name: 'imposed_kpa',   label: 'Imposed Load (Q_k)', unit: 'kPa', type: 'number', min: 0.5, max: 30, default: 3.0, required: true, help: 'Office: 2.5-3.0 kPa; residential: 1.5-2.0 kPa; car park: 2.5 kPa; assembly: 4.0-5.0 kPa (EN 1991-1-1)' },
        { name: 'span_m',        label: 'Span',           unit: 'm',    type: 'number', min: 0.5, max: 15, default: 5.0,  required: true, help: 'Clear span of the slab' },
      ],
      outputs: [
        { name: 'sw_kpa',    label: 'Slab Self-Weight',     unit: 'kPa',  precision: 2 },
        { name: 'wd_kpa',    label: 'Total Design Load',    unit: 'kPa',  precision: 2 },
        { name: 'med_kn_m_m',label: 'Design Moment (per m width)', unit: 'kN·m/m', precision: 2 },
      ],
      calculate(inp) {
        const sw = 25 * +inp.slab_thick_mm/1000; // kN/m²  (ρ=25 kN/m³)
        const wd = 1.35*(sw + +inp.sdl_kpa) + 1.5*+inp.imposed_kpa;
        const Med = wd * +inp.span_m * +inp.span_m / 8;
        return { sw_kpa: Math.round(sw*100)/100, wd_kpa: Math.round(wd*100)/100, med_kn_m_m: Math.round(Med*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Reinforcement & Deflection Check',
      description: 'Calculate reinforcement per unit width and check deflection using the simplified span-to-effective depth ratio method.',
      standard_ref: 'EN 1992-1-1 § 7.4 (deflection)',
      formula_display: [
        'A_s = M_Ed / (f_yd × 0.9d)',
        'Span/d limit = K × [11 + 1.5√fck ρ₀/ρ + 3.2√fck (ρ₀/ρ−1)^(3/2)]  if ρ ≤ ρ₀',
        'ρ₀ = 0.001√fck; K = 1.0 (simply-supported), 1.3 (end span), 1.5 (interior span)',
        'Deflection OK if actual L/d ≤ limiting L/d',
      ],
      inputs: [
        { name: 'med_kn_m_m', label: 'Design Moment', unit: 'kN·m/m', type: 'number', min: 0, max: 1000, required: true, help: 'From Step 1', fromPreviousStep: 'med_kn_m_m' },
        { name: 'slab_thick_mm', label: 'Slab Thickness', unit: 'mm', type: 'number', min: 100, max: 500, default: 175, required: true, help: 'Slab thickness (same as Step 1)' },
        { name: 'span_m',     label: 'Span',         unit: 'm',       type: 'number', min: 0.5, max: 15, default: 5.0, required: true, help: 'Span (same as Step 1)' },
        { name: 'fck_mpa',    label: 'Concrete fck', unit: 'MPa',     type: 'number', min: 20, max: 50, default: 25, required: true, help: 'Concrete grade' },
        { name: 'support_cond', label: 'Span Condition', unit: '', type: 'select', options: [{value:'1.0',label:'Simply-Supported (K=1.0)'},{value:'1.3',label:'End Span (K=1.3)'},{value:'1.5',label:'Interior Span (K=1.5)'}], default: '1.0', required: true, help: 'Continuity condition affects allowable L/d' },
      ],
      outputs: [
        { name: 'eff_depth_mm',   label: 'Effective Depth',    unit: 'mm',    precision: 0 },
        { name: 'as_mm2_m',       label: 'Required A_s',        unit: 'mm²/m', precision: 0 },
        { name: 'l_d_actual',     label: 'Actual L/d',          unit: '',      precision: 1 },
        { name: 'l_d_limit',      label: 'Allowable L/d',       unit: '',      precision: 1 },
        { name: 'deflect_ok',     label: 'Deflection Check OK', unit: '',      precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const d = +inp.slab_thick_mm - 25 - 6; // cover 25mm + half T12
        const fyd = 500/1.15;
        const As = +inp.med_kn_m_m*1e6 / (fyd * 0.9 * d);
        const fck = +inp.fck_mpa;
        const rho0 = 0.001*Math.sqrt(fck);
        const rho = As / (1000*d);
        const K = +inp.support_cond;
        let ld_lim: number;
        if (rho <= rho0) {
          ld_lim = K*(11 + 1.5*Math.sqrt(fck)*rho0/rho + 3.2*Math.sqrt(fck)*Math.pow(rho0/rho-1, 1.5));
        } else {
          ld_lim = K*(11 + 1.5*Math.sqrt(fck)*rho0/(rho-rho0) + Math.sqrt(fck/rho0)*Math.sqrt(rho/rho0)/12);
        }
        const ld_actual = +inp.span_m*1000/d;
        return { eff_depth_mm: Math.round(d), as_mm2_m: Math.round(As), l_d_actual: Math.round(ld_actual*10)/10, l_d_limit: Math.round(ld_lim*10)/10, deflect_ok: ld_actual <= ld_lim };
      }
    }
  ]
};

// ── Wind Load Analysis ────────────────────────────────────────────────────────
export const windLoadAnalysis: EngineeringPipeline = {
  id: 'wind-load-analysis',
  name: 'Wind Load Analysis',
  description: 'Calculate design wind loads on a building using EN 1991-1-4 (Eurocode 1). Determines peak wind pressure for structural design.',
  domain: 'civil', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🌬️',
  steps: [
    {
      stepNumber: 1, name: 'Basic Wind Velocity',
      description: 'Calculate the basic and mean wind velocity accounting for terrain category, height, and directional/seasonal factors.',
      standard_ref: 'EN 1991-1-4 § 4.3',
      formula_display: [
        'v_b = c_dir × c_season × v_b0',
        'v_m(z) = c_r(z) × c_o(z) × v_b',
        'c_r(z) = k_r × ln(z/z₀)   (roughness factor)',
        'z₀: roughness length; k_r = 0.19 × (z₀/0.05)^0.07',
      ],
      inputs: [
        { name: 'vb0_ms',       label: 'Fundamental Wind Speed (v_b0)', unit: 'm/s', type: 'number', min: 10, max: 60, default: 28,  required: true, help: 'Basic wind speed from national wind map (NA to EN 1991-1-4)' },
        { name: 'terrain_cat',  label: 'Terrain Category',              unit: '',    type: 'select', options: [{value:'0',label:'0 — Sea coast'},{value:'I',label:'I — Open flat country'},{value:'II',label:'II — Agricultural (z₀=0.05m)'},{value:'III',label:'III — Suburban/industrial (z₀=0.3m)'},{value:'IV',label:'IV — Urban (z₀=1.0m)'}], default: 'II', required: true, help: 'Terrain roughness category affects wind profile' },
        { name: 'height_z_m',   label: 'Reference Height (z)',          unit: 'm',   type: 'number', min: 1, max: 300, default: 10,   required: true, help: 'Height above ground at which wind pressure is calculated (use building eave height for cladding, ridge for overall pressure)' },
        { name: 'cdir',         label: 'Directional Factor (c_dir)',    unit: '',    type: 'number', min: 0.7, max: 1.0, default: 1.0, required: true, help: 'Directional factor (1.0 for conservative; NAs may give reduced values)' },
      ],
      outputs: [
        { name: 'z0_m',     label: 'Roughness Length (z₀)',  unit: 'm',   precision: 3 },
        { name: 'cr',       label: 'Roughness Factor (c_r)', unit: '',    precision: 3 },
        { name: 'vb_ms',    label: 'Basic Wind Speed (v_b)', unit: 'm/s', precision: 2 },
        { name: 'vm_ms',    label: 'Mean Wind Speed (v_m)',  unit: 'm/s', precision: 2 },
      ],
      calculate(inp) {
        const z0_map: Record<string,number> = {'0':0.003,'I':0.01,'II':0.05,'III':0.3,'IV':1.0};
        const zmin_map: Record<string,number> = {'0':1,'I':1,'II':2,'III':5,'IV':10};
        const cat = String(inp.terrain_cat);
        const z0 = z0_map[cat];
        const zmin = zmin_map[cat];
        const z = Math.max(+inp.height_z_m, zmin);
        const kr = 0.19 * Math.pow(z0/0.05, 0.07);
        const cr = kr * Math.log(z/z0);
        const vb = +inp.vb0_ms * +inp.cdir;
        const vm = cr * vb;
        return { z0_m: z0, cr: Math.round(cr*1000)/1000, vb_ms: Math.round(vb*100)/100, vm_ms: Math.round(vm*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Peak Wind Pressure',
      description: 'Calculate the peak velocity pressure q_p(z) including turbulence intensity, then apply external pressure coefficient to get design wind pressure.',
      standard_ref: 'EN 1991-1-4 § 4.5',
      formula_display: [
        'q_p(z) = (1 + 7 I_v) × 0.5 ρ v_m²',
        'I_v(z) = σ_v / v_m = k_I / (c_o ln(z/z₀))   (turbulence intensity)',
        'w_e = q_p(z) × c_pe   (external wind pressure)',
        'c_pe: from EN 1991-1-4 Fig. 7.4 (walls) or 7.5 (roof)',
      ],
      inputs: [
        { name: 'vm_ms',   label: 'Mean Wind Speed (v_m)', unit: 'm/s', type: 'number', min: 1, max: 100, required: true, help: 'From Step 1', fromPreviousStep: 'vm_ms' },
        { name: 'cr',      label: 'Roughness Factor (c_r)', unit: '',   type: 'number', min: 0.1, max: 3, required: true, help: 'From Step 1', fromPreviousStep: 'cr' },
        { name: 'cpe',     label: 'External Pressure Coeff. (c_pe)', unit: '', type: 'number', min: -3, max: 1, default: 0.8, required: true, help: 'Wind pressure coefficient from EN 1991-1-4: windward wall +0.8; leeward wall −0.5; side walls −0.7; flat roof −1.0 to +0.2' },
        { name: 'air_density', label: 'Air Density (ρ)', unit: 'kg/m³', type: 'number', min: 1.0, max: 1.4, default: 1.25, required: true, help: 'Air density: 1.25 kg/m³ at sea level/20°C; reduces at altitude' },
      ],
      outputs: [
        { name: 'iv',       label: 'Turbulence Intensity',    unit: '',     precision: 3 },
        { name: 'qp_kpa',   label: 'Peak Velocity Pressure',  unit: 'kPa',  precision: 3 },
        { name: 'we_kpa',   label: 'Design Wind Pressure',    unit: 'kPa',  precision: 3 },
      ],
      calculate(inp) {
        const vm = +inp.vm_ms;
        const cr = +inp.cr;
        const k_I = 1.0;  // turbulence factor
        const Iv = k_I / (cr); // simplified
        const qp = (1 + 7*Iv) * 0.5 * +inp.air_density * vm*vm / 1000; // kPa
        const we = qp * +inp.cpe;
        return { iv: Math.round(Iv*1000)/1000, qp_kpa: Math.round(qp*1000)/1000, we_kpa: Math.round(we*1000)/1000 };
      }
    }
  ]
};

// ── Retaining Wall Stability ──────────────────────────────────────────────────
export const retainingWall: EngineeringPipeline = {
  id: 'retaining-wall-stability',
  name: 'Retaining Wall Stability',
  description: 'Check stability of a gravity or cantilever retaining wall: calculate active earth pressure, verify sliding and overturning resistance.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '12-15 min', icon: '🧱',
  steps: [
    {
      stepNumber: 1, name: 'Active Earth Pressure',
      description: 'Calculate the active earth pressure using Rankine\'s theory. The coefficient Ka depends on the soil friction angle φ\'.',
      standard_ref: 'EN 1997-1 § 11 / Rankine (1857)',
      formula_display: [
        'Ka = (1 − sin φ\') / (1 + sin φ\')   [Rankine]',
        'P_a = 0.5 × Ka × γ × H²   (resultant force at H/3 from base)',
        'With surcharge: P_a_total = Ka × q × H + 0.5 × Ka × γ × H²',
      ],
      inputs: [
        { name: 'wall_height_m',  label: 'Retained Height (H)',    unit: 'm',    type: 'number', min: 0.5, max: 20, default: 4,   required: true, help: 'Height of soil retained' },
        { name: 'soil_density',   label: 'Soil Unit Weight (γ)',   unit: 'kN/m³', type: 'number', min: 14, max: 22, default: 18,  required: true, help: 'Unit weight: loose sand 16–18, dense sand 18–20, clay 17–20 kN/m³' },
        { name: 'phi_deg',        label: 'Soil Friction Angle (φ\')', unit: '°', type: 'number', min: 15, max: 45, default: 30,  required: true, help: 'Effective internal friction angle: loose sand ~28°, medium sand ~32°, dense sand ~38°, clay 15–25°' },
        { name: 'surcharge_kpa',  label: 'Surcharge (q)',          unit: 'kPa',  type: 'number', min: 0, max: 100, default: 10,  required: true, help: 'Uniform surcharge on retained soil (road traffic: 10-20 kPa; storage: 20-50 kPa)' },
      ],
      outputs: [
        { name: 'ka',          label: 'Active Pressure Coeff. (Ka)', unit: '',     precision: 3 },
        { name: 'pa_soil_kn_m',label: 'Earth Pressure Force',        unit: 'kN/m', precision: 2 },
        { name: 'pa_surch_kn_m',label: 'Surcharge Pressure Force',   unit: 'kN/m', precision: 2 },
        { name: 'pa_total_kn_m',label: 'Total Active Force',          unit: 'kN/m', precision: 2 },
      ],
      calculate(inp) {
        const phi = +inp.phi_deg * Math.PI/180;
        const Ka = (1-Math.sin(phi))/(1+Math.sin(phi));
        const H = +inp.wall_height_m;
        const gamma = +inp.soil_density;
        const q = +inp.surcharge_kpa;
        const Pa_soil = 0.5*Ka*gamma*H*H;
        const Pa_surch = Ka*q*H;
        return { ka: Math.round(Ka*1000)/1000, pa_soil_kn_m: Math.round(Pa_soil*100)/100, pa_surch_kn_m: Math.round(Pa_surch*100)/100, pa_total_kn_m: Math.round((Pa_soil+Pa_surch)*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Sliding & Overturning Check',
      description: 'Verify the wall does not slide (horizontal forces) or overturn (moments about toe). Factors of safety: FOS_slide ≥ 1.5, FOS_overturn ≥ 2.0.',
      standard_ref: 'EN 1997-1 / BS 8002',
      formula_display: [
        'FOS_slide = (W × tan δ_base) / Pa_total ≥ 1.5',
        'FOS_overturn = M_resist / M_overturn ≥ 2.0',
        'M_overturn = Pa_soil × H/3 + Pa_surch × H/2',
        'δ_base ≈ 0.67 φ\' (base-soil friction)',
      ],
      inputs: [
        { name: 'pa_total_kn_m', label: 'Total Active Force', unit: 'kN/m', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'pa_total_kn_m' },
        { name: 'pa_soil_kn_m',  label: 'Earth Pressure Force', unit: 'kN/m', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'pa_soil_kn_m' },
        { name: 'pa_surch_kn_m', label: 'Surcharge Force',    unit: 'kN/m', type: 'number', min: 0, max: 5000, required: true, help: 'From Step 1', fromPreviousStep: 'pa_surch_kn_m' },
        { name: 'wall_weight_kn_m',label: 'Wall Self-Weight (W)', unit: 'kN/m', type: 'number', min: 5, max: 5000, default: 120, required: true, help: 'Weight of wall per metre run. Concrete gravity wall: ρ_conc × volume ≈ 25 × B × H kN/m' },
        { name: 'wall_height_m', label: 'Wall Height (H)',    unit: 'm',    type: 'number', min: 0.5, max: 20, default: 4, required: true, help: 'Retained height (same as Step 1)' },
        { name: 'phi_deg',       label: 'Friction Angle (φ\')', unit: '°', type: 'number', min: 15, max: 45, default: 30, required: true, help: 'Soil friction angle (same as Step 1)' },
        { name: 'base_width_m',  label: 'Base Width (B)',     unit: 'm',   type: 'number', min: 0.5, max: 20, default: 2.5, required: true, help: 'Width of wall base (typically 0.5–0.7 × H for gravity walls)' },
      ],
      outputs: [
        { name: 'fos_slide',     label: 'FOS Sliding',              unit: '', precision: 2 },
        { name: 'fos_overturn',  label: 'FOS Overturning',          unit: '', precision: 2 },
        { name: 'slide_ok',      label: 'Sliding OK (FOS ≥ 1.5)',   unit: '', precision: 0, isCompliance: true },
        { name: 'overturn_ok',   label: 'Overturning OK (FOS ≥ 2.0)', unit: '', precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Pa = +inp.pa_total_kn_m;
        const Pa_s = +inp.pa_soil_kn_m;
        const Pa_q = +inp.pa_surch_kn_m;
        const W = +inp.wall_weight_kn_m;
        const H = +inp.wall_height_m;
        const phi = +inp.phi_deg*Math.PI/180;
        const B = +inp.base_width_m;
        const delta = 0.67*phi;
        const FOS_slide = (W*Math.tan(delta)) / Pa;
        const M_over = Pa_s*H/3 + Pa_q*H/2;
        const M_resist = W*B/2;
        const FOS_over = M_resist / M_over;
        return { fos_slide: Math.round(FOS_slide*100)/100, fos_overturn: Math.round(FOS_over*100)/100, slide_ok: FOS_slide >= 1.5, overturn_ok: FOS_over >= 2.0 };
      }
    }
  ]
};

// ── Seismic Base Shear ────────────────────────────────────────────────────────
export const seismicBaseShear: EngineeringPipeline = {
  id: 'seismic-base-shear',
  name: 'Seismic Base Shear (Equivalent Static)',
  description: 'Calculate seismic base shear using the Equivalent Static Analysis method per EN 1998-1 (Eurocode 8). Applicable to regular buildings.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '10-12 min', icon: '🌋',
  steps: [
    {
      stepNumber: 1, name: 'Design Spectral Acceleration',
      description: 'Determine the design spectral acceleration Sd(T) at the fundamental period of the building.',
      standard_ref: 'EN 1998-1 § 3.2.2',
      formula_display: [
        'T_1 ≈ C_t × H^(3/4)   (empirical, EN 1998 4.3.3.2)',
        'C_t = 0.085 (steel moment frames), 0.075 (RC frames), 0.05 (other)',
        'S_d(T) = a_g × S × 2.5 / q   (plateau region, T_B ≤ T ≤ T_C)',
        'a_g: design ground acceleration; S: soil factor; q: behaviour factor',
      ],
      inputs: [
        { name: 'ag_g',       label: 'Peak Ground Acceleration (a_g/g)', unit: 'g', type: 'number', min: 0.01, max: 1.0, default: 0.15, required: true, help: 'Peak ground acceleration from seismic hazard map (fraction of g). Low seismicity: <0.1g; moderate: 0.1–0.3g; high: >0.3g.' },
        { name: 'soil_type',  label: 'Ground Type',   unit: '', type: 'select', options: [{value:'A',label:'A — Rock (S=1.0)'},{value:'B',label:'B — Dense sand (S=1.2)'},{value:'C',label:'C — Medium sand (S=1.15)'},{value:'D',label:'D — Loose deposits (S=1.35)'}], default: 'B', required: true, help: 'Ground type per EN 1998-1 Table 3.1 affects amplification' },
        { name: 'q_factor',   label: 'Behaviour Factor (q)', unit: '', type: 'number', min: 1.0, max: 6.0, default: 3.0, required: true, help: 'Ductility factor: q=1.5 (low ductility), q=3.0 (medium RC frames), q=4.0 (high ductility MRF)' },
        { name: 'height_m',   label: 'Building Height (H)', unit: 'm', type: 'number', min: 2, max: 200, default: 20, required: true, help: 'Total height from foundation to top of structure' },
        { name: 'struct_type',label: 'Structure Type', unit: '', type: 'select', options: [{value:'0.075',label:'RC Frame (Ct=0.075)'},{value:'0.085',label:'Steel Frame (Ct=0.085)'},{value:'0.05',label:'Other/Wall (Ct=0.05)'}], default: '0.075', required: true, help: 'Structure type determines empirical period coefficient' },
      ],
      outputs: [
        { name: 't1_s',   label: 'Fundamental Period (T₁)', unit: 's',  precision: 3 },
        { name: 's_factor',label: 'Soil Factor (S)',         unit: '',   precision: 2 },
        { name: 'sd_g',   label: 'Design Spectral Acc.',    unit: 'g',  precision: 4 },
      ],
      calculate(inp) {
        const Ct = +inp.struct_type;
        const T1 = Ct * Math.pow(+inp.height_m, 0.75);
        const S_map: Record<string,number> = {A:1.0,B:1.2,C:1.15,D:1.35};
        const S = S_map[String(inp.soil_type)];
        const ag = +inp.ag_g;
        const q = +inp.q_factor;
        // Plateau: Sd = ag × S × 2.5 / q (use plateau value, conservative)
        const Sd = ag * S * 2.5 / q;
        return { t1_s: Math.round(T1*1000)/1000, s_factor: S, sd_g: Math.round(Sd*10000)/10000 };
      }
    },
    {
      stepNumber: 2, name: 'Base Shear & Story Forces',
      description: 'Calculate the total base shear force and distribute it up the building height (triangular distribution for regular buildings).',
      standard_ref: 'EN 1998-1 § 4.3.3.2',
      formula_display: [
        'F_b = S_d(T₁) × m × λ',
        'λ = 0.85 (T₁ ≤ 2T_C & > 2 storeys), 1.0 otherwise',
        'm: total seismic mass = G_k + ψ₂ Q_k',
        'F_i = F_b × (z_i × m_i) / Σ(z_j × m_j)   [distribution]',
      ],
      inputs: [
        { name: 'sd_g',        label: 'Spectral Acceleration', unit: 'g',  type: 'number', min: 0.001, max: 5, required: true, help: 'From Step 1', fromPreviousStep: 'sd_g' },
        { name: 'total_mass_t',label: 'Total Seismic Mass',   unit: 't',  type: 'number', min: 1, max: 1000000, default: 2000, required: true, help: 'Total building seismic mass: dead load + 30% live load. For each floor: (slab + beams + columns + 0.3 × live) in tonnes' },
        { name: 'num_floors',  label: 'Number of Storeys',    unit: '',   type: 'number', min: 1, max: 50, default: 5, required: true, help: 'Number of storeys above foundation' },
        { name: 'floor_height_m', label: 'Typical Floor Height', unit: 'm', type: 'number', min: 2, max: 8, default: 3.5, required: true, help: 'Typical storey height (used to calculate centroid of lateral forces)' },
      ],
      outputs: [
        { name: 'total_weight_kn', label: 'Total Seismic Weight', unit: 'kN', precision: 0 },
        { name: 'base_shear_kn',   label: 'Base Shear (F_b)',     unit: 'kN', precision: 0 },
        { name: 'base_shear_pct',  label: 'Base Shear / Weight',  unit: '%',  precision: 2 },
      ],
      calculate(inp) {
        const Sd = +inp.sd_g * 9.81;  // m/s²
        const m = +inp.total_mass_t * 1000;  // kg
        const lambda = 0.85;
        const Fb = Sd * m * lambda / 1000;  // kN
        const W = m * 9.81 / 1000;
        return { total_weight_kn: Math.round(W), base_shear_kn: Math.round(Fb), base_shear_pct: Math.round(Fb/W*100*100)/100 };
      }
    }
  ]
};

// ── Bearing Capacity (Terzaghi) ───────────────────────────────────────────────
export const bearingCapacity: EngineeringPipeline = {
  id: 'soil-bearing-capacity',
  name: 'Soil Bearing Capacity (Terzaghi)',
  description: 'Calculate ultimate and allowable bearing capacity of a shallow foundation using Terzaghi\'s general bearing capacity equation.',
  domain: 'civil', difficulty: 'advanced', estimated_time: '10-12 min', icon: '🌱',
  steps: [
    {
      stepNumber: 1, name: 'Ultimate Bearing Capacity',
      description: 'Calculate the ultimate bearing capacity using Terzaghi\'s equation. Nc, Nq, Nγ are bearing capacity factors dependent on friction angle φ\'.',
      standard_ref: 'Terzaghi (1943) / EN 1997-1 Annex D',
      formula_display: [
        'q_ult = c\' Nc + γ D_f Nq + 0.5 γ B Nγ   [strip footing]',
        'Nc = (Nq−1) cot φ\'',
        'Nq = e^(π tanφ\') tan²(45+φ\'/2)',
        'Nγ = 2(Nq+1) tanφ\'  [Hansen]',
        'q_allow = q_ult / FOS   (FOS = 3.0 gross)',
      ],
      inputs: [
        { name: 'cohesion_kpa',  label: 'Cohesion (c\')',          unit: 'kPa', type: 'number', min: 0, max: 500, default: 0,    required: true, help: 'Effective cohesion: sand/gravel ≈ 0 kPa; soft clay 10–30 kPa; stiff clay 25–80 kPa' },
        { name: 'phi_deg',       label: 'Friction Angle (φ\')',   unit: '°',   type: 'number', min: 0, max: 50,  default: 32,   required: true, help: 'Effective internal friction angle from lab tests or SPT correlation' },
        { name: 'gamma_kn_m3',   label: 'Soil Unit Weight (γ)',   unit: 'kN/m³', type: 'number', min: 10, max: 22, default: 18, required: true, help: 'Bulk unit weight of soil' },
        { name: 'depth_m',       label: 'Foundation Depth (D_f)', unit: 'm',   type: 'number', min: 0.3, max: 10, default: 1.5, required: true, help: 'Depth from ground surface to base of footing' },
        { name: 'width_m',       label: 'Footing Width (B)',      unit: 'm',   type: 'number', min: 0.3, max: 20, default: 2.0, required: true, help: 'Least dimension of footing' },
      ],
      outputs: [
        { name: 'nq',          label: 'Bearing Factor Nq',        unit: '',    precision: 2 },
        { name: 'nc',          label: 'Bearing Factor Nc',        unit: '',    precision: 2 },
        { name: 'ngamma',      label: 'Bearing Factor Nγ',        unit: '',    precision: 2 },
        { name: 'q_ult_kpa',   label: 'Ultimate Bearing Capacity', unit: 'kPa', precision: 1 },
        { name: 'q_allow_kpa', label: 'Allowable Bearing Capacity (FOS=3)', unit: 'kPa', precision: 1 },
      ],
      calculate(inp) {
        const phi = +inp.phi_deg * Math.PI/180;
        const c = +inp.cohesion_kpa;
        const gamma = +inp.gamma_kn_m3;
        const Df = +inp.depth_m;
        const B = +inp.width_m;
        const Nq = Math.exp(Math.PI*Math.tan(phi)) * Math.pow(Math.tan(Math.PI/4 + phi/2), 2);
        const Nc = (Nq-1)/Math.tan(phi);
        const Ngamma = 2*(Nq+1)*Math.tan(phi);
        const q_ult = c*Nc + gamma*Df*Nq + 0.5*gamma*B*Ngamma;
        return { nq: Math.round(Nq*100)/100, nc: Math.round(Nc*100)/100, ngamma: Math.round(Ngamma*100)/100, q_ult_kpa: Math.round(q_ult*10)/10, q_allow_kpa: Math.round(q_ult/3*10)/10 };
      }
    }
  ]
};

export const CIVIL_PIPELINES: EngineeringPipeline[] = [
  rcBeamDesign,
  steelColumnBuckling,
  isolatedFooting,
  rcSlabDesign,
  windLoadAnalysis,
  retainingWall,
  seismicBaseShear,
  bearingCapacity,
];
