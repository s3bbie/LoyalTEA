// pages/staff/login.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../utils/authClient";

export default function StaffLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();
    const email = `${username}@loyaltea.com`; // adjust if staff emails differ

    // Try login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error || !data.user) {
      console.error("❌ Staff login failed:", error?.message);
      alert("Invalid username or PIN");
      setLoading(false);
      return;
    }

    // 🔎 Fetch profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("❌ Profile fetch error:", profileError);
      alert("Could not load profile");
      setLoading(false);
      return;
    }

    if (profile.role !== "staff" && profile.role !== "admin") {
      alert("❌ You do not have staff access");
      setLoading(false);
      return;
    }

    console.log("✅ Staff login success:", data);
    router.push("/staff/dashboard");
  };

  return (
    <>
      <Head>
        <title>Staff Login – LoyalTEA</title>
      </Head>

      {/* Top-right return button */}
      <div className="staff-login-btn">
        <Link href="/" className="btn-primary">
          Return to Main Login
        </Link>
      </div>

      <div className="auth-container login">
        <div className="form-wrapper">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="logo">
              <img src="/images/logo.png" alt="LoyalTEA Logo" />
            </div>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" required />
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN</label>
              <input type="password" id="pin" name="pin" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex justify-center items-center ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
