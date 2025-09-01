import { createClient } from "@supabase/supabase-js";

// This uses the service role key (⚠️ never expose this on the client)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
