import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, userId, rewardId } = req.body;
    console.log("API /api/stamp hit:", { mode, userId, rewardId });

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // fetch user
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("stamp_count, username")
      .eq("id", userId)
      .single();

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

      // update user stamp count
      await supabaseAdmin
        .from("users")
        .update({ stamp_count: newCount })
        .eq("id", userId);

      // log in stamps history
      await supabaseAdmin.from("stamps").insert([
        { user_id: userId, created_at: new Date().toISOString() },
      ]);

      return res.status(200).json({
        message: `✅ Added 1 stamp for ${userData.username} (${newCount}/9)`,
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

      // deduct 9 stamps
      await supabaseAdmin
        .from("users")
        .update({ stamp_count: userData.stamp_count - 9 })
        .eq("id", userId);

      // insert into redeems using reward_id
      const { error: redeemError } = await supabaseAdmin.from("redeems").insert([
        {
          user_id: userId,
          reward_id: rewardId, // 👈 no lookup needed
          created_at: new Date().toISOString(),
          count: 1,
          total: 9,
        },
      ]);

      if (redeemError) {
        console.error("Redeem insert error:", redeemError);
        return res.status(500).json({ error: redeemError.message });
      }

      return res
        .status(200)
        .json({ message: `🎉 ${userData.username} redeemed a reward` });
    }

    return res.status(400).json({ error: "Invalid mode" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
