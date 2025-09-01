import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
<<<<<<< HEAD
        
=======
        <link
  href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
  rel="stylesheet"
/>
>>>>>>> 302e486 (Please update on Vercel)
        {isProd && <link rel="manifest" href="/manifest.json" />}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
