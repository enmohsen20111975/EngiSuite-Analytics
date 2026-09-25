
import { Lesson } from '../types';

export const MAINTENANCE_LESSONS: Lesson[] = [
  {
    id: 'l5-1',
    title: 'Preventive Maintenance',
    content: `### The #1 Killer: Heat & Dust
- **Fans**: SINAMICS fans have a service life (typ. 40,000 hrs). Check p0251 (Operating hours fan). Replace *before* failure.
- **Heatsinks**: If clogged with dust, the IGBTs overheat. Blow out with compressed air annually.

### DC Link Capacitors
Electrolytic capacitors dry out over time.
- **Reforming**: If a spare drive sits on a shelf for >2 years, the capacitors degrade. You must "reform" them by applying voltage slowly using a variable transformer (Variac) or a resistor circuit before full power.`
  },
  {
    id: 'l5-2',
    title: 'Diagnostic Tools',
    content: `### The Trace Function (Startdrive)
Better than any oscilloscope.
- Trigger on "Fault Active".
- Record: Actual Current, DC Link Voltage, Torque.
- Result: You can see exactly what happened 500ms before the IGBT blew up.

### LED Patterns
- **RDY Green**: Healthy.
- **RDY Flashing Green**: Commissioning mode.
- **RDY Red**: Fault.
- **BF (Bus Fault) Red**: Profinet cable unplugged or PLC not in Run mode.`
  },
  {
    id: 'l5-3',
    title: 'Hardware Replacement Strategy',
    content: `### Control Unit (CU) Replacement
The "Brain" of the drive.
1. **SD Card**: All parameter data is stored on the memory card.
2. **Swap**: Power off, remove the old CU, insert the SD card into the new CU.
3. **Power On**: The new CU detects the card and automatically loads the firmware and parameters. No laptop needed!

### Power Module (PM) Replacement
The "Muscle" of the drive.
1. **Swap**: Replace the damaged PM.
2. **Power On**: The CU detects a new Power Module.
3. **Commissioning**: You usually need to perform a "Download" from the project or run a quick Motor ID, as the new IGBT characteristics might be slightly different.`
  },
  {
    id: 'l5-4',
    title: 'Decoding the Fault Buffer',
    content: `### p0947: Fault Code History
The drive stores the last 8 faults.
- **p0947[0]**: Most recent fault (e.g., 30002).
- **p0947[1]**: The fault before that.

### p0949: The "Fault Value"
This is the most important (and ignored) parameter. It gives context to the fault.
- **Example**: F07900 (Motor Blocked)
  - If Fault Value = 1: It was speed deviation.
  - If Fault Value = 2: It was torque limit.
- **Action**: Look up the specific Fault Value in the List Manual to find the exact root cause.`
  },
  {
    id: 'l5-5',
    title: 'Advanced Tracing & Oscilloscope',
    content: `### The Built-in Oscilloscope
The **Trace** function in Startdrive is a powerful diagnostic tool that records high-speed data directly in the drive's memory, bypassing the communication delay of the fieldbus.

---

### 1. Recording Signals
You can record up to 8 signals simultaneously at the current controller clock cycle (e.g., 125µs).
- **Standard Signals**: Actual Speed, Torque, DC Link Voltage, Current.
- **Bit Signals**: You can trace individual bits (Binectors) like "Brake Open" or "Fault Active" to see exactly when they flip relative to the analog values.

---

### 2. Triggering
A trace is useless if you don't catch the event.
- **Immediate**: Starts when you click the button.
- **On Fault**: Automatically records the 500ms before and after a drive trip.
- **On Signal Edge**: Starts when a specific bit (e.g., Digital Input 0) goes high.
- **On Value Threshold**: Starts when Current > 150% (to catch intermittent mechanical jams).

---

### 3. Analyzing the Curve
- **Cursor Measurement**: Measure the exact time between two events (e.g., "How long did it take for the speed to reach 90%?").
- **FFT Analysis**: Perform a Fast Fourier Transform on the speed signal to identify mechanical vibration frequencies.
- **Superposition**: Overlay a "Good" trace from last month with a "Bad" trace from today to see what has changed in the machine's behavior.`
  }
];
