import type { Lesson } from '../../types';

export const dmaic2: Lesson = { 
    id: 'lss-2', 
    title: 'Phase 2: Measure', 
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Develop a data collection plan to gather reliable information.",
        "Understand and use basic statistical measures like mean, median, and standard deviation.",
        "Create detailed process maps to visualize workflow and identify bottlenecks.",
        "Evaluate process capability using metrics like Cp and Cpk."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>Establishing a Baseline: The Voice of the Process</h3><p>The <strong>Measure</strong> phase is where we stop talking about the problem and start quantifying it. The goal is to collect reliable data to understand the process's current performance (the baseline) and pinpoint exactly where, when, and to what extent the problem is occurring. This is about listening to the 'Voice of the Process' and comparing it to the 'Voice of the Customer' from the Define phase.</p><h4>The Data Collection Plan</h4><p>You can't just start collecting data randomly. A robust <strong>Data Collection Plan</strong> is created to ensure the information gathered is accurate, relevant, and trustworthy. It acts as a recipe for your measurement activities.</p>"
        },
        {
            type: 'text',
            body: `<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
<thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
<tr><th class="px-4 py-2">Question</th><th class="px-4 py-2">Data to Collect</th><th class="px-4 py-2">Operational Definition</th><th class="px-4 py-2">Data Type</th></tr>
</thead>
<tbody>
<tr class="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><td class="px-4 py-2">How long does delivery take?</td><td class="px-4 py-2">Delivery Time</td><td class="px-4 py-2">'Start' when order is confirmed; 'End' when customer signs.</td><td class="px-4 py-2">Continuous (minutes)</td></tr>
<tr class="bg-white dark:bg-slate-800"><td class="px-4 py-2">Are orders correct?</td><td class="px-4 py-2">Order Accuracy</td><td class="px-4 py-2">Any deviation from the customer's order is a defect.</td><td class="px-4 py-2">Discrete (defect count)</td></tr>
</tbody></table></div>`
        },
        {
            type: 'text',
            body: "<h3>Visualizing the Process</h3><p>While a SIPOC provides a high-level view, a detailed <strong>Process Map</strong> (or flowchart) is created in this phase to visualize every step, decision point, and handover in the process. This helps the team identify potential bottlenecks, redundancies, and areas of complexity that aren't visible at a high level.</p>"
        },
        {
            type: 'text',
            body: "<h3>Understanding the Data</h3><p>Once data is collected, it's analyzed with basic statistics to understand its characteristics:</p><ul><li><strong>Measures of Central Tendency:</strong> Mean (the average), Median (the middle value). A large difference between the mean and median can indicate skewed data.</li><li><strong>Measures of Dispersion:</strong> Range (max-min), and Standard Deviation (the average distance of data points from the mean). Standard deviation is the most important measure of variation.</li></ul><h4>Is Your Measurement System Reliable? (MSA)</h4><p>A critical, often overlooked step, is to validate your measurement system itself. <strong>Measurement System Analysis (MSA)</strong>, or Gage R&R, ensures that the variation you are seeing is from your process, not from your measurement tool or method. If your measurement system is unreliable, your data is useless.</p>"
        },
        {
            type: 'text',
            body: "<h3>Process Capability (Cp & Cpk)</h3><p>The ultimate goal of the Measure phase is to determine if the process is 'capable' of meeting customer specifications. <strong>Process Capability</strong> analysis compares the voice of the process (how it performs, measured by its 6-sigma spread) to the voice of the customer (the specification limits, or USL and LSL).</p><ul><li><strong>Cp (Capability Potential):</strong> Measures if the process is 'wide' or 'narrow' compared to the specs. It asks: 'Is the process spread narrow enough to fit?' It doesn't care if the process is centered. A Cp > 1.33 is good.</li><li><strong>Cpk (Capability Index):</strong> Measures if the process is centered within the specification limits. It asks: 'Is the process centered and narrow enough?' A Cpk < 1.0 indicates the process is producing defects. A Cpk > 1.33 is a common target.</li></ul><div class='my-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700'><img src='https://i.ibb.co/tZ5hJqf/cpk-diagram.png' alt='Cp vs Cpk Diagram' class='w-full rounded' /></div>"
        },
        {
            type: 'quiz',
            question: "A process has a Cpk value of 0.75. What does this indicate?",
            options: [
                "The process is perfectly centered and capable.",
                "The process is not capable of meeting customer specifications and is producing defects.",
                "The process is capable but not centered.",
                "The data collection was flawed."
            ],
            correctAnswerIndex: 1,
            explanation: "A Cpk value less than 1.0 means that the process distribution falls outside of one or both of the customer's specification limits. Therefore, it is not capable of consistently meeting requirements and is producing defective output."
        },
        {
            type: 'quiz',
            question: "A process has a Cp of 1.5 and a Cpk of 0.8. What can you conclude?",
            options: [
                "The process spread is too wide.",
                "The process is not capable and needs to be redesigned.",
                "The process is capable in terms of its spread, but it is not centered between the specification limits.",
                "The process is both centered and capable."
            ],
            correctAnswerIndex: 2,
            explanation: "A Cp of 1.5 indicates the process spread is narrow enough to fit well within the spec limits (it has good potential). However, a Cpk of 0.8 (less than 1.0) means it is producing defects. The large difference between Cp and Cpk indicates the process is significantly off-center."
        }
    ]
};
