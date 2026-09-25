import type { Lesson } from '../../types';

export const fundamentals: Lesson = { 
    id: 'mlt-1', 
    title: 'Lubrication Fundamentals', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "List the primary functions of a lubricant.",
        "Define viscosity and explain its importance in machine reliability.",
        "Describe the three main lubrication regimes.",
        "Differentiate between mineral and synthetic base oils and common additives."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Functions of a Lubricant</h3><p>Proper lubrication is the lifeblood of machinery. While most people think lubricants only reduce friction, they perform many critical functions:</p><ul><li><strong>Reduce Friction & Wear:</strong> The primary function, creating a film between moving surfaces.</li><li><strong>Transfer Heat:</strong> Lubricants carry heat away from critical zones like bearings.</li><li><strong>Contamination Control:</strong> Lubricants suspend and transport contaminants to filters.</li><li><strong>Corrosion Prevention:</strong> Lubricants form a protective barrier on metal surfaces.</li><li><strong>Transmit Power:</strong> As seen in hydraulic systems.</li></ul>"
        },
        {
            type: 'text',
            body: "<h3>Viscosity: The Most Important Property</h3><p><strong>Viscosity</strong> is a fluid's resistance to flow. It is the single most important physical property of a lubricant. An oil that is too thin (low viscosity) won't provide an adequate protective film, leading to wear. An oil that is too thick (high viscosity) will cause excessive friction and heat. Selecting the correct viscosity for the application, speed, and temperature is critical for machine life.</p>"
        },
        {
            type: 'text',
            body: "<h3>Lubrication Regimes</h3><p>The effectiveness of lubrication is described by three regimes, often visualized on a Stribeck Curve. The regime is determined by the relationship between the lubricant's viscosity, the relative speed of the surfaces, and the load applied.</p>"
        },
        {
            type: 'visual',
            component: 'LubricationRegimes'
        },
        {
            type: 'text',
            body: "<ul><li><strong>Boundary Lubrication:</strong> Occurs at low speeds and high loads. There is frequent surface-to-surface contact. Protection relies on anti-wear additives.</li><li><strong>Mixed-Film Lubrication:</strong> A transitional phase where part of the load is supported by the lubricant film and part by surface contact.</li><li><strong>Hydrodynamic Lubrication:</strong> The ideal state. At high speeds and low loads, a full, thick fluid film separates the surfaces completely, preventing any contact and minimizing wear.</li></ul>"
        },
        {
            type: 'text',
            body: "<h3>Base Oils and Additives</h3><p>Modern lubricants are composed of two main components:</p><ul><li><strong>Base Oils (~80-99%):</strong> This is the bulk of the fluid. They can be <strong>mineral</strong> (refined from crude oil) or <strong>synthetic</strong> (man-made). Synthetics offer superior performance at extreme temperatures but at a higher cost.</li><li><strong>Additives (~1-20%):</strong> These are chemical compounds added to the base oil to enhance its properties or impart new ones. Common additives include anti-wear (AW) agents, rust and oxidation (R&O) inhibitors, viscosity index (VI) improvers, and detergents.</li></ul><p>The tools used to apply these lubricants, such as the grease gun, are also fundamental to good practice.</p>"
        },
        {
            type: 'visual',
            component: 'GreaseGunDiagram'
        },
        {
            type: 'quiz',
            question: "What is the single most important physical property of a lubricant?",
            options: [
                "Color",
                "Smell",
                "Viscosity",
                "Price"
            ],
            correctAnswerIndex: 2,
            explanation: "Viscosity is the most critical property. It determines the lubricant's ability to form a protective film between surfaces. Using the wrong viscosity is a leading cause of lubrication-related failures."
        }
    ]
};