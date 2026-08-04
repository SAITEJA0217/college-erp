# College ERP

Production-ready College ERP foundation (Next.js 15 + Supabase).

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS · shadcn/ui · Lucide · React Hook Form · Zod
- Supabase Auth / Postgres / Storage
- next-themes (dark mode)

## Getting started

1. Copy `.env.example` to `.env.local` and set Supabase credentials.
2. Install: `npm install`
3. Develop: `npm run dev`
4. Typecheck: `npm run typecheck`
5. Build: `npm run build`

## Auth model

There is **no public signup**. Admins provision Student / Faculty / HOD / Placement accounts. Users log in with **Student ID or Employee ID + password**.

Until Supabase credentials are configured, dashboard shells render with foundation demo profiles so the UI can be reviewed.

## Foundation scope

Step 1 includes project scaffold, layouts, reusable shell components, role navigation, marketing pages, and login UI. Domain features (attendance, assignments, placements, etc.) are intentionally not implemented yet.
