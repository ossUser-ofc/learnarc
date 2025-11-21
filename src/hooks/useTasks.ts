import { useState, useEffect } from 'react';
import { Task, Subtask, Tag } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      if (tasksData && tasksData.length > 0) {
        const taskIds = tasksData.map(t => t.id);

        // Load related data
        const [taskTagsRes, timeSessionsRes, subtasksRes] = await Promise.all([
          supabase
            .from('task_tags')
            .select(`task_id, tags (id, name, color, created_at)`)
            .in('task_id', taskIds),
          supabase
            .from('task_time_sessions')
            .select('task_id, duration_seconds')
            .in('task_id', taskIds)
            .not('end_time', 'is', null),
          supabase
            .from('subtasks')
            .select('*')
            .in('task_id', taskIds)
            .order('order_index')
        ]);

        // Calculate time per task
        const timeByTask: Record<string, number> = {};
        timeSessionsRes.data?.forEach(session => {
          if (session.duration_seconds) {
            timeByTask[session.task_id] = (timeByTask[session.task_id] || 0) + session.duration_seconds;
          }
        });

        // Group tags by task
        const tagsByTask: Record<string, Tag[]> = {};
        taskTagsRes.data?.forEach(tt => {
          if (tt.tags && Array.isArray(tt.tags)) {
            const tag = tt.tags as unknown as { id: string; name: string; color: string; created_at: string };
            if (!tagsByTask[tt.task_id]) tagsByTask[tt.task_id] = [];
            tagsByTask[tt.task_id].push({
              id: tag.id,
              name: tag.name,
              color: tag.color,
              createdAt: tag.created_at
            });
          }
        });

        // Group subtasks by task
        const subtasksByTask: Record<string, Subtask[]> = {};
        subtasksRes.data?.forEach(st => {
          if (!subtasksByTask[st.task_id]) subtasksByTask[st.task_id] = [];
          subtasksByTask[st.task_id].push({
            id: st.id,
            taskId: st.task_id,
            title: st.title,
            completed: st.completed,
            orderIndex: st.order_index,
            createdAt: st.created_at
          });
        });

        // Combine all data
        const enrichedTasks: Task[] = tasksData.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          category: t.category as any,
          priority: t.priority as any,
          progress: t.progress,
          completed: t.completed,
          createdAt: t.created_at,
          dueDate: t.due_date || undefined,
          estimatedTime: t.estimated_time || undefined,
          notes: t.notes || undefined,
          recurringType: t.recurring_type as any,
          recurringEndDate: t.recurring_end_date || undefined,
          tags: tagsByTask[t.id] || [],
          totalTimeSpent: timeByTask[t.id] || 0,
          subtasks: subtasksByTask[t.id] || [],
        }));

        setTasks(enrichedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'totalTimeSpent' | 'tags' | 'subtasks'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        progress: task.progress,
        completed: task.completed,
        due_date: task.dueDate,
        estimated_time: task.estimatedTime,
        notes: task.notes,
        recurring_type: task.recurringType || 'none',
        recurring_end_date: task.recurringEndDate,
      });

      if (error) throw error;
      toast.success('Task created successfully');
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          priority: updates.priority,
          progress: updates.progress,
          completed: updates.completed,
          due_date: updates.dueDate,
          estimated_time: updates.estimatedTime,
          notes: updates.notes,
          recurring_type: updates.recurringType,
          recurring_end_date: updates.recurringEndDate,
        })
        .eq('id', taskId);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task deleted');
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: loadTasks,
  };
}
