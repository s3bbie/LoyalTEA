// deno run --allow-net --allow-env
// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { newSaltBase64, hashPin, signJwt } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function bad(msg: string, code = 400) {
  return new Response(msg, { status: code });
}

serve(async (req) => {
  if (req.method !== "POST") return bad("Method not allowed", 405);

  try {
    const { username, pin } = await req.json();
    if (!/^[a-z0-9_]{3,24}$/i.test(username || "")) return bad("Invalid username");
    if (!/^\d{6}$/.test(pin || "")) return bad("PIN must be 6 digits");

    const uname = String(username).toLowerCase();

    // unique (case-insensitive)
    const { data: exists } = await supabase
      .from("accounts")
      .select("id")
      .ilike("username", uname)
      .maybeSingle();
    if (exists) return bad("Username already taken", 409);

    const saltB64 = newSaltBase64();
    const pin_hash = await hashPin(pin, saltB64);

    const { data: acct, error } = await supabase
      .from("accounts")
      .insert({ username: uname, pin_hash, pin_salt: saltB64, role: "user" })
      .select("id, role")
      .single();

    if (error || !acct) return bad("Failed to create account", 500);

    const now = Math.floor(Date.now() / 1000);
    const token = await signJwt({
      sub: acct.id,
      role: "authenticated",
      account_role: (acct.role as "user" | "admin") ?? "user",
      iat: now,
      exp: now + 60 * 60, // 60 minutes
    });

    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return bad("Invalid request body", 400);
  }
});
