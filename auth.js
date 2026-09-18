const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const PUBLIC_URL = "https://eqws-creator.github.io/Equal-World-shipping/";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const authStatus = document.getElementById("auth-status");

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, "");
}
function showAuth(message, ok = false) {
  authStatus.innerHTML = `<div class="auth-message ${ok ? "ok" : "error"}">${message}</div>`;
}
function setVerifyVisible(show) {
  document.getElementById("verify-email-form").classList.toggle("hidden", !show);
}

async function refreshAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showAuth(`Signed in as <b>${safe(session.user.email)}</b> · <button id="logout-button" class="link-button" type="button">Log out</button>`, true);
    document.getElementById("logout-button").onclick = async () => {
      await supabaseClient.auth.signOut();
      refreshAuth();
    };
  } else {
    showAuth("Not signed in. Create an account or sign in below.");
  }
}

// Registration is completely independent from shipment tracking.
// It never reads or submits the tracking-number field.
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;
  if (password.length < 8) return showAuth("Please use a password with at least 8 characters.");

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: PUBLIC_URL }
  });

  if (error) {
    const msg = String(error.message || "");
    if (/already registered|already exists|user already registered/i.test(msg)) {
      document.getElementById("verify-email").value = email;
      setVerifyVisible(true);
      return showAuth("This email is already registered. If it is not verified yet, request a new verification code below. If you already verified it, use Sign In.", false);
    }
    return showAuth(msg);
  }

  document.getElementById("verify-email").value = email;
  document.getElementById("verify-code").value = "";
  setVerifyVisible(true);
  showAuth(`A 6-digit verification code was sent to <b>${safe(email)}</b>. Check your inbox and spam/junk folder, then enter the code below.`, true);
});

document.getElementById("verify-email-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("verify-email").value.trim();
  const token = document.getElementById("verify-code").value.trim();

  if (!/^\d{6}$/.test(token)) return showAuth("Enter the 6-digit verification code from your email.");

  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    const msg = String(error.message || "");
    if (/expired|invalid|incorrect/i.test(msg)) {
      return showAuth("That verification code is invalid or expired. Request a new code and try again.");
    }
    return showAuth(msg);
  }

  setVerifyVisible(false);
  showAuth(`Email verified successfully. Welcome, <b>${safe(data.user?.email || email)}</b>.`, true);
});

document.getElementById("resend-code-button").addEventListener("click", async () => {
  const email = document.getElementById("verify-email").value.trim();
  if (!email) return showAuth("Enter your email address first.");

  const { error } = await supabaseClient.auth.resend({
    type: "signup",
    email
  });
  if (error) {
    if (/rate limit|too many|security/i.test(error.message || "")) {
      return showAuth("Please wait a moment before requesting another code. Check your inbox and spam/junk folder first.");
    }
    return showAuth(error.message);
  }
  showAuth(`A new verification code was sent to <b>${safe(email)}</b>.`, true);
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return showAuth(error.message);

  if (!data.user?.email_confirmed_at) {
    await supabaseClient.auth.signOut();
    document.getElementById("verify-email").value = email;
    setVerifyVisible(true);
    return showAuth("Please verify your email with the 6-digit code before signing in.");
  }
  showAuth(`Welcome back, <b>${safe(data.user.email)}</b>. Your verified account is active.`, true);
});

document.getElementById("reset-button").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  if (!email) return showAuth("Enter your email address first, then tap Forgot password.");
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: PUBLIC_URL + "#account" });
  showAuth(error ? error.message : "Password reset instructions have been sent to your email.", !error);
});

async function signInWithProvider(provider) {
  const { error } = await supabaseClient.auth.signInWithOAuth({ provider, options: { redirectTo: PUBLIC_URL } });
  if (error) showAuth(error.message);
}
document.getElementById("google-auth-button").addEventListener("click", () => signInWithProvider("google"));
document.getElementById("apple-auth-button").addEventListener("click", () => signInWithProvider("apple"));
supabaseClient.auth.onAuthStateChange(() => refreshAuth());
refreshAuth();
