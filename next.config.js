const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

// 🔎 Import the analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// ⚡ Existing PWA setup
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd,
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'private-state-token-issuance=(), private-state-token-redemption=()',
          },
        ],
      },
    ];
  },
};

// ✅ Combine PWA + Analyzer
module.exports = withBundleAnalyzer(withPWA(nextConfig));
