import { ComponentInstance, Wire, ComponentType, WireMaterial } from '../types';

const VERY_HIGH_RESISTANCE = 1e12;
const VERY_LOW_RESISTANCE = 1e-9;
const CONVERGENCE_THRESHOLD = 1e-6;
const MAX_ITERATIONS = 100;

const RESISTIVITY = {
    [WireMaterial.Copper]: 1.68e-8,
    [WireMaterial.Aluminum]: 2.65e-8,
};

function getComponentResistance(comp: ComponentInstance): number {
    if (comp.bouncingUntil && comp.bouncingUntil > Date.now()) {
        return Math.random() > 0.5 ? VERY_LOW_RESISTANCE : VERY_HIGH_RESISTANCE;
    }
    if (comp.properties.fault === 'open_circuit' || comp.isTripped) return VERY_HIGH_RESISTANCE;
    if (comp.properties.fault === 'short_circuit') return VERY_LOW_RESISTANCE;

    switch (comp.type) {
        case ComponentType.Resistor:
            return comp.properties.resistance || VERY_HIGH_RESISTANCE;
        case ComponentType.Switch:
        case ComponentType.PushButton:
        case ComponentType.ContactNO:
        case ComponentType.ContactNC:
        case ComponentType.PLCOutput:
            return comp.properties.on ? VERY_LOW_RESISTANCE : VERY_HIGH_RESISTANCE;
        case ComponentType.Fuse:
        case ComponentType.MCB:
        case ComponentType.MCCB:
        case ComponentType.ACB:
        case ComponentType.MotorProtector:
        case ComponentType.RCBO:
            return comp.properties.on ? VERY_LOW_RESISTANCE : VERY_HIGH_RESISTANCE;
        case ComponentType.Ammeter:
            return VERY_LOW_RESISTANCE;
        case ComponentType.Voltmeter:
            return VERY_HIGH_RESISTANCE;
        case ComponentType.RelayCoil:
        case ComponentType.ContactorCoil:
            return 200; // Typical 24V DC coil resistance
        case ComponentType.Lamp:
        case ComponentType.LED:
        case ComponentType.PLCInput:
            // R = V^2 / P
            const voltage = comp.properties.voltage || 24;
            const power = comp.properties.powerKW ? comp.properties.powerKW * 1000 : 2;
            return (voltage * voltage) / power;
        case ComponentType.DCMotor:
            // Simplified DC motor model: treat as a resistor
            const ratedVoltage = comp.properties.ratedVoltage || 24;
            const ratedCurrent = comp.properties.ratedCurrent || 1;
            return ratedVoltage / ratedCurrent;
        default:
            return VERY_LOW_RESISTANCE;
    }
}

function getWireResistance(wire: Wire): number {
    if (!wire.length || !wire.size || !wire.material) return VERY_LOW_RESISTANCE;
    const areaM2 = wire.size * 1e-6;
    return (RESISTIVITY[wire.material] * wire.length) / areaM2;
}

export function solveDCCircuit(components: ComponentInstance[], wires: Wire[]): { updatedComponents: ComponentInstance[], updatedWires: Wire[], terminalVoltages: Map<string, number> } {
    const controlComponents = components.filter(c => c.diagram === 'control');
    const controlWires = wires.filter(w => w.diagram === 'control');
    
    const componentMap = new Map(controlComponents.map(c => [c.id, c]));
    const connections: { id: string, resistance: number, terminals: string[] }[] = [];
    
    controlComponents.forEach(c => connections.push({ id: c.id, resistance: getComponentResistance(c), terminals: c.terminals.map(t => `${c.id}-${t.id}`) }));
    controlWires.forEach(w => connections.push({ id: w.id, resistance: getWireResistance(w), terminals: [`${w.startComponentId}-${w.startTerminalId}`, `${w.endComponentId}-${w.endTerminalId}`] }));

    const parent: Record<string, string> = {};
    const find = (i: string) => parent[i] === i ? i : (parent[i] = find(parent[i]));
    const union = (i: string, j: string) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootJ] = rootI;
    };

    const allTerminals = new Set<string>();
    controlComponents.forEach(c => c.terminals.forEach(t => allTerminals.add(`${c.id}-${t.id}`)));
    allTerminals.forEach(t => parent[t] = t);

    controlWires.forEach(w => union(`${w.startComponentId}-${w.startTerminalId}`, `${w.endComponentId}-${w.endTerminalId}`));

    const nodeMap: Map<string, number> = new Map();
    let nextNodeId = 0;
    const getNode = (terminalId: string) => {
        const root = find(terminalId);
        if (!nodeMap.has(root)) nodeMap.set(root, nextNodeId++);
        return nodeMap.get(root)!;
    };

    controlComponents.forEach(c => c.terminals.forEach(t => getNode(`${c.id}-${t.id}`)));
    
    const nodeVoltages: number[] = new Array(nextNodeId).fill(0);
    const isSourceNode: boolean[] = new Array(nextNodeId).fill(false);

    let groundNode = -1;
    controlComponents.filter(c => c.type === ComponentType.DCSource).forEach(source => {
        const posNode = getNode(`${source.id}-${source.terminals[0].id}`);
        const negNode = getNode(`${source.id}-${source.terminals[1].id}`);
        
        nodeVoltages[posNode] = source.properties.voltage || 0;
        isSourceNode[posNode] = true;
        
        if (groundNode === -1) {
            groundNode = negNode;
        }
        nodeVoltages[negNode] = 0;
        isSourceNode[negNode] = true;
    });

    if (groundNode === -1) { // No main DC source, try to find a ground from a logic gate
        const logicGate = controlComponents.find(c => [ComponentType.AND, ComponentType.OR, ComponentType.NOT, ComponentType.NAND, ComponentType.NOR, ComponentType.XOR].includes(c.type) && !c.isEnergized);
        if (logicGate) {
             const outNode = getNode(`${logicGate.id}-${logicGate.terminals.find(t => !t.isInput)!.id}`);
             groundNode = outNode;
        }
    }

    if (groundNode === -1) return { updatedComponents: components, updatedWires: wires, terminalVoltages: new Map() };

    // Logic Gate Outputs as sources
    const logicGates = controlComponents.filter(c => [ComponentType.AND, ComponentType.OR, ComponentType.NOT, ComponentType.NAND, ComponentType.NOR, ComponentType.XOR].includes(c.type));
    
    logicGates.forEach(gate => {
        const outTerminal = gate.terminals.find(t => !t.isInput);
        if (!outTerminal) return;
        const outNode = getNode(`${gate.id}-${outTerminal.id}`);
        
        if (gate.isEnergized) {
            nodeVoltages[outNode] = 24; // Energized output is 24V
            isSourceNode[outNode] = true;
        } else {
            nodeVoltages[outNode] = 0; // De-energized output is 0V (ground)
            isSourceNode[outNode] = true;
        }
    });


    const nodeConnections = new Array(nextNodeId).fill(0).map(() => [] as { neighbor: number, resistance: number }[]);
    connections.forEach(conn => {
        if (conn.terminals.length < 2) return;
        const nodeA = getNode(conn.terminals[0]);
        const nodeB = getNode(conn.terminals[1]);
        if (nodeA !== nodeB) {
            nodeConnections[nodeA].push({ neighbor: nodeB, resistance: conn.resistance });
            nodeConnections[nodeB].push({ neighbor: nodeA, resistance: conn.resistance });
        }
    });

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        let maxChange = 0;
        for (let j = 0; j < nextNodeId; j++) {
            if (isSourceNode[j]) continue;

            let sumConductance = 0;
            let sumCurrent = 0;
            nodeConnections[j].forEach(({ neighbor, resistance }) => {
                const conductance = 1 / Math.max(resistance, VERY_LOW_RESISTANCE);
                sumConductance += conductance;
                sumCurrent += nodeVoltages[neighbor] * conductance;
            });

            if (sumConductance > 0) {
                const newVoltage = sumCurrent / sumConductance;
                maxChange = Math.max(maxChange, Math.abs(newVoltage - nodeVoltages[j]));
                nodeVoltages[j] = newVoltage;
            }
        }
        if (maxChange < CONVERGENCE_THRESHOLD) break;
    }
    
    const terminalVoltages = new Map<string, number>();
    controlComponents.forEach(c => {
        c.terminals.forEach(t => {
            const terminalKey = `${c.id}-${t.id}`;
            const node = getNode(terminalKey);
            terminalVoltages.set(terminalKey, nodeVoltages[node]);
        });
    });

    const solvedControlComponents = controlComponents.map(comp => {
        // Energized state for logic gates is pre-calculated, so we skip them here.
        if(logicGates.some(g => g.id === comp.id)) return comp;

        const newProps = { ...comp.properties, liveVoltage: 0, liveCurrent: 0, livePower: 0 };
        if (comp.terminals.length < 2) return { ...comp, properties: newProps, isEnergized: false };
        
        const nodeA = getNode(`${comp.id}-${comp.terminals[0].id}`);
        const nodeB = getNode(`${comp.id}-${comp.terminals[1].id}`);

        const voltage = Math.abs(nodeVoltages[nodeA] - nodeVoltages[nodeB]);
        const resistance = getComponentResistance(comp);
        const current = voltage / Math.max(resistance, VERY_LOW_RESISTANCE);

        newProps.liveVoltage = voltage;
        newProps.liveCurrent = current;
        newProps.livePower = voltage * current;
        
        const isEnergized = voltage > 12; // Energized if more than 12V across it for most components
        
        return { ...comp, properties: newProps, isEnergized };
    });

    const solvedControlWires = controlWires.map(wire => {
         const nodeA = getNode(`${wire.startComponentId}-${wire.startTerminalId}`);
         const nodeB = getNode(`${wire.endComponentId}-${wire.endTerminalId}`);

         const voltageA = nodeVoltages[nodeA];
         const voltageB = nodeVoltages[nodeB];
         const voltageDiff = Math.abs(voltageA - voltageB);
         const resistance = getWireResistance(wire);
         const current = voltageDiff / Math.max(resistance, VERY_LOW_RESISTANCE);
         
         return {
            ...wire,
            isEnergized: voltageA > 12 || voltageB > 12,
            liveVoltage: voltageDiff,
            liveCurrent: current,
         }
    });

    // Merge results back into the full component and wire lists
    const updatedComponentMap = new Map(solvedControlComponents.map(c => [c.id, c]));
    const finalComponents = components.map(c => updatedComponentMap.get(c.id) || c);

    const updatedWireMap = new Map(solvedControlWires.map(w => [w.id, w]));
    const finalWires = wires.map(w => updatedWireMap.get(w.id) || w);

    return { updatedComponents: finalComponents, updatedWires: finalWires, terminalVoltages };
}
