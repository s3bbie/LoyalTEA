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

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
    });

    if (error) {
      console.error("Supabase createUser error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, userId: data.user.id });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed", details: err.message });
  }
}
