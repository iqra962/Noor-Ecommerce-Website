(function () {
  initAdminPage({ title: "Customers", subtitle: "Everyone who has created an account on the storefront" });

  const state = { query: "", sortKey: "name", sortDir: "asc" };
  const orders = getOrders();

  function buildCustomers() {
    return getUsers().map((u) => {
      const theirOrders = orders.filter((o) => (o.email || "").toLowerCase() === (u.email || "").toLowerCase());
      const totalSpent = theirOrders.reduce((s, o) => s + (o.total?.grand || 0), 0);
      const lastOrder = theirOrders.sort((a, b) => b.createdAt - a.createdAt)[0];
      return { name: u.name, email: u.email, orderCount: theirOrders.length, totalSpent, lastOrder, orders: theirOrders };
    });
  }

  document.getElementById("customerSearch").addEventListener("input", (e) => { state.query = e.target.value.trim().toLowerCase(); render(); });
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      else { state.sortKey = key; state.sortDir = "asc"; }
      render();
    });
  });

  document.getElementById("exportCustomersBtn").addEventListener("click", () => {
    const rows = buildCustomers().map((c) => ({ name: c.name, email: c.email, orders: c.orderCount, totalSpent: c.totalSpent }));
    exportCSV("noor-customers.csv", rows);
  });

  function openCustomer(email) {
    const c = buildCustomers().find((x) => x.email === email);
    if (!c) return;
    document.getElementById("customerModalTitle").textContent = c.name;
    document.getElementById("customerModalSubtitle").textContent = c.email;
    document.getElementById("customerOrderCount").textContent = c.orderCount;
    document.getElementById("customerTotalSpent").textContent = money(c.totalSpent);
    const list = document.getElementById("customerOrderList");
    if (!c.orders.length) {
      list.innerHTML = `<p style="color:var(--muted); font-family:Arial, sans-serif; font-size:13px;">No orders placed yet.</p>`;
    } else {
      list.innerHTML = c.orders.sort((a, b) => b.createdAt - a.createdAt).map((o) => `
        <div class="line-item">
          <div class="line-item-info">
            <strong>${o.orderId}</strong>
            <span>${formatDate(o.createdAt)} · ${o.status}</span>
          </div>
          <div class="line-item-price">${money(o.total?.grand)}</div>
        </div>
      `).join("");
    }
    openModal("customerModal");
  }

  function render() {
    let list = buildCustomers();
    if (state.query) {
      list = list.filter((c) => (c.name || "").toLowerCase().includes(state.query) || (c.email || "").toLowerCase().includes(state.query));
    }
    list.sort((a, b) => {
      let av = a[state.sortKey], bv = b[state.sortKey];
      if (typeof av === "string") { av = (av || "").toLowerCase(); bv = (bv || "").toLowerCase(); }
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });

    document.getElementById("customerCountLabel").textContent = `${list.length} customer${list.length === 1 ? "" : "s"}`;
    const body = document.getElementById("customersBody");
    const empty = document.getElementById("customersEmpty");

    if (!list.length) {
      body.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = list.map((c) => `
        <tr>
          <td>
            <div class="row-flex">
              <div class="avatar-chip">${initials(c.name)}</div>
              <div>
                <div class="cell-title">${c.name}</div>
                <span class="cell-sub">${c.email}</span>
              </div>
            </div>
          </td>
          <td>${c.orderCount}</td>
          <td>${money(c.totalSpent)}</td>
          <td>${c.lastOrder ? formatDate(c.lastOrder.createdAt) : "—"}</td>
          <td><button class="icon-btn" title="View" data-view="${c.email}">⌕</button></td>
        </tr>
      `).join("");
    }

    document.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => openCustomer(btn.dataset.view)));

    document.querySelectorAll("th.sortable").forEach((th) => {
      const arrow = th.querySelector(".sort-arrow");
      if (th.dataset.sort === state.sortKey) arrow.textContent = state.sortDir === "asc" ? "↑" : "↓";
      else arrow.textContent = "↕";
    });
  }

  render();
})();
