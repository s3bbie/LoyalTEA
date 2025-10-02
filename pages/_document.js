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

  {/* ✅ OneSignal SDK (push notifications) */}
  <script
    src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
    defer
  ></script>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({
            appId: "b09b5b16-054b-4326-87f3-74ae720ac14b",
          });
        });
      `,
    }}
  />
</Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
