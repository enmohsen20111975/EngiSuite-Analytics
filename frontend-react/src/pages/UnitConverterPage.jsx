import { useState, useMemo } from 'react';
import { Card, Button, Input } from '../components/ui';
import {
  ArrowRightLeft, RotateCcw, Copy, Check, ChevronDown,
  Ruler, Scale, Thermometer, Zap, Droplet, Gauge,
  Timer, Weight, DollarSign, Volume2
} from 'lucide-react';
import { cn } from '../lib/utils';

// Unit categories with their units and conversion factors
const unitCategories = [
  {
    id: 'length',
    name: 'Length',
    icon: Ruler,
    baseUnit: 'm',
    units: {
      'mm': { name: 'Millimeter', factor: 0.001 },
      'cm': { name: 'Centimeter', factor: 0.01 },
      'm': { name: 'Meter', factor: 1 },
      'km': { name: 'Kilometer', factor: 1000 },
      'in': { name: 'Inch', factor: 0.0254 },
      'ft': { name: 'Foot', factor: 0.3048 },
      'yd': { name: 'Yard', factor: 0.9144 },
      'mi': { name: 'Mile', factor: 1609.344 },
    },
  },
  {
    id: 'mass',
    name: 'Mass',
    icon: Weight,
    baseUnit: 'kg',
    units: {
      'mg': { name: 'Milligram', factor: 0.000001 },
      'g': { name: 'Gram', factor: 0.001 },
      'kg': { name: 'Kilogram', factor: 1 },
      't': { name: 'Metric Ton', factor: 1000 },
      'oz': { name: 'Ounce', factor: 0.0283495 },
      'lb': { name: 'Pound', factor: 0.453592 },
      'st': { name: 'Stone', factor: 6.35029 },
    },
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: Thermometer,
    baseUnit: 'C',
    special: true,
    units: {
      'C': { name: 'Celsius' },
      'F': { name: 'Fahrenheit' },
      'K': { name: 'Kelvin' },
    },
  },
  {
    id: 'area',
    name: 'Area',
    icon: Scale,
    baseUnit: 'm²',
    units: {
      'mm²': { name: 'Square Millimeter', factor: 0.000001 },
      'cm²': { name: 'Square Centimeter', factor: 0.0001 },
      'm²': { name: 'Square Meter', factor: 1 },
      'km²': { name: 'Square Kilometer', factor: 1000000 },
      'ha': { name: 'Hectare', factor: 10000 },
      'in²': { name: 'Square Inch', factor: 0.00064516 },
      'ft²': { name: 'Square Foot', factor: 0.092903 },
      'ac': { name: 'Acre', factor: 4046.86 },
    },
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: Volume2,
    baseUnit: 'L',
    units: {
      'mL': { name: 'Milliliter', factor: 0.001 },
      'L': { name: 'Liter', factor: 1 },
      'm³': { name: 'Cubic Meter', factor: 1000 },
      'gal': { name: 'US Gallon', factor: 3.78541 },
      'qt': { name: 'US Quart', factor: 0.946353 },
      'pt': { name: 'US Pint', factor: 0.473176 },
      'fl oz': { name: 'US Fluid Ounce', factor: 0.0295735 },
    },
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: Gauge,
    baseUnit: 'm/s',
    units: {
      'm/s': { name: 'Meters per Second', factor: 1 },
      'km/h': { name: 'Kilometers per Hour', factor: 0.277778 },
      'mph': { name: 'Miles per Hour', factor: 0.44704 },
      'knot': { name: 'Knot', factor: 0.514444 },
      'ft/s': { name: 'Feet per Second', factor: 0.3048 },
    },
  },
  {
    id: 'time',
    name: 'Time',
    icon: Timer,
    baseUnit: 's',
    units: {
      'ms': { name: 'Millisecond', factor: 0.001 },
      's': { name: 'Second', factor: 1 },
      'min': { name: 'Minute', factor: 60 },
      'h': { name: 'Hour', factor: 3600 },
      'd': { name: 'Day', factor: 86400 },
      'wk': { name: 'Week', factor: 604800 },
      'mo': { name: 'Month (30 days)', factor: 2592000 },
      'yr': { name: 'Year (365 days)', factor: 31536000 },
    },
  },
  {
    id: 'pressure',
    name: 'Pressure',
    icon: Droplet,
    baseUnit: 'Pa',
    units: {
      'Pa': { name: 'Pascal', factor: 1 },
      'kPa': { name: 'Kilopascal', factor: 1000 },
      'MPa': { name: 'Megapascal', factor: 1000000 },
      'bar': { name: 'Bar', factor: 100000 },
      'psi': { name: 'PSI', factor: 6894.76 },
      'atm': { name: 'Atmosphere', factor: 101325 },
    },
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: Zap,
    baseUnit: 'J',
    units: {
      'J': { name: 'Joule', factor: 1 },
      'kJ': { name: 'Kilojoule', factor: 1000 },
      'MJ': { name: 'Megajoule', factor: 1000000 },
      'cal': { name: 'Calorie', factor: 4.184 },
      'kcal': { name: 'Kilocalorie', factor: 4184 },
      'Wh': { name: 'Watt-hour', factor: 3600 },
      'kWh': { name: 'Kilowatt-hour', factor: 3600000 },
      'BTU': { name: 'BTU', factor: 1055.06 },
    },
  },
  {
    id: 'currency',
    name: 'Currency',
    icon: DollarSign,
    baseUnit: 'USD',
    disclaimer: 'Exchange rates are approximate',
    units: {
      'USD': { name: 'US Dollar', factor: 1 },
      'EUR': { name: 'Euro', factor: 0.92 },
      'GBP': { name: 'British Pound', factor: 0.79 },
      'JPY': { name: 'Japanese Yen', factor: 149.5 },
      'CNY': { name: 'Chinese Yuan', factor: 7.24 },
      'INR': { name: 'Indian Rupee', factor: 83.12 },
      'AED': { name: 'UAE Dirham', factor: 3.67 },
      'SAR': { name: 'Saudi Riyal', factor: 3.75 },
      'EGP': { name: 'Egyptian Pound', factor: 30.9 },
    },
  },
];

// Temperature conversion functions
const convertTemperature = (value, fromUnit, toUnit) => {
  // Convert to Celsius first
  let celsius;
  switch (fromUnit) {
    case 'C':
      celsius = value;
      break;
    case 'F':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    default:
      return value;
  }

  // Convert from Celsius to target unit
  switch (toUnit) {
    case 'C':
      return celsius;
    case 'F':
      return celsius * 9 / 5 + 32;
    case 'K':
      return celsius + 273.15;
    default:
      return celsius;
  }
};

/**
 * Unit Converter Page
 */
export default function UnitConverterPage() {
  const [selectedCategory, setSelectedCategory] = useState(unitCategories[0]);
  const [fromUnit, setFromUnit] = useState(Object.keys(unitCategories[0].units)[0]);
  const [toUnit, setToUnit] = useState(Object.keys(unitCategories[0].units)[2]);
  const [fromValue, setFromValue] = useState('1');
  const [copied, setCopied] = useState(false);

  // Calculate converted value
  const convertedValue = useMemo(() => {
    const numValue = parseFloat(fromValue);
    if (isNaN(numValue)) return '';

    if (selectedCategory.special) {
      return convertTemperature(numValue, fromUnit, toUnit);
    }

    const fromFactor = selectedCategory.units[fromUnit]?.factor || 1;
    const toFactor = selectedCategory.units[toUnit]?.factor || 1;
    
    // Convert to base unit, then to target unit
    const baseValue = numValue * fromFactor;
    return baseValue / toFactor;
  }, [fromValue, fromUnit, toUnit, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const units = Object.keys(category.units);
    setFromUnit(units[0]);
    setToUnit(units[2] || units[1]);
    setFromValue('1');
  };

  // Swap units
  const handleSwap = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
  };

  // Reset converter
  const handleReset = () => {
    setFromValue('1');
  };

  // Copy result
  const handleCopy = async () => {
    const text = `${fromValue} ${fromUnit} = ${formatNumber(convertedValue)} ${toUnit}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format number for display
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '';
    if (Math.abs(num) < 0.0001 || Math.abs(num) > 999999999) {
      return num.toExponential(6);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unit Converter</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Convert between different units of measurement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Selection */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
          <div className="space-y-1">
            {unitCategories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory.id === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Converter */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedCategory.name} Conversion
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Converter Interface */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              {/* From Unit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  From
                </label>
                <div className="relative">
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {Object.entries(selectedCategory.units).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {unit.name} ({key})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* To Unit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  To
                </label>
                <div className="relative">
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {Object.entries(selectedCategory.units).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {unit.name} ({key})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formatNumber(convertedValue)}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold"
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Copy result"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Conversion Result */}
            {fromValue && convertedValue !== '' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-center text-lg">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {fromValue} {selectedCategory.units[fromUnit]?.name} ({fromUnit})
                  </span>
                  <span className="mx-3 text-gray-500">=</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {formatNumber(convertedValue)} {selectedCategory.units[toUnit]?.name} ({toUnit})
                  </span>
                </p>
                {selectedCategory.disclaimer && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    * {selectedCategory.disclaimer}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Quick Reference */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Reference - {selectedCategory.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(selectedCategory.units).map(([key, unit]) => (
                <div
                  key={key}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {unit.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Symbol: <span className="font-mono">{key}</span>
                  </p>
                  {unit.factor && selectedCategory.baseUnit && (
                    <p className="text-xs text-gray-400 mt-1">
                      1 {key} = {formatNumber(unit.factor)} {selectedCategory.baseUnit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Common Conversions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Common {selectedCategory.name} Conversions
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      From
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      To
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Factor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getCommonConversions(selectedCategory).map((conv, index) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900 dark:text-white">
                        1 {conv.from}
                      </td>
                      <td className="py-2 text-sm text-gray-900 dark:text-white">
                        {conv.to}
                      </td>
                      <td className="py-2 text-sm text-right font-mono text-gray-600 dark:text-gray-300">
                        {conv.factor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Get common conversions for a category
function getCommonConversions(category) {
  const conversions = {
    length: [
      { from: 'in', to: 'mm', factor: '25.4' },
      { from: 'ft', to: 'm', factor: '0.3048' },
      { from: 'mi', to: 'km', factor: '1.60934' },
      { from: 'yd', to: 'm', factor: '0.9144' },
    ],
    mass: [
      { from: 'lb', to: 'kg', factor: '0.453592' },
      { from: 'oz', to: 'g', factor: '28.3495' },
      { from: 't', to: 'kg', factor: '1000' },
    ],
    temperature: [
      { from: '°C', to: '°F', factor: '× 9/5 + 32' },
      { from: '°F', to: '°C', factor: '(− 32) × 5/9' },
      { from: '°C', to: 'K', factor: '+ 273.15' },
    ],
    area: [
      { from: 'ft²', to: 'm²', factor: '0.092903' },
      { from: 'ac', to: 'ha', factor: '0.404686' },
      { from: 'mi²', to: 'km²', factor: '2.58999' },
    ],
    volume: [
      { from: 'gal', to: 'L', factor: '3.78541' },
      { from: 'fl oz', to: 'mL', factor: '29.5735' },
      { from: 'm³', to: 'L', factor: '1000' },
    ],
    speed: [
      { from: 'mph', to: 'km/h', factor: '1.60934' },
      { from: 'knot', to: 'km/h', factor: '1.852' },
      { from: 'm/s', to: 'km/h', factor: '3.6' },
    ],
    time: [
      { from: 'd', to: 'h', factor: '24' },
      { from: 'wk', to: 'd', factor: '7' },
      { from: 'yr', to: 'd', factor: '365' },
    ],
    pressure: [
      { from: 'bar', to: 'psi', factor: '14.5038' },
      { from: 'atm', to: 'kPa', factor: '101.325' },
      { from: 'MPa', to: 'bar', factor: '10' },
    ],
    energy: [
      { from: 'kWh', to: 'MJ', factor: '3.6' },
      { from: 'BTU', to: 'kJ', factor: '1.05506' },
      { from: 'kcal', to: 'kJ', factor: '4.184' },
    ],
    currency: [
      { from: 'USD', to: 'EUR', factor: '~0.92' },
      { from: 'GBP', to: 'USD', factor: '~1.27' },
      { from: 'EUR', to: 'GBP', factor: '~0.86' },
    ],
  };

  return conversions[category.id] || [];
}
