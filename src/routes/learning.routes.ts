/**
 * Learning Routes
 * Uses the courses database for learning content
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getCoursesDb } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

// Type definitions for database rows
interface DisciplineRow {
  id: number;
  key: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  chapter_count?: number;
}

interface ChapterRow {
  id: number;
  discipline_id: number;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
}

interface LessonRow {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  duration_minutes: number | null;
  level: string | null;
  type: string | null;
  order: number;
  is_published: number;
  created_at: string;
  updated_at: string;
  objective_count?: number;
  simulation_count?: number;
  problem_count?: number;
}

interface SimulationRow {
  id: number;
  lesson_id: number;
  name: string;
  type: string | null;
  description: string | null;
  canvas_width: number | null;
  canvas_height: number | null;
  config: string | null;
  created_at: string;
  updated_at: string;
  controls?: SimulationControlRow[];
}

interface SimulationControlRow {
  id: number;
  simulation_id: number;
  name: string;
  label: string | null;
  control_type: string;
  min_value: number | null;
  max_value: number | null;
  default_value: number | null;
  step: number | null;
  unit: string | null;
  order: number;
}

interface PracticeProblemRow {
  id: number;
  lesson_id: number;
  title: string | null;
  description: string | null;
  difficulty: string | null;
  problem_type: string | null;
  correct_answer: string | null;
  tolerance: number | null;
  explanation: string | null;
  solution_steps: string | null;
  formula: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  choices?: ProblemChoiceRow[];
}

interface ProblemChoiceRow {
  id: number;
  problem_id: number;
  value: string;
  text: string | null;
  is_correct: number;
  order: number;
}

/**
 * GET /api/learning/disciplines
 * List all disciplines
 */
router.get('/disciplines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getCoursesDb();
    const disciplines = db.prepare(`
      SELECT d.*,
        (SELECT COUNT(*) FROM chapters c WHERE c.discipline_id = d.id) as chapter_count
      FROM disciplines d
      WHERE d.is_active = 1
      ORDER BY d.\`order\` ASC
    `).all() as DisciplineRow[];

    // Return data directly for frontend compatibility
    res.json(disciplines);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/disciplines/:key
 * Get discipline by key with chapters
 */
router.get('/disciplines/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = String(req.params.key);
    const db = getCoursesDb();

    const discipline = db.prepare(`
      SELECT * FROM disciplines WHERE key = ? AND is_active = 1
    `).get(key) as DisciplineRow | undefined;

    if (!discipline) {
      throw new NotFoundError('Discipline not found');
    }

    const chapters = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = c.id) as lesson_count
      FROM chapters c
      WHERE c.discipline_id = ? AND c.is_active = 1
      ORDER BY c.\`order\` ASC
    `).all(discipline.id) as ChapterRow[];

    // Return data directly for frontend compatibility
    res.json({ ...discipline, chapters });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/chapters/:disciplineKey
 * List chapters for a discipline
 */
router.get('/chapters/:disciplineKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disciplineKey = String(req.params.disciplineKey);
    const db = getCoursesDb();

    const chapters = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = c.id) as lesson_count
      FROM chapters c
      JOIN disciplines d ON c.discipline_id = d.id
      WHERE d.key = ? AND c.is_active = 1
      ORDER BY c.\`order\` ASC
    `).all(disciplineKey) as ChapterRow[];

    // Return data directly for frontend compatibility
    res.json(chapters);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/lessons/:chapterId
 * List lessons for a chapter
 */
router.get('/lessons/:chapterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapterId = parseInt(String(req.params.chapterId), 10);
    const db = getCoursesDb();

    const lessons = db.prepare(`
      SELECT l.*,
        (SELECT COUNT(*) FROM learning_objectives lo WHERE lo.lesson_id = l.id) as objective_count,
        (SELECT COUNT(*) FROM simulations s WHERE s.lesson_id = l.id) as simulation_count,
        (SELECT COUNT(*) FROM practice_problems pp WHERE pp.lesson_id = l.id) as problem_count
      FROM lessons l
      WHERE l.chapter_id = ? AND l.is_published = 1
      ORDER BY l.\`order\` ASC
    `).all(chapterId) as LessonRow[];

    // Return data directly for frontend compatibility
    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/lesson/:id
 * Get full lesson content
 */
router.get('/lesson/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const db = getCoursesDb();

    const lesson = db.prepare(`
      SELECT * FROM lessons WHERE id = ?
    `).get(id) as LessonRow | undefined;

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Get learning objectives
    const objectives = db.prepare(`
      SELECT * FROM learning_objectives
      WHERE lesson_id = ?
      ORDER BY \`order\` ASC
    `).all(id);

    // Get article content
    const article = db.prepare(`
      SELECT * FROM articles WHERE lesson_id = ?
    `).get(id);

    // Get simulations with controls
    const simulations = db.prepare(`
      SELECT * FROM simulations WHERE lesson_id = ? ORDER BY id
    `).all(id) as SimulationRow[];

    for (const sim of simulations) {
      sim.controls = db.prepare(`
        SELECT * FROM simulation_controls
        WHERE simulation_id = ?
        ORDER BY \`order\` ASC
      `).all(sim.id) as SimulationControlRow[];
    }

    // Get practice problems with choices
    const practiceProblems = db.prepare(`
      SELECT * FROM practice_problems WHERE lesson_id = ? ORDER BY \`order\` ASC
    `).all(id) as PracticeProblemRow[];

    for (const problem of practiceProblems) {
      problem.choices = db.prepare(`
        SELECT * FROM problem_choices
        WHERE problem_id = ?
        ORDER BY \`order\` ASC
      `).all(problem.id) as ProblemChoiceRow[];
    }

    // Return data directly for frontend compatibility
    res.json({
      ...lesson,
      objectives,
      article,
      simulations,
      practiceProblems,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/simulation/:id
 * Get simulation with controls
 */
router.get('/simulation/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const db = getCoursesDb();

    const simulation = db.prepare(`
      SELECT * FROM simulations WHERE id = ?
    `).get(id) as SimulationRow | undefined;

    if (!simulation) {
      throw new NotFoundError('Simulation not found');
    }

    const controls = db.prepare(`
      SELECT * FROM simulation_controls
      WHERE simulation_id = ?
      ORDER BY \`order\` ASC
    `).all(id) as SimulationControlRow[];

    const results = db.prepare(`
      SELECT * FROM simulation_results
      WHERE simulation_id = ?
      ORDER BY \`order\` ASC
    `).all(id);

    // Return data directly for frontend compatibility
    res.json({ ...simulation, controls, results });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/quiz/submit
 * Submit quiz answers
 */
router.post('/quiz/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId, answers } = req.body;

    if (!lessonId || !answers || !Array.isArray(answers)) {
      throw new ValidationError('Lesson ID and answers array are required');
    }

    const db = getCoursesDb();

    // Get all problems for this lesson
    const problems = db.prepare(`
      SELECT * FROM practice_problems 
      WHERE lesson_id = ?
      ORDER BY \`order\` ASC
    `).all(lessonId) as PracticeProblemRow[];

    let correctAnswers = 0;
    const results = answers.map(answer => {
      const problem = problems.find(p => p.id === answer.problemId);
      if (!problem) return null;

      // Get choices for this problem
      const choices = db.prepare(`
        SELECT * FROM problem_choices WHERE problem_id = ?
      `).all(problem.id) as ProblemChoiceRow[];

      const correctChoice = choices.find(c => c.is_correct === 1);
      const isCorrect = answer.choiceId === correctChoice?.id;
      if (isCorrect) correctAnswers++;

      return {
        problemId: problem.id,
        question: problem.title || problem.description,
        selectedChoice: answer.choiceId,
        correctChoice: correctChoice?.id,
        isCorrect,
        explanation: problem.explanation,
      };
    }).filter(Boolean);

    const score = problems.length > 0 ? (correctAnswers / problems.length) * 100 : 0;

    // Return data directly for frontend compatibility
    res.json({
      lessonId,
      score,
      correctAnswers,
      totalQuestions: problems.length,
      results,
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

    const db = getCoursesDb();
    const searchTerm = `%${q}%`;

    const lessons = db.prepare(`
      SELECT l.*, c.title as chapter_title, d.name as discipline_name, d.key as discipline_key
      FROM lessons l
      JOIN chapters c ON l.chapter_id = c.id
      JOIN disciplines d ON c.discipline_id = d.id
      WHERE l.is_published = 1 
        AND (l.title LIKE ? OR l.slug LIKE ?)
      ORDER BY l.title ASC
      LIMIT 20
    `).all(searchTerm, searchTerm);

    // Return data directly for frontend compatibility
    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

export default router;
