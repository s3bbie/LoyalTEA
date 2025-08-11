// next.config.js
const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // ✅ only enable in prod deploys
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

module.exports = withPWA(nextConfig);
