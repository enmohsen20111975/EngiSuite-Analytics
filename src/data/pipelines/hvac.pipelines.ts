import type { EngineeringPipeline } from '../engineeringPipelines';

// ── HVAC Heating Load ─────────────────────────────────────────────────────────
export const hvacHeatingLoad: EngineeringPipeline = {
  id: 'hvac-heating-load',
  name: 'HVAC Heating Load Calculation',
  description: 'Calculate the design heating load for a building: fabric heat losses through walls, roof, glazing, and floor, plus ventilation heat loss to size the heating system.',
  domain: 'hvac', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🔥',
  steps: [
    {
      stepNumber: 1, name: 'Fabric Heat Losses',
      description: 'Calculate steady-state heat losses through the building envelope elements using the U-value method. This is the dominant heat loss in well-insulated buildings.',
      standard_ref: 'EN ISO 13790 / CIBSE Guide A',
      formula_display: [
        'Q_fabric = Σ(U × A × ΔT)',
        'ΔT = T_indoor − T_outdoor (design temperature difference)',
        'Typical U-values (W/m²K): modern wall 0.18–0.30, flat roof 0.13–0.25, glazing 1.0–2.8',
        'Include all oriented surfaces; use worst-case exposure',
      ],
      inputs: [
        { name: 'wall_area_m2',  label: 'External Wall Area',  unit: 'm²', type: 'number', min: 0, max: 50000, default: 250,  required: true, help: 'Total external wall area (exclude window/door openings)' },
        { name: 'u_wall',        label: 'Wall U-value',        unit: 'W/m²K', type: 'number', min: 0.1, max: 3, default: 0.25, required: true, help: 'Wall thermal transmittance (lower = better insulated)' },
        { name: 'roof_area_m2',  label: 'Roof Area',           unit: 'm²', type: 'number', min: 0, max: 20000, default: 100,  required: true, help: 'Total roof area exposed to outside' },
        { name: 'u_roof',        label: 'Roof U-value',        unit: 'W/m²K', type: 'number', min: 0.05, max: 2, default: 0.18, required: true, help: 'Roof thermal transmittance' },
        { name: 'glazing_area_m2',label: 'Glazing Area',       unit: 'm²', type: 'number', min: 0, max: 5000, default: 50,   required: true, help: 'Total window/glazing area' },
        { name: 'u_glazing',     label: 'Glazing U-value',     unit: 'W/m²K', type: 'number', min: 0.5, max: 5, default: 1.6, required: true, help: 'Window system thermal transmittance (triple: ~0.7, double Low-E: ~1.2, standard double: ~2.8 W/m²K)' },
        { name: 't_indoor',      label: 'Indoor Design Temperature', unit: '°C', type: 'number', min: 15, max: 30, default: 21, required: true, help: 'Indoor set-point temperature (office/residential: 21°C; warehouse: 15°C)' },
        { name: 't_outdoor',     label: 'Outdoor Design Temperature', unit: '°C', type: 'number', min: -30, max: 10, default: -2, required: true, help: 'Winter outdoor design temperature (from meteorological data, typically 99% or 99.6% annual exceedance)' },
      ],
      outputs: [
        { name: 'delta_t',       label: 'Design ΔT',           unit: '°C', precision: 1 },
        { name: 'q_wall_kw',     label: 'Wall Heat Loss',      unit: 'kW', precision: 2 },
        { name: 'q_roof_kw',     label: 'Roof Heat Loss',      unit: 'kW', precision: 2 },
        { name: 'q_glazing_kw',  label: 'Glazing Heat Loss',   unit: 'kW', precision: 2 },
        { name: 'q_fabric_kw',   label: 'Total Fabric Loss',   unit: 'kW', precision: 2 },
      ],
      calculate(inp) {
        const dT = +inp.t_indoor - +inp.t_outdoor;
        const Qwall = +inp.u_wall * +inp.wall_area_m2 * dT / 1000;
        const Qroof = +inp.u_roof * +inp.roof_area_m2 * dT / 1000;
        const Qglaz = +inp.u_glazing * +inp.glazing_area_m2 * dT / 1000;
        return { delta_t: Math.round(dT*10)/10, q_wall_kw: Math.round(Qwall*100)/100, q_roof_kw: Math.round(Qroof*100)/100, q_glazing_kw: Math.round(Qglaz*100)/100, q_fabric_kw: Math.round((Qwall+Qroof+Qglaz)*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Ventilation Heat Loss & Boiler Sizing',
      description: 'Calculate ventilation/infiltration heat loss and total design load. Select boiler/heat pump capacity with appropriate margin.',
      standard_ref: 'CIBSE Guide A Ch.5 / EN 12831-1',
      formula_display: [
        'Q_vent = ρ cp × Q_air × ΔT',
        'Q_air = N_ach × Volume / 3600   (m³/s from air changes)',
        'Q_total = (Q_fabric + Q_vent) × 1.25   [25% margin]',
        'ρ_air × cp = 1200 J/m³K  (at standard conditions)',
      ],
      inputs: [
        { name: 'q_fabric_kw',  label: 'Total Fabric Heat Loss', unit: 'kW', type: 'number', min: 0, max: 10000, required: true, help: 'From Step 1', fromPreviousStep: 'q_fabric_kw' },
        { name: 'delta_t',      label: 'Design ΔT',              unit: '°C', type: 'number', min: 1, max: 60,    required: true, help: 'From Step 1', fromPreviousStep: 'delta_t' },
        { name: 'floor_area_m2',label: 'Floor Area',             unit: 'm²', type: 'number', min: 10, max: 50000, default: 100, required: true, help: 'Total heated floor area' },
        { name: 'floor_height_m',label: 'Average Floor Height',  unit: 'm',  type: 'number', min: 2, max: 8,     default: 3.0,  required: true, help: 'Average ceiling height' },
        { name: 'air_changes_h', label: 'Air Change Rate',       unit: 'ACH', type: 'number', min: 0.1, max: 10, default: 0.5,  required: true, help: 'Ventilation air changes per hour: residential 0.3–0.5; office 1.0–2.0; factory 2–5 ACH' },
      ],
      outputs: [
        { name: 'q_vent_kw',    label: 'Ventilation Heat Loss', unit: 'kW', precision: 2 },
        { name: 'q_total_kw',   label: 'Total Design Load',     unit: 'kW', precision: 2 },
        { name: 'boiler_kw',    label: 'Recommended Boiler Size', unit: 'kW', precision: 0 },
      ],
      calculate(inp) {
        const volume = +inp.floor_area_m2 * +inp.floor_height_m;
        const Q_air = +inp.air_changes_h * volume / 3600;
        const Qvent = 1200 * Q_air * +inp.delta_t / 1000;
        const Qtotal = (+inp.q_fabric_kw + Qvent) * 1.25;
        const STD = [5,6,8,10,12,15,18,20,25,30,40,50,60,75,100,150,200,250,300,400,500];
        const boiler = STD.find(s => s >= Qtotal) ?? 500;
        return { q_vent_kw: Math.round(Qvent*100)/100, q_total_kw: Math.round(Qtotal*100)/100, boiler_kw: boiler };
      }
    }
  ]
};

// ── AHU Selection ─────────────────────────────────────────────────────────────
export const ahuSelection: EngineeringPipeline = {
  id: 'ahu-selection',
  name: 'Air Handling Unit (AHU) Selection',
  description: 'Select an air handling unit: calculate coil capacity, supply air flow, and determine heating/cooling coil load and fan duty.',
  domain: 'hvac', difficulty: 'intermediate', estimated_time: '10-12 min', icon: '🌬️',
  steps: [
    {
      stepNumber: 1, name: 'Supply Air Conditions',
      description: 'Define the supply air state and calculate the coil duties based on room conditions and ventilation requirements.',
      standard_ref: 'ASHRAE 62.1 / CIBSE Guide B',
      formula_display: [
        'Cooling coil: Q_cc = ṁ_air × (h_mixed − h_supply)',
        'Heating coil: Q_hc = ṁ_air × cp × (T_supply − T_after_cc)',
        'ṁ_air = Q_design_m3s × ρ_air',
        'Mixed air: T_mix = (T_outside × r_fresh + T_return × (1−r_fresh))',
      ],
      inputs: [
        { name: 'q_air_m3h',    label: 'Total Supply Air Flow', unit: 'm³/h', type: 'number', min: 100, max: 500000, default: 10000, required: true, help: 'Total supply air volume flow to served zones' },
        { name: 'fresh_air_pct',label: 'Fresh Air Fraction',    unit: '%',    type: 'number', min: 10, max: 100, default: 30,    required: true, help: 'Percentage of outdoor air in supply (minimum per ASHRAE 62.1 / EN 16798-1)' },
        { name: 't_outside',    label: 'Outdoor Design Temperature', unit: '°C', type: 'number', min: -20, max: 50, default: 35, required: true, help: 'Summer outdoor dry-bulb design temperature' },
        { name: 't_return',     label: 'Room/Return Air Temperature', unit: '°C', type: 'number', min: 18, max: 30, default: 24, required: true, help: 'Room temperature (= return air temperature)' },
        { name: 't_supply',     label: 'Supply Air Temperature', unit: '°C', type: 'number', min: 10, max: 22, default: 16, required: true, help: 'Supply air temperature (typically 14–18°C cooling, 30–40°C heating)' },
      ],
      outputs: [
        { name: 't_mixed',      label: 'Mixed Air Temperature',   unit: '°C', precision: 1 },
        { name: 'mass_flow_kgs',label: 'Air Mass Flow Rate',      unit: 'kg/s', precision: 2 },
        { name: 'q_cc_kw',      label: 'Cooling Coil Duty',       unit: 'kW',  precision: 2 },
        { name: 'q_hc_kw',      label: 'Reheating Coil Duty (if any)', unit: 'kW', precision: 2 },
      ],
      calculate(inp) {
        const Q_m3s = +inp.q_air_m3h / 3600;
        const r = +inp.fresh_air_pct/100;
        const Tmix = +inp.t_outside*r + +inp.t_return*(1-r);
        const m = Q_m3s * 1.2; // kg/s (ρ = 1.2 kg/m³)
        const cp = 1005;
        const Qcc = m * cp * (Tmix - +inp.t_supply) / 1000;
        const Qhc = Math.max(0, m * cp * (+inp.t_supply - +inp.t_return + 2) / 1000); // small reheat
        return { t_mixed: Math.round(Tmix*10)/10, mass_flow_kgs: Math.round(m*100)/100, q_cc_kw: Math.round(Qcc*100)/100, q_hc_kw: Math.round(Qhc*100)/100 };
      }
    }
  ]
};

// ── Chilled Water Pipe Sizing ─────────────────────────────────────────────────
export const chilledWaterPipe: EngineeringPipeline = {
  id: 'chilled-water-pipe-sizing',
  name: 'Chilled Water Pipe Sizing',
  description: 'Size chilled water distribution pipes for HVAC systems: determine flow rate from cooling load, select pipe size, calculate pressure drop, and pump duty.',
  domain: 'hvac', difficulty: 'intermediate', estimated_time: '8-10 min', icon: '❄️',
  steps: [
    {
      stepNumber: 1, name: 'Chilled Water Flow Rate',
      description: 'Calculate the chilled water flow rate required to deliver the cooling load with the design temperature differential (ΔT).',
      standard_ref: 'ASHRAE HVAC Systems & Equipment / CIBSE Guide B4',
      formula_display: [
        'ṁ_chw = Q_cooling / (cp × ΔT)',
        'Q_chw = Q_cooling / (4.18 × ΔT)   (m³/h, Q in kW, ΔT in °C)',
        'ΔT = T_return − T_supply (typically 6–8°C)',
        'Standard: T_supply = 6°C, T_return = 12°C → ΔT = 6°C',
      ],
      inputs: [
        { name: 'cooling_kw',   label: 'Cooling Load',          unit: 'kW',  type: 'number', min: 1, max: 100000, default: 500, required: true, help: 'Total cooling load served by this pipe section' },
        { name: 'chw_supply_t', label: 'Chilled Water Supply Temp', unit: '°C', type: 'number', min: 1, max: 12, default: 6,  required: true, help: 'CHW supply temperature from chiller (typically 6–7°C)' },
        { name: 'chw_return_t', label: 'Chilled Water Return Temp', unit: '°C', type: 'number', min: 8, max: 18, default: 12, required: true, help: 'CHW return temperature (typically 12–14°C)' },
      ],
      outputs: [
        { name: 'dt_c',       label: 'Temperature Differential (ΔT)', unit: '°C', precision: 1 },
        { name: 'flow_m3h',   label: 'Chilled Water Flow Rate',        unit: 'm³/h', precision: 2 },
        { name: 'flow_kg_s',  label: 'Mass Flow Rate',                  unit: 'kg/s', precision: 2 },
      ],
      calculate(inp) {
        const dT = +inp.chw_return_t - +inp.chw_supply_t;
        const m_kg_s = +inp.cooling_kw * 1000 / (4186 * dT);
        const Q_m3h = m_kg_s * 3.6;
        return { dt_c: Math.round(dT*10)/10, flow_m3h: Math.round(Q_m3h*100)/100, flow_kg_s: Math.round(m_kg_s*100)/100 };
      }
    },
    {
      stepNumber: 2, name: 'Pipe Size & Pump Head',
      description: 'Select pipe diameter using recommended velocity (1.0–2.5 m/s for CHW) and calculate index circuit pressure drop for pump sizing.',
      standard_ref: 'CIBSE Guide C (pipe sizing) / ASHRAE 90.1 (pump efficiency)',
      formula_display: [
        'D = √(4Q / πV)   (target V = 1.5–2.0 m/s)',
        'ΔP = f × (L/D) × ρV²/2',
        'Pump head = ΔP_total + allowances for coils, valves, fittings',
        'Pump power = Q × ΔP_pump / η_pump',
      ],
      inputs: [
        { name: 'flow_m3h',       label: 'CHW Flow Rate',      unit: 'm³/h', type: 'number', min: 0.1, max: 50000, required: true, help: 'From Step 1', fromPreviousStep: 'flow_m3h' },
        { name: 'pipe_length_m',  label: 'Index Circuit Length', unit: 'm',   type: 'number', min: 5, max: 2000, default: 100, required: true, help: 'Length of the longest (index) pipe circuit from plant room to furthest coil and back' },
        { name: 'coil_dp_kpa',    label: 'Coil & Valve Pressure Drop', unit: 'kPa', type: 'number', min: 20, max: 200, default: 60, required: true, help: 'Combined pressure drop across AHU coils, control valves, and connections (typically 40–80 kPa)' },
        { name: 'pump_eta',       label: 'Pump Efficiency',    unit: '',     type: 'number', min: 0.4, max: 0.85, default: 0.7, required: true, help: 'Combined pump/motor efficiency at duty point' },
      ],
      outputs: [
        { name: 'pipe_dia_mm',   label: 'Selected Pipe Diameter', unit: 'mm',  precision: 0 },
        { name: 'velocity_ms',   label: 'Flow Velocity',          unit: 'm/s', precision: 2 },
        { name: 'pump_head_kpa', label: 'Pump Total Head',        unit: 'kPa', precision: 1 },
        { name: 'pump_kw',       label: 'Pump Power',             unit: 'kW',  precision: 2 },
      ],
      calculate(inp) {
        const Q_m3s = +inp.flow_m3h / 3600;
        const Vtarget = 1.8;
        const D_calc = Math.sqrt(4*Q_m3s/(Math.PI*Vtarget));
        const STD = [25,32,40,50,65,80,100,125,150,200,250,300];
        const D_mm = STD.find(s => s/1000 >= D_calc) ?? 300;
        const D = D_mm/1000;
        const V = 4*Q_m3s/(Math.PI*D*D);
        const Re = V*D/1.004e-6; // water at 6°C
        const e_D = 0.046e-3/D;
        const f = 0.25/Math.pow(Math.log10(e_D/3.7+5.74/Math.pow(Re,0.9)),2);
        const dp_pipe = f*(+inp.pipe_length_m/D)*1000*V*V/2/1000*1.3; // 30% fittings
        const pump_head = dp_pipe + +inp.coil_dp_kpa;
        const pump_kw = Q_m3s * pump_head*1000 / +inp.pump_eta / 1000;
        return { pipe_dia_mm: D_mm, velocity_ms: Math.round(V*100)/100, pump_head_kpa: Math.round(pump_head*10)/10, pump_kw: Math.round(pump_kw*100)/100 };
      }
    }
  ]
};

export const HVAC_PIPELINES: EngineeringPipeline[] = [
  hvacHeatingLoad,
  ahuSelection,
  chilledWaterPipe,
];
