// pages/register.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/utils/supabaseClient";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(null);
  const captchaRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value.trim();
    const lastName  = e.target.lastName.value.trim();
    const email     = e.target.email.value.trim();
    const password  = e.target.password.value;

    if (!firstName || !lastName) {
      alert("Please enter your first and last name.");
      return;
    }

    setPending({ firstName, lastName, email, password });
    setLoading(true);
    try {
      if (captchaRef.current) {
        await captchaRef.current.execute();
      } else {
        await onVerify(null);
      }
    } catch (err) {
      console.error("hCaptcha execute error:", err);
      setLoading(false);
    }
  };

  const onVerify = async (token) => {
    if (!pending) return;
    const { firstName, lastName, email, password } = pending;
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const options = {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          display_name: fullName, // safe now that the column exists
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      };
      if (token) options.captchaToken = token;

      const { error } = await supabase.auth.signUp({ email, password, options });

      if (error) {
        console.error("signUp error:", error);
        alert(error.message || "Sign-up failed");
        return;
      }

      router.push("/verify-email");
    } finally {
      setLoading(false);
      captchaRef.current?.resetCaptcha?.();
    }
  };

  return (
    <>
      <Head><title>Register – LoyalTEA</title></Head>
      <div className="auth-container register">
        {loading && <div className="loading-overlay"><div className="spinner" /></div>}

        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <input type="text" name="firstName" placeholder="First name" required autoComplete="given-name" />
              </div>
              <div className="form-group">
                <input type="text" name="lastName" placeholder="Last name" required autoComplete="family-name" />
              </div>
            </div>

            <div className="form-group">
              <input type="email" name="email" placeholder="Email address" required autoComplete="email" />
            </div>

            <div className="form-group password-group">
              <input type="password" name="password" placeholder="Password" required autoComplete="new-password" />
            </div>

            {mounted && process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && (
              <HCaptcha
                ref={captchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
                size="invisible"
                onVerify={onVerify}
                onExpire={() => captchaRef.current?.resetCaptcha?.()}
              />
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="signup-prompt">
              Already a member? <Link href="/">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
