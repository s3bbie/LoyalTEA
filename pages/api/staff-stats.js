import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  try {
    // 1. Total customers
    const { count: total_customers, error: custError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });
    if (custError) throw custError;

    // 2. Total stamps
    const { data: stampData, error: stampError } = await supabase
      .from("stamps")
      .select("id");
    if (stampError) throw stampError;
    const total_stamps = stampData.length;

    // 3. Outstanding rewards (redemptions not used yet)
    const { data: rewardData, error: rewardError } = await supabase
      .from("rewards")
      .select("id, redeemed")
      .eq("redeemed", false);
    if (rewardError) throw rewardError;
    const outstanding_rewards = rewardData.length;

    // 4. Total redemptions
    const { data: redemptionData, error: redemptionError } = await supabase
      .from("redemptions")
      .select("id");
    if (redemptionError) throw redemptionError;
    const total_redemptions = redemptionData.length;

    // 5. Total revenue (sum of value in redemptions table)
    const { data: revenueData, error: revenueError } = await supabase
      .from("redemptions")
      .select("value");
    if (revenueError) throw revenueError;
    const total_revenue = revenueData.reduce(
      (sum, row) => sum + (row.value || 0),
      0
    );

    // Example: breakdown placeholders (replace with real queries later)
    const revenue_breakdown = {
      daily: total_revenue, // TODO: filter by today
      weekly: total_revenue, // TODO: filter last 7 days
      monthly: total_revenue, // TODO: filter last 30 days
    };

    // 6. Top redeemed drinks
    const { data: topDrinks, error: topDrinksError } = await supabase
      .from("redemptions")
      .select("reward_name")
      .order("reward_name", { ascending: true });
    if (topDrinksError) throw topDrinksError;
    const top_redeemed_drinks = Object.values(
      topDrinks.reduce((acc, row) => {
        acc[row.reward_name] = acc[row.reward_name] || {
          reward_name: row.reward_name,
          redeemed_count: 0,
        };
        acc[row.reward_name].redeemed_count++;
        return acc;
      }, {})
    );

    // 7. Top customers by value
    const { data: customerValues, error: custValError } = await supabase
      .from("redemptions")
      .select("username, value");
    if (custValError) throw custValError;
    const top_customers_by_value = Object.values(
      customerValues.reduce((acc, row) => {
        acc[row.username] = acc[row.username] || {
          username: row.username,
          total_value: 0,
        };
        acc[row.username].total_value += row.value || 0;
        return acc;
      }, {})
    ).sort((a, b) => b.total_value - a.total_value);

    res.status(200).json({
      total_customers,
      total_stamps,
      outstanding_rewards,
      total_redemptions,
      total_revenue,
      revenue_breakdown,
      top_redeemed_drinks,
      top_customers_by_value,
    });
  } catch (err) {
    console.error("staff-stats API error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
