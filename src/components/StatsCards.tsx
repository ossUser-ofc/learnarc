import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, TrendingUp, ListTodo } from 'lucide-react';

interface StatsCardsProps {
  tasks: Task[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed || t.progress === 100).length;
  const inProgressTasks = tasks.filter(t => !t.completed && t.progress > 0 && t.progress < 100).length;
  const averageProgress = totalTasks > 0
    ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks)
    : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Avg. Progress',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'text-projects',
      bgColor: 'bg-projects/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
