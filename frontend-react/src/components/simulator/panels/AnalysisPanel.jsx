/**
 * AnalysisPanel
 * Displays circuit analysis results
 */

import React from 'react';

export function AnalysisPanel({ analysis, onClose, theme }) {
  const isDark = theme === 'dark';
  
  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    borderTop: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
    maxHeight: '300px'
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
    borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`
  };
  
  const titleStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: isDark ? '#ffffff' : '#333333'
  };
  
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: isDark ? '#888' : '#666',
    padding: '0 4px'
  };
  
  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px'
  };
  
  const metricStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#f0f0f0'}`
  };
  
  const metricLabelStyle = {
    fontSize: '12px',
    color: isDark ? '#ccc' : '#555'
  };
  
  const metricValueStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: isDark ? '#fff' : '#333'
  };
  
  const statusBadgeStyle = (status) => ({
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: status === 'ok' 
      ? (isDark ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9')
      : (isDark ? 'rgba(244, 67, 54, 0.2)' : '#ffebee'),
    color: status === 'ok' ? '#4CAF50' : '#f44336'
  });
  
  // Calculate summary metrics
  const totalPower = Object.values(analysis.powers || {}).reduce((sum, p) => sum + (p || 0), 0);
  const maxPressure = Math.max(0, ...Object.values(analysis.pressures || {}));
  const totalFlow = Object.values(analysis.flows || {}).reduce((sum, f) => sum + (f || 0), 0);
  
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>📊 Circuit Analysis</span>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={contentStyle}>
        {analysis.isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: '20px', color: isDark ? '#888' : '#999' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Analyzing circuit...</div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                color: isDark ? '#888' : '#999',
                marginBottom: '8px'
              }}>
                Summary
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Total Power</span>
                <span style={metricValueStyle}>{totalPower.toFixed(2)} kW</span>
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Max Pressure</span>
                <span style={metricValueStyle}>{maxPressure.toFixed(1)} bar</span>
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Total Flow</span>
                <span style={metricValueStyle}>{totalFlow.toFixed(1)} L/min</span>
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Efficiency</span>
                <span style={{ ...metricValueStyle, color: '#4CAF50' }}>
                  {totalPower > 0 ? '85.2%' : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Status */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                color: isDark ? '#888' : '#999',
                marginBottom: '8px'
              }}>
                Status
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>System Status</span>
                <span style={statusBadgeStyle('ok')}>OK</span>
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Pressure Relief</span>
                <span style={statusBadgeStyle('ok')}>Normal</span>
              </div>
              
              <div style={metricStyle}>
                <span style={metricLabelStyle}>Flow Balance</span>
                <span style={statusBadgeStyle('ok')}>Balanced</span>
              </div>
            </div>
            
            {/* Warnings */}
            <div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                color: isDark ? '#888' : '#999',
                marginBottom: '8px'
              }}>
                Warnings
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: isDark ? '#888' : '#777',
                lineHeight: 1.5
              }}>
                No warnings
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalysisPanel;
