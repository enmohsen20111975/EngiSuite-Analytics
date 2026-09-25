import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    { id: 1, domain: "Core Concepts", q: "What is the purpose of ISO 55000?", a: "Provides an overview, principles, and terminology for Asset Management." },
    { id: 2, domain: "Core Concepts", q: "What is the purpose of ISO 55001?", a: "Specifies the requirements for an Asset Management System (AMS)." },
    { id: 3, domain: "Core Concepts", q: "What is the purpose of ISO 55002?", a: "Provides guidance for the application of ISO 55001." },
    { id: 4, domain: "Planning", q: "What is a SAMP?", a: "Strategic Asset Management Plan: a document that links organizational objectives to asset management objectives." },
    { id: 5, domain: "Planning", q: "What is an AM Plan?", a: "Asset Management Plan: a tactical plan detailing the activities, resources, and timescales for managing a specific asset or asset group." },
    { id: 6, domain: "Core Concepts", q: "What is the 'Line of Sight'?", a: "The clear alignment from the organization's strategic objectives down to the daily activities performed on assets." },
    { id: 7, domain: "Leadership", q: "What is the AM Policy?", a: "A high-level document from top management stating the principles and intent for the organization's asset management." },
    { id: 8, domain: "Risk", q: "What are the two axes of a risk matrix?", a: "Likelihood (or Probability) and Consequence (or Impact)." },
    { id: 9, domain: "Performance", q: "What is the PDCA cycle?", a: "Plan-Do-Check-Act: the iterative methodology for continual improvement." },
    { id: 10, domain: "Support", q: "What is 'Competence' in the context of ISO 55001?", a: "The ability to apply knowledge and skills to achieve intended results, ensured through training, skills, and experience." },
    { id: 11, domain: "Operation", q: "What is Management of Change (MoC)?", a: "A formal process to identify and control risks associated with any changes to assets, processes, or the AMS." },
    { id: 12, domain: "Performance", q: "What is a Management Review?", a: "A formal, periodic review by top management to ensure the AMS is suitable, adequate, and effective." },
    { id: 13, domain: "Improvement", q: "What is a Corrective Action?", a: "An action to eliminate the root cause of a detected non-conformity to prevent its recurrence." },
    { id: 14, domain: "Improvement", q: "What is a Preventive Action?", a: "An action to eliminate the cause of a potential non-conformity to prevent it from occurring." },
    { id: 15, domain: "Planning", q: "What is Life Cycle Costing (LCC)?", a: "A methodology to assess the total cost of an asset over its life, including acquisition, operation, maintenance, and disposal." }
];

export const flashcardsModule: Lesson = {
    id: 'cama-flashcards',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: [
        "Memorize key terms, acronyms, and definitions from the ISO 5500x series.",
        "Quickly test your recall of essential asset management concepts.",
        "Use active recall to improve long-term memory of the CAMA syllabus."
    ],
    flashcards: flashcards,
};
