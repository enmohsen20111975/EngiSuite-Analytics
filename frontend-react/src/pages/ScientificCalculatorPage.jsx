import { useState, useCallback, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import {
  History, SquareFunction
} from 'lucide-react';
import { cn } from '../lib/utils';

// Scientific constants
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  phi: 1.618033988749, // Golden ratio
  c: 299792458, // Speed of light (m/s)
  g: 9.80665, // Standard gravity (m/s²)
  G: 6.674e-11, // Gravitational constant
  h: 6.626e-34, // Planck constant
  e_charge: 1.602e-19, // Elementary charge
};

// Calculator history storage
const useHistory = (maxLength = 20) => {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((expression, result) => {
    setHistory(prev => {
      const newHistory = [{ expression, result, timestamp: new Date() }, ...prev];
      return newHistory.slice(0, maxLength);
    });
  }, [maxLength]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
};

/**
 * Scientific Calculator Page
 */
export default function ScientificCalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [lastAnswer, setLastAnswer] = useState('');
  const [isShifted, setIsShifted] = useState(false);
  const [angleMode, setAngleMode] = useState('deg'); // 'deg' or 'rad'
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  
  const { history, addToHistory, clearHistory } = useHistory();

  // Handle number input
  const handleNumber = (num) => {
    setError(null);
    if (display === '0' || error) {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  // Handle operator input
  const handleOperator = (op) => {
    setError(null);
    setDisplay(display + op);
  };

  // Handle function input
  const handleFunction = (func) => {
    setError(null);
    if (isShifted) setIsShifted(false);
    setDisplay(display + func + '(');
  };

  // Handle constant input
  const handleConstant = (constant) => {
    setError(null);
    const value = CONSTANTS[constant];
    setDisplay(display === '0' ? String(value) : display + value);
  };

  // Handle decimal point
  const handleDecimal = () => {
    setError(null);
    const parts = display.split(/[\+\-\*\/]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle parentheses
  const handleParentheses = (paren) => {
    setError(null);
    setDisplay(display + paren);
  };

  const handleRawInput = (value) => {
    setError(null);
    setDisplay(prev => prev === '0' ? value : `${prev}${value}`);
  };

  // Clear display
  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setError(null);
    setIsShifted(false);
  };

  // Backspace
  const handleBackspace = () => {
    setError(null);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Toggle sign
  const handleToggleSign = () => {
    setError(null);
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const evaluateExpression = useCallback((rawExpression) => {
    let expr = rawExpression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/φ/g, `(${CONSTANTS.phi})`)
      .replace(/τ/g, `(${Math.PI * 2})`)
      .replace(/\bANS\b/g, `(${lastAnswer || 0})`)
      .replace(/(^|[^\dA-Za-z_])e(?=($|[^\dA-Za-z_]))/g, `$1(${Math.E})`);

    expr = expr
      .replace(/(\d+(?:\.\d+)?)\(/g, '$1*(')
      .replace(/\)(\d+(?:\.\d+)?)/g, ')*$1');

    if (angleMode === 'deg') {
      expr = expr
        .replace(/\basin\(/g, '(180/Math.PI)*Math.asin(')
        .replace(/\bacos\(/g, '(180/Math.PI)*Math.acos(')
        .replace(/\batan\(/g, '(180/Math.PI)*Math.atan(')
        .replace(/\basec\(/g, 'asecDegFn(')
        .replace(/\bacsc\(/g, 'acscDegFn(')
        .replace(/\bacot\(/g, 'acotDegFn(')
        .replace(/\bsin\(/g, 'Math.sin(Math.PI/180*')
        .replace(/\bcos\(/g, 'Math.cos(Math.PI/180*')
        .replace(/\btan\(/g, 'Math.tan(Math.PI/180*')
        .replace(/\bsec\(/g, 'secFn(Math.PI/180*')
        .replace(/\bcsc\(/g, 'cscFn(Math.PI/180*')
        .replace(/\bcot\(/g, 'cotFn(Math.PI/180*');
    } else {
      expr = expr
        .replace(/\basin\(/g, 'Math.asin(')
        .replace(/\bacos\(/g, 'Math.acos(')
        .replace(/\batan\(/g, 'Math.atan(')
        .replace(/\basec\(/g, 'asecRadFn(')
        .replace(/\bacsc\(/g, 'acscRadFn(')
        .replace(/\bacot\(/g, 'acotRadFn(')
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')
        .replace(/\bsec\(/g, 'secFn(')
        .replace(/\bcsc\(/g, 'cscFn(')
        .replace(/\bcot\(/g, 'cotFn(');
    }

    expr = expr
      .replace(/\bsqrt\(/g, 'Math.sqrt(')
      .replace(/\bcbrt\(/g, 'Math.cbrt(')
      .replace(/\blog\(/g, 'Math.log10(')
      .replace(/\bln\(/g, 'Math.log(')
      .replace(/\bexp\(/g, 'Math.exp(')
      .replace(/\babs\(/g, 'Math.abs(')
      .replace(/\bfloor\(/g, 'Math.floor(')
      .replace(/\bceil\(/g, 'Math.ceil(')
      .replace(/\bround\(/g, 'Math.round(')
      .replace(/\btrunc\(/g, 'Math.trunc(')
      .replace(/\bsign\(/g, 'Math.sign(')
      .replace(/\bsinh\(/g, 'Math.sinh(')
      .replace(/\bcosh\(/g, 'Math.cosh(')
      .replace(/\btanh\(/g, 'Math.tanh(')
      .replace(/\basinh\(/g, 'Math.asinh(')
      .replace(/\bacosh\(/g, 'Math.acosh(')
      .replace(/\batanh\(/g, 'Math.atanh(')
      .replace(/\bmod\(/g, 'modFn(')
      .replace(/\brand\(/g, 'Math.random(')
      .replace(/\^/g, '**')
      .replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');

    const factorial = (n) => {
      if (!Number.isInteger(n) || n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };

    const nPr = (n, r) => {
      if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) return NaN;
      return factorial(n) / factorial(n - r);
    };

    const nCr = (n, r) => {
      if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) return NaN;
      return factorial(n) / (factorial(r) * factorial(n - r));
    };

    const nthRoot = (x, n) => {
      if (n === 0) return NaN;
      if (x < 0 && n % 2 === 0) return NaN;
      return Math.sign(x) * Math.pow(Math.abs(x), 1 / n);
    };

    const modFn = (a, b) => a % b;
    const secFn = (x) => 1 / Math.cos(x);
    const cscFn = (x) => 1 / Math.sin(x);
    const cotFn = (x) => 1 / Math.tan(x);
    const asecRadFn = (x) => Math.acos(1 / x);
    const acscRadFn = (x) => Math.asin(1 / x);
    const acotRadFn = (x) => Math.atan(1 / x);
    const asecDegFn = (x) => (180 / Math.PI) * Math.acos(1 / x);
    const acscDegFn = (x) => (180 / Math.PI) * Math.asin(1 / x);
    const acotDegFn = (x) => (180 / Math.PI) * Math.atan(1 / x);

    return Function(`
      "use strict";
      const factorial = ${factorial.toString()};
      const nPr = ${nPr.toString()};
      const nCr = ${nCr.toString()};
      const nthRoot = ${nthRoot.toString()};
      const modFn = ${modFn.toString()};
      const secFn = ${secFn.toString()};
      const cscFn = ${cscFn.toString()};
      const cotFn = ${cotFn.toString()};
      const asecRadFn = ${asecRadFn.toString()};
      const acscRadFn = ${acscRadFn.toString()};
      const acotRadFn = ${acotRadFn.toString()};
      const asecDegFn = ${asecDegFn.toString()};
      const acscDegFn = ${acscDegFn.toString()};
      const acotDegFn = ${acotDegFn.toString()};
      return (${expr});
    `)();
  }, [angleMode, lastAnswer]);

  // Calculate result
  const handleCalculate = () => {
    try {
      setError(null);
      const result = evaluateExpression(display);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
      }

      // Format result
      let formatted;
      if (Math.abs(result) < 0.0001 || Math.abs(result) > 999999999) {
        formatted = result.toExponential(6);
      } else {
        formatted = parseFloat(result.toPrecision(10)).toString();
      }

      setExpression(display);
      setDisplay(formatted);
      setLastAnswer(formatted);
      addToHistory(display, formatted);
    } catch (err) {
      setError('Error');
      setDisplay('Error');
    }
  };

  // Handle percentage
  const handlePercent = () => {
    try {
      const value = evaluateExpression(display);
      if (!isNaN(value)) {
        setDisplay(String(value / 100));
      }
    } catch {
      setError('Error');
    }
  };

  // Handle square
  const handleSquare = () => {
    try {
      const value = evaluateExpression(display);
      if (!isNaN(value)) {
        setDisplay(String(value * value));
      }
    } catch {
      setError('Error');
    }
  };

  // Handle square root
  const handleSquareRoot = () => {
    try {
      const value = evaluateExpression(display);
      if (!isNaN(value)) {
        setDisplay(String(Math.sqrt(value)));
      }
    } catch {
      setError('Error');
    }
  };

  // Handle inverse
  const handleInverse = () => {
    try {
      const value = evaluateExpression(display);
      if (!isNaN(value) && value !== 0) {
        setDisplay(String(1 / value));
      }
    } catch {
      setError('Error');
    }
  };

  // Memory functions
  const handleMemoryClear = () => setMemory(0);
  const handleMemoryRecall = () => setDisplay(prev => prev === '0' ? String(memory) : `${prev}${memory}`);
  const handleMemoryAdd = () => {
    try {
      const value = evaluateExpression(display);
      setMemory(prev => prev + (isNaN(value) ? 0 : value));
    } catch {
      setError('Error');
    }
  };
  const handleMemorySubtract = () => {
    try {
      const value = evaluateExpression(display);
      setMemory(prev => prev - (isNaN(value) ? 0 : value));
    } catch {
      setError('Error');
    }
  };

  const handleAns = () => {
    if (!lastAnswer) return;
    setError(null);
    setDisplay(prev => prev === '0' ? 'ANS' : `${prev}ANS`);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        handleCalculate();
        return;
      }

      if (event.key === 'Escape') {
        handleClear();
        return;
      }

      if (event.key === 'Backspace') {
        handleBackspace();
        return;
      }

      const allowedKeys = ['+', '-', '*', '/', '^', '.', '(', ')', '%'];
      if ((event.key >= '0' && event.key <= '9') || allowedKeys.includes(event.key)) {
        setError(null);
        setDisplay(prev => prev === '0' ? event.key : `${prev}${event.key}`);
        return;
      }

      if (event.key.toLowerCase() === 'p') {
        handleRawInput('π');
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        handleFunction('rand');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCalculate]);

  // Button component
  const CalcButton = ({ onClick, children, variant = 'default', className, span = 1 }) => {
    const variants = {
      default: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
      operator: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      function: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      equals: 'bg-green-500 hover:bg-green-600 text-white',
      clear: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300',
    };

    return (
      <button
        onClick={onClick}
        className={cn(
          'h-14 rounded-xl font-semibold text-lg transition-all duration-150 active:scale-95',
          variants[variant],
          span === 2 && 'col-span-2',
          className
        )}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SquareFunction className="w-7 h-7 text-blue-500" />
            Scientific Calculator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Advanced engineering calculations with scientific functions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShifted(prev => !prev)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              isShifted
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            Shift
          </button>
          <button
            onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              angleMode === 'deg'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            {angleMode.toUpperCase()}
          </button>
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calculator */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Display */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="text-sm text-gray-500 dark:text-gray-400 h-6 overflow-hidden">
                {expression}
              </div>
              <div className={cn(
                'text-3xl font-mono font-bold text-right overflow-x-auto',
                error ? 'text-red-500' : 'text-gray-900 dark:text-white'
              )}>
                {display}
              </div>
              {memory !== 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  M: {memory}
                </div>
              )}
            </div>

            {/* Scientific Functions */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <CalcButton variant="function" onClick={() => handleFunction(isShifted ? 'asin' : 'sin')}>
                {isShifted ? 'sin⁻¹' : 'sin'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction(isShifted ? 'acos' : 'cos')}>
                {isShifted ? 'cos⁻¹' : 'cos'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction(isShifted ? 'atan' : 'tan')}>
                {isShifted ? 'tan⁻¹' : 'tan'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleOperator('10^') : handleFunction('log')}>
                {isShifted ? '10ˣ' : 'log'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('exp') : handleFunction('ln')}>
                {isShifted ? 'eˣ' : 'ln'}
              </CalcButton>
              
              <CalcButton variant="function" onClick={() => handleFunction('sqrt')}>√</CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('nthRoot') : handleFunction('cbrt')}>
                {isShifted ? 'ʸ√x' : '∛'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleOperator('^3') : handleOperator('^')}>
                {isShifted ? 'x³' : 'xʸ'}
              </CalcButton>
              <CalcButton variant="function" onClick={handleSquare}>x²</CalcButton>
              <CalcButton variant="function" onClick={handleInverse}>x⁻¹</CalcButton>
              
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('asinh') : handleFunction('sinh')}>
                {isShifted ? 'sinh⁻¹' : 'sinh'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('acosh') : handleFunction('cosh')}>
                {isShifted ? 'cosh⁻¹' : 'cosh'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('atanh') : handleFunction('tanh')}>
                {isShifted ? 'tanh⁻¹' : 'tanh'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('mod')}>mod</CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('rand')}>rand</CalcButton>

              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('asec') : handleFunction('sec')}>
                {isShifted ? 'sec⁻¹' : 'sec'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('acsc') : handleFunction('csc')}>
                {isShifted ? 'csc⁻¹' : 'csc'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('acot') : handleFunction('cot')}>
                {isShifted ? 'cot⁻¹' : 'cot'}
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('nPr')}>nPr</CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('nCr')}>nCr</CalcButton>

              <CalcButton variant="function" onClick={() => handleOperator('!')}>n!</CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('abs')}>|x|</CalcButton>
              <CalcButton variant="function" onClick={handleSquareRoot}>√x</CalcButton>
              <CalcButton variant="function" onClick={() => handleFunction('floor')}>⌊x⌋</CalcButton>
              <CalcButton variant="function" onClick={() => isShifted ? handleFunction('trunc') : handleFunction('ceil')}>
                {isShifted ? 'trunc' : '⌈x⌉'}
              </CalcButton>
            </div>

            {/* Memory and Constants */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <CalcButton variant="function" onClick={handleMemoryClear}>MC</CalcButton>
              <CalcButton variant="function" onClick={handleMemoryRecall}>MR</CalcButton>
              <CalcButton variant="function" onClick={handleMemoryAdd}>M+</CalcButton>
              <CalcButton variant="function" onClick={handleMemorySubtract}>M-</CalcButton>
              <CalcButton variant="function" onClick={() => handleConstant('pi')}>π</CalcButton>
              <CalcButton variant="function" onClick={handleAns}>ANS</CalcButton>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
              <CalcButton variant="function" onClick={() => handleConstant('e')}>e</CalcButton>
              <CalcButton variant="function" onClick={() => handleRawInput('φ')}>φ</CalcButton>
              <CalcButton variant="function" onClick={() => handleRawInput('τ')}>τ</CalcButton>
              <CalcButton variant="function" onClick={() => handleConstant('c')}>c</CalcButton>
              <CalcButton variant="function" onClick={() => handleConstant('g')}>g</CalcButton>
              <CalcButton variant="function" onClick={() => handleConstant('G')}>G</CalcButton>
            </div>

            {/* Main Calculator Pad */}
            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="clear" onClick={handleClear}>AC</CalcButton>
              <CalcButton variant="clear" onClick={handleBackspace}>⌫</CalcButton>
              <CalcButton variant="operator" onClick={handlePercent}>%</CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator('÷')}>÷</CalcButton>

              <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
              <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
              <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator('×')}>×</CalcButton>

              <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
              <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
              <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator('-')}>−</CalcButton>

              <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
              <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
              <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator('+')}>+</CalcButton>

              <CalcButton onClick={handleToggleSign}>±</CalcButton>
              <CalcButton onClick={() => handleNumber('0')}>0</CalcButton>
              <CalcButton onClick={handleDecimal}>.</CalcButton>
              <CalcButton variant="equals" onClick={handleCalculate}>=</CalcButton>
            </div>

            {/* Parentheses Row */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <CalcButton variant="operator" onClick={() => handleParentheses('(')}>(</CalcButton>
              <CalcButton variant="operator" onClick={() => handleParentheses(')')}>)</CalcButton>
              <CalcButton variant="function" onClick={() => handleConstant('h')}>h</CalcButton>
            </div>
          </Card>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No calculations yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setDisplay(item.expression)}
                    className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.expression}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      = {item.result}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Reference */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">π (Pi)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">3.1415926535...</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">e (Euler's)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">2.718281828...</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">sin, cos, tan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trig functions</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">log</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Base 10 logarithm</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">ln</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Natural logarithm</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">n!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Factorial</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">nPr, nCr</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Permutations & combinations</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">sinh, cosh, tanh</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hyperbolic functions</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">sec, csc, cot</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reciprocal trig functions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
