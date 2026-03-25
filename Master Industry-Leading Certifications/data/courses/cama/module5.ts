import type { Lesson } from '../../types';

export const module5: Lesson = {
    id: 'cama-5',
    title: 'Module 5: Operation',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Plan and control operational processes to align with the SAMP.",
        "Select and apply appropriate maintenance strategies (PM, PdM, RCM).",
        "Implement a structured Management of Change (MoC) process.",
        "Develop and test emergency preparedness and response plans."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Operational Planning and Control</h2>
            <p>This is where AM strategies become reality. ISO 55001 requires organizations to plan, implement, and control operational processes, from work identification and planning to execution and closeout. This also includes managing outsourced processes through contracts and Service Level Agreements (SLAs).</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Asset Operation and Maintenance</h2>
            <p>This chapter focuses on the strategies used to ensure assets deliver their intended performance. The key is to select the right mix of maintenance approaches:</p>
            <ul>
                <li><strong>Preventive Maintenance (PM):</strong> Time-based or usage-based tasks.</li>
                <li><strong>Predictive Maintenance (PdM):</strong> Condition-based tasks triggered by monitoring.</li>
                <li><strong>Reliability-Centered Maintenance (RCM):</strong> A structured process to determine the optimal strategy for each failure mode.</li>
            </ul>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Change Management in Operations</h2>
            <p><strong>Management of Change (MoC)</strong> ensures that operational modifications (e.g., new technology, updated procedures) do not create new risks. A structured MoC process includes impact assessment, approval, implementation, and review, and is critical for safety and reliability.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Emergency Preparedness and Response</h2>
            <p>Operational resilience requires preparing for emergencies. This includes risk identification, scenario planning, training, and drills. A documented Emergency Response Plan (ERP) is crucial for protecting safety, the environment, and asset performance during incidents.</p>
            <h3>Case Study: Nuclear Power Plant - Japan</h3>
            <p>A nuclear facility in a high seismic zone developed a comprehensive ERP with multiple contingencies for earthquakes. Regular drills and system upgrades improved their readiness and enhanced regulator confidence.</p>`
        },
        {
            type: 'quiz',
            question: "Which maintenance approach is based on condition monitoring?",
            options: ["Preventive", "Predictive", "RCM", "Run-to-failure"],
            correctAnswerIndex: 1,
            explanation: "Predictive Maintenance (PdM) uses data from condition monitoring techniques (like vibration analysis, oil analysis, or thermography) to predict when a failure is likely to occur, allowing maintenance to be scheduled just in time."
        },
        {
            type: 'quiz',
            question: "What is the primary purpose of Management of Change (MoC) in operations?",
            options: [
                "To control and assess risks from operational changes",
                "To forecast demand",
                "To manage financial budgets",
                "To monitor customer satisfaction"
            ],
            correctAnswerIndex: 0,
            explanation: "MoC is a formal process used to ensure that any changes to equipment, processes, or procedures are reviewed for potential risks and impacts on safety and reliability before they are implemented."
        }
    ]
};
