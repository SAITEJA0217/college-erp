-- 1. Add description and unit columns
ALTER TABLE notes 
ADD COLUMN description TEXT,
ADD COLUMN unit VARCHAR(50);

-- 2. Update resource_type constraint to include 'image'
ALTER TABLE notes 
DROP CONSTRAINT notes_resource_type_check;

ALTER TABLE notes 
ADD CONSTRAINT notes_resource_type_check 
CHECK (resource_type IN ('pdf', 'ppt', 'docx', 'zip', 'image', 'link', 'youtube'));

-- 3. Create Storage Bucket for study_materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('study_materials', 'study_materials', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'study_materials');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'study_materials' AND auth.role() = 'authenticated');
