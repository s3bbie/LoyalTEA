// pages/api/login.js
import { supabase } from "@/utils/supabaseClient";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ error: "Missing username or PIN" });
  }

  try {
    const email = `${username}@loyaltea.com`;

    // 🔐 Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error) {
      console.error("❌ Supabase login error:", error.message);
      return res.status(401).json({ error: "Invalid username or PIN" });
    }

    if (!data.user) {
      console.error("⚠️ Supabase returned no user object");
      return res.status(500).json({ error: "Login failed: no user returned" });
    }

    console.log("📧 Auth email from Supabase:", data.user.email);

    // ✅ Fetch profile using supabaseAdmin (bypass RLS)
    let profile = null;
    const { data: profileData, error: roleError } = await supabaseAdmin
      .from("profiles")
      .select("role, email")
      .eq("email", data.user.email.toLowerCase())
      .maybeSingle();

    if (roleError) {
      console.error("⚠️ Profile query error:", roleError.message);
    } else {
      profile = profileData;
    }

    console.log("📦 Profile query result:", profile);

    let role = "user";
    if (profile && profile.role) {
      role = profile.role;
    }
    console.log("🔎 Final role resolved:", role);

    // 🔑 Sign JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env.local");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const token = jwt.sign(
      { id: data.user.id, username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    // 🕒 Update last login with supabaseAdmin too
    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("email", data.user.email.toLowerCase());

    // ✅ Return
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        username,
        role,
      },
    });
  } catch (err) {
    console.error("🔥 Unexpected login error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
