import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pipelinesService, DOMAIN_META, DIFFICULTY_COLORS } from '../services/pipelinesService';
import { Card, Input, Loader, Button } from '../components/ui';
import { 
  Zap, Cog, Building2, Search, Clock, 
  CircleAlert, ChevronRight, Play, Layers,
  CircleCheck, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Icon mapping
const ICON_MAP = {
  Zap,
  Cog,
  Building2,
};

/**
 * Pipeline Card Component
 */
function PipelineCard({ pipeline, onClick }) {
  const domain = pipeline.domain || 'civil';
  const meta = DOMAIN_META[domain] || DOMAIN_META.civil;
  const IconComponent = ICON_MAP[meta.icon] || Layers;
  const difficulty = pipeline.difficulty || pipeline.difficulty_level || 'beginner';
  const difficultyStyle = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.beginner;
  
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
      onClick={() => onClick(pipeline)}
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
              {pipeline.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {pipeline.description}
            </p>
            
            {/* Meta info */}
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
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                difficultyStyle.bg,
                difficultyStyle.text
              )}>
                {difficulty}
              </span>
              {pipeline.step_count && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <Layers className="w-3 h-3 mr-1" />
                  {pipeline.step_count} steps
                </span>
              )}
              {pipeline.estimated_time && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {pipeline.estimated_time}
                </span>
              )}
            </div>
            
            {/* Tags */}
            {pipeline.tags && pipeline.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pipeline.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {pipeline.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{pipeline.tags.length - 3}</span>
                )}
              </div>
            )}
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
 * Pipeline Execution Modal
 */
function PipelineModal({ pipeline, isOpen, onClose }) {
  const [inputs, setInputs] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [outputs, setOutputs] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch pipeline details
  const { data: pipelineDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['pipeline-details', pipeline?.id],
    queryFn: () => pipelinesService.getById(pipeline.id),
    enabled: !!pipeline?.id && isOpen,
  });
  
  // Reset state when pipeline changes
  useState(() => {
    setInputs({});
    setOutputs(null);
    setError(null);
    setCurrentStep(0);
  }, [pipeline?.id]);
  
  // Handle input change
  const handleInputChange = (inputName, value) => {
    setInputs(prev => ({
      ...prev,
      [inputName]: value === '' ? '' : parseFloat(value),
    }));
  };
  
  // Handle pipeline execution
  const handleExecute = async () => {
    if (!pipeline) return;
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await pipelinesService.execute(pipeline.id, inputs);
      setOutputs(result.outputs || result.results || result);
      setCurrentStep((pipelineDetails?.steps?.length || 1) - 1);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Pipeline execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (!isOpen || !pipeline) return null;
  
  const domain = pipeline.domain || 'civil';
  const meta = DOMAIN_META[domain] || DOMAIN_META.civil;
  const IconComponent = ICON_MAP[meta.icon] || Layers;
  const details = pipelineDetails || pipeline;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
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
                  {pipeline.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {pipeline.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Steps Flow */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Pipeline Steps
                  </h3>
                  
                  <div className="space-y-3">
                    {details.steps && details.steps.length > 0 ? (
                      details.steps.map((step, index) => (
                        <div 
                          key={step.id || index}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                            index === currentStep 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : index < currentStep
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <div className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            index === currentStep 
                              ? "bg-blue-500 text-white" 
                              : index < currentStep
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          )}>
                            {index < currentStep ? (
                              <CircleCheck className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {step.name || `Step ${index + 1}`}
                            </p>
                            {step.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {step.description}
                              </p>
                            )}
                          </div>
                          {index < (details.steps?.length || 0) - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-300 absolute left-3 -bottom-3" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No steps defined for this pipeline.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Right: Inputs & Outputs */}
                <div>
                  {/* Inputs Section */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Inputs
                  </h3>
                  
                  {details.inputs && details.inputs.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {details.inputs.map((input, index) => (
                        <div key={input.name || index}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {input.label || input.name}
                            {input.unit && <span className="text-gray-400 ml-1">({input.unit})</span>}
                          </label>
                          
                          {input.type === 'select' ? (
                            <select
                              value={inputs[input.name] || input.default || ''}
                              onChange={(e) => handleInputChange(input.name, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                              {input.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type="number"
                              placeholder={input.default?.toString() || `Enter ${input.name}`}
                              value={inputs[input.name] ?? ''}
                              onChange={(e) => handleInputChange(input.name, e.target.value)}
                              step="any"
                            />
                          )}
                          
                          {input.help_text && (
                            <p className="text-xs text-gray-500 mt-1">{input.help_text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      No inputs required for this pipeline.
                    </p>
                  )}
                  
                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                      <CircleAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                  
                  {/* Outputs */}
                  {outputs && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Results
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(outputs).map(([key, value]) => (
                          !key.startsWith('_') && (
                            <div 
                              key={key}
                              className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                            >
                              <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                                {typeof value === 'number' ? value.toFixed(4) : String(value)}
                              </p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || isLoadingDetails}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Main Pipelines Page
 */
export default function PipelinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDomain, setActiveDomain] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch pipelines from backend
  const { 
    data: pipelines = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['pipelines', activeDomain !== 'all' ? activeDomain : null],
    queryFn: () => pipelinesService.getAll(activeDomain !== 'all' ? activeDomain : null),
  });
  
  // ListFilter pipelines
  const filteredPipelines = useMemo(() => {
    let result = pipelines;
    
    // ListFilter by difficulty
    if (activeDifficulty !== 'all') {
      result = result.filter(p => {
        const difficulty = (p.difficulty || p.difficulty_level || '').toLowerCase();
        return difficulty === activeDifficulty;
      });
    }
    
    // ListFilter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [pipelines, activeDifficulty, searchQuery]);
  
  // Count by domain
  const domainCounts = useMemo(() => {
    const counts = { all: pipelines.length };
    pipelines.forEach(p => {
      const domain = p.domain || 'general';
      counts[domain] = (counts[domain] || 0) + 1;
    });
    return counts;
  }, [pipelines]);
  
  // Handle pipeline click
  const handlePipelineClick = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsModalOpen(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPipeline(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Engineering Pipelines
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {pipelines.length > 0 
              ? `${pipelines.length} calculation pipelines available`
              : 'Loading pipelines from database...'
            }
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pipelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Domain ListFilter */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Domain
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterTab
              label="All"
              count={domainCounts.all}
              active={activeDomain === 'all'}
              onClick={() => setActiveDomain('all')}
              color="#3b82f6"
            />
            {Object.entries(DOMAIN_META).map(([key, meta]) => (
              <FilterTab
                key={key}
                label={meta.label}
                count={domainCounts[key]}
                active={activeDomain === key}
                onClick={() => setActiveDomain(key)}
                color={meta.color}
              />
            ))}
          </div>
        </div>
        
        {/* Difficulty ListFilter */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDifficulty('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                activeDifficulty === 'all'
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              All Levels
            </button>
            {Object.entries(DIFFICULTY_COLORS).map(([level, style]) => (
              <button
                key={level}
                onClick={() => setActiveDifficulty(level)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize",
                  activeDifficulty === level
                    ? "ring-2 ring-offset-2 ring-gray-500"
                    : "",
                  style.bg,
                  style.text
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Loading pipelines from database...
          </p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Pipelines
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error.message || 'Unable to connect to the backend server.'}
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredPipelines.length === 0 && (
        <Card className="p-8 text-center">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Pipelines Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? `No pipelines match "${searchQuery}"`
              : 'No pipelines available for the selected filters.'
            }
          </p>
        </Card>
      )}
      
      {/* Pipeline Grid */}
      {!isLoading && !error && filteredPipelines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onClick={handlePipelineClick}
            />
          ))}
        </div>
      )}
      
      {/* Pipeline Modal */}
      <PipelineModal
        pipeline={selectedPipeline}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
