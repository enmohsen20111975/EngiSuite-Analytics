import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    { id: 1, domain: "Fundamentals", q: "What is MTBF?", a: "Mean Time Between Failures. The average operating time between failures for a repairable item." },
    { id: 2, domain: "Fundamentals", q: "What is MTTF?", a: "Mean Time To Failure. The average operating time until failure for a non-repairable item." },
    { id: 3, domain: "Fundamentals", q: "What is MTTR?", a: "Mean Time To Repair. The average time required to repair a failed item. A measure of maintainability." },
    { id: 4, domain: "Fundamentals", q: "What is Availability?", a: "The probability that a system is operational when needed. A = MTBF / (MTBF + MTTR)." },
    { id: 5, domain: "Modeling", q: "What is the failure rate (λ)?", a: "The number of failures per unit of time. For a constant rate, λ = 1 / MTBF." },
    { id: 6, domain: "Modeling", q: "What does the Weibull Beta (β) parameter tell you?", a: "The failure mode. β < 1 is infant mortality, β ≈ 1 is random, β > 1 is wear-out." },
    { id: 7, domain: "Modeling", q: "What does the Weibull Eta (η) parameter represent?", a: "The characteristic life. The time at which 63.2% of the population will have failed." },
    { id: 8, domain: "Modeling", q: "What is an RBD?", a: "Reliability Block Diagram. A graphical tool to model how component reliability contributes to system reliability." },
    { id: 9, domain: "Failure Analysis", q: "What is FMEA?", a: "Failure Modes and Effects Analysis. A bottom-up, inductive risk analysis tool." },
    { id: 10, domain: "Failure Analysis", q: "What is FTA?", a: "Fault Tree Analysis. A top-down, deductive analysis tool that starts with a failure event." },
    { id: 11, domain: "DfR", q: "What is DfR?", a: "Design for Reliability. A proactive process of engineering reliability into a product from the beginning." },
    { id: 12, domain: "DfR", q: "What is Derating?", a: "Operating a component at less than its maximum rated stress to improve its reliability and lifespan." },
    { id: 13, domain: "DfR", q: "What is HALT?", a: "Highly Accelerated Life Testing. A test-to-fail methodology used to discover design weaknesses." },
    { id: 14, domain: "Failure Analysis", q: "What does RPN stand for?", a: "Risk Priority Number. A score used in FMEA to prioritize risks (Severity x Occurrence x Detection)." },
    { id: 15, domain: "Fundamentals", q: "What are the three phases of the Bathtub Curve?", a: "Infant Mortality, Useful Life, and Wear-Out." }
];

export const flashcardsModule: Lesson = {
    id: 'cre-flashcards',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: [
        "Memorize key acronyms, definitions, and formulas for the CRE exam.",
        "Quickly test your recall of essential reliability concepts.",
        "Use active recall to improve long-term memory of CRE topics."
    ],
    flashcards: flashcards,
};
