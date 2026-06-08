/**
 * ==========================================================================
 * HAMBAK TECH & SERVICES - FRONTEND VTU LOGIC & ROUTING CORE
 * ==========================================================================
 */

// Global state profile tracking variables
let currentUserTier = "retailer"; // Fallback state

document.addEventListener("DOMContentLoaded", () => {
    fetchUserProfile();
    setupFormListeners();
});

/**
 * Fetches authenticated profile session to update wallet layout and pricing tiers dynamically
 */
async function fetchUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No active authorization token found in storage matrix.");
        return;
    }

    try {
        const response = await fetch("/api/users/profile", { // Adjust endpoint to match your user routing path
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.user) {
            // Map backend role/tier directly to frontend
            currentUserTier = data.user.role || "retailer"; 
            initializeTierHighlights();
            
            // Format wallet display balance dynamically
            const balanceDisplay = document.querySelector(".wallet-balance h2");
            if (balanceDisplay) {
                balanceDisplay.innerText = `₦${Number(data.user.wallet).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            }
        }
    } catch (err) {
        console.error("Failed to load user environment profile states:", err);
    }
}

/**
 * Highlights the active pricing system tier matching the user's authentic account profile
 */
function initializeTierHighlights() {
    document.querySelectorAll(".tier-badge").forEach(badge => {
        badge.classList.remove("active-tier");
    });

    const targetBadge = document.getElementById(`tier-${currentUserTier}`);
    if (targetBadge) {
        targetBadge.classList.add("active-tier");
    }
}

/**
 * Attaches structured tracking listeners to single dispatch components and bulk forms
 */
function setupFormListeners() {
    const airtimeForm = document.querySelector("form[onsubmit*='Airtime']");
    if (airtimeForm) {
        airtimeForm.removeAttribute("onsubmit"); // Strip baseline alert hook
        airtimeForm.addEventListener("submit", handleAirtimeSubmission);
    }

    const dataForm = document.querySelector("form[onsubmit*='Data']");
    if (dataForm) {
        dataForm.removeAttribute("onsubmit"); // Strip baseline alert hook
        dataForm.addEventListener("submit", handleDataSubmission);
    }

    const bulkForm = document.getElementById("bulkForm");
    if (bulkForm) {
        bulkForm.addEventListener("submit", handleBulkSubmission);
    }
}

/**
 * Transports single airtime dispatch transactions to your server core endpoints
 */
async function handleAirtimeSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Authentication error: Please log into your profile.");

    const inputs = event.target.querySelectorAll("select, input");
    const network = inputs[0].value;
    const phoneNumber = inputs[1].value;
    const amount = inputs[2].value;

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Processing Transaction...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/vtu/airtime", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ network, phoneNumber, amount })
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Success: ${data.message}`);
            event.target.reset();
            fetchUserProfile(); // Refresh ledger balance
        } else {
            alert(`⚠️ Dispatch Rejected: ${data.message}`);
        }
    } catch (error) {
        alert("Fatal Error: Could not connect to airtime distribution pipeline.");
    } finally {
        submitBtn.innerText = "Execute Airtime Dispense";
        submitBtn.disabled = false;
    }
}

/**
 * Transports single data bundle provisions to your server core endpoints
 */
async function handleDataSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Authentication error: Please log into your profile.");

    const selects = event.target.querySelectorAll("select");
    const network = selects[0].value;
    const plan = selects[1].value;
    const phoneNumber = event.target.querySelector("input[type='tel']").value;

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Allocating Bundle Layer...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/vtu/airtime", { // Reuses router check against matching data pricing indicators
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ network, phoneNumber, amount: 250, isData: true, dataPlan: plan }) 
        });
        const data = await response.json();

        if (data.success) {
            alert(`🎉 Success: Data allocated to ${phoneNumber}`);
            event.target.reset();
            fetchUserProfile();
        } else {
            alert(`⚠️ Provisioning Denied: ${data.message}`);
        }
    } catch (error) {
        alert("Fatal Error: Data allocation transaction timeout.");
    } finally {
        submitBtn.innerText = "Provision Data Plan";
        submitBtn.disabled = false;
    }
}

/**
 * Toggles structural delivery address textboxes into view based on selected cargo dispatch mechanics
 */
function toggleDeliveryFields(modeValue) {
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
}

/**
 * Transports bulk wholesale pin arrays to your server core endpoints
 */
async function handleBulkSubmission(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const network = document.getElementById("bulkNetwork").value;
    const denomination = document.getElementById("bulkDenomination").value;
    const quantity = document.getElementById("bulkQuantity").value;
    const deliveryMode = document.getElementById("deliveryMode").value;
    const deliveryAddress = document.getElementById("deliveryAddress")?.value || "";
    const contactReceiver = document.getElementById("contactReceiver")?.value || "";

    const submitBtn = event.target.querySelector("button[type='submit']");
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Staging Order Matrix...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/vtu/bulk-wholesale", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ network, denomination, quantity, deliveryMode, deliveryAddress, contactReceiver })
        });

        const data = await response.json();

        if (data.success) {
            if (deliveryMode === "digital" && data.pins) {
                alert(`🎉 Wholesale complete! Generated ${data.pins.length} tokens.`);
                downloadPinsAsTXT(data.pins, network, denomination);
            } else {
                alert(`🚚 Logistics Route Confirmed! Cargo order queued under trace code: ${data.logToken._id}`);
            }
            event.target.reset();
            toggleDeliveryFields("digital");
            fetchUserProfile();
        } else {
            alert(`⚠️ Transaction rejected: ${data.message}`);
        }
    } catch (error) {
        alert("Fatal Error: Could not connect to distribution pipeline.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

function downloadPinsAsTXT(pinsArray, network, denomination) {
    let fileContent = `==================================================\n  HAMBAK TECH & SERVICES - BULK PIN SHEET  \n==================================================\nNETWORK: ${network} | DENOMINATION: ₦${denomination}\nDATE: ${new Date().toLocaleString()}\n\n`;
    pinsArray.forEach((item, index) => {
        fileContent += `${index + 1}. SERIAL: ${item.serial} ---- PIN: ${item.pin}\n`;
    });
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HAMBAK_${network}_N${denomination}_${Date.now()}.txt`;
    link.click();
}

window.toggleDeliveryFields = toggleDeliveryFields;
