# Equal World Shipping Company

Updated GitHub Pages frontend with live shipment tracking and customer live chat.

## Connected backend
Supabase Edge Function:
`https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2`

The frontend uses the public API endpoint only. Supabase service-role/secret keys are not included in this project.

## Live chat
Visitors click the floating 💬 button, enter their name and email, and can send messages. The page checks for new support replies every 5 seconds.

The existing Supabase backend stores chat sessions and messages.

## Tracking
The tracking form now reads shipment records from the Supabase backend rather than the old demo JavaScript object.

Demo tracking code currently seeded in the database:
`SWC123456789`

## Third-party links
- Google Maps links open location searches in Google Maps.
- Telegram opens the company's Telegram contact.
- Email uses a mailto link.

## Deployment
This project remains compatible with GitHub Pages because the frontend is plain HTML/CSS/JavaScript.

Important: before treating the chat as production-grade, secure the visitor chat session with a signed visitor token on the backend and restrict CORS to the deployed site origin. Resend remains in development mode until a verified sending domain/address is configured.


### Important separation
Customer registration and sign-in are independent from shipment tracking. Only the Track Shipment form reads a tracking code. Sign-in uses email and password only; the customer auth code never reads or submits the tracking-number field.


## Testimonials and trust section
The homepage now includes a customer-experience section with shipment tracking, live support, and customer-account trust points. The testimonial cards are explicitly labeled as sample feedback so they are not presented as verified customer reviews. Replace them with genuine customer feedback as you collect it.


## Authentication and live-chat fix
This version separates all three workflows:
1. Shipment tracking — uses a tracking number only in the Track Shipment form.
2. Customer authentication — email/password, Google OAuth, or Apple OAuth. No tracking number is read or required.
3. Live Chat — name and email start the chat; the secure visitor token returned by the Edge Function is stored and sent for subsequent chat requests.

### Google and Apple setup
The website buttons are included, but OAuth providers must be enabled/configured in Supabase Authentication before they can complete sign-in.

- Google: configure a Google OAuth Web client in Google Cloud and add the Supabase callback URL shown in the Supabase Google provider settings. Add the GitHub Pages site URL to the allowed origins/redirect URLs as appropriate.
- Apple: configure Sign in with Apple in Apple Developer, create the required Services ID/key for web OAuth, and add the Supabase callback URL shown in the Supabase Apple provider settings.
- Supabase Auth Redirect URLs must allow:
  `https://eqws-creator.github.io/Equal-World-shipping/`

Do not put Google client secrets, Apple private keys, Supabase service-role keys, Resend API keys, or AI API keys in this static website.


## Email verification code
The customer registration flow now asks for a 6-digit email verification code and includes a code entry screen plus resend-code action. The code is verified with Supabase Auth `verifyOtp`.

### Required Supabase Auth email-template setting
For Supabase to send a code instead of only a confirmation link, edit the **Confirm signup** email template in Supabase Auth and include `{{ .Token }}` in the email body. Supabase documents `{{ .Token }}` as the 6-digit OTP used for email verification. Also ensure the project's Auth email provider is configured and the GitHub Pages URL is in the Auth redirect allow list.

The website itself does not contain an email secret. Do not place Resend API keys or Supabase service-role keys in frontend files.


## Smoother account creation
The signup flow now:
- normalizes email addresses to lowercase;
- does not ask for or use a tracking code;
- shows a dedicated 6-digit verification step;
- uses Supabase's signup-email resend flow rather than creating a separate OTP login session;
- explains duplicate-account, invalid/expired-code, and rate-limit situations in customer-friendly language;
- tells customers to check spam/junk folders;
- keeps Google and Apple OAuth separate from email/password verification.

For production reliability, configure Supabase's Auth email provider/SMTP and signup email template, and add the exact GitHub Pages URL to the Supabase Auth redirect allow list. Hosted Supabase projects require email confirmation by default, and redirect URLs must be configured for confirmation redirects.

## Customer access gate and email verification

The public homepage is now protected by customer authentication. Visitors are sent to `auth.html` first and must sign in with a verified customer account before the homepage loads. Shipment tracking remains separate from account authentication and does not supply or request a tracking code during signup/sign-in.

The signup flow uses the Supabase email OTP/code verification flow. To avoid expired confirmation links, configure the Supabase **Confirm signup** email template to prominently provide `{{ .Token }}` and instruct the customer to enter that code on `auth.html`. Supabase documents `{{ .Token }}` as the one-time password and recommends OTP as a way to avoid email-link prefetch/expiry problems. See the official Supabase Email Templates and Redirect URLs documentation.

Also make sure the production site URL and redirect URLs include:
- `https://eqws-creator.github.io/Equal-World-shipping/`
- `https://eqws-creator.github.io/Equal-World-shipping/auth.html`

The frontend uses the Supabase publishable key only. Service-role secrets must never be placed in GitHub Pages files.

## Admin messages, notifications and invitations

The Admin Control Center now includes:

- **Messages** — customer live-chat inbox with conversation history and agent replies.
- **Notifications** — unread/read activity for new chats, shipment creation/updates, tracking events and admin invitations.
- **Invite people** — invite trusted teammates to create their own separate admin account. Invitations expire after 48 hours.
- **Separate admin authentication** — admin access remains independent from customer accounts and shipment tracking.

The backend uses the Supabase Edge Function `equal-world-api-v2`. Admin-only operations require the signed admin session token. Service-role/secret credentials remain server-side.

### Invite email delivery

The invite flow attempts to send an email through Resend when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured in the Edge Function. Because this project has been kept in Resend development mode, production delivery may require a verified sending domain/address. If delivery is unavailable, the dashboard returns the generated invitation link so the administrator can use it manually.

### New database tables

- `public.admin_notifications`
- `public.admin_invites`

Both tables have RLS enabled and public `anon`/`authenticated` access revoked. They are accessed through the protected Edge Function.


## Admin dashboard access

The Admin Control Center is a separate entry point at `admin.html`. It does not use the customer tracking form and never asks an administrator for a shipment tracking code to sign in. Tracking codes are used only for shipment lookup/management inside the Shipments area.

If the live GitHub Pages site still shows a tracking-code prompt before the admin login, deploy the updated `admin.html` and `auth.html` from this ZIP and open the direct `admin.html` page.

## Live Chat + Admin Messages
The floating Live Chat button is connected to the Admin Dashboard Messages inbox. Customer conversations are separate per visitor, while admins see them together in the shared Messages inbox. Customer chat refreshes every 3 seconds and the admin inbox refreshes every 4 seconds. See `LIVE_CHAT_SETUP.md`.
