const products = [
  { id: "n-001", title: "Emerald Zari Kurta", category: "Women", sub: "Stitched", price: 8450, color: "#1f5f52", accent: "#d4b56a", featured: 1, image: "item-1.jpg" },
  { id: "n-002", title: "Ivory Lawn Three Piece", category: "Women", sub: "Unstitched", price: 6450, color: "#f7f0df", accent: "#8d2538", featured: 2, image: "item-2.jpg" },
  { id: "n-003", title: "Ruby Formal Set", category: "Women", sub: "Readymade", price: 12900, color: "#8d2538", accent: "#e2c16f", featured: 3, image: "item-3.jpg" },
  { id: "n-004", title: "Midnight Waistcoat", category: "Men", sub: "Formal", price: 7800, color: "#142235", accent: "#b98a3d", featured: 4, image: "item-4.jpg" },
  { id: "n-005", title: "Classic Cotton Kameez", category: "Men", sub: "Daily", price: 4250, color: "#d9d1c5", accent: "#1f5f52", featured: 5, image: "item-5.jpg" },
  { id: "n-006", title: "Little Festive Frock", category: "Children", sub: "Girls", price: 3950, color: "#cf7d86", accent: "#fff2bd", featured: 6, image: "item-6.jpg" },
  { id: "n-007", title: "Pearl Drop Earrings", category: "Jewelry", sub: "Earrings", price: 2750, color: "#f7ecc8", accent: "#b98a3d", featured: 7, image: "item-7.jpg" },
  { id: "n-008", title: "Gold Plated Bangles", category: "Jewelry", sub: "Bangles", price: 5200, color: "#e5c16b", accent: "#8d2538", featured: 8, image: "item-8.jpg" },
  { id: "n-009", title: "Rose Glow Lip Tint", category: "Cosmetics", sub: "Lips", price: 1450, color: "#b44155", accent: "#f4b2bb", featured: 9, image: "item-9.jpg" },
  { id: "n-010", title: "Saffron Face Serum", category: "Cosmetics", sub: "Skincare", price: 2850, color: "#d48b36", accent: "#fff0c7", featured: 10, image: "item-10.jpg" },
  { id: "n-011", title: "Boys Eid Waistcoat", category: "Children", sub: "Boys", price: 3650, color: "#315b73", accent: "#d7c293", featured: 11, image: "item-11.jpg" },
  { id: "n-012", title: "Jasmine Organza Dupatta", category: "Women", sub: "Unstitched", price: 3450, color: "#f4efe5", accent: "#7a8f72", featured: 12, image: "item-12.jpg" },
  { id: "n-013", title: "Stylish Sneakers", category: "Shoes", sub: "Men", price: 7500, color: "#333333", accent: "#FF5733", featured: 13, image: "item-13.jpg" },
  { id: "n-014", title: "Elegant Heels", category: "Shoes", sub: "Women", price: 9200, color: "#8d2538", accent: "#e2c16f", featured: 14, image: "item-14.jpg" }
];

const state = {
  category: "All",
  sub: "All",
  query: "",
  sort: "featured",
  cart: readCart(),
};

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const collectionTitle = document.getElementById("collectionTitle");
const subFilters = document.getElementById("subFilters");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const checkoutSummary = document.getElementById("checkoutSummary");
const toast = document.getElementById("toast");
const hero = document.getElementById("home");
const heroEyebrow = document.getElementById("heroEyebrow");
const heroTitle = document.getElementById("heroTitle");
const heroCounter = document.getElementById("heroCounter");
const heroProgressButtons = document.querySelectorAll("[data-hero-slide]");

const heroSlides = [
  { eyebrow: "New Collection", title: "New Arrivals", subtitle: "25% Off", image: "hero-1.jpg" },
  { eyebrow: "Men Collection", title: "Clothes for Men's", subtitle: "25% Off", image: "hero-2.jpg" },
  { eyebrow: "Children Collection", title: "Children's Clothes", subtitle: "25% Off", image: "hero-3.jpg" },
  { eyebrow: "Jewelry Collection", title: "Diamond Necklace", subtitle: "10% Off", image: "hero-4.jpg" },
  { eyebrow: "Cosmetics Collection", title: "Makeup Essentials", subtitle: "25% Off", image: "hero-5.jpg" },
  { eyebrow: "Shoes Collection", title: "Shoes for Everyone", subtitle: "25% Off", image: "hero-6.jpg" },
];

let heroSlideIndex = 1;
let heroSlideTimer;

function money(value) {
  return "Rs. " + value.toLocaleString("en-PK");
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("noorOfflineCart") || "[]");
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("noorOfflineCart", JSON.stringify(state.cart));
}

function productArt(product, small) {
  const pattern = product.category === "Jewelry" ? "circle" : product.category === "Cosmetics" ? "bottle" : "textile";
  const label = product.category === "Cosmetics" ? "Glow" : product.category === "Jewelry" ? "24K" : "NOOR";
  const fontSize = small ? 22 : 34;
  const body = pattern === "circle"
    ? `<circle cx="150" cy="185" r="78" fill="${product.accent}" opacity=".86"/><circle cx="150" cy="185" r="42" fill="${product.color}" opacity=".92"/><circle cx="150" cy="185" r="102" fill="none" stroke="#fff8" stroke-width="4"/>`
    : pattern === "bottle"
      ? `<rect x="105" y="96" width="90" height="185" rx="30" fill="${product.color}"/><rect x="122" y="62" width="56" height="42" rx="10" fill="${product.accent}"/><rect x="118" y="150" width="64" height="64" rx="50" fill="#fff8"/>`
      : `<path d="M84 75h132l28 75-35 174H91L56 150z" fill="${product.color}"/><path d="M84 75c30 42 102 42 132 0" fill="none" stroke="${product.accent}" stroke-width="13"/><path d="M75 165h150M83 216h134M93 267h114" stroke="#fff7" stroke-width="5"/>`;
  return `<svg viewBox="0 0 300 390" role="img" aria-label="${product.title}">
        <rect width="300" height="390" fill="#efe9df"/>
        <rect x="18" y="18" width="264" height="354" fill="${product.accent}" opacity=".16"/>
        <path d="M0 310c68-38 126-42 176-12s91 22 124-18v110H0z" fill="${product.color}" opacity=".22"/>
        ${body}
        <text x="150" y="348" text-anchor="middle" fill="#211b17" font-family="Georgia,serif" font-size="${fontSize}" font-style="italic" font-weight="700">${label}</text>
      </svg>`;
}

function filteredProducts() {
  let list = products.filter((p) => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesSub = state.sub === "All" || p.sub === state.sub;
    const haystack = `${p.title} ${p.category} ${p.sub}`.toLowerCase();
    return matchesCategory && matchesSub && haystack.includes(state.query.toLowerCase());
  });
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  if (state.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  if (state.sort === "featured") list.sort((a, b) => a.featured - b.featured);
  return list;
}

function renderProducts() {
  const list = filteredProducts();
  collectionTitle.textContent = state.sub !== "All" ? `${state.category}: ${state.sub}` : state.category === "All" ? "Everything" : state.category;
  grid.innerHTML = list.map((p) => `
        <article class="product">
          <div class="product-media">
          <img src="${p.image}" alt="${p.title}">
          <button class="btn quick" data-add="${p.id}">Quick Add</button>
          </div>
          <div class="product-info">
            <div>
              <p class="product-title">${p.title}</p>
              <p class="product-meta">${p.sub || p.category}</p>
            </div>
            <span class="price">${money(p.price)}</span>
          </div>
        </article>
      `).join("");
  emptyState.hidden = list.length !== 0;
  renderSubFilters();
}

function renderSubFilters() {
  const subs = [...new Set(products.filter((p) => state.category === "All" || p.category === state.category).map((p) => p.sub))];
  subFilters.innerHTML = "";
  if (!subs.length || state.category === "All") return;
  const all = document.createElement("button");
  all.className = `pill ${state.sub === "All" ? "active" : ""}`;
  all.textContent = "All";
  all.onclick = () => { state.sub = "All"; renderProducts(); };
  subFilters.appendChild(all);
  subs.forEach((sub) => {
    const btn = document.createElement("button");
    btn.className = `pill ${state.sub === sub ? "active" : ""}`;
    btn.textContent = sub;
    btn.onclick = () => { state.sub = sub; renderProducts(); };
    subFilters.appendChild(btn);
  });
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const existing = state.cart.find((i) => i.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  showToast(`${product.title} added to cart`);
}

// Fixed Quantity Update
function setQty(id, qty) {
  if (qty <= 0) {
    state.cart = state.cart.filter((i) => i.id !== id);
  } else {
    const item = state.cart.find((i) => i.id === id);
    if (item) item.qty = qty;
  }
  saveCart();
  renderCart();
}

function cartLines() {
  return state.cart
    .map((item) => ({ ...item, product: products.find((p) => p.id === item.id) }))
    .filter((item) => item.product);
}

function totals() {
  const subtotal = cartLines().reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 15000 ? 0 : 250;
  return { subtotal, shipping, grand: subtotal + shipping };
}

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((sum, item) => sum + item.qty, 0);
  const total = totals();
  cartCount.textContent = count;
  cartCount.hidden = count === 0;
  cartItems.innerHTML = lines.length ? lines.map((item) => `
        <div class="cart-line">
          <div class="thumb">${productArt(item.product, true)}</div>
          <div>
            <h3>${item.product.title}</h3>
            <p>${money(item.product.price)} each</p>
            <div class="qty">
              <div class="stepper">
                <button data-dec="${item.id}" aria-label="Decrease quantity">-</button>
                <span>${item.qty}</span>
                <button data-inc="${item.id}" aria-label="Increase quantity">+</button>
              </div>
              <strong>${money(item.product.price * item.qty)}</strong>
            </div>
          </div>
        </div>
      `).join("") : `<div class="empty">Your cart is empty.</div>`;
  cartSummary.innerHTML = `
        <div class="summary-row"><span>Subtotal</span><strong>${money(total.subtotal)}</strong></div>
        <div class="summary-row"><span>Shipping</span><strong>${total.shipping ? money(total.shipping) : "Free"}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>${money(total.grand)}</strong></div>
        <button class="btn" style="width: 100%; margin-top: 14px;" data-scroll="checkout" ${lines.length ? "" : "disabled"}>Checkout</button>
      `;
  checkoutSummary.innerHTML = lines.length ? `
        <h2 style="font-size: 30px; margin-bottom: 18px;">Summary</h2>
        ${lines.map((item) => `<div class="summary-row"><span>${item.product.title} x ${item.qty}</span><strong>${money(item.product.price * item.qty)}</strong></div>`).join("")}
        <div class="summary-row total"><span>Total</span><strong>${money(total.grand)}</strong></div>
      ` : `<div class="empty">Add products to see the order summary.</div>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

// FIXED: Smooth Background Image Overlay Slider Logic
function renderHeroSlide(index) {
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroSlideIndex];
  
  hero.style.backgroundImage = `
    linear-gradient(90deg, rgba(219, 213, 202, .72) 0%, rgba(219, 213, 202, .48) 27%, rgba(219, 213, 202, .04) 50%),
    linear-gradient(0deg, rgba(33, 27, 23, .08), rgba(33, 27, 23, .08)),
    url("${slide.image}")
  `;
  
  heroEyebrow.textContent = slide.eyebrow;
  heroTitle.innerHTML = `${slide.title} <span>${slide.subtitle}</span>`;
  heroCounter.textContent = `${String(heroSlideIndex + 1).padStart(2, "0")} / ${String(heroSlides.length).padStart(2, "0")}`;
  
  heroProgressButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.heroSlide) === heroSlideIndex);
  });
}

function startHeroSlider() {
  window.clearInterval(heroSlideTimer);
  heroSlideTimer = window.setInterval(() => renderHeroSlide(heroSlideIndex + 1), 4000);
}

heroProgressButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderHeroSlide(Number(button.dataset.heroSlide));
    startHeroSlider();
  });
});

document.querySelectorAll("[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.category = btn.dataset.filter;
    state.sub = "All";
    renderProducts();
    document.getElementById("shop").scrollIntoView();
  });
});

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.add) addToCart(target.dataset.add);
  if (target.dataset.inc) setQty(target.dataset.inc, (state.cart.find((i) => i.id === target.dataset.inc)?.qty || 0) + 1);
  if (target.dataset.dec) setQty(target.dataset.dec, (state.cart.find((i) => i.id === target.dataset.dec)?.qty || 0) - 1);
  if (target.dataset.scroll) {
    if (target.dataset.scroll === "checkout" && !state.user) {
      openAuthModal("Please login or sign up to continue checkout.", "login");
      showToast("Please login or sign up to continue checkout.");
      return;
    }
    document.getElementById(target.dataset.scroll).scrollIntoView();
    cartDrawer.classList.remove("open");
  }
  if (target.dataset.view === "home") document.getElementById("home").scrollIntoView();
});

search.addEventListener("input", () => {
  state.query = search.value.trim();
  renderProducts();
});
sort.addEventListener("change", () => {
  state.sort = sort.value;
  renderProducts();
});
document.getElementById("openCart").onclick = () => cartDrawer.classList.add("open");
document.getElementById("closeCart").onclick = () => cartDrawer.classList.remove("open");

// --- Login Modal Controls ---
const loginNavBtn = document.querySelector('.header-actions .login-btn[type="button"]');
const loginModal = document.getElementById('loginModal');
const closeLoginBtn = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authSubtitle = document.getElementById('authSubtitle');
const authMessage = document.getElementById('authMessage');
const authUsersKey = 'noorUsers';
const authSessionKey = 'noorAuthUser';
const ordersKey = 'noorOrders';
const profileWrapper = document.querySelector('.profile-menu-wrapper');
const profileToggle = document.querySelector('.profile-toggle');
const profileMenu = document.querySelector('.profile-menu');
const dashboardPanel = document.getElementById('userDashboardPanel');
const dashboardInfo = document.getElementById('dashboardInfo');
const dashboardOrders = document.getElementById('dashboardOrders');
const dashboardTotalOrders = document.getElementById('dashboardTotalOrders');
const dashboardWalletBalance = document.getElementById('dashboardWalletBalance');
const dashboardWishlistCount = document.getElementById('dashboardWishlistCount');
const dashboardUserName = document.getElementById('dashboardUserName');
const dashboardSavedAddress = document.getElementById('dashboardSavedAddress');
const closeDashboardPanel = document.getElementById('closeDashboardPanel');

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(authUsersKey) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(authUsersKey, JSON.stringify(users));
}

function readAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(authSessionKey) || 'null');
  } catch {
    return null;
  }
}

function saveAuthUser(user) {
  localStorage.setItem(authSessionKey, JSON.stringify(user));
  state.user = user;
  updateAuthUi();
}

function getStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem(ordersKey) || '[]');
  } catch {
    return [];
  }
}

function saveStoredOrders(orders) {
  localStorage.setItem(ordersKey, JSON.stringify(orders));
}

function saveUserOrder(order) {
  const orders = getStoredOrders();
  orders.unshift(order);
  saveStoredOrders(orders);
}

function clearAuthUser() {
  localStorage.removeItem(authSessionKey);
  state.user = null;
  updateAuthUi();
}

function updateAuthUi() {
  if (!loginNavBtn) return;
  if (state.user) {
    loginNavBtn.hidden = true;
    if (profileWrapper) profileWrapper.hidden = false;
    if (profileToggle) {
      profileToggle.textContent = `Hi ${state.user.name ? state.user.name.split(' ')[0] : 'User'}`;
      profileToggle.setAttribute('aria-expanded', 'false');
    }
    if (profileMenu) profileMenu.hidden = true;
  } else {
    loginNavBtn.hidden = false;
    if (profileWrapper) profileWrapper.hidden = true;
  }
}

function showAuthMessage(message, type = 'info') {
  if (!authMessage) return;
  authMessage.hidden = false;
  authMessage.textContent = message;
  authMessage.style.color = type === 'error' ? '#8d2538' : '#1f5f52';
}

function hideAuthMessage() {
  if (!authMessage) return;
  authMessage.hidden = true;
  authMessage.textContent = '';
}

function setAuthMode(mode) {
  const isSignup = mode === 'signup';
  if (loginForm) loginForm.style.display = isSignup ? 'none' : 'block';
  if (signupForm) signupForm.style.display = isSignup ? 'block' : 'none';
  if (authSubtitle) {
    authSubtitle.textContent = isSignup ? 'Create your Fashion Hub account' : 'Sign in to your Fashion Hub account';
  }
  hideAuthMessage();
}

function openAuthModal(message = '', mode = 'login') {
  if (!loginModal) return;
  setAuthMode(mode);
  loginModal.style.display = 'flex';
  loginModal.setAttribute('aria-hidden', 'false');
  if (message) {
    showAuthMessage(message, message.toLowerCase().includes('please') || message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('no account') ? 'error' : 'info');
  }
}

function closeAuthModal() {
  if (!loginModal) return;
  loginModal.style.display = 'none';
  loginModal.setAttribute('aria-hidden', 'true');
  hideAuthMessage();
}

if (loginNavBtn && loginModal) {
  loginNavBtn.addEventListener('click', () => {
    if (state.user) {
      showToast(`Signed in as ${state.user.email}`);
      return;
    }
    openAuthModal();
  });
}

if (profileToggle && profileMenu) {
  profileToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = profileMenu.hidden === false;
    profileMenu.hidden = isOpen;
    profileToggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

window.addEventListener('click', (event) => {
  if (profileMenu && profileToggle && !event.target.closest('.profile-menu-wrapper')) {
    profileMenu.hidden = true;
    profileToggle.setAttribute('aria-expanded', 'false');
  }
});

if (profileMenu) {
  profileMenu.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset?.action;
    if (!action) return;
    profileMenu.hidden = true;
    if (profileToggle) profileToggle.setAttribute('aria-expanded', 'false');
    if (action === 'dashboard') {
      renderUserDashboard();
      if (dashboardPanel) dashboardPanel.hidden = false;
      dashboardPanel?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (action === 'signout') {
      clearAuthUser();
      showToast('Signed out successfully.');
    }
  });
}

if (closeDashboardPanel) {
  closeDashboardPanel.addEventListener('click', () => {
    dashboardPanel.hidden = true;
  });
}

if (closeLoginBtn && loginModal) {
  closeLoginBtn.addEventListener('click', closeAuthModal);
}

// Close the modal when clicking on the dark background overlay
window.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    closeAuthModal();
  }
});

if (showRegisterLink) {
  showRegisterLink.addEventListener('click', (event) => {
    event.preventDefault();
    setAuthMode('signup');
  });
}

if (showLoginLink) {
  showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    setAuthMode('login');
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const users = getStoredUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email);

    if (!existingUser) {
      showAuthMessage('No account found. Please sign up first.', 'error');
      return;
    }

    if (existingUser.password !== password) {
      showAuthMessage('Incorrect password. Please try again.', 'error');
      return;
    }

    saveAuthUser({ name: existingUser.name, email: existingUser.email });
    closeAuthModal();
    showToast('Login successful. You can now checkout.');
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
      showAuthMessage('Please complete all fields to create your account.', 'error');
      return;
    }

    const users = getStoredUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      showAuthMessage('An account with this email already exists. Please log in instead.', 'error');
      return;
    }

    users.push({ name, email, password });
    saveStoredUsers(users);
    saveAuthUser({ name, email });
    closeAuthModal();
    showToast('Account created. You can now checkout.');
  });
}

state.user = readAuthUser();
updateAuthUi();

// --- Social Login Handlers ---
const socialButtons = document.querySelectorAll('.btn-social');

socialButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const provider = e.currentTarget.getAttribute('data-provider');
    handleSocialLogin(provider);
  });
});

function handleSocialLogin(provider) {
  const providerMeta = {
    google: { label: 'Google', email: 'google.user@example.com' },
    facebook: { label: 'Facebook', email: 'facebook.user@example.com' },
    apple: { label: 'Apple', email: 'apple.user@example.com' }
  };

  const meta = providerMeta[provider];
  if (!meta) {
    console.error('Unknown provider');
    return;
  }

  const users = getStoredUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === meta.email);
  const name = `${meta.label} User`;

  if (!existingUser) {
    users.push({ name, email: meta.email, password: 'social-login' });
    saveStoredUsers(users);
  }

  saveAuthUser({ name, email: meta.email });
  closeAuthModal();
  showToast(`Signed in with ${meta.label}`);
}
// Cleaned up missing chat input references to prevent errors

const clearCart = document.getElementById("clearCart");
if (clearCart) {
  clearCart.onclick = () => {
    state.cart = [];
    saveCart();
    renderCart();
    showToast("Cart cleared");
  };
}

document.getElementById("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const lines = cartLines();
  if (!state.user) {
    openAuthModal("Please login or sign up to place your order.", "login");
    showToast("Please login or sign up to place your order.");
    return;
  }
  if (!lines.length) {
    showToast("Cart is empty");
    return;
  }
  const total = totals();
  const notice = document.getElementById("orderNotice");
  const orderId = "NOOR-" + Date.now().toString().slice(-6);
  const createdAt = Date.now();
  const deliveryDays = 5;
  const order = {
    orderId,
    name: document.getElementById("name").value,
    email: state.user.email,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    payment: document.getElementById("payment").value,
    reference: document.getElementById("reference").value,
    items: lines,
    total,
    createdAt,
    deliveryDays
  };
  notice.hidden = false;
  notice.textContent = `Order ${orderId} saved locally for ${order.name}. Total: ${money(total.grand)}.`;
  saveUserOrder(order);
  state.cart = [];
  saveCart();
  renderCart();
  showToast("Local order placed");
});

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' });
}

function renderUserDashboard() {
  const userOrders = getStoredOrders().filter((order) => order.email === state.user?.email);
  if (!dashboardInfo || !dashboardOrders) return;
  if (!userOrders.length) {
    dashboardInfo.innerHTML = `<p>You have no recent orders yet. Place an order to see delivery progress here.</p>`;
    dashboardOrders.innerHTML = '';
    return;
  }
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((sum, order) => sum + (order.total?.grand || 0), 0);
  const nextOrder = userOrders[0];
  const deliveryDate = new Date(nextOrder.createdAt + nextOrder.deliveryDays * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((deliveryDate - Date.now()) / (1000 * 60 * 60 * 24)));
  if (dashboardUserName) {
    dashboardUserName.textContent = state.user.name.split(' ')[0] || 'Customer';
  }
  if (dashboardTotalOrders) {
    dashboardTotalOrders.textContent = String(totalOrders);
  }
  if (dashboardWalletBalance) {
    dashboardWalletBalance.textContent = money(Math.max(4500, Math.round(totalSpent * 0.15)));
  }
  if (dashboardWishlistCount) {
    dashboardWishlistCount.textContent = '0';
  }
  if (dashboardSavedAddress) {
    dashboardSavedAddress.textContent = state.user.address || 'No saved address yet.';
  }
  dashboardInfo.innerHTML = `
    <h4>Account Information</h4>
    <p><strong>${state.user.name}</strong></p>
    <p>${state.user.email}</p>
    <p>${state.user.phone || 'No phone number saved'}</p>
  `;
  dashboardOrders.innerHTML = userOrders.map((order) => {
    const expectedDate = formatDate(order.createdAt + order.deliveryDays * 24 * 60 * 60 * 1000);
    const orderAmount = money(order.total.grand);
    return `
      <article class="dashboard-card">
        <h4>Order ${order.orderId}</h4>
        <p><strong>Placed:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Total:</strong> ${orderAmount}</p>
        <p><strong>Items:</strong> ${order.items.length}</p>
        <p><strong>Expected delivery:</strong> ${expectedDate} (${order.deliveryDays} days after order)</p>
      </article>
    `;
  }).join('');
}

// App Startup Initializers
renderProducts();
renderCart();
renderHeroSlide(heroSlideIndex);
startHeroSlider();
// --- PREMIUM OPERATIONAL CHATBOT SYSTEM LOGIC ---
const cbTrigger = document.getElementById("chatbotTrigger");
const cbWindow = document.getElementById("chatWindow");
const cbClose = document.getElementById("closeChat");
const cbInput = document.getElementById("chatInput");
const cbSendBtn = document.getElementById("sendMessageBtn");
const cbMessages = document.getElementById("chatMessages");

// Initially window is kept closed. Toggle open state on click.
if (cbTrigger && cbWindow) {
  cbTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    cbWindow.classList.toggle("open");
    if (cbWindow.classList.contains("open")) {
      cbInput.focus();
    }
  });
}

// Close Chat window on cross button click
if (cbClose && cbWindow) {
  cbClose.addEventListener("click", (e) => {
    e.stopPropagation();
    cbWindow.classList.remove("open");
  });
}

// Append generated messages safely inside the body UI
function postBotMessage(text, side) {
  const msgHtml = document.createElement("div");
  msgHtml.className = `msg ${side}-msg`;
  msgHtml.innerHTML = `<p>${text}</p><span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
  cbMessages.appendChild(msgHtml);
  cbMessages.scrollTop = cbMessages.scrollHeight;
}

// Intelligent Routing Engine
function runBotEngine(userInput) {
  let botReply = "I'm processing your request. Let me know if you are tracking an order or looking for products!";
  const normText = userInput.toLowerCase().trim();

  if (normText.includes("hi") || normText.includes("hello") || normText.includes("hey")) {
    botReply = "Hello! Welcome to NOOR Fashion Hub. How can I guide your premium shopping experience today? ✨";
  } else if (normText.includes("shoe") || normText.includes("sneaker") || normText.includes("heel")) {
    botReply = "Searching for our top-tier Shoes collection for you right now. Let me scroll down the grid!";
    const searchField = document.getElementById("search");
    if (searchField && typeof renderProducts === 'function') {
      searchField.value = "Shoes";
      state.query = "Shoes";
      renderProducts();
      const shopSec = document.getElementById("shop");
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
    }
  } else if (normText.includes("cart") || normText.includes("bag") || normText.includes("show")) {
    const activeLines = (typeof cartLines === 'function') ? cartLines() : [];
    if (activeLines && activeLines.length > 0) {
      botReply = `You have active items in your bag. Let me pull open the slider drawer right now!`;
      const drawer = document.getElementById("cartDrawer");
      if (drawer) setTimeout(() => { drawer.classList.add("open"); }, 500);
    } else {
      botReply = "Your shopping bag is empty. Explore our Emerald Reverie bridal collection to add styles!";
    }
  } else if (normText.includes("track") || normText.includes("order") || normText.includes("checkout")) {
    botReply = "Directing you straight down to our secure Local Order Form panel...";
    const checkSec = document.getElementById("checkout");
    if (checkSec) { setTimeout(() => { checkSec.scrollIntoView({ behavior: 'smooth' }); }, 500); }
  } else if (normText.includes("price") || normText.includes("sale")) {
    botReply = "Our products start from Rs. 1,450! You can use the sorting tool to filter prices from Low to High anytime.";
  }

  setTimeout(() => {
    postBotMessage(botReply, "bot");
  }, 600);
}

function sendUserText() {
  const rawVal = cbInput.value.trim();
  if (!rawVal) return;
  postBotMessage(rawVal, "user");
  cbInput.value = "";
  runBotEngine(rawVal);
}

if (cbSendBtn) { cbSendBtn.addEventListener("click", sendUserText); }
if (cbInput) {
  cbInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendUserText();
  });
}

// Quick Badge pills triggers
document.querySelectorAll(".feature-badge").forEach(badge => {
  badge.addEventListener("click", (e) => {
    const selectedAction = e.currentTarget.dataset.action;
    if (selectedAction === "shoes") {
      postBotMessage("Show me the latest shoes collection", "user");
      runBotEngine("shoes");
    } else if (selectedAction === "cart") {
      postBotMessage("Open my shopping cart status", "user");
      runBotEngine("cart");
    } else if (selectedAction === "order") {
      postBotMessage("I want to complete or track my order form", "user");
      runBotEngine("order");
    }
  });
});

