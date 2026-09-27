import { loadReference as mat } from "../src/ref-content/materials-science";
import { loadReference as hyd } from "../src/ref-content/hydraulics-and-hydrology";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await mat(); console.log("MAT:", JSON.stringify(r1));
  const r2 = await hyd(); console.log("HYD:", JSON.stringify(r2));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
