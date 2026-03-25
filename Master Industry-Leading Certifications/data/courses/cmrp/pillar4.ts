import type { Lesson } from '../../types';

export const pillar4: Lesson = { 
    id: 'cmrp-4', 
    title: 'Pillar 4: Organization & Leadership', 
    prompt: 'Generate a detailed lesson on the "Organization & Leadership" pillar for the CMRP certification. Discuss effective organizational structures, personnel management, and fostering a reliability culture. Structure for beginner, intermediate, and advanced levels, with examples, quizzes, and visuals like TuckmanLadder and PowerInterestGrid.',
    moduleType: 'standard',
    objectives: [
        "Describe how leadership and organizational culture impact reliability performance.",
        "Identify the stages of team development using the Tuckman Ladder model.",
        "Analyze stakeholders using the Power/Interest Grid to develop effective engagement strategies.",
        "Explain the pros and cons of different maintenance organization structures (e.g., centralized vs. decentralized)."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>The Organization & Leadership pillar recognizes that reliability is not just a technical challenge; it's a people challenge. A world-class reliability program requires strong leadership, a skilled workforce, and an organizational culture that values and supports reliability principles. <strong>Leadership commitment</strong> is the single most important factor. Leaders must establish a clear vision for reliability, provide the necessary resources, and hold the organization accountable for performance.</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Developing Teams and Managing Stakeholders</h4><p>Effective teams are built, not born. The <strong>Tuckman Ladder</strong> is a model that describes the typical stages a team goes through as it develops. A good leader understands these stages and adapts their style to help the team move towards high performance.</p>"
        },
        {
            type: 'visual',
            component: 'TuckmanLadder'
        },
        {
            type: 'text',
            body: "<p>Reliability initiatives impact many people across the organization. These <strong>stakeholders</strong> (e.g., operators, engineers, finance, management) must be managed effectively. The <strong>Power/Interest Grid</strong> is a simple tool for categorizing stakeholders and deciding how to engage with them.</p>"
        },
        {
            type: 'visual',
            component: 'PowerInterestGrid'
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Fostering a Reliability Culture</h4><p>A true <strong>reliability culture</strong> exists when everyone in the organization, from top leadership to the shop floor, takes ownership of reliability. It's a shift from 'maintenance is responsible for reliability' to 'everyone is responsible for reliability.' This requires:</p><ul><li><strong>Clear Communication:</strong> Consistently sharing the vision, goals, and results of reliability initiatives.</li><li><strong>Cross-Functional Collaboration:</strong> Breaking down silos between departments like maintenance, operations, and engineering.</li><li><strong>Empowerment:</strong> Giving employees the training, tools, and authority to make reliability-focused decisions in their daily work.</li><li><strong>Recognition and Reinforcement:</strong> Celebrating successes and reinforcing desired behaviors.</li></ul><h4>Organizational Structure</h4><p>The structure of the maintenance organization also plays a key role. A <strong>centralized</strong> structure can be efficient and standardized, while a <strong>decentralized</strong> structure embedded within operations can be more responsive. Many organizations use a hybrid or <strong>matrix</strong> structure to get the best of both worlds.</p>"
        },
        {
            type: 'quiz',
            question: "A project team has just formed. The members are polite, but there is uncertainty about roles and goals, and they are heavily dependent on the leader for direction. Which stage of the Tuckman Ladder is this team in?",
            options: ["Norming", "Storming", "Performing", "Forming"],
            correctAnswerIndex: 3,
            explanation: "The Forming stage is characterized by dependence on the leader, ambiguity about roles, and a focus on getting acquainted. The leader's role here is to provide clear direction and establish objectives."
        },
        {
            type: 'quiz',
            question: "You need to implement a new lubrication program that will require operators to perform daily checks. The plant manager has the authority to approve the resources but is not involved in the details. According to the Power/Interest Grid, how should you manage this stakeholder?",
            options: ["Manage Closely", "Keep Satisfied", "Keep Informed", "Monitor"],
            correctAnswerIndex: 1,
            explanation: "The plant manager is a high-power, low-interest stakeholder. The correct strategy is to 'Keep Satisfied' by providing high-level updates, ensuring their requirements are met, and getting their approval, without overwhelming them with unnecessary details."
        }
    ]
};