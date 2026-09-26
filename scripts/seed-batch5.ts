import { loadReference as geo } from "../src/ref-content/geotechnical-engineering";
import { loadReference as digital } from "../src/ref-content/digital-logic-design";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await geo(); console.log("GEO:", JSON.stringify(r1));
  const r2 = await digital(); console.log("DIGITAL:", JSON.stringify(r2));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
