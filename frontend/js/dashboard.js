/**
 * HAMBAK TECH & SERVICES - Advanced Dashboard Management Script
 * Ecosystem Operations Infrastructure
 */

// --- Global Application State Nodes ---
let userProfile = null;
let allServicesArray = [];
const token = localStorage.getItem("token") || sessionStorage.getItem("token");

// --- DOM Selector Elements ---
const userNameEl = document.getElementById("userName");
const userRoleEl = document.getElementById("userRole");
const panelTitleEl = document.getElementById("panelTitle");
const walletBalanceElements = document.querySelectorAll(".wallet-balance");
const universalLogsTableBody = document.getElementById("universalLogsTableBody");
const ordersLogTable = document.getElementById("ordersLogTable");
const serviceSelectElements = document.querySelectorAll(".service-select-node");

// --- Initialization Hook ---
document.addEventListener("DOMContentLoaded", () => {
  // Guard clause: Redirect to login if user session token is completely missing
  if (!token) {
    alert("Operational Session Expired or Invalid. Redirecting to Authentication Node...");
    window.location.href = "login.html";
    return;
  }

  // Initialize Core Services & Profiles
  fetchUserProfile();
  fetchSystemServices();
  setupOrderForms();
  setupWalletFunding();
  setupLogout();
});

// --- View Switching Navigation Logic ---
function showSection(viewId) {
  // Hide all view blocks safely
  document.querySelectorAll(".app-view").forEach(view => {
    view.classList.remove("active-view");
  });

  // Display targeted view panel
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("active-view");
  }

  // Update Left Sidebar Links active indicators
  document.querySelectorAll(".sidebar-links a").forEach(link => {
    link.classList.remove("active");
  });

  // Map view strings back to their triggers for UI consistency
  const activeNavLink = document.querySelector(`[onclick="showSection('${viewId}')"]`);
  if (activeNavLink) activeNavLink.classList.add("active");

  // Dynamically change header panel title string contextual maps
  const titleMap = {
    'home-view': 'Ecosystem Operations Hub',
    'wallet-view': 'Financial Asset & Wallet Manager',
    'ict-view': 'ICT Core & Technology Solutions Node',
    'business-view': 'Corporate Business & High-Volume Print Center',
    'financial-view': 'Agency Banking & Micro-Transactions Matrix',
    'marketing-view': 'Campaign Deployment & Advisory Matrix',
    'game-view': 'PanCafe Automated Client Node Console',
    'orders-view': 'Ecosystem Operational Order Logs'
  };
  if (panelTitleEl && titleMap[viewId]) {
    panelTitleEl.textContent = titleMap[viewId];
  }
}

// --- Fetch User Profile Data from Core API Endpoint ---
async function fetchUserProfile() {
  try {
    // FIXED: Points precisely to your real backend route endpoint verified in the logs
    const res = await fetch("/api/users/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (res.status === 401 || res.status === 403) {
      handleSessionTimeout();
      return;
    }

    if (!res.ok) throw new Error(`Server returned error code: ${res.status}`);

    const data = await res.json();
    userProfile = data.user || data; // Accounts for backend payload structure variations

    if (userProfile) {
      // Dynamic rendering of Profile Details
      if (userNameEl) userNameEl.textContent = userProfile.name || "Hambak User";
      if (userRoleEl) userRoleEl.textContent = userProfile.role || "Customer";

      // Add inside your fetchUserProfile() function right where role validation succeeds:
      if (userProfile.role && userProfile.role.toLowerCase() === 'admin') {
          document.querySelectorAll(".admin-block-section, .admin-only-tab").forEach(el => {
              el.style.setProperty('display', 'block', 'important');
          });
      }
        // Run analytical reporting calculations safely if Chart.js structure exists
        if (typeof initializeCharts === "function") {
          initializeCharts();
        }
      }

      // Sync and render Account Wallet Balance values across UI cards
      const balance = userProfile.wallet !== undefined ? userProfile.wallet : 0;
      walletBalanceElements.forEach(el => {
        el.textContent = `₦${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      });

      // Synchronize internal service transactions lists
      renderSystemLogs(userProfile.logs || []);
      renderOrderHistory(userProfile.orders || []);
    }
  } catch (err) {
    console.error("Critical Profile Parsing Node Failure:", err);
  }
}

// --- Fetch Active Business Services & Categories ---
async function fetchSystemServices() {
  try {
    const res = await fetch("/api/services", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Could not pull live ecosystem service data nodes.");

    allServicesArray = await res.json();
    populateCategorySelectors();
  } catch (err) {
    console.error("Services Synchronization Error:", err);
    serviceSelectElements.forEach(select => {
      select.innerHTML = `<option value="">-- Failed to sync services. Refresh page --</option>`;
    });
  }
}

// --- Populate UI Dropdowns Depending on Section Types ---
function populateCategorySelectors() {
  const categoriesMap = {
    "ict-service-select": "ict",
    "business-service-select": "business",
    "financial-service-select": "financial",
    "marketing-service-select": "marketing"
  };

  Object.entries(categoriesMap).forEach(([elementId, categoryName]) => {
    const selectEl = document.getElementById(elementId);
    if (!selectEl) return;

    // Filter relevant services matching category parameters
    const componentServices = allServicesArray.filter(s => s.category?.toLowerCase() === categoryName);

    if (componentServices.length === 0) {
      selectEl.innerHTML = `<option value="">No Active Services Configured</option>`;
      return;
    }

    selectEl.innerHTML = `<option value="">-- Select Valid Option --</option>`;
    componentServices.forEach(service => {
      const option = document.createElement("option");
      option.value = service._id || service.id;
      option.textContent = `${service.name} (₦${Number(service.price).toLocaleString()})`;
      selectEl.appendChild(option);
    });
  });
}

// --- Setup Order Form Submission Event Listeners ---
function setupOrderForms() {
  document.querySelectorAll(".order-placement-form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const serviceSelect = form.querySelector(".service-select-node");
      const qtyInput = form.querySelector(".order-qty");
      const contextInput = form.querySelector(".order-context");
      const fileInput = form.querySelector(".order-file-upload");

      if (!serviceSelect || !serviceSelect.value) {
        alert("Please map a valid operational target service before proceeding.");
        return;
      }

      // Build Form Data Payload (to handle text data along with custom files/blueprints)
      const formData = new FormData();
      formData.append("serviceId", serviceSelect.value);
      formData.append("quantity", qtyInput ? qtyInput.value : 1);
      formData.append("context", contextInput ? contextInput.value : "");
      
      if (fileInput && fileInput.files[0]) {
        formData.append("blueprint", fileInput.files[0]);
      }

      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData // Set body without manually tracking Content-Type boundaries
        });

        const outcome = await res.json();
        if (!res.ok) throw new Error(outcome.message || "Request routing deployment failure.");

        alert("Operational Task Blueprint Dispatched Successfully!");
        form.reset();
        fetchUserProfile(); // Automatically reload profile metrics & updated balances
        showSection("orders-view");
      } catch (err) {
        alert(`Order Routing Aborted: ${err.message}`);
      }
    });
  });
}

// --- Paystack Online Wallet Funding Handler ---
function setupWalletFunding() {
  const fundBtn = document.getElementById("fund-wallet-btn");
  const amountInput = document.getElementById("funding-amount-input");

  if (!fundBtn || !amountInput) return;

  fundBtn.addEventListener("click", () => {
    const fundingAmount = parseFloat(amountInput.value);

    if (isNaN(fundingAmount) || fundingAmount < 100) {
      alert("Please designate a minimum initialization entry value of ₦100.");
      return;
    }

    if (!userProfile || !userProfile.email) {
      alert("Critical security context missing. Re-authenticating network parameters...");
      return;
    }

    // Call inline Paystack processing architecture 
    const handler = PaystackPop.setup({
      key: "pk_live_your_actual_public_key_string_here", // Swap to test/live Paystack keys safely
      email: userProfile.email,
      amount: Math.round(fundingAmount * 100), // Convert transaction values to Kobo parameters
      currency: "NGN",
      callback: async (response) => {
        // Run payment reference verification checks with server nodes backend
        try {
          const verification = await fetch("/api/wallet/verify-funding", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ reference: response.reference, amount: fundingAmount })
          });

          const verifiedData = await verification.json();
          if (verification.ok) {
            alert(`Wallet safely loaded with ₦${fundingAmount.toLocaleString()}!`);
            amountInput.value = "";
            fetchUserProfile(); // Reload current view cards context balance nodes
          } else {
            alert(`Ledger Verification Error: ${verifiedData.message}`);
          }
        } catch (err) {
          console.error("Verification processing matrix failure:", err);
        }
      },
      onClose: () => {
        alert("Ecosystem billing payment channel pipeline was closed down manually.");
      }
    });

    handler.openIframe();
  });
}

// --- Render Systems Activity Logs Tables ---
function renderSystemLogs(logs) {
  if (!universalLogsTableBody) return;

  if (!logs || logs.length === 0) {
    universalLogsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No universal activity log records currently recorded.</td></tr>`;
    return;
  }

  universalLogsTableBody.innerHTML = "";
  logs.slice(0, 10).forEach(log => { // Bound display index range caps to 10 lines
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${log.category || 'System Layer'}</strong></td>
      <td>₦${Number(log.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><span style="color: ${log.status === 'success' ? '#10b981' : '#f43f5e'}; font-weight: bold;">${log.status?.toUpperCase() || 'COMPLETED'}</span></td>
      <td>${log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Recent'}</td>
    `;
    universalLogsTableBody.appendChild(row);
  });
}

// --- Render Manifest Services Orders Log Block ---
function renderOrderHistory(orders) {
  if (!ordersLogTable) return;

  if (!orders || orders.length === 0) {
    ordersLogTable.innerHTML = `<tr><td colspan="4" style="text-align:center;">No processing files or orders traced on account indices.</td></tr>`;
    return;
  }

  ordersLogTable.innerHTML = "";
  orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><code>${order.orderRef || order._id || 'HBK-TRX'}</code></td>
      <td>${order.serviceName || 'Custom Operational Resource'}</td>
      <td>₦${Number(order.totalPrice || order.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><span style="padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: ${getStatusBg(order.status)}; color: white;">${order.status || 'Pending'}</span></td>
    `;
    ordersLogTable.appendChild(row);
  });
}

// --- Helper Switch Component to style Status Grid Tags ---
function getStatusBg(status) {
  switch (status?.toLowerCase()) {
    case 'completed': return '#10b981';
    case 'processing': return '#3b82f6';
    case 'failed': return '#ef4444';
    default: return '#f5b942'; // Pending / Default
  }
}

// --- Setup Browser Window Printing for System Records ---
function printHistoryLog() {
  window.print();
}

// --- Destroy Storage Token Arrays and Sign Out ---
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Confirm security closure. Do you want to sign out from operational hub?")) {
      handleSessionTimeout();
    }
  });
}

function handleSessionTimeout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

// --- Chart.js Graphical Analytics Dash Engine (Admin Dashboard Only) ---
function initializeCharts() {
  const revCtx = document.getElementById('revenueChart');
  const servCtx = document.getElementById('serviceChart');

  if (!revCtx || !servCtx) return;

  // Initialize Revenue Trend Graph Mapping
  new Chart(revCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Gross Volume Tracking',
        data: [120000, 190000, 270000, 320000, 410000, 450000],
        borderColor: '#0d47a1',
        backgroundColor: 'rgba(13, 71, 161, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Initialize Core Categories Metrics Breakdown Mapping
  new Chart(servCtx, {
    type: 'doughnut',
    data: {
      labels: ['ICT Development', 'Business & Printing', 'Agency Banking', 'Marketing Run'],
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: ['#0d47a1', '#f5b942', '#081120', '#ff4081']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
