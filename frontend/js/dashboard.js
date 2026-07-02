/**
 * HAMBAK TECH & SERVICES - Advanced Dashboard Management Script
 * Production Operations Infrastructure - Realignment Edition
 */

// --- Global Application Config & State Nodes ---
const BASE_URL = "https://hambak-tech-services.onrender.com/api";

let userProfile = null;
let allServicesArray = [];

// Unified Ecosystem Session Persistence Strategy Lookup
const token = localStorage.getItem("hambak_token") || localStorage.getItem("token") || sessionStorage.getItem("token");

let revenueChartInstance = null;
let serviceChartInstance = null;

// --- DOM Selector Elements ---
const userNameEl = document.getElementById("userName");
const userRoleEl = document.getElementById("userRole");
const panelTitleEl = document.getElementById("panelTitle");
const walletBalanceElements = document.querySelectorAll(".wallet-balance");
const universalLogsTableBody = document.getElementById("universalLogsTableBody");
const ordersLogTable = document.getElementById("ordersLogTable");

// --- Initialization Hook ---
document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Operational Session Expired or Invalid. Redirecting to Authentication Node...");
    window.location.href = "login.html";
    return;
  }

  // Synchronize Core Services, Profiles, and Payment Handlers
  fetchUserProfile();
  fetchSystemServices();
  setupOrderForms();
  setupWalletFunding();
  setupLogout();
  setupAdminNavigationLinks();
});

function setupAdminNavigationLinks() {
  const adminUsersLink = document.getElementById("adminUsersLink");
  const adminServicesLink = document.getElementById("adminServicesLink");

  if (adminUsersLink) adminUsersLink.setAttribute("href", "admin-users.html");
  if (adminServicesLink) adminServicesLink.setAttribute("href", "admin-services.html");
}

// --- View Switching Navigation Logic ---
function showSection(viewId) {
  document.querySelectorAll(".app-view").forEach(view => {
    view.classList.remove("active-view");
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("active-view");
  }

  document.querySelectorAll(".sidebar-links a").forEach(link => {
    link.classList.remove("active");
  });

  const activeNavLink = document.querySelector(`[onclick="showSection('${viewId}')"]`);
  if (activeNavLink) activeNavLink.classList.add("active");

  const titleMap = {
    'home-view': 'Ecosystem Operations Hub',
    'wallet-view': 'Financial Asset & Wallet Manager',
    'ict-view': 'ICT Core & Technology Solutions Panel',
    'business-view': 'Corporate Business & High-Volume Print Center',
    'financial-view': 'Financial & Agency Banking Portal',
    'marketing-view': 'Campaign Deployment & Advisory Hub',
    'game-view': 'PanCafe Automated Client Node Console',
    'orders-view': 'Ecosystem Operational Order Logs'
  };
  if (panelTitleEl && titleMap[viewId]) {
    panelTitleEl.textContent = titleMap[viewId];
  }
}

// --- Fetch User Profile Data & Update Dashboard Counters ---
async function fetchUserProfile() {
  try {
    const res = await fetch(`${BASE_URL}/users/profile`, {
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
    userProfile = data.user || data;

    if (userProfile) {
      // Render Profile Details dynamically across all interface nodes
      document.querySelectorAll(".profile-user-name").forEach(el => {
        el.textContent = userProfile.name || "Hambak User";
      });
      document.querySelectorAll(".profile-user-role").forEach(el => {
        el.textContent = userProfile.role || "Customer";
      });

      if (userProfile.role && userProfile.role.toLowerCase() === 'admin') {
          document.querySelectorAll(".admin-block-section, .admin-only-tab").forEach(el => {
              const targetDisplay = el.tagName === 'A' ? 'flex' : 'block';
              el.style.setProperty('display', targetDisplay, 'important');
          });
      }

      // Sync and calculate live status counters
      const activeOrdersCount = userProfile.orders ? userProfile.orders.length : 0;
      const totalOrdersEl = document.getElementById("totalOrdersCounter");
      if (totalOrdersEl) totalOrdersEl.textContent = activeOrdersCount;

      // Sync Wallet Balance values across UI cards
      const balance = userProfile.wallet !== undefined ? userProfile.wallet : 0;
      walletBalanceElements.forEach(el => {
        el.textContent = `₦${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      });

      // Update Live Notification Center Elements dynamically
      const notificationTextEl = document.getElementById("notificationTextNode");
      if (notificationTextEl) {
        notificationTextEl.innerHTML = `Welcome back, <strong>${userProfile.name || 'User'}</strong>! Your connection to the workspace center is encrypted and secure.`;
      }

      if (typeof initializeCharts === "function") {
        initializeCharts();
      }

      renderSystemLogs(userProfile.logs || []);
      renderOrderHistory(userProfile.orders || []);
    }
  } catch (err) {
    console.error("Critical Profile Parsing Node Failure:", err);
  }
}

// --- Fetch Active Business Services from Backend Database ---
async function fetchSystemServices() {
  try {
    const res = await fetch(`${BASE_URL}/services`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Could not pull live ecosystem service data nodes.");

    allServicesArray = await res.json();
    populateCategorySelectors();
  } catch (err) {
    console.error("Services Synchronization Error:", err);
  }
}

// --- Inject Active Database Services into Core Target Dropdowns ---
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

    const componentServices = allServicesArray.filter(s => s.category?.toLowerCase() === categoryName);

    if (componentServices.length === 0) {
      selectEl.innerHTML = `<option value="">No Active ${categoryName.toUpperCase()} Services Configured</option>`;
      return;
    }

    selectEl.innerHTML = `<option value="">-- Select Valid Option --</option>`;
    componentServices.forEach(service => {
      const option = document.createElement("option");
      option.value = service._id || service.id;
      
      const targetName = service.name || service.serviceName || "Unnamed Service Node";
      const targetPrice = service.price !== undefined ? service.price : 0;
      
      option.textContent = `${targetName} (₦${Number(targetPrice).toLocaleString()})`;
      selectEl.appendChild(option);
    });
  });
}

// --- Live Processing Task Submission & Auto-Billing Layer ---
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

      const chosenService = allServicesArray.find(s => (s._id || s.id) === serviceSelect.value);
      const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
      const basePrice = chosenService ? (chosenService.price || 0) : 0;
      const totalCost = basePrice * quantity;

      if (userProfile && userProfile.wallet < totalCost) {
        alert(`Insufficient Funds! This operation costs ₦${totalCost.toLocaleString()}. Please fund your account wallet matrix first.`);
        showSection("wallet-view");
        return;
      }

      const formData = new FormData();
      formData.append("serviceId", serviceSelect.value);
      formData.append("quantity", quantity);
      formData.append("context", contextInput ? contextInput.value : "");
      
      if (fileInput && fileInput.files[0]) {
        formData.append("blueprint", fileInput.files[0]);
      }

      try {
        const res = await fetch(`${BASE_URL}/orders/create`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });

        const outcome = await res.json();
        if (!res.ok) throw new Error(outcome.message || "Request routing deployment failure.");

        alert("Operational Task Blueprint Dispatched & Debited Successfully!");
        form.reset();
        fetchUserProfile(); 
        showSection("orders-view");
      } catch (err) {
        alert(`Order Routing Aborted: ${err.message}`);
      }
    });
  });
}

// --- Paystack Online Funding Integration ---
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

    const handler = PaystackPop.setup({
      key: "pk_live_your_real_paystack_key_here", 
      email: userProfile.email,
      amount: Math.round(fundingAmount * 100), 
      currency: "NGN",
      callback: async (response) => {
        try {
          const verification = await fetch(`${BASE_URL}/wallet/verify-funding`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ reference: response.reference })
          });

          const verifiedData = await verification.json();
          if (verification.ok) {
            alert(`Wallet safely loaded with ₦${fundingAmount.toLocaleString()}!`);
            amountInput.value = "";
            fetchUserProfile();
          } else {
            alert(`Ledger Verification Error: ${verifiedData.message}`);
          }
        } catch (err) {
          console.error("Verification processing matrix failure:", err);
        }
      }
    });

    handler.openIframe();
  });
}

// --- Live PanCafe Socket Server Handshake Simulation ---
async function fetchLivePanCafeStatus() {
  const tokenDisplayNode = document.getElementById("pancafeTokenNode");
  if (!tokenDisplayNode) return;
  
  try {
    tokenDisplayNode.textContent = "SYNCHRONIZING REFRESH VECTOR...";
    setTimeout(() => {
      tokenDisplayNode.innerHTML = `HBK-GAME-${Math.floor(1000 + Math.random() * 9000)}`;
    }, 800);
  } catch (err) {
    tokenDisplayNode.textContent = "CONNECTION ERROR";
  }
}

function renderSystemLogs(logs) {
  if (!universalLogsTableBody) return;
  if (!logs || logs.length === 0) {
    universalLogsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No universal activity log records currently recorded.</td></tr>`;
    return;
  }
  universalLogsTableBody.innerHTML = "";
  logs.slice(0, 10).forEach(log => {
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

function getStatusBg(status) {
  switch (status?.toLowerCase()) {
    case 'completed': return '#10b981';
    case 'processing': return '#3b82f6';
    case 'failed': return '#ef4444';
    default: return '#f5b942';
  }
}

function printHistoryLog() {
  window.print();
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Confirm security closure. Do you want to sign out?")) {
      handleSessionTimeout();
    }
  });
}

function handleSessionTimeout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login.html";
}

function initializeCharts(revenueData = [120000, 190000, 270000, 320000, 410000, 450000]) {
  const revCtx = document.getElementById('revenueChart');
  const servCtx = document.getElementById('serviceChart');
  if (!revCtx || !servCtx) return;

  if (revenueChartInstance !== null) revenueChartInstance.destroy();
  revenueChartInstance = new Chart(revCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Gross Volume Tracking',
        data: revenueData,
        borderColor: '#0d47a1',
        backgroundColor: 'rgba(13, 71, 161, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1000 } }
  });

  if (serviceChartInstance !== null) serviceChartInstance.destroy();
  serviceChartInstance = new Chart(servCtx, {
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
