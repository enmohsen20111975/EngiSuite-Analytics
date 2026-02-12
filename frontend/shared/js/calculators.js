// Calculator Service
class CalculatorService {
    constructor() {
        this.baseUrl = '';
    }

    async calculate(type, inputs) {
        try {
            const response = await fetch(`${this.baseUrl}/calculators/${type}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ inputs })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Calculation failed');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Calculation error:', error);
            throw error;
        }
    }

    async getCalculatorsByCategory(category) {
        try {
            const response = await fetch(`${this.baseUrl}/calculators/${category}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get calculators');
            }

            const result = await response.json();
            return result.calculators;
        } catch (error) {
            console.error('Get calculators error:', error);
            throw error;
        }
    }
}

// Initialize calculator service
const calculatorService = new CalculatorService();

const CATEGORY_META = {
    electrical: { icon: 'fa-bolt', color: '#f39c12' },
    mechanical: { icon: 'fa-cog', color: '#3498db' },
    civil: { icon: 'fa-building', color: '#2ecc71' }
};

let calculationsCatalog = null;
let calculationsByCategory = null;

async function loadCalculationsCatalog() {
    try {
        console.log('loadCalculationsCatalog: Starting...');
        // First, check if we need to initialize the database
        const initResponse = await fetch('/calculators/init');
        if (initResponse.ok) {
            const initResult = await initResponse.json();
            console.log(`Calculations initialized: ${initResult.count} items`);
        }

        // Load calculations from API
        const response = await fetch('/calculators/');
        console.log('loadCalculationsCatalog: Fetch /calculators/ response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('loadCalculationsCatalog: Received data keys:', Object.keys(data));
            console.log('loadCalculationsCatalog: Data structure:', data);

            // Flatten and format calculations
            let allCalculations = [];
            ['electrical', 'mechanical', 'civil'].forEach(domain => {
                if (data[domain]) {
                    console.log(`loadCalculationsCatalog: Processing ${domain}, found ${data[domain].length} items`);
                    data[domain].forEach(calc => {
                        const meta = CATEGORY_META[domain] || CATEGORY_META.civil;
                        allCalculations.push({
                            id: calc.id,
                            name: calc.name,
                            description: calc.equation,
                            equation: calc.equation,
                            category: domain,
                            icon: meta.icon,
                            color: meta.color
                        });
                    });
                }
            });

            calculationsCatalog = allCalculations;
            console.log('loadCalculationsCatalog: Set calculationsCatalog to', calculationsCatalog.length, 'items');

            // Load categorized calculations
            const categoriesResponse = await fetch('/calculators/electrical');
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                calculationsByCategory = {
                    electrical: categoriesData.categories
                };
            }

            // Load mechanical and civil categories
            const mechanicalResponse = await fetch('/calculators/mechanical');
            if (mechanicalResponse.ok) {
                const mechanicalData = await mechanicalResponse.json();
                calculationsByCategory.mechanical = mechanicalData.categories;
            }

            const civilResponse = await fetch('/calculators/civil');
            if (civilResponse.ok) {
                const civilData = await civilResponse.json();
                calculationsByCategory.civil = civilData.categories;
            }

            console.log('Calculations loaded from API:', calculationsCatalog.length);
        }
    } catch (error) {
        console.warn('Falling back to built-in calculators list:', error);
    }
}

function getCatalog() {
    return calculationsCatalog || calculators;
}

function resolveCalcName(calc) {
    if (calc.nameKey) {
        const translated = i18n.getTranslation(calc.nameKey);
        if (translated && translated !== calc.nameKey) return translated;
    }
    return calc.name || 'Calculator';
}

function resolveCalcDescription(calc) {
    if (calc.descriptionKey) {
        const translated = i18n.getTranslation(calc.descriptionKey);
        if (translated && translated !== calc.descriptionKey) return translated;
    }
    return calc.description || calc.equation || '';
}

// Calculator data structure for visual workflow
const Calculators = {
    modules: {
        electrical: {
            icon: '⚡',
            name: 'Electrical',
            calculators: {
                loadCalculation: { key: 'loadCalculation', nameKey: 'calc.electrical.load.title', desc: 'Calculate electrical load based on power and voltage' },
                cableSizing: { key: 'cableSizing', nameKey: 'calc.electrical.cableSizing.title', desc: 'Size electrical cables based on load and length' },
                transformerSizing: { key: 'transformerSizing', nameKey: 'calc.electrical.transformerSizing.title', desc: 'Determine transformer size for your load' },
                voltageDrop: { key: 'voltageDrop', nameKey: 'calc.electrical.voltageDrop.title', desc: 'Analyze voltage drop in power lines' },
                shortCircuit: { key: 'shortCircuit', nameKey: 'calc.electrical.shortCircuit.title', desc: 'Calculate short circuit current levels' },
                breakerSelection: { key: 'breakerSelection', nameKey: 'calc.electrical.breakerSelection.title', desc: 'Select appropriate circuit breakers' },
                powerFactor: { key: 'powerFactor', nameKey: 'calc.electrical.powerFactor.title', desc: 'Correct electrical power factor' },
                generatorSizing: { key: 'generatorSizing', nameKey: 'calc.electrical.generatorSizing.title', desc: 'Size generators based on demand' },
                earthing: { key: 'earthing', nameKey: 'calc.electrical.earthing.title', desc: 'Size earthing conductors for safety' },
                busbar: { key: 'busbar', nameKey: 'calc.electrical.busbar.title', desc: 'Determine busbar size for current rating' }
            }
        },
        mechanical: {
            icon: '⚙️',
            name: 'Mechanical',
            calculators: {
                hvac: { key: 'hvac', nameKey: 'calc.mechanical.hvac.title', desc: 'Calculate thermal load for HVAC systems' },
                pumpSizing: { key: 'pumpSizing', nameKey: 'calc.mechanical.pump.title', desc: 'Size pumps based on flow and head' },
                pipeSizing: { key: 'pipeSizing', nameKey: 'calc.mechanical.pipe.title', desc: 'Size pipes based on flow and velocity' },
                chiller: { key: 'chiller', nameKey: 'calc.mechanical.chiller.title', desc: 'Select chiller capacity based on load' },
                duct: { key: 'duct', nameKey: 'calc.mechanical.duct.title', desc: 'Determine duct sizes for airflow' },
                heatTransfer: { key: 'heatTransfer', nameKey: 'calc.mechanical.heatTransfer.title', desc: 'Analyze heat transfer performance' },
                pipeFriction: { key: 'pipeFriction', nameKey: 'calc.mechanical.pipeFriction.title', desc: 'Estimate pressure losses due to friction' },
                coolingTower: { key: 'coolingTower', nameKey: 'calc.mechanical.coolingTower.title', desc: 'Size cooling towers for thermal rejection' },
                fanSelection: { key: 'fanSelection', nameKey: 'calc.mechanical.fanSelection.title', desc: 'Select fans for required airflow' },
                compressor: { key: 'compressor', nameKey: 'calc.mechanical.compressor.title', desc: 'Size compressors based on system needs' },
                psychrometrics: { key: 'psychrometrics', nameKey: 'calc.mechanical.psychrometrics.title', desc: 'Analyze air properties and processes' },
                stressStrain: { key: 'stressStrain', nameKey: 'calc.mechanical.stressStrain.title', desc: 'Analyze stress and strain behavior' },
                bearingSelection: { key: 'bearingSelection', nameKey: 'calc.mechanical.bearingSelection.title', desc: 'Select bearings for mechanical loads' }
            }
        },
        civil: {
            icon: '🏗️',
            name: 'Civil',
            calculators: {
                concreteVolume: { key: 'concreteVolume', nameKey: 'calc.civil.concrete.title', desc: 'Calculate concrete volume for projects' },
                steelWeight: { key: 'steelWeight', nameKey: 'calc.civil.steel.title', desc: 'Calculate steel weight based on dimensions' },
                beamLoad: { key: 'beamLoad', nameKey: 'calc.civil.beamLoad.title', desc: 'Analyze beam load conditions' },
                columnDesign: { key: 'columnDesign', nameKey: 'calc.civil.columnDesign.title', desc: 'Design columns based on loads' },
                foundationArea: { key: 'foundationArea', nameKey: 'calc.civil.foundationArea.title', desc: 'Calculate foundation area requirements' },
                earthwork: { key: 'earthwork', nameKey: 'calc.civil.earthwork.title', desc: 'Estimate earthwork excavation volumes' },
                retainingWall: { key: 'retainingWall', nameKey: 'calc.civil.retainingWall.title', desc: 'Analyze retaining wall pressures' },
                seismicLoad: { key: 'seismicLoad', nameKey: 'calc.civil.seismic.title', desc: 'Evaluate seismic loading' },
                windLoad: { key: 'windLoad', nameKey: 'calc.civil.wind.title', desc: 'Assess wind loading' },
                pileFoundation: { key: 'pileFoundation', nameKey: 'calc.civil.pileFoundation.title', desc: 'Design pile foundations' },
                barBending: { key: 'barBending', nameKey: 'calc.civil.barBending.title', desc: 'Generate bar bending schedules' },
                cantilever: { key: 'cantilever', nameKey: 'calc.civil.cantilever.title', desc: 'Analyze cantilever beam behavior' },
                deflection: { key: 'deflection', nameKey: 'calc.civil.deflection.title', desc: 'Check deflection limits' },
                soilBearing: { key: 'soilBearing', nameKey: 'calc.civil.soilBearing.title', desc: 'Estimate soil bearing capacity' },
                thermalExpansion: { key: 'thermalExpansion', nameKey: 'calc.civil.thermalExpansion.title', desc: 'Analyze thermal expansion effects' }
            }
        }
    }
};

// Calculator data array for grid display
const calculators = [
    // Electrical Calculators (12)
    { id: 'electrical_load_calculation', nameKey: 'calc.electrical.load.title', descriptionKey: 'calc.electrical.load.desc', category: 'electrical', icon: 'fa-bolt', color: '#f39c12' },
    { id: 'electrical_cable_sizing', nameKey: 'calc.electrical.cableSizing.title', descriptionKey: 'calc.electrical.cableSizing.desc', category: 'electrical', icon: 'fa-plug', color: '#f39c12' },
    { id: 'electrical_transformer_sizing', nameKey: 'calc.electrical.transformerSizing.title', descriptionKey: 'calc.electrical.transformerSizing.desc', category: 'electrical', icon: 'fa-sync-alt', color: '#f39c12' },
    { id: 'electrical_voltage_drop', nameKey: 'calc.electrical.voltageDrop.title', descriptionKey: 'calc.electrical.voltageDrop.desc', category: 'electrical', icon: 'fa-bolt', color: '#f39c12' },
    { id: 'electrical_short_circuit', nameKey: 'calc.electrical.shortCircuit.title', descriptionKey: 'calc.electrical.shortCircuit.desc', category: 'electrical', icon: 'fa-bolt', color: '#f39c12' },
    { id: 'electrical_breaker_selection', nameKey: 'calc.electrical.breakerSelection.title', descriptionKey: 'calc.electrical.breakerSelection.desc', category: 'electrical', icon: 'fa-power-off', color: '#f39c12' },
    { id: 'electrical_power_factor_correction', nameKey: 'calc.electrical.powerFactor.title', descriptionKey: 'calc.electrical.powerFactor.desc', category: 'electrical', icon: 'fa-chart-line', color: '#f39c12' },
    { id: 'electrical_generator_sizing', nameKey: 'calc.electrical.generatorSizing.title', descriptionKey: 'calc.electrical.generatorSizing.desc', category: 'electrical', icon: 'fa-microchip', color: '#f39c12' },
    { id: 'electrical_earthing_conductor', nameKey: 'calc.electrical.earthing.title', descriptionKey: 'calc.electrical.earthing.desc', category: 'electrical', icon: 'fa-project-diagram', color: '#f39c12' },
    { id: 'electrical_busbar_sizing', nameKey: 'calc.electrical.busbar.title', descriptionKey: 'calc.electrical.busbar.desc', category: 'electrical', icon: 'fa-project-diagram', color: '#f39c12' },

    // Mechanical Calculators (13)
    { id: 'mechanical_hvac_load', nameKey: 'calc.mechanical.hvac.title', descriptionKey: 'calc.mechanical.hvac.desc', category: 'mechanical', icon: 'fa-wind', color: '#3498db' },
    { id: 'mechanical_pump_sizing', nameKey: 'calc.mechanical.pump.title', descriptionKey: 'calc.mechanical.pump.desc', category: 'mechanical', icon: 'fa-water', color: '#3498db' },
    { id: 'mechanical_pipe_sizing', nameKey: 'calc.mechanical.pipe.title', descriptionKey: 'calc.mechanical.pipe.desc', category: 'mechanical', icon: 'fa-water', color: '#3498db' },
    { id: 'mechanical_chiller_selection', nameKey: 'calc.mechanical.chiller.title', descriptionKey: 'calc.mechanical.chiller.desc', category: 'mechanical', icon: 'fa-snowflake', color: '#3498db' },
    { id: 'mechanical_duct_sizing', nameKey: 'calc.mechanical.duct.title', descriptionKey: 'calc.mechanical.duct.desc', category: 'mechanical', icon: 'fa-fan', color: '#3498db' },
    { id: 'mechanical_heat_transfer', nameKey: 'calc.mechanical.heatTransfer.title', descriptionKey: 'calc.mechanical.heatTransfer.desc', category: 'mechanical', icon: 'fa-thermometer-half', color: '#3498db' },
    { id: 'mechanical_pipe_friction', nameKey: 'calc.mechanical.pipeFriction.title', descriptionKey: 'calc.mechanical.pipeFriction.desc', category: 'mechanical', icon: 'fa-water', color: '#3498db' },
    { id: 'mechanical_cooling_tower_sizing', nameKey: 'calc.mechanical.coolingTower.title', descriptionKey: 'calc.mechanical.coolingTower.desc', category: 'mechanical', icon: 'fa-building', color: '#3498db' },
    { id: 'mechanical_fan_selection', nameKey: 'calc.mechanical.fanSelection.title', descriptionKey: 'calc.mechanical.fanSelection.desc', category: 'mechanical', icon: 'fa-wind', color: '#3498db' },
    { id: 'mechanical_compressor_sizing', nameKey: 'calc.mechanical.compressor.title', descriptionKey: 'calc.mechanical.compressor.desc', category: 'mechanical', icon: 'fa-compress', color: '#3498db' },
    { id: 'mechanical_psychrometrics', nameKey: 'calc.mechanical.psychrometrics.title', descriptionKey: 'calc.mechanical.psychrometrics.desc', category: 'mechanical', icon: 'fa-vial', color: '#3498db' },
    { id: 'mechanical_stress_strain_analysis', nameKey: 'calc.mechanical.stressStrain.title', descriptionKey: 'calc.mechanical.stressStrain.desc', category: 'mechanical', icon: 'fa-weight-hanging', color: '#3498db' },
    { id: 'mechanical_bearing_selection', nameKey: 'calc.mechanical.bearingSelection.title', descriptionKey: 'calc.mechanical.bearingSelection.desc', category: 'mechanical', icon: 'fa-cog', color: '#3498db' },

    // Civil Calculators (15)
    { id: 'civil_concrete_volume', nameKey: 'calc.civil.concrete.title', descriptionKey: 'calc.civil.concrete.desc', category: 'civil', icon: 'fa-cube', color: '#2ecc71' },
    { id: 'civil_steel_weight', nameKey: 'calc.civil.steel.title', descriptionKey: 'calc.civil.steel.desc', category: 'civil', icon: 'fa-drafting-compass', color: '#2ecc71' },
    { id: 'civil_beam_load', nameKey: 'calc.civil.beamLoad.title', descriptionKey: 'calc.civil.beamLoad.desc', category: 'civil', icon: 'fa-ruler-combined', color: '#2ecc71' },
    { id: 'civil_column_design', nameKey: 'calc.civil.columnDesign.title', descriptionKey: 'calc.civil.columnDesign.desc', category: 'civil', icon: 'fa-columns', color: '#2ecc71' },
    { id: 'civil_foundation_area', nameKey: 'calc.civil.foundationArea.title', descriptionKey: 'calc.civil.foundationArea.desc', category: 'civil', icon: 'fa-building', color: '#2ecc71' },
    { id: 'civil_earthwork_volume', nameKey: 'calc.civil.earthwork.title', descriptionKey: 'calc.civil.earthwork.desc', category: 'civil', icon: 'fa-shovel', color: '#2ecc71' },
    { id: 'civil_retaining_wall_pressure', nameKey: 'calc.civil.retainingWall.title', descriptionKey: 'calc.civil.retainingWall.desc', category: 'civil', icon: 'fa-building', color: '#2ecc71' },
    { id: 'civil_seismic_load', nameKey: 'calc.civil.seismic.title', descriptionKey: 'calc.civil.seismic.desc', category: 'civil', icon: 'fa-building', color: '#2ecc71' },
    { id: 'civil_wind_load', nameKey: 'calc.civil.wind.title', descriptionKey: 'calc.civil.wind.desc', category: 'civil', icon: 'fa-wind', color: '#2ecc71' },
    { id: 'civil_pile_foundation', nameKey: 'calc.civil.pileFoundation.title', descriptionKey: 'calc.civil.pileFoundation.desc', category: 'civil', icon: 'fa-pencil-ruler', color: '#2ecc71' },
    { id: 'civil_bar_bending_schedule', nameKey: 'calc.civil.barBending.title', descriptionKey: 'calc.civil.barBending.desc', category: 'civil', icon: 'fa-sitemap', color: '#2ecc71' },
    { id: 'civil_cantilever_beam', nameKey: 'calc.civil.cantilever.title', descriptionKey: 'calc.civil.cantilever.desc', category: 'civil', icon: 'fa-ruler', color: '#2ecc71' },
    { id: 'civil_deflection_check', nameKey: 'calc.civil.deflection.title', descriptionKey: 'calc.civil.deflection.desc', category: 'civil', icon: 'fa-arrows-alt-h', color: '#2ecc71' },
    { id: 'civil_soil_bearing_capacity', nameKey: 'calc.civil.soilBearing.title', descriptionKey: 'calc.civil.soilBearing.desc', category: 'civil', icon: 'fa-mountain', color: '#2ecc71' },
    { id: 'civil_thermal_expansion', nameKey: 'calc.civil.thermalExpansion.title', descriptionKey: 'calc.civil.thermalExpansion.desc', category: 'civil', icon: 'fa-temperature-high', color: '#2ecc71' }
];

// DOM Elements
const calculatorGrid = document.getElementById('calculatorGrid');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');

// Initialize calculators
async function initializeCalculators() {
    if (!calculatorGrid || !searchInput || !filterTabs.length) {
        return;
    }
    await loadCalculationsCatalog();
    renderCalculators('all');

    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', (event) => {
            i18n.setLanguage(event.target.value);
        });
    }

    // Filter tabs event listeners
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            // Render calculators for selected category
            const category = this.dataset.category;
            renderCalculators(category);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-tab.active').dataset.category;
        renderCalculators(activeCategory, searchTerm);
    });

    document.addEventListener('i18n:changed', () => {
        const activeCategory = document.querySelector('.filter-tab.active').dataset.category;
        renderCalculators(activeCategory, searchInput.value.toLowerCase());
    });
}

// Render calculators
function renderCalculators(category, searchTerm = '') {
    const grid = document.getElementById('calculatorGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const catalog = getCatalog();

    const filteredCalculators = catalog.filter(calc => {
        const matchesCategory = category === 'all' || calc.category === category;
        const name = resolveCalcName(calc);
        const description = resolveCalcDescription(calc);
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredCalculators.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                <i class="fas fa-search text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-slate-900">No calculators found</h3>
            <p class="text-slate-500 mt-1">Try adjusting your search or filters.</p>
        </div>`;
        return;
    }

    filteredCalculators.forEach(calc => {
        const name = resolveCalcName(calc);
        const desc = resolveCalcDescription(calc);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full';
        card.onclick = () => viewCalculatorInfo(calc.id);

        // Icon with category color
        const iconColor = calc.color || '#3b82f6';
        const iconBg = iconColor + '15'; // 10% opacity

        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-300" style="background-color: ${iconBg}; color: ${iconColor}">
                    <i class="fas ${calc.icon || 'fa-calculator'}"></i>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                    ${_esc(calc.category)}
                </span>
            </div>
            
            <h3 class="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1" title="${_esc(name)}">
                ${_esc(name)}
            </h3>
            
            <p class="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                ${_esc(desc)}
            </p>
            
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                <button class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2" onclick="event.stopPropagation(); openCalculator('${calc.id}')">
                    <i class="fas fa-play text-xs"></i> <span>${i18n.getTranslation('calculators.actions.open')}</span>
                </button>
                <button class="text-slate-400 hover:text-slate-600 transition-colors" title="${i18n.getTranslation('calculators.actions.info')}" onclick="event.stopPropagation(); viewCalculatorInfo('${calc.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Helper function for escaping HTML to prevent XSS
function _esc(str) {
    if (typeof str !== 'string') return str;
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ---- Calculator Field Definitions ----
// Maps calculator IDs to their input fields for the execution modal
const CALC_FIELDS = {
    // Electrical
    electrical_load_calculation: {
        fields: [
            { name: 'connected_load', label: 'Connected Load', unit: 'kW', type: 'number', required: true },
            { name: 'demand_factor', label: 'Demand Factor', unit: '', type: 'number', default: 0.8 },
            { name: 'diversity_factor', label: 'Diversity Factor', unit: '', type: 'number', default: 0.85 },
            { name: 'system_type', label: 'System Type', type: 'select', options: [{ v: '3phase', l: '3 Phase' }, { v: '1phase', l: '1 Phase' }], default: '3phase' },
            { name: 'voltage', label: 'Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.85 }
        ]
    },
    electrical_cable_sizing: {
        fields: [
            { name: 'design_current', label: 'Design Current', unit: 'A', type: 'number', required: true },
            { name: 'length', label: 'Cable Length', unit: 'm', type: 'number', required: true },
            { name: 'voltage_system', label: 'System Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'standard', label: 'Standard', type: 'select', options: [{ v: 'IEC', l: 'IEC 60364' }, { v: 'NEC', l: 'NEC 310' }, { v: 'BS7671', l: 'BS 7671' }, { v: 'AS3000', l: 'AS/NZS 3000' }], default: 'IEC' },
            { name: 'circuit_type', label: 'Circuit Type', type: 'select', options: [{ v: 'power', l: 'Power' }, { v: 'lighting', l: 'Lighting' }], default: 'power' },
            { name: 'install_method', label: 'Installation', type: 'select', options: [{ v: 'conduit', l: 'Conduit' }, { v: 'cableTray', l: 'Cable Tray' }, { v: 'directBuried', l: 'Direct Buried' }, { v: 'openAir', l: 'Open Air' }], default: 'conduit' },
            { name: 'material', label: 'Material', type: 'select', options: [{ v: 'copper', l: 'Copper' }, { v: 'aluminum', l: 'Aluminum' }], default: 'copper' },
            { name: 'ambient_temp', label: 'Ambient Temp', unit: '\u00B0C', type: 'number', default: 40 },
            { name: 'grouping_factor', label: 'Grouping Factor', unit: '', type: 'number', default: 1.0 }
        ]
    },
    electrical_transformer_sizing: {
        fields: [
            { name: 'connected_load', label: 'Connected Load', unit: 'kW', type: 'number', required: true },
            { name: 'demand_factor', label: 'Demand Factor', unit: '', type: 'number', default: 0.8 },
            { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.85 },
            { name: 'growth_factor', label: 'Growth Factor', unit: '%', type: 'number', default: 20 },
            { name: 'primary_voltage', label: 'Primary Voltage', unit: 'V', type: 'number', default: 11000 },
            { name: 'secondary_voltage', label: 'Secondary Voltage', unit: 'V', type: 'number', default: 400 }
        ]
    },
    electrical_voltage_drop: {
        fields: [
            { name: 'current', label: 'Current', unit: 'A', type: 'number', required: true },
            { name: 'length', label: 'Cable Length', unit: 'm', type: 'number', required: true },
            { name: 'cable_size', label: 'Cable Size', unit: 'mm\u00B2', type: 'number', required: true },
            { name: 'voltage', label: 'System Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.85 },
            { name: 'material', label: 'Material', type: 'select', options: [{ v: 'copper', l: 'Copper' }, { v: 'aluminum', l: 'Aluminum' }], default: 'copper' }
        ]
    },
    electrical_short_circuit: {
        fields: [
            { name: 'voltage', label: 'System Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'transformer_kva', label: 'Transformer kVA', unit: 'kVA', type: 'number', required: true },
            { name: 'impedance', label: 'Impedance', unit: '%', type: 'number', default: 5.0 },
            { name: 'cable_length', label: 'Cable Length', unit: 'm', type: 'number', default: 0 },
            { name: 'cable_size', label: 'Cable Size', unit: 'mm\u00B2', type: 'number', default: 50 }
        ]
    },
    electrical_power_factor_correction: {
        fields: [
            { name: 'active_power', label: 'Active Power', unit: 'kW', type: 'number', required: true },
            { name: 'current_pf', label: 'Current PF', unit: '', type: 'number', default: 0.7 },
            { name: 'target_pf', label: 'Target PF', unit: '', type: 'number', default: 0.95 },
            { name: 'voltage', label: 'Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'frequency', label: 'Frequency', unit: 'Hz', type: 'number', default: 50 }
        ]
    },
    electrical_busbar_sizing: {
        fields: [
            { name: 'current', label: 'Design Current', unit: 'A', type: 'number', required: true },
            { name: 'voltage', label: 'Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'material', label: 'Material', type: 'select', options: [{ v: 'copper', l: 'Copper' }, { v: 'aluminum', l: 'Aluminum' }], default: 'copper' }
        ]
    },
    electrical_breaker_selection: {
        fields: [
            { name: 'design_current', label: 'Design Current', unit: 'A', type: 'number', required: true },
            { name: 'short_circuit_current', label: 'Short Circuit Current', unit: 'kA', type: 'number', required: true },
            { name: 'voltage', label: 'System Voltage', unit: 'V', type: 'number', default: 400 },
            { name: 'circuit_type', label: 'Circuit Type', type: 'select', options: [{ v: 'motor', l: 'Motor' }, { v: 'lighting', l: 'Lighting' }, { v: 'general', l: 'General' }], default: 'general' }
        ]
    },
    electrical_generator_sizing: {
        fields: [
            { name: 'connected_load', label: 'Connected Load', unit: 'kW', type: 'number', required: true },
            { name: 'demand_factor', label: 'Demand Factor', unit: '', type: 'number', default: 0.8 },
            { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.8 },
            { name: 'motor_load_percent', label: 'Motor Load %', unit: '%', type: 'number', default: 30 },
            { name: 'growth_factor', label: 'Growth Factor', unit: '%', type: 'number', default: 20 }
        ]
    },
    electrical_earthing_conductor: {
        fields: [
            { name: 'fault_current', label: 'Fault Current', unit: 'kA', type: 'number', required: true },
            { name: 'fault_duration', label: 'Fault Duration', unit: 's', type: 'number', default: 1.0 },
            { name: 'material', label: 'Material', type: 'select', options: [{ v: 'copper', l: 'Copper' }, { v: 'steel', l: 'Steel' }], default: 'copper' }
        ]
    },

    // Mechanical
    mechanical_hvac_load: {
        fields: [
            { name: 'length', label: 'Room Length', unit: 'm', type: 'number', required: true },
            { name: 'width', label: 'Room Width', unit: 'm', type: 'number', required: true },
            { name: 'height', label: 'Room Height', unit: 'm', type: 'number', default: 3 },
            { name: 'occupants', label: 'Number of Occupants', unit: '', type: 'number', default: 10 },
            { name: 'climate', label: 'Climate', type: 'select', options: [{ v: 'hot_humid', l: 'Hot & Humid' }, { v: 'hot_dry', l: 'Hot & Dry' }, { v: 'temperate', l: 'Temperate' }, { v: 'cold', l: 'Cold' }], default: 'hot_dry' }
        ]
    },
    mechanical_pump_sizing: {
        fields: [
            { name: 'flow_rate', label: 'Flow Rate', unit: 'm\u00B3/h', type: 'number', required: true },
            { name: 'head', label: 'Total Head', unit: 'm', type: 'number', required: true },
            { name: 'efficiency', label: 'Pump Efficiency', unit: '%', type: 'number', default: 75 },
            { name: 'fluid_density', label: 'Fluid Density', unit: 'kg/m\u00B3', type: 'number', default: 1000 }
        ]
    },
    mechanical_pipe_sizing: {
        fields: [
            { name: 'flow_rate', label: 'Flow Rate', unit: 'm\u00B3/h', type: 'number', required: true },
            { name: 'velocity', label: 'Design Velocity', unit: 'm/s', type: 'number', default: 1.5 },
            { name: 'material', label: 'Pipe Material', type: 'select', options: [{ v: 'steel', l: 'Steel' }, { v: 'copper', l: 'Copper' }, { v: 'pvc', l: 'PVC' }, { v: 'hdpe', l: 'HDPE' }], default: 'steel' }
        ]
    },
    mechanical_duct_sizing: {
        fields: [
            { name: 'airflow', label: 'Airflow', unit: 'CFM', type: 'number', required: true },
            { name: 'velocity', label: 'Design Velocity', unit: 'ft/min', type: 'number', default: 1500 },
            { name: 'duct_type', label: 'Duct Type', type: 'select', options: [{ v: 'rectangular', l: 'Rectangular' }, { v: 'circular', l: 'Circular' }], default: 'rectangular' }
        ]
    },
    mechanical_chiller_selection: {
        fields: [
            { name: 'cooling_load', label: 'Cooling Load', unit: 'TR', type: 'number', required: true },
            { name: 'chiller_type', label: 'Chiller Type', type: 'select', options: [{ v: 'air_cooled', l: 'Air Cooled' }, { v: 'water_cooled', l: 'Water Cooled' }], default: 'water_cooled' },
            { name: 'chw_supply_temp', label: 'CHW Supply Temp', unit: '\u00B0C', type: 'number', default: 7 },
            { name: 'chw_return_temp', label: 'CHW Return Temp', unit: '\u00B0C', type: 'number', default: 12 }
        ]
    },
    mechanical_heat_transfer: {
        fields: [
            { name: 'u_value', label: 'U-Value', unit: 'W/m\u00B2K', type: 'number', required: true },
            { name: 'area', label: 'Surface Area', unit: 'm\u00B2', type: 'number', required: true },
            { name: 'temp_diff', label: 'Temperature Diff', unit: '\u00B0C', type: 'number', required: true },
            { name: 'thickness', label: 'Thickness', unit: 'm', type: 'number', default: 0.2 }
        ]
    },
    mechanical_pipe_friction: {
        fields: [
            { name: 'diameter', label: 'Pipe Diameter', unit: 'mm', type: 'number', required: true },
            { name: 'length', label: 'Pipe Length', unit: 'm', type: 'number', required: true },
            { name: 'flow_rate', label: 'Flow Rate', unit: 'm\u00B3/h', type: 'number', required: true },
            { name: 'roughness', label: 'Roughness', unit: 'mm', type: 'number', default: 0.045 },
            { name: 'viscosity', label: 'Viscosity', unit: 'Pa.s', type: 'number', default: 0.001 },
            { name: 'density', label: 'Fluid Density', unit: 'kg/m\u00B3', type: 'number', default: 1000 }
        ]
    },
    mechanical_cooling_tower_sizing: {
        fields: [
            { name: 'heat_rejection', label: 'Heat Rejection', unit: 'kW', type: 'number', required: true },
            { name: 'approach', label: 'Approach', unit: '\u00B0C', type: 'number', default: 5 },
            { name: 'wet_bulb_temp', label: 'Wet Bulb Temp', unit: '\u00B0C', type: 'number', default: 28 }
        ]
    },
    mechanical_fan_selection: {
        fields: [
            { name: 'airflow', label: 'Airflow', unit: 'CFM', type: 'number', required: true },
            { name: 'static_pressure', label: 'Static Pressure', unit: 'Pa', type: 'number', required: true },
            { name: 'efficiency', label: 'Fan Efficiency', unit: '%', type: 'number', default: 70 }
        ]
    },
    mechanical_compressor_sizing: {
        fields: [
            { name: 'flow_rate', label: 'Flow Rate', unit: 'm\u00B3/min', type: 'number', required: true },
            { name: 'pressure_ratio', label: 'Pressure Ratio', unit: '', type: 'number', required: true },
            { name: 'inlet_temp', label: 'Inlet Temp', unit: '\u00B0C', type: 'number', default: 25 },
            { name: 'efficiency', label: 'Efficiency', unit: '%', type: 'number', default: 80 }
        ]
    },
    mechanical_psychrometrics: {
        fields: [
            { name: 'dry_bulb', label: 'Dry Bulb Temp', unit: '\u00B0C', type: 'number', required: true },
            { name: 'relative_humidity', label: 'Relative Humidity', unit: '%', type: 'number', required: true },
            { name: 'altitude', label: 'Altitude', unit: 'm', type: 'number', default: 0 }
        ]
    },
    mechanical_stress_strain_analysis: {
        fields: [
            { name: 'force', label: 'Applied Force', unit: 'N', type: 'number', required: true },
            { name: 'area', label: 'Cross-Section Area', unit: 'mm\u00B2', type: 'number', required: true },
            { name: 'length', label: 'Original Length', unit: 'mm', type: 'number', required: true },
            { name: 'elastic_modulus', label: 'Elastic Modulus', unit: 'GPa', type: 'number', default: 200 }
        ]
    },
    mechanical_bearing_selection: {
        fields: [
            { name: 'radial_load', label: 'Radial Load', unit: 'kN', type: 'number', required: true },
            { name: 'axial_load', label: 'Axial Load', unit: 'kN', type: 'number', default: 0 },
            { name: 'speed', label: 'Rotational Speed', unit: 'RPM', type: 'number', required: true },
            { name: 'life_hours', label: 'Required Life', unit: 'hours', type: 'number', default: 20000 }
        ]
    },

    // Civil
    civil_concrete_volume: {
        fields: [
            { name: 'length', label: 'Length', unit: 'm', type: 'number', required: true },
            { name: 'width', label: 'Width', unit: 'm', type: 'number', required: true },
            { name: 'depth', label: 'Depth', unit: 'm', type: 'number', required: true },
            { name: 'quantity', label: 'Quantity', unit: '', type: 'number', default: 1 }
        ]
    },
    civil_steel_weight: {
        fields: [
            { name: 'diameter', label: 'Bar Diameter', unit: 'mm', type: 'number', required: true },
            { name: 'length', label: 'Bar Length', unit: 'm', type: 'number', required: true },
            { name: 'quantity', label: 'Quantity', unit: '', type: 'number', default: 1 }
        ]
    },
    civil_beam_load: {
        fields: [
            { name: 'span', label: 'Beam Span', unit: 'm', type: 'number', required: true },
            { name: 'dead_load', label: 'Dead Load', unit: 'kN/m', type: 'number', required: true },
            { name: 'live_load', label: 'Live Load', unit: 'kN/m', type: 'number', required: true },
            { name: 'beam_width', label: 'Beam Width', unit: 'mm', type: 'number', default: 300 },
            { name: 'beam_depth', label: 'Beam Depth', unit: 'mm', type: 'number', default: 500 },
            { name: 'concrete_grade', label: 'Concrete Grade', unit: 'MPa', type: 'number', default: 25 },
            { name: 'steel_grade', label: 'Steel Grade', unit: 'MPa', type: 'number', default: 415 },
            { name: 'design_code', label: 'Design Code', type: 'select', options: [{ v: 'IS456', l: 'IS 456' }, { v: 'ACI318', l: 'ACI 318' }, { v: 'EC2', l: 'Eurocode 2' }, { v: 'BS8110', l: 'BS 8110' }], default: 'IS456' }
        ]
    },
    civil_column_design: {
        fields: [
            { name: 'height', label: 'Column Height', unit: 'm', type: 'number', required: true },
            { name: 'axial_load', label: 'Axial Load', unit: 'kN', type: 'number', required: true },
            { name: 'width', label: 'Width', unit: 'mm', type: 'number', default: 300 },
            { name: 'depth', label: 'Depth', unit: 'mm', type: 'number', default: 300 },
            { name: 'concrete_grade', label: 'Concrete Grade', unit: 'MPa', type: 'number', default: 25 },
            { name: 'steel_grade', label: 'Steel Grade', unit: 'MPa', type: 'number', default: 415 }
        ]
    },
    civil_foundation_area: {
        fields: [
            { name: 'total_load', label: 'Total Load', unit: 'kN', type: 'number', required: true },
            { name: 'bearing_capacity', label: 'Bearing Capacity', unit: 'kN/m\u00B2', type: 'number', required: true },
            { name: 'depth', label: 'Foundation Depth', unit: 'm', type: 'number', default: 1.5 }
        ]
    },
    civil_earthwork_volume: {
        fields: [
            { name: 'length', label: 'Length', unit: 'm', type: 'number', required: true },
            { name: 'width_top', label: 'Width Top', unit: 'm', type: 'number', required: true },
            { name: 'width_bottom', label: 'Width Bottom', unit: 'm', type: 'number', required: true },
            { name: 'depth', label: 'Depth', unit: 'm', type: 'number', required: true }
        ]
    },
    civil_retaining_wall_pressure: {
        fields: [
            { name: 'wall_height', label: 'Wall Height', unit: 'm', type: 'number', required: true },
            { name: 'soil_density', label: 'Soil Density', unit: 'kN/m\u00B3', type: 'number', default: 18 },
            { name: 'friction_angle', label: 'Friction Angle', unit: '\u00B0', type: 'number', default: 30 },
            { name: 'surcharge', label: 'Surcharge Load', unit: 'kN/m\u00B2', type: 'number', default: 0 }
        ]
    },
    civil_seismic_load: {
        fields: [
            { name: 'weight', label: 'Seismic Weight', unit: 'kN', type: 'number', required: true },
            { name: 'zone', label: 'Seismic Zone', type: 'select', options: [{ v: 'II', l: 'Zone II' }, { v: 'III', l: 'Zone III' }, { v: 'IV', l: 'Zone IV' }, { v: 'V', l: 'Zone V' }], default: 'III' },
            { name: 'importance_factor', label: 'Importance Factor', unit: '', type: 'number', default: 1.0 },
            { name: 'response_reduction', label: 'Response Reduction', unit: '', type: 'number', default: 5.0 }
        ]
    },
    civil_wind_load: {
        fields: [
            { name: 'basic_wind_speed', label: 'Basic Wind Speed', unit: 'm/s', type: 'number', required: true },
            { name: 'height', label: 'Building Height', unit: 'm', type: 'number', required: true },
            { name: 'width', label: 'Building Width', unit: 'm', type: 'number', required: true },
            { name: 'terrain_category', label: 'Terrain Category', type: 'select', options: [{ v: '1', l: 'Cat 1 - Open' }, { v: '2', l: 'Cat 2 - Suburban' }, { v: '3', l: 'Cat 3 - Urban' }, { v: '4', l: 'Cat 4 - Dense' }], default: '2' }
        ]
    },
    civil_pile_foundation: {
        fields: [
            { name: 'load', label: 'Column Load', unit: 'kN', type: 'number', required: true },
            { name: 'pile_capacity', label: 'Pile Capacity', unit: 'kN', type: 'number', required: true },
            { name: 'pile_diameter', label: 'Pile Diameter', unit: 'mm', type: 'number', default: 600 },
            { name: 'pile_length', label: 'Pile Length', unit: 'm', type: 'number', default: 15 }
        ]
    },
    civil_bar_bending_schedule: {
        fields: [
            { name: 'bar_diameter', label: 'Bar Diameter', unit: 'mm', type: 'number', required: true },
            { name: 'bar_length', label: 'Bar Length', unit: 'm', type: 'number', required: true },
            { name: 'quantity', label: 'Quantity', unit: '', type: 'number', required: true },
            { name: 'shape', label: 'Shape', type: 'select', options: [{ v: 'straight', l: 'Straight' }, { v: 'bent', l: 'Bent' }, { v: 'stirrup', l: 'Stirrup' }, { v: 'hook', l: 'Hook' }], default: 'straight' }
        ]
    },
    civil_cantilever_beam: {
        fields: [
            { name: 'length', label: 'Cantilever Length', unit: 'm', type: 'number', required: true },
            { name: 'load', label: 'Point Load at Tip', unit: 'kN', type: 'number', required: true },
            { name: 'udl', label: 'UDL', unit: 'kN/m', type: 'number', default: 0 },
            { name: 'width', label: 'Beam Width', unit: 'mm', type: 'number', default: 300 },
            { name: 'depth', label: 'Beam Depth', unit: 'mm', type: 'number', default: 400 }
        ]
    },
    civil_deflection_check: {
        fields: [
            { name: 'span', label: 'Span', unit: 'm', type: 'number', required: true },
            { name: 'load', label: 'Total Load', unit: 'kN/m', type: 'number', required: true },
            { name: 'elastic_modulus', label: 'Elastic Modulus', unit: 'GPa', type: 'number', default: 25 },
            { name: 'moment_of_inertia', label: 'Moment of Inertia', unit: 'mm\u2074', type: 'number', required: true }
        ]
    },
    civil_soil_bearing_capacity: {
        fields: [
            { name: 'cohesion', label: 'Cohesion', unit: 'kN/m\u00B2', type: 'number', required: true },
            { name: 'friction_angle', label: 'Friction Angle', unit: '\u00B0', type: 'number', required: true },
            { name: 'depth', label: 'Foundation Depth', unit: 'm', type: 'number', required: true },
            { name: 'width', label: 'Foundation Width', unit: 'm', type: 'number', required: true },
            { name: 'unit_weight', label: 'Soil Unit Weight', unit: 'kN/m\u00B3', type: 'number', default: 18 }
        ]
    },
    civil_thermal_expansion: {
        fields: [
            { name: 'length', label: 'Member Length', unit: 'm', type: 'number', required: true },
            { name: 'temp_change', label: 'Temperature Change', unit: '\u00B0C', type: 'number', required: true },
            { name: 'material', label: 'Material', type: 'select', options: [{ v: 'steel', l: 'Steel' }, { v: 'concrete', l: 'Concrete' }, { v: 'aluminum', l: 'Aluminum' }], default: 'steel' }
        ]
    }
};

// Last calculation result for report generation
let lastCalcResult = null;
let lastCalcId = null;
const calcEquationCache = {};

// ---- Modal Helpers ----
function _esc(val) {
    if (val === null || val === undefined) return 'N/A';
    const d = document.createElement('div');
    d.textContent = String(val);
    return d.innerHTML;
}

function _createModalOverlay() {
    let overlay = document.getElementById('calc-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'calc-modal-overlay';
        overlay.className = 'fixed inset-0 bg-gray-900/60 z-50 hidden items-center justify-center p-4 backdrop-blur-sm transition-all duration-300';
        overlay.onclick = (e) => {
            if (e.target === overlay) closeCalcModal();
        };
        document.body.appendChild(overlay);
    }
    return overlay;
}

function closeCalcModal() {
    const overlay = document.getElementById('calc-modal-overlay');
    if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            overlay.innerHTML = '';
        }, 200);
    }
    lastCalcId = null;
    lastCalcResult = null;
}

// ---- Open Calculator (Execution Modal) ----
async function openCalculator(id) {
    const calculator = getCatalog().find(c => c.id === id);
    if (!calculator) return;

    lastCalcId = id;
    const name = resolveCalcName(calculator);
    const overlay = _createModalOverlay();

    // Try to fetch equation details from API for dynamic variables
    let equationData = null;
    try {
        const response = await fetch(`/calculators/${id}/details`);
        if (response.ok) {
            equationData = await response.json();
            calcEquationCache[id] = equationData;
        }
    } catch (e) {
        console.log('Could not fetch equation details, using fallback');
    }

    // Field generation - use dynamic variables from API or fallback to CALC_FIELDS
    let fieldsHTML = '';
    let inputVariables = [];
    let outputVariable = null;

    const fieldDefs = CALC_FIELDS[id];
    const hasFieldDefs = fieldDefs && fieldDefs.fields;

    if (equationData && equationData.variables && equationData.variables.length > 0 && !hasFieldDefs) {
        // Dynamic generation from equation variables
        // The last variable is typically the output
        const vars = equationData.variables;
        outputVariable = vars[vars.length - 1]; // Last one is output
        inputVariables = vars.slice(0, -1); // All except last are inputs
        
        fieldsHTML = generateDynamicInputFields(inputVariables);
    } else {
        // Fallback to hardcoded CALC_FIELDS
        if (fieldDefs && fieldDefs.fields) {
            fieldsHTML = fieldDefs.fields.map(f => {
                const label = _esc(f.label);
                const unit = f.unit ? `<span class="text-slate-500 text-sm ml-1">(${_esc(f.unit)})</span>` : '';
                const required = f.required ? '<span class="text-red-500 ml-1">*</span>' : '';

                let inputHTML = '';
                if (f.type === 'select') {
                    const options = f.options.map(o => `<option value="${_esc(o.v)}" ${o.v === f.default ? 'selected' : ''}>${_esc(o.l)}</option>`).join('');
                    inputHTML = `<select name="${f.name}" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">${options}</select>`;
                } else {
                    const val = f.default !== undefined ? f.default : '';
                    const req = f.required ? 'required' : '';
                    inputHTML = `<input type="number" name="${f.name}" value="${val}" step="any" ${req} class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" placeholder="${_esc(f.unit || '')}">`;
                }

                return `
                    <div class="mb-5">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">${label}${unit}${required}</label>
                        ${inputHTML}
                    </div>
                `;
            }).join('');
        } else {
            fieldsHTML = `<div class="mb-5 col-span-full">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Input Parameters (JSON)</label>
                <span class="text-xs text-slate-500 mb-2 block">Enter parameters as JSON object, e.g. {"length": 10, "width": 5}</span>
                <textarea name="_json_input" rows="6" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-mono text-sm">{}</textarea>
            </div>`;
        }
    }

    // Equation display
    const equationDisplay = equationData?.equation || calculator.equation || calculator.description || '';
    const equationHTML = equationDisplay ? `
        <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div class="text-sm text-slate-500 mb-1">Formula</div>
            <div class="text-lg font-mono text-slate-800">${_esc(equationDisplay)}</div>
        </div>
    ` : '';

    overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform scale-95 opacity-0 transition-all duration-300" id="calc-modal-content">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style="background-color: ${(calculator.color || '#3b82f6')}15; color: ${calculator.color || '#3b82f6'}">
                    <i class="fas ${calculator.icon || 'fa-calculator'}"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">${_esc(name)}</h2>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">${_esc(calculator.category)}</span>
                </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50" onclick="closeCalcModal()">
                <i class="fas fa-times text-lg"></i>
            </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth" id="calc-modal-body">
            <form id="calcModalForm" onsubmit="event.preventDefault(); runCalculation('${_esc(id)}');">
                ${equationHTML}
                <div class="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                    <i class="fas fa-edit text-blue-500"></i> Enter Input Values
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    ${fieldsHTML}
                </div>
                
                <!-- Results Area -->
                <div id="calcResults" class="hidden mt-6 bg-slate-50 rounded-xl border border-slate-200 p-0 overflow-hidden transition-all">
                    <!-- Results injected here -->
                </div>
            </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between z-10">
            <button class="text-slate-500 hover:text-slate-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all" onclick="closeCalcModal()">
                Close
            </button>
            <div class="flex items-center gap-3">
                <button type="button" class="hidden text-slate-600 hover:text-blue-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all" id="calcBtnReport" onclick="generateCalcReport()">
                    <i class="fas fa-file-alt mr-2"></i> Report
                </button>
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2" onclick="runCalculation('${_esc(id)}')" id="btnRunCalc">
                    <i class="fas fa-play"></i> Compute
                </button>
            </div>
        </div>
    </div>`;

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        const content = document.getElementById('calc-modal-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
    });

    // Focus first input
    const firstInput = overlay.querySelector('input, select');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

// Generate dynamic input fields from equation variables
function generateDynamicInputFields(variables) {
    if (!variables || variables.length === 0) {
        return `<div class="mb-5 col-span-full text-slate-500">No input variables defined</div>`;
    }
    
    return variables.map(v => {
        const symbol = v.symbol || v.name;
        const name = v.name || v.symbol;
        const unit = v.unit || '';
        const description = v.description || '';
        const defaultVal = v.default_value !== undefined ? v.default_value : '';
        const minVal = v.min_value !== undefined && v.min_value !== null ? v.min_value : undefined;
        const maxVal = v.max_value !== undefined && v.max_value !== null ? v.max_value : undefined;
        const placeholder = v.placeholder || unit;
        const required = v.required !== false;
        
        const label = `${name} (${symbol})`;
        const unitSpan = unit ? `<span class="text-slate-500 text-sm ml-1">[${_esc(unit)}]</span>` : '';
        const descSpan = description ? `<span class="text-xs text-slate-400 block mt-1">${_esc(description)}</span>` : '';
        const minAttr = minVal !== undefined ? `min="${_esc(minVal)}"` : '';
        const maxAttr = maxVal !== undefined ? `max="${_esc(maxVal)}"` : '';
        const reqAttr = required ? 'required' : '';
        const requiredMark = required ? '<span class="text-red-500 ml-1">*</span>' : '';
        
        return `
            <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                    ${_esc(label)}${unitSpan}
                    ${requiredMark}
                </label>
                <input type="number" name="${_esc(v.name)}" value="${defaultVal}" step="any" ${reqAttr} ${minAttr} ${maxAttr}
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" 
                    placeholder="${_esc(placeholder)}">
                ${descSpan}
            </div>
        `;
    }).join('');
}

function _extractEquationExpression(equation) {
    if (!equation) return '';
    const parts = equation.split('=');
    if (parts.length >= 2) {
        return parts.slice(1).join('=').trim();
    }
    return equation.trim();
}

function _getEquationOutput(equationData) {
    if (!equationData || !equationData.outputs || !equationData.outputs.length) {
        return { name: 'Result', symbol: 'Result', unit: '', precision: null };
    }
    const out = equationData.outputs[0];
    return {
        name: out.name || out.symbol || 'Result',
        symbol: out.symbol || out.name || 'Result',
        unit: out.unit || '',
        precision: typeof out.precision === 'number' ? out.precision : null
    };
}

// ---- Run Calculation ----
async function runCalculation(id) {
    const form = document.getElementById('calcModalForm');
    const btn = document.getElementById('btnRunCalc');
    const resultsDiv = document.getElementById('calcResults');
    if (!form || !btn) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '';

    // Gather inputs - try dynamic inputs first, then fallback to CALC_FIELDS
    let inputs = {};
    const equationData = calcEquationCache[id];
    const fieldDefs = CALC_FIELDS[id];
    const hasFieldDefs = fieldDefs && fieldDefs.fields;
    
    // Check if we have dynamic inputs (from equation variables)
    const dynamicInputs = form.querySelectorAll('input[type="number"][name]:not([name="_json_input"])');
    if (dynamicInputs.length > 0 && !hasFieldDefs) {
        // Dynamic inputs from equation variables
        dynamicInputs.forEach(input => {
            const val = parseFloat(input.value);
            if (!isNaN(val)) {
                inputs[input.name] = val;
            } else if (input.required) {
                resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>Please fill in all required fields. Missing: ${input.name}</div></div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Compute';
                return;
            }
        });
    } else {
        // Fallback to hardcoded CALC_FIELDS
        if (fieldDefs && fieldDefs.fields) {
            for (const f of fieldDefs.fields) {
                const el = form.querySelector(`[name="${f.name}"]`);
                if (!el) continue;
                if (f.type === 'select') {
                    inputs[f.name] = el.value;
                } else {
                    const val = parseFloat(el.value);
                    if (f.required && (isNaN(val) || el.value.trim() === '')) {
                        resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>Please fill in all required fields. Missing: ${_esc(f.label)}</div></div>`;
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-play"></i> Compute';
                        return;
                    }
                    if (!isNaN(val)) inputs[f.name] = val;
                }
            }
        } else if (equationData && equationData.inputs) {
            for (const inp of equationData.inputs) {
                const el = form.querySelector(`[name="${inp.name}"]`);
                if (!el) continue;
                const raw = el.value;
                const val = parseFloat(raw);
                const isRequired = inp.required !== false;
                if (isRequired && (isNaN(val) || raw.trim() === '')) {
                    resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>Please fill in all required fields. Missing: ${_esc(inp.name)}</div></div>`;
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-play"></i> Compute';
                    return;
                }
                if (!isNaN(val)) inputs[inp.name] = val;
            }
        } else {
            // Generic JSON input
            const textarea = form.querySelector('[name="_json_input"]');
            try {
                inputs = JSON.parse(textarea.value || '{}');
            } catch {
                resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>Invalid JSON input. Please check the format.</div></div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Compute';
                return;
            }
        }
    }

    try {
        let result = null;

        if (!hasFieldDefs && equationData && equationData.equation) {
            const expression = _extractEquationExpression(equationData.equation);
            const variables = {};
            (equationData.inputs || []).forEach(inp => {
                if (inputs[inp.name] !== undefined) {
                    const key = inp.symbol || inp.name;
                    variables[key] = inputs[inp.name];
                }
            });

            const response = await fetch('/calculators/engineering/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ expression, variables })
            });

            const evalResult = await response.json();
            if (!evalResult.success) {
                result = { success: false, error: evalResult.error || 'Evaluation failed' };
            } else {
                const output = _getEquationOutput(equationData);
                const numericValue = typeof evalResult.result === 'number' ? evalResult.result : null;
                const formatted = numericValue !== null && output.precision !== null
                    ? numericValue.toFixed(output.precision)
                    : (evalResult.formatted ?? evalResult.result);
                const displayValue = output.unit ? `${formatted} ${output.unit}` : formatted;

                result = {
                    success: true,
                    results: { [output.name]: displayValue },
                    compliance: ''
                };
            }
        } else {
            result = await calculatorService.calculate(id, inputs);
        }

        lastCalcResult = result;
        lastCalcId = id;

        if (result.success === false) {
            resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>${_esc(result.error || 'Calculation failed')}</div></div>`;
        } else {
            const data = result.results || result;
            const compliance = result.compliance || '';

            let html = '<div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center"><h3 class="font-bold text-slate-700">Results</h3>';
            if (compliance) {
                const isCompliant = compliance.toString().toLowerCase().includes('compliant') || compliance.toString().toLowerCase().includes('pass');
                const badgeClass = isCompliant ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
                const icon = isCompliant ? 'fa-check-circle' : 'fa-exclamation-triangle';
                html += `<div class="px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeClass} border flex items-center gap-1.5"><i class="fas ${icon}"></i> ${_esc(compliance)}</div>`;
            }
            html += '</div><div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">';

            for (const [key, val] of Object.entries(data)) {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                html += `
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">${_esc(label)}</span>
                    <span class="text-lg font-bold text-slate-800">${_esc(val)}</span>
                </div>`;
            }
            html += '</div>';
            resultsDiv.innerHTML = html;
            const btnReport = document.getElementById('calcBtnReport');
            if (btnReport) {
                btnReport.classList.remove('hidden');
                btnReport.style.display = 'inline-flex';
            }
        }
        resultsDiv.classList.remove('hidden');
    } catch (err) {
        resultsDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100"><i class="fas fa-exclamation-circle mt-0.5"></i> <div>${_esc(err.message || 'Calculation failed. Check backend connection.')}</div></div>`;
        resultsDiv.classList.remove('hidden');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Compute';
}

// ---- Generate Report from last calculation ----
function generateCalcReport() {
    if (!lastCalcResult || !lastCalcId) return;

    const calculator = getCatalog().find(c => c.id === lastCalcId);
    const name = calculator ? resolveCalcName(calculator) : lastCalcId;
    const desc = calculator ? resolveCalcDescription(calculator) : '';
    const data = lastCalcResult.results || lastCalcResult;
    const compliance = lastCalcResult.compliance || '';

    // Collect inputs from form
    const form = document.getElementById('calcModalForm');
    const inputs = {};
    if (form) {
        const fieldDefs = CALC_FIELDS[lastCalcId];
        if (fieldDefs && fieldDefs.fields) {
            for (const f of fieldDefs.fields) {
                const el = form.querySelector(`[name="${f.name}"]`);
                if (el) inputs[f.label + (f.unit ? ' (' + f.unit + ')' : '')] = el.value;
            }
        }
    }

    // Build content for the report endpoint
    const content = {
        title: name,
        subtitle: 'Engineering Calculation Sheet',
        calc_type: calculator ? calculator.category : 'general',
        discipline: calculator ? calculator.category : '',
        equation: desc,
        inputs: inputs,
        results: data,
        compliance: { status: compliance ? 'Compliant' : 'N/A', notes: compliance },
        standards: compliance ? [compliance] : []
    };

    // Try backend API, fallback to client-side
    const token = localStorage.getItem('token');
    const tryBackend = token ? fetch('/analytics/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ report_type: 'calculation', format: 'html', content })
    }).then(r => r.ok ? r.json() : Promise.reject()) : Promise.reject();

    tryBackend
        .then(resp => {
            if (resp && resp.success && resp.html) {
                _downloadCalcReport(resp.html, resp.report_id);
            } else {
                _downloadCalcReport(_buildClientCalcReport(content));
            }
        })
        .catch(() => {
            _downloadCalcReport(_buildClientCalcReport(content));
        });
}

function _downloadCalcReport(html, reportId) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calc_report_${reportId || Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

function _buildClientCalcReport(c) {
    const now = new Date();
    const rid = `RPT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const inputRows = Object.entries(c.inputs || {}).map(([k, v]) =>
        `<tr><td>${_esc(k)}</td><td>${_esc(v)}</td></tr>`
    ).join('') || '<tr><td colspan="2">No inputs</td></tr>';

    const resultCards = Object.entries(c.results || {}).map(([k, v]) => {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
        return `<div class="result-card"><div class="label">${_esc(label)}</div><div class="value">${_esc(v)}</div></div>`;
    }).join('') || '<div class="result-card"><div class="label">Status</div><div class="value">Pending</div></div>';

    const compStatus = c.compliance ? c.compliance.status : 'N/A';
    const compNotes = c.compliance ? c.compliance.notes : '';
    const standards = (c.standards || []).map(s => _esc(s)).join(', ') || 'N/A';

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${_esc(c.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#2c3e50;font-size:11pt;line-height:1.5}.page{padding:30px 40px}
.report-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2c3e50;padding-bottom:15px;margin-bottom:25px}
.header-left{flex:1}.header-right{text-align:right;font-size:9pt;color:#7f8c8d}.report-title{font-size:20pt;font-weight:700;color:#2c3e50;margin-bottom:4px}
.report-subtitle{font-size:11pt;color:#7f8c8d}.report-id{font-size:9pt;color:#95a5a6;font-family:monospace}
.meta-table{width:100%;border-collapse:collapse;margin-bottom:20px}.meta-table td{padding:6px 12px;border:1px solid #dce1e7;font-size:10pt}
.meta-table td:first-child{background:#f7f9fc;font-weight:600;width:180px;color:#34495e}
.section{margin-bottom:22px;page-break-inside:avoid}.section-title{font-size:13pt;font-weight:700;color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:12px}
.data-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt}.data-table th{background:#2c3e50;color:white;padding:8px 12px;text-align:left;font-weight:600}
.data-table td{padding:7px 12px;border-bottom:1px solid #ecf0f1}.data-table tr:nth-child(even){background:#f7f9fc}
.result-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:10px 0}
.result-card{background:#f7f9fc;border:1px solid #dce1e7;border-radius:6px;padding:12px;text-align:center}
.result-card .label{font-size:9pt;color:#7f8c8d;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px}.result-card .value{font-size:16pt;font-weight:700;color:#2c3e50}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:9pt;font-weight:600}
.badge-pass{background:#d5f5e3;color:#27ae60}.badge-info{background:#d6eaf8;color:#2980b9}
.equation{font-family:'Cambria Math','Times New Roman',serif;font-size:12pt;background:#f7f9fc;padding:10px 15px;border-radius:6px;margin:8px 0;text-align:center;border:1px solid #dce1e7}
.signature-block{margin-top:40px;display:flex;justify-content:space-between}.signature-col{width:45%}
.signature-line{border-top:1px solid #2c3e50;margin-top:40px;padding-top:5px;font-size:10pt}.signature-label{font-size:9pt;color:#7f8c8d}
.report-footer{margin-top:30px;padding-top:12px;border-top:1px solid #dce1e7;font-size:8pt;color:#95a5a6;display:flex;justify-content:space-between}
@media print{.page{padding:20px}.section{page-break-inside:avoid}}
</style></head><body><div class="page">
<div class="report-header"><div class="header-left"><div class="report-title">${_esc(c.title)}</div><div class="report-subtitle">${_esc(c.subtitle || 'Technical Calculation Sheet')}</div><div class="report-id">${rid}</div></div>
<div class="header-right"><strong>EngiSuite Analytics Pro</strong><br>${dateStr}</div></div>
<div class="section"><div class="section-title">1. Project Information</div><table class="meta-table"><tr><td>Calculation Type</td><td>${_esc(c.calc_type)}</td></tr><tr><td>Discipline</td><td>${_esc(c.discipline)}</td></tr><tr><td>Standards</td><td>${standards}</td></tr><tr><td>Date</td><td>${dateStr}</td></tr></table></div>
${c.equation ? `<div class="section"><div class="section-title">2. Design Basis</div><div class="equation">${_esc(c.equation)}</div></div>` : ''}
<div class="section"><div class="section-title">3. Input Parameters</div><table class="data-table"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>${inputRows}</tbody></table></div>
<div class="section"><div class="section-title">4. Calculation Results</div><div class="result-grid">${resultCards}</div></div>
<div class="section"><div class="section-title">5. Compliance</div><table class="meta-table"><tr><td>Status</td><td><span class="badge badge-pass">${_esc(compStatus)}</span></td></tr><tr><td>Notes</td><td>${_esc(compNotes)}</td></tr></table></div>
<div class="signature-block"><div class="signature-col"><div class="signature-line"><strong>Prepared By</strong><br><span class="signature-label">Engineer / Date</span></div></div><div class="signature-col"><div class="signature-line"><strong>Reviewed By</strong><br><span class="signature-label">Reviewer / Date</span></div></div></div>
<div class="report-footer"><span>${rid}</span><span>EngiSuite Analytics Pro - Confidential</span><span>${now.toISOString().slice(0, 16).replace('T', ' ')}</span></div>
</div></body></html>`;
}

// ---- View Calculator Info ----
function viewCalculatorInfo(id) {
    const calculator = getCatalog().find(c => c.id === id);
    if (!calculator) return;

    const name = resolveCalcName(calculator);
    const desc = resolveCalcDescription(calculator);
    const fieldDefs = CALC_FIELDS[id];
    const overlay = _createModalOverlay();

    // Try to find matching entry in calculations.json data
    let matchedCalc = null;
    if (calculationsCatalog) {
        matchedCalc = calculationsCatalog.find(c => c.id === id);
    }

    let varsHTML = '';
    if (fieldDefs && fieldDefs.fields) {
        const rows = fieldDefs.fields.map(f =>
            `<tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-slate-700 font-medium">${_esc(f.label)}</td>
                <td class="py-3 px-4 text-slate-500 font-mono text-sm">${_esc(f.type === 'select' ? 'selection' : 'number')}</td>
                <td class="py-3 px-4 text-slate-500 font-mono text-sm">${_esc(f.unit || '-')}</td>
                <td class="py-3 px-4 text-slate-500 font-mono text-sm">${f.default !== undefined ? _esc(f.default) : '-'}</td>
            </tr>`
        ).join('');

        varsHTML = `
            <div class="mb-6">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Input Parameters</h4>
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200">
                                <th class="py-2.5 px-4 font-semibold text-xs text-slate-500 uppercase">Parameter</th>
                                <th class="py-2.5 px-4 font-semibold text-xs text-slate-500 uppercase">Type</th>
                                <th class="py-2.5 px-4 font-semibold text-xs text-slate-500 uppercase">Unit</th>
                                <th class="py-2.5 px-4 font-semibold text-xs text-slate-500 uppercase">Default</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
    }

    overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform scale-95 opacity-0 transition-all duration-300" id="calc-info-content">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
             <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style="background-color: ${(calculator.color || '#3b82f6')}15; color: ${calculator.color || '#3b82f6'}">
                    <i class="fas ${calculator.icon || 'fa-info-circle'}"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">${_esc(name)}</h2>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">${_esc(calculator.category)}</span>
                </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50" onclick="closeCalcModal()">
                <i class="fas fa-times text-lg"></i>
            </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div class="mb-6">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h4>
                <p class="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">${_esc(desc)}</p>
            </div>
            
            ${matchedCalc && matchedCalc.equation ? `
            <div class="mb-6">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Equation</h4>
                <div class="bg-slate-900 text-slate-50 p-4 rounded-xl font-mono text-sm overflow-x-auto shadow-inner border border-slate-800">
                    ${_esc(matchedCalc.equation)}
                </div>
            </div>` : ''}
            
            ${varsHTML}
        </div>
        
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button class="text-slate-500 hover:text-slate-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all" onclick="closeCalcModal()">
                Close
            </button>
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2" onclick="closeCalcModal(); openCalculator('${_esc(id)}');">
                <i class="fas fa-play"></i> Open Calculator
            </button>
        </div>
    </div>`;

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        const content = document.getElementById('calc-info-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
    });
}

function formatString(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return Object.prototype.hasOwnProperty.call(params, key) ? params[key] : match;
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCalculators);
} else {
    initializeCalculators();
}