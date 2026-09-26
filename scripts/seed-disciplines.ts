import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DISCIPLINES = [
  { slug: 'engineering-mathematics', title: 'Engineering Mathematics', icon: 'Calculator', color: 'emerald', group: 'Engineering Fundamentals', order: 1, desc: 'Calculus, linear algebra, differential equations and probability.' },
  { slug: 'engineering-physics', title: 'Engineering Physics', icon: 'Atom', color: 'cyan', group: 'Engineering Fundamentals', order: 2, desc: 'Classical mechanics, electromagnetism, waves, modern physics.' },
  { slug: 'engineering-chemistry', title: 'Engineering Chemistry', icon: 'FlaskConical', color: 'lime', group: 'Engineering Fundamentals', order: 3, desc: 'Atomic structure, bonding, thermodynamics, electrochemistry.' },
  { slug: 'engineering-mechanics', title: 'Engineering Mechanics', icon: 'Move3d', color: 'teal', group: 'Engineering Fundamentals', order: 4, desc: 'Statics, dynamics, equilibrium of forces.' },
  { slug: 'thermodynamics', title: 'Thermodynamics', icon: 'Thermometer', color: 'orange', group: 'Mechanical', order: 5, desc: 'Laws of thermodynamics, power and refrigeration cycles.' },
  { slug: 'fluid-mechanics', title: 'Fluid Mechanics', icon: 'Waves', color: 'sky', group: 'Mechanical', order: 6, desc: 'Statics, kinematics, control-volume analysis.' },
  { slug: 'mechanics-of-materials', title: 'Mechanics of Materials', icon: 'Layers', color: 'violet', group: 'Mechanical', order: 7, desc: 'Stress, strain, torsion, bending, stability.' },
  { slug: 'heat-transfer', title: 'Heat Transfer', icon: 'Flame', color: 'red', group: 'Mechanical', order: 8, desc: 'Conduction, convection, radiation, heat exchangers.' },
  { slug: 'mechanical-vibrations', title: 'Mechanical Vibrations', icon: 'Activity', color: 'violet', group: 'Mechanical', order: 9, desc: 'Free/forced vibrations, damping, resonance.' },
  { slug: 'mechanical-engineering-design', title: 'Mechanical Engineering Design', icon: 'Wrench', color: 'orange', group: 'Mechanical', order: 10, desc: 'Failure theories, fatigue, shaft/key design.' },
  { slug: 'machine-design', title: 'Machine Design', icon: 'Settings2', color: 'rose', group: 'Mechanical', order: 11, desc: 'Gears, bearings, springs, clutches/brakes.' },
  { slug: 'materials-science', title: 'Materials Science', icon: 'Gem', color: 'cyan', group: 'Mechanical', order: 12, desc: 'Crystal structures, defects, phase diagrams.' },
  { slug: 'electrical-circuits', title: 'Electrical Circuits', icon: 'Zap', color: 'amber', group: 'Electrical & Control', order: 13, desc: 'DC/AC analysis, network theorems, transients.' },
  { slug: 'electronics', title: 'Electronics', icon: 'Cpu', color: 'fuchsia', group: 'Electrical & Control', order: 14, desc: 'Semiconductors, op-amps, small-signal models.' },
  { slug: 'digital-logic-design', title: 'Digital Logic Design', icon: 'Binary', color: 'indigo', group: 'Electrical & Control', order: 15, desc: 'Boolean algebra, combinational/sequential logic.' },
  { slug: 'control-systems', title: 'Control Systems', icon: 'SlidersHorizontal', color: 'teal', group: 'Electrical & Control', order: 16, desc: 'Transfer functions, stability, PID design.' },
  { slug: 'surveying', title: 'Surveying', icon: 'Ruler', color: 'amber', group: 'Civil & Construction', order: 17, desc: 'Linear/angular measurements, leveling, theodolites.' },
  { slug: 'structural-analysis', title: 'Structural Analysis', icon: 'Building2', color: 'sky', group: 'Civil & Construction', order: 18, desc: 'Truss/beam analysis, influence lines.' },
  { slug: 'geotechnical-engineering', title: 'Geotechnical Engineering', icon: 'Mountain', color: 'orange', group: 'Civil & Construction', order: 19, desc: 'Soil classification, effective stress, shear strength.' },
  { slug: 'transportation-engineering', title: 'Transportation Engineering', icon: 'Car', color: 'emerald', group: 'Civil & Construction', order: 20, desc: 'Highway design, pavement, traffic flow.' },
  { slug: 'environmental-engineering', title: 'Environmental Engineering', icon: 'Leaf', color: 'lime', group: 'Civil & Construction', order: 21, desc: 'Water/wastewater treatment, air pollution.' },
  { slug: 'hydraulics-and-hydrology', title: 'Hydraulics & Hydrology', icon: 'Droplets', color: 'sky', group: 'Civil & Construction', order: 22, desc: 'Pipe/open-channel flow, hydrologic analysis.' },
  { slug: 'engineering-economics-management', title: 'Engineering Economics & Management', icon: 'TrendingUp', color: 'teal', group: 'Project & Business', order: 23, desc: 'Time value of money, project appraisal, PERT/CPM.' },
];

async function main() {
  for (const d of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, name: d.title, description: d.desc, icon: d.icon, color: d.color, subjectGroup: d.group, sortOrder: d.order },
      update: { name: d.title, description: d.desc, subjectGroup: d.group },
    });
  }
  const count = await prisma.discipline.count();
  console.log(`✓ Seeded ${count} engineering disciplines`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
