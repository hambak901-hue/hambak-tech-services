/* ==========================================================================
   HAMBAK TECH & SERVICES - SYSTEM STABILIZATION PRODUCTION ENGINE
   ========================================================================== */

// Global navigation core utility - switches view blocks instantly
window.showSection = function(sectionId) {
  console.log("Switching view module target to:", sectionId);
  
  // Hide all view panels
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
    view.style.display = 'none';
  });
  
  // Display target selected view panel
  const targetView = document.getElementById(sectionId);
  if (targetView) {
    targetView.classList.add('active-view');
    targetView.style.display = 'block';
  }

  // Handle active navigation tab highlights
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

  // Core Auth Token Check
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Unauthorized: No token found in localStorage. Redirecting to login.");
    window.location.href = window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
    return;
  }

  // DOM Elements - User Indicators
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const logoutBtn = document.getElementById("logoutBtn");
  const walletBalanceElements = document.querySelectorAll(".wallet-balance");

  // DOM Elements - Expanded Service Dropdown Matrix Arrays
  const ictServiceSelect = document.getElementById("ict-service-select");
  const businessServiceSelect = document.getElementById("business-service-select");
  const financialServiceSelect = document.getElementById("financial-service-select");
  const marketingServiceSelect = document.getElementById("marketing-service-select");

  // DOM Elements - Form Submissions
  const serviceOrderForm = document.getElementById("serviceOrderForm");

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
      await fetchUserProfile();
      
      // Load platform services & data streams independently
      fetchServices().catch(e => console.error("Non-blocking platform service loading fault:", e));
      fetchOrderHistory().catch(e => console.error("Non-blocking dashboard table loading fault:", e));
      
      setupEventListeners();
      
      if (document.getElementById("home-view")) {
        window.showSection("home-view");
      }
    } catch (error) {
      console.error("Critical ecosystem initialization engine freeze:", error);
    }
  }

  /* ==========================================================================
     2. DATA ACQUISITION & RENDERING PIPELINES
     ========================================================================== */

  async function fetchUserProfile() {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error(`Token authentication rejected by server with status: ${res.status}. Avoiding auto-redirect loop.`);
        return; 
      }

      const data = await res.json();
      userProfile = data.user || data;
      
      if (userProfile) {
        if (userNameEl && userProfile.name) userNameEl.textContent = userProfile.name;
        if (userRoleEl) userRoleEl.textContent = userProfile.role || "Customer";
        
        if (userProfile.role === "admin") {
          document.querySelectorAll(".admin-block-section").forEach(el => el.style.display = "block");
          initAdminCharts();
        }

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

  async function fetchServices() {
    try {
      const res = await fetch("/api/services", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      availableServices = data.services || data || [];

      // Reset dropdown placeholders safely
      if (ictServiceSelect) ictServiceSelect.innerHTML = '<option value="" disabled selected>-- Select ICT or Tech Service --</option>';
      if (businessServiceSelect) businessServiceSelect.innerHTML = '<option value="" disabled selected>-- Select Business Support or Print Service --</option>';
      if (financialServiceSelect) financialServiceSelect.innerHTML = '<option value="" disabled selected>-- Select Financial or VTU Service --</option>';
      if (marketingServiceSelect) marketingServiceSelect.innerHTML = '<option value="" disabled selected>-- Select Marketing or Consultation --</option>';

      availableServices.forEach(service => {
        if (service.isActive === false) return;

        const optionHTML = `<option value="${service._id}">${service.name} — ₦${Number(service.price).toLocaleString()}</option>`;
        const categoryKey = service.category ? service.category.toLowerCase() : "";
        
        // Comprehensive matrix routing matchers based on catalog structure
        if ((categoryKey.includes("ict") || categoryKey.includes("web") || categoryKey.includes("graph") || categoryKey.includes("software") || categoryKey.includes("computer")) && ictServiceSelect) {
          ictServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        } 
        else if ((categoryKey.includes("print") || categoryKey.includes("reg") || categoryKey.includes("doc") || categoryKey.includes("cv") || categoryKey.includes("resume") || categoryKey.includes("type")) && businessServiceSelect) {
          businessServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        } 
        else if ((categoryKey.includes("vtu") || categoryKey.includes("pos") || categoryKey.includes("pay") || categoryKey.includes("save") || categoryKey.includes("ajo") || categoryKey.includes("coop")) && financialServiceSelect) {
          financialServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        } 
        else if ((categoryKey.includes("market") || categoryKey.includes("content") || categoryKey.includes("consult")) && marketingServiceSelect) {
          marketingServiceSelect.insertAdjacentHTML("beforeend", optionHTML);
        }
      });
    } catch (err) {
      console.error("Failed handling active operational product loop distribution parsing:", err);
    }
  }

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
          ordersLogTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">No operational orders found.</td></tr>`;
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
          universalLogsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">No historical records logged yet.</td></tr>`;
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
      console.error("Universal logs table compilation system crash exception:", err);
    }
  }

  /* ==========================================================================
     3. OPERATION EVENTS AND ASYNC TRANSIT CONTROLLERS
     ========================================================================== */
  function setupEventListeners() {
    
    // Unified listener block dealing with structural forms dynamically
    document.querySelectorAll(".order-placement-form").forEach(form => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Find whichever dropdown inside this specific form is being used
        const selectElement = form.querySelector("select.service-select-node");
        const selectedId = selectElement ? selectElement.value : null;
        
        if (!selectedId) return alert("Validation Error: Please select an operational service option.");

        const formData = new FormData();
        formData.append("serviceId", selectedId);
        formData.append("quantity", form.querySelector(".order-qty")?.value || 1);
        formData.append("message", form.querySelector(".order-context")?.value || "System Service Execution Run");
        
        const fileInput = form.querySelector(".order-file-upload");
        if (fileInput && fileInput.files[0]) formData.append("file", fileInput.files[0]);

        await executeOrderPlacement(formData, form);
      });
    });

    if (fundWalletBtn) {
      fundWalletBtn.addEventListener("click", async () => {
        const amount = fundingAmountInput?.value;
        if (!amount || amount < 100) return alert("Validation Mismatch: Requires an entry minimum threshold of ₦100.");

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

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
      });
    }
  }

  async function executeOrderPlacement(formData, formElement) {
    try {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "Submit";
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Deploying Request Payload...";
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
        alert("Transaction Failed: " + (data.message || "Operation validation rejected."));
      }
    } catch (err) {
      console.error("Server order deployment execution error:", err);
    } finally {
      const submitBtn = formElement.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        // Revert to default text safely
        submitBtn.textContent = "Submit Operational Request";
      }
    }
  }

  function getStatusBadgeHTML(status) {
    switch (status) {
      case "pending": return `<span style="background-color:#f5b942; color:#081120; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:bold; display:inline-block;">Pending</span>`;
      case "processing": return `<span style="background-color:#0d47a1; color:white; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:bold; display:inline-block;">Processing</span>`;
      case "completed": return `<span style="background-color:#10b981; color:white; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:bold; display:inline-block;">Completed</span>`;
      case "cancelled": return `<span style="background-color:#ff4081; color:white; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:bold; display:inline-block;">Cancelled</span>`;
      default: return `<span style="background-color:#64748b; color:white; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:bold; display:inline-block;">Unknown</span>`;
    }
  }

  function initAdminCharts() {
    const revCtx = document.getElementById('revenueChart');
    const servCtx = document.getElementById('serviceChart');

    if (revCtx) {
      new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Ecosystem Revenue (₦)',
            data: [120000, 190000, 270000, 320000, 400000, 450000],
            borderColor: '#0d47a1',
            backgroundColor: 'rgba(13, 71, 161, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }

    if (servCtx) {
      new Chart(servCtx, {
        type: 'doughnut',
        data: {
          labels: ['ICT Services', 'Business Support', 'Financial Nodes', 'Digital Marketing'],
          datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ['#0d47a1', '#f5b942', '#ff4081', '#081120']
          }]
        },
        options: { responsive: true }
      });
    }
  }

  initializeDashboard();
});
