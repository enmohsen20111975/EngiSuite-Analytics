import type { Lesson } from '../../types';

export const dmaic5: Lesson = { 
    id: 'lss-5', 
    title: 'Phase 5: Control', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Develop a Control Plan to sustain the project gains.",
        "Use Statistical Process Control (SPC) charts to monitor process performance.",
        "Document the new process through standard operating procedures (SOPs).",
        "Formally close the project and hand over the new process to the process owner."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Sustaining the Gains for the Long Term</h3><p>The <strong>Control</strong> phase is the final and arguably most critical phase of the DMAIC process. After all the hard work of improving the process, the goal here is to ensure that the improvements are sustained over the long term. This phase is about locking in the success, establishing a system for ongoing monitoring, and formally closing out the project.</p>"
        },
        {
            type: 'text',
            body: "<h3>The Control Plan and SPC</h3><p>The primary tool of this phase is the <strong>Control Plan</strong>. This is a living document that details how the improved process will be monitored to ensure it remains in a state of control. It is the recipe for sustaining the gains. A comprehensive Control Plan includes:</p><ul><li>The key process and output metrics (the 'vital few' Xs and Y) that will be tracked.</li><li>The measurement methods and frequency.</li><li>The acceptable range of performance (control limits).</li><li>A clear <strong>Reaction Plan</strong> specifying what to do if the process goes out of control.</li></ul><p><strong>Statistical Process Control (SPC) Charts</strong> are the most common tool used to execute the Control Plan. A control chart is a run chart with statistically calculated upper and lower control limits. It helps distinguish between 'common cause' variation (the normal noise in a stable process) and 'special cause' variation (an unexpected event that needs investigation).</p>"
        },
        {
            type: 'visual',
            component: 'ControlChart'
        },
        {
            type: 'text',
            body: "<h3>Standardization and Project Closure</h3><h4>Locking in the New Process</h4><p>To ensure consistency, the new, improved process must be formally documented and institutionalized. This is achieved through:</p><ul><li>Updating <strong>Standard Operating Procedures (SOPs)</strong> and work instructions.</li><li>Providing training to all employees involved in the new process.</li><li>Communicating the changes and their benefits across the organization.</li></ul><h4>Closing the Loop</h4><p>Finally, the project is formally closed. This is a critical step that involves:</p><ol><li><strong>Validating the financial impact:</strong> Working with the finance department to confirm the project's actual cost savings or revenue gains.</li><li><strong>Documenting lessons learned:</strong> Capturing what went well and what could be improved for future projects.</li><li><strong>Handover to the Process Owner:</strong> Officially transferring ownership of the new process and the control plan to the person responsible for its ongoing performance.</li><li><strong>Celebrating success:</strong> Recognizing the team's hard work to build momentum for a culture of continuous improvement.</li></ol>"
        },
        {
            type: 'visual',
            component: 'PdcaCycle'
        },
        {
            type: 'quiz',
            question: "On an SPC chart, a single data point falls outside the upper control limit. What does this signify?",
            options: [
                "The process is stable and predictable.",
                "This is common cause variation that should be ignored.",
                "A special cause variation has occurred, and the reaction plan should be followed.",
                "The control limits need to be recalculated immediately."
            ],
            correctAnswerIndex: 2,
            explanation: "A point outside the control limits is the clearest signal of special cause variation. It indicates that something unusual has affected the process, and it requires investigation according to the pre-defined Reaction Plan."
        },
        {
            type: 'quiz',
            question: "What is the most important reason for formally closing a DMAIC project?",
            options: [
                "To allow the Green Belt to start a new project.",
                "To ensure accountability for sustaining the gains is transferred to a process owner.",
                "To have a final team party.",
                "To stop collecting data."
            ],
            correctAnswerIndex: 1,
            explanation: "Formal closure and handover are critical. A project team is temporary, but the process is permanent. Transferring ownership to a process owner with a clear control plan is the only way to ensure the improvements last."
        }
    ]
};
