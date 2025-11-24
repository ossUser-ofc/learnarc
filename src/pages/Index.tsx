import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskCategory, categoryLabels, Tag, Subtask } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { TaskCardEnhanced } from '@/components/TaskCardEnhanced';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { StatsCards } from '@/components/StatsCards';
import { ProgressChart } from '@/components/ProgressChart';
import { NotebookView } from '@/components/NotebookView';
import { CalendarView } from '@/components/CalendarView';
import { TimelineView } from '@/components/TimelineView';
import { KanbanView } from '@/components/KanbanView';
import { WeeklySummary } from '@/components/WeeklySummary';
import { TopicAnalysisPanel } from '@/components/TopicAnalysisPanel';
import { DataExport } from '@/components/DataExport';
import { AIChat } from '@/components/AIChat';
import { QuizGenerator } from '@/components/QuizGenerator';
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
import { Plus, Filter, Trash2, ListTodo, BarChart3, BookOpen, Calendar, Activity, LayoutGrid, Settings as SettingsIcon, Github } from 'lucide-react';
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
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [userName, setUserName] = useState<string>('');

  // Check authentication and load user settings
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      // Load user settings for display name
      const { data: settings } = await supabase
        .from('user_settings')
        .select('display_name')
        .eq('user_id', session.user.id)
        .single();
      
      if (settings?.display_name) {
        setUserName(settings.display_name);
      } else {
        // Fallback to email username
        const emailName = session.user.email?.split('@')[0] || 'User';
        setUserName(emailName);
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'completed' && (task.completed || task.progress === 100)) ||
        (statusFilter === 'incomplete' && !task.completed && task.progress < 100);
      return categoryMatch && statusMatch;
    });
  }, [tasks, categoryFilter, statusFilter]);

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully!');
      setEditingTask(null);
    } else {
      await addTask(taskData);
      toast.success('Task added successfully!');
    }
    setDialogOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleProgressChange = async (id: string, progress: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completed = progress === 100;
    if (completed && !task.completed) {
      // Record completion history
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('task_completion_history').insert({
            task_id: id,
            task_title: task.title,
            estimated_time: task.estimatedTime || null,
            actual_time: task.totalTimeSpent || 0,
            user_id: user.id,
          });
        }
      } catch (error) {
        console.error('Error recording completion:', error);
      }
      toast.success('Task completed! 🎉');
    }
    await updateTask(id, { progress, completed });
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // If completing the task, record completion history
    if (newCompleted && !task.completed) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('task_completion_history').insert({
            task_id: id,
            task_title: task.title,
            estimated_time: task.estimatedTime || null,
            actual_time: task.totalTimeSpent || 0,
            user_id: user.id,
          });
        }
      } catch (error) {
        console.error('Error recording completion history:', error);
      }
      toast.success('Task marked as complete! 🎉');
    }

    await updateTask(id, {
      completed: newCompleted,
      progress: newCompleted ? 100 : task.progress
    });
  };

  const handleClearAll = async () => {
    for (const task of tasks) {
      await deleteTask(task.id);
    }
    toast.success('All tasks cleared!');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleTagsChange = (taskId: string, tags: Tag[]) => {
    // Tags are managed through TagManager component which updates the database directly
    // The task list will be updated via realtime subscription
  };

  const handleSubtasksChange = (taskId: string, subtasks: Subtask[]) => {
    // Subtasks are managed through SubtaskManager component which updates the database directly
    // The task list will be updated via realtime subscription
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              learnarc
            </h1>
            <p className="text-muted-foreground">
              {userName && `Hi ${userName}! `}Track your progress and stay organized
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open('https://github.com/ossUser-Swift/study-progress-hub', '_blank')}
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
                toast.success('Signed out successfully');
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
            <div className="grid gap-6 lg:grid-cols-2">
              <WeeklySummary tasks={tasks} />
              <TopicAnalysisPanel />
            </div>
            <QuizGenerator />
            <AIChat />
            <ProgressChart tasks={tasks} />
            <DataExport tasks={tasks} onImport={async (importedTasks) => {
              // Import tasks to database
              for (const task of importedTasks) {
                await addTask(task);
              }
              toast.success('Tasks imported successfully');
            }} />
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
      )}
    </div>
  );
};

export default Index;
