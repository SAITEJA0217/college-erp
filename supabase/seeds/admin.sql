-- supabase/seeds/admin.sql
-- Default Admin Account Seed Script
-- Creates the admin account in auth.users and links it in public.profiles.
-- NOTE: For deployment, replace the generated hashes/passwords with secure credentials, 
-- or change the password immediately after first login.

-- Insert Admin User into auth.users (Supabase Managed Auth Schema)
-- Password 'Admin@12345' hashed using crypt/bf_key (default Blowfish crypt)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1a7d6e4-4a4a-4d2c-8cb4-370de8d98d23',
  'authenticated',
  'authenticated',
  'admin@collegeerp.local',
  -- Blowfish crypt hash of 'Admin@12345'
  crypt('Admin@12345', gen_salt('bf', 10)),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System Administrator"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert Admin Profile into public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  role,
  employee_or_student_id,
  is_active,
  is_archived,
  created_at,
  updated_at
) VALUES (
  'a1a7d6e4-4a4a-4d2c-8cb4-370de8d98d23',
  'admin@collegeerp.local',
  'System Administrator',
  NULL,
  NULL,
  'admin',
  'EMP-ADMIN001',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
