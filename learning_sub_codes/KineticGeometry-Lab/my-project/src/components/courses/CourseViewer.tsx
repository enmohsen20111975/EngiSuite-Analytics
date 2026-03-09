'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  Shapes,
  TrendingUp,
  Brain,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Zap,
  Eye,
  PenTool,
  Lightbulb,
  Target,
  Beaker,
  HelpCircle,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  allCategories,
  useCourseStore,
  type SubjectCategory,
  type Course,
  type Lesson,
  type LessonContent
} from '@/store/course-store';

interface CourseViewerProps {
  onBack: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Shapes,
  TrendingUp,
  Brain,
  Target: Calculator,
  BookOpen,
  Grid3X3: Calculator,
  BarChart2: TrendingUp,
  GitBranch: Shapes,
  Atom: Brain,
  Triangle: Shapes,
  Grid: Calculator,
  Waves: TrendingUp,
  CircleDot: Brain,
  Network: Brain,
  Layers: Shapes,
  Sparkles: Brain,
  ArrowUpRight: TrendingUp,
  ArrowDownRight: TrendingUp,
  Box: Shapes,
  Wind: TrendingUp,
};

export function CourseViewer({ onBack }: CourseViewerProps) {
  const {
    currentCategoryId,
    currentCourseId,
    currentLessonId,
    currentContentId,
    setCategory,
    setCourse,
    setLesson,
    setContent
  } = useCourseStore();

  // Get current items
  const category = allCategories.find(c => c.id === currentCategoryId);
  const course = category?.courses.find(c => c.id === currentCourseId);
  const lesson = course?.lessons.find(l => l.id === currentLessonId);
  const content = lesson?.content.find(c => c.id === currentContentId);

  // Handle navigation
  const handleCategorySelect = (cat: SubjectCategory) => {
    setCategory(cat.id);
    setCourse(null);
    setLesson(null);
    setContent(null);
  };

  const handleCourseSelect = (crs: Course) => {
    setCourse(crs.id);
    setLesson(null);
    setContent(null);
  };

  const handleLessonClick = (lsn: Lesson) => {
    setLesson(lsn.id);
    setContent(null);
  };

  const handleContentClick = (cnt: LessonContent) => {
    setContent(cnt.id);
  };

  const handleBack = () => {
    if (content) {
      setContent(null);
    } else if (lesson) {
      setLesson(null);
    } else if (course) {
      setCourse(null);
    } else if (category) {
      setCategory(null);
    }
  };

  // Render category selection
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
            <h1 className="text-xl font-bold">Course Catalog</h1>
            <div className="w-24" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Learning Path</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a subject category to explore our comprehensive courses with detailed lessons
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allCategories.map((cat) => {
              const Icon = iconMap[cat.icon] || BookOpen;
              return (
                <Card
                  key={cat.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-amber-500/30"
                  onClick={() => handleCategorySelect(cat)}
                >
                  <CardHeader>
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                      cat.color
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-amber-600 transition-colors">
                      {cat.title}
                    </CardTitle>
                    <CardDescription>{cat.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{cat.courses.length} courses</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Render course selection within a category
  if (!course) {
    const Icon = iconMap[category.icon] || BookOpen;
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Categories
            </Button>
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", category.color)}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">{category.title}</span>
            </div>
            <div className="w-24" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{category.title}</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {category.courses.map((crs) => {
              const CourseIcon = iconMap[crs.icon] || BookOpen;
              return (
                <Card
                  key={crs.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
                  onClick={() => handleCourseSelect(crs)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                        crs.color
                      )}>
                        <CourseIcon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className={cn(
                        crs.difficulty === 'beginner' && "border-emerald-500/30 text-emerald-600",
                        crs.difficulty === 'intermediate' && "border-blue-500/30 text-blue-600",
                        crs.difficulty === 'advanced' && "border-purple-500/30 text-purple-600",
                        crs.difficulty === 'expert' && "border-red-500/30 text-red-600"
                      )}>
                        {crs.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-4 group-hover:text-amber-600 transition-colors">
                      {crs.title}
                    </CardTitle>
                    <CardDescription>{crs.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {crs.lessons.length} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {crs.duration}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Render lesson list within a course
  if (!lesson) {
    const CourseIcon = iconMap[course.icon] || BookOpen;
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {category.title}
            </Button>
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", course.color)}>
                <CourseIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">{course.title}</span>
            </div>
            <div className="w-24" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h2>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            {course.introduction && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground mb-4">
                {course.introduction}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className={cn(
                course.difficulty === 'beginner' && "border-emerald-500/30 text-emerald-600",
                course.difficulty === 'intermediate' && "border-blue-500/30 text-blue-600",
                course.difficulty === 'advanced' && "border-purple-500/30 text-purple-600",
                course.difficulty === 'expert' && "border-red-500/30 text-red-600"
              )}>
                {course.difficulty}
              </Badge>
              <span className="text-muted-foreground">{course.lessons.length} lessons • {course.duration}</span>
            </div>
          </div>

          <div className="space-y-4">
            {course.lessons.map((lsn, index) => (
              <Card
                key={lsn.id}
                className="group cursor-pointer hover:shadow-md transition-all border-border/50 hover:border-amber-500/30"
                onClick={() => handleLessonClick(lsn)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-amber-600 transition-colors">
                        {lsn.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{lsn.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lsn.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {lsn.content.length} sections
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {lsn.difficulty}
                        </Badge>
                      </div>
                      {lsn.learningObjectives && lsn.learningObjectives.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {lsn.learningObjectives.slice(0, 2).map((obj, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {obj}
                            </Badge>
                          ))}
                          {lsn.learningObjectives.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{lsn.learningObjectives.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render lesson content selection
  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {course.title}
            </Button>
            <span className="font-semibold">{lesson.title}</span>
            <div className="w-24" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{lesson.title}</h2>
            <p className="text-muted-foreground mb-4">{lesson.description}</p>
            
            {lesson.prerequisites && lesson.prerequisites.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Prerequisites
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {lesson.prerequisites.map((prereq, i) => (
                    <li key={i}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                  <ListChecks className="w-4 h-4" />
                  Learning Objectives
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {lesson.learningObjectives.map((obj, i) => (
                    <li key={i}>• {obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {lesson.content.map((cnt) => {
              const typeIcons = {
                theory: FileText,
                interactive: Zap,
                visualization: Eye,
                exercise: PenTool
              };
              const TypeIcon = typeIcons[cnt.type] || FileText;

              return (
                <Card
                  key={cnt.id}
                  className="group cursor-pointer hover:shadow-md transition-all border-border/50 hover:border-amber-500/30"
                  onClick={() => handleContentClick(cnt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        cnt.type === 'theory' && "bg-blue-500/10 text-blue-600",
                        cnt.type === 'interactive' && "bg-purple-500/10 text-purple-600",
                        cnt.type === 'visualization' && "bg-amber-500/10 text-amber-600",
                        cnt.type === 'exercise' && "bg-emerald-500/10 text-emerald-600"
                      )}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold group-hover:text-amber-600 transition-colors">
                            {cnt.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {cnt.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cnt.duration}
                          </span>
                          {cnt.workedExample && (
                            <span className="flex items-center gap-1">
                              <Beaker className="w-3 h-3" />
                              Has worked example
                            </span>
                          )}
                          {cnt.practiceProblems && cnt.practiceProblems.length > 0 && (
                            <span className="flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" />
                              {cnt.practiceProblems.length} practice problems
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Render specific content with rich formatting
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {lesson.title}
          </Button>
          <span className="font-semibold">{content.title}</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="capitalize">
              {content.type}
            </Badge>
            <span className="text-sm text-muted-foreground">{content.duration}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        </div>

        {/* Main Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <div className="whitespace-pre-line bg-card/50 rounded-xl p-6 border border-border/50 text-base leading-relaxed">
            {content.content}
          </div>
        </div>

        {/* Formula if exists */}
        {content.formula && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Key Formula
            </h3>
            <div className="bg-muted/50 rounded-xl p-6 text-center border border-border/50">
              <div className="text-2xl font-mono">{content.formula}</div>
            </div>
          </div>
        )}

        {/* Key Points */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Key Points
          </h3>
          <div className="grid gap-3">
            {content.keyPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worked Example */}
        {content.workedExample && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-blue-500" />
              Worked Example
            </h3>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-base">Problem</CardTitle>
                <CardDescription className="whitespace-pre-line text-sm">
                  {content.workedExample.problem}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  <div className="font-medium text-sm text-blue-600 mb-2">Solution:</div>
                  {content.workedExample.solution.map((step, index) => (
                    <div key={index} className="text-sm font-mono text-muted-foreground">
                      {step}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <div className="font-medium text-sm text-emerald-600 mb-1">Answer:</div>
                  <div className="text-sm">{content.workedExample.answer}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications */}
        {content.applications && content.applications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Real-World Applications
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {content.applications.map((app, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-sm"
                >
                  {app}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Problems */}
        {content.practiceProblems && content.practiceProblems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Practice Problems
            </h3>
            <div className="space-y-4">
              {content.practiceProblems.map((problem, index) => (
                <Card key={index} className="border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">{problem.question}</p>
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">Hint:</span> {problem.hint}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-border">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Lesson
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
            Mark as Complete
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
