/**
 * Unit Converter Module
 * Handles all unit conversion functionality
 */

class UnitConverterService {
    constructor() {
        this.baseUrl = '/calculators/unit-converter';
        this.categories = [];
        this.commonUnits = {};
        this.currentCategory = 'length';
        this.history = [];
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            const data = await response.json();
            this.categories = data.categories;
            this.commonUnits = data.common_units;
            return { categories: this.categories, commonUnits: this.commonUnits };
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }

    async getUnitsForCategory(category) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${category}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading units:', error);
            throw error;
        }
    }

    async convert(value, fromUnit, toUnit, category = null) {
        try {
            const response = await fetch(`${this.baseUrl}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    value,
                    from_unit: fromUnit,
                    to_unit: toUnit,
                    category
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addToHistory(value, fromUnit, result.result, toUnit);
            }
            
            return result;
        } catch (error) {
            console.error('Error converting:', error);
            throw error;
        }
    }

    addToHistory(fromValue, fromUnit, toValue, toUnit) {
        this.history.unshift({
            from: `${fromValue} ${fromUnit}`,
            to: `${typeof toValue === 'number' ? toValue.toFixed(6) : toValue} ${toUnit}`,
            category: this.currentCategory,
            timestamp: new Date().toLocaleString()
        });

        if (this.history.length > 10) {
            this.history.pop();
        }
    }

    getHistory() {
        return this.history;
    }

    setCategory(category) {
        this.currentCategory = category;
    }

    static getCategoryName(category) {
        const names = {
            'length': 'Length',
            'area': 'Area',
            'volume': 'Volume',
            'mass': 'Mass',
            'force': 'Force',
            'pressure': 'Pressure',
            'energy': 'Energy',
            'power': 'Power',
            'temperature': 'Temperature',
            'time': 'Time',
            'speed': 'Speed',
            'flow_rate': 'Flow Rate',
            'torque': 'Torque',
            'density': 'Density',
            'viscosity_dynamic': 'Dynamic Viscosity',
            'viscosity_kinematic': 'Kinematic Viscosity',
            'angle': 'Angle',
            'frequency': 'Frequency',
            'electric_current': 'Electric Current',
            'voltage': 'Voltage',
            'resistance': 'Resistance',
            'capacitance': 'Capacitance',
            'inductance': 'Inductance'
        };
        return names[category] || category;
    }

    static getCategoryIcon(category) {
        const icons = {
            'length': 'fa-ruler',
            'area': 'fa-vector-square',
            'volume': 'fa-cube',
            'mass': 'fa-weight-hanging',
            'force': 'fa-hand-rock',
            'pressure': 'fa-tachometer-alt',
            'energy': 'fa-bolt',
            'power': 'fa-plug',
            'temperature': 'fa-thermometer-half',
            'time': 'fa-clock',
            'speed': 'fa-tachometer-alt',
            'flow_rate': 'fa-water',
            'torque': 'fa-cog',
            'density': 'fa-layer-group',
            'viscosity_dynamic': 'fa-tint',
            'viscosity_kinematic': 'fa-tint',
            'angle': 'fa-drafting-compass',
            'frequency': 'fa-wave-square',
            'electric_current': 'fa-bolt',
            'voltage': 'fa-bolt',
            'resistance': 'fa-microchip',
            'capacitance': 'fa-battery-full',
            'inductance': 'fa-magnet'
        };
        return icons[category] || 'fa-calculator';
    }
}

const unitConverterService = new UnitConverterService();

class UnitConverterUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.service = unitConverterService;
    }

    async init() {
        await this.service.loadCategories();
        this.render();
        this.setupEventListeners();
    }

    render() {
        const categories = this.service.categories;
        const commonUnits = this.service.commonUnits;

        this.container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-brand-blue mb-2">
                    <i class="fas fa-exchange-alt mr-2"></i>Engineering Unit Converter
                </h1>
                <p class="text-slate-500">Convert between engineering units across multiple categories</p>
            </div>

            <!-- Category Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div class="flex flex-wrap gap-2" id="categoryTabs">
                    ${categories.map(cat => `
                        <button class="px-4 py-2 rounded-lg transition-all duration-300 ${cat === this.service.currentCategory ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}"
                                data-category="${cat}">
                            <i class="fas ${UnitConverterUI.getCategoryIcon(cat)} mr-1"></i>
                            ${UnitConverterUI.getCategoryName(cat)}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Main Converter Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 class="text-xl font-semibold text-brand-blue mb-4">
                    <i class="fas fa-ruler mr-2"></i>
                    <span id="categoryTitle">${UnitConverterUI.getCategoryName(this.service.currentCategory)} Converter</span>
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <!-- From Input -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-600">From</label>
                        <input type="number" id="fromValue" placeholder="Enter value" step="any"
                               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                        <select id="fromUnit" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                        </select>
                    </div>

                    <!-- Swap Button -->
                    <div class="flex justify-center">
                        <button id="swapBtn" class="w-12 h-12 rounded-full bg-brand-blue text-white hover:bg-brand-dark transition-all duration-300 hover:rotate-180 flex items-center justify-center shadow-lg">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>

                    <!-- To Input -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-600">To</label>
                        <input type="number" id="toValue" placeholder="Result" readonly
                               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brand-text focus:border-brand-blue focus:outline-none">
                        <select id="toUnit" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                        </select>
                    </div>
                </div>

                <!-- Result Display -->
                <div id="resultDisplay" class="hidden mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl text-center border border-blue-100">
                    <span class="text-3xl font-bold text-brand-blue" id="resultValue">0</span>
                    <span class="text-lg text-slate-500 ml-2" id="resultUnit"></span>
                    <div class="mt-3 p-3 bg-white rounded-lg font-mono text-sm text-brand-text border border-blue-100" id="formulaDisplay"></div>
                </div>
            </div>

            <!-- Convert to All Units -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-lg font-semibold text-brand-text mb-4">
                    <i class="fas fa-list mr-2 text-brand-blue"></i>Convert to All Units
                </h3>
                <div id="allUnitsGrid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                </div>
            </div>

            <!-- History -->
            <div id="historyPanel" class="hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-semibold text-brand-text mb-4">
                    <i class="fas fa-history mr-2 text-brand-blue"></i>Recent Conversions
                </h3>
                <div id="historyList" class="space-y-2"></div>
            </div>
        `;

        this.loadUnitsForCategory(this.service.currentCategory);
    }

    async loadUnitsForCategory(category) {
        try {
            const data = await this.service.getUnitsForCategory(category);
            const units = data.common_units || {};
            const unitOptions = Object.entries(units).map(([key, name]) =>
                `<option value="${key}">${name}</option>`
            ).join('');

            document.getElementById('fromUnit').innerHTML = unitOptions;
            document.getElementById('toUnit').innerHTML = unitOptions;

            const unitKeys = Object.keys(units);
            if (unitKeys.length >= 2) {
                document.getElementById('fromUnit').value = unitKeys[0];
                document.getElementById('toUnit').value = unitKeys[1];
            }

            document.getElementById('fromValue').value = '';
            document.getElementById('toValue').value = '';
            document.getElementById('resultDisplay').classList.add('hidden');
            document.getElementById('allUnitsGrid').innerHTML = '';
        } catch (error) {
            console.error('Error loading units:', error);
        }
    }

    setupEventListeners() {
        this.container.querySelector('#categoryTabs').addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-category]');
            if (btn) {
                this.selectCategory(btn.dataset.category);
            }
        });

        document.getElementById('fromValue').addEventListener('input', () => this.performConversion());
        document.getElementById('fromUnit').addEventListener('change', () => this.performConversion());
        document.getElementById('toUnit').addEventListener('change', () => this.performConversion());
        document.getElementById('swapBtn').addEventListener('click', () => this.swapUnits());
    }

    selectCategory(category) {
        this.service.setCategory(category);

        this.container.querySelectorAll('#categoryTabs button').forEach(btn => {
            const isActive = btn.dataset.category === category;
            btn.className = `px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`;
        });

        document.getElementById('categoryTitle').textContent = `${UnitConverterUI.getCategoryName(category)} Converter`;
        this.loadUnitsForCategory(category);
    }

    async performConversion() {
        const value = parseFloat(document.getElementById('fromValue').value);
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;

        if (isNaN(value) || !fromUnit || !toUnit) {
            document.getElementById('resultDisplay').classList.add('hidden');
            return;
        }

        try {
            const result = await this.service.convert(value, fromUnit, toUnit, this.service.currentCategory);

            if (result.success) {
                document.getElementById('toValue').value = result.formatted;
                document.getElementById('resultValue').textContent = result.formatted;
                document.getElementById('resultUnit').textContent = result.to_unit;
                document.getElementById('resultDisplay').classList.remove('hidden');
                document.getElementById('formulaDisplay').textContent = `${value} ${fromUnit} = ${result.formatted} ${toUnit}`;

                this.convertToAllUnits(value, fromUnit);
                this.updateHistory();
            } else {
                document.getElementById('toValue').value = 'Error';
            }
        } catch (error) {
            console.error('Conversion error:', error);
            document.getElementById('toValue').value = 'Error';
        }
    }

    async convertToAllUnits(value, fromUnit) {
        const toUnitSelect = document.getElementById('toUnit');
        const allUnits = Array.from(toUnitSelect.options).map(opt => opt.value);
        const grid = document.getElementById('allUnitsGrid');
        grid.innerHTML = '';

        for (const unit of allUnits) {
            if (unit === fromUnit) continue;

            try {
                const result = await this.service.convert(value, fromUnit, unit, this.service.currentCategory);

                if (result.success) {
                    const div = document.createElement('div');
                    div.className = 'p-3 bg-gray-50 rounded-xl text-center cursor-pointer hover:bg-blue-50 hover:border-brand-blue border border-gray-100 transition-all';
                    div.innerHTML = `
                        <div class="text-lg font-bold text-brand-blue">${result.formatted}</div>
                        <div class="text-xs text-slate-500">${result.to_unit}</div>
                    `;
                    div.addEventListener('click', () => {
                        document.getElementById('toUnit').value = unit;
                        this.performConversion();
                    });
                    grid.appendChild(div);
                }
            } catch (error) {
                console.error('Error converting to', unit, error);
            }
        }
    }

    swapUnits() {
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const fromValue = document.getElementById('fromValue');
        const toValue = document.getElementById('toValue');

        const tempUnit = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempUnit;

        if (toValue.value && toValue.value !== 'Error') {
            fromValue.value = toValue.value;
        }

        this.performConversion();
    }

    updateHistory() {
        const history = this.service.getHistory();
        const panel = document.getElementById('historyPanel');
        const list = document.getElementById('historyList');

        if (history.length === 0) {
            panel.classList.add('hidden');
            return;
        }

        panel.classList.remove('hidden');
        list.innerHTML = history.map(item => `
            <div class="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-brand-text font-medium">${item.from} → ${item.to}</span>
                <span class="text-slate-400 text-sm">${item.timestamp}</span>
            </div>
        `).join('');
    }

    static getCategoryIcon = UnitConverterService.getCategoryIcon;
    static getCategoryName = UnitConverterService.getCategoryName;
}

window.UnitConverterService = UnitConverterService;
window.UnitConverterUI = UnitConverterUI;
window.unitConverterService = unitConverterService;
