-- Add user_id columns to all tables
ALTER TABLE public.ai_analysis ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.subtasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.task_tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.task_time_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.task_completion_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.weekly_summaries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.task_dependencies ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_ai_analysis_user_id ON public.ai_analysis(user_id);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_subtasks_user_id ON public.subtasks(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_task_tags_user_id ON public.task_tags(user_id);
CREATE INDEX idx_task_time_sessions_user_id ON public.task_time_sessions(user_id);
CREATE INDEX idx_task_completion_history_user_id ON public.task_completion_history(user_id);
CREATE INDEX idx_weekly_summaries_user_id ON public.weekly_summaries(user_id);
CREATE INDEX idx_task_dependencies_user_id ON public.task_dependencies(user_id);

-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Anyone can create AI analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Anyone can view AI analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Anyone can create notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can view notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can update notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can delete notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can create subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can view subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can update subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can delete subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can create tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can create task tags" ON public.task_tags;
DROP POLICY IF EXISTS "Anyone can view task tags" ON public.task_tags;
DROP POLICY IF EXISTS "Anyone can delete task tags" ON public.task_tags;
DROP POLICY IF EXISTS "Anyone can create time sessions" ON public.task_time_sessions;
DROP POLICY IF EXISTS "Anyone can view time sessions" ON public.task_time_sessions;
DROP POLICY IF EXISTS "Anyone can update time sessions" ON public.task_time_sessions;
DROP POLICY IF EXISTS "Anyone can create completion history" ON public.task_completion_history;
DROP POLICY IF EXISTS "Anyone can view completion history" ON public.task_completion_history;
DROP POLICY IF EXISTS "Anyone can create summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Anyone can view summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Anyone can create dependencies" ON public.task_dependencies;
DROP POLICY IF EXISTS "Anyone can view dependencies" ON public.task_dependencies;
DROP POLICY IF EXISTS "Anyone can delete dependencies" ON public.task_dependencies;

-- Create user-scoped RLS policies for ai_analysis
CREATE POLICY "Users can view their own AI analysis"
ON public.ai_analysis FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI analysis"
ON public.ai_analysis FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create user-scoped RLS policies for notes
CREATE POLICY "Users can view their own notes"
ON public.notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for subtasks
CREATE POLICY "Users can view their own subtasks"
ON public.subtasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subtasks"
ON public.subtasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subtasks"
ON public.subtasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subtasks"
ON public.subtasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for tags
CREATE POLICY "Users can view their own tags"
ON public.tags FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
ON public.tags FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
ON public.tags FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for task_tags
CREATE POLICY "Users can view their own task tags"
ON public.task_tags FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task tags"
ON public.task_tags FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task tags"
ON public.task_tags FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for task_time_sessions
CREATE POLICY "Users can view their own time sessions"
ON public.task_time_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time sessions"
ON public.task_time_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time sessions"
ON public.task_time_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for task_completion_history
CREATE POLICY "Users can view their own completion history"
ON public.task_completion_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completion history"
ON public.task_completion_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create user-scoped RLS policies for weekly_summaries
CREATE POLICY "Users can view their own summaries"
ON public.weekly_summaries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries"
ON public.weekly_summaries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create user-scoped RLS policies for task_dependencies
CREATE POLICY "Users can view their own task dependencies"
ON public.task_dependencies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task dependencies"
ON public.task_dependencies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task dependencies"
ON public.task_dependencies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);