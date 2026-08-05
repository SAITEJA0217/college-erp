# MRUH ERP Installation Guide

## 1. Prerequisites
- **Node.js**: v20 or higher.
- **npm**: v10 or higher.
- **Git**: For version control.
- **Supabase Account**: You must have a Supabase project created for the database and authentication.

## 2. Local Setup Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/college-erp.git
cd college-erp
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
Create a file named `.env.local` in the root of the project. Use `.env.example` as a template.
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="College ERP"

# Third-party Integrations
RESEND_API_KEY=re_your_resend_api_key
```

### Step 4: Database Setup (Supabase)
1. Go to your Supabase Project dashboard.
2. Navigate to the **SQL Editor**.
3. Execute the SQL files found in `supabase/migrations/` sequentially (from `0001_initial_schema.sql` to the latest `0019_enterprise_modules.sql`).
4. Navigate to **Authentication -> Providers** and ensure Email/Password login is enabled.
5. Navigate to **Storage** and create the following buckets: `study-materials`, `assignments`, `announcements`.

### Step 5: Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Step 6: Initial Admin Creation
Because there is no public sign-up route, you must manually create the first admin user directly via the Supabase Dashboard:
1. Go to **Authentication -> Users** and click "Add User".
2. Once created, go to the **Table Editor -> profiles**.
3. Find the newly created user ID and set their `role` column to `admin`.

## 3. Useful Commands
- `npm run typecheck`: Validates all TypeScript types.
- `npm run build`: Compiles the application for production.
- `npm run start`: Runs the production compiled build locally.
