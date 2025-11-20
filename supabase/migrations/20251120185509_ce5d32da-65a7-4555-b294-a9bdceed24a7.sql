-- Create task completion history table to track statistics
CREATE TABLE IF NOT EXISTS public.task_completion_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  task_title TEXT NOT NULL,
  estimated_time INTEGER,
  actual_time INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_completion_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view completion history"
ON public.task_completion_history
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create completion history"
ON public.task_completion_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_task_completion_history_task_id ON public.task_completion_history(task_id);
CREATE INDEX idx_task_completion_history_task_title ON public.task_completion_history(task_title);
CREATE INDEX idx_task_completion_history_completed_at ON public.task_completion_history(completed_at);