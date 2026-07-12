(function () {
  // Already signed in? go straight to the dashboard.
  if (getSession()) {
    window.location.href = "admin.html";

    return;
  }

  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const auth = getAdminAuth();

    if (email !== auth.email.toLowerCase() || password !== auth.password) {
      errorEl.textContent = "Incorrect email or password. Please try again.";
      errorEl.classList.add("show");
      return;
    }

    errorEl.classList.remove("show");
    saveSession({ email: auth.email, loginAt: Date.now() });
    window.location.href = "index.html";
  });
})();
