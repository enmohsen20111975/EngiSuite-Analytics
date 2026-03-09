// Check electrical categories
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

try {
  const db = new Database(dbPath, { readonly: true });
  
  const categories = db.prepare(`
    SELECT * FROM equation_categories 
    WHERE domain = 'electrical'
    ORDER BY name
  `).all();
  
  console.log('\nElectrical Categories:\n');
  console.table(categories.map(c => ({ slug: c.slug, name: c.name, parent: c.parent_slug })));
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
