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
