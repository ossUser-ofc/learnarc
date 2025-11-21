import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  totalTimeSpent?: number;
}

export function TaskTimer({ taskId, taskTitle, totalTimeSpent = 0 }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to track time');
        return;
      }

      const { data, error } = await supabase
        .from('task_time_sessions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      setIsRunning(true);
      toast.success('Timer started!');
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('Timer paused');
  };

  const handleStop = async () => {
    if (!currentSessionId) return;

    try {
      const { error } = await supabase
        .from('task_time_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: elapsedSeconds,
        })
        .eq('id', currentSessionId);

      if (error) throw error;

      setIsRunning(false);
      setElapsedSeconds(0);
      setCurrentSessionId(null);
      toast.success(`Session completed: ${formatTime(elapsedSeconds)}`);
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Study Timer</span>
          </div>
          {totalTimeSpent > 0 && (
            <span className="text-xs text-muted-foreground">
              Total: {formatTime(totalTimeSpent)}
            </span>
          )}
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold font-mono tabular-nums">
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {!isRunning && !currentSessionId && (
            <Button onClick={handleStart} size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}
          
          {isRunning && (
            <Button onClick={handlePause} size="sm" variant="secondary" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          {currentSessionId && (
            <Button onClick={handleStop} size="sm" variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
