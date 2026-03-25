import React, { useState, useEffect, useRef } from 'react';

export const ContactorVisual: React.FC = () => {
  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
        .contactor-visual-group .armature {
          transition: transform 0.3s ease-in-out;
        }
        .contactor-visual-group .contacts {
          transition: transform 0.3s ease-in-out;
        }
        .contactor-visual-group:hover .armature {
          transform: translateY(8px);
        }
        .contactor-visual-group:hover .contacts {
          transform: translateY(15px);
        }
        .contactor-visual-group:hover .coil-glow {
            opacity: 1;
        }
      `}</style>
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        <defs>
            <filter id="glow-coil" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Labels */}
        <text x="150" y="20" textAnchor="middle" fill="white" fontSize="14">Power Circuit (High Voltage)</text>
        <text x="150" y="185" textAnchor="middle" fill="white" fontSize="14">Control Circuit (Low Voltage)</text>

        {/* Group for Hover Interaction */}
        <g className="contactor-visual-group">
          {/* Coil */}
          <rect x="110" y="130" width="80" height="40" fill="#374151" stroke="#4B5563" strokeWidth="2" />
          <text x="150" y="155" textAnchor="middle" fill="cyan" fontSize="12">A1</text>
          <text x="150" y="125" textAnchor="middle" fill="cyan" fontSize="12">A2</text>
          <line x1="150" y1="170" x2="150" y2="200" stroke="cyan" strokeWidth="2" />
          <line x1="150" y1="130" x2="150" y2="100" stroke="cyan" strokeWidth="2" />
          <circle cx="150" cy="95" r="5" fill="none" stroke="cyan" strokeWidth="2" />
          <text x="170" y="100" fill="cyan" fontSize="12" className="font-bold">Coil</text>
          <rect x="110" y="130" width="80" height="40" fill="yellow" opacity="0" className="coil-glow" filter="url(#glow-coil)" style={{ transition: 'opacity 0.3s' }}/>


          {/* Core & Armature */}
          <g className="armature">
              <rect x="120" y="70" width="60" height="60" fill="#6B7280" />
              <rect x="100" y="60" width="100" height="10" fill="#9CA3AF" />
              <text x="210" y="60" fill="white" fontSize="12">Armature</text>
          </g>

          {/* Spring */}
          <path d="M100 80 L110 85 L100 90 L110 95 L100 100" stroke="#9CA3AF" fill="none" strokeWidth="1.5" />

          {/* Main Contacts */}
          <g className="contacts">
            {/* Left Contact */}
            <line x1="50" y1="0" x2="50" y2="40" stroke="white" strokeWidth="3" />
            <line x1="50" y1="60" x2="50" y2="100" stroke="white" strokeWidth="3" />
            <line x1="50" y1="40" x2="100" y2="40" stroke="white" strokeWidth="3" />
            
            {/* Middle Contact */}
            <line x1="150" y1="0" x2="150" y2="40" stroke="white" strokeWidth="3" />
            <line x1="150" y1="60" x2="150" y2="100" stroke="white" strokeWidth="3" />
            <line x1="150" y1="40" x2="200" y2="40" stroke="white" strokeWidth="3" />

             {/* Right Contact */}
            <line x1="250" y1="0" x2="250" y2="40" stroke="white" strokeWidth="3" />
            <line x1="250" y1="60" x2="250" y2="100" stroke="white" strokeWidth="3" />
            <line x1="250" y1="40" x2="200" y2="40" stroke="white" strokeWidth="3" />
          </g>

          <text x="150" y="80" textAnchor="middle" fill="white" fontSize="12" pointerEvents="none" className="opacity-0 group-hover:opacity-100 transition-opacity">Magnetic Field Pulls Armature</text>

        </g>
      </svg>
      <p className="mt-2">Hover over the coil to energize it.</p>
    </div>
  );
};

export const RelayVisual: React.FC = () => {
  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
        .relay-visual-group:hover .relay-armature {
          transform: rotate(77.5deg);
        }
        .relay-visual-group:hover .coil-glow {
            opacity: 1;
        }
      `}</style>
      <svg width="250" height="200" viewBox="0 0 250 200" className="bg-gray-800 rounded-lg">
        <defs>
            <filter id="glow-relay" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g className="relay-visual-group">
            <rect x="0" y="0" width="250" height="200" fill="transparent" />
            {/* Coil */}
            <rect x="20" y="130" width="80" height="40" fill="#374151" stroke="#4B5563" strokeWidth="2" />
            <rect x="20" y="130" width="80" height="40" fill="yellow" opacity="0" className="coil-glow" filter="url(#glow-relay)" style={{ transition: 'opacity 0.3s' }}/>
            <text x="60" y="155" textAnchor="middle" fill="cyan" fontSize="12">Coil</text>
            
            {/* Terminals */}
            <text x="215" y="65" fill="white">NC</text>
            <circle cx="200" cy="60" r="5" fill="#9CA3AF" />
            <text x="215" y="145" fill="white">NO</text>
            <circle cx="200" cy="140" r="5" fill="#9CA3AF" />
            <text x="120" y="105" fill="white">COM</text>
            <circle cx="150" cy="100" r="5" fill="#9CA3AF" />
            
            {/* Wires */}
            <line x1="0" y1="150" x2="20" y2="150" stroke="cyan" strokeWidth="2"/>
            <line x1="100" y1="150" x2="120" y2="150" stroke="cyan" strokeWidth="2"/>
            <text x="5" y="145" fill="cyan" fontSize="12">+</text>
            <text x="115" y="145" fill="cyan" fontSize="12">-</text>


            {/* Movable Armature */}
            <g className="relay-armature" style={{ transformOrigin: '150px 100px', transition: 'transform 0.2s ease-in-out' }}>
                <line x1="150" y1="100" x2="200" y2="60" stroke="white" strokeWidth="3" />
            </g>
        </g>
      </svg>
      <p className="mt-2">Hover over the coil area to energize it.</p>
    </div>
  );
};

export const MCBVisual: React.FC = () => {
  const [state, setState] = useState<'on' | 'thermal' | 'magnetic'>('on');

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
        @keyframes thermal-bend {
          from { d: path('M100 130 Q100 100 100 70'); }
          to { d: path('M100 130 Q115 100 100 70'); }
        }
        .thermal-trip {
          animation: thermal-bend 1.5s forwards;
        }
        .mcb-arm {
          transition: transform 0.2s ease-in-out;
        }
        .mcb-arm-tripped {
          transform: rotate(-30deg);
        }
        .magnetic-plunger {
          transition: transform 0.1s;
        }
        .magnetic-trip {
          transform: translateY(-10px);
        }
      `}</style>
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Main Circuit */}
        <line x1="0" y1="100" x2="50" y2="100" stroke="white" strokeWidth="4" />
        <line x1="250" y1="100" x2="300" y2="100" stroke="white" strokeWidth="4" />
        <circle cx="50" cy="100" r="5" fill="#9CA3AF" />
        <circle cx="250" cy="100" r="5" fill="#9CA3AF" />
        
        {/* Armature */}
        <g className={`mcb-arm ${state !== 'on' ? 'mcb-arm-tripped' : ''}`} style={{ transformOrigin: '50px 100px'}}>
          <line x1="50" y1="100" x2="250" y2="100" stroke="white" strokeWidth="4" />
        </g>

        {/* Trip Mechanism */}
        <rect x="90" y="50" width="120" height="80" fill="#374151" rx="5" />
        {/* Latch */}
        <line x1="180" y1="70" x2="200" y2="70" stroke="yellow" strokeWidth="3" />
        <line x1="180" y1="70" x2="180" y2="130" stroke="yellow" strokeWidth="3" />

        {/* Thermal Strip */}
        <path id="bimetal" d="M100 130 Q100 100 100 70" stroke="pink" strokeWidth="4" fill="none" className={state === 'thermal' ? 'thermal-trip' : ''} onAnimationEnd={() => state === 'thermal' && setState('thermal')}/>
        <text x="70" y="110" fill="white" fontSize="12">Thermal</text>

        {/* Magnetic Coil */}
        <rect x="130" y="110" width="40" height="20" fill="none" stroke="lightblue" strokeWidth="2" />
        <line x1="130" y1="110" x2="170" y2="110" stroke="lightblue" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="130" y1="115" x2="170" y2="115" stroke="lightblue" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="130" y1="120" x2="170" y2="120" stroke="lightblue" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="130" y1="125" x2="170" y2="125" stroke="lightblue" strokeWidth="1" strokeDasharray="2 3" />
        <g className={`magnetic-plunger ${state === 'magnetic' ? 'magnetic-trip' : ''}`}>
           <rect x="145" y="80" width="10" height="30" fill="#6B7280" />
        </g>
        <text x="135" y="75" fill="white" fontSize="12">Magnetic</text>

        {/* Status Text */}
        {state === 'thermal' && <text x="150" y="40" textAnchor="middle" fill="pink" className="font-bold">THERMAL TRIP (Overload)</text>}
        {state === 'magnetic' && <text x="150" y="40" textAnchor="middle" fill="lightblue" className="font-bold">MAGNETIC TRIP (Short Circuit)</text>}
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={() => setState('thermal')} className="px-2 py-1 bg-pink-600 rounded text-xs">Simulate Overload</button>
          <button onClick={() => setState('magnetic')} className="px-2 py-1 bg-blue-600 rounded text-xs">Simulate Short Circuit</button>
          <button onClick={() => setState('on')} className="px-2 py-1 bg-gray-600 rounded text-xs">Reset</button>
      </div>
    </div>
  );
};

export const PushButtonVisualNO: React.FC = () => (
  <div className="p-4 text-center text-sm text-gray-400">
    <style>{`
      .pb-no-visual:active .pb-plunger { transform: translateY(10px); }
      .pb-no-visual:active .pb-contact { transform: translateY(10px); }
    `}</style>
    <svg width="150" height="150" viewBox="0 0 150 150" className="bg-gray-800 rounded-lg pb-no-visual cursor-pointer">
      {/* Terminals */}
      <line x1="0" y1="85" x2="50" y2="85" stroke="white" strokeWidth="3" />
      <line x1="100" y1="85" x2="150" y2="85" stroke="white" strokeWidth="3" />
      <circle cx="50" cy="85" r="5" fill="#9CA3AF" />
      <circle cx="100" cy="85" r="5" fill="#9CA3AF" />
      {/* Plunger */}
      <g className="pb-plunger" style={{transition: 'transform 0.1s'}}>
        <rect x="65" y="20" width="20" height="30" fill="green" stroke="lightgreen" strokeWidth="1" />
        <line x1="75" y1="50" x2="75" y2="70" stroke="white" strokeWidth="2" />
      </g>
      {/* Contact */}
      <line className="pb-contact" style={{transition: 'transform 0.1s'}} x1="50" y1="70" x2="100" y2="70" stroke="white" strokeWidth="3" />
    </svg>
    <p className="mt-2">Click and hold to Start.</p>
  </div>
);

export const PushButtonVisualNC: React.FC = () => (
    <div className="p-4 text-center text-sm text-gray-400">
    <style>{`
      .pb-nc-visual:active .pb-plunger { transform: translateY(10px); }
      .pb-nc-visual:active .pb-contact { transform: translateY(10px); }
    `}</style>
    <svg width="150" height="150" viewBox="0 0 150 150" className="bg-gray-800 rounded-lg pb-nc-visual cursor-pointer">
      {/* Terminals */}
      <line x1="0" y1="75" x2="50" y2="75" stroke="white" strokeWidth="3" />
      <line x1="100" y1="75" x2="150" y2="75" stroke="white" strokeWidth="3" />
      <circle cx="50" cy="75" r="5" fill="#9CA3AF" />
      <circle cx="100" cy="75" r="5" fill="#9CA3AF" />
      {/* Plunger */}
      <g className="pb-plunger" style={{transition: 'transform 0.1s'}}>
        <rect x="65" y="20" width="20" height="30" fill="red" stroke="pink" strokeWidth="1" />
        <line x1="75" y1="50" x2="75" y2="75" stroke="white" strokeWidth="2" />
      </g>
      {/* Contact */}
      <line className="pb-contact" style={{transition: 'transform 0.1s'}} x1="50" y1="75" x2="100" y2="75" stroke="white" strokeWidth="3" />
      {/* NC indicator line */}
      <line x1="95" y1="65" x2="55" y2="85" stroke="#374151" strokeWidth="4" />
    </svg>
    <p className="mt-2">Click and hold to Stop.</p>
  </div>
);

export const DOLStarterVisual: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [startHeld, setStartHeld] = useState(false);

  useEffect(() => {
    if (startHeld) {
      setRunning(true);
    }
  }, [startHeld]);

  const isCoilEnergized = running || startHeld;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
          .dol-path { stroke-dasharray: 10; stroke-dashoffset: 20; }
          .dol-energized { animation: dol-flow 1s linear infinite; }
          @keyframes dol-flow { to { stroke-dashoffset: 0; } }
      `}</style>
      <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-800 rounded-lg">
        {/* Power Circuit */}
        <text x="100" y="20" fill="white">Power Circuit</text>
        <path d="M100 30 V60" stroke="red" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
        <text x="110" y="50" fill="white">L1</text>
        <path d="M100 60 H70" stroke="red" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
        <path d="M70 60 v20" stroke="red" strokeWidth="2" className={isCoilEnergized ? 'dol-energized' : ''} />
        <line x1="70" y1="80" x2="130" y2="80" stroke="red" strokeWidth="2" className={isCoilEnergized ? '' : 'hidden'}/>
        <path d="M130 60 v20" stroke="red" strokeWidth="2" className={isCoilEnergized ? 'dol-energized' : ''} />
        <path d="M130 60 H100" stroke="red" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
        <text x="90" y="75" fill={isCoilEnergized ? 'lightgreen' : 'white'}>KM1</text>
        <path d="M100 80 V100" stroke="red" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
        <circle cx="100" cy="120" r="20" fill="none" stroke="white" strokeWidth="2" />
        <text x="100" y="125" textAnchor="middle" fill="white">M</text>
        <text x="100" y="135" textAnchor="middle" fill="white" fontSize="8">3~</text>
        
        {/* Control Circuit */}
        <text x="300" y="20" fill="white">Control Circuit</text>
        <path d="M250 50 V250" stroke="cyan" strokeWidth="2" className="dol-path dol-energized" />
        <path d="M350 50 V250" stroke="cyan" strokeWidth="2" />
        <text x="240" y="60" fill="cyan">+24V</text>
        <text x="360" y="60" fill="cyan">0V</text>
        
        {/* Stop Button */}
        <path d="M250 80 H290" stroke="cyan" strokeWidth="2" className="dol-path dol-energized" />
        <rect x="290" y="70" width="20" height="20" fill="red" className="cursor-pointer" onClick={() => setRunning(false)} />
        <line x1="295" y1="75" x2="305" y2="85" stroke="white" strokeWidth="1" />
        <text x="300" y="100" textAnchor="middle" fill="white">Stop</text>
        <path d="M310 80 H350" stroke="cyan" strokeWidth="2" className={`dol-path ${startHeld || running ? 'dol-energized' : ''}`} />
        <path d="M310 80 V130" stroke="cyan" strokeWidth="2" className={`dol-path ${startHeld || running ? 'dol-energized' : ''}`} />

        {/* Start Button & Latch */}
        <rect x="280" y="130" width="20" height="20" fill="green" className="cursor-pointer" onMouseDown={() => setStartHeld(true)} onMouseUp={() => setStartHeld(false)} onMouseLeave={() => setStartHeld(false)}/>
        <text x="290" y="155" textAnchor="middle" fill="white">Start</text>
        <path d="M250 130 H280" stroke="cyan" strokeWidth="2" className={`dol-path ${startHeld || running ? 'dol-energized' : ''}`} />
        <path d="M300 130 H310" stroke="cyan" strokeWidth="2" className={`dol-path ${startHeld ? 'dol-energized' : ''}`} />

        <path d="M250 180 H280" stroke="cyan" strokeWidth="2" className={`dol-path ${running ? 'dol-energized' : ''}`} />
        <line x1="280" y1="175" x2="280" y2="185" stroke={isCoilEnergized ? 'lightgreen' : 'white'} strokeWidth="2" />
        <line x1="300" y1="175" x2="300" y2="185" stroke={isCoilEnergized ? 'lightgreen' : 'white'} strokeWidth="2" />
        <text x="290" y="170" textAnchor="middle" fill={isCoilEnergized ? 'lightgreen' : 'white'}>KM1</text>
        <path d="M300 180 H310" stroke="cyan" strokeWidth="2" className={`dol-path ${running ? 'dol-energized' : ''}`} />
        <path d="M310 130 V180" stroke="cyan" strokeWidth="2" className={`dol-path ${startHeld || running ? 'dol-energized' : ''}`} />

        {/* Coil */}
        <path d="M310 180 V220" stroke="cyan" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
        <rect x="290" y="220" width="40" height="20" fill="none" stroke="cyan" strokeWidth="2" />
        <text x="310" y="235" textAnchor="middle" fill="cyan">KM1</text>
        <path d="M330 220 H350" stroke="cyan" strokeWidth="2" className={`dol-path ${isCoilEnergized ? 'dol-energized' : ''}`} />
      </svg>
    </div>
  );
};

export const StarDeltaVisual: React.FC = () => {
  const [state, setState] = useState<'stop' | 'star' | 'delta'>('stop');
  const timerRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (state === 'star') {
      timerRef.current = window.setTimeout(() => {
        setState('delta');
      }, 2000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state]);

  const handleStart = () => {
    if (state === 'stop') {
      setState('star');
    }
  };

  const handleStop = () => {
    setState('stop');
  };

  const isStar = state === 'star';
  const isDelta = state === 'delta';
  const isRunning = isStar || isDelta;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-800 rounded-lg">
        {/* Motor Windings */}
        <text x="200" y="200" textAnchor="middle" fill="white">Motor Windings</text>
        <line x1="150" y1="220" x2="150" y2="280" stroke="white" strokeWidth="2"/>
        <text x="145" y="215">U1</text><text x="145" y="295">U2</text>
        <line x1="200" y1="220" x2="200" y2="280" stroke="white" strokeWidth="2"/>
        <text x="195" y="215">V1</text><text x="195" y="295">V2</text>
        <line x1="250" y1="220" x2="250" y2="280" stroke="white" strokeWidth="2"/>
        <text x="245" y="215">W1</text><text x="245" y="295">W2</text>
        
        {/* Contactors */}
        <rect x="20" y="50" width="80" height="30" fill={isRunning ? 'green' : '#374151'} stroke="white" /><text x="60" y="70" fill="white" textAnchor="middle">Main</text>
        <rect x="160" y="50" width="80" height="30" fill={isStar ? 'green' : '#374151'} stroke="white" /><text x="200" y="70" fill="white" textAnchor="middle">Star</text>
        <rect x="300" y="50" width="80" height="30" fill={isDelta ? 'green' : '#374151'} stroke="white" /><text x="340" y="70" fill="white" textAnchor="middle">Delta</text>

        {/* Wiring */}
        {/* Main Contactor to Motor */}
        <path d="M60 80 v40 h90 v100" stroke={isRunning ? 'lightgreen' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M60 80 v50 h140 v90" stroke={isRunning ? 'lightgreen' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M60 80 v60 h190 v80" stroke={isRunning ? 'lightgreen' : 'gray'} strokeWidth="2" fill="none" />

        {/* Star Contactor */}
        <path d="M200 80 v120 h-50 v80" stroke={isStar ? 'yellow' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M200 80 v130 v90" stroke={isStar ? 'yellow' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M200 80 v120 h50 v80" stroke={isStar ? 'yellow' : 'gray'} strokeWidth="2" fill="none" />
        <line x1="180" y1="100" x2="220" y2="100" stroke={isStar ? 'yellow' : 'gray'} strokeWidth="3" />
        
        {/* Delta Contactor */}
        <path d="M340 80 v100 h-90 v100" stroke={isDelta ? 'orange' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M340 80 v110 h-190 v90" stroke={isDelta ? 'orange' : 'gray'} strokeWidth="2" fill="none" />
        <path d="M340 80 v120 h-290 v80" stroke={isDelta ? 'orange' : 'gray'} strokeWidth="2" fill="none" />
        
        {/* Status */}
        <text x="200" y="20" textAnchor="middle" fill="white" fontSize="16">{state.toUpperCase()}</text>
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={handleStart} className="px-2 py-1 bg-green-600 rounded text-xs" disabled={isRunning}>Start</button>
        <button onClick={handleStop} className="px-2 py-1 bg-red-600 rounded text-xs" disabled={!isRunning}>Stop</button>
      </div>
    </div>
  )
};

export const OverloadRelayVisual: React.FC = () => {
  const [tripped, setTripped] = useState(false);
  const [overheating, setOverheating] = useState(false);

  const handleOverload = () => {
    setOverheating(true);
    setTimeout(() => {
      setTripped(true);
      setOverheating(false);
    }, 1500);
  };
  
  return (
    <div className="p-4 text-center text-sm text-gray-400">
       <style>{`
        @keyframes heat-glow { 0% { fill: red; opacity: 0.5; } 100% { fill: orange; opacity: 0.8; } }
        .overheating-strip { animation: heat-glow 1.5s forwards; }
        .trip-mechanism { transition: transform 0.3s ease-out; }
      `}</style>
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Bimetallic Strip */}
        <text x="50" y="30" fill="white">Bimetallic Strip</text>
        <path
          strokeWidth="5"
          stroke="#9CA3AF"
          fill="none"
          className={overheating ? 'overheating-strip' : ''}
          style={{ transition: 'd 0.5s' }}
          d={tripped ? 'M 50 120 C 70 80, 70 40, 70 40' : 'M 50 120 C 50 80, 50 40, 50 40'}
        />
        <rect x="40" y="120" width="20" height="10" fill="red" />
        <text x="35" y="145" fill="white">Heater</text>
        
        {/* Trip Mechanism */}
        <g className="trip-mechanism" style={{transform: tripped ? 'translateX(10px)' : 'none'}}>
          <rect x="70" y="50" width="10" height="60" fill="yellow" />
          <line x1="80" y1="80" x2="150" y2="80" stroke="yellow" strokeWidth="3" />
        </g>
        
        {/* Contacts */}
        <text x="200" y="30" fill="white">Contacts</text>
        {/* NC Contact 95-96 */}
        <text x="180" y="70" fill="white" fontSize="12">95</text>
        <text x="240" y="70" fill="white" fontSize="12">96</text>
        <line x1="200" y1="50" x2="200" y2="80" stroke={!tripped ? "lightgreen" : "#9CA3AF"} />
        <line x1="220" y1="50" x2="220" y2="80" stroke={!tripped ? "lightgreen" : "#9CA3AF"} />
        <line x1="150" y1="80" x2="200" y2="80" stroke="yellow" strokeWidth={tripped ? 2 : 3} />
        <line x1="220" y1="80" x2="235" y2="70" stroke={tripped ? "transparent" : "#9CA3AF"} strokeWidth="2" />

        {/* NO Contact 97-98 */}
        <text x="180" y="120" fill="white" fontSize="12">97</text>
        <text x="240" y="120" fill="white" fontSize="12">98</text>
        <line x1="200" y1="100" x2="200" y2="130" stroke={tripped ? "lightgreen" : "#9CA3AF"} />
        <line x1="220" y1="100" x2="220" y2="130" stroke={tripped ? "lightgreen" : "#9CA3AF"} />
        <line x1="150" y1="100" x2="200" y2="100" stroke="yellow" strokeWidth={tripped ? 3 : 2} />
      </svg>
       <div className="mt-4 flex justify-center space-x-2">
          <button onClick={handleOverload} disabled={overheating || tripped} className="px-2 py-1 bg-red-600 rounded text-xs disabled:bg-gray-500">Simulate Overload</button>
          <button onClick={() => setTripped(false)} disabled={!tripped} className="px-2 py-1 bg-gray-600 rounded text-xs disabled:bg-gray-500">Reset</button>
      </div>
    </div>
  )
};

export const ForwardReverseVisual: React.FC = () => {
  const [state, setState] = useState<'stop' | 'forward' | 'reverse'>('stop');
  const [interlock, setInterlock] = useState<'' | 'forward' | 'reverse'>('');

  const handleForward = () => {
    if (state === 'reverse') {
      setInterlock('reverse');
      setTimeout(() => setInterlock(''), 500);
    } else if (state === 'stop') {
      setState('forward');
    }
  };

  const handleReverse = () => {
    if (state === 'forward') {
      setInterlock('forward');
      setTimeout(() => setInterlock(''), 500);
    } else if (state === 'stop') {
      setState('reverse');
    }
  };

  const handleStop = () => setState('stop');
  
  const isForward = state === 'forward';
  const isReverse = state === 'reverse';

  return (
    <div className="p-4 text-center text-sm text-gray-400">
       <style>{`
          .fwd-rev-path { stroke-dasharray: 10; stroke-dashoffset: 20; }
          .fwd-rev-energized { animation: fwd-rev-flow 1s linear infinite; }
          @keyframes fwd-rev-flow { to { stroke-dashoffset: 0; } }
          .interlock-flash { animation: flash-red 0.5s; }
          @keyframes flash-red { 50% { stroke: red; } }
      `}</style>
      <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-800 rounded-lg">
        {/* Motor */}
        <circle cx="200" cy="250" r="30" fill="none" stroke="white" strokeWidth="2" />
        <text x="200" y="255" textAnchor="middle" fill="white" className={state !== 'stop' ? 'animate-spin' : ''} style={{animationDirection: isReverse ? 'reverse' : 'normal' }}>M</text>

        {/* Power Lines */}
        <line x1="50" y1="0" x2="50" y2="50" stroke="red" strokeWidth="2" />
        <line x1="200" y1="0" x2="200" y2="50" stroke="yellow" strokeWidth="2" />
        <line x1="350" y1="0" x2="350" y2="50" stroke="blue" strokeWidth="2" />
        <text x="40" y="20">L1</text> <text x="190" y="20">L2</text> <text x="340" y="20">L3</text>

        {/* Forward Contactor KM1 */}
        <rect x="25" y="50" width="50" height="50" fill={isForward ? 'green' : '#374151'} stroke="white" strokeWidth="1" />
        <text x="50" y="80" fill="white" textAnchor="middle">KM1</text>
        <line x1="50" y1="50" x2="50" y2="100" stroke={isForward ? "red" : "white"} strokeWidth={isForward ? 4: 2} />
        <line x1="200" y1="50" x2="200" y2="100" stroke={isForward ? "yellow" : "white"} strokeWidth={isForward ? 4: 2} />

        
        {/* Reverse Contactor KM2 */}
        <rect x="325" y="50" width="50" height="50" fill={isReverse ? 'green' : '#374151'} stroke="white" strokeWidth="1" />
        <text x="350" y="80" fill="white" textAnchor="middle">KM2</text>
        <line x1="350" y1="50" x2="350" y2="100" stroke={isReverse ? "blue" : "white"} strokeWidth={isReverse ? 4: 2} />

        {/* Phase Wiring */}
        {/* L1 -> KM1 -> U1 */}
        <path d="M50 100 V150 H180 V220" stroke="red" strokeWidth={isForward ? 4 : 2} fill="none" className={isForward ? 'fwd-rev-path fwd-rev-energized' : ''} />
        {/* L2 -> KM1 -> V1 */}
        <path d="M200 100 V150 H200 V220" stroke="yellow" strokeWidth={isForward ? 4 : 2} fill="none" className={isForward ? 'fwd-rev-path fwd-rev-energized' : ''} />
        {/* L3 -> KM1 -> W1 */}
        <path d="M350 50 V150 H220 V220" stroke={isForward ? "blue" : "white"} strokeWidth={isForward ? 4: 2} fill="none" className={isForward ? 'fwd-rev-path fwd-rev-energized' : ''} />
        <line x1="350" y1="50" x2="350" y2="100" stroke={isForward ? "blue" : "white"} strokeWidth={isForward ? 4: 2} />


        {/* L1 -> KM2 -> W1 (Phase Swap) */}
        <path d="M50 50 v70 h250 v-20" stroke={isReverse ? "red" : "white"} strokeWidth={isReverse ? 4 : 2} fill="none" />
        <path d="M300 100 v50 h-80 v70" stroke="red" strokeWidth={isReverse ? 4 : 2} fill="none" className={isReverse ? 'fwd-rev-path fwd-rev-energized' : ''} />

        {/* L2 -> KM2 -> V1 (Same) */}
         <path d="M200 50 V150 H200 V220" stroke="yellow" strokeWidth={isReverse ? 4 : 2} fill="none" className={isReverse ? 'fwd-rev-path fwd-rev-energized' : ''} />
        
        {/* L3 -> KM2 -> U1 (Phase Swap) */}
        <path d="M350 100 v50 h-170 v70" stroke="blue" strokeWidth={isReverse ? 4 : 2} fill="none" className={isReverse ? 'fwd-rev-path fwd-rev-energized' : ''} />


        {/* Interlock visualization */}
        <line x1="75" y1="60" x2="325" y2="60" stroke="#6B7280" strokeWidth="5" />
        <path d="M75 60 L100 50 M75 60 L100 70" stroke="#6B7280" strokeWidth="5" fill="none" style={{transform: isForward ? 'translateX(-15px)' : 'none', transition: 'transform 0.2s'}} />
        <path d="M325 60 L300 50 M325 60 L300 70" stroke="#6B7280" strokeWidth="5" fill="none" style={{transform: isReverse ? 'translateX(15px)' : 'none', transition: 'transform 0.2s'}} />
        {interlock && <text x="200" y="140" fill="red" textAnchor="middle" className="font-bold text-lg animate-pulse">INTERLOCK ACTIVE!</text>}
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={handleForward} className="px-2 py-1 bg-green-600 rounded text-xs">Forward</button>
          <button onClick={handleStop} className="px-2 py-1 bg-red-600 rounded text-xs">Stop</button>
          <button onClick={handleReverse} className="px-2 py-1 bg-blue-600 rounded text-xs">Reverse</button>
      </div>
    </div>
  )
};

export const ThreePhaseMotorVisual: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
        .motor-rotor {
          transition: transform 0.5s;
        }
        .motor-running .motor-rotor {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rmf-l1, .rmf-l2, .rmf-l3 {
            opacity: 0.2;
        }
        .motor-running .rmf-l1 {
          animation: rmf-flow 1.5s linear infinite;
        }
        .motor-running .rmf-l2 {
          animation: rmf-flow 1.5s linear infinite 0.5s;
        }
        .motor-running .rmf-l3 {
          animation: rmf-flow 1.5s linear infinite 1s;
        }
        @keyframes rmf-flow {
          0% { opacity: 0.2; }
          33% { opacity: 1; }
          66% { opacity: 0.2; }
          100% { opacity: 0.2; }
        }
      `}</style>
      <svg width="300" height="250" viewBox="0 0 300 250" className={`bg-gray-800 rounded-lg ${isRunning ? 'motor-running' : ''}`}>
        {/* Stator */}
        <circle cx="150" cy="125" r="100" fill="#374151" stroke="#4B5563" strokeWidth="4" />
        <text x="150" y="20" textAnchor="middle" fill="white">Stator</text>
        
        {/* Rotor */}
        <g className="motor-rotor" style={{ transformOrigin: '150px 125px' }}>
          <circle cx="150" cy="125" r="60" fill="#6B7280" />
          <line x1="150" y1="65" x2="150" y2="185" stroke="#9CA3AF" strokeWidth="3" />
          <line x1="90" y1="125" x2="210" y2="125" stroke="#9CA3AF" strokeWidth="3" />
        </g>
        <text x="150" y="130" textAnchor="middle" fill="white">Rotor</text>
        
        {/* Windings */}
        <circle cx="150" cy="45" r="15" fill="red" className="rmf-l1" />
        <text x="150" y="49" textAnchor="middle" fill="white" fontWeight="bold">L1</text>
        
        <circle cx="236.6" cy="155" r="15" fill="yellow" className="rmf-l2" />
        <text x="236.6" y="159" textAnchor="middle" fill="black" fontWeight="bold">L2</text>

        <circle cx="63.4" cy="155" r="15" fill="blue" className="rmf-l3" />
        <text x="63.4" y="159" textAnchor="middle" fill="white" fontWeight="bold">L3</text>

        {/* Data */}
        <text x="10" y="240" fill="gray-300" fontSize="12">Rated Voltage: 400V</text>
        <text x="290" y="240" textAnchor="end" fill="gray-300" fontSize="12">Power: 7.5kW</text>
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={() => setIsRunning(true)} disabled={isRunning} className="px-2 py-1 bg-green-600 rounded text-xs disabled:bg-gray-500">Start</button>
          <button onClick={() => setIsRunning(false)} disabled={!isRunning} className="px-2 py-1 bg-red-600 rounded text-xs disabled:bg-gray-500">Stop</button>
      </div>
    </div>
  );
};

export const TimerOnDelayVisual: React.FC = () => {
  const [isEnergized, setIsEnergized] = useState(false);
  const [time, setTime] = useState(0);
  const [contactsChanged, setContactsChanged] = useState(false);
  const PRESET_TIME = 4;

  useEffect(() => {
    let interval: number | null = null;
    if (isEnergized) {
      interval = window.setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 0.1;
          if (newTime >= PRESET_TIME) {
            setContactsChanged(true);
            if(interval) clearInterval(interval);
            return PRESET_TIME;
          }
          return newTime;
        });
      }, 100);
    } else {
      setTime(0);
      setContactsChanged(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEnergized]);

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Coil */}
        <rect x="20" y="80" width="80" height="40" fill={isEnergized ? 'orange' : '#374151'} stroke="#4B5563" strokeWidth="2" style={{ transition: 'fill 0.3s' }}/>
        <text x="60" y="105" textAnchor="middle" fill="white">KT1 (TON)</text>
        <text x="60" y="70" textAnchor="middle" fill="white">{`${time.toFixed(1)}s / ${PRESET_TIME}s`}</text>
        <rect x="20" y="125" width="80" height="5" fill="#4B5563" />
        <rect x="20" y="125" width={80 * (time/PRESET_TIME)} height="5" fill="orange" style={{ transition: 'width 0.1s linear' }} />
        
        {/* Contacts */}
        <text x="200" y="30" fill="white">Timer Contacts</text>
        {/* NO Contact */}
        <text x="180" y="70" fill="white" fontSize="12">NO</text>
        <line x1="200" y1="50" x2="200" y2="90" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <line x1="230" y1="50" x2="230" y2="90" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <path d="M200 80 C 215 90, 215 90, 230 80" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" fill="none" />
        <line x1="200" y1="50" x2="230" y2={contactsChanged ? 50 : 60} stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="3" style={{ transition: 'all 0.3s' }} />
        
        {/* NC Contact */}
        <text x="180" y="140" fill="white" fontSize="12">NC</text>
        <line x1="200" y1="120" x2="200" y2="160" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <line x1="230" y1="120" x2="230" y2="160" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <path d="M200 130 C 215 120, 215 120, 230 130" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" fill="none" />
        <line x1="200" y1="160" x2="230" y2={!contactsChanged ? 150 : 160} stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="3" style={{ transition: 'all 0.3s' }} />
         <line x1="230" y1="160" x2="200" y2="150" stroke={!contactsChanged ? "lightgreen" : "transparent"} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />

      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={() => setIsEnergized(!isEnergized)} disabled={isEnergized && !contactsChanged} className={`px-2 py-1 rounded text-xs ${isEnergized ? 'bg-red-600' : 'bg-green-600'} disabled:bg-gray-500`}>
          {isEnergized ? (contactsChanged ? 'De-energize' : 'Timing...') : 'Energize Coil'}
        </button>
      </div>
    </div>
  );
};

export const JoggingCircuitVisual: React.FC = () => {
  const [mode, setMode] = useState<'run' | 'jog'>('run');
  const [startHeld, setStartHeld] = useState(false);
  const [jogHeld, setJogHeld] = useState(false);
  const [latched, setLatched] = useState(false);

  const isCoilEnergized = (mode === 'run' && (startHeld || latched)) || (mode === 'jog' && jogHeld);

  const handleStartDown = () => { if (mode === 'run') { setStartHeld(true); setLatched(true); }};
  const handleStartUp = () => setStartHeld(false);
  const handleJogDown = () => { if (mode === 'jog') setJogHeld(true); };
  const handleJogUp = () => setJogHeld(false);
  const handleStop = () => { setStartHeld(false); setLatched(false); setJogHeld(false); };
  
  const energize = (condition: boolean) => condition ? "cyan" : "#4B5563";
  const energizedClass = (condition: boolean) => condition ? "dol-path dol-energized" : "";

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`.dol-path { stroke-dasharray: 10; stroke-dashoffset: 20; } .dol-energized { animation: dol-flow 1s linear infinite; } @keyframes dol-flow { to { stroke-dashoffset: 0; } }`}</style>
      <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-800 rounded-lg">
        {/* Power Rails */}
        <path d="M50 40 V280" stroke="cyan" strokeWidth="2" className="dol-path dol-energized" />
        <path d="M350 40 V280" stroke="cyan" strokeWidth="2" />
        <text x="40" y="30" fill="cyan">+24V</text> <text x="360" y="30" fill="cyan">0V</text>

        {/* Rung 1: Stop -> Selector */}
        <path d="M50 60 H 100" stroke="cyan" strokeWidth="2" className="dol-path dol-energized"/>
        <rect x="100" y="50" width="20" height="20" fill="red" className="cursor-pointer" onClick={handleStop} />
        <text x="110" y="80" textAnchor="middle" fill="white">Stop</text>
        <path d="M120 60 H 180" stroke={energize(isCoilEnergized)} strokeWidth="2" className={energizedClass(isCoilEnergized)}/>
        
        {/* Selector Switch */}
        <circle cx="180" cy="60" r="4" fill={energize(isCoilEnergized)} />
        <line x1="180" y1="60" x2={mode === 'run' ? 160 : 200} y2="100" stroke="white" strokeWidth="2" style={{transition: 'all 0.2s'}} />
        <text x="140" y="110" fill="white" fontSize="12">RUN</text>
        <text x="200" y="110" fill="white" fontSize="12">JOG</text>

        {/* Rung 2: Run Mode (Start + Latch) */}
        <path d="M160 100 H 160 V 140 H 100" stroke={energize(mode==='run' && (startHeld || latched))} strokeWidth="2" className={energizedClass(mode==='run' && (startHeld || latched))} />
        <rect x="100" y="130" width="20" height="20" fill="green" className="cursor-pointer" onMouseDown={handleStartDown} onMouseUp={handleStartUp} onMouseLeave={handleStartUp}/>
        <text x="110" y="160" textAnchor="middle" fill="white">Start</text>
        <path d="M120 140 H 160" stroke={energize(mode==='run' && startHeld)} strokeWidth="2" className={energizedClass(mode==='run' && startHeld)} />
        <path d="M160 100 H 160 V 180 H 100" stroke={energize(mode==='run' && latched)} strokeWidth="2" className={energizedClass(mode==='run' && latched)} />
        <text x="110" y="175" fill={isCoilEnergized ? 'lightgreen' : 'white'}>KM1</text>
        <path d="M120 180 H 160" stroke={energize(mode==='run' && latched)} strokeWidth="2" className={energizedClass(mode==='run' && latched)} />

        {/* Rung 3: Jog Mode */}
        <path d="M200 100 H 200 V 140 H 220" stroke={energize(mode==='jog' && jogHeld)} strokeWidth="2" className={energizedClass(mode==='jog' && jogHeld)} />
        <rect x="220" y="130" width="20" height="20" fill="blue" className="cursor-pointer" onMouseDown={handleJogDown} onMouseUp={handleJogUp} onMouseLeave={handleJogUp}/>
        <text x="230" y="160" textAnchor="middle" fill="white">Jog</text>
        <path d="M240 140 H 260" stroke={energize(mode==='jog' && jogHeld)} strokeWidth="2" className={energizedClass(mode==='jog' && jogHeld)} />
        
        {/* To Coil */}
        <path d="M160 140 V 230 H 260 V 140" stroke={energize(isCoilEnergized)} strokeWidth="2" className={energizedClass(isCoilEnergized)} />
        <path d="M160 180 V 230" stroke={energize(isCoilEnergized)} strokeWidth="2" className={energizedClass(isCoilEnergized)} />

        {/* Coil */}
        <rect x="260" y="220" width="40" height="20" fill="none" stroke={isCoilEnergized ? 'orange' : 'cyan'} strokeWidth="2" />
        <text x="280" y="235" textAnchor="middle" fill={isCoilEnergized ? 'orange' : 'cyan'}>KM1</text>
        <path d="M300 230 H 350" stroke={energize(isCoilEnergized)} strokeWidth="2" className={energizedClass(isCoilEnergized)} />
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={() => setMode('run')} disabled={mode==='run'} className="px-2 py-1 bg-gray-600 rounded text-xs disabled:bg-blue-600">Run Mode</button>
        <button onClick={() => setMode('jog')} disabled={mode==='jog'} className="px-2 py-1 bg-gray-600 rounded text-xs disabled:bg-blue-600">Jog Mode</button>
      </div>
    </div>
  );
};

export const DCMotorVisual: React.FC = () => {
  const [isReversed, setIsReversed] = useState(false);

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <style>{`
        .dc-motor-running { animation: spin 2s linear infinite; }
        .dc-motor-reversed { animation-direction: reverse; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <svg width="250" height="200" viewBox="0 0 250 200" className="bg-gray-800 rounded-lg">
        {/* Power Supply */}
        <text x="50" y="40" fill="white">{isReversed ? '-' : '+'} 24V</text>
        <line x1="50" y1="50" x2="50" y2="100" stroke={isReversed ? 'blue' : 'red'} strokeWidth="3" />
        <line x1="50" y1="100" x2="100" y2="100" stroke={isReversed ? 'blue' : 'red'} strokeWidth="3" />

        <text x="50" y="180" fill="white">{isReversed ? '+' : '-'} 0V</text>
        <line x1="50" y1="170" x2="50" y2="120" stroke={isReversed ? 'red' : 'blue'} strokeWidth="3" />
        <line x1="50" y1="120" x2="100" y2="120" stroke={isReversed ? 'red' : 'blue'} strokeWidth="3" />
        
        {/* Motor */}
        <circle cx="150" cy="110" r="40" fill="none" stroke="white" strokeWidth="2" />
        <text x="150" y="118" textAnchor="middle" fill="white" fontSize="24" className={`dc-motor-running ${isReversed ? 'dc-motor-reversed' : ''}`} style={{ transformOrigin: '150px 110px' }}>M</text>
        <text x="90" y="100" fill="white" fontSize="12">+</text>
        <text x="90" y="125" fill="white" fontSize="12">-</text>

      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={() => setIsReversed(!isReversed)} className="px-3 py-1 bg-blue-600 rounded text-xs">Reverse Polarity</button>
      </div>
    </div>
  );
};

export const ServoMotorVisual: React.FC = () => {
  const [angle, setAngle] = useState(0);

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="250" height="200" viewBox="0 0 250 200" className="bg-gray-800 rounded-lg">
        {/* Servo Body */}
        <rect x="100" y="80" width="100" height="60" rx="5" fill="#374151" stroke="#4B5563" />
        <circle cx="120" cy="110" r="20" fill="#6B7280" />
        <text x="155" y="115" fill="white">Servo</text>
        
        {/* Horn/Arm */}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '120px 110px', transition: 'transform 0.5s ease-in-out' }}>
          <rect x="120" y="105" width="80" height="10" rx="3" fill="#9CA3AF" />
        </g>
        
        {/* Angle Indicator */}
        <text x="120" y="40" textAnchor="middle" fill="cyan">{angle}°</text>
        <path d="M80 110 A 40 40 0 0 1 160 110" stroke="gray" strokeWidth="1" fill="none" strokeDasharray="2 2" />

      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={() => setAngle(0)} className="px-3 py-1 bg-gray-600 rounded text-xs">0°</button>
          <button onClick={() => setAngle(45)} className="px-3 py-1 bg-gray-600 rounded text-xs">45°</button>
          <button onClick={() => setAngle(90)} className="px-3 py-1 bg-gray-600 rounded text-xs">90°</button>
          <button onClick={() => setAngle(180)} className="px-3 py-1 bg-gray-600 rounded text-xs">180°</button>
      </div>
    </div>
  );
};

export const StepperMotorVisual: React.FC = () => {
  const [step, setStep] = useState(0);
  const STEP_ANGLE = 45; // 8 steps per revolution

  const handleStep = (direction: number) => {
    setStep(prev => prev + direction);
  };
  
  const angle = step * STEP_ANGLE;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="250" height="200" viewBox="0 0 250 200" className="bg-gray-800 rounded-lg">
        {/* Stator with poles */}
        <circle cx="125" cy="100" r="80" fill="none" stroke="#4B5563" strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <line 
            key={a}
            x1="125" y1="100"
            x2={125 + 80 * Math.cos(a * Math.PI / 180)}
            y2={100 + 80 * Math.sin(a * Math.PI / 180)}
            stroke="#4B5563" strokeWidth="10"
          />
        ))}

        {/* Rotor */}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '125px 100px', transition: 'transform 0.15s linear' }}>
          <rect x="95" y="95" width="60" height="10" fill="#9CA3AF" />
          <rect x="120" y="70" width="10" height="60" fill="#9CA3AF" />
        </g>
        
        {/* Step Info */}
        <text x="125" y="30" textAnchor="middle" fill="cyan">Step: {step}, Angle: {angle}°</text>

      </svg>
      <div className="mt-4 flex justify-center space-x-2">
          <button onClick={() => handleStep(-1)} className="px-3 py-1 bg-blue-600 rounded text-xs">Step CCW</button>
          <button onClick={() => handleStep(1)} className="px-3 py-1 bg-green-600 rounded text-xs">Step CW</button>
      </div>
    </div>
  );
};

export const TimerOffDelayVisual: React.FC = () => {
  const [isEnergized, setIsEnergized] = useState(false);
  const [time, setTime] = useState(0);
  const [contactsChanged, setContactsChanged] = useState(false);
  const PRESET_TIME = 4;
  // FIX: Unreported error. useRef() requires an initial value.
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    setTime(PRESET_TIME);
    timerRef.current = window.setInterval(() => {
      setTime(prevTime => {
        const newTime = prevTime - 0.1;
        if (newTime <= 0) {
          setContactsChanged(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return newTime;
      });
    }, 100);
  };

  const handleToggle = () => {
    if(timerRef.current) clearInterval(timerRef.current);

    if(!isEnergized) {
      setIsEnergized(true);
      setContactsChanged(true);
      setTime(0);
    } else {
      setIsEnergized(false);
      startTimer();
    }
  }

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Coil */}
        <rect x="20" y="80" width="80" height="40" fill={isEnergized ? 'orange' : '#374151'} stroke="#4B5563" strokeWidth="2" style={{ transition: 'fill 0.3s' }}/>
        <text x="60" y="105" textAnchor="middle" fill="white">KT2 (TOF)</text>
        <text x="60" y="70" textAnchor="middle" fill="white">{`${time.toFixed(1)}s / ${PRESET_TIME}s`}</text>
        <rect x="20" y="125" width="80" height="5" fill="#4B5563" />
        <rect x="20" y="125" width={80 * (time/PRESET_TIME)} height="5" fill="orange" style={{ transition: 'width 0.1s linear' }} />
        
        {/* Contacts */}
        <text x="200" y="30" fill="white">Timer Contacts</text>
        {/* NO Contact */}
        <text x="180" y="70" fill="white" fontSize="12">NO</text>
        <line x1="200" y1="50" x2="200" y2="90" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <line x1="230" y1="50" x2="230" y2="90" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <path d="M200 80 C 215 90, 215 90, 230 80" stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" fill="none" />
        <line x1="200" y1="50" x2="230" y2={contactsChanged ? 50 : 60} stroke={contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="3" style={{ transition: 'all 0.3s' }} />
        
        {/* NC Contact */}
        <text x="180" y="140" fill="white" fontSize="12">NC</text>
        <line x1="200" y1="120" x2="200" y2="160" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <line x1="230" y1="120" x2="230" y2="160" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" />
        <path d="M200 130 C 215 120, 215 120, 230 130" stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="2" fill="none" />
        <line x1="200" y1="160" x2="230" y2={!contactsChanged ? 150 : 160} stroke={!contactsChanged ? "lightgreen" : "#9CA3AF"} strokeWidth="3" style={{ transition: 'all 0.3s' }} />
         <line x1="230" y1="160" x2="200" y2="150" stroke={!contactsChanged ? "lightgreen" : "transparent"} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={handleToggle} disabled={!isEnergized && time > 0} className={`px-2 py-1 rounded text-xs ${isEnergized ? 'bg-red-600' : 'bg-green-600'} disabled:bg-gray-500`}>
          {isEnergized ? 'De-energize' : 'Energize Coil'}
        </button>
      </div>
    </div>
  );
};

export const RotatingMagneticFieldVisual: React.FC = () => {
  const [time, setTime] = useState(0);
  // FIX: useRef() requires an initial value. Changed to useRef<number | undefined>().
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (timestamp: number) => {
      setTime(t => t + 0.02);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if(animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const getOpacity = (phaseShift: number) => (Math.sin(time + phaseShift) + 1) / 2;

  const fieldAngle = (time * 180 / Math.PI) % 360;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-800 rounded-lg">
        {/* Stator and windings */}
        <circle cx="200" cy="150" r="120" fill="none" stroke="#4B5563" strokeWidth="20" />
        
        {/* Phase A */}
        <circle cx="200" cy="50" r="20" fill="red" opacity={getOpacity(0)} />
        <circle cx="200" cy="250" r="20" fill="red" opacity={getOpacity(Math.PI)} />
        <text x="200" y="55" textAnchor="middle" fill="white">A</text>
        <text x="200" y="255" textAnchor="middle" fill="white">A'</text>

        {/* Phase B */}
        <circle cx="304" cy="225" r="20" fill="blue" opacity={getOpacity(2 * Math.PI / 3)} />
        <circle cx="96" cy="75" r="20" fill="blue" opacity={getOpacity(5 * Math.PI / 3)} />
        <text x="304" y="230" textAnchor="middle" fill="white">B</text>
        <text x="96" y="80" textAnchor="middle" fill="white">B'</text>

        {/* Phase C */}
        <circle cx="96" cy="225" r="20" fill="yellow" opacity={getOpacity(4 * Math.PI / 3)} />
        <circle cx="304" cy="75" r="20" fill="yellow" opacity={getOpacity(Math.PI / 3)} />
        <text x="96" y="230" textAnchor="middle" fill="black">C</text>
        <text x="304" y="80" textAnchor="middle" fill="black">C'</text>

        {/* Rotor (compass needle) */}
        <g style={{ transform: `rotate(${fieldAngle}deg)`, transformOrigin: '200px 150px' }}>
          <path d="M200 150 L200 80" stroke="red" strokeWidth="4" />
          <path d="M200 150 L200 220" stroke="white" strokeWidth="4" />
          <path d="M190 80 L200 60 L210 80 Z" fill="red" />
        </g>
      </svg>
    </div>
  );
};

export const OhmsLawVisual: React.FC = () => {
    const [voltage, setVoltage] = useState(12);
    const [resistance, setResistance] = useState(100);
    const current = voltage / resistance;

    return (
        <div className="p-4 text-sm text-gray-400">
            <style>{`
                .electron { animation: flow var(--duration) linear infinite; offset-path: path("M30 100 H 370"); }
                @keyframes flow { from { offset-distance: 0%; } to { offset-distance: 100%; } }
            `}</style>
            <svg width="400" height="200" viewBox="0 0 400 200" className="bg-gray-800 rounded-lg">
                <path d="M30 100 H 370" fill="none" stroke="#4B5563" strokeWidth="4" />
                {/* Battery */}
                <rect x="30" y="80" width="50" height="40" fill="#374151" stroke="#6B7280" />
                <line x1="80" y1="70" x2="80" y2="130" stroke="#6B7280" strokeWidth="3" />
                <line x1="90" y1="85" x2="90" y2="115" stroke="#6B7280" strokeWidth="2" />
                <text x="55" y="105" fill="white" textAnchor="middle">{voltage.toFixed(1)}V</text>
                
                {/* Resistor */}
                <path d="M200 90 L200 110 L260 110 L260 90 Z" fill="none" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M200 100 H 210 L 220 90 L 230 110 L 240 90 L 250 110 L 260 100 H 270" stroke="#9CA3AF" strokeWidth="3" fill="none"/>
                <text x="235" y="80" fill="white" textAnchor="middle">{resistance.toFixed(0)}Ω</text>
                
                {/* Electrons */}
                <g style={{ "--duration": `${2 / current}s` } as React.CSSProperties}>
                    {[...Array(Math.min(20, Math.floor(current * 10)))].map((_, i) => (
                        <circle key={i} r="3" fill="cyan" className="electron" style={{animationDelay: `${i * -0.1 / current}s`}} />
                    ))}
                </g>
            </svg>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <label>Voltage: {voltage.toFixed(1)} V</label>
                    <input type="range" min="1" max="48" value={voltage} onChange={e => setVoltage(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                    <label>Resistance: {resistance.toFixed(0)} Ω</label>
                    <input type="range" min="10" max="1000" value={resistance} onChange={e => setResistance(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="col-span-2 text-center text-lg">
                    <p>Current (I = V/R): <span className="font-bold text-cyan-400">{current.toFixed(3)} A</span></p>
                </div>
            </div>
        </div>
    );
};

export const SeriesParallelVisual: React.FC = () => {
    const [seriesOn, setSeriesOn] = useState(false);
    const [parallelOn, setParallelOn] = useState(false);
    const [seriesBulb2Removed, setSeriesBulb2Removed] = useState(false);
    const [parallelBulb2Removed, setParallelBulb2Removed] = useState(false);

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Series Circuit */}
            <div className="p-4 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-center mb-2">Series Circuit</h4>
                <svg viewBox="0 0 200 200">
                    <path d="M20 100 H 50 V 50 H 150 V 100 H 180" fill="none" stroke="#4B5563" strokeWidth="3" />
                    {/* Switch */}
                    <line x1="50" y1="50" x2="80" y2={seriesOn ? 50 : 70} stroke="white" strokeWidth="3" style={{transition: 'all 0.2s'}} onClick={() => setSeriesOn(!seriesOn)} className="cursor-pointer" />
                    {/* Bulb 1 */}
                    <circle cx="100" cy="100" r="15" fill={seriesOn && !seriesBulb2Removed ? 'yellow' : '#374151'} stroke={seriesOn && !seriesBulb2Removed ? 'orange' : '#6B7280'} />
                    {/* Bulb 2 */}
                    {!seriesBulb2Removed && <circle cx="150" cy="100" r="15" fill={seriesOn ? 'yellow' : '#374151'} stroke={seriesOn ? 'orange' : '#6B7280'} />}
                    <text x="150" y="140" textAnchor="middle" fill={seriesBulb2Removed ? 'red' : '#9CA3AF'} className="cursor-pointer" onClick={() => setSeriesBulb2Removed(!seriesBulb2Removed)}>{seriesBulb2Removed ? 'Add Bulb' : 'Remove Bulb'}</text>
                </svg>
            </div>
            {/* Parallel Circuit */}
            <div className="p-4 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-center mb-2">Parallel Circuit</h4>
                <svg viewBox="0 0 200 200">
                    <path d="M20 100 H 50 V 50 H 150 V 100 H 180 M80 100 V 150 H 120 V 100 M 130 100 V 150 H 170 V 100" fill="none" stroke="#4B5563" strokeWidth="3" />
                    {/* Switch */}
                    <line x1="50" y1="50" x2="80" y2={parallelOn ? 50 : 70} stroke="white" strokeWidth="3" style={{transition: 'all 0.2s'}} onClick={() => setParallelOn(!parallelOn)} className="cursor-pointer" />
                    {/* Bulb 1 */}
                    <circle cx="100" cy="150" r="15" fill={parallelOn ? 'yellow' : '#374151'} stroke={parallelOn ? 'orange' : '#6B7280'} />
                    {/* Bulb 2 */}
                    {!parallelBulb2Removed && <circle cx="150" cy="150" r="15" fill={parallelOn ? 'yellow' : '#374151'} stroke={parallelOn ? 'orange' : '#6B7280'} />}
                    <text x="150" y="180" textAnchor="middle" fill={parallelBulb2Removed ? 'red' : '#9CA3AF'} className="cursor-pointer" onClick={() => setParallelBulb2Removed(!parallelBulb2Removed)}>{parallelBulb2Removed ? 'Add Bulb' : 'Remove Bulb'}</text>
                </svg>
            </div>
        </div>
    );
};

export const CapacitorVisual: React.FC = () => {
  const [state, setState] = useState<'idle' | 'charging' | 'discharging'>('idle');
  const [charge, setCharge] = useState(0);
  const chargeInterval = useRef<number | null>(null);

  useEffect(() => {
    if (chargeInterval.current) clearInterval(chargeInterval.current);
    if (state === 'charging') {
      chargeInterval.current = window.setInterval(() => {
        setCharge(c => {
          if (c >= 1) {
            if (chargeInterval.current) clearInterval(chargeInterval.current);
            return 1;
          }
          return c + 0.05;
        });
      }, 50);
    } else if (state === 'discharging') {
      chargeInterval.current = window.setInterval(() => {
        setCharge(c => {
          if (c <= 0) {
            if (chargeInterval.current) clearInterval(chargeInterval.current);
            return 0;
          }
          return c - 0.05;
        });
      }, 50);
    }
    return () => {
      if (chargeInterval.current) clearInterval(chargeInterval.current);
    };
  }, [state]);

  const handleCharge = () => setState('charging');
  const handleDischarge = () => setState('discharging');
  const handleIdle = () => setState('idle');

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Battery */}
        <rect x="20" y="80" width="40" height="40" fill="#374151" stroke="#4B5563" />
        <line x1="60" y1="70" x2="60" y2="130" stroke="#4B5563" strokeWidth="3" />
        <line x1="70" y1="85" x2="70" y2="115" stroke="#4B5563" strokeWidth="2" />
        <text x="40" y="105" fill="white" textAnchor="middle">DC</text>
        
        {/* Switch */}
        <circle cx="100" cy="50" r="4" fill="white" />
        <circle cx="100" cy="150" r="4" fill="white" />
        <line x1="100" y1="100" x2="150" y2={state === 'charging' ? 50 : state === 'discharging' ? 150 : 100} stroke="white" strokeWidth="2" style={{ transition: 'all 0.2s' }} />

        {/* Capacitor */}
        <line x1="200" y1="40" x2="200" y2="60" stroke="white" strokeWidth="2" />
        <line x1="180" y1="60" x2="220" y2="60" stroke="white" strokeWidth="3" />
        <line x1="180" y1="65" x2="220" y2="65" stroke="white" strokeWidth="3" />
        <text x="230" y="65" fill="white">C</text>
        
        {/* LED */}
        <path d="M190 140 h20 l-10 15 Z" fill={state === 'discharging' && charge > 0.1 ? 'red' : '#374151'} />
        <line x1="200" y1="155" x2="200" y2="170" stroke="white" strokeWidth="2" />

        {/* Wires */}
        <path d="M70 100 H 100" stroke="white" strokeWidth="2"/>
        <path d="M150 50 H 200" stroke={state === 'charging' ? 'orange' : 'white'} strokeWidth="2" />
        <path d="M200 62.5 V 100 H 150" fill="none" stroke="white" strokeWidth="2" />
        <path d="M150 150 H 200 V 170" stroke={state === 'discharging' ? 'orange' : 'white'} strokeWidth="2" />

        {/* Charge indicator */}
        <rect x="180" y="70" width="40" height="5" fill="#2d3748" />
        <rect x="180" y="70" width={40 * charge} height="5" fill="cyan" style={{ transition: 'width 0.1s linear' }}/>
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={handleCharge} disabled={state==='charging'} className="px-3 py-1 bg-green-600 rounded text-xs disabled:bg-gray-500">Charge</button>
        <button onClick={handleDischarge} disabled={state==='discharging'} className="px-3 py-1 bg-blue-600 rounded text-xs disabled:bg-gray-500">Discharge</button>
        <button onClick={handleIdle} disabled={state==='idle'} className="px-3 py-1 bg-gray-600 rounded text-xs disabled:bg-gray-500">Disconnect</button>
      </div>
    </div>
  );
};

export const InductorVisual: React.FC = () => {
  const [isEnergized, setIsEnergized] = useState(false);
  const [fieldStrength, setFieldStrength] = useState(0);
  const [spark, setSpark] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isEnergized) {
      setSpark(false);
      intervalRef.current = window.setInterval(() => {
        setFieldStrength(s => {
          if (s >= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 1;
          }
          return s + 0.1;
        });
      }, 50);
    } else {
      if (fieldStrength > 0.5) {
        setSpark(true);
        setTimeout(() => setSpark(false), 300);
      }
      intervalRef.current = window.setInterval(() => {
        setFieldStrength(s => {
          if (s <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return s - 0.1;
        });
      }, 30);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEnergized, fieldStrength]);

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Circuit */}
        <path d="M20 100 H 80" stroke="white" strokeWidth="2" />
        <line x1="80" y1="100" x2="100" y2={isEnergized ? 100 : 80} stroke="white" strokeWidth="2" style={{ transition: 'all 0.2s' }} />
        <path d="M100 100 H 150" stroke={isEnergized ? 'orange' : 'white'} strokeWidth="2" />

        {/* Inductor Coil */}
        <path d="M150 100 a 10 10 0 1 0 0 -0.01 M158 100 a 10 10 0 1 0 0 -0.01 M166 100 a 10 10 0 1 0 0 -0.01 M174 100 a 10 10 0 1 0 0 -0.01" stroke={isEnergized ? 'orange' : 'white'} strokeWidth="2" fill="none" />
        <path d="M182 100 H 280 V 20 H 20 V 100" stroke="white" strokeWidth="2" fill="none" />
        
        {/* Magnetic Field */}
        {[1, 2, 3, 4, 5].map(i => (
          <circle key={i} cx="166" cy="100" r={i * 8} stroke="cyan" strokeWidth="1" fill="none" opacity={fieldStrength * (1 - i/6)} />
        ))}
        
        {/* Spark */}
        {spark && <path d="M100 90 L105 85 L100 80 L110 95 L95 75" stroke="yellow" strokeWidth="2" />}
      </svg>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={() => setIsEnergized(!isEnergized)} className={`px-3 py-1 rounded text-xs ${isEnergized ? 'bg-red-600' : 'bg-green-600'}`}>
          {isEnergized ? 'Open Switch' : 'Close Switch'}
        </button>
      </div>
    </div>
  );
};

export const ACDCFlowVisual: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <style>{`
                .electron-dc { animation: flow-dc 4s linear infinite; offset-path: path("M20 50 H 180"); }
                @keyframes flow-dc { from { offset-distance: 0%; } to { offset-distance: 100%; } }
                .electron-ac { animation: flow-ac 4s ease-in-out infinite; offset-path: path("M20 50 H 180"); }
                @keyframes flow-ac { 0% { offset-distance: 0%; } 50% { offset-distance: 100%; } 100% { offset-distance: 0%; } }
            `}</style>
            <div className="p-2 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-center mb-2">Direct Current (DC)</h4>
                <svg viewBox="0 0 200 100">
                    <path d="M20 50 H 180" stroke="#4B5563" strokeWidth="3" />
                    {[...Array(8)].map((_, i) => (
                        <circle key={i} r="4" fill="cyan" className="electron-dc" style={{ animationDelay: `${i * -0.5}s` }} />
                    ))}
                </svg>
            </div>
            <div className="p-2 bg-gray-900 rounded-lg">
                <h4 className="font-bold text-center mb-2">Alternating Current (AC)</h4>
                <svg viewBox="0 0 200 100">
                    <path d="M20 50 H 180" stroke="#4B5563" strokeWidth="3" />
                    {[...Array(8)].map((_, i) => (
                        <circle key={i} r="4" fill="cyan" className="electron-ac" style={{ animationDelay: `${i * -0.5}s` }} />
                    ))}
                </svg>
            </div>
        </div>
    );
};

export const ThreePhaseWaveformVisual: React.FC = () => {
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      setTime(t => (t + 0.02) % (2 * Math.PI));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const getPath = (phaseShift: number) => 
    Array.from({ length: 280 }, (_, i) => 
      `${i === 0 ? 'M' : 'L'} ${10 + i} ${100 - Math.sin(i / 40 + time + phaseShift) * 60}`
    ).join(' ');

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        <path d="M10 100 H 290" stroke="#4B5563" strokeWidth="1" />
        <path d={getPath(0)} stroke="red" fill="none" strokeWidth="2" />
        <path d={getPath(2 * Math.PI / 3)} stroke="yellow" fill="none" strokeWidth="2" />
        <path d={getPath(4 * Math.PI / 3)} stroke="blue" fill="none" strokeWidth="2" />
      </svg>
    </div>
  );
};

export const TransformerOperationVisual: React.FC = () => {
    return (
        <div className="p-4 text-center text-sm text-gray-400">
            <style>{`
                .transformer-group:hover .flux-line { opacity: 1; animation: flux-flow 1.5s linear infinite; }
                @keyframes flux-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
            `}</style>
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg transformer-group cursor-pointer">
                {/* Core */}
                <rect x="50" y="50" width="200" height="100" rx="5" fill="none" stroke="#6B7280" strokeWidth="15" />

                {/* Flux Lines */}
                <path className="flux-line" d="M58 58 H 242 V 142 H 58 Z" fill="none" stroke="cyan" strokeWidth="1.5" strokeDasharray="5 5" style={{ opacity: 0, transition: 'opacity 0.3s' }}/>
                <path className="flux-line" d="M65 65 H 235 V 135 H 65 Z" fill="none" stroke="cyan" strokeWidth="1.5" strokeDasharray="5 5" style={{ opacity: 0, transition: 'opacity 0.3s', animationDelay: '0.2s' }}/>

                {/* Primary Winding */}
                <path d="M20 40 V 160 M 30 45 V 155 M 40 50 V 150" fill="none" stroke="red" strokeWidth="3"/>
                <text x="25" y="30" fill="white">Primary</text>
                
                {/* Secondary Winding */}
                <path d="M260 60 V 140 M 270 65 V 135 M 280 70 V 130 M 290 75 V 125" fill="none" stroke="blue" strokeWidth="3"/>
                <text x="270" y="30" fill="white">Secondary</text>
            </svg>
            <p className="mt-2">Hover over the transformer.</p>
        </div>
    );
};

export const SolenoidVisual: React.FC = () => {
  const [energized, setEnergized] = useState(false);
  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="300" height="150" viewBox="0 0 300 150" className="bg-gray-800 rounded-lg cursor-pointer" onClick={() => setEnergized(!energized)}>
        {/* Valve Body */}
        <rect x="150" y="50" width="100" height="50" fill="#6B7280" />
        <path d="M150 75 H 120 M 250 75 H 280" stroke="#4B5563" strokeWidth="10" />
        {/* Plunger */}
        <rect x={energized ? 140 : 160} y="65" width="20" height="20" fill="#9CA3AF" style={{transition: 'x 0.2s'}} />
        
        {/* Solenoid Coil */}
        <rect x="50" y="50" width="80" height="50" fill={energized ? 'orange' : '#374151'} stroke="#4B5563" style={{transition: 'fill 0.2s'}} />
        <text x="90" y="80" fill="white" textAnchor="middle">Coil</text>
        
        {/* Spring */}
        <path d="M130 65 L 135 70 L 130 75 L 135 80" stroke={energized ? "#9CA3AF" : "#E5E7EB"} strokeWidth="1.5" fill="none" />
      </svg>
      <p className="mt-2">{energized ? 'Click to de-energize' : 'Click to energize coil'}</p>
    </div>
  );
};

export const LimitSwitchVisual: React.FC = () => {
  const [actuated, setActuated] = useState(false);
  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="250" height="200" viewBox="0 0 250 200" className="bg-gray-800 rounded-lg">
        {/* Switch Body */}
        <rect x="100" y="50" width="100" height="100" fill="#374151" stroke="#4B5563" />
        
        {/* Actuator */}
        <g className="cursor-pointer" onClick={() => setActuated(!actuated)}>
          <rect x="70" y="40" width="30" height="10" fill="#6B7280" />
          <line x1="50" y1="45" x2="70" y2="45" stroke="#9CA3AF" strokeWidth="4" style={{ transform: actuated ? 'rotate(-20deg)' : 'none', transformOrigin: '70px 45px', transition: 'transform 0.2s' }} />
        </g>
        
        {/* Contacts */}
        <text x="210" y="80" fill={!actuated ? 'lightgreen' : 'white'}>NC</text>
        <line x1="150" y1="60" x2="150" y2="90" stroke={!actuated ? 'lightgreen' : 'white'} />
        <line x1="180" y1="60" x2="180" y2="90" stroke={!actuated ? 'lightgreen' : 'white'} />
        <line x1="150" y1="90" x2="130" y2="90" stroke={!actuated ? 'lightgreen' : 'white'} />
        <line x1="180" y1="90" x2="160" y2={actuated ? 90 : 70} stroke={!actuated ? 'lightgreen' : 'white'} style={{transition: 'all 0.2s'}} />

        <text x="210" y="130" fill={actuated ? 'lightgreen' : 'white'}>NO</text>
        <line x1="150" y1="110" x2="150" y2="140" stroke={actuated ? 'lightgreen' : 'white'} />
        <line x1="180" y1="110" x2="180" y2="140" stroke={actuated ? 'lightgreen' : 'white'} />
        <line x1="150" y1="140" x2="130" y2="140" stroke={actuated ? 'lightgreen' : 'white'} />
        <line x1="180" y1="140" x2="160" y2={actuated ? 120 : 140} stroke={actuated ? 'lightgreen' : 'white'} style={{transition: 'all 0.2s'}} />
      </svg>
      <p className="mt-2">Click the lever to actuate the switch.</p>
    </div>
  );
};

export const ProximitySensorVisual: React.FC = () => {
    const [targetPos, setTargetPos] = useState({ x: 250, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const isDetected = targetPos.x < 150;

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setTargetPos({ x, y: 100 });
        }
    };

    return (
        <div className="p-4 text-center text-sm text-gray-400">
            <svg ref={svgRef} width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                {/* Sensor */}
                <rect x="20" y="80" width="80" height="40" rx="5" fill="#374151" stroke="#4B5563" />
                <circle cx="100" cy="100" r="10" fill={isDetected ? 'red' : 'gray'} />
                <text x="60" y="105" textAnchor="middle" fill="white">Sensor</text>

                {/* Field */}
                <path d="M110 100 C 150 120, 150 80, 110 100" stroke="cyan" strokeOpacity="0.5" strokeWidth="2" fill="none" />
                <path d="M110 100 C 170 140, 170 60, 110 100" stroke="cyan" strokeOpacity="0.3" strokeWidth="2" fill="none" />
                
                {/* Target */}
                <rect 
                    x={targetPos.x} y={targetPos.y - 25} 
                    width="20" height="50" rx="3" 
                    fill="#9CA3AF" stroke="#E5E7EB" 
                    className="cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                />
            </svg>
            <p className="mt-2">Drag the metal block to trigger the sensor.</p>
        </div>
    );
};

export const BridgeRectifierVisual: React.FC = () => {
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      setTime(t => (t + 0.05) % (2 * Math.PI));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const sinValue = Math.sin(time);
  const isPositiveCycle = sinValue >= 0;

  const energize = (condition: boolean) => (condition ? 'orange' : '#4B5563');

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="400" height="250" viewBox="0 0 400 250" className="bg-gray-800 rounded-lg">
        {/* AC Input */}
        <text x="50" y="20" textAnchor="middle" fill="white">AC Input</text>
        <path d="M10 50 H 90" stroke="#4B5563" strokeWidth="2" />
        <path d={Array.from({length: 80}, (_, i) => `${i === 0 ? 'M' : 'L'} ${10+i} ${50 - Math.sin(i/80 * 4 * Math.PI) * 20}`).join(' ')} stroke="cyan" fill="none" />
        <circle cx={10 + (time / (2*Math.PI)) * 80} cy={50 - sinValue * 20} r="3" fill="cyan" />

        {/* Bridge */}
        <path d="M50 100 L 150 150 L 250 100 L 150 50 Z" stroke="white" strokeWidth="2" fill="none" />
        {/* Diodes */}
        <path d="M150 50 L 140 60 H 160 Z" fill={energize(isPositiveCycle)} /><text x="170" y="65">D1</text>
        <path d="M250 100 L 240 90 V 110 Z" fill={energize(!isPositiveCycle)} /><text x="260" y="105">D2</text>
        <path d="M150 150 L 160 140 H 140 Z" fill={energize(!isPositiveCycle)} /><text x="170" y="145">D3</text>
        <path d="M50 100 L 60 90 V 110 Z" fill={energize(isPositiveCycle)} /><text x="30" y="105">D4</text>
        
        {/* Load */}
        <rect x="300" y="90" width="50" height="20" fill="none" stroke="white" strokeWidth="2" />
        <text x="325" y="105" textAnchor="middle" fill="white">Load</text>

        {/* Connections */}
        <line x1="50" y1="100" x2="0" y2="100" stroke={energize(isPositiveCycle)} />
        <line x1="250" y1="100" x2="300" y2="100" stroke="orange" />
        <line x1="350" y1="100" x2="400" y2="100" stroke="orange" />
        <path d="M0 100 C 0 150, 150 150, 150 150" stroke={energize(!isPositiveCycle)} fill="none"/>
        <path d="M400 100 C 400 50, 150 50, 150 50" stroke="#4B5563" fill="none" />

        {/* DC Output */}
        <text x="325" y="180" textAnchor="middle" fill="white">DC Output</text>
        <path d="M280 210 H 370" stroke="#4B5563" strokeWidth="2" />
        <path d={Array.from({length: 90}, (_, i) => `${i === 0 ? 'M' : 'L'} ${280+i} ${210 - Math.abs(Math.sin(i/90 * 8 * Math.PI)) * 20}`).join(' ')} stroke="orange" fill="none" />
        <circle cx={280 + (time / (2*Math.PI)) * 90} cy={210 - Math.abs(sinValue) * 20} r="3" fill="orange" />
      </svg>
    </div>
  );
};

export const VFDVisual: React.FC = () => {
  const [speed, setSpeed] = useState(50); // 0-100
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      setTime(t => t + (speed / 100) * 0.1);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed]);

  const motorSpeed = speed > 5 ? speed / 50 : 0;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
      <svg width="500" height="250" viewBox="0 0 500 250" className="bg-gray-800 rounded-lg">
        {/* AC Input */}
        <text x="40" y="40" fill="white">AC In</text>
        <path d="M0 100 H 80" stroke="cyan" strokeWidth="2" />
        
        {/* Rectifier */}
        <rect x="80" y="80" width="80" height="40" fill="#374151" stroke="#4B5563" />
        <text x="120" y="105" textAnchor="middle" fill="white">Rectifier</text>

        {/* DC Bus */}
        <line x1="160" y1="100" x2="240" y2="100" stroke="orange" strokeWidth="3" />
        <text x="200" y="80" textAnchor="middle" fill="white">DC Bus</text>

        {/* Inverter */}
        <rect x="240" y="80" width="80" height="40" fill="#374151" stroke="#4B5563" />
        <text x="280" y="105" textAnchor="middle" fill="white">Inverter</text>

        {/* PWM Output */}
        <path d="M320 100 H 400" stroke="lime" strokeWidth="2" />
        <text x="360" y="80" fill="white">PWM Out</text>
        
        {/* Motor */}
        <circle cx="450" cy="100" r="30" fill="none" stroke="white" strokeWidth="2" />
        <g style={{ transform: `rotate(${(time * 180 / Math.PI)}deg)`, transformOrigin: '450px 100px' }}>
            <line x1="450" y1="70" x2="450" y2="130" stroke="white" />
            <line x1="420" y1="100" x2="480" y2="100" stroke="white" />
        </g>

        {/* Frequency/Speed display */}
        <text x="250" y="200" textAnchor="middle" fill="white" fontSize="20">Frequency: {(speed * 0.5).toFixed(1)} Hz</text>
      </svg>
      <div className="mt-4">
          <label>Speed Control: {speed.toFixed(0)}%</label>
          <input type="range" min="0" max="100" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};

export const SoftStarterVisual: React.FC = () => {
  const [state, setState] = useState<'idle' | 'ramping' | 'running'>('idle');
  const [ramp, setRamp] = useState(0); // 0 to 1
  const rampInterval = useRef<number | null>(null);

  const handleStart = () => {
    if (state === 'idle') {
      setState('ramping');
    }
  };

  const handleStop = () => {
    setState('idle');
    setRamp(0);
  };
  
  useEffect(() => {
    if (state === 'ramping') {
      rampInterval.current = window.setInterval(() => {
        setRamp(r => {
          const newRamp = r + 0.05;
          if (newRamp >= 1) {
            if (rampInterval.current) clearInterval(rampInterval.current);
            setState('running');
            return 1;
          }
          return newRamp;
        });
      }, 100);
    }
    return () => {
      if (rampInterval.current) clearInterval(rampInterval.current);
    }
  }, [state]);

  const getPath = (amplitude: number, freq: number) => 
    Array.from({ length: 100 }, (_, i) => 
      `${i === 0 ? 'M' : 'L'} ${280 + i} ${100 - Math.sin(i / freq) * amplitude}`
    ).join(' ');

  const motorSpeed = state === 'idle' ? 0 : ramp * 2;

  return (
    <div className="p-4 text-center text-sm text-gray-400">
       <style>{`.motor-spinning { animation: spin var(--speed, 10s) linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <svg width="500" height="200" viewBox="0 0 500 200" className="bg-gray-800 rounded-lg">
        {/* AC In */}
        <text x="40" y="40" fill="white">AC In (Full Voltage)</text>
        <path d={getPath(40, 10)} stroke="cyan" fill="none" />

        {/* Soft Starter */}
        <rect x="150" y="70" width="120" height="60" fill="#374151" stroke="#4B5563"/>
        <text x="210" y="105" textAnchor="middle" fill="white">Soft Starter</text>
        <path d="M180 85 l 20 10 l -20 10 z m 40 0 l 20 10 l -20 10 z" fill="#9CA3AF" opacity={ramp > 0 ? ramp : 0.2}/>
        
        {/* AC Out */}
        <text x="330" y="40" fill="white">AC Out (Ramped)</text>
        <path d={getPath(40 * ramp, 10)} stroke="lime" fill="none" />

        {/* Motor */}
        <circle cx="450" cy="100" r="30" fill="none" stroke="white" strokeWidth="2" />
        <g style={{ transformOrigin: '450px 100px' }} className={motorSpeed > 0.1 ? 'motor-spinning' : ''}>
            <line x1="450" y1="70" x2="450" y2="130" stroke="white" />
            <line x1="420" y1="100" x2="480" y2="100" stroke="white" />
        </g>
      </svg>
       <div className="mt-4 flex justify-center space-x-2">
        <button onClick={handleStart} disabled={state !== 'idle'} className="px-3 py-1 bg-green-600 rounded text-xs disabled:bg-gray-500">Start</button>
        <button onClick={handleStop} disabled={state === 'idle'} className="px-3 py-1 bg-red-600 rounded text-xs disabled:bg-gray-500">Stop</button>
      </div>
    </div>
  );
};

export const SafetyRelayVisual: React.FC = () => {
    const [eStop, setEStop] = useState(true); // true = closed/ok
    const [gate, setGate] = useState(true); // true = closed/ok
    const [output, setOutput] = useState(false);

    const inputsOk = eStop && gate;
    const canReset = inputsOk && !output;

    const handleReset = () => {
        if (canReset) {
            setOutput(true);
        }
    }
    
    const handleFault = () => {
        setOutput(false);
    }
    
    return (
        <div className="p-4 text-center text-sm text-gray-400">
            <svg width="500" height="250" viewBox="0 0 500 250" className="bg-gray-800 rounded-lg">
                <defs><filter id="glow-green"><feGaussianBlur stdDeviation="3" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                {/* Inputs */}
                <rect x="20" y="50" width="80" height="40" rx="5" fill={eStop ? '#374151' : 'red'} className="cursor-pointer" onClick={() => { setEStop(!eStop); if(eStop) handleFault(); }} />
                <text x="60" y="75" textAnchor="middle" fill="white">E-Stop</text>
                
                <rect x="20" y="150" width="80" height="40" rx="5" fill={gate ? '#374151' : 'orange'} className="cursor-pointer" onClick={() => { setGate(!gate); if(gate) handleFault(); }} />
                <text x="60" y="175" textAnchor="middle" fill="white">Gate Switch</text>

                {/* Safety Relay */}
                <rect x="150" y="75" width="150" height="100" fill="#2d3748" stroke="#4A5568" />
                <text x="225" y="120" textAnchor="middle" fill="white" fontSize="16">Safety Relay</text>
                <circle cx="170" cy="95" r="5" fill={inputsOk ? 'lightgreen' : 'gray'} /><text x="180" y="100" fill="white" fontSize="12">CH1</text>
                <circle cx="170" cy="155" r="5" fill={inputsOk ? 'lightgreen' : 'gray'} /><text x="180" y="160" fill="white" fontSize="12">CH2</text>
                <circle cx="280" y="125" r="8" fill={output ? 'lightgreen' : 'gray'} filter={output ? 'url(#glow-green)' : 'none'} /><text x="260" y="130" fill="white" fontSize="12">OUT</text>

                {/* Reset */}
                <rect x="180" y="180" width="90" height="30" rx="5" fill={canReset ? 'blue' : '#374151'} className={canReset ? 'cursor-pointer animate-pulse' : ''} onClick={handleReset} />
                <text x="225" y="200" textAnchor="middle" fill="white">Reset</text>
                
                {/* Contactor */}
                <rect x="350" y="100" width="80" height="40" fill={output ? 'orange' : '#374151'} />
                <text x="390" y="125" textAnchor="middle" fill="white">KM1 Coil</text>
            </svg>
            <div className="mt-2">
                <p>Status: {output ? 'RUNNING' : (inputsOk ? 'Ready, press Reset' : 'FAULT')}</p>
            </div>
        </div>
    );
}

export const PLCScanCycleVisual: React.FC = () => {
    const [step, setStep] = useState(0);
    const steps = ["Read Inputs", "Execute Program", "Diagnostics & Comms", "Write Outputs"];
    
    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s + 1) % 4);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const angle = step * 90;
    
    return (
         <div className="p-4 text-center text-sm text-gray-400">
            <svg width="300" height="300" viewBox="0 0 300 300" className="bg-gray-800 rounded-lg">
                <circle cx="150" cy="150" r="120" fill="none" stroke="#4B5563" strokeWidth="2" />
                
                {steps.map((s, i) => (
                     <text key={s} x="150" y="40" transform={`rotate(${i * 90} 150 150)`} textAnchor="middle" fill={step === i ? 'cyan' : 'white'} fontWeight={step === i ? 'bold' : 'normal'}>
                         {s}
                     </text>
                ))}

                {/* Indicator */}
                <g style={{transform: `rotate(${angle}deg)`, transformOrigin: '150px 150px', transition: 'transform 0.5s ease-in-out'}}>
                    <path d="M150 50 L140 30 H 160 Z" fill="cyan" />
                </g>
                <text x="150" y="155" textAnchor="middle" fill="white" fontSize="14">Scan Time: ~2ms</text>
            </svg>
        </div>
    );
};

export const PressureSwitchVisual: React.FC = () => {
  const [pressure, setPressure] = useState(20);
  const SETPOINT = 60;
  const isTripped = pressure >= SETPOINT;

  return (
    <div className="p-4 text-center text-sm text-gray-400 w-full max-w-md mx-auto">
      <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
        {/* Diaphragm */}
        <path d={`M 50 100 C 50 120, ${50 + pressure / 2} 140, 100 140 S 150 120, 150 100 Z`} fill="#6B7280" style={{transition: 'all 0.2s ease'}}/>
        <text x="100" y="160" textAnchor="middle" fill="white">Pressure: {pressure} PSI</text>
        
        {/* Linkage */}
        <line x1="100" y1="100" x2="100" y2="70" stroke="#9CA3AF" strokeWidth="3" />
        <line x1="100" y1="70" x2="180" y2={isTripped ? 80 : 60} stroke="#9CA3AF" strokeWidth="3" style={{transition: 'all 0.2s ease'}} />

        {/* Contacts */}
        <text x="210" y="50" fill="white">NC</text>
        <circle cx="200" cy="60" r="5" fill={!isTripped ? "lightgreen" : "#9CA3AF"} />
        <text x="210" y="110" fill="white">NO</text>
        <circle cx="200" cy="100" r="5" fill={isTripped ? "lightgreen" : "#9CA3AF"} />
        <text x="160" y="75" fill="white">COM</text>
        <circle cx="180" cy="70" r="5" fill="lightgreen" />
      </svg>
      <div className="mt-4">
          <label>Adjust Pressure</label>
          <input type="range" min="0" max="100" value={pressure} onChange={e => setPressure(parseFloat(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};

export const LevelSwitchVisual: React.FC = () => {
  const [level, setLevel] = useState(20); // 0-100
  const angle = -45 + (level / 100) * 90;
  const isTripped = level > 50;

  return (
    <div className="p-4 text-center text-sm text-gray-400 w-full max-w-md mx-auto">
      <svg width="300" height="250" viewBox="0 0 300 250" className="bg-gray-800 rounded-lg">
        {/* Tank */}
        <rect x="50" y="20" width="200" height="200" fill="none" stroke="white" strokeWidth="2" />
        {/* Water */}
        <rect x="51" y={220 - level * 2} width="198" height={level * 2} fill="blue" opacity="0.5" />
        <text x="150" y="240" textAnchor="middle" fill="white">Level: {level}%</text>

        {/* Float */}
        <g style={{transform: `rotate(${angle}deg)`, transformOrigin: '250px 125px', transition: 'transform 0.2s'}}>
          <line x1="250" y1="125" x2="180" y2="125" stroke="#9CA3AF" strokeWidth="3" />
          <ellipse cx="160" cy="125" rx="20" ry="10" fill="orange" />
        </g>
        
        {/* Switch */}
        <rect x="250" y="100" width="30" height="50" fill="#374151" />
        <text x="265" y="90" fill="white" fontSize="12">Switch</text>
        <line x1="265" y1="125" x2="280" y2={isTripped ? 115 : 135} stroke="white" strokeWidth="2" style={{transition: 'all 0.2s'}} />
        <circle cx="280" cy="115" r="3" fill={isTripped ? "lightgreen" : "#9CA3AF"} />
        <circle cx="280" cy="135" r="3" fill={!isTripped ? "lightgreen" : "#9CA3AF"} />
      </svg>
      <div className="mt-4">
          <label>Adjust Level</label>
          <input type="range" min="0" max="100" value={level} onChange={e => setLevel(parseFloat(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};

export const ThermocoupleVisual: React.FC = () => {
    const [temp, setTemp] = useState(20);
    const voltage = temp * 0.041; // mV for Type K approx

    return (
        <div className="p-4 text-center text-sm text-gray-400 w-full max-w-md mx-auto">
            <svg width="400" height="200" viewBox="0 0 400 200" className="bg-gray-800 rounded-lg">
                {/* Wires */}
                <path d="M50 50 C 150 50, 200 80, 250 80" stroke="silver" strokeWidth="4" fill="none" />
                <path d="M50 150 C 150 150, 200 120, 250 120" stroke="gray" strokeWidth="4" fill="none" />
                <circle cx="250" cy="100" r="10" fill="orange" />
                <text x="250" y="145" textAnchor="middle" fill="white">Hot Junction</text>
                
                {/* Flame */}
                <path d={`M230 115 C 240 ${115 - temp/10}, 260 ${115 - temp/10}, 270 115 Z`} fill="red" opacity={temp/500} />
                <path d={`M240 115 C 245 ${115 - temp/15}, 255 ${115 - temp/15}, 260 115 Z`} fill="yellow" opacity={temp/500}/>
                
                {/* Voltmeter */}
                <rect x="20" y="70" width="80" height="60" fill="#374151" stroke="#4B5563" />
                <text x="60" y="105" textAnchor="middle" fill="cyan" fontSize="14">{voltage.toFixed(2)} mV</text>
                <line x1="50" y1="50" x2="40" y2="70" stroke="silver" strokeWidth="2" />
                <line x1="50" y1="150" x2="40" y2="130" stroke="gray" strokeWidth="2" />
                <text x="60" y="60" textAnchor="middle" fill="white">Cold Junction</text>

            </svg>
            <div className="mt-4">
                <label>Temperature: {temp.toFixed(0)}°C</label>
                <input type="range" min="20" max="500" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="w-full" />
            </div>
        </div>
    );
};

export const FlowSwitchVisual: React.FC = () => {
    const [flow, setFlow] = useState(false);
    
    return (
        <div className="p-4 text-center text-sm text-gray-400 w-full max-w-md mx-auto">
             <style>{`
                .water-particle { animation: flow-anim 2s linear infinite; }
                @keyframes flow-anim { 
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(200px); opacity: 0; }
                }
             `}</style>
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-800 rounded-lg">
                {/* Pipe */}
                <path d="M0 80 H 300 M0 120 H 300" stroke="white" strokeWidth="2" fill="none" />
                {/* Flow particles */}
                {flow && [...Array(10)].map((_, i) => (
                    <circle key={i} cx="50" cy="100" r="3" fill="blue" className="water-particle" style={{animationDelay: `${i*0.2}s`}} />
                ))}

                {/* Paddle */}
                <g style={{ transform: flow ? 'rotate(30deg)' : 'none', transformOrigin: '150px 80px', transition: 'transform 0.3s' }}>
                    <line x1="150" y1="80" x2="150" y2="120" stroke="orange" strokeWidth="3" />
                </g>

                {/* Switch */}
                <rect x="135" y="40" width="30" height="40" fill="#374151" />
                <circle cx="150" cy="80" r="4" fill="#6B7280" />
                <line x1="150" y1="70" x2="150" y2={flow ? 50 : 60} stroke="white" strokeWidth="2" style={{transition: 'all 0.3s'}}/>
                <circle cx="150" cy="50" r="3" fill={flow ? "lightgreen" : "#9CA3AF"} />
            </svg>
             <div className="mt-4">
                <button onClick={() => setFlow(!flow)} className={`px-4 py-2 rounded text-white ${flow ? 'bg-red-600' : 'bg-green-600'}`}>
                    {flow ? 'Stop Flow' : 'Start Flow'}
                </button>
             </div>
        </div>
    );
};
