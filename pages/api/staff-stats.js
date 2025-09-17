import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  try {
    // 1. Total customers
    const { count: total_customers, error: custError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    if (custError) throw custError;

    // 2. Total stamps
    const { count: total_stamps, error: stampError } = await supabase
      .from("stamps")
      .select("*", { count: "exact", head: true });
    if (stampError) throw stampError;

    // 3. Total redemptions
    const { data: redeemData, count: total_redemptions, error: redeemError } =
      await supabase.from("redeems").select("*", { count: "exact" });
    if (redeemError) throw redeemError;

    // 4. Top redeemed drinks
    const topRedeemed = Object.values(
      redeemData.reduce((acc, row) => {
        if (!row.reward_name) return acc;
        acc[row.reward_name] = acc[row.reward_name] || {
          reward_name: row.reward_name,
          redeemed_count: 0,
        };
        acc[row.reward_name].redeemed_count++;
        return acc;
      }, {})
    ).sort((a, b) => b.redeemed_count - a.redeemed_count);

    // 5. Top customers by redemption count (no revenue column)
    const topCustomers = Object.values(
      redeemData.reduce((acc, row) => {
        if (!row.username) return acc;
        acc[row.username] = acc[row.username] || {
          username: row.username,
          total_value: 0,
        };
        acc[row.username].total_value += 1; // just counts redeems
        return acc;
      }, {})
    ).sort((a, b) => b.total_value - a.total_value);

    res.status(200).json({
      total_customers,
      total_stamps,
      total_redemptions,
      outstanding_rewards: 0, // You don’t have this table
      total_revenue: topCustomers.reduce((s, c) => s + c.total_value, 0), // counts redeems
      revenue_breakdown: { daily: 0, weekly: 0, monthly: 0 }, // placeholder until we use created_at
      top_redeemed_drinks: topRedeemed,
      top_customers_by_value: topCustomers,
    });
  } catch (err) {
    console.error("staff-stats API error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
