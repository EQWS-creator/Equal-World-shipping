const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const PUBLIC_URL = "https://eqws-creator.github.io/Equal-World-shipping/";
const CONFIRM_URL = PUBLIC_URL + "confirm.html";
const AUTH_URL = PUBLIC_URL + "auth.html";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const authStatus = document.getElementById("auth-status");

function safe(value) { return String(value ?? "").replace(/[&<>"']/g, ""); }
function showAuth(message, ok = false) {
  authStatus.innerHTML = `<div class="auth-message ${ok ? "ok" : "error"}">${message}</div>`;
}
function setVerifyVisible(show) {
  document.getElementById("verify-email-form").classList.toggle("hidden", !show);
}
function normalizeEmail(value) { return value.trim().toLowerCase(); }

async function redirectIfSignedIn() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user?.email_confirmed_at) window.location.replace(PUBLIC_URL);
}

// Production customer authentication. Never use localhost for hosted redirects.
const authRedirectOptions = { emailRedirectTo: CONFIRM_URL };

// Signup is intentionally independent from shipment tracking.
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = normalizeEmail(document.getElementById("signup-email").value);
  const password = document.getElementById("signup-password").value;
  if (password.length < 8) return showAuth("Please use a password with at least 8 characters.");

  const button = e.submitter;
  button.disabled = true;
  try {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        ...authRedirectOptions
      }
    });

    if (error) {
      if (/already registered|already exists|user already registered/i.test(error.message || "")) {
        document.getElementById("verify-email").value = email;
        setVerifyVisible(true);
        return showAuth("This email already has an account. If it is not verified, send a new code below; otherwise sign in.");
      }
      return showAuth(error.message || "We could not create the account. Please try again.");
    }

    document.getElementById("verify-email").value = email;
    document.getElementById("verify-code").value = "";
    setVerifyVisible(true);
    showAuth(`Your verification email was sent to <b>${safe(email)}</b>. Use the newest code, or open the confirmation link from that email.`, true);
  } catch (err) {
    showAuth("We could not contact the account service. Check your internet connection and try again.");
  } finally {
    button.disabled = false;
  }
});

document.getElementById("verify-email-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = normalizeEmail(document.getElementById("verify-email").value);
  const token = document.getElementById("verify-code").value.trim();
  if (!/^\d{6,8}$/.test(token)) return showAuth("Enter the verification code from your latest email.");

  const button = e.submitter;
  button.disabled = true;
  try {
    // Supabase supports email signup OTP verification with type: "email".
    const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      if (/expired|invalid|incorrect|token/i.test(error.message || "")) {
        return showAuth("That code is expired or invalid. Tap ‘Send a new code’ and use the newest email.");
      }
      return showAuth(error.message || "We could not verify the email.");
    }

    showAuth(`Email verified successfully. Welcome, <b>${safe(data.user?.email || email)}</b>. Taking you to the website…`, true);
    setTimeout(() => window.location.replace(PUBLIC_URL), 500);
  } catch (err) {
    showAuth("We could not verify the code. Please try again.");
  } finally {
    button.disabled = false;
  }
});

document.getElementById("resend-code-button").addEventListener("click", async () => {
  const email = normalizeEmail(document.getElementById("verify-email").value);
  if (!email) return showAuth("Enter your email address first.");

  const button = document.getElementById("resend-code-button");
  button.disabled = true;
  try {
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
      options: authRedirectOptions
    });
    if (error) {
      if (/rate limit|too many|security/i.test(error.message || "")) {
        return showAuth("Please wait a little before requesting another code. Check your inbox and spam/junk first.");
      }
      return showAuth(error.message || "We could not resend the verification email. Please try again.");
    }
    document.getElementById("verify-code").value = "";
    showAuth(`A new verification email was sent to <b>${safe(email)}</b>. Use the newest code or confirmation link only.`, true);
  } catch (err) {
    showAuth("Resend could not connect to the account service. Check your internet connection and try again.");
  } finally {
    button.disabled = false;
  }
});

document.getElementById("back-to-auth").addEventListener("click", () => {
  setVerifyVisible(false);
  showAuth("Create an account or sign in to continue.");
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = normalizeEmail(document.getElementById("login-email").value);
  const password = document.getElementById("login-password").value;
  const button = e.submitter;
  button.disabled = true;
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return showAuth(error.message || "Sign in failed.");
    if (!data.user?.email_confirmed_at) {
      await supabaseClient.auth.signOut();
      document.getElementById("verify-email").value = email;
      setVerifyVisible(true);
      return showAuth("Please verify your email before entering the website.");
    }
    window.location.replace(PUBLIC_URL);
  } catch (err) {
    showAuth("We could not sign you in. Check your connection and try again.");
  } finally {
    button.disabled = false;
  }
});

document.getElementById("reset-button").addEventListener("click", async () => {
  const email = normalizeEmail(document.getElementById("login-email").value);
  if (!email) return showAuth("Enter your email address first, then tap Forgot password.");
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: AUTH_URL });
    showAuth(error ? error.message : "Password reset instructions have been sent to your email.", !error);
  } catch (err) {
    showAuth("We could not send the reset email. Please try again.");
  }
});

async function signInWithProvider(provider) {
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: PUBLIC_URL }
    });
    if (error) showAuth(error.message || `Could not start ${provider} sign-in.`);
  } catch (err) {
    showAuth(`Could not start ${provider} sign-in. Check your connection and provider setup.`);
  }
}

document.getElementById("google-auth-button").addEventListener("click", () => signInWithProvider("google"));
document.getElementById("apple-auth-button").addEventListener("click", () => signInWithProvider("apple"));

redirectIfSignedIn();
