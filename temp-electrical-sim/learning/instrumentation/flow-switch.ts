import { FlowSwitchVisual } from '../Visuals';
import { LearningTopic } from '../types';

export const flowSwitchTopic: LearningTopic = {
  id: 'flow-switch',
  title: 'Flow Switches',
  content: [
    "A flow switch is a device used to detect the movement of a fluid or gas in a pipe. Its purpose is typically to confirm that flow is present before allowing another part of a system to operate.",
    "A common type is the 'paddle' or 'vane' switch. It has a paddle that is inserted into the pipe. When the fluid starts to flow, it pushes against the paddle, causing it to pivot.",
    "This pivoting motion is linked to an electrical switch (usually a microswitch) on the outside of the pipe. Once the flow is strong enough to move the paddle a certain amount, the switch is actuated, changing its NO and NC contacts.",
    "Flow switches are critical safety and control devices. For example, they are used to ensure that a coolant pump is actually moving coolant before a large motor is allowed to start, or to shut down a heater if the air flow from a fan stops.",
    "Click the button in the animation to start the flow and actuate the switch."
  ],
  visual: FlowSwitchVisual,
};
