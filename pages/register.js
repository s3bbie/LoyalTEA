// pages/register.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import Script from "next/script";
import bcrypt from "bcryptjs";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();
    const pin2 = e.target.pin2.value.trim();
    const agreed = e.target.pinWarning.checked;

    if (!agreed) {
      alert("You must confirm the PIN warning before registering.");
      setLoading(false);
      return;
    }

    if (pin !== pin2) {
      alert("Pins do not match!");
      setLoading(false);
      return;
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      alert("Username already taken.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("users").insert([
      {
        username,
        pin_hash: pinHash,
        stamp_count: 0,
      },
    ]);

    setLoading(false);
    if (error) {
      alert(error.message || "Registration failed");
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <Head><title>Register – LoyalTEA</title></Head>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}`} />

      <div className="auth-container register">
        {loading && <div className="loading-overlay"><div className="spinner" /></div>}

        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="username">Desired Username</label>
              <input type="text" id="username" name="username" required />
            </div>

            <div className="form-group">
              <label htmlFor="pin">Desired PIN</label>
              <input type="password" id="pin" name="pin" required />
            </div>

            <div className="form-group">
              <label htmlFor="pin2">Retype PIN</label>
              <input type="password" id="pin2" name="pin2" required />
            </div>

            {/* Warning box */}
            <div className="pin-warning-box">
              <label htmlFor="pinWarning">
                <input type="checkbox" id="pinWarning" name="pinWarning" required />
                <span>
                  <strong>⚠️ Important:</strong> Your PIN <b>cannot</b> be recovered.  
                  If you forget it, you’ll need to create a new account.
                </span>
              </label>
            </div>

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
