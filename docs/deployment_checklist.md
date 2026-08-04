# Deployment Checklist

Follow this checklist during staging/production deployments of the College ERP.

## Pre-Deployment Requirements
- [ ] Active Supabase project initialized.
- [ ] Database credentials (anon/service-role) generated.
- [ ] Production repository imported to Vercel.

## 1. Database Setup
- [ ] Execute migrations `0001_initial_schema.sql` through `0009_indexes.sql` sequentially via SQL Editor or CLI.
- [ ] Execute `supabase/seeds/seed.sql` to populate academic metadata.
- [ ] Execute `supabase/seeds/admin.sql` to initialize default administrator account.

## 2. Environment Variables Configuration (Vercel)
Configure the following variable keys:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` (Set to deployment domain URL)

## 3. Post-Deployment Verification
- [ ] Access site root and log in with default admin credentials:
  - **Email:** `admin@collegeerp.local`
  - **Password:** `Admin@12345`
- [ ] Reset default admin password in User Settings immediately.
- [ ] Verify navigation routing correctly paths to `/admin`.
