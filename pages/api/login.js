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

    // 🔐 Sign in with Supabase Auth
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

    // 🔑 Ensure profile exists (server-side, bypasses RLS)
    await supabaseAdmin.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        stamp_count: 0,
        total_co2_saved: 0,
      },
      { onConflict: "id" }
    );

    // 🔍 Get role from profiles
    let role = "user";
    try {
      const { data: profile, error: roleError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("⚠️ Profile query error:", roleError.message);
      } else if (profile?.role) {
        role = profile.role;
      }
      console.log("📦 Profile role:", role);
    } catch (err) {
      console.error("🔥 Profile query failed:", err);
    }

    // 🔑 Sign JWT with id + username + role
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env.local");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const token = jwt.sign(
      {
        id: data.user.id, // ✅ include Supabase Auth user id
        username,
        role,
        email: data.user.email,
      },
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

    // ✅ Update last login timestamp
    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    // ✅ Return to client
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
