import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/home.css";
import "@/styles/rewards.css";
import "@/styles/settings.css";
import BottomNav from "../components/BottomNav";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideNavOn = ["/", "/register", "/verify-email"];
  const showNav = !hideNavOn.includes(router.pathname);

  return (
    <>
      <Script
        id="recaptcha-v3"
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}`}
        strategy="afterInteractive"
      />
      <Script id="recaptcha-sitekey" strategy="afterInteractive">
        {`window.RECAPTCHA_SITEKEY='${process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}'`}
      </Script>

      <Component {...pageProps} />
      {showNav && <BottomNav />}

      <Analytics />
    </>
  );
}

