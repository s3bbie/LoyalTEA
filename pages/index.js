import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function Splash() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  // 🚦 Handle session check
  useEffect(() => {
    if (isLoading) return;        // wait until supabase finishes loading
    if (session) {
      router.replace("/home");    // only redirect if logged in
    }
  }, [session, isLoading, router]);

  // While loading, you can show a minimal splash/loading state
  if (isLoading) {
    return (
      <div className="splash-container">
        <div className="splash-content">
          <img src="/images/logo.png" alt="LoyalTEA Logo" className="loading-logo" />
          <p className="splash-subtitle">Checking session...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show splash page with login/register buttons
  if (!session) {
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

  // If session exists, redirect will already be in progress
  return null;
}
