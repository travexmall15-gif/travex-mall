# ShopNekt Mobile App

React Native (Expo) app — shares Supabase client with web.

## Setup
```bash
cd mobile
npm install
npx expo start
```

## Build Android APK
```bash
npx eas build --platform android --profile preview
```

## Build iOS
```bash
npx eas build --platform ios --profile preview
```

## Structure
```
mobile/
  app/
    index.tsx          ← Splash + redirect
    (auth)/
      login.tsx        ← Email OTP login
    (tabs)/
      home.tsx         ← Home screen
      market.tsx       ← Business + Campus Market
      vybe.tsx         ← Social Vybe (WIP)
      orders.tsx       ← My Orders (WIP)
      menu.tsx         ← Menu + Settings (WIP)
  lib/
    supabase.ts        ← Shared Supabase client
    theme.ts           ← Design tokens (matches web)
  components/          ← Shared components
```

## Shared with Web
- Supabase URL + Key (same project)
- Design tokens (colors, radius)
- Business logic via Supabase queries
