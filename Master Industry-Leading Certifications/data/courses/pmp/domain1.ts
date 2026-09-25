import type { Lesson } from '../../types';

export const domain1: Lesson = { 
    id: 'pmp-1', 
    title: 'Domain 1: People', 
    prompt: 'Generate a comprehensive study module for the PMP exam covering the "People" domain. Structure the content for beginner, intermediate, and advanced levels. Cover servant leadership, team development (Tuckman ladder), conflict resolution, stakeholder engagement (Power/Interest grid), and Emotional Intelligence (EQ). Include learning objectives, multiple examples, detailed quiz questions, and the PowerInterestGrid and TuckmanLadder visuals.',
    objectives: [
        "Define the principles of servant leadership and its role in empowering project teams.",
        "Describe the five stages of team development using the Tuckman ladder.",
        "Apply the five main conflict resolution techniques appropriately based on situational context.",
        "Classify stakeholders using a Power/Interest grid and develop engagement strategies.",
        "Understand the components of Emotional Intelligence (EQ) and their importance in project leadership."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>The <strong>People</strong> domain (42% of the exam) emphasizes that a project manager's success hinges on their ability to lead and interact with people. This domain focuses on the 'soft skills' that are essential for guiding teams and managing stakeholder relationships. At the core of modern project management is the concept of a <strong>servant leader</strong>. Unlike a traditional manager who commands and controls, a servant leader's primary goal is to serve the team. They focus on removing obstacles, providing resources, and creating an environment where the team can perform at its best. Their motto is, 'How can I help you succeed?'</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Navigating Team Dynamics and Conflict</h4><p>Teams evolve through predictable stages, as described by the <strong>Tuckman Ladder</strong> model. A project manager's leadership style must adapt to support the team at each stage.</p>"
        },
        {
             type: 'visual',
             component: 'TuckmanLadder'
        },
        {
            type: 'text',
            body: "<p>Conflict is inevitable in projects. The key is to manage it constructively. There are five common techniques:</p><ul><li><strong>Withdraw/Avoid:</strong> Retreating from the conflict. Best for trivial issues.</li><li><strong>Smooth/Accommodate:</strong> Emphasizing agreement over differences. Best to build social credit.</li><li><strong>Compromise/Reconcile:</strong> A lose-lose where both parties give something up. Best for temporary solutions.</li><li><strong>Force/Direct:</strong> A win-lose where one's viewpoint is pushed. Best in emergencies.</li><li><strong>Collaborate/Problem-Solve:</strong> A win-win where parties work together to find a shared solution. This is the preferred method.</li></ul><h4>Stakeholder Engagement</h4><p>Stakeholders are anyone impacted by the project. We use a <strong>Power/Interest Grid</strong> to classify them and determine how to manage them.</p>"
        },
        {
            type: 'visual',
            component: 'PowerInterestGrid'
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Leading with Emotional Intelligence (EQ)</h4><p>Advanced project leadership is rooted in <strong>Emotional Intelligence (EQ)</strong>. This is the ability to understand and manage your own emotions, and to recognize and influence the emotions of others. High EQ allows a project manager to navigate complex political environments, build strong relationships, motivate their team, and make better decisions under pressure. The key components of EQ are:</p><ul><li><strong>Self-Awareness:</strong> Understanding your own emotions and how they affect your thoughts and behavior.</li><li><strong>Self-Management:</strong> The ability to control impulsive feelings and behaviors and adapt to changing circumstances.</li><li><strong>Social Awareness:</strong> Understanding the emotions, needs, and concerns of other people (empathy).</li><li><strong>Relationship Management:</strong> Knowing how to develop and maintain good relationships, communicate clearly, and influence others.</li></ul><p>A PM with high EQ can, for example, sense a stakeholder's unstated anxiety about a project change and address it proactively, preventing it from escalating into a major issue.</p>"
        },
        {
            type: 'quiz',
            question: "You identify a stakeholder with high power but low interest in the project's daily activities. According to the Power/Interest grid, what is the best engagement strategy?",
            options: [
                "Manage Closely (Involve in all details)",
                "Keep Satisfied (Provide high-level updates and ensure needs are met)",
                "Keep Informed (Send regular, detailed reports)",
                "Monitor (Observe their actions with minimal communication)"
            ],
            correctAnswerIndex: 1,
            explanation: "A high-power, low-interest stakeholder (like a senior executive) needs to be kept satisfied. This means meeting their high-level requirements without overwhelming them with details they are not interested in. The goal is to keep them supportive of the project."
        },
        {
            type: 'quiz',
            question: "Two team members are in a heated debate, and you recognize that both have valid points that need to be integrated for the best outcome. Which conflict resolution technique should you facilitate?",
            options: [
                "Smooth/Accommodate",
                "Compromise/Reconcile",
                "Force/Direct",
                "Collaborate/Problem-Solve"
            ],
            correctAnswerIndex: 3,
            explanation: "Collaboration is the ideal approach as it aims for a win-win solution by incorporating multiple viewpoints. It's the most effective way to resolve complex issues and leads to greater commitment from all parties."
        }
    ]
};