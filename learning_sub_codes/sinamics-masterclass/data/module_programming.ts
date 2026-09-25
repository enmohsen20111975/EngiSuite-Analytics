
import { Lesson } from '../types';

export const PROGRAMMING_LESSONS: Lesson[] = [
  {
    id: 'l4-1',
    title: 'Commissioning with Startdrive',
    content: `### What is Startdrive?
Startdrive is the engineering software for SINAMICS, fully embedded inside **TIA Portal**. This means you configure your PLC, HMI, and Drive in the exact same project file.

### Step-by-Step Commissioning
1. **Device Configuration**: Drag the drive from the hardware catalog into your network view. Connect it to the PLC's PROFINET line.
2. **Wizard**: The drive launches a setup wizard.
   - **Data Set**: Choose "Drive Data Set 0".
   - **Motor Selection**: Pick your exact motor code (1LE1...) from the list. If it's a 3rd party motor, enter the nameplate data (V, A, kW, RPM, Hz).
   - **Brake**: Do you have a holding brake? (p1215).
   - **Important Parameters**:
     - *Min Speed (p1080)*: Usually 0.
     - *Max Speed (p1082)*: Usually 1500 or 3000.
     - *Ramp Up (p1120)*: How fast to accelerate. 10s is standard for fans, 1s for servos.
     - *Ramp Down (p1121)*: How fast to stop.
3. **Download**: Click "Load to device". The software compiles the parameters and sends them to the drive.
4. **RAM to ROM**: **Crucial Step!** After downloading, you must click "Copy RAM to ROM". If you don't, the drive will lose all settings when you power cycle it.`
  },
  {
    id: 'l4-2',
    title: 'Logic: The Start Sequence',
    content: `A common frustration for beginners: "I sent the Start signal, but the drive won't run!"
This is usually because you violated the **State Machine**.

### The "Ready" Chain
The drive has a safety checklist it runs constantly. It will NOT start if:
- **OFF2 is Missing (0)**: This is "Coast Stop". It is usually linked to a physical E-Stop button. If the circuit is open (0), the drive is dead.
- **OFF3 is Missing (0)**: "Fast Stop".
- **Operation Inhibited**: The drive is waiting for a rising edge.

### The Proper Sequence
To start a drive via PLC (Telegram 1):
1. **Send 16#047E**: (Bits: 0000 0100 0111 1110).
   - This sets OFF2=1, OFF3=1, EnableOp=1.
   - But **ON/OFF1 is 0**.
   - The drive enters state: "Ready to Switch On".
2. **Wait** for Status Word (ZSW1) to say "Ready to Switch On".
3. **Send 16#047F**: (Bits: ... 1111).
   - This flips Bit 0 to **1**.
   - The drive detects the *Rising Edge* and starts the motor.

> **Tip**: Never just keep sending "047F". If the drive trips on a fault and you reset it, it will NOT restart if the signal is still static "High". You must toggle Bit 0 Low (047E), then High (047F) again.`
  },
  {
    id: 'l4-3',
    title: 'Safety Configuration (STO/SS1)',
    content: `Safety is no longer about big red relays. It's about data.

### Hardwired Safety (Basic)
- Terminals 31 and 32 on the Control Unit.
- You wire a dual-channel 24V signal from a Pilz relay or S7-1200 Safety Output.
- When power is cut, the drive executes **STO (Safe Torque Off)**. The IGBTs are physically disconnected from the motor. The motor coasts.

### PROFIsafe (Advanced)
- The Safety signal is sent via the yellow PROFINET cable.
- **Requires**: F-PLC (e.g., S7-1500F) and a Safety License in the Drive.
- **Benefits**:
  - **Zone Control**: You can group drives into zones in software. "If Door 1 opens, stop Drives 1, 2, 2, and 3".
  - **SS1 (Safe Stop 1)**: Instead of coasting (STO), the drive actively brakes the motor to a stop, *then* cuts power. Essential for high-inertia loads like saws or centrifuges.
  - **SLS (Safely Limited Speed)**: "If the operator enters the cage, slow down to 20 RPM, but don't stop."`
  },
  {
    id: 'l4-4',
    title: 'Data Sets: CDS & DDS',
    content: `One of the most powerful features of SINAMICS is the ability to change its personality instantly using **Data Sets**.

### CDS (Command Data Set)
- Controls **Input Signals**.
- *Example*:
  - **CDS 0 (Local)**: Command Source = Terminals. Setpoint = Potentiometer.
  - **CDS 1 (Remote)**: Command Source = Fieldbus. Setpoint = PLC.
- You can map a Digital Input (e.g., DI 3) to "Bit 0 of CDS switch". When DI 3 goes high, the drive instantly ignores the terminals and listens to the PLC.

### DDS (Drive Data Set)
- Controls **Motor Parameters**.
- *Example*: One drive runs two different motors (not simultaneously) via a contactor switch.
  - **DDS 0**: Motor A (5kW Induction).
  - **DDS 1**: Motor B (2kW Servo).
- When the contactor switches, the PLC tells the drive to swap DDS. The drive loads the new motor model, current limits, and PID gains instantly.

> **Setup**: You enable this in the "Configuration" mask in Startdrive by checking "Drive Data Sets".`
  },
  {
    id: 'l4-5',
    title: 'Parameter Structure (p vs r)',
    content: `### "p" Parameters (Adjustable)
These are values you can write to.
- **p1120**: Ramp Up Time.
- **p0700**: Command Source.
- **Indices**: Some parameters have arrays, e.g., p2000[0] is for DDS0, p2000[1] is for DDS1.

### "r" Parameters (Read-Only)
These are monitoring values calculated by the drive. You cannot change them directly.
- **r0027**: Actual Current.
- **r0063**: Actual Speed.
- **r0722**: Digital Input Status (Bitmask).
- **Tip**: You often "connect" r-parameters to p-parameters using BICO technology.`
  },
  {
    id: 'l4-6',
    title: 'Resonance Suppression',
    content: `### The Vibration Problem
Every machine has a "Natural Frequency". If you run a fan at exactly 33Hz, the whole frame might start shaking violently due to resonance.

### The Solution: Skip Frequencies (p1091)
You can tell the drive to avoid specific speeds.
- **p1091**: Center Frequency (e.g., 33 Hz).
- **p1101**: Bandwidth (e.g., 2 Hz).
- **Result**: If the setpoint is 33Hz, the drive will automatically run at either 31Hz or 35Hz. It will "jump" over the danger zone during ramping, preventing continuous vibration.`
  },
  {
    id: 'l4-7',
    title: 'Control & Status Word Reference',
    content: `### PROFIdrive Telegram Structure
In SINAMICS, communication with a PLC is standardized via **Telegrams**. The first word of every telegram is the **Control Word (STW)** and the first word returned is the **Status Word (ZSW)**.

---

### Control Word 1 (STW1) - PLC to Drive
| Bit | Name | Description | Hex Mask |
|:---|:---|:---|:---|
| 0 | ON / OFF1 | 1 = Start (Ramp down to 0 on 0). | 16#0001 |
| 1 | No OFF2 | 1 = No Coast Stop. Must be 1 to run. | 16#0002 |
| 2 | No OFF3 | 1 = No Fast Stop. Must be 1 to run. | 16#0004 |
| 3 | Enable Op | 1 = Enable Operation (Pulses on). | 16#0008 |
| 4 | Enable Ramp | 1 = Ramp generator active. | 16#0010 |
| 5 | Unfreeze Ramp| 1 = Continue ramping. | 16#0020 |
| 6 | Enable Setpt | 1 = Setpoint valid. | 16#0040 |
| 7 | Fault Ack | 0 -> 1: Resets active faults. | 16#0080 |
| 10 | PLC Control | 1 = PLC has control rights. | 16#0400 |
| 11 | Reverse | 1 = Invert setpoint direction. | 16#0800 |

**Typical Start Masks:**
- **16#047E**: Ready to start (OFF2/3=1, EnableOp=1, PLC=1).
- **16#047F**: Start command (All above + ON=1).

---

### Control Word 2 (STW2) - PLC to Drive
Used for advanced functions like master-slave synchronization and watchdog monitoring.

| Bit | Name | Description | Hex Mask |
|:---|:---|:---|:---|
| 0-3 | DDS Select | Selects Drive Data Set (0-15). | 16#000F |
| 8 | Traverse Fixed | 1 = Traverse to fixed stop. | 16#0100 |
| 9 | Remote/Local | 1 = Control via PLC. | 16#0200 |
| 12-15 | Master Sign of Life | Watchdog counter (0-15). | 16#F000 |

**Master Sign of Life (Watchdog):**
The PLC must increment this 4-bit counter every communication cycle. If the drive detects that the value has stopped changing, it assumes the PLC has crashed or the cable is cut, and trips on **F01910 (Setpoint Timeout)**.

---

### Status Word 1 (ZSW1) - Drive to PLC
| Bit | Name | Description | Hex Mask |
|:---|:---|:---|:---|
| 0 | Ready to On | Power is OK. Waiting for Bit 0 of STW1. | 16#0001 |
| 1 | Ready to Run | DC Link charged. Waiting for Bit 3. | 16#0002 |
| 2 | Op Enabled | **Drive is Running.** | 16#0004 |
| 3 | Fault | Drive has a Fault (Stopped). | 16#0008 |
| 4 | No OFF2 | 1 = No Coast Stop active. | 16#0010 |
| 5 | No OFF3 | 1 = No Fast Stop active. | 16#0020 |
| 6 | On Inhibit | 1 = Restart required (Toggle Bit 0). | 16#0040 |
| 7 | Alarm | Drive has a Warning (Still running). | 16#0080 |
| 8 | Speed Dev | Actual speed matches Setpoint. | 16#0100 |
| 9 | Control Req | 1 = Drive requests PLC control. | 16#0200 |
| 10 | f_reached | Ramp generator finished. | 16#0400 |
| 11 | Limit reached | Torque or Current limit active. | 16#0800 |

---

### Status Word 2 (ZSW2) - Drive to PLC
Provides additional feedback on the drive's internal state.

| Bit | Name | Description | Hex Mask |
|:---|:---|:---|:---|
| 0-3 | Active DDS | Indicates currently active Drive Data Set. | 16#000F |
| 5 | Magnetized | 1 = Motor is magnetized (Flux ready). | 16#0020 |
| 8 | Speed < Min | 1 = Speed is below p1080. | 16#0100 |
| 10 | Torque < Limit | 1 = Torque is within limits. | 16#0400 |
| 12-15 | Slave Sign of Life | Echo of the Master Sign of Life. | 16#F000 |

---

### BICO Interconnections (Drive Side)
To make these bits work, they must be "wired" internally in the drive using BICO parameters.

**Typical STW2 Connections:**
- **DDS Selection**: \`p0820 := r2091.0\` (Bit 0), \`p0821 := r2091.1\` (Bit 1).
- **Master Sign of Life**: \`p2047 := r2091.12\` (Starts at Bit 12).

**Typical ZSW2 Connections:**
- **Magnetized**: \`p2081[4] := r0056.4\` (Connects "Motor Magnetized" to ZSW2 Bit 5).
- **Torque Limit**: \`p2081[9] := r1407.7\` (Connects "Torque Limit Reached" to ZSW2 Bit 10).

---

### PLC Programming Example (SCL)
\`\`\`scl
// 1. Handle Fault Reset (STW1)
IF #ResetButton THEN
    #DriveSTW1 := #DriveSTW1 OR 16#0080; // Set Bit 7
ELSE
    #DriveSTW1 := #DriveSTW1 AND 16#FF7F; // Clear Bit 7
END_IF;

// 2. Control Logic (STW1)
IF #StartCommand AND NOT #DriveZSW1.%X3 THEN // Start if no fault
    #DriveSTW1 := 16#047F; // Start Sequence
ELSE
    #DriveSTW1 := 16#047E; // Stop / Ready
END_IF;

// 3. Watchdog: Master Sign of Life (STW2)
// Increment 4-bit counter (0-15) every cycle
#MasterSoL := (#MasterSoL + 1) MOD 16;
#DriveSTW2 := (#DriveSTW2 AND 16#0FFF) OR SHL(IN := INT_TO_WORD(#MasterSoL), N := 12);

// 4. Check Slave Sign of Life (ZSW2)
// If SlaveSoL != MasterSoL, communication might be lagging
#SlaveSoL := WORD_TO_INT(SHR(IN := #DriveZSW2, N := 12) AND 16#000F);

// 5. Speed Setpoint (16384 = 100% Speed)
#DriveSpeedSetpoint := REAL_TO_INT((#TargetRPM / 1500.0) * 16384.0);
\`\`\`

### Common Pitfalls
1. **Bit 10**: If you don't set Bit 10 (PLC Control), the drive will ignore every other bit you send!
2. **OFF2/OFF3**: These are "Active Low" in the logic. They must be **1** for the drive to move. If your PLC sends 0, the drive will never start.
3. **BICO Mapping**: By default, STW2/ZSW2 bits are often **unmapped**. You must manually configure the \`p2081\` (ZSW1/2) and \`p2091\` (STW1/2) parameters in the drive to see the data in your PLC.`
  },
  {
    id: 'l4-8',
    title: 'Profibus vs PROFINET',
    content: `### The Evolution of Drive Communication
In the SINAMICS world, you will encounter two main "languages" for communication: **Profibus DP** (the legacy standard) and **PROFINET IO** (the modern standard).

---

### Comparison Table
| Feature | Profibus DP | PROFINET IO |
|:---|:---|:---|
| **Physical Layer** | RS485 (Purple Cable) | Ethernet (Green Cable) |
| **Connector** | 9-pin D-Sub | RJ45 or M12 |
| **Max Speed** | 12 Mbps | 100 Mbps / 1 Gbps |
| **Addressing** | Hardware Switches (Node ID) | Device Name & IP Address |
| **Topology** | Line (Daisy Chain) | Star, Tree, Ring, Line |
| **Safety** | PROFIsafe (via Profibus) | PROFIsafe (via PROFINET) |

---

### Key Differences in SINAMICS

#### 1. Addressing and Identification
- **Profibus**: You physically set a DIP switch on the Control Unit (e.g., Address 3). The PLC looks for "Slave 3".
- **PROFINET**: The drive is identified by its **"Device Name"** (e.g., "conveyor-drive-01"). The IP address is assigned automatically by the PLC based on this name.

#### 2. Performance and Bandwidth
- **Profibus** is strictly cyclic. It's great for simple speed control but slow for large parameter transfers.
- **PROFINET** supports **IRT (Isochronous Real-Time)**. This allows for sub-millisecond synchronization between multiple drives, essential for high-speed motion control (Electronic Gearing, Camming).

#### 3. Diagnostics
- **PROFINET** allows you to access the drive's built-in **Web Server** using a standard laptop browser. You can view faults, check parameters, and even operate the drive without specialized software.
- **Profibus** diagnostics are limited to what the PLC can pull via the telegram.

#### 4. Telegram Usage
Both protocols use the **PROFIdrive** profile. This means that whether you use Profibus or PROFINET, the **STW1** and **ZSW1** bits remain identical. This makes it easy to migrate old Profibus projects to modern PROFINET hardware.

---

### Which one to choose?
- **Choose PROFINET** for all new projects. It's faster, supports better diagnostics, and is the industry standard.
- **Encounter Profibus** primarily in "Brownfield" projects (older factories) or when replacing legacy 6SE70 or G110 drives.`
  },
  {
    id: 'l4-9',
    title: 'BICO Technology Deep Dive',
    content: `### What is BICO?
**BICO** stands for **Bi**nector-**Co**nnector technology. It is the internal "wiring" system of a SINAMICS drive. Instead of physical wires, you use parameter numbers to connect signals.

---

### 1. The Components
- **Connectors (K / CI)**: Analog signals.
  - *Examples*: Speed setpoint, actual current, torque limit.
  - *Analogy*: A 0-10V or 4-20mA analog wire.
  - *Representation*: \`rXXXX\` (e.g., \`r0063\` is Actual Speed).
- **Binectors (B / BI)**: Digital signals (0 or 1).
  - *Examples*: Start command, fault active, digital input status.
  - *Analogy*: A 24V digital wire.
  - *Representation*: \`rXXXX.x\` (e.g., \`r0722.0\` is Digital Input 0).

---

### 2. How to "Wire" (The Sink Principle)
In BICO, you always go to the **Target (Sink)** and tell it where to get its signal from.
- **CI (Connector Input)**: A parameter that expects an analog signal.
- **BI (Binector Input)**: A parameter that expects a digital signal.

#### Example: Local/Remote Speed Control
You want to use **Digital Input 3** to switch between a **Potentiometer** and the **PLC Setpoint**.
1. **The Switch**: We use the CDS (Command Data Set) bit.
   - \`p0810 := r0722.3\` (Map DI 3 to CDS Bit 0).
2. **The Setpoints**:
   - In CDS 0: \`p1070[0] := r0752[0]\` (Main setpoint = Analog Input 0).
   - In CDS 1: \`p1070[1] := r2050[1]\` (Main setpoint = Fieldbus PZD 2).

---

### 3. Visualizing with Function Diagrams
Siemens provides **Function Diagrams** (in the List Manual) that show the internal flow.
- A line with an arrow entering a box is a **BICO Input** (p-parameter).
- A value coming out of a box is a **BICO Output** (r-parameter).

### 4. Advanced Logic with DCC
If standard BICO isn't enough, you use **DCC (Drive Control Chart)** to add logic blocks (AND, OR, Timers) between the BICO signals.

> **Pro Tip**: When troubleshooting, use the "Interconnections" view in Startdrive. It shows a graphical "wiring diagram" of all BICO connections for a specific parameter, making it easy to see why a signal isn't reaching its destination.`
  }
];
