import React, { useState } from 'react';
import { ComponentInstance, ComponentType } from '../types';

interface AnalysisPanelProps {
  selectedComponent: ComponentInstance | null;
  events: { timestamp: number; message: string }[];
}

const DataRow: React.FC<{ label: string; value: string | number | undefined; unit: string }> = ({ label, value, unit }) => {
    const displayValue = typeof value === 'number' ? value.toFixed(2) : (value || 'N/A');
    return (
        <div className="flex justify-between items-center bg-black/20 p-2 rounded">
            <span className="text-[var(--text-muted)]">{label}</span>
            <span className="font-mono text-[var(--component-energized)]">{displayValue} {unit}</span>
        </div>
    )
}

const TripCurveChart: React.FC<{ component: ComponentInstance }> = ({ component }) => {
    const props = component.properties;
    const ratedCurrent = props.ratedCurrent || 1;
    const magneticRange = props.magnetic_trip_current_multiplier || (props.tripCurve === 'B' ? [3, 5] : props.tripCurve === 'D' ? [10, 20] : [5, 10]);
    const magneticMultiplier = Array.isArray(magneticRange) ? magneticRange[0] : magneticRange;
    const magneticTime = (props.instant_trip_time_ms || 20) / 1000; // in seconds
    const liveCurrentMultiplier = (props.liveCurrent || 0) / ratedCurrent;

    const width = 280;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    const minX = 1, maxX = 100; // Multiples of In
    const minY = 0.01, maxY = 3600; // Seconds

    const toLogX = (val: number) => Math.log10(val);
    const toLogY = (val: number) => Math.log10(val);

    const scaleX = (val: number) => padding.left + ((toLogX(val) - toLogX(minX)) / (toLogX(maxX) - toLogX(minX))) * (width - padding.left - padding.right);
    const scaleY = (val: number) => padding.top + (1 - (toLogY(val) - toLogY(minY)) / (toLogY(maxY) - toLogY(minY))) * (height - padding.top - padding.bottom);

    // Thermal curve approximation (I^2*t = k)
    const thermalPoints = [];
    for (let i = 1.15; i <= magneticMultiplier; i *= 1.25) {
        // A simplified inverse-time curve. t = k / (I^2 - 1)
        const time = 30 / (i**2 - 1); // Adjust '30' to tune the curve
        if (time < maxY && time > minY) {
            thermalPoints.push({ x: scaleX(i), y: scaleY(time) });
        }
    }
    const thermalPath = thermalPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

    const xTicks = [1, 2, 5, 10, 20, 50, 100].filter(t => t >= minX && t <= maxX);
    const yTicks = [0.01, 0.1, 1, 10, 100, 1000].filter(t => t >= minY && t <= maxY);

    const pointX = liveCurrentMultiplier > minX ? scaleX(liveCurrentMultiplier) : -10;
    const pointY = scaleY(maxY); 

    return (
        <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
            <h4 className="font-semibold text-[var(--text-secondary)] mb-2">Approx. Trip Curve</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="bg-black/20 rounded w-full">
                {/* Grid Lines */}
                {xTicks.map(tick => <line key={`x-grid-${tick}`} x1={scaleX(tick)} y1={padding.top} x2={scaleX(tick)} y2={height - padding.bottom} stroke="var(--border-primary)" strokeWidth="0.5" strokeDasharray="2 2" />)}
                {yTicks.map(tick => <line key={`y-grid-${tick}`} x1={padding.left} y1={scaleY(tick)} x2={width - padding.right} y2={scaleY(tick)} stroke="var(--border-primary)" strokeWidth="0.5" strokeDasharray="2 2" />)}
                {/* Axes */}
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="var(--text-muted)" strokeWidth="1" />
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="var(--text-muted)" strokeWidth="1" />
                {/* Ticks & Labels */}
                {xTicks.map(tick => (<g key={`x-tick-${tick}`}><text x={scaleX(tick)} y={height - padding.bottom + 15} textAnchor="middle" fill="var(--text-muted)" fontSize="10">{tick}x</text></g>))}
                {yTicks.map(tick => (<g key={`y-tick-${tick}`}><text x={padding.left - 8} y={scaleY(tick) + 3} textAnchor="end" fill="var(--text-muted)" fontSize="10">{tick}</text></g>))}
                {/* Titles */}
                <text x={padding.left + (width - padding.left - padding.right) / 2} y={height - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="11">Current (x Rated In)</text>
                <text transform={`translate(12, ${padding.top + (height - padding.top - padding.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--text-secondary)" fontSize="11">Time (s)</text>

                {/* Trip Regions */}
                <path d={thermalPath} stroke="var(--component-faulted)" strokeWidth="2" fill="none" />
                <line x1={scaleX(magneticMultiplier)} y1={scaleY(magneticTime)} x2={scaleX(maxX)} y2={scaleY(magneticTime)} stroke="var(--component-tripped)" strokeWidth="2" />
                <line x1={scaleX(magneticMultiplier)} y1={scaleY(maxY)} x2={scaleX(magneticMultiplier)} y2={scaleY(magneticTime)} stroke="var(--component-tripped)" strokeWidth="2" />
                
                {/* Live Current Point */}
                {liveCurrentMultiplier > minX && (
                    <g>
                        <line x1={pointX} y1={pointY} x2={pointX} y2={padding.top} stroke="var(--component-energized)" strokeWidth="1" strokeDasharray="3 3"/>
                        <circle cx={pointX} cy={scaleY(0.015)} r="4" fill="var(--component-energized)" stroke="white" strokeWidth="1">
                           <animate attributeName="cy" from={scaleY(maxY)} to={scaleY(minY)} dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <title>Live Current: {(props.liveCurrent || 0).toFixed(2)}A ({liveCurrentMultiplier.toFixed(1)}x In)</title>
                    </g>
                )}
            </svg>
        </div>
    );
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ selectedComponent, events }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'log'>('data');

  const renderLiveData = () => {
    if (!selectedComponent) {
      return <p className="text-[var(--text-muted)] p-4">Select a component and run the simulation to see its live data.</p>;
    }
    const props = selectedComponent.properties;
    const isMotor = [ComponentType.Motor, ComponentType.DCMotor, ComponentType.ServoMotor, ComponentType.StepperMotor].includes(selectedComponent.type);
    const isBreaker = [ComponentType.MCB, ComponentType.MCCB, ComponentType.ACB, ComponentType.MotorProtector, ComponentType.RCBO].includes(selectedComponent.type);

    return (
        <div className="p-4 flex flex-col space-y-4">
            <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2">Live Analysis: {selectedComponent.properties.label || selectedComponent.type}</h3>
            <div className="flex-grow space-y-3">
                <DataRow label="Status" value={selectedComponent.isTripped ? "TRIPPED" : selectedComponent.isEnergized ? "Energized" : "Off"} unit="" />
                {isMotor && <DataRow label="Motor State" value={selectedComponent.motorState} unit="" />}
                <DataRow label="Voltage" value={props.liveVoltage} unit="V" />
                <DataRow label="Current" value={props.liveCurrent} unit="A" />
                <DataRow label="Real Power" value={props.livePower} unit="W" />
                {(props.liveApparentPower || 0) > 0 && <DataRow label="Apparent Power" value={props.liveApparentPower} unit="VA" />}
                {(props.liveReactivePower || 0) > 0 && <DataRow label="Reactive Power" value={props.liveReactivePower} unit="VAR" />}

                
                <div className="pt-4 mt-4 border-t border-[var(--border-primary)]">
                    <h4 className="font-semibold text-[var(--text-secondary)] mb-2">Component Specs</h4>
                    {props.model && <p className="text-sm text-[var(--text-muted)]"><strong>Model:</strong> {props.model}</p>}
                    {props.ratedVoltage && <p className="text-sm text-[var(--text-muted)]"><strong>Rated Voltage:</strong> {props.ratedVoltage}V</p>}
                    {props.ratedCurrent && <p className="text-sm text-[var(--text-muted)]"><strong>Rated Current:</strong> {props.ratedCurrent}A</p>}
                    {props.powerKW && <p className="text-sm text-[var(--text-muted)]"><strong>Power:</strong> {props.powerKW}kW</p>}
                </div>

                {isBreaker && <TripCurveChart component={selectedComponent} />}
            </div>
        </div>
    );
  }

  const renderEventLog = () => {
    return (
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-lg font-bold border-b border-[var(--border-secondary)] pb-2 mb-2">Event Log</h3>
        <div className="flex-grow bg-black/20 rounded p-2 overflow-y-auto font-mono text-xs">
          {events.map(event => (
            <div key={event.timestamp} className="flex">
              <span className="text-gray-500 mr-2">{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className={`flex-shrink-0 ${event.message.startsWith('TRIP') ? 'text-red-400' : event.message.startsWith('FAIL') ? 'text-yellow-400' :  event.message.startsWith('BOUNCE') ? 'text-cyan-400' : 'text-gray-300'}`}>{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--bg-secondary)] flex flex-col">
        <div className="flex border-b border-[var(--border-primary)]">
            <button onClick={() => setActiveTab('data')} className={`flex-1 p-2 font-semibold ${activeTab === 'data' ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--tertiary)] hover:bg-[var(--bg-interactive)]'}`}>Live Data</button>
            <button onClick={() => setActiveTab('log')} className={`flex-1 p-2 font-semibold ${activeTab === 'log' ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--tertiary)] hover:bg-[var(--bg-interactive)]'}`}>Event Log</button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {activeTab === 'data' ? renderLiveData() : renderEventLog()}
        </div>
    </div>
  );
};