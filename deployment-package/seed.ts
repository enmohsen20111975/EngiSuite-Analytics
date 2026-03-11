/**
 * Database Seed Script for EngiSuite
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import initSqlJs, { Database as SqlJsDatabase, Statement as SqlJsStatement } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// sql.js databases
let SQL: initSqlJs.SqlJsStatic;
let workflowsDb: SqlJsDatabase;
let coursesDb: SqlJsDatabase;

const DB_PATHS = {
  workflows: path.resolve(__dirname, '../Databases/workflows.db'),
  courses: path.resolve(__dirname, '../Databases/courses.db'),
};

// Helper to save databases
function saveDatabases() {
  if (workflowsDb) {
    const data = workflowsDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATHS.workflows, buffer);
  }
  if (coursesDb) {
    const data = coursesDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATHS.courses, buffer);
  }
}

// Helper to run a query and get all results
function queryAll<T = Record<string, unknown>>(db: SqlJsDatabase, sql: string, params: (string | number | null)[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper to run a query and get first result
function queryOne<T = Record<string, unknown>>(db: SqlJsDatabase, sql: string, params: (string | number | null)[] = []): T | null {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result: T | null = null;
  if (stmt.step()) {
    result = stmt.getAsObject() as T;
  }
  stmt.free();
  return result;
}

// Type for SQL values compatible with sql.js
type SqlValue = number | string | Uint8Array | null;

// Helper to run an INSERT/UPDATE/DELETE with named parameters
function runWithObject(db: SqlJsDatabase, sql: string, obj: Record<string, unknown>): boolean {
  // Replace @param with ? and extract values in order
  const paramNames: string[] = [];
  const convertedSql = sql.replace(/@(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '?';
  });
  
  const stmt = db.prepare(convertedSql);
  const values: SqlValue[] = paramNames.map(name => {
    const val = obj[name];
    if (val === null || val === undefined) return null;
    if (typeof val === 'number' || typeof val === 'string') return val;
    if (val instanceof Uint8Array) return val;
    return String(val);
  });
  stmt.bind(values);
  const result = stmt.step();
  stmt.free();
  return result;
}

// Helper to run a simple exec
function runExec(db: SqlJsDatabase, sql: string, params: (string | number | null)[] = []): void {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

// ============================================
// LEARNING CONTENT SEEDS
// ============================================

function createCoursesTables() {
  console.log('📋 Creating courses database tables...');
  
  // Drop existing tables to ensure clean schema (only in seed context)
  coursesDb.exec(`
    DROP TABLE IF EXISTS problem_choices;
    DROP TABLE IF EXISTS practice_problems;
    DROP TABLE IF EXISTS simulation_results;
    DROP TABLE IF EXISTS simulation_controls;
    DROP TABLE IF EXISTS simulations;
    DROP TABLE IF EXISTS articles;
    DROP TABLE IF EXISTS learning_objectives;
    DROP TABLE IF EXISTS lessons;
    DROP TABLE IF EXISTS chapters;
    DROP TABLE IF EXISTS disciplines;
  `);
  
  coursesDb.exec(`
    CREATE TABLE IF NOT EXISTS disciplines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      description TEXT,
      "order" INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discipline_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      "order" INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discipline_id) REFERENCES disciplines(id)
    );
    
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER,
      level TEXT,
      type TEXT,
      "order" INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );
    
    CREATE TABLE IF NOT EXISTS learning_objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      objective TEXT NOT NULL,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
    
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
    
    CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT,
      type TEXT,
      description TEXT,
      canvas_width INTEGER,
      canvas_height INTEGER,
      config TEXT,
      "order" INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
    
    CREATE TABLE IF NOT EXISTS simulation_controls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      label TEXT,
      control_type TEXT NOT NULL,
      min_value REAL,
      max_value REAL,
      default_value REAL,
      step REAL,
      unit TEXT,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (simulation_id) REFERENCES simulations(id)
    );
    
    CREATE TABLE IF NOT EXISTS simulation_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      formula TEXT,
      unit TEXT,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (simulation_id) REFERENCES simulations(id)
    );
    
    CREATE TABLE IF NOT EXISTS practice_problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      difficulty TEXT,
      problem_type TEXT,
      correct_answer TEXT,
      tolerance REAL,
      explanation TEXT,
      solution_steps TEXT,
      formula TEXT,
      "order" INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
    
    CREATE TABLE IF NOT EXISTS problem_choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL,
      value TEXT NOT NULL,
      text TEXT,
      is_correct INTEGER DEFAULT 0,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (problem_id) REFERENCES practice_problems(id)
    );
  `);
  
  console.log('  ✓ Courses tables created/verified');
}

function seedDisciplines() {
  console.log('📚 Seeding disciplines...');
  
  const disciplines = [
    { key: 'electrical', name: 'Electrical Engineering', icon: 'zap', color: '#F59E0B', description: 'Master electrical systems, power distribution, and circuit design', order: 1 },
    { key: 'mechanical', name: 'Mechanical Engineering', icon: 'cog', color: '#3B82F6', description: 'Learn thermodynamics, fluid mechanics, and mechanical systems', order: 2 },
    { key: 'civil', name: 'Civil Engineering', icon: 'building', color: '#10B981', description: 'Study structural analysis, concrete design, and construction', order: 3 },
    { key: 'chemical', name: 'Chemical Engineering', icon: 'flask', color: '#8B5CF6', description: 'Explore chemical processes, reactions, and material science', order: 4 },
    { key: 'mathematics', name: 'Engineering Mathematics', icon: 'calculator', color: '#EC4899', description: 'Essential mathematical concepts for engineering applications', order: 5 },
  ];

  for (const discipline of disciplines) {
    // Check if exists
    const existing = queryOne<{id: number}>(coursesDb, 'SELECT id FROM disciplines WHERE key = ?', [discipline.key]);
    
    if (!existing) {
      // Insert
      const stmt = coursesDb.prepare('INSERT INTO disciplines (key, name, icon, color, description, `order`, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)');
      stmt.bind([discipline.key, discipline.name, discipline.icon, discipline.color, discipline.description, discipline.order]);
      stmt.step();
      stmt.free();
    } else {
      // Update
      const stmt = coursesDb.prepare('UPDATE disciplines SET name = ?, icon = ?, color = ?, description = ?, `order` = ? WHERE key = ?');
      stmt.bind([discipline.name, discipline.icon, discipline.color, discipline.description, discipline.order, discipline.key]);
      stmt.step();
      stmt.free();
    }
  }
  
  console.log(`  ✓ Inserted ${disciplines.length} disciplines`);
}

function seedChapters() {
  console.log('📖 Seeding chapters...');
  
  // Get discipline IDs
  const disciplines = queryAll<{id: number; key: string}>(coursesDb, 'SELECT id, key FROM disciplines');
  const disciplineMap = Object.fromEntries(disciplines.map(d => [d.key, d.id]));
  
  const chapters = [
    // Electrical Engineering Chapters
    { discipline_key: 'electrical', title: 'Electrical Fundamentals', slug: 'electrical-fundamentals', description: 'Basic concepts of electrical circuits and Ohm\'s Law', icon: 'book-open', order: 1 },
    { discipline_key: 'electrical', title: 'Cable Sizing & Selection', slug: 'cable-sizing', description: 'Learn how to properly size and select cables for electrical installations', icon: 'cable', order: 2 },
    { discipline_key: 'electrical', title: 'Protection & Coordination', slug: 'protection-coordination', description: 'Understanding protective devices and their coordination', icon: 'shield', order: 3 },
    { discipline_key: 'electrical', title: 'Power Factor Correction', slug: 'power-factor', description: 'Methods for improving power factor in electrical systems', icon: 'activity', order: 4 },
    { discipline_key: 'electrical', title: 'Transformer Design', slug: 'transformer-design', description: 'Transformer sizing, selection, and protection', icon: 'box', order: 5 },
    { discipline_key: 'electrical', title: 'Motor Starting Methods', slug: 'motor-starting', description: 'Various methods for starting electric motors', icon: 'play', order: 6 },
    { discipline_key: 'electrical', title: 'Lighting Design', slug: 'lighting-design', description: 'Principles of illumination and lighting calculations', icon: 'sun', order: 7 },
    { discipline_key: 'electrical', title: 'Earthing & Grounding', slug: 'earthing-grounding', description: 'Design of earthing systems for safety', icon: 'anchor', order: 8 },
    
    // Mechanical Engineering Chapters
    { discipline_key: 'mechanical', title: 'Thermodynamics Fundamentals', slug: 'thermodynamics', description: 'Laws of thermodynamics and their applications', icon: 'flame', order: 1 },
    { discipline_key: 'mechanical', title: 'Fluid Mechanics', slug: 'fluid-mechanics', description: 'Fluid flow, pressure, and pipe systems', icon: 'droplet', order: 2 },
    { discipline_key: 'mechanical', title: 'Heat Transfer', slug: 'heat-transfer', description: 'Conduction, convection, and radiation', icon: 'thermometer', order: 3 },
    { discipline_key: 'mechanical', title: 'HVAC Systems', slug: 'hvac-systems', description: 'Heating, ventilation, and air conditioning design', icon: 'wind', order: 4 },
    { discipline_key: 'mechanical', title: 'Pump Selection', slug: 'pump-selection', description: 'Pump sizing and system curve analysis', icon: 'circle', order: 5 },
    
    // Civil Engineering Chapters
    { discipline_key: 'civil', title: 'Structural Analysis', slug: 'structural-analysis', description: 'Analysis of beams, columns, and frames', icon: 'layers', order: 1 },
    { discipline_key: 'civil', title: 'Concrete Design', slug: 'concrete-design', description: 'Reinforced concrete design principles', icon: 'box', order: 2 },
    { discipline_key: 'civil', title: 'Steel Design', slug: 'steel-design', description: 'Structural steel design and connections', icon: 'tool', order: 3 },
    { discipline_key: 'civil', title: 'Foundation Design', slug: 'foundation-design', description: 'Shallow and deep foundation systems', icon: 'square', order: 4 },
    
    // Mathematics Chapters
    { discipline_key: 'mathematics', title: 'Calculus for Engineers', slug: 'calculus', description: 'Differential and integral calculus applications', icon: 'trending-up', order: 1 },
    { discipline_key: 'mathematics', title: 'Linear Algebra', slug: 'linear-algebra', description: 'Matrices, vectors, and linear systems', icon: 'grid', order: 2 },
    { discipline_key: 'mathematics', title: 'Differential Equations', slug: 'differential-equations', description: 'Solving engineering differential equations', icon: 'function-square', order: 3 },
  ];

  for (const chapter of chapters) {
    const discipline_id = disciplineMap[chapter.discipline_key];
    if (!discipline_id) continue;
    
    // Delete existing and insert (INSERT OR REPLACE equivalent)
    const delStmt = coursesDb.prepare('DELETE FROM chapters WHERE slug = ?');
    delStmt.bind([chapter.slug]);
    delStmt.step();
    delStmt.free();
    
    const stmt = coursesDb.prepare('INSERT INTO chapters (discipline_id, title, slug, description, icon, `order`, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)');
    stmt.bind([discipline_id, chapter.title, chapter.slug, chapter.description, chapter.icon, chapter.order]);
    stmt.step();
    stmt.free();
  }
  
  console.log(`  ✓ Inserted ${chapters.length} chapters`);
}

function seedLessons() {
  console.log('📝 Seeding lessons...');
  
  const lessons = [
    // Electrical Fundamentals Lessons
    { chapter_slug: 'electrical-fundamentals', title: 'Ohm\'s Law', slug: 'ohms-law', description: 'Understanding the relationship between voltage, current, and resistance', duration_minutes: 30, level: 'beginner', type: 'theory', order: 1 },
    { chapter_slug: 'electrical-fundamentals', title: 'Series Circuits', slug: 'series-circuits', description: 'Analysis of series electrical circuits', duration_minutes: 25, level: 'beginner', type: 'theory', order: 2 },
    { chapter_slug: 'electrical-fundamentals', title: 'Parallel Circuits', slug: 'parallel-circuits', description: 'Analysis of parallel electrical circuits', duration_minutes: 25, level: 'beginner', type: 'theory', order: 3 },
    { chapter_slug: 'electrical-fundamentals', title: 'Kirchhoff\'s Laws', slug: 'kirchhoffs-laws', description: 'Current and voltage laws for circuit analysis', duration_minutes: 35, level: 'intermediate', type: 'theory', order: 4 },
    { chapter_slug: 'electrical-fundamentals', title: 'AC Circuit Fundamentals', slug: 'ac-fundamentals', description: 'Introduction to alternating current circuits', duration_minutes: 40, level: 'intermediate', type: 'theory', order: 5 },
    { chapter_slug: 'electrical-fundamentals', title: 'Three-Phase Systems', slug: 'three-phase', description: 'Understanding three-phase power systems', duration_minutes: 45, level: 'intermediate', type: 'theory', order: 6 },
    
    // Cable Sizing Lessons
    { chapter_slug: 'cable-sizing', title: 'Current Carrying Capacity', slug: 'current-capacity', description: 'How to determine cable ampacity', duration_minutes: 35, level: 'intermediate', type: 'theory', order: 1 },
    { chapter_slug: 'cable-sizing', title: 'Voltage Drop Calculations', slug: 'voltage-drop', description: 'Calculating voltage drop in cables', duration_minutes: 40, level: 'intermediate', type: 'calculation', order: 2 },
    { chapter_slug: 'cable-sizing', title: 'Derating Factors', slug: 'derating-factors', description: 'Applying installation conditions to cable ratings', duration_minutes: 30, level: 'intermediate', type: 'theory', order: 3 },
    { chapter_slug: 'cable-sizing', title: 'Cable Selection Practice', slug: 'cable-selection-practice', description: 'Practical cable sizing exercises', duration_minutes: 45, level: 'intermediate', type: 'practice', order: 4 },
    
    // Protection Lessons
    { chapter_slug: 'protection-coordination', title: 'Circuit Breaker Fundamentals', slug: 'circuit-breakers', description: 'Types and operation of circuit breakers', duration_minutes: 35, level: 'intermediate', type: 'theory', order: 1 },
    { chapter_slug: 'protection-coordination', title: 'Short Circuit Analysis', slug: 'short-circuit', description: 'Calculating short circuit currents', duration_minutes: 45, level: 'advanced', type: 'calculation', order: 2 },
    { chapter_slug: 'protection-coordination', title: 'Protection Coordination', slug: 'protection-coord', description: 'Coordinating protective devices', duration_minutes: 50, level: 'advanced', type: 'theory', order: 3 },
    
    // Thermodynamics Lessons
    { chapter_slug: 'thermodynamics', title: 'First Law of Thermodynamics', slug: 'first-law', description: 'Energy conservation in thermodynamic systems', duration_minutes: 40, level: 'beginner', type: 'theory', order: 1 },
    { chapter_slug: 'thermodynamics', title: 'Second Law of Thermodynamics', slug: 'second-law', description: 'Entropy and heat flow direction', duration_minutes: 45, level: 'intermediate', type: 'theory', order: 2 },
    { chapter_slug: 'thermodynamics', title: 'Ideal Gas Laws', slug: 'gas-laws', description: 'Behavior of ideal gases', duration_minutes: 35, level: 'beginner', type: 'theory', order: 3 },
    
    // Fluid Mechanics Lessons
    { chapter_slug: 'fluid-mechanics', title: 'Fluid Properties', slug: 'fluid-properties', description: 'Density, viscosity, and other properties', duration_minutes: 30, level: 'beginner', type: 'theory', order: 1 },
    { chapter_slug: 'fluid-mechanics', title: 'Pipe Flow Equations', slug: 'pipe-flow', description: 'Darcy-Weisbach and Hazen-Williams equations', duration_minutes: 45, level: 'intermediate', type: 'calculation', order: 2 },
    { chapter_slug: 'fluid-mechanics', title: 'Reynolds Number', slug: 'reynolds', description: 'Understanding flow regimes', duration_minutes: 30, level: 'intermediate', type: 'theory', order: 3 },
    
    // Structural Analysis Lessons
    { chapter_slug: 'structural-analysis', title: 'Beam Analysis', slug: 'beam-analysis', description: 'Shear force and bending moment diagrams', duration_minutes: 50, level: 'intermediate', type: 'theory', order: 1 },
    { chapter_slug: 'structural-analysis', title: 'Deflection Calculations', slug: 'deflection', description: 'Calculating beam and slab deflections', duration_minutes: 45, level: 'intermediate', type: 'calculation', order: 2 },
    { chapter_slug: 'structural-analysis', title: 'Stress Analysis', slug: 'stress-analysis', description: 'Understanding stress distributions', duration_minutes: 40, level: 'intermediate', type: 'theory', order: 3 },
  ];

  for (const lesson of lessons) {
    try {
      // Get chapter_id
      const chapter = queryOne<{id: number}>(coursesDb, `
        SELECT c.id FROM chapters c 
        JOIN disciplines d ON c.discipline_id = d.id 
        WHERE c.slug = ?
      `, [lesson.chapter_slug]);
      
      if (!chapter) {
        console.log(`  ⚠ Skipped lesson: ${lesson.title} (chapter not found)`);
        continue;
      }
      
      // Delete existing and insert
      const delStmt = coursesDb.prepare('DELETE FROM lessons WHERE slug = ?');
      delStmt.bind([lesson.slug]);
      delStmt.step();
      delStmt.free();
      
      const stmt = coursesDb.prepare(`
        INSERT INTO lessons (chapter_id, title, slug, description, duration_minutes, level, type, \`order\`, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      stmt.bind([chapter.id, lesson.title, lesson.slug, lesson.description, lesson.duration_minutes, lesson.level, lesson.type, lesson.order]);
      stmt.step();
      stmt.free();
    } catch (e) {
      console.log(`  ⚠ Skipped lesson: ${lesson.title} (error)`);
    }
  }
  
  console.log(`  ✓ Inserted lessons`);
}

function seedArticles() {
  console.log('📄 Seeding articles...');
  
  const articles = [
    {
      lesson_slug: 'ohms-law',
      title: 'Understanding Ohm\'s Law',
      content: `
        <h1>Ohm's Law: The Foundation of Electrical Engineering</h1>
        
        <h2>Introduction</h2>
        <p>Ohm's Law is one of the most fundamental principles in electrical engineering. It describes the relationship between voltage (V), current (I), and resistance (R) in an electrical circuit.</p>
        
        <h2>The Formula</h2>
        <p>The mathematical expression of Ohm's Law is:</p>
        <div class="formula">
          <strong>V = I × R</strong>
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>V</strong> = Voltage in Volts (V)</li>
          <li><strong>I</strong> = Current in Amperes (A)</li>
          <li><strong>R</strong> = Resistance in Ohms (Ω)</li>
        </ul>
        
        <h2>Derivations</h2>
        <p>From the main formula, we can derive:</p>
        <ul>
          <li><strong>I = V / R</strong> (to find current)</li>
          <li><strong>R = V / I</strong> (to find resistance)</li>
        </ul>
        
        <h2>Practical Example</h2>
        <p>A 12V battery is connected to a resistor. If the current flowing through the circuit is 2A, what is the resistance?</p>
        <div class="example">
          <p><strong>Solution:</strong></p>
          <p>R = V / I = 12V / 2A = 6Ω</p>
        </div>
        
        <h2>Applications</h2>
        <p>Ohm's Law is used in:</p>
        <ul>
          <li>Calculating power consumption</li>
          <li>Designing electrical circuits</li>
          <li>Troubleshooting electrical problems</li>
          <li>Sizing cables and protective devices</li>
        </ul>
        
        <h2>Limitations</h2>
        <p>Ohm's Law applies to:</p>
        <ul>
          <li>Ohmic materials (linear relationship)</li>
          <li>Constant temperature conditions</li>
          <li>DC circuits (for AC, impedance is used)</li>
        </ul>
      `
    },
    {
      lesson_slug: 'voltage-drop',
      title: 'Voltage Drop Calculations in Cables',
      content: `
        <h1>Voltage Drop Calculations</h1>
        
        <h2>Introduction</h2>
        <p>Voltage drop is the reduction in voltage that occurs as electrical current flows through a conductor. Excessive voltage drop can cause equipment malfunction and energy waste.</p>
        
        <h2>Single-Phase Formula</h2>
        <div class="formula">
          <strong>VD = (2 × L × I × R) / 1000</strong>
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>VD</strong> = Voltage drop in volts</li>
          <li><strong>L</strong> = Cable length in meters</li>
          <li><strong>I</strong> = Current in amperes</li>
          <li><strong>R</strong> = Resistance per km (Ω/km)</li>
        </ul>
        
        <h2>Three-Phase Formula</h2>
        <div class="formula">
          <strong>VD = (√3 × L × I × R) / 1000</strong>
        </div>
        
        <h2>Percentage Voltage Drop</h2>
        <div class="formula">
          <strong>VD% = (VD / V) × 100</strong>
        </div>
        
        <h2>Acceptable Limits</h2>
        <p>Standard voltage drop limits:</p>
        <ul>
          <li><strong>Lighting circuits:</strong> 3% maximum</li>
          <li><strong>Power circuits:</strong> 5% maximum</li>
          <li><strong>Motor starting:</strong> 10% maximum</li>
        </ul>
        
        <h2>Worked Example</h2>
        <p>A 3-phase, 400V circuit supplies a 50A load through 100m of 16mm² copper cable (resistance: 1.15 Ω/km).</p>
        <div class="example">
          <p><strong>Solution:</strong></p>
          <p>VD = (√3 × 100 × 50 × 1.15) / 1000 = 9.97V</p>
          <p>VD% = (9.97 / 400) × 100 = 2.49%</p>
          <p>Result: Within acceptable limits ✓</p>
        </div>
        
        <h2>Factors Affecting Voltage Drop</h2>
        <ul>
          <li>Cable length (longer = more drop)</li>
          <li>Cable cross-sectional area (larger = less drop)</li>
          <li>Conductor material (copper vs aluminum)</li>
          <li>Current magnitude (higher = more drop)</li>
          <li>Temperature (higher = more resistance)</li>
        </ul>
      `
    },
    {
      lesson_slug: 'current-capacity',
      title: 'Current Carrying Capacity of Cables',
      content: `
        <h1>Current Carrying Capacity (Ampacity)</h1>
        
        <h2>Introduction</h2>
        <p>Current carrying capacity, or ampacity, is the maximum current a cable can carry continuously without exceeding its temperature rating.</p>
        
        <h2>Factors Affecting Ampacity</h2>
        <ul>
          <li><strong>Conductor material:</strong> Copper or Aluminum</li>
          <li><strong>Insulation type:</strong> PVC, XLPE, EPR</li>
          <li><strong>Installation method:</strong> In air, buried, in conduit</li>
          <li><strong>Ambient temperature:</strong> Higher temps reduce capacity</li>
          <li><strong>Grouping:</strong> Multiple cables reduce capacity</li>
        </ul>
        
        <h2>Base Current Ratings</h2>
        <p>Typical ampacity for copper cables (PVC insulated, in air, 30°C):</p>
        <table>
          <tr><th>Size (mm²)</th><th>Ampacity (A)</th></tr>
          <tr><td>1.5</td><td>15.5</td></tr>
          <tr><td>2.5</td><td>21</td></tr>
          <tr><td>4</td><td>28</td></tr>
          <tr><td>6</td><td>36</td></tr>
          <tr><td>10</td><td>50</td></tr>
          <tr><td>16</td><td>68</td></tr>
          <tr><td>25</td><td>89</td></tr>
          <tr><td>35</td><td>110</td></tr>
          <tr><td>50</td><td>134</td></tr>
          <tr><td>70</td><td>171</td></tr>
          <tr><td>95</td><td>207</td></tr>
          <tr><td>120</td><td>239</td></tr>
        </table>
        
        <h2>Derating Factors</h2>
        <p>The actual current capacity is calculated as:</p>
        <div class="formula">
          <strong>I<sub>actual</sub> = I<sub>base</sub> × k<sub>1</sub> × k<sub>2</sub> × k<sub>3</sub></strong>
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>k<sub>1</sub></strong> = Temperature correction factor</li>
          <li><strong>k<sub>2</sub></strong> = Grouping factor</li>
          <li><strong>k<sub>3</sub></strong> = Installation method factor</li>
        </ul>
        
        <h2>Example Calculation</h2>
        <p>Find the derated capacity of a 16mm² cable (base: 68A) installed in conduit on a wall at 40°C ambient with 3 other circuits.</p>
        <div class="example">
          <p>k<sub>1</sub> (40°C) = 0.87</p>
          <p>k<sub>2</sub> (4 circuits) = 0.80</p>
          <p>I<sub>actual</sub> = 68 × 0.87 × 0.80 = 47.3A</p>
        </div>
      `
    },
  ];

  for (const article of articles) {
    try {
      // Get lesson_id
      const lesson = queryOne<{id: number}>(coursesDb, 'SELECT id FROM lessons WHERE slug = ?', [article.lesson_slug]);
      
      if (!lesson) {
        console.log(`  ⚠ Skipped article for: ${article.lesson_slug} (lesson not found)`);
        continue;
      }
      
      // Delete existing and insert
      const delStmt = coursesDb.prepare('DELETE FROM articles WHERE lesson_id = ?');
      delStmt.bind([lesson.id]);
      delStmt.step();
      delStmt.free();
      
      const stmt = coursesDb.prepare(`
        INSERT INTO articles (lesson_id, title, content, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `);
      stmt.bind([lesson.id, article.title, article.content]);
      stmt.step();
      stmt.free();
    } catch (e) {
      console.log(`  ⚠ Skipped article for: ${article.lesson_slug}`);
    }
  }
  
  console.log(`  ✓ Inserted articles`);
}

// ============================================
// PROJECT TEMPLATES SEEDS
// ============================================

async function seedProjectTemplates() {
  console.log('📁 Seeding project templates...');
  
  const templates = [
    {
      name: 'Electrical Installation Project',
      slug: 'electrical-installation',
      description: 'Complete electrical installation design including load calculations, cable sizing, and protection coordination',
      category: 'electrical',
      icon: 'fa-bolt',
      color: '#F59E0B',
      config: JSON.stringify({
        phases: ['Load Analysis', 'Cable Sizing', 'Protection', 'Verification'],
        defaultCalculators: ['cable_sizing', 'voltage_drop', 'short_circuit']
      }),
      isPublic: true,
    },
    {
      name: 'Mechanical System Design',
      slug: 'mechanical-system',
      description: 'HVAC and mechanical systems design with load calculations and equipment selection',
      category: 'mechanical',
      icon: 'fa-gear',
      color: '#3B82F6',
      config: JSON.stringify({
        phases: ['Load Calculation', 'Equipment Selection', 'Ducting', 'Controls'],
        defaultCalculators: ['hvac_load', 'pump_sizing', 'duct_sizing']
      }),
      isPublic: true,
    },
    {
      name: 'Structural Analysis Project',
      slug: 'structural-analysis',
      description: 'Structural analysis and design calculations for buildings and infrastructure',
      category: 'civil',
      icon: 'fa-building',
      color: '#10B981',
      config: JSON.stringify({
        phases: ['Load Analysis', 'Member Design', 'Connection Design', 'Verification'],
        defaultCalculators: ['beam_analysis', 'column_design', 'foundation']
      }),
      isPublic: true,
    },
    {
      name: 'Power Distribution Study',
      slug: 'power-distribution',
      description: 'Power system analysis including load flow, short circuit, and protection studies',
      category: 'electrical',
      icon: 'fa-diagram-project',
      color: '#8B5CF6',
      config: JSON.stringify({
        phases: ['Data Collection', 'Load Flow', 'Short Circuit', 'Protection'],
        defaultCalculators: ['load_flow', 'short_circuit', 'protection']
      }),
      isPublic: true,
    },
    {
      name: 'HVAC Design Project',
      slug: 'hvac-design',
      description: 'Heating, ventilation, and air conditioning system design',
      category: 'mechanical',
      icon: 'fa-wind',
      color: '#06B6D4',
      config: JSON.stringify({
        phases: ['Cooling Load', 'Equipment Selection', 'Duct Design', 'Controls'],
        defaultCalculators: ['cooling_load', 'heating_load', 'ventilation']
      }),
      isPublic: true,
    },
    {
      name: 'General Engineering Project',
      slug: 'general-engineering',
      description: 'Blank project template for custom engineering calculations',
      category: 'general',
      icon: 'fa-folder',
      color: '#6B7280',
      config: JSON.stringify({
        phases: [],
        defaultCalculators: []
      }),
      isPublic: true,
    },
  ];

  for (const template of templates) {
    try {
      await prisma.projectTemplate.upsert({
        where: { slug: template.slug },
        update: template,
        create: template,
      });
    } catch (e) {
      console.log(`  ⚠ Skipped template: ${template.name}`);
    }
  }
  
  console.log(`  ✓ Inserted ${templates.length} project templates`);
}

// ============================================
// REPORT TEMPLATES SEEDS
// ============================================

function seedReportTemplates() {
  console.log('📊 Seeding report templates...');
  
  // Create report_templates table if it doesn't exist
  workflowsDb.exec(`
    CREATE TABLE IF NOT EXISTS report_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT,
      template_type TEXT DEFAULT 'technical',
      sections TEXT,
      styling TEXT,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const templates = [
    {
      name: 'Standard Calculation Report',
      slug: 'standard-calculation',
      description: 'General purpose engineering calculation report',
      category: 'general',
      template_type: 'technical',
      sections: JSON.stringify([
        { title: 'Project Information', type: 'info', fields: ['project_name', 'client', 'engineer', 'date'] },
        { title: 'Input Parameters', type: 'inputs', fields: ['all_inputs'] },
        { title: 'Calculation Methodology', type: 'methodology' },
        { title: 'Results', type: 'results', fields: ['all_outputs'] },
        { title: 'Conclusions', type: 'conclusions' },
      ]),
      styling: JSON.stringify({ header_color: '#1E40AF', font: 'Arial' }),
    },
    {
      name: 'Voltage Drop Analysis Report',
      slug: 'voltage-drop-analysis',
      description: 'Detailed voltage drop calculation report for cable installations',
      category: 'electrical',
      template_type: 'technical',
      sections: JSON.stringify([
        { title: 'Circuit Details', type: 'info', fields: ['circuit_name', 'voltage', 'length'] },
        { title: 'Cable Specifications', type: 'inputs', fields: ['cable_size', 'material', 'insulation'] },
        { title: 'Load Information', type: 'inputs', fields: ['current', 'power_factor'] },
        { title: 'Voltage Drop Calculation', type: 'calculation' },
        { title: 'Results & Compliance', type: 'results' },
        { title: 'Recommendations', type: 'recommendations' },
      ]),
      styling: JSON.stringify({ header_color: '#F59E0B', font: 'Arial' }),
    },
    {
      name: 'Cable Sizing Report',
      slug: 'cable-sizing-report',
      description: 'Comprehensive cable sizing and selection report',
      category: 'electrical',
      template_type: 'technical',
      sections: JSON.stringify([
        { title: 'Design Basis', type: 'info' },
        { title: 'Load Schedule', type: 'table' },
        { title: 'Current Carrying Capacity', type: 'calculation' },
        { title: 'Voltage Drop Verification', type: 'calculation' },
        { title: 'Fault Current Rating', type: 'calculation' },
        { title: 'Cable Schedule', type: 'table' },
      ]),
      styling: JSON.stringify({ header_color: '#10B981', font: 'Arial' }),
    },
    {
      name: 'Transformer Sizing Report',
      slug: 'transformer-sizing',
      description: 'Transformer load analysis and sizing report',
      category: 'electrical',
      template_type: 'technical',
      sections: JSON.stringify([
        { title: 'Connected Loads', type: 'table' },
        { title: 'Demand Calculation', type: 'calculation' },
        { title: 'Transformer Selection', type: 'results' },
        { title: 'Efficiency Analysis', type: 'analysis' },
      ]),
      styling: JSON.stringify({ header_color: '#8B5CF6', font: 'Arial' }),
    },
    {
      name: 'Structural Analysis Report',
      slug: 'structural-analysis',
      description: 'Beam and structural member analysis report',
      category: 'civil',
      template_type: 'technical',
      sections: JSON.stringify([
        { title: 'Structural System', type: 'info' },
        { title: 'Load Analysis', type: 'inputs' },
        { title: 'Stress Calculations', type: 'calculation' },
        { title: 'Deflection Check', type: 'verification' },
        { title: 'Design Summary', type: 'results' },
      ]),
      styling: JSON.stringify({ header_color: '#3B82F6', font: 'Arial' }),
    },
    {
      name: 'Executive Summary Report',
      slug: 'executive-summary',
      description: 'High-level summary report for management review',
      category: 'general',
      template_type: 'summary',
      sections: JSON.stringify([
        { title: 'Overview', type: 'summary' },
        { title: 'Key Findings', type: 'highlights' },
        { title: 'Recommendations', type: 'recommendations' },
      ]),
      styling: JSON.stringify({ header_color: '#1E40AF', font: 'Arial' }),
    },
  ];

  for (const template of templates) {
    // Delete existing and insert
    const delStmt = workflowsDb.prepare('DELETE FROM report_templates WHERE slug = ?');
    delStmt.bind([template.slug]);
    delStmt.step();
    delStmt.free();
    
    const stmt = workflowsDb.prepare(`
      INSERT INTO report_templates (name, slug, description, category, template_type, sections, styling, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    stmt.bind([template.name, template.slug, template.description, template.category, template.template_type, template.sections, template.styling]);
    stmt.step();
    stmt.free();
  }
  
  console.log(`  ✓ Inserted ${templates.length} report templates`);
}

// ============================================
// EQUATION CATEGORIES & EQUATIONS SEEDS
// ============================================

function seedEquationCategories() {
  console.log('🔢 Seeding equation categories...');
  
  // Drop and recreate tables
  workflowsDb.exec(`
    DROP TABLE IF EXISTS equation_inputs;
    DROP TABLE IF EXISTS equation_outputs;
    DROP TABLE IF EXISTS equation_examples;
    DROP TABLE IF EXISTS equations;
    DROP TABLE IF EXISTS equation_categories;
    CREATE TABLE equation_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      domain TEXT,
      parent_id INTEGER,
      display_order INTEGER DEFAULT 0,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES equation_categories(id)
    )
  `);

  const categories = [
    // Main Categories (parent_id = NULL)
    { name: 'Electrical Engineering', slug: 'electrical', description: 'Electrical calculations and formulas', domain: 'electrical', parent_id: null, display_order: 1, icon: 'zap', color: '#F59E0B' },
    { name: 'Mechanical Engineering', slug: 'mechanical', description: 'Mechanical and thermodynamic calculations', domain: 'mechanical', parent_id: null, display_order: 2, icon: 'cog', color: '#3B82F6' },
    { name: 'Civil Engineering', slug: 'civil', description: 'Structural and civil engineering formulas', domain: 'civil', parent_id: null, display_order: 3, icon: 'building', color: '#10B981' },
    { name: 'Mathematics', slug: 'mathematics', description: 'General mathematical formulas', domain: 'general', parent_id: null, display_order: 4, icon: 'calculator', color: '#8B5CF6' },
  ];

  for (const category of categories) {
    const stmt = workflowsDb.prepare(`
      INSERT INTO equation_categories (name, slug, description, domain, parent_id, display_order, icon, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([category.name, category.slug, category.description, category.domain, category.parent_id, category.display_order, category.icon, category.color]);
    stmt.step();
    stmt.free();
  }
  
  // Get category IDs for subcategories
  const electricalRow = queryOne<{id: number}>(workflowsDb, 'SELECT id FROM equation_categories WHERE slug = ?', ['electrical']);
  const mechanicalRow = queryOne<{id: number}>(workflowsDb, 'SELECT id FROM equation_categories WHERE slug = ?', ['mechanical']);
  const civilRow = queryOne<{id: number}>(workflowsDb, 'SELECT id FROM equation_categories WHERE slug = ?', ['civil']);
  
  const electricalId = electricalRow?.id ?? null;
  const mechanicalId = mechanicalRow?.id ?? null;
  const civilId = civilRow?.id ?? null;
  
  const subcategories = [
    // Electrical Subcategories
    { name: 'Cable Sizing', slug: 'cable-sizing', description: 'Cable ampacity and sizing calculations', domain: 'electrical', parent_id: electricalId, display_order: 1, icon: 'cable', color: '#F59E0B' },
    { name: 'Voltage Drop', slug: 'voltage-drop', description: 'Voltage drop calculations', domain: 'electrical', parent_id: electricalId, display_order: 2, icon: 'trending-down', color: '#F59E0B' },
    { name: 'Power Calculations', slug: 'power-calcs', description: 'Power, energy, and demand calculations', domain: 'electrical', parent_id: electricalId, display_order: 3, icon: 'activity', color: '#F59E0B' },
    { name: 'Power Factor', slug: 'power-factor', description: 'Power factor correction calculations', domain: 'electrical', parent_id: electricalId, display_order: 4, icon: 'percent', color: '#F59E0B' },
    { name: 'Short Circuit', slug: 'short-circuit', description: 'Short circuit current calculations', domain: 'electrical', parent_id: electricalId, display_order: 5, icon: 'alert-triangle', color: '#F59E0B' },
    { name: 'Transformer', slug: 'transformer', description: 'Transformer sizing and calculations', domain: 'electrical', parent_id: electricalId, display_order: 6, icon: 'box', color: '#F59E0B' },
    { name: 'Motor', slug: 'motor', description: 'Motor starting and sizing calculations', domain: 'electrical', parent_id: electricalId, display_order: 7, icon: 'play', color: '#F59E0B' },
    { name: 'Lighting', slug: 'lighting', description: 'Illumination and lighting calculations', domain: 'electrical', parent_id: electricalId, display_order: 8, icon: 'sun', color: '#F59E0B' },
    
    // Mechanical Subcategories
    { name: 'Thermodynamics', slug: 'thermodynamics', description: 'Heat and thermodynamic calculations', domain: 'mechanical', parent_id: mechanicalId, display_order: 1, icon: 'flame', color: '#3B82F6' },
    { name: 'Fluid Mechanics', slug: 'fluid-mechanics', description: 'Fluid flow and pipe calculations', domain: 'mechanical', parent_id: mechanicalId, display_order: 2, icon: 'droplet', color: '#3B82F6' },
    { name: 'Heat Transfer', slug: 'heat-transfer', description: 'Conduction, convection, radiation', domain: 'mechanical', parent_id: mechanicalId, display_order: 3, icon: 'thermometer', color: '#3B82F6' },
    { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and AC', domain: 'mechanical', parent_id: mechanicalId, display_order: 4, icon: 'wind', color: '#3B82F6' },
    { name: 'Pumps', slug: 'pumps', description: 'Pump sizing and calculations', domain: 'mechanical', parent_id: mechanicalId, display_order: 5, icon: 'circle', color: '#3B82F6' },
    
    // Civil Subcategories
    { name: 'Structural Analysis', slug: 'structural', description: 'Beam and frame analysis', domain: 'civil', parent_id: civilId, display_order: 1, icon: 'layers', color: '#10B981' },
    { name: 'Concrete Design', slug: 'concrete', description: 'Reinforced concrete calculations', domain: 'civil', parent_id: civilId, display_order: 2, icon: 'box', color: '#10B981' },
    { name: 'Steel Design', slug: 'steel', description: 'Structural steel calculations', domain: 'civil', parent_id: civilId, display_order: 3, icon: 'tool', color: '#10B981' },
  ];

  for (const subcat of subcategories) {
    if (subcat.parent_id) {
      const stmt = workflowsDb.prepare(`
        INSERT INTO equation_categories (name, slug, description, domain, parent_id, display_order, icon, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.bind([subcat.name, subcat.slug, subcat.description, subcat.domain, subcat.parent_id, subcat.display_order, subcat.icon, subcat.color]);
      stmt.step();
      stmt.free();
    }
  }
  
  console.log(`  ✓ Inserted equation categories`);
}

function seedEquations() {
  console.log('📐 Seeding equations...');
  
  // Create equations table
  workflowsDb.exec(`
    CREATE TABLE IF NOT EXISTS equations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equation_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      domain TEXT,
      category_id INTEGER,
      equation TEXT NOT NULL,
      equation_latex TEXT,
      equation_pattern TEXT,
      difficulty_level TEXT,
      tags TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES equation_categories(id)
    )
  `);

  // Helper to get category ID
  const getCategoryId = (slug: string): number | null => {
    const result = queryOne<{id: number}>(workflowsDb, 'SELECT id FROM equation_categories WHERE slug = ?', [slug]);
    return result?.id || null;
  };

  const equations = [
    // Cable Sizing Equations
    {
      equation_id: 'eq_cable_ampacity',
      name: 'Cable Ampacity',
      description: 'Calculate the current carrying capacity of a cable',
      domain: 'electrical',
      category_id: getCategoryId('cable-sizing'),
      equation: 'I = I_base * k_temp * k_group * k_install',
      equation_latex: 'I = I_{base} \\times k_{temp} \\times k_{group} \\times k_{install}',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['cable', 'ampacity', 'current']),
    },
    {
      equation_id: 'eq_voltage_drop_1ph',
      name: 'Voltage Drop (Single Phase)',
      description: 'Calculate voltage drop for single phase circuits',
      domain: 'electrical',
      category_id: getCategoryId('voltage-drop'),
      equation: 'VD = (2 * L * I * R) / 1000',
      equation_latex: 'V_D = \\frac{2 \\times L \\times I \\times R}{1000}',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['voltage', 'drop', 'single-phase']),
    },
    {
      equation_id: 'eq_voltage_drop_3ph',
      name: 'Voltage Drop (Three Phase)',
      description: 'Calculate voltage drop for three phase circuits',
      domain: 'electrical',
      category_id: getCategoryId('voltage-drop'),
      equation: 'VD = (sqrt(3) * L * I * R) / 1000',
      equation_latex: 'V_D = \\frac{\\sqrt{3} \\times L \\times I \\times R}{1000}',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['voltage', 'drop', 'three-phase']),
    },
    {
      equation_id: 'eq_vd_percent',
      name: 'Voltage Drop Percentage',
      description: 'Calculate voltage drop as percentage of nominal voltage',
      domain: 'electrical',
      category_id: getCategoryId('voltage-drop'),
      equation: 'VD_percent = (VD / V_nominal) * 100',
      equation_latex: 'V_D\\% = \\frac{V_D}{V_{nominal}} \\times 100',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['voltage', 'drop', 'percentage']),
    },
    // Power Calculations
    {
      equation_id: 'eq_power_dc',
      name: 'DC Power',
      description: 'Calculate power in DC circuits',
      domain: 'electrical',
      category_id: getCategoryId('power-calcs'),
      equation: 'P = V * I',
      equation_latex: 'P = V \\times I',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['power', 'dc']),
    },
    {
      equation_id: 'eq_power_1ph',
      name: 'Single Phase Power',
      description: 'Calculate active power in single phase AC circuits',
      domain: 'electrical',
      category_id: getCategoryId('power-calcs'),
      equation: 'P = V * I * PF',
      equation_latex: 'P = V \\times I \\times \\cos\\phi',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['power', 'single-phase', 'ac']),
    },
    {
      equation_id: 'eq_power_3ph',
      name: 'Three Phase Power',
      description: 'Calculate active power in three phase circuits',
      domain: 'electrical',
      category_id: getCategoryId('power-calcs'),
      equation: 'P = sqrt(3) * V * I * PF',
      equation_latex: 'P = \\sqrt{3} \\times V \\times I \\times \\cos\\phi',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['power', 'three-phase', 'ac']),
    },
    {
      equation_id: 'eq_apparent_power',
      name: 'Apparent Power',
      description: 'Calculate apparent power (S)',
      domain: 'electrical',
      category_id: getCategoryId('power-calcs'),
      equation: 'S = sqrt(P^2 + Q^2)',
      equation_latex: 'S = \\sqrt{P^2 + Q^2}',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['power', 'apparent', 'kva']),
    },
    // Power Factor
    {
      equation_id: 'eq_pf',
      name: 'Power Factor',
      description: 'Calculate power factor from P and S',
      domain: 'electrical',
      category_id: getCategoryId('power-factor'),
      equation: 'PF = P / S',
      equation_latex: '\\cos\\phi = \\frac{P}{S}',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['power', 'factor', 'pf']),
    },
    {
      equation_id: 'eq_pf_correction',
      name: 'Power Factor Correction Capacitor',
      description: 'Calculate required capacitor for PF correction',
      domain: 'electrical',
      category_id: getCategoryId('power-factor'),
      equation: 'Qc = P * (tan(acos(PF_initial)) - tan(acos(PF_target)))',
      equation_latex: 'Q_c = P \\times (\\tan\\phi_1 - \\tan\\phi_2)',
      difficulty_level: 'advanced',
      tags: JSON.stringify(['power', 'factor', 'correction', 'capacitor']),
    },
    // Short Circuit
    {
      equation_id: 'eq_scc_transformer',
      name: 'Transformer Short Circuit Current',
      description: 'Calculate short circuit current from transformer',
      domain: 'electrical',
      category_id: getCategoryId('short-circuit'),
      equation: 'Isc = (S_transformer * 1000) / (sqrt(3) * V * (Z_percent/100))',
      equation_latex: 'I_{sc} = \\frac{S \\times 1000}{\\sqrt{3} \\times V \\times Z\\%}',
      difficulty_level: 'advanced',
      tags: JSON.stringify(['short', 'circuit', 'transformer']),
    },
    // Transformer
    {
      equation_id: 'eq_transformer_efficiency',
      name: 'Transformer Efficiency',
      description: 'Calculate transformer efficiency',
      domain: 'electrical',
      category_id: getCategoryId('transformer'),
      equation: 'efficiency = (P_out / P_in) * 100',
      equation_latex: '\\eta = \\frac{P_{out}}{P_{in}} \\times 100',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['transformer', 'efficiency']),
    },
    {
      equation_id: 'eq_transformer_ratio',
      name: 'Transformer Turns Ratio',
      description: 'Calculate transformer voltage ratio',
      domain: 'electrical',
      category_id: getCategoryId('transformer'),
      equation: 'V1/V2 = N1/N2',
      equation_latex: '\\frac{V_1}{V_2} = \\frac{N_1}{N_2}',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['transformer', 'ratio', 'turns']),
    },
    // Fluid Mechanics
    {
      equation_id: 'eq_reynolds',
      name: 'Reynolds Number',
      description: 'Calculate Reynolds number for flow regime',
      domain: 'mechanical',
      category_id: getCategoryId('fluid-mechanics'),
      equation: 'Re = (rho * v * D) / mu',
      equation_latex: 'Re = \\frac{\\rho \\times v \\times D}{\\mu}',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['fluid', 'reynolds', 'flow']),
    },
    {
      equation_id: 'eq_darcy_weisbach',
      name: 'Darcy-Weisbach Equation',
      description: 'Calculate pressure loss due to friction',
      domain: 'mechanical',
      category_id: getCategoryId('fluid-mechanics'),
      equation: 'dP = f * (L/D) * (rho * v^2 / 2)',
      equation_latex: '\\Delta P = f \\times \\frac{L}{D} \\times \\frac{\\rho v^2}{2}',
      difficulty_level: 'advanced',
      tags: JSON.stringify(['pressure', 'drop', 'friction', 'pipe']),
    },
    // Structural
    {
      equation_id: 'eq_beam_deflection_udl',
      name: 'Beam Deflection (UDL)',
      description: 'Calculate deflection for simply supported beam with UDL',
      domain: 'civil',
      category_id: getCategoryId('structural'),
      equation: 'delta = (5 * w * L^4) / (384 * E * I)',
      equation_latex: '\\delta = \\frac{5 w L^4}{384 E I}',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['beam', 'deflection', 'udl']),
    },
    {
      equation_id: 'eq_bending_stress',
      name: 'Bending Stress',
      description: 'Calculate bending stress in a beam',
      domain: 'civil',
      category_id: getCategoryId('structural'),
      equation: 'sigma = M * y / I',
      equation_latex: '\\sigma = \\frac{M \\times y}{I}',
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['stress', 'bending', 'beam']),
    },
    {
      equation_id: 'eq_shear_stress',
      name: 'Shear Stress',
      description: 'Calculate shear stress',
      domain: 'civil',
      category_id: getCategoryId('structural'),
      equation: 'tau = V / A',
      equation_latex: '\\tau = \\frac{V}{A}',
      difficulty_level: 'beginner',
      tags: JSON.stringify(['stress', 'shear']),
    },
  ];

  for (const eq of equations) {
    try {
      // Delete existing
      const delStmt = workflowsDb.prepare('DELETE FROM equations WHERE equation_id = ?');
      delStmt.bind([eq.equation_id]);
      delStmt.step();
      delStmt.free();
      
      const stmt = workflowsDb.prepare(`
        INSERT INTO equations (equation_id, name, description, domain, category_id, equation, equation_latex, difficulty_level, tags, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      stmt.bind([eq.equation_id, eq.name, eq.description, eq.domain, eq.category_id, eq.equation, eq.equation_latex, eq.difficulty_level, eq.tags]);
      stmt.step();
      stmt.free();
    } catch (e) {
      console.log(`  ⚠ Skipped equation: ${eq.name}`);
    }
  }
  
  console.log(`  ✓ Inserted ${equations.length} equations`);
}

function seedEquationInputsOutputs() {
  console.log('📊 Seeding equation inputs/outputs...');
  
  // Ensure tables exist
  workflowsDb.exec(`
    CREATE TABLE IF NOT EXISTS equation_inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT,
      description TEXT,
      data_type TEXT DEFAULT 'number',
      unit TEXT,
      unit_category TEXT,
      required INTEGER DEFAULT 1,
      default_value REAL,
      min_value REAL,
      max_value REAL,
      validation_regex TEXT,
      input_order INTEGER DEFAULT 0,
      placeholder TEXT,
      help_text TEXT,
      FOREIGN KEY (equation_id) REFERENCES equations(id)
    );
    
    CREATE TABLE IF NOT EXISTS equation_outputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT,
      description TEXT,
      data_type TEXT DEFAULT 'number',
      unit TEXT,
      unit_category TEXT,
      output_order INTEGER DEFAULT 0,
      precision INTEGER DEFAULT 4,
      format_string TEXT,
      FOREIGN KEY (equation_id) REFERENCES equations(id)
    )
  `);

  const getEquationId = (equationId: string): number | null => {
    const result = queryOne<{id: number}>(workflowsDb, 'SELECT id FROM equations WHERE equation_id = ?', [equationId]);
    return result?.id || null;
  };

  // Define inputs and outputs for key equations
  const equationIO: Record<string, { inputs: Array<Record<string, unknown>>; outputs: Array<Record<string, unknown>> }> = {
    'eq_voltage_drop_3ph': {
      inputs: [
        { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 1 },
        { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 2 },
        { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 1.15, min_value: 0.001, input_order: 3 },
      ],
      outputs: [
        { name: 'VD', symbol: 'VD', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 2 },
      ]
    },
    'eq_power_3ph': {
      inputs: [
        { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
        { name: 'I', symbol: 'I', description: 'Line Current', unit: 'A', default_value: 100, min_value: 0.1, input_order: 2 },
        { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 3 },
      ],
      outputs: [
        { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', output_order: 1, precision: 2 },
      ]
    },
    'eq_reynolds': {
      inputs: [
        { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 1 },
        { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 },
        { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 3 },
        { name: 'mu', symbol: 'μ', description: 'Dynamic Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.00001, input_order: 4 },
      ],
      outputs: [
        { name: 'Re', symbol: 'Re', description: 'Reynolds Number', unit: '', output_order: 1, precision: 0 },
      ]
    },
    'eq_beam_deflection_udl': {
      inputs: [
        { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 10000, min_value: 0, input_order: 1 },
        { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 },
        { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 0, input_order: 3 },
        { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 0, input_order: 4 },
      ],
      outputs: [
        { name: 'delta', symbol: 'δ', description: 'Maximum Deflection', unit: 'm', output_order: 1, precision: 6 },
      ]
    },
  };

  for (const [eqId, io] of Object.entries(equationIO)) {
    const dbId = getEquationId(eqId);
    if (!dbId) continue;

    // Clear existing
    const delInputs = workflowsDb.prepare('DELETE FROM equation_inputs WHERE equation_id = ?');
    delInputs.bind([dbId]);
    delInputs.step();
    delInputs.free();
    
    const delOutputs = workflowsDb.prepare('DELETE FROM equation_outputs WHERE equation_id = ?');
    delOutputs.bind([dbId]);
    delOutputs.step();
    delOutputs.free();

    // Insert inputs
    for (const input of io.inputs) {
      const stmt = workflowsDb.prepare(`
        INSERT INTO equation_inputs (equation_id, name, symbol, description, unit, default_value, min_value, max_value, input_order, required, data_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'number')
      `);
      stmt.bind([
        dbId, 
        input.name as string, 
        input.symbol as string, 
        input.description as string, 
        input.unit as string,
        input.default_value as number, 
        input.min_value as number, 
        input.max_value as number ?? null, 
        input.input_order as number
      ]);
      stmt.step();
      stmt.free();
    }

    // Insert outputs
    for (const output of io.outputs) {
      const stmt = workflowsDb.prepare(`
        INSERT INTO equation_outputs (equation_id, name, symbol, description, unit, output_order, precision, data_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'number')
      `);
      stmt.bind([
        dbId, 
        output.name as string, 
        output.symbol as string, 
        output.description as string, 
        output.unit as string,
        output.output_order as number, 
        output.precision as number
      ]);
      stmt.step();
      stmt.free();
    }
  }
  
  console.log(`  ✓ Inserted equation inputs/outputs`);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Initialize sql.js
    console.log('📦 Initializing sql.js...');
    SQL = await initSqlJs();
    
    // Load or create databases
    console.log('📂 Loading databases...');
    
    if (fs.existsSync(DB_PATHS.workflows)) {
      const buffer = fs.readFileSync(DB_PATHS.workflows);
      workflowsDb = new SQL.Database(buffer);
      console.log('  ✓ Loaded workflows.db');
    } else {
      workflowsDb = new SQL.Database();
      console.log('  ✓ Created new workflows.db');
    }
    
    if (fs.existsSync(DB_PATHS.courses)) {
      const buffer = fs.readFileSync(DB_PATHS.courses);
      coursesDb = new SQL.Database(buffer);
      console.log('  ✓ Loaded courses.db');
    } else {
      coursesDb = new SQL.Database();
      console.log('  ✓ Created new courses.db');
    }
    
    // Create tables first
    createCoursesTables();
    
    // Learning Content
    seedDisciplines();
    seedChapters();
    seedLessons();
    seedArticles();

    // Project Templates (Prisma)
    await seedProjectTemplates();

    // Report Templates
    seedReportTemplates();

    // Equations
    seedEquationCategories();
    seedEquations();
    seedEquationInputsOutputs();

    // Save databases after seeding
    console.log('\n💾 Saving databases...');
    saveDatabases();
    console.log('  ✓ Databases saved');

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (workflowsDb) workflowsDb.close();
    if (coursesDb) coursesDb.close();
  });
