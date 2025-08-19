import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import Script from "next/script";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const firstName = e.target.firstName.value.trim();
    const lastName = e.target.lastName.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const fullName = `${firstName} ${lastName}`.trim();

    grecaptcha.ready(() => {
      grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY, { action: "register" })
        .then(async (recaptchaToken) => {
          const v = await fetch("/api/recaptcha-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recaptchaToken, expectedAction: "register" }),
          });
          if (!v.ok) {
            const { error } = await v.json().catch(() => ({ error: "Captcha failed" }));
            setLoading(false);
            alert(error || "Captcha failed");
            return;
          }

          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                full_name: fullName,
                display_name: fullName,
              },
              emailRedirectTo: `${window.location.origin}/verify-email`,
            },
          });

          setLoading(false);
          if (error) {
            alert(error.message || "Sign-up failed");
            return;
          }
          router.push("/verify-email");
        });
    });
  };

  return (
    <>
      <Head>
        <title>Register – LoyalTEA</title>
      </Head>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}`} />
      
      <div className="auth-container register">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}

        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div
              className="form-row"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@domain.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="signup-prompt">
              Already a member? <Link href="/">Sign in</Link>
            </p>
          </form>
        </div>

        <p className="reCaptcha">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </div>
    </>
  );
}
