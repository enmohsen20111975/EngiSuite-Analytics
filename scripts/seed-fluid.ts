import { loadReference } from "../src/ref-content/fluid-mechanics";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r = await loadReference();
  console.log("FLUID:", JSON.stringify(r));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
