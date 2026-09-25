/**
 * ToolManager
 * Manages tool switching and coordination
 */

import { useState, useCallback, useMemo } from 'react';

export function useToolManager(initialTool = 'select') {
  const [currentTool, setCurrentTool] = useState(initialTool);
  
  const tools = useMemo(() => ({
    select: {
      name: 'Select',
      icon: '🔍',
      shortcut: 'V',
      cursor: 'default'
    },
    wire: {
      name: 'Wire',
      icon: '🔗',
      shortcut: 'W',
      cursor: 'crosshair'
    },
    pan: {
      name: 'Pan',
      icon: '✋',
      shortcut: 'H',
      cursor: 'grab'
    },
    component: {
      name: 'Component',
      icon: '📦',
      shortcut: 'C',
      cursor: 'copy'
    }
  }), []);
  
  const setTool = useCallback((toolId) => {
    if (tools[toolId]) {
      setCurrentTool(toolId);
    }
  }, [tools]);
  
  const getToolInfo = useCallback((toolId) => {
    return tools[toolId] || tools.select;
  }, [tools]);
  
  return {
    currentTool,
    setTool,
    tools,
    getToolInfo,
    currentToolInfo: tools[currentTool]
  };
}

export const ToolManager = {
  useToolManager
};

export default ToolManager;
