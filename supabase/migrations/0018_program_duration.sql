-- Preserve all existing academic records while extending the program model.
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS duration INTEGER;
UPDATE public.programs SET duration = 4 WHERE duration IS NULL;
ALTER TABLE public.programs ALTER COLUMN duration SET NOT NULL;
ALTER TABLE public.programs ADD CONSTRAINT programs_duration_positive CHECK (duration > 0);
