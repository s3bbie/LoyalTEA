// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <Html lang="en">
      <Head>
  {/* ✅ Fonts */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossOrigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />

  {/* ✅ PWA manifest + theme color */}
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#EC008C" />


</Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
