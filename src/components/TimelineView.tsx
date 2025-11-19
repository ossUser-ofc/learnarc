import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from './PrioritySelector';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
  const sortedTasks = [...tasks]
    .filter(task => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const groupByDate = () => {
    const groups: Record<string, Task[]> = {};
    sortedTasks.forEach(task => {
      const date = new Date(task.dueDate!).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    });
    return groups;
  };

  const groupedTasks = groupByDate();
  const dates = Object.keys(groupedTasks);

  const isPast = (dateStr: string) => {
    const date = new Date(groupedTasks[dateStr][0].dueDate!);
    return date < new Date();
  };

  const isToday = (dateStr: string) => {
    const date = new Date(groupedTasks[dateStr][0].dueDate!);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Timeline</h2>

      {dates.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No scheduled tasks</h3>
          <p className="text-muted-foreground">
            Add due dates to your tasks to see them in the timeline
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {dates.map((date, idx) => {
              const past = isPast(date);
              const today = isToday(date);
              const tasksForDate = groupedTasks[date];

              return (
                <div key={date} className="relative pl-20">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-[30px] top-2 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10",
                    today ? "bg-primary border-primary" : "bg-background border-border"
                  )} />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-semibold",
                        today && "text-primary",
                        past && !today && "text-muted-foreground"
                      )}>
                        {date}
                      </h3>
                      {today && <Badge>Today</Badge>}
                      {past && !today && <Badge variant="secondary">Past</Badge>}
                    </div>

                    <div className="space-y-2">
                      {tasksForDate.map((task) => (
                        <Card
                          key={task.id}
                          className={cn(
                            "p-4 cursor-pointer hover:shadow-md transition-all",
                            past && !task.completed && "border-destructive/50"
                          )}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "font-medium",
                                task.completed && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </h4>
                              <PriorityBadge priority={task.priority} />
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.progress}% complete
                              </div>
                              {task.estimatedTime && (
                                <div>Est. {task.estimatedTime}h</div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
