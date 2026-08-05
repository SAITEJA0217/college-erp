# MRUH ERP - Admin User Manual

## Overview
The Administrator has full control over the structural data of the College ERP. This includes defining the academic year, setting up colleges, departments, programs, and managing all users.

## 1. Academic Management
Navigate to the **Academic Management** sidebar group to configure the core skeleton of the college.

### 1.1 Managing Years and Semesters
- Go to `Academic Years` to define current and past academic years. Ensure the current year is marked as active.
- Go to `Semesters` to define semesters within those academic years.

### 1.2 Managing Infrastructure
- **Schools**: Create the overarching schools (e.g., School of Engineering).
- **Departments**: Map departments to schools.
- **Programs**: Define degree programs (e.g., B.Tech CSE) under departments.
- **Sections**: Create logical class sections (e.g., CSE-A) for enrollment.
- **Subjects**: Define subjects and link them to semesters and programs.

## 2. User & Enterprise Management
### 2.1 Bulk Import
Instead of creating users one by one, use the `Bulk Import` tool.
- Upload a CSV containing student or faculty data.
- The system will validate the rows, create Supabase Auth accounts, generate secure random passwords, and dispatch welcome emails.

### 2.2 Academic Calendar & Announcements
- **Calendar**: Create organization-wide events (holidays, exams) via the Calendar Event form on the dashboard.
- **Announcements**: Publish critical alerts globally or target them to specific sections.

### 2.3 Faculty Allocation
- Use `Faculty Assignments` to map faculty members to specific subjects.
- Use `Faculty Class Allocations` to bind a faculty member to a specific section and schedule their timetable.

## 3. Support
Admins can monitor the **Help Desk** to review and resolve system-wide issues submitted by students or faculty.
