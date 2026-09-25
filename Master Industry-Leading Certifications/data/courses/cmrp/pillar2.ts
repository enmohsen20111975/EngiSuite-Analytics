import type { Lesson } from '../../types';

export const pillar2: Lesson = { 
    id: 'cmrp-2', 
    title: 'Pillar 2: Manufacturing Process Reliability', 
    prompt: 'Generate a detailed lesson on the "Manufacturing Process Reliability" pillar for the CMRP certification. Explain OEE and its components, the Six Big Losses, and the application of RCA. Structure for beginner, intermediate, and advanced levels, with examples, quizzes, and visuals like OeeChart, SixBigLossesDiagram, and FishboneDiagram.',
    moduleType: 'standard',
    objectives: [
        "Understand and calculate Overall Equipment Effectiveness (OEE) and its three core components.",
        "Identify and categorize the Six Big Losses that degrade manufacturing performance.",
        "Apply basic Root Cause Analysis (RCA) techniques to investigate process and equipment failures.",
        "Explain how process reliability directly impacts business goals like capacity and product quality."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>Manufacturing Process Reliability focuses on ensuring the entire production process is stable, predictable, and capable of meeting its goals. It looks beyond individual machines to see how the system as a whole performs. The gold standard for measuring this performance is <strong>Overall Equipment Effectiveness (OEE)</strong>.</p><p>OEE synthesizes the three most important sources of manufacturing loss into a single number:</p><ul><li><strong>Availability:</strong> Losses due to downtime (e.g., breakdowns, setup time).</li><li><strong>Performance:</strong> Losses due to running at less than the ideal speed (e.g., minor stops, reduced speed).</li><li><strong>Quality:</strong> Losses due to producing defective parts (e.g., scrap, rework).</li></ul>"
        },
        {
            type: 'visual',
            component: 'OeeChart'
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>The Six Big Losses</h4><p>The OEE components are directly linked to the <strong>Six Big Losses</strong>, which provide a more detailed framework for understanding and categorizing production inefficiencies. By identifying which of these losses are most significant, teams can focus their improvement efforts where they will have the greatest impact.</p>"
        },
        {
            type: 'visual',
            component: 'SixBigLossesDiagram'
        },
        {
            type: 'text',
            body: "<p>The Six Big Losses are:</p><ol><li><strong>Breakdowns (Availability Loss):</strong> Major, unplanned equipment failures.</li><li><strong>Setup and Adjustments (Availability Loss):</strong> Time lost changing over between products or making adjustments.</li><li><strong>Minor Stoppages (Performance Loss):</strong> Short stops that don't require maintenance to fix.</li><li><strong>Reduced Speed (Performance Loss):</strong> Equipment running slower than its designed speed.</li><li><strong>Startup Rejects (Quality Loss):</strong> Defective products made during warmup or startup.</li><li><strong>Production Rejects (Quality Loss):</strong> Defective products made during steady-state production.</li></ol>"
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Root Cause Analysis (RCA)</h4><p>When a process failure occurs, it's not enough to just fix the immediate problem. To prevent recurrence, we must understand the underlying cause. <strong>Root Cause Analysis (RCA)</strong> is a structured problem-solving approach to identify the fundamental reasons for a failure. Common RCA tools include:</p><ul><li><strong>5 Whys:</strong> A simple technique of repeatedly asking 'Why?' to peel back layers of symptoms and find the root cause.</li><li><strong>Fishbone (Ishikawa) Diagram:</strong> A visual tool that helps brainstorm and categorize potential causes of a problem into groups like Manpower, Method, Machine, Material, Measurement, and Environment.</li></ul>"
        },
        {
            type: 'visual',
            component: 'FishboneDiagram'
        },
        {
            type: 'quiz',
            question: "A bottling line is designed to run at 200 bottles per minute but is consistently run at 180 bottles per minute to avoid jams. This inefficiency would be categorized under which of the Six Big Losses?",
            options: [
                "Breakdowns",
                "Setup and Adjustments",
                "Reduced Speed",
                "Production Rejects"
            ],
            correctAnswerIndex: 2,
            explanation: "Running equipment at a speed lower than its designed or ideal capacity is a classic example of a Reduced Speed loss, which is a type of Performance loss in the OEE calculation."
        },
        {
            type: 'quiz',
            question: "A team is investigating why a pump has failed repeatedly. They create a diagram to brainstorm all potential causes related to the machine itself, the installation method, the materials being pumped, and operator practices. Which RCA tool are they using?",
            options: [
                "5 Whys",
                "Pareto Chart",
                "Fishbone Diagram",
                "Fault Tree Analysis"
            ],
            correctAnswerIndex: 2,
            explanation: "The Fishbone (or Ishikawa) Diagram is specifically designed for brainstorming and categorizing a wide range of potential causes for a problem, making it the correct tool for this scenario."
        }
    ]
};