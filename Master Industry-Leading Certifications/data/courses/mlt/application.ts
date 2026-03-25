import type { Lesson } from '../../types';

export const application: Lesson = { 
    id: 'mlt-2', 
    title: 'Lubricant Application', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Understand the importance of applying the right amount of lubricant.",
        "Identify best practices for manual lubrication with grease guns.",
        "Describe the function of automatic single-point lubricators.",
        "Recognize advanced application methods like oil mist systems."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Right Amount, The Right Way</h3><p>Effective lubrication isn't just about using the right lubricant; it's also about applying it correctly. Both over-lubrication and under-lubrication can cause premature machine failure. This lesson covers the common methods for applying lubricants to machinery.</p>"
        },
        {
            type: 'text',
            body: "<h3>Manual Lubrication: The Grease Gun</h3><p>The grease gun is the most common tool for manual lubrication, but it is also frequently misused. Over-greasing can blow out bearing seals, while under-greasing leads to starvation and wear. Best practices are essential for reliability.</p>"
        },
        {
            type: 'visual',
            component: 'GreaseGunDiagram'
        },
        {
            type: 'text',
            body: "<ul><li><strong>Calibrate:</strong> Know how much grease is delivered with each 'shot' or stroke of the gun.</li><li><strong>Calculate:</strong> Determine the correct re-lubrication volume and frequency for each bearing.</li><li><strong>Clean:</strong> Always clean the grease fitting and the gun nozzle before application to prevent injecting contaminants.</li></ul>"
        },
        {
            type: 'text',
            body: "<h3>Automatic Lubrication Systems</h3><p>To improve precision and reduce labor, automatic systems are often used. <strong>Single-Point Lubricators (SPLs)</strong> are self-contained units that automatically dispense a small, precise amount of grease or oil to a single lubrication point over a set period of time (e.g., 1, 3, 6, or 12 months). They are excellent for hard-to-reach or critical components.</p>"
        },
        {
            type: 'visual',
            component: 'SinglePointLubricator'
        },
        {
            type: 'text',
            body: "<p>More advanced systems include <strong>Centralized Lubrication Systems</strong> that feed multiple points from a single reservoir, and <strong>Oil Mist Systems</strong> that deliver a fine aerosol of oil to lubricate many components in a process area, providing lubrication, cooling, and contamination control simultaneously.</p>"
        },
        {
            type: 'quiz',
            question: "Blowing out a bearing seal by applying too much grease with a grease gun is an example of:",
            options: [
                "Under-lubrication",
                "Contamination",
                "Over-lubrication",
                "Correct procedure"
            ],
            correctAnswerIndex: 2,
            explanation: "Over-lubrication is a common failure mode. The excessive pressure from a grease gun can rupture bearing seals, which not only damages the seal but also creates an entry point for contaminants."
        }
    ]
};