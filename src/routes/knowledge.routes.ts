/**
 * Knowledge Engine routes — exposes the Engineer's Educations certification
 * knowledge graph (5 certs, 24-section lessons, Knowledge Objects, validated
 * questions) from EngiSuite's Prisma DB.
 */
import { Router, Request, Response } from 'express';
import prisma from '../services/database.service.js';

const router = Router();

/** GET /api/knowledge/certifications — list with counts + readiness. */
router.get('/certifications', async (_req: Request, res: Response) => {
  try {
    const certs = await prisma.certification.findMany({
      orderBy: { order: 'asc' },
      include: {
        domains: {
          orderBy: { order: 'asc' },
          include: {
            competencies: { orderBy: { order: 'asc' }, include: { _count: { select: { lessons: true, practiceProblems: true } } } },
            _count: { select: { practiceProblems: true } },
          },
        },
        _count: { select: { lessons: true, practiceProblems: true, knowledgeObjects: true } },
      },
    });
    const readyQ = await prisma.practiceProblem.groupBy({
      by: ['certificationId'],
      where: { status: 'READY', certificationId: { not: null } },
      _count: { _all: true },
    });
    const readyQMap = new Map(readyQ.map((r) => [r.certificationId, r._count._all]));
    const readyL = await prisma.lesson.groupBy({
      by: ['certificationId'],
      where: { status: 'READY', certificationId: { not: null } },
      _count: { _all: true },
    });
    const readyLMap = new Map(readyL.map((r) => [r.certificationId, r._count._all]));
    const fullL = await prisma.lesson.groupBy({
      by: ['certificationId'],
      where: { sections: { not: null }, certificationId: { not: null } },
      _count: { _all: true },
    });
    const fullLMap = new Map(fullL.map((r) => [r.certificationId, r._count._all]));
    const out = certs.map((c) => {
      const lT = c._count.lessons || 1;
      const readiness = Math.round(
        0.4 * ((fullLMap.get(c.id) ?? 0) / lT) * 100 +
          0.25 * ((readyLMap.get(c.id) ?? 0) / lT) * 100 +
          0.35 * (c._count.practiceProblems ? ((readyQMap.get(c.id) ?? 0) / c._count.practiceProblems) * 100 : 0),
      );
      return {
        id: c.id, slug: c.slug, name: c.name, fullName: c.fullName, body: c.body,
        currentVersion: c.currentVersion, description: c.description, color: c.color,
        icon: c.icon, subjectGroup: c.subjectGroup, order: c.order,
        domains: c.domains.map((d) => ({
          id: d.id, code: d.code, name: d.name, weight: d.weight, order: d.order,
          description: d.description,
          competencyCount: d.competencies.length,
          lessonCount: d.competencies.reduce((s, x) => s + x._count.lessons, 0),
          questionCount: d._count.practiceProblems,
          competencies: d.competencies.map((x) => ({
            id: x.id, name: x.name, code: x.code, description: x.description, order: x.order,
            lessonCount: x._count.lessons, questionCount: x._count.practiceProblems,
          })),
        })),
        lessonsTotal: c._count.lessons,
        lessonsReady: readyLMap.get(c.id) ?? 0,
        lessonsFullTemplate: fullLMap.get(c.id) ?? 0,
        questionsTotal: c._count.practiceProblems,
        questionsReady: readyQMap.get(c.id) ?? 0,
        koCount: c._count.knowledgeObjects,
        readiness,
      };
    });
    res.json({ success: true, data: out });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/** GET /api/knowledge/certifications/:slug — full cert tree with lessons. */
router.get('/certifications/:slug', async (req: Request, res: Response) => {
  try {
    const c = await prisma.certification.findUnique({
      where: { slug: req.params.slug },
      include: {
        domains: {
          orderBy: { order: 'asc' },
          include: {
            competencies: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, titleAr: true, slug: true, sortOrder: true, status: true, duration: true } } },
            },
          },
        },
      },
    });
    if (!c) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: c });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/** GET /api/knowledge/lessons/:id — lesson with 24-section + practiceProblems. */
router.get('/lessons/:id', async (req: Request, res: Response) => {
  try {
    const l = await prisma.lesson.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        certification: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        competency: { select: { id: true, name: true } },
        practiceProblems: {
          orderBy: { sortOrder: 'asc' },
          include: { choices: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    if (!l) return res.status(404).json({ success: false, error: 'Lesson not found' });
    res.json({ success: true, data: l });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/** GET /api/knowledge/tracker — coverage summary across all certs. */
router.get('/tracker', async (_req: Request, res: Response) => {
  try {
    const certs = await prisma.certification.count();
    const domains = await prisma.domain.count();
    const comps = await prisma.competency.count();
    const lessons = await prisma.lesson.count({ where: { status: 'READY' } });
    const kps = await prisma.knowledgeObject.count();
    const qs = await prisma.practiceProblem.count({ where: { status: 'READY' } });
    const refs = await prisma.reference.count();
    res.json({ success: true, data: { certs, domains, competencies: comps, readyLessons: lessons, knowledgeObjects: kps, readyQuestions: qs, references: refs } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/** POST /api/knowledge/quiz/start — pick N questions (hide isCorrect). */
router.post('/quiz/start', async (req: Request, res: Response) => {
  try {
    const { certificationId, competencyId, difficulty, count = 10 } = req.body || {};
    const where: any = { status: 'READY' };
    if (certificationId) where.certificationId = certificationId;
    if (competencyId) where.competencyId = competencyId;
    if (difficulty) where.difficulty = difficulty;
    const all = await prisma.practiceProblem.findMany({
      where,
      include: { choices: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!all.length) return res.status(404).json({ success: false, error: 'No questions for this filter' });
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Math.min(count, all.length));
    const safe = shuffled.map((q) => ({
      id: q.id, type: q.type, difficulty: q.difficulty, bloomLevel: q.bloomLevel,
      cognitiveLevel: q.cognitiveLevel, skillType: q.skillType, scenario: q.scenario,
      question: q.question, explanation: null,
      choices: q.choices.map((c) => ({ id: c.id, text: c.text, isCorrect: false, sortOrder: c.sortOrder })),
    }));
    res.json({ success: true, data: { attemptId: null, questions: safe, total: safe.length } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
