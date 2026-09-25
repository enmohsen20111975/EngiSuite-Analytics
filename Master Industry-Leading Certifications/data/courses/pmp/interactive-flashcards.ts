import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    { id: 1, domain: "Process", q: "What does CPI stand for?", a: "Cost Performance Index. Formula: EV / AC. Measures cost efficiency." },
    { id: 2, domain: "Process", q: "What does SPI stand for?", a: "Schedule Performance Index. Formula: EV / PV. Measures schedule efficiency." },
    { id: 3, domain: "Process", q: "What is EV?", a: "Earned Value. The value of the work actually completed." },
    { id: 4, domain: "Process", q: "What is PV?", a: "Planned Value. The authorized budget for the scheduled work." },
    { id: 5, domain: "Process", q: "What is AC?", a: "Actual Cost. The total cost actually incurred for the work done." },
    { id: 6, domain: "People", q: "What is a Servant Leader?", a: "A leader who prioritizes serving the team by removing obstacles and providing support." },
    { id: 7, domain: "People", q: "What is the 'Storming' stage of team development?", a: "The stage characterized by conflict and competition as team members find their roles." },
    { id: 8, domain: "People", q: "What is the preferred conflict resolution technique?", a: "Collaborate / Problem-Solve, as it aims for a win-win outcome." },
    { id: 9, domain: "Process", q: "What is the Critical Path?", a: "The longest path in the network diagram, which determines the shortest project duration. It has zero float." },
    { id: 10, domain: "Process", q: "What is a WBS?", a: "Work Breakdown Structure. A hierarchical decomposition of the project scope." },
    { id: 11, domain: "Business Environment", q: "What is a Portfolio?", a: "A collection of projects and programs managed together to achieve strategic business objectives." },
    { id: 12, domain: "Process (Risk)", q: "What is risk mitigation?", a: "A risk response strategy for threats where action is taken to reduce the probability or impact of the risk." },
    { id: 13, domain: "Process (Risk)", q: "What is risk transfer?", a: "A risk response strategy for threats where the impact is shifted to a third party, for example, through insurance." },
    { id: 14, domain: "Process", q: "What is the difference between Crashing and Fast Tracking?", a: "Crashing adds cost to shorten the schedule. Fast Tracking performs tasks in parallel, which adds risk." },
    { id: 15, domain: "Business Environment", q: "In which organizational structure does the PM have the most power?", a: "Projectized." }
];

export const flashcardsModule: Lesson = {
    id: 'pmp-flashcards',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: [
        "Memorize key PMP acronyms, definitions, and formulas.",
        "Quickly test your recall of essential project management concepts across all domains.",
        "Use active recall to improve long-term memory for the PMP exam."
    ],
    flashcards: flashcards,
};
