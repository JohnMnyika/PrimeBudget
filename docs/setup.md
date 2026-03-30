# Setup Guide

## 1. Create Firebase project

1. Create a Firebase project and enable Authentication, Firestore, Functions, Cloud Messaging, and Storage.
2. Enable providers:
   - Email/Password
   - Google
3. Create Firestore in production mode.
4. Create a web app for the mobile Expo client and another for the admin dashboard.

## 2. Configure environment files

1. Copy `mobile-app/.env.example` to `mobile-app/.env`.
2. Copy `admin-dashboard/.env.example` to `admin-dashboard/.env.local`.
3. Replace `firebase/.firebaserc` placeholders with your Firebase project ID.
4. Replace the M-Pesa callback host in [index.ts](/home/spike/Desktop/Projects/PrimeBudget/firebase/functions/src/index.ts) with your deployed Cloud Functions URL.

## 3. Install dependencies

```bash
cd mobile-app && npm install
cd ../admin-dashboard && npm install
cd ../firebase/functions && npm install
```

## 4. Seed sample data

Authenticate with Google Cloud ADC, then run:

```bash
cd firebase/sample-data
node seed.mjs
```

## 5. Local development

```bash
cd mobile-app && npm run start
cd admin-dashboard && npm run dev
cd firebase/functions && npm run build
```

## 6. Firebase Auth admin access

1. Add approved admin emails to `NEXT_PUBLIC_ADMIN_EMAILS`.
2. After first sign-in, call the `promoteAdmin` callable from an existing admin or set the custom claim with Firebase Admin SDK.

