import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

export default function StaffLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Only parse once
      const data = await res.json();
      console.log("✅ Staff login response:", data);

      const { user } = data;
      console.log("🔎 Role from server:", user?.role);

      if (!user || !user.role) {
        setError("Login failed: no role assigned.");
        return;
      }

      if (["staff", "admin"].includes(user.role)) {
        router.push("/staff/dashboard");
      } else {
        setError("You don’t have staff access.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Staff Login – LoyalTEA</title>
      </Head>

      <div className="user-login-btn">
        <Link href="/" className="btn-secondary">
          Back to User Login
        </Link>
      </div>

      <div className="auth-container login">
        <div className="form-wrapper">
          <div className="flex justify-center">
            <div className="logo">
              <img src="/images/logo.png" alt="LoyalTEA Logo" />
            </div>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Staff Username</label>
              <input type="text" id="username" name="username" required />
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN</label>
              <input type="password" id="pin" name="pin" required />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Staff Sign In"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </>
  );
}
