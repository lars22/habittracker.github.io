# My Habits – Native iOS & Android App (Expo / React Native)

A native mobile Habit Tracker & Pomodoro Focus Timer built with React Native, Expo, and Supabase.

---

## 🚀 Quick Start (In 2 Minutes)

### 1. Install Dependencies
```bash
cd expo-app
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Open on your Phone
1. Install **Expo Go** from the Apple App Store (iOS) or Google Play Store (Android).
2. Scan the QR code displayed in your terminal with your iPhone Camera or the Expo Go app.
3. The app loads instantly on your phone with live-reload support!

---

## 📱 Features Included

- **Native Habit Tracking**: Smooth native list, week dot matrix, and streak calculation (flame badge).
- **Haptic Feedback**: Apple Taptic Engine feedback when checking off habits (`expo-haptics`).
- **Pomodoro Focus Timer**: Complete with circular progress ring, audio chimes (`expo-av`), custom time stepper (+5/-5 min), and presets.
- **Supabase Cloud Sync**: Instant persistent synchronization for habits, completions, and user accounts.
- **Custom App Icon**: Tailored iOS app icon and splash screen located in `./assets`.

---

## 🛠 Creating a Standalone iOS App (.ipa / TestFlight)

To build a standalone iOS app or submit to TestFlight:

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure & Build for iOS
eas build --platform ios
```
