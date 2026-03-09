
import { Lesson } from '../types';

export const SIMULATION_LESSONS: Lesson[] = [
  {
    id: 'l8-1',
    title: 'SIZER: Drive Selection Tool',
    content: `### Don't Guess, Calculate
SIZER is the engineering tool to select the correct hardware.
1. **Mechanical Mechanics**: You enter the physics of your machine (Conveyor, Hoist, Rotary Table).
   - Mass: 500kg
   - Friction: 20N
   - Speed: 1m/s
2. **Calculation**: SIZER calculates the required Torque and Power.
3. **Selection**: It recommends the Motor and Inverter combination.
4. **Result**: Generates a parts list and a "Load Cycle" graph to prove the motor won't overheat.`
  },
  {
    id: 'l8-2',
    title: 'DT Configurator',
    content: `### Digital Twin Configuration
The Drive Technology (DT) Configurator allows you to build a valid part number.
- **Consistency Check**: It prevents you from selecting incompatible parts (e.g., a 400V Motor with a 230V Inverter).
- **CAD Data**: Instantly download 3D STEP files for your mechanical engineers and EPLAN macros for your electrical designers.`
  },
  {
    id: 'l8-3',
    title: 'Network Simulation with SINETPLAN',
    content: `### Ensuring PROFINET Stability
As automation systems grow, the complexity of the network increases. **SINETPLAN** (Siemens Network Planner) is the tool used to simulate and validate the PROFINET network load before the first cable is even laid.

---

### Why Simulate the Network?
In a large plant with 50+ drives, multiple PLCs, and HMI systems, the network carries different types of traffic:
1. **Cyclic Data (RT/IRT)**: High-priority drive control data.
2. **Acyclic Data**: Parameter changes, diagnostics.
3. **Standard IT Traffic (NRT)**: Web servers, camera feeds, file transfers.

**The Risk**: If standard IT traffic (NRT) spikes, it can "crowd out" the critical drive control data, leading to **F01910 (Setpoint Timeout)** faults and production stops.

---

### Key Features of SINETPLAN

#### 1. Network Load Calculation
SINETPLAN calculates the **Network Load** for every port on every switch. 
- It accounts for the **Update Time** (e.g., 2ms) and the **Telegram Size** of every drive.
- It identifies "Bottlenecks" where the bandwidth utilization exceeds the recommended 50% limit.

#### 2. Worst-Case Analysis
The tool simulates "Worst-Case" scenarios, such as a burst of acyclic traffic or a camera stream starting up, to see if the high-priority RT/IRT data still arrives within its deadline.

#### 3. TIA Portal Integration
You can import your hardware configuration directly from **TIA Portal** (via AML file) into SINETPLAN. This saves hours of manual data entry and ensures the simulation matches the real project.

#### 4. Pcap Import & Analysis
If an existing plant is having mysterious communication drops, you can capture the real traffic using a tool like Wireshark (**Pcap file**) and import it into SINETPLAN. The tool will "replay" the traffic and highlight exactly which device is causing the congestion.

---

### Result: The "Green" Network
The output of SINETPLAN is a detailed report proving that the network design is robust. 
- **Validation**: Confirms that all PROFINET update times are achievable.
- **Optimization**: Suggests moving devices to different switch ports or using **VLANs** to segregate traffic.
- **Peace of Mind**: Eliminates the risk of "random" communication faults during commissioning.`
  },
  {
    id: 'l8-4',
    title: 'Digital Twin with SIMIT',
    content: `### Virtual Commissioning
What if you could test your entire PLC program and drive configuration before the machine is even built? This is the core of the **Digital Twin** concept.

---

### 1. The SIMIT Software
SIMIT is a simulation platform that connects to **PLCSIM Advanced**. 
- **Behavior Models**: SIMIT provides pre-built "Behavior Models" for SINAMICS drives.
- **Physics Simulation**: You can model the mechanical load (e.g., a conveyor with boxes) and connect it to the virtual drive.

---

### 2. Hardware-in-the-Loop (HiL)
- **Virtual Drive**: SIMIT simulates the **PROFIdrive** telegram. The PLC "thinks" it is talking to a real G120.
- **Feedback Loop**: When the PLC sends a speed setpoint, SIMIT calculates how the virtual motor would react (including inertia and friction) and sends the "Actual Speed" back to the PLC.

---

### 3. Benefits of Virtual Commissioning
- **Risk Reduction**: You can test "Crash" scenarios (e.g., what happens if a sensor fails at full speed?) without breaking expensive hardware.
- **Parallel Engineering**: The software team can finish and test the code while the mechanical team is still waiting for parts.
- **Operator Training**: Use the digital twin to train operators on a virtual machine, including fault handling and emergency procedures.

> **Toolchain**: TIA Portal (PLC/Drive) -> PLCSIM Advanced (Virtual CPU) -> SIMIT (Virtual Machine/Drive Behavior).`
  }
];
