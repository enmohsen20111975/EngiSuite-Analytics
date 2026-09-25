/**
 * ComponentPanel
 * Left sidebar with component library for drag-and-drop
 */

import React, { useState, useMemo } from 'react';
import { HYDRAULIC_COMPONENTS, getComponentsByCategory } from '../components/definitions/hydraulic';

export function ComponentPanel({ 
  categories, 
  currentLibrary, 
  onLibraryChange, 
  onComponentSelect,
  theme 
}) {
  const [expandedCategory, setExpandedCategory] = useState('sources');
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = theme === 'dark';
  
  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return null;
    
    const term = searchTerm.toLowerCase();
    return Object.values(HYDRAULIC_COMPONENTS).filter(comp => 
      comp.name.toLowerCase().includes(term) ||
      comp.type.toLowerCase().includes(term) ||
      comp.description?.toLowerCase().includes(term)
    );
  }, [searchTerm]);
  
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
    color: isDark ? '#ffffff' : '#333333',
    marginBottom: '8px'
  };
  
  const searchStyle = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${isDark ? '#2a2a4a' : '#ddd'}`,
    borderRadius: '6px',
    backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
    color: isDark ? '#ffffff' : '#333333',
    fontSize: '13px',
    outline: 'none'
  };
  
  const librarySelectStyle = {
    width: '100%',
    padding: '8px 12px',
    marginTop: '8px',
    border: `1px solid ${isDark ? '#2a2a4a' : '#ddd'}`,
    borderRadius: '6px',
    backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
    color: isDark ? '#ffffff' : '#333333',
    fontSize: '13px',
    cursor: 'pointer'
  };
  
  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0'
  };
  
  const categoryStyle = (isExpanded) => ({
    marginBottom: '4px'
  });
  
  const categoryHeaderStyle = (isExpanded) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    backgroundColor: isExpanded 
      ? (isDark ? '#1e3a5f' : '#e3f2fd')
      : 'transparent',
    transition: 'background-color 0.15s',
    userSelect: 'none'
  });
  
  const categoryIconStyle = {
    marginRight: '8px',
    fontSize: '16px'
  };
  
  const categoryNameStyle = {
    flex: 1,
    fontSize: '13px',
    fontWeight: 500,
    color: isDark ? '#e0e0e0' : '#444444'
  };
  
  const expandIconStyle = {
    fontSize: '12px',
    color: isDark ? '#888' : '#666',
    transition: 'transform 0.2s'
  };
  
  const componentsListStyle = {
    padding: '4px 8px 8px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  };
  
  const componentItemStyle = (isSelected) => ({
    width: 'calc(50% - 3px)',
    padding: '8px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '6px',
    cursor: 'grab',
    backgroundColor: isSelected 
      ? (isDark ? '#2196F3' : '#e3f2fd')
      : (isDark ? '#1a1a2e' : '#f5f5f5'),
    border: `1px solid ${isSelected 
      ? '#2196F3' 
      : (isDark ? '#2a2a4a' : '#e0e0e0')}`,
    transition: 'all 0.15s'
  });
  
  const componentIconStyle = {
    fontSize: '20px',
    marginBottom: '4px'
  };
  
  const componentNameStyle = {
    fontSize: '10px',
    textAlign: 'center',
    color: isDark ? '#cccccc' : '#666666',
    lineHeight: 1.2
  };
  
  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>Component Library</div>
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchStyle}
        />
        <select
          value={currentLibrary}
          onChange={(e) => onLibraryChange(e.target.value)}
          style={librarySelectStyle}
        >
          <option value="hydraulic">💧 Hydraulic Components</option>
          <option value="pneumatic">🌬️ Pneumatic Components</option>
        </select>
      </div>
      
      {/* Component List */}
      <div style={contentStyle}>
        {searchTerm && filteredComponents ? (
          // Search results
          <div style={componentsListStyle}>
            {filteredComponents.map(comp => (
              <div
                key={comp.type}
                style={componentItemStyle(false)}
                onClick={() => onComponentSelect(comp.type)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('componentType', comp.type);
                }}
                title={comp.description}
              >
                <span style={componentIconStyle}>{comp.icon || '🔧'}</span>
                <span style={componentNameStyle}>{comp.name}</span>
              </div>
            ))}
            {filteredComponents.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: isDark ? '#888' : '#999' }}>
                No components found
              </div>
            )}
          </div>
        ) : (
          // Categories
          categories.map(category => {
            const isExpanded = expandedCategory === category.id;
            const components = getComponentsByCategory(category.id);
            
            return (
              <div key={category.id} style={categoryStyle(isExpanded)}>
                <div 
                  style={categoryHeaderStyle(isExpanded)}
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                >
                  <span style={categoryIconStyle}>{category.icon}</span>
                  <span style={categoryNameStyle}>{category.name}</span>
                  <span style={{
                    ...expandIconStyle,
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}>
                    ▶
                  </span>
                </div>
                
                {isExpanded && (
                  <div style={componentsListStyle}>
                    {components.map(comp => (
                      <div
                        key={comp.type}
                        style={componentItemStyle(false)}
                        onClick={() => onComponentSelect(comp.type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('componentType', comp.type);
                        }}
                        title={comp.description}
                      >
                        <span style={componentIconStyle}>{comp.icon || '🔧'}</span>
                        <span style={componentNameStyle}>{comp.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer with tips */}
      <div style={{
        padding: '10px 16px',
        borderTop: `1px solid ${isDark ? '#2a2a4a' : '#e0e0e0'}`,
        fontSize: '11px',
        color: isDark ? '#888' : '#999'
      }}>
        <div>💡 Click or drag components to canvas</div>
        <div style={{ marginTop: '4px' }}>Press V for select, W for wire tool</div>
      </div>
    </div>
  );
}

export default ComponentPanel;
