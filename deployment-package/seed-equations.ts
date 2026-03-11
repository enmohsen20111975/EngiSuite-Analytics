/**
 * Equation Database Seed Script for EngiSuite
 * Seeds all equations from the equation batch files
 * Run with: npx tsx prisma/seed-equations.ts
 */

import Database from 'better-sqlite3';
import path from 'path';

// Import all equation batches
import { electricalBatch1 } from './equations/electrical-batch1.js';
import { electricalBatch2 } from './equations/electrical-batch2.js';
import { electricalBatch3 } from './equations/electrical-batch3.js';
import { mechanicalBatch1 } from './equations/mechanical-batch1.js';
import { mechanicalBatch2 } from './equations/mechanical-batch2.js';
import { civilBatch1 } from './equations/civil-batch1.js';
import { civilBatch2 } from './equations/civil-batch2.js';
import { chemicalBatch1 } from './equations/chemical-batch1.js';
import { mathematicsBatch1 } from './equations/mathematics-batch1.js';
import { upsBatteryEquations } from './equations/electrical-ups-battery.js';

// Connect to workflows database
const workflowsDb = new Database(
  path.resolve(process.cwd(), 'Databases/workflows.db'),
  { readonly: false }
);

// Enable foreign keys
workflowsDb.pragma('foreign_keys = ON');

// Combine all equations
const allEquations = [
  ...electricalBatch1,
  ...electricalBatch2,
  ...electricalBatch3,
  ...mechanicalBatch1,
  ...mechanicalBatch2,
  ...civilBatch1,
  ...civilBatch2,
  ...chemicalBatch1,
  ...mathematicsBatch1,
  ...upsBatteryEquations
];

// Define all categories with subcategory field
const categories = [
  // Main Categories
  { name: 'Electrical Engineering', slug: 'electrical', description: 'Electrical calculations and formulas', domain: 'electrical', parent_slug: null, display_order: 1, icon: 'zap', color: '#F59E0B', subcategory: null },
  { name: 'Mechanical Engineering', slug: 'mechanical', description: 'Mechanical and thermodynamic calculations', domain: 'mechanical', parent_slug: null, display_order: 2, icon: 'cog', color: '#3B82F6', subcategory: null },
  { name: 'Civil Engineering', slug: 'civil', description: 'Structural and civil engineering formulas', domain: 'civil', parent_slug: null, display_order: 3, icon: 'building', color: '#10B981', subcategory: null },
  { name: 'Chemical Engineering', slug: 'chemical', description: 'Chemical process calculations', domain: 'chemical', parent_slug: null, display_order: 4, icon: 'flask', color: '#8B5CF6', subcategory: null },
  { name: 'Mathematics', slug: 'mathematics', description: 'General mathematical formulas', domain: 'mathematics', parent_slug: null, display_order: 5, icon: 'calculator', color: '#EC4899', subcategory: null },
  
  // Electrical Subcategories
  { name: 'Cable Sizing', slug: 'cable-sizing', description: 'Cable ampacity and sizing calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 1, icon: 'cable', color: '#F59E0B', subcategory: 'Cable Sizing' },
  { name: 'Voltage Drop', slug: 'voltage-drop', description: 'Voltage drop calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 2, icon: 'trending-down', color: '#F59E0B', subcategory: 'Voltage Drop' },
  { name: 'Power Calculations', slug: 'power-calcs', description: 'Power, energy, and demand calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 3, icon: 'activity', color: '#F59E0B', subcategory: 'Power Calculations' },
  { name: 'Power Factor', slug: 'power-factor', description: 'Power factor correction calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 4, icon: 'percent', color: '#F59E0B', subcategory: 'Power Factor' },
  { name: 'Short Circuit', slug: 'short-circuit', description: 'Short circuit current calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 5, icon: 'alert-triangle', color: '#F59E0B', subcategory: 'Short Circuit' },
  { name: 'Transformer', slug: 'transformer', description: 'Transformer sizing and calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 6, icon: 'box', color: '#F59E0B', subcategory: 'Transformer' },
  { name: 'Motor', slug: 'motor', description: 'Motor starting and sizing calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 7, icon: 'play', color: '#F59E0B', subcategory: 'Motor' },
  { name: 'Lighting', slug: 'lighting', description: 'Illumination and lighting calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 8, icon: 'sun', color: '#F59E0B', subcategory: 'Lighting' },
  { name: 'Protection', slug: 'protection', description: 'Protection device calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 9, icon: 'shield', color: '#F59E0B', subcategory: 'Protection' },
  { name: 'Earthing', slug: 'earthing', description: 'Earthing and grounding calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 10, icon: 'anchor', color: '#F59E0B', subcategory: 'Earthing' },
  
  // Mechanical Subcategories
  { name: 'Thermodynamics', slug: 'thermodynamics', description: 'Heat and thermodynamic calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 1, icon: 'flame', color: '#3B82F6', subcategory: 'Thermodynamics' },
  { name: 'Fluid Mechanics', slug: 'fluid-mechanics', description: 'Fluid flow and pipe calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 2, icon: 'droplet', color: '#3B82F6', subcategory: 'Fluid Mechanics' },
  { name: 'Heat Transfer', slug: 'heat-transfer', description: 'Conduction, convection, radiation', domain: 'mechanical', parent_slug: 'mechanical', display_order: 3, icon: 'thermometer', color: '#3B82F6', subcategory: 'Heat Transfer' },
  { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and AC', domain: 'mechanical', parent_slug: 'mechanical', display_order: 4, icon: 'wind', color: '#3B82F6', subcategory: 'HVAC' },
  { name: 'Pumps', slug: 'pumps', description: 'Pump sizing and calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 5, icon: 'circle', color: '#3B82F6', subcategory: 'Pumps' },
  
  // Civil Subcategories
  { name: 'Structural Analysis', slug: 'structural', description: 'Beam and frame analysis', domain: 'civil', parent_slug: 'civil', display_order: 1, icon: 'layers', color: '#10B981', subcategory: 'Structural Analysis' },
  { name: 'Concrete Design', slug: 'concrete', description: 'Reinforced concrete calculations', domain: 'civil', parent_slug: 'civil', display_order: 2, icon: 'box', color: '#10B981', subcategory: 'Concrete Design' },
  { name: 'Steel Design', slug: 'steel-design', description: 'Structural steel calculations', domain: 'civil', parent_slug: 'civil', display_order: 3, icon: 'tool', color: '#10B981', subcategory: 'Steel Design' },
  { name: 'Foundation', slug: 'foundation', description: 'Foundation design calculations', domain: 'civil', parent_slug: 'civil', display_order: 4, icon: 'square', color: '#10B981', subcategory: 'Foundation' },
  { name: 'Geotechnical', slug: 'geotechnical', description: 'Soil and geotechnical calculations', domain: 'civil', parent_slug: 'civil', display_order: 5, icon: 'mountain', color: '#10B981', subcategory: 'Geotechnical' },
  { name: 'Hydraulics', slug: 'hydraulics', description: 'Hydraulic calculations', domain: 'civil', parent_slug: 'civil', display_order: 6, icon: 'waves', color: '#10B981', subcategory: 'Hydraulics' },
  
  // Chemical Subcategories
  { name: 'Mass Balance', slug: 'mass-balance', description: 'Mass balance calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 1, icon: 'scale', color: '#8B5CF6', subcategory: 'Mass Balance' },
  { name: 'Energy Balance', slug: 'energy-balance', description: 'Energy balance calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 2, icon: 'zap', color: '#8B5CF6', subcategory: 'Energy Balance' },
  { name: 'Reaction Engineering', slug: 'reaction-engineering', description: 'Chemical reaction calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 3, icon: 'flask-conical', color: '#8B5CF6', subcategory: 'Reaction Engineering' },
  { name: 'Separation', slug: 'separation', description: 'Separation process calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 4, icon: 'filter', color: '#8B5CF6', subcategory: 'Separation' },
  { name: 'Fluid Flow', slug: 'fluid-flow', description: 'Fluid flow calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 5, icon: 'arrow-right', color: '#8B5CF6', subcategory: 'Fluid Flow' },
  
  // Mathematics Subcategories
  { name: 'Algebra', slug: 'algebra', description: 'Algebraic calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 1, icon: 'x', color: '#EC4899', subcategory: 'Algebra' },
  { name: 'Calculus', slug: 'calculus', description: 'Calculus calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 2, icon: 'trending-up', color: '#EC4899', subcategory: 'Calculus' },
  { name: 'Statistics', slug: 'statistics', description: 'Statistical calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 3, icon: 'bar-chart', color: '#EC4899', subcategory: 'Statistics' },
  { name: 'Geometry', slug: 'geometry', description: 'Geometric calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 4, icon: 'square', color: '#EC4899', subcategory: 'Geometry' },
  { name: 'Trigonometry', slug: 'trigonometry', description: 'Trigonometric calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 5, icon: 'triangle', color: '#EC4899', subcategory: 'Trigonometry' },
];

// Type definitions
interface EquationInput {
  name: string;
  symbol: string;
  description: string;
  unit: string;
  default_value: number;
  min_value?: number;
  max_value?: number;
  input_order: number;
}

interface EquationOutput {
  name: string;
  symbol: string;
  description: string;
  unit: string;
  output_order: number;
  precision: number;
}

interface Equation {
  equation_id: string;
  name: string;
  description: string;
  domain: string;
  category_slug: string;
  equation: string;
  equation_latex: string;
  difficulty_level: string;
  tags: string[];
  inputs: EquationInput[];
  outputs: EquationOutput[];
}

interface Category {
  name: string;
  slug: string;
  description: string;
  domain: string;
  parent_slug: string | null;
  display_order: number;
  icon: string;
  color: string;
  subcategory: string | null;
}

function createTables() {
  console.log('📋 Creating/verifying database tables...');
  
  // Temporarily disable foreign keys
  workflowsDb.pragma('foreign_keys = OFF');
  
  // Drop existing tables
  workflowsDb.exec(`
    DROP TABLE IF EXISTS equation_inputs;
    DROP TABLE IF EXISTS equation_outputs;
    DROP TABLE IF EXISTS equations;
    DROP TABLE IF EXISTS equation_categories;
  `);
  
  // Create equation_categories table with subcategory field
  workflowsDb.exec(`
    CREATE TABLE equation_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      domain TEXT,
      parent_id INTEGER,
      subcategory TEXT,
      display_order INTEGER DEFAULT 0,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES equation_categories(id)
    )
  `);
  
  // Create equations table with category_id (foreign key) instead of category_slug
  workflowsDb.exec(`
    CREATE TABLE equations (
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
  
  // Create equation_inputs table with additional fields
  workflowsDb.exec(`
    CREATE TABLE equation_inputs (
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
    )
  `);
  
  // Create equation_outputs table with additional fields
  workflowsDb.exec(`
    CREATE TABLE equation_outputs (
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
  
  // Re-enable foreign keys
  workflowsDb.pragma('foreign_keys = ON');
  
  console.log('  ✓ Tables created successfully');
}

function seedCategories() {
  console.log('📚 Seeding equation categories...');
  
  const insertCategory = workflowsDb.prepare(`
    INSERT INTO equation_categories (name, slug, description, domain, parent_id, subcategory, display_order, icon, color)
    VALUES (@name, @slug, @description, @domain, @parent_id, @subcategory, @display_order, @icon, @color)
  `);
  
  // First, insert all parent categories (those with null parent_slug)
  const parentCategories = (categories as Category[]).filter((c: Category) => c.parent_slug === null);
  const categoryIdMap: Record<string, number> = {};
  
  for (const category of parentCategories) {
    const result = insertCategory.run({
      name: category.name,
      slug: category.slug,
      description: category.description,
      domain: category.domain,
      parent_id: null,
      subcategory: category.subcategory,
      display_order: category.display_order,
      icon: category.icon,
      color: category.color
    });
    categoryIdMap[category.slug] = result.lastInsertRowid as number;
  }
  
  // Then, insert all subcategories
  const subcategories = (categories as Category[]).filter((c: Category) => c.parent_slug !== null);
  
  for (const category of subcategories) {
    const parentId = categoryIdMap[category.parent_slug as string];
    if (parentId) {
      const result = insertCategory.run({
        name: category.name,
        slug: category.slug,
        description: category.description,
        domain: category.domain,
        parent_id: parentId,
        subcategory: category.subcategory,
        display_order: category.display_order,
        icon: category.icon,
        color: category.color
      });
      categoryIdMap[category.slug] = result.lastInsertRowid as number;
    }
  }
  
  console.log(`  ✓ Inserted ${categories.length} categories`);
  return categoryIdMap;
}

function seedEquations(categoryIdMap: Record<string, number>) {
  console.log('📐 Seeding equations...');
  
  const insertEquation = workflowsDb.prepare(`
    INSERT INTO equations (equation_id, name, description, domain, category_id, equation, equation_latex, difficulty_level, tags, is_active)
    VALUES (@equation_id, @name, @description, @domain, @category_id, @equation, @equation_latex, @difficulty_level, @tags, 1)
  `);
  
  const insertInput = workflowsDb.prepare(`
    INSERT INTO equation_inputs (equation_id, name, symbol, description, unit, default_value, min_value, max_value, input_order, required, data_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'number')
  `);
  
  const insertOutput = workflowsDb.prepare(`
    INSERT INTO equation_outputs (equation_id, name, symbol, description, unit, output_order, precision, data_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'number')
  `);
  
  let equationCount = 0;
  let inputCount = 0;
  let outputCount = 0;
  let skippedCount = 0;
  
  for (const eq of allEquations as Equation[]) {
    try {
      // Get category_id from the slug
      const categoryId = categoryIdMap[eq.category_slug];
      
      if (!categoryId) {
        console.log(`  ⚠ No category found for slug: ${eq.category_slug} (equation: ${eq.name})`);
        skippedCount++;
        continue;
      }
      
      // Insert equation
      const result = insertEquation.run({
        equation_id: eq.equation_id,
        name: eq.name,
        description: eq.description,
        domain: eq.domain,
        category_id: categoryId,
        equation: eq.equation,
        equation_latex: eq.equation_latex,
        difficulty_level: eq.difficulty_level,
        tags: JSON.stringify(eq.tags)
      });
      
      const equationDbId = result.lastInsertRowid as number;
      equationCount++;
      
      // Insert inputs
      for (const input of eq.inputs) {
        insertInput.run(
          equationDbId,
          input.name,
          input.symbol,
          input.description,
          input.unit,
          input.default_value,
          input.min_value !== undefined ? input.min_value : null,
          input.max_value !== undefined ? input.max_value : null,
          input.input_order
        );
        inputCount++;
      }
      
      // Insert outputs
      for (const output of eq.outputs) {
        insertOutput.run(
          equationDbId,
          output.name,
          output.symbol,
          output.description,
          output.unit,
          output.output_order,
          output.precision
        );
        outputCount++;
      }
      
    } catch (e) {
      console.log(`  ⚠ Skipped equation: ${eq.name} - ${e}`);
      skippedCount++;
    }
  }
  
  console.log(`  ✓ Inserted ${equationCount} equations`);
  console.log(`  ✓ Inserted ${inputCount} inputs`);
  console.log(`  ✓ Inserted ${outputCount} outputs`);
  if (skippedCount > 0) {
    console.log(`  ⚠ Skipped ${skippedCount} equations due to errors`);
  }
}

function printSummary() {
  console.log('\n📊 Summary by Domain:');
  
  const domainCounts: Record<string, number> = {};
  for (const eq of allEquations as Equation[]) {
    domainCounts[eq.domain] = (domainCounts[eq.domain] || 0) + 1;
  }
  
  for (const [domain, count] of Object.entries(domainCounts)) {
    console.log(`  ${domain}: ${count} equations`);
  }
  
  console.log(`\n  Total: ${allEquations.length} equations`);
}

async function main() {
  console.log('🌱 Starting equation database seeding...\n');
  
  try {
    // Create tables
    createTables();
    
    // Seed categories and get the ID map
    const categoryIdMap = seedCategories();
    
    // Seed equations with proper category_id
    seedEquations(categoryIdMap);
    
    // Print summary
    printSummary();
    
    console.log('\n✅ Equation seeding completed successfully!');
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
  .finally(() => {
    workflowsDb.close();
  });
