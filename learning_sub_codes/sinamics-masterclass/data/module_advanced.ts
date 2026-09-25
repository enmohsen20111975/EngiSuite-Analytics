
import { Lesson } from '../types';

export const ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'l6-1',
    title: 'Energy Optimization',
    content: `### Regenerative Braking (Regen)
Normally, when you stop a big motor quickly, it turns into a generator. The energy goes into the DC Link. If it's too much, we burn it off as heat in a Braking Resistor.
**Regenerative Drives (PM250 / Active Line Module)**:
These drives put that energy *back onto the grid* to power other lights or machines in the factory. No resistor needed.

### Hibernation Mode
For pumps: If the PID output drops below a threshold (no demand), the drive stops completely (0 Hz). It "Sleeps".
When the pressure drops, the drive "Wakes Up" automatically.`
  },
  {
    id: 'l6-2',
    title: 'Basic Positioner (EPos)',
    content: `### Positioning without a Motion Controller
SINAMICS G120 and S120 have a built-in function block called **EPos**. This allows the drive to perform Point-to-Point positioning using a standard PLC (not a Technology CPU).

### Modes of Operation
1. **Jog (Setup)**: Move velocity while button is held.
2. **MDI (Direct Setpoint)**: The PLC sends "Go to 500.0mm at 100mm/s". The drive calculates the ramp and stops exactly at 500.0mm.
3. **Traversing Blocks**: The drive stores a program internally (e.g., 10 steps).
   - *Step 1*: Go to Load Pos.
   - *Step 2*: Wait for Input.
   - *Step 3*: Go to Unload Pos.
   - The PLC just sends "Start Program 1".

> **Telegram 111**: This is the standard telegram for EPos. It contains Control Word (STW1), EPos Control (STW2), Position Setpoint, Velocity Override, and Fault codes.`
  },
  {
    id: 'l6-3',
    title: 'Extended Safety Functions',
    content: `Beyond the basics (STO/SS1), SINAMICS supports advanced safety requiring an encoder.

### SS2 (Safe Stop 2) / SOS (Safe Operating Stop)
- **Scenario**: You need to work on the machine, but you don't want to cut power (because gravity would make the axis fall, or you would lose position).
- **Function**: The drive holds the motor in position with full torque.
- **Monitoring**: If the motor moves by even 1 degree (SOS tolerance), the drive fires the "STOP A" fault and cuts power.

### SBT (Safe Brake Test)
- **Scenario**: A vertical hoist holds 5 tons. How do you know the mechanical brake works?
- **Function**: The drive applies torque *against* the closed brake. It measures if the motor turns. If it holds, the test passes. This is often required every 24 hours by safety regulations (e.g., ISO 13849).`
  },
  {
    id: 'l6-4',
    title: 'PID Control Theory',
    content: `### The Problem
You want to maintain a constant water pressure of 5 Bar, but the water demand (taps opening) changes constantly.

### The Solution: PID Controller
- **Proportional (P-Gain)**: The "Strength". If pressure drops by 1 Bar, how hard should I accelerate?
  - *Too Low*: Sluggish.
  - *Too High*: Overshoot and oscillation.
- **Integral (I-Time)**: The "Memory". Corrects the long-term error. If we are stuck at 4.9 Bar, the I-term slowly ramps up speed until we hit 5.0 Bar.
- **Derivative (D-Term)**: The "Anticipation". Reacts to the rate of change. Rarely used in simple flow control (can be jittery).

### Tuning Tips
1. Start with P=1.0, I=0 (Off).
2. Increase P until the system becomes unstable, then reduce by 50%.
3. Decrease I-Time (make it faster) until the steady-state error is eliminated.`
  },
  {
    id: 'l6-5',
    title: 'Load Sharing (Droop Control)',
    content: `### Coupled Motors
Imagine two motors driving the same conveyor belt shaft.
- **Problem**: If you give both motors 50.0Hz, one might spin at 1450RPM and the other at 1452RPM due to slight slip differences. The faster motor will take **100% of the load**, and the other will idle (or fight it).

### Droop Control (Softening)
We enable "Droop" (p1492).
- If torque increases, the drive automatically **reduces** speed slightly (e.g., by 0.5 Hz).
- **Result**: If Motor A takes too much load, it slows down. This forces Motor B to take more load. They naturally balance each other out.`
  },
  {
    id: 'l6-6',
    title: 'Kinetic Buffering (Vdc_min)',
    content: `### Riding Through Power Dips
What happens if the factory power dips for 200ms? Normally, the drive trips on F30003 (Undervoltage).

### Using Inertia
With **Kinetic Buffering (p1240=2)** enabled:
1. The drive detects the DC Bus voltage dropping.
2. It immediately regenerates energy from the spinning motor inertia (by lowering the frequency output).
3. This energy keeps the DC Bus alive and the electronics powered.
4. The motor slows down, but the drive stays **alive**. When power returns, it accelerates back up.
> **Use Case**: Critical fans or centrifuges in unstable grid areas.`
  },
  {
    id: 'l6-7',
    title: 'Drive Control Chart (DCC)',
    content: `### Custom Logic inside the Drive
**DCC (Drive Control Chart)** is a graphical programming tool that allows you to implement complex control and logic functions directly in the SINAMICS drive, reducing the load on the PLC.

---

### Common DCC Logic Blocks

#### 1. Boolean Operations (AND, OR, XOR)
- **AND**: Output is 1 only if all inputs are 1. (Used for interlocks).
- **OR**: Output is 1 if at least one input is 1. (Used for multiple start sources).
- **XOR**: Output is 1 if inputs are different. (Used for changeover detection).

#### 2. Flip-Flops (RS / SR)
- **Memory Blocks**: Used to "latch" a momentary signal.
- **RS Flip-Flop**: Reset has priority. If both Set and Reset are 1, the output is 0.
- **SR Flip-Flop**: Set has priority. If both are 1, the output is 1.
- *Application*: Creating a local Start/Stop latch using two physical pushbuttons.

#### 3. Timers (PDE, PDT, PULSE)
- **PDE (On-Delay)**: The output goes high only after the input has been high for a set time. (e.g., waiting for a brake to fully open).
- **PDT (Off-Delay)**: The output stays high for a set time after the input goes low. (e.g., keeping a cooling fan running after stop).
- **PULSE**: Generates a single pulse of a defined length regardless of input duration.

#### 4. Comparators (CMP)
- Compares two analog values (Input A vs Input B).
- **Output**: A digital bit (Binector) that is 1 if the condition is met (e.g., A > B).
- *Application*: Detecting when the motor has reached 90% of its rated speed to trigger a "Process Ready" signal.

#### 5. Analog Switches (NSW)
- **Function**: Selects between two analog inputs (Connector Inputs) based on a digital switch (Binector Input).
- **Logic**: If Switch = 0, Output = Input 1. If Switch = 1, Output = Input 2.
- *Application*: Selecting between a **Local Potentiometer** (r0752[0]) and a **Remote PLC Setpoint** (r2050[1]) using a physical selector switch on the cabinet (r0722.2).
- **BICO Example**: 
  - \`NSW_In1 := r0752[0]\` (Analog Input)
  - \`NSW_In2 := r2050[1]\` (Fieldbus PZD2)
  - \`NSW_Ctrl := r0722.2\` (Digital Input 2)
  - \`p1070 (Main Setpoint) := NSW_Out\`

#### 6. Limiters (LIM)
- **Function**: Clamps an analog signal between a defined Minimum and Maximum value.
- **Logic**: If Input > Max, Output = Max. If Input < Min, Output = Min.
- *Application*: Ensuring a user-defined speed setpoint from an HMI never exceeds the mechanical safety limit of the machine, regardless of what the PLC sends.
- **BICO Example**:
  - \`LIM_In := r2050[1]\` (Setpoint from PLC)
  - \`LIM_Max := 1500.0\` (Fixed Constant)
  - \`LIM_Min := 0.0\` (Fixed Constant)
  - \`p1070 (Main Setpoint) := LIM_Out\`

---

### BICO Interconnections
DCC blocks interact with the drive parameters using **BICO (Binector-Connector)** technology.

- **Binectors (B)**: Digital signals (0 or 1). Represented as \`rXXXX.x\`.
- **Connectors (K / CI)**: Analog signals (Speed, Current, Torque). Represented as \`rXXXX\`.

**How to connect:**
1. **Inputs**: You map the input of a DCC block to a drive parameter (e.g., \`Block_In := r0722.0\` for Digital Input 0).
2. **Outputs**: You map a drive parameter to the output of a DCC block (e.g., \`p0840 (ON/OFF1) := Block_Out\`).

> **Execution Groups**: DCC blocks are processed in "Execution Groups" (T1 to T10). You must assign your blocks to a group. A group assigned to **T1 (1ms)** runs much faster than **T5 (32ms)**. Fast logic like current limiting must be in T1, while slow logic like temperature monitoring can be in T10.`
  },
  {
    id: 'l6-8',
    title: 'Flying Restart & Automatic Restart',
    content: `### Handling Unpredictable Events
In industrial environments, power dips and mechanical jams are common. SINAMICS features built-in intelligence to "ride through" these events.

---

### 1. Flying Restart (p1200)
**The Problem**: A large fan is spinning at 1000 RPM due to wind or residual inertia. If you try to start the drive normally (starting from 0Hz), the drive will fight the spinning motor, causing a huge current spike and tripping on **F30001 (Overcurrent)**.

**The Solution**:
- When **p1200** is enabled, the drive "searches" for the motor speed first.
- It outputs a tiny current and sweeps the frequency until it finds the point where the motor is spinning.
- It then "catches" the motor at that frequency and ramps it to the setpoint.
- *Use Case*: Large fans, centrifuges, or any high-inertia load that takes a long time to stop.

---

### 2. Automatic Restart (p1210)
**The Problem**: A brief power dip causes the drive to trip. The factory is dark for 2 seconds, but then power returns. You don't want an operator to have to walk to 50 different drives to press "Reset".

**The Solution**:
- **p1210** allows the drive to automatically acknowledge faults and restart.
- **Modes**:
  - 1: Acknowledge all faults without restarting.
  - 4: Restart after power failure (if ON command is still present).
  - 6: Restart after *any* fault (with a limited number of attempts, e.g., 3).
- **Safety**: You must ensure that an automatic restart does not pose a danger to personnel.

---

### 3. Vdc_max Controller (p1240)
If the motor is braking too hard and the DC Link voltage is rising, the **Vdc_max controller** automatically increases the ramp-down time (ignoring your p1121 setting) to prevent an overvoltage trip. It "sacrifices" the stopping time to keep the drive alive.`
  }
];
