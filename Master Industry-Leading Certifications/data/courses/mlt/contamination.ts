import type { Lesson } from '../../types';

export const contamination: Lesson = { 
    id: 'mlt-3', 
    title: 'Contamination Control', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Identify the primary types of lubricant contaminants (particles, water, heat).",
        "Understand filter efficiency ratings, including the Beta Ratio.",
        "Explain the function of desiccant breathers on equipment.",
        "Describe best practices for lubricant storage and handling to prevent contamination."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Enemy of Lubrication</h3><p>Contamination is the number one cause of lubrication-related failures. A lubricant can only perform its functions if it is clean, cool, and dry. Contamination control is a proactive strategy to exclude contaminants from machinery and remove any that do get in.</p><p>The three main enemies are:</p><ul><li><strong>Particles:</strong> Dirt, dust, and wear debris act like liquid sandpaper, causing abrasive wear.</li><li><strong>Water:</strong> Promotes rust and corrosion, and can deplete certain additives.</li><li><strong>Heat:</strong> Accelerates lubricant oxidation, shortening its life and creating sludge and varnish.</li></ul>"
        },
        {
            type: 'text',
            body: "<h3>Exclusion and Removal</h3><h4>Filtration and Beta Ratio</h4><p><strong>Filtration</strong> is the primary method for removing solid particles from a lubricant. The efficiency of a filter is measured by its <strong>Beta Ratio</strong>. It tells you how effective the filter is at removing particles of a certain size.</p>"
        },
        {
            type: 'visual',
            component: 'BetaRatioChart'
        },
        {
            type: 'text',
            body: "<h4>Desiccant Breathers</h4><p>As machinery breathes due to thermal expansion and contraction, it can draw in moist, dirty air. A <strong>desiccant breather</strong> replaces a standard breather cap. It filters out particles and uses a desiccant (like silica gel) to strip moisture from the incoming air, keeping the lubricant clean and dry.</p>"
        },
        {
            type: 'text',
            body: "<h3>Storage and Handling</h3><p>Contamination control starts before the lubricant ever reaches the machine. Proper storage and handling are critical. The goal is to ensure lubricants are delivered to the machine as clean as, or cleaner than, they were from the supplier.</p>"
        },
        {
            type: 'visual',
            component: 'LubeStorageDiagram'
        },
        {
            type: 'quiz',
            question: "A filter has a Beta Ratio of B(10) = 75. What does this mean?",
            options: [
                "It removes 75% of all particles.",
                "It allows 75 particles of size 10 micron and larger to pass through.",
                "For every 75 particles of 10 microns or larger upstream, 1 will pass through downstream.",
                "The filter is 7.5% efficient."
            ],
            correctAnswerIndex: 2,
            explanation: "A Beta Ratio of 75 at a given micron size (in this case, 10) means that the ratio of upstream particles to downstream particles is 75:1. This corresponds to a capture efficiency of 98.7% for particles 10 microns and larger."
        }
    ]
};