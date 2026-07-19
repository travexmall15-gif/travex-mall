# ShopNekt Mobile App

Native WebView app — loads shopnekt.vercel.app inside a native shell.

## Features
- ✅ Full website inside native app
- ✅ Splash screen (navy + ShopNekt logo)
- ✅ Android back button navigation
- ✅ Offline error page
- ✅ Camera + Location permissions
- ✅ File upload support
- ✅ Auto-detects it's running in app (`window.__SHOPNEKT_APP__`)

## Setup

```bash
cd mobile
npm install
npx expo start
```

Scan QR with **Expo Go** app to preview instantly.

## Build APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

APK inapatikana baada ya dakika 10-15. Download na install directly.

## Publish to Google Play

```bash
eas build --platform android --profile production
eas submit --platform android
```

## iOS (App Store)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```
