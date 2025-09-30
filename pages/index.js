import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/authClient";

export default function Splash() {
  const router = useRouter();

  // ✅ If already logged in, skip splash
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/home");
      }
    });
  }, [router]);

  return (
    <>
      <Head><title>Welcome – LoyalTEA</title></Head>

      <div className="splash-container">
        <div className="splash-content">
          <div className="logo">
            <img src="/images/logo.png" alt="LoyalTEA Logo" />
          </div>

          <h1 className="splash-title">Welcome =)</h1>
          <p className="splash-subtitle">
            Collect stamps. Earn rewards. Drink sustainably.
          </p>

           {/* Illustration placeholder – replace with SVG/PNG */}
          <div className="splash-illustration">
            <img src="/images/coffee_team.svg" alt="Illustration" />
          </div>

          <div className="splash-buttons">
            <Link href="/register" className="btn-primary">Create Account</Link>
            <Link href="/login" className="btn-secondary">Log In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
