-- Migration 0015: Internal Marks Schema
CREATE TABLE IF NOT EXISTS public.internal_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(profile_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    assessment_name VARCHAR(100) NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_published BOOLEAN NOT NULL DEFAULT false,
    faculty_id UUID NOT NULL REFERENCES public.faculty(profile_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, subject_id, assessment_name)
);

-- Enable RLS
ALTER TABLE public.internal_marks ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Students can read their own published internal marks" ON public.internal_marks
    FOR SELECT USING (
        student_id = auth.uid() AND is_published = true
    );

CREATE POLICY "Faculty can manage their own uploaded internal marks" ON public.internal_marks
    FOR ALL USING (
        faculty_id = auth.uid()
    );

CREATE POLICY "Admin can manage all internal marks" ON public.internal_marks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "HOD can view department internal marks" ON public.internal_marks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.faculty f
            JOIN public.students s ON s.department_id = f.department_id
            WHERE f.profile_id = auth.uid() AND f.is_hod = true AND s.profile_id = student_id
        )
    );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
