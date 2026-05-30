// ==========================================
// CORE DOM ELEMENT BINDINGS & LIFECYCLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Bind your funding interface button click event
  const fundBtn = document.getElementById("fund-wallet-btn");
  const amountField = document.getElementById("funding-amount-input");

  if (fundBtn && amountField) {
    fundBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      // Extract the raw value string and strip any formatting symbols
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
  // Convert input value directly to a float number to prevent payload structure errors
  const parsedAmount = parseFloat(amountInput);

  if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
    alert("Please enter a valid amount to fund your wallet.");
    return;
  }

  try {
    // Check if loading UI utility helper function exists before executing
    if (window.showLoadingSpinner) window.showLoadingSpinner(true); 
    
    // 1. Call Backend to kick off Paystack session
    const result = await window.API.transactions.initializeDeposit(parsedAmount);
    
    if (result.success && result.authorization_url) {
      // Save the transaction reference temporarily to verify later if needed
      localStorage.setItem("pending_funding_reference", result.reference);
      
      // 2. Redirect user seamlessly to Paystack Secure Portal
      window.location.href = result.authorization_url;
    } else {
      alert("Payment initialization error: " + result.message);
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
    try {
      // Clear query params immediately so the user doesn't trigger multiple refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
      
      alert("Verifying payment with Paystack... Please hold on.");
      
      // Call backend handler to confirm payment settlement and credit wallet
      const verification = await window.API.transactions.verifyDeposit(reference);
      
      if (verification.success) {
        alert(`Success! ${verification.message}`);
        
        // Trigger fresh UI updates to reflect the funded amount instantly
        if (typeof window.loadUserProfileData === "function") {
          window.loadUserProfileData(); 
        } else {
          // Fallback refresh to update user wallet display text seamlessly
          window.location.reload();
        }
      } else {
        alert("Payment Verification Failed: " + verification.message);
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
