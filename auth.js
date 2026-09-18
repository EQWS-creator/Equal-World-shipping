const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const authStatus = document.getElementById("auth-status");

function showAuth(message, ok = false) {
  authStatus.innerHTML = `<div class="auth-message ${ok ? "ok" : "error"}">${message}</div>`;
}

async function refreshAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    showAuth(
      `Signed in as <b>${String(session.user.email || "").replace(/[&<>"']/g, "")}</b> · ` +
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

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: "https://eqws-creator.github.io/Equal-World-shipping/"
    }
  });

  if (error) {
    showAuth(error.message);
    return;
  }

  showAuth(
    `Registration started for <b>${email.replace(/[&<>"']/g, "")}</b>. ` +
    `Check your inbox and click the verification link before signing in.`,
    true
  );
  e.target.reset();
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // IMPORTANT: login uses only email + password.
  // It never reads, validates, or submits the shipment tracking field.
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
    `Welcome back, <b>${String(data.user.email || "").replace(/[&<>"']/g, "")}</b>. ` +
    `Your verified account is active.`,
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
    redirectTo: "https://eqws-creator.github.io/Equal-World-shipping/#account"
  });

  showAuth(
    error ? error.message : "Password reset instructions have been sent to your email.",
    !error
  );
});

supabaseClient.auth.onAuthStateChange(() => refreshAuth());
refreshAuth();
