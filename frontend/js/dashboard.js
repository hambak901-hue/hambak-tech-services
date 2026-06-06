// ==========================================
// CORE DOM ELEMENT BINDINGS & LIFECYCLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const fundBtn = document.getElementById("fund-wallet-btn");
  const amountField = document.getElementById("funding-amount-input");

  if (fundBtn && amountField) {
    fundBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const rawAmount = amountField.value.trim();
      await handleWalletFunding(rawAmount);
    });
  }

  // Run the automatic redirection payment verification sweep immediately on load
  checkPaymentCallback();
});

// ==========================================
// PAYSTACK INITIALIZATION METHOD
// ==========================================
async function handleWalletFunding(amountInput) {
  const parsedAmount = parseFloat(amountInput);

  if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
    alert("Please enter a valid amount to fund your wallet.");
    return;
  }

  // Namespace structural dependency validation check
  if (!window.API || !window.API.transactions) {
    alert("System core error: Transaction processing matrix engine not found.");
    return;
  }

  try {
    if (window.showLoadingSpinner) window.showLoadingSpinner(true); 
    
    // 1. Call Backend to kick off Paystack session
    const result = await window.API.transactions.initializeDeposit(parsedAmount);
    
    if (result && result.success && result.authorization_url) {
      // Save the transaction reference temporarily to verify later if needed
      localStorage.setItem("pending_funding_reference", result.reference);
      
      // 2. Redirect user seamlessly to Paystack Secure Portal
      window.location.href = result.authorization_url;
    } else {
      alert("Payment initialization error: " + (result?.message || "Unknown routing exception."));
    }
  } catch (error) {
    console.error("Funding Matrix Exception:", error);
    alert("Failed to communicate with payment gateway engine.");
  } finally {
    if (window.showLoadingSpinner) window.showLoadingSpinner(false);
  }
}

// ==========================================
// PAYSTACK CALLBACK VERIFICATION ENGINE
// ==========================================
async function checkPaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference");

  if (reference) {
    if (!window.API || !window.API.transactions) {
      console.error("Delayed callback execution fault: API structure context unreachable.");
      return;
    }

    try {
      // Clear query params immediately so the user doesn't trigger multiple refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
      
      console.log(`Intercepted reference payload: ${reference}. Initializing authorization handshake...`);
      
      // Call backend handler to confirm payment settlement and credit wallet
      const verification = await window.API.transactions.verifyDeposit(reference);
      
      if (verification && verification.success) {
        alert(`Success! ${verification.message}`);
        
        // Trigger fresh UI updates to reflect the funded amount instantly
        if (typeof window.loadUserProfileData === "function") {
          window.loadUserProfileData(); 
        } else {
          window.location.reload();
        }
      } else {
        alert("Payment Verification Failed: " + (verification?.message || "Verification rejection."));
      }
    } catch (error) {
      console.error("Callback Verification Error:", error);
      alert("An error occurred while confirming your wallet funding status.");
    }
  }
}

// Optional dummy fallback UI utility function to prevent breaking exceptions
if (typeof window.showLoadingSpinner !== "function") {
  window.showLoadingSpinner = function(show) {
    console.log(show ? "Loading spinner active..." : "Loading spinner stopped.");
  };
}
