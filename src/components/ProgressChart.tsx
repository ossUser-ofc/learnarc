import { Task, categoryLabels } from '@/types/task';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface ProgressChartProps {
  tasks: Task[];
}

export function ProgressChart({ tasks }: ProgressChartProps) {
  // Category-based progress data
  const categoryData = Object.entries(categoryLabels).map(([key, label]) => {
    const categoryTasks = tasks.filter(t => t.category === key);
    const avgProgress = categoryTasks.length > 0
      ? Math.round(categoryTasks.reduce((sum, t) => sum + t.progress, 0) / categoryTasks.length)
      : 0;
    return {
      category: label,
      progress: avgProgress,
      count: categoryTasks.length,
    };
  });

  // Completion status data
  const completionData = [
    {
      name: 'Completed',
      value: tasks.filter(t => t.completed || t.progress === 100).length,
      color: 'hsl(var(--success))',
    },
    {
      name: 'In Progress',
      value: tasks.filter(t => !t.completed && t.progress > 0 && t.progress < 100).length,
      color: 'hsl(var(--primary))',
    },
    {
      name: 'Not Started',
      value: tasks.filter(t => t.progress === 0).length,
      color: 'hsl(var(--muted))',
    },
  ].filter(d => d.value > 0);

  // Progress trend over time (simplified - by creation date)
  const trendData = tasks
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10)
    .map(task => ({
      name: task.title.substring(0, 15) + '...',
      progress: task.progress,
    }));

  if (tasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Add tasks to see progress charts
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Progress Bar Chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Progress by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="category" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Status Pie Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Progress Trend Line Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Tasks Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
