
import { Lesson } from '../types';

export const HARDWARE_LESSONS: Lesson[] = [
  {
    id: 'l9-1',
    title: 'Control Units (CU) Architecture',
    content: `### The Brain of the System
The Control Unit calculates the control loops (speed, torque, position) and manages communication.

#### CU310-2 (Single Axis)
- **Application**: Designed for the S120 Blocksize (AC/AC) or simply mounting on a PM240-2.
- **Capacity**: Controls exactly **1 Axis**.
- **Interfaces**:
  - **X127**: LAN/Ethernet (Service interface for Web Server / Startdrive).
  - **X126**: PROFIBUS (on DP models).
  - **X150**: PROFINET (on PN models).
  - **X120/X130**: Onboard Digital I/O (Fail-safe capable).

#### CU320-2 (Multi-Axis)
- **Application**: The master controller for S120 Booksize (DC/AC) systems.
- **Capacity**:
  - Can control up to **6 Servo Axes** or **12 V/f Axes** with the "Performance Expansion" license.
  - Without the license, it is limited to 3 Servo axes.
- **Drive-CLiQ**: Features 4x Drive-CLiQ ports (X100-X103) to connect Motor Modules and Sensor Modules.
- **Option Board (TB30)**: Expansion slot for extra I/O or communication (CANopen, Analog Inputs).

> **Engineering Tip:** Always calculate the "Processor Load" in SIZER when using a CU320-2. If you add "Extended Safety" or "Positioning" to 6 axes, the CU might overload (>80% utilization), causing Fault F01054 (System Limit Exceeded).`
  },
  {
    id: 'l9-2',
    title: 'Power Modules: PM240-2 vs PM250',
    content: `Choosing the wrong power unit is a costly mistake.

#### PM240-2 (Standard Power Module)
- **Topology**: Diode Rectifier + DC Link + IGBT Inverter.
- **Braking**:
  - Frame Sizes A-C: **Built-in Braking Chopper**. You just connect a resistor to terminals R1/R2.
  - Frame Sizes D-G: usually require an external braking module.
- **Harmonics**: Standard 6-pulse rectifier. Generates line harmonics. May require a Line Reactor.
- **Use Case**: General purpose (Conveyors, Pumps, Hoists).

#### PM250 (Regenerative Power Module)
- **Topology**: Active "Smart" Rectifier (IGBT based) or F3E diode implementation.
- **Regeneration**: It can push energy **back to the grid**.
  - No Braking Resistor needed!
  - No Braking Module needed!
  - No Line Reactor needed (built-in filter).
- **Limitations**:
  - **Cannot** be connected to a GFCI (RCD) easily due to leakage currents.
  - Higher initial cost, but lower TCO (Total Cost of Ownership) due to energy savings.
- **Use Case**: High-inertia centrifuges, winders, or vertical hoists with frequent lowering.`
  },
  {
    id: 'l9-3',
    title: 'Feedback Systems: SMC Modules',
    content: `If the motor encoder cannot plug directly into the CU (D-Sub), you need a Sensor Module Cabinet-Mounted (SMC).

#### SMC30 (Square Wave / Pulse)
- **Encoder Types**: HTL (24V) and TTL (5V).
- **Typical Motors**: Standard Induction motors with 1024 ppr encoders.
- **Cable Length**: HTL is robust (up to 300m). TTL is sensitive (limited length).
- **Features**: Detects "Wire Break" but cannot detect rotor position for permanent magnet motors (no absolute track).

#### SMC20 (Sin/Cos)
- **Encoder Types**: SIN/COS 1Vpp, EnDat 2.1.
- **Resolution**: Extremely high. The drive interpolates the analog sine wave to get millions of increments per revolution.
- **Use Case**: Precision servo positioning.

#### SME (Sensor Module External)
- IP67 rated modules that mount directly on the machine, converting the encoder signal to Drive-CLiQ close to the motor to avoid noise interference.`
  },
  {
    id: 'l9-4',
    title: 'Output Filters',
    content: `Sometimes you need more than just a shielded cable between the drive and motor.

### Output Reactor (Choke)
- **Function**: Smooths the current spikes.
- **Use Case**: When cable length > 50m. It reduces the capacitive charging current of long cables which can trip the drive (F30001).

### dV/dt Filter
- **Function**: Slows down the voltage rise time.
- **Use Case**: When using older motors with weak insulation (retrofits). Standard VFD pulses can punch holes in old insulation. This filter protects the motor windings.

### Sine Wave Filter
- **Function**: Converts the square PWM wave back into a near-perfect Sine Wave.
- **Use Case**:
  - Extremely long cables (> 200m).
  - Noise sensitive environments (Hospitals).
  - Reducing motor audible noise (hum).
> **Note**: You must switch the drive control mode to V/f and lower the switching frequency when using Sine Wave filters.`
  },
  {
    id: 'l9-5',
    title: 'Braking Systems & Line Modules',
    content: `### Managing Regenerative Energy
When a motor slows down a heavy load, it acts as a generator. This energy flows back into the drive's DC Link. If not managed, the DC Link voltage will rise until the drive trips on **F30002 (Overvoltage)**.

---

### 1. Braking Resistors (The "Heater")
- **Mechanism**: A **Braking Chopper** (electronic switch) detects high DC voltage and dumps the excess energy into a resistor, where it is dissipated as heat.
- **Pros**: Cheap, simple.
- **Cons**: Energy is wasted as heat. Fire hazard if improperly sized.

---

### 2. Line Modules (S120 Booksize)
In multi-axis systems, the "Rectifier" is a separate module.
- **Basic Line Module (BLM)**: Simple diode bridge. No regeneration. Requires a braking resistor.
- **Smart Line Module (SLM)**: Uses IGBTs to allow energy to flow back to the grid. 100% regenerative.
- **Active Line Module (ALM)**: The "Gold Standard".
  - **Regenerative**: Pushes energy back to the grid.
  - **Regulated DC Link**: Maintains a constant DC voltage (e.g., 600V) regardless of grid fluctuations.
  - **Clean Power**: Low harmonics (THDi < 5%). Acts as a power factor corrector.

---

### 3. Dynamic Braking (p1230)
Instead of a resistor, the drive can inject **DC Current** into the motor windings.
- **Effect**: Creates a stationary magnetic field that "drags" the rotor to a stop.
- **Trade-off**: The energy is turned into heat *inside* the motor. Only for occasional stops.`
  },
  {
    id: 'l9-6',
    title: 'Motor Holding Brakes',
    content: `### Safety for Vertical Loads
A mechanical holding brake is essential for hoists or vertical axes to prevent the load from falling when power is removed.

---

### 1. Control Parameters
- **p1215**: Brake configuration.
  - 0: No brake.
  - 1: Motor holding brake according to sequence.
  - 3: Brake via external BICO.
- **p1216**: Opening time (ms). The time the drive waits for the brake to physically open before starting the ramp.
- **p1217**: Closing time (ms). The time the drive holds torque after the brake command is sent to ensure the brake has physically closed.

---

### 2. The Sequence
1. **Start Command**: Drive magnetizes the motor and builds up "Holding Torque".
2. **Open Brake**: Drive sends the signal to the brake relay.
3. **Wait (p1216)**: Drive stays at 0 RPM while the brake mechanically releases.
4. **Ramp**: Drive starts moving.
5. **Stop**: Drive ramps to 0 RPM.
6. **Close Brake**: Drive sends the signal to close the brake.
7. **Hold (p1217)**: Drive maintains full torque until the brake is mechanically locked.
8. **Pulses Off**: Drive cuts power.

> **Warning**: Never use a holding brake for "Dynamic Braking" (stopping a moving load). It is designed only to *hold* a stationary load. Using it to stop will wear out the friction pads in days.`
  }
];
