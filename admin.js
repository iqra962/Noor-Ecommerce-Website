/* =========================================================
   NOOR Admin — shared core
   Reads/writes the SAME localStorage keys as the storefront:
     - noorOrders   (orders placed on the storefront)
     - noorUsers    (registered customers)
   Adds admin-only keys:
     - noorAdminProducts  (editable catalog, seeded from storefront list)
     - noorAdminAuth      (admin login credentials)
     - noorAdminSession   (current admin session)
     - noorStoreSettings  (store profile shown in Settings)
   ========================================================= */

const LS = {
  orders: "noorOrders",
  users: "noorUsers",
  products: "noorAdminProducts",
  adminAuth: "noorAdminAuth",
  adminSession: "noorAdminSession",
  storeSettings: "noorStoreSettings",
};

/* Seed copy of the storefront catalog — used only the first time
   the admin panel runs, to populate an editable product store. */
const DEFAULT_PRODUCTS = [
  { id: "n-001", title: "Emerald Zari Kurta", category: "Women", sub: "Stitched", price: 8450, stock: 18, color: "#1f5f52", accent: "#d4b56a", featured: 1, image: "item-1.jpg" },
  { id: "n-002", title: "Ivory Lawn Three Piece", category: "Women", sub: "Unstitched", price: 6450, stock: 24, color: "#f7f0df", accent: "#8d2538", featured: 2, image: "item-2.jpg" },
  { id: "n-003", title: "Ruby Formal Set", category: "Women", sub: "Readymade", price: 12900, stock: 6, color: "#8d2538", accent: "#e2c16f", featured: 3, image: "item-3.jpg" },
  { id: "n-004", title: "Midnight Waistcoat", category: "Men", sub: "Formal", price: 7800, stock: 14, color: "#142235", accent: "#b98a3d", featured: 4, image: "item-4.jpg" },
  { id: "n-005", title: "Classic Cotton Kameez", category: "Men", sub: "Daily", price: 4250, stock: 40, color: "#d9d1c5", accent: "#1f5f52", featured: 5, image: "item-5.jpg" },
  { id: "n-006", title: "Little Festive Frock", category: "Children", sub: "Girls", price: 3950, stock: 3, color: "#cf7d86", accent: "#fff2bd", featured: 6, image: "item-6.jpg" },
  { id: "n-007", title: "Pearl Drop Earrings", category: "Jewelry", sub: "Earrings", price: 2750, stock: 30, color: "#f7ecc8", accent: "#b98a3d", featured: 7, image: "item-7.jpg" },
  { id: "n-008", title: "Gold Plated Bangles", category: "Jewelry", sub: "Bangles", price: 5200, stock: 0, color: "#e5c16b", accent: "#8d2538", featured: 8, image: "item-8.jpg" },
  { id: "n-009", title: "Rose Glow Lip Tint", category: "Cosmetics", sub: "Lips", price: 1450, stock: 55, color: "#b44155", accent: "#f4b2bb", featured: 9, image: "item-9.jpg" },
  { id: "n-010", title: "Saffron Face Serum", category: "Cosmetics", sub: "Skincare", price: 2850, stock: 12, color: "#d48b36", accent: "#fff0c7", featured: 10, image: "item-10.jpg" },
  { id: "n-011", title: "Boys Eid Waistcoat", category: "Children", sub: "Boys", price: 3650, stock: 9, color: "#315b73", accent: "#d7c293", featured: 11, image: "item-11.jpg" },
  { id: "n-012", title: "Jasmine Organza Dupatta", category: "Women", sub: "Unstitched", price: 3450, stock: 4, color: "#f4efe5", accent: "#7a8f72", featured: 12, image: "item-12.jpg" },
  { id: "n-013", title: "Stylish Sneakers", category: "Shoes", sub: "Men", price: 7500, stock: 20, color: "#333333", accent: "#FF5733", featured: 13, image: "item-13.jpg" },
  { id: "n-014", title: "Elegant Heels", category: "Shoes", sub: "Women", price: 9200, stock: 2, color: "#8d2538", accent: "#e2c16f", featured: 14, image: "item-14.jpg" },
];

const CATEGORIES = ["Women", "Men", "Children", "Jewelry", "Cosmetics", "Shoes"];
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

/* ---------------- storage helpers ---------------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getOrders() {
  const orders = readJSON(LS.orders, []);
  // ensure every order has a status so the UI always has something to show
  let changed = false;
  orders.forEach((o) => {
    if (!o.status) { o.status = "Pending"; changed = true; }
  });
  if (changed) writeJSON(LS.orders, orders);
  return orders;
}
function saveOrders(orders) { writeJSON(LS.orders, orders); }

function getUsers() { return readJSON(LS.users, []); }

function getProducts() {
  let list = readJSON(LS.products, null);
  if (!list) {
    list = DEFAULT_PRODUCTS.map((p) => ({ ...p }));
    writeJSON(LS.products, list);
  }
  return list;
}
function saveProducts(list) { writeJSON(LS.products, list); }

function getAdminAuth() {
  let auth = readJSON(LS.adminAuth, null);
  if (!auth) {
    auth = { email: "admin@noor.com", password: "admin123", name: "Store Admin" };
    writeJSON(LS.adminAuth, auth);
  }
  return auth;
}
function saveAdminAuth(auth) { writeJSON(LS.adminAuth, auth); }

function getSession() { return readJSON(LS.adminSession, null); }
function saveSession(session) { writeJSON(LS.adminSession, session); }
function clearSession() { localStorage.removeItem(LS.adminSession); }

function getStoreSettings() {
  let s = readJSON(LS.storeSettings, null);
  if (!s) {
    s = { storeName: "NOOR — Fashion Hub", email: "hello@noorstore.com", phone: "0300 1234567", currency: "Rs." };
    writeJSON(LS.storeSettings, s);
  }
  return s;
}
function saveStoreSettings(s) { writeJSON(LS.storeSettings, s); }

/* ---------------- formatting ---------------- */
function money(v) {
  const cur = (getStoreSettings().currency || "Rs.");
  return cur + " " + Math.round(v || 0).toLocaleString("en-PK");
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(ts) {
  return new Date(ts).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* ---------------- auth guard ---------------- */
function requireAdminAuth() {
  if (!getSession()) {
    window.location.href = "admin-login.html";
  }
}

function logoutAdmin() {
  clearSession();
  window.location.href = "admin-login.html";
}

/* ---------------- toast ---------------- */
function showToast(message, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.className = "toast show" + (type ? " " + type : "");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.className = "toast"; }, 2600);
}

/* ---------------- sidebar ---------------- */
const NAV_ITEMS = [
  { section: "Overview", items: [
    { page: "admin.html", icon: "◈", label: "Dashboard" },
  ]},
  { section: "Manage", items: [
    { page: "products.html", icon: "◫", label: "Products" },
    { page: "orders.html", icon: "▤", label: "Orders" },
    { page: "customers.html", icon: "◐", label: "Customers" },
  ]},
  { section: "Store", items: [
    { page: "settings.html", icon: "⚙", label: "Settings" },
  ]},
];

function currentPage() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function renderSidebar() {
  const mount = document.getElementById("sidebarMount");
  if (!mount) return;
  const active = currentPage();
  const lowStockCount = getProducts().filter((p) => p.stock <= 5).length;

  const navHtml = NAV_ITEMS.map((group) => `
    <div class="sidebar-section-label">${group.section}</div>
    ${group.items.map((item) => `
      <a class="nav-item ${item.page === active ? "active" : ""}" href="${item.page}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.page === "products.html" && lowStockCount ? `<span class="nav-badge">${lowStockCount}</span>` : ""}
      </a>
    `).join("")}
  `).join("");

  const auth = getAdminAuth();

  mount.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-mark"></div>
      <div class="sidebar-brand-text">
        <strong>NOOR</strong>
        <span>Atelier Console</span>
      </div>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-foot">
      <div class="sidebar-avatar">${initials(auth.name)}</div>
      <div class="sidebar-foot-text">
        <strong>${auth.name}</strong>
        <span>${auth.email}</span>
      </div>
      <button class="sidebar-logout" id="logoutBtn" title="Log out" aria-label="Log out">⏻</button>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", logoutAdmin);
}

function wireResponsiveSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("menuToggle");
  const scrim = document.getElementById("sidebarScrim");
  if (!sidebar || !toggle || !scrim) return;
  const open = () => { sidebar.classList.add("open"); scrim.classList.add("show"); };
  const close = () => { sidebar.classList.remove("open"); scrim.classList.remove("show"); };
  toggle.addEventListener("click", open);
  scrim.addEventListener("click", close);
}

function setTopbarDate() {
  const el = document.getElementById("topbarDate");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" });
}

function renderBell() {
  const dot = document.getElementById("bellDot");
  if (!dot) return;
  const lowStock = getProducts().filter((p) => p.stock <= 5).length;
  const pendingOrders = getOrders().filter((o) => o.status === "Pending").length;
  dot.classList.toggle("show", lowStock + pendingOrders > 0);
  dot.title = `${pendingOrders} pending order(s), ${lowStock} low-stock item(s)`;
}

/* ---------------- modal helpers ---------------- */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  document.addEventListener("keydown", modalEscHandler);
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  document.removeEventListener("keydown", modalEscHandler);
}
function modalEscHandler(e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach((m) => m.classList.remove("open"));
  }
}
function wireModalOverlayClicks() {
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

/* ---------------- CSV export ---------------- */
function exportCSV(filename, rows) {
  if (!rows.length) { showToast("Nothing to export", "error"); return; }
  const headers = Object.keys(rows[0]);
  const escapeCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- page init ---------------- */
function initAdminPage({ title, subtitle, search } = {}) {
  requireAdminAuth();
  renderSidebar();
  wireResponsiveSidebar();
  wireModalOverlayClicks();
  setTopbarDate();
  renderBell();
  const titleEl = document.getElementById("pageTitle");
  const subEl = document.getElementById("pageSubtitle");
  if (titleEl && title) titleEl.textContent = title;
  if (subEl && subtitle) subEl.textContent = subtitle;
  const searchWrap = document.getElementById("topbarSearchWrap");
  if (searchWrap) searchWrap.style.display = search ? "block" : "none";
}
