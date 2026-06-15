/* ==========================================================================
   HAMBAK TECH & SERVICES - ANTI-LOOP STABLE ENGINE
   ========================================================================== */

// Global navigation utility attached directly to window to handle onclick events from sidebar
window.showSection = function(sectionId) {
  // Hide all views
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
  });
  
  // Show target view
  const targetView = document.getElementById(sectionId);
  if (targetView) {
    targetView.classList.add('active-view');
  }

  // Manage sidebar link highlight states
  document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Find matching nav element based on view suffix
  const navId = "nav-" + sectionId.split('-')[0];
  const activeLink = document.getElementById(navId);
  if (activeLink) activeLink.classList.add('active');
};

document.addEventListener("DOMContentLoaded", () => {
  // Global State Containers
  let userProfile = null;
  let availableServices = [];

  // DOM Elements - Navigation & Core UI
  const token = localStorage.getItem("token");
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const logoutBtn = document.getElementById("logoutBtn");
  
  // Select all instances of wallet balance containers across tabs
  const walletBalanceElements = document.querySelectorAll(".wallet-balance");

  // DOM Elements - Service Dropdown Selectors
  const ninServiceSelect = document.getElementById("nin-service-select");
  const printingServiceSelect = document.getElementById("print-service-select");

  // DOM Elements - Order Submission Forms
  const ninOrderForm = document.getElementById("ninServiceForm");
  const printingOrderForm = document.getElementById("printJobForm");

  // DOM Elements - History Visualizer Tables
  const universalLogsTableBody = document.getElementById("universalLogsTableBody");
  const ordersLogTable = document.getElementById("ordersLogTable");

  // DOM Elements - Wallet Funding
  const fundWalletBtn = document.getElementById("fund-wallet-btn");
  const fundingAmountInput = document.getElementById("funding-amount-input");

  /* ==========================================================================
     ANTI-LOOP SHIELD: Redirects disabled during debug to isolate errors.
     ========================================================================== */
  if (!token) {
    console.error("CRITICAL: Token is missing from localStorage!");
    // window.location.href = "/login.html"; // DISABLED TO KILL THE LOOP
    return;
  }

  /* ==========================================================================
     1. INITIALIZATION DISPATCHER
     ========================================================================== */
  async function initializeDashboard() {
    console.log("Initializing dashboard modules safely...");
    try {
      await fetchUserProfile();
      
      // Load tables safely without cascading failures
      fetchServices().catch(err => console.error("Non-blocking services err:", err));
      fetchOrderHistory().catch(err => console.error("Non-blocking history err:", err));
      
      setupEventListeners();
    } catch (error) {
      console.error("Dashboard core layout loop error:", error);
    }
  }

  /* ==========================================================================
     2. DATA ACQUISITION & RENDER PIPELINES
     ========================================================================== */

  // Fetch Current User Metrics
  async function fetchUserProfile() {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.warn(`Profile route returned status ${res.status}. Anti-loop mechanism activated.`);
        return;
      }

      const data = await res.json();
      userProfile = data.user || data;
      
      if (userProfile) {
        if (userNameEl && userProfile.name) userNameEl.textContent = userProfile.name;
        if (userRoleEl) userRoleEl.textContent = userProfile.role || "Customer";
        
        if (userProfile.role === "admin") {
          document.querySelectorAll(".admin-block-section").forEach(el => el.style.display = "block");
        }

        const rawWalletValue = userProfile.wallet !== undefined ? userProfile.wallet : 0;
        const formattedBalance = `₦${Number(rawWalletValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        walletBalanceElements.forEach(el => {
          el.textContent = formattedBalance;
        });
      }
    } catch (err) {
      console.error("Profile payload sync failed, bypassing redirect:", err);
    }
  }

  // Fetch Active System Services
  async function fetchServices() {
    try {
      const res = await fetch("/api/services", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      availableServices = data.services || data || [];

      if (ninServiceSelect) ninServiceSelect.innerHTML = '<option value="" disabled selected>-- Select Identity Target Mapping Service --</option>';
      if (printingServiceSelect) printingServiceSelect.innerHTML = '<option value="" disabled selected>-- Target Print Configuration Mapping --</option>';

      availableServices.forEach(service => {
        if (service.isActive === false) return;

        const optionHTML = `<option value="${service._id}">${service.name} — ₦${Number(service.price).toLocaleString()}</option>`;
        const categoryKey = service.category ? service.category.toLowerCase() : "";
        
        if (categoryKey.includes("nin") && ninServiceSelect) {
          ninServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        } else if ((categoryKey.includes("print") || categoryKey.includes("graph") || categoryKey.includes("design")) && printingServiceSelect) {
          printingServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        }
      });
    } catch (err) {
      console.error("Service collection mapping error:", err);
    }
  }

  // Fetch Logged Order Indexes
  async function fetchOrderHistory() {
    try {
      const res = await fetch("/api/orders/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      const orders = data.orders || data || [];

      if (ordersLogTable) {
        if (!Array.isArray(orders) || orders.length === 0) {
          ordersLogTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No custom operational orders found.</td></tr>`;
        } else {
          ordersLogTable.innerHTML = "";
          orders.forEach(order => {
            const serviceName = order.service ? order.service.name : "Custom Ecosystem Task";
            const statusBadge = getStatusBadgeHTML(order.status);
            const orderAmount = order.amount || 0;
            const row = `
              <tr>
                <td><strong>#${order._id.substring(order._id.length - 8).toUpperCase()}</strong></td>
                <td>${serviceName}</td>
                <td>₦${Number(orderAmount).toLocaleString()}</td>
                <td>${statusBadge}</td>
              </tr>
            `;
            ordersLogTable.insertAdjacentHTML("beforeend", row);
          });
        }
      }

      if (universalLogsTableBody) {
        if (!Array.isArray(orders) || orders.length === 0) {
          universalLogsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No historical records logged yet.</td></tr>`;
        } else {
          universalLogsTableBody.innerHTML = "";
          orders.slice(0, 5).forEach(order => {
            const serviceCategory = order.service ? (order.service.category || "General").toUpperCase() : "GENERAL";
            const statusBadge = getStatusBadgeHTML(order.status);
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent";
            const orderAmount = order.amount || 0;
            const row = `
              <tr>
                <td><strong>${serviceCategory}</strong></td>
                <td>₦${Number(orderAmount).toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>${orderDate}</td>
              </tr>
            `;
            universalLogsTableBody.insertAdjacentHTML("beforeend", row);
          });
        }
      }
    } catch (err) {
      console.error("System logs rendering error:", err);
    }
  }

  /* ==========================================================================
     3. ASYNC FORM INTERFACE CONTROLLERS
     ========================================================================== */
  function setupEventListeners() {
    if (ninOrderForm) {
      ninOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = ninServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Choose a service.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", document.getElementById("nin-quantity")?.value || 1);
        formData.append("ninNumber", document.getElementById("nin-number")?.value || "");
        formData.append("message", document.getElementById("nin-context")?.value || "Identity processing");
        
        const fileInput = document.getElementById("nin-file-upload");
        if (fileInput && fileInput.files[0]) formData.append("file", fileInput.files[0]);

        await executeOrderPlacement(formData, ninOrderForm);
      });
    }

    if (printingOrderForm) {
      printingOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = printingServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Choose a print configuration.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", document.getElementById("print-quantity")?.value || 1);
        formData.append("message", document.getElementById("print-context")?.value || "Asset Setup");
        
        const fileInput = document.getElementById("print-file-upload");
        if (fileInput && fileInput.files[0]) formData.append("file", fileInput.files[0]);

        await executeOrderPlacement(formData, printingOrderForm);
      });
    }

    if (fundWalletBtn) {
      fundWalletBtn.addEventListener("click", async () => {
        const amount = fundingAmountInput?.value;
        if (!amount || amount < 100) return alert("Minimum threshold is ₦100.");

        try {
          fundWalletBtn.disabled = true;
          fundWalletBtn.textContent = "Processing...";

          const res = await fetch("/api/transactions/paystack/initialize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount: Number(amount) })
          });

          const data = await res.json();
          if (res.ok && data.authorization_url) {
            window.location.href = data.authorization_url;
          } else {
            alert("Gateway error: " + (data.message || "Initialization rejected."));
            fundWalletBtn.disabled = false;
            fundWalletBtn.textContent = "Initialize Checkout";
          }
        } catch (err) {
          console.error("Payment setup exception:", err);
          fundWalletBtn.disabled = false;
          fundWalletBtn.textContent = "Initialize Checkout";
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "/login.html";
      });
    }
  }

  async function executeOrderPlacement(formData, formElement) {
    try {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Deploying...";
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Success: " + data.message);
        formElement.reset();
        await fetchUserProfile();
        await fetchOrderHistory();
      } else {
        alert("Failed: " + (data.message || "Order rejected."));
      }
    } catch (err) {
      console.error("Order setup server error:", err);
    } finally {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = formElement.id === "ninServiceForm" ? "Deploy Request Verification" : "Initialize Printing Job";
      }
    }
  }

  function getStatusBadgeHTML(status) {
    switch (status) {
      case "pending": return `<span class="badge bg-warning text-dark" style="padding:4px 8px; border-radius:5px;">Pending</span>`;
      case "processing": return `<span class="badge bg-info text-white" style="padding:4px 8px; border-radius:5px;">Processing</span>`;
      case "completed": return `<span class="badge bg-success text-white" style="padding:4px 8px; border-radius:5px;">Completed</span>`;
      case "cancelled": return `<span class="badge bg-danger text-white" style="padding:4px 8px; border-radius:5px;">Cancelled</span>`;
      default: return `<span class="badge bg-secondary" style="padding:4px 8px; border-radius:5px;">Unknown</span>`;
    }
  }

  initializeDashboard();
});
