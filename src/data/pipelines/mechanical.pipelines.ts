import type { EngineeringPipeline } from '../engineeringPipelines';

// ── Centrifugal Pump Sizing ───────────────────────────────────────────────────
export const pumpSizing: EngineeringPipeline = {
  id: 'pump-sizing',
  name: 'Centrifugal Pump Sizing',
  description: 'Size a centrifugal pump: calculate system head, determine required flow, select pump duty point, and calculate motor power.',
  domain: 'mechanical', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '💧',
  steps: [
    {
      stepNumber: 1, name: 'System Head Calculation',
      description: 'Calculate the total system head that the pump must overcome: static head (elevation), friction losses in pipes, and minor losses (fittings, valves).',
      standard_ref: 'ISO 9906 (pump testing) / Darcy-Weisbach',
      formula_display: [
        'H_total = H_static + H_friction + H_minor',
        'H_friction = f × (L/D) × V²/(2g)   [Darcy-Weisbach]',
        'H_minor = K × V²/(2g)',
        'f from Moody chart; typical K_system ≈ 30–50% of H_friction',
      ],
      inputs: [
        { name: 'h_static_m',    label: 'Static Head (elevation)', unit: 'm',     type: 'number', min: 0, max: 500,  default: 10,    required: true,  help: 'Vertical height from suction water level to delivery point' },
        { name: 'flow_m3h',      label: 'Design Flow Rate',        unit: 'm³/h',  type: 'number', min: 0.1, max: 10000, default: 50, required: true,  help: 'Required volumetric flow rate' },
        { name: 'pipe_dia_mm',   label: 'Pipe Internal Diameter',  unit: 'mm',    type: 'number', min: 10, max: 1200,  default: 100,  required: true,  help: 'Internal diameter of the main pipe' },
        { name: 'pipe_length_m', label: 'Total Pipe Length',       unit: 'm',     type: 'number', min: 1,  max: 10000, default: 150,  required: true,  help: 'Total equivalent pipe length (include fittings as equivalent lengths)' },
        { name: 'pipe_rough_mm', label: 'Pipe Roughness',          unit: 'mm',    type: 'number', min: 0.001, max: 5, default: 0.046, required: true, help: 'Absolute roughness: steel 0.046 mm, cast iron 0.25 mm, PVC 0.0015 mm' },
      ],
      outputs: [
        { name: 'velocity_ms',  label: 'Flow Velocity',  unit: 'm/s', precision: 2 },
        { name: 'h_friction_m', label: 'Friction Head',  unit: 'm',   precision: 2 },
        { name: 'h_total_m',    label: 'Total System Head', unit: 'm', precision: 2 },
      ],
      calculate(inp) {
        const Q = +inp.flow_m3h / 3600;  // m³/s
        const D = +inp.pipe_dia_mm / 1000; // m
        const A = Math.PI * D*D / 4;
        const V = Q / A;
        const Re = V * D / 1e-6;  // kinematic viscosity water at 20°C
        const e_D = (+inp.pipe_rough_mm/1000) / D;
        // Colebrook-White approximation (Swamee-Jain)
        const f = 0.25 / Math.pow(Math.log10(e_D/3.7 + 5.74/Math.pow(Re,0.9)), 2);
        const Hf = f * (+inp.pipe_length_m / D) * V*V / (2*9.81);
        const Htotal = +inp.h_static_m + Hf * 1.3; // 1.3 for minor losses
        return { velocity_ms: Math.round(V*100)/100, h_friction_m: Math.round(Hf*100)/100, h_total_m: Math.round(Htotal*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Pump Power & Motor Selection',
      description: 'Calculate hydraulic power, shaft power (accounting for pump efficiency), and select the motor rating with 20% service margin.',
      standard_ref: 'ISO 9906 / IEC 60034-30 (motor efficiency)',
      formula_display: [
        'P_hydraulic = ρ × g × Q × H   (W)',
        'P_shaft = P_hydraulic / η_pump',
        'P_motor = P_shaft / η_motor',
        'Select standard motor: P_motor × 1.20 (20% margin)',
      ],
      inputs: [
        { name: 'flow_m3h',   label: 'Flow Rate',         unit: 'm³/h', type: 'number', min: 0.1, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'flow_m3h' },
        { name: 'h_total_m',  label: 'Total System Head', unit: 'm',    type: 'number', min: 0.1, max: 1000,  required: true, help: 'From Step 1', fromPreviousStep: 'h_total_m' },
        { name: 'pump_eta',   label: 'Pump Efficiency',   unit: '',     type: 'number', min: 0.4, max: 0.92,  default: 0.72, required: true, help: 'Pump hydraulic efficiency at duty point (from pump curve). Typical: 0.60–0.80 for centrifugal.' },
        { name: 'motor_eta',  label: 'Motor Efficiency',  unit: '',     type: 'number', min: 0.7, max: 0.97,  default: 0.92, required: true, help: 'Motor efficiency (IE3 class). 0.91 for 15 kW, 0.93 for 37 kW, 0.95 for 110 kW.' },
        { name: 'fluid_density', label: 'Fluid Density',  unit: 'kg/m³', type: 'number', min: 500, max: 2000, default: 1000, required: true, help: 'Density: water 1000, seawater 1025, ethylene glycol 50% 1067 kg/m³' },
      ],
      outputs: [
        { name: 'p_hydraulic_kw', label: 'Hydraulic Power',     unit: 'kW', precision: 2 },
        { name: 'p_shaft_kw',     label: 'Pump Shaft Power',     unit: 'kW', precision: 2 },
        { name: 'p_motor_kw',     label: 'Motor Input Power',    unit: 'kW', precision: 2 },
        { name: 'motor_size_kw',  label: 'Selected Motor Rating', unit: 'kW', precision: 0 },
      ],
      calculate(inp) {
        const Q = +inp.flow_m3h / 3600;
        const Phyd = +inp.fluid_density * 9.81 * Q * +inp.h_total_m / 1000;
        const Pshaft = Phyd / +inp.pump_eta;
        const Pmotor = Pshaft / +inp.motor_eta;
        const STD_KW = [0.25,0.37,0.55,0.75,1.1,1.5,2.2,3.0,4.0,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200,250,315,400];
        const sel = STD_KW.find(s => s >= Pmotor*1.2) ?? 400;
        return { p_hydraulic_kw: Math.round(Phyd*100)/100, p_shaft_kw: Math.round(Pshaft*100)/100, p_motor_kw: Math.round(Pmotor*100)/100, motor_size_kw: sel };
      }
    }
  ]
};

// ── Fan / Blower Sizing ───────────────────────────────────────────────────────
export const fanSizing: EngineeringPipeline = {
  id: 'fan-blower-sizing',
  name: 'Fan & Blower Sizing',
  description: 'Size a fan or blower for HVAC or ventilation: calculate required air volume, estimate system resistance, determine fan duty and motor power.',
  domain: 'mechanical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '🌀',
  steps: [
    {
      stepNumber: 1, name: 'Air Volume Requirement',
      description: 'Calculate the required supply/extract air volume flow rate based on occupancy (fresh air) or heat removal requirements.',
      standard_ref: 'ASHRAE 62.1-2022 / EN 16798-1',
      formula_display: [
        'Q_occupancy = N_people × q_person + A_floor × q_area',
        'q_person = 10 L/s/person (office), q_area = 1 L/s/m² (office) — ASHRAE 62.1',
        'Q_heat = P_sensible / (ρ × cp × ΔT)   [cooling mode]',
        'Q_design = max(Q_occupancy, Q_heat)',
      ],
      inputs: [
        { name: 'occupants',     label: 'Number of Occupants',     unit: 'persons', type: 'number', min: 0, max: 10000, default: 50,  required: true, help: 'Peak occupancy' },
        { name: 'floor_area_m2', label: 'Floor Area',              unit: 'm²',     type: 'number', min: 1, max: 100000, default: 200, required: true, help: 'Conditioned floor area' },
        { name: 'heat_gain_kw',  label: 'Sensible Heat Gain',      unit: 'kW',     type: 'number', min: 0, max: 10000, default: 30,  required: true, help: 'Total sensible heat gain from cooling load calculation' },
        { name: 'supply_temp_c', label: 'Supply Air Temperature',  unit: '°C',     type: 'number', min: 10, max: 22,  default: 16,  required: true, help: 'Supply air temperature (typically 14–18°C)' },
        { name: 'room_temp_c',   label: 'Room Temperature',        unit: '°C',     type: 'number', min: 18, max: 30,  default: 24,  required: true, help: 'Design room temperature' },
      ],
      outputs: [
        { name: 'q_fresh_ls',   label: 'Fresh Air Requirement',  unit: 'L/s',   precision: 0 },
        { name: 'q_cooling_ls', label: 'Cooling Air Requirement', unit: 'L/s',  precision: 0 },
        { name: 'q_design_m3h', label: 'Design Air Volume Flow',  unit: 'm³/h', precision: 0 },
      ],
      calculate(inp) {
        const Qfresh = +inp.occupants*10 + +inp.floor_area_m2*1;
        const dT = +inp.room_temp_c - +inp.supply_temp_c;
        const Qcool = (+inp.heat_gain_kw*1000) / (1.2 * 1005 * dT) * 1000; // L/s
        const Qdes = Math.max(Qfresh, Qcool);
        return { q_fresh_ls: Math.round(Qfresh), q_cooling_ls: Math.round(Qcool), q_design_m3h: Math.round(Qdes*3.6) };
      }
    },
    {
      stepNumber: 2, name: 'Fan Power & Motor',
      description: 'Calculate the fan total pressure, shaft power, and select the motor. Fan power is proportional to flow × pressure.',
      standard_ref: 'ISO 5801 (fan testing)',
      formula_display: [
        'P_air = Q × ΔP_total   (W)',
        'P_shaft = P_air / η_fan   (η_fan: 0.55–0.75 for centrifugal)',
        'P_motor = P_shaft / η_motor',
        'Fan laws: Q ∝ N, P ∝ N², Power ∝ N³',
      ],
      inputs: [
        { name: 'q_design_m3h',  label: 'Design Air Flow', unit: 'm³/h', type: 'number', min: 1, max: 1000000, required: true, help: 'From Step 1', fromPreviousStep: 'q_design_m3h' },
        { name: 'static_pres_pa',label: 'System Static Pressure', unit: 'Pa', type: 'number', min: 10, max: 3000, default: 300, required: true, help: 'Total system resistance at design flow. Ductwork: 150–400 Pa; AHU coils + filters: 200–500 Pa.' },
        { name: 'fan_eta',       label: 'Fan Total Efficiency',   unit: '',   type: 'number', min: 0.3, max: 0.85, default: 0.65, required: true, help: 'Fan total-to-static efficiency at duty point (from fan performance curve). Centrifugal: 0.55–0.75; axial: 0.60–0.80.' },
        { name: 'motor_eta',     label: 'Motor Efficiency',       unit: '',   type: 'number', min: 0.7, max: 0.97, default: 0.91, required: true, help: 'Motor efficiency' },
      ],
      outputs: [
        { name: 'p_air_kw',    label: 'Air Power',            unit: 'kW', precision: 3 },
        { name: 'p_shaft_kw',  label: 'Fan Shaft Power',      unit: 'kW', precision: 3 },
        { name: 'motor_kw',    label: 'Selected Motor Rating', unit: 'kW', precision: 0 },
        { name: 'sfp_w_ls',    label: 'Specific Fan Power (SFP)', unit: 'W/(L/s)', precision: 2 },
      ],
      calculate(inp) {
        const Q_m3s = +inp.q_design_m3h / 3600;
        const dP = +inp.static_pres_pa;
        const Pair = Q_m3s * dP / 1000;  // kW
        const Pshaft = Pair / +inp.fan_eta;
        const Pmot = Pshaft / +inp.motor_eta;
        const STD = [0.25,0.37,0.55,0.75,1.1,1.5,2.2,3.0,4.0,5.5,7.5,11,15,18.5,22,30,37,45,55,75];
        const sel = STD.find(s => s >= Pmot*1.2) ?? 75;
        const Q_ls = +inp.q_design_m3h / 3.6;
        const sfp = (Pmot*1000) / Q_ls;
        return { p_air_kw: Math.round(Pair*1000)/1000, p_shaft_kw: Math.round(Pshaft*1000)/1000, motor_kw: sel, sfp_w_ls: Math.round(sfp*100)/100 };
      }
    }
  ]
};

// ── Pipe Pressure Drop ────────────────────────────────────────────────────────
export const pipePressureDrop: EngineeringPipeline = {
  id: 'pipe-pressure-drop',
  name: 'Pipe Pressure Drop (Darcy-Weisbach)',
  description: 'Calculate pressure drop in a piping system using the Darcy-Weisbach equation with Moody friction factor. Applicable to any fluid (water, oil, gas).',
  domain: 'mechanical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '🔧',
  steps: [
    {
      stepNumber: 1, name: 'Flow Parameters',
      description: 'Calculate flow velocity and Reynolds number to characterize the flow regime (laminar or turbulent) which determines the friction factor.',
      standard_ref: 'ISO 4006 / Darcy-Weisbach equation',
      formula_display: [
        'V = Q / A = Q / (π D²/4)',
        'Re = ρ V D / μ   (Reynolds number)',
        'Re < 2300: laminar; Re > 4000: turbulent',
        'f_laminar = 64/Re',
      ],
      inputs: [
        { name: 'flow_m3h',      label: 'Volumetric Flow Rate', unit: 'm³/h',  type: 'number', min: 0.001, max: 100000, default: 20,    required: true, help: 'Volume flow rate' },
        { name: 'pipe_dia_mm',   label: 'Pipe Internal Diameter', unit: 'mm',  type: 'number', min: 5, max: 2000,     default: 80,    required: true, help: 'Internal diameter of pipe' },
        { name: 'fluid_density', label: 'Fluid Density',        unit: 'kg/m³', type: 'number', min: 0.1, max: 2000,  default: 1000,  required: true, help: 'Density: water 1000, oil ~850–900, air ~1.2 kg/m³' },
        { name: 'dyn_visc_cP',   label: 'Dynamic Viscosity',    unit: 'cP',    type: 'number', min: 0.001, max: 10000, default: 1.0,  required: true, help: 'Dynamic viscosity in centipoise: water 20°C = 1.0 cP, water 60°C = 0.47 cP, oil ~10–100 cP' },
      ],
      outputs: [
        { name: 'velocity_ms',  label: 'Flow Velocity',     unit: 'm/s', precision: 3 },
        { name: 'reynolds',     label: 'Reynolds Number',   unit: '',    precision: 0 },
        { name: 'flow_regime',  label: 'Flow Regime',       unit: '',    precision: 0 },
      ],
      calculate(inp) {
        const Q = +inp.flow_m3h / 3600;
        const D = +inp.pipe_dia_mm / 1000;
        const A = Math.PI * D*D / 4;
        const V = Q / A;
        const mu = +inp.dyn_visc_cP / 1000;  // Pa·s
        const Re = +inp.fluid_density * V * D / mu;
        const regime = Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transitional' : 'Turbulent';
        return { velocity_ms: Math.round(V*1000)/1000, reynolds: Math.round(Re), flow_regime: regime };
      }
    },
    {
      stepNumber: 2, name: 'Pressure Drop Calculation',
      description: 'Calculate the pressure drop using the Darcy-Weisbach equation with the Colebrook-White friction factor for turbulent flow.',
      standard_ref: 'Darcy-Weisbach / Colebrook-White / Swamee-Jain',
      formula_display: [
        'ΔP = f × (L/D) × ρV²/2   [Darcy-Weisbach]',
        '1/√f = −2 log(ε/3.7D + 2.51/(Re√f))   [Colebrook-White]',
        'Swamee-Jain: f = 0.25/[log(ε/3.7D + 5.74/Re⁰·⁹)]²',
        'ΔP_minor = K × ρV²/2   (add 20–30% for fittings if unknown)',
      ],
      inputs: [
        { name: 'velocity_ms',   label: 'Flow Velocity',    unit: 'm/s',   type: 'number', min: 0.001, max: 100, required: true, help: 'From Step 1', fromPreviousStep: 'velocity_ms' },
        { name: 'reynolds',      label: 'Reynolds Number',  unit: '',      type: 'number', min: 1, max: 1e9,    required: true, help: 'From Step 1', fromPreviousStep: 'reynolds' },
        { name: 'fluid_density', label: 'Fluid Density',    unit: 'kg/m³', type: 'number', min: 0.1, max: 2000, default: 1000, required: true, help: 'Fluid density' },
        { name: 'pipe_dia_mm',   label: 'Pipe Diameter',    unit: 'mm',    type: 'number', min: 5, max: 2000,   default: 80,   required: true, help: 'Internal diameter' },
        { name: 'pipe_length_m', label: 'Pipe Length',      unit: 'm',     type: 'number', min: 0.1, max: 50000, default: 100, required: true, help: 'Total pipe length' },
        { name: 'roughness_mm',  label: 'Pipe Roughness',   unit: 'mm',    type: 'number', min: 0.001, max: 5,   default: 0.046, required: true, help: 'Absolute roughness: CS 0.046, CI 0.25, PVC 0.0015 mm' },
        { name: 'fittings_pct',  label: 'Fittings Allowance', unit: '%',   type: 'number', min: 0, max: 100,    default: 20,   required: true, help: 'Additional pressure drop for fittings as % of straight pipe loss' },
      ],
      outputs: [
        { name: 'friction_factor',   label: 'Darcy Friction Factor', unit: '',    precision: 5 },
        { name: 'dp_pipe_kpa',       label: 'Straight Pipe ΔP',      unit: 'kPa', precision: 3 },
        { name: 'dp_total_kpa',      label: 'Total ΔP (inc. fittings)', unit: 'kPa', precision: 3 },
        { name: 'dp_per_100m_kpa',   label: 'Pressure Gradient',     unit: 'kPa/100m', precision: 3 },
      ],
      calculate(inp) {
        const V = +inp.velocity_ms;
        const Re = +inp.reynolds;
        const rho = +inp.fluid_density;
        const D = +inp.pipe_dia_mm / 1000;
        const L = +inp.pipe_length_m;
        const e = +inp.roughness_mm / 1000;
        const e_D = e / D;
        const f = Re < 2300 ? 64/Re : 0.25/Math.pow(Math.log10(e_D/3.7 + 5.74/Math.pow(Re,0.9)),2);
        const dP_pipe = f * (L/D) * rho * V*V / 2 / 1000; // kPa
        const dP_total = dP_pipe * (1 + +inp.fittings_pct/100);
        return { friction_factor: Math.round(f*100000)/100000, dp_pipe_kpa: Math.round(dP_pipe*1000)/1000, dp_total_kpa: Math.round(dP_total*1000)/1000, dp_per_100m_kpa: Math.round(dP_pipe/L*100*1000)/1000 };
      }
    }
  ]
};

// ── Heat Exchanger (LMTD Method) ──────────────────────────────────────────────
export const heatExchangerLmtd: EngineeringPipeline = {
  id: 'heat-exchanger-lmtd',
  name: 'Heat Exchanger Design (LMTD)',
  description: 'Design a shell-and-tube or plate heat exchanger: calculate heat duty, log mean temperature difference (LMTD), and required heat transfer area.',
  domain: 'mechanical', difficulty: 'advanced', estimated_time: '10-12 min', icon: '🌡️',
  steps: [
    {
      stepNumber: 1, name: 'Heat Duty Calculation',
      description: 'Calculate the heat transfer rate (duty) from the hot and cold fluid conditions. Energy balance: Q_hot = Q_cold (ignoring heat losses).',
      standard_ref: 'TEMA standards / Kern (Process Heat Transfer)',
      formula_display: [
        'Q = ṁ_hot × cp_hot × (T_hot_in − T_hot_out)',
        'Q = ṁ_cold × cp_cold × (T_cold_out − T_cold_in)',
        'Check: Q_hot ≈ Q_cold (energy balance)',
      ],
      inputs: [
        { name: 'mflow_hot_kg_s', label: 'Hot Fluid Flow Rate',    unit: 'kg/s', type: 'number', min: 0.01, max: 10000, default: 5,    required: true, help: 'Mass flow rate of hot fluid' },
        { name: 'cp_hot_j_kgk',  label: 'Hot Fluid Specific Heat', unit: 'J/(kg·K)', type: 'number', min: 500, max: 10000, default: 4186, required: true, help: 'Cp: water 4186, thermal oil ~2000, steam condensing (use latent heat instead)' },
        { name: 't_hot_in',      label: 'Hot Inlet Temperature',   unit: '°C',   type: 'number', min: 10, max: 400,   default: 80,   required: true, help: 'Hot fluid inlet temperature' },
        { name: 't_hot_out',     label: 'Hot Outlet Temperature',  unit: '°C',   type: 'number', min: 5,  max: 390,   default: 40,   required: true, help: 'Hot fluid outlet temperature (must be < T_hot_in)' },
        { name: 't_cold_in',     label: 'Cold Inlet Temperature',  unit: '°C',   type: 'number', min: 0,  max: 200,   default: 15,   required: true, help: 'Cold fluid inlet temperature (must be < T_hot_out for counter-flow)' },
      ],
      outputs: [
        { name: 'q_duty_kw',    label: 'Heat Duty (Q)',        unit: 'kW',  precision: 2 },
        { name: 't_cold_out',   label: 'Cold Outlet Temperature', unit: '°C', precision: 1 },
        { name: 'approach_dt',  label: 'Minimum Approach ΔT', unit: '°C',  precision: 1 },
      ],
      calculate(inp) {
        const Q = +inp.mflow_hot_kg_s * +inp.cp_hot_j_kgk * (+inp.t_hot_in - +inp.t_hot_out) / 1000;
        // Assume cold fluid is water (cp=4186), solve for Tcold_out:
        // Use same flow assumption → T_cold_out = T_cold_in + Q/(m_hot * cp_hot / 4186) — simplified
        const Tcout = +inp.t_cold_in + Q*1000 / (3.5 * 4186); // assume cold flowrate ~3.5 kg/s
        const approach = Math.min(+inp.t_hot_out - +inp.t_cold_in, +inp.t_hot_in - Tcout);
        return { q_duty_kw: Math.round(Q*100)/100, t_cold_out: Math.round(Tcout*10)/10, approach_dt: Math.round(approach*10)/10 };
      }
    },
    {
      stepNumber: 2, name: 'LMTD & Transfer Area',
      description: 'Calculate the Log Mean Temperature Difference (LMTD) for counter-flow arrangement and determine the required heat transfer area A = Q / (U × LMTD).',
      standard_ref: 'TEMA / Perry\'s Chemical Engineers Handbook',
      formula_display: [
        'LMTD = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)   [counter-flow]',
        'ΔT₁ = T_hot_in − T_cold_out',
        'ΔT₂ = T_hot_out − T_cold_in',
        'A = Q / (U × LMTD)',
        'U typical: water-water 800–1500 W/m²K; oil-water 200–400 W/m²K',
      ],
      inputs: [
        { name: 'q_duty_kw',   label: 'Heat Duty (Q)',         unit: 'kW',     type: 'number', min: 0.1, max: 100000, required: true, help: 'From Step 1', fromPreviousStep: 'q_duty_kw' },
        { name: 't_hot_in',    label: 'Hot Fluid Inlet',       unit: '°C',     type: 'number', min: 10, max: 400, default: 80,  required: true, help: 'Hot inlet temperature' },
        { name: 't_hot_out',   label: 'Hot Fluid Outlet',      unit: '°C',     type: 'number', min: 5, max: 390,  default: 40,  required: true, help: 'Hot outlet temperature' },
        { name: 't_cold_in',   label: 'Cold Fluid Inlet',      unit: '°C',     type: 'number', min: 0, max: 200,  default: 15,  required: true, help: 'Cold inlet temperature' },
        { name: 't_cold_out',  label: 'Cold Fluid Outlet',     unit: '°C',     type: 'number', min: 5, max: 300,  default: 35,  required: true, help: 'Cold outlet temperature (from Step 1)' , fromPreviousStep: 't_cold_out' },
        { name: 'u_w_m2k',    label: 'Overall Heat Transfer Coefficient (U)', unit: 'W/(m²·K)', type: 'number', min: 10, max: 5000, default: 1000, required: true, help: 'U value from fluid pair and fouling factors. Water-water: 800–1500; steam-water: 1000–3000; oil-water: 200–400 W/(m²K).' },
      ],
      outputs: [
        { name: 'lmtd_c',      label: 'LMTD (counter-flow)',   unit: '°C', precision: 2 },
        { name: 'area_m2',     label: 'Required Transfer Area', unit: 'm²', precision: 2 },
        { name: 'ntu',         label: 'Number of Transfer Units (NTU)', unit: '', precision: 2 },
      ],
      calculate(inp) {
        const dT1 = +inp.t_hot_in - +inp.t_cold_out;
        const dT2 = +inp.t_hot_out - +inp.t_cold_in;
        const lmtd = Math.abs(dT1-dT2) < 0.001 ? dT1 : (dT1-dT2)/Math.log(dT1/dT2);
        const Q = +inp.q_duty_kw * 1000;
        const A = Q / (+inp.u_w_m2k * lmtd);
        const ntu = +inp.u_w_m2k * A / (5*4186); // approx, Cmin
        return { lmtd_c: Math.round(lmtd*100)/100, area_m2: Math.round(A*100)/100, ntu: Math.round(ntu*100)/100 };
      }
    }
  ]
};

// ── Compressed Air System ─────────────────────────────────────────────────────
export const compressedAir: EngineeringPipeline = {
  id: 'compressed-air-system',
  name: 'Compressed Air System Sizing',
  description: 'Size a compressed air system: calculate total air demand, size the compressor, and determine receiver (storage) vessel volume.',
  domain: 'mechanical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '💨',
  steps: [
    {
      stepNumber: 1, name: 'Air Demand Assessment',
      description: 'Calculate peak and average free air delivery (FAD) demand from all pneumatic tools and equipment.',
      standard_ref: 'ISO 1217 (compressor performance) / EN 12215',
      formula_display: [
        'Q_FAD = Σ(q_tool × duty_cycle × load_factor)',
        'Convert to FAD: Q_actual = Q_rated × P_operating / P_atm',
        'Peak demand: use simultaneity factor 0.7–0.9',
      ],
      inputs: [
        { name: 'tools_fad_ls',    label: 'Total Installed Tool Demand', unit: 'L/s', type: 'number', min: 0.1, max: 10000, default: 20, required: true, help: 'Sum of all pneumatic tool rated FAD consumption (from tool data)' },
        { name: 'simultaneity',    label: 'Simultaneity Factor',         unit: '',    type: 'number', min: 0.3, max: 1.0,   default: 0.7, required: true, help: 'Fraction of tools operating at same time (0.7 typical for workshop)' },
        { name: 'leakage_pct',     label: 'System Leakage Allowance',   unit: '%',   type: 'number', min: 5, max: 30,     default: 15,  required: true, help: 'Compressed air leakage as % of demand (typical 10–20% in industrial)' },
        { name: 'pressure_bar_g',  label: 'Working Pressure',           unit: 'bar(g)', type: 'number', min: 3, max: 40,  default: 7,   required: true, help: 'Operating pressure gauge at tools (bar gauge)' },
      ],
      outputs: [
        { name: 'peak_demand_ls',    label: 'Peak Demand (FAD)',     unit: 'L/s',    precision: 1 },
        { name: 'design_demand_ls',  label: 'Design Demand + Leakage', unit: 'L/s', precision: 1 },
        { name: 'design_demand_m3min',label: 'Design Demand',         unit: 'm³/min', precision: 2 },
      ],
      calculate(inp) {
        const peak = +inp.tools_fad_ls * +inp.simultaneity;
        const design = peak * (1 + +inp.leakage_pct/100);
        return { peak_demand_ls: Math.round(peak*10)/10, design_demand_ls: Math.round(design*10)/10, design_demand_m3min: Math.round(design*60/1000*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Compressor & Receiver Sizing',
      description: 'Select compressor free air delivery (FAD) and calculate minimum air receiver volume. The receiver provides buffer storage and stabilizes system pressure.',
      standard_ref: 'ISO 1217 (compressor rating) / BS 5169 (receivers)',
      formula_display: [
        'Compressor FAD ≥ Design demand',
        'V_receiver = (Q_peak − Q_comp) × t / (P_max − P_min)',
        't = acceptable pressure drop time (s)',
        'Practical: V_receiver ≥ 5 × Q_FAD (L/min) × 0.01  [rule of thumb]',
      ],
      inputs: [
        { name: 'design_demand_m3min', label: 'Design Air Demand', unit: 'm³/min', type: 'number', min: 0.01, max: 1000, required: true, help: 'From Step 1', fromPreviousStep: 'design_demand_m3min' },
        { name: 'pressure_bar_g',      label: 'Working Pressure',  unit: 'bar(g)', type: 'number', min: 3, max: 40, default: 7, required: true, help: 'System working pressure' },
        { name: 'pressure_band_bar',   label: 'Pressure Band',     unit: 'bar',    type: 'number', min: 0.5, max: 3, default: 1.0, required: true, help: 'Pressure band (cut-out minus cut-in). Typical 0.5–1.5 bar.' },
      ],
      outputs: [
        { name: 'compressor_m3min',label: 'Compressor FAD Rating', unit: 'm³/min', precision: 2 },
        { name: 'motor_kw',         label: 'Approximate Motor Power', unit: 'kW', precision: 0 },
        { name: 'receiver_l',       label: 'Minimum Receiver Volume', unit: 'L',  precision: 0 },
      ],
      calculate(inp) {
        const Q = +inp.design_demand_m3min;
        const P = +inp.pressure_bar_g + 1.013;  // absolute
        const comp = Q * 1.15;  // 15% margin
        const kW = comp * P / 0.15;  // approximate: ~6.7 kW per m³/min at 7 bar
        const V = Q * 1000 * 10 / (+inp.pressure_band_bar * 10);  // simplified
        const STD_KW = [4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200];
        const selKw = STD_KW.find(s => s >= kW) ?? 200;
        return { compressor_m3min: Math.round(comp*100)/100, motor_kw: selKw, receiver_l: Math.round(V) };
      }
    }
  ]
};

// ── NPSH Check ────────────────────────────────────────────────────────────────
export const npshCheck: EngineeringPipeline = {
  id: 'npsh-cavitation-check',
  name: 'NPSH & Cavitation Check',
  description: 'Verify that a centrifugal pump will not cavitate by checking that the Net Positive Suction Head available (NPSHa) exceeds the pump\'s required NPSH (NPSHr).',
  domain: 'mechanical', difficulty: 'advanced', estimated_time: '8-10 min', icon: '🔍',
  steps: [
    {
      stepNumber: 1, name: 'NPSHa Calculation',
      description: 'Calculate the NPSH available at the pump suction, accounting for atmospheric pressure, suction static head, suction line friction losses, and vapour pressure.',
      standard_ref: 'ISO 9906 § 3.4 / HI 9.6.1 (NPSH margin)',
      formula_display: [
        'NPSHa = (P_atm − P_v)/(ρg) + h_s − h_fs',
        'h_s: suction static head (+ve above pump, −ve below)',
        'P_v: vapour pressure of liquid at pumping temperature',
        'h_fs: friction losses in suction pipe',
      ],
      inputs: [
        { name: 'p_atm_bar',     label: 'Atmospheric Pressure',  unit: 'bar(a)', type: 'number', min: 0.5, max: 1.1, default: 1.013, required: true, help: '1.013 bar at sea level; decreases ~0.012 bar per 100 m altitude' },
        { name: 'liquid_temp_c', label: 'Liquid Temperature',    unit: '°C',     type: 'number', min: 0, max: 150,  default: 20,   required: true, help: 'Pumping temperature affects vapour pressure significantly' },
        { name: 'suction_head_m',label: 'Suction Static Head (h_s)', unit: 'm', type: 'number', min: -10, max: 30, default: 2,    required: true, help: 'Positive if liquid is above pump centreline (flooded suction); negative for lift' },
        { name: 'suction_loss_m',label: 'Suction Line Losses',   unit: 'm',     type: 'number', min: 0, max: 20,   default: 0.5,  required: true, help: 'Friction and minor losses in suction piping (keep < 1–2 m for critical applications)' },
      ],
      outputs: [
        { name: 'pv_bar',    label: 'Vapour Pressure',         unit: 'bar(a)', precision: 4 },
        { name: 'npsha_m',   label: 'NPSHa',                   unit: 'm',      precision: 2 },
      ],
      calculate(inp) {
        const T = +inp.liquid_temp_c;
        // Antoine equation for water vapour pressure (kPa)
        const pv_kPa = Math.exp(23.196 - 3816.44 / (T + 273.15 - 46.13)) / 1000;
        const pv_bar = pv_kPa / 100;
        const npsha = ((+inp.p_atm_bar - pv_bar) * 1e5) / (1000*9.81) + +inp.suction_head_m - +inp.suction_loss_m;
        return { pv_bar: Math.round(pv_bar*10000)/10000, npsha_m: Math.round(npsha*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Cavitation Assessment',
      description: 'Compare NPSHa against the pump\'s required NPSH (NPSHr from data sheet). The HI standard requires NPSHa ≥ NPSHr + 0.6 m margin for acceptable operation.',
      standard_ref: 'HI 9.6.1-2012 (NPSH margin ratio)',
      formula_display: [
        'Cavitation check: NPSHa ≥ NPSHr + σ_margin',
        'σ_margin: 0.6 m minimum (HI 9.6.1), 1.0 m recommended',
        'NPSH margin ratio: NPSHa / NPSHr ≥ 1.1 (HI)',
        'If NPSHa < NPSHr: reduce flow, increase suction head, or reduce temperature',
      ],
      inputs: [
        { name: 'npsha_m',  label: 'NPSHa',         unit: 'm', type: 'number', min: 0, max: 100, required: true, help: 'From Step 1', fromPreviousStep: 'npsha_m' },
        { name: 'npshr_m',  label: 'NPSHr (from pump datasheet)', unit: 'm', type: 'number', min: 0.1, max: 50, default: 3.0, required: true, help: 'Required NPSH at duty flow from pump performance curve' },
      ],
      outputs: [
        { name: 'npsh_margin_m',  label: 'NPSH Margin (NPSHa − NPSHr)', unit: 'm',  precision: 2 },
        { name: 'npsh_ratio',     label: 'NPSH Ratio (NPSHa / NPSHr)',   unit: '',   precision: 2 },
        { name: 'no_cavitation',  label: 'No Cavitation (margin ≥ 0.6 m)', unit: '', precision: 0, isCompliance: true },
      ],
      calculate(inp) {
        const margin = +inp.npsha_m - +inp.npshr_m;
        const ratio = +inp.npsha_m / +inp.npshr_m;
        return { npsh_margin_m: Math.round(margin*100)/100, npsh_ratio: Math.round(ratio*100)/100, no_cavitation: margin >= 0.6 };
      }
    }
  ]
};

// ── Cooling Tower Performance ─────────────────────────────────────────────────
export const coolingTower: EngineeringPipeline = {
  id: 'cooling-tower-sizing',
  name: 'Cooling Tower Sizing',
  description: 'Size a cooling tower for HVAC or industrial heat rejection: calculate range, approach, cooling water flow, and fan power.',
  domain: 'mechanical', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '🏭',
  steps: [
    {
      stepNumber: 1, name: 'Thermal Performance',
      description: 'Define the cooling tower range (inlet minus outlet water temperature) and approach (outlet water minus wet-bulb temperature). These parameters determine the tower size.',
      standard_ref: 'CTI STD-201 (Cooling Technology Institute)',
      formula_display: [
        'Range = T_hot_in − T_cold_out  (°C)',
        'Approach = T_cold_out − T_wb   (°C)',
        'Q_tower = ṁ_water × cp × Range',
        'Evaporation ≈ 0.7–1.0% of circulation for each 5.5°C range',
      ],
      inputs: [
        { name: 'heat_rejection_kw', label: 'Total Heat Rejection',    unit: 'kW',  type: 'number', min: 1, max: 100000, default: 500, required: true, help: 'Total heat to reject (chiller condenser + compressor heat = Q_cooling × (1 + 1/COP))' },
        { name: 't_hot_in_c',        label: 'Hot Water Inlet (from chiller)', unit: '°C', type: 'number', min: 20, max: 60, default: 35, required: true, help: 'Condenser water entering the tower (typical 35°C)' },
        { name: 't_cold_out_c',      label: 'Cold Water Outlet (to chiller)', unit: '°C', type: 'number', min: 15, max: 50, default: 29, required: true, help: 'Condenser water leaving the tower to chiller (typical 29°C)' },
        { name: 't_wb_c',            label: 'Design Wet-Bulb Temperature', unit: '°C', type: 'number', min: 10, max: 35, default: 25, required: true, help: 'Local summer design wet-bulb temperature (from ASHRAE App. DE or meteorological data)' },
      ],
      outputs: [
        { name: 'range_c',         label: 'Tower Range',              unit: '°C',   precision: 1 },
        { name: 'approach_c',      label: 'Tower Approach',           unit: '°C',   precision: 1 },
        { name: 'water_flow_m3h',  label: 'Cooling Water Flow Rate',  unit: 'm³/h', precision: 1 },
        { name: 'evap_loss_m3h',   label: 'Evaporation Loss',         unit: 'm³/h', precision: 2 },
      ],
      calculate(inp) {
        const Q = +inp.heat_rejection_kw;
        const range = +inp.t_hot_in_c - +inp.t_cold_out_c;
        const approach = +inp.t_cold_out_c - +inp.t_wb_c;
        const m = Q*1000 / (4186 * range); // kg/s
        const m3h = m * 3.6;
        const evap = m3h * 0.0018 * range; // 0.18% per °C range
        return { range_c: Math.round(range*10)/10, approach_c: Math.round(approach*10)/10, water_flow_m3h: Math.round(m3h*10)/10, evap_loss_m3h: Math.round(evap*100)/100 };
      }
    }
  ]
};

export const MECHANICAL_PIPELINES: EngineeringPipeline[] = [
  pumpSizing,
  fanSizing,
  pipePressureDrop,
  heatExchangerLmtd,
  compressedAir,
  npshCheck,
  coolingTower,
];
