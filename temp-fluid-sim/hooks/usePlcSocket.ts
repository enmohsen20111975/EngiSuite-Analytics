import { useEffect, useRef, useCallback, RefObject } from 'react';
import { useCircuitStore } from './useCircuitStore';
import { PlcTag } from '../types';

const MOCK_PLC_URL = 'ws://localhost:8080';

// Mock PLC tags for demonstration
const mockTags: PlcTag[] = [
  { id: 'tag1', name: 'DI_StartCycle', type: 'bool', direction: 'input' },
  { id: 'tag2', name: 'DI_StopCycle', type: 'bool', direction: 'input' },
  { id: 'tag3', name: 'AI_PressureSetting', type: 'real', direction: 'input' },
  { id: 'tag4', name: 'DQ_SolenoidA', type: 'bool', direction: 'output' },
  { id: 'tag5', name: 'DQ_SolenoidB', type: 'bool', direction: 'output' },
  { id: 'tag6', name: 'AQ_PumpSpeed', type: 'real', direction: 'output' },
];

export function usePlcSocket(workerRef: RefObject<Worker | null>) {
  const ws = useRef<WebSocket | null>(null);
  const mockServerInterval = useRef<number | null>(null);
  const { setPlcStatus, updatePlcInputs, setPlcSendMessage } = useCircuitStore();

  const sendMessage = useCallback((message: { type: string; payload?: any }) => {
    // This function would send data to the real PLC gateway.
    // For the mock, we can just log it.
    console.log('[PLC Mock] Sending message to Gateway:', message);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    // In a real app, this would connect to a gateway.
    // Here, we simulate the gateway connection and behavior.
    console.log(`[PLC Mock] Connecting to ${MOCK_PLC_URL}...`);
    
    // Simulate successful connection
    setTimeout(() => {
      console.log("[PLC Mock] Connection established.");
      setPlcStatus(true, mockTags);
      setPlcSendMessage(sendMessage); // Register send function with store

      // Start mock server data changes
      mockServerInterval.current = window.setInterval(() => {
        // Simulate a tag changing value, e.g., a flashing input
        const newValue = Math.random() > 0.5 ? 1 : 0;
        const newInputs = { 'tag1': newValue };
        
        // Update the store, which will trigger a message to the worker
        // updatePlcInputs(newInputs); // Temporarily disable to see circuit -> PLC flow clearly
        
      }, 2000);

    }, 500);

    // This is where you would normally set up ws.current = new WebSocket(...)
    // and add onopen, onmessage, onclose, onerror handlers.
    // For the mock, we simulate these events.

  }, [setPlcStatus, updatePlcInputs, setPlcSendMessage, sendMessage]);

  const disconnect = useCallback(() => {
    if (mockServerInterval.current) {
      clearInterval(mockServerInterval.current);
      mockServerInterval.current = null;
    }
    ws.current?.close();
    ws.current = null;
    console.log("[PLC Mock] Disconnected.");
    setPlcStatus(false, []);
    setPlcSendMessage(() => {}); // De-register send function
  }, [setPlcStatus, setPlcSendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, sendMessage };
}