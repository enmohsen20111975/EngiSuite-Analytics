import type { Lesson } from '../../types';

export const module4: Lesson = {
    id: 'cama-4',
    title: 'Module 4: Support',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Determine the resources and competencies required to support the AMS.",
        "Develop effective communication plans to build AM awareness.",
        "Understand the importance of information management and data quality.",
        "Establish processes for controlling documented information."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Resources and Competence</h2>
            <p>An AMS cannot function without adequate resources (financial, technological, human) and competent people. Competence involves the necessary skills, experience, and behaviors. Leading organizations use tools like a <strong>Skills Matrix</strong> and the <strong>IAM Competence Framework</strong> to identify and close gaps through targeted training.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Awareness and Communication</h2>
            <p>Employees at all levels must understand the AM policy, objectives, and their role in achieving them. A structured communication plan, tailored to different audiences (e.g., executive dashboards, technician briefings), is essential for building and maintaining this awareness.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Information Management</h2>
            <p>Information is the lifeblood of asset management. ISO 55001 requires processes for managing information to support the AMS. This includes data collection, validation, and analysis, often managed through systems like a <strong>CMMS/EAM</strong>. Poor master data quality is a common and significant challenge.</p>
            <h3>Case Study: Oil & Gas Co. - Middle East</h3>
            <p>An operator with fragmented data across legacy systems consolidated information into a unified EAM. By implementing data governance and a digital twin for real-time monitoring, they improved decision-making and reduced downtime.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Documented Information and Control</h2>
            <p>Documented information (policies, procedures, records) must be controlled to ensure accuracy, accessibility, and security. This involves version control, access management, and retention protocols, often managed through a Document Management System (DMS).</p>`
        },
        {
            type: 'quiz',
            question: "Which framework is widely used to assess and develop workforce competence in asset management?",
            options: ["PESTLE", "IAM Competence Framework", "FMEA", "SWOT"],
            correctAnswerIndex: 1,
            explanation: "The Institute of Asset Management (IAM) Competence Framework is a globally recognized standard used to benchmark and develop the skills and knowledge of AM professionals."
        },
        {
            type: 'quiz',
            question: "What is the primary purpose of CMMS/EAM systems?",
            options: [
                "To design new assets",
                "To manage asset data, maintenance, and reliability information",
                "To handle financial investments",
                "To eliminate stakeholder engagement"
            ],
            correctAnswerIndex: 1,
            explanation: "A Computerized Maintenance Management System (CMMS) or Enterprise Asset Management (EAM) system is the central database for managing all information related to an organization's assets, including work orders, maintenance history, and performance data."
        }
    ]
};
