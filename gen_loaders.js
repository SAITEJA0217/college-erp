const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', '(dashboard)');
const routes = [
  'admin/schools', 'admin/departments', 'admin/programs', 'admin/academic-years',
  'admin/semesters', 'admin/sections', 'admin/subjects', 'admin/faculty',
  'admin/students', 'admin/faculty-assignments', 'admin/faculty-class-allocations',
  'admin/classes', 'admin/timetable',
  'admin/notes', 'admin/reports', 'admin/audit-logs',
  'faculty/classes', 'faculty/assignments', 'faculty/attendance', 'faculty/internal-marks', 'faculty/notes', 'faculty/quizzes', 'faculty/timetable',
  'student/assignments', 'student/attendance', 'student/internal-marks', 'student/notes', 'student/quizzes', 'student/results', 'student/timetable', 'student/placements'
];

const content = `import { TableSkeleton } from "@/components/feedback/skeletons";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
      </div>
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}
`;

routes.forEach(route => {
  const dir = path.join(baseDir, route);
  if (fs.existsSync(dir)) {
    fs.writeFileSync(path.join(dir, 'loading.tsx'), content);
    console.log('Created loading.tsx in', route);
  }
});
