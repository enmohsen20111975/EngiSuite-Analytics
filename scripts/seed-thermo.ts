import { loadReference } from "../src/ref-content/thermodynamics";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r = await loadReference();
  console.log("THERMO:", JSON.stringify(r));
  const d = await prismaReal.discipline.count();
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB: ${d} disciplines, ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
