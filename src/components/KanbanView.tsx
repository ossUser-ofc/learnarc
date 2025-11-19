import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from './PrioritySelector';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onProgressChange?: (taskId: string, progress: number) => void;
}

export function KanbanView({ tasks, onTaskClick, onProgressChange }: KanbanViewProps) {
  const columns: Array<{ id: string; title: string; range: [number, number] }> = [
    { id: 'todo', title: 'To Do', range: [0, 0] },
    { id: 'inProgress', title: 'In Progress', range: [1, 99] },
    { id: 'done', title: 'Done', range: [100, 100] },
  ];

  const getTasksForColumn = (range: [number, number]) => {
    return tasks.filter(task => {
      const progress = task.progress;
      return progress >= range[0] && progress <= range[1];
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    let newProgress = 0;
    if (columnId === 'inProgress') newProgress = 50;
    if (columnId === 'done') newProgress = 100;

    onProgressChange?.(taskId, newProgress);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kanban Board</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.range);
          
          return (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>

              <div
                className="min-h-[500px] space-y-3 p-4 rounded-lg bg-muted/30 border-2 border-dashed"
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
              >
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks in this column
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={cn(
                        "p-4 cursor-move hover:shadow-lg transition-all",
                        task.completed && "opacity-75"
                      )}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h4 className={cn(
                            "font-medium",
                            task.completed && "line-through"
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={task.priority} />
                          <div className="text-xs text-muted-foreground">
                            {task.progress}%
                          </div>
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        {task.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Est. {task.estimatedTime}h
                          </div>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
