import { PrismaClient } from '@prisma/client';
import { electricalBatch1 } from '../prisma/equations/electrical-batch1.js';
import { electricalBatch2 } from '../prisma/equations/electrical-batch2.js';
import { electricalBatch3 } from '../prisma/equations/electrical-batch3.js';
import { mechanicalBatch1 } from '../prisma/equations/mechanical-batch1.js';
import { mechanicalBatch2 } from '../prisma/equations/mechanical-batch2.js';
import { civilBatch1 } from '../prisma/equations/civil-batch1.js';
import { civilBatch2 } from '../prisma/equations/civil-batch2.js';
import { chemicalBatch1 } from '../prisma/equations/chemical-batch1.js';
import { mathematicsBatch1 } from '../prisma/equations/mathematics-batch1.js';
import { upsBatteryEquations } from '../prisma/equations/electrical-ups-battery.js';

type SeedInput = {
  name: string;
  symbol: string;
  description?: string;
  unit?: string;
  default_value?: number;
  min_value?: number;
  max_value?: number;
  input_order?: number;
};

type SeedOutput = {
  name: string;
  symbol: string;
  description?: string;
  unit?: string;
  output_order?: number;
  precision?: number;
};

type SeedEquation = {
  equation_id?: string;
  name: string;
  description?: string;
  domain?: string;
  category_slug?: string;
  equation: string;
  equation_latex?: string;
  difficulty_level?: string;
  tags?: string[];
  inputs?: SeedInput[];
  outputs?: SeedOutput[];
};

const CATEGORIES: {
  name: string;
  slug: string;
  description?: string;
  domain: string;
  parent_slug?: string | null;
  display_order: number;
  icon?: string;
  color?: string;
}[] = [
  { name: 'Electrical Engineering', slug: 'electrical', description: 'Electrical calculations and formulas', domain: 'electrical', parent_slug: null, display_order: 1, icon: 'zap', color: '#F59E0B' },
  { name: 'Mechanical Engineering', slug: 'mechanical', description: 'Mechanical and thermodynamic calculations', domain: 'mechanical', parent_slug: null, display_order: 2, icon: 'cog', color: '#3B82F6' },
  { name: 'Civil Engineering', slug: 'civil', description: 'Structural and civil engineering formulas', domain: 'civil', parent_slug: null, display_order: 3, icon: 'building', color: '#10B981' },
  { name: 'Chemical Engineering', slug: 'chemical', description: 'Chemical process calculations', domain: 'chemical', parent_slug: null, display_order: 4, icon: 'flask', color: '#8B5CF6' },
  { name: 'Mathematics', slug: 'mathematics', description: 'General mathematical formulas', domain: 'mathematics', parent_slug: null, display_order: 5, icon: 'calculator', color: '#EC4899' },
  { name: 'Cable Sizing', slug: 'cable-sizing', description: 'Cable ampacity and sizing calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 1, icon: 'cable', color: '#F59E0B' },
  { name: 'Voltage Drop', slug: 'voltage-drop', description: 'Voltage drop calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 2, icon: 'trending-down', color: '#F59E0B' },
  { name: 'Power Calculations', slug: 'power-calcs', description: 'Power, energy, and demand calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 3, icon: 'activity', color: '#F59E0B' },
  { name: 'Power Factor', slug: 'power-factor', description: 'Power factor correction calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 4, icon: 'percent', color: '#F59E0B' },
  { name: 'Short Circuit', slug: 'short-circuit', description: 'Short circuit current calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 5, icon: 'alert-triangle', color: '#F59E0B' },
  { name: 'Transformer', slug: 'transformer', description: 'Transformer sizing and calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 6, icon: 'box', color: '#F59E0B' },
  { name: 'Motor', slug: 'motor', description: 'Motor starting and sizing calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 7, icon: 'play', color: '#F59E0B' },
  { name: 'Lighting', slug: 'lighting', description: 'Illumination and lighting calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 8, icon: 'sun', color: '#F59E0B' },
  { name: 'Protection', slug: 'protection', description: 'Protection device calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 9, icon: 'shield', color: '#F59E0B' },
  { name: 'Earthing', slug: 'earthing', description: 'Earthing and grounding calculations', domain: 'electrical', parent_slug: 'electrical', display_order: 10, icon: 'anchor', color: '#F59E0B' },
  { name: 'Thermodynamics', slug: 'thermodynamics', description: 'Heat and thermodynamic calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 1, icon: 'flame', color: '#3B82F6' },
  { name: 'Fluid Mechanics', slug: 'fluid-mechanics', description: 'Fluid flow and pipe calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 2, icon: 'droplet', color: '#3B82F6' },
  { name: 'Heat Transfer', slug: 'heat-transfer', description: 'Conduction, convection, radiation', domain: 'mechanical', parent_slug: 'mechanical', display_order: 3, icon: 'thermometer', color: '#3B82F6' },
  { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and AC', domain: 'mechanical', parent_slug: 'mechanical', display_order: 4, icon: 'wind', color: '#3B82F6' },
  { name: 'Pumps', slug: 'pumps', description: 'Pump sizing and calculations', domain: 'mechanical', parent_slug: 'mechanical', display_order: 5, icon: 'circle', color: '#3B82F6' },
  { name: 'Structural Analysis', slug: 'structural', description: 'Beam and frame analysis', domain: 'civil', parent_slug: 'civil', display_order: 1, icon: 'layers', color: '#10B981' },
  { name: 'Concrete Design', slug: 'concrete', description: 'Reinforced concrete calculations', domain: 'civil', parent_slug: 'civil', display_order: 2, icon: 'box', color: '#10B981' },
  { name: 'Steel Design', slug: 'steel-design', description: 'Structural steel calculations', domain: 'civil', parent_slug: 'civil', display_order: 3, icon: 'tool', color: '#10B981' },
  { name: 'Foundation', slug: 'foundation', description: 'Foundation design calculations', domain: 'civil', parent_slug: 'civil', display_order: 4, icon: 'square', color: '#10B981' },
  { name: 'Geotechnical', slug: 'geotechnical', description: 'Soil and geotechnical calculations', domain: 'civil', parent_slug: 'civil', display_order: 5, icon: 'mountain', color: '#10B981' },
  { name: 'Hydraulics', slug: 'hydraulics', description: 'Hydraulic calculations', domain: 'civil', parent_slug: 'civil', display_order: 6, icon: 'waves', color: '#10B981' },
  { name: 'Mass Balance', slug: 'mass-balance', description: 'Mass balance calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 1, icon: 'scale', color: '#8B5CF6' },
  { name: 'Energy Balance', slug: 'energy-balance', description: 'Energy balance calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 2, icon: 'zap', color: '#8B5CF6' },
  { name: 'Reaction Engineering', slug: 'reaction-engineering', description: 'Chemical reaction calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 3, icon: 'flask-conical', color: '#8B5CF6' },
  { name: 'Separation', slug: 'separation', description: 'Separation process calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 4, icon: 'filter', color: '#8B5CF6' },
  { name: 'Fluid Flow', slug: 'fluid-flow', description: 'Fluid flow calculations', domain: 'chemical', parent_slug: 'chemical', display_order: 5, icon: 'arrow-right', color: '#8B5CF6' },
  { name: 'Algebra', slug: 'algebra', description: 'Algebraic calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 1, icon: 'x', color: '#EC4899' },
  { name: 'Calculus', slug: 'calculus', description: 'Calculus calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 2, icon: 'trending-up', color: '#EC4899' },
  { name: 'Statistics', slug: 'statistics', description: 'Statistical calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 3, icon: 'bar-chart', color: '#EC4899' },
  { name: 'Geometry', slug: 'geometry', description: 'Geometric calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 4, icon: 'square', color: '#EC4899' },
  { name: 'Trigonometry', slug: 'trigonometry', description: 'Trigonometric calculations', domain: 'mathematics', parent_slug: 'mathematics', display_order: 5, icon: 'triangle', color: '#EC4899' },
];

const BATCHES: SeedEquation[][] = [
  electricalBatch1,
  electricalBatch2,
  electricalBatch3,
  mechanicalBatch1,
  mechanicalBatch2,
  civilBatch1,
  civilBatch2,
  chemicalBatch1,
  mathematicsBatch1,
  upsBatteryEquations,
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const prisma = new PrismaClient();

async function seedCategories(): Promise<Map<string, number>> {
  const idBySlug = new Map<string, number>();

  for (const category of CATEGORIES.filter((c) => !c.parent_slug)) {
    const row = await prisma.equationCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.display_order,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.display_order,
      },
    });
    idBySlug.set(category.slug, row.id);
  }

  for (const category of CATEGORIES.filter((c) => c.parent_slug)) {
    const parentId = idBySlug.get(category.parent_slug as string) ?? null;
    const row = await prisma.equationCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.display_order,
        parentId,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.display_order,
        parentId,
      },
    });
    idBySlug.set(category.slug, row.id);
  }

  return idBySlug;
}

async function main() {
  console.log('🌱 Seeding equation catalog into the Prisma database...');

  const categoryIds = await seedCategories();
  console.log(`  ✓ ${categoryIds.size} equation categories`);

  const allEquations = BATCHES.flat() as SeedEquation[];
  let created = 0;
  let updated = 0;
  const skipped: string[] = [];
  const byDomain: Record<string, number> = {};

  for (const eq of allEquations) {
    if (!eq?.equation || !eq?.name) {
      skipped.push(String(eq?.name ?? 'unknown'));
      continue;
    }

    const slug = eq.equation_id || slugify(eq.name);
    const categoryId = eq.category_slug ? categoryIds.get(eq.category_slug) ?? null : null;
    const inputs = eq.inputs ?? [];
    const outputs = eq.outputs ?? [];
    const variables = JSON.stringify({
      inputs,
      outputs,
      domain: eq.domain || 'general',
      equation_latex: eq.equation_latex || null,
    });

    try {
      const existing = await prisma.equation.findUnique({ where: { slug } });
      const row = await prisma.equation.upsert({
        where: { slug },
        update: {
          name: eq.name,
          description: eq.description,
          formula: eq.equation,
          domain: eq.domain || 'general',
          difficulty: eq.difficulty_level || 'intermediate',
          tags: JSON.stringify(eq.tags ?? []),
          variables,
          categoryId,
          isActive: true,
        },
        create: {
          slug,
          name: eq.name,
          description: eq.description,
          formula: eq.equation,
          domain: eq.domain || 'general',
          difficulty: eq.difficulty_level || 'intermediate',
          tags: JSON.stringify(eq.tags ?? []),
          variables,
          categoryId,
          isActive: true,
        },
      });

      await prisma.equationInput.deleteMany({ where: { equationId: row.id } });
      await prisma.equationOutput.deleteMany({ where: { equationId: row.id } });

      if (inputs.length > 0) {
        await prisma.equationInput.createMany({
          data: inputs.map((input, index) => ({
            equationId: row.id,
            name: input.name,
            slug: slugify(input.symbol || input.name),
            type: 'number',
            unit: input.unit || null,
            defaultValue: input.default_value !== undefined ? String(input.default_value) : null,
            min: input.min_value ?? null,
            max: input.max_value ?? null,
            description: input.description || null,
            sortOrder: input.input_order ?? index + 1,
          })),
        });
      }

      if (outputs.length > 0) {
        await prisma.equationOutput.createMany({
          data: outputs.map((output, index) => ({
            equationId: row.id,
            name: output.name,
            slug: slugify(output.symbol || output.name),
            type: 'number',
            unit: output.unit || null,
            precision: output.precision ?? 4,
            description: output.description || null,
            sortOrder: output.output_order ?? index + 1,
          })),
        });
      }

      const domain = eq.domain || 'general';
      byDomain[domain] = (byDomain[domain] || 0) + 1;
      if (existing) updated += 1;
      else created += 1;
    } catch (error) {
      skipped.push(`${eq.name}: ${(error as Error).message}`);
    }
  }

  console.log(`  ✓ ${created} equations created, ${updated} updated`);
  for (const [domain, count] of Object.entries(byDomain)) {
    console.log(`      ${domain}: ${count}`);
  }
  if (skipped.length > 0) {
    console.log(`  ⚠ ${skipped.length} skipped`);
    skipped.slice(0, 5).forEach((s) => console.log(`      - ${s}`));
  }
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
