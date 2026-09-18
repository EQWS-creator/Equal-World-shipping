# Equal World Shipping — Friendly Admin Control Center

The admin dashboard is intentionally separate from customer accounts and shipment tracking.

## Admin flow
- Admin opens `admin.html`.
- Admin signs in with the dedicated admin email/password.
- No shipment tracking code is requested for admin login.
- The dashboard provides a friendly mobile-responsive overview, shipment management, shipment creation, Google Maps destination links, and customer live chat.

## Security
The browser only stores the short-lived admin session token returned by the Edge Function. Supabase service-role/secret keys must remain server-side and must never be added to frontend files.

The dashboard uses the existing `equal-world-api-v2` backend and its custom admin authentication.

## Friendly dashboard improvements
- Mobile navigation drawer
- Welcome/overview screen
- Quick actions
- Clear shipment/chat statistics
- Recent shipment and open-chat previews
- Better empty states and success messages
- Responsive shipment forms
- Easier customer chat layout
- Touch-friendly controls
- No tracking-code field in admin authentication

## Important
This ZIP updates the frontend dashboard. It does not automatically commit changes to GitHub. Upload the files to your repository and commit them on the `main` branch.
