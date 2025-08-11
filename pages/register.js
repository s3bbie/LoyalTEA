import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "../utils/supabaseClient";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null); // holds form values until captcha verifies
  const captchaRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const fullName = e.target.fullName.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    setPending({ fullName, email, password });
    setLoading(true);
    await captchaRef.current.execute(); // triggers onVerify
  };

  const onVerify = async (token) => {
    if (!pending) return;
    const { fullName, email, password } = pending;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        captchaToken: token,
      },
    });

    setLoading(false);
    if (error) {
      alert(error.message);
      captchaRef.current.reset();
      return;
    }
    router.push("/verify-email");
  };

  return (
    <>
      <Head><title>Register – LoyalTEA</title></Head>

      <div className="auth-container register">
        {loading && (
          <div className="loading-overlay"><div className="spinner" /></div>
        )}

        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <input type="text" name="fullName" placeholder="Full Name" required />
            </div>

            <div className="form-group">
              <input type="email" name="email" placeholder="Email address" required />
            </div>

            <div className="form-group password-group">
              <input type="password" name="password" placeholder="Password" required autoComplete="new-password" />
            </div>

            {/* Render captcha only on client to avoid SSR mismatch */}
            {mounted && (
              <HCaptcha
                ref={captchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
                size="invisible"
                onVerify={onVerify}
                onExpire={() => captchaRef.current.reset()}
              />
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="legal-text">
              By registering, you agree to the <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>.
            </p>

            <p className="signup-prompt">
              Already a member? <Link href="/">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
