import type { Lesson } from '../../types';

export const domain2: Lesson = {
    id: 'pmp-2', 
    title: 'Domain 2: Process', 
    prompt: 'Generate a detailed study module for the PMP exam covering the "Process" domain. Structure the content for beginner, intermediate, and advanced levels. Differentiate predictive and adaptive life cycles, and cover key processes like WBS for scope, Critical Path for schedule, EVM for budget/performance, and risk management. Include learning objectives, multiple examples, detailed quizzes, and the CriticalPathDiagram, CpiEquation, and SpiEquation visuals.',
    objectives: [
        "Differentiate between predictive (waterfall) and adaptive (agile) project life cycles and when to use each.",
        "Decompose project scope into manageable work packages using a Work Breakdown Structure (WBS).",
        "Identify the Critical Path to determine the shortest project duration and understand float.",
        "Evaluate project performance using Earned Value Management (EVM) metrics like CPI and SPI, and forecast future performance."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>The <strong>Process</strong> domain (50% of the exam) covers the technical mechanics of managing a project. A fundamental choice is the project life cycle. The two main types are:</p><ul><li><strong>Predictive (Waterfall):</strong> Used when the project scope, time, and cost are well-understood upfront. It follows a linear sequence of phases (e.g., Requirements, Design, Build, Test, Deploy). Change is generally discouraged.</li><li><strong>Adaptive (Agile):</strong> Used when requirements are uncertain and are expected to change. Work is done in short, iterative cycles (sprints), allowing for rapid feedback and adaptation. Change is embraced.</li></ul><p>A core concept in predictive planning is the 'triple constraint' or 'iron triangle', which shows the interrelationship between Scope, Schedule, and Cost. A change in one constraint will impact at least one of the others.</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>The Core Processes</h4><p>In predictive projects, several key processes are used:</p><ul><li><strong>Scope Management:</strong> The <strong>Work Breakdown Structure (WBS)</strong> is used to decompose the total scope into small, manageable work packages. This ensures all work is captured.</li><li><strong>Schedule Management:</strong> The <strong>Critical Path Method (CPM)</strong> is used to determine the longest sequence of tasks through the project, which defines the shortest possible project duration. Tasks on the critical path have zero 'float' or 'slack'.</li></ul>"
        },
        {
            type: 'visual',
            component: 'CriticalPathDiagram'
        },
        {
            type: 'text',
            body: "<p><strong>Cost & Performance Management:</strong> <strong>Earned Value Management (EVM)</strong> integrates scope, schedule, and cost to provide an objective measure of performance. Key metrics include:</p>"
        },
        {
            type: 'visual',
            component: 'CpiEquation'
        },
        {
            type: 'visual',
            component: 'SpiEquation'
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Forecasting and Tailoring</h4><p>EVM goes beyond just reporting current status; it allows for forecasting. The most common forecast is the <strong>Estimate At Completion (EAC)</strong>, which predicts the total project cost based on performance to date. A simple formula is EAC = BAC / CPI (Budget At Completion / Cost Performance Index). This gives a data-driven prediction of the final cost, allowing for proactive budget management.</p><p>A key advanced skill is <strong>tailoring</strong>. This means that a PM does not rigidly apply every process from the PMBOK® Guide to every project. Instead, they intelligently select and adapt the appropriate processes, tools, and techniques based on the project's specific context, size, and complexity. This might involve creating a <strong>hybrid model</strong> that combines elements of both predictive and adaptive approaches.</p>"
        },
        {
            type: 'quiz',
            question: "A task on the critical path is delayed by three days. What is the impact on the project's end date?",
            options: [
                "There is no impact, because other tasks have float.",
                "The project end date will be delayed by one to three days.",
                "The project end date will be delayed by exactly three days.",
                "The project will finish three days early."
            ],
            correctAnswerIndex: 2,
            explanation: "By definition, the critical path has zero float. Any delay on a task on this path will cause a direct, one-for-one delay to the overall project completion date."
        },
        {
            type: 'quiz',
            question: "A project has a Budget At Completion (BAC) of $100,000. After some work, the Earned Value (EV) is $20,000 and the Actual Cost (AC) is $25,000. What is the Cost Performance Index (CPI) and what is the forecast for the total project cost (EAC)?",
            options: [
                "CPI is 1.25 (under budget), EAC is $80,000.",
                "CPI is 0.8 (over budget), EAC is $125,000.",
                "CPI is 0.8 (over budget), EAC is $100,000.",
                "CPI is 1.25 (under budget), EAC is $125,000."
            ],
            correctAnswerIndex: 1,
            explanation: "CPI = EV / AC = $20,000 / $25,000 = 0.8. Since CPI is less than 1, the project is over budget. The Estimate At Completion (EAC) can be forecast as BAC / CPI = $100,000 / 0.8 = $125,000. This projects the final cost to be $125,000 if the current cost performance continues."
        }
    ]
};