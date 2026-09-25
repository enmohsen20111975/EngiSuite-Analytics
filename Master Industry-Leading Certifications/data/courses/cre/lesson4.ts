import type { Lesson } from '../../types';

export const lesson4: Lesson = {
    id: 'cre-4',
    title: 'Failure Analysis Techniques',
    prompt: 'Generate a detailed lesson for the CRE certification on Failure Analysis techniques. Structure the content for beginner, intermediate, and advanced levels. Cover FMEA, Fault Tree Analysis (FTA), and root cause analysis (RCA) methods like 5 Whys and Fishbone diagrams. Include learning objectives, examples, quizzes, and the FishboneDiagram visual.',
    objectives: [
      "Differentiate between inductive (FMEA) and deductive (FTA) analysis methods.",
      "Explain the purpose and process of a Failure Modes and Effects Analysis (FMEA).",
      "Construct a basic Fault Tree Analysis (FTA) to identify failure combinations.",
      "Apply Root Cause Analysis (RCA) techniques like 5 Whys and Fishbone Diagrams to find underlying causes of failures."
    ],
    content: [
      {
        type: 'text',
        body: "<h3>The Foundation (Beginner)</h3><p>Failure analysis is a systematic investigation of a failure to determine its root cause and recommend corrective actions. It's about asking 'Why?' until the fundamental reason for a problem is uncovered. A key distinction is between inductive and deductive analysis:</p><ul><li><strong>Inductive (Bottom-Up):</strong> Starts with a potential cause and works forward to determine its effect on the system. The primary tool is <strong>Failure Modes and Effects Analysis (FMEA)</strong>.</li><li><strong>Deductive (Top-Down):</strong> Starts with a known system failure (the 'top event') and works backward to find all possible causes. The primary tool is <strong>Fault Tree Analysis (FTA)</strong>.</li></ul><h4>FMEA: 'What could go wrong?'</h4><p>FMEA is a proactive tool, often used during the design phase. A team brainstorms all the ways a component could fail (the 'failure modes'), the consequences of that failure (the 'effects'), and the mechanisms that cause it. This process identifies potential weaknesses before they become real problems.</p>"
      },
      {
        type: 'text',
        body: "<h3>Application & Process (Intermediate)</h3><h4>FTA: 'How could this have happened?'</h4><p>Fault Tree Analysis is a powerful tool for investigating accidents or critical system failures. It starts with the undesired top event and uses boolean logic gates (like AND and OR) to link it to lower-level events. For example, for a 'Car Won't Start' event, an OR gate would connect to 'Battery is Dead' and 'No Fuel,' as either one of those events could cause the failure. An AND gate would be used for events that must happen in combination to cause the failure.</p><h4>Root Cause Analysis (RCA)</h4><p>RCA is a broader term for problem-solving methods used to find the true cause of an issue. The goal is to find a cause that, if removed, would prevent the problem from recurring.</p><p>A simple yet effective RCA technique is the <strong>5 Whys</strong>. By repeatedly asking 'Why?' (typically about five times), you can peel back the layers of symptoms to get to the root cause. For example:</p><ol><li>The machine stopped. (<strong>Why?</strong>)</li><li>The fuse blew. (<strong>Why?</strong>)</li><li>The circuit was overloaded. (<strong>Why?</strong>)</li><li>The bearing was drawing too much current. (<strong>Why?</strong>)</li><li>The bearing was not properly lubricated. (<strong>Why?</strong>)</li><li>The PM task was missed. (<strong>Root Cause</strong>)</li></ol>"
      },
      {
        type: 'text',
        body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Structured Brainstorming with Fishbone Diagrams</h4><p>For more complex problems, a structured brainstorming tool is needed. The <strong>Fishbone Diagram</strong> (also called an Ishikawa Diagram) helps a team explore a wide range of potential causes for a problem by organizing them into useful categories. The 'head' of the fish is the problem statement, and the 'bones' are categories of potential causes.</p>"
      },
      {
        type: 'visual',
        component: 'FishboneDiagram'
      },
       {
        type: 'text',
        body: "<p>Standard categories (the 6 M's) often include:</p><ul><li><strong>Manpower:</strong> Issues related to people (e.g., training, fatigue).</li><li><strong>Machine:</strong> Issues with the equipment itself (e.g., wear, settings).</li><li><strong>Method:</strong> Issues with the process or procedure.</li><li><strong>Material:</strong> Issues with raw materials or components.</li><li><strong>Measurement:</strong> Issues with inspection or instrumentation.</li><li><strong>Mother Nature (Environment):</strong> Issues like temperature, humidity, etc.</li></ul><p>By using this tool, a team can ensure a comprehensive investigation, moving beyond the obvious symptoms to uncover the true systemic root causes of a failure.</p>"
      },
      {
        type: 'quiz',
        question: "A team is investigating a major system failure that has already occurred. They start with the failure event and want to trace back all the possible combinations of component and human errors that could have led to it. Which analysis method is most suitable?",
        options: ["FMEA", "Reliability Block Diagram (RBD)", "Fault Tree Analysis (FTA)", "5 Whys"],
        correctAnswerIndex: 2,
        explanation: "Fault Tree Analysis (FTA) is the ideal tool for this scenario. It is a deductive, top-down method that starts with a known failure event and works backward to identify all potential contributing causes and their logical relationships (AND/OR gates)."
      },
      {
        type: 'quiz',
        question: "During the design of a new gearbox, the engineering team wants to proactively identify all the ways the gears could potentially fail (e.g., pitting, cracking) and assess the impact of each failure on the overall machine. Which tool should they use?",
        options: ["FTA", "FMEA", "5 Whys", "Fishbone Diagram"],
        correctAnswerIndex: 1,
        explanation: "FMEA is a bottom-up, inductive method perfect for design analysis. It starts by considering potential component-level failure modes and analyzes their effects on the system, allowing for design improvements to be made proactively."
      }
    ]
};