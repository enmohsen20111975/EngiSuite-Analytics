/**
 * Knowledge-Engine Prisma shim — lets the Engineer's Educations ref-content
 * loaders (authored for the Next.js schema) run UNCHANGED on EngiSuite's
 * Prisma schema.
 *
 * Uses PLAIN objects with explicit methods (NOT Proxy wraps around Prisma
 * delegates — Proxying delegates breaks Prisma's internals).
 *
 * Mappings (on create/update/upsert):
 *  - db.question → db.practiceProblem (stem→question, options→choices,
 *    options[].order→choices[].sortOrder); scalar FKs → connect form;
 *    enrichment fields pass through.
 *  - db.certification: group → subjectGroup.
 *  - db.lesson: order→sortOrder, durationMin→duration,
 *    conceptIntroduction→description; drop example/keyFormulas/exercise;
 *    strip sectionId; scalar FKs → connect form.
 *  - db.knowledgeObject / db.reference: strip sectionId; scalar FKs → connect.
 *
 * Scalar-FK → connect form is used because Prisma's type resolution between
 * {Model}CreateInput and {Model}UncheckedCreateInput is finicky when a payload
 * mixes scalar FKs with other fields; the `connect` form always works.
 */
import { PrismaClient } from "@prisma/client";

const real = new PrismaClient();

type FkMap = Record<string, string>; // scalar FK field → relation name

function remap(
  data: any,
  opts: { fieldMap?: Record<string, string>; drop?: Set<string>; fk?: FkMap },
) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const { fieldMap = {}, drop, fk = {} } = opts;
  const out: any = {};
  for (const k of Object.keys(data)) {
    if (drop?.has(k)) continue;
    if (k === "sectionId") continue; // always strip
    const v = data[k];
    if (fk[k] !== undefined) {
      if (v === null || v === undefined) continue; // null FK → drop, don't connect
      out[fk[k]] = { connect: { id: v } };
      continue;
    }
    out[fieldMap[k] ?? k] = v;
  }
  return out;
}

const Q_OPTS = { fk: { certificationId: "certification", domainId: "domain", competencyId: "competency", lessonId: "lesson", knowledgeObjectId: "knowledgeObject" } as FkMap };
function mapQuestionData(data: any) {
  // NOTE: do NOT drop 'stem' here — copy stem→question AFTER remap.
  const d = remap(data, Q_OPTS);
  if (d.options && Array.isArray(d.options.create)) {
    d.choices = {
      create: d.options.create.map((o: any) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        sortOrder: o.order ?? o.sortOrder ?? 0,
      })),
    };
    delete d.options;
  }
  if (d.stem !== undefined) {
    d.question = d.stem;
    delete d.stem;
  }
  return d;
}

const CERT_OPTS = { fieldMap: { group: "subjectGroup" } };
const LESSON_OPTS = {
  fieldMap: { order: "sortOrder", durationMin: "duration", conceptIntroduction: "description" },
  drop: new Set(["example", "keyFormulas", "exercise"]),
  fk: { certificationId: "certification", domainId: "domain", competencyId: "competency", moduleId: "module", chapterId: "chapter" } as FkMap,
};
const KO_OPTS = { fk: { certificationId: "certification", domainId: "domainRef", competencyId: "competencyRef", lessonId: "lesson" } as FkMap };
const REF_OPTS = { fk: { disciplineId: "discipline" } as FkMap };
const PP_OPTS = { fk: { certificationId: "certification", domainId: "domain", competencyId: "competency", lessonId: "lesson", knowledgeObjectId: "knowledgeObject" } as FkMap };

function mapped(realDelegate: any, opts: { fieldMap?: Record<string, string>; drop?: Set<string>; fk?: FkMap }) {
  return {
    create: (a: any) => realDelegate.create({ ...a, data: remap(a.data, opts) }),
    update: (a: any) => realDelegate.update({ ...a, data: remap(a.data, opts) }),
    upsert: (a: any) =>
      realDelegate.upsert({
        ...a,
        create: remap(a.create, opts),
        update: remap(a.update, opts),
      }),
    findFirst: (a: any) => realDelegate.findFirst(a),
    findUnique: (a: any) => realDelegate.findUnique(a),
    findMany: (a: any) => realDelegate.findMany(a),
    deleteMany: (a: any) => realDelegate.deleteMany(a),
    delete: (a: any) => realDelegate.delete(a),
    count: (a?: any) => realDelegate.count(a),
    groupBy: (a: any) => realDelegate.groupBy(a),
  };
}

const questionObj = {
  create: (a: any) => real.practiceProblem.create({ ...a, data: mapQuestionData(a.data) }),
  update: (a: any) => real.practiceProblem.update({ ...a, data: mapQuestionData(a.data) }),
  upsert: (a: any) =>
    real.practiceProblem.upsert({
      ...a,
      create: mapQuestionData(a.create),
      update: mapQuestionData(a.update),
    }),
  findFirst: (a: any) => real.practiceProblem.findFirst(a),
  findUnique: (a: any) => real.practiceProblem.findUnique(a),
  findMany: (a: any) => real.practiceProblem.findMany(a),
  deleteMany: (a: any) => real.practiceProblem.deleteMany(a),
  count: (a?: any) => real.practiceProblem.count(a),
  groupBy: (a: any) => real.practiceProblem.groupBy(a),
};

const MAPPED: Record<string, any> = {
  certification: mapped(real.certification, CERT_OPTS),
  lesson: mapped(real.lesson, LESSON_OPTS),
  knowledgeObject: mapped(real.knowledgeObject, KO_OPTS),
  reference: mapped(real.reference, REF_OPTS),
  practiceProblem: mapped(real.practiceProblem, PP_OPTS),
};

export const db = new Proxy(real as any, {
  get(_target: any, prop: string) {
    if (prop === "question") return questionObj;
    if (prop === "$disconnect") return () => real.$disconnect();
    if (MAPPED[prop]) return MAPPED[prop];
    return (real as any)[prop]; // pass-through real delegate (NOT wrapped)
  },
});

export { real as prismaReal };
