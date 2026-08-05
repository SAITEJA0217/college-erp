# MRUH ERP Release Notes - v1.0 (Release Candidate)

**Release Date:** August 2026
**Version:** 1.0.0-rc.1

We are incredibly proud to announce the Release Candidate for MRUH ERP Version 1.0. This release marks the transition from development to a feature-complete, production-ready enterprise resource planning software tailored for modern educational institutions.

## Key Highlights

### 1. Robust Core Architecture
Built on Next.js 15, the platform leverages the latest App Router and Server Actions. We successfully eliminated traditional REST API bottlenecks, opting for secure, type-safe RPC interactions directly mapped to our Supabase PostgreSQL instance.

### 2. Comprehensive Role Hierarchy
We have delivered 5 bespoke dashboards explicitly tailored for:
- **Admin**: Complete system and infrastructure governance.
- **HOD (Head of Department)**: Departmental oversight and faculty management.
- **Faculty**: Class management, grading, and direct student interaction.
- **Student**: Centralized portal for academics, materials, and results.
- **Placement Cell**: Dedicated campus recruitment drive management.

### 3. Integrated Learning Management System (LMS)
Students and faculty can now interact seamlessly through the portal without relying on external software. Features include secure PDF/Document distribution, timed online quizzes, and digital assignment submissions with file attachments.

### 4. High-Performance Enterprise Workflows
- **Bulk CSV Uploads**: Drastically reduces data-entry fatigue for administrative staff.
- **Automated SGPA/CGPA Calculations**: A deterministic results engine handles grading math internally.
- **Help Desk**: A centralized ticketing system eliminates lost emails and ensures accountable support across all campus departments.

## Known Limitations
- The current email integration via Resend requires an active internet connection to dispatch messages (cannot run fully air-gapped).
- Very large CSV imports (>10,000 rows) may require batching to prevent server action timeouts.

## Upgrade Instructions
Since this is the inaugural v1.0 release, it must be deployed as a fresh installation. Follow the `INSTALLATION_GUIDE.md` and ensure all 19 Supabase SQL migrations are applied in sequence.
