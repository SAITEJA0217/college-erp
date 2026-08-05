# MRUH ERP - Changelog

All notable changes to the MRUH ERP system are documented here.

## [1.0.0] - Release Candidate 1
### Added
- Complete end-to-end user roles (Admin, Faculty, Student, HOD, Placement).
- Next.js 15 App Router architecture implementation.
- Supabase Authentication (Email/Password) with secure Middlewares.
- Row Level Security (RLS) configured across 19 major database tables.
- Bulk Data Import capability for Admins (CSV/XLSX).
- Calendar Event Creation for Admin dashboard.
- HOD Timetable and Announcements module.
- Enterprise modules: Help Desk, System Audit Logs, and Global Announcements.
- Learning Management System (LMS) modules: Study Materials, Assignments, and Quizzes.
- Continuous Assessment (Internal Marks) and final Results generation engine.
- Placement tracking and campus drive management.
- Complete documentation suite.

### Fixed
- Duplicate navigation links in sidebar configurations.
- TypeScript strict mode compliance and unused variable removal across all Server Actions.
- Removed legacy `console.log` statements for cleaner production logs.
- Next.js build compilation errors related to mismatched parameter interfaces in HOD components.

### Security
- Role-based access control (RBAC) strictly enforced on Edge Middleware.
- Zod validation schemas applied to all forms.
- Supabase Storage buckets secured with RLS to prevent unauthorized material access.
