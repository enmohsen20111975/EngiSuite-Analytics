# Learning Center Integration Plan

## Overview

This document outlines the detailed plan to integrate the **Engineering Mastery Academy** courses repository (`https://github.com/enmohsen20111975/courses-for-my-app-.git`) into the **EngiSuite Learning Center** as the main training center, replacing the old database data.

---

## Executive Summary

| Aspect | Current State | Target State |
|--------|---------------|--------------|
| **Database** | `courses.db` (SQLite) | `engmastery.db` (SQLite) |
| **Structure** | Disciplines → Chapters → Lessons | Courses → Modules → Chapters → Lessons |
| **ID Type** | INTEGER (auto-increment) | TEXT (string-based IDs) |
| **Content** | Separate articles table | Embedded markdown content |
| **Quizzes** | Normalized (problems + choices tables) | JSON-embedded questions |
| **Disciplines** | 5 basic disciplines | 7 engineering disciplines |

---

## Part 1: Database Schema Comparison

### Current Schema (EngiSuite `courses.db`)

```sql
-- Current hierarchy: disciplines → chapters → lessons
disciplines (id, key, name, icon, color, description, order, is_active)
chapters (id, discipline_id, title, slug, description, icon, order, is_active)
lessons (id, chapter_id, title, slug, duration_minutes, level, type, order, is_published)
learning_objectives (id, lesson_id, text, order)
articles (id, lesson_id, content)
simulations (id, lesson_id, name, type, description, canvas_width, canvas_height, config)
simulation_controls (id, simulation_id, name, label, control_type, min_value, max_value, default_value, step, unit, order)
practice_problems (id, lesson_id, title, description, difficulty, problem_type, correct_answer, tolerance, explanation, solution_steps, formula, order)
problem_choices (id, problem_id, value, text, is_correct, order)
```

### Target Schema (Engineering Mastery `engmastery.db`)

```sql
-- Target hierarchy: courses → modules → chapters → lessons
courses (id TEXT, discipline TEXT, title TEXT, description TEXT)
modules (id TEXT, course_id TEXT, title TEXT, order_index INTEGER)
chapters (id TEXT, module_id TEXT, title TEXT, order_index INTEGER)
lessons (id TEXT, chapter_id TEXT, title TEXT, type TEXT, duration INTEGER, content TEXT, order_index INTEGER)
quizzes (id TEXT, lesson_id TEXT, questions TEXT) -- questions stored as JSON
```

### Key Structural Differences

| Feature | Current | Target | Migration Impact |
|---------|---------|--------|------------------|
| **Hierarchy Level** | 3 levels | 4 levels | Add modules layer |
| **Primary Keys** | INTEGER | TEXT | Update all foreign keys |
| **Content Storage** | Separate `articles` table | Embedded in `lessons.content` | Merge into single field |
| **Quiz Storage** | Normalized tables | JSON in `quizzes.questions` | Transform to JSON format |
| **Simulations** | Dedicated tables | Interactive blocks in content | Parse markdown code blocks |
| **Objectives** | Separate table | Embedded in content | Extract or embed |

---

## Part 2: Data Mapping Strategy

### Discipline/Course Mapping

| Current `disciplines.key` | Target `courses.id` | Notes |
|---------------------------|---------------------|-------|
| `electrical` | `electrical` | Direct mapping |
| `mechanical` | `mechanical` | Direct mapping |
| `civil` | `civil` | Direct mapping |
| `chemical` | `chemical` | Direct mapping |
| - | `aerospace` | **NEW** - Add to frontend |
| - | `computer` | **NEW** - Add to frontend |

### Entity Transformation

```
Current Structure:                    Target Structure:
├── disciplines                       ├── courses (was disciplines)
│   └── chapters                      │   └── modules (NEW LAYER)
│       └── lessons                   │       └── chapters
│           ├── articles              │           └── lessons
│           ├── objectives            │               ├── content (markdown)
│           ├── simulations           │               └── quizzes (JSON)
│           └── practice_problems     │
│               └── choices           │
```

### Field Mapping: Lessons

| Current Field | Target Field | Transformation |
|---------------|--------------|----------------|
| `id` (INTEGER) | `id` (TEXT) | Generate string ID like `ee-m1-c1-l1` |
| `chapter_id` (INTEGER) | `chapter_id` (TEXT) | Map to new chapter ID |
| `title` | `title` | Direct copy |
| `slug` | - | Not needed |
| `duration_minutes` | `duration` | Direct copy (minutes) |
| `level` | - | Not in target (can embed in content) |
| `type` | `type` | Direct copy (`reading`, `interactive`) |
| `order` | `order_index` | Rename field |
| `is_published` | - | Assume all published |

---

## Part 3: Implementation Phases

### Phase 1: Database Migration Infrastructure

**Duration:** 1-2 days

#### Tasks:
1. **Create migration script** (`scripts/migrate-to-engmastery.ts`)
   - Backup existing `courses.db`
   - Create new `engmastery.db` with target schema
   - Seed data from the repository

2. **Update database service** (`src/services/database.service.ts`)
   ```typescript
   // Add new database path
   DB_PATHS: {
     users: '...users.db',
     courses: '...engmastery.db', // Changed from courses.db
     workflows: '...workflows.db'
   }
   ```

3. **Create database initialization**
   - Copy seed logic from `temp_courses_repo/src/db/index.ts`
   - Adapt for EngiSuite backend structure

### Phase 2: API Routes Refactoring

**Duration:** 2-3 days

#### Tasks:
1. **Update learning routes** (`src/routes/learning.routes.ts`)

   **Current endpoints → New endpoints:**
   ```
   GET /api/learning/disciplines     → GET /api/learning/courses
   GET /api/learning/disciplines/:key → GET /api/learning/courses/:id
   GET /api/learning/chapters/:key   → GET /api/learning/modules/:courseId + /chapters/:moduleId
   GET /api/learning/lessons/:id     → GET /api/learning/lessons/:id (updated structure)
   GET /api/learning/lesson/:id      → GET /api/learning/lesson/:id (updated response)
   ```

2. **New route structure:**
   ```typescript
   // Course routes
   router.get('/courses', getCourses);
   router.get('/courses/:id', getCourseById);
   
   // Module routes
   router.get('/modules/:courseId', getModulesByCourse);
   
   // Chapter routes
   router.get('/chapters/module/:moduleId', getChaptersByModule);
   
   // Lesson routes
   router.get('/lessons/chapter/:chapterId', getLessonsByChapter);
   router.get('/lesson/:id', getLessonById);
   
   // Quiz routes
   router.get('/quiz/:lessonId', getQuizByLessonId);
   router.post('/quiz/submit', submitQuiz);
   
   // Search
   router.get('/search', searchLessons);
   ```

3. **Update response formats:**
   ```typescript
   // New CourseResponse type
   interface CourseResponse {
     id: string;
     discipline: string;
     title: string;
     description: string;
     totalLessons: number;
     modules?: ModuleResponse[];
   }
   
   // New LessonResponse type
   interface LessonResponse {
     id: string;
     chapter_id: string;
     title: string;
     type: 'reading' | 'interactive';
     duration: number;
     content: string; // Markdown content
     order_index: number;
     courseTitle?: string;
     moduleTitle?: string;
     chapterTitle?: string;
     prevLesson?: { id: string; title: string };
     nextLesson?: { id: string; title: string };
   }
   ```

### Phase 3: Frontend Updates

**Duration:** 3-4 days

#### Tasks:

1. **Update learning service** (`frontend-react/src/services/learningService.js`)
   ```javascript
   export const learningService = {
     // Updated methods
     async getCourses() {
       const response = await api.get('/learning/courses');
       return response.data;
     },
     
     async getCourse(courseId) {
       const response = await api.get(`/learning/courses/${courseId}`);
       return response.data;
     },
     
     async getModules(courseId) {
       const response = await api.get(`/learning/modules/${courseId}`);
       return response.data;
     },
     
     async getChapters(moduleId) {
       const response = await api.get(`/learning/chapters/module/${moduleId}`);
       return response.data;
     },
     
     async getLessons(chapterId) {
       const response = await api.get(`/learning/lessons/chapter/${chapterId}`);
       return response.data;
     },
     
     async getLesson(lessonId) {
       const response = await api.get(`/learning/lesson/${lessonId}`);
       return response.data;
     },
     
     async getQuiz(lessonId) {
       const response = await api.get(`/learning/quiz/${lessonId}`);
       return response.data;
     },
     
     async submitQuiz(lessonId, answers) {
       const response = await api.post('/learning/quiz/submit', { lessonId, answers });
       return response.data;
     },
   };
   ```

2. **Update LearningPage component** (`frontend-react/src/pages/LearningPage.jsx`)
   
   **New view states:**
   ```javascript
   const [view, setView] = useState('courses'); // courses, modules, chapters, lessons, lesson
   const [selectedCourse, setSelectedCourse] = useState(null);
   const [selectedModule, setSelectedModule] = useState(null);
   const [selectedChapter, setSelectedChapter] = useState(null);
   const [selectedLesson, setSelectedLesson] = useState(null);
   ```

3. **Add new navigation components:**
   - `CourseGridView` - Display courses in a grid
   - `ModuleListView` - Display modules within a course
   - Update `ChapterListView` - Adapt for new structure
   - Update `LessonListView` - Adapt for new structure
   - Update `LessonContentView` - Render markdown content

4. **Add markdown rendering:**
   ```bash
   npm install react-markdown remark-math rehype-katex
   ```
   
   ```jsx
   import ReactMarkdown from 'react-markdown';
   import remarkMath from 'remark-math';
   import rehypeKatex from 'rehype-katex';
   
   // In LessonContentView
   <ReactMarkdown
     remarkPlugins={[remarkMath]}
     rehypePlugins={[rehypeKatex]}
     components={{
       code: InteractiveCodeBlock, // Handle ```interactive blocks
     }}
   >
     {lesson.content}
   </ReactMarkdown>
   ```

5. **Add new discipline icons:**
   ```javascript
   const disciplineIcons = {
     electrical: Zap,
     mechanical: Cog,
     civil: Building2,
     chemical: Atom,
     aerospace: Plane,    // NEW
     computer: Cpu,       // NEW
     general: BookOpen,
   };
   ```

### Phase 4: Interactive Components Integration

**Duration:** 2-3 days

#### Tasks:

1. **Import interactive components from repository:**
   - Copy `InteractiveComponent.tsx` to `frontend-react/src/components/learning/`
   - Adapt for EngiSuite's existing simulation components

2. **Map interactive types to existing simulations:**
   ```javascript
   const interactiveComponentMap = {
     'ohms-law': OhmsLaw,
     'series-parallel': SeriesParallel,
     'logic-gate': LogicGates,
     'sine-wave': SineWave,
     'beam-deflection': BeamDeflection,
     'torque-sim': TorqueSim,
     'concrete-mix': ConcreteMix,
     'compression-test': CompressionTest,
     'airfoil-lift': AirfoilLift,
     'fluid-flow': FluidFlow,
     'piston-sim': PistonSim,
     'heat-engine': HeatEngine,
     'reaction-rate': ReactionRate,
     'gear-ratio': GearRatio,
     'projectile-motion': ProjectileMotion,
     'data-plotter': DataPlotter,
     '3d-transformer': Transformer3D,
     'stress-strain': StressStrain,
     'atom-model': AtomModel,
   };
   ```

3. **Create interactive block parser:**
   ```jsx
   function InteractiveCodeBlock({ className, children }) {
     const match = /language-interactive/.exec(className || '');
     if (match) {
       const config = JSON.parse(String(children));
       const Component = interactiveComponentMap[config.type];
       return Component ? <Component {...config} /> : null;
     }
     return <code className={className}>{children}</code>;
   }
   ```

### Phase 5: Quiz System Update

**Duration:** 1-2 days

#### Tasks:

1. **Update quiz data structure:**
   ```typescript
   interface QuizQuestion {
     question: string;
     options: string[];
     correctAnswer: number;
     explanation: string;
   }
   
   interface Quiz {
     id: string;
     lesson_id: string;
     questions: QuizQuestion[];
   }
   ```

2. **Update quiz submission:**
   ```typescript
   interface QuizAnswer {
     questionIndex: number;
     selectedIndex: number;
   }
   
   interface QuizSubmission {
     lessonId: string;
     answers: QuizAnswer[];
   }
   ```

3. **Update quiz UI component:**
   - Adapt for new question format
   - Show explanations after submission
   - Calculate and display score

### Phase 6: Testing & Validation

**Duration:** 1-2 days

#### Tasks:

1. **API Testing:**
   - Test all new endpoints
   - Verify data integrity
   - Check error handling

2. **Frontend Testing:**
   - Test navigation flow
   - Verify content rendering
   - Test interactive components
   - Validate quiz functionality

3. **Integration Testing:**
   - End-to-end user flow
   - Progress tracking
   - Search functionality

---

## Part 4: File Changes Summary

### Backend Files to Modify

| File | Changes |
|------|---------|
| `src/services/database.service.ts` | Add `engmastery.db` path, update initialization |
| `src/routes/learning.routes.ts` | Complete rewrite for new schema |
| `src/types/index.ts` | Update learning-related types |

### Backend Files to Create

| File | Purpose |
|------|---------|
| `scripts/migrate-to-engmastery.ts` | Database migration script |
| `scripts/seed-engmastery.ts` | Database seeding script |
| `src/services/engmastery.service.ts` | Database query functions |

### Frontend Files to Modify

| File | Changes |
|------|---------|
| `frontend-react/src/services/learningService.js` | Update API methods |
| `frontend-react/src/pages/LearningPage.jsx` | Complete redesign for new structure |
| `frontend-react/src/components/layout/Sidebar.jsx` | Add new navigation items |

### Frontend Files to Create

| File | Purpose |
|------|---------|
| `frontend-react/src/components/learning/CourseGridView.jsx` | Course display component |
| `frontend-react/src/components/learning/ModuleListView.jsx` | Module list component |
| `frontend-react/src/components/learning/QuizComponent.jsx` | Quiz UI component |
| `frontend-react/src/components/learning/MarkdownRenderer.jsx` | Markdown with interactive blocks |

### Dependencies to Add

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-math": "^6.0.0",
    "rehype-katex": "^7.0.0",
    "katex": "^0.16.0"
  }
}
```

---

## Part 5: Migration Execution Steps

### Step 1: Preparation

```bash
# 1. Backup existing database
cp Databases/courses.db Databases/courses.db.backup

# 2. Install new dependencies
cd frontend-react
npm install react-markdown remark-math rehype-katex katex

# 3. Create migration directory
mkdir -p scripts/migrations
```

### Step 2: Database Setup

```bash
# Run migration script
npm run migrate:engmastery

# Or manually:
# 1. Delete old courses.db
# 2. Create new engmastery.db
# 3. Run seed script
```

### Step 3: Backend Deployment

```bash
# 1. Update database service
# 2. Update learning routes
# 3. Restart backend
npm run dev
```

### Step 4: Frontend Deployment

```bash
# 1. Update learning service
# 2. Update LearningPage component
# 3. Build and test
cd frontend-react
npm run build
npm run dev
```

---

## Part 6: Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Create backup before migration |
| Breaking existing user progress | Medium | Migrate or reset progress data |
| Interactive components not working | Medium | Test all simulation types |
| API breaking changes | High | Version API or maintain backward compatibility |
| Performance issues with large content | Low | Implement pagination and lazy loading |

---

## Part 7: Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Database Migration | 1-2 days | None |
| Phase 2: API Refactoring | 2-3 days | Phase 1 |
| Phase 3: Frontend Updates | 3-4 days | Phase 2 |
| Phase 4: Interactive Components | 2-3 days | Phase 3 |
| Phase 5: Quiz System | 1-2 days | Phase 3 |
| Phase 6: Testing | 1-2 days | All phases |
| **Total** | **10-16 days** | |

---

## Part 8: Success Criteria

- [ ] All 7 engineering disciplines are available
- [ ] Course → Module → Chapter → Lesson navigation works
- [ ] Markdown content renders correctly with LaTeX
- [ ] All interactive simulations work
- [ ] Quiz system functions properly
- [ ] Search returns accurate results
- [ ] User progress tracking works
- [ ] No console errors
- [ ] API response times < 200ms
- [ ] Mobile responsive design maintained

---

## Appendix A: Sample API Responses

### GET /api/learning/courses

```json
[
  {
    "id": "electrical",
    "discipline": "electrical",
    "title": "Electrical Engineering",
    "description": "Master circuit analysis, power systems, and industrial automation.",
    "totalLessons": 150
  },
  {
    "id": "mechanical",
    "discipline": "mechanical",
    "title": "Mechanical Engineering",
    "description": "Learn statics, dynamics, thermodynamics, and machine design.",
    "totalLessons": 120
  }
]
```

### GET /api/learning/lesson/ee-m1-c1-l1

```json
{
  "id": "ee-m1-c1-l1",
  "chapter_id": "ee-m1-c1",
  "title": "Lesson 1.1: Charge, Current, Voltage, and Power",
  "type": "reading",
  "duration": 25,
  "content": "# Charge, Current, Voltage, and Power\n\nWelcome to...",
  "order_index": 1,
  "courseTitle": "Electrical Engineering",
  "moduleTitle": "Module 1: DC Circuit Analysis",
  "chapterTitle": "Chapter 1: Basic Concepts",
  "prevLesson": null,
  "nextLesson": {
    "id": "ee-m1-c1-l2",
    "title": "Lesson 1.2: Resistance and Ohm's Law"
  }
}
```

### GET /api/learning/quiz/ee-m1-c1-l1

```json
{
  "id": "ee-m1-c1-l1-q",
  "lesson_id": "ee-m1-c1-l1",
  "questions": [
    {
      "question": "What is the mathematical relationship between current, charge, and time?",
      "options": ["i = dq/dt", "i = dw/dq", "i = v/r", "i = p/v"],
      "correctAnswer": 0,
      "explanation": "Current is the time rate of change of charge, represented by the derivative dq/dt."
    }
  ]
}
```

---

## Appendix B: Interactive Component Types

| Type | Description | Existing Component |
|------|-------------|-------------------|
| `ohms-law` | Ohm's Law calculator | `OhmsLaw.jsx` |
| `series-parallel` | Series/Parallel resistor calculator | `SeriesParallel.jsx` |
| `logic-gate` | Logic gate simulator | `LogicGates.jsx` |
| `sine-wave` | Sine wave visualization | `SineWave.jsx` |
| `beam-deflection` | Beam deflection simulator | `BeamDeflection.jsx` |
| `torque-sim` | Torque simulation | `TorqueSim.jsx` |
| `concrete-mix` | Concrete mix designer | `ConcreteMix.jsx` |
| `compression-test` | Compression test simulator | `CompressionTest.jsx` |
| `airfoil-lift` | Airfoil lift simulation | `AirfoilLift.jsx` |
| `fluid-flow` | Fluid flow visualization | `FluidFlow.jsx` |
| `piston-sim` | Piston simulation | `PistonSim.jsx` |
| `heat-engine` | Heat engine simulation | `HeatEngine.jsx` |
| `reaction-rate` | Reaction rate simulator | `ReactionRate.jsx` |
| `gear-ratio` | Gear ratio calculator | `GearRatio.jsx` |
| `projectile-motion` | Projectile motion simulator | `ProjectileMotion.jsx` |
| `data-plotter` | Data plotting tool | `DataPlotter.jsx` |
| `3d-transformer` | 3D transformer model | `Transformer3D.jsx` |
| `stress-strain` | Stress-strain curve | `StressStrain.jsx` |
| `atom-model` | Atomic model visualization | `AtomModel.jsx` |

---

*Document Version: 1.0*
*Created: 2026-03-07*
*Author: EngiSuite Development Team*
