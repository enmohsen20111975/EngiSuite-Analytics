import type { Lesson } from '../../types';

export const domain3: Lesson = {
    id: 'pmp-3', 
    title: 'Domain 3: Business Environment', 
    prompt: 'Generate a detailed study module for the PMP exam covering the "Business Environment" domain. Structure the content for beginner, intermediate, and advanced levels. Discuss the link between projects and organizational strategy, benefits realization, organizational change, and the impact of organizational structures. Include learning objectives, detailed quizzes, and the BenefitsFlowchart visual.',
    objectives: [
        "Explain the strategic relationship between projects, programs, and portfolios.",
        "Define the purpose of a Benefits Management Plan in ensuring value is delivered after the project ends.",
        "Understand the project manager's role in supporting organizational change to ensure project adoption.",
        "Analyze how different organizational structures (e.g., matrix, projectized) affect a project."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>The <strong>Business Environment</strong> domain (8% of the exam) connects the project to the wider organization. Projects are not executed in a vacuum; they are initiated to deliver value and achieve strategic goals. A successful project is not just one that finishes on time and on budget, but one that delivers the intended business value. There is a hierarchy for strategic alignment:</p><ul><li><strong>Portfolio:</strong> A collection of projects and programs managed together to achieve strategic objectives.</li><li><strong>Program:</strong> A group of related projects managed in a coordinated way to obtain benefits not available from managing them individually.</li><li><strong>Project:</strong> A temporary endeavor undertaken to create a unique product, service, or result.</li></ul>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Ensuring Value and Adoption</h4><p>The focus on value is formalized in a <strong>Benefits Management Plan</strong>. This document outlines the project's intended benefits, how they will be measured, and who is responsible for realizing them—which often happens long after the project team disbands. It shifts the focus from project outputs (the 'what,' e.g., a new CRM system) to business outcomes (the 'why,' e.g., a 10% increase in sales). A project manager must facilitate <strong>Organizational Change Management</strong> activities (like communication and training) to ensure the project's output is actually adopted and used, allowing the benefits to be realized.</p>"
        },
        {
            type: 'visual',
            component: 'BenefitsFlowchart'
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Navigating Organizational Structures</h4><p>The structure of an organization has a significant impact on a project and the PM's authority. Common structures include:</p><ul><li><strong>Functional:</strong> Staff are grouped by specialty (e.g., engineering, marketing). The PM has very little authority.</li><li><strong>Matrix (Weak, Balanced, or Strong):</strong> A blend where team members report to both a functional manager and a project manager. The PM's authority increases from weak to strong matrix.</li><li><strong>Projectized (or Project-Oriented):</strong> The organization is structured around projects. The PM has high to near-total authority, and the project team is often co-located and dedicated to the project.</li></ul><p>An effective PM must understand the structure they are working in and adapt their influencing and communication strategies accordingly. In a functional organization, a PM relies heavily on relationship building and influencing, whereas in a projectized structure, they have more direct authority.</p>"
        },
        {
            type: 'quiz',
            question: "A project to implement a new software system is completed on time and budget, but six months later, employees are still using old workarounds and the expected productivity gains have not been achieved. This indicates a failure in which area?",
            options: [
                "Procurement management",
                "Benefits realization and organizational change management",
                "Cost management",
                "Scope management"
            ],
            correctAnswerIndex: 1,
            explanation: "The project delivered the technical output but failed to deliver the business value. This is a classic failure in benefits realization, likely caused by poor organizational change management (e.g., lack of training, communication, and stakeholder buy-in) to ensure the new system was adopted and used effectively."
        },
        {
            type: 'quiz',
            question: "You are managing a project where team members are assigned to you from different departments and report to both you and their functional manager. You have moderate authority and must frequently negotiate with functional managers for resources. What type of organizational structure are you likely in?",
            options: [
                "Functional",
                "Projectized",
                "Balanced or Strong Matrix",
                "Hierarchical"
            ],
            correctAnswerIndex: 2,
            explanation: "This scenario is the definition of a matrix organization. The shared reporting structure and the need for the PM to negotiate for resources are hallmarks of this structure. Moderate to high authority suggests a balanced or strong matrix."
        }
    ]
};