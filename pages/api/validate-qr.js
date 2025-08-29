// pages/api/validate-qr.js
import jwt from "jsonwebtoken";
import { supabase } from "@/utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { staffToken, userId, mode, rewardName } = req.body;

  if (!staffToken) {
    return res.status(400).json({ error: "Missing staff token" });
  }

  try {
    // ✅ Verify staff QR token
    jwt.verify(staffToken, process.env.JWT_SECRET);

    if (mode === "stamp") {
      // Add a stamp
      const { error } = await supabase
        .from("users")
        .update({ stamp_count: supabase.rpc("increment", { x: 1 }) }) // Or fetch + increment manually
        .eq("id", userId);

      if (error) throw error;

      return res.json({ success: true, message: "Stamp added!" });
    }

    if (mode === "reward") {
      // Deduct stamps + log redeem
      const { error } = await supabase
        .from("users")
        .update({ stamp_count: supabase.rpc("decrement", { x: 9 }) }) // Or do it manually
        .eq("id", userId);

      if (error) throw error;

      await supabase.from("redeems").insert({
        user_id: userId,
        type: rewardName,
        created_at: new Date().toISOString(),
      });

      return res.json({ success: true, message: "Reward redeemed!" });
    }

    return res.status(400).json({ error: "Unknown mode" });
  } catch (err) {
    console.error("❌ QR validation failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired QR" });
  }
}
