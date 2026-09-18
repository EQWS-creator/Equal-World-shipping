# Equal World Shipping

## Homepage live chat
The live chat is permanently integrated into `index.html` as a floating button and chat window. It uses the deployed Supabase Edge Function `equal-world-api-v2`.

The visitor receives a signed visitor token from `chat_start`; subsequent message requests use that token. No Supabase service-role key is placed in the frontend.

## GitHub Pages
Keep `logo.jpg` in the repository. Upload/replace the website files from this ZIP, then publish the repository with GitHub Pages.

## Tracking test
Use tracking code `SWC123456789`.

## Security
Do not put `SUPABASE_SERVICE_ROLE_KEY`, Resend API keys, or admin session secrets in browser JavaScript or GitHub Pages. Configure secrets server-side in Supabase.

## Resend
Resend remains suitable for development/testing until a verified sending domain is available.

## Google Maps
Use normal Google Maps links from shipment locations in the admin workflow. A Google Maps embed API key is not required for simple clickable map links.
