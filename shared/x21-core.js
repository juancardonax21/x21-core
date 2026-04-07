// ============================================================
// X21 CORE — shared/x21-core.js
// Funciones comunes a todos los módulos.
// Incluir en cada página con:
//   <script src="../shared/x21-core.js"></script>
// ============================================================

// ── CONFIGURACIÓN CENTRAL ─────────────────────────────────
const X21 = {
  API_URL:   "https://script.google.com/macros/s/AKfycbyuF2_zjOgAVH4meCHnMTdCllAJOQWZjonrDQdoeoTK5OgnCQ93QCBLBwzyVMGCFNA-2Q/exec",
  LOCAL_PIN: "0000",
  VERSION:   "2.1"
};

// ── SESIÓN ────────────────────────────────────────────────
function getToken()          { return sessionStorage.getItem("x21_token"); }
function setToken(t)         { sessionStorage.setItem("x21_token", t); }
function clearToken()        { sessionStorage.removeItem("x21_token"); }
function isLocalSession()    { return getToken() === "local"; }

/**
 * Llama a esta función al inicio de cada módulo.
 * Si no hay sesión activa, redirige al login.
 */
function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

function logout() {
  clearToken();
  window.location.href = "index.html";
}

// ── API ───────────────────────────────────────────────────
/**
 * Llama al Apps Script. Sin Content-Type para evitar CORS preflight.
 */
async function apiCall(params) {
  const token = getToken();
  if (token) params.token = token;
  const r = await fetch(X21.API_URL, {
    method:   "POST",
    redirect: "follow",
    body:     JSON.stringify(params)
  });
  const text = await r.text();
  return JSON.parse(text);
}

// ── UTILIDADES UI ─────────────────────────────────────────
function toast(msg, duration = 2200) {
  const existing = document.querySelector(".x21-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className   = "x21-toast";
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
    background:#0d0d0d; color:#f7f5f0; padding:10px 22px;
    border-radius:100px; font-size:13px; font-family:'Syne',sans-serif;
    font-weight:500; z-index:9999; white-space:nowrap;
    animation: x21tIn 0.2s ease, x21tOut 0.3s ease ${duration - 400}ms forwards;
  `;
  if (!document.getElementById("x21-toast-style")) {
    const s = document.createElement("style");
    s.id = "x21-toast-style";
    s.textContent = `
      @keyframes x21tIn  { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes x21tOut { to{opacity:0} }
    `;
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/**
 * Escapa HTML para prevenir XSS al renderizar contenido dinámico.
 */
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "2-digit"
  });
}
