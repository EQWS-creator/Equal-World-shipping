const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const PUBLIC_URL = "https://eqws-creator.github.io/Equal-World-shipping/";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const authStatus = document.getElementById("auth-status");

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, "");
}

function showAuth(message, ok = false) {
  authStatus.innerHTML = `<div class="auth-message ${ok ? "ok" : "error"}">${message}</div>`;
}

async function refreshAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    showAuth(
      `Signed in as <b>${safe(session.user.email)}</b> · ` +
      `<button id="logout-button" class="link-button" type="button">Log out</button>`,
      true
    );
    document.getElementById("logout-button").onclick = async () => {
      await supabaseClient.auth.signOut();
      refreshAuth();
    };
  } else {
    showAuth("Not signed in. Create an account or sign in below.");
  }
}

// IMPORTANT: Authentication is completely independent from shipment tracking.
// This form never reads, validates, requires, or submits #trackingNumber.
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (password.length < 8) {
    showAuth("Please use a password with at least 8 characters.");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: PUBLIC_URL
    }
  });

  if (error) {
    showAuth(error.message);
    return;
  }

  showAuth(
    `Registration started for <b>${safe(email)}</b>. Check your inbox and click the verification link before signing in.`,
    true
  );
  e.target.reset();
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // IMPORTANT: Login uses only email + password. No tracking code is involved.
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showAuth(error.message);
    return;
  }

  if (!data.user?.email_confirmed_at) {
    await supabaseClient.auth.signOut();
    showAuth("Please verify your email address before signing in.");
    return;
  }

  showAuth(
    `Welcome back, <b>${safe(data.user.email)}</b>. Your verified account is active.`,
    true
  );
});

document.getElementById("reset-button").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();

  if (!email) {
    showAuth("Enter your email address first, then tap Forgot password.");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: PUBLIC_URL + "#account"
  });

  showAuth(
    error ? error.message : "Password reset instructions have been sent to your email.",
    !error
  );
});

async function signInWithProvider(provider) {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: PUBLIC_URL
    }
  });

  if (error) showAuth(error.message);
}

document.getElementById("google-auth-button").addEventListener("click", () => {
  signInWithProvider("google");
});

document.getElementById("apple-auth-button").addEventListener("click", () => {
  signInWithProvider("apple");
});

supabaseClient.auth.onAuthStateChange(() => refreshAuth());
refreshAuth();
