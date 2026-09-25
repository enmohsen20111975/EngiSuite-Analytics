'use client';

import { useGeometryStore } from '@/store/geometry-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sliders as SlidersIcon, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ParameterPanel() {
  const { getCurrentVisualization, parameters, setParameter } = useGeometryStore();
  const visualization = getCurrentVisualization();

  if (!visualization) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <SlidersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a visualization to see parameters</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Visualization Info */}
        <Card className="border-border/50 bg-gradient-to-br from-background to-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {visualization.title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{visualization.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {visualization.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-[10px]">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Parameters
          </h3>
          
          {visualization.parameters.map((param) => {
            const value = parameters[param.key] ?? param.default;
            
            return (
              <div key={param.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={param.key} className="text-sm">
                    {param.label}
                  </Label>
                  <span className="text-sm font-mono text-muted-foreground">
                    {value.toFixed(param.step < 1 ? 2 : 0)}
                    {param.unit && <span className="ml-0.5">{param.unit}</span>}
                  </span>
                </div>
                <Slider
                  id={param.key}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={[value]}
                  onValueChange={([v]) => setParameter(param.key, v)}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-3">
            <h4 className="text-xs font-medium mb-1.5">Quick Tips</h4>
            <ul className="text-[10px] text-muted-foreground space-y-1">
              <li>• Drag to rotate the view</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Right-click drag to pan</li>
              <li>• Double-click to reset view</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
