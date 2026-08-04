-- 1. Create Storage Buckets for assignments and submissions
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('assignments', 'assignments', true),
  ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the assignments bucket
CREATE POLICY "Public Access Assignments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'assignments');

-- Allow authenticated users to upload to assignments
CREATE POLICY "Auth Upload Assignments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload to submissions
CREATE POLICY "Auth Upload Submissions" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');

-- Allow authenticated users to read submissions (we handle strict RLS at app-level or via storage policies)
-- For simplicity, since the app relies on Service Role or signed URLs for secure downloads, we can allow authenticated read
CREATE POLICY "Auth Read Submissions" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');
