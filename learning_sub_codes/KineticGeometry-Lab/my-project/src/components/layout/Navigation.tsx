'use client';

import { useGeometryStore, modules } from '@/store/geometry-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Timer,
  Zap,
  Grid3X3,
  TrendingUp,
  ArrowLeft,
  BookOpen,
  Layers,
  Target,
  Gauge,
  Sparkles,
  Atom
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'intermediate-advanced': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  expert: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const moduleIcons = [Grid3X3, TrendingUp, Layers, Atom, Sparkles];

export function Navigation() {
  const {
    currentModuleId,
    currentChapterId,
    currentVisualizationId,
    setModule,
    setChapter,
    setVisualization,
    animationState,
    togglePlay,
    resetTime,
    setSpeed,
    showTrails,
    showVectors,
    showGrid,
    toggleTrails,
    toggleVectors,
    toggleGrid,
  } = useGeometryStore();

  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0].id]);

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">KineticGeometry</h1>
            <p className="text-xs text-muted-foreground">Interactive Learning Lab</p>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {modules.map((module, index) => {
            const Icon = moduleIcons[index % moduleIcons.length];
            const isActive = currentModuleId === module.id;
            const isExpanded = expandedModules.includes(module.id);

            return (
              <Collapsible
                key={module.id}
                open={isExpanded}
                onOpenChange={() => toggleModuleExpand(module.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-2 h-auto py-2 px-3',
                      isActive && 'bg-primary/5'
                    )}
                    onClick={() => setModule(module.id)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm truncate">{module.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn('text-[10px] px-1 py-0 h-4', difficultyColors[module.difficulty])}>
                          {module.difficulty}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{module.duration}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pr-1">
                  {module.chapters.map((chapter) => (
                    <div key={chapter.id} className="mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-xs h-auto py-1.5',
                          currentChapterId === chapter.id && 'bg-primary/10 text-primary'
                        )}
                        onClick={() => setChapter(chapter.id)}
                      >
                        <BookOpen className="w-3 h-3 mr-2 shrink-0" />
                        {chapter.title}
                      </Button>
                      {currentChapterId === chapter.id && (
                        <div className="ml-4 space-y-0.5 mt-1">
                          {chapter.visualizations.map((vis) => (
                            <Button
                              key={vis.id}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'w-full justify-start text-xs py-1 h-auto',
                                currentVisualizationId === vis.id
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                              onClick={() => setVisualization(vis.id)}
                            >
                              <Gauge className="w-3 h-3 mr-2 shrink-0" />
                              {vis.title}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Animation Controls */}
      <div className="p-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Animation Controls</span>
          <span className="text-xs text-muted-foreground">
            t = {animationState.time.toFixed(2)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlay}
          >
            {animationState.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={resetTime}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationState.speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-8">{animationState.speed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Display toggles */}
        <div className="flex gap-1">
          <Button
            variant={showTrails ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={toggleTrails}
          >
            <Timer className="w-3 h-3 mr-1" />
            Trails
          </Button>
          <Button
            variant={showVectors ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={toggleVectors}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Vectors
          </Button>
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={toggleGrid}
          >
            <Grid3X3 className="w-3 h-3 mr-1" />
            Grid
          </Button>
        </div>
      </div>
    </div>
  );
}
