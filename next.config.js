const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
  buildExcludes: [/middleware-manifest\.json$/],
});

// ✅ Detect if we're building for Appflow (Capacitor)
//    We'll check for a custom ENV flag: BUILD_TARGET=mobile
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig = {
  reactStrictMode: true,

  // ✅ Only set static export for mobile builds
  ...(isMobileBuild
    ? {
        output: "export",
        distDir: "out",
      }
    : {
       
      }),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "private-state-token-issuance=(), private-state-token-redemption=()",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
