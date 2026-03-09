/**
 * Engineering Mastery Database Seed Script
 * Creates and populates engmastery.db with course content
 * Based on https://github.com/enmohsen20111975/courses-for-my-app-
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../Databases/engmastery.db');

// Type definitions
interface Course {
  id: string;
  discipline: string;
  title: string;
  description: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

interface Chapter {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
}

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  type: 'reading' | 'interactive';
  duration: number;
  content: string;
  order_index: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
}

// Create database and tables
function createDatabase(): Database.Database {
  // Ensure Databases directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Delete existing database if it exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Deleted existing engmastery.db');
  }

  const db = new Database(DB_PATH);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      discipline TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      content TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      questions TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
    CREATE INDEX IF NOT EXISTS idx_chapters_module ON chapters(module_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_chapter ON lessons(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);
  `);

  console.log('Created database tables');
  return db;
}

// Seed database with content
function seedDatabase(db: Database.Database): void {
  console.log('Seeding database...');

  const insertCourse = db.prepare('INSERT INTO courses (id, discipline, title, description) VALUES (?, ?, ?, ?)');
  const insertModule = db.prepare('INSERT INTO modules (id, course_id, title, order_index) VALUES (?, ?, ?, ?)');
  const insertChapter = db.prepare('INSERT INTO chapters (id, module_id, title, order_index) VALUES (?, ?, ?, ?)');
  const insertLesson = db.prepare('INSERT INTO lessons (id, chapter_id, title, type, duration, content, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertQuiz = db.prepare('INSERT INTO quizzes (id, lesson_id, questions) VALUES (?, ?, ?)');

  const transaction = db.transaction(() => {
    // ==========================================
    // ELECTRICAL ENGINEERING
    // ==========================================
    insertCourse.run('electrical', 'electrical', 'Electrical Engineering', 'Master circuit analysis, power systems, and industrial automation.');

    // Module 1: DC Circuit Analysis
    insertModule.run('ee-m1', 'electrical', 'Module 1: DC Circuit Analysis', 1);

    // Chapter 1: Basic Concepts
    insertChapter.run('ee-m1-c1', 'ee-m1', 'Chapter 1: Basic Concepts', 1);

    insertLesson.run(
      'ee-m1-c1-l1',
      'ee-m1-c1',
      'Lesson 1.1: Charge, Current, Voltage, and Power',
      'reading',
      25,
      `# Charge, Current, Voltage, and Power

Welcome to the foundation of Electrical Engineering. To understand circuits, we must first understand the fundamental quantities that govern them.

## Electric Charge (Q)

Charge is an electrical property of the atomic particles of which matter consists, measured in coulombs (C).

- The charge of an electron is e = -1.602 × 10⁻¹⁹ C
- The law of conservation of charge states that charge can neither be created nor destroyed, only transferred

## Electric Current (I)

Electric current is the time rate of change of charge, measured in amperes (A). Mathematically, the relationship between current i, charge q, and time t is:

**i = dq/dt**

Where:
- 1 Ampere = 1 Coulomb/second

If the current does not change with time, it is called **Direct Current (DC)**.

## Voltage (V)

Voltage (or potential difference) is the energy required to move a unit charge through an element, measured in volts (V).

**v = dw/dq**

Where w is energy in joules (J) and q is charge in coulombs (C). Therefore, 1 Volt = 1 Joule/Coulomb.

## Power (P) and Energy (W)

Power is the time rate of expending or absorbing energy, measured in watts (W).

**p = dw/dt = (dw/dq)(dq/dt) = v · i**

This is one of the most important equations in circuit analysis: **P = VI**

### Passive Sign Convention
- If power p > 0, the element is **absorbing** power (e.g., a resistor)
- If power p < 0, the element is **supplying** power (e.g., a battery)

---

### Example Problem
*A current of 2A flows through an element. The voltage across the element is 5V. What is the power absorbed by the element?*

**Solution:**
P = V × I = 5V × 2A = 10W

The element absorbs 10 Watts of power.`,
      1
    );

    insertQuiz.run('ee-m1-c1-l1-q', 'ee-m1-c1-l1', JSON.stringify([
      {
        question: "What is the mathematical relationship between current, charge, and time?",
        options: ["i = dq/dt", "i = dw/dq", "i = v/r", "i = p/v"],
        correctAnswer: 0,
        explanation: "Current is the time rate of change of charge, represented by the derivative dq/dt."
      },
      {
        question: "If an element has a voltage of 12V across it and a current of 3A flowing through it, what is the power?",
        options: ["4W", "36W", "15W", "0.25W"],
        correctAnswer: 1,
        explanation: "Power is the product of voltage and current (P = VI). Therefore, 12V × 3A = 36W."
      }
    ]));

    insertLesson.run(
      'ee-m1-c1-l2',
      'ee-m1-c1',
      "Lesson 1.2: Resistance and Ohm's Law",
      'interactive',
      20,
      `# Resistance and Ohm's Law

Materials in general have a characteristic behavior of resisting the flow of electric charge. This physical property, or ability to resist current, is known as **resistance** and is represented by the symbol R.

## Ohm's Law

Georg Simon Ohm discovered that the voltage v across a resistor is directly proportional to the current i flowing through the resistor.

**v ∝ i ⟹ v = iR**

Where:
- v is the voltage in Volts (V)
- i is the current in Amperes (A)
- R is the resistance in Ohms (Ω)

### Short Circuits and Open Circuits
- **Short Circuit:** An element with R = 0. The voltage is zero, but current can be any value.
- **Open Circuit:** An element with R → ∞. The current is zero, but voltage can be any value.

## Conductance (G)

A useful quantity in circuit analysis is the reciprocal of resistance, called conductance (G). It is measured in Siemens (S) or mhos (℧).

**G = 1/R = i/v**

## Power in a Resistor

Using Ohm's law, we can express the power dissipated by a resistor in two other ways:

**p = vi = i(iR) = i²R**

**p = vi = v(v/R) = v²/R**

\`\`\`interactive
{
  "type": "ohms-law"
}
\`\`\``,
      2
    );

    insertQuiz.run('ee-m1-c1-l2-q', 'ee-m1-c1-l2', JSON.stringify([
      {
        question: "According to Ohm's Law, if voltage is 24V and resistance is 8Ω, what is the current?",
        options: ["192A", "3A", "16A", "0.33A"],
        correctAnswer: 1,
        explanation: "I = V / R. Therefore, I = 24V / 8Ω = 3A."
      },
      {
        question: "What is the power dissipated by a 10Ω resistor carrying a current of 2A?",
        options: ["20W", "40W", "5W", "100W"],
        correctAnswer: 1,
        explanation: "Using the formula P = I²R, we get P = (2A)² × 10Ω = 4 × 10 = 40W."
      }
    ]));

    // Chapter 2: Basic Laws
    insertChapter.run('ee-m1-c2', 'ee-m1', 'Chapter 2: Basic Laws', 2);

    insertLesson.run(
      'ee-m1-c2-l1',
      'ee-m1-c2',
      "Lesson 2.1: Kirchhoff's Current Law (KCL)",
      'reading',
      25,
      `# Kirchhoff's Current Law (KCL)

Ohm's law by itself is not sufficient to analyze circuits. However, when it is coupled with Kirchhoff's two laws, we have a sufficient, powerful set of tools for analyzing a large variety of electric circuits.

## Nodes, Branches, and Loops
- **Branch:** Represents a single element such as a voltage source or a resistor.
- **Node:** The point of connection between two or more branches.
- **Loop:** Any closed path in a circuit.

## Kirchhoff's Current Law (KCL)

Kirchhoff's first law is based on the law of conservation of charge.

> **KCL states that the algebraic sum of currents entering a node (or a closed boundary) is zero.**

Mathematically, KCL implies that:

**Σᵢ₌₁ᴺ iₙ = 0**

where N is the number of branches connected to the node and iₙ is the nth current entering (or leaving) the node.

### Alternative Form
Another way of stating KCL is:
> **The sum of the currents entering a node is equal to the sum of the currents leaving the node.**

**Σiᵢₙ = Σiₒᵤₜ**

### Example
Consider a node with three wires. Current i₁ = 5A is entering the node, and current i₂ = 2A is leaving the node. What is the value and direction of i₃?

By KCL:
- iᵢₙ = iₒᵤₜ
- 5A = 2A + i₃
- i₃ = 3A (leaving the node)`,
      1
    );

    insertQuiz.run('ee-m1-c2-l1-q', 'ee-m1-c2-l1', JSON.stringify([
      {
        question: "What fundamental physics principle is KCL based on?",
        options: ["Conservation of Energy", "Conservation of Charge", "Newton's Second Law", "Faraday's Law"],
        correctAnswer: 1,
        explanation: "KCL is based on the conservation of charge, meaning charge cannot accumulate at a node."
      },
      {
        question: "If 10A and 5A enter a node, and 7A leaves the node through a third wire, what is the current in the fourth wire?",
        options: ["8A leaving", "8A entering", "22A leaving", "2A entering"],
        correctAnswer: 0,
        explanation: "Sum in = Sum out. 10 + 5 = 7 + X. 15 = 7 + X. X = 8A leaving."
      }
    ]));

    insertLesson.run(
      'ee-m1-c2-l2',
      'ee-m1-c2',
      "Lesson 2.2: Kirchhoff's Voltage Law (KVL)",
      'reading',
      30,
      `# Kirchhoff's Voltage Law (KVL)

Kirchhoff's second law is based on the principle of conservation of energy.

> **KVL states that the algebraic sum of all voltages around a closed path (or loop) is zero.**

Mathematically, KVL implies that:

**Σₘ₌₁ᴹ vₘ = 0**

where M is the number of voltages in the loop and vₘ is the mth voltage.

## Applying KVL

When applying KVL, we must pay close attention to the algebraic signs of the voltages.

1. Choose a direction to traverse the loop (clockwise or counter-clockwise).
2. As you go around the loop, if you encounter the **positive (+)** terminal of a voltage first, write it as +v.
3. If you encounter the **negative (-)** terminal first, write it as -v.

### Alternative Form
Another way of stating KVL is:
> **Sum of voltage drops = Sum of voltage rises**

### Example
Consider a simple loop with a 12V battery and two resistors. The voltage across R₁ is V₁ = 4V. What is the voltage V₂ across R₂?

Starting from the bottom left and going clockwise:
- -12V + V₁ + V₂ = 0
- -12V + 4V + V₂ = 0
- V₂ = 8V

This shows that the total voltage supplied by the battery is dropped across the two resistors.`,
      2
    );

    insertQuiz.run('ee-m1-c2-l2-q', 'ee-m1-c2-l2', JSON.stringify([
      {
        question: "What fundamental physics principle is KVL based on?",
        options: ["Conservation of Energy", "Conservation of Charge", "Newton's Second Law", "Faraday's Law"],
        correctAnswer: 0,
        explanation: "KVL is based on the conservation of energy, meaning the net work done in moving a charge around a closed loop is zero."
      }
    ]));

    // Chapter 3: Circuit Simplification
    insertChapter.run('ee-m1-c3', 'ee-m1', 'Chapter 3: Circuit Simplification', 3);

    insertLesson.run(
      'ee-m1-c3-l1',
      'ee-m1-c3',
      'Lesson 3.1: Series & Parallel Resistors',
      'interactive',
      30,
      `# Series and Parallel Resistors

To simplify complex circuits, we often combine multiple resistors into a single **equivalent resistance (Req)**.

## Series Resistors

Two or more resistors are in series if they are connected end-to-end and carry the **same current**.

By applying KVL, we can prove that the equivalent resistance of any number of resistors connected in series is the sum of the individual resistances.

**Req = R₁ + R₂ + ... + Rₙ = Σₙ₌₁ᴺ Rₙ**

## Parallel Resistors

Two or more resistors are in parallel if they are connected to the same two nodes and consequently have the **same voltage** across them.

By applying KCL, we can prove that the equivalent resistance of resistors in parallel is given by:

**1/Req = 1/R₁ + 1/R₂ + ... + 1/Rₙ**

For exactly **two** resistors in parallel, this simplifies to the "product over sum" rule:

**Req = (R₁ × R₂)/(R₁ + R₂)**

\`\`\`interactive
{
  "type": "series-parallel"
}
\`\`\``,
      1
    );

    insertQuiz.run('ee-m1-c3-l1-q', 'ee-m1-c3-l1', JSON.stringify([
      {
        question: "What is the equivalent resistance of a 10Ω and a 40Ω resistor in parallel?",
        options: ["50Ω", "8Ω", "400Ω", "0.125Ω"],
        correctAnswer: 1,
        explanation: "Using the product over sum rule: (10 × 40) / (10 + 40) = 400 / 50 = 8Ω."
      }
    ]));

    // Module 2: Power Systems
    insertModule.run('ee-m2', 'electrical', 'Module 2: Power Systems', 2);
    insertChapter.run('ee-m2-c1', 'ee-m2', 'Chapter 1: Transformers', 1);

    insertLesson.run(
      'ee-m2-c1-l1',
      'ee-m2-c1',
      'Lesson 1.1: Transformer Principles',
      'interactive',
      40,
      `# Transformers

A transformer is a passive component that transfers electrical energy from one electrical circuit to another circuit, or multiple circuits. A varying current in any coil of the transformer produces a varying magnetic flux in the transformer's core, which induces a varying electromotive force across any other coils wound around the same core.

## Transformer Equation

The voltage ratio between the primary and secondary coils is proportional to the turns ratio:

**Vₛ/Vₚ = Nₛ/Nₚ**

Where:
- Vₛ = Secondary voltage
- Vₚ = Primary voltage
- Nₛ = Number of turns in secondary coil
- Nₚ = Number of turns in primary coil

## Types of Transformers

- **Step-up Transformer:** Increases voltage (Nₛ > Nₚ)
- **Step-down Transformer:** Decreases voltage (Nₛ < Nₚ)
- **Isolation Transformer:** Same voltage ratio (Nₛ = Nₚ)

\`\`\`interactive
{
  "type": "3d-transformer"
}
\`\`\`

Transformers are used to change AC voltage levels, such voltages being termed step-up or step-down type to increase or decrease voltage level, respectively.`,
      1
    );

    insertQuiz.run('ee-m2-c1-l1-q', 'ee-m2-c1-l1', JSON.stringify([
      {
        question: "What is the primary function of a transformer?",
        options: ["To convert AC to DC", "To store electrical energy", "To change AC voltage levels", "To generate electricity"],
        correctAnswer: 2,
        explanation: "Transformers are primarily used to step-up (increase) or step-down (decrease) AC voltage levels."
      }
    ]));

    // ==========================================
    // MECHANICAL ENGINEERING
    // ==========================================
    insertCourse.run('mechanical', 'mechanical', 'Mechanical Engineering', 'Learn statics, dynamics, thermodynamics, and machine design.');

    insertModule.run('me-m1', 'mechanical', 'Module 1: Engineering Mechanics', 1);
    insertChapter.run('me-m1-c1', 'me-m1', 'Chapter 1: Statics', 1);

    insertLesson.run(
      'me-m1-c1-l1',
      'me-m1-c1',
      'Lesson 1.1: Forces & Moments',
      'interactive',
      20,
      `# Forces and Moments

Statics is the branch of mechanics that is concerned with the analysis of loads (force and torque, or "moment") acting on physical systems that do not experience an acceleration (a=0), but rather, are in static equilibrium with their environment.

## Forces

A force is a push or pull upon an object resulting from the object's interaction with another object. Forces are vectors, meaning they have both magnitude and direction.

The SI unit of force is the Newton (N), where:
**1 N = 1 kg × m/s²**

## Moments (Torque)

A moment is the tendency of a force to rotate an object about an axis, fulcrum, or pivot. Just as a force is a push or a pull, a moment can be thought of as a twist to an object.

The moment M of a force F about a point O is defined as the cross product of the position vector r and the force vector F:

**M = r × F**

The magnitude of the moment is:
**M = F × d**

Where d is the perpendicular distance from the point to the line of action of the force.

\`\`\`interactive
{
  "type": "torque-sim"
}
\`\`\`

Understanding forces and moments is crucial for analyzing structures like bridges, buildings, and machine components to ensure they remain in equilibrium and do not fail under load.`,
      1
    );

    insertQuiz.run('me-m1-c1-l1-q', 'me-m1-c1-l1', JSON.stringify([
      {
        question: "What does statics primarily deal with?",
        options: ["Systems in motion with constant acceleration", "Systems in static equilibrium", "Fluid dynamics", "Thermodynamic cycles"],
        correctAnswer: 1,
        explanation: "Statics is concerned with systems that do not experience acceleration and are in static equilibrium."
      },
      {
        question: "What is a moment (torque)?",
        options: ["A push or pull", "The mass of an object", "The tendency of a force to rotate an object", "The velocity of an object"],
        correctAnswer: 2,
        explanation: "A moment is the tendency of a force to rotate an object about an axis, fulcrum, or pivot."
      }
    ]));

    insertLesson.run(
      'me-m1-c1-l2',
      'me-m1-c1',
      'Lesson 1.2: Equilibrium of Rigid Bodies',
      'interactive',
      30,
      `# Equilibrium of Rigid Bodies

A rigid body is in equilibrium when the sum of all forces acting on it is zero, and the sum of all moments about any point is zero. Free body diagrams are essential tools for visualizing and solving equilibrium problems.

## Conditions for Equilibrium

For a rigid body to be in equilibrium, two conditions must be satisfied:

1. **ΣF = 0** (The sum of all forces is zero)
2. **ΣM = 0** (The sum of all moments about any point is zero)

In 2D, these expand to:
- **ΣFx = 0** (Sum of horizontal forces)
- **ΣFy = 0** (Sum of vertical forces)
- **ΣM = 0** (Sum of moments)

## Free Body Diagrams

A free body diagram is a sketch of the isolated body, which shows only the forces acting upon the body.

Steps to draw a free body diagram:
1. Isolate the body from its surroundings
2. Draw all external forces acting on the body
3. Include the weight (W = mg) acting at the center of gravity
4. Show reaction forces at supports
5. Choose a coordinate system

\`\`\`interactive
{
  "type": "beam-deflection"
}
\`\`\`

By applying the equations of equilibrium (ΣFx = 0, ΣFy = 0, ΣM = 0), we can determine unknown reaction forces at the supports.`,
      2
    );

    insertQuiz.run('me-m1-c1-l2-q', 'me-m1-c1-l2', JSON.stringify([
      {
        question: "What are the conditions for a rigid body to be in equilibrium in 2D?",
        options: ["Sum of forces in x is zero", "Sum of forces in y is zero", "Sum of moments is zero", "All of the above"],
        correctAnswer: 3,
        explanation: "For a rigid body to be in equilibrium in 2D, the sum of forces in both x and y directions must be zero, and the sum of moments about any point must be zero."
      }
    ]));

    // Module 2: Thermodynamics
    insertModule.run('me-m2', 'mechanical', 'Module 2: Thermodynamics', 2);
    insertChapter.run('me-m2-c1', 'me-m2', 'Chapter 1: Laws of Thermodynamics', 1);

    insertLesson.run(
      'me-m2-c1-l1',
      'me-m2-c1',
      'Lesson 1.1: The First Law',
      'interactive',
      25,
      `# The First Law of Thermodynamics

The first law of thermodynamics is a version of the law of conservation of energy, adapted for thermodynamic processes.

## Conservation of Energy

It states that the total energy of an isolated system is constant; energy can be transformed from one form to another, but can be neither created nor destroyed.

For a closed system, the first law is often formulated as:

**ΔU = Q - W**

Where:
- **ΔU** is the change in internal energy of the system
- **Q** is the heat added to the system
- **W** is the work done by the system

## Sign Convention
- Q > 0: Heat flows INTO the system
- Q < 0: Heat flows OUT OF the system
- W > 0: Work is done BY the system
- W < 0: Work is done ON the system

## Applications

The first law applies to various thermodynamic processes:
- **Isothermal:** Temperature constant (ΔU = 0)
- **Isobaric:** Pressure constant
- **Isochoric:** Volume constant (W = 0)
- **Adiabatic:** No heat transfer (Q = 0)

\`\`\`interactive
{
  "type": "piston-sim"
}
\`\`\`

This principle is fundamental to the design of engines, power plants, and refrigeration systems.`,
      1
    );

    insertQuiz.run('me-m2-c1-l1-q', 'me-m2-c1-l1', JSON.stringify([
      {
        question: "What does the first law of thermodynamics state?",
        options: ["Entropy always increases", "Energy cannot be created or destroyed", "Absolute zero cannot be reached", "Heat flows from cold to hot"],
        correctAnswer: 1,
        explanation: "The first law is a version of the law of conservation of energy, stating that energy can be transformed but neither created nor destroyed."
      }
    ]));

    // ==========================================
    // CIVIL ENGINEERING
    // ==========================================
    insertCourse.run('civil', 'civil', 'Civil Engineering', 'Explore structural analysis, concrete design, and soil mechanics.');

    insertModule.run('ce-m1', 'civil', 'Module 1: Construction Materials', 1);
    insertChapter.run('ce-m1-c1', 'ce-m1', 'Chapter 1: Concrete Technology', 1);

    insertLesson.run(
      'ce-m1-c1-l1',
      'ce-m1-c1',
      'Lesson 1.1: Concrete Components',
      'interactive',
      25,
      `# Concrete Components

Concrete is the most widely used man-made material in the world. It is a composite material composed of fine and coarse aggregate bonded together with a fluid cement (cement paste) that hardens (cures) over time.

## The Ingredients

1. **Cement:** Usually Portland cement, it acts as the binder.
2. **Water:** Reacts chemically with the cement (hydration) to form the solid matrix.
3. **Aggregates:** Sand (fine aggregate) and gravel or crushed stone (coarse aggregate). They provide the bulk and strength.
4. **Admixtures:** Optional chemicals added to modify properties (e.g., setting time, workability).

## Mix Design

The proportions of these components determine the strength, durability, and workability of the final concrete product.

A lower water-to-cement ratio generally yields stronger, more durable concrete, provided it is properly compacted.

**Typical w/c ratios:**
- High strength concrete: 0.35 - 0.40
- Standard concrete: 0.45 - 0.55
- Mass concrete: 0.55 - 0.65

\`\`\`interactive
{
  "type": "concrete-mix"
}
\`\`\`

## The Hydration Process

When water is mixed with Portland cement, a complex series of chemical reactions begins. This process, called hydration, is exothermic (releases heat) and results in the formation of calcium silicate hydrate (C-S-H) gel, which is the primary binding phase in concrete.`,
      1
    );

    insertQuiz.run('ce-m1-c1-l1-q', 'ce-m1-c1-l1', JSON.stringify([
      {
        question: "What is the chemical process called when water reacts with cement?",
        options: ["Oxidation", "Hydration", "Condensation", "Evaporation"],
        correctAnswer: 1,
        explanation: "The chemical reaction between water and cement is called hydration, which forms the solid matrix of concrete."
      },
      {
        question: "Which of the following is NOT a primary ingredient of concrete?",
        options: ["Cement", "Water", "Aggregates", "Steel"],
        correctAnswer: 3,
        explanation: "Steel is used for reinforcement (reinforced concrete), but the primary ingredients of concrete itself are cement, water, and aggregates."
      }
    ]));

    insertLesson.run(
      'ce-m1-c1-l2',
      'ce-m1-c1',
      'Lesson 1.2: Concrete Testing',
      'interactive',
      30,
      `# Concrete Testing

Testing concrete is essential to ensure it meets the required specifications for strength and durability.

## The Slump Test

The slump test measures the consistency or workability of fresh concrete before it sets. It is performed to check the batch-to-batch consistency of the concrete.

**Procedure:**
1. Fill the slump cone with fresh concrete in 3 layers
2. Rod each layer 25 times
3. Strike off the top level
4. Lift the cone vertically
5. Measure the difference in height (slump)

**Typical slump values:**
- Dry mixes: 25-50 mm
- Normal workability: 75-100 mm
- High workability: 150-175 mm

## Compressive Strength Test

The compressive strength of concrete is determined by crushing cylindrical or cubic specimens in a compression testing machine.

Test specimens are typically cured for 28 days before testing.

**Strength classes:**
- C20/25: Standard residential
- C30/37: Commercial buildings
- C40/50: High-rise structures
- C50/60: Prestressed concrete

\`\`\`interactive
{
  "type": "compression-test"
}
\`\`\`

The results of these tests are crucial for structural engineers to verify that the concrete used in construction can safely support the design loads.`,
      2
    );

    insertQuiz.run('ce-m1-c1-l2-q', 'ce-m1-c1-l2', JSON.stringify([
      {
        question: "What does the slump test measure?",
        options: ["Compressive strength", "Tensile strength", "Workability of fresh concrete", "Setting time"],
        correctAnswer: 2,
        explanation: "The slump test is used to measure the consistency or workability of fresh concrete."
      }
    ]));

    // ==========================================
    // ADDITIONAL COURSES (Aerospace, Chemical, Computer)
    // ==========================================
    insertCourse.run('aerospace', 'aerospace', 'Aerospace Engineering', 'Study aerodynamics, propulsion, and spacecraft design.');
    insertCourse.run('chemical', 'chemical', 'Chemical Engineering', 'Learn about chemical processes, thermodynamics, and reaction engineering.');
    insertCourse.run('computer', 'computer', 'Computer Engineering', 'Master digital logic, computer architecture, and embedded systems.');

    // ==========================================
    // PROCEDURAL CONTENT FOR ADVANCED TOPICS
    // ==========================================
    const advancedTopics: Record<string, string[]> = {
      electrical: ['Electromagnetics', 'Signals & Systems', 'Microprocessors', 'Digital Logic', 'Control Systems', 'Communication Systems', 'Power Electronics', 'Renewable Energy', 'VLSI Design', 'Electric Vehicles'],
      mechanical: ['Fluid Mechanics', 'Heat Transfer', 'Manufacturing Processes', 'Machine Design', 'Robotics', 'Vibrations', 'Finite Element Analysis', 'HVAC', 'Aerodynamics', 'Mechatronics'],
      civil: ['Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering', 'Water Resources', 'Surveying', 'Construction Management', 'Urban Planning', 'Earthquake Engineering', 'Bridge Engineering', 'Coastal Engineering'],
      aerospace: ['Aerodynamics', 'Propulsion', 'Flight Mechanics', 'Orbital Mechanics', 'Aircraft Structures', 'Avionics', 'Space Systems', 'Aeroelasticity', 'Hypersonics', 'UAV Design'],
      chemical: ['Thermodynamics', 'Fluid Mechanics', 'Heat Transfer', 'Mass Transfer', 'Reaction Engineering', 'Process Control', 'Separation Processes', 'Polymer Science', 'Biochemical Engineering', 'Plant Design'],
      computer: ['Digital Logic', 'Computer Architecture', 'Operating Systems', 'Computer Networks', 'Embedded Systems', 'VLSI Design', 'Microcontrollers', 'Parallel Computing', 'Hardware Security', 'FPGA Design']
    };

    const getInteractiveForProcedural = (discipline: string, l: number): string => {
      const interactiveMap: Record<string, string[]> = {
        electrical: ['ohms-law', 'sine-wave', 'series-parallel', 'logic-gate', 'data-plotter'],
        mechanical: ['gear-ratio', 'beam-deflection', 'fluid-flow', 'projectile-motion', 'torque-sim'],
        civil: ['concrete-mix', 'compression-test', 'beam-deflection', 'torque-sim', 'data-plotter'],
        aerospace: ['airfoil-lift', 'fluid-flow', 'projectile-motion', 'heat-engine', 'data-plotter'],
        chemical: ['reaction-rate', 'fluid-flow', 'piston-sim', 'heat-engine', 'atom-model'],
        computer: ['logic-gate', 'series-parallel', 'atom-model', 'sine-wave', 'data-plotter']
      };
      return interactiveMap[discipline]?.[l - 1] || 'data-plotter';
    };

    for (const [discipline, topics] of Object.entries(advancedTopics)) {
      topics.forEach((topic, topicIdx) => {
        const modId = `${discipline}-m${topicIdx + 3}`;
        insertModule.run(modId, discipline, `Module ${topicIdx + 3}: ${topic}`, topicIdx + 3);

        for (let c = 1; c <= 4; c++) {
          const chapId = `${modId}-c${c}`;
          insertChapter.run(chapId, modId, `Chapter ${c}: Advanced ${topic} Concepts`, c);

          for (let l = 1; l <= 5; l++) {
            const lessonId = `${chapId}-l${l}`;
            const interactiveType = getInteractiveForProcedural(discipline, l);

            const content = `# ${topic} - Part ${c}.${l}

Welcome to this advanced lesson on **${topic}**. In this section, we will explore the theoretical foundations and practical applications of this critical engineering domain.

## Core Principles

The study of ${topic.toLowerCase()} involves understanding complex systems and their interactions. Engineers must apply rigorous mathematical models and empirical data to design safe and efficient solutions.

### Key Equations and Models

1. **Conservation Laws:** Fundamental to all engineering disciplines.
2. **Constitutive Relations:** Describing material behavior under various conditions.
3. **Kinematic Equations:** Relating geometry and motion.

\`\`\`interactive
{
  "type": "${interactiveType}",
  "title": "${topic} Simulation"
}
\`\`\`

> "Engineering is the art of directing the great sources of power in nature for the use and convenience of man." - Thomas Tredgold

## Practical Applications

In modern industry, ${topic.toLowerCase()} plays a pivotal role in developing sustainable technologies. From renewable energy integration to advanced manufacturing, the principles you learn here will be applicable across your entire career.

### Case Study: Optimization

Consider a scenario where efficiency must be maximized while minimizing cost. By applying the principles of ${topic.toLowerCase()}, engineers can develop algorithms and physical designs that achieve optimal performance.

---
*End of lesson ${c}.${l}. Please review the core concepts before proceeding to the next section.*`;

            insertLesson.run(
              lessonId,
              chapId,
              `Lesson ${c}.${l}: ${topic} Fundamentals`,
              'interactive',
              20 + (l * 5),
              content,
              l
            );

            const questions = [
              {
                question: `What is the primary focus of ${topic}?`,
                options: [`Understanding complex systems`, `Ignoring safety protocols`, `Manual labor`, `Artistic design`],
                correctAnswer: 0,
                explanation: `The study of ${topic} involves understanding complex systems and their interactions.`
              },
              {
                question: `Which of the following is a key equation type in this field?`,
                options: [`Astrological`, `Conservation Laws`, `Culinary`, `Fictional`],
                correctAnswer: 1,
                explanation: `Conservation laws are fundamental to all engineering disciplines.`
              }
            ];
            insertQuiz.run(`${lessonId}-q`, lessonId, JSON.stringify(questions));
          }
        }
      });
    }
  });

  transaction();
  console.log('Database seeded successfully.');
}

// Main execution
function main(): void {
  console.log('Starting Engineering Mastery database seed...');
  console.log(`Database path: ${DB_PATH}`);

  const db = createDatabase();
  seedDatabase(db);

  // Verify the data
  const courses = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  const modules = db.prepare('SELECT COUNT(*) as count FROM modules').get() as { count: number };
  const chapters = db.prepare('SELECT COUNT(*) as count FROM chapters').get() as { count: number };
  const lessons = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };
  const quizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };

  console.log('\n=== Database Statistics ===');
  console.log(`Courses: ${courses.count}`);
  console.log(`Modules: ${modules.count}`);
  console.log(`Chapters: ${chapters.count}`);
  console.log(`Lessons: ${lessons.count}`);
  console.log(`Quizzes: ${quizzes.count}`);

  db.close();
  console.log('\nDatabase seed completed!');
}

main();
