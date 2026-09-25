import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCredits } from '../hooks/useCredits';
import { calculatorsService, CATEGORY_META } from '../services/calculatorsService';
import projectService from '../services/projectService';
import { Card, Input, Loader } from '../components/ui';
import { 
  Zap, Cog, Building2, Calculator, Search, 
  CircleAlert, ChevronRight, Play, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

// Icon mapping
const ICON_MAP = {
  Zap,
  Cog,
  Building2,
  Calculator,
};

/**
 * Calculator Card Component
 */
function CalculatorCard({ calculator, onClick }) {
  const category = calculator.domain || calculator.category || 'civil';
  const meta = CATEGORY_META[category] || CATEGORY_META.civil;
  const IconComponent = ICON_MAP[meta.icon] || Calculator;
  
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
      onClick={() => onClick(calculator)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <IconComponent 
              className="w-6 h-6" 
              style={{ color: meta.color }} 
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {calculator.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {calculator.description || calculator.equation}
            </p>
            
            {/* Category & Subcategory Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${meta.color}15`,
                  color: meta.color 
                }}
              >
                {meta.label}
              </span>
              {calculator.subcategory && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {calculator.subcategory}
                </span>
              )}
              {calculator.difficulty && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                  calculator.difficulty === 'beginner' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  calculator.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  calculator.difficulty === 'advanced' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}>
                  {calculator.difficulty}
                </span>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
}

/**
 * ListFilter Tab Component
 */
function FilterTab({ label, count, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium text-sm transition-all',
        active 
          ? 'text-white shadow-md' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      )}
      style={active ? { backgroundColor: color } : {}}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          'ml-2 px-2 py-0.5 rounded-full text-xs',
          active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Calculator Modal Component
 */
function CalculatorModal({ calculator, isOpen, onClose }) {
  const [inputs, setInputs] = useState({});
  const [outputs, setOutputs] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const { spend, credits, isPaid } = useCredits();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  // Reset state when calculator changes
  useEffect(() => {
    setInputs({});
    setOutputs(null);
    setError(null);
    setSelectedProjectId('');
    setTaskTitle('');
    setSaveMessage('');
  }, [calculator?.id]);
  
  // Initialize inputs with default values
  useEffect(() => {
    if (calculator?.inputs) {
      const defaultInputs = {};
      calculator.inputs.forEach(input => {
        if (input.default_value !== undefined && input.default_value !== null) {
          defaultInputs[input.symbol || input.name] = input.default_value;
        }
      });
      setInputs(defaultInputs);
    }
  }, [calculator?.inputs]);

  const { data: projects = [], error: projectsError } = useQuery({
    queryKey: ['calculator-projects'],
    queryFn: projectService.getProjects,
    enabled: isOpen,
    retry: false,
  });

  const saveTaskMutation = useMutation({
    mutationFn: ({ projectId, payload }) => projectService.createTask(projectId, payload),
    onSuccess: () => {
      setSaveMessage('Saved to project task.');
    },
    onError: (err) => {
      setSaveMessage(err?.response?.data?.detail?.message || 'Failed to save task.');
    },
  });
  
  // Handle input change
  const handleInputChange = (inputName, value) => {
    setInputs(prev => ({
      ...prev,
      [inputName]: value === '' ? '' : parseFloat(value),
    }));
  };
  
  // Handle calculation
  const handleCalculate = async () => {
    if (!calculator) return;

    // Deduct credits — opens UpgradeModal automatically if insufficient
    if (!spend('calculator')) return;

    setIsCalculating(true);
    setError(null);
    
    try {
      const result = await calculatorsService.calculate(calculator.id, inputs);
      setOutputs(result.outputs || result.results || result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Calculation failed. Please check your inputs.');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    const defaultInputs = {};
    calculator?.inputs?.forEach(input => {
      if (input.default_value !== undefined && input.default_value !== null) {
        defaultInputs[input.symbol || input.name] = input.default_value;
      }
    });
    setInputs(defaultInputs);
    setOutputs(null);
    setError(null);
    setSaveMessage('');
  };
  
  if (!isOpen || !calculator) return null;
  
  const category = calculator.domain || calculator.category || 'civil';
  const meta = CATEGORY_META[category] || CATEGORY_META.civil;
  const IconComponent = ICON_MAP[meta.icon] || Calculator;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: meta.color }} 
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {calculator.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {calculator.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Equation Display */}
            {calculator.equation && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Equation</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {calculator.equation}
                </p>
              </div>
            )}
            
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Inputs</span>
                <span className="text-xs font-normal text-gray-500">
                  ({calculator.inputs?.length || 0} parameters)
                </span>
              </h3>
              
              {calculator.inputs && calculator.inputs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculator.inputs.map((input, index) => (
                    <div key={input.symbol || input.name || index}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {input.name}
                        {input.symbol && <span className="text-blue-500 ml-1">({input.symbol})</span>}
                        {input.unit && <span className="text-gray-400 ml-1">[{input.unit}]</span>}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={input.default_value?.toString() || `Enter ${input.name}`}
                        value={inputs[input.symbol || input.name] ?? ''}
                        onChange={(e) => handleInputChange(input.symbol || input.name, e.target.value)}
                        step="any"
                      />
                      {input.description && (
                        <p className="text-xs text-gray-500 mt-1">{input.description}</p>
                      )}
                      {input.min_value !== undefined && input.max_value !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          Range: {input.min_value} to {input.max_value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No inputs defined for this calculator.
                </p>
              )}
            </div>
            
            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <CircleAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {/* Outputs */}
            {outputs && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Results</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(outputs).map(([key, value]) => {
                    const numVal = typeof value === 'number' ? value : (value?.value ?? value);
                    const unit = value?.unit || '';
                    const display = typeof numVal === 'number' ? numVal.toFixed(6) : String(numVal);
                    return (
                      <div
                        key={key}
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                          {display}{unit ? ` ${unit}` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Save to project */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                    Save to Project Task
                  </h4>
                  {projectsError?.response?.status === 402 ? (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Upgrade to Pro/Enterprise to link calculation outputs to projects.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                      >
                        <option value="">Select project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                      <Input
                        placeholder={`Calc: ${calculator.name}`}
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          if (!selectedProjectId) return;
                          saveTaskMutation.mutate({
                            projectId: Number(selectedProjectId),
                            payload: {
                              title: taskTitle.trim() || `Calculation: ${calculator.name}`,
                              description: `Saved from calculator ${calculator.id}.`,
                              status: 'todo',
                              priority: 'medium',
                              linked_calculation_id: calculator.id,
                            },
                          });
                        }}
                        disabled={!selectedProjectId || saveTaskMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        {saveTaskMutation.isPending ? 'Saving...' : 'Save Task'}
                      </button>
                    </div>
                  )}
                  {saveMessage && (
                    <p className="text-xs mt-2 text-blue-700 dark:text-blue-300">{saveMessage}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Calculate
                    {!isPaid && (
                      <span className="text-xs opacity-75">(-2 pts)</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Main Calculators Page
 */
export default function CalculatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch equations catalog from backend (includes inputs and outputs)
  const { 
    data: catalogData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['calculators-catalog'],
    queryFn: () => calculatorsService.getCatalog({ limit: 5000 }),
  });
  
  // Get calculators array from catalog response
  const calculators = useMemo(() => {
    if (!catalogData) return [];
    // The catalog endpoint returns { count: N, equations: [...] }
    if (catalogData.equations) return catalogData.equations;
    // Legacy format: { items: [...], total: N }
    if (catalogData.items) return catalogData.items;
    // Or it might return an array directly
    if (Array.isArray(catalogData)) return catalogData;
    return [];
  }, [catalogData]);
  
  // ListFilter calculators
  const filteredCalculators = useMemo(() => {
    let result = calculators;
    
    // ListFilter by category/domain
    if (activeCategory !== 'all') {
      result = result.filter(calc => {
        const domain = calc.domain || calc.category || '';
        return domain.toLowerCase() === activeCategory.toLowerCase();
      });
    }
    
    // ListFilter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(calc => 
        calc.name?.toLowerCase().includes(query) ||
        calc.description?.toLowerCase().includes(query) ||
        calc.equation?.toLowerCase().includes(query) ||
        calc.id?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [calculators, activeCategory, searchQuery]);
  
  // Count by category
  const categoryCounts = useMemo(() => {
    const counts = { all: calculators.length };
    calculators.forEach(calc => {
      const domain = calc.domain || calc.category || 'general';
      counts[domain.toLowerCase()] = (counts[domain.toLowerCase()] || 0) + 1;
    });
    return counts;
  }, [calculators]);
  
  // Handle calculator click
  const handleCalculatorClick = (calculator) => {
    setSelectedCalculator(calculator);
    setIsModalOpen(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCalculator(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Engineering Calculators
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {calculators.length > 0 
              ? `${calculators.length} equations available from database`
              : 'Loading calculations from database...'
            }
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search equations, calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* ListFilter Tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterTab
          label="All"
          count={categoryCounts.all}
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          color="#3b82f6"
        />
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <FilterTab
            key={key}
            label={meta.label}
            count={categoryCounts[key]}
            active={activeCategory === key}
            onClick={() => setActiveCategory(key)}
            color={meta.color}
          />
        ))}
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Loading calculators from database...
          </p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Calculators
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error.message || 'Unable to connect to the backend server.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </Card>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredCalculators.length === 0 && (
        <Card className="p-8 text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Calculators Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? `No calculators match "${searchQuery}"`
              : 'No calculators available in this category.'
            }
          </p>
        </Card>
      )}
      
      {/* Calculator Grid */}
      {!isLoading && !error && filteredCalculators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalculators.map((calculator) => (
            <CalculatorCard
              key={calculator.id}
              calculator={calculator}
              onClick={handleCalculatorClick}
            />
          ))}
        </div>
      )}
      
      {/* Calculator Modal */}
      <CalculatorModal
        calculator={selectedCalculator}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
