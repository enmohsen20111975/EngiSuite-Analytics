import type { Lesson } from '../../types';

export const module1: Lesson = {
    id: 'cama-1',
    title: 'Module 1: Context of the Organization',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Align Asset Management (AM) objectives with corporate strategy.",
        "Analyze the internal and external context using tools like SWOT and PESTLE.",
        "Identify and prioritize stakeholders to ensure value delivery.",
        "Define a clear and auditable scope for the Asset Management System (AMS)."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Strategic Alignment of Asset Management</h2>
            <p>Asset Management (AM) is not merely an operational activity; it is a core business discipline. ISO 55000 defines AM as the 'coordinated activity of an organization to realize value from assets.' This means AM should be embedded at the strategic level. When AM is aligned, every decision on asset acquisition, maintenance, renewal, or disposal is tied back to corporate strategy, balancing cost, risk, performance, and sustainability.</p>
            <div class="my-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><img src="https://i.ibb.co/8spCSMW/strategic-alignment.png" alt="Balanced Scorecard for AM" class="w-full bg-white dark:bg-slate-800"></div>
            <h3>Case Study: Transport for London (TfL)</h3>
            <p>TfL adopted an ISO 55000-based AM framework to manage aging infrastructure and rising demand. By aligning their AM policy with corporate safety and reliability targets, they reduced failures, optimized spending, and improved public trust.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Internal and External Context</h2>
            <p>Understanding organizational context is a prerequisite for ISO 55001. <strong>Internal context</strong> includes culture, governance, and workforce competencies. <strong>External context</strong> includes regulatory pressures, market competition, and technological shifts. Tools like SWOT and PESTLE analysis are crucial for this continuous assessment.</p>
            <div class="my-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><img src="https://i.ibb.co/0XjC3vD/context-analysis.png" alt="PESTLE Framework Example" class="w-full bg-white dark:bg-slate-800"></div>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Stakeholders and Value Delivery</h2>
            <p>Stakeholders define what 'value' means in asset management. Regulators expect compliance, customers demand service reliability, and investors seek ROI. Balancing these interests is central to AM. Leading organizations use structured frameworks like the Stakeholder Salience Model (Power, Legitimacy, Urgency) to prioritize engagement.</p>
            <div class="my-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><img src="https://i.ibb.co/tYkL4fC/stakeholder-value.png" alt="Stakeholder Engagement Model" class="w-full bg-white dark:bg-slate-800"></div>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Scope of the Asset Management System</h2>
            <p>The scope of the AMS defines its boundaries: which assets, lifecycle phases, and organizational units are covered. A well-defined scope ensures accountability and audit readiness. For example, a mining company may define its AMS scope as 'fixed production assets across acquisition, operation, maintenance, and disposal stages,' excluding temporary facilities.</p>
            <div class="my-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><img src="https://i.ibb.co/fvr3QZd/scope.png" alt="Defining AMS Boundaries" class="w-full bg-white dark:bg-slate-800"></div>`
        },
        {
            type: 'quiz',
            question: "Which tool is best for analyzing external macro-environmental factors?",
            options: ["SWOT", "PESTLE", "Salience Model", "RACI Matrix"],
            correctAnswerIndex: 1,
            explanation: "PESTLE captures political, economic, social, technological, legal, and environmental factors, making it the ideal tool for analyzing the external macro-environment."
        },
        {
            type: 'quiz',
            question: "Which attributes are used in the Stakeholder Salience Model?",
            options: ["Power, Legitimacy, Urgency", "Cost, Risk, Value", "ROI, OEE, LCC", "Safety, Compliance, ROI"],
            correctAnswerIndex: 0,
            explanation: "Stakeholders are prioritized based on these three attributes: Power (ability to influence), Legitimacy (appropriateness of their claim), and Urgency (time-sensitivity of their claim)."
        }
    ]
};