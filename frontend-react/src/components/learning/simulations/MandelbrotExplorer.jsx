import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Button } from '../../ui';
import { ZoomIn, ZoomOut, RotateCcw, Move, Target, BookOpen, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function MandelbrotExplorer() {
  const canvasRef = useRef(null);
  const [maxIter, setMaxIter] = useState(100);
  const [center, setCenter] = useState({ x: -0.5, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [iterHistogram, setIterHistogram] = useState([]);

  // Color palette for the fractal
  const getColor = (iterations, maxIterations) => {
    if (iterations === maxIterations) {
      return { r: 0, g: 0, b: 0 }; // Black for points in the set
    }
    
    // Create smooth color gradient
    const t = iterations / maxIterations;
    const hue = (t * 360) % 360;
    const saturation = 0.8;
    const lightness = 0.5;
    
    // HSL to RGB conversion
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness - c / 2;
    
    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Calculate if a point is in the Mandelbrot set
  const calculatePoint = useCallback((cx, cy, maxIterations) => {
    let x = 0, y = 0;
    let iteration = 0;
    
    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const xTemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xTemp;
      iteration++;
    }
    
    // Smooth coloring
    if (iteration < maxIterations) {
      const logZn = Math.log(x * x + y * y) / 2;
      const nu = Math.log(logZn / Math.log(2)) / Math.log(2);
      iteration = iteration + 1 - nu;
    }
    
    return iteration;
  }, []);

  // Render the Mandelbrot set
  const renderMandelbrot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const scale = 3 / (zoom * Math.min(width, height));
    const histogram = new Array(maxIter).fill(0);
    
    // First pass: calculate iterations
    const iterations = [];
    for (let py = 0; py < height; py++) {
      const row = [];
      for (let px = 0; px < width; px++) {
        const cx = center.x + (px - width / 2) * scale;
        const cy = center.y + (py - height / 2) * scale;
        const iter = calculatePoint(cx, cy, maxIter);
        row.push(iter);
        if (iter < maxIter) {
          histogram[Math.floor(iter)]++;
        }
      }
      iterations.push(row);
    }
    
    // Calculate histogram for color distribution
    const total = histogram.reduce((a, b) => a + b, 0);
    const hues = [0];
    for (let i = 0; i < maxIter; i++) {
      hues.push(hues[i] + histogram[i] / total);
    }
    
    // Second pass: apply colors
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const iter = iterations[py][px];
        const idx = (py * width + px) * 4;
        
        if (iter >= maxIter) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        } else {
          const color = getColor(iter, maxIter);
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Update histogram for display
    setIterHistogram(histogram.slice(0, 50));
  }, [center, zoom, maxIter, calculatePoint]);

  useEffect(() => {
    renderMandelbrot();
  }, [renderMandelbrot]);

  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const scale = 3 / (zoom * Math.min(canvas.width, canvas.height));
    
    setCenter(prev => ({
      x: prev.x - dx * scale,
      y: prev.y - dy * scale
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle click to select a point
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const scale = 3 / (zoom * Math.min(canvas.width, canvas.height));
    
    const cx = center.x + (px - canvas.width / 2) * scale;
    const cy = center.y + (py - canvas.height / 2) * scale;
    const iter = calculatePoint(cx, cy, maxIter);
    
    setSelectedPoint({ x: cx, y: cy, iterations: iter });
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => prev * 1.5);
  const zoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.5));
  const resetView = () => {
    setCenter({ x: -0.5, y: 0 });
    setZoom(1);
    setMaxIter(100);
    setSelectedPoint(null);
  };

  // Preset interesting locations
  const presets = [
    { name: 'Main Bulb', x: -0.5, y: 0, zoom: 1 },
    { name: 'Seahorse Valley', x: -0.75, y: 0.1, zoom: 10 },
    { name: 'Elephant Valley', x: 0.28, y: 0.008, zoom: 50 },
    { name: 'Triple Spiral', x: -0.088, y: 0.654, zoom: 100 },
    { name: 'Mini Mandelbrot', x: -1.768, y: 0.001, zoom: 200 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Mandelbrot Fractal Explorer
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Zoom: {zoom.toFixed(1)}x
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="p-2">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full rounded-lg cursor-move"
              style={{ aspectRatio: '3/2' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
            />
          </Card>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" onClick={zoomIn} className="flex items-center gap-1">
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </Button>
            <Button size="sm" onClick={zoomOut} variant="outline" className="flex items-center gap-1">
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </Button>
            <Button size="sm" onClick={resetView} variant="outline" className="flex items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Iterations Control */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Iterations: {maxIter}
            </h4>
            <input
              type="range"
              min="50"
              max="500"
              value={maxIter}
              onChange={(e) => setMaxIter(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50</span>
              <span>500</span>
            </div>
          </Card>

          {/* Preset Locations */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Move className="w-4 h-4 text-green-500" />
              Interesting Locations
            </h4>
            <div className="space-y-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCenter({ x: preset.x, y: preset.y });
                    setZoom(preset.zoom);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Selected Point Info */}
          {selectedPoint && (
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Selected Point
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Real: {selectedPoint.x.toFixed(6)}</p>
                <p>Imaginary: {selectedPoint.y.toFixed(6)}</p>
                <p className="font-medium text-purple-600 dark:text-purple-400">
                  Iterations: {selectedPoint.iterations.toFixed(1)}
                </p>
                <p className="text-xs mt-2">
                  {selectedPoint.iterations >= maxIter 
                    ? '✓ Point is in the Mandelbrot set'
                    : '✗ Point escaped after ' + Math.floor(selectedPoint.iterations) + ' iterations'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Educational Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          About the Mandelbrot Set
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            The Mandelbrot set is the set of complex numbers <strong>c</strong> for which the function 
            f(z) = z² + c does not diverge to infinity when iterated from z = 0.
          </p>
          <p>
            <strong>Black regions:</strong> Points in the set (bounded iteration)<br/>
            <strong>Colored regions:</strong> Points outside (escape time shown by color)
          </p>
          <p className="text-xs">
            💡 <strong>Tip:</strong> Zoom into the boundary regions to discover infinite complexity and self-similar patterns!
          </p>
        </div>
      </Card>
    </div>
  );
}
