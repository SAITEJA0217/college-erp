-- MRUH ERP v1 enterprise modules. Existing academic, auth and notification tables are reused.
CREATE TYPE public.calendar_event_type AS ENUM ('semester','holiday','exam','assignment','quiz','placement','college_event');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','urgent');

CREATE TABLE public.academic_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL, department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL, description TEXT, event_type public.calendar_event_type NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ, source_table VARCHAR(64), source_id UUID,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role public.app_role, action VARCHAR(100) NOT NULL, module VARCHAR(100) NOT NULL, ip_address INET,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('students','faculty','departments','subjects','sections','programs')),
  file_name TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'validated', total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0, error_rows INTEGER NOT NULL DEFAULT 0, errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.help_desk_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_number VARCHAR(20) UNIQUE NOT NULL DEFAULT ('HD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('academic','technical','placement','accounts','general')),
  subject VARCHAR(255) NOT NULL, description TEXT NOT NULL, priority public.ticket_priority NOT NULL DEFAULT 'medium',
  status public.ticket_status NOT NULL DEFAULT 'open', attachment_url TEXT, closed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.help_desk_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES public.help_desk_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, body TEXT NOT NULL, attachment_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS audience VARCHAR(30) NOT NULL DEFAULT 'everyone';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX academic_calendar_events_starts_at_idx ON public.academic_calendar_events(starts_at);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX audit_logs_module_idx ON public.audit_logs(module);
CREATE INDEX help_desk_tickets_requester_idx ON public.help_desk_tickets(requester_id, status);

ALTER TABLE public.academic_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_desk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_desk_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar readable by authenticated" ON public.academic_calendar_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admins manage calendar" ON public.academic_calendar_events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "admins manage imports" ON public.import_jobs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "ticket participants read" ON public.help_desk_tickets FOR SELECT USING (requester_id=auth.uid() OR assignee_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "authenticated create tickets" ON public.help_desk_tickets FOR INSERT WITH CHECK (requester_id=auth.uid());
CREATE POLICY "participants update tickets" ON public.help_desk_tickets FOR UPDATE USING (requester_id=auth.uid() OR assignee_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "ticket participants read replies" ON public.help_desk_replies FOR SELECT USING (EXISTS (SELECT 1 FROM public.help_desk_tickets t WHERE t.id=ticket_id AND (t.requester_id=auth.uid() OR t.assignee_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'))));
CREATE POLICY "ticket participants add replies" ON public.help_desk_replies FOR INSERT WITH CHECK (author_id=auth.uid());
NOTIFY pgrst, 'reload schema';
