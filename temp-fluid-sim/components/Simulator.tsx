
import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Palette from './Palette';
import Canvas from './Canvas';
import RightPanel from './RightPanel';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { defaultCircuit } from '../data/defaultCircuit';
import { usePlcSocket } from '../hooks/usePlcSocket';

interface SimulatorProps {
    onNavigate: (view: 'landing' | 'training') => void;
}

const Simulator: React.FC<SimulatorProps> = ({ onNavigate }) => {
    const { loadCircuit, updateComponentState, applySimulationUpdates, plcSendMessage } = useCircuitStore();
    const workerRef = useRef<Worker | null>(null);

    // This hook just establishes the connection; the panel calls connect/disconnect
    usePlcSocket(workerRef);

    const updateComponentAndWorkerState = (id: string, state: object) => {
        updateComponentState(id, state);
        workerRef.current?.postMessage({
            type: 'update-component-state',
            payload: { id, state }
        });
    };

    useEffect(() => {
        // Load a default circuit if none is present
        if (!useCircuitStore.getState().circuit) {
            loadCircuit(defaultCircuit);
        }
        
        // Use the external worker file
        workerRef.current = new Worker(new URL('../simulation/worker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            if (type === 'simulation-update') {
                applySimulationUpdates(payload);
            } else if (type === 'plc-input-update') {
                plcSendMessage({ type: 'tag-write', payload });
            }
        };
        
        return () => {
            workerRef.current?.terminate();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Header worker={workerRef.current} onBack={() => onNavigate('landing')} />
            <main className="flex flex-1 overflow-hidden">
                <Palette />
                <div className="flex-1 flex flex-col relative bg-muted/20">
                    <Canvas updateComponentState={updateComponentAndWorkerState} />
                </div>
                <RightPanel />
            </main>
        </>
    );
};

export default Simulator;
