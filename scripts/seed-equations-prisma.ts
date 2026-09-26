import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { electricalBatch1 } from '../prisma/equations/electrical-batch1.js';
import { electricalBatch2 } from '../prisma/equations/electrical-batch2.js';
import { electricalBatch3 } from '../prisma/equations/electrical-batch3.js';
import { upsBatteryEquations } from '../prisma/equations/electrical-ups-battery.js';
import { mechanicalBatch1 } from '../prisma/equations/mechanical-batch1.js';
import { mechanicalBatch2 } from '../prisma/equations/mechanical-batch2.js';
import { civilBatch1 } from '../prisma/equations/civil-batch1.js';
import { civilBatch2 } from '../prisma/equations/civil-batch2.js';
import { chemicalBatch1 } from '../prisma/equations/chemical-batch1.js';
import { mathematicsBatch1 } from '../prisma/equations/mathematics-batch1.js';

const ALL: any[] = [
  ...electricalBatch1, ...electricalBatch2, ...electricalBatch3, ...upsBatteryEquations,
  ...mechanicalBatch1, ...mechanicalBatch2,
  ...civilBatch1, ...civilBatch2,
  ...chemicalBatch1,
  ...mathematicsBatch1,
];

async function main() {
  let count = 0;
  for (const eq of ALL) {
    let categoryId: number | null = null;
    if (eq.category_slug) {
      const cat = await prisma.equationCategory.upsert({
        where: { slug: eq.category_slug },
        create: { slug: eq.category_slug, name: eq.category_slug.replace(/-/g, ' '), sortOrder: 0 },
        update: {},
      });
      categoryId = cat.id;
    }
    // Store inputs+outputs as JSON in `variables` (the EngiSuite Equation model
    // has `variables String?` for JSON, `outputs` is a RELATION not a String).
    const varsJson = JSON.stringify({
      inputs: eq.inputs || [],
      outputs: eq.outputs || [],
      domain: eq.domain || 'general',
      equation_latex: eq.equation_latex || null,
    });
    await prisma.equation.upsert({
      where: { slug: eq.equation_id },
      create: {
        slug: eq.equation_id,
        name: eq.name,
        description: eq.description || null,
        formula: eq.equation || '',
        variables: varsJson,
        tags: JSON.stringify(eq.tags || []),
        domain: eq.domain || 'general',
        domain: eq.domain || 'general',
        difficulty: eq.difficulty_level || 'intermediate',
        categoryId: categoryId,
        isActive: true,
      },
      update: {
        name: eq.name,
        description: eq.description || null,
        formula: eq.equation || '',
        variables: varsJson,
        tags: JSON.stringify(eq.tags || []),
        domain: eq.domain || 'general',
        difficulty: eq.difficulty_level || 'intermediate',
        categoryId: categoryId,
      },
    });
    count++;
  }
  const total = await prisma.equation.count();
  const cats = await prisma.equationCategory.count();
  console.log(`✓ Seeded ${count} equations (${total} total, ${cats} categories)`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
