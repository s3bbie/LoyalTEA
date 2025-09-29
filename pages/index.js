// pages/login.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🚀 handleLogin triggered"); // debug

    setLoading(true);

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();
    console.log("Submitting credentials:", { username, pin }); // debug

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      console.log("Response status:", res.status); // debug

      if (!res.ok) {
        const { error } = await res.json();
        console.error("❌ Login failed:", error); // debug
        alert(error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("✅ Login success:", data); // debug

      router.push("/home");
    } catch (err) {
      console.error("🔥 Unexpected error in handleLogin:", err);
      alert("Something went wrong. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login – LoyalTEA</title>
      </Head>

      {/* Top-right staff login button */}
      <div className="staff-login-btn">
        <Link href="/staff/login" className="btn-primary">
          Staff Only
        </Link>
      </div>

      <div className="auth-container login">
        <div className="form-wrapper">
          <div className="flex justify-center">
            <div className="logo">
              <img src="/images/logo.png" alt="LoyalTEA Logo" />
            </div>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault(); // ✅ stops default page reload
              handleLogin(e);
            }}
            action="javascript:void(0);" // ✅ safety net
          >
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" required />
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN</label>
              <input type="password" id="pin" name="pin" required />
            </div>

            {/* Button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex justify-center items-center ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="signup-prompt">
            Not a member? <Link href="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}
