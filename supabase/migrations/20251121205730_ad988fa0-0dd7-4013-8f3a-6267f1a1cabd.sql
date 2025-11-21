-- Create tasks table in database to replace localStorage
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('homework', 'revision', 'projects', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_time INTEGER,
  notes TEXT,
  recurring_type TEXT CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
  recurring_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_completed ON public.tasks(completed);

-- Trigger to update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notes_updated_at();

-- Create user_settings table for advanced settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  email_notifications BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  default_view TEXT DEFAULT 'list' CHECK (default_view IN ('list', 'kanban', 'calendar', 'timeline')),
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Trigger to update updated_at for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notes_updated_at();