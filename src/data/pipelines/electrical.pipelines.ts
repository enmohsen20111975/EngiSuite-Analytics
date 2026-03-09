import type { EngineeringPipeline } from '../engineeringPipelines';

// ── Transformer Sizing ────────────────────────────────────────────────────────
export const transformerSizing: EngineeringPipeline = {
  id: 'transformer-sizing',
  name: 'Transformer Sizing',
  description: 'Size a distribution transformer: calculate total connected load with diversity, select standard kVA rating, and verify impedance for protection coordination.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '8-12 min', icon: '🔌',
  steps: [
    {
      stepNumber: 1, name: 'Load Assessment',
      description: 'Sum all connected loads with demand/diversity factors to obtain the maximum diversified demand (MDD). This is the actual peak load the transformer must supply.',
      standard_ref: 'IEC 60076-1 / SANS 780',
      formula_display: [
        'MDD = Σ(P_i × DF_i) / PF_avg',
        'S_demand = MDD / cos φ',
        'Demand Factor (DF): 1.0 lighting, 0.75-0.85 motors, 0.65 HVAC',
      ],
      inputs: [
        { name: 'lighting_kw',   label: 'Lighting Load',     unit: 'kW',   type: 'number', min: 0, max: 5000, default: 50,  required: true,  help: 'Total installed lighting power' },
        { name: 'motor_kw',      label: 'Motor Loads',       unit: 'kW',   type: 'number', min: 0, max: 20000, default: 200, required: true,  help: 'Total motor nameplate power' },
        { name: 'hvac_kw',       label: 'HVAC Load',         unit: 'kW',   type: 'number', min: 0, max: 10000, default: 100, required: true,  help: 'Total HVAC power' },
        { name: 'misc_kw',       label: 'Miscellaneous',     unit: 'kW',   type: 'number', min: 0, max: 5000,  default: 30,  required: true,  help: 'Other loads (sockets, equipment)' },
        { name: 'avg_pf',        label: 'Average Power Factor', unit: '',  type: 'number', min: 0.6, max: 1.0, default: 0.85, required: true, help: 'Weighted average power factor of all loads' },
        { name: 'future_growth', label: 'Future Growth Allowance', unit: '%', type: 'number', min: 0, max: 50, default: 20,  required: true,  help: 'Spare capacity for load growth (typically 20-25%)' },
      ],
      outputs: [
        { name: 'mdd_kw',    label: 'Maximum Diversified Demand', unit: 'kW',  precision: 1 },
        { name: 'mdd_kva',   label: 'Apparent Demand',           unit: 'kVA', precision: 1 },
        { name: 'design_kva',label: 'Design kVA (inc. growth)',  unit: 'kVA', precision: 1 },
      ],
      calculate(inp) {
        const P = 0.9*+inp.lighting_kw + 0.8*+inp.motor_kw + 0.7*+inp.hvac_kw + 0.85*+inp.misc_kw;
        const S = P / +inp.avg_pf;
        const design = S * (1 + +inp.future_growth/100);
        return { mdd_kw: Math.round(P*10)/10, mdd_kva: Math.round(S*10)/10, design_kva: Math.round(design*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Standard Rating Selection',
      description: 'Select the nearest standard transformer kVA rating. Per IEC 60076-1, standard ratings are: 25, 50, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000 kVA.',
      standard_ref: 'IEC 60076-1 Table 1',
      formula_display: [
        'Selected rating ≥ Design kVA',
        'Loading % = Design kVA / Rated kVA × 100',
        'Ideal loading: 70-80% for minimum losses',
        'I_FL = S_rated / (√3 × V_HV)',
      ],
      inputs: [
        { name: 'design_kva',   label: 'Design kVA', unit: 'kVA', type: 'number', min: 1, max: 20000, required: true, help: 'From Step 1', fromPreviousStep: 'design_kva' },
        { name: 'voltage_hv',   label: 'HV Voltage', unit: 'kV',  type: 'number', min: 1, max: 33,    default: 11,    required: true, help: 'Primary (HV) winding voltage' },
        { name: 'voltage_lv',   label: 'LV Voltage', unit: 'V',   type: 'number', min: 100, max: 1000, default: 400,  required: true, help: 'Secondary (LV) winding voltage' },
      ],
      outputs: [
        { name: 'selected_kva',  label: 'Selected Standard Rating', unit: 'kVA', precision: 0 },
        { name: 'loading_pct',   label: 'Loading at Design Demand',  unit: '%',   precision: 1 },
        { name: 'fl_current_lv', label: 'Full-Load LV Current',      unit: 'A',   precision: 1 },
      ],
      calculate(inp) {
        const STD = [25,50,100,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3150,4000,5000];
        const d = +inp.design_kva;
        const sel = STD.find(s => s >= d) ?? 5000;
        const loading = (d/sel)*100;
        const Ilv = (sel*1000)/(Math.sqrt(3)*+inp.voltage_lv);
        return { selected_kva: sel, loading_pct: Math.round(loading*10)/10, fl_current_lv: Math.round(Ilv*10)/10 };
      }
    },
    {
      stepNumber: 3, name: 'Impedance & Fault Level',
      description: 'Calculate the prospective fault current at the LV busbar. The transformer impedance (Z%) limits fault current and determines downstream protection requirements.',
      standard_ref: 'IEC 60909-0 § 4.2',
      formula_display: [
        'I_sc = I_FL / Z_pu   [simplified, ignores source impedance]',
        'Z_pu = Z% / 100',
        'Typical Z%: 4% (< 630 kVA), 5% (630-2500 kVA), 6% (> 2500 kVA)',
        'I_peak = κ × √2 × I_sc   (κ ≈ 1.8 for distribution networks)',
      ],
      inputs: [
        { name: 'selected_kva', label: 'Transformer Rating', unit: 'kVA', type: 'number', min: 1, max: 20000, required: true, help: 'From Step 2', fromPreviousStep: 'selected_kva' },
        { name: 'fl_current_lv',label: 'Full-Load LV Current', unit: 'A', type: 'number', min: 1, max: 50000, required: true, help: 'From Step 2', fromPreviousStep: 'fl_current_lv' },
        { name: 'impedance_pct', label: 'Transformer Impedance (%)', unit: '%', type: 'number', min: 1, max: 10, default: 5, required: true, help: 'Short-circuit impedance from nameplate (typically 4-6%)' },
      ],
      outputs: [
        { name: 'isc_ka',   label: 'Prospective SC Current (rms)', unit: 'kA', precision: 2 },
        { name: 'ipeak_ka', label: 'Peak SC Current',               unit: 'kA', precision: 2 },
      ],
      calculate(inp) {
        const Ifl = +inp.fl_current_lv;
        const Zpu = +inp.impedance_pct/100;
        const Isc = Ifl / Zpu;
        const Ipeak = 1.8 * Math.sqrt(2) * Isc;
        return { isc_ka: Math.round(Isc/1000*100)/100, ipeak_ka: Math.round(Ipeak/1000*100)/100 };
      }
    }
  ]
};

// ── Motor Starting (DOL) ──────────────────────────────────────────────────────
export const motorStartingDol: EngineeringPipeline = {
  id: 'motor-starting-dol',
  name: 'Motor Starting Analysis (DOL)',
  description: 'Analyse direct-on-line (DOL) motor starting: calculate starting current, voltage dip at the busbar, and verify compliance with utility limits.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '⚙️',
  steps: [
    {
      stepNumber: 1, name: 'Motor & System Parameters',
      description: 'Calculate the motor full-load current and DOL starting current. The starting current is typically 6–8× FLC for squirrel-cage induction motors.',
      standard_ref: 'IEC 60034-12 (starting performance)',
      formula_display: [
        'I_FL = P / (√3 × V × η × cos φ)',
        'I_start = k_start × I_FL   (k_start = 6–7 typical)',
        'P_shaft in kW; V line-to-line in V',
      ],
      inputs: [
        { name: 'motor_kw',     label: 'Motor Rated Power',     unit: 'kW',  type: 'number', min: 0.1, max: 10000, default: 75,   required: true, help: 'Motor shaft output power (nameplate)' },
        { name: 'voltage',      label: 'Supply Voltage (L-L)',  unit: 'V',   type: 'number', min: 200, max: 11000, default: 400,  required: true, help: 'Line-to-line supply voltage' },
        { name: 'motor_eta',    label: 'Motor Efficiency',      unit: '',    type: 'number', min: 0.7, max: 0.99,  default: 0.92, required: true, help: 'Full-load efficiency (from motor datasheet)' },
        { name: 'motor_pf',     label: 'Motor Power Factor',    unit: '',    type: 'number', min: 0.6, max: 0.99,  default: 0.85, required: true, help: 'Full-load power factor' },
        { name: 'start_factor', label: 'Starting Current Factor (k)', unit: '', type: 'number', min: 4, max: 10, default: 6.5,  required: true, help: 'Ratio of starting to FLC (6–7 for standard cage motors, lower for soft-starters)' },
      ],
      outputs: [
        { name: 'ifl_a',    label: 'Full-Load Current (I_FL)', unit: 'A', precision: 1 },
        { name: 'istart_a', label: 'Starting Current (I_start)', unit: 'A', precision: 0 },
        { name: 'kva_start',label: 'Starting kVA',              unit: 'kVA', precision: 1 },
      ],
      calculate(inp) {
        const Ifl = (+inp.motor_kw*1000)/(Math.sqrt(3)*+inp.voltage*+inp.motor_eta*+inp.motor_pf);
        const Istart = +inp.start_factor * Ifl;
        const kva = Math.sqrt(3)*+inp.voltage*Istart/1000;
        return { ifl_a: Math.round(Ifl*10)/10, istart_a: Math.round(Istart), kva_start: Math.round(kva*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Voltage Dip Calculation',
      description: 'Calculate the busbar voltage dip caused by the high motor starting current flowing through the supply impedance. Utilities typically allow ≤ 3% dip for frequent starting, ≤ 6% for occasional.',
      standard_ref: 'IEC 60909-0 / EN 50160',
      formula_display: [
        'ΔV% = (Z_source × I_start) / V_rated × 100',
        'Z_source = V² / S_sc   (source impedance from fault level)',
        'S_sc: short-circuit capacity of the busbar (MVA)',
        'ΔV% ≤ 3%: frequent starts; ≤ 6%: infrequent',
      ],
      inputs: [
        { name: 'istart_a',  label: 'Starting Current',       unit: 'A',   type: 'number', min: 1, max: 100000, required: true, help: 'From Step 1', fromPreviousStep: 'istart_a' },
        { name: 'voltage',   label: 'System Voltage (L-L)',   unit: 'V',   type: 'number', min: 200, max: 11000, default: 400,  required: true, help: 'System voltage' },
        { name: 'ssc_mva',   label: 'Busbar Fault Level',     unit: 'MVA', type: 'number', min: 0.5, max: 500,  default: 10,   required: true, help: 'Short-circuit MVA at the point of supply (from network study or utility data)' },
      ],
      outputs: [
        { name: 'z_source_ohm', label: 'Source Impedance',     unit: 'Ω',  precision: 4 },
        { name: 'vdip_pct',     label: 'Voltage Dip',           unit: '%',  precision: 2 },
        { name: 'dip_ok',       label: 'Dip ≤ 6% (acceptable)', unit: '',   precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const V = +inp.voltage;
        const Ssc = +inp.ssc_mva * 1e6;
        const Z = (V*V) / Ssc;
        const Istart = +inp.istart_a;
        const dip = (Z * Istart / (V/Math.sqrt(3))) * 100;
        return { z_source_ohm: Math.round(Z*10000)/10000, vdip_pct: Math.round(dip*100)/100, dip_ok: dip <= 6 };
      }
    }
  ]
};

// ── Generator Sizing ──────────────────────────────────────────────────────────
export const generatorSizing: EngineeringPipeline = {
  id: 'generator-sizing',
  name: 'Emergency Generator Sizing',
  description: 'Size a standby diesel generator: determine essential loads, apply derating for site conditions, select standard rating, and estimate fuel consumption.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🔆',
  steps: [
    {
      stepNumber: 1, name: 'Essential Load Survey',
      description: 'Identify and total all loads that must be supplied during a power outage. Apply demand factors and starting kVA for motor loads (motor starting is the dominant sizing criterion for generators).',
      standard_ref: 'ISO 8528-1 / NFPA 110',
      formula_display: [
        'P_essential = Σ(P_i × DF_i)',
        'S_motor_start = largest motor kVA × k_start (most onerous start)',
        'S_gen_min = S_running + S_motor_start (step-load criterion)',
        'Running kVA = P_essential / PF_avg',
      ],
      inputs: [
        { name: 'lighting_kw',  label: 'Emergency Lighting',    unit: 'kW',  type: 'number', min: 0, max: 1000, default: 20,  required: true, help: 'Emergency and exit lighting' },
        { name: 'hvac_kw',      label: 'Critical HVAC',         unit: 'kW',  type: 'number', min: 0, max: 5000, default: 80,  required: true, help: 'Server room cooling, stairwell pressurisation, etc.' },
        { name: 'it_kw',        label: 'IT & UPS Loads',        unit: 'kW',  type: 'number', min: 0, max: 5000, default: 50,  required: true, help: 'Data centre, communications, security' },
        { name: 'largest_motor_kw', label: 'Largest Motor (kW)', unit: 'kW', type: 'number', min: 0, max: 2000, default: 30,  required: true, help: 'Largest single motor that starts under generator (fire pump, chiller, etc.)' },
        { name: 'pf_avg',       label: 'Average Power Factor',  unit: '',    type: 'number', min: 0.6, max: 1.0, default: 0.85, required: true, help: 'Average PF of all essential loads' },
      ],
      outputs: [
        { name: 'p_running_kw',  label: 'Running Load',               unit: 'kW',  precision: 1 },
        { name: 's_running_kva', label: 'Running Apparent Load',       unit: 'kVA', precision: 1 },
        { name: 's_step_kva',    label: 'Step-Load (start + running)', unit: 'kVA', precision: 1 },
      ],
      calculate(inp) {
        const P = +inp.lighting_kw + 0.8*+inp.hvac_kw + +inp.it_kw;
        const Srun = P / +inp.pf_avg;
        const Sstart = (+inp.largest_motor_kw / 0.85) * 6.5;  // motor kVA at starting
        return { p_running_kw: Math.round(P*10)/10, s_running_kva: Math.round(Srun*10)/10, s_step_kva: Math.round((Srun+Sstart)*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Derating & Rating Selection',
      description: 'Derate the generator for altitude and ambient temperature. Select the next standard prime or standby rating above the derated requirement.',
      standard_ref: 'ISO 8528-1 § 13 (derating factors)',
      formula_display: [
        'P_derated = P_rated × k_altitude × k_temp',
        'k_altitude: −1% per 100 m above 1000 m (standard engines)',
        'k_temp: −1% per 5°C above 25°C',
        'Standard ratings: 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500 kVA ...',
      ],
      inputs: [
        { name: 's_step_kva', label: 'Step-Load Requirement', unit: 'kVA', type: 'number', min: 1, max: 20000, required: true, help: 'From Step 1', fromPreviousStep: 's_step_kva' },
        { name: 'altitude_m', label: 'Site Altitude',          unit: 'm',  type: 'number', min: 0, max: 5000, default: 100,  required: true, help: 'Altitude above sea level' },
        { name: 'ambient_c',  label: 'Max Ambient Temperature',unit: '°C', type: 'number', min: 0, max: 55,   default: 40,   required: true, help: 'Maximum ambient temperature at generator location' },
      ],
      outputs: [
        { name: 'derating_factor',   label: 'Combined Derating Factor',    unit: '',    precision: 3 },
        { name: 'required_rated_kva',label: 'Required Nameplate Rating',   unit: 'kVA', precision: 0 },
        { name: 'selected_kva',      label: 'Selected Generator Rating',   unit: 'kVA', precision: 0 },
      ],
      calculate(inp) {
        const alt = Math.max(0, +inp.altitude_m - 1000);
        const kAlt = Math.max(0.7, 1 - (alt/100)*0.01);
        const kTemp = Math.max(0.7, 1 - (Math.max(0, +inp.ambient_c - 25)/5)*0.01);
        const kTotal = kAlt * kTemp;
        const reqRated = +inp.s_step_kva / kTotal;
        const STD = [20,30,50,75,100,125,150,200,250,300,400,500,630,800,1000,1250,1500,2000,2500];
        const sel = STD.find(s => s >= reqRated) ?? 2500;
        return { derating_factor: Math.round(kTotal*1000)/1000, required_rated_kva: Math.round(reqRated), selected_kva: sel };
      }
    },
    {
      stepNumber: 3, name: 'Fuel Consumption',
      description: 'Estimate diesel fuel consumption at rated load and calculate required tank volume for the required autonomy period.',
      standard_ref: 'ISO 8528-1 § 11 / NFPA 110 (8 h minimum)',
      formula_display: [
        'Fuel rate ≈ 0.20 L/kWh × P_kW  (at 75% load, typical diesel)',
        'Fuel rate at full load ≈ 0.28 L/kWh',
        'Tank volume = Fuel rate × Hours autonomy × 1.05 (5% reserve)',
      ],
      inputs: [
        { name: 'selected_kva',label: 'Generator Rating', unit: 'kVA', type: 'number', min: 1, max: 20000, required: true, help: 'From Step 2', fromPreviousStep: 'selected_kva' },
        { name: 'load_pct',    label: 'Expected Load %',  unit: '%',   type: 'number', min: 30, max: 100,  default: 75,   required: true, help: 'Anticipated running load as % of rated' },
        { name: 'autonomy_h',  label: 'Required Autonomy',unit: 'h',   type: 'number', min: 1, max: 72,   default: 24,   required: true, help: 'Hours of continuous operation required (NFPA 110 minimum is 8 h for Level 1)' },
      ],
      outputs: [
        { name: 'kw_output',     label: 'Running Power Output',    unit: 'kW',  precision: 0 },
        { name: 'fuel_rate_lph', label: 'Fuel Consumption Rate',   unit: 'L/h', precision: 1 },
        { name: 'tank_volume_l', label: 'Required Tank Volume',    unit: 'L',   precision: 0 },
      ],
      calculate(inp) {
        const kW = +inp.selected_kva * 0.8 * (+inp.load_pct/100);
        const specificFuel = 0.20 + 0.08*(+inp.load_pct/100);  // L/kWh (varies with load)
        const lph = kW * specificFuel;
        const tank = lph * +inp.autonomy_h * 1.05;
        return { kw_output: Math.round(kW), fuel_rate_lph: Math.round(lph*10)/10, tank_volume_l: Math.round(tank) };
      }
    }
  ]
};

// ── UPS Battery Sizing ────────────────────────────────────────────────────────
export const upsBatterySizing: EngineeringPipeline = {
  id: 'ups-battery-sizing',
  name: 'UPS & Battery Backup Sizing',
  description: 'Size an uninterruptible power supply (UPS) and its battery bank: calculate critical load, select UPS rating, determine battery capacity for required autonomy.',
  domain: 'electrical', difficulty: 'beginner', estimated_time: '6-8 min', icon: '🔋',
  steps: [
    {
      stepNumber: 1, name: 'Critical Load Assessment',
      description: 'Total the critical loads that require UPS protection. Apply a 25% overhead for start-up surges and future growth.',
      standard_ref: 'IEC 62040-3 / IEEE 1184',
      formula_display: ['S_ups = P_critical / PF_load', 'S_design = S_ups × 1.25  (25% overhead)'],
      inputs: [
        { name: 'it_kw',       label: 'IT / Server Load',      unit: 'kW', type: 'number', min: 0, max: 5000, default: 30, required: true, help: 'Servers, networking, storage' },
        { name: 'telecoms_kw', label: 'Telecoms / Security',   unit: 'kW', type: 'number', min: 0, max: 500,  default: 5,  required: true, help: 'Comms, CCTV, fire alarm panels' },
        { name: 'other_kw',    label: 'Other Critical Loads',  unit: 'kW', type: 'number', min: 0, max: 2000, default: 5,  required: true, help: 'Any other loads requiring UPS' },
        { name: 'load_pf',     label: 'Load Power Factor',     unit: '',   type: 'number', min: 0.6, max: 1.0, default: 0.9, required: true, help: 'PF of critical loads (IT loads typically 0.9)' },
      ],
      outputs: [
        { name: 'critical_kw',  label: 'Total Critical Load',    unit: 'kW',  precision: 1 },
        { name: 'ups_kva_min',  label: 'Minimum UPS Rating',     unit: 'kVA', precision: 1 },
        { name: 'ups_kva_design',label: 'Design UPS Rating (+25%)',unit: 'kVA',precision: 1 },
      ],
      calculate(inp) {
        const P = +inp.it_kw + +inp.telecoms_kw + +inp.other_kw;
        const S = P / +inp.load_pf;
        return { critical_kw: Math.round(P*10)/10, ups_kva_min: Math.round(S*10)/10, ups_kva_design: Math.round(S*1.25*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Battery Capacity',
      description: 'Calculate the ampere-hour (Ah) battery capacity needed for the required autonomy. Battery capacity is derated for temperature and aging (end-of-life factor).',
      standard_ref: 'IEEE 485 (battery sizing for stationary applications)',
      formula_display: [
        'P_battery = P_critical / (η_inverter × η_battery)',
        'C_ah = P_battery × t_autonomy / (V_DC × η_discharge × k_temp × k_age)',
        'k_temp: 1.0 at 25°C, 1.25 at 10°C, 1.11 at 15°C',
        'k_age: 1.25 (end-of-life, 80% capacity)',
      ],
      inputs: [
        { name: 'critical_kw',  label: 'Critical Load',       unit: 'kW', type: 'number', min: 0.1, max: 5000, required: true, help: 'From Step 1', fromPreviousStep: 'critical_kw' },
        { name: 'autonomy_min', label: 'Required Autonomy',   unit: 'min', type: 'number', min: 5, max: 480, default: 30, required: true, help: 'Minutes of battery backup required (10-30 min typical; 60-120 min for extended)' },
        { name: 'vdc',          label: 'Battery DC Voltage',  unit: 'V',   type: 'number', min: 12, max: 480, default: 240, required: true, help: 'UPS DC bus voltage (typical: 48V small, 120V medium, 240V large)' },
        { name: 'ambient_c',    label: 'Battery Room Temp',   unit: '°C',  type: 'number', min: 0, max: 40, default: 25, required: true, help: 'Ambient temperature at battery location (25°C is rated condition)' },
      ],
      outputs: [
        { name: 'bat_power_kw', label: 'Battery Discharge Power', unit: 'kW', precision: 2 },
        { name: 'capacity_ah',  label: 'Required Battery Capacity', unit: 'Ah', precision: 0 },
        { name: 'capacity_kwh', label: 'Energy Storage Required',  unit: 'kWh', precision: 2 },
      ],
      calculate(inp) {
        const P = +inp.critical_kw;
        const t_h = +inp.autonomy_min / 60;
        const Pbat = P / (0.95 * 0.95);  // inverter & battery efficiency
        const kTemp = +inp.ambient_c < 15 ? 1.25 : +inp.ambient_c < 20 ? 1.11 : +inp.ambient_c < 25 ? 1.04 : 1.0;
        const kAge = 1.25;
        const Cah = (Pbat * 1000 * t_h) / (+inp.vdc * 0.95 * (1/kTemp) * (1/kAge));
        const kWh = Pbat * t_h;
        return { bat_power_kw: Math.round(Pbat*100)/100, capacity_ah: Math.round(Cah), capacity_kwh: Math.round(kWh*100)/100 };
      }
    }
  ]
};

// ── Busbar Sizing ─────────────────────────────────────────────────────────────
export const busbarSizing: EngineeringPipeline = {
  id: 'busbar-sizing',
  name: 'Busbar Sizing',
  description: 'Size copper or aluminium busbars for current rating and short-circuit withstand. Verify temperature rise under continuous current and minimum cross-section for fault duty.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '⚡',
  steps: [
    {
      stepNumber: 1, name: 'Continuous Current Rating',
      description: 'Calculate the busbar cross-section required to carry the design current without exceeding the allowable temperature rise (35°C above 35°C ambient = 70°C max for PVC-insulated, 105°C for bare copper).',
      standard_ref: 'IEC 60439-1 / BS EN 61439-1',
      formula_display: [
        'I_z = k × A^0.5 × (ΔT)^0.61   [approximate, single flat bar]',
        'k = 1.83 (copper) or 1.31 (aluminium)',
        'A = cross-section (mm²), ΔT = temp rise (°C)',
        'Required A: solve for A = (I_z / (k × ΔT^0.61))²',
      ],
      inputs: [
        { name: 'design_current_a', label: 'Design Current', unit: 'A', type: 'number', min: 1, max: 20000, default: 1000, required: true, help: 'Maximum continuous current the busbar must carry' },
        { name: 'material', label: 'Material', unit: '', type: 'select', options: [{value:'copper',label:'Copper'},{value:'aluminium',label:'Aluminium'}], default: 'copper', required: true, help: 'Copper: higher conductivity; aluminium: lighter, cheaper' },
        { name: 'temp_rise', label: 'Allowable Temp Rise', unit: '°C', type: 'number', min: 20, max: 60, default: 35, required: true, help: 'Temperature rise above ambient (35°C for insulated, 50°C for bare in enclosed panel)' },
      ],
      outputs: [
        { name: 'min_area_mm2',   label: 'Minimum Cross-Section', unit: 'mm²', precision: 0 },
        { name: 'rated_current_a',label: 'Rated Current (selected)', unit: 'A', precision: 0 },
      ],
      calculate(inp) {
        const I = +inp.design_current_a;
        const k = inp.material === 'copper' ? 1.83 : 1.31;
        const dT = +inp.temp_rise;
        const A = Math.pow(I / (k * Math.pow(dT, 0.61)), 2);
        // Round up to standard busbar sizes
        const STD_A = [25,35,50,60,80,100,120,150,200,250,300,400,500,600,800,1000,1200];
        const selA = STD_A.find(s => s >= A) ?? 1200;
        const Irated = Math.round(k * Math.sqrt(selA) * Math.pow(dT, 0.61));
        return { min_area_mm2: Math.round(A), rated_current_a: Irated };
      }
    },
    {
      stepNumber: 2, name: 'Short-Circuit Withstand',
      description: 'Verify the selected busbar can withstand the prospective short-circuit current for the protection clearing time (adiabatic equation, same principle as cable sizing).',
      standard_ref: 'IEC 60865-1 § 4 (short-circuit thermal effects)',
      formula_display: [
        'A_min = (I_sc × √t) / k_sc',
        'k_sc = 141 (copper, initial 70°C → final 300°C)',
        'k_sc = 95 (aluminium, initial 70°C → final 200°C)',
        'Selected area must satisfy both continuous AND SC criteria',
      ],
      inputs: [
        { name: 'min_area_mm2',  label: 'Selected Cross-Section',  unit: 'mm²', type: 'number', min: 1, max: 2000, required: true, help: 'From Step 1', fromPreviousStep: 'min_area_mm2' },
        { name: 'material',      label: 'Material',                unit: '',    type: 'select', options: [{value:'copper',label:'Copper'},{value:'aluminium',label:'Aluminium'}], default: 'copper', required: true, help: 'Same as Step 1' },
        { name: 'isc_ka',        label: 'Fault Level at Busbar',   unit: 'kA',  type: 'number', min: 0.1, max: 100, default: 25,  required: true, help: 'Prospective short-circuit current (from transformer fault study)' },
        { name: 'clearing_time_s',label: 'Protection Clearing Time',unit: 's',  type: 'number', min: 0.02, max: 2, default: 0.2,  required: true, help: 'Time for protection to clear the fault (use 0.2 s for main incomer CB)' },
      ],
      outputs: [
        { name: 'sc_min_area_mm2', label: 'Min Area for SC Withstand', unit: 'mm²', precision: 1 },
        { name: 'sc_compliant',    label: 'SC Withstand OK',            unit: '',    precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Isc = +inp.isc_ka * 1000;
        const t = +inp.clearing_time_s;
        const k = inp.material === 'copper' ? 141 : 95;
        const Amin = (Isc * Math.sqrt(t)) / k;
        return { sc_min_area_mm2: Math.round(Amin*10)/10, sc_compliant: +inp.min_area_mm2 >= Amin };
      }
    }
  ]
};

// ── Earthing / Grounding System ───────────────────────────────────────────────
export const earthingSystem: EngineeringPipeline = {
  id: 'earthing-system',
  name: 'Earthing System Design',
  description: 'Design a protective earthing system: calculate earth electrode resistance, verify touch voltage limits, and size the earthing conductor.',
  domain: 'electrical', difficulty: 'advanced', estimated_time: '12-15 min', icon: '🌍',
  steps: [
    {
      stepNumber: 1, name: 'Earth Electrode Resistance',
      description: 'Calculate the resistance of a vertical earth electrode (rod) or horizontal electrode grid using the Dwight formula. The resistance depends on soil resistivity.',
      standard_ref: 'IEC 60364-5-54 / IEEE 80',
      formula_display: [
        'R_rod = ρ/(2πL) × [ln(4L/d) − 1]   [Dwight formula, vertical rod]',
        'R_grid = ρ/4r + ρ/L_total   [horizontal grid]',
        'ρ: soil resistivity (Ω·m); L: rod length (m); d: rod diameter (m)',
        'r = √(A/π): equivalent grid radius',
      ],
      inputs: [
        { name: 'soil_resistivity', label: 'Soil Resistivity (ρ)', unit: 'Ω·m', type: 'number', min: 1, max: 10000, default: 100, required: true, help: 'Measured soil resistivity (clay: 20-100, loam: 50-500, rock: 1000-10000 Ω·m)' },
        { name: 'rod_length_m',    label: 'Earth Rod Length',      unit: 'm',   type: 'number', min: 0.5, max: 10, default: 3,  required: true, help: 'Standard copper-clad steel rods: 1.2 m, 2.4 m, 3.0 m' },
        { name: 'rod_diameter_mm', label: 'Rod Diameter',          unit: 'mm',  type: 'number', min: 10, max: 50,  default: 14,  required: true, help: 'Standard diameter: 14 mm (copper-clad), 20 mm (solid copper)' },
        { name: 'num_rods',        label: 'Number of Rods',        unit: '',    type: 'number', min: 1, max: 50,   default: 2,   required: true, help: 'Multiple rods in parallel reduce overall resistance. Spacing ≥ 2× rod length.' },
      ],
      outputs: [
        { name: 'r_single_rod',  label: 'Single Rod Resistance',      unit: 'Ω', precision: 2 },
        { name: 'r_system_ohm',  label: 'Parallel System Resistance',  unit: 'Ω', precision: 2 },
        { name: 'meets_10ohm',   label: 'Resistance ≤ 10 Ω (general)', unit: '',  precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const rho = +inp.soil_resistivity;
        const L = +inp.rod_length_m;
        const d = +inp.rod_diameter_mm / 1000;
        const n = +inp.num_rods;
        const R1 = (rho / (2 * Math.PI * L)) * (Math.log(4*L/d) - 1);
        // Parallel with 20% increase for mutual resistance interaction
        const Rpar = (R1 / n) * 1.2;
        return { r_single_rod: Math.round(R1*100)/100, r_system_ohm: Math.round(Rpar*100)/100, meets_10ohm: Rpar <= 10 };
      }
    },
    {
      stepNumber: 2, name: 'Touch Voltage Check',
      description: 'Verify the prospective touch voltage does not exceed the safe limit. Touch voltage is the voltage a person can contact between hand and feet during a ground fault.',
      standard_ref: 'IEC 60364-4-41 § 411 / IEC 60479-1',
      formula_display: [
        'V_touch = I_fault × R_earth × 0.5   (simplified, 50% factor)',
        'I_fault = V_phase / (R_earth + Z_source)',
        'V_touch_limit = 50 V (AC, IEC 60364) or 25 V (special locations)',
        'Disconnection time ≤ 0.4 s (IEC 60364 for ≤ 32A circuits)',
      ],
      inputs: [
        { name: 'r_system_ohm', label: 'Earth System Resistance', unit: 'Ω',  type: 'number', min: 0.1, max: 200, required: true, help: 'From Step 1', fromPreviousStep: 'r_system_ohm' },
        { name: 'voltage_phase',label: 'Phase-to-Earth Voltage',  unit: 'V',  type: 'number', min: 100, max: 6600, default: 230, required: true, help: 'Phase-to-earth voltage (230 V for 400/230 V system)' },
        { name: 'z_source_ohm', label: 'Source Impedance',        unit: 'Ω',  type: 'number', min: 0.01, max: 5, default: 0.5, required: true, help: 'Source/supply impedance (transformer + cable impedance at fault point)' },
      ],
      outputs: [
        { name: 'i_fault_a',     label: 'Fault Current',        unit: 'A',  precision: 1 },
        { name: 'v_touch_v',     label: 'Touch Voltage',        unit: 'V',  precision: 1 },
        { name: 'touch_safe',    label: 'Touch Voltage ≤ 50V',  unit: '',   precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Re = +inp.r_system_ohm;
        const Vph = +inp.voltage_phase;
        const Zs = +inp.z_source_ohm;
        const If = Vph / (Re + Zs);
        const Vt = If * Re * 0.5;
        return { i_fault_a: Math.round(If*10)/10, v_touch_v: Math.round(Vt*10)/10, touch_safe: Vt <= 50 };
      }
    },
    {
      stepNumber: 3, name: 'Earthing Conductor Sizing',
      description: 'Size the main earthing conductor (MEC) and protective earth (PE) conductors using the adiabatic equation, same as cable short-circuit sizing.',
      standard_ref: 'IEC 60364-5-54 Table 54.1',
      formula_display: [
        'S_min = (I_fault × √t) / k',
        'k = 143 (copper, initial 30°C, final 300°C for buried earth conductors)',
        'Minimum: 6 mm² Cu or 16 mm² Al for buried; 2.5 mm² protected Cu surface',
        'PE conductor: if phase ≤ 16 mm² → PE = phase; > 35 mm² → PE = S/2',
      ],
      inputs: [
        { name: 'i_fault_a',      label: 'Fault Current',          unit: 'A', type: 'number', min: 1, max: 100000, required: true, help: 'From Step 2', fromPreviousStep: 'i_fault_a' },
        { name: 'clearing_time_s',label: 'Protection Clearing Time',unit: 's', type: 'number', min: 0.02, max: 5, default: 0.4,  required: true, help: 'Time to disconnect the fault' },
      ],
      outputs: [
        { name: 'min_conductor_mm2', label: 'Minimum Conductor Size', unit: 'mm²', precision: 1 },
        { name: 'selected_mm2',      label: 'Recommended Size',        unit: 'mm²', precision: 0 },
      ],
      calculate(inp) {
        const If = +inp.i_fault_a;
        const t = +inp.clearing_time_s;
        const k = 143;
        const Smin = (If * Math.sqrt(t)) / k;
        const STD = [6,10,16,25,35,50,70,95,120,150,185,240];
        const sel = STD.find(s => s >= Math.max(Smin, 6)) ?? 240;
        return { min_conductor_mm2: Math.round(Smin*10)/10, selected_mm2: sel };
      }
    }
  ]
};

// ── Lighting Design (Lumen Method) ────────────────────────────────────────────
export const lightingDesign: EngineeringPipeline = {
  id: 'lighting-design',
  name: 'Lighting Design (Lumen Method)',
  description: 'Design an interior lighting installation: calculate the number of luminaires required to achieve the target illuminance, check uniformity, and calculate power density.',
  domain: 'electrical', difficulty: 'beginner', estimated_time: '6-8 min', icon: '💡',
  steps: [
    {
      stepNumber: 1, name: 'Required Luminous Flux',
      description: 'Calculate the total luminous flux needed using the Lumen Method. The utilisation factor (UF) accounts for room geometry; the maintenance factor (MF) accounts for dirt and lamp depreciation.',
      standard_ref: 'EN 12464-1 (lighting for workplaces)',
      formula_display: [
        'N × F_lamp = (E × A) / (UF × MF)',
        'E: design illuminance (lux); A: area (m²)',
        'UF: utilisation factor (0.4–0.7 typical)',
        'MF: maintenance factor (0.7–0.85 typical)',
      ],
      inputs: [
        { name: 'room_length_m', label: 'Room Length',    unit: 'm',  type: 'number', min: 1, max: 500, default: 10, required: true, help: 'Room length' },
        { name: 'room_width_m',  label: 'Room Width',     unit: 'm',  type: 'number', min: 1, max: 500, default: 8,  required: true, help: 'Room width' },
        { name: 'target_lux',    label: 'Target Illuminance (E)', unit: 'lux', type: 'number', min: 50, max: 2000, default: 500, required: true, help: 'Office work: 500 lux; Corridors: 100 lux; Drawing office: 750 lux; Storage: 100-200 lux (EN 12464-1)' },
        { name: 'uf',            label: 'Utilisation Factor (UF)', unit: '', type: 'number', min: 0.2, max: 0.9, default: 0.55, required: true, help: 'From luminaire photometric data and room index. Use 0.55 for average room with ceiling-mounted direct luminaires.' },
        { name: 'mf',            label: 'Maintenance Factor (MF)', unit: '', type: 'number', min: 0.5, max: 0.9, default: 0.75, required: true, help: 'Product of lamp lumen maintenance factor (LLMF), luminaire maintenance factor (LMF), room surface maintenance factor (RSMF). Typical 0.75 for good.' },
      ],
      outputs: [
        { name: 'area_m2',        label: 'Room Area',            unit: 'm²',   precision: 1 },
        { name: 'total_flux_klm', label: 'Required Total Flux',  unit: 'klm',  precision: 1 },
      ],
      calculate(inp) {
        const A = +inp.room_length_m * +inp.room_width_m;
        const Ftotal = (+inp.target_lux * A) / (+inp.uf * +inp.mf);
        return { area_m2: Math.round(A*10)/10, total_flux_klm: Math.round(Ftotal/1000*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Luminaire Count & Power',
      description: 'Determine the number of luminaires required and calculate the installed lighting power density (LPD). EN 12464-1 recommends LPD targets for energy efficiency.',
      standard_ref: 'EN 12464-1 + EN 15193 (energy performance)',
      formula_display: [
        'N = Total flux required / Flux per luminaire',
        'N_layout = round up N to fit grid spacing',
        'LPD = N × P_luminaire / Area  (W/m²)',
        'LPD target: ≤ 10 W/m² offices (EN 15193); ≤ 12 W/m² commercial',
      ],
      inputs: [
        { name: 'total_flux_klm',   label: 'Required Total Flux', unit: 'klm', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'total_flux_klm' },
        { name: 'area_m2',          label: 'Room Area',           unit: 'm²',  type: 'number', min: 1, max: 100000, required: true, help: 'From Step 1', fromPreviousStep: 'area_m2' },
        { name: 'lamp_flux_lm',     label: 'Luminaire Flux Output', unit: 'lm', type: 'number', min: 100, max: 50000, default: 5200, required: true, help: 'Luminous flux per luminaire (from photometric data). LED panel 600×600: ~3500–5500 lm; LED troffer: 5000–8000 lm' },
        { name: 'luminaire_watt',   label: 'Luminaire Power',     unit: 'W',   type: 'number', min: 5,  max: 500,   default: 40,   required: true, help: 'Input wattage per luminaire including driver/ballast losses' },
      ],
      outputs: [
        { name: 'num_luminaires', label: 'Number of Luminaires',    unit: '',      precision: 0 },
        { name: 'total_watts',    label: 'Total Installed Power',    unit: 'W',     precision: 0 },
        { name: 'lpd_w_m2',      label: 'Lighting Power Density',   unit: 'W/m²',  precision: 2 },
        { name: 'lpd_ok',        label: 'LPD ≤ 12 W/m² (EN 15193)', unit: '',      precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const Ftotal_lm = +inp.total_flux_klm * 1000;
        const N = Math.ceil(Ftotal_lm / +inp.lamp_flux_lm);
        const totalW = N * +inp.luminaire_watt;
        const lpd = totalW / +inp.area_m2;
        return { num_luminaires: N, total_watts: totalW, lpd_w_m2: Math.round(lpd*100)/100, lpd_ok: lpd <= 12 };
      }
    }
  ]
};

// ── Solar PV System Sizing ────────────────────────────────────────────────────
export const solarPvSizing: EngineeringPipeline = {
  id: 'solar-pv-sizing',
  name: 'Solar PV System Sizing',
  description: 'Size a grid-tied or off-grid solar PV system: calculate energy requirement, size the array, inverter, and (for off-grid) battery storage.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '☀️',
  steps: [
    {
      stepNumber: 1, name: 'Energy Requirement',
      description: 'Calculate the daily and annual energy demand, accounting for system losses to determine the required PV array energy production.',
      standard_ref: 'IEC 62548 / AS/NZS 4777',
      formula_display: [
        'E_daily = Σ(P_appliance × hours/day)',
        'E_array_required = E_daily / η_system',
        'η_system = η_inverter × η_cables × η_soiling ≈ 0.75–0.82',
      ],
      inputs: [
        { name: 'daily_kwh',   label: 'Daily Energy Consumption', unit: 'kWh/day', type: 'number', min: 0.1, max: 5000, default: 30,   required: true, help: 'Total daily energy usage (from electricity bill or load schedule)' },
        { name: 'system_loss', label: 'System Loss Factor',       unit: '%',       type: 'number', min: 5,  max: 40,   default: 20,   required: true, help: 'Total system losses: inverter (4%), cables (2%), soiling (3%), mismatch (2%), temperature (5%). Typical 20%.' },
      ],
      outputs: [
        { name: 'required_array_kwh', label: 'Required Array Output',  unit: 'kWh/day', precision: 2 },
        { name: 'annual_kwh',         label: 'Annual Energy Consumption', unit: 'kWh/yr', precision: 0 },
      ],
      calculate(inp) {
        const E = +inp.daily_kwh;
        const loss = +inp.system_loss/100;
        const Earr = E / (1 - loss);
        return { required_array_kwh: Math.round(Earr*100)/100, annual_kwh: Math.round(E*365) };
      }
    },
    {
      stepNumber: 2, name: 'PV Array Sizing',
      description: 'Calculate the required PV array peak power (kWp) using the peak sun hours (PSH) for the site. PSH is the equivalent daily hours of 1000 W/m² irradiance.',
      standard_ref: 'IEC 61215 (PV module performance)',
      formula_display: [
        'P_array (kWp) = E_array_required / PSH',
        'N_panels = P_array / P_panel_wp × 1000',
        'PSH (peak sun hours): tropical 5–6 h, Mediterranean 4–5 h, Northern Europe 2.5–3.5 h',
      ],
      inputs: [
        { name: 'required_array_kwh', label: 'Required Array Output', unit: 'kWh/day', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'required_array_kwh' },
        { name: 'psh',                label: 'Peak Sun Hours',        unit: 'h/day',   type: 'number', min: 1, max: 8, default: 4.5, required: true, help: 'Average daily peak sun hours for site location (from solar atlas or PVGIS)' },
        { name: 'panel_wp',           label: 'Panel Rated Power',     unit: 'Wp',      type: 'number', min: 50, max: 1000, default: 400, required: true, help: 'STC-rated power per panel (Wp). Typical monocrystalline: 350–550 Wp' },
      ],
      outputs: [
        { name: 'array_kwp',   label: 'Required Array Size', unit: 'kWp',    precision: 2 },
        { name: 'num_panels',  label: 'Number of Panels',    unit: 'panels', precision: 0 },
        { name: 'roof_area_m2',label: 'Approx. Roof Area Required', unit: 'm²', precision: 0 },
      ],
      calculate(inp) {
        const E = +inp.required_array_kwh;
        const psh = +inp.psh;
        const Pwp = +inp.panel_wp;
        const kWp = E / psh;
        const N = Math.ceil(kWp * 1000 / Pwp);
        const area = N * 2.0;  // ~2 m² per panel (standard 1.7 m × 1.1 m)
        return { array_kwp: Math.round(kWp*100)/100, num_panels: N, roof_area_m2: Math.round(area) };
      }
    },
    {
      stepNumber: 3, name: 'Inverter & String Sizing',
      description: 'Select the inverter and determine string configuration. Inverter rated AC power is typically 80-90% of array DC power (DC/AC ratio 1.1-1.25 for optimal yield).',
      standard_ref: 'IEC 62109-1 (inverter safety) / AS/NZS 4777.2',
      formula_display: [
        'P_inverter = P_array / DC_AC_ratio',
        'DC/AC ratio = 1.1–1.25 (string inverter), 1.0–1.1 (central inverter)',
        'Strings in parallel = N_panels / panels_per_string',
        'V_string = V_oc_panel × panels_per_string ≤ V_max_inverter',
      ],
      inputs: [
        { name: 'array_kwp',     label: 'Array Size',         unit: 'kWp', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 2', fromPreviousStep: 'array_kwp' },
        { name: 'dc_ac_ratio',   label: 'DC/AC Ratio',        unit: '',    type: 'number', min: 0.9, max: 1.5, default: 1.15, required: true, help: 'Ratio of DC array power to AC inverter power. 1.1–1.25 typical for string inverters.' },
        { name: 'panel_voc',     label: 'Panel Open-Circuit Voltage (Voc)', unit: 'V', type: 'number', min: 10, max: 60, default: 40, required: true, help: 'Voc per panel at STC from datasheet. Typical monocrystalline: 38–46 V' },
        { name: 'max_string_v',  label: 'Max Inverter String Voltage', unit: 'V', type: 'number', min: 200, max: 1500, default: 1000, required: true, help: 'Maximum DC input voltage of inverter. Residential: 600 V; commercial: 1000 V; utility: 1500 V' },
      ],
      outputs: [
        { name: 'inverter_kva',      label: 'Inverter AC Rating',       unit: 'kW',     precision: 2 },
        { name: 'panels_per_string', label: 'Max Panels per String',    unit: 'panels', precision: 0 },
        { name: 'annual_yield_mwh',  label: 'Estimated Annual Yield',   unit: 'MWh/yr', precision: 2 },
      ],
      calculate(inp) {
        const kWp = +inp.array_kwp;
        const ratio = +inp.dc_ac_ratio;
        const Voc = +inp.panel_voc;
        const Vmax = +inp.max_string_v;
        const invKw = kWp / ratio;
        const panelsPerString = Math.floor(Vmax / (Voc * 1.08)); // 1.08: cold temp correction
        const annualYield = kWp * +inp.dc_ac_ratio * 1800 / 1000; // rough: 1800 kWh/kWp/yr average
        return { inverter_kva: Math.round(invKw*100)/100, panels_per_string: panelsPerString, annual_yield_mwh: Math.round(annualYield*100)/100 };
      }
    }
  ]
};

// ── Short-Circuit Analysis (3-phase) ─────────────────────────────────────────
export const shortCircuitAnalysis: EngineeringPipeline = {
  id: 'short-circuit-analysis',
  name: 'Short-Circuit Analysis (3-Phase)',
  description: 'Calculate prospective three-phase short-circuit current at any point in an LV network using the impedance method. Required for protection device selection and equipment ratings.',
  domain: 'electrical', difficulty: 'advanced', estimated_time: '10-12 min', icon: '⚡',
  steps: [
    {
      stepNumber: 1, name: 'Source Impedance',
      description: 'Calculate the Thevenin equivalent impedance of the supply network at the study point, combining utility, transformer, and cable impedances.',
      standard_ref: 'IEC 60909-0 § 4 (impedance method)',
      formula_display: [
        'Z_total = √(R_total² + X_total²)',
        'Z_utility = c × V² / S_sc_network   (c = 1.1 for max fault)',
        'Z_transformer = (Z%/100) × V² / S_rated',
        'Z_cable = R_cable + jX_cable (from cable data)',
      ],
      inputs: [
        { name: 'utility_ssc_mva', label: 'Utility Fault Level',      unit: 'MVA', type: 'number', min: 1, max: 10000, default: 250,  required: true, help: 'Declared short-circuit MVA at the HV point of supply (from utility)' },
        { name: 'trafo_kva',       label: 'Transformer Rating',       unit: 'kVA', type: 'number', min: 25, max: 10000, default: 1000, required: true, help: 'Transformer kVA rating' },
        { name: 'trafo_z_pct',     label: 'Transformer Impedance',    unit: '%',   type: 'number', min: 2, max: 10,    default: 5,    required: true, help: 'Transformer short-circuit impedance (nameplate)' },
        { name: 'lv_voltage',      label: 'LV System Voltage',        unit: 'V',   type: 'number', min: 100, max: 1000, default: 400, required: true, help: 'LV bus voltage' },
        { name: 'cable_r_mohm_m',  label: 'Feeder Cable R (mΩ/m)',   unit: 'mΩ/m', type: 'number', min: 0, max: 20, default: 0.5, required: true, help: 'Resistance per metre of feeder cable (mΩ/m). 120mm² Cu ≈ 0.19 mΩ/m; 35mm² Cu ≈ 0.54 mΩ/m' },
        { name: 'cable_length_m',  label: 'Feeder Cable Length',      unit: 'm',   type: 'number', min: 0, max: 2000, default: 50,  required: true, help: 'Length of feeder cable from transformer to study point' },
      ],
      outputs: [
        { name: 'z_utility_mohm', label: 'Utility Impedance', unit: 'mΩ', precision: 2 },
        { name: 'z_trafo_mohm',   label: 'Transformer Impedance', unit: 'mΩ', precision: 2 },
        { name: 'z_cable_mohm',   label: 'Cable Impedance', unit: 'mΩ', precision: 2 },
        { name: 'z_total_mohm',   label: 'Total Impedance', unit: 'mΩ', precision: 2 },
      ],
      calculate(inp) {
        const V = +inp.lv_voltage;
        const Ssn = +inp.utility_ssc_mva * 1e6;
        const Str = +inp.trafo_kva * 1e3;
        // All referred to LV side
        const Zu = (1.1 * V*V) / Ssn * 1000;  // mΩ
        const Zt = (+inp.trafo_z_pct/100) * (V*V) / Str * 1000; // mΩ
        const Zc = +inp.cable_r_mohm_m * +inp.cable_length_m * 2; // mΩ (2 = there+return)
        const Ztotal = Zu + Zt + Zc;
        return { z_utility_mohm: Math.round(Zu*100)/100, z_trafo_mohm: Math.round(Zt*100)/100, z_cable_mohm: Math.round(Zc*100)/100, z_total_mohm: Math.round(Ztotal*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Fault Current Calculation',
      description: 'Calculate the symmetric (rms) and peak short-circuit currents. The peak current determines the breaking capacity of protective devices.',
      standard_ref: 'IEC 60909-0 Eq. (29) & (52)',
      formula_display: [
        'I"k3 = c × V_n / (√3 × Z_total)',
        'c = 1.1 (max SC, IEC 60909)',
        'i_p = κ × √2 × I"k3   (peak current)',
        'κ = 1.02 + 0.98 × e^(−3R/X)   (from R/X ratio)',
        'For distribution networks: κ ≈ 1.8 (conservative)',
      ],
      inputs: [
        { name: 'z_total_mohm', label: 'Total Impedance', unit: 'mΩ', type: 'number', min: 0.01, max: 1000, required: true, help: 'From Step 1', fromPreviousStep: 'z_total_mohm' },
        { name: 'lv_voltage',   label: 'System Voltage',  unit: 'V',  type: 'number', min: 100, max: 1000, default: 400, required: true, help: 'LV system voltage' },
        { name: 'r_x_ratio',    label: 'R/X Ratio of Supply', unit: '', type: 'number', min: 0.1, max: 10, default: 0.5, required: true, help: 'R/X ratio of total impedance. Low (0.1–0.3) for LV near transformer; higher (0.5–2) further away.' },
      ],
      outputs: [
        { name: 'isc_rms_ka',  label: 'Sym. SC Current (I"k3)', unit: 'kA', precision: 3 },
        { name: 'kappa',       label: 'Peak Factor (κ)',          unit: '',   precision: 3 },
        { name: 'isc_peak_ka', label: 'Peak SC Current (ip)',    unit: 'kA', precision: 3 },
      ],
      calculate(inp) {
        const Z = +inp.z_total_mohm / 1000;  // Ω
        const V = +inp.lv_voltage;
        const Isk = (1.1 * V) / (Math.sqrt(3) * Z);
        const rx = +inp.r_x_ratio;
        const kappa = 1.02 + 0.98 * Math.exp(-3 * rx);
        const ip = kappa * Math.sqrt(2) * Isk;
        return { isc_rms_ka: Math.round(Isk/1000*1000)/1000, kappa: Math.round(kappa*1000)/1000, isc_peak_ka: Math.round(ip/1000*1000)/1000 };
      }
    }
  ]
};

// ── Motor Cable & Protection ──────────────────────────────────────────────────
export const motorProtection: EngineeringPipeline = {
  id: 'motor-cable-protection',
  name: 'Motor Cable & Protection Sizing',
  description: 'Size the supply cable and select overcurrent protection (fuse or circuit breaker) for a three-phase induction motor, accounting for starting current.',
  domain: 'electrical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '🔩',
  steps: [
    {
      stepNumber: 1, name: 'Motor Full-Load Current',
      description: 'Calculate the motor full-load current which is the basis for cable and protection sizing.',
      standard_ref: 'IEC 60947-4-1 (motor starters)',
      formula_display: [
        'I_FL = P / (√3 × V × η × cosφ)',
        'Cable must carry: I_z ≥ I_FL',
        'Protection rated current: I_n = 1.0 × I_FL (motor CB) or 1.0–1.6 × I_FL (fuse)',
      ],
      inputs: [
        { name: 'motor_kw', label: 'Motor Power',        unit: 'kW', type: 'number', min: 0.1, max: 5000, default: 22,   required: true, help: 'Rated shaft power (nameplate)' },
        { name: 'voltage',  label: 'Supply Voltage (LL)', unit: 'V',  type: 'number', min: 200, max: 11000, default: 400, required: true, help: 'Line-to-line supply voltage' },
        { name: 'eta',      label: 'Efficiency',          unit: '',   type: 'number', min: 0.7, max: 0.99, default: 0.91, required: true, help: 'Full-load efficiency from motor datasheet (IE2/IE3 class)' },
        { name: 'pf',       label: 'Power Factor',        unit: '',   type: 'number', min: 0.6, max: 0.99, default: 0.85, required: true, help: 'Full-load power factor' },
        { name: 'sf',       label: 'Service Factor',      unit: '',   type: 'number', min: 1.0, max: 1.25, default: 1.0,  required: true, help: 'Service factor (1.0 standard; 1.15 for occasional overload)' },
      ],
      outputs: [
        { name: 'ifl_a',       label: 'Full-Load Current',    unit: 'A', precision: 1 },
        { name: 'design_cur_a',label: 'Design Current (I_FL × SF)', unit: 'A', precision: 1 },
      ],
      calculate(inp) {
        const Ifl = (+inp.motor_kw*1000)/(Math.sqrt(3)*+inp.voltage*+inp.eta*+inp.pf);
        const Id = Ifl * +inp.sf;
        return { ifl_a: Math.round(Ifl*10)/10, design_cur_a: Math.round(Id*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'Cable Selection',
      description: 'Select the minimum cable cross-section for the motor circuit. Motor cables need no additional derating for starting current (it is intermittent).',
      standard_ref: 'IEC 60364-5-52',
      formula_display: [
        'I_z_required = I_design / (C_a × C_g)',
        'Select cable where I_z0 ≥ I_z_required',
        'Motor cable minimum: 1.5 mm² (≤ 16 A), 2.5 mm² (≤ 25 A)',
      ],
      inputs: [
        { name: 'design_cur_a', label: 'Design Current', unit: 'A', type: 'number', min: 0.1, max: 2000, required: true, help: 'From Step 1', fromPreviousStep: 'design_cur_a' },
        { name: 'ambient_temp', label: 'Ambient Temperature', unit: '°C', type: 'number', min: 10, max: 60, default: 30, required: true, help: 'Temperature at cable route' },
        { name: 'num_circuits', label: 'Grouped Circuits', unit: '', type: 'number', min: 1, max: 20, default: 1, required: true, help: 'Number of circuits grouped together' },
      ],
      outputs: [
        { name: 'cable_size_mm2',  label: 'Selected Cable Size',    unit: 'mm²', precision: 0 },
        { name: 'cable_ampacity',  label: 'Derated Ampacity',        unit: 'A',   precision: 1 },
      ],
      calculate(inp) {
        const AMPACITY: Record<number,number> = {1.5:17.5,2.5:24,4:32,6:41,10:57,16:76,25:101,35:125,50:151,70:192,95:232,120:269,150:309};
        const SIZES = [1.5,2.5,4,6,10,16,25,35,50,70,95,120,150];
        const t = +inp.ambient_temp;
        const Ca = t<=30?1.0:t<=35?0.94:t<=40?0.87:t<=45?0.79:t<=50?0.71:0.61;
        const n = +inp.num_circuits;
        const Cg = n===1?1.0:n===2?0.8:n===3?0.7:n<=4?0.65:n<=6?0.6:0.57;
        const reqBase = +inp.design_cur_a / (Ca*Cg);
        const size = SIZES.find(s => AMPACITY[s] >= reqBase) ?? 150;
        const derated = AMPACITY[size] * Ca * Cg;
        return { cable_size_mm2: size, cable_ampacity: Math.round(derated*10)/10 };
      }
    },
    {
      stepNumber: 3, name: 'Protection Device Selection',
      description: 'Select the overcurrent protection device. For motor circuits, the protection must allow starting current (6–7× FLC) to flow without tripping, but protect against overload and short-circuit.',
      standard_ref: 'IEC 60947-4-1 Table 4 (Type 2 coordination)',
      formula_display: [
        'Motor CB (MPCB): I_n = I_FL (adjustable)',
        'Fuse (gG): I_n ≤ 2.5 × I_FL  (starting ≤ 10 s)',
        'Fuse (aM): I_n = 1.0–1.6 × I_FL  (motor starting category)',
        'Overload relay: 1.0–1.05 × I_FL (IEC 60947-4-1)',
      ],
      inputs: [
        { name: 'ifl_a',     label: 'Full-Load Current', unit: 'A', type: 'number', min: 0.1, max: 2000, required: true, help: 'From Step 1', fromPreviousStep: 'ifl_a' },
        { name: 'prot_type', label: 'Protection Type', unit: '', type: 'select', options: [{value:'mpcb',label:'Motor Protection CB (MPCB)'},{value:'fuse_gG',label:'gG Fuse'},{value:'fuse_aM',label:'aM Motor Fuse'}], default: 'mpcb', required: true, help: 'MPCB preferred for new installations; fuses for legacy' },
      ],
      outputs: [
        { name: 'prot_rating_a',   label: 'Protection Device Rating', unit: 'A', precision: 0 },
        { name: 'overload_set_a',  label: 'Overload Relay Setting',    unit: 'A', precision: 1 },
      ],
      calculate(inp) {
        const Ifl = +inp.ifl_a;
        const STD = [4,6,8,10,12,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400];
        let rating: number;
        if (inp.prot_type === 'fuse_gG') {
          rating = STD.find(s => s >= Ifl * 2.0) ?? 400;
        } else {
          // MPCB or aM fuse: select ≥ 1.0 × IFL
          rating = STD.find(s => s >= Ifl) ?? 400;
        }
        return { prot_rating_a: rating, overload_set_a: Math.round(Ifl*1.05*10)/10 };
      }
    }
  ]
};

export const ELECTRICAL_PIPELINES: EngineeringPipeline[] = [
  transformerSizing,
  motorStartingDol,
  generatorSizing,
  upsBatterySizing,
  busbarSizing,
  earthingSystem,
  lightingDesign,
  solarPvSizing,
  shortCircuitAnalysis,
  motorProtection,
];
