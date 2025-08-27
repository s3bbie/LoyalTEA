// pages/api/login.js
import { supabase } from "@/utils/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie"; // safer import for CommonJS package

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ error: "Missing username or PIN" });
    }

    // Fetch user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, pin_hash, role")
      .eq("username", username)
      .single();

    if (error) {
      console.error("❌ Supabase query error:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid username or PIN" });
    }

    // Verify PIN
    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) {
      return res.status(401).json({ error: "Invalid username or PIN" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Create JWT
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Session duration
    );

    // Set HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    );

    // Update last_login_at (don’t crash if this fails)
    const { error: updateErr } = await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateErr) {
      console.error("⚠️ Failed to update last_login_at:", updateErr);
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("🔥 Login API unexpected error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
