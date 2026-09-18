# Krishi Setu

Krishi Setu is a farm-to-market marketplace that lets farmers list crops and lets buyers make transparent purchase offers. It includes role-based accounts, live deal updates, location-based transport estimates, and contact sharing only after a deal is confirmed.

## What is included

- Farmer and buyer sign-up, sign-in, Google sign-in, and profile completion
- GPS-assisted profile location and a manual-address fallback
- Crop listings with harvest and delivery availability
- Buyer crop browsing and open purchase requests
- Transport estimates using the Haversine distance formula
- Offer, accept, decline, cancel, and delivery-completion workflows
- Role-specific dashboards with live Realtime Database counts
- Responsive desktop and mobile navigation

## Run locally

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Open the local address printed in the terminal.

Build a production bundle with:

```bash
npm run build
```

## Firebase setup

The app is configured for the `krishisetu-6e5c1` Firebase project in [src/firebase.js](src/firebase.js), including the Realtime Database URL `https://krishisetu-6e5c1-default-rtdb.firebaseio.com/`. Before using it in production, enable **Email/Password** and **Google** in Firebase Authentication, then create or open the project's Realtime Database. Add your deployment domain, such as `krishisetu17.netlify.app`, to Firebase Authentication's authorised domains list so the Google popup can complete successfully.

Publish the included Realtime Database access rules from `database.rules.json` in Firebase Console under **Realtime Database > Rules**. The app stores profiles, crops, buyer requests, and deals in Realtime Database while Firebase Authentication stores the email/password and Google accounts.

## Marketplace flow

1. A farmer creates an account, completes their profile, and lists a crop.
2. A buyer browses listed crops or posts a general crop request.
3. A buyer or farmer initiates an offer; the app calculates transport and the deal total.
4. The other party accepts or declines the offer.
5. Once confirmed, contact details become available and the buyer can mark the delivery complete.

## Notes

Transport estimates use straight-line distance and are intended for planning. For production routing, switch `USE_LIVE_ORS` in [src/utils/transport.js](src/utils/transport.js) to a secured server-side routing integration.
