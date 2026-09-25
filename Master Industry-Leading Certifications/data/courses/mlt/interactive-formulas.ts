import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Lubricant Application",
      "title": "Grease Quantity Formula",
      "formula": "G (grams) = 0.005 × D × B",
      "description": "A common formula to estimate the correct grease volume for a bearing, where D is the outside diameter (mm) and B is the width (mm).",
      "example": "A bearing with D=100mm and B=20mm needs G = 0.005 * 100 * 20 = 10 grams of grease for a full relube.",
      "image": "https://i.ibb.co/hZJ4N3K/grease-quantity.png"
    },
    {
      "id": 2,
      "domain": "Contamination Control",
      "title": "ISO Cleanliness Code",
      "formula": "ISO 4406: R4 / R6 / R14",
      "description": "Represents particle counts at >4, >6, and >14 microns. Each number corresponds to a range. A lower number is cleaner.",
      "example": "A code of 18/16/13 is much cleaner than a code of 22/20/17.",
      "image": "https://i.ibb.co/qF4Xg9F/iso-cleanliness-code.png"
    },
    {
      "id": 3,
      "domain": "Lubricant Properties",
      "title": "Viscosity Index (VI)",
      "formula": "VI = (L - U) / (L - H) × 100",
      "description": "A dimensionless number that measures how much an oil's viscosity changes with temperature. A higher VI means less change (more stable).",
      "example": "Synthetic oils typically have a higher Viscosity Index than mineral oils, making them better for wide temperature ranges.",
      "image": "https://i.ibb.co/D80C6sP/viscosity-index.png"
    },
    {
      "id": 4,
      "domain": "Lubrication Regimes",
      "title": "Film Thickness (Lambda Ratio)",
      "formula": "Λ = h / σ",
      "description": "The ratio of the lubricant film thickness (h) to the composite surface roughness (σ). Λ > 3 indicates full hydrodynamic lubrication.",
      "example": "If the calculated film thickness is 3 microns and the surface roughness is 0.5 microns, Λ = 6, indicating excellent separation.",
      "image": "https://i.ibb.co/DYYn1tX/film-thickness.png"
    }
];

export const formulasModule: Lesson = {
    id: 'mlt-6',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Understand calculations for grease quantities.", "Learn to interpret the ISO Cleanliness Code.", "Review concepts like Viscosity Index and film thickness."],
    formulas: formulas,
};