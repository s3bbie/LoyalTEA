import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function StaffLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      setLoading(false);

      if (!res.ok) {
        const { error } = await res.json();
        alert(error || "Login failed");
        return;
      }

      const { user } = await res.json();

      if (user.role === "staff") {
        router.push("/staff/dashboard");
      } else {
        alert("You don’t have staff access.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Staff Login – LoyalTEA</title>
      </Head>
      <div className="auth-container login">
        <div className="form-wrapper">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
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
        </div>
      </div>
    </>
  );
}
