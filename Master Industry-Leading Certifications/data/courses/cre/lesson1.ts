import type { Lesson } from '../../types';

export const lesson1: Lesson = {
    id: 'cre-1',
    title: 'Reliability Fundamentals & Metrics',
    prompt: 'Generate a detailed lesson for the CRE certification on Reliability Fundamentals and Metrics. Structure the content for beginner, intermediate, and advanced levels. Cover RAM definitions, the bathtub curve, failure rate (λ), key metrics (MTBF, MTTF, MTTR), and the different types of Availability (Inherent, Achieved, Operational). Include learning objectives, multiple examples, detailed quiz questions, and the BathtubCurve and AvailabilityEquation visuals.',
    objectives: [
      "Define and differentiate between Reliability, Availability, and Maintainability (RAM).",
      "Describe the three phases of the 'Bathtub Curve' and their associated failure mechanisms.",
      "Calculate and interpret key reliability metrics including MTBF, MTTF, MTTR, and Failure Rate (λ).",
      "Distinguish between Inherent, Achieved, and Operational Availability and their strategic importance."
    ],
    content: [
      {
        type: 'text',
        body: "<h3>The Foundation (Beginner)</h3><p>Reliability Engineering is the discipline of ensuring a system performs its required functions without failure for a specified time under stated conditions. It's a science of prediction, prevention, and management of failures. The three core concepts are often abbreviated as RAM:</p><ul><li><strong>Reliability (R(t)):</strong> The probability that an item will perform its intended function for a specified mission time under stated conditions. It is a probability of success.</li><li><strong>Availability (A):</strong> The probability that an item is in an operable state at any given time (uptime). It accounts for both reliability (how often it fails) and maintainability (how quickly it can be repaired).</li><li><strong>Maintainability (M):</strong> The probability that a failed item can be restored to operational effectiveness within a given period of time when maintenance is performed under stated conditions.</li></ul><h4>The Bathtub Curve</h4><p>This classic model illustrates the typical failure rate of a product over its life, consisting of three phases:</p>"
      },
      {
        type: 'visual',
        component: 'BathtubCurve'
      },
      {
        type: 'text',
        body: "<ol><li><strong>Infant Mortality:</strong> An early period of a high, decreasing failure rate caused by manufacturing defects, poor installation, or incorrect setup.</li><li><strong>Useful Life:</strong> A period of a low, relatively constant failure rate where failures are considered 'random'.</li><li><strong>Wear-Out:</strong> A period of a rapidly increasing failure rate as the product ages and components begin to fatigue and degrade.</li></ol>"
      },
      {
        type: 'text',
        body: "<h3>Application & Process (Intermediate)</h3><h4>Quantifying Reliability: Key Metrics</h4><p>To manage reliability, we must measure it. For the 'Useful Life' period, we assume a constant failure rate, denoted by the Greek letter Lambda (λ).</p><ul><li><strong>Failure Rate (λ):</strong> The number of failures per unit of time (e.g., failures per hour).</li><li><strong>MTTF (Mean Time To Failure):</strong> Used for non-repairable items (e.g., a lightbulb). It is the reciprocal of the failure rate: <strong>MTTF = 1/λ</strong>.</li><li><strong>MTBF (Mean Time Between Failures):</strong> Used for repairable items (e.g., a pump). For the useful life period, it is also the reciprocal of the failure rate: <strong>MTBF = 1/λ</strong>.</li><li><strong>MTTR (Mean Time To Repair):</strong> The average time it takes to repair a failed item, from failure to restoration.</li></ul><h4>Calculating Inherent Availability</h4><p>These metrics are used to calculate Inherent Availability, which represents the 'as-designed' availability, considering only active repair time and operating time.</p>"
      },
       {
        type: 'visual',
        component: 'AvailabilityEquation'
      },
       {
        type: 'text',
        body: "<h4>Example Calculation</h4><p>A pump runs for an average of 1,950 hours between failures (MTBF), and the average time to repair it is 50 hours (MTTR). Its Inherent Availability is: A = 1950 / (1950 + 50) = 1950 / 2000 = 0.975 or <strong>97.5%</strong>.</p>"
      },
       {
        type: 'text',
        body: "<h3>Strategy & Analysis (Advanced)</h3><h4>The Hierarchy of Availability</h4><p>Inherent Availability is a good starting point, but in the real world, other delays affect uptime. A mature reliability program understands the different layers:</p><ul><li><strong>Inherent Availability (Ai):</strong> The ideal, 'as-designed' availability. (Considers MTBF and MTTR).</li><li><strong>Achieved Availability (Aa):</strong> Considers both preventive and corrective maintenance downtime. (Considers Mean Time Between Maintenance (MTBM) and Mean Maintenance Time (MMT)).</li><li><strong>Operational Availability (Ao):</strong> The 'real world' availability experienced by the user. It includes all sources of downtime, including administrative delays, supply chain issues, or waiting for operators.</li></ul><p>Analyzing the gap between Inherent and Operational availability reveals opportunities for improvement. If Ai is 99% but Ao is 75%, it indicates that the equipment design is reliable, but the support systems (logistics, planning, etc.) are inefficient.</p><h4>The Limitation of MTBF</h4><p>While MTBF is a useful metric, relying on it alone can be misleading. It is an average and does not describe the shape of the failure distribution. It is only truly valid during the 'useful life' phase. A system with a high MTBF could still have a high infant mortality rate or a sharp wear-out curve. This is why more advanced tools like Weibull analysis are necessary to understand the true failure patterns.</p>"
      },
      {
        type: 'quiz',
        question: "An engineer is analyzing the failure data for a set of disposable, single-use electronic sensors. Which metric is most appropriate to describe their operational life?",
        options: ["MTBF", "MTTR", "MTTF", "Operational Availability"],
        correctAnswerIndex: 2,
        explanation: "MTTF (Mean Time To Failure) is used for non-repairable items. Since the sensors are single-use and are not repaired upon failure, MTTF is the correct metric for their average lifespan."
      },
      {
        type: 'quiz',
        question: "A piece of equipment has an Inherent Availability of 98%, but its Operational Availability is only 80%. What is the most likely cause of this discrepancy?",
        options: [
          "The equipment has a fundamental design flaw.",
          "The technicians are very slow at performing repairs.",
          "There are significant delays in getting spare parts or administrative approvals.",
          "The preventive maintenance schedule is too frequent."
        ],
        correctAnswerIndex: 2,
        explanation: "The high Inherent Availability suggests the equipment itself is well-designed and repairable. The large drop to Operational Availability points to systemic or logistical delays beyond the active repair time, such as waiting for parts, permits, or operators."
      }
    ]
};