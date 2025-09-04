import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔑 service role
);

export default async function handler(req, res) {
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) {
    console.error("Staff stats error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
