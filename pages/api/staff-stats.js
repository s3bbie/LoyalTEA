// pages/api/staff-stats.js
import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  try {
    // 1️⃣ Total Customers (non-staff)
    const { data: customers, error: custErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role");
    if (custErr) throw custErr;

    const total_customers = customers.filter((c) => c.role !== "staff").length;

    // 2️⃣ Total Stamps
    const { data: stamps, error: stampErr } = await supabaseAdmin
      .from("stamps")
      .select("id");
    if (stampErr) throw stampErr;
    const total_stamps = stamps.length;

    // 3️⃣ Total Redemptions
    const { data: redeems, error: redeemErr } = await supabaseAdmin
      .from("redeems")
      .select("id");
    if (redeemErr) throw redeemErr;
    const total_redemptions = redeems.length;

    // 4️⃣ Outstanding Rewards (assume 10 stamps = 1 reward)
    const { data: profileStamps, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("stamp_count");
    if (profErr) throw profErr;

// ✅ Each reward is unlocked at 9 stamps
const outstanding_rewards = profileStamps
  ? profileStamps.filter((u) => (u.stamp_count || 0) >= 9).length
  : 0;


    // 5️⃣ Total Revenue (join redeems + reward_prices)
    const { data: totalRevenueData, error: totalRevenueErr } = await supabaseAdmin
      .rpc("get_total_revenue");
    if (totalRevenueErr) throw totalRevenueErr;

    const total_revenue = totalRevenueData?.[0]?.total_revenue || 0;

    // 6️⃣ Top Redeemed Drinks
    const { data: topRedeemedDrinks, error: topRedeemedErr } = await supabaseAdmin
      .rpc("get_top_redeemed_drinks");
    if (topRedeemedErr) throw topRedeemedErr;

    // 7️⃣ Top Customers by Value
    const { data: topCustomersByValue, error: topCustErr } = await supabaseAdmin
      .rpc("get_top_customers_by_value");
    if (topCustErr) throw topCustErr;

    // 8️⃣ Revenue breakdown (daily, weekly, monthly)
    const { data: breakdown, error: breakdownErr } = await supabaseAdmin.rpc("get_revenue_breakdown");
    if (breakdownErr) console.warn("⚠️ Revenue breakdown error:", breakdownErr);

    const revenue_breakdown = breakdown?.[0] || { daily: 0, weekly: 0, monthly: 0 };

    // 9️⃣ Sustainability Breakdown
const { data: sustainabilityData, error: sustainErr } = await supabaseAdmin.rpc("get_sustainability_breakdown");
if (sustainErr) console.warn("♻️ Sustainability breakdown error:", sustainErr);

const sustainability_breakdown = sustainabilityData?.[0] || {
  reusable_count: 0,
  non_reusable_count: 0,
  reusable_percentage: 0,
};


    const stats = {
      total_customers,
      total_stamps,
      total_redemptions,
      outstanding_rewards,
      total_revenue,
      revenue_breakdown,
      top_redeemed_drinks: topRedeemedDrinks || [],
      top_customers_by_value: topCustomersByValue || [],
      sustainability_breakdown,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error("❌ staff-stats API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
