import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixelseb.loyaltea',
  appName: 'LoyalTEA',
  webDir: '.next',

  // ✅ Point the native app to your deployed Vercel instance
  server: {
    url: "https://loyaltea.vercel.app", // 🔑 replace with your actual Vercel domain
    cleartext: false
  }
};

export default config;
