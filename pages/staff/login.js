// pages/staff/login.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error) {
      console.error("❌ Staff login failed:", error.message);
      alert(error.message);
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

      <div className="auth-container login">
        <div className="form-wrapper">
          {/* ✅ Logo restored */}
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
