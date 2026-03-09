
import React, { useState, useEffect } from 'react';
import { Cpu, ArrowDown, ArrowUp, Zap, Info, RotateCw, AlertTriangle, Layout, Table, Grid, Settings } from 'lucide-react';

// --- DATA DEFINITIONS ---

interface BitDef {
  bit: number;
  name: string;
  desc: string;
  activeLow?: boolean; // True if 0 is the "Safe/Stop" state (like OFF2)
}

// Telegram Definitions
interface TelegramDef {
    id: number;
    name: string;
    words: number;
    pzdOut: { name: string, type: 'WORD' | 'DWORD_H' | 'DWORD_L', desc: string }[]; // PLC -> Drive
    pzdIn: { name: string, type: 'WORD' | 'DWORD_H' | 'DWORD_L', desc: string }[];  // Drive -> PLC
}

const TELEGRAMS: TelegramDef[] = [
    {
        id: 1,
        name: 'Standard Telegram 1',
        words: 2,
        pzdOut: [
            { name: 'STW1', type: 'WORD', desc: 'Control Word 1' },
            { name: 'NSOLL_A', type: 'WORD', desc: 'Speed Setpoint (16-bit)' }
        ],
        pzdIn: [
            { name: 'ZSW1', type: 'WORD', desc: 'Status Word 1' },
            { name: 'NIST_A', type: 'WORD', desc: 'Actual Speed (16-bit)' }
        ]
    },
    {
        id: 352,
        name: 'SIEMENS Tel 352',
        words: 6,
        pzdOut: [
            { name: 'STW1', type: 'WORD', desc: 'Control Word 1' },
            { name: 'NSOLL_A', type: 'WORD', desc: 'Speed Setpoint' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' }
        ],
        pzdIn: [
            { name: 'ZSW1', type: 'WORD', desc: 'Status Word 1' },
            { name: 'NIST_A', type: 'WORD', desc: 'Actual Speed' },
            { name: 'I_ACT', type: 'WORD', desc: 'Actual Current' },
            { name: 'M_ACT', type: 'WORD', desc: 'Actual Torque' },
            { name: 'WARN_CODE', type: 'WORD', desc: 'Alarm Number' },
            { name: 'FAULT_CODE', type: 'WORD', desc: 'Fault Number' }
        ]
    },
    {
        id: 111,
        name: 'SIEMENS Tel 111 (EPos)',
        words: 12,
        pzdOut: [
            { name: 'STW1', type: 'WORD', desc: 'Control Word 1' },
            { name: 'POS_STW1', type: 'WORD', desc: 'Positioning Control' },
            { name: 'POS_STW2', type: 'WORD', desc: 'Positioning Control 2' },
            { name: 'STW2', type: 'WORD', desc: 'Master Sign of Life' },
            { name: 'OVERRIDE', type: 'WORD', desc: 'Vel. Override (0-16384)' },
            { name: 'MDI_TAR_POS', type: 'DWORD_H', desc: 'Target Position (High)' },
            { name: 'MDI_TAR_POS', type: 'DWORD_L', desc: 'Target Position (Low)' },
            { name: 'MDI_VEL', type: 'DWORD_H', desc: 'Velocity (High)' },
            { name: 'MDI_VEL', type: 'DWORD_L', desc: 'Velocity (Low)' },
            { name: 'MDI_ACC', type: 'WORD', desc: 'Acceleration' },
            { name: 'MDI_DEC', type: 'WORD', desc: 'Deceleration' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' }
        ],
        pzdIn: [
            { name: 'ZSW1', type: 'WORD', desc: 'Status Word 1' },
            { name: 'POS_ZSW1', type: 'WORD', desc: 'Positioning Status' },
            { name: 'POS_ZSW2', type: 'WORD', desc: 'Positioning Status 2' },
            { name: 'ZSW2', type: 'WORD', desc: 'Drive Sign of Life' },
            { name: 'MELDW', type: 'WORD', desc: 'Message Word' },
            { name: 'X_ACT', type: 'DWORD_H', desc: 'Actual Position (High)' },
            { name: 'X_ACT', type: 'DWORD_L', desc: 'Actual Position (Low)' },
            { name: 'V_ACT', type: 'DWORD_H', desc: 'Actual Velocity (High)' },
            { name: 'V_ACT', type: 'DWORD_L', desc: 'Actual Velocity (Low)' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' },
            { name: 'Unused', type: 'WORD', desc: 'Reserved' }
        ]
    }
];

const STW1_BITS: BitDef[] = [
  { bit: 0, name: 'ON / OFF1', desc: 'Rising Edge: Starts the drive (Pre-charges DC Link). 0: Ramp Stop.' },
  { bit: 1, name: 'No OFF2', desc: 'Coast Stop (Active Low). Must be 1 to run. 0 = Immediate Power Cut (IGBT Off).', activeLow: true },
  { bit: 2, name: 'No OFF3', desc: 'Fast Stop (Active Low). Must be 1 to run. 0 = Emergency Ramp Down.', activeLow: true },
  { bit: 3, name: 'Enable Op', desc: 'Pulse Enable. 1 = Current flows to motor. 0 = Coast.' },
  { bit: 4, name: 'Enable Ramp', desc: '1 = Ramp Generator Active. 0 = Output frozen at 0 Hz.' },
  { bit: 5, name: 'Unfreeze Ramp', desc: '1 = Ramp Generator continues. 0 = Output frozen at current value.' },
  { bit: 6, name: 'Enable Setpt', desc: '1 = Setpoint valid. 0 = Ramp to 0.' },
  { bit: 7, name: 'Fault Ack', desc: 'Rising Edge (0->1) resets active faults.' },
  { bit: 8, name: 'Jog 1', desc: 'Run at Jog Speed 1 while held.' },
  { bit: 9, name: 'Jog 2', desc: 'Run at Jog Speed 2 while held.' },
  { bit: 10, name: 'PLC Control', desc: 'Master Sign of Life. Must be 1 for PLC to control drive.' },
  { bit: 11, name: 'Reverse', desc: 'Invert direction of setpoint.' },
  { bit: 12, name: 'Unused', desc: 'Reserved' },
  { bit: 13, name: 'MOP Up', desc: 'Motor Potentiometer Increase' },
  { bit: 14, name: 'MOP Down', desc: 'Motor Potentiometer Decrease' },
  { bit: 15, name: 'CDS Bit 0', desc: 'Switch Command Data Set (Local/Remote)' },
];

const ZSW1_BITS: BitDef[] = [
  { bit: 0, name: 'Rdy to Switch On', desc: 'Power supply is OK. Waiting for ON command (Bit 0).' },
  { bit: 1, name: 'Rdy to Run', desc: 'DC Link charged. Waiting for Enable Operation (Bit 3).' },
  { bit: 2, name: 'Op Enabled', desc: 'Drive is RUNNING. IGBTs are pulsing.' },
  { bit: 3, name: 'Fault Present', desc: 'Active Fault. Drive is stopped.' },
  { bit: 4, name: 'No OFF2', desc: 'Feedback of STW1 Bit 1.' },
  { bit: 5, name: 'No OFF3', desc: 'Feedback of STW1 Bit 2.' },
  { bit: 6, name: 'Switch On Inhibited', desc: 'Lockout active. Need to toggle ON command (0->1) to reset.' },
  { bit: 7, name: 'Alarm Present', desc: 'Warning only. Drive keeps running.' },
  { bit: 8, name: 'Speed Dev', desc: 'Actual speed matches Setpoint (within tolerance).' },
  { bit: 9, name: 'Control Rqst', desc: 'PLC has control rights.' },
  { bit: 10, name: 'f_reached', desc: 'Ramp generator has reached target.' },
  { bit: 11, name: 'I/M Limit', desc: 'Current or Torque limit reached.' },
  { bit: 12, name: 'Brake Open', desc: 'Signal to open mechanical holding brake.' },
  { bit: 13, name: 'No Motor Overtemp', desc: '0 = Motor too hot.' },
  { bit: 14, name: 'Motor Rotation', desc: '1 = Clockwise, 0 = Counter-Clockwise.' },
  { bit: 15, name: 'Unused', desc: 'Reserved' },
];

const PlcTelegrams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYZER' | 'MAPPER'>('ANALYZER');
  
  // Analyzer State (STW1 Sim)
  const [stw1, setStw1] = useState<number>(0x047E); // Default "Ready"
  const [stateName, setStateName] = useState('S1: Switching On Inhibited');
  const [rpm, setRpm] = useState(0);
  const [faultActive, setFaultActive] = useState(false);
  const [zsw1, setZsw1] = useState(0);
  const [selectedBitInfo, setSelectedBitInfo] = useState<BitDef | null>(null);

  // Mapper State
  const [selectedTelegramId, setSelectedTelegramId] = useState<number>(352);
  const [startAddrOut, setStartAddrOut] = useState(256);
  const [startAddrIn, setStartAddrIn] = useState(256);
  
  const activeTelegram = TELEGRAMS.find(t => t.id === selectedTelegramId) || TELEGRAMS[0];

  // Helper: Get bit value
  const getBit = (word: number, bit: number) => (word >> bit) & 1;

  // Toggle Bit
  const toggleStw1 = (bit: number) => {
    setStw1(prev => prev ^ (1 << bit));
  };

  // --- DRIVE STATE MACHINE SIMULATION ---
  useEffect(() => {
    // Inputs from STW1
    const onOff1 = getBit(stw1, 0);
    const noOff2 = getBit(stw1, 1);
    const noOff3 = getBit(stw1, 2);
    const enableOp = getBit(stw1, 3);
    const faultAck = getBit(stw1, 7);
    const plcCtrl = getBit(stw1, 10);

    let nextZsw1 = 0;
    let nextState = '';
    let targetSpeed = 0;

    // 0. PLC Control Check
    if (!plcCtrl) {
       nextState = 'S0: Control Inhibited (Bit 10=0)';
       // ZSW1 Logic
       nextZsw1 |= (1 << 6); // Switching On Inhibited
    }
    // 1. Fault Handling
    else if (faultActive) {
       nextState = 'Fault State';
       nextZsw1 |= (1 << 3); // Fault Present
       nextZsw1 |= (1 << 6); // Switching On Inhibited
       
       if (faultAck) {
         setFaultActive(false); // Reset fault
       }
    }
    // 2. OFF2 / OFF3 Check (Safety/Coasting)
    else if (!noOff2 || !noOff3) {
       nextState = !noOff2 ? 'OFF2: Coast Stop' : 'OFF3: Fast Stop';
       nextZsw1 |= (1 << 6); // Switching On Inhibited (Lockout)
    }
    // 3. State Machine Logic
    else {
        // We are safe (OFF2=1, OFF3=1)
        
        // ZSW1 feedback bits
        nextZsw1 |= (1 << 4); // No OFF2
        nextZsw1 |= (1 << 5); // No OFF3
        nextZsw1 |= (1 << 9); // Control Requested

        if (!onOff1) {
            // S1: Ready to Switch On
            nextState = 'S1: Ready to Switch On';
            nextZsw1 |= (1 << 0); // Ready to Switch On bit
        } else {
            // ON command is High
            if (!enableOp) {
                // S2: Ready to Run (DC Link Charged)
                nextState = 'S2: Ready to Run (Pre-charged)';
                nextZsw1 |= (1 << 0);
                nextZsw1 |= (1 << 1); // Ready to Run bit
            } else {
                // S3: Operation Enabled
                nextState = 'S3: Operation Enabled';
                nextZsw1 |= (1 << 0);
                nextZsw1 |= (1 << 1);
                nextZsw1 |= (1 << 2); // Operation Enabled bit
                
                targetSpeed = 1500; // Simulated Speed
            }
        }
    }

    // Ramp Generator Simulation (Simple)
    if (targetSpeed > rpm) setRpm(prev => Math.min(targetSpeed, prev + 50));
    else if (targetSpeed < rpm) setRpm(prev => Math.max(targetSpeed, prev - 50));

    setStateName(nextState);
    setZsw1(nextZsw1);

  }, [stw1, faultActive, rpm]);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
      <div className="flex justify-between items-start mb-6">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="text-cyan-600" /> PLC Telegram Lab
            </h2>
            <p className="text-slate-500 text-sm">Visualize PROFINET data exchange, addressing, and logic.</p>
         </div>
         
         <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button 
                onClick={() => setActiveTab('ANALYZER')}
                className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeTab === 'ANALYZER' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Zap size={16}/> Logic Analyzer (STW1)
            </button>
            <button 
                onClick={() => setActiveTab('MAPPER')}
                className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeTab === 'MAPPER' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Grid size={16}/> Telegram Mapper
            </button>
         </div>
      </div>

      {activeTab === 'ANALYZER' ? (
        // --- VIEW 1: STATE MACHINE ---
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
            <div className="xl:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex justify-between items-center">
                    <span className="flex items-center gap-2"><ArrowDown size={16} className="text-purple-600"/> PLC Output (STW1)</span>
                    <div className="flex gap-2">
                        <button onClick={() => setStw1(0x047E)} className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded">047E</button>
                        <button onClick={() => setStw1(0x047F)} className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 rounded">047F</button>
                        <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">16#{stw1.toString(16).toUpperCase().padStart(4,'0')}</span>
                    </div>
                </h3>
                
                <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                    {STW1_BITS.map((b) => {
                        const isActive = getBit(stw1, b.bit) === 1;
                        return (
                            <button 
                                key={b.bit}
                                onClick={() => toggleStw1(b.bit)}
                                onMouseEnter={() => setSelectedBitInfo(b)}
                                className={`
                                    relative flex items-center justify-between px-3 py-2 rounded border text-left text-xs transition-all group
                                    ${isActive 
                                        ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold shadow-sm' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}
                                `}
                            >
                                <span className="z-10">Bit {b.bit}</span>
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-500' : 'bg-slate-200'}`}></div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/90 font-bold text-slate-800 transition-opacity">
                                    {b.name}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
                    <div className={`absolute inset-0 bg-cyan-500/10 ${rpm > 0 ? 'animate-pulse' : ''}`}></div>
                    
                    {faultActive ? (
                        <div className="flex flex-col items-center text-red-500 animate-bounce">
                            <AlertTriangle size={64} />
                            <span className="font-bold mt-2">FAULT F30002</span>
                        </div>
                    ) : (
                        <RotateCw size={80} className={`text-slate-600 transition-all duration-1000 ${rpm > 0 ? 'text-cyan-400 animate-spin' : ''}`} style={{animationDuration: rpm > 0 ? `${60000/rpm}ms` : '0s'}} />
                    )}

                    <div className="mt-4 text-center z-10">
                        <div className="text-xs text-slate-400 uppercase font-bold">Drive State</div>
                        <div className={`font-mono font-bold text-lg ${stateName.startsWith('S3') ? 'text-green-400' : 'text-white'}`}>{stateName}</div>
                    </div>

                    {/* State Machine Diagram Overlay */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold">
                        <div className={`px-2 py-1 rounded border ${stateName.startsWith('S1') ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>S1</div>
                        <div className="w-4 h-[1px] bg-slate-700"></div>
                        <div className={`px-2 py-1 rounded border ${stateName.startsWith('S2') ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>S2</div>
                        <div className="w-4 h-[1px] bg-slate-700"></div>
                        <div className={`px-2 py-1 rounded border ${stateName.startsWith('S3') ? 'bg-green-500 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>S3</div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Startup Sequence</h4>
                        <ul className="text-[10px] space-y-2 text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${getBit(stw1, 10) ? 'bg-green-500 border-green-400 text-white' : 'border-slate-600'}`}>1</span>
                                Set Bit 10 (PLC Control)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${getBit(stw1, 1) && getBit(stw1, 2) ? 'bg-green-500 border-green-400 text-white' : 'border-slate-600'}`}>2</span>
                                Set Bit 1 & 2 (No OFF2/3)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${getBit(stw1, 0) ? 'bg-green-500 border-green-400 text-white' : 'border-slate-600'}`}>3</span>
                                Set Bit 0 (ON Command)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${getBit(stw1, 3) ? 'bg-green-500 border-green-400 text-white' : 'border-slate-600'}`}>4</span>
                                Set Bit 3 (Enable Operation)
                            </li>
                        </ul>
                    </div>

                    <button 
                        onClick={() => setFaultActive(!faultActive)}
                        className="absolute top-2 right-2 text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-800 hover:bg-red-900"
                    >
                        {faultActive ? 'Clear Sim' : 'Sim Fault'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 border-b pb-2">Bit Details</h3>
                    {selectedBitInfo ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xl font-bold text-cyan-700">{selectedBitInfo.name}</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">Bit {selectedBitInfo.bit}</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {selectedBitInfo.desc}
                            </p>
                            {selectedBitInfo.activeLow && (
                                <div className="mt-3 text-xs bg-orange-50 text-orange-800 p-2 rounded border border-orange-100 font-bold">
                                    ⚠️ Active Low: This bit must be TRUE (1) for the drive to run.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic text-center mt-10">
                            Hover over any Control Word bit to see its engineering description.
                        </div>
                    )}
                </div>
            </div>

            <div className="xl:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex justify-between items-center">
                    <span className="flex items-center gap-2"><ArrowUp size={16} className="text-cyan-600"/> Drive Feedback (ZSW1)</span>
                    <span className="font-mono bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">16#{zsw1.toString(16).toUpperCase().padStart(4,'0')}</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                    {ZSW1_BITS.map((b) => {
                        const isActive = getBit(zsw1, b.bit) === 1;
                        return (
                            <div 
                                key={b.bit}
                                onMouseEnter={() => setSelectedBitInfo(b)}
                                className={`
                                    flex items-center justify-between px-3 py-2 rounded border text-left text-xs transition-all cursor-help
                                    ${isActive 
                                        ? 'bg-cyan-50 border-cyan-200 text-cyan-900 font-bold shadow-sm' 
                                        : 'bg-white border-slate-100 text-slate-400'}
                                `}
                            >
                                <span>Bit {b.bit}</span>
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-slate-200'}`}></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      ) : (
        // --- VIEW 2: TELEGRAM MAPPER ---
        <div className="flex flex-col gap-6 h-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Telegram Address Mapper</h3>
                   <p className="text-slate-500 text-sm">Configure addressing as you would in TIA Portal.</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 px-2">
                        <Settings size={14} className="text-slate-400"/>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Input Start (I)</label>
                            <input type="number" value={startAddrIn} onChange={(e) => setStartAddrIn(Number(e.target.value))} className="w-16 bg-white border border-slate-200 rounded px-1 text-xs font-mono focus:outline-cyan-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-slate-200">
                        <Settings size={14} className="text-slate-400"/>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Output Start (Q)</label>
                            <input type="number" value={startAddrOut} onChange={(e) => setStartAddrOut(Number(e.target.value))} className="w-16 bg-white border border-slate-200 rounded px-1 text-xs font-mono focus:outline-cyan-500" />
                        </div>
                    </div>
                    
                    <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

                    <div className="flex gap-2">
                        {TELEGRAMS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTelegramId(t.id)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${selectedTelegramId === t.id ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-y-auto">
                {/* OUTPUTS */}
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
                        <ArrowDown className="text-purple-600" /> PLC Outputs (%Q - Write)
                    </h4>
                    <div className="space-y-1">
                        {activeTelegram.pzdOut.map((pzd, idx) => {
                             const addr = startAddrOut + (idx * 2);
                             const isHigh = pzd.type === 'DWORD_H';
                             const isLow = pzd.type === 'DWORD_L';
                             
                             return (
                                <div key={idx} className={`flex items-center gap-4 group ${isLow ? 'opacity-70' : ''}`}>
                                    <div className="w-16 text-right font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded px-1 py-0.5">
                                        %QW{addr}
                                    </div>
                                    <div className={`flex-1 p-3 rounded-lg flex justify-between items-center border transition-all ${isHigh || isLow ? 'bg-purple-50/50 border-purple-100' : 'bg-purple-50 border-purple-100 hover:border-purple-300'}`}>
                                        <div>
                                            <span className="font-bold text-purple-900 text-sm">{pzd.name}</span>
                                            {isHigh && <span className="ml-2 text-[10px] text-purple-600 bg-purple-100 px-1 rounded">High Word</span>}
                                            {isLow && <span className="ml-2 text-[10px] text-purple-600 bg-purple-100 px-1 rounded">Low Word</span>}
                                        </div>
                                        <div className="text-right">
                                             <div className="text-[10px] text-slate-500">PZD {idx + 1}</div>
                                             <div className="text-[10px] text-slate-400 italic">{pzd.desc}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* INPUTS */}
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
                         <ArrowUp className="text-cyan-600" /> PLC Inputs (%I - Read)
                    </h4>
                    <div className="space-y-1">
                        {activeTelegram.pzdIn.map((pzd, idx) => {
                             const addr = startAddrIn + (idx * 2);
                             const isHigh = pzd.type === 'DWORD_H';
                             const isLow = pzd.type === 'DWORD_L';

                             return (
                                <div key={idx} className={`flex items-center gap-4 group ${isLow ? 'opacity-70' : ''}`}>
                                    <div className="w-16 text-right font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded px-1 py-0.5">
                                        %IW{addr}
                                    </div>
                                    <div className={`flex-1 p-3 rounded-lg flex justify-between items-center border transition-all ${isHigh || isLow ? 'bg-cyan-50/50 border-cyan-100' : 'bg-cyan-50 border-cyan-100 hover:border-cyan-300'}`}>
                                        <div>
                                            <span className="font-bold text-cyan-900 text-sm">{pzd.name}</span>
                                            {isHigh && <span className="ml-2 text-[10px] text-cyan-600 bg-cyan-100 px-1 rounded">High Word</span>}
                                            {isLow && <span className="ml-2 text-[10px] text-cyan-600 bg-cyan-100 px-1 rounded">Low Word</span>}
                                        </div>
                                        <div className="text-right">
                                             <div className="text-[10px] text-slate-500">PZD {idx + 1}</div>
                                             <div className="text-[10px] text-slate-400 italic">{pzd.desc}</div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 text-sm text-yellow-800">
                <Info className="flex-shrink-0" />
                <div>
                    <strong>Pro Tip:</strong> In S7-1500, these addresses are handled automatically by Tag names (e.g., "Drive1".ActualSpeed). In older S7-300 PLCs, you must use SFC14/15 to read/write these addresses consistently if they span more than 4 bytes.
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlcTelegrams;
