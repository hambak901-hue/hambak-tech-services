/* ==========================================================================
   HAMBAK TECH & SERVICES - CORE DASHBOARD ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Global State Containers
  let userProfile = null;
  let availableServices = [];

  // DOM Elements - Navigation & Core UI
  const token = localStorage.getItem("token");
  const userNameEl = document.getElementById("userName");
  const userWalletEl = document.getElementById("userWallet");
  const logoutBtn = document.getElementById("logoutBtn");

  // DOM Elements - Service Dropdown Selectors
  const ninServiceSelect = document.getElementById("ninServiceSelect");
  const printingServiceSelect = document.getElementById("printingServiceSelect");

  // DOM Elements - Order Submission Forms
  const ninOrderForm = document.getElementById("ninOrderForm");
  const printingOrderForm = document.getElementById("printingOrderForm");

  // DOM Elements - History Visualizer Tables
  const orderHistoryTable = document.getElementById("orderHistoryTable");
  const transactionHistoryTable = document.getElementById("transactionHistoryTable");

  // Absolute Security Guard Gate
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  /* ==========================================================================
     1. INITIALIZATION DISPATCHER
     ========================================================================== */
  async function initializeDashboard() {
    try {
      await fetchUserProfile();
      await fetchServices();
      await fetchOrderHistory();
      await fetchTransactionHistory();
      setupEventListeners();
    } catch (error) {
      console.error("Dashboard initialization failure context:", error);
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
      const data = await res.json();
      if (res.ok && data.success) {
        userProfile = data.user;
        if (userNameEl) userNameEl.textContent = userProfile.name;
        if (userWalletEl) userWalletEl.textContent = `₦${Number(userProfile.wallet).toLocaleString()}`;
      } else {
        handleAuthExpiry();
      }
    } catch (err) {
      console.error("Profile endpoint sync mapping exception:", err);
    }
  }

  // Fetch Active System Services & Populate Forms Dynamically
  async function fetchServices() {
    try {
      const res = await fetch("/api/services", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Handle array payload whether nested in data.services or directly as data
      availableServices = data.services || data || [];

      // Clear existing select placeholders
      if (ninServiceSelect) ninServiceSelect.innerHTML = '<option value="" disabled selected>-- Select NIN Service --</option>';
      if (printingServiceSelect) printingServiceSelect.innerHTML = '<option value="" disabled selected>-- Select Material Variant --</option>';

      // Loop and distribute data vectors into respective category select options
      availableServices.forEach(service => {
        if (!service.isActive) return; // Skip decommissioned elements

        const optionHTML = `<option value="${service._id}">${service.name} — ₦${Number(service.price).toLocaleString()}</option>`;
        
        const categoryKey = service.category ? service.category.toLowerCase() : "";
        
        if (categoryKey.includes("nin") && ninServiceSelect) {
          ninServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        } else if ((categoryKey.includes("print") || categoryKey.includes("graph")) && printingServiceSelect) {
          printingServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        }
      });
    } catch (err) {
      console.error("Service matrix population pipeline blocked:", err);
    }
  }

  // Fetch Client Specific Order History Records
  async function fetchOrderHistory() {
    if (!orderHistoryTable) return;
    try {
      const res = await fetch("/api/orders/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const orders = data.orders || [];

      if (orders.length === 0) {
        orderHistoryTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No active order parameters recorded.</td></tr>`;
        return;
      }

      orderHistoryTable.innerHTML = "";
      orders.forEach(order => {
        const serviceName = order.service ? order.service.name : "Custom Request Service";
        const fileLink = order.file ? `<a href="${order.file}" target="_blank" class="btn-link">View Slip</a>` : `<span class="text-muted">None</span>`;
        const statusBadge = getStatusBadgeHTML(order.status);

        const row = `
          <tr>
            <td><strong>${order._id.substring(order._id.length - 8).toUpperCase()}</strong></td>
            <td>${serviceName}</td>
            <td>${order.quantity || 1}</td>
            <td>₦${Number(order.amount).toLocaleString()}</td>
            <td>${statusBadge}</td>
            <td>${fileLink}</td>
          </tr>
        `;
        orderHistoryTable.insertAdjacentHTML("beforeend", row);
      });
    } catch (err) {
      console.error("Order history ledger rendering error:", err);
    }
  }

  // Fetch Wallet Transaction Log footprints
  async function fetchTransactionHistory() {
    if (!transactionHistoryTable) return;
    try {
      const res = await fetch("/api/transactions/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const transactions = data.transactions || data || [];

      if (transactions.length === 0) {
        transactionHistoryTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No ledger balance mutations found.</td></tr>`;
        return;
      }

      transactionHistoryTable.innerHTML = "";
      transactions.forEach(tx => {
        const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-";
        const typeBadge = tx.type === "deposit" || tx.type === "refund" 
          ? `<span class="badge bg-success">Credit</span>` 
          : `<span class="badge bg-danger">Debit</span>`;

        const row = `
          <tr>
            <td>${dateStr}</td>
            <td><small class="text-muted">${tx.reference || "N/A"}</small></td>
            <td>${tx.description || "System processing execution fee"}</td>
            <td>${typeBadge}</td>
            <td><strong>₦${Number(tx.amount).toLocaleString()}</strong></td>
          </tr>
        `;
        transactionHistoryTable.insertAdjacentHTML("beforeend", row);
      });
    } catch (err) {
      console.error("Transaction profile ledger visualization failure:", err);
    }
  }

  /* ==========================================================================
     3. ASYNC FORM INTERFACE CONTROLLERS
     ========================================================================== */
  function setupEventListeners() {
    
    // NIN Form Interceptor Pipeline
    if (ninOrderForm) {
      ninOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = ninServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Please select an active NIN Service variant profile.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", 1);
        formData.append("message", document.getElementById("ninMessage")?.value || "NIN Management Pipeline Dispatch");
        
        const fileInput = document.getElementById("ninFile");
        if (fileInput && fileInput.files[0]) {
          formData.append("file", fileInput.files[0]);
        }

        await executeOrderPlacement(formData);
      });
    }

    // Printing Node Form Interceptor Pipeline
    if (printingOrderForm) {
      printingOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedId = printingServiceSelect.value;
        if (!selectedId) return alert("Validation Error: Please choose your material production spec profile.");

        const qty = document.getElementById("printQty")?.value || 1;

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", qty);
        formData.append("message", document.getElementById("printMessage")?.value || "Corporate Printing Request Sequence");
        
        const fileInput = document.getElementById("printFile");
        if (fileInput && fileInput.files[0]) {
          formData.append("file", fileInput.files[0]);
        }

        await executeOrderPlacement(formData);
      });
    }

    // Session Termination Sequence
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login.html";
      });
    }
  }

  // Unified Request Transmitter Matrix
  async function executeOrderPlacement(formData) {
    try {
      const submitButtons = document.querySelectorAll('button[type="submit"]');
      submitButtons.forEach(btn => btn.disabled = true); // Prevent double debit balance anomalies

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // Form-data sets content-type dynamically
        body: formData
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("Success: " + data.message);
        // Refresh interface to sync balance counters and lists instantly
        ninOrderForm?.reset();
        printingOrderForm?.reset();
        await fetchUserProfile();
        await fetchOrderHistory();
        await fetchTransactionHistory();
      } else {
        alert("Order Processing Rejection: " + (data.message || "Ecosystem execution error maps."));
      }
    } catch (err) {
      console.error("Infrastructure transport failure on checkout:", err);
      alert("Network Error: Operations processing framework connection failed.");
    } finally {
      const submitButtons = document.querySelectorAll('button[type="submit"]');
      submitButtons.forEach(btn => btn.disabled = false);
    }
  }

  /* ==========================================================================
     4. COMPONENT FALLBACK UTILITIES
     ========================================================================== */
  function getStatusBadgeHTML(status) {
    switch (status) {
      case "pending": return `<span class="badge bg-warning text-dark">Pending</span>`;
      case "processing": return `<span class="badge bg-info text-white">Processing</span>`;
      case "completed": return `<span class="badge bg-success text-white">Completed</span>`;
      case "cancelled": return `<span class="badge bg-danger text-white">Cancelled</span>`;
      default: return `<span class="badge bg-secondary">Unknown</span>`;
    }
  }

  function handleAuthExpiry() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }

  // Trigger Ecosystem Engine Execution
  initializeDashboard();
});
