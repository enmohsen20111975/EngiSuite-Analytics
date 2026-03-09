
import { Lesson } from '../types';

export const COMMISSIONING_LESSONS: Lesson[] = [
  {
    id: 'l3-1',
    title: 'Wiring & Installation',
    content: `### EMC Guidelines (Electro-Magnetic Compatibility)
VFDs are noisy. They switch high currents at high frequencies.
1. **Shielding**: Motor cables MUST be shielded. The shield must be grounded at BOTH ends (Drive plate and Motor gland) using 360-degree clamps.
2. **Separation**: Keep signal cables (24V, Encoder) at least 20cm away from Motor cables.
3. **Equipotential Bonding**: Use thick grounding straps between cabinets and machine beds to prevent ground loops.

### Essential Terminals (G120)
- **DI 0**: Usually ON/OFF command.
- **AI 0**: Speed setpoint (0-10V or 4-20mA).
- **STO (Safe Torque Off)**: Terminals 31 & 32. Must be bridged (or connected to safety relay) for the drive to run.`
  },
  {
    id: 'l3-2',
    title: 'Commissioning Methods',
    content: `### 1. BOP-2 (Basic Operator Panel)
The small keypad that snaps onto the front.
- Good for: Simple conveyors, pumps.
- Process: Use the "Quick Commissioning" wizard. Input Motor Voltage, Current, Power, RPM. Perform Motor ID.

### 2. Startdrive (TIA Portal)
The professional method.
- **Wizard**: Graphical selection of Motor and Encoder from the Siemens database.
- **Optimization**: Visual tuning of PID loops.
- **Backup**: Saves parameters to the project file.

### 3. Web Server
Newer CU modules (G120X, S210) have a built-in web server. You can commission them via Wi-Fi using an iPad.`
  },
  {
    id: 'l3-3',
    title: 'Motor Data Identification (Mot-ID)',
    content: `### Why do we need it?
Every motor is different. Even two motors from the same batch have slightly different copper resistance and inductance. The Drive needs to know the exact **Electrical Model** of the motor to control it precisely.

---

### 1. Standstill Measurement (p1900 = 2)
The drive injects DC current pulses while the motor is stationary.
- **Measures**: Stator resistance (including cable), leakage inductance.
- **Safety**: Safe to perform even if the motor is connected to the load.
- **Requirement**: Must be done after every motor or cable replacement.

---

### 2. Rotating Measurement (p1900 = 1)
The drive actually spins the motor (usually up to 50% speed).
- **Measures**: Magnetizing current, saturation characteristic, and moment of inertia.
- **Performance**: Essential for high-performance **Vector Control**.
- **Requirement**: The motor **must be decoupled** from the load (no belt, no gearbox) because the drive needs to measure the "naked" motor inertia.

---

### 3. Encoder Adjustment
If you have a Synchronous (Servo) motor, the drive must also perform an **Encoder Pole Position Identification**. It needs to know exactly where the rotor magnets are relative to the encoder's zero pulse.`
  },
  {
    id: 'l3-4',
    title: 'Firmware Upgrades',
    content: `### Managing Firmware
Sometimes you need to upgrade the drive firmware (e.g., to fix bugs or support new safety features).
1. **The SD Card**: Use a generic SD card (max 2GB for older units, up to 32GB for newer).
2. **File Structure**: Download the zip from Siemens Support. Extract the "CONTENT.TXT" and folders to the root of the card.
3. **Procedure**:
   - Power OFF.
   - Insert Card.
   - Power ON.
   - The RDY LED will flash Orange/Red rapidly. **DO NOT POWER OFF**.
   - When RDY stops flashing, power OFF, remove card, power ON.

> **Warning**: Never interrupt a firmware update. It can "brick" the Control Unit.`
  },
  {
    id: 'l3-5',
    title: 'BOP-2 Mastery',
    content: `### Navigation Secrets
The BOP-2 has a specific menu structure.
- **MON (Monitor)**: View read-only values (Hz, Amps, RPM).
- **PAR (Parameter)**: Access to all p-codes.
- **SETUP**: Launches the wizard.
- **EXTRAS**:
  - *To Card*: Backup parameters to SD card (Clone).
  - *From Card*: Restore parameters from SD card.
  - *Reset*: Factory Reset (dr).

### Key Combos
- **Hand/Auto**: Switches between Terminal control and Keypad control.
- **Esc (Hold 3s)**: Returns to the top-level status screen.`
  },
  {
    id: 'l3-6',
    title: 'One-Button Tuning (OBT)',
    content: `### Automatic Optimization
For S120 and S210 drives, Siemens introduced **One-Button Tuning (OBT)**. This replaces hours of manual PID tweaking with a 30-second automated test.

---

### 1. How it Works
1. You set the **Dynamic Factor** (e.g., 100% for standard, 150% for aggressive).
2. You set the **Max Traversing Distance** (to ensure the machine doesn't hit a hard stop).
3. The drive performs a series of "jerks" and oscillations.
4. It measures the mechanical resonance and calculates the optimal **Kp** and **Tn** for the speed and position loops.

---

### 2. Frequency Response Analysis (Bode Plot)
Startdrive can plot the **Bode Diagram** of your machine.
- It shows the "Gain" and "Phase" across a frequency spectrum (1Hz to 1000Hz).
- **Resonance Detection**: If the plot has a huge spike at 45Hz, you know your mechanical frame is vibrating there.
- **Active Suppression**: The drive can automatically configure **Notch Filters** to "cancel out" those specific frequencies, allowing you to run a high-gain controller without making the machine shake.`
  }
];
