import { PushButtonVisualNO, PushButtonVisualNC } from '../Visuals';
import { LearningTopic } from '../types';

export const pushButtonTopic: LearningTopic = {
  id: 'what-is-a-push-button',
  title: 'What is a Push Button?',
  content: [
      "A push button is a simple, momentary switch used to control some aspect of a machine or a process. The key word is 'momentary'—it is only active while it is being pressed.",
      "Push buttons come in two fundamental types: Normally Open (NO) and Normally Closed (NC).",
      "Normally Open (NO): In its default state, the internal contacts are open, and no electricity can pass through. When you press the button, the contacts close, completing the circuit. This type is most commonly used for 'Start' or 'On' functions.",
      "Normally Closed (NC): In its default state, the internal contacts are already closed, allowing electricity to pass through. When you press the button, the contacts open, breaking the circuit. This type is almost always used for 'Stop' or 'Emergency Stop' functions because it is 'fail-safe'—if the wire to the button breaks, the circuit stops.",
  ],
  visuals: [
      { title: "Normally Open (NO)", component: PushButtonVisualNO },
      { title: "Normally Closed (NC)", component: PushButtonVisualNC },
  ]
};
