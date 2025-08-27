// deno run --allow-net --allow-env
// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyPin, signJwt } from "../_shared/auth.ts";

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
    if (!username || !pin) return bad("Missing credentials");

    const uname = String(username).toLowerCase();

    const { data: acct } = await supabase
      .from("accounts")
      .select("id, pin_hash, pin_salt, failed_attempts, is_locked, role")
      .ilike("username", uname)
      .maybeSingle();

    if (!acct) return bad("Invalid username or PIN", 401);
    if (acct.is_locked) return bad("Account locked. Try later or ask staff.", 423);

    const ok = await verifyPin(pin, acct.pin_salt, acct.pin_hash);
    if (!ok) {
      await supabase
        .from("accounts")
        .update({
          failed_attempts: (acct.failed_attempts ?? 0) + 1,
          is_locked: (acct.failed_attempts ?? 0) + 1 >= 5,
        })
        .eq("id", acct.id);
      return bad("Invalid username or PIN", 401);
    }

    await supabase
      .from("accounts")
      .update({ failed_attempts: 0, is_locked: false, last_login_at: new Date().toISOString() })
      .eq("id", acct.id);

    const now = Math.floor(Date.now() / 1000);
    const token = await signJwt({
      sub: acct.id,
      role: "authenticated",
      account_role: (acct.role as "user" | "admin") ?? "user",
      iat: now,
      exp: now + 60 * 60,
    });

    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return bad("Invalid request body", 400);
  }
});
