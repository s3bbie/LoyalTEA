// pages/register.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/authClient"; // ✅ import client

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

    // Call API to create account
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert(error || "Registration failed");
      setLoading(false);
      return;
    }

    // ✅ Auto-login after successful registration
    const email = `${username}@loyaltea.com`; // must match what API creates
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    setLoading(false);

    if (loginError) {
      alert("Account created but login failed: " + loginError.message);
      router.push("/login"); // send back to login
    } else {
      router.push("/home"); // success
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
              Already a member? <Link href="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
