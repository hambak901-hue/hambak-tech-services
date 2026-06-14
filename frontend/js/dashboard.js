/**
 * ==========================================================================
 * HAMBAK TECH & SERVICES - PREMIUM WORKSPACE DASHBOARD ENGINE
 * Location: frontend/js/dashboard.js
 * ==========================================================================
 */

const token = localStorage.getItem("hambak_token");
const LIVE_API_URL = "https://hambak-tech-services.onrender.com/api";

// 1. Guard Protection Clause
if (!token) {
    window.location.href = "login.html";
}

const getHeaders = () => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
});

// 2. Global View-Switching Node Router Matrix
window.showSection = function(sectionId) {
    document.querySelectorAll('.app-view').forEach(view => { 
        view.classList.remove('active-view'); 
    });
    document.querySelectorAll('.sidebar-links a').forEach(link => { 
        link.classList.remove('active'); 
    });
    
    const targetView = document.getElementById(sectionId);
    if (targetView) targetView.classList.add('active-view');
    
    const componentId = sectionId.split('-')[0];
    const targetNavLink = document.getElementById(`nav-${componentId}`);
    if (targetNavLink) targetNavLink.classList.add('active');
};

// 3. Main Dashboard Engine Initialization
async function loadUserDashboardEngine() {
    try {
        const response = await fetch(`${LIVE_API_URL}/auth/me`, { method: "GET", headers: getHeaders() });
        const data = await response.json();

        if (response.ok && data) {
            const activeUser = data.user ? data.user : data;
            if (!activeUser.role) { throw new Error("Format misalignment."); }

            // Populate text parameters safely
            document.getElementById("userName").innerText = activeUser.name || "Hambak Customer";
            document.getElementById("userRole").innerText = activeUser.role;
            
            // Sync wallet currency format elements uniformly
            const walletVal = activeUser.wallet !== undefined ? activeUser.wallet : 0;
            document.querySelectorAll(".wallet-balance").forEach(block => {
                block.innerHTML = `₦${Number(walletVal).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            });

            localStorage.setItem("hambak_user", JSON.stringify(activeUser));

            // Role Elevation Visibility Modifiers
            if (activeUser.role === "admin") {
                document.getElementById("panelTitle").innerText = "Root Admin Terminal Control";
                document.querySelectorAll(".admin-block-section").forEach(section => { section.style.display = "block"; });
                initializeAnalyticsCharts(); // Build graphs if root metrics are unlocked
            } else {
                document.getElementById("panelTitle").innerText = "Customer Account Dashboard";
                document.querySelectorAll(".admin-block-section").forEach(section => { section.style.display = "none"; });
            }
            
            // Core Sub-Log Synchronizations
            loadLocalTransactions();
            loadServiceOrderLogs();

        } else {
            handleLogoutAction();
        }
    } catch (error) {
        console.error("Graceful recovery mode launched:", error);
        const localCachedUser = localStorage.getItem("hambak_user");
        if (localCachedUser) {
            const user = JSON.parse(localCachedUser);
            document.getElementById("userName").innerText = user.name;
            document.getElementById("userRole").innerText = user.role;
            if (user.role === "admin") {
                document.querySelectorAll(".admin-block-section").forEach(s => s.style.display = "block");
                initializeAnalyticsCharts();
            }
        } else {
            handleLogoutAction();
        }
    }
}

// 4. Charting Initialization Vector (Chart.js Module)
function initializeAnalyticsCharts() {
    const ctxRevenue = document.getElementById("revenueChart");
    const ctxService = document.getElementById("serviceChart");
    
    if (ctxRevenue && ctxService) {
        // Clear any old instances to prevent layout bugs
        if (window.revenueChartInstance) window.revenueChartInstance.destroy();
        if (window.serviceChartInstance) window.serviceChartInstance.destroy();

        window.revenueChartInstance = new Chart(ctxRevenue, {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{ 
                    label: "Gross Revenue Index", 
                    data: [12000, 19000, 30000, 25000, 42000, 50000], 
                    borderColor: "#0d47a1", 
                    borderWidth: 3, 
                    tension: 0.4, 
                    fill: false 
                }]
            }
        });

        window.serviceChartInstance = new Chart(ctxService, {
            type: "doughnut",
            data: {
                labels: ["NIN", "Printing", "Training", "VTU"],
                datasets: [{ 
                    data: [25, 20, 35, 20], 
                    backgroundColor: ["#0d47a1", "#f5b942", "#ff4081", "#081120"], 
                    borderWidth: 2 
                }]
            }
        });
    }
}

// 5. Load Account Wallet Ledger History Logs
async function loadLocalTransactions() {
    try {
        const res = await fetch(`${LIVE_API_URL}/transactions/my`, { headers: getHeaders() });
        const data = await res.json();
        const tbody = document.getElementById("universalLogsTableBody");
        
        if (data.success && data.transactions && data.transactions.length > 0) {
            tbody.innerHTML = "";
            data.transactions.slice(0, 5).forEach(tx => {
                const color = tx.status === 'successful' ? '#25d366' : (tx.status === 'pending' ? '#f5b942' : '#ff4081');
                tbody.innerHTML += `<tr>
                    <td><span style="text-transform:uppercase; font-weight:bold;">${tx.type}</span> - ${tx.description || 'Service Execution'}</td>
                    <td>₦${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td style="color:${color}; font-weight:bold; text-transform:capitalize;">${tx.status}</td>
                    <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>`;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4">No payment transaction profiles logged onto this account profile.</td></tr>`;
        }
    } catch (err) {
        document.getElementById("universalLogsTableBody").innerHTML = `<tr><td colspan="4">Offline caching active. Awaiting network routing link.</td></tr>`;
    }
}

// 6. Load Operations Order Logs Array
async function loadServiceOrderLogs() {
    try {
        const res = await fetch(`${LIVE_API_URL}/orders/my`, { headers: getHeaders() });
        const data = await res.json();
        const orderTable = document.getElementById("ordersLogTable");

        if (data.success && data.orders && data.orders.length > 0) {
            orderTable.innerHTML = "";
            data.orders.forEach(order => {
                orderTable.innerHTML += `<tr>
                    <td><code>${order._id.substring(14)}</code></td>
                    <td><strong>${order.category}</strong> - ${order.details || 'Task specifications stashed.'}</td>
                    <td>₦${Number(order.cost || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td style="font-weight:bold; text-transform:uppercase;">${order.status}</td>
                </tr>`;
            });
        } else {
            orderTable.innerHTML = `<tr><td colspan="4">No dynamic customized service orders logged onto this account.</td></tr>`;
        }
    } catch (err) {
        console.log("Order history bypassing complete.");
    }
}

// 7. Interactive Paystack Verification Node Interceptor
document.getElementById("fund-wallet-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const amountInput = document.getElementById("funding-amount-input").value.trim();
    const parsedAmount = parseFloat(amountInput);

    if (!parsedAmount || parsedAmount < 100 || isNaN(parsedAmount)) {
        alert("Please specify a valid transaction target (Minimum entry threshold: ₦100).");
        return;
    }

    try {
        const fundBtn = document.getElementById("fund-wallet-btn");
        fundBtn.innerText = "Staging Node Securely...";
        fundBtn.disabled = true;

        const response = await fetch(`${LIVE_API_URL}/transactions/paystack/initialize`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ amount: parsedAmount })
        });
        const result = await response.json();
        
        if (result.success && result.authorization_url) {
            localStorage.setItem("pending_funding_reference", result.reference);
            window.location.href = result.authorization_url;
        } else {
            alert("Payment gateway communication breakdown: " + result.message);
            fundBtn.innerText = "Initialize Checkout";
            fundBtn.disabled = false;
        }
    } catch (error) {
        alert("Critical runtime communication failure with transaction infrastructure.");
        document.getElementById("fund-wallet-btn").innerText = "Initialize Checkout";
        document.getElementById("fund-wallet-btn").disabled = false;
    }
});

// 8. Checking Direct Payment Callback Redirection Verifications
async function checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
        try {
            window.history.replaceState({}, document.title, window.location.pathname);
            alert("Verifying allocation verification hashes with Paystack Engine...");
            
            const response = await fetch(`${LIVE_API_URL}/transactions/paystack/verify`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ reference })
            });
            const verification = await response.json();
            
            if (verification.success) {
                alert(`Success! Ledger modification acknowledged: ${verification.message}`);
                loadUserDashboardEngine();
            } else {
                alert("Sovereign payment confirmation failed: " + verification.message);
            }
        } catch (error) {
            console.error("Verification processing error context:", error);
        }
    }
}

// 9. Form Processing: NIN Validation Data Streams
document.getElementById("ninServiceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const category = document.getElementById("nin-category").value;
    const idNumber = document.getElementById("nin-number").value.trim();
    const description = document.getElementById("nin-context").value.trim();
    const btn = document.getElementById("nin-submit-btn");

    try {
        btn.innerText = "Staging Form Vector..."; 
        btn.disabled = true;
        const res = await fetch(`${LIVE_API_URL}/services/nin`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ category, idNumber, description })
        });
        const output = await res.json();
        if (res.ok) {
            alert("Identity workflow task securely injected into Mongo cluster line.");
            document.getElementById("ninServiceForm").reset();
            loadServiceOrderLogs();
        } else { 
            alert(`Operation rejected: ${output.message}`); 
        }
    } catch (err) { 
        alert("Server network connection decoupled."); 
    } finally { 
        btn.innerText = "Deploy Request Verification"; 
        btn.disabled = false; 
    }
});

// 10. Form Processing: Premium Print Mapping Scheduling Node
document.getElementById("printJobForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const itemType = document.getElementById("print-item-type").value;
    const quantity = document.getElementById("print-quantity").value;
    const layoutUrl = document.getElementById("print-drive-url").value.trim();
    const btn = document.getElementById("print-submit-btn");

    try {
        btn.innerText = "Allocating Layout Memory..."; 
        btn.disabled = true;
        const res = await fetch(`${LIVE_API_URL}/services/printing`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ itemType, quantity, layoutUrl })
        });
        const output = await res.json();
        if (res.ok) {
            alert("Layout allocation map built. Print node job scheduled.");
            document.getElementById("printJobForm").reset();
            loadServiceOrderLogs();
        } else { 
            alert(`Operation rejected: ${output.message}`); 
        }
    } catch (err) { 
        alert("Server network connection decoupled."); 
    } finally { 
        btn.innerText = "Initialize Printing Job"; 
        btn.disabled = false; 
    }
});

function handleLogoutAction() {
    localStorage.clear();
    window.location.href = "login.html";
}

document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    handleLogoutAction();
});

// Run Core Startup Sequence
document.addEventListener("DOMContentLoaded", () => {
    loadUserDashboardEngine();
    checkPaymentCallback();
});
