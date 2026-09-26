import { loadReference as circuits } from "../src/ref-content/electrical-circuits";
import { loadReference as mech } from "../src/ref-content/engineering-mechanics";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await circuits(); console.log("CIRCUITS:", JSON.stringify(r1));
  const r2 = await mech(); console.log("MECH:", JSON.stringify(r2));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
