# Equal World Shipping — Firebase Authentication

This package replaces the demo password check with Firebase Authentication.

## Setup
1. Create/open a Firebase project and register a Web App.
2. Copy the Firebase web configuration into `firebase-config.js`.
3. Enable Authentication → Sign-in method → Email/Password.
4. Create these Firebase Authentication users:
   - Equalworldshippingcompany6@gmail.com
   - johnsonmark42221@gmail.com
5. Set their passwords inside Firebase; do not store passwords in GitHub/source code.
6. Add your GitHub Pages domain to Firebase Authentication's authorized domains when required.
7. Upload the files to GitHub Pages.

The login uses Firebase's `signInWithEmailAndPassword` and the dashboard uses `onAuthStateChanged` to prevent unauthenticated access.

For production, shipment data should also be moved from browser storage to Cloud Firestore and protected with Firebase Security Rules.
