import { loadReference as surv } from "../src/ref-content/surveying";
import { loadReference as trans } from "../src/ref-content/transportation-engineering";
import { loadReference as env } from "../src/ref-content/environmental-engineering";
import { loadReference as vib } from "../src/ref-content/mechanical-vibrations";
import { prismaReal } from "../src/lib/db";
async function main() {
  const r1 = await surv(); console.log("SURV:", JSON.stringify(r1));
  const r2 = await trans(); console.log("TRANS:", JSON.stringify(r2));
  const r3 = await env(); console.log("ENV:", JSON.stringify(r3));
  const r4 = await vib(); console.log("VIB:", JSON.stringify(r4));
  const l = await prismaReal.lesson.count();
  const q = await prismaReal.practiceProblem.count();
  const k = await prismaReal.knowledgeObject.count();
  console.log(`DB TOTAL: ${l} lessons, ${q} questions, ${k} KOs`);
  await prismaReal.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
