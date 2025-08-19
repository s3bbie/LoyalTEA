export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { recaptchaToken, expectedAction } = req.body;

  const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(recaptchaToken)}`,
  });
  const data = await verifyRes.json();

  console.log("reCAPTCHA verify response:", data);

  if (!data.success) return res.status(400).json({ error: "Captcha failed" });
  if (typeof data.score === "number" && data.score < 0.5) return res.status(400).json({ error: "Low score" });
  if (expectedAction && data.action && data.action !== expectedAction) return res.status(400).json({ error: "Wrong action" });

  res.status(200).json({ ok: true, score: data.score || null });
}
