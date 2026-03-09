
import { Lesson } from '../types';

export const FUNDAMENTALS_LESSONS: Lesson[] = [
  {
    id: 'l2-1',
    title: 'Physics of AC Motors',
    content: `### The Water Analogy
To understand electricity in a motor, imagine water flowing through a pipe system.
- **Voltage (V)** = **Pressure**. How hard the electricity is "pushing". Higher voltage means more potential to do work.
- **Current (A)** = **Flow**. How much electricity is actually moving. This correlates directly to torque (force).
- **Resistance (R)** = **Pipe Restriction**. The friction in the wire.
- **Power (kW)** = **Pressure x Flow**. The total rate of work being done.

### The Rotating Magnetic Field
An AC motor is a transformer with a rotating secondary.
- **The Stator**: The stationary outer shell. It has copper coils arranged in 3 phases (120 degrees apart). When AC power is applied, it creates a magnetic field that spins around the motor casing.
- **The Rotor**: The rotating inner shaft. It has aluminum or copper bars (squirrel cage).
- **Induction**: The spinning magnetic field "cuts" the rotor bars, inducing a current in them. This current creates its *own* magnetic field.
- **Interaction**: The Stator's magnet attracts the Rotor's magnet, causing the rotor to spin.

> **Critical Concept: SLIP**
> An induction motor **cannot** run at synchronous speed. If the rotor spun at the exact same speed as the magnetic field, the field would not "cut" the bars, no current would be induced, and torque would drop to zero.
> Therefore, the rotor is always slightly lazy. A 4-pole motor (1500 RPM sync) actually runs at **1450 RPM**. This 50 RPM difference is called **Slip**. The heavier the load, the more the motor slips to generate more torque.`
  },
  {
    id: 'l2-2',
    title: 'Inside the Inverter (VFD)',
    content: `You will hear the terms "Inverter", "Drive", and "VFD" used interchangeably. Technically, the Inverter is just one part of the VFD.

### The Three Stages of a VFD
1. **Rectifier (AC to DC)**:
   The drive takes the dirty, variable 50Hz AC from the wall. Using a bridge of Diode rectifiers (like check valves for electricity), it converts this into DC.
   *Result: ~540V DC (for a 400V supply).*

2. **DC Link (The Capacitor Bank)**:
   This is the "Energy Reservoir".
   - **Filtering**: It smoothes out the 100Hz/300Hz ripples from the rectifier stage.
   - **Energy Buffer**: It stores energy to handle sudden load spikes and absorbs regenerative energy when the motor brakes.
   - **Voltage Stability**: It ensures the Inverter stage has a rock-solid DC voltage to work with.
   > **Safety Warning:** These capacitors hold lethal charge even after power is removed. Always wait 5 minutes before touching drive terminals!

3. **Inverter (DC to Variable AC)**:
   This is the brain. It uses **IGBTs** (Insulated Gate Bipolar Transistors).
   - **Switching Principle**: An IGBT is a hybrid component. It has the high input impedance of a MOSFET (easy to control with a small voltage at the **Gate**) and the high current-carrying capability of a Bipolar transistor.
   - **Speed**: They switch ON and OFF thousands of times per second (Switching Frequency, e.g., 4kHz or 8kHz).

### Pulse Width Modulation (PWM)
Since we only have a fixed DC voltage (540V), we can't just "turn down the volume". Instead, we vary the **width** of the pulses.
- **Wide Pulses**: High average voltage.
- **Narrow Pulses**: Low average voltage.
- By varying these widths in a sinusoidal pattern, the motor "sees" a smooth AC sine wave due to its own inductance.

### Modulation Strategies
How exactly do we decide when to flip the switches?
- **Sine-PWM**: The simplest method. Compares a reference sine wave with a high-frequency triangle wave.
- **SVPWM (Space Vector PWM)**: The SINAMICS standard.
  - **Concept**: Instead of treating 3 phases separately, it treats the entire motor voltage as a single **Vector** rotating in a 2D space.
  - **Efficiency**: SVPWM provides **15% better voltage utilization** than standard Sine-PWM.
  - **Smoothness**: It reduces harmonic distortion, meaning the motor runs cooler and quieter.

### Controlling Speed
- **Low Frequency (10Hz)**: The PWM pattern repeats slowly.
- **High Frequency (50Hz)**: The PWM pattern repeats at the grid rate.
- **Overspeed (80Hz)**: We pulse even faster, but eventually, we hit the "Voltage Limit" where the pulses are always ON (Square Wave).`
  },
  {
    id: 'l2-3',
    title: 'Drive-CLiQ Technology',
    content: `### What is Drive-CLiQ?
Drive-CLiQ is the "nervous system" of a SINAMICS drive. It is a high-speed, serial communication interface based on Ethernet (100 Mbps) that connects all components of the drive system.

### The Interface
- **Physical**: Uses standard RJ45 connectors, but with a ruggedized metal shell for industrial environments.
- **Cables**: Green or Yellow shielded cables.
- **Data**: It carries not just encoder signals, but also power unit data, temperature readings, and safe-stop signals (PROFIsafe).

### Electronic Nameplates (The "Plug & Play" Magic)
Every Drive-CLiQ component (Motor, Encoder, Power Module) has an internal memory chip containing its "Electronic Nameplate".
- **Automatic ID**: When you plug a motor into a SINAMICS drive via Drive-CLiQ, the drive instantly knows the motor's rated current, torque, voltage, and encoder resolution.
- **No Manual Entry**: You don't have to type in nameplate data (p0300, p0304, etc.). This eliminates human error during commissioning.

### Topology Rules
To keep the communication stable, you must follow specific rules:
1. **Line & Star**: You can daisy-chain components (Line) or use a Hub (Star).
2. **Control Unit as Master**: All strings must eventually lead back to the Control Unit (CU320-2 or CU310-2).
3. **Max Length**: Standard cables are limited to 100 meters.
4. **Sampling Rates**: You cannot mix too many high-speed components on a single port without affecting the current controller's clock cycle (e.g., 125µs).

> **Pro Tip**: Always use the "Topology View" in Startdrive to verify your wiring matches the project configuration. If the physical wiring differs from the software, the drive will trigger a **Topology Fault (F01360)**. `
  },
  {
    id: 'l2-4',
    title: 'Servo vs Induction Motors',
    content: `### 1. AC Induction (Asynchronous)
The workhorse. Simple, cheap, robust.
- **Mechanism**: Relies on Slip to generate torque.
- **Pros**: No magnets (cheap), can run direct-on-line, very durable.
- **Cons**: Efficiency is lower (heat in rotor), speed is not perfectly accurate due to slip.
- **Use Case**: Fans, Pumps, Conveyors, Compressors.

### 2. Servo (Synchronous)
The athlete. Precise, dynamic, expensive.
- **Mechanism**: The rotor contains Permanent Magnets. There is NO slip. The rotor locks onto the magnetic field perfectly.
- **Feedback**: Servos *always* have an encoder. The drive knows the rotor position down to the micrometer.
- **Pros**: Extreme acceleration, perfect positioning, high efficiency.
- **Cons**: Expensive, requires complex cables, cannot run without a drive.
- **Use Case**: Robot arms, CNC machines, Packaging lines, Printing presses.`
  },
  {
    id: 'l2-5',
    title: 'Star/Delta & The 87Hz Characteristic',
    content: `### Reading the Nameplate
Most IEC motors are dual voltage: **230V / 400V**.
- **Star (Y)**: High Voltage (400V). The windings are connected in series. Current is low.
- **Delta (Δ)**: Low Voltage (230V). The windings are connected in parallel. Current is high (x 1.73).

### The 87Hz Trick
Normally, if you have a 400V supply, you wire the motor in Star. It hits 400V at 50Hz.
**However**, if you have a **400V Inverter**, you can wire the motor in **Delta (230V)**.
1. The drive outputs 230V at 50Hz (Motor is happy).
2. But the drive has 400V available! So we can keep increasing the frequency.
3. We maintain the V/f ratio (Constant Flux) all the way up to **87Hz** where we reach 400V.

### Why do this?
- **Power = Torque x Speed**.
- Since we maintained Torque up to 87Hz (instead of 50Hz), we have increased the Speed by √3 (1.73).
- **Result**: You get **1.73x more Power** from the *same* physical motor. A 0.75kW motor acts like a 1.3kW motor.
- **Trade-off**: You must select a larger Drive (Inverter) because the Delta current is higher.`
  },
  {
    id: 'l2-6',
    title: 'Duty Cycles (S1 vs S6)',
    content: `### S1: Continuous Duty
The motor runs at constant load for a sufficient time to reach thermal equilibrium.
- **Example**: A ventilation fan running 24/7.
- **Selection**: Choose a motor/drive where Rated Power >= Load Power.

### S6: Continuous Operation with Intermittent Load
The machine runs in a cycle: e.g., 4 minutes at full load, 6 minutes at idle (no load).
- **Overload Capability**: SINAMICS drives have "Low Overload" (LO) and "High Overload" (HO) ratings.
- **HO (High Overload)**: 150% current for 60 seconds. Used for conveyors/hoists.
- **LO (Low Overload)**: 110% current for 60 seconds. Used for pumps/fans.
- **Engineering Trick**: If you have an S6 application (like a saw), you might be able to downsize the drive if the "average" heat generation is low, utilizing the thermal mass of the heatsink.`
  },
  {
    id: 'l2-7',
    title: 'Motor Cooling Methods',
    content: `### IC411 (Self-Ventilated)
The standard motor. It has a fan on the back shaft.
- **Problem**: When you run the motor at **10Hz** with a VFD, the fan spins slowly. It moves almost no air.
- **Risk**: The motor overheats if the load is high.
- **Solution**: Derate the torque at low speeds (don't run full load).

### IC416 (Forced Ventilation)
The motor has a separate electric fan (powered by 230V constant).
- **Benefit**: The cooling is 100% efficient even if the motor is stopped (0 RPM).
- **Application**: Required for VFD applications where the motor runs slowly with high torque (e.g., Winders, Extruders).`
  },
  {
    id: 'l2-8',
    title: 'Encoder Systems & Feedback',
    content: `### Why use an Encoder?
While a G120 can run a motor in "Sensorless" mode (calculating speed based on current), high-precision applications require a physical sensor to report the exact position and speed of the shaft.

---

### 1. Common Interface Types
- **HTL (High Threshold Logic)**: 24V signals. Robust against noise, but limited in speed. Used for simple conveyors.
- **TTL (Transistor-Transistor Logic)**: 5V signals. Very fast, but sensitive to electrical noise. Standard for most industrial motors.
- **SSI (Synchronous Serial Interface)**: Digital absolute encoder. It sends the exact position (e.g., 45.23 degrees) as a data packet.
- **Sin/Cos**: Analog 1Vpp signals. Provides extremely high resolution by interpolating the sine waves.

---

### 2. Drive-CLiQ Encoders
Siemens **Motion Control** motors (1FK7, 1FT7) usually come with integrated Drive-CLiQ encoders.
- **Benefits**: The encoder is powered and read via a single green cable. It includes an **Electronic Nameplate**, so the drive automatically knows the resolution (e.g., 20-bit or 24-bit).

---

### 3. Incremental vs. Absolute
- **Incremental**: Only counts pulses. If you power off the machine and move the shaft, the drive "forgets" where it is. You must **Home** the axis every time you start.
- **Absolute**: Remembers the position even without power.
  - **Single-turn**: Knows position within 360 degrees.
  - **Multi-turn**: Has internal gears or a battery to count up to 4096 full rotations.

> **Maintenance Tip**: If you see **F31110 (Signal A/B faulty)**, check the cable shielding. Encoder signals are tiny and easily disrupted by the high-frequency noise from the motor power cable.`
  },
  {
    id: 'l2-9',
    title: 'Vector vs. Servo Control',
    content: `SINAMICS supports different "Control Modes" (p1300). Choosing the right one is the difference between a smooth machine and a broken one.

---

### 1. V/f Control (p1300 = 0)
The simplest mode. The drive just outputs a voltage proportional to the frequency.
- **Analogy**: Driving a car by just holding the gas pedal at a fixed position.
- **Use Case**: Simple fans and pumps.

---

### 2. Vector Control (p1300 = 20/21)
The drive uses a complex mathematical model of the motor to separate the current into two components: **Magnetizing** (Flux) and **Torque-producing**.
- **Performance**: High torque at zero speed, excellent speed accuracy.
- **Analogy**: Cruise control. The drive adjusts the "gas" automatically to maintain speed regardless of the hill.
- **Use Case**: Cranes, Extruders, Heavy Conveyors.

---

### 3. Servo Control (p1300 = 26)
Optimized for **Permanent Magnet** motors and extreme dynamics.
- **Performance**: Highest possible bandwidth. Can accelerate from 0 to 3000 RPM in milliseconds.
- **Requirement**: Always requires an encoder.
- **Analogy**: A Formula 1 car. Extremely responsive but requires high-quality feedback to stay on track.
- **Use Case**: Packaging machines, Pick-and-place robots.

---

### Summary Table
| Feature | V/f | Vector | Servo |
| :--- | :--- | :--- | :--- |
| **Dynamics** | Low | Medium/High | Extreme |
| **Encoder** | Optional | Recommended | Mandatory |
| **Motor Type** | Induction | Induction/PM | PM (Servo) |`
  }
];
