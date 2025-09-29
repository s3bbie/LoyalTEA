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
import StaffBottomNav from "../components/StaffBottomNav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// ✅ Supabase imports
import { supabase } from "../utils/authClient";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Pages where no nav should show at all
  const hideNavOn = ["/", "/register", "/verify-email", "/login", "/staff/login"];

  const isStaffPage = router.pathname.startsWith("/staff");
  const showNav = !hideNavOn.includes(router.pathname);

  // Simple loading splash with logo
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
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
    <SessionContextProvider supabaseClient={supabase}>
      <Component {...pageProps} />
      {showNav && (isStaffPage ? <StaffBottomNav /> : <BottomNav />)}
      <Analytics />
      <SpeedInsights />
    </SessionContextProvider>
  );
}
