import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '../services/learningService';
import { Card, Button, Loader } from '../components/ui';
import {
  BookOpen, GraduationCap, ChevronRight, ChevronDown, Clock,
  CircleCheck, CirclePlay, FileText, FlaskConical, Award,
  Zap, Building2, Cog, Wrench, Atom, Calculator, Search,
  ArrowLeft, Target, Lightbulb, PenTool, Bookmark, ChartColumn,
  Lock, LockOpen, Star, Play, Pause, RotateCcw, Menu, X
} from 'lucide-react';
import { cn } from '../lib/utils';

// Discipline icons mapping
const disciplineIcons = {
  electrical: Zap,
  civil: Building2,
  mechanical: Cog,
  chemical: Atom,
  mathematics: Calculator,
  general: BookOpen,
};

const levelColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Progress storage key
const PROGRESS_KEY = 'engisuite_learning_progress';

// Get stored progress
const getStoredProgress = () => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save progress to localStorage
const saveProgress = (progress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

/**
 * Learning Center Page - Redesigned with Chapters, Lessons, Articles
 */
export default function LearningPage() {
  const [view, setView] = useState('disciplines'); // disciplines, chapters, lessons, lesson
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(getStoredProgress());
  const queryClient = useQueryClient();

  // Fetch disciplines
  const { data: disciplinesData, isLoading: disciplinesLoading } = useQuery({
    queryKey: ['learning-disciplines'],
    queryFn: () => learningService.getDisciplines(true, true),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch chapters when discipline is selected
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['learning-chapters', selectedDiscipline],
    queryFn: () => learningService.getChapters(selectedDiscipline, true),
    enabled: !!selectedDiscipline,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch lessons when chapter is selected
  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['learning-lessons', selectedChapter],
    queryFn: () => learningService.getLessons({ chapterId: selectedChapter, pageSize: 50 }),
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

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['learning-user-progress'],
    queryFn: () => learningService.getUserProgress().catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const disciplines = disciplinesData?.data || [];
  const chapters = chaptersData?.data || [];
  const lessons = lessonsData?.data || [];
  const currentLesson = lessonData?.data;

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    const totalLessons = disciplines.reduce((acc, d) => acc + (d.lessons_count || 0), 0);
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  }, [progress, disciplines]);

  // Handle discipline click
  const handleDisciplineClick = (discipline) => {
    setSelectedDiscipline(discipline.key);
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
      setSelectedDiscipline(null);
      setView('disciplines');
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
    
    // Also sync with backend if available
    learningService.updateLessonProgress(lessonId, { completed: true }).catch(() => {});
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
    
    // Also sync with backend if available
    learningService.updateLessonProgress(lessonId, progressUpdate).catch(() => {});
  };

  // Render lesson content view
  if (view === 'lesson' && currentLesson) {
    return (
      <LessonContentView
        lesson={currentLesson}
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
      {sidebarOpen && view !== 'disciplines' && (
        <div className="w-72 flex-shrink-0">
          <Card className="p-4 sticky top-4">
            <LearningSidebar
              view={view}
              disciplines={disciplines}
              chapters={chapters}
              lessons={lessons}
              selectedDiscipline={selectedDiscipline}
              selectedChapter={selectedChapter}
              selectedLesson={selectedLesson}
              onDisciplineSelect={handleDisciplineClick}
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
            {!sidebarOpen && view !== 'disciplines' && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {view === 'disciplines' && 'Learning Center'}
                {view === 'chapters' && disciplines.find(d => d.key === selectedDiscipline)?.name}
                {view === 'lessons' && chapters.find(c => c.id === selectedChapter)?.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {view === 'disciplines' && 'Master engineering concepts with interactive courses'}
                {view === 'chapters' && 'Browse chapters and topics'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Disciplines</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {disciplines.length}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Chapters</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {chapters.length || '---'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Lessons</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {lessons.length || '---'}
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
        {disciplinesLoading || chaptersLoading || lessonsLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : view === 'disciplines' ? (
          <DisciplineGridView
            disciplines={disciplines}
            onSelect={handleDisciplineClick}
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
  disciplines,
  chapters,
  lessons,
  selectedDiscipline,
  selectedChapter,
  selectedLesson,
  onDisciplineSelect,
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
          onClick={() => onDisciplineSelect(null)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          All Disciplines
        </button>
        {selectedDiscipline && (
          <div className="flex items-center gap-1 text-sm">
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 dark:text-gray-300">
              {disciplines.find(d => d.key === selectedDiscipline)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Chapters List */}
      {view !== 'disciplines' && chapters.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chapters</h4>
          {chapters.map((chapter) => (
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
 * Discipline Grid View
 */
function DisciplineGridView({ disciplines, onSelect, progress }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disciplines.map((discipline) => {
          const Icon = disciplineIcons[discipline.key] || BookOpen;
          const completedLessons = Object.keys(progress).filter(id => 
            progress[id]?.completed && discipline.lessons?.some?.(l => l.id === id)
          ).length;
          
          return (
            <Card
              key={discipline.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => onSelect(discipline)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {discipline.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {discipline.description || 'Engineering fundamentals and advanced concepts'}
                  </p>
                  
                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{discipline.chapters_count || 0} chapters</span>
                      <span>{completedLessons}/{discipline.lessons_count || 0} completed</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: `${discipline.lessons_count > 0 
                            ? (completedLessons / discipline.lessons_count) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recommended Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Recommended for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecommendedCard
            icon={Zap}
            title="Electrical Circuits Fundamentals"
            discipline="Electrical"
            level="beginner"
            duration="45 min"
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
      </Card>
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
        Back to Disciplines
      </button>

      <div className="space-y-3">
        {chapters.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No chapters available for this discipline yet.</p>
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {chapter.description || `${chapter.lessons_count || 0} lessons`}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {chapter.lessons_count || 0} lessons
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {chapter.estimated_duration || '30 min'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {Math.round((completedLessons / (chapter.lessons_count || 1)) * 100)}%
                      </p>
                      <p className="text-xs text-gray-400">complete</p>
                    </div>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        levelColors[lesson.level] || levelColors.beginner
                      )}>
                        {lesson.level || 'Beginner'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration || '15 min'}
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
function LessonContentView({ lesson, onBack, loading, progress, onComplete, onUpdateProgress }) {
  const [activeSection, setActiveSection] = useState('article');
  const [readingProgress, setReadingProgress] = useState(progress.readingProgress || 0);

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
    
    if (scrollPercent > 90 && !progress.completed) {
      // Auto-complete when scrolled to bottom
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
              onClick={() => setActiveSection('article')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                activeSection === 'article'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <FileText className="w-4 h-4" />
              Article
            </button>
            <button
              onClick={() => setActiveSection('practice')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                activeSection === 'practice'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <PenTool className="w-4 h-4" />
              Practice
            </button>
            <button
              onClick={() => setActiveSection('simulation')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                activeSection === 'simulation'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <FlaskConical className="w-4 h-4" />
              Simulation
            </button>
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

          {/* Learning Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Learning Objectives
              </h4>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CircleCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {objective.text || objective}
                  </li>
                ))}
              </ul>
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
                  levelColors[lesson.level] || levelColors.beginner
                )}>
                  {lesson.level || 'Beginner'}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {lesson.duration || '30 min'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lesson.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {lesson.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {activeSection === 'article' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Article
            </h2>
            <div 
              className="prose dark:prose-invert max-w-none overflow-y-auto max-h-[600px]"
              onScroll={handleScroll}
            >
              {lesson.article?.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.article.content }} />
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="mb-4">
                    This lesson covers fundamental concepts that will help you understand the core principles of engineering.
                  </p>
                  <h3>Introduction</h3>
                  <p>
                    Engineering is the application of scientific and mathematical principles to design and build systems, 
                    structures, and devices. Understanding these fundamentals is crucial for any engineering professional.
                  </p>
                  <h3>Key Concepts</h3>
                  <ul>
                    <li>Scientific principles and their applications</li>
                    <li>Mathematical modeling and analysis</li>
                    <li>Problem-solving methodologies</li>
                    <li>Design thinking and optimization</li>
                  </ul>
                  <h3>Practical Applications</h3>
                  <p>
                    The concepts learned in this lesson can be applied to real-world engineering challenges, 
                    from designing efficient systems to optimizing existing processes.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeSection === 'practice' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-500" />
              Practice Problems
            </h2>
            {lesson.problems && lesson.problems.length > 0 ? (
              <div className="space-y-4">
                {lesson.problems.map((problem, index) => (
                  <div
                    key={problem.id || index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Problem {index + 1}: {problem.question}
                    </h4>
                    {problem.choices && (
                      <div className="space-y-2 mt-3">
                        {problem.choices.map((choice, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <input type="radio" name={`problem-${index}`} className="text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">{choice.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No practice problems available for this lesson yet.</p>
              </div>
            )}
          </Card>
        )}

        {activeSection === 'simulation' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-green-500" />
              Interactive Simulation
            </h2>
            {lesson.simulations && lesson.simulations.length > 0 ? (
              <div className="text-center py-8">
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No simulations available for this lesson yet.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
