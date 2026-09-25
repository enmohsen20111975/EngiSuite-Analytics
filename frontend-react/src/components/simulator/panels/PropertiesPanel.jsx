/**
 * PropertiesPanel
 * Right sidebar for editing selected component/wire properties
 */

import React, { useState, useCallback } from 'react';

export function PropertiesPanel({ 
  selectedComponents, 
  selectedWires, 
  onUpdateComponent,
  onUpdateWire,
  onDelete,
  theme 
}) {
  const [activeTab, setActiveTab] = useState('properties');
  const isDark = theme === 'dark';
  
  const hasSelection = selectedComponents.length > 0 || selectedWires.length > 0;
  const selectedComponent = selectedComponents[0];
  const selectedWire = selectedWires[0];
  
  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: isDark ? '#16213e' : '#ffffff'
  };
  
  const headerStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
    backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa'
  };
  
  const titleStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: isDark ? '#ffffff' : '#333333'
  };
  
  const tabsStyle = {
    display: 'flex',
    borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`
  };
  
  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    color: isActive 
      ? '#2196F3' 
      : (isDark ? '#888' : '#666'),
    borderBottom: isActive 
      ? '2px solid #2196F3' 
      : '2px solid transparent',
    backgroundColor: isActive 
      ? (isDark ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)')
      : 'transparent'
  });
  
  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  };
  
  const emptyStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: isDark ? '#888' : '#999',
    textAlign: 'center'
  };
  
  const sectionStyle = {
    marginBottom: '16px'
  };
  
  const sectionTitleStyle = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: isDark ? '#888' : '#999',
    marginBottom: '8px'
  };
  
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  };
  
  const labelStyle = {
    width: '100px',
    fontSize: '12px',
    color: isDark ? '#ccc' : '#555',
    flexShrink: 0
  };
  
  const inputStyle = {
    flex: 1,
    padding: '6px 10px',
    border: `1px solid ${isDark ? '#2a2a4a' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
    color: isDark ? '#ffffff' : '#333333',
    fontSize: '12px'
  };
  
  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };
  
  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'background-color 0.15s'
  };
  
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    color: '#ffffff'
  };
  
  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDark ? '#4a1a1a' : '#ffebee',
    color: '#f44336'
  };
  
  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>Properties</div>
      </div>
      
      {/* Tabs */}
      <div style={tabsStyle}>
        <div 
          style={tabStyle(activeTab === 'properties')}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </div>
        <div 
          style={tabStyle(activeTab === 'state')}
          onClick={() => setActiveTab('state')}
        >
          State
        </div>
        <div 
          style={tabStyle(activeTab === 'info')}
          onClick={() => setActiveTab('info')}
        >
          Info
        </div>
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        {!hasSelection ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div>No component selected</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              Click on a component to view its properties
            </div>
          </div>
        ) : selectedComponent ? (
          <ComponentProperties
            component={selectedComponent}
            activeTab={activeTab}
            onUpdate={onUpdateComponent}
            onDelete={onDelete}
            isDark={isDark}
            styles={{ sectionStyle, sectionTitleStyle, rowStyle, labelStyle, inputStyle, selectStyle, primaryButtonStyle, dangerButtonStyle }}
          />
        ) : selectedWire ? (
          <WireProperties
            wire={selectedWire}
            activeTab={activeTab}
            onUpdate={onUpdateWire}
            onDelete={onDelete}
            isDark={isDark}
            styles={{ sectionStyle, sectionTitleStyle, rowStyle, labelStyle, inputStyle, selectStyle, primaryButtonStyle, dangerButtonStyle }}
          />
        ) : null}
      </div>
    </div>
  );
}

// Component Properties Sub-component
function ComponentProperties({ component, activeTab, onUpdate, onDelete, isDark, styles }) {
  const handlePropertyChange = useCallback((propName, value) => {
    onUpdate(component.id, {
      properties: {
        ...component.properties,
        [propName]: {
          ...component.properties[propName],
          value
        }
      }
    });
  }, [component, onUpdate]);
  
  const handleStateChange = useCallback((stateName, value) => {
    onUpdate(component.id, {
      state: {
        ...component.state,
        [stateName]: value
      }
    });
  }, [component, onUpdate]);
  
  const { sectionStyle, sectionTitleStyle, rowStyle, labelStyle, inputStyle, selectStyle, primaryButtonStyle, dangerButtonStyle } = styles;
  
  if (activeTab === 'properties') {
    const properties = component.properties || {};
    
    return (
      <>
        {/* General Info */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>General</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Type</span>
            <span style={{ fontSize: '12px', color: isDark ? '#fff' : '#333' }}>
              {component.type}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Name</span>
            <input
              type="text"
              style={inputStyle}
              value={component.name || ''}
              onChange={(e) => onUpdate(component.id, { name: e.target.value })}
            />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Position</span>
            <span style={{ fontSize: '12px', color: isDark ? '#ccc' : '#666' }}>
              ({Math.round(component.x)}, {Math.round(component.y)})
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Rotation</span>
            <select
              style={selectStyle}
              value={component.rotation || 0}
              onChange={(e) => onUpdate(component.id, { rotation: parseInt(e.target.value) })}
            >
              <option value={0}>0°</option>
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </div>
        </div>
        
        {/* Component Properties */}
        {Object.keys(properties).length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Parameters</div>
            {Object.entries(properties).map(([key, prop]) => (
              <PropertyInput
                key={key}
                name={key}
                property={prop}
                onChange={(value) => handlePropertyChange(key, value)}
                isDark={isDark}
                styles={{ rowStyle, labelStyle, inputStyle, selectStyle }}
              />
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Actions</div>
          <div style={{ display: 'flex' }}>
            <button style={dangerButtonStyle} onClick={onDelete}>
              🗑️ Delete
            </button>
            <button 
              style={primaryButtonStyle}
              onClick={() => onUpdate(component.id, { flipped: !component.flipped })}
            >
              ↔️ Flip
            </button>
          </div>
        </div>
      </>
    );
  }
  
  if (activeTab === 'state') {
    const state = component.state || {};
    
    return (
      <>
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Current State</div>
          {Object.entries(state).map(([key, value]) => (
            <div key={key} style={rowStyle}>
              <span style={labelStyle}>{formatLabel(key)}</span>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                style={inputStyle}
                value={value?.toString() || ''}
                onChange={(e) => handleStateChange(key, 
                  typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                )}
              />
            </div>
          ))}
          {Object.keys(state).length === 0 && (
            <div style={{ color: isDark ? '#888' : '#999', fontSize: '12px' }}>
              No state properties available
            </div>
          )}
        </div>
      </>
    );
  }
  
  if (activeTab === 'info') {
    return (
      <>
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Component Info</div>
          <div style={{ fontSize: '12px', lineHeight: 1.6, color: isDark ? '#ccc' : '#555' }}>
            <p><strong>Type:</strong> {component.type}</p>
            <p><strong>Category:</strong> {component.category}</p>
            <p><strong>Description:</strong></p>
            <p style={{ color: isDark ? '#888' : '#777' }}>
              {component.description || 'No description available'}
            </p>
          </div>
        </div>
        
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Terminals</div>
          <div style={{ fontSize: '12px', color: isDark ? '#ccc' : '#555' }}>
            {(component.terminals || []).map((terminal, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                • {terminal.id}: {terminal.type} ({terminal.x}, {terminal.y})
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  
  return null;
}

// Wire Properties Sub-component
function WireProperties({ wire, activeTab, onUpdate, onDelete, isDark, styles }) {
  const { sectionStyle, sectionTitleStyle, rowStyle, labelStyle, inputStyle, dangerButtonStyle } = styles;
  
  return (
    <>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Wire Properties</div>
        <div style={rowStyle}>
          <span style={labelStyle}>From</span>
          <span style={{ fontSize: '12px', color: isDark ? '#fff' : '#333' }}>
            {wire.from?.componentId?.substring(0, 15)}...
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>To</span>
          <span style={{ fontSize: '12px', color: isDark ? '#fff' : '#333' }}>
            {wire.to?.componentId?.substring(0, 15)}...
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Waypoints</span>
          <span style={{ fontSize: '12px', color: isDark ? '#ccc' : '#666' }}>
            {(wire.route?.length || 0) - 2}
          </span>
        </div>
      </div>
      
      {activeTab === 'state' && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Wire State</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Pressure</span>
            <input
              type="number"
              style={inputStyle}
              value={wire.state?.pressure || 0}
              onChange={(e) => onUpdate(wire.id, {
                state: { ...wire.state, pressure: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Flow</span>
            <input
              type="number"
              style={inputStyle}
              value={wire.state?.flow || 0}
              onChange={(e) => onUpdate(wire.id, {
                state: { ...wire.state, flow: parseFloat(e.target.value) }
              })}
            />
          </div>
        </div>
      )}
      
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Actions</div>
        <button style={dangerButtonStyle} onClick={onDelete}>
          🗑️ Delete Wire
        </button>
      </div>
    </>
  );
}

// Property Input Component
function PropertyInput({ name, property, onChange, isDark, styles }) {
  const { rowStyle, labelStyle, inputStyle, selectStyle } = styles;
  
  const value = property.value;
  
  // Check if it has options (dropdown)
  if (property.options) {
    return (
      <div style={rowStyle}>
        <span style={labelStyle}>{formatLabel(name)}</span>
        <select
          style={selectStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {property.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }
  
  // Boolean
  if (property.type === 'boolean' || typeof value === 'boolean') {
    return (
      <div style={rowStyle}>
        <span style={labelStyle}>{formatLabel(name)}</span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '12px', color: isDark ? '#ccc' : '#555' }}>
            {value ? 'Yes' : 'No'}
          </span>
        </label>
      </div>
    );
  }
  
  // Number
  if (typeof value === 'number') {
    return (
      <div style={rowStyle}>
        <span style={labelStyle}>{formatLabel(name)}</span>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <input
            type="number"
            style={{ ...inputStyle, flex: 1 }}
            value={value}
            min={property.min}
            max={property.max}
            step={(property.max || 100) / 100}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
          {property.unit && (
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '11px', 
              color: isDark ? '#888' : '#999',
              width: '50px'
            }}>
              {property.unit}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  // String (default)
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{formatLabel(name)}</span>
      <input
        type="text"
        style={inputStyle}
        value={value?.toString() || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Format label from camelCase
function formatLabel(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

export default PropertiesPanel;
