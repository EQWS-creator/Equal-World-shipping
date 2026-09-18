# Customer registration, login and verified email

This project uses Supabase Auth with email/password.

Supabase hosted projects require email confirmation by default. The signup flow sends a confirmation email and the login flow will not authenticate an unconfirmed account.

## Required Supabase configuration
In the Supabase dashboard for project EQWS_Project:
1. Auth → Providers → Email: ensure Email provider is enabled and email confirmations are enabled.
2. Auth → URL Configuration: set the Site URL to `https://eqws-creator.github.io/Equal-World-shipping/`.
3. Add that same URL to the allowed redirect URLs.
4. Configure an SMTP provider/custom SMTP for reliable production verification emails if needed. The default hosted email service has sending limits.

## What customers get
- Register with name, email and password.
- Verification email before first login.
- Login/logout.
- Forgot-password email.
- Session persists using Supabase Auth.
- No service-role or secret key is exposed to the browser.

The publishable key in auth.js is intended for frontend use; never replace it with a service-role/secret key.
