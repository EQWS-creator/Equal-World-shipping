const API = "https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function api(path, options={}) {
  const r = await fetch(`${API}/${path}`, {headers: {"Content-Type":"application/json", ...(options.headers||{})}, ...options});
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

$("tracking-form").addEventListener("submit", async e => {
  e.preventDefault();
  const box = $("tracking-result");
  box.innerHTML = "<p>Looking up shipment…</p>";
  try {
    const d = await api(`track?code=${encodeURIComponent($("tracking-code").value.trim())}`);
    const s = d.shipment;
    box.innerHTML = `<div class="tracking-card"><h3>${esc(s.tracking_code)}</h3>
      <p><b>Status:</b> ${esc(s.status)}</p><p><b>Route:</b> ${esc(s.origin)} → ${esc(s.destination)}</p>
      <p><b>Service:</b> ${esc(s.service)}</p><p><b>Estimated delivery:</b> ${esc(s.estimated_delivery || "To be confirmed")}</p>
      <h4>Tracking events</h4>${(d.events||[]).map(x=>`<div class="event"><b>${esc(x.status)}</b> — ${esc(x.location)}<br><small>${esc(x.description||"")} · ${esc(x.event_time)}</small></div>`).join("")}</div>`;
  } catch(err) { box.innerHTML = `<p class="error">${esc(err.message)}</p>`; }
});

let chatSessionId = sessionStorage.getItem("ews_chat_session_id");
let visitorToken = sessionStorage.getItem("ews_visitor_token");
let pollTimer;

function renderMessage(m) {
  const mine = m.sender === "visitor";
  return `<div class="msg ${mine ? "mine" : "agent"}"><span>${esc(m.message)}</span><small>${new Date(m.sent_at).toLocaleString()}</small></div>`;
}
async function loadChat() {
  if (!chatSessionId || !visitorToken) return;
  try {
    const d = await api(`chat_messages?session_id=${encodeURIComponent(chatSessionId)}`, {headers:{Authorization:`Bearer ${visitorToken}`}});
    $("chat-messages").innerHTML = (d.messages||[]).map(renderMessage).join("");
    $("chat-messages").scrollTop = $("chat-messages").scrollHeight;
  } catch {}
}
$("chat-toggle").onclick = () => { $("chat-panel").hidden = false; $("chat-toggle").style.display="none"; loadChat(); };
$("chat-close").onclick = () => { $("chat-panel").hidden = true; $("chat-toggle").style.display="block"; };

if (chatSessionId && visitorToken) {
  $("chat-start-form").hidden = true; $("chat-message-form").hidden = false;
  pollTimer = setInterval(loadChat, 5000);
}

$("chat-start-form").addEventListener("submit", async e => {
  e.preventDefault();
  $("chat-status").textContent = "Starting secure chat…";
  try {
    const d = await api("chat_start", {method:"POST", body:JSON.stringify({name:$("chat-name").value.trim(), email:$("chat-email").value.trim()})});
    chatSessionId = d.session_id; visitorToken = d.visitor_token;
    sessionStorage.setItem("ews_chat_session_id", chatSessionId);
    sessionStorage.setItem("ews_visitor_token", visitorToken);
    $("chat-start-form").hidden = true; $("chat-message-form").hidden = false;
    $("chat-status").textContent = "Connected to support";
    await loadChat();
    clearInterval(pollTimer); pollTimer = setInterval(loadChat, 5000);
  } catch(err) { $("chat-status").textContent = err.message; }
});

$("chat-message-form").addEventListener("submit", async e => {
  e.preventDefault();
  const input = $("chat-message");
  const message = input.value.trim(); if (!message) return;
  try {
    await api("chat_message", {method:"POST", headers:{Authorization:`Bearer ${visitorToken}`}, body:JSON.stringify({session_id:chatSessionId, message})});
    input.value = ""; await loadChat();
  } catch(err) { $("chat-status").textContent = err.message; }
});
