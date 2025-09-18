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
      .select("id, stamp_count, username")
      .eq("id", userId)
      .maybeSingle();

    if (!userData) {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, stamp_count, username")
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

      // Update user quick display count
      await supabaseAdmin
        .from("users")
        .update({ stamp_count: newCount })
        .eq("id", userData.id);

      // Log into stamps table
      await supabaseAdmin.from("stamps").insert([
        {
          user_id: userData.id,
          reusable: isReusable, // ✅ always real boolean
          created_at: new Date().toISOString(),
        },
      ]);

      return res.status(200).json({
        message: isReusable
          ? `✅ Added 1 reusable stamp for ${userData.username} (${newCount}/9)`
          : `✅ Added 1 disposable stamp for ${userData.username} (${newCount}/9)`,
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

      await supabaseAdmin
        .from("users")
        .update({ stamp_count: newCount })
        .eq("id", userData.id);

      const { error: redeemError } = await supabaseAdmin.from("redeems").insert([
        {
          user_id: userData.id,
          reward_id: rewardId,
          reusable: isReusable, // ✅ always real boolean
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
