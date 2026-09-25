import type { Lesson } from '../../types';

export const module7: Lesson = {
    id: 'cama-7',
    title: 'Module 7: Improvement',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Embed a culture of continual improvement using the PDCA cycle.",
        "Implement a structured Corrective and Preventive Action (CAPA) process.",
        "Leverage innovation and technology for transformational improvements.",
        "Establish a system for learning from incidents and near misses."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Continual Improvement</h2>
            <p>Continual improvement is a core principle of ISO 55001. It is an ongoing cycle of learning and optimization, often guided by the <strong>PDCA (Plan-Do-Check-Act)</strong> cycle. Opportunities can arise from audits, KPIs, risk assessments, or stakeholder feedback.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Corrective and Preventive Actions (CAPA)</h2>
            <p>CAPA provides a structured response to problems. <strong>Corrective actions</strong> eliminate the root causes of detected problems. <strong>Preventive actions</strong> address potential problems to prevent them from occurring. Tools like 5 Whys and Fishbone Diagrams are used for root cause investigation.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Innovation and Transformation</h2>
            <p>While continual improvement focuses on incremental gains, innovation involves step-changes. This includes deploying new technologies like digital twins, AI-driven predictive maintenance, or drones for inspections. Innovation requires structured management through pilots, cost-benefit analysis, and risk assessment.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Learning from Incidents and Near Misses</h2>
            <p>A key component of improvement is learning from failures. Incident analysis must go beyond immediate causes to identify systemic weaknesses. Establishing a 'lessons learned' database ensures that knowledge is captured and shared to prevent recurrence and enhance resilience.</p>
            <h3>Case Study: Refinery - Near Miss Learning</h3>
            <p>After repeated near misses from valve failures, a refinery launched a comprehensive investigation program. They created a lessons learned database and revised inspection and procurement standards, which eliminated repeat incidents and improved safety.</p>`
        },
        {
            type: 'quiz',
            question: "Which improvement cycle is fundamental to ISO management systems like ISO 55001?",
            options: ["PDCA", "DMAIC", "Six Sigma", "Kanban"],
            correctAnswerIndex: 0,
            explanation: "The Plan-Do-Check-Act (PDCA) cycle is the foundational methodology for achieving continual improvement in ISO standards."
        },
        {
            type: 'quiz',
            question: "An audit finds a non-conformity. The organization investigates the root cause and implements a change to the process to prevent it from happening again. This is an example of a:",
            options: ["Corrective Action", "Preventive Action", "Risk Assessment", "Management Review"],
            correctAnswerIndex: 0,
            explanation: "A corrective action is taken to eliminate the cause of a detected non-conformity. A preventive action is taken to eliminate the cause of a potential non-conformity."
        }
    ]
};
