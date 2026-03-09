import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Card, Button } from '../../ui';
import { Play, Pause, RotateCcw, Settings, Zap, Target, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function LissajousFigures() {
  const [freqA, setFreqA] = useState(3);
  const [freqB, setFreqB] = useState(2);
  const [phase, setPhase] = useState(Math.PI / 2);
  const [amplitudeA, setAmplitudeA] = useState(1);
  const [amplitudeB, setAmplitudeB] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showParametric, setShowParametric] = useState(true);

  // Generate Lissajous curve data
  const curveData = useMemo(() => {
    const points = [];
    const numPoints = 500;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      const x = amplitudeA * Math.sin(freqA * t + phase + animationPhase);
      const y = amplitudeB * Math.sin(freqB * t);
      points.push({ x, y, t: i });
    }
    
    return points;
  }, [freqA, freqB, phase, amplitudeA, amplitudeB, animationPhase]);

  // Generate component waves for visualization
  const waveDataA = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * 2 * Math.PI;
      points.push({
        t: i,
        value: amplitudeA * Math.sin(freqA * t + phase + animationPhase)
      });
    }
    return points;
  }, [freqA, phase, amplitudeA, animationPhase]);

  const waveDataB = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * 2 * Math.PI;
      points.push({
        t: i,
        value: amplitudeB * Math.sin(freqB * t)
      });
    }
    return points;
  }, [freqB, amplitudeB]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => prev + 0.05);
    }, 30);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Reset function
  const handleReset = () => {
    setFreqA(3);
    setFreqB(2);
    setPhase(Math.PI / 2);
    setAmplitudeA(1);
    setAmplitudeB(1);
    setAnimationPhase(0);
    setIsAnimating(false);
  };

  // Preset patterns
  const presets = [
    { name: 'Circle', freqA: 1, freqB: 1, phase: Math.PI / 2 },
    { name: 'Figure 8', freqA: 2, freqB: 1, phase: Math.PI / 2 },
    { name: 'Parabola', freqA: 1, freqB: 2, phase: Math.PI / 2 },
    { name: '3:2 Knot', freqA: 3, freqB: 2, phase: Math.PI / 2 },
    { name: '5:4 Complex', freqA: 5, freqB: 4, phase: Math.PI / 2 },
    { name: 'Line', freqA: 1, freqB: 1, phase: 0 },
  ];

  // Calculate curve properties
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const ratio = `${freqA}/${freqB}`;
  const isClosed = gcd(freqA, freqB) === 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" />
          Lissajous Figures Explorer
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className={isAnimating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Pause' : 'Animate'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Lissajous Curve */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Lissajous Curve (X-Y Plot)
            </h4>
            <div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    domain={[-1.5, 1.5]} 
                    tickCount={5}
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    domain={[-1.5, 1.5]} 
                    tickCount={5}
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <ZAxis type="number" range={[1, 1]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <Scatter 
                    data={curveData} 
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth={1}
                    dot={false}
                    line={{ stroke: '#06b6d4', strokeWidth: 2 }}
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {/* Curve Info */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-700 dark:text-cyan-300">
                Frequency Ratio: {freqA}:{freqB}
              </div>
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300">
                Phase: {(phase * 180 / Math.PI).toFixed(0)}°
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300">
                {isClosed ? 'Closed Curve' : 'Open Curve'}
              </div>
            </div>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Frequency Controls */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              Parameters
            </h4>
            
            {/* Frequency A */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Frequency A (X)</span>
                <span className="font-mono">{freqA}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={freqA}
                onChange={(e) => setFreqA(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
              />
            </div>

            {/* Frequency B */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Frequency B (Y)</span>
                <span className="font-mono">{freqB}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={freqB}
                onChange={(e) => setFreqB(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
              />
            </div>

            {/* Phase */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Phase Shift</span>
                <span className="font-mono">{(phase * 180 / Math.PI).toFixed(0)}°</span>
              </label>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.1"
                value={phase}
                onChange={(e) => setPhase(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
              />
            </div>

            {/* Amplitude A */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Amplitude A</span>
                <span className="font-mono">{amplitudeA.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={amplitudeA}
                onChange={(e) => setAmplitudeA(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
              />
            </div>

            {/* Amplitude B */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>Amplitude B</span>
                <span className="font-mono">{amplitudeB.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={amplitudeB}
                onChange={(e) => setAmplitudeB(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
              />
            </div>
          </Card>

          {/* Presets */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Preset Patterns
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFreqA(preset.freqA);
                    setFreqB(preset.freqB);
                    setPhase(preset.phase);
                  }}
                  className="px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Component Waves */}
      {showParametric && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Component Waves</h4>
            <button
              onClick={() => setShowParametric(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                X(t) = {amplitudeA.toFixed(1)} × sin({freqA}t + {(phase * 180 / Math.PI).toFixed(0)}°)
              </p>
              <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waveDataA}>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[-1.5, 1.5]} hide />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Y(t) = {amplitudeB.toFixed(1)} × sin({freqB}t)
              </p>
              <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waveDataB}>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[-1.5, 1.5]} hide />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!showParametric && (
        <button
          onClick={() => setShowParametric(true)}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          Show Component Waves
        </button>
      )}

      {/* Educational Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          About Lissajous Figures
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            Lissajous figures are the curves traced by a point moving in two perpendicular directions 
            according to sinusoidal motion. They are described by the parametric equations:
          </p>
          <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded">
            x(t) = A × sin(a×t + φ)<br/>
            y(t) = B × sin(b×t)
          </div>
          <p>
            <strong>Ratio a:b:</strong> Determines the basic shape<br/>
            <strong>Phase φ:</strong> Controls the rotation/orientation<br/>
            <strong>Amplitudes A, B:</strong> Control the width and height
          </p>
          <p className="text-xs">
            💡 Lissajous figures are used in physics to study harmonic motion and in electronics 
            to compare frequencies and measure phase differences.
          </p>
        </div>
      </Card>
    </div>
  );
}
