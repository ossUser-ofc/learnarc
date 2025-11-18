import { Task, categoryLabels, categoryColors } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onProgressChange: (id: string, progress: number) => void;
  onToggleComplete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onProgressChange, onToggleComplete }: TaskCardProps) {
  const categoryColor = categoryColors[task.category];
  const isCompleted = task.completed || task.progress === 100;

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

        {/* Category Badge */}
        <Badge className={categoryColor}>
          {categoryLabels[task.category]}
        </Badge>

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
            
            {/* Quick Progress Buttons */}
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

        {/* Due Date */}
        {task.dueDate && (
          <div className="text-xs text-muted-foreground">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}
