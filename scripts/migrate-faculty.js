const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('Checking current faculty table columns...');

  // Step 1: Try selecting each column one by one to see what exists
  const columnsToCheck = [
    'profile_id', 'department_id', 'designation',
    'employee_id', 'qualification', 'specialization',
    'experience_years', 'joining_date', 'employment_type',
    'is_hod', 'is_archived', 'created_at'
  ];

  const existing = [];
  const missing = [];

  for (const col of columnsToCheck) {
    const { error } = await supabase.from('faculty').select(col).limit(1);
    if (error && error.code === '42703') {
      missing.push(col);
    } else {
      existing.push(col);
    }
  }

  console.log('Existing columns:', existing.join(', '));
  console.log('Missing columns:', missing.join(', '));

  // Step 2: Try to insert a dummy row to trigger the auto-create (won't work but shows what we need)
  console.log('\nTo add the missing columns, run this SQL in your Supabase Dashboard > SQL Editor:');
  console.log('');
  
  const alterStatements = missing.map(col => {
    switch (col) {
      case 'employee_id': return `ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE`;
      case 'qualification': return `ADD COLUMN IF NOT EXISTS qualification TEXT`;
      case 'specialization': return `ADD COLUMN IF NOT EXISTS specialization TEXT`;
      case 'experience_years': return `ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0`;
      case 'joining_date': return `ADD COLUMN IF NOT EXISTS joining_date DATE`;
      case 'employment_type': return `ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full Time'`;
      case 'is_hod': return `ADD COLUMN IF NOT EXISTS is_hod BOOLEAN DEFAULT FALSE`;
      case 'is_archived': return `ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE`;
      case 'created_at': return `ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`;
      default: return null;
    }
  }).filter(Boolean);

  if (alterStatements.length > 0) {
    console.log(`ALTER TABLE faculty\n  ${alterStatements.join(',\n  ')};`);
  } else {
    console.log('All columns already exist!');
  }
}

main().catch(console.error);
