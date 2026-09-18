const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const AUTH_URL = "https://eqws-creator.github.io/Equal-World-shipping/auth.html";
const supabaseGate = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

(async () => {
  const { data } = await supabaseGate.auth.getSession();
  if (!data.session || !data.session.user?.email_confirmed_at) {
    await supabaseGate.auth.signOut();
    window.location.replace(AUTH_URL);
    return;
  }
  const logout = document.getElementById('logout-button');
  if (logout) {
    logout.addEventListener('click', async () => {
      await supabaseGate.auth.signOut();
      window.location.replace(AUTH_URL);
    });
  }
})();
