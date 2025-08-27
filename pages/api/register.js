// pages/api/register.js
import { supabase } from "@/utils/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ error: "Username and PIN required" });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // Insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, pin_hash: pinHash, stamp_count: 0 }])
      .select()
      .single();

    if (error) throw error;

    // Create JWT
    const token = jwt.sign(
      { sub: data.id, username: data.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.setHeader("Set-Cookie", cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
}
