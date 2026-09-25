
import { SimulationEngine } from './engine';
import { Circuit, PlcInputMapping } from '../types';

let engine: SimulationEngine | null = null;

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'start-simulation':
      if (engine) {
        engine.stop();
      }
      const { circuit, plcInputMappings } = payload as { circuit: Circuit, plcInputMappings: PlcInputMapping[] };
      engine = new SimulationEngine(circuit, plcInputMappings);
      engine.start((updates) => {
        self.postMessage({ type: 'simulation-update', payload: updates });
      }, (plcUpdate) => {
        self.postMessage({ type: 'plc-input-update', payload: plcUpdate });
      });
      break;

    case 'stop-simulation':
      if (engine) {
        engine.stop();
        engine = null;
      }
      break;
        
    case 'update-component-state':
        if (engine) {
            engine.updateComponentState(payload.id, payload.state);
        }
        break;

    default:
      console.warn('Unknown message type received in worker:', type);
  }
};
