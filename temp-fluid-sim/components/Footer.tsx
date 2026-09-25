import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useCircuitStore } from '../hooks/useCircuitStore';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

const Footer: React.FC = () => {
    const { zoom, setZoom, isSimulationRunning } = useCircuitStore();

    const handleZoomIn = () => {
        setZoom(Math.min(MAX_ZOOM, zoom + 0.1));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(MIN_ZOOM, zoom - 0.1));
    };

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-10 px-4 flex items-center justify-between bg-card/80 backdrop-blur-sm border-t border-border z-10">
        <div className="text-xs text-muted-foreground">
             {isSimulationRunning ? "Simulation running..." : "Ready. Simulation stopped."}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-accent" disabled={zoom <= MIN_ZOOM}><ZoomOut className="h-4 w-4" /></button>
            <span className="text-xs font-semibold w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-accent" disabled={zoom >= MAX_ZOOM}><ZoomIn className="h-4 w-4" /></button>
        </div>
    </footer>
  );
};

export default Footer;