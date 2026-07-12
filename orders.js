(function () {
  initAdminPage({ title: "Orders", subtitle: "Track and update every order placed on the storefront" });

  const state = { query: "", status: "All", sortKey: "createdAt", sortDir: "desc", page: 1, pageSize: 8 };

  const statusFilter = document.getElementById("statusFilter");
  ORDER_STATUSES.forEach((s) => statusFilter.insertAdjacentHTML("beforeend", `<option value="${s}">${s}</option>`));

  document.getElementById("orderSearch").addEventListener("input", (e) => { state.query = e.target.value.trim().toLowerCase(); state.page = 1; render(); });
  statusFilter.addEventListener("change", (e) => { state.status = e.target.value; state.page = 1; render(); });

  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) { state.sortDir = state.sortDir === "asc" ? "desc" : "asc"; }
      else { state.sortKey = key; state.sortDir = key === "createdAt" ? "desc" : "asc"; }
      render();
    });
  });

  document.getElementById("exportOrdersBtn").addEventListener("click", () => {
    const rows = getOrders().map((o) => ({
      orderId: o.orderId, name: o.name, email: o.email, phone: o.phone,
      total: o.total?.grand, payment: o.payment, status: o.status, placed: formatDate(o.createdAt),
    }));
    exportCSV("noor-orders.csv", rows);
  });

  function statusBadgeClass(status) {
    const map = { Pending: "gold", Processing: "info", Shipped: "muted", Delivered: "green", Cancelled: "accent" };
    return map[status] || "muted";
  }

  function getFiltered() {
    let list = getOrders();
    if (state.status !== "All") list = list.filter((o) => o.status === state.status);
    if (state.query) {
      list = list.filter((o) =>
        o.orderId.toLowerCase().includes(state.query) ||
        (o.name || "").toLowerCase().includes(state.query) ||
        (o.email || "").toLowerCase().includes(state.query)
      );
    }
    list = [...list].sort((a, b) => {
      let av, bv;
      if (state.sortKey === "grand") { av = a.total?.grand || 0; bv = b.total?.grand || 0; }
      else { av = a[state.sortKey]; bv = b[state.sortKey]; }
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }

  let currentOrderId = null;

  function openOrderDetail(orderId) {
    const order = getOrders().find((o) => o.orderId === orderId);
    if (!order) return;
    currentOrderId = orderId;

    document.getElementById("orderModalTitle").textContent = order.orderId;
    document.getElementById("orderModalSubtitle").textContent = `Placed ${formatDateTime(order.createdAt)}`;
    document.getElementById("detailCustomer").textContent = order.name;
    document.getElementById("detailContact").textContent = `${order.email || "—"} · ${order.phone || "—"}`;
    document.getElementById("detailAddress").textContent = order.address || "—";
    document.getElementById("detailPayment").textContent = order.payment || "—";
    document.getElementById("detailReference").textContent = order.reference ? "Ref: " + order.reference : "No reference provided";

    const statusSelect = document.getElementById("detailStatusSelect");
    statusSelect.innerHTML = ORDER_STATUSES.map((s) => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`).join("");

    const items = order.items || [];
    document.getElementById("detailItems").innerHTML = items.map((line) => {
      const p = line.product || {};
      return `
        <div class="line-item">
          <div class="swatch" style="background:${p.color || "#ccc"};"></div>
          <div class="line-item-info">
            <strong>${p.title || "Product"}</strong>
            <span>${p.category || ""} · Qty ${line.qty}</span>
          </div>
          <div class="line-item-price">${money((p.price || 0) * line.qty)}</div>
        </div>
      `;
    }).join("") || `<p style="color:var(--muted); font-family:Arial, sans-serif; font-size:13px;">No item details available.</p>`;

    const t = order.total || {};
    document.getElementById("detailTotals").innerHTML = `
      <div class="totals-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      <div class="totals-row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : "Free"}</span></div>
      <div class="totals-row grand"><span>Total</span><span>${money(t.grand)}</span></div>
    `;

    openModal("orderModal");
  }

  document.getElementById("saveOrderStatusBtn").addEventListener("click", () => {
    if (!currentOrderId) return;
    const newStatus = document.getElementById("detailStatusSelect").value;
    const orders = getOrders();
    const idx = orders.findIndex((o) => o.orderId === currentOrderId);
    if (idx > -1) {
      orders[idx].status = newStatus;
      saveOrders(orders);
      showToast(`${currentOrderId} marked as ${newStatus}`, "success");
      closeModal("orderModal");
      render();
      renderBell();
    }
  });

  document.getElementById("deleteOrderBtn").addEventListener("click", () => {
    if (!currentOrderId) return;
    if (!confirm(`Delete order ${currentOrderId}? This cannot be undone.`)) return;
    const orders = getOrders().filter((o) => o.orderId !== currentOrderId);
    saveOrders(orders);
    showToast("Order deleted", "success");
    closeModal("orderModal");
    currentOrderId = null;
    render();
  });

  function render() {
    const all = getFiltered();
    document.getElementById("orderCountLabel").textContent = `${all.length} order${all.length === 1 ? "" : "s"}`;

    const PAGE_SIZE = state.pageSize;
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const pageItems = all.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    const body = document.getElementById("ordersBody");
    const empty = document.getElementById("ordersEmpty");
    if (!pageItems.length) {
      body.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = pageItems.map((o) => `
        <tr>
          <td class="cell-title">${o.orderId}</td>
          <td>${o.name}<span class="cell-sub">${o.email || ""}</span></td>
          <td>${(o.items || []).reduce((s, i) => s + i.qty, 0)} item(s)</td>
          <td>${money(o.total?.grand)}</td>
          <td>${o.payment || "—"}</td>
          <td>
            <select class="status-select quick-status" data-order="${o.orderId}">
              ${ORDER_STATUSES.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </td>
          <td>${formatDate(o.createdAt)}</td>
          <td><button class="icon-btn" title="View" data-view="${o.orderId}">⌕</button></td>
        </tr>
      `).join("");
    }

    document.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => openOrderDetail(btn.dataset.view)));
    document.querySelectorAll(".quick-status").forEach((sel) => {
      sel.addEventListener("change", () => {
        const orders = getOrders();
        const idx = orders.findIndex((o) => o.orderId === sel.dataset.order);
        if (idx > -1) {
          orders[idx].status = sel.value;
          saveOrders(orders);
          showToast(`${sel.dataset.order} marked as ${sel.value}`, "success");
          renderBell();
        }
      });
    });

    renderPagination(totalPages);
    document.querySelectorAll("th.sortable").forEach((th) => {
      const arrow = th.querySelector(".sort-arrow");
      if (th.dataset.sort === state.sortKey) arrow.textContent = state.sortDir === "asc" ? "↑" : "↓";
      else arrow.textContent = "↕";
    });
  }

  function renderPagination(totalPages) {
    const el = document.getElementById("ordersPagination");
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    let btns = "";
    for (let i = 1; i <= totalPages; i++) btns += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
    el.innerHTML = `
      <span>Page ${state.page} of ${totalPages}</span>
      <div class="pagination-btns">
        <button class="page-btn" id="prevPage" ${state.page === 1 ? "disabled" : ""}>‹</button>
        ${btns}
        <button class="page-btn" id="nextPage" ${state.page === totalPages ? "disabled" : ""}>›</button>
      </div>
    `;
    document.getElementById("prevPage").addEventListener("click", () => { state.page--; render(); });
    document.getElementById("nextPage").addEventListener("click", () => { state.page++; render(); });
    el.querySelectorAll("[data-page]").forEach((btn) => btn.addEventListener("click", () => { state.page = Number(btn.dataset.page); render(); }));
  }

  render();
})();
