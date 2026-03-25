import type { Lesson } from '../../types';

export const lesson2: Lesson = {
    id: 'cre-2',
    title: 'Reliability Modeling & Prediction',
    prompt: 'Generate a detailed lesson for the CRE certification on Reliability Modeling and Prediction. Structure the content for beginner, intermediate, and advanced levels. Cover Reliability Block Diagrams (RBDs) for series and parallel systems with calculations, Fault Tree Analysis (FTA), and a deep dive into Weibull analysis (β, η, γ parameters). Include learning objectives, multiple examples, detailed quiz questions, and the SeriesRBD and ParallelRBD visuals.',
    objectives: [
      "Model system reliability using Reliability Block Diagrams (RBDs).",
      "Calculate system reliability for series, parallel, and k-out-of-n configurations.",
      "Differentiate between the top-down deductive approach of Fault Tree Analysis (FTA) and the bottom-up approach of FMEA.",
      "Interpret the Weibull parameters (Beta β, Eta η, Gamma γ) to understand failure modes and inform maintenance strategy."
    ],
    content: [
      {
        type: 'text',
        body: "<h3>The Foundation (Beginner)</h3><p>Reliability modeling allows us to predict the reliability of a complex system based on the reliability of its components. The most common tool is the <strong>Reliability Block Diagram (RBD)</strong>, which visualizes how components are logically connected for the system to succeed.</p><h4>Series Systems</h4><p>All components must function for the system to succeed. It's a 'weakest link' system. Even one failure causes a system failure.</p>"
      },
      {
        type: 'visual',
        component: 'SeriesRBD'
      },
      {
        type: 'text',
        body: "<h4>Parallel Systems</h4><p>Also known as a redundant system. The system functions if at least one of the components functions. This configuration is used to increase the reliability of critical functions.</p>"
      },
      {
        type: 'visual',
        component: 'ParallelRBD'
      },
      {
        type: 'text',
        body: "<h3>Application & Process (Intermediate)</h3><h4>System Reliability Calculations</h4><p><strong>Series:</strong> The system reliability is the product of the component reliabilities. <br/>R<sub>sys</sub> = R<sub>1</sub> × R<sub>2</sub> × ... × R<sub>n</sub></p><p><strong>Example:</strong> If two components in series have reliabilities of 90% (0.9) and 95% (0.95), the system reliability is 0.90 × 0.95 = 0.855, or 85.5%. Note that the system reliability is always lower than the least reliable component.</p><p><strong>Parallel:</strong> System reliability is calculated based on the probability of all components failing. <br/>R<sub>sys</sub> = 1 - [(1 - R<sub>1</sub>) × (1 - R<sub>2</sub>) × ... × (1 - R<sub>n</sub>)]</p><p><strong>Example:</strong> If the same two components (90% and 95%) were in parallel, the system reliability would be 1 - [(1 - 0.90) × (1 - 0.95)] = 1 - [0.10 × 0.05] = 1 - 0.005 = 0.995, or 99.5%. Redundancy dramatically improves reliability.</p><h4>Fault Tree Analysis (FTA)</h4><p>FTA is a top-down, deductive failure analysis. It starts with an undesired top-level event (e.g., 'Pump Fails to Start') and traces it back to all the potential root causes using boolean logic gates (AND, OR). It's excellent for understanding combinations of failures that can lead to a catastrophe and calculating the probability of the top event.</p>"
      },
      {
        type: 'text',
        body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Advanced Insights from Weibull Analysis</h4><p>While the Bathtub Curve is a good concept, real-world data rarely fits it perfectly. <strong>Weibull Analysis</strong> is a powerful statistical method that models failure patterns with much greater flexibility. It's defined by key parameters:</p><ul><li><strong>β (Beta) - The Shape Parameter:</strong> This is the most important parameter. It tells us the failure behavior.<ul><li><strong>β < 1:</strong> Infant mortality (decreasing failure rate). Suggests issues with manufacturing or installation.</li><li><strong>β ≈ 1:</strong> Useful life (constant/random failure rate). Failures are independent of age. Time-based PM is ineffective.</li><li><strong>β > 1:</strong> Wear-out failures (increasing failure rate). Suggests components are aging. Time-based PM or replacement may be effective. (e.g., β ≈ 2 resembles a normal distribution)</li></ul></li><li><strong>η (Eta) - The Scale Parameter:</strong> Also known as the 'characteristic life'. It is the time at which 63.2% of the population will have failed. It defines the scale of the distribution on the time axis.</li><li><strong>γ (Gamma) - The Location Parameter:</strong> Represents the failure-free period. If γ > 0, it means there is a period of time during which no failures are expected to occur.</li></ul><p>By determining these parameters from failure data, a reliability engineer can make data-driven decisions about warranty periods, PM intervals, and spare parts strategy.</p>"
      },
      {
        type: 'quiz',
        question: "A system consists of two pumps in a parallel (redundant) configuration. Each pump has a reliability of 80% (0.8). What is the total system reliability?",
        options: ["64%", "80%", "96%", "160%"],
        correctAnswerIndex: 2,
        explanation: "For a parallel system, R_sys = 1 - ((1-R1) * (1-R2)). So, R_sys = 1 - ((1-0.8) * (1-0.8)) = 1 - (0.2 * 0.2) = 1 - 0.04 = 0.96, or 96%. Redundancy significantly improves reliability."
      },
      {
        type: 'quiz',
        question: "A Weibull analysis of a bearing's failure data yields a shape parameter (β) of 3.5. What is the most appropriate maintenance strategy?",
        options: [
            "Improve the installation procedure to prevent early failures.",
            "Implement condition monitoring as failures are random.",
            "Implement a scheduled, time-based replacement task before the bearings enter the wear-out zone.",
            "Do nothing, as this is a very reliable component."
        ],
        correctAnswerIndex: 2,
        explanation: "A shape parameter (Beta) greater than 1 (and especially >2) indicates a strong wear-out failure mode. This means failures are predictable based on age. Therefore, a time-based replacement before this wear-out period begins is an effective strategy to prevent in-service failures."
      }
    ]
};