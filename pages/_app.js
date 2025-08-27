import { useState } from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";

import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/home.css";
import "@/styles/rewards.css";
import "@/styles/settings.css";
import "@/styles/auth.css";

import BottomNav from "../components/BottomNav";
import SplashScreen from "../components/SplashScreen";

export default function App({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const hideNavOn = ["/", "/register", "/verify-email", "/login"];
  const showNav = !hideNavOn.includes(router.pathname);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <Component {...pageProps} />
      {showNav && <BottomNav />}
      <Analytics />
    </>
  );
}
