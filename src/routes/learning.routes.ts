/**
 * Learning Routes
 * Uses the engmastery database for learning content
 * Based on https://github.com/enmohsen20111975/courses-for-my-app-
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prepareCourses } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

// Type definitions for database rows
interface CourseRow {
  id: string;
  discipline: string;
  title: string;
  description: string;
  totalLessons?: number;
}

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  chapters?: { id: string; lesson_count: number }[];
}

interface ChapterRow {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  lesson_count?: number;
}

interface LessonRow {
  id: string;
  chapter_id: string;
  title: string;
  type: string;
  duration: number;
  content: string;
  order_index: number;
  courseTitle?: string;
  moduleTitle?: string;
  chapterTitle?: string;
  discipline?: string;
  prevLesson?: { id: string; title: string } | null;
  nextLesson?: { id: string; title: string } | null;
}

interface QuizRow {
  id: string;
  lesson_id: string;
  questions: string; // JSON string
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/**
 * GET /api/learning/courses
 * List all courses with lesson counts
 */
router.get('/courses', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = prepareCourses(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l
         JOIN chapters ch ON l.chapter_id = ch.id
         JOIN modules m ON ch.module_id = m.id
         WHERE m.course_id = c.id) as totalLessons
      FROM courses c
      ORDER BY c.id ASC
    `).all() as unknown as CourseRow[];

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/courses/:id
 * Get course by ID with modules
 */
router.get('/courses/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.id);

    const course = prepareCourses(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l
         JOIN chapters ch ON l.chapter_id = ch.id
         JOIN modules m ON ch.module_id = m.id
         WHERE m.course_id = c.id) as totalLessons
      FROM courses c
      WHERE c.id = ?
    `).get(courseId) as unknown as CourseRow | undefined;

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const modules = prepareCourses(`
      SELECT * FROM modules
      WHERE course_id = ?
      ORDER BY order_index ASC
    `).all(courseId) as unknown as ModuleRow[];

    // Get chapter and lesson counts for each module
    for (const module of modules) {
      const chapters = prepareCourses(`
        SELECT c.id,
          (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = c.id) as lesson_count
        FROM chapters c
        WHERE c.module_id = ?
        ORDER BY c.order_index ASC
      `).all(module.id) as unknown as { id: string; lesson_count: number }[];

      module.chapters = chapters;
    }

    res.json({ ...course, modules });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/modules/:courseId
 * List modules for a course
 */
router.get('/modules/:courseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = String(req.params.courseId);

    const modules = prepareCourses(`
      SELECT * FROM modules
      WHERE course_id = ?
      ORDER BY order_index ASC
    `).all(courseId) as unknown as ModuleRow[];

    res.json(modules);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/chapters/module/:moduleId
 * List chapters for a module
 */
router.get('/chapters/module/:moduleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moduleId = String(req.params.moduleId);

    const chapters = prepareCourses(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = c.id) as lesson_count
      FROM chapters c
      WHERE c.module_id = ?
      ORDER BY c.order_index ASC
    `).all(moduleId) as unknown as ChapterRow[];

    res.json(chapters);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/lessons/chapter/:chapterId
 * List lessons for a chapter
 */
router.get('/lessons/chapter/:chapterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapterId = String(req.params.chapterId);

    const lessons = prepareCourses(`
      SELECT id, chapter_id, title, type, duration, order_index
      FROM lessons
      WHERE chapter_id = ?
      ORDER BY order_index ASC
    `).all(chapterId) as unknown as LessonRow[];

    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/lesson/:id
 * Get full lesson content with navigation
 */
router.get('/lesson/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = String(req.params.id);

    const lesson = prepareCourses(`
      SELECT * FROM lessons WHERE id = ?
    `).get(lessonId) as unknown as LessonRow | undefined;

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Get chapter info
    const chapter = prepareCourses(`
      SELECT * FROM chapters WHERE id = ?
    `).get(lesson.chapter_id) as unknown as { id: string; module_id: string; title: string } | undefined;

    if (chapter) {
      lesson.chapterTitle = chapter.title;

      // Get module info
      const module = prepareCourses(`
        SELECT * FROM modules WHERE id = ?
      `).get(chapter.module_id) as unknown as { id: string; course_id: string; title: string } | undefined;

      if (module) {
        lesson.moduleTitle = module.title;

        // Get course info
        const course = prepareCourses(`
          SELECT * FROM courses WHERE id = ?
        `).get(module.course_id) as unknown as { id: string; discipline: string; title: string } | undefined;

        if (course) {
          lesson.courseTitle = course.title;
          lesson.discipline = course.discipline;
        }
      }
    }

    // Get all lessons for navigation
    const allModules = prepareCourses(`
      SELECT id FROM modules WHERE course_id = (SELECT course_id FROM modules WHERE id = ?)
      ORDER BY order_index ASC
    `).all(chapter?.module_id) as unknown as { id: string }[];

    let allLessons: { id: string; title: string }[] = [];
    for (const m of allModules) {
      const chapters = prepareCourses(`
        SELECT id FROM chapters WHERE module_id = ? ORDER BY order_index ASC
      `).all(m.id) as unknown as { id: string }[];

      for (const c of chapters) {
        const lessons = prepareCourses(`
          SELECT id, title FROM lessons WHERE chapter_id = ? ORDER BY order_index ASC
        `).all(c.id) as unknown as { id: string; title: string }[];
        allLessons = allLessons.concat(lessons);
      }
    }

    // Find prev/next lessons
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    lesson.prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    lesson.nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    res.json(lesson);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/quiz/:lessonId
 * Get quiz for a lesson
 */
router.get('/quiz/:lessonId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lessonId = String(req.params.lessonId);

    const quiz = prepareCourses(`
      SELECT * FROM quizzes WHERE lesson_id = ?
    `).get(lessonId) as unknown as QuizRow | undefined;

    if (!quiz) {
      res.json(null);
      return;
    }

    res.json({
      id: quiz.id,
      lesson_id: quiz.lesson_id,
      questions: JSON.parse(quiz.questions)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/quiz/submit
 * Submit quiz answers and get results
 */
router.post('/quiz/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId, answers } = req.body;

    if (!lessonId || !answers || !Array.isArray(answers)) {
      throw new ValidationError('Lesson ID and answers array are required');
    }

    // Get quiz for this lesson
    const quiz = prepareCourses(`
      SELECT * FROM quizzes WHERE lesson_id = ?
    `).get(lessonId) as unknown as QuizRow | undefined;

    if (!quiz) {
      throw new NotFoundError('Quiz not found for this lesson');
    }

    const questions: QuizQuestion[] = JSON.parse(quiz.questions);
    let correctAnswers = 0;

    const results = answers.map((answer: { questionIndex: number; selectedIndex: number }) => {
      const question = questions[answer.questionIndex];
      if (!question) return null;

      const isCorrect = answer.selectedIndex === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: answer.questionIndex,
        question: question.question,
        selectedIndex: answer.selectedIndex,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    }).filter(Boolean);

    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    res.json({
      lessonId,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      results
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/search
 * Search lessons
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query is required');
    }

    const searchTerm = `%${q}%`;

    const lessons = prepareCourses(`
      SELECT l.id, l.title, l.type, l.duration,
        ch.title as chapterTitle,
        m.title as moduleTitle,
        c.title as courseTitle,
        c.discipline
      FROM lessons l
      JOIN chapters ch ON l.chapter_id = ch.id
      JOIN modules m ON ch.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.title LIKE ? OR l.content LIKE ?
      ORDER BY l.title ASC
      LIMIT 20
    `).all(searchTerm, searchTerm) as unknown as LessonRow[];

    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// LEGACY COMPATIBILITY ROUTES
// These routes maintain backward compatibility with the old API
// ==========================================

/**
 * GET /api/learning/disciplines (Legacy)
 * Maps to courses - returns courses in the old discipline format
 */
router.get('/disciplines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = prepareCourses(`
      SELECT c.id as \`key\`, c.id, c.discipline, c.title as name, c.description,
        (SELECT COUNT(*) FROM lessons l
         JOIN chapters ch ON l.chapter_id = ch.id
         JOIN modules m ON ch.module_id = m.id
         WHERE m.course_id = c.id) as lessons_count,
        (SELECT COUNT(DISTINCT ch.id) FROM chapters ch
         JOIN modules m ON ch.module_id = m.id
         WHERE m.course_id = c.id) as chapters_count
      FROM courses c
      ORDER BY c.id ASC
    `).all();

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/disciplines/:key (Legacy)
 * Get discipline (course) by key with modules as chapters
 */
router.get('/disciplines/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = String(req.params.key);

    const course = prepareCourses(`
      SELECT c.id as \`key\`, c.id, c.discipline, c.title as name, c.description
      FROM courses c
      WHERE c.id = ?
    `).get(key);

    if (!course) {
      throw new NotFoundError('Discipline not found');
    }

    // Return modules as "chapters" for legacy compatibility
    const modules = prepareCourses(`
      SELECT m.id, m.title, m.order_index as \`order\`,
        (SELECT COUNT(*) FROM lessons l
         JOIN chapters ch ON l.chapter_id = ch.id
         WHERE ch.module_id = m.id) as lessons_count
      FROM modules m
      WHERE m.course_id = ?
      ORDER BY m.order_index ASC
    `).all(key);

    res.json({ ...course, chapters: modules });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/chapters/:disciplineKey (Legacy)
 * Returns modules as chapters for a discipline
 */
router.get('/chapters/:disciplineKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disciplineKey = String(req.params.disciplineKey);

    // Return modules as "chapters" for legacy compatibility
    const modules = prepareCourses(`
      SELECT m.id, m.title, m.order_index as \`order\`,
        (SELECT COUNT(*) FROM lessons l
         JOIN chapters ch ON l.chapter_id = ch.id
         WHERE ch.module_id = m.id) as lessons_count
      FROM modules m
      WHERE m.course_id = ?
      ORDER BY m.order_index ASC
    `).all(disciplineKey);

    res.json(modules);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/lessons/:chapterId (Legacy)
 * Returns lessons for a module (using chapter ID as module ID)
 */
router.get('/lessons/:chapterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The "chapterId" in legacy is actually a module ID
    const moduleId = String(req.params.chapterId);

    // Get all lessons from all chapters in this module
    const lessons = prepareCourses(`
      SELECT l.id, l.title, l.type, l.duration, l.order_index as \`order\`,
        l.type as level
      FROM lessons l
      JOIN chapters ch ON l.chapter_id = ch.id
      WHERE ch.module_id = ?
      ORDER BY ch.order_index ASC, l.order_index ASC
    `).all(moduleId);

    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

export default router;
