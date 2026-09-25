// Script to find battery/backup power equations
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('\n=== Searching for Battery/Backup/UPS Equations ===\n');
  
  // Search for relevant equations
  const equations = db.prepare(`
    SELECT * FROM equations 
    WHERE (name LIKE '%battery%' OR name LIKE '%backup%' OR name LIKE '%UPS%' OR name LIKE '%power%')
    AND domain = 'electrical'
    AND is_active = 1
    ORDER BY name
  `).all();
  
  console.log(`Found ${equations.length} equations:\n`);
  
  for (const eq of equations) {
    console.log(`----------------------------------------`);
    console.log(`ID: ${eq.equation_id}`);
    console.log(`Name: ${eq.name}`);
    console.log(`Description: ${eq.description || 'N/A'}`);
    console.log(`Equation: ${eq.equation || 'N/A'}`);
    console.log(`LaTeX: ${eq.equation_latex || 'N/A'}`);
    
    // Get inputs
    const inputs = db.prepare(`
      SELECT * FROM equation_inputs 
      WHERE equation_id = ?
      ORDER BY input_order
    `).all(eq.id);
    
    if (inputs.length > 0) {
      console.log('\nInputs:');
      inputs.forEach(inp => {
        console.log(`  - ${inp.name} (${inp.symbol}): ${inp.description || 'N/A'}`);
        console.log(`    Unit: ${inp.unit}, Range: ${inp.min_value} to ${inp.max_value}`);
      });
    }
    
    // Get outputs
    const outputs = db.prepare(`
      SELECT * FROM equation_outputs 
      WHERE equation_id = ?
      ORDER BY output_order
    `).all(eq.id);
    
    if (outputs.length > 0) {
      console.log('\nOutputs:');
      outputs.forEach(out => {
        console.log(`  - ${out.name} (${out.symbol}): ${out.description || 'N/A'}`);
        console.log(`    Unit: ${out.unit}`);
      });
    }
    
    console.log();
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
