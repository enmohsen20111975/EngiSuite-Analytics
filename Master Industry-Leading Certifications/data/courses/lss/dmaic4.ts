import type { Lesson } from '../../types';

export const dmaic4: Lesson = { 
    id: 'lss-4', 
    title: 'Phase 4: Improve', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Use brainstorming techniques to generate potential solutions for the identified root causes.",
        "Select the best solution using a structured decision-making tool like a Pugh Matrix.",
        "Assess the risks of the proposed solution using FMEA.",
        "Plan and execute a pilot test to validate the solution's effectiveness."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Developing and Selecting Solutions</h3><p>After identifying and verifying the root cause(s) in the Analyze phase, the <strong>Improve</strong> phase focuses on developing, testing, and implementing solutions to fix the problem. This is the creative phase where the team transitions from analysis to action. The goal is to eliminate or control the root causes to achieve the project's goal statement.</p><h4>Brainstorming Solutions</h4><p>The first step is to generate a wide range of potential solutions through structured <strong>brainstorming</strong>. Techniques like round-robin brainstorming or affinity diagrams can be used to encourage creative thinking. It's critical to focus on solutions that directly address the validated root causes, not just the symptoms. At this stage, no idea is a bad idea; the goal is to generate a comprehensive list of possibilities.</p>"
        },
        {
            type: 'text',
            body: "<h3>The Pugh Matrix: Data-Driven Decision Making</h3><p>Once the team has a list of potential solutions, they need a structured way to select the best one. A <strong>Pugh Matrix</strong>, or solution selection matrix, is a powerful tool for this. It allows the team to evaluate multiple solution options against a set of weighted criteria, providing a more objective outcome than simple voting.</p><p>The process involves:</p><ol><li>Establishing a 'baseline' (often the current process).</li><li>Defining key selection criteria (e.g., Cost, Effectiveness, Time to Implement, Risk).</li><li>Scoring each proposed solution against the baseline for each criterion (+ for better, - for worse, 0 for same).</li><li>Calculating a total score to identify the most promising solution(s).</li></ol>"
        },
        {
            type: 'visual',
            component: 'PughMatrix'
        },
        {
            type: 'text',
            body: "<h3>Risk Assessment and Piloting the Solution</h3><h4>Assessing Solution Risk with FMEA</h4><p>Before implementing a change, it's crucial to consider what might go wrong. A <strong>Failure Modes and Effects Analysis (FMEA)</strong> can be applied to the proposed new process. This helps the team proactively identify potential failure modes of the solution, assess their risk, and develop mitigation plans to ensure the 'fix' doesn't create new problems.</p><h4>Validating with a Pilot Test</h4><p>Before a full-scale rollout, it's best practice to test the chosen solution on a smaller scale through a <strong>pilot test</strong>. The pilot has several critical purposes:</p><ul><li>To confirm that the solution actually works in the real world and achieves the desired results.</li><li>To identify any unintended consequences or implementation challenges.</li><li>To refine the solution and the implementation plan based on real-world feedback.</li><li>To collect data to statistically validate that the improvement is significant.</li></ul><p>A successful pilot provides the data and confidence needed to proceed with a full implementation, ensuring resources are used effectively and the project delivers on its promise.</p>"
        },
        {
            type: 'quiz',
            question: "What is the primary goal of a pilot test in the Improve phase?",
            options: [
                "To select the best solution from a list of options.",
                "To brainstorm new ideas for the project.",
                "To validate that the chosen solution works and identify potential issues before full implementation.",
                "To create the final control plan."
            ],
            correctAnswerIndex: 2,
            explanation: "A pilot is a small-scale test run of the chosen solution. Its purpose is to confirm the solution's effectiveness in a real-world environment and uncover any problems before committing the resources for a full-scale rollout."
        },
        {
            type: 'quiz',
            question: "Your team has brainstormed five potential solutions. To objectively decide which one is best based on criteria like cost and effectiveness, which tool should you use?",
            options: ["Fishbone Diagram", "Pugh Matrix", "SIPOC", "Control Chart"],
            correctAnswerIndex: 1,
            explanation: "A Pugh Matrix (or Solution Selection Matrix) is specifically designed for this purpose. It provides a structured format for comparing multiple options against a consistent set of criteria to facilitate a data-driven decision."
        }
    ]
};
