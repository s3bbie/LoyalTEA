import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "../utils/supabaseClient";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null); // email/password to use after captcha
  const captchaRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    setPending({ email, password });
    setLoading(true);
    await captchaRef.current.execute(); // triggers onVerify
  };

  const onVerify = async (token) => {
    if (!pending) return;
    const { email, password } = pending;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: token },
    });

    setLoading(false);
    if (error) {
      alert(error.message);
      captchaRef.current.reset();
      return;
    }
    router.push("/home");
  };

  return (
    <>
      <Head><title>Login – LoyalTEA</title></Head>

      <div className="auth-container login">
        {loading && (
          <div className="loading-overlay"><div className="spinner" /></div>
        )}

        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <form id="loginForm" className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input type="email" id="email" name="email" placeholder="Email address" required />
            </div>

            <div className="form-group password-group">
              <input
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>

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
