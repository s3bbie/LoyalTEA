import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixelseb.loyaltea',
  appName: 'LoyalTEA',

  // 🚀 SSR app is served directly from Vercel
  server: {
    url: "https://loyaltea.vercel.app", // replace with your Vercel domain
    cleartext: false
  }
};

export default config;
