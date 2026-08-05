# MRUH ERP API & Server Actions Documentation

## 1. Overview
The MRUH ERP system uses **Next.js 15 Server Actions** as the primary method for mutating data and querying the database securely from the client. There is no traditional REST or GraphQL API exposed to the public; instead, the application uses RPC-style function calls directly integrated into the React component tree.

## 2. Authentication & Authorization Flow
Every server action in the system is protected by the `assertRole` utility found in `src/features/auth/user.ts`.

### Example Security Check
```typescript
import { assertRole } from "@/features/auth/user";

export async function createAnnouncement(data: FormData) {
  // Throws an error if the user is not an admin or hod
  const profile = await assertRole(["admin", "hod"]);
  
  // Proceed with DB insertion
}
```

## 3. Core Server Action Modules

All Server Actions are located in `src/features/`.

### 3.1. Authentication (`src/features/auth/actions.ts`)
- `login(formData: FormData)`: Authenticates user against Supabase.
- `logout()`: Clears the session cookie.
- `changePassword(data)`: Updates the current user's password.

### 3.2. Enterprise & Admin (`src/features/enterprise/actions.ts` / `src/features/admin/actions.ts`)
- `createCalendarEvent(data)`: Adds a new academic or holiday event.
- `uploadBulkData(csvFile)`: Processes CSV/XLSX imports for students or faculty.
- `resolveHelpDeskTicket(ticketId)`: Updates a ticket status.

### 3.3. Academic Management (`src/features/results/actions.ts` & `src/features/attendance/actions.ts`)
- `markAttendance(sectionId, studentIds, date)`: Upserts daily attendance records.
- `publishResults(semesterId, departmentId)`: Calculates SGPA/CGPA and makes results visible to students.
- `uploadInternalMarks(csvData)`: Parses and uploads continuous assessment marks.

### 3.4. Learning Management (`src/features/assignments/actions.ts` & `src/features/quizzes/actions.ts`)
- `createAssignment(data, file)`: Uploads a file to Supabase Storage and creates an assignment record.
- `submitAssignment(assignmentId, file)`: Handles student file uploads.
- `submitQuizAttempt(quizId, answers)`: Evaluates quiz answers securely on the server and returns a score.

## 4. File Uploads & Storage API
File uploads use Supabase Storage. The server actions receive standard web `File` or `FormData` objects, generate unique paths, and upload them securely using the `@supabase/supabase-js` server client.

Buckets Used:
- `study-materials`
- `assignments`
- `announcements`

## 5. Third-Party Integrations
- **Resend (Email API):** Used for sending password reset links and critical alerts (e.g. bulk import completion).
