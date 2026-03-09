
import { Lesson } from '../types';

export const COMMUNICATION_LESSONS: Lesson[] = [
  {
    id: 'l7-1',
    title: 'Hardware Configuration (TIA Portal)',
    content: `### Connecting Drive to PLC
Before any data can flow, the hardware connection must be established in the TIA Portal Device View.

#### 1. GSD / GSDML Files
If the drive is not in your hardware catalog (e.g., an older firmware or non-Siemens drive), you must install a **GSDML** file.
This XML file tells the PLC: "I am a SINAMICS G120, I support these Telegrams, and I update every 2ms."

#### 2. Device Name (Crucial!)
PROFINET uses the **Device Name** (e.g., \`Drive_Conveyor_1\`) to identify the node, NOT the IP address.
- **The Mistake**: Engineers set the IP in the project but forget to assign the Name to the physical device.
- **The Fix**: Go to "Online & Diagnostics" -> "Assign PROFINET Device Name". Scan the network, find the MAC address, and assign the name.

#### 3. Assigning the Telegram
In the Device View of the drive:
1. Go to **Device overview**.
2. Delete the default "Standard Telegram 1" if you need more data.
3. Drag and drop "Standard Telegram 352" (or your choice) from the catalog into Slot 1.
4. **I/O Addresses**: TIA Portal automatically assigns memory addresses (e.g., I Address 256...267). **Note these down**.`
  },
  {
    id: 'l7-2',
    title: 'Telegram Types Explained',
    content: `A "Telegram" is a pre-defined packet of data words (PZD) exchanged cyclically.

### Standard Telegrams (IEC 61800-7)
Supported by almost all VFD brands (Siemens, ABB, Danfoss, SEW).
- **Telegram 1**: Speed Control (2 Words).
  - *Out*: Control Word, Speed Setpoint.
  - *In*: Status Word, Actual Speed.
- **Telegram 20**: VIK-Namur (6 Words). Used in Chemical/Process industries.

### Siemens Proprietary Telegrams
Optimized for SINAMICS features.
- **Telegram 352**: "Speed Control with Monitoring". (6 Words).
  - Adds: Actual Current, Actual Torque, Fault Code, Warn Code.
  - *Use Case*: Most standard G120 applications where you want to display Amps on the HMI.
- **Telegram 111**: "EPos" (12 Words).
  - *Use Case*: S120/G120 Positioning applications. Includes Position Setpoint (MDI_TAR_POS), Velocity, Acceleration, and Modes (Jog/Home/Traversing).

### Free Telegrams (999)
- **Telegram 999**: User Defined.
- You can configure the drive to send *anything* (e.g., Analog Input 1 voltage, Motor Temperature, Torque Utilization) by mapping parameters to the PZD send words using BICO.`
  },
  {
    id: 'l7-3',
    title: 'PZD Structure & Memory Mapping',
    content: `### Understanding the Stream
Data flows in 16-bit words called **PZD** (Process Data).
> **Rule**: PZD values are normalized.
> - **4000 Hex (16384 Dec)** = 100% of the Reference Value (p2000 for Speed, p2002 for Current).

#### Telegram 1 Structure
| PZD | PLC -> Drive (Output) | Drive -> PLC (Input) |
| :-- | :--- | :--- |
| **1** | **STW1** (Control Word) | **ZSW1** (Status Word) |
| **2** | **NSOLL_A** (Speed Setpoint) | **NIST_A** (Actual Speed) |

#### Telegram 352 Structure (Expanded)
| PZD | PLC -> Drive | Drive -> PLC |
| :-- | :--- | :--- |
| **1** | STW1 | ZSW1 |
| **2** | NSOLL_A | NIST_A |
| **3** | Unused | **IACT** (Actual Current) |
| **4** | Unused | **M_ACT** (Actual Torque) |
| **5** | Unused | **WARN_CODE** (Alarm ID) |
| **6** | Unused | **FAULT_CODE** (Fault ID) |`
  },
  {
    id: 'l7-4',
    title: 'The Control Word (STW1)',
    content: `### The Keys to the Car
STW1 (PZD1) is the most critical word. If you send the wrong bits, the drive is dead.

#### The "Waking Up" Sequence
A drive is a state machine. You cannot just send "Run".
1. **047E (Hex)**:
   - Bit 1 (OFF2) = 1 (No Coast Stop)
   - Bit 2 (OFF3) = 1 (No Fast Stop)
   - Bit 3 (Enable Op) = 1
   - Bit 10 (PLC Control) = 1
   - **Bit 0 (ON) = 0**
   *Result*: Drive enters "Ready to Switch On" state.
2. **047F (Hex)**:
   - All above + **Bit 0 = 1**.
   *Result*: Drive detects rising edge, closes main contactor (if present), magnetizes motor, and RUNS.

#### Common Pitfall: Bit 10
**Bit 10 (Control by PLC)** must ALWAYS be True (1). If this bit is 0, the drive ignores the telegram completely. This is a safety feature to ensure the PLC is actively controlling the bus.`
  },
  {
    id: 'l7-5',
    title: 'S7 Programming (DPRD_DAT)',
    content: `### Consistency is Key
When reading more than 2 words (4 bytes) of data, the data must be "Consistent".
If you read Word 1 in one CPU cycle, and Word 4 in the next cycle, the data might be mismatched (e.g., Speed from t=0 and Torque from t=10ms).

#### S7-1500 / 1200
- If the telegram is in "Process Image" (default for I/O < 1024), you can just access tags: \`"Drive1".ActualSpeed\`. The PLC handles consistency automatically.

#### S7-300 / 400 (Legacy)
- You MUST use System Functions **SFC14 (DPRD_DAT)** and **SFC15 (DPWR_DAT)**.
- These blocks freeze the telegram buffer to ensure all 6 words (Tel 352) are read from the exact same instant in time.

\`\`\`scl
// SCL Example
"RetVal" := DPRD_DAT(
    LADDR := "Drive_Hardware_ID", 
    RECORD => "MyDrive_Data_Struct"
);
\`\`\``
  },
  {
    id: 'l7-6',
    title: 'PROFINET vs PROFIBUS: The Deep Dive',
    content: `### Comparing the Giants
While both protocols use the same **PROFIdrive** application profile, their underlying technology is vastly different.

| Feature | PROFIBUS (DP) | PROFINET (PN) |
| :--- | :--- | :--- |
| **Physical Layer** | RS485 (Serial) | Ethernet (Switched) |
| **Cable Color** | Purple | Green |
| **Max Speed** | 12 Mbit/s | 100 Mbit/s (Full Duplex) |
| **Addressing** | DIP Switches (0-126) | Device Name (DNS-like) |
| **Topology** | Daisy Chain (Line) | Star, Tree, Ring (MRP) |
| **Config File** | GSD (Text) | GSDML (XML) |

---

### 1. Topology & Robustness
- **PROFIBUS**: If one connector in the middle of the line is pulled, the **Termination Resistor** is lost, and the entire bus segment usually crashes.
- **PROFINET**: Uses active switches. If one drive is powered off, the rest of the network stays alive. With **MRP (Media Redundancy Protocol)**, you can even form a ring; if one cable breaks, the data simply travels the other way.

### 2. Real-Time Capabilities (RT vs IRT)
- **RT (Real-Time)**: Used for standard G120 drives. It uses prioritized Ethernet frames to ensure drive data gets through before standard web traffic.
- **IRT (Isochronous Real-Time)**: Used for high-end S120 motion control. The hardware (ERTEC chip) reserves a specific "time slot" for drive data. This allows for sub-millisecond synchronization between multiple axes (e.g., electronic gearing).

### 3. Device Replacement
- **PROFIBUS**: If a drive fails, you must set the DIP switches on the new drive to match the old one before it will talk to the PLC.
- **PROFINET**: Supports **"Replacement without Exchangeable Medium"**. Because the PLC knows the network topology, it sees a new "blank" drive at the same port and automatically pushes the Device Name and IP to it.

### 4. Diagnostics & IT Integration
- **PROFINET** allows you to access the drive's built-in **Web Server** using a standard laptop on the same network. You can check faults, view parameters, and even trace signals without TIA Portal installed.
- **PROFIBUS** is a closed loop; you can only "see" it through a specialized Profibus adapter (CP card) or the PLC.`
  },
  {
    id: 'l7-7',
    title: 'Profibus vs PROFINET: Protocol Comparison',
    content: `### Choosing the Right Bus
While both protocols are developed by PI (Profibus & PROFINET International), they represent different generations of industrial communication. In SINAMICS, the application layer (**PROFIdrive**) is the same, but the transport layer is completely different.

---

### 1. Physical Layer & Speed
- **Profibus DP**: Uses **RS485** serial communication.
  - *Cable*: Purple, shielded twisted pair.
  - *Speed*: Up to **12 Mbps**.
  - *Distance*: Up to 100m at 12 Mbps, or 1200m at 9.6 kbps.
- **PROFINET IO**: Uses **Industrial Ethernet** (100Base-TX).
  - *Cable*: Green, 4-core shielded Ethernet.
  - *Speed*: **100 Mbps** (Full Duplex).
  - *Distance*: 100m between nodes (switches/drives).

---

### 2. Addressing & Identification
- **Profibus**: 
  - Identified by a **Bus Address** (0-126).
  - Set via physical **DIP switches** on the Control Unit or parameter **p0918**.
  - The PLC must know the exact address to communicate.
- **PROFINET**:
  - Identified by a **Device Name** (e.g., "drive-fan-01").
  - The PLC assigns an **IP Address** based on this name during startup.
  - Supports **Topology Detection**: The PLC can identify a drive by its physical port connection on a switch.

---

### 3. Telegram Usage (PROFIdrive)
Both protocols use the **PROFIdrive** profile, which defines how data is structured.
- **Consistency**: Both ensure that "Process Data" (PZD) is sent as a consistent block.
- **Standard Telegrams**: Telegram 1, 2, 3, 4, etc., are identical on both buses.
- **Acyclic Data**: 
  - **Profibus**: Uses DPV1 services (Read/Write Record).
  - **PROFINET**: Uses standard UDP/IP based Record Data services.
- **Synchronization**:
  - **Profibus**: Uses "Equidistance" and "Isochronous" mode (limited by serial jitter).
  - **PROFINET**: Uses **IRT (Isochronous Real-Time)** with hardware-level synchronization, allowing for sub-microsecond jitter—perfect for high-speed multi-axis servos.

---

### 4. Summary Table for SINAMICS
| Feature | Profibus DP | PROFINET IO |
| :--- | :--- | :--- |
| **Connector** | 9-pin D-Sub | RJ45 / M12 |
| **Max Nodes** | 126 | Unlimited (Limited by PLC) |
| **Web Server** | No | Yes (Built-in) |
| **Safety** | PROFIsafe | PROFIsafe |
| **Wireless** | Difficult | Easy (Standard WLAN) |

**Verdict**: Use **PROFINET** for all new installations. Use **Profibus** only when maintaining legacy systems or when the customer specifically requires it for compatibility with existing spare parts.`
  },
  {
    id: 'l7-8',
    title: 'Acyclic Parameter Access (SINA_PARA)',
    content: `### Beyond the Telegram
Standard Telegrams (PZD) are for fast, cyclic data (Speed, Torque). But what if you want to change the **Ramp Up Time (p1120)** from the HMI? You don't want to waste telegram space on a value that only changes once a month.

---

### 1. Acyclic Communication (Read/Write Record)
This uses the "Background" bandwidth of the PROFINET/Profibus network. It is slower (100-500ms) but can access **any** parameter in the drive.

---

### 2. The SINA_PARA Block
Siemens provides a standard library block for TIA Portal called **SINA_PARA**.
- **Inputs**:
  - \`HardwareID\`: The drive's HW ID from Device View.
  - \`Parameter\`: The p-number (e.g., 1120).
  - \`Index\`: The array index (e.g., 0 for DDS0).
  - \`Value\`: The new value to write.
- **Outputs**:
  - \`Done\`: Operation successful.
  - \`Error\`: Something went wrong (e.g., parameter is read-only).

---

### 3. SINA_PARA_S (Multi-Parameter)
If you need to read 10 parameters at once (e.g., for a custom diagnostic screen), use **SINA_PARA_S**. It allows you to define a "Request Structure" in a Data Block (DB) and fetch multiple values in a single acyclic request.

> **Pro Tip**: Avoid writing to parameters cyclically (every PLC scan). Most drive parameters are stored in **EEPROM/Flash**, which has a limited number of write cycles (typ. 100,000). If you write every 10ms, you will kill the drive's memory in a few hours!`
  },
  {
    id: 'l7-9',
    title: 'Web Server & Mobile Apps',
    content: `### Modern Diagnostics
Gone are the days when you needed a specialized $5,000 laptop and a $500 cable just to see why a drive tripped. Modern SINAMICS units feature built-in web technology.

---

### 1. The Built-in Web Server
By enabling the Web Server in TIA Portal, you can access the drive via any standard browser (Chrome, Safari).
- **Features**:
  - View and acknowledge faults.
  - Monitor live signals (Speed, Current).
  - View the parameter list.
  - Access the "Trace" function to see high-speed graphs.
- **Security**: You can define different user levels (e.g., "Operator" can only view, "Admin" can change parameters).

---

### 2. SINAMICS Smart Access Module
For drives without a built-in Ethernet port (like the G120C), you can plug in a **Smart Access Module**.
- **Wi-Fi Hotspot**: The module creates its own Wi-Fi network.
- **Mobile Commissioning**: You connect your smartphone to the Wi-Fi and use a mobile-optimized web interface to commission the drive. No app installation required!

---

### 3. SINAMICS Support App
Siemens provides a free mobile app for iOS and Android.
- **Fault Code Lookup**: Type in a code (e.g., F30001) and get instant causes and remedies.
- **Support Request**: Scan the drive's QR code to instantly pull up the manual or open a support ticket with Siemens HQ.
- **Parameter Clone**: Use the app to read parameters from one drive and push them to another via the Smart Access Module.`
  }
];
