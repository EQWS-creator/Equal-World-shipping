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
