/// <reference types="@capacitor/push-notifications" />
import type { CapacitorConfig } from '@capacitor/cli';

const liveUrl = (process.env.CAP_SERVER_URL || '')
  .trim()
  .replace(/\/$/, '');

const liveApiBaseUrl = (process.env.VITE_NATIVE_API_BASE_URL || 'https://engisuite.m2y.net/api')
  .trim()
  .replace(/\/$/, '');

const parsedHostname = (() => {
  try {
    return new URL(liveUrl || liveApiBaseUrl).hostname;
  } catch {
    return 'engisuite.m2y.net';
  }
})();

const config: CapacitorConfig = {
  appId: 'com.engisuite.analytics',
  appName: 'EngiSuite',
  webDir: 'dist',
  ...(liveUrl
    ? {
        server: {
          url: liveUrl,
          cleartext: liveUrl.startsWith('http://'),
          allowNavigation: [parsedHostname, '*.m2y.net'],
        },
      }
    : {}),
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    allowMixedContent: liveApiBaseUrl.startsWith('http://'),
    captureInput: true,
  },
};

export default config;
