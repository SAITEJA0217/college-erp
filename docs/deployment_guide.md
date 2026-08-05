# MRUH ERP Deployment Guide

## 1. Production Architecture Overview
The MRUH ERP system is designed to be deployed on **Vercel** (for the Next.js Frontend/BFF) and **Supabase** (for the PostgreSQL Database, Authentication, and File Storage).

## 2. Supabase Configuration (Database & Auth)
1. **Create a Production Project**: Sign up for a Supabase Pro or Enterprise plan if expecting high traffic.
2. **Apply Migrations**: 
   - We recommend using the Supabase CLI for production migrations: `supabase db push` to push the schema located in `supabase/migrations/`.
   - Alternatively, execute the migrations in the SQL Editor on your production Supabase dashboard.
3. **Configure Authentication**:
   - Ensure the `Site URL` under **Authentication -> URL Configuration** is set to your production domain (e.g., `https://erp.mruh.edu.in`).
   - Add any testing or staging domains to the `Redirect URLs`.
4. **Storage Buckets**:
   - Manually recreate the storage buckets: `study-materials`, `assignments`, `announcements`.
   - Ensure you apply the correct RLS (Row Level Security) policies to the buckets via the Supabase dashboard.

## 3. Vercel Configuration (Application Hosting)
1. **Import the Repository**: Connect your GitHub repository to Vercel and create a new project.
2. **Framework Preset**: Ensure Vercel auto-detects **Next.js**.
3. **Environment Variables**:
   Add the following variables to the Vercel project settings (Environment Variables section):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g., `https://erp.mruh.edu.in`)
   - `RESEND_API_KEY` (Required for bulk import notifications & password resets)
4. **Build Command**: Leave as default (`next build`).
5. **Install Command**: Leave as default (`npm install`).

## 4. Custom Domain Setup
1. In Vercel, navigate to **Settings -> Domains**.
2. Add your custom domain (e.g., `erp.mruh.edu.in`).
3. Follow Vercel's instructions to configure your DNS records (A Record or CNAME) with your domain registrar.

## 5. Production Checklist
- [ ] Database migrations successfully applied to production Supabase.
- [ ] RLS policies verified on all tables and storage buckets.
- [ ] Supabase Auth URL configuration strictly matches the production domain.
- [ ] All 5 environment variables set correctly in Vercel.
- [ ] Initial super-admin account created manually in the DB.
- [ ] SSL certificates provisioned automatically by Vercel.

## 6. Rollback Procedure
If a deployment introduces critical bugs:
1. **Frontend Rollback**: Go to Vercel -> Project -> Deployments. Click the three dots on the previous stable deployment and select **Promote to Production / Rollback**. This instantly reverts the frontend.
2. **Database Rollback**: If a database migration caused the issue, you must manually revert the schema changes using a down-migration script or restore the database from the automated daily Supabase backups via the Supabase Dashboard -> **Database -> Backups**.
