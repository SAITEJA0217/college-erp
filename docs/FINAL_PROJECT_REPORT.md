# Final Year Project Report

**Project Title:** MRUH ERP - Next-Generation College Enterprise Resource Planning System

## 1. Abstract
The MRUH ERP system is a comprehensive, cloud-native educational management platform designed to unify academic, administrative, and placement workflows. Built on modern web technologies including Next.js 15, React, and Supabase, the system eliminates traditional data silos by providing a single, role-based ecosystem for Admins, HODs, Faculty, Students, and Placement officers.

## 2. Problem Statement
Traditional educational institutions rely on fragmented, legacy software systems or paper-based workflows. These disparate systems lead to data inconsistency, communication delays, manual calculation errors (e.g., grading), and a poor user experience for both students and staff.

## 3. Objectives
1. To develop a centralized database architecture capable of storing the entire lifecycle of a student.
2. To provide bespoke, role-based dashboards that limit data exposure while maximizing utility.
3. To digitize continuous assessments, attendance tracking, and final result generation.
4. To implement enterprise-grade security and authentication out-of-the-box.

## 4. Proposed System
MRUH ERP proposes a decoupled backend-for-frontend architecture where React Server Components handle secure data retrieval directly from a PostgreSQL database, bypassing the need for a brittle external REST API. Row Level Security (RLS) ensures absolute data privacy.

## 5. Modules Implemented
- **Auth Module**: JWT-based login with Edge Middleware role verification.
- **Infrastructure Module**: Dynamic creation of Schools, Departments, and Programs.
- **Academic Module**: Timetable generation, Attendance tracking, and Leave management.
- **LMS Module**: Study materials, Assignments, and Quizzes.
- **Examination Module**: Internal marks upload and automated SGPA/CGPA generation.
- **Enterprise Module**: Help Desk ticketing, System Audit Logs, and Global Announcements.
- **Placement Module**: Corporate drive creation and applicant tracking.

## 6. Architecture & Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui.
- **Backend/API**: Next.js Server Actions.
- **Database**: PostgreSQL (managed by Supabase).
- **Authentication**: Supabase Auth.
- **Storage**: Supabase Storage Buckets.
- **Deployment**: Vercel.

## 7. Security & Testing
- **Security**: PostgreSQL Row Level Security (RLS) guarantees that users cannot read or modify data outside their permissions, even if the application logic fails.
- **Testing**: Manual end-to-end (E2E) verification completed across all 5 user roles. Zero compilation errors (TypeScript type-safe).

## 8. Results
The deployed platform significantly reduces administrative overhead. Tasks that previously took days (e.g., semester result compilation) are now executed in seconds via automated server actions. The Help Desk resolves inter-departmental communication barriers.

## 9. Future Scope
- Mobile application natively wrapping the web portal.
- Integration with biometric hardware for automated attendance.
- AI-driven analytics dashboard to predict student drop-out risks based on attendance and internal marks.

## 10. Conclusion
MRUH ERP Version 1.0 successfully meets all initial project objectives. It is a highly scalable, maintainable, and secure solution ready for real-world pilot testing at a university level.
