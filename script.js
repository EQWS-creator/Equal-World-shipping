const API = "https://ypedqbffumjwccqmgauo.supabase.co/functions/v1/equal-world-api-v2";
const SUPABASE_URL = "https://ypedqbffumjwccqmgauo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yaUpKhGqxpHxRwEIJrSO3g_bIVhMNHE";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const CHAT_MAX_FILE_BYTES = 25 * 1024 * 1024;
const CHAT_ALLOWED_MIME = (mime) =>
  mime.startsWith("image/") ||
  mime.startsWith("video/") ||
  mime.startsWith("audio/") ||
  mime === "application/pdf";

document.getElementById("year").textContent = new Date().getFullYear();

async function apiCall(action, payload = {}) {
  const headers = {"Content-Type": "application/json"};
  const visitorToken = sessionStorage.getItem("eqws_visitor_token");
  const visitorActions = new Set([
    "chat_messages",
    "chat_message",
    "chat_attachment_start",
    "chat_attachment_complete"
  ]);
  if (visitorToken && visitorActions.has(action)) {
    headers.Authorization = `Bearer ${visitorToken}`;
  }

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify({action, ...payload})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || "Request failed");
  return data;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

// Shipment tracking and Live Chat are independent flows.
// Tracking code is used only by trackingForm; chat actions never read trackingNumber.
const trackingForm = document.getElementById("trackingForm");
trackingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const number = document.getElementById("trackingNumber").value.trim().toUpperCase();
  const result = document.getElementById("trackingResult");
  result.classList.remove("hidden");
  result.innerHTML = "<p>Loading live shipment data…</p>";
  try {
    const data = await apiCall("track", {tracking_code: number});
    const shipment = data.shipment || data;
    const events = data.events || [];
    const current = events.length ? events[events.length - 1] : null;
    const mapPlace = current?.location || shipment.destination || "";
    result.innerHTML = `
      <h3>Shipment ${escapeHtml(shipment.tracking_code)}</h3>
      <p><span class="status">${escapeHtml(shipment.status || "Unknown")}</span></p>
      <p><strong>Origin:</strong> ${escapeHtml(shipment.origin || "—")}<br>
      <strong>Current location:</strong> ${escapeHtml(mapPlace || "—")}<br>
      <strong>Destination:</strong> ${escapeHtml(shipment.destination || "—")}<br>
      <strong>Service:</strong> ${escapeHtml(shipment.service || "—")}<br>
      <strong>Estimated delivery:</strong> ${escapeHtml(shipment.estimated_delivery || "—")}</p>
      ${mapPlace ? `<p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapPlace)}" target="_blank" rel="noopener">📍 View current location on Google Maps</a></p>` : ""}
      <div class="timeline">${events.map(ev => `
        <div><strong>${escapeHtml(ev.status || "")}</strong><br>
        <span>${escapeHtml(ev.location || "")}</span>
        ${ev.description ? `<br><small>${escapeHtml(ev.description)}</small>` : ""}
        ${ev.event_time ? `<br><small>${escapeHtml(new Date(ev.event_time).toLocaleString())}</small>` : ""}</div>
      `).join("")}</div>`;
  } catch (err) {
    result.innerHTML = `<h3>Tracking number not found</h3><p>${escapeHtml(err.message)}</p>`;
  }
});

const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const chatClose = document.getElementById("chatClose");
const chatStart = document.getElementById("chatStart");
const chatBody = document.getElementById("chatBody");
const chatError = document.getElementById("chatError");
const chatStatus = document.getElementById("chatStatus");
let chatSessionId = sessionStorage.getItem("eqws_chat_session");
let chatVisitorToken = sessionStorage.getItem("eqws_visitor_token");
let chatPoll = null;
let chatRefreshBusy = false;
let chatLastMessageCount = 0;

// A stored session is only usable when its signed visitor token is also present.
if (chatSessionId && !chatVisitorToken) {
  sessionStorage.removeItem("eqws_chat_session");
  chatSessionId = null;
}

chatToggle.addEventListener("click", () => {
  chatPanel.classList.remove("hidden");
  chatToggle.setAttribute("aria-expanded", "true");
  setTimeout(() => (chatSessionId ? document.getElementById("chatInput") : document.getElementById("chatName"))?.focus(), 50);
});
chatClose.addEventListener("click", () => {
  chatPanel.classList.add("hidden");
  chatToggle.setAttribute("aria-expanded", "false");
});

function safeSignedUrl(url) {
  return typeof url === "string" && url.startsWith("https://") ? url : "";
}

function renderAttachment(attachment) {
  const url = safeSignedUrl(attachment.signed_url || attachment.url || "");
  const name = escapeHtml(attachment.file_name || "Attachment");
  const mime = String(attachment.mime_type || "");

  if (!url) {
    return `<div class="chat-attachment-file">📎 ${name}</div>`;
  }

  if (mime.startsWith("image/")) {
    return `<a class="chat-attachment" href="${escapeHtml(url)}" target="_blank" rel="noopener">
      <img src="${escapeHtml(url)}" alt="${name}" loading="lazy">
      <span>📎 ${name}</span>
    </a>`;
  }

  if (mime.startsWith("video/")) {
    return `<div class="chat-attachment"><video controls preload="metadata" src="${escapeHtml(url)}"></video><span>🎥 ${name}</span></div>`;
  }

  if (mime.startsWith("audio/")) {
    return `<div class="chat-attachment"><audio controls preload="metadata" src="${escapeHtml(url)}"></audio><span>🎵 ${name}</span></div>`;
  }

  if (mime === "application/pdf") {
    return `<a class="chat-attachment-file" href="${escapeHtml(url)}" target="_blank" rel="noopener">📄 ${name}</a>`;
  }

  return `<a class="chat-attachment-file" href="${escapeHtml(url)}" target="_blank" rel="noopener">📎 ${name}</a>`;
}

function renderChatMessage(message, attachmentsByMessage) {
  const attachments = attachmentsByMessage.get(String(message.id)) || [];
  return `
    <div class="chat-message ${message.sender === "visitor" ? "visitor" : "agent"}">
      <strong>${message.sender === "visitor" ? "You" : "Support"}</strong>
      ${message.message ? `<p>${escapeHtml(message.message)}</p>` : ""}
      ${attachments.map(renderAttachment).join("")}
      <small>${message.sent_at ? escapeHtml(new Date(message.sent_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})) : ""}</small>
    </div>`;
}

async function loadChatMessages() {
  if (!chatSessionId || chatRefreshBusy) return;
  chatRefreshBusy = true;
  try {
    const data = await apiCall("chat_messages", {session_id: chatSessionId});
    const messages = data.messages || [];
    const attachments = data.attachments || [];
    const attachmentsByMessage = new Map();

    for (const attachment of attachments) {
      const key = String(attachment.message_id || "");
      if (!attachmentsByMessage.has(key)) attachmentsByMessage.set(key, []);
      attachmentsByMessage.get(key).push(attachment);
    }

    const box = document.getElementById("chatMessages");
    const wasNearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.innerHTML = messages.map(m => renderChatMessage(m, attachmentsByMessage)).join("");

    if (wasNearBottom || messages.length > chatLastMessageCount) {
      box.scrollTop = box.scrollHeight;
    }
    if (messages.length > chatLastMessageCount && chatLastMessageCount > 0) {
      chatStatus.textContent = "New support message received.";
      setTimeout(() => {
        if (chatStatus.textContent === "New support message received.") chatStatus.textContent = "";
      }, 3500);
    }
    chatLastMessageCount = messages.length;
  } catch (err) {
    if (/token|unauthorized|forbidden|visitor/i.test(err.message || "")) {
      sessionStorage.removeItem("eqws_chat_session");
      sessionStorage.removeItem("eqws_visitor_token");
      chatSessionId = null;
      chatVisitorToken = null;
      chatBody.classList.add("hidden");
      chatStart.classList.remove("hidden");
      chatStatus.textContent = "";
      chatError.textContent = "Your chat session expired. Please start a new chat.";
      clearInterval(chatPoll);
      return;
    }
    chatStatus.textContent = "Unable to refresh messages right now.";
  } finally {
    chatRefreshBusy = false;
  }
}

async function startChat() {
  const visitor_name = document.getElementById("chatName").value.trim();
  const visitor_email = document.getElementById("chatEmail").value.trim();
  // Intentionally do not read or require the shipment tracking number here.
  chatError.textContent = "";
  if (!visitor_name || !visitor_email) {
    chatError.textContent = "Please enter your name and email.";
    return;
  }
  try {
    const data = await apiCall("chat_start", {visitor_name, visitor_email});
    chatSessionId = data.session_id || data.session?.id;
    chatVisitorToken = data.visitor_token || data.visitorToken;
    if (!chatSessionId || !chatVisitorToken) throw new Error("Unable to start a secure chat session.");
    sessionStorage.setItem("eqws_chat_session", chatSessionId);
    sessionStorage.setItem("eqws_visitor_token", chatVisitorToken);
    chatStart.classList.add("hidden");
    chatBody.classList.remove("hidden");
    chatLastMessageCount = 0;
    await loadChatMessages();
    clearInterval(chatPoll);
    chatPoll = setInterval(loadChatMessages, 3000);
  } catch (err) {
    chatError.textContent = err.message;
  }
}

document.getElementById("chatStartBtn").addEventListener("click", startChat);

const chatAttachBtn = document.getElementById("chatAttachBtn");
const chatFileInput = document.getElementById("chatFileInput");
const chatSelectedFiles = document.getElementById("chatSelectedFiles");

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showSelectedFiles(files) {
  chatSelectedFiles.innerHTML = files.map((file, i) => `
    <div class="chat-selected-file">
      <span>📎 ${escapeHtml(file.name)} <small>(${formatFileSize(file.size)})</small></span>
      <button type="button" data-remove-file="${i}" aria-label="Remove ${escapeHtml(file.name)}">×</button>
    </div>`).join("");
}

let selectedChatFiles = [];

chatAttachBtn.addEventListener("click", () => {
  if (!chatSessionId) {
    chatStatus.textContent = "Start the chat before attaching a file.";
    return;
  }
  chatFileInput.click();
});

chatFileInput.addEventListener("change", () => {
  selectedChatFiles = Array.from(chatFileInput.files || []);
  showSelectedFiles(selectedChatFiles);
});

chatSelectedFiles.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-file]");
  if (!button) return;
  const index = Number(button.dataset.removeFile);
  selectedChatFiles.splice(index, 1);
  showSelectedFiles(selectedChatFiles);
});

async function uploadChatFile(file) {
  if (!chatSessionId || !chatVisitorToken) throw new Error("Your chat session is not active.");
  if (!file || !file.name) throw new Error("Please choose a file.");
  if (file.size <= 0) throw new Error(`${file.name} is empty.`);
  if (file.size > CHAT_MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than the 25 MB limit.`);
  }
  if (!CHAT_ALLOWED_MIME(file.type || "")) {
    throw new Error(`${file.name}: only images, videos, audio files, and PDFs are allowed.`);
  }

  chatStatus.textContent = `Preparing ${file.name}…`;

  const start = await apiCall("chat_attachment_start", {
    session_id: chatSessionId,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size
  });

  const { error: uploadError } = await supabaseClient.storage
    .from("chat-attachments")
    .uploadToSignedUrl(start.path, start.token, file, {
      contentType: file.type || "application/octet-stream"
    });

  if (uploadError) throw uploadError;

  chatStatus.textContent = `Sending ${file.name}…`;

  await apiCall("chat_attachment_complete", {
    session_id: chatSessionId,
    storage_path: start.path,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size
  });
}

async function uploadSelectedChatFiles() {
  if (!selectedChatFiles.length) return;
  chatAttachBtn.disabled = true;

  try {
    for (const file of selectedChatFiles) {
      await uploadChatFile(file);
    }
    selectedChatFiles = [];
    chatFileInput.value = "";
    chatSelectedFiles.innerHTML = "";
    chatStatus.textContent = "Attachment sent.";
    await loadChatMessages();
    setTimeout(() => {
      if (chatStatus.textContent === "Attachment sent.") chatStatus.textContent = "";
    }, 2500);
  } catch (err) {
    chatStatus.textContent = err.message || "Unable to upload the attachment.";
  } finally {
    chatAttachBtn.disabled = false;
  }
}

chatFileInput.addEventListener("change", uploadSelectedChatFiles);

document.getElementById("chatForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message || !chatSessionId) return;
  chatStatus.textContent = "Sending…";
  try {
    await apiCall("chat_message", {session_id: chatSessionId, message});
    input.value = "";
    chatStatus.textContent = "";
    await loadChatMessages();
  } catch (err) {
    chatStatus.textContent = err.message;
  }
});

if (chatSessionId) {
  chatStart.classList.add("hidden");
  chatBody.classList.remove("hidden");
  loadChatMessages();
  chatPoll = setInterval(loadChatMessages, 3000);
}
