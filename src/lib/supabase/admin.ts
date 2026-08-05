import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/config/env";
import { cache } from "react";

// Uses the service role key to bypass RLS for administrative actions.
// Never expose this client to the browser.
export const createAdminClient = cache(() => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
});
