// pages/api/login.js
import { supabase } from "@/utils/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const { username, pin } = req.body;


    if (!username || !pin) {
      return res.status(400).json({ error: "Missing username or PIN" });
    }

    // Fetch user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, pin_hash, role")
      .eq("username", username)
      .maybeSingle();

      console.log("Fetched user:", user);
console.log("Supabase error:", error);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (!user) {
      console.warn("⚠️ No user found for:", username);
      return res.status(401).json({ error: "Invalid username or PIN" });
    }



    // Verify PIN
    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) {
      console.warn("⚠️ Wrong PIN for:", username);
      return res.status(401).json({ error: "Invalid username or PIN" });
    }

    // JWT Secret check
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET!");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

// Create JWT with Supabase id as `userId`
const token = jwt.sign(
  { userId: user.id, username: user.username, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);




    // Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );



    // Update last login
await supabase
  .from("users")
  .update({ last_login_at: new Date().toISOString() })
  .eq("id", user.id);

    return res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("🔥 Unexpected login error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
