import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Link from "next/link";
import Script from "next/script";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  grecaptcha.ready(() => {
    grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY, { action: "login" }).then(async (recaptchaToken) => {
      const v = await fetch("/api/recaptcha-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken, expectedAction: "login" }),
      });
      if (!v.ok) {
        const { error } = await v.json().catch(() => ({ error: "Captcha failed" }));
        setLoading(false);
        alert(error || "Captcha failed");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        alert(error.message || "Login failed");
        return;
      }
      router.push("/home");
    });
  });
};



  return (
    <>
      <Head><title>Login – LoyalTEA</title></Head>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}`} />
      <div className="auth-container login">
        {loading && <div className="loading-overlay"><div className="spinner" /></div>}
        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>
          <form id="loginForm" className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input type="email" id="email" name="email" placeholder="Email address" required />
            </div>
            <div className="form-group password-group">
              <input type="password" id="loginPassword" name="password" placeholder="Password" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="legal-text">
              By logging in, you agree to the <br />
              <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>.
            </p>
            <p className="signup-prompt">
              Not a member? <Link href="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
