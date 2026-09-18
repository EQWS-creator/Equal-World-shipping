# Equal World Shipping — Production Customer Authentication Setup

The customer authentication code is configured for the live GitHub Pages site:

`https://eqws-creator.github.io/Equal-World-shipping/`

The previous `localhost:3000` redirect must not be used for the production customer website.

## 1. Supabase URL Configuration

In Supabase Dashboard, open:

**Authentication → URL Configuration**

Set **Site URL** to:

`https://eqws-creator.github.io/Equal-World-shipping/`

Add these exact **Redirect URLs**:

`https://eqws-creator.github.io/Equal-World-shipping/confirm.html`

`https://eqws-creator.github.io/Equal-World-shipping/auth.html`

`https://eqws-creator.github.io/Equal-World-shipping/`

You can keep `http://localhost:3000/**` only if you still use a local development server. It is not required for the live site.

## 2. Email confirmation

The customer code sends signup and resend requests to the production confirmation page:

`https://eqws-creator.github.io/Equal-World-shipping/confirm.html`

The code also supports the six/eight digit email OTP flow using Supabase `verifyOtp({ email, token, type: "email" })`.

If you want the email itself to show a verification code, edit the Supabase **Magic Link / OTP** email template to include:

`{{ .Token }}`

For a normal clickable confirmation link, the standard `{{ .ConfirmationURL }}` template is also supported by `confirm.html`.

If the email template contains a custom confirmation link, make sure its redirect target uses the production URL rather than localhost.

## 3. Important testing rule

After changing the Supabase URL configuration, create a **new verification email**. Do not reuse an older email that was generated with `localhost:3000`.

## 4. What was fixed in this package

- Removed production authentication redirects to localhost.
- Signup verification redirects to `confirm.html` on GitHub Pages.
- Resend verification uses the same production redirect.
- Added a production confirmation page that handles standard Supabase confirmation redirects and token-hash links.
- Preserved email OTP verification.
- Preserved password reset and Google/Apple sign-in redirect behavior.
- Customer authentication remains completely separate from shipment tracking and Live Chat.

## 5. Security

Only the Supabase publishable browser key is used in the frontend. Never put a Supabase secret/service-role key in these customer files.
