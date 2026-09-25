// Script to check Backup Power Assessment pipeline
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('\n=== Backup Power Assessment Pipeline ===\n');
  
  // Find the specific pipeline
  const pipeline = db.prepare("SELECT * FROM calculation_pipelines WHERE id = 49").get();
  
  if (!pipeline) {
    console.log('Pipeline ID 49 not found');
    process.exit(1);
  }
  
  console.log('Pipeline:');
  console.log(`  Name: ${pipeline.name}`);
  console.log(`  Description: ${pipeline.description}`);
  console.log(`  Domain: ${pipeline.domain}`);
  console.log();
  
  // Get steps
  const steps = db.prepare("SELECT * FROM calculation_steps WHERE pipeline_id = ? ORDER BY step_number").all(pipeline.id);
  
  console.log(`Found ${steps.length} steps:\n`);
  
  for (const step of steps) {
    console.log(`========================================`);
    console.log(`Step ${step.step_number}: ${step.name}`);
    console.log(`========================================`);
    console.log(`Description: ${step.description || 'N/A'}`);
    console.log(`Calculation Type: ${step.calculation_type || 'N/A'}`);
    console.log(`Formula: ${step.formula || 'N/A'}`);
    console.log(`Formula Ref: ${step.formula_ref || 'N/A'}`);
    console.log();
    
    console.log('INPUT CONFIG:');
    if (step.input_config) {
      try {
        const inputs = JSON.parse(step.input_config);
        console.log(JSON.stringify(inputs, null, 2));
      } catch (e) {
        console.log('  (Could not parse)');
        console.log(`  Raw: ${step.input_config}`);
      }
    } else {
      console.log('  (None)');
    }
    console.log();
    
    console.log('OUTPUT CONFIG:');
    if (step.output_config) {
      try {
        const outputs = JSON.parse(step.output_config);
        console.log(JSON.stringify(outputs, null, 2));
      } catch (e) {
        console.log('  (Could not parse)');
        console.log(`  Raw: ${step.output_config}`);
      }
    } else {
      console.log('  (None)');
    }
    console.log('\n');
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
