// Script to check specific pipeline data
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('\n=== Searching for Backup Power Assessment Pipeline ===\n');
  
  // Find pipeline
  const pipelines = db.prepare("SELECT id, pipeline_id, name, description, domain FROM calculation_pipelines WHERE name LIKE '%Backup%' OR name LIKE '%Power%'").all();
  
  if (pipelines.length === 0) {
    console.log('No Backup Power pipeline found. Listing all pipelines:');
    const allPipelines = db.prepare("SELECT id, pipeline_id, name FROM calculation_pipelines LIMIT 20").all();
    console.table(allPipelines);
  } else {
    console.table(pipelines);
    
    // Get steps for first matching pipeline
    const pipeline = pipelines[0];
    console.log(`\n=== Steps for Pipeline: ${pipeline.name} (ID: ${pipeline.id}) ===\n`);
    
    const steps = db.prepare("SELECT * FROM calculation_steps WHERE pipeline_id = ? ORDER BY step_number").all(pipeline.id);
    
    for (const step of steps) {
      console.log(`\nStep ${step.step_number}: ${step.name}`);
      console.log(`Description: ${step.description || 'N/A'}`);
      console.log(`Formula: ${step.formula || 'N/A'}`);
      console.log(`Formula Ref: ${step.formula_ref || 'N/A'}`);
      console.log(`Input Config: ${step.input_config || 'N/A'}`);
      console.log(`Output Config: ${step.output_config || 'N/A'}`);
      console.log('---');
    }
    
    // Check if there's an equation referenced
    if (steps.length > 0 && steps[0].formula_ref) {
      console.log(`\n=== Checking Equation: ${steps[0].formula_ref} ===\n`);
      const equation = db.prepare("SELECT * FROM equations WHERE equation_id = ?").get(steps[0].formula_ref);
      if (equation) {
        console.log('Equation Found:');
        console.log(equation);
        
        const inputs = db.prepare("SELECT * FROM equation_inputs WHERE equation_id = ? ORDER BY input_order").all(equation.id);
        const outputs = db.prepare("SELECT * FROM equation_outputs WHERE equation_id = ? ORDER BY output_order").all(equation.id);
        
        console.log('\nEquation Inputs:');
        console.table(inputs);
        
        console.log('\nEquation Outputs:');
        console.table(outputs);
      }
    }
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
