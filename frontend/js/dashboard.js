async function handleWalletFunding(amountInput) {
  if (!amountInput || amountInput <= 0) {
    alert("Please enter a valid amount to fund your wallet.");
    return;
  }

  try {
    showLoadingSpinner(true); // Visual indicator 
    
    // 1. Call Backend to kick off Paystack session
    const result = await window.API.transactions.initializeDeposit(amountInput);
    
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
    showLoadingSpinner(false);
  }
}


// Automatically check URL params for active Paystack payment redirections
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
        // Trigger a fresh UI refresh to show the updated balance instantly
        if (window.loadUserProfileData) window.loadUserProfileData(); 
      } else {
        alert("Payment Verification Failed: " + verification.message);
      }
    } catch (error) {
      console.error("Callback Verification Error:", error);
      alert("An error occurred while confirming your wallet funding status.");
    }
  }
}

// Run right away on dashboard initialization
checkPaymentCallback();
