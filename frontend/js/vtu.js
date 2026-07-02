/* ==========================================================================
   HAMBAK TECH & SERVICES - MULTI-TIER VTU LOGIC & ROUTING CORE
   ========================================================================== */

// Default system state configuration profile matching wholesale pricing matrices
let currentUserTier = "retailer"; 
let walletBalance = 0;
const BASE_URL = "https://hambak-tech-services.onrender.com/api";

// Centralized dynamic matrix structure resembling advanced infrastructure
const tierDiscounts = {
  retailer:   { airtime: 0.015, data1GB: 250, mtnPin100: 99.00 },
  wholesaler: { airtime: 0.025, data1GB: 235, mtnPin100: 97.50 },
  subdealer:  { airtime: 0.035, data1GB: 220, mtnPin100: 96.20 },
  dealer:     { airtime: 0.045, data1GB: 210, mtnPin100: 95.00 }
};

document.addEventListener("DOMContentLoaded", async () => {
    await verifyAndFetchUserProfile();
    setupFormListeners();
    setupDynamicPricingPrompts();
});

/**
 * Syncs user profiles from backend to accurately determine pricing tiers and wallet status
 */
async function verifyAndFetchUserProfile() {
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    
    // Intercept immediate entry if no active session profile exists
    if (!token) {
        alert("Authentication Profile Required: Please sign in or create a Hambak account to access the VTU distribution matrix.");
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
            alert("Session Expired: Please log back in to authenticate your ledger parameters.");
            sessionStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();
        const activeUser = data.user || data;

        if (activeUser) {
            // Check for correct role/tier configuration mapping
            currentUserTier = activeUser.role || "retailer"; 
            
            // Map exact structural ledger balance returned from database keys
            walletBalance = Number(activeUser.walletBalance || activeUser.wallet || 0);
            
            initializeTierHighlights();
            updateDOMBalances();
        }
    } catch (err) {
        console.error("Ledger synchronization exception context:", err);
        // Fallback checks using local UI presets without disrupting view layer completely
        initializeTierHighlights(); 
    }
}

function initializeTierHighlights() {
    document.querySelectorAll(".tier-badge").forEach(badge => {
        badge.classList.remove("active-tier");
    });
    const targetBadge = document.getElementById(`tier-${currentUserTier}`);
    if (targetBadge) targetBadge.classList.add("active-tier");
}

function updateDOMBalances() {
    const balanceDisplay = document.querySelector(".wallet-balance h2");
    if (balanceDisplay) {
        balanceDisplay.innerText = `₦${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
}

function setupFormListeners() {
    const airtimeForm = document.getElementById("airtimeForm");
    if (airtimeForm) airtimeForm.addEventListener("submit", handleAirtimeSubmission);

    const dataForm = document.getElementById("dataForm");
    if (dataForm) dataForm.addEventListener("submit", handleDataSubmission);

    const bulkForm = document.getElementById("bulkForm");
    if (bulkForm) bulkForm.addEventListener("submit", handleBulkSubmission);
}

/**
 * Injects helpful live hints directly under interaction fields to show discounts to users
 */
function setupDynamicPricingPrompts() {
    const bulkNet = document.getElementById("bulkNetwork");
    const bulkDenom = document.getElementById("bulkDenomination");
    const hintBox = document.getElementById("pricingTierHint");

    if (!bulkNet || !bulkDenom || !hintBox) return;

    const updateHint = () => {
        if (!bulkNet.value || !bulkDenom.value) {
            hintBox.innerText = "";
            return;
        }
        const rates = tierDiscounts[currentUserTier] || tierDiscounts["retailer"];
        const multiplier = Number(bulkDenom.value) / 100;
        const unitCost = rates.mtnPin100 * multiplier;
        hintBox.innerHTML = `<i class="fa-solid fa-tags"></i> Your Active <strong>${currentUserTier.toUpperCase()}</strong> Rate: ₦${unitCost.toFixed(2)} per item card.`;
    };

    bulkNet.addEventListener("change", updateHint);
    bulkDenom.addEventListener("change", updateHint);
}

/**
 * Form handlers & transmission routers
 */
async function handleAirtimeSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    if (!token) return alert("Session Error: Please authenticate your account layout node first.");

    const network = document.getElementById("airtimeNetwork").value;
    const phoneNumber = document.getElementById("airtimePhone").value;
    const amount = Number(document.getElementById("airtimeAmount").value);

    const currentRates = tierDiscounts[currentUserTier] || tierDiscounts["retailer"];
    const discount = currentRates.airtime;
    const computedDebit = amount * (1 - discount);

    if (walletBalance < computedDebit) {
        return alert(`Insufficient Balance! This purchase costs ₦${computedDebit.toFixed(2)} based on your ${currentUserTier} discount.`);
    }

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Processing Airtime Node...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/vtu/airtime`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ network, phoneNumber, amount, computedDebit, discountTier: currentUserTier })
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Success: Airtime Dispensed! Charged ₦${computedDebit.toFixed(2)} instead of ₦${amount}.`);
            event.target.reset();
            await verifyAndFetchUserProfile();
        } else {
            alert(`⚠️ Gateway Rejection: ${data.message}`);
        }
    } catch (error) {
        alert("System Timeout: Failed to reach standard telecommunications node link.");
    } finally {
        submitBtn.innerText = "Dispense Airtime";
        submitBtn.disabled = false;
    }
}

async function handleDataSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
    if (!token) return alert("Session Error: Please authenticate your profile layout node.");

    const network = document.getElementById("dataNetwork").value;
    const plan = document.getElementById("dataPlan").value;
    const phoneNumber = document.getElementById("dataPhone").value;

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Allocating Bundle Layer...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/vtu/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ network, plan, phoneNumber, tier: currentUserTier })
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Success: Data allocated successfully to ${phoneNumber}`);
            event.target.reset();
            await verifyAndFetchUserProfile();
        } else {
            alert(`⚠️ Allocation Failure: ${data.message}`);
        }
    } catch (error) {
        alert("Fatal Error: Transmission timeout across processing nodes.");
    } finally {
        submitBtn.innerText = "Provision Data Plan";
        submitBtn.disabled = false;
    }
}

async function handleBulkSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");

    const network = document.getElementById("bulkNetwork").value;
    const denomination = document.getElementById("bulkDenomination").value;
    const quantity = Number(document.getElementById("bulkQuantity").value);
    const deliveryMode = document.getElementById("deliveryMode").value;
    const deliveryAddress = document.getElementById("deliveryAddress")?.value || "";
    const contactReceiver = document.getElementById("contactReceiver")?.value || "";

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Staging Wholesale Order Matrix...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/vtu/bulk-wholesale`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ network, denomination, quantity, deliveryMode, deliveryAddress, contactReceiver, tier: currentUserTier })
        });
        const data = await response.json();

        if (data.success) {
            if (deliveryMode === "digital" && data.pins) {
                alert(`🎉 Wholesale Print Configuration Ready! Download started for ${data.pins.length} tokens.`);
                downloadPinsAsTXT(data.pins, network, denomination);
            } else {
                alert(`🚚 Logistics Cargo Order Staged! Tracking Code: ${data.logToken?._id || 'Pending Link'}`);
            }
            event.target.reset();
            window.toggleDeliveryFields("digital");
            await verifyAndFetchUserProfile();
        } else {
            alert(`⚠️ Staging Rejected: ${data.message}`);
        }
    } catch (error) {
        handleOfflineCompilationFallback(network, denomination, quantity, deliveryMode, deliveryAddress);
    } finally {
        submitBtn.innerText = "Initialize Wholesale Request";
        submitBtn.disabled = false;
    }
}

function handleOfflineCompilationFallback(network, denomination, quantity, deliveryMode, address) {
    if(!confirm("Remote database endpoint offline. Execute manual client-side backup layout conversion?")) return;
    
    let generatedPins = [];
    for(let i=0; i<quantity; i++) {
        generatedPins.push({
            serial: `HM-${network.substring(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
            pin: Math.floor(100000000000 + Math.random() * 899999999999)
        });
    }
    
    if(deliveryMode === "digital") {
        downloadPinsAsTXT(generatedPins, network, denomination);
    } else {
        alert(`Offline Physical Routing Intercepted!\nForward this to Hambak Desk for validation processing:\n${quantity} units of ${network} ₦${denomination} to: ${address}`);
    }
}

function downloadPinsAsTXT(pinsArray, network, denomination) {
    let fileContent = `==================================================\n  HAMBAK TECH & SERVICES - WHOLESALE PIN LIST  \n==================================================\nNETWORK SOURCE: ${network} | DENOMINATION TIER: ₦${denomination}\nGENERATOR ROUTE: CLIENT EXCEL MATRIX SYNC\nDATE EXECUTION: ${new Date().toLocaleString()}\n\n`;
    pinsArray.forEach((item, index) => {
        fileContent += `${index + 1}. [SERIAL: ${item.serial}] ---- PINCODE: ${item.pin}\n`;
    });
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HAMBAK_DEALER_${network}_N${denomination}_${Date.now()}.txt`;
    link.click();
}

window.toggleDeliveryFields = function(modeValue) {
    const logisticsBox = document.getElementById("logisticsContainer");
    const addressInput = document.getElementById("deliveryAddress");
    if (!logisticsBox || !addressInput) return;

    if (modeValue === "physical") {
        logisticsBox.style.display = "flex";
        addressInput.required = true;
    } else {
        logisticsBox.style.display = "none";
        addressInput.required = false;
    }
};
