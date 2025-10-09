// pages/api/staff-reports.js
import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  try {
    console.log("🧩 staff-reports API triggered");

    // --- 1️⃣ Members ---
    const { data: members, error: membersErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, created_at, stamp_count, total_co2_saved, total_stamps_collected")
      .neq("role", "staff");
    if (membersErr) throw membersErr;

    const total_members = members.length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const new_members_week = members.filter(m => new Date(m.created_at) >= weekAgo).length;

    // --- 2️⃣ Active Members ---
    const { data: stamps, error: stampErr } = await supabaseAdmin
      .from("stamps")
      .select("user_id, created_at");
    if (stampErr) throw stampErr;

    const { data: redeems, error: redeemErr } = await supabaseAdmin
      .from("redeems")
      .select("user_id, created_at, reward, total_price");
    if (redeemErr) throw redeemErr;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUserSet = new Set();
    stamps.forEach(s => {
      if (new Date(s.created_at) >= thirtyDaysAgo) activeUserSet.add(s.user_id);
    });
    redeems.forEach(r => {
      if (new Date(r.created_at) >= thirtyDaysAgo) activeUserSet.add(r.user_id);
    });
    const active_members = activeUserSet.size;

    // --- 3️⃣ Redemption rate ---
    const redemption_rate =
      stamps.length > 0 ? ((redeems.length / stamps.length) * 100).toFixed(1) : 0;

    // --- 4️⃣ Growth chart (RPC if exists) ---
    let growthData = [];
    try {
      const { data: g, error: gErr } = await supabaseAdmin.rpc("get_member_growth");
      if (!gErr) growthData = g;
    } catch (e) {
      console.warn("⚠️ get_member_growth not found, skipping");
    }

    // --- 5️⃣ High-value & Segments (RPCs optional) ---
    let high_value_customers = [];
    let customer_segments = [];
    try {
      const { data: hv, error: hvErr } = await supabaseAdmin.rpc("get_high_value_customers");
      if (!hvErr) high_value_customers = hv;
    } catch (e) {
      console.warn("⚠️ get_high_value_customers missing");
    }
    try {
      const { data: seg, error: segErr } = await supabaseAdmin.rpc("get_customer_segments");
      if (!segErr) customer_segments = seg;
    } catch (e) {
      console.warn("⚠️ get_customer_segments missing");
    }

    // --- 6️⃣ Build Insights ---
    const total_co2_saved =
      members.reduce((sum, m) => sum + (parseFloat(m.total_co2_saved) || 0), 0).toFixed(2);
    const avg_stamps_per_active =
      active_members > 0
        ? (
            members.reduce((sum, m) => sum + (m.stamp_count || 0), 0) / active_members
          ).toFixed(1)
        : 0;

const mostRedeemed =
  redeems.length > 0
    ? Object.entries(
        redeems.reduce((acc, r) => {
          acc[r.reward] = (acc[r.reward] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;


    const total_revenue = redeems.reduce((sum, r) => sum + (r.total_price || 0), 0).toFixed(2);

    const insights = {
      most_redeemed_drink: mostRedeemed,
      avg_stamps_per_active: avg_stamps_per_active,
      co2_saved_kg: total_co2_saved,
      total_revenue,
    };

    // --- 7️⃣ Return all data ---
    const reports = {
      total_members,
      new_members_week,
      active_members,
      redemption_rate,
      member_growth: growthData,
      high_value_customers,
      customer_segments,
      insights,
    };

    console.log("✅ reports data compiled:", reports);
    return res.status(200).json(reports);
  } catch (err) {
    console.error("❌ staff-reports API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
