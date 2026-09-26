import { loadReference as heat } from "../src/ref-content/heat-transfer";
import { loadReference as control } from "../src/ref-content/control-systems";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await heat(); console.log("HEAT:", JSON.stringify(r1));
  const r2 = await control(); console.log("CONTROL:", JSON.stringify(r2));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
