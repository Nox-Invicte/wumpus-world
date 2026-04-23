# Firebase Leaderboard Setup Guide

Follow these steps to set up Firebase for the Wumpus World leaderboard:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "wumpus-world")
4. Click through the setup (enable Google Analytics if desired)
5. Wait for the project to be created

## Step 2: Create a Firestore Database

1. In the Firebase Console, go to **Firestore Database** (in the left sidebar)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (you can update security rules later)
4. Select a location closest to you
5. Click **"Enable"** and wait for the database to initialize

## Step 3: Get Your Firebase Config

1. In the Firebase Console, go to **Project Settings** (⚙️ gear icon at the top)
2. Scroll down to **"Your apps"** section
3. Click on the **"</>"** (web) icon to create a web app
4. Enter an app name (e.g., "wumpus-world-web")
5. Click **"Register app"**
6. Copy the config object that appears - it should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIz...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123:web:abc..."
};
```

## Step 4: Add Environment Variables

1. In your project root, create or edit `.env.local` file
2. Add these lines with your values from Step 3:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc...
```

⚠️ **Important**: These values are public (NEXT_PUBLIC prefix), so don't worry about exposing them. They're only used for client-side Firebase initialization.

## Step 5: (Optional) Configure Firestore Security Rules

For production, update security rules to prevent misuse:

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document=**} {
      allow read: if true;
      allow write: if request.auth != null || request.size < 1KB;
    }
  }
}
```

This allows anyone to read leaderboard entries but restricts writes (optional auth check).

## Step 6: Restart Your Dev Server

```bash
npm run dev
```

Now when you play and complete a game:
- A **popup** will appear showing the leaderboard
- If you **won**, you'll see a "Submit Run" button to enter your name
- Submitting will save your score to Firebase
- The leaderboard will display the top 10 fastest completion times

## Troubleshooting

### "Cannot find module 'firebase'"
- Run `npm install firebase` again
- Restart your dev server

### Leaderboard not loading
- Check that your `.env.local` has all 6 environment variables
- Verify the values match exactly from Firebase Console
- Open browser DevTools Console (F12) to see any error messages
- **If you see `net::ERR_BLOCKED_BY_CLIENT` errors**: Tracking/privacy settings are blocking Firebase
  - **Chrome/Edge**: Settings → Privacy and security → Tracking prevention → Set to "Standard"
  - **Firefox**: Settings → Privacy & Security → Enhanced Tracking Protection → Set to "Standard"
  - **Safari**: Preferences → Privacy → Disable "Prevent cross-site tracking"
  - Or whitelist these domains: `firestore.googleapis.com`, `googleapis.com`, `gstatic.com`
  - Or test in incognito/private window where extensions are disabled

### Scores not saving
- Ensure Firestore database is created in Step 2
- Check that you're in **test mode** (allows writes) or update security rules
- Verify the `leaderboard` collection is created (it auto-creates on first write)

### Still not working?
- Check Firebase Console → Firestore → Data to see if collection exists
- Check browser console for detailed error messages
- Ensure `.env.local` is in the project root (not `src/`)
