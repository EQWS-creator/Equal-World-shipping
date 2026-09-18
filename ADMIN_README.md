# Equal World Shipping — Complete Admin Dashboard

This package adds a mobile-friendly, admin-only dashboard to the existing Equal World Shipping frontend.

## Connected backend
Supabase Edge Function:
https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2

The dashboard uses the existing custom admin authentication and does NOT contain a Supabase service-role key.

## Dashboard controls
- Admin login
- Shipment list/search
- Create shipments
- Edit shipment status and estimated delivery
- Add tracking events and locations
- Google Maps destination links
- Customer Live Chat session list
- Read customer messages
- Reply as support
- Dashboard statistics

## GitHub Pages
Add `admin.html`, `admin.js`, and `admin.css` to the repository. The dashboard will be available at:

`https://eqws-creator.github.io/Equal-World-shipping/admin.html`

## Important
Keep the existing `logo.jpg` in the repository if you have one. This ZIP does not include private server secrets.

The admin dashboard depends on the already-deployed `equal-world-api-v2` Edge Function and its configured admin credentials.
