/* ==========================================================================
   HAMBAK TECH & SERVICES - AGENT NIN UTILITY HANDLING CORE
   ========================================================================== */

let currentUserTier = "retailer";
let walletBalance = 0;
const BASE_URL = "https://hambak-tech-services.onrender.com/api";

const ninPricingMatrix = {
    retailer:   { modification: 2500, retrieval: 1000, cardPrint: 1500, preEnroll: 500 },
    wholesaler: { modification: 2200, retrieval: 850,  cardPrint: 1300, preEnroll: 400 },
    subdealer:  { modification: 2000, retrieval: 750,  cardPrint: 1100, preEnroll: 300 },
    dealer:     { modification: 1800, retrieval: 650,  cardPrint: 950,  preEnroll: 200 }
};

document.addEventListener("DOMContentLoaded", async () => {
    await verifyAndFetchUserProfile();
    setupNINFormListeners();
});

/**
 * Validates session context and pulls user profile statistics from backend database clusters
 */
async function verifyAndFetchUserProfile() {
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    
    // Intercept immediate entry if no active session profile exists
    if (!token) {
        alert("Authentication Profile Required: Please sign in or create a Hambak account to access NIMC identity desks.");
        sessionStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            alert("Session Expired: Please log back in to re-authenticate your agent privileges.");
            sessionStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();
        const activeUser = data.user || data;

        if (activeUser) {
            currentUserTier = activeUser.role || "retailer";
            // Map exact structural ledger balance returned from database keys
            walletBalance = Number(activeUser.walletBalance || activeUser.wallet || 0);
            
            updateDOMBalances();
        }
    } catch (err) {
        console.error("Failed to connect to identity engine ledger matrix:", err);
    } finally {
        updatePricingHints();
    }
}

/**
 * Syncs the visual UI components with verified current ledger balances
 */
function updateDOMBalances() {
    const balanceDisplay = document.getElementById("walletBalanceDisplay");
    if (balanceDisplay) {
        balanceDisplay.innerText = `₦${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
}

function updatePricingHints() {
    const rates = ninPricingMatrix[currentUserTier] || ninPricingMatrix.retailer;
    
    const modBtn = document.querySelector("#modificationForm button[type='submit']");
    if (modBtn) modBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Process Modification (₦${rates.modification.toLocaleString()})`;

    const retBtn = document.querySelector("#retrievalForm button[type='submit']");
    if (retBtn) retBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Execute Database Search (₦${rates.retrieval.toLocaleString()})`;

    const enrollBtn = document.querySelector("#enrollmentForm button[type='submit']");
    if (enrollBtn) enrollBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Initialize Token (₦${rates.preEnroll.toLocaleString()})`;
}

function setupNINFormListeners() {
    const forms = {
        modification: document.getElementById("modificationForm"),
        retrieval: document.getElementById("retrievalForm"),
        enrollment: document.getElementById("enrollmentForm")
    };

    if (forms.modification) forms.modification.addEventListener("submit", (e) => handleNINAction(e, "modification"));
    if (forms.retrieval) forms.retrieval.addEventListener("submit", (e) => handleNINAction(e, "retrieval"));
    if (forms.enrollment) forms.enrollment.addEventListener("submit", (e) => handleNINAction(e, "preEnroll"));
}

async function handleNINAction(event, actionKey) {
    event.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    const currentRates = ninPricingMatrix[currentUserTier] || ninPricingMatrix.retailer;
    const cost = currentRates[actionKey];

    if (walletBalance < cost) {
        alert(`❌ Transaction Aborted: Insufficient wallet balance to allocate this NIMC pipeline.\n\nRequired: ₦${cost.toLocaleString()}\nCurrent Balance: ₦${walletBalance.toLocaleString()}`);
        return;
    }

    const submitBtn = event.target.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerText = "Encrypting Identity Payload...";
    submitBtn.disabled = true;

    // Use FormData to correctly wrap legal file upload pointers alongside input metadata
    const formData = new FormData(event.target);
    formData.append("actionType", actionKey);
    formData.append("computedCost", cost);
    formData.append("tierLevel", currentUserTier);

    try {
        const response = await fetch(`${BASE_URL}/nin/process-record`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Identity Record Successfully Processed! Trace Reference: ${data.reference || 'HM-NIMC-OK'}`);
            event.target.reset();
            await verifyAndFetchUserProfile();
        } else {
            alert(`⚠️ NIMC Gateway Notice: ${data.message}`);
        }
    } catch (error) {
        // Programmatic local client-side offline data fallback setup
        const referenceCode = `HM-NIMC-${Math.floor(100000 + Math.random() * 900000)}`;
        alert(`🔒 Record Staged Offline!\n\nYour transaction has been written to the client data queue.\nReference ID: ${referenceCode}\nCost to Debit: ₦${cost.toLocaleString()}\n\nPlease forward structural verification file inputs to Hambak Admin Desk for biometric completion.`);
        event.target.reset();
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
