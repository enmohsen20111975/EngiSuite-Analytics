/**
 * Toolbar
 * Top toolbar with tools and actions
 */

import React, { useState, useCallback } from 'react';

export function Toolbar({
  onSave,
  onLoad,
  onNew,
  onLoadExample,
  onToggleSimulation,
  isSimulationRunning,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentTool,
  onToolChange,
  theme,
  onThemeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen
}) {
  const isDark = theme === 'dark';
  const [showExamples, setShowExamples] = useState(false);
  
  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: isDark ? '#16213e' : '#ffffff',
    borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
    height: '52px'
  };
  
  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };
  
  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.15s',
    backgroundColor: 'transparent',
    color: isDark ? '#e0e0e0' : '#555555'
  };
  
  const buttonStyle = (isActive) => ({
    ...buttonBaseStyle,
    backgroundColor: isActive 
      ? (isDark ? 'rgba(33, 150, 243, 0.2)' : '#e3f2fd')
      : 'transparent',
    color: isActive ? '#2196F3' : (isDark ? '#e0e0e0' : '#555555')
  });
  
  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#2196F3',
    color: '#ffffff'
  };
  
  const dangerButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isDark ? 'rgba(244, 67, 54, 0.2)' : '#ffebee',
    color: '#f44336'
  };
  
  const dividerStyle = {
    width: '1px',
    height: '24px',
    backgroundColor: isDark ? '#2a2a4a' : '#e0e0e0',
    margin: '0 8px'
  };
  
  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 600,
    color: isDark ? '#ffffff' : '#333333'
  };
  
  const dropdownStyle = {
    position: 'relative'
  };
  
  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
    border: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '200px',
    zIndex: 1000,
    overflow: 'hidden'
  };
  
  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: isDark ? '#e0e0e0' : '#333333',
    transition: 'background-color 0.15s'
  };
  
  const examples = [
    { id: 'basic-pump-circuit', name: 'Basic Pump Circuit', description: 'Simple pump with tank' },
    { id: 'cylinder-control', name: 'Cylinder Control', description: 'Double-acting cylinder' },
    { id: 'motor-circuit', name: 'Motor Circuit', description: 'Hydraulic motor control' }
  ];
  
  return (
    <div style={toolbarStyle}>
      {/* Left - Title */}
      <div style={sectionStyle}>
        <div style={titleStyle}>
          <span style={{ fontSize: '20px' }}>💧</span>
          <span>Hydraulic Simulator</span>
        </div>
      </div>
      
      {/* Center - Tools */}
      <div style={sectionStyle}>
        {/* File Operations */}
        <button style={buttonStyle(false)} onClick={onNew} title="New Circuit (Ctrl+N)">
          📄 New
        </button>
        <button style={buttonStyle(false)} onClick={onLoad} title="Load Circuit (Ctrl+O)">
          📂 Load
        </button>
        <button style={buttonStyle(false)} onClick={onSave} title="Save Circuit (Ctrl+S)">
          💾 Save
        </button>
        
        <div style={dividerStyle} />
        
        {/* Examples Dropdown */}
        <div style={dropdownStyle}>
          <button 
            style={buttonStyle(showExamples)} 
            onClick={() => setShowExamples(!showExamples)}
            onBlur={() => setTimeout(() => setShowExamples(false), 200)}
          >
            📚 Examples ▼
          </button>
          {showExamples && (
            <div style={dropdownMenuStyle}>
              {examples.map(example => (
                <button
                  key={example.id}
                  style={dropdownItemStyle}
                  onClick={() => {
                    onLoadExample(example.id);
                    setShowExamples(false);
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = isDark ? '#2a2a4a' : '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontWeight: 500 }}>{example.name}</div>
                  <div style={{ fontSize: '11px', color: isDark ? '#888' : '#999' }}>
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div style={dividerStyle} />
        
        {/* Undo/Redo */}
        <button 
          style={buttonStyle(false)} 
          onClick={onUndo} 
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩️ Undo
        </button>
        <button 
          style={buttonStyle(false)} 
          onClick={onRedo} 
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪️ Redo
        </button>
        
        <div style={dividerStyle} />
        
        {/* Tools */}
        <button 
          style={buttonStyle(currentTool === 'select')} 
          onClick={() => onToolChange('select')}
          title="Select Tool (V)"
        >
          🔍 Select
        </button>
        <button 
          style={buttonStyle(currentTool === 'wire')} 
          onClick={() => onToolChange('wire')}
          title="Wire Tool (W)"
        >
          🔗 Wire
        </button>
        <button 
          style={buttonStyle(currentTool === 'pan')} 
          onClick={() => onToolChange('pan')}
          title="Pan Tool (H)"
        >
          ✋ Pan
        </button>
        
        <div style={dividerStyle} />
        
        {/* Zoom */}
        <button style={buttonStyle(false)} onClick={onZoomOut} title="Zoom Out (-)">
          ➖
        </button>
        <span style={{ 
          padding: '0 8px', 
          fontSize: '12px', 
          color: isDark ? '#ccc' : '#666',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button style={buttonStyle(false)} onClick={onZoomIn} title="Zoom In (+)">
          ➕
        </button>
        <button style={buttonStyle(false)} onClick={onFitToScreen} title="Fit to Screen (Home)">
          ⛶ Fit
        </button>
      </div>
      
      {/* Right - Actions */}
      <div style={sectionStyle}>
        {/* Simulation Toggle */}
        <button 
          style={isSimulationRunning ? dangerButtonStyle : primaryButtonStyle}
          onClick={onToggleSimulation}
          title="Toggle Simulation"
        >
          {isSimulationRunning ? '⏹️ Stop' : '▶️ Simulate'}
        </button>
        
        <div style={dividerStyle} />
        
        {/* Theme Toggle */}
        <button 
          style={buttonStyle(false)} 
          onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        
        {/* Help */}
        <button style={buttonStyle(false)} title="Help">
          ❓
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
