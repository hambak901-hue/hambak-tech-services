/* ==========================================================================
   HAMBAK TECH & SERVICES - SYSTEM PRODUCTION ENGINE
   ========================================================================== */

// Global navigation core utility - switches view blocks instantly
window.showSection = function(sectionId) {
  console.log("Switching view module target to:", sectionId);
  
  // Hide all view panels
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
    view.style.display = 'none'; // Safe backup display control
  });
  
  // Display target selected view panel
  const targetView = document.getElementById(sectionId);
  if (targetView) {
    targetView.classList.add('active-view');
    targetView.style.display = 'block';
  }

  // Handle active navigation tab highlight highlights
  document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.classList.remove('active');
  });
  
  const navId = "nav-" + sectionId.split('-')[0];
  const activeLink = document.getElementById(navId);
  if (activeLink) activeLink.classList.add('active');
};

document.addEventListener("DOMContentLoaded", () => {
  // Global Application State Lifecycle Containers
  let userProfile = null;
  let availableServices = [];

  // Core Auth Token Token Check
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Unauthorized state access cluster. Route redirecting to login context.");
    // Handles adaptive paths whether running from root or /pages/ folder
    window.location.href = window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
    return;
  }

  // DOM Elements - User Indicators
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const logoutBtn = document.getElementById("logoutBtn");
  const walletBalanceElements = document.querySelectorAll(".wallet-balance");

  // DOM Elements - Service Dropdown Matrix Arrays
  const ninServiceSelect = document.getElementById("nin-service-select");
  const printingServiceSelect = document.getElementById("print-service-select");

  // DOM Elements - Transaction & Order Form Submissions
  const ninOrderForm = document.getElementById("ninServiceForm");
  const printingOrderForm = document.getElementById("printJobForm");

  // DOM Elements - Reactive Dynamic Tables
  const universalLogsTableBody = document.getElementById("universalLogsTableBody");
  const ordersLogTable = document.getElementById("ordersLogTable");

  // DOM Elements - Financial Action Components
  const fundWalletBtn = document.getElementById("fund-wallet-btn");
  const fundingAmountInput = document.getElementById("funding-amount-input");

  /* ==========================================================================
     1. INITIALIZATION DISPATCHER
     ========================================================================== */
  async function initializeDashboard() {
    console.log("Ecosystem layout initialization sequence triggered...");
    try {
      // Load user profile record metric
      await fetchUserProfile();
      
      // Load platform services & data streams independently
      fetchServices().catch(e => console.error("Non-blocking platform service loading fault:", e));
      fetchOrderHistory().catch(e => console.error("Non-blocking dashboard table loading fault:", e));
      
      setupEventListeners();
      
      // Default initialization view screen assignment state configuration trigger
      if (document.getElementById("dashboard-view")) {
        window.showSection("dashboard-view");
      }
    } catch (error) {
      console.error("Critical ecosystem initialization engine freeze:", error);
    }
  }

  /* ==========================================================================
     2. DATA ACQUISITION & RENDERING PIPELINES
     ========================================================================== */

  // Fetch Current User Records & Sync Balance Indicators
  async function fetchUserProfile() {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) return console.error("Database connection validation handshakes rejected token credentials.");

      const data = await res.json();
      userProfile = data.user || data;
      
      if (userProfile) {
        if (userNameEl && userProfile.name) userNameEl.textContent = userProfile.name;
        if (userRoleEl) userRoleEl.textContent = userProfile.role || "Customer";
        
        // Unblock Admin Panel Interface switches if user status matches administrative role permissions
        if (userProfile.role === "admin") {
          document.querySelectorAll(".admin-block-section").forEach(el => el.style.display = "block");
        }

        // Sync wallet token accounting metrics inside layout wrappers
        const rawWalletValue = userProfile.wallet !== undefined ? userProfile.wallet : 0;
        const formattedBalance = `₦${Number(rawWalletValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        walletBalanceElements.forEach(el => {
          el.textContent = formattedBalance;
        });
      }
    } catch (err) {
      console.error("Infrastructure pipeline profile data retrieval exception:", err);
    }
  }

  // Fetch Available Services Matrix & Distribute into Dropdown Nodes
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
      console.error("Failed handling active operational product loop distribution parsing:", err);
    }
  }

  // Fetch Order History Logs & Build Live Tables
  async function fetchOrderHistory() {
    try {
      const res = await fetch("/api/orders/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      const orders = data.orders || data || [];

      // Render out logs inside primary history table tracking view panel modules
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

      // Render top logs block panel snapshot values inside root overview dashboard matrix component
      if (universalLogsTableBody) {
        if (!Array.isArray(orders) || orders.length === 0) {
          universalLogsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No historical records logged to server framework yet.</td></tr>`;
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
      console.error("Universal logs table compilation system crash exception handler context:", err);
    }
  }

  /* ==========================================================================
     3. OPERATION EVENTS AND ASYNC TRANSIT CONTROLLERS
     ========================================================================== */
  function setupEventListeners() {
    
    // NIN Form Interceptor Pipeline Processing Node
    if (ninOrderForm) {
      ninOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = ninServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Please select an identity verification operational tier.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", document.getElementById("nin-quantity")?.value || 1);
        formData.append("ninNumber", document.getElementById("nin-number")?.value || "");
        formData.append("message", document.getElementById("nin-context")?.value || "Identity Verification Request");
        
        const fileInput = document.getElementById("nin-file-upload");
        if (fileInput && fileInput.files[0]) formData.append("file", fileInput.files[0]);

        await executeOrderPlacement(formData, ninOrderForm);
      });
    }

    // Printing Job Request Processing Interceptor Matrix Node
    if (printingOrderForm) {
      printingOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = printingServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Please highlight an output document specification template.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", document.getElementById("print-quantity")?.value || 1);
        formData.append("message", document.getElementById("print-context")?.value || "Production Media Request Layout Run");
        
        const fileInput = document.getElementById("print-file-upload");
        if (fileInput && fileInput.files[0]) formData.append("file", fileInput.files[0]);

        await executeOrderPlacement(formData, printingOrderForm);
      });
    }

    // Paystack Gateway Node Link Trigger Routing Matrix Execution Context
    if (fundWalletBtn) {
      fundWalletBtn.addEventListener("click", async () => {
        const amount = fundingAmountInput?.value;
        if (!amount || amount < 100) return alert("Validation Mismatch: Processing node requires a entry minimum limit threshold of ₦100.");

        try {
          fundWalletBtn.disabled = true;
          fundWalletBtn.textContent = "Deploying Payment Vector...";

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
            alert("External Gateway Warning: " + (data.message || "Initialization parameters dropped."));
            fundWalletBtn.disabled = false;
            fundWalletBtn.textContent = "Initialize Checkout";
          }
        } catch (err) {
          console.error("Gateway verification exception:", err);
          fundWalletBtn.disabled = false;
          fundWalletBtn.textContent = "Initialize Checkout";
        }
      });
    }

    // Explicit Session Termination Sequence Trigger Node
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
      });
    }
  }

  // Multi-part Form Asset Processing Handler Node
  async function executeOrderPlacement(formData, formElement) {
    try {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Deploying Matrix Network Payload...";
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Ecosystem Success: " + data.message);
        formElement.reset();
        await fetchUserProfile();
        await fetchOrderHistory();
      } else {
        alert("Transaction Failed: " + (data.message || "Database node operation validation rejected."));
      }
    } catch (err) {
      console.error("Server order deployment structural endpoint execution error:", err);
    } finally {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = formElement.id === "ninServiceForm" ? "Deploy Request Verification" : "Initialize Printing Job";
      }
    }
  }

  // Component UI Layout Badge Utility Helper Engine Mapping
  function getStatusBadgeHTML(status) {
    switch (status) {
      case "pending": return `<span class="badge bg-warning text-dark" style="padding:4px 8px; border-radius:5px; font-size:0.85rem;">Pending</span>`;
      case "processing": return `<span class="badge bg-info text-white" style="padding:4px 8px; border-radius:5px; font-size:0.85rem;">Processing</span>`;
      case "completed": return `<span class="badge bg-success text-white" style="padding:4px 8px; border-radius:5px; font-size:0.85rem;">Completed</span>`;
      case "cancelled": return `<span class="badge bg-danger text-white" style="padding:4px 8px; border-radius:5px; font-size:0.85rem;">Cancelled</span>`;
      default: return `<span class="badge bg-secondary text-white" style="padding:4px 8px; border-radius:5px; font-size:0.85rem;">Unknown</span>`;
    }
  }

  // Execute Core System Run Loop
  initializeDashboard();
});
