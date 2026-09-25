import type { EngineeringPipeline } from '../engineeringPipelines';

// ── Water Supply Pipe Sizing ──────────────────────────────────────────────────
export const waterPipeSizing: EngineeringPipeline = {
  id: 'water-pipe-sizing',
  name: 'Building Water Supply Pipe Sizing',
  description: 'Size cold water supply pipes in a building using the Loading Unit method (BS EN 806-3): convert fixture units to flow demand, size pipes to maintain adequate pressure.',
  domain: 'hydraulics', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🚰',
  steps: [
    {
      stepNumber: 1, name: 'Design Flow Rate',
      description: 'Convert fixture loading units to design flow rate using the BS EN 806-3 demand curve. Loading Units account for usage frequency and flow rate of each fixture.',
      standard_ref: 'BS EN 806-3:2006 Table 1 & Demand Curve',
      formula_display: [
        'Total LU = Σ(fixture count × LU per fixture)',
        'LU values: WC cistern 2, basin tap 1, shower 2, bath 3, kitchen sink 3, dishwasher 3',
        'Design flow: Q = 0.682 × LU^0.45 − 0.14   (L/s, for LU > 8)',
        'Minimum velocity: 0.5 m/s; maximum: 3.0 m/s (noise/erosion)',
      ],
      inputs: [
        { name: 'wc_count',      label: 'WC Cisterns',         unit: '',    type: 'number', min: 0, max: 500, default: 8,  required: true, help: 'Number of WC cisterns (LU=2 each)' },
        { name: 'basin_count',   label: 'Washbasins',          unit: '',    type: 'number', min: 0, max: 500, default: 8,  required: true, help: 'Washbasin taps (LU=1 each per BS EN 806)' },
        { name: 'shower_count',  label: 'Showers',             unit: '',    type: 'number', min: 0, max: 200, default: 2,  required: true, help: 'Shower units (LU=2 each)' },
        { name: 'kitchen_count', label: 'Kitchen Sinks',       unit: '',    type: 'number', min: 0, max: 100, default: 2,  required: true, help: 'Kitchen sinks (LU=3 each)' },
        { name: 'other_lu',      label: 'Other Fixtures (LU)', unit: 'LU',  type: 'number', min: 0, max: 1000, default: 5, required: true, help: 'Loading units for any other fixtures (baths, dishwashers, etc.)' },
      ],
      outputs: [
        { name: 'total_lu',      label: 'Total Loading Units',   unit: 'LU',  precision: 0 },
        { name: 'design_flow_ls',label: 'Design Flow Rate',      unit: 'L/s', precision: 3 },
        { name: 'design_flow_m3h',label: 'Design Flow Rate',     unit: 'm³/h', precision: 2 },
      ],
      calculate(inp) {
        const LU = +inp.wc_count*2 + +inp.basin_count*1 + +inp.shower_count*2 + +inp.kitchen_count*3 + +inp.other_lu;
        const Q = LU <= 8 ? 0.15*Math.sqrt(LU) : 0.682*Math.pow(LU,0.45) - 0.14;
        return { total_lu: Math.round(LU), design_flow_ls: Math.round(Q*1000)/1000, design_flow_m3h: Math.round(Q*3.6*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Pipe Sizing & Pressure Drop',
      description: 'Select pipe diameter to maintain flow velocity within acceptable limits and calculate available residual pressure at the most remote outlet.',
      standard_ref: 'BS EN 806-3 § 5.2 / CIBSE Guide G',
      formula_display: [
        'D = √(4Q / πV_design)',
        'Select standard pipe ≥ D_calculated',
        'V_actual = 4Q / (π D²)',
        'ΔP = f × (L/D) × ρV²/2   (Darcy-Weisbach)',
        'P_residual = P_inlet − ΔP − ρg h_static',
      ],
      inputs: [
        { name: 'design_flow_ls', label: 'Design Flow', unit: 'L/s', type: 'number', min: 0.01, max: 100, required: true, help: 'From Step 1', fromPreviousStep: 'design_flow_ls' },
        { name: 'pipe_length_m',  label: 'Pipe Length (inc. fittings equiv.)', unit: 'm', type: 'number', min: 1, max: 500, default: 30, required: true, help: 'Total equivalent pipe length including fitting allowance (typically +30% of straight pipe)' },
        { name: 'p_inlet_kpa',    label: 'Inlet Pressure (static)',  unit: 'kPa', type: 'number', min: 100, max: 1000, default: 300, required: true, help: 'Available pressure at the incoming main connection (minimum 100 kPa residual required at draw-off)' },
        { name: 'height_diff_m',  label: 'Height to Highest Outlet', unit: 'm',   type: 'number', min: 0, max: 100, default: 10,  required: true, help: 'Vertical height difference from mains connection to highest outlet (adds static pressure loss)' },
      ],
      outputs: [
        { name: 'pipe_dia_mm',    label: 'Selected Pipe Diameter',    unit: 'mm',  precision: 0 },
        { name: 'velocity_ms',    label: 'Flow Velocity',             unit: 'm/s', precision: 2 },
        { name: 'dp_friction_kpa',label: 'Friction Pressure Loss',    unit: 'kPa', precision: 1 },
        { name: 'p_residual_kpa', label: 'Residual Pressure at Outlet', unit: 'kPa', precision: 1 },
        { name: 'pressure_ok',    label: 'Min. 100 kPa Residual',    unit: '',    precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Q = +inp.design_flow_ls / 1000;  // m³/s
        const Vtarget = 1.5;  // m/s target velocity
        const D_calc = Math.sqrt(4*Q/(Math.PI*Vtarget));
        // Standard copper sizes (internal diameter) mm
        const STD = [15,22,28,35,42,54,67,76,108];
        const D_mm = STD.find(s => s/1000 >= D_calc) ?? 108;
        const D = D_mm/1000;
        const V = 4*Q/(Math.PI*D*D);
        const Re = V*D/1e-6;
        const e_D = 0.0015e-3/D;
        const f = 0.25/Math.pow(Math.log10(e_D/3.7 + 5.74/Math.pow(Re,0.9)),2);
        const dp = f*(+inp.pipe_length_m/D)*1000*V*V/2/1000; // kPa
        const p_res = +inp.p_inlet_kpa - dp - 9.81*+inp.height_diff_m;
        return { pipe_dia_mm: D_mm, velocity_ms: Math.round(V*100)/100, dp_friction_kpa: Math.round(dp*10)/10, p_residual_kpa: Math.round(p_res*10)/10, pressure_ok: p_res >= 100 };
      }
    }
  ]
};

// ── Stormwater Drainage ───────────────────────────────────────────────────────
export const stormwaterDrainage: EngineeringPipeline = {
  id: 'stormwater-drainage',
  name: 'Stormwater Drainage Design',
  description: 'Design stormwater drainage using the Rational Method: calculate peak runoff from rainfall intensity and catchment characteristics, then size the drain pipe.',
  domain: 'hydraulics', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🌧️',
  steps: [
    {
      stepNumber: 1, name: 'Peak Runoff (Rational Method)',
      description: 'Calculate the peak stormwater runoff flow using the Rational Formula Q = CiA. The runoff coefficient C accounts for surface impermeability.',
      standard_ref: 'CIRIA C753 / EN 752 (urban drainage)',
      formula_display: [
        'Q = C × i × A / 360   (m³/s, A in ha, i in mm/h)',
        'C: weighted runoff coefficient',
        'C = 0.9–0.95 (roads/paving), 0.7–0.9 (roofs), 0.2–0.5 (lawns)',
        'i: design rainfall intensity for storm duration t_c (from IDF curve)',
      ],
      inputs: [
        { name: 'catchment_ha',  label: 'Catchment Area',          unit: 'ha',   type: 'number', min: 0.01, max: 10000, default: 2,    required: true, help: 'Total catchment area draining to this point (1 ha = 10,000 m²)' },
        { name: 'runoff_coeff',  label: 'Runoff Coefficient (C)',  unit: '',     type: 'number', min: 0.1, max: 1.0,   default: 0.75, required: true, help: 'Weighted average runoff coefficient for catchment. Mixed urban: 0.65–0.75; commercial: 0.70–0.90' },
        { name: 'rain_int_mm_h', label: 'Design Rainfall Intensity', unit: 'mm/h', type: 'number', min: 5, max: 500,  default: 75,   required: true, help: 'Rainfall intensity for design return period (e.g. 10-year 1-hour event). From local IDF curves or national meteorological data.' },
        { name: 'return_period_yr', label: 'Return Period', unit: 'years', type: 'select', options: [{value:'2',label:'2-year (50%)'},{value:'10',label:'10-year (10%)'},{value:'30',label:'30-year (3.3%)'},{value:'100',label:'100-year (1%)'}], default: '10', required: true, help: 'Design return period. Roads: 10 yr; underpass: 30–100 yr; major culverts: 100 yr.' },
      ],
      outputs: [
        { name: 'peak_flow_m3s',  label: 'Peak Runoff Flow',  unit: 'm³/s',  precision: 4 },
        { name: 'peak_flow_ls',   label: 'Peak Runoff Flow',  unit: 'L/s',   precision: 1 },
        { name: 'peak_flow_m3h',  label: 'Peak Runoff Flow',  unit: 'm³/h',  precision: 1 },
      ],
      calculate(inp) {
        const Q = +inp.runoff_coeff * +inp.rain_int_mm_h * +inp.catchment_ha / 360;
        return { peak_flow_m3s: Math.round(Q*10000)/10000, peak_flow_ls: Math.round(Q*1000*10)/10, peak_flow_m3h: Math.round(Q*3600*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Drain Pipe Sizing (Manning)',
      description: 'Size the drain pipe using Manning\'s equation for open-channel (gravity) flow. The pipe must carry peak flow at ≤ 80% full depth (hydraulic capacity with freeboard).',
      standard_ref: 'EN 752 § 6 / Manning equation',
      formula_display: [
        'Q_full = (1/n) × A × R^(2/3) × S^(1/2)   [Manning]',
        'Q_design ≤ 0.80 × Q_full   (partial flow limit)',
        'R = A_flow / P_wet = D/4   (full pipe)',
        'n = 0.013 (concrete), 0.009 (smooth PVC), 0.011 (clay vitrified)',
      ],
      inputs: [
        { name: 'peak_flow_m3s',  label: 'Peak Flow',           unit: 'm³/s', type: 'number', min: 0.001, max: 100, required: true, help: 'From Step 1', fromPreviousStep: 'peak_flow_m3s' },
        { name: 'pipe_slope',     label: 'Pipe Gradient (S)',   unit: 'm/m',  type: 'number', min: 0.0005, max: 0.2, default: 0.005, required: true, help: 'Hydraulic gradient (fall/run). Min 0.5% (0.005) for self-cleansing; steeper = smaller pipe needed.' },
        { name: 'manning_n',      label: 'Manning\'s n',        unit: '',     type: 'select', options: [{value:'0.013',label:'Concrete (n=0.013)'},{value:'0.009',label:'Smooth PVC (n=0.009)'},{value:'0.011',label:'Vitrified Clay (n=0.011)'}], default: '0.013', required: true, help: 'Pipe roughness coefficient from Manning tables' },
      ],
      outputs: [
        { name: 'pipe_dia_mm',    label: 'Selected Pipe Diameter',     unit: 'mm',  precision: 0 },
        { name: 'v_full_ms',      label: 'Velocity at Full Flow',      unit: 'm/s', precision: 2 },
        { name: 'q_full_m3s',     label: 'Full-Bore Capacity',         unit: 'm³/s', precision: 4 },
        { name: 'self_cleansing', label: 'Self-Cleansing Velocity ≥ 0.75 m/s', unit: '', precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Q = +inp.peak_flow_m3s;
        const S = +inp.pipe_slope;
        const n = +inp.manning_n;
        const STD_MM = [150,225,300,375,450,525,600,750,900,1050,1200,1500];
        for (const D_mm of STD_MM) {
          const D = D_mm/1000;
          const A = Math.PI*D*D/4;
          const R = D/4;
          const Qfull = (1/n)*A*Math.pow(R,2/3)*Math.sqrt(S);
          if (Qfull*0.8 >= Q) {
            const V = Qfull/A;
            return { pipe_dia_mm: D_mm, v_full_ms: Math.round(V*100)/100, q_full_m3s: Math.round(Qfull*10000)/10000, self_cleansing: V >= 0.75 };
          }
        }
        return { pipe_dia_mm: 1500, v_full_ms: 0, q_full_m3s: 0, self_cleansing: false };
      }
    }
  ]
};

// ── Open Channel Flow ─────────────────────────────────────────────────────────
export const openChannelFlow: EngineeringPipeline = {
  id: 'open-channel-flow',
  name: 'Open Channel Flow (Manning)',
  description: 'Calculate flow capacity and velocity in an open channel (canal, drain, culvert) using Manning\'s equation. Determine normal depth and Froude number.',
  domain: 'hydraulics', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '🏞️',
  steps: [
    {
      stepNumber: 1, name: 'Channel Flow Parameters',
      description: 'Calculate normal flow depth, flow velocity, and Froude number using Manning\'s equation for uniform (normal) flow in a prismatic channel.',
      standard_ref: 'Open Channel Hydraulics — Chaudhry / Manning (1891)',
      formula_display: [
        'Q = (1/n) A R^(2/3) S^(1/2)',
        'Trapezoidal: A = (b + z×y) × y; P = b + 2y√(1+z²); R = A/P',
        'Fr = V / √(g × D_h)   [Froude number]',
        'Fr < 1: subcritical; Fr > 1: supercritical',
      ],
      inputs: [
        { name: 'flow_m3s',      label: 'Design Flow',        unit: 'm³/s', type: 'number', min: 0.001, max: 10000, default: 5.0, required: true, help: 'Design discharge to be conveyed' },
        { name: 'bed_width_m',   label: 'Bed Width (b)',      unit: 'm',    type: 'number', min: 0.1, max: 50,  default: 2.0,  required: true, help: 'Bottom width of trapezoidal channel (0 for triangular)' },
        { name: 'side_slope_z',  label: 'Side Slope (z:1)',   unit: '',     type: 'number', min: 0, max: 5,    default: 1.5,  required: true, help: 'Horizontal:vertical side slope. z=0 rectangular; z=1 45°; z=1.5 typical earthen; z=2 stable' },
        { name: 'depth_m',       label: 'Flow Depth (y)',     unit: 'm',    type: 'number', min: 0.05, max: 20, default: 1.2, required: true, help: 'Normal flow depth (iterate to match Q, or enter assumed depth and check capacity)' },
        { name: 'slope_m_m',     label: 'Channel Bed Slope',  unit: 'm/m',  type: 'number', min: 0.0001, max: 0.5, default: 0.001, required: true, help: 'Longitudinal bed slope (0.001 = 1:1000, typical for open channels)' },
        { name: 'manning_n',     label: 'Manning\'s n',       unit: '',     type: 'select', options: [{value:'0.012',label:'Concrete-lined (n=0.012)'},{value:'0.022',label:'Earthen, smooth (n=0.022)'},{value:'0.030',label:'Earthen, grass (n=0.030)'},{value:'0.040',label:'Rock-cut/natural (n=0.040)'}], default: '0.022', required: true, help: 'Manning roughness coefficient' },
      ],
      outputs: [
        { name: 'area_m2',    label: 'Flow Area',             unit: 'm²',  precision: 3 },
        { name: 'velocity_ms',label: 'Flow Velocity (V)',     unit: 'm/s', precision: 3 },
        { name: 'q_capacity', label: 'Channel Capacity',      unit: 'm³/s', precision: 3 },
        { name: 'froude',     label: 'Froude Number (Fr)',    unit: '',     precision: 3 },
        { name: 'adequate',   label: 'Channel Adequate (Q_cap ≥ Q_design)', unit: '', precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const b = +inp.bed_width_m;
        const z = +inp.side_slope_z;
        const y = +inp.depth_m;
        const S = +inp.slope_m_m;
        const n = +inp.manning_n;
        const A = (b + z*y)*y;
        const P = b + 2*y*Math.sqrt(1+z*z);
        const R = A/P;
        const V = (1/n)*Math.pow(R,2/3)*Math.sqrt(S);
        const Q = V*A;
        const Dh = A/(b+2*y); // hydraulic depth
        const Fr = V/Math.sqrt(9.81*Dh);
        return { area_m2: Math.round(A*1000)/1000, velocity_ms: Math.round(V*1000)/1000, q_capacity: Math.round(Q*1000)/1000, froude: Math.round(Fr*1000)/1000, adequate: Q >= +inp.flow_m3s };
      }
    }
  ]
};

// ── Fire Sprinkler Hydraulics ─────────────────────────────────────────────────
export const sprinklerHydraulics: EngineeringPipeline = {
  id: 'sprinkler-system-design',
  name: 'Fire Sprinkler System Design',
  description: 'Design a wet-pipe fire sprinkler system: determine sprinkler density, calculate hydraulic demand, size the main supply pipe.',
  domain: 'hydraulics', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🚒',
  steps: [
    {
      stepNumber: 1, name: 'Sprinkler Density & Demand Area',
      description: 'Determine the design density and maximum area of operation (MAO) based on occupancy hazard classification (EN 12845 or NFPA 13).',
      standard_ref: 'EN 12845:2015 Table 4 / NFPA 13',
      formula_display: [
        'Q_sprinkler = K × √P   (L/min)',
        'K: sprinkler K-factor (56 for standard residential; 80/115 commercial)',
        'Design density: OH1 5 mm/min, OH2 7.5 mm/min, OH3 10 mm/min',
        'Q_total = density (mm/min) × MAO (m²) × 1.0 L/m²/min',
      ],
      inputs: [
        { name: 'hazard_class', label: 'Occupancy Hazard Class', unit: '', type: 'select', options: [
          {value:'LH',  label:'Light Hazard (LH) — offices, hotels'},
          {value:'OH1', label:'OH1 — retail, light manufacturing'},
          {value:'OH2', label:'OH2 — moderate manufacturing'},
          {value:'OH3', label:'OH3 — heavy industrial'},
          {value:'OH4', label:'OH4 — high piled storage'},
        ], default: 'OH1', required: true, help: 'Occupancy hazard class per EN 12845 determines design density and MAO' },
        { name: 'protected_area_m2', label: 'Total Protected Area', unit: 'm²', type: 'number', min: 10, max: 50000, default: 500, required: true, help: 'Total floor area to be protected by the system' },
        { name: 'sprinkler_spacing_m2', label: 'Sprinkler Coverage Area', unit: 'm²/sprinkler', type: 'number', min: 5, max: 21, default: 12, required: true, help: 'Area per sprinkler (EN 12845 max: LH 21 m², OH 12 m²)' },
      ],
      outputs: [
        { name: 'design_density_mm_min', label: 'Design Density',     unit: 'mm/min', precision: 1 },
        { name: 'mao_m2',                label: 'Max Area of Operation', unit: 'm²',  precision: 0 },
        { name: 'num_sprinklers_total',  label: 'Total Sprinklers',    unit: '',       precision: 0 },
        { name: 'num_sprinklers_mao',    label: 'Sprinklers in MAO',   unit: '',       precision: 0 },
        { name: 'q_demand_lpm',          label: 'Hydraulic Demand',    unit: 'L/min',  precision: 0 },
      ],
      calculate(inp) {
        const DENSITY: Record<string,number> = {LH:2.25, OH1:5, OH2:7.5, OH3:10, OH4:12.5};
        const MAO_MAP: Record<string,number>  = {LH:84, OH1:72, OH2:144, OH3:216, OH4:260};
        const haz = String(inp.hazard_class);
        const density = DENSITY[haz];
        const mao = MAO_MAP[haz];
        const totalSpr = Math.ceil(+inp.protected_area_m2 / +inp.sprinkler_spacing_m2);
        const maoSpr = Math.ceil(mao / +inp.sprinkler_spacing_m2);
        const Q = density * mao;  // L/min (density mm/min = L/m²/min)
        return { design_density_mm_min: density, mao_m2: mao, num_sprinklers_total: totalSpr, num_sprinklers_mao: maoSpr, q_demand_lpm: Math.round(Q) };
      }
    },
    {
      stepNumber: 2, name: 'Main Supply Pipe Sizing',
      description: 'Size the main system supply pipe to the zone valve using the Hazen-Williams equation for fire water pipe systems.',
      standard_ref: 'EN 12845 § 13 / NFPA 13 § 23',
      formula_display: [
        'V = k × C × R^0.63 × S^0.54   [Hazen-Williams, not recommended for sprinklers]',
        'More accurate: Darcy-Weisbach with C = 120 (galv. steel) or 150 (PVC)',
        'ΔP = 6.05 × 10^4 × Q^1.85 / (C^1.85 × D^4.87)   [Hazen-Williams, kPa/m]',
        'Pipe velocity ≤ 6 m/s (system feed), ≤ 10 m/s (branch lines)',
      ],
      inputs: [
        { name: 'q_demand_lpm',  label: 'System Demand',       unit: 'L/min', type: 'number', min: 10, max: 100000, required: true, help: 'From Step 1', fromPreviousStep: 'q_demand_lpm' },
        { name: 'pipe_length_m', label: 'Pipe Length (inc. equiv. fittings)', unit: 'm', type: 'number', min: 1, max: 2000, default: 50, required: true, help: 'Total equivalent pipe length from water supply to furthest zone valve' },
        { name: 'available_pressure_kpa', label: 'Available Supply Pressure', unit: 'kPa', type: 'number', min: 100, max: 1500, default: 700, required: true, help: 'Static pressure at the water supply connection point. Minimum 300 kPa at most remote sprinkler required.' },
        { name: 'height_m',      label: 'Height to Highest Level', unit: 'm', type: 'number', min: 0, max: 100, default: 0, required: true, help: 'Height from supply to highest sprinkler (adds to required pressure)' },
      ],
      outputs: [
        { name: 'pipe_dia_mm',      label: 'Selected Main Pipe Diameter', unit: 'mm',  precision: 0 },
        { name: 'flow_velocity_ms', label: 'Flow Velocity',               unit: 'm/s', precision: 2 },
        { name: 'pressure_loss_kpa',label: 'Pressure Loss in Pipe',       unit: 'kPa', precision: 1 },
        { name: 'residual_kpa',     label: 'Residual Pressure at System', unit: 'kPa', precision: 1 },
        { name: 'pressure_ok',      label: 'Residual ≥ 300 kPa',         unit: '',    precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Q_m3s = +inp.q_demand_lpm / (1000*60);
        const STD = [50,65,80,100,125,150,200,250];
        let result = { pipe_dia_mm: 250, flow_velocity_ms: 0, pressure_loss_kpa: 0, residual_kpa: 0, pressure_ok: false };
        for (const D_mm of STD) {
          const D = D_mm/1000;
          const A = Math.PI*D*D/4;
          const V = Q_m3s/A;
          if (V <= 6.0) {
            const Re = V*D/1e-6;
            const e_D = 0.046e-3/D;
            const f = 0.25/Math.pow(Math.log10(e_D/3.7+5.74/Math.pow(Re,0.9)),2);
            const dP = f*(+inp.pipe_length_m/D)*1000*V*V/2/1000;
            const residual = +inp.available_pressure_kpa - dP - 9.81*+inp.height_m;
            result = { pipe_dia_mm: D_mm, flow_velocity_ms: Math.round(V*100)/100, pressure_loss_kpa: Math.round(dP*10)/10, residual_kpa: Math.round(residual*10)/10, pressure_ok: residual >= 300 };
            break;
          }
        }
        return result;
      }
    }
  ]
};

// ── Water Tank Sizing ─────────────────────────────────────────────────────────
export const waterTankSizing: EngineeringPipeline = {
  id: 'water-tank-sizing',
  name: 'Water Storage Tank Sizing',
  description: 'Size a water storage tank for a building: calculate daily demand, fire reserve, and buffer storage requirements.',
  domain: 'hydraulics', difficulty: 'beginner', estimated_time: '6-8 min', icon: '🏺',
  steps: [
    {
      stepNumber: 1, name: 'Daily Demand Assessment',
      description: 'Calculate total daily water consumption for different occupancy categories.',
      standard_ref: 'WHO / BS 6700 / Local authority standards',
      formula_display: [
        'Q_daily = Σ(population_i × consumption_i)',
        'Offices: 45 L/person/day; residential: 150 L/person/day',
        'Hospital: 350 L/bed/day; hotel: 200 L/guest/day',
        'Tank working volume = 1.0–1.5 × Q_daily (1-day reserve)',
      ],
      inputs: [
        { name: 'residential_persons', label: 'Residential Occupants', unit: 'persons', type: 'number', min: 0, max: 10000, default: 0,   required: true, help: '150 L/person/day allowance' },
        { name: 'office_persons',      label: 'Office Workers',        unit: 'persons', type: 'number', min: 0, max: 10000, default: 200,  required: true, help: '45 L/person/day for offices and commercial' },
        { name: 'other_m3_day',        label: 'Other Uses',            unit: 'm³/day',  type: 'number', min: 0, max: 10000, default: 2,    required: true, help: 'Canteen, cooling towers, irrigation etc.' },
        { name: 'autonomy_days',       label: 'Storage Autonomy',      unit: 'days',    type: 'number', min: 0.5, max: 7, default: 1,      required: true, help: 'Days of storage (typically 1 day domestic, 2-3 days for remote sites)' },
      ],
      outputs: [
        { name: 'q_daily_m3', label: 'Daily Demand',          unit: 'm³/day', precision: 1 },
        { name: 'tank_vol_m3',label: 'Domestic Storage Volume',unit: 'm³',    precision: 1 },
      ],
      calculate(inp) {
        const Q = (+inp.residential_persons*150 + +inp.office_persons*45)/1000 + +inp.other_m3_day;
        const V = Q * +inp.autonomy_days;
        return { q_daily_m3: Math.round(Q*10)/10, tank_vol_m3: Math.round(V*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Fire Reserve & Total Volume',
      description: 'Add fire-fighting water reserve if the building requires a fire sprinkler or hydrant system. Fire reserve is kept separate from domestic supply.',
      standard_ref: 'BS 9990 (fire hydrants) / EN 12845 (sprinklers)',
      formula_display: [
        'V_fire = Q_fire × t_operation',
        'Q_fire: fire demand from sprinkler/hydrant calculation',
        't_operation: 60 min (sprinkler OH class), 90–120 min (HH/hydrant)',
        'V_total = V_domestic + V_fire',
      ],
      inputs: [
        { name: 'tank_vol_m3',      label: 'Domestic Storage',    unit: 'm³',    type: 'number', min: 0, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'tank_vol_m3' },
        { name: 'fire_flow_lpm',    label: 'Fire Demand',         unit: 'L/min', type: 'number', min: 0, max: 10000, default: 1800, required: true, help: 'Fire flow requirement: sprinkler OH2 ~2000 L/min; hydrant 1500–3000 L/min per BS 9990' },
        { name: 'fire_duration_min',label: 'Fire Duration',       unit: 'min',   type: 'number', min: 30, max: 180, default: 60,   required: true, help: 'Duration of fire water supply: sprinkler 60 min (OH), 90 min (HH); hydrant 120 min typical' },
        { name: 'include_fire',     label: 'Include Fire Reserve',unit: '',      type: 'select', options: [{value:'yes',label:'Yes — include fire reserve'},{value:'no',label:'No — fire from main supply'}], default: 'yes', required: true, help: 'Whether fire reserve is required in the tank (depends on mains availability)' },
      ],
      outputs: [
        { name: 'fire_vol_m3',  label: 'Fire Reserve Volume', unit: 'm³',  precision: 1 },
        { name: 'total_vol_m3', label: 'Total Tank Volume',   unit: 'm³',  precision: 1 },
        { name: 'tank_size_rec',label: 'Recommended Tank Size (×1.1 margin)', unit: 'm³', precision: 0 },
      ],
      calculate(inp) {
        const Vfire = inp.include_fire === 'yes' ? (+inp.fire_flow_lpm * +inp.fire_duration_min / 1000) : 0;
        const Vtotal = +inp.tank_vol_m3 + Vfire;
        return { fire_vol_m3: Math.round(Vfire*10)/10, total_vol_m3: Math.round(Vtotal*10)/10, tank_size_rec: Math.round(Vtotal*1.1) };
      }
    }
  ]
};

export const HYDRAULICS_PIPELINES: EngineeringPipeline[] = [
  waterPipeSizing,
  stormwaterDrainage,
  openChannelFlow,
  sprinklerHydraulics,
  waterTankSizing,
];
