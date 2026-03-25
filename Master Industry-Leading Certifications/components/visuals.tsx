import React from 'react';

const SvgContainer = ({ children, title, description, viewBox = "0 0 500 300", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} role="img" aria-labelledby={`${title.replace(/\s+/g, '-')}-title`} className={`w-full h-auto max-w-lg ${className}`}>
        <title id={`${title.replace(/\s+/g, '-')}-title`}>{title}</title>
        <desc>{description}</desc>
        <style>
            {`
                .svg-bg { fill: #F1F5F9; }
                .svg-text { font-family: sans-serif; fill: #475569; }
                .svg-text-light { fill: #64748B; }
                .svg-text-bold { font-weight: bold; fill: #1E293B; }
                .svg-text-heading { font-size: 16px; font-weight: bold; fill: #0F172A; }
                .svg-stroke { stroke: #CBD5E1; }
                .svg-stroke-dark { stroke: #64748B; }
                .svg-line { stroke: #475569; stroke-width: 1.5; }
                .svg-line-thick { stroke: #1E293B; stroke-width: 2.5; }
                .svg-arrow-head { fill: #475569; }

                @media (prefers-color-scheme: dark) {
                    .svg-bg { fill: #1E293B; }
                    .svg-text { fill: #E2E8F0; }
                    .svg-text-light { fill: #94A3B8; }
                    .svg-text-bold { font-weight: bold; fill: #F8FAFC; }
                    .svg-text-heading { fill: #FFFFFF; }
                    .svg-stroke { stroke: #475569; }
                    .svg-stroke-dark { stroke: #94A3B8; }
                    .svg-line { stroke: #94A3B8; }
                    .svg-line-thick { stroke: #E2E8F0; }
                    .svg-arrow-head { fill: #94A3B8; }
                }
            `}
        </style>
        {children}
    </svg>
);

const EquationContainer = ({ children, title, description, className = "" }) => (
    <div className={`p-4 rounded-lg text-center ${className}`}>
        <h4 className="text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">{title}</h4>
        <div className="text-lg md:text-xl font-mono text-slate-800 dark:text-gray-200 bg-slate-200 dark:bg-slate-800/50 p-4 rounded-md inline-block">
           {children}
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">{description}</p>
    </div>
);

// --- CMRP Visuals ---

export const OeeChart = () => (
    <SvgContainer title="OEE Breakdown Chart" description="A bar chart showing how losses reduce total time to the final OEE value." viewBox="0 0 500 250">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Overall Equipment Effectiveness (OEE) Breakdown</text>
        <g transform="translate(30, 60)">
            <rect x="0" y="0" width="440" height="30" fill="#3B82F6" />
            <text x="220" y="20" textAnchor="middle" fill="white" fontSize="12">Total Planned Time</text>
            
            <rect x="360" y="0" width="80" height="30" fill="#EF4444" />
            <text x="400" y="20" textAnchor="middle" fill="white" fontSize="12">Availability Loss</text>
            
            <rect x="0" y="50" width="360" height="30" fill="#2563EB" />
            <text x="180" y="70" textAnchor="middle" fill="white" fontSize="12">Run Time</text>
            
            <rect x="280" y="50" width="80" height="30" fill="#F97316" />
            <text x="320" y="70" textAnchor="middle" fill="white" fontSize="12">Performance Loss</text>

            <rect x="0" y="100" width="280" height="30" fill="#1D4ED8" />
            <text x="140" y="120" textAnchor="middle" fill="white" fontSize="12">Net Run Time</text>
            
            <rect x="230" y="100" width="50" height="30" fill="#FBBF24" />
            <text x="255" y="120" textAnchor="middle" fill="white" fontSize="10">Quality Loss</text>

            <rect x="0" y="150" width="230" height="30" fill="#10B981" />
            <text x="115" y="170" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Fully Productive Time (OEE)</text>
        </g>
    </SvgContainer>
);

export const PFCurve = () => (
    <SvgContainer title="P-F Curve" description="Graph showing equipment condition deteriorating over time from potential failure to functional failure." viewBox="0 0 500 280">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">The P-F Curve</text>
        <line x1="40" y1="230" x2="480" y2="230" className="svg-stroke-dark" />
        <text x="260" y="250" textAnchor="middle" className="svg-text-light">Time</text>
        <line x1="40" y1="50" x2="40" y2="230" className="svg-stroke-dark" />
        <text x="20" y="140" textAnchor="middle" transform="rotate(-90 20,140)" className="svg-text-light">Condition</text>
        <path d="M 60 70 C 150 80, 200 150, 450 220" stroke="#3B82F6" strokeWidth="3" fill="none" />
        <circle cx="150" cy="88" r="5" fill="#F97316" />
        <text x="150" y="75" textAnchor="middle" className="svg-text-bold">P (Potential Failure)</text>
        <line x1="150" y1="93" x2="150" y2="230" strokeDasharray="4 2" className="svg-line" />
        <circle cx="450" cy="220" r="5" fill="#EF4444" />
        <text x="450" y="210" textAnchor="middle" className="svg-text-bold">F (Functional Failure)</text>
        <line x1="450" y1="215" x2="450" y2="230" strokeDasharray="4 2" className="svg-line" />
        <path d="M 155 230 L 155 220 L 445 220 L 445 230" fill="none" stroke="#F97316" />
        <text x="290" y="215" textAnchor="middle" fill="#F97316" fontSize="12" fontWeight="bold">P-F Interval (Window of Opportunity)</text>
    </SvgContainer>
);

export const WorkManagementCycle = () => (
    <SvgContainer title="Work Management Cycle" description="A circular diagram showing the six stages of the work management process." viewBox="0 0 400 400">
        <defs>
            <path id="circlePath" d="M 200, 200 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" />
        </defs>
        <text x="200" y="200" textAnchor="middle" className="svg-text-heading" dy=".3em">Work<tspan x="200" dy="1.2em">Management</tspan></text>
        <g className="svg-text" fontSize="13">
            <text><textPath href="#circlePath" startOffset="0%">1. Work Identification</textPath></text>
            <text><textPath href="#circlePath" startOffset="16.66%">2. Prioritization</textPath></text>
            <text><textPath href="#circlePath" startOffset="33.33%">3. Planning</textPath></text>
            <text><textPath href="#circlePath" startOffset="50%">4. Scheduling</textPath></text>
            <text><textPath href="#circlePath" startOffset="66.66%">5. Execution</textPath></text>
            <text><textPath href="#circlePath" startOffset="83.33%">6. Closure</textPath></text>
        </g>
    </SvgContainer>
);

export const RpnEquation = () => (
    <EquationContainer title="Risk Priority Number (RPN) Formula" description="RPN quantifies risk to prioritize failure modes.">
        RPN = Severity (S) &times; Occurrence (O) &times; Detection (D)
    </EquationContainer>
);

export const LccComparisonChart = () => (
    <SvgContainer title="Life Cycle Costing Comparison" description="A bar chart comparing the total life cycle cost of two different assets." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Life Cycle Cost Comparison</text>
        <line x1="50" y1="250" x2="450" y2="250" className="svg-stroke-dark" />
        <g className="svg-text-light" textAnchor="middle">
            <text x="150" y="270">Asset A (Low CAPEX)</text>
            <text x="350" y="270">Asset B (High CAPEX)</text>
        </g>
        
        {/* Asset A bars */}
        <g transform="translate(125, 0)">
            <rect x="0" y="200" width="50" height="50" fill="#F97316" />
            <rect x="0" y="130" width="50" height="70" fill="#3B82F6" />
            <rect x="0" y="80" width="50" height="50" fill="#10B981" />
        </g>
        
        {/* Asset B bars */}
        <g transform="translate(325, 0)">
            <rect x="0" y="170" width="50" height="80" fill="#F97316" />
            <rect x="0" y="120" width="50" height="50" fill="#3B82F6" />
            <rect x="0" y="100" width="50" height="20" fill="#10B981" />
        </g>

        <g className="svg-text" fontSize="12" textAnchor="end">
            <rect x="300" y="50" width="15" height="15" fill="#F97316" />
            <text x="400" y="62">CAPEX (Purchase)</text>
            <rect x="300" y="75" width="15" height="15" fill="#3B82F6" />
            <text x="400" y="87">OPEX (Energy)</text>
            <rect x="300" y="100" width="15" height="15" fill="#10B981" />
            <text x="400" y="112">Maintenance</text>
        </g>
    </SvgContainer>
);

export const SixBigLossesDiagram = () => (
    <SvgContainer title="The Six Big Losses of OEE" description="A diagram categorizing the six big losses under Availability, Performance, and Quality." viewBox="0 0 500 320">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">The Six Big Losses</text>
        {/* Availability Box */}
        <rect x="25" y="50" width="450" height="80" rx="5" className="svg-stroke" fillOpacity="0.5" fill="#FEF2F2" />
        <text x="45" y="70" className="svg-text-bold" fill="#EF4444">Availability Losses</text>
        <text x="50" y="100" className="svg-text">1. Equipment Failures (Breakdowns)</text>
        <text x="250" y="100" className="svg-text">2. Setup & Adjustments</text>
        
        {/* Performance Box */}
        <rect x="25" y="140" width="450" height="80" rx="5" className="svg-stroke" fillOpacity="0.5" fill="#FFFBEB" />
        <text x="45" y="160" className="svg-text-bold" fill="#F97316">Performance Losses</text>
        <text x="50" y="190" className="svg-text">3. Idling & Minor Stoppages</text>
        <text x="250" y="190" className="svg-text">4. Reduced Speed</text>
        
        {/* Quality Box */}
        <rect x="25" y="230" width="450" height="80" rx="5" className="svg-stroke" fillOpacity="0.5" fill="#EFF6FF" />
        <text x="45" y="250" className="svg-text-bold" fill="#3B82F6">Quality Losses</text>
        <text x="50" y="280" className="svg-text">5. Process Defects (Scrap/Rework)</text>
        <text x="250" y="280" className="svg-text">6. Reduced Yield (Startup Rejects)</text>
    </SvgContainer>
);

export const FishboneDiagram = () => (
    <SvgContainer title="Fishbone (Ishikawa) Diagram" description="A blank fishbone diagram template for root cause analysis." viewBox="0 0 500 350">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Fishbone Diagram (Cause & Effect)</text>
        
        <line x1="50" y1="180" x2="400" y2="180" className="svg-line-thick" />
        <rect x="400" y="155" width="90" height="50" rx="3" className="svg-stroke" fill="#DBEAFE" />
        <text x="445" y="185" textAnchor="middle" className="svg-text-bold">Problem</text>
        
        <g className="svg-text-bold" fontSize="14">
            {/* Top Bones */}
            <line x1="120" y1="180" x2="180" y2="120" className="svg-line" />
            <text x="185" y="110">Manpower</text>
            <line x1="260" y1="180" x2="320" y2="120" className="svg-line" />
            <text x="325" y="110">Machine</text>
            <line x1="400" y1="180" x2="460" y2="120" className="svg-line" />
            <text x="410" y="110">Measurement</text>

            {/* Bottom Bones */}
            <line x1="120" y1="180" x2="180" y2="240" className="svg-line" />
            <text x="185" y="255">Method</text>
            <line x1="260" y1="180" x2="320" y2="240" className="svg-line" />
            <text x="325" y="255">Material</text>
            <line x1="400" y1="180" x2="460" y2="240" className="svg-line" />
            <text x="395" y="255">Environment</text>
        </g>
    </SvgContainer>
);

export const MaintenanceStrategyMatrix = () => (
    <SvgContainer title="Maintenance Strategy Matrix" description="A matrix showing different maintenance strategies from reactive to proactive." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">The Maintenance Strategy Spectrum</text>

        <defs>
            <marker id="arrow-strategy" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
            </marker>
        </defs>

        <line x1="20" y1="200" x2="480" y2="200" className="svg-line-thick" markerEnd="url(#arrow-strategy)" />
        <text x="250" y="230" textAnchor="middle" className="svg-text-bold">Maturity & Proactivity &rarr;</text>
        
        <g className="svg-text" textAnchor="middle">
            <g transform="translate(60, 120)">
                <rect width="100" height="60" rx="5" className="svg-stroke" fill="#FEE2E2" />
                <text y="25" x="50" className="svg-text-bold">Reactive</text>
                <text y="45" x="50" fontSize="12">(Run to Failure)</text>
            </g>
            <g transform="translate(190, 120)">
                <rect width="100" height="60" rx="5" className="svg-stroke" fill="#FEF9C3" />
                <text y="25" x="50" className="svg-text-bold">Preventive</text>
                <text y="45" x="50" fontSize="12">(Time-based)</text>
            </g>
            <g transform="translate(320, 120)">
                <rect width="100" height="60" rx="5" className="svg-stroke" fill="#DBEAFE" />
                <text y="25" x="50" className="svg-text-bold">Predictive</text>
                <text y="45" x="50" fontSize="12">(Condition-based)</text>
            </g>
        </g>
    </SvgContainer>
);

export const TuckmanLadder = () => (
    <SvgContainer title="Tuckman's Ladder of Team Development" description="A visual showing the five stages of team development: Forming, Storming, Norming, Performing, and Adjourning." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Tuckman's Ladder of Team Development</text>
        
        <path d="M 50 250 C 150 250, 150 100, 250 100 S 350 250, 450 250" stroke="#3B82F6" strokeWidth="3" fill="none" />
        <path d="M 450 250 C 460 220, 470 220, 480 250" stroke="#3B82F6" strokeWidth="3" fill="none" strokeDasharray="4 4" />

        <g className="svg-text-bold" textAnchor="middle">
            <g transform="translate(50, 250)">
                <circle r="8" fill="#3B82F6" />
                <text y="-15">Forming</text>
            </g>
            <g transform="translate(160, 145)">
                <circle r="8" fill="#3B82F6" />
                <text y="-15">Storming</text>
            </g>
            <g transform="translate(250, 100)">
                <circle r="8" fill="#3B82F6" />
                <text y="-15">Norming</text>
            </g>
            <g transform="translate(340, 145)">
                <circle r="8" fill="#3B82F6" />
                <text y="-15">Performing</text>
            </g>
            <g transform="translate(450, 250)">
                <circle r="8" fill="#3B82F6" />
                <text y="-15">Adjourning</text>
            </g>
        </g>
    </SvgContainer>
);

export const WrenchTimeChart = () => (
    <SvgContainer title="Wrench Time Chart" description="A donut chart illustrating the breakdown of a maintenance technician's day, highlighting the small percentage of actual wrench time." viewBox="0 0 400 300">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Typical Technician Day (Low Wrench Time)</text>
        <circle cx="200" cy="160" r="80" fill="none" stroke="#F97316" strokeWidth="40" />
        <circle cx="200" cy="160" r="80" fill="none" stroke="#3B82F6" strokeWidth="40" strokeDasharray="150.8 502.6" transform="rotate(-90 200 160)" />
        <circle cx="200" cy="160" r="60" className="svg-bg" />
        <text x="200" y="160" textAnchor="middle" className="svg-text-bold" fontSize="30">30%</text>
        <text x="200" y="185" textAnchor="middle" className="svg-text-light">Wrench Time</text>
        
        <g className="svg-text" fontSize="14">
            <rect x="20" y="260" width="15" height="15" fill="#3B82F6" />
            <text x="40" y="272">Wrench Time</text>
            <rect x="180" y="260" width="15" height="15" fill="#F97316" />
            <text x="200" y="272">Delays (Travel, Parts, Waiting)</text>
        </g>
    </SvgContainer>
);

// --- CAMA Visuals ---

export const FourFundamentals = () => (
     <SvgContainer title="Four Fundamentals of Asset Management" description="Diagram of four interconnected concepts: Value, Alignment, Leadership, Assurance." viewBox="0 0 400 250">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Four Fundamentals of Asset Management</text>
        <g transform="translate(0, 50)">
            <rect x="50" y="20" width="130" height="50" rx="5" className="svg-stroke" fill="#3B82F6" />
            <text x="115" y="45" textAnchor="middle" fill="white" fontWeight="bold">Value</text>
            <rect x="220" y="20" width="130" height="50" rx="5" className="svg-stroke" fill="#10B981" />
            <text x="285" y="45" textAnchor="middle" fill="white" fontWeight="bold">Alignment</text>
            <rect x="50" y="100" width="130" height="50" rx="5" className="svg-stroke" fill="#F97316" />
            <text x="115" y="125" textAnchor="middle" fill="white" fontWeight="bold">Leadership</text>
            <rect x="220" y="100" width="130" height="50" rx="5" className="svg-stroke" fill="#A855F7" />
            <text x="285" y="125" textAnchor="middle" fill="white" fontWeight="bold">Assurance</text>
        </g>
    </SvgContainer>
);

export const LineOfSight = () => (
     <SvgContainer title="Line of Sight Diagram" description="A flowchart showing how strategic goals cascade down to tactical actions." viewBox="0 0 350 400">
        <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
            </marker>
        </defs>
        <text x="175" y="25" textAnchor="middle" className="svg-text-heading">"Line of Sight"</text>
        
        <g transform="translate(50, 60)" className="svg-text" fontSize="14">
            <rect x="0" y="0" width="250" height="50" rx="5" className="svg-stroke" fill="#3B82F6" />
            <text x="125" y="30" textAnchor="middle" fill="white" fontWeight="bold">Organizational Strategic Plan</text>
            
            <line x1="125" y1="50" x2="125" y2="80" className="svg-line" markerEnd="url(#arrow)" />

            <rect x="0" y="80" width="250" height="50" rx="5" className="svg-stroke" fill="#2563EB" />
            <text x="125" y="110" textAnchor="middle" fill="white" fontWeight="bold">SAMP (Strategic AM Plan)</text>

            <line x1="125" y1="130" x2="125" y2="160" className="svg-line" markerEnd="url(#arrow)" />

            <rect x="0" y="160" width="250" height="50" rx="5" className="svg-stroke" fill="#1D4ED8" />
            <text x="125" y="190" textAnchor="middle" fill="white" fontWeight="bold">AMP (Asset Management Plan)</text>
            
             <line x1="125" y1="210" x2="125" y2="240" className="svg-line" markerEnd="url(#arrow)" />

            <rect x="0" y="240" width="250" height="50" rx="5" className="svg-stroke" fill="#1E40AF" />
            <text x="125" y="270" textAnchor="middle" fill="white" fontWeight="bold">Daily Activities / Work Orders</text>
        </g>
    </SvgContainer>
);

export const RiskMatrix = () => (
    <SvgContainer title="Risk Matrix" description="A 5x5 grid for evaluating risk based on likelihood and consequence." viewBox="0 0 500 400">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Risk Assessment Matrix</text>
        <g className="svg-text-light" fontSize="12" textAnchor="middle">
            <text x="270" y="385">Likelihood &rarr;</text>
            <text x="35" y="210" transform="rotate(-90 35,210)">Consequence &rarr;</text>
        </g>
        <g transform="translate(80, 50)">
            {['#10B981', '#65A30D', '#FBBF24', '#F97316', '#EF4444'].map((color, i) => (
                <rect key={i} x={i * 60} y={0 * 60} width="60" height="60" fill={color} className="svg-stroke" />
            ))}
            {['#10B981', '#FBBF24', '#F97316', '#EF4444', '#DC2626'].map((color, i) => (
                <rect key={i} x={i * 60} y={1 * 60} width="60" height="60" fill={color} className="svg-stroke" />
            ))}
            {['#FBBF24', '#F97316', '#EF4444', '#DC2626', '#B91C1C'].map((color, i) => (
                <rect key={i} x={i * 60} y={2 * 60} width="60" height="60" fill={color} className="svg-stroke" />
            ))}
            {['#F97316', '#EF4444', '#DC2626', '#B91C1C', '#991B1B'].map((color, i) => (
                <rect key={i} x={i * 60} y={3 * 60} width="60" height="60" fill={color} className="svg-stroke" />
            ))}
            {['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'].map((color, i) => (
                <rect key={i} x={i * 60} y={4 * 60} width="60" height="60" fill={color} className="svg-stroke" />
            ))}
        </g>
    </SvgContainer>
);

export const BowTieAnalysis = () => (
    <SvgContainer title="Bow-Tie Analysis Diagram" description="A diagram showing threats, preventive controls, the risk event, mitigating controls, and consequences." viewBox="0 0 500 350">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Bow-Tie Analysis</text>

        {/* Center Event */}
        <circle cx="250" cy="180" r="40" className="svg-stroke" fill="#FEE2E2" />
        <text x="250" y="175" textAnchor="middle" className="svg-text-bold">Risk</text>
        <text x="250" y="190" textAnchor="middle" className="svg-text-bold">Event</text>

        {/* Left Side (Prevention) */}
        <g className="svg-text" textAnchor="middle" fontSize="12">
            <rect x="20" y="100" width="80" height="40" rx="3" className="svg-stroke" fill="#FEF9C3" />
            <text x="60" y="125">Threat 1</text>
            <line x1="100" y1="120" x2="140" y2="160" className="svg-line" />

            <rect x="20" y="200" width="80" height="40" rx="3" className="svg-stroke" fill="#FEF9C3" />
            <text x="60" y="225">Threat 2</text>
            <line x1="100" y1="220" x2="140" y2="190" className="svg-line" />

            <rect x="145" y="165" width="20" height="30" className="svg-stroke" fill="#DBEAFE" />
            <text x="155" y="205" transform="rotate(-90 155, 180)" className="svg-text-bold">Preventive Controls</text>
        </g>
        
        {/* Right Side (Mitigation) */}
        <g className="svg-text" textAnchor="middle" fontSize="12">
            <rect x="400" y="100" width="80" height="40" rx="3" className="svg-stroke" fill="#FEF9C3" />
            <text x="440" y="125">Consequence 1</text>
            <line x1="360" y1="160" x2="400" y2="120" className="svg-line" />
            
            <rect x="400" y="200" width="80" height="40" rx="3" className="svg-stroke" fill="#FEF9C3" />
            <text x="440" y="225">Consequence 2</text>
            <line x1="360" y1="190" x2="400" y2="220" className="svg-line" />
            
            <rect x="335" y="165" width="20" height="30" className="svg-stroke" fill="#D1FAE5" />
            <text x="345" y="205" transform="rotate(-90 345, 180)" className="svg-text-bold">Mitigating Controls</text>
        </g>
    </SvgContainer>
);

// --- CRE Visuals ---

export const BathtubCurve = () => (
    <SvgContainer title="Bathtub Curve" description="Graph showing failure rate over time in three phases: infant mortality, useful life, and wear-out." viewBox="0 0 500 280">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">The Bathtub Curve</text>
        <line x1="40" y1="230" x2="480" y2="230" className="svg-stroke-dark" />
        <text x="260" y="250" textAnchor="middle" className="svg-text-light">Time</text>
        <line x1="40" y1="50" x2="40" y2="230" className="svg-stroke-dark" />
        <text x="20" y="140" textAnchor="middle" transform="rotate(-90 20,140)" className="svg-text-light">Failure Rate (λ)</text>
        <path d="M 60 100 C 100 200, 120 200, 150 200 L 350 200 C 380 200, 400 100, 440 80" stroke="#3B82F6" strokeWidth="3" fill="none" />
        <text x="105" y="160" textAnchor="middle" className="svg-text-bold" fontSize="12">Infant Mortality</text>
        <text x="250" y="180" textAnchor="middle" className="svg-text-bold" fontSize="12">Useful Life (Random Failures)</text>
        <text x="395" y="150" textAnchor="middle" className="svg-text-bold" fontSize="12">Wear-out</text>
    </SvgContainer>
);

export const AvailabilityEquation = () => (
    <EquationContainer title="Inherent Availability Formula" description="Calculates the 'as-designed' availability of a repairable system.">
        A = MTBF / (MTBF + MTTR)
    </EquationContainer>
);

export const SeriesRBD = () => (
    <SvgContainer title="Series Reliability Block Diagram" description="Diagram of a series system where all components must work." viewBox="0 0 400 200">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Series System</text>
        <line x1="20" y1="100" x2="80" y2="100" className="svg-line-thick" />
        <rect x="80" y="75" width="80" height="50" rx="5" className="svg-stroke" fill="#3B82F6" />
        <text x="120" y="105" textAnchor="middle" fill="white" fontWeight="bold">R1</text>
        <line x1="160" y1="100" x2="240" y2="100" className="svg-line-thick" />
        <rect x="240" y="75" width="80" height="50" rx="5" className="svg-stroke" fill="#3B82F6" />
        <text x="280" y="105" textAnchor="middle" fill="white" fontWeight="bold">R2</text>
        <line x1="320" y1="100" x2="380" y2="100" className="svg-line-thick" />
        <text x="200" y="160" textAnchor="middle" className="svg-text-bold" fontFamily="monospace">R<tspan dy="5" fontSize="10">sys</tspan> = R1 &times; R2</text>
    </SvgContainer>
);

export const ParallelRBD = () => (
    <SvgContainer title="Parallel Reliability Block Diagram" description="Diagram of a parallel (redundant) system where at least one component must work." viewBox="0 0 400 250">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Parallel (Redundant) System</text>
        <path d="M 120 125 L 120 70 L 280 70 L 280 125" stroke="none" fill="none" />
        <line x1="20" y1="125" x2="80" y2="125" className="svg-line-thick" />
        <line x1="80" y1="125" x2="80" y2="70" className="svg-line-thick" />
        <line x1="80" y1="125" x2="80" y2="180" className="svg-line-thick" />
        
        <rect x="80" y="45" width="80" height="50" rx="5" className="svg-stroke" fill="#10B981" />
        <text x="120" y="70" textAnchor="middle" fill="white" fontWeight="bold">R1</text>
        <line x1="160" y1="70" x2="240" y2="70" className="svg-line-thick" />
        <line x1="240" y1="70" x2="240" y2="125" className="svg-line-thick" />

        <rect x="80" y="155" width="80" height="50" rx="5" className="svg-stroke" fill="#10B981" />
        <text x="120" y="180" textAnchor="middle" fill="white" fontWeight="bold">R2</text>
        <line x1="160" y1="180" x2="240" y2="180" className="svg-line-thick" />
        <line x1="240" y1="180" x2="240" y2="125" className="svg-line-thick" />

        <line x1="240" y1="125" x2="380" y2="125" className="svg-line-thick" />
        <text x="200" y="230" textAnchor="middle" className="svg-text-bold" fontFamily="monospace">R<tspan dy="5" fontSize="10">sys</tspan> = 1 - ((1 - R1) &times; (1 - R2))</text>
    </SvgContainer>
);

export const DeratingGraph = () => (
    <SvgContainer title="Derating Curve" description="Graph showing how a component's operational limits are reduced as temperature increases to improve reliability." viewBox="0 0 500 280">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Component Derating Curve</text>
        <line x1="40" y1="230" x2="480" y2="230" className="svg-stroke-dark" />
        <text x="260" y="250" textAnchor="middle" className="svg-text-light">Ambient Temperature</text>
        <line x1="40" y1="50" x2="40" y2="230" className="svg-stroke-dark" />
        <text x="20" y="140" textAnchor="middle" transform="rotate(-90 20,140)" className="svg-text-light">Allowed Stress (%)</text>

        <path d="M 40 70 L 250 70 L 450 210" stroke="#3B82F6" strokeWidth="3" fill="none" />
        
        <rect x="40" y="70" width="410" height="160" fill="#10B981" fillOpacity="0.1" />
        <text x="250" y="150" textAnchor="middle" fill="#10B981" fontWeight="bold" fontSize="14">Safe Operating Area</text>

        <line x1="250" y1="70" x2="250" y2="230" strokeDasharray="4 2" className="svg-line" />
        <text x="250" y="60" textAnchor="middle" className="svg-text">100% Rating</text>
        <text x="40" y="60" textAnchor="start" className="svg-text">100%</text>
    </SvgContainer>
);

// --- PMP Visuals ---

export const BenefitsFlowchart = () => (
    <SvgContainer title="Benefits Realization Flowchart" description="A flowchart showing how project outputs lead to business benefits." viewBox="0 0 520 150">
        <defs>
            <marker id="arrow-benefits" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
            </marker>
        </defs>
        <text x="260" y="25" textAnchor="middle" className="svg-text-heading">Benefits Realization Flow</text>

        <g transform="translate(10, 60)" className="svg-text-bold" fontSize="12" textAnchor="middle">
            <rect x="0" y="0" width="100" height="50" rx="5" className="svg-stroke" fill="#DBEAFE" />
            <text x="50" y="25">Project</text>
            <text x="50" y="40">Outputs</text>

            <line x1="100" y1="25" x2="140" y2="25" className="svg-line" markerEnd="url(#arrow-benefits)" />
            
            <rect x="140" y="0" width="100" height="50" rx="5" className="svg-stroke" fill="#D1FAE5" />
            <text x="190" y="25">Business</text>
            <text x="190" y="40">Outcomes</text>
            
            <line x1="240" y1="25" x2="280" y2="25" className="svg-line" markerEnd="url(#arrow-benefits)" />

            <rect x="280" y="0" width="100" height="50" rx="5" className="svg-stroke" fill="#FEF3C7" />
            <text x="330" y="25">Business</text>
            <text x="330" y="40">Benefits</text>
            
            <line x1="380" y1="25" x2="420" y2="25" className="svg-line" markerEnd="url(#arrow-benefits)" />
            
            <rect x="420" y="0" width="100" height="50" rx="5" className="svg-stroke" fill="#FCE7F3" />
            <text x="470" y="25">Strategic</text>
            <text x="470" y="40">Objectives</text>
        </g>
    </SvgContainer>
);

export const PowerInterestGrid = () => (
    <SvgContainer title="Power/Interest Grid" description="A 2x2 matrix for stakeholder analysis." viewBox="0 0 500 350">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Stakeholder Power/Interest Grid</text>
        <g className="svg-text-light" fontSize="12" textAnchor="middle">
            <text x="270" y="335">Interest &rarr;</text>
            <text x="35" y="180" transform="rotate(-90 35,180)">Power &rarr;</text>
        </g>
        <g transform="translate(80, 50)" className="svg-text-bold">
            <rect x="0" y="0" width="150" height="120" className="svg-stroke" fill="#FEF3C7" />
            <text x="75" y="65" textAnchor="middle">Keep Satisfied</text>
             <rect x="150" y="0" width="150" height="120" className="svg-stroke" fill="#DBEAFE" />
            <text x="225" y="65" textAnchor="middle">Manage Closely</text>
             <rect x="0" y="120" width="150" height="120" className="svg-stroke" fill="#F3F4F6" />
            <text x="75" y="185" textAnchor="middle">Monitor</text>
             <rect x="150" y="120" width="150" height="120" className="svg-stroke" fill="#D1FAE5" />
            <text x="225" y="185" textAnchor="middle">Keep Informed</text>
        </g>
    </SvgContainer>
);

export const CriticalPathDiagram = () => (
    <SvgContainer title="Critical Path Method Diagram" description="A network diagram showing the critical path with zero float." viewBox="0 0 500 250">
        <defs>
            <marker id="arrow-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
            </marker>
        </defs>
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Critical Path Method</text>
        <g transform="translate(30, 80)">
            {/* Critical Path */}
            <circle cx="20" cy="50" r="20" fill="#DC2626" />
            <text x="20" y="55" textAnchor="middle" fill="white">A</text>
            <line x1="40" y1="50" x2="100" y2="50" stroke="#DC2626" strokeWidth="3" markerEnd="url(#arrow-dark)" />
            <circle cx="120" cy="50" r="20" fill="#DC2626" />
            <text x="120" y="55" textAnchor="middle" fill="white">C</text>
            <line x1="140" y1="50" x2="200" y2="50" stroke="#DC2626" strokeWidth="3" markerEnd="url(#arrow-dark)" />
            <circle cx="220" cy="50" r="20" fill="#DC2626" />
            <text x="220" y="55" textAnchor="middle" fill="white">D</text>
            <line x1="240" y1="50" x2="300" y2="50" stroke="#DC2626" strokeWidth="3" markerEnd="url(#arrow-dark)" />
            <circle cx="320" cy="50" r="20" fill="#DC2626" />
            <text x="320" y="55" textAnchor="middle" fill="white">E</text>
            
            {/* Non-Critical Path */}
            <line x1="40" y1="50" x2="100" y2="120" className="svg-line" markerEnd="url(#arrow-dark)" />
            <circle cx="120" cy="120" r="20" fill="#3B82F6" />
            <text x="120" y="125" textAnchor="middle" fill="white">B</text>
            <line x1="140" y1="120" x2="200" y2="50" className="svg-line" markerEnd="url(#arrow-dark)" />
            
             <text x="170" y="25" textAnchor="middle" fill="#DC2626" fontSize="12" fontWeight="bold">Critical Path (Zero Float)</text>
             <text x="120" y="155" textAnchor="middle" className="svg-text-light" fontSize="12">Non-Critical Path (Has Float)</text>
        </g>
    </SvgContainer>
);

export const OeeEquation = () => (
    <EquationContainer title="OEE Formula" description="OEE measures true productive manufacturing time.">
        OEE = Availability &times; Performance &times; Quality
    </EquationContainer>
);

export const CpiEquation = () => (
    <EquationContainer title="Cost Performance Index (CPI)" description="Measures cost efficiency. CPI < 1 is over budget.">
        CPI = EV / AC
    </EquationContainer>
);

export const SpiEquation = () => (
    <EquationContainer title="Schedule Performance Index (SPI)" description="Measures schedule efficiency. SPI < 1 is behind schedule.">
        SPI = EV / PV
    </EquationContainer>
);

// --- NEW VISUALS FOR LSS & MLT ---
export const ParetoChart = () => (
    <SvgContainer title="Pareto Chart" description="A bar chart showing causes of defects in descending order, with a cumulative percentage line." viewBox="0 0 500 320">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Pareto Chart of Downtime Causes</text>
        <line x1="50" y1="250" x2="450" y2="250" className="svg-stroke-dark" />
        <line x1="50" y1="50" x2="50" y2="250" className="svg-stroke-dark" />
        <line x1="450" y1="50" x2="450" y2="250" className="svg-stroke-dark" />
        <text x="250" y="280" textAnchor="middle" className="svg-text-light">Causes</text>
        <text x="30" y="150" textAnchor="middle" transform="rotate(-90 30,150)" className="svg-text-light">Frequency</text>
        <text x="470" y="150" textAnchor="middle" transform="rotate(90 470,150)" className="svg-text-light">Cumulative %</text>

        {/* Bars */}
        <rect x="70" y="100" width="50" height="150" fill="#3B82F6" />
        <rect x="150" y="150" width="50" height="100" fill="#3B82F6" />
        <rect x="230" y="190" width="50" height="60" fill="#3B82F6" />
        <rect x="310" y="220" width="50" height="30" fill="#3B82F6" />
        <rect x="390" y="235" width="50" height="15" fill="#3B82F6" />

        {/* Line */}
        <path d="M 70 100 L 175 100 L 255 150 L 335 190 L 415 235" stroke="none" />
        <polyline points="95,100 175,150 255,190 335,220 415,235" fill="none" stroke="#EF4444" strokeWidth="2.5" />
        <circle cx="95" cy="100" r="3" fill="#EF4444" />
        <circle cx="175" cy="150" r="3" fill="#EF4444" />
        <circle cx="255" cy="190" r="3" fill="#EF4444" />
        <circle cx="335" cy="220" r="3" fill="#EF4444" />
        <circle cx="415" cy="235" r="3" fill="#EF4444" />
        
        <text x="175" y="90" fill="#EF4444" textAnchor="middle" fontSize="12" fontWeight="bold">80%</text>
        <line x1="175" y1="95" x2="175" y2="150" strokeDasharray="2 2" stroke="#EF4444" />
        <line x1="50" y1="105" x2="175" y2="105" strokeDasharray="2 2" stroke="#EF4444" />
    </SvgContainer>
);

export const PughMatrix = () => (
    <SvgContainer title="Pugh Matrix for Solution Selection" description="A table comparing solution options against a baseline using criteria." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Solution Selection Matrix (Pugh Matrix)</text>
        <g transform="translate(30, 60)" className="svg-text" fontSize="12">
            <rect x="0" y="0" width="100" height="200" className="svg-bg" />
            <rect x="100" y="0" width="100" height="200" className="svg-bg" />
            {/* Header */}
            <text x="50" y="25" textAnchor="middle" className="svg-text-bold">Criteria</text>
            <text x="150" y="25" textAnchor="middle" className="svg-text-bold">Baseline</text>
            <text x="250" y="25" textAnchor="middle" className="svg-text-bold">Option A</text>
            <text x="350" y="25" textAnchor="middle" className="svg-text-bold">Option B</text>
            {/* Criteria */}
            <text x="10" y="60">Cost</text>
            <text x="10" y="90">Effectiveness</text>
            <text x="10" y="120">Implementation Time</text>
            <text x="10" y="150">Risk</text>
            {/* Scores */}
            <g textAnchor="middle">
                {[60, 90, 120, 150].map(y => <text key={y} x="150" y={y}>0</text>)}
                <text x="250" y="60" fill="green" fontWeight="bold">+</text>
                <text x="250" y="90" fill="green" fontWeight="bold">+</text>
                <text x="250" y="120" fill="red" fontWeight="bold">-</text>
                <text x="250" y="150">0</text>
                <text x="350" y="60" fill="red" fontWeight="bold">-</text>
                <text x="350" y="90" fill="green" fontWeight="bold">+</text>
                <text x="350" y="120" fill="green" fontWeight="bold">+</text>
                <text x="350" y="150" fill="green" fontWeight="bold">+</text>
            </g>
            {/* Totals */}
            <text x="50" y="190" textAnchor="middle" className="svg-text-bold">Total Score</text>
            <text x="250" y="190" textAnchor="middle" className="svg-text-bold">+1</text>
            <text x="350" y="190" textAnchor="middle" className="svg-text-bold">+2</text>
            <line x1="0" y1="170" x2="440" y2="170" className="svg-stroke-dark" />
        </g>
    </SvgContainer>
);

export const ControlChart = () => (
    <SvgContainer title="Control Chart (SPC)" description="A graph showing process data over time with control limits." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Statistical Process Control (SPC) Chart</text>
        <line x1="50" y1="250" x2="450" y2="250" className="svg-stroke-dark" />
        <line x1="50" y1="50" x2="50" y2="250" className="svg-stroke-dark" />
        
        {/* Limits */}
        <line x1="50" y1="80" x2="450" y2="80" stroke="#EF4444" strokeDasharray="4 4" />
        <text x="40" y="85" textAnchor="end" fill="#EF4444" fontSize="10">UCL</text>
        <line x1="50" y1="150" x2="450" y2="150" stroke="#10B981" />
        <text x="40" y="155" textAnchor="end" fill="#10B981" fontSize="10">Mean</text>
        <line x1="50" y1="220" x2="450" y2="220" stroke="#EF4444" strokeDasharray="4 4" />
        <text x="40" y="225" textAnchor="end" fill="#EF4444" fontSize="10">LCL</text>
        
        {/* Data points */}
        <polyline points="70,140 110,160 150,130 190,170 230,120 270,150 310,60 350,160 390,140 430,150" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="310" cy="60" r="5" fill="red" stroke="black" strokeWidth="1" />
        <text x="310" y="50" textAnchor="middle" fontSize="10" fill="red" className="svg-text-bold">Out of Control</text>
    </SvgContainer>
);

export const PdcaCycle = () => (
    <SvgContainer title="PDCA Cycle" description="A circular diagram showing the Plan, Do, Check, Act cycle for continuous improvement." viewBox="0 0 400 400">
        <defs>
            <marker id="arrow-pdca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
            </marker>
        </defs>
        <text x="200" y="40" textAnchor="middle" className="svg-text-heading">Continual Improvement Cycle</text>
        <g transform="translate(200, 200)">
            {/* Arrows */}
            <path d="M 0 -110 A 110 110 0 1 1 -110 0" fill="none" className="svg-line-thick" markerEnd="url(#arrow-pdca)" />
            <path d="M -110 0 A 110 110 0 0 1 0 110" fill="none" className="svg-line-thick" markerEnd="url(#arrow-pdca)" />
            <path d="M 0 110 A 110 110 0 0 1 110 0" fill="none" className="svg-line-thick" markerEnd="url(#arrow-pdca)" />
            <path d="M 110 0 A 110 110 0 0 1 0 -110" fill="none" className="svg-line-thick" markerEnd="url(#arrow-pdca)" />
            
            {/* Quadrants */}
            <g className="svg-text-bold" textAnchor="middle">
                <rect x="-80" y="-80" width="80" height="80" rx="5" className="svg-stroke" fill="#DBEAFE" />
                <text x="-40" y="-40">Plan</text>
                <rect x="0" y="-80" width="80" height="80" rx="5" className="svg-stroke" fill="#D1FAE5" />
                <text x="40" y="-40">Do</text>
                <rect x="0" y="0" width="80" height="80" rx="5" className="svg-stroke" fill="#FEF3C7" />
                <text x="40" y="40">Check</text>
                <rect x="-80" y="0" width="80" height="80" rx="5" className="svg-stroke" fill="#FEE2E2" />
                <text x="-40" y="40">Act</text>
            </g>
        </g>
    </SvgContainer>
);

export const LubricationRegimes = () => (
    <SvgContainer title="Lubrication Regimes (Stribeck Curve)" description="A graph showing friction coefficient based on lubrication regimes." viewBox="0 0 500 280">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Lubrication Regimes (Stribeck Curve)</text>
        <line x1="40" y1="230" x2="480" y2="230" className="svg-stroke-dark" />
        <text x="260" y="250" textAnchor="middle" className="svg-text-light">Viscosity x Speed / Load</text>
        <line x1="40" y1="50" x2="40" y2="230" className="svg-stroke-dark" />
        <text x="20" y="140" textAnchor="middle" transform="rotate(-90 20,140)" className="svg-text-light">Coefficient of Friction</text>
        
        <path d="M 80 180 C 150 80, 250 80, 450 150" stroke="#3B82F6" strokeWidth="3" fill="none" />
        
        <g className="svg-text-bold" fontSize="12" textAnchor="middle">
            <text x="110" y="210">Boundary</text>
            <text x="250" y="210">Mixed Film</text>
            <text x="400" y="210">Hydrodynamic</text>
        </g>
    </SvgContainer>
);

export const GreaseGunDiagram = () => (
    <SvgContainer title="Grease Gun Best Practices" description="A simple diagram showing a grease gun with labels for best practices." viewBox="0 0 400 250">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Grease Gun Best Practices</text>
        <g transform="translate(50, 80)">
            <rect x="50" y="40" width="180" height="40" rx="5" className="svg-stroke" />
            <text x="140" y="65" textAnchor="middle" className="svg-text">Grease Cartridge</text>
            <path d="M 230 60 L 280 60 L 300 80 L 280 100 L 230 100 Z" className="svg-stroke" />
            <rect x="0" y="50" width="50" height="20" rx="3" className="svg-stroke" />
        </g>
        <g className="svg-text" fontSize="12">
            <text x="100" y="70">&bull; Label gun with grease type</text>
            <text x="100" y="150">&bull; Calibrate delivery per stroke</text>
            <text x="100" y="170">&bull; Clean fitting before/after use</text>
        </g>
    </SvgContainer>
);

export const SinglePointLubricator = () => (
    <SvgContainer title="Single-Point Lubricator" description="Diagram of an automatic single-point lubricator." viewBox="0 0 300 300">
        <text x="150" y="25" textAnchor="middle" className="svg-text-heading">Single-Point Lubricator</text>
        <g transform="translate(100, 80)">
            <rect x="0" y="0" width="100" height="150" rx="10" className="svg-stroke" fill="#DBEAFE" />
            <rect x="10" y="10" width="80" height="100" fill="#3B82F6" />
            <text x="50" y="65" textAnchor="middle" fill="white">Lubricant</text>
            <rect x="25" y="120" width="50" height="20" className="svg-stroke" />
            <text x="50" y="135" textAnchor="middle" fontSize="10">Gas Cell</text>
            <rect x="40" y="150" width="20" height="30" className="svg-stroke" />
        </g>
    </SvgContainer>
);

export const BetaRatioChart = () => (
    <SvgContainer title="Filter Beta Ratio" description="Explaining Beta Ratio for filter efficiency." viewBox="0 0 400 250">
        <text x="200" y="25" textAnchor="middle" className="svg-text-heading">Filter Efficiency (Beta Ratio)</text>
    <text x="200" y="60" textAnchor="middle" className="svg-text-bold">Beta(x) = (Particles &gt; x upstream) / (Particles &gt; x downstream)</text>
        <g className="svg-text" fontSize="12" transform="translate(50, 100)">
            <text x="0" y="20">Beta 200 = 200 upstream / 1 downstream = 99.5% efficient</text>
            <text x="0" y="50">Beta 75 = 75 upstream / 1 downstream = 98.7% efficient</text>
            <text x="0" y="80">Beta 2 = 2 upstream / 1 downstream = 50% efficient</text>
        </g>
    </SvgContainer>
);

export const LubeStorageDiagram = () => (
    <SvgContainer title="Lubricant Storage Best Practices" description="Diagram of proper drum and tote storage." viewBox="0 0 500 250">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Lubricant Storage & Handling</text>
        <g transform="translate(50, 80)">
            <rect x="0" y="20" width="150" height="150" rx="5" className="svg-stroke" fill="#D1FAE5" />
            <text x="75" y="90" textAnchor="middle" className="svg-text-bold">Lube Room</text>
            <text x="75" y="110" textAnchor="middle" fontSize="10">(Clean, Climate-controlled)</text>
        </g>
        <g transform="translate(250, 100)" className="svg-text">
            <text>&bull; FIFO (First-In, First-Out)</text>
            <text y="30">&bull; Sealed, dedicated containers</text>
            <text y="60">&bull; Clear labels</text>
            <text y="90">&bull; Desiccant breathers</text>
        </g>
    </SvgContainer>
);

export const OilAnalysisReport = () => (
    <SvgContainer title="Oil Analysis Report Summary" description="A simplified oil analysis report showing key areas." viewBox="0 0 500 300">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Interpreting an Oil Analysis Report</text>
        <g transform="translate(30, 60)" fontSize="12">
            <rect x="0" y="0" width="140" height="180" className="svg-stroke" fill="#DBEAFE"/>
            <text x="70" y="20" textAnchor="middle" className="svg-text-bold">Wear Metals</text>
            <text x="10" y="50">Iron (Fe): 150 ppm &#x2191;</text>
            <text x="10" y="70">Copper (Cu): 25 ppm</text>
            <text x="10" y="90">Lead (Pb): 5 ppm</text>
            <text x="70" y="150" textAnchor="middle" fill="red" fontWeight="bold">BEARING WEAR</text>

            <rect x="150" y="0" width="140" height="180" className="svg-stroke" fill="#FEF3C7"/>
            <text x="220" y="20" textAnchor="middle" className="svg-text-bold">Contamination</text>
            <text x="160" y="50">Silicon (Si): 40 ppm &#x2191;</text>
            <text x="160" y="70">Water (H2O): 0.2% &#x2191;</text>
            <text x="160" y="90">Particle Count: 22/19/16</text>
            <text x="220" y="150" textAnchor="middle" fill="red" fontWeight="bold">DIRT & WATER INGRESS</text>

            <rect x="300" y="0" width="140" height="180" className="svg-stroke" fill="#D1FAE5"/>
            <text x="370" y="20" textAnchor="middle" className="svg-text-bold">Fluid Properties</text>
            <text x="310" y="50">Viscosity @ 40C: 55 cSt &#x2193;</text>
            <text x="310" y="70">Acid Number: 1.5</text>
            <text x="310" y="90">Oxidation: 10%</text>
            <text x="370" y="150" textAnchor="middle" fill="red" fontWeight="bold">WRONG OIL / DEGRADED</text>
        </g>
    </SvgContainer>
);

export const ProbabilityImpactMatrix = () => (
    <SvgContainer title="Probability and Impact Matrix" description="A grid for prioritizing risks based on their probability and impact." viewBox="0 0 500 400">
        <text x="250" y="25" textAnchor="middle" className="svg-text-heading">Probability & Impact Matrix</text>
        <g className="svg-text-light" fontSize="12" textAnchor="middle">
            <text x="270" y="385">Impact &rarr;</text>
            <text x="35" y="210" transform="rotate(-90 35,210)">Probability &rarr;</text>
        </g>
        <g transform="translate(80, 50)" className="svg-text" textAnchor="middle">
            {/* Colors: g=green, y=yellow, o=orange, r=red */}
            {['#D1FAE5', '#FEF3C7', '#FEF3C7', '#FEE2E2'].map((c, i) => <rect key={i} x={i*70} y={0} width="70" height="70" fill={c} className="svg-stroke" />)}
            {['#D1FAE5', '#FEF3C7', '#FEE2E2', '#FEE2E2'].map((c, i) => <rect key={i} x={i*70} y={70} width="70" height="70" fill={c} className="svg-stroke" />)}
            {['#FEF3C7', '#FEE2E2', '#FCA5A5', '#FCA5A5'].map((c, i) => <rect key={i} x={i*70} y={140} width="70" height="70" fill={c} className="svg-stroke" />)}
            {['#FEE2E2', '#FCA5A5', '#FCA5A5', '#EF4444'].map((c, i) => <rect key={i} x={i*70} y={210} width="70" height="70" fill={c} className="svg-stroke" />)}

            <text x="175" y="180" className="svg-text-bold" fill="#B91C1C">High Risk</text>
            <text x="105" y="110" className="svg-text-bold" fill="#D97706">Med Risk</text>
            <text x="35" y="40" className="svg-text-bold" fill="#059669">Low Risk</text>
        </g>
    </SvgContainer>
);

export const EmvEquation = () => (
    <EquationContainer title="Expected Monetary Value (EMV)" description="Quantifies risk by multiplying its probability by its financial impact.">
        EMV = Probability (%) &times; Impact ($)
    </EquationContainer>
);