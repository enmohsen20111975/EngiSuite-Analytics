/**
 * Seed the Knowledge Engine (5 certifications) into EngiSuite's Prisma DB
 * (engisuite.db). Runs the Engineer's Educations ref-content loaders via the
 * `@/lib/db` shim that maps the Next.js Question model → EngiSuite
 * PracticeProblem (+ strips sectionId).
 *
 * Usage: DATABASE_URL=file:…/engisuite.db bunx tsx scripts/seed-knowledge.ts
 */
import { loadReference as cmrp } from "../src/ref-content/cmrp";
import { loadReference as cre } from "../src/ref-content/cre";
import { loadReference as pmp } from "../src/ref-content/pmp";
import { loadReference as sixSigma } from "../src/ref-content/six-sigma";
import { loadReference as cama } from "../src/ref-content/cama";
import { loadReference as cmrpWM } from "../src/ref-content/cmrp-work-management";
import { loadReference as cmrpER } from "../src/ref-content/cmrp-equipment-reliability";
import { loadReference as cmrpMPR } from "../src/ref-content/cmrp-manufacturing-process-reliability";
import { loadReference as cmrpBM } from "../src/ref-content/cmrp-business-management";
import { loadReference as cmrpOL } from "../src/ref-content/cmrp-organization-leadership";
import { loadReference as creRM } from "../src/ref-content/cre-reliability-modeling";
import { loadReference as creRT } from "../src/ref-content/cre-reliability-testing";
import { loadReference as crePS } from "../src/ref-content/cre-probability-statistics";
import { loadReference as creRDD } from "../src/ref-content/cre-reliability-design";
import { loadReference as creML } from "../src/ref-content/cre-maintenance-logistics";
import { loadReference as creRPO } from "../src/ref-content/cre-production-operations";
import { loadReference as pmpProcess } from "../src/ref-content/pmp-process";
import { loadReference as pmpBE } from "../src/ref-content/pmp-business-environment";
import { loadReference as ssDefine } from "../src/ref-content/six-sigma-define";
import { loadReference as ssImprove } from "../src/ref-content/six-sigma-improve";
import { loadReference as ssControl } from "../src/ref-content/six-sigma-control";
import { loadReference as camaAMS } from "../src/ref-content/cama-ams";
import { loadReference as camaAML } from "../src/ref-content/cama-aml";
import { loadReference as camaPI } from "../src/ref-content/cama-pi";
import { prismaReal } from "../src/lib/db";

type Loader = { name: string; fn: () => Promise<any> };

const ORDER: Loader[] = [
  // 1) structure (cert + domains + competencies + standards + version + path)
  { name: "cmrp (structure)", fn: cmrp },
  { name: "cre (structure)", fn: cre },
  { name: "pmp (structure)", fn: pmp },
  { name: "six-sigma (structure)", fn: sixSigma },
  { name: "cama (structure)", fn: cama },
  // 2) content per cert (after its structure)
  { name: "cmrp-work-management", fn: cmrpWM },
  { name: "cmrp-equipment-reliability", fn: cmrpER },
  { name: "cmrp-manufacturing-process-reliability", fn: cmrpMPR },
  { name: "cmrp-business-management", fn: cmrpBM },
  { name: "cmrp-organization-leadership", fn: cmrpOL },
  { name: "cre-reliability-modeling", fn: creRM },
  { name: "cre-reliability-testing", fn: creRT },
  { name: "cre-probability-statistics", fn: crePS },
  { name: "cre-reliability-design", fn: creRDD },
  { name: "cre-maintenance-logistics", fn: creML },
  { name: "cre-production-operations", fn: creRPO },
  { name: "pmp-process", fn: pmpProcess },
  { name: "pmp-business-environment", fn: pmpBE },
  { name: "six-sigma-define", fn: ssDefine },
  { name: "six-sigma-improve", fn: ssImprove },
  { name: "six-sigma-control", fn: ssControl },
  { name: "cama-ams", fn: camaAMS },
  { name: "cama-aml", fn: camaAML },
  { name: "cama-pi", fn: camaPI },
];

async function main() {
  console.log("=== Knowledge Engine seed → engisuite.db ===\n");
  for (const { name, fn } of ORDER) {
    const t0 = Date.now();
    try {
      const r = await fn();
      console.log(
        `✓ ${name.padEnd(40)} ${JSON.stringify(r).slice(0, 140)} (${Date.now() - t0}ms)`,
      );
    } catch (e: any) {
      console.error(`✗ ${name} FAILED: ${e.message.slice(0, 200)}`);
      // continue with the rest
    }
  }
  // summary
  const certs = await prismaReal.certification.count();
  const domains = await prismaReal.domain.count();
  const comps = await prismaReal.competency.count();
  const lessons = await prismaReal.lesson.count({ where: { status: "READY" } });
  const kps = await prismaReal.knowledgeObject.count();
  const qs = await prismaReal.practiceProblem.count({ where: { status: "READY" } });
  const refs = await prismaReal.reference.count();
  console.log(
    `\n=== SUMMARY: ${certs} certs, ${domains} domains, ${comps} competencies, ${lessons} READY lessons, ${kps} KOs, ${qs} READY questions, ${refs} references ===`,
  );
  await prismaReal.$disconnect();
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
