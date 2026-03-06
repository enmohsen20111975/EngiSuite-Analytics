// Script to check database schemas
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databases = {
  courses: path.resolve(__dirname, '../Databases/courses.db'),
  workflows: path.resolve(__dirname, '../Databases/workflows.db'),
  users: path.resolve(__dirname, '../Databases/users.db'),
};

for (const [name, dbPath] of Object.entries(databases)) {
  console.log(`\n=== ${name.toUpperCase()} Database ===`);
  console.log(`Path: ${dbPath}`);
  
  try {
    const db = new Database(dbPath, { readonly: true });
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log(`\nTables (${tables.length}):`);
    
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      const cols = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log(`\n  ${table.name} (${count.count} rows)`);
      console.log(`    Columns: ${cols.map(c => `${c.name}(${c.type})`).join(', ')}`);
    }
    
    db.close();
  } catch (error) {
    console.error(`Error reading ${name} database:`, error.message);
  }
}
