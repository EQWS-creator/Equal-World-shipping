const API="https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2";
const $=id=>document.getElementById(id);
let token=sessionStorage.getItem("eqws_admin_token");
let shipments=[];
let sessions=[];
let selectedSession=null;

async function api(action,payload={},auth=true){
  const headers={"Content-Type":"application/json"};
  if(auth&&token) headers.Authorization="Bearer "+token;
  const r=await fetch(API,{method:"POST",headers,body:JSON.stringify({action,...payload})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.error) throw new Error(d.error||"Request failed");
  return d;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function showApp(){ $("loginView").classList.add("hidden"); $("appView").classList.remove("hidden"); loadAll(); }
function showLogin(){ $("appView").classList.add("hidden"); $("loginView").classList.remove("hidden"); }
async function login(e){e.preventDefault();$("loginError").textContent="";try{const d=await api("admin_login",{email:$("adminEmail").value.trim(),password:$("adminPassword").value},false);token=d.token;sessionStorage.setItem("eqws_admin_token",token);$("adminPassword").value="";showApp()}catch(x){$("loginError").textContent=x.message}}
$("loginForm").addEventListener("submit",login);
$("logoutBtn").addEventListener("click",()=>{token=null;sessionStorage.removeItem("eqws_admin_token");showLogin()});

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.add("hidden"));b.classList.add("active");$(b.dataset.tab+"Tab").classList.remove("hidden");if(b.dataset.tab==="chat")loadChats()}));

async function loadShipments(){const d=await api("admin_shipments");shipments=d.shipments||[];renderShipments();updateStats()}
function renderShipments(){
 const q=$("shipmentSearch").value.trim().toLowerCase();
 const list=shipments.filter(s=>Object.values(s).some(v=>String(v??"").toLowerCase().includes(q)));
 $("shipmentList").innerHTML=list.map(s=>`<article class="shipment-card">
  <div class="shipment-top"><strong>${esc(s.tracking_code)}</strong><span class="badge">${esc(s.status)}</span></div>
  <div class="shipment-meta"><div><b>Route</b><br>${esc(s.origin||"—")} → ${esc(s.destination||"—")}</div><div><b>Receiver</b><br>${esc(s.receiver_name||"—")}<br>${esc(s.receiver_email||"")}</div><div><b>Delivery</b><br>${esc(s.estimated_delivery||"—")}<br>${esc(s.service||"—")}</div></div>
  <div class="actions"><button class="secondary" onclick="editShipment('${s.id}')">Edit</button><button onclick="maps('${encodeURIComponent(s.destination||"")}')">Destination map</button></div>
  <div id="edit-${s.id}" class="event-box hidden">
   <label>Status<select id="status-${s.id}">${["Shipment Created","Picked Up","In Transit","Out for Delivery","Delivered","Delayed"].map(x=>`<option ${x===s.status?"selected":""}>${x}</option>`).join("")}</select></label>
   <label>Estimated delivery<input id="date-${s.id}" type="date" value="${esc((s.estimated_delivery||"").slice(0,10))}"></label>
   <label class="wide">Location<input id="loc-${s.id}" value="${esc(s.destination||"")}"></label>
   <label class="wide">Description<textarea id="desc-${s.id}" rows="2"></textarea></label>
   <button onclick="saveShipment('${s.id}')">Save shipment</button>
   <button class="secondary" onclick="addEvent('${s.id}')">Add tracking event</button>
  </div></article>`).join("")||"<p>No shipments found.</p>";
}
function editShipment(id){$("edit-"+id).classList.toggle("hidden")}
async function saveShipment(id){const s=shipments.find(x=>x.id===id);try{await api("update_shipment",{id,shipment:{status:$("status-"+id).value,estimated_delivery:$("date-"+id).value||null}});await loadShipments();}catch(e){alert(e.message)}}
async function addEvent(id){try{await api("add_event",{shipment_id:id,event:{status:$("status-"+id).value,location:$("loc-"+id).value,description:$("desc-"+id).value,event_time:new Date().toISOString()}});await loadShipments();alert("Tracking event added.")}catch(e){alert(e.message)}}
function maps(q){if(q)window.open("https://www.google.com/maps/search/?api=1&query="+q,"_blank","noopener")}
$("shipmentSearch").addEventListener("input",renderShipments);$("refreshShipments").addEventListener("click",loadShipments);

$("createShipmentForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);const shipment=Object.fromEntries(f.entries());try{const d=await api("create_shipment",{shipment});$("createResult").textContent="Shipment "+d.shipment.tracking_code+" created successfully.";e.target.reset();await loadShipments()}catch(x){$("createResult").textContent=x.message}});

async function loadChats(){const d=await api("chat_sessions");sessions=d.sessions||[];renderSessions();updateStats()}
function renderSessions(){$("chatSessions").innerHTML=sessions.map(s=>`<div class="session ${selectedSession===s.id?"active":""}" onclick="selectChat('${s.id}')"><b>${esc(s.visitor_name||"Visitor")}</b><small>${esc(s.visitor_email||"")}</small><small>${esc(s.status)} · ${s.updated_at?esc(new Date(s.updated_at).toLocaleString()):""}</small></div>`).join("")||"<p style='padding:14px'>No chats yet.</p>"}
async function selectChat(id){selectedSession=id;renderSessions();const s=sessions.find(x=>x.id===id);$("chatHeader").textContent=(s?.visitor_name||"Customer")+" — "+(s?.visitor_email||"");$("replyForm").classList.remove("hidden");await loadMessages()}
async function loadMessages(){if(!selectedSession)return;try{const d=await api("admin_chat_messages",{session_id:selectedSession});$("adminMessages").innerHTML=(d.messages||[]).map(m=>`<div class="msg ${m.sender==="visitor"?"visitor":"agent"}"><b>${m.sender==="visitor"?"Customer":"You"}</b><div>${esc(m.message)}</div><small>${m.sent_at?esc(new Date(m.sent_at).toLocaleString()):""}</small></div>`).join("");$("adminMessages").scrollTop=$("adminMessages").scrollHeight}catch(e){$("chatResult").textContent=e.message}}
$("replyForm").addEventListener("submit",async e=>{e.preventDefault();const m=$("replyInput").value.trim();if(!selectedSession||!m)return;try{await api("admin_chat_reply",{session_id:selectedSession,message:m});$("replyInput").value="";await loadMessages();await loadChats()}catch(x){$("chatResult").textContent=x.message}});
$("refreshChats").addEventListener("click",loadChats);

function updateStats(){$("statShipments").textContent=shipments.length;$("statTransit").textContent=shipments.filter(s=>/transit|picked|out for delivery/i.test(s.status||"")).length;$("statDelivered").textContent=shipments.filter(s=>/delivered/i.test(s.status||"")).length;$("statChats").textContent=sessions.filter(s=>s.status==="open").length}
async function loadAll(){try{await loadShipments();await loadChats()}catch(e){if(/authentication|required|invalid/i.test(e.message)){token=null;sessionStorage.removeItem("eqws_admin_token");showLogin()}else alert(e.message)}}
if(token)showApp();