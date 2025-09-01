import { supabaseAdmin } from "../../utils/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, userId, reward } = req.body;

    // Fetch current user
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("stamp_count, username")
      .eq("id", userId)
      .single();

    if (fetchError || !userData) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Stamp mode
    if (mode === "stamp") {
      if ((userData.stamp_count || 0) >= 9) {
        return res.status(400).json({ error: `${userData.username} already has 9 stamps.` });
      }

      const newCount = (userData.stamp_count || 0) + 1;

      // Update users table
      await supabaseAdmin
        .from("users")
        .update({ stamp_count: newCount })
        .eq("id", userId);

      // Insert into stamps history
      await supabaseAdmin.from("stamps").insert([
        { user_id: userId, created_at: new Date().toISOString() },
      ]);

      return res.status(200).json({ message: `✅ Added 1 stamp for ${userData.username} (${newCount}/9)` });
    }

    // ✅ Reward mode
    if (mode === "reward") {
      if (userData.stamp_count < 9) {
        return res.status(400).json({ error: `${userData.username} does not have enough stamps.` });
      }

      await supabaseAdmin
        .from("users")
        .update({ stamp_count: userData.stamp_count - 9 })
        .eq("id", userId);

      await supabaseAdmin.from("redeems").insert([
        { user_id: userId, reward, redeemed_at: new Date().toISOString() },
      ]);

      return res.status(200).json({ message: `🎉 ${userData.username} redeemed ${reward}` });
    }

    return res.status(400).json({ error: "Invalid mode" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
