# Equal World Shipping — Customer Website

This package contains the customer-facing Equal World Shipping website only.

## Included
- Customer homepage and shipment tracking
- Customer sign-up/sign-in
- Email verification and password reset
- Google/Apple customer authentication buttons
- Customer Live Chat
- Customer authentication gate
- Customer-facing CSS and JavaScript

## Separation
The Admin Control Center is intentionally NOT included in this package. Customers do not load `admin.html`, `admin.js`, `admin.css`, or admin invitation pages.

Customer authentication is independent of shipment tracking. A tracking code is required only when using the Track Shipment form.

## Backend
The customer frontend uses the public Supabase publishable configuration and the `equal-world-api-v2` Edge Function. Never put a Supabase service-role key in this repository.

## Deployment
Deploy this package as the customer website repository, for example:
`https://eqws-creator.github.io/Equal-World-shipping/`

Keep the admin application in its separate repository and deployment.

## Production authentication

See `AUTH_SETUP.md` for the required Supabase Site URL, redirect URLs, and email verification template settings. The live customer authentication flow uses the GitHub Pages production URL and does not use `localhost:3000`.
