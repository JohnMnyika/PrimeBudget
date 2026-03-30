# Deployment Guide

## Firebase backend

```bash
cd firebase/functions
npm install
npm run build
cd ..
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

## Admin dashboard hosting

Static export is recommended.

1. Add `output: "export"` to Next.js config if you want a fully static build target.
2. Build the admin app:

```bash
cd admin-dashboard
npm install
npm run build
```

3. Deploy from the `firebase` directory:

```bash
cd ../firebase
firebase deploy --only hosting:admin
```

## Expo mobile builds

```bash
cd mobile-app
npm install
npx expo prebuild
eas build --platform android
eas build --platform ios
```

## Post-deploy checklist

1. Update Google Sign-In SHA fingerprints for Android.
2. Upload APNs key and FCM credentials for iOS notifications.
3. Configure M-Pesa production credentials as Firebase secrets.
4. Verify scheduled functions are enabled in the project’s billing plan.
