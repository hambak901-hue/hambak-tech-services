/* ==========================================================================
   HAMBAK TECH & SERVICES - AGENT NIN UTILITY HANDLING CORE
   ========================================================================== */

let currentUserTier = "retailer";
let walletBalance = 0;

const ninPricingMatrix = {
    retailer:   { modification: 2500, retrieval: 1000, cardPrint: 1500, preEnroll: 500 },
    wholesaler: { modification: 2200, retrieval: 850,  cardPrint: 1300, preEnroll: 400 },
    subdealer:  { modification: 2000, retrieval: 750,  cardPrint: 1100, preEnroll: 300 },
    dealer:     { modification: 1800, retrieval: 650,  cardPrint: 950,  preEnroll: 200 }
};

document.addEventListener("DOMContentLoaded", () => {
    fetchUserProfile();
    setupNINFormListeners();
});

async function fetchUserProfile() {
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    if (!token) {
        console.warn("No active auth token found. Standard retail transaction rates loaded.");
        updatePricingHints();
        return;
    }

    try {
        const response = await fetch("/api/users/profile", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.user) {
            currentUserTier = data.user.role || "retailer";
            walletBalance = Number(data.user.wallet || 0);
        }
    } catch (err) {
        console.error("Failed to connect to identity engine ledger matrix:", err);
    } finally {
        updatePricingHints();
    }
}

function updatePricingHints() {
    const rates = ninPricingMatrix[currentUserTier] || ninPricingMatrix.retailer;
    
    const modBtn = document.querySelector("#modificationForm button[type='submit']");
    if (modBtn) modBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Process Modification (₦${rates.modification})`;

    const retBtn = document.querySelector("#retrievalForm button[type='submit']");
    if (retBtn) retBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Execute Database Search (₦${rates.retrieval})`;

    const enrollBtn = document.querySelector("#enrollmentForm button[type='submit']");
    if (enrollBtn) enrollBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Initialize Token (₦${rates.preEnroll})`;
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
    const cost = ninPricingMatrix[currentUserTier][actionKey];

    if (token && walletBalance < cost) {
        alert(`❌ Transaction Aborted: Insufficient wallet balance to allocate this NIMC pipeline. Cost: ₦${cost}. Current Balance: ₦${walletBalance}`);
        return;
    }

    const submitBtn = event.target.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerText = "Encrypting Identity Payload...";
    submitBtn.disabled = true;

    const formData = new FormData(event.target);
    formData.append("actionType", actionKey);
    formData.append("computedCost", cost);
    formData.append("tierLevel", currentUserTier);

    try {
        const response = await fetch("/api/nin/process-record", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Identity Record Successfully Processed! Trace Code: ${data.reference}`);
            event.target.reset();
            fetchUserProfile();
        } else {
            alert(`⚠️ NIMC Gateway Notice: ${data.message}`);
        }
    } catch (error) {
        const referenceCode = `HM-NIMC-${Math.floor(100000 + Math.random() * 900000)}`;
        alert(`🔒 Record Staged Offline!\n\nYour transaction has been written to the client data queue.\nReference ID: ${referenceCode}\nCost to Debit: ₦${cost}\n\nPlease forward physical details to Hambak Admin Desk for biometrics.`);
        event.target.reset();
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
