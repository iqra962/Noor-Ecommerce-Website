(function () {
  initAdminPage({ title: "Dashboard", subtitle: "A quick look at how the store is doing today" });

  const orders = getOrders().sort((a, b) => b.createdAt - a.createdAt);
  const users = getUsers();
  const products = getProducts();

  /* ---------- stat cards ---------- */
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total?.grand || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  document.getElementById("statRevenue").textContent = money(totalRevenue);
  document.getElementById("statOrders").textContent = totalOrders;
  document.getElementById("statCustomers").textContent = totalCustomers;
  document.getElementById("statAOV").textContent = money(aov);

  // simple "last 7 days vs previous 7 days" delta for revenue & orders
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last7 = orders.filter((o) => now - o.createdAt <= 7 * day);
  const prev7 = orders.filter((o) => now - o.createdAt > 7 * day && now - o.createdAt <= 14 * day);
  const last7Rev = last7.reduce((s, o) => s + (o.total?.grand || 0), 0);
  const prev7Rev = prev7.reduce((s, o) => s + (o.total?.grand || 0), 0);

  function renderDelta(elId, current, previous, suffix) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!previous && !current) { el.textContent = "No activity yet"; return; }
    if (!previous) { el.innerHTML = `<span class="up">▲ new activity</span>`; return; }
    const pct = Math.round(((current - previous) / previous) * 100);
    const up = pct >= 0;
    el.innerHTML = `<span class="${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(pct)}% ${suffix || "vs last week"}</span>`;
  }
  renderDelta("statRevenueDelta", last7Rev, prev7Rev);
  renderDelta("statOrdersDelta", last7.length, prev7.length);
  document.getElementById("statCustomersDelta").innerHTML = `<span class="up">${totalCustomers} registered</span>`;
  document.getElementById("statAOVDelta").innerHTML = `<span class="up">across ${totalOrders} order(s)</span>`;

  /* ---------- revenue chart: last 14 days ---------- */
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * day);
    days.push(d);
  }
  const revenueByDay = days.map((d) => {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + day;
    return orders
      .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
      .reduce((s, o) => s + (o.total?.grand || 0), 0);
  });

  const revCtx = document.getElementById("revenueChart");
  if (revCtx && window.Chart) {
    new Chart(revCtx, {
      type: "line",
      data: {
        labels: days.map((d) => d.toLocaleDateString("en-PK", { day: "numeric", month: "short" })),
        datasets: [{
          label: "Revenue",
          data: revenueByDay,
          borderColor: "#8d2538",
          backgroundColor: "rgba(141, 37, 56, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointBackgroundColor: "#8d2538",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "#efe9df" }, ticks: { callback: (v) => "Rs. " + v.toLocaleString() } },
        },
      },
    });
  }

  /* ---------- order status doughnut ---------- */
  const statusColors = { Pending: "#b98a3d", Processing: "#35607f", Shipped: "#766c63", Delivered: "#1f5f52", Cancelled: "#8d2538" };
  const statusCounts = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusLabels = Object.keys(statusCounts);

  const statusCtx = document.getElementById("statusChart");
  if (statusCtx && window.Chart) {
    if (!statusLabels.length) {
      statusCtx.parentElement.innerHTML = `<div class="empty-state"><div class="glyph">◐</div><h3>No orders yet</h3><p>Status breakdown will appear once orders come in.</p></div>`;
    } else {
      new Chart(statusCtx, {
        type: "doughnut",
        data: {
          labels: statusLabels,
          datasets: [{
            data: statusLabels.map((s) => statusCounts[s]),
            backgroundColor: statusLabels.map((s) => statusColors[s] || "#766c63"),
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { family: "Arial", size: 11 } } } },
        },
      });
    }
  }

  /* ---------- recent orders table ---------- */
  const recentBody = document.getElementById("recentOrdersBody");
  const recentEmpty = document.getElementById("recentOrdersEmpty");
  const recent = orders.slice(0, 6);
  if (!recent.length) {
    recentEmpty.hidden = false;
  } else {
    recentBody.innerHTML = recent.map((o) => `
      <tr>
        <td class="cell-title">${o.orderId}</td>
        <td>${o.name}<span class="cell-sub">${o.email || ""}</span></td>
        <td>${money(o.total?.grand)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${formatDate(o.createdAt)}</td>
      </tr>
    `).join("");
  }

  function statusBadge(status) {
    const map = { Pending: "gold", Processing: "info", Shipped: "muted", Delivered: "green", Cancelled: "accent" };
    return `<span class="badge badge-${map[status] || "muted"}">${status}</span>`;
  }

  /* ---------- low stock ---------- */
  const lowStockList = document.getElementById("lowStockList");
  const lowStockEmpty = document.getElementById("lowStockEmpty");
  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);
  if (!lowStock.length) {
    lowStockEmpty.hidden = false;
  } else {
    lowStockList.innerHTML = lowStock.slice(0, 6).map((p) => `
      <div class="row-flex" style="padding:10px 0; border-bottom:1px solid var(--soft);">
        <div class="swatch" style="background:${p.color};"></div>
        <div style="flex:1;">
          <strong style="font-size:13.5px;">${p.title}</strong>
          <span class="cell-sub">${p.category} · ${p.sub}</span>
        </div>
        <span class="badge ${p.stock === 0 ? "badge-accent" : "badge-gold"}">${p.stock === 0 ? "Out of stock" : p.stock + " left"}</span>
      </div>
    `).join("");
  }

  /* ---------- top selling products ---------- */
  const salesMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((line) => {
      const p = line.product || products.find((pp) => pp.id === line.id);
      if (!p) return;
      if (!salesMap[p.id]) salesMap[p.id] = { title: p.title, category: p.category, units: 0, revenue: 0 };
      salesMap[p.id].units += line.qty;
      salesMap[p.id].revenue += line.qty * p.price;
    });
  });
  const topProducts = Object.values(salesMap).sort((a, b) => b.units - a.units).slice(0, 6);
  const topBody = document.getElementById("topProductsBody");
  const topEmpty = document.getElementById("topProductsEmpty");
  if (!topProducts.length) {
    topEmpty.hidden = false;
  } else {
    topBody.innerHTML = topProducts.map((p) => `
      <tr>
        <td class="cell-title">${p.title}</td>
        <td>${p.category}</td>
        <td>${p.units}</td>
        <td>${money(p.revenue)}</td>
      </tr>
    `).join("");
  }
})();
