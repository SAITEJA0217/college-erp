-- Add current_cgpa to students
ALTER TABLE public.students ADD COLUMN current_cgpa DECIMAL(4,2) DEFAULT 0.00;

-- Enhance placements table
ALTER TABLE public.placements 
  ADD COLUMN placement_type VARCHAR(50) DEFAULT 'full-time' CHECK (placement_type IN ('internship', 'full-time')),
  ADD COLUMN eligibility_cgpa DECIMAL(4,2) DEFAULT 0.00,
  ADD COLUMN locations TEXT;

-- Enhance placement_applications table
ALTER TABLE public.placement_applications
  ADD COLUMN resume_url TEXT;

-- Create Resumes Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;

-- RLS for Resumes (Private)
-- Students can insert their own resumes, placement officers can read all resumes.
CREATE POLICY "Students can upload resumes" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Placement can read all resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'placement'
  ));
