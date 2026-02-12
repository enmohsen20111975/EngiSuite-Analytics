/**
 * Engineering Calculator Module
 * Advanced engineering calculations and scientific functions
 */

class EngineeringCalculatorService {
    constructor() {
        this.baseUrl = '/calculators/engineering';
        this.constants = {};
        this.functions = {};
        this.history = [];
    }

    async loadFunctions() {
        try {
            const response = await fetch(`${this.baseUrl}/functions`);
            const data = await response.json();
            this.constants = data.constants || {};
            this.functions = data.functions || {};
            return data;
        } catch (error) {
            console.error('Error loading functions:', error);
            throw error;
        }
    }

    async evaluateExpression(expression, variables = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ expression, variables })
            });

            const result = await response.json();

            if (result.success) {
                this.addToHistory(expression, result.formatted);
            }

            return result;
        } catch (error) {
            console.error('Error evaluating expression:', error);
            throw error;
        }
    }

    async calculate(calculationType, parameters) {
        try {
            const response = await fetch(`${this.baseUrl}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    calculation_type: calculationType,
                    parameters
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Error performing calculation:', error);
            throw error;
        }
    }

    addToHistory(expression, result) {
        this.history.unshift({
            expression,
            result,
            timestamp: new Date()
        });

        if (this.history.length > 20) {
            this.history.pop();
        }
    }

    getHistory() {
        return this.history;
    }

    getConstants() {
        return this.constants;
    }

    getFunctions() {
        return this.functions;
    }
}

const engineeringCalculatorService = new EngineeringCalculatorService();

class EngineeringCalculatorUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.service = engineeringCalculatorService;
        this.currentExpression = '';
        this.variables = {};
        this.currentPanel = 'scientific';
        this.equations = [];
        this.equationsLoaded = false;
    }

    async init() {
        await this.service.loadFunctions();
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-brand-blue mb-2">
                    <i class="fas fa-square-root-alt mr-2"></i>Engineering Calculator
                </h1>
                <p class="text-slate-500">Advanced scientific and engineering calculations</p>
            </div>

            <!-- Calculator Tabs -->
            <div class="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <button class="calc-tab px-4 py-2 rounded-lg bg-brand-blue text-white shadow-lg transition-all" data-panel="scientific">
                    <i class="fas fa-calculator mr-1"></i> Scientific
                </button>
                <button class="calc-tab px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-all" data-panel="electrical">
                    <i class="fas fa-bolt mr-1"></i> Electrical
                </button>
                <button class="calc-tab px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-all" data-panel="mechanical">
                    <i class="fas fa-cog mr-1"></i> Mechanical
                </button>
                <button class="calc-tab px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-all" data-panel="civil">
                    <i class="fas fa-building mr-1"></i> Civil
                </button>
                <button class="calc-tab px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-all" data-panel="equations">
                    <i class="fas fa-book mr-1"></i> Equations
                </button>
                <button class="calc-tab px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-all" data-panel="formulas">
                    <i class="fas fa-superscript mr-1"></i> Formulas
                </button>
            </div>

            <!-- Panel Container -->
            <div id="panelContainer">
                ${this.renderScientificPanel()}
            </div>
        `;

        this.renderConstants();
    }

    renderScientificPanel() {
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" id="scientific-panel">
                <!-- Display -->
                <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <div class="text-slate-400 text-sm mb-2 break-all font-mono" id="expression"></div>
                    <div class="text-3xl font-bold text-brand-blue break-all" id="result">0</div>
                </div>

                <!-- Calculator Buttons -->
                <div class="grid grid-cols-5 gap-2">
                    ${this.createButton('sin(', 'sin', 'function')}
                    ${this.createButton('cos(', 'cos', 'function')}
                    ${this.createButton('tan(', 'tan', 'function')}
                    ${this.createButton('log(', 'log', 'function')}
                    ${this.createButton('ln(', 'ln', 'function')}

                    ${this.createButton('asin(', 'sin⁻¹', 'function')}
                    ${this.createButton('acos(', 'cos⁻¹', 'function')}
                    ${this.createButton('atan(', 'tan⁻¹', 'function')}
                    ${this.createButton('sqrt(', '√', 'function')}
                    ${this.createButton('cbrt(', '∛', 'function')}

                    ${this.createButton('**2', 'x²', 'function')}
                    ${this.createButton('**3', 'x³', 'function')}
                    ${this.createButton('**', 'xʸ', 'function')}
                    ${this.createButton('pi', 'π', 'function')}
                    ${this.createButton('e', 'e', 'function')}

                    ${this.createButton('abs(', '|x|', 'function')}
                    ${this.createButton('factorial(', 'n!', 'function')}
                    ${this.createButton('exp(', 'eˣ', 'function')}
                    ${this.createButton('(', '(', 'function')}
                    ${this.createButton(')', ')', 'function')}

                    ${this.createButton('AC', 'AC', 'clear')}
                    ${this.createButton('CE', 'CE', 'clear')}
                    ${this.createButton('backspace', '⌫', 'operator')}
                    ${this.createButton('/', '÷', 'operator')}
                    ${this.createButton('*', '×', 'operator')}

                    ${this.createButton('7', '7', 'number')}
                    ${this.createButton('8', '8', 'number')}
                    ${this.createButton('9', '9', 'number')}
                    ${this.createButton('-', '−', 'operator')}
                    ${this.createButton('+', '+', 'operator')}

                    ${this.createButton('4', '4', 'number')}
                    ${this.createButton('5', '5', 'number')}
                    ${this.createButton('6', '6', 'number')}
                    ${this.createButton('degrees(', 'deg', 'function')}
                    ${this.createButton('radians(', 'rad', 'function')}

                    ${this.createButton('1', '1', 'number')}
                    ${this.createButton('2', '2', 'number')}
                    ${this.createButton('3', '3', 'number')}
                    ${this.createButton('floor(', '⌊x⌋', 'function')}
                    ${this.createButton('ceil(', '⌈x⌉', 'function')}

                    ${this.createButton('0', '0', 'number')}
                    ${this.createButton('.', '.', 'number')}
                    ${this.createButton(',', ',', 'function')}
                    <button class="col-span-2 py-4 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-dark transition-all shadow-lg" data-action="calculate">=</button>
                </div>

                <!-- Constants Panel -->
                <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 class="text-lg font-semibold text-brand-text mb-3">
                        <i class="fas fa-atom mr-2 text-brand-blue"></i>Physical Constants
                    </h3>
                    <div class="grid grid-cols-3 md:grid-cols-6 gap-2" id="constantsGrid"></div>
                </div>

                <!-- Variables Panel -->
                <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 class="text-lg font-semibold text-brand-text mb-3">
                        <i class="fas fa-variable mr-2 text-brand-blue"></i>Variables
                    </h3>
                    <div class="flex gap-2 mb-3">
                        <input type="text" placeholder="Name (e.g., x)" id="varName"
                               class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                        <input type="number" placeholder="Value" id="varValue"
                               class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                        <button id="addVarBtn" class="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark transition-all">Add</button>
                    </div>
                    <div id="variablesList" class="space-y-2"></div>
                </div>

                <!-- History -->
                <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 hidden" id="historyPanel">
                    <h3 class="text-lg font-semibold text-brand-text mb-3">
                        <i class="fas fa-history mr-2 text-brand-blue"></i>History
                    </h3>
                    <div id="historyList" class="space-y-2"></div>
                </div>
            </div>
        `;
    }

    createButton(action, label, type) {
        const classes = {
            number: 'bg-white text-brand-text hover:bg-gray-50 border border-gray-200',
            operator: 'bg-blue-50 text-brand-blue hover:bg-blue-100 border border-blue-100',
            function: 'bg-cyan-50 text-cyan-600 text-sm hover:bg-cyan-100 border border-cyan-100',
            clear: 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100',
            equals: 'bg-brand-blue text-white font-bold hover:bg-brand-dark'
        };

        return `<button class="py-4 rounded-xl ${classes[type]} transition-all font-medium" data-action="${action}">${label}</button>`;
    }

    renderConstants() {
        const grid = document.getElementById('constantsGrid');
        if (!grid) return;

        const constantNames = {
            'pi': 'Pi',
            'e': 'Euler\'s Number',
            'g': 'Gravity',
            'c': 'Speed of Light',
            'G': 'Gravitational Constant',
            'h': 'Planck Constant',
            'k': 'Boltzmann Constant',
            'Na': 'Avogadro\'s Number',
            'R': 'Gas Constant'
        };

        const constants = this.service.getConstants();
        grid.innerHTML = Object.entries(constants).slice(0, 12).map(([key, value]) => `
            <button class="p-2 bg-white border border-gray-200 rounded-lg hover:border-brand-blue hover:bg-blue-50 transition-all text-center" data-constant="${key}">
                <div class="text-lg font-bold text-brand-blue">${key}</div>
                <div class="text-xs text-slate-400">${constantNames[key] || key}</div>
            </button>
        `).join('');
    }

    setupEventListeners() {
        this.container.querySelectorAll('.calc-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchPanel(tab.dataset.panel));
        });

        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                this.handleButtonClick(btn.dataset.action);
            }
        });

        document.getElementById('addVarBtn')?.addEventListener('click', () => this.addVariable());
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchPanel(panel) {
        this.currentPanel = panel;

        this.container.querySelectorAll('.calc-tab').forEach(tab => {
            const isActive = tab.dataset.panel === panel;
            tab.className = `calc-tab px-4 py-2 rounded-lg transition-all ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`;
        });

        const container = document.getElementById('panelContainer');
        switch (panel) {
            case 'scientific':
                container.innerHTML = this.renderScientificPanel();
                this.renderConstants();
                break;
            case 'electrical':
            case 'mechanical':
            case 'civil':
            case 'formulas':
                container.innerHTML = this.renderFormulaPanel(panel);
                break;
            case 'equations':
                container.innerHTML = this.renderEquationsPanel();
                this.loadEquationsPanel();
                break;
        }

        this.setupEventListeners();
    }

    renderFormulaPanel(type) {
        const formulas = this.getFormulasForType(type);

        return `
            <div class="space-y-4" id="${type}-panel">
                ${formulas.map(formula => `
                    <div class="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:border-brand-blue hover:shadow-md transition-all" data-formula="${formula.type}">
                        <div class="text-lg font-semibold text-brand-text">
                            <i class="${formula.icon} mr-2 text-brand-blue"></i>${formula.title}
                        </div>
                        <div class="text-sm text-slate-500 mt-1">${formula.description}</div>
                    </div>
                `).join('')}
                <div id="formula-container"></div>
            </div>
        `;
    }

    renderEquationsPanel() {
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 class="text-xl font-semibold text-brand-text">Equation Library</h3>
                        <p class="text-sm text-slate-500">Powered by workflows.db</p>
                    </div>
                    <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        Dynamic inputs + results
                    </div>
                </div>

                <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="md:col-span-2 relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="equationSearch" type="text" placeholder="Search equations..."
                            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all">
                    </div>
                    <select id="equationDomain" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all">
                        <option value="all">All Domains</option>
                        <option value="electrical">Electrical</option>
                        <option value="mechanical">Mechanical</option>
                        <option value="civil">Civil</option>
                    </select>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="equationsList">
                <div class="col-span-full text-center py-10 text-slate-500">Loading equations...</div>
            </div>
        `;
    }

    async loadEquationsPanel() {
        const list = document.getElementById('equationsList');
        if (!list) return;

        if (!this.equationsLoaded) {
            list.innerHTML = '<div class="col-span-full text-center py-10 text-slate-500">Loading equations...</div>';

            if (typeof loadCalculationsCatalog === 'function') {
                console.log('Calling loadCalculationsCatalog...');
                await loadCalculationsCatalog();
            }

            const catalog = typeof getCatalog === 'function' ? getCatalog() : [];
            console.log('Loaded catalog:', catalog);
            console.log('Catalog length:', catalog.length);
            this.equations = Array.isArray(catalog) ? catalog : [];
            this.equationsLoaded = true;

            const search = document.getElementById('equationSearch');
            const domain = document.getElementById('equationDomain');

            if (search) {
                search.addEventListener('input', () => this.renderEquationCards());
            }
            if (domain) {
                domain.addEventListener('change', () => this.renderEquationCards());
            }
        }

        this.renderEquationCards();
    }

    renderEquationCards() {
        const list = document.getElementById('equationsList');
        if (!list) return;

        const searchValue = (document.getElementById('equationSearch')?.value || '').toLowerCase();
        const domainValue = document.getElementById('equationDomain')?.value || 'all';

        const filtered = this.equations.filter(eq => {
            const name = this.getEquationName(eq).toLowerCase();
            const description = this.getEquationDescription(eq).toLowerCase();
            const matchesDomain = domainValue === 'all' || eq.category === domainValue || eq.domain === domainValue;
            const matchesSearch = name.includes(searchValue) || description.includes(searchValue);
            return matchesDomain && matchesSearch;
        });

        if (!filtered.length) {
            list.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4 text-slate-400">
                        <i class="fas fa-search text-xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-slate-900">No equations found</h3>
                    <p class="text-slate-500 mt-1">Try adjusting your search or domain filter.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filtered.map(eq => {
            const name = this.getEquationName(eq);
            const desc = this.getEquationDescription(eq);
            const id = this.escapeHtml(eq.id || '');
            const badge = this.escapeHtml(eq.category || eq.domain || 'general');
            const color = eq.color || '#3b82f6';
            const icon = eq.icon || 'fa-square-root-alt';

            return `
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all flex flex-col">
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style="background-color: ${color}15; color: ${color}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                            ${badge}
                        </span>
                    </div>
                    <h4 class="text-lg font-bold text-slate-800 mb-2">${this.escapeHtml(name)}</h4>
                    <p class="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-grow">${this.escapeHtml(desc)}</p>
                    <button class="mt-auto bg-brand-blue hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        onclick="openCalculator('${id}')">
                        <i class="fas fa-play text-xs"></i> Open Equation
                    </button>
                </div>
            `;
        }).join('');
    }

    getEquationName(eq) {
        if (typeof resolveCalcName === 'function') {
            return resolveCalcName(eq);
        }
        return eq.name || 'Equation';
    }

    getEquationDescription(eq) {
        if (typeof resolveCalcDescription === 'function') {
            return resolveCalcDescription(eq);
        }
        return eq.description || eq.equation || '';
    }

    escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    }

    getFormulasForType(type) {
        const formulas = {
            electrical: [
                { type: 'ohms_law', title: "Ohm's Law Calculator", description: 'Calculate voltage, current, resistance, or power', icon: 'fas fa-bolt' },
                { type: 'power_calculations', title: 'AC Power Calculator', description: 'Calculate AC power relationships', icon: 'fas fa-plug' },
                { type: 'voltage_drop_calculation', title: 'Voltage Drop Calculator', description: 'Calculate voltage drop in cables', icon: 'fas fa-chart-line' },
                { type: 'power_factor_correction', title: 'Power Factor Correction', description: 'Calculate capacitor size for PF correction', icon: 'fas fa-battery-full' },
                { type: 'transformer_calculation', title: 'Transformer Calculator', description: 'Calculate transformer parameters', icon: 'fas fa-exchange-alt' }
            ],
            mechanical: [
                { type: 'pipe_flow', title: 'Pipe Flow Calculator', description: 'Calculate pipe flow parameters', icon: 'fas fa-water' },
                { type: 'reynolds_number', title: 'Reynolds Number Calculator', description: 'Determine flow regime', icon: 'fas fa-wind' },
                { type: 'pump_power', title: 'Pump Power Calculator', description: 'Calculate pump power requirements', icon: 'fas fa-pump-soap' },
                { type: 'heat_transfer', title: 'Heat Transfer Calculator', description: 'Calculate heat transfer rate', icon: 'fas fa-temperature-high' },
                { type: 'stress_strain', title: 'Stress-Strain Calculator', description: 'Calculate stress-strain relationships', icon: 'fas fa-compress-arrows-alt' },
                { type: 'motor_sizing', title: 'Motor Sizing Calculator', description: 'Calculate motor parameters', icon: 'fas fa-cog' }
            ],
            civil: [
                { type: 'beam_deflection', title: 'Beam Deflection Calculator', description: 'Calculate beam deflection for various conditions', icon: 'fas fa-ruler-horizontal' }
            ],
            formulas: [
                { type: 'solve_quadratic', title: 'Quadratic Equation Solver', description: 'Solve ax² + bx + c = 0', icon: 'fas fa-square-root-alt' },
                { type: 'ideal_gas', title: 'Ideal Gas Law Calculator', description: 'Calculate using PV = nRT', icon: 'fas fa-wind' },
                { type: 'percentage_calculations', title: 'Percentage Calculator', description: 'Various percentage calculations', icon: 'fas fa-percent' }
            ]
        };

        return formulas[type] || [];
    }

    handleButtonClick(action) {
        switch (action) {
            case 'AC': this.clearAll(); break;
            case 'CE': this.clearEntry(); break;
            case 'backspace': this.backspace(); break;
            case 'calculate': this.calculate(); break;
            default:
                if (action.startsWith('formula:')) {
                    this.showFormulaCalc(action.split(':')[1]);
                } else {
                    this.insertText(action);
                }
        }
    }

    handleKeyboard(e) {
        if (this.currentPanel !== 'scientific') return;

        const key = e.key;
        if (/[0-9]/.test(key)) {
            this.insertText(key);
        } else if (['+', '-', '*', '/', '.', '(', ')', ','].includes(key)) {
            this.insertText(key);
        } else if (key === 'Enter') {
            this.calculate();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === 'Escape') {
            this.clearAll();
        }
    }

    insertText(text) {
        this.currentExpression += text;
        this.updateDisplay();
    }

    updateDisplay() {
        const exprEl = document.getElementById('expression');
        if (exprEl) {
            exprEl.textContent = this.currentExpression;
        }
    }

    clearAll() {
        this.currentExpression = '';
        const resultEl = document.getElementById('result');
        const exprEl = document.getElementById('expression');
        if (resultEl) resultEl.textContent = '0';
        if (exprEl) exprEl.textContent = '';
    }

    clearEntry() {
        this.currentExpression = this.currentExpression.slice(0, -1);
        this.updateDisplay();
    }

    backspace() {
        this.currentExpression = this.currentExpression.slice(0, -1);
        this.updateDisplay();
    }

    async calculate() {
        if (!this.currentExpression) return;

        try {
            const result = await this.service.evaluateExpression(this.currentExpression, this.variables);

            const resultEl = document.getElementById('result');
            if (resultEl) {
                resultEl.textContent = result.success ? result.formatted : 'Error: ' + (result.error || 'Invalid expression');
            }

            if (result.success) {
                this.updateHistory();
            }
        } catch (error) {
            console.error('Calculation error:', error);
            const resultEl = document.getElementById('result');
            if (resultEl) resultEl.textContent = 'Error';
        }
    }

    addVariable() {
        const nameEl = document.getElementById('varName');
        const valueEl = document.getElementById('varValue');

        const name = nameEl.value.trim();
        const value = parseFloat(valueEl.value);

        if (name && !isNaN(value)) {
            this.variables[name] = value;
            this.updateVariablesList();
            nameEl.value = '';
            valueEl.value = '';
        }
    }

    updateVariablesList() {
        const list = document.getElementById('variablesList');
        if (!list) return;

        list.innerHTML = Object.entries(this.variables).map(([name, value]) => `
            <div class="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                <span><strong class="text-brand-blue">${name}</strong> = ${value}</span>
                <button class="text-red-400 hover:text-red-500" data-delete-var="${name}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateHistory() {
        const history = this.service.getHistory();
        const panel = document.getElementById('historyPanel');
        const list = document.getElementById('historyList');

        if (!panel || !list) return;

        if (history.length === 0) {
            panel.classList.add('hidden');
            return;
        }

        panel.classList.remove('hidden');
        list.innerHTML = history.map(item => `
            <div class="p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-all border border-gray-100" data-history="${item.expression}">
                <div class="text-slate-400 text-sm font-mono">${item.expression}</div>
                <div class="text-brand-blue font-bold">= ${item.result}</div>
            </div>
        `).join('');
    }

    showFormulaCalc(formulaType) {
        const container = document.getElementById('formula-container');
        if (!container) return;

        const fields = this.getFormulaFields(formulaType);

        container.innerHTML = `
            <div class="bg-white rounded-xl p-6 border-2 border-brand-blue/30 mt-4 shadow-lg">
                <h3 class="text-xl font-semibold text-brand-blue mb-4">${fields.title}</h3>
                <p class="text-slate-500 text-sm mb-4">${fields.description}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${fields.inputs.map(input => `
                        <div>
                            <label class="text-sm font-medium text-slate-600">${input.label} ${input.unit ? `(${input.unit})` : ''}</label>
                            ${input.type === 'select' ? `
                                <select id="field_${input.name}" class="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                                    ${input.options.map(opt => `<option value="${opt.v}" ${opt.v === input.default ? 'selected' : ''}>${opt.l}</option>`).join('')}
                                </select>
                            ` : `
                                <input type="number" id="field_${input.name}" placeholder="${input.default || ''}" value="${input.default || ''}" step="any"
                                       class="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-brand-text focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none">
                            `}
                        </div>
                    `).join('')}
                </div>

                <button class="mt-6 px-6 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-dark transition-all shadow-lg" id="calculateFormulaBtn">
                    <i class="fas fa-calculator mr-2"></i>Calculate
                </button>

                <div id="formulaResults" class="hidden mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 class="text-lg font-semibold text-brand-text mb-3">Results</h4>
                    <div id="formulaResultsContent"></div>
                </div>
            </div>
        `;

        document.getElementById('calculateFormulaBtn')?.addEventListener('click', () => this.calculateFormula(formulaType));
    }

    getFormulaFields(formulaType) {
        const formulas = {
            ohms_law: {
                title: "Ohm's Law Calculator",
                description: 'Provide any two values to calculate the others',
                inputs: [
                    { name: 'voltage', label: 'Voltage (V)', unit: 'V', type: 'number' },
                    { name: 'current', label: 'Current (I)', unit: 'A', type: 'number' },
                    { name: 'resistance', label: 'Resistance (R)', unit: 'Ω', type: 'number' },
                    { name: 'power', label: 'Power (P)', unit: 'W', type: 'number' }
                ]
            },
            power_calculations: {
                title: 'AC Power Calculator',
                description: 'Calculate AC power relationships',
                inputs: [
                    { name: 'power_kw', label: 'Active Power', unit: 'kW', type: 'number' },
                    { name: 'voltage_v', label: 'Voltage', unit: 'V', type: 'number' },
                    { name: 'current_a', label: 'Current', unit: 'A', type: 'number' },
                    { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.85 },
                    { name: 'phase', label: 'Phase', type: 'select', options: [{ v: '3', l: '3-Phase' }, { v: '1', l: '1-Phase' }] }
                ]
            },
            voltage_drop_calculation: {
                title: 'Voltage Drop Calculator',
                description: 'Calculate voltage drop in cables',
                inputs: [
                    { name: 'current', label: 'Current', unit: 'A', type: 'number' },
                    { name: 'length', label: 'Cable Length', unit: 'm', type: 'number' },
                    { name: 'cable_size_mm2', label: 'Cable Size', unit: 'mm²', type: 'number' },
                    { name: 'voltage', label: 'System Voltage', unit: 'V', type: 'number', default: 400 },
                    { name: 'power_factor', label: 'Power Factor', unit: '', type: 'number', default: 0.85 },
                    { name: 'material', label: 'Material', type: 'select', options: [{ v: 'copper', l: 'Copper' }, { v: 'aluminum', l: 'Aluminum' }] }
                ]
            },
            power_factor_correction: {
                title: 'Power Factor Correction',
                description: 'Calculate capacitor size for power factor correction',
                inputs: [
                    { name: 'active_power_kw', label: 'Active Power', unit: 'kW', type: 'number' },
                    { name: 'current_pf', label: 'Current Power Factor', unit: '', type: 'number' },
                    { name: 'target_pf', label: 'Target Power Factor', unit: '', type: 'number', default: 0.95 }
                ]
            },
            transformer_calculation: {
                title: 'Transformer Calculator',
                description: 'Calculate transformer parameters',
                inputs: [
                    { name: 'primary_voltage', label: 'Primary Voltage', unit: 'V', type: 'number' },
                    { name: 'secondary_voltage', label: 'Secondary Voltage', unit: 'V', type: 'number' },
                    { name: 'power_kva', label: 'Power Rating', unit: 'kVA', type: 'number' }
                ]
            },
            pipe_flow: {
                title: 'Pipe Flow Calculator',
                description: 'Calculate pipe flow parameters',
                inputs: [
                    { name: 'diameter', label: 'Pipe Diameter', unit: 'm', type: 'number' },
                    { name: 'velocity', label: 'Velocity', unit: 'm/s', type: 'number' },
                    { name: 'flow_rate', label: 'Flow Rate', unit: 'm³/s', type: 'number' },
                    { name: 'fluid_density', label: 'Fluid Density', unit: 'kg/m³', type: 'number', default: 1000 }
                ]
            },
            reynolds_number: {
                title: 'Reynolds Number Calculator',
                description: 'Determine flow regime',
                inputs: [
                    { name: 'velocity', label: 'Velocity', unit: 'm/s', type: 'number' },
                    { name: 'diameter', label: 'Diameter', unit: 'm', type: 'number' },
                    { name: 'density', label: 'Density', unit: 'kg/m³', type: 'number' },
                    { name: 'viscosity', label: 'Dynamic Viscosity', unit: 'Pa·s', type: 'number' }
                ]
            },
            pump_power: {
                title: 'Pump Power Calculator',
                description: 'Calculate pump power requirements',
                inputs: [
                    { name: 'flow_rate', label: 'Flow Rate', unit: 'm³/h', type: 'number' },
                    { name: 'head', label: 'Total Head', unit: 'm', type: 'number' },
                    { name: 'efficiency', label: 'Efficiency', unit: '%', type: 'number', default: 75 },
                    { name: 'fluid_density', label: 'Fluid Density', unit: 'kg/m³', type: 'number', default: 1000 }
                ]
            },
            heat_transfer: {
                title: 'Heat Transfer Calculator',
                description: 'Calculate heat transfer rate',
                inputs: [
                    { name: 'area', label: 'Surface Area', unit: 'm²', type: 'number' },
                    { name: 'temp_diff', label: 'Temperature Difference', unit: '°C', type: 'number' },
                    { name: 'u_value', label: 'U-Value', unit: 'W/m²K', type: 'number' }
                ]
            },
            stress_strain: {
                title: 'Stress-Strain Calculator',
                description: 'Calculate stress-strain relationships',
                inputs: [
                    { name: 'force', label: 'Force', unit: 'N', type: 'number' },
                    { name: 'area', label: 'Cross-sectional Area', unit: 'm²', type: 'number' },
                    { name: 'elongation', label: 'Elongation', unit: 'm', type: 'number' },
                    { name: 'original_length', label: 'Original Length', unit: 'm', type: 'number' }
                ]
            },
            motor_sizing: {
                title: 'Motor Sizing Calculator',
                description: 'Calculate motor parameters',
                inputs: [
                    { name: 'power_kw', label: 'Power', unit: 'kW', type: 'number' },
                    { name: 'speed_rpm', label: 'Speed', unit: 'RPM', type: 'number' },
                    { name: 'efficiency', label: 'Efficiency', unit: '%', type: 'number', default: 90 }
                ]
            },
            beam_deflection: {
                title: 'Beam Deflection Calculator',
                description: 'Calculate beam deflection',
                inputs: [
                    { name: 'length', label: 'Beam Length', unit: 'm', type: 'number' },
                    { name: 'load', label: 'Load', unit: 'N or N/m', type: 'number' },
                    { name: 'elasticity', label: 'Elastic Modulus', unit: 'Pa', type: 'number' },
                    { name: 'moment_of_inertia', label: 'Moment of Inertia', unit: 'm⁴', type: 'number' },
                    { name: 'load_type', label: 'Load Type', type: 'select', options: [{ v: 'point', l: 'Point Load' }, { v: 'udl', l: 'UDL' }] },
                    { name: 'support_type', label: 'Support Type', type: 'select', options: [{ v: 'simply_supported', l: 'Simply Supported' }, { v: 'cantilever', l: 'Cantilever' }, { v: 'fixed_both', l: 'Fixed Both Ends' }] }
                ]
            },
            solve_quadratic: {
                title: 'Quadratic Equation Solver',
                description: 'Solve ax² + bx + c = 0',
                inputs: [
                    { name: 'a', label: 'Coefficient a', unit: '', type: 'number' },
                    { name: 'b', label: 'Coefficient b', unit: '', type: 'number' },
                    { name: 'c', label: 'Coefficient c', unit: '', type: 'number' }
                ]
            },
            ideal_gas: {
                title: 'Ideal Gas Law Calculator',
                description: 'PV = nRT',
                inputs: [
                    { name: 'pressure', label: 'Pressure', unit: 'Pa', type: 'number' },
                    { name: 'volume', label: 'Volume', unit: 'm³', type: 'number' },
                    { name: 'moles', label: 'Amount (moles)', unit: 'mol', type: 'number' },
                    { name: 'temperature', label: 'Temperature', unit: 'K', type: 'number' }
                ]
            },
            percentage_calculations: {
                title: 'Percentage Calculator',
                description: 'Various percentage calculations',
                inputs: [
                    { name: 'value', label: 'Value', unit: '', type: 'number' },
                    { name: 'percentage', label: 'Percentage', unit: '%', type: 'number' },
                    { name: 'total', label: 'Total', unit: '', type: 'number' },
                    { name: 'operation', label: 'Operation', type: 'select', options: [
                        { v: 'of', l: 'X% of Y' },
                        { v: 'is', l: 'X is what % of Y' },
                        { v: 'increase', l: 'Increase Y by X%' },
                        { v: 'decrease', l: 'Decrease Y by X%' },
                        { v: 'change', l: '% Change from X to Y' }
                    ]}
                ]
            }
        };

        return formulas[formulaType] || { title: formulaType, description: '', inputs: [] };
    }

    async calculateFormula(formulaType) {
        const inputs = {};
        document.querySelectorAll('[id^="field_"]').forEach(el => {
            const name = el.id.replace('field_', '');
            const value = el.type === 'number' ? parseFloat(el.value) : el.value;
            if (!isNaN(value) || el.type !== 'number') {
                inputs[name] = value;
            }
        });

        try {
            const result = await this.service.calculate(formulaType, inputs);

            const resultsDiv = document.getElementById('formulaResults');
            const contentDiv = document.getElementById('formulaResultsContent');

            if (result.success) {
                resultsDiv.classList.remove('hidden');

                const displayKeys = Object.keys(result).filter(k => k !== 'success' && typeof result[k] !== 'object');

                contentDiv.innerHTML = displayKeys.map(key => `
                    <div class="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span class="text-slate-500">${this.formatLabel(key)}</span>
                        <span class="text-brand-blue font-bold">${typeof result[key] === 'number' ? result[key].toFixed(4) : result[key]}</span>
                    </div>
                `).join('');
            } else {
                resultsDiv.classList.remove('hidden');
                contentDiv.innerHTML = `<div class="text-red-500">Error: ${result.error}</div>`;
            }
        } catch (error) {
            console.error('Calculation error:', error);
            document.getElementById('formulaResults').classList.remove('hidden');
            document.getElementById('formulaResultsContent').innerHTML = `<div class="text-red-500">Error: ${error.message}</div>`;
        }
    }

    formatLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

window.EngineeringCalculatorService = EngineeringCalculatorService;
window.EngineeringCalculatorUI = EngineeringCalculatorUI;
window.engineeringCalculatorService = engineeringCalculatorService;
