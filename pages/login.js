import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../utils/authClient";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value.trim();
    const pin = e.target.pin.value.trim();
    const rememberMe = e.target.rememberMe.checked;

    const email = `${username}@loyaltea.com`; // must match registration

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      alert(error.message);
      setLoading(false);
      return;
    }

    // ✅ Control session persistence
    await supabase.auth.setSession(data.session, {
      persistSession: rememberMe, // true if remember me checked
    });

    console.log("✅ Login success:", data);
    router.push("/home");
  };

  return (
    <>
      <Head>
        <title>Login – LoyalTEA</title>
      </Head>



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

            {/* ✅ Inline Remember me row */}
            <div className="form-group remember-me-box">
  <label htmlFor="rememberMe">
    <input type="checkbox" id="rememberMe" name="rememberMe" />
    <span>Remember me</span>
  </label>
</div>


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

                {/* Top-right staff login button */}
      <div className="staff-login-btn">
        <Link href="/staff/login" className="btn-primary-staff">
          Login as Operator
        </Link>
      </div>
        </div>
      </div>
    </>
  );
}
