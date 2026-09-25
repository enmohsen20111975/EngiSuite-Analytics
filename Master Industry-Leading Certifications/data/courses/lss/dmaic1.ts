import type { Lesson } from '../../types';

export const dmaic1: Lesson = { 
    id: 'lss-1', 
    title: 'Phase 1: Define', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Understand the core principles of Lean and Six Sigma.",
        "Develop a comprehensive Project Charter.",
        "Translate customer needs into measurable requirements using Voice of the Customer (VOC) techniques.",
        "Create a high-level process map (SIPOC)."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Introduction to Lean Six Sigma</h3><p>Lean Six Sigma is a powerful methodology that combines two continuous improvement approaches: <strong>Lean</strong>, which focuses on eliminating waste and increasing process speed, and <strong>Six Sigma</strong>, which focuses on reducing process variation and eliminating defects. The goal is to make processes better, faster, and more efficient.</p><p>The methodology follows a structured five-phase framework called <strong>DMAIC</strong>: Define, Measure, Analyze, Improve, and Control.</p>"
        },
        {
            type: 'text',
            body: "<h3>The Project Charter</h3><p>The <strong>Define</strong> phase is where the project's foundation is laid. The most important document created here is the <strong>Project Charter</strong>. It's a formal document that authorizes the project and outlines its key parameters. A good charter includes:</p><ul><li><strong>Problem Statement:</strong> A clear, concise description of the problem and its impact.</li><li><strong>Business Case:</strong> Why the project is important to the organization (e.g., cost savings, quality improvement).</li><li><strong>Goal Statement:</strong> A SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goal.</li><li><strong>Scope:</strong> Defines the boundaries of the project.</li><li><strong>Team Roles:</strong> Who is on the team and what their responsibilities are.</li></ul>"
        },
        {
            type: 'text',
            body: `<h3>Voice of the Customer (VOC) and SIPOC</h3><p>To solve a problem, you must first understand what the customer values. <strong>Voice of the Customer (VOC)</strong> techniques (like surveys, interviews, and focus groups) are used to capture customer needs. These needs are then translated into measurable requirements called <strong>Critical to Quality (CTQ)</strong> characteristics. This ensures the team has a clear, data-driven target for improvement.</p>
<h4>Example: Translating VOC to CTQ for a Pizza Delivery Service</h4>
<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
<tr><th scope="col" class="px-4 py-2 border-r dark:border-slate-600">Customer Statement (VOC)</th><th scope="col" class="px-4 py-2">Measurable Requirement (CTQ)</th></tr>
</thead>
<tbody>
<tr class="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td class="px-4 py-2 border-r dark:border-slate-600 font-medium">"I want my pizza delivered hot."</td><td class="px-4 py-2">Pizza temperature must be ≥ 140°F upon arrival.</td></tr>
<tr class="bg-white dark:bg-slate-800"><td class="px-4 py-2 border-r dark:border-slate-600 font-medium">"It shouldn't take forever to get here."</td><td class="px-4 py-2">Delivery time from order to doorstep must be ≤ 30 minutes.</td></tr>
</tbody></table></div>
<p>A <strong>SIPOC</strong> diagram (Suppliers, Inputs, Process, Outputs, Customers) is a high-level process map created to visualize the project's scope and key stakeholders at a glance.</p>
<h4>Example: SIPOC for a Pizza Delivery Process</h4>
<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
<tr><th class="px-2 py-2">Suppliers</th><th class="px-2 py-2">Inputs</th><th class="px-2 py-2">Process</th><th class="px-2 py-2">Outputs</th><th class="px-2 py-2">Customers</th></tr>
</thead>
<tbody>
<tr class="bg-white dark:bg-slate-800 align-top"><td class="px-2 py-2"><ul><li>Ingredient Vendors</li><li>Box Supplier</li><li>Utility Companies</li></ul></td><td class="px-2 py-2"><ul><li>Order Details</li><li>Ingredients</li><li>Pizza Boxes</li><li>Energy</li></ul></td><td class="px-2 py-2"><ol class="list-decimal list-inside"><li>Take Order</li><li>Make Pizza</li><li>Bake Pizza</li><li>Box Pizza</li><li>Deliver</li></ol></td><td class="px-2 py-2"><ul><li>Delivered Pizza</li><li>Receipt</li></ul></td><td class="px-2 py-2"><ul><li>Hungry Customer</li></ul></td></tr>
</tbody></table></div>`
        },
        {
            type: 'quiz',
            question: "What is the primary purpose of a Project Charter?",
            options: [
                "To list all detailed tasks for the project",
                "To formally authorize the project and define its objectives and scope",
                "To analyze the root cause of the problem",
                "To brainstorm potential solutions"
            ],
            correctAnswerIndex: 1,
            explanation: "The Project Charter is the foundational document that officially launches a project. It provides formal authorization from the sponsor and clarifies the project's purpose, goals, and boundaries for all stakeholders."
        },
        {
            type: 'quiz',
            question: "Which of the following correctly lists the five phases of the Six Sigma methodology?",
            options: [
                "Plan, Do, Check, Act, Report",
                "Define, Measure, Analyze, Improve, Control",
                "Design, Model, Analyze, Implement, Close",
                "Define, Manage, Approve, Improve, Complete"
            ],
            correctAnswerIndex: 1,
            explanation: "The correct sequence for a Lean Six Sigma process improvement project is DMAIC: Define, Measure, Analyze, Improve, and Control."
        }
    ]
};