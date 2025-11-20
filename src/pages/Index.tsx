import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskCategory, categoryLabels, Tag, Subtask } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskCardEnhanced } from '@/components/TaskCardEnhanced';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { StatsCards } from '@/components/StatsCards';
import { ProgressChart } from '@/components/ProgressChart';
import { NotebookView } from '@/components/NotebookView';
import { CalendarView } from '@/components/CalendarView';
import { TimelineView } from '@/components/TimelineView';
import { KanbanView } from '@/components/KanbanView';
import { WeeklySummary } from '@/components/WeeklySummary';
import { DataExport } from '@/components/DataExport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Trash2, ListTodo, BarChart3, BookOpen, Calendar, Activity, LayoutGrid } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useLocalStorage<Task[]>('homework-tracker-tasks', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load tags and time sessions for tasks
  useEffect(() => {
    loadTaskEnhancements();
  }, [tasks.length]);

  const loadTaskEnhancements = async () => {
    if (tasks.length === 0) return;

    const taskIds = tasks.map(t => t.id);

    // Load tags, time sessions, and subtasks
    const { data: taskTagsData } = await supabase
      .from('task_tags')
      .select(`task_id, tags (id, name, color, created_at)`)
      .in('task_id', taskIds);

    const { data: timeSessionsData } = await supabase
      .from('task_time_sessions')
      .select('task_id, duration_seconds')
      .in('task_id', taskIds)
      .not('end_time', 'is', null);

    const { data: subtasksData } = await supabase
      .from('subtasks')
      .select('*')
      .in('task_id', taskIds)
      .order('order_index');

    // Calculate total time per task
    const timeByTask: Record<string, number> = {};
    timeSessionsData?.forEach(session => {
      if (session.duration_seconds) {
        timeByTask[session.task_id] = (timeByTask[session.task_id] || 0) + session.duration_seconds;
      }
    });

    // Group tags by task
    const tagsByTask: Record<string, Tag[]> = {};
    taskTagsData?.forEach((item: any) => {
      if (item.tags) {
        if (!tagsByTask[item.task_id]) {
          tagsByTask[item.task_id] = [];
        }
        tagsByTask[item.task_id].push({
          id: item.tags.id,
          name: item.tags.name,
          color: item.tags.color,
          createdAt: item.tags.created_at,
        });
      }
    });

    // Group subtasks by task
    const subtasksByTask: Record<string, Subtask[]> = {};
    subtasksData?.forEach((st: any) => {
      if (!subtasksByTask[st.task_id]) subtasksByTask[st.task_id] = [];
      subtasksByTask[st.task_id].push({
        id: st.id,
        taskId: st.task_id,
        title: st.title,
        completed: st.completed,
        orderIndex: st.order_index,
        createdAt: st.created_at,
      });
    });

    setTasks(tasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || [],
      totalTimeSpent: timeByTask[task.id] || 0,
      subtasks: subtasksByTask[task.id] || [],
    })));
  };

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

  const handleProgressChange = async (id: string, progress: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const completed = progress === 100;
        if (completed && !t.completed) {
          // Record completion history
          const task = tasks.find(task => task.id === id);
          if (task) {
            supabase.from('task_completion_history').insert({
              task_id: id,
              task_title: task.title,
              estimated_time: task.estimatedTime || null,
              actual_time: task.totalTimeSpent || 0,
            }).then(({ error }) => {
              if (error) console.error('Error recording completion:', error);
            });
          }
          toast.success('Task completed! 🎉');
        }
        return { ...t, progress, completed };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // If completing the task, record completion history
    if (newCompleted && !task.completed) {
      try {
        await supabase.from('task_completion_history').insert({
          task_id: id,
          task_title: task.title,
          estimated_time: task.estimatedTime || null,
          actual_time: task.totalTimeSpent || 0,
        });
      } catch (error) {
        console.error('Error recording completion history:', error);
      }
      toast.success('Task marked as complete! 🎉');
    }

    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (newCompleted) {
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

  const handleTagsChange = (taskId: string, tags: Tag[]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, tags } : t));
  };

  const handleSubtasksChange = (taskId: string, subtasks: Subtask[]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks } : t));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Homework & Revision Tracker
            </h1>
            <p className="text-muted-foreground">Track your progress and stay organized</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/auth');
              }}
            >
              Sign Out
            </Button>
          </div>
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

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tasks"><ListTodo className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="timeline"><Activity className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="notebook"><BookOpen className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
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
                  <TaskCardEnhanced
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onProgressChange={handleProgressChange}
                    onToggleComplete={handleToggleComplete}
                    onTagsChange={handleTagsChange}
                    onSubtasksChange={handleSubtasksChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanView tasks={tasks} onTaskClick={handleEditTask} onProgressChange={handleProgressChange} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView tasks={tasks} onTaskClick={handleEditTask} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView tasks={tasks} onTaskClick={handleEditTask} />
          </TabsContent>

          <TabsContent value="notebook">
            <NotebookView />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <WeeklySummary tasks={tasks} />
            <ProgressChart tasks={tasks} />
            <DataExport tasks={tasks} onImport={(importedTasks) => setTasks(importedTasks)} />
          </TabsContent>
        </Tabs>

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
