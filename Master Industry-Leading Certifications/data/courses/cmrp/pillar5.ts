import type { Lesson } from '../../types';

export const pillar5: Lesson = {
    id: 'cmrp-5',
    title: 'Pillar 5: Work Management',
    prompt: 'Generate a detailed lesson on the "Work Management" pillar for the CMRP certification. Cover the full work management cycle from identification to closure, the roles of planners and schedulers, and KPIs like Wrench Time and Schedule Compliance. Structure for beginner, intermediate, and advanced levels, with examples, quizzes, and visuals like WorkManagementCycle and WrenchTimeChart.',
    moduleType: 'standard',
    objectives: [
        "Describe the stages of the maintenance work management cycle.",
        "Differentiate between the roles of a maintenance planner and a scheduler.",
        "Define 'Wrench Time' and identify common barriers to its improvement.",
        "Understand key work management KPIs such as Schedule Compliance and Backlog."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>Work Management is the pillar that translates reliability strategies into action. It's a disciplined process for ensuring that the <strong>right work</strong> is done on the <strong>right asset</strong> at the <strong>right time</strong> with the <strong>right resources</strong>. The process is a continuous cycle designed to control and optimize maintenance activities.</p>"
        },
        {
            type: 'visual',
            component: 'WorkManagementCycle'
        },
        {
            type: 'text',
            body: "<p>The basic flow is:</p><ol><li><strong>Work Identification:</strong> A potential issue is found and a work request is created.</li><li><strong>Prioritization:</strong> The work is assessed for its urgency and importance.</li><li><strong>Planning:</strong> The 'what' and 'how.' A planner defines the scope, parts, tools, and instructions for the job.</li><li><strong>Scheduling:</strong> The 'who' and 'when.' A scheduler allocates resources and assigns a time for the job to be done.</li><li><strong>Execution:</strong> The technician performs the work as planned.</li><li><strong>Closure & Feedback:</strong> The work order is closed, and feedback on what was found, parts used, and time taken is recorded in the CMMS. This data is vital for continuous improvement.</li></ol>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Planning vs. Scheduling</h4><p>A common point of confusion is the difference between planning and scheduling. A simple way to remember is: <strong>A planner prepares for the future, a scheduler prepares for tomorrow.</strong></p><ul><li><strong>Planner:</strong> Focuses on creating high-quality job plans. They ensure that when a job is ready to be scheduled, all necessary parts, tools, permits, and procedures are identified and available. This maximizes efficiency.</li><li><strong>Scheduler:</strong> Focuses on allocating available labor and coordinating with operations to get work done with minimal disruption. They build the weekly and daily work schedules.</li></ul><p>Separating these roles allows each person to specialize and become more effective, leading to a more proactive and efficient maintenance organization.</p>"
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Measuring Efficiency: Wrench Time</h4><p><strong>Wrench Time</strong> is a powerful KPI that measures the percentage of a technician's day that is spent performing direct, hands-on work. It is a measure of workforce efficiency, not technician effort. In a typical reactive environment, wrench time can be as low as 25-35%.</p>"
        },
        {
            type: 'visual',
            component: 'WrenchTimeChart'
        },
        {
            type: 'text',
            body: "<p>The goal of a good work management process, especially planning and scheduling, is to remove the common delays that reduce wrench time, such as waiting for parts, waiting for instructions, obtaining permits, or traveling to the job site. World-class organizations achieve wrench times of 50-60% by minimizing these delays through proactive planning.</p><h4>Other Key KPIs</h4><ul><li><strong>Schedule Compliance:</strong> The percentage of scheduled jobs completed in a given week. A high compliance (>90%) indicates a stable, disciplined process.</li><li><strong>Backlog:</strong> The total amount of identified maintenance work (planned and unplanned) that has not yet been completed, typically measured in crew-weeks. A healthy backlog is typically 2-4 weeks.</li></ul>"
        },
        {
            type: 'quiz',
            question: "A technician spends 3 hours of their 8-hour shift waiting for a spare part to be delivered from the storeroom. This lost time would directly lower which work management KPI?",
            options: ["Backlog", "PM Compliance", "Schedule Compliance", "Wrench Time"],
            correctAnswerIndex: 3,
            explanation: "Wrench Time measures the proportion of time a technician spends performing hands-on work. Waiting for parts is a common delay that reduces wrench time and overall workforce efficiency. Effective planning is meant to prevent this."
        },
        {
            type: 'quiz',
            question: "The person responsible for defining the job scope, required materials, and step-by-step procedures for a future maintenance task is the:",
            options: ["Maintenance Supervisor", "Scheduler", "Planner", "Technician"],
            correctAnswerIndex: 2,
            explanation: "The Planner's role is to prepare future work by figuring out the 'what' and 'how' of a job. They create a complete job package so that when the job is scheduled, the technician has everything they need to execute it efficiently."
        }
    ]
};