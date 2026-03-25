import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
        "id": 1,
        "domain": "Fundamentals",
        "title": "Lubrication Regimes (Stribeck Curve)",
        "summary": "Visualizing the relationship between friction, speed, load, and viscosity.",
        "highlights": [
            "Boundary: High friction, surface contact. Relies on AW/EP additives.",
            "Mixed-Film: Transitional state.",
            "Hydrodynamic: Ideal state. Low friction, full film separation."
        ],
        "image": "https://i.ibb.co/DYYn1tX/film-thickness.png"
    },
    {
        "id": 2,
        "domain": "Fundamentals",
        "title": "ISO Viscosity Grades (ISO 3448)",
        "summary": "The standard system for classifying industrial lubricants by viscosity.",
        "highlights": [
            "Grade (e.g., ISO VG 32, 46, 68) is the midpoint viscosity in centistokes (cSt) at 40°C.",
            "Each grade has a +/- 10% range.",
            "Higher VG number means a thicker oil."
        ],
        "image": "https://i.ibb.co/D80C6sP/viscosity-index.png"
    },
    {
        "id": 3,
        "domain": "Contamination Control",
        "title": "ISO Cleanliness Code (ISO 4406)",
        "summary": "The standard for quantifying particulate contamination in fluids.",
        "highlights": [
            "Three numbers representing particle counts (e.g., 18/16/13).",
            "Numbers correspond to counts of particles >4µm, >6µm, and >14µm.",
            "A lower number is cleaner. Each number drop is a 50% reduction in particles."
        ],
        "image": "https://i.ibb.co/qF4Xg9F/iso-cleanliness-code.png"
    },
    {
        "id": 4,
        "domain": "Oil Analysis",
        "title": "Reading an Oil Analysis Report",
        "summary": "The three key areas to check on a routine oil analysis report.",
        "highlights": [
            "Fluid Properties: Is the oil healthy? (Viscosity, Acid Number).",
            "Contamination: Is the oil clean & dry? (Silicon, Water, Particle Count).",
            "Wear Debris: Is the machine healthy? (Iron, Copper, Lead)."
        ],
        "image": "https://i.ibb.co/2gCqCgK/nhs-digital.png"
    },
    {
        "id": 5,
        "domain": "Application",
        "title": "Grease Thickener Compatibility",
        "summary": "A simplified chart for avoiding catastrophic failures from mixing greases.",
        "highlights": [
            "Compatible: Lithium Complex with Lithium Complex.",
            "Borderline: Lithium Complex with Polyurea (test first).",
            "Incompatible: Polyurea with Calcium Sulfonate (causes softening).",
            "When in doubt, don't mix! Purge the old grease completely."
        ],
        "image": "https://i.ibb.co/hZJ4N3K/grease-quantity.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'mlt-cheatsheets',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: [
        "Quickly reference key lubrication concepts.",
        "Visualize the Stribeck Curve, viscosity grades, and ISO codes.",
        "Reinforce understanding of core MLT I Body of Knowledge topics."
    ],
    cheatsheets: cheatsheets,
};
