import { loadReference as physics } from "../src/ref-content/engineering-physics";
import { loadReference as chem } from "../src/ref-content/engineering-chemistry";
import { loadReference as mom } from "../src/ref-content/mechanics-of-materials";
import { loadReference as med } from "../src/ref-content/mechanical-engineering-design";
import { loadReference as md } from "../src/ref-content/machine-design";
import { loadReference as econ } from "../src/ref-content/engineering-economics-management";
import { prismaReal } from "../src/lib/db";

async function main() {
  const results: string[] = [];
  const loaders = [
    ["PHYSICS", physics],
    ["CHEM", chem],
    ["MOM", mom],
    ["MED", med],
    ["MD", md],
    ["ECON", econ],
  ];
  for (const [name, fn] of loaders) {
    try {
      const r = await fn();
      results.push(`${name}: ${JSON.stringify(r)}`);
    } catch (e: any) {
      results.push(`${name}: FAILED: ${e.message.slice(0, 100)}`);
    }
  }
  results.forEach(r => console.log(r));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  const r = await prismaReal.reference.count();
  const ch = await prismaReal.chapter.count();
  console.log(`\n=== FINAL DB: ${ch} chapters, ${l} lessons, ${q} questions, ${k} KOs, ${r} refs ===`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
