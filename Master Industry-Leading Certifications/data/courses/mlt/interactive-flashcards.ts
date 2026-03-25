import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    { id: 1, domain: "Fundamentals", q: "What is Viscosity?", a: "A fluid's resistance to flow. The most important property of a lubricant." },
    { id: 2, domain: "Fundamentals", q: "What is Hydrodynamic Lubrication?", a: "The ideal lubrication regime where a full fluid film separates moving surfaces, preventing contact." },
    { id: 3, domain: "Fundamentals", q: "What is an Additive?", a: "A chemical compound added to a base oil to enhance its properties (e.g., anti-wear, anti-rust)." },
    { id: 4, domain: "Contamination", q: "What is the #1 cause of lubricant-related failures?", a: "Contamination (by particles and water)." },
    { id: 5, domain: "Contamination", q: "What does the ISO Cleanliness Code (e.g., 18/16/13) measure?", a: "The number and size of solid contaminant particles in a fluid. A lower number is cleaner." },
    { id: 6, domain: "Contamination", q: "What is a desiccant breather?", a: "A device that filters particles and absorbs moisture from air entering a machine." },
    { id: 7, domain: "Fundamentals", q: "What do AW and EP additives do?", a: "Anti-Wear and Extreme Pressure additives protect surfaces during boundary lubrication when metal-to-metal contact occurs." },
    { id: 8, domain: "Application", q: "What does an NLGI grade measure?", a: "The consistency or stiffness of a grease (e.g., NLGI 2 is a common multi-purpose grade)." },
    { id: 9, domain: "Fundamentals", q: "What is Oxidation?", a: "The chemical degradation of oil due to heat and oxygen, leading to sludge, varnish, and increased viscosity." },
    { id: 10, domain: "Analysis", q: "What are the 3 main categories of oil analysis?", a: "Fluid Properties (oil health), Contamination (oil cleanliness), and Wear Debris (machine health)." },
    { id: 11, domain: "Analysis", q: "High Silicon (Si) in an oil sample usually indicates what?", a: "Dirt/dust contamination." },
    { id: 12, domain: "Analysis", q: "What does a rising Acid Number (AN) indicate?", a: "The oil is oxidizing and nearing the end of its useful life." },
    { id: 13, "domain": "Fundamentals", "q": "What is the Viscosity Index (VI)?", "a": "A measure of how much an oil's viscosity changes with temperature. A higher VI is better." },
    { id: 14, "domain": "Application", "q": "Why is it dangerous to mix different greases?", "a": "The thickeners can be incompatible, causing the grease to soften, lose consistency, and leak out of the bearing." },
    { id: 15, "domain": "Contamination", "q": "What does a Beta Ratio (e.g., β10 = 200) tell you about a filter?", "a": "Its capture efficiency. A Beta 200 filter is 99.5% efficient at removing particles of the specified size (10 microns)." }
];

export const flashcardsModule: Lesson = {
    id: 'mlt-flashcards',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: [
        "Memorize key lubrication terms, acronyms, and definitions.",
        "Quickly test your recall of essential concepts for the MLT I exam.",
        "Use active recall to improve long-term memory of lubrication principles."
    ],
    flashcards: flashcards,
};
