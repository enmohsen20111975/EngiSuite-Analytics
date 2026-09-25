import type { Lesson } from '../../types';

export const lesson3: Lesson = {
    id: 'cre-3',
    title: 'Design for Reliability (DfR)',
    prompt: 'Generate a detailed lesson for the CRE certification on Design for Reliability (DfR). Structure the content for beginner, intermediate, and advanced levels. Cover techniques like FMEA/FMECA, component derating, and accelerated life testing (HALT/HASS), and the Physics-of-Failure approach. Include learning objectives, multiple examples, detailed quiz questions, and the DeratingGraph visual.',
    objectives: [
      "Define the purpose and process of Design for Reliability (DfR).",
      "Differentiate between FMEA and FMECA by understanding the 'Criticality' component.",
      "Explain how component derating and accelerated life testing (HALT) are used to improve design robustness.",
      "Describe the Physics-of-Failure (PoF) approach as a proactive DfR strategy."
    ],
    content: [
      {
        type: 'text',
        body: "<h3>The Foundation (Beginner)</h3><p><strong>Design for Reliability (DfR)</strong> is a proactive process of designing reliability into a product from the very beginning of its lifecycle. It is far more cost-effective to prevent failures at the design stage than to fix them after a product has been manufactured and shipped. A core DfR tool is <strong>Failure Modes and Effects Analysis (FMEA)</strong>. This is a bottom-up, systematic method for identifying potential failure modes in a design, understanding their effects on the system, and identifying the causes. It helps teams answer the question, 'How can this design fail?'</p>"
      },
      {
        type: 'text',
        body: "<h3>Application & Process (Intermediate)</h3><h4>Improving Robustness with Derating and HALT</h4><p><strong>Component Derating</strong> is a key DfR technique. It involves operating components at less than their maximum rated stress levels (e.g., power, voltage, temperature). This provides a safety margin, reduces the rate of degradation, and significantly increases reliability.</p>"
      },
      {
        type: 'visual',
        component: 'DeratingGraph'
      },
      {
        type: 'text',
        body: "<p><strong>Highly Accelerated Life Testing (HALT)</strong> is a discovery test, not a life prediction test. Its goal is to rapidly induce failures by applying stresses (like extreme temperatures and rapid vibration) far beyond the normal operating range. This process quickly exposes the weakest links in the design so they can be improved. HALT finds the fundamental limits of the design, making the product more robust and less susceptible to variations in manufacturing and customer use.</p>"
      },
      {
        type: 'text',
        body: "<h3>Strategy & Analysis (Advanced)</h3><h4>From FMEA to FMECA</h4><p>An extension of FMEA is <strong>FMECA (Failure Modes, Effects, and Criticality Analysis)</strong>. FMECA adds a quantitative criticality assessment to the FMEA process. It combines the probability of a failure mode occurring with the severity of its consequences, allowing failure modes to be ranked by their risk. This is critical for prioritizing reliability improvement efforts, especially in high-risk industries like aerospace and defense, and is often guided by standards like MIL-STD-1629.</p><h4>Physics-of-Failure (PoF)</h4><p>A more advanced DfR approach is <strong>Physics-of-Failure (PoF)</strong>. Instead of relying only on statistical analysis of past failures, PoF uses knowledge of physics and material science to model how and why a component fails. It focuses on understanding the root-cause physical processes like fatigue, corrosion, fracture, and wear. By modeling these processes, engineers can design products that are inherently resistant to them, predicting reliability without needing large amounts of historical failure data. This is especially valuable for new technologies and materials.</p>"
      },
      {
        type: 'quiz',
        question: "An engineer uses a bearing with a dynamic load capacity of 5,000 lbs in an application that will only ever see a maximum load of 2,500 lbs. This practice is known as:",
        options: ["Failure Modes and Effects Analysis (FMEA)", "Highly Accelerated Life Testing (HALT)", "Root Cause Analysis (RCA)", "Component Derating"],
        correctAnswerIndex: 3,
        explanation: "This is a classic example of derating. By operating the component at only 50% of its rated capacity, the engineer is reducing mechanical stress, which dramatically increases the bearing's L10 life and reliability."
      },
      {
        type: 'quiz',
        question: "A team is designing a satellite component where failure is not an option and they have no historical failure data for the new materials being used. Which DfR approach would be most effective?",
        options: ["Standard FMEA", "Statistical Process Control (SPC)", "Physics-of-Failure (PoF)", "Run-to-Failure testing"],
        correctAnswerIndex: 2,
        explanation: "Physics-of-Failure (PoF) is the ideal approach for this scenario. It does not rely on historical data but instead uses scientific principles to model and understand potential failure mechanisms in new materials and technologies, allowing reliability to be designed-in from the ground up."
      }
    ]
};