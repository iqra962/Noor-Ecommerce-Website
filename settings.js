(function () {
  initAdminPage({ title: "Settings", subtitle: "Store profile, admin account and data management" });

  const store = getStoreSettings();
  document.getElementById("storeName").value = store.storeName;
  document.getElementById("storeEmail").value = store.email;
  document.getElementById("storePhone").value = store.phone;
  document.getElementById("storeCurrency").value = store.currency;

  const auth = getAdminAuth();
  document.getElementById("accountName").value = auth.name;
  document.getElementById("accountEmail").value = auth.email;

  document.getElementById("storeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveStoreSettings({
      storeName: document.getElementById("storeName").value.trim(),
      email: document.getElementById("storeEmail").value.trim(),
      phone: document.getElementById("storePhone").value.trim(),
      currency: document.getElementById("storeCurrency").value.trim() || "Rs.",
    });
    showToast("Store profile saved", "success");
    renderSidebar();
  });

  document.getElementById("accountForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const current = getAdminAuth();
    const newPassword = document.getElementById("accountPassword").value;
    const updated = {
      name: document.getElementById("accountName").value.trim() || current.name,
      email: document.getElementById("accountEmail").value.trim() || current.email,
      password: newPassword ? newPassword : current.password,
    };
    saveAdminAuth(updated);
    // keep the session in sync with the (possibly changed) login email
    const session = getSession();
    if (session) saveSession({ ...session, email: updated.email });
    document.getElementById("accountPassword").value = "";
    showToast("Admin account updated", "success");
    renderSidebar();
  });

  document.getElementById("exportAllBtn").addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      products: getProducts(),
      orders: getOrders(),
      customers: getUsers(),
      storeSettings: getStoreSettings(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "noor-store-data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported", "success");
  });

  document.getElementById("reseedBtn").addEventListener("click", () => {
    if (!confirm("Reset the product catalog to its default 14 items? Custom products and edits will be lost.")) return;
    saveProducts(DEFAULT_PRODUCTS.map((p) => ({ ...p })));
    showToast("Product catalog reset to defaults", "success");
    renderBell();
  });

  document.getElementById("clearOrdersBtn").addEventListener("click", () => openModal("clearOrdersModal"));
  document.getElementById("confirmClearOrdersBtn").addEventListener("click", () => {
    saveOrders([]);
    closeModal("clearOrdersModal");
    showToast("All orders cleared", "success");
    renderBell();
  });
})();
