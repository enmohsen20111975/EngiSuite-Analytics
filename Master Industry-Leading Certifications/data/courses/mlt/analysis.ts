import type { Lesson } from '../../types';

export const analysis: Lesson = { 
    id: 'mlt-4', 
    title: 'Oil Analysis for Machine Health', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Explain the three main goals of oil analysis: fluid properties, contamination, and wear debris.",
        "Identify common oil analysis tests like viscosity, particle count, and elemental spectroscopy.",
        "Interpret a basic oil analysis report to identify potential machine health issues.",
        "Understand the importance of proper oil sampling techniques."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Listening to the Machine</h3><p><strong>Oil analysis</strong> is the practice of systematically sampling and analyzing a lubricant to determine the health of both the oil and the machine it's lubricating. It is a powerful predictive and proactive maintenance tool, acting like a 'blood test' for machinery. A single sample can provide a wealth of information about wear, contamination, and fluid chemistry.</p>"
        },
        {
            type: 'text',
            body: "<h3>The Three Categories of Oil Analysis</h3><p>An oil analysis report typically focuses on three key areas:</p><ol><li><strong>Fluid Properties:</strong> Is the lubricant healthy? This looks at properties like viscosity (is it the right oil?), acid number (is the oil degrading?), and additive levels.</li><li><strong>Contamination:</strong> Is the lubricant clean and dry? This looks for contaminants like silicon (dirt), water, and coolant.</li><li><strong>Wear Debris:</strong> Is the machine healthy? This uses elemental spectroscopy to look for microscopic metal particles (like iron, copper, lead) that indicate which components are wearing.</li></ol>"
        },
        {
            type: 'visual',
            component: 'OilAnalysisReport'
        },
        {
            type: 'text',
            body: "<h3>Proper Sampling is Key</h3><p>The results of an oil analysis are only as good as the sample taken. A bad sample can lead to false alarms or missed failures. Proper sampling requires:</p><ul><li><strong>Consistency:</strong> Taking the sample from the same location each time.</li><li><strong>Cleanliness:</strong> Using clean sample bottles and tools to avoid cross-contamination.</li><li><strong>Information:</strong> Labeling the sample correctly with the equipment ID, lubricant type, and date.</li></ul><p>The best practice is to take samples from live, active zones of fluid while the machine is running, and to use dedicated sampling valves for consistency and safety.</p>"
        },
        {
            type: 'quiz',
            question: "An oil analysis report shows a high level of silicon (Si) and a high particle count. What is the most likely problem?",
            options: [
                "The oil has oxidized and needs to be changed.",
                "A bearing is beginning to fail.",
                "There is a coolant leak into the oil.",
                "Dirt is entering the system, likely through a faulty breather or seal."
            ],
            correctAnswerIndex: 3,
            explanation: "Silicon is the primary elemental signature for dirt and sand. A high silicon level, combined with a high particle count, is a classic indicator that external contamination is entering the lubricant system, which will cause abrasive wear."
        }
    ]
};