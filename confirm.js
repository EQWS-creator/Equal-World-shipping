const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const statusEl = document.getElementById("confirm-status");
const button = document.getElementById("confirm-button");
const params = new URLSearchParams(window.location.search);
const tokenHash = params.get("token_hash");
const type = params.get("type") || "email";

function setStatus(message, ok = false) {
  statusEl.textContent = message;
  statusEl.className = ok ? "auth-message ok" : "auth-message";
}

button.addEventListener("click", async () => {
  if (!tokenHash) {
    setStatus("This confirmation link is missing its verification token. Please request a new verification email from the account section.");
    button.disabled = true;
    return;
  }

  button.disabled = true;
  button.textContent = "Confirming...";
  const { error } = await supabaseClient.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    setStatus("This confirmation link is invalid or has expired. Please request a new verification email and try again.");
    button.disabled = false;
    button.textContent = "Try Again";
    return;
  }

  setStatus("Your email has been verified successfully. You can now sign in to your Equal World Shipping account.", true);
  button.textContent = "Email Verified";
  setTimeout(() => { window.location.href = "./#account"; }, 1200);
});
