-- Add priority and attachments to tasks (stored in localStorage, so this is for future cloud sync)
-- Create notes table for notebook feature
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  task_id UUID,
  folder TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  depends_on_task_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Create weekly_summaries table for AI-generated summaries
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary TEXT NOT NULL,
  insights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start, week_end)
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for notes
CREATE POLICY "Anyone can create notes" ON public.notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Anyone can update notes" ON public.notes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notes" ON public.notes FOR DELETE USING (true);

-- Create policies for subtasks
CREATE POLICY "Anyone can create subtasks" ON public.subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view subtasks" ON public.subtasks FOR SELECT USING (true);
CREATE POLICY "Anyone can update subtasks" ON public.subtasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete subtasks" ON public.subtasks FOR DELETE USING (true);

-- Create policies for task_dependencies
CREATE POLICY "Anyone can create dependencies" ON public.task_dependencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view dependencies" ON public.task_dependencies FOR SELECT USING (true);
CREATE POLICY "Anyone can delete dependencies" ON public.task_dependencies FOR DELETE USING (true);

-- Create policies for weekly_summaries
CREATE POLICY "Anyone can create summaries" ON public.weekly_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view summaries" ON public.weekly_summaries FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_task_id ON public.notes(task_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON public.notes(folder);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_dates ON public.weekly_summaries(week_start, week_end);

-- Add updated_at trigger for notes
CREATE OR REPLACE FUNCTION public.update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_notes_updated_at();