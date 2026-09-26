import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob';
import {
  AppUpdate,
  AppUpdateAvailability,
  FlexibleUpdateInstallStatus,
} from '@capawesome/capacitor-app-update';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

const ADMOB_BANNER_ID = (
  import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-7305205048390136/5344839989'
).trim();
const ADMOB_INTERSTITIAL_ID = (
  import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-7305205048390136/2664602684'
).trim();
const NOTIFICATION_CHANNEL_ID = 'engisuite-updates';
const WELCOME_NOTIFICATION_KEY = 'engisuite_release_notification_sent';

let bootstrapPromise = null;
let pushListenersRegistered = false;
let interstitialPrepared = false;
let interstitialDisplayed = false;
let interstitialScheduled = false;

const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  Capacitor.isNativePlatform?.() &&
  Capacitor.getPlatform() === 'android';

const log = (...args) => console.info('[EngiSuite Mobile]', ...args);

async function requestNotificationPermissions() {
  try {
    const localPermission = await LocalNotifications.checkPermissions();
    if (localPermission.display === 'prompt') {
      await LocalNotifications.requestPermissions();
    }
  } catch (error) {
    log('Local notification permission check skipped.', error);
  }

  try {
    let pushPermission = await PushNotifications.checkPermissions();
    if (pushPermission.receive === 'prompt') {
      pushPermission = await PushNotifications.requestPermissions();
    }
    return pushPermission.receive === 'granted';
  } catch (error) {
    log('Push notification permission check skipped.', error);
    return false;
  }
}

async function createNotificationChannels() {
  const channel = {
    id: NOTIFICATION_CHANNEL_ID,
    name: 'EngiSuite Updates',
    description: 'App updates, release notices, and engineering alerts.',
    importance: 5,
    visibility: 1,
    vibration: true,
    lights: true,
  };

  await Promise.allSettled([
    LocalNotifications.createChannel(channel),
    PushNotifications.createChannel(channel),
  ]);
}

async function registerPushListeners() {
  if (pushListenersRegistered) return;
  pushListenersRegistered = true;

  await PushNotifications.addListener('registration', token => {
    try {
      localStorage.setItem('engisuite_push_token', token.value);
    } catch {
      // Ignore storage issues.
    }

    log('Push token registered:', token.value);
    window.dispatchEvent(
      new CustomEvent('engisuite:push-token', { detail: token.value }),
    );
  });

  await PushNotifications.addListener('registrationError', error => {
    console.error('[EngiSuite Mobile] Push registration error:', error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    log('Push notification received:', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', action => {
    const nextPath =
      action.notification?.data?.path ||
      action.notification?.data?.route ||
      action.notification?.link;

    if (!nextPath) return;

    if (/^https?:\/\//i.test(nextPath)) {
      window.location.href = nextPath;
      return;
    }

    window.location.assign(nextPath.startsWith('/') ? nextPath : `/${nextPath}`);
  });
}

async function registerForPushNotifications() {
  const granted = await requestNotificationPermissions();
  await registerPushListeners();

  if (!granted) {
    log('Push notifications are not granted yet.');
    return;
  }

  await PushNotifications.register();
}

async function scheduleWelcomeNotification() {
  try {
    if (localStorage.getItem(WELCOME_NOTIFICATION_KEY)) {
      return;
    }
  } catch {
    // Ignore storage issues.
  }

  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 10001,
          title: 'EngiSuite Android is ready',
          body: 'Release test build is connected to live data, ads, updates, and notifications.',
          schedule: { at: new Date(Date.now() + 15000) },
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      ],
    });

    localStorage.setItem(WELCOME_NOTIFICATION_KEY, '1');
  } catch (error) {
    log('Welcome notification skipped.', error);
  }
}

async function prepareInterstitialAd() {
  if (!ADMOB_INTERSTITIAL_ID) return;

  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
    });
    interstitialPrepared = true;
  } catch (error) {
    interstitialPrepared = false;
    console.error('[EngiSuite Mobile] Failed to prepare interstitial ad:', error);
  }
}

export async function showEngiSuiteInterstitialAd(force = false) {
  if (!isNativeAndroid() || !interstitialPrepared) return false;
  if (interstitialDisplayed && !force) return false;

  try {
    await AdMob.showInterstitial();
    interstitialDisplayed = true;
    interstitialPrepared = false;
    return true;
  } catch (error) {
    console.error('[EngiSuite Mobile] Failed to show interstitial ad:', error);
    return false;
  } finally {
    window.setTimeout(() => {
      interstitialDisplayed = false;
      void prepareInterstitialAd();
    }, 60000);
  }
}

async function setupAdMob() {
  if (!ADMOB_BANNER_ID && !ADMOB_INTERSTITIAL_ID) {
    log('AdMob IDs are missing; skipping ads setup.');
    return;
  }

  await AdMob.initialize({
    initializeForTesting: false,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    maxAdContentRating: MaxAdContentRating.Teen,
  });

  if (ADMOB_BANNER_ID) {
    await AdMob.showBanner({
      adId: ADMOB_BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
  }

  await prepareInterstitialAd();

  if (!interstitialScheduled) {
    interstitialScheduled = true;
    window.setTimeout(() => {
      void showEngiSuiteInterstitialAd();
    }, 25000);
  }
}

async function checkForInAppUpdates() {
  try {
    await AppUpdate.addListener('onFlexibleUpdateStateChange', async state => {
      if (
        state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED ||
        state.installStatus === FlexibleUpdateInstallStatus.INSTALLED
      ) {
        await AppUpdate.completeFlexibleUpdate();
      }
    });

    const info = await AppUpdate.getAppUpdateInfo();
    log('Play Store update info:', info);

    if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
      return;
    }

    if (info.immediateUpdateAllowed) {
      await AppUpdate.performImmediateUpdate();
      return;
    }

    if (info.flexibleUpdateAllowed) {
      await AppUpdate.startFlexibleUpdate();
    }
  } catch (error) {
    log('In-app update check skipped.', error);
  }
}

export async function initializeNativeMobileFeatures() {
  if (!isNativeAndroid()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await createNotificationChannels();
    await registerForPushNotifications();
    await scheduleWelcomeNotification();
    await setupAdMob();
    await checkForInAppUpdates();

    window.EngiSuiteMobile = {
      showInterstitialAd: () => showEngiSuiteInterstitialAd(true),
    };

    log('Native Android features initialized successfully.');
  })().catch(error => {
    console.error('[EngiSuite Mobile] Native initialization failed:', error);
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
