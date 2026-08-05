import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const userId = "5337227e-aa5a-4512-b457-4ad8cc0df389";
  console.log(`Updating password for user ${userId}...`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    {
      password: "MRUH@2020",
      email_confirm: true,
    }
  );

  if (error) {
    console.error("Error updating user:", error.message);
  } else {
    console.log("Successfully updated password!");
    console.log("User Data:", data);
  }
}

main().catch(console.error);
