import type { Lesson } from '../../types';

export const pillar3: Lesson = { 
    id: 'cmrp-3', 
    title: 'Pillar 3: Equipment Reliability', 
    prompt: 'Generate a detailed lesson on the "Equipment Reliability" pillar for the CMRP certification. Focus on establishing reliability goals, risk management (FMEA/FMECA), the P-F Curve, and selecting appropriate maintenance strategies. Structure for beginner, intermediate, and advanced levels, with examples, quizzes, and visuals like PFCurve, RpnEquation, and MaintenanceStrategyMatrix.',
    moduleType: 'standard',
    objectives: [
        "Explain the purpose of Failure Modes and Effects Analysis (FMEA) in proactive risk management.",
        "Interpret the P-F Curve to understand the progression of equipment failure.",
        "Calculate a Risk Priority Number (RPN) to prioritize failure modes.",
        "Select the appropriate maintenance strategy (Reactive, Preventive, Predictive) based on failure characteristics."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>Equipment Reliability focuses on ensuring that individual assets perform their intended function without failure for a desired period. This pillar moves from a reactive 'fix-it-when-it-breaks' mindset to a proactive approach of preventing failures before they occur. A key tool for this is <strong>Failure Modes and Effects Analysis (FMEA)</strong>. FMEA is a step-by-step approach for identifying all possible ways an asset can fail (failure modes) and studying the consequences (effects) of those failures.</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>The P-F Curve and Predictive Maintenance</h4><p>The <strong>P-F Curve</strong> is a fundamental concept that visualizes how equipment failures develop over time. It shows that a failure doesn't happen instantly; it starts with a detectable condition (Point P - Potential Failure) and degrades over time until it can no longer perform its function (Point F - Functional Failure). The time between P and F is called the P-F Interval.</p>"
        },
        {
            type: 'visual',
            component: 'PFCurve'
        },
        {
            type: 'text',
            body: "<p>The P-F Interval is the window of opportunity for <strong>Predictive Maintenance (PdM)</strong>. By using condition monitoring technologies (like vibration analysis, oil analysis, or infrared thermography), we can detect the 'P' point and plan maintenance before the 'F' point occurs, avoiding catastrophic failure and unplanned downtime.</p><h4>Quantifying Risk with RPN</h4><p>In an FMEA, after identifying failure modes, we quantify their risk using a <strong>Risk Priority Number (RPN)</strong>. This helps prioritize which failure modes to address first.</p>"
        },
        {
            type: 'visual',
            component: 'RpnEquation'
        },
        {
            type: 'text',
            body: "<p>Each factor (Severity, Occurrence, Detection) is typically rated on a scale of 1 to 10. The higher the RPN, the higher the risk, and the more urgent the need for a mitigating action.</p>"
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Selecting the Right Maintenance Strategy</h4><p>Not all failures are equal, and not all equipment requires the same level of attention. A mature reliability program uses a mix of strategies tailored to the equipment's criticality and failure characteristics. The main strategies fall on a spectrum from reactive to proactive.</p>"
        },
        {
            type: 'visual',
            component: 'MaintenanceStrategyMatrix'
        },
        {
            type: 'text',
            body: "<ul><li><strong>Reactive (Run-to-Failure):</strong> Appropriate for non-critical, inexpensive, or easily replaceable equipment where the consequence of failure is low.</li><li><strong>Preventive (Time-Based):</strong> Performing maintenance at pre-determined intervals (time or usage). Effective for failures that have a clear wear-out pattern.</li><li><strong>Predictive (Condition-Based):</strong> Using condition monitoring to perform maintenance only when needed, as indicated by the P-F curve. Most efficient for critical, complex equipment.</li></ul><p>The ultimate goal is to apply the most cost-effective strategy that ensures the equipment meets its reliability goals.</p>"
        },
        {
            type: 'quiz',
            question: "A failure mode on a critical fan has the following FMEA scores: Severity = 9 (Catastrophic), Occurrence = 3 (Unlikely), and Detection = 8 (Very difficult to detect). What is the RPN?",
            options: ["20", "216", "24", "10"],
            correctAnswerIndex: 1,
            explanation: "The Risk Priority Number (RPN) is calculated by multiplying the three scores: RPN = Severity × Occurrence × Detection. Therefore, RPN = 9 × 3 × 8 = 216. This high RPN indicates a significant risk that needs to be addressed."
        },
        {
            type: 'quiz',
            question: "Vibration analysis detects a bearing fault in a critical pump, allowing maintenance to be scheduled before the pump fails completely. This is an example of which maintenance strategy?",
            options: ["Reactive Maintenance", "Preventive Maintenance", "Predictive Maintenance", "Corrective Maintenance"],
            correctAnswerIndex: 2,
            explanation: "Predictive Maintenance (PdM) uses condition-monitoring techniques like vibration analysis to detect the onset of a failure (the 'P' point on the P-F curve) and predict when maintenance is needed. This is a condition-based approach, not a time-based (Preventive) one."
        }
    ]
};