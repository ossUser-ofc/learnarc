-- Add school information fields to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS current_school text,
ADD COLUMN IF NOT EXISTS target_university text,
ADD COLUMN IF NOT EXISTS education_level text DEFAULT 'high_school';