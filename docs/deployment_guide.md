# Deployment Guide - College ERP

This guide outlines the steps required to deploy the College ERP application to Vercel and set up the corresponding Supabase backend.

## Architecture Prerequisites
Ensure you have active accounts for:
- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)

---

## Step 1: Database Setup (Supabase)

1. **Create a New Project** on Supabase.
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Run the migrations in alphabetical/numerical order from `supabase/migrations/` (or use the Supabase CLI: `supabase db push`).
4. Execute the static seed file:
   ```sql
   -- Content of supabase/seeds/seed.sql
   ```
5. Execute the admin default seed script to create the initial root administrator:
   ```sql
   -- Content of supabase/seeds/admin.sql
   ```
   *Change the default credentials upon first login.*

---

## Step 2: Deployment Configuration (Vercel)

1. Import your project repository into Vercel.
2. In **Environment Variables**, configure the following required parameters:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project API URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Project Service Role Key (kept secure, server-side only).
3. Under Build & Development settings, use default Next.js parameters (`npm run build`).
4. Trigger the deployment.
