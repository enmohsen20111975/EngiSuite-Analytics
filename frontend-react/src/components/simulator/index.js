/**
 * Simulator Component Library
 * React-based hydraulic and electrical circuit simulator
 */

// Context and Hooks
export { SimulatorProvider, useSimulator } from './context/SimulatorContext';
export { useSimulatorCanvas } from './canvas/hooks/useCanvasRender';
export { useSimulatorEvents } from './canvas/hooks/useCanvasEvents';

// Canvas Components
export { SimulatorCanvas } from './canvas/SimulatorCanvas';
export { CanvasGrid } from './canvas/CanvasGrid';

// Component System
export { ComponentRenderer } from './components/ComponentRenderer';
export { ComponentCatalog } from './components/ComponentCatalog';
export { HYDRAULIC_COMPONENTS } from './components/definitions/hydraulic';
export { PNEUMATIC_COMPONENTS } from './components/definitions/pneumatic';

// Wire System
export { WireRenderer } from './wires/WireRenderer';
export { WireRouter } from './wires/WireRouter';
export { WireTool } from './wires/WireTool';

// Tools
export { SelectionTool } from './tools/SelectionTool';
export { PanTool } from './tools/PanTool';
export { ToolManager, useToolManager } from './tools/ToolManager';

// Panels
export { ComponentPanel } from './panels/ComponentPanel';
export { PropertiesPanel } from './panels/PropertiesPanel';
export { AnalysisPanel } from './panels/AnalysisPanel';

// Simulation
export { SimulationEngine } from './simulation/SimulationEngine';
export { CircuitAnalyzer } from './simulation/CircuitAnalyzer';
export { HydraulicCalculations } from './simulation/HydraulicCalculations';

// UI Components
export { Toolbar } from './ui/Toolbar';
export { StatusBar } from './ui/StatusBar';
