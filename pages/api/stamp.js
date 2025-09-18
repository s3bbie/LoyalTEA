// pages/api/stamp.js
import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, userId, rewardId, reusable } = req.body;
    console.log("API /api/stamp hit:", { mode, userId, rewardId, reusable });

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Coerce reusable into a real boolean
    const isReusable = reusable === true || reusable === "true";

    // Try fetch user by id first, then fallback to username
    let { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, stamp_count, total_stamps_collected, username")
      .eq("id", userId)
      .maybeSingle();

    if (!userData) {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, stamp_count, total_stamps_collected, username")
        .eq("username", userId)
        .maybeSingle();

      userData = data;
      fetchError = error;
    }

    if (fetchError || !userData) {
      console.error("User fetch error:", fetchError);
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Add a stamp
    if (mode === "stamp") {
      if ((userData.stamp_count || 0) >= 9) {
        return res
          .status(400)
          .json({ error: `${userData.username} already has 9 stamps.` });
      }

      const newCount = (userData.stamp_count || 0) + 1;
      const newTotal = (userData.total_stamps_collected || 0) + 1;

      // Update user quick display count + lifetime total
      await supabaseAdmin
        .from("users")
        .update({
          stamp_count: newCount,
          total_stamps_collected: newTotal,
        })
        .eq("id", userData.id);

      // Log into stamps table
      await supabaseAdmin.from("stamps").insert([
        {
          user_id: userData.id,
          reusable: isReusable, // ✅ always boolean
          created_at: new Date().toISOString(),
        },
      ]);

      return res.status(200).json({
        message: isReusable
          ? `✅ Added 1 reusable stamp for ${userData.username} (${newCount}/9, total ${newTotal})`
          : `✅ Added 1 disposable stamp for ${userData.username} (${newCount}/9, total ${newTotal})`,
      });
    }

    // ✅ Redeem a reward
    if (mode === "reward") {
      if (userData.stamp_count < 9) {
        return res
          .status(400)
          .json({ error: `${userData.username} does not have enough stamps.` });
      }

      if (!rewardId) {
        return res.status(400).json({ error: "Missing rewardId" });
      }

      const newCount = userData.stamp_count - 9;

      // Update stamp count (lifetime total stays unchanged)
      await supabaseAdmin
        .from("users")
        .update({ stamp_count: newCount })
        .eq("id", userData.id);

      // ✅ Clear stamps table entries for this user after redeem
      await supabaseAdmin.from("stamps").delete().eq("user_id", userData.id);

      // Log into redeems table
      const { error: redeemError } = await supabaseAdmin.from("redeems").insert([
        {
          user_id: userData.id,
          reward_id: rewardId,
          reusable: isReusable,
          created_at: new Date().toISOString(),
        },
      ]);

      if (redeemError) {
        console.error("Redeem insert error:", redeemError);
        return res.status(500).json({ error: redeemError.message });
      }

      return res.status(200).json({
        message: isReusable
          ? `🎉 ${userData.username} redeemed a reward with a reusable cup!`
          : `🎉 ${userData.username} redeemed a reward with a disposable cup.`,
      });
    }

    return res.status(400).json({ error: "Invalid mode" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
