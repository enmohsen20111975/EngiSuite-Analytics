import { loadReference as structural } from "../src/ref-content/structural-analysis";
import { loadReference as electronics } from "../src/ref-content/electronics";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await structural(); console.log("STRUCTURAL:", JSON.stringify(r1));
  const r2 = await electronics(); console.log("ELECTRONICS:", JSON.stringify(r2));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
