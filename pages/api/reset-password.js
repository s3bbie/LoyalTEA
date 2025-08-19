
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, redirectTo, recaptchaToken } = req.body;

  const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
  });
  const data = await verifyRes.json();
  if (!data.success || (typeof data.score === "number" && data.score < 0.5)) {
    return res.status(400).json({ error: "Captcha failed" });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ ok: true });
}
