import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function Splash() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  // ✅ If already logged in, skip splash
  useEffect(() => {
    if (isLoading) return; // wait until auth state is loaded
    if (session) {
      router.replace("/home");
    }
  }, [session, isLoading, router]);

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
