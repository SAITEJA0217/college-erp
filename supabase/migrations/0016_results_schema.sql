-- Migration 0016: Results & Grading Schema
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(profile_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    grade VARCHAR(5) NOT NULL, -- O, A+, A, B+, B, C, F
    grade_points INTEGER NOT NULL, -- 10, 9, 8, 7, 6, 5, 0
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Students can view their own published results" ON public.results
    FOR SELECT USING (
        student_id = auth.uid() AND is_published = true
    );

CREATE POLICY "Admin can manage all results" ON public.results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Faculty can view results" ON public.results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'faculty'
        )
    );

CREATE POLICY "HOD can view department results" ON public.results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.faculty f
            JOIN public.students s ON s.department_id = f.department_id
            WHERE f.profile_id = auth.uid() AND f.is_hod = true AND s.profile_id = student_id
        )
    );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
