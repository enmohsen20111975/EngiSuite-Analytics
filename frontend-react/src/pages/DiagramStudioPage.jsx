/**
 * Diagram Studio Page - Enhanced Version
 * Full-featured diagram editor with all original SubSaaS features
 * Includes: gradients, 3D effects, animations, alignment, grouping, and more
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Loader, Select } from '../components/ui';
import canvasService from '../services/canvasService';
import {
  Save, FolderOpen, Download, Upload, Trash2, Plus,
  ZoomIn, ZoomOut, Maximize, Grid3x3, CircleQuestionMark,
  MousePointer, Move, Type, Square, Circle, Diamond,
  Copy, Scissors, Clipboard, RotateCcw, RotateCw,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical,
  Group, Ungroup, Layers, Palette, Sparkles, Play, Settings,
  Star, Cloud, User, Minus, ArrowRight, Eye, PenTool
} from 'lucide-react';
import { cn } from '../lib/utils';

// Shape types with all original shapes
const SHAPE_TYPES = {
  rectangle: { name: 'Rectangle', icon: Square, defaultSize: { width: 120, height: 60 } },
  circle: { name: 'Circle', icon: Circle, defaultSize: { width: 80, height: 80 } },
  diamond: { name: 'Diamond', icon: Diamond, defaultSize: { width: 100, height: 80 } },
  parallelogram: { name: 'Parallelogram', icon: Square, defaultSize: { width: 120, height: 60 } },
  terminator: { name: 'Terminator', icon: Circle, defaultSize: { width: 100, height: 50 } },
  hexagon: { name: 'Hexagon', icon: Square, defaultSize: { width: 100, height: 80 } },
  star: { name: 'Star', icon: Star, defaultSize: { width: 80, height: 80 } },
  cylinder: { name: 'Database', icon: Circle, defaultSize: { width: 80, height: 100 } },
  cloud: { name: 'Cloud', icon: Cloud, defaultSize: { width: 120, height: 80 } },
  actor: { name: 'Actor', icon: User, defaultSize: { width: 60, height: 100 } },
  text: { name: 'Text', icon: Type, defaultSize: { width: 100, height: 40 } },
  line: { name: 'Line', icon: Minus, defaultSize: { width: 100, height: 2 } },
  arrow: { name: 'Arrow', icon: ArrowRight, defaultSize: { width: 100, height: 20 } },
};

// Animation types
const ANIMATION_TYPES = {
  none: 'None',
  fadeIn: 'Fade In',
  slideInLeft: 'Slide In Left',
  slideInRight: 'Slide In Right',
  slideInTop: 'Slide In Top',
  slideInBottom: 'Slide In Bottom',
  bounce: 'Bounce',
  pulse: 'Pulse',
  rotate: 'Rotate',
  zoom: 'Zoom',
};

// Default colors
const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#000000', '#ffffff', '#64748b', '#cbd5e1'
];

// Font families
const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
];

/**
 * Shape Component with full styling support
 */
function Shape({ shape, isSelected, onClick, onDragStart, onResize, scale = 1 }) {
  const {
    id, type, x, y, width, height, text, fontSize = 14,
    fill, stroke, strokeWidth = 2, opacity = 1,
    // Gradient support
    useGradient, gradientType, gradientColor1, gradientColor2, gradientAngle,
    // 3D effects
    shadow, shadowBlur, shadowColor, shadowOffset,
    bevel, depth3d,
    // Animation
    animation, animationDuration, animationDelay,
    // Text styling
    textColor, textShadow, textOutline, fontFamily
  } = shape;

  // Generate gradient ID
  const gradientId = `gradient-${id}`;
  
  // Calculate gradient colors
  const getGradientColors = () => {
    if (!useGradient) return fill;
    return gradientType === 'radial'
      ? { type: 'radial', colors: [gradientColor1 || fill, gradientColor2 || stroke] }
      : { type: 'linear', angle: gradientAngle || 0, colors: [gradientColor1 || fill, gradientColor2 || stroke] };
  };

  // Animation styles
  const animationStyle = useMemo(() => {
    if (!animation || animation === 'none') return {};
    
    const duration = (animationDuration || 500) / 1000;
    const delay = (animationDelay || 0) / 1000;
    
    return {
      animationName: animation,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      animationFillMode: 'forwards',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }, [animation, animationDuration, animationDelay]);

  // Shadow filter
  const shadowFilter = shadow ? `drop-shadow(${shadowOffset?.x || 2}px ${shadowOffset?.y || 2}px ${shadowBlur || 4}px ${shadowColor || 'rgba(0,0,0,0.3)'})` : '';

  // Render shape path based on type
  const renderShapePath = () => {
    switch (type) {
      case 'circle':
        return <ellipse cx={width/2} cy={height/2} rx={width/2} ry={height/2} />;
      case 'diamond':
        return <polygon points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`} />;
      case 'parallelogram':
        const skew = 15;
        return <polygon points={`${skew},0 ${width},0 ${width-skew},${height} 0,${height}`} />;
      case 'terminator':
        const r = Math.min(height/2, 20);
        return <rect x="0" y="0" width={width} height={height} rx={r} ry={r} />;
      case 'hexagon':
        const hx = width/4;
        return <polygon points={`${hx},0 ${width-hx},0 ${width},${height/2} ${width-hx},${height} ${hx},${height} 0,${height/2}`} />;
      case 'star':
        const points = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? Math.min(width, height)/2 : Math.min(width, height)/4;
          const angle = (i * 36 - 90) * Math.PI / 180;
          points.push(`${width/2 + radius * Math.cos(angle)},${height/2 + radius * Math.sin(angle)}`);
        }
        return <polygon points={points.join(' ')} />;
      case 'cylinder':
        const cy = height * 0.15;
        return (
          <>
            <ellipse cx={width/2} cy={cy} rx={width/2} ry={cy} />
            <rect x="0" y={cy} width={width} height={height - cy*2} />
            <ellipse cx={width/2} cy={height - cy} rx={width/2} ry={cy} className="fill-current" style={{ fill: useGradient ? `url(#${gradientId})` : fill }} />
          </>
        );
      case 'cloud':
        return (
          <path d={`
            M ${width*0.3},${height*0.7}
            Q ${width*0.1},${height*0.7} ${width*0.1},${height*0.5}
            Q ${width*0.1},${height*0.3} ${width*0.3},${height*0.3}
            Q ${width*0.3},${height*0.1} ${width*0.5},${height*0.1}
            Q ${width*0.7},${height*0.1} ${width*0.7},${height*0.3}
            Q ${width*0.9},${height*0.3} ${width*0.9},${height*0.5}
            Q ${width*0.9},${height*0.7} ${width*0.7},${height*0.7}
            Z
          `} />
        );
      case 'actor':
        return (
          <>
            <circle cx={width/2} cy={height*0.15} r={height*0.1} />
            <line x1={width/2} y1={height*0.25} x2={width/2} y2={height*0.55} strokeWidth={2} />
            <line x1={width*0.15} y1={height*0.35} x2={width*0.85} y2={height*0.35} strokeWidth={2} />
            <line x1={width/2} y1={height*0.55} x2={width*0.2} y2={height*0.9} strokeWidth={2} />
            <line x1={width/2} y1={height*0.55} x2={width*0.8} y2={height*0.9} strokeWidth={2} />
          </>
        );
      case 'line':
        return <line x1="0" y1={height/2} x2={width} y2={height/2} />;
      case 'arrow':
        return (
          <>
            <line x1="0" y1={height/2} x2={width-15} y2={height/2} />
            <polygon points={`${width},${height/2} ${width-15},${height/2-8} ${width-15},${height/2+8}`} />
          </>
        );
      default:
        return <rect width={width} height={height} />;
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onMouseDown={(e) => onDragStart?.(id, e)}
      className="cursor-move"
      style={{ 
        opacity,
        filter: shadowFilter,
        ...animationStyle
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4"
          rx={4}
        />
      )}
      
      {/* Gradient definition */}
      {useGradient && (
        <defs>
          {gradientType === 'radial' ? (
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={gradientColor1 || fill} />
              <stop offset="100%" stopColor={gradientColor2 || stroke} />
            </radialGradient>
          ) : (
            <linearGradient 
              id={gradientId} 
              x1="0%" y1="0%" 
              x2={`${Math.cos((gradientAngle || 0) * Math.PI / 180) * 50 + 50}%`}
              y2={`${Math.sin((gradientAngle || 0) * Math.PI / 180) * 50 + 50}%`}
            >
              <stop offset="0%" stopColor={gradientColor1 || fill} />
              <stop offset="100%" stopColor={gradientColor2 || stroke} />
            </linearGradient>
          )}
        </defs>
      )}
      
      {/* Bevel effect */}
      {bevel && (
        <>
          <rect
            x={-1}
            y={-1}
            width={width + 2}
            height={height + 2}
            fill="rgba(255,255,255,0.3)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={1}
            rx={2}
          />
        </>
      )}
      
      {/* 3D depth effect */}
      {depth3d > 0 && (
        <rect
          x={depth3d}
          y={depth3d}
          width={width}
          height={height}
          fill="rgba(0,0,0,0.2)"
          rx={2}
        />
      )}
      
      {/* Main shape */}
      <g
        fill={useGradient ? `url(#${gradientId})` : fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      >
        {renderShapePath()}
      </g>
      
      {/* Text */}
      {text && type !== 'line' && type !== 'arrow' && (
        <text
          x={width/2}
          y={height/2 + fontSize/3}
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily={fontFamily || 'Arial'}
          fill={textColor || '#000000'}
          style={{
            textShadow: textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
            WebkitTextStroke: textOutline ? '0.5px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          {text}
        </text>
      )}
      
      {/* Resize handles */}
      {isSelected && (
        <>
          <rect x={-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-nw-resize" />
          <rect x={width/2-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-n-resize" />
          <rect x={width-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-ne-resize" />
          <rect x={width-4} y={height/2-4} width={8} height={8} fill="#3b82f6" className="cursor-e-resize" />
          <rect x={width-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-se-resize"
            onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }}
          />
          <rect x={width/2-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-s-resize" />
          <rect x={-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-sw-resize" />
          <rect x={-4} y={height/2-4} width={8} height={8} fill="#3b82f6" className="cursor-w-resize" />
        </>
      )}
    </g>
  );
}

/**
 * Connection Line Component
 */
function Connection({ connection, shapes, isSelected, onClick }) {
  const fromShape = shapes.find(s => s.id === connection.from);
  const toShape = shapes.find(s => s.id === connection.to);
  
  if (!fromShape || !toShape) return null;
  
  const x1 = fromShape.x + fromShape.width;
  const y1 = fromShape.y + fromShape.height / 2;
  const x2 = toShape.x;
  const y2 = toShape.y + toShape.height / 2;
  
  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  
  return (
    <g onClick={(e) => { e.stopPropagation(); onClick(connection.id); }}>
      <path
        d={path}
        fill="none"
        stroke={isSelected ? '#3b82f6' : connection.stroke || '#64748b'}
        strokeWidth={isSelected ? 3 : 2}
        className="cursor-pointer"
      />
      {connection.arrow && (
        <polygon
          points={`0,-5 10,0 0,5`}
          fill={isSelected ? '#3b82f6' : connection.stroke || '#64748b'}
          transform={`translate(${x2}, ${y2}) rotate(${Math.atan2(y2-y1, x2-x1) * 180 / Math.PI})`}
        />
      )}
    </g>
  );
}

/**
 * Tool Palette Component
 */
function ToolPalette({ activeTool, onToolChange, onAddShape }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tools</h3>
      <div className="grid grid-cols-3 gap-1 mb-3">
        {[
          { id: 'select', icon: MousePointer, label: 'Select' },
          { id: 'pan', icon: Move, label: 'Pan' },
          { id: 'text', icon: Type, label: 'Text' },
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "p-2 rounded-md transition-colors flex flex-col items-center",
              activeTool === tool.id
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
            <span className="text-[10px] mt-1">{tool.label}</span>
          </button>
        ))}
      </div>
      
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shapes</h3>
      <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
        {Object.entries(SHAPE_TYPES).map(([type, config]) => (
          <button
            key={type}
            onClick={() => onAddShape(type)}
            className="p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
            title={config.name}
          >
            <config.icon className="w-4 h-4" />
            <span className="text-[9px] mt-1 truncate w-full text-center">{config.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Properties Panel Component - Full featured
 */
function PropertiesPanel({ selectedShape, onUpdateShape, onDeleteShape }) {
  if (!selectedShape) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <p className="text-sm text-gray-500">Select a shape to edit properties</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdateShape(selectedShape.id, { [key]: value });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Properties</h3>
      
      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Text</label>
          <input
            type="text"
            value={selectedShape.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      
      {/* Fill & Stroke */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Fill & Stroke</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Fill</label>
            <input
              type="color"
              value={selectedShape.fill || '#3b82f6'}
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Stroke</label>
            <input
              type="color"
              value={selectedShape.stroke || '#1e40af'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500">Stroke Width: {selectedShape.strokeWidth || 2}px</label>
          <input
            type="range"
            min="0"
            max="10"
            value={selectedShape.strokeWidth || 2}
            onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500">Opacity: {Math.round((selectedShape.opacity || 1) * 100)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={(selectedShape.opacity || 1) * 100}
            onChange={(e) => handleChange('opacity', Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Gradient */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-500">Gradient</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.useGradient || false}
              onChange={(e) => handleChange('useGradient', e.target.checked)}
              className="mr-1"
            />
            <span className="text-xs">Enable</span>
          </label>
        </div>
        {selectedShape.useGradient && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-500">Color 1</label>
                <input
                  type="color"
                  value={selectedShape.gradientColor1 || selectedShape.fill || '#3b82f6'}
                  onChange={(e) => handleChange('gradientColor1', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Color 2</label>
                <input
                  type="color"
                  value={selectedShape.gradientColor2 || selectedShape.stroke || '#1e40af'}
                  onChange={(e) => handleChange('gradientColor2', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={selectedShape.gradientType || 'linear'}
                onChange={(e) => handleChange('gradientType', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            {selectedShape.gradientType === 'linear' && (
              <div>
                <label className="text-xs text-gray-500">Angle: {selectedShape.gradientAngle || 0}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedShape.gradientAngle || 0}
                  onChange={(e) => handleChange('gradientAngle', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 3D Effects */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">3D Effects</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.shadow || false}
              onChange={(e) => handleChange('shadow', e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Shadow</span>
          </label>
          {selectedShape.shadow && (
            <div>
              <label className="text-xs text-gray-500">Blur: {selectedShape.shadowBlur || 4}px</label>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedShape.shadowBlur || 4}
                onChange={(e) => handleChange('shadowBlur', Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.bevel || false}
              onChange={(e) => handleChange('bevel', e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Bevel</span>
          </label>
          <div>
            <label className="text-xs text-gray-500">3D Depth: {selectedShape.depth3d || 0}px</label>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedShape.depth3d || 0}
              onChange={(e) => handleChange('depth3d', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Text Styling */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Text Styling</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Font Size: {selectedShape.fontSize || 14}px</label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedShape.fontSize || 14}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Font Family</label>
            <select
              value={selectedShape.fontFamily || 'Arial'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Text Color</label>
            <input
              type="color"
              value={selectedShape.textColor || '#000000'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedShape.textShadow || false}
                onChange={(e) => handleChange('textShadow', e.target.checked)}
                className="mr-1"
              />
              <span className="text-xs">Shadow</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedShape.textOutline || false}
                onChange={(e) => handleChange('textOutline', e.target.checked)}
                className="mr-1"
              />
              <span className="text-xs">Outline</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Animation */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Animation</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select
              value={selectedShape.animation || 'none'}
              onChange={(e) => handleChange('animation', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(ANIMATION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {selectedShape.animation && selectedShape.animation !== 'none' && (
            <>
              <div>
                <label className="text-xs text-gray-500">Duration: {selectedShape.animationDuration || 500}ms</label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={selectedShape.animationDuration || 500}
                  onChange={(e) => handleChange('animationDuration', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Delay: {selectedShape.animationDelay || 0}ms</label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={selectedShape.animationDelay || 0}
                  onChange={(e) => handleChange('animationDelay', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Delete Button */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <button
          onClick={() => onDeleteShape(selectedShape.id)}
          className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
}

/**
 * Layers Panel Component
 */
function LayersPanel({ shapes, selectedId, onSelect, onReorder, onToggleVisibility, onLock }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layers</h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {[...shapes].reverse().map((shape, index) => (
          <div
            key={shape.id}
            onClick={() => onSelect(shape.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs",
              selectedId === shape.id
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <span className="flex-1 truncate">{shape.text || shape.type}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(shape.id); }}
              className={cn("p-1", shape.hidden && "opacity-30")}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onLock(shape.id); }}
              className={cn("p-1", shape.locked && "text-yellow-500")}
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Diagram Studio Page
 */
export default function DiagramStudioPage() {
  // State
  const [shapes, setShapes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [viewport, setViewport] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [status, setStatus] = useState('Ready');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connectingFrom, setConnectingFrom] = useState(null);
  
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const queryClient = useQueryClient();

  // Selected shape for properties panel
  const selectedShape = selectedIds.length === 1 
    ? shapes.find(s => s.id === selectedIds[0]) 
    : null;

  // Fetch diagrams
  const { data: diagrams, isLoading: loadingDiagrams } = useQuery({
    queryKey: ['diagrams'],
    queryFn: () => canvasService.list({ type: 'diagram' })
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => canvasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      setStatus('Diagram saved');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => canvasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      setStatus('Diagram updated');
    }
  });

  // Save to history
  const saveToHistory = useCallback(() => {
    const state = { shapes, connections };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state)));
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [shapes, connections, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setShapes(prevState.shapes);
      setConnections(prevState.connections);
      setHistoryIndex(prev => prev - 1);
      setStatus('Undo');
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setShapes(nextState.shapes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
      setStatus('Redo');
    }
  }, [history, historyIndex]);

  // Add shape
  const handleAddShape = useCallback((type) => {
    const config = SHAPE_TYPES[type];
    const newShape = {
      id: `shape_${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: config.defaultSize.width,
      height: config.defaultSize.height,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 1,
      text: '',
      fontSize: 14,
      fontFamily: 'Arial',
    };
    
    setShapes(prev => [...prev, newShape]);
    setSelectedIds([newShape.id]);
    saveToHistory();
    setStatus(`Added ${config.name}`);
  }, [saveToHistory]);

  // Update shape
  const handleUpdateShape = useCallback((id, updates) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // Delete shape
  const handleDeleteShape = useCallback((id) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    saveToHistory();
    setStatus('Shape deleted');
  }, [saveToHistory]);

  // Delete selected
  const handleDeleteSelected = useCallback(() => {
    setShapes(prev => prev.filter(s => !selectedIds.includes(s.id)));
    setConnections(prev => prev.filter(c => 
      !selectedIds.includes(c.from) && !selectedIds.includes(c.to)
    ));
    setSelectedIds([]);
    saveToHistory();
    setStatus(`Deleted ${selectedIds.length} items`);
  }, [selectedIds, saveToHistory]);

  // Shape click
  const handleShapeClick = useCallback((id) => {
    if (activeTool === 'select') {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [id]
      );
    }
  }, [activeTool]);

  // Shape drag
  const handleShapeDragStart = useCallback((id, e) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.locked) return;
    
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: shape.x,
      originalY: shape.y,
    };
  }, [shapes]);

  // Mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current) return;
      
      const { id, startX, startY, originalX, originalY } = dragRef.current;
      const deltaX = (e.clientX - startX) / viewport.zoom;
      const deltaY = (e.clientY - startY) / viewport.zoom;
      
      let newX = originalX + deltaX;
      let newY = originalY + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
      }
      
      setShapes(prev => prev.map(s => 
        s.id === id ? { ...s, x: newX, y: newY } : s
      ));
    };
    
    const handleMouseUp = () => {
      if (dragRef.current) {
        saveToHistory();
        dragRef.current = null;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [viewport.zoom, snapToGrid, saveToHistory]);

  // Alignment functions
  const handleAlign = useCallback((alignment) => {
    if (selectedIds.length < 2) return;
    
    const selectedShapes = shapes.filter(s => selectedIds.includes(s.id));
    let updated = false;
    
    switch (alignment) {
      case 'left':
        const minLeft = Math.min(...selectedShapes.map(s => s.x));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: minLeft } : s
        ));
        updated = true;
        break;
      case 'center':
        const centerX = selectedShapes.reduce((sum, s) => sum + s.x + s.width/2, 0) / selectedShapes.length;
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: centerX - s.width/2 } : s
        ));
        updated = true;
        break;
      case 'right':
        const maxRight = Math.max(...selectedShapes.map(s => s.x + s.width));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: maxRight - s.width } : s
        ));
        updated = true;
        break;
      case 'top':
        const minTop = Math.min(...selectedShapes.map(s => s.y));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: minTop } : s
        ));
        updated = true;
        break;
      case 'middle':
        const centerY = selectedShapes.reduce((sum, s) => sum + s.y + s.height/2, 0) / selectedShapes.length;
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: centerY - s.height/2 } : s
        ));
        updated = true;
        break;
      case 'bottom':
        const maxBottom = Math.max(...selectedShapes.map(s => s.y + s.height));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: maxBottom - s.height } : s
        ));
        updated = true;
        break;
    }
    
    if (updated) {
      saveToHistory();
      setStatus(`Aligned ${alignment}`);
    }
  }, [selectedIds, shapes, saveToHistory]);

  // Group/Ungroup
  const handleGroup = useCallback(() => {
    if (selectedIds.length < 2) return;
    const groupId = `group_${Date.now()}`;
    setShapes(prev => prev.map(s => 
      selectedIds.includes(s.id) ? { ...s, groupId } : s
    ));
    saveToHistory();
    setStatus('Shapes grouped');
  }, [selectedIds, saveToHistory]);

  const handleUngroup = useCallback(() => {
    const selectedShape = shapes.find(s => selectedIds.includes(s.id));
    if (!selectedShape?.groupId) return;
    
    setShapes(prev => prev.map(s => 
      s.groupId === selectedShape.groupId ? { ...s, groupId: null } : s
    ));
    saveToHistory();
    setStatus('Group ungrouped');
  }, [selectedIds, shapes, saveToHistory]);

  // Copy/Paste
  const [clipboard, setClipboard] = useState([]);
  
  const handleCopy = useCallback(() => {
    const selected = shapes.filter(s => selectedIds.includes(s.id));
    setClipboard(JSON.parse(JSON.stringify(selected)));
    setStatus(`Copied ${selected.length} shapes`);
  }, [shapes, selectedIds]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    
    const newShapes = clipboard.map(s => ({
      ...s,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: s.x + 20,
      y: s.y + 20,
    }));
    
    setShapes(prev => [...prev, ...newShapes]);
    setSelectedIds(newShapes.map(s => s.id));
    saveToHistory();
    setStatus(`Pasted ${newShapes.length} shapes`);
  }, [clipboard, saveToHistory]);

  // Save diagram
  const handleSave = useCallback(async () => {
    const state = {
      version: '2.0',
      viewport,
      shapes,
      connections,
      metadata: {
        name: currentDiagram?.name || 'Untitled Diagram',
        type: 'diagram'
      }
    };

    try {
      if (currentDiagram?.id) {
        await updateMutation.mutateAsync({
          id: currentDiagram.id,
          data: { state }
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: state.metadata.name,
          type: 'diagram',
          state
        });
        setCurrentDiagram(result);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('Save failed');
    }
  }, [shapes, connections, viewport, currentDiagram, createMutation, updateMutation]);

  // Load diagram
  const handleLoad = useCallback(async (diagram) => {
    try {
      const data = await canvasService.get(diagram.id);
      
      if (data.state) {
        setViewport(data.state.viewport || { zoom: 1, offset: { x: 0, y: 0 } });
        setShapes(data.state.shapes || []);
        setConnections(data.state.connections || []);
        setCurrentDiagram(data);
        setSelectedIds([]);
        setStatus(`Loaded: ${data.name}`);
      }
    } catch (error) {
      console.error('Load failed:', error);
      setStatus('Load failed');
    }
  }, []);

  // New diagram
  const handleNew = useCallback(() => {
    setShapes([]);
    setConnections([]);
    setSelectedIds([]);
    setCurrentDiagram(null);
    setHistory([]);
    setHistoryIndex(-1);
    setStatus('New diagram created');
  }, []);

  // Export
  const handleExport = useCallback(async (format) => {
    try {
      const result = await canvasService.export(currentDiagram?.id || 'temp', format);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      setStatus(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('Export failed');
    }
  }, [currentDiagram]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'a':
            e.preventDefault();
            setSelectedIds(shapes.map(s => s.id));
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) handleUngroup();
            else handleGroup();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedIds.length > 0) {
              handleDeleteSelected();
            }
            break;
          case 'Escape':
            setSelectedIds([]);
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleCopy, handlePaste, handleGroup, handleUngroup, handleSave, handleDeleteSelected, selectedIds, shapes]);

  // Play animations
  const handlePlayAnimations = useCallback(() => {
    // Reset and replay all animations
    setShapes(prev => prev.map(s => ({ ...s, animationReset: Date.now() })));
    setStatus('Playing animations');
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-500" />
            Diagram Studio
          </h1>
          <span className="text-sm text-gray-500">{currentDiagram?.name || 'Untitled'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Alignment */}
          <Button variant="ghost" size="sm" onClick={() => handleAlign('left')} disabled={selectedIds.length < 2}>
            <AlignStartHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAlign('center')} disabled={selectedIds.length < 2}>
            <AlignCenterHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAlign('right')} disabled={selectedIds.length < 2}>
            <AlignEndHorizontal className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Group */}
          <Button variant="ghost" size="sm" onClick={handleGroup} disabled={selectedIds.length < 2}>
            <Group className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleUngroup} disabled={selectedIds.length === 0}>
            <Ungroup className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Play Animations */}
          <Button variant="ghost" size="sm" onClick={handlePlayAnimations}>
            <Play className="w-4 h-4" />
          </Button>
          
          {/* Grid toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGridEnabled(!gridEnabled)}
            className={gridEnabled ? 'text-blue-500' : ''}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* File operations */}
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('svg')}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="p-4 space-y-4">
          <ToolPalette
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onAddShape={handleAddShape}
          />
          <LayersPanel
            shapes={shapes}
            selectedId={selectedIds[0]}
            onSelect={(id) => setSelectedIds([id])}
            onToggleVisibility={(id) => handleUpdateShape(id, { hidden: !shapes.find(s => s.id === id)?.hidden })}
            onLock={(id) => handleUpdateShape(id, { locked: !shapes.find(s => s.id === id)?.locked })}
          />
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          <svg
            ref={canvasRef}
            className="w-full h-full bg-white dark:bg-gray-900 cursor-crosshair"
            onClick={() => setSelectedIds([])}
          >
            {/* Grid */}
            {gridEnabled && (
              <defs>
                <pattern
                  id="grid"
                  width={20 * viewport.zoom}
                  height={20 * viewport.zoom}
                  patternUnits="userSpaceOnUse"
                  x={viewport.offset.x % (20 * viewport.zoom)}
                  y={viewport.offset.y % (20 * viewport.zoom)}
                >
                  <path
                    d={`M ${20 * viewport.zoom} 0 L 0 0 0 ${20 * viewport.zoom}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-gray-200 dark:text-gray-700"
                  />
                </pattern>
              </defs>
            )}
            {gridEnabled && <rect width="100%" height="100%" fill="url(#grid)" />}
            
            {/* Transform group */}
            <g transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}>
              {/* Connections */}
              {connections.map(conn => (
                <Connection
                  key={conn.id}
                  connection={conn}
                  shapes={shapes}
                  isSelected={selectedIds.includes(conn.id)}
                  onClick={(id) => setSelectedIds([id])}
                />
              ))}
              
              {/* Shapes */}
              {shapes.filter(s => !s.hidden).map(shape => (
                <Shape
                  key={shape.id}
                  shape={shape}
                  isSelected={selectedIds.includes(shape.id)}
                  onClick={handleShapeClick}
                  onDragStart={handleShapeDragStart}
                  scale={viewport.zoom}
                />
              ))}
            </g>
          </svg>
          
          {/* Status bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-sm text-gray-600 dark:text-gray-400">
            {status} | Shapes: {shapes.length} | Selected: {selectedIds.length}
          </div>
          
          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow p-1">
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.25) }))}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(viewport.zoom * 100)}%</span>
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.25) }))}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport({ zoom: 1, offset: { x: 0, y: 0 } })}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 p-4 space-y-4 overflow-y-auto">
          <PropertiesPanel
            selectedShape={selectedShape}
            onUpdateShape={handleUpdateShape}
            onDeleteShape={handleDeleteShape}
          />
          
          {/* Saved diagrams */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Saved Diagrams</h3>
            {loadingDiagrams ? (
              <Loader size="sm" />
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {diagrams?.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleLoad(d)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                      currentDiagram?.id === d.id
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {d.name}
                  </button>
                ))}
                {(!diagrams || diagrams.length === 0) && (
                  <p className="text-sm text-gray-400">No saved diagrams</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
