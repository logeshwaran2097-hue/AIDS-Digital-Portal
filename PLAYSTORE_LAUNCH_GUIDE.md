# 🚀 Google Play Store Release & Android Deployment Dossier
**V.S.B. Engineering College — Department of Artificial Intelligence & Data Science**  
**Package Identifier:** `in.edu.vsb.aidsportal` · **Version:** `1.0.0 (Build 1)`

---

## 📱 1. Instant Mobile Installation (PWA / Chrome on Android)
The application is already running as a verified Progressive Web App (PWA) with full service worker caching and offline capabilities:
1. Open Chrome or Edge on any Android mobile device and visit the portal URL.
2. Tap the prompt **"Install VSB AI & DS App"** or select **"Add to Home screen"** from the browser menu (⋮).
3. The app installs with a native Android icon (`icon-512.png`), full-screen standalone display, and official splash screen.

---

## 📦 2. Native Android Studio Project (`/android`)
A complete native Android package is ready in the [`d:/app/android`](file:///d:/app/android) folder:
* **Package Name**: `in.edu.vsb.aidsportal`
* **Target SDK**: Android 14 (API Level 34) · **Min SDK**: Android 5.0 (API Level 22)
* **Main Activity**: [`android/app/src/main/java/in/edu/vsb/aidsportal/MainActivity.java`](file:///d:/app/android/app/src/main/java/in/edu/vsb/aidsportal/MainActivity.java)
* **Manifest**: [`android/app/src/main/AndroidManifest.xml`](file:///d:/app/android/app/src/main/AndroidManifest.xml)

### 🛠️ Building APK / AAB Bundle via Android Studio / Gradle:
```bash
# 1. Open the /android folder in Android Studio
# 2. Build Debug APK:
./gradlew assembleDebug

# 3. Build Signed Production Android App Bundle (.aab) for Google Play Console:
./gradlew bundleRelease
```
The output `.aab` file will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🌐 3. Trusted Web Activity (TWA) with Bubblewrap / Google Play
To publish directly to Google Play Console using Google's official Bubblewrap CLI:
```bash
# 1. Install Google Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize TWA from Web Manifest
bubblewrap init --manifest="http://localhost:3001/manifest.json"

# 3. Build signed Play Store package (.aab)
bubblewrap build
```

---

## 📋 4. Google Play Console Listing Metadata
When uploading to the [Google Play Console](https://play.google.com/console):

* **App Title**: `VSB AI & DS Digital Portal`
* **Short Description**: `Official Academic & AI Department Portal for V.S.B. Engineering College.`
* **Full Description**:  
  `Comprehensive digital academic governance portal for the Department of Artificial Intelligence & Data Science at V.S.B. Engineering College, Karur, Tamil Nadu. Features 4-tier role-based access for Students, Faculty, HOD, and Super Administrators with live attendance tracking, Regulation 2021 syllabi, question papers bank, capstone research hub, and vector PDF certificates.`
* **Category**: `Education / Productivity`
* **Content Rating**: `Everyone (All ages)`
* **Primary Language**: `English (India)`
* **Target Audience**: `College Students, Teaching Faculty & Academic Administrators`
* **Privacy Policy URL**: `https://vsb-aids.vercel.app/privacy-policy`
* **Support Email**: `lonelyboy44y@gmail.com`
