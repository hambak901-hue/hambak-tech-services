/**
 * ==========================================================================
 * HAMBAK TECH & SERVICES - FRONTEND VTU LOGIC & ROUTING CORE
 * ==========================================================================
 */

// Global state profile tracking variables
let currentUserTier = "dealer"; // Default state fallback. In production, read this dynamically from your session profile.

document.addEventListener("DOMContentLoaded", () => {
    initializeTierHighlights();
    setupFormListeners();
});

/**
 * Highlights the active pricing system tier matching the user's authentic account profile
 */
function initializeTierHighlights() {
    // Strip active status classes from all element states first
    document.querySelectorAll(".tier-badge").forEach(badge => {
        badge.classList.remove("active-tier");
    });

    // Find and map to current session's layout tracking indicator
    const targetBadge = document.getElementById(`tier-${currentUserTier}`);
    if (targetBadge) {
        targetBadge.classList.add("active-tier");
    }
}

/**
 * Attaches structured tracking listeners to both single dispatch components and bulk forms
 */
function setupFormListeners() {
    const bulkForm = document.getElementById("bulkForm");
    if (bulkForm) {
        bulkForm.addEventListener("submit", handleBulkSubmission);
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
        addressInput.style.animation = "fadeIn 0.3s ease-in-out";
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

    const network = document.getElementById("bulkNetwork").value;
    const denomination = document.getElementById("bulkDenomination").value;
    const quantity = document.getElementById("bulkQuantity").value;
    const deliveryMode = document.getElementById("deliveryMode").value;
    const deliveryAddress = document.getElementById("deliveryAddress")?.value || "";
    const contactReceiver = document.getElementById("contactReceiver")?.value || "";

    // Show visual processing indicator feedback
    const submitBtn = event.target.querySelector("button[type='submit']");
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Staging Order Matrix...";
    submitBtn.disabled = true;

    const payload = {
        network,
        denomination,
        quantity,
        deliveryMode,
        deliveryAddress,
        contactReceiver
    };

    try {
        const response = await fetch("/api/vtu/bulk-wholesale", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Include JWT Auth Tokens here if required by your protected routes
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            if (deliveryMode === "digital" && data.pins) {
                alert(`🎉 Wholesale complete! Generated ${data.pins.length} tokens. Preparing PDF render node...`);
                downloadPinsAsTXT(data.pins, network, denomination);
            } else {
                alert(`🚚 Logistics Route Confirmed! Cargo order safely queued under trace code: ${data.logToken._id}`);
            }
            
            // Reload window cleanly or clear inputs to preserve transaction state consistency
            event.target.reset();
            toggleDeliveryFields("digital");
        } else {
            alert(`⚠️ Transaction rejected: ${data.message}`);
        }

    } catch (error) {
        console.error("Pipeline Communication Error:", error);
        alert("Fatal Error: Could not connect to HAMBAK backend distribution pipeline routing node.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Utility Helper: Exports generated bulk card pin matrices down directly as clean .txt configuration files
 */
function downloadPinsAsTXT(pinsArray, network, denomination) {
    let fileContent = `==================================================\n`;
    fileContent += `       HAMBAK TECH & SERVICES - BULK PIN SHEET     \n`;
    fileContent += `==================================================\n`;
    fileContent += `NETWORK: ${network} | DENOMINATION: ₦${denomination}\n`;
    fileContent += `GENERATED ON: ${new Date().toLocaleString()}\n\n`;

    pinsArray.forEach((item, index) => {
        fileContent += `${index + 1}. SERIAL: ${item.serial} ---- PIN: ${item.pin}\n`;
    });

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HAMBAK_${network}_N${denomination}_${Date.now()}.txt`;
    link.click();
}

// Map the delivery visibility switcher hook explicitly to global memory windows for HTML inline safety
window.toggleDeliveryFields = toggleDeliveryFields;
