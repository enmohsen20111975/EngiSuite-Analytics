/**
 * StatusBar
 * Bottom status bar with information display
 */

import React from 'react';

export function StatusBar({
  componentCount,
  wireCount,
  zoom,
  cursorPosition,
  isSimulationRunning,
  simulationTime,
  theme
}) {
  const isDark = theme === 'dark';
  
  const statusBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 16px',
    backgroundColor: isDark ? '#0f0f1a' : '#f0f0f0',
    borderTop: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
    fontSize: '11px',
    color: isDark ? '#888' : '#666',
    height: '24px'
  };
  
  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };
  
  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };
  
  const dotStyle = (color) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: color
  });
  
  return (
    <div style={statusBarStyle}>
      {/* Left Section */}
      <div style={sectionStyle}>
        <div style={itemStyle}>
          <span>🔧</span>
          <span>{componentCount} components</span>
        </div>
        <div style={itemStyle}>
          <span>🔗</span>
          <span>{wireCount} wires</span>
        </div>
        
        {isSimulationRunning && (
          <>
            <div style={itemStyle}>
              <div style={dotStyle('#4CAF50')} />
              <span style={{ color: '#4CAF50' }}>Simulation Running</span>
            </div>
            <div style={itemStyle}>
              <span>⏱️</span>
              <span>{simulationTime.toFixed(2)}s</span>
            </div>
          </>
        )}
      </div>
      
      {/* Center Section */}
      <div style={sectionStyle}>
        <span>Press V for Select | W for Wire | H for Pan | Del to Delete</span>
      </div>
      
      {/* Right Section */}
      <div style={sectionStyle}>
        {cursorPosition && (
          <div style={itemStyle}>
            <span>📍</span>
            <span>({Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)})</span>
          </div>
        )}
        <div style={itemStyle}>
          <span>🔍</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <div style={itemStyle}>
          <span>Hydraulic Simulator v1.0</span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
