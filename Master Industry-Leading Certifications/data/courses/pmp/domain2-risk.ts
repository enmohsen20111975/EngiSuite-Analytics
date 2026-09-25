import type { Lesson } from '../../types';

export const domain2Risk: Lesson = {
    id: 'pmp-4',
    title: 'Advanced Risk Management',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Differentiate between qualitative and quantitative risk analysis.",
        "Assess and prioritize individual project risks using a Probability and Impact Matrix.",
        "Select appropriate risk response strategies for both threats and opportunities.",
        "Understand the process of monitoring risks and evaluating the effectiveness of response plans."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>Project risk management is the proactive process of identifying, analyzing, and responding to uncertainty throughout the project lifecycle. A risk is an uncertain event that, if it occurs, has a positive (opportunity) or negative (threat) effect on one or more project objectives. The goal is not to eliminate all risk, but to minimize the probability and impact of threats while maximizing the probability and impact of opportunities.</p><p>The risk management process generally follows these steps: Plan Risk Management -> Identify Risks -> Perform Qualitative/Quantitative Analysis -> Plan Risk Responses -> Implement Responses -> Monitor Risks.</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Qualitative vs. Quantitative Analysis</h4><p>Once risks are identified, they must be analyzed. <strong>Qualitative Risk Analysis</strong> is a rapid and subjective process of prioritizing individual project risks for further analysis or action by assessing their probability of occurrence and impact. The primary tool for this is the <strong>Probability and Impact Matrix</strong>.</p>"
        },
        {
            type: 'visual',
            component: 'ProbabilityImpactMatrix'
        },
        {
            type: 'text',
            body: "<p><strong>Quantitative Risk Analysis</strong>, on the other hand, is a more numerical and objective process. It analyzes the combined effect of identified individual project risks on overall project objectives. This is not performed on all projects, typically only on large or complex ones. A key technique is calculating the <strong>Expected Monetary Value (EMV)</strong> of a risk to quantify its potential financial impact.</p>"
        },
        {
            type: 'visual',
            component: 'EmvEquation'
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Planning Risk Responses</h4><p>After prioritizing risks, you must plan how to deal with them. Strategies are different for threats and opportunities:</p><h4>Strategies for Threats (Negative Risks)</h4><ul><li><strong>Avoid:</strong> Change the project plan to eliminate the threat entirely (e.g., remove a high-risk work package).</li><li><strong>Mitigate:</strong> Take action to reduce the probability or impact of the threat (e.g., add redundancy to a critical component).</li><li><strong>Transfer:</strong> Shift the impact of the threat to a third party (e.g., buy insurance or use a fixed-price contract).</li><li><strong>Accept:</strong> Acknowledge the risk and take no action unless it occurs. Can be active (create a contingency reserve) or passive (do nothing).</li></ul><h4>Strategies for Opportunities (Positive Risks)</h4><ul><li><strong>Exploit:</strong> Take action to ensure the opportunity is realized (e.g., assign your best resources to finish a task early to capture a bonus).</li><li><strong>Enhance:</strong> Increase the probability or impact of the opportunity (e.g., lobby a government official to get a favorable regulation passed).</li><li><strong>Share:</strong> Allocate ownership to a third party who is best able to capture the opportunity (e.g., form a joint venture).</li><li><strong>Accept:</strong> Be willing to take advantage of the opportunity if it arises, but do not actively pursue it.</li></ul><h4>Monitoring Risks</h4><p>Risk management is not a one-time event. The <strong>Monitor Risks</strong> process involves continuously tracking identified risks, monitoring residual risks, identifying new risks, and evaluating the effectiveness of the risk response plans throughout the project lifecycle. This is done through risk reviews, audits, and reassessments.</p>"
        },
        {
            type: 'quiz',
            question: "A risk is identified with a very high impact on the project budget but a very low probability of occurring. On a Probability and Impact Matrix, where would this risk likely be categorized?",
            options: [
                "High-priority (Red zone)",
                "Low-priority (Green zone)",
                "Medium-priority (Yellow zone)",
                "It cannot be categorized without a quantitative analysis."
            ],
            correctAnswerIndex: 2,
            explanation: "Even with a very high impact, the very low probability typically places this risk in a medium-priority (yellow) zone. It needs to be monitored, but risks with high probability AND high impact are the top priority (red zone)."
        },
        {
            type: 'quiz',
            question: "Your project depends on a new technology from a single, unproven supplier. To deal with this risk, you change your project plan to use a well-established, older technology instead. Which risk response strategy have you used?",
            options: [
                "Mitigate",
                "Transfer",
                "Avoid",
                "Accept"
            ],
            correctAnswerIndex: 2,
            explanation: "By changing the project plan to completely remove the source of the risk (the new technology and unproven supplier), you have used the Avoid strategy. Mitigation would have involved reducing the risk (e.g., finding a second supplier), but you eliminated it."
        }
    ]
};