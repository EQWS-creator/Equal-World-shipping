# Equal World Shipping — Admin Dashboard

## Included
- Admin login screen
- Dashboard statistics
- Add, edit and delete shipments
- Search shipments
- Customer summary
- Responsive layout
- Demo shipment records including EWS100001 and EWS100002

## Demo login
Email: admin@equalworldshipping.com
Password: Admin123!

## Important
This package uses browser localStorage/sessionStorage as a demo-only data layer. It is NOT a secure production authentication or database system.

For a production deployment, replace the demo login with Firebase Authentication (or another server-side authentication service), and replace localStorage shipment storage with a secured database/API. Do not store real administrator passwords in JavaScript.

## Deployment
Upload `index.html`, `dashboard.html`, `style.css`, `app.js`, and this README to the same GitHub Pages site. Open `index.html` to sign in.

## Connecting to your public tracking page
Your public tracking page should query the same backend database/API for real shipment records. This demo package intentionally does not expose localStorage records across devices or users.
