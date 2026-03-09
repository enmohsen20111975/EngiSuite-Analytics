'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ParameterPanel } from '@/components/layout/ParameterPanel';
import { VisualizationRegistry } from '@/components/visualizations/VisualizationRegistry';
import { LandingPage } from '@/components/landing/LandingPage';
import { CourseViewer } from '@/components/courses/CourseViewer';
import { useCourseStore, allCategories } from '@/store/course-store';
import { useGeometryStore, modules } from '@/store/geometry-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  ChevronRight,
  Target,
  Settings,
  Sparkles,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'landing' | 'courses' | 'lab';

export default function KineticGeometryLab() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const { 
    currentModuleId, 
    currentChapterId, 
    currentVisualizationId,
    setModule,
    setChapter,
    setVisualization
  } = useGeometryStore();
  
  const {
    setCategory,
    setCourse,
    setLesson,
    setContent
  } = useCourseStore();
  
  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setRightPanelOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Set initial module if none selected
  useEffect(() => {
    if (!currentModuleId && modules.length > 0) {
      setModule(modules[0].id);
      if (modules[0].chapters.length > 0) {
        setChapter(modules[0].chapters[0].id);
        if (modules[0].chapters[0].visualizations.length > 0) {
          setVisualization(modules[0].chapters[0].visualizations[0].id);
        }
      }
    }
  }, [currentModuleId, setModule, setChapter, setVisualization]);
  
  const currentModule = modules.find(m => m.id === currentModuleId);
  const currentChapter = currentModule?.chapters.find(c => c.id === currentChapterId);
  const currentVisualization = currentChapter?.visualizations.find(v => v.id === currentVisualizationId);

  // Handle navigation to specific course
  const handleNavigateToCourse = (categoryId: string, courseName?: string) => {
    // Find the category
    const category = allCategories.find(c => c.id === categoryId);
    if (category) {
      setCategory(category.id);
      
      // If courseName provided, try to find matching course
      if (courseName) {
        const course = category.courses.find(c => 
          c.title.toLowerCase().includes(courseName.toLowerCase()) ||
          c.id.toLowerCase().includes(courseName.toLowerCase().replace(/\s+/g, '-'))
        );
        if (course) {
          setCourse(course.id);
          setLesson(null);
          setContent(null);
        } else {
          setCourse(null);
        }
      } else {
        setCourse(null);
      }
      setLesson(null);
      setContent(null);
    }
    setViewMode('courses');
  };

  // Show landing page
  if (viewMode === 'landing') {
    return (
      <LandingPage 
        onEnterLab={() => setViewMode('lab')} 
        onBrowseCourses={() => setViewMode('courses')}
        onNavigateToCourse={handleNavigateToCourse}
      />
    );
  }

  // Show course viewer
  if (viewMode === 'courses') {
    return <CourseViewer onBack={() => setViewMode('landing')} />;
  }

  // Show Lab interface
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top header bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('landing')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
          
          <div className="hidden md:flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">KineticGeometry Lab</h1>
              <p className="text-xs text-muted-foreground">Interactive Learning Platform</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb navigation */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {currentModule && (
            <>
              <Badge variant="outline" className="bg-primary/5">
                {currentModule.title}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          {currentChapter && (
            <>
              <Badge variant="outline" className="bg-secondary/50">
                {currentChapter.title}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          {currentVisualization && (
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
              {currentVisualization.title}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('courses')}
            className="gap-2 hidden md:flex"
          >
            <GraduationCap className="w-4 h-4" />
            Courses
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Navigation */}
        <aside
          className={cn(
            "border-r border-border bg-card/30 transition-all duration-300 flex-shrink-0",
            sidebarOpen ? "w-72" : "w-0 md:w-0",
            isMobile && sidebarOpen && "absolute inset-y-0 left-0 z-40 w-72 mt-14"
          )}
        >
          {sidebarOpen && <Navigation />}
        </aside>
        
        {/* Center - Visualization */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Visualization area */}
          <div className="flex-1 p-2 md:p-4 overflow-hidden">
            <VisualizationRegistry />
          </div>
          
          {/* Bottom info bar */}
          {currentVisualization && (
            <div className="h-10 border-t border-border bg-card/30 flex items-center px-4 gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {currentVisualization.features.slice(0, 3).join(' • ')}
              </span>
              <span className="hidden md:inline">• Drag to rotate • Scroll to zoom • Double-click to reset</span>
            </div>
          )}
        </main>
        
        {/* Right panel - Parameters */}
        <aside
          className={cn(
            "border-l border-border bg-card/30 transition-all duration-300 flex-shrink-0",
            rightPanelOpen ? "w-72" : "w-0 md:w-0",
            isMobile && rightPanelOpen && "absolute inset-y-0 right-0 z-40 w-72 mt-14"
          )}
        >
          {rightPanelOpen && <ParameterPanel />}
        </aside>
      </div>
      
      {/* Mobile overlay */}
      {isMobile && (sidebarOpen || rightPanelOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => {
            setSidebarOpen(false);
            setRightPanelOpen(false);
          }}
        />
      )}
    </div>
  );
}
