import type { Lesson } from '../../types';

export const dmaic3: Lesson = { 
    id: 'lss-3', 
    title: 'Phase 3: Analyze', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Identify potential root causes of a problem using brainstorming and fishbone diagrams.",
        "Use a Pareto Chart to prioritize the most significant causes.",
        "Analyze process data graphically using histograms and scatter plots.",
        "Formulate a hypothesis about the root cause that can be tested."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Getting to the Root Cause</h3><p>The <strong>Analyze</strong> phase is where the project team transitions from understanding the problem's symptoms to identifying its root causes. This phase is about drilling down into the data collected in the Measure phase to find the 'vital few' inputs (the X's) that are causing the undesirable output (the Y). Simply fixing symptoms will not lead to sustainable improvement.</p>"
        },
        {
            type: 'text',
            body: "<h3>Graphical Analysis Tools</h3><h4>Pareto Chart (The 80/20 Rule)</h4><p>The Pareto principle states that for many events, roughly 80% of the effects come from 20% of the causes. A <strong>Pareto Chart</strong> is a combined bar and line graph that helps a team identify and prioritize the most significant problems or causes. By focusing improvement efforts on the 'vital few' causes, the team can achieve the greatest impact with limited resources.</p>"
        },
        {
            type: 'visual',
            component: 'ParetoChart'
        },
        {
            type: 'text',
            body: "<h4>Fishbone Diagram (Cause and Effect)</h4><p>While the Pareto chart shows *what* the biggest problems are, the <strong>Fishbone Diagram</strong> helps explore *why* they are happening. It's a structured brainstorming tool used to organize potential causes into categories (e.g., Manpower, Machine, Method, Material, Measurement, Environment) to ensure a comprehensive analysis.</p>"
        },
        {
            type: 'visual',
            component: 'FishboneDiagram'
        },
        {
            type: 'text',
            body: "<h4>Other Tools</h4><ul><li><strong>Histogram:</strong> A bar chart that shows the frequency distribution of data, helping to visualize its shape, center, and spread.</li><li><strong>Scatter Plot:</strong> A graph that plots pairs of data to see if a relationship exists between two variables (correlation).</li></ul><p>By the end of this phase, the team should have a data-backed hypothesis about the true root cause(s) of the problem, which will then be addressed in the Improve phase.</p>"
        },
        {
            type: 'quiz',
            question: "Your team has identified 15 different reasons for shipping delays. Which tool should you use FIRST to identify the 'vital few' causes that account for most of the delays?",
            options: [
                "Control Chart",
                "Fishbone Diagram",
                "Pareto Chart",
                "Scatter Plot"
            ],
            correctAnswerIndex: 2,
            explanation: "The Pareto Chart is specifically designed to prioritize causes by their frequency or impact, allowing a team to focus on the 20% of causes that are creating 80% of the problem. It is the best first step for prioritizing a long list of potential causes."
        },
        {
            type: 'quiz',
            question: "A team is trying to understand all the potential reasons a machine is producing oversized parts. They want to brainstorm ideas and organize them into categories like 'Machine,' 'Operator,' and 'Material.' Which tool is most appropriate?",
            options: [
                "Pareto Chart",
                "Control Chart",
                "Scatter Plot",
                "Fishbone Diagram"
            ],
            correctAnswerIndex: 3,
            explanation: "The Fishbone (or Ishikawa) Diagram is a brainstorming tool perfect for this scenario. It helps teams explore a wide range of potential causes for a problem and visually organizes them into logical categories."
        }
    ]
};
