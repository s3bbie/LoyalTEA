// pages/api/register.js
import { supabaseAdmin } from "@/utils/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ error: "Username and PIN required" });
  }

  if (pin.length < 6) {
    return res.status(400).json({ error: "PIN must be at least 6 digits long" });
  }

  try {
    const email = `${username}@loyaltea.com`;

    // ✅ confirm email right away
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
    });

    if (error) throw error;

    // ✅ profiles is already auto-populated via trigger
    await supabaseAdmin.from("profiles").update({ username }).eq("id", data.user.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Full Supabase error:", JSON.stringify(err, null, 2));
    return res.status(500).json({ error: "Registration failed", details: err.message });
  }
}
