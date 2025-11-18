import { useState, useMemo } from 'react';
import { Task, TaskCategory, categoryLabels } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { StatsCards } from '@/components/StatsCards';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Trash2, ListTodo } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Index = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('homework-tracker-tasks', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'completed' && (task.completed || task.progress === 100)) ||
        (statusFilter === 'incomplete' && !task.completed && task.progress < 100);
      return categoryMatch && statusMatch;
    });
  }, [tasks, categoryFilter, statusFilter]);

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { ...taskData, id: editingTask.id, createdAt: editingTask.createdAt }
          : t
      ));
      toast.success('Task updated successfully!');
      setEditingTask(null);
    } else {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully!');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted successfully!');
  };

  const handleProgressChange = (id: string, progress: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const completed = progress === 100;
        if (completed && !t.completed) {
          toast.success('Task completed! 🎉');
        }
        return { ...t, progress, completed };
      }
      return t;
    }));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        if (newCompleted) {
          toast.success('Task marked as complete! 🎉');
          return { ...t, completed: true, progress: 100 };
        } else {
          return { ...t, completed: false };
        }
      }
      return t;
    }));
  };

  const handleClearAll = () => {
    setTasks([]);
    toast.success('All tasks cleared!');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Homework & Revision Tracker
          </h1>
          <p className="text-muted-foreground">Track your progress and stay organized</p>
        </header>

        {/* Stats */}
        <div className="mb-8">
          <StatsCards tasks={tasks} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TaskCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'completed' | 'incomplete')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {tasks.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-initial">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all tasks. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>Delete All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button onClick={() => setDialogOpen(true)} className="flex-1 sm:flex-initial">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <ListTodo className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-6">
              {tasks.length === 0 
                ? "Get started by adding your first task!"
                : "Try adjusting your filters or add a new task."}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onProgressChange={handleProgressChange}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <AddTaskDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSave={handleSaveTask}
          editTask={editingTask}
        />
      </div>
    </div>
  );
};

export default Index;
