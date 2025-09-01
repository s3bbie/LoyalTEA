import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";



export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  const username = e.target.username.value.trim();
  const pin = e.target.pin.value.trim();

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

  router.push("/home");
};


  return (
<>
  <Head><title>Login – LoyalTEA</title></Head>

  {/* Top-right staff login button */}
  <div className="staff-login-btn">
    <Link href="/staff/login" className="btn-primary">Staff Login</Link>
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
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>

        <div className="form-group">
          <label htmlFor="pin">PIN</label>
          <input type="password" id="pin" name="pin" required />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
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
