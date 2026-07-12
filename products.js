(function () {
  initAdminPage({ title: "Products", subtitle: "Manage your catalog, pricing and stock", search: false });

  const state = { query: "", category: "All", stock: "All", sortKey: "title", sortDir: "asc", page: 1, pageSize: 8 };
  const PAGE_SIZE = state.pageSize;

  const categorySelect = document.getElementById("categoryFilter");
  CATEGORIES.forEach((c) => categorySelect.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));

  const productCategorySelect = document.getElementById("productCategory");
  CATEGORIES.forEach((c) => productCategorySelect.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));

  document.getElementById("productSearch").addEventListener("input", (e) => { state.query = e.target.value.trim().toLowerCase(); state.page = 1; render(); });
  categorySelect.addEventListener("change", (e) => { state.category = e.target.value; state.page = 1; render(); });
  document.getElementById("stockFilter").addEventListener("change", (e) => { state.stock = e.target.value; state.page = 1; render(); });

  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) { state.sortDir = state.sortDir === "asc" ? "desc" : "asc"; }
      else { state.sortKey = key; state.sortDir = "asc"; }
      render();
    });
  });

  document.getElementById("addProductBtn").addEventListener("click", () => openProductForm());
  document.getElementById("exportProductsBtn").addEventListener("click", () => {
    const rows = getProducts().map((p) => ({ id: p.id, title: p.title, category: p.category, sub: p.sub, price: p.price, stock: p.stock, featured: p.featured }));
    exportCSV("noor-products.csv", rows);
  });

  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProductFromForm();
  });

  let pendingDeleteId = null;
  document.getElementById("confirmDeleteProductBtn").addEventListener("click", () => {
    if (!pendingDeleteId) return;
    const list = getProducts().filter((p) => p.id !== pendingDeleteId);
    saveProducts(list);
    pendingDeleteId = null;
    closeModal("deleteProductModal");
    showToast("Product removed", "success");
    render();
  });

  function openProductForm(product) {
    document.getElementById("productModalTitle").textContent = product ? "Edit Product" : "Add Product";
    document.getElementById("productId").value = product ? product.id : "";
    document.getElementById("productTitle").value = product ? product.title : "";
    document.getElementById("productCategory").value = product ? product.category : CATEGORIES[0];
    document.getElementById("productSub").value = product ? product.sub : "";
    document.getElementById("productPrice").value = product ? product.price : "";
    document.getElementById("productStock").value = product ? product.stock : "";
    document.getElementById("productColor").value = product ? product.color : "#8d2538";
    document.getElementById("productAccent").value = product ? product.accent : "#b98a3d";
    document.getElementById("productFeatured").value = product && product.featured ? product.featured : "";
    document.getElementById("productImage").value = product ? product.image : "";
    openModal("productModal");
  }

  function saveProductFromForm() {
    const id = document.getElementById("productId").value;
    const list = getProducts();
    const data = {
      title: document.getElementById("productTitle").value.trim(),
      category: document.getElementById("productCategory").value,
      sub: document.getElementById("productSub").value.trim(),
      price: Number(document.getElementById("productPrice").value) || 0,
      stock: Number(document.getElementById("productStock").value) || 0,
      color: document.getElementById("productColor").value,
      accent: document.getElementById("productAccent").value,
      featured: Number(document.getElementById("productFeatured").value) || 0,
      image: document.getElementById("productImage").value.trim() || "placeholder.jpg",
    };

    if (id) {
      const idx = list.findIndex((p) => p.id === id);
      if (idx > -1) list[idx] = { ...list[idx], ...data };
      showToast("Product updated", "success");
    } else {
      const newId = "n-" + String(Date.now()).slice(-6);
      list.unshift({ id: newId, ...data });
      showToast("Product added", "success");
    }
    saveProducts(list);
    closeModal("productModal");
    render();
  }

  function getFiltered() {
    let list = getProducts();
    if (state.category !== "All") list = list.filter((p) => p.category === state.category);
    if (state.stock === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    if (state.stock === "out") list = list.filter((p) => p.stock === 0);
    if (state.query) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(state.query) ||
        p.category.toLowerCase().includes(state.query) ||
        p.sub.toLowerCase().includes(state.query)
      );
    }
    list = [...list].sort((a, b) => {
      let av = a[state.sortKey], bv = b[state.sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }

  function stockBadge(stock) {
    if (stock === 0) return `<span class="badge badge-accent">Out of stock</span>`;
    if (stock <= 5) return `<span class="badge badge-gold">${stock} left</span>`;
    return `<span class="badge badge-green">${stock} in stock</span>`;
  }

  function render() {
    const all = getFiltered();
    document.getElementById("productCountLabel").textContent = `${all.length} product${all.length === 1 ? "" : "s"}`;

    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const pageItems = all.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    const body = document.getElementById("productsBody");
    const empty = document.getElementById("productsEmpty");
    if (!pageItems.length) {
      body.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = pageItems.map((p) => `
        <tr>
          <td><div class="swatch" style="background:${p.color};"></div></td>
          <td class="cell-title">${p.title}<span class="cell-sub">${p.id}</span></td>
          <td>${p.category}<span class="cell-sub">${p.sub}</span></td>
          <td>${money(p.price)}</td>
          <td>${stockBadge(p.stock)}</td>
          <td>${p.featured ? "#" + p.featured : "—"}</td>
          <td>
            <div class="row-flex">
              <button class="icon-btn" title="Edit" data-edit="${p.id}">✎</button>
              <button class="icon-btn danger" title="Delete" data-delete="${p.id}">🗑</button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    document.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = getProducts().find((p) => p.id === btn.dataset.edit);
        openProductForm(product);
      });
    });
    document.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = getProducts().find((p) => p.id === btn.dataset.delete);
        pendingDeleteId = btn.dataset.delete;
        document.getElementById("deleteProductText").textContent = `“${product.title}” will be permanently removed from the catalog.`;
        openModal("deleteProductModal");
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
    const el = document.getElementById("productsPagination");
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    let btns = "";
    for (let i = 1; i <= totalPages; i++) {
      btns += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
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
