-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS public.task_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, tag_id)
);

-- Create ai_analysis table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  result JSONB NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_time_sessions table for timer tracking
CREATE TABLE IF NOT EXISTS public.task_time_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tags (public read, no auth needed)
CREATE POLICY "Anyone can view tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create tags"
ON public.tags
FOR INSERT
WITH CHECK (true);

-- Create RLS policies for task_tags (public access)
CREATE POLICY "Anyone can view task tags"
ON public.task_tags
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create task tags"
ON public.task_tags
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete task tags"
ON public.task_tags
FOR DELETE
USING (true);

-- Create RLS policies for ai_analysis (public access)
CREATE POLICY "Anyone can view AI analysis"
ON public.ai_analysis
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create AI analysis"
ON public.ai_analysis
FOR INSERT
WITH CHECK (true);

-- Create RLS policies for task_time_sessions (public access)
CREATE POLICY "Anyone can view time sessions"
ON public.task_time_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create time sessions"
ON public.task_time_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update time sessions"
ON public.task_time_sessions
FOR UPDATE
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_task_tags_task_id ON public.task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON public.task_tags(tag_id);
CREATE INDEX idx_ai_analysis_task_id ON public.ai_analysis(task_id);
CREATE INDEX idx_task_time_sessions_task_id ON public.task_time_sessions(task_id);