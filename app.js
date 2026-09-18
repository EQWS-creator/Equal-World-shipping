const DEMO_EMAIL='admin@equalworldshipping.com', DEMO_PASSWORD='Admin123!', KEY='ews_shipments_v1', AUTH='ews_admin_auth';
const seed=[
{id:crypto.randomUUID(),tracking:'EWS100001',status:'In Transit',origin:'New York City, USA',currentLocation:'Baghdad, Iraq',destination:'Karbala, Iraq',service:'International Express',customer:'Demo Customer',eta:'',updated:Date.now()},
{id:crypto.randomUUID(),tracking:'EWS100002',status:'Delivered',origin:'Lagos, Nigeria',currentLocation:'Lagos, Nigeria',destination:'Abuja, Nigeria',service:'Standard Freight',customer:'Demo Customer',eta:'',updated:Date.now()-86400000}
];
function getShipments(){let x=localStorage.getItem(KEY);if(!x){localStorage.setItem(KEY,JSON.stringify(seed));return seed}try{return JSON.parse(x)}catch{return []}}
function saveShipments(x){localStorage.setItem(KEY,JSON.stringify(x))}
function requireAuth(){if(location.pathname.endsWith('dashboard.html')&&!sessionStorage.getItem(AUTH))location.href='index.html'}
function initLogin(){const f=document.getElementById('loginForm');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const email=document.getElementById('email').value.trim(),pass=document.getElementById('password').value; if(email===DEMO_EMAIL&&pass===DEMO_PASSWORD){sessionStorage.setItem(AUTH,'1');location.href='dashboard.html'}else document.getElementById('loginError').textContent='Invalid demo credentials.'})}
let shipments=[];
function initDashboard(){if(!document.getElementById('shipmentTable'))return;requireAuth();shipments=getShipments();renderAll();
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>showView(b.dataset.go));
document.getElementById('addBtn').onclick=()=>openModal();
document.getElementById('closeModal').onclick=closeModal;document.getElementById('cancel').onclick=closeModal;
document.getElementById('logout').onclick=()=>{sessionStorage.removeItem(AUTH);location.href='index.html'};
document.getElementById('search').oninput=renderShipments;
document.getElementById('shipmentForm').onsubmit=submitShipment;
document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
}
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===id));document.getElementById('pageTitle').textContent=id[0].toUpperCase()+id.slice(1);if(id==='shipments')renderShipments();if(id==='customers')renderCustomers()}
function renderAll(){document.getElementById('totalStat').textContent=shipments.length;document.getElementById('transitStat').textContent=shipments.filter(x=>x.status==='In Transit').length;document.getElementById('deliveredStat').textContent=shipments.filter(x=>x.status==='Delivered').length;document.getElementById('pendingStat').textContent=shipments.filter(x=>x.status==='Pending').length;document.getElementById('recentTable').innerHTML=table(shipments.slice(0,6),false);renderShipments();renderCustomers()}
function table(rows,actions=true){if(!rows.length)return '<div class="empty">No shipments found.</div>';return `<div class="table-wrap"><table class="table"><thead><tr><th>Tracking</th><th>Status</th><th>Origin</th><th>Destination</th><th>Service</th>${actions?'<th>Actions</th>':''}</tr></thead><tbody>${rows.map(x=>`<tr><td><b>${esc(x.tracking)}</b></td><td><span class="badge">${esc(x.status)}</span></td><td>${esc(x.origin)}</td><td>${esc(x.destination)}</td><td>${esc(x.service)}</td>${actions?`<td class="actions"><button class="secondary" onclick="editShipment('${x.id}')">Edit</button><button class="secondary" onclick="deleteShipment('${x.id}')">Delete</button></td>`:''}</tr>`).join('')}</tbody></table></div>`}
function renderShipments(){const q=(document.getElementById('search')?.value||'').toLowerCase();const rows=shipments.filter(x=>[x.tracking,x.origin,x.currentLocation,x.destination,x.service,x.status].join(' ').toLowerCase().includes(q));document.getElementById('shipmentTable').innerHTML=table(rows,true)}
function renderCustomers(){const map={};shipments.forEach(x=>{if(x.customer)map[x.customer]=(map[x.customer]||0)+1});const rows=Object.entries(map);document.getElementById('customerTable').innerHTML=rows.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Shipments</th></tr></thead><tbody>${rows.map(([n,c])=>`<tr><td>${esc(n)}</td><td>${c}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No customer records yet.</div>'}
function openModal(x=null){document.getElementById('modal').classList.remove('hidden');document.getElementById('modalTitle').textContent=x?'Edit shipment':'Add shipment';document.getElementById('shipmentId').value=x?.id||'';['tracking','status','origin','currentLocation','destination','service','customer','eta'].forEach(k=>document.getElementById(k).value=x?.[k]||'')}
function closeModal(){document.getElementById('modal').classList.add('hidden')}
function submitShipment(e){e.preventDefault();const id=document.getElementById('shipmentId').value;const x={id:id||crypto.randomUUID(),tracking:val('tracking'),status:val('status'),origin:val('origin'),currentLocation:val('currentLocation'),destination:val('destination'),service:val('service'),customer:val('customer'),eta:val('eta'),updated:Date.now()};shipments=id?shipments.map(s=>s.id===id?x:s):[x,...shipments];saveShipments(shipments);closeModal();renderAll()}
function val(id){return document.getElementById(id).value.trim()}
window.editShipment=id=>openModal(shipments.find(x=>x.id===id));
window.deleteShipment=id=>{if(confirm('Delete this shipment?')){shipments=shipments.filter(x=>x.id!==id);saveShipments(shipments);renderAll()}};
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
requireAuth();initLogin();initDashboard();
