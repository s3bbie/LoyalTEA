import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixelseb.loyaltea',
  appName: 'LoyalTEA',
  webDir: 'out', // ✅ matches your Next.js static export
  server: {
    androidScheme: 'https' // ✅ ensures secure requests on Android
  }
};

export default config;
