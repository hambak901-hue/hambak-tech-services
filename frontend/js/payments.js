/**
 * ==========================================================================
 * HAMBAK TECH & SERVICES - PAYMENT CORE ENGINE (PHASE 1)
 * ==========================================================================
 */

const CLOUD_API_ROOT = "https://hambak-tech-services.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  // Extract user authorization parameters securely
  const systemToken = localStorage.getItem("hambak_token") || localStorage.getItem("token");
  
  if (!systemToken) {
    alert("Session verification token missing. Routing to Login screen area.");
    window.location.href = "login.html";
    return;
  }

  // Fire analytical metrics loaders
  loadActiveOrdersIntoDropdown(systemToken);
  fetchPaymentLedgerStatements(systemToken);
  initializeFormSubmission(systemToken);
});

/**
 * Copies the official banking account number cleanly to the clipboard
 */
function copyValueToClipboard() {
  const accountString = document.getElementById("accountNum").innerText;
  navigator.clipboard.writeText(accountString).then(() => {
    alert("Account number copied securely to clipboard: " + accountString);
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
  });
}

/**
 * Monitors file size footprints to protect cloud storage bandwidth thresholds
 * @param {HTMLInputElement} inputNode 
 */
function monitorReceiptFootprint(inputNode) {
  const labelText = document.getElementById("receiptNameTracker");
  const targetFile = inputNode.files[0];

  if (!targetFile) {
    labelText.innerText = "No file selected";
    labelText.style.color = "#64748b";
    return;
  }

  const calculatedSizeKb = targetFile.size / 1024;
  labelText.innerText = `${targetFile.name} (${calculatedSizeKb.toFixed(1)} KB)`;

  // Flag warnings if image exceeds strict 15KB profile layouts
  if (calculatedSizeKb > 15) {
    labelText.innerText += " - Note: File exceeds standard 15KB recommendations.";
    labelText.style.color = "#f5b942";
  } else {
    labelText.style.color = "#10b981";
  }
}

/**
 * Populates dropdown matrices with pending customer order records
 * @param {string} token 
 */
async function loadActiveOrdersIntoDropdown(token) {
  const dropdownSelect = document.getElementById("orderSelectionDropdown");
  
  try {
    const response = await fetch(`${CLOUD_API_ROOT}/orders/myorders`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const payloadData = await response.json();
    const usersOrders = payloadData.orders || [];

    if (usersOrders.length === 0) {
      dropdownSelect.innerHTML = '<option value="">No pending orders found</option>';
      return;
    }

    dropdownSelect.innerHTML = '<option value="">-- Choose Order Target --</option>';
    usersOrders.forEach(order => {
      const serviceLabelName = order.service ? order.service.name : "Custom Task Asset";
      dropdownSelect.innerHTML += `
        <option value="${order._id}">₦${Number(order.amount).toLocaleString()} - ${serviceLabelName} (${order._id.substring(order._id.length - 6)})</option>
      `;
    });
  } catch (err) {
    console.error("Dropdown injection failure:", err);
    dropdownSelect.innerHTML = '<option value="">Error fetching orders stream</option>';
  }
}

/**
 * Pulls historical accounting ledgers down to update verification view blocks
 * @param {string} token 
 */
async function fetchPaymentLedgerStatements(token) {
  const ledgerTarget = document.getElementById("paymentHistoryTarget");
  
  try {
    const response = await fetch(`${CLOUD_API_ROOT}/orders/myorders`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const fullPayload = await response.json();
    const relevantOrders = fullPayload.orders || [];

    if (relevantOrders.length === 0) {
      ledgerTarget.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #64748b; padding: 30px 0;">No past statements or invoices found.</td>
        </tr>
      `;
      return;
    }

    ledgerTarget.innerHTML = "";
    relevantOrders.forEach(item => {
      const dateString = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-NG') : "Recent";
      const isSettled = item.status === "completed" || item.status === "processing";
      const statusText = isSettled ? "Verified Settlement" : "Awaiting Verification";
      const statusClass = isSettled ? "status-verified" : "status-awaiting";

      ledgerTarget.innerHTML += `
        <tr>
          <td style="font-family: monospace; color: var(--brand-gold); font-weight: bold;">#${item._id.substring(item._id.length - 8)}</td>
          <td>${dateString}</td>
          <td style="font-weight: 700; color: #10b981;">₦${Number(item.amount).toLocaleString()}</td>
          <td><span class="status-pill ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Ledger mapping error handles:", error);
    ledgerTarget.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px 0;">Failed to establish communication line with cloud data stack.</td>
      </tr>
    `;
  }
}

/**
 * Initializes form listeners to stream multi-part metadata out securely
 * @param {string} token 
 */
function initializeFormSubmission(token) {
  const submitForm = document.getElementById("receiptSubmissionForm");
  if (!submitForm) return;

  submitForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const actionBtn = document.getElementById("uploadActionBtn");
    
    actionBtn.disabled = true;
    actionBtn.innerText = "Transmitting Receipt File...";

    const transactionFormData = new FormData();
    const fileField = document.getElementById("receiptFileField");

    transactionFormData.append("orderId", document.getElementById("orderSelectionDropdown").value);
    transactionFormData.append("amountPaid", document.getElementById("paymentAmount").value);
    
    if (fileField.files.length > 0) {
      transactionFormData.append("file", fileField.files[0]);
    }

    try {
      const submitResponse = await fetch(`${CLOUD_API_ROOT}/orders/pay`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: transactionFormData
      });

      const feedbackResult = await submitResponse.json();

      if (submitResponse.ok || feedbackResult.success) {
        alert("Proof of payment successfully submitted! Administrators will verify the ledger shortly.");
        location.reload();
      } else {
        alert("Submission dropped: " + (feedbackResult.message || "Invalid criteria mapping details."));
        actionBtn.disabled = false;
        actionBtn.innerText = "Submit Proof of Payment";
      }
    } catch (submitErr) {
      console.error("Receipt upload network exception:", submitErr);
      alert("Network execution error. Could not reach validation backend nodes.");
      actionBtn.disabled = false;
      actionBtn.innerText = "Submit Proof of Payment";
    }
  });
}
