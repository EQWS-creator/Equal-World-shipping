const API="https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2";
const $=id=>document.getElementById(id);
let token=sessionStorage.getItem("eqws_admin_token");
let shipments=[],sessions=[],selectedSession=null;

async function api(action,payload={},auth=true){
  const headers={"Content-Type":"application/json"};
  if(auth&&token) headers.Authorization="Bearer "+token;
  const r=await fetch(API,{method:"POST",headers,body:JSON.stringify({action,...payload})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.error) throw new Error(d.error||"Request failed");
  return d;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2800)}
function showApp(){$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");loadAll()}
function showLogin(){$("appView").classList.add("hidden");$("loginView").classList.remove("hidden")}
function goTab(name){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.add("hidden"));
  $(name+"Tab").classList.remove("hidden");
  $("sidebar").classList.remove("open");
  if(name==="chat")loadChats();
  if(name==="overview"){renderOverview()}
}
async function login(e){
  e.preventDefault();$("loginError").textContent="";
  try{
    const d=await api("admin_login",{email:$("adminEmail").value.trim(),password:$("adminPassword").value},false);
    token=d.token;sessionStorage.setItem("eqws_admin_token",token);$("adminPassword").value="";showApp();
  }catch(x){$("loginError").textContent=x.message}
}
$("loginForm").addEventListener("submit",login);
$("logoutBtn").addEventListener("click",()=>{token=null;sessionStorage.removeItem("eqws_admin_token");showLogin();toast("You have been signed out.")});
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll("[data-tab-action]").forEach(b=>b.addEventListener("click",()=>goTab(b.dataset.tabAction)));
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>goTab(b.dataset.tab)));

async function loadShipments(){
  const d=await api("admin_shipments");shipments=d.shipments||[];renderShipments();updateStats();renderOverview();
}
function renderOverview(){
  const recent=shipments.slice(0,5);
  $("recentShipments").innerHTML=recent.length?recent.map(s=>`<div class="mini-item"><div><strong>${esc(s.tracking_code)}</strong><small>${esc(s.origin||"—")} → ${esc(s.destination||"—")}</small></div><span class="mini-badge">${esc(s.status||"—")}</span></div>`).join(""):`<div class="empty-state"><div>📦</div><strong>No shipments yet</strong><p>Create your first shipment to get started.</p></div>`;
  const chats=sessions.filter(s=>s.status==="open").slice(0,5);
  $("recentChats").innerHTML=chats.length?chats.map(s=>`<div class="mini-item"><div><strong>${esc(s.visitor_name||"Visitor")}</strong><small>${esc(s.visitor_email||"")}</small></div><span class="mini-badge">Open</span></div>`).join(""):`<div class="empty-state"><div>💬</div><strong>No open chats</strong><p>Customers will appear here when they start a conversation.</p></div>`;
}
function renderShipments(){
  const q=$("shipmentSearch").value.trim().toLowerCase();
  const list=shipments.filter(s=>Object.values(s).some(v=>String(v??"").toLowerCase().includes(q)));
  $("shipmentList").innerHTML=list.map(s=>`<article class="shipment-card">
    <div class="shipment-top"><strong>${esc(s.tracking_code)}</strong><span class="badge">${esc(s.status||"—")}</span></div>
    <div class="shipment-meta">
      <div><b>Route</b><br>${esc(s.origin||"—")} → ${esc(s.destination||"—")}</div>
      <div><b>Receiver</b><br>${esc(s.receiver_name||"—")}<br>${esc(s.receiver_email||"")}</div>
      <div><b>Delivery</b><br>${esc(s.estimated_delivery||"—")}<br>${esc(s.service||"—")}</div>
    </div>
    <div class="actions"><button class="secondary" onclick="editShipment('${s.id}')">Edit status</button><button class="secondary" onclick="maps('${encodeURIComponent(s.destination||"")}')">📍 Map</button></div>
    <div id="edit-${s.id}" class="event-box hidden">
      <label>Status<select id="status-${s.id}">${["Shipment Created","Picked Up","In Transit","Out for Delivery","Delivered","Delayed"].map(x=>`<option ${x===s.status?"selected":""}>${x}</option>`).join("")}</select></label>
      <label>Estimated delivery<input id="date-${s.id}" type="date" value="${esc((s.estimated_delivery||"").slice(0,10))}"></label>
      <label class="wide">Current location<input id="loc-${s.id}" value="${esc(s.destination||"")}"></label>
      <label class="wide">Tracking note<textarea id="desc-${s.id}" rows="2" placeholder="What should the customer see?"></textarea></label>
      <button class="primary" onclick="saveShipment('${s.id}')">Save changes</button>
      <button class="secondary" onclick="addEvent('${s.id}')">Add tracking event</button>
    </div>
  </article>`).join("")||`<div class="empty-state"><div>🔎</div><strong>No shipments found</strong><p>Try another search or create a new shipment.</p></div>`;
}
function editShipment(id){$("edit-"+id).classList.toggle("hidden")}
async function saveShipment(id){
  try{await api("update_shipment",{id,shipment:{status:$("status-"+id).value,estimated_delivery:$("date-"+id).value||null}});await loadShipments();toast("Shipment updated successfully.");}
  catch(e){toast(e.message)}
}
async function addEvent(id){
  try{await api("add_event",{shipment_id:id,event:{status:$("status-"+id).value,location:$("loc-"+id).value,description:$("desc-"+id).value,event_time:new Date().toISOString()}});$("desc-"+id).value="";await loadShipments();toast("Tracking event added.");}
  catch(e){toast(e.message)}
}
function maps(q){if(q)window.open("https://www.google.com/maps/search/?api=1&query="+q,"_blank","noopener")}
$("shipmentSearch").addEventListener("input",renderShipments);
$("refreshShipments").addEventListener("click",async()=>{try{await loadShipments();toast("Shipments refreshed.");}catch(e){toast(e.message)}});

$("createShipmentForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=new FormData(e.target),shipment=Object.fromEntries(f.entries());
  try{const d=await api("create_shipment",{shipment});$("createResult").textContent="Shipment "+d.shipment.tracking_code+" created successfully.";e.target.reset();await loadShipments();toast("Shipment created successfully.");goTab("shipments");}
  catch(x){$("createResult").textContent=x.message}
});

async function loadChats(){const d=await api("chat_sessions");sessions=d.sessions||[];renderSessions();updateStats();renderOverview()}
function renderSessions(){
  $("chatSessions").innerHTML=sessions.map(s=>`<div class="session ${selectedSession===s.id?"active":""}" onclick="selectChat('${s.id}')"><b>${esc(s.visitor_name||"Visitor")}</b><small>${esc(s.visitor_email||"")}</small><small>${esc(s.status||"")} · ${s.updated_at?esc(new Date(s.updated_at).toLocaleString()):""}</small></div>`).join("")||`<div class="empty-state"><div>💬</div><strong>No chats yet</strong><p>Customer conversations will appear here.</p></div>`;
}
async function selectChat(id){
  selectedSession=id;renderSessions();const s=sessions.find(x=>x.id===id);
  $("chatHeader").innerHTML=`<span class="chat-avatar">👤</span><div><strong>${esc(s?.visitor_name||"Customer")}</strong><small>${esc(s?.visitor_email||"")}</small></div>`;
  $("replyForm").classList.remove("hidden");await loadMessages()
}
async function loadMessages(){
  if(!selectedSession)return;
  try{const d=await api("admin_chat_messages",{session_id:selectedSession});$("adminMessages").innerHTML=(d.messages||[]).map(m=>`<div class="msg ${m.sender==="visitor"?"visitor":"agent"}"><b>${m.sender==="visitor"?"Customer":"You"}</b><div>${esc(m.message)}</div><small>${m.sent_at?esc(new Date(m.sent_at).toLocaleString()):""}</small></div>`).join("")||`<div class="empty-chat"><div>💬</div><strong>No messages yet</strong><p>Send a welcome message to begin.</p></div>`;$("adminMessages").scrollTop=$("adminMessages").scrollHeight}
  catch(e){$("chatResult").textContent=e.message}
}
$("replyForm").addEventListener("submit",async e=>{
  e.preventDefault();const m=$("replyInput").value.trim();if(!selectedSession||!m)return;
  try{await api("admin_chat_reply",{session_id:selectedSession,message:m});$("replyInput").value="";await loadMessages();await loadChats();toast("Reply sent.");}
  catch(x){$("chatResult").textContent=x.message}
});
$("refreshChats").addEventListener("click",async()=>{try{await loadChats();toast("Chats refreshed.");}catch(e){toast(e.message)}});

function updateStats(){
  $("statShipments").textContent=shipments.length;
  $("statTransit").textContent=shipments.filter(s=>/transit|picked|out for delivery/i.test(s.status||"")).length;
  $("statDelivered").textContent=shipments.filter(s=>/delivered/i.test(s.status||"")).length;
  $("statChats").textContent=sessions.filter(s=>s.status==="open").length;
}
async function loadAll(){
  try{await loadShipments();await loadChats();goTab("overview")}
  catch(e){if(/authentication|required|invalid|unauthorized/i.test(e.message)){token=null;sessionStorage.removeItem("eqws_admin_token");showLogin();$("loginError").textContent="Your admin session expired. Please sign in again."}else toast(e.message)}
}
if(token)showApp();
