import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL. Check your Appflow/Vercel environment.");
}

if (!supabaseAnonKey) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your Appflow/Vercel environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
  },
});

