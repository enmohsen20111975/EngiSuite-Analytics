/**
 * Learning Routes — Prisma-based (replaces sql.js version).
 * Serves disciplines + lessons from the Prisma DB (merged with knowledge engine).
 */
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError } from '../middleware/error.middleware.js';

const router = Router();

/** GET /api/learning/disciplines — list all disciplines (general track) + certifications (cert track) */
router.get('/disciplines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const disciplines = await prisma.discipline.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { chapters: true } } },
    });
    const certs = await prisma.certification.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { lessons: true, practiceProblems: true, knowledgeObjects: true } } },
    });
    res.json({
      success: true,
      data: {
        disciplines: disciplines.map((d: any) => ({
          id: d.id, slug: d.slug, name: d.name, description: d.description,
          icon: d.icon, color: d.color, subjectGroup: d.subjectGroup,
          sortOrder: d.sortOrder, chapters: d._count.chapters,
        })),
        certifications: certs.map((c: any) => ({
          id: c.id, slug: c.slug, name: c.name, fullName: c.fullName,
          body: c.body, color: c.color, icon: c.icon,
          subjectGroup: c.subjectGroup, order: c.order,
          lessons: c._count.lessons, questions: c._count.questions,
          knowledgeObjects: c._count.knowledgeObjects,
        })),
      },
    });
  } catch (e: any) { next(e); }
});

/** GET /api/learning/lesson/:id — get a lesson with sections + questions */
router.get('/lesson/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        chapter: { include: { discipline: true } },
        certification: true,
        competency: true,
        practiceProblems: {
          where: { status: 'READY' },
          include: { choices: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    if (!lesson) return next(new NotFoundError('Lesson not found'));
    let sections = null;
    try { sections = lesson.sections ? JSON.parse(lesson.sections) : null; } catch {}
    res.json({
      success: true,
      data: {
        id: lesson.id, title: lesson.title, titleAr: lesson.titleAr,
        slug: lesson.slug, status: lesson.status, version: lesson.version,
        confidence: lesson.confidence, verificationStatus: lesson.verificationStatus,
        duration: lesson.duration, difficulty: lesson.difficulty,
        sections,
        discipline: lesson.chapter?.discipline || null,
        certification: lesson.certification || null,
        competency: lesson.competency || null,
        practiceProblems: lesson.practiceProblems.map((p: any) => ({
          id: p.id, question: p.question, type: p.type, difficulty: p.difficulty,
          bloomLevel: p.bloomLevel, cognitiveLevel: p.cognitiveLevel,
          choices: p.choices.map((c: any) => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
          whyCorrect: p.whyCorrect, explanation: p.explanation,
        })),
      },
    });
  } catch (e: any) { next(e); }
});

/** GET /api/learning/certifications — list certifications (alias to knowledge module) */
router.get('/certifications', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const certs = await prisma.certification.findMany({
      orderBy: { order: 'asc' },
      include: {
        domains: { orderBy: { order: 'asc' }, include: { competencies: { orderBy: { order: 'asc' } } } },
      },
    });
    res.json({ success: true, data: certs });
  } catch (e: any) { next(e); }
});

export default router;
