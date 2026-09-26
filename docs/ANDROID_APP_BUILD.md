# Android App Build Guide

This project now includes an Android wrapper under `frontend-react/android` using **Capacitor 7**.

## ✅ What is configured now

### Live production data
The Android app now uses the **bundled release UI** and fetches live API data from:

- `https://engisuite.m2y.net/api`

This is defined in `frontend-react/.env.android`.

### AdMob IDs added
- **App ID:** `ca-app-pub-7305205048390136~2636682520`
- **Banner:** `ca-app-pub-7305205048390136/5344839989`
- **Interstitial:** `ca-app-pub-7305205048390136/2664602684`

### Auto-update and notifications
- **Play Store in-app update checks** are enabled on app start.
- **Local test notification** is scheduled once on first Android launch.
- **Push notification support** is wired through Capacitor/Firebase.

> Push notifications need a real Firebase `google-services.json` file placed in `frontend-react/android/app/`.

---

## Prerequisites for emulator and release packaging

Install these on the build machine:

1. **JDK 17**
2. **Android Studio**
3. **Android SDK + Platform Tools + Emulator**
4. Set `JAVA_HOME`
5. Make sure `adb` is available in `PATH`

### Linux example

```bash
sudo apt update
sudo apt install openjdk-17-jdk adb
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Then create:

```text
frontend-react/android/local.properties
```

with:

```text
sdk.dir=/home/your-user/Android/Sdk
```

---

## Test on Android emulator first

From the project root:

```bash
cd "/home/meme/my apps/EngiSuite_node.js/engisuite-nodejs"
npm install
npm run android:doctor
npm run android:sync
npm run android:open
```

Then in **Android Studio**:

1. Open **Device Manager**
2. Start an emulator
3. Click **Run**

### Test release mode on emulator/device

```bash
npm run android:run:release
```

---

## Build release APK for testing

```bash
npm run android:apk
```

Expected output:

```text
frontend-react/android/app/build/outputs/apk/release/app-release.apk
```

## Build Play Store AAB

```bash
npm run android:aab
```

Expected output:

```text
frontend-react/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Release signing notes

For **local release testing**, the Gradle config falls back to the debug keystore automatically.

For **Google Play upload**, create:

- `frontend-react/android/keystore.properties`
- your real `.jks` keystore file

A template is included here:

- `frontend-react/android/keystore.properties.example`

You can also control Play Store versioning when building:

```bash
ANDROID_VERSION_CODE=2 ANDROID_VERSION_NAME=1.0.1 npm run android:apk
```

This is important for **auto-update detection** after new Google Play releases.

---

## Push notifications setup

To receive real user push notifications:

1. Create a Firebase project for package `com.engisuite.analytics`
2. Download `google-services.json`
3. Put it in:

```text
frontend-react/android/app/google-services.json
```

Without that file, release APK build can still work, but **FCM push delivery will not**.

---

## Current verification status

Verified in this workspace on **2026-04-05**:

- `npm run android:doctor` ✅
- `npm run android:init` ✅
- `npm run android:sync` ✅
- `npm run build:android` passes and targets the live production API ✅
- `npm run android:apk` now builds successfully and produces `frontend-react/android/app/build/outputs/apk/release/app-release.apk` ✅
- Release APK installed on emulator `emulator-5554` with `adb install -r` → `Success` ✅
- App launch verified on the emulator (`adb shell monkey -p com.engisuite.analytics -c android.intent.category.LAUNCHER 1`) ✅

> For Google Play production publishing, you should still replace the debug fallback signing with your real keystore and add `google-services.json` if you want live FCM push delivery.
