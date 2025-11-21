import { useState } from 'react';
import { Subtask } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubtaskManagerProps {
  taskId: string;
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
}

export function SubtaskManager({ taskId, subtasks = [], onSubtasksChange }: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to add subtasks');
        setIsAdding(false);
        return;
      }

      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          user_id: user.id,
          title: newSubtaskTitle.trim(),
          order_index: subtasks.length,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newSubtask: Subtask = {
        id: data.id,
        taskId: data.task_id,
        title: data.title,
        completed: data.completed,
        orderIndex: data.order_index,
        createdAt: data.created_at,
      };

      onSubtasksChange([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
      toast.success('Subtask added!');
    } catch (error) {
      console.error('Error adding subtask:', error);
      toast.error('Failed to add subtask');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId);

      if (error) throw error;

      onSubtasksChange(
        subtasks.map(st => st.id === subtaskId ? { ...st, completed } : st)
      );
    } catch (error) {
      console.error('Error updating subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      onSubtasksChange(subtasks.filter(st => st.id !== subtaskId));
      toast.success('Subtask deleted');
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast.error('Failed to delete subtask');
    }
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Subtasks {totalCount > 0 && `(${completedCount}/${totalCount})`}
        </h4>
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) => handleToggleSubtask(subtask.id, !!checked)}
            />
            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDeleteSubtask(subtask.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleAddSubtask}
          disabled={isAdding || !newSubtaskTitle.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
