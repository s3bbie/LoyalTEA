// pages/api/staff-stats.js
import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  try {
    // Example: aggregate stats
    const { data: customers, error: custErr } = await supabaseAdmin
      .from("profiles")
      .select("id");

    if (custErr) throw custErr;

    const { data: stamps, error: stampErr } = await supabaseAdmin
      .from("stamps")
      .select("id");

    if (stampErr) throw stampErr;

    // … do your aggregation logic
    const stats = {
      total_customers: customers.length,
      total_stamps: stamps.length,
      outstanding_rewards: 0, // replace with real calc
      total_redemptions: 0,
      total_revenue: 0,
      revenue_breakdown: { daily: 0, weekly: 0, monthly: 0 },
      top_redeemed_drinks: [],
      top_customers_by_value: [],
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error("❌ staff-stats API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
