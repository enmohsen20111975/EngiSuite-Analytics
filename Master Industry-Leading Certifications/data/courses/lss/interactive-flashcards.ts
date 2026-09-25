import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    { id: 1, domain: "Core Concepts", q: "What does DMAIC stand for?", a: "Define, Measure, Analyze, Improve, Control." },
    { id: 2, domain: "Define", q: "What is VOC?", a: "Voice of the Customer. The needs and expectations of the customer." },
    { id: 3, domain: "Define", q: "What is a CTQ?", a: "Critical to Quality. A measurable characteristic that is critical to satisfying the customer." },
    { id: 4, domain: "Define", q: "What is a SIPOC?", a: "A high-level process map: Suppliers, Inputs, Process, Outputs, Customers." },
    { id: 5, domain: "Measure", q: "What does Cpk measure?", a: "Process Capability Index. How well a process is centered and capable of meeting specifications. A Cpk < 1 means defects are being made." },
    { id: 6, domain: "Measure", q: "What is the difference between discrete and continuous data?", a: "Discrete data is counted (e.g., # of defects). Continuous data is measured (e.g., time, length)." },
    { id: 7, domain: "Analyze", q: "What is the 80/20 Rule?", a: "The Pareto Principle. 80% of problems are often due to 20% of the causes." },
    { id: 8, domain: "Analyze", q: "What is a Fishbone Diagram used for?", a: "Brainstorming and categorizing the potential root causes of a problem." },
    { id: 9, domain: "Core Concepts", q: "What are the 8 Wastes?", a: "Defects, Overproduction, Waiting, Non-Utilized Talent, Transportation, Inventory, Motion, Extra-Processing (DOWNTIME)." },
    { id: 10, domain: "Improve", q: "What is Poka-Yoke?", a: "Mistake-proofing. Designing a process to make errors impossible or immediately obvious." },
    { id: 11, domain: "Improve", q: "What is 5S?", a: "A workplace organization method: Sort, Set in Order, Shine, Standardize, Sustain." },
    { id: 12, domain: "Control", q: "What is a Control Plan?", a: "A document detailing how to monitor a process to sustain improvements, including a reaction plan." },
    { id: 13, domain: "Control", q: "What does a Control Chart show?", a: "Process performance over time, distinguishing between common cause and special cause variation." },
    { id: 14, domain: "Core Concepts", q: "What is DPMO?", a: "Defects Per Million Opportunities. A standard measure of process quality. 3.4 DPMO is Six Sigma." },
    { id: 15, domain: "Core Concepts", q: "What is Kaizen?", a: "A philosophy of continuous, incremental improvement involving all employees." }
];

export const flashcardsModule: Lesson = {
    id: 'lss-flashcards',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: [
        "Memorize key Lean Six Sigma acronyms, definitions, and concepts.",
        "Quickly test your recall of the DMAIC phases and their key tools.",
        "Use active recall to improve long-term memory for certification."
    ],
    flashcards: flashcards,
};
