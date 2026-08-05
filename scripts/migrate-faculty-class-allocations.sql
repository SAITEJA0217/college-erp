-- Migration to create faculty_class_assignments table

CREATE TABLE IF NOT EXISTS public.faculty_class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    room_number TEXT,
    day_of_week TEXT,
    start_time TIME,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'Active',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_faculty ON public.faculty_class_assignments(faculty_profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_subject ON public.faculty_class_assignments(subject_id);

-- Enable RLS
ALTER TABLE public.faculty_class_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage faculty class assignments" ON public.faculty_class_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Faculty can read their own assignments
CREATE POLICY "Faculty can view own assignments" ON public.faculty_class_assignments
    FOR SELECT
    USING (
        faculty_profile_id = auth.uid()
    );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
