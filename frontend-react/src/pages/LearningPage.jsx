import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '../services/learningService';
import { Card, Button, Loader } from '../components/ui';
import {
  BookOpen, GraduationCap, ChevronRight, ChevronDown, Clock,
  CircleCheck, CirclePlay, FileText, FlaskConical, Award,
  Zap, Building2, Cog, Wrench, Atom, Calculator, Search,
  ArrowLeft, Target, Lightbulb, PenTool, Bookmark, ChartColumn,
  Lock, LockOpen, Star, Play, Pause, RotateCcw, Menu, X, Plane,
  Settings, Activity, Circle
} from 'lucide-react';
import { cn } from '../lib/utils';
import InteractiveSimulation from '../components/learning/InteractiveSimulation';
import { SINAMICS_COURSE, SINAMICS_MODULES } from '../data/sinamicsCourseData';
import { KINETIC_GEOMETRY_COURSE, KINETIC_GEOMETRY_MODULES } from '../data/kineticGeometryCourseData';
import { CERTIFICATIONS } from '../data/certificationsData';
import SinamicsMotorLab from '../components/learning/simulations/SinamicsMotorLab';
import SinamicsPIDLab from '../components/learning/simulations/SinamicsPIDLab';
import SinamicsInverterFlow from '../components/learning/simulations/SinamicsInverterFlow';

// Inline wrapper for rendering interactive simulation blocks found in lesson markdown
function InteractiveBlock({ config }) {
  const [open, setOpen] = useState(false);
  const type = config && config.type ? config.type : null;

  return (
    <div className="my-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <FlaskConical className="w-8 h-8 mx-auto mb-2 text-purple-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Interactive Simulation</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Button size="sm" onClick={() => setOpen((s) => !s)}>
            {open ? 'Close Simulation' : 'Launch Simulation'}
          </Button>
          {type && <span className="text-xs text-gray-500">{type}</span>}
        </div>
      </div>
      {open && type && (
        <div className="mt-4">
          <InteractiveSimulation type={type} config={config} />
        </div>
      )}
    </div>
  );
}

// Discipline icons mapping
const disciplineIcons = {
  electrical: Zap,
  civil: Building2,
  mechanical: Cog,
  chemical: FlaskConical,
  aerospace: Plane,
  general: BookOpen,
  sinamics: Zap,
  mathematics: Calculator,
};

// Type colors for lesson types
const typeColors = {
  reading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  video: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  interactive: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  quiz: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

// Level colors for difficulty levels
const levelColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const certificationIcons = {
  award: Award,
  chartColumn: ChartColumn,
  activity: Activity,
  bookmark: Bookmark,
  circle: Circle,
  wrench: Wrench,
  star: Star,
};

const certificationColorStyles = {
  green: {
    card: 'border-green-200 dark:border-green-800/80',
    iconWrap: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-300',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    accent: 'text-green-600 dark:text-green-300',
  },
  blue: {
    card: 'border-blue-200 dark:border-blue-800/80',
    iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    accent: 'text-blue-600 dark:text-blue-300',
  },
  purple: {
    card: 'border-purple-200 dark:border-purple-800/80',
    iconWrap: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    accent: 'text-purple-600 dark:text-purple-300',
  },
  indigo: {
    card: 'border-indigo-200 dark:border-indigo-800/80',
    iconWrap: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: 'text-indigo-600 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    accent: 'text-indigo-600 dark:text-indigo-300',
  },
  emerald: {
    card: 'border-emerald-200 dark:border-emerald-800/80',
    iconWrap: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    accent: 'text-emerald-600 dark:text-emerald-300',
  },
  teal: {
    card: 'border-teal-200 dark:border-teal-800/80',
    iconWrap: 'bg-teal-100 dark:bg-teal-900/30',
    icon: 'text-teal-600 dark:text-teal-300',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    accent: 'text-teal-600 dark:text-teal-300',
  },
  rose: {
    card: 'border-rose-200 dark:border-rose-800/80',
    iconWrap: 'bg-rose-100 dark:bg-rose-900/30',
    icon: 'text-rose-600 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    accent: 'text-rose-600 dark:text-rose-300',
  },
};

const hasText = (value, minLength = 3) => typeof value === 'string' && value.trim().length >= minLength;

const isCourseComplete = (course) => (
  Boolean(course?.id)
  && hasText(course?.title, 3)
  && hasText(course?.description, 12)
  && Number(course?.totalLessons) > 0
);

const isCertificationComplete = (certification) => {
  if (!certification) return false;

  const validLearningObjects = Array.isArray(certification.learningObjects)
    && certification.learningObjects.length >= 3
    && certification.learningObjects.every((item) => hasText(item?.title, 3) && hasText(item?.description, 8));

  return (
    hasText(certification?.title, 8)
    && hasText(certification?.description, 20)
    && validLearningObjects
    && Array.isArray(certification.features)
    && certification.features.length >= 2
    && Number(certification.totalLessons) > 0
    && hasText(certification.duration, 3)
    && hasText(certification.level, 3)
  );
};

const getCertificationStatus = (certification) => (
  isCertificationComplete(certification) && certification.status === 'available'
    ? 'available'
    : 'coming-soon'
);

export default function LearningPage() {
  // State management
  const [view, setView] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('learning-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const queryClient = useQueryClient();

  // Save progress to localStorage
  const saveProgress = (newProgress) => {
    localStorage.setItem('learning-progress', JSON.stringify(newProgress));
  };

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['learning-courses'],
    queryFn: () => learningService.getCourses(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch modules when course is selected
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['learning-modules', selectedCourse],
    queryFn: () => learningService.getModules(selectedCourse),
    enabled: !!selectedCourse,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch chapters when module is selected
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['learning-chapters', selectedModule],
    queryFn: () => learningService.getChaptersByModule(selectedModule),
    enabled: !!selectedModule,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch lessons when chapter is selected
  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['learning-lessons', selectedChapter],
    queryFn: () => learningService.getLessonsByChapter(selectedChapter),
    enabled: !!selectedChapter,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch single lesson when selected
  const { data: lessonData, isLoading: lessonLoading } = useQuery({
    queryKey: ['learning-lesson', selectedLesson],
    queryFn: () => learningService.getLesson(selectedLesson),
    enabled: !!selectedLesson,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch quiz when lesson is selected
  const { data: quizData } = useQuery({
    queryKey: ['learning-quiz', selectedLesson],
    queryFn: () => learningService.getQuiz(selectedLesson),
    enabled: !!selectedLesson,
    staleTime: 5 * 60 * 1000,
  });

  const courses = coursesData || [];
  const modules = modulesData || [];
  const chapters = chaptersData || [];
  const lessons = lessonsData || [];
  const currentLesson = lessonData;
  const currentQuiz = quizData;

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  }, [progress, courses]);

  // Handle course click
  const handleCourseClick = (course) => {
    setSelectedCourse(course.id);
    setSelectedModule(null);
    setSelectedChapter(null);
    setSelectedLesson(null);
    setView('modules');
  };

  // Handle module click
  const handleModuleClick = (module) => {
    setSelectedModule(module.id);
    setSelectedChapter(null);
    setSelectedLesson(null);
    setView('chapters');
  };

  // Handle chapter click
  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter.id);
    setSelectedLesson(null);
    setView('lessons');
  };

  // Handle lesson click
  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson.id);
    setView('lesson');
  };

  // Handle back navigation
  const handleBack = () => {
    if (view === 'lesson') {
      setSelectedLesson(null);
      setView('lessons');
    } else if (view === 'lessons') {
      setSelectedChapter(null);
      setView('chapters');
    } else if (view === 'chapters') {
      setSelectedModule(null);
      setView('modules');
    } else if (view === 'modules') {
      setSelectedCourse(null);
      setView('courses');
    }
  };

  // Mark lesson as complete
  const markLessonComplete = (lessonId) => {
    const newProgress = {
      ...progress,
      [lessonId]: {
        ...progress[lessonId],
        completed: true,
        completedAt: new Date().toISOString(),
      },
    };
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Update lesson progress
  const updateLessonProgress = (lessonId, progressUpdate) => {
    const newProgress = {
      ...progress,
      [lessonId]: {
        ...progress[lessonId],
        ...progressUpdate,
        updatedAt: new Date().toISOString(),
      },
    };
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Render lesson content view
  if (view === 'lesson' && currentLesson) {
    return (
      <LessonContentView
        lesson={currentLesson}
        quiz={currentQuiz}
        onBack={handleBack}
        loading={lessonLoading}
        progress={progress[currentLesson.id] || {}}
        onComplete={() => markLessonComplete(currentLesson.id)}
        onUpdateProgress={(update) => updateLessonProgress(currentLesson.id, update)}
      />
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      {sidebarOpen && view !== 'courses' && (
        <div className="w-72 flex-shrink-0">
          <Card className="p-4 sticky top-4">
            <LearningSidebar
              view={view}
              courses={courses}
              modules={modules}
              chapters={chapters}
              lessons={lessons}
              selectedCourse={selectedCourse}
              selectedModule={selectedModule}
              selectedChapter={selectedChapter}
              selectedLesson={selectedLesson}
              onCourseSelect={handleCourseClick}
              onModuleSelect={handleModuleClick}
              onChapterSelect={handleChapterClick}
              onLessonClick={handleLessonClick}
              progress={progress}
              onClose={() => setSidebarOpen(false)}
            />
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && view !== 'courses' && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {view === 'courses' && 'Learning Center'}
                {view === 'modules' && courses.find(c => c.id === selectedCourse)?.title}
                {view === 'chapters' && modules.find(m => m.id === selectedModule)?.title}
                {view === 'lessons' && chapters.find(c => c.id === selectedChapter)?.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {view === 'courses' && 'Master engineering concepts with interactive courses'}
                {view === 'modules' && 'Select a module to explore topics'}
                {view === 'chapters' && 'Select a chapter to view lessons'}
                {view === 'lessons' && 'Select a lesson to begin'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            
            {/* Progress Badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {overallProgress}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {courses.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current View</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {view}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <CircleCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Object.values(progress).filter(p => p.completed).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Content based on view */}
        {coursesLoading || modulesLoading || chaptersLoading || lessonsLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : view === 'courses' ? (
          <CourseGridView
            courses={courses}
            onSelect={handleCourseClick}
            progress={progress}
          />
        ) : view === 'modules' ? (
          <ModuleListView
            modules={modules}
            onSelect={handleModuleClick}
            onBack={handleBack}
            progress={progress}
          />
        ) : view === 'chapters' ? (
          <ChapterListView
            chapters={chapters}
            onSelect={handleChapterClick}
            onBack={handleBack}
            progress={progress}
          />
        ) : view === 'lessons' ? (
          <LessonListView
            lessons={lessons}
            onSelect={handleLessonClick}
            onBack={handleBack}
            progress={progress}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Learning Sidebar Component
 */
function LearningSidebar({
  view,
  courses,
  modules,
  chapters,
  lessons,
  selectedCourse,
  selectedModule,
  selectedChapter,
  selectedLesson,
  onCourseSelect,
  onModuleSelect,
  onChapterSelect,
  onLessonClick,
  progress,
  onClose,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Navigation</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="space-y-1">
        <button
          onClick={() => onCourseSelect(null)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          All Courses
        </button>
        {selectedCourse && (
          <div className="flex items-center gap-1 text-sm">
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 dark:text-gray-300">
              {courses.find(c => c.id === selectedCourse)?.title}
            </span>
          </div>
        )}
        {selectedModule && (
          <div className="flex items-center gap-1 text-sm">
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 dark:text-gray-300">
              {modules.find(m => m.id === selectedModule)?.title}
            </span>
          </div>
        )}
      </div>

      {/* Modules List */}
      {view !== 'courses' && modules.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Modules</h4>
          {modules.slice(0, 10).map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedModule === module.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{module.title}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chapters List */}
      {view !== 'courses' && view !== 'modules' && chapters.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chapters</h4>
          {chapters.slice(0, 10).map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedChapter === chapter.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{chapter.title}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lessons List */}
      {view === 'lessons' && lessons.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lessons</h4>
          {lessons.slice(0, 10).map((lesson) => {
            const isCompleted = progress[lesson.id]?.completed;
            return (
              <button
                key={lesson.id}
                onClick={() => onLessonClick(lesson)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedLesson === lesson.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CircleCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <CirclePlay className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{lesson.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Course Grid View
 */
function CollapsibleSectionCard({
  icon: Icon,
  title,
  description,
  badge,
  meta,
  isOpen,
  onToggle,
  className,
  iconWrapClassName,
  iconClassName,
  children,
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className={cn('p-3 rounded-xl', iconWrapClassName)}>
            <Icon className={cn('w-8 h-8', iconClassName)} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
            {meta && <div className="flex flex-wrap items-center gap-3 mt-3">{meta}</div>}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {isOpen ? 'Hide section' : 'Show section'}
        </button>
      </div>

      {isOpen && <div className="mt-6">{children}</div>}
    </Card>
  );
}

function CourseGridView({ courses, onSelect, progress }) {
  const isSinamicsComplete = isCourseComplete(SINAMICS_COURSE) && SINAMICS_MODULES.length > 0;
  const isKineticComplete = isCourseComplete(KINETIC_GEOMETRY_COURSE) && KINETIC_GEOMETRY_MODULES.length > 0;

  const [openSections, setOpenSections] = useState({
    recommended: true,
    sinamics: true,
    kineticGeometry: true,
    certifications: true,
  });
  const [openCertificationIds, setOpenCertificationIds] = useState(() =>
    CERTIFICATIONS.reduce((state, certification, index) => {
      state[certification.id] = index === 0;
      return state;
    }, {})
  );

  const certificationStats = useMemo(() => {
    const totalHours = CERTIFICATIONS.reduce((sum, certification) => {
      const numericHours = Number.parseInt(certification.duration, 10);
      return sum + (Number.isFinite(numericHours) ? numericHours : 0);
    }, 0);

    return {
      totalPrograms: CERTIFICATIONS.length,
      totalLearningObjects: CERTIFICATIONS.reduce(
        (sum, certification) => sum + (certification.learningObjects?.length || 0),
        0
      ),
      availableNow: CERTIFICATIONS.filter((certification) => getCertificationStatus(certification) === 'available').length,
      totalHours,
    };
  }, []);

  const toggleSection = (sectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  const toggleCertification = (certificationId) => {
    setOpenCertificationIds((current) => ({
      ...current,
      [certificationId]: !current[certificationId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const Icon = disciplineIcons[course.discipline] || disciplineIcons[course.id] || BookOpen;
          const completedLessons = Object.keys(progress).filter((id) => progress[id]?.completed).length;
          const courseIsComplete = isCourseComplete(course);

          return (
            <Card
              key={course.id}
              className={cn(
                'p-6 transition-all group',
                courseIsComplete ? 'cursor-pointer hover:shadow-lg' : 'opacity-75 cursor-not-allowed'
              )}
              onClick={() => {
                if (!courseIsComplete) return;
                onSelect(course);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {course.title}
                    </h3>
                    {!courseIsComplete && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {course.description || 'Engineering fundamentals and advanced concepts'}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{course.totalLessons || 0} lessons</span>
                      <span>{completedLessons}/{course.totalLessons || 0} completed</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: `${course.totalLessons > 0 ? (completedLessons / course.totalLessons) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
                {courseIsComplete ? (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <CollapsibleSectionCard
        icon={Star}
        title="Recommended for You"
        description="Quick starts selected from the core learning catalog."
        badge={<span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">3 picks</span>}
        isOpen={openSections.recommended}
        onToggle={() => toggleSection('recommended')}
        iconWrapClassName="bg-yellow-100 dark:bg-yellow-900/30"
        iconClassName="text-yellow-600 dark:text-yellow-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecommendedCard
            icon={Zap}
            title="Electrical Circuits Fundamentals"
            discipline="Electrical"
            level="beginner"
            duration="25 min"
          />
          <RecommendedCard
            icon={Building2}
            title="Structural Analysis Basics"
            discipline="Civil"
            level="intermediate"
            duration="60 min"
          />
          <RecommendedCard
            icon={Cog}
            title="Thermodynamics Introduction"
            discipline="Mechanical"
            level="beginner"
            duration="50 min"
          />
        </div>
      </CollapsibleSectionCard>

      <CollapsibleSectionCard
        icon={Zap}
        title={SINAMICS_COURSE.title}
        description={SINAMICS_COURSE.description}
        badge={!isSinamicsComplete ? <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Coming soon</span> : null}
        meta={(
          <>
            <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              {SINAMICS_COURSE.level}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {SINAMICS_COURSE.duration}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{SINAMICS_COURSE.totalLessons} lessons</span>
          </>
        )}
        isOpen={openSections.sinamics}
        onToggle={() => toggleSection('sinamics')}
        className="border-2 border-cyan-200 dark:border-cyan-800"
        iconWrapClassName="bg-cyan-100 dark:bg-cyan-900/30"
        iconClassName="text-cyan-600 dark:text-cyan-400"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SINAMICS_COURSE.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CircleCheck className="w-4 h-4 text-green-500" />
              {feature}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Course Modules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SINAMICS_MODULES.slice(0, 6).map((module) => (
              <div
                key={module.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  {module.type === 'SIMULATION_MOTOR' || module.type === 'SIMULATION_PID' || module.type === 'SIMULATION_INVERTER' ? (
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {module.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            onClick={() => {
              if (!isSinamicsComplete) return;
              onSelect({ id: 'sinamics-masterclass', title: SINAMICS_COURSE.title, description: SINAMICS_COURSE.description, totalLessons: SINAMICS_COURSE.totalLessons, discipline: 'sinamics' });
            }}
            className="bg-cyan-600 hover:bg-cyan-700"
            disabled={!isSinamicsComplete}
          >
            <Play className="w-4 h-4 mr-2" />
            {isSinamicsComplete ? 'Start Course' : 'Coming soon'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!isSinamicsComplete) return;
              onSelect({ id: 'sinamics-masterclass', title: SINAMICS_COURSE.title, description: SINAMICS_COURSE.description, totalLessons: SINAMICS_COURSE.totalLessons, discipline: 'sinamics' });
            }}
            className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
            disabled={!isSinamicsComplete}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            {isSinamicsComplete ? 'Try Motor Lab Demo' : 'Coming soon'}
          </Button>
        </div>
      </CollapsibleSectionCard>

      <CollapsibleSectionCard
        icon={Calculator}
        title={KINETIC_GEOMETRY_COURSE.title}
        description={KINETIC_GEOMETRY_COURSE.description}
        badge={!isKineticComplete ? <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Coming soon</span> : null}
        meta={(
          <>
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {KINETIC_GEOMETRY_COURSE.level}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {KINETIC_GEOMETRY_COURSE.duration}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{KINETIC_GEOMETRY_COURSE.totalLessons} lessons</span>
          </>
        )}
        isOpen={openSections.kineticGeometry}
        onToggle={() => toggleSection('kineticGeometry')}
        className="border-2 border-purple-200 dark:border-purple-800"
        iconWrapClassName="bg-purple-100 dark:bg-purple-900/30"
        iconClassName="text-purple-600 dark:text-purple-400"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {KINETIC_GEOMETRY_COURSE.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CircleCheck className="w-4 h-4 text-green-500" />
              {feature}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Course Modules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {KINETIC_GEOMETRY_MODULES.map((module) => (
              <div
                key={module.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  {module.type === 'SIMULATION_CURVES' || module.type === 'SIMULATION_FRACTALS' || module.type === 'SIMULATION_COORDINATES' ? (
                    <Atom className="w-4 h-4 text-purple-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {module.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            onClick={() => {
              if (!isKineticComplete) return;
              onSelect({ id: 'kinetic-geometry-lab', title: KINETIC_GEOMETRY_COURSE.title, description: KINETIC_GEOMETRY_COURSE.description, totalLessons: KINETIC_GEOMETRY_COURSE.totalLessons, discipline: 'mathematics' });
            }}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!isKineticComplete}
          >
            <Play className="w-4 h-4 mr-2" />
            {isKineticComplete ? 'Start Course' : 'Coming soon'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!isKineticComplete) return;
              onSelect({ id: 'kinetic-geometry-lab', title: KINETIC_GEOMETRY_COURSE.title, description: KINETIC_GEOMETRY_COURSE.description, totalLessons: KINETIC_GEOMETRY_COURSE.totalLessons, discipline: 'mathematics' });
            }}
            className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
            disabled={!isKineticComplete}
          >
            <Atom className="w-4 h-4 mr-2" />
            {isKineticComplete ? 'Explore Lissajous Curves' : 'Coming soon'}
          </Button>
        </div>
      </CollapsibleSectionCard>

      <CollapsibleSectionCard
        icon={Award}
        title="Master Industry-Leading Certifications"
        description="This section now renders the real certification tracks you added, with open and close controls for the whole section and for each certification item."
        badge={<span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">New</span>}
        meta={(
          <>
            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {certificationStats.totalPrograms} certification paths
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{certificationStats.availableNow} available now</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{certificationStats.totalHours} guided hours</span>
          </>
        )}
        isOpen={openSections.certifications}
        onToggle={() => toggleSection('certifications')}
        className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
        iconWrapClassName="bg-amber-100 dark:bg-amber-900/30"
        iconClassName="text-amber-600 dark:text-amber-400"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/60 dark:bg-gray-900/30 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{certificationStats.totalPrograms}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Real certification tracks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{certificationStats.totalLearningObjects}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Learning objects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{certificationStats.availableNow}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Open now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{certificationStats.totalHours}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Planned learning hours</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CERTIFICATIONS.map((certification) => {
            const Icon = certificationIcons[certification.icon] || Award;
            const styles = certificationColorStyles[certification.color] || certificationColorStyles.blue;
            const isCertificationOpen = !!openCertificationIds[certification.id];
            const certificationStatus = getCertificationStatus(certification);

            return (
              <div
                key={certification.id}
                className={cn(
                  'rounded-2xl border bg-white/90 dark:bg-gray-900/70 shadow-sm overflow-hidden',
                  styles.card
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleCertification(certification.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('p-2.5 rounded-xl', styles.iconWrap)}>
                        <Icon className={cn('w-5 h-5', styles.icon)} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{certification.shortTitle}</h4>
                          <span className={cn('px-2 py-0.5 text-xs rounded-full', styles.badge)}>
                            {certificationStatus === 'available' ? 'Available' : 'Coming soon'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{certification.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className={cn('px-2 py-1 rounded-full', levelColors[certification.level] || levelColors.intermediate)}>
                            {certification.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {certification.duration}
                          </span>
                          <span>{certification.totalLessons} lessons</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1 text-gray-400 dark:text-gray-500">
                      {isCertificationOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {isCertificationOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="pt-4 text-sm text-gray-600 dark:text-gray-300">
                      {certification.description}
                    </p>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        What you will study
                      </div>
                      <ul className="space-y-2">
                        {certification.learningObjects.map((item) => (
                          <li key={item.title} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CircleCheck className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>
                              <strong>{item.title}</strong>
                              {' - '}
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {certification.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={styles.accent}>{certification.learningObjects.length} structured modules</span>
                      <span className="text-gray-500 dark:text-gray-400">Open close enabled</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSectionCard>
    </div>
  );
}

/**
 * Module List View
 */
function ModuleListView({ modules, onSelect, onBack, progress }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      <div className="space-y-3">
        {modules.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No modules available for this course yet.</p>
          </Card>
        ) : (
          modules.map((module, index) => {
            const completedLessons = Object.keys(progress).filter(id => 
              progress[id]?.completed
            ).length;
            
            return (
              <Card
                key={module.id}
                className="p-5 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onSelect(module)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Multiple chapters
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Chapter List View
 */
function ChapterListView({ chapters, onSelect, onBack, progress }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Modules
      </button>

      <div className="space-y-3">
        {chapters.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No chapters available for this module yet.</p>
          </Card>
        ) : (
          chapters.map((chapter, index) => {
            const completedLessons = Object.keys(progress).filter(id => 
              progress[id]?.completed
            ).length;
            
            return (
              <Card
                key={chapter.id}
                className="p-5 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onSelect(chapter)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {chapter.lesson_count || 0} lessons
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {chapter.lesson_count || 0} lessons
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{(chapter.lesson_count || 0) * 20} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Lesson List View
 */
function LessonListView({ lessons, onSelect, onBack, progress }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Chapters
      </button>

      <div className="space-y-3">
        {lessons.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No lessons available in this chapter yet.</p>
          </Card>
        ) : (
          lessons.map((lesson, index) => {
            const isCompleted = progress[lesson.id]?.completed;
            const isStarted = progress[lesson.id]?.started;
            
            return (
              <Card
                key={lesson.id}
                className={cn(
                  'p-4 cursor-pointer hover:shadow-md transition-all',
                  isCompleted && 'border-l-4 border-l-green-500'
                )}
                onClick={() => onSelect(lesson)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isCompleted 
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : isStarted
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-800'
                  )}>
                    {isCompleted ? (
                      <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <span className="font-semibold text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        typeColors[lesson.type] || typeColors.reading
                      )}>
                        {lesson.type || 'Reading'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration || 15} min
                      </span>
                      {isStarted && !isCompleted && (
                        <span className="text-xs text-blue-500">In Progress</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Recommended Card Component
 */
function RecommendedCard({ icon: Icon, title, discipline, level, duration }) {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            {title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {discipline} • {duration}
          </p>
          <span className={cn(
            'inline-block mt-2 px-2 py-0.5 text-xs rounded-full',
            levelColors[level] || levelColors.beginner
          )}>
            {level}
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * Lesson Content View Component
 */
function LessonContentView({ lesson, quiz, onBack, loading, progress, onComplete, onUpdateProgress }) {
  const [activeSection, setActiveSection] = useState('content');
  const [readingProgress, setReadingProgress] = useState(progress.readingProgress || 0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    // Mark as started when viewed
    if (!progress.started) {
      onUpdateProgress({ started: true, startedAt: new Date().toISOString() });
    }
  }, []);

  // Track reading progress
  const handleScroll = (e) => {
    const element = e.target;
    const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setReadingProgress(Math.round(scrollPercent));
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (questionIndex, selectedIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedIndex
    }));
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!quiz) return;
    
    const answers = Object.entries(quizAnswers).map(([questionIndex, selectedIndex]) => ({
      questionIndex: parseInt(questionIndex),
      selectedIndex
    }));

    try {
      const results = await learningService.submitQuiz(lesson.id, answers);
      setQuizResults(results);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0">
        <Card className="p-4 sticky top-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </button>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Lesson Contents
          </h3>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('content')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                activeSection === 'content'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <FileText className="w-4 h-4" />
              Content
            </button>
            {quiz && quiz.questions && quiz.questions.length > 0 && (
              <button
                onClick={() => setActiveSection('quiz')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  activeSection === 'quiz'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <PenTool className="w-4 h-4" />
                Quiz
              </button>
            )}
          </nav>

          {/* Progress */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Your Progress
            </h4>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {readingProgress}% read
            </p>
          </div>

          {/* Lesson Info */}
          {lesson.courseTitle && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Course Path
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{lesson.courseTitle}</p>
                {lesson.moduleTitle && <p>→ {lesson.moduleTitle}</p>}
                {lesson.chapterTitle && <p>→ {lesson.chapterTitle}</p>}
              </div>
            </div>
          )}

          {/* Complete Button */}
          {!progress.completed && (
            <Button
              className="w-full mt-6"
              onClick={onComplete}
            >
              <CircleCheck className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
          
          {progress.completed && (
            <div className="mt-6 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
              <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed!
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {lesson.prevLesson && (
              <button
                onClick={() => window.location.reload()} // Simplified - would need proper navigation
                className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                ← Previous: {lesson.prevLesson.title}
              </button>
            )}
            {lesson.nextLesson && (
              <button
                onClick={() => window.location.reload()} // Simplified - would need proper navigation
                className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Next: {lesson.nextLesson.title} →
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Lesson Header */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  typeColors[lesson.type] || typeColors.reading
                )}>
                  {lesson.type || 'Reading'}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {lesson.duration || 30} min
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lesson.title}
              </h1>
              {lesson.chapterTitle && (
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {lesson.chapterTitle}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {activeSection === 'content' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Lesson Content
            </h2>
            <div 
              className="prose dark:prose-invert max-w-none overflow-y-auto max-h-[600px]"
              onScroll={handleScroll}
            >
              {lesson.content ? (
                <div className="whitespace-pre-wrap">
                  {(() => {
                    const lines = lesson.content.split('\n');
                    const elems = [];
                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i];
                      const key = `line-${i}`;

                      if (line.startsWith('# ')) {
                        elems.push(<h1 key={key} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>);
                        continue;
                      }
                      if (line.startsWith('## ')) {
                        elems.push(<h2 key={key} className="text-xl font-semibold mt-5 mb-3">{line.slice(3)}</h2>);
                        continue;
                      }
                      if (line.startsWith('### ')) {
                        elems.push(<h3 key={key} className="text-lg font-medium mt-4 mb-2">{line.slice(4)}</h3>);
                        continue;
                      }
                      if (line.startsWith('- **') || line.startsWith('* **')) {
                        const match = line.match(/[-*] \*\*(.+?)\*\*:?\s*(.*)/);
                        if (match) {
                          elems.push(
                            <li key={key} className="ml-4 my-1">
                              <strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}
                            </li>
                          );
                          continue;
                        }
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        elems.push(<li key={key} className="ml-4 my-1">{line.slice(2)}</li>);
                        continue;
                      }
                      if (line.startsWith('> ')) {
                        elems.push(
                          <blockquote key={key} className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
                            {line.slice(2)}
                          </blockquote>
                        );
                        continue;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        elems.push(<p key={key} className="font-bold my-2">{line.slice(2, -2)}</p>);
                        continue;
                      }
                      if (line.match(/^\d+\.\s/)) {
                        elems.push(<li key={key} className="ml-4 my-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
                        continue;
                      }

                      // Interactive fence handling: read until closing ``` and parse JSON
                      if (line.includes('```interactive')) {
                        // collect block lines until closing fence
                        const blockLines = [];
                        i++; // move to next line after fence
                        while (i < lines.length && !lines[i].includes('```')) {
                          blockLines.push(lines[i]);
                          i++;
                        }
                        // Parse JSON inside the fence
                        let config = null;
                        try {
                          const jsonText = blockLines.join('\n').trim();
                          if (jsonText) config = JSON.parse(jsonText);
                        } catch (err) {
                          console.error('Failed to parse interactive block JSON', err);
                        }

                        // Render interactive UI: Launch button toggles inline simulation
                        const simId = `sim-${i}`;
                        elems.push(
                          <InteractiveBlock key={simId} config={config} />
                        );
                        continue;
                      }

                      if (line.trim() === '---') {
                        elems.push(<hr key={key} className="my-6 border-gray-200 dark:border-gray-700" />);
                        continue;
                      }
                      if (line.trim() === '') {
                        elems.push(<br key={key} />);
                        continue;
                      }

                      // Handle bold text inline - add as paragraph with potential bold formatting
                      const boldLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                      if (boldLine !== line) {
                        elems.push(<p key={key} className="my-2" dangerouslySetInnerHTML={{ __html: boldLine }} />);
                      } else {
                        elems.push(<p key={key} className="my-2">{line}</p>);
                      }
                    }
                    return elems;
                  })()}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="mb-4">
                    This lesson covers fundamental concepts that will help you understand the core principles of engineering.
                  </p>
                  <p>No content available yet.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeSection === 'quiz' && quiz && quiz.questions && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-500" />
              Quiz
            </h2>
            
            {!quizSubmitted ? (
              <div className="space-y-6">
                {quiz.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      {qIndex + 1}. {question.question}
                    </h4>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            quizAnswers[qIndex] === oIndex
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => handleAnswerSelect(qIndex, oIndex)}
                            className="text-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < quiz.questions.length}
                  className="w-full"
                >
                  Submit Quiz
                </Button>
              </div>
            ) : quizResults && (
              <div className="space-y-6">
                <div className={cn(
                  'p-4 rounded-lg text-center',
                  quizResults.score >= 70 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                )}>
                  <p className={cn(
                    'text-4xl font-bold',
                    quizResults.score >= 70 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  )}>
                    {quizResults.score}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
                  </p>
                </div>

                {quizResults.results.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 border rounded-lg',
                      result.isCorrect
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-200 bg-red-50 dark:bg-red-900/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.question}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Your answer: {quiz.questions[result.questionIndex]?.options[result.selectedIndex]}
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Correct answer: {quiz.questions[result.questionIndex]?.options[result.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizResults(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Retake Quiz
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
