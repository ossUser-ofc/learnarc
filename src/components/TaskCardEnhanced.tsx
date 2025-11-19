import { Task, categoryLabels, categoryColors, Tag, Subtask } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, CheckCircle2, Sparkles, Clock as ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagManager } from './TagManager';
import { TaskTimer } from './TaskTimer';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { SubtaskManager } from './SubtaskManager';
import { PriorityBadge } from './PrioritySelector';
import { useState } from 'react';

interface TaskCardEnhancedProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onProgressChange: (id: string, progress: number) => void;
  onToggleComplete: (id: string) => void;
  onTagsChange: (taskId: string, tags: Tag[]) => void;
  onSubtasksChange: (taskId: string, subtasks: Subtask[]) => void;
}

export function TaskCardEnhanced({ 
  task, 
  onEdit, 
  onDelete, 
  onProgressChange, 
  onToggleComplete,
  onTagsChange,
  onSubtasksChange
}: TaskCardEnhancedProps) {
  const categoryColor = categoryColors[task.category];
  const isCompleted = task.completed || task.progress === 100;
  const [showTimer, setShowTimer] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg",
      isCompleted && "opacity-75"
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <h3 className={cn(
                "font-semibold text-lg transition-all",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className={cn("h-8 w-8", showAIAnalysis && "bg-primary/10")}
              title="AI Analysis"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTimer(!showTimer)}
              className={cn("h-8 w-8", showTimer && "bg-primary/10")}
              title="Study Timer"
            >
              <ClockIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category & Priority */}
        <div className="flex gap-2">
          <Badge className={categoryColor}>
            {categoryLabels[task.category]}
          </Badge>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Tags */}
        <TagManager
          taskId={task.id}
          selectedTags={task.tags || []}
          onTagsChange={(tags) => onTagsChange(task.id, tags)}
        />

        {/* Subtasks */}
        <SubtaskManager
          taskId={task.id}
          subtasks={task.subtasks || []}
          onSubtasksChange={(subtasks) => onSubtasksChange(task.id, subtasks)}
        />

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-bold text-foreground flex items-center gap-1">
              {task.progress}%
              {isCompleted && <CheckCircle2 className="h-4 w-4 text-success" />}
            </span>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[task.progress]}
              onValueChange={(value) => onProgressChange(task.id, value[0])}
              max={100}
              step={5}
              disabled={task.completed}
              className={cn(
                "cursor-pointer",
                task.completed && "opacity-50 cursor-not-allowed"
              )}
            />
            
            {!task.completed && (
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => onProgressChange(task.id, value)}
                    className={cn(
                      "text-xs",
                      task.progress === value && "bg-primary text-primary-foreground"
                    )}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Due Date & Time Spent */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {task.dueDate && (
            <div>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.totalTimeSpent && task.totalTimeSpent > 0 && (
            <div>
              Time: {Math.floor(task.totalTimeSpent / 3600)}h {Math.floor((task.totalTimeSpent % 3600) / 60)}m
            </div>
          )}
        </div>

        {showTimer && (
          <div className="pt-2 border-t animate-fade-in">
            <TaskTimer 
              taskId={task.id} 
              taskTitle={task.title} 
              totalTimeSpent={task.totalTimeSpent}
            />
          </div>
        )}

        {showAIAnalysis && (
          <div className="pt-2 border-t animate-fade-in">
            <AIAnalysisPanel task={task} />
          </div>
        )}
      </div>
    </Card>
  );
}
