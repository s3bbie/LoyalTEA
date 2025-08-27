// pages/_app.js
import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/home.css";
import "@/styles/rewards.css";
import "@/styles/settings.css";
import "@/styles/auth.css";
import "@/styles/loading.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BottomNav from "../components/BottomNav";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Hide nav on login/register/etc
  const hideNavOn = ["/", "/register", "/verify-email", "/login"];
  const showNav = !hideNavOn.includes(router.pathname);

  // Simple loading splash with logo
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // show logo for 1.5s
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/images/logo.png" alt="LoyalTEA Logo" className="loading-logo" />
      </div>
    );
  }

  return (
    <>
      <Component {...pageProps} />
      {showNav && <BottomNav />}
      <Analytics />
    </>
  );
}
