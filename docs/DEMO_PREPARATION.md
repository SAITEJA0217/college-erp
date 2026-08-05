# MRUH ERP - Demo Preparation & Script

## 1. Demo Script (10 Minutes)

### Introduction (1 Min)
"Good morning panel. Today we are presenting MRUH ERP, a unified College Enterprise Resource Planning system. Our goal was to eliminate fragmented systems and build a secure, role-based platform that handles everything from attendance to placements."

### Architecture & Tech Stack (1 Min)
"We built this using Next.js 15 App Router, React 19, and Tailwind CSS. The backend relies on Server Actions communicating with a Supabase PostgreSQL database. We enforced Row Level Security at the database level to ensure data privacy."

### Admin Workflow (2 Mins)
*(Log in as Admin)*
"The Admin dashboard controls the college hierarchy. Here we can create Schools, Departments, and Programs. To save time, we built a Bulk Import tool that reads CSV files, creates student accounts securely, and maps them to their classes instantly."

### Faculty Workflow (2 Mins)
*(Log in as Faculty)*
"As a Faculty member, my dashboard shows my timetable and assigned classes. I can mark attendance directly from here. We also integrated an LMS, allowing me to upload study materials to a secure cloud bucket or create an online quiz for my students."

### Student Workflow (2 Mins)
*(Log in as Student)*
"From the student's perspective, the UI is clean and focused. I can see my attendance percentage today, view my upcoming classes on the timetable, download the materials my professor just uploaded, and check my final semester results."

### Placement & Enterprise (1 Min)
*(Log in as Placement/HOD)*
"We also included dedicated modules for HODs to monitor their departments, and a Placement Cell module to track campus recruitment drives. Finally, our Help Desk system ensures students and faculty can raise IT or academic tickets seamlessly."

### Conclusion (1 Min)
"MRUH ERP is a production-ready, type-safe, and highly scalable solution ready for pilot testing. Thank you, we are now open to questions."

---

## 2. Frequently Asked Questions (FAQ) / Viva Questions

### Q: Why did you choose Next.js Server Actions over a traditional REST API?
**A:** Server Actions allow us to keep our business logic co-located with our components while ensuring end-to-end type safety using TypeScript. It reduces the boilerplate of writing API endpoints, fetching data via `fetch()`, and managing loading states, as Next.js handles the client-server boundary seamlessly.

### Q: How is the application secured?
**A:** We use a defense-in-depth approach. First, Next.js Middleware intercepts every request and validates the JWT session cookie. If a user tries to access a route they shouldn't (e.g., a student trying to hit `/admin`), they are redirected. Second, at the database level, Supabase Row Level Security (RLS) ensures that even if the middleware fails, a user's database query can only return data they own.

### Q: How does the system handle file uploads?
**A:** We utilize Supabase Storage buckets. When a faculty uploads a study material, the Server Action receives the file, streams it securely to the `study-materials` bucket, and saves the generated URL in the PostgreSQL database.

### Q: What happens if two faculty members try to mark attendance for the same class?
**A:** Our database schema ties attendance records to specific `faculty_class_assignments` and unique `dates`. The server action uses a PostgreSQL `upsert` (Update or Insert) operation to handle conflicts gracefully without crashing or duplicating data.

### Q: Is the database scalable?
**A:** Yes, PostgreSQL is highly scalable. We've also added database indexes (e.g., on student IDs, dates, and ticket statuses) to ensure queries remain extremely fast even with thousands of records.
