-- Add validation column to drafts table
ALTER TABLE public.drafts 
ADD COLUMN IF NOT EXISTS validation JSONB;
