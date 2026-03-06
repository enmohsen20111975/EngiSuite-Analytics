import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { calculatorsService } from '../services/calculatorsService';
import { Button, Card, Input, Loader } from '../components/ui';
import { 
  Zap, Info, TriangleAlert, CircleCheck, Download,
  ChevronRight, ChevronLeft, FileText, Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';

// Cable types
const CABLE_TYPES = [
  { id: 'pvc', name: 'PVC', maxTemp: 70 },
  { id: 'xlpe', name: 'XLPE', maxTemp: 90 },
  { id: 'epr', name: 'EPR', maxTemp: 90 },
];

// Installation methods
const INSTALLATION_METHODS = [
  { id: 'in_air', name: 'In Air', description: 'Cables installed in free air' },
  { id: 'conduit', name: 'In Conduit', description: 'Cables in conduit or trunking' },
  { id: 'underground', name: 'Underground', description: 'Direct buried or in ducts' },
  { id: 'cable_tray', name: 'Cable Tray', description: 'On cable tray or ladder' },
];

// Voltage levels
const VOLTAGE_LEVELS = [230, 400, 415, 690, 11000, 33000];

/**
 * Cable Sizing Workflow Page
 * Step-by-step cable sizing calculation
 */
export default function CableSizingPage() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    loadCurrent: '',
    voltage: 400,
    powerFactor: 0.85,
    cableLength: '',
    cableType: 'pvc',
    installationMethod: 'in_air',
    phases: 3,
    ambientTemp: 30,
    voltageDropLimit: 3,
    shortCircuitCurrent: '',
    shortCircuitDuration: 1,
  });

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate mutation
  const calculateMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate API call - in production, this would call the real API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock calculation results
      const loadCurrent = parseFloat(data.loadCurrent);
      const voltage = parseFloat(data.voltage);
      const length = parseFloat(data.cableLength);
      
      // Calculate apparent power
      const apparentPower = (Math.sqrt(3) * voltage * loadCurrent) / 1000; // kVA
      
      // Calculate voltage drop (simplified)
      const voltageDrop = (1.732 * loadCurrent * length * 0.0175) / voltage * 100;
      
      // Recommend cable size based on current
      let recommendedSize;
      if (loadCurrent <= 18) recommendedSize = '1.5 mm²';
      else if (loadCurrent <= 24) recommendedSize = '2.5 mm²';
      else if (loadCurrent <= 32) recommendedSize = '4 mm²';
      else if (loadCurrent <= 42) recommendedSize = '6 mm²';
      else if (loadCurrent <= 56) recommendedSize = '10 mm²';
      else if (loadCurrent <= 73) recommendedSize = '16 mm²';
      else if (loadCurrent <= 95) recommendedSize = '25 mm²';
      else if (loadCurrent <= 125) recommendedSize = '35 mm²';
      else if (loadCurrent <= 160) recommendedSize = '50 mm²';
      else if (loadCurrent <= 195) recommendedSize = '70 mm²';
      else if (loadCurrent <= 240) recommendedSize = '95 mm²';
      else if (loadCurrent <= 300) recommendedSize = '120 mm²';
      else if (loadCurrent <= 360) recommendedSize = '150 mm²';
      else if (loadCurrent <= 410) recommendedSize = '185 mm²';
      else if (loadCurrent <= 480) recommendedSize = '240 mm²';
      else recommendedSize = '300 mm²';
      
      return {
        apparentPower: apparentPower.toFixed(2),
        voltageDrop: voltageDrop.toFixed(2),
        recommendedSize,
        currentCapacity: loadCurrent * 1.2, // Derated capacity
        voltageDropOK: voltageDrop < data.voltageDropLimit,
        shortCircuitOK: true,
        recommendations: [
          `Use ${recommendedSize} copper cable`,
          `Maximum length for ${data.voltageDropLimit}% voltage drop: ${(data.voltageDropLimit * voltage / (1.732 * loadCurrent * 0.0175)).toFixed(0)}m`,
          'Consider using XLPE insulation for higher temperature applications',
        ],
      };
    },
    onSuccess: (data) => {
      setResults(data);
      setStep(4);
    },
  });

  // Handle calculate
  const handleCalculate = () => {
    calculateMutation.mutate(formData);
  };

  // Reset workflow
  const handleReset = () => {
    setStep(1);
    setResults(null);
    setFormData({
      loadCurrent: '',
      voltage: 400,
      powerFactor: 0.85,
      cableLength: '',
      cableType: 'pvc',
      installationMethod: 'in_air',
      phases: 3,
      ambientTemp: 30,
      voltageDropLimit: 3,
      shortCircuitCurrent: '',
      shortCircuitDuration: 1,
    });
  };

  // Step configuration
  const steps = [
    { number: 1, title: 'Load Parameters', description: 'Enter electrical load details' },
    { number: 2, title: 'Cable Configuration', description: 'Select cable type and installation' },
    { number: 3, title: 'Constraints', description: 'Set voltage drop and short circuit limits' },
    { number: 4, title: 'Results', description: 'View cable sizing results' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 mb-4">
          <Zap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cable Sizing Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Step-by-step cable sizing based on IEC 60364
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full font-medium',
                step >= s.number
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}>
                {step > s.number ? <CircleCheck className="w-5 h-5" /> : s.number}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={cn(
                  'text-sm font-medium',
                  step >= s.number ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                )}>
                  {s.title}
                </p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'w-12 md:w-24 h-0.5 mx-2',
                  step > s.number ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Load Parameters */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Load Parameters
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Load Current (A) *
              </label>
              <Input
                type="number"
                value={formData.loadCurrent}
                onChange={(e) => updateField('loadCurrent', e.target.value)}
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">The current drawn by the load</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Voltage (V) *
              </label>
              <select
                value={formData.voltage}
                onChange={(e) => updateField('voltage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                {VOLTAGE_LEVELS.map((v) => (
                  <option key={v} value={v}>{v}V</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Power Factor
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.powerFactor}
                onChange={(e) => updateField('powerFactor', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Phases
              </label>
              <select
                value={formData.phases}
                onChange={(e) => updateField('phases', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value={1}>Single Phase</option>
                <option value={3}>Three Phase</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.loadCurrent}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Cable Configuration */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Cable Configuration
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cable Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CABLE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateField('cableType', type.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center transition-colors',
                      formData.cableType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                    <p className="text-xs text-gray-500">Max {type.maxTemp}°C</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Installation Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INSTALLATION_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => updateField('installationMethod', method.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-colors',
                      formData.installationMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cable Length (m) *
                </label>
                <Input
                  type="number"
                  value={formData.cableLength}
                  onChange={(e) => updateField('cableLength', e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ambient Temperature (°C)
                </label>
                <Input
                  type="number"
                  value={formData.ambientTemp}
                  onChange={(e) => updateField('ambientTemp', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!formData.cableLength}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Constraints */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Design Constraints
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  These constraints help determine the minimum cable size required for safe operation.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Voltage Drop (%)
                </label>
                <Input
                  type="number"
                  value={formData.voltageDropLimit}
                  onChange={(e) => updateField('voltageDropLimit', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard: 3% for lighting, 5% for power
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Circuit Current (kA)
                </label>
                <Input
                  type="number"
                  value={formData.shortCircuitCurrent}
                  onChange={(e) => updateField('shortCircuitCurrent', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Circuit Duration (s)
                </label>
                <Input
                  type="number"
                  value={formData.shortCircuitDuration}
                  onChange={(e) => updateField('shortCircuitDuration', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cable Sizing Results
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Recommended Cable Size</p>
                <p className="text-2xl font-bold text-green-600">{results.recommendedSize}</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Apparent Power</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.apparentPower} kVA</p>
              </div>
              
              <div className={cn(
                'p-4 rounded-lg',
                results.voltageDropOK ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              )}>
                <p className="text-sm text-gray-500 mb-1">Voltage Drop</p>
                <p className={cn(
                  'text-2xl font-bold',
                  results.voltageDropOK ? 'text-green-600' : 'text-red-600'
                )}>
                  {results.voltageDrop}%
                  {results.voltageDropOK && <CircleCheck className="inline w-5 h-5 ml-2" />}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Current Capacity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.currentCapacity} A</p>
              </div>
            </div>
          </Card>
          
          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recommendations
            </h3>
            <ul className="space-y-3">
              {results.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          {/* Input Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Input Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Load Current</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.loadCurrent} A</p>
              </div>
              <div>
                <p className="text-gray-500">Voltage</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.voltage} V</p>
              </div>
              <div>
                <p className="text-gray-500">Cable Length</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.cableLength} m</p>
              </div>
              <div>
                <p className="text-gray-500">Cable Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.cableType.toUpperCase()}</p>
              </div>
            </div>
          </Card>
          
          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Start New Calculation
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
