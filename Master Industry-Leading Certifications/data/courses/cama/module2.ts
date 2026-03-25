import type { Lesson } from '../../types';

export const module2: Lesson = {
    id: 'cama-2',
    title: 'Module 2: Leadership',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Understand the critical role of top management in championing the AMS.",
        "Identify the key elements of a robust Asset Management Policy.",
        "Define clear governance structures using tools like RACI matrices.",
        "Recognize how leadership shapes an organization's AM culture."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Role of Leadership in Asset Management</h2>
            <p>Leadership is the foundation of effective asset management. ISO 55001 places responsibility for establishing and maintaining the Asset Management System (AMS) on top management. Effective leaders provide vision, allocate resources, and monitor performance. Without their support, AM efforts often become fragmented and ineffective.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Asset Management Policy</h2>
            <p>The AM Policy is a high-level statement from top management defining the intent and principles of the AMS. It must be aligned with the organizational strategy and include commitments to compliance, continual improvement, and risk-based decision-making.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Roles, Responsibilities, and Governance</h2>
            <p>Clear governance ensures that decision-making authority is defined at every level. <strong>RACI matrices</strong> are frequently used to clarify who is Responsible, Accountable, Consulted, and Informed for each AM process, preventing gaps and duplication.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Leadership and Culture</h2>
            <p>Leadership shapes the organizational culture, which influences how decisions are made and risks are perceived. Leaders must champion values of safety, accountability, and continuous improvement, often using change management models like Kotter's 8 steps to drive cultural transformation.</p>
            <h3>Case Study: Rio Tinto Mining</h3>
            <p>Rio Tinto's leadership launched a 'Safe Production' campaign to break down silos between production and maintenance. By integrating AM, safety, and operations through workshops and incentives, they reduced downtime and improved employee engagement.</p>`
        },
        {
            type: 'quiz',
            question: "Which tool clarifies roles and responsibilities in AM processes?",
            options: ["SWOT", "RACI Matrix", "PESTLE", "Pareto Analysis"],
            correctAnswerIndex: 1,
            explanation: "A RACI Matrix is specifically designed to clarify and document roles and responsibilities by defining who is Responsible, Accountable, Consulted, and Informed for tasks and decisions."
        },
        {
            type: 'quiz',
            question: "What happens when leadership fails to support AM?",
            options: [
                "Enhanced integration",
                "Fragmented practices and misaligned priorities",
                "Stronger compliance",
                "Lower capital efficiency"
            ],
            correctAnswerIndex: 1,
            explanation: "Without top-level leadership providing a unified vision and ensuring alignment, different departments (e.g., engineering, finance, operations) will pursue their own conflicting goals, leading to fragmented and inefficient asset management."
        }
    ]
};
